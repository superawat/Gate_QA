/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from "vitest";

import { APTITUDE_ENABLED_STORAGE_KEY } from "./aptitudePreference";
import { APTITUDE_USER_STATE_STORAGE_KEYS, USER_STATE_STORAGE_KEYS } from "./localStorageState";
import { LAST_SESSION_STORAGE_KEY } from "./lastSession";
import { MOCK_TEST_HISTORY_STORAGE_KEY } from "./mockTestHistory";
import {
  WORKSPACE_IMPORTED_EVENT,
  WORKSPACE_SCHEMA_VERSION,
  buildWorkspaceSnapshot,
  importWorkspaceSnapshot,
  readWorkspaceFile,
  saveWorkspaceCsv,
} from "./workspaceFile";

const USER_NOTES_STORAGE_KEY = "gate_qa_user_notes";
const DAILY_GOAL_STORAGE_KEY = "gateqa_daily_goal_v1";
const THEME_STORAGE_KEY = "gate_qa_theme";

const createMemoryStorage = () => {
  const values = new Map();
  return {
    getItem: vi.fn((key) => (values.has(key) ? values.get(key) : null)),
    setItem: vi.fn((key, value) => {
      values.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      values.delete(key);
    }),
    clear: vi.fn(() => {
      values.clear();
    }),
  };
};

const writeJson = (storage, key, value) => {
  storage.setItem(key, JSON.stringify(value));
};

