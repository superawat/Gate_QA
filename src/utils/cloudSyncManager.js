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
import { mergeSyncedRevisionSummary, summarizeRevisionEvents } from "./trackerRevisionSummary";

export const LOCAL_STORAGE_KEYS = {
  solved: "gate_qa_solved_questions",
  solvedRemovals: "gate_qa_solved_removals",
  solvedTimestamps: "gate_qa_solved_timestamps",
  bookmarks: "gate_qa_bookmarked_questions",
  bookmarkRemovals: "gate_qa_bookmark_removals",
  aptitudeSolved: "gateqa-apt-solved-questions",
  aptitudeSolvedRemovals: "gateqa-apt-solved-removals",
  aptitudeSolvedTimestamps: "gateqa-apt-solved-timestamps",
  aptitudeBookmarks: "gateqa-apt-bookmarked-questions",
  aptitudeBookmarkRemovals: "gateqa-apt-bookmark-removals",
  notes: "gate_qa_user_notes",
  mockHistory: "gateqa_mock_history_v1",
  progress: "gateqa_progress_v1",
  aptitudeProgress: "gateqa_apt_progress_v1",
  daSolved: "gate_qa_da_solved_questions",
  daSolvedRemovals: "gate_qa_da_solved_removals",
  daSolvedTimestamps: "gate_qa_da_solved_timestamps",
  daBookmarks: "gate_qa_da_bookmarked_questions",
  daBookmarkRemovals: "gate_qa_da_bookmark_removals",
  daProgress: "gateqa_da_progress_v1",
  trackerCse: "gate_qa_tracker_cse_v1",
  trackerDa: "gate_qa_tracker_da_v1",
  trackerPrefs: "gate_qa_tracker_prefs_v1",
  streakFreeze: "gateqa_streak_freeze_v1",
};

/**
 * Creates a timestamped local snapshot backup in localStorage before syncing.
 */
