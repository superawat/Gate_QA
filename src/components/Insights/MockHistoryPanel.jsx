import React from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaQuestionCircle,
  FaRegClock,
  FaStar,
  FaTimesCircle,
  FaHistory
} from "react-icons/fa";
import { Link } from "react-router-dom";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";

import { formatMockTimeSpent } from "../../utils/mockTest";
import { readMockTestHistory } from "../../utils/mockTestHistory";
import { buildSolvePath } from "../../utils/routes";

const formatNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("en-IN").format(numeric);
};

const formatAttemptDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const formatScoreDelta = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return numeric > 0 ? `+${numeric}` : String(numeric);
};

const ATTEMPT_GROUP_STYLES = {
  correct: {
    panel: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/20",
    label: "text-emerald-700 dark:text-emerald-400 font-bold",
    value: "text-emerald-900 dark:text-emerald-100 font-bold",
    pill: "border-emerald-200 bg-white text-emerald-900 shadow-sm transition-shadow hover:shadow-md dark:border-emerald-900/40 dark:bg-slate-900 dark:text-emerald-300",
    meta: "text-emerald-700/80 dark:text-emerald-400/80",
  },
  incorrect: {
    panel: "border-rose-200 bg-rose-50/80 dark:border-rose-900/40 dark:bg-rose-950/20",
    label: "text-rose-700 dark:text-rose-400 font-bold",
    value: "text-rose-900 dark:text-rose-100 font-bold",
    pill: "border-rose-200 bg-white text-rose-900 shadow-sm transition-shadow hover:shadow-md dark:border-rose-900/40 dark:bg-slate-900 dark:text-rose-300",
    meta: "text-rose-700/80 dark:text-rose-400/80",
  },
  unanswered: {
    panel: "border-amber-200 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20",
    label: "text-amber-700 dark:text-amber-400 font-bold",
    value: "text-amber-900 dark:text-amber-100 font-bold",
    pill: "border-amber-200 bg-white text-amber-900 shadow-sm transition-shadow hover:shadow-md dark:border-amber-900/40 dark:bg-slate-900 dark:text-amber-300",
    meta: "text-amber-700/80 dark:text-amber-400/80",
  },
  bonus: {
    panel: "border-sky-200 bg-sky-50/80 dark:border-sky-900/40 dark:bg-sky-950/20",
    label: "text-sky-700 dark:text-sky-400 font-bold",
    value: "text-sky-900 dark:text-sky-100 font-bold",
    pill: "border-sky-200 bg-white text-sky-900 shadow-sm transition-shadow hover:shadow-md dark:border-sky-900/40 dark:bg-slate-900 dark:text-sky-300",
    meta: "text-sky-700/80 dark:text-sky-400/80",
  },
};

