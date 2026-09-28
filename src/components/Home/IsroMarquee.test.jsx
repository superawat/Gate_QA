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

const writeIsroEnabledMock = vi.fn();
vi.mock("../../utils/isroPreference", () => ({
  writeIsroEnabled: (val) => writeIsroEnabledMock(val),
}));

import IsroMarquee from "./IsroMarquee";

describe("IsroMarquee", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders ISRO CS label and years", () => {
    render(<IsroMarquee />);

    expect(screen.getByText("ISRO CS")).toBeTruthy();
    expect(screen.getByRole("button", { name: "ISRO CS 2007" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ISRO CS 2025" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Explore all/i })).toBeTruthy();
  });

  test("clicking a year chip enables ISRO mode and navigates to practice route with year query", () => {
    render(<IsroMarquee />);

    const chip2025 = screen.getByRole("button", { name: "ISRO CS 2025" });
    fireEvent.click(chip2025);

    expect(writeIsroEnabledMock).toHaveBeenCalledWith(true);
    expect(navigateMock).toHaveBeenCalledWith("/practice?years=isro%3A2025%3Aset-1");
  });

  test("clicking 'Explore all' enables ISRO mode and navigates to /practice with all ISRO year sets", () => {
    render(<IsroMarquee />);

    const cta = screen.getByRole("button", { name: /Explore all/i });
    fireEvent.click(cta);

    expect(writeIsroEnabledMock).toHaveBeenCalledWith(true);
    // Should navigate with all ISRO year set keys so only ISRO questions are shown.
    const call = navigateMock.mock.calls[0][0];
    expect(call).toContain("/practice?years=");
    expect(call).toContain("isro");
    expect(call).toContain("2007");
    expect(call).toContain("2025");
  });

  test("touch interactions toggle the paused state for mobile accessibility", () => {
    const { container } = render(<IsroMarquee />);
    const strip = container.querySelector(".isro-marquee-strip");
    expect(strip.classList.contains("isro-marquee-strip--paused")).toBe(false);

    fireEvent.touchStart(strip);
    expect(strip.classList.contains("isro-marquee-strip--paused")).toBe(true);

    fireEvent.touchEnd(strip);
    expect(strip.classList.contains("isro-marquee-strip--paused")).toBe(false);
  });
});
