/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import QuestionPalette from "./QuestionPalette";

let mockContextValue = null;

vi.mock("../../contexts/MockTestContext", () => ({
  useMockTest: () => mockContextValue,
}));

describe("QuestionPalette status icon parity", () => {
  beforeEach(() => {
    const status = {
      NOT_VISITED: "not_visited",
      NOT_ANSWERED: "not_answered",
      ANSWERED: "answered",
      MARKED_FOR_REVIEW: "review",
      ANSWERED_AND_MARKED_FOR_REVIEW: "review_answered",
    };

    mockContextValue = {
      questions: [
        { question_uid: "ga:1" },
        { question_uid: "ga:2" },
        { question_uid: "ga:3" },
        { question_uid: "ga:4" },
        { question_uid: "ga:5" },
      ],
      sectionQuestions: {
        GA: [
          { question_uid: "ga:1" },
          { question_uid: "ga:2" },
          { question_uid: "ga:3" },
          { question_uid: "ga:4" },
          { question_uid: "ga:5" },
        ],
        CS: [],
      },
      currentSection: "GA",
      currentSectionIndex: 0,
      goToQuestion: vi.fn(),
      submitTest: vi.fn(),
      questionStates: {
        "ga:1": status.NOT_ANSWERED,
        "ga:2": status.ANSWERED,
        "ga:3": status.NOT_VISITED,
        "ga:4": status.MARKED_FOR_REVIEW,
        "ga:5": status.ANSWERED_AND_MARKED_FOR_REVIEW,
      },
      resultSummary: { perQuestionResult: {} },
      STATUS: status,
    };
  });

  test("keeps collapse toggle accessible while hiding content when collapsed", () => {
    const onToggleCollapsed = vi.fn();
    const { container } = render(
      <QuestionPalette
        isCollapsed
        isReviewPhase={false}
        onToggleCollapsed={onToggleCollapsed}
      />
    );

    const toggleButton = screen.getByRole("button", { name: "Expand question palette" });
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false");

    const paletteContent = container.querySelector("#mocktest-palette-content");
    expect(paletteContent.className).toContain("pointer-events-none");
    expect(paletteContent.className).toContain("opacity-0");

    fireEvent.click(toggleButton);
    expect(onToggleCollapsed).toHaveBeenCalledTimes(1);
  });

  test("renders canonical status classes and data-status attributes for palette tiles", () => {
    render(
      <QuestionPalette
        isCollapsed={false}
        isReviewPhase={false}
        onToggleCollapsed={() => { }}
      />
    );

    const statusAssertions = [
      {
        testId: "tile-status-answered",
        dataStatus: "ANSWERED",
        tileClass: "gate-tile--answered",
        iconClass: "gate-status--answered",
      },
      {
        testId: "tile-status-not-answered",
        dataStatus: "NOT_ANSWERED",
        tileClass: "gate-tile--not-answered",
        iconClass: "gate-status--not-answered",
      },
      {
        testId: "tile-status-not-visited",
        dataStatus: "NOT_VISITED",
        tileClass: "gate-tile--not-visited",
        iconClass: "gate-status--not-visited",
      },
      {
        testId: "tile-status-marked",
        dataStatus: "MARKED",
        tileClass: "gate-tile--marked",
        iconClass: "gate-status--marked",
      },
      {
        testId: "tile-status-answered-marked",
        dataStatus: "ANSWERED_MARKED",
        tileClass: "gate-tile--answered-marked",
        iconClass: "gate-status--answered-marked",
      },
    ];

    statusAssertions.forEach(({ testId, dataStatus, tileClass, iconClass }) => {
      const tile = screen.getByTestId(testId);
      expect(tile.getAttribute("data-status")).toBe(dataStatus);
      expect(tile.className).toContain(tileClass);

      const icon = tile.querySelector(".gate-status-icon");
      expect(icon).toBeTruthy();
      expect(icon.className).toContain(iconClass);
      expect(icon.getAttribute("data-status")).toBe(dataStatus);
    });
  });

  test("uses current-question ring class without any scale classes", () => {
    const { container } = render(
      <QuestionPalette
        isCollapsed={false}
        isReviewPhase={false}
        onToggleCollapsed={() => { }}
      />
    );

    const currentTile = screen.getByTestId("tile-status-not-answered");
    expect(currentTile.className).toContain("gate-current-ring");
    expect(currentTile.className.includes("scale-")).toBe(false);

    const paletteButtons = Array.from(container.querySelectorAll(".mocktest-palette-grid .palette-btn"));
    expect(paletteButtons).toHaveLength(5);

    paletteButtons.forEach((button) => {
      expect(button.className.includes("scale-")).toBe(false);
      expect(button.className.includes("active")).toBe(false);
    });
  });

  test("renders legend rows through GateStatusIcon mapping", () => {
    render(
      <QuestionPalette
        isCollapsed={false}
        isReviewPhase={false}
        onToggleCollapsed={() => { }}
      />
    );

    const legendAssertions = [
      {
        testId: "legend-status-answered",
        dataStatus: "ANSWERED",
        className: "gate-status--answered",
      },
      {
        testId: "legend-status-not-answered",
        dataStatus: "NOT_ANSWERED",
        className: "gate-status--not-answered",
      },
      {
        testId: "legend-status-not-visited",
        dataStatus: "NOT_VISITED",
        className: "gate-status--not-visited",
      },
      {
        testId: "legend-status-marked",
        dataStatus: "MARKED",
        className: "gate-status--marked",
      },
      {
        testId: "legend-status-answered-marked",
        dataStatus: "ANSWERED_MARKED",
        className: "gate-status--answered-marked",
      },
    ];

    legendAssertions.forEach(({ testId, dataStatus, className }) => {
      const legendIcon = screen.getByTestId(testId);
      expect(legendIcon.className).toContain("gate-status-icon--legend");
      expect(legendIcon.className).toContain(className);
      expect(legendIcon.getAttribute("data-status")).toBe(dataStatus);

      const valueNode = legendIcon.querySelector(".gate-status-icon__value");
      expect(valueNode.textContent.trim()).toBe("1");
    });
  });

  test("marks review tiles when question time exceeds three minutes", () => {
    mockContextValue.resultSummary = {
      perQuestionResult: {
        "ga:2": {
          answered: true,
          correct: true,
          status: "correct",
          timeSpentSeconds: 181,
          timeExceededThreshold: true,
        },
      },
    };

    render(
      <QuestionPalette
        isCollapsed={false}
        isReviewPhase
        onToggleCollapsed={() => { }}
      />
    );

    const slowTile = screen.getByTestId("tile-status-correct");
    expect(slowTile.getAttribute("data-time-warning")).toBe("true");
    expect(slowTile.getAttribute("title")).toBe("Question 2: Correct. Time spent: 3m 01s");
    expect(slowTile.getAttribute("aria-label")).toContain("(slow: 3m 01s)");
    expect(slowTile.className).toContain("gate-tile--slow-time");
  });

  describe("Review Phase status and incorrect highlighting", () => {
    beforeEach(() => {
      mockContextValue.questions = [
        { question_uid: "ga:mcq-correct", type: "MCQ" },
        { question_uid: "ga:mcq-wrong", type: "MCQ" },
        { question_uid: "ga:msq-correct", type: "MSQ" },
        { question_uid: "ga:msq-wrong", type: "MSQ" },
        { question_uid: "ga:nat-correct", type: "NAT" },
        { question_uid: "ga:nat-wrong", type: "NAT" },
        { question_uid: "ga:unattempted", type: "MCQ" },
        { question_uid: "ga:bonus", type: "MARKS_TO_ALL" },
        { question_uid: "ga:missing", type: "MCQ" },
      ];
      mockContextValue.sectionQuestions = {
        GA: [...mockContextValue.questions],
        CS: [],
      };
      mockContextValue.currentSection = "GA";
      mockContextValue.currentSectionIndex = 1; // ga:mcq-wrong is current

      mockContextValue.resultSummary = {
        correct: 3,
        incorrect: 3,
        unanswered: 1,
        bonus: 1,
        perQuestionResult: {
          "ga:mcq-correct": {
            questionUid: "ga:mcq-correct",
            answered: true,
            correct: true,
            status: "correct",
            type: "MCQ",
            timeSpentSeconds: 45,
          },
          "ga:mcq-wrong": {
            questionUid: "ga:mcq-wrong",
            answered: true,
            correct: false,
            status: "incorrect",
            type: "MCQ",
            timeSpentSeconds: 90,
          },
          "ga:msq-correct": {
            questionUid: "ga:msq-correct",
            answered: true,
            correct: true,
            status: "correct",
            type: "MSQ",
            timeSpentSeconds: 60,
          },
          "ga:msq-wrong": {
            questionUid: "ga:msq-wrong",
            answered: true,
            correct: false,
            status: "incorrect",
            type: "MSQ",
            timeSpentSeconds: 120,
          },
          "ga:nat-correct": {
            questionUid: "ga:nat-correct",
            answered: true,
            correct: true,
            status: "correct",
            type: "NAT",
            timeSpentSeconds: 80,
          },
          "ga:nat-wrong": {
            questionUid: "ga:nat-wrong",
            answered: true,
            correct: false,
            status: "incorrect",
            type: "NAT",
            timeSpentSeconds: 150,
          },
          "ga:unattempted": {
            questionUid: "ga:unattempted",
            answered: false,
            correct: false,
            status: "unanswered",
            type: "MCQ",
            timeSpentSeconds: 0,
          },
          "ga:bonus": {
            questionUid: "ga:bonus",
            answered: false,
            correct: false,
            autoAwarded: true,
            status: "bonus",
            type: "MARKS_TO_ALL",
            timeSpentSeconds: 10,
          },
          "ga:missing": {
            questionUid: "ga:missing",
            answered: true,
            correct: false,
            status: "missing_answer",
            type: "MCQ",
            timeSpentSeconds: 30,
          },
        },
      };
    });

    test("renders distinguishable red incorrect tiles and green correct tiles for MCQ, MSQ, and NAT", () => {
      render(
        <QuestionPalette
          isCollapsed={false}
          isReviewPhase={true}
          onToggleCollapsed={() => { }}
        />
      );

      const allTiles = screen.getAllByRole("button").filter((btn) => btn.className.includes("gate-tile"));
      expect(allTiles).toHaveLength(9);

      // 1. MCQ Correct (Index 0)
      const mcqCorrectTile = allTiles[0];
      expect(mcqCorrectTile.getAttribute("data-status")).toBe("CORRECT");
      expect(mcqCorrectTile.className).toContain("gate-tile--correct");
      expect(mcqCorrectTile.getAttribute("aria-label")).toContain("Question 1 — Correct");

      // 2. MCQ Incorrect (Index 1 - Current active question)
      const mcqWrongTile = allTiles[1];
      expect(mcqWrongTile.getAttribute("data-status")).toBe("INCORRECT");
      expect(mcqWrongTile.className).toContain("gate-tile--incorrect");
      expect(mcqWrongTile.className).toContain("gate-current-ring"); // Active outline sits on top of incorrect tile
      expect(mcqWrongTile.getAttribute("aria-label")).toContain("Question 2 — Incorrect");

      // 3. MSQ Correct (Index 2)
      const msqCorrectTile = allTiles[2];
      expect(msqCorrectTile.getAttribute("data-status")).toBe("CORRECT");
      expect(msqCorrectTile.className).toContain("gate-tile--correct");

      // 4. MSQ Incorrect (Index 3)
      const msqWrongTile = allTiles[3];
      expect(msqWrongTile.getAttribute("data-status")).toBe("INCORRECT");
      expect(msqWrongTile.className).toContain("gate-tile--incorrect");

      // 5. NAT Correct (Index 4)
      const natCorrectTile = allTiles[4];
      expect(natCorrectTile.getAttribute("data-status")).toBe("CORRECT");
      expect(natCorrectTile.className).toContain("gate-tile--correct");

      // 6. NAT Incorrect (Index 5)
      const natWrongTile = allTiles[5];
      expect(natWrongTile.getAttribute("data-status")).toBe("INCORRECT");
      expect(natWrongTile.className).toContain("gate-tile--incorrect");

      // 7. Unattempted (Index 6)
      const unattemptedTile = allTiles[6];
      expect(unattemptedTile.getAttribute("data-status")).toBe("NOT_VISITED");
      expect(unattemptedTile.className).toContain("gate-tile--not-visited");
      expect(unattemptedTile.className).not.toContain("gate-tile--incorrect");
      expect(unattemptedTile.getAttribute("aria-label")).toContain("Question 7 — Unanswered");

      // 8. Bonus (Index 7)
      const bonusTile = allTiles[7];
      expect(bonusTile.getAttribute("data-status")).toBe("BONUS");
      expect(bonusTile.className).toContain("gate-tile--bonus");

      // 9. Missing answer record (Index 8)
      const missingTile = allTiles[8];
      expect(missingTile.getAttribute("data-status")).toBe("NOT_ANSWERED");
      expect(missingTile.className).toContain("gate-tile--not-answered");
    });

    test("renders review legend with Correct, Incorrect, Unanswered, and Bonus counts", () => {
      render(
        <QuestionPalette
          isCollapsed={false}
          isReviewPhase={true}
          onToggleCollapsed={() => { }}
        />
      );

      const correctLegend = screen.getByTestId("legend-status-correct");
      expect(correctLegend.className).toContain("gate-status--correct");
      expect(correctLegend.textContent.trim()).toBe("3");

      const incorrectLegend = screen.getByTestId("legend-status-incorrect");
      expect(incorrectLegend.className).toContain("gate-status--incorrect");
      expect(incorrectLegend.textContent.trim()).toBe("3");

      const unansweredLegend = screen.getByTestId("legend-status-unanswered");
      expect(unansweredLegend.className).toContain("gate-status--not-visited");
      expect(unansweredLegend.textContent.trim()).toBe("1");

      const bonusLegend = screen.getByTestId("legend-status-bonus");
      expect(bonusLegend.className).toContain("gate-status--bonus");
      expect(bonusLegend.textContent.trim()).toBe("1");
    });

    test("retains standard official GATE CBT statuses when in active exam mode (isReviewPhase=false)", () => {
      render(
        <QuestionPalette
          isCollapsed={false}
          isReviewPhase={false}
          onToggleCollapsed={() => { }}
        />
      );

      // Active exam mode should not contain any review-phase status test-ids
      expect(screen.queryByTestId("tile-status-correct")).toBeNull();
      expect(screen.queryByTestId("tile-status-incorrect")).toBeNull();
      expect(screen.queryByTestId("legend-status-correct")).toBeNull();
      expect(screen.queryByTestId("legend-status-incorrect")).toBeNull();

      // Exam legend should be present
      expect(screen.getByTestId("legend-status-answered")).toBeTruthy();
      expect(screen.getByTestId("legend-status-not-answered")).toBeTruthy();
    });
  });
});

