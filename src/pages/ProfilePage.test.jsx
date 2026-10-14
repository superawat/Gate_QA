/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProfilePage from "./ProfilePage";
import * as authContext from "../contexts/AuthContext";

// Mock PageShell and SEOHead
vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div data-testid="page-shell">{children}</div>,
}));

vi.mock("../components/SEO/SEOHead", () => ({
  default: ({ title, description }) => (
    <div data-testid="seo-head" data-title={title} data-description={description} />
  ),
}));

describe("ProfilePage", () => {
  test("renders SEO metadata and UserProfileHub in PageShell", () => {
    vi.spyOn(authContext, "useAuth").mockReturnValue({
      user: { email: "aspirant@gateqa.in" },
      isGuest: false,
    });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const seoHead = screen.getByTestId("seo-head");
    expect(seoHead.getAttribute("data-title")).toContain("Candidate Profile");

    const pageShell = screen.getByTestId("page-shell");
    expect(pageShell).toBeDefined();

    expect(screen.getByText("aspirant@gateqa.in")).toBeDefined();
    expect(screen.getAllByText(/Enrolled GATE Disciplines/i).length).toBeGreaterThan(0);
  });
});
