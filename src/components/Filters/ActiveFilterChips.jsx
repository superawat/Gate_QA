import React from 'react';
import { useFilterState, useFilterActions } from '../../contexts/FilterContext';
import { FaTimes } from 'react-icons/fa';
import { QuestionService } from '../../services/QuestionService';

const ActiveFilterChips = () => {
    const { filters, structuredTags } = useFilterState();
    const { updateFilters, clearFilters } = useFilterActions();
    const {
        selectedYearSets,
        selectedSubjects,
        selectedSubtopics,
        yearRange,
        hideSolved,
        showOnlySolved,
        showOnlyBookmarked,
        searchQuery
    } = filters;
    const { minYear, maxYear, subjects = [], structuredSubtopics = {} } = structuredTags;

    const subjectLabelBySlug = new Map(subjects.map(subject => [subject.slug, subject.label]));
    const subtopicLabelBySlug = new Map();
    Object.keys(structuredSubtopics || {}).forEach((subjectSlug) => {
        (structuredSubtopics[subjectSlug] || []).forEach((subtopic) => {
            if (!subtopicLabelBySlug.has(subtopic.slug)) {
                subtopicLabelBySlug.set(subtopic.slug, subtopic.label);
            }
        });
    });

    const removeYear = (yearSetKey) => {
        updateFilters({ selectedYearSets: selectedYearSets.filter(y => y !== yearSetKey) });
    };

    const removeSubject = (subjectSlug) => {
        updateFilters({ selectedSubjects: selectedSubjects.filter(subject => subject !== subjectSlug) });
    };

    const removeSubtopic = (subtopicSlug) => {
        updateFilters({ selectedSubtopics: selectedSubtopics.filter(s => s !== subtopicSlug) });
    };

    const resetRange = () => {
        updateFilters({ yearRange: [minYear, maxYear] });
    };

    const resetHideSolved = () => {
        updateFilters({ hideSolved: false });
    };

    const resetShowOnlySolved = () => {
        updateFilters({ showOnlySolved: false });
    };

    const resetShowBookmarkedOnly = () => {
        updateFilters({ showOnlyBookmarked: false });
    };

    const resetSearchQuery = () => {
        updateFilters({ searchQuery: '' });
    };

    const isRangeActive = yearRange && (yearRange[0] !== minYear || yearRange[1] !== maxYear);
    const hasSearchQuery = String(searchQuery || '').trim() !== '';
    const hasActiveFilters = selectedYearSets.length > 0
        || selectedSubjects.length > 0
        || selectedSubtopics.length > 0
        || isRangeActive
        || hideSolved
        || showOnlySolved
        || showOnlyBookmarked
        || hasSearchQuery;

    if (!hasActiveFilters) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4 animate-fadeIn">
            {hasSearchQuery && (
                <span className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800">
                    Search: {searchQuery}
                    <button
                        type="button"
                        aria-label="Remove search filter"
                        onClick={resetSearchQuery}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <FaTimes />
                    </button>
                </span>
            )}

            {selectedYearSets.map((yearSetKey) => (
                <span key={yearSetKey} className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800">
                    {QuestionService.formatYearSetLabel(yearSetKey)}
                    <button type="button" onClick={() => removeYear(yearSetKey)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-200 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            ))}

            {isRangeActive && (
                <span className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-800">
                    {yearRange[0]} - {yearRange[1]}
                    <button type="button" onClick={resetRange} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-purple-500 transition hover:bg-purple-200 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            )}

            {selectedSubjects.map((subjectSlug) => (
                <span key={subjectSlug} className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium capitalize text-green-800 dark:bg-green-900 dark:text-green-200">
                    {subjectLabelBySlug.get(subjectSlug) || subjectSlug}
                    <button type="button" onClick={() => removeSubject(subjectSlug)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-green-500 transition hover:bg-green-200 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            ))}

            {selectedSubtopics.map((subtopicSlug) => (
                <span key={subtopicSlug} className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {subtopicLabelBySlug.get(subtopicSlug) || subtopicSlug}
                    <button type="button" onClick={() => removeSubtopic(subtopicSlug)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-yellow-500 transition hover:bg-yellow-200 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            ))}

            {hideSolved && (
                <span className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                    Hide solved
                    <button type="button" onClick={resetHideSolved} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-emerald-500 transition hover:bg-emerald-200 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            )}

            {showOnlySolved && (
                <span className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-800">
                    Solved only
                    <button type="button" onClick={resetShowOnlySolved} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-indigo-500 transition hover:bg-indigo-200 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            )}

            {showOnlyBookmarked && (
                <span className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-800">
                    Bookmarked only
                    <button type="button" onClick={resetShowBookmarkedOnly} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-orange-500 transition hover:bg-orange-200 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            )}

            <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
                <FaTimes className="text-[10px]" />
                Clear all
            </button>
        </div>
    );
};

export default ActiveFilterChips;
