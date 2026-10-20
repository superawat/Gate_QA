import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  FaChartLine,
  FaCompass,
  FaLightbulb,
  FaChevronUp,
  FaChevronDown,
  FaCheckCircle,
  FaTimesCircle,
  FaBullseye,
  FaEye,
  FaArrowRight,
  FaFilter,
  FaFireAlt,
  FaHistory,
  FaCalendarCheck,
  FaClock,
  FaExclamationTriangle,
  FaGraduationCap,
  FaRobot,
  FaLayerGroup,
  FaBrain,
  FaBolt,
  FaCogs,
  FaBuilding,
  FaChartPie,
  FaSearch,
  FaTimes,
  FaPlay,
  FaRedo,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";

import ProgressBar from "../components/Filters/ProgressBar";
import { useFilterState, useFilterActions } from "../contexts/FilterContext";
import { useSession } from "../contexts/SessionContext";
import PageShell from "../components/Layout/PageShell";
import SEOHead from "../components/SEO/SEOHead";
import LoadingState from "../components/Loaders/LoadingState";
import { FiHome, FiMoon, FiSun } from "react-icons/fi";
import { HOME_ROUTE, PRACTICE_ROUTE } from "../utils/routes";
import { buildSolvePath } from "../utils/routes";
import { loadWeakTopicInsights, clearInsightsCache } from "../utils/weakTopicAnalyzer";
import MockHistoryPanel from "../components/Insights/MockHistoryPanel";
import useChartTheme from "../hooks/useChartTheme";
import CollapsibleSection from "../components/Layout/CollapsibleSection";
import SubjectProgressSortControl from "../components/Insights/SubjectProgressSortControl";
import {
  useSubjectProgressSort,
  sortSubjectProgress,
} from "../utils/subjectProgressSortPreference";
import { useTheme } from "../utils/theme";
import {
  isAptitudeQuestion,
  isAptitudeSubjectSlug,
  isDaQuestion,
  isIsroQuestion,
} from "../utils/examTrack";
import {
  readBranchPreferences,
  BRANCH_PREFERENCE_EVENT,
  getInsightTracksForSelectedBranches,
  isItemEligibleForTrack,
} from "../utils/branchPreference";
import { resolveQuestionIdentity } from "../utils/branchQuestionIdentity";

/* ── Formatting helpers ─────────────────────────────────────────────────── */

export function resolveQuestionDisplayTitle(item = {}, getQuestionById = null) {
  const storageKey = String(item?.storageKey || item?.question_uid || item?.uid || "").trim();

  // 1. If explicit human-readable title is already provided (and not just matching the raw storage key)
  const itemTitle = String(item?.title || "").trim();
  if (itemTitle && itemTitle !== storageKey) {
    return itemTitle;
  }

  // 2. Lookup in Question bank via getQuestionById
  if (typeof getQuestionById === "function" && storageKey) {
    const qObj = getQuestionById(storageKey);
    const qTitle = String(qObj?.title || "").trim();
    if (qTitle && qTitle !== storageKey) {
      return qTitle;
    }
  }

  // 3. Branch questions with pp: format (e.g. pp:me:2018:q57 or pp:ce:2020:q12-s2)
  const ppMatch = storageKey.match(/^pp:([a-z]+):(\d+):q(\d+)(?:-s(\d+))?/i);
  if (ppMatch) {
    const [, branch, yearStr, qNumStr, setStr] = ppMatch;
    const branchUpper = branch.toUpperCase();
    const year = Number(yearStr);
    const qNum = Number(qNumStr);
    const set = setStr ? Number(setStr) : null;
    const resolved = resolveQuestionIdentity(branch.toLowerCase(), year, set, qNum, 65);
    if (resolved?.title) {
      return resolved.title;
    }
    return `GATE ${branchUpper} ${year} | Question: ${qNum}`;
  }

  // 4. Aptitude questions (e.g. APT-RSN-9655, APT-ENG-6771, APT-QNT-3498, APT-SPT-1024)
  if (storageKey.startsWith("APT-") || storageKey.startsWith("apt-")) {
    const categoryPart = storageKey.slice(4, 7).toUpperCase();
    const categoryMap = {
      RSN: "Reasoning",
      ENG: "English",
      QNT: "Quantitative Aptitude",
      SPT: "Spatial Aptitude",
      VER: "Verbal Ability",
    };
    const catName = categoryMap[categoryPart] || item?.subjectLabel || "Aptitude";
    return `${catName} Practice`;
  }

  // 5. ISRO questions (e.g. isro:cs:2020:q12)
  const isroMatch = storageKey.match(/^isro:([a-z]+):(\d+):q(\d+)/i);
  if (isroMatch) {
    const [, branch, year, qNum] = isroMatch;
    return `ISRO ${branch.toUpperCase()} ${year} | Question: ${qNum}`;
  }

  // 6. DA questions (e.g. da:2024:q15 or da:2024:set1:q15)
  const daMatch = storageKey.match(/^da:(\d+)(?::set(\d+))?:q(\d+)/i);
  if (daMatch) {
    const [, year, set, qNum] = daMatch;
    const setStr = set ? `Set ${set} | ` : "";
    return `GATE DA ${year} | ${setStr}Question: ${qNum}`;
  }

  // 7. Questions with meaningful subject / subtopic labels
  if (item?.subjectLabel && item.subjectLabel !== "Unknown" && item.subjectLabel !== "General") {
    const firstSubtopic = Array.isArray(item.subtopics) && item.subtopics.length > 0
      ? item.subtopics[0]?.label || item.subtopics[0]?.slug
      : null;
    if (firstSubtopic) {
      return `${item.subjectLabel} · ${firstSubtopic} Question`;
    }
    return `${item.subjectLabel} Question`;
  }

  // 8. If all else fails, return storageKey
  return storageKey;
}

const formatNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("en-IN").format(numeric);
};

const formatPercent = (value, digits = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0%";
  return `${numeric.toFixed(digits)}%`;
};

const formatDuration = (durationMs) => {
  const numeric = Number(durationMs);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "0m";
  }
  const minutes = Math.max(1, Math.round(numeric / 60000));
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const getAccuracyTone = (accuracyRate, palette = {}) => {
  if (accuracyRate < 0.5) {
    return {
      label: "Needs focus",
      color: palette.accuracyLow || "var(--color-danger-text)",
      soft: "var(--color-danger-soft)",
      text: "var(--color-danger-text)",
      border: "var(--color-danger-border)",
    };
  }
  if (accuracyRate < 0.7) {
    return {
      label: "Can improve",
      color: palette.accuracyMedium || "var(--color-warning-text)",
      soft: "var(--color-warning-soft)",
      text: "var(--color-warning-text)",
      border: "var(--color-warning-border)",
    };
  }
  return {
    label: "Strong",
    color: palette.accuracyHigh || "var(--color-success-text)",
    soft: "var(--color-success-soft)",
    text: "var(--color-success-text)",
    border: "var(--color-success-border)",
  };
};


const relativeTimeLabel = (isoString) => {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "—";
  }
};

/* ── Tab definitions ────────────────────────────────────────────────────── */

const TABS = [
  { id: "overview", label: "Overview", icon: FaChartLine },
  { id: "review", label: "Review Queue", icon: FaCalendarCheck },
  { id: "infographics", label: "Infographics", icon: FaChartPie },
  { id: "wrong", label: "Wrong Answers", icon: FaTimesCircle },
  { id: "mock-history", label: "Mock History", icon: FaHistory },
];

/* ── Chart tooltip ──────────────────────────────────────────────────────── */

const ChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl p-4 shadow-xl backdrop-blur" style={{ backgroundColor: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)" }}>
        <p className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{data.label || data.name}</p>
        {data.subjectLabel ? (
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--chart-tooltip-muted)" }}>
            {data.subjectLabel}
          </p>
        ) : null}
        <div className="grid gap-1.5 mt-2">
          {data.accuracyRate != null && (
            <p className="text-sm flex justify-between gap-4" style={{ color: "var(--chart-tooltip-muted)" }}>
              <span>Accuracy:</span>
              <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>
                {formatPercent(data.accuracyRate * 100)}
              </span>
            </p>
          )}
          {data.attemptedCount != null && (
            <p className="text-sm flex justify-between gap-4" style={{ color: "var(--chart-tooltip-muted)" }}>
              <span>Attempts:</span>
              <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>
                {formatNumber(data.attemptedCount)}
              </span>
            </p>
          )}
          {data.coverageRate != null && (
            <p className="text-sm flex justify-between gap-4" style={{ color: "var(--chart-tooltip-muted)" }}>
              <span>Coverage:</span>
              <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>
                {formatPercent(data.coverageRate * 100)}
              </span>
            </p>
          )}
          {data.value != null && data.accuracyRate == null && (
            <p className="text-sm flex justify-between gap-4" style={{ color: "var(--chart-tooltip-muted)" }}>
              <span>Count:</span>
              <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{data.value}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/* ── Circular progress ring ─────────────────────────────────────────────── */

const ProgressRing = ({ value, size = 80, strokeWidth = 7, color = "#059669", label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  const dashOffset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--chart-ring-track)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm sm:text-base font-bold leading-none" style={{ color: "var(--chart-tooltip-text)" }}>
            {formatPercent(safeValue)}
          </span>
          {sublabel && (
            <span className="mt-0.5 text-[7.5px] font-semibold uppercase tracking-tight text-[color:var(--color-text-muted)] opacity-75">
              {sublabel}
            </span>
          )}
        </div>
      </div>
      {label && <p className="text-xs font-semibold text-center leading-tight" style={{ color: "var(--chart-tooltip-text)" }}>{label}</p>}
    </div>
  );
};

/* ── Stat card ──────────────────────────────────────────────────────────── */

const StatCard = ({ label, value, icon: Icon, accent = "sky", sublabel, isWideOnMobile = false }) => {
  const accentMap = {
    sky: {
      border: "border-sky-500/20 dark:border-sky-500/30",
      background: "bg-[color:var(--color-surface)]",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
    },
    rose: {
      border: "border-rose-500/20 dark:border-rose-500/30",
      background: "bg-[color:var(--color-surface)]",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    },
    amber: {
      border: "border-amber-500/20 dark:border-amber-500/30",
      background: "bg-[color:var(--color-surface)]",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
    emerald: {
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      background: "bg-[color:var(--color-surface)]",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    },
    violet: {
      border: "border-purple-500/20 dark:border-purple-500/30",
      background: "bg-[color:var(--color-surface)]",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    },
  };
  const token = accentMap[accent] || accentMap.sky;

  if (isWideOnMobile) {
    return (
      <div
        className={`rounded-2xl border ${token.border} ${token.background} p-3.5 sm:p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[color:var(--color-primary-border)] flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-3`}
      >
        <div className="flex items-center sm:justify-between gap-2.5 min-w-0">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)] truncate order-2 sm:order-1">{label}</p>
          {Icon && (
            <div className={`flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-xl sm:rounded-lg shrink-0 ${token.iconBg} order-1 sm:order-2`}>
              <Icon className="text-xs sm:text-[11px]" />
            </div>
          )}
        </div>
        <div className="flex sm:block flex-col items-end sm:items-start shrink-0">
          <p className="text-xl sm:text-2xl font-bold tabular-nums text-[color:var(--color-text)] tracking-tight leading-none sm:leading-tight">{value}</p>
          {sublabel && <p className="mt-0.5 sm:mt-1 text-[11px] text-[color:var(--color-text-muted)] opacity-75 truncate">{sublabel}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border ${token.border} ${token.background} p-3.5 sm:p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[color:var(--color-primary-border)] flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)] truncate">{label}</p>
        {Icon && (
          <div className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg shrink-0 ${token.iconBg}`}>
            <Icon className="text-[10px] sm:text-xs" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-xl sm:text-2xl font-bold tabular-nums text-[color:var(--color-text)] tracking-tight">{value}</p>
        {sublabel && <p className="mt-1 text-[11px] text-[color:var(--color-text-muted)] opacity-75 leading-tight line-clamp-1">{sublabel}</p>}
      </div>
    </div>
  );
};

/* ── Accuracy bar ───────────────────────────────────────────────────────── */

const AccuracyBar = ({ accuracyRate, className = "" }) => {
  const percent = Math.round((accuracyRate || 0) * 100);
  const tone = getAccuracyTone(accuracyRate);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--chart-ring-track)" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: tone.color }}
        />
      </div>
      <span className="text-sm font-semibold w-12 text-right" style={{ color: "var(--color-text)" }}>{formatPercent(percent)}</span>
    </div>
  );
};

/* ── Radar chart for subject overview ───────────────────────────────────── */

const formatRadarSubject = (label = "") => {
  const map = {
    // CSE Subjects
    "Computer Organization and Architecture": "COA",
    "Computer Organization & Architecture": "COA",
    "CO & Architecture": "COA",
    "Programming and DS": "Prog & DS",
    "Programming and Data Structures": "Prog & DS",
    "Programming & Data Structures": "Prog & DS",
    "Programming in C": "C Prog",
    "Algorithms": "Algorithms",
    "Theory of Computation": "TOC",
    "Compiler Design": "Compilers",
    "Operating System": "Operating Sys",
    "Operating Systems": "Operating Sys",
    "Database Management Systems": "DBMS",
    "Databases": "DBMS",
    "Computer Networks": "Networks",
    "Digital Logic": "Digital Logic",
    "Discrete Mathematics": "Discrete Math",
    "Engineering Mathematics": "Engg Math",
    "General Aptitude": "Aptitude",

    // Aptitude Modules
    "Verbal Aptitude": "Verbal",
    "English": "English",
    "Quantitative Aptitude": "Quant",
    "Analytical Aptitude": "Reasoning",
    "Spatial Aptitude": "Spatial",

    // DA Subjects
    "Linear Algebra": "Linear Algebra",
    "Probability and Statistics": "Probability",
    "Probability & Statistics": "Probability",
    "Calculus and Optimization": "Calculus",
    "Calculus & Optimization": "Calculus",
    "Programming & DSA": "Prog & DSA",
    "Programming in Python": "Python",
    "Machine Learning": "Machine Learning",
    "Artificial Intelligence": "AI",
    "Database Management and Warehousing": "DBMS & Warehousing",
    "Data Warehousing and Mining": "Data Mining",
  };
  return map[label] || (label.length > 13 ? `${label.slice(0, 11)}…` : label);
};

const SubjectRadarChart = ({ data = [] }) => {
  const chartTheme = useChartTheme();
  const attemptedSubjects = useMemo(
    () => data.filter((item) => Number(item.attemptedCount || 0) > 0),
    [data]
  );

  const canToggle = attemptedSubjects.length >= 3 && attemptedSubjects.length < data.length;
  const [showAll, setShowAll] = useState(false);

  const activeSubjects = useMemo(() => {
    if (showAll || attemptedSubjects.length < 3) {
      return data;
    }
    return attemptedSubjects;
  }, [data, attemptedSubjects, showAll]);

  const radarData = useMemo(() => {
    const seen = new Map();
    return activeSubjects.map((item) => {
      let subject = formatRadarSubject(item.label);
      if (seen.has(subject)) {
        const count = seen.get(subject) + 1;
        seen.set(subject, count);
        subject = `${subject} (${count})`;
      } else {
        seen.set(subject, 1);
      }
      return {
        subject,
        accuracy: Math.round(Number(item.accuracyRate || 0) * 100),
        coverage: Math.round(Number(item.coverageRate || 0) * 100),
        fullName: item.label,
        attemptedCount: Number(item.attemptedCount || 0),
        correctAttempts: Number(item.correctAttempts || 0),
        attemptedQuestions: Number(item.attemptedQuestions || 0),
        availableQuestions: Number(item.availableQuestions || 0),
      };
    });
  }, [activeSubjects]);

  if (radarData.length < 3) return null;

  return (
    <div className="space-y-3">
      {canToggle && (
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-[color:var(--color-text-muted)] font-medium">
            Showing {activeSubjects.length} of {data.length} subjects
          </span>
          <div className="inline-flex rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                !showAll
                  ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-sm font-semibold"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              }`}
            >
              Attempted ({attemptedSubjects.length})
            </button>
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                showAll
                  ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-sm font-semibold"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              }`}
            >
              All ({data.length})
            </button>
          </div>
        </div>
      )}

      <div className="h-[280px] sm:h-[340px] w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="62%">
            <PolarGrid stroke={chartTheme.grid} strokeWidth={1} strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: chartTheme.tick, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              axisLine={false}
              tick={{ fontSize: 10, fill: chartTheme.tickSecondary }}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload;
                return (
                  <div
                    className="rounded-xl p-3.5 text-xs shadow-xl backdrop-blur"
                    style={{
                      backgroundColor: "var(--chart-tooltip-bg)",
                      border: "1px solid var(--chart-tooltip-border)",
                    }}
                  >
                    <p
                      className="font-semibold text-sm mb-2"
                      style={{ color: "var(--chart-tooltip-text)" }}
                    >
                      {item.fullName}
                    </p>
                    <div className="space-y-1.5">
                      <div
                        className="flex items-center justify-between gap-4"
                        style={{ color: "var(--chart-tooltip-muted)" }}
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: chartTheme.seriesAccuracy }}
                          />
                          Accuracy:
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--chart-tooltip-text)" }}
                        >
                          {item.accuracy}% ({item.correctAttempts}/{item.attemptedCount} attempts)
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between gap-4"
                        style={{ color: "var(--chart-tooltip-muted)" }}
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: chartTheme.seriesCoverage }}
                          />
                          Coverage:
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--chart-tooltip-text)" }}
                        >
                          {item.coverage}% ({item.attemptedQuestions}/{item.availableQuestions} questions)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Radar
              name="Accuracy"
              dataKey="accuracy"
              stroke={chartTheme.seriesAccuracy}
              fill={chartTheme.seriesAccuracy}
              fillOpacity={0.25}
              strokeWidth={2.5}
              dot={{
                r: 3.5,
                fill: chartTheme.seriesAccuracy,
                stroke: chartTheme.tooltipBg,
                strokeWidth: 1.5,
              }}
              isAnimationActive={false}
            />
            <Radar
              name="Coverage"
              dataKey="coverage"
              stroke={chartTheme.seriesCoverage}
              fill={chartTheme.seriesCoverage}
              fillOpacity={0.12}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{
                r: 2.5,
                fill: chartTheme.seriesCoverage,
              }}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 pt-1 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: chartTheme.seriesAccuracy }}>
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: chartTheme.seriesAccuracy }} />
          Accuracy (Solid)
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: chartTheme.seriesCoverage }}>
          <span className="w-3.5 h-0.5 border-t-2 border-dashed" style={{ borderColor: chartTheme.seriesCoverage }} />
          Coverage (Dashed)
        </span>
      </div>
    </div>
  );
};

/* ── Correct/Incorrect Pie ──────────────────────────────────────────────── */

const CorrectIncorrectPie = ({ correct, incorrect }) => {
  const chartTheme = useChartTheme();
  const total = correct + incorrect;
  const pieData = [
    { name: "Correct", value: correct, fill: chartTheme.seriesCorrect },
    { name: "Incorrect", value: incorrect, fill: chartTheme.seriesIncorrect },
  ];
  if (total === 0) return null;

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            strokeWidth={0}
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
          <RechartsTooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Subject detail card (collapsible) ──────────────────────────────────── */

const TimeTrendChart = ({ data = [] }) => {
  const chartTheme = useChartTheme();
  const chartData = useMemo(() => (
    [...data]
      .slice(-14)
      .map((entry) => ({
        ...entry,
        displayDate: entry.date ? entry.date.slice(5) : "",
        accuracyPercent: Math.round(Number(entry.accuracyRate || 0) * 100),
      }))
  ), [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4 text-center text-xs sm:text-sm text-[color:var(--color-text-muted)]">
        Timed attempt trends will appear after your next practice or mock submission.
      </div>
    );
  }

  return (
    <div className="h-[260px] sm:h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
          <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTheme.tick }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTheme.tick }} allowDecimals={false} />
          <RechartsTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }
              const item = payload[0].payload;
              return (
                <div className="rounded-xl p-3.5 text-xs shadow-xl backdrop-blur tabular-nums" style={{ backgroundColor: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)" }}>
                  <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--chart-tooltip-text)" }}>{item.date}</p>
                  <p className="flex justify-between gap-4" style={{ color: "var(--chart-tooltip-muted)" }}>Attempts: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{item.attempts}</span></p>
                  <p className="flex justify-between gap-4" style={{ color: "var(--chart-tooltip-muted)" }}>Accuracy: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{formatPercent(item.accuracyPercent)}</span></p>
                  <p className="flex justify-between gap-4" style={{ color: "var(--chart-tooltip-muted)" }}>Avg time: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{formatDuration(item.averageDurationMs)}</span></p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="attempts"
            name="Attempts"
            stroke={chartTheme.seriesAccuracy}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const DifficultyBadge = ({ label = "Unrated", score = 0 }) => {
  const normalized = String(label || "Unrated");
  const tone = normalized === "Hard"
    ? { borderColor: "var(--color-danger-border)", backgroundColor: "var(--color-danger-soft)", color: "var(--color-danger-text)" }
    : normalized === "Medium"
      ? { borderColor: "var(--color-warning-border)", backgroundColor: "var(--color-warning-soft)", color: "var(--color-warning-text)" }
      : normalized === "Light"
        ? { borderColor: "var(--color-success-border)", backgroundColor: "var(--color-success-soft)", color: "var(--color-success-text)" }
        : { borderColor: "var(--color-neutral-border)", backgroundColor: "var(--color-neutral-soft)", color: "var(--color-neutral-text)" };

  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={tone}>
      {normalized}{Number(score) > 0 ? ` ${Math.round(score)}` : ""}
    </span>
  );
};

