import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);
const {
  buildCoverageReport,
  classifyQuestion,
} = require("./gateoverflow-answer-coverage");

describe("gateoverflow-answer-coverage", () => {
  test("classifies an answered GateOverflow-backed question", () => {
    const question = {
      question_uid: "go:1001",
      title: "GATE CSE 2014 | Set 2 | Question: 10",
      exam_uid: "cse:2014:set2:main:q10",
      link: "https://gateoverflow.in/1001/gate-cse-2014-set-2-question-10",
    };

    const result = classifyQuestion(
      question,
      {
        "go:1001": { answer: "B", type: "MCQ" },
      },
      new Set()
    );

    expect(result.status).toBe("answered");
    expect(result.paper_key).toBe("2014-set2");
    expect(result.year).toBe(2014);
  });

  test("classifies a missing answer as actionable when it is not in the exception list", () => {
    const report = buildCoverageReport(
      [
        {
          question_uid: "go:2002",
          title: "GATE CSE 2026 | Set 1 | Question: 2",
          exam_uid: "cse:2026:set1:main:q2",
          link: "https://gateoverflow.in/2002/gate-cse-2026-set-1-question-2",
        },
      ],
      {
        records_by_question_uid: {},
      },
      {
        question_uids: [],
      }
    );

    expect(report.summary.gateoverflow_backed_questions).toBe(1);
    expect(report.summary.answered).toBe(0);
    expect(report.summary.missing_answer_actionable).toBe(1);
    expect(report.summary.missing_answer_exception).toBe(0);
    expect(report.sample_actionable_gaps[0].question_uid).toBe("go:2002");
  });

  test("classifies a known unsupported question as an exception", () => {
    const report = buildCoverageReport(
      [
        {
          question_uid: "go:3003",
          title: "GATE CSE 1990 | Question: 3",
          exam_uid: "cse:1990:set1:main:q3",
          link: "https://gateoverflow.in/3003/gate-cse-1990-question-3",
        },
      ],
      {
        records_by_question_uid: {},
      },
      {
        question_uids: ["go:3003"],
      }
    );

    expect(report.summary.missing_answer_actionable).toBe(0);
    expect(report.summary.missing_answer_exception).toBe(1);
    expect(report.sample_exception_gaps[0].question_uid).toBe("go:3003");
  });

  test("falls back to the GateOverflow link when question_uid is absent or malformed", () => {
    const report = buildCoverageReport(
      [
        {
          question_uid: "legacy:bad-uid",
          title: "GATE CSE 2011 | Question: 5",
          exam_uid: "cse:2011:set1:main:q5",
          link: "https://gateoverflow.in/4004/gate-cse-2011-question-5",
        },
        {
          title: "GATE CSE 2012 | Question: 9",
          exam_uid: "cse:2012:set1:main:q9",
          link: "https://gateoverflow.in/5005/gate-cse-2012-question-9",
        },
      ],
      {
        records_by_question_uid: {
          "go:4004": { answer: "A", type: "MCQ" },
        },
      },
      {
        question_uids: ["go:5005"],
      }
    );

    expect(report.summary.gateoverflow_backed_questions).toBe(2);
    expect(report.summary.answered).toBe(1);
    expect(report.summary.missing_answer_exception).toBe(1);
    expect(report.summary.missing_answer_actionable).toBe(0);
    expect(report.sample_exception_gaps[0].question_uid).toBe("go:5005");
  });
});
