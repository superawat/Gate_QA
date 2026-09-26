/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  test("allows switching date range between 12 weeks, 6 months, and 1 year", () => {
    const { container } = render(
      <ActivityHeatmap
        attemptTimeline={[]}
        now={new Date(2026, 7, 17, 10, 0, 0)}
      />
    );

    const select = screen.getByRole("combobox", { name: "Activity range" });
    expect(select.value).toBe("52w"); // desktop default (window.matchMedia defaults false in test env)

    // Check count of week columns for 52w
    const weeks52 = container.querySelectorAll(".home-activity-week");
    expect(weeks52.length).toBeGreaterThanOrEqual(52);

    // Switch to 12 weeks
    fireEvent.change(select, { target: { value: "12w" } });
    const weeks12 = container.querySelectorAll(".home-activity-week");
    expect(weeks12.length).toBeLessThanOrEqual(13);

    // Switch to 26 weeks
    fireEvent.change(select, { target: { value: "26w" } });
    const weeks26 = container.querySelectorAll(".home-activity-week");
    expect(weeks26.length).toBeGreaterThan(13);
    expect(weeks26.length).toBeLessThanOrEqual(27);
  });

  test("formats cell tooltip and aria label accurately for attempts and duration", () => {
    const attemptTimeline = [
      {
        date: "2026-08-16",
        attempts: 8,
        accuracyRate: 0.75,
        totalDurationMs: 3600000 + 120000, // 1h 2m
        correct: 6,
      },
    ];

    const { container } = render(
      <ActivityHeatmap
        attemptTimeline={attemptTimeline}
        now={new Date(2026, 7, 17, 10, 0, 0)}
        streakDateKeys={["2026-08-16"]}
      />
    );

    const activeCell = container.querySelector(".home-activity-intensity--3");
    expect(activeCell).toBeTruthy();
    expect(activeCell.getAttribute("aria-label")).toContain("8 attempts, 75% accuracy");
    expect(activeCell.getAttribute("title")).toContain("Time spent: 1h 2m");
    expect(activeCell.getAttribute("title")).toContain("Current streak day 🔥");
  });
});
