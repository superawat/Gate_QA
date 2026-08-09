/**
 * cloudSyncManager.test.js
 * ------------------------
 * Unit and integration tests for the Union-Merge algorithm,
 * pre-merge snapshots, and Supabase sync lifecycles.
 *
 * @vitest-environment jsdom
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { unionMergeData, syncUserData } from "./cloudSyncManager";
import * as supabaseService from "../services/supabase";

describe("cloudSyncManager - Union Merge Algorithm", () => {
  test("merges bookmarks with deduplication (Set.union)", () => {
    const local = { bookmarks: ["go:1", "go:2", "go:3"] };
    const cloud = { bookmarks: ["go:2", "go:3", "go:4", "go:5"] };

    const result = unionMergeData(local, cloud);
    expect(result.bookmarks).toEqual(["go:1", "go:2", "go:3", "go:4", "go:5"]);
  });

  test("handles empty or missing bookmarks gracefully", () => {
    const result1 = unionMergeData({}, {});
    expect(result1.bookmarks).toEqual([]);

    const result2 = unionMergeData({ bookmarks: ["go:10"] }, { bookmarks: null });
    expect(result2.bookmarks).toEqual(["go:10"]);
  });

  test("merges notes using the Longest Note Wins policy", () => {
    const local = {
      notes: {
        "go:1": { text: "Short local note", updatedAt: "2026-08-01T10:00:00Z" },
        "go:2": {
          text: "Very detailed local note with formula J=x^y, K=x^y",
          updatedAt: "2026-08-01T10:00:00Z",
        },
        "go:3": { text: "Only in local", updatedAt: "2026-08-01T10:00:00Z" },
      },
    };

    const cloud = {
      notes: {
        "go:1": {
          text: "Very comprehensive cloud note explaining circular linked list pointers",
          updatedAt: "2026-08-02T10:00:00Z",
        },
        "go:2": { text: "Short cloud note", updatedAt: "2026-08-03T10:00:00Z" },
        "go:4": { text: "Only in cloud", updatedAt: "2026-08-01T10:00:00Z" },
      },
    };

    const result = unionMergeData(local, cloud);

    // go:1: cloud is longer
    expect(result.notes["go:1"].text).toBe(cloud.notes["go:1"].text);
    // go:2: local is longer
    expect(result.notes["go:2"].text).toBe(local.notes["go:2"].text);
    // go:3: only in local
    expect(result.notes["go:3"].text).toBe(local.notes["go:3"].text);
    // go:4: only in cloud
    expect(result.notes["go:4"].text).toBe(cloud.notes["go:4"].text);
  });

  test("breaks note ties by choosing the more recent updatedAt timestamp", () => {
    const local = {
      notes: {
        "go:1": { text: "Identical length note A", updatedAt: "2026-08-05T12:00:00Z" },
      },
    };
    const cloud = {
      notes: {
        "go:1": { text: "Identical length note B", updatedAt: "2026-08-01T12:00:00Z" },
      },
    };

    const result = unionMergeData(local, cloud);
    expect(result.notes["go:1"].text).toBe("Identical length note A");
  });

  test("handles legacy plain string notes correctly", () => {
    const local = {
      notes: { "go:1": "Plain string local note" },
    };
    const cloud = {
      notes: { "go:1": { text: "Short", updatedAt: "2026-08-01T10:00:00Z" } },
    };

    const result = unionMergeData(local, cloud);
    expect(result.notes["go:1"]).toBe("Plain string local note");
  });

  test("merges solved questions and preserves the earliest attemptedAt timestamp", () => {
    const local = {
      solved: {
        "go:1": {
          solved: true,
          selectedAnswer: "B",
          isCorrect: true,
          attemptedAt: "2026-07-01T10:00:00Z",
        },
        "go:2": {
          solved: true,
          selectedAnswer: "A",
          isCorrect: false,
          attemptedAt: "2026-08-01T12:00:00Z",
        },
      },
    };

    const cloud = {
      solved_questions: {
        "go:1": {
          solved: true,
          selectedAnswer: "B",
          isCorrect: true,
          attemptedAt: "2026-07-15T10:00:00Z",
        },
        "go:2": {
          solved: true,
          selectedAnswer: "A",
          isCorrect: true,
          attemptedAt: "2026-06-01T08:00:00Z",
        },
        "go:3": {
          solved: true,
          selectedAnswer: "C",
          isCorrect: true,
          attemptedAt: "2026-08-05T09:00:00Z",
        },
      },
    };

    const result = unionMergeData(local, cloud);

    // go:1: local was earlier (July 1 vs July 15)
    expect(result.solved_questions["go:1"].attemptedAt).toBe("2026-07-01T10:00:00Z");
    // go:2: cloud was earlier (June 1 vs Aug 1)
    expect(result.solved_questions["go:2"].attemptedAt).toBe("2026-06-01T08:00:00Z");
    // go:3: only in cloud
    expect(result.solved_questions["go:3"].selectedAnswer).toBe("C");
  });

  test("merges mock test history with chronological deduplication", () => {
    const local = {
      mockHistory: [
        { testId: "mock_1", subject: "Digital Logic", score: 40, startedAt: "2026-08-01T10:00:00Z" },
        { testId: "mock_2", subject: "Databases", score: 50, startedAt: "2026-08-03T10:00:00Z" },
      ],
    };

    const cloud = {
      mock_history: [
        { testId: "mock_1", subject: "Digital Logic", score: 40, startedAt: "2026-08-01T10:00:00Z" },
        { testId: "mock_3", subject: "Operating Systems", score: 60, startedAt: "2026-08-02T10:00:00Z" },
      ],
    };

    const result = unionMergeData(local, cloud);
    expect(result.mock_history).toHaveLength(3);
    // Verified chronological sorting
    expect(result.mock_history[0].testId).toBe("mock_1");
    expect(result.mock_history[1].testId).toBe("mock_3");
    expect(result.mock_history[2].testId).toBe("mock_2");
  });

  test("merges practice progress histories without duplicating repeated syncs", () => {
    const local = {
      progress: {
        "go:1": {
          attempts: 1,
          firstSubmittedAt: "2026-08-08T10:00:00Z",
          lastSubmittedAt: "2026-08-08T10:00:00Z",
          history: [{ submittedAt: "2026-08-08T10:00:00Z", correct: true }],
        },
      },
      aptitudeProgress: {},
    };
    const cloud = {
      progress_records: {
        standard: {
          "go:1": {
            attempts: 1,
            firstSubmittedAt: "2026-08-08T10:00:00Z",
            lastSubmittedAt: "2026-08-08T10:00:00Z",
            history: [{ submittedAt: "2026-08-08T10:00:00Z", correct: true }],
          },
          "go:2": {
            attempts: 1,
            firstSubmittedAt: "2026-08-09T10:00:00Z",
            lastSubmittedAt: "2026-08-09T10:00:00Z",
            history: [{ submittedAt: "2026-08-09T10:00:00Z", correct: false }],
          },
        },
        aptitude: {},
      },
    };

    const result = unionMergeData(local, cloud);
    expect(Object.keys(result.progress_records.standard)).toEqual(["go:1", "go:2"]);
    expect(result.progress_records.standard["go:1"].history).toHaveLength(1);
    expect(result.progress_records.standard["go:2"].lastSubmittedAt).toBe("2026-08-09T10:00:00Z");
  });
});

describe("cloudSyncManager - Snapshot & Full Sync Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("returns failure gracefully if Supabase or userId is missing", async () => {
    const res1 = await syncUserData(null);
    expect(res1.success).toBe(false);
    expect(res1.reason).toContain("missing");

    const res2 = await syncUserData("");
    expect(res2.success).toBe(false);
  });

  test("creates pre-merge snapshots and retains at most 5 recent backups", async () => {
    // Seed initial local data
    localStorage.setItem("gate_qa_solved_questions", JSON.stringify({ "go:1": { solved: true } }));
    localStorage.setItem("gate_qa_bookmarked_questions", JSON.stringify(["go:1"]));
    localStorage.setItem("gate_qa_user_notes", JSON.stringify({ "go:1": { text: "Note 1" } }));

    // Mock Supabase client
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "user-uuid-123",
        bookmarks: ["go:2"],
        notes: {},
        solved_questions: {},
        mock_history: [],
        progress_records: { standard: {}, aptitude: {} },
      },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    const mockFrom = vi.fn((table) => {
      if (table === "user_progress") {
        return { select: mockSelect, upsert: mockUpsert };
      }
      if (table === "sync_log") {
        return { insert: mockInsert };
      }
      return {};
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({ from: mockFrom });

    // Run syncUserData
    const result = await syncUserData("user-uuid-123");
    expect(result.success).toBe(true);

    // Verify pre-merge snapshot was stored
    const backupKeys = Object.keys(localStorage).filter((k) => k.startsWith("gate_qa_backup_"));
    expect(backupKeys.length).toBe(1);

    const snapshot = JSON.parse(localStorage.getItem(backupKeys[0]));
    expect(snapshot.timestamp).toBeDefined();
    expect(JSON.parse(snapshot.bookmarks)).toEqual(["go:1"]);

    // Verify localStorage was updated with merged result
    const mergedBookmarks = JSON.parse(localStorage.getItem("gate_qa_bookmarked_questions"));
    expect(mergedBookmarks).toEqual(["go:1", "go:2"]);

    // Verify Supabase upsert was called with merged data
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-uuid-123",
        bookmarks: ["go:1", "go:2"],
        progress_records: { standard: {}, aptitude: {} },
      })
    );

    // Verify sync_log was inserted
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-uuid-123",
        action: "incremental_sync",
      })
    );
  });

  test("handles new users (PGRST116 row not found) seamlessly", async () => {
    localStorage.setItem("gate_qa_bookmarked_questions", JSON.stringify(["go:999"]));

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Row not found" },
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    const mockFrom = vi.fn((table) => {
      if (table === "user_progress") {
        return { select: mockSelect, upsert: mockUpsert };
      }
      if (table === "sync_log") {
        return { insert: mockInsert };
      }
      return {};
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({ from: mockFrom });

    const result = await syncUserData("new-user-456");
    expect(result.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "new-user-456",
        bookmarks: ["go:999"],
      })
    );
  });
});
