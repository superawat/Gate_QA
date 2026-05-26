import {
  APTITUDE_USER_STATE_STORAGE_KEYS,
  USER_STATE_STORAGE_KEYS,
  readStorageJson,
  writeStorageJson,
} from "./localStorageState";
import { APTITUDE_ENABLED_CHANGE_EVENT, APTITUDE_ENABLED_STORAGE_KEY } from "./aptitudePreference";
import { LAST_SESSION_STORAGE_KEY } from "./lastSession";
import { MOCK_TEST_HISTORY_STORAGE_KEY } from "./mockTestHistory";

export const WORKSPACE_SCHEMA_VERSION = "1.0.0";
export const WORKSPACE_FILE_EXTENSION = ".json";
export const WORKSPACE_MIME_TYPE = "application/json";
export const WORKSPACE_IMPORTED_EVENT = "gateqa:workspace-imported";

const USER_NOTES_STORAGE_KEY = "gate_qa_user_notes";
const STREAK_FREEZE_STORAGE_KEY = "gateqa_streak_freeze_v1";
const DAILY_GOAL_STORAGE_KEY = "gateqa_daily_goal_v1";
const THEME_STORAGE_KEY = "gate_qa_theme";
const MOCK_ATTEMPT_STORAGE_KEY = "gateqa_mock_attempt_v1";

const todayStamp = () => new Date().toISOString().slice(0, 10);

const getDefaultStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage || null;
};

const readRaw = (storage, key, fallback = null) => {
  try {
    const value = storage?.getItem?.(key);
    return value === null || value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
};

const writeRaw = (storage, key, value) => {
  try {
    if (value === null || value === undefined || value === "") {
      storage?.removeItem?.(key);
    } else {
      storage?.setItem?.(key, String(value));
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "write_failed", error };
  }
};

const writePreferenceRaw = (storage, key, value) => {
  const serialized = typeof value === "string"
    ? value
    : value === null || value === undefined
      ? value
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return writeRaw(storage, key, serialized);
};

const parseMaybeJson = (value, fallback) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
};

const compactStringArray = (value) => (
  Array.isArray(value)
    ? Array.from(new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean)))
    : []
);

export const buildWorkspaceSnapshot = (storage = getDefaultStorage()) => ({
  $schema: "https://gateqa.app/schemas/workspace-v1.json",
  version: WORKSPACE_SCHEMA_VERSION,
  timestamp: new Date().toISOString(),
  meta: {
    client: "GateQA Web Client",
    platform: "PWA Offline",
  },
  data: {
    gate: {
      solvedQuestions: compactStringArray(readStorageJson(USER_STATE_STORAGE_KEYS.solved, [], storage)),
      bookmarkedQuestions: compactStringArray(readStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, [], storage)),
      metadata: readStorageJson(USER_STATE_STORAGE_KEYS.metadata, {}, storage),
      progress: readStorageJson(USER_STATE_STORAGE_KEYS.progress, {}, storage),
    },
    aptitude: {
      solvedQuestions: compactStringArray(readStorageJson(APTITUDE_USER_STATE_STORAGE_KEYS.solved, [], storage)),
      bookmarkedQuestions: compactStringArray(readStorageJson(APTITUDE_USER_STATE_STORAGE_KEYS.bookmarked, [], storage)),
      metadata: readStorageJson(APTITUDE_USER_STATE_STORAGE_KEYS.metadata, {}, storage),
      progress: readStorageJson(APTITUDE_USER_STATE_STORAGE_KEYS.progress, {}, storage),
    },
    sessions: {
      lastSession: readStorageJson(LAST_SESSION_STORAGE_KEY, null, storage),
      mockAttempt: readStorageJson(MOCK_ATTEMPT_STORAGE_KEY, null, storage),
      scratchpadNotes: readStorageJson(USER_NOTES_STORAGE_KEY, {}, storage),
    },
    mockHistory: readStorageJson(MOCK_TEST_HISTORY_STORAGE_KEY, [], storage),
    preferences: {
      theme: readRaw(storage, THEME_STORAGE_KEY, ""),
      aptitudeEnabled: readRaw(storage, APTITUDE_ENABLED_STORAGE_KEY, ""),
      dailyGoal: parseMaybeJson(readRaw(storage, DAILY_GOAL_STORAGE_KEY, null), null),
      streakFreeze: readStorageJson(STREAK_FREEZE_STORAGE_KEY, {}, storage),
    },
  },
});

const normalizeWorkspacePayload = (payload) => {
  const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Workspace file is not a JSON object.");
  }
  if (!parsed.data || typeof parsed.data !== "object") {
    throw new Error("Workspace file is missing its data section.");
  }
  return parsed;
};

const writeWorkspaceJson = (storage, key, value) => (
  value === null || value === undefined
    ? { ok: true }
    : writeStorageJson(key, value, storage)
);

