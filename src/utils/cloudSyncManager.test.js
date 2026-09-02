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
  mergeTrackerTheory,
  mergeTrackerNotes,
  mergeTrackerRevisionsSummary,
  mergeTrackerPreferences,
  syncTrackerData,
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

  test("syncs DA solved, bookmarks, and namespaced progress separately", () => {
    const result = unionMergeData(
      {
        daSolved: ["da:2026:set1:main:q2"],
        daBookmarks: ["da:2025:set1:main:q4"],
        daProgress: {
          "da:2026:set1:main:q2": {
            attempts: 1,
            firstSubmittedAt: "2026-08-12T10:00:00Z",
            lastSubmittedAt: "2026-08-12T10:00:00Z",
            history: [{ submittedAt: "2026-08-12T10:00:00Z", correct: true }],
          },
        },
      },
      {
        da_solved: ["da:2026:set1:main:q3"],
        da_bookmarks: ["da:2025:set1:main:q5"],
        progress_records: {
          standard: {},
          aptitude: {},
          da: {
            "da:2026:set1:main:q2": {
              attempts: 2,
              lastSubmittedAt: "2026-08-13T10:00:00Z",
              history: [{ submittedAt: "2026-08-13T10:00:00Z", correct: false }],
            },
          },
        },
      }
    );

    expect(result.da_solved).toEqual([
      "da:2026:set1:main:q2",
      "da:2026:set1:main:q3",
    ]);
    expect(result.da_bookmarks).toEqual([
      "da:2025:set1:main:q4",
      "da:2025:set1:main:q5",
    ]);
    expect(result.progress_records.da["da:2026:set1:main:q2"].attempts).toBe(2);
    expect(result.progress_records.da["da:2026:set1:main:q2"].history).toHaveLength(2);
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

    const mockTrackerHandler = {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockFrom = vi.fn((table) => {
      if (table === "user_progress") {
        return { select: mockSelect, upsert: mockUpsert };
      }
      if (table === "user_tracker") {
        return mockTrackerHandler;
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

    const mergedBookmarks = JSON.parse(localStorage.getItem("gate_qa_bookmarked_questions"));
    expect(mergedBookmarks).toEqual(["go:1", "go:2"]);
    expect(JSON.parse(localStorage.getItem("gate_qa_solved_questions"))).toEqual(["go:1"]);
    expect(Array.isArray(JSON.parse(localStorage.getItem("gate_qa_solved_questions")))).toBe(true);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-uuid-123",
        bookmarks: ["go:1", "go:2"],
        aptitude_solved: expect.any(Array),
        aptitude_bookmarks: expect.any(Array),
        da_solved: expect.any(Array),
        da_bookmarks: expect.any(Array),
        progress_records: expect.objectContaining({ standard: {}, aptitude: {}, da: {} }),
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
          daProgressCount:       expect.any(Number),
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

    const mockTrackerHandler = {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockFrom = vi.fn((table) => {
      if (table === "user_progress") {
        return { select: mockSelect, upsert: mockUpsert };
      }
      if (table === "user_tracker") {
        return mockTrackerHandler;
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
        da_solved: [],
        da_bookmarks: [],
      })
    );
  });

  test("recovers via Tier 2 fallback preserving Aptitude columns when DA column is missing", async () => {
    localStorage.setItem("gate_qa_solved_questions", JSON.stringify(["cse:2026:set1:q1"]));
    localStorage.setItem("gateqa-apt-solved-questions", JSON.stringify(["apt:2026:q1"]));
    localStorage.setItem("gate_qa_da_solved_questions", JSON.stringify(["da:2026:set1:q1"]));

    let upsertPayloads = [];
    const mockUpsert = vi.fn().mockImplementation((payload) => {
      upsertPayloads.push(payload);
      if (upsertPayloads.length === 1) {
        return Promise.resolve({
          error: { code: "PGRST204", message: "Could not find column 'da_solved' in schema" },
        });
      }
      return Promise.resolve({ error: null });
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "user-retry-123",
        bookmarks: [],
        notes: {},
        solved_questions: [],
        aptitude_solved: [],
        aptitude_bookmarks: [],
        mock_history: [],
        progress_records: { standard: {}, aptitude: {}, da: {} },
      },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    const mockTrackerHandler = {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockFrom = vi.fn((table) => {
      if (table === "user_progress") {
        return { select: mockSelect, upsert: mockUpsert };
      }
      if (table === "user_tracker") {
        return mockTrackerHandler;
      }
      if (table === "sync_log") {
        return { insert: mockInsert };
      }
      return {};
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({ from: mockFrom });

    const result = await syncUserData("user-retry-123");
    expect(result.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalledTimes(2);

    // Initial attempt has all 12 columns
    expect(upsertPayloads[0]).toHaveProperty("da_solved");
    expect(upsertPayloads[0]).toHaveProperty("aptitude_solved");

    // Tier 2 fallback preserves aptitude columns as top-level fields
    expect(upsertPayloads[1]).toHaveProperty("aptitude_solved", ["apt:2026:q1"]);
    expect(upsertPayloads[1]).toHaveProperty("aptitude_bookmarks");
    expect(upsertPayloads[1].progress_records.da_solved).toEqual(["da:2026:set1:q1"]);

    // Merged return data keeps all fields intact
    expect(result.data.aptitude_solved).toEqual(["apt:2026:q1"]);
    expect(result.data.da_solved).toEqual(["da:2026:set1:q1"]);
  });

  test("recovers via Tier 3 core baseline fallback on legacy schema missing both DA and Aptitude columns", async () => {
    localStorage.setItem("gate_qa_solved_questions", JSON.stringify(["cse:2026:set1:q1"]));
    localStorage.setItem("gateqa-apt-solved-questions", JSON.stringify(["apt:2026:q1"]));
    localStorage.setItem("gate_qa_da_solved_questions", JSON.stringify(["da:2026:set1:q1"]));

    let callCount = 0;
    const mockUpsert = vi.fn().mockImplementation((payload) => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.resolve({ error: { code: "PGRST204", message: "Missing da_solved" } });
      }
      if (callCount === 2) {
        return Promise.resolve({ error: { code: "PGRST204", message: "Missing aptitude_solved" } });
      }
      return Promise.resolve({ error: null });
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    const mockTrackerHandler = {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockFrom = vi.fn((table) => {
      if (table === "user_progress") {
        return { select: mockSelect, upsert: mockUpsert };
      }
      if (table === "user_tracker") {
        return mockTrackerHandler;
      }
      if (table === "sync_log") {
        return { insert: mockInsert };
      }
      return {};
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({ from: mockFrom });

    const result = await syncUserData("user-legacy-baseline");
    expect(result.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalledTimes(3);

    // In Tier 3, all arrays are preserved safely inside progress_records
    const tier3Payload = mockUpsert.mock.calls[2][0];
    expect(tier3Payload.progress_records.aptitude_solved).toEqual(["apt:2026:q1"]);
    expect(tier3Payload.progress_records.da_solved).toEqual(["da:2026:set1:q1"]);
    expect(result.data.aptitude_solved).toEqual(["apt:2026:q1"]);
    expect(result.data.da_solved).toEqual(["da:2026:set1:q1"]);
  });

  test("exact cross-device scenario: syncs mobile progress (25 attempts, 13 days, 6 streak) to desktop", async () => {
    // 1. Setup mobile progress (13 active days, 25 attempts, 3 today, 6-day streak)
    const baseDate = "2026-08-14";
    const generateHistoryEntry = (dayOffset, count = 1) => {
      const d = new Date(`${baseDate}T12:00:00.000Z`);
      d.setUTCDate(d.getUTCDate() - dayOffset);
      const submittedAt = d.toISOString();
      const history = [];
      for (let i = 0; i < count; i++) {
        history.push({
          submittedAt: new Date(d.getTime() + i * 60000).toISOString(),
          correct: true,
          durationMs: 45000,
          type: "MCQ",
        });
      }
      return {
        attempts: count,
        correctAttempts: count,
        incorrectAttempts: 0,
        correct: true,
        firstSubmittedAt: history[0].submittedAt,
        lastSubmittedAt: history[history.length - 1].submittedAt,
        history,
      };
    };

    const mobileProgress = {
      "cse:2026:set1:q1": generateHistoryEntry(0, 1), // Day 0 (Aug 14): 3 attempts on 3 questions
      "cse:2026:set1:q2": generateHistoryEntry(0, 1),
      "cse:2026:set1:q3": generateHistoryEntry(0, 1),
      "cse:2026:set1:q4": generateHistoryEntry(1, 1), // Day 1 (Aug 13): 2 attempts
      "cse:2026:set1:q5": generateHistoryEntry(1, 1),
      "cse:2026:set1:q6": generateHistoryEntry(2, 1), // Day 2 (Aug 12): 2 attempts
      "cse:2026:set1:q7": generateHistoryEntry(2, 1),
      "cse:2026:set1:q8": generateHistoryEntry(3, 1), // Day 3 (Aug 11): 2 attempts
      "cse:2026:set1:q9": generateHistoryEntry(3, 1),
      "cse:2026:set1:q10": generateHistoryEntry(4, 1), // Day 4 (Aug 10): 2 attempts
      "cse:2026:set1:q11": generateHistoryEntry(4, 1),
      "cse:2026:set1:q12": generateHistoryEntry(5, 1), // Day 5 (Aug 09): 2 attempts -> 6 consecutive days (Aug 9-14)
      "cse:2026:set1:q13": generateHistoryEntry(5, 1),
      "cse:2026:set1:q14": generateHistoryEntry(10, 1), // Day 10: 2 attempts
      "cse:2026:set1:q15": generateHistoryEntry(10, 1),
      "cse:2026:set1:q16": generateHistoryEntry(15, 1), // Day 15: 2 attempts
      "cse:2026:set1:q17": generateHistoryEntry(15, 1),
      "cse:2026:set1:q18": generateHistoryEntry(20, 1), // Day 20: 2 attempts
      "cse:2026:set1:q19": generateHistoryEntry(20, 1),
      "cse:2026:set1:q20": generateHistoryEntry(25, 1), // Day 25: 2 attempts
      "cse:2026:set1:q21": generateHistoryEntry(25, 1),
      "cse:2026:set1:q22": generateHistoryEntry(30, 1), // Day 30: 2 attempts
      "cse:2026:set1:q23": generateHistoryEntry(30, 1),
      "cse:2026:set1:q24": generateHistoryEntry(35, 1), // Day 35: 1 attempt
      "cse:2026:set1:q25": generateHistoryEntry(40, 1), // Day 40: 1 attempt -> Total 13 active days, 25 attempts
    };

    const desktopOlderProgress = {
      "cse:2026:set1:q14": generateHistoryEntry(10, 1),
      "cse:2026:set1:q15": generateHistoryEntry(10, 1),
      "cse:2026:set1:q16": generateHistoryEntry(15, 1),
      "cse:2026:set1:q17": generateHistoryEntry(15, 1),
      "cse:2026:set1:q18": generateHistoryEntry(20, 1),
      "cse:2026:set1:q19": generateHistoryEntry(20, 1),
      "cse:2026:set1:q20": generateHistoryEntry(25, 1),
      "cse:2026:set1:q21": generateHistoryEntry(25, 1),
      "cse:2026:set1:q22": generateHistoryEntry(30, 1),
      "cse:2026:set1:q23": generateHistoryEntry(30, 1),
      "cse:2026:set1:q24": generateHistoryEntry(35, 1),
      "cse:2026:set1:q25": generateHistoryEntry(40, 1),
    };

    // Shared cloud state in Supabase
    let cloudStore = {
      user_id: "user-cross-device",
      bookmarks: [],
      notes: {},
      solved_questions: Object.keys(desktopOlderProgress),
      aptitude_solved: [],
      aptitude_bookmarks: [],
      mock_history: [],
      progress_records: { standard: desktopOlderProgress, aptitude: {} },
    };

    const mockUpsert = vi.fn().mockImplementation((payload) => {
      cloudStore = { ...cloudStore, ...payload };
      return Promise.resolve({ error: null });
    });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSingle = vi.fn().mockImplementation(() => Promise.resolve({
      data: cloudStore,
      error: null,
    }));
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    const mockTrackerHandler = {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockFrom = vi.fn((table) => {
      if (table === "user_progress") {
        return { select: mockSelect, upsert: mockUpsert };
      }
      if (table === "user_tracker") {
        return mockTrackerHandler;
      }
      if (table === "sync_log") {
        return { insert: mockInsert };
      }
      return {};
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({ from: mockFrom });

    // Step A: Mobile syncs to cloud
    localStorage.setItem("gateqa_progress_v1", JSON.stringify(mobileProgress));
    localStorage.setItem("gate_qa_solved_questions", JSON.stringify(Object.keys(mobileProgress)));

    const mobileSyncResult = await syncUserData("user-cross-device");
    expect(mobileSyncResult.success).toBe(true);

    // Step B: Desktop (simulated by clearing local and loading desktopOlderProgress) syncs from cloud
    localStorage.clear();
    localStorage.setItem("gateqa_progress_v1", JSON.stringify(desktopOlderProgress));
    localStorage.setItem("gate_qa_solved_questions", JSON.stringify(Object.keys(desktopOlderProgress)));

    const desktopSyncResult = await syncUserData("user-cross-device");
    expect(desktopSyncResult.success).toBe(true);

    // Step C: Verify desktop now contains all 25 questions with complete history
    const finalDesktopProgress = JSON.parse(localStorage.getItem("gateqa_progress_v1"));
    expect(Object.keys(finalDesktopProgress).length).toBe(25);
    expect(finalDesktopProgress["cse:2026:set1:q1"].attempts).toBe(1);

    // Step D: Calculate activity with weakTopicAnalyzer on Desktop
    const { loadStudyActivityFast } = await import("./weakTopicAnalyzer");
    const desktopActivity = loadStudyActivityFast({
      now: new Date(`${baseDate}T15:00:00.000Z`),
    });

    expect(desktopActivity.activeDayCount).toBe(13);
    expect(desktopActivity.currentStreak).toBe(6);
    expect(desktopActivity.longestStreak).toBe(6);
    expect(desktopActivity.todayAttempts).toBe(3);
    expect(desktopActivity.badges).toContain("25 attempts");
  });

  describe("Preparation Tracker Union Merge & Sync Engine", () => {
    test("merges theory completions with union rule", () => {
      const localTheory = {
        "cse-os-deadlocks": { isCompleted: true, completedAt: "2026-08-01T10:00:00Z" },
        "cse-os-scheduling": { isCompleted: false, completedAt: null },
      };
      const cloudTheory = {
        "cse-os-scheduling": { isCompleted: true, completedAt: "2026-08-02T10:00:00Z" },
        "cse-os-memory": { isCompleted: true, completedAt: "2026-08-03T10:00:00Z" },
      };

      const merged = mergeTrackerTheory(localTheory, cloudTheory);
      expect(merged["cse-os-deadlocks"].isCompleted).toBe(true);
      expect(merged["cse-os-scheduling"].isCompleted).toBe(true);
      expect(merged["cse-os-memory"].isCompleted).toBe(true);
    });

    test("merges topic notes using Last-Write-Wins (LWW) and respects deletion tombstones", () => {
      const localNotes = {
        "cse-os-deadlocks": {
          content: "Banker's Algorithm: Need <= Available",
          updatedAt: "2026-08-05T12:00:00Z",
          isDeleted: false,
        },
        "cse-os-paging": {
          content: "Old local note",
          updatedAt: "2026-08-01T10:00:00Z",
          isDeleted: false,
        },
        "cse-os-threads": {
          content: "Deleted locally",
          updatedAt: "2026-08-10T15:00:00Z",
          isDeleted: true, // Tombstone
        },
      };

      const cloudNotes = {
        "cse-os-deadlocks": {
          content: "Slightly older cloud note",
          updatedAt: "2026-08-04T12:00:00Z",
          isDeleted: false,
        },
        "cse-os-paging": {
          content: "Newer cloud formula: EMAT = h(tlb+m)+(1-h)(tlb+2m)",
          updatedAt: "2026-08-08T10:00:00Z",
          isDeleted: false,
        },
        "cse-os-threads": {
          content: "Very long thread summary that was deleted later",
          updatedAt: "2026-08-02T10:00:00Z",
          isDeleted: false,
        },
      };

      const merged = mergeTrackerNotes(localNotes, cloudNotes);

      // Local newer note wins
      expect(merged["cse-os-deadlocks"].content).toBe("Banker's Algorithm: Need <= Available");

      // Cloud newer note wins
      expect(merged["cse-os-paging"].content).toBe("Newer cloud formula: EMAT = h(tlb+m)+(1-h)(tlb+2m)");

      // Deletion tombstone wins because it has newer timestamp
      expect(merged["cse-os-threads"].isDeleted).toBe(true);
    });

    test("merges bounded revision summaries without unbounded event growth", () => {
      const localRevisions = {
        "cse-os-deadlocks": [
          { id: "rev_1", timestamp: "2026-08-01T10:00:00Z", source: "practice", accuracyRate: 0.8 },
        ],
      };
      const cloudSummary = {
        "cse-os-deadlocks": {
          lastRevisedAt: "2026-08-10T10:00:00Z",
          lastSessionAccuracy: 0.9,
          totalRevisionCount: 3,
        },
      };

      const merged = mergeTrackerRevisionsSummary(localRevisions, cloudSummary);
      expect(merged["cse-os-deadlocks"].totalRevisionCount).toBe(3);
      expect(merged["cse-os-deadlocks"].lastRevisedAt).toBe("2026-08-10T10:00:00Z");
      expect(merged["cse-os-deadlocks"].lastSessionAccuracy).toBe(0.9);
    });

    test("merges preferences using Last-Write-Wins", () => {
      const localPrefs = {
        activeTrack: "cse",
        countdownDisplayMode: "compact",
        updatedAt: "2026-08-01T10:00:00Z",
      };
      const cloudPrefs = {
        active_track: "da",
        countdown_display_mode: "hero",
        updated_at: "2026-08-05T10:00:00Z", // Newer
      };

      const merged = mergeTrackerPreferences(localPrefs, cloudPrefs);
      expect(merged.activeTrack).toBe("da");
      expect(merged.countdownDisplayMode).toBe("hero");
    });
  });
});
