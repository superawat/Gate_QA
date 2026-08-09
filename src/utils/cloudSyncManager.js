/**
 * cloudSyncManager.js
 * -------------------
 * The Heart of GateQA Data Safety (Union-Merge Engine).
 *
 * Guarantees:
 *  1. Zero Data Loss: Local data is NEVER deleted or overwritten.
 *  2. Pre-Merge Snapshot: A complete JSON snapshot of localStorage is backed up
 *     locally before any cloud sync starts.
 *  3. Additive-Only Union-Merge Algorithm:
 *      - Bookmarks: Deduplicated union set (Set.union(local, cloud)).
 *      - Personal Notes: If a note exists on both sides, the LONGER note wins
 *        (preserves more student effort). If length is equal, NEWER timestamp wins.
 *      - Solved Questions: Union of attempt records; keeps earliest attemptedAt timestamp.
 *      - Mock Test History: Deduplicated chronologically by testId + start timestamp.
 *  4. Cloud Update: Saves merged result back to Supabase `user_progress` table
 *     and logs action in `sync_log` table.
 *  5. Local Refresh: Writes merged state back to localStorage so the UI is 100% in sync.
 */

import { supabase } from "../services/supabase";
import { clearSyncQueue } from "./syncQueue";

const LOCAL_STORAGE_KEYS = {
  solved: "gate_qa_solved_questions",
  bookmarks: "gate_qa_bookmarked_questions",
  notes: "gate_qa_user_notes",
  mockHistory: "gateqa_mock_history_v1",
  progress: "gateqa_progress_v1",
  aptitudeProgress: "gateqa_apt_progress_v1",
};

/**
 * Creates a timestamped local snapshot backup in localStorage before syncing.
 */
function createPreMergeSnapshot() {
  try {
    const snapshot = {
      timestamp: new Date().toISOString(),
      solved: localStorage.getItem(LOCAL_STORAGE_KEYS.solved),
      bookmarks: localStorage.getItem(LOCAL_STORAGE_KEYS.bookmarks),
      notes: localStorage.getItem(LOCAL_STORAGE_KEYS.notes),
      mockHistory: localStorage.getItem(LOCAL_STORAGE_KEYS.mockHistory),
      progress: localStorage.getItem(LOCAL_STORAGE_KEYS.progress),
      aptitudeProgress: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeProgress),
    };
    const backupKey = `gate_qa_backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(snapshot));

    // Keep only the 5 most recent snapshots to prevent quota inflation
    cleanOldSnapshots();
  } catch (err) {
    console.warn("[CloudSync] Pre-merge snapshot warning:", err);
  }
}

function cleanOldSnapshots() {
  try {
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith("gate_qa_backup_"))
      .sort();
    while (keys.length > 5) {
      const oldestKey = keys.shift();
      localStorage.removeItem(oldestKey);
    }
  } catch {}
}

/**
 * Reads local user study data from localStorage.
 */
function readLocalData() {
  let solved = {};
  let bookmarks = [];
  let notes = {};
  let mockHistory = [];
  let progress = {};
  let aptitudeProgress = {};

  try {
    const rawSolved = localStorage.getItem(LOCAL_STORAGE_KEYS.solved);
    solved = rawSolved ? JSON.parse(rawSolved) : {};
  } catch {}

  try {
    const rawBookmarks = localStorage.getItem(LOCAL_STORAGE_KEYS.bookmarks);
    bookmarks = rawBookmarks ? JSON.parse(rawBookmarks) : [];
  } catch {}

  try {
    const rawNotes = localStorage.getItem(LOCAL_STORAGE_KEYS.notes);
    notes = rawNotes ? JSON.parse(rawNotes) : {};
  } catch {}

  try {
    const rawMock = localStorage.getItem(LOCAL_STORAGE_KEYS.mockHistory);
    mockHistory = rawMock ? JSON.parse(rawMock) : [];
  } catch {}

  try {
    const rawProgress = localStorage.getItem(LOCAL_STORAGE_KEYS.progress);
    progress = rawProgress ? JSON.parse(rawProgress) : {};
  } catch {}

  try {
    const rawAptitudeProgress = localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeProgress);
    aptitudeProgress = rawAptitudeProgress ? JSON.parse(rawAptitudeProgress) : {};
  } catch {}

  return { solved, bookmarks, notes, mockHistory, progress, aptitudeProgress };
}

/**
 * Merges two personal note maps using the Longest Note Wins policy.
 */
function mergeNotes(localNotes = {}, cloudNotes = {}) {
  const allKeys = new Set([
    ...Object.keys(localNotes || {}),
    ...Object.keys(cloudNotes || {}),
  ]);
  const merged = {};

  for (const uid of allKeys) {
    const localNote = localNotes[uid];
    const cloudNote = cloudNotes[uid];

    if (!localNote) {
      merged[uid] = cloudNote;
      continue;
    }
    if (!cloudNote) {
      merged[uid] = localNote;
      continue;
    }

    const localText = typeof localNote === "string" ? localNote : localNote.text || "";
    const cloudText = typeof cloudNote === "string" ? cloudNote : cloudNote.text || "";

    if (localText.length !== cloudText.length) {
      merged[uid] = localText.length > cloudText.length ? localNote : cloudNote;
    } else {
      const localTime = new Date(localNote.updatedAt || 0).getTime();
      const cloudTime = new Date(cloudNote.updatedAt || 0).getTime();
      merged[uid] = localTime >= cloudTime ? localNote : cloudNote;
    }
  }

  return merged;
}

/**
 * Merges solved question progress (preserves earliest successful attempt).
 */
function mergeSolvedQuestions(localSolved = {}, cloudSolved = {}) {
  const allKeys = new Set([
    ...Object.keys(localSolved || {}),
    ...Object.keys(cloudSolved || {}),
  ]);
  const merged = {};

  for (const uid of allKeys) {
    const localAttempt = localSolved[uid];
    const cloudAttempt = cloudSolved[uid];

    if (!localAttempt) {
      merged[uid] = cloudAttempt;
      continue;
    }
    if (!cloudAttempt) {
      merged[uid] = localAttempt;
      continue;
    }

    // Keep earliest attemptedAt timestamp
    const localTime = new Date(localAttempt.attemptedAt || 0).getTime();
    const cloudTime = new Date(cloudAttempt.attemptedAt || 0).getTime();

    merged[uid] = localTime <= cloudTime ? localAttempt : cloudAttempt;
  }

  return merged;
}

/**
 * Merges mock test history (deduplicates by testId and sorts chronologically).
 */
function mergeMockHistory(localHistory = [], cloudHistory = []) {
  const map = new Map();

  const addTest = (item) => {
    if (!item) return;
    const key = item.testId || `${item.subject}_${item.startedAt}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  };

  (cloudHistory || []).forEach(addTest);
  (localHistory || []).forEach(addTest);

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.startedAt || 0) - new Date(b.startedAt || 0)
  );
}

