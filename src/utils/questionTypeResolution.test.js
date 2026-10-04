import { describe, expect, test } from "vitest";
import { resolveQuestionType } from "./questionTypeResolution.js";

describe("resolveQuestionType", () => {
  test("does not treat numerical content tags or numeric answers as NAT format", () => {
    expect(resolveQuestionType({
      candidates: [],
      optionCount: 0,
      answer: 12,
      tags: ["numerical-answers"],
    })).toMatchObject({ type: "", issues: ["missing_type"] });
  });

  test("uses answer-label shape to infer MCQ or MSQ only when choices exist", () => {
    expect(resolveQuestionType({ optionCount: 4, answer: "A" }).type).toBe("MCQ");
    expect(resolveQuestionType({ optionCount: 4, answer: ["A", "C"] }).type).toBe("MSQ");
    expect(resolveQuestionType({ optionCount: 4, answer: null }).type).toBe("");
  });

  test("fails closed when explicit type metadata conflicts or NAT has choices", () => {
    expect(resolveQuestionType({
      candidates: [
        { source: "answer_record", type: "MCQ" },
        { source: "catalog", type: "NAT" },
      ],
      optionCount: 4,
      answer: "A",
    })).toMatchObject({ type: "", issues: ["type_mismatch"] });

    expect(resolveQuestionType({
      candidates: [{ source: "answer_record", type: "NAT" }],
      optionCount: 4,
      answer: 12,
    })).toMatchObject({ type: "", issues: ["type_option_conflict"] });
  });

  test("does not confuse lettered multipart prompts with structured choices", () => {
    expect(resolveQuestionType({
      candidates: [{ source: "answer_record", type: "NAT" }],
      optionCount: 3,
      conflictOptionCount: 0,
      answer: 9,
    })).toMatchObject({ type: "NAT", issues: [] });
  });
});
