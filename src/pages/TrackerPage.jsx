import React, { useState, useEffect, useMemo, useCallback, useTransition, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiArrowLeft,
  FiCpu,
  FiTrendingUp,
  FiLayers,
  FiSearch,
  FiAward,
  FiAlertCircle,
  FiBell,
  FiBookOpen,
} from "react-icons/fi";
import { useFilterState } from "../contexts/FilterContext";
import { QuestionService } from "../services/QuestionService";
import { DaQuestionService } from "../services/DaQuestionService";
import {
  TRACK_TAXONOMIES,
  getTopicsForTrack,
} from "../data/trackerTaxonomy";
import {
  loadTrackerStore,
  loadTrackerPreferences,
  saveTrackerPreferences,
  toggleTheoryStatus,
  setSubjectTheoryStatus,
  setRevisionStatus,
  setSubjectRevisionStatus,
  incrementRevisionCount,
  setCustomField,
  setSubjectCustomField,
  resetTopicManualProgress,
  deriveTopicMetrics,
  deriveSubjectMetrics,
  deriveOverallTrackMetrics,
  getContinueTopic,
  loadCanonicalPracticeRecords,
  isQuestionInTrack,
  buildQuestionIndexForTrack,
} from "../utils/trackerState";
import { HOME_ROUTE } from "../utils/routes";
import PageShell from "../components/Layout/PageShell";
import TrackerCountdownHero from "../components/Tracker/TrackerCountdownHero";
import TrackerContinueCard from "../components/Tracker/TrackerContinueCard";
import TrackerFocusBanner from "../components/Tracker/TrackerFocusBanner";
import TrackerHierarchicalTable from "../components/Tracker/TrackerHierarchicalTable";
import TrackerResetModal from "../components/Tracker/TrackerResetModal";

