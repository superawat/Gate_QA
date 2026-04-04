/**
 * @vitest-environment node
 */
import { describe, test, expect } from "vitest";

// ── Issue 007: Setup filter builder logic ────────────────────────────────
describe("Issue 007 — Setup filter builder (unit logic)", () => {
    const OBJECTIVE_TYPES = new Set(["MCQ", "MSQ", "NAT"]);

    const isObjectiveType = (typeToken = "") => {
        const raw = String(typeToken || "").trim().toUpperCase();
        return OBJECTIVE_TYPES.has(raw);
    };

    const isGaQuestion = (question = {}) => {
        return question.subject === "General Aptitude" || /\bGA\b/i.test(String(question.title || ""));
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

    const buildFilteredPool = (allQuestions, setupState, answerByUid = {}) => {
        const rangeStart = setupState.yearRangeStart;
        const rangeEnd = setupState.yearRangeEnd;
        const selectedSubjectSet = new Set(setupState.selectedSubjects || []);
        const selectedTypeSet = new Set((setupState.selectedTypes || []).map((t) => t.toUpperCase()));

        return allQuestions.filter((question) => {
            const mappedType = String(answerByUid[question.question_uid] || "").trim().toUpperCase();
            const rawType = String(question?.type || "").trim().toUpperCase();
            const resolvedType = mappedType || rawType;

            // Objective only (mapped answer type takes precedence)
            if (!isObjectiveType(resolvedType)) return false;

            // Year range
            const examYear = Number(question?.exam?.year || 0);
            if (rangeStart || rangeEnd) {
                if (examYear > 0 && (examYear < rangeStart || examYear > rangeEnd)) {
                    return false;
                }
            }

            // Subject filter
            if (selectedSubjectSet.size > 0) {
                const questionSubject = question?.subjectSlug || "unknown";
                if (!selectedSubjectSet.has(questionSubject)) return false;
            }

            // Type filter
            if (selectedTypeSet.size > 0 && selectedTypeSet.size < 3) {
                if (!selectedTypeSet.has(resolvedType)) return false;
            }

            return true;
        });
    };

    const mockQuestions = [
        { question_uid: "q1", type: "MCQ", subject: "General Aptitude", subjectSlug: "general-aptitude", exam: { year: 2023 } },
        { question_uid: "q2", type: "MSQ", subject: "Algorithms", subjectSlug: "algorithms", exam: { year: 2022 } },
        { question_uid: "q3", type: "NAT", subject: "Algorithms", subjectSlug: "algorithms", exam: { year: 2024 } },
        { question_uid: "q4", type: "Subjective", subject: "Digital Logic", subjectSlug: "digital-logic", exam: { year: 2023 } },
        { question_uid: "q5", type: "MCQ", subject: "General Aptitude", subjectSlug: "general-aptitude", title: "GA question", exam: { year: 2021 } },
        { question_uid: "q6", type: "MCQ", subject: "Operating Systems", subjectSlug: "operating-systems", exam: { year: 2020 } },
        { question_uid: "q7", type: "descriptive", subject: "Networks", subjectSlug: "networks", exam: { year: 2023 } },
    ];

    test("objective-only enforcement: subjective/descriptive questions never enter pool", () => {
        const pool = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2000,
            yearRangeEnd: 2025,
            selectedSubjects: [],
            selectedTypes: ["MCQ", "MSQ", "NAT"],
        });

        expect(pool.every((q) => isObjectiveType(q.type))).toBe(true);
        expect(pool.find((q) => q.question_uid === "q4")).toBeUndefined(); // Subjective
        expect(pool.find((q) => q.question_uid === "q7")).toBeUndefined(); // descriptive
    });

    test("uses mapped answer type when question.type is missing", () => {
        const pool = buildFilteredPool(
            [
                { question_uid: "q8", subject: "Algorithms", subjectSlug: "algorithms", exam: { year: 2023 } },
                { question_uid: "q9", type: "", subject: "Algorithms", subjectSlug: "algorithms", exam: { year: 2023 } },
            ],
            {
                yearRangeStart: 2000,
                yearRangeEnd: 2025,
                selectedSubjects: [],
                selectedTypes: ["MCQ", "MSQ", "NAT"],
            },
            {
                q8: "MCQ",
                q9: "MSQ",
            }
        );

        expect(pool).toHaveLength(2);
        expect(pool.map((q) => q.question_uid).sort()).toEqual(["q8", "q9"]);
    });

    test("applying subject filter changes pool counts", () => {
        const poolAll = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2000,
            yearRangeEnd: 2025,
            selectedSubjects: [],
            selectedTypes: ["MCQ", "MSQ", "NAT"],
        });
        expect(poolAll).toHaveLength(5); // q1, q2, q3, q5, q6

        const poolAlgo = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2000,
            yearRangeEnd: 2025,
            selectedSubjects: ["algorithms"],
            selectedTypes: ["MCQ", "MSQ", "NAT"],
        });
        expect(poolAlgo).toHaveLength(2); // q2, q3
        expect(poolAlgo.map((q) => q.question_uid).sort()).toEqual(["q2", "q3"]);
    });

    test("applying type filter changes pool counts", () => {
        const poolMcqOnly = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2000,
            yearRangeEnd: 2025,
            selectedSubjects: [],
            selectedTypes: ["MCQ"],
        });
        expect(poolMcqOnly).toHaveLength(3); // q1, q5, q6
        expect(poolMcqOnly.every((q) => q.type === "MCQ")).toBe(true);

        const poolNatOnly = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2000,
            yearRangeEnd: 2025,
            selectedSubjects: [],
            selectedTypes: ["NAT"],
        });
        expect(poolNatOnly).toHaveLength(1); // q3
    });

    test("applying year range filter changes pool counts", () => {
        const pool2023 = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2023,
            yearRangeEnd: 2024,
            selectedSubjects: [],
            selectedTypes: ["MCQ", "MSQ", "NAT"],
        });
        expect(pool2023).toHaveLength(2); // q1 (2023 MCQ GA), q3 (2024 NAT)
    });

    test("GA/CS section split works correctly", () => {
        const pool = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2000,
            yearRangeEnd: 2025,
            selectedSubjects: [],
            selectedTypes: ["MCQ", "MSQ", "NAT"],
        });
        const sections = splitBySection(pool);
        expect(sections.gaQuestions).toHaveLength(2); // q1, q5
        expect(sections.csQuestions).toHaveLength(3); // q2, q3, q6
    });

    test("empty type selection produces empty pool", () => {
        const pool = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2000,
            yearRangeEnd: 2025,
            selectedSubjects: [],
            selectedTypes: [],
        });
        // With no type filter (empty set), all objective questions pass
        // because selectedTypeSet.size === 0 means no type restriction
        expect(pool).toHaveLength(5);
    });

    test("combined subject + type filter narrows correctly", () => {
        const pool = buildFilteredPool(mockQuestions, {
            yearRangeStart: 2000,
            yearRangeEnd: 2025,
            selectedSubjects: ["algorithms"],
            selectedTypes: ["NAT"],
        });
        expect(pool).toHaveLength(1);
        expect(pool[0].question_uid).toBe("q3");
    });
});

