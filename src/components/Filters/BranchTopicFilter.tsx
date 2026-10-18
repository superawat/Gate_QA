import React, { useEffect, useMemo, useState } from "react";
import { FiZap, FiActivity, FiSettings } from "react-icons/fi";
import { FaHardHat } from "react-icons/fa";
import { BranchQuestionService } from "../../services/BranchQuestionService";
import { useFilterActions, useFilterState } from "../../contexts/FilterContext";

const BRANCH_CONFIGS: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    toggleColor: string;
  }
> = {
  ec: {
    title: "GATE EC (ECE)",
    subtitle: "Electronics & Communication questions",
    icon: FiZap,
    accentColor: "text-amber-600 dark:text-amber-400",
    toggleColor: "peer-checked:bg-amber-600",
  },
  ee: {
    title: "GATE EE",
    subtitle: "Electrical Engineering questions",
    icon: FiActivity,
    accentColor: "text-yellow-600 dark:text-yellow-400",
    toggleColor: "peer-checked:bg-yellow-600",
  },
  me: {
    title: "GATE ME",
    subtitle: "Mechanical Engineering questions",
    icon: FiSettings,
    accentColor: "text-blue-600 dark:text-blue-400",
    toggleColor: "peer-checked:bg-blue-600",
  },
  ce: {
    title: "GATE CE",
    subtitle: "Civil Engineering questions",
    icon: FaHardHat,
    accentColor: "text-emerald-600 dark:text-emerald-400",
    toggleColor: "peer-checked:bg-emerald-600",
  },
};

