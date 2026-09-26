import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useInRouterContext } from 'react-router-dom';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { useHomeSearchCatalog } from './useHomeSearchCatalog';
import { classifyAndMatch } from './homeSearchMatcher';
import { HomeSearchResults } from './HomeSearchResults';

const HomeSearchBarCore = ({
  onNavigateToExplore,
  placeholder = 'Search topics, subjects, questions...',
  className = '',
  routerNavigate = null,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const { catalog, isLoading, error, loadCatalog } = useHomeSearchCatalog();

  // Debounce input updates (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Compute matched results whenever debounced query or catalog changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    if (catalog) {
      const matches = classifyAndMatch(trimmed, catalog);
      setResults(matches);
      setActiveIndex(-1);
    } else {
      // Catalog not yet loaded; provide instant free-text fallback
      setResults([
        {
          id: `freetext-${trimmed.toLowerCase()}`,
          type: 'free-text',
          label: `Search all questions for "${trimmed}"`,
          subLabel: 'Full-text search',
          count: null,
          searchParam: trimmed,
        },
      ]);
      setActiveIndex(-1);
    }
  }, [debouncedQuery, catalog]);

  // Preload catalog on user hover or focus
  const handleInteractionPreload = useCallback(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const handleSelectResult = useCallback(
    (result) => {
      setIsOpen(false);
      setActiveIndex(-1);

      const params = new URLSearchParams();

      if (result.subjectFilter) {
        params.set('subjects', result.subjectFilter);
      }
      if (result.subtopicFilter) {
        params.set('subtopics', result.subtopicFilter);
      }
      if (result.yearSetKeys && result.yearSetKeys.length > 0) {
        params.set('years', result.yearSetKeys.join(','));
      }
      if (result.searchParam) {
        params.set('search', result.searchParam);
      }

      const searchStr = params.toString() ? `?${params.toString()}` : '';

      if (typeof onNavigateToExplore === 'function') {
        onNavigateToExplore(searchStr);
      } else if (routerNavigate) {
        routerNavigate({
          pathname: '/practice',
          search: searchStr,
        });
      }
    },
    [routerNavigate, onNavigateToExplore]
  );

  // Keyboard navigation & Shortcuts
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && query.trim().length >= 2) {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelectResult(results[activeIndex]);
      } else if (query.trim().length > 0) {
        // Direct free-text search on Enter
        handleSelectResult({
          id: `freetext-${query.trim().toLowerCase()}`,
          type: 'free-text',
          label: `Search all questions for "${query.trim()}"`,
          searchParam: query.trim(),
        });
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Global keyboard shortcut: press '/' or 'Ctrl+K' to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        void loadCatalog();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [loadCatalog]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`home-search-wrap ${className}`.trim()}
      onPointerEnter={handleInteractionPreload}
    >
      <div className="home-search-input-box">
        <FaSearch
          className="home-search-lens-icon"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen && results.length > 0}
          aria-autocomplete="list"
          aria-controls="home-search-results"
          aria-activedescendant={
            activeIndex >= 0 ? `home-search-option-${activeIndex}` : undefined
          }
          className="home-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            handleInteractionPreload();
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {isLoading && (
          <span className="home-search-spinner" aria-hidden="true">
            <FaSpinner className="animate-spin text-slate-500 dark:text-slate-400 w-3.5 h-3.5" />
          </span>
        )}

        {query && (
          <button
            type="button"
            className="home-search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <FaTimes className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}

        <kbd className="home-search-shortcut-hint" aria-hidden="true">
          /
        </kbd>
      </div>

      <HomeSearchResults
        results={results}
        activeIndex={activeIndex}
        onSelect={handleSelectResult}
        query={query}
        isOpen={isOpen && (results.length > 0 || query.trim().length >= 2 || isLoading)}
        isLoading={isLoading}
        error={error}
        dropdownRef={dropdownRef}
      />
    </div>
  );
};

const HomeSearchBarWithRouter = (props) => {
  const navigate = useNavigate();
  return <HomeSearchBarCore {...props} routerNavigate={navigate} />;
};

export const HomeSearchBar = (props) => {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return <HomeSearchBarWithRouter {...props} />;
  }
  return <HomeSearchBarCore {...props} routerNavigate={null} />;
};

export default HomeSearchBar;
