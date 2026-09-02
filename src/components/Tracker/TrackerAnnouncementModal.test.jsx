/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TrackerAnnouncementModal, { TRACKER_ANNOUNCEMENT_SEEN_KEY } from "./TrackerAnnouncementModal";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("TrackerAnnouncementModal", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockNavigate.mockClear();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <MemoryRouter>
        <TrackerAnnouncementModal isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal dialog, title, and features when isOpen is true", () => {
    render(
      <MemoryRouter>
        <TrackerAnnouncementModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText(/Preparation & Syllabus Tracker/i)).toBeTruthy();
    expect(screen.getByText(/Interactive Syllabus Tree/i)).toBeTruthy();
    expect(screen.getByText(/Zero-Friction PYQ Sync/i)).toBeTruthy();
    expect(screen.getByText(/4-Stage Progress Badges/i)).toBeTruthy();
    expect(screen.getByText(/Smart Recommendations & Exam Timer/i)).toBeTruthy();
  });

  it("handles dismiss action and marks announcement as seen in localStorage", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <TrackerAnnouncementModal isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );

    const maybeLaterBtn = screen.getByRole("button", { name: /maybe later/i });
    fireEvent.click(maybeLaterBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(TRACKER_ANNOUNCEMENT_SEEN_KEY)).toBe("true");
  });

  it("handles open tracker action: sets localStorage, closes modal, and navigates to /tracker", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <TrackerAnnouncementModal isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );

    const openBtn = screen.getByRole("button", { name: /open preparation tracker/i });
    fireEvent.click(openBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(TRACKER_ANNOUNCEMENT_SEEN_KEY)).toBe("true");
    expect(mockNavigate).toHaveBeenCalledWith("/tracker");
  });
});
