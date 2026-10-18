/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import TrackerCountdownHero from "./TrackerCountdownHero";

describe("TrackerCountdownHero", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-18T12:00:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("returns null with zero DOM footprint when showCountdownWidget is false", () => {
    const { container } = render(
      <TrackerCountdownHero
        activeTrack="da"
        preferences={{ showCountdownWidget: false, countdownDisplayMode: "hidden" }}
        onUpdatePreferences={vi.fn()}
        syllabusDonePercentage={25}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("returns null when countdownDisplayMode is 'hidden'", () => {
    const { container } = render(
      <TrackerCountdownHero
        activeTrack="da"
        preferences={{ showCountdownWidget: true, countdownDisplayMode: "hidden" }}
        onUpdatePreferences={vi.fn()}
        syllabusDonePercentage={25}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders the compact countdown hero with tabular-nums and track info when active", () => {
    render(
      <TrackerCountdownHero
        activeTrack="da"
        preferences={{ showCountdownWidget: true, countdownDisplayMode: "hero" }}
        onUpdatePreferences={vi.fn()}
        syllabusDonePercentage={42}
      />
    );

    expect(screen.getByRole("region", { name: /exam countdown/i })).toBeTruthy();
    expect(screen.getByText(/gate da target exam/i)).toBeTruthy();
    expect(screen.getByText(/syllabus covered/i)).toBeTruthy();
    expect(screen.getByText("42%")).toBeTruthy();

    // Verify time unit labels
    expect(screen.getByText(/^days$/i)).toBeTruthy();
    expect(screen.getByText(/^hours$/i)).toBeTruthy();
    expect(screen.getByText(/^minutes$/i)).toBeTruthy();
    expect(screen.getByText(/^seconds$/i)).toBeTruthy();
  });

  it("triggers onUpdatePreferences with hidden settings when dismiss button is clicked", () => {
    const onUpdateMock = vi.fn();
    render(
      <TrackerCountdownHero
        activeTrack="cse"
        preferences={{ showCountdownWidget: true, countdownDisplayMode: "hero" }}
        onUpdatePreferences={onUpdateMock}
        syllabusDonePercentage={10}
      />
    );

    const closeBtn = screen.getByTitle(/hide countdown widget/i);
    fireEvent.click(closeBtn);

    expect(onUpdateMock).toHaveBeenCalledWith({
      showCountdownWidget: false,
      countdownDisplayMode: "hidden",
    });
  });

  it("opens date editor and applies target exam date", () => {
    const onUpdateMock = vi.fn();
    render(
      <TrackerCountdownHero
        activeTrack="cse"
        preferences={{ showCountdownWidget: true, countdownDisplayMode: "hero" }}
        onUpdatePreferences={onUpdateMock}
        syllabusDonePercentage={10}
      />
    );

    const changeDateBtn = screen.getByTitle(/configure target exam date/i);
    fireEvent.click(changeDateBtn);

    expect(screen.getByLabelText(/target date:/i)).toBeTruthy();

    // Click quick preset for GATE 2027
    const presetBtn = screen.getByRole("button", { name: /gate 2027/i });
    fireEvent.click(presetBtn);

    // Apply the change
    const applyBtn = screen.getByRole("button", { name: /apply/i });
    fireEvent.click(applyBtn);

    expect(onUpdateMock).toHaveBeenCalledWith({
      examDateCse: "2027-02-06",
    });
  });
});
