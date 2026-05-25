import { describe, expect, test } from "vitest";

import {
  buildHighPriorityTopicsDataset,
  inferQuestionMarks,
} from "./highPriorityTopics";

describe("highPriorityTopics", () => {
  test("infers marks from GateOverflow mark tags", () => {
    expect(inferQuestionMarks({ tags: ["two-marks"] })).toBe(2);
    expect(inferQuestionMarks({ tags: ["one-mark"] })).toBe(1);
    expect(inferQuestionMarks({ tags: ["algorithms"] })).toBe(1);
    expect(inferQuestionMarks({ answer_meta: { marks: 2 }, tags: ["one-mark"] })).toBe(2);
  });

  test("builds a 20-year topic priority dataset from indexed GateOverflow rows", () => {
    const dataset = buildHighPriorityTopicsDataset({
      latestYear: 2026,
      questions: [
        {
          question_uid: "go:1",
          title: "GATE CSE 2026 | Question: 1",
          year: 2026,
          yearSetKey: "2026-s0",
          yearSetLabel: "2026",
          tags: ["algorithms", "dynamic-programming", "two-marks"],
        },
        {
          question_uid: "go:2",
          title: "GATE CSE 2025 | Question: 2",
          year: 2025,
          yearSetKey: "2025-s0",
          yearSetLabel: "2025",
          tags: ["algorithms", "sorting", "one-mark"],
        },
        {
          question_uid: "go:3",
          title: "GATE CSE 2021 | Question: 3",
          year: 2021,
          yearSetKey: "2021-s0",
          yearSetLabel: "2021",
          tags: ["operating-system", "context-switch", "two-mark"],
        },
        {
          question_uid: "go:old",
          title: "GATE CSE 2006 | Question: 1",
          year: 2006,
          yearSetKey: "2006-s0",
          yearSetLabel: "2006",
          tags: ["algorithms", "sorting", "two-marks"],
        },
      ],
    });

    expect(dataset.startYear).toBe(2007);
    expect(dataset.latestYear).toBe(2026);
    expect(dataset.windowYears).toBe(20);
    expect(dataset.questionCount).toBe(3);
    expect(dataset.totalMarks).toBe(5);
    expect(dataset.paperCount).toBe(3);

    const algoSubject = dataset.subjects.find((sub) => sub.label === "Algorithms");
    expect(algoSubject).toMatchObject({
      label: "Algorithms",
      questions: 2,
      totalMarks: 3,
    });
    expect(dataset.topics.map((topic) => topic.label)).toContain("Dynamic Programming");
    expect(dataset.topics.map((topic) => topic.label)).toContain("Context Switch");
    expect(dataset.topics.find((topic) => topic.label === "Dynamic Programming").practiceUrl)
      .toBe("/practice?subjects=algorithms&subtopics=dynamic-programming&hideSolved=1");
  });
});
