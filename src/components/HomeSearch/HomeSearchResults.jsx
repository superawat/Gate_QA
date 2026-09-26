import React from 'react';
import {
  FaBook,
  FaTag,
  FaCalendarAlt,
  FaListOl,
  FaHashtag,
  FaSearch,
  FaArrowRight,
  FaSpinner,
} from 'react-icons/fa';

const getResultIcon = (type) => {
  switch (type) {
    case 'subject':
      return <FaBook className="w-3.5 h-3.5" aria-hidden="true" />;
    case 'subtopic':
      return <FaTag className="w-3.5 h-3.5" aria-hidden="true" />;
    case 'year':
      return <FaCalendarAlt className="w-3.5 h-3.5" aria-hidden="true" />;
    case 'question-number':
      return <FaListOl className="w-3.5 h-3.5" aria-hidden="true" />;
    case 'keyword':
      return <FaHashtag className="w-3.5 h-3.5" aria-hidden="true" />;
    case 'free-text':
    default:
      return <FaSearch className="w-3.5 h-3.5" aria-hidden="true" />;
  }
};

const getBadgeStyle = (type) => {
  switch (type) {
    case 'subject':
      return 'home-search-badge--subject';
    case 'subtopic':
      return 'home-search-badge--subtopic';
    case 'year':
      return 'home-search-badge--year';
    case 'question-number':
      return 'home-search-badge--question';
    case 'keyword':
      return 'home-search-badge--keyword';
    case 'free-text':
    default:
      return 'home-search-badge--search';
  }
};

export const HomeSearchResults = ({
  results = [],
  activeIndex = -1,
  onSelect,
  query = '',
  isOpen = false,
  isLoading = false,
  error = null,
  dropdownRef,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      id="home-search-results"
      role="listbox"
      aria-label="Search suggestions"
      className="home-search-dropdown"
    >
      {isLoading && results.length === 0 && (
        <div className="home-search-status-row" role="status">
          <FaSpinner className="animate-spin text-slate-500 dark:text-slate-400 w-4 h-4" />
          <span className="text-sm text-[var(--color-text-muted)]">Loading suggestions...</span>
        </div>
      )}

      {error && results.length === 0 && (
        <div className="home-search-status-row text-red-500 text-sm">
          <span>Search index unavailable. Press Enter for full-text search.</span>
        </div>
      )}

      {!isLoading && !error && results.length === 0 && query.trim().length >= 2 && (
        <div className="home-search-empty-state">
          <span className="text-sm font-medium text-[var(--color-text)]">
            No matching topics found
          </span>
          <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Press Enter to search question text directly
          </span>
        </div>
      )}

      {results.map((result, index) => {
        const isActive = index === activeIndex;
        const badgeClass = getBadgeStyle(result.type);

        return (
          <button
            key={result.id}
            id={`home-search-option-${index}`}
            type="button"
            role="option"
            aria-selected={isActive}
            className={`home-search-item ${isActive ? 'home-search-item--active' : ''}`}
            onMouseDown={(e) => {
              // Prevent input blur before click registers
              e.preventDefault();
            }}
            onClick={() => onSelect(result)}
          >
            <span className={`home-search-item-icon ${badgeClass}`}>
              {getResultIcon(result.type)}
            </span>

            <div className="home-search-item-body">
              <span className="home-search-item-label">
                {result.label}
              </span>
              {result.subLabel && (
                <span className="home-search-item-sublabel">
                  {result.subLabel}
                </span>
              )}
            </div>

            <div className="home-search-item-meta">
              {typeof result.count === 'number' && (
                <span className="home-search-item-count">
                  {result.count} {result.count === 1 ? 'PYQ' : 'PYQs'}
                </span>
              )}
              <FaArrowRight
                className="home-search-item-arrow"
                aria-hidden="true"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default HomeSearchResults;
