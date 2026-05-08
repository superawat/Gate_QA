import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import PageShell from "../components/Layout/PageShell";
import FilterModal from "../components/Filters/FilterModal";
import FilterSidebar from "../components/Filters/FilterSidebar";
import ActiveFilterChips from "../components/Filters/ActiveFilterChips";
import QuestionSearchInput from "../components/Filters/QuestionSearchInput";
import LoadingState from "../components/Loaders/LoadingState";
import QuestionPickerList from "../components/Practice/QuestionPickerList";
import PaginationControls from "../components/Practice/PaginationControls";
import { useFilterActions, useFilterState } from "../contexts/FilterContext";
import { useSession } from "../contexts/SessionContext";
import { trackEvent } from "../utils/analytics";
import { getShortcutKey, shouldIgnorePlainShortcut } from "../utils/keyboardShortcuts";
import { writeLastSession } from "../utils/lastSession";
import { buildSolvePath, parsePageParam, PRACTICE_ROUTE, writePageParam } from "../utils/routes";

const PAGE_SIZE = 25;

const ExplorePage = ({
  loading,
  error,
  loadQuestions,
  hasResumeRoute,
  onResumePractice,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const filterChangeRef = useRef(null);
  const pullStartRef = useRef(null);
  const pullActiveRef = useRef(false);

  const { filteredQuestions, filters, isInitialized, structuredTags, totalQuestions } = useFilterState();
  const { isQuestionSolved, isQuestionBookmarked } = useFilterActions();
  const { startOrderedSession } = useSession();

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const requestedPage = parsePageParam(location.search, 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedQuestions = filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE);

  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const prevPageRef = useRef(currentPage);
  const transitionTimerRef = useRef(null);

  useEffect(() => {
    if (prevPageRef.current !== currentPage && isInitialized && filteredQuestions.length > 0) {
      setIsPageTransitioning(true);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => setIsPageTransitioning(false), 350);
    }
    prevPageRef.current = currentPage;
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [currentPage, filteredQuestions.length, isInitialized]);

  useEffect(() => {
    if (requestedPage !== currentPage) {
      navigate(
        {
          pathname: PRACTICE_ROUTE,
          search: writePageParam(location.search, currentPage),
        },
        { replace: true }
      );
    }
  }, [currentPage, location.search, navigate, requestedPage]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const nextSnapshot = JSON.stringify(filters);
    if (filterChangeRef.current === null) {
      filterChangeRef.current = nextSnapshot;
      return;
    }

    if (filterChangeRef.current === nextSnapshot) {
      return;
    }

    filterChangeRef.current = nextSnapshot;
    trackEvent("filter_apply", { source: "explore" });

    const nextSearch = writePageParam(location.search, 1);
    if (nextSearch !== location.search) {
      navigate(
        {
          pathname: PRACTICE_ROUTE,
          search: nextSearch,
        },
        { replace: true }
      );
    }
  }, [filters, isInitialized, location.search, navigate]);

  useEffect(() => {
    writeLastSession({
      route: `${PRACTICE_ROUTE}${location.search}`,
      exploreSearch: location.search || "",
      resultPage: currentPage,
      mode: "ordered",
    });
  }, [currentPage, location.search]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const isInteractiveTarget = (target) => (
      target instanceof Element && Boolean(target.closest("button, a, input, textarea, select, label"))
    );

    const handleTouchStart = (event) => {
      if (window.innerWidth >= 768 || isMobileFilterOpen || isPullRefreshing || window.scrollY > 0) {
        pullActiveRef.current = false;
        pullStartRef.current = null;
        return;
      }

      if (isInteractiveTarget(event.target)) {
        pullActiveRef.current = false;
        pullStartRef.current = null;
        return;
      }

      const touch = event.touches?.[0];
      if (!touch) {
        return;
      }

      pullStartRef.current = touch.clientY;
      pullActiveRef.current = true;
    };

    const handleTouchMove = (event) => {
      if (!pullActiveRef.current || pullStartRef.current == null || window.scrollY > 0) {
        return;
      }

      const touch = event.touches?.[0];
      if (!touch) {
        return;
      }

      const nextDistance = Math.max(0, touch.clientY - pullStartRef.current);
      setPullDistance(Math.min(nextDistance, 96));
    };

    const handleTouchEnd = () => {
      const shouldRefresh = pullActiveRef.current && pullDistance >= 72 && !isPullRefreshing;
      pullActiveRef.current = false;
      pullStartRef.current = null;
      setPullDistance(0);

      if (!shouldRefresh) {
        return;
      }

      setIsPullRefreshing(true);
      trackEvent("pull_to_refresh", { source: "explore" });
      window.setTimeout(() => {
        window.location.reload();
      }, 240);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobileFilterOpen, isPullRefreshing, pullDistance]);

  const handleOpenFilters = useCallback(() => {
    trackEvent("filter_open", { source: "explore" });
    setIsMobileFilterOpen(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (shouldIgnorePlainShortcut(event)) {
        return;
      }

      const shortcutKey = getShortcutKey(event);
      if (shortcutKey === "/") {
        event.preventDefault();
        document.getElementById("explore-search")?.focus();
        return;
      }

      if (shortcutKey === "f") {
        event.preventDefault();
        handleOpenFilters();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenFilters]);

  const handleOpenQuestion = (question) => {
    startOrderedSession(filteredQuestions, question.question_uid);
    trackEvent("result_open", { question_uid: question.question_uid, source: "explore" });
    writeLastSession({
      route: `${buildSolvePath(question.question_uid)}${location.search || ""}`,
      exploreSearch: location.search || "",
      resultPage: currentPage,
      questionUid: question.question_uid,
      mode: "ordered",
    });
    navigate({
      pathname: buildSolvePath(question.question_uid),
      search: location.search,
    });
  };

  const resultSummary = useMemo(() => {
    if (!isInitialized) {
      return "Preparing question bank...";
    }
    if (filteredQuestions.length === 0) {
      return "No questions match the current filters.";
    }
    const rangeStart = startIndex + 1;
    const rangeEnd = Math.min(startIndex + PAGE_SIZE, filteredQuestions.length);
    return `Showing ${rangeStart}-${rangeEnd} of ${filteredQuestions.length} · ${totalQuestions} total questions`;
  }, [filteredQuestions.length, isInitialized, startIndex, totalQuestions]);

  const activeFilterCount = useMemo(() => {
    const selectedTypes = Array.isArray(filters.selectedTypes) ? filters.selectedTypes : [];
    const hasSearchQuery = String(filters.searchQuery || "").trim() !== "";
    const hasYearRange = Array.isArray(filters.yearRange)
      && filters.yearRange.length === 2
      && (
        Number(filters.yearRange[0]) !== Number(structuredTags?.minYear)
        || Number(filters.yearRange[1]) !== Number(structuredTags?.maxYear)
      );
    const hasProgressFilter = Boolean(
      filters.hideSolved
      || filters.showOnlySolved
      || filters.showOnlyBookmarked
    );

    return [
      filters.selectedYearSets.length > 0,
      filters.selectedSubjects.length > 0,
      filters.selectedSubtopics.length > 0,
      selectedTypes.length > 0 && selectedTypes.length < 3,
      hasYearRange,
      hasProgressFilter,
      hasSearchQuery,
    ].filter(Boolean).length;
  }, [
    filters.hideSolved,
    filters.searchQuery,
    filters.selectedSubtopics.length,
    filters.selectedSubjects.length,
    filters.selectedTypes,
    filters.selectedYearSets.length,
    filters.showOnlyBookmarked,
    filters.showOnlySolved,
    filters.yearRange,
    structuredTags?.maxYear,
    structuredTags?.minYear,
  ]);

  return (
    <PageShell onResume={hasResumeRoute ? onResumePractice : null} resumeLabel="Continue">
      <FilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="hidden xl:block">
          <div className="sticky top-24 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] shadow-[var(--shadow-card)]">
            <FilterSidebar className="h-[calc(100vh-8rem)] border-r-0 bg-[color:var(--color-surface)]" />
          </div>
        </div>

        <section className="space-y-5">
          {(pullDistance > 0 || isPullRefreshing) ? (
            <div className="sticky top-20 z-20 -mb-2 flex justify-center md:hidden">
              <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 shadow-[var(--shadow-soft)]">
                {isPullRefreshing ? "Refreshing..." : pullDistance >= 72 ? "Release to refresh" : "Pull to refresh"}
              </div>
            </div>
          ) : null}

          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Explore questions</h1>
                <p className="mt-2 text-sm font-medium text-slate-600">{resultSummary}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenFilters}
                  aria-keyshortcuts="F"
                  className="inline-flex min-h-[56px] items-center gap-3 rounded-2xl border border-sky-300 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-[var(--shadow-soft)] ring-1 ring-sky-100 transition hover:border-sky-400 hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 active:scale-[0.98] xl:hidden"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                    <FaFilter className="h-5 w-5" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span>Filters</span>
                    <span className="text-xs font-medium text-slate-600">
                      {activeFilterCount > 0 ? `${activeFilterCount} active` : "All questions"}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <QuestionSearchInput
                id="explore-search"
                label="Search questions"
                placeholder="Search keywords like dijkstra, paging, or SQL"
                ariaKeyShortcuts="/"
                compact
                hideLabel
              />
            </div>

            <div className="mt-4">
              <ActiveFilterChips />
            </div>
          </div>

          {error ? (
            <div className="rounded-[var(--radius-card)] border border-rose-200 bg-rose-50 p-6 text-center shadow-[var(--shadow-soft)]">
              <p className="text-sm font-medium text-rose-800">{error}</p>
              <button
                type="button"
                onClick={() => loadQuestions()}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
              >
                Retry
              </button>
            </div>
          ) : loading && !isInitialized ? (
            <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-10 shadow-[var(--shadow-card)]">
              <LoadingState
                label="Loading filter page..."
                size="lg"
                className="min-h-[320px]"
                textClassName="text-sm text-slate-500"
              />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[var(--shadow-soft)]">
              <h2 className="text-xl font-semibold text-slate-900">No questions match these filters.</h2>
              <p className="mt-2 text-sm text-slate-600">
                Try removing one or two filters, broadening the year range, or clearing the search text.
              </p>
            </div>
          ) : isPageTransitioning ? (
            <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-10 shadow-[var(--shadow-card)]">
              <LoadingState
                label="Loading page..."
                size="md"
                className="min-h-[200px]"
                textClassName="text-sm text-slate-500"
              />
            </div>
          ) : (
            <>
              <QuestionPickerList
                questions={pagedQuestions}
                pageStartIndex={startIndex}
                isQuestionSolved={isQuestionSolved}
                isQuestionBookmarked={isQuestionBookmarked}
                onOpenQuestion={handleOpenQuestion}
              />

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(nextPage) => {
                  navigate({
                    pathname: PRACTICE_ROUTE,
                    search: writePageParam(location.search, nextPage),
                  });
                }}
              />
            </>
          )}
        </section>
      </div>
    </PageShell>
  );
};

export default ExplorePage;
