import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import ProgressManager from "../components/ProgressManager/ProgressManager";
import { useFilterState } from "../contexts/FilterContext";
import PageShell from "../components/Layout/PageShell";
import { PRACTICE_ROUTE } from "../utils/routes";
import { buildSolvePath } from "../utils/routes";
import { loadWeakTopicInsights } from "../utils/weakTopicAnalyzer";
import MockHistoryPanel from "../components/Insights/MockHistoryPanel";
import useChartTheme from "../hooks/useChartTheme";
import CollapsibleSection from "../components/Layout/CollapsibleSection";

/* ── Formatting helpers ─────────────────────────────────────────────────── */

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
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold" style={{ color: "var(--chart-tooltip-text)" }}>
            {formatPercent(safeValue)}
          </span>
        </div>
      </div>
      {label && <p className="text-xs font-semibold text-center leading-tight" style={{ color: "var(--chart-tooltip-text)" }}>{label}</p>}
      {sublabel && <p className="text-[10px] text-center" style={{ color: "var(--chart-tooltip-muted)" }}>{sublabel}</p>}
    </div>
  );
};

/* ── Stat card ──────────────────────────────────────────────────────────── */

const StatCard = ({ label, value, icon: Icon, accent = "sky", sublabel }) => {
  const accentMap = {
    sky: {
      borderColor: "var(--color-info-border)",
      background: "linear-gradient(135deg, var(--color-info-soft), var(--color-surface))",
      color: "var(--color-info-text)",
    },
    rose: {
      borderColor: "var(--color-danger-border)",
      background: "linear-gradient(135deg, var(--color-danger-soft), var(--color-surface))",
      color: "var(--color-danger-text)",
    },
    amber: {
      borderColor: "var(--color-warning-border)",
      background: "linear-gradient(135deg, var(--color-warning-soft), var(--color-surface))",
      color: "var(--color-warning-text)",
    },
    emerald: {
      borderColor: "var(--color-success-border)",
      background: "linear-gradient(135deg, var(--color-success-soft), var(--color-surface))",
      color: "var(--color-success-text)",
    },
    violet: {
      borderColor: "var(--color-purple-border)",
      background: "linear-gradient(135deg, var(--color-purple-soft), var(--color-surface))",
      color: "var(--color-purple-text)",
    },
  };
  const token = accentMap[accent] || accentMap.sky;

  return (
    <div
      className="rounded-xl border px-3 py-2.5 shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.01]"
      style={token}
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="text-[10px]" style={{ color: token.color }} />}
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-75">{label}</p>
      </div>
      <p className="mt-1 text-xl font-bold">{value}</p>
      {sublabel && <p className="mt-0.5 text-[10px] opacity-60 leading-tight">{sublabel}</p>}
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

const SubjectRadarChart = ({ data = [] }) => {
  const chartTheme = useChartTheme();
  const radarData = useMemo(() => {
    return data.map((item) => ({
      subject: item.label.length > 12 ? item.label.substring(0, 10) + "..." : item.label,
      accuracy: Math.round(item.accuracyRate * 100),
      coverage: Math.round(item.coverageRate * 100),
      fullName: item.label,
    }));
  }, [data]);

  if (radarData.length < 3) return null;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke={chartTheme.grid} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: chartTheme.tick }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: chartTheme.tickSecondary }} />
          <Radar
            name="Accuracy"
            dataKey="accuracy"
            stroke={chartTheme.seriesAccuracy}
            fill={chartTheme.seriesAccuracy}
            fillOpacity={0.15}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Radar
            name="Coverage"
            dataKey="coverage"
            stroke={chartTheme.seriesCoverage}
            fill={chartTheme.seriesCoverage}
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="4 4"
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
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
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-sm text-[color:var(--color-text-muted)]">
        Timed attempt trends will appear after your next submission.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 24, left: -20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
          <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartTheme.tick }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartTheme.tick }} allowDecimals={false} />
          <RechartsTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }
              const item = payload[0].payload;
              return (
                <div className="rounded-xl p-4 text-sm shadow-xl" style={{ backgroundColor: "var(--chart-tooltip-bg)", border: "1px solid var(--chart-tooltip-border)" }}>
                  <p className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{item.date}</p>
                  <p className="mt-2" style={{ color: "var(--chart-tooltip-muted)" }}>Attempts: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{item.attempts}</span></p>
                  <p style={{ color: "var(--chart-tooltip-muted)" }}>Accuracy: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{formatPercent(item.accuracyPercent)}</span></p>
                  <p style={{ color: "var(--chart-tooltip-muted)" }}>Avg time: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{formatDuration(item.averageDurationMs)}</span></p>
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
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {subjects.map((item) => {
        const coveragePercent = Math.round((item.coverageRate || 0) * 100);
        const accuracyPercent = Math.round((item.accuracyRate || 0) * 100);
        const tone = getAccuracyTone(item.accuracyRate);
        return (
          <div
            key={item.key}
            className="flex flex-col items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-3 transition-transform hover:scale-[1.02]"
          >
            <ProgressRing
              value={coveragePercent}
              size={64}
              strokeWidth={6}
              color={tone.color}
            />
            <p className="text-xs font-semibold text-center text-[color:var(--color-text)] leading-tight truncate w-full" title={item.label}>
              {item.label}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[color:var(--color-text-muted)]">
              <span className="font-bold" style={{ color: tone.color }}>{accuracyPercent}%</span>
              <span>acc</span>
              <span className="mx-0.5">·</span>
              <span>{formatNumber(item.attemptedQuestions)}/{formatNumber(item.availableQuestions)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Focus areas (weak topic recommendations) ──────────────────────────── */

const FocusAreas = ({ subtopics = [] }) => {
  const weakSubtopics = useMemo(() =>
    subtopics
      .filter((st) => st.attemptedCount > 0 && st.accuracyRate < 0.6)
      .slice(0, 3),
    [subtopics]
  );

  if (weakSubtopics.length === 0) return null;

  return (
    <div className="space-y-2">
      {weakSubtopics.map((st) => {
        const accuracyPercent = Math.round(st.accuracyRate * 100);
        const tone = getAccuracyTone(st.accuracyRate);
        const practiceUrl = `${PRACTICE_ROUTE}?subjects=${encodeURIComponent(st.subjectSlug)}&subtopics=${encodeURIComponent(st.key.split(":")[1] || "")}`;
        return (
          <div
            key={st.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 transition hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[color:var(--color-text)] truncate">{st.label}</p>
              <p className="text-[11px] text-[color:var(--color-text-muted)]">
                {st.subjectLabel} · {formatNumber(st.attemptedCount)} attempts · <span className="font-semibold" style={{ color: tone.color }}>{accuracyPercent}%</span> accuracy
              </p>
            </div>
            <Link
              to={practiceUrl}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
            >
              Practice <FaArrowRight className="text-[9px]" />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

/* ── Smart Practice Banner ──────────────────────────────────────────────── */

const SmartPracticeBanner = ({ subtopics = [], reviewQueue = [] }) => {
  const weakSubtopics = useMemo(() =>
    subtopics.filter((st) => st.attemptedCount > 0 && st.accuracyRate < 0.6),
    [subtopics]
  );
  
  const hasReviewDue = reviewQueue.length > 0;
  const hasWeakAreas = weakSubtopics.length > 0;
  
  if (!hasReviewDue && !hasWeakAreas) return null;

  // Build the multi-subtopic URL for the weakest areas (max 3 to avoid giant URLs)
  const topWeak = weakSubtopics.slice(0, 3);
  const weakSubjects = Array.from(new Set(topWeak.map((st) => st.subjectSlug))).join(",");
  const weakSubtopicSlugs = topWeak.map((st) => st.key.split(":")[1]).filter(Boolean).join(",");
  const practiceWeakUrl = `${PRACTICE_ROUTE}?subjects=${encodeURIComponent(weakSubjects)}&subtopics=${encodeURIComponent(weakSubtopicSlugs)}&hideSolved=1`;
  
  const reviewUrl = hasReviewDue ? buildSolvePath(reviewQueue[0].storageKey) : "#";

  return (
    <div className={`grid gap-4 ${hasReviewDue && hasWeakAreas ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
      {hasReviewDue && (
        <section className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] p-5 shadow-[var(--shadow-card)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaCalendarCheck className="text-[color:var(--color-warning-text)] text-lg" />
              <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Spaced Repetition</h2>
            </div>
            <p className="text-sm text-[color:var(--color-text-muted)] mb-4">
              <strong className="text-[color:var(--color-warning-text)] font-bold">{reviewQueue.length}</strong> questions are due for review today to maintain your memory retention.
            </p>
          </div>
          <Link
            to={reviewUrl}
            className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-[color:var(--color-warning-text)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90"
          >
            Start Review <FaArrowRight />
          </Link>
        </section>
      )}
      
      {hasWeakAreas && (
        <section className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] p-5 shadow-[var(--shadow-card)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaBullseye className="text-[color:var(--color-primary)] text-lg" />
              <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Practice Weak Areas</h2>
            </div>
            <p className="text-sm text-[color:var(--color-text-muted)] mb-4">
              You have <strong className="text-[color:var(--color-primary)] font-bold">{weakSubtopics.length}</strong> subtopics with accuracy below 60%. Focus on unsolved questions to improve.
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
    <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Exam Year Coverage</h2>
      <p className="mt-1 text-sm text-[color:var(--color-text-muted)] mb-4">
        Ensure you have solved questions from all recent exam years.
      </p>
      
      <div className="space-y-6">
        {Object.entries(decades).sort(([a], [b]) => Number(b) - Number(a)).map(([decade, decadeYears]) => (
          <div key={decade}>
            <h3 className="text-sm font-semibold text-[color:var(--color-text-muted)] mb-3">{decade}s</h3>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {decadeYears.sort((a, b) => Number(b.key) - Number(a.key)).map(year => {
                const coveragePercent = Math.round((year.coverageRate || 0) * 100);
                const isZero = coveragePercent === 0;
                const accuracyPercent = Math.round((year.accuracyRate || 0) * 100);
                const practiceUrl = `${PRACTICE_ROUTE}?years=${year.key}&hideSolved=1`;
                
                return (
                  <Link
                    key={year.key}
                    to={practiceUrl}
                    className={`group block rounded-xl border p-3 transition ${
                      isZero 
                        ? "border-dashed border-[color:var(--color-border)] bg-transparent hover:border-[color:var(--color-primary-border)] hover:bg-[color:var(--color-surface-muted)]" 
                        : "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] hover:border-[color:var(--color-primary)] hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[color:var(--color-text)]">{year.key}</span>
                      <span className="text-[10px] text-[color:var(--color-text-muted)]">{coveragePercent}% cov</span>
                    </div>
                    <div className="w-full h-1.5 bg-[color:var(--color-border)] rounded-full mb-2 overflow-hidden">
                      <div 
                        className="h-full bg-[color:var(--color-primary)] rounded-full" 
                        style={{ width: `${coveragePercent}%` }}
                      />
                    </div>
                    {!isZero && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[color:var(--color-text-muted)]">{year.attemptedQuestions}/{year.availableQuestions} Qs</span>
                        <span className="font-bold" style={{ color: getAccuracyTone(year.accuracyRate).color }}>{accuracyPercent}% acc</span>
                      </div>
                    )}
                    {isZero && (
                      <div className="text-[10px] text-[color:var(--color-text-muted)] text-center">
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
    <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Year-wise Accuracy Trend</h2>
      <p className="mt-1 text-sm text-[color:var(--color-text-muted)] mb-6">
        Are you performing better on newer exam papers?
      </p>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: theme.text }} 
              dy={10} 
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: theme.text }} 
              dx={-10} 
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

const OverviewTab = ({ insights, summary }) => {
  const totalCorrect = useMemo(() =>
    insights.subjects.reduce((sum, s) => sum + s.correctAttempts, 0)
  , [insights.subjects]);
  const totalIncorrect = useMemo(() =>
    insights.subjects.reduce((sum, s) => sum + s.incorrectAttempts, 0)
  , [insights.subjects]);

  return (
    <div className="space-y-6">
      {/* Stat cards row */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Attempted"
          value={formatNumber(summary.attemptedQuestionCount)}
          icon={FaEye}
          accent="sky"
          sublabel="questions tried"
        />
        <StatCard
          label="Avg Accuracy"
          value={formatPercent(summary.averageSubjectAccuracy * 100)}
          icon={FaBullseye}
          accent={summary.averageSubjectAccuracy >= 0.7 ? "emerald" : summary.averageSubjectAccuracy >= 0.5 ? "amber" : "rose"}
          sublabel="across subjects"
        />
        <StatCard
          label="Correct"
          value={formatNumber(totalCorrect)}
          icon={FaCheckCircle}
          accent="emerald"
          sublabel={`of ${formatNumber(totalCorrect + totalIncorrect)} total`}
        />
        <StatCard
          label="Due Review"
          value={formatNumber(summary.dueReviewCount)}
          icon={FaCalendarCheck}
          accent={summary.dueReviewCount > 0 ? "amber" : "emerald"}
          sublabel="questions ready"
        />
        <StatCard
          label="Avg Time"
          value={formatDuration(summary.averageDurationMs)}
          icon={FaClock}
          accent="violet"
          sublabel="per timed attempt"
        />
      </div>

      {/* Subject Progress — collapsible */}
      {insights.subjects.length > 0 && (
        <CollapsibleSection
          title="Subject Progress"
          description="Questions attempted out of total available per subject."
          defaultOpen={true}
        >
          <SubjectProgressRings subjects={insights.subjects} />
        </CollapsibleSection>
      )}

      {/* Focus Areas — collapsible, warning styling */}
      <CollapsibleSection
        title={
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-[color:var(--color-warning-text)]" />
            <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Focus Areas</h2>
          </div>
        }
        description="Subtopics with accuracy below 60%. Focused practice can improve your score significantly."
        defaultOpen={true}
        className="border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] shadow-[var(--shadow-card)]"
      >
        <FocusAreas subtopics={insights.subtopics} />
      </CollapsibleSection>

      {/* Smart Practice Banner — always visible */}
      <SmartPracticeBanner subtopics={insights.subtopics} reviewQueue={insights.reviewQueue} />

      {/* Skill Radar — collapsible, closed by default */}
      <CollapsibleSection
        title="Skill Radar"
        description="Accuracy (blue) vs coverage (purple) across subjects."
        defaultOpen={false}
      >
        {insights.subjects.length >= 3 ? (
          <SubjectRadarChart data={insights.subjects} />
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            <CorrectIncorrectPie correct={totalCorrect} incorrect={totalIncorrect} />
            <div className="flex items-center gap-4 text-sm text-[color:var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--chart-series-correct, #059669)" }} /> Correct
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--chart-series-incorrect, #e11d48)" }} /> Incorrect
              </span>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Practice Trend — collapsible, closed by default */}
      <CollapsibleSection
        title="Practice Trend"
        description="Daily attempt volume from your local submission history."
        defaultOpen={false}
      >
        <TimeTrendChart data={insights.attemptTimeline || []} />
      </CollapsibleSection>

      {/* All Subjects — collapsible, closed by default */}
      <CollapsibleSection
        title="All Subjects"
        description="Tap any subject to see detailed metrics."
        defaultOpen={false}
      >
        <div className="space-y-2">
          {insights.subjects.map((item) => (
            <SubjectDetailCard key={item.key} item={item} />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

/* ── Wrong Answers tab ──────────────────────────────────────────────────── */

const ReviewQueueTab = ({ reviewQueue = [] }) => {
  const navigate = useNavigate();

  const handleNavigateToQuestion = useCallback((storageKey) => {
    navigate(buildSolvePath(storageKey));
  }, [navigate]);

  if (!reviewQueue.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] p-8 text-center shadow-[var(--shadow-soft)]">
        <FaCalendarCheck className="mx-auto text-3xl text-[color:var(--color-success-text)] mb-3" />
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">No due reviews</h2>
        <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
          Your scheduled reviews are clear. New due cards appear automatically after practice submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-warning-text)]">Due Now</p>
          <p className="text-2xl font-bold text-[color:var(--color-warning-text)]">{formatNumber(reviewQueue.length)}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--color-danger-border)] bg-[color:var(--color-danger-soft)] px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-danger-text)]">Hard Due</p>
          <p className="text-2xl font-bold text-[color:var(--color-danger-text)]">
            {formatNumber(reviewQueue.filter((item) => item.difficultyLabel === "Hard").length)}
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--color-info-border)] bg-[color:var(--color-info-soft)] px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-info-text)]">Oldest</p>
          <p className="text-2xl font-bold text-[color:var(--color-info-text)]">
            {formatNumber(Math.max(...reviewQueue.map((item) => Number(item.daysOverdue || 0)), 0))}d
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {reviewQueue.map((item, index) => {
          const subtopicLabels = (Array.isArray(item.subtopics) ? item.subtopics : [])
            .map((subtopic) => subtopic?.label || subtopic?.slug || "")
            .filter(Boolean)
            .slice(0, 2);
          const dueLabel = Number(item.daysOverdue || 0) > 0
            ? `${item.daysOverdue}d overdue`
            : "Due today";

          return (
            <button
              key={`${item.storageKey}-${index}`}
              type="button"
              onClick={() => handleNavigateToQuestion(item.storageKey)}
              className="group block w-full rounded-2xl border border-[color:var(--color-warning-border)] bg-gradient-to-r from-[color:var(--color-warning-soft)] to-[color:var(--color-surface)] px-4 py-3.5 text-left transition hover:border-[color:var(--color-warning-text)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-warning-border)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <FaCalendarCheck className="text-[color:var(--color-warning-text)]" />
                    <p className="truncate text-sm font-semibold text-[color:var(--color-text)]">{item.storageKey}</p>
                    <DifficultyBadge label={item.difficultyLabel} score={item.difficultyScore} />
                    {item.type ? (
                      <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                        {item.type}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
                    <span className="rounded-full bg-[color:var(--color-info-soft)] px-2 py-0.5 font-semibold text-[color:var(--color-info-text)]">{item.subjectLabel}</span>
                    {subtopicLabels.map((label) => (
                      <span key={label} className="rounded-full bg-[color:var(--color-primary-soft)] px-2 py-0.5 font-semibold text-[color:var(--color-primary-text)]">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-[color:var(--color-warning-text)]">{dueLabel}</p>
                  <p className="mt-0.5 text-[10px] text-[color:var(--color-text-muted)]">Level {item.reviewLevel || 0}</p>
                  <FaArrowRight className="mt-1.5 text-xs text-[color:var(--color-border)] transition-colors group-hover:text-[color:var(--color-warning-text)] ml-auto" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 15;

const WrongAnswersTab = ({ wrongQuestions = [] }) => {
  const navigate = useNavigate();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(wrongQuestions.map((q) => q.subjectLabel));
    return Array.from(uniqueSubjects).sort();
  }, [wrongQuestions]);

  const filtered = useMemo(() => {
    let result = [...wrongQuestions];
    if (subjectFilter !== "all") {
      result = result.filter((q) => q.subjectLabel === subjectFilter);
    }
    if (statusFilter === "still-wrong") {
      result = result.filter((q) => !q.lastCorrect);
    } else if (statusFilter === "recovered") {
      result = result.filter((q) => q.lastCorrect);
    }
    return result;
  }, [wrongQuestions, subjectFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleNavigateToQuestion = useCallback((storageKey) => {
    navigate(buildSolvePath(storageKey));
  }, [navigate]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [subjectFilter, statusFilter]);

  const stillWrongCount = wrongQuestions.filter((q) => !q.lastCorrect).length;
  const recoveredCount = wrongQuestions.filter((q) => q.lastCorrect).length;

  if (wrongQuestions.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] p-8 text-center shadow-[var(--shadow-soft)]">
        <FaCheckCircle className="mx-auto text-3xl text-[color:var(--color-success-text)] mb-3" />
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">No Wrong Answers!</h2>
        <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
          You haven't gotten any questions wrong yet. Keep up the great work!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">Total Wrong</p>
          <p className="text-2xl font-bold text-[color:var(--color-text)]">{formatNumber(wrongQuestions.length)}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--color-danger-border)] bg-[color:var(--color-danger-soft)] px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-danger-text)]">Still Wrong</p>
          <p className="text-2xl font-bold text-[color:var(--color-danger-text)]">{formatNumber(stillWrongCount)}</p>
          <p className="text-[10px] text-[color:var(--color-danger-text)]">Last attempt was incorrect</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-success-text)]">Recovered</p>
          <p className="text-2xl font-bold text-[color:var(--color-success-text)]">{formatNumber(recoveredCount)}</p>
          <p className="text-[10px] text-[color:var(--color-success-text)]">Now answered correctly</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 shadow-sm">
        <FaFilter className="text-[color:var(--color-text-muted)] text-sm" />
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-primary)]"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-text)] focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-primary)]"
        >
          <option value="all">All Status</option>
          <option value="still-wrong">Still Wrong</option>
          <option value="recovered">Recovered</option>
        </select>
        <span className="ml-auto text-xs text-[color:var(--color-text-muted)]">
          {filtered.length} question{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {paginated.map((q, index) => {
          const subtopicLabels = (Array.isArray(q.subtopics) ? q.subtopics : [])
            .map((st) => st?.label || st?.slug || "")
            .filter(Boolean)
            .slice(0, 3);

          return (
            <div
              key={`${q.storageKey}-${index}`}
              className={`group rounded-2xl border px-4 py-3.5 transition-all hover:shadow-md cursor-pointer ${
                q.lastCorrect
                  ? "border-[color:var(--color-success-border)] bg-gradient-to-r from-[color:var(--color-success-soft)] to-[color:var(--color-surface)] hover:border-[color:var(--color-success-text)]"
                  : "border-[color:var(--color-danger-border)] bg-gradient-to-r from-[color:var(--color-danger-soft)] to-[color:var(--color-surface)] hover:border-[color:var(--color-danger-text)]"
              }`}
              onClick={() => handleNavigateToQuestion(q.storageKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNavigateToQuestion(q.storageKey)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {q.lastCorrect ? (
                      <FaCheckCircle className="text-[color:var(--color-success-text)] shrink-0" />
                    ) : (
                      <FaTimesCircle className="text-[color:var(--color-danger-text)] shrink-0" />
                    )}
                    <p className="text-sm font-semibold text-[color:var(--color-text)] truncate">
                      {q.storageKey}
                    </p>
                    {q.type && (
                      <span className="rounded-full bg-[color:var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                        {q.type}
                      </span>
                    )}
                    <DifficultyBadge label={q.difficultyLabel} score={q.difficultyScore} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="rounded-full bg-[color:var(--color-info-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-info-text)]">
                      {q.subjectLabel}
                    </span>
                    {subtopicLabels.map((st) => (
                      <span key={st} className="rounded-full bg-[color:var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-primary-text)]">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs text-[color:var(--color-text-muted)]">{relativeTimeLabel(q.lastSubmittedAt)}</p>
                  <p className="text-[10px] text-[color:var(--color-border)] mt-0.5">
                    {q.correctAttempts}✓ {q.incorrectAttempts}✗ of {q.attempts}
                  </p>
                  {q.averageDurationMs > 0 ? (
                    <p className="text-[10px] text-[color:var(--color-border)] mt-0.5">
                      Avg {formatDuration(q.averageDurationMs)}
                    </p>
                  ) : null}
                  <FaArrowRight className="mt-1.5 text-xs text-[color:var(--color-border)] group-hover:text-[color:var(--color-primary)] transition-colors ml-auto" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setCurrentPage(page - 1)}
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-sm text-[color:var(--color-text-muted)] px-3">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setCurrentPage(page + 1)}
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main InsightsPage ──────────────────────────────────────────────────── */

const InsightsPage = ({
  questionBankManifest,
  hasResumeRoute,
  onResumePractice,
  onStartMockTest,
}) => {
  const { solvedCount, totalQuestions, progressPercentage } = useFilterState();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "overview";

  const [insights, setInsights] = useState({
    subjects: [],
    subtopics: [],
    wrongQuestions: [],
    reviewQueue: [],
    attemptTimeline: [],
    studyActivity: {},
    timeSummary: {},
    difficultySummary: { counts: {} },
    attemptedQuestionCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(location.search);
    params.set("tab", tabId);
    navigate({ search: `?${params.toString()}` }, { replace: true });
  }, [location.search, navigate]);

  useEffect(() => {
    let active = true;

    const loadInsights = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await loadWeakTopicInsights();
        if (active) {
          setInsights(result);
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
  }, []);

  const summary = useMemo(() => {
    const subjects = Array.isArray(insights.subjects) ? insights.subjects : [];
    const subtopics = Array.isArray(insights.subtopics) ? insights.subtopics : [];
    const wrongQuestions = Array.isArray(insights.wrongQuestions) ? insights.wrongQuestions : [];
    const reviewQueue = Array.isArray(insights.reviewQueue) ? insights.reviewQueue : [];
    const timeSummary = insights.timeSummary && typeof insights.timeSummary === "object"
      ? insights.timeSummary
      : {};
    const difficultySummary = insights.difficultySummary && typeof insights.difficultySummary === "object"
      ? insights.difficultySummary
      : {};
    const averageSubjectAccuracy = subjects.length
      ? subjects.reduce((total, item) => total + Number(item.accuracyRate || 0), 0) / subjects.length
      : 0;
    return {
      attemptedQuestionCount: Number(insights.attemptedQuestionCount || 0),
      weakSubjectCount: subjects.filter((item) => Number(item.accuracyRate || 0) < 0.7).length,
      weakSubtopicCount: subtopics.filter((item) => Number(item.accuracyRate || 0) < 0.7).length,
      averageSubjectAccuracy,
      wrongQuestionCount: wrongQuestions.length,
      dueReviewCount: reviewQueue.length,
      averageDurationMs: Number(timeSummary.averageDurationMs || 0),
      hardQuestionCount: Number(difficultySummary.counts?.Hard || 0),
    };
  }, [insights]);

  const wrongCount = Array.isArray(insights.wrongQuestions) ? insights.wrongQuestions.length : 0;
  const dueReviewCount = Array.isArray(insights.reviewQueue) ? insights.reviewQueue.length : 0;

  return (
    <PageShell onResume={hasResumeRoute ? onResumePractice : null} resumeLabel="Continue">
      <section className="space-y-5">
        {/* Hero header */}
        <header className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_42%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
            <div className="flex flex-wrap xl:flex-nowrap items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 shrink-0">
                <FaChartLine />
                Insights
              </div>
              <ProgressManager />
            </div>

            <div className="shrink-0 ml-auto lg:ml-0">
              <Link
                to={PRACTICE_ROUTE}
                className="inline-flex min-h-[40px] items-center rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FaCompass className="mr-2" />
                Open Practice
              </Link>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-sm text-[color:var(--color-text-muted)]">Building insights from your local practice history...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-4 py-3 text-sm text-[color:var(--color-warning-text)]">
            {error}
          </div>
        ) : summary.attemptedQuestionCount <= 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-center shadow-[var(--shadow-soft)]">
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
            <div className="flex gap-1 rounded-2xl bg-[color:var(--color-surface-muted)] p-1 shadow-inner">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-md"
                        : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)]/50"
                    }`}
                  >
                    <TabIcon className={`text-xs ${isActive ? "text-sky-600" : ""}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.id === "wrong" && wrongCount > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-rose-100 text-rose-700" : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]"}`}>
                        {wrongCount}
                      </span>
                    )}
                    {tab.id === "review" && dueReviewCount > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-amber-100 text-amber-700" : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]"}`}>
                        {dueReviewCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="min-h-[400px]">
              {activeTab === "overview" && (
                <OverviewTab insights={insights} summary={summary} />
              )}
              {activeTab === "review" && (
                <ReviewQueueTab reviewQueue={insights.reviewQueue || []} />
              )}
              {activeTab === "wrong" && (
                <WrongAnswersTab wrongQuestions={insights.wrongQuestions || []} />
              )}
              {activeTab === "mock-history" && (
                <MockHistoryPanel onStartMockTest={onStartMockTest} />
              )}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
};

export default InsightsPage;
