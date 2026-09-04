/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach } from "vitest";
import {
  loadWeakTopicInsights,
  buildWeakTopicInsights,
  clearInsightsCache,
} from "./weakTopicAnalyzer";
import { QuestionService } from "../services/QuestionService";

describe("weakTopicAnalyzer reliability and resilience", () => {
  beforeEach(() => {
    clearInsightsCache();
    QuestionService.loaded = false;
    QuestionService.questions = [];
  });

  test("offline / network failure when questions is null does not throw uncaught error and recovers gracefully", async () => {
    const mockStorage = {
      getItem: vi.fn((key) => {
        if (key === "gateqa_progress_v1") {
          return JSON.stringify({
            "go:100": { attempts: 2, correctAttempts: 1, lastSubmittedAt: "2026-09-01T10:00:00.000Z" },
          });
        }
        if (key === "gateqa_index_cache_v11") {
          return JSON.stringify({
            sourceUrl: "local",
            questions: [
              { question_uid: "go:100", title: "Q100", subjectSlug: "algorithms", subjectLabel: "Algorithms", exam: { year: 2024 } },
            ],
          });
        }
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const failingFetch = vi.fn().mockRejectedValue(new Error("Network offline"));

    // Should not throw
    const insights = await loadWeakTopicInsights({
      fetchImpl: failingFetch,
      storage: mockStorage,
      questions: null,
    });

    expect(insights).toBeDefined();
    expect(insights.attemptedQuestionCount).toBe(1);
    expect(insights.subjects).toBeDefined();
  });

  test("cache key accounts for questions count so passing questions later does not return stale empty cache", async () => {
    const mockStorage = {
      getItem: vi.fn((key) => {
        if (key === "gateqa_progress_v1") {
          return JSON.stringify({
            "go:100": { attempts: 2, correctAttempts: 1, lastSubmittedAt: "2026-09-01T10:00:00.000Z" },
          });
        }
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    // Call 1: questions empty (e.g. initial render before search index loads)
    const result1 = await loadWeakTopicInsights({
      fetchImpl: mockFetch,
      storage: mockStorage,
      questions: [],
    });
    expect(result1.attemptedQuestionCount).toBe(1);

    const realQuestions = [
      {
        question_uid: "go:100",
        title: "Test Question",
        subjectSlug: "algorithms",
        subjectLabel: "Algorithms",
        exam: { year: 2024 },
      },
    ];

    // Call 2: questions provided with metadata
    const result2 = await loadWeakTopicInsights({
      fetchImpl: mockFetch,
      storage: mockStorage,
      questions: realQuestions,
    });

    expect(result2.attemptedQuestionCount).toBe(1);
    expect(result2.subjects.length).toBeGreaterThan(0);
    expect(result2.subjects[0].label).toBe("Algorithms");
  });

  test("unindexed or corrupted question records preserve streak and study activity without crashing", () => {
    const questions = [
      {
        question_uid: "valid:1",
        subjectSlug: "algorithms",
        subjectLabel: "Algorithms",
        exam: { year: 2024 },
      },
    ];

    const progressEntries = [
      ["valid:1", { attempts: 1, correctAttempts: 1, lastSubmittedAt: "2026-09-01T10:00:00.000Z" }],
      // Corrupted / unknown entry
      ["unknown:999", { attempts: 3, correctAttempts: 0, lastSubmittedAt: "2026-09-02T10:00:00.000Z" }],
    ];

    const insights = buildWeakTopicInsights({
      questions,
      progressEntries,
      mockHistory: [],
    });

    expect(insights.attemptedQuestionCount).toBe(2);
    expect(insights.studyActivity.activeDayCount).toBe(2);
    expect(insights.attemptTimeline.length).toBe(2);
  });
});