export const importWorkspaceSnapshot = (payload, storage = getDefaultStorage()) => {
  if (!storage) {
    return { ok: false, reason: "storage_unavailable" };
  }

  let workspace;
  try {
    workspace = normalizeWorkspacePayload(payload);
  } catch (error) {
    return { ok: false, reason: "invalid_workspace", error };
  }

  const { gate = {}, aptitude = {}, sessions = {}, preferences = {}, mockHistory = [] } = workspace.data;
  const writes = [
    writeStorageJson(USER_STATE_STORAGE_KEYS.solved, compactStringArray(gate.solvedQuestions), storage),
    writeStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, compactStringArray(gate.bookmarkedQuestions), storage),
    writeWorkspaceJson(storage, USER_STATE_STORAGE_KEYS.metadata, gate.metadata || {}),
    writeWorkspaceJson(storage, USER_STATE_STORAGE_KEYS.progress, gate.progress || {}),
    writeStorageJson(APTITUDE_USER_STATE_STORAGE_KEYS.solved, compactStringArray(aptitude.solvedQuestions), storage),
    writeStorageJson(APTITUDE_USER_STATE_STORAGE_KEYS.bookmarked, compactStringArray(aptitude.bookmarkedQuestions), storage),
    writeWorkspaceJson(storage, APTITUDE_USER_STATE_STORAGE_KEYS.metadata, aptitude.metadata || {}),
    writeWorkspaceJson(storage, APTITUDE_USER_STATE_STORAGE_KEYS.progress, aptitude.progress || {}),
    writeWorkspaceJson(storage, USER_NOTES_STORAGE_KEY, sessions.scratchpadNotes || {}),
    writeWorkspaceJson(storage, MOCK_TEST_HISTORY_STORAGE_KEY, Array.isArray(mockHistory) ? mockHistory : []),
    writeWorkspaceJson(storage, LAST_SESSION_STORAGE_KEY, sessions.lastSession),
    writeWorkspaceJson(storage, MOCK_ATTEMPT_STORAGE_KEY, sessions.mockAttempt),
    writeWorkspaceJson(storage, STREAK_FREEZE_STORAGE_KEY, preferences.streakFreeze || {}),
  ];

  if (preferences.theme === "light" || preferences.theme === "dark") {
    writes.push(writeRaw(storage, THEME_STORAGE_KEY, preferences.theme));
  }
  if (preferences.dailyGoal !== null && preferences.dailyGoal !== undefined) {
    writes.push(writePreferenceRaw(storage, DAILY_GOAL_STORAGE_KEY, preferences.dailyGoal));
  }
  if (preferences.aptitudeEnabled !== null && preferences.aptitudeEnabled !== undefined) {
    const enabled = preferences.aptitudeEnabled === true
      || preferences.aptitudeEnabled === "true"
      || preferences.aptitudeEnabled === "1";
    writes.push(writeRaw(storage, APTITUDE_ENABLED_STORAGE_KEY, String(enabled)));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(APTITUDE_ENABLED_CHANGE_EVENT, {
        detail: { enabled },
      }));
    }
  }

  const failedWrite = writes.find((result) => !result.ok);
  if (failedWrite) {
    return { ok: false, reason: failedWrite.reason || "write_failed", error: failedWrite.error };
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WORKSPACE_IMPORTED_EVENT, {
      detail: { importedAt: new Date().toISOString() },
    }));
  }

  return {
    ok: true,
    summary: {
      gateSolved: compactStringArray(gate.solvedQuestions).length,
      gateBookmarked: compactStringArray(gate.bookmarkedQuestions).length,
      aptitudeSolved: compactStringArray(aptitude.solvedQuestions).length,
      aptitudeBookmarked: compactStringArray(aptitude.bookmarkedQuestions).length,
      mockHistory: Array.isArray(mockHistory) ? mockHistory.length : 0,
    },
  };
};

