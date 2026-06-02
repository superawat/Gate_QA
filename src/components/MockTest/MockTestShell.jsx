import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMockTest } from "../../contexts/MockTestContext";
import { useFilterState } from "../../contexts/FilterContext";
import { AnswerService } from "../../services/AnswerService";
import { QuestionService } from "../../services/QuestionService";
import { AptitudeQuestionService } from "../../services/AptitudeQuestionService";
import { TOGGLE_CALCULATOR_EVENT } from "../../utils/globalEvents";
import { MOCK_SECTION_COUNTS, validateMockQuestionForPool } from "../../utils/mockTest";
import AppHeader from "../Layout/AppHeader";
import MockCatalogLoaderCard from "../Loaders/MockCatalogLoaderCard";
import CalculatorWidget from "../Calculator/CalculatorWidget";
import MockTestHeader from "./MockTestHeader";
import MockTestQuestion from "./MockTestQuestion";
import QuestionPalette from "./QuestionPalette";
import MockTestActionBar from "./MockTestActionBar";
import MockTestResults from "./MockTestResults";
import MockTestPortal from "./MockTestPortal";
import MockTestSetup from "./MockTestSetup";
import "./MockTest.css";

const PALETTE_COLLAPSE_STORAGE_KEY = "gateqa_mock_palette_collapsed";
const TYPE_OPTIONS = ["MCQ", "MSQ", "NAT"];
const DEFAULT_MOCK_KIND_ID = "full_length";
const APTITUDE_UID_PREFIX = "APT-";

const MOCK_KIND_OPTIONS = [
    {
        id: "full_length",
        title: "Full Mock",
        badge: "Recommended",
        subtitle: "Best default if you want a serious exam-style run before the real test.",
        helper: "Builds a 65-question attempt from the cross-year scorable GA and CSE pool.",
        facts: { count: "65 Questions", duration: "180 min" },
        fixedCount: 65,
        durationMinutes: 180,
        durationLabel: "180 min",
    },
    {
        id: "paper_mode",
        title: "Past Paper",
        badge: "Closest to Exam",
        subtitle: "Attempt a release-ready paper in deterministic order with paper-backed structure.",
        helper: "Use this when you want the closest available match to a real GATE paper.",
        facts: { count: "10 GA + 55 Core", duration: "180 min" },
        fixedCount: 65,
        durationMinutes: 180,
        durationLabel: "180 min",
    },
    {
        id: "custom",
        title: "Custom Builder",
        badge: "Flexible",
        subtitle: "Create a short mock, subject-focused run, or 15Q/25Q practice set from one builder.",
        helper: "Quick mocks now start here instead of appearing as separate portal cards.",
        facts: { count: "1 to 65 Questions", duration: "Adaptive" },
        fixedCount: null,
        durationMinutes: null,
        durationLabel: "Adaptive",
    },
];

const shuffle = (rows = []) => {
    const next = [...rows];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }
    return next;
};

const slugifyToken = (value = "") => (
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
);

const getQuestionSubjectKey = (question = {}) => (
    slugifyToken(question?.subjectSlug || question?.subject || "unknown") || "unknown"
);

const getQuestionSubjectLabel = (question = {}) => (
    String(question?.subjectLabel || question?.subject || getQuestionSubjectKey(question)).trim()
    || getQuestionSubjectKey(question)
);

const getQuestionSubtopicKey = (question = {}) => {
    const firstSubtopic = Array.isArray(question?.subtopics) ? question.subtopics[0] : null;
    return slugifyToken(
        firstSubtopic?.slug
        || firstSubtopic?.label
        || question?.subtopic
        || question?.topic
        || "general"
    ) || "general";
};

const takeFromBalancedSubject = (subjectBucket) => {
    while (subjectBucket.subtopics.length > 0) {
        const subtopicBucket = subjectBucket.subtopics.shift();
        const question = subtopicBucket.queue.shift();
        if (subtopicBucket.queue.length > 0) {
            subjectBucket.subtopics.push(subtopicBucket);
        }
        if (question) {
            return question;
        }
    }
    return null;
};

const balancedSample = (rows = [], count = 0) => {
    const targetCount = Math.max(0, Math.min(rows.length, Number.parseInt(String(count || 0), 10) || 0));
    if (targetCount === 0) {
        return [];
    }

    const groupedBySubject = new Map();
    shuffle(rows).forEach((question) => {
        const subjectKey = getQuestionSubjectKey(question);
        const subtopicKey = getQuestionSubtopicKey(question);
        if (!groupedBySubject.has(subjectKey)) {
            groupedBySubject.set(subjectKey, new Map());
        }
        const subtopicMap = groupedBySubject.get(subjectKey);
        if (!subtopicMap.has(subtopicKey)) {
            subtopicMap.set(subtopicKey, []);
        }
        subtopicMap.get(subtopicKey).push(question);
    });

    const subjectBuckets = shuffle(Array.from(groupedBySubject.entries()).map(([subjectKey, subtopicMap]) => ({
        subjectKey,
        subtopics: shuffle(Array.from(subtopicMap.entries()).map(([subtopicKey, queue]) => ({
            subtopicKey,
            queue,
        }))),
    })));

    const sampled = [];
    while (sampled.length < targetCount && subjectBuckets.length > 0) {
        const subjectBucket = subjectBuckets.shift();
        const question = takeFromBalancedSubject(subjectBucket);
        if (question) {
            sampled.push(question);
        }
        if (subjectBucket.subtopics.length > 0) {
            subjectBuckets.push(subjectBucket);
        }
    }

    return sampled;
};

