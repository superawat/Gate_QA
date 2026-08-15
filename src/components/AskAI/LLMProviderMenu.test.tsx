/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LLMProviderMenu } from "./LLMProviderMenu";
import { LLM_PROVIDERS } from "../../config/llmProviders";

describe("LLMProviderMenu", () => {
  it("renders all providers and triggers onSelectProvider when clicked", () => {
    const onSelectMock = vi.fn();
    const onSetDefaultMock = vi.fn();
    const onCopyPromptMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <LLMProviderMenu
        currentProviderId="chatgpt"
        onSelectProvider={onSelectMock}
        onSetDefaultProvider={onSetDefaultMock}
        onCopyPromptOnly={onCopyPromptMock}
        onClose={onCloseMock}
      />
    );

    expect(screen.getByText("ChatGPT")).toBeTruthy();
    expect(screen.getByText("Gemini")).toBeTruthy();
    expect(screen.getByText("Claude")).toBeTruthy();
    expect(screen.getByText("DeepSeek")).toBeTruthy();
    expect(screen.getByText("Perplexity")).toBeTruthy();

    const geminiBtn = screen.getByTitle("Ask Google Gemini");
    fireEvent.click(geminiBtn);

    expect(onSelectMock).toHaveBeenCalledWith(LLM_PROVIDERS.gemini);
  });

  it("triggers onSetDefaultProvider when star icon is clicked", () => {
    const onSetDefaultMock = vi.fn();

    render(
      <LLMProviderMenu
        currentProviderId="chatgpt"
        onSelectProvider={vi.fn()}
        onSetDefaultProvider={onSetDefaultMock}
        onCopyPromptOnly={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const setDefaultClaudeBtn = screen.getByLabelText("Set Claude as default");
    fireEvent.click(setDefaultClaudeBtn);

    expect(onSetDefaultMock).toHaveBeenCalledWith("claude");
  });

  it("triggers onCopyPromptOnly when copy prompt button is clicked", () => {
    const onCopyPromptMock = vi.fn();

    render(
      <LLMProviderMenu
        currentProviderId="chatgpt"
        onSelectProvider={vi.fn()}
        onSetDefaultProvider={vi.fn()}
        onCopyPromptOnly={onCopyPromptMock}
        onClose={vi.fn()}
      />
    );

    const copyBtn = screen.getByRole("menuitem", { name: /Copy Prompt Only/i });
    fireEvent.click(copyBtn);

    expect(onCopyPromptMock).toHaveBeenCalled();
  });

  it("closes when Escape key is pressed", () => {
    const onCloseMock = vi.fn();

    render(
      <LLMProviderMenu
        currentProviderId="chatgpt"
        onSelectProvider={vi.fn()}
        onSetDefaultProvider={vi.fn()}
        onCopyPromptOnly={vi.fn()}
        onClose={onCloseMock}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCloseMock).toHaveBeenCalled();
  });
});
