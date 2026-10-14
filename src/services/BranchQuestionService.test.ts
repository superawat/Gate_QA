import { beforeEach, describe, expect, test, vi } from "vitest";
import { BranchQuestionService } from "./BranchQuestionService";

describe("BranchQuestionService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("loads EC branch index and extracts normalized questions and structured tags", async () => {
    const mockIndex = {
      version: "ec-v1",
      track: "ec",
      questionCount: 2,
      minYear: 2024,
      maxYear: 2024,
      years: [2024],
      yearSets: [
        { key: "ec:2024:set-1", identity: "ec:2024:set-1", label: "2024 Set 1", year: 2024, set: 1, track: "ec" }
      ],
      subjects: [
        { slug: "ec-analog-circuits", label: "Analog Circuits" },
        { slug: "ec-digital-circuits", label: "Digital Circuits" }
      ],
      structuredSubtopics: {
        "ec-analog-circuits": [{ slug: "diodes", label: "Diodes" }]
      },
      questions: [
        {
          question_uid: "ec:2024:set-1:q1",
          year: 2024,
          set: 1,
          subjectSlug: "ec-analog-circuits",
          subjectLabel: "Analog Circuits",
          type: "MCQ",
          preview: "What is the diode voltage?",
          searchText: "diode voltage",
          detailShardKey: "ec-2024-s1",
          subtopics: [{ slug: "diodes", label: "Diodes" }]
        }
      ]
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (String(url).includes("data/ec/search-index.json")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockIndex,
        });
      }
      return Promise.reject(new Error("Unknown url: " + url));
    });

    const questions = await BranchQuestionService.init("ec");
    expect(questions.length).toBe(1);
    expect(questions[0].question_uid).toBe("ec:2024:set-1:q1");
    expect(questions[0].track).toBe("ec");
    expect(BranchQuestionService.isLoaded("ec")).toBe(true);

    const tags = BranchQuestionService.getStructuredTags("ec");
    expect(tags.minYear).toBe(2024);
    expect(tags.subjects?.map(s => s.slug)).toContain("ec-analog-circuits");
    expect(tags.structuredSubtopics?.["ec-analog-circuits"]).toBeDefined();

    expect(BranchQuestionService.getQuestionByUid("ec:2024:set-1:q1")).toBeDefined();
  });

  test("hydrates question details on demand from static shard", async () => {
    const mockDetailShard = {
      recordsByQuestionUid: {
        "ec:2024:set-1:q1": {
          question: "<p>The diode cut-in voltage is 0.7V...</p>",
          options: [{ label: "A", text: "0.7V" }, { label: "B", text: "1.4V" }],
          answer_meta: { type: "MCQ", answer: "A" },
          detailed_solution: "### Step 1: Diode equation..."
        }
      }
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (String(url).includes("question-detail-shards/ec-2024-s1.json")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDetailShard,
        });
      }
      return Promise.reject(new Error("Unknown shard url: " + url));
    });

    const hydrated = await BranchQuestionService.ensureQuestionDetail("ec:2024:set-1:q1");
    expect(hydrated).toBeDefined();
    expect(hydrated?.question).toContain("diode cut-in voltage");
    expect(hydrated?.options?.length).toBe(2);
    expect(hydrated?.detailed_solution).toContain("Diode equation");
  });
});
