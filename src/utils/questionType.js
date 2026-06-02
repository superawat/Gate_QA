import { AnswerService } from "../services/AnswerService";

const DISPLAY_TYPE_TOKENS = new Set(["mcq", "msq", "nat"]);

const normalizeTypeToken = (value = "") => {
  const token = String(value || "").trim().toLowerCase();
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
