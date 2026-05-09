import React, { useMemo } from "react";
import { FaArrowRight, FaBolt, FaChartLine, FaCompass, FaHistory, FaRegClock } from "react-icons/fa";

import { useFilterState } from "../contexts/FilterContext";
import PageShell from "../components/Layout/PageShell";
import QuestionBankSummaryLoader from "../components/Loaders/QuestionBankSummaryLoader";
import { readMockTestHistory } from "../utils/mockTestHistory";
import StreakBanner from "../components/Home/StreakBanner";

const formatNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "0";
  }
  return new Intl.NumberFormat("en-IN").format(numeric);
};

const formatPercent = (value, { digits = 0 } = {}) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "0%";
  }
  return `${numeric.toFixed(digits)}%`;
};

const HomePage = ({
  questionBankManifest,
  manifestLoading,
  manifestError,
  hasResumeRoute,
  lastSession,
  mockModeEnabled,
  onStartRandomPractice,
  onExplorePractice,
  onOpenInsights = () => {},
  onOpenMockHistory,
  onStartMockTest,
  onResumePractice,
}) => {
  const {
    solvedCount,
    bookmarkedCount,
    progressPercentage,
    totalQuestions,
  } = useFilterState();

  const questionCountValue = Number(questionBankManifest?.questionCount || totalQuestions || 0);
  const questionCount = formatNumber(questionCountValue);
  const latestYear = questionBankManifest?.latestYear || "Latest";
  const yearSetCount = Array.isArray(questionBankManifest?.yearSets) ? questionBankManifest.yearSets.length : 0;
  const mockHistory = useMemo(() => readMockTestHistory(), []);
  const attemptedMockCount = mockHistory.length;

  return (
    <PageShell onResume={hasResumeRoute ? onResumePractice : null} resumeLabel="Continue">
      <h1 className="sr-only">GateQA practice dashboard</h1>

      {/* ── Quick actions row ─────────────────────────────────────── */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={onStartRandomPractice}
          className="group flex items-center gap-4 rounded-2xl bg-slate-900 px-5 py-5 text-left text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 transition group-hover:bg-white/20">
            <FaBolt size={18} />
          </span>
          <span>
            <span className="block text-sm font-bold">Random Practice</span>
            <span className="block text-xs text-slate-400">Jump right in</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onExplorePractice}
          className="group flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50/60 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition group-hover:bg-sky-200">
            <FaCompass size={18} />
          </span>
          <span>
            <span className="block text-sm font-bold text-[color:var(--color-text)]">Filter Questions</span>
            <span className="block text-xs text-[color:var(--color-text-muted)]">By subject & year</span>
          </span>
        </button>

        {mockModeEnabled ? (
          <button
            type="button"
            onClick={onStartMockTest}
            className="group flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 text-left shadow-sm transition hover:border-emerald-300 hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-200">
              <FaRegClock size={18} />
            </span>
            <span>
              <span className="block text-sm font-bold text-[color:var(--color-text)]">Open Mock Test</span>
              <span className="block text-xs text-[color:var(--color-text-muted)]">Full-length practice</span>
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 opacity-60">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <FaRegClock size={18} />
            </span>
            <span>
              <span className="block text-sm font-bold text-[color:var(--color-text)]">Mock Test</span>
              <span className="block text-xs text-[color:var(--color-text-muted)]">Coming soon</span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenInsights}
          className="group flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 text-left shadow-sm transition hover:border-violet-300 hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-200">
            <FaChartLine size={18} />
          </span>
          <span>
            <span className="block text-sm font-bold text-[color:var(--color-text)]">View Performance Insights</span>
            <span className="block text-xs text-[color:var(--color-text-muted)]">Track your progress</span>
          </span>
        </button>
      </section>

      {/* ── Streak banner ──────────────────────────────────────── */}
      <StreakBanner />

      {/* ── Resume banner ─────────────────────────────────────────── */}
      {hasResumeRoute && lastSession && (
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-4 shadow-sm">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[color:var(--color-text)]">Continue your last session</p>
              <p className="mt-0.5 truncate text-sm text-[color:var(--color-text-muted)]">
                {lastSession.questionUid
                  ? `Resume at ${lastSession.questionUid}`
                  : "Return to your last page"}
              </p>
            </div>
            <button
              type="button"
              onClick={onResumePractice}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <FaRegClock size={14} />
              Continue
            </button>
          </div>
        </section>
      )}

      {/* ── Stats + Question Bank ─────────────────────────────────── */}
      <section className="mb-8 grid gap-6 lg:grid-cols-12">
        {/* Stats strip */}
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-5">
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-text-muted)]">Solved</p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--color-text)]">{formatNumber(solvedCount)}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-text-muted)]">Saved</p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--color-text)]">{formatNumber(bookmarkedCount)}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-text-muted)]">Complete</p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--color-text)]">{formatPercent(progressPercentage)}</p>
          </div>
        </div>

        {/* Question Bank card */}
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-text-muted)]">Question Bank</p>
          {manifestLoading ? (
            <div className="mt-4 flex items-center justify-center py-4">
              <QuestionBankSummaryLoader />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-4xl font-bold text-[color:var(--color-text)]">{questionCount}</p>
                <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">questions across {formatNumber(yearSetCount)} sets</p>
              </div>
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-2xl font-bold text-[color:var(--color-text)]">{latestYear}</span>
                <span className="text-xs font-semibold uppercase text-[color:var(--color-text-muted)]">latest</span>
              </div>
            </div>
          )}
          {manifestError && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {manifestError}
            </p>
          )}
        </div>
      </section>


      {/* ── Mock history shortcut (only when they've attempted mocks) */}
      {mockModeEnabled && attemptedMockCount > 0 && (
        <section className="mb-8">
          <button
            type="button"
            onClick={onOpenMockHistory}
            className="group flex w-full items-center justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-4 text-left shadow-sm transition hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]">
                <FaHistory size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[color:var(--color-text)]">
                  {attemptedMockCount} {attemptedMockCount === 1 ? "Mock" : "Mocks"} Attempted
                </span>
                <span className="block text-xs text-[color:var(--color-text-muted)]">View your mock test history</span>
              </span>
            </div>
            <FaArrowRight className="text-slate-400 transition-transform group-hover:translate-x-1" />
          </button>
        </section>
      )}
    </PageShell>
  );
};

export default HomePage;
