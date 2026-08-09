/**
 * UserProfileMenu.test.jsx
 * ------------------------
 * Unit tests for the profile avatar dropdown, sync status badge,
 * and sign-out interaction.
 *
 * @vitest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import UserProfileMenu from "./UserProfileMenu";
import * as authContext from "../../contexts/AuthContext";

describe("UserProfileMenu", () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders avatar button with user initials when avatar_url is missing", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: {
        email: "student@gateqa.in",
        user_metadata: { full_name: "Himanshu Rawat" },
      },
      signOut: mockSignOut,
      isSyncing: false,
    });

    render(<UserProfileMenu />);
    const btn = screen.getByRole("button", { name: /Signed in as Himanshu Rawat/i });
    expect(btn).toBeDefined();
    expect(screen.getByText("HR")).toBeDefined();
  });

  test("opens dropdown on click and displays user email and cloud sync badge without crashing", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: {
        email: "rawathr01@gmail.com",
        user_metadata: { full_name: "Himanshu Rawat" },
      },
      signOut: mockSignOut,
      isSyncing: false,
    });

    render(<UserProfileMenu />);
    const btn = screen.getByRole("button", { name: /Signed in as Himanshu Rawat/i });

    // Open dropdown
    fireEvent.click(btn);

    expect(screen.getByText("Himanshu Rawat")).toBeDefined();
    expect(screen.getByText("rawathr01@gmail.com")).toBeDefined();
    expect(screen.getByText("Data Synced to Cloud")).toBeDefined();
    expect(screen.getByText("Notes, bookmarks & tests backed up")).toBeDefined();
    expect(screen.getByRole("menuitem", { name: /Sign out/i })).toBeDefined();
  });

  test("shows active syncing status when isSyncing is true", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: {
        email: "student@gateqa.in",
      },
      signOut: mockSignOut,
      isSyncing: true,
    });

    render(<UserProfileMenu />);
    const btn = screen.getByRole("button", { name: /Signed in as student/i });
    fireEvent.click(btn);

    expect(screen.getByText("Syncing to cloud...")).toBeDefined();
    expect(screen.getByText("Updating progress")).toBeDefined();
  });

  test("triggers signOut and closes dropdown when Sign out button is clicked", async () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: {
        email: "student@gateqa.in",
      },
      signOut: mockSignOut,
      isSyncing: false,
    });

    render(<UserProfileMenu />);
    fireEvent.click(screen.getByRole("button", { name: /Signed in as student/i }));

    const signoutBtn = screen.getByRole("menuitem", { name: /Sign out/i });
    await act(async () => {
      fireEvent.click(signoutBtn);
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
