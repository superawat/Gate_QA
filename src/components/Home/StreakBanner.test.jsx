/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import StreakBanner from "./StreakBanner";

vi.mock("../../hooks/useDailyGoal", () => ({
  useDailyGoal: () => ({
    goal: 5,
    updateGoal: vi.fn(),
  }),
}));

describe("StreakBanner", () => {
  const mockActivity = {
    currentStreak: 3,
    longestStreak: 11,
    xp: 1300,
    activeDayCount: 31,
    todayAttempts: 2,
    streakFreeze: {
      available: 1,
    },
    badges: ["25 attempts", "hard practice"], // Legacy badges that should be ignored
  };

  test("renders the four core metric pills (Best, Aura, Freeze, Days) with correct values", () => {
    render(<StreakBanner activity={mockActivity} />);

    expect(screen.getByRole("button", { name: /Best: 11/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Aura: 1.3k/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Freeze: 1/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Days: 31/i })).toBeTruthy();
  });

  test("does NOT render '25 attempts' or 'Hard Practice' tags", () => {
    render(<StreakBanner activity={mockActivity} />);

    expect(screen.queryByText("25 attempts")).toBeNull();
    expect(screen.queryByText("Hard Practice")).toBeNull();
  });

  test("clicking 'Best' opens the Best explanation modal and can be dismissed", () => {
    render(<StreakBanner activity={mockActivity} />);

    fireEvent.click(screen.getByRole("button", { name: /Best: 11/i }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Best Streak" })).toBeTruthy();
    expect(screen.getByText(/All-time longest daily practice streak/i)).toBeTruthy();
    expect(screen.getByText(/11 Days/i)).toBeTruthy();

    // Dismiss with "Got it"
    fireEvent.click(screen.getByRole("button", { name: /Got it/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("clicking 'Aura' opens the Aura explanation modal detailing XP rules and 2x multiplier", () => {
    render(<StreakBanner activity={mockActivity} />);

    fireEvent.click(screen.getByRole("button", { name: /Aura: 1.3k/i }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Aura \(Practice XP\)/i })).toBeTruthy();
    expect(screen.getByText(/\+5 XP for every question attempted/i)).toBeTruthy();
    expect(screen.getByText(/\+10 XP for every question answered correctly/i)).toBeTruthy();
    expect(screen.getByText(/2x Multiplier: Maintain an active daily streak of 7\+ days/i)).toBeTruthy();

    // Dismiss by clicking the backdrop overlay
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.parentElement);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("clicking 'Freeze' opens the Freeze explanation modal detailing streak shield rules", () => {
    render(<StreakBanner activity={mockActivity} />);

    fireEvent.click(screen.getByRole("button", { name: /Freeze: 1/i }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Streak Freeze" })).toBeTruthy();
    expect(screen.getByText(/Earn 1 Freeze for every 3 consecutive days/i)).toBeTruthy();
    expect(screen.getByText(/Capped at 1 active Freeze in reserve/i)).toBeTruthy();
    expect(screen.getByText(/Usable at most once within any 7-day window/i)).toBeTruthy();

    // Dismiss with Escape key
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("clicking 'Days' opens the Active Days explanation modal detailing lifetime practice days", () => {
    render(<StreakBanner activity={mockActivity} />);

    fireEvent.click(screen.getByRole("button", { name: /Days: 31/i }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Active Days" })).toBeTruthy();
    expect(screen.getByText(/Total distinct days practiced/i)).toBeTruthy();
    expect(screen.getByText(/Unlike daily streaks, Active Days never resets/i)).toBeTruthy();

    // Dismiss with "Got it"
    fireEvent.click(screen.getByRole("button", { name: /Got it/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
