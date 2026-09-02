import { describe, expect, test } from "vitest";
import { evaluateAnswer } from "./evaluateAnswer";

describe("evaluateAnswer", () => {
  test("supports legacy five-option MCQ answers", () => {
    expect(evaluateAnswer({ type: "MCQ", answer: "E" }, "e")).toEqual({
      status: "evaluated",
      correct: true,
    });
  });

  test("normalizes five-option MSQ answers", () => {
    expect(evaluateAnswer({ type: "MSQ", answer: ["A", "E"] }, ["E", "A"])).toEqual({
      status: "evaluated",
      correct: true,
    });
  });

  test("evaluates official NAT lower and upper ranges", () => {
    expect(evaluateAnswer({ type: "NAT", answer: 66.6, tolerance: { lower: 66.6, upper: 66.7 } }, "66.65").correct).toBe(true);
    expect(evaluateAnswer({ type: "NAT", answer: 66.6, tolerance: { lower: 66.6, upper: 66.7 } }, "66.8").correct).toBe(false);
  });

  test("evaluates NAT exact integer answer (e.g. go:1917 - 148)", () => {
    const record = { type: "NAT", answer: 148, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, "148")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, 148)).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "147")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("supports direct numeric tolerance values for NAT", () => {
    const record = { type: "NAT", answer: 29, tolerance: 1 };
    expect(evaluateAnswer(record, "28").correct).toBe(true);
    expect(evaluateAnswer(record, "29").correct).toBe(true);
    expect(evaluateAnswer(record, "30").correct).toBe(true);
    expect(evaluateAnswer(record, "31").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 1 Q43 (go:8313) NAT answer 69 correctly", () => {
    const record = { type: "NAT", answer: 69, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, "69")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, 69)).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "69.0")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "995")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("evaluates GATE CSE 2006 Q51 (go:1829) MCQ answer B correctly", () => {
    const record = { type: "MCQ", answer: "B", tolerance: null };
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "b")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "D")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("evaluates GATE IT 2005 Q51 (go:3812) MCQ answer C correctly", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "c")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("evaluates GATE CSE 1995 Q2.9 (go:2621) MCQ answer C correctly", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "c")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("evaluates GATE CSE 2024 Set 1 Q31 (go:422811) MCQ answer D correctly", () => {
    const record = { type: "MCQ", answer: "D", tolerance: null };
    expect(evaluateAnswer(record, "D")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "d")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "C")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "3")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("evaluates GATE CSE 2005 Q53 (go:1376) as defective MCQ excluded from scoring", () => {
    const record = {
      type: "MCQ",
      answer: null,
      is_defective: true,
      tolerance: null,
    };
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "excluded",
      correct: false,
      reason: "defective_question",
    });
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "excluded",
      correct: false,
      reason: "defective_question",
    });
    expect(evaluateAnswer(record, "C")).toEqual({
      status: "excluded",
      correct: false,
      reason: "defective_question",
    });
    expect(evaluateAnswer(record, "D")).toEqual({
      status: "excluded",
      correct: false,
      reason: "defective_question",
    });
    expect(evaluateAnswer(record, "").correct).toBe(false);
  });

  test("evaluates GATE CSE 2008 Q79 (go:43485) as defective MCQ (correct answer 13 absent from options)", () => {
    // Mathematical recurrence: T(n) = T(n-1) + T(n-2) with T(1)=2, T(2)=3
    // T(3) = 5, T(4) = 8, T(5) = 13
    const correctMathematicalAnswer = 13;
    const providedOptions = { A: 5, B: 7, C: 8, D: 16 };
    expect(Object.values(providedOptions)).not.toContain(correctMathematicalAnswer);

    const record = {
      type: "MCQ",
      answer: null,
      is_defective: true,
      defective_reason: "The correct answer is 13 (T(5) = 13 for recurrence T(n) = T(n-1) + T(n-2) with T(1)=2, T(2)=3), but 13 is not present among the options (A: 5, B: 7, C: 8, D: 16). Excluded from scoring.",
      tolerance: null,
    };

    // Selecting any of the provided options must NOT be marked correct
    ["A", "B", "C", "D"].forEach((option) => {
      const evaluation = evaluateAnswer(record, option);
      expect(evaluation.status).toBe("excluded");
      expect(evaluation.correct).toBe(false);
      expect(evaluation.reason).toContain("The correct answer is 13");
    });
    expect(evaluateAnswer(record, "").correct).toBe(false);
  });

  test("evaluates GATE CSE 1987 Q2j (go:80594) as 2-choice MCQ with Option B (FALSE) correct", () => {
    const record = {
      type: "MCQ",
      answer: "B",
      tolerance: null,
    };

    // Selecting B (FALSE) is correct
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "b")).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Selecting A (TRUE) is incorrect
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "a")).toEqual({
      status: "evaluated",
      correct: false,
    });

    // Unrelated inputs
    expect(evaluateAnswer(record, "C")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "9")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("evaluates GATE CSE 1987 Q2k (go:80599) as 2-choice MCQ with Option B (FALSE) correct", () => {
    const record = {
      type: "MCQ",
      answer: "B",
      tolerance: null,
    };

    // Selecting B (FALSE - CFL not closed under intersection) is correct
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "b")).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Selecting A (TRUE) is incorrect
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "a")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("evaluates GATE CSE 1990 Q3-v (go:84830) as MCQ with Option A (Theta(n log n)) correct", () => {
    const record = {
      type: "MCQ",
      answer: "A",
      tolerance: null,
    };

    // Selecting A (Theta(n log n)) is correct
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "a")).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Options B, C, D are incorrect
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "C")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "D")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "7")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });
});
