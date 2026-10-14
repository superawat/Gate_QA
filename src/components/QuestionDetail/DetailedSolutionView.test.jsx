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

  test("renders nothing when solution is null or undefined", () => {
    const { container } = render(
      <DetailedSolutionView solution={null} isVisible={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders simplified detailed solution without over-engineered sections", () => {
    render(<DetailedSolutionView solution={sampleSolution} isVisible={true} />);

    // Assert simplified header and content
    expect(screen.getByText("Detailed Solution")).toBeDefined();
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

  test("toggles collapsible content when header is clicked", () => {
    render(<DetailedSolutionView solution={sampleSolution} isVisible={true} />);

    const headerBtn = screen.getByRole("button", { name: /Detailed Solution/i });
    expect(headerBtn.getAttribute("aria-expanded")).toBe("true");

    // Click to collapse
    fireEvent.click(headerBtn);
    expect(headerBtn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText(/characteristic equation/i)).toBeNull();

    // Click to expand
    fireEvent.click(headerBtn);
    expect(headerBtn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/characteristic equation/i)).toBeDefined();
  });
});