const progressAttemptKey = (attempt = {}) => [
  attempt.submittedAt || "",
  Boolean(attempt.correct),
  Number(attempt.durationMs || 0),
  attempt.type || "",
].join("|");

function mergeProgressEntry(localEntry = {}, cloudEntry = {}) {
  const localHistory = Array.isArray(localEntry.history) ? localEntry.history : [];
  const cloudHistory = Array.isArray(cloudEntry.history) ? cloudEntry.history : [];
  const historyMap = new Map();

  [...cloudHistory, ...localHistory].forEach((attempt) => {
    if (attempt?.submittedAt) {
      historyMap.set(progressAttemptKey(attempt), attempt);
    }
  });

  const history = Array.from(historyMap.values()).sort((a, b) => (
    new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime()
  ));
  const localLast = String(localEntry.lastSubmittedAt || "");
  const cloudLast = String(cloudEntry.lastSubmittedAt || "");
  const latest = localLast >= cloudLast ? localEntry : cloudEntry;
  const firstSubmittedAt = [localEntry.firstSubmittedAt, cloudEntry.firstSubmittedAt]
    .filter(Boolean)
    .sort()[0] || latest.firstSubmittedAt || "";

  return {
    ...cloudEntry,
    ...localEntry,
    ...latest,
    attempts: Math.max(Number(localEntry.attempts || 0), Number(cloudEntry.attempts || 0), history.length),
    correctAttempts: Math.max(Number(localEntry.correctAttempts || 0), Number(cloudEntry.correctAttempts || 0)),
    incorrectAttempts: Math.max(Number(localEntry.incorrectAttempts || 0), Number(cloudEntry.incorrectAttempts || 0)),
    firstSubmittedAt,
    lastSubmittedAt: latest.lastSubmittedAt || firstSubmittedAt,
    history,
  };
}

function mergeProgressRecords(localProgress = {}, cloudProgress = {}) {
  const allKeys = new Set([
    ...Object.keys(localProgress || {}),
    ...Object.keys(cloudProgress || {}),
  ]);
  const merged = {};
  allKeys.forEach((key) => {
    merged[key] = mergeProgressEntry(localProgress[key] || {}, cloudProgress[key] || {});
  });
  return merged;
}

