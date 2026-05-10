import { AnswerService } from "../services/AnswerService";
import { QuestionService } from "../services/QuestionService";
import {
  deriveDifficulty,
  resolveReviewStatus,
  toDateKey,
} from "./practiceProgress";

const PROGRESS_STORAGE_KEY = "gateqa_progress_v1";
const SOLVED_STORAGE_KEY = "gate_qa_solved_questions";
const STREAK_FREEZE_STORAGE_KEY = "gateqa_streak_freeze_v1";
const STREAK_FREEZE_INTERVAL_DAYS = 7;
const HARD_QUESTION_XP_BONUS = 20;
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

const normalizeDateKeyList = (dateKeys = []) => (
  Array.from(
    new Set(
      dateKeys
        .filter((dateKey) => typeof dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateKey))
        .sort()
    )
  )
);

const normalizeStreakFreezeState = (value = {}) => ({
  available: Math.max(0, Number(value.available) || 0),
  earnedCount: Math.max(0, Number(value.earnedCount) || 0),
  consumedDates: normalizeDateKeyList(Array.isArray(value.consumedDates) ? value.consumedDates : []),
});

const readStreakFreezeState = (storage) => (
  normalizeStreakFreezeState(parseJson(storage?.getItem?.(STREAK_FREEZE_STORAGE_KEY), {}))
);

const writeStreakFreezeState = (storage, state) => {
  try {
    storage?.setItem?.(STREAK_FREEZE_STORAGE_KEY, JSON.stringify(normalizeStreakFreezeState(state)));
  } catch {
    // Best-effort persistence only; activity analytics should still render.
  }
};

const buildStreakStats = (dateKeys = [], now = new Date()) => {
  const activeDates = normalizeDateKeyList(dateKeys);
  const activeDateSet = new Set(activeDates);
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

  const todayKey = toDateKey(now);
  const yesterdayKey = toDateKey(addDays(new Date(`${todayKey}T00:00:00.000Z`), -1));
  const lastActiveDate = activeDates[activeDates.length - 1] || "";
  const currentDateKeys = [];

  if (lastActiveDate === todayKey || lastActiveDate === yesterdayKey) {
    let cursor = new Date(`${lastActiveDate}T00:00:00.000Z`);
    let cursorKey = toDateKey(cursor);
    while (activeDateSet.has(cursorKey)) {
      currentDateKeys.unshift(cursorKey);
      cursor = addDays(cursor, -1);
      cursorKey = toDateKey(cursor);
    }
  }

  return {
    currentStreak: currentDateKeys.length,
    currentDateKeys,
    longestStreak,
    lastActiveDate,
  };
};

const reconcileStreakFreezeState = ({ activeDates = [], now = new Date(), storage = null } = {}) => {
  const state = readStreakFreezeState(storage);
  const actualDates = normalizeDateKeyList(activeDates);
  const effectiveDateSet = new Set([...actualDates, ...state.consumedDates]);
  let changed = false;
  const awardEarnedFreeze = () => {
    const stats = buildStreakStats(Array.from(effectiveDateSet), now);
    const earnedCount = Math.floor(stats.longestStreak / STREAK_FREEZE_INTERVAL_DAYS);

    if (earnedCount > state.earnedCount) {
      state.available += earnedCount - state.earnedCount;
      state.earnedCount = earnedCount;
      changed = true;
    }

    return stats;
  };
  let stats = buildStreakStats(Array.from(effectiveDateSet), now);

  if (actualDates.length > 0) {
    stats = awardEarnedFreeze();
    const todayKey = toDateKey(now);
    const yesterdayKey = toDateKey(addDays(new Date(`${todayKey}T00:00:00.000Z`), -1));
    const latestBeforeToday = Array.from(effectiveDateSet)
      .filter((dateKey) => dateKey < todayKey)
      .sort()
      .at(-1);

    if (latestBeforeToday && latestBeforeToday < yesterdayKey) {
      let cursor = addDays(new Date(`${latestBeforeToday}T00:00:00.000Z`), 1);
      let cursorKey = toDateKey(cursor);

      while (cursorKey <= yesterdayKey) {
        if (!effectiveDateSet.has(cursorKey)) {
          if (state.available <= 0) {
            break;
          }
          state.available -= 1;
          state.consumedDates.push(cursorKey);
          effectiveDateSet.add(cursorKey);
          changed = true;
        }

        cursor = addDays(cursor, 1);
        cursorKey = toDateKey(cursor);
      }
    }
  }

  stats = actualDates.length > 0 ? awardEarnedFreeze() : stats;

  state.consumedDates = normalizeDateKeyList(state.consumedDates);
  if (changed) {
    writeStreakFreezeState(storage, state);
  }

  return {
    state: normalizeStreakFreezeState(state),
    stats,
  };
};

