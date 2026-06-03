/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  loadHighPriorityTopicsDataset: vi.fn(),
}));

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../utils/highPriorityTopics", async () => {
  const actual = await vi.importActual("../utils/highPriorityTopics");
  return {
    ...actual,
    loadHighPriorityTopicsDataset: mocks.loadHighPriorityTopicsDataset,
  };
});

import HighPriorityTopicsPage from "./HighPriorityTopicsPage";

const sampleDataset = {
  sourceUrl: "https://gateoverflow.in/marks-distribution?type=subject-chart",
  startYear: 2007,
  latestYear: 2026,
  windowYears: 20,
  years: [2021, 2022, 2023, 2024, 2025, 2026],
  questionCount: 42,
  taggedTopicQuestionCount: 39,
  totalMarks: 63,
  paperCount: 8,
  yearTotals: [],
  subjects: [
    {
      key: "algorithms",
      label: "Algorithms",
      subjectSlug: "algorithms",
      subjectLabel: "Algorithms",
      questions: 15,
      totalMarks: 24,
      activeYears: 6,
      paperCount: 8,
      importanceScore: 96,
      rank: 1,
      priorityTier: "Core Priority",
      trendDirection: "up",
      trendDeltaMarks: 1.4,
      topTopics: [],
    },
  ],
  technicalSubjects: [
    {
      key: "algorithms",
      label: "Algorithms",
      shortLabel: "Algo",
      subjectSlug: "algorithms",
      subjectLabel: "Algorithms",
      questions: 15,
      totalMarks: 24,
      activeYears: 6,
      paperCount: 8,
      importanceScore: 96,
      rank: 1,
      priorityTier: "Core Priority",
      trendDirection: "up",
      trendDeltaMarks: 1.4,
      practiceUrl: "/practice?subjects=algorithms&hideSolved=1",
      yearSeries: [
        { year: 2021, questions: 1, marks: 2 },
        { year: 2022, questions: 0, marks: 0 },
        { year: 2023, questions: 2, marks: 3 },
        { year: 2024, questions: 1, marks: 2 },
        { year: 2025, questions: 2, marks: 3 },
        { year: 2026, questions: 2, marks: 3 },
      ],
      topTopics: [],
    },
  ],
  topics: [
    {
      key: "algorithms:dynamic-programming",
      label: "Dynamic Programming",
      subjectSlug: "algorithms",
      subjectLabel: "Algorithms",
      questions: 8,
      totalMarks: 13,
      activeYears: 5,
      paperCount: 7,
      importanceScore: 98,
      rank: 1,
      priorityTier: "Core Priority",
      trendDirection: "up",
      trendDeltaMarks: 1.4,
      recentAverageMarks: 2.2,
      previousAverageMarks: 0.8,
      practiceUrl: "/practice?subjects=algorithms&subtopics=dynamic-programming&hideSolved=1",
      yearSeries: [
        { year: 2021, questions: 1, marks: 2 },
        { year: 2022, questions: 0, marks: 0 },
        { year: 2023, questions: 2, marks: 3 },
        { year: 2024, questions: 1, marks: 2 },
        { year: 2025, questions: 2, marks: 3 },
        { year: 2026, questions: 2, marks: 3 },
      ],
    },
    {
      key: "algorithms:sorting",
      label: "Sorting",
      subjectSlug: "algorithms",
      subjectLabel: "Algorithms",
      questions: 7,
      totalMarks: 11,
      activeYears: 4,
      paperCount: 6,
      importanceScore: 78,
      rank: 2,
      priorityTier: "Core Priority",
      trendDirection: "flat",
      trendDeltaMarks: 0,
      practiceUrl: "/practice?subjects=algorithms&subtopics=sorting&hideSolved=1",
      yearSeries: [],
    },
  ],
  technicalTopics: [
    {
      key: "algorithms:dynamic-programming",
      label: "Dynamic Programming",
      subjectSlug: "algorithms",
      subjectLabel: "Algorithms",
      shortLabel: "Algo",
      questions: 8,
      totalMarks: 13,
      activeYears: 5,
      paperCount: 7,
      importanceScore: 98,
      rank: 1,
      priorityTier: "Core Priority",
      trendDirection: "up",
      trendDeltaMarks: 1.4,
      recentAverageMarks: 2.2,
      previousAverageMarks: 0.8,
      practiceUrl: "/practice?subjects=algorithms&subtopics=dynamic-programming&hideSolved=1",
      yearSeries: [
        { year: 2021, questions: 1, marks: 2 },
        { year: 2022, questions: 0, marks: 0 },
        { year: 2023, questions: 2, marks: 3 },
        { year: 2024, questions: 1, marks: 2 },
        { year: 2025, questions: 2, marks: 3 },
        { year: 2026, questions: 2, marks: 3 },
      ],
    },
    {
      key: "algorithms:sorting",
      label: "Sorting",
      subjectSlug: "algorithms",
      subjectLabel: "Algorithms",
      shortLabel: "Algo",
      questions: 7,
      totalMarks: 11,
      activeYears: 4,
      paperCount: 6,
      importanceScore: 78,
      rank: 2,
      priorityTier: "Core Priority",
      trendDirection: "flat",
      trendDeltaMarks: 0,
      practiceUrl: "/practice?subjects=algorithms&subtopics=sorting&hideSolved=1",
      yearSeries: [],
    },
  ],
  aptitudeTopics: [
    {
      key: "verbal-aptitude",
      label: "Verbal Aptitude",
      shortLabel: "Verbal",
      questions: 10,
      totalMarks: 15,
      practiceUrl: "/practice?subjects=ga&subtopics=verbal-aptitude&hideSolved=1",
      yearSeries: [],
    },
  ],
  officialPeriods: [
    { key: "2010-s0", shortLabel: "2010" },
    { key: "2026-s1", shortLabel: "2026-1" },
    { key: "2026-s2", shortLabel: "2026-2" },
  ],
  officialMarksItems: [
    {
      key: "official-row:algorithms",
      label: "Algorithms",
      paperSeries: [
        { key: "2010-s0", shortLabel: "2010", marks: 11 },
        { key: "2026-s1", shortLabel: "2026-1", marks: 16 },
        { key: "2026-s2", shortLabel: "2026-2", marks: 12 },
      ],
    },
    {
      key: "official-row:computer-networks",
      label: "Computer Networks",
      paperSeries: [
        { key: "2010-s0", shortLabel: "2010", marks: 7 },
        { key: "2026-s1", shortLabel: "2026-1", marks: 8 },
        { key: "2026-s2", shortLabel: "2026-2", marks: 9 },
      ],
    },
  ],
  officialDataValidation: {
    status: "valid",
    periodCount: 3,
    rowCount: 2,
    checkedCells: 6,
    checkedItems: 4,
    zeroOnlyRows: [],
    errorCount: 0,
    warningCount: 0,
    errors: [],
    warnings: [],
  },
};

