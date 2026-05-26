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

function diversifyBucket(uids, questionMap) {
    if (uids.length <= 1) return uids;

    // 1. Group questions by Subject
    const subjectGroups = new Map();
    uids.forEach((uid) => {
        const question = questionMap.get(uid);
        const subject = question?.subjectSlug || 'unknown';
        if (!subjectGroups.has(subject)) {
            subjectGroups.set(subject, []);
        }
        subjectGroups.get(subject).push(uid);
    });

    // 2. Within each subject, group by Subtopic and interleave
    const randomizedSubjects = new Map();
    subjectGroups.forEach((subjectUids, subject) => {
        const subtopicGroups = new Map();
        subjectUids.forEach((uid) => {
            const question = questionMap.get(uid);
            const subtopic = question?.subtopics?.[0]?.slug || 'general';
            if (!subtopicGroups.has(subtopic)) {
                subtopicGroups.set(subtopic, []);
            }
            subtopicGroups.get(subtopic).push(uid);
        });

        // Shuffle each subtopic group internally
        const activeSubgroups = [];
        subtopicGroups.forEach((groupUids) => {
            activeSubgroups.push(fisherYatesShuffle([...groupUids]));
        });

        // Shuffle the subgroups themselves to randomize starting subtopics
        fisherYatesShuffle(activeSubgroups);

        // Interleave the subtopics for this subject
        const interleavedSubjectUids = [];
        let remainingSubgroups = activeSubgroups.filter((g) => g.length > 0);
        while (remainingSubgroups.length > 0) {
            for (let i = 0; i < remainingSubgroups.length; i += 1) {
                interleavedSubjectUids.push(remainingSubgroups[i].shift());
            }
            remainingSubgroups = remainingSubgroups.filter((g) => g.length > 0);
        }
        randomizedSubjects.set(subject, interleavedSubjectUids);
    });

    // 3. Interleave the Subjects themselves
    const result = [];
    let activeSubjectQueues = Array.from(randomizedSubjects.values());
    fisherYatesShuffle(activeSubjectQueues); // Randomize starting subject

    let remainingSubjectQueues = activeSubjectQueues.filter((q) => q.length > 0);
    while (remainingSubjectQueues.length > 0) {
        for (let i = 0; i < remainingSubjectQueues.length; i += 1) {
            result.push(remainingSubjectQueues[i].shift());
        }
        remainingSubjectQueues = remainingSubjectQueues.filter((q) => q.length > 0);
    }

    // 4. Lookahead swap to avoid consecutive identical subjects/subtopics where possible
    for (let i = 0; i < result.length - 1; i += 1) {
        const currentQ = questionMap.get(result[i]);
        const nextQ = questionMap.get(result[i + 1]);
        
        if (!currentQ || !nextQ) continue;

        const isSameSubject = currentQ.subjectSlug === nextQ.subjectSlug;
        const currentSubtopic = currentQ.subtopics?.[0]?.slug || 'general';
        const nextSubtopic = nextQ.subtopics?.[0]?.slug || 'general';
        const isSameSubtopic = currentSubtopic === nextSubtopic;

        if (isSameSubject) {
            let swapped = false;
            
            // Priority 1: Find a completely different subject to swap in
            for (let j = i + 2; j < result.length; j += 1) {
                const swapQ = questionMap.get(result[j]);
                if (swapQ && swapQ.subjectSlug !== currentQ.subjectSlug) {
                    [result[i + 1], result[j]] = [result[j], result[i + 1]];
                    swapped = true;
                    break;
                }
            }

            // Priority 2: If we must show the same subject, ensure it's a different subtopic
            if (!swapped && isSameSubtopic) {
                for (let j = i + 2; j < result.length; j += 1) {
                    const swapQ = questionMap.get(result[j]);
                    const swapSubtopic = swapQ?.subtopics?.[0]?.slug || 'general';
                    if (swapQ && swapSubtopic !== currentSubtopic) {
                        [result[i + 1], result[j]] = [result[j], result[i + 1]];
                        break;
                    }
                }
            }
        }
    }

    return result;
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

    const questionMap = new Map();
    for (const question of questionPool) {
        const uid = String(question?.question_uid || '').trim();
        if (!uid) continue;
        questionMap.set(uid, question);

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

    const diversifiedBucket1 = diversifyBucket(bucket1, questionMap);
    const diversifiedBucket2 = diversifyBucket(bucket2, questionMap);
    const diversifiedBucket3 = diversifyBucket(bucket3, questionMap);

    return [...diversifiedBucket1, ...diversifiedBucket2, ...diversifiedBucket3];
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
    const { allQuestions, solvedQuestionIds, activeSolvedQuestionIds } = useFilterState();
    const solvedIds = activeSolvedQuestionIds || solvedQuestionIds;
    const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
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
