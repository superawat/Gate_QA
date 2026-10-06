import React, { useEffect, useId, useRef, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import {
  SUBJECT_PROGRESS_SORT_OPTIONS,
  getSubjectProgressSortMeta,
} from "../../utils/subjectProgressSortPreference";

/**
 * SubjectProgressSortControl
 * --------------------------
 * Compact sorting control for Subject Progress section in InsightsPage.
 * Allows sorting by Coverage (High to Low / Low to High) or Accuracy (High to Low / Low to High).
 */
export default function SubjectProgressSortControl({
  value = "coverage_desc",
  onChange,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const uid = useId();
  const buttonId = `subject-sort-btn-${uid}`;
  const menuId = `subject-sort-menu-${uid}`;

  const currentMeta = getSubjectProgressSortMeta(value);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = SUBJECT_PROGRESS_SORT_OPTIONS.findIndex((opt) => opt.id === value);
        setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % SUBJECT_PROGRESS_SORT_OPTIONS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? SUBJECT_PROGRESS_SORT_OPTIONS.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < SUBJECT_PROGRESS_SORT_OPTIONS.length) {
        const selected = SUBJECT_PROGRESS_SORT_OPTIONS[highlightedIndex];
        onChange?.(selected.id);
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleSelect = (optionId) => {
    onChange?.(optionId);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          const currentIndex = SUBJECT_PROGRESS_SORT_OPTIONS.findIndex((opt) => opt.id === value);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Sort subjects. Currently sorted by ${currentMeta.label}`}
        title={`Sort subjects: ${currentMeta.label}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)] transition shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <span className="text-[color:var(--color-text-muted)] opacity-85">Sort:</span>
        <span className="font-semibold text-[color:var(--color-text)] whitespace-nowrap">
          {currentMeta.shortLabel}
        </span>
        <FaChevronDown
          className={`text-[9px] text-[color:var(--color-text-muted)] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute right-0 top-full mt-1.5 z-40 min-w-[210px] sm:min-w-[220px] max-w-[calc(100vw-2rem)] rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-lg py-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider border-b border-[color:var(--color-border)]">
            Sort by
          </div>

          <div className="py-1">
            {SUBJECT_PROGRESS_SORT_OPTIONS.map((opt, index) => {
              const isSelected = opt.id === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.id)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold"
                      : isHighlighted
                      ? "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)]"
                      : "text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)]"
                  }`}
                >
                  <span className="w-3.5 flex items-center justify-center shrink-0">
                    {isSelected ? (
                      <FaCheck className="text-[11px] text-sky-500" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span className="flex-1 whitespace-nowrap">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
