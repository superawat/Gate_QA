/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

const preloadPracticeStartExperienceMock = vi.fn();
const preloadExploreRouteMock = vi.fn();
const preloadMockExperienceMock = vi.fn();
const preloadInsightsRouteMock = vi.fn();

vi.mock("../utils/routePreload", () => ({
  preloadPracticeStartExperience: () => preloadPracticeStartExperienceMock(),
  preloadExploreRoute: () => preloadExploreRouteMock(),
  preloadMockExperience: () => preloadMockExperienceMock(),
  preloadInsightsRoute: () => preloadInsightsRouteMock(),
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
  default: ({ children, onResume, resumeLabel }) => (
    <div data-testid="page-shell" data-resume-label={resumeLabel}>
      {children}
      {onResume && (
        <button type="button" onClick={onResume} aria-label={resumeLabel || "Continue"}>
          {resumeLabel || "Continue"}
        </button>
      )}
    </div>
  ),
}));

vi.mock("../utils/mockTestHistory", () => ({
  readMockTestHistory: () => readMockTestHistoryMock(),
}));

vi.mock("../utils/weakTopicAnalyzer", () => ({
  loadWeakTopicInsights: () => loadWeakTopicInsightsMock(),
  loadStudyActivityFast: () => loadStudyActivityFastMock(),
}));

import HomePage from "./HomePage";

