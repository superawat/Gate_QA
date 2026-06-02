/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import QuestionPickerList from "./QuestionPickerList";

describe("QuestionPickerList", () => {
  test("renders filtered questions as a direct picker list", () => {
    const handleOpenQuestion = vi.fn();

    render(
      <QuestionPickerList
        questions={[
          {
            question_uid: "go:1",
            title: "GATE CSE 2026 | Question: 1",
            yearSetLabel: "2026 Set 1",
            subjectLabel: "Algorithms",
            type: "mcq",
          },
        ]}
        pageStartIndex={0}
        onOpenQuestion={handleOpenQuestion}
      />
    );


    fireEvent.click(screen.getByRole("button", { name: /gate cse 2026 \| question: 1/i }));
    expect(handleOpenQuestion).toHaveBeenCalledTimes(1);
    expect(handleOpenQuestion.mock.calls[0][0].question_uid).toBe("go:1");
  });

  test("falls back to canonical subject when subjectLabel is stale or missing", () => {
    render(
      <QuestionPickerList
        questions={[
          {
            question_uid: "go:2",
            title: "GATE CSE 2026 | Question: 2",
            yearSetLabel: "2026 Set 1",
            subject: "Discrete Mathematics",
            type: "mcq",
          },
        ]}
        pageStartIndex={0}
        onOpenQuestion={() => {}}
      />
    );

    expect(screen.getAllByText("Discrete Mathematics").length).toBeGreaterThan(0);
  });

  test("hides the type chip when the type is unknown", () => {
    render(
      <QuestionPickerList
        questions={[
          {
            question_uid: "go:3",
            title: "GATE CSE 2026 | Question: 3",
            yearSetLabel: "2026 Set 1",
            subjectLabel: "Algorithms",
            type: "unknown",
          },
        ]}
        pageStartIndex={0}
        onOpenQuestion={() => {}}
      />
    );

    expect(screen.queryByText("unknown")).toBeNull();
  });
});
