import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaChartLine,
  FaCompass,
  FaLightbulb,
  FaChevronUp,
  FaChevronDown,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBullseye,
  FaEye,
  FaArrowRight,
  FaFilter,
  FaTrophy,
  FaFireAlt,
  FaHistory,
  FaCalendarCheck,
  FaClock,
  FaLayerGroup,
  FaMedal,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
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

import PageShell from "../components/Layout/PageShell";
import { PRACTICE_ROUTE } from "../utils/routes";
import { buildSolvePath } from "../utils/routes";
import { loadWeakTopicInsights } from "../utils/weakTopicAnalyzer";
import MockHistoryPanel from "../components/Insights/MockHistoryPanel";
import useChartTheme from "../hooks/useChartTheme";
import ActivityHeatmap from "../components/Home/ActivityHeatmap";

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

const getAccuracyTone = (accuracyRate) => {
  if (accuracyRate < 0.5) {
    return {
      label: "Needs focus",
      className: "bg-rose-100 text-rose-700",
      color: "#e11d48",
      ringColor: "#fda4af",
      bgGlow: "from-rose-500/10 to-transparent",
    };
  }
  if (accuracyRate < 0.7) {
    return {
      label: "Can improve",
      className: "bg-amber-100 text-amber-800",
      color: "#d97706",
      ringColor: "#fcd34d",
      bgGlow: "from-amber-500/10 to-transparent",
    };
  }
  return {
    label: "Strong",
    className: "bg-emerald-100 text-emerald-800",
    color: "#059669",
    ringColor: "#6ee7b7",
    bgGlow: "from-emerald-500/10 to-transparent",
  };
};

const getStreakEmoji = (streak) => {
  if (streak >= 5) return "🔥";
  if (streak >= 3) return "⚠️";
  if (streak >= 1) return "📌";
  return "✅";
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
  { id: "analysis", label: "Strengths & Weaknesses", icon: FaBullseye },
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
  const colorMap = {
    sky: "border-sky-200 bg-gradient-to-br from-sky-50 to-white text-sky-900",
    rose: "border-rose-200 bg-gradient-to-br from-rose-50 to-white text-rose-900",
    amber: "border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-900",
    emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-900",
    violet: "border-violet-200 bg-gradient-to-br from-violet-50 to-white text-violet-900",
  };
  const iconColorMap = {
    sky: "text-sky-500",
    rose: "text-rose-500",
    amber: "text-amber-500",
    emerald: "text-emerald-500",
    violet: "text-violet-500",
  };

  return (
    <div className={`rounded-2xl border px-4 py-4 shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.02] ${colorMap[accent]}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`text-sm ${iconColorMap[accent]}`} />}
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sublabel && <p className="mt-0.5 text-[11px] opacity-60">{sublabel}</p>}
    </div>
  );
};

/* ── Accuracy bar ───────────────────────────────────────────────────────── */

const AccuracyBar = ({ accuracyRate, className = "" }) => {
  const percent = Math.round((accuracyRate || 0) * 100);
  const tone = getAccuracyTone(accuracyRate);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: tone.color }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-800 w-12 text-right">{formatPercent(percent)}</span>
    </div>
  );
};

/* ── Subject Performance Chart ──────────────────────────────────────────── */

const SubjectAccuracyChart = ({ data = [] }) => {
  const chartTheme = useChartTheme();
  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => a.accuracyRate - b.accuracyRate)
      .map((item) => ({
        ...item,
        displayAccuracy: item.accuracyRate * 100,
        shortLabel:
          item.label.length > 15 ? item.label.substring(0, 15) + "..." : item.label,
      }));
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: -20, bottom: 65 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
          <XAxis
            dataKey="shortLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: chartTheme.tick }}
            angle={-45}
            textAnchor="end"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: chartTheme.tick }}
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
          />
          <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: chartTheme.cursor }} />
          <Bar dataKey="displayAccuracy" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, index) => {
              const tone = getAccuracyTone(entry.accuracyRate);
              return <Cell key={`cell-${index}`} fill={tone.color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Weak Subtopics Chart ───────────────────────────────────────────────── */

const WeakSubtopicsChart = ({ data = [] }) => {
  const chartTheme = useChartTheme();
  const chartData = useMemo(() => {
    return [...data]
      .filter((item) => item.accuracyRate < 0.7)
      .sort((a, b) => a.accuracyRate - b.accuracyRate)
      .slice(0, 7)
      .map((item) => ({
        ...item,
        displayAccuracy: item.accuracyRate * 100,
        shortLabel:
          item.label.length > 25 ? item.label.substring(0, 23) + "..." : item.label,
      }));
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.grid} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: chartTheme.tick }}
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
          />
          <YAxis
            dataKey="shortLabel"
            type="category"
            axisLine={false}
            tickLine={false}
            width={160}
            tick={{ fontSize: 11, fill: chartTheme.tick }}
          />
          <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: chartTheme.cursor }} />
          <Bar dataKey="displayAccuracy" radius={[0, 6, 6, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => {
              const tone = getAccuracyTone(entry.accuracyRate);
              return <Cell key={`cell-${index}`} fill={tone.color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.15}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Radar
            name="Coverage"
            dataKey="coverage"
            stroke="#8b5cf6"
            fill="#8b5cf6"
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
  const total = correct + incorrect;
  if (total === 0) return null;

  const pieData = [
    { name: "Correct", value: correct, fill: "#059669" },
    { name: "Incorrect", value: incorrect, fill: "#e11d48" },
  ];

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
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
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
                  <p className="mt-2 text-slate-600">Attempts: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{item.attempts}</span></p>
                  <p className="text-slate-600">Accuracy: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{formatPercent(item.accuracyPercent)}</span></p>
                  <p className="text-slate-600">Avg time: <span className="font-semibold" style={{ color: "var(--chart-tooltip-text)" }}>{formatDuration(item.averageDurationMs)}</span></p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="attempts"
            name="Attempts"
            stroke="#0ea5e9"
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
  const classes = normalized === "Hard"
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : normalized === "Medium"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : normalized === "Light"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${classes}`}>
      {normalized}{Number(score) > 0 ? ` ${Math.round(score)}` : ""}
    </span>
  );
};

