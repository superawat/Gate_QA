import React from 'react';
import YearFilter from './YearFilter';
import YearRangeFilter from './YearRangeFilter';
import TopicFilter from './TopicFilter';
import AptitudeTopicFilter from './AptitudeTopicFilter';
import ProgressFilterToggles from './ProgressFilterToggles';
import QuestionSearchInput from './QuestionSearchInput';
import { useFilterState, useFilterActions } from '../../contexts/FilterContext';

const TYPE_BUTTON_STYLES = {
    MCQ: {
        selected: 'bg-[color:var(--color-info-soft)] text-[color:var(--color-info-text)] border-[color:var(--color-info-border)] hover:bg-[color:var(--color-primary-soft-hover)]',
        unselected: 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] border-[color:var(--color-border)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]'
    },
    MSQ: {
        selected: 'bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-text)] border-[color:var(--color-warning-border)] hover:bg-[color:var(--color-warning-soft)]',
        unselected: 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] border-[color:var(--color-border)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]'
    },
    NAT: {
        selected: 'bg-[color:var(--color-purple-soft)] text-[color:var(--color-purple-text)] border-[color:var(--color-purple-border)] hover:bg-[color:var(--color-purple-soft)]',
        unselected: 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] border-[color:var(--color-border)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]'
    }
};
const QUESTION_TYPES = ['MCQ', 'MSQ', 'NAT'];

const FilterSidebar = ({ className = "", onClose }) => {
    const {
        filteredQuestions,
        totalQuestions,
        filters,
        structuredTags,
        solvedCount,
        progressPercentage,
    } = useFilterState();

    const {
        updateFilters,
        clearFilters,
        setHideSolved,
        setShowOnlyBookmarked,
        setShowOnlySolved
    } = useFilterActions();
    const questionTypes = Array.isArray(structuredTags.questionTypes) && structuredTags.questionTypes.length > 0
        ? structuredTags.questionTypes
        : QUESTION_TYPES;
    const selectedTypes = Array.isArray(filters.selectedTypes) ? filters.selectedTypes : [...questionTypes];
    const hideYearFilters = structuredTags.hideYearFilters || questionTypes.length === 1 && questionTypes[0] === 'MCQ' && structuredTags.yearSets?.length === 0;
    const hasSearchQuery = String(filters.searchQuery || '').trim() !== '';
    const isRangeActive = Array.isArray(filters.yearRange)
        && filters.yearRange.length === 2
        && (
            Number(filters.yearRange[0]) !== Number(structuredTags.minYear)
            || Number(filters.yearRange[1]) !== Number(structuredTags.maxYear)
        );
    const hasActiveFilters = filters.selectedYearSets.length > 0
        || filters.selectedSubjects.length > 0
        || filters.selectedSubtopics.length > 0
        || selectedTypes.length < questionTypes.length
        || (!hideYearFilters && isRangeActive)
        || filters.hideSolved
        || filters.showOnlySolved
        || filters.showOnlyBookmarked
        || hasSearchQuery;

    return (
        <aside className={`flex min-h-0 flex-shrink-0 flex-col overflow-y-auto border-r border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] ${className}`}>
            {/* Reset / Clean filters (if needed) */}
            <div className="z-10 flex flex-shrink-0 items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
                <span className="text-sm font-semibold text-[color:var(--color-text)]">
                    {filteredQuestions.length} / {totalQuestions} results
                </span>
                <div className="flex min-w-[3.75rem] items-center justify-end gap-2">
                    <button
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        aria-hidden={!hasActiveFilters}
                        className={`text-xs font-bold uppercase tracking-wide transition-colors ${hasActiveFilters ? 'text-[color:var(--color-primary-text)] hover:text-[color:var(--color-primary-hover)]' : 'pointer-events-none opacity-0'}`}
                    >
                        Reset
                    </button>
                    {onClose && (
                        <button type="button" onClick={onClose} aria-label="Close filters" className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] md:hidden">
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="z-10 flex-shrink-0 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
                <QuestionSearchInput
                    id="practice-search"
                    label="Search"
                    placeholder="Search keywords..."
                    compact
                />
            </div>

            <div className="z-10 flex-shrink-0 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3">
                <div className="flex-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3">
                    <ProgressFilterToggles
                        hideSolved={filters.hideSolved}
                        showOnlySolved={filters.showOnlySolved}
                        showOnlyBookmarked={filters.showOnlyBookmarked}
                        onToggleHideSolved={setHideSolved}
                        onToggleShowOnlySolved={setShowOnlySolved}
                        onToggleShowBookmarked={setShowOnlyBookmarked}
                    />
                </div>
            </div>

            {/* Question Type Filter (Horizontal Toggles) */}
            <div className="relative z-10 flex-shrink-0 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-muted)]">Question Type</h3>
                </div>
                <div className="flex gap-2">
                    {questionTypes.map((type) => {
                        const isSelected = selectedTypes.includes(type);
                        const typeStyle = TYPE_BUTTON_STYLES[type] || TYPE_BUTTON_STYLES.MCQ;

                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const current = selectedTypes;
                                    let next;
                                    if (current.includes(type)) {
                                        next = current.filter(t => t !== type);
                                    } else {
                                        next = [...current, type];
                                    }
                                    updateFilters({ selectedTypes: next });
                                }}
                                aria-pressed={isSelected}
                                className={`flex-1 rounded-lg border px-1 py-2 text-sm font-semibold transition-all duration-150 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 cursor-pointer pointer-events-auto relative z-20 ${isSelected ? typeStyle.selected : typeStyle.unselected}`}
                            >
                                {type}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable Filter Content */}
            <div className="p-3">
                <div className="flex flex-col gap-4">

                    {/* GATE Topics */}
                    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                        <div className="mb-2 flex-shrink-0 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-muted)]">Topics</h3>
                        </div>
                        <div className="custom-scrollbar max-h-72 overflow-y-auto px-3 pb-3">
                            <TopicFilter />
                        </div>
                    </div>

                    {/* ── Aptitude Section (distinct card) ── */}
                    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-pink-300/40 bg-gradient-to-br from-pink-50/60 to-rose-50/40 dark:border-pink-700/30 dark:from-pink-950/20 dark:to-rose-950/10">
                        <div className="px-3 py-3">
                            <AptitudeTopicFilter />
                        </div>
                    </div>

                    {!hideYearFilters && (
                        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                            <div className="mb-2 flex-shrink-0 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-muted)]">Years</h3>
                            </div>
                            <div className="custom-scrollbar max-h-64 overflow-y-auto px-3 pb-3">
                                <YearFilter />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Sticky Bottom: Year Range */}
            {!hideYearFilters && (
                <div className="z-10 flex-shrink-0 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4">
                    <div className="mb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-muted)]">Year Range</h3>
                    </div>
                    <YearRangeFilter />
                </div>
            )}
        </aside>
    );
};

export default FilterSidebar;
