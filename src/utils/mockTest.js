import { evaluateAnswer } from "./evaluateAnswer";

export const MOCK_SECTION_COUNTS = {
  GA: 10,
  CS: 55,
};

export const MOCK_OBJECTIVE_TYPES = ["MCQ", "MSQ", "NAT"];
export const MOCK_AUTO_AWARD_TYPES = ["AMBIGUOUS", "MARKS_TO_ALL"];

export const normalizeMockType = (value = "") => {
  const normalized = String(value || "").trim().toUpperCase();
  return MOCK_OBJECTIVE_TYPES.includes(normalized) ? normalized : "";
};

export const normalizeMockAutoAwardType = (value = "") => {
  const normalized = String(value || "").trim().toUpperCase();
  return MOCK_AUTO_AWARD_TYPES.includes(normalized) ? normalized : "";
};

export const isMockAutoAwardType = (value = "") => (
  Boolean(normalizeMockAutoAwardType(value))
);

export const getNegativeMarksForQuestion = (type = "", marks = 0) => {
  const normalizedType = normalizeMockType(type);
  const numericMarks = Number(marks);
  if (normalizedType !== "MCQ" || !Number.isFinite(numericMarks) || numericMarks <= 0) {
    return 0;
  }
  return numericMarks === 1 ? 0.3333333333 : 0.6666666667;
};

export const hasMeaningfulResponse = (response, type = "") => {
  const normalizedType = normalizeMockType(type);

  if (normalizedType === "MSQ") {
    return Array.isArray(response)
      && response.some((value) => String(value || "").trim() !== "");
  }

  if (normalizedType === "NAT") {
    if (typeof response === "number") {
      return Number.isFinite(response);
    }

    const raw = String(response ?? "").trim();
    return raw !== "" && Number.isFinite(Number(raw));
  }

  if (normalizedType === "MCQ") {
    return String(response ?? "").trim() !== "";
  }

  return false;
};

export const formatMockResponse = (response, type = "") => {
  const normalizedType = normalizeMockType(type);

  if (!hasMeaningfulResponse(response, normalizedType)) {
    return "Not answered";
  }

  if (normalizedType === "MSQ") {
    return Array.isArray(response) ? response.join(", ") : String(response || "");
  }

  return String(response ?? "").trim();
};

export const formatExpectedAnswer = (answerRecord = null) => {
  if (!answerRecord || !answerRecord.type) {
    return "Unavailable";
  }

  if (isMockAutoAwardType(answerRecord.type)) {
    return "Awarded to all";
  }

  const type = normalizeMockType(answerRecord.type);
  if (type === "MCQ") {
    return String(answerRecord.answer || "").trim().toUpperCase() || "Unavailable";
  }

  if (type === "MSQ") {
    return Array.isArray(answerRecord.answer)
      ? answerRecord.answer.map((value) => String(value || "").trim().toUpperCase()).filter(Boolean).join(", ")
      : "Unavailable";
  }

  if (type === "NAT") {
    const values = Array.isArray(answerRecord.answer)
      ? answerRecord.answer
      : [answerRecord.answer];
    const formattedValues = values
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);
    if (!formattedValues.length) {
      return "Unavailable";
    }

    const tolerance = Number(answerRecord.tolerance?.abs ?? 0);
    if (tolerance > 0) {
      return `${formattedValues.join(" / ")} (+/- ${tolerance})`;
    }

    return formattedValues.join(" / ");
  }

  return "Unavailable";
};

