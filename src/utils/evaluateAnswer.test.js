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
});


