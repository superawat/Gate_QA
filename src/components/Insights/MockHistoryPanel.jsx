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
    panel: "border-emerald-200 bg-emerald-50/80",
    label: "text-emerald-700",
    value: "text-emerald-900",
    pill: "border-emerald-200 bg-white text-emerald-900 shadow-sm transition-shadow hover:shadow-md",
    meta: "text-emerald-700/80",
  },
  incorrect: {
    panel: "border-rose-200 bg-rose-50/80",
    label: "text-rose-700",
    value: "text-rose-900",
    pill: "border-rose-200 bg-white text-rose-900 shadow-sm transition-shadow hover:shadow-md",
    meta: "text-rose-700/80",
  },
  unanswered: {
    panel: "border-amber-200 bg-amber-50/80",
    label: "text-amber-700",
    value: "text-amber-900",
    pill: "border-amber-200 bg-white text-amber-900 shadow-sm transition-shadow hover:shadow-md",
    meta: "text-amber-700/80",
  },
  bonus: {
    panel: "border-sky-200 bg-sky-50/80",
    label: "text-sky-700",
    value: "text-sky-900",
    pill: "border-sky-200 bg-white text-sky-900 shadow-sm transition-shadow hover:shadow-md",
    meta: "text-sky-700/80",
  },
};

const QuestionRecordGroup = ({ title, tone, questions = [], emptyLabel }) => {
  const styles = ATTEMPT_GROUP_STYLES[tone] || ATTEMPT_GROUP_STYLES.unanswered;

  return (
    <section className={`rounded-2xl border px-3 py-3 ${styles.panel}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${styles.label}`}>{title}</p>
        <p className={`text-lg font-bold ${styles.value}`}>{formatNumber(questions.length)}</p>
      </div>

      {questions.length ? (
        <div className="mt-3 max-h-52 overflow-y-auto pr-1">
          <div className="grid gap-2">
            {questions.map((question) => (
              question.questionUid ? (
                <Link
                  key={`${title}-${question.questionUid}`}
                  to={buildSolvePath(question.questionUid)}
                  className={`rounded-xl border px-3 py-2 ${styles.pill}`}
                >
                  <p className="text-sm font-semibold truncate">{question.label}</p>
                  <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] ${styles.meta}`}>
                    <span className="font-mono">ID {question.questionUid}</span>
                    <span className="font-semibold uppercase tracking-[0.08em]">{question.type || "Question"}</span>
                    <span className="font-semibold">Score {formatScoreDelta(question.scoreDelta)}</span>
                  </div>
                </Link>
              ) : (
                <article
                  key={`${title}-${question.label}-${question.type || "question"}`}
                  className={`rounded-xl border px-3 py-2 ${styles.pill}`}
                >
                  <p className="text-sm font-semibold truncate">{question.label}</p>
                  <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] ${styles.meta}`}>
                    <span className="font-mono">ID unavailable</span>
                    <span className="font-semibold uppercase tracking-[0.08em]">{question.type || "Question"}</span>
                    <span className="font-semibold">Score {formatScoreDelta(question.scoreDelta)}</span>
                  </div>
                </article>
              )
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm italic text-slate-500">{emptyLabel}</p>
      )}
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
      ...(attempt.bonusQuestions || []),
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
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Score Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
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
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Section-wise Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
              <ReferenceLine y={0} stroke="#cbd5e1" />
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
      <div className="rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
          <FaRegClock className="text-xl" />
        </div>
        <h2 className="text-xl font-semibold text-slate-950">No submitted mock tests yet</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 max-w-sm mx-auto">
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
          <h2 className="text-xl font-semibold text-slate-950">Recent Mock Attempts</h2>
          <p className="text-sm text-slate-600">Review your performance across full-length and paper-wise mocks.</p>
        </div>
        <button
          onClick={onStartMockTest}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
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
              className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-soft)] overflow-hidden transition-all hover:border-slate-300 [&[open]]:shadow-lg"
            >
              <summary
                className="cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                onClick={(event) => {
                  event.preventDefault();
                  toggleAttempt(attempt.id);
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                        {attempt.kindTitle}
                      </span>
                      {attempt.selectedPaperLabel ? (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                          {attempt.selectedPaperLabel}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{attemptTitle}</h3>
                    <p className="mt-0.5 text-xs text-slate-500 font-medium">{formatAttemptDate(attempt.submittedAt)}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-right border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Score</p>
                      <p className="mt-0.5 text-lg font-bold text-slate-900 leading-none">
                        {attempt.score} <span className="text-xs text-slate-400 font-normal">/ {attempt.maxScore}</span>
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-right border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Time</p>
                      <p className="mt-0.5 text-lg font-bold text-slate-900 leading-none">
                        {attempt.durationMinutes} <span className="text-xs text-slate-400 font-normal">min</span>
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform duration-300">
                      <FaChevronDown className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </span>
                  </div>
                </div>
              </summary>

              {isOpen && (
                <div className="mt-5 space-y-6 border-t border-slate-100 pt-5">
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Attempted</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">{attempt.attempted}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                        <FaCheckCircle className="text-[8px]" /> Correct
                      </p>
                      <p className="mt-1 text-xl font-bold text-emerald-900">{attempt.correct}</p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3">
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700">
                        <FaTimesCircle className="text-[8px]" /> Incorrect
                      </p>
                      <p className="mt-1 text-xl font-bold text-rose-900">{attempt.incorrect}</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                        <FaQuestionCircle className="text-[8px]" /> Unanswered
                      </p>
                      <p className="mt-1 text-xl font-bold text-amber-900">{attempt.unanswered}</p>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-3">
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                        <FaStar className="text-[8px]" /> Bonus
                      </p>
                      <p className="mt-1 text-xl font-bold text-sky-900">{attempt.bonus || 0}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-4">
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
                    <QuestionRecordGroup
                      title="Bonus"
                      tone="bonus"
                      questions={attempt.bonusQuestions}
                      emptyLabel="None auto-awarded."
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
