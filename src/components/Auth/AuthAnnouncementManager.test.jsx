/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AuthAnnouncementManager from "./AuthAnnouncementManager";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock("../../services/supabase", () => ({
  supabase: {},
}));

describe("AuthAnnouncementManager", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("shows the DA announcement once and persists its dismissal across mounts", async () => {
    const { unmount } = render(<AuthAnnouncementManager />);

    expect(await screen.findByRole("heading", { name: /GATE DA questions are here/i })).toBeTruthy();
    expect(window.localStorage.getItem("gateqa_da_questions_announcement_seen_v1")).toBe("1");
    expect(screen.queryByRole("heading", { name: /Sign in is now available/i })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign in with Google" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close announcement" }));
    expect(screen.queryByRole("heading", { name: /GATE DA questions are here/i })).toBeNull();

    unmount();
    render(<AuthAnnouncementManager />);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /GATE DA questions are here/i })).toBeNull();
    });
  });

  test("allows the sign-in announcement only after the DA notice was seen", async () => {
    window.localStorage.setItem("gateqa_da_questions_announcement_seen_v1", "1");

    render(<AuthAnnouncementManager />);

    expect(await screen.findByRole("heading", { name: /Sign in is now available/i })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /GATE DA questions are here/i })).toBeNull();
  });
});
