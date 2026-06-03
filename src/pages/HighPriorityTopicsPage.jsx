import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaBullseye,
  FaCheckCircle,
  FaLayerGroup,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageShell from "../components/Layout/PageShell";
import { loadHighPriorityTopicsDataset } from "../utils/highPriorityTopics";

const OFFICIAL_SUBJECT_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#f97316",
  "#0891b2",
  "#be123c",
  "#7c3aed",
  "#65a30d",
  "#0d9488",
  "#ea580c",
  "#4f46e5",
  "#db2777",
  "#64748b",
  "#0284c7",
  "#a16207",
  "#059669",
  "#b91c1c",
  "#6d28d9",
  "#ca8a04",
  "#0369a1",
  "#c2410c",
  "#4d7c0f",
  "#7e22ce",
  "#0f766e",
  "#e11d48",
  "#475569",
];

const getSubjectColor = (index = 0) => OFFICIAL_SUBJECT_COLORS[index % OFFICIAL_SUBJECT_COLORS.length];

const getItemColor = (item = {}, index = 0) => item.color || getSubjectColor(index);

const PERIOD_COLORS = [
  "#4f83c3",
  "#e4a9a9",
  "#cddfa6",
  "#8dd8cf",
  "#b8abd1",
  "#9ed2df",
  "#f6bf95",
  "#b9adbf",
  "#b9cf93",
  "#9eacc6",
  "#f1c5ab",
  "#9ebbd8",
];

const formatNumber = (value, digits = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits > 0 ? digits : 0,
  }).format(numeric);
};

const formatCompactDecimal = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(numeric);
};

const Section = ({ title, description, children }) => (
  <section className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
    {title || description ? (
      <div className="mb-5">
        {title ? <h2 className="text-xl font-semibold text-[color:var(--color-text)]">{title}</h2> : null}
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-[color:var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
    ) : null}
    {children}
  </section>
);

const OverviewCard = ({ icon: Icon, label, value, helper }) => (
  <article className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {label}
    </div>
    <p className="mt-3 text-2xl font-black leading-tight text-[color:var(--color-text)]">{value}</p>
    {helper ? <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">{helper}</p> : null}
  </article>
);

const getTrendMarksForPeriod = (item = {}, period = {}) => {
  if (Array.isArray(item.paperSeries) && item.paperSeries.length > 0) {
    const entry = item.paperSeries.find((seriesEntry) => (
      seriesEntry.key === period.key || seriesEntry.period === period.period
    ));
    return Number(entry?.marks || 0);
  }
  if (Array.isArray(item.yearSeries) && item.yearSeries.length > 0) {
    const entry = item.yearSeries.find((seriesEntry) => Number(seriesEntry.year) === Number(period.year));
    return Number(entry?.marks || 0);
  }
  return 0;
};

const OfficialMarksTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xl">
      <p className="font-black">{item.name}</p>
      <p className="mt-1">
        {label}: <span className="font-black">{formatNumber(item.value)} marks</span>
      </p>
    </div>
  );
};

const MarksPointLabel = ({ x, y, value }) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return (
    <text
      x={x}
      y={y - 11}
      textAnchor="middle"
      className="fill-slate-800 text-[13px] font-black"
    >
      {formatNumber(numeric)}
    </text>
  );
};

