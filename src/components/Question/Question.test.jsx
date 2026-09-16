/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Question from "./Question";

const mockFilterActions = {
  toggleSolved: vi.fn(),
  toggleBookmark: vi.fn(),
  isQuestionSolved: vi.fn(() => false),
  isQuestionBookmarked: vi.fn(() => false),
  getQuestionProgressId: vi.fn((q) => q.question_uid || "q-test-1"),
};

vi.mock("../../contexts/FilterContext", () => ({
  useFilterActions: () => mockFilterActions,
  useFilterState: () => ({}),
}));

vi.mock("../../contexts/SessionContext", () => ({
  useSession: () => ({ goBack: vi.fn(), canGoBack: false }),
}));

vi.mock("../Math/MathRuntime", () => ({
  MathContent: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock("../../utils/syncQueue", () => ({
  enqueueChange: vi.fn(),
}));

describe("Question Component - Mobile & Responsive Layout", () => {
  const sampleQuestion = {
    question_uid: "test:q1",
    title: "Test Question 1",
    question: "<p>What is the time complexity?</p>",
    answer_meta: {
      type: "MCQ",
      answer: "A",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  test("renders card with responsive mobile-friendly padding (p-4 sm:p-6)", () => {
    const { container } = render(<Question question={sampleQuestion} />);
    const card = container.querySelector(".rounded-xl.sm\\:rounded-2xl");
    expect(card).toBeTruthy();
    expect(card.className).toContain("p-4");
    expect(card.className).toContain("sm:p-6");
  });

  test("tapping Add Note in the mobile action bar opens note editor", () => {
    render(<Question question={sampleQuestion} />);

    // Mobile action bar has "Add Note"
    const addNoteBtn = screen.getByRole("button", { name: "Add personal note" });
    expect(addNoteBtn).toBeTruthy();

    // Desktop placeholder button has hidden md:block class
    const desktopPlaceholder = screen.getByText("Add Personal Note").closest("button");
    expect(desktopPlaceholder.parentElement.className).toContain("hidden");
    expect(desktopPlaceholder.parentElement.className).toContain("md:block");

    // Click mobile "Add Note"
    fireEvent.click(addNoteBtn);

    // Note editor textarea should appear and be editable
    const textarea = screen.getByPlaceholderText(/Add your personal notes/i);
    expect(textarea).toBeTruthy();

    // Type a note and save
    fireEvent.change(textarea, { target: { value: "O(1) time complexity" } });
    const saveBtn = screen.getByRole("button", { name: /Save Note/i });
    fireEvent.click(saveBtn);

    // Note should now be visible in note card
    expect(screen.getByText("O(1) time complexity")).toBeTruthy();

    // Mobile button label should now be "Note"
    expect(screen.getByRole("button", { name: "View personal note" })).toBeTruthy();
  });
});
