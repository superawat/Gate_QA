/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  openLLMForQuestion,
  copyPromptOnly,
  copyTextToClipboard,
} from "./llmRedirectService";
import { setPreferredLLMProviderId } from "../utils/llmPreferences";

describe("llmRedirectService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    // Mock window.open
    window.open = vi.fn();
  });

  const sampleQuestion = {
    question_uid: "test:q1",
    question: "What is P vs NP?",
    type: "MCQ",
    normalizedOptions: [
      { label: "A", text: "Open Problem" },
      { label: "B", text: "Solved" },
    ],
  };

  it("handles ChatGPT prefilled redirect and copies to clipboard", async () => {
    setPreferredLLMProviderId("chatgpt");
    const result = await openLLMForQuestion(sampleQuestion);

    expect(result.success).toBe(true);
    expect(result.mode).toBe("prefill");
    expect(result.provider?.id).toBe("chatgpt");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(result.prompt);
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("https://chatgpt.com/?q="),
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("handles Gemini clipboard fallback and opens base URL", async () => {
    setPreferredLLMProviderId("gemini");
    const result = await openLLMForQuestion(sampleQuestion);

    expect(result.success).toBe(true);
    expect(result.mode).toBe("clipboard");
    expect(result.provider?.id).toBe("gemini");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(result.prompt);
    expect(window.open).toHaveBeenCalledWith(
      "https://gemini.google.com/app",
      "_blank",
      "noopener,noreferrer"
    );
    expect(result.message).toContain("Prompt copied to clipboard! Opening Google Gemini...");
  });

  it("handles copyPromptOnly without opening a window", async () => {
    const result = await copyPromptOnly(sampleQuestion);

    expect(result.success).toBe(true);
    expect(result.mode).toBe("copy_only");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(result.prompt);
    expect(window.open).not.toHaveBeenCalled();
    expect(result.message).toBe("Prompt copied to clipboard!");
  });

  it("handles missing question gracefully", async () => {
    const result = await openLLMForQuestion(null as any);
    expect(result.success).toBe(false);
    expect(result.message).toBe("No question text available to send.");
  });
});
