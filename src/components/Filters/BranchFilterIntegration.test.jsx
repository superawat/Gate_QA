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

    // Redundant Enrolled Disciplines and Search bar are omitted from the filter window
    expect(screen.queryByText("Enrolled Disciplines")).toBeNull();
    expect(screen.queryByPlaceholderText("Search keywords...")).toBeNull();

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

    // Segmented switcher is omitted from the filter drawer
    expect(screen.queryByText("Enrolled Disciplines")).toBeNull();
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

  test("selecting General Aptitude on EC card triggers updateFilters with selectedGaBranches", () => {
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
        selectedGaBranches: [],
      },
      structuredTags: {
        subjects: [
          { slug: "ec-analog-circuits", label: "Analog Circuits" },
          { slug: "ga", label: "General Aptitude" },
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

    const gaCheckbox = screen.getByRole("checkbox", { name: "General Aptitude" });
    fireEvent.click(gaCheckbox);

    expect(mockUpdateFilters).toHaveBeenCalledWith({
      selectedGaBranches: ["ec"],
    });
  });

  test("activates Reset button when only selectedGaBranches is active", () => {
    writeBranchPreferences(["ec"], "ec");

    const mockClearFilters = vi.fn();
    const mockFilterState = {
      filteredQuestions: [],
      totalQuestions: 10,
      filters: {
        selectedTypes: ["MCQ", "MSQ", "NAT"],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedYearSets: [],
        selectedGaBranches: ["ec"],
      },
      structuredTags: {
        questionTypes: ["MCQ", "MSQ", "NAT"],
        subjects: [
          { slug: "ec-analog-circuits", label: "Analog Circuits" },
          { slug: "ga", label: "General Aptitude" },
        ],
      },
      isCseEnrolled: false,
      isEcEnrolled: true,
      includeEc: true,
      selectedBranches: ["ec"],
      activeBranch: "ec",
    };

    render(
      <BrowserRouter>
        <FilterStateContext.Provider value={mockFilterState}>
          <FilterActionsContext.Provider value={{ clearFilters: mockClearFilters, updateFilters: vi.fn() }}>
            <FilterSidebar />
          </FilterActionsContext.Provider>
        </FilterStateContext.Provider>
      </BrowserRouter>
    );

    const resetButton = screen.getByRole("button", { name: "Reset" });
    expect(resetButton).toBeDefined();
    expect(resetButton.disabled).toBe(false);

    fireEvent.click(resetButton);
    expect(mockClearFilters).toHaveBeenCalled();
  });

  test("selecting General Aptitude on CSE card triggers updateFilters with selectedGaBranches: ['cse']", () => {
    writeBranchPreferences(["cse"], "cse");

    const mockUpdateFilters = vi.fn();
    const mockFilterState = {
      filteredQuestions: [],
      totalQuestions: 10,
      filters: {
        selectedTypes: ["MCQ"],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedYearSets: [],
        selectedGaBranches: [],
      },
      structuredTags: {
        subjects: [
          { slug: "algorithms", label: "Algorithms" },
          { slug: "databases", label: "Databases" },
        ],
      },
      isCseEnrolled: true,
      includeCse: true,
      selectedBranches: ["cse"],
      activeBranch: "cse",
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

    const cseGaCheckbox = screen.getByRole("checkbox", { name: "General Aptitude for CSE" });
    expect(cseGaCheckbox).toBeDefined();
    fireEvent.click(cseGaCheckbox);

    expect(mockUpdateFilters).toHaveBeenCalledWith({
      selectedGaBranches: ["cse"],
    });
  });

  test("selecting General Aptitude on DA card triggers updateFilters with selectedSubjects: ['da:general-aptitude']", () => {
    writeBranchPreferences(["da"], "da");

    const mockUpdateFilters = vi.fn();
    const mockFilterState = {
      filteredQuestions: [],
      totalQuestions: 10,
      filters: {
        selectedTypes: ["MCQ"],
        selectedSubjects: [],
        selectedSubtopics: [],
        selectedYearSets: [],
        selectedGaBranches: [],
      },
      structuredTags: {
        subjects: [
          { slug: "da:probability-and-statistics", label: "Probability & Statistics" },
          { slug: "da:general-aptitude", label: "General Aptitude" },
        ],
      },
      isCseEnrolled: false,
      isDaEnrolled: true,
      includeDa: true,
      selectedBranches: ["da"],
      activeBranch: "da",
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

    const daGaCheckbox = screen.getByRole("checkbox", { name: "General Aptitude" });
    expect(daGaCheckbox).toBeDefined();
    fireEvent.click(daGaCheckbox);

    expect(mockUpdateFilters).toHaveBeenCalledWith({
      selectedSubjects: ["da:general-aptitude"],
    });
  });
});