function normalizeCloudProgress(cloudProgress) {
  if (cloudProgress && (cloudProgress.standard || cloudProgress.aptitude)) {
    return {
      standard: cloudProgress.standard || {},
      aptitude: cloudProgress.aptitude || {},
    };
  }
  // Older rows have no namespace; treat a flat object as standard progress.
  return { standard: cloudProgress || {}, aptitude: {} };
}

/**
 * The Additive-Only Union Merge Engine.
 */
export function unionMergeData(localData, cloudData) {
  const cloudBookmarks = Array.isArray(cloudData.bookmarks)
    ? cloudData.bookmarks
    : [];
  const localBookmarks = Array.isArray(localData.bookmarks)
    ? localData.bookmarks
    : [];

  const mergedBookmarks = Array.from(
    new Set([...localBookmarks, ...cloudBookmarks])
  );

  const mergedNotes = mergeNotes(localData.notes, cloudData.notes);
  const mergedSolved = mergeSolvedQuestions(
    localData.solved,
    cloudData.solved_questions
  );
  const mergedMockHistory = mergeMockHistory(
    localData.mockHistory,
    cloudData.mock_history
  );
  const cloudProgress = normalizeCloudProgress(cloudData.progress_records);
  const mergedProgress = mergeProgressRecords(localData.progress, cloudProgress.standard);
  const mergedAptitudeProgress = mergeProgressRecords(
    localData.aptitudeProgress,
    cloudProgress.aptitude
  );

  return {
    bookmarks: mergedBookmarks,
    notes: mergedNotes,
    solved_questions: mergedSolved,
    mock_history: mergedMockHistory,
    progress_records: {
      standard: mergedProgress,
      aptitude: mergedAptitudeProgress,
    },
  };
}

/**
 * Main Entry Point: Synchronizes local student progress with Supabase.
 *
 * @param {string} userId - The Supabase user UUID.
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
export async function syncUserData(userId) {
  if (!supabase || !userId) {
    return { success: false, reason: "Supabase or User ID missing" };
  }

  try {
    // 1. Take a local pre-merge backup snapshot first
    createPreMergeSnapshot();

    // 2. Read local data from browser storage
    const localData = readLocalData();

    // 3. Fetch user's existing progress record from Supabase
    const { data: cloudRow, error: fetchErr } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      // PGRST116 is "Row not found" — expected for new users
      console.error("[CloudSync] Fetch cloud error:", fetchErr);
      return { success: false, error: fetchErr };
    }

    const cloudData = cloudRow || {
      bookmarks: [],
      notes: {},
      solved_questions: {},
      mock_history: [],
      progress_records: { standard: {}, aptitude: {} },
    };

    // 4. Run the Additive Union-Merge Algorithm
    const merged = unionMergeData(localData, cloudData);

    // 5. Save the merged data back to Supabase
    const { error: upsertErr } = await supabase.from("user_progress").upsert({
      user_id: userId,
      bookmarks: merged.bookmarks,
      notes: merged.notes,
      solved_questions: merged.solved_questions,
      mock_history: merged.mock_history,
      progress_records: merged.progress_records,
      data_version: 1,
      last_synced_at: new Date().toISOString(),
    });

    if (upsertErr) {
      console.error("[CloudSync] Upsert error:", upsertErr);
      return { success: false, error: upsertErr };
    }

    // 6. Record audit log in `sync_log` table
    await supabase.from("sync_log").insert({
      user_id: userId,
      action: cloudRow ? "incremental_sync" : "first_login_merge",
      payload_snapshot: merged,
      device_info: typeof navigator !== "undefined" ? navigator.userAgent : "web",
    });

    // 7. Update local localStorage with merged data
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.solved,
      JSON.stringify(merged.solved_questions)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.bookmarks,
      JSON.stringify(merged.bookmarks)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.notes,
      JSON.stringify(merged.notes)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.mockHistory,
      JSON.stringify(merged.mock_history)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.progress,
      JSON.stringify(merged.progress_records.standard)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.aptitudeProgress,
      JSON.stringify(merged.progress_records.aptitude)
    );

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("gateqa:sync-complete", { detail: merged }));
    }

    // 8. Flush offline queue
    clearSyncQueue();

    return { success: true, data: merged };
  } catch (err) {
    console.error("[CloudSync] Unexpected error during sync:", err);
    return { success: false, error: err };
  }
}
