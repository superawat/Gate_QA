/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import BranchTopicFilter from "./BranchTopicFilter";
import { FilterStateContext, FilterActionsContext } from "../../contexts/FilterContext";

describe("BranchTopicFilter", () => {
  const createMockState = (overrides = {}) => ({
    includeEc: true,
    ecLoading: false,
    ecError: "",
    includeEe: true,
    eeLoading: false,
    eeError: "",
    filters: {
      selectedSubjects: [],
      selectedSubtopics: [],
    },
    structuredTags: {
      subjects: [
        { slug: "ec-analog-circuits", label: "Analog Circuits", count: 120 },
        { slug: "ec-signals-and-systems", label: "Signals & Systems", count: 95 },
        { slug: "ee-power-systems", label: "Power Systems", count: 80 },
        { slug: "algorithms", label: "Algorithms", count: 300 },
      ],
      structuredSubtopics: {
        "ec-analog-circuits": [
          { slug: "diodes", label: "Diodes" },
          { slug: "bjt-biasing", label: "BJT Biasing" },
        ],
      },
    },
    ...overrides,
  });

  const createMockActions = (overrides = {}) => ({
    setIncludeEc: vi.fn(),
    setIncludeEe: vi.fn(),
    updateFilters: vi.fn(),
    ...overrides,
  });

  test("renders EC header, subtitle, and filtered subjects", () => {
    const mockState = createMockState();
    const mockActions = createMockActions();

    render(
      <FilterStateContext.Provider value={mockState}>
        <FilterActionsContext.Provider value={mockActions}>
          <BranchTopicFilter branch="ec" />
        </FilterActionsContext.Provider>
      </FilterStateContext.Provider>
    );

    expect(screen.getByText("GATE EC (ECE)")).toBeDefined();
    expect(screen.getByText("Electronics & Communication questions")).toBeDefined();
    expect(screen.getByText("Analog Circuits")).toBeDefined();
    expect(screen.getByText("Signals & Systems")).toBeDefined();
    // Non-EC subjects should not appear in EC filter
    expect(screen.queryByText("Power Systems")).toBeNull();
    expect(screen.queryByText("Algorithms")).toBeNull();
  });

  test("renders EE title and subjects when branch='ee'", () => {
    const mockState = createMockState();
    const mockActions = createMockActions();

    render(
      <FilterStateContext.Provider value={mockState}>
        <FilterActionsContext.Provider value={mockActions}>
          <BranchTopicFilter branch="ee" />
        </FilterActionsContext.Provider>
      </FilterStateContext.Provider>
    );

    expect(screen.getByText("GATE EE")).toBeDefined();
    expect(screen.getByText("Electrical Engineering questions")).toBeDefined();
    expect(screen.getByText("Power Systems")).toBeDefined();
    expect(screen.queryByText("Analog Circuits")).toBeNull();
  });

  test("toggles include branch when switch is clicked", () => {
    const mockState = createMockState();
    const mockActions = createMockActions();

    render(
      <FilterStateContext.Provider value={mockState}>
        <FilterActionsContext.Provider value={mockActions}>
          <BranchTopicFilter branch="ec" />
        </FilterActionsContext.Provider>
      </FilterStateContext.Provider>
    );

    const toggle = screen.getByRole("checkbox", { name: "GATE EC (ECE) questions" });
    fireEvent.click(toggle);

    expect(mockActions.setIncludeEc).toHaveBeenCalledWith(false);
  });

  test("selects and deselects subject invoking updateFilters", () => {
    const mockState = createMockState();
    const mockActions = createMockActions();

    render(
      <FilterStateContext.Provider value={mockState}>
        <FilterActionsContext.Provider value={mockActions}>
          <BranchTopicFilter branch="ec" />
        </FilterActionsContext.Provider>
      </FilterStateContext.Provider>
    );

    const subjectCheckbox = screen.getByRole("checkbox", { name: /Analog Circuits/i });
    fireEvent.click(subjectCheckbox);

    expect(mockActions.updateFilters).toHaveBeenCalledWith({
      selectedSubjects: ["ec-analog-circuits"],
    });
  });

  test("expands subtopics and allows selecting subtopics", () => {
    const mockState = createMockState({
      filters: {
        selectedSubjects: ["ec-analog-circuits"],
        selectedSubtopics: [],
      },
    });
    const mockActions = createMockActions();

    render(
      <FilterStateContext.Provider value={mockState}>
        <FilterActionsContext.Provider value={mockActions}>
          <BranchTopicFilter branch="ec" />
        </FilterActionsContext.Provider>
      </FilterStateContext.Provider>
    );

    // Subtopics should now be visible or expandable
    expect(screen.getByText("Diodes")).toBeDefined();
    expect(screen.getByText("BJT Biasing")).toBeDefined();

    const diodeCheckbox = screen.getByRole("checkbox", { name: /Diodes/i });
    fireEvent.click(diodeCheckbox);

    expect(mockActions.updateFilters).toHaveBeenCalledWith({
      selectedSubtopics: ["diodes"],
    });
  });

  test("renders loading state when ecLoading is true", () => {
    const mockState = createMockState({ ecLoading: true });
    const mockActions = createMockActions();

    render(
      <FilterStateContext.Provider value={mockState}>
        <FilterActionsContext.Provider value={mockActions}>
          <BranchTopicFilter branch="ec" />
        </FilterActionsContext.Provider>
      </FilterStateContext.Provider>
    );

    expect(screen.getByText("Loading EC papers...")).toBeDefined();
  });

  test("renders error message when ecError is provided", () => {
    const mockState = createMockState({ ecError: "Failed to load EC questions index" });
    const mockActions = createMockActions();

    render(
      <FilterStateContext.Provider value={mockState}>
        <FilterActionsContext.Provider value={mockActions}>
          <BranchTopicFilter branch="ec" />
        </FilterActionsContext.Provider>
      </FilterStateContext.Provider>
    );

    expect(screen.getByText("Failed to load EC questions index")).toBeDefined();
  });
});
