/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("../contexts/FilterContext", () => ({
  useFilterState: () => ({
    solvedCount: 12,
    bookmarkedCount: 7,
    progressPercentage: 18,
    totalQuestions: 3271,
  }),
}));

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

import HomePage from "./HomePage";

describe("HomePage", () => {
  test("shows a compact svg loader while the question bank summary is loading", () => {
    render(
      <HomePage
        questionBankManifest={null}
        manifestLoading
        manifestError=""
        hasResumeRoute={false}
        lastSession={null}
        mockModeEnabled={false}
        onStartRandomPractice={vi.fn()}
        onExplorePractice={vi.fn()}
        onOpenMockHistory={vi.fn()}
        onStartMockTest={vi.fn()}
        onResumePractice={vi.fn()}
      />
    );

    expect(screen.getByRole("status", { name: /loading question bank summary/i })).toBeTruthy();
    expect(screen.queryByText("...")).toBeNull();
  });

  test("shows mock entry buttons when mock mode is enabled", () => {
    const onStartMockTest = vi.fn();
    const onOpenMockHistory = vi.fn();

    render(
      <HomePage
        questionBankManifest={{
          questionCount: 3271,
          latestYear: 2026,
          yearSets: [{ key: "2026-s1" }, { key: "2026-s2" }],
        }}
        manifestLoading={false}
        manifestError=""
        hasResumeRoute={false}
        lastSession={null}
        mockModeEnabled
        onStartRandomPractice={vi.fn()}
        onExplorePractice={vi.fn()}
        onOpenMockHistory={onOpenMockHistory}
        onStartMockTest={onStartMockTest}
        onResumePractice={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /open mock test/i }));
    fireEvent.click(screen.getByRole("button", { name: /attempted mock tests/i }));

    expect(screen.getByText(/mock test is ready to try/i)).toBeTruthy();
    expect(screen.queryByText(/1 saved attempt in this browser/i)).toBeNull();
    expect(screen.queryByText(/score 44 \/ 100/i)).toBeNull();
    expect(onStartMockTest).toHaveBeenCalledTimes(1);
    expect(onOpenMockHistory).toHaveBeenCalledTimes(1);
  });
});
