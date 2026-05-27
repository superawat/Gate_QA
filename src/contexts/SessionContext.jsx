import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useFilterState } from './FilterContext';
import { AnswerService } from '../services/AnswerService';
import { QuestionService } from '../services/QuestionService';
import { AptitudeQuestionService } from '../services/AptitudeQuestionService';

const SessionContext = createContext();
const RANDOM_TOPIC_MEMORY_KEY = 'gateqa_random_recent_topics_v1';
const RANDOM_TOPIC_MEMORY_LIMIT = 6;
const PREFETCH_LOOKAHEAD_COUNT = 3;
const APTITUDE_UID_PREFIX = 'APT-';

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

function getActiveTopicCount(strata = []) {
    return strata.reduce((count, stratum) => count + (stratum.queue.length > 0 ? 1 : 0), 0);
}

function buildStrata(uids, questionMap) {
    const groups = new Map();

    uids.forEach((uid) => {
        const question = questionMap.get(uid);
        const subjectKey = getQuestionSubjectKey(question);
        const topicKey = getQuestionTopicKey(question);

        if (!groups.has(topicKey)) {
            groups.set(topicKey, {
                subjectKey,
                topicKey,
                queue: [],
                drawn: 0,
                randomRank: Math.random(),
            });
        }

        groups.get(topicKey).queue.push(uid);
    });

    return Array.from(groups.values()).map((stratum) => {
        const queue = fisherYatesShuffle([...stratum.queue]);
        return {
            ...stratum,
            queue,
            originalSize: queue.length,
        };
    });
}

function compareStrataByFairness(left, right) {
    const leftServedRatio = left.drawn / Math.max(1, left.originalSize);
    const rightServedRatio = right.drawn / Math.max(1, right.originalSize);

    if (leftServedRatio !== rightServedRatio) {
        return leftServedRatio - rightServedRatio;
    }

    if (left.queue.length !== right.queue.length) {
        return right.queue.length - left.queue.length;
    }

    return left.randomRank - right.randomRank;
}

function selectNextStratum(strata, recentTopicKeys, lastSubjectKey) {
    const activeStrata = strata.filter((stratum) => stratum.queue.length > 0);
    if (activeStrata.length === 0) {
        return null;
    }

    const activeSubjectCount = new Set(activeStrata.map((stratum) => stratum.subjectKey)).size;
    const activeTopicCount = getActiveTopicCount(activeStrata);
    const topicCooldownSize = Math.min(2, Math.max(0, activeTopicCount - 1));
    const topicCooldownSet = new Set(recentTopicKeys.slice(0, topicCooldownSize));

    const withSubjectDiversity = activeSubjectCount > 1
        ? activeStrata.filter((stratum) => stratum.subjectKey !== lastSubjectKey)
        : activeStrata;

    const withTopicCooldown = withSubjectDiversity.filter((stratum) => !topicCooldownSet.has(stratum.topicKey));
    const withImmediateTopicBreak = withSubjectDiversity.filter((stratum) => stratum.topicKey !== recentTopicKeys[0]);
    const candidates = withTopicCooldown.length > 0
        ? withTopicCooldown
        : withImmediateTopicBreak.length > 0
            ? withImmediateTopicBreak
            : withSubjectDiversity;

    return [...candidates].sort(compareStrataByFairness)[0];
}

function buildStratifiedShuffleBag(uids, questionMap, seedState = {}) {
    if (uids.length <= 1) {
        const firstQuestion = questionMap.get(uids[0]);
        return {
            queue: uids,
            recentTopicKeys: uids[0] ? [getQuestionTopicKey(firstQuestion)] : seedState.recentTopicKeys || [],
            lastSubjectKey: uids[0] ? getQuestionSubjectKey(firstQuestion) : seedState.lastSubjectKey || '',
        };
    }

    const strata = buildStrata(uids, questionMap);
    const result = [];
    const recentTopicKeys = Array.isArray(seedState.recentTopicKeys)
        ? [...seedState.recentTopicKeys]
        : [];
    let lastSubjectKey = seedState.lastSubjectKey || '';

    while (result.length < uids.length) {
        const stratum = selectNextStratum(strata, recentTopicKeys, lastSubjectKey);
        if (!stratum) {
            break;
        }

        const nextUid = stratum.queue.shift();
        stratum.drawn += 1;

        result.push(nextUid);
        lastSubjectKey = stratum.subjectKey;
        recentTopicKeys.unshift(stratum.topicKey);
        recentTopicKeys.splice(3);
    }

    return {
        queue: result,
        recentTopicKeys,
        lastSubjectKey,
    };
}

function diversifyBucket(uids, questionMap, seedState = {}) {
    return buildStratifiedShuffleBag(uids, questionMap, seedState);
}

function normalizeTopicMemory(memory = {}) {
    const recentTopicKeys = Array.isArray(memory?.recentTopicKeys)
        ? memory.recentTopicKeys
            .map((key) => String(key || '').trim())
            .filter(Boolean)
            .slice(0, RANDOM_TOPIC_MEMORY_LIMIT)
        : [];

    return {
        recentTopicKeys,
        lastSubjectKey: String(memory?.lastSubjectKey || '').trim(),
    };
}

function readRandomTopicMemory() {
    if (typeof window === 'undefined') {
        return normalizeTopicMemory();
    }

    try {
        return normalizeTopicMemory(JSON.parse(window.localStorage.getItem(RANDOM_TOPIC_MEMORY_KEY) || '{}'));
    } catch {
        return normalizeTopicMemory();
    }
}

function writeRandomTopicMemory(memory = {}) {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(RANDOM_TOPIC_MEMORY_KEY, JSON.stringify(normalizeTopicMemory(memory)));
    } catch {
        // Best-effort only. Random queue quality should never depend on storage.
    }
}