const SubjectMarksOverYearsChart = ({ items = [] }) => {
  const defaultItem = items.find((item) => item.label === "Algorithms") || items[0];
  const [selectedKey, setSelectedKey] = useState(defaultItem?.key || "");
  const selectedItem = items.find((item) => item.key === selectedKey) || defaultItem;
  const selectedIndex = Math.max(0, items.findIndex((item) => item.key === selectedItem?.key));
  const selectedColor = getItemColor(selectedItem, selectedIndex);

  if (!selectedItem?.paperSeries?.length) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-[color:var(--color-text-muted)]">
        Official paper-wise marks data is not available yet.
      </div>
    );
  }

  const data = selectedItem.paperSeries.map((entry) => ({
    label: entry.shortLabel || entry.label,
    marks: entry.marks,
  }));

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm sm:p-5">
      <h3 className="text-center text-3xl font-black leading-tight tracking-normal text-slate-800 sm:text-4xl">
        Subject Marks Over Years
      </h3>
      <div className="mt-2 h-[440px] w-full sm:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 34, right: 26, left: 10, bottom: 92 }}>
            <CartesianGrid stroke="#6f6f6f" vertical={false} strokeWidth={1.1} />
            <XAxis
              dataKey="label"
              interval={0}
              height={86}
              tick={{ fill: "#111827", fontSize: 12, fontWeight: 700 }}
              tickLine={{ stroke: "#555" }}
              axisLine={{ stroke: "#555", strokeWidth: 1.2 }}
              angle={-90}
              textAnchor="end"
              label={{
                value: "Years",
                position: "insideBottom",
                offset: -56,
                fill: "#2f2f2f",
                fontSize: 24,
                fontWeight: 800,
              }}
            />
            <YAxis
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
              tick={{ fill: "#111827", fontSize: 14, fontWeight: 700 }}
              tickLine={{ stroke: "#555" }}
              axisLine={{ stroke: "#555", strokeWidth: 1.2 }}
              label={{
                value: "Marks",
                angle: -90,
                position: "insideLeft",
                fill: "#2f2f2f",
                fontSize: 24,
                fontWeight: 800,
              }}
            />
            <RechartsTooltip content={<OfficialMarksTooltip />} />
            <Line
              type="linear"
              dataKey="marks"
              name={selectedItem.label}
              stroke={selectedColor}
              strokeWidth={3}
              dot={{ r: 5, fill: selectedColor, stroke: selectedColor }}
              activeDot={{ r: 7, fill: selectedColor, stroke: "#111827", strokeWidth: 2 }}
              isAnimationActive={false}
            >
              <LabelList dataKey="marks" content={<MarksPointLabel />} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-black">
        {items.map((item, index) => {
          const isSelected = item.key === selectedItem.key;
          const color = getItemColor(item, index);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedKey(item.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition ${
                isSelected ? "text-slate-800" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span
                className="h-2.5 w-5 rounded-full"
                style={{ backgroundColor: color, opacity: isSelected ? 1 : 0.55 }}
              />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const OfficialDistributionTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xl">
      <p className="font-black">{label}</p>
      <p className="mt-1">
        {item?.payload?.periodLabel || "Selected paper"}:{" "}
        <span className="font-black">{formatNumber(item.value)} marks</span>
      </p>
    </div>
  );
};

const BarValueLabel = ({ x, y, width, value }) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 7}
      textAnchor="middle"
      className="fill-slate-800 text-[13px] font-black"
    >
      {formatNumber(numeric)}
    </text>
  );
};

