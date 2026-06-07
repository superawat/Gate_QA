/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  test("opens a global drawer with tools and manual, and allows opening support modal", async () => {
    render(
      <MemoryRouter initialEntries={["/practice?subjects=dbms&types=nat"]}>
        <AppHeader />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /open navigation/i }));

    const drawer = screen.getByRole("dialog", { name: /global navigation/i });
    const drawerScope = within(drawer);
    expect(drawer).toBeTruthy();
    expect(screen.getByText(/2 filters active/i)).toBeTruthy();
    expect(drawerScope.getByRole("link", { name: /^filters$/i }).getAttribute("href")).toBe("/practice?subjects=dbms&types=nat");

    // Expand Tools
    fireEvent.click(drawerScope.getByRole("button", { name: /export & import/i }));

    expect(drawerScope.getByRole("button", { name: /export pdf/i })).toBeTruthy();
    expect(drawerScope.getByRole("button", { name: /export csv/i })).toBeTruthy();
    expect(drawerScope.getByRole("button", { name: /export json/i })).toBeTruthy();
    expect(drawerScope.getByRole("button", { name: /import json/i })).toBeTruthy();
    expect(drawerScope.getByRole("link", { name: /priority topics/i }).getAttribute("href")).toBe("/insights/topics");
    expect(drawerScope.getByRole("link", { name: /full user manual/i })).toBeTruthy();

    // Verify support button and opening SupportModal
    const supportBtn = drawerScope.getByRole("button", { name: /support me/i });
    expect(supportBtn).toBeTruthy();
    fireEvent.click(supportBtn);

    const supportModal = screen.getByRole("dialog", { name: /support me/i });
    expect(supportModal).toBeTruthy();
    expect(within(supportModal).getByText(/Scan with your preferred payment app/i)).toBeTruthy();

    // Close the SupportModal
    fireEvent.click(within(supportModal).getByRole("button", { name: /close modal/i }));
    expect(screen.queryByRole("dialog", { name: /support me/i })).toBeNull();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /global navigation/i })).toBeNull();
    });
  });

  test("renders domain shift countdown and opens migration notice modal", async () => {
    const mockDate = new Date("2026-06-07T10:00:00Z");
    const originalDate = global.Date;
    
    // Mock Date implementation
    global.Date = class extends originalDate {
      constructor(...args) {
        if (args.length > 0) {
          return new originalDate(...args);
        }
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    };

    render(
      <MemoryRouter initialEntries={["/practice"]}>
        <AppHeader />
      </MemoryRouter>
    );

    const countdownBtn = screen.getByRole("button", {
      name: /open gateqa\.in migration notice/i,
    });
    expect(countdownBtn).toBeTruthy();

    fireEvent.click(countdownBtn);

    const modal = screen.getByRole("dialog", { name: /gateqa is moving to gateqa\.in/i });
    expect(modal).toBeTruthy();
    expect(within(modal).getByText(/Only our domain name is changing/i)).toBeTruthy();

    fireEvent.click(within(modal).getByRole("button", { name: /close domain migration notice/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /gateqa is moving to gateqa\.in/i })).toBeNull();
    });

    global.Date = originalDate;
  });
});