const renderPage = () => render(
  <MemoryRouter>
    <HighPriorityTopicsPage />
  </MemoryRouter>
);

describe("HighPriorityTopicsPage", () => {
  beforeEach(() => {
    mocks.loadHighPriorityTopicsDataset.mockReset();
  });

  test("shows a loading state while the GATE CSE guide is building", () => {
    mocks.loadHighPriorityTopicsDataset.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/building gate cse topic guide/i)).toBeTruthy();
  });

  test("renders the simplified guide sections and practice link", async () => {
    mocks.loadHighPriorityTopicsDataset.mockResolvedValueOnce(sampleDataset);

    renderPage();

    expect(await screen.findByRole("heading", { name: /^high priority topics$/i })).toBeTruthy();
    expect(await screen.findByRole("heading", { name: /recent trends/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /subject marks over years/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /marks distribution between subjects/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /min\/avg\/max marks/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /recent paper snapshots/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /topic directory/i })).toBeTruthy();
    expect(screen.getByText(/aptitude is fixed at 10 questions and 15 marks/i)).toBeTruthy();
    expect(screen.getAllByText("Dynamic Programming").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Algo").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "2026-2" })).toBeTruthy();

    const dynamicProgrammingLinks = screen.getAllByRole("link", { name: /dynamic programming/i });
    expect(dynamicProgrammingLinks.some((link) => (
      link.getAttribute("href") === "/practice?subjects=algorithms&subtopics=dynamic-programming&hideSolved=1"
    ))).toBe(true);
  });

  test("filters technical topic directory by search text", async () => {
    mocks.loadHighPriorityTopicsDataset.mockResolvedValueOnce(sampleDataset);

    renderPage();

    expect((await screen.findAllByText("Dynamic Programming")).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByPlaceholderText(/search technical topics or subjects/i), {
      target: { value: "sorting" },
    });

    const directory = screen.getByRole("heading", { name: /technical topics/i }).closest("div").parentElement;
    expect(within(directory).getAllByText("Sorting").length).toBeGreaterThan(0);
    expect(within(directory).queryByText("Dynamic Programming")).toBeNull();
  });

  test("shows an error banner when topic data cannot be loaded", async () => {
    mocks.loadHighPriorityTopicsDataset.mockRejectedValueOnce(new Error("Topic data failed"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Topic data failed")).toBeTruthy();
    });
  });

  test("supports interactive charts toggling subjects, periods, and metrics", async () => {
    mocks.loadHighPriorityTopicsDataset.mockResolvedValueOnce(sampleDataset);

    renderPage();

    expect(await screen.findByRole("heading", { name: /^high priority topics$/i })).toBeTruthy();
    
    // Use custom text matcher function for elements containing split text content
    expect(await screen.findByText((content, element) => (
      element?.textContent === "1 selected: Algorithms"
    ))).toBeTruthy();

    const cnButton = screen.getByRole("button", { name: /computer networks/i });
    fireEvent.click(cnButton);

    expect(await screen.findByText((content, element) => (
      element?.textContent === "2 selected: Algorithms, Computer Networks"
    ))).toBeTruthy();

    const algoButton = screen.getByRole("button", { name: /algorithms/i });
    fireEvent.click(algoButton);

    expect(await screen.findByText((content, element) => (
      element?.textContent === "1 selected: Computer Networks"
    ))).toBeTruthy();

    const periodButton = screen.getByRole("button", { name: "2010" });
    fireEvent.click(periodButton);

    const maxButton = screen.getByRole("button", { name: "Max" });
    fireEvent.click(maxButton);

    const avgButton = screen.getByRole("button", { name: "Avg" });
    fireEvent.click(avgButton);
  });
});
