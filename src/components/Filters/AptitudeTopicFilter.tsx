import React, { useCallback, useMemo, useState } from "react";
import { useFilterState, useFilterActions } from "../../contexts/FilterContext";
import { useAptitudeEnabled } from "../../utils/aptitudePreference";

const APTITUDE_SUBJECT_SLUGS = new Set(["english", "mathematics", "reasoning"]);

type SubjectOption = {
  slug: string;
  label: string;
  count?: number;
};

type SubtopicOption = {
  slug: string;
  label: string;
  count?: number;
};

type StructuredSubtopics = Record<string, SubtopicOption[]>;

type FilterStateShape = {
  structuredTags?: {
    subjects?: SubjectOption[];
    structuredSubtopics?: StructuredSubtopics;
  };
  filters?: {
    selectedSubjects?: string[];
    selectedSubtopics?: string[];
  };
  aptitudeLoading?: boolean;
  aptitudeError?: string;
};

type FilterActionsShape = {
  updateFilters: (nextFilters: {
    selectedSubjects?: string[];
    selectedSubtopics?: string[];
  }) => void;
};

/**
 * Dedicated Aptitude Practice section for the filter sidebar.
 * Renders its own toggle + subject/subtopic checkboxes.
 * Completely hidden subjects when toggle is OFF.
 */
