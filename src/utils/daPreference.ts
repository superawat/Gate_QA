import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export const DA_ENABLED_STORAGE_KEY = "gateqa_include_da";
export const DA_ENABLED_CHANGE_EVENT = "gateqa:da-enabled-change";
export const DEFAULT_DA_ENABLED = false;

type DaEnabledSetter = Dispatch<SetStateAction<boolean>>;
type DaEnabledState = [boolean, DaEnabledSetter];
type DaEnabledChangeEvent = CustomEvent<{ enabled: boolean }>;

const isDaEnabledChangeEvent = (event: Event): event is DaEnabledChangeEvent => {
  return (
    "detail" in event &&
    typeof (event as CustomEvent<{ enabled?: unknown }>).detail?.enabled === "boolean"
  );
};

export const readDaEnabled = (): boolean => {
  if (typeof window === "undefined") {
    return DEFAULT_DA_ENABLED;
  }

  // Force enable synchronously if directly landing on a DA question route,
  // preventing initial-tick race condition redirects before React useEffect hydrates.
  if (
    window.location.pathname.includes('/question/DA-') ||
    window.location.pathname.includes('/question/da-') ||
    window.location.hash.includes('/question/DA-') ||
    window.location.hash.includes('/question/da-')
  ) {
    return true;
  }

  try {
    const rawValue = window.localStorage.getItem(DA_ENABLED_STORAGE_KEY);
    if (rawValue === null) {
      return DEFAULT_DA_ENABLED;
    }
    return rawValue === "true" || rawValue === "1";
  } catch {
    return DEFAULT_DA_ENABLED;
  }
};

export const writeDaEnabled = (enabled: unknown): boolean => {
  const nextEnabled = Boolean(enabled);
  if (typeof window === "undefined") {
    return nextEnabled;
  }

  try {
    window.localStorage.setItem(DA_ENABLED_STORAGE_KEY, String(nextEnabled));
  } catch {
    // Keep the in-memory state usable when storage is blocked.
  }

  window.dispatchEvent(new CustomEvent(DA_ENABLED_CHANGE_EVENT, {
    detail: { enabled: nextEnabled },
  }));
  return nextEnabled;
};

export const useDaEnabled = (): DaEnabledState => {
  const [enabled, setEnabledState] = useState(readDaEnabled);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromStorage = () => {
      setEnabledState(readDaEnabled());
    };
    const syncFromEvent = (event: Event) => {
      if (isDaEnabledChangeEvent(event)) {
        setEnabledState(event.detail.enabled);
        return;
      }
      syncFromStorage();
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(DA_ENABLED_CHANGE_EVENT, syncFromEvent);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(DA_ENABLED_CHANGE_EVENT, syncFromEvent);
    };
  }, []);

  const setEnabled = useCallback<DaEnabledSetter>((nextValue) => {
    setEnabledState((previousValue) => {
      const resolvedValue = typeof nextValue === "function"
        ? nextValue(previousValue)
        : nextValue;
      return writeDaEnabled(resolvedValue);
    });
  }, []);

  return [enabled, setEnabled];
};
