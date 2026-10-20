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
  FiMoon,
  FiSun,
  FiChevronDown,
  FiClock,
} from "react-icons/fi";
import { useTheme } from "../utils/theme";
import { useFilterState } from "../contexts/FilterContext";
import { QuestionService } from "../services/QuestionService";
import { DaQuestionService } from "../services/DaQuestionService";
import { BranchQuestionService } from "../services/BranchQuestionService";
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
import {
  readBranchPreferences,
  BRANCH_PREFERENCE_EVENT,
  DEFAULT_BRANCH,
} from "../utils/branchPreference";
import { DISCIPLINES } from "../components/Branch/BranchSelectionWall";
import { HOME_ROUTE } from "../utils/routes";
import PageShell from "../components/Layout/PageShell";
import TrackerCountdownHero from "../components/Tracker/TrackerCountdownHero";
import TrackerContinueCard from "../components/Tracker/TrackerContinueCard";
import TrackerFocusBanner from "../components/Tracker/TrackerFocusBanner";
import TrackerHierarchicalTable from "../components/Tracker/TrackerHierarchicalTable";
import TrackerResetModal from "../components/Tracker/TrackerResetModal";

const TRACK_BADGES = {
  cse: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  da: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  ec: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  ee: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  me: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  ce: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
};

const TRACK_ACTIVE_BTN = {
  cse: "bg-blue-600 text-white",
  da: "bg-purple-600 text-white",
  ec: "bg-amber-600 text-white",
  ee: "bg-yellow-600 text-white",
  me: "bg-rose-600 text-white",
  ce: "bg-cyan-600 text-white",
};