function rememberQuestionTopic(memory = {}, question = {}) {
    if (!question?.question_uid) {
        return normalizeTopicMemory(memory);
    }

    const topicKey = getQuestionTopicKey(question);
    const recentTopicKeys = [
        topicKey,
        ...normalizeTopicMemory(memory).recentTopicKeys.filter((key) => key !== topicKey),
    ].slice(0, RANDOM_TOPIC_MEMORY_LIMIT);

    return {
        recentTopicKeys,
        lastSubjectKey: getQuestionSubjectKey(question),
    };
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

    const swapIndex = prioritizedQueue.findIndex((uid, index) => {
        if (index === 0) {
            return false;
        }

        return getQuestionTopicKey(questionMap.get(uid)) !== requestedTopicKey;
    });

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

function buildSessionQueue(questionPool, seenThisSession, solvedSet, persistedTopicMemory = {}) {
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

    const queue = [];
    let seedState = normalizeTopicMemory(persistedTopicMemory);

    [bucket1, bucket2, bucket3].forEach((bucket) => {
        const diversifiedBucket = diversifyBucket(bucket, questionMap, seedState);
        queue.push(...diversifiedBucket.queue);
        seedState = {
            recentTopicKeys: diversifiedBucket.recentTopicKeys,
            lastSubjectKey: diversifiedBucket.lastSubjectKey,
        };
    });

    return queue;
}

function getDetailServiceForQuestion(question = {}) {
    const uid = String(question?.question_uid || '').trim();
    return uid.startsWith(APTITUDE_UID_PREFIX) ? AptitudeQuestionService : QuestionService;
}

function prefetchQuestionDetails(questions = []) {
    questions.forEach((question) => {
        if (!question?.question_uid) {
            return;
        }

        const detailService = getDetailServiceForQuestion(question);
        if (typeof detailService?.ensureQuestionDetail !== 'function') {
            return;
        }

        Promise.resolve(detailService.ensureQuestionDetail(question)).catch(() => {
            // Prefetch is opportunistic; the Solve page still owns user-visible retry state.
        });
    });
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
    const randomTopicMemoryRef = useRef(readRandomTopicMemory());

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

    const rememberRandomQuestion = useCallback((question) => {
        randomTopicMemoryRef.current = rememberQuestionTopic(randomTopicMemoryRef.current, question);
        writeRandomTopicMemory(randomTopicMemoryRef.current);
    }, []);

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
        randomTopicMemoryRef.current = readRandomTopicMemory();
        const nextQueue = prioritizeInitialUid(
            buildSessionQueue(
                normalizedQuestions,
                seenThisSession.current,
                solvedSetRef.current,
                randomTopicMemoryRef.current
            ),
            initialUid,
            activeQuestionMap
        );
        const firstUid = nextQueue[0] || '';
        if (firstUid) {
            seenThisSession.current.add(firstUid);
            rememberRandomQuestion(activeQuestionMap.get(firstUid));
        }

        setSessionMode('random');
        setSessionQueue(nextQueue);
        setSourceQuestionUids(normalizedQuestions.map((question) => question.question_uid));
        setCurrentIndex(0);
        setShowExhaustionBanner(false);

        return firstUid ? getQuestionByUid(firstUid) : null;
    }, [getQuestionByUid, rememberRandomQuestion, resolveQuestionPool]);

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
            rememberRandomQuestion(getQuestionByUid(normalizedUid));
        }
    }, [getQuestionByUid, rememberRandomQuestion, sessionMode, sessionQueue]);

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

        const nextQueue = buildSessionQueue(
            sourcePool,
            seenThisSession.current,
            solvedSetRef.current,
            randomTopicMemoryRef.current
        );
        const firstUid = nextQueue[0] || '';
        if (firstUid) {
            seenThisSession.current.add(firstUid);
            rememberRandomQuestion(getQuestionByUid(firstUid));
        }

        setSessionQueue(nextQueue);
        setCurrentIndex(0);
        setShowExhaustionBanner(true);
        return firstUid ? getQuestionByUid(firstUid) : null;
    }, [getQuestionByUid, rememberRandomQuestion, sourceQuestionUids]);

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
                rememberRandomQuestion(getQuestionByUid(nextUid));
            }
            return getQuestionByUid(nextUid);
        }

        if (sessionMode === 'random') {
            return rebuildRandomQueue();
        }

        return null;
    }, [getNavigationState, getQuestionByUid, rebuildRandomQueue, rememberRandomQuestion, sessionMode]);

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
            if (sessionMode === 'random') {
                rememberRandomQuestion(getQuestionByUid(normalizedUid));
            }
        }
    }, [getQuestionByUid, rememberRandomQuestion, sessionMode]);

    const markDeepLinkedQuestion = useCallback((uid) => {
        const normalizedUid = String(uid || '').trim();
        if (normalizedUid) {
            seenThisSession.current.add(normalizedUid);
            if (sessionMode === 'random') {
                rememberRandomQuestion(getQuestionByUid(normalizedUid));
            }
        }
    }, [getQuestionByUid, rememberRandomQuestion, sessionMode]);

    useEffect(() => {
        if (sessionQueue.length === 0) {
            return;
        }

        const lookaheadQuestions = sessionQueue
            .slice(currentIndex + 1, currentIndex + 1 + PREFETCH_LOOKAHEAD_COUNT)
            .map((uid) => getQuestionByUid(uid))
            .filter(Boolean);

        if (lookaheadQuestions.length > 0) {
            prefetchQuestionDetails(lookaheadQuestions);
        }
    }, [currentIndex, getQuestionByUid, sessionQueue]);

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
