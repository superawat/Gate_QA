import React from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaRegStar,
  FaCalculator,
  FaShareAlt,
} from "react-icons/fa";

/**
 * MobileSolveActionBar
 *
 * Dedicated mobile-only (md:hidden) sticky bottom navigation toolbar for the Solve page.
 * Replaces the generic bottom navigation with ergonomic, one-thumb question controls:
 * Previous, Bookmark, Calculator, Share, and Next.
 */
const MobileSolveActionBar = ({
  canGoPrevious = false,
  canGoNext = false,
  onPrevious,
  onNext,
  isBookmarked = false,
  onToggleBookmark,
  onToggleCalculator,
  isCalculatorOpen = false,
  onShare,
  navigationSummary = "",
}) => {
  return (
    <div
      className="gateqa-mobile-solve-bar fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-2 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
      role="toolbar"
      aria-label="Question solve controls"
    >
      {/* 1. Previous Question */}
      <button
        type="button"
        disabled={!canGoPrevious}
        onClick={onPrevious}
        aria-label="Previous question"
        title="Previous question"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>

      {/* 2. Bookmark Toggle */}
      <button
        type="button"
        onClick={onToggleBookmark}
        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
        aria-pressed={isBookmarked}
        title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
          isBookmarked
            ? "border-amber-400 bg-amber-50 text-amber-500 dark:border-amber-600/50 dark:bg-amber-950/40 dark:text-amber-400"
            : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)] hover:text-amber-500"
        }`}
      >
        {isBookmarked ? (
          <FaStar className="h-4 w-4 text-amber-500 dark:text-amber-400" />
        ) : (
          <FaRegStar className="h-4 w-4" />
        )}
      </button>

      {/* 3. Scientific Calculator */}
      <button
        type="button"
        onClick={onToggleCalculator}
        aria-label={isCalculatorOpen ? "Close calculator" : "Open GATE calculator"}
        aria-pressed={isCalculatorOpen}
        title="Scientific Calculator"
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
          isCalculatorOpen
            ? "border-sky-500 bg-sky-50 text-sky-600 dark:border-sky-600/50 dark:bg-sky-950/40 dark:text-sky-400"
            : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-muted)] hover:text-sky-600"
        }`}
      >
        <FaCalculator className="h-4 w-4" />
      </button>

      {/* 4. Native Share */}
      <button
        type="button"
        onClick={onShare}
        aria-label="Share question link"
        title="Share question link"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] shadow-sm transition active:scale-95 hover:bg-[color:var(--color-surface-muted)] hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <FaShareAlt className="h-4 w-4" />
      </button>

      {/* 5. Next Question / Primary Action */}
      <button
        type="button"
        disabled={!canGoNext}
        onClick={onNext}
        aria-label="Next question"
        title="Next question"
        className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <span className="truncate">Next</span>
        <FaChevronRight className="h-3.5 w-3.5 shrink-0" />
      </button>
    </div>
  );
};

export default React.memo(MobileSolveActionBar);
