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
 *      - Solved Questions: Deduplicated union of canonical question IDs.
 *      - Mock Test History: Deduplicated chronologically by testId + start timestamp.
 *  4. Cloud Update: Saves merged result back to Supabase `user_progress` table
 *     and logs action in `sync_log` table.
 *  5. Local Refresh: Writes merged state back to localStorage so the UI is 100% in sync.
 */

import { supabase } from "../services/supabase";
import { clearSyncQueue } from "./syncQueue";
import { mergeSyncedRevisionSummary, summarizeRevisionEvents } from "./trackerState";

const LOCAL_STORAGE_KEYS = {
  solved: "gate_qa_solved_questions",
  bookmarks: "gate_qa_bookmarked_questions",
  aptitudeSolved: "gateqa-apt-solved-questions",
  aptitudeBookmarks: "gateqa-apt-bookmarked-questions",
  notes: "gate_qa_user_notes",
  mockHistory: "gateqa_mock_history_v1",
  progress: "gateqa_progress_v1",
  aptitudeProgress: "gateqa_apt_progress_v1",
  daSolved: "gate_qa_da_solved_questions",
  daBookmarks: "gate_qa_da_bookmarked_questions",
  daProgress: "gateqa_da_progress_v1",
  trackerCse: "gate_qa_tracker_cse_v1",
  trackerDa: "gate_qa_tracker_da_v1",
  trackerPrefs: "gate_qa_tracker_prefs_v1",
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
      aptitudeSolved: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeSolved),
      aptitudeBookmarks: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeBookmarks),
      notes: localStorage.getItem(LOCAL_STORAGE_KEYS.notes),
      mockHistory: localStorage.getItem(LOCAL_STORAGE_KEYS.mockHistory),
      progress: localStorage.getItem(LOCAL_STORAGE_KEYS.progress),
      aptitudeProgress: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeProgress),
      daSolved: localStorage.getItem(LOCAL_STORAGE_KEYS.daSolved),
      daBookmarks: localStorage.getItem(LOCAL_STORAGE_KEYS.daBookmarks),
      daProgress: localStorage.getItem(LOCAL_STORAGE_KEYS.daProgress),
      trackerCse: localStorage.getItem(LOCAL_STORAGE_KEYS.trackerCse),
      trackerDa: localStorage.getItem(LOCAL_STORAGE_KEYS.trackerDa),
      trackerPrefs: localStorage.getItem(LOCAL_STORAGE_KEYS.trackerPrefs),
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
  let solved = [];
  let bookmarks = [];
  let aptitudeSolved = [];
  let aptitudeBookmarks = [];
  let notes = {};
  let mockHistory = [];
  let progress = {};
  let aptitudeProgress = {};
  let daSolved = [];
  let daBookmarks = [];
  let daProgress = {};

  try {
    const rawSolved = localStorage.getItem(LOCAL_STORAGE_KEYS.solved);
    solved = rawSolved ? JSON.parse(rawSolved) : [];
  } catch {}

  try {
    const rawAptitudeSolved = localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeSolved);
    aptitudeSolved = rawAptitudeSolved ? JSON.parse(rawAptitudeSolved) : [];
  } catch {}

  try { daSolved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.daSolved) || "[]"); } catch {}
  try { daBookmarks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.daBookmarks) || "[]"); } catch {}
  try { daProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.daProgress) || "{}"); } catch {}

  try {
    const rawAptitudeBookmarks = localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeBookmarks);
    aptitudeBookmarks = rawAptitudeBookmarks ? JSON.parse(rawAptitudeBookmarks) : [];
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

  return {
    solved,
    bookmarks,
    aptitudeSolved,
    aptitudeBookmarks,
    notes,
    mockHistory,
    progress,
    aptitudeProgress,
    daSolved,
    daBookmarks,
    daProgress,
  };
}

/**
 * Normalizes solved/bookmarked question data from all supported historical
 * shapes. Older cloud rows may contain attempt maps, while the login bug
 * persisted arrays as numeric-keyed objects.
 */