const buildStudyActivity = (attemptTimeline = [], now = new Date(), options = {}) => {
  const activeDates = normalizeDateKeyList(
    attemptTimeline
      .map((entry) => entry.date)
      .filter(Boolean)
  );
  const totalAttempts = attemptTimeline.reduce((sum, entry) => sum + Number(entry.attempts || 0), 0);
  const totalCorrect = attemptTimeline.reduce((sum, entry) => sum + Number(entry.correct || 0), 0);
  const hardQuestionCount = Math.max(0, Number(options.hardQuestionCount) || 0);
  const streakFreeze = normalizeStreakFreezeState(options.streakFreezeState);
  const streakStats = options.streakStats || buildStreakStats([...activeDates, ...streakFreeze.consumedDates], now);
  const { currentStreak, currentDateKeys, longestStreak, lastActiveDate } = streakStats;
  const baseXp = (totalAttempts * 5) + (totalCorrect * 10) + (longestStreak * 15);
  const hardBonusXp = hardQuestionCount * HARD_QUESTION_XP_BONUS;
  const streakMultiplier = currentStreak >= 7 ? 2 : 1;
  const xp = (baseXp + hardBonusXp) * streakMultiplier;
  const badges = [
    currentStreak >= 3 ? "3-day streak" : null,
    currentStreak >= 7 ? "7-day streak" : null,
    streakMultiplier > 1 ? "2x XP" : null,
    streakFreeze.available > 0 ? `${streakFreeze.available} freeze ready` : null,
    totalAttempts >= 25 ? "25 attempts" : null,
    totalAttempts >= 100 ? "100 attempts" : null,
    totalCorrect >= 50 ? "50 correct" : null,
    hardQuestionCount > 0 ? "hard practice" : null,
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
    xpBreakdown: {
      baseXp,
      hardBonusXp,
      streakMultiplier,
      totalXp: xp,
    },
    badges,
    lastActiveDate,
    streakDateKeys: currentDateKeys,
    streakFreeze: {
      ...streakFreeze,
      consumedCount: streakFreeze.consumedDates.length,
      lastConsumedDate: streakFreeze.consumedDates[streakFreeze.consumedDates.length - 1] || "",
    },
  };
};

export const buildWeakTopicInsights = ({
  questions = [],
  progressRecords = {},
  solvedQuestionIds = [],
  now = new Date(),
} = {}) => {
  const subjectBuckets = new Map();
  const yearBuckets = new Map();
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
    const year = question.exam?.year || null;

    questionMetaByStorageKey.set(storageKey, {
      subjectSlug,
      subjectLabel,
      subtopics,
      year,
    });

    getOrCreateBucket(subjectBuckets, {
      key: subjectSlug,
      label: subjectLabel,
      subjectLabel,
      subjectSlug,
    }).availableQuestions += 1;

    if (year) {
      getOrCreateBucket(yearBuckets, {
        key: String(year),
        label: String(year),
      }).availableQuestions += 1;
    }

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

    if (meta.year) {
      const yearBucket = getOrCreateBucket(yearBuckets, {
        key: String(meta.year),
        label: String(meta.year),
      });
      yearBucket.attemptedQuestions += 1;
      yearBucket.attemptedCount += normalizedEntry.attempts;
      yearBucket.correctAttempts += normalizedEntry.correctAttempts;
      yearBucket.incorrectAttempts += normalizedEntry.incorrectAttempts;
      yearBucket.totalDurationMs += normalizedEntry.totalDurationMs || normalizedEntry.lastDurationMs || 0;
      yearBucket.timedAttemptCount += normalizedEntry.timedAttemptCount;
      yearBucket.recentEntries.push({
        at: normalizedEntry.lastSubmittedAt,
        correct: normalizedEntry.lastCorrect,
      });
    }
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

  const years = Array.from(yearBuckets.values())
    .map(finalizeBucket)
    .sort((a, b) => Number(a.key) - Number(b.key));
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
    years,
    wrongQuestions,
    reviewQueue,
    attemptTimeline,
    studyActivity: buildStudyActivity(attemptTimeline, now, {
      hardQuestionCount: difficultyCounts.Hard,
    }),
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
  now = new Date(),
} = {}) => {
  if (!fetchImpl || !storage) {
    return buildWeakTopicInsights({ now });
  }

  const progressRecords = parseJson(storage.getItem(PROGRESS_STORAGE_KEY), {});
  const solvedQuestionIds = parseJson(storage.getItem(SOLVED_STORAGE_KEY), []);
  const hasProgressRecords = progressRecords && typeof progressRecords === "object" && Object.keys(progressRecords).length > 0;
  const hasSolvedQuestions = Array.isArray(solvedQuestionIds) && solvedQuestionIds.length > 0;

  if (!hasProgressRecords && !hasSolvedQuestions) {
    return buildWeakTopicInsights({ now });
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
  const insights = buildWeakTopicInsights({
    questions,
    progressRecords,
    solvedQuestionIds,
    now,
  });
  const { state: streakFreezeState, stats: streakStats } = reconcileStreakFreezeState({
    activeDates: insights.attemptTimeline.map((entry) => entry.date),
    now,
    storage,
  });

  return {
    ...insights,
    studyActivity: buildStudyActivity(insights.attemptTimeline, now, {
      hardQuestionCount: insights.difficultySummary.counts.Hard,
      streakFreezeState,
      streakStats,
    }),
  };
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
  let hardQuestionCount = 0;

  Object.values(progressRecords).forEach((entry) => {
    if (!entry) return;
    const normalizedEntry = normalizeProgressEntry(entry, false, now);
    if (!normalizedEntry.isAttempted) return;
    if (normalizedEntry.difficultyLabel === "Hard") {
      hardQuestionCount += 1;
    }

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
      if (attempt.durationMs > 0) {
        dayBucket.totalDurationMs += attempt.durationMs;
        dayBucket.timedAttempts += 1;
      }
    });
  });

  const attemptTimeline = finalizeAttemptTimeline(attemptDayMap);
  const { state: streakFreezeState, stats: streakStats } = reconcileStreakFreezeState({
    activeDates: attemptTimeline.map((entry) => entry.date),
    now,
    storage,
  });

  return {
    ...buildStudyActivity(attemptTimeline, now, {
      hardQuestionCount,
      streakFreezeState,
      streakStats,
    }),
    attemptTimeline,
  };
};

