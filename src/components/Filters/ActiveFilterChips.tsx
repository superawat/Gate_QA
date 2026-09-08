import React, { useMemo } from 'react';
import { useFilterState, useFilterActions } from '../../contexts/FilterContext';
import { FaTimes } from 'react-icons/fa';
import { QuestionService } from '../../services/QuestionService';
import { formatTrackYearSetLabel, parseTrackYearSetKey } from '../../utils/examTrack';
import type {
    FilterActionsShape,
    FilterStateShape,
    StructuredSubtopics,
} from '../../types';

const ActiveFilterChips = () => {
    const { filters = {}, structuredTags = {} } = useFilterState() as FilterStateShape;
    const { updateFilters, clearFilters } = useFilterActions() as FilterActionsShape;
    const {
        selectedYearSets = [],
        selectedSubjects = [],
        selectedSubtopics = [],
        selectedTypes = [],
        yearRange,
        hideSolved = false,
        showOnlySolved = false,
        showOnlyBookmarked = false,
        searchQuery = ''
    } = filters;
    const {
        minYear = 0,
        maxYear = 0,
        subjects = [],
        yearSets = [],
        structuredSubtopics = {},
        questionTypes = ['MCQ', 'MSQ', 'NAT'],
    } = structuredTags;

    const subjectLabelBySlug = useMemo(
        () => new Map(subjects.map((subject) => [subject.slug, subject.label])),
        [subjects]
    );

    const yearSetByKey = useMemo(
        () => new Map(yearSets.map((yearSet) => [yearSet.key, yearSet])),
        [yearSets]
    );

    const subtopicLabelBySlug = useMemo(() => {
        const map = new Map<string, string>();
        const subtopicsBySubject = structuredSubtopics as StructuredSubtopics;
        Object.keys(subtopicsBySubject || {}).forEach((subjectSlug) => {
            (subtopicsBySubject[subjectSlug] || []).forEach((subtopic) => {
                if (!map.has(subtopic.slug)) {
                    map.set(subtopic.slug, subtopic.label);
                }
            });
        });
        return map;
    }, [structuredSubtopics]);

    const availableTypes = Array.isArray(questionTypes) && questionTypes.length > 0
        ? questionTypes
        : ['MCQ', 'MSQ', 'NAT'];
    const isTypeConstrained = Array.isArray(selectedTypes)
        && selectedTypes.length > 0
        && selectedTypes.length < availableTypes.length;

    const removeYear = (yearSetKey: string) => {
        updateFilters({ selectedYearSets: selectedYearSets.filter((y) => y !== yearSetKey) });
    };

    const removeSubject = (subjectSlug: string) => {
        updateFilters({ selectedSubjects: selectedSubjects.filter((subject) => subject !== subjectSlug) });
    };

    const removeSubtopic = (subtopicSlug: string) => {
        updateFilters({ selectedSubtopics: selectedSubtopics.filter((s) => s !== subtopicSlug) });
    };

    const resetRange = () => {
        updateFilters({ yearRange: [minYear, maxYear] });
    };

    const resetTypes = () => {
        updateFilters({ selectedTypes: [...availableTypes] });
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
        || isTypeConstrained
        || isRangeActive
        || hideSolved
        || showOnlySolved
        || showOnlyBookmarked
        || hasSearchQuery;

    if (!hasActiveFilters) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4 animate-fadeIn">
            {hasSearchQuery && (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-text)] shadow-sm">
                    Search: {searchQuery}
                    <button
                        type="button"
                        aria-label="Remove search filter"
                        onClick={resetSearchQuery}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-text-muted)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <FaTimes />
                    </button>
                </span>
            )}

            {selectedYearSets.map((yearSetKey) => {
                const yearMeta = yearSetByKey.get(yearSetKey);
                const parsedKey = parseTrackYearSetKey(yearSetKey);
                const isDa = yearMeta?.track === 'da' || parsedKey?.track === 'da';
                const isAdditional = Boolean(
                    yearMeta?.paperScope === 'additional_ga' ||
                    parsedKey?.isAdditional ||
                    /additional/i.test(yearSetKey)
                );
                const rawLabel = String(formatTrackYearSetLabel(yearSetKey) || QuestionService.formatYearSetLabel(yearSetKey) || '').trim();
                const label = isAdditional
                    ? (rawLabel.replace(/\s*additional(?:\s+questions?)?/i, '').trim() || (parsedKey?.year ? String(parsedKey.year) : rawLabel))
                    : rawLabel;

                return (
                    <span key={yearSetKey} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-primary-text)] shadow-sm">
                        {label}
                        {isDa && (
                            <span className="rounded-full border border-[color:var(--color-purple-border)] bg-[color:var(--color-purple-soft)] px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-[color:var(--color-purple-text)]">
                                DA
                            </span>
                        )}
                        {isAdditional && (
                            <span className="rounded-full border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-[color:var(--color-warning-text)]">
                                Additional
                            </span>
                        )}
                        <button type="button" onClick={() => removeYear(yearSetKey)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-primary-text)] transition hover:bg-[color:var(--color-primary-soft-hover)] focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <FaTimes />
                        </button>
                    </span>
                );
            })}

            {isRangeActive && (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-purple-border)] bg-[color:var(--color-purple-soft)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-purple-text)] shadow-sm">
                    {yearRange[0]} - {yearRange[1]}
                    <button type="button" onClick={resetRange} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-purple-text)] transition hover:bg-[color:var(--color-purple-soft)] focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <FaTimes />
                    </button>
                </span>
            )}

            {isTypeConstrained && (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-info-border)] bg-[color:var(--color-info-soft)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-info-text)] shadow-sm">
                    Types: {selectedTypes.join(', ')}
                    <button
                        type="button"
                        aria-label="Reset question type filter"
                        onClick={resetTypes}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-info-text)] transition hover:bg-[color:var(--color-info-soft)] focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <FaTimes />
                    </button>
                </span>
            )}

            {selectedSubjects.map((subjectSlug) => (
                <span key={subjectSlug} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] px-3 py-1.5 text-sm font-medium capitalize text-[color:var(--color-success-text)] shadow-sm">
                    {subjectLabelBySlug.get(subjectSlug) || subjectSlug}
                    <button type="button" onClick={() => removeSubject(subjectSlug)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-success-text)] transition hover:bg-[color:var(--color-success-soft)] focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            ))}

            {selectedSubtopics.map((subtopicSlug) => (
                <span key={subtopicSlug} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-warning-text)] shadow-sm">
                    {subtopicLabelBySlug.get(subtopicSlug) || subtopicSlug}
                    <button type="button" onClick={() => removeSubtopic(subtopicSlug)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-warning-text)] transition hover:bg-[color:var(--color-warning-soft)] focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            ))}

            {hideSolved && (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-success-text)] shadow-sm">
                    Hide solved
                    <button type="button" onClick={resetHideSolved} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-success-text)] transition hover:bg-[color:var(--color-success-soft)] focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            )}

            {showOnlySolved && (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-primary-text)] shadow-sm">
                    Solved only
                    <button type="button" onClick={resetShowOnlySolved} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-primary-text)] transition hover:bg-[color:var(--color-primary-soft-hover)] focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            )}

            {showOnlyBookmarked && (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-warning-text)] shadow-sm">
                    Bookmarked only
                    <button type="button" onClick={resetShowBookmarkedOnly} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-warning-text)] transition hover:bg-[color:var(--color-warning-soft)] focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <FaTimes />
                    </button>
                </span>
            )}

            <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text)] shadow-sm transition hover:border-[color:var(--color-neutral-border)] hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
                <FaTimes className="text-[10px]" />
                Clear all
            </button>
        </div>
    );
};

export default ActiveFilterChips;
