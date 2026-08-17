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

    const streakCells = container.querySelectorAll(".home-activity-cell--streak");
    // With 0 attempts in timeline, no cell should have the active streak class
    expect(streakCells.length).toBe(0);

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

    const streakCells = container.querySelectorAll(".home-activity-cell--streak");
    // Only 2026-08-16 has attempts > 0, so only 1 cell receives the streak class
    expect(streakCells.length).toBe(1);

    const activeCell = container.querySelector(".home-activity-intensity--2");
    expect(activeCell).toBeTruthy();
  });
});
