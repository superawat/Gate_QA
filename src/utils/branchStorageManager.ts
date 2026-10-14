/**
 * src/utils/branchStorageManager.ts
 * ---------------------------------
 * Strict branch-aware cache and browser storage manager for GateQA.
 * Enforces that only the user's selected branches retain data in the browser.
 * Cleans up obsolete branch data across in-memory models, localStorage, and CacheStorage (SW).
 * Preserves user study progress, tracker data, settings, auth, and General Aptitude.
 */

import { EXAM_TRACKS, normalizeExamTrack } from "./examTrack";
import { BranchQuestionService } from "../services/BranchQuestionService";
import { DaQuestionService } from "../services/DaQuestionService";
import { QuestionService } from "../services/QuestionService";
import { MockCatalogService } from "../services/MockCatalogService";
import { clearInsightsCache } from "./weakTopicAnalyzer";

export const ALL_EXAM_BRANCHES = Object.freeze([
  EXAM_TRACKS.CSE,
  EXAM_TRACKS.DA,
  EXAM_TRACKS.EC,
  EXAM_TRACKS.EE,
  EXAM_TRACKS.ME,
  EXAM_TRACKS.CE,
]);

/**
 * Checks if a cache request URL belongs exclusively to a deselected branch.
 * Preserves General Aptitude, shell assets, and resources required by retained branches.
 */
export function isUrlForDeselectedBranch(
  url: string,
  deselectedBranch: string,
  retainedBranches: string[] = []
): boolean {
  if (!url || !deselectedBranch) return false;
  const lowerUrl = url.toLowerCase();

  // General Aptitude and shared shell assets are universal - never purge
  if (
    lowerUrl.includes("aptitude") ||
    lowerUrl.includes("/apt-") ||
    lowerUrl.includes("manifest") ||
    lowerUrl.includes("index.html") ||
    lowerUrl.includes("logo")
  ) {
    return false;
  }

  const track = deselectedBranch.toLowerCase();

  // If the resource is also needed by a retained branch, keep it
  if (retainedBranches.map((b) => b.toLowerCase()).includes(track)) {
    return false;
  }

  switch (track) {
    case "ec":
      return lowerUrl.includes("/data/ec/") || lowerUrl.includes("/question-detail-shards/ec-") || lowerUrl.includes("/question-detail-shards/ec%2d");
    case "ee":
      return lowerUrl.includes("/data/ee/") || lowerUrl.includes("/question-detail-shards/ee-") || lowerUrl.includes("/question-detail-shards/ee%2d");
    case "me":
      return lowerUrl.includes("/data/me/") || lowerUrl.includes("/question-detail-shards/me-") || lowerUrl.includes("/question-detail-shards/me%2d");
    case "ce":
      return lowerUrl.includes("/data/ce/") || lowerUrl.includes("/question-detail-shards/ce-") || lowerUrl.includes("/question-detail-shards/ce%2d");
    case "da":
      return lowerUrl.includes("/data/da/") || lowerUrl.includes("mock_catalog_da_v1.json");
    case "cse":
      return (
        lowerUrl.includes("question-search-index.json") ||
        lowerUrl.includes("questions-with-answers.json") ||
        lowerUrl.includes("mock_catalog_v1.json") ||
        // CSE legacy detail shard keys: e.g. /question-detail-shards/2024-s1.json
        (lowerUrl.includes("/question-detail-shards/") &&
          !lowerUrl.includes("/question-detail-shards/ec-") &&
          !lowerUrl.includes("/question-detail-shards/ec%2d") &&
          !lowerUrl.includes("/question-detail-shards/ee-") &&
          !lowerUrl.includes("/question-detail-shards/ee%2d") &&
          !lowerUrl.includes("/question-detail-shards/me-") &&
          !lowerUrl.includes("/question-detail-shards/me%2d") &&
          !lowerUrl.includes("/question-detail-shards/ce-") &&
          !lowerUrl.includes("/question-detail-shards/ce%2d") &&
          !lowerUrl.includes("/question-detail-shards/da-") &&
          !lowerUrl.includes("/question-detail-shards/apt-"))
      );
    default:
      return false;
  }
}

/**
 * Targeted purge of CacheStorage entries belonging to deselected branches.
 */
