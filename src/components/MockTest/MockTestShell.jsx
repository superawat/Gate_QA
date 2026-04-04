import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMockTest } from "../../contexts/MockTestContext";
import { useFilterState } from "../../contexts/FilterContext";
import { QuestionService } from "../../services/QuestionService";
import { AnswerService } from "../../services/AnswerService";
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
const STRICT_SECTION_COUNTS = {
    GA: 10,
    CS: 55,
};

const MOCK_KIND_OPTIONS = [
    {
        id: "full_length",
        title: "Full-length GATE-style",
        subtitle: "Standard full mock with fixed count and duration.",
        facts: { count: "65 Questions", duration: "180 min" },
        fixedCount: 65,
        durationMinutes: 180,
        durationLabel: "180 min",
    },
    {
        id: "paper_mode",
        title: "Real paper mode",
        subtitle: "Pick year/set and attempt questions in deterministic order.",
        facts: { count: "Paper-specific", duration: "180 min" },
        fixedCount: null,
        durationMinutes: 180,
        durationLabel: "180 min",
    },
    {
        id: "pattern_random",
        title: "Random generated exam (GATE pattern)",
        subtitle: "10 GA + 55 Core CSE, sampled once and locked.",
        facts: { count: "10 GA + 55 Core", duration: "180 min" },
        fixedCount: 65,
        durationMinutes: 180,
        durationLabel: "180 min",
    },
    {
        id: "mini_15",
        title: "Mini mock 15Q",
        subtitle: "Quick mock with compact duration.",
        facts: { count: "15 Questions", duration: "40 min" },
        fixedCount: 15,
        durationMinutes: 40,
        durationLabel: "40 min",
    },
    {
        id: "mini_25",
        title: "Mini mock 25Q",
        subtitle: "Medium-size mock for focused practice.",
        facts: { count: "25 Questions", duration: "70 min" },
        fixedCount: 25,
        durationMinutes: 70,
        durationLabel: "70 min",
    },
    {
        id: "custom",
        title: "Custom / Topic-based test",
        subtitle: "Choose filters, count (up to 65), and adaptive duration.",
        facts: { count: "1 to 65 Questions", duration: "Adaptive" },
        fixedCount: null,
        durationMinutes: null,
        durationLabel: "Adaptive",
    },
];

const TYPE_OPTIONS = ["MCQ", "MSQ", "NAT"];
const OBJECTIVE_TYPES = new Set(["MCQ", "MSQ", "NAT"]);

const isGaQuestion = (question = {}) => {
    const title = String(question.title || "");
    return question.subject === "General Aptitude" || /\bGA\b/i.test(title);
};

const shuffle = (rows = []) => {
    const next = [...rows];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }
    return next;
};

const sortPaperQuestions = (rows = []) => {
    return [...rows].sort((left, right) => {
        const leftKey = String(left.exam_uid || left.title || left.question_uid || "");
        const rightKey = String(right.exam_uid || right.title || right.question_uid || "");
        return leftKey.localeCompare(rightKey, undefined, { numeric: true, sensitivity: "base" });
    });
};

