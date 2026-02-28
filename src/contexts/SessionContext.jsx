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

    // Keep a ref to the latest solvedSet so the queue-rebuild effect can
    // read it without listing it as a dependency.  This prevents auto-solve
    // (FEAT-011) from triggering a full queue rebuild + navigation reset
    // (BUG-010).
    const solvedSetRef = useRef(solvedSet);
    useEffect(() => { solvedSetRef.current = solvedSet; }, [solvedSet]);

    // Ephemeral set — intentionally NOT persisted to localStorage
    const seenThisSession = useRef(new Set());

    const [sessionQueue, setSessionQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showExhaustionBanner, setShowExhaustionBanner] = useState(false);
    const exhaustionTimeoutRef = useRef(null);

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

    // Rebuild queue whenever the actual pool of question UIDs changes
    // (i.e. a real filter change).
    //
    // Why the UID-set comparison?
    // FilterContext's `filteredQuestions` useMemo depends on
    // `solvedQuestionSet`, so marking a question solved produces a NEW
    // array reference even when `hideSolved`/`showOnlySolved` are off and
    // the content is identical.  Without this guard the queue would
    // rebuild + reset currentIndex → unwanted auto-navigation (BUG-010).
    const prevFilteredUidsRef = useRef(new Set());

    useEffect(() => {
        // Build the new UID set
        const newUids = new Set();
        for (const q of filteredQuestions) {
            if (q.question_uid) newUids.add(q.question_uid);
        }

        // Compare with previous — skip rebuild if UIDs are identical
        const prev = prevFilteredUidsRef.current;
        if (
            newUids.size === prev.size &&
            newUids.size > 0 &&
            [...newUids].every(uid => prev.has(uid))
        ) {
            prevFilteredUidsRef.current = newUids;
            return;
        }

        prevFilteredUidsRef.current = newUids;
        seenThisSession.current.clear();
        const queue = buildSessionQueue(filteredQuestions, seenThisSession.current, solvedSetRef.current);
        setSessionQueue(queue);
        setCurrentIndex(0);
        setShowExhaustionBanner(false);
        if (exhaustionTimeoutRef.current) {
            clearTimeout(exhaustionTimeoutRef.current);
        }
    }, [filteredQuestions]);

    useEffect(() => {
        return () => {
            if (exhaustionTimeoutRef.current) {
                clearTimeout(exhaustionTimeoutRef.current);
            }
        };
    }, []);

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
                solvedSetRef.current
            );
            setSessionQueue(newQueue);
            setCurrentIndex(0);

            // Mark the first question in the new queue as seen
            if (newQueue.length > 0) {
                seenThisSession.current.add(newQueue[0]);
            }

            // Auto-dismiss the banner after a short delay
            if (exhaustionTimeoutRef.current) {
                clearTimeout(exhaustionTimeoutRef.current);
            }
            exhaustionTimeoutRef.current = setTimeout(() => {
                setShowExhaustionBanner(false);
            }, 4000);

            return newQueue.length > 0 ? questionMap.get(newQueue[0]) || null : null;
        }

        // Normal advancement
        setCurrentIndex(nextIndex);
        const nextUid = sessionQueue[nextIndex];
        seenThisSession.current.add(nextUid);
        return questionMap.get(nextUid) || null;
    }, [sessionQueue, currentIndex, filteredQuestions, questionMap]);

    /**
     * Handle deep-linked question: mark it as seen so it doesn't
     * reappear at the front of the queue.
     */
    const markDeepLinkedQuestion = useCallback((uid) => {
        if (uid) {
            seenThisSession.current.add(uid);
        }
    }, []);

    /**
     * Go back to the previously seen question in the session queue.
     */
    const goBack = useCallback(() => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    }, []);

    const canGoBack = currentIndex > 0;

    const value = useMemo(() => ({
        sessionQueue,
        currentIndex,
        showExhaustionBanner,
        getCurrentQuestion,
        advanceQueue,
        goBack,
        canGoBack,
        markSeen,
        markDeepLinkedQuestion,
        dismissExhaustionBanner: () => setShowExhaustionBanner(false),
    }), [
        sessionQueue,
        currentIndex,
        showExhaustionBanner,
        getCurrentQuestion,
        advanceQueue,
        goBack,
        canGoBack,
        markSeen,
        markDeepLinkedQuestion,
    ]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};
