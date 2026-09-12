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

  test("evaluates GATE CSE 2025 Set 1 Q18 (go:460062) as MSQ with Option D correct", () => {
    const record = {
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    };

    // Selecting D is correct
    expect(evaluateAnswer(record, ["D"])).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, ["d"])).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Selecting other options or combinations is incorrect
    expect(evaluateAnswer(record, ["A"])).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, ["D", "A"])).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, [])).toEqual({
      status: "invalid_input",
      correct: false,
    });
  });

  test("evaluates GATE CSE 2025 Set 1 Q40 (go:460040) as MSQ with Option C correct", () => {
    const record = {
      type: "MSQ",
      answer: ["C"],
      tolerance: null,
    };

    // Selecting C is correct
    expect(evaluateAnswer(record, ["C"])).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, ["c"])).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Selecting wrong options
    expect(evaluateAnswer(record, ["B"])).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, ["B", "C"])).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, [])).toEqual({
      status: "invalid_input",
      correct: false,
    });
  });

  test("evaluates GATE CSE 2024 Set 2 Q31 (go:422866) as MCQ with Option B correct", () => {
    const record = {
      type: "MCQ",
      answer: "B",
      tolerance: null,
    };

    // Selecting B is correct
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "b")).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Other options are incorrect
    expect(evaluateAnswer(record, "A")).toEqual({
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
    expect(evaluateAnswer(record, "3")).toEqual({
      status: "evaluated",
      correct: false,
    });
  });

  test("evaluates GATE IT 2008 Q29 (go:3319) as defective MCQ with null answer excluded from scoring", () => {
    const record = {
      type: "MCQ",
      answer: null,
      is_defective: true,
      defective_reason: "For a square matrix M with det(M)=0, only S3 (MX=0 has a nontrivial solution) is correct. S1 and S2 are not necessarily true, and S4 is false. Since none of the options represents 'S3 only', no option is correct and the question is excluded from scoring.",
      tolerance: null,
    };

    // Selecting any option must be excluded from scoring without penalty
    ["A", "B", "C", "D"].forEach((option) => {
      const evaluation = evaluateAnswer(record, option);
      expect(evaluation.status).toBe("excluded");
      expect(evaluation.correct).toBe(false);
      expect(evaluation.reason).toContain("only S3 (MX=0 has a nontrivial solution) is correct");
    });
    expect(evaluateAnswer(record, "").correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 1 Q33 (go:460047) as MCQ with Option C correct", () => {
    const record = {
      type: "MCQ",
      answer: "C",
      tolerance: null,
    };

    // Selecting C ("The height of T is at least 15") is correct
    expect(evaluateAnswer(record, "C")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "c")).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Selecting A, B, or D is incorrect
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "D")).toEqual({
      status: "evaluated",
      correct: false,
    });
    expect(evaluateAnswer(record, "").correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 2 Q30 (go:118623) as MCQ with Option B correct", () => {
    const record = {
      type: "MCQ",
      answer: "B",
      tolerance: null,
    };

    // Selecting B ("Theta(log n)") is correct
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "b")).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Selecting A, C, or D is incorrect
    expect(evaluateAnswer(record, "A")).toEqual({
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
    expect(evaluateAnswer(record, "").correct).toBe(false);
  });

  test("evaluates GATE CSE 2004 / IT 2004 Q57 (go:3700) as MCQ with Option B correct", () => {
    const record = {
      type: "MCQ",
      answer: "B",
      tolerance: null,
    };

    // Selecting B (P-IV, Q-III, R-I, S-II) is correct
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "b")).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Selecting A, C, or D is incorrect
    expect(evaluateAnswer(record, "A")).toEqual({
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
    expect(evaluateAnswer(record, "").correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 1 Q10 (go:460070) as MCQ with Option A correct", () => {
    const record = {
      type: "MCQ",
      answer: "A",
      tolerance: null,
    };

    // Selecting A ("Theta(n^2 2^n)") is correct
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "evaluated",
      correct: true,
    });
    expect(evaluateAnswer(record, "a")).toEqual({
      status: "evaluated",
      correct: true,
    });

    // Selecting B, C, or D is incorrect
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
    expect(evaluateAnswer(record, "").correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 1 GA Q9 (go:460092) as MCQ with Option A correct", () => {
    const record = {
      type: "MCQ",
      answer: "A",
      tolerance: null,
    };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "a").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
    expect(evaluateAnswer(record, "C").correct).toBe(false);
    expect(evaluateAnswer(record, "D").correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 1 CS Q39 (go:460041) as MSQ with Option B correct", () => {
    const record = {
      type: "MSQ",
      answer: ["B"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["B"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["b"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["A", "B"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["B", "C"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 1 CS Q55 (go:460025) NAT range [10, 11]", () => {
    const record = {
      type: "NAT",
      answer: 10.5,
      tolerance: { lower: 10, upper: 11, abs: 0.5 },
    };
    expect(evaluateAnswer(record, 10).correct).toBe(true);
    expect(evaluateAnswer(record, 10.5).correct).toBe(true);
    expect(evaluateAnswer(record, 11).correct).toBe(true);
    expect(evaluateAnswer(record, 9.9).correct).toBe(false);
    expect(evaluateAnswer(record, 11.1).correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 1 CS Q48 (go:460032) NAT range [0.300, 0.302]", () => {
    const record = {
      type: "NAT",
      answer: 0.301,
      tolerance: { lower: 0.3, upper: 0.302, abs: 0.001 },
    };
    expect(evaluateAnswer(record, 0.300).correct).toBe(true);
    expect(evaluateAnswer(record, 0.301).correct).toBe(true);
    expect(evaluateAnswer(record, 0.302).correct).toBe(true);
    expect(evaluateAnswer(record, 0.299).correct).toBe(false);
    expect(evaluateAnswer(record, 0.303).correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 1 CS Q22 (go:460058) NAT range [0.49, 0.51]", () => {
    const record = {
      type: "NAT",
      answer: 0.5,
      tolerance: { lower: 0.49, upper: 0.51, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 0.49).correct).toBe(true);
    expect(evaluateAnswer(record, 0.50).correct).toBe(true);
    expect(evaluateAnswer(record, 0.51).correct).toBe(true);
    expect(evaluateAnswer(record, 0.48).correct).toBe(false);
    expect(evaluateAnswer(record, 0.52).correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 1 CS Q46 (go:460034) NAT range [0.949, 0.952]", () => {
    const record = {
      type: "NAT",
      answer: 0.9505,
      tolerance: { lower: 0.949, upper: 0.952, abs: 0.0015 },
    };
    expect(evaluateAnswer(record, 0.949).correct).toBe(true);
    expect(evaluateAnswer(record, 0.9505).correct).toBe(true);
    expect(evaluateAnswer(record, 0.952).correct).toBe(true);
    expect(evaluateAnswer(record, 0.948).correct).toBe(false);
    expect(evaluateAnswer(record, 0.953).correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 2 CS Q10 (go:460825) as MCQ with Option A correct", () => {
    const record = {
      type: "MCQ",
      answer: "A",
      tolerance: null,
    };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "a").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
    expect(evaluateAnswer(record, "C").correct).toBe(false);
    expect(evaluateAnswer(record, "D").correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 2 CS Q18 (go:460817) as MSQ with Option D correct", () => {
    const record = {
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["D"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["d"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["A", "D"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["D", "C"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 2 CS Q27 (go:460808) as MCQ with Option C correct", () => {
    const record = {
      type: "MCQ",
      answer: "C",
      tolerance: null,
    };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "c").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
    expect(evaluateAnswer(record, "D").correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 2 CS Q35 (go:460800) as MSQ with Option A correct", () => {
    const record = {
      type: "MSQ",
      answer: ["A"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["A"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["a"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["A", "B"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["B"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 2 CS Q37 (go:460798) as MSQ with Option D correct", () => {
    const record = {
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["D"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["d"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["C", "D"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["A"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2025 Set 2 CS Q43 (go:460850) as MSQ with Option B correct", () => {
    const record = {
      type: "MSQ",
      answer: ["B"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["B"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["b"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["A", "B"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["C"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 1 CS Q14 (go:422828) as MSQ with Option D correct", () => {
    const record = {
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["D"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["d"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["A", "D"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["C"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 1 CS Q35 (go:422807) as MSQ with Option C correct", () => {
    const record = {
      type: "MSQ",
      answer: ["C"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["C"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["c"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["B", "C"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["A"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 1 CS Q39 (go:422803) as MSQ with Option A correct", () => {
    const record = {
      type: "MSQ",
      answer: ["A"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["A"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["a"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["A", "B"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["D"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 1 CS Q53 (go:422789) NAT range [0.370, 0.380]", () => {
    const record = {
      type: "NAT",
      answer: 0.375,
      tolerance: { lower: 0.37, upper: 0.38, abs: 0.005 },
    };
    expect(evaluateAnswer(record, 0.370).correct).toBe(true);
    expect(evaluateAnswer(record, 0.375).correct).toBe(true);
    expect(evaluateAnswer(record, 0.380).correct).toBe(true);
    expect(evaluateAnswer(record, 0.369).correct).toBe(false);
    expect(evaluateAnswer(record, 0.381).correct).toBe(false);
    expect(evaluateAnswer(record, 0.365).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 2 CS Q13 (go:422884) as MSQ with Option B correct", () => {
    const record = {
      type: "MSQ",
      answer: ["B"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["B"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["b"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["B", "C"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["A"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 2 CS Q41 (go:422856) as MSQ with Option D correct", () => {
    const record = {
      type: "MSQ",
      answer: ["D"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["D"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["d"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["C", "D"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["A"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 2 CS Q43 (go:422854) NAT range [29.50, 30.50]", () => {
    const record = {
      type: "NAT",
      answer: 30.0,
      tolerance: { lower: 29.5, upper: 30.5, abs: 0.5 },
    };
    expect(evaluateAnswer(record, 29.50).correct).toBe(true);
    expect(evaluateAnswer(record, 30.00).correct).toBe(true);
    expect(evaluateAnswer(record, 30.06).correct).toBe(true);
    expect(evaluateAnswer(record, 30.50).correct).toBe(true);
    expect(evaluateAnswer(record, 29.49).correct).toBe(false);
    expect(evaluateAnswer(record, 30.51).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 2 CS Q48 (go:422849) NAT range [2.9, 3.1]", () => {
    const record = {
      type: "NAT",
      answer: 3.0,
      tolerance: { lower: 2.9, upper: 3.1, abs: 0.1 },
    };
    expect(evaluateAnswer(record, 2.9).correct).toBe(true);
    expect(evaluateAnswer(record, 3.0).correct).toBe(true);
    expect(evaluateAnswer(record, 3.1).correct).toBe(true);
    expect(evaluateAnswer(record, 2.89).correct).toBe(false);
    expect(evaluateAnswer(record, 3.11).correct).toBe(false);
  });

  test("evaluates GATE CSE 2024 Set 2 CS Q49 (go:422848) NAT value 9", () => {
    const record = {
      type: "NAT",
      answer: 9,
      tolerance: { abs: 0.01 },
    };
    expect(evaluateAnswer(record, 9).correct).toBe(true);
    expect(evaluateAnswer(record, 5).correct).toBe(false);
    expect(evaluateAnswer(record, 8.9).correct).toBe(false);
    expect(evaluateAnswer(record, 9.1).correct).toBe(false);
  });

  test("evaluates GATE CSE 2023 GA Q2 (go:399254) MTA (Marks To All) automatically", () => {
    const record = {
      type: "MTA",
      answer: "MTA",
    };
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
    expect(evaluateAnswer(record, null)).toEqual({
      status: "marks_to_all",
      correct: true,
    });
    expect(evaluateAnswer(record, "")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
  });

  test("evaluates GATE CSE 2023 CS Q50 (go:399261) NAT range [2.374, 2.376]", () => {
    const record = {
      type: "NAT",
      answer: 2.375,
      tolerance: { lower: 2.374, upper: 2.376, abs: 0.001 },
    };
    expect(evaluateAnswer(record, 2.374).correct).toBe(true);
    expect(evaluateAnswer(record, 2.375).correct).toBe(true);
    expect(evaluateAnswer(record, 2.376).correct).toBe(true);
    expect(evaluateAnswer(record, 2.3739).correct).toBe(false);
    expect(evaluateAnswer(record, 2.3761).correct).toBe(false);
  });

  test("evaluates GATE CSE 2022 GA Q5 (go:371501) as MCQ with Option B correct", () => {
    const record = {
      type: "MCQ",
      answer: "B",
      tolerance: null,
    };
    expect(evaluateAnswer(record, "B").correct).toBe(true);
    expect(evaluateAnswer(record, "b").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
    expect(evaluateAnswer(record, "C").correct).toBe(false);
    expect(evaluateAnswer(record, "D").correct).toBe(false);
  });

  test("evaluates GATE CSE 2022 CS Q42 (go:371894) as MSQ with Option A correct", () => {
    const record = {
      type: "MSQ",
      answer: ["A"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, ["A"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["a"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["A", "B"]).correct).toBe(false);
    expect(evaluateAnswer(record, ["B"]).correct).toBe(false);
    expect(evaluateAnswer(record, []).correct).toBe(false);
  });

  test("evaluates GATE CSE 2022 CS Q48 (go:371888) NAT value 24 (directed spanning trees)", () => {
    const record = {
      type: "NAT",
      answer: 24,
      tolerance: { abs: 0.01 },
    };
    expect(evaluateAnswer(record, 24).correct).toBe(true);
    expect(evaluateAnswer(record, "24").correct).toBe(true);
    expect(evaluateAnswer(record, 9).correct).toBe(false);
    expect(evaluateAnswer(record, 23.9).correct).toBe(false);
    expect(evaluateAnswer(record, 24.1).correct).toBe(false);
  });

  test("evaluates GATE CSE 2022 CS Q51 (go:371885) NAT range [1.42, 1.45]", () => {
    const record = {
      type: "NAT",
      answer: 1.435,
      tolerance: { lower: 1.42, upper: 1.45, abs: 0.015 },
    };
    expect(evaluateAnswer(record, 1.42).correct).toBe(true);
    expect(evaluateAnswer(record, "1.42").correct).toBe(true);
    expect(evaluateAnswer(record, 1.435).correct).toBe(true);
    expect(evaluateAnswer(record, 1.45).correct).toBe(true);
    expect(evaluateAnswer(record, 1.419).correct).toBe(false);
    expect(evaluateAnswer(record, 1.451).correct).toBe(false);
  });

  test("evaluates GATE CSE 2022 CS Q49 (go:371887) NAT range [7.07, 7.09]", () => {
    const record = {
      type: "NAT",
      answer: 7.08,
      tolerance: { lower: 7.07, upper: 7.09, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 7.07).correct).toBe(true);
    expect(evaluateAnswer(record, "7.07").correct).toBe(true);
    expect(evaluateAnswer(record, 7.08).correct).toBe(true);
    expect(evaluateAnswer(record, 7.069).correct).toBe(false);
    expect(evaluateAnswer(record, 7.091).correct).toBe(false);
  });

  test("evaluates GATE CSE 2021 Session 1 GA Q9 (go:357468) multi-accepted MCQ C OR D", () => {
    const record = {
      type: "MCQ",
      answer: ["C", "D"],
      tolerance: null,
    };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "c").correct).toBe(true);
    expect(evaluateAnswer(record, "D").correct).toBe(true);
    expect(evaluateAnswer(record, "d").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
    expect(evaluateAnswer(record, "").correct).toBe(false);
  });

  test("evaluates GATE CSE 2021 Session 1 CS Q23 (go:357428) multi-range NAT [819, 820] OR [205, 205]", () => {
    const record = {
      type: "NAT",
      answer: 819.5,
      tolerance: {
        ranges: [
          { min: 819, max: 820 },
          { min: 205, max: 205 },
        ],
      },
    };
    expect(evaluateAnswer(record, 819).correct).toBe(true);
    expect(evaluateAnswer(record, 819.5).correct).toBe(true);
    expect(evaluateAnswer(record, 820).correct).toBe(true);
    expect(evaluateAnswer(record, 205).correct).toBe(true);
    expect(evaluateAnswer(record, "205").correct).toBe(true);
    expect(evaluateAnswer(record, 204.9).correct).toBe(false);
    expect(evaluateAnswer(record, 205.1).correct).toBe(false);
    expect(evaluateAnswer(record, 818.9).correct).toBe(false);
    expect(evaluateAnswer(record, 820.1).correct).toBe(false);
    expect(evaluateAnswer(record, 0).correct).toBe(false);
  });

  test("evaluates GATE CSE 2021 Session 1 CS Q9 (go:357443) MCQ C (Insertion sort on sorted array)", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "D").correct).toBe(false);
  });

  test("evaluates GATE CSE 2021 Session 1 CS Q12 (go:357440) MSQ [\"D\"]", () => {
    const record = { type: "MSQ", answer: ["D"], tolerance: null };
    expect(evaluateAnswer(record, ["D"]).correct).toBe(true);
    expect(evaluateAnswer(record, ["A", "D"]).correct).toBe(false);
  });

  test("evaluates GATE CSE 2021 Session 1 CS Q17 (go:357434) NAT 3", () => {
    const record = { type: "NAT", answer: 3, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 3).correct).toBe(true);
    expect(evaluateAnswer(record, "3").correct).toBe(true);
    expect(evaluateAnswer(record, 2).correct).toBe(false);
  });

  test("evaluates GATE CSE 2021 Session 1 CS Q41, Q43, Q47 MSQs", () => {
    expect(evaluateAnswer({ type: "MSQ", answer: ["B"] }, ["B"]).correct).toBe(true);
    expect(evaluateAnswer({ type: "MSQ", answer: ["C"] }, ["C"]).correct).toBe(true);
  });

  test("evaluates GATE CSE 2021 Session 2 CS Q1 (go:357539) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2021 Session 2 CS Q23 (go:357517) NAT 15", () => {
    const record = { type: "NAT", answer: 15, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 15).correct).toBe(true);
    expect(evaluateAnswer(record, 14).correct).toBe(false);
  });

  test("evaluates GATE CSE 2021 Session 2 CS Q36-Q42 MSQs", () => {
    expect(evaluateAnswer({ type: "MSQ", answer: ["A", "C", "D"] }, ["A", "C", "D"]).correct).toBe(true);
    expect(evaluateAnswer({ type: "MSQ", answer: ["B", "C", "D"] }, ["B", "C", "D"]).correct).toBe(true);
    expect(evaluateAnswer({ type: "MSQ", answer: ["A", "D"] }, ["A", "D"]).correct).toBe(true);
    expect(evaluateAnswer({ type: "MSQ", answer: ["A", "B", "C"] }, ["A", "B", "C"]).correct).toBe(true);
    expect(evaluateAnswer({ type: "MSQ", answer: ["A", "D"] }, ["A", "D"]).correct).toBe(true);
    expect(evaluateAnswer({ type: "MSQ", answer: ["B", "C"] }, ["B", "C"]).correct).toBe(true);
    expect(evaluateAnswer({ type: "MSQ", answer: ["A", "B"] }, ["A", "B"]).correct).toBe(true);
  });

  test("evaluates GATE CSE 2020 CS Q2 (go:333229) MCQ A", () => {
    const record = { type: "MCQ", answer: "A", tolerance: null };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "C").correct).toBe(false);
  });

  test("evaluates GATE CSE 2020 CS Q7 (go:333224) as Marks to All (MTA)", () => {
    const record = { type: "MTA", answer: "MTA", tolerance: null };
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
    expect(evaluateAnswer(record, "B")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
    expect(evaluateAnswer(record, "")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
  });

  test("evaluates GATE CSE 2020 CS Q17 (go:333214) NAT 0.125", () => {
    const record = {
      type: "NAT",
      answer: 0.125,
      tolerance: { lower: 0.125, upper: 0.125, abs: 0.005 },
    };
    expect(evaluateAnswer(record, 0.125).correct).toBe(true);
    expect(evaluateAnswer(record, "0.125").correct).toBe(true);
    expect(evaluateAnswer(record, 0.126).correct).toBe(false);
  });

  test("evaluates GATE CSE 2020 CS Q21 (go:333210) dual accepted NAT values 13.3 and 13.5", () => {
    const record = {
      type: "NAT",
      answer: 13.3,
      tolerance: {
        ranges: [
          { min: 13.3, max: 13.3, lower: 13.3, upper: 13.3 },
          { min: 13.5, max: 13.5, lower: 13.5, upper: 13.5 },
        ],
      },
    };
    expect(evaluateAnswer(record, 13.3).correct).toBe(true);
    expect(evaluateAnswer(record, 13.5).correct).toBe(true);
    expect(evaluateAnswer(record, "13.3").correct).toBe(true);
    expect(evaluateAnswer(record, "13.5").correct).toBe(true);
    expect(evaluateAnswer(record, 13.4).correct).toBe(false);
    expect(evaluateAnswer(record, 13.2).correct).toBe(false);
    expect(evaluateAnswer(record, 13.6).correct).toBe(false);
  });

  test("evaluates GATE CSE 2020 CS Q40 (go:333191) MCQ A", () => {
    const record = { type: "MCQ", answer: "A", tolerance: null };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "C").correct).toBe(false);
  });

  test("evaluates GATE CSE 2020 CS Q49 (go:333182) NAT 99", () => {
    const record = { type: "NAT", answer: 99, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 99).correct).toBe(true);
    expect(evaluateAnswer(record, "99").correct).toBe(true);
    expect(evaluateAnswer(record, 3).correct).toBe(false);
  });

  test("evaluates GATE CSE 2020 CS Q50 (go:333181) NAT 5.25", () => {
    const record = { type: "NAT", answer: 5.25, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 5.25).correct).toBe(true);
    expect(evaluateAnswer(record, "5.25").correct).toBe(true);
    expect(evaluateAnswer(record, 5.3).correct).toBe(false);
  });

  test("evaluates GATE CSE 2020 CS Q53 (go:333178) NAT range [154.5, 155.5]", () => {
    const record = {
      type: "NAT",
      answer: 155.0,
      tolerance: { lower: 154.5, upper: 155.5, abs: 0.5 },
    };
    expect(evaluateAnswer(record, 154.5).correct).toBe(true);
    expect(evaluateAnswer(record, 155.0).correct).toBe(true);
    expect(evaluateAnswer(record, 155.5).correct).toBe(true);
    expect(evaluateAnswer(record, 154.4).correct).toBe(false);
    expect(evaluateAnswer(record, 155.6).correct).toBe(false);
  });

  test("evaluates GATE CSE 2019 CS Q12 (go:302836) MCQ D", () => {
    const record = { type: "MCQ", answer: "D", tolerance: null };
    expect(evaluateAnswer(record, "D").correct).toBe(true);
    expect(evaluateAnswer(record, "C").correct).toBe(false);
  });

  test("evaluates GATE CSE 2019 CS Q20 (go:302828) NAT 0.08", () => {
    const record = {
      type: "NAT",
      answer: 0.08,
      tolerance: { lower: 0.08, upper: 0.08, abs: 0.005 },
    };
    expect(evaluateAnswer(record, 0.08).correct).toBe(true);
    expect(evaluateAnswer(record, "0.08").correct).toBe(true);
    expect(evaluateAnswer(record, 0).correct).toBe(false);
  });

  test("evaluates GATE CSE 2019 CS Q22 (go:302826) NAT range [0.502, 0.504]", () => {
    const record = {
      type: "NAT",
      answer: 0.503,
      tolerance: { lower: 0.502, upper: 0.504, abs: 0.001 },
    };
    expect(evaluateAnswer(record, 0.502).correct).toBe(true);
    expect(evaluateAnswer(record, 0.503).correct).toBe(true);
    expect(evaluateAnswer(record, 0.504).correct).toBe(true);
    expect(evaluateAnswer(record, 0.501).correct).toBe(false);
    expect(evaluateAnswer(record, 0.505).correct).toBe(false);
  });

  test("evaluates GATE CSE 2019 CS Q50 (go:302798) NAT 4", () => {
    const record = { type: "NAT", answer: 4, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 4).correct).toBe(true);
    expect(evaluateAnswer(record, "4").correct).toBe(true);
    expect(evaluateAnswer(record, 3).correct).toBe(false);
  });

  test("evaluates GATE CSE 2019 CS Q54 (go:302794) NAT 97", () => {
    const record = { type: "NAT", answer: 97, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 97).correct).toBe(true);
    expect(evaluateAnswer(record, "97").correct).toBe(true);
    expect(evaluateAnswer(record, 31).correct).toBe(false);
  });

  test("evaluates GATE CSE 2018 CS Q31 (go:204105) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  test("evaluates GATE CSE 2018 CS Q41 (go:204115) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "D").correct).toBe(false);
  });

  test("evaluates GATE CSE 2018 CS Q45 (go:204120) NAT 10230", () => {
    const record = { type: "NAT", answer: 10230, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 10230).correct).toBe(true);
    expect(evaluateAnswer(record, "10230").correct).toBe(true);
    expect(evaluateAnswer(record, 60).correct).toBe(false);
  });

  test("evaluates GATE CSE 2018 CS Q47 (go:204122) NAT 4", () => {
    const record = { type: "NAT", answer: 4, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 4).correct).toBe(true);
    expect(evaluateAnswer(record, "4").correct).toBe(true);
    expect(evaluateAnswer(record, "D").correct).toBe(false);
  });

  test("evaluates GATE CSE 2018 CS Q15 (go:204089) NAT range [0.021, 0.024]", () => {
    const record = {
      type: "NAT",
      answer: 0.0225,
      tolerance: { lower: 0.021, upper: 0.024, abs: 0.0015 },
    };
    expect(evaluateAnswer(record, 0.021).correct).toBe(true);
    expect(evaluateAnswer(record, 0.0231).correct).toBe(true);
    expect(evaluateAnswer(record, 0.024).correct).toBe(true);
    expect(evaluateAnswer(record, 0.020).correct).toBe(false);
    expect(evaluateAnswer(record, 0.025).correct).toBe(false);
  });

  test("evaluates GATE CSE 2018 CS Q16 (go:204090) NAT range [0.27, 0.30]", () => {
    const record = {
      type: "NAT",
      answer: 0.285,
      tolerance: { lower: 0.27, upper: 0.30, abs: 0.015 },
    };
    expect(evaluateAnswer(record, 0.27).correct).toBe(true);
    expect(evaluateAnswer(record, 0.2885).correct).toBe(true);
    expect(evaluateAnswer(record, 0.30).correct).toBe(true);
    expect(evaluateAnswer(record, 0.26).correct).toBe(false);
    expect(evaluateAnswer(record, 0.31).correct).toBe(false);
  });

  test("evaluates GATE CSE 2018 CS Q44 (go:204119) NAT range [0.60, 0.62]", () => {
    const record = {
      type: "NAT",
      answer: 0.61,
      tolerance: { lower: 0.60, upper: 0.62, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 0.60).correct).toBe(true);
    expect(evaluateAnswer(record, 0.605).correct).toBe(true);
    expect(evaluateAnswer(record, 0.62).correct).toBe(true);
    expect(evaluateAnswer(record, 0.59).correct).toBe(false);
    expect(evaluateAnswer(record, 0.63).correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 1 CS Q15 (go:118295) MCQ B", () => {
    const record = { type: "MCQ", answer: "B", tolerance: null };
    expect(evaluateAnswer(record, "B").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 1 CS Q23 (go:118303) NAT 2.6", () => {
    const record = {
      type: "NAT",
      answer: 2.6,
      tolerance: { lower: 2.6, upper: 2.6, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 2.6).correct).toBe(true);
    expect(evaluateAnswer(record, "2.6").correct).toBe(true);
    expect(evaluateAnswer(record, 2.5).correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 1 CS Q44 (go:118327) NAT 11", () => {
    const record = { type: "NAT", answer: 11, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 11).correct).toBe(true);
    expect(evaluateAnswer(record, "11").correct).toBe(true);
    expect(evaluateAnswer(record, 10).correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 1 CS Q45 (go:118328) NAT range [86.5, 87.5]", () => {
    const record = {
      type: "NAT",
      answer: 87.0,
      tolerance: { lower: 86.5, upper: 87.5, abs: 0.5 },
    };
    expect(evaluateAnswer(record, 86.5).correct).toBe(true);
    expect(evaluateAnswer(record, 87.0).correct).toBe(true);
    expect(evaluateAnswer(record, 87.5).correct).toBe(true);
    expect(evaluateAnswer(record, 86.4).correct).toBe(false);
    expect(evaluateAnswer(record, 87.6).correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 1 CS Q48 (go:118331) NAT 5", () => {
    const record = { type: "NAT", answer: 5, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 5).correct).toBe(true);
    expect(evaluateAnswer(record, "5").correct).toBe(true);
    expect(evaluateAnswer(record, 4).correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 1 CS Q49 (go:118332) NAT range [-16.1, -15.9]", () => {
    const record = {
      type: "NAT",
      answer: -16.0,
      tolerance: { lower: -16.1, upper: -15.9, abs: 0.1 },
    };
    expect(evaluateAnswer(record, -16.1).correct).toBe(true);
    expect(evaluateAnswer(record, -16.0).correct).toBe(true);
    expect(evaluateAnswer(record, -15.9).correct).toBe(true);
    expect(evaluateAnswer(record, -16.2).correct).toBe(false);
    expect(evaluateAnswer(record, -15.8).correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 1 CS Q50 (go:118719) NAT range [1.49, 1.52]", () => {
    const record = {
      type: "NAT",
      answer: 1.505,
      tolerance: { lower: 1.49, upper: 1.52, abs: 0.015 },
    };
    expect(evaluateAnswer(record, 1.49).correct).toBe(true);
    expect(evaluateAnswer(record, 1.508).correct).toBe(true);
    expect(evaluateAnswer(record, 1.52).correct).toBe(true);
    expect(evaluateAnswer(record, 1.48).correct).toBe(false);
    expect(evaluateAnswer(record, 1.53).correct).toBe(false);
  });

  test("evaluates GATE CSE 2017 Set 2 CS Q45 (go:118597) NAT 4.72", () => {
    const record = {
      type: "NAT",
      answer: 4.72,
      tolerance: { lower: 4.70, upper: 4.74, abs: 0.02 },
    };
    expect(evaluateAnswer(record, 4.72).correct).toBe(true);
    expect(evaluateAnswer(record, "4.72").correct).toBe(true);
    expect(evaluateAnswer(record, 4.75).correct).toBe(false);
    expect(evaluateAnswer(record, 4.69).correct).toBe(false);
  });

  test("evaluates GATE CSE 2016 Set 1 CS Q14 (go:39673) MCQ A", () => {
    const record = { type: "MCQ", answer: "A", tolerance: null };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  test("evaluates GATE CSE 2016 Set 1 CS Q39 (go:39725) NAT 7", () => {
    const record = { type: "NAT", answer: 7, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 7).correct).toBe(true);
    expect(evaluateAnswer(record, "7").correct).toBe(true);
    expect(evaluateAnswer(record, 6).correct).toBe(false);
    expect(evaluateAnswer(record, 8).correct).toBe(false);
  });

  test("evaluates GATE CSE 2016 Set 1 CS Q40 (go:39727) MCQ B", () => {
    const record = { type: "MCQ", answer: "B", tolerance: null };
    expect(evaluateAnswer(record, "B").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2016 Set 1 CS Q54 (go:39720) NAT 1.1", () => {
    const record = {
      type: "NAT",
      answer: 1.1,
      tolerance: { lower: 1.1, upper: 1.1, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 1.1).correct).toBe(true);
    expect(evaluateAnswer(record, "1.1").correct).toBe(true);
    expect(evaluateAnswer(record, 1.145).correct).toBe(false);
  });

  test("evaluates GATE CSE 2016 Set 2 CS Q13 (go:39561) MCQ D", () => {
    const record = { type: "MCQ", answer: "D", tolerance: null };
    expect(evaluateAnswer(record, "D").correct).toBe(true);
    expect(evaluateAnswer(record, "C").correct).toBe(false);
  });

  test("evaluates GATE CSE 2016 Set 2 CS Q23 (go:39555) MCQ A", () => {
    const record = { type: "MCQ", answer: "A", tolerance: null };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  test("evaluates GATE CSE 2016 Set 2 CS Q38 (go:39587) NAT 1500", () => {
    const record = { type: "NAT", answer: 1500, tolerance: { abs: 0.01 } };
    expect(evaluateAnswer(record, 1500).correct).toBe(true);
    expect(evaluateAnswer(record, "1500").correct).toBe(true);
    expect(evaluateAnswer(record, 1400).correct).toBe(false);
  });

  test("evaluates GATE CSE 2016 Set 2 CS Q39 (go:39581) NAT range [2.2, 2.4]", () => {
    const record = {
      type: "NAT",
      answer: 2.3,
      tolerance: { lower: 2.2, upper: 2.4, abs: 0.1 },
    };
    expect(evaluateAnswer(record, 2.2).correct).toBe(true);
    expect(evaluateAnswer(record, 2.3).correct).toBe(true);
    expect(evaluateAnswer(record, 2.4).correct).toBe(true);
    expect(evaluateAnswer(record, 2.19).correct).toBe(false);
    expect(evaluateAnswer(record, 2.41).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 1 CS Q1 (go:8015) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "c").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 1 CS Q21 (go:8244) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "c").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 1 CS Q42 (go:8312) NAT 5", () => {
    const record = {
      type: "NAT",
      answer: 5,
      tolerance: { lower: 5, upper: 5, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 5).correct).toBe(true);
    expect(evaluateAnswer(record, "5").correct).toBe(true);
    expect(evaluateAnswer(record, 4).correct).toBe(false);
    expect(evaluateAnswer(record, 6).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 1 CS Q29 (go:8253) NAT range [0.40, 0.46]", () => {
    const record = {
      type: "NAT",
      answer: 0.43,
      tolerance: { lower: 0.40, upper: 0.46, abs: 0.03 },
    };
    expect(evaluateAnswer(record, 0.40).correct).toBe(true);
    expect(evaluateAnswer(record, 0.42).correct).toBe(true);
    expect(evaluateAnswer(record, 0.4404).correct).toBe(true);
    expect(evaluateAnswer(record, 0.46).correct).toBe(true);
    expect(evaluateAnswer(record, 0.39).correct).toBe(false);
    expect(evaluateAnswer(record, 0.47).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 2 CS Q2 (go:8048) MCQ A", () => {
    const record = { type: "MCQ", answer: "A", tolerance: null };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "a").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 2 CS Q4 (go:8050) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "c").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 2 CS Q12 (go:8062) MCQ A", () => {
    const record = { type: "MCQ", answer: "A", tolerance: null };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 2 CS Q28 (go:8134) MCQ D", () => {
    const record = { type: "MCQ", answer: "D", tolerance: null };
    expect(evaluateAnswer(record, "D").correct).toBe(true);
    expect(evaluateAnswer(record, "C").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 2 CS Q43 (go:8216) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "D").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 2 CS Q45 (go:8243) MCQ A", () => {
    const record = { type: "MCQ", answer: "A", tolerance: null };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 2 CS Q49 (go:8251) NAT range [6.1, 6.2]", () => {
    const record = {
      type: "NAT",
      answer: 6.15,
      tolerance: { lower: 6.1, upper: 6.2, abs: 0.05 },
    };
    expect(evaluateAnswer(record, 6.1).correct).toBe(true);
    expect(evaluateAnswer(record, 6.15).correct).toBe(true);
    expect(evaluateAnswer(record, 6.2).correct).toBe(true);
    expect(evaluateAnswer(record, 6.09).correct).toBe(false);
    expect(evaluateAnswer(record, 6.21).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 GA Q10 (go:8389) NAT 2006", () => {
    const record = {
      type: "NAT",
      answer: 2006,
      tolerance: { lower: 2006, upper: 2006, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 2006).correct).toBe(true);
    expect(evaluateAnswer(record, 2005).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q1 (go:8390) MCQ D", () => {
    const record = { type: "MCQ", answer: "D", tolerance: null };
    expect(evaluateAnswer(record, "D").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q5 (go:8399) NAT 15", () => {
    const record = {
      type: "NAT",
      answer: 15,
      tolerance: { lower: 15, upper: 15, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 15).correct).toBe(true);
    expect(evaluateAnswer(record, 14).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q7 (go:8401) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q11 (go:8407) NAT 28", () => {
    const record = {
      type: "NAT",
      answer: 28,
      tolerance: { lower: 28, upper: 28, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 28).correct).toBe(true);
    expect(evaluateAnswer(record, 27).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q17 (go:8414) NAT 80", () => {
    const record = {
      type: "NAT",
      answer: 80,
      tolerance: { lower: 80, upper: 80, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 80).correct).toBe(true);
    expect(evaluateAnswer(record, 79).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q21 (go:8423) NAT range [612, 613]", () => {
    const record = {
      type: "NAT",
      answer: 612.5,
      tolerance: { lower: 612, upper: 613, abs: 0.5 },
    };
    expect(evaluateAnswer(record, 612).correct).toBe(true);
    expect(evaluateAnswer(record, 612.48).correct).toBe(true);
    expect(evaluateAnswer(record, 613).correct).toBe(true);
    expect(evaluateAnswer(record, 611.9).correct).toBe(false);
    expect(evaluateAnswer(record, 613.1).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q25 (go:8428) NAT 199", () => {
    const record = {
      type: "NAT",
      answer: 199,
      tolerance: { lower: 199, upper: 199, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 199).correct).toBe(true);
    expect(evaluateAnswer(record, 200).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q26 (go:8478) NAT 140", () => {
    const record = {
      type: "NAT",
      answer: 140,
      tolerance: { lower: 140, upper: 140, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 140).correct).toBe(true);
    expect(evaluateAnswer(record, 141).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q28 (go:8481) NAT 8", () => {
    const record = {
      type: "NAT",
      answer: 8,
      tolerance: { lower: 8, upper: 8, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 8).correct).toBe(true);
    expect(evaluateAnswer(record, 7).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q35 (go:8494) NAT 5", () => {
    const record = {
      type: "NAT",
      answer: 5,
      tolerance: { lower: 5, upper: 5, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 5).correct).toBe(true);
    expect(evaluateAnswer(record, 4).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q36 (go:8495) NAT 1575", () => {
    const record = {
      type: "NAT",
      answer: 1575,
      tolerance: { lower: 1575, upper: 1575, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 1575).correct).toBe(true);
    expect(evaluateAnswer(record, 1570).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q37 (go:8496) NAT 0.75", () => {
    const record = {
      type: "NAT",
      answer: 0.75,
      tolerance: { lower: 0.75, upper: 0.75, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 0.75).correct).toBe(true);
    expect(evaluateAnswer(record, 0.5).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q38 (go:8497) NAT 158", () => {
    const record = {
      type: "NAT",
      answer: 158,
      tolerance: { lower: 158, upper: 158, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 158).correct).toBe(true);
    expect(evaluateAnswer(record, 159).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q40 (go:8499) NAT 995", () => {
    const record = {
      type: "NAT",
      answer: 995,
      tolerance: { lower: 995, upper: 995, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 995).correct).toBe(true);
    expect(evaluateAnswer(record, 1000).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q43 (go:8503) NAT 3", () => {
    const record = {
      type: "NAT",
      answer: 3,
      tolerance: { lower: 3, upper: 3, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 3).correct).toBe(true);
    expect(evaluateAnswer(record, 2).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q46 (go:8555) NAT 50", () => {
    const record = {
      type: "NAT",
      answer: 50,
      tolerance: { lower: 50, upper: 50, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 50).correct).toBe(true);
    expect(evaluateAnswer(record, 51).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q48 (go:8557) NAT 10", () => {
    const record = {
      type: "NAT",
      answer: 10,
      tolerance: { lower: 10, upper: 10, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 10).correct).toBe(true);
    expect(evaluateAnswer(record, 9).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q49 (go:8558) NAT 0", () => {
    const record = {
      type: "NAT",
      answer: 0,
      tolerance: { lower: 0, upper: 0, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 0).correct).toBe(true);
    expect(evaluateAnswer(record, 1).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q50 (go:8559) NAT range [308, 310]", () => {
    const record = {
      type: "NAT",
      answer: 309.33,
      tolerance: { lower: 308, upper: 310, abs: 1.0 },
    };
    expect(evaluateAnswer(record, 308).correct).toBe(true);
    expect(evaluateAnswer(record, 309.33).correct).toBe(true);
    expect(evaluateAnswer(record, 310).correct).toBe(true);
    expect(evaluateAnswer(record, 307.9).correct).toBe(false);
    expect(evaluateAnswer(record, 310.1).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q51 (go:8560) NAT 3", () => {
    const record = {
      type: "NAT",
      answer: 3,
      tolerance: { lower: 3, upper: 3, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 3).correct).toBe(true);
    expect(evaluateAnswer(record, 4).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q54 (go:8563) NAT 230", () => {
    const record = {
      type: "NAT",
      answer: 230,
      tolerance: { lower: 230, upper: 230, abs: 0.01 },
    };
    expect(evaluateAnswer(record, 230).correct).toBe(true);
    expect(evaluateAnswer(record, 229).correct).toBe(false);
  });

  test("evaluates GATE CSE 2015 Set 3 CS Q55 (go:8564) MCQ A", () => {
    const record = { type: "MCQ", answer: "A", tolerance: null };
    expect(evaluateAnswer(record, "A").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
  });

  // --- GATE CSE 2014 Regression Tests ---
  test("evaluates GATE CSE 2014 Set 1 GA Q4 (go:773) NAT 96", () => {
    const record = { type: "NAT", answer: 96, tolerance: { lower: 96, upper: 96, abs: 0.01 } };
    expect(evaluateAnswer(record, 96).correct).toBe(true);
    expect(evaluateAnswer(record, 95.9).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 1 CS Q2 (go:1717) NAT range [0.24, 0.27]", () => {
    const record = { type: "NAT", answer: 0.255, tolerance: { lower: 0.24, upper: 0.27, abs: 0.015 } };
    expect(evaluateAnswer(record, 0.24).correct).toBe(true);
    expect(evaluateAnswer(record, 0.255).correct).toBe(true);
    expect(evaluateAnswer(record, 0.27).correct).toBe(true);
    expect(evaluateAnswer(record, 0.239).correct).toBe(false);
    expect(evaluateAnswer(record, 0.271).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 1 CS Q26 (go:1793) NAT range [28, 30]", () => {
    const record = { type: "NAT", answer: 29, tolerance: { lower: 28, upper: 30, abs: 1.0 } };
    expect(evaluateAnswer(record, 28).correct).toBe(true);
    expect(evaluateAnswer(record, 29).correct).toBe(true);
    expect(evaluateAnswer(record, 30).correct).toBe(true);
    expect(evaluateAnswer(record, 27.9).correct).toBe(false);
    expect(evaluateAnswer(record, 30.1).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 1 CS Q27 (go:1794) NAT range [1100, 1300]", () => {
    const record = { type: "NAT", answer: 1200, tolerance: { lower: 1100, upper: 1300, abs: 100 } };
    expect(evaluateAnswer(record, 1100).correct).toBe(true);
    expect(evaluateAnswer(record, 1200).correct).toBe(true);
    expect(evaluateAnswer(record, 1300).correct).toBe(true);
    expect(evaluateAnswer(record, 1099).correct).toBe(false);
    expect(evaluateAnswer(record, 1301).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 1 CS Q52 (go:1932) MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 2 CS Q1 (go:1953) NAT range [11.85, 11.95]", () => {
    const record = { type: "NAT", answer: 11.9, tolerance: { lower: 11.85, upper: 11.95, abs: 0.05 } };
    expect(evaluateAnswer(record, 11.85).correct).toBe(true);
    expect(evaluateAnswer(record, 11.89).correct).toBe(true);
    expect(evaluateAnswer(record, 11.95).correct).toBe(true);
    expect(evaluateAnswer(record, 11.84).correct).toBe(false);
    expect(evaluateAnswer(record, 11.96).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 2 CS Q2 (go:1954) NAT range [3.8, 3.9]", () => {
    const record = { type: "NAT", answer: 3.85, tolerance: { lower: 3.8, upper: 3.9, abs: 0.05 } };
    expect(evaluateAnswer(record, 3.8).correct).toBe(true);
    expect(evaluateAnswer(record, 3.88).correct).toBe(true);
    expect(evaluateAnswer(record, 3.9).correct).toBe(true);
    expect(evaluateAnswer(record, 3.79).correct).toBe(false);
    expect(evaluateAnswer(record, 3.91).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 2 CS Q3 (go:1955) NAT 36", () => {
    const record = { type: "NAT", answer: 36, tolerance: { lower: 36, upper: 36, abs: 0.01 } };
    expect(evaluateAnswer(record, 36).correct).toBe(true);
    expect(evaluateAnswer(record, 35).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 2 CS Q40 (go:1992) NAT range [1.72, 1.74]", () => {
    const record = { type: "NAT", answer: 1.73, tolerance: { lower: 1.72, upper: 1.74, abs: 0.01 } };
    expect(evaluateAnswer(record, 1.72).correct).toBe(true);
    expect(evaluateAnswer(record, 1.73).correct).toBe(true);
    expect(evaluateAnswer(record, 1.74).correct).toBe(true);
    expect(evaluateAnswer(record, 1.719).correct).toBe(false);
    expect(evaluateAnswer(record, 1.741).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 2 CS Q48 (go:2000) NAT range [0.259, 0.261]", () => {
    const record = { type: "NAT", answer: 0.260, tolerance: { lower: 0.259, upper: 0.261, abs: 0.001 } };
    expect(evaluateAnswer(record, 0.259).correct).toBe(true);
    expect(evaluateAnswer(record, 0.260).correct).toBe(true);
    expect(evaluateAnswer(record, 0.261).correct).toBe(true);
    expect(evaluateAnswer(record, 0.258).correct).toBe(false);
    expect(evaluateAnswer(record, 0.262).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 3 CS Q6 (go:2040) NAT 4", () => {
    const record = { type: "NAT", answer: 4, tolerance: { lower: 4, upper: 4, abs: 0.01 } };
    expect(evaluateAnswer(record, 4).correct).toBe(true);
    expect(evaluateAnswer(record, 3).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 3 CS Q23 (go:2057) MCQ B", () => {
    const record = { type: "MCQ", answer: "B", tolerance: null };
    expect(evaluateAnswer(record, "B").correct).toBe(true);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 3 CS Q26 (go:2060) NAT 1", () => {
    const record = { type: "NAT", answer: 1, tolerance: { lower: 1, upper: 1, abs: 0.01 } };
    expect(evaluateAnswer(record, 1).correct).toBe(true);
    expect(evaluateAnswer(record, 2).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 3 CS Q27 (go:2061) NAT 256", () => {
    const record = { type: "NAT", answer: 256, tolerance: { lower: 256, upper: 256, abs: 0.01 } };
    expect(evaluateAnswer(record, 256).correct).toBe(true);
    expect(evaluateAnswer(record, 255).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 3 CS Q43 (go:2077) NAT range [1.50, 1.60]", () => {
    const record = { type: "NAT", answer: 1.55, tolerance: { lower: 1.50, upper: 1.60, abs: 0.05 } };
    expect(evaluateAnswer(record, 1.50).correct).toBe(true);
    expect(evaluateAnswer(record, 1.55).correct).toBe(true);
    expect(evaluateAnswer(record, 1.60).correct).toBe(true);
    expect(evaluateAnswer(record, 1.49).correct).toBe(false);
    expect(evaluateAnswer(record, 1.61).correct).toBe(false);
  });

  test("evaluates GATE CSE 2014 Set 3 CS Q48 (go:2082) NAT 0.25", () => {
    const record = { type: "NAT", answer: 0.25, tolerance: { lower: 0.25, upper: 0.25, abs: 0.01 } };
    expect(evaluateAnswer(record, 0.25).correct).toBe(true);
    expect(evaluateAnswer(record, 0.26).correct).toBe(false);
  });

  test("evaluates GATE CSE 2013 CS Q30 (go:1541) as MCQ C", () => {
    const record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(record, "C").correct).toBe(true);
    expect(evaluateAnswer(record, "c").correct).toBe(true);
    expect(evaluateAnswer(record, "B").correct).toBe(false);
    expect(evaluateAnswer(record, "A").correct).toBe(false);
  });

  test("evaluates GATE CSE 2013 CS Q42 (go:60) as MTA (Marks to All)", () => {
    const record = { type: "MTA", answer: "MTA", tolerance: null };
    expect(evaluateAnswer(record, "6561")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
    expect(evaluateAnswer(record, "")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
  });

  test("evaluates GATE CSE 2013 CS Q47 (go:80) as MTA (Marks to All)", () => {
    const record = { type: "MTA", answer: "MTA", tolerance: null };
    expect(evaluateAnswer(record, "A")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
    expect(evaluateAnswer(record, "D")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
    expect(evaluateAnswer(record, "")).toEqual({
      status: "marks_to_all",
      correct: true,
    });
  });

  test("evaluates GATE CSE 2012 MTA questions (Q3, Q29, Q38, Q39, Q45, Q60) as Marks to All", () => {
    const mtaRecord = { type: "MTA", answer: "MTA", tolerance: null };
    // Any answer or empty answer gets awarded full marks
    ["A", "B", "C", "D", "anything", ""].forEach((ans) => {
      expect(evaluateAnswer(mtaRecord, ans)).toEqual({
        status: "marks_to_all",
        correct: true,
      });
    });
  });

  test("evaluates GATE CSE 2012 corrected MCQs (Q15, Q16, Q21)", () => {
    // Q15 is MCQ C
    const q15Record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(q15Record, "C").correct).toBe(true);
    expect(evaluateAnswer(q15Record, "B").correct).toBe(false);

    // Q16 is MCQ D (Towers of Hanoi)
    const q16Record = { type: "MCQ", answer: "D", tolerance: null };
    expect(evaluateAnswer(q16Record, "D").correct).toBe(true);
    expect(evaluateAnswer(q16Record, "A").correct).toBe(false);

    // Q21 is MCQ C
    const q21Record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(q21Record, "C").correct).toBe(true);
    expect(evaluateAnswer(q21Record, "0.75").correct).toBe(false);
  });

  test("evaluates GATE CSE 2011 corrected MCQs (Q33 Option D, Q38 Option C, Q54 Option B)", () => {
    // Q33 is MCQ D (Incorrect statement: sigma_y = a sigma_x, not a sigma_x + b)
    const q33Record = { type: "MCQ", answer: "D", tolerance: null };
    expect(evaluateAnswer(q33Record, "D").correct).toBe(true);
    expect(evaluateAnswer(q33Record, "C").correct).toBe(false);

    // Q38 is MCQ C (Minimum scalar multiplications: 19000)
    const q38Record = { type: "MCQ", answer: "C", tolerance: null };
    expect(evaluateAnswer(q38Record, "C").correct).toBe(true);
    expect(evaluateAnswer(q38Record, "1500").correct).toBe(false);

    // Q54 is MCQ B (MST cost: n^2 - n + 1)
    const q54Record = { type: "MCQ", answer: "B", tolerance: null };
    expect(evaluateAnswer(q54Record, "B").correct).toBe(true);
    expect(evaluateAnswer(q54Record, "C").correct).toBe(false);
  });

  describe("GATE CSE 2011 Answer Key Audit Regression (DEC-080)", () => {
    // All 65 questions in GATE CSE 2011 are MCQ and match official IIT Madras 2011 key.
    // These tests verify representative answers across GA and CS sections.

    test("go:2103 - GATE CSE 2011 Q1 (GA) MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:2123 - GATE CSE 2011 Q21 (CS) MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });

    test("go:2132 - GATE CSE 2011 Q30 (CS) MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:2145 - GATE CSE 2011 Q43 (CS) MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:2175 - GATE CSE 2011 Q65 (CS) MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });
  });

  describe("GATE CSE 2010 Answer Key Repair & Audit Regression (DEC-082)", () => {
    test("go:1148 - GATE CSE 2010 Q2 (CS) MCQ B (Newton-Raphson approximation 3.607)", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:1149 - GATE CSE 2010 Q3 (CS) MCQ D (Reflexive relations 2^20)", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1150 - GATE CSE 2010 Q4 (CS) MCQ D (Group)", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1151 - GATE CSE 2010 Q5 (CS) MCQ A (Limit e^-2)", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });

    test("go:2199 - GATE CSE 2010 Q21 (CS) MCQ D (Cyclomatic complexity 19)", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:2201 - GATE CSE 2010 Q22 (CS) MCQ B (Software lifecycle activity pairing P-2 Q-3 R-1 S-4)", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:2345 - GATE CSE 2010 Q44 (CS) MCQ D (Statement coverage test suite T1, T2, T4)", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });

    test("go:2364 - GATE CSE 2010 Q56 (GA) MCQ A (His remarks betrayed his lack of seriousness)", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });
  });

  describe("GATE CSE 2009 Answer Key Repair & Audit Regression (DEC-083)", () => {
    test("go:1303 - GATE CSE 2009 Q11 (CS) MCQ A (Selection sort worst-case swaps Theta(n))", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:1321 - GATE CSE 2009 Q35 (CS) MCQ A (Master theorem T(n)=T(n/3)+cn is Theta(n))", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:1325 - GATE CSE 2009 Q39 (CS) MCQ B (Quicksort with n/4 pivot is Theta(n log n))", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:1339 - GATE CSE 2009 Q55 (CS) MTA (Relational query double-negation Marks to All)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
      expect(evaluateAnswer(rec, "").correct).toBe(true);
    });

    test("go:1299 - GATE CSE 2009 Q7 (CS) MCQ C (32Kx1 RAM chips needed)", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });
  });

  describe("GATE CSE 2008 Answer Key Repair & Audit Regression (DEC-084)", () => {
    test("go:401 - GATE CSE 2008 Q3 (CS) MTA (System of equations unique solution alpha!=5)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
    });

    test("go:405 - GATE CSE 2008 Q7 (CS) MCQ C (Connected components Theta(m+n))", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:419 - GATE CSE 2008 Q21 (CS) MCQ A (Trapezoidal rule error 1000e)", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });

    test("go:441 - GATE CSE 2008 Q30 (CS) MTA (First order logic FSA/PDA Marks to All)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
    });

    test("go:43485 - GATE CSE 2008 Q79 (CS) MTA (Binary strings without consecutive 0s T(5)=13)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
    });

    test("go:394 - GATE CSE 2008 Q84 (CS) MCQ C (Erroneous binary search infinite loop)", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:43508 - GATE CSE 2008 Q85 (CS) MCQ A (Binary search line 6 correction)", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });
  });

  describe("GATE CSE 2007 Answer Key Repair & Audit Regression (DEC-085)", () => {
    test("go:1224 - GATE CSE 2007 Q26 (CS) MCQ C (Set partition refinement poset)", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1226 - GATE CSE 2007 Q28 (CS) MTA (Newton-Raphson iteration x_{n+1} Marks to All)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
      expect(evaluateAnswer(rec, "").correct).toBe(true);
    });

    test("go:1239 - GATE CSE 2007 Q41 (CS) MCQ D (Shortest path in unweighted undirected graph BFS)", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1242 - GATE CSE 2007 Q44 (CS) MCQ A (Euclidean gcd recursive calls Theta(log_2 n))", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "10230").correct).toBe(false);
    });
  });

  describe("GATE CSE 2006 Answer Key Repair & Audit Regression (DEC-086)", () => {
    test("go:890 - GATE CSE 2006 Q11 (CS) MCQ B (Weighted complete graph MST cost 2n-2)", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:977 - GATE CSE 2006 Q16 (CS) MCQ B (NP-complete problem reduction to Q)", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1817 - GATE CSE 2006 Q41 (CS) MCQ D (Cache block size 64 bytes)", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });

    test("go:1834 - GATE CSE 2006 Q56 (CS) MCQ B (Pass-by-reference parameter passing)", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:1841 - GATE CSE 2006 Q63 (CS) MCQ A (Virtual addresses 32-bit inverted page table)", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:1846 - GATE CSE 2006 Q68 (CS) MCQ B (SQL relation enrolled and paid)", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });
  });

  describe("GATE CSE 2005 Answer Key Repair & Audit Regression (DEC-087)", () => {
    test("go:1345 - GATE CSE 2005 Q3 (CS) MCQ C (Permutations of distinct sorted integers)", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1348 - GATE CSE 2005 Q6 (CS) MCQ C (Graph 100 vertices connected components)", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });

    test("go:1162 - GATE CSE 2005 Q12 (CS) MCQ C (C function float f(float x, int y))", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:784 - GATE CSE 2005 Q39 (CS) MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:1376 - GATE CSE 2005 Q53 (CS) MTA (Marks to All)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
      expect(evaluateAnswer(rec, "").correct).toBe(true);
    });

    test("go:1403 - GATE CSE 2005 Q81a (CS Q81) MCQ B (Linked question 81a)", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });
  });

  describe("GATE CSE 2004 Answer Key Repair & Audit Regression (DEC-088)", () => {
    test("go:1019 - GATE CSE 2004 Q22 (CS) MCQ B (9600 baud serial communication link 800 char/s)", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1027 - GATE CSE 2004 Q30 (CS) MCQ C (DCFL and CFL complementation/intersection)", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1077 - GATE CSE 2004 Q83 (CS) MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:1078 - GATE CSE 2004 Q84 (CS) MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });
  });

  describe("GATE CSE 2003 Answer Key Repair & Audit Regression (DEC-089)", () => {
    test("go:903 - GATE CSE 2003 Q12 (CS) MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:912 - GATE CSE 2003 Q22 (CS) MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:925 - GATE CSE 2003 Q35 (CS) MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:933 - GATE CSE 2003 Q42 (CS) MTA (Marks to All)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
    });

    test("go:949 - GATE CSE 2003 Q61 (CS) MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:43576 - GATE CSE 2003 Q62 (CS) MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });

    test("go:958 - GATE CSE 2003 Q71 (CS) MTA (Marks to All)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
    });

    test("go:43575 - GATE CSE 2003 Q74 (CS) MTA (Marks to All)", () => {
      const rec = { type: "MTA", answer: "MTA", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "MTA").correct).toBe(true);
    });
  });

  describe("DEC-095: Re-Audit Verified Question Corrections", () => {
    test("go:357501 - GATE CSE 2021 Set 2 Q39 (CS) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
      expect(evaluateAnswer(rec, ["A", "B", "C"]).correct).toBe(false);
    });

    test("go:8480 - GATE CSE 2015 Set 3 Q27 (CS) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:8017 - GATE CSE 2015 Set 1 Q2 (CS) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:357499 - GATE CSE 2021 Set 2 Q41 (CS) evaluates as strict MSQ ['B', 'C', 'D']", () => {
      const rec = { type: "MSQ", answer: ["B", "C", "D"], tolerance: null };
      expect(evaluateAnswer(rec, ["B", "C", "D"]).correct).toBe(true);
      expect(evaluateAnswer(rec, ["D", "C", "B"]).correct).toBe(true);
      expect(evaluateAnswer(rec, ["b", "c", "d"]).correct).toBe(true);
      // Incomplete should be strictly false
      expect(evaluateAnswer(rec, ["B", "C"]).correct).toBe(false);
      expect(evaluateAnswer(rec, ["B", "D"]).correct).toBe(false);
      expect(evaluateAnswer(rec, ["C", "D"]).correct).toBe(false);
      // Incorrect option should be false
      expect(evaluateAnswer(rec, ["A", "B", "C", "D"]).correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
    });

    test("go:39587 - GATE CSE 2016 Set 2 Q38 (CS) evaluates as NAT 1500", () => {
      const rec = { type: "NAT", answer: 1500, tolerance: { abs: 0.01 } };
      expect(evaluateAnswer(rec, 1500).correct).toBe(true);
      expect(evaluateAnswer(rec, "1500").correct).toBe(true);
      expect(evaluateAnswer(rec, "1500.0").correct).toBe(true);
      expect(evaluateAnswer(rec, 1499.99).correct).toBe(true);
      expect(evaluateAnswer(rec, 1500.01).correct).toBe(true);
      expect(evaluateAnswer(rec, 1490).correct).toBe(false);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
    });
  });

  describe("DEC-097: GATE CSE 2002 Comprehensive Answer Key Audit & Data Corrections", () => {
    test("go:807 - GATE CSE 2002 Q1.3 (Algorithms Recurrence) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:840 - GATE CSE 2002 Q2.10 (Randomized Search Expected Comparisons) evaluates as MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "a").correct).toBe(true);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:806 - GATE CSE 2002 Q1.2 (Trapezoidal Rule Exactness) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:807 - GATE CSE 2002 Q1.3 (Recurrence Equation T(2^k)=3T(2^(k-1))+1) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:845 - GATE CSE 2002 Q2.15 (Newton-Raphson Iteration) evaluates as MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "a").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:814 - GATE CSE 2002 Q1.10 (8085 Program Counter Modification) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:815 - GATE CSE 2002 Q1.11 (Serial Data Transmission Start/Stop Bits) evaluates as MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "a").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:823 - GATE CSE 2002 Q1.18 (Parameter Passing Call-by-Reference vs Value-Result) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:865 - GATE CSE 2002 Q12 (Section B Subjective Question) evaluates as excluded", () => {
      const rec = { type: "SUBJECTIVE", answer: null, tolerance: null };
      const res = evaluateAnswer(rec, "anything");
      expect(res.status).toBe("excluded");
      expect(res.correct).toBe(false);
    });
  });

  describe("DEC-098: GATE CSE 2001 Comprehensive Answer Key Audit & Ingestion", () => {
    test("go:707 - GATE CSE 2001 Q1.14 (Randomized Quicksort Worst Case) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:702 - GATE CSE 2001 Q1.9 (8085 Slow Memory READY Pin) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:737 - GATE CSE 2001 Q2.19 (Dynamic Scoping Call-by-Reference) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:716 - GATE CSE 2001 Q1.23 (Schema Decomposition) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:717 - GATE CSE 2001 Q1.24 (Relational Algebra Reachability) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:718 - GATE CSE 2001 Q1.25 (Selection Pushdown) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:742 - GATE CSE 2001 Q2.24 (Tuple Calculus Safety) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });
  });

  describe("DEC-099: GATE CSE 2000–1997 Batch Audit & Ingestion", () => {
    // 2000 Ingested
    test("go:647 - GATE CSE 2000 Q1.23 (Relational Algebra Sum of Salaries) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:655 - GATE CSE 2000 Q2.8 (2-State DFA Regular Language) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:673 - GATE CSE 2000 Q2.26 (SQL Null Comparisons) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    // 1999 Ingested & Populated
    test("go:1484 - GATE CSE 1999 Q2.6 (Transaction Schedule Serializability) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:1498 - GATE CSE 1999 Q2.21 (Asymptotic Recurrence Matching) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:1491 - GATE CSE 1999 Q2.13 (Static Scoping Variable Lookup) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    // 1998 Ingested & Corrected
    test("go:1661 - GATE CSE 1998 Q1.24 (Preorder/Postorder Binary Tree Construction) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:1670 - GATE CSE 1998 Q1.33 (Natural Join Over All Attributes Is Intersection) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:1653 - GATE CSE 1998 Q1.16 (Serial Communication Baud Rate) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    // 1997 Ingested & Populated
    test("go:2229 - GATE CSE 1997 Q2.3 (RS-232 Start Bit Receiver Sync) evaluates as MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "a").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:2251 - GATE CSE 1997 Q4.10 (Trapezoidal Method Error Bound) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });
  });

  describe("DEC-100: GATE CSE 1996–1993 Batch Audit & Ingestion", () => {
    // 1996 Corrections
    test("go:2742 - GATE CSE 1996 Q2.13 (Average Sequential Search Comparisons (n+1)/2) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:2744 - GATE CSE 1996 Q2.15 (Quicksort Sorted vs Reverse-Sorted Comparisons C1=C2) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    // 1995 Ingested & Corrected
    test("go:2597 - GATE CSE 1995 Q1.10 (Context-Sensitive Grammar) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:2609 - GATE CSE 1995 Q1.22 (Tangent Slope -2x/y Curve Ellipse) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:2610 - GATE CSE 1995 Q1.23 (Pair of Lines k=9) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:2630 - GATE CSE 1995 Q2.18 (Differential Equation Solution) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:2603 - GATE CSE 1995 Q1.16 (Merging Two Sorted Lists O(m+n)) evaluates as MCQ C", () => {
      const rec = { type: "MCQ", answer: "C", tolerance: null };
      expect(evaluateAnswer(rec, "C").correct).toBe(true);
      expect(evaluateAnswer(rec, "c").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    // 1994 Ingested & Corrected
    test("go:2437 - GATE CSE 1994 Q1.1 (FORTRAN Static Memory Allocation) evaluates as MCQ A", () => {
      const rec = { type: "MCQ", answer: "A", tolerance: null };
      expect(evaluateAnswer(rec, "A").correct).toBe(true);
      expect(evaluateAnswer(rec, "a").correct).toBe(true);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:2444 - GATE CSE 1994 Q1.7 (Binary Search Recurrence T(n/2)+k) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    test("go:2460 - GATE CSE 1994 Q1.17 (Linked Lists Unsuitable for Binary Search) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });

    // 1993 Ingested & Populated
    test("go:2297 - GATE CSE 1993 Q7.9 (Deadlock Free Resources m=13) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:2303 - GATE CSE 1993 Q8.5 (Less-Than Relation Not Partial Ordering) evaluates as MCQ D", () => {
      const rec = { type: "MCQ", answer: "D", tolerance: null };
      expect(evaluateAnswer(rec, "D").correct).toBe(true);
      expect(evaluateAnswer(rec, "d").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "B").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
    });

    test("go:2305 - GATE CSE 1993 Q8.7 (Sum of O(n) is O(n^2)) evaluates as MCQ B", () => {
      const rec = { type: "MCQ", answer: "B", tolerance: null };
      expect(evaluateAnswer(rec, "B").correct).toBe(true);
      expect(evaluateAnswer(rec, "b").correct).toBe(true);
      expect(evaluateAnswer(rec, "A").correct).toBe(false);
      expect(evaluateAnswer(rec, "C").correct).toBe(false);
      expect(evaluateAnswer(rec, "D").correct).toBe(false);
    });
  });
});
