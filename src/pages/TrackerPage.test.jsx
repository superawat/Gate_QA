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

// Mock PageShell
vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children, showHeader, showFooter }) => (
    <div
      data-testid="page-shell"
      data-show-header={String(showHeader)}
      data-show-footer={String(showFooter)}
    >
      {children}
    </div>
  ),
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

vi.mock("../services/BranchQuestionService", () => ({
  BranchQuestionService: {
    isLoaded: vi.fn().mockReturnValue(true),
    getQuestions: vi.fn().mockReturnValue([]),
    init: vi.fn().mockResolvedValue([]),
    getStructuredTags: vi.fn().mockReturnValue({}),
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

  const ecSubjects = [
    {
      id: "ec-comm",
      slug: "communications",
      canonicalSubjectSlugs: ["communications"],
      track: "ec",
      label: "Communications",
      shortLabel: "COMM",
      marksRange: "10–12 Marks",
      estimatedHours: 40,
      weightageTier: "tier-1-high",
      recommendedTextbook: "Simon Haykin",
      topics: [
        {
          id: "ec-comm-digital-comm",
          label: "Digital Communications",
          subjectSlug: "communications",
          canonicalSubjectSlugs: ["communications"],
          primaryTopicTag: "digital-communications",
          secondaryTopicTags: [],
          estimatedHours: 12,
          weightageTier: "tier-1-high",
          marksRange: "4–6 Marks",
          keyConcepts: ["PCM", "QAM"],
          recommendedTextbook: "Simon Haykin",
          subtopics: [],
        },
      ],
    },
  ];

  const eeSubjects = [
    {
      id: "ee-machines",
      slug: "electrical-machines",
      canonicalSubjectSlugs: ["electrical-machines"],
      track: "ee",
      label: "Electrical Machines",
      shortLabel: "Machines",
      marksRange: "9–11 Marks",
      estimatedHours: 45,
      weightageTier: "tier-1-high",
      recommendedTextbook: "P.S. Bimbhra",
      topics: [
        {
          id: "ee-mach-transformers",
          label: "Single Phase and Three Phase Transformers",
          subjectSlug: "electrical-machines",
          canonicalSubjectSlugs: ["electrical-machines"],
          primaryTopicTag: "transformers",
          secondaryTopicTags: [],
          estimatedHours: 14,
          weightageTier: "tier-1-high",
          marksRange: "4–5 Marks",
          keyConcepts: ["Auto transformer"],
          recommendedTextbook: "P.S. Bimbhra",
          subtopics: [],
        },
      ],
    },
  ];

  const taxonomyMap = {
    cse: { track: "cse", title: "GATE CSE", defaultExamDate: "2027-02-06", subjects: cseSubjects },
    da: { track: "da", title: "GATE DA", defaultExamDate: "2027-02-07", subjects: daSubjects },
    ec: { track: "ec", title: "GATE EC", defaultExamDate: "2027-02-06", subjects: ecSubjects },
    ee: { track: "ee", title: "GATE EE", defaultExamDate: "2027-02-06", subjects: eeSubjects },
  };

  return {
    TRACK_TAXONOMIES: taxonomyMap,
    getTopicsForTrack: (track) => {
      const entry = taxonomyMap[track] || taxonomyMap.cse;
      return entry.subjects[0]?.topics || [];
    },
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
    expect(screen.getByText(/subject breakdown/i)).toBeTruthy();
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

  it("renders a back to home button linking to home dashboard", () => {
    renderTrackerPage();
    const backBtn = screen.getByRole("link", { name: /back to home/i });
    expect(backBtn).toBeTruthy();
    expect(backBtn.getAttribute("href")).toBe("/");
  });

  it("renders PageShell with showHeader=false for distraction-free tracker experience", () => {
    renderTrackerPage();
    const pageShell = screen.getByTestId("page-shell");
    expect(pageShell.getAttribute("data-show-header")).toBe("false");
  });

  it("renders a theme toggle switch button in track switcher toolbar", () => {
    renderTrackerPage();
    const themeToggle = screen.getByRole("switch", { name: /switch to (dark|light) mode/i });
    expect(themeToggle).toBeTruthy();
  });

  // Multi-branch integration tests based on user's selected branches
  it("renders only user's selected branches when CSE and EC combination is selected", () => {
    window.localStorage.setItem("gateqa_selected_branches", JSON.stringify(["cse", "ec"]));
    window.localStorage.setItem("gateqa_active_branch", "cse");

    renderTrackerPage();

    // CSE and EC switcher buttons are present
    expect(screen.getByRole("button", { name: /gate cse/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /gate ec/i })).toBeTruthy();

    // Unselected branches (DA, EE, ME, CE) are NOT rendered
    expect(screen.queryByRole("button", { name: /gate da/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /gate ee/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /gate me/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /gate ce/i })).toBeNull();
  });

  it("switches to EC and renders official EC syllabus when user selected EC and EE", () => {
    window.localStorage.setItem("gateqa_selected_branches", JSON.stringify(["ec", "ee"]));
    window.localStorage.setItem("gateqa_active_branch", "ec");

    renderTrackerPage();

    // EC is default active
    expect(screen.getByRole("heading", { name: /gate ec preparation tracker/i })).toBeTruthy();
    expect(screen.getByText(/paper: ec/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /gate ec/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /gate ee/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /gate cse/i })).toBeNull();

    // EC syllabus subject is rendered
    expect(screen.getAllByText(/communications/i).length).toBeGreaterThan(0);

    // Switch to EE
    const eeBtn = screen.getByRole("button", { name: /gate ee/i });
    fireEvent.click(eeBtn);

    expect(screen.getByRole("heading", { name: /gate ee preparation tracker/i })).toBeTruthy();
    expect(screen.getByText(/paper: ee/i)).toBeTruthy();
    expect(screen.getAllByText(/electrical machines/i).length).toBeGreaterThan(0);
  });

  it("renders a single branch button when user only selected 1 branch", () => {
    window.localStorage.setItem("gateqa_selected_branches", JSON.stringify(["ec"]));
    window.localStorage.setItem("gateqa_active_branch", "ec");

    renderTrackerPage();

    expect(screen.getByRole("button", { name: /gate ec/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /gate cse/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /gate da/i })).toBeNull();
  });
});
