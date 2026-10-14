/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach } from "vitest";
import BranchSelectionWall from "./BranchSelectionWall";
import {
  readBranchPreferences,
  writeBranchPreferences,
  BRANCH_PREFERENCE_STORAGE_KEY,
  BRANCH_ONBOARDING_KEY,
} from "../../utils/branchPreference";

describe("BranchSelectionWall", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders modal when forceOpen is true", () => {
    render(<BranchSelectionWall isOpen={true} />);
    expect(screen.getByText(/Choose Your Preparation Disciplines/i)).toBeDefined();
    expect(screen.getByText("Computer Science & IT")).toBeDefined();
    expect(screen.getByText("Data Science & AI")).toBeDefined();
    expect(screen.getByText("Electronics & Communication")).toBeDefined();
    expect(screen.getByText("Electrical Engineering")).toBeDefined();
    expect(screen.getByText("Mechanical Engineering")).toBeDefined();
    expect(screen.getByText("Civil Engineering")).toBeDefined();
  });

  test("enforces max 2 disciplines selection", () => {
    render(<BranchSelectionWall isOpen={true} />);

    // CSE is selected by default in forceOpen mode
    const daCard = screen.getByText("Data Science & AI").closest("[role='button']");
    const ecCard = screen.getByText("Electronics & Communication").closest("[role='button']");

    // Select second branch: DA
    fireEvent.click(daCard);

    // Max 2 disciplines reached: count displays of 2 max disciplines
    expect(screen.getByText(/of 2 max disciplines/i)).toBeDefined();

    // Clicking a 3rd branch (EC) is blocked
    fireEvent.click(ecCard);

    // Verify still only 2 selected
    const confirmBtn = screen.getByRole("button", { name: /Confirm & Start Preparing/i });
    expect(confirmBtn).toBeDefined();
    fireEvent.click(confirmBtn);

    const saved = readBranchPreferences();
    expect(saved.selectedBranches.length).toBe(2);
    expect(saved.selectedBranches).toContain("cse");
    expect(saved.selectedBranches).toContain("da");
    expect(saved.selectedBranches).not.toContain("ec");
  });

  test("confirms selection and marks onboarding complete", () => {
    const handleClose = vi.fn();
    render(<BranchSelectionWall isOpen={true} onClose={handleClose} />);

    const confirmBtn = screen.getByRole("button", { name: /Confirm & Start Preparing|Continue to preparation/i });
    fireEvent.click(confirmBtn);

    expect(localStorage.getItem(BRANCH_ONBOARDING_KEY)).toBe("true");
    expect(handleClose).toHaveBeenCalled();
  });

  test("allows deselecting a paper and disables primary action when 0 papers selected", () => {
    render(<BranchSelectionWall isOpen={true} />);

    // CSE is selected by default in forceOpen mode
    const cseCard = screen.getByText("Computer Science & IT").closest("[role='button']");
    const confirmBtn = screen.getByRole("button", { name: /Confirm & Start Preparing|Continue to preparation/i });

    expect(confirmBtn.hasAttribute("disabled")).toBe(false);

    // Deselect CSE
    fireEvent.click(cseCard);

    // Now 0 papers selected
    expect(screen.getByText("0")).toBeDefined();
    expect(screen.getByText(/of 2 max disciplines/i)).toBeDefined();
    expect(confirmBtn.hasAttribute("disabled")).toBe(true);

    // Clicking confirm when disabled does not trigger save
    fireEvent.click(confirmBtn);
    expect(localStorage.getItem(BRANCH_ONBOARDING_KEY)).toBeNull();

    // Re-select CSE
    fireEvent.click(cseCard);
    expect(confirmBtn.hasAttribute("disabled")).toBe(false);
  });

  test("shows clear explanation when max 2 papers are selected and allows setting primary paper", () => {
    render(<BranchSelectionWall isOpen={true} />);

    const daCard = screen.getByText("Data Science & AI").closest("[role='button']");
    fireEvent.click(daCard);

    // 2 branches selected: CSE and DA
    // Verify explanation displayed for unselected cards
    expect(screen.getAllByText(/Max 2 papers selected/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Deselect one to swap/i).length).toBeGreaterThan(0);

    // DA should show 'Set as primary' since CSE is active by default
    const setPrimaryBtn = screen.getByText("Set as primary");
    fireEvent.click(setPrimaryBtn);

    const confirmBtn = screen.getByRole("button", { name: /Confirm & Start Preparing|Continue to preparation/i });
    fireEvent.click(confirmBtn);

    const saved = readBranchPreferences();
    expect(saved.activeBranch).toBe("da");
  });
});
