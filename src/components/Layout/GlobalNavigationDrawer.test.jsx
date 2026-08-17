/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import GlobalNavigationDrawer from "./GlobalNavigationDrawer";
import { EDITORIAL_PAGES } from "../../data/editorialPages";
import { BLOG_ROUTE } from "../../utils/routes";

describe("GlobalNavigationDrawer", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    practiceBadgeLabel: "CSE • 2025",
    onSaveWorkspace: vi.fn(),
    onOpenWorkspace: vi.fn(),
    onExportCsv: vi.fn(),
    onPrint: vi.fn(),
    statusMessage: "Ready",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders drawer header, practice badge, and resource links", () => {
    render(
      <MemoryRouter>
        <GlobalNavigationDrawer {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("GATE QA")).toBeTruthy();
    expect(screen.getByText("CSE • 2025")).toBeTruthy();
    expect(screen.getByRole("link", { name: /high priority topics/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /articles & guides/i })).toBeTruthy();
  });

  test("renders study guides accordion toggle with correct count and collapsed by default", () => {
    render(
      <MemoryRouter>
        <GlobalNavigationDrawer {...defaultProps} />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole("button", {
      name: new RegExp(`Guides & Articles \\(${EDITORIAL_PAGES.length}\\)`, "i"),
    });
    expect(toggleButton).toBeTruthy();
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false");

    // Collapsed: editorial links should not be present
    expect(screen.queryByRole("link", { name: /^GATE 2027 Syllabus Changes$/i })).toBeNull();
  });

  test("expands study guides accordion and renders all valid editorial links with proper paths", () => {
    render(
      <MemoryRouter>
        <GlobalNavigationDrawer {...defaultProps} />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole("button", {
      name: new RegExp(`Guides & Articles \\(${EDITORIAL_PAGES.length}\\)`, "i"),
    });

    // Expand accordion
    fireEvent.click(toggleButton);
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true");

    // Check all editorial pages are rendered with non-empty labels and correct paths
    EDITORIAL_PAGES.forEach((page) => {
      const label = page.keyword || page.title || page.h1 || page.path;
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const link = screen.getByRole("link", { name: new RegExp(`^${escaped}$`, "i") });
      expect(link).toBeTruthy();
      expect(link.getAttribute("href")).toBe(page.path);
      // Verify NONE of the links point to /study-guide/undefined
      expect(link.getAttribute("href")).not.toContain("undefined");
      expect(link.getAttribute("href")).not.toContain("/study-guide/");
    });

    // Verify "View All Articles & Guides" link points to BLOG_ROUTE
    const viewAllLink = screen.getByRole("link", { name: /view all articles & guides/i });
    expect(viewAllLink).toBeTruthy();
    expect(viewAllLink.getAttribute("href")).toBe(BLOG_ROUTE);
  });

  test("clicking an editorial guide link calls onClose", () => {
    const onCloseMock = vi.fn();
    render(
      <MemoryRouter>
        <GlobalNavigationDrawer {...defaultProps} onClose={onCloseMock} />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole("button", {
      name: new RegExp(`Guides & Articles \\(${EDITORIAL_PAGES.length}\\)`, "i"),
    });
    fireEvent.click(toggleButton);

    const firstPage = EDITORIAL_PAGES[0];
    const label = firstPage.keyword || firstPage.title || firstPage.h1 || firstPage.path;
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const firstLink = screen.getByRole("link", { name: new RegExp(`^${escaped}$`, "i") });
    fireEvent.click(firstLink);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("closing button dismisses the drawer", () => {
    const onCloseMock = vi.fn();
    render(
      <MemoryRouter>
        <GlobalNavigationDrawer {...defaultProps} onClose={onCloseMock} />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole("button", { name: /close navigation/i });
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
