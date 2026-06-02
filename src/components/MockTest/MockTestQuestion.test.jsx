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

  test("strips embedded option lists from the mock question stem", () => {
    mockContextValue.currentQuestion = {
      ...baseMcqQuestion,
      question: `
        <p>Sample question stem</p>
        <ol style="list-style-type: upper-alpha;">
          <li>First option</li>
          <li>Second option</li>
          <li>Third option</li>
          <li>Fourth option</li>
        </ol>
      `,
    };

    const { container } = render(<MockTestQuestion isReviewPhase={false} />);

    const stem = container.querySelector(".mocktest-question-stem");
    expect(stem.textContent).toContain("Sample question stem");
    expect(stem.textContent).not.toContain("First option");
    expect(screen.getByText("First option")).toBeTruthy();
  });

  test("renders embedded visual option content when no separate options array exists", () => {
    mockContextValue.currentQuestion = {
      ...baseMcqQuestion,
      options: [],
      normalizedOptions: [
        { label: "A", text: "Diagram A", html: '<img src="/Gate_QA/question-images/a.webp" alt="Diagram A">' },
        { label: "B", text: "Diagram B", html: '<img src="/Gate_QA/question-images/b.webp" alt="Diagram B">' },
        { label: "C", text: "Diagram C", html: '<img src="/Gate_QA/question-images/c.webp" alt="Diagram C">' },
        { label: "D", text: "Diagram D", html: '<img src="/Gate_QA/question-images/d.webp" alt="Diagram D">' },
      ],
      question: `
        <p>Choose the matching diagram.</p>
        <ol style="list-style-type: upper-alpha;">
          <li><img src="/Gate_QA/question-images/a.webp" alt="Diagram A"></li>
          <li><img src="/Gate_QA/question-images/b.webp" alt="Diagram B"></li>
          <li><img src="/Gate_QA/question-images/c.webp" alt="Diagram C"></li>
          <li><img src="/Gate_QA/question-images/d.webp" alt="Diagram D"></li>
        </ol>
      `,
    };

    const { container } = render(<MockTestQuestion isReviewPhase={false} />);

    const stem = container.querySelector(".mocktest-question-stem");
    expect(stem.textContent).toContain("Choose the matching diagram.");
    expect(stem.querySelector("img")).toBeFalsy();

    const optionImages = container.querySelectorAll(".mock-option-text img");
    expect(optionImages.length).toBe(4);
    expect(optionImages[0].getAttribute("src")).toBe("/Gate_QA/question-images/a.webp");
  });

  test("normalizes paragraph-labeled options without duplicating them in the stem", () => {
    mockContextValue.currentQuestion = {
      ...baseMcqQuestion,
      options: [],
      normalizedOptions: [],
      question: `
        <p>Choose the largest floating-point number among the following options.</p>
        <p>A. Small value</p>
        <p>B. Largest value</p>
        <p>C. Not a number</p>
        <p>D. Tiny value</p>
      `,
    };

    const { container } = render(<MockTestQuestion isReviewPhase={false} />);

    const stem = container.querySelector(".mocktest-question-stem");
    expect(stem.textContent).toContain("Choose the largest floating-point number");
    expect(stem.textContent).not.toContain("Largest value");
    expect(screen.getByText("Largest value")).toBeTruthy();
    expect(screen.getByTestId("mock-option-selector-B")).toBeTruthy();
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

  test("renders legacy subjective prompts as auto-awarded in mock mode", () => {
    mockContextValue.currentQuestion = {
      question_uid: "go:legacy",
      title: "Legacy subjective sample",
      subject: "Computer Science",
      question: "<p>Design the required circuit.</p>",
      options: [],
    };
    mockContextValue.currentQuestionMeta = {
      questionUid: "go:legacy",
      section: "CS",
      type: "SUBJECTIVE",
      marks: 2,
      negativeMarks: 0,
      autoAwarded: true,
    };
    mockContextValue.currentSection = "CS";
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:legacy"] };
    mockContextValue.responses = {};

    render(<MockTestQuestion isReviewPhase={false} />);

    expect(screen.getByText("SUBJECTIVE")).toBeTruthy();
    expect(screen.getByText(/legacy subjective prompt is awarded automatically/i)).toBeTruthy();
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
