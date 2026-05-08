export const MOCK_TEST_HISTORY_STORAGE_KEY = "gateqa_mock_history_v1";
const MAX_MOCK_TEST_HISTORY_ENTRIES = 12;

const getDefaultStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
};

const normalizeQuestionLabel = (question = {}) => {
  const section = String(question.section || "").trim().toUpperCase();
  const orderIndex = Number.parseInt(String(question.orderIndex ?? ""), 10);
  if ((section === "GA" || section === "CS") && Number.isFinite(orderIndex) && orderIndex > 0) {
    return `${section}-${orderIndex}`;
  }
  return String(question.questionUid || "").trim();
};

const normalizeQuestionRecord = (question = {}) => {
  const questionUid = String(question.questionUid || "").trim();
  if (!questionUid) {
    return null;
  }

  const section = String(question.section || "").trim().toUpperCase();
  const orderIndex = Number.parseInt(String(question.orderIndex ?? ""), 10);

  return {
    questionUid,
    label: String(question.label || normalizeQuestionLabel(question)).trim() || questionUid,
    section: section === "GA" || section === "CS" ? section : null,
    orderIndex: Number.isFinite(orderIndex) && orderIndex > 0 ? orderIndex : null,
    type: String(question.type || "").trim().toUpperCase(),
    scoreDelta: Number.isFinite(Number(question.scoreDelta)) ? Number(question.scoreDelta) : 0,
  };
};

const normalizeQuestionRecordList = (questions = []) => (
  (Array.isArray(questions) ? questions : [])
    .map((question) => normalizeQuestionRecord(question))
    .filter(Boolean)
);

const normalizeAttemptEntry = (entry = {}) => {
  const submittedAt = String(entry.submittedAt || "").trim();
  const id = String(entry.id || submittedAt || "").trim();
  if (!id || !submittedAt) {
    return null;
  }

  return {
    id,
    submittedAt,
    kindId: String(entry.kindId || "").trim(),
    kindTitle: String(entry.kindTitle || "Mock Test").trim(),
    selectedPaperLabel: String(entry.selectedPaperLabel || "").trim(),
    questionCount: Number.isFinite(Number(entry.questionCount)) ? Number(entry.questionCount) : 0,
    durationMinutes: Number.isFinite(Number(entry.durationMinutes)) ? Number(entry.durationMinutes) : 0,
    score: Number.isFinite(Number(entry.score)) ? Number(entry.score) : 0,
    maxScore: Number.isFinite(Number(entry.maxScore)) ? Number(entry.maxScore) : 0,
    attempted: Number.isFinite(Number(entry.attempted)) ? Number(entry.attempted) : 0,
    correct: Number.isFinite(Number(entry.correct)) ? Number(entry.correct) : 0,
    incorrect: Number.isFinite(Number(entry.incorrect)) ? Number(entry.incorrect) : 0,
    unanswered: Number.isFinite(Number(entry.unanswered)) ? Number(entry.unanswered) : 0,
    bonus: Number.isFinite(Number(entry.bonus)) ? Number(entry.bonus) : 0,
    correctQuestions: normalizeQuestionRecordList(entry.correctQuestions),
    incorrectQuestions: normalizeQuestionRecordList(entry.incorrectQuestions),
    unansweredQuestions: normalizeQuestionRecordList(entry.unansweredQuestions),
    bonusQuestions: normalizeQuestionRecordList(entry.bonusQuestions),
  };
};

export const readMockTestHistory = (storage = getDefaultStorage()) => {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(MOCK_TEST_HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeAttemptEntry(entry))
      .filter(Boolean)
      .sort((left, right) => String(right.submittedAt).localeCompare(String(left.submittedAt)));
  } catch {
    return [];
  }
};

const writeMockTestHistory = (entries, storage = getDefaultStorage()) => {
  if (!storage) {
    return;
  }
  storage.setItem(MOCK_TEST_HISTORY_STORAGE_KEY, JSON.stringify(entries));
};

export const appendMockTestHistoryEntry = (entry, storage = getDefaultStorage()) => {
  const normalizedEntry = normalizeAttemptEntry(entry);
  if (!normalizedEntry) {
    return [];
  }

  const current = readMockTestHistory(storage);
  const next = [
    normalizedEntry,
    ...current.filter((existingEntry) => existingEntry.id !== normalizedEntry.id),
  ].slice(0, MAX_MOCK_TEST_HISTORY_ENTRIES);

  writeMockTestHistory(next, storage);
  return next;
};

export const clearMockTestHistory = (storage = getDefaultStorage()) => {
  if (!storage) {
    return;
  }
  storage.removeItem(MOCK_TEST_HISTORY_STORAGE_KEY);
};

export const buildMockAttemptHistoryEntry = ({
  attemptMeta = null,
  resultSummary = null,
  questionMetaByUid = {},
  questions = [],
  submittedAt = new Date().toISOString(),
} = {}) => {
  if (!resultSummary || !resultSummary.perQuestionResult) {
    return null;
  }

  const correctQuestions = [];
  const incorrectQuestions = [];
  const unansweredQuestions = [];
  const bonusQuestions = [];

  (Array.isArray(questions) ? questions : []).forEach((question) => {
    const questionUid = String(question?.question_uid || "").trim();
    if (!questionUid) {
      return;
    }

    const result = resultSummary.perQuestionResult[questionUid];
    if (!result) {
      return;
    }

    const meta = questionMetaByUid[questionUid] || {};
    const record = normalizeQuestionRecord({
      questionUid,
      label: normalizeQuestionLabel({
        questionUid,
        section: meta.section || result.section,
        orderIndex: meta.orderIndex || result.orderIndex,
      }),
      section: meta.section || result.section,
      orderIndex: meta.orderIndex || result.orderIndex,
      type: meta.type || result.type,
      scoreDelta: result.scoreDelta,
    });

    if (!record) {
      return;
    }

    if (result.status === "bonus") {
      bonusQuestions.push(record);
      return;
    }

    if (result.correct) {
      correctQuestions.push(record);
      return;
    }

    if (!result.answered) {
      unansweredQuestions.push(record);
      return;
    }

    incorrectQuestions.push(record);
  });

  return normalizeAttemptEntry({
    id: `${submittedAt}:${String(attemptMeta?.kindId || "mock").trim()}:${questions.length}`,
    submittedAt,
    kindId: String(attemptMeta?.kindId || "mock").trim(),
    kindTitle: String(attemptMeta?.kindTitle || "Mock Test").trim(),
    selectedPaperLabel: String(attemptMeta?.selectedPaperLabel || "").trim(),
    questionCount: Number(attemptMeta?.questionCount || questions.length || 0),
    durationMinutes: Number(attemptMeta?.durationMinutes || 0),
    score: resultSummary.score,
    maxScore: resultSummary.maxScore,
    attempted: resultSummary.attempted,
    correct: resultSummary.correct,
    incorrect: resultSummary.incorrect,
    unanswered: resultSummary.unanswered,
    bonus: resultSummary.bonus || 0,
    correctQuestions,
    incorrectQuestions,
    unansweredQuestions,
    bonusQuestions,
  });
};