const AptitudeTopicFilter = () => {
  const [aptitudeEnabled, setAptitudeEnabled] = useAptitudeEnabled() as [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ];
  const {
    structuredTags,
    filters,
    aptitudeLoading = false,
    aptitudeError = "",
  } = useFilterState() as FilterStateShape;
  const { updateFilters } = useFilterActions() as FilterActionsShape;

  const { subjects = [], structuredSubtopics = {} } = structuredTags || {};
  const { selectedSubjects = [], selectedSubtopics = [] } = filters || {};

  const [expandedSubjectSlug, setExpandedSubjectSlug] = useState<string | null>(null);
  const [showBetaInfo, setShowBetaInfo] = useState(false);

  const toggleBetaInfo = useCallback(() => {
    setShowBetaInfo((prev) => !prev);
  }, []);

  const aptitudeSubjects = useMemo(
    () => subjects.filter((subject) => APTITUDE_SUBJECT_SLUGS.has(subject?.slug)),
    [subjects]
  );

  const selectedSubjectSet = useMemo(() => new Set(selectedSubjects), [selectedSubjects]);
  const selectedSubtopicSet = useMemo(() => new Set(selectedSubtopics), [selectedSubtopics]);

  const sortedSubtopicsBySubject = useMemo(() => {
    const map = new Map<string, SubtopicOption[]>();
    aptitudeSubjects.forEach((subject) => {
      const slug = subject?.slug;
      if (!slug) {
        return;
      }
      const subtopics = structuredSubtopics[slug] || [];
      map.set(
        slug,
        [...subtopics].sort((left, right) =>
          String(left?.label || left?.slug || "").localeCompare(
            String(right?.label || right?.slug || "")
          )
        )
      );
    });
    return map;
  }, [aptitudeSubjects, structuredSubtopics]);

  const handleSubjectChange = (subjectSlug: string) => {
    const isSelected = selectedSubjectSet.has(subjectSlug);
    const nextSubjects = isSelected
      ? selectedSubjects.filter((subject) => subject !== subjectSlug)
      : [...selectedSubjects, subjectSlug];

    if (isSelected) {
      if (expandedSubjectSlug === subjectSlug) {
        setExpandedSubjectSlug(nextSubjects.find((subject) => APTITUDE_SUBJECT_SLUGS.has(subject)) || null);
      }
    } else {
      setExpandedSubjectSlug(subjectSlug);
    }

    updateFilters({ selectedSubjects: nextSubjects });
  };

  const handleSubtopicChange = (subtopicSlug: string) => {
    const nextSubtopics = selectedSubtopics.includes(subtopicSlug)
      ? selectedSubtopics.filter((subtopic) => subtopic !== subtopicSlug)
      : [...selectedSubtopics, subtopicSlug];
    updateFilters({ selectedSubtopics: nextSubtopics });
  };

  const handleBulkToggle = (subjectSlug: string) => {
    const subtopics = sortedSubtopicsBySubject.get(subjectSlug) || [];
    const slugs = subtopics.map((subtopic) => subtopic?.slug).filter(Boolean) as string[];
    if (slugs.length === 0) {
      return;
    }

    const allSelected = slugs.every((slug) => selectedSubtopicSet.has(slug));
    if (allSelected) {
      const removeSet = new Set(slugs);
      updateFilters({
        selectedSubtopics: selectedSubtopics.filter((subtopic) => !removeSet.has(subtopic)),
      });
      return;
    }

    const nextSet = new Set(selectedSubtopics);
    slugs.forEach((slug) => nextSet.add(slug));
    updateFilters({ selectedSubtopics: Array.from(nextSet) });
  };

  const aptitudeCount = aptitudeSubjects.length > 0 && aptitudeEnabled
    ? aptitudeSubjects.reduce((sum, subject) => {
      const subtopics = structuredSubtopics[subject?.slug] || [];
      return sum + subtopics.reduce((accumulator, subtopic) => accumulator + (subtopic?.count || 0), 0);
    }, 0)
    : 0;

  return (
    <div className="aptitude-section-wrapper">
      {/* ── Header row: title + badges + toggle ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              Aptitude Practice
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-[color:var(--color-warning-text)]">
              <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.706c.891 0 1.439-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
              Beta
            </span>
            {aptitudeEnabled && !aptitudeLoading && aptitudeCount > 0 ? (
              <span className="rounded-full bg-pink-100 px-1.5 py-0.5 text-[10px] font-semibold text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                {aptitudeCount.toLocaleString()} Qs
              </span>
            ) : null}
            <button
              type="button"
              onClick={toggleBetaInfo}
              aria-label={showBetaInfo ? "Hide beta info" : "Show beta info"}
              aria-expanded={showBetaInfo}
              id="aptitude-beta-info-btn"
              className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold leading-none transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--color-warning-border)] ${
                showBetaInfo
                  ? "border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-text)] text-[color:var(--color-surface)] shadow-sm"
                  : "border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-text)] hover:opacity-80"
              }`}
            >
              i
            </button>
          </div>
          <p className="mt-0.5 text-[11px] leading-tight text-[color:var(--color-text-muted)]">
            {aptitudeEnabled
              ? (aptitudeLoading ? "Loading aptitude questions..." : "English, Mathematics & Reasoning")
              : "Toggle on to add competitive exam questions"}
          </p>
          {aptitudeError ? (
            <p className="mt-1 text-[11px] font-semibold text-[color:var(--color-danger-text)]">{aptitudeError}</p>
          ) : null}
        </div>

          <button
            type="button"
            role="switch"
            id="aptitude-toggle"
            aria-label="Enable Aptitude Practice"
            aria-checked={aptitudeEnabled}
            onClick={() => setAptitudeEnabled((value) => !value)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 ${aptitudeEnabled
              ? "bg-pink-500"
              : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${aptitudeEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* ── Inline info banner (fully readable, no overflow clipping) ── */}
      {showBetaInfo ? (
        <div
          id="aptitude-beta-info-popup"
          role="status"
          className="mt-2.5 rounded-lg border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] p-2.5 shadow-sm"
        >
          <div className="flex items-start gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-warning-border)]">
              <svg className="h-3 w-3 text-[color:var(--color-warning-text)]" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.706c.891 0 1.439-.99.982-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold leading-tight text-[color:var(--color-warning-text)]">
                Section Under Development
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--color-text)]">
                This section is in <strong className="font-semibold text-[color:var(--color-warning-text)]">Beta</strong>. Question structures are still being normalized — some questions may not display in the correct syntax or format.
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--color-text-muted)]">
                You can still practice, but the experience is under active development.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBetaInfo(false)}
              aria-label="Dismiss info"
              className="-mr-0.5 -mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[color:var(--color-warning-text)] transition-colors hover:bg-[color:var(--color-warning-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-warning-border)]"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      {aptitudeEnabled && aptitudeSubjects.length > 0 ? (
        <div className="mt-3 space-y-1 border-t border-pink-200/40 pt-3 dark:border-pink-700/30">
          {aptitudeSubjects.map((subject) => {
            const slug = subject.slug;
            const isSelected = selectedSubjectSet.has(slug);
            const subtopics = sortedSubtopicsBySubject.get(slug) || [];
            const hasSubtopics = subtopics.length > 0;
            const isExpanded = expandedSubjectSlug === slug;
            const showSubtopics = isSelected && hasSubtopics && isExpanded;
            const subjectSubtopicSlugs = subtopics
              .map((subtopic) => subtopic?.slug)
              .filter(Boolean) as string[];
            const allSubtopicsSelected = showSubtopics
              && subjectSubtopicSlugs.every((subtopicSlug) => selectedSubtopicSet.has(subtopicSlug));

            return (
              <div key={slug} className="flex min-w-0 flex-col">
                <div className="flex items-center justify-between gap-2 py-1">
                  <label className="flex min-w-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      checked={isSelected}
                      onChange={() => handleSubjectChange(slug)}
                    />
                    <span className="ml-3 flex min-w-0 items-center gap-2">
                      <span
                        className={`truncate text-sm ${isSelected ? "font-medium text-pink-700 dark:text-pink-300" : "text-[color:var(--color-text-muted)]"}`}
                        title={subject.label}
                      >
                        {subject.label}
                      </span>
                    </span>
                  </label>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {isSelected && hasSubtopics ? (
                      <button
                        type="button"
                        onClick={() => setExpandedSubjectSlug(isExpanded ? null : slug)}
                        aria-label={isExpanded ? `Hide ${subject.label} subtopics` : `Show ${subject.label} subtopics`}
                        className="rounded border border-pink-300/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:border-pink-600/40 dark:text-pink-400 dark:hover:bg-pink-900/30"
                      >
                        {isExpanded ? "Hide" : "Show"}
                      </button>
                    ) : null}
                    {showSubtopics ? (
                      <button
                        type="button"
                        onClick={() => handleBulkToggle(slug)}
                        aria-label={allSubtopicsSelected
                          ? `Clear all ${subject.label} subtopics`
                          : `Select all ${subject.label} subtopics`}
                        className="rounded border border-pink-400/50 px-2 py-0.5 text-xs font-semibold text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:border-pink-500/40 dark:text-pink-400 dark:hover:bg-pink-900/30"
                      >
                        {allSubtopicsSelected ? "Clear All" : "Select All"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {showSubtopics ? (
                  <div className="ml-6 mt-1 max-h-36 space-y-1 overflow-y-auto border-l-2 border-pink-200/60 pl-2 pr-1 dark:border-pink-700/40">
                    {subtopics.map((subtopic) => (
                      <label key={subtopic.slug} className="group/sub flex min-w-0 cursor-pointer items-center py-0.5">
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
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
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default AptitudeTopicFilter;
