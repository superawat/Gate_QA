/**
 * @vitest-environment node
 */
import { describe, expect, test } from "vitest";
import {
  buildMockQuestionResult,
  buildMockResultSummary,
  filterMockQuestionsByScope,
  getMockQuestionSubjectKey,
  getMockQuestionYearSetIdentity,
  formatExpectedAnswer,
  formatMockTimeSpent,
  hasMeaningfulResponse,
  MOCK_SLOW_QUESTION_THRESHOLD_SECONDS,
  validateMockQuestionForPool,
} from "./mockTest";

describe("mockTest utilities", () => {
  test("strictly scopes a custom pool to selected subjects and any selected subtopic", () => {
    const questions = [
      { question_uid: "ds:1", subject: "Data Structures", subtopics: [{ slug: "trees" }, { slug: "graphs" }] },
      { question_uid: "os:1", subjectSlug: "operating-system", subtopics: [{ slug: "processes" }] },
      { question_uid: "ga:1", subjectSlug: "ga", subtopics: [{ slug: "probability" }] },
    ];

    expect(filterMockQuestionsByScope(questions, {
      selectedSubjects: ["Data Structures", "ga"],
      selectedSubtopics: ["graphs"],
    }).map((question) => question.question_uid)).toEqual(["ds:1"]);

    expect(filterMockQuestionsByScope(questions, {
      selectedSubjects: ["ga"],
    }).map((question) => question.question_uid)).toEqual(["ga:1"]);
  });

  test("keeps DA subjects distinct from same-named CSE subjects", () => {
    const questions = [
      { question_uid: "go:cse-ga:1", title: "GATE CSE 2024 | Set 1", subjectSlug: "ga", yearSetKey: "2024-s1", tags: ["gatecse-2024", "gateda-2024"] },
      { question_uid: "da:ga:1", title: "GATE DA 2024", subjectSlug: "general-aptitude", yearSetKey: "2024-s1", tags: ["gateda-2024"] },
    ];

    expect(getMockQuestionSubjectKey(questions[0])).toBe("ga");
    expect(getMockQuestionSubjectKey(questions[1])).toBe("da:general-aptitude");
    expect(filterMockQuestionsByScope(questions, {
      selectedSubjects: ["da:general-aptitude"],
    }).map((question) => question.question_uid)).toEqual(["da:ga:1"]);
    expect(getMockQuestionYearSetIdentity(questions[0])).toBe("cse:2024:set-1");
    expect(getMockQuestionYearSetIdentity(questions[1])).toBe("da:2024:set-1");
  });

  test("hasMeaningfulResponse treats empty NAT and MSQ as unanswered", () => {
    expect(hasMeaningfulResponse("", "NAT")).toBe(false);
    expect(hasMeaningfulResponse("   ", "NAT")).toBe(false);
    expect(hasMeaningfulResponse("12.5", "NAT")).toBe(true);
    expect(hasMeaningfulResponse([], "MSQ")).toBe(false);
    expect(hasMeaningfulResponse([""], "MSQ")).toBe(false);
    expect(hasMeaningfulResponse(["A"], "MSQ")).toBe(true);
  });

  test("formatExpectedAnswer includes NAT tolerance details", () => {
    expect(formatExpectedAnswer({
      type: "NAT",
      answer: "42",
      tolerance: { abs: 0.01 },
    })).toBe("42 (+/- 0.01)");
  });

  test("formatMockTimeSpent renders compact minute and second labels", () => {
    expect(formatMockTimeSpent(0)).toBe("0s");
    expect(formatMockTimeSpent(65)).toBe("1m 05s");
    expect(formatMockTimeSpent(180)).toBe("3m");
  });

  test("buildMockQuestionResult scores MCQ and NAT correctly", () => {
    expect(buildMockQuestionResult({
      questionMeta: { questionUid: "q1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333 },
      response: "B",
      answerRecord: { type: "MCQ", answer: "B" },
    })).toMatchObject({
      status: "correct",
      correct: true,
      scoreDelta: 1,
    });

    expect(buildMockQuestionResult({
      questionMeta: { questionUid: "q2", section: "CS", type: "NAT", marks: 2, negativeMarks: 0 },
      response: "10.1",
      answerRecord: { type: "NAT", answer: "10", tolerance: { abs: 0.05 } },
    })).toMatchObject({
      status: "incorrect",
      correct: false,
      scoreDelta: 0,
    });
  });

  test("auto-awarded mock questions score without requiring a response", () => {
    const result = buildMockQuestionResult({
      questionMeta: {
        questionUid: "q-bonus",
        section: "CS",
        type: "MARKS_TO_ALL",
        marks: 2,
        negativeMarks: 0,
        autoAwarded: true,
      },
      response: "",
      answerRecord: { type: "MARKS_TO_ALL", answer: null },
    });

    expect(result).toMatchObject({
      status: "bonus",
      answered: false,
      autoAwarded: true,
      scoreDelta: 2,
    });
    expect(formatExpectedAnswer({ type: "MARKS_TO_ALL" })).toBe("Awarded to all");

    expect(buildMockQuestionResult({
      questionMeta: {
        questionUid: "q-subjective",
        section: "CS",
        type: "SUBJECTIVE",
        marks: 2,
        negativeMarks: 0,
        autoAwarded: true,
      },
      response: "",
      answerRecord: { type: "SUBJECTIVE", answer: null },
    })).toMatchObject({
      status: "bonus",
      answered: false,
      autoAwarded: true,
      scoreDelta: 2,
    });
  });

  test("buildMockResultSummary aggregates per-section scoring and unanswered counts", () => {
    const questions = [
      { question_uid: "ga:1" },
      { question_uid: "cs:1" },
      { question_uid: "cs:2" },
    ];
    const questionMetaByUid = {
      "ga:1": { questionUid: "ga:1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333 },
      "cs:1": { questionUid: "cs:1", section: "CS", type: "MSQ", marks: 2, negativeMarks: 0 },
      "cs:2": { questionUid: "cs:2", section: "CS", type: "NAT", marks: 2, negativeMarks: 0 },
    };
    const responses = {
      "ga:1": "A",
      "cs:1": ["A", "C"],
      "cs:2": "",
    };
    const answers = {
      "ga:1": { type: "MCQ", answer: "B" },
      "cs:1": { type: "MSQ", answer: ["A", "C"] },
      "cs:2": { type: "NAT", answer: "5", tolerance: { abs: 0 } },
    };

    const summary = buildMockResultSummary({
      questions,
      responses,
      questionMetaByUid,
      getAnswerRecord: (question) => answers[question.question_uid] || null,
    });

    expect(summary).toMatchObject({
      attempted: 2,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
      score: 1.6667,
      maxScore: 5,
    });
    expect(summary.sectionSummary.GA).toMatchObject({
      total: 1,
      incorrect: 1,
      score: -0.3333,
    });
    expect(summary.sectionSummary.CS).toMatchObject({
      total: 2,
      correct: 1,
      unanswered: 1,
      score: 2,
    });
  });

  test("buildMockResultSummary attaches per-question timing analysis", () => {
    const summary = buildMockResultSummary({
      questions: [
        { question_uid: "ga:1" },
        { question_uid: "cs:1" },
      ],
      questionMetaByUid: {
        "ga:1": { questionUid: "ga:1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333 },
        "cs:1": { questionUid: "cs:1", section: "CS", type: "NAT", marks: 2, negativeMarks: 0 },
      },
      questionTimeSpentByUid: {
        "ga:1": 95,
        "cs:1": MOCK_SLOW_QUESTION_THRESHOLD_SECONDS + 1,
      },
      getAnswerRecord: () => null,
    });

    expect(summary.perQuestionResult["ga:1"]).toMatchObject({
      timeSpentSeconds: 95,
      timeExceededThreshold: false,
    });
    expect(summary.perQuestionResult["cs:1"]).toMatchObject({
      timeSpentSeconds: 181,
      timeExceededThreshold: true,
    });
    expect(summary.timeAnalysis).toMatchObject({
      totalSeconds: 276,
      averageSeconds: 138,
      slowQuestionCount: 1,
      slowThresholdSeconds: MOCK_SLOW_QUESTION_THRESHOLD_SECONDS,
    });
  });

  test("buildMockResultSummary separates auto-awarded questions from attempted counts", () => {
    const summary = buildMockResultSummary({
      questions: [{ question_uid: "bonus:1" }],
      responses: {},
      questionMetaByUid: {
        "bonus:1": {
          questionUid: "bonus:1",
          section: "CS",
          type: "AMBIGUOUS",
          marks: 1,
          negativeMarks: 0,
          autoAwarded: true,
        },
      },
      getAnswerRecord: () => ({ type: "AMBIGUOUS", answer: null }),
    });

    expect(summary).toMatchObject({
      attempted: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      bonus: 1,
      score: 1,
      maxScore: 1,
    });
    expect(summary.sectionSummary.CS).toMatchObject({
      bonus: 1,
      score: 1,
      maxScore: 1,
    });
  });

  test("missing answer records are preserved in per-question results", () => {
    const summary = buildMockResultSummary({
      questions: [{ question_uid: "q1" }],
      responses: { q1: "A" },
      questionMetaByUid: {
        q1: { questionUid: "q1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333 },
      },
      getAnswerRecord: () => null,
    });

    expect(summary.perQuestionResult.q1.status).toBe("missing_answer");
    expect(summary.incorrect).toBe(1);
  });

  test("validateMockQuestionForPool blocks MCQ/MSQ rows without options", () => {
    const validation = validateMockQuestionForPool({
      question: {
        question_uid: "go:bad",
        question: "<p>Choose the correct statement.</p>",
      },
      questionMeta: {
        questionUid: "go:bad",
        section: "CS",
        type: "MCQ",
        marks: 1,
        scorable: true,
      },
      answerRecord: {
        type: "MCQ",
        answer: "A",
      },
    });

    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain("missing_options");
  });

  test("validateMockQuestionForPool accepts embedded visual options", () => {
    const validation = validateMockQuestionForPool({
      question: {
        question_uid: "go:visual",
        question: `
          <p>Pick the matching graph.</p>
          <ol style="list-style-type: upper-alpha;">
            <li><img src="/Gate_QA/question-images/a.webp" alt="A"></li>
            <li><img src="/Gate_QA/question-images/b.webp" alt="B"></li>
            <li><img src="/Gate_QA/question-images/c.webp" alt="C"></li>
            <li><img src="/Gate_QA/question-images/d.webp" alt="D"></li>
          </ol>
        `,
      },
      questionMeta: {
        questionUid: "go:visual",
        section: "CS",
        type: "MCQ",
        marks: 1,
        scorable: true,
      },
      answerRecord: {
        type: "MCQ",
        answer: "C",
      },
    });

    expect(validation.valid).toBe(true);
    expect(validation.optionCount).toBe(4);
    expect(validation.imageCount).toBe(4);
  });

  test("validateMockQuestionForPool accepts paragraph-labeled embedded options", () => {
    const validation = validateMockQuestionForPool({
      question: {
        question_uid: "go:paragraph-options",
        question: `
          <p>Choose the largest floating-point number among the following options.</p>
          <p>A. Small value</p>
          <p>B. Largest value</p>
          <p>C. Not a number</p>
          <p>D. Tiny value</p>
        `,
      },
      questionMeta: {
        questionUid: "go:paragraph-options",
        section: "CS",
        type: "MCQ",
        marks: 1,
        scorable: true,
      },
      answerRecord: {
        type: "MCQ",
        answer: "B",
      },
    });

    expect(validation.valid).toBe(true);
    expect(validation.optionCount).toBe(4);
    expect(validation.structuredOptionCount).toBe(0);
    expect(validation.embeddedOptionCount).toBe(4);
  });

  test("validateMockQuestionForPool reports mixed structured and embedded options", () => {
    const validation = validateMockQuestionForPool({
      question: {
        question_uid: "go:mixed-options",
        question: `
          <p>Choose the correct option.</p>
          <ol style="list-style-type: upper-alpha;">
            <li>First option</li>
            <li>Second option</li>
            <li>Third option</li>
            <li>Fourth option</li>
          </ol>
        `,
        options: ["First option", "Second option", "Third option", "Fourth option"],
      },
      questionMeta: {
        questionUid: "go:mixed-options",
        section: "CS",
        type: "MCQ",
        marks: 1,
        scorable: true,
      },
      answerRecord: {
        type: "MCQ",
        answer: "A",
      },
    });

    expect(validation.valid).toBe(true);
    expect(validation.hasMixedOptionSources).toBe(true);
  });

  test("defective questions are excluded from scoring without penalty in mock results", () => {
    const questionMeta = {
      questionUid: "go:1376",
      section: "CS",
      type: "MCQ",
      marks: 2,
      negativeMarks: 0.6666666667,
    };
    const answerRecord = {
      type: "MCQ",
      answer: null,
      is_defective: true,
    };

    // Selecting option A
    const resultA = buildMockQuestionResult({
      questionMeta,
      response: "A",
      answerRecord,
    });
    expect(resultA).toMatchObject({
      status: "excluded",
      correct: false,
      scoreDelta: 0,
      marks: 0,
      negativeMarks: 0,
      excluded: true,
    });

    // Selecting option C
    const resultC = buildMockQuestionResult({
      questionMeta,
      response: "C",
      answerRecord,
    });
    expect(resultC).toMatchObject({
      status: "excluded",
      correct: false,
      scoreDelta: 0,
      marks: 0,
      negativeMarks: 0,
      excluded: true,
    });

    expect(formatExpectedAnswer(answerRecord)).toBe("None (Defective Question - Excluded from scoring)");
  });

  test("buildMockResultSummary excludes defective questions from scoring summary without penalizing student", () => {
    const questions = [
      { question_uid: "ga:1" },
      { question_uid: "go:1376" },
      { question_uid: "go:43485" },
    ];
    const questionMetaByUid = {
      "ga:1": { questionUid: "ga:1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333 },
      "go:1376": { questionUid: "go:1376", section: "CS", type: "MCQ", marks: 2, negativeMarks: 0.6666666667 },
      "go:43485": { questionUid: "go:43485", section: "CS", type: "MCQ", marks: 1, negativeMarks: 0.3333333333 },
    };
    const responses = {
      "ga:1": "B",
      "go:1376": "A", // Student selected option A on defective question
      "go:43485": "C", // Student selected option C on defective question
    };
    const answers = {
      "ga:1": { type: "MCQ", answer: "B" },
      "go:1376": { type: "MCQ", answer: null, is_defective: true },
      "go:43485": { type: "MCQ", answer: null, is_defective: true },
    };

    const summary = buildMockResultSummary({
      questions,
      responses,
      questionMetaByUid,
      getAnswerRecord: (question) => answers[question.question_uid] || null,
    });

    expect(summary).toMatchObject({
      attempted: 1, // Only ga:1 is considered a standard scored attempt
      correct: 1,
      incorrect: 0, // Defective questions were NOT marked incorrect
      unanswered: 0,
      excluded: 2,
      score: 1, // Full 1 mark from GA, 0 deducted for defective questions
      maxScore: 1, // Excluded question marks omitted from scorable maxScore
    });
    expect(summary.sectionSummary.CS).toMatchObject({
      total: 2,
      correct: 0,
      incorrect: 0,
      excluded: 2,
      score: 0,
      maxScore: 0,
    });
  });
});