export default function TrackerPage() {
  const filterState = useFilterState();

  // Load preferences
  const [preferences, setPreferences] = useState(loadTrackerPreferences);
  const activeTrack = preferences.activeTrack || "cse";

  // Local tracker store state
  const [store, setStore] = useState(() => loadTrackerStore(activeTrack));

  // Transition for non-urgent track-switch re-renders
  const [isPending, startTransition] = useTransition();

  // Stable counter bumped when solved-question lists change; avoids depending on full filterState
  const [practiceRevision, setPracticeRevision] = useState(0);
  const prevSolvedRef = useRef(filterState.solvedQuestionIds);
  const prevDaSolvedRef = useRef(filterState.daSolvedQuestionIds);
  useEffect(() => {
    if (
      filterState.solvedQuestionIds !== prevSolvedRef.current ||
      filterState.daSolvedQuestionIds !== prevDaSolvedRef.current
    ) {
      prevSolvedRef.current = filterState.solvedQuestionIds;
      prevDaSolvedRef.current = filterState.daSolvedQuestionIds;
      setPracticeRevision((v) => v + 1);
    }
  }, [filterState.solvedQuestionIds, filterState.daSolvedQuestionIds]);

  // Modals / Drawers state
  const [activeNotesTopicId, setActiveNotesTopicId] = useState(null);
  const [resetModalTopic, setResetModalTopic] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [onlyHighYield, setOnlyHighYield] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // REMOVED: The useEffect below was a duplicate — handleTrackChange already calls
  // setStore(loadTrackerStore(newTrack)), so this caused a needless third re-render
  // on every track switch. Removing it eliminates one full synchronous render cycle.

  const handleTrackChange = useCallback((newTrack) => {
    // Update active-button highlight synchronously (high priority)
    const updated = saveTrackerPreferences({ activeTrack: newTrack });
    setPreferences(updated);
    // Reset UI filters immediately (cheap, synchronous)
    setSelectedSubjectFilter("all");
    setSearchQuery("");
    // Defer expensive store load + all downstream memos as a low-priority transition
    startTransition(() => {
      setStore(loadTrackerStore(newTrack));
    });
  }, [startTransition]);

  const handleUpdatePreferences = useCallback((partial) => {
    const updated = saveTrackerPreferences(partial);
    setPreferences(updated);
  }, []);

  const taxonomy = TRACK_TAXONOMIES[activeTrack] || TRACK_TAXONOMIES.cse;
  const allTopics = useMemo(() => getTopicsForTrack(activeTrack), [activeTrack]);

  const [asyncQuestionsRevision, setAsyncQuestionsRevision] = useState(0);

  // Ensure questions for the active track are loaded on mount and track switch.
  // NOTE: AptitudeQuestionService is intentionally not loaded here — tracker only
  // covers GATE syllabus PYQs, not the separate aptitude practice bank.
  useEffect(() => {
    let cancelled = false;
    const initTrackQuestions = async () => {
      let neededLoad = false;
      try {
        if (activeTrack === "da") {
          if (!DaQuestionService.loaded) {
            neededLoad = true;
            await DaQuestionService.init();
          }
        } else {
          if (!QuestionService.loaded) {
            neededLoad = true;
            await QuestionService.init();
          }
        }
        if (!cancelled && neededLoad) {
          setAsyncQuestionsRevision((v) => v + 1);
        }
      } catch (err) {
        console.warn("[Tracker] Failed to load track questions:", err);
      }
    };
    void initTrackQuestions();
    return () => {
      cancelled = true;
    };
  }, [activeTrack]);

  // Aggregate questions strictly matching the active track.
  // NOTE: Aptitude questions are intentionally excluded — the tracker only covers
  // GATE syllabus PYQs (CSE ~3,500, DA ~1,500). Aptitude is a separate practice bank.
  const activeTrackQuestions = useMemo(() => {
    let baseList = [];
    if (activeTrack === "da") {
      if (DaQuestionService.loaded && DaQuestionService.questions.length > 0) {
        baseList = DaQuestionService.questions;
      } else {
        baseList = (filterState.allQuestions || []).filter((q) => isQuestionInTrack(q, "da"));
      }
    } else {
      if (QuestionService.loaded && QuestionService.questions.length > 0) {
        // Do NOT include AptitudeQuestionService here — aptitude questions are a
        // separate practice bank and must not inflate tracker PYQ counts.
        baseList = QuestionService.questions;
      } else {
        baseList = (filterState.allQuestions || []).filter((q) => isQuestionInTrack(q, "cse"));
      }
    }
    return baseList;
  }, [activeTrack, filterState.allQuestions, asyncQuestionsRevision]);

  // Load canonical practice records. Deps use a narrow counter instead of full filterState
  // to avoid re-parsing localStorage on every unrelated context update.
  const canonicalPractice = useMemo(() => {
    return loadCanonicalPracticeRecords(activeTrack);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack, practiceRevision]);

  // Pre-index questions by subject and topic once per question dataset change (50x speedup)
  const questionIndex = useMemo(() => {
    return buildQuestionIndexForTrack(activeTrackQuestions, taxonomy, activeTrack);
  }, [activeTrackQuestions, taxonomy, activeTrack]);

  // Derive topic metrics in-memory from indexed questions & practice progress (0 network calls)
  const topicMetricsMap = useMemo(() => {
    const map = new Map();
    const solvedSet = canonicalPractice.solvedSet;
    const progressMap = canonicalPractice.progressMap;

    for (const topic of allTopics) {
      const topicQuestions = questionIndex.topicQuestions.get(topic.id) || [];
      const metrics = deriveTopicMetrics(topic, store, topicQuestions, solvedSet, progressMap, activeTrack);
      map.set(topic.id, metrics);
    }
    return map;
  }, [allTopics, store, questionIndex, canonicalPractice, activeTrack]);

  const topicMetricsList = useMemo(() => Array.from(topicMetricsMap.values()), [topicMetricsMap]);

  // Derive subject metrics in-memory (Authoritative subject-level PYQs)
  const subjectMetricsMap = useMemo(() => {
    const map = new Map();
    const solvedSet = canonicalPractice.solvedSet;
    const progressMap = canonicalPractice.progressMap;

    for (const subject of taxonomy.subjects) {
      const subjectQuestions = questionIndex.subjectQuestions.get(subject.id) || [];
      const sMetrics = deriveSubjectMetrics(
        subject,
        store,
        topicMetricsList,
        subjectQuestions,
        solvedSet,
        progressMap,
        activeTrack
      );
      map.set(subject.id, sMetrics);
    }
    return map;
  }, [taxonomy.subjects, store, topicMetricsList, questionIndex, canonicalPractice, activeTrack]);

  const subjectMetricsList = useMemo(() => Array.from(subjectMetricsMap.values()), [subjectMetricsMap]);

  // Overall 3-pillar progress metrics
  const overallMetrics = useMemo(
    () => deriveOverallTrackMetrics(topicMetricsList, subjectMetricsList, taxonomy.subjects, store),
    [topicMetricsList, subjectMetricsList, taxonomy.subjects, store]
  );

  // Continue where you left off (or recommended starting topic on cold start)
  const continueItem = useMemo(() => getContinueTopic(topicMetricsList, allTopics), [topicMetricsList, allTopics]);

  const starterTopic = useMemo(() => {
    if (continueItem) return null;
    const tier1 = allTopics.find((t) => t.weightageTier === "tier-1-high") || allTopics[0];
    if (!tier1) return null;
    const metrics = topicMetricsMap.get(tier1.id);
    return metrics ? { topic: tier1, metrics } : null;
  }, [continueItem, allTopics, topicMetricsMap]);

  // Mutations
  const handleToggleTheory = useCallback((nodeId, explicitValue, childNodeIds, parentTopicInfo) => {
    const nextStore = toggleTheoryStatus(activeTrack, nodeId, explicitValue, childNodeIds, parentTopicInfo);
    setStore(nextStore);
  }, [activeTrack]);

  const handleBulkTheoryComplete = useCallback((topicIds, isCompleted, allSubtopicIds) => {
    const nextStore = setSubjectTheoryStatus(activeTrack, topicIds, isCompleted, allSubtopicIds);
    setStore(nextStore);
  }, [activeTrack]);

  const handleSetRevisionStatus = useCallback((nodeId, isRevised, childNodeIds, parentTopicInfo) => {
    const nextStore = setRevisionStatus(activeTrack, nodeId, isRevised, childNodeIds, parentTopicInfo);
    setStore(nextStore);
  }, [activeTrack]);

  const handleBulkRevisionStatus = useCallback((nodeIds, isRevised) => {
    const nextStore = setSubjectRevisionStatus(activeTrack, nodeIds, isRevised);
    setStore(nextStore);
  }, [activeTrack]);

  const handleIncrementRevision = useCallback((nodeId, delta) => {
    const nextStore = incrementRevisionCount(activeTrack, nodeId, delta);
    setStore(nextStore);
  }, [activeTrack]);

  const handleSetCustomField = useCallback((nodeId, fieldKey, value) => {
    const nextStore = setCustomField(activeTrack, nodeId, fieldKey, value);
    setStore(nextStore);
  }, [activeTrack]);

  const handleBulkCustomField = useCallback((nodeIds, fieldKey, value) => {
    const nextStore = setSubjectCustomField(activeTrack, nodeIds, fieldKey, value);
    setStore(nextStore);
  }, [activeTrack]);

  const handleConfirmReset = useCallback((nodeId) => {
    const nextStore = resetTopicManualProgress(activeTrack, nodeId);
    setStore(nextStore);
  }, [activeTrack]);

  // Filtered Subjects & Topics list
  const filteredSubjects = useMemo(() => {
    return taxonomy.subjects
      .map((subject) => {
        if (selectedSubjectFilter !== "all" && subject.slug !== selectedSubjectFilter) {
          return null;
        }

        const filteredTopics = subject.topics.filter((topic) => {
          if (onlyHighYield && topic.weightageTier !== "tier-1-high") {
            return false;
          }

          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const matchesLabel = topic.label.toLowerCase().includes(query);
            const matchesConcept = (topic.keyConcepts || []).some((c) => c.toLowerCase().includes(query));
            const matchesSubtopic = (topic.subtopics || []).some(
              (st) =>
                st.label.toLowerCase().includes(query) ||
                st.subtopicSlug.toLowerCase().includes(query) ||
                (st.tags || []).some((tag) => tag.toLowerCase().includes(query))
            );
            if (!matchesLabel && !matchesConcept && !matchesSubtopic) return false;
          }

          if (statusFilter !== "all") {
            const m = topicMetricsMap.get(topic.id);
            if (!m) return false;
            if (statusFilter === "attention" && !m.needsAttention) return false;
            if (statusFilter === "revision" && !m.isRevisionDue) return false;
            if (statusFilter === "unpracticed" && m.attemptedPyqs > 0) return false;
          }

          return true;
        });

        if (filteredTopics.length === 0) return null;
        return {
          ...subject,
          topics: filteredTopics,
        };
      })
      .filter(Boolean);
  }, [taxonomy.subjects, selectedSubjectFilter, onlyHighYield, searchQuery, statusFilter, topicMetricsMap]);

  return (
    <>
      <Helmet>
        <title>{activeTrack === "cse" ? "GATE CSE Preparation Tracker" : "GATE DA Preparation Tracker"} | GateQA</title>
        <meta
          name="description"
          content="Track your GATE Computer Science (CSE) and Data Science (DA) preparation progress. Local-first, automated PYQ tracking, hierarchical table, and revision planner."
        />
      </Helmet>

      <PageShell contentClassName="pb-16 sm:pb-24 pt-3 sm:pt-5">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[color:var(--color-border)] pb-5 sm:pb-6 mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Link
                to={HOME_ROUTE}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)] shadow-xs transition-all group"
                aria-label="Back to Home Dashboard"
                title="Back to Home Dashboard"
              >
                <FiArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Back to Home</span>
              </Link>
              <span className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${activeTrack === "cse" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-purple-500/10 border-purple-500/30 text-purple-400"}`}>
                {activeTrack === "cse" ? "Paper: CS" : "Paper: DA"}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[color:var(--color-text)]">
              {activeTrack === "cse" ? "GATE CSE Preparation Tracker" : "GATE DA Preparation Tracker"}
            </h1>
            <p className="text-xs sm:text-sm text-[color:var(--color-text-muted)] mt-1">
              Automated syllabus coverage, honest PYQ analytics &amp; intelligent revision queue
            </p>
          </div>

          {/* Track Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] p-1 rounded-xl shadow-sm w-full sm:w-auto self-start sm:self-center">
            <button
              type="button"
              onClick={() => handleTrackChange("cse")}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeTrack === "cse"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-bg)]"
              }`}
            >
              <FiCpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>GATE CSE</span>
            </button>
            <button
              type="button"
              onClick={() => handleTrackChange("da")}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeTrack === "da"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-bg)]"
              }`}
            >
              <FiTrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>GATE DA</span>
            </button>
          </div>
        </header>

        {/* Dismissible Countdown Hero */}
        <TrackerCountdownHero
          activeTrack={activeTrack}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          syllabusDonePercentage={overallMetrics.theoryPercentage}
        />

        {/* 3-Pillar Progress Summary */}
        <section aria-label="Preparation Progress" className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Pillar 1: Theory */}
          <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">Theory Progress</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {overallMetrics.theoryPercentage}%
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              {overallMetrics.theoryCompletedCount} <span className="text-sm font-normal text-[color:var(--color-text-muted)]">/ {overallMetrics.totalTopics} Subtopics Completed</span>
            </div>
            <p className="text-[11px] text-[color:var(--color-text-muted)] mb-2">
              Across {taxonomy.subjects.length} syllabus subjects
            </p>
            <div className="w-full bg-[color:var(--color-border)] h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${overallMetrics.theoryPercentage}%` }} />
            </div>
          </div>

          {/* Pillar 2: PYQ Practice */}
          <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">PYQ Practice</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {overallMetrics.practicePercentage}%
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              {overallMetrics.totalAttemptedPyqs > 0 ? (
                <>
                  {overallMetrics.totalAttemptedPyqs} <span className="text-sm font-normal text-[color:var(--color-text-muted)]">/ {overallMetrics.totalAvailablePyqs} PYQs</span>
                </>
              ) : (
                <>
                  0 <span className="text-sm font-normal text-[color:var(--color-text-muted)]">/ {overallMetrics.totalAvailablePyqs} PYQs</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[color:var(--color-text-muted)] mb-2">
              {overallMetrics.totalAttemptedPyqs > 0 ? `${overallMetrics.practicePercentage}% question bank attempted` : "No practice attempts yet"}
            </p>
            <div className="w-full bg-[color:var(--color-border)] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${overallMetrics.practicePercentage}%` }} />
            </div>
          </div>

          {/* Pillar 3: Practice Accuracy */}
          <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">Practice Accuracy</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {overallMetrics.totalAttemptedPyqs > 0 ? `${overallMetrics.overallAccuracyRate}%` : "—%"}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              {overallMetrics.totalAttemptedPyqs > 0 ? (
                <>
                  {overallMetrics.overallAccuracyRate}% <span className="text-sm font-normal text-[color:var(--color-text-muted)]">({overallMetrics.totalSolvedPyqs} Solved)</span>
                </>
              ) : (
                <>
                  — <span className="text-sm font-normal text-[color:var(--color-text-muted)]">(No attempts yet)</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[color:var(--color-text-muted)] mb-2">
              {overallMetrics.totalAttemptedPyqs > 0 ? `${overallMetrics.totalSolvedPyqs} correctly solved questions` : "Start solving to benchmark accuracy"}
            </p>
            <div className="w-full bg-[color:var(--color-border)] h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${overallMetrics.totalAttemptedPyqs > 0 ? overallMetrics.overallAccuracyRate : 0}%` }} />
            </div>
          </div>
        </section>

        {/* Action Status Pills */}
        <section aria-label="Status Summary" className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === "revision" ? "all" : "revision"))}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === "revision"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
            }`}
          >
            <FiBell className="w-3.5 h-3.5" />
            <span>{overallMetrics.revisionDueCount} Revisions Due</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === "attention" ? "all" : "attention"))}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === "attention"
                ? "bg-rose-500 text-white font-bold shadow-sm"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
            }`}
          >
            <FiAlertCircle className="w-3.5 h-3.5" />
            <span>{overallMetrics.needsAttentionCount} Needs Attention</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === "unpracticed" ? "all" : "unpracticed"))}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === "unpracticed"
                ? "bg-slate-300 text-slate-900 font-bold shadow-sm"
                : "bg-slate-500/10 text-[color:var(--color-text-muted)] border border-[color:var(--color-border)] hover:bg-slate-500/20"
            }`}
          >
            <FiBookOpen className="w-3.5 h-3.5" />
            <span>{overallMetrics.unpracticedTopicsCount} Unpracticed</span>
          </button>

          <div className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FiAward className="w-3.5 h-3.5" />
            <span>{overallMetrics.wellPracticedTopicsCount} Well Practiced</span>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section aria-label="Syllabus Filters" className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, concepts (e.g. Paging, Logic)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* Subject Dropdown */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              aria-label="Filter by Subject"
              className="w-full sm:w-auto text-xs px-3 py-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects ({taxonomy.subjects.length})</option>
              {taxonomy.subjects.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* High Yield Filter Toggle */}
            <label className={`inline-flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold px-3 py-2 rounded-xl border select-none transition-all ${
              onlyHighYield
                ? "bg-blue-600/10 border-blue-500/40 text-blue-400 shadow-sm"
                : "border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
            }`}>
              <input
                type="checkbox"
                checked={onlyHighYield}
                onChange={(e) => setOnlyHighYield(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 bg-[color:var(--color-surface)] border-[color:var(--color-border)] w-3.5 h-3.5"
              />
              <span>High-yield only</span>
            </label>
          </div>
        </section>

        {/* Hierarchical Syllabus Table Section */}
        <section aria-label="Syllabus Breakdown" className="space-y-4 mb-8">
          <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-3">
            <div className="flex items-center gap-2">
              <FiLayers className="w-5 h-5 text-[color:var(--color-text-muted)]" />
              <h2 className="text-lg font-bold">
                Subject Breakdown ({filteredSubjects.length} of {taxonomy.subjects.length} Subjects)
              </h2>
            </div>
          </div>

          <TrackerHierarchicalTable
            subjects={filteredSubjects}
            topicMetricsMap={topicMetricsMap}
            subjectMetricsMap={subjectMetricsMap}
            store={store}
            activeTrack={activeTrack}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            visibleColumns={preferences.visibleColumns || []}
            loading={isPending}
            onToggleTheory={handleToggleTheory}
            onBulkTheoryComplete={handleBulkTheoryComplete}
            onSetRevisionStatus={handleSetRevisionStatus}
            onBulkRevisionStatus={handleBulkRevisionStatus}
            onIncrementRevision={handleIncrementRevision}
            onSetCustomField={handleSetCustomField}
            onBulkCustomField={handleBulkCustomField}
            onOpenReset={(topic) => setResetModalTopic(topic)}
            onUpdatePreferences={handleUpdatePreferences}
          />
        </section>

        {/* Next Action Priority Card: "Continue Where You Left Off" or "Recommended Starting Step" */}
        <TrackerContinueCard
          continueItem={continueItem || starterTopic}
          isStarter={!continueItem}
        />

        {/* Today's Focus (Shown when recommendations exist) */}
        <TrackerFocusBanner
          topicMetricsList={topicMetricsList}
          allTopics={allTopics}
        />
        {/* Reset Confirmation Modal */}
        <TrackerResetModal
          topic={resetModalTopic}
          isOpen={Boolean(resetModalTopic)}
          onClose={() => setResetModalTopic(null)}
          onConfirmReset={handleConfirmReset}
        />
      </PageShell>
    </>
  );
}