const QuestionRecordGroup = ({ title, tone, questions = [], emptyLabel }) => {
  const styles = ATTEMPT_GROUP_STYLES[tone] || ATTEMPT_GROUP_STYLES.unanswered;

  return (
    <section className={`rounded-lg border px-2 py-1.5 ${styles.panel}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${styles.label}`}>{title}</p>
        <p className={`text-sm font-bold tabular-nums ${styles.value}`}>{formatNumber(questions.length)}</p>
      </div>

      {questions.length ? (
        <div className="mt-1.5 max-h-32 overflow-y-auto pr-1">
          <div className="grid gap-1.5">
            {questions.map((question) => {
              const timeExceeded = Boolean(question.timeExceededThreshold);
              const hasRecordedTime = timeExceeded || Number(question.timeSpentSeconds || 0) > 0;
              const timeClass = timeExceeded ? "font-bold text-amber-700 dark:text-amber-400" : "font-semibold";
              const pillClass = `${styles.pill} ${timeExceeded ? "ring-1 ring-amber-300 dark:ring-amber-700" : ""}`;

              return question.questionUid ? (
                <Link
                  key={`${title}-${question.questionUid}`}
                  to={buildSolvePath(question.questionUid)}
                  className={`rounded-lg border px-2 py-1.5 ${pillClass}`}
                >
                  <p className="text-xs font-semibold truncate">{question.label}</p>
                  <div className={`mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] ${styles.meta}`}>
                    <span className="font-mono">ID {question.questionUid}</span>
                    <span className="font-semibold uppercase tracking-[0.08em]">{question.type || "Question"}</span>
                    <span className="font-semibold">Score {formatScoreDelta(question.scoreDelta)}</span>
                    {hasRecordedTime ? (
                      <span className={timeClass}>Time {formatMockTimeSpent(question.timeSpentSeconds)}</span>
                    ) : null}
                  </div>
                </Link>
              ) : (
                <article
                  key={`${title}-${question.label}-${question.type || "question"}`}
                  className={`rounded-lg border px-2 py-1.5 ${pillClass}`}
                >
                  <p className="text-xs font-semibold truncate">{question.label}</p>
                  <div className={`mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] ${styles.meta}`}>
                    <span className="font-mono">ID unavailable</span>
                    <span className="font-semibold uppercase tracking-[0.08em]">{question.type || "Question"}</span>
                    <span className="font-semibold">Score {formatScoreDelta(question.scoreDelta)}</span>
                    {hasRecordedTime ? (
                      <span className={timeClass}>Time {formatMockTimeSpent(question.timeSpentSeconds)}</span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      )}
    </section>
  );
};

const getAttemptQuestionTimeRows = (attempt = {}) => {
  const groups = [
    ["correct", attempt.correctQuestions || []],
    ["incorrect", attempt.incorrectQuestions || []],
    ["unanswered", attempt.unansweredQuestions || []],
  ];
  const sectionRank = { GA: 0, CS: 1 };

  return groups
    .flatMap(([outcome, questions]) => questions.map((question) => ({ ...question, outcome })))
    .sort((left, right) => {
      const leftSection = sectionRank[left.section] ?? 2;
      const rightSection = sectionRank[right.section] ?? 2;
      if (leftSection !== rightSection) return leftSection - rightSection;

      const leftOrder = Number.isFinite(Number(left.orderIndex)) ? Number(left.orderIndex) : Number.MAX_SAFE_INTEGER;
      const rightOrder = Number.isFinite(Number(right.orderIndex)) ? Number(right.orderIndex) : Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;

      return String(left.label || left.questionUid || "").localeCompare(String(right.label || right.questionUid || ""));
    });
};

const TimeDistributionPanel = ({ attempt }) => {
  const rows = getAttemptQuestionTimeRows(attempt);
  if (!rows.length) return null;
  const hasTimingData = rows.some((question) => Number(question.timeSpentSeconds || 0) > 0)
    || Number(attempt?.timeAnalysis?.totalSeconds || 0) > 0;
  if (!hasTimingData) return null;

  const maxSeconds = Math.max(1, ...rows.map((question) => Number(question.timeSpentSeconds || 0)));
  const slowCount = Number(attempt?.timeAnalysis?.slowQuestionCount || 0);
  const averageSeconds = Number(attempt?.timeAnalysis?.averageSeconds || 0);

  return (
    <section className="rounded-[var(--radius-card)] border border-slate-200 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-slate-100">Per-question time</h4>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Avg {formatMockTimeSpent(averageSeconds)} | {slowCount} over 3 min
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <FaRegClock className="text-[10px]" />
          {formatMockTimeSpent(attempt?.timeAnalysis?.totalSeconds)}
        </div>
      </div>

      <div className="mt-2.5 grid max-h-32 gap-1.5 overflow-y-auto pr-1">
        {rows.map((question) => {
          const timeSpentSeconds = Number(question.timeSpentSeconds || 0);
          const width = `${Math.max(4, Math.round((timeSpentSeconds / maxSeconds) * 100))}%`;
          const timeExceeded = Boolean(question.timeExceededThreshold);

          return (
            <div
              key={`${question.outcome}-${question.questionUid || question.label}`}
              className={`grid grid-cols-[4rem_minmax(0,1fr)_4.25rem] items-center gap-2 rounded-lg border px-2 py-1.5 text-xs ${
                timeExceeded
                  ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              <span className="truncate font-bold">{question.label}</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${timeExceeded ? "bg-amber-500" : "bg-sky-500"}`}
                  style={{ width }}
                />
              </div>
              <span className={`text-right font-bold tabular-nums ${timeExceeded ? "text-amber-800 dark:text-amber-300" : "text-slate-600 dark:text-slate-300"}`}>
                {formatMockTimeSpent(timeSpentSeconds)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const MockAnalyticsCharts = ({ history = [] }) => {
  if (history.length < 2) return null;

  const chartData = [...history].reverse().map((attempt, index) => {
    let gaScore = 0;
    let csScore = 0;

    const allQuestions = [
      ...(attempt.correctQuestions || []),
      ...(attempt.incorrectQuestions || []),
    ];

    allQuestions.forEach(q => {
      if (q.section === "GA") gaScore += q.scoreDelta;
      else if (q.section === "CS") csScore += q.scoreDelta;
      // if section is null, it's not strictly GA or CS, we can ignore or add to CS
    });

    return {
      name: `Mock ${index + 1}`,
      date: new Date(attempt.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      score: attempt.score,
      gaScore: Number(gaScore.toFixed(2)),
      csScore: Number(csScore.toFixed(2)),
      fullLabel: attempt.selectedPaperLabel || attempt.kindTitle
    };
  });

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      {/* Score Trend Chart */}
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-[color:var(--color-text-muted)]">Score Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '4px' }}
                formatter={(value) => [`${value} Marks`, 'Total Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section-wise Breakdown Chart */}
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-[color:var(--color-text-muted)]">Section-wise Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: 'var(--color-primary-soft)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
              <ReferenceLine y={0} stroke="var(--color-border)" />
              <Bar dataKey="csScore" name="CS Marks" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="gaScore" name="GA Marks" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const MockHistoryPanel = ({ onStartMockTest }) => {
  const mockAttemptHistory = React.useMemo(() => readMockTestHistory(), []);
  const [openAttemptId, setOpenAttemptId] = React.useState(null);

  const toggleAttempt = React.useCallback((attemptId) => {
    setOpenAttemptId((current) => (current === attemptId ? null : attemptId));
  }, []);

  if (!mockAttemptHistory.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-[color:var(--color-surface)] p-12 text-center shadow-[var(--shadow-soft)] dark:border-slate-700">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4 dark:bg-slate-900 dark:text-slate-300">
          <FaRegClock className="text-xl" />
        </div>
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">No submitted mock tests yet</h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)] max-w-sm mx-auto">
          Finish a mock exam once and the full question-wise record will appear here automatically for your review.
        </p>
        <button
          type="button"
          onClick={onStartMockTest}
          className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
        >
          Open Mock Test Pool
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Recent Mock Attempts</h2>
          <p className="text-sm text-[color:var(--color-text-muted)]">Review your performance across full-length and paper-wise mocks.</p>
        </div>
        <button
          onClick={onStartMockTest}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
        >
          New Mock
        </button>
      </div>

      <MockAnalyticsCharts history={mockAttemptHistory} />

      <div className="space-y-3">
        {mockAttemptHistory.map((attempt) => {
          const attemptTitle = attempt.selectedPaperLabel
            ? `${attempt.kindTitle} - ${attempt.selectedPaperLabel}`
            : attempt.kindTitle;
          const isOpen = openAttemptId === attempt.id;

          return (
            <details
              key={attempt.id}
              open={isOpen}
              className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 shadow-[var(--shadow-soft)] overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-600 [&[open]]:shadow-lg"
            >
              <summary
                className="cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                onClick={(event) => {
                  event.preventDefault();
                  toggleAttempt(attempt.id);
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                        {attempt.kindTitle}
                      </span>
                      {attempt.selectedPaperLabel ? (
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          {attempt.selectedPaperLabel}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-1.5 text-base font-bold text-[color:var(--color-text)]">{attemptTitle}</h3>
                    <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)] font-medium">{formatAttemptDate(attempt.submittedAt)}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-right border border-slate-100 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Score</p>
                      <p className="mt-0.5 text-base font-bold text-slate-900 leading-none dark:text-slate-100">
                        {attempt.score} <span className="text-xs text-slate-400 font-normal">/ {attempt.maxScore}</span>
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-right border border-slate-100 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Time</p>
                      <p className="mt-0.5 text-base font-bold text-slate-900 leading-none dark:text-slate-100">
                        {attempt.durationMinutes} <span className="text-xs text-slate-400 font-normal">min</span>
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform duration-300">
                      <FaChevronDown className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </span>
                  </div>
                </div>
              </summary>

              {isOpen && (
                <div className="mt-2.5 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/50">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-400">Attempted</span>
                      <span className="text-sm font-bold tabular-nums text-slate-950 dark:text-slate-100">{attempt.attempted}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-emerald-100/90 px-2 py-1 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <FaCheckCircle className="text-[8px] text-emerald-800 dark:text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">Correct</span>
                      <span className="text-sm font-bold tabular-nums text-emerald-950 dark:text-emerald-100">{attempt.correct}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400 bg-rose-100/90 px-2 py-1 dark:border-rose-900/40 dark:bg-rose-950/20">
                      <FaTimesCircle className="text-[8px] text-rose-800 dark:text-rose-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-rose-800 dark:text-rose-400">Incorrect</span>
                      <span className="text-sm font-bold tabular-nums text-rose-950 dark:text-rose-100">{attempt.incorrect}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-amber-100/90 px-2 py-1 dark:border-amber-900/40 dark:bg-amber-950/20">
                      <FaQuestionCircle className="text-[8px] text-amber-800 dark:text-amber-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-400">Unanswered</span>
                      <span className="text-sm font-bold tabular-nums text-amber-950 dark:text-amber-100">{attempt.unanswered}</span>
                    </div>
                  </div>
 
                  <TimeDistributionPanel attempt={attempt} />
 
                  <div className="grid gap-2 lg:grid-cols-3">
                    <QuestionRecordGroup
                      title="Correct"
                      tone="correct"
                      questions={attempt.correctQuestions}
                      emptyLabel="None correct."
                    />
                    <QuestionRecordGroup
                      title="Incorrect"
                      tone="incorrect"
                      questions={attempt.incorrectQuestions}
                      emptyLabel="None incorrect."
                    />
                    <QuestionRecordGroup
                      title="Unanswered"
                      tone="unanswered"
                      questions={attempt.unansweredQuestions}
                      emptyLabel="None skipped."
                    />
                  </div>
                </div>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
};

export default MockHistoryPanel;
