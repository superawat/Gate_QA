const USER_STATE_STORAGE_KEYS = Object.freeze({
  solved: "gate_qa_solved_questions",
  bookmarked: "gate_qa_bookmarked_questions",
  metadata: "gate_qa_progress_metadata",
  progress: "gateqa_progress_v1",
});

const IMPORT_SCHEMA_VERSION = 1;

function getDefaultStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

function normalizeStringArray(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set();
  const normalized = [];
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

export function isQuotaExceededError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }
  const name = String(error.name || "").toLowerCase();
  const code = Number(error.code || 0);
  return (
    name === "quotaexceedederror" ||
    name === "ns_error_dom_quota_reached" ||
    code === 22 ||
    code === 1014
  );
}

export function readStorageJson(key, fallback, storage = getDefaultStorage()) {
  if (!storage) {
    return fallback;
  }
  try {
    const raw = storage.getItem(key);
    if (raw == null) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function writeStorageJson(key, payload, storage = getDefaultStorage()) {
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

export function exportUserState(storage = getDefaultStorage()) {
  const payload = {
    schemaVersion: IMPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      solved: normalizeStringArray(
        readStorageJson(USER_STATE_STORAGE_KEYS.solved, [], storage)
      ),
      bookmarked: normalizeStringArray(
        readStorageJson(USER_STATE_STORAGE_KEYS.bookmarked, [], storage)
      ),
      metadata: readStorageJson(USER_STATE_STORAGE_KEYS.metadata, {}, storage),
      progress: readStorageJson(USER_STATE_STORAGE_KEYS.progress, {}, storage),
    },
  };

  return {
    ok: true,
    payload,
    json: JSON.stringify(payload, null, 2),
  };
}

function normalizeImportedPayload(input) {
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
export function importUserState(input, storage = getDefaultStorage()) {
  if (!storage) {
    return { ok: false, reason: "storage_unavailable" };
  }

  let parsed;
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

export { USER_STATE_STORAGE_KEYS };
