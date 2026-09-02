import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronRight,
  FiCheckSquare,
  FiMinusSquare,
  FiSquare,
  FiPlay,
  FiRotateCcw,
  FiPlus,
  FiMinus,
  FiColumns,
  FiMaximize2,
  FiMinimize2,
  FiCheck,
  FiLayers,
  FiAward,
} from "react-icons/fi";
import { PRACTICE_ROUTE } from "../../utils/routes";

const AVAILABLE_CUSTOM_COLUMNS = [
  { id: "marks", label: "Marks Range", defaultVisible: false },
  { id: "priority", label: "Priority", defaultVisible: false },
  { id: "mock", label: "Mock", defaultVisible: false },
  { id: "mockCount", label: "Mock Count", defaultVisible: false },
];

const formatMarksRange = (val) => {
  if (!val) return "";
  return String(val).replace(/\s*marks?/gi, "").trim();
};

const getRatioBadgeProps = (completedCount, totalCount) => {
  const total = Math.max(1, totalCount || 1);
  const completed = Math.max(0, completedCount || 0);
  const pct = Math.round((completed / total) * 100);
  const isComplete = completedCount >= totalCount && totalCount > 0;

  // 0% -> Default neutral dark gray (unchanged)
  if (completedCount === 0) {
    return {
      className:
        "bg-[color:var(--color-bg)] border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
      style: undefined,
      iconType: "empty",
      iconColor: undefined,
    };
  }

  // 100% -> Fully completed solid green badge
  if (isComplete) {
    return {
      className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-extrabold shadow-xs",
      style: undefined,
      iconType: "check",
      iconColor: "text-emerald-400",
    };
  }

  // 4-Stage Progressive Palette: Yellow (<=25%) -> Orange (26-50%) -> Pink (51-75%) -> Green (76-99%)
  if (pct <= 25) {
    // 25% Stage (e.g. 1/5 = 20%, 1/4 = 25%) -> Yellow
    return {
      className: "border-yellow-500/40 text-yellow-400 hover:border-yellow-500/60 font-bold",
      style: {
        background: `linear-gradient(to right, rgba(234, 179, 8, 0.18) ${pct}%, var(--color-bg) ${pct}%)`,
      },
      iconType: "minus",
      iconColor: "text-yellow-400",
    };
  } else if (pct <= 50) {
    // 50% Stage (e.g. 2/5 = 40%, 2/4 = 50%, 1/3 = 33.3%) -> Orange
    return {
      className: "border-orange-500/40 text-orange-400 hover:border-orange-500/60 font-bold",
      style: {
        background: `linear-gradient(to right, rgba(249, 115, 22, 0.18) ${pct}%, var(--color-bg) ${pct}%)`,
      },
      iconType: "minus",
      iconColor: "text-orange-400",
    };
  } else if (pct <= 75) {
    // 75% Stage (e.g. 3/5 = 60%, 2/3 = 66.7%, 3/4 = 75%) -> Pink
    return {
      className: "border-pink-500/40 text-pink-400 hover:border-pink-500/60 font-bold",
      style: {
        background: `linear-gradient(to right, rgba(244, 114, 182, 0.18) ${pct}%, var(--color-bg) ${pct}%)`,
      },
      iconType: "minus",
      iconColor: "text-pink-400",
    };
  } else {
    // 76-99% Stage (e.g. 4/5 = 80%, 5/6 = 83.3%) -> Green
    return {
      className: "border-emerald-500/40 text-emerald-400 hover:border-emerald-500/60 font-bold",
      style: {
        background: `linear-gradient(to right, rgba(16, 185, 129, 0.18) ${pct}%, var(--color-bg) ${pct}%)`,
      },
      iconType: "minus",
      iconColor: "text-emerald-400",
    };
  }
};

