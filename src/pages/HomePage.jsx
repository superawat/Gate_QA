import React from "react";
import { FaArrowRight, FaBolt, FaCompass, FaHistory, FaRegClock } from "react-icons/fa";

import { useFilterState } from "../contexts/FilterContext";
import PageShell from "../components/Layout/PageShell";
import QuestionBankSummaryLoader from "../components/Loaders/QuestionBankSummaryLoader";

const formatNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "0";
  }
  return new Intl.NumberFormat("en-IN").format(numeric);
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
  onOpenMockHistory,
  onStartMockTest,
  onResumePractice,
}) => {
  const {
    solvedCount,
    bookmarkedCount,
    progressPercentage,
    totalQuestions,
    solvedQuestionIds,
  } = useFilterState();

  const questionCount = formatNumber(questionBankManifest?.questionCount || totalQuestions || 0);
  const latestYear = questionBankManifest?.latestYear || "Latest";
  const yearSetCount = Array.isArray(questionBankManifest?.yearSets) ? questionBankManifest.yearSets.length : 0;
  
  const subjectsData = Array.isArray(questionBankManifest?.subjects) ? questionBankManifest.subjects : [];
  const maxSubjectCount = subjectsData.length > 0 ? Math.max(...subjectsData.map(s => s.count)) : 1;

  return (
    <PageShell onResume={hasResumeRoute ? onResumePractice : null} resumeLabel="Continue">
      <section className="grid gap-6 lg:grid-cols-2 items-stretch">
        <div className="flex flex-col rounded-[var(--radius-hero)] border border-[color:var(--color-border)] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_42%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[var(--shadow-card)] sm:p-8 h-full">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onStartRandomPractice}
              className="inline-flex min-h-[52px] items-center justify-between rounded-2xl bg-slate-900 px-5 py-3 text-left text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <FaBolt />
                </span>
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Start</span>
                  <span className="block text-lg font-semibold">Random Practice</span>
                </span>
              </span>
              <FaArrowRight />
            </button>

            <button
              type="button"
              onClick={onExplorePractice}
              className="inline-flex min-h-[52px] items-center justify-between rounded-2xl border border-slate-300 bg-white px-5 py-3 text-left text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
                <span className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <FaCompass />
                </span>
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Filter</span>
                  <span className="block text-lg font-semibold">Filter Questions</span>
                </span>
              </span>
              <FaArrowRight />
            </button>
          </div>

          {mockModeEnabled ? (
            <div className="mt-4 max-w-xl rounded-2xl border border-emerald-200 bg-white/80 px-4 py-4 shadow-[var(--shadow-soft)] backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Beta Access
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  Mock test is ready to try
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onStartMockTest}
                  className="inline-flex min-h-[48px] items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <FaRegClock />
                  Open Mock Test
                </button>
                <button
                  type="button"
                  onClick={onOpenMockHistory}
                  className="inline-flex min-h-[48px] items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <FaHistory />
                  Attempted Mock Tests
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 max-w-xl rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                  Upcoming
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  Mock test coming soon
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Full mock test mode is on the way. For now, use random practice or filter questions directly.
              </p>
            </div>
          )}

          {hasResumeRoute ? (
            <div className="mt-6 rounded-[var(--radius-card)] border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Continue from your last session</p>
                  <p className="mt-1 text-sky-800">
                    {lastSession?.questionUid
                      ? `Pick up again at ${lastSession.questionUid}.`
                      : "Return to your last Explore or Solve page."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onResumePractice}
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-sky-700 px-4 py-2 font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <FaRegClock className="mr-2" />
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {/* Removed mt-auto so the Question Bank isn't artificially pushed to the bottom since we've compressed the overall grid height. */}
          <div className="mt-8 border-t border-slate-200/60 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Question Bank</p>
            {manifestLoading ? (
              <div className="mt-4 flex items-center justify-center py-4">
                <QuestionBankSummaryLoader />
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-semibold text-slate-950">{questionCount}</p>
                  <p className="mt-1 text-sm text-slate-500">questions ready to explore</p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{latestYear}</p>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Latest</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{formatNumber(yearSetCount)}</p>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Sets</p>
                  </div>
                </div>
              </div>
            )}
            {manifestError ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {manifestError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] flex-grow flex flex-col">
            <div className="mb-4 flex items-center justify-between shrink-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Subject Distribution</p>
              <span className="text-xs font-medium text-slate-400">{subjectsData.length} Subjects</span>
            </div>
            
            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {subjectsData.length > 0 ? subjectsData.map(stat => (
                <div key={stat.slug}>
                  <div className="mb-1 flex items-center justify-between text-[11px] leading-tight sm:text-xs">
                    <span 
                      className="font-semibold text-slate-700 truncate pr-3" 
                      title={stat.label}
                    >
                      {stat.label}
                    </span>
                    <span className="shrink-0 font-medium text-slate-500">
                      {stat.count} <span className="text-[10px] uppercase text-slate-400">Qs</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-50 relative">
                    <div 
                      className="h-full rounded-full bg-sky-200 transition-all duration-500" 
                      style={{ width: `${Math.max(1, (stat.count / maxSubjectCount) * 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center text-sm text-slate-500">Loading catalog...</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default HomePage;
