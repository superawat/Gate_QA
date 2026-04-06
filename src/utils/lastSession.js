export const LAST_SESSION_STORAGE_KEY = "gateqa_last_session_v1";

const isBrowser = () => typeof window !== "undefined";

export const readLastSession = () => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LAST_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
};

export const writeLastSession = (payload = {}) => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      LAST_SESSION_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        updatedAt: new Date().toISOString(),
        ...payload,
      })
    );
  } catch (error) {
    // ignore storage failures
  }
};
