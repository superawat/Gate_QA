import React, { useEffect, useMemo, useState } from "react";
import { useFilterActions, useFilterState } from "../../contexts/FilterContext";

export default function DaToggle() {
  const {
    includeDa,
    daLoading,
    daError,
    structuredTags = {},
    filters = {},
  } = useFilterState();
  const { setIncludeDa, updateFilters } = useFilterActions();

  const { subjects = [], structuredSubtopics = {} } = structuredTags;
  const { selectedSubjects = [], selectedSubtopics = [] } = filters;

  const [expandedSubjectSlugs, setExpandedSubjectSlugs] = useState(() => new Set());

  const daSubjects = useMemo(
    () => subjects.filter((subject) => subject?.slug?.startsWith("da:")),
    [subjects]
  );

  const selectedSubjectSet = useMemo(() => new Set(selectedSubjects), [selectedSubjects]);
  const selectedSubtopicSet = useMemo(() => new Set(selectedSubtopics), [selectedSubtopics]);

  const sortedSubtopicsBySubject = useMemo(() => {
    const nextMap = new Map();
    daSubjects.forEach((subject) => {
      const subjectSlug = subject?.slug;
      if (!subjectSlug) return;
      const subtopics = structuredSubtopics[subjectSlug] || [];
      nextMap.set(
        subjectSlug,
        [...subtopics].sort((left, right) =>
          String(left?.label || left?.slug || "").localeCompare(
            String(right?.label || right?.slug || "")
          )
        )
      );
    });
    return nextMap;
  }, [daSubjects, structuredSubtopics]);

  useEffect(() => {
    const activeDaSelected = selectedSubjects.filter((slug) => slug.startsWith("da:"));
    if (activeDaSelected.length === 0) {
      if (expandedSubjectSlugs.size > 0) {
        setExpandedSubjectSlugs(new Set());
      }
      return;
    }

    setExpandedSubjectSlugs((prev) => {
      let changed = false;
      const next = new Set();

      prev.forEach((slug) => {
        if (selectedSubjectSet.has(slug)) {
          next.add(slug);
        } else {
          changed = true;
        }
      });

      activeDaSelected.forEach((subjectSlug) => {
        const hasActiveSubtopic = (sortedSubtopicsBySubject.get(subjectSlug) || []).some(
          (subtopic) => selectedSubtopicSet.has(subtopic.slug)
        );
        if (hasActiveSubtopic && !next.has(subjectSlug)) {
          next.add(subjectSlug);
          changed = true;
        }
      });

      if (next.size === 0 && activeDaSelected.length > 0) {
        next.add(activeDaSelected[0]);
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

  const handleSubjectChange = (subjectSlug) => {
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

  const toggleSubjectExpansion = (subjectSlug) => {
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

  const handleSubtopicChange = (subtopicSlug) => {
    const nextSubtopics = selectedSubtopics.includes(subtopicSlug)
      ? selectedSubtopics.filter((slug) => slug !== subtopicSlug)
      : [...selectedSubtopics, subtopicSlug];
    updateFilters({ selectedSubtopics: nextSubtopics });
  };

  const handleSubjectBulkToggle = (subjectSlug) => {
    const subjectSubtopics = sortedSubtopicsBySubject.get(subjectSlug) || [];
    const subjectSubtopicSlugs = subjectSubtopics
      .map((subtopic) => subtopic?.slug)
      .filter(Boolean);

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
    <div className="gate-da-section-wrapper">
      {/* ── Top row: title + subtitle + toggle ── */}
      <label htmlFor="gate-da-toggle" className="flex cursor-pointer items-center justify-between gap-3">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[color:var(--color-purple-text)]">GATE DA</span>
          <span className="mt-0.5 block text-xs leading-5 text-[color:var(--color-text-muted)]">
            {daLoading ? "Loading 2024-2026 DA papers..." : "Data Science & AI questions"}
          </span>
        </span>
        <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center">
          <input
            id="gate-da-toggle"
            type="checkbox"
            checked={Boolean(includeDa)}
            onChange={(event) => setIncludeDa(event.target.checked)}
            className="peer sr-only"
            aria-label="GATE DA questions"
          />
          <span className="h-6 w-11 rounded-full bg-[color:var(--color-neutral-border)] transition-colors duration-200 peer-checked:bg-[color:var(--color-purple-text)] peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--color-purple-text)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[color:var(--color-purple-soft)]" />
          <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-surface)] shadow transition-transform duration-200 peer-checked:translate-x-5" />
        </span>
      </label>

      {daError ? <p className="mt-2 text-xs font-medium text-[color:var(--color-danger-text)]">{daError}</p> : null}

      {/* ── Expanded DA Subjects Section (visible only when includeDa is ON) ── */}
      {includeDa && daSubjects.length > 0 ? (
        <div className="mt-3 border-t border-[color:var(--color-purple-border)]/40 pt-3 space-y-1">
          {daSubjects.map((subject) => {
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
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={isSelected}
                        onChange={() => handleSubjectChange(subjectSlug)}
                      />
                      <span className="ml-3 flex min-w-0 items-center gap-2">
                        <span
                          className={`truncate text-sm ${isSelected ? "font-medium text-[color:var(--color-purple-text)]" : "text-[color:var(--color-text-muted)]"}`}
                          title={subject.label}
                        >
                          {subject.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="rounded-full border border-[color:var(--color-purple-border)] bg-[color:var(--color-purple-soft)] px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-[color:var(--color-purple-text)]"
                        >
                          DA
                        </span>
                      </span>
                    </label>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {isSelected && hasSubtopics && (
                        <button
                          type="button"
                          onClick={() => toggleSubjectExpansion(subjectSlug)}
                          aria-label={isExpanded ? `Hide ${subject.label} subtopics` : `Show ${subject.label} subtopics`}
                          className="rounded border border-[color:var(--color-purple-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-purple-text)] hover:bg-[color:var(--color-purple-soft)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-purple-border)]"
                        >
                          {isExpanded ? "Hide" : "Show"}
                        </button>
                      )}
                      {showSubtopics && (
                        <button
                          type="button"
                          onClick={() => handleSubjectBulkToggle(subjectSlug)}
                          aria-label={allSubtopicsSelected ? `Clear all ${subject.label} subtopics` : `Select all ${subject.label} subtopics`}
                          className="rounded border border-[color:var(--color-purple-border)] px-2 py-0.5 text-xs font-semibold text-[color:var(--color-purple-text)] hover:bg-[color:var(--color-purple-soft)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-purple-border)]"
                        >
                          {allSubtopicsSelected ? "Clear All" : "Select All"}
                        </button>
                      )}
                    </div>
                  </div>

                  {showSubtopics && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-[color:var(--color-purple-border)]/60 pl-2 pr-1">
                      {subtopics.map((subtopic) => (
                        <label key={subtopic.slug} className="group/sub flex min-w-0 cursor-pointer items-center py-0.5">
                          <input
                            type="checkbox"
                            className="h-3 w-3 rounded border-gray-300 text-purple-500 focus:ring-purple-400"
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
      ) : null}
    </div>
  );
}
