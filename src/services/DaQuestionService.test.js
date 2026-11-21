import { beforeEach, describe, expect, test, vi } from "vitest";
import { DaQuestionService } from "./DaQuestionService";

const searchIndex = {
  questions: [{
    question_uid: "go:9001",
    title: "GATE DA 2025 | Question: 1",
    year: 2025,
    subjectSlug: "programming-in-python",
    subjectLabel: "Programming in Python",
    type: "MCQ",
    link: "https://gateoverflow.in/9001/q",
    tags: ["gateda-2025", "programming-in-python", "mcq", "question-1"],
    detailShardKey: "2025",
  }],
};

describe("DaQuestionService", () => {
  beforeEach(() => {
    DaQuestionService.reset();
    vi.restoreAllMocks();
  });

  test("loads the DA index, canonicalizes subjects, and joins answers", async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).endsWith("manifest.json")) {
        return Promise.resolve({ ok: true, json: async () => ({ categories: [{ year: 2025, label: "GATE DA 2025", count: 1 }] }) });
      }
      if (String(url).endsWith("search-index.json")) {
        return Promise.resolve({ ok: true, json: async () => searchIndex });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ records_by_question_uid: { "go:9001": { answer_uid: "go:9001", type: "MCQ", answer: "B" } } }),
      });
    });

    await DaQuestionService.init();
    const question = DaQuestionService.questions[0];
    expect(question.subjectSlug).toBe("programming-data-structures-and-algorithms");
    expect(question.subjectLabel).toBe("Programming & DSA");
    expect(DaQuestionService.getAnswerForQuestion(question).answer).toBe("B");
    expect(DaQuestionService.getStructuredTags().subjects.map((entry) => entry.slug)).toContain("da:programming-data-structures-and-algorithms");
    expect(DaQuestionService.getStructuredTags().yearSets[0]).toMatchObject({
      key: "da:2025:set-1",
      legacyKey: "2025-s1",
      label: "2025 Set 1",
      track: "da",
    });
  });

  test("hydrates a question from the year shard", async () => {
    DaQuestionService.loaded = true;
    DaQuestionService.questions = [{ question_uid: "da:2026:set1:main:q1", year: 2026, detailShardKey: "2026", tags: ["gateda-2026"] }];
    DaQuestionService.questionsByUid = new Map([[DaQuestionService.questions[0].question_uid, DaQuestionService.questions[0]]]);
    DaQuestionService.answersByQuestionUid = { "da:2026:set1:main:q1": { type: "NAT", answer: 10 } };
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ recordsByQuestionUid: { "da:2026:set1:main:q1": { title: "Q1", question: "What is 5 + 5?", tags: ["gateda-2026", "nat"] } } }),
    }));

    const detail = await DaQuestionService.ensureQuestionDetail("da:2026:set1:main:q1");
    expect(detail.question).toContain("5 + 5");
    expect(detail.answerMeta.answer).toBe(10);
  });

  test("initializes automatically if ensureQuestionDetail is called before init()", async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).endsWith("manifest.json")) {
        return Promise.resolve({ ok: true, json: async () => ({ categories: [{ year: 2024, label: "GATE DA 2024", count: 1 }] }) });
      }
      if (String(url).endsWith("search-index.json")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            questions: [{
              question_uid: "go:422913",
              title: "GATE DA 2024 | Question: 49",
              link: "https://gateoverflow.in/422913/gate-ds%26ai-2024-question-49",
              year: 2024,
              subjectSlug: "probability-and-statistics",
              type: "NAT",
              detailShardKey: "2024",
              tags: ["gateda-2024", "nat"],
            }],
          }),
        });
      }
      if (String(url).endsWith("2024.json")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            recordsByQuestionUid: {
              "go:422913": {
                question_uid: "go:422913",
                title: "GATE DA 2024 | Question: 49",
                question: "Conditional expectation calculation",
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          records_by_question_uid: {
            "go:422913": { answer_uid: "go:422913", type: "NAT", answer: 1 },
          },
        }),
      });
    });

    expect(DaQuestionService.loaded).toBe(false);
    const detail = await DaQuestionService.ensureQuestionDetail("go:422913");
    expect(detail).toBeDefined();
    expect(detail.question_uid).toBe("go:422913");
    expect(detail.answerMeta.answer).toBe(1);
    expect(DaQuestionService.loaded).toBe(true);
  });

  test("keeps the synthetic DA 2026 UID when a GateOverflow link is present", async () => {
    const searchWithLink = {
      questions: [{
        question_uid: "da:2026:set1:main:q1",
        title: "GATE DA 2026 | Question: 1",
        year: 2026,
        link: "https://gateoverflow.in/523225/gate-da-2026-ga-question-1",
        subjectSlug: "general-aptitude",
        subjectLabel: "General Aptitude",
        type: "MCQ",
        tags: ["gateda-2026", "general-aptitude", "mcq", "question-1"],
        detailShardKey: "2026",
      }],
    };

    global.fetch = vi.fn((url) => {
      if (String(url).endsWith("manifest.json")) {
        return Promise.resolve({ ok: true, json: async () => ({ categories: [] }) });
      }
      if (String(url).endsWith("search-index.json")) {
        return Promise.resolve({ ok: true, json: async () => searchWithLink });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ records_by_question_uid: {
          "da:2026:set1:main:q1": { answer_uid: "da:2026:set1:main:q1", type: "MCQ", answer: "B" },
        } }),
      });
    });

    await DaQuestionService.init();
    const question = DaQuestionService.questions[0];
    expect(question.question_uid).toBe("da:2026:set1:main:q1");
    expect(question.link).toContain("gateoverflow.in/523225/");
    expect(DaQuestionService.getAnswerForQuestion(question).answer).toBe("B");
  });
});
