/**
 * AuthContext.test.jsx
 * --------------------
 * Unit tests for AuthProvider, guest mode fallback,
 * Google OAuth trigger, sign-out safety, and sync scheduler.
 *
 * @vitest-environment jsdom
 */

import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import * as supabaseService from "../services/supabase";
import * as cloudSyncManager from "../utils/cloudSyncManager";

function TestConsumer() {
  const { user, session, loading, isSyncing, signInWithGoogle, signOut } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.email : "guest"}</div>
      <div data-testid="session">{session ? "has-session" : "no-session"}</div>
      <div data-testid="isSyncing">{String(isSyncing)}</div>
      <button onClick={signInWithGoogle}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("falls back immediately to Guest Mode if Supabase client is missing", async () => {
    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("guest");
    expect(screen.getByTestId("session").textContent).toBe("no-session");
  });

  test("initializes existing active session and triggers sync on mount", async () => {
    const mockUser = { id: "user-123", email: "student@gateqa.in" };
    const mockSession = { user: mockUser, access_token: "fake-jwt" };

    const mockUnsubscribe = vi.fn();
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: mockSession },
    });
    const mockOnAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const mockSyncUserData = vi.spyOn(cloudSyncManager, "syncUserData").mockResolvedValue({
      success: true,
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("user").textContent).toBe("student@gateqa.in");
    expect(screen.getByTestId("session").textContent).toBe("has-session");
    expect(mockSyncUserData).toHaveBeenCalledWith("user-123");
  });

  test("does not schedule repeated syncs during the cooldown window", async () => {
    vi.useFakeTimers();
    const mockUser = { id: "user-123", email: "student@gateqa.in" };
    const mockSession = { user: mockUser, access_token: "fake-jwt" };
    const mockSyncUserData = vi.spyOn(cloudSyncManager, "syncUserData")
      .mockResolvedValue({ success: true });
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: mockSession },
    });
    const mockOnAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    await waitFor(() => expect(mockSyncUserData).toHaveBeenCalledTimes(1));

    window.dispatchEvent(new CustomEvent("gateqa:sync-request"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });

    expect(mockSyncUserData).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  test("calls signInWithOAuth on signInWithGoogle", async () => {
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });
    const mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });
    const mockOnAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signInWithOAuth: mockSignInWithOAuth,
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByText("Sign In").click();
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "google",
      })
    );
  });

  test("calls signOut without erasing local guest data", async () => {
    localStorage.setItem("gate_qa_solved_questions", JSON.stringify({ "go:1": true }));
    vi.spyOn(cloudSyncManager, "syncUserData").mockResolvedValue({ success: true });
    const mockSignOut = vi.fn().mockResolvedValue({ error: null });
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: { user: { id: "u-1" } } },
    });
    const mockOnAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    vi.spyOn(supabaseService, "supabase", "get").mockReturnValue({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signOut: mockSignOut,
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByText("Sign Out").click();
    });

    expect(mockSignOut).toHaveBeenCalled();
    // Verify local storage is preserved!
    expect(localStorage.getItem("gate_qa_solved_questions")).not.toBeNull();
  });
});
