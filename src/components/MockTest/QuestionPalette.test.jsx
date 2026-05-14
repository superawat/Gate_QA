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

    const slowTile = screen.getByTestId("tile-status-answered");
    expect(slowTile.getAttribute("data-time-warning")).toBe("true");
    expect(slowTile.getAttribute("title")).toBe("Time spent: 3m 01s");
    expect(slowTile.className).toContain("gate-tile--slow-time");
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
