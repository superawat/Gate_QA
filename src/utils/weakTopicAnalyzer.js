import { AnswerService } from "../services/AnswerService";
import { QuestionService } from "../services/QuestionService";

const PROGRESS_STORAGE_KEY = "gateqa_progress_v1";
const SOLVED_STORAGE_KEY = "gate_qa_solved_questions";
const NON_ATTEMPT_STATUSES = new Set([
  "watched",
  "watching",
  "viewed",
  "opened",
  "seen",
  "skipped",
  "skip",
  "unattempted",
  "not_attempted",
  "unanswered",
]);
const ATTEMPT_STATUSES = new Set([
  "attempted",
  "answered",
  "submitted",
  "correct",
  "incorrect",
  "wrong",
  "solved",
]);

const sortTopicBuckets = (left, right) => {
  if (left.accuracyRate !== right.accuracyRate) {
    return left.accuracyRate - right.accuracyRate;
  }
  if (left.recentMistakeStreak !== right.recentMistakeStreak) {
    return right.recentMistakeStreak - left.recentMistakeStreak;
  }
  if (left.attemptedCount !== right.attemptedCount) {
    return right.attemptedCount - left.attemptedCount;
  }
  return left.label.localeCompare(right.label);
};

const parseNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const parseJson = (rawValue, fallback) => {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeProgressStatus = (value) => (
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
);

const hasMeaningfulProgressInput = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => String(item || "").trim());
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  return String(value || "").trim().length > 0;
};

const createTopicBucket = ({ key, label, subjectLabel = "", subjectSlug = "" }) => ({
  key,
  label,
  subjectLabel,
  subjectSlug,
  availableQuestions: 0,
  attemptedQuestions: 0,
  attemptedCount: 0,
  correctAttempts: 0,
  incorrectAttempts: 0,
  recentMistakeStreak: 0,
  accuracyRate: 0,
  coverageRate: 0,
  recentEntries: [],
});

const toNormalizedQuestion = (question = {}) => (
  question?.question
    ? QuestionService.normalizeQuestion(question)
    : QuestionService.hydrateIndexedQuestion(question)
);

const normalizeProgressEntry = (entry = {}, isSolved = false) => {
  const rawAttempts = Math.max(0, Math.round(parseNumber(entry.attempts, 0)));
  const explicitCorrectAttempts = Math.max(0, Math.round(parseNumber(entry.correctAttempts, NaN)));
  const explicitIncorrectAttempts = Math.max(0, Math.round(parseNumber(entry.incorrectAttempts, NaN)));
  const status = normalizeProgressStatus(entry.status);
  const hasMeaningfulInput = hasMeaningfulProgressInput(entry.lastInput);
  const statusBlocksAttempt = NON_ATTEMPT_STATUSES.has(status);
  const statusImpliesAttempt = ATTEMPT_STATUSES.has(status);
  const hasLegacyCorrectFlag = entry.correct === true || isSolved;

  const fallbackCorrectAttempts = hasLegacyCorrectFlag ? 1 : 0;
  const correctAttempts = Number.isFinite(explicitCorrectAttempts)
    ? explicitCorrectAttempts
    : fallbackCorrectAttempts;

  const fallbackIncorrectAttempts = rawAttempts > 0
    ? Math.max(0, rawAttempts - correctAttempts)
    : 0;
  const incorrectAttempts = Number.isFinite(explicitIncorrectAttempts)
    ? explicitIncorrectAttempts
    : fallbackIncorrectAttempts;
  const derivedAttemptFloor = Math.max(
    correctAttempts + incorrectAttempts,
    hasMeaningfulInput || statusImpliesAttempt || hasLegacyCorrectFlag ? 1 : 0
  );
  const attempts = statusBlocksAttempt && derivedAttemptFloor === 0
    ? 0
    : Math.max(rawAttempts, derivedAttemptFloor);

  return {
    attempts,
    correctAttempts,
    incorrectAttempts,
    lastSubmittedAt: String(entry.lastSubmittedAt || "").trim(),
    lastCorrect: hasLegacyCorrectFlag || status === "correct" || status === "solved",
    isAttempted: attempts > 0,
  };
};

