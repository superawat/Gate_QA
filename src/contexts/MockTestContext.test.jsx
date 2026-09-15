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
import { APTITUDE_PROGRESS_STORAGE_KEY } from "../utils/practiceProgress";

const aptitudeMock = vi.hoisted(() => ({
  questions: [],
  init: vi.fn(async () => {}),
}));

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

vi.mock("../services/AptitudeQuestionService", () => ({
  AptitudeQuestionService: {
    get loaded() {
      return true;
    },
    get questions() {
      return aptitudeMock.questions;
    },
    get loadError() {
      return "";
    },
    init: aptitudeMock.init,
  },
}));

const DEFAULT_OPTIONS = [
  { label: "A", text: "A", html: "A" },
  { label: "B", text: "B", html: "B" },
  { label: "C", text: "C", html: "C" },
  { label: "D", text: "D", html: "D" },
];

const seedFixtureAnswer = (question_uid, type = "MCQ") => {
  const normalizedType = String(type || "MCQ").trim().toUpperCase();
  if (normalizedType === "NAT") {
    AnswerService.answersByQuestionUid[question_uid] = { type: "NAT", answer: "42", tolerance: { abs: 0.1 } };
  } else if (normalizedType === "MULTI_NAT" || normalizedType === "MULTI_BLANK_NAT") {
    AnswerService.answersByQuestionUid[question_uid] = { type: "MULTI_NAT", answer: ["10", "20"] };
  } else if (normalizedType === "MTA" || normalizedType === "MARKS_TO_ALL") {
    AnswerService.answersByQuestionUid[question_uid] = { type: "MTA", answer: "MTA" };
  } else if (normalizedType === "MSQ") {
    AnswerService.answersByQuestionUid[question_uid] = { type: "MSQ", answer: ["A", "C"] };
  } else {
    AnswerService.answersByQuestionUid[question_uid] = { type: "MCQ", answer: "A" };
  }
};

const buildQuestion = (question_uid, subject, yearSetKey, year, type = "MCQ") => {
  const normalizedType = String(type || "MCQ").trim().toUpperCase();
  seedFixtureAnswer(question_uid, normalizedType);

  const isNat = normalizedType === "NAT" || normalizedType === "MULTI_NAT" || normalizedType === "MULTI_BLANK_NAT";
  return {
    question_uid,
    title: question_uid,
    subject,
    subjectSlug: subject === "General Aptitude" ? "ga" : "os",
    question: `<p>${question_uid}</p>`,
    normalizedOptions: isNat ? [] : DEFAULT_OPTIONS,
    type: normalizedType.toLowerCase(),
    exam: { yearSetKey, year },
  };
};

const buildAptitudeQuestion = (question_uid, subject = "English", subtopic = "Spot the Error") => ({
  question_uid,
  uid: question_uid,
  id: question_uid,
  title: `${subject} Practice`,
  subject,
  subjectLabel: subject,
  subjectSlug: subject.toLowerCase(),
  question: `<p>${question_uid}</p>`,
  normalizedOptions: [
    { label: "A", text: "A", html: "A" },
    { label: "B", text: "B", html: "B" },
    { label: "C", text: "C", html: "C" },
    { label: "D", text: "D", html: "D" },
  ],
  subtopics: [{ slug: subtopic.toLowerCase().replaceAll(" ", "-"), label: subtopic }],
  type: "mcq",
  answerMeta: { type: "MCQ", answer: "A", source: "aptitude_embedded" },
  exam: { year: null, yearSetKey: null, paper: "Aptitude" },
});

