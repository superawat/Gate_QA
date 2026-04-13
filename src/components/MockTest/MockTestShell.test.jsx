/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MockTestShell from "./MockTestShell";

let mockMockTestContext = null;
let mockFilterContext = null;

vi.mock("../../contexts/MockTestContext", () => ({
  useMockTest: () => mockMockTestContext,
}));

vi.mock("../../contexts/FilterContext", () => ({
  useFilterState: () => mockFilterContext,
}));

vi.mock("./MockTestQuestion", () => ({
  default: () => (
    <div
      className="mock-question-content font-sans"
      data-testid="mock-question-content"
    >
      Question Content
    </div>
  ),
}));

vi.mock("../Calculator/CalculatorWidget", () => ({
  default: () => null,
}));

describe("MockTestShell", () => {
  const renderInMockRoute = (ui, initialEntry = "/mock?stage=setup") => render(
    <MemoryRouter initialEntries={[initialEntry]}>
      {ui}
    </MemoryRouter>
  );

  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });

    const STATUS = {
      NOT_VISITED: "not_visited",
      NOT_ANSWERED: "not_answered",
      ANSWERED: "answered",
      MARKED_FOR_REVIEW: "review",
      ANSWERED_AND_MARKED_FOR_REVIEW: "review_answered",
    };

    const question = {
      question_uid: "go:111",
      title: "Sample",
      subject: "General Aptitude",
      subjectSlug: "ga",
      question: "<p>Question</p>",
      exam: { year: 2024, yearSetKey: "2024-s1" },
    };

    mockMockTestContext = {
      attemptError: "",
      attemptMeta: null,
      catalogError: "",
      catalogLoading: false,
      clearAttemptError: vi.fn(),
      currentSection: "GA",
      endMockTest: vi.fn(),
      questionMetaByUid: {
        "go:111": {
          questionUid: "go:111",
          section: "GA",
          type: "MCQ",
          marks: 1,
          negativeMarks: 0.3333333333,
          yearSetKey: "2024-s1",
          orderIndex: 1,
          scorable: true,
          paperReady: true,
        },
      },
      questionStates: { "go:111": STATUS.NOT_VISITED },
      questions: [question],
      paperCatalog: [
        { yearSetKey: "2024-s1", year: 2024, set: 1, label: "2024 Set 1", paperReady: true, gaCount: 10, csCount: 55, blockedQuestions: [], statusReason: "" },
      ],
      readyPapers: [
        { yearSetKey: "2024-s1", year: 2024, set: 1, label: "2024 Set 1", paperReady: true, gaCount: 10, csCount: 55 },
      ],
      resultSummary: {
        perQuestionResult: {},
        sectionSummary: {
          GA: { total: 1, attempted: 0, correct: 0, incorrect: 0, unanswered: 1, score: 0, maxScore: 1 },
          CS: { total: 0, attempted: 0, correct: 0, incorrect: 0, unanswered: 0, score: 0, maxScore: 0 },
        },
      },
      responses: {},
      saveAndNext: vi.fn(),
      markForReviewAndNext: vi.fn(),
      clearResponse: vi.fn(),
      goToPrevious: vi.fn(),
      goToNext: vi.fn(),
      submitTest: vi.fn(),
      startTest: vi.fn(() => true),
      sectionQuestionUids: { GA: ["go:111"], CS: [] },
      sectionQuestions: { GA: [question], CS: [] },
      setCurrentSection: vi.fn(),
      testActive: false,
      testSubmitted: false,
      timeLeft: 3600,
      STATUS,
    };

    mockFilterContext = {
      allQuestions: [question],
      structuredTags: {
        minYear: 2000,
        maxYear: 2025,
        subjects: [{ slug: "ga", label: "General Aptitude" }],
        structuredSubtopics: { ga: [] },
        yearSets: [{ key: "2024-s1", year: 2024, set: 1, label: "2024 Set 1" }],
      },
      isInitialized: true,
    };
  });

  test("shows loading state while the mock catalog is loading", () => {
    mockMockTestContext.catalogLoading = true;
    renderInMockRoute(<MockTestShell onExit={vi.fn()} />);
    expect(screen.getByRole("status", { name: /preparing validated mock catalog/i })).toBeTruthy();
    expect(screen.queryByText("Preparing validated mock catalog...")).toBeNull();
  });

  test("falls back to the portal for stale exam-stage URLs without an active attempt", () => {
    const onStageChange = vi.fn();
    renderInMockRoute(
      <MockTestShell onExit={vi.fn()} initialStage="exam" onStageChange={onStageChange} />,
      "/mock?stage=exam"
    );

    expect(screen.getByTestId("mock-portal-option-full_length")).toBeTruthy();
    expect(screen.queryByText("Could not start a valid mock attempt.")).toBeNull();
    expect(onStageChange).toHaveBeenCalledWith("setup");
  });

  test("simplifies the portal to the three supported start modes", () => {
    renderInMockRoute(<MockTestShell onExit={vi.fn()} />);

    expect(screen.getByTestId("mock-portal-option-full_length")).toBeTruthy();
    expect(screen.getByTestId("mock-portal-option-paper_mode")).toBeTruthy();
    expect(screen.getByTestId("mock-portal-option-custom")).toBeTruthy();
    expect(screen.queryByText("Mini mock 15Q")).toBeNull();
    expect(screen.queryByText("Mini mock 25Q")).toBeNull();
    expect(screen.queryByText("Random generated exam (GATE pattern)")).toBeNull();
  });

  test("header back exits immediately from setup without teardown or route re-sync", async () => {
    const onExit = vi.fn();
    const onStageChange = vi.fn();
    const { rerender } = renderInMockRoute(
      <MockTestShell onExit={onExit} onStageChange={onStageChange} />
    );

    expect(onStageChange).toHaveBeenCalledTimes(1);
    expect(onStageChange).toHaveBeenLastCalledWith("setup");
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Back Home" }));

    await waitFor(() => {
      expect(onExit).toHaveBeenCalledTimes(1);
    });
    expect(mockMockTestContext.endMockTest).not.toHaveBeenCalled();

    mockMockTestContext = {
      ...mockMockTestContext,
      questions: [],
      testActive: false,
      testSubmitted: false,
    };
    rerender(
      <MemoryRouter initialEntries={["/mock?stage=setup"]}>
        <MockTestShell onExit={onExit} onStageChange={onStageChange} />
      </MemoryRouter>
    );

    expect(onStageChange).toHaveBeenCalledTimes(1);
  });

  test("keeps custom setup focused on essential filters only", () => {
    renderInMockRoute(<MockTestShell onExit={vi.fn()} />);

    fireEvent.click(screen.getByTestId("mock-portal-option-custom"));
    fireEvent.click(screen.getByTestId("mock-portal-continue"));

    expect(screen.getByText("Question count")).toBeTruthy();
    expect(screen.getByText("Subjects")).toBeTruthy();
    expect(screen.getByText("Question types")).toBeTruthy();
    expect(screen.getByTestId("mock-setup-year-scope-all")).toBeTruthy();
    expect(screen.queryByText("Year Sets (optional)")).toBeNull();
    expect(screen.queryByText("Subtopics")).toBeNull();
    expect(screen.queryByText("Year Range Start")).toBeNull();
  });

  test("uses direct paper cards instead of year and set dropdowns", () => {
    renderInMockRoute(<MockTestShell onExit={vi.fn()} />);

    fireEvent.click(screen.getByTestId("mock-portal-option-paper_mode"));
    fireEvent.click(screen.getByTestId("mock-portal-continue"));

    expect(screen.getByTestId("mock-paper-option-2024-s1")).toBeTruthy();
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByText("Supported papers")).toBeNull();
  });

  test("shows near-ready blocked papers with the missing-answer reason", () => {
    mockMockTestContext.paperCatalog = [
      { yearSetKey: "2024-s1", year: 2024, set: 1, label: "2024 Set 1", paperReady: true, gaCount: 10, csCount: 55, blockedQuestions: [], statusReason: "" },
      {
        yearSetKey: "2019-s0",
        year: 2019,
        set: null,
        label: "2019",
        paperReady: false,
        gaCount: 10,
        csCount: 55,
        missingScorableCount: 1,
        statusReason: "Missing verified answers for 1 question.",
        blockedQuestions: [{ questionUid: "go:302794", section: "CS", orderIndex: 54 }],
      },
    ];

    renderInMockRoute(<MockTestShell onExit={vi.fn()} />);

    fireEvent.click(screen.getByTestId("mock-portal-option-paper_mode"));
    fireEvent.click(screen.getByTestId("mock-portal-continue"));

    expect(screen.getByTestId("mock-paper-option-2019-s0")).toBeTruthy();
    expect(screen.getByText("Missing verified answers for 1 question.")).toBeTruthy();
    expect(screen.getByText(/Missing: CS Q54/i)).toBeTruthy();

    fireEvent.click(screen.getByTestId("mock-paper-option-2019-s0"));

    expect(screen.getByRole("button", { name: /start mock/i }).disabled).toBe(true);
    expect(screen.getAllByText("Missing verified answers for 1 question.").length).toBeGreaterThan(0);
  });

  test("keeps font override scoped to question content while preserving shell chrome", async () => {
    mockMockTestContext.testActive = true;
    mockMockTestContext.attemptMeta = {
      kindId: "full_length",
      kindTitle: "Full-length generated mock",
      durationMinutes: 180,
      questionCount: 1,
    };

    const { container } = renderInMockRoute(
      <MockTestShell onExit={vi.fn()} initialStage="exam" />,
      "/mock?stage=exam"
    );
    await waitFor(() => {
      expect(screen.getByTestId("mock-question-content")).toBeTruthy();
      expect(container.querySelector(".mocktest-header-wrap")).toBeTruthy();
    });

    const questionContent = screen.getByTestId("mock-question-content");
    const header = container.querySelector(".mocktest-header-wrap");
    const palette = container.querySelector(".mocktest-palette-root");
    const footer = container.querySelector(".mocktest-action-bar");

    expect(questionContent.className).toContain("mock-question-content");
    expect(questionContent.className).toContain("font-sans");
    expect(header).toBeTruthy();
    expect(palette).toBeTruthy();
    expect(footer).toBeTruthy();
    expect(header.className).not.toContain("mock-question-content");
    expect(footer.className).not.toContain("mock-question-content");
  });
});