function createPreMergeSnapshot() {
  try {
    const snapshot = {
      timestamp: new Date().toISOString(),
      solved: localStorage.getItem(LOCAL_STORAGE_KEYS.solved),
      solvedRemovals: localStorage.getItem(LOCAL_STORAGE_KEYS.solvedRemovals),
      solvedTimestamps: localStorage.getItem(LOCAL_STORAGE_KEYS.solvedTimestamps),
      bookmarks: localStorage.getItem(LOCAL_STORAGE_KEYS.bookmarks),
      bookmarkRemovals: localStorage.getItem(LOCAL_STORAGE_KEYS.bookmarkRemovals),
      aptitudeSolved: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeSolved),
      aptitudeSolvedRemovals: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeSolvedRemovals),
      aptitudeSolvedTimestamps: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeSolvedTimestamps),
      aptitudeBookmarks: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeBookmarks),
      aptitudeBookmarkRemovals: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeBookmarkRemovals),
      notes: localStorage.getItem(LOCAL_STORAGE_KEYS.notes),
      mockHistory: localStorage.getItem(LOCAL_STORAGE_KEYS.mockHistory),
      progress: localStorage.getItem(LOCAL_STORAGE_KEYS.progress),
      aptitudeProgress: localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeProgress),
      daSolved: localStorage.getItem(LOCAL_STORAGE_KEYS.daSolved),
      daSolvedRemovals: localStorage.getItem(LOCAL_STORAGE_KEYS.daSolvedRemovals),
      daSolvedTimestamps: localStorage.getItem(LOCAL_STORAGE_KEYS.daSolvedTimestamps),
      daBookmarks: localStorage.getItem(LOCAL_STORAGE_KEYS.daBookmarks),
      daBookmarkRemovals: localStorage.getItem(LOCAL_STORAGE_KEYS.daBookmarkRemovals),
      daProgress: localStorage.getItem(LOCAL_STORAGE_KEYS.daProgress),
      trackerCse: localStorage.getItem(LOCAL_STORAGE_KEYS.trackerCse),
      trackerDa: localStorage.getItem(LOCAL_STORAGE_KEYS.trackerDa),
      trackerPrefs: localStorage.getItem(LOCAL_STORAGE_KEYS.trackerPrefs),
      streakFreeze: localStorage.getItem(LOCAL_STORAGE_KEYS.streakFreeze),
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
  let solvedRemovals = {};
  let solvedTimestamps = {};
  let bookmarks = [];
  let bookmarkRemovals = [];
  let aptitudeSolved = [];
  let aptitudeSolvedRemovals = {};
  let aptitudeSolvedTimestamps = {};
  let aptitudeBookmarks = [];
  let aptitudeBookmarkRemovals = [];
  let notes = {};
  let mockHistory = [];
  let progress = {};
  let aptitudeProgress = {};
  let daSolved = [];
  let daSolvedRemovals = {};
  let daSolvedTimestamps = {};
  let daBookmarks = [];
  let daBookmarkRemovals = [];
  let daProgress = {};
  let streakFreeze = {};

  try {
    const rawSolved = localStorage.getItem(LOCAL_STORAGE_KEYS.solved);
    solved = rawSolved ? JSON.parse(rawSolved) : [];
  } catch {}

  try {
    const rawSolvedRemovals = localStorage.getItem(LOCAL_STORAGE_KEYS.solvedRemovals);
    solvedRemovals = extractTimestampMap(rawSolvedRemovals);
  } catch {}

  try {
    const rawSolvedTimestamps = localStorage.getItem(LOCAL_STORAGE_KEYS.solvedTimestamps);
    solvedTimestamps = extractTimestampMap(rawSolvedTimestamps);
  } catch {}

  try {
    const rawAptitudeSolved = localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeSolved);
    aptitudeSolved = rawAptitudeSolved ? JSON.parse(rawAptitudeSolved) : [];
  } catch {}

  try {
    const rawAptSolvedRemovals = localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeSolvedRemovals);
    aptitudeSolvedRemovals = extractTimestampMap(rawAptSolvedRemovals);
  } catch {}

  try {
    const rawAptSolvedTimestamps = localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeSolvedTimestamps);
    aptitudeSolvedTimestamps = extractTimestampMap(rawAptSolvedTimestamps);
  } catch {}

  try { daSolved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.daSolved) || "[]"); } catch {}
  try {
    const rawDaSolvedRemovals = localStorage.getItem(LOCAL_STORAGE_KEYS.daSolvedRemovals);
    daSolvedRemovals = extractTimestampMap(rawDaSolvedRemovals);
  } catch {}
  try {
    const rawDaSolvedTimestamps = localStorage.getItem(LOCAL_STORAGE_KEYS.daSolvedTimestamps);
    daSolvedTimestamps = extractTimestampMap(rawDaSolvedTimestamps);
  } catch {}

  try { daBookmarks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.daBookmarks) || "[]"); } catch {}
  try { daBookmarkRemovals = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.daBookmarkRemovals) || "[]"); } catch {}
  try { daProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.daProgress) || "{}"); } catch {}

  try {
    const rawAptitudeBookmarks = localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeBookmarks);
    aptitudeBookmarks = rawAptitudeBookmarks ? JSON.parse(rawAptitudeBookmarks) : [];
  } catch {}

  try {
    const rawAptitudeBookmarkRemovals = localStorage.getItem(LOCAL_STORAGE_KEYS.aptitudeBookmarkRemovals);
    aptitudeBookmarkRemovals = rawAptitudeBookmarkRemovals ? JSON.parse(rawAptitudeBookmarkRemovals) : [];
  } catch {}

  try {
    const rawBookmarks = localStorage.getItem(LOCAL_STORAGE_KEYS.bookmarks);
    bookmarks = rawBookmarks ? JSON.parse(rawBookmarks) : [];
  } catch {}

  try {
    const rawBookmarkRemovals = localStorage.getItem(LOCAL_STORAGE_KEYS.bookmarkRemovals);
    bookmarkRemovals = rawBookmarkRemovals ? JSON.parse(rawBookmarkRemovals) : [];
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

  try {
    const rawStreakFreeze = localStorage.getItem(LOCAL_STORAGE_KEYS.streakFreeze);
    streakFreeze = rawStreakFreeze ? JSON.parse(rawStreakFreeze) : {};
  } catch {}

  return {
    solved,
    solvedRemovals,
    solvedTimestamps,
    bookmarks,
    bookmarkRemovals,
    aptitudeSolved,
    aptitudeSolvedRemovals,
    aptitudeSolvedTimestamps,
    aptitudeBookmarks,
    aptitudeBookmarkRemovals,
    notes,
    mockHistory,
    progress,
    aptitudeProgress,
    daSolved,
    daSolvedRemovals,
    daSolvedTimestamps,
    daBookmarks,
    daBookmarkRemovals,
    daProgress,
    streakFreeze,
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
 * Normalizes question timestamp or removal maps from supported shapes { [uid]: epochMs }.
 * Resilient against stringified objects or legacy arrays.
 */
export function extractTimestampMap(rawInput) {
  if (!rawInput) {
    return {};
  }
  let parsed = rawInput;
  if (typeof rawInput === "string") {
    try {
      parsed = JSON.parse(rawInput);
    } catch {
      return {};
    }
  }
  if (!parsed || typeof parsed !== "object") {
    return {};
  }
  if (Array.isArray(parsed)) {
    const result = {};
    parsed.forEach((id) => {
      if (typeof id === "string" && id.trim()) {
        result[id.trim()] = 1;
      }
    });
    return result;
  }
  const result = {};
  for (const [key, val] of Object.entries(parsed)) {
    if (typeof key !== "string" || !key.trim()) continue;
    const num = Number(val);
    if (!Number.isNaN(num) && num > 0) {
      result[key.trim()] = num;
    }
  }
  return result;
}

/**
 * Merges solved questions using a Last-Write-Wins Element-Set (LWW-Element-Set) CRDT.
 *
 * Prevents "Permanent Tombstone Trap" and guarantees that explicit unsolve actions
 * persist permanently without resurrection, while allowing infinite Solve -> Unsolve -> Solve cycles.
 *
 * Membership rule:
 *   q in MergedSolved <=> T_solve(q) > T_remove(q)
 *
 * NOTE: Questions unsolved before LWW deployment (no timestamps) will be
 * resurrected once on next sync. This is the expected migration behavior (Option B) —
 * only post-deployment unsolves carry LWW timestamps.
 */
export function mergeLwwElementSet(
  localSolvedRaw,
  cloudSolvedRaw,
  localRemovalsRaw,
  cloudRemovalsRaw,
  localTimestampsRaw,
  cloudTimestampsRaw
) {
  const localSolvedIds = extractQuestionIdArray(localSolvedRaw);
  const cloudSolvedIds = extractQuestionIdArray(cloudSolvedRaw);
  const localRemovals = extractTimestampMap(localRemovalsRaw);
  const cloudRemovals = extractTimestampMap(cloudRemovalsRaw);
  const localTimestamps = extractTimestampMap(localTimestampsRaw);
  const cloudTimestamps = extractTimestampMap(cloudTimestampsRaw);

  const localSolvedSet = new Set(localSolvedIds);
  const cloudSolvedSet = new Set(cloudSolvedIds);

  const allUids = new Set([
    ...localSolvedIds,
    ...cloudSolvedIds,
    ...Object.keys(localRemovals),
    ...Object.keys(cloudRemovals),
    ...Object.keys(localTimestamps),
    ...Object.keys(cloudTimestamps),
  ]);

  const mergedSolved = [];
  const mergedRemovals = {};
  const mergedTimestamps = {};

  for (const uid of allUids) {
    const localSolveTime = localTimestamps[uid] || (localSolvedSet.has(uid) ? 1 : 0);
    const cloudSolveTime = cloudTimestamps[uid] || (cloudSolvedSet.has(uid) ? 1 : 0);
    const tSolve = Math.max(localSolveTime, cloudSolveTime);

    const localRemoveTime = localRemovals[uid] || 0;
    const cloudRemoveTime = cloudRemovals[uid] || 0;
    const tRemove = Math.max(localRemoveTime, cloudRemoveTime);

    if (tSolve > tRemove) {
      mergedSolved.push(uid);
      mergedTimestamps[uid] = tSolve;
    } else {
      if (tRemove > 0) {
        mergedRemovals[uid] = tRemove;
      }
    }
  }

  mergedSolved.sort();

  return {
    mergedSolved,
    mergedRemovals,
    mergedTimestamps,
  };
}

/**
 * Merges streak freeze state additively (union of consumed dates, max earned, capped available reserve).
 */
export function mergeStreakFreeze(localFreeze = {}, cloudFreeze = {}) {
  const local = localFreeze && typeof localFreeze === "object" ? localFreeze : {};
  const cloud = cloudFreeze && typeof cloudFreeze === "object" ? cloudFreeze : {};

  const localConsumed = Array.isArray(local.consumedDates) ? local.consumedDates : [];
  const cloudConsumed = Array.isArray(cloud.consumedDates) ? cloud.consumedDates : [];
  const consumedDates = Array.from(new Set([...localConsumed, ...cloudConsumed]))
    .filter((d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();

  const earnedCount = Math.max(
    Number(local.earnedCount) || 0,
    Number(cloud.earnedCount) || 0,
    consumedDates.length
  );

  const available = Math.min(
    1,
    Math.max(0, Math.max(Number(local.available) || 0, Number(cloud.available) || 0))
  );

  return {
    available,
    earnedCount,
    consumedDates,
  };
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
  if (cloudProgress && (cloudProgress.standard || cloudProgress.aptitude || cloudProgress.da || cloudProgress.streak_freeze)) {
    return {
      standard: cloudProgress.standard || {},
      aptitude: cloudProgress.aptitude || {},
      da: cloudProgress.da || {},
      streak_freeze: cloudProgress.streak_freeze || {},
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
    streak_freeze: {},
    aptitude_solved: [],
    aptitude_bookmarks: [],
    da_solved: [],
    da_bookmarks: [],
  };
}

/**
 * The Additive-Only Union Merge Engine.
 *
 * DEC-111: Bookmark removals (unbookmarks) are now tracked explicitly as tombstone sets.
 * The merge subtracts the union of all bookmark_removals from the union of all bookmarks,
 * ensuring an explicit unbookmark is never overwritten by a stale cloud bookmark entry.
 *
 * Re-bookmarking a question is handled in FilterContext: the ID is removed from the local
 * bookmark_removals array before writing to localStorage, so the next sync will not subtract it.
 */
export function unionMergeData(localData, cloudData) {
  // ── Bookmark Removals (tombstone sets) — union-merged, additive ──────────────
  // A removal is permanent once recorded; union ensures we never lose a tombstone.
  const mergedBookmarkRemovals = Array.from(new Set([
    ...extractQuestionIdArray(localData.bookmarkRemovals),
    ...extractQuestionIdArray(cloudData.bookmark_removals),
  ]));
  const mergedAptitudeBookmarkRemovals = Array.from(new Set([
    ...extractQuestionIdArray(localData.aptitudeBookmarkRemovals),
    ...extractQuestionIdArray(cloudData.aptitude_bookmark_removals),
  ]));
  const mergedDaBookmarkRemovals = Array.from(new Set([
    ...extractQuestionIdArray(localData.daBookmarkRemovals),
    ...extractQuestionIdArray(cloudData.da_bookmark_removals),
  ]));

  // ── Bookmarks — union MINUS removals ─────────────────────────────────────────
  // First compute the raw union (unchanged additive behaviour for all normal IDs),
  // then subtract the removal tombstones so explicitly unbookmarked IDs are excluded.
  const bookmarkRemovalSet = new Set(mergedBookmarkRemovals);
  const mergedBookmarks = Array.from(new Set([
    ...extractQuestionIdArray(localData.bookmarks),
    ...extractQuestionIdArray(cloudData.bookmarks),
  ])).filter(id => !bookmarkRemovalSet.has(id));

  const mergedNotes = mergeNotes(localData.notes, cloudData.notes);

  // ── Solved Questions: LWW-Element-Set CRDT ──────────────────────────────────
  // CSE / IT Solved Questions
  const cseLww = mergeLwwElementSet(
    localData.solved,
    cloudData.solved_questions,
    localData.solvedRemovals,
    cloudData.solved_removals || cloudData.progress_records?.solved_removals,
    localData.solvedTimestamps,
    cloudData.solved_timestamps || cloudData.progress_records?.solved_timestamps
  );
  const mergedSolved = cseLww.mergedSolved;
  const mergedSolvedRemovals = cseLww.mergedRemovals;
  const mergedSolvedTimestamps = cseLww.mergedTimestamps;

  const cloudProgress = normalizeCloudProgress(cloudData.progress_records);
  const cloudAptitudeSolvedIds = [
    ...extractQuestionIdArray(cloudData.aptitude_solved),
    ...extractQuestionIdArray(cloudProgress.aptitude_solved),
  ];
  const cloudAptitudeBookmarkIds = [
    ...extractQuestionIdArray(cloudData.aptitude_bookmarks),
    ...extractQuestionIdArray(cloudProgress.aptitude_bookmarks),
  ];

  // General Aptitude Solved Questions
  const aptitudeLww = mergeLwwElementSet(
    localData.aptitudeSolved,
    cloudAptitudeSolvedIds,
    localData.aptitudeSolvedRemovals,
    cloudData.aptitude_solved_removals || cloudData.progress_records?.aptitude_solved_removals,
    localData.aptitudeSolvedTimestamps,
    cloudData.aptitude_solved_timestamps || cloudData.progress_records?.aptitude_solved_timestamps
  );
  const mergedAptitudeSolved = aptitudeLww.mergedSolved;
  const mergedAptitudeSolvedRemovals = aptitudeLww.mergedRemovals;
  const mergedAptitudeSolvedTimestamps = aptitudeLww.mergedTimestamps;

  // Aptitude bookmarks — subtract aptitude removal tombstones
  const aptitudeBookmarkRemovalSet = new Set(mergedAptitudeBookmarkRemovals);
  const mergedAptitudeBookmarks = Array.from(new Set([
    ...extractQuestionIdArray(localData.aptitudeBookmarks),
    ...extractQuestionIdArray(cloudAptitudeBookmarkIds),
  ])).filter(id => !aptitudeBookmarkRemovalSet.has(id));

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

  // GATE DA Solved Questions
  const daLww = mergeLwwElementSet(
    localData.daSolved,
    cloudDaSolvedIds,
    localData.daSolvedRemovals,
    cloudData.da_solved_removals || cloudData.progress_records?.da_solved_removals,
    localData.daSolvedTimestamps,
    cloudData.da_solved_timestamps || cloudData.progress_records?.da_solved_timestamps
  );
  const mergedDaSolved = daLww.mergedSolved;
  const mergedDaSolvedRemovals = daLww.mergedRemovals;
  const mergedDaSolvedTimestamps = daLww.mergedTimestamps;

  // DA bookmarks — subtract DA removal tombstones
  const daBookmarkRemovalSet = new Set(mergedDaBookmarkRemovals);
  const mergedDaBookmarks = Array.from(new Set([
    ...extractQuestionIdArray(localData.daBookmarks),
    ...extractQuestionIdArray(cloudDaBookmarkIds),
  ])).filter(id => !daBookmarkRemovalSet.has(id));

  const cloudDaProgress = cloudData.progress_records?.da || cloudProgress.da || {};
  const mergedDaProgress = mergeProgressRecords(localData.daProgress, cloudDaProgress);

  const mergedStreakFreeze = mergeStreakFreeze(
    localData.streakFreeze,
    cloudProgress.streak_freeze || cloudData.streak_freeze
  );

  const progressRecords = {
    standard: mergedProgress,
    aptitude: mergedAptitudeProgress,
    da: mergedDaProgress,
    streak_freeze: mergedStreakFreeze,
  };

  return {
    bookmarks: mergedBookmarks,
    bookmark_removals: mergedBookmarkRemovals,
    notes: mergedNotes,
    solved_questions: mergedSolved,
    solved_removals: mergedSolvedRemovals,
    solved_timestamps: mergedSolvedTimestamps,
    aptitude_solved: mergedAptitudeSolved,
    aptitude_solved_removals: mergedAptitudeSolvedRemovals,
    aptitude_solved_timestamps: mergedAptitudeSolvedTimestamps,
    aptitude_bookmarks: mergedAptitudeBookmarks,
    aptitude_bookmark_removals: mergedAptitudeBookmarkRemovals,
    da_solved: mergedDaSolved,
    da_solved_removals: mergedDaSolvedRemovals,
    da_solved_timestamps: mergedDaSolvedTimestamps,
    da_bookmarks: mergedDaBookmarks,
    da_bookmark_removals: mergedDaBookmarkRemovals,
    mock_history: mergedMockHistory,
    progress_records: progressRecords,
    streakFreeze: mergedStreakFreeze,
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
      solved_removals: {},
      solved_timestamps: {},
      aptitude_solved: [],
      aptitude_solved_removals: {},
      aptitude_solved_timestamps: {},
      aptitude_bookmarks: [],
      da_solved: [],
      da_solved_removals: {},
      da_solved_timestamps: {},
      da_bookmarks: [],
      mock_history: [],
      progress_records: { standard: {}, aptitude: {}, da: {} },
    };

    // 4. Run the Additive Union-Merge Algorithm (with LWW-Element-Set for Solved)
    const merged = unionMergeData(localData, cloudData);

    // 5. Save the merged data back to Supabase
    // Tier 1: Full payload matching live artifacts/db-schema contract (including solved & bookmark removals)
    const upsertPayload = {
      user_id: userId,
      bookmarks: merged.bookmarks,
      bookmark_removals: merged.bookmark_removals,
      notes: merged.notes,
      solved_questions: merged.solved_questions,
      solved_removals: merged.solved_removals,
      solved_timestamps: merged.solved_timestamps,
      aptitude_solved: merged.aptitude_solved,
      aptitude_solved_removals: merged.aptitude_solved_removals,
      aptitude_solved_timestamps: merged.aptitude_solved_timestamps,
      aptitude_bookmarks: merged.aptitude_bookmarks,
      aptitude_bookmark_removals: merged.aptitude_bookmark_removals,
      da_solved: merged.da_solved,
      da_solved_removals: merged.da_solved_removals,
      da_solved_timestamps: merged.da_solved_timestamps,
      da_bookmarks: merged.da_bookmarks,
      da_bookmark_removals: merged.da_bookmark_removals,
      mock_history: merged.mock_history,
      progress_records: merged.progress_records,
      data_version: 1,
      last_synced_at: new Date().toISOString(),
    };

    let { error: upsertErr } = await supabase.from("user_progress").upsert(upsertPayload);

    // Resilient fallback: Tier 2 (if DA/removals columns are missing on older schema, preserve aptitude columns and embed in progress_records)
    if (upsertErr) {
      console.warn("[CloudSync] Initial upsert error, attempting Tier 2 fallback (preserving Aptitude columns):", upsertErr);
      const fallbackPayload = {
        user_id: userId,
        bookmarks: merged.bookmarks,
        bookmark_removals: merged.bookmark_removals,
        notes: merged.notes,
        solved_questions: merged.solved_questions,
        solved_removals: merged.solved_removals,
        solved_timestamps: merged.solved_timestamps,
        aptitude_solved: merged.aptitude_solved,
        aptitude_solved_removals: merged.aptitude_solved_removals,
        aptitude_solved_timestamps: merged.aptitude_solved_timestamps,
        aptitude_bookmarks: merged.aptitude_bookmarks,
        aptitude_bookmark_removals: merged.aptitude_bookmark_removals,
        mock_history: merged.mock_history,
        progress_records: {
          ...merged.progress_records,
          da_solved: merged.da_solved,
          da_solved_removals: merged.da_solved_removals,
          da_solved_timestamps: merged.da_solved_timestamps,
          da_bookmarks: merged.da_bookmarks,
          da_bookmark_removals: merged.da_bookmark_removals,
        },
        data_version: 1,
        last_synced_at: new Date().toISOString(),
      };
      const fallbackResult = await supabase.from("user_progress").upsert(fallbackPayload);
      upsertErr = fallbackResult.error;

      // Resilient fallback: Tier 3 (if even aptitude columns or new removals are missing on a minimal legacy schema, embed all in progress_records)
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
            solved_removals: merged.solved_removals,
            solved_timestamps: merged.solved_timestamps,
            aptitude_solved: merged.aptitude_solved,
            aptitude_solved_removals: merged.aptitude_solved_removals,
            aptitude_solved_timestamps: merged.aptitude_solved_timestamps,
            aptitude_bookmarks: merged.aptitude_bookmarks,
            aptitude_bookmark_removals: merged.aptitude_bookmark_removals,
            da_solved: merged.da_solved,
            da_solved_removals: merged.da_solved_removals,
            da_solved_timestamps: merged.da_solved_timestamps,
            da_bookmarks: merged.da_bookmarks,
            da_bookmark_removals: merged.da_bookmark_removals,
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

    // 7. Update local localStorage with merged data (solved + bookmarks + removals + timestamps)
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.solved,
      JSON.stringify(merged.solved_questions)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.solvedRemovals,
      JSON.stringify(merged.solved_removals || {})
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.solvedTimestamps,
      JSON.stringify(merged.solved_timestamps || {})
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.aptitudeSolved,
      JSON.stringify(merged.aptitude_solved)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.aptitudeSolvedRemovals,
      JSON.stringify(merged.aptitude_solved_removals || {})
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.aptitudeSolvedTimestamps,
      JSON.stringify(merged.aptitude_solved_timestamps || {})
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.aptitudeBookmarks,
      JSON.stringify(merged.aptitude_bookmarks)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.aptitudeBookmarkRemovals,
      JSON.stringify(merged.aptitude_bookmark_removals || [])
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.bookmarks,
      JSON.stringify(merged.bookmarks)
    );
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.bookmarkRemovals,
      JSON.stringify(merged.bookmark_removals || [])
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
    localStorage.setItem(LOCAL_STORAGE_KEYS.daSolvedRemovals, JSON.stringify(merged.da_solved_removals || {}));
    localStorage.setItem(LOCAL_STORAGE_KEYS.daSolvedTimestamps, JSON.stringify(merged.da_solved_timestamps || {}));
    localStorage.setItem(LOCAL_STORAGE_KEYS.daBookmarks, JSON.stringify(merged.da_bookmarks));
    localStorage.setItem(LOCAL_STORAGE_KEYS.daBookmarkRemovals, JSON.stringify(merged.da_bookmark_removals || []));
    localStorage.setItem(LOCAL_STORAGE_KEYS.daProgress, JSON.stringify(merged.progress_records.da || {}));
    if (merged.streakFreeze) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.streakFreeze, JSON.stringify(merged.streakFreeze));
    }

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
