import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBullseye,
  FaChartBar,
  FaChartLine,
  FaCompass,
  FaDatabase,
  FaExternalLinkAlt,
  FaFilter,
  FaFireAlt,
  FaLayerGroup,
  FaSearch,
  FaSignal,
  FaTable,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageShell from "../components/Layout/PageShell";
import useChartTheme from "../hooks/useChartTheme";
import {
  HIGH_PRIORITY_TOPICS_SOURCE_URL,
  SUBJECT_SUMMARIES,
  loadHighPriorityTopicsDataset,
} from "../utils/highPriorityTopics";
import { INSIGHTS_ROUTE } from "../utils/routes";

const SUBJECT_COLORS = [
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

const formatNumber = (value, digits = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits > 0 ? digits : 0,
  }).format(numeric);
};

const formatTrend = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || Math.abs(numeric) < 0.01) {
    return "0.0";
  }
  return `${numeric > 0 ? "+" : ""}${numeric.toFixed(1)}`;
};

const MetricCard = ({ label, value, helper, icon: Icon, tone = "sky" }) => {
  const toneClass = {
    sky: "border-[color:var(--color-info-border)] bg-[color:var(--color-info-soft)] text-[color:var(--color-info-text)]",
    emerald: "border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] text-[color:var(--color-success-text)]",
    amber: "border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-text)]",
    violet: "border-[color:var(--color-purple-border)] bg-[color:var(--color-purple-soft)] text-[color:var(--color-purple-text)]",
  }[tone] || "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)]";

  return (
    <div className={`rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft)] ${toneClass}`}>
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {label}
      </div>
      <p className="mt-2 text-2xl font-black leading-none tracking-normal">{value}</p>
      {helper ? <p className="mt-1 text-xs font-semibold opacity-80">{helper}</p> : null}
    </div>
  );
};

const TierBadge = ({ tier = "Occasional" }) => {
  const styles = {
    "Core Priority": "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-200",
    "High Yield": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-200",
    Watchlist: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-200",
    Occasional: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[tier] || styles.Occasional}`}>
      {tier}
    </span>
  );
};

const TrendPill = ({ direction = "flat", delta = 0 }) => {
  const styles = {
    up: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-200",
    down: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-200",
    flat: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  const label = direction === "up" ? "Rising" : direction === "down" ? "Cooling" : "Stable";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[direction] || styles.flat}`}>
      <FaSignal className="h-3 w-3" aria-hidden="true" />
      {label} {formatTrend(delta)}
    </span>
  );
};

const FrequencyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }
  const data = payload[0]?.payload || {};
  return (
    <div className="rounded-xl border border-[color:var(--chart-tooltip-border)] bg-[color:var(--chart-tooltip-bg)] p-3 text-sm shadow-xl">
      <p className="font-bold text-[color:var(--chart-tooltip-text)]">{data.label || label}</p>
      <p className="mt-1 text-[color:var(--chart-tooltip-muted)]">
        Marks: <span className="font-semibold text-[color:var(--chart-tooltip-text)]">{formatNumber(data.marks, 1)}</span>
      </p>
      <p className="text-[color:var(--chart-tooltip-muted)]">
        Questions: <span className="font-semibold text-[color:var(--chart-tooltip-text)]">{formatNumber(data.questions)}</span>
      </p>
    </div>
  );
};

