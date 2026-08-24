/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import AnswerPanel from "./AnswerPanel";
import { AnswerService } from "../../services/AnswerService";
import { recordPracticeAttempt } from "../../utils/practiceProgress";

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
  PRACTICE_PROGRESS_STORAGE_KEY: "gateqa_progress_v1",
  APTITUDE_PROGRESS_STORAGE_KEY: "gateqa_apt_progress_v1",
  DA_PROGRESS_STORAGE_KEY: "gateqa_da_progress_v1",
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
    expect(recordPracticeAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        storageKey: "go:1767",
        correct: true,
        progressStorageKey: "gateqa_progress_v1",
      })
    );
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

  test("renders Ask AI button in AnswerPanel controls", () => {
    const sampleQuestion = {
      question_uid: "go:100",
      exam_uid: "cse:2020:main:q1",
      title: "GATE CSE 2020 | Question: 1",
      question: "Sample problem",
      answer_meta: { type: "MCQ", answer: "A" },
    };

    render(<AnswerPanel question={sampleQuestion} />);

    expect(screen.getAllByRole("button", { name: /Ask AI/i }).length).toBeGreaterThan(0);
  });

  describe("Solution button behavior", () => {
    test("Special Aptitude question without solution renders disabled button without GateOverflow link", () => {
      const specialAptQuestion = {
        question_uid: "APT-ENG-5840",
        title: "English Practice",
        subject: "English",
        subtopic: "Cloze Test",
        exam: { paper: "Aptitude" },
        _source: {
          sourceKind: "aptitude-web",
          sourceProvider: "AptitudeBank",
          pageUrl: "https://aptitude-bank.internal/play#paper-f2d72e1ee0a6815c",
        },
        answer_meta: { type: "MCQ", answer: "B", source: "aptitude_embedded" },
      };

      render(<AnswerPanel question={specialAptQuestion} />);

      // Must NOT render any active link to GateOverflow
      expect(screen.queryAllByRole("link", { name: /Solution/i })).toHaveLength(0);

      // Must render disabled Solution buttons (desktop + mobile) with 'Solution unavailable' label
      const disabledButtons = screen.getAllByRole("button", { name: /Solution unavailable/i });
      expect(disabledButtons.length).toBeGreaterThan(0);
      disabledButtons.forEach((btn) => {
        expect(btn.getAttribute("disabled")).toBeDefined();
      });
    });

    test("Special Aptitude question with valid external solution link renders active link", () => {
      const specialAptWithSolution = {
        question_uid: "APT-QNT-3498",
        title: "Quant Practice",
        subject: "Quant",
        solution_link: "https://example.com/solutions/qnt-3498",
        exam: { paper: "Aptitude" },
        _source: {
          sourceKind: "aptitude-web",
          sourceProvider: "AptitudeBank",
        },
        answer_meta: { type: "MCQ", answer: "A", source: "aptitude_embedded" },
      };

      render(<AnswerPanel question={specialAptWithSolution} />);

      const solutionLinks = screen.getAllByRole("link", { name: /Solution/i });
      expect(solutionLinks.length).toBeGreaterThan(0);
      solutionLinks.forEach((link) => {
        expect(link.getAttribute("href")).toBe("https://example.com/solutions/qnt-3498");
        expect(link.getAttribute("target")).toBe("_blank");
      });
    });

    test("regular GATE General Aptitude question with GateOverflow link renders active GateOverflow link", () => {
      const regularGateGaQuestion = {
        question_uid: "go:523089",
        title: "GATE CSE 2026 | Set 1 | GA | Question: 1",
        subjectLabel: "General Aptitude",
        subjectSlug: "ga",
        track: "cse",
        exam: { paper: "CSE", year: 2026 },
        link: "https://gateoverflow.in/523089/gate-cse-2026-set-1-ga-question-1",
        answer_meta: { type: "MCQ", answer: "C" },
      };

      render(<AnswerPanel question={regularGateGaQuestion} />);

      const solutionLinks = screen.getAllByRole("link", { name: /Solution/i });
      expect(solutionLinks.length).toBeGreaterThan(0);
      solutionLinks.forEach((link) => {
        expect(link.getAttribute("href")).toBe(
          "https://gateoverflow.in/523089/gate-cse-2026-set-1-ga-question-1"
        );
      });
    });

    test("regular GATE question without direct link falls back to GateOverflow search", () => {
      const regularGateNoLink = {
        question_uid: "go:99999",
        title: "GATE CSE 2023 | Question: 45",
        exam: { paper: "CSE", year: 2023 },
        answer_meta: { type: "MCQ", answer: "D" },
      };

      render(<AnswerPanel question={regularGateNoLink} />);

      const solutionLinks = screen.getAllByRole("link", { name: /Solution/i });
      expect(solutionLinks.length).toBeGreaterThan(0);
      solutionLinks.forEach((link) => {
        expect(link.getAttribute("href")).toBe(
          "https://gateoverflow.in/?qa=search&q=" + encodeURIComponent("GATE CSE 2023 | Question: 45")
        );
      });
    });
  });
});

