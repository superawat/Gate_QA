/**
 * GATE CSE + DA Preparation & Syllabus Tracker — State & Derivation Engine (v4.0.0)
 * 
 * Invariants:
 * 1. LocalStorage is the primary read/write store.
 * 2. GateQA Practice History (gateqa_progress_v1, gate_qa_solved_questions) is STRICTLY READ-ONLY.
 * 3. Subject and Topic PYQ metrics & accuracy are derived on the fly in-memory (0ms latency).
 * 4. Notes use Last-Write-Wins (LWW) with `isDeleted: true` tombstones.
 * 5. Full RevisionEvent[] history is kept locally; bounded SyncedRevisionSummary is prepared for cloud sync.
 * 6. GATE CSE and GATE DA remain strictly isolated.
 */

import {
  TopicNode,
  SubjectNode,
  SubtopicNode,
  TrackTaxonomy,
  CSE_SUBJECTS,
  DA_SUBJECTS,
  TRACK_TAXONOMIES,
  getTopicsForTrack,
} from "../data/trackerTaxonomy";

export const TRACKER_STORAGE_KEY_PREFIX = "gate_qa_tracker_";
export const TRACKER_STORAGE_KEY_CSE = `${TRACKER_STORAGE_KEY_PREFIX}cse_v1`;
export const TRACKER_STORAGE_KEY_DA = `${TRACKER_STORAGE_KEY_PREFIX}da_v1`;
export const TRACKER_PREFS_STORAGE_KEY = `${TRACKER_STORAGE_KEY_PREFIX}prefs_v1`;

export type TrackerStatus =
  | "NOT_STARTED"
  | "THEORY_ONLY"
  | "IN_PROGRESS"
  | "PRACTICED"
  | "WELL_PRACTICED"
  | "REVISION_DUE"
  | "NEEDS_ATTENTION";

export interface TopicNoteRecord {
  content: string;
  updatedAt: string;          // ISO datetime
  isDeleted: boolean;         // Deletion tombstone
}

export interface RevisionEvent {
  id: string;                 // e.g. "rev_1725184800000_abc12"
  timestamp: string;          // ISO datetime
  source: "practice" | "manual";
  questionCount?: number;
  accuracyRate?: number;
}

export interface SyncedRevisionSummary {
  lastRevisedAt: string | null;
  lastSessionAccuracy: number | null;
  totalRevisionCount: number;
}

export interface UserTrackerPreferences {
  activeTrack: "cse" | "da";
  examDateCse: string;        // default: "2027-02-06"
  examDateDa: string;         // default: "2027-02-07"
  countdownDisplayMode: "hero" | "compact" | "hidden";
  showCountdownWidget: boolean;
  visibleColumns?: string[];  // e.g. ["marks", "target", "priority", "remarks"]
  updatedAt: string;
}

export interface UserTrackerStore {
  // Node ID -> Theory Status
  theory: Record<string, {
    isCompleted: boolean;
    completedAt: string | null;
  }>;
  
  // Node ID -> Append-only revision events (Local full history)
  revisions: Record<string, RevisionEvent[]>;

  // Node ID -> Structured Note Object (with tombstone)
  notes: Record<string, TopicNoteRecord>;

  // Node ID -> Custom Column key/value map (e.g. { marks: "15", target: "2026-11-01", priority: "High" })
  customFields: Record<string, Record<string, string>>;

  dataVersion: number;
  updatedAt: string;
}

export interface DerivedTopicMetrics {
  topicId: string;
  subjectSlug: string;
  theoryCompleted: boolean;
  theoryCompletedAt: string | null;
  isRevised: boolean;
  revisionCount: number;
  lastRevisedAt: string | null;
  totalAvailablePyqs: number;
  attemptedPyqs: number;
  solvedPyqs: number;
  correctAttempts: number;
  incorrectAttempts: number;
  practiceCoverage: number;       // 0.0 to 1.0
  accuracyRate: number;           // 0.0 to 1.0
  lastPracticedAt: string | null; // ISO string from practice history
  daysSinceLastPractice: number | null;
  daysSinceLastRevision: number | null;
  isRevisionDue: boolean;         // Inactive > 21 days with prior activity
  needsPractice: boolean;         // Theory complete, but < 30% PYQs attempted
  needsAttention: boolean;        // Attempted >= 5 and accuracy < 60%
  status: TrackerStatus;
  priorityScore: number;
  noteCount: number;
  hasActiveNote: boolean;
  activeNoteContent: string;
  customFields: Record<string, string>;
}

export interface DerivedSubjectMetrics {
  subjectId: string;
  slug: string;
  label: string;
  theoryCompletedCount: number;
  totalTopicsCount: number;
  theoryPercentage: number;
  totalAvailablePyqs: number;
  totalAttemptedPyqs: number;
  totalSolvedPyqs: number;
  practicePercentage: number;
  accuracyRate: number;
}

export interface OverallTrackMetrics {
  totalTopics: number;
  theoryCompletedCount: number;
  theoryPercentage: number;
  totalAvailablePyqs: number;
  totalAttemptedPyqs: number;
  totalSolvedPyqs: number;
  practicePercentage: number;
  overallAccuracyRate: number;
  wellPracticedTopicsCount: number;
  practicedTopicsCount: number;
  inProgressTopicsCount: number;
  unpracticedTopicsCount: number;
  needsAttentionCount: number;
  revisionDueCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default State Factories
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_TRACKER_PREFERENCES: UserTrackerPreferences = {
  activeTrack: "cse",
  examDateCse: "2027-02-06",
  examDateDa: "2027-02-07",
  countdownDisplayMode: "hero",
  showCountdownWidget: true,
  visibleColumns: [],
  updatedAt: new Date().toISOString(),
};

export const createEmptyTrackerStore = (): UserTrackerStore => ({
  theory: {},
  revisions: {},
  notes: {},
  customFields: {},
  dataVersion: 1,
  updatedAt: new Date().toISOString(),
});

// ─────────────────────────────────────────────────────────────────────────────
// LocalStorage Safe Read / Write
// ─────────────────────────────────────────────────────────────────────────────

const safeParseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const getTrackerStorageKey = (track: "cse" | "da"): string =>
  track === "da" ? TRACKER_STORAGE_KEY_DA : TRACKER_STORAGE_KEY_CSE;

/** Load local tracker store for a track */
export const loadTrackerStore = (track: "cse" | "da"): UserTrackerStore => {
  if (typeof window === "undefined" || !window.localStorage) {
    return createEmptyTrackerStore();
  }
  const raw = window.localStorage.getItem(getTrackerStorageKey(track));
  const parsed = safeParseJson<UserTrackerStore>(raw, createEmptyTrackerStore());
  return {
    theory: parsed.theory || {},
    revisions: parsed.revisions || {},
    notes: parsed.notes || {},
    customFields: parsed.customFields || {},
    dataVersion: parsed.dataVersion || 1,
    updatedAt: parsed.updatedAt || new Date().toISOString(),
  };
};

/** Save local tracker store for a track */
export const saveTrackerStore = (track: "cse" | "da", store: UserTrackerStore): void => {
  if (typeof window === "undefined" || !window.localStorage) return;
  const updatedStore: UserTrackerStore = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(getTrackerStorageKey(track), JSON.stringify(updatedStore));
  } catch (error) {
    console.warn("Failed to persist tracker state to localStorage", error);
  }
};

