/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
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

describe("MockTestShell font scope guardrails", () => {
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
      exam: { year: 2025, yearSetKey: "2025-1" },
    };

    mockMockTestContext = {
      testActive: true,
      startTest: vi.fn(),
      testSubmitted: false,
      timeLeft: 3600,
      questions: [question],
      endMockTest: vi.fn(),
      attemptMeta: { kindId: "full_length" },
      attemptError: "",
      clearAttemptError: vi.fn(),
      currentSection: "GA",
      setCurrentSection: vi.fn(),
      sectionQuestionUids: { GA: ["go:111"], CS: [] },
      sectionQuestions: { GA: [question], CS: [] },
      currentSectionIndex: 0,
      goToQuestion: vi.fn(),
      questionStates: { "go:111": STATUS.NOT_VISITED },
      STATUS,
      saveAndNext: vi.fn(),
      markForReviewAndNext: vi.fn(),
      clearResponse: vi.fn(),
      goToPrevious: vi.fn(),
      goToNext: vi.fn(),
      submitTest: vi.fn(),
    };

    mockFilterContext = {
      allQuestions: [question],
      structuredTags: {
        minYear: 2000,
        maxYear: 2025,
        subjects: [],
        structuredSubtopics: {},
        yearSets: [],
      },
      isInitialized: true,
    };
  });

  test("does not render exam header in portal/setup filtering stage", () => {
    mockMockTestContext.testActive = false;
    mockMockTestContext.questions = [];
    mockMockTestContext.attemptMeta = null;

    const { container } = render(<MockTestShell onExit={vi.fn()} />);

    const root = container.querySelector(".mocktest-root");
    expect(root).toBeTruthy();
    expect(container.querySelector(".mocktest-header-wrap")).toBeNull();
    expect(screen.getByText("Mock Test Portal")).toBeTruthy();
  });

  test("keeps font override scoped to question content while preserving shell chrome", () => {
    const { container } = render(<MockTestShell onExit={vi.fn()} initialStage="exam" />);

    const root = container.querySelector(".mocktest-root");
    expect(root).toBeTruthy();
    expect(root.className).toContain("mocktest-root");

    const questionContent = screen.getByTestId("mock-question-content");
    expect(questionContent).toBeTruthy();
    expect(questionContent.className).toContain("mock-question-content");
    expect(questionContent.className).toContain("font-sans");

    const header = container.querySelector(".mocktest-header-wrap");
    const palette = container.querySelector(".mocktest-palette-root");
    const footer = container.querySelector(".mocktest-action-bar");

    expect(header).toBeTruthy();
    expect(palette).toBeTruthy();
    expect(footer).toBeTruthy();

    [header, palette, footer].forEach((element) => {
      expect(element.className).not.toContain("mock-question-content");
      expect(element.className).not.toContain("font-sans");
      expect(element.querySelector(".mock-question-content")).toBeNull();
    });
  });
});