const TopicTrendChart = ({ topic, height = "h-[280px]" }) => {
  const chartTheme = useChartTheme();
  if (!topic?.yearSeries?.length) {
    return null;
  }

  return (
    <div className={`${height} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={topic.yearSeries} margin={{ top: 16, right: 20, left: -18, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: chartTheme.tick }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: chartTheme.tick }} tickLine={false} axisLine={false} allowDecimals={false} />
          <RechartsTooltip content={<FrequencyTooltip />} />
          <Line
            type="monotone"
            dataKey="marks"
            stroke={chartTheme.seriesAccuracy}
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const SubjectWeightChart = ({ subjects = [], height = "h-[320px]" }) => {
  const chartTheme = useChartTheme();
  const data = subjects.slice(0, 10).map((subject) => ({
    ...subject,
    shortLabel: subject.label.length > 14 ? `${subject.label.slice(0, 12)}...` : subject.label,
  }));

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={`${height} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.grid} />
          <XAxis type="number" tick={{ fontSize: 11, fill: chartTheme.tick }} tickLine={false} axisLine={false} />
          <YAxis dataKey="shortLabel" type="category" tick={{ fontSize: 11, fill: chartTheme.tick }} tickLine={false} axisLine={false} width={102} />
          <RechartsTooltip content={<FrequencyTooltip />} />
          <Bar dataKey="totalMarks" radius={[0, 6, 6, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TopicRankItem = ({ topic, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(topic.key)}
    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
      isSelected
        ? "border-sky-500 bg-[color:var(--color-primary-soft)] shadow-[var(--shadow-soft)]"
        : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-muted)]"
    }`}
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white dark:bg-sky-700">
      {topic.rank}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-bold text-[color:var(--color-text)]">{topic.label}</span>
      <span className="mt-0.5 block truncate text-xs text-[color:var(--color-text-muted)]">
        {topic.subjectLabel} {topic.category ? `· ${topic.category}` : ""} · <span className="font-semibold text-sky-600 dark:text-sky-400">{topic.baselineCount || topic.questions} baseline PYQs</span>
      </span>
      <span className="mt-2 flex flex-wrap items-center gap-1.5">
        <TierBadge tier={topic.priorityTier} />
        <TrendPill direction={topic.trendDirection} delta={topic.trendDeltaMarks} />
      </span>
    </span>
    <span className="shrink-0 text-right">
      <span className="block text-lg font-black text-[color:var(--color-text)]">{topic.importanceScore}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">Score</span>
    </span>
  </button>
);

const TopicTable = ({ items = [], emptyLabel = "No topics match this filter." }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-center text-sm text-[color:var(--color-text-muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[color:var(--color-border)] text-sm">
          <thead className="bg-[color:var(--color-surface-muted)] text-left text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Frequency</th>
              <th className="px-4 py-3">Consistency</th>
              <th className="px-4 py-3">Trend</th>
              <th className="px-4 py-3">Practice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-border)]">
            {items.map((item) => (
              <tr key={item.key} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 font-black text-[color:var(--color-text)]">#{item.rank}</td>
                <td className="px-4 py-3">
                  <p className="font-bold text-[color:var(--color-text)]">{item.label}</p>
                  <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                    {item.subjectLabel} {item.category ? `· ${item.category}` : ""}
                  </p>
                  <div className="mt-2">
                    <TierBadge tier={item.priorityTier} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-text)]">
                  <p className="font-bold text-sky-700 dark:text-sky-400">{formatNumber(item.baselineCount || item.questions)} baseline PYQs</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{formatNumber(item.questions)} in bank · {formatNumber(item.totalMarks, 1)} est. marks</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-text)]">
                  <p className="font-bold">{item.activeYears}/{item.yearSeries.length} years</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{formatNumber(item.paperCount)} paper instances</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <TrendPill direction={item.trendDirection} delta={item.trendDeltaMarks} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    to={item.practiceUrl}
                    className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-800"
                  >
                    <FaCompass aria-hidden="true" />
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SubjectCards = ({ subjects = [], onSelectCategory }) => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {subjects.map((subject) => (
      <article key={subject.key} className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-black text-[color:var(--color-text)]">{subject.label}</p>
            <p className="mt-1 text-xs font-semibold text-[color:var(--color-text-muted)]">
              {formatNumber(subject.baselineCount || subject.questions)} baseline PYQs · {formatNumber(subject.questions)} in bank
            </p>
          </div>
          <span className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-black text-white dark:bg-sky-700">#{subject.rank}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TierBadge tier={subject.priorityTier} />
          <TrendPill direction={subject.trendDirection} delta={subject.trendDeltaMarks} />
        </div>

        {(() => {
          const summary = SUBJECT_SUMMARIES.find((s) => s.subjectSlug === subject.subjectSlug);
          if (!summary || !summary.categories || summary.categories.length === 0) return null;
          return (
            <div className="mt-4 border-t border-[color:var(--color-border)] pt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)] mb-2">Sub-Categories</p>
              <div className="flex flex-wrap gap-1.5">
                {summary.categories.map((cat) => (
                  <button
                    key={cat.categorySlug}
                    onClick={() => onSelectCategory && onSelectCategory({ subjectSlug: subject.subjectSlug, categorySlug: cat.categorySlug })}
                    className="inline-flex items-center gap-1 rounded bg-[color:var(--color-surface-muted)] px-2.5 py-1 text-[10px] font-bold text-[color:var(--color-text)] transition hover:bg-sky-500 hover:text-white"
                  >
                    <span>{cat.category}</span>
                    <span className="opacity-60 font-semibold">({cat.totalCount})</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {subject.topTopics?.length ? (
          <div className="mt-4 border-t border-[color:var(--color-border)] pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)] mb-2">Top Topics</p>
            <div className="space-y-2">
              {subject.topTopics.map((topic) => {
                const percentage = subject.totalMarks > 0
                  ? (topic.totalMarks / subject.totalMarks) * 100
                  : 0;
                return (
                  <Link
                    key={topic.key}
                    to={topic.practiceUrl}
                    className="flex items-center justify-between gap-3 rounded-lg bg-[color:var(--color-surface-muted)] px-3 py-2 text-xs font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-primary-soft)]"
                  >
                    <span className="truncate">{topic.label}</span>
                    <span className="shrink-0 text-[color:var(--color-text-muted)]">{formatNumber(percentage, 1)}%</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </article>
    ))}
  </div>
);

const HighPriorityTopicsPage = () => {
  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ranking");
  const [selectedTopicKey, setSelectedTopicKey] = useState("");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  const handleSubjectFilterChange = (newSubject) => {
    setSubjectFilter(newSubject);
    setCategoryFilter("all");
  };

  const handleSelectTopic = (key) => {
    setSelectedTopicKey(key);
    setIsMobileDetailOpen(true);
  };

  useEffect(() => {
    let active = true;

    const loadDataset = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await loadHighPriorityTopicsDataset();
        if (active) {
          setDataset(result);
          setSelectedTopicKey((current) => current || result.topics?.[0]?.key || "");
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load topic frequency data.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadDataset();

    return () => {
      active = false;
    };
  }, []);

  const subjectOptions = dataset?.subjects || [];
  const normalizedQuery = query.trim().toLowerCase();

  const activeSubjectSummary = useMemo(() => {
    return SUBJECT_SUMMARIES.find((s) => s.subjectSlug === subjectFilter);
  }, [subjectFilter]);

  const categoryOptions = useMemo(() => {
    if (!activeSubjectSummary) return [];
    return activeSubjectSummary.categories || [];
  }, [activeSubjectSummary]);

  const filteredTopics = useMemo(() => {
    const topics = dataset?.topics || [];
    return topics.filter((topic) => {
      const subjectMatches = subjectFilter === "all" || topic.subjectSlug === subjectFilter;
      const categoryMatches = categoryFilter === "all" || topic.categorySlug === categoryFilter;
      const queryMatches = !normalizedQuery
        || topic.label.toLowerCase().includes(normalizedQuery)
        || topic.subjectLabel.toLowerCase().includes(normalizedQuery);
      return subjectMatches && categoryMatches && queryMatches;
    });
  }, [dataset, normalizedQuery, subjectFilter, categoryFilter]);

  const filteredSubjects = useMemo(() => {
    const subjects = dataset?.subjects || [];
    if (subjectFilter === "all") {
      return subjects;
    }
    return subjects.filter((subject) => subject.subjectSlug === subjectFilter);
  }, [dataset, subjectFilter]);

  const selectedTopic = filteredTopics.find((topic) => topic.key === selectedTopicKey)
    || filteredTopics[0]
    || dataset?.topics?.[0]
    || null;

  const keyInsights = useMemo(() => {
    if (!dataset?.topics?.length) return null;

    const topics = dataset.topics;

    // 1. Rising Topics (direction = up, sorted by score)
    const rising = [...topics]
      .filter((t) => t.trendDirection === "up")
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, 3);

    // 2. Declining Topics (direction = down, sorted by delta)
    const declining = [...topics]
      .filter((t) => t.trendDirection === "down")
      .sort((a, b) => a.trendDeltaMarks - b.trendDeltaMarks)
      .slice(0, 3);

    // 3. Consistently Important (priorityTier = Core Priority, sorted by consistency)
    const consistent = [...topics]
      .filter((t) => t.priorityTier === "Core Priority")
      .sort((a, b) => {
        if (b.consistencyRate !== a.consistencyRate) {
          return b.consistencyRate - a.consistencyRate;
        }
        return b.importanceScore - a.importanceScore;
      })
      .slice(0, 3);

    // 4. High-Yield Practice Areas
    const highYield = [...topics]
      .filter((t) => t.priorityTier === "Core Priority" || t.priorityTier === "High Yield")
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, 3);

    return { rising, declining, consistent, highYield };
  }, [dataset]);

  return (
    <PageShell>
      <section className="space-y-5 pb-12">
        <header className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--color-primary-text)]">
                <FaFireAlt aria-hidden="true" />
                High-Priority Topics
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-normal text-[color:var(--color-text)] sm:text-3xl">
                20-year GATE CS frequency map
              </h1>
              {dataset && (
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)] font-medium">
                  {dataset.startYear}-{dataset.latestYear}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                to={INSIGHTS_ROUTE}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2 text-sm font-bold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)]"
              >
                <FaChartLine aria-hidden="true" />
                Progress Dashboard
              </Link>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10 shadow-[var(--shadow-card)]">
            <div className="flex flex-col items-center justify-center min-h-[160px] gap-3">
              <div className="h-8 w-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-[color:var(--color-text-muted)]">Building GateOverflow topic frequencies...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-4 py-3 text-sm font-semibold text-[color:var(--color-warning-text)]">
            {error}
          </div>
        ) : dataset ? (
          <>
            {/* Quick Prep Insights Panel */}
            {keyInsights && (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-card-fade-enter" aria-label="Key Prep Insights">
                {/* 1. Rising Topics */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/10 shadow-sm transition-all hover:shadow-md">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    🔥 Rising / Hot Topics
                  </h3>
                  <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-medium">Growing weight in recent exams</p>
                  <ul className="mt-3 space-y-2">
                    {keyInsights.rising.length > 0 ? (
                      keyInsights.rising.map((t) => (
                        <li key={t.key} className="flex items-center justify-between gap-2 border-b border-dashed border-[color:var(--color-border)]/40 pb-1.5 last:border-0 last:pb-0">
                          <Link to={t.practiceUrl} className="truncate text-xs font-bold text-[color:var(--color-text)] hover:text-sky-600 hover:underline">
                            {t.label}
                          </Link>
                          <span className="shrink-0 text-[10px] font-black text-emerald-600 dark:text-emerald-400">+{t.trendDeltaMarks} marks</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-[color:var(--color-text-muted)] italic">No significant rising trends</li>
                    )}
                  </ul>
                </div>

                {/* 2. Declining Topics */}
                <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 dark:border-rose-500/20 dark:bg-rose-950/10 shadow-sm transition-all hover:shadow-md">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    <span className="flex h-2 w-2 rounded-full bg-rose-400" />
                    📉 Cooling Topics
                  </h3>
                  <p className="mt-1 text-[11px] text-rose-700/80 dark:text-rose-400/80 font-medium">Slightly lower weight recently</p>
                  <ul className="mt-3 space-y-2">
                    {keyInsights.declining.length > 0 ? (
                      keyInsights.declining.map((t) => (
                        <li key={t.key} className="flex items-center justify-between gap-2 border-b border-dashed border-[color:var(--color-border)]/40 pb-1.5 last:border-0 last:pb-0">
                          <Link to={t.practiceUrl} className="truncate text-xs font-bold text-[color:var(--color-text)] hover:text-sky-600 hover:underline">
                            {t.label}
                          </Link>
                          <span className="shrink-0 text-[10px] font-black text-rose-500 dark:text-rose-400">{t.trendDeltaMarks} marks</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-[color:var(--color-text-muted)] italic">No significant cooling trends</li>
                    )}
                  </ul>
                </div>

                {/* 3. Consistently Important */}
                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 dark:border-violet-500/20 dark:bg-violet-950/10 shadow-sm transition-all hover:shadow-md">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">
                    🏆 Consistently Core
                  </h3>
                  <p className="mt-1 text-[11px] text-violet-700/80 dark:text-violet-400/80 font-medium">Regularly tested every single year</p>
                  <ul className="mt-3 space-y-2">
                    {keyInsights.consistent.map((t) => (
                      <li key={t.key} className="flex items-center justify-between gap-2 border-b border-dashed border-[color:var(--color-border)]/40 pb-1.5 last:border-0 last:pb-0">
                        <Link to={t.practiceUrl} className="truncate text-xs font-bold text-[color:var(--color-text)] hover:text-sky-600 hover:underline">
                          {t.label}
                        </Link>
                        <span className="shrink-0 text-[10px] font-black text-violet-600 dark:text-violet-400">{Math.round(t.consistencyRate * 100)}% active</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. High-Yield Practice Areas */}
                <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-500/20 dark:bg-amber-950/10 shadow-sm transition-all hover:shadow-md">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    ⭐ High-Yield Focus
                  </h3>
                  <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">Top value for core preparation</p>
                  <ul className="mt-3 space-y-2">
                    {keyInsights.highYield.map((t) => (
                      <li key={t.key} className="flex items-center justify-between gap-2 border-b border-dashed border-[color:var(--color-border)]/40 pb-1.5 last:border-0 last:pb-0">
                        <Link to={t.practiceUrl} className="truncate text-xs font-bold text-[color:var(--color-text)] hover:text-sky-600 hover:underline">
                          {t.label}
                        </Link>
                        <span className="shrink-0 text-[10px] font-black text-amber-600 dark:text-amber-400">Score: {t.importanceScore}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
            {/* View Switching Tab bar */}
            <div className="flex gap-1.5 rounded-2xl bg-[color:var(--color-surface-muted)] p-1 shadow-inner max-w-2xl mx-auto w-full border border-[color:var(--color-border)]/40">
              {[
                { id: "ranking", label: "Rankings Map", icon: FaFireAlt },
                { id: "directory", label: "Topic Directory", icon: FaTable },
                { id: "subjects", label: "Subject Weight", icon: FaChartBar },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? "bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-md"
                        : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)]/50"
                    }`}
                  >
                    <TabIcon className={`text-xs sm:text-sm ${isActive ? "text-sky-600" : ""}`} />
                    <span className="text-[11px] sm:text-xs md:text-sm tracking-wide">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT AREAS */}

            {activeTab === "ranking" && (
              <div className="grid gap-5 lg:grid-cols-[400px_1fr] animate-card-fade-enter">
                {/* Left rank pane */}
                <section
                  aria-label="Priority ranking"
                  className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="mb-4 space-y-3">
                    <div>
                      <h2 className="text-base font-black text-[color:var(--color-text)]">Priority Ranking</h2>
                      <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Core priority topics calculated from baseline count, recency, and trends.</p>
                    </div>

                    <div className="grid gap-2 grid-cols-2">
                      <label className="relative block">
                        <span className="sr-only">Search</span>
                        <FaSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[color:var(--color-text-muted)]" aria-hidden="true" />
                        <input
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="Search topics or subjects..."
                          className="min-h-[36px] w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-7 pr-2 text-xs font-semibold text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        />
                      </label>
                      <label className="block">
                        <span className="sr-only">Subject</span>
                        <select
                          value={subjectFilter}
                          onChange={(event) => handleSubjectFilterChange(event.target.value)}
                          className="min-h-[36px] w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2 text-xs font-semibold text-[color:var(--color-text)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="all">All subjects</option>
                          {subjectOptions.map((subject) => (
                            <option key={subject.key} value={subject.subjectSlug}>{subject.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="max-h-[580px] space-y-2 overflow-y-auto pr-1">
                    {filteredTopics.map((topic) => (
                      <TopicRankItem
                        key={topic.key}
                        topic={topic}
                        isSelected={selectedTopic?.key === topic.key}
                        onSelect={handleSelectTopic}
                      />
                    ))}
                    {filteredTopics.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-8 text-center text-sm text-[color:var(--color-text-muted)]">
                        No topics match this filter.
                      </div>
                    ) : null}
                  </div>
                </section>

                {/* Right detail pane (desktop only) */}
                <div className="hidden lg:block rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
                  {selectedTopic ? (
                    <div className="space-y-5 animate-card-fade-enter">
                      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-border)]/60 pb-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">
                            #{selectedTopic.rank} · {selectedTopic.subjectLabel} {selectedTopic.category ? `· ${selectedTopic.category}` : ""}
                          </p>
                          <h2 className="mt-1 text-2xl font-black text-[color:var(--color-text)] leading-tight">{selectedTopic.label}</h2>
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            <TierBadge tier={selectedTopic.priorityTier} />
                            <TrendPill direction={selectedTopic.trendDirection} delta={selectedTopic.trendDeltaMarks} />
                          </div>
                        </div>
                        <Link
                          to={selectedTopic.practiceUrl}
                          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-800 shadow-sm shrink-0"
                        >
                          Practice
                          <FaArrowRight aria-hidden="true" />
                        </Link>
                      </div>

                      <div className="grid gap-3 grid-cols-3">
                        <div className="rounded-xl bg-[color:var(--color-surface-muted)] p-3.5 border border-[color:var(--color-border)]/40">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">Baseline Count</p>
                          <p className="mt-1 text-2xl font-black text-[color:var(--color-text)]">{formatNumber(selectedTopic.questions)}</p>
                        </div>
                        <div className="rounded-xl bg-[color:var(--color-surface-muted)] p-3.5 border border-[color:var(--color-border)]/40">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">Est. Marks</p>
                          <p className="mt-1 text-2xl font-black text-[color:var(--color-text)]">{formatNumber(selectedTopic.totalMarks, 1)}</p>
                        </div>
                        <div className="rounded-xl bg-[color:var(--color-surface-muted)] p-3.5 border border-[color:var(--color-border)]/40">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">Appeared Years</p>
                          <p className="mt-1 text-2xl font-black text-[color:var(--color-text)]">{selectedTopic.activeYears}/{selectedTopic.yearSeries.length} yrs</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)] mb-3">20-Year Marks Weight Trend</h3>
                        <TopicTrendChart topic={selectedTopic} height="h-[280px]" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border)] p-8 text-center text-sm text-[color:var(--color-text-muted)]">
                      Select a topic on the left to inspect its marks timeline.
                    </div>
                  )}
                </div>

                {/* Mobile Detail Modal Overlay */}
                {isMobileDetailOpen && selectedTopic && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm lg:hidden">
                    <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-2xl animate-card-fade-enter">
                      <button
                        type="button"
                        onClick={() => setIsMobileDetailOpen(false)}
                        className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                      <div className="space-y-4 pt-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">
                            #{selectedTopic.rank} · {selectedTopic.subjectLabel} {selectedTopic.category ? `· ${selectedTopic.category}` : ""}
                          </p>
                          <h2 className="mt-1 text-lg font-black text-[color:var(--color-text)] leading-tight pr-6">{selectedTopic.label}</h2>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <TierBadge tier={selectedTopic.priorityTier} />
                            <TrendPill direction={selectedTopic.trendDirection} delta={selectedTopic.trendDeltaMarks} />
                          </div>
                        </div>

                        <div className="grid gap-2 grid-cols-3">
                          <div className="rounded-xl bg-[color:var(--color-surface-muted)] p-2 border border-[color:var(--color-border)]/40 text-center">
                            <p className="text-[10px] font-bold uppercase text-[color:var(--color-text-muted)]">PYQs</p>
                            <p className="mt-0.5 text-base font-black text-[color:var(--color-text)]">{formatNumber(selectedTopic.questions)}</p>
                          </div>
                          <div className="rounded-xl bg-[color:var(--color-surface-muted)] p-2 border border-[color:var(--color-border)]/40 text-center">
                            <p className="text-[10px] font-bold uppercase text-[color:var(--color-text-muted)]">Marks</p>
                            <p className="mt-0.5 text-base font-black text-[color:var(--color-text)]">{formatNumber(selectedTopic.totalMarks, 1)}</p>
                          </div>
                          <div className="rounded-xl bg-[color:var(--color-surface-muted)] p-2 border border-[color:var(--color-border)]/40 text-center">
                            <p className="text-[10px] font-bold uppercase text-[color:var(--color-text-muted)]">Appeared</p>
                            <p className="mt-0.5 text-base font-black text-[color:var(--color-text)]">{selectedTopic.activeYears}/{selectedTopic.yearSeries.length} yrs</p>
                          </div>
                        </div>

                        <div className="border-t border-[color:var(--color-border)] pt-3">
                          <h3 className="text-[11px] font-bold uppercase text-[color:var(--color-text-muted)] mb-2">Yearly Weight Trend</h3>
                          <TopicTrendChart topic={selectedTopic} height="h-[180px]" />
                        </div>

                        <div className="pt-2">
                          <Link
                            to={selectedTopic.practiceUrl}
                            className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-800 shadow-sm"
                          >
                            Practice Now
                            <FaArrowRight aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "directory" && (
              <div className="space-y-4 animate-card-fade-enter">
                {/* Directory filter block */}
                <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-soft)] space-y-3">
                  <div className="grid gap-3 md:grid-cols-[1fr_240px]">
                    <label className="relative block">
                      <span className="sr-only">Search topics</span>
                      <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-text-muted)]" aria-hidden="true" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search topics or subjects..."
                        className="min-h-[42px] w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-9 pr-3 text-sm font-semibold text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </label>
                    <label className="block">
                      <span className="sr-only">Filter subject</span>
                      <select
                        value={subjectFilter}
                        onChange={(event) => handleSubjectFilterChange(event.target.value)}
                        className="min-h-[42px] w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm font-semibold text-[color:var(--color-text)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="all">All subjects</option>
                        {subjectOptions.map((subject) => (
                          <option key={subject.key} value={subject.subjectSlug}>{subject.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {categoryOptions.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[color:var(--color-border)] pt-3 animate-card-fade-enter">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[color:var(--color-text-muted)] mr-1">Sub-Categories:</span>
                      <button
                        type="button"
                        onClick={() => setCategoryFilter("all")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          categoryFilter === "all"
                            ? "bg-sky-600 text-white shadow-sm"
                            : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)] hover:bg-[color:var(--color-border)]"
                        }`}
                      >
                        All ({activeSubjectSummary.totalQuestions})
                      </button>
                      {categoryOptions.map((cat) => (
                        <button
                          key={cat.categorySlug}
                          type="button"
                          onClick={() => setCategoryFilter(cat.categorySlug)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            categoryFilter === cat.categorySlug
                              ? "bg-sky-600 text-white shadow-sm"
                              : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)] hover:bg-[color:var(--color-border)]"
                          }`}
                        >
                          {cat.category} ({cat.totalCount})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Directory Content Table (desktop screen >= md) */}
                <div className="hidden md:block">
                  <TopicTable items={filteredTopics} />
                </div>

                {/* Directory Content Responsive Cards (mobile screen < md) */}
                <div className="block md:hidden space-y-3">
                  {filteredTopics.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="inline-flex items-center rounded-lg bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white dark:bg-sky-700 mr-2">
                            #{item.rank}
                          </span>
                          <span className="text-sm font-black text-[color:var(--color-text)]">{item.label}</span>
                          <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                            {item.subjectLabel} {item.category ? `· ${item.category}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[color:var(--color-surface-muted)] p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-[color:var(--color-text-muted)]">Frequency</span>
                          <span className="font-bold text-sky-700 dark:text-sky-400">{formatNumber(item.baselineCount || item.questions)} PYQs</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-[color:var(--color-text-muted)]">Consistency</span>
                          <span className="font-bold">{item.activeYears}/{item.yearSeries.length} yrs</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <TierBadge tier={item.priorityTier} />
                        <Link
                          to={item.practiceUrl}
                          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-sky-800 shadow-sm"
                        >
                          <FaCompass className="text-xs" />
                          Practice
                        </Link>
                      </div>
                    </div>
                  ))}
                  {filteredTopics.length === 0 ? (
                    <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 text-center text-sm text-[color:var(--color-text-muted)]">
                      No topics match this filter.
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {activeTab === "subjects" && (
              <div className="grid gap-5 xl:grid-cols-[450px_1fr] animate-card-fade-enter">
                {/* Left Column: Bar Chart */}
                <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-card)] self-start">
                  <div className="mb-4">
                    <h2 className="text-base font-black text-[color:var(--color-text)]">Subject Weight Snapshot</h2>
                    <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Estimated marks distribution across core GATE subjects (20-year window).</p>
                  </div>
                  <SubjectWeightChart subjects={filteredSubjects.length ? filteredSubjects : dataset.subjects} height="h-[260px] sm:h-[320px]" />
                </div>

                {/* Right Column: Subject breakdown Cards */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-black text-[color:var(--color-text)]">Subject Breakdowns</h2>
                    <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Explore sub-categories and high-impact study topics within each syllabus area.</p>
                  </div>
                  <SubjectCards
                    subjects={filteredSubjects}
                    onSelectCategory={({ subjectSlug, categorySlug }) => {
                      setSubjectFilter(subjectSlug);
                      setCategoryFilter(categorySlug);
                      setActiveTab("directory");
                    }}
                  />
                </div>
              </div>
            )}

            {/* Footnote removed */}
          </>
        ) : null}
      </section>
    </PageShell>
  );
};

export default HighPriorityTopicsPage;