const clampYear = (value, fallback) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const clampQuestionCount = (value) => (
    Math.max(1, Math.min(65, Number.parseInt(String(value || "1"), 10) || 1))
);

const normalizeSetupTypes = (rawTypes = []) => {
    const values = Array.isArray(rawTypes) ? rawTypes : [];
    const normalized = values
        .map((type) => String(type || "").trim().toUpperCase())
        .filter((type) => TYPE_OPTIONS.includes(type));
    return TYPE_OPTIONS.filter((type) => normalized.includes(type));
};

const computeDurationForCustomCount = (rawCount) => {
    const count = clampQuestionCount(rawCount);
    if (count === 65) return 180;
    if (count === 25) return 70;
    if (count === 15) return 40;

    if (count < 15) {
        return Math.max(10, Math.round((40 / 15) * count));
    }

    if (count < 25) {
        const ratio = (count - 15) / (25 - 15);
        return Math.round(40 + ratio * (70 - 40));
    }

    const ratio = (count - 25) / (65 - 25);
    return Math.round(70 + ratio * (180 - 70));
};

const formatSectionAvailability = (gaCount, csCount) => `${gaCount} GA / ${csCount} CS`;
const formatSectionRequirement = (gaCount, csCount, questionCount = null) => {
    const total = Number.isFinite(Number(questionCount))
        ? Number(questionCount)
        : Number(gaCount || 0) + Number(csCount || 0);
    if (!Number.isFinite(total) || total <= 0) {
        return `${gaCount} GA / ${csCount} CS`;
    }
    return `${gaCount} GA / ${csCount} CS (${total} Questions)`;
};

const buildDefaultSetupState = (minYear, maxYear, kindId = "", selectedPaperYearSetKey = "") => ({
    minYear,
    maxYear,
    yearFilterMode: "all",
    yearRangeStart: minYear,
    yearRangeEnd: maxYear,
    selectedSubjects: [],
    selectedTypes: [...TYPE_OPTIONS],
    selectedPaperYearSetKey,
    customCount: kindId === "custom" ? 25 : 65,
    includeSolvedQuestions: false,
});

const splitByCatalogSection = (rows = [], questionMetaByUid = {}) => {
    const gaQuestions = [];
    const csQuestions = [];

    rows.forEach((question) => {
        const questionUid = String(question?.question_uid || "").trim();
        const section = questionMetaByUid[questionUid]?.section;
        if (section === "GA") {
            gaQuestions.push(question);
            return;
        }
        if (section === "CS") {
            csQuestions.push(question);
        }
    });

    return { gaQuestions, csQuestions };
};

const resolveCountBasedSectionTargets = (count = 0, gaAvailable = 0, csAvailable = 0) => {
    const requestedCount = Math.max(0, Number.parseInt(String(count || 0), 10) || 0);
    const targetCount = Math.min(requestedCount, gaAvailable + csAvailable);
    if (targetCount <= 0) {
        return { gaTarget: 0, csTarget: 0 };
    }
    if (gaAvailable <= 0) {
        return { gaTarget: 0, csTarget: Math.min(targetCount, csAvailable) };
    }
    if (csAvailable <= 0) {
        return { gaTarget: Math.min(targetCount, gaAvailable), csTarget: 0 };
    }
    if (targetCount === 1) {
        return { gaTarget: 1, csTarget: 0 };
    }

    const totalPatternCount = MOCK_SECTION_COUNTS.GA + MOCK_SECTION_COUNTS.CS;
    let gaTarget = Math.round((targetCount * MOCK_SECTION_COUNTS.GA) / totalPatternCount);
    gaTarget = Math.max(1, Math.min(gaTarget, gaAvailable, targetCount - 1));
    let csTarget = Math.min(csAvailable, targetCount - gaTarget);
    let remaining = targetCount - gaTarget - csTarget;

    if (remaining > 0) {
        const extraGa = Math.min(remaining, gaAvailable - gaTarget);
        gaTarget += extraGa;
        remaining -= extraGa;
    }
    if (remaining > 0) {
        const extraCs = Math.min(remaining, csAvailable - csTarget);
        csTarget += extraCs;
    }

    return { gaTarget, csTarget };
};

const buildSubjectOptions = (rows = []) => {
    const bySlug = new Map();
    rows.forEach((question) => {
        const slug = getQuestionSubjectKey(question);
        if (!slug) {
            return;
        }
        const label = getQuestionSubjectLabel(question);
        const current = bySlug.get(slug);
        bySlug.set(slug, {
            slug,
            label: current?.label || label,
            count: (current?.count || 0) + 1,
        });
    });
    return Array.from(bySlug.values()).sort((left, right) => left.label.localeCompare(right.label));
};