export default function TrackerHierarchicalTable({
  subjects,
  topicMetricsMap,
  subjectMetricsMap,
  store,
  activeTrack,
  searchQuery = "",
  statusFilter = "all",
  visibleColumns = [],
  loading = false,
  onToggleTheory,
  onBulkTheoryComplete,
  onSetRevisionStatus,
  onBulkRevisionStatus,
  onIncrementRevision,
  onSetCustomField,
  onBulkCustomField,
  onOpenReset,
  onUpdatePreferences,
}) {
  const navigate = useNavigate();

  // Expand / Collapse state (Subjects and topics collapsed by default)
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Reset expand state when the active track changes (so new track starts collapsed = fast first paint)
  const prevTrackRef = useRef(activeTrack);
  useEffect(() => {
    if (prevTrackRef.current !== activeTrack) {
      prevTrackRef.current = activeTrack;
      setExpandedSubjects({});
      setExpandedTopics({});
    }
  }, [activeTrack]);

  // Auto-expand subjects and topics when a search/filter is NEWLY applied.
  // Use refs to detect transitions (empty→non-empty), not on every subjects array identity change.
  const prevSearchRef = useRef(searchQuery);
  const prevStatusRef = useRef(statusFilter);
  useEffect(() => {
    const searchActive = Boolean(searchQuery && searchQuery.trim());
    const filterActive = Boolean(statusFilter && statusFilter !== "all");
    const wasSearchActive = Boolean(prevSearchRef.current && prevSearchRef.current.trim());
    const wasFilterActive = Boolean(prevStatusRef.current && prevStatusRef.current !== "all");

    prevSearchRef.current = searchQuery;
    prevStatusRef.current = statusFilter;

    // Only expand when the filter/search just became active (not on every subjects array rebuild)
    if ((searchActive && !wasSearchActive) || (filterActive && !wasFilterActive)) {
      const newSubjects = {};
      const newTopics = {};
      subjects.forEach((s) => {
        newSubjects[s.id] = true;
        s.topics.forEach((t) => {
          newTopics[t.id] = true;
        });
      });
      setExpandedSubjects(newSubjects);
      setExpandedTopics(newTopics);
    }
    // Also keep expanded when filter remains active and subjects list changes (e.g. narrower search)
    if (searchActive || filterActive) {
      const newSubjects = {};
      const newTopics = {};
      subjects.forEach((s) => {
        newSubjects[s.id] = true;
        s.topics.forEach((t) => {
          newTopics[t.id] = true;
        });
      });
      setExpandedSubjects(newSubjects);
      setExpandedTopics(newTopics);
    }
  }, [searchQuery, statusFilter, subjects]);

  // Toggle subject expand
  const toggleSubjectExpand = useCallback((subjectId) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  }, []);

  // Toggle topic expand
  const toggleTopicExpand = useCallback((topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  }, []);

  // Expand All / Collapse All
  const areAllExpanded = useMemo(() => {
    return subjects.every((s) => expandedSubjects[s.id]);
  }, [subjects, expandedSubjects]);

  const handleToggleExpandAll = useCallback(() => {
    const nextState = !areAllExpanded;
    const newSubjects = {};
    const newTopics = {};
    subjects.forEach((s) => {
      newSubjects[s.id] = nextState;
      s.topics.forEach((t) => {
        if (t.subtopics && t.subtopics.length > 0) {
          newTopics[t.id] = nextState;
        }
      });
    });
    setExpandedSubjects(newSubjects);
    setExpandedTopics(newTopics);
  }, [areAllExpanded, subjects]);

  // Toggle optional custom column
  const handleToggleColumn = useCallback((colId) => {
    const current = new Set(visibleColumns);
    if (current.has(colId)) {
      current.delete(colId);
    } else {
      current.add(colId);
    }
    const updated = Array.from(current);
    if (onUpdatePreferences) {
      onUpdatePreferences({ visibleColumns: updated });
    }
  }, [visibleColumns, onUpdatePreferences]);

  // Deep link practice handlers
  const handlePracticeSubject = useCallback((subject) => {
    if (subject.track === "da") {
      navigate(`${PRACTICE_ROUTE}?subjects=da:${subject.slug}&hideSolved=1`);
    } else {
      const slugs = subject.canonicalSubjectSlugs?.length ? subject.canonicalSubjectSlugs.join(",") : subject.slug;
      navigate(`${PRACTICE_ROUTE}?subjects=${encodeURIComponent(slugs)}&hideSolved=1`);
    }
  }, [navigate]);

  const handlePracticeTopic = useCallback((topic, subject) => {
    if (subject.track === "da") {
      navigate(`${PRACTICE_ROUTE}?subjects=da:${topic.subjectSlug || subject.slug}&subtopics=${topic.primaryTopicTag}&hideSolved=1`);
    } else {
      navigate(`${PRACTICE_ROUTE}?subjects=${topic.subjectSlug || subject.slug}&subtopics=${topic.primaryTopicTag}&hideSolved=1`);
    }
  }, [navigate]);

  const isColVisible = (colId) => visibleColumns.includes(colId);

  // ─── Memoized per-subject aggregations ─────────────────────────────────────
  // Computes topic-level theory completion, topic-level revision status,
  // derived full-subject revision count (when all topics are revised), and manual subject counter.
  const subjectAggregations = useMemo(() => {
    const map = new Map();
    for (const subject of subjects) {
      const totalTopicsCount = subject.topics.length;
      let completedTopicsCount = 0;
      let revisedTopicsCount = 0;

      // Calculate theory and revision status per topic
      for (const t of subject.topics) {
        const isTopicTheoryDone =
          Boolean(store?.theory?.[t.id]?.isCompleted) ||
          (Array.isArray(t.subtopics) &&
            t.subtopics.length > 0 &&
            t.subtopics.every((st) => Boolean(store?.theory?.[st.id]?.isCompleted)));
        if (isTopicTheoryDone) {
          completedTopicsCount++;
        }

        const tRevEvents = Array.isArray(store?.revisions?.[t.id]) ? store.revisions[t.id] : [];
        const stRevMax =
          Array.isArray(t.subtopics) && t.subtopics.length > 0
            ? Math.max(
                0,
                ...t.subtopics.map((st) =>
                  Array.isArray(store?.revisions?.[st.id]) ? store.revisions[st.id].length : 0
                )
              )
            : 0;
        const topicRevCount = Math.max(tRevEvents.length, stRevMax);
        if (topicRevCount > 0) {
          revisedTopicsCount++;
        }
      }

      // If all topics in the subject are revised at least 1 time -> minTopicRevisionCount >= 1
      const minTopicRevisionCount =
        totalTopicsCount > 0
          ? Math.min(
              ...subject.topics.map((t) => {
                const tRevEvents = Array.isArray(store?.revisions?.[t.id]) ? store.revisions[t.id] : [];
                const stRevMax =
                  Array.isArray(t.subtopics) && t.subtopics.length > 0
                    ? Math.max(
                        0,
                        ...t.subtopics.map((st) =>
                          Array.isArray(store?.revisions?.[st.id]) ? store.revisions[st.id].length : 0
                        )
                      )
                    : 0;
                return Math.max(tRevEvents.length, stRevMax);
              })
            )
          : 0;

      // Subject-level manual revisions recorded directly on subject.id
      const subjectManualEvents = Array.isArray(store?.revisions?.[subject.id])
        ? store.revisions[subject.id]
        : [];
      const subjectManualCount = subjectManualEvents.length;

      // Total subject revision count: topic full passes + manual subject increments
      const subjectRevisionCount = minTopicRevisionCount + subjectManualCount;

      const isSubjectAllTheoryDone =
        totalTopicsCount > 0 && completedTopicsCount === totalTopicsCount;
      const isSubjectAllTopicsRevised =
        totalTopicsCount > 0 && revisedTopicsCount === totalTopicsCount;
      const isSubjectRevised = subjectRevisionCount > 0 || isSubjectAllTopicsRevised;

      map.set(subject.id, {
        totalTopicsCount,
        completedTopicsCount,
        isSubjectAllTheoryDone,
        revisedTopicsCount,
        isSubjectAllTopicsRevised,
        minTopicRevisionCount,
        subjectManualCount,
        subjectRevisionCount,
        isSubjectRevised,
      });
    }
    return map;
  }, [subjects, store]);

  // ─── Loading skeleton (shown during startTransition) ────────────────────────
  if (loading) {
    return (
      <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-[color:var(--color-border)] flex items-center justify-between bg-[color:var(--color-surface-muted)]">
          <div className="h-4 w-48 rounded-md bg-[color:var(--color-border)] animate-pulse" />
          <div className="h-7 w-24 rounded-xl bg-[color:var(--color-border)] animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 rounded-md bg-[color:var(--color-border)] animate-pulse" style={{ width: `${40 + (i % 3) * 15}%` }} />
              <div className="h-4 w-12 rounded-md bg-[color:var(--color-border)] animate-pulse" />
              <div className="h-4 w-12 rounded-md bg-[color:var(--color-border)] animate-pulse" />
              <div className="h-4 w-20 rounded-md bg-[color:var(--color-border)] animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-[color:var(--color-border)] flex flex-wrap items-center justify-between gap-3 bg-[color:var(--color-surface-muted)]">
        <div className="flex items-center gap-2">
          <FiLayers className="w-4 h-4 text-[color:var(--color-primary)]" />
          <span className="text-xs sm:text-sm font-bold text-[color:var(--color-text)]">
            Syllabus &amp; Preparation Table
          </span>
          <span className="text-xs text-[color:var(--color-text-muted)] hidden sm:inline">
            ({subjects.length} Subjects)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Expand/Collapse All Button */}
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-bg)] transition-colors"
          >
            {areAllExpanded ? (
              <>
                <FiMinimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Collapse All</span>
              </>
            ) : (
              <>
                <FiMaximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Expand All</span>
              </>
            )}
          </button>

          {/* Custom Columns Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-bg)] transition-colors"
              title="Add or remove optional tracking columns"
            >
              <FiColumns className="w-3.5 h-3.5" />
              <span>+ Columns</span>
            </button>

            {showColumnMenu && (
              <div
                className="absolute right-0 top-full mt-1.5 z-40 w-52 rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-xl p-2 text-xs"
                onMouseLeave={() => setShowColumnMenu(false)}
              >
                <p className="font-bold text-[color:var(--color-text)] px-2 py-1 border-b border-[color:var(--color-border)] mb-1">
                  Custom Columns
                </p>
                {AVAILABLE_CUSTOM_COLUMNS.map((col) => {
                  const checked = isColVisible(col.id);
                  return (
                    <label
                      key={col.id}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[color:var(--color-surface-muted)] cursor-pointer select-none text-[color:var(--color-text)]"
                    >
                      <span>{col.label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleColumn(col.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 bg-[color:var(--color-surface)] border-[color:var(--color-border)] w-3.5 h-3.5"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hierarchical Table Container with Sticky First Column & Smooth Touch Momentum */}
      <div className="overflow-x-auto overscroll-x-contain scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-[760px]">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[11px] font-bold text-[color:var(--color-text-muted)] uppercase tracking-wider">
              <th scope="col" className="py-3 px-3 sm:px-4 sticky left-0 z-20 bg-[color:var(--color-surface-muted)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[190px] sm:min-w-[260px] md:min-w-[320px]">
                Syllabus (Subject / Topic)
              </th>
              <th scope="col" className="py-3 px-3 text-center w-24">
                Theory
              </th>
              <th scope="col" className="py-3 px-3 text-center w-20">
                Revised
              </th>
              <th scope="col" className="py-3 px-3 text-center w-28">
                Revision Count
              </th>
              <th scope="col" className="py-3 px-4 text-center w-36">
                PYQs Practiced
              </th>
              <th scope="col" className="py-3 px-3 text-center w-20">
                Accuracy
              </th>
              {isColVisible("marks") && (
                <th scope="col" className="py-3 px-3 text-center w-28">
                  Marks
                </th>
              )}
              {isColVisible("priority") && (
                <th scope="col" className="py-3 px-3 text-center w-28">
                  Priority
                </th>
              )}
              {isColVisible("mock") && (
                <th scope="col" className="py-3 px-3 text-center w-20">
                  Mock
                </th>
              )}
              {isColVisible("mockCount") && (
                <th scope="col" className="py-3 px-3 text-center w-28">
                  Mock Count
                </th>
              )}
              <th scope="col" className="py-3 px-4 text-right w-44">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-border)] text-xs">
            {subjects.map((subject) => {
              const isSubjectExpanded = Boolean(expandedSubjects[subject.id]);
              const subjectMetrics = subjectMetricsMap ? subjectMetricsMap.get(subject.id) : null;
              
              const subjectTopics = subject.topics;
              const matchingTopicMetrics = subjectTopics
                .map((t) => topicMetricsMap.get(t.id))
                .filter(Boolean);

              // Use pre-computed memoized aggregations (topic-based counts + subject revision counter)
              const agg = subjectAggregations.get(subject.id) || {
                totalTopicsCount: subject.topics.length,
                completedTopicsCount: 0,
                isSubjectAllTheoryDone: false,
                revisedTopicsCount: 0,
                isSubjectAllTopicsRevised: false,
                minTopicRevisionCount: 0,
                subjectManualCount: 0,
                subjectRevisionCount: 0,
                isSubjectRevised: false,
              };
              const {
                totalTopicsCount,
                completedTopicsCount,
                isSubjectAllTheoryDone,
                revisedTopicsCount,
                subjectManualCount,
                subjectRevisionCount,
                isSubjectRevised,
              } = agg;

              const isSubjectMock = store?.customFields?.[subject.id]?.mock === "true";
              const subjectMockCount = Number(store?.customFields?.[subject.id]?.mockCount || 0);

              // Subject PYQs authoritative
              const totalSubAvailablePyqs = subjectMetrics?.totalAvailablePyqs ?? matchingTopicMetrics.reduce((s, m) => s + m.totalAvailablePyqs, 0);
              const totalSubAttemptedPyqs = subjectMetrics?.totalAttemptedPyqs ?? matchingTopicMetrics.reduce((s, m) => s + m.attemptedPyqs, 0);
              const totalSubSolvedPyqs = subjectMetrics?.totalSolvedPyqs ?? matchingTopicMetrics.reduce((s, m) => s + m.solvedPyqs, 0);
              const subjectPracticeCoveragePct = totalSubAvailablePyqs > 0 ? Math.round((totalSubAttemptedPyqs / totalSubAvailablePyqs) * 100) : 0;
              const subjectAccuracyPct = subjectMetrics?.accuracyRate !== undefined
                ? Math.round(subjectMetrics.accuracyRate * 100)
                : totalSubAttemptedPyqs > 0
                ? Math.round((totalSubSolvedPyqs / totalSubAttemptedPyqs) * 100)
                : 0;

              return (
                <React.Fragment key={subject.id}>
                  {/* LEVEL 1: Subject Header Row */}
                  <tr className="bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] hover:bg-[color:var(--color-bg)] transition-colors group/subject">
                    {/* Sticky Subject Title */}
                    <td className="py-3 px-3 sm:px-4 sticky left-0 z-10 bg-[color:var(--color-surface)] group-hover/subject:bg-[color:var(--color-bg)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[190px] sm:min-w-[260px] md:min-w-[320px]">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleSubjectExpand(subject.id)}
                          className="p-1 rounded-lg text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-border)]/50 transition-colors"
                          aria-label={isSubjectExpanded ? `Collapse ${subject.label}` : `Expand ${subject.label}`}
                        >
                          {isSubjectExpanded ? (
                            <FiChevronDown className="w-4 h-4 text-blue-400" />
                          ) : (
                            <FiChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div
                          className="cursor-pointer select-none"
                          onClick={() => toggleSubjectExpand(subject.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[color:var(--color-text)]">
                              {subject.label}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {subject.topics.length} Topics
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subject Theory Bulk Toggle */}
                    <td className="py-3 px-3 text-center">
                      {(() => {
                        const badge = getRatioBadgeProps(completedTopicsCount, totalTopicsCount);
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const topicIds = subject.topics.map((t) => t.id);
                              const allSubtopicIds = subject.topics.flatMap((t) =>
                                t.subtopics && t.subtopics.length > 0 ? t.subtopics.map((st) => st.id) : []
                              );
                              const nextCompleted = !isSubjectAllTheoryDone;
                              if (onBulkTheoryComplete) {
                                onBulkTheoryComplete(topicIds, nextCompleted, allSubtopicIds);
                              } else {
                                topicIds.forEach((id) => onToggleTheory(id));
                              }
                            }}
                            style={badge.style}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all ${badge.className}`}
                            title={
                              isSubjectAllTheoryDone
                                ? "Unmark all topics theory"
                                : completedTopicsCount > 0
                                ? `Mark all topics theory complete (${completedTopicsCount}/${totalTopicsCount} completed)`
                                : "Mark all topics theory complete"
                            }
                          >
                            {badge.iconType === "check" ? (
                              <FiCheckSquare className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                            ) : badge.iconType === "minus" ? (
                              <FiMinusSquare className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                            ) : (
                              <FiSquare className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {completedTopicsCount}/{totalTopicsCount}
                            </span>
                          </button>
                        );
                      })()}
                    </td>

                    {/* Subject Revised Bulk Toggle */}
                    <td className="py-3 px-3 text-center">
                      {(() => {
                        const badge = getRatioBadgeProps(revisedTopicsCount, totalTopicsCount);
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const allTopicIds = subject.topics.map((t) => t.id);
                              const allSubtopicIds = subject.topics.flatMap((t) =>
                                t.subtopics && t.subtopics.length > 0 ? t.subtopics.map((st) => st.id) : []
                              );
                              const allIds = [...allTopicIds, ...allSubtopicIds];
                              const nextRevised = !isSubjectRevised;
                              if (onBulkRevisionStatus) {
                                onBulkRevisionStatus(allIds, nextRevised);
                              } else {
                                allIds.forEach((id) => onSetRevisionStatus(id, nextRevised));
                              }
                              if (!nextRevised && onSetRevisionStatus) {
                                onSetRevisionStatus(subject.id, false);
                              }
                            }}
                            style={badge.style}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all ${badge.className}`}
                            title={
                              isSubjectRevised
                                ? "Unmark all topics revised"
                                : revisedTopicsCount > 0
                                ? `Mark all topics revised (${revisedTopicsCount}/${totalTopicsCount} revised)`
                                : "Mark all topics revised"
                            }
                          >
                            {badge.iconType === "check" ? (
                              <FiCheckSquare className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                            ) : badge.iconType === "minus" ? (
                              <FiMinusSquare className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                            ) : (
                              <FiSquare className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {revisedTopicsCount}/{totalTopicsCount}
                            </span>
                          </button>
                        );
                      })()}
                    </td>

                    {/* Subject Revision Count Controls */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-1.5 py-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => onIncrementRevision(subject.id, -1)}
                          disabled={subjectManualCount <= 0}
                          className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 p-0.5"
                          title="Decrement subject revision count"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs w-4 text-center">
                          {subjectRevisionCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrementRevision(subject.id, 1)}
                          className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] p-0.5"
                          title="Increment subject revision count"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Subject Canonical PYQ Progress (Authoritative) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-xs text-[color:var(--color-text)]">
                          {totalSubAttemptedPyqs} / {totalSubAvailablePyqs} PYQs
                        </span>
                        <div className="w-24 bg-[color:var(--color-border)] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${subjectPracticeCoveragePct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Subject Accuracy */}
                    <td className="py-3 px-3 text-center">
                      {totalSubAttemptedPyqs > 0 ? (
                        <span className={`font-bold text-xs ${
                          subjectAccuracyPct >= 70
                            ? "text-emerald-500"
                            : subjectAccuracyPct >= 50
                            ? "text-amber-500"
                            : "text-rose-500"
                        }`}>
                          {subjectAccuracyPct}%
                        </span>
                      ) : null}
                    </td>

                    {/* Optional Custom Columns for Subject */}
                    {isColVisible("marks") && (
                      <td className="py-3 px-3 text-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[color:var(--color-bg)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)]">
                          {formatMarksRange(subject.marksRange)}
                        </span>
                      </td>
                    )}
                    {isColVisible("priority") && (
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          subject.weightageTier === "tier-1-high"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : subject.weightageTier === "tier-2-medium"
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                        }`}>
                          {subject.weightageTier === "tier-1-high" ? "High" : subject.weightageTier === "tier-2-medium" ? "Medium" : "Standard"}
                        </span>
                      </td>
                    )}
                    {isColVisible("mock") && (
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            onSetCustomField(subject.id, "mock", isSubjectMock ? "false" : "true");
                          }}
                          className="text-base text-[color:var(--color-text-muted)] hover:text-purple-500 transition-colors p-1"
                          title={isSubjectMock ? "Mark Subject Mock Incomplete" : "Mark Subject Mock Complete"}
                        >
                          {isSubjectMock ? (
                            <FiCheckSquare className="w-4 h-4 text-purple-400" />
                          ) : (
                            <FiSquare className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {isColVisible("mockCount") && (
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-1.5 py-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() => {
                              onSetCustomField(subject.id, "mockCount", String(Math.max(0, subjectMockCount - 1)));
                            }}
                            disabled={subjectMockCount <= 0}
                            className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 p-0.5"
                            title="Decrement subject mock count"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs w-4 text-center">
                            {subjectMockCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onSetCustomField(subject.id, "mockCount", String(subjectMockCount + 1));
                            }}
                            className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] p-0.5"
                            title="Increment subject mock count"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Subject Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handlePracticeSubject(subject)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
                        title="Practice all unsolved PYQs in this subject"
                      >
                        <FiPlay className="w-3.5 h-3.5" />
                        <span>Practice</span>
                      </button>
                    </td>
                  </tr>

                  {/* LEVEL 2: Topic Rows (Rendered when subject is expanded) */}
                  {isSubjectExpanded &&
                    subject.topics.map((topic) => {
                      const metrics = topicMetricsMap.get(topic.id);
                      if (!metrics) return null;

                      const isTopicExpanded = Boolean(expandedTopics[topic.id]);
                      const topicSubtopics = topic.subtopics || [];
                      const hasSubtopics = topicSubtopics.length > 0;
                      const topicPyqCoveragePct = Math.round(metrics.practiceCoverage * 100);
                      const topicAccuracyPct = Math.round(metrics.accuracyRate * 100);

                      const isTopicMock = store?.customFields?.[topic.id]?.mock === "true";
                      const topicMockCount = Number(store?.customFields?.[topic.id]?.mockCount || 0);

                      return (
                        <React.Fragment key={topic.id}>
                          <tr className="hover:bg-[color:var(--color-bg)] transition-colors group/topic">
                            {/* Sticky Topic Title with Indent */}
                            <td className="py-2.5 px-3 sm:px-4 pl-5 sm:pl-8 sticky left-0 z-10 bg-[color:var(--color-surface)] group-hover/topic:bg-[color:var(--color-bg)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[190px] sm:min-w-[260px] md:min-w-[320px]">
                              <div className="flex items-center gap-2">
                                {hasSubtopics ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleTopicExpand(topic.id)}
                                    className="p-1 rounded text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors"
                                    aria-label={isTopicExpanded ? `Collapse ${topic.label}` : `Expand ${topic.label}`}
                                  >
                                    {isTopicExpanded ? (
                                      <FiChevronDown className="w-3.5 h-3.5 text-blue-400" />
                                    ) : (
                                      <FiChevronRight className="w-3.5 h-3.5 text-[color:var(--color-text-muted)]" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="w-5 text-center text-[color:var(--color-border)]">•</span>
                                )}
                                <div
                                  className={hasSubtopics ? "cursor-pointer select-none" : ""}
                                  onClick={hasSubtopics ? () => toggleTopicExpand(topic.id) : undefined}
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-xs text-[color:var(--color-text)]">
                                      {topic.label}
                                    </span>
                                    {metrics.isRevisionDue && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        Revision Due
                                      </span>
                                    )}
                                    {metrics.needsAttention && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                        Weak
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Theory Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const subtopicIds = topic.subtopics ? topic.subtopics.map((st) => st.id) : [];
                                  onToggleTheory(topic.id, !metrics.theoryCompleted, subtopicIds);
                                }}
                                className="text-base text-[color:var(--color-text-muted)] hover:text-blue-500 transition-colors"
                                title={metrics.theoryCompleted ? "Mark Theory Incomplete" : "Mark Theory Complete"}
                              >
                                {metrics.theoryCompleted ? (
                                  <FiCheckSquare className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <FiSquare className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* Revised Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const subtopicIds = topic.subtopics ? topic.subtopics.map((st) => st.id) : [];
                                  onSetRevisionStatus(topic.id, !metrics.isRevised, subtopicIds);
                                }}
                                className="text-base text-[color:var(--color-text-muted)] hover:text-indigo-500 transition-colors"
                                title={metrics.isRevised ? "Mark Not Revised" : "Mark Revised"}
                              >
                                {metrics.isRevised ? (
                                  <FiCheckSquare className="w-4 h-4 text-indigo-400" />
                                ) : (
                                  <FiSquare className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* Revision Count Controls */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-1.5 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => onIncrementRevision(topic.id, -1)}
                                  disabled={metrics.revisionCount <= 0}
                                  className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 p-0.5"
                                  title="Decrement revision count"
                                >
                                  <FiMinus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-xs w-4 text-center">
                                  {metrics.revisionCount}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onIncrementRevision(topic.id, 1)}
                                  className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] p-0.5"
                                  title="Increment revision count"
                                >
                                  <FiPlus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* Topic PYQ Progress */}
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] font-semibold text-[color:var(--color-text)]">
                                  {metrics.attemptedPyqs} / {metrics.totalAvailablePyqs}
                                </span>
                                <div className="w-20 bg-[color:var(--color-border)] h-1 rounded-full overflow-hidden">
                                  <div
                                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${topicPyqCoveragePct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Topic Accuracy */}
                            <td className="py-2.5 px-3 text-center">
                              {metrics.attemptedPyqs > 0 ? (
                                <span className={`text-[11px] font-bold ${
                                  topicAccuracyPct >= 70
                                    ? "text-emerald-500"
                                    : topicAccuracyPct >= 50
                                    ? "text-amber-500"
                                    : "text-rose-500"
                                }`}>
                                  {topicAccuracyPct}%
                                </span>
                              ) : null}
                            </td>

                            {/* Optional Custom Columns */}
                            {isColVisible("marks") && (
                              <td className="py-2.5 px-3 text-center text-[11px] text-[color:var(--color-text-muted)] font-medium">
                                {formatMarksRange(topic.marksRange)}
                              </td>
                            )}
                            {isColVisible("priority") && (
                              <td className="py-2.5 px-3 text-center">
                                <select
                                  value={metrics.customFields?.priority || (topic.weightageTier === "tier-1-high" ? "High" : topic.weightageTier === "tier-2-medium" ? "Medium" : "Standard")}
                                  onChange={(e) => onSetCustomField(topic.id, "priority", e.target.value)}
                                  aria-label={`Priority for ${topic.label}`}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] focus:outline-none"
                                >
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Standard">Standard</option>
                                  <option value="Low">Low</option>
                                </select>
                              </td>
                            )}
                            {isColVisible("mock") && (
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSetCustomField(topic.id, "mock", isTopicMock ? "false" : "true");
                                  }}
                                  className="text-base text-[color:var(--color-text-muted)] hover:text-purple-500 transition-colors"
                                  title={isTopicMock ? "Mark Mock Incomplete" : "Mark Mock Complete"}
                                >
                                  {isTopicMock ? (
                                    <FiCheckSquare className="w-4 h-4 text-purple-400" />
                                  ) : (
                                    <FiSquare className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                            )}
                            {isColVisible("mockCount") && (
                              <td className="py-2.5 px-3 text-center">
                                <div className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-1.5 py-0.5 shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSetCustomField(topic.id, "mockCount", String(Math.max(0, topicMockCount - 1)));
                                    }}
                                    disabled={topicMockCount <= 0}
                                    className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 p-0.5"
                                    title="Decrement mock count"
                                  >
                                    <FiMinus className="w-3 h-3" />
                                  </button>
                                  <span className="font-bold text-xs w-4 text-center">
                                    {topicMockCount}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSetCustomField(topic.id, "mockCount", String(topicMockCount + 1));
                                    }}
                                    className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] p-0.5"
                                    title="Increment mock count"
                                  >
                                    <FiPlus className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            )}

                            {/* Topic Actions */}
                            <td className="py-2.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">

                                <button
                                  type="button"
                                  onClick={() => onOpenReset(topic)}
                                  className="p-1.5 rounded-lg border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Reset topic manual progress"
                                >
                                  <FiRotateCcw className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePracticeTopic(topic, subject)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
                                  title="Start practice for this topic"
                                >
                                  <FiPlay className="w-3 h-3" />
                                  <span>Practice</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* LEVEL 3: Nested Subtopic Rows (If topic is expanded and subtopics exist) */}
                          {isTopicExpanded &&
                            hasSubtopics &&
                            topic.subtopics.map((subtopic, sIdx) => {
                              const subtopicTheory = Boolean(store?.theory?.[subtopic.id]?.isCompleted);
                              const subtopicRevisionEvents = Array.isArray(store?.revisions?.[subtopic.id])
                                ? store.revisions[subtopic.id]
                                : [];
                              const subtopicRevisionCount = subtopicRevisionEvents.length;
                              const subtopicIsRevised = subtopicRevisionCount > 0;

                              return (
                                <tr
                                  key={subtopic.id}
                                  className="bg-[color:var(--color-surface-muted)]/30 hover:bg-[color:var(--color-surface-muted)] transition-colors text-[11px]"
                                >
                                  {/* Deeply Indented Subtopic Title with Enumeration */}
                                  <td className="py-2 px-3 sm:px-4 pl-9 sm:pl-14 sticky left-0 z-10 bg-[color:var(--color-surface)] group-hover/topic:bg-[color:var(--color-surface-muted)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[190px] sm:min-w-[260px] md:min-w-[320px]">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-mono font-bold text-[color:var(--color-text-muted)] w-4 text-right shrink-0">
                                        {sIdx + 1}.
                                      </span>
                                      <span className="text-[color:var(--color-text)] font-medium text-xs">
                                        {subtopic.label}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Subtopic Theory Toggle */}
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const siblingSubtopicIds = (topic.subtopics || []).map((st) => st.id);
                                        onToggleTheory(subtopic.id, !subtopicTheory, undefined, {
                                          topicId: topic.id,
                                          subtopicIds: siblingSubtopicIds,
                                        });
                                      }}
                                      className="text-sm text-[color:var(--color-text-muted)] hover:text-blue-500 transition-colors"
                                      title={subtopicTheory ? "Mark Subtopic Incomplete" : "Mark Subtopic Complete"}
                                    >
                                      {subtopicTheory ? (
                                        <FiCheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <FiSquare className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </td>

                                  {/* Subtopic Revised Toggle */}
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const siblingSubtopicIds = (topic.subtopics || []).map((st) => st.id);
                                        onSetRevisionStatus(subtopic.id, !subtopicIsRevised, undefined, {
                                          topicId: topic.id,
                                          subtopicIds: siblingSubtopicIds,
                                        });
                                      }}
                                      className="text-sm text-[color:var(--color-text-muted)] hover:text-indigo-500 transition-colors"
                                      title={subtopicIsRevised ? "Mark Subtopic Not Revised" : "Mark Subtopic Revised"}
                                    >
                                      {subtopicIsRevised ? (
                                        <FiCheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                                      ) : (
                                        <FiSquare className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </td>

                                  {/* Subtopic Revision Count */}
                                  <td className="py-2 px-3 text-center">
                                    <div className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-1.5 py-0.5 shadow-sm">
                                      <button
                                        type="button"
                                        onClick={() => onIncrementRevision(subtopic.id, -1)}
                                        disabled={subtopicRevisionCount <= 0}
                                        className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 p-0.5"
                                        title="Decrement revision count"
                                      >
                                        <FiMinus className="w-2.5 h-2.5" />
                                      </button>
                                      <span className="font-bold text-xs w-4 text-center">
                                        {subtopicRevisionCount}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => onIncrementRevision(subtopic.id, 1)}
                                        className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] p-0.5"
                                        title="Increment revision count"
                                      >
                                        <FiPlus className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </td>

                                  {/* Subtopic PYQs */}
                                  <td className="py-2 px-4 text-center" />

                                  {/* Subtopic Accuracy */}
                                  <td className="py-2 px-3 text-center" />

                                  {/* Optional custom columns placeholders for subtopic */}
                                  {isColVisible("marks") && (
                                    <td className="py-2 px-3 text-center" />
                                  )}
                                  {isColVisible("priority") && (
                                    <td className="py-2 px-3 text-center" />
                                  )}
                                  {isColVisible("mock") && (
                                    <td className="py-2 px-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentMock = store?.customFields?.[subtopic.id]?.mock === "true";
                                          onSetCustomField(subtopic.id, "mock", currentMock ? "false" : "true");
                                        }}
                                        className="text-sm text-[color:var(--color-text-muted)] hover:text-purple-500 transition-colors"
                                        title={store?.customFields?.[subtopic.id]?.mock === "true" ? "Mark Mock Incomplete" : "Mark Mock Complete"}
                                      >
                                        {store?.customFields?.[subtopic.id]?.mock === "true" ? (
                                          <FiCheckSquare className="w-3.5 h-3.5 text-purple-400" />
                                        ) : (
                                          <FiSquare className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </td>
                                  )}
                                  {isColVisible("mockCount") && (
                                    <td className="py-2 px-3 text-center">
                                      <div className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-1.5 py-0.5 shadow-sm">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentCount = Number(store?.customFields?.[subtopic.id]?.mockCount || 0);
                                            onSetCustomField(subtopic.id, "mockCount", String(Math.max(0, currentCount - 1)));
                                          }}
                                          disabled={Number(store?.customFields?.[subtopic.id]?.mockCount || 0) <= 0}
                                          className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] disabled:opacity-30 p-0.5"
                                          title="Decrement mock count"
                                        >
                                          <FiMinus className="w-2.5 h-2.5" />
                                        </button>
                                        <span className="font-bold text-xs w-4 text-center">
                                          {Number(store?.customFields?.[subtopic.id]?.mockCount || 0)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentCount = Number(store?.customFields?.[subtopic.id]?.mockCount || 0);
                                            onSetCustomField(subtopic.id, "mockCount", String(currentCount + 1));
                                          }}
                                          className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] p-0.5"
                                          title="Increment mock count"
                                        >
                                          <FiPlus className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </td>
                                  )}

                                  {/* Subtopic Actions */}
                                  <td className="py-2 px-4 text-right" />
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