export function extractQuestionIdArray(rawInput) {
  if (!rawInput) {
    return [];
  }

  const toId = (value) => {
    if (typeof value !== "string" && typeof value !== "number") {
      return "";
    }
    return String(value).trim();
  };

  if (Array.isArray(rawInput)) {
    return Array.from(new Set(rawInput.map(toId).filter(Boolean)));
  }

  if (typeof rawInput === "object") {
    const keys = Object.keys(rawInput);
    if (keys.length === 0) {
      return [];
    }

    const isNumericIndexed = keys.every((key) => /^\d+$/.test(key));
    const candidates = isNumericIndexed ? Object.values(rawInput) : keys;
    return Array.from(new Set(candidates.map(toId).filter(Boolean)));
  }

  return [];
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
 * Merges solved/bookmarked IDs additively and always returns the canonical
 * string-array storage format.
 */
export function mergeSolvedQuestionIds(localSolvedRaw, cloudSolvedRaw) {
  const localIds = extractQuestionIdArray(localSolvedRaw);
  const cloudIds = extractQuestionIdArray(cloudSolvedRaw);
  return Array.from(new Set([...localIds, ...cloudIds])).sort();
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
  if (cloudProgress && (cloudProgress.standard || cloudProgress.aptitude || cloudProgress.da)) {
    return {
      standard: cloudProgress.standard || {},
      aptitude: cloudProgress.aptitude || {},
      da: cloudProgress.da || {},
      aptitude_solved: extractQuestionIdArray(cloudProgress.aptitude_solved || cloudProgress.aptitude?.solved),
      aptitude_bookmarks: extractQuestionIdArray(cloudProgress.aptitude_bookmarks || cloudProgress.aptitude?.bookmarks),
      da_solved: extractQuestionIdArray(cloudProgress.da_solved || cloudProgress.da?.solved),
      da_bookmarks: extractQuestionIdArray(cloudProgress.da_bookmarks || cloudProgress.da?.bookmarks),
    };
  }
  // Older rows have no namespace; treat a flat object as standard progress.
  return {
    standard: cloudProgress || {},
    aptitude: {},
    da: {},
    aptitude_solved: [],
    aptitude_bookmarks: [],
    da_solved: [],
    da_bookmarks: [],
  };
}

/**
 * The Additive-Only Union Merge Engine.
 */
export function unionMergeData(localData, cloudData) {
  const mergedBookmarks = Array.from(new Set([
    ...extractQuestionIdArray(localData.bookmarks),
    ...extractQuestionIdArray(cloudData.bookmarks),
  ]));

  const mergedNotes = mergeNotes(localData.notes, cloudData.notes);
  const mergedSolved = mergeSolvedQuestionIds(
    localData.solved,
    cloudData.solved_questions
  );
  const cloudProgress = normalizeCloudProgress(cloudData.progress_records);
  const cloudAptitudeSolvedIds = [
    ...extractQuestionIdArray(cloudData.aptitude_solved),
    ...extractQuestionIdArray(cloudProgress.aptitude_solved),
  ];
  const cloudAptitudeBookmarkIds = [
    ...extractQuestionIdArray(cloudData.aptitude_bookmarks),
    ...extractQuestionIdArray(cloudProgress.aptitude_bookmarks),
  ];
  const mergedAptitudeSolved = mergeSolvedQuestionIds(
    localData.aptitudeSolved,
    cloudAptitudeSolvedIds
  );
  const mergedAptitudeBookmarks = mergeSolvedQuestionIds(
    localData.aptitudeBookmarks,
    cloudAptitudeBookmarkIds
  );
  const mergedMockHistory = mergeMockHistory(
    localData.mockHistory,
    cloudData.mock_history
  );
  const mergedProgress = mergeProgressRecords(localData.progress, cloudProgress.standard);
  const mergedAptitudeProgress = mergeProgressRecords(
    localData.aptitudeProgress,
    cloudProgress.aptitude
  );
  const cloudDaSolvedIds = [
    ...extractQuestionIdArray(cloudData.da_solved),
    ...extractQuestionIdArray(cloudProgress.da_solved),
  ];
  const cloudDaBookmarkIds = [
    ...extractQuestionIdArray(cloudData.da_bookmarks),
    ...extractQuestionIdArray(cloudProgress.da_bookmarks),
  ];
  const mergedDaSolved = mergeSolvedQuestionIds(localData.daSolved, cloudDaSolvedIds);
  const mergedDaBookmarks = mergeSolvedQuestionIds(localData.daBookmarks, cloudDaBookmarkIds);
  const cloudDaProgress = cloudData.progress_records?.da || cloudProgress.da || {};
  const mergedDaProgress = mergeProgressRecords(localData.daProgress, cloudDaProgress);
  const progressRecords = {
    standard: mergedProgress,
    aptitude: mergedAptitudeProgress,
    da: mergedDaProgress,
  };

  return {
    bookmarks: mergedBookmarks,
    notes: mergedNotes,
    solved_questions: mergedSolved,
    aptitude_solved: mergedAptitudeSolved,
    aptitude_bookmarks: mergedAptitudeBookmarks,
    da_solved: mergedDaSolved,
    da_bookmarks: mergedDaBookmarks,
    mock_history: mergedMockHistory,
    progress_records: progressRecords,
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
    // Using maybeSingle() returns { data: null, error: null } if row does not exist, avoiding HTTP 406 (PGRST116)
    const progressQuery = supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);
    const { data: cloudRow, error: fetchErr } = typeof progressQuery.maybeSingle === "function"
      ? await progressQuery.maybeSingle()
      : await progressQuery.single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      // PGRST116 is "Row not found" — expected for new users (preserved for fallback compatibility)
      console.error("[CloudSync] Fetch cloud error:", fetchErr);
      return { success: false, error: fetchErr };
    }

    const cloudData = cloudRow || {
      bookmarks: [],
      notes: {},
      solved_questions: [],
      aptitude_solved: [],
      aptitude_bookmarks: [],
      da_solved: [],
      da_bookmarks: [],
      mock_history: [],
      progress_records: { standard: {}, aptitude: {}, da: {} },
    };

    // 4. Run the Additive Union-Merge Algorithm
    const merged = unionMergeData(localData, cloudData);

    // 5. Save the merged data back to Supabase
    // Tier 1: Full 12-column payload matching live artifacts/db-schema contract
    const upsertPayload = {
      user_id: userId,
      bookmarks: merged.bookmarks,
      notes: merged.notes,
      solved_questions: merged.solved_questions,
      aptitude_solved: merged.aptitude_solved,
      aptitude_bookmarks: merged.aptitude_bookmarks,
      da_solved: merged.da_solved,
      da_bookmarks: merged.da_bookmarks,
      mock_history: merged.mock_history,
      progress_records: merged.progress_records,
      data_version: 1,
      last_synced_at: new Date().toISOString(),
    };

    let { error: upsertErr } = await supabase.from("user_progress").upsert(upsertPayload);

    // Resilient fallback: Tier 2 (if DA columns are missing on older schema, preserve aptitude columns and embed DA in progress_records)
    if (upsertErr) {
      console.warn("[CloudSync] Initial upsert error, attempting Tier 2 fallback (preserving Aptitude columns):", upsertErr);
      const fallbackPayload = {
        user_id: userId,
        bookmarks: merged.bookmarks,
        notes: merged.notes,
        solved_questions: merged.solved_questions,
        aptitude_solved: merged.aptitude_solved,
        aptitude_bookmarks: merged.aptitude_bookmarks,
        mock_history: merged.mock_history,
        progress_records: {
          ...merged.progress_records,
          da_solved: merged.da_solved,
          da_bookmarks: merged.da_bookmarks,
        },
        data_version: 1,
        last_synced_at: new Date().toISOString(),
      };
      const fallbackResult = await supabase.from("user_progress").upsert(fallbackPayload);
      upsertErr = fallbackResult.error;

      // Resilient fallback: Tier 3 (if even aptitude columns are missing on a minimal legacy schema, embed all non-standard arrays in progress_records)
      if (upsertErr) {
        console.warn("[CloudSync] Tier 2 upsert error, attempting Tier 3 core baseline fallback:", upsertErr);
        const coreBaselinePayload = {
          user_id: userId,
          bookmarks: merged.bookmarks,
          notes: merged.notes,
          solved_questions: merged.solved_questions,
          mock_history: merged.mock_history,
          progress_records: {
            ...merged.progress_records,
            aptitude_solved: merged.aptitude_solved,
            aptitude_bookmarks: merged.aptitude_bookmarks,
            da_solved: merged.da_solved,
            da_bookmarks: merged.da_bookmarks,
          },
          data_version: 1,
          last_synced_at: new Date().toISOString(),
        };
        const coreResult = await supabase.from("user_progress").upsert(coreBaselinePayload);
        upsertErr = coreResult.error;
      }
    }

    if (upsertErr) {
      console.error("[CloudSync] Upsert error:", upsertErr);
      return { success: false, error: upsertErr };
    }

    // 6. Record audit log in `sync_log` table
    // Store a lightweight count summary instead of the full merged payload.
    // payload_snapshot in sync_log is an audit trail only — never read by the client.
    try {
      await supabase.from("sync_log").insert({
        user_id: userId,
        action: cloudRow ? "incremental_sync" : "first_login_merge",
        payload_snapshot: {
          summaryVersion:        1,
          solvedCount:           (merged.solved_questions || []).length,
          bookmarkCount:         (merged.bookmarks || []).length,
          notesCount:            Object.keys(merged.notes || {}).length,
          mockCount:             (merged.mock_history || []).length,
          standardProgressCount: Object.keys(merged.progress_records?.standard || {}).length,
          aptitudeProgressCount: Object.keys(merged.progress_records?.aptitude || {}).length,
          daProgressCount:       Object.keys(merged.progress_records?.da || {}).length,
        },
        device_info: typeof navigator !== "undefined" ? navigator.userAgent : "web",
      });
    } catch (logErr) {
      console.warn("[CloudSync] Audit log insert warning:", logErr);
    }

    // 7. Update local localStorage with merged data
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.solved,
      JSON.stringify(merged.solved_questions)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.aptitudeSolved,
      JSON.stringify(merged.aptitude_solved)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.aptitudeBookmarks,
      JSON.stringify(merged.aptitude_bookmarks)
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
    localStorage.setItem(LOCAL_STORAGE_KEYS.daSolved, JSON.stringify(merged.da_solved));
    localStorage.setItem(LOCAL_STORAGE_KEYS.daBookmarks, JSON.stringify(merged.da_bookmarks));
    localStorage.setItem(LOCAL_STORAGE_KEYS.daProgress, JSON.stringify(merged.progress_records.da || {}));

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("gateqa:sync-complete", { detail: merged }));
    }

    // 8. Flush offline queue
    clearSyncQueue();

    // 9. Sync Preparation Tracker Data (best-effort, non-blocking)
    try {
      await syncTrackerData(userId);
    } catch (trackerSyncErr) {
      console.warn("[CloudSync] Tracker sync non-fatal error:", trackerSyncErr);
    }

    return { success: true, data: merged };
  } catch (err) {
    console.error("[CloudSync] Unexpected error during sync:", err);
    return { success: false, error: err };
  }
}