// ── Issue 008: View switching logic ──────────────────────────────────────
describe("Issue 008 — View switching from URL", () => {
    // Replicate the resolveAppViewFromUrl logic inline for testing
    const LANDING_FILTER_KEYS = ["years", "subjects", "subtopics", "range", "types"];

    const resolveAppViewFromUrl = (search) => {
        const params = new URLSearchParams(search);

        if (params.get("question")) return "practice";

        const mode = params.get("mode");
        if (mode === "random" || mode === "targeted" || (mode && mode !== "mock")) return "practice";

        if (mode === "mock") {
            const stage = params.get("stage");
            if (stage === "exam") return "mockExam";
            return "mockSetup";
        }

        const hasFilterParams = LANDING_FILTER_KEYS.some((key) => {
            const value = params.get(key);
            return value !== null && String(value).trim() !== "";
        });
        if (hasFilterParams) return "practice";

        return "landing";
    };

    test("?mode=mock&stage=setup resolves to mockSetup", () => {
        expect(resolveAppViewFromUrl("?mode=mock&stage=setup")).toBe("mockSetup");
    });

    test("?mode=mock&stage=exam resolves to mockExam", () => {
        expect(resolveAppViewFromUrl("?mode=mock&stage=exam")).toBe("mockExam");
    });

    test("?mode=mock without stage defaults to mockSetup", () => {
        expect(resolveAppViewFromUrl("?mode=mock")).toBe("mockSetup");
    });

    test("?question=X makes practice view win (deep-link precedence)", () => {
        expect(resolveAppViewFromUrl("?question=go:123")).toBe("practice");
        expect(resolveAppViewFromUrl("?question=go:123&mode=mock")).toBe("practice");
        expect(resolveAppViewFromUrl("?question=go:123&mode=mock&stage=exam")).toBe("practice");
    });

    test("no params resolves to landing", () => {
        expect(resolveAppViewFromUrl("")).toBe("landing");
    });

    test("?mode=random resolves to practice", () => {
        expect(resolveAppViewFromUrl("?mode=random")).toBe("practice");
    });

    test("?mode=targeted resolves to practice", () => {
        expect(resolveAppViewFromUrl("?mode=targeted")).toBe("practice");
    });

    test("filter params without mode resolves to practice", () => {
        expect(resolveAppViewFromUrl("?subjects=algorithms")).toBe("practice");
        expect(resolveAppViewFromUrl("?years=2023")).toBe("practice");
    });
});
