export type LLMProviderId = "chatgpt" | "gemini" | "claude" | "deepseek" | "perplexity" | "qwen";

export interface LLMProvider {
  id: LLMProviderId;
  name: string;
  shortName: string;
  tagline: string;
  baseUrl: string;
  supportsPrefill: boolean;
  maxPrefillLength?: number;
  buildUrl: (prompt: string) => string;
  accentColor: string;
  badge?: string;
}

export const DEFAULT_LLM_PROVIDER_ID: LLMProviderId = "chatgpt";
export const LLM_PREFERENCE_STORAGE_KEY = "gateqa_llm_preference";
export const LLM_PREFERENCE_EVENT = "gateqa:llm-preference-changed";

export const LLM_PROVIDERS: Record<LLMProviderId, LLMProvider> = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    shortName: "ChatGPT",
    tagline: "OpenAI GPT-4o / Reasoning",
    baseUrl: "https://chatgpt.com/",
    supportsPrefill: true,
    maxPrefillLength: 2000,
    buildUrl: (prompt: string) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
    accentColor: "#74aa9c",
    badge: "Popular",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    shortName: "Gemini",
    tagline: "Google Advanced Multimodal AI",
    baseUrl: "https://gemini.google.com/app",
    supportsPrefill: false,
    buildUrl: () => "https://gemini.google.com/app",
    accentColor: "#3186ff",
  },
  claude: {
    id: "claude",
    name: "Anthropic Claude",
    shortName: "Claude",
    tagline: "Anthropic Claude 3.5 Sonnet",
    baseUrl: "https://claude.ai/new",
    supportsPrefill: false,
    buildUrl: () => "https://claude.ai/new",
    accentColor: "#d97757",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    shortName: "DeepSeek",
    tagline: "DeepSeek R1 / V3 Reasoning",
    baseUrl: "https://chat.deepseek.com/",
    supportsPrefill: false,
    buildUrl: () => "https://chat.deepseek.com/",
    accentColor: "#4d6bfe",
  },
  perplexity: {
    id: "perplexity",
    name: "Perplexity AI",
    shortName: "Perplexity",
    tagline: "AI Search with Web Citations",
    baseUrl: "https://www.perplexity.ai/",
    supportsPrefill: true,
    maxPrefillLength: 2000,
    buildUrl: (prompt: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
    accentColor: "#22b8cd",
  },
  qwen: {
    id: "qwen",
    name: "Qwen AI",
    shortName: "Qwen",
    tagline: "Alibaba Qwen Studio",
    baseUrl: "https://chat.qwen.ai/",
    supportsPrefill: false,
    buildUrl: () => "https://chat.qwen.ai/",
    accentColor: "#665cee",
  },
};

export const LLM_PROVIDER_LIST: LLMProvider[] = [
  LLM_PROVIDERS.chatgpt,
  LLM_PROVIDERS.gemini,
  LLM_PROVIDERS.claude,
  LLM_PROVIDERS.deepseek,
  LLM_PROVIDERS.perplexity,
  LLM_PROVIDERS.qwen,
];

export function isSupportedLLMProviderId(id: unknown): id is LLMProviderId {
  return typeof id === "string" && Object.prototype.hasOwnProperty.call(LLM_PROVIDERS, id);
}

export function getLLMProvider(id?: string | null): LLMProvider {
  if (id && isSupportedLLMProviderId(id)) {
    return LLM_PROVIDERS[id];
  }
  return LLM_PROVIDERS[DEFAULT_LLM_PROVIDER_ID];
}