const sortByCatalogOrder = (rows = [], questionMetaByUid = {}) => (
    [...rows].sort((left, right) => {
        const leftMeta = questionMetaByUid[left?.question_uid] || {};
        const rightMeta = questionMetaByUid[right?.question_uid] || {};
        if ((leftMeta.orderIndex || 0) !== (rightMeta.orderIndex || 0)) {
            return (leftMeta.orderIndex || 0) - (rightMeta.orderIndex || 0);
        }
        return String(left?.question_uid || "").localeCompare(String(right?.question_uid || ""));
    })
);

const buildCountBasedSelection = (rows = [], count = 0, questionMetaByUid = {}) => {
    const sections = splitByCatalogSection(rows, questionMetaByUid);
    const targets = resolveCountBasedSectionTargets(
        count,
        sections.gaQuestions.length,
        sections.csQuestions.length
    );
    return {
        gaQuestions: balancedSample(sections.gaQuestions, targets.gaTarget),
        csQuestions: balancedSample(sections.csQuestions, targets.csTarget),
    };
};

const buildStrictGeneratedSelection = (rows = [], questionMetaByUid = {}) => {
    const sections = splitByCatalogSection(rows, questionMetaByUid);
    if (
        sections.gaQuestions.length < MOCK_SECTION_COUNTS.GA
        || sections.csQuestions.length < MOCK_SECTION_COUNTS.CS
    ) {
        return null;
    }

    return {
        gaQuestions: balancedSample(sections.gaQuestions, MOCK_SECTION_COUNTS.GA),
        csQuestions: balancedSample(sections.csQuestions, MOCK_SECTION_COUNTS.CS),
    };
};

const isSolvedQuestion = (question = {}, solvedQuestionSet = new Set()) => (
    solvedQuestionSet.has(String(question?.question_uid || "").trim())
);

