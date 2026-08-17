/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityHeatmap } from "./ActivityHeatmap";

describe("ActivityHeatmap", () => {
  test("renders empty cells without streak highlight when attempts are zero", () => {
    const { container } = render(
      <ActivityHeatmap
        attemptTimeline={[]}
        now={new Date(2026, 7, 17, 10, 0, 0)}
        streakDateKeys={["2026-08-16"]}
      />
    );

    expect(screen.getByText("Practice Activity")).toBeTruthy();

    const gridStreakCells = container.querySelectorAll(".home-activity-grid .home-activity-cell--streak");
    // With 0 attempts in timeline, no grid cell should have the active streak class
    expect(gridStreakCells.length).toBe(0);

    const cells = container.querySelectorAll(".home-activity-cell");
    expect(cells.length).toBeGreaterThan(50);
  });

  test("highlights active streak day only when attempts exist on that day", () => {
    const attemptTimeline = [
      {
        date: "2026-08-16",
        attempts: 5,
        accuracyRate: 0.8,
        totalDurationMs: 120000,
        correct: 4,
      },
    ];

    const { container } = render(
      <ActivityHeatmap
        attemptTimeline={attemptTimeline}
        now={new Date(2026, 7, 17, 10, 0, 0)}
        streakDateKeys={["2026-08-16", "2026-08-17"]}
      />
    );

    const gridStreakCells = container.querySelectorAll(".home-activity-grid .home-activity-cell--streak");
    // Only 2026-08-16 has attempts > 0, so only 1 grid cell receives the streak class
    expect(gridStreakCells.length).toBe(1);

    const activeCell = container.querySelector(".home-activity-intensity--2");
    expect(activeCell).toBeTruthy();
  });

  test("highlights frozen day with frozen class and shield label when present in streakFreezeDates", () => {
    const { container } = render(
      <ActivityHeatmap
        attemptTimeline={[]}
        now={new Date(2026, 7, 17, 10, 0, 0)}
        streakDateKeys={["2026-08-16"]}
        streakFreezeDates={["2026-08-16"]}
      />
    );

    const frozenCells = container.querySelectorAll(".home-activity-cell--frozen");
    // 1 in grid + 1 in legend hints
    expect(frozenCells.length).toBeGreaterThanOrEqual(2);

    const gridFrozenCell = container.querySelector('.home-activity-grid .home-activity-cell--frozen');
    expect(gridFrozenCell).toBeTruthy();
    expect(gridFrozenCell?.getAttribute("aria-label")).toContain("Streak protected by freeze");
  });

  test("renders legend with Streak, Frozen, and Less/More keys", () => {
    render(
      <ActivityHeatmap
        attemptTimeline={[]}
        now={new Date(2026, 7, 17, 10, 0, 0)}
      />
    );

    expect(screen.getByText("Streak")).toBeTruthy();
    expect(screen.getByText("Frozen")).toBeTruthy();
    expect(screen.getByText("Less")).toBeTruthy();
    expect(screen.getByText("More")).toBeTruthy();
  });
});
