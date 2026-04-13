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
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
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
} from "recharts";

import PageShell from "../components/Layout/PageShell";
import { PRACTICE_ROUTE } from "../utils/routes";
import { buildSolvePath } from "../utils/routes";
import { loadWeakTopicInsights } from "../utils/weakTopicAnalyzer";

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
  { id: "wrong", label: "Wrong Answers", icon: FaTimesCircle },
];

/* ── Chart tooltip ──────────────────────────────────────────────────────── */

const ChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <p className="font-semibold text-slate-900">{data.label || data.name}</p>
        {data.subjectLabel ? (
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {data.subjectLabel}
          </p>
        ) : null}
        <div className="grid gap-1.5 mt-2">
          {data.accuracyRate != null && (
            <p className="text-sm flex justify-between gap-4 text-slate-600">
              <span>Accuracy:</span>
              <span className="font-semibold text-slate-900">
                {formatPercent(data.accuracyRate * 100)}
              </span>
            </p>
          )}
          {data.attemptedCount != null && (
            <p className="text-sm flex justify-between gap-4 text-slate-600">
              <span>Attempts:</span>
              <span className="font-semibold text-slate-900">
                {formatNumber(data.attemptedCount)}
              </span>
            </p>
          )}
          {data.coverageRate != null && (
            <p className="text-sm flex justify-between gap-4 text-slate-600">
              <span>Coverage:</span>
              <span className="font-semibold text-slate-900">
                {formatPercent(data.coverageRate * 100)}
              </span>
            </p>
          )}
          {data.value != null && data.accuracyRate == null && (
            <p className="text-sm flex justify-between gap-4 text-slate-600">
              <span>Count:</span>
              <span className="font-semibold text-slate-900">{data.value}</span>
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
            stroke="currentColor"
            className="text-slate-100"
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
          <span className="text-base font-bold text-slate-900">
            {formatPercent(safeValue)}
          </span>
        </div>
      </div>
      {label && <p className="text-xs font-semibold text-slate-700 text-center leading-tight">{label}</p>}
      {sublabel && <p className="text-[10px] text-slate-500 text-center">{sublabel}</p>}
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

const AnswerCoveragePanel = ({ answerCoverage }) => {
  if (!answerCoverage) {
    return null;
  }

  const latestYearLabel = answerCoverage.latestYearCoverage
    ? `${answerCoverage.latestYearCoverage.label} coverage`
    : "Coverage";

  return (
    <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Answer Coverage</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manifest-backed tracking for verified answers across the published question bank.
          </p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
          {formatNumber(answerCoverage.totalQuestions)} questions
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Verified Answers"
          value={formatNumber(answerCoverage.verifiedCount)}
          icon={FaCheckCircle}
          accent="emerald"
          sublabel={`of ${formatNumber(answerCoverage.totalQuestions)} published`}
        />
        <StatCard
          label="Still Pending"
          value={formatNumber(answerCoverage.pendingCount)}
          icon={FaExclamationTriangle}
          accent={answerCoverage.pendingCount > 0 ? "amber" : "emerald"}
          sublabel="questions without a verified answer"
        />
        <StatCard
          label="Coverage"
          value={formatPercent(answerCoverage.coverageRatio * 100, 1)}
          icon={FaChartLine}
          accent={answerCoverage.coverageRatio >= 0.95 ? "sky" : "amber"}
          sublabel={`${formatNumber(answerCoverage.unsupportedCount)} unsupported by current resolver`}
        />
        <StatCard
          label={latestYearLabel}
          value={answerCoverage.latestYearCoverage
            ? formatPercent(answerCoverage.latestYearCoverage.coverageRatio * 100)
            : "—"}
          icon={FaBullseye}
          accent="violet"
          sublabel={answerCoverage.latestYearCoverage
            ? `${formatNumber(answerCoverage.latestYearCoverage.covered)} of ${formatNumber(answerCoverage.latestYearCoverage.total)} covered`
            : "latest year unavailable"}
        />
      </div>
    </section>
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="shortLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            angle={-45}
            textAnchor="end"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
          />
          <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: "rgba(241, 245, 249, 0.5)" }} />
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
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
          />
          <YAxis
            dataKey="shortLabel"
            type="category"
            axisLine={false}
            tickLine={false}
            width={160}
            tick={{ fontSize: 11, fill: "#475569" }}
          />
          <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: "rgba(241, 245, 249, 0.5)" }} />
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
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#475569" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <Radar
            name="Accuracy"
            dataKey="accuracy"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name="Coverage"
            dataKey="coverage"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="4 4"
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

  return (
    <div className="space-y-6">
      {/* Stat cards row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
          label="Weak Subjects"
          value={formatNumber(summary.weakSubjectCount)}
          icon={FaExclamationTriangle}
          accent="rose"
          sublabel="below 70%"
        />
        <StatCard
          label="Weak Subtopics"
          value={formatNumber(summary.weakSubtopicCount)}
          icon={FaExclamationTriangle}
          accent="amber"
          sublabel="below 70%"
        />
      </div>

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
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Wrong</p>
          <p className="text-2xl font-bold text-slate-900">{formatNumber(wrongQuestions.length)}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Still Wrong</p>
          <p className="text-2xl font-bold text-rose-900">{formatNumber(stillWrongCount)}</p>
          <p className="text-[10px] text-rose-600">Last attempt was incorrect</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Recovered</p>
          <p className="text-2xl font-bold text-emerald-900">{formatNumber(recoveredCount)}</p>
          <p className="text-[10px] text-emerald-600">Now answered correctly</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <FaFilter className="text-slate-400 text-sm" />
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        >
          <option value="all">All Status</option>
          <option value="still-wrong">Still Wrong</option>
          <option value="recovered">Recovered</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">
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
                  ? "border-emerald-200 bg-gradient-to-r from-emerald-50/30 to-white hover:border-emerald-300"
                  : "border-rose-200 bg-gradient-to-r from-rose-50/30 to-white hover:border-rose-300"
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
                      <FaCheckCircle className="text-emerald-500 shrink-0" />
                    ) : (
                      <FaTimesCircle className="text-rose-500 shrink-0" />
                    )}
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {q.storageKey}
                    </p>
                    {q.type && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        {q.type}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-700">
                      {q.subjectLabel}
                    </span>
                    {subtopicLabels.map((st) => (
                      <span key={st} className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs text-slate-500">{relativeTimeLabel(q.lastSubmittedAt)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {q.correctAttempts}✓ {q.incorrectAttempts}✗ of {q.attempts}
                  </p>
                  <FaArrowRight className="mt-1.5 text-xs text-slate-300 group-hover:text-sky-500 transition-colors ml-auto" />
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

const InsightsPage = ({ questionBankManifest, hasResumeRoute, onResumePractice }) => {
  const [insights, setInsights] = useState({
    subjects: [],
    subtopics: [],
    wrongQuestions: [],
    attemptedQuestionCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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
    const averageSubjectAccuracy = subjects.length
      ? subjects.reduce((total, item) => total + Number(item.accuracyRate || 0), 0) / subjects.length
      : 0;
    const answerCoverage = questionBankManifest?.answerCoverage;
    const totalQuestions = Number(questionBankManifest?.questionCount || 0);
    const coverageYearSets = Array.isArray(answerCoverage?.yearSets) ? answerCoverage.yearSets : [];
    const latestYear = Number(questionBankManifest?.latestYear || 0);
    const latestYearCoverageSets = latestYear
      ? coverageYearSets.filter((item) => Number(item?.year) === latestYear)
      : [];
    const latestYearCoverage = latestYearCoverageSets.length
      ? latestYearCoverageSets.reduce((totals, item) => ({
        label: `${latestYear}`,
        total: totals.total + Number(item?.total || 0),
        covered: totals.covered + Number(item?.covered || 0),
        unsupported: totals.unsupported + Number(item?.unsupported || 0),
        coverageRatio: 0,
      }), {
        label: `${latestYear}`,
        total: 0,
        covered: 0,
        unsupported: 0,
        coverageRatio: 0,
      })
      : null;

    if (latestYearCoverage && latestYearCoverage.total > 0) {
      latestYearCoverage.coverageRatio = latestYearCoverage.covered / latestYearCoverage.total;
    }

    const verifiedCount = Number(answerCoverage?.directQuestionUidMatches || 0);
    const answerCoverageSummary = answerCoverage && totalQuestions > 0
      ? {
        verifiedCount,
        pendingCount: Math.max(totalQuestions - verifiedCount, 0),
        unsupportedCount: Number(answerCoverage.unsupportedQuestionCount || 0),
        coverageRatio: Number(answerCoverage.estimatedCoverageRatio || 0),
        totalQuestions,
        latestYearCoverage,
      }
      : null;

    return {
      attemptedQuestionCount: Number(insights.attemptedQuestionCount || 0),
      weakSubjectCount: subjects.filter((item) => Number(item.accuracyRate || 0) < 0.7).length,
      weakSubtopicCount: subtopics.filter((item) => Number(item.accuracyRate || 0) < 0.7).length,
      averageSubjectAccuracy,
      wrongQuestionCount: wrongQuestions.length,
      answerCoverage: answerCoverageSummary,
    };
  }, [insights, questionBankManifest]);

  const wrongCount = Array.isArray(insights.wrongQuestions) ? insights.wrongQuestions.length : 0;

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
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Understand your strengths, identify weaknesses, and review every wrong answer — all in one place.
              </p>
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

        <AnswerCoveragePanel answerCoverage={summary.answerCoverage} />

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
                    onClick={() => setActiveTab(tab.id)}
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
              {activeTab === "wrong" && (
                <WrongAnswersTab wrongQuestions={insights.wrongQuestions || []} />
              )}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
};

export default InsightsPage;
