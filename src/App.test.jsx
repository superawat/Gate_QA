/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearFilters: vi.fn(),
  startRandomSession: vi.fn(() => ({ question_uid: "go:random" })),
  questionInit: vi.fn(() => Promise.resolve()),
  answerInit: vi.fn(() => Promise.resolve()),
  manifestInit: vi.fn(() => Promise.resolve({
    questionCount: 3271,
    latestYear: 2026,
    yearSets: [{ key: "2026-s1" }, { key: "2026-s2" }],
  })),
  trackEvent: vi.fn(),
  mockTestModeEnabled: false,
}));

const stableFilterState = { allQuestions: [] };
const stableFilterActions = { clearFilters: mocks.clearFilters };
const stableSession = { startRandomSession: mocks.startRandomSession };

vi.mock("./pages/HomePage", () => ({
  default: ({
    questionBankManifest,
    manifestLoading,
    onOpenMockHistory,
    onOpenInsights,
    onResumePractice,
    onStartRandomPractice,
    onStartMockTest,
  }) => (
    <div>
      <div data-testid="home-manifest-state">
        {manifestLoading ? "loading" : String(questionBankManifest?.questionCount || 0)}
      </div>
      <button type="button" onClick={onResumePractice}>Resume</button>
      <button type="button" onClick={onStartRandomPractice}>Random</button>
      <button type="button" onClick={onStartMockTest}>Mock</button>
      <button type="button" onClick={onOpenMockHistory}>History</button>
      <button type="button" onClick={onOpenInsights}>Insights</button>
    </div>
  ),
}));

vi.mock("./pages/ExplorePage", () => ({
  default: () => <div>Explore page</div>,
}));

vi.mock("./pages/InsightsPage", () => ({
  default: ({ questionBankManifest }) => (
    <div>Insights page {String(questionBankManifest?.questionCount || 0)}</div>
  ),
}));

vi.mock("./pages/HighPriorityTopicsPage", () => ({
  default: () => <div>High priority topics page</div>,
}));

vi.mock("./pages/SolvePage", () => ({
  default: () => <div>Solve page</div>,
}));

vi.mock("./pages/UserManualPage", () => ({
  default: () => <div>User manual page</div>,
}));

vi.mock("./shells/MockShell", () => ({
  default: () => <div>Mock shell</div>,
}));

vi.mock("./contexts/FilterContext", () => ({
  FilterProvider: ({ children }) => children,
  useFilterState: () => stableFilterState,
  useFilterActions: () => stableFilterActions,
}));

vi.mock("./contexts/SessionContext", () => ({
  SessionProvider: ({ children }) => children,
  useSession: () => stableSession,
}));

vi.mock("./utils/analytics", () => ({
  pageview: vi.fn(),
  trackEvent: mocks.trackEvent,
}));

vi.mock("./constants/featureFlags", () => ({
  get MOCK_TEST_MODE_ENABLED() {
    return mocks.mockTestModeEnabled;
  },
}));

vi.mock("./services/QuestionService", () => ({
  QuestionService: {
    init: mocks.questionInit,
    loaded: false,
    loadMode: "none",
    questions: [{ question_uid: "go:1" }, { question_uid: "go:random" }],
  },
}));

vi.mock("./services/AnswerService", () => ({
  AnswerService: {
    init: mocks.answerInit,
    loaded: false,
  },
}));

vi.mock("./services/QuestionBankManifestService", () => ({
  QuestionBankManifestService: {
    init: mocks.manifestInit,
    loaded: false,
    manifest: null,
    loadError: "",
  },
}));

import App from "./App";

