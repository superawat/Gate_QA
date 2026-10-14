/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";

const navigateMock = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

import HomeMarquee from "./HomeMarquee";

describe("HomeMarquee", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders WHAT'S NEW label and platform announcement items", () => {
    render(<HomeMarquee />);

    expect(screen.getByText("WHAT'S NEW")).toBeTruthy();
    expect(screen.getAllByText(/New Branches:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Profile Hub:/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Open Profile and Disciplines" })).toBeTruthy();
    expect(screen.getAllByText("Profile").length).toBeGreaterThan(0);

    // Verify removed elements: 100% Solutions, ISRO CS, Explore all
    expect(screen.queryByText(/100% Solutions/i)).toBeNull();
    expect(screen.queryByText("ISRO CS")).toBeNull();
    expect(screen.queryByRole("button", { name: /Explore all/i })).toBeNull();
  });

  test("clicking an announcement chip navigates to profile route", () => {
    render(<HomeMarquee />);

    const branchChip = screen.getAllByRole("button", { name: /New Branches:/i })[0];
    fireEvent.click(branchChip);

    expect(navigateMock).toHaveBeenCalledWith("/profile");
  });

  test("clicking 'Profile' CTA navigates to /profile", () => {
    render(<HomeMarquee />);

    const cta = screen.getByRole("button", { name: "Open Profile and Disciplines" });
    fireEvent.click(cta);

    expect(navigateMock).toHaveBeenCalledWith("/profile");
  });

  test("touch interactions toggle the paused state for mobile accessibility", () => {
    const { container } = render(<HomeMarquee />);
    const strip = container.querySelector(".home-marquee-strip");
    expect(strip.classList.contains("home-marquee-strip--paused")).toBe(false);

    fireEvent.touchStart(strip);
    expect(strip.classList.contains("home-marquee-strip--paused")).toBe(true);

    fireEvent.touchEnd(strip);
    expect(strip.classList.contains("home-marquee-strip--paused")).toBe(false);
  });
});
