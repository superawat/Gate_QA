import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  buildTrackYearSetKey,
  getQuestionTrack,
  getQuestionYearSetIdentity,
  isDaQuestion,
  isItQuestion,
  parseTrackYearSetKey,
} from "../utils/examTrack";
import { QuestionService } from "../services/QuestionService";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const SHARDS_DIR = path.join(PUBLIC_DIR, "question-detail-shards");
const MANIFEST_PATH = path.join(PUBLIC_DIR, "question-bank-manifest.json");

describe("Historical CSE/IT Separation Regression Suite (2004-2008)", () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const historicalYears = [2004, 2005, 2006, 2007, 2008];

  test("Requirement 1 & 2: 2004 CSE contains only CSE questions, 2004 IT contains only IT questions", () => {
    const cseShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "2004-s0.json"), "utf8"));
    const itShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "it-2004-s0.json"), "utf8"));

    const cseQuestions = Object.values(cseShard.recordsByQuestionUid);
    const itQuestions = Object.values(itShard.recordsByQuestionUid);

    expect(cseQuestions).toHaveLength(90);
    expect(itQuestions).toHaveLength(90);

    // CSE questions must NOT be IT
    expect(cseQuestions.every((q) => !isItQuestion(q))).toBe(true);
    expect(cseQuestions.every((q) => q.branch !== "IT" && q.paper_scope !== "official_it")).toBe(true);

    // IT questions must be IT
    expect(itQuestions.every((q) => isItQuestion(q))).toBe(true);
    expect(itQuestions.every((q) => q.branch === "IT" || q.paper_scope === "official_it")).toBe(true);
  });

  test("Requirement 3 & 4: 2005 CSE contains only CSE questions, 2005 IT contains only IT questions", () => {
    const cseShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "2005-s0.json"), "utf8"));
    const itShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "it-2005-s0.json"), "utf8"));

    const cseQuestions = Object.values(cseShard.recordsByQuestionUid);
    const itQuestions = Object.values(itShard.recordsByQuestionUid);

    expect(cseQuestions).toHaveLength(90);
    expect(itQuestions).toHaveLength(90);

    expect(cseQuestions.every((q) => !isItQuestion(q))).toBe(true);
    expect(itQuestions.every((q) => isItQuestion(q))).toBe(true);
  });

  test("Requirement 5 & 6: 2006 CSE contains only CSE questions, 2006 IT contains only IT questions", () => {
    const cseShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "2006-s0.json"), "utf8"));
    const itShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "it-2006-s0.json"), "utf8"));

    const cseQuestions = Object.values(cseShard.recordsByQuestionUid);
    const itQuestions = Object.values(itShard.recordsByQuestionUid);

    expect(cseQuestions).toHaveLength(85);
    expect(itQuestions).toHaveLength(85);

    expect(cseQuestions.every((q) => !isItQuestion(q))).toBe(true);
    expect(itQuestions.every((q) => isItQuestion(q))).toBe(true);
  });

  test("Requirement 7 & 8: 2007 CSE contains only CSE questions, 2007 IT contains only IT questions", () => {
    const cseShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "2007-s0.json"), "utf8"));
    const itShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "it-2007-s0.json"), "utf8"));

    const cseQuestions = Object.values(cseShard.recordsByQuestionUid);
    const itQuestions = Object.values(itShard.recordsByQuestionUid);

    expect(cseQuestions).toHaveLength(85);
    expect(itQuestions).toHaveLength(85);

    expect(cseQuestions.every((q) => !isItQuestion(q))).toBe(true);
    expect(itQuestions.every((q) => isItQuestion(q))).toBe(true);
  });

  test("Requirement 9 & 10: 2008 CSE contains only CSE questions, 2008 IT contains only IT questions", () => {
    const cseShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "2008-s0.json"), "utf8"));
    const itShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, "it-2008-s0.json"), "utf8"));

    const cseQuestions = Object.values(cseShard.recordsByQuestionUid);
    const itQuestions = Object.values(itShard.recordsByQuestionUid);

    expect(cseQuestions).toHaveLength(85);
    expect(itQuestions).toHaveLength(85);

    expect(cseQuestions.every((q) => !isItQuestion(q))).toBe(true);
    expect(itQuestions.every((q) => isItQuestion(q))).toBe(true);
  });

  test("Requirement 11: Selecting a CSE year never silently includes IT questions", () => {
    for (const year of historicalYears) {
      const cseShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, `${year}-s0.json`), "utf8"));
      const cseQuestions = Object.values(cseShard.recordsByQuestionUid);

      const targetIdentity = buildTrackYearSetKey("cse", year, null);
      expect(targetIdentity).toBe(`cse:${year}:set-0`);

      // Every question in the CSE shard must match the CSE identity
      for (const question of cseQuestions) {
        const identity = getQuestionYearSetIdentity(question);
        expect(identity).toBe(targetIdentity);
        expect(identity).not.toBe(`it:${year}:set-0`);
      }

      // IT questions must match IT identity, never CSE identity
      const itShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, `it-${year}-s0.json`), "utf8"));
      const itQuestions = Object.values(itShard.recordsByQuestionUid);
      for (const question of itQuestions) {
        const identity = getQuestionYearSetIdentity(question);
        expect(identity).toBe(`it:${year}:set-0`);
        expect(identity).not.toBe(targetIdentity);
      }
    }
  });

  test("Requirement 12: Existing question UIDs and user progress remain intact", () => {
    // Total historical questions across CSE (435) and IT (435) = 870
    let totalHistorical = 0;
    const allUids = new Set();

    for (const year of historicalYears) {
      const cseShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, `${year}-s0.json`), "utf8"));
      const itShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, `it-${year}-s0.json`), "utf8"));

      Object.keys(cseShard.recordsByQuestionUid).forEach((uid) => {
        expect(allUids.has(uid)).toBe(false);
        allUids.add(uid);
        totalHistorical++;
      });
      Object.keys(itShard.recordsByQuestionUid).forEach((uid) => {
        expect(allUids.has(uid)).toBe(false);
        allUids.add(uid);
        totalHistorical++;
      });
    }

    expect(totalHistorical).toBe(870);
    expect(allUids.size).toBe(870);

    // Well-known UIDs preserved
    expect(allUids.has("go:790")).toBe(true); // IT 2004 Q50
    expect(allUids.has("go:998")).toBe(true); // CSE 2004 Q1
  });

  test("Requirement 13: CSE and DA remain completely isolated", () => {
    for (const year of historicalYears) {
      const cseShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, `${year}-s0.json`), "utf8"));
      const itShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, `it-${year}-s0.json`), "utf8"));

      Object.values(cseShard.recordsByQuestionUid).forEach((q) => {
        expect(isDaQuestion(q)).toBe(false);
        expect(getQuestionTrack(q)).toBe("cse");
      });

      Object.values(itShard.recordsByQuestionUid).forEach((q) => {
        expect(isDaQuestion(q)).toBe(false);
        expect(getQuestionTrack(q)).toBe("cse"); // IT is in CSE track family, not DA
      });
    }
  });

  test("Requirement 14: Existing years where CSE/IT were already unified (2009+) are not split", () => {
    const years2009plus = [2009, 2010, 2011, 2012, 2013];
    for (const year of years2009plus) {
      // Must have standard shard
      expect(fs.existsSync(path.join(SHARDS_DIR, `${year}-s0.json`))).toBe(true);
      // Must NOT have IT shard
      expect(fs.existsSync(path.join(SHARDS_DIR, `it-${year}-s0.json`))).toBe(false);

      const manifestEntry = manifest.yearSets.find((ys) => ys.year === year && !ys.isAdditional);
      expect(manifestEntry).toBeDefined();
      expect(manifestEntry.hasItPaper).toBeFalsy();
    }
  });

  test("Requirement 15: Manifest metadata reflects hasItPaper and correct separate counts", () => {
    for (const year of historicalYears) {
      const cseEntry = manifest.yearSets.find((ys) => ys.key === `${year}-s0`);
      const itEntry = manifest.yearSets.find((ys) => ys.key === `it-${year}-s0`);

      expect(cseEntry).toBeDefined();
      expect(itEntry).toBeDefined();

      expect(cseEntry.hasItPaper).toBe(true);
      expect(cseEntry.track).toBe("cse");
      expect(cseEntry.paperScope).toBe("official_cse");

      expect(itEntry.track).toBe("it");
      expect(itEntry.paperScope).toBe("official_it");
      expect(itEntry.label).toBe(`${year} IT`);

      // Verified separate counts
      if (year === 2004 || year === 2005) {
        expect(cseEntry.count).toBe(90);
      } else {
        expect(cseEntry.count).toBe(85);
      }
    }
  });

  test("User Experience: Selecting CSE returns only CSE, selecting IT returns only IT, selecting both returns both", () => {
    const searchIndex = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, "question-search-index.json"), "utf8"));

    for (const year of historicalYears) {
      const cseIdentity = `cse:${year}:set-0`;
      const itIdentity = `it:${year}:set-0`;

      // 1. Different filter identities
      expect(cseIdentity).not.toBe(itIdentity);

      // 2. Selecting CSE only
      const selectedCseOnly = new Set([cseIdentity]);
      const cseResults = searchIndex.filter((q) => selectedCseOnly.has(q.yearSetIdentity));
      expect(cseResults.length).toBe(year <= 2005 ? 90 : 85);
      expect(cseResults.every((q) => !isItQuestion(q))).toBe(true);

      // 3. Selecting IT only
      const selectedItOnly = new Set([itIdentity]);
      const itResults = searchIndex.filter((q) => selectedItOnly.has(q.yearSetIdentity));
      const expectedItCount = { 2004: 90, 2005: 90, 2006: 85, 2007: 85, 2008: 85 }[year];
      expect(itResults.length).toBe(expectedItCount);
      expect(itResults.every((q) => isItQuestion(q))).toBe(true);

      // 4. Selecting both
      const selectedBoth = new Set([cseIdentity, itIdentity]);
      const bothResults = searchIndex.filter((q) => selectedBoth.has(q.yearSetIdentity));
      expect(bothResults.length).toBe(cseResults.length + itResults.length);
    }
  });

  test("Ordering in manifest has CSE immediately followed by IT for pre-merge years", () => {
    const historical = manifest.yearSets.filter((ys) => ys.year >= 2004 && ys.year <= 2008);
    for (const year of [2008, 2007, 2006, 2005, 2004]) {
      const cseIdx = historical.findIndex((ys) => ys.year === year && ys.track === "cse");
      const itIdx = historical.findIndex((ys) => ys.year === year && ys.track === "it");
      expect(cseIdx).toBeGreaterThanOrEqual(0);
      expect(itIdx).toBeGreaterThanOrEqual(0);
      expect(itIdx).toBe(cseIdx + 1); // IT immediately follows CSE for that year
    }
  });

  test("QuestionService.getStructuredTags produces separate CSE and IT yearSets with distinct keys", () => {
    const rawQuestions = [
      { question_uid: "test:cse2008", year: 2008, branch: "CSE", type: "MCQ", tags: ["gatecse-2008", "algorithms"] },
      { question_uid: "test:it2008", year: 2008, branch: "IT", paper_scope: "official_it", type: "MCQ", tags: ["gateit-2008", "algorithms"] },
    ];
    QuestionService.questions = rawQuestions.map((q) => QuestionService.normalizeQuestion(q));
    const structured = QuestionService.getStructuredTags();
    const cse2008 = structured.yearSets.find((ys) => ys.year === 2008 && ys.track === "cse");
    const it2008 = structured.yearSets.find((ys) => ys.year === 2008 && ys.track === "it");
    expect(cse2008).toBeDefined();
    expect(it2008).toBeDefined();
    expect(cse2008.key).not.toBe(it2008.key);
    expect(cse2008.key).toBe("2008-s0");
    expect(it2008.key).toBe("it-2008-s0");
  });
});
