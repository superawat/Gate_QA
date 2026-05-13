/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { MockTestProvider } from "../../contexts/MockTestContext";
import { MockCatalogService } from "../../services/MockCatalogService";
import { AnswerService } from "../../services/AnswerService";
import MockTestShell from "./MockTestShell";

let mockAllQuestions = [];
const mockMarkQuestionsSolved = vi.fn();

vi.mock("../../contexts/FilterContext", () => ({
  useFilterState: () => ({
    allQuestions: mockAllQuestions,
    structuredTags: {
      minYear: 2024,
      maxYear: 2024,
      subjects: [{ slug: "os", label: "Operating System" }],
      structuredSubtopics: { os: [] },
      yearSets: [{ key: "2024-s1", year: 2024, set: 1, label: "2024 Set 1" }],
    },
    isInitialized: true,
  }),
  useFilterActions: () => ({
    markQuestionsSolved: mockMarkQuestionsSolved,
  }),
}));

vi.mock("../../services/AptitudeQuestionService", () => ({
  AptitudeQuestionService: {
    loaded: true,
    questions: [],
    loadError: "",
    init: vi.fn(async () => {}),
  },
}));

vi.mock("../Calculator/CalculatorWidget", () => ({
  default: () => null,
}));

vi.mock("../Math/MathRuntime", async () => {
  const actual = await vi.importActual("../Math/MathRuntime");
  return {
    ...actual,
    MathContent: ({ children, className }) => <div className={className}>{children}</div>,
  };
});

const buildQuestion = (question_uid, type, options = []) => ({
  question_uid,
  title: question_uid,
  subject: "Operating System",
  subjectSlug: "os",
  question: `<p>${question_uid}</p>`,
  normalizedOptions: options,
  exam: { year: 2024, yearSetKey: "2024-s1" },
});

const renderShell = (onExit = vi.fn(), initialStage = "setup") => render(
  <MemoryRouter>
    <MockTestProvider>
      <MockTestShell onExit={onExit} initialStage={initialStage} />
    </MockTestProvider>
  </MemoryRouter>
);

