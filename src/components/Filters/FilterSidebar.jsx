import React from 'react';
import YearFilter from './YearFilter';
import YearRangeFilter from './YearRangeFilter';
import TopicFilter from './TopicFilter';
import ProgressBar from './ProgressBar';
import ProgressFilterToggles from './ProgressFilterToggles';
import ProgressManager from '../ProgressManager/ProgressManager';
import QuestionSearchInput from './QuestionSearchInput';
import { useFilterState, useFilterActions } from '../../contexts/FilterContext';

const TYPE_BUTTON_STYLES = {
    MCQ: {
        selected: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
        unselected: 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200 hover:text-gray-700'
    },
    MSQ: {
        selected: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200',
        unselected: 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200 hover:text-gray-700'
    },
    NAT: {
        selected: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
        unselected: 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200 hover:text-gray-700'
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
    const selectedTypes = Array.isArray(filters.selectedTypes) ? filters.selectedTypes : [...QUESTION_TYPES];
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
        || selectedTypes.length < QUESTION_TYPES.length
        || isRangeActive
        || filters.hideSolved
        || filters.showOnlySolved
        || filters.showOnlyBookmarked
        || hasSearchQuery;

    return (
        <aside className={`flex min-h-0 flex-shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-gray-50 ${className}`}>
            {/* Reset / Clean filters (if needed) */}
            <div className="p-4 border-b border-gray-200 bg-white z-10 flex justify-between items-center flex-shrink-0">
                <span className="text-sm font-semibold text-gray-700">
                    {filteredQuestions.length} / {totalQuestions} results
                </span>
                <div className="flex min-w-[3.75rem] items-center justify-end gap-2">
                    <button
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        aria-hidden={!hasActiveFilters}
                        className={`text-xs font-bold uppercase tracking-wide transition-colors ${hasActiveFilters ? 'text-blue-600 hover:text-blue-800' : 'pointer-events-none opacity-0'}`}
                    >
                        Reset
                    </button>
                    {onClose && (
                        <button type="button" onClick={onClose} aria-label="Close filters" className="text-gray-500 hover:text-gray-700 md:hidden">
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 border-b border-gray-200 bg-white z-10 flex-shrink-0">
                <QuestionSearchInput
                    id="practice-search"
                    label="Search"
                    placeholder="Search keywords..."
                    compact
                />
            </div>

            <div className="border-b border-gray-200 bg-white px-4 py-3 z-10 flex-shrink-0">
                <div className="flex flex-col gap-3">
                    <div className="min-w-0 flex flex-col">
                        <ProgressBar
                            solvedCount={solvedCount}
                            totalQuestions={totalQuestions}
                            progressPercentage={progressPercentage}
                        >
                            <ProgressManager />
                        </ProgressBar>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 p-3">
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
                </div>
            </div>

            {/* Question Type Filter (Horizontal Toggles) */}
            <div className="p-4 border-b border-gray-200 bg-white z-10 relative flex-shrink-0">
                <div className="mb-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question Type</h3>
                </div>
                <div className="flex gap-2">
                    {QUESTION_TYPES.map((type) => {
                        const isSelected = selectedTypes.includes(type);
                        const typeStyle = TYPE_BUTTON_STYLES[type];

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

                    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="mb-2 border-b border-gray-100 bg-gray-50 px-3 py-2 flex-shrink-0">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Topics</h3>
                        </div>
                        <div className="custom-scrollbar max-h-72 overflow-y-auto px-3 pb-3">
                            <TopicFilter />
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="mb-2 border-b border-gray-100 bg-gray-50 px-3 py-2 flex-shrink-0">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Years</h3>
                        </div>
                        <div className="custom-scrollbar max-h-64 overflow-y-auto px-3 pb-3">
                            <YearFilter />
                        </div>
                    </div>

                </div>
            </div>

            {/* Sticky Bottom: Year Range */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 z-10 flex-shrink-0">
                <div className="mb-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Year Range</h3>
                </div>
                <YearRangeFilter />
            </div>
        </aside>
    );
};

export default FilterSidebar;
