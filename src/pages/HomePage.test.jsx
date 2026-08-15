/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const readMockTestHistoryMock = vi.fn(() => []);
const loadWeakTopicInsightsMock = vi.fn(async () => ({
  subjects: [],
  subtopics: [],
  attemptedQuestionCount: 0,
}));
const loadStudyActivityFastMock = vi.fn(() => ({
  currentStreak: 0,
  longestStreak: 0,
  xp: 0,
  activeDayCount: 0,
  badges: [],
  todayAttempts: 0,
  attemptTimeline: [],
  streakDateKeys: [],
}));

vi.mock("../contexts/FilterContext", () => ({
  useFilterState: () => ({
    solvedCount: 12,
    bookmarkedCount: 7,
    progressPercentage: 18,
    totalQuestions: 3271,
  }),
}));

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../utils/mockTestHistory", () => ({
  readMockTestHistory: () => readMockTestHistoryMock(),
}));

vi.mock("../utils/weakTopicAnalyzer", () => ({
  loadWeakTopicInsights: () => loadWeakTopicInsightsMock(),
  loadStudyActivityFast: () => loadStudyActivityFastMock(),
}));

import HomePage from "./HomePage";

describe("HomePage", () => {
  beforeEach(() => {
    readMockTestHistoryMock.mockReset();
    readMockTestHistoryMock.mockReturnValue([]);
    loadWeakTopicInsightsMock.mockClear();
    loadWeakTopicInsightsMock.mockResolvedValue({
      subjects: [],
      subtopics: [],
      attemptedQuestionCount: 0,
    });
  });


  test("shows mock entry buttons when mock mode is enabled", () => {
    const onStartMockTest = vi.fn();
    const onOpenMockHistory = vi.fn();

    readMockTestHistoryMock.mockReturnValue([
      { score: 44, maxScore: 100 },
    ]);

    render(
      <HomePage
        questionBankManifest={{
          questionCount: 3271,
          latestYear: 2026,
          yearSets: [{ key: "2026-s1" }, { key: "2026-s2" }],
          answerCoverage: {
            directQuestionUidMatches: 3150,
            estimatedCoverageRatio: 0.963,
          },
        }}
        manifestLoading={false}
        manifestError=""
        hasResumeRoute={false}
        lastSession={null}
        mockModeEnabled
        onStartRandomPractice={vi.fn()}
        onExplorePractice={vi.fn()}
        onOpenInsights={vi.fn()}
        onOpenMockHistory={onOpenMockHistory}
        onStartMockTest={onStartMockTest}
        onResumePractice={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /mock test/i }));
    expect(onStartMockTest).toHaveBeenCalledTimes(1);

  });


  test("opens the dedicated insights page from the insights button", () => {
    const onOpenInsights = vi.fn();

    render(
      <HomePage
        questionBankManifest={{
          questionCount: 3271,
          latestYear: 2026,
          yearSets: [{ key: "2026-s1" }, { key: "2026-s2" }],
        }}
        manifestLoading={false}
        manifestError=""
        hasResumeRoute={false}
        lastSession={null}
        mockModeEnabled={false}
        onStartRandomPractice={vi.fn()}
        onExplorePractice={vi.fn()}
        onOpenInsights={onOpenInsights}
        onOpenMockHistory={vi.fn()}
        onStartMockTest={vi.fn()}
        onResumePractice={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /performance insights/i }));

    expect(onOpenInsights).toHaveBeenCalledTimes(1);
  });

  test("does not show answer coverage tracking on the home dashboard", () => {
    render(
      <HomePage
        questionBankManifest={{
          questionCount: 3271,
          latestYear: 2026,
          yearSets: [{ key: "2026-s1" }, { key: "2026-s2" }],
          answerCoverage: {
            directQuestionUidMatches: 3150,
            estimatedCoverageRatio: 0.963,
          },
        }}
        manifestLoading={false}
        manifestError=""
        hasResumeRoute={false}
        lastSession={null}
        mockModeEnabled={false}
        onStartRandomPractice={vi.fn()}
        onExplorePractice={vi.fn()}
        onOpenInsights={vi.fn()}
        onOpenMockHistory={vi.fn()}
        onStartMockTest={vi.fn()}
        onResumePractice={vi.fn()}
      />
    );

    expect(screen.queryByText(/verified answers/i)).toBeNull();
    expect(screen.queryByText(/still pending/i)).toBeNull();
  });

  test("refreshes activity data when gateqa:progress-updated event is dispatched", () => {
    loadStudyActivityFastMock.mockReturnValueOnce({
      currentStreak: 0,
      longestStreak: 0,
      todayAttempts: 0,
      xp: 0,
      activeDayCount: 0,
      badges: [],
      attemptTimeline: [],
      streakDateKeys: [],
    });

    render(
      <HomePage
        hasResumeRoute={false}
        lastSession={null}
        mockModeEnabled={false}
        onStartRandomPractice={vi.fn()}
        onExplorePractice={vi.fn()}
        onOpenInsights={vi.fn()}
        onOpenMockHistory={vi.fn()}
        onStartMockTest={vi.fn()}
        onResumePractice={vi.fn()}
      />
    );

    expect(screen.getByText("Start a new streak today! 💪")).toBeTruthy();

    loadStudyActivityFastMock.mockReturnValue({
      currentStreak: 5,
      longestStreak: 5,
      todayAttempts: 1,
      xp: 50,
      activeDayCount: 5,
      badges: ["3-day streak"],
      attemptTimeline: [{ date: "2026-08-15", attempts: 1, correct: 1, totalDurationMs: 30000 }],
      streakDateKeys: ["2026-08-15"],
    });

    fireEvent(window, new CustomEvent("gateqa:progress-updated", { detail: { storageKey: "go:1767" } }));

    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
    expect(screen.getByText("Keep your streak moving today.")).toBeTruthy();
  });
});
