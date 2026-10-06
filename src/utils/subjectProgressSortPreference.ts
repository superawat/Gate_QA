import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export type SubjectProgressSortOption =
  | "coverage_desc"
  | "coverage_asc"
  | "accuracy_desc"
  | "accuracy_asc";

export interface SubjectProgressSortMeta {
  id: SubjectProgressSortOption;
  label: string;
  shortLabel: string;
  metric: "coverage" | "accuracy";
  direction: "asc" | "desc";
}

export const SUBJECT_PROGRESS_SORT_STORAGE_KEY = "gateqa_subject_progress_sort";
export const SUBJECT_PROGRESS_SORT_CHANGE_EVENT = "gateqa:subject-progress-sort-change";

export const DEFAULT_SUBJECT_PROGRESS_SORT: SubjectProgressSortOption = "coverage_desc";

export const SUBJECT_PROGRESS_SORT_OPTIONS: readonly SubjectProgressSortMeta[] = Object.freeze([
  {
    id: "coverage_desc",
    label: "Coverage — High to Low",
    shortLabel: "Coverage ↓",
    metric: "coverage",
    direction: "desc",
  },
  {
    id: "coverage_asc",
    label: "Coverage — Low to High",
    shortLabel: "Coverage ↑",
    metric: "coverage",
    direction: "asc",
  },
  {
    id: "accuracy_desc",
    label: "Accuracy — High to Low",
    shortLabel: "Accuracy ↓",
    metric: "accuracy",
    direction: "desc",
  },
  {
    id: "accuracy_asc",
    label: "Accuracy — Low to High",
    shortLabel: "Accuracy ↑",
    metric: "accuracy",
    direction: "asc",
  },
]);

const VALID_SORT_OPTIONS = new Set<string>(
  SUBJECT_PROGRESS_SORT_OPTIONS.map((opt) => opt.id)
);

export function isValidSubjectProgressSort(
  value: unknown
): value is SubjectProgressSortOption {
  return typeof value === "string" && VALID_SORT_OPTIONS.has(value);
}

export function getSubjectProgressSortMeta(
  option: SubjectProgressSortOption
): SubjectProgressSortMeta {
  const found = SUBJECT_PROGRESS_SORT_OPTIONS.find((opt) => opt.id === option);
  return found || SUBJECT_PROGRESS_SORT_OPTIONS[0];
}

export function readSubjectProgressSort(): SubjectProgressSortOption {
  if (typeof window === "undefined") {
    return DEFAULT_SUBJECT_PROGRESS_SORT;
  }
  try {
    const raw = window.localStorage.getItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY);
    if (isValidSubjectProgressSort(raw)) {
      return raw;
    }
  } catch {
    // Storage access blocked or unavailable
  }
  return DEFAULT_SUBJECT_PROGRESS_SORT;
}

export function writeSubjectProgressSort(
  option: SubjectProgressSortOption
): SubjectProgressSortOption {
  const safeOption = isValidSubjectProgressSort(option)
    ? option
    : DEFAULT_SUBJECT_PROGRESS_SORT;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SUBJECT_PROGRESS_SORT_STORAGE_KEY, safeOption);
    } catch {
      // Storage quota or privacy mode blocked
    }
    window.dispatchEvent(
      new CustomEvent(SUBJECT_PROGRESS_SORT_CHANGE_EVENT, {
        detail: { option: safeOption },
      })
    );
  }
  return safeOption;
}

export function useSubjectProgressSort(): [
  SubjectProgressSortOption,
  Dispatch<SetStateAction<SubjectProgressSortOption>>
] {
  const [sortOption, setLocalSortOption] = useState<SubjectProgressSortOption>(() =>
    readSubjectProgressSort()
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncFromStorage = () => {
      setLocalSortOption(readSubjectProgressSort());
    };

    const syncFromEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ option?: unknown }>).detail;
      if (isValidSubjectProgressSort(detail?.option)) {
        setLocalSortOption(detail.option);
      } else {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(SUBJECT_PROGRESS_SORT_CHANGE_EVENT, syncFromEvent);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(SUBJECT_PROGRESS_SORT_CHANGE_EVENT, syncFromEvent);
    };
  }, []);

  const setSortOption = useCallback<Dispatch<SetStateAction<SubjectProgressSortOption>>>(
    (nextValue) => {
      setLocalSortOption((prev) => {
        const resolved =
          typeof nextValue === "function" ? nextValue(prev) : nextValue;
        return writeSubjectProgressSort(resolved);
      });
    },
    []
  );

  return [sortOption, setSortOption];
}

export interface SortableSubjectItem {
  key?: string;
  label?: string;
  coverageRate?: number | string | null;
  accuracyRate?: number | string | null;
  attemptedQuestions?: number;
  availableQuestions?: number;
  [key: string]: any;
}

/**
 * Sorts subject progress items by Coverage or Accuracy, with deterministic A-Z tie breaking.
 * Preserves the original list if input is empty or invalid. Does not mutate the source array.
 */
export function sortSubjectProgress<T extends SortableSubjectItem>(
  subjects: T[] = [],
  sortOption: SubjectProgressSortOption = DEFAULT_SUBJECT_PROGRESS_SORT
): T[] {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return [];
  }

  const option = isValidSubjectProgressSort(sortOption)
    ? sortOption
    : DEFAULT_SUBJECT_PROGRESS_SORT;

  const isAsc = option.endsWith("_asc");
  const isCoverage = option.startsWith("coverage");

  return [...subjects].sort((a, b) => {
    const labelA = String(a?.label || a?.key || "");
    const labelB = String(b?.label || b?.key || "");

    if (isCoverage) {
      const covA = Math.round((Number(a?.coverageRate) || 0) * 100);
      const covB = Math.round((Number(b?.coverageRate) || 0) * 100);
      if (covA !== covB) {
        return isAsc ? covA - covB : covB - covA;
      }
      // Deterministic tie-breaking: alphabetical A-Z in both asc and desc
      return labelA.localeCompare(labelB);
    } else {
      const accA = Math.round((Number(a?.accuracyRate) || 0) * 100);
      const accB = Math.round((Number(b?.accuracyRate) || 0) * 100);
      if (accA !== accB) {
        return isAsc ? accA - accB : accB - accA;
      }
      // Deterministic tie-breaking: alphabetical A-Z in both asc and desc
      return labelA.localeCompare(labelB);
    }
  });
}