const getOrCreateBucket = (bucketMap, config) => {
  if (!bucketMap.has(config.key)) {
    bucketMap.set(config.key, createTopicBucket(config));
  }
  return bucketMap.get(config.key);
};

const finalizeBucket = (bucket) => {
  const sortedEntries = [...bucket.recentEntries].sort((left, right) => (
    String(right.at || "").localeCompare(String(left.at || ""))
  ));

  let recentMistakeStreak = 0;
  for (const entry of sortedEntries) {
    if (entry.correct) {
      break;
    }
    recentMistakeStreak += 1;
  }

  return {
    ...bucket,
    recentMistakeStreak,
    accuracyRate: bucket.attemptedCount > 0
      ? Number((bucket.correctAttempts / bucket.attemptedCount).toFixed(4))
      : 0,
    coverageRate: bucket.availableQuestions > 0
      ? Number((bucket.attemptedQuestions / bucket.availableQuestions).toFixed(4))
      : 0,
  };
};

export const buildWeakTopicInsights = ({
  questions = [],
  progressRecords = {},
  solvedQuestionIds = [],
} = {}) => {
  const subjectBuckets = new Map();
  const subtopicBuckets = new Map();
  const questionMetaByStorageKey = new Map();
  const solvedSet = new Set(
    (Array.isArray(solvedQuestionIds) ? solvedQuestionIds : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  );

  (Array.isArray(questions) ? questions : []).forEach((rawQuestion) => {
    const question = toNormalizedQuestion(rawQuestion);
    const storageKey = AnswerService.getStorageKeyForQuestion(question);
    if (!storageKey) {
      return;
    }

    const subjectSlug = String(question.subjectSlug || "").trim() || "unknown";
    const subjectLabel = String(question.subjectLabel || QuestionService.getSubjectLabelBySlug(subjectSlug)).trim() || "Unknown";
    const subtopics = Array.isArray(question.subtopics) ? question.subtopics : [];

    questionMetaByStorageKey.set(storageKey, {
      subjectSlug,
      subjectLabel,
      subtopics,
    });

    getOrCreateBucket(subjectBuckets, {
      key: subjectSlug,
      label: subjectLabel,
      subjectLabel,
      subjectSlug,
    }).availableQuestions += 1;

    subtopics.forEach((subtopic) => {
      const subtopicSlug = String(subtopic?.slug || "").trim();
      const subtopicLabel = String(subtopic?.label || subtopicSlug).trim();
      if (!subtopicSlug || !subtopicLabel) {
        return;
      }

      getOrCreateBucket(subtopicBuckets, {
        key: `${subjectSlug}:${subtopicSlug}`,
        label: subtopicLabel,
        subjectLabel,
        subjectSlug,
      }).availableQuestions += 1;
    });
  });

  const wrongQuestions = [];

  Object.entries(progressRecords || {}).forEach(([storageKey, entry]) => {
    const meta = questionMetaByStorageKey.get(String(storageKey || "").trim());
    if (!meta) {
      return;
    }

    const normalizedEntry = normalizeProgressEntry(entry, solvedSet.has(storageKey));
    if (!normalizedEntry.isAttempted) {
      return;
    }

    // Collect wrong-question entries for the review log
    const rawIncorrect = Math.max(0, Math.round(parseNumber(entry.incorrectAttempts, 0)));
    if (rawIncorrect > 0 || normalizedEntry.lastCorrect === false) {
      wrongQuestions.push({
        storageKey,
        subjectLabel: meta.subjectLabel,
        subjectSlug: meta.subjectSlug,
        subtopics: meta.subtopics,
        attempts: normalizedEntry.attempts,
        correctAttempts: normalizedEntry.correctAttempts,
        incorrectAttempts: normalizedEntry.incorrectAttempts,
        lastCorrect: normalizedEntry.lastCorrect,
        lastSubmittedAt: normalizedEntry.lastSubmittedAt,
        type: String(entry.type || "").trim() || null,
        lastInput: entry.lastInput ?? null,
      });
    }

    const subjectBucket = getOrCreateBucket(subjectBuckets, {
      key: meta.subjectSlug,
      label: meta.subjectLabel,
      subjectLabel: meta.subjectLabel,
      subjectSlug: meta.subjectSlug,
    });
    subjectBucket.attemptedQuestions += 1;
    subjectBucket.attemptedCount += normalizedEntry.attempts;
    subjectBucket.correctAttempts += normalizedEntry.correctAttempts;
    subjectBucket.incorrectAttempts += normalizedEntry.incorrectAttempts;
    subjectBucket.recentEntries.push({
      at: normalizedEntry.lastSubmittedAt,
      correct: normalizedEntry.lastCorrect,
    });

    meta.subtopics.forEach((subtopic) => {
      const subtopicSlug = String(subtopic?.slug || "").trim();
      const subtopicLabel = String(subtopic?.label || subtopicSlug).trim();
      if (!subtopicSlug || !subtopicLabel) {
        return;
      }

      const subtopicBucket = getOrCreateBucket(subtopicBuckets, {
        key: `${meta.subjectSlug}:${subtopicSlug}`,
        label: subtopicLabel,
        subjectLabel: meta.subjectLabel,
        subjectSlug: meta.subjectSlug,
      });
      subtopicBucket.attemptedQuestions += 1;
      subtopicBucket.attemptedCount += normalizedEntry.attempts;
      subtopicBucket.correctAttempts += normalizedEntry.correctAttempts;
      subtopicBucket.incorrectAttempts += normalizedEntry.incorrectAttempts;
      subtopicBucket.recentEntries.push({
        at: normalizedEntry.lastSubmittedAt,
        correct: normalizedEntry.lastCorrect,
      });
    });
  });

  // Sort wrong questions: most recent first
  wrongQuestions.sort((a, b) =>
    String(b.lastSubmittedAt || "").localeCompare(String(a.lastSubmittedAt || ""))
  );

  const subjects = Array.from(subjectBuckets.values())
    .filter((bucket) => bucket.attemptedQuestions > 0)
    .map(finalizeBucket)
    .sort(sortTopicBuckets);

  const subtopics = Array.from(subtopicBuckets.values())
    .filter((bucket) => bucket.attemptedQuestions > 0)
    .map(finalizeBucket)
    .sort(sortTopicBuckets);

  return {
    subjects,
    subtopics,
    wrongQuestions,
    attemptedQuestionCount: subjects.reduce((sum, bucket) => sum + bucket.attemptedQuestions, 0),
  };
};

export const loadWeakTopicInsights = async ({
  fetchImpl = typeof fetch === "function" ? fetch : null,
  storage = typeof window !== "undefined" ? window.localStorage : null,
  baseUrl = typeof import.meta !== "undefined" ? import.meta.env.BASE_URL : "/",
} = {}) => {
  if (!fetchImpl || !storage) {
    return { subjects: [], subtopics: [], attemptedQuestionCount: 0 };
  }

  const progressRecords = parseJson(storage.getItem(PROGRESS_STORAGE_KEY), {});
  const solvedQuestionIds = parseJson(storage.getItem(SOLVED_STORAGE_KEY), []);
  const hasProgressRecords = progressRecords && typeof progressRecords === "object" && Object.keys(progressRecords).length > 0;
  const hasSolvedQuestions = Array.isArray(solvedQuestionIds) && solvedQuestionIds.length > 0;

  if (!hasProgressRecords && !hasSolvedQuestions) {
    return { subjects: [], subtopics: [], attemptedQuestionCount: 0 };
  }

  const normalizedBase = String(baseUrl || "/").endsWith("/")
    ? String(baseUrl || "/")
    : `${String(baseUrl || "/")}/`;
  const response = await fetchImpl(`${normalizedBase}question-search-index.json`, {
    cache: "force-cache",
  });

  if (!response?.ok) {
    throw new Error("Unable to load practice analytics.");
  }

  const questions = await response.json();
  return buildWeakTopicInsights({
    questions,
    progressRecords,
    solvedQuestionIds,
  });
};
