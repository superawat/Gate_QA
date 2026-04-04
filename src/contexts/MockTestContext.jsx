import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFilterState } from "./FilterContext";

const MockTestContext = createContext();

const TOTAL_MOCK_TIME_SECONDS = 3 * 60 * 60;
const ATTEMPT_STORAGE_KEY = "gateqa_mock_attempt_v1";

const STATUS = {
    NOT_VISITED: "not_visited",
    NOT_ANSWERED: "not_answered",
    ANSWERED: "answered",
    MARKED_FOR_REVIEW: "review",
    ANSWERED_AND_MARKED_FOR_REVIEW: "review_answered",
};

const VALID_STATUSES = new Set(Object.values(STATUS));

const isGaQuestion = (question = {}) => {
    const title = String(question.title || "");
    return question.subject === "General Aptitude" || /\bGA\b/i.test(title);
};

const clampToRange = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
};

const parseInteger = (value, fallback = 0) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseStrictCount = (value) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return null;
    }
    return parsed;
};

const parsePositiveTimeSeconds = (value, fallback = TOTAL_MOCK_TIME_SECONDS) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
};

const normalizeUid = (value) => String(value || "").trim();

const uniqueUidList = (uids = []) => {
    const seen = new Set();
    const ordered = [];
    uids.forEach((rawUid) => {
        const uid = normalizeUid(rawUid);
        if (!uid || seen.has(uid)) {
            return;
        }
        seen.add(uid);
        ordered.push(uid);
    });
    return ordered;
};

const normalizeQuestionList = (questions = []) => {
    const seen = new Set();
    const ordered = [];
    (Array.isArray(questions) ? questions : []).forEach((question) => {
        const uid = normalizeUid(question?.question_uid);
        if (!uid || seen.has(uid)) {
            return;
        }
        seen.add(uid);
        ordered.push(question);
    });
    return ordered;
};

const normalizeSectionQuestions = (gaQuestions = [], csQuestions = []) => {
    const seen = new Set();

    const ga = normalizeQuestionList(gaQuestions).filter((question) => {
        const uid = normalizeUid(question?.question_uid);
        if (seen.has(uid)) {
            return false;
        }
        seen.add(uid);
        return true;
    });

    const cs = normalizeQuestionList(csQuestions).filter((question) => {
        const uid = normalizeUid(question?.question_uid);
        if (seen.has(uid)) {
            return false;
        }
        seen.add(uid);
        return true;
    });

    return { ga, cs };
};

const splitBySection = (questions = []) => {
    const ga = [];
    const cs = [];
    normalizeQuestionList(questions).forEach((question) => {
        if (isGaQuestion(question)) {
            ga.push(question);
        } else {
            cs.push(question);
        }
    });
    return { ga, cs };
};

const buildInitialQuestionStates = (orderedUids = [], activeUid = "") => {
    const states = {};
    orderedUids.forEach((uid) => {
        states[uid] = uid === activeUid ? STATUS.NOT_ANSWERED : STATUS.NOT_VISITED;
    });
    return states;
};

const sanitizeResponses = (rawResponses = {}, uidSet = new Set()) => {
    const next = {};
    if (!rawResponses || typeof rawResponses !== "object") {
        return next;
    }
    Object.entries(rawResponses).forEach(([uid, value]) => {
        if (uidSet.has(uid)) {
            next[uid] = value;
        }
    });
    return next;
};

const sanitizeQuestionStates = (rawStates = {}, orderedUids = [], activeUid = "") => {
    const fallback = buildInitialQuestionStates(orderedUids, activeUid);
    if (!rawStates || typeof rawStates !== "object") {
        return fallback;
    }

    orderedUids.forEach((uid) => {
        const candidate = rawStates[uid];
        fallback[uid] = VALID_STATUSES.has(candidate) ? candidate : fallback[uid];
    });
    return fallback;
};

const getValidStartSection = (candidateSection, sectionUids) => {
    if (candidateSection === "CS" && sectionUids.CS.length > 0) {
        return "CS";
    }
    if (sectionUids.GA.length > 0) {
        return "GA";
    }
    if (sectionUids.CS.length > 0) {
        return "CS";
    }
    return "GA";
};

