import { describe, expect, it } from "vitest";
import {
  DEFAULT_LLM_PROVIDER_ID,
  LLM_PROVIDERS,
  LLM_PROVIDER_LIST,
  getLLMProvider,
  isSupportedLLMProviderId,
} from "./llmProviders";

describe("llmProviders config", () => {
  it("defines default provider as chatgpt", () => {
    expect(DEFAULT_LLM_PROVIDER_ID).toBe("chatgpt");
  });

  it("contains all 5 supported providers with valid properties", () => {
    expect(LLM_PROVIDER_LIST.length).toBe(5);

    const expectedIds = ["chatgpt", "gemini", "claude", "deepseek", "perplexity"];
    for (const id of expectedIds) {
      expect(isSupportedLLMProviderId(id)).toBe(true);
      const provider = LLM_PROVIDERS[id as keyof typeof LLM_PROVIDERS];
      expect(provider).toBeDefined();
      expect(provider.name).toBeTruthy();
      expect(provider.baseUrl).toMatch(/^https?:\/\//);
      expect(typeof provider.buildUrl).toBe("function");
      expect(typeof provider.supportsPrefill).toBe("boolean");
    }
  });

  it("builds query URLs correctly for prefill-supporting providers", () => {
    const testPrompt = "Explain question 1 + 1";
    const chatgptUrl = LLM_PROVIDERS.chatgpt.buildUrl(testPrompt);
    expect(chatgptUrl).toBe(`https://chatgpt.com/?q=${encodeURIComponent(testPrompt)}`);

    const perplexityUrl = LLM_PROVIDERS.perplexity.buildUrl(testPrompt);
    expect(perplexityUrl).toBe(`https://www.perplexity.ai/search?q=${encodeURIComponent(testPrompt)}`);
  });

  it("returns default provider for unknown provider ID", () => {
    const fallback = getLLMProvider("unknown-ai");
    expect(fallback.id).toBe("chatgpt");

    const valid = getLLMProvider("claude");
    expect(valid.id).toBe("claude");
    expect(valid.name).toBe("Anthropic Claude");
  });
});
