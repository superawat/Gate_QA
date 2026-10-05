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

    test("renders MTA explanation notice and badge for MTA question go:43485", () => {
      const mtaQuestion = {
        question_uid: "go:43485",
        exam_uid: "cse:2008:set1:main:q79",
        title: "GATE CSE 2008 | Question: 79",
        answer_meta: { type: "MTA", answer: "MTA" },
      };

      AnswerService.answersByQuestionUid["go:43485"] = {
        answer_uid: "v2:1.27.21",
        type: "MTA",
        answer: "MTA",
        tolerance: null,
      };

      render(<AnswerPanel question={mtaQuestion} />);

      expect(screen.getByText("MTA")).toBeTruthy();
      expect(
        screen.getByText(
          "MTA (Marks To All): Full marks are awarded to everyone for this question."
        )
      ).toBeTruthy();

      // Submit buttons should be disabled for non-interactive MTA
      const submitButtons = screen.getAllByRole("button", { name: /Submit/i });
      submitButtons.forEach((btn) => {
        expect(btn.hasAttribute("disabled")).toBe(true);
      });
    });

    test("renders MULTI_NAT input fields, validates completeness, and evaluates submission for go:546", () => {
      const multiNatQuestion = {
        question_uid: "go:546",
        exam_uid: "cse:1992:set1:main:q1-ii",
        title: "GATE CSE 1992 | Question: 01,ii",
        answer_meta: {
          type: "MULTI_NAT",
          answer: [3, 4],
          tolerance: { abs: 0 },
        },
      };

      AnswerService.answersByQuestionUid["go:546"] = {
        answer_uid: "manual:go:546",
        type: "MULTI_NAT",
        answer: [3, 4],
        tolerance: { abs: 0 },
      };

      const { unmount } = render(<AnswerPanel question={multiNatQuestion} />);

      // Badge check
      expect(screen.getByText("Multi-NAT")).toBeTruthy();

      // Separate numeric inputs for Blank 1 and Blank 2
      const blank1Input = screen.getByLabelText("Blank 1");
      const blank2Input = screen.getByLabelText("Blank 2");
      expect(blank1Input).toBeTruthy();
      expect(blank2Input).toBeTruthy();

      // Notice helper text indicating all blanks required
      expect(screen.getByText(/all 2 blanks required/i)).toBeTruthy();

      // Submit button is disabled when inputs are empty
      const submitButtons = screen.getAllByRole("button", { name: /Submit Answer/i });
      expect(submitButtons[0].hasAttribute("disabled")).toBe(true);

      // Fill only Blank 1 -> submit should remain disabled
      fireEvent.change(blank1Input, { target: { value: "3" } });
      expect(screen.getAllByRole("button", { name: /Submit Answer/i })[0].hasAttribute("disabled")).toBe(true);

      // Fill Blank 2 with non-numeric -> submit should remain disabled
      fireEvent.change(blank2Input, { target: { value: "abc" } });
      expect(screen.getAllByRole("button", { name: /Submit Answer/i })[0].hasAttribute("disabled")).toBe(true);

      // Fill Blank 2 with valid number "4" -> submit enabled
      fireEvent.change(blank2Input, { target: { value: "4" } });
      const submitBtn = screen.getAllByRole("button", { name: /Submit Answer/i })[0];
      expect(submitBtn.hasAttribute("disabled")).toBe(false);

      // Submit [3, 4] -> marked Correct!
      fireEvent.click(submitBtn);
      expect(screen.getByText("Correct!")).toBeTruthy();

      unmount();

      // Re-render and test incorrect order [4, 3]
      render(<AnswerPanel question={multiNatQuestion} />);
      const b1 = screen.getByLabelText("Blank 1");
      const b2 = screen.getByLabelText("Blank 2");
      fireEvent.change(b1, { target: { value: "4" } });
      fireEvent.change(b2, { target: { value: "3" } });
      const btn = screen.getAllByRole("button", { name: /Submit Answer/i })[0];
      fireEvent.click(btn);
      expect(screen.getByText("Incorrect")).toBeTruthy();
    });

    test("renders 3 numeric inputs dynamically for MULTI_NAT with 3 blanks", () => {
      const threeBlankQ = {
        question_uid: "test:3blanks",
        title: "Test Question with 3 blanks",
      };

      AnswerService.answersByQuestionUid["test:3blanks"] = {
        type: "MULTI_NAT",
        answer: [10, 20, 30],
      };

      render(<AnswerPanel question={threeBlankQ} />);
      expect(screen.getByLabelText("Blank 1")).toBeTruthy();
      expect(screen.getByLabelText("Blank 2")).toBeTruthy();
      expect(screen.getByLabelText("Blank 3")).toBeTruthy();
      expect(screen.getByText(/all 3 blanks required/i)).toBeTruthy();
    });

    test("renders exactly four vertically stacked inputs for go:749 (GATE CSE 2001 Q8), evaluates independently and handles partial inputs", () => {
      const go749Question = {
        question_uid: "go:749",
        exam_uid: "cse:2001:set1:main:q8",
        title: "GATE CSE 2001 | Question: 8",
        question: "<p>Consider a disk with...</p><ol start=\"1\" style=\"list-style-type:upper-alpha\"><li>What is the total capacity?</li><li>What is the data transfer rate?</li><li>What is the percentage CPU required?</li><li>What is the DMA percentage?</li></ol>",
        answer_meta: {
          type: "MULTI_NAT",
          answer: [320000, 800, 28.57, 8],
          labels: ["A", "B", "C", "D"],
          blank_labels: ["A", "B", "C", "D"],
          tolerance: [
            { abs: 0.01 },
            { abs: 0.01 },
            { lower: 28.5, upper: 28.6 },
            { abs: 0.01 },
          ],
        },
      };

      AnswerService.answersByQuestionUid["go:749"] = {
        answer_uid: "manual:go:749",
        type: "MULTI_NAT",
        answer: [320000, 800, 28.57, 8],
        labels: ["A", "B", "C", "D"],
        blank_labels: ["A", "B", "C", "D"],
        tolerance: [
          { abs: 0.01 },
          { abs: 0.01 },
          { lower: 28.5, upper: 28.6 },
          { abs: 0.01 },
        ],
      };

      const { unmount } = render(<AnswerPanel question={go749Question} />);

      // Badge check
      expect(screen.getByText("Multi-NAT")).toBeTruthy();

      // Exactly 4 numeric inputs labeled A, B, C, D
      const inputA = screen.getByLabelText("A");
      const inputB = screen.getByLabelText("B");
      const inputC = screen.getByLabelText("C");
      const inputD = screen.getByLabelText("D");
      expect(inputA).toBeTruthy();
      expect(inputB).toBeTruthy();
      expect(inputC).toBeTruthy();
      expect(inputD).toBeTruthy();

      // All 4 blanks required helper text
      expect(screen.getByText(/all 4 blanks required/i)).toBeTruthy();

      // Submit is disabled initially
      const submitBtn = screen.getAllByRole("button", { name: /Submit Answer/i })[0];
      expect(submitBtn.hasAttribute("disabled")).toBe(true);

      // Partial inputs: fill only A, B, C -> submit remains disabled
      fireEvent.change(inputA, { target: { value: "320000" } });
      fireEvent.change(inputB, { target: { value: "800" } });
      fireEvent.change(inputC, { target: { value: "28.57" } });
      expect(submitBtn.hasAttribute("disabled")).toBe(true);

      // Fill D with invalid text -> submit remains disabled
      fireEvent.change(inputD, { target: { value: "xyz" } });
      expect(submitBtn.hasAttribute("disabled")).toBe(true);

      // Fill D with wrong number 99 -> submit enabled
      fireEvent.change(inputD, { target: { value: "99" } });
      expect(submitBtn.hasAttribute("disabled")).toBe(false);

      // Submit partial/wrong response -> banner is Incorrect
      fireEvent.click(submitBtn);
      expect(screen.getByText("Incorrect")).toBeTruthy();

      // Verify answers A-D are evaluated independently:
      // Status for A, B, C is Correct, status for D is Incorrect
      expect(screen.getByTestId("multi-nat-status-0").textContent).toContain("Correct");
      expect(screen.getByTestId("multi-nat-status-1").textContent).toContain("Correct");
      expect(screen.getByTestId("multi-nat-status-2").textContent).toContain("Correct");
      expect(screen.getByTestId("multi-nat-status-3").textContent).toContain("Incorrect");

      // Now fix D to correct answer 8
      fireEvent.change(inputD, { target: { value: "8" } });
      const submitAgainBtn = screen.getAllByRole("button", { name: /Submit/i })[0];
      fireEvent.click(submitAgainBtn);

      // Now all 4 are correct -> banner is Correct!
      expect(screen.getByText("Correct!")).toBeTruthy();
      expect(screen.getByTestId("multi-nat-status-0").textContent).toContain("Correct");
      expect(screen.getByTestId("multi-nat-status-1").textContent).toContain("Correct");
      expect(screen.getByTestId("multi-nat-status-2").textContent).toContain("Correct");
      expect(screen.getByTestId("multi-nat-status-3").textContent).toContain("Correct");

      unmount();
    });

    test("renders exactly 2 numeric blanks for go:761 (GATE CSE 2001 Q20), evaluates independently in ms, and preserves normal NAT/MCQ questions", () => {
      const go761Question = {
        question_uid: "go:761",
        exam_uid: "cse:2001:set1:main:q20",
        title: "GATE CSE 2001 | Question: 20",
        question: "<p>Consider a disk with the $100$ tracks numbered from $0$ to $99$ rotating at $3000$ rpm...</p><ol start=\"1\" style=\"list-style-type:upper-alpha\"><li>Consider a set of disk requests... what is the total seek time?</li><li>Consider an initial set of 100 arbitrary disk requests... what is the worse case time?</li></ol>",
        answer_meta: {
          type: "MULTI_NAT",
          answer: [33.6, 1019.8],
          labels: ["A", "B"],
          blank_labels: ["A", "B"],
          tolerance: [
            { abs: 0.1 },
            { abs: 0.1 },
          ],
          units: ["ms", "ms"],
        },
      };

      AnswerService.answersByQuestionUid["go:761"] = {
        answer_uid: "manual:go:761",
        type: "MULTI_NAT",
        answer: [33.6, 1019.8],
        labels: ["A", "B"],
        blank_labels: ["A", "B"],
        tolerance: [
          { abs: 0.1 },
          { abs: 0.1 },
        ],
        units: ["ms", "ms"],
      };

      const { unmount } = render(<AnswerPanel question={go761Question} />);

      // Badge check
      expect(screen.getByText("Multi-NAT")).toBeTruthy();

      // Exactly 2 numeric inputs labeled A and B
      const inputA = screen.getByLabelText("A");
      const inputB = screen.getByLabelText("B");
      expect(inputA).toBeTruthy();
      expect(inputB).toBeTruthy();
      expect(screen.queryByLabelText("C")).toBeNull();

      // Millisecond unit indicators and placeholders
      expect(screen.getAllByText("(ms)").length).toBe(2);
      expect(screen.getByPlaceholderText("Enter numeric answer for A (in ms)")).toBeTruthy();
      expect(screen.getByPlaceholderText("Enter numeric answer for B (in ms)")).toBeTruthy();

      // All 2 blanks required helper text
      expect(screen.getByText(/all 2 blanks required/i)).toBeTruthy();

      // Submit is disabled initially
      const submitBtn = screen.getAllByRole("button", { name: /Submit Answer/i })[0];
      expect(submitBtn.hasAttribute("disabled")).toBe(true);

      // Partial inputs: fill only A -> submit remains disabled
      fireEvent.change(inputA, { target: { value: "33.6" } });
      expect(submitBtn.hasAttribute("disabled")).toBe(true);

      // Fill B with seconds value 1.0198 (wrong unit) -> submit enabled
      fireEvent.change(inputB, { target: { value: "1.0198" } });
      expect(submitBtn.hasAttribute("disabled")).toBe(false);

      // Submit -> banner is Incorrect
      fireEvent.click(submitBtn);
      expect(screen.getByText("Incorrect")).toBeTruthy();

      // Verify answers A and B are evaluated independently:
      // Status for A (33.6 ms) is Correct, status for B (1.0198 s) is Incorrect
      expect(screen.getByTestId("multi-nat-status-0").textContent).toContain("Correct");
      expect(screen.getByTestId("multi-nat-status-1").textContent).toContain("Incorrect");

      // Now fix B to correct answer 1019.8 ms
      fireEvent.change(inputB, { target: { value: "1019.8" } });
      const submitAgainBtn = screen.getAllByRole("button", { name: /Submit/i })[0];
      fireEvent.click(submitAgainBtn);

      // Now both A and B are correct -> banner is Correct!
      expect(screen.getByText("Correct!")).toBeTruthy();
      expect(screen.getByTestId("multi-nat-status-0").textContent).toContain("Correct");
      expect(screen.getByTestId("multi-nat-status-1").textContent).toContain("Correct");

      unmount();
    });

    test("preserves existing single-NAT layout for normal NAT questions", () => {
      const normalNatQuestion = {
        question_uid: "test:single-nat",
        exam_uid: "cse:2020:set1:main:q10",
        title: "GATE CSE 2020 | Question: 10",
      };

      AnswerService.answersByQuestionUid["test:single-nat"] = {
        type: "NAT",
        answer: 42,
        tolerance: { abs: 0 },
      };

      const { unmount } = render(<AnswerPanel question={normalNatQuestion} />);

      // Exactly one NAT input rendered
      const input = screen.getByPlaceholderText("Enter numeric answer");
      expect(input).toBeTruthy();
      expect(screen.queryByLabelText("Blank 1")).toBeNull();
      expect(screen.queryByLabelText("A")).toBeNull();
      unmount();
    });

    test("preserves existing MCQ layout for normal MCQ questions", () => {
      const normalMcqQuestion = {
        question_uid: "test:single-mcq",
        title: "Sample MCQ",
      };
      AnswerService.answersByQuestionUid["test:single-mcq"] = {
        type: "MCQ",
        answer: "B",
      };

      const { unmount } = render(<AnswerPanel question={normalMcqQuestion} />);
      expect(screen.getByText("MCQ")).toBeTruthy();
      expect(screen.getByRole("button", { name: "A" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "B" })).toBeTruthy();
      expect(screen.queryByPlaceholderText(/Enter numeric answer/i)).toBeNull();
      unmount();
    });
  });
});


