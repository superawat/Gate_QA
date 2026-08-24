/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  ensureQuestionDetail: vi.fn(),
  ensureDaQuestionDetail: vi.fn(),
  writeLastSession: vi.fn(),
  startRandomSession: vi.fn(),
  startOrderedSession: vi.fn(),
  setCurrentQuestionUid: vi.fn(),
  dismissExhaustionBanner: vi.fn(),
  goToNextQuestion: vi.fn(),
  goToPreviousQuestion: vi.fn(),
  getNavigationState: vi.fn(),
}));

let filterState;
let filterActions;
let sessionState;

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../components/Question/Question", () => ({
  default: ({ question, onNextQuestion, onPreviousQuestion, canGoNext, canGoPrevious }) => (
    <div>
      <div>Question view: {question.title}</div>
      <button type="button" onClick={onPreviousQuestion} disabled={!canGoPrevious}>
        Previous in session
      </button>
      <button type="button" onClick={onNextQuestion} disabled={!canGoNext}>
        Next in session
      </button>
    </div>
  ),
}));

vi.mock("../components/Loaders/LoadingState", () => ({
  default: ({ label }) => <div>{label}</div>,
}));

vi.mock("../components/Calculator/CalculatorWidget", () => ({
  default: () => <div>Calculator widget</div>,
}));

vi.mock("../components/Calculator/CalculatorButton", () => ({
  default: React.forwardRef(function MockCalculatorButton(props, ref) {
    return (
      <button ref={ref} type="button" onClick={props.onClick}>
        Calculator
      </button>
    );
  }),
}));

vi.mock("../components/Math/MathRuntime", () => ({
  MathRuntimeProvider: ({ children }) => <>{children}</>,
}));

vi.mock("../contexts/FilterContext", () => ({
  useFilterState: () => filterState,
  useFilterActions: () => filterActions,
}));

vi.mock("../contexts/SessionContext", () => ({
  useSession: () => sessionState,
}));

vi.mock("../services/QuestionService", () => ({
  QuestionService: {
    ensureQuestionDetail: mocks.ensureQuestionDetail,
    getSubjectLabelBySlug: vi.fn((slug) => {
      if (slug === "algorithms") return "Algorithms";
      if (slug === "operating-systems") return "Operating Systems";
      return "Unknown";
    }),
  },
}));

vi.mock("../services/AptitudeQuestionService", () => ({
  AptitudeQuestionService: {
    ensureQuestionDetail: mocks.ensureQuestionDetail,
  },
}));

vi.mock("../services/DaQuestionService", () => ({
  DaQuestionService: {
    ensureQuestionDetail: mocks.ensureDaQuestionDetail,
    getAnswerForQuestion: vi.fn((question) => ({
      type: question?.type || "MCQ",
      answer: "A",
    })),
  },
}));

vi.mock("../utils/lastSession", () => ({
  writeLastSession: mocks.writeLastSession,
}));

import SolvePage from "./SolvePage";

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  );
};

const buildQuestion = (question_uid, overrides = {}) => ({
  question_uid,
  title: `Question ${question_uid}`,
  question: "<p>Question body</p>",
  yearSetLabel: "2025 Set 1",
  subjectSlug: "algorithms",
  type: "mcq",
  exam: { label: "2025 Set 1", yearSetKey: "2025-s1", year: 2025 },
  ...overrides,
});

const renderSolvePage = ({
  route = "/practice/question/go%3A1?subjects=algorithms&page=2",
  loading = false,
  error = "",
  filteredQuestions = [buildQuestion("go:1"), buildQuestion("go:2")],
  indexedQuestion = buildQuestion("go:1"),
  sessionOverrides = {},
  loadQuestions = vi.fn(),
} = {}) => {
  filterState = {
    filteredQuestions,
    isInitialized: true,
  };

  filterActions = {
    getQuestionById: vi.fn((uid) => {
      if (!indexedQuestion) return null;
      return uid === indexedQuestion.question_uid ? indexedQuestion : null;
    }),
    isQuestionSolved: vi.fn(() => false),
    isQuestionBookmarked: vi.fn(() => false),
  };

  sessionState = {
    sessionMode: "ordered",
    sessionQueue: filteredQuestions.map((question) => question.question_uid),
    showExhaustionBanner: false,
    dismissExhaustionBanner: mocks.dismissExhaustionBanner,
    startRandomSession: mocks.startRandomSession,
    startOrderedSession: mocks.startOrderedSession,
    setCurrentQuestionUid: mocks.setCurrentQuestionUid,
    getNavigationState: mocks.getNavigationState,
    goToNextQuestion: mocks.goToNextQuestion,
    goToPreviousQuestion: mocks.goToPreviousQuestion,
    ...sessionOverrides,
  };

  return {
    loadQuestions,
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <LocationProbe />
        <Routes>
          <Route
            path="/practice/question/:questionUid"
            element={(
              <SolvePage
                loading={loading}
                error={error}
                loadQuestions={loadQuestions}
                hasResumeRoute={false}
                onResumePractice={vi.fn()}
              />
            )}
          />
          <Route path="/practice" element={<div>Explore route placeholder</div>} />
        </Routes>
      </MemoryRouter>
    ),
  };
};

