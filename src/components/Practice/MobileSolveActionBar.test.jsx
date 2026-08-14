/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MobileSolveActionBar from "./MobileSolveActionBar";

describe("MobileSolveActionBar", () => {
  it("renders all mobile action controls", () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    const onToggleBookmark = vi.fn();
    const onToggleCalculator = vi.fn();
    const onShare = vi.fn();

    render(
      <MobileSolveActionBar
        canGoPrevious={true}
        canGoNext={true}
        onPrevious={onPrevious}
        onNext={onNext}
        isBookmarked={false}
        onToggleBookmark={onToggleBookmark}
        onToggleCalculator={onToggleCalculator}
        isCalculatorOpen={false}
        onShare={onShare}
      />
    );

    expect(screen.getByRole("toolbar", { name: "Question solve controls" })).toBeTruthy();

    const prevBtn = screen.getByRole("button", { name: "Previous question" });
    const nextBtn = screen.getByRole("button", { name: "Next question" });
    const bookmarkBtn = screen.getByRole("button", { name: "Bookmark question" });
    const calcBtn = screen.getByRole("button", { name: "Open GATE calculator" });
    const shareBtn = screen.getByRole("button", { name: "Share question link" });

    expect(prevBtn.disabled).toBe(false);
    expect(nextBtn.disabled).toBe(false);

    fireEvent.click(prevBtn);
    expect(onPrevious).toHaveBeenCalledTimes(1);

    fireEvent.click(nextBtn);
    expect(onNext).toHaveBeenCalledTimes(1);

    fireEvent.click(bookmarkBtn);
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);

    fireEvent.click(calcBtn);
    expect(onToggleCalculator).toHaveBeenCalledTimes(1);

    fireEvent.click(shareBtn);
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it("disables prev and next buttons when cannot navigate", () => {
    render(
      <MobileSolveActionBar
        canGoPrevious={false}
        canGoNext={false}
      />
    );

    expect(screen.getByRole("button", { name: "Previous question" }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Next question" }).disabled).toBe(true);
  });

  it("reflects active bookmark and open calculator states", () => {
    render(
      <MobileSolveActionBar
        isBookmarked={true}
        isCalculatorOpen={true}
      />
    );

    expect(screen.getByRole("button", { name: "Remove bookmark" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close calculator" })).toBeTruthy();
  });
});
