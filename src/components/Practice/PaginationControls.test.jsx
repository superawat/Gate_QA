/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import PaginationControls from "./PaginationControls";

describe("PaginationControls", () => {
  test("does not render when totalPages <= 1", () => {
    const { container } = render(
      <PaginationControls currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders windowed page pills and handles page changes", () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls currentPage={5} totalPages={20} onPageChange={onPageChange} />
    );

    const activePageButton = screen.getByRole("button", { name: /Page 5/i });
    expect(activePageButton).toBeTruthy();
    expect(activePageButton.getAttribute("aria-current")).toBe("page");

    // Click next page pill
    fireEvent.click(screen.getByRole("button", { name: /Page 6/i }));
    expect(onPageChange).toHaveBeenCalledWith(6);

    // Click Next button
    fireEvent.click(screen.getByRole("button", { name: /Next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(6);

    // Click Previous button
    fireEvent.click(screen.getByRole("button", { name: /Previous page/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  test("handles jump-to-page input submission", () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls currentPage={1} totalPages={50} onPageChange={onPageChange} />
    );

    const input = screen.getByLabelText(/Go to page/i);
    fireEvent.change(input, { target: { value: "32" } });
    fireEvent.submit(input.closest("form"));

    expect(onPageChange).toHaveBeenCalledWith(32);
  });

  test("navigates to first and last pages via quick buttons", () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls currentPage={10} totalPages={50} onPageChange={onPageChange} />
    );

    fireEvent.click(screen.getByTitle("First page"));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTitle("Last page"));
    expect(onPageChange).toHaveBeenCalledWith(50);
  });
});