export const buildMockQuestionResult = ({
  question = null,
  questionMeta = null,
  response,
  answerRecord = null,
} = {}) => {
  const questionUid = String(question?.question_uid || questionMeta?.questionUid || "").trim();
  const type = normalizeMockType(questionMeta?.type || answerRecord?.type || "")
    || normalizeMockAutoAwardType(questionMeta?.type || answerRecord?.type || "");
  const autoAwarded = Boolean(
    questionMeta?.autoAwarded
    || isMockAutoAwardType(questionMeta?.type)
    || isMockAutoAwardType(answerRecord?.type)
  );
  const marks = Number(questionMeta?.marks || 0);
  const negativeMarks = Number.isFinite(Number(questionMeta?.negativeMarks))
    ? Number(questionMeta.negativeMarks)
    : getNegativeMarksForQuestion(type, marks);
  const answered = autoAwarded ? false : hasMeaningfulResponse(response, type);

  const baseResult = {
    questionUid,
    section: questionMeta?.section || null,
    orderIndex: Number(questionMeta?.orderIndex || 0),
    type,
    marks: Number.isFinite(marks) ? marks : 0,
    negativeMarks,
    answered,
    response,
    answerRecord,
    scoreDelta: 0,
    status: answered ? "incorrect" : "unanswered",
    correct: false,
    autoAwarded,
  };

  if (autoAwarded) {
    return {
      ...baseResult,
      status: "bonus",
      scoreDelta: Number.isFinite(marks) ? marks : 0,
    };
  }

  if (!answered) {
    return baseResult;
  }

  if (!answerRecord) {
    return {
      ...baseResult,
      status: "missing_answer",
    };
  }

  const evaluation = evaluateAnswer(answerRecord, response);
  if (evaluation.status === "evaluated" && evaluation.correct) {
    return {
      ...baseResult,
      status: "correct",
      correct: true,
      scoreDelta: marks,
    };
  }

  if (evaluation.status === "evaluated" || evaluation.status === "invalid_input") {
    return {
      ...baseResult,
      status: "incorrect",
      scoreDelta: negativeMarks > 0 ? -negativeMarks : 0,
    };
  }

  return {
    ...baseResult,
    status: evaluation.status || "missing_answer",
  };
};

export const buildMockResultSummary = ({
  questions = [],
  responses = {},
  questionMetaByUid = {},
  getAnswerRecord = () => null,
} = {}) => {
  const summary = {
    attempted: 0,
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    bonus: 0,
    score: 0,
    maxScore: 0,
    sectionSummary: {
      GA: { total: 0, attempted: 0, correct: 0, incorrect: 0, unanswered: 0, bonus: 0, score: 0, maxScore: 0 },
      CS: { total: 0, attempted: 0, correct: 0, incorrect: 0, unanswered: 0, bonus: 0, score: 0, maxScore: 0 },
    },
    perQuestionResult: {},
  };

  questions.forEach((question) => {
    const questionUid = String(question?.question_uid || "").trim();
    if (!questionUid) {
      return;
    }

    const questionMeta = questionMetaByUid[questionUid] || null;
    const answerRecord = getAnswerRecord(question);
    const result = buildMockQuestionResult({
      question,
      questionMeta,
      response: responses[questionUid],
      answerRecord,
    });

    summary.perQuestionResult[questionUid] = result;
    summary.score += result.scoreDelta;

    const sectionKey = result.section === "GA" ? "GA" : "CS";
    const sectionSummary = summary.sectionSummary[sectionKey];
    sectionSummary.total += 1;
    sectionSummary.score += result.scoreDelta;

    if (Number.isFinite(Number(result.marks)) && Number(result.marks) > 0) {
      summary.maxScore += Number(result.marks);
      sectionSummary.maxScore += Number(result.marks);
    }

    if (result.status === "bonus") {
      summary.bonus += 1;
      sectionSummary.bonus += 1;
      return;
    }

    if (!result.answered) {
      summary.unanswered += 1;
      sectionSummary.unanswered += 1;
      return;
    }

    summary.attempted += 1;
    sectionSummary.attempted += 1;

    if (result.correct) {
      summary.correct += 1;
      sectionSummary.correct += 1;
      return;
    }

    summary.incorrect += 1;
    sectionSummary.incorrect += 1;
  });

  summary.score = Number(summary.score.toFixed(4));
  summary.sectionSummary.GA.score = Number(summary.sectionSummary.GA.score.toFixed(4));
  summary.sectionSummary.CS.score = Number(summary.sectionSummary.CS.score.toFixed(4));

  return summary;
};
