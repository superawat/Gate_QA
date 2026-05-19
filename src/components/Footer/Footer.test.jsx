/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Footer from "./Footer";

describe("Footer", () => {
  test("links to the user manual route from the footer", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /user manual/i }).getAttribute("href")).toBe("/manual");
    expect(screen.getByRole("button", { name: /open data policy/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /support gate qa/i })).toBeTruthy();
  });
});
