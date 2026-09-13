import { AnswerService } from "../services/AnswerService";

const DISPLAY_TYPE_TOKENS = new Set(["mcq", "msq", "nat", "mta", "multi_nat"]);

export const MTA_EXPLANATION_TEXT =
  "MTA (Marks To All): Full marks are awarded to everyone for this question.";

const normalizeTypeToken = (value = "") => {
  const token = String(value || "").trim().toLowerCase().replace(/-/g, "_");
  if (token === "marks_to_all") {
    return "mta";
  }
  if (token === "multi_nat" || token === "multi_blank_nat") {
    return "multi_nat";
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
  const token = getDisplayQuestionTypeToken(question);
  if (token === "multi_nat") {
    return "Multi-NAT";
  }
  return token.toUpperCase();
}
