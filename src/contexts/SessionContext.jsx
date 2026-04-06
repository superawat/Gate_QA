import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useFilterState } from './FilterContext';
import { AnswerService } from '../services/AnswerService';

const SessionContext = createContext();

function fisherYatesShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getTrackingId(question) {
    if (!question || typeof question !== 'object') return null;
    const candidate = AnswerService.getStorageKeyForQuestion(question);
    if (!candidate) return null;
    const normalized = String(candidate).trim();
    return normalized || null;
}

function buildSessionQueue(questionPool, seenThisSession, solvedSet) {
    const bucket1 = [];
    const bucket2 = [];
    const bucket3 = [];

    for (const question of questionPool) {
        const uid = String(question?.question_uid || '').trim();
        if (!uid) continue;

        const trackingId = getTrackingId(question);
        const isSeen = seenThisSession.has(uid);
        const isSolved = trackingId ? solvedSet.has(trackingId) : false;

        if (isSeen) {
            bucket3.push(uid);
        } else if (isSolved) {
            bucket2.push(uid);
        } else {
            bucket1.push(uid);
        }
    }

    fisherYatesShuffle(bucket1);
    fisherYatesShuffle(bucket2);
    fisherYatesShuffle(bucket3);

    return [...bucket1, ...bucket2, ...bucket3];
}

function uniqueQuestionList(questionPool = []) {
    const seen = new Set();
    const ordered = [];

    (Array.isArray(questionPool) ? questionPool : []).forEach((question) => {
        const uid = String(question?.question_uid || '').trim();
        if (!uid || seen.has(uid)) {
            return;
        }
        seen.add(uid);
        ordered.push(question);
    });

    return ordered;
}

function findIndexForUid(queue = [], uid = '') {
    if (!uid) {
        return -1;
    }
    return queue.indexOf(String(uid).trim());
}

export const useSession = () => {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used within a SessionProvider');
    return ctx;
};

