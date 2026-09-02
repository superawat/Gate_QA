import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiTarget, FiPlay, FiBell, FiAlertCircle, FiBookOpen } from "react-icons/fi";
import { PRACTICE_ROUTE } from "../../utils/routes";

export default function TrackerFocusBanner({
  topicMetricsList,
  allTopics,
}) {
  const navigate = useNavigate();

  // Pick top 2 high-priority topics with score > 10 (filters out non-urgent items)
  const topFocusItems = useMemo(() => {
    const scored = topicMetricsList
      .filter((m) => m.priorityScore > 10)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 2);

    return scored
      .map((metrics) => {
        const topic = allTopics.find((t) => t.id === metrics.topicId);
        return topic ? { topic, metrics } : null;
      })
      .filter(Boolean);
  }, [topicMetricsList, allTopics]);

  if (topFocusItems.length === 0) return null;

  return (
    <section
      aria-label="Today's Recommended Focus"
      className="mb-8 p-5 rounded-2xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-[var(--shadow-card)] transition-all"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--color-border)] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FiTarget className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[color:var(--color-text)]">
              Today's Focus
            </h2>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Evidence-based priority recommendations based on your solve history
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topFocusItems.map(({ topic, metrics }, idx) => {
          const isRevision = metrics.isRevisionDue;
          const isWeak = metrics.needsAttention;
          const isUnpracticed = metrics.needsPractice;

          let reasonBadge = (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FiBookOpen className="w-3 h-3" />
              <span>High Yield · Start Practice</span>
            </span>
          );

          if (isRevision) {
            reasonBadge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FiBell className="w-3 h-3" />
                <span>Revision Due · {metrics.daysSinceLastPractice ? `${metrics.daysSinceLastPractice}d inactive` : "Overdue"}</span>
              </span>
            );
          } else if (isWeak) {
            reasonBadge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <FiAlertCircle className="w-3 h-3" />
                <span>Low Accuracy ({Math.round(metrics.accuracyRate * 100)}%) · Drill Errors</span>
              </span>
            );
          } else if (isUnpracticed) {
            reasonBadge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FiBookOpen className="w-3 h-3" />
                <span>Theory Done · 0/{metrics.totalAvailablePyqs} PYQs Attempted</span>
              </span>
            );
          }

          return (
            <div
              key={topic.id}
              className="p-4 rounded-xl bg-[color:var(--color-bg)] border border-[color:var(--color-border)] flex flex-col justify-between gap-3 hover:border-blue-500/30 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {reasonBadge}
                  <span className="text-[11px] font-mono text-[color:var(--color-text-muted)] uppercase">
                    {topic.marksRange}
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[color:var(--color-text)]">
                  {idx + 1}. {topic.label}
                </h3>
                <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
                  Subject: <span className="capitalize font-semibold text-[color:var(--color-text)]">{topic.subjectSlug}</span> · {metrics.attemptedPyqs}/{metrics.totalAvailablePyqs} PYQs done
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[color:var(--color-border)]">
                <button
                  type="button"
                  onClick={() => {
                    if (isWeak) {
                      navigate(`${PRACTICE_ROUTE}?subjects=${topic.subjectSlug}&subtopics=${topic.primaryTopicTag}&showOnlyErrors=true`);
                    } else {
                      navigate(`${PRACTICE_ROUTE}?subjects=${topic.subjectSlug}&subtopics=${topic.primaryTopicTag}&hideSolved=true`);
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
                >
                  <FiPlay className="w-3.5 h-3.5" />
                  <span>{isWeak ? "Drill Incorrect PYQs" : isRevision ? "Practice 10 Review PYQs" : "Start PYQ Practice"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