describe("MockTest smoke flow", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    mockMarkQuestionsSolved.mockReset();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });

    const mcqQuestion = buildQuestion("cs:1", "MCQ", [
      { label: "A", text: "Opt A", html: "Opt A" },
      { label: "B", text: "Opt B", html: "Opt B" },
      { label: "C", text: "Opt C", html: "Opt C" },
      { label: "D", text: "Opt D", html: "Opt D" },
    ]);
    const msqQuestion = buildQuestion("cs:2", "MSQ", [
      { label: "A", text: "Opt A", html: "Opt A" },
      { label: "B", text: "Opt B", html: "Opt B" },
      { label: "C", text: "Opt C", html: "Opt C" },
      { label: "D", text: "Opt D", html: "Opt D" },
    ]);
    const natQuestion = buildQuestion("cs:3", "NAT");
    mockAllQuestions = [mcqQuestion, msqQuestion, natQuestion];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "cs:1": { questionUid: "cs:1", section: "CS", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
        "cs:2": { questionUid: "cs:2", section: "CS", type: "MSQ", marks: 2, negativeMarks: 0, yearSetKey: "2024-s1", orderIndex: 2, scorable: true, paperReady: false },
        "cs:3": { questionUid: "cs:3", section: "CS", type: "NAT", marks: 2, negativeMarks: 0, yearSetKey: "2024-s1", orderIndex: 3, scorable: true, paperReady: false },
      },
      scorableQuestionUids: ["cs:1", "cs:2", "cs:3"],
    });
    MockCatalogService.loaded = true;

    AnswerService.answersByQuestionUid = {
      "cs:1": { type: "MCQ", answer: "B" },
      "cs:2": { type: "MSQ", answer: ["A", "C"] },
      "cs:3": { type: "NAT", answer: "42", tolerance: { abs: 0.1 } },
    };
    AnswerService.answersByUid = {};
    AnswerService.answersByExamUid = {};
    AnswerService.unsupportedQuestionUids = new Set();
  });

  afterEach(() => {
    cleanup();
    MockCatalogService.reset();
  });

  test("start, restore, submit, review, and exit a custom mock", async () => {
    const onExit = vi.fn();
    const firstRender = renderShell(onExit);

    const answerVisibleQuestion = () => {
      const questionText = screen.getByTestId("mock-question-content").textContent || "";
      if (questionText.includes("cs:1")) {
        fireEvent.click(screen.getByTestId("mock-option-selector-B"));
        return "cs:1";
      }
      if (questionText.includes("cs:2")) {
        fireEvent.click(screen.getByTestId("mock-option-selector-A"));
        fireEvent.click(screen.getByTestId("mock-option-selector-C"));
        return "cs:2";
      }
      if (questionText.includes("cs:3")) {
        fireEvent.change(screen.getByTestId("mock-nat-input"), { target: { value: "42" } });
        return "cs:3";
      }
      throw new Error(`Unexpected question content: ${questionText}`);
    };

    fireEvent.click(screen.getByTestId("mock-portal-option-custom"));
    fireEvent.click(screen.getByTestId("mock-portal-continue"));

    const countInput = screen
      .getAllByRole("spinbutton")
      .find((element) => element.getAttribute("max") === "65");
    fireEvent.change(countInput, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Start Mock" }));

    await waitFor(() => {
      expect(screen.getByText("Question No. 1")).toBeTruthy();
    });

    for (let index = 0; index < 3; index += 1) {
      const currentQuestionId = answerVisibleQuestion();

      if (index < 2) {
        fireEvent.click(screen.getByRole("button", { name: "Save & Next" }));
        await waitFor(() => {
          const nextQuestionText = screen.getByTestId("mock-question-content").textContent || "";
          expect(nextQuestionText).not.toContain(currentQuestionId);
        });
      }
    }

    firstRender.unmount();

    renderShell(onExit, "exam");

    await waitFor(() => {
      expect(screen.getByTestId("mock-question-content")).toBeTruthy();
      expect(screen.getByTestId("mock-submit-button")).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId("mock-submit-button"));
    fireEvent.click(screen.getAllByRole("button", { name: /^submit$/i }).at(-1));

    await waitFor(() => {
      expect(screen.getByText("Exam Submitted Successfully")).toBeTruthy();
      expect(screen.getAllByText("5 / 5").length).toBeGreaterThan(0);
    });

    expect(mockMarkQuestionsSolved).toHaveBeenCalledTimes(1);
    expect(mockMarkQuestionsSolved.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ question_uid: "cs:1" }),
        expect.objectContaining({ question_uid: "cs:2" }),
        expect.objectContaining({ question_uid: "cs:3" }),
      ])
    );
    expect(mockMarkQuestionsSolved.mock.calls[0][0]).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Review Questions" }));

    await waitFor(() => {
      expect(screen.getByText(/Expected answer:/)).toBeTruthy();
      expect(screen.getByText(/Score change:/)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Back to Summary" }));
    fireEvent.click(screen.getByRole("button", { name: "Return to Dashboard" }));

    expect(onExit).toHaveBeenCalledTimes(1);
  }, 15000);

  test("Save & Next moves from the last GA question to the first CS question", async () => {
    const gaQuestionOne = buildQuestion("ga:1", "MCQ", [
      { label: "A", text: "Opt A", html: "Opt A" },
      { label: "B", text: "Opt B", html: "Opt B" },
      { label: "C", text: "Opt C", html: "Opt C" },
      { label: "D", text: "Opt D", html: "Opt D" },
    ]);
    const gaQuestionTwo = buildQuestion("ga:2", "MCQ", [
      { label: "A", text: "Opt A", html: "Opt A" },
      { label: "B", text: "Opt B", html: "Opt B" },
      { label: "C", text: "Opt C", html: "Opt C" },
      { label: "D", text: "Opt D", html: "Opt D" },
    ]);
    const csQuestion = buildQuestion("cs:1", "MCQ", [
      { label: "A", text: "Opt A", html: "Opt A" },
      { label: "B", text: "Opt B", html: "Opt B" },
      { label: "C", text: "Opt C", html: "Opt C" },
      { label: "D", text: "Opt D", html: "Opt D" },
    ]);

    mockAllQuestions = [gaQuestionOne, gaQuestionTwo, csQuestion];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:1": { questionUid: "ga:1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
        "ga:2": { questionUid: "ga:2", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 2, scorable: true, paperReady: false },
        "cs:1": { questionUid: "cs:1", section: "CS", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 3, scorable: true, paperReady: false },
      },
      scorableQuestionUids: ["ga:1", "ga:2", "cs:1"],
    });
    MockCatalogService.loaded = true;

    renderShell();

    fireEvent.click(screen.getByTestId("mock-portal-option-custom"));
    fireEvent.click(screen.getByTestId("mock-portal-continue"));

    const countInput = screen
      .getAllByRole("spinbutton")
      .find((element) => element.getAttribute("max") === "65");
    fireEvent.change(countInput, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Start Mock" }));

    await waitFor(() => {
      expect(screen.getByText("Question No. 1")).toBeTruthy();
      expect(screen.getByTestId("mock-question-content").textContent).toMatch(/ga:/);
    });

    fireEvent.click(screen.getByRole("button", { name: "Save & Next" }));

    await waitFor(() => {
      expect(screen.getByText("Question No. 2")).toBeTruthy();
      expect(screen.getByTestId("mock-question-content").textContent).toMatch(/ga:/);
    });

    fireEvent.click(screen.getByRole("button", { name: "Save & Next" }));

    await waitFor(() => {
      expect(screen.getByText("Question No. 1")).toBeTruthy();
      expect(screen.getByTestId("mock-question-content").textContent).toContain("cs:1");
    });
  }, 15000);
});
