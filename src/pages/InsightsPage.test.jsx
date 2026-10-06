/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor, fireEvent, act, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  loadWeakTopicInsights: vi.fn(),
  clearInsightsCache: vi.fn(),
  readMockTestHistory: vi.fn().mockReturnValue([]),
  startReviewSession: vi.fn(),
  startOrderedSession: vi.fn(),
  startRandomSession: vi.fn(),
}));

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children, showHeader, showFooter }) => (
    <div
      data-testid="page-shell"
      data-show-header={String(showHeader)}
      data-show-footer={String(showFooter)}
    >
      {children}
    </div>
  ),
}));

vi.mock("../utils/weakTopicAnalyzer", () => ({
  loadWeakTopicInsights: mocks.loadWeakTopicInsights,
  clearInsightsCache: mocks.clearInsightsCache,
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
    getQuestionById: vi.fn((uid) => ({ question_uid: uid, title: uid })),
  }),
}));

vi.mock("../contexts/SessionContext", () => ({
  useSession: () => ({
    startReviewSession: mocks.startReviewSession,
    startOrderedSession: mocks.startOrderedSession,
    startRandomSession: mocks.startRandomSession,
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
    mocks.clearInsightsCache.mockReset();
    mocks.readMockTestHistory.mockReset();
    mocks.readMockTestHistory.mockReturnValue([]);
  });

  test("shows a loading message while local insights are being built", async () => {
    const pending = deferred();
    mocks.loadWeakTopicInsights.mockReturnValueOnce(pending.promise);

    renderInsightsPage();

    expect(screen.getByText(/building insights from your practice and mock history/i)).toBeTruthy();

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
    // Check for weighted overall accuracy: (3+5)/(7+6) = 8/13 = 62%
    expect(screen.getByText("62%")).toBeTruthy();
  });

  test("renders tab navigation with overview, review, and wrong answers tabs", async () => {
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
    await screen.findAllByText("Overview");
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);

    // Switch to wrong answers tab
    fireEvent.click(screen.getByRole("button", { name: /wrong answers/i }));
    // Should show still wrong count and the question
    expect(await screen.findByText(/total wrong/i)).toBeTruthy();
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

  test("renders Mock History tab even when attemptedQuestionCount is 0 (user only completed mock tests)", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 0,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
      mockSummary: {
        attemptCount: 1,
        attemptedQuestionCount: 25,
      },
    });
    mocks.readMockTestHistory.mockReturnValue([
      {
        id: "custom-mock-1",
        kindTitle: "Custom Builder",
        submittedAt: "2026-09-17T19:20:00Z",
        score: 42,
        maxScore: 60,
        questionCount: 25,
        durationMinutes: 75,
        attempted: 20,
        correct: 15,
        incorrect: 5,
        unanswered: 5,
        correctQuestions: [{ questionUid: "q1", label: "Custom Question 1", type: "MCQ", scoreDelta: 2 }],
        incorrectQuestions: [],
        unansweredQuestions: [],
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/insights?tab=mock-history"]}>
        <InsightsPage hasResumeRoute={false} onResumePractice={vi.fn()} />
      </MemoryRouter>
    );

    // Should display Recent Mock Attempts instead of "No insights yet"
    expect(await screen.findByText(/recent mock attempts/i)).toBeTruthy();
    expect(screen.getAllByText("Custom Builder").length).toBeGreaterThan(0);
    expect(screen.queryByText(/no insights yet/i)).toBeNull();
  });

  test("generates correct practice filter URLs for DA subtopics with multi-colon keys", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 4,
      subjects: [
        { key: "da:linear-algebra", label: "Linear Algebra", accuracyRate: 0.3, attemptedCount: 4, correctAttempts: 1, incorrectAttempts: 3, coverageRate: 0.2, recentMistakeStreak: 2, availableQuestions: 20 },
      ],
      subtopics: [
        {
          key: "da:linear-algebra:matrices",
          subjectSlug: "da:linear-algebra",
          subtopicSlug: "matrices",
          label: "Matrices",
          subjectLabel: "Linear Algebra",
          accuracyRate: 0.25,
          attemptedCount: 4,
          correctAttempts: 1,
          incorrectAttempts: 3,
          coverageRate: 0.2,
          recentMistakeStreak: 2,
        },
      ],
      wrongQuestions: [],
      reviewQueue: [],
    });

    renderInsightsPage();

    // Wait for the Smart Practice banner to render
    expect(await screen.findByText("Practice Weak Areas")).toBeTruthy();

    const autoFilterLink = screen.getByRole("link", { name: /auto-filter practice/i });
    expect(autoFilterLink).toBeTruthy();
    expect(autoFilterLink.getAttribute("href")).toContain("subjects=da%3Alinear-algebra");
    expect(autoFilterLink.getAttribute("href")).toContain("subtopics=matrices");
  });

  test("shows retry button on error and recovers when clicked", async () => {
    mocks.loadWeakTopicInsights.mockRejectedValueOnce(new Error("Network timeout loading insights"));
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 5,
      subjects: [
        { key: "algo", label: "Algorithms", accuracyRate: 0.8, attemptedCount: 5, correctAttempts: 4, incorrectAttempts: 1, coverageRate: 0.3, recentMistakeStreak: 0, availableQuestions: 16 },
      ],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();

    expect(await screen.findByText("Network timeout loading insights")).toBeTruthy();
    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeTruthy();

    fireEvent.click(retryBtn);

    expect(mocks.clearInsightsCache).toHaveBeenCalled();
    expect(await screen.findByText("5")).toBeTruthy();
  });

  test("renders safely without crashing when insights object has undefined fields", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 2,
      subjects: undefined,
      subtopics: undefined,
      wrongQuestions: undefined,
      reviewQueue: undefined,
      attemptTimeline: undefined,
      studyActivity: undefined,
      timeSummary: undefined,
      difficultySummary: undefined,
      mockSummary: undefined,
    });

    renderInsightsPage();

    expect(await screen.findByText("2")).toBeTruthy();
  });

  test("re-triggers load when gateqa:progress-updated event is dispatched", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValue({
      attemptedQuestionCount: 3,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();

    expect(await screen.findByText("3")).toBeTruthy();
    expect(mocks.loadWeakTopicInsights).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new CustomEvent("gateqa:progress-updated"));
    });

    await waitFor(() => {
      expect(mocks.loadWeakTopicInsights).toHaveBeenCalledTimes(2);
    });
    expect(mocks.clearInsightsCache).toHaveBeenCalled();
  });

  test("renders PageShell with showHeader=false for distraction-free analytics", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 0,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();
    await screen.findByText(/no insights yet/i);

    const pageShell = screen.getByTestId("page-shell");
    expect(pageShell.getAttribute("data-show-header")).toBe("false");
  });

  test("renders Home navigation button and theme toggle in hero header", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 0,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();
    await screen.findByText(/no insights yet/i);

    const homeLink = screen.getByRole("link", { name: /back to home/i });
    expect(homeLink).toBeTruthy();
    expect(homeLink.getAttribute("href")).toBe("/");

    const themeToggle = screen.getByRole("switch", { name: /switch to (dark|light) mode/i });
    expect(themeToggle).toBeTruthy();
  });

  test("renders track switcher in header and does not render ProgressManager import/export buttons", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 0,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();
    await screen.findByText(/no insights yet/i);

    expect(screen.getByRole("button", { name: /^cs$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^da$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^aptitude$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^combined$/i })).toBeTruthy();

    expect(screen.queryByRole("button", { name: /export json/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /export csv/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /import/i })).toBeNull();
  });

  test("renders sorting control in Subject Progress and dynamically reorders cards", async () => {
    window.localStorage.clear();
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 20,
      subjects: [
        { key: "cn", label: "Computer Networks", coverageRate: 0.01, accuracyRate: 0.4, attemptedCount: 2, availableQuestions: 200 },
        { key: "dl", label: "Digital Logic", coverageRate: 0.09, accuracyRate: 0.61, attemptedCount: 9, availableQuestions: 100 },
        { key: "os", label: "Operating System", coverageRate: 0.29, accuracyRate: 0.66, attemptedCount: 29, availableQuestions: 100 },
      ],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();
    await screen.findByText("Subject Progress");

    // Default sort is Coverage — High to Low (coverage_desc)
    expect(screen.getByText("Coverage ↓")).toBeTruthy();

    // Verify initial ordering: Operating System (29%) -> Digital Logic (9%) -> Computer Networks (1%)
    let subjectNames = screen.getAllByText(/Computer Networks|Digital Logic|Operating System/).map((el) => el.textContent);
    expect(subjectNames).toEqual([
      "Operating System",
      "Digital Logic",
      "Computer Networks",
    ]);

    // Open sorting dropdown
    const sortBtn = screen.getByRole("button", { name: /sort subjects/i });
    fireEvent.click(sortBtn);

    // Select Coverage — Low to High (coverage_asc)
    const covAscOption = screen.getByRole("option", { name: /coverage — low to high/i });
    fireEvent.click(covAscOption);

    // Verify updated header display
    expect(screen.getByText("Coverage ↑")).toBeTruthy();

    // Verify updated ordering: Computer Networks (1%) -> Digital Logic (9%) -> Operating System (29%)
    subjectNames = screen.getAllByText(/Computer Networks|Digital Logic|Operating System/).map((el) => el.textContent);
    expect(subjectNames).toEqual([
      "Computer Networks",
      "Digital Logic",
      "Operating System",
    ]);

    // Verify persistence in localStorage
    expect(window.localStorage.getItem("gateqa_subject_progress_sort")).toBe("coverage_asc");
  });

  test("restores persisted sorting preference on initial mount", async () => {
    window.localStorage.setItem("gateqa_subject_progress_sort", "accuracy_asc");
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 20,
      subjects: [
        { key: "os", label: "Operating System", coverageRate: 0.29, accuracyRate: 0.85, attemptedCount: 29, availableQuestions: 100 },
        { key: "cn", label: "Computer Networks", coverageRate: 0.01, accuracyRate: 0.4, attemptedCount: 2, availableQuestions: 200 },
        { key: "dl", label: "Digital Logic", coverageRate: 0.09, accuracyRate: 0.61, attemptedCount: 9, availableQuestions: 100 },
      ],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();
    await screen.findByText("Subject Progress");

    // Restores Accuracy ↑
    expect(screen.getByText("Accuracy ↑")).toBeTruthy();

    // Accuracy low to high: Computer Networks (40%) -> Digital Logic (61%) -> Operating System (85%)
    const subjectNames = screen.getAllByText(/Computer Networks|Digital Logic|Operating System/).map((el) => el.textContent);
    expect(subjectNames).toEqual([
      "Computer Networks",
      "Digital Logic",
      "Operating System",
    ]);
  });

  test("Subject Progress collapse and expand toggles without interfering with sorting control", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 5,
      subjects: [
        { key: "algo", label: "Algorithms", coverageRate: 0.5, accuracyRate: 0.7, attemptedCount: 5, availableQuestions: 10 },
      ],
      subtopics: [],
      wrongQuestions: [],
    });

    renderInsightsPage();
    const heading = await screen.findByText("Subject Progress");
    const section = heading.closest("section");
    expect(section).toBeTruthy();

    expect(within(section).getByText("Algorithms")).toBeTruthy();

    // Click collapse chevron button inside Subject Progress section
    const collapseBtn = within(section).getByRole("button", { name: /collapse section/i });
    fireEvent.click(collapseBtn);

    // Subject rings should be collapsed
    expect(within(section).queryByText("Algorithms")).toBeNull();

    // Click expand chevron button inside Subject Progress section
    const expandBtn = within(section).getByRole("button", { name: /expand section/i });
    fireEvent.click(expandBtn);

    // Subject rings restored
    expect(within(section).getByText("Algorithms")).toBeTruthy();
  });

  test("clicking Start Review in Spaced Repetition banner initializes review session with all due questions", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 5,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
      reviewQueue: [
        { storageKey: "q-rev-1", subjectLabel: "Algorithms", difficultyLabel: "Medium" },
        { storageKey: "q-rev-2", subjectLabel: "Algorithms", difficultyLabel: "Hard" },
        { storageKey: "q-rev-3", subjectLabel: "OS", difficultyLabel: "Easy" },
      ],
    });

    renderInsightsPage();

    const startReviewBtn = await screen.findByRole("link", { name: /start review/i });
    expect(startReviewBtn).toBeTruthy();

    fireEvent.click(startReviewBtn);

    expect(mocks.startReviewSession).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ question_uid: "q-rev-1" }),
        expect.objectContaining({ question_uid: "q-rev-2" }),
        expect.objectContaining({ question_uid: "q-rev-3" }),
      ]),
      "q-rev-1"
    );
  });

  test("clicking a card in Review Queue tab initializes review session starting at that question", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 5,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
      reviewQueue: [
        { storageKey: "q-rev-1", subjectLabel: "Algorithms", difficultyLabel: "Medium" },
        { storageKey: "q-rev-2", subjectLabel: "Algorithms", difficultyLabel: "Hard" },
      ],
    });

    renderInsightsPage();

    fireEvent.click(await screen.findByRole("button", { name: /review queue/i }));

    const card = await screen.findByText("q-rev-2");
    fireEvent.click(card.closest("button"));

    expect(mocks.startReviewSession).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ question_uid: "q-rev-1" }),
        expect.objectContaining({ question_uid: "q-rev-2" }),
      ]),
      "q-rev-2"
    );
  });

  test("allows switching between CS, DA, Combined, and Aptitude sections with strict isolation", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 30,
      subjects: [
        { key: "algo", label: "Algorithms", accuracyRate: 0.8, attemptedCount: 10, correctAttempts: 8, incorrectAttempts: 2, availableQuestions: 20 },
        { key: "da:python", label: "Python Programming", accuracyRate: 0.6, attemptedCount: 10, correctAttempts: 6, incorrectAttempts: 4, availableQuestions: 20 },
        { key: "english", label: "English", accuracyRate: 0.9, attemptedCount: 10, correctAttempts: 9, incorrectAttempts: 1, availableQuestions: 50 },
      ],
      subtopics: [
        { key: "algo-graphs", label: "Graphs", subjectLabel: "Algorithms", subjectSlug: "algo" },
        { key: "da:python-numpy", label: "NumPy", subjectLabel: "Python Programming", subjectSlug: "da:python" },
        { key: "english-vocab", label: "Vocabulary", subjectLabel: "English", subjectSlug: "english" },
      ],
      wrongQuestions: [],
      reviewQueue: [],
    });

    renderInsightsPage();
    await screen.findByText("Subject Progress");

    // Initially "all" (Combined) -> all 3 subjects visible
    expect(screen.getByText("Algorithms")).toBeTruthy();
    expect(screen.getByText("Python Programming")).toBeTruthy();
    expect(screen.getByText("English")).toBeTruthy();

    // Click "APTITUDE"
    const aptBtn = screen.getByRole("button", { name: /^aptitude$/i });
    fireEvent.click(aptBtn);

    // In Aptitude: English must be visible, Algorithms and Python must NOT be visible
    expect(screen.getByText("English")).toBeTruthy();
    expect(screen.queryByText("Algorithms")).toBeNull();
    expect(screen.queryByText("Python Programming")).toBeNull();

    // Check Open Practice link has track=aptitude
    const openPracticeLink = screen.getByRole("link", { name: /open practice/i });
    expect(openPracticeLink.getAttribute("href")).toBe("/practice?track=aptitude");

    // Click "CS"
    const csBtn = screen.getByRole("button", { name: /^cs$/i });
    fireEvent.click(csBtn);

    // In CS: Algorithms visible, English and Python NOT visible
    expect(screen.getByText("Algorithms")).toBeTruthy();
    expect(screen.queryByText("English")).toBeNull();
    expect(screen.queryByText("Python Programming")).toBeNull();
    expect(openPracticeLink.getAttribute("href")).toBe("/practice?track=cs");

    // Click "DA"
    const daBtn = screen.getByRole("button", { name: /^da$/i });
    fireEvent.click(daBtn);

    // In DA: Python visible, English and Algorithms NOT visible
    expect(screen.getByText("Python Programming")).toBeTruthy();
    expect(screen.queryByText("English")).toBeNull();
    expect(screen.queryByText("Algorithms")).toBeNull();
    expect(openPracticeLink.getAttribute("href")).toBe("/practice?track=da");

    // Click "COMBINED"
    const allBtn = screen.getByRole("button", { name: /^combined$/i });
    fireEvent.click(allBtn);

    // Combined: All 3 visible
    expect(screen.getByText("Algorithms")).toBeTruthy();
    expect(screen.getByText("Python Programming")).toBeTruthy();
    expect(screen.getByText("English")).toBeTruthy();
    expect(openPracticeLink.getAttribute("href")).toBe("/practice");
  });

  test("displays standardized categories CS, DA, APTITUDE, COMBINED and invokes loadWeakTopicInsights with includeIsro", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 0,
      subjects: [],
      subtopics: [],
      wrongQuestions: [],
      reviewQueue: [],
    });

    renderInsightsPage();
    await screen.findByText(/no insights yet/i);

    // Verify all 4 category buttons exist with exact labels
    const csBtn = screen.getByRole("button", { name: /^cs$/i });
    const daBtn = screen.getByRole("button", { name: /^da$/i });
    const aptBtn = screen.getByRole("button", { name: /^aptitude$/i });
    const combinedBtn = screen.getByRole("button", { name: /^combined$/i });

    expect(csBtn).toBeTruthy();
    expect(daBtn).toBeTruthy();
    expect(aptBtn).toBeTruthy();
    expect(combinedBtn).toBeTruthy();

    // Verify legacy names are absent
    expect(screen.queryByRole("button", { name: /gate cs/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /gate da/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /general aptitude/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /special aptitude/i })).toBeNull();

    // Verify loadWeakTopicInsights was called with includeIsro: true
    expect(mocks.loadWeakTopicInsights).toHaveBeenCalledWith(
      expect.objectContaining({
        includeAptitude: true,
        includeIsro: true,
      })
    );
  });

  test("classifies ISRO CSE questions under CS track and COMBINED track while strictly isolating from DA and APTITUDE", async () => {
    mocks.loadWeakTopicInsights.mockResolvedValueOnce({
      attemptedQuestionCount: 40,
      subjects: [
        { key: "os", label: "Operating Systems", accuracyRate: 0.85, attemptedCount: 10, correctAttempts: 8, incorrectAttempts: 2, availableQuestions: 50 },
        { key: "da:dbms", label: "DBMS & Warehousing", accuracyRate: 0.7, attemptedCount: 10, correctAttempts: 7, incorrectAttempts: 3, availableQuestions: 30 },
        { key: "verbal", label: "Verbal Ability", accuracyRate: 0.9, attemptedCount: 10, correctAttempts: 9, incorrectAttempts: 1, availableQuestions: 40 },
      ],
      subtopics: [
        { key: "os:scheduling", label: "CPU Scheduling", subjectLabel: "Operating Systems", subjectSlug: "os" },
        { key: "da:dbms:sql", label: "SQL", subjectLabel: "DBMS & Warehousing", subjectSlug: "da:dbms" },
        { key: "verbal:grammar", label: "Grammar", subjectLabel: "Verbal Ability", subjectSlug: "verbal" },
      ],
      wrongQuestions: [
        { storageKey: "isro:2020:15", subjectLabel: "Operating Systems", subjectSlug: "os", attempts: 2, incorrectAttempts: 1 },
        { storageKey: "da:2024:5", subjectLabel: "DBMS & Warehousing", subjectSlug: "da:dbms", attempts: 1, incorrectAttempts: 1 },
      ],
      reviewQueue: [
        { storageKey: "isro:2020:15", subjectLabel: "Operating Systems", subjectSlug: "os" },
      ],
    });

    renderInsightsPage();
    await screen.findByText("Subject Progress");

    // Initially COMBINED (all 3 visible)
    expect(screen.getByText("Operating Systems")).toBeTruthy();
    expect(screen.getByText("DBMS & Warehousing")).toBeTruthy();
    expect(screen.getByText("Verbal Ability")).toBeTruthy();

    // Switch to CS track -> Operating Systems (which includes ISRO) must be visible, DA and Verbal must NOT
    fireEvent.click(screen.getByRole("button", { name: /^cs$/i }));
    expect(screen.getByText("Operating Systems")).toBeTruthy();
    expect(screen.queryByText("DBMS & Warehousing")).toBeNull();
    expect(screen.queryByText("Verbal Ability")).toBeNull();

    // Switch to DA track -> only DA visible; ISRO Operating Systems must NOT be present
    fireEvent.click(screen.getByRole("button", { name: /^da$/i }));
    expect(screen.getByText("DBMS & Warehousing")).toBeTruthy();
    expect(screen.queryByText("Operating Systems")).toBeNull();
    expect(screen.queryByText("Verbal Ability")).toBeNull();

    // Switch to APTITUDE track -> only Verbal visible; ISRO Operating Systems must NOT be present
    fireEvent.click(screen.getByRole("button", { name: /^aptitude$/i }));
    expect(screen.getByText("Verbal Ability")).toBeTruthy();
    expect(screen.queryByText("Operating Systems")).toBeNull();
    expect(screen.queryByText("DBMS & Warehousing")).toBeNull();
  });
});

