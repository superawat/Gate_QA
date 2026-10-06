/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import SubjectProgressSortControl from "./SubjectProgressSortControl";

describe("SubjectProgressSortControl", () => {
  test("renders with default 'Coverage ↓' display", () => {
    render(<SubjectProgressSortControl value="coverage_desc" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /sort subjects/i })).toBeTruthy();
    expect(screen.getByText("Coverage ↓")).toBeTruthy();
    expect(screen.getByText("Sort:")).toBeTruthy();
  });

  test("renders with 'Accuracy ↑' when accuracy_asc is active", () => {
    render(<SubjectProgressSortControl value="accuracy_asc" onChange={vi.fn()} />);

    expect(screen.getByText("Accuracy ↑")).toBeTruthy();
  });

  test("renders with 'Accuracy ↓' when accuracy_desc is active", () => {
    render(<SubjectProgressSortControl value="accuracy_desc" onChange={vi.fn()} />);

    expect(screen.getByText("Accuracy ↓")).toBeTruthy();
  });

  test("renders with 'Coverage ↑' when coverage_asc is active", () => {
    render(<SubjectProgressSortControl value="coverage_asc" onChange={vi.fn()} />);

    expect(screen.getByText("Coverage ↑")).toBeTruthy();
  });

  test("opens dropdown on click and displays all 4 sort options", () => {
    render(<SubjectProgressSortControl value="coverage_desc" onChange={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: /sort subjects/i });
    fireEvent.click(trigger);

    expect(screen.getByText("Sort by")).toBeTruthy();
    expect(screen.getByRole("option", { name: /coverage — high to low/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /coverage — low to high/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /accuracy — high to low/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /accuracy — low to high/i })).toBeTruthy();
  });

  test("calls onChange with selected option and closes menu", () => {
    const handleChange = vi.fn();
    render(<SubjectProgressSortControl value="coverage_desc" onChange={handleChange} />);

    const trigger = screen.getByRole("button", { name: /sort subjects/i });
    fireEvent.click(trigger);

    const accuracyAscOption = screen.getByRole("option", { name: /accuracy — low to high/i });
    fireEvent.click(accuracyAscOption);

    expect(handleChange).toHaveBeenCalledWith("accuracy_asc");
    expect(screen.queryByText("Sort by")).toBeNull();
  });

  test("closes dropdown on Escape key", () => {
    render(<SubjectProgressSortControl value="coverage_desc" onChange={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: /sort subjects/i });
    fireEvent.click(trigger);
    expect(screen.getByText("Sort by")).toBeTruthy();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByText("Sort by")).toBeNull();
  });

  test("closes dropdown when clicking outside", () => {
    render(
      <div>
        <SubjectProgressSortControl value="coverage_desc" onChange={vi.fn()} />
        <div data-testid="outside">Outside area</div>
      </div>
    );

    const trigger = screen.getByRole("button", { name: /sort subjects/i });
    fireEvent.click(trigger);
    expect(screen.getByText("Sort by")).toBeTruthy();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByText("Sort by")).toBeNull();
  });

  test("supports keyboard navigation with ArrowDown, ArrowUp, and Enter", () => {
    const handleChange = vi.fn();
    render(<SubjectProgressSortControl value="coverage_desc" onChange={handleChange} />);

    const trigger = screen.getByRole("button", { name: /sort subjects/i });
    // Open via Enter
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(screen.getByText("Sort by")).toBeTruthy();

    // Navigate down to Coverage — Low to High
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    // Select via Enter
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith("coverage_asc");
    expect(screen.queryByText("Sort by")).toBeNull();
  });
});
