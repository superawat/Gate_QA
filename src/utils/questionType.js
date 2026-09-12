import { AnswerService } from "../services/AnswerService";

const DISPLAY_TYPE_TOKENS = new Set(["mcq", "msq", "nat", "mta"]);

export const MTA_EXPLANATION_TEXT =
  "MTA (Marks To All): Full marks are awarded to everyone for this question.";

const normalizeTypeToken = (value = "") => {
  const token = String(value || "").trim().toLowerCase();
  if (token === "marks_to_all") {
    return "mta";
  }
  return DISPLAY_TYPE_TOKENS.has(token) ? token : "";
};

export function getDisplayQuestionTypeToken(question = null) {
  if (!question || typeof question !== "object") {
    return "";
  }

  const candidates = [
    question.type,
    question.answer_meta?.type,
    question.answerMeta?.type,
    AnswerService.getAnswerForQuestion(question)?.type,
  ];

  for (const candidate of candidates) {
    const token = normalizeTypeToken(candidate);
    if (token) {
      return token;
    }
  }

  return "";
}

export function getDisplayQuestionTypeLabel(question = null) {
  return getDisplayQuestionTypeToken(question).toUpperCase();
}
