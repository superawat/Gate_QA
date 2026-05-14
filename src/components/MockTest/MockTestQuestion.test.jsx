/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import MockTestQuestion from "./MockTestQuestion";

let mockContextValue = null;

vi.mock("../../contexts/MockTestContext", () => ({
  useMockTest: () => mockContextValue,
}));

vi.mock("../Math/MathRuntime", () => ({
  MathContent: ({ children, dynamic, className }) => (
    <div data-mathjax="true" data-dynamic={String(!!dynamic)} className={className}>
      {children}
    </div>
  ),
}));

const baseMcqQuestion = {
  question_uid: "go:111",
  title: "Sample",
  subject: "General Aptitude",
  question: "<p>Sample question stem</p>",
  options: ["First option", "Second option", "Third option", "Fourth option"],
  normalizedOptions: [
    { label: "A", text: "First option", html: "First option" },
    { label: "B", text: "Second option", html: "Second option" },
    { label: "C", text: "Third option", html: "Third option" },
    { label: "D", text: "Fourth option", html: "Fourth option" },
  ],
};

const baseMsqQuestion = {
  question_uid: "go:222",
  title: "MSQ Sample",
  subject: "Computer Science",
  question: "<p>MSQ question stem</p>",
  options: ["Option A", "Option B", "Option C", "Option D"],
  normalizedOptions: [
    { label: "A", text: "Option A", html: "Option A" },
    { label: "B", text: "Option B", html: "Option B" },
    { label: "C", text: "Option C", html: "Option C" },
    { label: "D", text: "Option D", html: "Option D" },
  ],
};

const baseNatQuestion = {
  question_uid: "go:333",
  title: "NAT Sample",
  subject: "Computer Science",
  question: "<p>NAT question stem</p>",
  options: [],
};

describe("MockTestQuestion", () => {
  beforeEach(() => {
    mockContextValue = {
      currentQuestion: { ...baseMcqQuestion },
      currentQuestionMeta: {
        questionUid: "go:111",
        section: "GA",
        type: "MCQ",
        marks: 1,
        negativeMarks: 0.3333333333,
      },
      currentQuestionResult: null,
      currentSection: "GA",
      currentSectionIndex: 0,
      sectionQuestionUids: { GA: ["go:111"], CS: [] },
      responses: { "go:111": "A" },
      saveResponse: vi.fn(),
    };
  });

  test("renders question metadata from currentQuestionMeta instead of raw question fields", () => {
    const { container } = render(<MockTestQuestion isReviewPhase={false} />);

    expect(screen.getByText("MCQ")).toBeTruthy();
    const metaRow = container.querySelector(".mocktest-meta-row");
    expect(metaRow.textContent).toContain("Marks for correct answer: 1");
    expect(metaRow.textContent).toContain("Negative Marks: 1/3");
  });

  test("renders NAT input and clears through Clear All", () => {
    mockContextValue.currentQuestion = { ...baseNatQuestion };
    mockContextValue.currentQuestionMeta = {
      questionUid: "go:333",
      section: "CS",
      type: "NAT",
      marks: 2,
      negativeMarks: 0,
    };
    mockContextValue.currentSection = "CS";
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:333"] };
    mockContextValue.responses = {};

    render(<MockTestQuestion isReviewPhase={false} />);

    const input = screen.getByTestId("mock-nat-input");
    fireEvent.change(input, { target: { value: "42.5" } });
    expect(mockContextValue.saveResponse).toHaveBeenCalledWith("go:333", "42.5");

    fireEvent.click(screen.getByRole("button", { name: "Clear All" }));
    expect(mockContextValue.saveResponse).toHaveBeenCalledWith("go:333", "");
  });

  test("renders MSQ with checkboxes and option text", () => {
    mockContextValue.currentQuestion = { ...baseMsqQuestion };
    mockContextValue.currentQuestionMeta = {
      questionUid: "go:222",
      section: "CS",
      type: "MSQ",
      marks: 2,
      negativeMarks: 0,
    };
    mockContextValue.currentSection = "CS";
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:222"] };
    mockContextValue.responses = { "go:222": ["B"] };

    render(<MockTestQuestion isReviewPhase={false} />);

    expect(screen.getByText(/Option B/)).toBeTruthy();
    expect(screen.getByText(/B\./)).toBeTruthy();

    const selectorB = screen.getByTestId("mock-option-selector-B");
    expect(selectorB.querySelector('input[type="checkbox"]')).toBeTruthy();
  });

  test("review mode shows verdict, expected NAT answer, and score delta from currentQuestionResult", () => {
    mockContextValue.currentQuestion = { ...baseNatQuestion };
    mockContextValue.currentQuestionMeta = {
      questionUid: "go:333",
      section: "CS",
      type: "NAT",
      marks: 2,
      negativeMarks: 0,
    };
    mockContextValue.currentQuestionResult = {
      questionUid: "go:333",
      status: "correct",
      scoreDelta: 2,
      response: "42",
      timeSpentSeconds: 181,
      timeExceededThreshold: true,
      answerRecord: {
        type: "NAT",
        answer: "42",
        tolerance: { abs: 0.01 },
      },
    };
    mockContextValue.currentSection = "CS";
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:333"] };
    mockContextValue.responses = { "go:333": "42" };

    render(<MockTestQuestion isReviewPhase />);

    expect(screen.getByText("Correct")).toBeTruthy();
    expect(screen.getByText(/Expected answer: 42 \(\+\/- 0.01\)/)).toBeTruthy();
    expect(screen.getByText("Score change: +2")).toBeTruthy();
    expect(screen.getByText("Time spent: 3m 01s (over 3 min)")).toBeTruthy();
  });

  test("review mode highlights correct and incorrect MCQ options from result data", () => {
    mockContextValue.currentQuestionResult = {
      questionUid: "go:111",
      status: "incorrect",
      scoreDelta: -0.3333333333,
      response: "A",
      answerRecord: {
        type: "MCQ",
        answer: "B",
      },
    };

    render(<MockTestQuestion isReviewPhase />);

    expect(screen.getByText("Incorrect")).toBeTruthy();
    expect(screen.getByText("Score change: -0.3333333333")).toBeTruthy();
    expect(screen.getByTestId("mock-option-selector-B").className).toContain("border-[#1e8f3f]");
    expect(screen.getByTestId("mock-option-selector-A").className).toContain("border-[#cc5d5d]");
  });
});
