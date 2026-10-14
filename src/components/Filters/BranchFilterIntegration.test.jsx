/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";
import { FilterStateContext, FilterActionsContext } from "../../contexts/FilterContext";
import { writeBranchPreferences, readBranchPreferences } from "../../utils/branchPreference";

describe("BranchFilterIntegration in FilterSidebar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders both CSE and EC (ECE) filter cards and segmented switcher when both are enrolled", () => {
    writeBranchPreferences(["ec", "cse"], "ec");

    const mockFilterState = {
      filteredQuestions: [1, 2, 3],
      totalQuestions: 10,
      filters: {
        selectedTypes: ["MCQ", "MSQ", "NAT"],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedYearSets: [],
        yearRange: [2001, 2026],
        searchQuery: "",
        hideSolved: false,
        showOnlySolved: false,
        showOnlyBookmarked: false,
      },
      structuredTags: {
        questionTypes: ["MCQ", "MSQ", "NAT"],
        subjects: [
          { slug: "ec-analog-circuits", label: "Analog Circuits" },
          { slug: "ec-communication-systems", label: "Communication Systems" },
          { slug: "algorithms", label: "Algorithms" },
        ],
        structuredSubtopics: {
          "ec-analog-circuits": [{ slug: "diodes", label: "Diode Circuits" }],
        },
        minYear: 2001,
        maxYear: 2026,
      },
      isCseEnrolled: true,
      isDaEnrolled: false,
      isEcEnrolled: true,
      isEeEnrolled: false,
      isMeEnrolled: false,
      isCeEnrolled: false,
      includeCse: true,
      includeEc: true,
      selectedBranches: ["ec", "cse"],
      activeBranch: "ec",
    };

    const mockFilterActions = {
      updateFilters: vi.fn(),
      clearFilters: vi.fn(),
      setHideSolved: vi.fn(),
      setShowOnlyBookmarked: vi.fn(),
      setShowOnlySolved: vi.fn(),
      setIncludeCse: vi.fn(),
      setIncludeEc: vi.fn(),
    };

    render(
      <BrowserRouter>
        <FilterStateContext.Provider value={mockFilterState}>
          <FilterActionsContext.Provider value={mockFilterActions}>
            <FilterSidebar />
          </FilterActionsContext.Provider>
        </FilterStateContext.Provider>
      </BrowserRouter>
    );

    // Both GATE CSE and GATE EC (ECE) must be present in filters
    expect(screen.getByText("GATE CSE")).toBeDefined();
    expect(screen.getByText("GATE EC (ECE)")).toBeDefined();

    // Non-enrolled branches must NOT be present
    expect(screen.queryByText("GATE DA")).toBeNull();
    expect(screen.queryByText("GATE EE")).toBeNull();
    expect(screen.queryByText("GATE ME")).toBeNull();
    expect(screen.queryByText("GATE CE")).toBeNull();

    // Segmented discipline switcher at top of filter panel
    expect(screen.getByText("Enrolled Disciplines")).toBeDefined();
    const eceButton = screen.getByRole("button", { name: "ECE" });
    const cseButton = screen.getByRole("button", { name: "CSE" });
    expect(eceButton).toBeDefined();
    expect(cseButton).toBeDefined();

    // Clicking CSE in switcher sets active branch
    fireEvent.click(cseButton);
    const pref = readBranchPreferences();
    expect(pref.activeBranch).toBe("cse");

    // EC subjects should be rendered in the EC section
    expect(screen.getByText("Analog Circuits")).toBeDefined();
    expect(screen.getByText("Communication Systems")).toBeDefined();
  });

  test("hides CSE when only EC is enrolled", () => {
    writeBranchPreferences(["ec"], "ec");

    const mockFilterState = {
      filteredQuestions: [],
      totalQuestions: 5,
      filters: {
        selectedTypes: ["MCQ"],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedYearSets: [],
      },
      structuredTags: {
        subjects: [{ slug: "ec-analog-circuits", label: "Analog Circuits" }],
      },
      isCseEnrolled: false,
      isDaEnrolled: false,
      isEcEnrolled: true,
      includeEc: true,
      selectedBranches: ["ec"],
      activeBranch: "ec",
    };

    render(
      <BrowserRouter>
        <FilterStateContext.Provider value={mockFilterState}>
          <FilterActionsContext.Provider value={{ updateFilters: vi.fn() }}>
            <FilterSidebar />
          </FilterActionsContext.Provider>
        </FilterStateContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("GATE EC (ECE)")).toBeDefined();
    expect(screen.queryByText("GATE CSE")).toBeNull();
    expect(screen.queryByText("Enrolled Disciplines")).toBeNull(); // Single branch doesn't need segmented switcher
  });

  test("renders EE and ME filter cards when ee and me are enrolled", () => {
    writeBranchPreferences(["ee", "me"], "ee");

    const mockFilterState = {
      filteredQuestions: [],
      totalQuestions: 5,
      filters: {
        selectedTypes: ["MCQ"],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedYearSets: [],
      },
      structuredTags: {
        subjects: [
          { slug: "ee-power-systems", label: "Power Systems" },
          { slug: "me-thermodynamics", label: "Thermodynamics" },
        ],
      },
      isCseEnrolled: false,
      isDaEnrolled: false,
      isEcEnrolled: false,
      isEeEnrolled: true,
      isMeEnrolled: true,
      isCeEnrolled: false,
      includeEe: true,
      includeMe: true,
      selectedBranches: ["ee", "me"],
      activeBranch: "ee",
    };

    render(
      <BrowserRouter>
        <FilterStateContext.Provider value={mockFilterState}>
          <FilterActionsContext.Provider value={{ updateFilters: vi.fn() }}>
            <FilterSidebar />
          </FilterActionsContext.Provider>
        </FilterStateContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("GATE EE")).toBeDefined();
    expect(screen.getByText("GATE ME")).toBeDefined();
    expect(screen.queryByText("GATE CSE")).toBeNull();
    expect(screen.queryByText("GATE EC (ECE)")).toBeNull();

    // Segmented switcher has EE and ME
    expect(screen.getByRole("button", { name: "EE" })).toBeDefined();
    expect(screen.getByRole("button", { name: "ME" })).toBeDefined();
  });

  test("selecting an EC subject inside FilterSidebar triggers updateFilters with ec subject slug", () => {
    writeBranchPreferences(["ec", "cse"], "ec");

    const mockUpdateFilters = vi.fn();
    const mockFilterState = {
      filteredQuestions: [],
      totalQuestions: 10,
      filters: {
        selectedTypes: ["MCQ"],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedYearSets: [],
      },
      structuredTags: {
        subjects: [
          { slug: "ec-analog-circuits", label: "Analog Circuits" },
        ],
      },
      isCseEnrolled: true,
      isEcEnrolled: true,
      includeCse: true,
      includeEc: true,
      selectedBranches: ["ec", "cse"],
      activeBranch: "ec",
    };

    render(
      <BrowserRouter>
        <FilterStateContext.Provider value={mockFilterState}>
          <FilterActionsContext.Provider value={{ updateFilters: mockUpdateFilters }}>
            <FilterSidebar />
          </FilterActionsContext.Provider>
        </FilterStateContext.Provider>
      </BrowserRouter>
    );

    const analogCheckbox = screen.getByRole("checkbox", { name: /Analog Circuits/i });
    fireEvent.click(analogCheckbox);

    expect(mockUpdateFilters).toHaveBeenCalledWith({
      selectedSubjects: ["ec-analog-circuits"],
    });
  });
});

