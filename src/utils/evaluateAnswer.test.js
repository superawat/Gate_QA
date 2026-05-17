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
});
