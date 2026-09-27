/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import IsroToggle from "./IsroToggle";
import * as FilterContextModule from "../../contexts/FilterContext";

describe("IsroToggle", () => {
  const mockUpdateFilters = vi.fn();
  const mockSetIncludeIsro = vi.fn();

  const baseFilterState = {
    includeIsro: true,
    isroLoading: false,
    isroError: "",
    structuredTags: {
      subjects: [
        { slug: "isro:algorithms", label: "Algorithms", count: 120 },
        { slug: "isro:os", label: "Operating System", count: 95 },
      ],
      structuredSubtopics: {
        "isro:algorithms": [
          { slug: "dynamic-programming", label: "Dynamic Programming" },
          { slug: "sorting", label: "Sorting" },
        ],
        "isro:os": [
          { slug: "paging", label: "Paging" },
        ],
      },
    },
    filters: {
      selectedSubjects: [],
      selectedSubtopics: [],
    },
  };

  const setup = (overrides = {}) => {
    vi.spyOn(FilterContextModule, "useFilterState").mockReturnValue({
      ...baseFilterState,
      ...overrides,
    });
    vi.spyOn(FilterContextModule, "useFilterActions").mockReturnValue({
      updateFilters: mockUpdateFilters,
      setIncludeIsro: mockSetIncludeIsro,
    });

    return render(<IsroToggle />);
  };

  test("renders toggle with title and call setIncludeIsro on toggle change", () => {
    setup({ includeIsro: false });

    const toggleCheckbox = screen.getByRole("checkbox", { name: /ISRO CS questions/i });
    expect(toggleCheckbox).toBeTruthy();
    expect(toggleCheckbox.checked).toBe(false);

    fireEvent.click(toggleCheckbox);
    expect(mockSetIncludeIsro).toHaveBeenCalledWith(true);
  });

  test("renders ISRO subjects when includeIsro is true", () => {
    setup({ includeIsro: true });

    expect(screen.getByText("Algorithms")).toBeTruthy();
    expect(screen.getByText("Operating System")).toBeTruthy();
  });

  test("selecting an ISRO subject triggers updateFilters with the subject slug", () => {
    setup({
      includeIsro: true,
      filters: { selectedSubjects: [], selectedSubtopics: [] },
    });

    const algorithmsCheckbox = screen.getByLabelText(/Algorithms/i);
    fireEvent.click(algorithmsCheckbox);

    expect(mockUpdateFilters).toHaveBeenCalledWith({
      selectedSubjects: ["isro:algorithms"],
    });
  });

  test("shows subtopics when subject is selected and expanded", () => {
    setup({
      includeIsro: true,
      filters: {
        selectedSubjects: ["isro:algorithms"],
        selectedSubtopics: ["dynamic-programming"],
      },
    });

    expect(screen.getByText("Dynamic Programming")).toBeTruthy();
    expect(screen.getByText("Sorting")).toBeTruthy();

    const sortingCheckbox = screen.getByLabelText("Sorting");
    fireEvent.click(sortingCheckbox);

    expect(mockUpdateFilters).toHaveBeenCalledWith({
      selectedSubtopics: ["dynamic-programming", "sorting"],
    });
  });

  test("select all and clear all subtopics for a subject", () => {
    setup({
      includeIsro: true,
      filters: {
        selectedSubjects: ["isro:algorithms"],
        selectedSubtopics: ["dynamic-programming"],
      },
    });

    const selectAllBtn = screen.getByRole("button", { name: /select all algorithms subtopics/i });
    fireEvent.click(selectAllBtn);

    expect(mockUpdateFilters).toHaveBeenCalledWith({
      selectedSubtopics: ["dynamic-programming", "sorting"],
    });
  });
});