const getCurrentUidFromSectionState = (sectionUids, sectionIndexes, activeSection) => {
    const currentSection = activeSection === "CS" ? "CS" : "GA";
    const uids = sectionUids[currentSection] || [];
    if (uids.length === 0) {
        return null;
    }
    const index = clampToRange(sectionIndexes[currentSection] || 0, 0, uids.length - 1);
    return uids[index] || null;
};

const getSectionUidList = (sectionUids, section) => {
    return section === "CS" ? sectionUids.CS : sectionUids.GA;
};

const getClampedSectionIndex = (sectionUids, sectionIndexes, section) => {
    const uids = getSectionUidList(sectionUids, section);
    if (uids.length === 0) {
        return 0;
    }
    return clampToRange(sectionIndexes[section] || 0, 0, uids.length - 1);
};

export const MockTestProvider = ({ children }) => {
    const { allQuestions } = useFilterState();
    const [testActive, setTestActive] = useState(false);
    const [testSubmitted, setTestSubmitted] = useState(false);

    const [questions, setQuestions] = useState([]);
    const [sectionQuestionUids, setSectionQuestionUids] = useState({ GA: [], CS: [] });
    const [sectionIndexes, setSectionIndexes] = useState({ GA: 0, CS: 0 });
    const [currentSection, setCurrentSectionState] = useState("GA");

    const [responses, setResponses] = useState({});
    const [questionStates, setQuestionStates] = useState({});
    const [timeLeft, setTimeLeft] = useState(TOTAL_MOCK_TIME_SECONDS);
    const [attemptMeta, setAttemptMeta] = useState(null);
    const [attemptError, setAttemptError] = useState("");

    const timerRef = useRef(null);
    const hasAttemptRestoreRun = useRef(false);

    const questionsByUid = useMemo(() => {
        return new Map(questions.map((question) => [question.question_uid, question]));
    }, [questions]);

    const sectionQuestions = useMemo(() => ({
        GA: sectionQuestionUids.GA.map((uid) => questionsByUid.get(uid)).filter(Boolean),
        CS: sectionQuestionUids.CS.map((uid) => questionsByUid.get(uid)).filter(Boolean),
    }), [questionsByUid, sectionQuestionUids.CS, sectionQuestionUids.GA]);

    const currentSectionUids = getSectionUidList(sectionQuestionUids, currentSection);
    const currentSectionIndex = getClampedSectionIndex(sectionQuestionUids, sectionIndexes, currentSection);
    const currentQuestionUid = currentSectionUids[currentSectionIndex] || null;
    const currentQuestion = currentQuestionUid ? questionsByUid.get(currentQuestionUid) || null : null;

    const currentQuestionIndex = useMemo(() => {
        if (!currentQuestionUid) {
            return -1;
        }
        return questions.findIndex((question) => question.question_uid === currentQuestionUid);
    }, [currentQuestionUid, questions]);

    const clearAttemptStorage = useCallback(() => {
        if (typeof window === "undefined") return;
        window.sessionStorage.removeItem(ATTEMPT_STORAGE_KEY);
    }, []);

    const resetAttemptState = useCallback(() => {
        setTestActive(false);
        setTestSubmitted(false);
        setQuestions([]);
        setSectionQuestionUids({ GA: [], CS: [] });
        setSectionIndexes({ GA: 0, CS: 0 });
        setCurrentSectionState("GA");
        setResponses({});
        setQuestionStates({});
        setTimeLeft(TOTAL_MOCK_TIME_SECONDS);
        setAttemptMeta(null);
        setAttemptError("");
    }, []);

    const markUidVisited = useCallback((uid) => {
        if (!uid) {
            return;
        }
        setQuestionStates((prev) => {
            if (prev[uid] === STATUS.NOT_VISITED) {
                return { ...prev, [uid]: STATUS.NOT_ANSWERED };
            }
            return prev;
        });
    }, []);

    const getSectionUids = useCallback(
        (section) => getSectionUidList(sectionQuestionUids, section),
        [sectionQuestionUids.CS, sectionQuestionUids.GA]
    );

    const getSectionIndex = useCallback(
        (section) => getClampedSectionIndex(sectionQuestionUids, sectionIndexes, section),
        [sectionIndexes, sectionQuestionUids.CS, sectionQuestionUids.GA]
    );

    const restoreFromSectionedPayload = useCallback((parsedAttempt, byUid) => {
        const gaUids = uniqueUidList(parsedAttempt?.gaUids);
        const csUids = uniqueUidList(parsedAttempt?.csUids);
        const strictCounts = parsedAttempt?.meta?.strictSectionCounts;
        const requiredGa = parseStrictCount(strictCounts?.GA);
        const requiredCs = parseStrictCount(strictCounts?.CS);

        if (requiredGa !== null && gaUids.length !== requiredGa) {
            return { ok: false, reason: "ga_count_mismatch" };
        }
        if (requiredCs !== null && csUids.length !== requiredCs) {
            return { ok: false, reason: "cs_count_mismatch" };
        }
        if (gaUids.length + csUids.length === 0) {
            return { ok: false, reason: "empty_attempt" };
        }

        const seen = new Set();
        for (const uid of [...gaUids, ...csUids]) {
            if (seen.has(uid)) {
                return { ok: false, reason: "duplicate_uid" };
            }
            seen.add(uid);
            if (!byUid.has(uid)) {
                return { ok: false, reason: "missing_uid" };
            }
        }

        const restoredQuestions = [...gaUids, ...csUids].map((uid) => byUid.get(uid));
        const activeSection = getValidStartSection(parsedAttempt?.activeSection, { GA: gaUids, CS: csUids });
        const gaIndex = clampToRange(
            parseInteger(parsedAttempt?.gaIndex, 0),
            0,
            Math.max(gaUids.length - 1, 0)
        );
        const csIndex = clampToRange(
            parseInteger(parsedAttempt?.csIndex, 0),
            0,
            Math.max(csUids.length - 1, 0)
        );

        const currentUid = getCurrentUidFromSectionState(
            { GA: gaUids, CS: csUids },
            { GA: gaIndex, CS: csIndex },
            activeSection
        ) || gaUids[0] || csUids[0] || "";

        const uidSet = new Set([...gaUids, ...csUids]);
        const restoredResponses = sanitizeResponses(parsedAttempt?.responses, uidSet);
        const restoredStates = sanitizeQuestionStates(
            parsedAttempt?.questionStates,
            [...gaUids, ...csUids],
            currentUid
        );

        const restoredTimeLeft = parsePositiveTimeSeconds(parsedAttempt?.timeLeft, TOTAL_MOCK_TIME_SECONDS);

        return {
            ok: true,
            questions: restoredQuestions,
            sectionQuestionUids: { GA: gaUids, CS: csUids },
            sectionIndexes: { GA: gaIndex, CS: csIndex },
            activeSection,
            responses: restoredResponses,
            questionStates: restoredStates,
            timeLeft: restoredTimeLeft,
            meta: parsedAttempt?.meta || null,
        };
    }, []);

    const restoreFromLegacyPayload = useCallback((parsedAttempt, byUid) => {
        const questionUids = uniqueUidList(parsedAttempt?.questionUids);
        if (questionUids.length === 0) {
            return { ok: false, reason: "empty_attempt" };
        }

        const restoredQuestions = questionUids
            .map((uid) => byUid.get(uid))
            .filter(Boolean);
        if (restoredQuestions.length !== questionUids.length) {
            return { ok: false, reason: "missing_uid" };
        }

        const split = splitBySection(restoredQuestions);
        const gaUids = split.ga.map((question) => question.question_uid);
        const csUids = split.cs.map((question) => question.question_uid);
        const activeSection = getValidStartSection(parsedAttempt?.currentSection, { GA: gaUids, CS: csUids });
        const globalIndex = parseInteger(parsedAttempt?.currentQuestionIndex, 0);
        const activeQuestion = restoredQuestions[clampToRange(globalIndex, 0, restoredQuestions.length - 1)];

        let gaIndex = 0;
        let csIndex = 0;
        if (activeQuestion?.question_uid) {
            const activeUid = activeQuestion.question_uid;
            const foundGa = gaUids.indexOf(activeUid);
            const foundCs = csUids.indexOf(activeUid);
            if (foundGa >= 0) {
                gaIndex = foundGa;
            }
            if (foundCs >= 0) {
                csIndex = foundCs;
            }
        }

        const currentUid = getCurrentUidFromSectionState(
            { GA: gaUids, CS: csUids },
            { GA: gaIndex, CS: csIndex },
            activeSection
        ) || gaUids[0] || csUids[0] || "";

        const uidSet = new Set([...gaUids, ...csUids]);
        const restoredResponses = sanitizeResponses(parsedAttempt?.responses, uidSet);
        const restoredStates = sanitizeQuestionStates(
            parsedAttempt?.questionStates,
            [...gaUids, ...csUids],
            currentUid
        );

        const restoredTimeLeft = parsePositiveTimeSeconds(parsedAttempt?.timeLeft, TOTAL_MOCK_TIME_SECONDS);

        return {
            ok: true,
            questions: restoredQuestions,
            sectionQuestionUids: { GA: gaUids, CS: csUids },
            sectionIndexes: { GA: gaIndex, CS: csIndex },
            activeSection,
            responses: restoredResponses,
            questionStates: restoredStates,
            timeLeft: restoredTimeLeft,
            meta: parsedAttempt?.meta || null,
        };
    }, []);

    useEffect(() => {
        if (allQuestions.length === 0 || hasAttemptRestoreRun.current) {
            return;
        }
        hasAttemptRestoreRun.current = true;

        if (typeof window === "undefined") {
            return;
        }

        const rawAttempt = window.sessionStorage.getItem(ATTEMPT_STORAGE_KEY);
        if (!rawAttempt) {
            return;
        }

        const byUid = new Map(allQuestions.map((question) => [question.question_uid, question]));

        try {
            const parsedAttempt = JSON.parse(rawAttempt);
            const restored = Array.isArray(parsedAttempt?.gaUids) || Array.isArray(parsedAttempt?.csUids)
                ? restoreFromSectionedPayload(parsedAttempt, byUid)
                : restoreFromLegacyPayload(parsedAttempt, byUid);

            if (!restored.ok) {
                clearAttemptStorage();
                setAttemptError("Attempt invalid, restart mock.");
                return;
            }

            setQuestions(restored.questions);
            setSectionQuestionUids(restored.sectionQuestionUids);
            setSectionIndexes(restored.sectionIndexes);
            setCurrentSectionState(restored.activeSection);
            setResponses(restored.responses);
            setQuestionStates(restored.questionStates);
            setTimeLeft(restored.timeLeft);
            setAttemptMeta(restored.meta);
            setTestSubmitted(false);
            setTestActive(true);
            setAttemptError("");
        } catch (error) {
            clearAttemptStorage();
            setAttemptError("Attempt invalid, restart mock.");
        }
    }, [allQuestions, clearAttemptStorage, restoreFromLegacyPayload, restoreFromSectionedPayload]);

    const startTest = useCallback((config = {}) => {
        const hasExplicitSectioned = Object.prototype.hasOwnProperty.call(config, "gaQuestions")
            || Object.prototype.hasOwnProperty.call(config, "csQuestions");
        const hasExplicitQuestions = Object.prototype.hasOwnProperty.call(config, "questions");

        let gaQuestions = [];
        let csQuestions = [];

        if (hasExplicitSectioned) {
            const normalized = normalizeSectionQuestions(
                Array.isArray(config.gaQuestions) ? config.gaQuestions : [],
                Array.isArray(config.csQuestions) ? config.csQuestions : []
            );
            gaQuestions = normalized.ga;
            csQuestions = normalized.cs;
        } else if (hasExplicitQuestions) {
            const split = splitBySection(Array.isArray(config.questions) ? config.questions : []);
            gaQuestions = split.ga;
            csQuestions = split.cs;
        } else {
            if (allQuestions.length === 0) {
                return false;
            }
            gaQuestions = allQuestions.filter(isGaQuestion).slice(0, 10);
            csQuestions = allQuestions.filter((question) => !isGaQuestion(question)).slice(0, 55);
        }

        const strictCounts = config?.meta?.strictSectionCounts || null;
        const requiredGa = parseStrictCount(strictCounts?.GA);
        const requiredCs = parseStrictCount(strictCounts?.CS);
        if (requiredGa !== null && gaQuestions.length !== requiredGa) {
            return false;
        }
        if (requiredCs !== null && csQuestions.length !== requiredCs) {
            return false;
        }

        const normalizedSections = normalizeSectionQuestions(gaQuestions, csQuestions);
        gaQuestions = normalizedSections.ga;
        csQuestions = normalizedSections.cs;

        const orderedQuestions = [...gaQuestions, ...csQuestions];
        if (orderedQuestions.length === 0) {
            return false;
        }

        const safeTime = parsePositiveTimeSeconds(config?.timeSeconds, TOTAL_MOCK_TIME_SECONDS);

        const gaUids = gaQuestions.map((question) => question.question_uid);
        const csUids = csQuestions.map((question) => question.question_uid);
        const sectionUids = { GA: gaUids, CS: csUids };
        const startSection = getValidStartSection(config?.startSection, sectionUids);
        const startIndexes = {
            GA: 0,
            CS: 0,
        };
        const currentUid = getCurrentUidFromSectionState(sectionUids, startIndexes, startSection);
        const initialStates = buildInitialQuestionStates([...gaUids, ...csUids], currentUid || "");

        setQuestions(orderedQuestions);
        setSectionQuestionUids(sectionUids);
        setSectionIndexes(startIndexes);
        setCurrentSectionState(startSection);
        setQuestionStates(initialStates);
        setResponses({});
        setTimeLeft(safeTime);
        setTestSubmitted(false);
        setAttemptMeta(config?.meta || null);
        setAttemptError("");
        setTestActive(true);
        return true;
    }, [allQuestions]);

    useEffect(() => {
        if (!testActive || testSubmitted || questions.length === 0) {
            return;
        }
        if (typeof window === "undefined") {
            return;
        }

        const payload = {
            v: 2,
            gaUids: sectionQuestionUids.GA,
            csUids: sectionQuestionUids.CS,
            activeSection: currentSection,
            gaIndex: sectionIndexes.GA,
            csIndex: sectionIndexes.CS,
            responses,
            questionStates,
            timeLeft,
            meta: attemptMeta || null,
        };

        window.sessionStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(payload));
    }, [
        testActive,
        testSubmitted,
        questions.length,
        sectionQuestionUids.GA,
        sectionQuestionUids.CS,
        currentSection,
        sectionIndexes.GA,
        sectionIndexes.CS,
        responses,
        questionStates,
        timeLeft,
        attemptMeta,
    ]);

    useEffect(() => {
        if (!testActive || questions.length === 0) {
            return;
        }

        const hasGa = sectionQuestionUids.GA.length > 0;
        const hasCs = sectionQuestionUids.CS.length > 0;

        if (!hasGa && !hasCs) {
            return;
        }

        if (currentSection === "GA" && !hasGa && hasCs) {
            setCurrentSectionState("CS");
            return;
        }

        if (currentSection === "CS" && !hasCs && hasGa) {
            setCurrentSectionState("GA");
            return;
        }

        const currentSectionUids = getSectionUids(currentSection);
        const maxForSection = Math.max(currentSectionUids.length - 1, 0);
        const indexForSection = sectionIndexes[currentSection] || 0;
        if (indexForSection > maxForSection) {
            setSectionIndexes((prev) => ({
                ...prev,
                [currentSection]: maxForSection,
            }));
        }
    }, [
        currentSection,
        getSectionUids,
        questions.length,
        sectionIndexes.CS,
        sectionIndexes.GA,
        sectionQuestionUids.CS,
        sectionQuestionUids.GA,
        testActive,
    ]);

    useEffect(() => {
        if (!testActive || testSubmitted) {
            return undefined;
        }

        timerRef.current = window.setInterval(() => {
            setTimeLeft((previous) => {
                if (previous <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    setTestSubmitted(true);
                    setTestActive(false);
                    clearAttemptStorage();
                    return 0;
                }
                return previous - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [testActive, testSubmitted, clearAttemptStorage]);

    const goToQuestion = useCallback((index, section = currentSection) => {
        const targetSection = section === "CS" ? "CS" : "GA";
        const sectionUids = getSectionUids(targetSection);
        if (sectionUids.length === 0) {
            return;
        }
        if (index < 0 || index >= sectionUids.length) {
            return;
        }

        setCurrentSectionState(targetSection);
        setSectionIndexes((prev) => ({
            ...prev,
            [targetSection]: index,
        }));

        markUidVisited(sectionUids[index]);
    }, [currentSection, getSectionUids, markUidVisited]);

    const setCurrentSection = useCallback((section) => {
        const targetSection = section === "CS" ? "CS" : "GA";
        const sectionUids = getSectionUids(targetSection);
        if (sectionUids.length === 0) {
            return;
        }

        setCurrentSectionState(targetSection);
        const index = getSectionIndex(targetSection);
        markUidVisited(sectionUids[index]);
    }, [getSectionIndex, getSectionUids, markUidVisited]);

    const goToPrevious = useCallback(() => {
        const sectionUids = getSectionUids(currentSection);
        if (sectionUids.length === 0) {
            return;
        }
        const currentIndex = getSectionIndex(currentSection);
        if (currentIndex > 0) {
            goToQuestion(currentIndex - 1, currentSection);
        }
    }, [currentSection, getSectionIndex, getSectionUids, goToQuestion]);

    const goToNext = useCallback(() => {
        const sectionUids = getSectionUids(currentSection);
        if (sectionUids.length === 0) {
            return;
        }
        const currentIndex = getSectionIndex(currentSection);
        if (currentIndex < sectionUids.length - 1) {
            goToQuestion(currentIndex + 1, currentSection);
        }
    }, [currentSection, getSectionIndex, getSectionUids, goToQuestion]);

    const saveResponse = useCallback((uid, response) => {
        setResponses((prev) => ({ ...prev, [uid]: response }));
    }, []);

    const clearResponse = useCallback(() => {
        const uid = currentQuestionUid;
        if (!uid) return;

        setResponses((prev) => {
            const next = { ...prev };
            delete next[uid];
            return next;
        });

        setQuestionStates((prev) => ({
            ...prev,
            [uid]:
                prev[uid] === STATUS.ANSWERED_AND_MARKED_FOR_REVIEW || prev[uid] === STATUS.MARKED_FOR_REVIEW
                    ? STATUS.MARKED_FOR_REVIEW
                    : STATUS.NOT_ANSWERED,
        }));
    }, [currentQuestionUid]);

    const saveAndNext = useCallback(() => {
        const uid = currentQuestionUid;
        if (!uid) return;

        setQuestionStates((prev) => ({
            ...prev,
            [uid]: responses[uid] !== undefined ? STATUS.ANSWERED : STATUS.NOT_ANSWERED,
        }));
        goToNext();
    }, [currentQuestionUid, goToNext, responses]);

    const markForReviewAndNext = useCallback(() => {
        const uid = currentQuestionUid;
        if (!uid) return;

        setQuestionStates((prev) => ({
            ...prev,
            [uid]:
                responses[uid] !== undefined
                    ? STATUS.ANSWERED_AND_MARKED_FOR_REVIEW
                    : STATUS.MARKED_FOR_REVIEW,
        }));
        goToNext();
    }, [currentQuestionUid, goToNext, responses]);

    const submitTest = useCallback(() => {
        setTestSubmitted(true);
        setTestActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        clearAttemptStorage();
    }, [clearAttemptStorage]);

    const endMockTest = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        clearAttemptStorage();
        resetAttemptState();
    }, [clearAttemptStorage, resetAttemptState]);

    const clearAttemptError = useCallback(() => {
        setAttemptError("");
    }, []);

    const value = {
        testActive,
        startTest,
        endMockTest,
        questions,
        sectionQuestions,
        sectionQuestionUids,
        sectionIndexes,
        currentQuestionIndex,
        currentSectionIndex,
        currentQuestion,
        currentQuestionUid,
        currentSection,
        setCurrentSection,
        responses,
        questionStates,
        timeLeft,
        testSubmitted,
        submitTest,
        goToQuestion,
        goToNext,
        saveResponse,
        clearResponse,
        saveAndNext,
        markForReviewAndNext,
        goToPrevious,
        STATUS,
        attemptMeta,
        attemptError,
        clearAttemptError,
    };

    return <MockTestContext.Provider value={value}>{children}</MockTestContext.Provider>;
};

export const useMockTest = () => {
    const context = useContext(MockTestContext);
    if (!context) {
        throw new Error("useMockTest must be used within a MockTestProvider");
    }
    return context;
};
