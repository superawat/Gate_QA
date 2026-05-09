import { AnswerService } from "../services/AnswerService";
import { QuestionService } from "../services/QuestionService";
import {
  deriveDifficulty,
  resolveReviewStatus,
  toDateKey,
} from "./practiceProgress";

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
  totalDurationMs: 0,
  timedAttemptCount: 0,
  averageDurationMs: 0,
  recentEntries: [],
});

const toNormalizedQuestion = (question = {}) => (
  question?.question
    ? QuestionService.normalizeQuestion(question)
    : QuestionService.hydrateIndexedQuestion(question)
);

const normalizeProgressEntry = (entry = {}, isSolved = false, now = new Date()) => {
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
  const totalDurationMs = Math.max(0, Math.round(parseNumber(entry.totalDurationMs, 0)));
  const lastDurationMs = Math.max(0, Math.round(parseNumber(entry.lastDurationMs, 0)));
  const timedAttemptCount = Math.max(
    0,
    Math.round(parseNumber(
      entry.timedAttemptCount,
      totalDurationMs > 0 || lastDurationMs > 0 ? 1 : 0
    ))
  );
  const averageDurationMs = timedAttemptCount > 0
    ? Math.round((totalDurationMs || lastDurationMs) / timedAttemptCount)
    : 0;
  const difficulty = deriveDifficulty({
    attempts,
    correctAttempts,
    incorrectAttempts,
    lastCorrect: hasLegacyCorrectFlag || status === "correct" || status === "solved",
  });
  const review = resolveReviewStatus({
    ...entry,
    attempts,
    correct: hasLegacyCorrectFlag || status === "correct" || status === "solved",
  }, now);

  return {
    attempts,
    correctAttempts,
    incorrectAttempts,
    lastSubmittedAt: String(entry.lastSubmittedAt || "").trim(),
    lastCorrect: hasLegacyCorrectFlag || status === "correct" || status === "solved",
    isAttempted: attempts > 0,
    reviewLevel: Math.max(0, Math.round(parseNumber(entry.reviewLevel, 0))),
    reviewDueAt: review.reviewDueAt,
    isReviewDue: review.isReviewDue,
    daysUntilDue: review.daysUntilDue,
    daysOverdue: review.daysOverdue,
    totalDurationMs,
    lastDurationMs,
    timedAttemptCount,
    averageDurationMs,
    history: Array.isArray(entry.history) ? entry.history : [],
    difficultyScore: difficulty.difficultyScore,
    difficultyLabel: difficulty.difficultyLabel,
    incorrectRate: difficulty.incorrectRate,
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
    averageDurationMs: bucket.timedAttemptCount > 0
      ? Math.round(bucket.totalDurationMs / bucket.timedAttemptCount)
      : 0,
  };
};

const normalizeAttemptHistory = (entry = {}, normalizedEntry = {}) => {
  const history = Array.isArray(entry.history)
    ? entry.history
      .map((item) => ({
        submittedAt: String(item?.submittedAt || "").trim(),
        correct: item?.correct === true,
        durationMs: Math.max(0, Math.round(parseNumber(item?.durationMs, 0))),
      }))
      .filter((item) => item.submittedAt)
    : [];

  if (history.length > 0) {
    return history;
  }

  if (!normalizedEntry.lastSubmittedAt) {
    return [];
  }

  return [{
    submittedAt: normalizedEntry.lastSubmittedAt,
    correct: normalizedEntry.lastCorrect,
    durationMs: normalizedEntry.lastDurationMs,
  }];
};

const getOrCreateDayBucket = (dayMap, dateKey) => {
  if (!dayMap.has(dateKey)) {
    dayMap.set(dateKey, {
      date: dateKey,
      attempts: 0,
      correct: 0,
      incorrect: 0,
      totalDurationMs: 0,
      timedAttempts: 0,
    });
  }
  return dayMap.get(dateKey);
};

