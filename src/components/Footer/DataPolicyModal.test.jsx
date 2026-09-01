/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import DataPolicyModal from "./DataPolicyModal";

describe("DataPolicyModal", () => {
  test("renders nothing when isOpen is false", () => {
    const { container } = render(
      <DataPolicyModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders full policy details when isOpen is true", () => {
    const handleClose = vi.fn();
    render(<DataPolicyModal isOpen={true} onClose={handleClose} />);

    // Header
    expect(
      screen.getByRole("heading", { name: /Data Persistence & Privacy Policy/i })
    ).toBeTruthy();

    // Quick summary and modes
    expect(screen.getByText(/Local-First by Default, Cloud Sync When You Want It/i)).toBeTruthy();
    expect(screen.getByText(/Guest Mode \(Default\)/i)).toBeTruthy();
    expect(screen.getByText(/Google Cloud Sync \(Optional\)/i)).toBeTruthy();

    // Protection & architecture
    expect(screen.getByText(/Sign in with Google \(Recommended\)/i)).toBeTruthy();
    expect(screen.getByText(/Export JSON Workspace Backups/i)).toBeTruthy();
    expect(screen.getByText(/Zero Data Loss & Pre-Merge Snapshots/i)).toBeTruthy();
    expect(screen.getByText(/Zero Data Loss Architecture/i)).toBeTruthy();

    // Risk scenarios
    expect(screen.getByText(/When Guest Progress Is At Risk/i)).toBeTruthy();
    expect(screen.getByText(/Private \/ Incognito window/i)).toBeTruthy();

    // Close buttons
    const closeBtn = screen.getByRole("button", { name: /close modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const understoodBtn = screen.getByRole("button", { name: /Understood/i });
    fireEvent.click(understoodBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
