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

  test("wrong 1-mark MCQ applies negative marks on submission", async () => {
    const question = buildQuestion("ga:mcq-1", "General Aptitude", "2024-s1", 2024);
    mockAllQuestions = [question];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:mcq-1": {
          questionUid: "ga:mcq-1",
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
      scorableQuestionUids: ["ga:mcq-1"],
    });
    MockCatalogService.loaded = true;
    AnswerService.answersByQuestionUid["ga:mcq-1"] = {
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
      latest.saveResponse("ga:mcq-1", "B");
      latest.submitTest();
    });

    await waitFor(() => {
      expect(latest.resultSummary).toMatchObject({
        attempted: 1,
        incorrect: 1,
        score: -0.3333,
      });
      expect(latest.resultSummary.perQuestionResult["ga:mcq-1"]).toMatchObject({
        correct: false,
        scoreDelta: -0.3333333333,
      });
    });
  });

  test("wrong 2-mark MCQ applies two-third negative marks on submission", async () => {
    const question = buildQuestion("cs:mcq-2", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [question];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "cs:mcq-2": {
          questionUid: "cs:mcq-2",
          section: "CS",
          type: "MCQ",
          marks: 2,
          negativeMarks: 0.6666666667,
          yearSetKey: "2024-s1",
          orderIndex: 1,
          scorable: true,
          paperReady: false,
        },
      },
      scorableQuestionUids: ["cs:mcq-2"],
    });
    MockCatalogService.loaded = true;
    AnswerService.answersByQuestionUid["cs:mcq-2"] = {
      type: "MCQ",
      answer: "C",
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
        csQuestions: [question],
        meta: { kindId: "custom" },
      });
      latest.saveResponse("cs:mcq-2", "A");
      latest.submitTest();
    });

    await waitFor(() => {
      expect(latest.resultSummary).toMatchObject({
        attempted: 1,
        incorrect: 1,
        score: -0.6667,
      });
      expect(latest.resultSummary.perQuestionResult["cs:mcq-2"].scoreDelta).toBe(-0.6666666667);
    });
  });

  test("partial MSQ answers score zero without negative marks", async () => {
    const question = buildQuestion("cs:msq", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [question];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "cs:msq": {
          questionUid: "cs:msq",
          section: "CS",
          type: "MSQ",
          marks: 2,
          negativeMarks: 0,
          yearSetKey: "2024-s1",
          orderIndex: 1,
          scorable: true,
          paperReady: false,
        },
      },
      scorableQuestionUids: ["cs:msq"],
    });
    MockCatalogService.loaded = true;
    AnswerService.answersByQuestionUid["cs:msq"] = {
      type: "MSQ",
      answer: ["A", "C"],
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
        csQuestions: [question],
        meta: { kindId: "custom" },
      });
      latest.saveResponse("cs:msq", ["A"]);
      latest.submitTest();
    });

    await waitFor(() => {
      expect(latest.resultSummary).toMatchObject({
        attempted: 1,
        incorrect: 1,
        score: 0,
      });
      expect(latest.resultSummary.perQuestionResult["cs:msq"]).toMatchObject({
        correct: false,
        scoreDelta: 0,
      });
    });
  });

  test("NAT answers within tolerance receive full marks", async () => {
    const question = buildQuestion("cs:nat-tolerance", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [question];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "cs:nat-tolerance": {
          questionUid: "cs:nat-tolerance",
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
      scorableQuestionUids: ["cs:nat-tolerance"],
    });
    MockCatalogService.loaded = true;
    AnswerService.answersByQuestionUid["cs:nat-tolerance"] = {
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
        csQuestions: [question],
        meta: { kindId: "custom" },
      });
      latest.saveResponse("cs:nat-tolerance", "42.08");
      latest.submitTest();
    });

    await waitFor(() => {
      expect(latest.resultSummary).toMatchObject({
        attempted: 1,
        correct: 1,
        score: 2,
      });
      expect(latest.resultSummary.perQuestionResult["cs:nat-tolerance"]).toMatchObject({
        correct: true,
        scoreDelta: 2,
      });
    });
  });

  test("NAT answers outside tolerance stay incorrect without negative marks", async () => {
    const question = buildQuestion("cs:nat-outside", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [question];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "cs:nat-outside": {
          questionUid: "cs:nat-outside",
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
      scorableQuestionUids: ["cs:nat-outside"],
    });
    MockCatalogService.loaded = true;
    AnswerService.answersByQuestionUid["cs:nat-outside"] = {
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
        csQuestions: [question],
        meta: { kindId: "custom" },
      });
      latest.saveResponse("cs:nat-outside", "42.4");
      latest.submitTest();
    });

    await waitFor(() => {
      expect(latest.resultSummary).toMatchObject({
        attempted: 1,
        incorrect: 1,
        score: 0,
      });
      expect(latest.resultSummary.perQuestionResult["cs:nat-outside"]).toMatchObject({
        correct: false,
        scoreDelta: 0,
      });
    });
  });

  test("goToNext on last GA question navigates to first CS question", async () => {
    const ga1 = buildQuestion("ga:1", "General Aptitude", "2024-s1", 2024);
    const ga2 = buildQuestion("ga:2", "General Aptitude", "2024-s1", 2024);
    const cs1 = buildQuestion("cs:1", "Operating System", "2024-s1", 2024);
    
    mockAllQuestions = [ga1, ga2, cs1];

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
        "ga:2": {
          questionUid: "ga:2",
          section: "GA",
          type: "MCQ",
          marks: 1,
          negativeMarks: 0.3333333333,
          yearSetKey: "2024-s1",
          orderIndex: 2,
          scorable: true,
          paperReady: false,
        },
        "cs:1": {
          questionUid: "cs:1",
          section: "CS",
          type: "MCQ",
          marks: 1,
          negativeMarks: 0.3333333333,
          yearSetKey: "2024-s1",
          orderIndex: 1,
          scorable: true,
          paperReady: false,
        },
      },
      scorableQuestionUids: ["ga:1", "ga:2", "cs:1"],
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
        gaQuestions: [ga1, ga2],
        csQuestions: [cs1],
        meta: { kindId: "custom" },
      });
    });

    await waitFor(() => {
      expect(latest.testActive).toBe(true);
      expect(latest.currentSection).toBe("GA");
      expect(latest.currentSectionIndex).toBe(0);
    });

    act(() => {
      latest.goToQuestion(1, "GA"); // last GA question
    });

    await waitFor(() => {
      expect(latest.currentSectionIndex).toBe(1);
    });

    act(() => {
      latest.goToNext(); // should move to CS index 0
    });

    await waitFor(() => {
      expect(latest.currentSection).toBe("CS");
      expect(latest.currentSectionIndex).toBe(0);
      expect(latest.currentQuestion.question_uid).toBe("cs:1");
    });
  });
});