const finalizeAttemptTimeline = (dayMap) => (
  Array.from(dayMap.values())
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((bucket) => ({
      ...bucket,
      accuracyRate: bucket.attempts > 0
        ? Number((bucket.correct / bucket.attempts).toFixed(4))
        : 0,
      averageDurationMs: bucket.timedAttempts > 0
        ? Math.round(bucket.totalDurationMs / bucket.timedAttempts)
        : 0,
    }))
);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const buildStudyActivity = (attemptTimeline = [], now = new Date()) => {
  const activeDates = attemptTimeline
    .map((entry) => entry.date)
    .filter(Boolean)
    .sort();
  const activeDateSet = new Set(activeDates);
  const totalAttempts = attemptTimeline.reduce((sum, entry) => sum + Number(entry.attempts || 0), 0);
  const totalCorrect = attemptTimeline.reduce((sum, entry) => sum + Number(entry.correct || 0), 0);

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate = null;

  activeDates.forEach((dateKey) => {
    const currentDate = new Date(`${dateKey}T00:00:00.000Z`);
    if (previousDate && toDateKey(addDays(previousDate, 1)) === dateKey) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }
    longestStreak = Math.max(longestStreak, runningStreak);
    previousDate = currentDate;
  });

  let currentStreak = 0;
  if (activeDates.length > 0) {
    const lastActiveDate = new Date(`${activeDates[activeDates.length - 1]}T00:00:00.000Z`);
    const todayKey = toDateKey(now);
    const yesterdayKey = toDateKey(addDays(new Date(`${todayKey}T00:00:00.000Z`), -1));
    const lastKey = activeDates[activeDates.length - 1];

    // Only count a current streak if the user was active today or yesterday
    if (lastKey === todayKey || lastKey === yesterdayKey) {
      currentStreak = 1;
      let cursor = lastActiveDate;
      while (activeDateSet.has(toDateKey(addDays(cursor, -1)))) {
        currentStreak += 1;
        cursor = addDays(cursor, -1);
      }
    }
  }

  const xp = (totalAttempts * 5) + (totalCorrect * 10) + (longestStreak * 15);
  const badges = [
    currentStreak >= 3 ? "3-day streak" : null,
    currentStreak >= 7 ? "7-day streak" : null,
    totalAttempts >= 25 ? "25 attempts" : null,
    totalAttempts >= 100 ? "100 attempts" : null,
    totalCorrect >= 50 ? "50 correct" : null,
  ].filter(Boolean);

  const todayKey = toDateKey(now);
  const todayEntry = attemptTimeline.find((entry) => entry.date === todayKey);
  const todayAttempts = todayEntry ? (Number(todayEntry.attempts) || 0) : 0;

  return {
    activeDayCount: activeDates.length,
    currentStreak,
    longestStreak,
    todayAttempts,
    xp,
    badges,
    lastActiveDate: activeDates[activeDates.length - 1] || "",
  };
};