const downloadTextFile = (text, filename, documentRef = typeof document !== "undefined" ? document : null) => {
  if (!documentRef) {
    return;
  }
  const blob = new Blob([text], { type: WORKSPACE_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  documentRef.body.appendChild(anchor);
  anchor.click();
  documentRef.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const csvEscape = (value) => {
  const str = String(value ?? "").replace(/"/g, '""');
  return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
};

const buildProgressCsvRows = ({ source, progress = {} }) => (
  Object.entries(progress || {}).flatMap(([key, entry]) => {
    if (!entry || typeof entry !== "object") return [];
    const durationSec = entry.totalDurationMs ? Math.round(entry.totalDurationMs / 1000) : 0;
    return [[
      source,
      key,
      entry.status || "attempted",
      entry.attempts || 1,
      entry.correctAttempts ?? (entry.status === "correct" ? 1 : 0),
      entry.incorrectAttempts ?? (entry.status === "incorrect" ? 1 : 0),
      entry.lastSubmittedAt || "",
      durationSec,
      "",
      "",
      "",
    ]];
  })
);

const buildMockQuestionCsvRows = (mockHistory = []) => (
  (Array.isArray(mockHistory) ? mockHistory : []).flatMap((attempt) => {
    if (!attempt || typeof attempt !== "object") return [];
    const mockTitle = [
      attempt.kindTitle || "Mock Test",
      attempt.selectedPaperLabel || "",
    ].filter(Boolean).join(" - ");
    const groups = [
      ["correct", attempt.correctQuestions || []],
      ["incorrect", attempt.incorrectQuestions || []],
      ["unanswered", attempt.unansweredQuestions || []],
      ["bonus", attempt.bonusQuestions || []],
    ];

    return groups.flatMap(([status, questions]) => (
      (Array.isArray(questions) ? questions : []).flatMap((question) => {
        if (!question || typeof question !== "object") return [];
        const questionUid = String(question.questionUid || "").trim();
        if (!questionUid) return [];
        return [[
          "Mock Test",
          questionUid,
          status,
          1,
          status === "correct" || status === "bonus" ? 1 : 0,
          status === "incorrect" ? 1 : 0,
          attempt.submittedAt || "",
          Number.isFinite(Number(question.timeSpentSeconds)) ? Math.round(Number(question.timeSpentSeconds)) : 0,
          attempt.id || "",
          mockTitle,
          question.scoreDelta ?? "",
        ]];
      })
    ));
  })
);

export const saveWorkspaceFile = async ({
  storage = getDefaultStorage(),
  win = typeof window !== "undefined" ? window : null,
  suggestedName = `gateqa-backup-${todayStamp()}${WORKSPACE_FILE_EXTENSION}`,
} = {}) => {
  const snapshot = buildWorkspaceSnapshot(storage);
  const text = JSON.stringify(snapshot, null, 2);

  try {
    storage?.setItem?.("gateqa_last_backup_time", String(Date.now()));
  } catch (e) {}

  if (win && typeof win.showSaveFilePicker === "function") {
    const handle = await win.showSaveFilePicker({
      suggestedName,
      types: [{
        description: "GateQA Progress Backup",
        accept: { [WORKSPACE_MIME_TYPE]: [WORKSPACE_FILE_EXTENSION] },
      }],
    });
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
    return { ok: true, method: "native", handle, snapshot };
  }

  downloadTextFile(text, suggestedName, win?.document);
  return { ok: true, method: "download", snapshot };
};

export const saveWorkspaceCsv = ({
  storage = getDefaultStorage(),
  win = typeof window !== "undefined" ? window : null,
  suggestedName = `gateqa-progress-${todayStamp()}.csv`,
} = {}) => {
  const gateProgress = readStorageJson(USER_STATE_STORAGE_KEYS.progress, {}, storage);
  const aptitudeProgress = readStorageJson(APTITUDE_USER_STATE_STORAGE_KEYS.progress, {}, storage);
  const mockHistory = readStorageJson(MOCK_TEST_HISTORY_STORAGE_KEY, [], storage);
  const rows = [
    [
      "Source",
      "Question ID",
      "Status",
      "Attempts",
      "Correct Attempts",
      "Incorrect Attempts",
      "Last Submitted",
      "Time Spent (seconds)",
      "Mock ID",
      "Mock Title",
      "Score Delta",
    ],
    ...buildProgressCsvRows({ source: "GATE Practice", progress: gateProgress }),
    ...buildProgressCsvRows({ source: "Aptitude Practice", progress: aptitudeProgress }),
    ...buildMockQuestionCsvRows(mockHistory),
  ];

  const csvContent = rows
    .map(row => row.map(csvEscape).join(","))
    .join("\n");

  if (win?.document) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = win.document.createElement("a");
    anchor.href = url;
    anchor.download = suggestedName;
    win.document.body.appendChild(anchor);
    anchor.click();
    win.document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  try {
    storage?.setItem?.("gateqa_last_backup_time", String(Date.now()));
  } catch (e) {}

  return { ok: true, rowCount: rows.length - 1, csvContent };
};

export const readWorkspaceFile = async (file) => {
  if (!file || typeof file.text !== "function") {
    throw new Error("No backup file selected.");
  }
  const text = await file.text();
  return normalizeWorkspacePayload(text);
};

export const openWorkspaceFile = async ({
  storage = getDefaultStorage(),
  win = typeof window !== "undefined" ? window : null,
} = {}) => {
  if (!win || typeof win.showOpenFilePicker !== "function") {
    return { ok: false, reason: "native_picker_unavailable" };
  }

  const [handle] = await win.showOpenFilePicker({
    multiple: false,
    types: [{
      description: "GateQA Progress Backup",
      accept: { [WORKSPACE_MIME_TYPE]: [WORKSPACE_FILE_EXTENSION] },
    }],
  });
  const file = await handle.getFile();
  const workspace = await readWorkspaceFile(file);
  return importWorkspaceSnapshot(workspace, storage);
};
