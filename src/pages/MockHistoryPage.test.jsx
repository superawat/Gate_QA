/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

import MockHistoryPage from "./MockHistoryPage";

describe("MockHistoryPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("renders saved attempts with question-wise outcome details", () => {
    window.localStorage.setItem("gateqa_mock_history_v1", JSON.stringify([
      {
        id: "attempt-1",
        submittedAt: "2026-04-05T11:00:00.000Z",
        kindId: "paper_mode",
        kindTitle: "Past Paper",
        selectedPaperLabel: "2026 Set 2",
        questionCount: 65,
        durationMinutes: 180,
        score: 44,
        maxScore: 100,
        attempted: 52,
        correct: 31,
        incorrect: 21,
        unanswered: 13,
        correctQuestions: [{ questionUid: "ga:1", label: "GA-1", type: "MCQ", scoreDelta: 1 }],
        incorrectQuestions: [{ questionUid: "cs:2", label: "CS-2", type: "MSQ", scoreDelta: -0.67 }],
        unansweredQuestions: [{ questionUid: "cs:3", label: "CS-3", type: "NAT", scoreDelta: 0 }],
      },
    ]));

    const { container } = render(
      <MemoryRouter>
        <MockHistoryPage
          hasResumeRoute={false}
          onResumePractice={vi.fn()}
          onStartMockTest={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/attempted mock tests/i)).toBeTruthy();
    expect(screen.getByText(/past paper - 2026 set 2/i)).toBeTruthy();
    expect(screen.getByText("44 / 100")).toBeTruthy();
    expect(screen.queryByText(/saved attempts/i)).toBeNull();

    const details = container.querySelector("details");
    const summary = container.querySelector("summary");

    expect(details?.open).toBe(false);

    fireEvent.click(summary);

    expect(details?.open).toBe(true);
    expect(screen.getByText(/ga-1/i)).toBeTruthy();
    expect(screen.getByText(/id ga:1/i)).toBeTruthy();
    expect(screen.getByText(/cs-2/i)).toBeTruthy();
    expect(screen.getByText(/cs-3/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /ga-1/i }).getAttribute("href")).toBe("/practice/question/ga%3A1");
  });

  test("wires the primary page action", () => {
    const onStartMockTest = vi.fn();

    render(
      <MemoryRouter>
        <MockHistoryPage
          hasResumeRoute={false}
          onResumePractice={vi.fn()}
          onStartMockTest={onStartMockTest}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button", { name: /open mock test/i })[0]);

    expect(onStartMockTest).toHaveBeenCalledTimes(1);
  });
});
