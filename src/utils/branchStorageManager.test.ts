/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isUrlForDeselectedBranch,
  purgeLocalStorageForBranches,
  purgeInMemoryForBranches,
  purgeCacheStorageForBranches,
  cleanupDeselectedBranchData,
  sanitizeStorageForSelectedBranches,
} from "./branchStorageManager";
import { BranchQuestionService } from "../services/BranchQuestionService";
import { DaQuestionService } from "../services/DaQuestionService";
import { QuestionService } from "../services/QuestionService";
import { MockCatalogService } from "../services/MockCatalogService";

describe("branchStorageManager", () => {
  describe("isUrlForDeselectedBranch", () => {
    it("preserves General Aptitude resources regardless of deselected branch", () => {
      expect(isUrlForDeselectedBranch("/data/aptitude-search-index.json", "ec")).toBe(false);
      expect(isUrlForDeselectedBranch("/question-detail-shards/apt-1.json", "cse")).toBe(false);
      expect(isUrlForDeselectedBranch("/data/aptitude/something.json", "da")).toBe(false);
    });

    it("preserves shell and shared assets", () => {
      expect(isUrlForDeselectedBranch("/index.html", "ec")).toBe(false);
      expect(isUrlForDeselectedBranch("/manifest.json", "me")).toBe(false);
      expect(isUrlForDeselectedBranch("/logo192.png", "ee")).toBe(false);
    });

    it("preserves resources needed by retained branches", () => {
      expect(isUrlForDeselectedBranch("/data/ec/search-index.json", "ec", ["ec", "cse"])).toBe(false);
      expect(isUrlForDeselectedBranch("/data/me/search-index.json", "me", ["me"])).toBe(false);
    });

    it("identifies EC resources for deselected EC branch", () => {
      expect(isUrlForDeselectedBranch("/data/ec/search-index.json", "ec", ["cse"])).toBe(true);
      expect(isUrlForDeselectedBranch("/question-detail-shards/ec-2024-s1.json", "ec", ["cse"])).toBe(true);
      expect(isUrlForDeselectedBranch("/data/ee/search-index.json", "ec", ["cse"])).toBe(false);
    });

    it("identifies DA resources for deselected DA branch", () => {
      expect(isUrlForDeselectedBranch("/data/da/search-index.json", "da", ["cse"])).toBe(true);
      expect(isUrlForDeselectedBranch("/mock_catalog_da_v1.json", "da", ["cse"])).toBe(true);
    });

    it("identifies CSE resources for deselected CSE branch", () => {
      expect(isUrlForDeselectedBranch("/question-search-index.json", "cse", ["ec"])).toBe(true);
      expect(isUrlForDeselectedBranch("/questions-with-answers.json", "cse", ["ec"])).toBe(true);
      expect(isUrlForDeselectedBranch("/mock_catalog_v1.json", "cse", ["ec"])).toBe(true);
      expect(isUrlForDeselectedBranch("/question-detail-shards/2024-s1.json", "cse", ["ec"])).toBe(true);
      // But not other branch shards
      expect(isUrlForDeselectedBranch("/question-detail-shards/ec-2024-s1.json", "cse", ["ec"])).toBe(false);
      expect(isUrlForDeselectedBranch("/question-detail-shards/apt-01.json", "cse", ["ec"])).toBe(false);
    });
  });

  describe("purgeLocalStorageForBranches", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it("purges branch filters and question caches without touching user study progress", () => {
      // Set branch-specific caches
      window.localStorage.setItem("gateqa_include_ec", "true");
      window.localStorage.setItem("gateqa_include_cse", "true");
      window.localStorage.setItem("gateqa_index_cache_v13", JSON.stringify({ items: [] }));
      window.localStorage.setItem("gateqa_full_bank_cache_v13", JSON.stringify({ items: [] }));

      // Set user study progress & tracker state (must NEVER be deleted)
      window.localStorage.setItem("gate_qa_solved_questions", JSON.stringify(["ec:2024:q1", "go:123"]));
      window.localStorage.setItem("gate_qa_bookmarked_questions", JSON.stringify(["go:123"]));
      window.localStorage.setItem("gateqa_progress_v1", JSON.stringify({ completed: 5 }));
      window.localStorage.setItem("gateqa_tracker_store_ec", JSON.stringify({ goals: [] }));
      window.localStorage.setItem("gateqa-aptitude-enabled", "true");

      purgeLocalStorageForBranches(["ec", "cse"], []);

      // Branch-specific cache keys removed
      expect(window.localStorage.getItem("gateqa_include_ec")).toBeNull();
      expect(window.localStorage.getItem("gateqa_include_cse")).toBeNull();
      expect(window.localStorage.getItem("gateqa_index_cache_v13")).toBeNull();
      expect(window.localStorage.getItem("gateqa_full_bank_cache_v13")).toBeNull();

      // Study progress, tracker data, and aptitude preserved intact
      expect(window.localStorage.getItem("gate_qa_solved_questions")).toBe(JSON.stringify(["ec:2024:q1", "go:123"]));
      expect(window.localStorage.getItem("gate_qa_bookmarked_questions")).toBe(JSON.stringify(["go:123"]));
      expect(window.localStorage.getItem("gateqa_progress_v1")).toBe(JSON.stringify({ completed: 5 }));
      expect(window.localStorage.getItem("gateqa_tracker_store_ec")).toBe(JSON.stringify({ goals: [] }));
      expect(window.localStorage.getItem("gateqa-aptitude-enabled")).toBe("true");
    });

    it("respects retained branches and preserves their keys", () => {
      window.localStorage.setItem("gateqa_include_cse", "true");
      window.localStorage.setItem("gateqa_index_cache_v13", "cached");
      window.localStorage.setItem("gateqa_include_ec", "true");

      // Deselect EC, retain CSE
      purgeLocalStorageForBranches(["ec"], ["cse"]);

      expect(window.localStorage.getItem("gateqa_include_ec")).toBeNull();
      expect(window.localStorage.getItem("gateqa_include_cse")).toBe("true");
      expect(window.localStorage.getItem("gateqa_index_cache_v13")).toBe("cached");
    });
  });

  describe("purgeInMemoryForBranches", () => {
    it("invokes clearBranch on relevant question services and resets mock catalog", () => {
      const clearBranchSpy = vi.spyOn(BranchQuestionService, "clearBranch");
      const clearDaSpy = vi.spyOn(DaQuestionService, "clearBranch");
      const clearCseSpy = vi.spyOn(QuestionService, "clearBranch");
      const resetCatalogSpy = vi.spyOn(MockCatalogService, "reset");

      purgeInMemoryForBranches(["ec", "da", "cse"], []);

      expect(clearBranchSpy).toHaveBeenCalledWith("ec");
      expect(clearDaSpy).toHaveBeenCalled();
      expect(clearCseSpy).toHaveBeenCalled();
      expect(resetCatalogSpy).toHaveBeenCalled();

      clearBranchSpy.mockRestore();
      clearDaSpy.mockRestore();
      clearCseSpy.mockRestore();
      resetCatalogSpy.mockRestore();
    });
  });

  describe("purgeCacheStorageForBranches", () => {
    it("deletes matching cache entries in window.caches while keeping retained and aptitude resources", async () => {
      const deletedRequests: string[] = [];
      const fakeRequests = [
        { url: "https://gateqa.in/data/ec/search-index.json" },
        { url: "https://gateqa.in/question-detail-shards/ec-2024-s1.json" },
        { url: "https://gateqa.in/data/aptitude-search-index.json" },
        { url: "https://gateqa.in/data/cse/question-search-index.json" },
      ];

      const fakeCache = {
        keys: vi.fn().mockResolvedValue(fakeRequests),
        delete: vi.fn().mockImplementation((req) => {
          deletedRequests.push(req.url);
          return Promise.resolve(true);
        }),
      };

      const originalCaches = window.caches;
      // @ts-ignore
      window.caches = {
        keys: vi.fn().mockResolvedValue(["gateqa-runtime-v1"]),
        open: vi.fn().mockResolvedValue(fakeCache),
      };

      await purgeCacheStorageForBranches(["ec"], ["cse"]);

      expect(deletedRequests).toContain("https://gateqa.in/data/ec/search-index.json");
      expect(deletedRequests).toContain("https://gateqa.in/question-detail-shards/ec-2024-s1.json");
      expect(deletedRequests).not.toContain("https://gateqa.in/data/aptitude-search-index.json");

      window.caches = originalCaches;
    });
  });
});
