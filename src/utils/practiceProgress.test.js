import { describe, expect, test } from "vitest";

import {
  buildUpdatedProgressEntry,
  deriveDifficulty,
  resolveReviewStatus,
} from "./practiceProgress";

describe("practiceProgress", () => {
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
    });
  });
});