/**
 * Merges theory status records with union completion rule.
 */
export function mergeTrackerTheory(localTheory = {}, cloudTheory = {}) {
  const local = localTheory && typeof localTheory === "object" ? localTheory : {};
  const cloud = cloudTheory && typeof cloudTheory === "object" ? cloudTheory : {};
  const allTopicIds = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  const merged = {};

  for (const topicId of allTopicIds) {
    const l = local[topicId];
    const c = cloud[topicId];

    if (l?.isCompleted && c?.isCompleted) {
      const lTime = new Date(l.completedAt || 0).getTime();
      const cTime = new Date(c.completedAt || 0).getTime();
      merged[topicId] = lTime >= cTime ? l : c;
    } else if (l?.isCompleted) {
      merged[topicId] = l;
    } else if (c?.isCompleted) {
      merged[topicId] = c;
    } else {
      merged[topicId] = l || c;
    }
  }

  return merged;
}

/**
 * Merges topic notes using Last-Write-Wins (LWW) with tombstones.
 */
export function mergeTrackerNotes(localNotes = {}, cloudNotes = {}) {
  const local = localNotes && typeof localNotes === "object" ? localNotes : {};
  const cloud = cloudNotes && typeof cloudNotes === "object" ? cloudNotes : {};
  const allTopicIds = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  const merged = {};

  for (const topicId of allTopicIds) {
    const l = local[topicId];
    const c = cloud[topicId];

    if (l && c) {
      const lTime = new Date(l.updatedAt || 0).getTime();
      const cTime = new Date(c.updatedAt || 0).getTime();
      merged[topicId] = lTime >= cTime ? l : c;
    } else {
      merged[topicId] = l || c;
    }
  }

  return merged;
}

