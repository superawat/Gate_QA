import React, { useMemo, useState } from 'react';
import { useFilterState, useFilterActions } from '../../contexts/FilterContext';
import { useAptitudeEnabled } from '../../utils/aptitudePreference';

const APTITUDE_SUBJECT_SLUGS = new Set(['english', 'mathematics', 'reasoning']);

/**
 * Dedicated Aptitude Practice section for the filter sidebar.
 * Renders its own toggle + subject/subtopic checkboxes.
 * Completely hidden subjects when toggle is OFF.
 */
const AptitudeTopicFilter = () => {
    const [aptitudeEnabled, setAptitudeEnabled] = useAptitudeEnabled();
    const { structuredTags, filters, aptitudeLoading, aptitudeError } = useFilterState();
    const { updateFilters } = useFilterActions();

    const { subjects = [], structuredSubtopics = {} } = structuredTags;
    const { selectedSubjects = [], selectedSubtopics = [] } = filters;

    const [expandedSubjectSlug, setExpandedSubjectSlug] = useState(null);

    const aptitudeSubjects = useMemo(
        () => subjects.filter((s) => APTITUDE_SUBJECT_SLUGS.has(s?.slug)),
        [subjects]
    );

    const selectedSubjectSet = useMemo(() => new Set(selectedSubjects), [selectedSubjects]);
    const selectedSubtopicSet = useMemo(() => new Set(selectedSubtopics), [selectedSubtopics]);

    const sortedSubtopicsBySubject = useMemo(() => {
        const map = new Map();
        aptitudeSubjects.forEach((subject) => {
            const slug = subject?.slug;
            const subtopics = structuredSubtopics[slug] || [];
            map.set(
                slug,
                [...subtopics].sort((a, b) =>
                    String(a?.label || a?.slug || '').localeCompare(String(b?.label || b?.slug || ''))
                )
            );
        });
        return map;
    }, [aptitudeSubjects, structuredSubtopics]);

    const handleSubjectChange = (subjectSlug) => {
        const isSelected = selectedSubjectSet.has(subjectSlug);
        const nextSubjects = isSelected
            ? selectedSubjects.filter((s) => s !== subjectSlug)
            : [...selectedSubjects, subjectSlug];

        if (isSelected) {
            if (expandedSubjectSlug === subjectSlug) {
                setExpandedSubjectSlug(nextSubjects.find((s) => APTITUDE_SUBJECT_SLUGS.has(s)) || null);
            }
        } else {
            setExpandedSubjectSlug(subjectSlug);
        }
        updateFilters({ selectedSubjects: nextSubjects });
    };

    const handleSubtopicChange = (subtopicSlug) => {
        const nextSubtopics = selectedSubtopics.includes(subtopicSlug)
            ? selectedSubtopics.filter((s) => s !== subtopicSlug)
            : [...selectedSubtopics, subtopicSlug];
        updateFilters({ selectedSubtopics: nextSubtopics });
    };

    const handleBulkToggle = (subjectSlug) => {
        const subtopics = sortedSubtopicsBySubject.get(subjectSlug) || [];
        const slugs = subtopics.map((st) => st?.slug).filter(Boolean);
        if (slugs.length === 0) return;

        const allSelected = slugs.every((s) => selectedSubtopicSet.has(s));
        if (allSelected) {
            const removeSet = new Set(slugs);
            updateFilters({ selectedSubtopics: selectedSubtopics.filter((s) => !removeSet.has(s)) });
        } else {
            const nextSet = new Set(selectedSubtopics);
            slugs.forEach((s) => nextSet.add(s));
            updateFilters({ selectedSubtopics: Array.from(nextSet) });
        }
    };

    /* Count of aptitude questions for the badge */
    const aptitudeCount = aptitudeSubjects.length > 0 && aptitudeEnabled
        ? aptitudeSubjects.reduce((sum, s) => {
            const subtopics = structuredSubtopics[s?.slug] || [];
            return sum + subtopics.reduce((acc, st) => acc + (st?.count || 0), 0);
        }, 0)
        : 0;

    return (
        <div className="aptitude-section-wrapper">
            {/* ── Toggle Header ── */}
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                            Aptitude Practice
                        </span>
                        {aptitudeEnabled && !aptitudeLoading && aptitudeCount > 0 && (
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                {aptitudeCount.toLocaleString()} Qs
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-tight text-[color:var(--color-text-muted)]">
                        {aptitudeEnabled
                            ? (aptitudeLoading ? 'Loading aptitude questions…' : 'English, Mathematics & Reasoning')
                            : 'Toggle on to add competitive exam questions'}
                    </p>
                    {aptitudeError ? (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600">{aptitudeError}</p>
                    ) : null}
                </div>

                <button
                    type="button"
                    role="switch"
                    id="aptitude-toggle"
                    aria-label="Enable Aptitude Practice"
                    aria-checked={aptitudeEnabled}
                    onClick={() => setAptitudeEnabled((v) => !v)}
                    className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                        aptitudeEnabled
                            ? 'border-teal-500 bg-teal-500'
                            : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]'
                    }`}
                >
                    <span
                        className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
                            aptitudeEnabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
                        }`}
                    />
                </button>
            </div>

            {/* ── Aptitude Topics (only when enabled) ── */}
            {aptitudeEnabled && aptitudeSubjects.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-teal-200/40 pt-3 dark:border-teal-700/30">
                    {aptitudeSubjects.map((subject) => {
                        const slug = subject.slug;
                        const isSelected = selectedSubjectSet.has(slug);
                        const subtopics = sortedSubtopicsBySubject.get(slug) || [];
                        const hasSubtopics = subtopics.length > 0;
                        const isExpanded = expandedSubjectSlug === slug;
                        const showSubtopics = isSelected && hasSubtopics && isExpanded;
                        const subjectSubtopicSlugs = subtopics.map((st) => st?.slug).filter(Boolean);
                        const allSubtopicsSelected = showSubtopics && subjectSubtopicSlugs.every((s) => selectedSubtopicSet.has(s));

                        return (
                            <div key={slug} className="flex min-w-0 flex-col">
                                <div className="flex items-center justify-between gap-2 py-1">
                                    <label className="flex min-w-0 cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                            checked={isSelected}
                                            onChange={() => handleSubjectChange(slug)}
                                        />
                                        <span className="ml-3 flex min-w-0 items-center gap-2">
                                            <span
                                                className={`truncate text-sm ${isSelected ? 'font-medium text-teal-700 dark:text-teal-300' : 'text-[color:var(--color-text-muted)]'}`}
                                                title={subject.label}
                                            >
                                                {subject.label}
                                            </span>
                                        </span>
                                    </label>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        {isSelected && hasSubtopics && (
                                            <button
                                                type="button"
                                                onClick={() => setExpandedSubjectSlug(isExpanded ? null : slug)}
                                                aria-label={isExpanded ? `Hide ${subject.label} subtopics` : `Show ${subject.label} subtopics`}
                                                className="rounded border border-teal-300/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:border-teal-600/40 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                            >
                                                {isExpanded ? 'Hide' : 'Show'}
                                            </button>
                                        )}
                                        {showSubtopics && (
                                            <button
                                                type="button"
                                                onClick={() => handleBulkToggle(slug)}
                                                aria-label={allSubtopicsSelected ? `Clear all ${subject.label} subtopics` : `Select all ${subject.label} subtopics`}
                                                className="rounded border border-teal-400/50 px-2 py-0.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:border-teal-500/40 dark:text-teal-400 dark:hover:bg-teal-900/30"
                                            >
                                                {allSubtopicsSelected ? 'Clear All' : 'Select All'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {showSubtopics && (
                                    <div className="ml-6 mt-1 max-h-36 space-y-1 overflow-y-auto border-l-2 border-teal-200/60 pl-2 pr-1 dark:border-teal-700/40">
                                        {subtopics.map((subtopic) => (
                                            <label key={subtopic.slug} className="group/sub flex min-w-0 cursor-pointer items-center py-0.5">
                                                <input
                                                    type="checkbox"
                                                    className="h-3 w-3 rounded border-gray-300 text-teal-500 focus:ring-teal-400"
                                                    checked={selectedSubtopicSet.has(subtopic.slug)}
                                                    onChange={() => handleSubtopicChange(subtopic.slug)}
                                                />
                                                <span
                                                    className="ml-2 truncate text-xs text-[color:var(--color-text-muted)] group-hover/sub:text-[color:var(--color-text)]"
                                                    title={subtopic.label}
                                                >
                                                    {subtopic.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AptitudeTopicFilter;