const SubjectDetailCard = ({ item, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const tone = getAccuracyTone(item.accuracyRate);

  return (
    <div className={`rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden transition-all ${isOpen ? "shadow-md" : "shadow-[var(--shadow-soft)]"}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[color:var(--color-surface-muted)] transition-colors"
        style={{ background: `linear-gradient(90deg, ${tone.soft}, transparent)` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: tone.color }}
          />
          <div className="min-w-0">
            <p className="text-base font-semibold text-[color:var(--color-text)] truncate">{item.label}</p>
            <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
              {formatNumber(item.attemptedCount)} attempts · {formatPercent(item.coverageRate * 100)} covered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ backgroundColor: tone.soft, color: tone.text }}
          >
            {tone.label}
          </span>
          <span className="text-lg font-bold" style={{ color: tone.color }}>
            {formatPercent(item.accuracyRate * 100)}
          </span>
          {isOpen ? <FaChevronUp className="text-xs text-[color:var(--color-text-muted)]" /> : <FaChevronDown className="text-xs text-[color:var(--color-text-muted)]" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 py-4 bg-[color:var(--color-surface)] border-t border-[color:var(--color-border)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-[color:var(--color-surface-muted)] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">Accuracy</p>
              <p className="text-lg font-bold text-[color:var(--color-text)]">{formatPercent(item.accuracyRate * 100)}</p>
            </div>
            <div className="rounded-xl bg-[color:var(--color-surface-muted)] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">Coverage</p>
              <p className="text-lg font-bold text-[color:var(--color-text)]">{formatPercent(item.coverageRate * 100)}</p>
            </div>
            <div className="rounded-xl bg-[color:var(--color-success-soft)] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-success-text)]">Correct</p>
              <p className="text-lg font-bold text-[color:var(--color-success-text)]">{formatNumber(item.correctAttempts)}</p>
            </div>
            <div className="rounded-xl bg-[color:var(--color-danger-soft)] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-danger-text)]">Incorrect</p>
              <p className="text-lg font-bold text-[color:var(--color-danger-text)]">{formatNumber(item.incorrectAttempts)}</p>
            </div>
          </div>
          <AccuracyBar accuracyRate={item.accuracyRate} className="mt-3" />
          {item.recentMistakeStreak > 0 && (
            <p className="mt-2 text-xs text-[color:var(--color-danger-text)] flex items-center gap-1">
              <FaFireAlt /> {item.recentMistakeStreak} consecutive mistake{item.recentMistakeStreak > 1 ? "s" : ""} recently
            </p>
          )}
        </div>
      )}
    </div>
  );
};


/* ── Subject progress rings ────────────────────────────────────────────── */

const SubjectProgressRings = ({ subjects = [] }) => {
  if (subjects.length === 0) return null;

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {subjects.map((item, index) => {
        const coveragePercent = Math.round((item.coverageRate || 0) * 100);
        const accuracyPercent = Math.round((item.accuracyRate || 0) * 100);
        const tone = getAccuracyTone(item.accuracyRate);
        const staggerClass = `stagger-card-${Math.min(5, (index % 5) + 1)}`;
        return (
          <div
            key={item.key}
            className={`${staggerClass} flex flex-col items-center justify-between gap-2.5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 sm:p-3.5 transition-all hover:scale-[1.02] shadow-[var(--shadow-soft)]`}
          >
            <ProgressRing
              value={coveragePercent}
              size={64}
              strokeWidth={6}
              color={tone.color}
              sublabel="Coverage"
            />
            <div className="w-full text-center">
              <p
                className="text-xs font-semibold text-[color:var(--color-text)] leading-snug line-clamp-2 min-h-[2rem] flex items-center justify-center"
                title={item.label}
              >
                {item.label}
              </p>
              <div className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[10px] text-[color:var(--color-text-muted)] w-full">
                <span className="font-bold tabular-nums" style={{ color: tone.color }}>
                  {accuracyPercent}%
                </span>
                <span className="opacity-75">acc</span>
                <span className="opacity-40">·</span>
                <span className="tabular-nums opacity-90">
                  {formatNumber(item.attemptedQuestions)}/{formatNumber(item.availableQuestions)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Focus areas (weak topic recommendations) ──────────────────────────── */

const FocusAreas = ({ subtopics = [] }) => {
  const [showAll, setShowAll] = useState(false);

  const allWeakSubtopics = useMemo(() =>
    subtopics
      .filter((st) => Number(st.attemptedCount || 0) > 0 && Number(st.accuracyRate || 0) < 0.6)
      .sort((a, b) => {
        if (a.accuracyRate !== b.accuracyRate) return a.accuracyRate - b.accuracyRate;
        return Number(b.attemptedCount || 0) - Number(a.attemptedCount || 0);
      }),
    [subtopics]
  );

  const displayedSubtopics = useMemo(() =>
    showAll ? allWeakSubtopics : allWeakSubtopics.slice(0, 4),
    [allWeakSubtopics, showAll]
  );

  if (allWeakSubtopics.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-950/20 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <FaCheckCircle className="text-lg" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              All Practiced Subtopics Above 60% Accuracy
            </p>
            <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
              No weak areas detected. Continue practicing new topics to maintain broad syllabus coverage.
            </p>
          </div>
        </div>
        <Link
          to={PRACTICE_ROUTE}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--color-primary)] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] shadow-sm shrink-0 self-stretch sm:self-auto justify-center"
        >
          Explore Topics <FaArrowRight className="text-[10px]" />
        </Link>
      </div>
    );
  }

  // Multi-subtopic practice URL for top weak areas
  const topWeak = allWeakSubtopics.slice(0, 3);
  const weakSubjects = Array.from(new Set(topWeak.map((st) => st.subjectSlug))).join(",");
  const weakSubtopicSlugs = topWeak
    .map((st) => st.subtopicSlug || (st.subjectSlug ? st.key.slice(st.subjectSlug.length + 1) : st.key.split(":")[1] || ""))
    .filter(Boolean)
    .join(",");
  const practiceAllWeakUrl = `${PRACTICE_ROUTE}?subjects=${encodeURIComponent(weakSubjects)}&subtopics=${encodeURIComponent(weakSubtopicSlugs)}&hideSolved=1`;

  return (
    <div className="space-y-3">
      {allWeakSubtopics.length > 1 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
          <div className="text-xs text-[color:var(--color-text-muted)]">
            <span className="font-bold text-[color:var(--color-text)]">{allWeakSubtopics.length} subtopics</span> below 60% proficiency threshold.
          </div>
          <Link
            to={practiceAllWeakUrl}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[color:var(--color-primary)] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] shadow-xs shrink-0"
          >
            Practice Top Weak Areas <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {displayedSubtopics.map((st) => {
          const accuracyPercent = Math.round(Number(st.accuracyRate || 0) * 100);
          const tone = getAccuracyTone(st.accuracyRate);
          const subtopicSlug = st.subtopicSlug || (st.subjectSlug ? st.key.slice(st.subjectSlug.length + 1) : st.key.split(":")[1] || "");
          const practiceUrl = `${PRACTICE_ROUTE}?subjects=${encodeURIComponent(st.subjectSlug)}&subtopics=${encodeURIComponent(subtopicSlug)}&hideSolved=1`;
          const mistakeCount = Math.max(0, Number(st.attemptedCount || 0) - Number(st.correctAttempts || 0));
          const unattemptedQuestions = Math.max(0, Number(st.availableQuestions || 0) - Number(st.attemptedQuestions || 0));

          return (
            <div
              key={st.key}
              className="flex flex-col justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3.5 sm:p-4 transition-all hover:border-[color:var(--color-primary-border)] hover:shadow-md group shadow-[var(--shadow-soft)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] border border-[color:var(--color-border)] truncate max-w-[65%]">
                    {st.subjectLabel}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${tone.color}18`, color: tone.color }}
                  >
                    {accuracyPercent}%
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[color:var(--color-text)] group-hover:text-[color:var(--color-primary)] transition-colors truncate" title={st.label}>
                  {st.label}
                </h3>

                {/* Accuracy mini bar */}
                <div className="mt-2.5 mb-2">
                  <div className="h-1.5 w-full rounded-full bg-[color:var(--color-surface-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, accuracyPercent)}%`, backgroundColor: tone.color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[color:var(--color-text-muted)]">
                  <span>
                    {Number(st.correctAttempts || 0)}/{Number(st.attemptedCount || 0)} correct
                    {mistakeCount > 0 && <span className="text-rose-500 dark:text-rose-400 font-medium ml-1">({mistakeCount} {mistakeCount === 1 ? "miss" : "misses"})</span>}
                  </span>
                  {unattemptedQuestions > 0 && (
                    <span>{unattemptedQuestions} new left</span>
                  )}
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[color:var(--color-border)] flex items-center justify-end">
                <Link
                  to={practiceUrl}
                  className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-soft)] transition-colors"
                >
                  Practice <FaArrowRight className="text-[9px] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {allWeakSubtopics.length > 4 && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-xs font-semibold text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors shadow-xs"
          >
            {showAll ? "Show Top 4 Priority" : `View all ${allWeakSubtopics.length} weak topics`}
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Smart Practice Banner ──────────────────────────────────────────────── */

