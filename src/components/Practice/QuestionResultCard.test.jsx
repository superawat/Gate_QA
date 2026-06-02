/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("../Math/MathRuntime", () => ({
  MathContent: ({ children, className }) => (
    <div data-testid="math-preview" className={className}>
      {children}
    </div>
  ),
}));

import QuestionResultCard from "./QuestionResultCard";

describe("QuestionResultCard", () => {
  test("routes Explore previews through the math wrapper", () => {
    render(
      <QuestionResultCard
        question={{
          question_uid: "go:preview",
          title: "Preview question",
          preview: "Let $x$ be a variable.",
          type: "mcq",
          yearSetLabel: "2026 Set 1",
          subjectLabel: "Algorithms",
        }}
        isSolved={false}
        isBookmarked={false}
        onOpen={() => {}}
      />
    );

    expect(screen.getByTestId("math-preview").textContent).toContain("Let $x$ be a variable.");
  });

  test("trims inline option tails from short MCQ previews", () => {
    render(
      <QuestionResultCard
        question={{
          question_uid: "go:trimmed",
          title: "Trimmed preview",
          preview: "Which one is correct? A B C D",
          type: "mcq",
          yearSetLabel: "2026 Set 1",
          subjectLabel: "Algorithms",
        }}
        isSolved={false}
        isBookmarked={false}
        onOpen={() => {}}
      />
    );

    expect(screen.getByTestId("math-preview").textContent).toBe("Which one is correct?");
  });

  test("does not render an unknown type chip", () => {
    render(
      <QuestionResultCard
        question={{
          question_uid: "go:unknown",
          title: "Unknown type question",
          preview: "Question preview.",
          type: "unknown",
          yearSetLabel: "2026 Set 1",
          subjectLabel: "Algorithms",
        }}
        isSolved={false}
        isBookmarked={false}
        onOpen={() => {}}
      />
    );

    expect(screen.queryByText("unknown")).toBeNull();
  });
});
