import React, { useState } from "react";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const getVisiblePageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const PaginationControls = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const [jumpPage, setJumpPage] = useState("");

  if (totalPages <= 1) {
    return null;
  }

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpPage("");
    }
  };

  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Question list pagination"
      className="practice-pagination flex flex-col gap-4 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-[color:var(--color-text-muted)]">
          Page <span className="font-semibold text-[color:var(--color-text)]">{currentPage}</span> of{" "}
          <span className="font-semibold text-[color:var(--color-text)]">{totalPages}</span>
        </p>

        {/* Jump-to-page input */}
        <form onSubmit={handleJumpSubmit} className="hidden sm:flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)]">
          <label htmlFor="jump-page-input" className="sr-only">Go to page</label>
          <span>Go to</span>
          <input
            id="jump-page-input"
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            className="w-14 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2 py-1 text-center text-xs font-medium text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="No."
          />
          <button
            type="submit"
            disabled={!jumpPage}
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Go
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:justify-end">
        {/* First Page button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
          title="First page"
          className="hidden sm:inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaAngleDoubleLeft className="text-xs" />
        </button>

        {/* Previous button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaChevronLeft className="text-xs" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Windowed Page Number Pills */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex min-h-[38px] min-w-[28px] items-center justify-center text-xs font-bold text-[color:var(--color-text-muted)]"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                aria-current={isActive ? "page" : undefined}
                aria-label={`Page ${page}`}
                onClick={() => onPageChange(page)}
                className={`inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-[color:var(--color-primary)] text-white shadow-sm"
                    : "border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)]"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden xs:inline">Next</span>
          <FaChevronRight className="text-xs" />
        </button>

        {/* Last Page button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
          title="Last page"
          className="hidden sm:inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaAngleDoubleRight className="text-xs" />
        </button>
      </div>
    </nav>
  );
};

export default React.memo(PaginationControls);