const MarksDistributionBetweenSubjectsChart = ({ items = [], periods = [] }) => {
  const firstSeries = items[0]?.paperSeries || [];
  const availablePeriods = periods.length ? periods : firstSeries;
  const latestPeriod = availablePeriods[availablePeriods.length - 1];
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(latestPeriod?.key || latestPeriod?.period || "");
  const selectedPeriod = availablePeriods.find((period) => (
    (period.key || period.period) === selectedPeriodKey
  )) || latestPeriod;

  if (!selectedPeriod || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-[color:var(--color-text-muted)]">
        Official subject distribution data is not available yet.
      </div>
    );
  }

  const periodLabel = selectedPeriod.shortLabel || selectedPeriod.label || selectedPeriod.period;
  const data = items.map((item, index) => ({
    key: item.key,
    label: item.label,
    periodLabel,
    marks: getTrendMarksForPeriod(item, selectedPeriod),
    color: getItemColor(item, index),
  }));

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm sm:p-5">
      <h3 className="text-center text-3xl font-black leading-tight tracking-normal text-slate-800 sm:text-4xl">
        Marks Distribution Between Subjects
      </h3>
      <div className="mt-2 h-[500px] w-full sm:h-[560px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 34, right: 16, left: 8, bottom: 180 }}>
            <CartesianGrid stroke="#6f6f6f" vertical={false} strokeWidth={1.1} />
            <XAxis
              dataKey="label"
              interval={0}
              height={170}
              tick={{ fill: "#111827", fontSize: 12, fontWeight: 700 }}
              tickLine={{ stroke: "#555" }}
              axisLine={{ stroke: "#555", strokeWidth: 1.2 }}
              angle={-90}
              textAnchor="end"
              label={{
                value: "Subjects",
                position: "insideBottom",
                offset: -146,
                fill: "#2f2f2f",
                fontSize: 24,
                fontWeight: 800,
              }}
            />
            <YAxis
              domain={[0, 15]}
              ticks={[0, 5, 10, 15]}
              tick={{ fill: "#111827", fontSize: 14, fontWeight: 700 }}
              tickLine={{ stroke: "#555" }}
              axisLine={{ stroke: "#555", strokeWidth: 1.2 }}
              label={{
                value: "Marks",
                angle: -90,
                position: "insideLeft",
                fill: "#2f2f2f",
                fontSize: 24,
                fontWeight: 800,
              }}
            />
            <RechartsTooltip content={<OfficialDistributionTooltip />} />
            <Bar dataKey="marks" name={periodLabel} isAnimationActive={false}>
              <LabelList dataKey="marks" content={<BarValueLabel />} />
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  fillOpacity={entry.marks > 0 ? 1 : 0.25}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-black">
        {availablePeriods.map((period, index) => {
          const key = period.key || period.period;
          const isSelected = key === (selectedPeriod.key || selectedPeriod.period);
          const color = PERIOD_COLORS[index % PERIOD_COLORS.length];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedPeriodKey(key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition ${
                isSelected ? "text-slate-800" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className="h-3 w-3 shrink-0" style={{ backgroundColor: isSelected ? "#4f83c3" : color }} />
              {period.shortLabel || period.label || period.period}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const METRIC_CONFIG = {
  min: { label: "Min", color: "#a9c6df", domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] },
  avg: { label: "Avg", color: "#c44f4c", domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] },
  max: { label: "Max", color: "#c9dda5", domain: [0, 20], ticks: [0, 5, 10, 15, 20] },
};

const MetricValueLabel = ({ x, y, width, value }) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 7}
      textAnchor="middle"
      className="fill-slate-800 text-[13px] font-black"
    >
      {formatCompactDecimal(numeric)}
    </text>
  );
};

