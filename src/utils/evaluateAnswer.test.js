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
});