export const SessionProvider = ({ children }) => {
    const { allQuestions, solvedQuestionIds } = useFilterState();
    const solvedSet = useMemo(() => new Set(solvedQuestionIds), [solvedQuestionIds]);
    const solvedSetRef = useRef(solvedSet);
    solvedSetRef.current = solvedSet;
    const activeQuestionMapRef = useRef(new Map());

    const questionMap = useMemo(() => {
        const map = new Map();
        allQuestions.forEach((question) => {
            const uid = String(question?.question_uid || '').trim();
            if (uid) {
                map.set(uid, question);
            }
        });
        return map;
    }, [allQuestions]);

    const [sessionMode, setSessionMode] = useState(null);
    const [sessionQueue, setSessionQueue] = useState([]);
    const [sourceQuestionUids, setSourceQuestionUids] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showExhaustionBanner, setShowExhaustionBanner] = useState(false);
    const seenThisSession = useRef(new Set());

    const resolveQuestionPool = useCallback((questionPool = []) => {
        const normalizedQuestions = uniqueQuestionList(questionPool);
        return normalizedQuestions
            .map((question) => questionMap.get(question.question_uid) || question)
            .filter(Boolean);
    }, [questionMap]);

    const getQuestionByUid = useCallback((uid = '') => {
        const normalizedUid = String(uid || '').trim();
        if (!normalizedUid) {
            return null;
        }
        return questionMap.get(normalizedUid) || activeQuestionMapRef.current.get(normalizedUid) || null;
    }, [questionMap]);

    const startRandomSession = useCallback((questionPool = []) => {
        const normalizedQuestions = resolveQuestionPool(questionPool);
        if (normalizedQuestions.length === 0) {
            setSessionMode('random');
            setSessionQueue([]);
            setSourceQuestionUids([]);
            setCurrentIndex(0);
            setShowExhaustionBanner(false);
            seenThisSession.current.clear();
            return null;
        }

        activeQuestionMapRef.current = new Map(
            normalizedQuestions.map((question) => [question.question_uid, question])
        );
        seenThisSession.current.clear();
        const nextQueue = buildSessionQueue(normalizedQuestions, seenThisSession.current, solvedSetRef.current);
        const firstUid = nextQueue[0] || '';
        if (firstUid) {
            seenThisSession.current.add(firstUid);
        }

        setSessionMode('random');
        setSessionQueue(nextQueue);
        setSourceQuestionUids(normalizedQuestions.map((question) => question.question_uid));
        setCurrentIndex(0);
        setShowExhaustionBanner(false);

        return firstUid ? getQuestionByUid(firstUid) : null;
    }, [getQuestionByUid, resolveQuestionPool]);

    const startOrderedSession = useCallback((questionPool = [], initialUid = '') => {
        const normalizedQuestions = resolveQuestionPool(questionPool);
        const orderedUids = normalizedQuestions.map((question) => question.question_uid);
        activeQuestionMapRef.current = new Map(
            normalizedQuestions.map((question) => [question.question_uid, question])
        );
        const requestedUid = String(initialUid || '').trim();
        const resolvedIndex = requestedUid ? findIndexForUid(orderedUids, requestedUid) : 0;
        const nextIndex = Math.max(0, resolvedIndex);
        const firstUid = orderedUids[nextIndex] || '';

        setSessionMode('ordered');
        setSessionQueue(orderedUids);
        setSourceQuestionUids(orderedUids);
        setCurrentIndex(nextIndex);
        setShowExhaustionBanner(false);

        return firstUid ? getQuestionByUid(firstUid) : null;
    }, [getQuestionByUid, resolveQuestionPool]);

    const setCurrentQuestionUid = useCallback((uid = '') => {
        const normalizedUid = String(uid || '').trim();
        if (!normalizedUid || sessionQueue.length === 0) {
            return;
        }

        const nextIndex = findIndexForUid(sessionQueue, normalizedUid);
        if (nextIndex === -1) {
            return;
        }

        setCurrentIndex(nextIndex);
        if (sessionMode === 'random') {
            seenThisSession.current.add(normalizedUid);
        }
    }, [sessionMode, sessionQueue]);

    const getCurrentQuestion = useCallback(() => {
        const currentUid = sessionQueue[currentIndex] || '';
        return currentUid ? getQuestionByUid(currentUid) : null;
    }, [currentIndex, getQuestionByUid, sessionQueue]);

    const getNavigationState = useCallback((uid = '') => {
        const normalizedUid = String(uid || '').trim();
        const resolvedIndex = findIndexForUid(sessionQueue, normalizedUid);
        const index = resolvedIndex >= 0 ? resolvedIndex : currentIndex;
        const previousUid = index > 0 ? sessionQueue[index - 1] : null;
        const nextUid = index < sessionQueue.length - 1 ? sessionQueue[index + 1] : null;

        return {
            mode: sessionMode,
            index,
            total: sessionQueue.length,
            previousUid,
            nextUid,
            canGoPrevious: !!previousUid,
            canGoNext: !!nextUid || (sessionMode === 'random' && sourceQuestionUids.length > 0),
        };
    }, [currentIndex, sessionMode, sessionQueue, sourceQuestionUids.length]);

    const rebuildRandomQueue = useCallback(() => {
        const sourcePool = sourceQuestionUids
            .map((uid) => getQuestionByUid(uid))
            .filter(Boolean);

        if (sourcePool.length === 0) {
            setSessionQueue([]);
            setCurrentIndex(0);
            return null;
        }

        const nextQueue = buildSessionQueue(sourcePool, seenThisSession.current, solvedSetRef.current);
        const firstUid = nextQueue[0] || '';
        if (firstUid) {
            seenThisSession.current.add(firstUid);
        }

        setSessionQueue(nextQueue);
        setCurrentIndex(0);
        setShowExhaustionBanner(true);
        return firstUid ? getQuestionByUid(firstUid) : null;
    }, [getQuestionByUid, sourceQuestionUids]);

    const goToPreviousQuestion = useCallback((uid = '') => {
        const navigation = getNavigationState(uid);
        const { previousUid } = navigation;
        if (!previousUid) {
            return null;
        }

        setCurrentIndex(Math.max(0, navigation.index - 1));
        return getQuestionByUid(previousUid);
    }, [getNavigationState, getQuestionByUid]);

    const goToNextQuestion = useCallback((uid = '') => {
        const navigation = getNavigationState(uid);
        if (navigation.nextUid) {
            const nextIndex = navigation.index + 1;
            const nextUid = navigation.nextUid;
            setCurrentIndex(nextIndex);
            if (sessionMode === 'random') {
                seenThisSession.current.add(nextUid);
            }
            return getQuestionByUid(nextUid);
        }

        if (sessionMode === 'random') {
            return rebuildRandomQueue();
        }

        return null;
    }, [getNavigationState, getQuestionByUid, rebuildRandomQueue, sessionMode]);

    const advanceQueue = useCallback(() => {
        const currentUid = sessionQueue[currentIndex] || '';
        return goToNextQuestion(currentUid);
    }, [currentIndex, goToNextQuestion, sessionQueue]);

    const goBack = useCallback(() => {
        const currentUid = sessionQueue[currentIndex] || '';
        return goToPreviousQuestion(currentUid);
    }, [currentIndex, goToPreviousQuestion, sessionQueue]);

    const markSeen = useCallback((uid) => {
        const normalizedUid = String(uid || '').trim();
        if (normalizedUid) {
            seenThisSession.current.add(normalizedUid);
        }
    }, []);

    const markDeepLinkedQuestion = useCallback((uid) => {
        const normalizedUid = String(uid || '').trim();
        if (normalizedUid) {
            seenThisSession.current.add(normalizedUid);
        }
    }, []);

    const value = useMemo(() => ({
        sessionMode,
        sessionQueue,
        sourceQuestionUids,
        currentIndex,
        showExhaustionBanner,
        getCurrentQuestion,
        getNavigationState,
        startRandomSession,
        startOrderedSession,
        setCurrentQuestionUid,
        goToPreviousQuestion,
        goToNextQuestion,
        advanceQueue,
        goBack,
        canGoBack: currentIndex > 0,
        markSeen,
        markDeepLinkedQuestion,
        dismissExhaustionBanner: () => setShowExhaustionBanner(false),
    }), [
        advanceQueue,
        currentIndex,
        getCurrentQuestion,
        getNavigationState,
        goBack,
        goToNextQuestion,
        goToPreviousQuestion,
        markDeepLinkedQuestion,
        markSeen,
        sessionMode,
        sessionQueue,
        showExhaustionBanner,
        sourceQuestionUids,
        startOrderedSession,
        startRandomSession,
        setCurrentQuestionUid,
    ]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};
