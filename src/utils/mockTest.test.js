/**
 * @vitest-environment node
 */
import { describe, expect, test } from "vitest";
import {
  buildMockQuestionResult,
  buildMockResultSummary,
  formatExpectedAnswer,
  formatMockTimeSpent,
  hasMeaningfulResponse,
  MOCK_SLOW_QUESTION_THRESHOLD_SECONDS,
} from "./mockTest";

describe("mockTest utilities", () => {
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
});
