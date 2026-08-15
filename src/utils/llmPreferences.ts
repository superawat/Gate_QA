import { useEffect, useState, useCallback } from "react";
import {
  DEFAULT_LLM_PROVIDER_ID,
  LLM_PREFERENCE_EVENT,
  LLM_PREFERENCE_STORAGE_KEY,
  LLMProviderId,
  isSupportedLLMProviderId,
  getLLMProvider,
  LLMProvider,
} from "../config/llmProviders";

/**
 * Reads the preferred LLM provider ID from localStorage.
 * Defaults to 'chatgpt' if unset or invalid.
 */
export function getPreferredLLMProviderId(): LLMProviderId {
  try {
    const stored = localStorage.getItem(LLM_PREFERENCE_STORAGE_KEY);
    if (stored && isSupportedLLMProviderId(stored)) {
      return stored;
    }
  } catch {
    // LocalStorage read errors (e.g. private mode restrictions)
  }
  return DEFAULT_LLM_PROVIDER_ID;
}

/**
 * Persists the preferred LLM provider ID to localStorage and notifies active listeners.
 */
export function setPreferredLLMProviderId(providerId: string): LLMProviderId {
  const validId: LLMProviderId = isSupportedLLMProviderId(providerId)
    ? providerId
    : DEFAULT_LLM_PROVIDER_ID;

  try {
    localStorage.setItem(LLM_PREFERENCE_STORAGE_KEY, validId);
  } catch {
    // LocalStorage write errors
  }

  // Dispatch custom window event for same-tab reactive components
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(LLM_PREFERENCE_EVENT, {
        detail: { providerId: validId },
      })
    );
  }

  return validId;
}

/**
 * React hook to read and update the preferred LLM provider reactively across components and tabs.
 */
export function useLLMPreference(): {
  providerId: LLMProviderId;
  provider: LLMProvider;
  setPreference: (id: string) => void;
} {
  const [providerId, setProviderId] = useState<LLMProviderId>(() => getPreferredLLMProviderId());

  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      const custom = event as CustomEvent<{ providerId: LLMProviderId }>;
      if (custom.detail?.providerId && isSupportedLLMProviderId(custom.detail.providerId)) {
        setProviderId(custom.detail.providerId);
      } else {
        setProviderId(getPreferredLLMProviderId());
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LLM_PREFERENCE_STORAGE_KEY) {
        setProviderId(getPreferredLLMProviderId());
      }
    };

    window.addEventListener(LLM_PREFERENCE_EVENT, handleCustomEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(LLM_PREFERENCE_EVENT, handleCustomEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setPreference = useCallback((id: string) => {
    const updated = setPreferredLLMProviderId(id);
    setProviderId(updated);
  }, []);

  return {
    providerId,
    provider: getLLMProvider(providerId),
    setPreference,
  };
}