describe("workspaceFile", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("builds a normalized workspace snapshot", () => {
    const storage = createMemoryStorage();
    writeJson(storage, USER_STATE_STORAGE_KEYS.solved, ["GATE-1", "GATE-1", ""]);
    writeJson(storage, USER_STATE_STORAGE_KEYS.bookmarked, ["GATE-2"]);
    writeJson(storage, APTITUDE_USER_STATE_STORAGE_KEYS.solved, ["APT-1"]);
    writeJson(storage, USER_STATE_STORAGE_KEYS.progress, { streak: 4 });
    writeJson(storage, LAST_SESSION_STORAGE_KEY, { route: "/practice/question/GATE-1" });
    storage.setItem(THEME_STORAGE_KEY, "dark");
    storage.setItem(DAILY_GOAL_STORAGE_KEY, "7");

    const snapshot = buildWorkspaceSnapshot(storage);

    expect(snapshot.version).toBe(WORKSPACE_SCHEMA_VERSION);
    expect(snapshot.data.gate.solvedQuestions).toEqual(["GATE-1"]);
    expect(snapshot.data.gate.bookmarkedQuestions).toEqual(["GATE-2"]);
    expect(snapshot.data.aptitude.solvedQuestions).toEqual(["APT-1"]);
    expect(snapshot.data.gate.progress).toEqual({ streak: 4 });
    expect(snapshot.data.sessions.lastSession).toEqual({ route: "/practice/question/GATE-1" });
    expect(snapshot.data.preferences.theme).toBe("dark");
    expect(snapshot.data.preferences.dailyGoal).toBe(7);
  });

  test("imports a workspace into known local storage keys", () => {
    const storage = createMemoryStorage();
    const importedEvents = [];
    window.addEventListener(WORKSPACE_IMPORTED_EVENT, (event) => importedEvents.push(event.detail));

    const result = importWorkspaceSnapshot({
      version: WORKSPACE_SCHEMA_VERSION,
      data: {
        gate: {
          solvedQuestions: ["GATE-1", "GATE-1"],
          bookmarkedQuestions: ["GATE-2"],
          metadata: { "GATE-1": { lastAnsweredAt: "2026-05-23T00:00:00.000Z" } },
          progress: { streak: 4 },
        },
        aptitude: {
          solvedQuestions: ["APT-1"],
          bookmarkedQuestions: ["APT-2"],
          metadata: {},
          progress: { daily: 2 },
        },
        sessions: {
          lastSession: { route: "/practice/question/GATE-1" },
          mockAttempt: { attemptId: "active" },
          scratchpadNotes: { "GATE-1": "Review later" },
        },
        mockHistory: [{ attemptId: "mock-1" }],
        preferences: {
          theme: "dark",
          aptitudeEnabled: true,
          dailyGoal: 9,
          streakFreeze: { available: 1 },
        },
      },
    }, storage);

    expect(result.ok).toBe(true);
    expect(result.summary).toEqual({
      gateSolved: 1,
      gateBookmarked: 1,
      aptitudeSolved: 1,
      aptitudeBookmarked: 1,
      mockHistory: 1,
    });
    expect(JSON.parse(storage.getItem(USER_STATE_STORAGE_KEYS.solved))).toEqual(["GATE-1"]);
    expect(JSON.parse(storage.getItem(APTITUDE_USER_STATE_STORAGE_KEYS.bookmarked))).toEqual(["APT-2"]);
    expect(JSON.parse(storage.getItem(USER_NOTES_STORAGE_KEY))).toEqual({ "GATE-1": "Review later" });
    expect(JSON.parse(storage.getItem(MOCK_TEST_HISTORY_STORAGE_KEY))).toEqual([{ attemptId: "mock-1" }]);
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(storage.getItem(DAILY_GOAL_STORAGE_KEY)).toBe("9");
    expect(storage.getItem(APTITUDE_ENABLED_STORAGE_KEY)).toBe("true");
    expect(importedEvents).toHaveLength(1);
  });

  test("rejects invalid workspace payloads without writing", () => {
    const storage = createMemoryStorage();

    const result = importWorkspaceSnapshot({ version: WORKSPACE_SCHEMA_VERSION }, storage);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_workspace");
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test("reads a selected workspace file", async () => {
    const payload = {
      version: WORKSPACE_SCHEMA_VERSION,
      data: {
        gate: { solvedQuestions: ["GATE-1"] },
      },
    };
    const file = new File([JSON.stringify(payload)], "gateqa-backup.json", {
      type: "application/json",
    });

    await expect(readWorkspaceFile(file)).resolves.toEqual(payload);
  });

  test("exports GATE, aptitude, and mock question history to CSV", () => {
    const storage = createMemoryStorage();
    writeJson(storage, USER_STATE_STORAGE_KEYS.progress, {
      "GATE-1": {
        status: "correct",
        attempts: 2,
        correctAttempts: 1,
        incorrectAttempts: 1,
        lastSubmittedAt: "2026-05-01T10:00:00.000Z",
        totalDurationMs: 90000,
      },
    });
    writeJson(storage, APTITUDE_USER_STATE_STORAGE_KEYS.progress, {
      "APT-1": {
        status: "incorrect",
        attempts: 1,
        lastSubmittedAt: "2026-05-02T10:00:00.000Z",
        totalDurationMs: 30000,
      },
    });
    writeJson(storage, MOCK_TEST_HISTORY_STORAGE_KEY, [{
      id: "mock-1",
      kindTitle: "Full Mock",
      selectedPaperLabel: "2026 Set 1",
      submittedAt: "2026-05-03T10:00:00.000Z",
      correctQuestions: [{ questionUid: "go:1", timeSpentSeconds: 45, scoreDelta: 2 }],
      incorrectQuestions: [{ questionUid: "go:2", timeSpentSeconds: 75, scoreDelta: -0.33 }],
      unansweredQuestions: [{ questionUid: "go:3", timeSpentSeconds: 0, scoreDelta: 0 }],
    }]);

    const result = saveWorkspaceCsv({ storage, win: null });

    expect(result.ok).toBe(true);
    expect(result.rowCount).toBe(5);
    expect(result.csvContent).toContain("GATE Practice,GATE-1,correct,2,1,1,2026-05-01T10:00:00.000Z,90");
    expect(result.csvContent).toContain("Aptitude Practice,APT-1,incorrect,1,0,1,2026-05-02T10:00:00.000Z,30");
    expect(result.csvContent).toContain("Mock Test,go:1,correct,1,1,0,2026-05-03T10:00:00.000Z,45,mock-1,Full Mock - 2026 Set 1,2");
    expect(result.csvContent).toContain("Mock Test,go:2,incorrect,1,0,1,2026-05-03T10:00:00.000Z,75,mock-1,Full Mock - 2026 Set 1,-0.33");
    expect(result.csvContent).toContain("Mock Test,go:3,unanswered,1,0,0,2026-05-03T10:00:00.000Z,0,mock-1,Full Mock - 2026 Set 1,0");
  });
});