const MockTestShell = ({ onExit, initialStage = "setup", onStageChange }) => {
    const {
        attemptError,
        attemptMeta,
        aptitudeMockLoading = false,
        catalogError,
        catalogLoading,
        clearAttemptError,
        endMockTest,
        mockQuestionPool = null,
        paperCatalog,
        questionMetaByUid,
        questions,
        readyPapers,
        resultSummary,
        startTest,
        testActive,
        testSubmitted,
        timeLeft,
    } = useMockTest();
    const {
        allQuestions,
        structuredTags,
        isInitialized,
        activeSolvedQuestionIds = [],
    } = useFilterState();

    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window === "undefined") return true;
        return window.innerWidth >= 1024;
    });
    const [step, setStep] = useState("portal");
    const [selectedKindId, setSelectedKindId] = useState(DEFAULT_MOCK_KIND_ID);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem(PALETTE_COLLAPSE_STORAGE_KEY) === "1";
    });
    const calculatorButtonRef = useRef(null);
    const exitInProgressRef = useRef(false);
    const [setupState, setSetupState] = useState(() => buildDefaultSetupState(2000, 2025));

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(PALETTE_COLLAPSE_STORAGE_KEY, isPaletteCollapsed ? "1" : "0");
    }, [isPaletteCollapsed]);

    useEffect(() => {
        const handleToggleCalculator = () => {
            setIsCalculatorOpen((prev) => !prev);
        };

        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                handleToggleCalculator();
            }
            if (event.key === "Escape") {
                setIsCalculatorOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener(TOGGLE_CALCULATOR_EVENT, handleToggleCalculator);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener(TOGGLE_CALCULATOR_EVENT, handleToggleCalculator);
        };
    }, []);

    // Guard against accidental tab close / reload during an active exam
    useEffect(() => {
        if (!testActive) {
            return;
        }
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [testActive]);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }
        const minYear = structuredTags?.minYear || 2000;
        const maxYear = structuredTags?.maxYear || 2025;
        setSetupState((prev) => ({
            ...prev,
            minYear,
            maxYear,
            yearRangeStart: minYear,
            yearRangeEnd: maxYear,
        }));
    }, [isInitialized, structuredTags?.maxYear, structuredTags?.minYear]);

    useEffect(() => {
        if (!testActive) {
            return;
        }

        clearAttemptError();
        setSelectedKindId(String(attemptMeta?.kindId || ""));
        setStep("exam");
    }, [attemptMeta?.kindId, clearAttemptError, testActive]);

    useEffect(() => {
        if (testSubmitted && step === "exam") {
            setStep("result");
        }
    }, [step, testSubmitted]);

    useEffect(() => {
        if (exitInProgressRef.current) {
            return;
        }
        if (
            !testActive
            && !testSubmitted
            && questions.length === 0
            && (step === "exam" || step === "review" || step === "result")
        ) {
            setStep("portal");
        }
    }, [questions.length, step, testActive, testSubmitted]);

    useEffect(() => {
        if (!onStageChange) {
            return;
        }
        if (exitInProgressRef.current) {
            return;
        }
        onStageChange(step === "exam" || step === "review" ? "exam" : "setup");
    }, [onStageChange, step]);

    useEffect(() => {
        if (exitInProgressRef.current) {
            return;
        }
        if (initialStage === "setup" && !testActive && !testSubmitted) {
            setStep((prev) => (prev === "exam" || prev === "review" ? "portal" : prev));
        }
    }, [initialStage, testActive, testSubmitted]);

    const selectedKind = useMemo(
        () => MOCK_KIND_OPTIONS.find((kind) => kind.id === selectedKindId) || null,
        [selectedKindId]
    );
    const solvedQuestionSet = useMemo(
        () => new Set((Array.isArray(activeSolvedQuestionIds) ? activeSolvedQuestionIds : []).map((uid) => String(uid || "").trim()).filter(Boolean)),
        [activeSolvedQuestionIds]
    );
    const includeSolvedQuestions = Boolean(setupState.includeSolvedQuestions);

    const scorableQuestions = useMemo(
        () => {
            const pool = Array.isArray(mockQuestionPool) && mockQuestionPool.length > 0
                ? mockQuestionPool
                : allQuestions;
            return pool.filter((question) => {
                const questionUid = String(question?.question_uid || "").trim();
                const questionMeta = questionMetaByUid[questionUid];
                return validateMockQuestionForPool({
                    question,
                    questionMeta,
                    answerRecord: AnswerService.getAnswerForQuestion(question),
                }).valid;
            });
        },
        [allQuestions, mockQuestionPool, questionMetaByUid]
    );
    const generatedScorableQuestions = useMemo(
        () => includeSolvedQuestions
            ? scorableQuestions
            : scorableQuestions.filter((question) => !isSolvedQuestion(question, solvedQuestionSet)),
        [includeSolvedQuestions, scorableQuestions, solvedQuestionSet]
    );

    const mockSubjects = useMemo(
        () => buildSubjectOptions(scorableQuestions),
        [scorableQuestions]
    );

    const selectedPaperYearSetKey = useMemo(() => {
        if (selectedKind?.id !== "paper_mode") {
            return null;
        }

        const requestedKey = String(setupState.selectedPaperYearSetKey || "").trim();
        if (requestedKey && paperCatalog.some((paper) => paper.yearSetKey === requestedKey)) {
            return requestedKey;
        }

        return readyPapers[0]?.yearSetKey || paperCatalog[0]?.yearSetKey || null;
    }, [paperCatalog, readyPapers, selectedKind?.id, setupState.selectedPaperYearSetKey]);

    const selectedPaper = useMemo(
        () => paperCatalog.find((paper) => paper.yearSetKey === selectedPaperYearSetKey) || null,
        [paperCatalog, selectedPaperYearSetKey]
    );

    const selectedSetupTypes = useMemo(
        () => normalizeSetupTypes(setupState.selectedTypes),
        [setupState.selectedTypes]
    );

    const recentYearStart = useMemo(
        () => Math.max(Number(setupState.minYear || 2000), Number(setupState.maxYear || 2025) - 9),
        [setupState.maxYear, setupState.minYear]
    );

    const filteredPool = useMemo(() => {
        const minYear = Number(setupState.minYear || 2000);
        const maxYear = Number(setupState.maxYear || 2025);
        const yearFilterMode = String(setupState.yearFilterMode || "all").trim().toLowerCase();
        const customRangeStart = Math.max(minYear, Math.min(maxYear, clampYear(setupState.yearRangeStart, minYear)));
        const customRangeEnd = Math.max(customRangeStart, Math.min(maxYear, clampYear(setupState.yearRangeEnd, maxYear)));
        const selectedSubjectSet = new Set(setupState.selectedSubjects);
        const selectedTypeSet = new Set(selectedSetupTypes);

        return generatedScorableQuestions.filter((question) => {
            const questionUid = String(question?.question_uid || "").trim();
            const questionMeta = questionMetaByUid[questionUid];
            if (!questionMeta?.scorable) {
                return false;
            }

            if (selectedSetupTypes.length === 0) {
                return false;
            }

            if (
                selectedSetupTypes.length < TYPE_OPTIONS.length
                && !selectedTypeSet.has(String(questionMeta.type || "").toUpperCase())
            ) {
                return false;
            }

            const examYear = Number(question?.exam?.year || 0);
            if (yearFilterMode === "recent") {
                if (!(examYear > 0 && examYear >= recentYearStart && examYear <= maxYear)) {
                    return false;
                }
            } else if (yearFilterMode === "custom") {
                if (!(examYear > 0 && examYear >= customRangeStart && examYear <= customRangeEnd)) {
                    return false;
                }
            }

            const questionSubject = question?.subjectSlug || "unknown";
            if (selectedSubjectSet.size > 0 && !selectedSubjectSet.has(questionSubject)) {
                return false;
            }

            return true;
        });
    }, [
        questionMetaByUid,
        recentYearStart,
        generatedScorableQuestions,
        selectedSetupTypes,
        setupState.maxYear,
        setupState.minYear,
        setupState.selectedSubjects,
        setupState.yearFilterMode,
        setupState.yearRangeEnd,
        setupState.yearRangeStart,
    ]);

    const filteredPoolSections = useMemo(
        () => splitByCatalogSection(filteredPool, questionMetaByUid),
        [filteredPool, questionMetaByUid]
    );
    const filteredGaCount = filteredPoolSections.gaQuestions.length;
    const filteredCsCount = filteredPoolSections.csQuestions.length;
    const filteredSectionSummary = useMemo(
        () => formatSectionAvailability(filteredGaCount, filteredCsCount),
        [filteredCsCount, filteredGaCount]
    );

    const scorablePoolSections = useMemo(
        () => splitByCatalogSection(generatedScorableQuestions, questionMetaByUid),
        [generatedScorableQuestions, questionMetaByUid]
    );
    const scorableGaCount = scorablePoolSections.gaQuestions.length;
    const scorableCsCount = scorablePoolSections.csQuestions.length;
    const scorableSectionSummary = useMemo(
        () => formatSectionAvailability(scorableGaCount, scorableCsCount),
        [scorableCsCount, scorableGaCount]
    );

    const paperQuestions = useMemo(() => {
        if (!selectedPaperYearSetKey) {
            return [];
        }

        const rows = scorableQuestions.filter((question) => {
            const questionMeta = questionMetaByUid[question.question_uid];
            return questionMeta?.scorable && questionMeta.yearSetKey === selectedPaperYearSetKey;
        });

        return sortByCatalogOrder(rows, questionMetaByUid);
    }, [questionMetaByUid, scorableQuestions, selectedPaperYearSetKey]);

    const paperSections = useMemo(
        () => splitByCatalogSection(paperQuestions, questionMetaByUid),
        [paperQuestions, questionMetaByUid]
    );
    const paperGaQuestions = useMemo(
        () => sortByCatalogOrder(paperSections.gaQuestions, questionMetaByUid),
        [paperSections.gaQuestions, questionMetaByUid]
    );
    const paperCsQuestions = useMemo(
        () => sortByCatalogOrder(paperSections.csQuestions, questionMetaByUid),
        [paperSections.csQuestions, questionMetaByUid]
    );
    const paperSectionSummary = useMemo(
        () => formatSectionAvailability(paperGaQuestions.length, paperCsQuestions.length),
        [paperCsQuestions.length, paperGaQuestions.length]
    );

    const customCount = clampQuestionCount(setupState.customCount);
    const customDurationMinutes = computeDurationForCustomCount(customCount);

    const availability = useMemo(() => {
        if (!selectedKind) {
            return {
                canStart: false,
                requiredSummary: "N/A",
                availableSummary: "0",
                message: "Select a mock type to continue.",
            };
        }

        if (selectedKind.id === "paper_mode") {
            if (!selectedPaperYearSetKey) {
                return {
                    canStart: false,
                    requiredSummary: "Paper dependent",
                    availableSummary: "0",
                    message: "Select a validated year/set paper to continue.",
                };
            }

            const isReadyPaper = Boolean(selectedPaper?.paperReady);
            const requiredGaCount = Number.parseInt(
                String(selectedPaper?.requiredGaCount ?? MOCK_SECTION_COUNTS.GA),
                10
            );
            const requiredCsCount = Number.parseInt(
                String(selectedPaper?.requiredCsCount ?? MOCK_SECTION_COUNTS.CS),
                10
            );
            const requiredQuestionCount = Number.parseInt(
                String(selectedPaper?.requiredQuestionCount ?? (MOCK_SECTION_COUNTS.GA + MOCK_SECTION_COUNTS.CS)),
                10
            );
            const safeRequiredGaCount = Number.isFinite(requiredGaCount) ? requiredGaCount : MOCK_SECTION_COUNTS.GA;
            const safeRequiredCsCount = Number.isFinite(requiredCsCount) ? requiredCsCount : MOCK_SECTION_COUNTS.CS;
            const hasRequiredValidatedRows =
                paperGaQuestions.length === safeRequiredGaCount
                && paperCsQuestions.length === safeRequiredCsCount;
            const canStartPaper = isReadyPaper && hasRequiredValidatedRows;

            return {
                canStart: canStartPaper,
                requiredSummary: formatSectionRequirement(
                    safeRequiredGaCount,
                    safeRequiredCsCount,
                    Number.isFinite(requiredQuestionCount)
                        ? requiredQuestionCount
                        : (MOCK_SECTION_COUNTS.GA + MOCK_SECTION_COUNTS.CS)
                ),
                availableSummary: paperSectionSummary,
                message: canStartPaper
                    ? ""
                    : (
                        isReadyPaper
                            ? "This paper has invalid or missing questions in the current validated pool."
                            : (selectedPaper?.statusReason || "This paper is not release-ready yet.")
                    ),
            };
        }

        if (selectedKind.id === "full_length") {
            if (scorableGaCount < MOCK_SECTION_COUNTS.GA || scorableCsCount < MOCK_SECTION_COUNTS.CS) {
                return {
                    canStart: false,
                    requiredSummary: "10 GA + 55 CS",
                    availableSummary: scorableSectionSummary,
                    message: "The validated pool does not currently have enough GA and CS questions for a full-length attempt.",
                };
            }

            return {
                canStart: true,
                requiredSummary: "10 GA + 55 CS",
                availableSummary: scorableSectionSummary,
                message: "",
            };
        }

        if (selectedSetupTypes.length === 0) {
            return {
                canStart: false,
                requiredSummary: "N/A",
                availableSummary: "0",
                message: "Select at least one question type.",
            };
        }

        const requiredCount = selectedKind.id === "custom"
            ? customCount
            : (selectedKind.fixedCount || 0);

        if (filteredPool.length < requiredCount) {
            return {
                canStart: false,
                requiredSummary: String(requiredCount),
                availableSummary: String(filteredPool.length),
                message: `Only ${filteredPool.length} validated questions match the current filters.`,
            };
        }

        return {
            canStart: true,
            requiredSummary: String(requiredCount),
            availableSummary: String(filteredPool.length),
            message: "",
        };
    }, [
        customCount,
        filteredPool.length,
        paperCsQuestions.length,
        paperGaQuestions.length,
        paperSectionSummary,
        scorableCsCount,
        scorableGaCount,
        scorableSectionSummary,
        selectedKind,
        selectedPaper,
        selectedPaperYearSetKey,
        selectedSetupTypes.length,
    ]);

    const livePreview = useMemo(() => {
        const pool = selectedKind?.id === "paper_mode"
            ? paperQuestions
            : (selectedKind?.id === "full_length" ? generatedScorableQuestions : filteredPool);
        const sections = splitByCatalogSection(pool, questionMetaByUid);
        const typeCounts = { MCQ: 0, MSQ: 0, NAT: 0 };

        pool.forEach((question) => {
            const type = String(questionMetaByUid[question.question_uid]?.type || "").toUpperCase();
            if (typeCounts[type] != null) {
                typeCounts[type] += 1;
            }
        });

        return {
            total: pool.length,
            gaCount: sections.gaQuestions.length,
            csCount: sections.csQuestions.length,
            mcqCount: typeCounts.MCQ,
            msqCount: typeCounts.MSQ,
            natCount: typeCounts.NAT,
        };
    }, [filteredPool, generatedScorableQuestions, paperQuestions, questionMetaByUid, selectedKind?.id]);

    const patchSetupState = useCallback((patch) => {
        setSetupState((prev) => {
            const next = { ...prev, ...patch };
            const minYear = Number(next.minYear || prev.minYear || 2000);
            const maxYear = Number(next.maxYear || prev.maxYear || 2025);

            next.yearRangeStart = clampYear(next.yearRangeStart, minYear);
            next.yearRangeEnd = clampYear(next.yearRangeEnd, maxYear);
            if (next.yearRangeStart > next.yearRangeEnd) {
                next.yearRangeEnd = next.yearRangeStart;
            }

            next.yearFilterMode = ["all", "recent", "custom"].includes(String(next.yearFilterMode || "").trim().toLowerCase())
                ? String(next.yearFilterMode).trim().toLowerCase()
                : "all";
            next.customCount = clampQuestionCount(next.customCount);
            next.selectedTypes = normalizeSetupTypes(next.selectedTypes);
            next.includeSolvedQuestions = next.includeSolvedQuestions === true;
            return next;
        });
    }, []);

    const toggleSelection = useCallback((field, value) => {
        setSetupState((prev) => {
            const current = Array.isArray(prev[field]) ? prev[field] : [];
            const exists = current.includes(value);
            const nextValues = exists
                ? current.filter((entry) => entry !== value)
                : [...current, value];

            const next = {
                ...prev,
                [field]: nextValues,
            };

            if (field === "selectedTypes") {
                next.selectedTypes = normalizeSetupTypes(next.selectedTypes);
            }

            return next;
        });
    }, []);

    const resetSetupState = useCallback((kindId = selectedKindId) => {
        const minYear = structuredTags?.minYear || 2000;
        const maxYear = structuredTags?.maxYear || 2025;
        const defaultPaperKey = kindId === "paper_mode"
            ? (readyPapers[0]?.yearSetKey || paperCatalog[0]?.yearSetKey || "")
            : "";
        setSetupState(buildDefaultSetupState(minYear, maxYear, kindId, defaultPaperKey));
    }, [paperCatalog, readyPapers, selectedKindId, structuredTags?.maxYear, structuredTags?.minYear]);

    const handleContinueFromPortal = useCallback(() => {
        if (!selectedKindId) {
            return;
        }

        clearAttemptError();
        resetSetupState(selectedKindId);
        setStep("setup");
    }, [clearAttemptError, resetSetupState, selectedKindId]);

    const hydrateAptitudeQuestions = useCallback(async (questionList = []) => {
        const rows = Array.isArray(questionList) ? questionList : [];
        if (rows.length === 0) {
            return [];
        }

        return Promise.all(rows.map(async (question) => {
            const uid = String(question?.question_uid || "").trim();
            if (!uid.startsWith(APTITUDE_UID_PREFIX)) {
                return question;
            }

            const hasQuestionStem = String(question?.question || "").trim().length > 0;
            const hasOptions = Array.isArray(question?.options) && question.options.length > 0;
            const hasAnswer = String(question?.answerMeta?.answer ?? question?.answer ?? "").trim().length > 0;
            if (hasQuestionStem && hasOptions && hasAnswer) {
                return question;
            }

            try {
                return await AptitudeQuestionService.ensureQuestionDetail(question);
            } catch {
                return question;
            }
        }));
    }, []);

    const handleStartExam = useCallback(async () => {
        if (!selectedKind || !availability.canStart) {
            return;
        }

        let gaQuestions = [];
        let csQuestions = [];
        let durationMinutes = selectedKind.durationMinutes || 180;
        let strictSectionCounts = null;
        let selectedPaperLabel = "";

        if (selectedKind.id === "paper_mode") {
            gaQuestions = paperGaQuestions;
            csQuestions = paperCsQuestions;
            const requiredGaCount = Number.parseInt(
                String(selectedPaper?.requiredGaCount ?? MOCK_SECTION_COUNTS.GA),
                10
            );
            const requiredCsCount = Number.parseInt(
                String(selectedPaper?.requiredCsCount ?? MOCK_SECTION_COUNTS.CS),
                10
            );
            strictSectionCounts = {
                GA: Number.isFinite(requiredGaCount) ? Math.max(0, requiredGaCount) : MOCK_SECTION_COUNTS.GA,
                CS: Number.isFinite(requiredCsCount) ? Math.max(0, requiredCsCount) : MOCK_SECTION_COUNTS.CS,
            };
            const selectedPaperDurationMinutes = Number.parseInt(
                String(selectedPaper?.durationMinutes ?? ""),
                10
            );
            if (Number.isFinite(selectedPaperDurationMinutes) && selectedPaperDurationMinutes > 0) {
                durationMinutes = selectedPaperDurationMinutes;
            }
            selectedPaperLabel = selectedPaper?.label || QuestionService.formatYearSetLabel(selectedPaperYearSetKey || "");
        } else if (selectedKind.id === "full_length") {
            const selection = buildStrictGeneratedSelection(generatedScorableQuestions, questionMetaByUid);
            if (!selection) {
                return;
            }
            gaQuestions = selection.gaQuestions;
            csQuestions = selection.csQuestions;
            strictSectionCounts = { ...MOCK_SECTION_COUNTS };
        } else if (selectedKind.id === "custom") {
            const selection = buildCountBasedSelection(filteredPool, customCount, questionMetaByUid);
            gaQuestions = selection.gaQuestions;
            csQuestions = selection.csQuestions;
            durationMinutes = customDurationMinutes;
        } else {
            const selection = buildCountBasedSelection(
                filteredPool,
                selectedKind.fixedCount || 0,
                questionMetaByUid
            );
            gaQuestions = selection.gaQuestions;
            csQuestions = selection.csQuestions;
        }

        const hydratedGaQuestions = await hydrateAptitudeQuestions(gaQuestions);
        const hydratedCsQuestions = await hydrateAptitudeQuestions(csQuestions);
        const totalQuestions = gaQuestions.length + csQuestions.length;
        const startSection = hydratedGaQuestions.length > 0 ? "GA" : "CS";
        const started = startTest({
            gaQuestions: hydratedGaQuestions,
            csQuestions: hydratedCsQuestions,
            timeSeconds: durationMinutes * 60,
            startSection,
            meta: {
                kindId: selectedKind.id,
                kindTitle: selectedKind.title,
                strictSectionCounts,
                durationMinutes,
                questionCount: totalQuestions,
                selectedPaperYearSetKey,
                selectedPaperLabel,
                setup: {
                    ...setupState,
                    selectedPaperYearSetKey,
                    requiredSummary: availability.requiredSummary,
                },
            },
        });

        if (started) {
            clearAttemptError();
            setStep("exam");
        }
    }, [
        availability.canStart,
        availability.requiredSummary,
        customCount,
        customDurationMinutes,
        paperCsQuestions,
        paperGaQuestions,
        questionMetaByUid,
        hydrateAptitudeQuestions,
        generatedScorableQuestions,
        selectedKind,
        selectedPaper,
        selectedPaperYearSetKey,
        setupState,
        startTest,
        clearAttemptError,
    ]);

    const handleFastExitToLanding = useCallback(() => {
        exitInProgressRef.current = true;
        clearAttemptError();
        setIsCalculatorOpen(false);
        onExit?.();
    }, [clearAttemptError, onExit]);

    const handleExitToLanding = useCallback(() => {
        exitInProgressRef.current = true;
        clearAttemptError();
        setIsCalculatorOpen(false);
        if (testActive || testSubmitted || questions.length > 0) {
            endMockTest();
            setSelectedKindId(DEFAULT_MOCK_KIND_ID);
            setStep("portal");
        } else {
            setSelectedKindId(DEFAULT_MOCK_KIND_ID);
            setStep("portal");
        }
        onExit?.();
    }, [clearAttemptError, endMockTest, onExit, questions.length, testActive, testSubmitted]);

    const setupBanner = attemptError ? (
        <div className="mx-auto mt-4 w-full max-w-6xl rounded border border-[#e3b7b7] bg-[#fff2f2] px-4 py-3 text-sm text-[#9b2a2a]">
            {attemptError}
        </div>
    ) : null;

    const renderPreExamShell = (content) => (
        <div className="mocktest-root flex min-h-screen w-full flex-col bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_24%),linear-gradient(180deg,#eef4fb_0%,#f8fbff_18%,#f4f7fb_100%)] text-sm selection:bg-sky-100">
            <AppHeader onHomeNavigate={handleFastExitToLanding} />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {setupBanner}
                {content}
            </div>
        </div>
    );

    const renderExamLayout = (isReviewPhase = false) => (
        <div className="mocktest-root flex min-h-screen h-[100dvh] w-full flex-col overflow-y-auto bg-[#dcebf9] text-sm selection:bg-blue-200">
            <MockTestHeader
                timeLeft={timeLeft}
                onToggleCalculator={() => setIsCalculatorOpen((prev) => !prev)}
                isCalculatorOpen={isCalculatorOpen}
                calculatorButtonRef={calculatorButtonRef}
            />
            <CalculatorWidget
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                anchorRef={calculatorButtonRef}
            />

            <div className="flex min-h-0 flex-1 overflow-hidden">
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r border-[#b8c9d9] bg-white">
                    <MockTestQuestion isReviewPhase={isReviewPhase} />
                </div>

                <aside
                    className={`mocktest-sidebar relative shrink-0 overflow-visible transition-[width] duration-200 ease-in-out ${isPaletteCollapsed
                        ? "w-0 border-l-0 bg-transparent"
                        : "w-[var(--mock-sidebar-expanded-w)] border-l border-[#b8c9d9] bg-[#d7e8f7]"
                        }`}
                >
                    <QuestionPalette
                        isCollapsed={isPaletteCollapsed}
                        isReviewPhase={isReviewPhase}
                        onToggleCollapsed={() => setIsPaletteCollapsed((prev) => !prev)}
                    />
                </aside>
            </div>

            <MockTestActionBar
                isReviewPhase={isReviewPhase}
                onBackToResults={isReviewPhase ? () => setStep("result") : undefined}
                isPaletteCollapsed={isPaletteCollapsed}
                onExitAttempt={!isReviewPhase ? handleExitToLanding : undefined}
            />
        </div>
    );

    if (!isDesktop) {
        return (
            <div className="mocktest-root flex h-screen w-full items-center justify-center bg-[#dcebf9] p-6 text-center">
                <div className="w-full max-w-md rounded-lg border border-[#c5d4e2] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#223549]">Try on desktop</h2>
                    <p className="mt-2 text-sm text-[#5f7285]">
                        Mock Test currently requires a minimum width of 1024px.
                    </p>
                    <button
                        type="button"
                        onClick={handleExitToLanding}
                        className="mt-4 rounded border border-[#aebccc] bg-white px-4 py-2 text-sm font-semibold text-[#223549] hover:bg-[#f0f5f9]"
                    >
                        Back to Modes
                    </button>
                </div>
            </div>
        );
    }

    if (catalogLoading || aptitudeMockLoading || !isInitialized) {
        return <MockCatalogLoaderCard />;
    }

    if (catalogError) {
        return (
            <div className="mocktest-root flex h-screen w-full items-center justify-center bg-[#dcebf9] p-6 text-center">
                <div className="w-full max-w-lg rounded-lg border border-[#d9b7b7] bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-[#223549]">Mock catalog unavailable</h2>
                    <p className="mt-3 text-sm text-[#6a7f94]">{catalogError}</p>
                    <button
                        type="button"
                        onClick={handleExitToLanding}
                        className="mt-5 rounded border border-[#aebccc] bg-white px-4 py-2 text-sm font-semibold text-[#223549] hover:bg-[#f0f5f9]"
                    >
                        Back to Modes
                    </button>
                </div>
            </div>
        );
    }

    if (step === "portal" || step === "setup") {
        return renderPreExamShell(
            step === "portal" || !selectedKind ? (
                    <MockTestPortal
                        options={MOCK_KIND_OPTIONS}
                        selectedKindId={selectedKindId}
                        onSelectKind={setSelectedKindId}
                        onContinue={handleContinueFromPortal}
                        onBack={handleExitToLanding}
                        showBackButton={false}
                    />
                ) : (
                    <MockTestSetup
                        kind={selectedKind}
                        setupState={setupState}
                        subjects={mockSubjects}
                        availability={availability}
                        livePreview={livePreview}
                        paperOptions={paperCatalog}
                        selectedPaperYearSetKey={selectedPaperYearSetKey || ""}
                        customDurationMinutes={customDurationMinutes}
                        recentYearRangeLabel={`${recentYearStart} - ${setupState.maxYear}`}
                        onSelectPaper={(yearSetKey) => patchSetupState({ selectedPaperYearSetKey: yearSetKey })}
                        onPatchState={patchSetupState}
                        onToggleSelection={toggleSelection}
                        onBack={() => setStep("portal")}
                        backLabel="Back to Modes"
                        onReset={() => resetSetupState(selectedKind.id)}
                        onStart={handleStartExam}
                        showBackButton={true}
                    />
                )
        );
    }

    if (step === "result" || (testSubmitted && step !== "review")) {
        return (
            <MockTestResults
                onExit={handleExitToLanding}
                onReview={() => setStep("review")}
            />
        );
    }

    if (step === "review" && questions.length > 0 && resultSummary) {
        return renderExamLayout(true);
    }

    if (testActive && questions.length > 0) {
        return renderExamLayout(false);
    }

    return (
        renderPreExamShell(
            <MockTestPortal
                options={MOCK_KIND_OPTIONS}
                selectedKindId={selectedKindId}
                onSelectKind={setSelectedKindId}
                onContinue={handleContinueFromPortal}
                onBack={handleExitToLanding}
                showBackButton={false}
            />
        )
    );
};

export default MockTestShell;
