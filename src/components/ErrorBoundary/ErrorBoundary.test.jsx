/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import ErrorBoundary from "./ErrorBoundary";

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("shows the fallback UI when a child throws", () => {
    const Broken = () => {
      throw new Error("boom");
    };

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy();
  });

  test("resets and re-renders children after Try Again", () => {
    let shouldThrow = true;

    const Flaky = () => {
      if (shouldThrow) {
        throw new Error("transient");
      }

      return <div>Recovered</div>;
    };

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("Recovered")).toBeTruthy();
  });
});
