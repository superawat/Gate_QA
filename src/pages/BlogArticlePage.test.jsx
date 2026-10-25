/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import BlogArticlePage from "./BlogArticlePage";

vi.mock("../components/SEO/SEOHead", () => ({
  default: () => null,
  buildBreadcrumbSchema: () => ({}),
  buildWebPageSchema: () => ({}),
}));

describe("BlogArticlePage", () => {
  test("renders valid article by slug", () => {
    render(
      <MemoryRouter initialEntries={["/blog/gate-cse-2027-syllabus-changes"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: /GATE CS 2027 Syllabus Revision/i })).toBeTruthy();
    expect(screen.getByText(/Back to all articles/i)).toBeTruthy();
  });

  test("renders 404 fallback with browse button when slug does not exist", () => {
    render(
      <MemoryRouter initialEntries={["/blog/unknown-post-xyz"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: /Article not found/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Browse all articles/i })).toBeTruthy();
  });
});