const MinAvgMaxMarksChart = ({ items = [] }) => {
  const [activeMetric, setActiveMetric] = useState("avg");
  const metric = METRIC_CONFIG[activeMetric] || METRIC_CONFIG.avg;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-[color:var(--color-text-muted)]">
        Official min/average/max data is not available yet.
      </div>
    );
  }

  const data = items.map((item, index) => {
    const marks = Array.isArray(item.paperSeries)
      ? item.paperSeries.map((entry) => Number(entry.marks || 0)).filter(Number.isFinite)
      : [];
    const min = marks.length ? Math.min(...marks) : 0;
    const max = marks.length ? Math.max(...marks) : 0;
    const avg = marks.length ? marks.reduce((sum, value) => sum + value, 0) / marks.length : 0;
    return {
      key: item.key,
      label: item.label,
      min,
      avg: Number(avg.toFixed(2)),
      max,
      color: getItemColor(item, index),
    };
  });

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm sm:p-5">
      <h3 className="text-center text-3xl font-black leading-tight tracking-normal text-slate-800 sm:text-4xl">
        Min/Avg/Max Marks
      </h3>
      <div className="mt-2 h-[500px] w-full sm:h-[560px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 34, right: 16, left: 8, bottom: 180 }}>
            <CartesianGrid stroke="#6f6f6f" vertical={false} strokeWidth={1.1} />
            <XAxis
              dataKey="label"
              interval={0}
              height={170}
              tick={{ fill: "#111827", fontSize: 12, fontWeight: 700 }}
              tickLine={{ stroke: "#555" }}
              axisLine={{ stroke: "#555", strokeWidth: 1.2 }}
              angle={-90}
              textAnchor="end"
              label={{
                value: "Subjects",
                position: "insideBottom",
                offset: -146,
                fill: "#2f2f2f",
                fontSize: 24,
                fontWeight: 800,
              }}
            />
            <YAxis
              domain={metric.domain}
              ticks={metric.ticks}
              tick={{ fill: "#111827", fontSize: 14, fontWeight: 700 }}
              tickLine={{ stroke: "#555" }}
              axisLine={{ stroke: "#555", strokeWidth: 1.2 }}
              label={{
                value: "Marks",
                angle: -90,
                position: "insideLeft",
                fill: "#2f2f2f",
                fontSize: 24,
                fontWeight: 800,
              }}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-xl">
                    <p className="font-black">{label}</p>
                    <p className="mt-1">
                      {metric.label}: <span className="font-black">{formatCompactDecimal(payload[0].value)} marks</span>
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey={activeMetric} name={metric.label} isAnimationActive={false}>
              <LabelList dataKey={activeMetric} content={<MetricValueLabel />} />
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  fillOpacity={entry[activeMetric] > 0 ? 1 : 0.25}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-black">
        {Object.entries(METRIC_CONFIG).map(([key, config]) => {
          const isSelected = key === activeMetric;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveMetric(key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition ${
                isSelected ? "text-slate-800" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className="h-3 w-3 shrink-0" style={{ backgroundColor: config.color }} />
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TopicLink = ({ topic }) => (
  <Link
    to={topic.practiceUrl}
    className="flex items-center justify-between gap-3 rounded-lg bg-[color:var(--color-surface-muted)] px-3 py-2 text-sm transition hover:bg-[color:var(--color-primary-soft)]"
  >
    <span className="min-w-0 truncate font-semibold text-[color:var(--color-text)]">{topic.label}</span>
    <span className="shrink-0 text-xs font-bold text-[color:var(--color-text-muted)]">{formatNumber(topic.questions)} Q</span>
  </Link>
);

const SubjectDirectoryCard = ({ subject, topics = [], useFallbackTopics = true }) => {
  const displayTopics = topics.length ? topics : useFallbackTopics ? subject.topTopics || [] : [];

  return (
    <article className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-black text-white dark:bg-sky-700">
              {subject.shortLabel || subject.label}
            </span>
            <h3 className="text-base font-bold text-[color:var(--color-text)]">{subject.label}</h3>
          </div>
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            {Number.isFinite(Number(subject.averageMarks))
              ? `${formatNumber(subject.averageMarks, 1)} average marks per paper`
              : `${formatNumber(subject.questions)} questions, ${formatNumber(subject.totalMarks, 1)} estimated marks`}
          </p>
        </div>
        <Link
          to={subject.practiceUrl}
          className="inline-flex min-h-[36px] shrink-0 items-center gap-2 rounded-lg bg-[color:var(--color-primary)] px-3 py-2 text-xs font-bold text-white transition hover:bg-[color:var(--color-primary-hover)]"
        >
          Practice <FaArrowRight className="text-[10px]" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {displayTopics.slice(0, 4).map((topic) => (
          <TopicLink key={topic.key} topic={topic} />
        ))}
        {displayTopics.length ? null : (
          <p className="rounded-lg border border-dashed border-[color:var(--color-border)] px-3 py-2 text-sm text-[color:var(--color-text-muted)]">
            Topic tags are not available for this subject yet.
          </p>
        )}
      </div>
    </article>
  );
};

const YearSnapshotCard = ({ snapshot }) => (
  <article className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4">
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-lg font-black text-[color:var(--color-text)]">{snapshot.year}</h3>
      {snapshot.subject ? (
        <span className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-black text-white dark:bg-sky-700">
          {snapshot.subject.shortLabel || snapshot.subject.label}
        </span>
      ) : null}
    </div>
    {snapshot.subject ? (
      <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
        Top subject: <strong className="text-[color:var(--color-text)]">{snapshot.subject.label}</strong>
      </p>
    ) : (
      <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">No subject data available.</p>
    )}
    <div className="mt-3 space-y-2">
      {snapshot.topTopics.map((topic) => (
        <Link
          key={topic.key}
          to={topic.practiceUrl}
          className="block truncate rounded-lg bg-[color:var(--color-surface)] px-3 py-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-primary-soft)]"
        >
          {topic.label}
        </Link>
      ))}
      {snapshot.topTopics.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[color:var(--color-border)] px-3 py-2 text-sm text-[color:var(--color-text-muted)]">
          No topic trend data available.
        </p>
      ) : null}
    </div>
  </article>
);

const AptitudeCard = ({ topic }) => (
  <article className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-soft)]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="rounded-lg bg-[color:var(--color-surface-muted)] px-2 py-1 text-xs font-black text-[color:var(--color-text)]">
          {topic.shortLabel || topic.label}
        </span>
        <h3 className="mt-3 text-base font-bold text-[color:var(--color-text)]">{topic.label}</h3>
      </div>
      <FaCheckCircle className="mt-1 text-[color:var(--color-success-text)]" aria-hidden="true" />
    </div>
    <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">
      Part of GATE CSE General Aptitude. Aptitude is fixed at 10 questions and 15 marks per paper.
    </p>
    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
      <span className="text-[color:var(--color-text-muted)]">
        {Number.isFinite(Number(topic.averageMarks)) ? "Avg marks" : "Seen in bank"}:{" "}
        <strong className="text-[color:var(--color-text)]">
          {Number.isFinite(Number(topic.averageMarks)) ? formatNumber(topic.averageMarks, 1) : formatNumber(topic.questions)}
        </strong>
      </span>
      <Link to={topic.practiceUrl} className="font-bold text-[color:var(--color-primary)] hover:underline">
        Practice
      </Link>
    </div>
  </article>
);

const HighPriorityTopicsPage = () => {
  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    const loadDataset = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await loadHighPriorityTopicsDataset();
        if (active) {
          setDataset(result);
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

  const technicalSubjects = dataset?.technicalSubjects || dataset?.subjects || [];
  const technicalTopics = dataset?.technicalTopics || dataset?.topics || [];
  const aptitudeTopics = dataset?.aptitudeTopics || [];
  const officialTrendItems = dataset?.officialTrendItems || [];
  const officialMarksItems = dataset?.officialMarksItems || officialTrendItems;
  const officialPeriods = useMemo(() => {
    if (Array.isArray(dataset?.officialPeriods) && dataset.officialPeriods.length > 0) {
      return dataset.officialPeriods;
    }
    return Array.isArray(officialMarksItems[0]?.paperSeries) ? officialMarksItems[0].paperSeries : [];
  }, [dataset, officialMarksItems]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTechnicalTopics = useMemo(() => {
    if (!normalizedQuery) return technicalTopics;
    return technicalTopics.filter((topic) => (
      topic.label.toLowerCase().includes(normalizedQuery)
      || topic.subjectLabel.toLowerCase().includes(normalizedQuery)
      || String(topic.shortLabel || "").toLowerCase().includes(normalizedQuery)
    ));
  }, [normalizedQuery, technicalTopics]);

  const topicsBySubject = useMemo(() => {
    const map = new Map();
    filteredTechnicalTopics.forEach((topic) => {
      if (!map.has(topic.subjectSlug)) {
        map.set(topic.subjectSlug, []);
      }
      map.get(topic.subjectSlug).push(topic);
    });
    return map;
  }, [filteredTechnicalTopics]);

  const directorySubjects = useMemo(() => {
    if (!normalizedQuery) return technicalSubjects;
    return technicalSubjects.filter((subject) => topicsBySubject.has(subject.subjectSlug));
  }, [normalizedQuery, technicalSubjects, topicsBySubject]);

  const highestWeightTopic = useMemo(() => (
    technicalSubjects
      .slice()
      .sort((left, right) => (right.averageMarks ?? right.totalMarks) - (left.averageMarks ?? left.totalMarks))[0]
  ), [technicalSubjects]);
  const topSubjects = useMemo(() => technicalSubjects.slice(0, 3), [technicalSubjects]);
  const recentPeriods = useMemo(() => {
    if (officialPeriods.length > 0) {
      return officialPeriods.slice(-10);
    }
    return (dataset?.years || []).slice(-6).map((year) => ({
      key: String(year),
      period: String(year),
      label: String(year),
      shortLabel: String(year),
      year,
    }));
  }, [dataset, officialPeriods]);
  const trendSourceItems = officialTrendItems.length ? officialTrendItems : technicalTopics;
  const paperSnapshots = useMemo(() => (
    recentPeriods
      .slice(-6)
      .slice()
      .reverse()
      .map((period) => {
        const subject = technicalSubjects
          .map((item) => ({
            ...item,
            periodMarks: getTrendMarksForPeriod(item, period),
          }))
          .filter((item) => item.periodMarks > 0)
          .sort((left, right) => right.periodMarks - left.periodMarks)[0];
        const topTopics = trendSourceItems
          .map((item) => ({
            ...item,
            periodMarks: getTrendMarksForPeriod(item, period),
          }))
          .filter((item) => item.periodMarks > 0)
          .sort((left, right) => {
            if (right.periodMarks !== left.periodMarks) return right.periodMarks - left.periodMarks;
            return (right.averageMarks ?? right.totalMarks) - (left.averageMarks ?? left.totalMarks);
          })
          .slice(0, 3);
        return { year: period.shortLabel || period.label, subject, topTopics };
      })
  ), [recentPeriods, technicalSubjects, trendSourceItems]);

  return (
    <PageShell contentClassName="space-y-6">
      <header className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-[var(--shadow-card)] sm:px-6">
        <h1 className="text-3xl font-black tracking-normal text-[color:var(--color-text)] sm:text-4xl">
          High Priority Topics
        </h1>
      </header>

      {isLoading ? (
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10 shadow-[var(--shadow-card)]">
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            <p className="text-sm font-semibold text-[color:var(--color-text-muted)]">Building GATE CSE topic guide...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-4 py-3 text-sm font-semibold text-[color:var(--color-warning-text)]">
          {error}
        </div>
      ) : dataset ? (
        <>
          <Section>
            <div className="grid gap-4 md:grid-cols-3">
              <OverviewCard
                icon={FaStar}
                label="Most important subjects"
                value={topSubjects.map((subject) => subject.shortLabel || subject.label).join(", ") || "Not enough data"}
                helper={topSubjects.map((subject) => subject.label).join(" | ")}
              />
              <OverviewCard
                icon={FaBullseye}
                label="Highest weightage subject"
                value={highestWeightTopic?.label || "Not enough data"}
                helper={highestWeightTopic ? `${formatNumber(highestWeightTopic.averageMarks ?? highestWeightTopic.totalMarks, 1)} average marks per paper` : ""}
              />
              <OverviewCard
                icon={FaBookOpen}
                label="GATE CSE structure"
                value="65 questions"
                helper="Technical section plus 10 fixed aptitude questions worth 15 marks."
              />
            </div>
          </Section>

          <Section
            title="Recent Trends"
            description="Paper-wise GATE CSE movement from the official marks table. This highlights areas that are receiving more marks recently."
          >
            <SubjectMarksOverYearsChart items={officialMarksItems} />
            <div className="mt-6">
              <MarksDistributionBetweenSubjectsChart items={officialMarksItems} periods={officialPeriods} />
            </div>
            <div className="mt-6">
              <MinAvgMaxMarksChart items={officialMarksItems} />
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-base font-bold text-[color:var(--color-text)]">Recent Paper Snapshots</h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {paperSnapshots.map((snapshot) => (
                  <YearSnapshotCard key={snapshot.year} snapshot={snapshot} />
                ))}
              </div>
            </div>
          </Section>

          <Section
            title="Topic Directory"
            description="Pick a subject, then attack its most repeated topics first. Aptitude is listed separately because its paper weight is fixed."
          >
            <div className="mb-5">
              <label className="relative block">
                <span className="sr-only">Search technical topics</span>
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search technical topics or subjects"
                  className="min-h-[46px] w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-10 pr-3 text-sm font-semibold text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </label>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <FaLayerGroup className="text-[color:var(--color-text-muted)]" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-[color:var(--color-text)]">Technical Topics</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {directorySubjects.map((subject) => (
                    <SubjectDirectoryCard
                      key={subject.key}
                      subject={subject}
                      topics={topicsBySubject.get(subject.subjectSlug) || []}
                      useFallbackTopics={!normalizedQuery}
                    />
                  ))}
                </div>
                {directorySubjects.length === 0 ? (
                  <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-[color:var(--color-text-muted)]">
                    No technical topics match this search.
                  </div>
                ) : null}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <FaCheckCircle className="text-[color:var(--color-text-muted)]" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-[color:var(--color-text)]">Aptitude Topics</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {aptitudeTopics.map((topic) => (
                    <AptitudeCard key={topic.key} topic={topic} />
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </>
      ) : null}
    </PageShell>
  );
};

export default HighPriorityTopicsPage;
