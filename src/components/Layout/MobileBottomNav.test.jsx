/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../constants/featureFlags", () => ({
  MOCK_TEST_MODE_ENABLED: true,
}));

import MobileBottomNav from "./MobileBottomNav";

describe("MobileBottomNav", () => {
  test("renders the mobile route shortcuts including progress and mock", () => {
    render(
      <MemoryRouter initialEntries={["/practice"]}>
        <MobileBottomNav />
      </MemoryRouter>
    );

    expect(screen.getByRole("navigation", { name: /mobile navigation/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /home/i }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: /explore/i }).getAttribute("href")).toBe("/practice");
    expect(screen.getByRole("link", { name: /progress/i }).getAttribute("href")).toBe("/insights");
    expect(screen.getByRole("link", { name: /priority/i }).getAttribute("href")).toBe("/insights/topics");
  });
});