// Subjective question exclusion logic

describe("Subjective question exclusion logic", () => {
  const OBJECTIVE_TYPES = new Set(["MCQ", "MSQ", "NAT"]);

  const isObjectiveQuestion = (question = {}) => {
    const raw = String(question?.type || "").trim().toUpperCase();
    return OBJECTIVE_TYPES.has(raw);
  };

  test("MCQ is objective", () => {
    expect(isObjectiveQuestion({ type: "MCQ" })).toBe(true);
    expect(isObjectiveQuestion({ type: "mcq" })).toBe(true);
  });

  test("MSQ is objective", () => {
    expect(isObjectiveQuestion({ type: "MSQ" })).toBe(true);
  });

  test("NAT is objective", () => {
    expect(isObjectiveQuestion({ type: "NAT" })).toBe(true);
    expect(isObjectiveQuestion({ type: "nat" })).toBe(true);
  });

  test("subjective types are excluded", () => {
    expect(isObjectiveQuestion({ type: "Subjective" })).toBe(false);
    expect(isObjectiveQuestion({ type: "descriptive" })).toBe(false);
    expect(isObjectiveQuestion({ type: "" })).toBe(false);
    expect(isObjectiveQuestion({})).toBe(false);
    expect(isObjectiveQuestion({ type: "unknown" })).toBe(false);
  });

  test("filtering a mixed pool produces only objective questions", () => {
    const pool = [
      { question_uid: "q1", type: "MCQ" },
      { question_uid: "q2", type: "Subjective" },
      { question_uid: "q3", type: "NAT" },
      { question_uid: "q4", type: "descriptive" },
      { question_uid: "q5", type: "MSQ" },
      { question_uid: "q6", type: "" },
    ];

    const filtered = pool.filter(isObjectiveQuestion);
    expect(filtered).toHaveLength(3);
    expect(filtered.map((q) => q.question_uid)).toEqual(["q1", "q3", "q5"]);
  });
});
