/**
 * src/utils/branchPreference.ts
 * ------------------------------
 * Manages user's selected GATE disciplines and active practice branch.
 * Enforces official GATE regulation: Max 2 papers per candidate.
 * Local-first persistence in localStorage with CustomEvent dispatching.
 */

export const BRANCH_PREFERENCE_STORAGE_KEY = "gateqa_selected_branches";
export const ACTIVE_BRANCH_STORAGE_KEY = "gateqa_active_branch";
export const BRANCH_ONBOARDING_KEY = "gateqa_branch_onboarding_completed";
export const BRANCH_PREFERENCE_EVENT = "gateqa:branch-preference-change";

export const MAX_ALLOWED_BRANCHES = 2;
export const DEFAULT_BRANCH = "cse";

export interface BranchPreferenceState {
  selectedBranches: string[]; // Length 1 or 2
  activeBranch: string;
  hasCompletedOnboarding: boolean;
}

export function readBranchPreferences(): BranchPreferenceState {
  if (typeof window === "undefined") {
    return { selectedBranches: [DEFAULT_BRANCH], activeBranch: DEFAULT_BRANCH, hasCompletedOnboarding: false };
  }
  try {
    const raw = window.localStorage.getItem(BRANCH_PREFERENCE_STORAGE_KEY);
    const active = window.localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY) || DEFAULT_BRANCH;
    const completed = window.localStorage.getItem(BRANCH_ONBOARDING_KEY) === "true";
    const selected = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(selected) || selected.length === 0) {
      return { selectedBranches: [], activeBranch: DEFAULT_BRANCH, hasCompletedOnboarding: false };
    }
    return {
      selectedBranches: selected.slice(0, MAX_ALLOWED_BRANCHES),
      activeBranch: selected.includes(active) ? active : selected[0],
      hasCompletedOnboarding: completed,
    };
  } catch {
    return { selectedBranches: [DEFAULT_BRANCH], activeBranch: DEFAULT_BRANCH, hasCompletedOnboarding: false };
  }
}

import {
  cleanupDeselectedBranchData,
  purgeLocalStorageForBranches,
  sanitizeStorageForSelectedBranches,
} from "./branchStorageManager";

export function writeBranchPreferences(branches: string[], activeBranch?: string): void {
  if (typeof window === "undefined") return;
  const previous = readBranchPreferences();
  const sanitized = Array.from(new Set(branches)).slice(0, MAX_ALLOWED_BRANCHES);
  const nextActive = (activeBranch && sanitized.includes(activeBranch)) ? activeBranch : sanitized[0] || DEFAULT_BRANCH;

  const previousBranches = previous.selectedBranches || [];
  const deselected = previousBranches.filter((b) => !sanitized.includes(b));

  window.localStorage.setItem(BRANCH_PREFERENCE_STORAGE_KEY, JSON.stringify(sanitized));
  window.localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, nextActive);
  window.localStorage.setItem(BRANCH_ONBOARDING_KEY, "true");

  // Keep filter toggles for enrolled branches ON by default, and remove deselected branch toggles
  const ALL_BRANCH_TRACKS = ["cse", "da", "ec", "ee", "me", "ce"];
  for (const track of ALL_BRANCH_TRACKS) {
    if (sanitized.includes(track)) {
      window.localStorage.setItem(`gateqa_include_${track}`, "true");
    } else if (sanitized.length > 0 && !sanitized.includes(track)) {
      window.localStorage.removeItem(`gateqa_include_${track}`);
    }
  }
  if (sanitized.length > 0 && !sanitized.includes("cse")) {
    window.localStorage.removeItem("gateqa_include_isro");
  }

  // Immediately purge localStorage items for deselected branches
  if (deselected.length > 0) {
    purgeLocalStorageForBranches(deselected, sanitized);
  }

  if (!previous.hasCompletedOnboarding) {
    void sanitizeStorageForSelectedBranches(sanitized);
  } else if (deselected.length > 0) {
    void cleanupDeselectedBranchData(deselected, sanitized);
  }

  window.dispatchEvent(new CustomEvent(BRANCH_PREFERENCE_EVENT, {
    detail: {
      selectedBranches: sanitized,
      activeBranch: nextActive,
      deselectedBranches: deselected,
    },
  }));
}

export function setActiveBranch(branch: string): void {
  if (typeof window === "undefined") return;
  const state = readBranchPreferences();
  const target = state.selectedBranches.includes(branch) ? branch : state.selectedBranches[0] || DEFAULT_BRANCH;
  window.localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, target);
  window.dispatchEvent(new CustomEvent(BRANCH_PREFERENCE_EVENT, {
    detail: { selectedBranches: state.selectedBranches, activeBranch: target },
  }));
}

export {
  normalizeBranchId,
  isBranchEligible,
  isQuestionEligibleForBranches,
  filterPapersBySelectedBranches,
  getInsightTracksForSelectedBranches,
  getTrackForSubjectSlug,
  getTrackForSubjectOrQuestion,
  isItemEligibleForTrack,
  getBranchSubjects,
  UNIVERSAL_APTITUDE_TRACK,
} from "./branchEligibility";