export default function BranchTopicFilter({ branch = "ec" }: { branch: string }) {
  const filterState = useFilterState() as any;
  const filterActions = useFilterActions() as any;

  const track = String(branch || "ec").toLowerCase();
  const config = BRANCH_CONFIGS[track] || BRANCH_CONFIGS.ec;
  const Icon = config.icon;

  // Determine include flag, loading, error, and setters
  const includeStateKey = `include${track.charAt(0).toUpperCase() + track.slice(1)}`;
  const loadingKey = `${track}Loading`;
  const errorKey = `${track}Error`;
  const setIncludeKey = `setInclude${track.charAt(0).toUpperCase() + track.slice(1)}`;

  const includeBranch = Boolean(filterState[includeStateKey]);
  const isLoading = Boolean(filterState[loadingKey]);
  const error = filterState[errorKey] || "";
  const setIncludeBranch = filterActions[setIncludeKey] || (() => {});
  const updateFilters = filterActions.updateFilters;

  const { structuredTags = {}, filters = {} } = filterState;
  const { subjects = [], structuredSubtopics = {} } = structuredTags;
  const { selectedSubjects = [], selectedSubtopics = [] } = filters;

  const [expandedSubjectSlugs, setExpandedSubjectSlugs] = useState<Set<string>>(() => new Set());

  // Filter subjects belonging to this branch (e.g. starting with "ec-" or "ec:")
  const branchSubjects = useMemo(() => {
    if (BranchQuestionService.isLoaded(track)) {
      const branchTags = BranchQuestionService.getStructuredTags(track);
      if (Array.isArray(branchTags?.subjects) && branchTags.subjects.length > 0) {
        return branchTags.subjects.filter((subject: any) => {
          const slug = String(subject?.slug || "");
          if (slug.includes("general-aptitude") || slug === "ga") return false;
          return slug.startsWith(`${track}-`) || slug.startsWith(`${track}:`);
        });
      }
    }
    return subjects.filter((subject: any) => {
      const slug = String(subject?.slug || "");
      if (slug.includes("general-aptitude") || slug === "ga") return false;
      return slug.startsWith(`${track}-`) || slug.startsWith(`${track}:`);
    });
  }, [subjects, track, isLoading]);

  const selectedSubjectSet = useMemo(() => new Set(selectedSubjects), [selectedSubjects]);
  const selectedSubtopicSet = useMemo(() => new Set(selectedSubtopics), [selectedSubtopics]);

  const sortedSubtopicsBySubject = useMemo(() => {
    const nextMap = new Map();
    let subtopicsSource = structuredSubtopics;
    if (BranchQuestionService.isLoaded(track)) {
      const branchTags = BranchQuestionService.getStructuredTags(track);
      if (branchTags?.structuredSubtopics && Object.keys(branchTags.structuredSubtopics).length > 0) {
        subtopicsSource = { ...branchTags.structuredSubtopics, ...structuredSubtopics };
      }
    }
    branchSubjects.forEach((subject: any) => {
      const subjectSlug = subject?.slug;
      if (!subjectSlug) return;
      const subs = subtopicsSource[subjectSlug] || [];
      nextMap.set(
        subjectSlug,
        [...subs].sort((left, right) =>
          String(left?.label || left?.slug || "").localeCompare(
            String(right?.label || right?.slug || "")
          )
        )
      );
    });
    return nextMap;
  }, [branchSubjects, structuredSubtopics, track]);

  useEffect(() => {
    const activeSelected = selectedSubjects.filter((slug: string) =>
      slug.startsWith(`${track}-`) || slug.startsWith(`${track}:`)
    );
    if (activeSelected.length === 0) {
      if (expandedSubjectSlugs.size > 0) {
        setExpandedSubjectSlugs(new Set());
      }
      return;
    }

    setExpandedSubjectSlugs((prev) => {
      let changed = false;
      const next = new Set<string>();

      prev.forEach((slug) => {
        if (selectedSubjectSet.has(slug)) {
          next.add(slug);
        } else {
          changed = true;
        }
      });

      activeSelected.forEach((subjectSlug: string) => {
        const hasActiveSubtopic = (sortedSubtopicsBySubject.get(subjectSlug) || []).some(
          (subtopic: any) => selectedSubtopicSet.has(subtopic.slug)
        );
        if (hasActiveSubtopic && !next.has(subjectSlug)) {
          next.add(subjectSlug);
          changed = true;
        }
      });

      if (next.size === 0 && activeSelected.length > 0) {
        next.add(activeSelected[0]);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [selectedSubjectSet, selectedSubjects, selectedSubtopicSet, sortedSubtopicsBySubject, track]);

  const handleSubjectChange = (subjectSlug: string) => {
    const isAlreadySelected = selectedSubjectSet.has(subjectSlug);
    const nextSubjects = isAlreadySelected
      ? selectedSubjects.filter((slug: string) => slug !== subjectSlug)
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
      ? selectedSubtopics.filter((slug: string) => slug !== subtopicSlug)
      : [...selectedSubtopics, subtopicSlug];
    updateFilters({ selectedSubtopics: nextSubtopics });
  };

  const handleSubjectBulkToggle = (subjectSlug: string) => {
    const subjectSubtopics = sortedSubtopicsBySubject.get(subjectSlug) || [];
    const subjectSubtopicSlugs = subjectSubtopics
      .map((subtopic: any) => subtopic?.slug)
      .filter(Boolean);

    if (subjectSubtopicSlugs.length === 0) return;

    const allSelected = subjectSubtopicSlugs.every((slug: string) => selectedSubtopicSet.has(slug));

    if (allSelected) {
      const removeSet = new Set(subjectSubtopicSlugs);
      const nextSubtopics = selectedSubtopics.filter((slug: string) => !removeSet.has(slug));
      updateFilters({ selectedSubtopics: nextSubtopics });
      return;
    }

    const nextSet = new Set(selectedSubtopics);
    subjectSubtopicSlugs.forEach((slug: string) => nextSet.add(slug));
    updateFilters({ selectedSubtopics: Array.from(nextSet) });
  };

  return (
    <div className={`gate-${track}-section-wrapper`}>
      {/* ── Top row: title + subtitle + toggle ── */}
      <label htmlFor={`gate-${track}-toggle`} className="flex cursor-pointer items-center justify-between gap-3">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-text)]">
            <Icon className={`h-4 w-4 shrink-0 ${config.accentColor}`} />
            <span className={config.accentColor}>{config.title}</span>
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-[color:var(--color-text-muted)]">
            {isLoading ? `Loading ${track.toUpperCase()} papers...` : config.subtitle}
          </span>
        </span>
        <span className="relative inline-flex h-6 w-11 flex-shrink-0 items-center">
          <input
            id={`gate-${track}-toggle`}
            type="checkbox"
            checked={Boolean(includeBranch)}
            onChange={(event) => setIncludeBranch(event.target.checked)}
            className="peer sr-only"
            aria-label={`${config.title} questions`}
          />
          <span
            className={`h-6 w-11 rounded-full bg-[color:var(--color-neutral-border)] transition-colors duration-200 ${config.toggleColor} peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2`}
          />
          <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-surface)] shadow transition-transform duration-200 peer-checked:translate-x-5" />
        </span>
      </label>

      {error ? <p className="mt-2 text-xs font-medium text-[color:var(--color-danger-text)]">{error}</p> : null}

      {/* ── Expanded Branch Subjects Section (visible only when includeBranch is ON) ── */}
      {includeBranch && branchSubjects.length > 0 ? (
        <div className="mt-3 border-t border-[color:var(--color-border)]/50 pt-3 space-y-1">
          {branchSubjects.map((subject: any) => {
            const subjectSlug = subject.slug;
            const isSelected = selectedSubjectSet.has(subjectSlug);
            const subtopics = sortedSubtopicsBySubject.get(subjectSlug) || [];
            const hasSubtopics = subtopics.length > 0;
            const isExpanded = expandedSubjectSlugs.has(subjectSlug);
            const showSubtopics = isSelected && hasSubtopics && isExpanded;
            const subjectSubtopicSlugs = subtopics
              .map((subtopic: any) => subtopic?.slug)
              .filter(Boolean);

            const allSubtopicsSelected =
              showSubtopics && subjectSubtopicSlugs.every((slug: string) => selectedSubtopicSet.has(slug));

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
                    <span
                      className={`ml-3 truncate text-sm ${
                        isSelected
                          ? "font-medium text-[color:var(--color-text)]"
                          : "text-[color:var(--color-text-muted)]"
                      }`}
                      title={subject.label}
                    >
                      {subject.label}
                    </span>
                  </label>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {isSelected && hasSubtopics && (
                      <button
                        type="button"
                        onClick={() => toggleSubjectExpansion(subjectSlug)}
                        aria-label={isExpanded ? `Hide ${subject.label} subtopics` : `Show ${subject.label} subtopics`}
                        className="rounded border border-[color:var(--color-neutral-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-neutral-text)] hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2"
                      >
                        {isExpanded ? "Hide" : "Show"}
                      </button>
                    )}
                    {showSubtopics && (
                      <button
                        type="button"
                        onClick={() => handleSubjectBulkToggle(subjectSlug)}
                        aria-label={allSubtopicsSelected ? `Clear all ${subject.label} subtopics` : `Select all ${subject.label} subtopics`}
                        className="rounded border border-[color:var(--color-primary-border)] px-2 py-0.5 text-xs font-semibold text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-primary-soft)] focus:outline-none focus:ring-2"
                      >
                        {allSubtopicsSelected ? "Clear All" : "Select All"}
                      </button>
                    )}
                  </div>
                </div>

                {showSubtopics && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-[color:var(--color-border)] pl-2 pr-1">
                    {subtopics.map((subtopic: any) => (
                      <label key={subtopic.slug} className="group/sub flex min-w-0 cursor-pointer items-center py-0.5">
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
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
      ) : includeBranch && isLoading ? (
        <div className="mt-3 border-t border-[color:var(--color-border)]/50 pt-3">
          <div className="flex items-center gap-2 py-1 text-xs text-[color:var(--color-text-muted)] animate-pulse">
            <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Loading {config.title} topics...
          </div>
        </div>
      ) : null}
    </div>
  );
}
