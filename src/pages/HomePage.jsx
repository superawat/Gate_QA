import React, { useMemo } from "react";
import { FaBolt, FaChartLine, FaCompass, FaRegClock } from "react-icons/fa";

import PageShell from "../components/Layout/PageShell";
import StreakBanner from "../components/Home/StreakBanner";
import ActivityHeatmap from "../components/Home/ActivityHeatmap";
import { loadStudyActivityFast } from "../utils/weakTopicAnalyzer";

const HomePage = ({
  hasResumeRoute,
  mockModeEnabled,
  onStartRandomPractice,
  onExplorePractice,
  onOpenInsights = () => {},
  onStartMockTest,
  onResumePractice,
}) => {
  const activity = useMemo(() => loadStudyActivityFast(), []);

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
            <span className="block text-xs text-slate-200">Jump right in</span>
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

      {/* ── Activity Heatmap ───────────────────────────────────── */}
      {activity?.attemptTimeline?.length > 0 && (
        <section>
          <ActivityHeatmap
            attemptTimeline={activity.attemptTimeline}
            streakDateKeys={activity.streakDateKeys || []}
          />
        </section>
      )}





    </PageShell>
  );
};

export default HomePage;
