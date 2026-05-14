/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test } from "vitest";

import {
  appendMockTestHistoryEntry,
  buildMockAttemptHistoryEntry,
  clearMockTestHistory,
  MOCK_TEST_HISTORY_STORAGE_KEY,
  readMockTestHistory,
} from "./mockTestHistory";

describe("mockTestHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("buildMockAttemptHistoryEntry captures correct, incorrect, unanswered, and bonus questions", () => {
    const entry = buildMockAttemptHistoryEntry({
      attemptMeta: {
        kindId: "custom",
        kindTitle: "Custom / Topic-based test",
        questionCount: 4,
        durationMinutes: 40,
      },
      questionMetaByUid: {
        "ga:1": { section: "GA", orderIndex: 1, type: "MCQ" },
        "cs:2": { section: "CS", orderIndex: 2, type: "MSQ" },
        "cs:3": { section: "CS", orderIndex: 3, type: "NAT" },
        "cs:4": { section: "CS", orderIndex: 4, type: "MARKS_TO_ALL" },
      },
      questions: [
        { question_uid: "ga:1" },
        { question_uid: "cs:2" },
        { question_uid: "cs:3" },
        { question_uid: "cs:4" },
      ],
      resultSummary: {
        score: 3.6667,
        maxScore: 7,
        attempted: 2,
        correct: 1,
        incorrect: 1,
        unanswered: 1,
        bonus: 1,
        timeAnalysis: {
          totalSeconds: 421,
          averageSeconds: 105,
          slowQuestionCount: 1,
          slowThresholdSeconds: 180,
        },
        perQuestionResult: {
          "ga:1": { questionUid: "ga:1", section: "GA", orderIndex: 1, type: "MCQ", correct: true, answered: true, scoreDelta: 2, timeSpentSeconds: 75 },
          "cs:2": { questionUid: "cs:2", section: "CS", orderIndex: 2, type: "MSQ", correct: false, answered: true, scoreDelta: -0.3333, timeSpentSeconds: 181 },
          "cs:3": { questionUid: "cs:3", section: "CS", orderIndex: 3, type: "NAT", correct: false, answered: false, scoreDelta: 0, timeSpentSeconds: 120 },
          "cs:4": { questionUid: "cs:4", section: "CS", orderIndex: 4, type: "MARKS_TO_ALL", status: "bonus", correct: false, answered: false, scoreDelta: 2, timeSpentSeconds: 45 },
        },
      },
      submittedAt: "2026-04-05T12:30:00.000Z",
    });

    expect(entry).toMatchObject({
      kindId: "custom",
      correct: 1,
      incorrect: 1,
      unanswered: 1,
      bonus: 1,
    });
    expect(entry.correctQuestions).toEqual([
      expect.objectContaining({ questionUid: "ga:1", label: "GA-1", timeSpentSeconds: 75, timeExceededThreshold: false }),
    ]);
    expect(entry.incorrectQuestions).toEqual([
      expect.objectContaining({ questionUid: "cs:2", label: "CS-2", timeSpentSeconds: 181, timeExceededThreshold: true }),
    ]);
    expect(entry.unansweredQuestions).toEqual([
      expect.objectContaining({ questionUid: "cs:3", label: "CS-3" }),
    ]);
    expect(entry.bonusQuestions).toEqual([
      expect.objectContaining({ questionUid: "cs:4", label: "CS-4" }),
    ]);
    expect(entry.timeAnalysis).toMatchObject({
      totalSeconds: 421,
      averageSeconds: 105,
      slowQuestionCount: 1,
    });
  });

  test("appendMockTestHistoryEntry persists newest attempts first", () => {
    appendMockTestHistoryEntry({
      id: "older",
      submittedAt: "2026-04-05T10:00:00.000Z",
      kindId: "full_length",
      kindTitle: "Full-length generated mock",
      questionCount: 65,
      durationMinutes: 180,
      score: 30,
      maxScore: 100,
      attempted: 40,
      correct: 25,
      incorrect: 15,
      unanswered: 25,
      correctQuestions: [],
      incorrectQuestions: [],
      unansweredQuestions: [],
    });

    appendMockTestHistoryEntry({
      id: "newer",
      submittedAt: "2026-04-05T11:00:00.000Z",
      kindId: "paper_mode",
      kindTitle: "Real paper mode",
      selectedPaperLabel: "2026 Set 2",
      questionCount: 65,
      durationMinutes: 180,
      score: 55,
      maxScore: 100,
      attempted: 50,
      correct: 35,
      incorrect: 15,
      unanswered: 15,
      correctQuestions: [],
      incorrectQuestions: [],
      unansweredQuestions: [],
    });

    const history = readMockTestHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({
      id: "newer",
      selectedPaperLabel: "2026 Set 2",
    });
    expect(history[1]).toMatchObject({
      id: "older",
    });
    expect(window.localStorage.getItem(MOCK_TEST_HISTORY_STORAGE_KEY)).toContain("newer");

    clearMockTestHistory();
    expect(readMockTestHistory()).toEqual([]);
  });
});
