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
    const blocked2019Paper = papers.find((paper) => paper.yearSetKey === "2019-s0");

    expect(readyPaperKeys).toEqual(expect.arrayContaining([
      "2025-s1",
      "2024-s1",
      "2023-s0",
      "2017-s2",
      "2014-s1",
    ]));
    expect(readyPaperKeys.length).toBeGreaterThanOrEqual(10);
    expect(blocked2019Paper).toMatchObject({
      paperReady: false,
      missingScorableCount: 1,
    });
    expect(blocked2019Paper.statusReason).toMatch(/missing verified answers/i);
    expect(blocked2019Paper.blockedQuestions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        questionUid: "go:302794",
        section: "CS",
        orderIndex: 54,
      }),
    ]));
  });
});
