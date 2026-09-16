/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  THEME_STORAGE_KEY,
  THEME_CHANGE_EVENT,
  resolveInitialTheme,
  applyDocumentTheme,
  toggleTheme,
  useTheme,
} from "./theme";

describe("theme utility", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.restoreAllMocks();
  });

  test("resolveInitialTheme defaults to light or system theme", () => {
    const res = resolveInitialTheme();
    expect(["light", "dark"]).toContain(res.theme);
  });

  test("resolveInitialTheme respects stored valid theme", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(resolveInitialTheme().theme).toBe("dark");

    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(resolveInitialTheme().theme).toBe("light");
  });

  test("applyDocumentTheme sets data-theme attribute on documentElement", () => {
    applyDocumentTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    applyDocumentTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  test("toggleTheme toggles from dark to light and vice versa", () => {
    const next1 = toggleTheme("dark");
    expect(next1).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    const next2 = toggleTheme("light");
    expect(next2).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  test("useTheme hook responds to toggleTheme calls and events", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.isDarkMode).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    // Test custom event reaction
    act(() => {
      window.dispatchEvent(
        new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: "light" } })
      );
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.isDarkMode).toBe(false);
  });
});