export async function purgeCacheStorageForBranches(
  deselectedBranches: string[],
  retainedBranches: string[] = []
): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  if (!Array.isArray(deselectedBranches) || deselectedBranches.length === 0) return;

  try {
    const cacheKeys = await window.caches.keys();
    for (const cacheName of cacheKeys) {
      const cache = await window.caches.open(cacheName);
      const requests = await cache.keys();
      for (const req of requests) {
        const reqUrl = req.url;
        for (const branch of deselectedBranches) {
          if (isUrlForDeselectedBranch(reqUrl, branch, retainedBranches)) {
            await cache.delete(req);
            break;
          }
        }
      }
    }
  } catch (err) {
    // Non-blocking catch in environments where cache storage is restricted
    console.warn("[BranchStorageManager] CacheStorage purge warning:", err);
  }
}

/**
 * Targeted purge of localStorage entries belonging to deselected branches.
 * NOTE: User progress records (solved, bookmarked, tracker state, notes, auth) are NEVER removed.
 */
export function purgeLocalStorageForBranches(
  deselectedBranches: string[],
  retainedBranches: string[] = []
): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (!Array.isArray(deselectedBranches) || deselectedBranches.length === 0) return;

  for (const rawBranch of deselectedBranches) {
    const branch = String(rawBranch || "").toLowerCase().trim();
    if (retainedBranches.map((b) => b.toLowerCase()).includes(branch)) {
      continue;
    }

    // Remove active filter toggle for deselected branch
    window.localStorage.removeItem(`gateqa_include_${branch}`);

    if (branch === "cse") {
      // Remove CSE question bank cache
      window.localStorage.removeItem("gateqa_index_cache_v13");
      window.localStorage.removeItem("gateqa_full_bank_cache_v13");
      window.localStorage.removeItem("gateqa_init_cache_v1");
      window.localStorage.removeItem("gateqa_init_cache_v2");
      window.localStorage.removeItem("gateqa_init_cache_v3");
      window.localStorage.removeItem("gateqa_init_cache_v7");
      window.localStorage.removeItem("gateqa_include_cse");
      window.localStorage.removeItem("gateqa_include_isro");
      window.localStorage.removeItem("gateqa_isro_enabled");
    }

    if (branch === "da") {
      window.localStorage.removeItem("gateqa_include_da");
      window.localStorage.removeItem("gateqa_da_enabled");
    }
  }
}

/**
 * Targeted eviction of in-memory services for deselected branches.
 */
export function purgeInMemoryForBranches(
  deselectedBranches: string[],
  retainedBranches: string[] = []
): void {
  if (!Array.isArray(deselectedBranches) || deselectedBranches.length === 0) return;

  for (const rawBranch of deselectedBranches) {
    const branch = String(rawBranch || "").toLowerCase().trim();
    if (retainedBranches.map((b) => b.toLowerCase()).includes(branch)) {
      continue;
    }

    if (["ec", "ee", "me", "ce"].includes(branch)) {
      if (typeof BranchQuestionService?.clearBranch === "function") {
        BranchQuestionService.clearBranch(branch);
      }
    } else if (branch === "da") {
      if (typeof DaQuestionService?.clearBranch === "function") {
        DaQuestionService.clearBranch();
      }
    } else if (branch === "cse") {
      if (typeof QuestionService?.clearBranch === "function") {
        QuestionService.clearBranch();
      }
    }
  }

  // Reset aggregated catalogs and insight computations so they regenerate with new branches
  MockCatalogService.reset();
  clearInsightsCache();
}

/**
 * Master cleanup coordinator: evicts in-memory, localStorage, and CacheStorage
 * strictly for branches that are deselected, keeping retained branches intact.
 */
export async function cleanupDeselectedBranchData(
  deselectedBranches: string[],
  retainedBranches: string[] = []
): Promise<void> {
  if (!Array.isArray(deselectedBranches) || deselectedBranches.length === 0) return;

  // 1. In-memory stores
  purgeInMemoryForBranches(deselectedBranches, retainedBranches);

  // 2. Browser localStorage
  purgeLocalStorageForBranches(deselectedBranches, retainedBranches);

  // 3. Browser CacheStorage
  await purgeCacheStorageForBranches(deselectedBranches, retainedBranches);
}

/**
 * Startup integrity sanitizer: ensures no lingering cache remains for unselected branches.
 */
export async function sanitizeStorageForSelectedBranches(
  selectedBranches: string[]
): Promise<void> {
  const sanitized = (Array.isArray(selectedBranches) ? selectedBranches : []).map((b) =>
    String(b || "").toLowerCase().trim()
  );
  if (sanitized.length === 0) return;

  const unselected = ALL_EXAM_BRANCHES.filter((b) => !sanitized.includes(b));
  await cleanupDeselectedBranchData(unselected, sanitized);
}
