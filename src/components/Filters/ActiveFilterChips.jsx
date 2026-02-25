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
        showOnlyBookmarked
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

    const isRangeActive = yearRange && (yearRange[0] !== minYear || yearRange[1] !== maxYear);
    const hasActiveFilters = selectedYearSets.length > 0
        || selectedSubjects.length > 0
        || selectedSubtopics.length > 0
        || isRangeActive
        || hideSolved
        || showOnlySolved
        || showOnlyBookmarked;

    if (!hasActiveFilters) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4 animate-fadeIn">
            {selectedYearSets.map((yearSetKey) => (
                <span key={yearSetKey} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {QuestionService.formatYearSetLabel(yearSetKey)}
                    <button onClick={() => removeYear(yearSetKey)} className="ml-1.5 inline-flex text-blue-500 hover:text-blue-600 focus:outline-none">
                        <FaTimes />
                    </button>
                </span>
            ))}

            {isRangeActive && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {yearRange[0]} - {yearRange[1]}
                    <button onClick={resetRange} className="ml-1.5 inline-flex text-purple-500 hover:text-purple-600 focus:outline-none">
                        <FaTimes />
                    </button>
                </span>
            )}

            {selectedSubjects.map((subjectSlug) => (
                <span key={subjectSlug} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 capitalize">
                    {subjectLabelBySlug.get(subjectSlug) || subjectSlug}
                    <button onClick={() => removeSubject(subjectSlug)} className="ml-1.5 inline-flex text-green-500 hover:text-green-600 focus:outline-none">
                        <FaTimes />
                    </button>
                </span>
            ))}

            {selectedSubtopics.map((subtopicSlug) => (
                <span key={subtopicSlug} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {subtopicLabelBySlug.get(subtopicSlug) || subtopicSlug}
                    <button onClick={() => removeSubtopic(subtopicSlug)} className="ml-1.5 inline-flex text-yellow-500 hover:text-yellow-600 focus:outline-none">
                        <FaTimes />
                    </button>
                </span>
            ))}

            {hideSolved && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Hide solved
                    <button onClick={resetHideSolved} className="ml-1.5 inline-flex text-emerald-500 hover:text-emerald-600 focus:outline-none">
                        <FaTimes />
                    </button>
                </span>
            )}

            {showOnlySolved && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Solved only
                    <button onClick={resetShowOnlySolved} className="ml-1.5 inline-flex text-indigo-500 hover:text-indigo-600 focus:outline-none">
                        <FaTimes />
                    </button>
                </span>
            )}

            {showOnlyBookmarked && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Bookmarked only
                    <button onClick={resetShowBookmarkedOnly} className="ml-1.5 inline-flex text-orange-500 hover:text-orange-600 focus:outline-none">
                        <FaTimes />
                    </button>
                </span>
            )}

            <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline decoration-dotted"
            >
                Clear all
            </button>
        </div>
    );
};

export default ActiveFilterChips;
