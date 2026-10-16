/**
 * @vitest-environment node
 */
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { MockCatalogService } from "./MockCatalogService";

describe("MockCatalogService", () => {
  afterEach(() => {
    MockCatalogService.reset();
  });

  test("normalizeCatalog adds safe defaults and a scorable uid set", () => {
    const catalog = MockCatalogService.normalizeCatalog({
      papers: [{ yearSetKey: "2024-s1", paperReady: true }],
      byQuestionUid: {
        "ga:1": { questionUid: "ga:1", section: "GA", type: "MCQ", scorable: true },
      },
      scorableQuestionUids: ["ga:1", "cs:1"],
    });

    expect(catalog.papers).toHaveLength(1);
    expect(catalog.papers[0].blockedQuestions).toEqual([]);
    expect(catalog.papers[0].statusReason).toBe("");
    expect(catalog.byQuestionUid["ga:1"].type).toBe("MCQ");
    expect(catalog.scorableQuestionUidSet.has("ga:1")).toBe(true);
    expect(catalog.scorableQuestionUidSet.has("missing")).toBe(false);
  });

  test("getQuestionMeta and getReadyPapers read from the normalized catalog", () => {
    MockCatalogService.catalog = MockCatalogService.normalizeCatalog({
      papers: [
        { yearSetKey: "2024-s1", paperReady: true },
        { yearSetKey: "2023-s1", paperReady: false },
      ],
      byQuestionUid: {
        "ga:1": { questionUid: "ga:1", section: "GA", type: "MCQ", scorable: true },
      },
      scorableQuestionUids: ["ga:1"],
    });
    MockCatalogService.loaded = true;

    expect(MockCatalogService.getQuestionMeta("ga:1")).toMatchObject({
      section: "GA",
      type: "MCQ",
    });
    expect(MockCatalogService.getReadyPapers()).toEqual([
      expect.objectContaining({ yearSetKey: "2024-s1", paperReady: true }),
    ]);
  });

  test("generated mock catalog keeps representative historical papers release-ready", () => {
    const catalogPath = path.resolve(process.cwd(), "public", "mock_catalog_v1.json");
    const payload = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    const papers = MockCatalogService.normalizeCatalog(payload).papers;
    const readyPaperKeys = papers
      .filter((paper) => paper.paperReady)
      .map((paper) => paper.yearSetKey);
    const ready2024Paper = papers.find((paper) => paper.yearSetKey === "2024-s1");
    const ready2023Paper = papers.find((paper) => paper.yearSetKey === "2023-s0");
    const ready2019Paper = papers.find((paper) => paper.yearSetKey === "2019-s0");

    expect(readyPaperKeys).toEqual(expect.arrayContaining([
      "2026-s2",
      "2026-s1",
      "2024-s1",
      "2023-s0",
      "2020-s0",
      "2019-s0",
      "2017-s2",
      "2015-s1",
      "2014-s2",
      "2014-s1",
    ]));
    expect(readyPaperKeys.length).toBeGreaterThanOrEqual(27);
    expect(ready2024Paper).toMatchObject({
      paperReady: true,
      scorableCount: 65,
      missingScorableCount: 0,
    });
    expect(ready2023Paper).toMatchObject({ paperReady: true, scorableCount: 65 });
    expect(ready2019Paper).toMatchObject({ paperReady: true, scorableCount: 65 });
  });

  test("includes all 5 IT branch papers (2004-2008) in mock catalog as release-ready", () => {
    const catalogPath = path.resolve(process.cwd(), "public", "mock_catalog_v1.json");
    const payload = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    const papers = MockCatalogService.normalizeCatalog(payload).papers;
    const itPapers = papers.filter((paper) => paper.track === "it" || paper.paperScope === "official_it");

    expect(itPapers).toHaveLength(5);
    expect(itPapers.every((paper) => paper.paperReady)).toBe(true);
    expect(itPapers.map((p) => p.yearSetKey)).toEqual(
      expect.arrayContaining(["it-2008-s0", "it-2007-s0", "it-2006-s0", "it-2005-s0", "it-2004-s0"])
    );
  });

  test("accurately reflects 10 GA and 55 Tech in ME and EC 65-question papers", async () => {
    // Read directly from public/data/me/search-index.json to verify catalog builder contract
    const meIndexPath = path.resolve(process.cwd(), "public", "data", "me", "search-index.json");
    const meData = JSON.parse(fs.readFileSync(meIndexPath, "utf8"));
    const ys2023 = meData.yearSets.find((ys) => ys.year === 2023);
    expect(ys2023).toBeDefined();

    const q2023 = meData.questions.filter((q) => q.yearSetIdentity === ys2023.identity || q.yearSetKey === ys2023.key);
    const ga2023 = q2023.filter((q) => q.subjectSlug === "ga" || q.subject === "General Aptitude");
    const tech2023 = q2023.length - ga2023.length;

    expect(q2023).toHaveLength(65);
    expect(ga2023).toHaveLength(10);
    expect(tech2023).toBe(55);

    // Pre-2010 paper with 0 GA questions
    const ys2001 = meData.yearSets.find((ys) => ys.year === 2001);
    expect(ys2001).toBeDefined();
    const q2001 = meData.questions.filter((q) => q.yearSetIdentity === ys2001.identity || q.yearSetKey === ys2001.key);
    const ga2001 = q2001.filter((q) => q.subjectSlug === "ga" || q.subject === "General Aptitude");
    expect(ga2001).toHaveLength(0);
    expect(q2001.length).toBe(50);
  });

  test("all 65 questions in EC 2023 pass validation for mock pool", async () => {
    const { validateMockQuestionForPool } = await import("../utils/mockTest.js");
    const ecIndexPath = path.resolve(process.cwd(), "public", "data", "ec", "search-index.json");
    const ecData = JSON.parse(fs.readFileSync(ecIndexPath, "utf8"));
    const shardPath = path.resolve(process.cwd(), "public", "question-detail-shards", "ec-2023-s1.json");
    const shardData = JSON.parse(fs.readFileSync(shardPath, "utf8"));

    const q2023 = ecData.questions.filter((q) => q.yearSetIdentity === "ec:2023:set-1" || q.yearSetKey === "ec-2023-s1");
    expect(q2023).toHaveLength(65);

    for (const q of q2023) {
      const qMeta = { scorable: true, type: q.type || "MCQ" };
      // Test unhydrated
      const unhydratedResult = validateMockQuestionForPool({ question: q, questionMeta: qMeta, answerRecord: null });
      expect(unhydratedResult.valid).toBe(true);

      // Test hydrated from shard
      const detail = shardData.recordsByQuestionUid[q.question_uid] || {};
      const hydrated = { ...q, ...detail, answerMeta: detail.answer_meta };
      const answerRecord = { type: detail.answer_meta?.type || q.type, answer: detail.answer_meta?.answer };
      const hydratedResult = validateMockQuestionForPool({ question: hydrated, questionMeta: qMeta, answerRecord });
      expect(hydratedResult.valid).toBe(true);
    }

    // Verify ME 2023
    const meIndexPath = path.resolve(process.cwd(), "public", "data", "me", "search-index.json");
    const meData = JSON.parse(fs.readFileSync(meIndexPath, "utf8"));
    const meShardPath = path.resolve(process.cwd(), "public", "question-detail-shards", "me-2023-s1.json");
    const meShardData = JSON.parse(fs.readFileSync(meShardPath, "utf8"));

    const meQ2023 = meData.questions.filter((q) => q.yearSetIdentity === "me:2023:set-1" || q.yearSetKey === "me-2023-s1");
    expect(meQ2023).toHaveLength(65);

    for (const q of meQ2023) {
      const qMeta = { scorable: true, type: q.type || "MCQ" };
      const unhydratedResult = validateMockQuestionForPool({ question: q, questionMeta: qMeta, answerRecord: null });
      expect(unhydratedResult.valid).toBe(true);

      const detail = meShardData.recordsByQuestionUid[q.question_uid] || {};
      const hydrated = { ...q, ...detail, answerMeta: detail.answer_meta };
      const answerRecord = { type: detail.answer_meta?.type || q.type, answer: detail.answer_meta?.answer };
      const hydratedResult = validateMockQuestionForPool({ question: hydrated, questionMeta: qMeta, answerRecord });
      expect(hydratedResult.valid).toBe(true);
    }
  });
});
