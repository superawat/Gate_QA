/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("../components/Layout/PageShell", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

import UserManualPage from "./UserManualPage";

describe("UserManualPage", () => {
  test("explains the major learner workflows and links to core routes", async () => {
    render(
      <MemoryRouter>
        <UserManualPage />
      </MemoryRouter>
    );

    expect(screen.getByText("User Manual")).toBeTruthy();
    expect(screen.getByText("Practice and filters")).toBeTruthy();
    expect(screen.getByText("Solving questions")).toBeTruthy();
    expect(screen.getByText("Mock tests")).toBeTruthy();
    expect(screen.getByText("Your data")).toBeTruthy();

    expect(screen.getByRole("link", { name: /open practice/i }).getAttribute("href")).toBe("/practice");
    expect(screen.getByRole("link", { name: /view insights/i }).getAttribute("href")).toBe("/insights");
    expect(screen.getByRole("link", { name: /start mock/i }).getAttribute("href")).toBe("/mock?stage=setup");

    const practiceButton = screen.getByRole("button", { name: /practice and filters/i });
    fireEvent.click(practiceButton);

    expect(practiceButton.getAttribute("aria-pressed")).toBe("true");
    expect(await screen.findByText(/each selected filter narrows the list further/i)).toBeTruthy();
  });
});
