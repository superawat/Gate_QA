export interface UserStateData {
  solved: string[];
  bookmarked: string[];
  metadata: Record<string, any>;
  progress: Record<string, any>;
}

export interface ExportedUserState {
  schemaVersion: number;
  exportedAt: string;
  data: UserStateData;
}

export interface WriteStorageResult {
  ok: boolean;
  reason?: string;
  error?: any;
}

export interface ExportUserStateResult {
  ok: boolean;
  payload?: ExportedUserState;
  json?: string;
}

export interface ImportUserStateResult {
  ok: boolean;
  reason?: string;
  error?: any;
  applied?: UserStateData;
}

const USER_STATE_STORAGE_KEYS = Object.freeze({
  solved: "gate_qa_solved_questions",
  bookmarked: "gate_qa_bookmarked_questions",
  metadata: "gate_qa_progress_metadata",
  progress: "gateqa_progress_v1",
});

const APTITUDE_USER_STATE_STORAGE_KEYS = Object.freeze({
  solved: "gateqa-apt-solved-questions",
  bookmarked: "gateqa-apt-bookmarked-questions",
  metadata: "gateqa-apt-progress-metadata",
  progress: "gateqa_apt_progress_v1",
});

const IMPORT_SCHEMA_VERSION = 1;

function getDefaultStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const value of raw) {
    const token = String(value || "").trim();
    if (!token || seen.has(token)) {
      continue;
    }
    seen.add(token);
    normalized.push(token);
  }
  return normalized;
}

export function isQuotaExceededError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const errObj = error as { name?: string; code?: number };
  const name = String(errObj.name || "").toLowerCase();
  const code = Number(errObj.code || 0);
  return (
    name === "quotaexceedederror" ||
    name === "ns_error_dom_quota_reached" ||
    code === 22 ||
    code === 1014
  );
}

export function readStorageJson<T>(
  key: string,
  fallback: T,
  storage: Storage | null = getDefaultStorage()
): T {
  if (!storage) {
    return fallback;
  }
  try {
    const raw = storage.getItem(key);
    if (raw == null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    return fallback;
  }
}

export function writeStorageJson(
  key: string,
  payload: unknown,
  storage: Storage | null = getDefaultStorage()
): WriteStorageResult {
  if (!storage) {
    return {
      ok: false,
      reason: "storage_unavailable",
    };
  }
  try {
    storage.setItem(key, JSON.stringify(payload));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: isQuotaExceededError(error) ? "quota_exceeded" : "write_failed",
      error,
    };
  }
}

export function exportUserState(
  storage: Storage | null = getDefaultStorage()
): ExportUserStateResult {
  const payload: ExportedUserState = {
    schemaVersion: IMPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      solved: normalizeStringArray(
        readStorageJson(USER_STATE_STORAGE_KEYS.solved, [], storage)
      ),
      bookmarked: normalizeStringArray(
        readStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, [], storage)
      ),
      metadata: readStorageJson<Record<string, any>>(USER_STATE_STORAGE_KEYS.metadata, {}, storage),
      progress: readStorageJson<Record<string, any>>(USER_STATE_STORAGE_KEYS.progress, {}, storage),
    },
  };

  return {
    ok: true,
    payload,
    json: JSON.stringify(payload, null, 2),
  };
}

function normalizeImportedPayload(input: any): UserStateData {
  const root = input && typeof input === "object" ? input : {};
  const data =
    root.data && typeof root.data === "object" ? root.data : root;

  const metadata =
    data.metadata && typeof data.metadata === "object" ? data.metadata : {};
  const progress =
    data.progress && typeof data.progress === "object" ? data.progress : {};

  return {
    solved: normalizeStringArray(data.solved),
    bookmarked: normalizeStringArray(data.bookmarked),
    metadata,
    progress,
  };
}

/**
 * Import state from JSON string or already parsed object.
 * Returns a typed result object and never throws.
 */
export function importUserState(
  input: string | Record<string, any>,
  storage: Storage | null = getDefaultStorage()
): ImportUserStateResult {
  if (!storage) {
    return { ok: false, reason: "storage_unavailable" };
  }

  let parsed: any;
  try {
    parsed =
      typeof input === "string"
        ? JSON.parse(input)
        : input && typeof input === "object"
        ? input
        : null;
  } catch (error) {
    return {
      ok: false,
      reason: "invalid_json",
      error,
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, reason: "invalid_payload" };
  }

  const normalized = normalizeImportedPayload(parsed);
  const writes = [
    writeStorageJson(USER_STATE_STORAGE_KEYS.solved, normalized.solved, storage),
    writeStorageJson(
      USER_STATE_STORAGE_KEYS.bookmarked,
      normalized.bookmarked,
      storage
    ),
    writeStorageJson(USER_STATE_STORAGE_KEYS.metadata, normalized.metadata, storage),
    writeStorageJson(USER_STATE_STORAGE_KEYS.progress, normalized.progress, storage),
  ];

  const failedWrite = writes.find((result) => !result.ok);
  if (failedWrite) {
    return {
      ok: false,
      reason: failedWrite.reason,
      error: failedWrite.error,
    };
  }

  return {
    ok: true,
    applied: normalized,
  };
}

export { USER_STATE_STORAGE_KEYS, APTITUDE_USER_STATE_STORAGE_KEYS };
