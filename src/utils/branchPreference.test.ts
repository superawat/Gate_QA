/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  readBranchPreferences,
  writeBranchPreferences,
  setActiveBranch,
  BRANCH_PREFERENCE_STORAGE_KEY,
  ACTIVE_BRANCH_STORAGE_KEY,
  BRANCH_ONBOARDING_KEY,
  MAX_ALLOWED_BRANCHES,
  DEFAULT_BRANCH,
} from "./branchPreference";

describe("branchPreference utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when storage is empty", () => {
    const state = readBranchPreferences();
    expect(state.selectedBranches).toEqual([]);
    expect(state.activeBranch).toBe(DEFAULT_BRANCH);
    expect(state.hasCompletedOnboarding).toBe(false);
  });

  it("writes up to 2 branches and sets active branch", () => {
    writeBranchPreferences(["ec", "ee"]);
    const state = readBranchPreferences();
    expect(state.selectedBranches).toEqual(["ec", "ee"]);
    expect(state.activeBranch).toBe("ec");
    expect(state.hasCompletedOnboarding).toBe(true);
  });

  it("enforces MAX_ALLOWED_BRANCHES (<= 2)", () => {
    writeBranchPreferences(["ec", "ee", "me", "ce"]);
    const state = readBranchPreferences();
    expect(state.selectedBranches.length).toBe(MAX_ALLOWED_BRANCHES);
    expect(state.selectedBranches).toEqual(["ec", "ee"]);
  });

  it("allows setting active branch among selected branches", () => {
    writeBranchPreferences(["ec", "ee"]);
    setActiveBranch("ee");
    const state = readBranchPreferences();
    expect(state.activeBranch).toBe("ee");
  });

  it("ignores active branch if not in selected branches", () => {
    writeBranchPreferences(["ec", "ee"]);
    setActiveBranch("me");
    const state = readBranchPreferences();
    expect(state.activeBranch).toBe("ec");
  });
});
