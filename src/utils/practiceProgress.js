export const PRACTICE_PROGRESS_STORAGE_KEY = "gateqa_progress_v1";
export const APTITUDE_PROGRESS_STORAGE_KEY = "gateqa_apt_progress_v1";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_HISTORY_ENTRIES = 50;
const MAX_ATTEMPT_DURATION_MS = 3 * 60 * 60 * 1000;
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30, 60];

const parseNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

export const toDateKey = (value) => {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) {
    return "";
  }
  return date.toISOString().slice(0, 10);
};

export const addDaysIso = (isoString, days) => {
  const date = parseDate(isoString) || new Date();
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString();
};

export const normalizeAttemptDurationMs = (durationMs) => {
  const numeric = parseNumber(durationMs, 0);
  if (numeric <= 0) {
    return 0;
  }
  return Math.min(Math.round(numeric), MAX_ATTEMPT_DURATION_MS);
};

export const deriveDifficulty = ({
  attempts = 0,
  correctAttempts = 0,
  incorrectAttempts = 0,
  lastCorrect = false,
  globalDifficultyScore = null,
} = {}) => {
  const totalAttempts = Math.max(0, Math.round(parseNumber(attempts, 0)));
  const correct = Math.max(0, Math.round(parseNumber(correctAttempts, 0)));
  const incorrect = Math.max(0, Math.round(parseNumber(incorrectAttempts, 0)));
  const evaluatedAttempts = Math.max(correct + incorrect, totalAttempts);
  const hasGlobal = globalDifficultyScore !== null && Number.isFinite(globalDifficultyScore);

  // No personal data at all
  if (evaluatedAttempts <= 0) {
    // Use global score if available, otherwise unrated
    if (hasGlobal) {
      const gs = Math.max(0, Math.min(100, Math.round(globalDifficultyScore)));
      let label = "Medium";
      if (gs >= 70) label = "Hard";
      else if (gs < 35) label = "Easy";
      return {
        difficultyScore: gs,
        difficultyLabel: label,
        incorrectRate: 0,
        globalDifficultyScore: gs,
      };
    }
    return {
      difficultyScore: 0,
      difficultyLabel: "Unrated",
      incorrectRate: 0,
      globalDifficultyScore: null,
    };
  }

  // Personal score calculation (existing logic)
  const incorrectRate = evaluatedAttempts > 0
    ? incorrect / evaluatedAttempts
    : 0;
  const repeatPenalty = Math.min(evaluatedAttempts, 5) * 4;
  const recencyPenalty = lastCorrect ? 0 : 10;
  const recoveryCredit = lastCorrect && incorrect > 0 ? -8 : 0;
  const personalScore = Math.max(
    0,
    Math.min(100, Math.round((incorrectRate * 72) + repeatPenalty + recencyPenalty + recoveryCredit))
  );

  // Blend personal + global when both are available
  // Weight: 60% personal (user's own performance) + 40% global (community signal)
  let difficultyScore;
  if (hasGlobal) {
    const clampedGlobal = Math.max(0, Math.min(100, Math.round(globalDifficultyScore)));
    difficultyScore = Math.round(personalScore * 0.6 + clampedGlobal * 0.4);
  } else {
    difficultyScore = personalScore;
  }

  let difficultyLabel = "Light";
  if (difficultyScore >= 70) {
    difficultyLabel = "Hard";
  } else if (difficultyScore >= 40) {
    difficultyLabel = "Medium";
  }

  return {
    difficultyScore,
    difficultyLabel,
    incorrectRate: Number(incorrectRate.toFixed(4)),
    globalDifficultyScore: hasGlobal ? Math.round(globalDifficultyScore) : null,
  };
};

export const buildReviewSchedule = ({
  currentEntry = {},
  correct = false,
  submittedAt = new Date().toISOString(),
} = {}) => {
  const previousLevel = Math.max(0, Math.round(parseNumber(currentEntry.reviewLevel, 0)));
  const reviewLevel = correct
    ? Math.min(previousLevel + 1, REVIEW_INTERVAL_DAYS.length)
    : 0;
  const intervalDays = correct
    ? REVIEW_INTERVAL_DAYS[Math.max(reviewLevel - 1, 0)] || REVIEW_INTERVAL_DAYS[0]
    : 1;

  return {
    reviewLevel,
    reviewIntervalDays: intervalDays,
    reviewDueAt: addDaysIso(submittedAt, intervalDays),
  };
};