export default function TrackerPage() {
  const filterState = useFilterState();
  const { isDarkMode, toggleTheme } = useTheme();

  // Load preferences
  const [preferences, setPreferences] = useState(loadTrackerPreferences);

  // Branch preferences (source of truth for selected examination branches)
  const [branchPref, setBranchPref] = useState(() => {
    const bp = readBranchPreferences();
    const branches = (bp && Array.isArray(bp.selectedBranches) && bp.selectedBranches.length > 0)
      ? bp.selectedBranches
      : ["cse", "da"];
    return {
      selectedBranches: branches,
      activeBranch: branches.includes(bp?.activeBranch) ? bp.activeBranch : branches[0],
    };
  });

  // Listen for branch changes from settings, onboarding, or other tabs
  useEffect(() => {
    const handleBranchChange = () => {
      const bp = readBranchPreferences();
      const branches = (bp && Array.isArray(bp.selectedBranches) && bp.selectedBranches.length > 0)
        ? bp.selectedBranches
        : ["cse", "da"];
      setBranchPref({
        selectedBranches: branches,
        activeBranch: branches.includes(bp?.activeBranch) ? bp.activeBranch : branches[0],
      });
    };
    window.addEventListener(BRANCH_PREFERENCE_EVENT, handleBranchChange);
    window.addEventListener("storage", handleBranchChange);
    return () => {
      window.removeEventListener(BRANCH_PREFERENCE_EVENT, handleBranchChange);
      window.removeEventListener("storage", handleBranchChange);
    };
  }, []);

  // Active track is constrained strictly to the user's selected branches
  const activeTrack = useMemo(() => {
    if (branchPref.selectedBranches.includes(preferences.activeTrack)) {
      return preferences.activeTrack;
    }
    if (branchPref.selectedBranches.includes(branchPref.activeBranch)) {
      return branchPref.activeBranch;
    }
    return branchPref.selectedBranches[0] || DEFAULT_BRANCH;
  }, [branchPref.selectedBranches, branchPref.activeBranch, preferences.activeTrack]);

  // Discipline metadata for active track
  const activeTrackMeta = useMemo(() => {
    const found = DISCIPLINES.find((d) => d.code === activeTrack);
    return found || {
      code: activeTrack,
      short: activeTrack.toUpperCase(),
      label: activeTrack.toUpperCase(),
    };
  }, [activeTrack]);

  // Local tracker store state
  const [store, setStore] = useState(() => loadTrackerStore(activeTrack));

  // Transition for non-urgent track-switch re-renders
  const [isPending, startTransition] = useTransition();

  // Keep store synchronized when activeTrack transitions
  const prevActiveTrackRef = useRef(activeTrack);
  useEffect(() => {
    if (prevActiveTrackRef.current !== activeTrack) {
      prevActiveTrackRef.current = activeTrack;
      startTransition(() => {
        setStore(loadTrackerStore(activeTrack));
      });
    }
  }, [activeTrack, startTransition]);

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

  // Preparation Summary overview dropdown state (persisted in preferences, default closed)
  const isOverviewOpen = preferences.showOverview === true;
  const toggleOverview = useCallback(() => {
    handleUpdatePreferences({ showOverview: !isOverviewOpen });
  }, [handleUpdatePreferences, isOverviewOpen]);

  // Exam Countdown visibility state (persisted in preferences)
  const isCountdownVisible = preferences.showCountdownWidget !== false && preferences.countdownDisplayMode !== "hidden";
  const toggleCountdown = useCallback(() => {
    handleUpdatePreferences({
      showCountdownWidget: !isCountdownVisible,
      countdownDisplayMode: isCountdownVisible ? "hidden" : "hero",
    });
  }, [handleUpdatePreferences, isCountdownVisible]);

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
        } else if (activeTrack === "cse") {
          if (!QuestionService.loaded) {
            neededLoad = true;
            await QuestionService.init();
          }
        } else {
          // Official engineering disciplines (ec, ee, me, ce)
          if (!BranchQuestionService.isLoaded(activeTrack)) {
            neededLoad = true;
            await BranchQuestionService.init(activeTrack);
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
  // GATE syllabus PYQs. Aptitude is a separate practice bank.
  const activeTrackQuestions = useMemo(() => {
    let baseList = [];
    if (activeTrack === "da") {
      if (DaQuestionService.loaded && DaQuestionService.questions.length > 0) {
        baseList = DaQuestionService.questions;
      } else {
        baseList = (filterState.allQuestions || []).filter((q) => isQuestionInTrack(q, "da"));
      }
    } else if (activeTrack === "cse") {
      if (QuestionService.loaded && QuestionService.questions.length > 0) {
        baseList = QuestionService.questions;
      } else {
        baseList = (filterState.allQuestions || []).filter((q) => isQuestionInTrack(q, "cse"));
      }
    } else {
      // Official engineering branches: ec, ee, me, ce
      if (BranchQuestionService.isLoaded(activeTrack)) {
        baseList = BranchQuestionService.getQuestions(activeTrack);
      } else {
        baseList = (filterState.allQuestions || []).filter((q) => isQuestionInTrack(q, activeTrack));
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
        <title>{`GATE ${activeTrackMeta.short} Preparation Tracker | GateQA`}</title>
        <meta
          name="description"
          content={`Track your GATE ${activeTrackMeta.label} (${activeTrackMeta.short}) preparation progress. Local-first, automated PYQ tracking, hierarchical table, and revision planner.`}
        />
      </Helmet>

      <PageShell showHeader={false} fluid={true} contentClassName="pb-[calc(4.5rem+env(safe-area-inset-bottom,16px))] sm:pb-24 pt-2.5 sm:pt-4 px-2.5 sm:px-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 border-b border-[color:var(--color-border)] pb-2.5 sm:pb-4 mb-2 sm:mb-3">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <Link
                to={HOME_ROUTE}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] bg-[color:var(--color-surface)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)] shadow-xs transition-all group"
                aria-label="Back to Home Dashboard"
                title="Back to Home Dashboard"
              >
                <FiArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Home</span>
              </Link>
              <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${TRACK_BADGES[activeTrack] || TRACK_BADGES.cse}`}>
                Paper: {activeTrackMeta.short}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-normal font-display tracking-tight text-[color:var(--color-text)] text-balance">
              GATE {activeTrackMeta.short} Preparation Tracker
            </h1>
            <p className="text-[11px] sm:text-xs text-[color:var(--color-text-muted)] mt-0.5 text-pretty line-clamp-1 sm:line-clamp-none">
              Official syllabus coverage, honest PYQ analytics &amp; intelligent revision queue
            </p>
          </div>

          {/* Track Switcher (Adapts strictly to user's selected branches) */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] p-1 rounded-xl shadow-xs w-full sm:w-auto self-start sm:self-center">
            {branchPref.selectedBranches.map((branchCode) => {
              const disc = DISCIPLINES.find((d) => d.code === branchCode);
              const Icon = disc?.icon || FiCpu;
              const shortName = disc?.short || branchCode.toUpperCase();
              const isActive = activeTrack === branchCode;
              const activeClass = TRACK_ACTIVE_BTN[branchCode] || "bg-blue-600 text-white";

              return (
                <button
                  key={branchCode}
                  type="button"
                  onClick={() => handleTrackChange(branchCode)}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    isActive
                      ? `${activeClass} shadow-sm`
                      : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-bg)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>GATE {shortName}</span>
                </button>
              );
            })}
            {/* Exam Countdown Toggle Button */}
            <button
              type="button"
              onClick={toggleCountdown}
              aria-label={isCountdownVisible ? "Hide Countdown" : "Show Countdown"}
              title={isCountdownVisible ? "Hide Exam Countdown" : "Show Exam Countdown"}
              className={`inline-flex min-h-[32px] sm:min-h-[34px] min-w-[32px] sm:min-w-0 items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                isCountdownVisible
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 hover:bg-blue-600/25"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
              }`}
            >
              <FiClock className={`w-3.5 h-3.5 ${isCountdownVisible ? "text-blue-400" : "text-[color:var(--color-text-muted)]"}`} />
              <span className="hidden sm:inline">
                {isCountdownVisible ? "Countdown Active" : "Countdown"}
              </span>
            </button>
            <button
              type="button"
              role="switch"
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-checked={isDarkMode}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="inline-flex min-h-[32px] min-w-[32px] w-[32px] sm:min-h-[34px] sm:min-w-[34px] sm:w-[34px] items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-1 text-[color:var(--color-text)] shadow-xs transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500 shrink-0"
            >
              {isDarkMode ? (
                <FiSun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              ) : (
                <FiMoon className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
              )}
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

        {/* Collapsible Preparation Summary & Metrics Section */}
        <section
          aria-label="Preparation Summary"
          className="mb-2 sm:mb-2.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-xs transition-colors overflow-hidden"
        >
          <button
            type="button"
            onClick={toggleOverview}
            className="w-full flex items-center justify-between px-2.5 py-1.5 sm:px-3.5 sm:py-2 hover:bg-[color:var(--color-surface-muted)] transition-colors text-left"
            aria-expanded={isOverviewOpen}
            aria-controls="tracker-overview-details"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="p-1 sm:p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <FiTrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[color:var(--color-text)] whitespace-nowrap">
                  Preparation Summary
                </span>
                {/* Glanceable metrics summary */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[color:var(--color-text-muted)] flex-wrap">
                  <span className="hidden sm:inline">·</span>
                  <span>Theory: <strong className="text-[color:var(--color-text)] tabular-nums">{overallMetrics.theoryPercentage}%</strong></span>
                  <span>·</span>
                  <span>PYQs: <strong className="text-[color:var(--color-text)] tabular-nums">{overallMetrics.practicePercentage}%</strong> <span className="hidden sm:inline">(<span className="tabular-nums">{overallMetrics.totalAttemptedPyqs}/{overallMetrics.totalAvailablePyqs}</span>)</span></span>
                  <span>·</span>
                  <span>Accuracy: <strong className="text-[color:var(--color-text)] tabular-nums">{overallMetrics.totalAttemptedPyqs > 0 ? `${overallMetrics.overallAccuracyRate}%` : "—"}</strong></span>
                  {overallMetrics.revisionDueCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-amber-500 dark:text-amber-400 tabular-nums">{overallMetrics.revisionDueCount} due</span>
                    </>
                  )}
                  {statusFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      Filter: {statusFilter}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
              <span className="text-[11px] font-semibold text-[color:var(--color-text-muted)] hidden sm:inline">
                {isOverviewOpen ? "Collapse" : "Expand"}
              </span>
              <div className="p-1 rounded-md text-[color:var(--color-text-muted)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOverviewOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
          </button>

          {isOverviewOpen && (
            <div id="tracker-overview-details" className="p-2.5 sm:p-4 pt-0 sm:pt-0 border-t border-[color:var(--color-border)] space-y-2.5 sm:space-y-3">
              {/* 3-Pillar Progress Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-2.5 sm:pt-3">
                {/* Pillar 1: Theory */}
                <div className="bg-[color:var(--color-bg)] border border-[color:var(--color-border)] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">Theory Progress</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 tabular-nums">
                      {overallMetrics.theoryPercentage}%
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 tabular-nums">
                    {overallMetrics.theoryCompletedCount} <span className="text-xs sm:text-sm font-normal text-[color:var(--color-text-muted)]">/ {overallMetrics.totalTopics} Subtopics Completed</span>
                  </div>
                  <p className="text-[11px] text-[color:var(--color-text-muted)] mb-2 text-pretty">
                    Across {taxonomy.subjects.length} syllabus subjects
                  </p>
                  <div className="w-full bg-[color:var(--color-border)] h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${overallMetrics.theoryPercentage}%` }} />
                  </div>
                </div>

                {/* Pillar 2: PYQ Practice */}
                <div className="bg-[color:var(--color-bg)] border border-[color:var(--color-border)] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">PYQ Practice</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
                      {overallMetrics.practicePercentage}%
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 tabular-nums">
                    {overallMetrics.totalAttemptedPyqs > 0 ? (
                      <>
                        {overallMetrics.totalAttemptedPyqs} <span className="text-xs sm:text-sm font-normal text-[color:var(--color-text-muted)]">/ {overallMetrics.totalAvailablePyqs} PYQs</span>
                      </>
                    ) : (
                      <>
                        0 <span className="text-xs sm:text-sm font-normal text-[color:var(--color-text-muted)]">/ {overallMetrics.totalAvailablePyqs} PYQs</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-[color:var(--color-text-muted)] mb-2 text-pretty">
                    {overallMetrics.totalAttemptedPyqs > 0 ? `${overallMetrics.practicePercentage}% question bank attempted` : "No practice attempts yet"}
                  </p>
                  <div className="w-full bg-[color:var(--color-border)] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${overallMetrics.practicePercentage}%` }} />
                  </div>
                </div>

                {/* Pillar 3: Practice Accuracy */}
                <div className="bg-[color:var(--color-bg)] border border-[color:var(--color-border)] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider">Practice Accuracy</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tabular-nums">
                      {overallMetrics.totalAttemptedPyqs > 0 ? `${overallMetrics.overallAccuracyRate}%` : "—%"}
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 tabular-nums">
                    {overallMetrics.totalAttemptedPyqs > 0 ? (
                      <>
                        {overallMetrics.overallAccuracyRate}% <span className="text-xs sm:text-sm font-normal text-[color:var(--color-text-muted)]">({overallMetrics.totalSolvedPyqs} Solved)</span>
                      </>
                    ) : (
                      <>
                        — <span className="text-xs sm:text-sm font-normal text-[color:var(--color-text-muted)]">(No attempts yet)</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-[color:var(--color-text-muted)] mb-2 text-pretty">
                    {overallMetrics.totalAttemptedPyqs > 0 ? `${overallMetrics.totalSolvedPyqs} correctly solved questions` : "Start solving to benchmark accuracy"}
                  </p>
                  <div className="w-full bg-[color:var(--color-border)] h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${overallMetrics.totalAttemptedPyqs > 0 ? overallMetrics.overallAccuracyRate : 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Action Status Pills */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible pt-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter((prev) => (prev === "revision" ? "all" : "revision"))}
                  className={`shrink-0 sm:shrink sm:flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === "revision"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                  }`}
                >
                  <FiBell className="w-3.5 h-3.5" />
                  <span><strong className="tabular-nums font-bold">{overallMetrics.revisionDueCount}</strong> Revisions Due</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter((prev) => (prev === "attention" ? "all" : "attention"))}
                  className={`shrink-0 sm:shrink sm:flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === "attention"
                      ? "bg-rose-500 text-white font-bold shadow-sm"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                  }`}
                >
                  <FiAlertCircle className="w-3.5 h-3.5" />
                  <span><strong className="tabular-nums font-bold">{overallMetrics.needsAttentionCount}</strong> Needs Attention</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter((prev) => (prev === "unpracticed" ? "all" : "unpracticed"))}
                  className={`shrink-0 sm:shrink sm:flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === "unpracticed"
                      ? "bg-slate-300 text-slate-900 font-bold shadow-sm"
                      : "bg-slate-500/10 text-[color:var(--color-text-muted)] border border-[color:var(--color-border)] hover:bg-slate-500/20"
                  }`}
                >
                  <FiBookOpen className="w-3.5 h-3.5" />
                  <span><strong className="tabular-nums font-bold">{overallMetrics.unpracticedTopicsCount}</strong> Unpracticed</span>
                </button>

                <div className="shrink-0 sm:shrink sm:flex-1 md:flex-none sm:ml-auto inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  <FiAward className="w-3.5 h-3.5" />
                  <span><strong className="tabular-nums font-bold">{overallMetrics.wellPracticedTopicsCount}</strong> Well Practiced</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Search & Filter Bar */}
        <section aria-label="Syllabus Filters" className="mb-2 sm:mb-2.5 p-1.5 sm:p-2 rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="relative w-full sm:w-72 md:w-80">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[color:var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, concepts..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {/* Subject Dropdown */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              aria-label="Filter by Subject"
              className="flex-1 sm:flex-none text-xs px-2.5 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects ({taxonomy.subjects.length})</option>
              {taxonomy.subjects.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* High Yield Filter Toggle */}
            <label className={`shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold px-2.5 py-1.5 rounded-lg border select-none transition-all ${
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
              <span>High-yield</span>
            </label>
          </div>
        </section>

        {/* Hierarchical Syllabus Table Section */}
        <section aria-label="Syllabus Breakdown" className="space-y-1.5 mb-6 sm:mb-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FiLayers className="w-4 h-4 text-[color:var(--color-text-muted)]" />
              <h2 className="text-xs sm:text-sm font-bold text-[color:var(--color-text)]">
                Subject Breakdown <span className="text-[11px] font-normal text-[color:var(--color-text-muted)]">({filteredSubjects.length} of {taxonomy.subjects.length} Subjects)</span>
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
