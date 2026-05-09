import { describe, expect, test } from "vitest";

import { buildWeakTopicInsights } from "./weakTopicAnalyzer";

describe("buildWeakTopicInsights", () => {
  test("builds subject and subtopic accuracy summaries from local progress", () => {
    const insights = buildWeakTopicInsights({
      questions: [
        {
          question_uid: "go:1",
          title: "GATE CSE 2025 | Question: 1",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["discrete-mathematics", "graph-coloring"],
          type: "MCQ",
        },
        {
          question_uid: "go:2",
          title: "GATE CSE 2025 | Question: 2",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["discrete-mathematics", "counting"],
          type: "MCQ",
        },
        {
          question_uid: "go:3",
          title: "GATE CSE 2025 | Question: 3",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["operating-system", "context-switch"],
          type: "MCQ",
        },
      ],
      progressRecords: {
        "go:1": {
          attempts: 2,
          correctAttempts: 0,
          incorrectAttempts: 2,
          correct: false,
          lastSubmittedAt: "2026-04-01T10:00:00.000Z",
        },
        "go:2": {
          attempts: 1,
          correctAttempts: 1,
          incorrectAttempts: 0,
          correct: true,
          lastSubmittedAt: "2026-04-02T10:00:00.000Z",
        },
        "go:3": {
          attempts: 2,
          correctAttempts: 0,
          incorrectAttempts: 2,
          correct: false,
          lastSubmittedAt: "2026-04-03T10:00:00.000Z",
        },
      },
      solvedQuestionIds: ["go:2"],
    });

    expect(insights.subjects[0]).toMatchObject({
      label: "Operating System",
      attemptedCount: 2,
      attemptedQuestions: 1,
      recentMistakeStreak: 1,
    });
    expect(insights.subjects[0].accuracyRate).toBe(0);

    expect(insights.subjects[1]).toMatchObject({
      label: "Discrete Mathematics",
      attemptedCount: 3,
      attemptedQuestions: 2,
    });
    expect(insights.subjects[1].accuracyRate).toBeCloseTo(0.3333, 4);

    expect(insights.subtopics[0]).toMatchObject({
      label: "Context Switch",
      subjectLabel: "Operating System",
      attemptedCount: 2,
    });
    expect(insights.subtopics[0].accuracyRate).toBe(0);
  });

  test("ignores watched and skipped records that do not contain a real attempt", () => {
    const insights = buildWeakTopicInsights({
      questions: [
        {
          question_uid: "go:10",
          title: "GATE CSE 2025 | Question: 10",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["algorithms", "greedy"],
          type: "MCQ",
        },
        {
          question_uid: "go:11",
          title: "GATE CSE 2025 | Question: 11",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["algorithms", "dynamic-programming"],
          type: "MCQ",
        },
        {
          question_uid: "go:12",
          title: "GATE CSE 2025 | Question: 12",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["operating-system", "context-switch"],
          type: "MCQ",
        },
      ],
      progressRecords: {
        "go:10": {
          status: "watched",
          attempts: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          lastSubmittedAt: "2026-04-05T10:00:00.000Z",
        },
        "go:11": {
          status: "skipped",
          lastInput: "",
          lastSubmittedAt: "2026-04-05T11:00:00.000Z",
        },
        "go:12": {
          status: "attempted",
          attempts: 1,
          correctAttempts: 0,
          incorrectAttempts: 1,
          correct: false,
          lastInput: "B",
          lastSubmittedAt: "2026-04-05T12:00:00.000Z",
        },
      },
      solvedQuestionIds: [],
    });

    expect(insights.attemptedQuestionCount).toBe(1);
    expect(insights.subjects).toHaveLength(1);
    expect(insights.subjects[0]).toMatchObject({
      label: "Operating System",
      attemptedQuestions: 1,
      attemptedCount: 1,
      incorrectAttempts: 1,
    });
    expect(insights.wrongQuestions).toHaveLength(1);
    expect(insights.wrongQuestions[0]).toMatchObject({
      storageKey: "go:12",
      subjectLabel: "Operating System",
      incorrectAttempts: 1,
    });
  });

  test("builds review queue, time trend, difficulty, and streak summaries", () => {
    const insights = buildWeakTopicInsights({
      now: new Date("2026-05-08T10:00:00.000Z"),
      questions: [
        {
          question_uid: "go:20",
          title: "GATE CSE 2025 | Question: 20",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["algorithms", "graphs"],
          type: "MCQ",
        },
        {
          question_uid: "go:21",
          title: "GATE CSE 2025 | Question: 21",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["algorithms", "dynamic-programming"],
          type: "MCQ",
        },
      ],
      progressRecords: {
        "go:20": {
          attempts: 3,
          correctAttempts: 0,
          incorrectAttempts: 3,
          correct: false,
          lastSubmittedAt: "2026-05-06T10:00:00.000Z",
          reviewDueAt: "2026-05-07T10:00:00.000Z",
          totalDurationMs: 240000,
          timedAttemptCount: 3,
          history: [
            { submittedAt: "2026-05-05T10:00:00.000Z", correct: false, durationMs: 80000 },
            { submittedAt: "2026-05-06T10:00:00.000Z", correct: false, durationMs: 90000 },
          ],
        },
        "go:21": {
          attempts: 1,
          correctAttempts: 1,
          incorrectAttempts: 0,
          correct: true,
          lastSubmittedAt: "2026-05-07T10:00:00.000Z",
          reviewDueAt: "2026-05-10T10:00:00.000Z",
          totalDurationMs: 60000,
          timedAttemptCount: 1,
          history: [
            { submittedAt: "2026-05-07T10:00:00.000Z", correct: true, durationMs: 60000 },
          ],
        },
      },
    });

    expect(insights.reviewQueue).toHaveLength(1);
    expect(insights.reviewQueue[0]).toMatchObject({
      storageKey: "go:20",
      difficultyLabel: "Hard",
      daysOverdue: 1,
    });
    expect(insights.timeSummary).toMatchObject({
      totalDurationMs: 300000,
      timedAttemptCount: 4,
      averageDurationMs: 75000,
    });
    expect(insights.attemptTimeline.map((entry) => entry.date)).toEqual([
      "2026-05-05",
      "2026-05-06",
      "2026-05-07",
    ]);
    expect(insights.studyActivity).toMatchObject({
      activeDayCount: 3,
      currentStreak: 3,
      longestStreak: 3,
    });
    expect(insights.difficultySummary.counts.Hard).toBe(1);
    expect(insights.difficultySummary.hardQuestions[0].storageKey).toBe("go:20");
  });

  test("returns currentStreak=0 when last active date is 2+ days before now (BUG-G)", () => {
    const insights = buildWeakTopicInsights({
      now: new Date("2026-05-12T10:00:00.000Z"),
      questions: [
        {
          question_uid: "go:30",
          title: "GATE CSE 2025 | Question: 30",
          year: 2025,
          set: null,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["algorithms", "sorting"],
          type: "MCQ",
        },
      ],
      progressRecords: {
        "go:30": {
          attempts: 2,
          correctAttempts: 1,
          incorrectAttempts: 1,
          correct: true,
          lastSubmittedAt: "2026-05-08T10:00:00.000Z",
          history: [
            { submittedAt: "2026-05-07T10:00:00.000Z", correct: false, durationMs: 30000 },
            { submittedAt: "2026-05-08T10:00:00.000Z", correct: true, durationMs: 40000 },
          ],
        },
      },
    });

    // Last active was May 8, now is May 12 — 4-day gap → streak must be 0
    expect(insights.studyActivity.currentStreak).toBe(0);
    // But the historical consecutive run (May 7-8) should still count as longestStreak
    expect(insights.studyActivity.longestStreak).toBe(2);
    expect(insights.studyActivity.activeDayCount).toBe(2);
  });
});
