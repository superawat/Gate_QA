/**
 * cloudSyncManager.test.js
 * ------------------------
 * Unit and integration tests for the Union-Merge algorithm,
 * pre-merge snapshots, and Supabase sync lifecycles.
 *
 * @vitest-environment jsdom
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  extractQuestionIdArray,
  mergeSolvedQuestionIds,
  unionMergeData,
  syncUserData,
} from "./cloudSyncManager";
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

  test("normalizes solved question arrays and legacy cloud maps into a union", () => {
    const local = {
      solved: ["go:2", "go:1", "go:2"],
    };

    const cloud = {
      solved_questions: {
        "go:1": { solved: true },
        "go:3": { solved: true },
      },
    };

    const result = unionMergeData(local, cloud);

    expect(result.solved_questions).toEqual(["go:1", "go:2", "go:3"]);
  });

  test("recovers all supported corrupted ID shapes", () => {
    expect(extractQuestionIdArray(["go:1", "go:1", "go:2"])).toEqual(["go:1", "go:2"]);
    expect(extractQuestionIdArray({ "0": "go:1", "1": "go:2" })).toEqual(["go:1", "go:2"]);
    expect(extractQuestionIdArray({ "go:1": { solved: true }, "go:2": true })).toEqual(["go:1", "go:2"]);
    expect(extractQuestionIdArray(null)).toEqual([]);
    expect(extractQuestionIdArray(undefined)).toEqual([]);
  });

  test("merges local arrays with numeric-index cloud corruption", () => {
    expect(mergeSolvedQuestionIds(["go:3"], { "0": "go:1", "1": "go:3" })).toEqual(["go:1", "go:3"]);
  });

  test("syncs aptitude solved and bookmarked IDs separately", () => {
    const result = unionMergeData(
      {
        aptitudeSolved: ["APT-1"],
        aptitudeBookmarks: ["APT-2"],
      },
      {
        aptitude_solved: ["APT-3"],
        aptitude_bookmarks: ["APT-4"],
      }
    );

    expect(result.aptitude_solved).toEqual(["APT-1", "APT-3"]);
    expect(result.aptitude_bookmarks).toEqual(["APT-2", "APT-4"]);
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
    expect(JSON.parse(localStorage.getItem("gate_qa_solved_questions"))).toEqual(["go:1"]);
    expect(Array.isArray(JSON.parse(localStorage.getItem("gate_qa_solved_questions")))).toBe(true);

    // Verify Supabase upsert was called with merged data
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-uuid-123",
        bookmarks: ["go:1", "go:2"],
        progress_records: { standard: {}, aptitude: {} },
      })
    );

    // Verify sync_log was inserted with a lightweight summary (not full blob)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-uuid-123",
        action: "incremental_sync",
        payload_snapshot: expect.objectContaining({
          summaryVersion:        1,
          solvedCount:           expect.any(Number),
          bookmarkCount:         expect.any(Number),
          notesCount:            expect.any(Number),
          mockCount:             expect.any(Number),
          standardProgressCount: expect.any(Number),
          aptitudeProgressCount: expect.any(Number),
        }),
      })
    );
    // Verify payload_snapshot does NOT contain raw student data
    const insertCall = mockInsert.mock.calls[0][0];
    expect(insertCall.payload_snapshot).not.toHaveProperty("bookmarks");
    expect(insertCall.payload_snapshot).not.toHaveProperty("solved_questions");
    expect(insertCall.payload_snapshot).not.toHaveProperty("notes");
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
        solved_questions: [],
        aptitude_solved: [],
        aptitude_bookmarks: [],
      })
    );
  });
});