export const resolveReviewStatus = (entry = {}, now = new Date()) => {
  const attempts = Math.max(0, Math.round(parseNumber(entry.attempts, 0)));
  if (attempts <= 0) {
    return {
      reviewDueAt: "",
      isReviewDue: false,
      daysUntilDue: null,
      daysOverdue: 0,
    };
  }

  const lastSubmittedAt = String(entry.lastSubmittedAt || "").trim();
  const fallbackSchedule = buildReviewSchedule({
    currentEntry: entry,
    correct: entry.correct === true,
    submittedAt: lastSubmittedAt || new Date(now).toISOString(),
  });
  const dueAt = String(entry.reviewDueAt || fallbackSchedule.reviewDueAt || "").trim();
  const dueDate = parseDate(dueAt);
  const nowDate = now instanceof Date ? now : parseDate(now);

  if (!dueDate || !nowDate) {
    return {
      reviewDueAt: dueAt,
      isReviewDue: false,
      daysUntilDue: null,
      daysOverdue: 0,
    };
  }

  const dayDelta = Math.ceil((dueDate.getTime() - nowDate.getTime()) / DAY_MS);
  return {
    reviewDueAt: dueAt,
    isReviewDue: dayDelta <= 0,
    daysUntilDue: Math.max(dayDelta, 0),
    daysOverdue: dayDelta < 0 ? Math.abs(dayDelta) : 0,
  };
};

export const buildUpdatedProgressEntry = (currentEntry = {}, {
  correct = false,
  type = "",
  input = null,
  submittedAt = new Date().toISOString(),
  durationMs = 0,
} = {}) => {
  const safeDurationMs = normalizeAttemptDurationMs(durationMs);
  const attempts = Math.max(0, Math.round(parseNumber(currentEntry.attempts, 0))) + 1;
  const correctAttempts = Math.max(0, Math.round(parseNumber(currentEntry.correctAttempts, 0))) + (correct ? 1 : 0);
  const incorrectAttempts = Math.max(0, Math.round(parseNumber(currentEntry.incorrectAttempts, 0))) + (correct ? 0 : 1);
  const previousTimedAttempts = Math.max(0, Math.round(parseNumber(currentEntry.timedAttemptCount, 0)));
  const timedAttemptCount = previousTimedAttempts + (safeDurationMs > 0 ? 1 : 0);
  const totalDurationMs = Math.max(0, Math.round(parseNumber(currentEntry.totalDurationMs, 0))) + safeDurationMs;
  const review = buildReviewSchedule({ currentEntry, correct, submittedAt });
  const difficulty = deriveDifficulty({
    attempts,
    correctAttempts,
    incorrectAttempts,
    lastCorrect: correct,
  });
  const previousHistory = Array.isArray(currentEntry.history) ? currentEntry.history : [];
  const historyEntry = {
    submittedAt,
    correct: Boolean(correct),
    durationMs: safeDurationMs,
    type: String(type || "").trim(),
  };
  const history = [...previousHistory, historyEntry]
    .filter((entry) => entry && entry.submittedAt)
    .slice(-MAX_HISTORY_ENTRIES);

  return {
    ...currentEntry,
    attempts,
    correctAttempts,
    incorrectAttempts,
    correct: Boolean(correct),
    lastSubmittedAt: submittedAt,
    firstSubmittedAt: currentEntry.firstSubmittedAt || submittedAt,
    type: String(type || currentEntry.type || "").trim(),
    lastInput: input,
    lastDurationMs: safeDurationMs,
    totalDurationMs,
    timedAttemptCount,
    averageDurationMs: timedAttemptCount > 0
      ? Math.round(totalDurationMs / timedAttemptCount)
      : 0,
    history,
    ...review,
    ...difficulty,
  };
};

export const readPracticeProgress = (
  storage = typeof window !== "undefined" ? window.localStorage : null,
  storageKey = PRACTICE_PROGRESS_STORAGE_KEY
) => {
  if (!storage) {
    return {};
  }
  try {
    const raw = storage.getItem(storageKey || PRACTICE_PROGRESS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const writePracticeProgress = (
  progressRecords,
  storage = typeof window !== "undefined" ? window.localStorage : null,
  storageKey = PRACTICE_PROGRESS_STORAGE_KEY
) => {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(storageKey || PRACTICE_PROGRESS_STORAGE_KEY, JSON.stringify(progressRecords || {}));
    return true;
  } catch {
    return false;
  }
};

export const recordPracticeAttempt = ({
  storageKey,
  correct = false,
  type = "",
  input = null,
  submittedAt = new Date().toISOString(),
  durationMs = 0,
  storage = typeof window !== "undefined" ? window.localStorage : null,
  progressStorageKey = PRACTICE_PROGRESS_STORAGE_KEY,
} = {}) => {
  const key = String(storageKey || "").trim();
  if (!key) {
    return null;
  }

  const progress = readPracticeProgress(storage, progressStorageKey);
  const nextEntry = buildUpdatedProgressEntry(progress[key] || {}, {
    correct,
    type,
    input,
    submittedAt,
    durationMs,
  });
  progress[key] = nextEntry;
  writePracticeProgress(progress, storage, progressStorageKey);
  return nextEntry;
};
