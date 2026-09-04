import { AnswerService } from "../services/AnswerService";
import { QuestionService } from "../services/QuestionService";
import { AptitudeQuestionService } from "../services/AptitudeQuestionService";
import { DaQuestionService } from "../services/DaQuestionService";
import {
  deriveDifficulty,
  resolveReviewStatus,
  toDateKey,
  parseDateKey,
  addDaysToDateKey,
} from "./practiceProgress";
import { GlobalDifficultyService } from "../services/GlobalDifficultyService";

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

const createEmptyMockSummary = () => ({
  attemptCount: 0,
  attemptedQuestionCount: 0,
  uniqueQuestionCount: 0,
  correctAttempts: 0,
  incorrectAttempts: 0,
  bonusAttempts: 0,
  totalDurationMs: 0,
  timedAttemptCount: 0,
  averageDurationMs: 0,
  latestSubmittedAt: "",
});

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

const createTopicBucket = ({ key, label, subjectLabel = "", subjectSlug = "", subtopicSlug = "" }) => ({
  key,
  label,
  subjectLabel,
  subjectSlug,
  subtopicSlug,
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

const toNormalizedQuestion = (question = {}) => {
  const uid = String(question?.uid || question?.question_uid || "").trim();
  if (uid.startsWith("APT-")) {
    return question?.question
      ? question
      : AptitudeQuestionService.normalizeQuestion(question);
  }
  if (question?.question) {
    return QuestionService.normalizeQuestion(question);
  }
  if (question?.subjectSlug && question?.subjectLabel) {
    return question;
  }
  const hydrated = QuestionService.hydrateIndexedQuestion(question);
  return {
    ...hydrated,
    subjectSlug: hydrated?.canonical?.subject || hydrated?.subjectSlug || question?.subjectSlug || "unknown",
    subjectLabel: hydrated?.canonical?.subjectLabel || hydrated?.subject || hydrated?.subjectLabel || question?.subjectLabel || "Unknown",
    subtopics: Array.isArray(hydrated?.canonical?.subtopics) && hydrated.canonical.subtopics.length > 0
      ? hydrated.canonical.subtopics
      : (Array.isArray(question?.subtopics) ? question.subtopics : []),
  };
};

const normalizeProgressEntry = (entry = {}, isSolved = false, now = new Date()) => {
  const rawAttempts = Math.max(0, Math.round(parseNumber(entry.attempts, 0)));
  const explicitCorrectAttempts = Math.max(0, Math.round(parseNumber(entry.correctAttempts, NaN)));
  const explicitIncorrectAttempts = Math.max(0, Math.round(parseNumber(entry.incorrectAttempts, NaN)));
  const status = normalizeProgressStatus(entry.status);
  const hasMeaningfulInput = hasMeaningfulProgressInput(entry.lastInput);
  const statusBlocksAttempt = NON_ATTEMPT_STATUSES.has(status);
  const statusImpliesAttempt = ATTEMPT_STATUSES.has(status);
  const hasExplicitCorrectFlag = typeof entry.correct === "boolean";
  const explicitLastCorrect = hasExplicitCorrectFlag ? entry.correct === true : null;
  const statusIndicatesCorrect = status === "correct" || status === "solved";
  const statusIndicatesIncorrect = status === "incorrect" || status === "wrong";
  const inferredLastCorrect = explicitLastCorrect !== null
    ? explicitLastCorrect
    : statusIndicatesCorrect
      ? true
      : statusIndicatesIncorrect
        ? false
        : isSolved;
  const hasLegacyCorrectFlag = inferredLastCorrect === true;

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
    lastCorrect: inferredLastCorrect,
    globalDifficultyScore: entry.globalDifficultyScore ?? null,
  });
  const review = resolveReviewStatus({
    ...entry,
    attempts,
    correct: inferredLastCorrect,
  }, now);

  return {
    attempts,
    correctAttempts,
    incorrectAttempts,
    lastSubmittedAt: String(entry.lastSubmittedAt || "").trim(),
    lastCorrect: inferredLastCorrect,
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
  const rawHistory = Array.isArray(entry.history)
    ? entry.history
      .map((item) => ({
        submittedAt: String(item?.submittedAt || "").trim(),
        correct: item?.correct === true,
        durationMs: Math.max(0, Math.round(parseNumber(item?.durationMs, 0))),
      }))
      .filter((item) => item.submittedAt)
    : [];

  let history = rawHistory;
  if (history.length === 0 && normalizedEntry.lastSubmittedAt) {
    history = [{
      submittedAt: normalizedEntry.lastSubmittedAt,
      correct: normalizedEntry.lastCorrect,
      durationMs: normalizedEntry.lastDurationMs || 0,
    }];
  }

  if (history.length === 0) {
    return [];
  }

  // Group and deduplicate by dateKey to count only one distinct question attempt per day
  const dailyGroups = new Map();
  history.forEach((attempt) => {
    const dateKey = toDateKey(attempt.submittedAt);
    if (!dateKey) return;

    if (!dailyGroups.has(dateKey)) {
      dailyGroups.set(dateKey, {
        submittedAt: attempt.submittedAt,
        correct: attempt.correct,
        durationMs: attempt.durationMs,
      });
    } else {
      const existing = dailyGroups.get(dateKey);
      existing.correct = existing.correct || attempt.correct;
      existing.durationMs += attempt.durationMs;
      if (String(attempt.submittedAt).localeCompare(String(existing.submittedAt)) > 0) {
        existing.submittedAt = attempt.submittedAt;
      }
    }
  });

  return Array.from(dailyGroups.values());
};

const getDistinctProgressDateKey = (entry = {}, normalizedEntry = {}) => {
  const candidates = [
    String(entry.firstSubmittedAt || "").trim(),
    ...(Array.isArray(entry.history)
      ? entry.history.map((item) => String(item?.submittedAt || "").trim())
      : []),
    String(normalizedEntry.lastSubmittedAt || "").trim(),
  ].filter(Boolean).sort();

  return candidates.length > 0 ? toDateKey(candidates[0]) : "";
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

const collectMissingDateKeys = ({ startExclusiveKey = "", endInclusiveKey = "", effectiveDateSet = new Set() } = {}) => {
  if (!startExclusiveKey || !endInclusiveKey || startExclusiveKey >= endInclusiveKey) {
    return [];
  }

  const missingDateKeys = [];
  let cursorKey = addDaysToDateKey(startExclusiveKey, 1);

  while (cursorKey && cursorKey <= endInclusiveKey) {
    if (!effectiveDateSet.has(cursorKey)) {
      missingDateKeys.push(cursorKey);
    }
    cursorKey = addDaysToDateKey(cursorKey, 1);
  }

  return missingDateKeys;
};

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
  let previousDateKey = null;

  activeDates.forEach((dateKey) => {
    if (previousDateKey && addDaysToDateKey(previousDateKey, 1) === dateKey) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }
    longestStreak = Math.max(longestStreak, runningStreak);
    previousDateKey = dateKey;
  });

  const todayKey = toDateKey(now);
  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const lastActiveDate = activeDates[activeDates.length - 1] || "";
  const currentDateKeys = [];

  if (lastActiveDate === todayKey || lastActiveDate === yesterdayKey) {
    let cursorKey = lastActiveDate;
    while (cursorKey && activeDateSet.has(cursorKey)) {
      currentDateKeys.unshift(cursorKey);
      cursorKey = addDaysToDateKey(cursorKey, -1);
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
  const consumeMissingDates = (dateKeys = []) => {
    const missingDateKeys = normalizeDateKeyList(dateKeys)
      .filter((dateKey) => !effectiveDateSet.has(dateKey));

    if (missingDateKeys.length === 0) {
      return true;
    }
    if (state.available < missingDateKeys.length) {
      return false;
    }

    missingDateKeys.forEach((dateKey) => {
      state.available -= 1;
      state.consumedDates.push(dateKey);
      effectiveDateSet.add(dateKey);
    });
    changed = true;
    return true;
  };
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
    const yesterdayKey = addDaysToDateKey(todayKey, -1);
    const actualDatesThroughToday = actualDates.filter((dateKey) => dateKey <= todayKey);
    const latestActualDate = actualDatesThroughToday.at(-1);

    if (latestActualDate) {
      let bridgeable = latestActualDate === todayKey || latestActualDate === yesterdayKey;
      let currentAnchorKey = latestActualDate;

      if (!bridgeable && latestActualDate < yesterdayKey) {
        const trailingGap = collectMissingDateKeys({
          startExclusiveKey: latestActualDate,
          endInclusiveKey: yesterdayKey,
          effectiveDateSet,
        });
        bridgeable = consumeMissingDates(trailingGap);
        currentAnchorKey = bridgeable ? yesterdayKey : latestActualDate;
      }

      if (bridgeable) {
        for (let index = actualDatesThroughToday.length - 1; index >= 0; index -= 1) {
          const actualDateKey = actualDatesThroughToday[index];
          if (actualDateKey > currentAnchorKey) {
            continue;
          }

          const segmentEndKey = addDaysToDateKey(currentAnchorKey, -1);
          const segmentGap = collectMissingDateKeys({
            startExclusiveKey: actualDateKey,
            endInclusiveKey: segmentEndKey,
            effectiveDateSet,
          });

          if (!consumeMissingDates(segmentGap)) {
            break;
          }

          currentAnchorKey = actualDateKey;
        }
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
  const attemptDates = normalizeDateKeyList(
    attemptTimeline
      .map((entry) => entry.date)
      .filter(Boolean)
  );
  const activeDates = normalizeDateKeyList(
    Array.isArray(options.streakDateKeys) && options.streakDateKeys.length > 0
      ? options.streakDateKeys
      : attemptDates
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
  const activeStreakDateKeys = currentDateKeys.filter((dateKey) => activeDates.includes(dateKey));

  return {
    activeDayCount: activeDates.length,
    progressDateKeys: activeDates,
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
  progressRecords,
  progressEntries,
  solvedQuestionIds = [],
  globalDifficultyService = null,
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

  const records = Array.isArray(progressRecords)
    ? Object.fromEntries(progressRecords)
    : (progressRecords && typeof progressRecords === "object"
        ? progressRecords
        : (Array.isArray(progressEntries) ? Object.fromEntries(progressEntries) : {}));

  (Array.isArray(questions) ? questions : []).forEach((rawQuestion) => {
    const question = toNormalizedQuestion(rawQuestion);
    const storageKey = AnswerService.getStorageKeyForQuestion(question)
      || String(question?.question_uid || question?.uid || rawQuestion?.question_uid || rawQuestion?.uid || "").trim();
    if (!storageKey) {
      return;
    }

    const subjectSlug = String(question.subjectSlug || rawQuestion?.subjectSlug || "").trim() || "unknown";
    const subjectLabel = String(
      question.subjectLabel
      || rawQuestion?.subjectLabel
      || (typeof QuestionService?.getSubjectLabelBySlug === "function" ? QuestionService.getSubjectLabelBySlug(subjectSlug) : "")
    ).trim() || "Unknown";
    const subtopics = Array.isArray(question.subtopics)
      ? question.subtopics
      : (Array.isArray(rawQuestion?.subtopics) ? rawQuestion.subtopics : []);
    const year = question.exam?.year || rawQuestion?.exam?.year || rawQuestion?.year || null;

    const meta = {
      subjectSlug,
      subjectLabel,
      subtopics,
      year,
    };
    questionMetaByStorageKey.set(storageKey, meta);
    const uidKey = String(question?.question_uid || question?.uid || rawQuestion?.question_uid || rawQuestion?.uid || "").trim();
    if (uidKey && uidKey !== storageKey) {
      questionMetaByStorageKey.set(uidKey, meta);
    }

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
        subtopicSlug,
      }).availableQuestions += 1;
    });
  });

  const wrongQuestions = [];
  const distinctProgressDateSet = new Set();
  const attemptedQuestionKeySet = new Set();

  Object.entries(records).forEach(([storageKey, entry]) => {
    const trimmedKey = String(storageKey || "").trim();
    const normalizedEntry = normalizeProgressEntry(
      {
        ...entry,
        globalDifficultyScore: globalDifficultyService ? globalDifficultyService.getScore(storageKey) : null,
      },
      solvedSet.has(storageKey),
      now
    );

    if (!normalizedEntry.isAttempted) {
      return;
    }

    attemptedQuestionKeySet.add(trimmedKey);

    normalizeAttemptHistory(entry, normalizedEntry).forEach((attempt) => {
      const dateKey = toDateKey(attempt.submittedAt);
      if (!dateKey) {
        return;
      }
      distinctProgressDateSet.add(dateKey);
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

    if (normalizedEntry.durationMs > 0) {
      totalDurationMs += normalizedEntry.durationMs;
      timedAttemptCount += 1;
    }

    let meta = questionMetaByStorageKey.get(trimmedKey);
    if (!meta) {
      const cseQ = typeof QuestionService?.getQuestionByUid === "function"
        ? QuestionService.getQuestionByUid(trimmedKey)
        : null;
      const aptQ = !cseQ && typeof AptitudeQuestionService?.getQuestionByUid === "function"
        ? AptitudeQuestionService.getQuestionByUid(trimmedKey)
        : null;
      const daQ = !cseQ && !aptQ && typeof DaQuestionService?.questionsByUid?.get === "function"
        ? DaQuestionService.questionsByUid.get(trimmedKey)
        : null;
      const fallbackQ = cseQ || aptQ || daQ;
      if (fallbackQ) {
        const subjectSlug = String(fallbackQ.subjectSlug || "").trim() || "unknown";
        const subjectLabel = String(
          fallbackQ.subjectLabel
          || (typeof QuestionService?.getSubjectLabelBySlug === "function" ? QuestionService.getSubjectLabelBySlug(subjectSlug) : "")
        ).trim() || "Unknown";
        const subtopics = Array.isArray(fallbackQ.subtopics) ? fallbackQ.subtopics : [];
        const year = fallbackQ.exam?.year || fallbackQ.year || null;
        meta = { subjectSlug, subjectLabel, subtopics, year };
        questionMetaByStorageKey.set(trimmedKey, meta);
      }
    }

    const resolvedSubjectSlug = meta?.subjectSlug || "general";
    const resolvedSubjectLabel = meta?.subjectLabel || "General";
    const resolvedSubtopics = meta?.subtopics || [];

    const difficultyMeta = {
      difficultyScore: normalizedEntry.difficultyScore,
      difficultyLabel: normalizedEntry.difficultyLabel,
      incorrectRate: normalizedEntry.incorrectRate,
    };

    difficultyQuestions.push({
      storageKey,
      subjectLabel: resolvedSubjectLabel,
      subjectSlug: resolvedSubjectSlug,
      subtopics: resolvedSubtopics,
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
        subjectLabel: resolvedSubjectLabel,
        subjectSlug: resolvedSubjectSlug,
        subtopics: resolvedSubtopics,
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

    // Collect wrong-question entries for the review log
    const rawIncorrect = Math.max(0, Math.round(parseNumber(entry.incorrectAttempts, 0)));
    if (rawIncorrect > 0 || normalizedEntry.lastCorrect === false) {
      wrongQuestions.push({
        storageKey,
        subjectLabel: resolvedSubjectLabel,
        subjectSlug: resolvedSubjectSlug,
        subtopics: resolvedSubtopics,
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

    if (!meta) {
      return;
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
        subtopicSlug,
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
  const streakActivityDates = normalizeDateKeyList(Array.from(distinctProgressDateSet));
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
    streakActivityDates,
    studyActivity: buildStudyActivity(attemptTimeline, now, {
      streakDateKeys: streakActivityDates,
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
    attemptedQuestionCount: attemptedQuestionKeySet.size,
  };
};

/**
 * Merges mock test history attempts into standard practice progress records and solved list.
 */
export const mergeMockHistoryIntoProgress = (progressRecords, solvedQuestionIds, storage) => {
  const emptyMockSummary = createEmptyMockSummary();
  if (!storage) {
    return { progressRecords, solvedQuestionIds, mockSummary: emptyMockSummary };
  }
  const historyKey = "gateqa_mock_history_v1";
  let mockHistory = [];
  try {
    const raw = storage.getItem(historyKey);
    if (raw) {
      mockHistory = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to parse mock history", e);
  }

  if (!Array.isArray(mockHistory) || mockHistory.length === 0) {
    return { progressRecords, solvedQuestionIds, mockSummary: emptyMockSummary };
  }

  // Create shallow copies to avoid mutating stored references
  const mergedProgress = { ...(progressRecords || {}) };
  const mergedSolved = new Set(
    (Array.isArray(solvedQuestionIds) ? solvedQuestionIds : [])
      .map((uid) => String(uid).trim())
      .filter(Boolean)
  );
  const mockQuestionIds = new Set();
  const mockSummary = createEmptyMockSummary();

  // Process from oldest to newest mock test so that the timeline and lastSubmittedAt updates chronologically
  const sortedMockHistory = [...mockHistory].sort((a, b) =>
    String(a.submittedAt || "").localeCompare(String(b.submittedAt || ""))
  );

  sortedMockHistory.forEach((session) => {
    const submittedAt = session.submittedAt;
    if (!submittedAt) return;
    mockSummary.attemptCount += 1;
    if (!mockSummary.latestSubmittedAt || String(submittedAt).localeCompare(mockSummary.latestSubmittedAt) > 0) {
      mockSummary.latestSubmittedAt = submittedAt;
    }

    const correctList = Array.isArray(session.correctQuestions) ? session.correctQuestions : [];
    const incorrectList = Array.isArray(session.incorrectQuestions) ? session.incorrectQuestions : [];
    const bonusList = Array.isArray(session.bonusQuestions) ? session.bonusQuestions : [];

    const registerAttempt = (questionUid, isCorrect, timeSpentSeconds, isBonus = false) => {
      const storageKey = String(questionUid).trim();
      if (!storageKey) return;

      const durationMs = Math.max(0, Math.round((Number(timeSpentSeconds) || 0) * 1000));
      mockQuestionIds.add(storageKey);
      mockSummary.attemptedQuestionCount += 1;
      mockSummary.totalDurationMs += durationMs;
      if (durationMs > 0) {
        mockSummary.timedAttemptCount += 1;
      }
      if (isBonus) {
        mockSummary.bonusAttempts += 1;
      } else if (isCorrect) {
        mockSummary.correctAttempts += 1;
      } else {
        mockSummary.incorrectAttempts += 1;
      }

      if (isCorrect) {
        mergedSolved.add(storageKey);
      }

      if (!mergedProgress[storageKey]) {
        mergedProgress[storageKey] = {
          attempts: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          status: isCorrect ? "correct" : "incorrect",
          correct: isCorrect,
          lastSubmittedAt: submittedAt,
          firstSubmittedAt: submittedAt,
          lastDurationMs: 0,
          totalDurationMs: 0,
          timedAttemptCount: 0,
          history: []
        };
      } else {
        mergedProgress[storageKey] = { ...mergedProgress[storageKey] };
      }

      const entry = mergedProgress[storageKey];
      const existingAttempts = Math.max(0, Math.round(parseNumber(entry.attempts, 0)));
      const existingCorrectAttempts = Math.max(
        0,
        Math.round(parseNumber(entry.correctAttempts, entry.correct === true ? 1 : 0))
      );
      const existingIncorrectAttempts = Math.max(
        0,
        Math.round(parseNumber(entry.incorrectAttempts, Math.max(0, existingAttempts - existingCorrectAttempts)))
      );
      const existingTotalDurationMs = Math.max(0, Math.round(parseNumber(entry.totalDurationMs, 0)));
      const existingTimedAttemptCount = Math.max(
        0,
        Math.round(parseNumber(
          entry.timedAttemptCount,
          existingTotalDurationMs > 0 || parseNumber(entry.lastDurationMs, 0) > 0 ? 1 : 0
        ))
      );

      entry.attempts = existingAttempts + 1;
      if (isCorrect) {
        entry.correctAttempts = existingCorrectAttempts + 1;
        entry.incorrectAttempts = existingIncorrectAttempts;
      } else {
        entry.correctAttempts = existingCorrectAttempts;
        entry.incorrectAttempts = existingIncorrectAttempts + 1;
      }
      entry.totalDurationMs = existingTotalDurationMs + durationMs;
      if (durationMs > 0) {
        entry.timedAttemptCount = existingTimedAttemptCount + 1;
      } else {
        entry.timedAttemptCount = existingTimedAttemptCount;
      }

      if (!entry.lastSubmittedAt || String(submittedAt).localeCompare(String(entry.lastSubmittedAt)) >= 0) {
        entry.lastSubmittedAt = submittedAt;
        entry.status = isCorrect ? "correct" : "incorrect";
        entry.correct = isCorrect;
        entry.lastDurationMs = durationMs;
      }
      if (!entry.firstSubmittedAt || String(submittedAt).localeCompare(String(entry.firstSubmittedAt)) < 0) {
        entry.firstSubmittedAt = submittedAt;
      }

      if (!Array.isArray(entry.history)) {
        entry.history = [];
      }
      entry.history.push({
        submittedAt,
        correct: isCorrect,
        durationMs,
        source: "mock",
      });
    };

    correctList.forEach((q) => registerAttempt(q.questionUid, true, q.timeSpentSeconds));
    incorrectList.forEach((q) => registerAttempt(q.questionUid, false, q.timeSpentSeconds));
    bonusList.forEach((q) => registerAttempt(q.questionUid, true, q.timeSpentSeconds, true));
  });
  mockSummary.uniqueQuestionCount = mockQuestionIds.size;
  mockSummary.averageDurationMs = mockSummary.timedAttemptCount > 0
    ? Math.round(mockSummary.totalDurationMs / mockSummary.timedAttemptCount)
    : 0;

  return {
    progressRecords: mergedProgress,
    solvedQuestionIds: Array.from(mergedSolved),
    mockSummary,
  };
};

let cachedInsights = null;
let cachedInsightsKey = "";

export const clearInsightsCache = () => {
  cachedInsights = null;
  cachedInsightsKey = "";
};

export const loadWeakTopicInsights = async ({
  fetchImpl = typeof fetch === "function" ? fetch : null,
  storage = typeof window !== "undefined" ? window.localStorage : null,
  baseUrl = typeof import.meta !== "undefined" ? import.meta.env.BASE_URL : "/",
  now = new Date(),
  questions: passedQuestions = null,
  providedQuestions = null,
} = {}) => {
  if (!fetchImpl && !storage) {
    return buildWeakTopicInsights({ now });
  }

  const gateProgress = parseJson(storage?.getItem?.(PROGRESS_STORAGE_KEY), {});
  const aptProgress = parseJson(storage?.getItem?.("gateqa_apt_progress_v1"), {});
  const daProgress = parseJson(storage?.getItem?.("gateqa_da_progress_v1"), {});
  const rawProgressRecords = { ...gateProgress, ...aptProgress, ...daProgress };

  const gateSolved = parseJson(storage?.getItem?.(SOLVED_STORAGE_KEY), []);
  const aptSolved = parseJson(storage?.getItem?.("gateqa-apt-solved-questions"), []);
  const daSolved = parseJson(storage?.getItem?.("gate_qa_da_solved_questions"), []);
  const rawSolvedQuestionIds = [...gateSolved, ...aptSolved, ...daSolved];

  const { progressRecords, solvedQuestionIds, mockSummary } = mergeMockHistoryIntoProgress(
    rawProgressRecords,
    rawSolvedQuestionIds,
    storage
  );

  const hasProgressRecords = progressRecords && typeof progressRecords === "object" && Object.keys(progressRecords).length > 0;
  const hasSolvedQuestions = Array.isArray(solvedQuestionIds) && solvedQuestionIds.length > 0;

  if (!hasProgressRecords && !hasSolvedQuestions) {
    return buildWeakTopicInsights({ now });
  }

  const todayKey = toDateKey(now);
  const rawMockHistory = storage?.getItem?.("gateqa_mock_history_v1") || "";
  const mockHistoryStamp = rawMockHistory.length;
  const inputQuestionsCount = Array.isArray(passedQuestions || providedQuestions)
    ? (passedQuestions || providedQuestions).length
    : 0;
  const cacheKey = `${Object.keys(rawProgressRecords).length}_${rawSolvedQuestionIds.length}_${mockHistoryStamp}_${inputQuestionsCount}_${todayKey}`;

  if (cachedInsights && cachedInsightsKey === cacheKey) {
    return cachedInsights;
  }

  let questions = passedQuestions || providedQuestions;
  if (!Array.isArray(questions) || questions.length === 0) {
    // 1. Check if QuestionService already has questions loaded in memory
    if (QuestionService.loaded && Array.isArray(QuestionService.questions) && QuestionService.questions.length > 0) {
      questions = [...QuestionService.questions];
    } else {
      // 2. Try QuestionService.init() which checks localStorage cache first (works 100% offline!)
      try {
        await QuestionService.init();
        if (QuestionService.loaded && Array.isArray(QuestionService.questions) && QuestionService.questions.length > 0) {
          questions = [...QuestionService.questions];
        }
      } catch (qsErr) {
        console.warn("[WeakTopicAnalyzer] QuestionService.init fallback warning:", qsErr?.message);
      }
    }

    // 3. If still empty and fetchImpl is available, fall back to index fetch
    if ((!Array.isArray(questions) || questions.length === 0) && fetchImpl) {
      const normalizedBase = String(baseUrl || "/").endsWith("/")
        ? String(baseUrl || "/")
        : `${String(baseUrl || "/")}/`;

      const fetchIndex = async (filename) => {
        try {
          const response = await fetchImpl(`${normalizedBase}${filename}`, {
            cache: "force-cache",
          });
          if (response && response.ok) {
            return await response.json();
          }
        } catch (e) {
          console.warn(`Failed to fetch index: ${filename}`, e);
        }
        return null;
      };

      const questionsPayload = await fetchIndex("question-search-index.json");
      if (Array.isArray(questionsPayload) && questionsPayload.length > 0) {
        questions = questionsPayload;
      }
    }

    questions = Array.isArray(questions) ? [...questions] : [];

    // 4. Enrich with Aptitude questions ONLY if the user actually has aptitude activity
    const hasAptitudeActivity = (aptProgress && Object.keys(aptProgress).length > 0)
      || (Array.isArray(aptSolved) && aptSolved.length > 0);
    if (hasAptitudeActivity) {
      if (AptitudeQuestionService.loaded && Array.isArray(AptitudeQuestionService.questions) && AptitudeQuestionService.questions.length > 0) {
        questions = [...questions, ...AptitudeQuestionService.questions];
      } else {
        try {
          await AptitudeQuestionService.init();
          if (AptitudeQuestionService.loaded && Array.isArray(AptitudeQuestionService.questions) && AptitudeQuestionService.questions.length > 0) {
            questions = [...questions, ...AptitudeQuestionService.questions];
          }
        } catch (aptErr) {
          console.warn("[WeakTopicAnalyzer] Aptitude init warning:", aptErr?.message);
        }
      }
    }

    // 5. Enrich with DA questions ONLY if the user actually has DA activity
    const hasDaActivity = (daProgress && Object.keys(daProgress).length > 0)
      || (Array.isArray(daSolved) && daSolved.length > 0);
    if (hasDaActivity) {
      if (DaQuestionService.loaded && Array.isArray(DaQuestionService.questions) && DaQuestionService.questions.length > 0) {
        questions = [...questions, ...DaQuestionService.questions];
      } else {
        try {
          await DaQuestionService.init();
          if (DaQuestionService.loaded && Array.isArray(DaQuestionService.questions) && DaQuestionService.questions.length > 0) {
            questions = [...questions, ...DaQuestionService.questions];
          }
        } catch (daErr) {
          console.warn("[WeakTopicAnalyzer] DA init warning:", daErr?.message);
        }
      }
    }
  }

  let gds = null;
  if (fetchImpl) {
    try {
      gds = GlobalDifficultyService.getInstance(baseUrl);
      await gds.load(fetchImpl);
    } catch (gdsErr) {
      console.warn("[WeakTopicAnalyzer] GlobalDifficultyService load warning:", gdsErr?.message);
    }
  }

  const insights = buildWeakTopicInsights({
    questions,
    progressRecords,
    solvedQuestionIds,
    globalDifficultyService: gds,
    now,
  });
  const streakActivityDates = Array.isArray(insights.streakActivityDates)
    ? insights.streakActivityDates
    : insights.attemptTimeline.map((entry) => entry.date);
  const effectiveStreakActivityDates = streakActivityDates.length > 0
    ? streakActivityDates
    : insights.attemptTimeline.map((entry) => entry.date);
  const { state: streakFreezeState, stats: streakStats } = reconcileStreakFreezeState({
    activeDates: effectiveStreakActivityDates,
    now,
    storage,
  });

  const result = {
    ...insights,
    mockSummary,
    studyActivity: buildStudyActivity(insights.attemptTimeline, now, {
      streakDateKeys: effectiveStreakActivityDates,
      hardQuestionCount: insights.difficultySummary?.counts?.Hard || 0,
      streakFreezeState,
      streakStats,
    }),
  };

  if (result.attemptedQuestionCount > 0 || !hasProgressRecords) {
    cachedInsights = result;
    cachedInsightsKey = cacheKey;
  }

  return result;
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

  const gateProgress = parseJson(storage.getItem(PROGRESS_STORAGE_KEY), {});
  const aptProgress = parseJson(storage.getItem("gateqa_apt_progress_v1"), {});
  const daProgress = parseJson(storage.getItem("gateqa_da_progress_v1"), {});
  const rawProgressRecords = { ...gateProgress, ...aptProgress, ...daProgress };

  const { progressRecords } = mergeMockHistoryIntoProgress(rawProgressRecords, [], storage);

  if (!progressRecords || typeof progressRecords !== "object" || Object.keys(progressRecords).length === 0) {
    return buildStudyActivity([], now);
  }

  const attemptDayMap = new Map();
  const distinctProgressDateSet = new Set();
  let hardQuestionCount = 0;

  Object.entries(progressRecords).forEach(([storageKey, entry]) => {
    if (!entry) return;
    const normalizedEntry = normalizeProgressEntry(entry, false, now);
    if (!normalizedEntry.isAttempted) return;
    if (normalizedEntry.difficultyLabel === "Hard") {
      hardQuestionCount += 1;
    }

    normalizeAttemptHistory(entry, normalizedEntry).forEach((attempt) => {
      const dateKey = toDateKey(attempt.submittedAt);
      if (!dateKey) return;
      distinctProgressDateSet.add(dateKey);
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
  const streakActivityDates = normalizeDateKeyList(Array.from(distinctProgressDateSet));
  const effectiveStreakActivityDates = streakActivityDates.length > 0
    ? streakActivityDates
    : attemptTimeline.map((entry) => entry.date);
  const { state: streakFreezeState, stats: streakStats } = reconcileStreakFreezeState({
    activeDates: effectiveStreakActivityDates,
    now,
    storage,
  });

  return {
    ...buildStudyActivity(attemptTimeline, now, {
      streakDateKeys: effectiveStreakActivityDates,
      hardQuestionCount,
      streakFreezeState,
      streakStats,
    }),
    attemptTimeline,
  };
};
