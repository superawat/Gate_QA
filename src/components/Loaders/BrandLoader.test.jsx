/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import BrandLoader from "./BrandLoader";

describe("BrandLoader", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders with default dark theme when no theme attribute is present", () => {
    render(<BrandLoader alt="Loading content" />);
    const img = screen.getByRole("img");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("/images/loaders/gateqa_loader_dark.webp");
    expect(img.getAttribute("alt")).toBe("Loading content");
  });

  it("renders light theme loader when data-theme is 'light'", () => {
    document.documentElement.setAttribute("data-theme", "light");
    render(<BrandLoader />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("/images/loaders/gateqa_loader_light.webp");
  });

  it("honors explicit theme prop override", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    render(<BrandLoader theme="light" />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("/images/loaders/gateqa_loader_light.webp");
  });

  it("applies responsive size classes correctly", () => {
    const { rerender } = render(<BrandLoader size="sm" />);
    let img = screen.getByRole("img");
    expect(img.className).toContain("w-9");

    rerender(<BrandLoader size="lg" />);
    img = screen.getByRole("img");
    expect(img.className).toContain("w-16");
  });

  it("reacts dynamically to data-theme attribute mutations", async () => {
    document.documentElement.setAttribute("data-theme", "dark");
    render(<BrandLoader />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("/images/loaders/gateqa_loader_dark.webp");

    await act(async () => {
      document.documentElement.setAttribute("data-theme", "light");
      // Allow MutationObserver callback to fire
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(img.getAttribute("src")).toBe("/images/loaders/gateqa_loader_light.webp");
  });
});
