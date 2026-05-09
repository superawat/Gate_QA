/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  loadWeakTopicInsights: vi.fn(),
  readMockTestHistory: vi.fn().mockReturnValue([]),
}));

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../utils/weakTopicAnalyzer", () => ({
  loadWeakTopicInsights: mocks.loadWeakTopicInsights,
}));

vi.mock("../utils/mockTestHistory", () => ({
  readMockTestHistory: mocks.readMockTestHistory,
}));

vi.mock("../contexts/FilterContext", () => ({
  useFilterState: () => ({
    solvedCount: 13,
    totalQuestions: 3527,
    progressPercentage: 0,
    solvedQuestionIds: [],
    bookmarkedQuestionIds: [],
    allQuestions: [],
  }),
  useFilterActions: () => ({
    refreshProgressState: vi.fn(),
  }),
}));

import InsightsPage from "./InsightsPage";

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, resolve, reject };
};

const renderInsightsPage = (props = {}) => render(
  <MemoryRouter>
    <InsightsPage hasResumeRoute={false} onResumePractice={vi.fn()} {...props} />
  </MemoryRouter>
);

describe("InsightsPage", () => {
  beforeEach(() => {
    mocks.loadWeakTopicInsights.mockReset();
    mocks.readMockTestHistory.mockReset();
    mocks.readMockTestHistory.mockReturnValue([]);
  });

  test("shows a loading message while local insights are being built", async () => {
    const pending = deferred();
    mocks.loadWeakTopicInsights.mockReturnValueOnce(pending.promise);

    renderInsightsPage();

    expect(screen.getByText(/building insights from your local practice history/i)).toBeTruthy();

    pending.resolve({
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
      attemptedQuestionCount: 0,
    });

    await screen.findByText(/no insights yet/i);
  });

  test("shows the empty state when no attempted questions exist", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
      attemptedQuestionCount: 0,
    });

    renderInsightsPage();

    expect(await screen.findByText(/no insights yet/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /start practice/i }).getAttribute("href")).toBe("/practice");
  });

  test("does not show internal answer coverage tracking on the insights page", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
      attemptedQuestionCount: 0,
    });

    renderInsightsPage({
      questionBankManifest: {
        questionCount: 3271,
        latestYear: 2026,
        answerCoverage: {
          directQuestionUidMatches: 3150,
          unsupportedQuestionCount: 78,
          estimatedCoverageRatio: 0.963,
          yearSets: [
            { year: 2026, total: 65, covered: 65, unsupported: 0 },
            { year: 2026, total: 65, covered: 65, unsupported: 0 },
          ],
        },
      },
    });

    expect(await screen.findByText(/no insights yet/i)).toBeTruthy();
    expect(screen.queryByText(/answer coverage/i)).toBeNull();
    expect(screen.queryByText(/verified answers/i)).toBeNull();
    expect(screen.queryByText(/still pending/i)).toBeNull();
  });

  test("shows an error banner when insight generation fails", async () => {
    mocks.loadWeakTopicInsights.mockRejectedValueOnce(new Error("Insight load failed"));

    renderInsightsPage();

    expect(await screen.findByText("Insight load failed")).toBeTruthy();
  });

  test("renders the summary stats for attempted questions and weak areas", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 18,
      subjects: [
        { key: "algo", label: "Algorithms", accuracyRate: 0.4, attemptedCount: 7, correctAttempts: 3, incorrectAttempts: 4, coverageRate: 0.5, recentMistakeStreak: 3, availableQuestions: 14 },
        { key: "os", label: "Operating Systems", accuracyRate: 0.8, attemptedCount: 6, correctAttempts: 5, incorrectAttempts: 1, coverageRate: 0.45, recentMistakeStreak: 0, availableQuestions: 13 },
      ],
      subtopics: [
        {
          key: "algo-greedy",
          label: "Greedy",
          subjectLabel: "Algorithms",
          accuracyRate: 0.45,
          attemptedCount: 4,
          correctAttempts: 2,
          incorrectAttempts: 2,
          coverageRate: 0.3,
          recentMistakeStreak: 2,
        },
      ],
      wrongQuestions: [],
    });

    renderInsightsPage();

    // Wait for the overview tab to show attempted count
    expect(await screen.findByText("18")).toBeTruthy();
    // Check for weak subject count - displayed as card value
    expect(screen.getByText("60%")).toBeTruthy();
  });

  test("renders tab navigation with overview, analysis, and wrong answers tabs", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 12,
      subjects: [
        { key: "algo", label: "Algorithms", accuracyRate: 0.4, attemptedCount: 7, correctAttempts: 3, incorrectAttempts: 4, coverageRate: 0.5, recentMistakeStreak: 3, availableQuestions: 14 },
        { key: "toc", label: "Theory of Computation", accuracyRate: 0.65, attemptedCount: 3, correctAttempts: 2, incorrectAttempts: 1, coverageRate: 0.2, recentMistakeStreak: 1, availableQuestions: 15 },
      ],
      subtopics: [
        {
          key: "algo-dp",
          label: "Dynamic Programming",
          subjectLabel: "Algorithms",
          accuracyRate: 0.45,
          attemptedCount: 4,
          correctAttempts: 2,
          incorrectAttempts: 2,
          coverageRate: 0.3,
          recentMistakeStreak: 2,
        },
      ],
      wrongQuestions: [
        {
          storageKey: "test-q-1",
          subjectLabel: "Algorithms",
          subjectSlug: "algo",
          subtopics: [],
          attempts: 2,
          correctAttempts: 0,
          incorrectAttempts: 2,
          lastCorrect: false,
          lastSubmittedAt: "2026-04-10T10:00:00Z",
          type: "MCQ",
          lastInput: "A",
        },
      ],
    });

    renderInsightsPage();

    // Wait for tabs to appear
    await screen.findByText("Overview");
    expect(screen.getByText("Overview")).toBeTruthy();

    // Switch to analysis tab
    fireEvent.click(screen.getByRole("button", { name: /strengths/i }));
    // Should show areas to improve
    expect(await screen.findByText("Areas to Improve")).toBeTruthy();
    expect(screen.getAllByText("Algorithms").length).toBeGreaterThan(0);
  });

  test("keeps the primary practice entry link available in the populated state", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 5,
      subjects: [
        { key: "algo", label: "Algorithms", accuracyRate: 0.75, attemptedCount: 5, correctAttempts: 4, incorrectAttempts: 1, coverageRate: 0.3, recentMistakeStreak: 0, availableQuestions: 16 },
      ],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /open practice/i }).getAttribute("href")).toBe("/practice");
    });
  });

  test("renders review, time, difficulty, and streak insights", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 2,
      subjects: [
        { key: "algo", label: "Algorithms", accuracyRate: 0.4, attemptedCount: 3, correctAttempts: 1, incorrectAttempts: 2, coverageRate: 0.2, recentMistakeStreak: 1, availableQuestions: 12 },
      ],
      subtopics: [],
      wrongQuestions: [],
      reviewQueue: [
        {
          storageKey: "go:review",
          subjectLabel: "Algorithms",
          subjectSlug: "algorithms",
          subtopics: [{ label: "Graphs" }],
          attempts: 3,
          correctAttempts: 1,
          incorrectAttempts: 2,
          difficultyLabel: "Hard",
          difficultyScore: 82,
          daysOverdue: 2,
          reviewLevel: 0,
          type: "MCQ",
        },
      ],
      attemptTimeline: [
        { date: "2026-05-06", attempts: 1, correct: 0, incorrect: 1, accuracyRate: 0, averageDurationMs: 90000 },
        { date: "2026-05-07", attempts: 1, correct: 1, incorrect: 0, accuracyRate: 1, averageDurationMs: 60000 },
      ],
      studyActivity: {
        activeDayCount: 2,
        currentStreak: 2,
        longestStreak: 2,
        xp: 45,
        badges: ["25 attempts"],
      },
      timeSummary: {
        totalDurationMs: 150000,
        timedAttemptCount: 2,
        averageDurationMs: 75000,
      },
      difficultySummary: {
        counts: { Light: 0, Medium: 0, Hard: 1, Unrated: 0 },
        averageDifficultyScore: 82,
        hardQuestions: [{ storageKey: "go:review" }],
      },
    });

    renderInsightsPage();

    expect(await screen.findByText(/due review/i)).toBeTruthy();
    expect(screen.getByText("1m")).toBeTruthy();
    expect(screen.getByText("45")).toBeTruthy();
    expect(screen.getByText("25 attempts")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /review queue/i }));

    expect(await screen.findByText("go:review")).toBeTruthy();
    expect(screen.getByText(/2d overdue/i)).toBeTruthy();
    expect(screen.getByText(/hard 82/i)).toBeTruthy();
  });

  test("renders the Mock History tab and respect ?tab=mock-history query param", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 5,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
    });
    mocks.readMockTestHistory.mockReturnValueOnce([
      {
        id: "mock1",
        kindTitle: "Full Mock",
        submittedAt: "2026-04-10T10:00:00Z",
        score: 80,
        maxScore: 100,
        questionCount: 65,
        durationMinutes: 180,
        attempted: 60,
        correct: 50,
        incorrect: 10,
        unanswered: 5,
        correctQuestions: [{ questionUid: "q1", label: "Logic Question", type: "MCQ", scoreDelta: 1 }],
        incorrectQuestions: [],
        unansweredQuestions: [],
      },
    ]);

    // Render with initial search param
    render(
      <MemoryRouter initialEntries={["/insights?tab=mock-history"]}>
        <InsightsPage hasResumeRoute={false} onResumePractice={vi.fn()} />
      </MemoryRouter>
    );

    // Should show Mock History section immediately
    expect(await screen.findByText(/recent mock attempts/i)).toBeTruthy();
    expect(screen.getAllByText("Full Mock").length).toBeGreaterThan(0);

    // Expand details
    const summary = screen.getAllByText("Full Mock")[0].closest("summary");
    fireEvent.click(summary);

    expect(screen.getByText("Logic Question")).toBeTruthy();
    expect(screen.getByText(/id q1/i)).toBeTruthy();
  });
});
