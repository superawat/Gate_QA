import React from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaHistory,
  FaQuestionCircle,
  FaRegClock,
  FaTimesCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import PageShell from "../components/Layout/PageShell";
import { readMockTestHistory } from "../utils/mockTestHistory";
import { buildSolvePath } from "../utils/routes";

const formatNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "0";
  }
  return new Intl.NumberFormat("en-IN").format(numeric);
};

const formatAttemptDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const formatScoreDelta = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "0";
  }
  if (numeric > 0) {
    return `+${numeric}`;
  }
  return String(numeric);
};

const ATTEMPT_GROUP_STYLES = {
  correct: {
    panel: "border-emerald-200 bg-emerald-50/80",
    label: "text-emerald-700",
    value: "text-emerald-900",
    pill: "border-emerald-200 bg-white text-emerald-900",
    meta: "text-emerald-700/80",
  },
  incorrect: {
    panel: "border-rose-200 bg-rose-50/80",
    label: "text-rose-700",
    value: "text-rose-900",
    pill: "border-rose-200 bg-white text-rose-900",
    meta: "text-rose-700/80",
  },
  unanswered: {
    panel: "border-amber-200 bg-amber-50/80",
    label: "text-amber-700",
    value: "text-amber-900",
    pill: "border-amber-200 bg-white text-amber-900",
    meta: "text-amber-700/80",
  },
};

const QuestionRecordGroup = ({
  title,
  tone,
  questions = [],
  emptyLabel,
}) => {
  const styles = ATTEMPT_GROUP_STYLES[tone] || ATTEMPT_GROUP_STYLES.unanswered;

  return (
    <section className={`rounded-2xl border px-3 py-3 shadow-[var(--shadow-soft)] ${styles.panel}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${styles.label}`}>{title}</p>
        <p className={`text-lg font-semibold ${styles.value}`}>{formatNumber(questions.length)}</p>
      </div>

      {questions.length ? (
        <div className="mt-3 max-h-52 overflow-y-auto pr-1">
          <div className="grid gap-2 sm:grid-cols-2">
            {questions.map((question) => (
              question.questionUid ? (
                <Link
                  key={`${title}-${question.questionUid}`}
                  to={buildSolvePath(question.questionUid)}
                  className={`rounded-xl border px-3 py-2 shadow-sm ${styles.pill}`}
                >
                  <p className="text-sm font-semibold">{question.label}</p>
                  <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] ${styles.meta}`}>
                    <span className="font-mono">ID {question.questionUid}</span>
                    <span className="font-semibold uppercase tracking-[0.12em]">
                      {question.type || "Question"}
                    </span>
                    <span className="font-semibold">Score {formatScoreDelta(question.scoreDelta)}</span>
                  </div>
                </Link>
              ) : (
                <article
                  key={`${title}-${question.label}-${question.type || "question"}`}
                  className={`rounded-xl border px-3 py-2 shadow-sm ${styles.pill}`}
                >
                  <p className="text-sm font-semibold">{question.label}</p>
                  <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] ${styles.meta}`}>
                    <span className="font-mono">ID unavailable</span>
                    <span className="font-semibold uppercase tracking-[0.12em]">
                      {question.type || "Question"}
                    </span>
                    <span className="font-semibold">Score {formatScoreDelta(question.scoreDelta)}</span>
                  </div>
                </article>
              )
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600">{emptyLabel}</p>
      )}
    </section>
  );
};

const MockHistoryPage = ({
  hasResumeRoute,
  onResumePractice,
  onStartMockTest,
}) => {
  const mockAttemptHistory = React.useMemo(() => readMockTestHistory(), []);
  const [openAttemptId, setOpenAttemptId] = React.useState(null);
  const toggleAttempt = React.useCallback((attemptId) => {
    setOpenAttemptId((currentAttemptId) => (currentAttemptId === attemptId ? null : attemptId));
  }, []);

  return (
    <PageShell onResume={hasResumeRoute ? onResumePractice : null} resumeLabel="Continue">
      <section className="space-y-6">
        <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_40%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[var(--shadow-card)] sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <FaHistory />
                Mock History
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-950">Attempted mock tests</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Every submitted mock saved in this browser appears here with score, timing, and question-wise outcome.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onStartMockTest}
                className="inline-flex min-h-[48px] items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Open Mock Test
              </button>
            </div>
          </div>
        </div>

        {mockAttemptHistory.length ? (
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
                  className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5"
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
                          <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                            {attempt.kindTitle}
                          </span>
                          {attempt.selectedPaperLabel ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                              {attempt.selectedPaperLabel}
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-2 text-xl font-semibold text-slate-950">{attemptTitle}</h2>
                        <p className="mt-1 text-sm text-slate-500">{formatAttemptDate(attempt.submittedAt)}</p>
                      </div>

                      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Score</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">
                            {attempt.score} / {attempt.maxScore}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Attempt</p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">
                            {attempt.questionCount} Questions
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-500">{attempt.durationMinutes} min</p>
                        </div>
                        <span className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                          Results
                          <FaChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </span>
                      </div>
                    </div>
                  </summary>

                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Attempted</p>
                        <p className="mt-1 text-base font-semibold text-slate-950">{attempt.attempted}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          <FaCheckCircle />
                          Correct
                        </p>
                        <p className="mt-1 text-base font-semibold text-emerald-900">{attempt.correct}</p>
                      </div>
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3">
                        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                          <FaTimesCircle />
                          Incorrect
                        </p>
                        <p className="mt-1 text-base font-semibold text-rose-900">{attempt.incorrect}</p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                          <FaQuestionCircle />
                          Unanswered
                        </p>
                        <p className="mt-1 text-base font-semibold text-amber-900">{attempt.unanswered}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-3">
                      <QuestionRecordGroup
                        title="Correct Questions"
                        tone="correct"
                        questions={attempt.correctQuestions}
                        emptyLabel="No correct questions in this attempt."
                      />
                      <QuestionRecordGroup
                        title="Incorrect Questions"
                        tone="incorrect"
                        questions={attempt.incorrectQuestions}
                        emptyLabel="No incorrect questions in this attempt."
                      />
                      <QuestionRecordGroup
                        title="Unanswered Questions"
                        tone="unanswered"
                        questions={attempt.unansweredQuestions}
                        emptyLabel="No unanswered questions in this attempt."
                      />
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FaRegClock className="text-xl" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">No submitted mock tests yet.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Finish a mock once and the full question-wise record will appear here automatically.
            </p>
            <button
              type="button"
              onClick={onStartMockTest}
              className="mt-5 inline-flex min-h-[48px] items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Open Mock Test
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default MockHistoryPage;
