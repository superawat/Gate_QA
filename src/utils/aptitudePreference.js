import { useCallback, useEffect, useState } from "react";

export const APTITUDE_ENABLED_STORAGE_KEY = "gateqa-aptitude-enabled";
export const APTITUDE_ENABLED_CHANGE_EVENT = "gateqa:aptitude-enabled-change";
export const DEFAULT_APTITUDE_ENABLED = false;

export const readAptitudeEnabled = () => {
  if (typeof window === "undefined") {
    return DEFAULT_APTITUDE_ENABLED;
  }

  try {
    const rawValue = window.localStorage.getItem(APTITUDE_ENABLED_STORAGE_KEY);
    if (rawValue === null) {
      return DEFAULT_APTITUDE_ENABLED;
    }
    return rawValue === "true" || rawValue === "1";
  } catch {
    return DEFAULT_APTITUDE_ENABLED;
  }
};

export const writeAptitudeEnabled = (enabled) => {
  const nextEnabled = Boolean(enabled);
  if (typeof window === "undefined") {
    return nextEnabled;
  }

  try {
    window.localStorage.setItem(APTITUDE_ENABLED_STORAGE_KEY, String(nextEnabled));
  } catch {
    // Keep the in-memory state usable when storage is blocked.
  }

  window.dispatchEvent(new CustomEvent(APTITUDE_ENABLED_CHANGE_EVENT, {
    detail: { enabled: nextEnabled },
  }));
  return nextEnabled;
};

export const useAptitudeEnabled = () => {
  const [enabled, setEnabledState] = useState(readAptitudeEnabled);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromStorage = () => {
      setEnabledState(readAptitudeEnabled());
    };
    const syncFromEvent = (event) => {
      if (typeof event?.detail?.enabled === "boolean") {
        setEnabledState(event.detail.enabled);
        return;
      }
      syncFromStorage();
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(APTITUDE_ENABLED_CHANGE_EVENT, syncFromEvent);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(APTITUDE_ENABLED_CHANGE_EVENT, syncFromEvent);
    };
  }, []);

  const setEnabled = useCallback((nextValue) => {
    setEnabledState((previousValue) => {
      const resolvedValue = typeof nextValue === "function"
        ? nextValue(previousValue)
        : nextValue;
      return writeAptitudeEnabled(resolvedValue);
    });
  }, []);

  return [enabled, setEnabled];
};
