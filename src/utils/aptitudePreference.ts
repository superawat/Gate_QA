import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export const APTITUDE_ENABLED_STORAGE_KEY = "gateqa-aptitude-enabled";
export const APTITUDE_ENABLED_CHANGE_EVENT = "gateqa:aptitude-enabled-change";
export const DEFAULT_APTITUDE_ENABLED = false;

type AptitudeEnabledSetter = Dispatch<SetStateAction<boolean>>;
type AptitudeEnabledState = [boolean, AptitudeEnabledSetter];
type AptitudeEnabledChangeEvent = CustomEvent<{ enabled: boolean }>;

const isAptitudeEnabledChangeEvent = (event: Event): event is AptitudeEnabledChangeEvent => {
  return (
    "detail" in event &&
    typeof (event as CustomEvent<{ enabled?: unknown }>).detail?.enabled === "boolean"
  );
};

export const readAptitudeEnabled = (): boolean => {
  if (typeof window === "undefined") {
    return DEFAULT_APTITUDE_ENABLED;
  }

  // Force enable synchronously if directly landing on an Aptitude question route,
  // preventing initial-tick race condition redirects before React useEffect hydrates.
  if (window.location.pathname.includes('/question/APT-') || window.location.hash.includes('/question/APT-')) {
    return true;
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

export const writeAptitudeEnabled = (enabled: unknown): boolean => {
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

export const useAptitudeEnabled = (): AptitudeEnabledState => {
  const [enabled, setEnabledState] = useState(readAptitudeEnabled);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromStorage = () => {
      setEnabledState(readAptitudeEnabled());
    };
    const syncFromEvent = (event: Event) => {
      if (isAptitudeEnabledChangeEvent(event)) {
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

  const setEnabled = useCallback<AptitudeEnabledSetter>((nextValue) => {
    setEnabledState((previousValue) => {
      const resolvedValue = typeof nextValue === "function"
        ? nextValue(previousValue)
        : nextValue;
      return writeAptitudeEnabled(resolvedValue);
    });
  }, []);

  return [enabled, setEnabled];
};
