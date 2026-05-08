import React, { useEffect, useId, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

import { useFilterActions, useFilterState } from "../../contexts/FilterContext";

const DEFAULT_DEBOUNCE_MS = 300;

const QuestionSearchInput = ({
  label = "Search questions",
  placeholder = "Search by keyword, tag, or question text",
  className = "",
  inputClassName = "",
  helperText = "",
  compact = false,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  hideLabel = false,
  id: providedId,
  ariaKeyShortcuts,
}) => {
  const generatedId = useId();
  const inputId = providedId || `question-search-${generatedId}`;
  const helperId = helperText ? `${inputId}-hint` : undefined;
  const { filters } = useFilterState();
  const { updateFilters } = useFilterActions();
  const [draftValue, setDraftValue] = useState(filters.searchQuery || "");

  useEffect(() => {
    setDraftValue(filters.searchQuery || "");
  }, [filters.searchQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (draftValue !== filters.searchQuery) {
        updateFilters({ searchQuery: draftValue });
      }
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, draftValue, filters.searchQuery, updateFilters]);

  const hasValue = String(draftValue || "").trim() !== "";

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={inputId}
        className={hideLabel ? "sr-only" : "block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]"}
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[color:var(--color-text-muted)]">
          <FaSearch className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </span>

        <input
          id={inputId}
          type="search"
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-describedby={helperId}
          aria-keyshortcuts={ariaKeyShortcuts}
          className={`w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-10 pr-12 text-[color:var(--color-text)] shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 ${
            compact ? "min-h-[44px] py-2.5 text-sm" : "min-h-[48px] py-3 text-sm"
          } ${inputClassName}`}
        />

        {hasValue ? (
          <button
            type="button"
            onClick={() => {
              setDraftValue("");
              updateFilters({ searchQuery: "" });
            }}
            className="absolute inset-y-0 right-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-r-2xl text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Clear search text"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {helperText ? (
        <p id={helperId} className="text-xs leading-5 text-[color:var(--color-text-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default QuestionSearchInput;
