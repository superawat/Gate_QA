import { evaluateAnswer } from "./evaluateAnswer";
import { extractEmbeddedOptions, hasEmbeddedOptions } from "./stripEmbeddedOptions";

export const MOCK_SECTION_COUNTS = {
  GA: 10,
  CS: 55,
};

export const MOCK_SLOW_QUESTION_THRESHOLD_SECONDS = 3 * 60;
export const MOCK_OBJECTIVE_TYPES = ["MCQ", "MSQ", "NAT"];
export const MOCK_AUTO_AWARD_TYPES = ["AMBIGUOUS", "MARKS_TO_ALL", "SUBJECTIVE"];

const OPTION_LABELS = ["A", "B", "C", "D", "E"];
const REMOTE_GATEOVERFLOW_BLOB_RE = /https:\/\/(?:[a-z0-9-]+\.)?gateoverflow\.in\/\?qa=blob(?:&amp;|&)qa_blobid=\d+/i;
const IMAGE_SRC_RE = /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi;

const stripHtmlToText = (html = "") => (
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
);

const normalizeOptionLabel = (value = "") => String(value || "").trim().toUpperCase();

const normalizeRawOptions = (rawOptions = []) => {
  const options = [];
  const seen = new Set();

  const pushOption = (rawLabel, rawValue, index) => {
    const label = normalizeOptionLabel(rawLabel || OPTION_LABELS[index]);
    if (!label || seen.has(label)) {
      return;
    }

    const html = String(rawValue ?? "").trim();
    const text = stripHtmlToText(html);
    if (!html && !text) {
      return;
    }

    seen.add(label);
    options.push({ label, html: html || text, text: text || html });
  };

  if (Array.isArray(rawOptions)) {
    rawOptions.forEach((entry, index) => {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        pushOption(
          entry.label || entry.option || entry.key,
          entry.html || entry.text || entry.value || entry.optionText,
          index
        );
        return;
      }
      pushOption(OPTION_LABELS[index], entry, index);
    });
    return options;
  }

  if (rawOptions && typeof rawOptions === "object") {
    OPTION_LABELS.forEach((label, index) => {
      pushOption(label, rawOptions[label], index);
    });
    if (options.length === 0) {
      Object.entries(rawOptions).forEach(([key, value], index) => {
        pushOption(key, value, index);
      });
    }
  }

  return options;
};

const extractOptionsFromQuestionHtml = (questionHtml = "") => extractEmbeddedOptions(questionHtml);

export const getMockQuestionOptions = (question = {}) => {
  if (Array.isArray(question?.normalizedOptions) && question.normalizedOptions.length > 0) {
    return normalizeRawOptions(question.normalizedOptions);
  }

  const rawOptions = normalizeRawOptions(question?.options);
  if (rawOptions.length > 0) {
    return rawOptions;
  }

  return extractOptionsFromQuestionHtml(question?.question || "");
};

export const extractMockImageSources = (question = {}) => {
  const htmlFragments = [question?.question || ""];
  if (Array.isArray(question?.options)) {
    question.options.forEach((option) => {
      htmlFragments.push(
        typeof option === "object" && option
          ? (option.html || option.text || option.value || "")
          : option
      );
    });
  }
  if (Array.isArray(question?.normalizedOptions)) {
    question.normalizedOptions.forEach((option) => {
      htmlFragments.push(option?.html || option?.text || "");
    });
  }

  const sources = [];
  htmlFragments.forEach((fragment) => {
    for (const match of String(fragment || "").matchAll(IMAGE_SRC_RE)) {
      const src = String(match[2] || "").trim();
      if (src) {
        sources.push(src);
      }
    }
  });
  return sources;
};

const hasValidAnswerForType = (answerRecord = null, type = "") => {
  const normalizedType = normalizeMockType(type);
  if (!normalizedType) {
    return false;
  }

  if (!answerRecord || typeof answerRecord !== "object") {
    return false;
  }

  if (normalizedType === "MCQ") {
    return Boolean(normalizeOptionLabel(answerRecord.answer));
  }

  if (normalizedType === "MSQ") {
    return Array.isArray(answerRecord.answer)
      && answerRecord.answer.map(normalizeOptionLabel).some(Boolean);
  }

  if (normalizedType === "NAT") {
    const values = Array.isArray(answerRecord.answer)
      ? answerRecord.answer
      : [answerRecord.answer];
    return values.some((value) => String(value ?? "").trim() !== "");
  }

  return false;
};