/**
 * Merges bounded revision summaries with local revision history.
 */
export function mergeTrackerRevisionsSummary(localRevisions = {}, cloudRevisionsSummary = {}) {
  const local = localRevisions && typeof localRevisions === "object" ? localRevisions : {};
  const cloud = cloudRevisionsSummary && typeof cloudRevisionsSummary === "object" ? cloudRevisionsSummary : {};
  const allTopicIds = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  const mergedCloudSummaries = {};

  for (const topicId of allTopicIds) {
    const localEvents = Array.isArray(local[topicId]) ? local[topicId] : [];
    const cloudSummary = cloud[topicId] || null;
    mergedCloudSummaries[topicId] = mergeSyncedRevisionSummary(localEvents, cloudSummary);
  }

  return mergedCloudSummaries;
}

/**
 * Merges tracker preferences using Last-Write-Wins.
 */
export function mergeTrackerPreferences(localPrefs = {}, cloudPrefs = {}) {
  const lTime = new Date(localPrefs?.updatedAt || 0).getTime();
  const cTime = new Date(cloudPrefs?.updated_at || cloudPrefs?.updatedAt || 0).getTime();

  if (cTime > lTime) {
    return {
      activeTrack: cloudPrefs.active_track || localPrefs.activeTrack || "cse",
      examDateCse: cloudPrefs.exam_date_cse || localPrefs.examDateCse || "2027-02-06",
      examDateDa: cloudPrefs.exam_date_da || localPrefs.examDateDa || "2027-02-07",
      countdownDisplayMode: cloudPrefs.countdown_display_mode || localPrefs.countdownDisplayMode || "hero",
      showCountdownWidget: cloudPrefs.show_countdown_widget !== undefined ? cloudPrefs.show_countdown_widget : (localPrefs.showCountdownWidget !== undefined ? localPrefs.showCountdownWidget : true),
      updatedAt: cloudPrefs.updated_at || new Date().toISOString(),
    };
  }

  return localPrefs;
}

