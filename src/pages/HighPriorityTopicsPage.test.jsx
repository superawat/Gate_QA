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

  test("shows a loading state while the GateOverflow dataset is building", () => {
    mocks.loadHighPriorityTopicsDataset.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/building gateoverflow topic frequencies/i)).toBeTruthy();
  });

  test("renders the 20-year summary, rankings, and practice link", async () => {
    mocks.loadHighPriorityTopicsDataset.mockResolvedValueOnce(sampleDataset);

    renderPage();

    expect(await screen.findByRole("heading", { name: /20-year gate cs frequency map/i })).toBeTruthy();
    expect(await screen.findByText("2007-2026")).toBeTruthy();
    expect(screen.getAllByText("Dynamic Programming").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/core priority/i).length).toBeGreaterThan(0);

    const practiceLinks = screen.getAllByRole("link", { name: /practice/i });
    expect(practiceLinks[0].getAttribute("href")).toBe("/practice?subjects=algorithms&subtopics=dynamic-programming&hideSolved=1");
  });

  test("filters the ranking list by search text", async () => {
    mocks.loadHighPriorityTopicsDataset.mockResolvedValueOnce(sampleDataset);

    renderPage();

    expect((await screen.findAllByText("Dynamic Programming")).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByPlaceholderText(/search topics or subjects/i), {
      target: { value: "sorting" },
    });

    const ranking = screen.getByText(/priority ranking/i).closest("section");
    expect(within(ranking).getAllByText("Sorting").length).toBeGreaterThan(0);
    expect(within(ranking).queryByText("Dynamic Programming")).toBeNull();
  });

  test("shows an error banner when topic data cannot be loaded", async () => {
    mocks.loadHighPriorityTopicsDataset.mockRejectedValueOnce(new Error("Topic data failed"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Topic data failed")).toBeTruthy();
    });
  });
});
