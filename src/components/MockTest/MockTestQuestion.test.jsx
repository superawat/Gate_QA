/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import MockTestQuestion from "./MockTestQuestion";
import { AnswerService } from "../../services/AnswerService";

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
  type: "mcq",
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
  type: "MSQ",
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
  type: "NAT",
  options: [],
};

describe("MockTestQuestion", () => {
  beforeEach(() => {
    AnswerService.answersByQuestionUid = {};
    AnswerService.answersByUid = {};
    AnswerService.answersByExamUid = {};
    AnswerService.unsupportedQuestionUids = new Set();
    mockContextValue = {
      currentQuestion: { ...baseMcqQuestion },
      currentSection: "GA",
      currentSectionIndex: 0,
      sectionQuestionUids: { GA: ["go:111"], CS: [] },
      responses: { "go:111": "A" },
      saveResponse: vi.fn(),
      setCurrentSection: vi.fn(),
    };
  });

  test("renders mock-question-content wrapper with font-sans class for JSON content", () => {
    render(<MockTestQuestion isReviewPhase={false} />);

    const contentWrapper = screen.getByTestId("mock-question-content");
    expect(contentWrapper).toBeTruthy();
    expect(contentWrapper.className).toContain("mock-question-content");
    expect(contentWrapper.className).toContain("font-sans");
    expect(contentWrapper.textContent).toContain("Sample question stem");
  });

  test("keeps non-question chrome outside mock-question-content wrapper", () => {
    const { container } = render(<MockTestQuestion isReviewPhase={false} />);

    const metaRow = container.querySelector(".mocktest-meta-row");
    const questionNumberRow = container.querySelector(".mocktest-question-number-row");
    expect(metaRow).toBeTruthy();
    expect(questionNumberRow).toBeTruthy();
    expect(metaRow.className).not.toContain("mock-question-content");
    expect(questionNumberRow.className).not.toContain("mock-question-content");
    expect(metaRow.className).not.toContain("font-sans");
    expect(questionNumberRow.className).not.toContain("font-sans");
  });

  // ── Issue 001: Question type label ──────────────────────────────────
  test("renders Question Type: MCQ for MCQ questions", () => {
    render(<MockTestQuestion isReviewPhase={false} />);
    expect(screen.getByText("MCQ")).toBeTruthy();
    expect(screen.getByText(/Question Type:/)).toBeTruthy();
  });

  test("renders Question Type: MSQ for MSQ questions", () => {
    mockContextValue.currentQuestion = { ...baseMsqQuestion };
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:222"] };
    mockContextValue.currentSection = "CS";
    mockContextValue.responses = {};
    render(<MockTestQuestion isReviewPhase={false} />);
    expect(screen.getByText("MSQ")).toBeTruthy();
  });

  test("renders Question Type: NAT for NAT questions", () => {
    mockContextValue.currentQuestion = { ...baseNatQuestion };
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:333"] };
    mockContextValue.currentSection = "CS";
    mockContextValue.responses = {};
    render(<MockTestQuestion isReviewPhase={false} />);
    expect(screen.getByText("NAT")).toBeTruthy();
  });

  // ── Issue 002: NAT input field ──────────────────────────────────────
  test("NAT question renders a numeric input field", () => {
    mockContextValue.currentQuestion = { ...baseNatQuestion };
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:333"] };
    mockContextValue.currentSection = "CS";
    mockContextValue.responses = {};
    const { container } = render(<MockTestQuestion isReviewPhase={false} />);
    const input = container.querySelector('input[type="number"]');
    expect(input).toBeTruthy();
    expect(input.getAttribute("inputMode")).toBe("decimal");
    expect(input.getAttribute("placeholder")).toBe("Enter answer");
  });

  test("NAT input updates state via saveResponse", () => {
    mockContextValue.currentQuestion = { ...baseNatQuestion };
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:333"] };
    mockContextValue.currentSection = "CS";
    mockContextValue.responses = {};
    const { container } = render(<MockTestQuestion isReviewPhase={false} />);
    const input = container.querySelector('input[type="number"]');
    fireEvent.change(input, { target: { value: "42.5" } });
    expect(mockContextValue.saveResponse).toHaveBeenCalledWith("go:333", "42.5");
  });

  test("NAT question does NOT show 'options unavailable' warning", () => {
    mockContextValue.currentQuestion = { ...baseNatQuestion };
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:333"] };
    mockContextValue.currentSection = "CS";
    mockContextValue.responses = {};
    render(<MockTestQuestion isReviewPhase={false} />);
    expect(screen.queryByText(/options unavailable/i)).toBeNull();
  });

  // ── BUG-MOCK-OPTION-DUPLICATE-001: Selector shows letter + option text ──
  test("MCQ option selector shows letter label and option text", () => {
    render(<MockTestQuestion isReviewPhase={false} />);

    const selectorA = screen.getByTestId("mock-option-selector-A");
    expect(selectorA).toBeTruthy();
    // The selector now shows "A." label AND the option text
    expect(selectorA.textContent).toContain("A.");
    expect(selectorA.textContent).toContain("First option");
  });

  test("MSQ option selector shows letter label and option text", () => {
    mockContextValue.currentQuestion = { ...baseMsqQuestion };
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:222"] };
    mockContextValue.currentSection = "CS";
    mockContextValue.responses = {};
    render(<MockTestQuestion isReviewPhase={false} />);

    const selectorB = screen.getByTestId("mock-option-selector-B");
    expect(selectorB).toBeTruthy();
    expect(selectorB.textContent).toContain("B.");
    expect(selectorB.textContent).toContain("Option B");
  });

  // ── MSQ uses checkboxes, MCQ uses radios ────────────────────────────
  test("MCQ renders radio inputs in selectors", () => {
    render(<MockTestQuestion isReviewPhase={false} />);

    const selectorA = screen.getByTestId("mock-option-selector-A");
    const radio = selectorA.querySelector('input[type="radio"]');
    expect(radio).toBeTruthy();
    expect(selectorA.querySelector('input[type="checkbox"]')).toBeNull();
  });

  test("MSQ renders checkbox inputs in selectors", () => {
    mockContextValue.currentQuestion = { ...baseMsqQuestion };
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:222"] };
    mockContextValue.currentSection = "CS";
    mockContextValue.responses = {};
    render(<MockTestQuestion isReviewPhase={false} />);

    const selectorA = screen.getByTestId("mock-option-selector-A");
    const checkbox = selectorA.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
    expect(selectorA.querySelector('input[type="radio"]')).toBeNull();
  });

  // ── NAT unaffected ──────────────────────────────────────────────────
  test("NAT question renders no radio or checkbox inputs", () => {
    mockContextValue.currentQuestion = { ...baseNatQuestion };
    mockContextValue.sectionQuestionUids = { GA: [], CS: ["go:333"] };
    mockContextValue.currentSection = "CS";
    mockContextValue.responses = {};
    const { container } = render(<MockTestQuestion isReviewPhase={false} />);

    expect(container.querySelector('input[type="radio"]')).toBeNull();
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    expect(screen.getByTestId("mock-nat-input")).toBeTruthy();
  });

  // ── Selection controls A-D all present ──────────────────────────────
  test("renders all four option selectors A through D", () => {
    render(<MockTestQuestion isReviewPhase={false} />);

    expect(screen.getByTestId("mock-option-selector-A")).toBeTruthy();
    expect(screen.getByTestId("mock-option-selector-B")).toBeTruthy();
    expect(screen.getByTestId("mock-option-selector-C")).toBeTruthy();
    expect(screen.getByTestId("mock-option-selector-D")).toBeTruthy();
  });

  // ── Review state ────────────────────────────────────────────────────
  test("highlights correct option selector in review phase", () => {
    AnswerService.answersByQuestionUid = {
      "go:111": {
        answer_uid: "v1:test",
        type: "MCQ",
        answer: "B",
      },
    };

    render(<MockTestQuestion isReviewPhase />);

    const correctSelector = screen.getByTestId("mock-option-selector-B");
    const incorrectSelector = screen.getByTestId("mock-option-selector-A");

    expect(correctSelector.className).toContain("border-[#1e8f3f]");
    expect(incorrectSelector.className).toContain("border-[#cc5d5d]");
    expect(screen.queryByText("No mapped answer record.")).toBeNull();
  });

  test("shows clear missing-answer status when AnswerService mapping is absent", () => {
    render(<MockTestQuestion isReviewPhase />);
    expect(screen.getByText("No mapped answer record.")).toBeTruthy();
  });

  test("keeps negative marks emphasis styled in red in meta row", () => {
    render(<MockTestQuestion isReviewPhase={false} />);
    const negativeMarksNode = screen.getByText("1/3");
    expect(negativeMarksNode.className).toContain("text-[#c4302b]");
    expect(negativeMarksNode.className).toContain("mocktest-negative-marks");
  });

  // ── BUG-013: MathJax rendering in mock test ─────────────────────────
  test("renders MathJax wrapper with dynamic prop on mount for question stem and options", () => {
    const { container } = render(<MockTestQuestion isReviewPhase={false} />);

    // All MathJax wrappers should have data-dynamic="true"
    const mathJaxWrappers = container.querySelectorAll('[data-mathjax="true"]');
    expect(mathJaxWrappers.length).toBeGreaterThanOrEqual(1);

    // Every MathJax wrapper should have the dynamic prop set
    mathJaxWrappers.forEach((wrapper) => {
      expect(wrapper.getAttribute("data-dynamic")).toBe("true");
    });

    // Question stem should be rendered inside a MathJax wrapper
    const stemMathJax = container.querySelector(".mocktest-question-stem [data-mathjax]");
    expect(stemMathJax).toBeTruthy();
    expect(stemMathJax.textContent).toContain("Sample question stem");

    // Option text should be rendered inside MathJax wrappers
    const optionMathJax = container.querySelectorAll(".mock-option-text[data-mathjax]");
    expect(optionMathJax.length).toBe(4);
    expect(optionMathJax[0].textContent).toContain("First option");
  });

  test("re-renders MathJax with new key when question uid changes", () => {
    const { container, rerender } = render(<MockTestQuestion isReviewPhase={false} />);

    // First render — stem MathJax contains "Sample question stem"
    let stemMathJax = container.querySelector(".mocktest-question-stem [data-mathjax]");
    expect(stemMathJax).toBeTruthy();
    expect(stemMathJax.textContent).toContain("Sample question stem");

    // Change question uid (simulates navigation to a different question)
    mockContextValue = {
      ...mockContextValue,
      currentQuestion: {
        ...baseMsqQuestion,
        question_uid: "go:444",
        question: "<p>New \\(\\log n\\) question</p>",
      },
      currentSection: "CS",
      sectionQuestionUids: { GA: [], CS: ["go:444"] },
      responses: {},
    };

    rerender(<MockTestQuestion isReviewPhase={false} />);

    // After rerender — stem MathJax should show the new question content
    stemMathJax = container.querySelector(".mocktest-question-stem [data-mathjax]");
    expect(stemMathJax).toBeTruthy();
    expect(stemMathJax.textContent).toContain("New");
    expect(stemMathJax.textContent).toContain("log n");
    // Old content should not be present
    expect(stemMathJax.textContent).not.toContain("Sample question stem");
  });
});
