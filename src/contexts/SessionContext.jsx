import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFilterState } from './FilterContext';
import { AnswerService } from '../services/AnswerService';

const SessionContext = createContext();

/**
 * Fisher-Yates (Knuth) in-place shuffle.
 * Mutates the array and returns it.
 */
function fisherYatesShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Get the tracking ID used by the progress/solved system for a question.
 * Mirrors the logic in FilterContext's getQuestionTrackingId.
 */
function getTrackingId(question) {
    if (!question || typeof question !== 'object') return null;
    const candidate = AnswerService.getStorageKeyForQuestion(question);
    if (!candidate) return null;
    const normalized = String(candidate).trim();
    return normalized || null;
}

/**
 * Build a priority-weighted shuffled queue from filteredQuestions.
 *
 * Bucket 1 (front): UIDs not in seenThisSession AND not in solvedQuestionIds
 * Bucket 2 (middle): UIDs not in seenThisSession AND in solvedQuestionIds
 * Bucket 3 (back): UIDs in seenThisSession
 *
 * Each bucket is independently Fisher-Yates shuffled before concatenation.
 */
function buildSessionQueue(filteredQuestions, seenThisSession, solvedSet) {
    const bucket1 = []; // unseen + unsolved
    const bucket2 = []; // unseen + solved
    const bucket3 = []; // already seen

    for (const q of filteredQuestions) {
        const uid = q.question_uid;
        if (!uid) continue;

        const trackingId = getTrackingId(q);
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

export const useSession = () => {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used within a SessionProvider');
    return ctx;
};

export const SessionProvider = ({ children }) => {
    const { filteredQuestions, solvedQuestionIds } = useFilterState();

    // Memoize the solved set so we don't rebuild on every render
    const solvedSet = useMemo(() => new Set(solvedQuestionIds), [solvedQuestionIds]);

    // Ephemeral set — intentionally NOT persisted to localStorage
    const seenThisSession = useRef(new Set());

    const [sessionQueue, setSessionQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showExhaustionBanner, setShowExhaustionBanner] = useState(false);

    // Build a UID→question lookup for fast retrieval
    const questionMap = useMemo(() => {
        const map = new Map();
        for (const q of filteredQuestions) {
            if (q.question_uid) {
                map.set(q.question_uid, q);
            }
        }
        return map;
    }, [filteredQuestions]);

    // Rebuild queue whenever filteredQuestions changes (filter change)
    // We use a ref to track the previous filteredQuestions identity to avoid
    // unnecessary rebuilds.
    const prevFilteredRef = useRef(filteredQuestions);

    useEffect(() => {
        // Always rebuild when filteredQuestions reference changes
        // (useMemo in FilterContext guarantees referential stability when deps don't change)
        seenThisSession.current.clear();
        const queue = buildSessionQueue(filteredQuestions, seenThisSession.current, solvedSet);
        setSessionQueue(queue);
        setCurrentIndex(0);
        setShowExhaustionBanner(false);
        prevFilteredRef.current = filteredQuestions;
    }, [filteredQuestions, solvedSet]);

    /**
     * Mark a UID as seen this session.
     */
    const markSeen = useCallback((uid) => {
        if (uid) {
            seenThisSession.current.add(uid);
        }
    }, []);

    /**
     * Get the current question object from the queue.
     */
    const getCurrentQuestion = useCallback(() => {
        if (sessionQueue.length === 0) return null;
        const safeIndex = Math.min(currentIndex, sessionQueue.length - 1);
        const uid = sessionQueue[safeIndex];
        return questionMap.get(uid) || null;
    }, [sessionQueue, currentIndex, questionMap]);

    /**
     * Advance to the next question in the queue.
     * Returns the next question object (or null).
     *
     * On exhaustion: shows banner, reshuffles, and resets.
     */
    const advanceQueue = useCallback(() => {
        if (sessionQueue.length === 0) return null;

        const nextIndex = currentIndex + 1;

        if (nextIndex >= sessionQueue.length) {
            // Exhaustion — all questions seen
            setShowExhaustionBanner(true);

            // Reshuffle the full pool (seenThisSession is now full, so all go to bucket3,
            // but we rebuild to get a fresh random order)
            const newQueue = buildSessionQueue(
                filteredQuestions,
                seenThisSession.current,
                solvedSet
            );
            setSessionQueue(newQueue);
            setCurrentIndex(0);

            // Mark the first question in the new queue as seen
            if (newQueue.length > 0) {
                seenThisSession.current.add(newQueue[0]);
            }

            // Auto-dismiss the banner after a short delay
            setTimeout(() => {
                setShowExhaustionBanner(false);
            }, 4000);

            return newQueue.length > 0 ? questionMap.get(newQueue[0]) || null : null;
        }

        // Normal advancement
        setCurrentIndex(nextIndex);
        const nextUid = sessionQueue[nextIndex];
        seenThisSession.current.add(nextUid);
        return questionMap.get(nextUid) || null;
    }, [sessionQueue, currentIndex, filteredQuestions, solvedSet, questionMap]);

    /**
     * Handle deep-linked question: mark it as seen so it doesn't
     * reappear at the front of the queue.
     */
    const markDeepLinkedQuestion = useCallback((uid) => {
        if (uid) {
            seenThisSession.current.add(uid);
        }
    }, []);

    const value = useMemo(() => ({
        sessionQueue,
        currentIndex,
        showExhaustionBanner,
        getCurrentQuestion,
        advanceQueue,
        markSeen,
        markDeepLinkedQuestion,
        dismissExhaustionBanner: () => setShowExhaustionBanner(false),
    }), [
        sessionQueue,
        currentIndex,
        showExhaustionBanner,
        getCurrentQuestion,
        advanceQueue,
        markSeen,
        markDeepLinkedQuestion,
    ]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};
