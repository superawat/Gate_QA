/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from "vitest";

import {
  APTITUDE_PROGRESS_STORAGE_KEY,
  buildUpdatedProgressEntry,
  deriveDifficulty,
  recordPracticeAttempt,
  resolveReviewStatus,
  toDateKey,
  parseDateKey,
  addDaysToDateKey,
} from "./practiceProgress";

describe("practiceProgress", () => {
  test("extracts local date keys and performs date arithmetic without UTC shifting", () => {
    expect(toDateKey("2026-08-17")).toBe("2026-08-17");
    expect(toDateKey(new Date(2026, 7, 17, 1, 30))).toBe("2026-08-17");
    expect(toDateKey(new Date(2026, 7, 17, 23, 45))).toBe("2026-08-17");

    const parsed = parseDateKey("2026-08-17");
    expect(parsed).toBeTruthy();
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7); // August (0-indexed)
    expect(parsed.getDate()).toBe(17);

    expect(addDaysToDateKey("2026-08-17", 1)).toBe("2026-08-18");
    expect(addDaysToDateKey("2026-08-17", -1)).toBe("2026-08-16");
    expect(addDaysToDateKey("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDaysToDateKey("2026-03-01", -1)).toBe("2026-02-28");
  });
  test("schedules review and tracks timed attempts after a correct answer", () => {
    const entry = buildUpdatedProgressEntry({}, {
      correct: true,
      type: "MCQ",
      input: "B",
      submittedAt: "2026-05-01T10:00:00.000Z",
      durationMs: 90_000,
    });

    expect(entry).toMatchObject({
      attempts: 1,
      correctAttempts: 1,
      incorrectAttempts: 0,
      correct: true,
      reviewLevel: 1,
      reviewIntervalDays: 1,
      reviewDueAt: "2026-05-02T10:00:00.000Z",
      lastDurationMs: 90_000,
      totalDurationMs: 90_000,
      timedAttemptCount: 1,
      averageDurationMs: 90_000,
      difficultyLabel: "Light",
    });
    expect(entry.history).toHaveLength(1);
  });

  test("resets review level after an incorrect answer and marks hard questions", () => {
    const previous = buildUpdatedProgressEntry({}, {
      correct: true,
      submittedAt: "2026-05-01T10:00:00.000Z",
      durationMs: 60_000,
    });
    const next = buildUpdatedProgressEntry(previous, {
      correct: false,
      submittedAt: "2026-05-02T10:00:00.000Z",
      durationMs: 120_000,
    });

    expect(next).toMatchObject({
      attempts: 2,
      correctAttempts: 1,
      incorrectAttempts: 1,
      correct: false,
      reviewLevel: 0,
      reviewDueAt: "2026-05-03T10:00:00.000Z",
      totalDurationMs: 180_000,
      timedAttemptCount: 2,
      averageDurationMs: 90_000,
    });
    expect(next.difficultyScore).toBeGreaterThanOrEqual(50);
    expect(next.history).toHaveLength(2);
  });

  test("detects due and overdue review entries", () => {
    const due = resolveReviewStatus(
      {
        attempts: 1,
        correct: true,
        lastSubmittedAt: "2026-05-01T10:00:00.000Z",
        reviewDueAt: "2026-05-02T10:00:00.000Z",
      },
      new Date("2026-05-04T10:00:00.000Z")
    );

    expect(due).toMatchObject({
      isReviewDue: true,
      daysOverdue: 2,
      daysUntilDue: 0,
    });
  });

  test("derives unrated difficulty for unattempted questions", () => {
    expect(deriveDifficulty()).toEqual({
      difficultyScore: 0,
      difficultyLabel: "Unrated",
      incorrectRate: 0,
      globalDifficultyScore: null,
    });
  });

  test("records aptitude attempts under the isolated progress key", () => {
    const storage = new Map();
    const storageAdapter = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };

    recordPracticeAttempt({
      storageKey: "APT-ENG-0001",
      correct: true,
      type: "MCQ",
      input: "B",
      submittedAt: "2026-05-01T10:00:00.000Z",
      storage: storageAdapter,
      progressStorageKey: APTITUDE_PROGRESS_STORAGE_KEY,
    });

    expect(storage.has(APTITUDE_PROGRESS_STORAGE_KEY)).toBe(true);
    expect(storage.has("gateqa_progress_v1")).toBe(false);
    expect(JSON.parse(storage.get(APTITUDE_PROGRESS_STORAGE_KEY))).toHaveProperty("APT-ENG-0001");
  });

  test("resolves storageKey and correct from question and evaluation objects and dispatches event", () => {
    let dispatchedEvent = null;
    const listener = (e) => {
      dispatchedEvent = e;
    };
    window.addEventListener("gateqa:progress-updated", listener);

    const question = { question_uid: "go:2014-ga-9", type: "MCQ" };
    const evaluation = { correct: true, type: "MCQ" };

    const entry = recordPracticeAttempt({
      question,
      evaluation,
      input: "C",
      submittedAt: "2026-08-15T12:00:00.000Z",
      durationMs: 45000,
    });

    expect(entry).toBeTruthy();
    expect(entry.attempts).toBe(1);
    expect(entry.correct).toBe(true);

    const stored = JSON.parse(window.localStorage.getItem("gateqa_progress_v1"));
    expect(stored).toHaveProperty("go:2014-ga-9");
    expect(stored["go:2014-ga-9"].correct).toBe(true);

    expect(dispatchedEvent).toBeTruthy();
    expect(dispatchedEvent.detail.storageKey).toBe("go:2014-ga-9");

    window.removeEventListener("gateqa:progress-updated", listener);
  });
});
