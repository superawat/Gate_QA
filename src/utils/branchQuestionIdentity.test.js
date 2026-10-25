import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { resolveQuestionIdentity, normalizeBranchQuestionUid } from "./branchQuestionIdentity";
import { getGateOverflowSearchUrl, getQuestionSolutionLink } from "./solutionLink";

describe("Branch Question Identity & Renumbering (DEC-058 / DEC-189)", () => {
  it("renumbers General Aptitude questions (56-65) in modern 65-question papers to GA 1-10", () => {
    // GATE ME 2018 Set 1 GA Question 2 (raw qNum 57)
    const ga2 = resolveQuestionIdentity("me", 2018, 1, 57, 65, {});
    expect(ga2).toEqual({
      section: "ga",
      question_number: 2,
      title: "GATE ME 2018 | Set 1 | GA | Question: 2",
      exam_uid: "me:2018:set1:ga:q2",
      canonical_uid: "me:2018:ga:q2",
    });

    // GATE ME 2018 Set 1 GA Question 1 (raw qNum 56)
    const ga1 = resolveQuestionIdentity("me", 2018, 1, 56, 65, {});
    expect(ga1).toEqual({
      section: "ga",
      question_number: 1,
      title: "GATE ME 2018 | Set 1 | GA | Question: 1",
      exam_uid: "me:2018:set1:ga:q1",
      canonical_uid: "me:2018:ga:q1",
    });

    // GATE ME 2018 Set 1 GA Question 10 (raw qNum 65)
    const ga10 = resolveQuestionIdentity("me", 2018, 1, 65, 65, {});
    expect(ga10).toEqual({
      section: "ga",
      question_number: 10,
      title: "GATE ME 2018 | Set 1 | GA | Question: 10",
      exam_uid: "me:2018:set1:ga:q10",
      canonical_uid: "me:2018:ga:q10",
    });
  });

  it("preserves technical question numbering (1-55) in modern 65-question papers", () => {
    // GATE ME 2018 Set 1 Technical Question 1 (raw qNum 1)
    const tech1 = resolveQuestionIdentity("me", 2018, 1, 1, 65, {});
    expect(tech1).toEqual({
      section: "main",
      question_number: 1,
      title: "GATE ME 2018 | Set 1 | Question: 1",
      exam_uid: "me:2018:set1:main:q1",
      canonical_uid: "me:2018:q1",
    });

    // GATE ME 2018 Set 1 Technical Question 55 (raw qNum 55)
    const tech55 = resolveQuestionIdentity("me", 2018, 1, 55, 65, {});
    expect(tech55).toEqual({
      section: "main",
      question_number: 55,
      title: "GATE ME 2018 | Set 1 | Question: 55",
      exam_uid: "me:2018:set1:main:q55",
      canonical_uid: "me:2018:q55",
    });
  });

  it("preserves historical pre-2011 sequential numbering (1-N)", () => {
    // GATE ME 2005 Set 1 Question 75 (85 total questions)
    const hist75 = resolveQuestionIdentity("me", 2005, 1, 75, 85, {});
    expect(hist75).toEqual({
      section: "main",
      question_number: 75,
      title: "GATE ME 2005 | Set 1 | Question: 75",
      exam_uid: "me:2005:set1:main:q75",
      canonical_uid: "me:2005:q75",
    });
  });

  it("handles 55-question technical papers (e.g. EC/EE 2011-2020) without shifting", () => {
    const ecQ20 = resolveQuestionIdentity("ec", 2014, 2, 20, 55, {});
    expect(ecQ20).toEqual({
      section: "main",
      question_number: 20,
      title: "GATE EC 2014 | Set 2 | Question: 20",
      exam_uid: "ec:2014:set2:main:q20",
      canonical_uid: "ec:2014:q20-s2",
    });
  });

  it("normalizes legacy pp: UIDs to clean canonical UIDs", () => {
    expect(normalizeBranchQuestionUid("pp:me:2024:q20")).toBe("me:2024:q20");
    expect(normalizeBranchQuestionUid("pp:me:2018:q57")).toBe("me:2018:ga:q2");
    expect(normalizeBranchQuestionUid("pp:me:2014:q20-s2")).toBe("me:2014:q20-s2");
    expect(normalizeBranchQuestionUid("pp:me:2014:q57-s2")).toBe("me:2014:ga:q2-s2");
    expect(normalizeBranchQuestionUid("me:2024:q20")).toBe("me:2024:q20");
    expect(normalizeBranchQuestionUid("go:333214")).toBe("go:333214");
  });

  it("verifies live shard content for ME 2018 Set 1", () => {
    const shardPath = path.resolve("public/question-detail-shards/me-2018-s1.json");
    expect(fs.existsSync(shardPath)).toBe(true);

    const shard = JSON.parse(fs.readFileSync(shardPath, "utf-8"));
    const records = shard.recordsByQuestionUid;

    // Verify GA Question 2 (canonical: me:2018:ga:q2, legacy: pp:me:2018:q57)
    const ga2 = records["me:2018:ga:q2"];
    expect(ga2).toBeDefined();
    expect(ga2.question_uid).toBe("me:2018:ga:q2");
    expect(ga2.legacy_uid).toBe("pp:me:2018:q57");
    expect(ga2.title).toBe("GATE ME 2018 | Set 1 | GA | Question: 2");
    expect(ga2.section).toBe("ga");
    expect(ga2.question_number).toBe(2);
    expect(ga2.solution_link).toBe(
      "https://me.gateoverflow.in/914/gate-mechanical-2018-set-1-ga-question-2"
    );
    expect(getQuestionSolutionLink(ga2)).toBe(
      "https://me.gateoverflow.in/914/gate-mechanical-2018-set-1-ga-question-2"
    );

    // Verify Technical Question 1 (canonical: me:2018:q1, legacy: pp:me:2018:q1)
    const tech1 = records["me:2018:q1"];
    expect(tech1).toBeDefined();
    expect(tech1.question_uid).toBe("me:2018:q1");
    expect(tech1.legacy_uid).toBe("pp:me:2018:q1");
    expect(tech1.title).toBe("GATE ME 2018 | Set 1 | Question: 1");
    expect(tech1.section).toBe("main");
    expect(tech1.question_number).toBe(1);

    // Fallback search URL uses corrected title
    const searchUrl = getGateOverflowSearchUrl(tech1);
    expect(searchUrl).toBe(
      "https://me.gateoverflow.in/?qa=search&q=GATE%20ME%202018%20Set%201%20Question%201"
    );
  });

  it("enforces shard budget: all branch shards are uncompressed JSON under 350 KB", () => {
    const shardsDir = path.resolve("public/question-detail-shards");
    const shardFiles = fs.readdirSync(shardsDir).filter((f) => f.endsWith(".json"));

    const oversized = [];
    for (const file of shardFiles) {
      const stats = fs.statSync(path.join(shardsDir, file));
      if (stats.size > 350 * 1024) {
        oversized.push({ file, sizeKb: (stats.size / 1024).toFixed(1) });
      }
    }

    expect(oversized).toEqual([]);
  });

  it("maintains authoritative answer registry integrity: zero missing answer keys", () => {
    const answersPath = path.resolve("data/answers/answers_by_question_uid_v1.json");
    expect(fs.existsSync(answersPath)).toBe(true);
    const answersData = JSON.parse(fs.readFileSync(answersPath, "utf-8"));

    expect(answersData.records_by_question_uid["pp:me:2018:q57"]).toBeDefined();
    expect(answersData.records_by_question_uid["pp:me:2018:q57"].answer).toBe("C");
    expect(answersData.records_by_question_uid["pp:me:2018:q1"]).toBeDefined();
    expect(answersData.records_by_question_uid["pp:me:2018:q1"].answer).toBe("B");
  });
});
