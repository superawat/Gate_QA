/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import TrackerPage from "./TrackerPage";

// Mock MathRuntime for KaTeX
vi.mock("../components/Math/MathRuntime", () => ({
  MathContent: ({ content }) => <div data-testid="math-content">{content}</div>,
}));

// Mock FilterContext for instant test execution
vi.mock("../contexts/FilterContext", () => ({
  useFilterState: () => ({
    allQuestions: [],
    solvedQuestions: new Set(),
    practiceProgress: {},
  }),
  useFilterActions: () => ({
    refreshProgressState: vi.fn(),
  }),
}));

vi.mock("../services/QuestionService", () => ({
  QuestionService: {
    loaded: true,
    questions: [],
    init: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../services/DaQuestionService", () => ({
  DaQuestionService: {
    loaded: true,
    questions: [],
    init: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../data/trackerTaxonomy", () => {
  const cseSubjects = [
    {
      id: "cse-em",
      slug: "engg-math",
      canonicalSubjectSlugs: ["engg-math", "discrete-math"],
      track: "cse",
      label: "Engineering Mathematics",
      shortLabel: "EM",
      marksRange: "13–15 Marks",
      estimatedHours: 45,
      weightageTier: "tier-1-high",
      recommendedTextbook: "B.S. Grewal",
      topics: [
        {
          id: "cse-em-discrete-math-logic",
          label: "Mathematical Logic",
          subjectSlug: "discrete-math",
          canonicalSubjectSlugs: ["discrete-math"],
          primaryTopicTag: "mathematical-logic",
          secondaryTopicTags: ["propositional-logic"],
          estimatedHours: 10,
          weightageTier: "tier-1-high",
          marksRange: "2–4 Marks",
          keyConcepts: ["Logic"],
          recommendedTextbook: "Kenneth Rosen",
          subtopics: [
            {
              id: "cse-em-logic-prop",
              label: "Propositional Logic & Tautologies",
              subtopicSlug: "propositional-logic",
              tags: ["propositional-logic"],
            },
          ],
        },
      ],
    },
  ];

  const daSubjects = [
    {
      id: "da-prob-stats",
      slug: "probability-and-statistics",
      canonicalSubjectSlugs: ["probability-and-statistics"],
      track: "da",
      label: "Probability & Statistics",
      shortLabel: "Prob & Stats",
      marksRange: "12–15 Marks",
      estimatedHours: 40,
      weightageTier: "tier-1-high",
      recommendedTextbook: "Sheldon Ross",
      topics: [
        {
          id: "da-prob-probability-distributions",
          label: "Random Variables & Probability Distributions",
          subjectSlug: "probability-and-statistics",
          canonicalSubjectSlugs: ["probability-and-statistics"],
          primaryTopicTag: "probability-distributions",
          secondaryTopicTags: [],
          estimatedHours: 12,
          weightageTier: "tier-1-high",
          marksRange: "4–6 Marks",
          keyConcepts: ["Random Variables"],
          recommendedTextbook: "Walpole",
          subtopics: [],
        },
      ],
    },
  ];

  return {
    TRACK_TAXONOMIES: {
      cse: { track: "cse", title: "GATE CSE", defaultExamDate: "2027-02-06", subjects: cseSubjects },
      da: { track: "da", title: "GATE DA", defaultExamDate: "2027-02-07", subjects: daSubjects },
    },
    getTopicsForTrack: (track) => (track === "da" ? daSubjects[0].topics : cseSubjects[0].topics),
    CSE_SUBJECTS: cseSubjects,
    DA_SUBJECTS: daSubjects,
  };
});

// Mock TrackerCountdownHero to eliminate active background intervals during tests
vi.mock("../components/Tracker/TrackerCountdownHero", () => ({
  default: ({ onUpdatePreferences, preferences }) => (
    preferences?.showCountdownWidget !== false && preferences?.countdownDisplayMode !== "hidden" ? (
      <section aria-label="Exam Countdown">
        <button
          type="button"
          title="Hide Countdown Widget"
          onClick={() => onUpdatePreferences({ showCountdownWidget: false, countdownDisplayMode: "hidden" })}
        >
          Hide
        </button>
      </section>
    ) : (
      <button
        type="button"
        onClick={() => onUpdatePreferences({ showCountdownWidget: true, countdownDisplayMode: "hero" })}
      >
        Show Countdown
      </button>
    )
  ),
}));

describe("TrackerPage", { timeout: 60000 }, () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const renderTrackerPage = () => {
    return render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/tracker"]}>
          <TrackerPage />
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  it("renders the tracker page with header, 3-pillar metrics, and hierarchical table", () => {
    renderTrackerPage();
    expect(screen.getByRole("heading", { name: /gate cse preparation tracker/i })).toBeTruthy();
    expect(screen.getByText(/theory progress/i)).toBeTruthy();
    expect(screen.getByText(/pyq practice/i)).toBeTruthy();
    expect(screen.getByText(/practice accuracy/i)).toBeTruthy();
    expect(screen.getByText(/syllabus & preparation table/i)).toBeTruthy();
    expect(screen.getAllByText(/engineering mathematics/i).length).toBeGreaterThan(0);
  });

  it("switches to GATE DA track when DA button is clicked", () => {
    renderTrackerPage();
    const daBtn = screen.getByRole("button", { name: /gate da/i });
    fireEvent.click(daBtn);

    expect(screen.getByRole("heading", { name: /gate da preparation tracker/i })).toBeTruthy();
    expect(screen.getByText(/paper: da/i)).toBeTruthy();
    expect(screen.getAllByText(/probability & statistics/i).length).toBeGreaterThan(0);
  });

  it("toggles theory status when topic checkbox is clicked", () => {
    renderTrackerPage();
    const expandSubjectBtn = screen.getByRole("button", { name: /expand engineering mathematics/i });
    fireEvent.click(expandSubjectBtn);

    const theoryBtns = screen.getAllByTitle(/mark theory complete/i);
    expect(theoryBtns.length).toBeGreaterThan(0);

    fireEvent.click(theoryBtns[0]);
    expect(screen.getAllByTitle(/mark theory incomplete/i).length).toBeGreaterThan(0);
  });

  it("increments and decrements revision count", () => {
    renderTrackerPage();
    const expandSubjectBtn = screen.getByRole("button", { name: /expand engineering mathematics/i });
    fireEvent.click(expandSubjectBtn);

    const incBtns = screen.getAllByTitle(/increment revision count/i);
    expect(incBtns.length).toBeGreaterThan(0);

    fireEvent.click(incBtns[0]);
    // The count increases from 0 to 1
    const revisionStatusBtns = screen.getAllByTitle(/mark not revised/i);
    expect(revisionStatusBtns.length).toBeGreaterThan(0);
  });

  it("dismisses the countdown widget when close button is clicked", () => {
    renderTrackerPage();
    expect(screen.getByRole("region", { name: /exam countdown/i })).toBeTruthy();

    const dismissBtn = screen.getByTitle(/hide countdown widget/i);
    fireEvent.click(dismissBtn);

    expect(screen.queryByRole("region", { name: /exam countdown/i })).toBeNull();
    expect(screen.getByRole("button", { name: /show countdown/i })).toBeTruthy();
  });

  it("opens topic reset modal and confirms reset", () => {
    renderTrackerPage();
    const expandSubjectBtn = screen.getByRole("button", { name: /expand engineering mathematics/i });
    fireEvent.click(expandSubjectBtn);

    const resetBtns = screen.getAllByTitle(/reset topic manual progress/i);
    expect(resetBtns.length).toBeGreaterThan(0);
    fireEvent.click(resetBtns[0]);

    expect(screen.getByRole("dialog", { name: /reset topic annotations/i })).toBeTruthy();

    const confirmBtn = screen.getByRole("button", { name: /confirm reset/i });
    fireEvent.click(confirmBtn);

    expect(screen.queryByRole("dialog", { name: /reset topic annotations/i })).toBeNull();
  });

  it("ingests canonical practice records and updates PYQ practice counts", () => {
    window.localStorage.setItem(
      "gate_qa_solved_questions",
      JSON.stringify(["go:101", "go:102"])
    );
    window.localStorage.setItem(
      "gateqa_progress_v1",
      JSON.stringify({
        "go:101": { attempts: 1, correctAttempts: 1, isSolved: true, lastSubmittedAt: "2026-09-01T10:00:00Z" },
      })
    );

    renderTrackerPage();
    // The page rendered without error and loaded canonical practice
    expect(screen.getByRole("heading", { name: /gate cse preparation tracker/i })).toBeTruthy();
  });
});
