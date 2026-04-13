/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { FilterProvider } from "../contexts/FilterContext";
import { AnswerService } from "../services/AnswerService";
import { QuestionService } from "../services/QuestionService";

const mocks = vi.hoisted(() => ({
  startOrderedSession: vi.fn(),
  trackEvent: vi.fn(),
  writeLastSession: vi.fn(),
}));

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../components/Filters/FilterModal", () => ({
  default: ({ isOpen }) => (isOpen ? <div>Mock filter modal</div> : null),
}));

vi.mock("../components/Filters/FilterSidebar", async () => {
  const actual = await vi.importActual("../contexts/FilterContext");

  return {
    default: () => {
      const { updateFilters } = actual.useFilterActions();

      return (
        <div>
          <button
            type="button"
            onClick={() => updateFilters({ selectedSubjects: ["algorithms"] })}
          >
            Choose Algorithms
          </button>
          <button
            type="button"
            onClick={() => updateFilters({ selectedSubjects: ["operating-systems"] })}
          >
            Choose Operating Systems
          </button>
        </div>
      );
    },
  };
});

vi.mock("../components/Filters/ActiveFilterChips", async () => {
  const actual = await vi.importActual("../contexts/FilterContext");

  return {
    default: () => {
      const { filters } = actual.useFilterState();
      return (
        <div data-testid="active-filter-summary">
          {filters.selectedSubjects.join(",") || "none"} | {filters.searchQuery || "no-search"}
        </div>
      );
    },
  };
});

vi.mock("../components/Loaders/LoadingState", () => ({
  default: ({ label }) => <div>{label}</div>,
}));

vi.mock("../components/Practice/QuestionPickerList", () => ({
  default: ({ questions, onOpenQuestion }) => (
    <div>
      {questions.map((question) => (
        <article key={question.question_uid}>
          <span>{question.title}</span>
          <button type="button" onClick={() => onOpenQuestion(question)}>
            Open {question.question_uid}
          </button>
        </article>
      ))}
    </div>
  ),
}));

vi.mock("../components/Practice/PaginationControls", () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div>
      <span data-testid="pagination-state">
        {currentPage}/{totalPages}
      </span>
      <button type="button" onClick={() => onPageChange(currentPage + 1)}>
        Next page
      </button>
    </div>
  ),
}));

vi.mock("../contexts/SessionContext", () => ({
  useSession: () => ({
    startOrderedSession: mocks.startOrderedSession,
  }),
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: mocks.trackEvent,
}));

vi.mock("../utils/lastSession", () => ({
  writeLastSession: mocks.writeLastSession,
}));

import ExplorePage from "./ExplorePage";

const SAMPLE_QUESTIONS = [
  {
    question_uid: "go:algo-1",
    title: "Dijkstra shortest path",
    question: "<p>Question A</p>",
    searchText: "dijkstra graph path priority queue",
    subject: "Algorithms",
    subjectSlug: "algorithms",
    type: "mcq",
    exam: { year: 2025, yearSetKey: "2025-s1" },
  },
  {
    question_uid: "go:os-1",
    title: "Paging and segmentation",
    question: "<p>Question B</p>",
    searchText: "paging segmentation virtual memory pipeline",
    subject: "Operating Systems",
    subjectSlug: "operating-systems",
    type: "msq",
    exam: { year: 2024, yearSetKey: "2024-s1" },
  },
  {
    question_uid: "go:algo-2",
    title: "Dynamic programming states",
    question: "<p>Question C</p>",
    searchText: "dynamic programming recurrence memoization",
    subject: "Algorithms",
    subjectSlug: "algorithms",
    type: "nat",
    exam: { year: 2023, yearSetKey: "2023-s0" },
  },
];

const STRUCTURED_TAGS = {
  yearSets: [
    { key: "2025-s1", year: 2025, set: 1, label: "2025 Set 1", count: 1 },
    { key: "2024-s1", year: 2024, set: 1, label: "2024 Set 1", count: 1 },
    { key: "2023-s0", year: 2023, set: null, label: "2023", count: 1 },
  ],
  years: ["2025-s1", "2024-s1", "2023-s0"],
  subjects: [
    { slug: "algorithms", label: "Algorithms", count: 2 },
    { slug: "operating-systems", label: "Operating Systems", count: 1 },
  ],
  topics: ["algorithms", "operating-systems"],
  structuredSubtopics: {
    algorithms: [],
    "operating-systems": [],
  },
  structuredTopics: {
    Algorithms: [],
    "Operating Systems": [],
  },
  minYear: 2023,
  maxYear: 2025,
};

const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  );
};

const buildManifest = () => ({
  questionCount: SAMPLE_QUESTIONS.length,
  latestYear: 2025,
  yearSets: STRUCTURED_TAGS.yearSets,
  subjects: STRUCTURED_TAGS.subjects,
});

