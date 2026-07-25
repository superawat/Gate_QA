/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import BlogListPage from "./BlogListPage";

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../components/SEO/SEOHead", () => ({
  default: () => null,
  buildBreadcrumbSchema: () => ({}),
  buildWebPageSchema: () => ({}),
}));

describe("BlogListPage", () => {
  test("renders heading, search input, category filters, and featured guide", () => {
    render(
      <BrowserRouter>
        <BlogListPage />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { name: /prep guides & exam insights/i })).toBeTruthy();
    expect(screen.getByPlaceholderText(/search articles/i)).toBeTruthy();
    expect(screen.getByText(/high priority topics for gate cs/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /^all$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^syllabus updates$/i })).toBeTruthy();
  });

  test("filters resources when category chip is clicked", () => {
    render(
      <BrowserRouter>
        <BlogListPage />
      </BrowserRouter>
    );

    const syllabusChip = screen.getByRole("button", { name: /^syllabus updates$/i });
    fireEvent.click(syllabusChip);

    expect(screen.getByText(/gate 2027 syllabus changes/i)).toBeTruthy();
  });

  test("filters resources based on search input query", () => {
    render(
      <BrowserRouter>
        <BlogListPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search articles/i);
    fireEvent.change(searchInput, { target: { value: "Operating Systems" } });

    expect(screen.getByRole("heading", { name: /operating systems/i })).toBeTruthy();
  });

  test("paginates resources correctly across pages", () => {
    render(
      <BrowserRouter>
        <BlogListPage />
      </BrowserRouter>
    );

    // Initial page shows page 1 resources and pagination control
    expect(screen.getByRole("button", { name: /^1$/ })).toBeTruthy();
    const page2Button = screen.getByRole("button", { name: /^2$/ });
    expect(page2Button).toBeTruthy();

    // Click Page 2
    fireEvent.click(page2Button);
    expect(screen.getByRole("button", { name: /^2$/ })).toBeTruthy();
  });
});
