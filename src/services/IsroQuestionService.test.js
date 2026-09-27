import { beforeEach, describe, expect, test, vi } from "vitest";
import { IsroQuestionService } from "./IsroQuestionService";

const mockIsroQuestions = [
  {
    question_uid: "isro:cs:2025:q1",
    exam_uid: "isro-2025-q1",
    title: "ISRO CS 2025 | Question 1",
    link: "https://gateoverflow.in/450700/isro-cse-2025-question-01",
    exam: "ISRO",
    branch: "CSE",
    origin_year: 2025,
    question: "What is the output of the code snippet?",
    type: "MCQ",
    options: [
      { label: "A", text: "10", html: "10" },
      { label: "B", text: "20", html: "20" },
      { label: "C", text: "30", html: "30" },
      { label: "D", text: "40", html: "40" },
    ],
    answer: "B",
    marks: 1,
    negativeMarks: 0.33,
    subject: "algorithms",
    subjectSlug: "algorithms",
    subtopic: "array-and-pointer",
    tags: ["isro", "isro-cs", "isro-2025", "algorithms"],
  },
  {
    question_uid: "isro:cs:2007:q1",
    exam_uid: "isro-2007-q1",
    title: "ISRO CS 2007 | Question 1",
    link: "https://gateoverflow.in/48443/isro2007-01",
    exam: "ISRO",
    branch: "CSE",
    origin_year: 2007,
    question: "The Boolean expression is given by",
    type: "MCQ",
    options: [
      { label: "A", text: "0", html: "0" },
      { label: "B", text: "1", html: "1" },
    ],
    answer: "C",
    marks: 3,
    negativeMarks: 1,
    subject: "digital-logic",
    subjectSlug: "digital-logic",
    subtopic: "boolean-algebra",
    tags: ["isro", "isro-cs", "isro-2007", "digital-logic"],
  },
];

const mockIsroAnswers = {
  records_by_question_uid: {
    "isro:cs:2025:q1": {
      question_uid: "isro:cs:2025:q1",
      type: "MCQ",
      answer: "B",
      marks: 1,
      negativeMarks: 0.33,
    },
    "isro:cs:2007:q1": {
      question_uid: "isro:cs:2007:q1",
      type: "MCQ",
      answer: "C",
      marks: 3,
      negativeMarks: 1,
    },
  },
};

describe("IsroQuestionService", () => {
  beforeEach(() => {
    IsroQuestionService.reset();
    vi.restoreAllMocks();
  });

  test("loads the ISRO index, normalizes tags, marks, and joins answers", async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).endsWith("isro-all.json")) {
        return Promise.resolve({ ok: true, json: async () => mockIsroQuestions });
      }
      return Promise.resolve({ ok: true, json: async () => mockIsroAnswers });
    });

    await IsroQuestionService.init();

    expect(IsroQuestionService.questions.length).toBe(2);

    const q2025 = IsroQuestionService.questions[0];
    expect(q2025.question_uid).toBe("isro:cs:2025:q1");
    expect(q2025.marks).toBe(1);
    expect(q2025.negativeMarks).toBe(0.33);
    expect(q2025.track).toBe("isro");
    expect(q2025.subjectLabel).toBe("Algorithms & Programming");
    expect(IsroQuestionService.getAnswerForQuestion(q2025)?.answer).toBe("B");

    const q2007 = IsroQuestionService.questions[1];
    expect(q2007.marks).toBe(3);
    expect(q2007.negativeMarks).toBe(1);
    expect(q2007.subjectLabel).toBe("Digital Logic");
    expect(IsroQuestionService.getAnswerForQuestion(q2007)?.answer).toBe("C");

    const structuredTags = IsroQuestionService.getStructuredTags();
    expect(structuredTags.yearSets.map((ys) => ys.key)).toContain("isro:2025:set-1");
    expect(structuredTags.yearSets.map((ys) => ys.key)).toContain("isro:2007:set-1");
    expect(structuredTags.subjects.map((s) => s.slug)).toContain("isro:algorithms");
    expect(structuredTags.subjects.map((s) => s.slug)).toContain("isro:digital-logic");

    const paperQuestions = IsroQuestionService.getQuestionsByYearSet(2025);
    expect(paperQuestions.length).toBe(1);
    expect(paperQuestions[0].question_uid).toBe("isro:cs:2025:q1");
  });

  test("ensureQuestionDetail retrieves question from loaded index synchronously", async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).endsWith("isro-all.json")) {
        return Promise.resolve({ ok: true, json: async () => mockIsroQuestions });
      }
      return Promise.resolve({ ok: true, json: async () => mockIsroAnswers });
    });

    const detailed = await IsroQuestionService.ensureQuestionDetail("isro:cs:2025:q1");
    expect(detailed).toBeDefined();
    expect(detailed?.title).toBe("ISRO CS 2025 | Question 1");
    expect(detailed?.question).toContain("output of the code snippet");
    expect(detailed?.question).toContain("<ol");
    expect(detailed?.question).toContain("list-style-type: upper-alpha");
    expect(detailed?.question).toContain(">10</li>");
    expect(detailed?.question).toContain(">40</li>");
    expect(detailed?.preview).toBe("What is the output of the code snippet?");
  });
});
