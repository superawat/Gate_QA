/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import UserProfileHub from "./UserProfileHub";
import * as authContext from "../../contexts/AuthContext";
import {
  writeBranchPreferences,
  readBranchPreferences,
} from "../../utils/branchPreference";

describe("UserProfileHub", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: { email: "candidate@gateqa.in", id: "test-user-1" },
      isAuthenticated: true,
      isGuest: false,
      triggerSync: vi.fn(),
      lastSyncedAt: null,
    });
  });


  test("renders profile hub with enrolled disciplines header and offline status badge", () => {
    writeBranchPreferences(["cse", "da"], "cse");
    render(
      <BrowserRouter>
        <UserProfileHub />
      </BrowserRouter>
    );

    expect(screen.getByText("candidate@gateqa.in")).toBeDefined();
    expect(screen.getByText(/Enrolled GATE Disciplines \(Max 2 Allowed\)/i)).toBeDefined();
    expect(screen.getByText(/2 \/ 2 Enrolled/i)).toBeDefined();
    expect(screen.getByText("Computer Science & IT")).toBeDefined();
    expect(screen.getByText("Data Science & AI")).toBeDefined();
    expect(screen.getByText("Electronics & Communication")).toBeDefined();
    expect(screen.getByText(/Authenticated Aspirant/i)).toBeDefined();

    // Verify removed sections are absent
    expect(screen.queryByText(/Personalized Study Shortcuts/i)).toBeNull();
    expect(screen.queryByText(/Target Exam Milestones/i)).toBeNull();
    expect(screen.queryByText(/Target Exam Year/i)).toBeNull();
  });

  test("allows toggling branch enrollment within max 2 limit and swapping active branch", () => {
    writeBranchPreferences(["cse"], "cse");
    render(
      <BrowserRouter>
        <UserProfileHub />
      </BrowserRouter>
    );

    const daCard = screen.getByText("Data Science & AI").closest("[role='button']");
    fireEvent.click(daCard);

    // Verify 2 branches enrolled
    const prefAfterAdd = readBranchPreferences();
    expect(prefAfterAdd.selectedBranches).toContain("da");

    // DA should show 'Set as Primary'
    const setActiveBtn = screen.getByRole("button", { name: "Set as Primary" });
    fireEvent.click(setActiveBtn);

    const prefAfterActive = readBranchPreferences();
    expect(prefAfterActive.activeBranch).toBe("da");
  });

  test("renders compact cloud sync panel and backup download action", () => {
    writeBranchPreferences(["cse", "ee"], "cse");
    render(
      <BrowserRouter>
        <UserProfileHub />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cloud Sync & Offline Backup/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Sync Now/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Download Progress Backup/i })).toBeDefined();
  });
});
