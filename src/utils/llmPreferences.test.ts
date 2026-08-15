/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  getPreferredLLMProviderId,
  setPreferredLLMProviderId,
  useLLMPreference,
} from "./llmPreferences";
import { LLM_PREFERENCE_STORAGE_KEY, DEFAULT_LLM_PROVIDER_ID } from "../config/llmProviders";
import { renderHook, act } from "@testing-library/react";

describe("llmPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns default chatgpt when no preference stored", () => {
    expect(getPreferredLLMProviderId()).toBe(DEFAULT_LLM_PROVIDER_ID);
  });

  it("saves and retrieves valid provider ID", () => {
    setPreferredLLMProviderId("claude");
    expect(localStorage.getItem(LLM_PREFERENCE_STORAGE_KEY)).toBe("claude");
    expect(getPreferredLLMProviderId()).toBe("claude");
  });

  it("falls back to default if stored value is invalid", () => {
    localStorage.setItem(LLM_PREFERENCE_STORAGE_KEY, "invalid-ai-engine");
    expect(getPreferredLLMProviderId()).toBe("chatgpt");
  });

  it("useLLMPreference hook reacts to preference updates", () => {
    const { result } = renderHook(() => useLLMPreference());

    expect(result.current.providerId).toBe("chatgpt");
    expect(result.current.provider.name).toBe("ChatGPT");

    act(() => {
      result.current.setPreference("gemini");
    });

    expect(result.current.providerId).toBe("gemini");
    expect(result.current.provider.name).toBe("Google Gemini");
    expect(localStorage.getItem(LLM_PREFERENCE_STORAGE_KEY)).toBe("gemini");
  });
});
