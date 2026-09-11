/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoadingState from "./LoadingState";

describe("LoadingState", () => {
  it("renders BrandLoader by default", () => {
    render(<LoadingState label="Preparing session..." />);
    const img = screen.getByRole("img");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toContain("gateqa_loader");
    expect(screen.getByText("Preparing session...")).toBeTruthy();
  });

  it("renders legacy HorizontalBarLoader when variant='legacy' is passed", () => {
    const { container } = render(
      <LoadingState label="Legacy fallback loading" variant="legacy" />
    );
    // Legacy renders an SVG bar, no img
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("Legacy fallback loading")).toBeTruthy();
  });

  it("supports inline layout mode", () => {
    const { container } = render(
      <LoadingState label="Inline state" layout="inline" size="sm" />
    );
    const root = container.firstChild;
    expect(root.className).toContain("items-center");
    expect(screen.getByText("Inline state")).toBeTruthy();
  });

  it("renders optional sublabel when provided", () => {
    render(
      <LoadingState label="Main title" sublabel="Detailed subtitle description" />
    );
    expect(screen.getByText("Main title")).toBeTruthy();
    expect(screen.getByText("Detailed subtitle description")).toBeTruthy();
  });

  it("sets proper ARIA role and attributes", () => {
    render(<LoadingState ariaLabel="Custom accessibility label" />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-label")).toBe("Custom accessibility label");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });
});
