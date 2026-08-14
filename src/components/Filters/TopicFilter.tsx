import React, { useEffect, useMemo, useState } from 'react';
import { useFilterState, useFilterActions } from '../../contexts/FilterContext';
import type {
    FilterActionsShape,
    FilterStateShape,
    StructuredSubtopics,
    SubjectOption,
    SubtopicOption,
} from '../../types';

const LEGACY_OPTIONAL_SUBJECT_SLUG = 'legacy-other';
const APTITUDE_SUBJECT_SLUGS = new Set(['english', 'quant', 'mathematics', 'reasoning']);

interface SubjectGroup {
    key: string;
    subjects: SubjectOption[];
    heading: string | null;
    description: string | null;
    className: string;
    headingClassName?: string;
}

const TopicFilter = () => {
    const { structuredTags = {}, filters = {}, includeCse = true } = useFilterState() as FilterStateShape;
    const { updateFilters, setIncludeCse } = useFilterActions() as FilterActionsShape;
    const { subjects = [], structuredSubtopics = {} } = structuredTags;
    const { selectedSubjects = [], selectedSubtopics = [] } = filters;
    const [expandedSubjectSlugs, setExpandedSubjectSlugs] = useState<Set<string>>(() => new Set());

    const selectedSubjectSet = useMemo(() => new Set(selectedSubjects), [selectedSubjects]);
    const selectedSubtopicSet = useMemo(() => new Set(selectedSubtopics), [selectedSubtopics]);
    const sortedSubtopicsBySubject = useMemo(() => {
        const nextMap = new Map<string, SubtopicOption[]>();
        const subtopicsBySubject = structuredSubtopics as StructuredSubtopics;

        subjects.forEach((subject) => {
            const subjectSlug = subject?.slug;
            const subtopics = subtopicsBySubject[subjectSlug] || [];
            nextMap.set(
                subjectSlug,
                [...subtopics].sort((left, right) =>
                    String(left?.label || left?.slug || '').localeCompare(String(right?.label || right?.slug || ''))
                )
            );
        });

        return nextMap;
    }, [structuredSubtopics, subjects]);

    const subjectGroups = useMemo<SubjectGroup[]>(() => {
        const coreSubjects = subjects.filter(
            (subject) =>
                subject?.slug !== LEGACY_OPTIONAL_SUBJECT_SLUG
                && !APTITUDE_SUBJECT_SLUGS.has(subject?.slug)
                && !subject?.slug.startsWith('da:')
        );
        const optionalSubjects = subjects.filter((subject) => subject?.slug === LEGACY_OPTIONAL_SUBJECT_SLUG);

        return [
            {
                key: 'core',
                subjects: coreSubjects,
                heading: null,
                description: null,
                className: '',
            },
            optionalSubjects.length > 0
                ? {
                    key: 'optional',
                    subjects: optionalSubjects,
                    heading: 'Optional legacy topics',
                    description: 'Older or out-of-syllabus questions from past papers.',
                    className: 'rounded-xl border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] p-3',
                }
                : null,
        ].filter(Boolean) as SubjectGroup[];
    }, [subjects]);

    useEffect(() => {
        if (selectedSubjects.length === 0) {
            if (expandedSubjectSlugs.size > 0) {
                setExpandedSubjectSlugs(new Set());
            }
            return;
        }

        setExpandedSubjectSlugs((prev) => {
            let changed = false;
            const next = new Set<string>();

            // Keep existing expansions that are still selected
            prev.forEach((slug) => {
                if (selectedSubjectSet.has(slug)) {
                    next.add(slug);
                } else {
                    changed = true;
                }
            });

            // Auto-expand any subject that has active subtopic filters
            selectedSubjects.forEach((subjectSlug) => {
                const hasActiveSubtopic = (sortedSubtopicsBySubject.get(subjectSlug) || []).some(
                    (subtopic) => selectedSubtopicSet.has(subtopic.slug)
                );
                if (hasActiveSubtopic && !next.has(subjectSlug)) {
                    next.add(subjectSlug);
                    changed = true;
                }
            });

            // If nothing is expanded yet, expand the first selected subject
            if (next.size === 0 && selectedSubjects.length > 0) {
                next.add(selectedSubjects[0]);
                changed = true;
            }

            return changed ? next : prev;
        });
    }, [
        selectedSubjectSet,
        selectedSubjects,
        selectedSubtopicSet,
        sortedSubtopicsBySubject,
    ]);

    const handleSubjectChange = (subjectSlug: string) => {
        const isAlreadySelected = selectedSubjectSet.has(subjectSlug);
        const nextSubjects = isAlreadySelected
            ? selectedSubjects.filter((slug) => slug !== subjectSlug)
            : [...selectedSubjects, subjectSlug];

        if (!isAlreadySelected) {
            setExpandedSubjectSlugs((prev) => new Set([...prev, subjectSlug]));
        } else {
            setExpandedSubjectSlugs((prev) => {
                const next = new Set(prev);
                next.delete(subjectSlug);
                return next;
            });
        }

        updateFilters({ selectedSubjects: nextSubjects });
    };

    const toggleSubjectExpansion = (subjectSlug: string) => {
        setExpandedSubjectSlugs((prev) => {
            const next = new Set(prev);
            if (next.has(subjectSlug)) {
                next.delete(subjectSlug);
            } else {
                next.add(subjectSlug);
            }
            return next;
        });
    };

    const handleSubtopicChange = (subtopicSlug: string) => {
        const nextSubtopics = selectedSubtopics.includes(subtopicSlug)
            ? selectedSubtopics.filter((slug) => slug !== subtopicSlug)
            : [...selectedSubtopics, subtopicSlug];
        updateFilters({ selectedSubtopics: nextSubtopics });
    };

    const handleSubjectBulkToggle = (subjectSlug: string) => {
        const subjectSubtopics = sortedSubtopicsBySubject.get(subjectSlug) || [];
        const subjectSubtopicSlugs = subjectSubtopics
            .map((subtopic) => subtopic?.slug)
            .filter(Boolean) as string[];

        if (subjectSubtopicSlugs.length === 0) return;

        const allSelected = subjectSubtopicSlugs.every((slug) => selectedSubtopicSet.has(slug));

        if (allSelected) {
            const removeSet = new Set(subjectSubtopicSlugs);
            const nextSubtopics = selectedSubtopics.filter((slug) => !removeSet.has(slug));
            updateFilters({ selectedSubtopics: nextSubtopics });
            return;
        }

        const nextSet = new Set(selectedSubtopics);
        subjectSubtopicSlugs.forEach((slug) => nextSet.add(slug));
        updateFilters({ selectedSubtopics: Array.from(nextSet) });
    };

    return (
        <div className="gate-cse-section-wrapper">
            {/* ── Header row: title + description + toggle switch ── */}
            <label htmlFor="gate-cse-toggle" className="flex cursor-pointer items-center justify-between gap-3">
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[color:var(--color-primary-text)]">GATE CSE</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[color:var(--color-text-muted)]">
                        Computer Science &amp; Engineering questions
                    </span>
                </span>
                <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center">
                    <input
                        id="gate-cse-toggle"
                        type="checkbox"
                        checked={Boolean(includeCse)}
                        onChange={(event) => setIncludeCse?.(event.target.checked)}
                        className="peer sr-only"
                        aria-label="GATE CSE questions"
                    />
                    <span className="h-6 w-11 rounded-full bg-[color:var(--color-neutral-border)] transition-colors duration-200 peer-checked:bg-[color:var(--color-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--color-primary-border)] peer-focus-visible:ring-offset-2" />
                    <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-surface)] shadow transition-transform duration-200 peer-checked:translate-x-5" />
                </span>
            </label>

            {/* ── Expanded Topics Section (when includeCse is ON) ── */}
            {includeCse && subjectGroups.length > 0 && (
                <div className="mt-3 border-t border-[color:var(--color-border)] pt-3 space-y-3">
                    {subjectGroups.map((group) => (
                        <section key={group.key} className={group.className}>
                            {group.heading && (
                                <div className="mb-2">
                                    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${group.headingClassName || 'text-[color:var(--color-warning-text)]'}`}>
                                        {group.heading}
                                    </p>
                                    <p className={`mt-1 text-xs opacity-80 ${group.headingClassName || 'text-[color:var(--color-warning-text)]'}`}>
                                        {group.description}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-1">
                                {group.subjects.map((subject) => {
                                    const subjectSlug = subject.slug;
                                    const isSelected = selectedSubjectSet.has(subjectSlug);
                                    const subtopics = sortedSubtopicsBySubject.get(subjectSlug) || [];
                                    const hasSubtopics = subtopics.length > 0;
                                    const isExpanded = expandedSubjectSlugs.has(subjectSlug);
                                    const showSubtopics = isSelected && hasSubtopics && isExpanded;
                                    const subjectSubtopicSlugs = subtopics
                                        .map((subtopic) => subtopic?.slug)
                                        .filter(Boolean);

                                    const allSubtopicsSelected = showSubtopics
                                        && subjectSubtopicSlugs.every((slug) => selectedSubtopicSet.has(slug));

                                    return (
                                        <div key={subjectSlug} className="flex min-w-0 flex-col">
                                            <div className="flex items-center justify-between gap-2 py-1">
                                                <label className="flex min-w-0 cursor-pointer items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={isSelected}
                                                        onChange={() => handleSubjectChange(subjectSlug)}
                                                    />
                                                    <span className="ml-3 flex min-w-0 items-center gap-2">
                                                        <span
                                                            className={`truncate text-sm ${isSelected ? 'font-medium text-[color:var(--color-primary-text)]' : 'text-[color:var(--color-text-muted)]'}`}
                                                            title={subject.label}
                                                        >
                                                            {subject.label}
                                                        </span>
                                                        {subjectSlug === LEGACY_OPTIONAL_SUBJECT_SLUG && (
                                                            <span aria-hidden="true" className="rounded-full border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-warning-text)]">
                                                                Optional
                                                            </span>
                                                        )}
                                                    </span>
                                                </label>

                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    {isSelected && hasSubtopics && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSubjectExpansion(subjectSlug)}
                                                            aria-label={isExpanded ? `Hide ${subject.label} subtopics` : `Show ${subject.label} subtopics`}
                                                            className="rounded border border-[color:var(--color-neutral-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-neutral-text)] hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
                                                        >
                                                            {isExpanded ? 'Hide' : 'Show'}
                                                        </button>
                                                    )}
                                                    {showSubtopics && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSubjectBulkToggle(subjectSlug)}
                                                            aria-label={allSubtopicsSelected ? `Clear all ${subject.label} subtopics` : `Select all ${subject.label} subtopics`}
                                                            className="rounded border border-[color:var(--color-primary-border)] px-2 py-0.5 text-xs font-semibold text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-primary-soft)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
                                                        >
                                                            {allSubtopicsSelected ? 'Clear All' : 'Select All'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {showSubtopics && (
                                                <div className="ml-6 mt-1 space-y-1 border-l-2 border-[color:var(--color-border)] pl-2 pr-1">
                                                    {subtopics.map((subtopic) => (
                                                        <label key={subtopic.slug} className="group/sub flex min-w-0 cursor-pointer items-center py-0.5">
                                                            <input
                                                                type="checkbox"
                                                                className="h-3 w-3 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                                                                checked={selectedSubtopicSet.has(subtopic.slug)}
                                                                onChange={() => handleSubtopicChange(subtopic.slug)}
                                                            />
                                                            <span className="ml-2 truncate text-xs text-[color:var(--color-text-muted)] group-hover/sub:text-[color:var(--color-text)]" title={subtopic.label}>
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
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopicFilter;