const computeDurationForCustomCount = (rawCount) => {
    const count = Math.max(1, Math.min(65, Number.parseInt(String(rawCount || "1"), 10) || 1));
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

const clampYear = (value, fallback) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const clampQuestionCount = (value) => {
    return Math.max(1, Math.min(65, Number.parseInt(String(value || "1"), 10) || 1));
};

const normalizeSetupTypes = (rawTypes = []) => {
    const values = Array.isArray(rawTypes) ? rawTypes : [];
    const normalized = values
        .map((type) => String(type || "").trim().toUpperCase())
        .filter((type) => TYPE_OPTIONS.includes(type));
    return TYPE_OPTIONS.filter((type) => normalized.includes(type));
};

const isObjectiveType = (typeToken = "") => {
    const raw = String(typeToken || "").trim().toUpperCase();
    return OBJECTIVE_TYPES.has(raw);
};

const splitBySection = (rows = []) => {
    const gaQuestions = [];
    const csQuestions = [];
    rows.forEach((question) => {
        if (isGaQuestion(question)) {
            gaQuestions.push(question);
        } else {
            csQuestions.push(question);
        }
    });
    return { gaQuestions, csQuestions };
};

const formatSectionAvailability = (gaCount, csCount) => `${gaCount} GA / ${csCount} Core`;

const buildStrictSectionSelection = (rows = [], { deterministic = false } = {}) => {
    const { gaQuestions: gaPool, csQuestions: csPool } = splitBySection(rows);
    if (gaPool.length < STRICT_SECTION_COUNTS.GA || csPool.length < STRICT_SECTION_COUNTS.CS) {
        return null;
    }

    const pick = deterministic ? sortPaperQuestions : shuffle;
    return {
        gaQuestions: pick(gaPool).slice(0, STRICT_SECTION_COUNTS.GA),
        csQuestions: pick(csPool).slice(0, STRICT_SECTION_COUNTS.CS),
    };
};

const buildCountBasedSelection = (rows = [], count = 0) => {
    const limited = shuffle(rows).slice(0, Math.max(0, count));
    return splitBySection(limited);
};

const MockTestShell = ({ onExit, initialStage = "setup", onStageChange }) => {
    const {
        testActive,
        startTest,
        testSubmitted,
        timeLeft,
        questions,
        endMockTest,
        attemptMeta,
        attemptError,
        clearAttemptError,
    } = useMockTest();
    const { allQuestions, structuredTags, isInitialized } = useFilterState();

    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window === "undefined") return true;
        return window.innerWidth >= 1024;
    });
    const [step, setStep] = useState(() => {
        // If we arrive with initialStage="exam" but have no active test, fall back to portal
        if (initialStage === "exam") return "exam";
        return "portal";
    });
    const [selectedKindId, setSelectedKindId] = useState("");
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem(PALETTE_COLLAPSE_STORAGE_KEY) === "1";
    });
    const calculatorButtonRef = useRef(null);
    const [setupState, setSetupState] = useState({
        minYear: 2000,
        maxYear: 2025,
        yearRangeStart: 2000,
        yearRangeEnd: 2025,
        selectedYearSets: [],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedTypes: [...TYPE_OPTIONS],
        paperYear: "",
        paperSet: "",
        customCount: 65,
    });

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
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setIsCalculatorOpen((prev) => !prev);
            }
            if (event.key === "Escape") {
                setIsCalculatorOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (!isInitialized) return;
        const minYear = structuredTags?.minYear || 2000;
        const maxYear = structuredTags?.maxYear || 2025;
        setSetupState((prev) => ({
            ...prev,
            minYear,
            maxYear,
            yearRangeStart: minYear,
            yearRangeEnd: maxYear,
        }));
    }, [isInitialized, structuredTags?.minYear, structuredTags?.maxYear]);

    useEffect(() => {
        if (testActive) {
            clearAttemptError();
            setStep("exam");
            if (attemptMeta?.kindId) {
                setSelectedKindId(attemptMeta.kindId);
            }
        }
    }, [attemptMeta?.kindId, clearAttemptError, testActive]);

    useEffect(() => {
        if (testSubmitted && step === "exam") {
            setStep("result");
        }
    }, [step, testSubmitted]);

    // Issue 008: Sync step changes to URL via onStageChange
    useEffect(() => {
        if (!onStageChange) return;
        if (step === "exam" || step === "review") {
            onStageChange("exam");
        } else {
            onStageChange("setup");
        }
    }, [step, onStageChange]);

    const selectedKind = useMemo(
        () => MOCK_KIND_OPTIONS.find((kind) => kind.id === selectedKindId) || null,
        [selectedKindId]
    );

    const subjectBySlug = useMemo(() => {
        const map = new Map();
        (structuredTags?.subjects || []).forEach((subject) => {
            map.set(subject.slug, subject);
        });
        return map;
    }, [structuredTags?.subjects]);

    const subtopicParentMap = useMemo(() => {
        const map = new Map();
        const entries = structuredTags?.structuredSubtopics || {};
        Object.keys(entries).forEach((subjectSlug) => {
            (entries[subjectSlug] || []).forEach((subtopic) => {
                if (subtopic?.slug) {
                    map.set(subtopic.slug, subjectSlug);
                }
            });
        });
        return map;
    }, [structuredTags?.structuredSubtopics]);

    const availableSubtopics = useMemo(() => {
        if (!structuredTags?.structuredSubtopics) return [];
        if (!setupState.selectedSubjects.length) return [];

        const rows = [];
        setupState.selectedSubjects.forEach((subjectSlug) => {
            const subjectLabel = subjectBySlug.get(subjectSlug)?.label || subjectSlug;
            const entries = structuredTags.structuredSubtopics[subjectSlug] || [];
            entries.forEach((subtopic) => {
                rows.push({
                    slug: subtopic.slug,
                    label: `${subjectLabel} - ${subtopic.label}`,
                });
            });
        });
        return rows.sort((left, right) => left.label.localeCompare(right.label));
    }, [setupState.selectedSubjects, structuredTags?.structuredSubtopics, subjectBySlug]);

    const yearSetRows = structuredTags?.yearSets || [];

    const paperYearOptions = useMemo(() => {
        const uniqueYears = new Set();
        yearSetRows.forEach((yearSet) => {
            if (Number.isFinite(yearSet.year)) {
                uniqueYears.add(yearSet.year);
            }
        });
        return Array.from(uniqueYears).sort((a, b) => b - a);
    }, [yearSetRows]);

    const paperSetOptions = useMemo(() => {
        const selectedYear = Number.parseInt(String(setupState.paperYear || ""), 10);
        if (!Number.isFinite(selectedYear)) return [];
        return yearSetRows.filter((yearSet) => yearSet.year === selectedYear);
    }, [setupState.paperYear, yearSetRows]);

    const selectedPaperYearSetKey = useMemo(() => {
        if (selectedKind?.id !== "paper_mode") return null;
        if (!setupState.paperYear) return null;
        if (paperSetOptions.length === 0) return null;
        if (paperSetOptions.length === 1) {
            return paperSetOptions[0].key;
        }
        if (!setupState.paperSet) return null;
        const selectedSet = Number.parseInt(String(setupState.paperSet), 10);
        const match = paperSetOptions.find((row) => (row.set || 0) === (Number.isFinite(selectedSet) ? selectedSet : 0));
        return match?.key || null;
    }, [paperSetOptions, selectedKind?.id, setupState.paperYear, setupState.paperSet]);

    const selectedSetupTypes = useMemo(
        () => normalizeSetupTypes(setupState.selectedTypes),
        [setupState.selectedTypes]
    );

    const filteredPool = useMemo(() => {
        const minYear = setupState.minYear;
        const maxYear = setupState.maxYear;
        const rangeStart = Math.max(minYear, Math.min(maxYear, clampYear(setupState.yearRangeStart, minYear)));
        const rangeEnd = Math.max(rangeStart, Math.min(maxYear, clampYear(setupState.yearRangeEnd, maxYear)));

        const selectedYearSetSet = new Set(setupState.selectedYearSets);
        const selectedSubjectSet = new Set(setupState.selectedSubjects);
        const selectedTypeSet = new Set(selectedSetupTypes.map((value) => String(value || "").toUpperCase()));
        const isRangeConstrained = rangeStart > minYear || rangeEnd < maxYear;

        const subtopicsByParentSubject = new Map();
        setupState.selectedSubtopics.forEach((subtopicSlug) => {
            const parentSubject = subtopicParentMap.get(subtopicSlug);
            if (!parentSubject) return;
            if (!subtopicsByParentSubject.has(parentSubject)) {
                subtopicsByParentSubject.set(parentSubject, new Set());
            }
            subtopicsByParentSubject.get(parentSubject).add(subtopicSlug);
        });

        return allQuestions.filter((question) => {
            const answer = AnswerService.getAnswerForQuestion(question);
            const resolvedType = answer
                ? QuestionService.normalizeTypeToken(answer.type)
                : QuestionService.normalizeTypeToken(question?.type);

            // Issue 004: Exclude non-objective (subjective) questions from mock pool.
            // Resolve from answer mapping first because many questions don't carry top-level `type`.
            if (!isObjectiveType(resolvedType)) {
                return false;
            }

            const examYear = Number(question?.exam?.year || 0);
            if (isRangeConstrained) {
                if (!(examYear > 0 && examYear >= rangeStart && examYear <= rangeEnd)) {
                    return false;
                }
            }

            if (selectedYearSetSet.size > 0) {
                const questionYearSet = question?.exam?.yearSetKey;
                if (!questionYearSet || !selectedYearSetSet.has(questionYearSet)) {
                    return false;
                }
            }

            if (selectedSubjectSet.size > 0) {
                const questionSubject = question?.subjectSlug || "unknown";
                if (!selectedSubjectSet.has(questionSubject)) {
                    return false;
                }
            }

            if (selectedSetupTypes.length === 0) {
                return false;
            }
            if (selectedSetupTypes.length < TYPE_OPTIONS.length) {
                if (!selectedTypeSet.has(String(resolvedType || "").toUpperCase())) {
                    return false;
                }
            }

            if (subtopicsByParentSubject.size > 0) {
                const questionSubject = question?.subjectSlug || "unknown";
                const neededSubtopics = subtopicsByParentSubject.get(questionSubject);
                if (neededSubtopics) {
                    const questionSubtopics = Array.isArray(question?.subtopics)
                        ? question.subtopics.map((subtopic) => QuestionService.slugifyToken(subtopic?.slug || subtopic?.label || subtopic))
                        : [];
                    const matched = questionSubtopics.some((subtopicSlug) => neededSubtopics.has(subtopicSlug));
                    if (!matched) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [
        allQuestions,
        setupState.minYear,
        setupState.maxYear,
        setupState.yearRangeStart,
        setupState.yearRangeEnd,
        setupState.selectedYearSets,
        setupState.selectedSubjects,
        setupState.selectedSubtopics,
        selectedSetupTypes,
        subtopicParentMap,
    ]);

    const filteredPoolSections = useMemo(() => splitBySection(filteredPool), [filteredPool]);
    const filteredGaCount = filteredPoolSections.gaQuestions.length;
    const filteredCsCount = filteredPoolSections.csQuestions.length;
    const filteredSectionSummary = useMemo(
        () => formatSectionAvailability(filteredGaCount, filteredCsCount),
        [filteredGaCount, filteredCsCount]
    );

    const paperPool = useMemo(() => {
        if (!selectedPaperYearSetKey) {
            return [];
        }
        return filteredPool.filter((question) => question?.exam?.yearSetKey === selectedPaperYearSetKey);
    }, [filteredPool, selectedPaperYearSetKey]);

    const paperPoolSections = useMemo(() => splitBySection(paperPool), [paperPool]);
    const paperGaCount = paperPoolSections.gaQuestions.length;
    const paperCsCount = paperPoolSections.csQuestions.length;
    const paperSectionSummary = useMemo(
        () => formatSectionAvailability(paperGaCount, paperCsCount),
        [paperGaCount, paperCsCount]
    );

    const customCount = clampQuestionCount(setupState.customCount);
    const customDurationMinutes = computeDurationForCustomCount(customCount);

    const availability = useMemo(() => {
        if (!selectedKind) {
            return {
                canStart: false,
                requiredSummary: "N/A",
                availableSummary: "0",
                message: "Select a test kind to continue.",
            };
        }

        if (selectedSetupTypes.length === 0) {
            return {
                canStart: false,
                requiredSummary: "N/A",
                availableSummary: "0",
                message: "Select at least one question type (MCQ/MSQ/NAT).",
            };
        }

        if (selectedKind.id === "paper_mode") {
            if (!selectedPaperYearSetKey) {
                return {
                    canStart: false,
                    requiredSummary: "10 GA + 55 Core",
                    availableSummary: "0",
                    message: "Select year and set to start real paper mode.",
                };
            }
            const strictPick = buildStrictSectionSelection(paperPool, { deterministic: true });
            if (!strictPick) {
                return {
                    canStart: false,
                    requiredSummary: "10 GA + 55 Core",
                    availableSummary: paperSectionSummary,
                    message: `Only ${paperGaCount} GA and ${paperCsCount} core questions available for your filters; reduce filters or reduce count.`,
                };
            }
            return {
                canStart: true,
                requiredSummary: "10 GA + 55 Core",
                availableSummary: paperSectionSummary,
                message: "",
            };
        }

        if (selectedKind.id === "pattern_random" || selectedKind.id === "full_length") {
            if (filteredGaCount < STRICT_SECTION_COUNTS.GA) {
                return {
                    canStart: false,
                    requiredSummary: "10 GA + 55 Core",
                    availableSummary: filteredSectionSummary,
                    message: `Only ${filteredGaCount} GA available for your filters; reduce filters or reduce count.`,
                };
            }
            if (filteredCsCount < STRICT_SECTION_COUNTS.CS) {
                return {
                    canStart: false,
                    requiredSummary: "10 GA + 55 Core",
                    availableSummary: filteredSectionSummary,
                    message: `Only ${filteredCsCount} core questions available for your filters; reduce filters or reduce count.`,
                };
            }
            return {
                canStart: true,
                requiredSummary: "10 GA + 55 Core",
                availableSummary: filteredSectionSummary,
                message: "",
            };
        }

        const requiredCount =
            selectedKind.id === "custom" ? customCount : (selectedKind.fixedCount || 0);
        if (filteredPool.length < requiredCount) {
            return {
                canStart: false,
                requiredSummary: `${requiredCount}`,
                availableSummary: `${filteredPool.length}`,
                message: `Only ${filteredPool.length} available for your filters; reduce filters or reduce count.`,
            };
        }

        return {
            canStart: true,
            requiredSummary: `${requiredCount}`,
            availableSummary: `${filteredPool.length}`,
            message: "",
        };
    }, [
        customCount,
        filteredCsCount,
        filteredGaCount,
        filteredPool.length,
        filteredSectionSummary,
        paperCsCount,
        paperGaCount,
        paperPool,
        paperSectionSummary,
        selectedKind,
        selectedPaperYearSetKey,
        selectedSetupTypes.length,
    ]);

    // Issue 007: Live preview summary — derived from the same filteredPool
    // that will be used to build the attempt when "Start Mock" is clicked.
    const livePreview = useMemo(() => {
        const pool = selectedKind?.id === "paper_mode" ? paperPool : filteredPool;
        const sections = splitBySection(pool);
        let mcqCount = 0;
        let msqCount = 0;
        let natCount = 0;

        pool.forEach((question) => {
            const answer = AnswerService.getAnswerForQuestion(question);
            const resolvedType = answer
                ? QuestionService.normalizeTypeToken(answer.type)
                : QuestionService.normalizeTypeToken(question?.type);
            const upper = String(resolvedType || "").toUpperCase();
            if (upper === "MCQ") mcqCount += 1;
            else if (upper === "MSQ") msqCount += 1;
            else if (upper === "NAT") natCount += 1;
        });

        return {
            total: pool.length,
            gaCount: sections.gaQuestions.length,
            csCount: sections.csQuestions.length,
            mcqCount,
            msqCount,
            natCount,
        };
    }, [filteredPool, paperPool, selectedKind?.id]);

    const patchSetupState = useCallback((patch) => {
        setSetupState((prev) => {
            const next = { ...prev, ...patch };

            next.yearRangeStart = clampYear(next.yearRangeStart, prev.minYear);
            next.yearRangeEnd = clampYear(next.yearRangeEnd, prev.maxYear);
            if (next.yearRangeStart > next.yearRangeEnd) {
                next.yearRangeEnd = next.yearRangeStart;
            }

            next.customCount = clampQuestionCount(next.customCount);
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

            if (field === "selectedSubjects") {
                const activeSubjects = new Set(next.selectedSubjects);
                next.selectedSubtopics = next.selectedSubtopics.filter((subtopicSlug) => {
                    const parentSubject = subtopicParentMap.get(subtopicSlug);
                    return !parentSubject || activeSubjects.has(parentSubject);
                });
            }

            if (field === "selectedSubtopics") {
                const subjectSet = new Set(next.selectedSubjects);
                next.selectedSubtopics.forEach((subtopicSlug) => {
                    const parentSubject = subtopicParentMap.get(subtopicSlug);
                    if (parentSubject) {
                        subjectSet.add(parentSubject);
                    }
                });
                next.selectedSubjects = Array.from(subjectSet);
            }

            return next;
        });
    }, [subtopicParentMap]);

    const handleContinueFromPortal = useCallback(() => {
        if (!selectedKindId) return;
        const minYear = structuredTags?.minYear || 2000;
        const maxYear = structuredTags?.maxYear || 2025;
        setSetupState({
            minYear,
            maxYear,
            yearRangeStart: minYear,
            yearRangeEnd: maxYear,
            selectedYearSets: [],
            selectedSubjects: [],
            selectedSubtopics: [],
            selectedTypes: [...TYPE_OPTIONS],
            paperYear: "",
            paperSet: "",
            customCount: selectedKindId === "custom" ? 25 : 65,
        });
        clearAttemptError();
        setStep("setup");
    }, [clearAttemptError, selectedKindId, structuredTags?.maxYear, structuredTags?.minYear]);

    // Issue 007: Reset setup filters to defaults without changing step or kind
    const handleResetSetup = useCallback(() => {
        const minYear = structuredTags?.minYear || 2000;
        const maxYear = structuredTags?.maxYear || 2025;
        setSetupState({
            minYear,
            maxYear,
            yearRangeStart: minYear,
            yearRangeEnd: maxYear,
            selectedYearSets: [],
            selectedSubjects: [],
            selectedSubtopics: [],
            selectedTypes: [...TYPE_OPTIONS],
            paperYear: "",
            paperSet: "",
            customCount: selectedKindId === "custom" ? 25 : 65,
        });
    }, [selectedKindId, structuredTags?.maxYear, structuredTags?.minYear]);

    const handleStartExam = useCallback(() => {
        if (!selectedKind || !availability.canStart) return;

        let gaQuestions = [];
        let csQuestions = [];
        let durationMinutes = selectedKind.durationMinutes || 180;
        let startSection = "GA";
        let strictSectionCounts = null;

        if (selectedKind.id === "paper_mode") {
            const strictPick = buildStrictSectionSelection(paperPool, { deterministic: true });
            if (!strictPick) {
                return;
            }
            gaQuestions = strictPick.gaQuestions;
            csQuestions = strictPick.csQuestions;
            strictSectionCounts = { ...STRICT_SECTION_COUNTS };
            durationMinutes = selectedKind.durationMinutes || 180;
            startSection = "GA";
        } else if (selectedKind.id === "pattern_random" || selectedKind.id === "full_length") {
            const strictPick = buildStrictSectionSelection(filteredPool, { deterministic: false });
            if (!strictPick) {
                return;
            }
            gaQuestions = strictPick.gaQuestions;
            csQuestions = strictPick.csQuestions;
            strictSectionCounts = { ...STRICT_SECTION_COUNTS };
            durationMinutes = selectedKind.durationMinutes || 180;
            startSection = "GA";
        } else if (selectedKind.id === "custom") {
            const split = buildCountBasedSelection(filteredPool, customCount);
            gaQuestions = split.gaQuestions;
            csQuestions = split.csQuestions;
            durationMinutes = customDurationMinutes;
            startSection = gaQuestions.length > 0 ? "GA" : "CS";
        } else {
            const fixedCount = selectedKind.fixedCount || 0;
            const split = buildCountBasedSelection(filteredPool, fixedCount);
            gaQuestions = split.gaQuestions;
            csQuestions = split.csQuestions;
            durationMinutes = selectedKind.durationMinutes || 180;
            startSection = gaQuestions.length > 0 ? "GA" : "CS";
        }

        const started = startTest({
            gaQuestions,
            csQuestions,
            timeSeconds: durationMinutes * 60,
            startSection,
            meta: {
                kindId: selectedKind.id,
                strictSectionCounts,
                setup: {
                    ...setupState,
                    selectedPaperYearSetKey,
                    requiredSummary: availability.requiredSummary,
                },
            },
        });

        if (import.meta.env.DEV) {
            console.info("[MockStart] Attempt generation", {
                kindId: selectedKind.id,
                eligiblePool: filteredPool.length,
                selectedCount: gaQuestions.length + csQuestions.length,
                selectedGa: gaQuestions.length,
                selectedCs: csQuestions.length,
            });
        }

        if (started) {
            clearAttemptError();
            setStep("exam");
        }
    }, [
        availability.canStart,
        availability.requiredSummary,
        customCount,
        customDurationMinutes,
        filteredPool,
        paperPool,
        selectedKind,
        selectedPaperYearSetKey,
        setupState,
        startTest,
        clearAttemptError,
    ]);

    const handleExitToLanding = useCallback(() => {
        endMockTest();
        clearAttemptError();
        setIsCalculatorOpen(false);
        setStep("portal");
        setSelectedKindId("");
        onExit();
    }, [clearAttemptError, endMockTest, onExit]);

    const renderExamLayout = (isReviewPhase = false) => {
        return (
            <div className="mocktest-root flex h-screen w-full flex-col overflow-hidden bg-[#dcebf9] text-sm selection:bg-blue-200">
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
                        <MockTestQuestion
                            isReviewPhase={isReviewPhase}
                        />
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
                />
            </div>
        );
    };

    if (!isDesktop) {
        return (
            <div className="mocktest-root flex h-screen w-full items-center justify-center bg-[#dcebf9] p-6 text-center">
                <div className="w-full max-w-md rounded-lg border border-[#c5d4e2] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#223549]">Try on desktop</h2>
                    <p className="mt-2 text-sm text-[#5f7285]">
                        Mock Test is optimized for desktop screens (minimum width 1024px).
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

    if (attemptError && !testActive && questions.length === 0) {
        return (
            <div className="mocktest-root flex h-screen w-full items-center justify-center bg-[#dcebf9] p-4">
                <div className="rounded border border-[#c5d4e2] bg-white p-5 text-center shadow-sm">
                    <p className="text-base font-semibold text-[#2c4054]">{attemptError}</p>
                    <button
                        type="button"
                        onClick={() => {
                            clearAttemptError();
                            setStep("portal");
                        }}
                        className="mt-3 rounded border border-[#aebccc] bg-white px-4 py-2 text-sm font-semibold text-[#223549] hover:bg-[#f0f5f9]"
                    >
                        Back to Portal
                    </button>
                </div>
            </div>
        );
    }

    if (step === "portal" || step === "setup") {
        return (
            <div className="mocktest-root flex h-screen w-full flex-col overflow-hidden bg-[#dcebf9] text-sm selection:bg-blue-200">
                {step === "portal" || !selectedKind ? (
                    <MockTestPortal
                        options={MOCK_KIND_OPTIONS}
                        selectedKindId={selectedKindId}
                        onSelectKind={setSelectedKindId}
                        onContinue={handleContinueFromPortal}
                        onBack={handleExitToLanding}
                    />
                ) : (
                    <MockTestSetup
                        kind={selectedKind}
                        setupState={setupState}
                        yearSets={yearSetRows}
                        subjects={structuredTags?.subjects || []}
                        availableSubtopics={availableSubtopics}
                        availability={availability}
                        livePreview={livePreview}
                        paperYearOptions={paperYearOptions}
                        paperSetOptions={paperSetOptions}
                        customDurationMinutes={customDurationMinutes}
                        onPatchState={patchSetupState}
                        onToggleSelection={toggleSelection}
                        onBack={() => setStep("portal")}
                        onReset={handleResetSetup}
                        onStart={handleStartExam}
                    />
                )}
            </div>
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

    if (step === "review" && questions.length > 0) {
        return renderExamLayout(true);
    }

    if (!testActive || questions.length === 0) {
        return (
            <div className="mocktest-root flex h-screen w-full items-center justify-center bg-[#dcebf9] p-4">
                <div className="rounded border border-[#c5d4e2] bg-white p-5 text-center shadow-sm">
                    <p className="text-base font-semibold text-[#2c4054]">Could not start a valid mock attempt.</p>
                    <button
                        type="button"
                        onClick={() => setStep("portal")}
                        className="mt-3 rounded border border-[#aebccc] bg-white px-4 py-2 text-sm font-semibold text-[#223549] hover:bg-[#f0f5f9]"
                    >
                        Back to Portal
                    </button>
                </div>
            </div>
        );
    }

    return renderExamLayout(false);
};

export default MockTestShell;
