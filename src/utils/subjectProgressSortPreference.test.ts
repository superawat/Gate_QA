/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, beforeEach, vi } from "vitest";
import {
  DEFAULT_SUBJECT_PROGRESS_SORT,
  SUBJECT_PROGRESS_SORT_STORAGE_KEY,
  SUBJECT_PROGRESS_SORT_CHANGE_EVENT,
  isValidSubjectProgressSort,
  readSubjectProgressSort,
  writeSubjectProgressSort,
  sortSubjectProgress,
  SortableSubjectItem,
} from "./subjectProgressSortPreference";

describe("subjectProgressSortPreference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("read and write preferences", () => {
    test("defaults to coverage_desc when no preference is saved", () => {
      expect(readSubjectProgressSort()).toBe(DEFAULT_SUBJECT_PROGRESS_SORT);
      expect(readSubjectProgressSort()).toBe("coverage_desc");
    });

    test("falls back to default if stored value is invalid or corrupted", () => {
      window.localStorage.setItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY, "invalid_option");
      expect(readSubjectProgressSort()).toBe("coverage_desc");

      window.localStorage.setItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY, "{corrupt:json}");
      expect(readSubjectProgressSort()).toBe("coverage_desc");
    });

    test("reads valid saved preferences from localStorage", () => {
      window.localStorage.setItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY, "accuracy_asc");
      expect(readSubjectProgressSort()).toBe("accuracy_asc");

      window.localStorage.setItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY, "coverage_asc");
      expect(readSubjectProgressSort()).toBe("coverage_asc");

      window.localStorage.setItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY, "accuracy_desc");
      expect(readSubjectProgressSort()).toBe("accuracy_desc");
    });

    test("writes valid preference and dispatches change event", () => {
      const listener = vi.fn();
      window.addEventListener(SUBJECT_PROGRESS_SORT_CHANGE_EVENT, listener);

      const written = writeSubjectProgressSort("accuracy_asc");
      expect(written).toBe("accuracy_asc");
      expect(window.localStorage.getItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY)).toBe("accuracy_asc");

      expect(listener).toHaveBeenCalledTimes(1);
      const eventDetail = listener.mock.calls[0][0].detail;
      expect(eventDetail).toEqual({ option: "accuracy_asc" });

      window.removeEventListener(SUBJECT_PROGRESS_SORT_CHANGE_EVENT, listener);
    });

    test("writeSubjectProgressSort normalizes invalid option to default", () => {
      const written = writeSubjectProgressSort("unknown_sort" as any);
      expect(written).toBe("coverage_desc");
      expect(window.localStorage.getItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY)).toBe("coverage_desc");
    });

    test("validates sort options correctly", () => {
      expect(isValidSubjectProgressSort("coverage_desc")).toBe(true);
      expect(isValidSubjectProgressSort("coverage_asc")).toBe(true);
      expect(isValidSubjectProgressSort("accuracy_desc")).toBe(true);
      expect(isValidSubjectProgressSort("accuracy_asc")).toBe(true);
      expect(isValidSubjectProgressSort("coverage")).toBe(false);
      expect(isValidSubjectProgressSort(null)).toBe(false);
      expect(isValidSubjectProgressSort(undefined)).toBe(false);
    });
  });

  describe("sortSubjectProgress sorting logic", () => {
    const mockSubjects: SortableSubjectItem[] = [
      { key: "cn", label: "Computer Networks", coverageRate: 0.01, accuracyRate: 0.4 },
      { key: "dm", label: "Discrete Mathematics", coverageRate: 0.02, accuracyRate: 0.45 },
      { key: "dl", label: "Digital Logic", coverageRate: 0.09, accuracyRate: 0.61 },
      { key: "os", label: "Operating System", coverageRate: 0.29, accuracyRate: 0.66 },
    ];

    test("sorts by Coverage — Low to High (coverage_asc)", () => {
      const sorted = sortSubjectProgress(mockSubjects, "coverage_asc");
      expect(sorted.map((s) => s.label)).toEqual([
        "Computer Networks",
        "Discrete Mathematics",
        "Digital Logic",
        "Operating System",
      ]);
    });

    test("sorts by Coverage — High to Low (coverage_desc)", () => {
      const sorted = sortSubjectProgress(mockSubjects, "coverage_desc");
      expect(sorted.map((s) => s.label)).toEqual([
        "Operating System",
        "Digital Logic",
        "Discrete Mathematics",
        "Computer Networks",
      ]);
    });

    test("sorts by Accuracy — Low to High (accuracy_asc)", () => {
      const sorted = sortSubjectProgress(mockSubjects, "accuracy_asc");
      expect(sorted.map((s) => s.label)).toEqual([
        "Computer Networks",
        "Discrete Mathematics",
        "Digital Logic",
        "Operating System",
      ]);
    });

    test("sorts by Accuracy — High to Low (accuracy_desc)", () => {
      const sorted = sortSubjectProgress(mockSubjects, "accuracy_desc");
      expect(sorted.map((s) => s.label)).toEqual([
        "Operating System",
        "Digital Logic",
        "Discrete Mathematics",
        "Computer Networks",
      ]);
    });

    test("breaks ties deterministically by subject name alphabetically in both directions", () => {
      const tiedByAccuracy: SortableSubjectItem[] = [
        { key: "os", label: "Operating System", accuracyRate: 0.6, coverageRate: 0.2 },
        { key: "algo", label: "Algorithms", accuracyRate: 0.6, coverageRate: 0.1 },
        { key: "dbms", label: "Databases", accuracyRate: 0.6, coverageRate: 0.3 },
      ];

      // In accuracy_desc, all 3 are 60% accuracy -> must break tie alphabetically A-Z
      const descSorted = sortSubjectProgress(tiedByAccuracy, "accuracy_desc");
      expect(descSorted.map((s) => s.label)).toEqual([
        "Algorithms",
        "Databases",
        "Operating System",
      ]);

      // In accuracy_asc, all 3 are 60% accuracy -> must also break tie alphabetically A-Z
      const ascSorted = sortSubjectProgress(tiedByAccuracy, "accuracy_asc");
      expect(ascSorted.map((s) => s.label)).toEqual([
        "Algorithms",
        "Databases",
        "Operating System",
      ]);
    });

    test("breaks ties deterministically for coverage ties", () => {
      const tiedByCoverage: SortableSubjectItem[] = [
        { key: "toc", label: "Theory of Computation", coverageRate: 0.05, accuracyRate: 0.8 },
        { key: "compiler", label: "Compiler Design", coverageRate: 0.05, accuracyRate: 0.5 },
      ];

      const descSorted = sortSubjectProgress(tiedByCoverage, "coverage_desc");
      expect(descSorted.map((s) => s.label)).toEqual([
        "Compiler Design",
        "Theory of Computation",
      ]);

      const ascSorted = sortSubjectProgress(tiedByCoverage, "coverage_asc");
      expect(ascSorted.map((s) => s.label)).toEqual([
        "Compiler Design",
        "Theory of Computation",
      ]);
    });

    test("handles edge cases: 0% coverage, 100% coverage, missing accuracy", () => {
      const edgeSubjects: SortableSubjectItem[] = [
        { key: "zero", label: "Zero Subject", coverageRate: 0, accuracyRate: 0 },
        { key: "full", label: "Full Subject", coverageRate: 1.0, accuracyRate: 0.95 },
        { key: "no-acc", label: "No Accuracy", coverageRate: 0.5, accuracyRate: null },
        { key: "undef", label: "Undefined Rates", coverageRate: undefined, accuracyRate: undefined },
      ];

      const sortedCoverageDesc = sortSubjectProgress(edgeSubjects, "coverage_desc");
      expect(sortedCoverageDesc[0].label).toBe("Full Subject"); // 100%
      expect(sortedCoverageDesc[1].label).toBe("No Accuracy"); // 50%
      // 0% and undefined are 0%, tie break by label: "Undefined Rates" < "Zero Subject"
      expect(sortedCoverageDesc[2].label).toBe("Undefined Rates");
      expect(sortedCoverageDesc[3].label).toBe("Zero Subject");

      const sortedAccuracyDesc = sortSubjectProgress(edgeSubjects, "accuracy_desc");
      expect(sortedAccuracyDesc[0].label).toBe("Full Subject"); // 95%
      // All others are 0%: "No Accuracy", "Undefined Rates", "Zero Subject"
      expect(sortedAccuracyDesc[1].label).toBe("No Accuracy");
      expect(sortedAccuracyDesc[2].label).toBe("Undefined Rates");
      expect(sortedAccuracyDesc[3].label).toBe("Zero Subject");
    });

    test("handles empty and non-array inputs gracefully", () => {
      expect(sortSubjectProgress([])).toEqual([]);
      expect(sortSubjectProgress(null as any)).toEqual([]);
      expect(sortSubjectProgress(undefined as any)).toEqual([]);
    });

    test("does not mutate the original array", () => {
      const original = [...mockSubjects];
      const result = sortSubjectProgress(original, "coverage_desc");
      expect(result).not.toBe(original);
      expect(original[0].label).toBe("Computer Networks"); // Unchanged
    });
  });
});
