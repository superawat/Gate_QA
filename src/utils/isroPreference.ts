import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export const ISRO_ENABLED_STORAGE_KEY = "gateqa_include_isro";
export const ISRO_ENABLED_CHANGE_EVENT = "gateqa:isro-enabled-change";
export const DEFAULT_ISRO_ENABLED = false;

type IsroEnabledSetter = Dispatch<SetStateAction<boolean>>;
type IsroEnabledState = [boolean, IsroEnabledSetter];
type IsroEnabledChangeEvent = CustomEvent<{ enabled: boolean }>;

const isIsroEnabledChangeEvent = (event: Event): event is IsroEnabledChangeEvent => {
  return (
    "detail" in event &&
    typeof (event as CustomEvent<{ enabled?: unknown }>).detail?.enabled === "boolean"
  );
};

export const readIsroEnabled = (): boolean => {
  if (typeof window === "undefined") {
    return DEFAULT_ISRO_ENABLED;
  }

  // Force enable synchronously if directly landing on an ISRO question route,
  // preventing initial-tick race condition redirects before React useEffect hydrates.
  if (
    window.location.pathname.includes('/question/isro:') ||
    window.location.pathname.includes('/question/ISRO-') ||
    window.location.pathname.includes('/question/isro-') ||
    window.location.hash.includes('/question/isro:') ||
    window.location.hash.includes('/question/ISRO-') ||
    window.location.hash.includes('/question/isro-')
  ) {
    return true;
  }

  try {
    const rawValue = window.localStorage.getItem(ISRO_ENABLED_STORAGE_KEY);
    if (rawValue === null) {
      return DEFAULT_ISRO_ENABLED;
    }
    return rawValue === "true" || rawValue === "1";
  } catch {
    return DEFAULT_ISRO_ENABLED;
  }
};

export const writeIsroEnabled = (enabled: unknown): boolean => {
  const nextEnabled = Boolean(enabled);
  if (typeof window === "undefined") {
    return nextEnabled;
  }

  try {
    window.localStorage.setItem(ISRO_ENABLED_STORAGE_KEY, String(nextEnabled));
  } catch {
    // Keep the in-memory state usable when storage is blocked.
  }

  window.dispatchEvent(new CustomEvent(ISRO_ENABLED_CHANGE_EVENT, {
    detail: { enabled: nextEnabled },
  }));
  return nextEnabled;
};

export const useIsroEnabled = (): IsroEnabledState => {
  const [enabled, setEnabledState] = useState(readIsroEnabled);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromStorage = () => {
      setEnabledState(readIsroEnabled());
    };
    const syncFromEvent = (event: Event) => {
      if (isIsroEnabledChangeEvent(event)) {
        setEnabledState(event.detail.enabled);
        return;
      }
      syncFromStorage();
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(ISRO_ENABLED_CHANGE_EVENT, syncFromEvent);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(ISRO_ENABLED_CHANGE_EVENT, syncFromEvent);
    };
  }, []);

  const setEnabled = useCallback<IsroEnabledSetter>((nextValue) => {
    setEnabledState((previousValue) => {
      const resolvedValue = typeof nextValue === "function"
        ? nextValue(previousValue)
        : nextValue;
      return writeIsroEnabled(resolvedValue);
    });
  }, []);

  return [enabled, setEnabled];
};