export const buildWeakTopicInsights = ({
  questions = [],
  progressRecords = {},
  solvedQuestionIds = [],
  now = new Date(),
} = {}) => {
  const subjectBuckets = new Map();
  const subtopicBuckets = new Map();
  const questionMetaByStorageKey = new Map();
  const attemptDayMap = new Map();
  const reviewQueue = [];
  const difficultyQuestions = [];
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

    const normalizedEntry = normalizeProgressEntry(entry, solvedSet.has(storageKey), now);
    if (!normalizedEntry.isAttempted) {
      return;
    }
    const difficultyMeta = {
      difficultyScore: normalizedEntry.difficultyScore,
      difficultyLabel: normalizedEntry.difficultyLabel,
      incorrectRate: normalizedEntry.incorrectRate,
    };

    difficultyQuestions.push({
      storageKey,
      subjectLabel: meta.subjectLabel,
      subjectSlug: meta.subjectSlug,
      subtopics: meta.subtopics,
      attempts: normalizedEntry.attempts,
      correctAttempts: normalizedEntry.correctAttempts,
      incorrectAttempts: normalizedEntry.incorrectAttempts,
      lastCorrect: normalizedEntry.lastCorrect,
      lastSubmittedAt: normalizedEntry.lastSubmittedAt,
      ...difficultyMeta,
    });

    if (normalizedEntry.isReviewDue) {
      reviewQueue.push({
        storageKey,
        subjectLabel: meta.subjectLabel,
        subjectSlug: meta.subjectSlug,
        subtopics: meta.subtopics,
        attempts: normalizedEntry.attempts,
        correctAttempts: normalizedEntry.correctAttempts,
        incorrectAttempts: normalizedEntry.incorrectAttempts,
        lastCorrect: normalizedEntry.lastCorrect,
        lastSubmittedAt: normalizedEntry.lastSubmittedAt,
        reviewLevel: normalizedEntry.reviewLevel,
        reviewDueAt: normalizedEntry.reviewDueAt,
        daysOverdue: normalizedEntry.daysOverdue,
        daysUntilDue: normalizedEntry.daysUntilDue,
        type: String(entry.type || "").trim() || null,
        ...difficultyMeta,
      });
    }

    normalizeAttemptHistory(entry, normalizedEntry).forEach((attempt) => {
      const dateKey = toDateKey(attempt.submittedAt);
      if (!dateKey) {
        return;
      }
      const dayBucket = getOrCreateDayBucket(attemptDayMap, dateKey);
      dayBucket.attempts += 1;
      if (attempt.correct) {
        dayBucket.correct += 1;
      } else {
        dayBucket.incorrect += 1;
      }
      if (attempt.durationMs > 0) {
        dayBucket.totalDurationMs += attempt.durationMs;
        dayBucket.timedAttempts += 1;
      }
    });

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
        averageDurationMs: normalizedEntry.averageDurationMs,
        reviewDueAt: normalizedEntry.reviewDueAt,
        reviewLevel: normalizedEntry.reviewLevel,
        ...difficultyMeta,
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
    subjectBucket.totalDurationMs += normalizedEntry.totalDurationMs || normalizedEntry.lastDurationMs || 0;
    subjectBucket.timedAttemptCount += normalizedEntry.timedAttemptCount;
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
      subtopicBucket.totalDurationMs += normalizedEntry.totalDurationMs || normalizedEntry.lastDurationMs || 0;
      subtopicBucket.timedAttemptCount += normalizedEntry.timedAttemptCount;
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
  reviewQueue.sort((left, right) => {
    if (Number(right.daysOverdue || 0) !== Number(left.daysOverdue || 0)) {
      return Number(right.daysOverdue || 0) - Number(left.daysOverdue || 0);
    }
    if (Number(right.difficultyScore || 0) !== Number(left.difficultyScore || 0)) {
      return Number(right.difficultyScore || 0) - Number(left.difficultyScore || 0);
    }
    return String(left.reviewDueAt || "").localeCompare(String(right.reviewDueAt || ""));
  });
  difficultyQuestions.sort((left, right) => {
    if (Number(right.difficultyScore || 0) !== Number(left.difficultyScore || 0)) {
      return Number(right.difficultyScore || 0) - Number(left.difficultyScore || 0);
    }
    return String(right.lastSubmittedAt || "").localeCompare(String(left.lastSubmittedAt || ""));
  });

  const subjects = Array.from(subjectBuckets.values())
    .filter((bucket) => bucket.attemptedQuestions > 0)
    .map(finalizeBucket)
    .sort(sortTopicBuckets);

  const subtopics = Array.from(subtopicBuckets.values())
    .filter((bucket) => bucket.attemptedQuestions > 0)
    .map(finalizeBucket)
    .sort(sortTopicBuckets);
  const attemptTimeline = finalizeAttemptTimeline(attemptDayMap);
  const timedAttemptCount = subjects.reduce((sum, bucket) => sum + Number(bucket.timedAttemptCount || 0), 0);
  const totalDurationMs = subjects.reduce((sum, bucket) => sum + Number(bucket.totalDurationMs || 0), 0);
  const difficultyCounts = difficultyQuestions.reduce((counts, question) => {
    const label = question.difficultyLabel || "Unrated";
    counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, { Light: 0, Medium: 0, Hard: 0, Unrated: 0 });

  return {
    subjects,
    subtopics,
    wrongQuestions,
    reviewQueue,
    attemptTimeline,
    studyActivity: buildStudyActivity(attemptTimeline, now),
    timeSummary: {
      totalDurationMs,
      timedAttemptCount,
      averageDurationMs: timedAttemptCount > 0
        ? Math.round(totalDurationMs / timedAttemptCount)
        : 0,
    },
    difficultySummary: {
      counts: difficultyCounts,
      averageDifficultyScore: difficultyQuestions.length > 0
        ? Math.round(
          difficultyQuestions.reduce((sum, question) => sum + Number(question.difficultyScore || 0), 0)
          / difficultyQuestions.length
        )
        : 0,
      hardQuestions: difficultyQuestions
        .filter((question) => question.difficultyLabel === "Hard")
        .slice(0, 10),
    },
    attemptedQuestionCount: subjects.reduce((sum, bucket) => sum + bucket.attemptedQuestions, 0),
  };
};

export const loadWeakTopicInsights = async ({
  fetchImpl = typeof fetch === "function" ? fetch : null,
  storage = typeof window !== "undefined" ? window.localStorage : null,
  baseUrl = typeof import.meta !== "undefined" ? import.meta.env.BASE_URL : "/",
} = {}) => {
  if (!fetchImpl || !storage) {
    return buildWeakTopicInsights();
  }

  const progressRecords = parseJson(storage.getItem(PROGRESS_STORAGE_KEY), {});
  const solvedQuestionIds = parseJson(storage.getItem(SOLVED_STORAGE_KEY), []);
  const hasProgressRecords = progressRecords && typeof progressRecords === "object" && Object.keys(progressRecords).length > 0;
  const hasSolvedQuestions = Array.isArray(solvedQuestionIds) && solvedQuestionIds.length > 0;

  if (!hasProgressRecords && !hasSolvedQuestions) {
    return buildWeakTopicInsights();
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

/**
 * Lightweight, synchronous streak/activity loader.
 * Reads only localStorage progress records to build the attempt timeline
 * and derive streak data — no network fetch required.
 * Suitable for use on the HomePage where fast initial render matters.
 */
export const loadStudyActivityFast = ({
  storage = typeof window !== "undefined" ? window.localStorage : null,
  now = new Date(),
} = {}) => {
  if (!storage) {
    return buildStudyActivity([], now);
  }

  const progressRecords = parseJson(storage.getItem(PROGRESS_STORAGE_KEY), {});
  if (!progressRecords || typeof progressRecords !== "object" || Object.keys(progressRecords).length === 0) {
    return buildStudyActivity([], now);
  }

  const attemptDayMap = new Map();

  Object.values(progressRecords).forEach((entry) => {
    if (!entry) return;
    const normalizedEntry = normalizeProgressEntry(entry, false, now);
    if (!normalizedEntry.isAttempted) return;

    normalizeAttemptHistory(entry, normalizedEntry).forEach((attempt) => {
      const dateKey = toDateKey(attempt.submittedAt);
      if (!dateKey) return;
      const dayBucket = getOrCreateDayBucket(attemptDayMap, dateKey);
      dayBucket.attempts += 1;
      if (attempt.correct) {
        dayBucket.correct += 1;
      } else {
        dayBucket.incorrect += 1;
      }
    });
  });

  const attemptTimeline = finalizeAttemptTimeline(attemptDayMap);
  return buildStudyActivity(attemptTimeline, now);
};

