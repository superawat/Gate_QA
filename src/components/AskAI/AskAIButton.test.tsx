/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AskAIButton from "./AskAIButton";
import * as redirectService from "../../services/llmRedirectService";

describe("AskAIButton", () => {
  const mockQuestion = {
    question_uid: "test:ai:1",
    question: "What is Dijkstra's algorithm?",
    type: "MCQ",
    normalizedOptions: [
      { label: "A", text: "Shortest Path" },
      { label: "B", text: "MST" },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders the Ask AI button with primary action and dropdown chevron", () => {
    render(<AskAIButton question={mockQuestion} />);

    expect(screen.getByRole("button", { name: /Ask AI/i })).toBeTruthy();
    expect(screen.getByTitle(/Choose AI Provider or Change Default/i)).toBeTruthy();
  });

  it("triggers redirect service and notification callback on primary click", async () => {
    const notifyMock = vi.fn();
    const openSpy = vi.spyOn(redirectService, "openLLMForQuestion").mockResolvedValue({
      success: true,
      mode: "prefill",
      prompt: "Sample prompt",
      message: "Opening ChatGPT...",
    });

    render(<AskAIButton question={mockQuestion} onNotification={notifyMock} />);

    const primaryBtn = screen.getByRole("button", { name: /Ask AI/i });
    fireEvent.click(primaryBtn);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalled();
      expect(notifyMock).toHaveBeenCalledWith("Opening ChatGPT...");
    });
  });

  it("opens provider menu dropdown when chevron trigger is clicked", async () => {
    render(<AskAIButton question={mockQuestion} />);

    const dropdownTrigger = screen.getByTitle(/Choose AI Provider or Change Default/i);
    fireEvent.click(dropdownTrigger);

    expect(screen.getByText("Select AI Assistant")).toBeTruthy();
    expect(screen.getByText("ChatGPT")).toBeTruthy();
    expect(screen.getByText("Gemini")).toBeTruthy();
    expect(screen.getByText("Claude")).toBeTruthy();
    expect(screen.getByText("DeepSeek")).toBeTruthy();
    expect(screen.getByText("Perplexity")).toBeTruthy();
  });
});
