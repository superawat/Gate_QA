const GOATCOUNTER_SCRIPT_URL = "https://gc.zgo.at/count.js";
const GOATCOUNTER_ENDPOINT = "https://superawat.goatcounter.com/count";
const ANALYTICS_SCRIPT_SELECTOR = 'script[data-gateqa-analytics="goatcounter"]';

const queuedPayloads = [];
let analyticsScriptPromise = null;
let analyticsLoadScheduled = false;
let cleanupInteractionListeners = null;

function buildEventTitle(eventName, params = {}) {
  const entries = Object.entries(params || {}).filter(([, value]) => value != null && value !== "");
  if (!entries.length) {
    return eventName;
  }
  return `${eventName} | ${entries.map(([key, value]) => `${key}:${value}`).join(" ")}`;
}

function getGoatCounterClient() {
  if (typeof window === "undefined") {
    return null;
  }
  if (window.goatcounter && typeof window.goatcounter.count === "function") {
    return window.goatcounter;
  }
  return null;
}

function flushQueuedPayloads() {
  const goatcounter = getGoatCounterClient();
  if (!goatcounter || queuedPayloads.length === 0) {
    return;
  }

  while (queuedPayloads.length > 0) {
    goatcounter.count(queuedPayloads.shift());
  }
}

function queuePayload(payload) {
  const goatcounter = getGoatCounterClient();
  if (goatcounter) {
    goatcounter.count(payload);
    return;
  }

  queuedPayloads.push(payload);
}

function loadAnalyticsScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(null);
  }

  const existingClient = getGoatCounterClient();
  if (existingClient) {
    return Promise.resolve(existingClient);
  }

  if (analyticsScriptPromise) {
    return analyticsScriptPromise;
  }

  analyticsScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(ANALYTICS_SCRIPT_SELECTOR);
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        flushQueuedPayloads();
        resolve(getGoatCounterClient());
      }, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = GOATCOUNTER_SCRIPT_URL;
    script.dataset.goatcounter = GOATCOUNTER_ENDPOINT;
    script.dataset.gateqaAnalytics = "goatcounter";
    script.addEventListener("load", () => {
      flushQueuedPayloads();
      resolve(getGoatCounterClient());
    }, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.body.appendChild(script);
  }).catch(() => null);

  return analyticsScriptPromise;
}

function triggerAnalyticsLoad() {
  if (cleanupInteractionListeners) {
    cleanupInteractionListeners();
    cleanupInteractionListeners = null;
  }
  void loadAnalyticsScript();
}

function scheduleAnalyticsLoad() {
  if (typeof window === "undefined" || analyticsLoadScheduled) {
    return;
  }

  analyticsLoadScheduled = true;
  const listeners = [
    ["pointerdown", triggerAnalyticsLoad],
    ["keydown", triggerAnalyticsLoad],
    ["touchstart", triggerAnalyticsLoad],
  ];

  listeners.forEach(([eventName, handler]) => {
    window.addEventListener(eventName, handler, { passive: true, once: true });
  });

  const idleId = typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback(triggerAnalyticsLoad, { timeout: 2000 })
    : window.setTimeout(triggerAnalyticsLoad, 2000);

  cleanupInteractionListeners = () => {
    listeners.forEach(([eventName, handler]) => {
      window.removeEventListener(eventName, handler);
    });

    if (typeof window.cancelIdleCallback === "function" && typeof idleId === "number") {
      window.cancelIdleCallback(idleId);
      return;
    }
    window.clearTimeout(idleId);
  };
}

export const pageview = (title) => {
  if (typeof window === "undefined") {
    return;
  }

  queuePayload({
    path: window.location.pathname,
    title,
    referrer: document.referrer || "",
    event: false,
  });
  scheduleAnalyticsLoad();
};

export const trackEvent = (eventName, params = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  queuePayload({
    path: `event/${String(eventName || "").trim().replace(/^\/+/, "")}`,
    title: buildEventTitle(eventName, params),
    event: true,
  });
  triggerAnalyticsLoad();
};