describe("App routes", () => {
  beforeEach(() => {
    mocks.clearFilters.mockReset();
    mocks.startRandomSession.mockReset();
    mocks.startRandomSession.mockReturnValue({ question_uid: "go:random" });
    mocks.questionInit.mockClear();
    mocks.answerInit.mockClear();
    mocks.manifestInit.mockClear();
    mocks.trackEvent.mockReset();
    mocks.mockTestModeEnabled = false;
    window.localStorage.clear();
    window.scrollTo = vi.fn();
    window.history.replaceState({}, "", "/Gate_QA/");
  });

  test("loads only the manifest on the Home route", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mocks.manifestInit).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("home-manifest-state").textContent).toContain("3271");
    });

    expect(mocks.questionInit).not.toHaveBeenCalled();
    expect(mocks.answerInit).not.toHaveBeenCalled();
  });

  test("initializes questions on the Explore route", async () => {
    window.history.replaceState({}, "", "/Gate_QA/practice");

    render(<App />);

    await waitFor(() => {
      expect(mocks.questionInit).toHaveBeenCalledTimes(1);
      expect(mocks.answerInit).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Explore page")).toBeTruthy();
  });

  test("redirects legacy search URLs to /practice", async () => {
    window.history.replaceState({}, "", "/Gate_QA/?search=deadlock");

    render(<App />);

    await waitFor(() => {
      expect(mocks.questionInit).toHaveBeenCalledTimes(1);
      expect(window.location.pathname).toBe("/Gate_QA/practice");
    });

    expect(window.location.search).toContain("search=deadlock");
    expect(await screen.findByText("Explore page")).toBeTruthy();
  });

  test("redirects legacy question links to /practice/question/:uid", async () => {
    window.history.replaceState({}, "", "/Gate_QA/?question=go%3A1");

    render(<App />);

    await waitFor(() => {
      expect(mocks.questionInit).toHaveBeenCalledTimes(1);
      expect(window.location.pathname).toBe("/Gate_QA/practice/question/go%3A1");
    });

    expect(await screen.findByText("Solve page")).toBeTruthy();
  });

  test("resume button navigates to the stored last session route", async () => {
    window.localStorage.setItem("gateqa_last_session_v1", JSON.stringify({
      route: "/practice/question/go:stored?subjects=algorithms&page=2",
    }));

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /resume/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/Gate_QA/practice/question/go:stored");
    });

    expect(window.location.search).toContain("subjects=algorithms");
  });

  test("legacy random mode clears filters and opens the first random question", async () => {
    window.history.replaceState({}, "", "/Gate_QA/?mode=random");

    render(<App />);

    await waitFor(() => {
      expect(mocks.questionInit).toHaveBeenCalled();
      expect(mocks.clearFilters).toHaveBeenCalledTimes(1);
      expect(mocks.startRandomSession).toHaveBeenCalledTimes(1);
      expect(window.location.pathname).toBe("/Gate_QA/practice/question/go%3Arandom");
    });
  });

  test("home mock button opens the mock route when the feature flag is enabled", async () => {
    mocks.mockTestModeEnabled = true;

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /mock/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/Gate_QA/mock");
      expect(window.location.search).toBe("?stage=setup");
    });

    expect(await screen.findByText("Mock shell")).toBeTruthy();
  });

  test("home history button opens the mock history tab in insights when the feature flag is enabled", async () => {
    mocks.mockTestModeEnabled = true;

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /history/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/Gate_QA/insights");
      expect(window.location.search).toBe("?tab=mock-history");
    });

    expect(await screen.findByText("Insights page 3271")).toBeTruthy();
  });

  test("home insights button opens the insights page", async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /insights/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/Gate_QA/insights");
    });

    expect(await screen.findByText("Insights page 3271")).toBeTruthy();
  });

  test("manual route renders without initializing question data", async () => {
    window.history.replaceState({}, "", "/Gate_QA/manual");

    render(<App />);

    expect(await screen.findByText("User manual page")).toBeTruthy();

    expect(mocks.questionInit).not.toHaveBeenCalled();
    expect(mocks.answerInit).not.toHaveBeenCalled();
  });

  test("high-priority topics route renders without initializing question data", async () => {
    window.history.replaceState({}, "", "/Gate_QA/insights/topics");

    render(<App />);

    expect(await screen.findByText("High priority topics page")).toBeTruthy();

    expect(mocks.questionInit).not.toHaveBeenCalled();
    expect(mocks.answerInit).not.toHaveBeenCalled();
  });
});
