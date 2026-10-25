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

export function isMtaQuestion(question = null, answerRecord = null) {
  const record =
    answerRecord ||
    (question && typeof question === "object"
      ? AnswerService.getAnswerForQuestion(question)
      : null);

  if (record) {
    const recType = String(record.type || "")
      .toUpperCase()
      .trim()
      .replace(/[\s-]+/g, "_");
    const recAns = String(record.answer || "").toUpperCase().trim();
    if (recType === "MTA" || recType === "MARKS_TO_ALL" || recAns === "MTA") {
      return true;
    }
  }

  if (!question || typeof question !== "object") {
    return false;
  }

  if (getDisplayQuestionTypeToken(question) === "mta") {
    return true;
  }

  const candidates = [
    question.type,
    question.answer_meta?.type,
    question.answerMeta?.type,
    question.answer,
    question.answer_meta?.answer,
    question.answerMeta?.answer,
  ];

  for (const candidate of candidates) {
    const normalized = String(candidate || "")
      .toUpperCase()
      .trim()
      .replace(/[\s-]+/g, "_");
    if (normalized === "MTA" || normalized === "MARKS_TO_ALL") {
      return true;
    }
  }

  return false;
}