const SubjectDetailCard = ({ item, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const tone = getAccuracyTone(item.accuracyRate);

  return (
    <div className={`rounded-2xl border border-slate-200 overflow-hidden transition-all ${isOpen ? "shadow-md" : "shadow-[var(--shadow-soft)]"}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left bg-gradient-to-r ${tone.bgGlow} hover:bg-slate-50/50 transition-colors`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: tone.color }}
          />
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-900 truncate">{item.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatNumber(item.attemptedCount)} attempts · {formatPercent(item.coverageRate * 100)} covered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone.className}`}>
            {tone.label}
          </span>
          <span className="text-lg font-bold" style={{ color: tone.color }}>
            {formatPercent(item.accuracyRate * 100)}
          </span>
          {isOpen ? <FaChevronUp className="text-xs text-slate-400" /> : <FaChevronDown className="text-xs text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 py-4 bg-white border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Accuracy</p>
              <p className="text-lg font-bold text-slate-900">{formatPercent(item.accuracyRate * 100)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Coverage</p>
              <p className="text-lg font-bold text-slate-900">{formatPercent(item.coverageRate * 100)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Correct</p>
              <p className="text-lg font-bold text-emerald-800">{formatNumber(item.correctAttempts)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">Incorrect</p>
              <p className="text-lg font-bold text-rose-800">{formatNumber(item.incorrectAttempts)}</p>
            </div>
          </div>
          <AccuracyBar accuracyRate={item.accuracyRate} className="mt-3" />
          {item.recentMistakeStreak > 0 && (
            <p className="mt-2 text-xs text-rose-600 flex items-center gap-1">
              <FaFireAlt /> {item.recentMistakeStreak} consecutive mistake{item.recentMistakeStreak > 1 ? "s" : ""} recently
            </p>
          )}
        </div>
      )}
    </div>
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
  const studyActivity = insights.studyActivity || {};
  const difficultySummary = insights.difficultySummary || { counts: {} };

  return (
    <div className="space-y-6">
      {/* Stat cards row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
        <StatCard
          label="Streak"
          value={`${formatNumber(studyActivity.currentStreak || 0)}d`}
          icon={FaFireAlt}
          accent={(studyActivity.currentStreak || 0) >= 3 ? "emerald" : "amber"}
          sublabel={`best ${formatNumber(studyActivity.longestStreak || 0)}d`}
        />
        <StatCard
          label="XP"
          value={formatNumber(studyActivity.xp || 0)}
          icon={FaMedal}
          accent="sky"
          sublabel={`${formatNumber(studyActivity.activeDayCount || 0)} active days`}
        />
        <StatCard
          label="Hard Questions"
          value={formatNumber(difficultySummary.counts?.Hard || 0)}
          icon={FaLayerGroup}
          accent={(difficultySummary.counts?.Hard || 0) > 0 ? "rose" : "emerald"}
          sublabel={`avg score ${formatNumber(difficultySummary.averageDifficultyScore || 0)}`}
        />
        <StatCard
          label="Weak Areas"
          value={`${formatNumber(summary.weakSubjectCount)} / ${formatNumber(summary.weakSubtopicCount)}`}
          icon={FaExclamationTriangle}
          accent="amber"
          sublabel="subjects / subtopics"
        />
      </div>

      {Array.isArray(studyActivity.badges) && studyActivity.badges.length > 0 ? (
        <section className="rounded-[var(--radius-card)] border border-sky-200 bg-sky-50 px-5 py-4 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center gap-2">
            <FaMedal className="text-sky-600" />
            <span className="text-sm font-semibold text-slate-900">Badges</span>
            {studyActivity.badges.map((badge) => (
              <span key={badge} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
                {badge}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Activity Heatmap */}
      {insights?.attemptTimeline?.length > 0 && (
        <section className="mb-6">
          <ActivityHeatmap attemptTimeline={insights.attemptTimeline} />
        </section>
      )}

      {/* Charts row */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Subject Performance */}
        <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-xl font-semibold text-slate-950">Subject Performance</h2>
          <p className="mt-1 text-sm text-slate-600">
            Accuracy across all attempted subjects. Lower bars need more revision.
          </p>
          <div className="mt-4">
            <SubjectAccuracyChart data={insights.subjects} />
          </div>
        </section>

        {/* Radar + Pie */}
        <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-xl font-semibold text-slate-950">Skill Radar</h2>
          <p className="mt-1 text-sm text-slate-600">
            Accuracy (blue) vs coverage (purple) across subjects.
          </p>
          <div className="mt-4">
            {insights.subjects.length >= 3 ? (
              <SubjectRadarChart data={insights.subjects} />
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <CorrectIncorrectPie correct={totalCorrect} incorrect={totalIncorrect} />
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" /> Correct
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-600" /> Incorrect
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="text-xl font-semibold text-slate-950">Practice Trend</h2>
        <p className="mt-1 text-sm text-slate-600">
          Daily attempt volume from your local submission history.
        </p>
        <div className="mt-4">
          <TimeTrendChart data={insights.attemptTimeline || []} />
        </div>
      </section>

      {/* Target subtopics */}
      {insights.subtopics.some((s) => s.accuracyRate < 0.7) && (
        <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-xl font-semibold text-slate-950">
            <FaFireAlt className="inline mr-2 text-rose-500" />
            Critical Subtopics
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Your weakest subtopics (below 70%). Prioritize these for rapid improvement.
          </p>
          <div className="mt-4">
            <WeakSubtopicsChart data={insights.subtopics} />
          </div>
        </section>
      )}

      {/* Subject breakdown list */}
      <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="text-xl font-semibold text-slate-950">All Subjects</h2>
        <p className="mt-1 mb-4 text-sm text-slate-600">
          Tap any subject to see detailed metrics.
        </p>
        <div className="space-y-2">
          {insights.subjects.map((item) => (
            <SubjectDetailCard key={item.key} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

/* ── Strengths & Weaknesses tab ─────────────────────────────────────────── */

const AnalysisTab = ({ insights }) => {
  const strongSubjects = useMemo(() =>
    insights.subjects.filter((s) => s.accuracyRate >= 0.7).sort((a, b) => b.accuracyRate - a.accuracyRate)
  , [insights.subjects]);

  const weakSubjects = useMemo(() =>
    insights.subjects.filter((s) => s.accuracyRate < 0.7).sort((a, b) => a.accuracyRate - b.accuracyRate)
  , [insights.subjects]);

  const strongSubtopics = useMemo(() =>
    insights.subtopics.filter((s) => s.accuracyRate >= 0.7).sort((a, b) => b.accuracyRate - a.accuracyRate).slice(0, 10)
  , [insights.subtopics]);

  const weakSubtopics = useMemo(() =>
    insights.subtopics.filter((s) => s.accuracyRate < 0.7).sort((a, b) => a.accuracyRate - b.accuracyRate)
  , [insights.subtopics]);

  const renderStrengthCard = (item, isSubtopic = false) => (
    <div
      key={item.key}
      className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900 truncate">{item.label}</p>
          {isSubtopic && item.subjectLabel && (
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{item.subjectLabel}</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <FaTrophy className="text-emerald-500 text-sm" />
          <span className="text-lg font-bold text-emerald-700">{formatPercent(item.accuracyRate * 100)}</span>
        </div>
      </div>
      <AccuracyBar accuracyRate={item.accuracyRate} className="mt-2.5" />
      <div className="mt-2 flex gap-4 text-[11px] text-slate-500">
        <span>{formatNumber(item.attemptedCount)} attempts</span>
        <span>{formatPercent(item.coverageRate * 100)} covered</span>
        <span>{getStreakEmoji(item.recentMistakeStreak)} streak: {item.recentMistakeStreak}</span>
      </div>
    </div>
  );

  const renderWeaknessCard = (item, isSubtopic = false) => {
    const tone = getAccuracyTone(item.accuracyRate);
    return (
      <div
        key={item.key}
        className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/50 to-white p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-900 truncate">{item.label}</p>
            {isSubtopic && item.subjectLabel && (
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{item.subjectLabel}</p>
            )}
          </div>
          <div className="shrink-0">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone.className}`}>
              {tone.label}
            </span>
          </div>
        </div>
        <AccuracyBar accuracyRate={item.accuracyRate} className="mt-2.5" />
        <div className="mt-2 flex gap-4 text-[11px] text-slate-500">
          <span>{formatNumber(item.incorrectAttempts)} wrong</span>
          <span>{formatNumber(item.correctAttempts)} correct</span>
          <span>{getStreakEmoji(item.recentMistakeStreak)} streak: {item.recentMistakeStreak}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Strengths */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100">
            <FaTrophy className="text-emerald-600 text-sm" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Your Strengths</h2>
            <p className="text-sm text-slate-600">Subjects and subtopics where you perform above 70%</p>
          </div>
        </div>

        {strongSubjects.length === 0 && strongSubtopics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm text-slate-600">
              No strong areas yet. Keep practicing to build your strengths!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {strongSubjects.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">Strong Subjects ({strongSubjects.length})</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {strongSubjects.map((item) => renderStrengthCard(item))}
                </div>
              </div>
            )}
            {strongSubtopics.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">Top Subtopics ({strongSubtopics.length})</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {strongSubtopics.map((item) => renderStrengthCard(item, true))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Weaknesses */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100">
            <FaExclamationTriangle className="text-rose-600 text-sm" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Areas to Improve</h2>
            <p className="text-sm text-slate-600">Focus here to boost your score rapidly</p>
          </div>
        </div>

        {weakSubjects.length === 0 && weakSubtopics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center">
            <FaTrophy className="mx-auto text-2xl text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-emerald-900">
              All areas above 70%! You're doing great.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {weakSubjects.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-2">Weak Subjects ({weakSubjects.length})</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {weakSubjects.map((item) => renderWeaknessCard(item))}
                </div>
              </div>
            )}
            {weakSubtopics.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-2">Weak Subtopics ({weakSubtopics.length})</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {weakSubtopics.map((item) => renderWeaknessCard(item, true))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quick summary */}
      <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-gradient-to-br from-slate-50 to-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="text-lg font-semibold text-slate-950 mb-3">Quick Diagnosis</h2>
        <div className="space-y-2">
          {weakSubjects.length > 0 && (
            <div className="flex items-start gap-2">
              <FaTimesCircle className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700">
                <span className="font-semibold">{weakSubjects.length} subject{weakSubjects.length > 1 ? "s" : ""}</span>{" "}
                need focused revision: {weakSubjects.map((s) => s.label).join(", ")}
              </p>
            </div>
          )}
          {strongSubjects.length > 0 && (
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700">
                You're performing well in {strongSubjects.map((s) => s.label).join(", ")}
              </p>
            </div>
          )}
          {insights.subjects.some((s) => s.recentMistakeStreak >= 3) && (
            <div className="flex items-start gap-2">
              <FaFireAlt className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700">
                Active mistake streaks detected in:{" "}
                {insights.subjects.filter((s) => s.recentMistakeStreak >= 3).map((s) => s.label).join(", ")}
              </p>
            </div>
          )}
        </div>
      </section>
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
      <div className="rounded-[var(--radius-card)] border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center shadow-[var(--shadow-soft)]">
        <FaCalendarCheck className="mx-auto text-3xl text-emerald-500 mb-3" />
        <h2 className="text-xl font-semibold text-emerald-900">No due reviews</h2>
        <p className="mt-2 text-sm text-emerald-700">
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
      <div className="rounded-[var(--radius-card)] border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center shadow-[var(--shadow-soft)]">
        <FaCheckCircle className="mx-auto text-3xl text-emerald-500 mb-3" />
        <h2 className="text-xl font-semibold text-emerald-900">No Wrong Answers!</h2>
        <p className="mt-2 text-sm text-emerald-700">
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
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-600 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setCurrentPage(page + 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
        <header className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_42%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[var(--shadow-card)] sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                <FaChartLine />
                Insights
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">
                Practice performance insights
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={PRACTICE_ROUTE}
                className="inline-flex min-h-[48px] items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FaCompass className="mr-2" />
                Open Practice
              </Link>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-600">Building insights from your local practice history...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : summary.attemptedQuestionCount <= 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white p-8 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FaLightbulb />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">No insights yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
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
            <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 shadow-inner">
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
                        ? "bg-white text-slate-900 shadow-md"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    <TabIcon className={`text-xs ${isActive ? "text-sky-600" : ""}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.id === "wrong" && wrongCount > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-600"}`}>
                        {wrongCount}
                      </span>
                    )}
                    {tab.id === "review" && dueReviewCount > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>
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
              {activeTab === "analysis" && (
                <AnalysisTab insights={insights} />
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
