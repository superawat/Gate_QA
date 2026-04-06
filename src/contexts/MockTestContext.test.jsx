/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MockTestProvider, useMockTest } from "./MockTestContext";
import { MockCatalogService } from "../services/MockCatalogService";
import { AnswerService } from "../services/AnswerService";
import { readMockTestHistory } from "../utils/mockTestHistory";

let mockAllQuestions = [];
const mockMarkQuestionsSolved = vi.fn();

vi.mock("./FilterContext", () => ({
  useFilterState: () => ({
    allQuestions: mockAllQuestions,
  }),
  useFilterActions: () => ({
    markQuestionsSolved: mockMarkQuestionsSolved,
  }),
}));

const buildQuestion = (question_uid, subject, yearSetKey, year) => ({
  question_uid,
  title: question_uid,
  subject,
  subjectSlug: subject === "General Aptitude" ? "ga" : "os",
  question: `<p>${question_uid}</p>`,
  exam: { yearSetKey, year },
});

describe("MockTestContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    window.localStorage.clear();
    mockAllQuestions = [];
    mockMarkQuestionsSolved.mockReset();
    MockCatalogService.reset();
    AnswerService.answersByQuestionUid = {};
    AnswerService.answersByUid = {};
    AnswerService.answersByExamUid = {};
    AnswerService.unsupportedQuestionUids = new Set();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    MockCatalogService.reset();
  });

  test("keeps strict GA/CS counts and preserves section-local index on toggle", async () => {
    const ga = Array.from({ length: 10 }, (_, index) => buildQuestion(`ga:${index + 1}`, "General Aptitude", "2024-s1", 2024));
    const cs = Array.from({ length: 55 }, (_, index) => buildQuestion(`cs:${index + 1}`, "Operating System", "2024-s1", 2024));
    mockAllQuestions = [...ga, ...cs];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [{ yearSetKey: "2024-s1", paperReady: true, year: 2024, label: "2024 Set 1", gaCount: 10, csCount: 55 }],
      byQuestionUid: Object.fromEntries([
        ...ga.map((question, index) => [question.question_uid, {
          questionUid: question.question_uid,
          section: "GA",
          type: "MCQ",
          marks: index < 5 ? 1 : 2,
          negativeMarks: index < 5 ? 0.3333333333 : 0.6666666667,
          yearSetKey: "2024-s1",
          orderIndex: index + 1,
          scorable: true,
          paperReady: true,
        }]),
        ...cs.map((question, index) => [question.question_uid, {
          questionUid: question.question_uid,
          section: "CS",
          type: "MCQ",
          marks: index < 25 ? 1 : 2,
          negativeMarks: index < 25 ? 0.3333333333 : 0.6666666667,
          yearSetKey: "2024-s1",
          orderIndex: index + 1,
          scorable: true,
          paperReady: true,
        }]),
      ]),
      scorableQuestionUids: [...ga, ...cs].map((question) => question.question_uid),
    });
    MockCatalogService.loaded = true;

    let latest = null;
    const Probe = () => {
      latest = useMockTest();
      return null;
    };

    render(
      <MockTestProvider>
        <Probe />
      </MockTestProvider>
    );

    await waitFor(() => {
      expect(latest.catalogLoading).toBe(false);
    });

    act(() => {
      const started = latest.startTest({
        gaQuestions: ga,
        csQuestions: cs,
        meta: {
          strictSectionCounts: { GA: 10, CS: 55 },
        },
      });
      expect(started).toBe(true);
    });

    await waitFor(() => {
      expect(latest.sectionQuestionUids.GA).toHaveLength(10);
      expect(latest.sectionQuestionUids.CS).toHaveLength(55);
      expect(latest.currentSection).toBe("GA");
      expect(latest.currentQuestion.question_uid).toBe("ga:1");
    });

    act(() => {
      latest.goToQuestion(3, "GA");
      latest.setCurrentSection("CS");
      latest.goToQuestion(16, "CS");
      latest.setCurrentSection("GA");
    });

    await waitFor(() => {
      expect(latest.currentSection).toBe("GA");
      expect(latest.currentSectionIndex).toBe(3);
      expect(latest.currentQuestion.question_uid).toBe("ga:4");
    });
  });

  test("empty NAT values stay unanswered and submitTest stores a result summary", async () => {
    const natQuestion = buildQuestion("cs:nat", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [natQuestion];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "cs:nat": {
          questionUid: "cs:nat",
          section: "CS",
          type: "NAT",
          marks: 2,
          negativeMarks: 0,
          yearSetKey: "2024-s1",
          orderIndex: 1,
          scorable: true,
          paperReady: false,
        },
      },
      scorableQuestionUids: ["cs:nat"],
    });
    MockCatalogService.loaded = true;
    AnswerService.answersByQuestionUid["cs:nat"] = {
      type: "NAT",
      answer: "42",
      tolerance: { abs: 0.1 },
    };

    let latest = null;
    const Probe = () => {
      latest = useMockTest();
      return null;
    };

    render(
      <MockTestProvider>
        <Probe />
      </MockTestProvider>
    );

    await waitFor(() => {
      expect(latest.catalogLoading).toBe(false);
    });

    act(() => {
      latest.startTest({
        csQuestions: [natQuestion],
        meta: { kindId: "custom" },
      });
    });

    await waitFor(() => {
      expect(latest.testActive).toBe(true);
    });

    act(() => {
      latest.saveResponse("cs:nat", "");
      latest.saveAndNext();
    });

    await waitFor(() => {
      expect(latest.questionStates["cs:nat"]).toBe(latest.STATUS.NOT_ANSWERED);
    });

    act(() => {
      latest.submitTest();
    });

    await waitFor(() => {
      expect(latest.testSubmitted).toBe(true);
      expect(latest.resultSummary).toMatchObject({
        attempted: 0,
        unanswered: 1,
        score: 0,
      });
    });

    expect(readMockTestHistory()).toEqual([
      expect.objectContaining({
        kindId: "custom",
        unanswered: 1,
      }),
    ]);
    expect(mockMarkQuestionsSolved).not.toHaveBeenCalled();
  });

  test("correct mock answers are marked solved in the shared question progress store", async () => {
    const question = buildQuestion("ga:1", "General Aptitude", "2024-s1", 2024);
    mockAllQuestions = [question];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:1": {
          questionUid: "ga:1",
          section: "GA",
          type: "MCQ",
          marks: 1,
          negativeMarks: 0.3333333333,
          yearSetKey: "2024-s1",
          orderIndex: 1,
          scorable: true,
          paperReady: false,
        },
      },
      scorableQuestionUids: ["ga:1"],
    });
    MockCatalogService.loaded = true;
    AnswerService.answersByQuestionUid["ga:1"] = {
      type: "MCQ",
      answer: "A",
    };

    let latest = null;
    const Probe = () => {
      latest = useMockTest();
      return null;
    };

    render(
      <MockTestProvider>
        <Probe />
      </MockTestProvider>
    );

    await waitFor(() => {
      expect(latest.catalogLoading).toBe(false);
    });

    act(() => {
      latest.startTest({
        gaQuestions: [question],
        meta: { kindId: "custom" },
      });
    });

    await waitFor(() => {
      expect(latest.testActive).toBe(true);
    });

    act(() => {
      latest.saveResponse("ga:1", "A");
    });

    await waitFor(() => {
      expect(latest.responses["ga:1"]).toBe("A");
    });

    act(() => {
      latest.submitTest();
    });

    await waitFor(() => {
      expect(latest.testSubmitted).toBe(true);
    });

    expect(mockMarkQuestionsSolved).toHaveBeenCalledTimes(1);
    expect(mockMarkQuestionsSolved.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ question_uid: "ga:1" }),
      ])
    );
  });

  test("invalid restored attempts are rejected when catalog metadata is missing", async () => {
    mockAllQuestions = [buildQuestion("ga:1", "General Aptitude", "2024-s1", 2024)];
    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {},
      scorableQuestionUids: [],
    });
    MockCatalogService.loaded = true;

    window.sessionStorage.setItem("gateqa_mock_attempt_v1", JSON.stringify({
      v: 3,
      gaUids: ["ga:1"],
      csUids: [],
      activeSection: "GA",
      gaIndex: 0,
      csIndex: 0,
      responses: {},
      questionStates: { "ga:1": "answered" },
      timeLeft: 600,
      meta: { kindId: "paper_mode" },
    }));

    let latest = null;
    const Probe = () => {
      latest = useMockTest();
      return null;
    };

    render(
      <MockTestProvider>
        <Probe />
      </MockTestProvider>
    );

    await waitFor(() => {
      expect(latest.catalogLoading).toBe(false);
      expect(latest.testActive).toBe(false);
      expect(latest.attemptError).toBe("Attempt invalid, restart mock.");
    });
  });

  test("ending an in-progress mock does not write submitted attempt history", async () => {
    const question = buildQuestion("ga:1", "General Aptitude", "2024-s1", 2024);
    mockAllQuestions = [question];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:1": {
          questionUid: "ga:1",
          section: "GA",
          type: "MCQ",
          marks: 1,
          negativeMarks: 0.3333333333,
          yearSetKey: "2024-s1",
          orderIndex: 1,
          scorable: true,
          paperReady: false,
        },
      },
      scorableQuestionUids: ["ga:1"],
    });
    MockCatalogService.loaded = true;

    let latest = null;
    const Probe = () => {
      latest = useMockTest();
      return null;
    };

    render(
      <MockTestProvider>
        <Probe />
      </MockTestProvider>
    );

    await waitFor(() => {
      expect(latest.catalogLoading).toBe(false);
    });

    act(() => {
      latest.startTest({
        gaQuestions: [question],
        meta: { kindId: "full_length", kindTitle: "Full-length generated mock" },
      });
    });

    await waitFor(() => {
      expect(latest.testActive).toBe(true);
    });

    act(() => {
      latest.endMockTest();
    });

    expect(readMockTestHistory()).toEqual([]);
  });
});
