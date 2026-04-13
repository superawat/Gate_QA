/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

import AppHeader from "./AppHeader";

function installMatchMediaStub({ prefersDark = false, standalone = false } = {}) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-color-scheme")
        ? prefersDark
        : query.includes("display-mode: standalone")
          ? standalone
          : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("AppHeader", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    installMatchMediaStub();
  });

  test("forces light theme and hides the dark-mode toggle on mock routes", async () => {
    window.localStorage.setItem("gate_qa_theme", "dark");

    render(
      <MemoryRouter initialEntries={["/mock"]}>
        <AppHeader />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    expect(screen.queryByRole("switch", { name: /switch to (dark|light) mode/i })).toBeNull();
  });

  test("toggles theme preference on non-mock routes", async () => {
    render(
      <MemoryRouter initialEntries={["/practice"]}>
        <AppHeader />
      </MemoryRouter>
    );

    const toggle = screen.getByRole("switch", { name: /switch to dark mode/i });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    expect(window.localStorage.getItem("gate_qa_theme")).toBe("dark");
    expect(screen.getByRole("switch", { name: /switch to light mode/i })).toBeTruthy();
    expect(screen.getByAltText(/gate qa logo/i).closest(".app-header-logo-frame")).toBeTruthy();
  });
});