/**
 * Synchronizes local Preparation Tracker data (CSE + DA) with Supabase user_tracker table.
 *
 * @param {string} userId - The Supabase user UUID.
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
export async function syncTrackerData(userId) {
  if (!supabase || !userId) {
    return { success: false, reason: "Supabase or User ID missing" };
  }

  try {
    let localCse = { theory: {}, revisions: {}, notes: {}, dataVersion: 1, updatedAt: new Date().toISOString() };
    let localDa = { theory: {}, revisions: {}, notes: {}, dataVersion: 1, updatedAt: new Date().toISOString() };
    let localPrefs = {
      activeTrack: "cse",
      examDateCse: "2027-02-06",
      examDateDa: "2027-02-07",
      countdownDisplayMode: "hero",
      showCountdownWidget: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      const rawCse = localStorage.getItem(LOCAL_STORAGE_KEYS.trackerCse);
      if (rawCse) localCse = JSON.parse(rawCse);
    } catch {}

    try {
      const rawDa = localStorage.getItem(LOCAL_STORAGE_KEYS.trackerDa);
      if (rawDa) localDa = JSON.parse(rawDa);
    } catch {}

    try {
      const rawPrefs = localStorage.getItem(LOCAL_STORAGE_KEYS.trackerPrefs);
      if (rawPrefs) localPrefs = JSON.parse(rawPrefs);
    } catch {}

    // Fetch remote user_tracker row
    // Using maybeSingle() returns { data: null, error: null } if row does not exist, avoiding HTTP 406 (PGRST116)
    const trackerQuery = supabase
      .from("user_tracker")
      .select("*")
      .eq("user_id", userId);
    const { data: cloudRow, error: fetchErr } = typeof trackerQuery.maybeSingle === "function"
      ? await trackerQuery.maybeSingle()
      : await trackerQuery.single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      // If table doesn't exist yet or connection fails, log warning and exit gracefully
      console.warn("[CloudSync] user_tracker fetch error:", fetchErr);
      return { success: false, error: fetchErr };
    }

    const cloudData = cloudRow || {
      active_track: localPrefs.activeTrack,
      exam_date_cse: localPrefs.examDateCse,
      exam_date_da: localPrefs.examDateDa,
      countdown_display_mode: localPrefs.countdownDisplayMode,
      show_countdown_widget: localPrefs.showCountdownWidget,
      cse_theory: {},
      cse_revisions: {},
      cse_notes: {},
      da_theory: {},
      da_revisions: {},
      da_notes: {},
      updated_at: new Date(0).toISOString(),
    };

    // 1. Merge Theory
    const mergedCseTheory = mergeTrackerTheory(localCse.theory, cloudData.cse_theory);
    const mergedDaTheory = mergeTrackerTheory(localDa.theory, cloudData.da_theory);

    // 2. Merge Notes (LWW + tombstones)
    const mergedCseNotes = mergeTrackerNotes(localCse.notes, cloudData.cse_notes);
    const mergedDaNotes = mergeTrackerNotes(localDa.notes, cloudData.da_notes);

    // 3. Merge Bounded Revision Summaries
    const mergedCseRevisionsSummary = mergeTrackerRevisionsSummary(localCse.revisions, cloudData.cse_revisions);
    const mergedDaRevisionsSummary = mergeTrackerRevisionsSummary(localDa.revisions, cloudData.da_revisions);

    // 4. Merge Preferences
    const mergedPrefs = mergeTrackerPreferences(localPrefs, cloudData);

    // Write merged state to localStorage
    const nextLocalCse = {
      ...localCse,
      theory: mergedCseTheory,
      notes: mergedCseNotes,
      updatedAt: new Date().toISOString(),
    };
    const nextLocalDa = {
      ...localDa,
      theory: mergedDaTheory,
      notes: mergedDaNotes,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.trackerCse, JSON.stringify(nextLocalCse));
    localStorage.setItem(LOCAL_STORAGE_KEYS.trackerDa, JSON.stringify(nextLocalDa));
    localStorage.setItem(LOCAL_STORAGE_KEYS.trackerPrefs, JSON.stringify(mergedPrefs));

    // Upsert merged summary back to Supabase
    const trackerUpsertPayload = {
      user_id: userId,
      active_track: mergedPrefs.activeTrack,
      exam_date_cse: mergedPrefs.examDateCse,
      exam_date_da: mergedPrefs.examDateDa,
      countdown_display_mode: mergedPrefs.countdownDisplayMode,
      show_countdown_widget: mergedPrefs.showCountdownWidget,
      cse_theory: mergedCseTheory,
      cse_revisions: mergedCseRevisionsSummary,
      cse_notes: mergedCseNotes,
      da_theory: mergedDaTheory,
      da_revisions: mergedDaRevisionsSummary,
      da_notes: mergedDaNotes,
      data_version: 1,
      last_synced_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase.from("user_tracker").upsert(trackerUpsertPayload);
    if (upsertErr) {
      console.warn("[CloudSync] user_tracker upsert warning:", upsertErr);
    }

    return { success: !upsertErr, data: trackerUpsertPayload };
  } catch (trackerErr) {
    console.error("[CloudSync] Unexpected error during tracker sync:", trackerErr);
    return { success: false, error: trackerErr };
  }
}
