/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import AnswerPanel from "./AnswerPanel";
import { AnswerService } from "../../services/AnswerService";

const mockFilterActions = {
  toggleSolved: vi.fn(),
  toggleBookmark: vi.fn(),
  isQuestionSolved: vi.fn(() => false),
  isQuestionBookmarked: vi.fn(() => false),
  getQuestionProgressId: vi.fn((q) => q.question_uid || "test-id"),
};

const mockFilterState = {
  progressStorageKeys: { progress: "test_progress" },
  aptitudeProgressStorageKeys: { progress: "test_apt_progress" },
  daProgressStorageKeys: { progress: "test_da_progress" },
};

const mockSession = {
  goBack: vi.fn(),
  canGoBack: false,
};

vi.mock("../../contexts/FilterContext", () => ({
  useFilterActions: () => mockFilterActions,
  useFilterState: () => mockFilterState,
}));

vi.mock("../../contexts/SessionContext", () => ({
  useSession: () => mockSession,
}));

vi.mock("../../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("../../utils/practiceProgress", () => ({
  recordPracticeAttempt: vi.fn(),
}));

vi.mock("../../utils/syncQueue", () => ({
  enqueueChange: vi.fn(),
}));

describe("AnswerPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AnswerService.answersByQuestionUid = {};
    AnswerService.answersByExamUid = {};
    AnswerService.answersByUid = {};
    AnswerService.unsupportedQuestionUids = new Set();
  });

  test("renders standard NAT input field for go:1767 and not TRUE/FALSE buttons", () => {
    const question1767 = {
      question_uid: "go:1767",
      exam_uid: "cse:2014:set1:main:q9",
      title: "GATE CSE 2014 Set 1 | Question: 9",
      tags: [
        "gatecse-2014-set1",
        "co-and-architecture",
        "machine-instruction",
        "instruction-format",
        "numerical-answers",
        "normal",
      ],
      answer_meta: {
        type: "NAT",
        answer: 16383,
        tolerance: { abs: 0.01 },
      },
    };

    AnswerService.answersByQuestionUid["go:1767"] = {
      answer_uid: "manual:go:1767",
      type: "NAT",
      answer: 16383,
      tolerance: { abs: 0.01 },
    };

    render(<AnswerPanel question={question1767} />);

    // Should display NAT badge
    expect(screen.getByText("NAT")).toBeTruthy();

    // Should NOT display TRUE or FALSE buttons
    expect(screen.queryByRole("button", { name: "TRUE" })).toBeNull();
    expect(screen.queryByRole("button", { name: "FALSE" })).toBeNull();

    // Should display numeric input field
    const input = screen.getByPlaceholderText("Enter numeric answer");
    expect(input).toBeTruthy();

    // Type expected answer 16383 and submit
    fireEvent.change(input, { target: { value: "16383" } });
    const submitBtn = screen.getAllByRole("button", { name: "Submit Answer" })[0];
    fireEvent.click(submitBtn);

    // Should evaluate as Correct!
    expect(screen.getByRole("alert").textContent).toBe("Correct!");
    expect(mockFilterActions.toggleSolved).toHaveBeenCalled();
  });

  test("evaluates incorrect answer for NAT question 1767", () => {
    const question1767 = {
      question_uid: "go:1767",
      exam_uid: "cse:2014:set1:main:q9",
      title: "GATE CSE 2014 Set 1 | Question: 9",
      tags: ["numerical-answers"],
      answer_meta: {
        type: "NAT",
        answer: 16383,
        tolerance: { abs: 0.01 },
      },
    };

    AnswerService.answersByQuestionUid["go:1767"] = {
      answer_uid: "manual:go:1767",
      type: "NAT",
      answer: 16383,
      tolerance: { abs: 0.01 },
    };

    render(<AnswerPanel question={question1767} />);

    const input = screen.getByPlaceholderText("Enter numeric answer");
    fireEvent.change(input, { target: { value: "8191" } });

    const submitBtn = screen.getAllByRole("button", { name: "Submit Answer" })[0];
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert").textContent).toBe("Incorrect");
  });

  test("defensive check: NAT question with non-binary answer and true-false tag still renders numeric input", () => {
    const questionWithBadTag = {
      question_uid: "go:1767",
      exam_uid: "cse:2014:set1:main:q9",
      title: "GATE CSE 2014 Set 1 | Question: 9",
      tags: ["numerical-answers", "true-false"],
      answer_meta: {
        type: "NAT",
        answer: 16383,
        tolerance: { abs: 0.01 },
      },
    };

    AnswerService.answersByQuestionUid["go:1767"] = {
      answer_uid: "manual:go:1767",
      type: "NAT",
      answer: 16383,
      tolerance: { abs: 0.01 },
    };

    render(<AnswerPanel question={questionWithBadTag} />);

    // Should NOT display TRUE or FALSE buttons because answer is 16383 (not 0 or 1)
    expect(screen.queryByRole("button", { name: "TRUE" })).toBeNull();
    expect(screen.queryByRole("button", { name: "FALSE" })).toBeNull();

    // Should display numeric input field
    expect(screen.getByPlaceholderText("Enter numeric answer")).toBeTruthy();
  });

  test("renders TRUE/FALSE buttons for legitimate legacy true-false NAT question", () => {
    const legacyTfQuestion = {
      question_uid: "go:80572",
      title: "GATE CSE 1987 | Question: 2a",
      tags: ["gate1987", "true-false"],
      answer_meta: {
        type: "NAT",
        answer: 1,
        tolerance: { abs: 0.01 },
      },
    };

    AnswerService.answersByQuestionUid["go:80572"] = {
      answer_uid: "manual:go:80572",
      type: "NAT",
      answer: 1,
      tolerance: { abs: 0.01 },
    };

    render(<AnswerPanel question={legacyTfQuestion} />);

    expect(screen.getByRole("button", { name: "TRUE" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "FALSE" })).toBeTruthy();
    expect(screen.queryByPlaceholderText("Enter numeric answer")).toBeNull();

    // Click TRUE button and submit
    fireEvent.click(screen.getByRole("button", { name: "TRUE" }));
    const submitBtn = screen.getAllByRole("button", { name: "Submit Answer" })[0];
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert").textContent).toBe("Correct!");
  });

  test("modern NAT question with numeric answer 0 renders numeric input and not True/False buttons", () => {
    const modernNatZero = {
      question_uid: "go:1760",
      exam_uid: "cse:2014:set1:main:q5",
      title: "GATE CSE 2014 Set 1 | Question: 5",
      year: "gatecse-2014-set1",
      tags: ["gatecse-2014-set1", "numerical-answers"],
      answer_meta: {
        type: "NAT",
        answer: 0,
        tolerance: { abs: 0.01 },
      },
    };

    AnswerService.answersByQuestionUid["go:1760"] = {
      answer_uid: "manual:go:1760",
      type: "NAT",
      answer: 0,
      tolerance: { abs: 0.01 },
    };

    render(<AnswerPanel question={modernNatZero} />);

    expect(screen.queryByRole("button", { name: "TRUE" })).toBeNull();
    expect(screen.queryByRole("button", { name: "FALSE" })).toBeNull();
    const input = screen.getByPlaceholderText("Enter numeric answer");
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { value: "0" } });
    const submitBtn = screen.getAllByRole("button", { name: "Submit Answer" })[0];
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert").textContent).toBe("Correct!");
  });

  test("modern NAT question with numeric answer 1 renders numeric input and not True/False buttons", () => {
    const modernNatOne = {
      question_uid: "go:1757",
      exam_uid: "cse:2014:set1:main:q4",
      title: "GATE CSE 2014 Set 1 | Question: 4",
      year: "gatecse-2014-set1",
      tags: ["gatecse-2014-set1", "numerical-answers"],
      answer_meta: {
        type: "NAT",
        answer: 1,
        tolerance: { abs: 0.01 },
      },
    };

    AnswerService.answersByQuestionUid["go:1757"] = {
      answer_uid: "manual:go:1757",
      type: "NAT",
      answer: 1,
      tolerance: { abs: 0.01 },
    };

    render(<AnswerPanel question={modernNatOne} />);

    expect(screen.queryByRole("button", { name: "TRUE" })).toBeNull();
    expect(screen.queryByRole("button", { name: "FALSE" })).toBeNull();
    const input = screen.getByPlaceholderText("Enter numeric answer");
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { value: "1" } });
    const submitBtn = screen.getAllByRole("button", { name: "Submit Answer" })[0];
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert").textContent).toBe("Correct!");
  });
});