const renderHomePage = (props = {}) => {
  const defaultProps = {
    hasResumeRoute: false,
    lastSession: null,
    mockModeEnabled: true,
    onStartRandomPractice: vi.fn(),
    onExplorePractice: vi.fn(),
    onOpenInsights: vi.fn(),
    onOpenMockHistory: vi.fn(),
    onStartMockTest: vi.fn(),
    onResumePractice: vi.fn(),
  };

  return render(
    <MemoryRouter>
      <HomePage {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

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
    preloadPracticeStartExperienceMock.mockClear();
    preloadExploreRouteMock.mockClear();
    preloadMockExperienceMock.mockClear();
    preloadInsightsRouteMock.mockClear();
  });

  test("renders search hero banner with input, background image, and screen-reader heading", () => {
    const { container } = renderHomePage();

    // Screen reader accessible heading
    expect(screen.getByRole("heading", { name: "GateQA practice dashboard", level: 1 })).toBeTruthy();

    // Search hero container and background asset
    const heroBg = container.querySelector(".home-search-hero-bg img");
    expect(heroBg).toBeTruthy();
    expect(heroBg.getAttribute("src")).toContain("searchbar.webp");

    // Search bar input
    const searchInput = screen.getByPlaceholderText("Search topics, subjects, questions...");
    expect(searchInput).toBeTruthy();
  });

  test("renders quick actions container with accessible label", () => {
    renderHomePage();

    const quickActionsSection = screen.getByRole("region", { name: "Dashboard actions" });
    expect(quickActionsSection).toBeTruthy();
  });

  test("clicking Practice card calls onStartRandomPractice and renders badge and copy", () => {
    const onStartRandomPractice = vi.fn();
    renderHomePage({ onStartRandomPractice });

    const practiceCard = screen.getByRole("button", { name: /^Practice/i });
    expect(practiceCard).toBeTruthy();
    expect(screen.getByText("Start with a fresh question")).toBeTruthy();
    expect(screen.getByText("Instant PYQ")).toBeTruthy();

    fireEvent.click(practiceCard);
    expect(onStartRandomPractice).toHaveBeenCalledTimes(1);
  });

  test("clicking Filter Questions card calls onExplorePractice and renders badge", () => {
    const onExplorePractice = vi.fn();
    renderHomePage({ onExplorePractice });

    const filterCard = screen.getByRole("button", { name: /Filter Questions/i });
    expect(filterCard).toBeTruthy();
    expect(screen.getByText("By subject and year")).toBeTruthy();
    expect(screen.getByText("3,500+ PYQs")).toBeTruthy();

    fireEvent.click(filterCard);
    expect(onExplorePractice).toHaveBeenCalledTimes(1);
  });

  test("shows mock entry buttons when mock mode is enabled", () => {
    const onStartMockTest = vi.fn();
    readMockTestHistoryMock.mockReturnValue([{ score: 44, maxScore: 100 }]);

    renderHomePage({ mockModeEnabled: true, onStartMockTest });

    const mockCard = screen.getByRole("button", { name: /Mock Test/i });
    expect(mockCard).toBeTruthy();
    expect(mockCard.hasAttribute("disabled")).toBe(false);
    expect(screen.getByText("1:1 CBT Simulator")).toBeTruthy();
    expect(screen.getByText("Full-length practice")).toBeTruthy();

    fireEvent.click(mockCard);
    expect(onStartMockTest).toHaveBeenCalledTimes(1);
  });

  test("disables Mock Test card when mockModeEnabled is false", () => {
    const onStartMockTest = vi.fn();
    renderHomePage({ mockModeEnabled: false, onStartMockTest });

    const mockCard = screen.getByRole("button", { name: /Mock Test/i });
    expect(mockCard.hasAttribute("disabled")).toBe(true);
    expect(mockCard.className).toContain("home-action-card--disabled");

    fireEvent.click(mockCard);
    expect(onStartMockTest).not.toHaveBeenCalled();
  });

  test("opens the dedicated insights page from the insights button", () => {
    const onOpenInsights = vi.fn();
    renderHomePage({ onOpenInsights });

    const insightsCard = screen.getByRole("button", { name: /Performance Insights/i });
    expect(insightsCard).toBeTruthy();
    expect(screen.getByText("Track your progress")).toBeTruthy();
    expect(screen.getByText("Analytics & Streak")).toBeTruthy();

    fireEvent.click(insightsCard);
    expect(onOpenInsights).toHaveBeenCalledTimes(1);
  });

  test("preloads respective route experiences on card pointer enter or focus", () => {
    renderHomePage({ mockModeEnabled: true });

    const practiceCard = screen.getByRole("button", { name: /^Practice/i });
    fireEvent.pointerEnter(practiceCard);
    expect(preloadPracticeStartExperienceMock).toHaveBeenCalledTimes(1);

    const filterCard = screen.getByRole("button", { name: /Filter Questions/i });
    fireEvent.focus(filterCard);
    expect(preloadExploreRouteMock).toHaveBeenCalledTimes(1);

    const mockCard = screen.getByRole("button", { name: /Mock Test/i });
    fireEvent.pointerEnter(mockCard);
    expect(preloadMockExperienceMock).toHaveBeenCalledTimes(1);

    const insightsCard = screen.getByRole("button", { name: /Performance Insights/i });
    fireEvent.focus(insightsCard);
    expect(preloadInsightsRouteMock).toHaveBeenCalledTimes(1);
  });

  test("does not trigger preload on disabled Mock Test card", () => {
    renderHomePage({ mockModeEnabled: false });

    const mockCard = screen.getByRole("button", { name: /Mock Test/i });
    fireEvent.pointerEnter(mockCard);
    expect(preloadMockExperienceMock).not.toHaveBeenCalled();
  });

  test("applies 3D tilt styles on mouse move and resets on mouse leave", () => {
    renderHomePage();

    const practiceCard = screen.getByRole("button", { name: /^Practice/i });

    vi.spyOn(practiceCard, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.mouseMove(practiceCard, { clientX: 150, clientY: 75 });
    expect(practiceCard.style.getPropertyValue("--rx")).not.toBe("");
    expect(practiceCard.style.getPropertyValue("--ry")).not.toBe("");

    fireEvent.mouseLeave(practiceCard);
    expect(practiceCard.style.getPropertyValue("--rx")).toBe("0deg");
    expect(practiceCard.style.getPropertyValue("--ry")).toBe("0deg");
  });

  test("renders daily inspiration quote in Practice card and mobile banner", () => {
    const { container } = renderHomePage();

    // Practice card contains quote
    const quoteInCard = container.querySelector(".home-action-quote");
    expect(quoteInCard).toBeTruthy();

    // Mobile quote banner contains quote text
    const mobileQuoteBanner = container.querySelector(".home-quote-banner");
    expect(mobileQuoteBanner).toBeTruthy();
    expect(mobileQuoteBanner.getAttribute("aria-label")).toBe("Daily inspiration");
  });

  test("passes onResume handler to PageShell when hasResumeRoute is true", () => {
    const onResumePractice = vi.fn();
    renderHomePage({ hasResumeRoute: true, onResumePractice });

    const resumeBtn = screen.getByRole("button", { name: "Continue" });
    expect(resumeBtn).toBeTruthy();

    fireEvent.click(resumeBtn);
    expect(onResumePractice).toHaveBeenCalledTimes(1);
  });

  test("does not render resume button when hasResumeRoute is false", () => {
    renderHomePage({ hasResumeRoute: false });

    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
  });

  test("does not show answer coverage tracking on the home dashboard", () => {
    renderHomePage();

    expect(screen.queryByText(/verified answers/i)).toBeNull();
    expect(screen.queryByText(/still pending/i)).toBeNull();
  });

  test("refreshes activity data when progress-updated event is dispatched", () => {
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

    renderHomePage();

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

  test("refreshes activity on sync-complete, workspace-imported, storage, focus, and visibilitychange", () => {
    loadStudyActivityFastMock.mockClear();
    renderHomePage();

    expect(loadStudyActivityFastMock).toHaveBeenCalled();

    const callCountBefore = loadStudyActivityFastMock.mock.calls.length;

    // Trigger sync-complete
    fireEvent(window, new CustomEvent("gateqa:sync-complete"));
    expect(loadStudyActivityFastMock.mock.calls.length).toBe(callCountBefore + 1);

    // Trigger workspace-imported
    fireEvent(window, new CustomEvent("gateqa:workspace-imported"));
    expect(loadStudyActivityFastMock.mock.calls.length).toBe(callCountBefore + 2);

    // Trigger storage
    fireEvent(window, new Event("storage"));
    expect(loadStudyActivityFastMock.mock.calls.length).toBe(callCountBefore + 3);

    // Trigger focus
    fireEvent(window, new Event("focus"));
    expect(loadStudyActivityFastMock.mock.calls.length).toBe(callCountBefore + 4);

    // Trigger visibilitychange when visible
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    fireEvent(document, new Event("visibilitychange"));
    expect(loadStudyActivityFastMock.mock.calls.length).toBe(callCountBefore + 5);
  });
});