const SmartPracticeBanner = ({ subtopics = [], reviewQueue = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startReviewSession } = useSession();
  const { getQuestionById } = useFilterActions();

  const weakSubtopics = useMemo(() =>
    subtopics.filter((st) => st.attemptedCount > 0 && st.accuracyRate < 0.6),
    [subtopics]
  );
  
  const hasReviewDue = reviewQueue.length > 0;
  const hasWeakAreas = weakSubtopics.length > 0;
  
  const handleStartReview = useCallback((e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!hasReviewDue || reviewQueue.length === 0) return;
    const initialKey = reviewQueue[0].storageKey;
    const questionPool = reviewQueue
      .map((item) => (getQuestionById ? getQuestionById(item.storageKey) : null) || { question_uid: item.storageKey })
      .filter(Boolean);
    if (typeof startReviewSession === "function") {
      startReviewSession(questionPool, initialKey);
    }
    navigate(buildSolvePath(initialKey), {
      state: { returnTo: `${location.pathname}${location.search}` },
    });
  }, [hasReviewDue, reviewQueue, getQuestionById, startReviewSession, navigate, location.pathname, location.search]);

  if (!hasReviewDue && !hasWeakAreas) return null;

  // Build the multi-subtopic URL for the weakest areas (max 3 to avoid giant URLs)
  const topWeak = weakSubtopics.slice(0, 3);
  const weakSubjects = Array.from(new Set(topWeak.map((st) => st.subjectSlug))).join(",");
  const weakSubtopicSlugs = topWeak
    .map((st) => st.subtopicSlug || (st.subjectSlug ? st.key.slice(st.subjectSlug.length + 1) : st.key.split(":")[1] || ""))
    .filter(Boolean)
    .join(",");
  const practiceWeakUrl = `${PRACTICE_ROUTE}?subjects=${encodeURIComponent(weakSubjects)}&subtopics=${encodeURIComponent(weakSubtopicSlugs)}&hideSolved=1`;
  
  const reviewUrl = hasReviewDue ? buildSolvePath(reviewQueue[0].storageKey) : "#";

  return (
    <div className={`grid gap-4 ${hasReviewDue && hasWeakAreas ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
      {hasReviewDue && (
        <section className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaCalendarCheck className="text-[color:var(--color-text-muted)] text-lg" />
              <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Spaced Repetition</h2>
            </div>
            <p className="text-sm text-[color:var(--color-text-muted)] mb-4">
              <strong className="text-[color:var(--color-text)] font-bold">{reviewQueue.length}</strong> questions are due for review today to maintain your memory retention.
            </p>
          </div>
          <Link
            to={reviewUrl}
            onClick={handleStartReview}
            className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-primary-hover)] cursor-pointer"
          >
            Start Review <FaArrowRight />
          </Link>
        </section>
      )}
      
      {hasWeakAreas && (
        <section className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaBullseye className="text-[color:var(--color-text-muted)] text-lg" />
              <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Practice Weak Areas</h2>
            </div>
            <p className="text-sm text-[color:var(--color-text-muted)] mb-4">
              You have <strong className="text-[color:var(--color-text)] font-bold">{weakSubtopics.length}</strong> subtopics with accuracy below 60%. Focus on unsolved questions to improve.
            </p>
          </div>
          <Link
            to={practiceWeakUrl}
            className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-primary-hover)]"
          >
            Auto-filter Practice <FaArrowRight />
          </Link>
        </section>
      )}
    </div>
  );
};

/* ── Year Coverage Grid ─────────────────────────────────────────────────── */

const YearCoverageGrid = ({ years = [] }) => {
  if (years.length === 0) return null;
  
  // Create decade groups
  const decades = {};
  years.forEach(year => {
    const decade = Math.floor(Number(year.key) / 10) * 10;
    if (!decades[decade]) decades[decade] = [];
    decades[decade].push(year);
  });

  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-base sm:text-lg font-semibold text-[color:var(--color-text)]">Decade &amp; Year Breakdown</h2>
      <p className="mt-0.5 text-xs sm:text-sm text-[color:var(--color-text-muted)] mb-4">
        Ensure you have solved questions from all recent exam years.
      </p>
      
      <div className="space-y-5">
        {Object.entries(decades).sort(([a], [b]) => Number(b) - Number(a)).map(([decade, decadeYears]) => (
          <div key={decade}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-muted)] mb-2.5 tabular-nums">{decade}s</h3>
            <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {decadeYears.sort((a, b) => Number(b.key) - Number(a.key)).map(year => {
                const coveragePercent = Math.round((year.coverageRate || 0) * 100);
                const isZero = coveragePercent === 0;
                const accuracyPercent = Math.round((year.accuracyRate || 0) * 100);
                const practiceUrl = `${PRACTICE_ROUTE}?years=${year.key}&hideSolved=1`;
                
                return (
                  <Link
                    key={year.key}
                    to={practiceUrl}
                    className={`group block rounded-xl border p-2.5 sm:p-3 transition-all ${
                      isZero 
                        ? "border-dashed border-[color:var(--color-border)] bg-transparent hover:border-[color:var(--color-primary-border)] hover:bg-[color:var(--color-surface-muted)]" 
                        : "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] hover:border-[color:var(--color-primary)] hover:shadow-xs"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold tabular-nums text-xs sm:text-sm text-[color:var(--color-text)]">{year.key}</span>
                      <span className="text-[10px] font-semibold tabular-nums text-[color:var(--color-text-muted)]">{coveragePercent}% cov</span>
                    </div>
                    <div className="w-full h-1.5 bg-[color:var(--color-border)] rounded-full mb-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-[color:var(--color-primary)] rounded-full transition-all duration-300" 
                        style={{ width: `${coveragePercent}%` }}
                      />
                    </div>
                    {!isZero && (
                      <div className="flex justify-between items-center text-[10px] tabular-nums">
                        <span className="text-[color:var(--color-text-muted)]">{year.attemptedQuestions}/{year.availableQuestions} Qs</span>
                        <span className="font-bold" style={{ color: getAccuracyTone(year.accuracyRate).color }}>{accuracyPercent}% acc</span>
                      </div>
                    )}
                    {isZero && (
                      <div className="text-[10px] text-[color:var(--color-text-muted)] text-center tabular-nums">
                        {year.availableQuestions} Qs available
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Year-wise Accuracy Trend ───────────────────────────────────────────── */

const YearAccuracyTrend = ({ years = [] }) => {
  const chartData = useMemo(() => {
    return years
      .filter(y => y.attemptedCount > 0)
      .map(y => ({
        year: y.key,
        accuracy: Math.round((y.accuracyRate || 0) * 100)
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [years]);
  
  const theme = useChartTheme();

  if (chartData.length < 3) return null;

  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-base sm:text-lg font-semibold text-[color:var(--color-text)]">Year-wise Accuracy Trend</h2>
      <p className="mt-0.5 text-xs sm:text-sm text-[color:var(--color-text-muted)] mb-4">
        Exam question solving performance across recent GATE examination cycles.
      </p>
      
      <div className="h-60 sm:h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={chartData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: theme.text }} 
              dy={10} 
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: theme.text }} 
              dx={-5} 
              tickFormatter={(val) => `${val}%`} 
            />
            <RechartsTooltip content={<ChartTooltip />} />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              name="Accuracy" 
              stroke="var(--chart-series-primary, #6366f1)" 
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--chart-series-primary, #6366f1)", strokeWidth: 2, stroke: "var(--color-surface)" }}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

/* ── Overview tab ───────────────────────────────────────────────────────── */

const OverviewTab = ({ insights = {}, summary = {} }) => {
  const subjectsList = Array.isArray(insights?.subjects) ? insights.subjects : [];
  const subtopicsList = Array.isArray(insights?.subtopics) ? insights.subtopics : [];
  const reviewQueueList = Array.isArray(insights?.reviewQueue) ? insights.reviewQueue : [];
  const [subjectSortOption, setSubjectSortOption] = useSubjectProgressSort();

  const sortedSubjectsList = useMemo(() => {
    return sortSubjectProgress(subjectsList, subjectSortOption);
  }, [subjectsList, subjectSortOption]);

  const totalCorrect = useMemo(() =>
    subjectsList.reduce((sum, s) => sum + (Number(s?.correctAttempts) || 0), 0)
  , [subjectsList]);
  const totalIncorrect = useMemo(() =>
    subjectsList.reduce((sum, s) => sum + (Number(s?.incorrectAttempts) || 0), 0)
  , [subjectsList]);

  return (
    <div className="space-y-6">
      {/* Stat cards row */}
      <div className={`grid gap-2.5 sm:gap-3 grid-cols-2 md:grid-cols-3 ${summary.mockAttemptedQuestionCount > 0 ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
        <div className="stagger-card-1">
          <StatCard
            label="Attempted"
            value={formatNumber(summary.attemptedQuestionCount)}
            icon={FaEye}
            accent="sky"
            sublabel="questions tried"
          />
        </div>
        <div className="stagger-card-2">
          <StatCard
            label="Avg Accuracy"
            value={formatPercent(summary.overallAccuracyRate * 100)}
            icon={FaBullseye}
            accent={summary.overallAccuracyRate >= 0.7 ? "emerald" : summary.overallAccuracyRate >= 0.5 ? "amber" : "rose"}
            sublabel="across submissions"
          />
        </div>
        <div className="stagger-card-3">
          <StatCard
            label="Correct"
            value={formatNumber(totalCorrect)}
            icon={FaCheckCircle}
            accent="emerald"
            sublabel={`of ${formatNumber(totalCorrect + totalIncorrect)} submissions`}
          />
        </div>
        <div className="stagger-card-4">
          <StatCard
            label="Due Review"
            value={formatNumber(summary.dueReviewCount)}
            icon={FaCalendarCheck}
            accent={summary.dueReviewCount > 0 ? "amber" : "emerald"}
            sublabel="questions ready"
          />
        </div>
        <div className={`stagger-card-5 ${summary.mockAttemptedQuestionCount > 0 ? "" : "col-span-2 sm:col-span-1"}`}>
          <StatCard
            label="Avg Time"
            value={formatDuration(summary.averageDurationMs)}
            icon={FaClock}
            accent="violet"
            sublabel="per timed attempt"
            isWideOnMobile={summary.mockAttemptedQuestionCount <= 0}
          />
        </div>
        {summary.mockAttemptedQuestionCount > 0 ? (
          <div>
            <StatCard
              label="Mock Attempts"
              value={formatNumber(summary.mockAttemptedQuestionCount)}
              icon={FaHistory}
              accent="sky"
              sublabel={`${formatPercent(summary.mockAccuracyRate * 100)} accuracy`}
            />
          </div>
        ) : null}
      </div>

      {/* Subject Progress — collapsible, open by default */}
      {subjectsList.length > 0 && (
        <CollapsibleSection
          title={
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <FaChartLine className="text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Subject Progress</h2>
              </div>
            </div>
          }
          headerAction={
            <SubjectProgressSortControl
              value={subjectSortOption}
              onChange={setSubjectSortOption}
            />
          }
          defaultOpen={true}
        >
          <SubjectProgressRings subjects={sortedSubjectsList} />
        </CollapsibleSection>
      )}

      {/* Focus Areas — collapsible, open by default when weak areas exist */}
      {(() => {
        const weakCount = subtopicsList.filter(
          (st) => Number(st.attemptedCount || 0) > 0 && Number(st.accuracyRate || 0) < 0.6
        ).length;
        const hasAttempts = subtopicsList.some(
          (st) => Number(st.attemptedCount || 0) > 0
        );

        if (!hasAttempts) return null;

        return (
          <CollapsibleSection
            title={
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5 ${
                    weakCount > 0
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}
                >
                  {weakCount > 0 ? (
                    <FaBullseye className="text-base" />
                  ) : (
                    <FaCheckCircle className="text-base" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Focus Areas</h2>
                    {weakCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {weakCount} {weakCount === 1 ? "topic needs" : "topics need"} work
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        All strong (≥ 60%)
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                    {weakCount > 0
                      ? "Subtopics with accuracy below 60%. Targeted practice here yields maximum score gains."
                      : "Great job! All your practiced subtopics currently have 60%+ accuracy."}
                  </p>
                </div>
              </div>
            }
            defaultOpen={weakCount > 0}
          >
            <FocusAreas subtopics={subtopicsList} />
          </CollapsibleSection>
        );
      })()}

      {/* Smart Practice Banner — always visible */}
      <SmartPracticeBanner subtopics={subtopicsList} reviewQueue={reviewQueueList} />

      {/* All Subjects — collapsible, closed by default */}
      <CollapsibleSection
        title={
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5 bg-slate-500/10 text-slate-500 border border-slate-500/20">
              <FaFilter className="text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-[color:var(--color-text)]">All Subjects Breakdown</h2>
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                Tap any subject to inspect granular topic accuracy and error distributions.
              </p>
            </div>
          </div>
        }
        defaultOpen={false}
      >
        <div className="space-y-2">
          {subjectsList.map((item) => (
            <SubjectDetailCard key={item.key} item={item} />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

/* ── Infographics tab ──────────────────────────────────────────────────── */

const InfographicsTab = ({ insights = {}, summary = {} }) => {
  const subjectsList = Array.isArray(insights?.subjects) ? insights.subjects : [];
  const attemptTimeline = Array.isArray(insights?.attemptTimeline) ? insights.attemptTimeline : [];
  const years = Array.isArray(insights?.years) ? insights.years : [];

  const totalCorrect = useMemo(() =>
    subjectsList.reduce((sum, s) => sum + (Number(s?.correctAttempts) || 0), 0)
  , [subjectsList]);
  const totalIncorrect = useMemo(() =>
    subjectsList.reduce((sum, s) => sum + (Number(s?.incorrectAttempts) || 0), 0)
  , [subjectsList]);

  return (
    <div className="space-y-6">
      {/* Skill Radar — collapsible, open by default */}
      <CollapsibleSection
        title={
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              <FaCompass className="text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-[color:var(--color-text)]">Skill Radar</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                360° overview of accuracy (solid blue) and syllabus coverage (dashed purple) across subjects.
              </p>
            </div>
          </div>
        }
        defaultOpen={true}
      >
        {subjectsList.length >= 3 ? (
          <SubjectRadarChart data={subjectsList} />
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <CorrectIncorrectPie correct={totalCorrect} incorrect={totalIncorrect} />
            <div className="flex items-center gap-4 text-xs sm:text-sm text-[color:var(--color-text-muted)] font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--chart-series-correct, #059669)" }} />
                <span>Correct: <strong className="tabular-nums text-[color:var(--color-text)]">{formatNumber(totalCorrect)}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--chart-series-incorrect, #e11d48)" }} />
                <span>Incorrect: <strong className="tabular-nums text-[color:var(--color-text)]">{formatNumber(totalIncorrect)}</strong></span>
              </span>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Practice Trend — collapsible, open by default */}
      <CollapsibleSection
        title={
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FaClock className="text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-[color:var(--color-text)]">Practice Trend</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                Daily attempt volume and accuracy over time from practice and mock submissions.
              </p>
            </div>
          </div>
        }
        defaultOpen={true}
      >
        <TimeTrendChart data={attemptTimeline} />
      </CollapsibleSection>

      {/* Exam Year Coverage — collapsible, open by default */}
      {years.length > 0 && (
        <CollapsibleSection
          title={
            <div className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <FaHistory className="text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-[color:var(--color-text)]">Exam Year Coverage</h2>
                <p className="mt-0.5 text-xs sm:text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                  Breakdown of attempted vs total available questions across GATE exam years.
                </p>
              </div>
            </div>
          }
          defaultOpen={true}
        >
          <div className="space-y-6">
            <YearCoverageGrid years={years} />
            <YearAccuracyTrend years={years} />
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

/* ── Review Queue tab ───────────────────────────────────────────────────── */

const ITEMS_PER_PAGE = 15;

const ReviewQueueTab = ({ reviewQueue = [], onSwitchTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startReviewSession } = useSession();
  const { getQuestionById } = useFilterActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const [currentPage, setCurrentPage] = useState(1);

  const subjects = useMemo(() => {
    const set = new Set();
    reviewQueue.forEach((item) => {
      if (item.subjectLabel) set.add(item.subjectLabel);
    });
    return Array.from(set).sort();
  }, [reviewQueue]);

  const hardDueCount = useMemo(
    () => reviewQueue.filter((item) => item.difficultyLabel === "Hard").length,
    [reviewQueue]
  );

  const maxOverdueDays = useMemo(
    () => reviewQueue.reduce((max, item) => Math.max(max, Number(item.daysOverdue || 0)), 0),
    [reviewQueue]
  );

  const filtered = useMemo(() => {
    let result = [...reviewQueue];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => {
        const key = String(item.storageKey || "").toLowerCase();
        const title = resolveQuestionDisplayTitle(item, getQuestionById).toLowerCase();
        const subject = String(item.subjectLabel || "").toLowerCase();
        const subtopics = (Array.isArray(item.subtopics) ? item.subtopics : [])
          .map((s) => String(s?.label || s?.slug || "").toLowerCase())
          .join(" ");
        return key.includes(q) || title.includes(q) || subject.includes(q) || subtopics.includes(q);
      });
    }

    if (subjectFilter !== "all") {
      result = result.filter((item) => item.subjectLabel === subjectFilter);
    }

    if (difficultyFilter !== "all") {
      result = result.filter(
        (item) => String(item.difficultyLabel || "").toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      if (sortBy === "urgency") {
        const overdueA = Number(a.daysOverdue || 0);
        const overdueB = Number(b.daysOverdue || 0);
        if (overdueB !== overdueA) return overdueB - overdueA;
        return Number(b.difficultyScore || 0) - Number(a.difficultyScore || 0);
      }
      if (sortBy === "difficulty") {
        return Number(b.difficultyScore || 0) - Number(a.difficultyScore || 0);
      }
      if (sortBy === "level-asc") {
        return Number(a.reviewLevel || 0) - Number(b.reviewLevel || 0);
      }
      if (sortBy === "level-desc") {
        return Number(b.reviewLevel || 0) - Number(a.reviewLevel || 0);
      }
      return String(a.storageKey || "").localeCompare(String(b.storageKey || ""));
    });

    return result;
  }, [reviewQueue, searchQuery, subjectFilter, difficultyFilter, sortBy, getQuestionById]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, subjectFilter, difficultyFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleNavigateToQuestion = useCallback((storageKey) => {
    const questionPool = reviewQueue
      .map((item) => (getQuestionById ? getQuestionById(item.storageKey) : null) || { question_uid: item.storageKey })
      .filter(Boolean);
    if (typeof startReviewSession === "function") {
      startReviewSession(questionPool, storageKey);
    }
    navigate(buildSolvePath(storageKey), {
      state: { returnTo: `${location.pathname}${location.search}` },
    });
  }, [navigate, location.pathname, location.search, reviewQueue, getQuestionById, startReviewSession]);

  const handleStartReviewAll = useCallback(() => {
    const targetPool = filtered.length > 0 ? filtered : reviewQueue;
    if (!targetPool.length) return;
    handleNavigateToQuestion(targetPool[0].storageKey);
  }, [filtered, reviewQueue, handleNavigateToQuestion]);

  const hasActiveFilters = searchQuery.trim() !== "" || subjectFilter !== "all" || difficultyFilter !== "all" || sortBy !== "urgency";
  const handleResetFilters = () => {
    setSearchQuery("");
    setSubjectFilter("all");
    setDifficultyFilter("all");
    setSortBy("urgency");
  };

  if (reviewQueue.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-center shadow-[var(--shadow-soft)] max-w-xl mx-auto">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <FaCheckCircle className="text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-[color:var(--color-text)]">Review Queue Clear</h2>
        <p className="mt-2 text-sm text-[color:var(--color-text-muted)] text-pretty">
          All scheduled spaced-repetition reviews are complete. Questions you practice will automatically enter review cycles based on your performance.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
          >
            Practice Questions <FaArrowRight className="text-[10px]" />
          </Link>
          {typeof onSwitchTab === "function" && (
            <button
              type="button"
              onClick={() => onSwitchTab("wrong")}
              className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2.5 text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)]"
            >
              Check Wrong Answers <FaArrowRight className="text-[10px]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Due Reviews"
          value={formatNumber(reviewQueue.length)}
          icon={FaCalendarCheck}
          accent="amber"
          sublabel="Scheduled for repetition"
        />
        <StatCard
          label="Hard Due"
          value={formatNumber(hardDueCount)}
          icon={FaExclamationTriangle}
          accent="rose"
          sublabel="High priority target"
        />
        <StatCard
          label="Max Overdue"
          value={maxOverdueDays > 0 ? `${formatNumber(maxOverdueDays)}d` : "0d"}
          icon={FaHistory}
          accent="sky"
          sublabel={maxOverdueDays > 0 ? "Longest pending card" : "All up to date"}
          isWideOnMobile={true}
        />
      </div>

      {/* Filter and control toolbar */}
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[color:var(--color-text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by UID, title, or topic..."
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-8 pr-8 py-2 text-xs sm:text-sm text-[color:var(--color-text)] placeholder-[color:var(--color-text-muted)]/70 focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] p-1"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter by subject"
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-2 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            >
              <option value="all">All Subjects ({reviewQueue.length})</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              aria-label="Filter by difficulty"
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-2 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            >
              <option value="all">All Difficulties</option>
              <option value="hard">Hard</option>
              <option value="medium">Medium</option>
              <option value="light">Light</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort queue by"
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-2 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            >
              <option value="urgency">Sort: Most Overdue</option>
              <option value="difficulty">Sort: Hardest First</option>
              <option value="level-asc">Sort: Lowest Level</option>
              <option value="level-desc">Sort: Highest Level</option>
            </select>

            {filtered.length > 0 && (
              <button
                type="button"
                onClick={handleStartReviewAll}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--color-primary)] hover:opacity-95 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition shrink-0 ml-auto sm:ml-0"
              >
                <FaPlay className="text-[9px]" />
                <span>Start Review ({filtered.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)] pt-1 border-t border-[color:var(--color-border)]/50">
          <span className="tabular-nums">
            Showing <strong className="text-[color:var(--color-text)]">{paginated.length}</strong> of <strong className="text-[color:var(--color-text)]">{filtered.length}</strong> due question{filtered.length !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--color-primary)] hover:underline"
            >
              <FaRedo className="text-[9px]" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Review cards list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-center shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold text-[color:var(--color-text)]">No review questions match your filters</p>
          <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Try adjusting your search query, subject, or difficulty criteria.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] transition"
          >
            <FaRedo className="text-[9px]" /> Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {paginated.map((item, index) => {
            const subtopicLabels = (Array.isArray(item.subtopics) ? item.subtopics : [])
              .map((subtopic) => subtopic?.label || subtopic?.slug || "")
              .filter(Boolean)
              .slice(0, 2);
            const isOverdue = Number(item.daysOverdue || 0) > 0;
            const dueLabel = isOverdue ? `${item.daysOverdue}d overdue` : "Due today";

            return (
              <button
                key={`${item.storageKey}-${index}`}
                type="button"
                onClick={() => handleNavigateToQuestion(item.storageKey)}
                className="group block w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3.5 sm:p-4 text-left transition-all duration-150 hover:border-[color:var(--color-primary-border)] hover:bg-[color:var(--color-surface-hover)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const displayTitle = resolveQuestionDisplayTitle(item, getQuestionById);
                        const isDifferent = displayTitle !== item.storageKey;
                        return (
                          <span
                            className="text-xs sm:text-sm font-semibold text-[color:var(--color-text)] truncate max-w-[280px] sm:max-w-md"
                            title={`Question ID: ${item.storageKey}`}
                          >
                            {isDifferent ? (
                              <>
                                <span>{displayTitle}</span>
                                <span className="sr-only">{item.storageKey}</span>
                              </>
                            ) : (
                              item.storageKey
                            )}
                          </span>
                        );
                      })()}
                      {item.type && (
                        <span className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                          {item.type}
                        </span>
                      )}
                      <DifficultyBadge label={item.difficultyLabel} score={item.difficultyScore} />
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                          <FaClock className="text-[9px]" />
                          {dueLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {dueLabel}
                        </span>
                      )}
                      <span className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-text-muted)] tabular-nums">
                        Level {item.reviewLevel || 0}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[color:var(--color-text-muted)]">
                      <span className="font-semibold text-[color:var(--color-text)]">{item.subjectLabel}</span>
                      {subtopicLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] text-[color:var(--color-text-muted)] max-w-[160px] truncate"
                        >
                          {label}
                        </span>
                      ))}
                      {item.attempts > 0 && (
                        <span className="text-[11px] text-[color:var(--color-text-muted)] tabular-nums sm:ml-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.correctAttempts}✓</span>{" "}
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">{item.incorrectAttempts}✗</span> of {item.attempts}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end sm:flex-col sm:items-end gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-[color:var(--color-border)]/50">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-primary)] group-hover:translate-x-0.5 transition-transform">
                      <span>Review</span>
                      <FaArrowRight className="text-[10px]" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            aria-label="Previous page"
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs sm:text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-xs sm:text-sm text-[color:var(--color-text-muted)] tabular-nums px-3">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Next page"
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs sm:text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Wrong Answers tab ──────────────────────────────────────────────────── */

const WrongAnswersTab = ({ wrongQuestions = [], onSwitchTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startReviewSession } = useSession();
  const { getQuestionById } = useFilterActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "still-wrong" | "recovered"
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);

  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(wrongQuestions.map((q) => q.subjectLabel).filter(Boolean));
    return Array.from(uniqueSubjects).sort();
  }, [wrongQuestions]);

  const stillWrongCount = useMemo(
    () => wrongQuestions.filter((q) => !q.lastCorrect).length,
    [wrongQuestions]
  );
  const recoveredCount = useMemo(
    () => wrongQuestions.filter((q) => q.lastCorrect).length,
    [wrongQuestions]
  );

  const filtered = useMemo(() => {
    let result = [...wrongQuestions];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => {
        const key = String(item.storageKey || "").toLowerCase();
        const title = resolveQuestionDisplayTitle(item, getQuestionById).toLowerCase();
        const subject = String(item.subjectLabel || "").toLowerCase();
        const subtopics = (Array.isArray(item.subtopics) ? item.subtopics : [])
          .map((s) => String(s?.label || s?.slug || "").toLowerCase())
          .join(" ");
        return key.includes(q) || title.includes(q) || subject.includes(q) || subtopics.includes(q);
      });
    }

    if (subjectFilter !== "all") {
      result = result.filter((q) => q.subjectLabel === subjectFilter);
    }

    if (statusFilter === "still-wrong") {
      result = result.filter((q) => !q.lastCorrect);
    } else if (statusFilter === "recovered") {
      result = result.filter((q) => q.lastCorrect);
    }

    if (difficultyFilter !== "all") {
      result = result.filter(
        (q) => String(q.difficultyLabel || "").toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (q) => String(q.type || "").toLowerCase() === typeFilter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      if (sortBy === "recent") {
        if (a.lastCorrect !== b.lastCorrect) {
          return a.lastCorrect ? 1 : -1;
        }
        return String(b.lastSubmittedAt || "").localeCompare(String(a.lastSubmittedAt || ""));
      }
      if (sortBy === "mistakes") {
        return Number(b.incorrectAttempts || 0) - Number(a.incorrectAttempts || 0);
      }
      if (sortBy === "difficulty") {
        return Number(b.difficultyScore || 0) - Number(a.difficultyScore || 0);
      }
      return String(a.storageKey || "").localeCompare(String(b.storageKey || ""));
    });

    return result;
  }, [wrongQuestions, searchQuery, subjectFilter, statusFilter, difficultyFilter, typeFilter, sortBy, getQuestionById]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, subjectFilter, statusFilter, difficultyFilter, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleNavigateToQuestion = useCallback((storageKey) => {
    navigate(buildSolvePath(storageKey), {
      state: { returnTo: `${location.pathname}${location.search}` },
    });
  }, [navigate, location.pathname, location.search]);

  const handleDrillStillWrong = useCallback(() => {
    const stillWrongPool = wrongQuestions.filter((q) => !q.lastCorrect);
    if (!stillWrongPool.length) return;
    const firstKey = stillWrongPool[0].storageKey;
    const questionPool = stillWrongPool
      .map((item) => (getQuestionById ? getQuestionById(item.storageKey) : null) || { question_uid: item.storageKey })
      .filter(Boolean);
    if (typeof startReviewSession === "function") {
      startReviewSession(questionPool, firstKey);
    }
    handleNavigateToQuestion(firstKey);
  }, [wrongQuestions, getQuestionById, startReviewSession, handleNavigateToQuestion]);

  const hasActiveFilters = searchQuery.trim() !== "" || subjectFilter !== "all" || statusFilter !== "all" || difficultyFilter !== "all" || typeFilter !== "all" || sortBy !== "recent";
  const handleResetFilters = () => {
    setSearchQuery("");
    setSubjectFilter("all");
    setStatusFilter("all");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setSortBy("recent");
  };

  if (wrongQuestions.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-center shadow-[var(--shadow-soft)] max-w-xl mx-auto">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <FaCheckCircle className="text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-[color:var(--color-text)]">Zero Incorrect Questions</h2>
        <p className="mt-2 text-sm text-[color:var(--color-text-muted)] text-pretty">
          You haven't logged any incorrect attempts yet. Continue solving practice questions to identify and master challenging concepts.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)]"
          >
            Start Practicing <FaArrowRight className="text-[10px]" />
          </Link>
          {typeof onSwitchTab === "function" && (
            <button
              type="button"
              onClick={() => onSwitchTab("review")}
              className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2.5 text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface)]"
            >
              Check Review Queue <FaArrowRight className="text-[10px]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Total Wrong"
          value={formatNumber(wrongQuestions.length)}
          icon={FaTimesCircle}
          accent="rose"
          sublabel="Questions missed at least once"
        />
        <StatCard
          label="Still Wrong"
          value={formatNumber(stillWrongCount)}
          icon={FaExclamationTriangle}
          accent="amber"
          sublabel="Last attempt was incorrect"
        />
        <StatCard
          label="Recovered"
          value={formatNumber(recoveredCount)}
          icon={FaCheckCircle}
          accent="emerald"
          sublabel="Answered correctly since"
          isWideOnMobile={true}
        />
      </div>

      {/* Filter and control toolbar */}
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status segmented control */}
          <div className="inline-flex rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-1 text-xs font-medium self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-sm font-semibold"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              }`}
            >
              All <span className="tabular-nums ml-1 opacity-75">({wrongQuestions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("still-wrong")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "still-wrong"
                  ? "bg-[color:var(--color-surface)] text-rose-600 dark:text-rose-400 shadow-sm font-semibold"
                  : "text-[color:var(--color-text-muted)] hover:text-rose-600"
              }`}
            >
              Still Wrong <span className="tabular-nums ml-1 opacity-75">({stillWrongCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("recovered")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "recovered"
                  ? "bg-[color:var(--color-surface)] text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold"
                  : "text-[color:var(--color-text-muted)] hover:text-emerald-600"
              }`}
            >
              Recovered <span className="tabular-nums ml-1 opacity-75">({recoveredCount})</span>
            </button>
          </div>

          {stillWrongCount > 0 && (
            <button
              type="button"
              onClick={handleDrillStillWrong}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition"
            >
              <FaPlay className="text-[9px]" />
              <span>Drill Still-Wrong ({stillWrongCount})</span>
            </button>
          )}
        </div>

        {/* Search and secondary filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[color:var(--color-border)]/50">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[color:var(--color-text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by UID, title, or topic..."
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-8 pr-8 py-1.5 text-xs sm:text-sm text-[color:var(--color-text)] placeholder-[color:var(--color-text-muted)]/70 focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] p-1"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter by subject"
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1.5 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              aria-label="Filter by difficulty"
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1.5 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            >
              <option value="all">All Difficulties</option>
              <option value="hard">Hard</option>
              <option value="medium">Medium</option>
              <option value="light">Light</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by type"
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1.5 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="msq">MSQ</option>
              <option value="nat">NAT</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1.5 text-xs text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)]"
            >
              <option value="recent">Sort: Recent Attempts</option>
              <option value="mistakes">Sort: Most Missed</option>
              <option value="difficulty">Sort: Hardest First</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)] pt-1 border-t border-[color:var(--color-border)]/50">
          <span className="tabular-nums">
            Showing <strong className="text-[color:var(--color-text)]">{paginated.length}</strong> of <strong className="text-[color:var(--color-text)]">{filtered.length}</strong> question{filtered.length !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--color-primary)] hover:underline"
            >
              <FaRedo className="text-[9px]" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Question list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-center shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold text-[color:var(--color-text)]">No questions match the selected filters</p>
          <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Try clearing search or adjusting your status, subject, or difficulty settings.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] transition"
          >
            <FaRedo className="text-[9px]" /> Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {paginated.map((q, index) => {
            const subtopicLabels = (Array.isArray(q.subtopics) ? q.subtopics : [])
              .map((st) => st?.label || st?.slug || "")
              .filter(Boolean)
              .slice(0, 3);

            return (
              <div
                key={`${q.storageKey}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => handleNavigateToQuestion(q.storageKey)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleNavigateToQuestion(q.storageKey)}
                className="group block w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3.5 sm:p-4 text-left transition-all duration-150 hover:border-[color:var(--color-primary-border)] hover:bg-[color:var(--color-surface-hover)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-border)] cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {q.lastCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <FaCheckCircle className="text-[9px]" />
                          Recovered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          <FaTimesCircle className="text-[9px]" />
                          Still Wrong
                        </span>
                      )}
                      {(() => {
                        const displayTitle = resolveQuestionDisplayTitle(q, getQuestionById);
                        const isDifferent = displayTitle !== q.storageKey;
                        return (
                          <span
                            className="text-xs sm:text-sm font-semibold text-[color:var(--color-text)] truncate max-w-[280px] sm:max-w-md"
                            title={`Question ID: ${q.storageKey}`}
                          >
                            {isDifferent ? (
                              <>
                                <span>{displayTitle}</span>
                                <span className="sr-only">{q.storageKey}</span>
                              </>
                            ) : (
                              q.storageKey
                            )}
                          </span>
                        );
                      })()}
                      {q.type && (
                        <span className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                          {q.type}
                        </span>
                      )}
                      <DifficultyBadge label={q.difficultyLabel} score={q.difficultyScore} />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[color:var(--color-text-muted)]">
                      <span className="font-semibold text-[color:var(--color-text)]">{q.subjectLabel}</span>
                      {subtopicLabels.map((st) => (
                        <span
                          key={st}
                          className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-1.5 py-0.5 text-[10px] text-[color:var(--color-text-muted)] max-w-[160px] truncate"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-between sm:flex-col sm:items-end gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-[color:var(--color-border)]/50">
                    <div className="text-left sm:text-right text-xs">
                      <p className="tabular-nums font-medium text-[color:var(--color-text)]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{q.correctAttempts}✓</span>{" "}
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{q.incorrectAttempts}✗</span>{" "}
                        <span className="text-[color:var(--color-text-muted)]">of {q.attempts}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[color:var(--color-text-muted)] tabular-nums">
                        <span>{relativeTimeLabel(q.lastSubmittedAt)}</span>
                        {q.averageDurationMs > 0 && (
                          <span>• Avg {formatDuration(q.averageDurationMs)}</span>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-primary)] group-hover:translate-x-0.5 transition-transform">
                      <span>Solve</span>
                      <FaArrowRight className="text-[10px]" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            aria-label="Previous page"
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs sm:text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-xs sm:text-sm text-[color:var(--color-text-muted)] tabular-nums px-3">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Next page"
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs sm:text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Track icons & scoping helper ────────────────────────────────────────── */

const TRACK_ICONS = {
  cs: FaGraduationCap,
  cse: FaGraduationCap,
  da: FaRobot,
  ec: FaBolt,
  ee: FaBolt,
  me: FaCogs,
  ce: FaBuilding,
  aptitude: FaBrain,
  all: FaLayerGroup,
};

const isSubjectInTrack = (subjectSlugOrKeyOrQuestion = "", track = "all", selectedBranches = ["cse"]) => {
  return isItemEligibleForTrack(subjectSlugOrKeyOrQuestion, track, selectedBranches);
};

/* ── Main InsightsPage ──────────────────────────────────────────────────── */

const InsightsPage = ({
  questionBankManifest,
  hasResumeRoute,
  onResumePractice,
  onStartMockTest,
}) => {
  const { allQuestions, solvedCount, totalQuestions, progressPercentage } = useFilterState();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [selectedBranches, setSelectedBranches] = useState(() => {
    const prefs = readBranchPreferences();
    return Array.isArray(prefs?.selectedBranches) && prefs.selectedBranches.length > 0
      ? prefs.selectedBranches
      : ["cse", "da"];
  });

  useEffect(() => {
    const handlePrefChange = (event) => {
      const detailBranches = event?.detail?.selectedBranches;
      if (Array.isArray(detailBranches) && detailBranches.length > 0) {
        setSelectedBranches(detailBranches);
      } else {
        const prefs = readBranchPreferences();
        if (Array.isArray(prefs?.selectedBranches) && prefs.selectedBranches.length > 0) {
          setSelectedBranches(prefs.selectedBranches);
        } else {
          setSelectedBranches(["cse", "da"]);
        }
      }
    };
    window.addEventListener(BRANCH_PREFERENCE_EVENT, handlePrefChange);
    return () => {
      window.removeEventListener(BRANCH_PREFERENCE_EVENT, handlePrefChange);
    };
  }, []);

  const trackOptions = useMemo(() => {
    return getInsightTracksForSelectedBranches(selectedBranches);
  }, [selectedBranches]);

  const [selectedTrack, setSelectedTrack] = useState(() => {
    const params = new URLSearchParams(location.search);
    const trackParam = params.get("track");
    const validTrackIds = getInsightTracksForSelectedBranches(
      readBranchPreferences()?.selectedBranches?.length ? readBranchPreferences().selectedBranches : ["cse", "da"]
    ).map((t) => t.id);
    if (trackParam && validTrackIds.includes(trackParam)) {
      return trackParam;
    }
    return "all";
  });

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(location.search);
    params.set("tab", tabId);
    navigate({ search: `?${params.toString()}` }, { replace: true });
  }, [location.search, navigate]);

  const handleTrackChange = useCallback((trackId) => {
    setSelectedTrack(trackId);
    const params = new URLSearchParams(location.search);
    params.set("track", trackId);
    navigate({ search: `?${params.toString()}` }, { replace: true });
  }, [location.search, navigate]);

  useEffect(() => {
    const validTrackIds = trackOptions.map((t) => t.id);
    if (!validTrackIds.includes(selectedTrack)) {
      setSelectedTrack("all");
      const params = new URLSearchParams(location.search);
      if (params.get("track") && params.get("track") !== "all") {
        params.set("track", "all");
        navigate({ search: `?${params.toString()}` }, { replace: true });
      }
    }
  }, [trackOptions, selectedTrack, location.search, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && TABS.some((t) => t.id === tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    const trackParam = params.get("track");
    const validTrackIds = trackOptions.map((t) => t.id);
    if (trackParam && validTrackIds.includes(trackParam) && trackParam !== selectedTrack) {
      setSelectedTrack(trackParam);
    }
  }, [location.search, activeTab, selectedTrack, trackOptions]);

  const [insights, setInsights] = useState({
    subjects: [],
    subtopics: [],
    wrongQuestions: [],
    reviewQueue: [],
    attemptTimeline: [],
    studyActivity: {},
    timeSummary: {},
    difficultySummary: { counts: {} },
    mockSummary: {},
    attemptedQuestionCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = useCallback(() => {
    clearInsightsCache();
    setError("");
    setRetryKey((k) => k + 1);
  }, []);

  const allQuestionsRef = useRef(allQuestions);
  allQuestionsRef.current = allQuestions;

  const allQuestionsCount = Array.isArray(allQuestions) ? allQuestions.length : 0;

  useEffect(() => {
    let active = true;

    const loadInsights = async () => {
      setIsLoading(true);
      setError("");
      try {
        const questionsList = Array.isArray(allQuestions) && allQuestions.length > 0
          ? allQuestions
          : allQuestionsRef.current;
        const result = await loadWeakTopicInsights({
          questions: Array.isArray(questionsList) && questionsList.length > 0 ? questionsList : null,
          includeAptitude: true,
          includeIsro: true,
        });
        if (active) {
          setInsights(result || {
            subjects: [],
            subtopics: [],
            wrongQuestions: [],
            reviewQueue: [],
            attemptTimeline: [],
            studyActivity: {},
            timeSummary: {},
            difficultySummary: { counts: {} },
            mockSummary: {},
            attemptedQuestionCount: 0,
          });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load practice insights.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadInsights();

    return () => {
      active = false;
    };
  }, [allQuestionsCount, retryKey]);

  useEffect(() => {
    const handleDataUpdate = () => {
      clearInsightsCache();
      setRetryKey((k) => k + 1);
    };

    window.addEventListener("gateqa:progress-updated", handleDataUpdate);
    window.addEventListener("gateqa:sync-complete", handleDataUpdate);
    window.addEventListener("gateqa:workspace-imported", handleDataUpdate);

    return () => {
      window.removeEventListener("gateqa:progress-updated", handleDataUpdate);
      window.removeEventListener("gateqa:sync-complete", handleDataUpdate);
      window.removeEventListener("gateqa:workspace-imported", handleDataUpdate);
    };
  }, []);

  const scopedInsights = useMemo(() => {
    const safeInsights = insights || {};
    const subjects = Array.isArray(safeInsights.subjects) ? safeInsights.subjects : [];
    const subtopics = Array.isArray(safeInsights.subtopics) ? safeInsights.subtopics : [];
    const wrongQuestions = Array.isArray(safeInsights.wrongQuestions) ? safeInsights.wrongQuestions : [];
    const reviewQueue = Array.isArray(safeInsights.reviewQueue) ? safeInsights.reviewQueue : [];

    const filteredSubjects = subjects.filter((s) => isSubjectInTrack(s?.key || s?.subjectSlug || s, selectedTrack, selectedBranches));
    const filteredSubtopics = subtopics.filter((st) => isSubjectInTrack(st?.subjectSlug || st?.key || st, selectedTrack, selectedBranches));
    const filteredWrong = wrongQuestions.filter((q) => isSubjectInTrack(q, selectedTrack, selectedBranches));
    const filteredReview = reviewQueue.filter((q) => isSubjectInTrack(q, selectedTrack, selectedBranches));
    const scopedAttemptedCount = filteredSubjects.reduce((sum, s) => sum + Number(s.attemptedCount || 0), 0);
    const rawAttemptedCount = Number(safeInsights.attemptedQuestionCount || 0);

    let attemptedQuestionCount = scopedAttemptedCount;
    if (selectedTrack === "all") {
      if (filteredSubjects.length === subjects.length || scopedAttemptedCount === 0) {
        attemptedQuestionCount = rawAttemptedCount > 0 ? rawAttemptedCount : scopedAttemptedCount;
      }
    } else {
      if (scopedAttemptedCount === 0 && (filteredReview.length > 0 || filteredWrong.length > 0)) {
        attemptedQuestionCount = rawAttemptedCount > 0 ? rawAttemptedCount : (filteredReview.length + filteredWrong.length);
      }
    }

    return {
      ...safeInsights,
      subjects: filteredSubjects,
      subtopics: filteredSubtopics,
      wrongQuestions: filteredWrong,
      reviewQueue: filteredReview,
      attemptedQuestionCount,
    };
  }, [insights, selectedTrack, selectedBranches]);

  const summary = useMemo(() => {
    const subjects = Array.isArray(scopedInsights.subjects) ? scopedInsights.subjects : [];
    const subtopics = Array.isArray(scopedInsights.subtopics) ? scopedInsights.subtopics : [];
    const wrongQuestions = Array.isArray(scopedInsights.wrongQuestions) ? scopedInsights.wrongQuestions : [];
    const reviewQueue = Array.isArray(scopedInsights.reviewQueue) ? scopedInsights.reviewQueue : [];
    const timeSummary = scopedInsights.timeSummary && typeof scopedInsights.timeSummary === "object"
      ? scopedInsights.timeSummary
      : {};
    const difficultySummary = scopedInsights.difficultySummary && typeof scopedInsights.difficultySummary === "object"
      ? scopedInsights.difficultySummary
      : {};
    const mockSummary = scopedInsights.mockSummary && typeof scopedInsights.mockSummary === "object"
      ? scopedInsights.mockSummary
      : {};
    const mockCorrectAttempts = Number(mockSummary.correctAttempts || 0);
    const mockIncorrectAttempts = Number(mockSummary.incorrectAttempts || 0);
    const mockScoredAttempts = mockCorrectAttempts + mockIncorrectAttempts;
    const totalCorrectAttempts = subjects.reduce((sum, s) => sum + Number(s.correctAttempts || 0), 0);
    const totalIncorrectAttempts = subjects.reduce((sum, s) => sum + Number(s.incorrectAttempts || 0), 0);
    const totalAttemptedCount = totalCorrectAttempts + totalIncorrectAttempts;
    const overallAccuracyRate = totalAttemptedCount > 0
      ? totalCorrectAttempts / totalAttemptedCount
      : 0;
    const averageSubjectAccuracy = subjects.length
      ? subjects.reduce((total, item) => total + Number(item.accuracyRate || 0), 0) / subjects.length
      : 0;
    return {
      attemptedQuestionCount: Number(scopedInsights.attemptedQuestionCount || 0),
      weakSubjectCount: subjects.filter((item) => Number(item.accuracyRate || 0) < 0.7).length,
      weakSubtopicCount: subtopics.filter((item) => Number(item.accuracyRate || 0) < 0.7).length,
      averageSubjectAccuracy,
      overallAccuracyRate,
      totalCorrectAttempts,
      totalIncorrectAttempts,
      totalAttemptedCount,
      wrongQuestionCount: wrongQuestions.length,
      dueReviewCount: reviewQueue.length,
      averageDurationMs: Number(timeSummary.averageDurationMs || 0),
      hardQuestionCount: Number(difficultySummary.counts?.Hard || 0),
      mockAttemptedQuestionCount: Number(mockSummary.attemptedQuestionCount || 0),
      mockAccuracyRate: mockScoredAttempts > 0 ? mockCorrectAttempts / mockScoredAttempts : 0,
    };
  }, [scopedInsights]);

  const wrongCount = Array.isArray(scopedInsights.wrongQuestions) ? scopedInsights.wrongQuestions.length : 0;
  const dueReviewCount = Array.isArray(scopedInsights.reviewQueue) ? scopedInsights.reviewQueue.length : 0;
  const hasMockAttempts = summary.mockAttemptedQuestionCount > 0
    || Number(scopedInsights.mockSummary?.attemptCount || 0) > 0;

  return (
    <>
    <SEOHead
      title="Your GATE Practice Analytics & History | GateQA"
      description="Track your GATE CS practice progress with subject-wise accuracy, coverage stats, weak topic analysis, mock test history, and spaced repetition review."
      path="/insights"
    />
    <PageShell
      showHeader={false}
      onResume={hasResumeRoute ? onResumePractice : null}
      resumeLabel="Continue"
    >
      <section className="space-y-4 sm:space-y-5 pb-[calc(5rem+env(safe-area-inset-bottom,16px))] md:pb-10">
        {/* Hero header */}
        <header className="rounded-2xl sm:rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3.5 sm:p-5 shadow-[var(--shadow-card)] space-y-3 sm:space-y-4">
          {/* Top navigation row: Breadcrumbs/Back on left, Actions on right */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <Link
                to={HOME_ROUTE}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500 shrink-0"
                aria-label="Back to Home"
                title="Home"
              >
                <FiHome className="text-base sm:text-lg shrink-0" />
              </Link>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="text-[color:var(--color-text-muted)]/50 text-xs select-none" aria-hidden="true">/</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--color-primary-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--color-primary-text)] truncate">
                  <FaChartLine className="text-xs shrink-0" />
                  <span>Insights</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                role="switch"
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-checked={isDarkMode}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-xs transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500 shrink-0"
              >
                {isDarkMode ? (
                  <FiSun className="h-4 w-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <FiMoon className="h-4 w-4 text-slate-600" aria-hidden="true" />
                )}
              </button>
              <Link
                to={selectedTrack === "all" ? PRACTICE_ROUTE : `${PRACTICE_ROUTE}?track=${selectedTrack}`}
                aria-label="Open Practice"
                className="inline-flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-xl bg-[color:var(--color-primary)] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] shadow-xs sm:shadow-sm shrink-0"
              >
                <FaCompass className="text-xs sm:text-sm shrink-0" />
                <span>Open Practice</span>
              </Link>
            </div>
          </div>

          {/* Bottom row: Title & Description on left, Track Switcher on right */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-1 border-t border-[color:var(--color-border)]/50">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold font-display tracking-tight text-[color:var(--color-text)] text-balance">
                Performance &amp; Practice Analytics
              </h1>
              <p className="text-xs sm:text-sm text-[color:var(--color-text-muted)] mt-0.5 text-pretty line-clamp-1 sm:line-clamp-none">
                Syllabus coverage, accuracy diagnostics, spaced repetition &amp; attempt trends
              </p>
            </div>

            {/* Track Switcher */}
            <div className="w-full md:w-auto shrink-0 overflow-x-auto no-scrollbar">
              <div className="inline-flex w-full md:w-auto items-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-1 text-xs font-semibold shadow-xs gap-1">
                {trackOptions.map((option) => {
                  const TrackIcon = TRACK_ICONS[option.id] || FaGraduationCap;
                  const isSelected = selectedTrack === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      data-testid={`insights-track-${option.id}`}
                      onClick={() => handleTrackChange(option.id)}
                      className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] sm:text-xs rounded-lg transition-all ${
                        isSelected
                          ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-sm font-bold"
                          : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
                      }`}
                    >
                      <TrackIcon className="text-xs shrink-0" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingState
              label="Building insights from your practice and mock history..."
              layout="inline"
              size="xs"
              textClassName="text-sm text-[color:var(--color-text-muted)] font-medium"
            />
          </div>
        ) : error ? (
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] p-4 sm:p-5 text-sm text-[color:var(--color-warning-text)] shadow-[var(--shadow-card)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-base shrink-0" />
                <p>{error}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)] transition shadow-sm"
                >
                  Try Again
                </button>
                <Link
                  to={PRACTICE_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--color-primary-hover)] transition shadow-sm"
                >
                  Open Practice
                </Link>
              </div>
            </div>
          </div>
        ) : (activeTab !== "mock-history" && summary.attemptedQuestionCount <= 0 && !hasMockAttempts) ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]">
              <FaLightbulb />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[color:var(--color-text)]">No insights yet</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
              Start solving a few questions and this page will highlight your weak subjects and subtopics.
            </p>
            <Link
              to={PRACTICE_ROUTE}
              className="mt-5 inline-flex min-h-[48px] items-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Start Practice
            </Link>
          </div>
        ) : (
          <>
            {/* Tab navigation */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-1 shadow-xs">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                const shortLabel = tab.id === "review"
                  ? "Review"
                  : tab.id === "wrong"
                    ? "Wrong"
                    : tab.id === "mock-history"
                      ? "Mocks"
                      : tab.id === "infographics"
                        ? "Charts"
                        : "Overview";
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    aria-label={tab.label}
                    className={`flex-1 min-w-[64px] sm:min-w-0 min-h-[42px] inline-flex items-center justify-center gap-1 sm:gap-2 rounded-xl px-1.5 py-2 sm:px-3.5 sm:py-2.5 text-xs font-semibold transition-all shrink-0 sm:shrink ${
                      isActive
                        ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-sm font-bold border border-[color:var(--color-border)]"
                        : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)]/50"
                    }`}
                  >
                    <TabIcon className={`text-xs shrink-0 ${isActive ? "text-sky-600 dark:text-sky-400" : ""}`} />
                    <span className="text-[11px] sm:text-sm">
                      <span className="inline sm:hidden">{shortLabel}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                    {tab.id === "wrong" && wrongCount > 0 && (
                      <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums ${
                        isActive
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : "bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)]"
                      }`}>
                        {wrongCount}
                      </span>
                    )}
                    {tab.id === "review" && dueReviewCount > 0 && (
                      <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums ${
                        isActive
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)]"
                      }`}>
                        {dueReviewCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div key={activeTab} className="min-h-[400px] animate-card-fade">
              {activeTab === "overview" && (
                <OverviewTab insights={scopedInsights} summary={summary} />
              )}
              {activeTab === "review" && (
                <ReviewQueueTab reviewQueue={scopedInsights.reviewQueue || []} onSwitchTab={handleTabChange} />
              )}
              {activeTab === "infographics" && (
                <InfographicsTab insights={scopedInsights} summary={summary} />
              )}
              {activeTab === "wrong" && (
                <WrongAnswersTab wrongQuestions={scopedInsights.wrongQuestions || []} onSwitchTab={handleTabChange} />
              )}
              {activeTab === "mock-history" && (
                <MockHistoryPanel onStartMockTest={onStartMockTest} />
              )}
            </div>
          </>
        )}
      </section>
    </PageShell>
    </>
  );
};

export default InsightsPage;
