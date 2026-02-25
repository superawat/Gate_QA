const DEFAULT_RETRY_COUNT = 20;
const DEFAULT_RETRY_DELAY_MS = 120;
const DEFAULT_EVENT_DEDUP_TTL_MS = 60_000;

const sentEventActionMap = new Map();

function now() {
  return Date.now();
}

function cleanupExpiredEventKeys() {
  const current = now();
  for (const [key, expiresAt] of sentEventActionMap.entries()) {
    if (expiresAt <= current) {
      sentEventActionMap.delete(key);
    }
  }
}

function normalizeEventName(eventName) {
  const raw = String(eventName || "").trim();
  if (!raw) {
    return "";
  }
  return raw.replace(/^\/+/, "");
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForGoatCounter({
  maxRetries = DEFAULT_RETRY_COUNT,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
} = {}) {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    if (
      typeof window !== "undefined" &&
      window.goatcounter &&
      typeof window.goatcounter.count === "function"
    ) {
      return window.goatcounter;
    }
    if (attempt < maxRetries) {
      await sleep(retryDelayMs);
    }
  }
  return null;
}

export function createGoatCounterActionId(prefix = "action") {
  const safePrefix = String(prefix || "action").replace(/[^a-z0-9_-]/gi, "");
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${safePrefix}:${crypto.randomUUID()}`;
  }
  return `${safePrefix}:${now().toString(36)}:${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function getCurrentSpaPath({ includeHash = false } = {}) {
  if (typeof window === "undefined") {
    return "/";
  }
  const hash = includeHash ? window.location.hash || "" : "";
  return `${window.location.pathname || "/"}${window.location.search || ""}${hash}`;
}

export async function trackGoatCounterPageview({
  path = getCurrentSpaPath(),
  title = typeof document !== "undefined" ? document.title : "",
  referrer,
  maxRetries = DEFAULT_RETRY_COUNT,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
} = {}) {
  const goatcounter = await waitForGoatCounter({ maxRetries, retryDelayMs });
  if (!goatcounter) {
    return { ok: false, reason: "goatcounter_unavailable" };
  }

  goatcounter.count({
    path,
    title,
    referrer,
    event: false,
  });

  return { ok: true };
}

/**
 * Track an event exactly once per (eventName, actionId) key.
 * - eventName becomes GoatCounter's event path.
 * - actionId should be generated at user-action boundary (e.g. click handler).
 */
export async function trackGoatCounterEventOnce({
  eventName,
  actionId,
  title = "",
  maxRetries = DEFAULT_RETRY_COUNT,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  dedupTtlMs = DEFAULT_EVENT_DEDUP_TTL_MS,
} = {}) {
  const normalizedEventName = normalizeEventName(eventName);
  const normalizedActionId = String(actionId || "").trim();
  if (!normalizedEventName) {
    return { ok: false, reason: "event_name_required" };
  }
  if (!normalizedActionId) {
    return { ok: false, reason: "action_id_required" };
  }

  cleanupExpiredEventKeys();
  const dedupKey = `${normalizedEventName}::${normalizedActionId}`;
  if (sentEventActionMap.has(dedupKey)) {
    return { ok: false, reason: "duplicate_action", dedupKey };
  }

  const goatcounter = await waitForGoatCounter({ maxRetries, retryDelayMs });
  if (!goatcounter) {
    return { ok: false, reason: "goatcounter_unavailable", dedupKey };
  }

  goatcounter.count({
    path: normalizedEventName,
    title,
    event: true,
  });

  sentEventActionMap.set(dedupKey, now() + Math.max(1, dedupTtlMs));
  return { ok: true, dedupKey };
}

export function resetGoatCounterEventDedup() {
  sentEventActionMap.clear();
}
