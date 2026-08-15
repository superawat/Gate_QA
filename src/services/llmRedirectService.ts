import { getLLMProvider, LLMProvider } from "../config/llmProviders";
import { getPreferredLLMProviderId } from "../utils/llmPreferences";
import { buildQuestionLLMPrompt, QuestionLike } from "../utils/llmPromptBuilder";

export interface LLMRedirectResult {
  success: boolean;
  mode: "prefill" | "clipboard" | "copy_only";
  provider?: LLMProvider;
  prompt: string;
  message: string;
}

/**
 * Copies text to the user's clipboard safely across modern and legacy browser contexts.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }

  // 1. Try modern Async Clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to execCommand if permission denied or non-secure origin
    }
  }

  // 2. Fallback using temporary textarea element
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Orchestrates sending the question prompt to the selected or preferred LLM.
 */
export async function openLLMForQuestion(
  question: QuestionLike,
  targetProviderId?: string | null
): Promise<LLMRedirectResult> {
  const providerId = targetProviderId || getPreferredLLMProviderId();
  const provider = getLLMProvider(providerId);
  const prompt = buildQuestionLLMPrompt(question);

  if (!prompt) {
    return {
      success: false,
      mode: "clipboard",
      provider,
      prompt: "",
      message: "No question text available to send.",
    };
  }

  // Always write prompt to clipboard for user convenience and safety fallback
  await copyTextToClipboard(prompt);

  const maxLen = provider.maxPrefillLength || 2000;
  const canPrefill = provider.supportsPrefill && typeof provider.buildUrl === "function";

  if (canPrefill) {
    const directUrl = provider.buildUrl(prompt);
    // Check if encoded URL is within safe browser limits
    if (directUrl.length <= maxLen * 2) {
      if (typeof window !== "undefined" && typeof window.open === "function") {
        window.open(directUrl, "_blank", "noopener,noreferrer");
      }
      return {
        success: true,
        mode: "prefill",
        provider,
        prompt,
        message: `Opening ${provider.name}...`,
      };
    }
  }

  // Fallback mode: Prompt is on clipboard, open base web application
  if (typeof window !== "undefined" && typeof window.open === "function") {
    window.open(provider.baseUrl, "_blank", "noopener,noreferrer");
  }

  return {
    success: true,
    mode: "clipboard",
    provider,
    prompt,
    message: `Prompt copied to clipboard! Opening ${provider.name}...`,
  };
}

/**
 * Copies the formatted question prompt directly to the clipboard without launching an external URL.
 */
export async function copyPromptOnly(question: QuestionLike): Promise<LLMRedirectResult> {
  const prompt = buildQuestionLLMPrompt(question);
  if (!prompt) {
    return {
      success: false,
      mode: "copy_only",
      prompt: "",
      message: "No question content available to copy.",
    };
  }

  const copied = await copyTextToClipboard(prompt);
  return {
    success: copied,
    mode: "copy_only",
    prompt,
    message: copied ? "Prompt copied to clipboard!" : "Failed to copy prompt.",
  };
}
