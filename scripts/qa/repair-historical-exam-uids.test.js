import { createRequire } from "node:module";
import { describe, test, expect } from "vitest";

const require = createRequire(import.meta.url);
const {
  cleanInvisibleText,
  extractLogicalSlot,
  buildCanonicalExamUid,
  repairHistoricalExamUids,
} = require("./repair-historical-exam-uids.js");

describe("repair-historical-exam-uids", () => {
  test("removes invisible bidi characters before parsing question numbers", () => {
    expect(cleanInvisibleText("Question: 1\u200f8")).toBe("Question: 18");
  });

  test("extracts GA logical slot from Question: GA-8 titles", () => {
    expect(
      extractLogicalSlot({
        title: "GATE CSE 2016 Set 1 | Question: GA-8",
      })
    ).toEqual({ section: "ga", number: 8, source: "title" });
  });

  test("builds canonical exam uid for malformed hidden-character titles", () => {
    expect(
      buildCanonicalExamUid({
        exam_uid: "cse:2015:set1:main:q1-8",
        title: "GATE CSE 2015 Set 1 | Question: 1\u200f8",
        year: "gatecse-2015-set1",
      })
    ).toBe("cse:2015:set1:main:q18");
  });

  test("builds canonical exam uid for modified variants", () => {
    expect(
      buildCanonicalExamUid({
        exam_uid: "cse:2014:set2:main:q10-modified",
        title: "GATE CSE 2014 Set 2 | Question: 10 | Modified",
        year: "gatecse-2014-set2",
      })
    ).toBe("cse:2014:set2:main:q10");
  });

  test("normalizes GA section into ga:qN form", () => {
    expect(
      buildCanonicalExamUid({
        exam_uid: "cse:2016:set1:main:qga08",
        title: "GATE CSE 2016 Set 1 | Question: GA-8",
        year: "gatecse-2016-set1",
      })
    ).toBe("cse:2016:set1:ga:q8");
  });

  test("repair pass rewrites only malformed rows in range", () => {
    const result = repairHistoricalExamUids(
      [
        {
          question_uid: "go:1",
          exam_uid: "cse:2015:set1:main:q1-8",
          title: "GATE CSE 2015 Set 1 | Question: 1\u200f8",
          year: "gatecse-2015-set1",
        },
        {
          question_uid: "go:2",
          exam_uid: "cse:2023:set1:main:q1",
          title: "GATE CSE 2023 | Question: 1",
          year: "gatecse-2023",
        },
      ],
      { fromYear: 2010 }
    );

    expect(result.summary.repaired_row_count).toBe(1);
    expect(result.rows[0].exam_uid).toBe("cse:2015:set1:main:q18");
    expect(result.rows[1].exam_uid).toBe("cse:2023:set1:main:q1");
  });
});