/** Load tracker preferences */
export const loadTrackerPreferences = (): UserTrackerPreferences => {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_TRACKER_PREFERENCES;
  }
  const raw = window.localStorage.getItem(TRACKER_PREFS_STORAGE_KEY);
  return {
    ...DEFAULT_TRACKER_PREFERENCES,
    ...safeParseJson<Partial<UserTrackerPreferences>>(raw, {}),
  };
};

/** Save tracker preferences */
export const saveTrackerPreferences = (prefs: Partial<UserTrackerPreferences>): UserTrackerPreferences => {
  const current = loadTrackerPreferences();
  const next: UserTrackerPreferences = {
    ...current,
    ...prefs,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(TRACKER_PREFS_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to persist tracker preferences to localStorage", error);
    }
  }
  return next;
};

// ─────────────────────────────────────────────────────────────────────────────
// Local Mutations (Theory, Notes, Revisions, Custom Fields, Reset)
// ─────────────────────────────────────────────────────────────────────────────

/** Toggle Theory status for any node (Topic or Subtopic) */
export const toggleTheoryStatus = (
  track: "cse" | "da",
  nodeId: string,
  explicitValue?: boolean,
  childNodeIds?: string[],
  parentTopicInfo?: { topicId: string; subtopicIds: string[] }
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const current = store.theory[nodeId]?.isCompleted || false;
  const nextCompleted = explicitValue !== undefined ? explicitValue : !current;
  const now = new Date().toISOString();

  const nextTheory = {
    ...store.theory,
    [nodeId]: {
      isCompleted: nextCompleted,
      completedAt: nextCompleted ? (store.theory[nodeId]?.completedAt || now) : null,
    },
  };

  // If childNodeIds provided (e.g. topic's subtopics), also update children
  if (Array.isArray(childNodeIds) && childNodeIds.length > 0) {
    for (const childId of childNodeIds) {
      nextTheory[childId] = {
        isCompleted: nextCompleted,
        completedAt: nextCompleted ? (nextTheory[childId]?.completedAt || now) : null,
      };
    }
  }

  // If parentTopicInfo provided (e.g. when toggling a subtopic), auto-synchronize parent topic completion
  if (
    parentTopicInfo &&
    parentTopicInfo.topicId &&
    Array.isArray(parentTopicInfo.subtopicIds) &&
    parentTopicInfo.subtopicIds.length > 0
  ) {
    const allSiblingsDone = parentTopicInfo.subtopicIds.every((id) => Boolean(nextTheory[id]?.isCompleted));
    nextTheory[parentTopicInfo.topicId] = {
      isCompleted: allSiblingsDone,
      completedAt: allSiblingsDone ? (nextTheory[parentTopicInfo.topicId]?.completedAt || now) : null,
    };
  }

  const nextStore: UserTrackerStore = {
    ...store,
    theory: nextTheory,
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Bulk mark all topics and subtopics in a subject as theory complete / incomplete */
export const setSubjectTheoryStatus = (
  track: "cse" | "da",
  topicIds: string[],
  isCompleted: boolean,
  allSubtopicIds?: string[]
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const now = new Date().toISOString();
  const nextTheory = { ...store.theory };

  const allIds = [...topicIds, ...(allSubtopicIds || [])];
  for (const id of allIds) {
    nextTheory[id] = {
      isCompleted,
      completedAt: isCompleted ? (nextTheory[id]?.completedAt || now) : null,
    };
  }

  const nextStore: UserTrackerStore = {
    ...store,
    theory: nextTheory,
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Bulk mark nodes as revised / not revised in a single atomic store mutation */
export const setSubjectRevisionStatus = (
  track: "cse" | "da",
  nodeIds: string[],
  isRevised: boolean
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const now = new Date().toISOString();
  const nextRevisions = { ...store.revisions };

  for (const id of nodeIds) {
    const existingList = Array.isArray(nextRevisions[id]) ? nextRevisions[id] : [];
    if (isRevised) {
      if (existingList.length === 0) {
        nextRevisions[id] = [
          {
            id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: now,
            source: "manual",
          },
        ];
      }
    } else {
      nextRevisions[id] = [];
    }
  }

  const nextStore: UserTrackerStore = {
    ...store,
    revisions: nextRevisions,
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Bulk set custom field for multiple nodes in a single atomic store mutation */
export const setSubjectCustomField = (
  track: "cse" | "da",
  nodeIds: string[],
  fieldKey: string,
  value: string
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const now = new Date().toISOString();
  const nextCustomFields = { ...store.customFields };

  for (const id of nodeIds) {
    const currentFields = nextCustomFields[id] || {};
    const updated = {
      ...currentFields,
      [fieldKey]: value,
    };
    if (fieldKey === "mock") {
      if (value === "true") {
        const count = Number(currentFields.mockCount || 0);
        if (count <= 0) updated.mockCount = "1";
      } else {
        updated.mockCount = "0";
      }
    } else if (fieldKey === "mockCount") {
      const num = Number(value);
      if (num > 0) {
        updated.mock = "true";
        updated.mockCount = String(num);
      } else {
        updated.mock = "false";
        updated.mockCount = "0";
      }
    }
    nextCustomFields[id] = updated;
  }

  const nextStore: UserTrackerStore = {
    ...store,
    customFields: nextCustomFields,
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Save or delete a topic note using LWW + Tombstones */
export const saveTopicNote = (
  track: "cse" | "da",
  nodeId: string,
  content: string
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const isDeleted = !content.trim();
  const now = new Date().toISOString();

  const noteRecord: TopicNoteRecord = {
    content: content.trim(),
    updatedAt: now,
    isDeleted,
  };

  const nextStore: UserTrackerStore = {
    ...store,
    notes: {
      ...store.notes,
      [nodeId]: noteRecord,
    },
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Record a revision event (appends to local history) */
export const recordRevisionEvent = (
  track: "cse" | "da",
  nodeId: string,
  details: {
    source: "practice" | "manual";
    questionCount?: number;
    accuracyRate?: number;
  }
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const now = new Date().toISOString();
  const eventId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const event: RevisionEvent = {
    id: eventId,
    timestamp: now,
    source: details.source,
    questionCount: details.questionCount,
    accuracyRate: details.accuracyRate,
  };

  const existingList = Array.isArray(store.revisions[nodeId]) ? store.revisions[nodeId] : [];
  const nextStore: UserTrackerStore = {
    ...store,
    revisions: {
      ...store.revisions,
      [nodeId]: [event, ...existingList],
    },
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Increment or decrement manual revision count */
export const incrementRevisionCount = (
  track: "cse" | "da",
  nodeId: string,
  delta = 1
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const existingList = Array.isArray(store.revisions[nodeId]) ? [...store.revisions[nodeId]] : [];
  const now = new Date().toISOString();

  if (delta > 0) {
    for (let i = 0; i < delta; i++) {
      existingList.unshift({
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: now,
        source: "manual",
      });
    }
  } else if (delta < 0 && existingList.length > 0) {
    existingList.shift();
  }

  const nextStore: UserTrackerStore = {
    ...store,
    revisions: {
      ...store.revisions,
      [nodeId]: existingList,
    },
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Toggle or set Revised status checkbox for any node (Topic or Subtopic) with parent/child auto-sync */
export const setRevisionStatus = (
  track: "cse" | "da",
  nodeId: string,
  isRevised?: boolean,
  childNodeIds?: string[],
  parentTopicInfo?: { topicId: string; subtopicIds: string[] }
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const existingList = Array.isArray(store.revisions[nodeId]) ? store.revisions[nodeId] : [];
  const currentlyRevised = existingList.length > 0;
  const targetRevised = isRevised !== undefined ? isRevised : !currentlyRevised;
  const now = new Date().toISOString();

  const nextRevisions = { ...store.revisions };

  if (targetRevised) {
    if (existingList.length === 0) {
      nextRevisions[nodeId] = [
        {
          id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: now,
          source: "manual",
        },
      ];
    }
  } else {
    nextRevisions[nodeId] = [];
  }

  // If childNodeIds provided (e.g. topic's subtopics), also update children
  if (Array.isArray(childNodeIds) && childNodeIds.length > 0) {
    for (const childId of childNodeIds) {
      const childList = Array.isArray(nextRevisions[childId]) ? nextRevisions[childId] : [];
      if (targetRevised) {
        if (childList.length === 0) {
          nextRevisions[childId] = [
            {
              id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              timestamp: now,
              source: "manual",
            },
          ];
        }
      } else {
        nextRevisions[childId] = [];
      }
    }
  }

  // If parentTopicInfo provided (e.g. when toggling a subtopic), auto-synchronize parent topic revision
  if (
    parentTopicInfo &&
    parentTopicInfo.topicId &&
    Array.isArray(parentTopicInfo.subtopicIds) &&
    parentTopicInfo.subtopicIds.length > 0
  ) {
    const allSiblingsRevised = parentTopicInfo.subtopicIds.every((id) => {
      const list = nextRevisions[id];
      return Array.isArray(list) && list.length > 0;
    });

    const parentList = Array.isArray(nextRevisions[parentTopicInfo.topicId])
      ? nextRevisions[parentTopicInfo.topicId]
      : [];

    if (allSiblingsRevised) {
      if (parentList.length === 0) {
        nextRevisions[parentTopicInfo.topicId] = [
          {
            id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: now,
            source: "manual",
          },
        ];
      }
    } else {
      nextRevisions[parentTopicInfo.topicId] = [];
    }
  }

  const nextStore: UserTrackerStore = {
    ...store,
    revisions: nextRevisions,
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Set a custom column field for any node with automatic mock & mockCount synchronization */
export const setCustomField = (
  track: "cse" | "da",
  nodeId: string,
  fieldKey: string,
  value: string
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const nextCustomFields = { ...store.customFields };
  const currentFields = nextCustomFields[nodeId] || {};

  const updatedNodeFields = {
    ...currentFields,
    [fieldKey]: value,
  };

  // Bidirectional link ONLY between THAT node's own mock and mockCount
  if (fieldKey === "mock") {
    if (value === "true") {
      const currentCount = Number(currentFields.mockCount || 0);
      if (currentCount <= 0) {
        updatedNodeFields.mockCount = "1";
      }
    } else {
      updatedNodeFields.mockCount = "0";
    }
  } else if (fieldKey === "mockCount") {
    const num = Number(value);
    if (num > 0) {
      updatedNodeFields.mock = "true";
      updatedNodeFields.mockCount = String(num);
    } else {
      updatedNodeFields.mock = "false";
      updatedNodeFields.mockCount = "0";
    }
  }

  nextCustomFields[nodeId] = updatedNodeFields;

  const nextStore: UserTrackerStore = {
    ...store,
    customFields: nextCustomFields,
    updatedAt: new Date().toISOString(),
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

/** Reset topic or node manual progress (Theory, Notes, Revisions, Custom Fields) without touching practice data */
export const resetTopicManualProgress = (
  track: "cse" | "da",
  nodeId: string
): UserTrackerStore => {
  const store = loadTrackerStore(track);
  const now = new Date().toISOString();

  const nextTheory = { ...store.theory };
  delete nextTheory[nodeId];

  const nextNotes = { ...store.notes };
  if (nextNotes[nodeId]) {
    nextNotes[nodeId] = {
      content: "",
      updatedAt: now,
      isDeleted: true,
    };
  }

  const nextRevisions = { ...store.revisions };
  delete nextRevisions[nodeId];

  const nextCustomFields = { ...store.customFields };
  delete nextCustomFields[nodeId];

  const nextStore: UserTrackerStore = {
    ...store,
    theory: nextTheory,
    notes: nextNotes,
    revisions: nextRevisions,
    customFields: nextCustomFields,
    updatedAt: now,
  };

  saveTrackerStore(track, nextStore);
  return nextStore;
};

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic Local -> Cloud Revision Summary Mapping
// ─────────────────────────────────────────────────────────────────────────────

/** Summarizes local RevisionEvent[] history into a bounded SyncedRevisionSummary */
export const summarizeRevisionEvents = (events: RevisionEvent[] = []): SyncedRevisionSummary => {
  if (!Array.isArray(events) || events.length === 0) {
    return {
      lastRevisedAt: null,
      lastSessionAccuracy: null,
      totalRevisionCount: 0,
    };
  }

  let latest = events[0];
  let latestTime = new Date(latest.timestamp).getTime();

  for (let i = 1; i < events.length; i++) {
    const time = new Date(events[i].timestamp).getTime();
    if (time > latestTime) {
      latest = events[i];
      latestTime = time;
    }
  }

  return {
    lastRevisedAt: latest.timestamp,
    lastSessionAccuracy: latest.accuracyRate !== undefined ? latest.accuracyRate : null,
    totalRevisionCount: events.length,
  };
};

/** Merges remote SyncedRevisionSummary with local RevisionEvent[] in a bounded, safe manner */
export const mergeSyncedRevisionSummary = (
  localEvents: RevisionEvent[] = [],
  cloudSummary?: SyncedRevisionSummary | null
): SyncedRevisionSummary => {
  const localSummary = summarizeRevisionEvents(localEvents);
  if (!cloudSummary) return localSummary;

  const localTime = localSummary.lastRevisedAt ? new Date(localSummary.lastRevisedAt).getTime() : 0;
  const cloudTime = cloudSummary.lastRevisedAt ? new Date(cloudSummary.lastRevisedAt).getTime() : 0;

  const newerSummary = localTime >= cloudTime ? localSummary : cloudSummary;
  const totalCount = Math.max(localSummary.totalRevisionCount, cloudSummary.totalRevisionCount || 0);

  return {
    lastRevisedAt: newerSummary.lastRevisedAt,
    lastSessionAccuracy: newerSummary.lastSessionAccuracy,
    totalRevisionCount: totalCount,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Derived Topic Metrics & Priority Calculation (Read-Only Practice Ingestion)
// ─────────────────────────────────────────────────────────────────────────────

export interface RawPracticeRecord {
  attemptsCount?: number;
  attempts?: number;
  correctAttempts?: number;
  correctCount?: number;
  incorrectAttempts?: number;
  incorrectCount?: number;
  lastSubmittedAt?: string;
  isSolved?: boolean;
  correct?: boolean;
  [key: string]: unknown;
}

export interface QuestionBankItem {
  uid: string;
  question_uid?: string;
  subject?: string;
  subjectSlug?: string;
  subjectLabel?: string;
  primaryTopic?: string;
  tags?: string[] | string;
  subtopics?: Array<{ label?: string; slug?: string }>;
  track?: "cse" | "da";
  exam?: { track?: string; year?: number; set?: number; [key: string]: unknown };
  [key: string]: unknown;
}

const parseJsonSafe = <T>(rawValue: string | null, fallback: T): T => {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Loads canonical practice history & solved sets with 100% parity to Insights.
 * Merges practice attempts, Aptitude, DA, and mock test sessions without modifying raw store.
 */
export const loadCanonicalPracticeRecords = (
  track: "cse" | "da" = "cse",
  storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null
): {
  solvedSet: Set<string>;
  progressMap: Record<string, RawPracticeRecord>;
} => {
  if (!storage) {
    return { solvedSet: new Set(), progressMap: {} };
  }

  const gateProgress = parseJsonSafe<Record<string, RawPracticeRecord>>(storage.getItem("gateqa_progress_v1"), {});
  const aptProgress = parseJsonSafe<Record<string, RawPracticeRecord>>(storage.getItem("gateqa_apt_progress_v1"), {});
  const daProgress = parseJsonSafe<Record<string, RawPracticeRecord>>(storage.getItem("gateqa_da_progress_v1"), {});

  const gateSolved = parseJsonSafe<string[]>(storage.getItem("gate_qa_solved_questions"), []);
  const aptSolved = parseJsonSafe<string[]>(storage.getItem("gateqa-apt-solved-questions"), []);
  const daSolved = parseJsonSafe<string[]>(storage.getItem("gate_qa_da_solved_questions"), []);

  let rawProgressRecords: Record<string, RawPracticeRecord> = {};
  let rawSolvedIds: string[] = [];

  if (track === "da") {
    rawProgressRecords = { ...daProgress, ...aptProgress };
    rawSolvedIds = [...daSolved, ...aptSolved];
  } else {
    rawProgressRecords = { ...gateProgress, ...aptProgress };
    rawSolvedIds = [...gateSolved, ...aptSolved];
  }

  // Merge mock test attempts into progress records (same as Insights)
  const mockHistoryKey = "gateqa_mock_history_v1";
  const mockHistory = parseJsonSafe<any[]>(storage.getItem(mockHistoryKey), []);
  const mergedProgress: Record<string, RawPracticeRecord> = { ...rawProgressRecords };
  const mergedSolved = new Set(rawSolvedIds.map((uid) => String(uid).trim()).filter(Boolean));

  if (Array.isArray(mockHistory) && mockHistory.length > 0) {
    mockHistory.forEach((session) => {
      const submittedAt = session?.submittedAt;
      const correctList = Array.isArray(session?.correctQuestions) ? session.correctQuestions : [];
      const incorrectList = Array.isArray(session?.incorrectQuestions) ? session.incorrectQuestions : [];
      const bonusList = Array.isArray(session?.bonusQuestions) ? session.bonusQuestions : [];

      const registerAttempt = (questionUid: string, isCorrect: boolean) => {
        const uid = String(questionUid || "").trim();
        if (!uid) return;

        if (isCorrect) mergedSolved.add(uid);

        if (!mergedProgress[uid]) {
          mergedProgress[uid] = {
            attempts: 1,
            correctAttempts: isCorrect ? 1 : 0,
            incorrectAttempts: isCorrect ? 0 : 1,
            lastSubmittedAt: submittedAt,
            isSolved: isCorrect,
            correct: isCorrect,
          };
        } else {
          const entry = mergedProgress[uid];
          const currAttempts = Number(entry.attemptsCount || entry.attempts || 0);
          const currCorrect = Number(entry.correctAttempts ?? entry.correctCount ?? (entry.correct ? 1 : 0));
          const currIncorrect = Number(entry.incorrectAttempts ?? entry.incorrectCount ?? 0);

          entry.attempts = currAttempts + 1;
          if (isCorrect) {
            entry.correctAttempts = currCorrect + 1;
            entry.isSolved = true;
            entry.correct = true;
          } else {
            entry.incorrectAttempts = currIncorrect + 1;
          }
          if (submittedAt && (!entry.lastSubmittedAt || String(submittedAt).localeCompare(String(entry.lastSubmittedAt)) >= 0)) {
            entry.lastSubmittedAt = submittedAt;
          }
        }
      };

      correctList.forEach((q: any) => registerAttempt(q?.questionUid, true));
      incorrectList.forEach((q: any) => registerAttempt(q?.questionUid, false));
      bonusList.forEach((q: any) => registerAttempt(q?.questionUid, true));
    });
  }

  return {
    solvedSet: mergedSolved,
    progressMap: mergedProgress,
  };
};

const parseDateOrNull = (val: unknown): Date | null => {
  if (!val) return null;
  const d = new Date(String(val));
  return Number.isFinite(d.getTime()) ? d : null;
};

const getDaysDifference = (fromIso: string | null, toDate = new Date()): number | null => {
  const d = parseDateOrNull(fromIso);
  if (!d) return null;
  const diffMs = toDate.getTime() - d.getTime();
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
};

/** Normalize token for matching */
export const normalizeToken = (val: unknown): string =>
  String(val ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "-");

/**
 * Checks if a question belongs to a track
 */
export const isQuestionInTrack = (q: QuestionBankItem, track: "cse" | "da"): boolean => {
  if (!q) return false;
  const explicitTrack = String(q.track || q.exam?.track || "").toLowerCase();
  if (explicitTrack === "cse" || explicitTrack === "da") {
    return explicitTrack === track;
  }
  const uid = String(q.question_uid || q.uid || "").toLowerCase();
  if (uid.startsWith("da:") || uid.startsWith("da-")) {
    return track === "da";
  }
  const slug = String(q.subjectSlug || "").toLowerCase();
  if (slug.startsWith("da:")) {
    return track === "da";
  }
  return track === "cse";
};

/**
 * Checks if a question belongs to a Subject
 */
export const isQuestionInSubject = (q: QuestionBankItem, subject: SubjectNode): boolean => {
  if (!q) return false;
  const qSubjectSlug = normalizeToken(q.subjectSlug || q.subject);
  const qSubjectClean = qSubjectSlug.replace(/^da:/, "");
  
  const matchesDirectSlug = normalizeToken(subject.slug) === qSubjectSlug || normalizeToken(subject.slug) === qSubjectClean;
  const matchesCanonical = subject.canonicalSubjectSlugs.some(
    (cs) => normalizeToken(cs) === qSubjectSlug || normalizeToken(cs) === qSubjectClean
  );
  return matchesDirectSlug || matchesCanonical;
};

/**
 * Checks if a question belongs to a Topic
 */
export const isQuestionInTopic = (q: QuestionBankItem, topic: TopicNode): boolean => {
  if (!q) return false;

  const primaryTag = normalizeToken(topic.primaryTopicTag);
  const secondaryTags = topic.secondaryTopicTags.map(normalizeToken);
  
  // Extract all tag/subtopic tokens from question
  const rawTags = Array.isArray(q.tags) ? q.tags : [String(q.tags || "")];
  const tagTokens = rawTags.map(normalizeToken);
  
  const subtopicTokens = (Array.isArray(q.subtopics) ? q.subtopics : []).map((st) =>
    normalizeToken(st?.slug || st?.label)
  );
  
  const qPrimary = normalizeToken(q.primaryTopic);
  const qSubject = normalizeToken(q.subjectSlug || q.subject).replace(/^da:/, "");

  // Subject match check
  const topicSubjectClean = normalizeToken(topic.subjectSlug).replace(/^da:/, "");
  const subjectMatches =
    qSubject === topicSubjectClean ||
    (topic.canonicalSubjectSlugs && topic.canonicalSubjectSlugs.some((cs) => normalizeToken(cs).replace(/^da:/, "") === qSubject));

  // Direct tag matching
  const hasPrimaryTag =
    qPrimary === primaryTag ||
    tagTokens.includes(primaryTag) ||
    subtopicTokens.includes(primaryTag) ||
    tagTokens.some((t) => t.includes(primaryTag));

  const hasSecondaryTag = secondaryTags.some(
    (sec) => tagTokens.includes(sec) || subtopicTokens.includes(sec) || tagTokens.some((t) => t.includes(sec))
  );

  // Subtopic node matching if nested subtopics exist
  const hasNestedSubtopicMatch = Boolean(
    topic.subtopics &&
    topic.subtopics.some((sub) => {
      const subSlug = normalizeToken(sub.subtopicSlug);
      const subTags = (sub.tags || []).map(normalizeToken);
      return (
        tagTokens.includes(subSlug) ||
        subtopicTokens.includes(subSlug) ||
        subTags.some((st) => tagTokens.includes(st) || subtopicTokens.includes(st))
      );
    })
  );

  if (hasPrimaryTag) return true;
  if (subjectMatches && (hasSecondaryTag || hasNestedSubtopicMatch)) return true;
  return false;
};

export interface QuestionTaxonomyIndex {
  subjectQuestions: Map<string, QuestionBankItem[]>;
  topicQuestions: Map<string, QuestionBankItem[]>;
  trackQuestions: QuestionBankItem[];
}

/**
 * Pre-indexes questions by track, subject, and topic for O(1) lightning-fast metric derivations.
 */
export const buildQuestionIndexForTrack = (
  questions: QuestionBankItem[],
  taxonomy: TrackTaxonomy,
  track: "cse" | "da"
): QuestionTaxonomyIndex => {
  const trackQuestions: QuestionBankItem[] = [];
  const subjectQuestions = new Map<string, QuestionBankItem[]>();
  const topicQuestions = new Map<string, QuestionBankItem[]>();

  // Pre-normalize all subjects and topics ONCE outside the question loop
  const precomputedSubjects = taxonomy.subjects.map((subject) => {
    subjectQuestions.set(subject.id, []);
    const subjectSlug = normalizeToken(subject.slug);
    const canonicalSlugs = (subject.canonicalSubjectSlugs || []).map(normalizeToken);

    const precomputedTopics = subject.topics.map((topic) => {
      topicQuestions.set(topic.id, []);
      const primaryTag = normalizeToken(topic.primaryTopicTag);
      const secondaryTags = (topic.secondaryTopicTags || []).map(normalizeToken);
      const topicSubjectClean = normalizeToken(topic.subjectSlug).replace(/^da:/, "");
      const topicCanonicalSlugs = (topic.canonicalSubjectSlugs || []).map((cs) => normalizeToken(cs).replace(/^da:/, ""));

      const subtopicMatchers: Array<{ slug: string; tags: string[] }> = [];
      if (Array.isArray(topic.subtopics)) {
        for (const st of topic.subtopics) {
          subtopicMatchers.push({
            slug: normalizeToken(st.subtopicSlug),
            tags: (st.tags || []).map(normalizeToken),
          });
        }
      }

      return {
        id: topic.id,
        primaryTag,
        secondaryTags,
        topicSubjectClean,
        topicCanonicalSlugs,
        subtopicMatchers,
      };
    });

    return {
      id: subject.id,
      slug: subjectSlug,
      canonicalSlugs,
      topics: precomputedTopics,
    };
  });

  for (const q of questions) {
    if (!q) continue;
    if (!isQuestionInTrack(q, track)) continue;
    trackQuestions.push(q);

    // Extract & normalize question metadata ONCE per question
    const rawTags = Array.isArray(q.tags) ? q.tags : [String(q.tags || "")];
    const tagTokens = rawTags.map(normalizeToken);
    const subtopicTokens = (Array.isArray(q.subtopics) ? q.subtopics : []).map((st) =>
      normalizeToken(st?.slug || st?.label)
    );
    const qPrimary = normalizeToken(q.primaryTopic);
    const qSubjectSlug = normalizeToken(q.subjectSlug || q.subject);
    const qSubjectClean = qSubjectSlug.replace(/^da:/, "");

    for (const pSubject of precomputedSubjects) {
      const matchesSubject =
        pSubject.slug === qSubjectSlug ||
        pSubject.slug === qSubjectClean ||
        pSubject.canonicalSlugs.some((cs) => cs === qSubjectSlug || cs === qSubjectClean);

      if (matchesSubject) {
        subjectQuestions.get(pSubject.id)!.push(q);
      }

      for (const pTopic of pSubject.topics) {
        const subjectMatches =
          qSubjectClean === pTopic.topicSubjectClean ||
          pTopic.topicCanonicalSlugs.includes(qSubjectClean);

        const hasPrimaryTag =
          (pTopic.primaryTag && (
            qPrimary === pTopic.primaryTag ||
            tagTokens.includes(pTopic.primaryTag) ||
            subtopicTokens.includes(pTopic.primaryTag) ||
            tagTokens.some((t) => t.includes(pTopic.primaryTag))
          ));

        if (hasPrimaryTag) {
          topicQuestions.get(pTopic.id)!.push(q);
          continue;
        }

        if (subjectMatches) {
          const hasSecondaryTag = pTopic.secondaryTags.some(
            (sec) => tagTokens.includes(sec) || subtopicTokens.includes(sec) || tagTokens.some((t) => t.includes(sec))
          );
          if (hasSecondaryTag) {
            topicQuestions.get(pTopic.id)!.push(q);
            continue;
          }

          const hasNestedSubtopicMatch = pTopic.subtopicMatchers.some(
            (sub) =>
              tagTokens.includes(sub.slug) ||
              subtopicTokens.includes(sub.slug) ||
              sub.tags.some((st) => tagTokens.includes(st) || subtopicTokens.includes(st))
          );
          if (hasNestedSubtopicMatch) {
            topicQuestions.get(pTopic.id)!.push(q);
          }
        }
      }
    }
  }

  return { subjectQuestions, topicQuestions, trackQuestions };
};

/**
 * Derives comprehensive runtime metrics for a single topic node.
 */
export const deriveTopicMetrics = (
  topic: TopicNode,
  store: UserTrackerStore,
  questions: QuestionBankItem[],
  solvedQuestionUids: Set<string>,
  progressMap: Record<string, RawPracticeRecord>,
  track: "cse" | "da" = "cse"
): DerivedTopicMetrics => {
  const theoryRecord = store.theory[topic.id];
  const explicitTheoryCompleted = Boolean(theoryRecord?.isCompleted);
  const allSubtopicsCompleted = Boolean(
    topic.subtopics &&
    topic.subtopics.length > 0 &&
    topic.subtopics.every((st) => Boolean(store.theory[st.id]?.isCompleted))
  );
  const theoryCompleted = explicitTheoryCompleted || allSubtopicsCompleted;
  const theoryCompletedAt = theoryRecord?.completedAt || null;

  const noteRecord = store.notes[topic.id];
  const hasActiveNote = Boolean(noteRecord && !noteRecord.isDeleted && noteRecord.content.trim());
  const activeNoteContent = hasActiveNote ? (noteRecord?.content || "") : "";
  const noteCount = hasActiveNote ? 1 : 0;

  const revisionEvents = Array.isArray(store.revisions[topic.id]) ? store.revisions[topic.id] : [];
  const revisionSummary = summarizeRevisionEvents(revisionEvents);
  const explicitRevised = revisionSummary.totalRevisionCount > 0;
  const allSubtopicsRevised = Boolean(
    topic.subtopics &&
    topic.subtopics.length > 0 &&
    topic.subtopics.every((st) => Array.isArray(store.revisions[st.id]) && store.revisions[st.id].length > 0)
  );
  const isRevised = explicitRevised || allSubtopicsRevised;

  let subtopicMinRevisions = 0;
  if (topic.subtopics && topic.subtopics.length > 0) {
    subtopicMinRevisions = Math.min(
      ...topic.subtopics.map((st) => (Array.isArray(store.revisions[st.id]) ? store.revisions[st.id].length : 0))
    );
  }
  const revisionCount = Math.max(revisionSummary.totalRevisionCount, subtopicMinRevisions);

  let lastRevisedAt = revisionSummary.lastRevisedAt;
  if (topic.subtopics && topic.subtopics.length > 0) {
    for (const st of topic.subtopics) {
      const stEvents = Array.isArray(store.revisions[st.id]) ? store.revisions[st.id] : [];
      const stSummary = summarizeRevisionEvents(stEvents);
      if (stSummary.lastRevisedAt) {
        if (!lastRevisedAt || String(stSummary.lastRevisedAt).localeCompare(String(lastRevisedAt)) > 0) {
          lastRevisedAt = stSummary.lastRevisedAt;
        }
      }
    }
  }

  const customFields = store.customFields[topic.id] || {};

  // Find all questions attributable to this topic in this track (questions is pre-filtered topicQuestions)
  let totalAvailablePyqs = 0;
  let attemptedPyqs = 0;
  let solvedPyqs = 0;
  let correctAttempts = 0;
  let incorrectAttempts = 0;
  let latestPracticeTime: Date | null = null;

  for (const q of questions) {
    if (!q) continue;
    const uid = String(q.question_uid || q.uid || "").trim();
    if (!uid) continue;

    // Safety filter: when called via TrackerPage, `questions` is already pre-filtered by
    // track + topic (via buildQuestionIndexForTrack), so these checks are near-instant.
    // They remain here for correctness when called directly in unit tests with mixed arrays.
    if (!isQuestionInTrack(q, track)) continue;
    if (!isQuestionInTopic(q, topic)) continue;

    totalAvailablePyqs++;
    const isSolved = solvedQuestionUids.has(uid);
    if (isSolved) solvedPyqs++;

    const pRecord = progressMap[uid];
    if (pRecord) {
      const attempts = Number(pRecord.attemptsCount || pRecord.attempts || 0);
      const isRecordSolved = pRecord.isSolved || pRecord.correct === true;
      if (attempts > 0 || isRecordSolved || isSolved) {
        attemptedPyqs++;
        const correctCount = Number(pRecord.correctAttempts ?? pRecord.correctCount ?? (isSolved || isRecordSolved ? 1 : 0));
        const incorrectCount = Number(pRecord.incorrectAttempts ?? pRecord.incorrectCount ?? 0);
        correctAttempts += correctCount;
        incorrectAttempts += incorrectCount;

        const submitDate = parseDateOrNull(pRecord.lastSubmittedAt);
        if (submitDate) {
          if (!latestPracticeTime || submitDate.getTime() > latestPracticeTime.getTime()) {
            latestPracticeTime = submitDate;
          }
        }
      }
    } else if (isSolved) {
      attemptedPyqs++;
      correctAttempts += 1;
    }
  }

  // Derived percentages
  const practiceCoverage = totalAvailablePyqs > 0 ? (attemptedPyqs / totalAvailablePyqs) : 0;
  const totalAttemptsLogged = correctAttempts + incorrectAttempts;
  const accuracyRate = totalAttemptsLogged > 0 ? (correctAttempts / totalAttemptsLogged) : (solvedPyqs > 0 && attemptedPyqs > 0 ? solvedPyqs / attemptedPyqs : 0);

  const lastPracticedAt = latestPracticeTime ? latestPracticeTime.toISOString() : null;
  const daysSinceLastPractice = getDaysDifference(lastPracticedAt);
  const daysSinceLastRevision = getDaysDifference(lastRevisedAt);

  const latestActivityDays = Math.min(
    daysSinceLastPractice !== null ? daysSinceLastPractice : Infinity,
    daysSinceLastRevision !== null ? daysSinceLastRevision : Infinity
  );
  const effectiveInactiveDays = latestActivityDays !== Infinity ? latestActivityDays : null;

  // Attention Badges
  const hasPriorPracticeEvidence = attemptedPyqs >= 3 || revisionCount > 0;
  const isRevisionDue = hasPriorPracticeEvidence && (effectiveInactiveDays !== null && effectiveInactiveDays > 21);
  const needsPractice = theoryCompleted && practiceCoverage < 0.30;
  const needsAttention = attemptedPyqs >= 5 && accuracyRate < 0.60;

  // Status classification
  let status: TrackerStatus = "NOT_STARTED";
  if (isRevisionDue) {
    status = "REVISION_DUE";
  } else if (needsAttention) {
    status = "NEEDS_ATTENTION";
  } else if (theoryCompleted && practiceCoverage >= 0.75 && accuracyRate >= 0.70) {
    status = "WELL_PRACTICED";
  } else if (theoryCompleted && practiceCoverage >= 0.50) {
    status = "PRACTICED";
  } else if (attemptedPyqs > 0 || practiceCoverage > 0) {
    status = "IN_PROGRESS";
  } else if (theoryCompleted) {
    status = "THEORY_ONLY";
  }

  // Priority Score for Today's Focus
  const priorityScore = computeTopicPriority(
    topic,
    {
      isRevisionDue,
      attemptedPyqs,
      accuracyRate,
      practiceCoverage,
    },
    theoryCompleted
  );

  return {
    topicId: topic.id,
    subjectSlug: topic.subjectSlug,
    theoryCompleted,
    theoryCompletedAt,
    isRevised,
    revisionCount,
    lastRevisedAt,
    totalAvailablePyqs,
    attemptedPyqs,
    solvedPyqs,
    correctAttempts,
    incorrectAttempts,
    practiceCoverage,
    accuracyRate,
    lastPracticedAt,
    daysSinceLastPractice,
    daysSinceLastRevision,
    isRevisionDue,
    needsPractice,
    needsAttention,
    status,
    priorityScore,
    noteCount,
    hasActiveNote,
    activeNoteContent,
    customFields,
  };
};

/**
 * Computes deterministic priority score for "Today's Focus" recommendation.
 */
export const computeTopicPriority = (
  topic: TopicNode,
  metrics: {
    isRevisionDue: boolean;
    attemptedPyqs: number;
    accuracyRate: number;
    practiceCoverage: number;
  },
  theoryDone: boolean
): number => {
  let score = 0;

  if (metrics.isRevisionDue && metrics.attemptedPyqs >= 3) {
    score += 40;
  }

  if (metrics.attemptedPyqs >= 5) {
    if (metrics.accuracyRate < 0.60) {
      score += 30;
    } else if (metrics.accuracyRate < 0.70) {
      score += 15;
    }
  }

  if (theoryDone && metrics.attemptedPyqs === 0) {
    score += 25;
  } else if (theoryDone && metrics.practiceCoverage < 0.30 && metrics.attemptedPyqs >= 3) {
    score += 20;
  }

  if (topic.weightageTier === "tier-1-high") {
    score += 10;
  }

  return score;
};

/**
 * Derives subject-level PYQ and syllabus metrics from canonical question bank.
 * Primary subject PYQ count is authoritative even when granular subtopics are not mapped.
 */
export const deriveSubjectMetrics = (
  subject: SubjectNode,
  store: UserTrackerStore,
  topicMetricsList: DerivedTopicMetrics[],
  questions: QuestionBankItem[],
  solvedQuestionUids: Set<string>,
  progressMap: Record<string, RawPracticeRecord>,
  track: "cse" | "da" = "cse"
): DerivedSubjectMetrics => {
  const matchingTopicMetrics = topicMetricsList.filter((m) =>
    subject.topics.some((t) => t.id === m.topicId)
  );

  const totalTopicsCount = subject.topics.length;
  const theoryCompletedCount = matchingTopicMetrics.filter((m) => m.theoryCompleted).length;
  const theoryPercentage = totalTopicsCount > 0 ? Math.round((theoryCompletedCount / totalTopicsCount) * 100) : 0;

  // Calculate authoritative Subject-level PYQs from questions matching this subject
  let totalAvailablePyqs = 0;
  let totalAttemptedPyqs = 0;
  let totalSolvedPyqs = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;

  for (const q of questions) {
    if (!q) continue;
    const uid = String(q.question_uid || q.uid || "").trim();
    if (!uid) continue;

    // Safety filter: when called via TrackerPage, `questions` is already pre-indexed per subject
    // (via buildQuestionIndexForTrack), so these checks are near-instant no-ops.
    // They remain for correctness when called directly in unit tests with mixed arrays.
    if (!isQuestionInTrack(q, track)) continue;
    if (!isQuestionInSubject(q, subject)) continue;

    totalAvailablePyqs++;
    const isSolved = solvedQuestionUids.has(uid);
    if (isSolved) totalSolvedPyqs++;

    const pRecord = progressMap[uid];
    if (pRecord) {
      const attempts = Number(pRecord.attemptsCount || pRecord.attempts || 0);
      const isRecordSolved = pRecord.isSolved || pRecord.correct === true;
      if (attempts > 0 || isRecordSolved || isSolved) {
        totalAttemptedPyqs++;
        const correctCount = Number(pRecord.correctAttempts ?? pRecord.correctCount ?? (isSolved || isRecordSolved ? 1 : 0));
        const incorrectCount = Number(pRecord.incorrectAttempts ?? pRecord.incorrectCount ?? 0);
        totalCorrect += correctCount;
        totalIncorrect += incorrectCount;
      }
    } else if (isSolved) {
      totalAttemptedPyqs++;
      totalCorrect += 1;
    }
  }

  // Fallback to topic sums if question bank direct count was 0
  if (totalAvailablePyqs === 0) {
    totalAvailablePyqs = matchingTopicMetrics.reduce((sum, m) => sum + m.totalAvailablePyqs, 0);
    totalAttemptedPyqs = matchingTopicMetrics.reduce((sum, m) => sum + m.attemptedPyqs, 0);
    totalSolvedPyqs = matchingTopicMetrics.reduce((sum, m) => sum + m.solvedPyqs, 0);
    totalCorrect = matchingTopicMetrics.reduce((sum, m) => sum + m.correctAttempts, 0);
    totalIncorrect = matchingTopicMetrics.reduce((sum, m) => sum + m.incorrectAttempts, 0);
  }

  const practicePercentage = totalAvailablePyqs > 0 ? Math.round((totalAttemptedPyqs / totalAvailablePyqs) * 100) : 0;
  const totalAttempts = totalCorrect + totalIncorrect;
  const accuracyRate = totalAttempts > 0 ? totalCorrect / totalAttempts : (totalSolvedPyqs > 0 && totalAttemptedPyqs > 0 ? totalSolvedPyqs / totalAttemptedPyqs : 0);

  return {
    subjectId: subject.id,
    slug: subject.slug,
    label: subject.label,
    theoryCompletedCount,
    totalTopicsCount,
    theoryPercentage,
    totalAvailablePyqs,
    totalAttemptedPyqs,
    totalSolvedPyqs,
    practicePercentage,
    accuracyRate,
  };
};

/** Derives aggregate 3-pillar metrics across an entire track */
export const deriveOverallTrackMetrics = (
  topicMetricsList: DerivedTopicMetrics[],
  subjectMetricsList?: DerivedSubjectMetrics[],
  subjects?: SubjectNode[],
  store?: UserTrackerStore
): OverallTrackMetrics => {
  let totalTopics = topicMetricsList.length;
  let theoryCompletedCount = 0;
  let totalAvailablePyqs = 0;
  let totalAttemptedPyqs = 0;
  let totalSolvedPyqs = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;

  let wellPracticedTopicsCount = 0;
  let practicedTopicsCount = 0;
  let inProgressTopicsCount = 0;
  let unpracticedTopicsCount = 0;
  let needsAttentionCount = 0;
  let revisionDueCount = 0;

  if (Array.isArray(subjects) && subjects.length > 0) {
    let subCount = 0;
    let subCompleted = 0;
    for (const subject of subjects) {
      for (const topic of subject.topics) {
        if (topic.subtopics && topic.subtopics.length > 0) {
          for (const st of topic.subtopics) {
            subCount++;
            if (store?.theory?.[st.id]?.isCompleted) {
              subCompleted++;
            }
          }
        } else {
          subCount++;
          if (store?.theory?.[topic.id]?.isCompleted) {
            subCompleted++;
          }
        }
      }
    }
    if (subCount > 0) {
      totalTopics = subCount;
      theoryCompletedCount = subCompleted;
    }
  } else {
    for (const m of topicMetricsList) {
      if (m.theoryCompleted) theoryCompletedCount++;
    }
  }

  for (const m of topicMetricsList) {
    totalCorrect += m.correctAttempts;
    totalIncorrect += m.incorrectAttempts;

    if (m.status === "WELL_PRACTICED") wellPracticedTopicsCount++;
    else if (m.status === "PRACTICED") practicedTopicsCount++;
    else if (m.status === "IN_PROGRESS") inProgressTopicsCount++;
    else if (m.status === "NOT_STARTED") unpracticedTopicsCount++;

    if (m.needsAttention) needsAttentionCount++;
    if (m.isRevisionDue) revisionDueCount++;
  }

  // Use authoritative subject metrics sums if available, else sum topic metrics
  if (Array.isArray(subjectMetricsList) && subjectMetricsList.length > 0) {
    for (const sm of subjectMetricsList) {
      totalAvailablePyqs += sm.totalAvailablePyqs;
      totalAttemptedPyqs += sm.totalAttemptedPyqs;
      totalSolvedPyqs += sm.totalSolvedPyqs;
    }
  } else {
    for (const m of topicMetricsList) {
      totalAvailablePyqs += m.totalAvailablePyqs;
      totalAttemptedPyqs += m.attemptedPyqs;
      totalSolvedPyqs += m.solvedPyqs;
    }
  }

  const theoryPercentage = totalTopics > 0 ? Math.round((theoryCompletedCount / totalTopics) * 100) : 0;
  const practicePercentage = totalAvailablePyqs > 0 ? Math.round((totalAttemptedPyqs / totalAvailablePyqs) * 100) : 0;
  const totalAttempts = totalCorrect + totalIncorrect;
  const overallAccuracyRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : (totalSolvedPyqs > 0 && totalAttemptedPyqs > 0 ? Math.round((totalSolvedPyqs / totalAttemptedPyqs) * 100) : 0);

  return {
    totalTopics,
    theoryCompletedCount,
    theoryPercentage,
    totalAvailablePyqs,
    totalAttemptedPyqs,
    totalSolvedPyqs,
    practicePercentage,
    overallAccuracyRate,
    wellPracticedTopicsCount,
    practicedTopicsCount,
    inProgressTopicsCount,
    unpracticedTopicsCount,
    needsAttentionCount,
    revisionDueCount,
  };
};

/** Detects the most recently practiced topic to power "Continue Where You Left Off" */
export const getContinueTopic = (
  topicMetricsList: DerivedTopicMetrics[],
  topics: TopicNode[]
): { topic: TopicNode; metrics: DerivedTopicMetrics } | null => {
  let latestItem: { topic: TopicNode; metrics: DerivedTopicMetrics; time: number } | null = null;

  for (const metrics of topicMetricsList) {
    if (!metrics.lastPracticedAt) continue;
    const time = new Date(metrics.lastPracticedAt).getTime();
    if (!Number.isFinite(time)) continue;

    if (!latestItem || time > latestItem.time) {
      const topic = topics.find((t) => t.id === metrics.topicId);
      if (topic) {
        latestItem = { topic, metrics, time };
      }
    }
  }

  return latestItem ? { topic: latestItem.topic, metrics: latestItem.metrics } : null;
};
