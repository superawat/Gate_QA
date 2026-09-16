/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("./AppHeader", () => ({
  default: () => <header data-testid="mock-header">Header</header>,
}));

vi.mock("./MobileBottomNav", () => ({
  default: () => <nav data-testid="mock-bottom-nav">BottomNav</nav>,
}));

vi.mock("../Footer/Footer", () => ({
  default: () => <footer data-testid="mock-footer">Footer</footer>,
}));

import PageShell from "./PageShell";

describe("PageShell", () => {
  test("renders header, footer, bottom nav, and children by default", () => {
    render(
      <PageShell>
        <div data-testid="test-content">Main Page Content</div>
      </PageShell>
    );

    expect(screen.getByTestId("mock-header")).toBeTruthy();
    expect(screen.getByTestId("test-content")).toBeTruthy();
    expect(screen.getByTestId("mock-bottom-nav")).toBeTruthy();
    expect(screen.getByTestId("mock-footer")).toBeTruthy();
  });

  test("hides header when showHeader is false", () => {
    render(
      <PageShell showHeader={false}>
        <div data-testid="test-content">Practice Window Content</div>
      </PageShell>
    );

    expect(screen.queryByTestId("mock-header")).toBeNull();
    expect(screen.getByTestId("test-content")).toBeTruthy();
    expect(screen.getByTestId("mock-footer")).toBeTruthy();
  });

  test("hides footer when showFooter is false", () => {
    render(
      <PageShell showFooter={false}>
        <div data-testid="test-content">No Footer Content</div>
      </PageShell>
    );

    expect(screen.getByTestId("mock-header")).toBeTruthy();
    expect(screen.getByTestId("test-content")).toBeTruthy();
    expect(screen.queryByTestId("mock-footer")).toBeNull();
  });

  test("hides both header and footer when both are set to false", () => {
    render(
      <PageShell showHeader={false} showFooter={false} showMobileBottomNav={false}>
        <div data-testid="test-content">Distraction-Free Practice Window</div>
      </PageShell>
    );

    expect(screen.queryByTestId("mock-header")).toBeNull();
    expect(screen.queryByTestId("mock-footer")).toBeNull();
    expect(screen.queryByTestId("mock-bottom-nav")).toBeNull();
    expect(screen.getByTestId("test-content")).toBeTruthy();
  });
});
