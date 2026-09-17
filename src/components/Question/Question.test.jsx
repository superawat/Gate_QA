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

  test("renders question go:527 without raw [latex] tags and with math delimiters intact", () => {
    const go527Question = {
      question_uid: "go:527",
      title: "GATE CSE 1991 | Question: 03.xiii",
      question: `<p>Choose the correct alternatives (more than one may be correct) and write the corresponding letters only.</p><p>Let $r=1(1+0)^*, s=11^*0 \\text{ and } t=1^*0$ be three regular expressions. Which one of the following is true?</p>
<ol style="list-style-type:upper-alpha">
<li>
<p>$L(s) \\subseteq L(r) \\text{ and } L(s) \\subseteq L(t)$</p>
</li>
<li>
<p>$L(r) \\subseteq L(s) \\text{ and }  L(s) \\subseteq L(t)$</p>
</li>
<li>
<p>$L(s) \\subseteq L(t) \\text{ and }  L(s) \\subseteq L(r)$</p>
</li>
<li>
<p>$L(t) \\subseteq L(s) \\text{ and }  L(s) \\subseteq L(r)$</p>
</li>
</ol>`,
      answer_meta: {
        type: "MSQ",
        answer: ["A", "D"],
      },
    };

    const { container } = render(<Question question={go527Question} />);
    expect(container.innerHTML).not.toContain("[latex]");
    expect(container.innerHTML).not.toContain("[/latex]");
    expect(container.innerHTML).toContain("$r=1(1+0)^*");
    expect(container.innerHTML).toContain("$L(s)");
  });
});
