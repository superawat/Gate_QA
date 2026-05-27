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

function getQuestionSubjectKey(question = {}) {
    return String(
        question?.subjectSlug
        || question?.canonical?.subjectSlug
        || question?.subjectLabel
        || question?.subject
        || 'unknown'
    ).trim().toLowerCase() || 'unknown';
}

function getQuestionSubtopicKey(question = {}) {
    const firstSubtopic = Array.isArray(question?.subtopics) ? question.subtopics[0] : null;
    return String(
        firstSubtopic?.slug
        || firstSubtopic?.label
        || question?.subtopicSlug
        || question?.subtopic
        || 'general'
    ).trim().toLowerCase() || 'general';
}

function getQuestionTopicKey(question = {}) {
    return `${getQuestionSubjectKey(question)}::${getQuestionSubtopicKey(question)}`;
}

function countSubjectRemaining(subjectBucket) {
    return subjectBucket.subtopics.reduce((total, subtopicBucket) => total + subtopicBucket.queue.length, 0);
}

function pickBalancedSubject(subjectBuckets, lastSubjectKey) {
    const activeBuckets = subjectBuckets.filter((bucket) => countSubjectRemaining(bucket) > 0);
    if (activeBuckets.length === 0) {
        return null;
    }

    const hasSubjectAlternative = activeBuckets.some((bucket) => bucket.subjectKey !== lastSubjectKey);
    const candidates = hasSubjectAlternative
        ? activeBuckets.filter((bucket) => bucket.subjectKey !== lastSubjectKey)
        : activeBuckets;

    return fisherYatesShuffle([...candidates])
        .sort((left, right) => countSubjectRemaining(right) - countSubjectRemaining(left))[0];
}

function pickBalancedSubtopic(subjectBucket, recentTopicKeys) {
    const activeSubtopics = subjectBucket.subtopics.filter((bucket) => bucket.queue.length > 0);
    if (activeSubtopics.length === 0) {
        return null;
    }

    const recentTopics = new Set(recentTopicKeys);
    const lastTopicKey = recentTopicKeys[0] || '';
    const hasFreshTopic = activeSubtopics.some((bucket) => !recentTopics.has(bucket.topicKey));
    const hasNonConsecutiveTopic = activeSubtopics.some((bucket) => bucket.topicKey !== lastTopicKey);
    let candidates = activeSubtopics;

    if (hasFreshTopic) {
        candidates = activeSubtopics.filter((bucket) => !recentTopics.has(bucket.topicKey));
    } else if (hasNonConsecutiveTopic) {
        candidates = activeSubtopics.filter((bucket) => bucket.topicKey !== lastTopicKey);
    }

    return fisherYatesShuffle([...candidates])
        .sort((left, right) => right.queue.length - left.queue.length)[0];
}

function diversifyBucket(uids, questionMap) {
    if (uids.length <= 1) return uids;

    const subjectGroups = new Map();
    uids.forEach((uid) => {
        const question = questionMap.get(uid);
        const subjectKey = getQuestionSubjectKey(question);
        const topicKey = getQuestionTopicKey(question);

        if (!subjectGroups.has(subjectKey)) {
            subjectGroups.set(subjectKey, new Map());
        }

        const subtopicGroups = subjectGroups.get(subjectKey);
        if (!subtopicGroups.has(topicKey)) {
            subtopicGroups.set(topicKey, []);
        }
        subtopicGroups.get(topicKey).push(uid);
    });

    const subjectBuckets = fisherYatesShuffle(Array.from(subjectGroups.entries()).map(([subjectKey, subtopicMap]) => ({
        subjectKey,
        subtopics: fisherYatesShuffle(Array.from(subtopicMap.entries()).map(([topicKey, queue]) => ({
            topicKey,
            queue: fisherYatesShuffle([...queue]),
        }))),
    })));

    const result = [];
    const recentTopicKeys = [];
    let lastSubjectKey = '';

    while (result.length < uids.length) {
        const subjectBucket = pickBalancedSubject(subjectBuckets, lastSubjectKey);
        if (!subjectBucket) {
            break;
        }

        const subtopicBucket = pickBalancedSubtopic(subjectBucket, recentTopicKeys);
        if (!subtopicBucket) {
            break;
        }

        const nextUid = subtopicBucket.queue.shift();
        result.push(nextUid);
        lastSubjectKey = subjectBucket.subjectKey;
        recentTopicKeys.unshift(subtopicBucket.topicKey);
        recentTopicKeys.splice(3);
    }

    return result;
}

function appendDiversifiedBucket(queue, bucketQueue, questionMap) {
    if (queue.length === 0 || bucketQueue.length <= 1) {
        return [...queue, ...bucketQueue];
    }

    const lastQuestion = questionMap.get(queue[queue.length - 1]);
    const lastTopicKey = getQuestionTopicKey(lastQuestion);
    const firstTopicKey = getQuestionTopicKey(questionMap.get(bucketQueue[0]));
    if (lastTopicKey !== firstTopicKey) {
        return [...queue, ...bucketQueue];
    }

    const swapIndex = bucketQueue.findIndex((uid) => (
        getQuestionTopicKey(questionMap.get(uid)) !== lastTopicKey
    ));

    if (swapIndex > 0) {
        const adjustedBucket = [...bucketQueue];
        [adjustedBucket[0], adjustedBucket[swapIndex]] = [adjustedBucket[swapIndex], adjustedBucket[0]];
        return [...queue, ...adjustedBucket];
    }

    return [...queue, ...bucketQueue];
}

function prioritizeInitialUid(queue, initialUid, questionMap) {
    const requestedUid = String(initialUid || '').trim();
    if (!requestedUid) {
        return queue;
    }

    const requestedIndex = queue.indexOf(requestedUid);
    if (requestedIndex === -1) {
        return queue;
    }

    const remainingQueue = queue.filter((uid) => uid !== requestedUid);
    const prioritizedQueue = [requestedUid, ...remainingQueue];
    const requestedTopicKey = getQuestionTopicKey(questionMap.get(requestedUid));

    const swapIndex = prioritizedQueue.findIndex((uid, index) => (
        index > 0 && getQuestionTopicKey(questionMap.get(uid)) !== requestedTopicKey
    ));

    if (swapIndex > 1) {
        [prioritizedQueue[1], prioritizedQueue[swapIndex]] = [prioritizedQueue[swapIndex], prioritizedQueue[1]];
    }

    return prioritizedQueue;
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

    return [diversifiedBucket1, diversifiedBucket2, diversifiedBucket3]
        .reduce((queue, bucketQueue) => appendDiversifiedBucket(queue, bucketQueue, questionMap), []);
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

    const startRandomSession = useCallback((questionPool = [], initialUid = '') => {
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
        const activeQuestionMap = activeQuestionMapRef.current;
        const nextQueue = prioritizeInitialUid(
            buildSessionQueue(normalizedQuestions, seenThisSession.current, solvedSetRef.current),
            initialUid,
            activeQuestionMap
        );
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
