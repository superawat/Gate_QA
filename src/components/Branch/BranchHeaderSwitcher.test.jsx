/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import BranchHeaderSwitcher from "./BranchHeaderSwitcher";
import {
  writeBranchPreferences,
  readBranchPreferences,
} from "../../utils/branchPreference";

describe("BranchHeaderSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders single branch badge when 1 branch is enrolled", () => {
    writeBranchPreferences(["cse"], "cse");
    render(
      <BrowserRouter>
        <BranchHeaderSwitcher />
      </BrowserRouter>
    );

    expect(screen.getByText("CSE")).toBeDefined();
    expect(screen.getByRole("button", { name: /Discipline switcher/i })).toBeDefined();
  });

  test("renders segmented switcher when 2 branches are enrolled", () => {
    writeBranchPreferences(["ec", "ee"], "ec");
    render(
      <BrowserRouter>
        <BranchHeaderSwitcher />
      </BrowserRouter>
    );

    expect(screen.getByText("EC")).toBeDefined();
    expect(screen.getByText("EE")).toBeDefined();

    // Click EE to swap active branch
    const eeBtn = screen.getByRole("button", { name: "EE" });
    fireEvent.click(eeBtn);

    const saved = readBranchPreferences();
    expect(saved.activeBranch).toBe("ee");
  });

  test("opens dropdown menu and invokes onReconfigure", () => {
    writeBranchPreferences(["cse"], "cse");
    const mockReconfigure = vi.fn();
    render(
      <BrowserRouter>
        <BranchHeaderSwitcher onReconfigure={mockReconfigure} />
      </BrowserRouter>
    );

    // Open dropdown
    const switcherBtn = screen.getByRole("button", { name: /Discipline switcher/i });
    fireEvent.click(switcherBtn);

    expect(screen.getByText("Enrolled Papers")).toBeDefined();
    const reconfigBtn = screen.getByRole("button", { name: /Reconfigure Papers/i });
    fireEvent.click(reconfigBtn);

    expect(mockReconfigure).toHaveBeenCalled();
  });
});
