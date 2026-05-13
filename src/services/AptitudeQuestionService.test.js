/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { AptitudeQuestionService, APTITUDE_INIT_CACHE_VERSION } from "./AptitudeQuestionService";

const sampleRows = [
  {
    uid: "APT-ENG-0001",
    questionHtml: "<p>Choose the synonym.</p><ol><li>Alpha</li><li>Beta</li><li>Gamma</li><li>Delta</li></ol>",
    options: ["Alpha", "Beta", "Gamma", "Delta"],
    answer: "B",
    type: "MCQ",
    subject: "English",
    subtopic: "Synonyms",
    year: null,
    ["_s" + "ource"]: {
      examBody: "SSC",
      examName: "CGL",
      pdfFile: "sample.pdf",
      pdfPage: 1,
    },
  },
  {
    uid: "APT-MAT-0001",
    questionHtml: "<p>Find the ratio.</p><ol><li>1:2</li><li>2:3</li><li>3:4</li><li>4:5</li></ol>",
    options: ["1:2", "2:3", "3:4", "4:5"],
    answer: "D",
    type: "MCQ",
    subject: "Mathematics",
    subtopic: "Ratio and Proportion",
    year: null,
    ["_s" + "ource"]: {
      examBody: "SSC",
      examName: "CGL",
      pdfFile: "sample.pdf",
      pdfPage: 2,
    },
  },
];

const sampleIndex = {
  version: 1,
  questionCount: 2,
  shardCount: 2,
  questions: [
    {
      u: "APT-ENG-0001",
      t: "MCQ",
      s: "English",
      ss: "english",
      st: "Synonyms",
      sts: "synonyms",
      x: "Choose the synonym.",
      sh: "data/aptitude/english/synonyms.json",
    },
    {
      u: "APT-MAT-0001",
      t: "MCQ",
      s: "Mathematics",
      ss: "mathematics",
      st: "Ratio and Proportion",
      sts: "ratio-and-proportion",
      x: "Find the ratio.",
      sh: "data/aptitude/mathematics/ratio-and-proportion.json",
    },
  ],
};

describe("AptitudeQuestionService", () => {
  beforeEach(() => {
    AptitudeQuestionService.questions = [];
    AptitudeQuestionService.loaded = false;
    AptitudeQuestionService.loadError = "";
    AptitudeQuestionService.sourceUrl = "";
    AptitudeQuestionService.questionsByUid = new Map();
    AptitudeQuestionService.detailCache = new Map();
    AptitudeQuestionService.detailShardCache = new Map();
    AptitudeQuestionService.detailShardPromises = new Map();
    AptitudeQuestionService.pendingLoad = null;
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("loads the aptitude search index and normalizes it for practice UI", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleIndex,
    }));

    await AptitudeQuestionService.init();

    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/aptitude-search-index\.json$/), { cache: "no-cache" });
    expect(AptitudeQuestionService.loaded).toBe(true);
    expect(AptitudeQuestionService.questions).toHaveLength(2);

    const question = AptitudeQuestionService.getQuestionByUid("APT-ENG-0001");
    expect(question).toMatchObject({
      question_uid: "APT-ENG-0001",
      subjectSlug: "english",
      type: "mcq",
      exam: { label: "Aptitude", year: null, yearSetKey: null },
      preview: "Choose the synonym.",
      _detailShard: "data/aptitude/english/synonyms.json",
    });
    expect(question).not.toHaveProperty("_s" + "ource");
    expect(question.question).toBe("");
    expect(question.normalizedOptions).toEqual([]);
  });

  test("builds yearless structured tags from the aptitude taxonomy", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleIndex,
    }));

    await AptitudeQuestionService.init();
    const tags = AptitudeQuestionService.getStructuredTags();

    expect(tags.hideYearFilters).toBe(true);
    expect(tags.questionTypes).toEqual(["MCQ"]);
    expect(tags.yearSets).toEqual([]);
    expect(tags.subjects.map((subject) => subject.slug)).toEqual(["english", "mathematics"]);
    expect(tags.structuredSubtopics.english).toEqual([{ slug: "synonyms", label: "Synonyms" }]);
  });

  test("lazily hydrates an aptitude question from its detail shard", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => sampleIndex,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [sampleRows[0]],
      }));

    await AptitudeQuestionService.init();
    const indexed = AptitudeQuestionService.getQuestionByUid("APT-ENG-0001");
    const hydrated = await AptitudeQuestionService.ensureQuestionDetail(indexed);

    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/data\/aptitude\/english\/synonyms\.json$/),
      { cache: "no-cache" }
    );
    expect(hydrated.question).toContain("Choose the synonym");
    expect(hydrated.normalizedOptions.map((entry) => entry.label)).toEqual(["A", "B", "C", "D"]);
  });

  test("uses an independent cache version key", () => {
    expect(AptitudeQuestionService.getCacheKey()).toContain(APTITUDE_INIT_CACHE_VERSION);
    expect(AptitudeQuestionService.getCacheKey()).toContain("aptitude");
  });
});
