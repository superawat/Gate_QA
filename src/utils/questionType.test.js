import { describe, test, expect, beforeEach } from "vitest";
import {
  getDisplayQuestionTypeToken,
  getDisplayQuestionTypeLabel,
  isMtaQuestion,
  MTA_EXPLANATION_TEXT,
} from "./questionType";
import { AnswerService } from "../services/AnswerService";

describe("questionType utilities", () => {
  beforeEach(() => {
    AnswerService.answersByQuestionUid = {};
  });

  describe("getDisplayQuestionTypeToken", () => {
    test("returns empty string for null/undefined or empty object", () => {
      expect(getDisplayQuestionTypeToken(null)).toBe("");
      expect(getDisplayQuestionTypeToken(undefined)).toBe("");
      expect(getDisplayQuestionTypeToken({})).toBe("");
    });

    test("recognizes mcq, msq, nat, mta, and multi_nat", () => {
      expect(getDisplayQuestionTypeToken({ type: "MCQ" })).toBe("mcq");
      expect(getDisplayQuestionTypeToken({ type: "msq" })).toBe("msq");
      expect(getDisplayQuestionTypeToken({ type: "NAT" })).toBe("nat");
      expect(getDisplayQuestionTypeToken({ type: "MTA" })).toBe("mta");
      expect(getDisplayQuestionTypeToken({ type: "MARKS_TO_ALL" })).toBe("mta");
      expect(getDisplayQuestionTypeToken({ type: "multi-nat" })).toBe("multi_nat");
      expect(getDisplayQuestionTypeToken({ type: "multi_blank_nat" })).toBe("multi_nat");
    });

    test("reads from answer_meta or answerMeta", () => {
      expect(getDisplayQuestionTypeToken({ answer_meta: { type: "MTA" } })).toBe("mta");
      expect(getDisplayQuestionTypeToken({ answerMeta: { type: "NAT" } })).toBe("nat");
    });
  });

  describe("getDisplayQuestionTypeLabel", () => {
    test("formats tokens with standard uppercase or Multi-NAT", () => {
      expect(getDisplayQuestionTypeLabel({ type: "MCQ" })).toBe("MCQ");
      expect(getDisplayQuestionTypeLabel({ type: "MTA" })).toBe("MTA");
      expect(getDisplayQuestionTypeLabel({ type: "multi_nat" })).toBe("Multi-NAT");
    });
  });

  describe("isMtaQuestion", () => {
    test("returns false for non-object or non-MTA questions", () => {
      expect(isMtaQuestion(null)).toBe(false);
      expect(isMtaQuestion(undefined)).toBe(false);
      expect(isMtaQuestion({})).toBe(false);
      expect(isMtaQuestion({ type: "MCQ", answer: "A" })).toBe(false);
      expect(isMtaQuestion({ type: "NAT", answer: 42 })).toBe(false);
    });

    test("identifies MTA from question.type", () => {
      expect(isMtaQuestion({ type: "MTA" })).toBe(true);
      expect(isMtaQuestion({ type: "mta" })).toBe(true);
      expect(isMtaQuestion({ type: "MARKS_TO_ALL" })).toBe(true);
      expect(isMtaQuestion({ type: "marks-to-all" })).toBe(true);
    });

    test("identifies MTA from question.answer_meta.type", () => {
      expect(isMtaQuestion({ answer_meta: { type: "MTA" } })).toBe(true);
      expect(isMtaQuestion({ answerMeta: { type: "MARKS_TO_ALL" } })).toBe(true);
    });

    test("identifies MTA from question.answer or answer_meta.answer", () => {
      expect(isMtaQuestion({ answer: "MTA" })).toBe(true);
      expect(isMtaQuestion({ answer_meta: { answer: "MTA" } })).toBe(true);
    });

    test("identifies MTA from explicit answerRecord parameter", () => {
      expect(isMtaQuestion(null, { type: "MTA", answer: "MTA" })).toBe(true);
      expect(isMtaQuestion({ type: "MCQ" }, { type: "MTA" })).toBe(true);
      expect(isMtaQuestion({ type: "MCQ" }, { type: "MARKS_TO_ALL" })).toBe(true);
      expect(isMtaQuestion({ type: "MCQ" }, { type: "MCQ", answer: "MTA" })).toBe(true);
      expect(isMtaQuestion({ type: "MCQ" }, { type: "MCQ", answer: "A" })).toBe(false);
    });

    test("identifies MTA via AnswerService lookup", () => {
      AnswerService.answersByQuestionUid["go:99999"] = {
        type: "MTA",
        answer: "MTA",
      };
      expect(isMtaQuestion({ question_uid: "go:99999" })).toBe(true);
    });
  });

  describe("MTA_EXPLANATION_TEXT", () => {
    test("has expected text", () => {
      expect(MTA_EXPLANATION_TEXT).toContain("Full marks are awarded to everyone");
    });
  });
});