export const validateMockQuestionForPool = ({
  question = null,
  questionMeta = null,
  answerRecord = null,
} = {}) => {
  const issues = [];
  const questionUid = String(question?.question_uid || questionMeta?.questionUid || "").trim();
  const type = normalizeMockType(questionMeta?.type || answerRecord?.type || question?.type || "")
    || normalizeMockAutoAwardType(questionMeta?.type || answerRecord?.type || question?.type || "");

  if (!question || typeof question !== "object") {
    issues.push("missing_question");
  }
  if (!questionUid) {
    issues.push("missing_question_uid");
  }
  if (!questionMeta || questionMeta.scorable !== true) {
    issues.push("unscorable_meta");
  }
  if (!type) {
    issues.push("missing_type");
  }

  const imageSources = extractMockImageSources(question || {});
  const hasQuestionText = stripHtmlToText(question?.question || "") !== "";
  const hasQuestionImage = imageSources.length > 0;
  if (!hasQuestionText && !hasQuestionImage) {
    issues.push("missing_question_content");
  }

  const remoteBlobSources = imageSources.filter((src) => REMOTE_GATEOVERFLOW_BLOB_RE.test(src));
  if (remoteBlobSources.length > 0) {
    issues.push("remote_gateoverflow_image");
  }

  const options = getMockQuestionOptions(question || {});
  const structuredOptionCount = Math.max(
    normalizeRawOptions(question?.options).length,
    Array.isArray(question?.normalizedOptions) ? normalizeRawOptions(question.normalizedOptions).length : 0
  );
  const embeddedOptionCount = extractOptionsFromQuestionHtml(question?.question || "").length;
  const hasMixedOptionSources = structuredOptionCount > 0 && hasEmbeddedOptions(question?.question || "");
  const optionLabels = new Set(options.map((option) => normalizeOptionLabel(option?.label)).filter(Boolean));
  const objectiveType = normalizeMockType(type);

  if (objectiveType && !hasValidAnswerForType(answerRecord, objectiveType)) {
    issues.push("missing_answer");
  }

  if ((objectiveType === "MCQ" || objectiveType === "MSQ") && options.length === 0) {
    issues.push("missing_options");
  }

  if (objectiveType === "MCQ") {
    const answerLabel = normalizeOptionLabel(answerRecord?.answer);
    if (answerLabel && optionLabels.size > 0 && !optionLabels.has(answerLabel)) {
      issues.push("answer_option_mismatch");
    }
  }

  if (objectiveType === "MSQ" && Array.isArray(answerRecord?.answer)) {
    const missingAnswerLabels = answerRecord.answer
      .map(normalizeOptionLabel)
      .filter((label) => label && optionLabels.size > 0 && !optionLabels.has(label));
    if (missingAnswerLabels.length > 0) {
      issues.push("answer_option_mismatch");
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    questionUid,
    type,
    optionCount: options.length,
    structuredOptionCount,
    embeddedOptionCount,
    hasMixedOptionSources,
    imageCount: imageSources.length,
  };
};

export const normalizeMockType = (value = "") => {
  const normalized = String(value || "").trim().toUpperCase();
  return MOCK_OBJECTIVE_TYPES.includes(normalized) ? normalized : "";
};

export const normalizeMockAutoAwardType = (value = "") => {
  const normalized = String(value || "").trim().toUpperCase();
  return MOCK_AUTO_AWARD_TYPES.includes(normalized) ? normalized : "";
};

export const normalizeMockTimeSpentSeconds = (value = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.max(0, Math.round(parsed));
};

export const formatMockTimeSpent = (value = 0) => {
  const totalSeconds = normalizeMockTimeSpentSeconds(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
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
  timeSpentSeconds = 0,
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
  const normalizedTimeSpentSeconds = normalizeMockTimeSpentSeconds(timeSpentSeconds);

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
    timeSpentSeconds: normalizedTimeSpentSeconds,
    slowThresholdSeconds: MOCK_SLOW_QUESTION_THRESHOLD_SECONDS,
    timeExceededThreshold: normalizedTimeSpentSeconds > MOCK_SLOW_QUESTION_THRESHOLD_SECONDS,
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
  questionTimeSpentByUid = {},
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
    timeAnalysis: {
      totalSeconds: 0,
      averageSeconds: 0,
      slowQuestionCount: 0,
      slowThresholdSeconds: MOCK_SLOW_QUESTION_THRESHOLD_SECONDS,
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
      timeSpentSeconds: questionTimeSpentByUid[questionUid],
    });

    summary.perQuestionResult[questionUid] = result;
    summary.score += result.scoreDelta;
    summary.timeAnalysis.totalSeconds += result.timeSpentSeconds;
    if (result.timeExceededThreshold) {
      summary.timeAnalysis.slowQuestionCount += 1;
    }

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
  summary.timeAnalysis.totalSeconds = normalizeMockTimeSpentSeconds(summary.timeAnalysis.totalSeconds);
  summary.timeAnalysis.averageSeconds = questions.length > 0
    ? Math.round(summary.timeAnalysis.totalSeconds / questions.length)
    : 0;

  return summary;
};
