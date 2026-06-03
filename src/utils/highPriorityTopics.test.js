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
        {
          question_uid: "go:ga",
          title: "GATE CSE 2026 | GA Question: 1",
          year: 2026,
          yearSetKey: "2026-s0",
          yearSetLabel: "2026",
          tags: ["gatecse-2026", "general-aptitude", "verbal-aptitude", "vocabulary", "one-mark"],
        },
        {
          question_uid: "APT-ENG-0001",
          title: "Special Aptitude Practice",
          year: 2026,
          yearSetKey: "aptitude",
          yearSetLabel: "Special Aptitude",
          tags: ["verbal-aptitude", "vocabulary", "one-mark"],
        },
      ],
    });

    expect(dataset.startYear).toBe(2007);
    expect(dataset.latestYear).toBe(2026);
    expect(dataset.windowYears).toBe(20);
    expect(dataset.questionCount).toBe(4);
    expect(dataset.technicalQuestionCount).toBe(3);
    expect(dataset.aptitudeQuestionCount).toBe(1);
    expect(dataset.totalMarks).toBe(6);
    expect(dataset.paperCount).toBe(3);

    const algoSubject = dataset.technicalSubjects.find((sub) => sub.label === "Algorithms");
    expect(algoSubject).toMatchObject({
      label: "Algorithms",
      latestMarks: 12,
    });
    expect(dataset.officialPeriods.at(-1)).toMatchObject({
      shortLabel: "2026-2",
      year: 2026,
      set: 2,
    });
    expect(dataset.officialMarksItems.find((item) => item.label === "Algorithms").paperSeries.at(-1)).toMatchObject({
      shortLabel: "2026-2",
      marks: 12,
    });
    expect(dataset.technicalSubjects.find((sub) => sub.shortLabel === "EM")).toMatchObject({
      latestMarks: 14,
    });
    expect(dataset.topics.map((topic) => topic.label)).toContain("Dynamic Programming");
    expect(dataset.topics.map((topic) => topic.label)).toContain("Context Switch");
    expect(dataset.topics.find((topic) => topic.label === "Dynamic Programming").practiceUrl)
      .toBe("/practice?subjects=algorithms&subtopics=dynamic-programming&hideSolved=1");
    expect(dataset.aptitudeTopics.find((topic) => topic.label === "Verbal Aptitude")).toMatchObject({
      latestMarks: 1,
    });
    expect(dataset.topics.map((topic) => topic.label)).not.toContain("Vocabulary");

    const dynamicProgramming = dataset.technicalTopics.find((topic) => topic.label === "Dynamic Programming");
    expect(dynamicProgramming.yearSeries.find((entry) => entry.year === 2026)).toMatchObject({
      questions: 1,
      marks: 2,
    });
    expect(dataset.yearTotals.find((entry) => entry.year === 2026)).toMatchObject({
      questions: 2,
      marks: 3,
    });
  });

  test("preserves trusted indexed subject metadata over noisy tags", () => {
    const dataset = buildHighPriorityTopicsDataset({
      latestYear: 2026,
      questions: [
        {
          question_uid: "go:noisy",
          title: "GATE CSE 2026 | Question: 42",
          subjectSlug: "dbms",
          subjectLabel: "Databases",
          year: 2026,
          yearSetKey: "2026-s0",
          yearSetLabel: "2026",
          tags: ["algorithms", "sql", "one-mark"],
        },
      ],
    });

    expect(dataset.technicalTopics.find((topic) => topic.label === "SQL")).toMatchObject({
      subjectSlug: "dbms",
      subjectLabel: "Database Systems",
      questions: 1,
    });
    expect(dataset.technicalTopics.map((topic) => topic.subjectLabel)).not.toContain("Algorithms");
  });
});