const renderExplorePage = ({
  route = "/practice",
  loading = false,
  error = "",
  hasQuestions = true,
  loadQuestions = vi.fn(),
} = {}) => {
  QuestionService.questions = hasQuestions ? SAMPLE_QUESTIONS.map((question) => ({ ...question })) : [];

  return {
    loadQuestions,
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <FilterProvider initialManifest={buildManifest()} questionDataRevision={1}>
          <LocationProbe />
          <Routes>
            <Route
              path="/practice"
              element={(
                <ExplorePage
                  loading={loading}
                  error={error}
                  loadQuestions={loadQuestions}
                  hasResumeRoute={false}
                  onResumePractice={vi.fn()}
                />
              )}
            />
            <Route path="/practice/question/:questionUid" element={<div>Solve route placeholder</div>} />
          </Routes>
        </FilterProvider>
      </MemoryRouter>
    ),
  };
};

describe("ExplorePage", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.startOrderedSession.mockReset();
    mocks.trackEvent.mockReset();
    mocks.writeLastSession.mockReset();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    vi.spyOn(QuestionService, "getStructuredTags").mockReturnValue(STRUCTURED_TAGS);
    vi.spyOn(AnswerService, "getStorageKeyForQuestion").mockImplementation((question) => question?.question_uid || "");
    vi.spyOn(AnswerService, "getAnswerForQuestion").mockImplementation((question) => (
      question?.type ? { type: question.type } : null
    ));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders the filter shell with the current result list", async () => {
    renderExplorePage();

    expect(await screen.findByRole("heading", { name: /explore questions/i })).toBeTruthy();
    expect(screen.getByText(/showing 1-3 of 3 · 3 total questions/i)).toBeTruthy();
    expect(screen.getByText("Dijkstra shortest path")).toBeTruthy();
    expect(screen.getByText("Paging and segmentation")).toBeTruthy();
  });

  test("opens the mobile filter modal from the filters button", async () => {
    renderExplorePage();

    fireEvent.click(await screen.findByRole("button", { name: /^filters$/i }));

    expect(screen.getByText("Mock filter modal")).toBeTruthy();
  });

  test("subject filter updates the URL and resets the page param", async () => {
    renderExplorePage({ route: "/practice?page=2" });

    fireEvent.click(await screen.findByRole("button", { name: /choose algorithms/i }));

    await waitFor(() => {
      expect(screen.getByTestId("location-probe").textContent).toBe("/practice?subjects=algorithms");
    });

    expect(screen.getByText("Dijkstra shortest path")).toBeTruthy();
    expect(screen.getByText("Dynamic programming states")).toBeTruthy();
    expect(screen.queryByText("Paging and segmentation")).toBeNull();
  });

  test("search filters the result list and syncs the search query to the URL", async () => {
    vi.useFakeTimers();
    renderExplorePage({ route: "/practice?page=2" });

    const searchInput = await screen.findByLabelText(/search questions/i);
    fireEvent.change(searchInput, { target: { value: "pipeline" } });

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByTestId("location-probe").textContent).toBe("/practice?search=pipeline");
    });

    expect(screen.getByText("Paging and segmentation")).toBeTruthy();
    expect(screen.queryByText("Dijkstra shortest path")).toBeNull();
  });

  test("no-match search shows the empty-state message and clearing search restores results", async () => {
    vi.useFakeTimers();
    renderExplorePage();

    const searchInput = await screen.findByLabelText(/search questions/i);
    fireEvent.change(searchInput, { target: { value: "no-match-token" } });

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(await screen.findByText(/no questions match these filters/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /clear search text/i }));

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("Dijkstra shortest path")).toBeTruthy();
    });
  });

  test("opening a question starts an ordered session and navigates to the solve route", async () => {
    renderExplorePage({ route: "/practice?subjects=algorithms" });

    fireEvent.click(await screen.findByRole("button", { name: /open go:algo-1/i }));

    await waitFor(() => {
      expect(screen.getByTestId("location-probe").textContent).toBe("/practice/question/go%3Aalgo-1?subjects=algorithms");
    });

    expect(mocks.startOrderedSession).toHaveBeenCalledTimes(1);
    expect(mocks.startOrderedSession.mock.calls[0][1]).toBe("go:algo-1");
  });

  test("shows the loading state while the question index is not initialized", async () => {
    renderExplorePage({ loading: true, hasQuestions: false });

    expect(await screen.findByText("Loading filter page...")).toBeTruthy();
  });

  test("shows the retry state when the explore page has a load error", async () => {
    const loadQuestions = vi.fn();
    renderExplorePage({ error: "Unable to load questions.", loadQuestions });

    fireEvent.click(await screen.findByRole("button", { name: /retry/i }));

    expect(screen.getByText("Unable to load questions.")).toBeTruthy();
    expect(loadQuestions).toHaveBeenCalledTimes(1);
  });
});