describe("SolvePage", () => {
  beforeEach(() => {
    mocks.ensureQuestionDetail.mockReset();
    mocks.ensureDaQuestionDetail.mockReset();
    mocks.writeLastSession.mockReset();
    mocks.startRandomSession.mockReset();
    mocks.startOrderedSession.mockReset();
    mocks.setCurrentQuestionUid.mockReset();
    mocks.dismissExhaustionBanner.mockReset();
    mocks.goToNextQuestion.mockReset();
    mocks.goToPreviousQuestion.mockReset();
    mocks.getNavigationState.mockReset();
    mocks.getNavigationState.mockReturnValue({
      mode: "ordered",
      index: 0,
      total: 2,
      canGoPrevious: false,
      canGoNext: true,
    });
    window.scrollTo = vi.fn();
  });

  test("shows the loading state before solve data is initialized", async () => {
    filterState = {
      filteredQuestions: [],
      isInitialized: false,
    };
    filterActions = {
      getQuestionById: vi.fn(() => null),
      isQuestionSolved: vi.fn(() => false),
      isQuestionBookmarked: vi.fn(() => false),
    };
    sessionState = {
      sessionMode: "",
      sessionQueue: [],
      showExhaustionBanner: false,
      dismissExhaustionBanner: mocks.dismissExhaustionBanner,
      startOrderedSession: mocks.startOrderedSession,
      setCurrentQuestionUid: mocks.setCurrentQuestionUid,
      getNavigationState: mocks.getNavigationState,
      goToNextQuestion: mocks.goToNextQuestion,
      goToPreviousQuestion: mocks.goToPreviousQuestion,
    };

    render(
      <MemoryRouter initialEntries={["/practice/question/go%3A1"]}>
        <Routes>
          <Route
            path="/practice/question/:questionUid"
            element={(
              <SolvePage
                loading
                error=""
                loadQuestions={vi.fn()}
                hasResumeRoute={false}
                onResumePractice={vi.fn()}
              />
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Loading Solve page...")).toBeTruthy();
  });

  test("shows a not-found message when the question uid is missing from the index", async () => {
    renderSolvePage({ indexedQuestion: null, filteredQuestions: [] });

    expect(await screen.findByText("Question not found.")).toBeTruthy();
  });

  test("renders the resolved indexed question without requesting detail again", async () => {
    renderSolvePage();

    expect(await screen.findByText("Question view: Question go:1")).toBeTruthy();
    expect(mocks.ensureQuestionDetail).not.toHaveBeenCalled();
  });

  test("uses answer metadata for the question type chip when raw type is unknown", async () => {
    renderSolvePage({
      indexedQuestion: buildQuestion("go:1", {
        type: "unknown",
        answer_meta: { type: "MSQ", answer: ["A", "C"] },
      }),
    });

    expect(await screen.findByText("Question view: Question go:1")).toBeTruthy();
    expect(screen.getByText("MSQ")).toBeTruthy();
    expect(screen.queryByText("UNKNOWN")).toBeNull();
  });

  test("hides the question type chip when the type cannot be resolved", async () => {
    renderSolvePage({
      indexedQuestion: buildQuestion("go:1", {
        type: "unknown",
        answer_meta: undefined,
      }),
    });

    expect(await screen.findByText("Question view: Question go:1")).toBeTruthy();
    expect(screen.queryByText("UNKNOWN")).toBeNull();
  });

  test("hydrates question detail when the indexed question is missing HTML", async () => {
    mocks.ensureQuestionDetail.mockResolvedValueOnce(buildQuestion("go:1", {
      title: "Hydrated detail",
      question: "<p>Loaded detail</p>",
    }));

    renderSolvePage({
      indexedQuestion: buildQuestion("go:1", {
        title: "Stub row",
        question: "",
      }),
    });

    expect(await screen.findByText("Question view: Hydrated detail")).toBeTruthy();
    expect(mocks.ensureQuestionDetail).toHaveBeenCalledTimes(1);
  });

  test("hydrates DA detail through DaQuestionService", async () => {
    mocks.ensureDaQuestionDetail.mockResolvedValueOnce(buildQuestion("da:2026:set1:main:q1", {
      title: "Hydrated DA detail",
      question: "<p>Loaded DA detail</p>",
      tags: ["gateda-2026", "general-aptitude", "mcq"],
    }));

    renderSolvePage({
      route: "/practice/question/da%3A2026%3Aset1%3Amain%3Aq1",
      filteredQuestions: [buildQuestion("da:2026:set1:main:q1", { question: "", tags: ["gateda-2026"] })],
      indexedQuestion: buildQuestion("da:2026:set1:main:q1", { question: "", tags: ["gateda-2026"] }),
    });

    expect(await screen.findByText("Question view: Hydrated DA detail")).toBeTruthy();
    expect(mocks.ensureDaQuestionDetail).toHaveBeenCalledTimes(1);
    expect(mocks.ensureQuestionDetail).not.toHaveBeenCalled();
  });

  test("keeps a CSE question on the CSE loader and hides the DA badge despite a stale DA tag", async () => {
    const cseQuestion = buildQuestion("go:523089", {
      title: "GATE CSE 2026 | Set 1 | GA | Question: 1",
      question: "",
      tags: ["gatecse-2026-set1", "gateda-2026"],
      exam: { paper: "CSE", year: 2026, set: 1, yearSetKey: "2026-s1" },
    });
    mocks.ensureQuestionDetail.mockResolvedValueOnce({
      ...cseQuestion,
      question: "<p>Loaded CSE detail</p>",
    });

    renderSolvePage({
      route: "/practice/question/go%3A523089",
      filteredQuestions: [cseQuestion],
      indexedQuestion: cseQuestion,
    });

    expect(await screen.findByText(/Question view: GATE CSE 2026/)).toBeTruthy();
    expect(mocks.ensureQuestionDetail).toHaveBeenCalledTimes(1);
    expect(mocks.ensureDaQuestionDetail).not.toHaveBeenCalled();
    expect(screen.queryByText("GATE DA")).toBeNull();
  });

  test("shows a retry state when detail hydration fails and retries successfully", async () => {
    mocks.ensureQuestionDetail
      .mockRejectedValueOnce(new Error("Unable to load question detail."))
      .mockResolvedValueOnce(buildQuestion("go:1", {
        title: "Recovered detail",
        question: "<p>Recovered</p>",
      }));

    renderSolvePage({
      indexedQuestion: buildQuestion("go:1", {
        title: "Stub row",
        question: "",
      }),
    });

    expect(await screen.findByText("Unable to load question detail.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /retry question/i }));

    expect(await screen.findByText("Question view: Recovered detail")).toBeTruthy();
    expect(mocks.ensureQuestionDetail).toHaveBeenCalledTimes(2);
  });

  test("back to results preserves the current practice query string", async () => {
    renderSolvePage();

    fireEvent.click(await screen.findByRole("button", { name: /back to results/i }));

    await waitFor(() => {
      expect(screen.getByTestId("location-probe").textContent).toBe("/practice?subjects=algorithms&page=2");
    });
  });

  test("next question navigation uses the session helper and preserves search params", async () => {
    mocks.goToNextQuestion.mockReturnValueOnce({ question_uid: "go:2" });
    mocks.getNavigationState.mockReturnValue({
      index: 0,
      total: 2,
      canGoPrevious: false,
      canGoNext: true,
    });

    renderSolvePage();

    fireEvent.click(await screen.findByRole("button", { name: /next in session/i }));

    await waitFor(() => {
      expect(screen.getByTestId("location-probe").textContent).toBe("/practice/question/go%3A2?subjects=algorithms&page=2");
    });
  });

  test("right arrow moves to the next question when session navigation allows it", async () => {
    mocks.goToNextQuestion.mockReturnValueOnce({ question_uid: "go:2" });
    mocks.getNavigationState.mockReturnValue({
      index: 0,
      total: 2,
      canGoPrevious: false,
      canGoNext: true,
    });

    renderSolvePage();

    await screen.findByText("Question view: Question go:1");
    fireEvent.keyDown(window, { key: "ArrowRight" });

    await waitFor(() => {
      expect(screen.getByTestId("location-probe").textContent).toBe("/practice/question/go%3A2?subjects=algorithms&page=2");
    });
  });

  test("previous question navigation uses the session helper and preserves search params", async () => {
    mocks.goToPreviousQuestion.mockReturnValueOnce({ question_uid: "go:0" });
    mocks.getNavigationState.mockReturnValue({
      index: 1,
      total: 2,
      canGoPrevious: true,
      canGoNext: false,
    });

    renderSolvePage({
      route: "/practice/question/go%3A1?subjects=algorithms",
      sessionOverrides: {
        getNavigationState: mocks.getNavigationState,
      },
    });

    fireEvent.click(await screen.findByRole("button", { name: /previous in session/i }));

    await waitFor(() => {
      expect(screen.getByTestId("location-probe").textContent).toBe("/practice/question/go%3A0?subjects=algorithms");
    });
  });

  test("left arrow moves to the previous question when session navigation allows it", async () => {
    mocks.goToPreviousQuestion.mockReturnValueOnce({ question_uid: "go:0" });
    mocks.getNavigationState.mockReturnValue({
      index: 1,
      total: 2,
      canGoPrevious: true,
      canGoNext: false,
    });

    renderSolvePage({
      route: "/practice/question/go%3A1?subjects=algorithms",
      sessionOverrides: {
        getNavigationState: mocks.getNavigationState,
      },
    });

    await screen.findByText("Question view: Question go:1");
    fireEvent.keyDown(window, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(screen.getByTestId("location-probe").textContent).toBe("/practice/question/go%3A0?subjects=algorithms");
    });
  });

  test("dismisses the random-session exhaustion banner", async () => {
    renderSolvePage({
      sessionOverrides: {
        showExhaustionBanner: true,
      },
    });

    fireEvent.click(await screen.findByRole("button", { name: /dismiss/i }));

    expect(mocks.dismissExhaustionBanner).toHaveBeenCalledTimes(1);
  });

  test("displays CURRENT FILTERED QUEUE and Question X of Y when entering through filtered explore context", async () => {
    mocks.getNavigationState.mockReturnValue({
      mode: "ordered",
      index: 0,
      total: 58,
      canGoPrevious: false,
      canGoNext: true,
    });

    renderSolvePage({
      route: "/practice/question/go%3A1?subjects=algorithms",
    });

    expect(await screen.findByText("Current filtered queue")).toBeTruthy();
    expect(screen.getByText("Question 1 of 58")).toBeTruthy();
  });

  test("displays RANDOM SESSION and Question details when opening a direct question link without explore context", async () => {
    mocks.getNavigationState.mockReturnValue({
      mode: "random",
      index: 0,
      total: 1,
      canGoPrevious: false,
      canGoNext: false,
    });

    renderSolvePage({
      route: "/practice/question/go%3A1",
      sessionOverrides: {
        sessionMode: "random",
      },
    });

    expect(await screen.findByText("Random session")).toBeTruthy();
    expect(screen.getByText("Question details")).toBeTruthy();
  });

  test("initializes random session on explore route cold-load when shuffle is enabled", async () => {
    window.localStorage.setItem("gateqa_practice_shuffle_v1", "true");
    renderSolvePage({
      route: "/practice/question/go%3A1?subjects=algorithms",
      sessionOverrides: {
        sessionMode: null,
        sessionQueue: [],
        sourceQuestionUids: [],
      },
    });

    expect(mocks.startRandomSession).toHaveBeenCalledWith(
      [expect.objectContaining({ question_uid: "go:1" }), expect.objectContaining({ question_uid: "go:2" })],
      "go:1"
    );
  });

  test("initializes ordered session on explore route cold-load when shuffle is disabled", async () => {
    window.localStorage.setItem("gateqa_practice_shuffle_v1", "false");
    renderSolvePage({
      route: "/practice/question/go%3A1?subjects=algorithms",
      sessionOverrides: {
        sessionMode: null,
        sessionQueue: [],
        sourceQuestionUids: [],
      },
    });

    expect(mocks.startOrderedSession).toHaveBeenCalledWith(
      [expect.objectContaining({ question_uid: "go:1" }), expect.objectContaining({ question_uid: "go:2" })],
      "go:1"
    );
  });

  test("preserves active random session when arriving from Explore with matching pool", async () => {
    renderSolvePage({
      route: "/practice/question/go%3A1?subjects=algorithms",
      sessionOverrides: {
        sessionMode: "random",
        sessionQueue: ["go:2", "go:1"],
        sourceQuestionUids: ["go:1", "go:2"],
      },
    });

    expect(mocks.setCurrentQuestionUid).toHaveBeenCalledWith("go:1");
    expect(mocks.startOrderedSession).not.toHaveBeenCalled();
    expect(mocks.startRandomSession).not.toHaveBeenCalled();
  });
});
