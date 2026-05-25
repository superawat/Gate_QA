/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Footer from "./Footer";

describe("Footer", () => {
  test("renders data policy and support actions", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /open data policy/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /support gate qa/i })).toBeTruthy();
  });
});
