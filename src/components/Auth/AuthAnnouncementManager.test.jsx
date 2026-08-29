/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, beforeEach, test, expect } from "vitest";
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

  test("renders null and never shows unprompted announcement or signup popups", () => {
    const { container } = render(<AuthAnnouncementManager />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("heading", { name: /GATE DA questions are here/i })).toBeNull();
    expect(screen.queryByRole("heading", { name: /Sign in is now available/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Sign in with Google/i })).toBeNull();
  });

  test("remains dormant even if localStorage tokens are unset or set", () => {
    window.localStorage.setItem("gateqa_da_questions_announcement_seen_v1", "1");
    window.localStorage.setItem("gateqa_auth_announcement_seen_v1", "1");

    const { container } = render(<AuthAnnouncementManager />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
