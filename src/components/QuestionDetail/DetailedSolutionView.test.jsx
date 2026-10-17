/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import DetailedSolutionView from "./DetailedSolutionView";

// Mock MathContent
vi.mock("../Math/MathRuntime", () => ({
  MathContent: ({ children }) => <div data-testid="math-content">{children}</div>,
}));

describe("DetailedSolutionView", () => {
  const sampleSolution = {
    concept: "Eigenvalues and Cayley-Hamilton Theorem",
    markdown: "Apply the characteristic equation $\\det(A - \\lambda I) = 0$ to solve for $\\lambda$.\n\nTherefore, the correct answer is **B**.",
  };

  test("renders nothing when isVisible is false", () => {
    const { container } = render(
      <DetailedSolutionView solution={sampleSolution} isVisible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders working on solution fallback message when solution is null or undefined", () => {
    const question = { question_uid: "test:q999", title: "GATE ME 2010 | Question 1" };
    render(<DetailedSolutionView solution={null} question={question} isVisible={true} />);
    expect(screen.getByText(/We are working on the solution for this question/i)).toBeDefined();
    expect(screen.getByText(/discussions/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /red flag/i })).toBeDefined();
  });

  test("renders simplified detailed solution without over-engineered sections", () => {
    render(<DetailedSolutionView solution={sampleSolution} isVisible={true} />);

    // Assert simplified header concept and derivation content
    expect(screen.queryByText("Detailed Solution")).toBeNull();
    expect(screen.getByText("Eigenvalues and Cayley-Hamilton Theorem")).toBeDefined();
    expect(screen.getByText(/characteristic equation/i)).toBeDefined();

    // Confirm that removed sections do not appear
    expect(screen.queryByText("Detailed 5-Block Solution")).toBeNull();
    expect(screen.queryByText("Step-by-Step Derivation")).toBeNull();
    expect(screen.queryByText("Key Concept and Formula")).toBeNull();
    expect(screen.queryByText("Given Information and Problem Modeling")).toBeNull();
    expect(screen.queryByText("Option Analysis and Distractor Diagnostic")).toBeNull();
    expect(screen.queryByText("Examiner Pro-Tip & Trap Alert")).toBeNull();
  });

  test("renders direct static solution content without inner collapsible dropdown button", () => {
    render(<DetailedSolutionView solution={sampleSolution} isVisible={true} />);

    // No inner dropdown accordion button
    expect(screen.queryByRole("button", { name: /Detailed Solution/i })).toBeNull();
    // Directly visible content and concept
    expect(screen.getByText("Eigenvalues and Cayley-Hamilton Theorem")).toBeDefined();
    expect(screen.getByText(/characteristic equation/i)).toBeDefined();
  });

  test("renders raw string solutions gracefully without concept header", () => {
    const rawStringSolution = "Direct derivation: $P = 2^6 / 2^9 = 0.125$";
    render(<DetailedSolutionView solution={rawStringSolution} isVisible={true} />);

    expect(screen.queryByText("Detailed Solution")).toBeNull();
    expect(screen.getByText(/Direct derivation/i)).toBeDefined();
  });

  test("renders solution diagrams from images array if not in markdown", () => {
    const solWithImages = {
      concept: "Network Analysis",
      markdown: "Circuit diagram given below.",
      images: ["/question-images/ec/2001/diagram1.webp"],
    };
    render(<DetailedSolutionView solution={solWithImages} isVisible={true} />);

    const img = screen.getByRole("img", { name: /Solution diagram 1/i });
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("/question-images/ec/2001/diagram1.webp");
  });

  test("renders smaller font footer with red flag report prompt and link", () => {
    const question = {
      question_uid: "test:q123",
      exam: { label: "GATE ME 2020" },
      subjectLabel: "Manufacturing Engineering",
    };
    render(<DetailedSolutionView solution={sampleSolution} question={question} isVisible={true} />);

    // Assert footer text presence
    expect(
      screen.getByText(/If you have a better solution of this question than this, report the question by pressing the/i)
    ).toBeDefined();
    expect(screen.getByText(/and submit it\./i)).toBeDefined();

    // Assert red flag link
    const flagLink = screen.getByRole("link", { name: /red flag/i });
    expect(flagLink).toBeDefined();
    expect(flagLink.getAttribute("href")).toContain("docs.google.com/forms");
    expect(flagLink.getAttribute("href")).toContain("test%3Aq123");
    expect(flagLink.getAttribute("target")).toBe("_blank");

    // Assert right-aligned smaller font container class
    const footerContainer = flagLink.closest("div");
    expect(footerContainer.className).toContain("text-xs");
    expect(footerContainer.className).toContain("justify-end");
    expect(footerContainer.className).toContain("text-right");

    // Link text itself does not have red text color
    expect(flagLink.className).not.toContain("text-rose-500");
  });

  describe("Header Discussion button", () => {
    test("renders Discussion button in header linking to branch GateOverflow forum", () => {
      const meQuestion = {
        question_uid: "pp:me:2020:q1",
        title: "GATE ME 2020 | Set 1 | Question: 1",
        track: "me",
      };
      render(<DetailedSolutionView solution={sampleSolution} question={meQuestion} isVisible={true} />);

      const discussionBtn = screen.getByRole("link", { name: /Discussion/i });
      expect(discussionBtn).toBeDefined();
      expect(discussionBtn.getAttribute("href")).toBe(
        "https://me.gateoverflow.in/?qa=search&q=GATE%20ME%202020%20Set%201%20Question%201"
      );
      expect(discussionBtn.getAttribute("target")).toBe("_blank");
    });

    test("renders Discussion button for EE questions with ee.gateoverflow.in", () => {
      const eeQuestion = {
        question_uid: "pp:ee:2019:q14",
        title: "GATE EE 2019 | Question: 14",
        track: "ee",
      };
      render(<DetailedSolutionView solution={sampleSolution} question={eeQuestion} isVisible={true} />);

      const discussionBtn = screen.getByRole("link", { name: /Discussion/i });
      expect(discussionBtn.getAttribute("href")).toBe(
        "https://ee.gateoverflow.in/?qa=search&q=GATE%20EE%202019%20Question%2014"
      );
    });

    test("uses direct solutionLink when provided", () => {
      const qWithDirect = {
        question_uid: "go:12345",
        title: "GATE CSE 2020 Question 5",
        track: "cse",
      };
      render(
        <DetailedSolutionView
          solution={sampleSolution}
          question={qWithDirect}
          solutionLink="https://gateoverflow.in/12345/gate-cse-2020-question-5"
          isVisible={true}
        />
      );
      const discussionBtn = screen.getByRole("link", { name: /Discussion/i });
      expect(discussionBtn.getAttribute("href")).toBe(
        "https://gateoverflow.in/12345/gate-cse-2020-question-5"
      );
    });
  });
});