describe("MockTestContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    window.localStorage.clear();
    mockAllQuestions = [];
    aptitudeMock.questions = [];
    mockMarkQuestionsSolved.mockReset();
    aptitudeMock.init.mockClear();
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

  test("includes aptitude questions in mock pool", async () => {
    const aptitudeQuestion = buildAptitudeQuestion("APT-ENG-0001", "English", "Spot the Error");
    aptitudeMock.questions = [aptitudeQuestion];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {},
      scorableQuestionUids: [],
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
      expect(latest.aptitudeMockLoading).toBe(false);
    });

    // Aptitude questions should appear in the mock pool
    expect(latest.mockQuestionPool.filter(
      (q) => q.question_uid.startsWith("APT-")
    )).toHaveLength(1);
    expect(latest.questionMetaByUid["APT-ENG-0001"]).toBeDefined();
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

  test("tracks per-question time spent and persists it into mock history", async () => {
    const gaQuestion = buildQuestion("ga:timed", "General Aptitude", "2024-s1", 2024);
    const csQuestion = buildQuestion("cs:timed", "Operating System", "2024-s1", 2024, "NAT");
    mockAllQuestions = [gaQuestion, csQuestion];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:timed": {
          questionUid: "ga:timed",
          section: "GA",
          type: "MCQ",
          marks: 1,
          negativeMarks: 0.3333333333,
          yearSetKey: "2024-s1",
          orderIndex: 1,
          scorable: true,
          paperReady: false,
        },
        "cs:timed": {
          questionUid: "cs:timed",
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
      scorableQuestionUids: ["ga:timed", "cs:timed"],
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
        gaQuestions: [gaQuestion],
        csQuestions: [csQuestion],
        timeSeconds: 600,
        meta: { kindId: "custom", kindTitle: "Custom Builder", durationMinutes: 10 },
      });
    });

    await waitFor(() => {
      expect(latest.testActive).toBe(true);
      expect(latest.currentQuestionUid).toBe("ga:timed");
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      latest.goToQuestion(0, "CS");
    });

    await waitFor(() => {
      expect(latest.currentQuestionUid).toBe("cs:timed");
    });

    act(() => {
      vi.advanceTimersByTime(181000);
      latest.submitTest();
    });

    await waitFor(() => {
      expect(latest.testSubmitted).toBe(true);
      expect(latest.resultSummary.perQuestionResult["ga:timed"]).toMatchObject({
        timeSpentSeconds: 2,
        timeExceededThreshold: false,
      });
      expect(latest.resultSummary.perQuestionResult["cs:timed"]).toMatchObject({
        timeSpentSeconds: 181,
        timeExceededThreshold: true,
      });
      expect(latest.resultSummary.timeAnalysis).toMatchObject({
        totalSeconds: 183,
        averageSeconds: 92,
        slowQuestionCount: 1,
      });
    });

    expect(readMockTestHistory()[0]).toMatchObject({
      timeAnalysis: expect.objectContaining({
        totalSeconds: 183,
        slowQuestionCount: 1,
      }),
      unansweredQuestions: expect.arrayContaining([
        expect.objectContaining({ questionUid: "cs:timed", timeSpentSeconds: 181, timeExceededThreshold: true }),
      ]),
    });
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

  test("restores active attempt from localStorage when sessionStorage is empty (AUG-013 crash recovery)", async () => {
    const ga1 = buildQuestion("ga:crash-1", "General Aptitude", "2024-s1", 2024);
    const cs1 = buildQuestion("cs:crash-1", "Operating System", "2024-s1", 2024, "NAT");
    mockAllQuestions = [ga1, cs1];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:crash-1": { questionUid: "ga:crash-1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
        "cs:crash-1": { questionUid: "cs:crash-1", section: "CS", type: "NAT", marks: 2, negativeMarks: 0, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
      },
      scorableQuestionUids: ["ga:crash-1", "cs:crash-1"],
    });
    MockCatalogService.loaded = true;

    // Simulate saved state in localStorage, but empty sessionStorage (e.g. browser crash / tab reopen)
    const savedAttempt = {
      v: 5,
      gaUids: ["ga:crash-1"],
      csUids: ["cs:crash-1"],
      activeSection: "CS",
      gaIndex: 0,
      csIndex: 0,
      responses: { "ga:crash-1": "A", "cs:crash-1": "0" },
      questionStates: { "ga:crash-1": "answered", "cs:crash-1": "answered" },
      questionTimeSpent: { "ga:crash-1": 45, "cs:crash-1": 30 },
      timeLeft: 5400,
      meta: { kindId: "custom", durationMinutes: 90 },
      questions: [ga1, cs1],
    };
    window.localStorage.setItem("gateqa_mock_attempt_v1", JSON.stringify(savedAttempt));
    window.sessionStorage.clear();

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
      expect(latest.testActive).toBe(true);
      expect(latest.timeLeft).toBe(5400);
      expect(latest.currentSection).toBe("CS");
      expect(latest.currentQuestion.question_uid).toBe("cs:crash-1");
      expect(latest.responses["ga:crash-1"]).toBe("A");
      expect(latest.responses["cs:crash-1"]).toBe("0");
      expect(latest.questionStates["ga:crash-1"]).toBe("answered");
      expect(latest.questionStates["cs:crash-1"]).toBe("answered");
      expect(latest.questionTimeSpent["ga:crash-1"]).toBe(45);
      expect(latest.questionTimeSpent["cs:crash-1"]).toBe(30);
    });
  });

  test("persists active attempt to both localStorage and sessionStorage simultaneously (AUG-013)", async () => {
    const ga1 = buildQuestion("ga:sync-1", "General Aptitude", "2024-s1", 2024);
    const cs1 = buildQuestion("cs:sync-1", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [ga1, cs1];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:sync-1": { questionUid: "ga:sync-1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
        "cs:sync-1": { questionUid: "cs:sync-1", section: "CS", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
      },
      scorableQuestionUids: ["ga:sync-1", "cs:sync-1"],
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
        gaQuestions: [ga1],
        csQuestions: [cs1],
        timeSeconds: 7200,
        meta: { kindId: "custom" },
      });
      latest.saveResponse("ga:sync-1", "B");
    });

    await waitFor(() => {
      expect(latest.testActive).toBe(true);
    });

    const localRaw = window.localStorage.getItem("gateqa_mock_attempt_v1");
    const sessionRaw = window.sessionStorage.getItem("gateqa_mock_attempt_v1");
    expect(localRaw).toBeTruthy();
    expect(sessionRaw).toBeTruthy();

    const localParsed = JSON.parse(localRaw);
    const sessionParsed = JSON.parse(sessionRaw);
    expect(localParsed.responses["ga:sync-1"]).toBe("B");
    expect(sessionParsed.responses["ga:sync-1"]).toBe("B");
    expect(localParsed.v).toBe(5);
  });

  test("resolves newest snapshot between localStorage and sessionStorage based on savedAt timestamp", async () => {
    const ga1 = buildQuestion("ga:time-1", "General Aptitude", "2024-s1", 2024);
    const cs1 = buildQuestion("cs:time-1", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [ga1, cs1];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:time-1": { questionUid: "ga:time-1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
        "cs:time-1": { questionUid: "cs:time-1", section: "CS", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
      },
      scorableQuestionUids: ["ga:time-1", "cs:time-1"],
    });
    MockCatalogService.loaded = true;

    // Older local storage snapshot
    const olderLocal = {
      v: 5,
      gaUids: ["ga:time-1"],
      csUids: ["cs:time-1"],
      activeSection: "GA",
      gaIndex: 0,
      csIndex: 0,
      responses: { "ga:time-1": "A" },
      questionStates: { "ga:time-1": "answered" },
      timeLeft: 10000,
      meta: { kindId: "custom" },
      questions: [ga1, cs1],
      savedAt: 1000,
    };

    // Newer session storage snapshot with updated answers and timer
    const newerSession = {
      v: 5,
      gaUids: ["ga:time-1"],
      csUids: ["cs:time-1"],
      activeSection: "CS",
      gaIndex: 0,
      csIndex: 0,
      responses: { "ga:time-1": "A", "cs:time-1": "D" },
      questionStates: { "ga:time-1": "answered", "cs:time-1": "answered" },
      timeLeft: 8500,
      meta: { kindId: "custom" },
      questions: [ga1, cs1],
      savedAt: 2000,
    };

    window.localStorage.setItem("gateqa_mock_attempt_v1", JSON.stringify(olderLocal));
    window.sessionStorage.setItem("gateqa_mock_attempt_v1", JSON.stringify(newerSession));

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
      expect(latest.testActive).toBe(true);
      expect(latest.timeLeft).toBe(8500);
      expect(latest.currentSection).toBe("CS");
      expect(latest.responses["cs:time-1"]).toBe("D");
    });
  });

  test("rejects corrupted embedded questions and falls back to canonical question bank", async () => {
    const ga1 = buildQuestion("ga:corrupt-1", "General Aptitude", "2024-s1", 2024);
    const cs1 = buildQuestion("cs:corrupt-1", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [ga1, cs1];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:corrupt-1": { questionUid: "ga:corrupt-1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
        "cs:corrupt-1": { questionUid: "cs:corrupt-1", section: "CS", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
      },
      scorableQuestionUids: ["ga:corrupt-1", "cs:corrupt-1"],
    });
    MockCatalogService.loaded = true;

    // Corrupted embedded question missing question content and type
    const corruptedEmbedded = {
      question_uid: "cs:corrupt-1",
      question: "", // empty question stem!
      type: "INVALID_TYPE",
    };

    const savedAttempt = {
      v: 5,
      gaUids: ["ga:corrupt-1"],
      csUids: ["cs:corrupt-1"],
      activeSection: "GA",
      gaIndex: 0,
      csIndex: 0,
      responses: {},
      questionStates: {},
      timeLeft: 9000,
      meta: { kindId: "custom" },
      questions: [ga1, corruptedEmbedded],
      savedAt: 1500,
    };

    window.localStorage.setItem("gateqa_mock_attempt_v1", JSON.stringify(savedAttempt));
    window.sessionStorage.clear();

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
      expect(latest.testActive).toBe(true);
      expect(latest.questions.length).toBe(2);
      // Valid question from question bank used instead of corrupted embedded item
      expect(latest.questions[1].question_uid).toBe("cs:corrupt-1");
      expect(latest.questions[1].type.toUpperCase()).toBe("MCQ");
    });
  });

  test("maintains previous attempt backup key during storage rotation", async () => {
    const ga1 = buildQuestion("ga:rot-1", "General Aptitude", "2024-s1", 2024);
    const cs1 = buildQuestion("cs:rot-1", "Operating System", "2024-s1", 2024);
    mockAllQuestions = [ga1, cs1];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {
        "ga:rot-1": { questionUid: "ga:rot-1", section: "GA", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
        "cs:rot-1": { questionUid: "cs:rot-1", section: "CS", type: "MCQ", marks: 1, negativeMarks: 0.3333333333, yearSetKey: "2024-s1", orderIndex: 1, scorable: true, paperReady: false },
      },
      scorableQuestionUids: ["ga:rot-1", "cs:rot-1"],
    });
    MockCatalogService.loaded = true;

    // Seed existing attempt from a previous exam
    const existing = {
      v: 5,
      gaUids: ["ga:old-1"],
      csUids: ["cs:old-1"],
      responses: { "ga:old-1": "A" },
      savedAt: 100,
    };
    window.localStorage.setItem("gateqa_mock_attempt_v1", JSON.stringify(existing));

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
        gaQuestions: [ga1],
        csQuestions: [cs1],
        meta: { kindId: "custom" },
      });
    });

    await waitFor(() => {
      expect(latest.testActive).toBe(true);
    });

    const backupRaw = window.localStorage.getItem("gateqa_mock_attempt_backup_v1");
    expect(backupRaw).toBeTruthy();
    const backupParsed = JSON.parse(backupRaw);
    expect(backupParsed.savedAt).toBe(100);
  });

  test("custom builder test with non-catalog questions restores cleanly and remains scorable (DEC-110)", async () => {
    const ga1 = buildQuestion("ga:custom-1", "General Aptitude", "1995", 1995);
    const cs1 = buildQuestion("cs:custom-1", "Operating System", "1995", 1995);
    mockAllQuestions = [ga1, cs1];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {}, // empty catalog - questions not in official catalog!
      scorableQuestionUids: [],
    });
    MockCatalogService.loaded = true;

    const savedAttempt = {
      v: 5,
      gaUids: ["ga:custom-1"],
      csUids: ["cs:custom-1"],
      activeSection: "GA",
      gaIndex: 0,
      csIndex: 0,
      responses: { "ga:custom-1": "A" },
      questionStates: { "ga:custom-1": "answered" },
      timeLeft: 3600,
      meta: { kindId: "custom", durationMinutes: 60 },
      questions: [ga1, cs1],
      savedAt: 2000,
    };

    window.localStorage.setItem("gateqa_mock_attempt_v1", JSON.stringify(savedAttempt));
    window.sessionStorage.clear();

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
      expect(latest.testActive).toBe(true);
      expect(latest.attemptError).toBe("");
      expect(latest.questions.length).toBe(2);
      expect(latest.questionMetaByUid["cs:custom-1"]).toBeDefined();
      expect(latest.questionMetaByUid["cs:custom-1"].scorable).toBe(true);
    });
  });

  test("custom builder test with MULTI_NAT and MTA questions restores cleanly without invalidation (DEC-110)", async () => {
    const ga1 = buildQuestion("ga:custom-mn-1", "General Aptitude", "2021-s1", 2021);
    const csMultiNat = buildQuestion("cs:multi-nat-1", "Algorithms", "2021-s1", 2021, "MULTI_NAT");
    const csMta = buildQuestion("cs:mta-1", "Computer Networks", "2021-s1", 2021, "MTA");
    mockAllQuestions = [ga1, csMultiNat, csMta];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {},
      scorableQuestionUids: [],
    });
    MockCatalogService.loaded = true;

    const savedAttempt = {
      v: 5,
      gaUids: ["ga:custom-mn-1"],
      csUids: ["cs:multi-nat-1", "cs:mta-1"],
      activeSection: "CS",
      gaIndex: 0,
      csIndex: 0,
      responses: {},
      questionStates: {},
      timeLeft: 1800,
      meta: { kindId: "custom", durationMinutes: 30 },
      questions: [ga1, csMultiNat, csMta],
      savedAt: 3000,
    };

    window.localStorage.setItem("gateqa_mock_attempt_v1", JSON.stringify(savedAttempt));
    window.sessionStorage.clear();

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
      expect(latest.testActive).toBe(true);
      expect(latest.attemptError).toBe("");
      expect(latest.questions.length).toBe(3);
      expect(latest.questionMetaByUid["cs:multi-nat-1"].type).toBe("MULTI_NAT");
      expect(latest.questionMetaByUid["cs:mta-1"].scorable).toBe(true);
    });
  });

  test("custom builder test respects 30m configured duration and remains active beyond 25 minutes without invalidation (DEC-110)", async () => {
    const ga1 = buildQuestion("ga:dur-1", "General Aptitude", "2023", 2023);
    const cs1 = buildQuestion("cs:dur-1", "Operating System", "2023", 2023);
    mockAllQuestions = [ga1, cs1];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {},
      scorableQuestionUids: [],
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

    // Start 30-minute exam (1800 seconds)
    act(() => {
      latest.startTest({
        gaQuestions: [ga1],
        csQuestions: [cs1],
        timeSeconds: 1800,
        meta: { kindId: "custom", durationMinutes: 30 },
      });
    });

    await waitFor(() => {
      expect(latest.testActive).toBe(true);
      expect(latest.timeLeft).toBe(1800);
    });

    // Advance by 1500 seconds (25 minutes)
    act(() => {
      vi.advanceTimersByTime(1500 * 1000);
    });

    // Test MUST remain active and valid, with exactly 300s (5 minutes) left
    expect(latest.testActive).toBe(true);
    expect(latest.attemptError).toBe("");
    expect(latest.timeLeft).toBe(300);

    // Advance another 100 seconds (26m40s total)
    act(() => {
      vi.advanceTimersByTime(100 * 1000);
    });

    expect(latest.testActive).toBe(true);
    expect(latest.attemptError).toBe("");
    expect(latest.timeLeft).toBe(200);
  });

  test("throttles periodic storage writes while flushing immediately on response changes and window unload (DEC-110)", async () => {
    const ga1 = buildQuestion("ga:throt-1", "General Aptitude", "2023", 2023);
    const cs1 = buildQuestion("cs:throt-1", "Operating System", "2023", 2023);
    mockAllQuestions = [ga1, cs1];

    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [],
      byQuestionUid: {},
      scorableQuestionUids: [],
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
        gaQuestions: [ga1],
        csQuestions: [cs1],
        timeSeconds: 3600,
        meta: { kindId: "custom" },
      });
    });

    const initialRaw = window.localStorage.getItem("gateqa_mock_attempt_v1");
    expect(initialRaw).toBeTruthy();
    const initialSavedAt = JSON.parse(initialRaw).savedAt;

    // Advance by 1 second — storage write is throttled (savedAt unchanged)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const after1sRaw = window.localStorage.getItem("gateqa_mock_attempt_v1");
    const after1sSavedAt = JSON.parse(after1sRaw).savedAt;
    expect(after1sSavedAt).toBe(initialSavedAt);

    // Advance past the 5-second throttle threshold
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const after5sRaw = window.localStorage.getItem("gateqa_mock_attempt_v1");
    const after5sSavedAt = JSON.parse(after5sRaw).savedAt;
    expect(after5sSavedAt).toBeGreaterThan(initialSavedAt);

    // Now save a user response — MUST write immediately without waiting for throttle
    const beforeResponseTime = after5sSavedAt;
    act(() => {
      vi.advanceTimersByTime(500); // only 500ms elapsed
      latest.saveResponse("ga:throt-1", "C");
    });

    const afterResponseRaw = window.localStorage.getItem("gateqa_mock_attempt_v1");
    const afterResponseSavedAt = JSON.parse(afterResponseRaw).savedAt;
    expect(afterResponseSavedAt).toBeGreaterThan(beforeResponseTime);
    expect(JSON.parse(afterResponseRaw).responses["ga:throt-1"]).toBe("C");
  });
});
