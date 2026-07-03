import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

// ── Storage keys ──────────────────────────────────────────────────────────────
export const PRACTICE_SHUFFLE_KEY = 'gateqa_practice_shuffle_v1';
export const PRACTICE_APPLY_FILTERS_KEY = 'gateqa_practice_apply_filters_v1';

// Change-notification events so multiple mounted components stay in sync.
export const PRACTICE_SHUFFLE_CHANGE_EVENT = 'gateqa:practice-shuffle-change';
export const PRACTICE_APPLY_FILTERS_CHANGE_EVENT = 'gateqa:practice-apply-filters-change';

// ── Defaults ──────────────────────────────────────────────────────────────────
// Both are ON by default so the existing behaviour is preserved for first-time users.
export const DEFAULT_PRACTICE_SHUFFLE = true;
export const DEFAULT_PRACTICE_APPLY_FILTERS = true;

// ── Generic helpers ───────────────────────────────────────────────────────────
function readBoolPreference(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return raw === 'true' || raw === '1';
  } catch {
    return defaultValue;
  }
}

function writeBoolPreference(key: string, value: boolean, changeEvent: string): boolean {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      // Best-effort; keep in-memory value usable when storage is blocked.
    }
    window.dispatchEvent(
      new CustomEvent(changeEvent, { detail: { enabled: value } }),
    );
  }
  return value;
}

function useBoolPreference(
  key: string,
  defaultValue: boolean,
  changeEvent: string,
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [state, setLocalState] = useState<boolean>(() =>
    readBoolPreference(key, defaultValue),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncFromStorage = () => setLocalState(readBoolPreference(key, defaultValue));
    const syncFromEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled?: unknown }>).detail;
      if (typeof detail?.enabled === 'boolean') {
        setLocalState(detail.enabled);
      } else {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(changeEvent, syncFromEvent);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(changeEvent, syncFromEvent);
    };
  }, [changeEvent, defaultValue, key]);

  const setState = useCallback<Dispatch<SetStateAction<boolean>>>(
    (nextValue) => {
      setLocalState((prev) => {
        const resolved = typeof nextValue === 'function' ? nextValue(prev) : nextValue;
        return writeBoolPreference(key, resolved, changeEvent);
      });
    },
    [changeEvent, key],
  );

  return [state, setState];
}

// ── Shuffle preference ────────────────────────────────────────────────────────
export const readPracticeShuffleEnabled = (): boolean =>
  readBoolPreference(PRACTICE_SHUFFLE_KEY, DEFAULT_PRACTICE_SHUFFLE);

export const writePracticeShuffleEnabled = (enabled: boolean): boolean =>
  writeBoolPreference(PRACTICE_SHUFFLE_KEY, enabled, PRACTICE_SHUFFLE_CHANGE_EVENT);

export const usePracticeShuffleEnabled = (): [boolean, Dispatch<SetStateAction<boolean>>] =>
  useBoolPreference(
    PRACTICE_SHUFFLE_KEY,
    DEFAULT_PRACTICE_SHUFFLE,
    PRACTICE_SHUFFLE_CHANGE_EVENT,
  );

// ── Apply-filters preference ──────────────────────────────────────────────────
export const readPracticeApplyFiltersEnabled = (): boolean =>
  readBoolPreference(PRACTICE_APPLY_FILTERS_KEY, DEFAULT_PRACTICE_APPLY_FILTERS);

export const writePracticeApplyFiltersEnabled = (enabled: boolean): boolean =>
  writeBoolPreference(
    PRACTICE_APPLY_FILTERS_KEY,
    enabled,
    PRACTICE_APPLY_FILTERS_CHANGE_EVENT,
  );

export const usePracticeApplyFiltersEnabled = (): [boolean, Dispatch<SetStateAction<boolean>>] =>
  useBoolPreference(
    PRACTICE_APPLY_FILTERS_KEY,
    DEFAULT_PRACTICE_APPLY_FILTERS,
    PRACTICE_APPLY_FILTERS_CHANGE_EVENT,
  );
