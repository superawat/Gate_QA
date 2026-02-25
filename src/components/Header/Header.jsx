import React from "react";
import CalculatorButton from "../Calculator/CalculatorButton";

const Header = ({
  onOpenFilters,
  onToggleCalculator,
  isCalculatorOpen,
  calculatorButtonRef,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <a
            href={import.meta.env.BASE_URL}
            className="shrink-0 transition-opacity hover:opacity-80"
            aria-label="Go to home page"
          >
            <img
              src="logo.png"
              alt="GATE QA Logo"
              width="40"
              height="40"
              className="logo-icon h-8 w-8 object-contain sm:h-10 sm:w-10"
            />
          </a>

          <div className="min-w-0 text-left">
            <h1
              className="text-lg font-bold tracking-wide text-gray-900 sm:text-xl md:text-2xl"
              lang="en"
            >
              GRADUATE APTITUDE TEST IN ENGINEERING
            </h1>
            <h2
              className="mt-1 text-sm font-medium text-gray-700 sm:text-base md:text-lg"
              lang="hi"
              style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}
            >
              अभियांत्रिकी स्नातक अभिक्षमता परीक्षा
            </h2>
          </div>
        </div>

        {(onOpenFilters || onToggleCalculator) && (
          <div className="flex shrink-0 items-center gap-2">
            {onToggleCalculator && (
              <CalculatorButton
                ref={calculatorButtonRef}
                onClick={onToggleCalculator}
                isOpen={isCalculatorOpen}
              />
            )}

            {onOpenFilters && (
              <button
                onClick={onOpenFilters}
                className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-white shadow-sm transition-colors hover:bg-gray-700"
                aria-label="Open filters"
                title="Filters"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="sr-only">Filters</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
