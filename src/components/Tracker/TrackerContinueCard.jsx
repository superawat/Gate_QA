import React from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiZap } from "react-icons/fi";
import { PRACTICE_ROUTE } from "../../utils/routes";

export default function TrackerContinueCard({
  continueItem,
  isStarter = false,
}) {
  const navigate = useNavigate();

  if (!continueItem) return null;

  const { topic, metrics } = continueItem;
  const attempted = metrics.attemptedPyqs;
  const total = metrics.totalAvailablePyqs;
  const coveragePct = Math.round(metrics.practiceCoverage * 100);
  const accuracyPct = Math.round(metrics.accuracyRate * 100);

  const handleAction = () => {
    const track = topic?.track;
    if (track === "da") {
      navigate(`${PRACTICE_ROUTE}?subjects=da:${topic.subjectSlug}&subtopics=${topic.primaryTopicTag}&hideSolved=true`);
    } else if (track && track !== "cse") {
      navigate(`${PRACTICE_ROUTE}?track=${track}&subjects=${topic.subjectSlug}&subtopics=${topic.primaryTopicTag}&hideSolved=true`);
    } else {
      navigate(
        `${PRACTICE_ROUTE}?subjects=${topic.subjectSlug}&subtopics=${topic.primaryTopicTag}&hideSolved=true`
      );
    }
  };

  return (
    <section
      aria-label={isStarter ? "Recommended Starting Topic" : "Continue Practice"}
      className="mb-3 sm:mb-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 mt-0.5">
          {isStarter ? <FiZap className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-0.5">
            <span>{isStarter ? "What Should I Do Now? · Recommended First Step" : "Continue Where You Left Off"}</span>
            <span>·</span>
            <span className="capitalize">{topic.subjectSlug}</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[color:var(--color-text)]">
            {topic.label}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-muted)] mt-1">
            {isStarter ? (
              <>
                <span>
                  High-yield core topic · <strong className="text-[color:var(--color-text)] tabular-nums">{total} canonical PYQs</strong> available
                </span>
                <span>·</span>
                <span className="font-semibold text-blue-400 tabular-nums">
                  {topic.marksRange ? topic.marksRange.replace(/-/g, "–") : ""}
                </span>
              </>
            ) : (
              <>
                <span>
                  <strong className="text-[color:var(--color-text)] tabular-nums">{attempted}/{total}</strong> PYQs Attempted (<span className="tabular-nums">{coveragePct}%</span>)
                </span>
                <span>·</span>
                <span>
                  <strong className="text-[color:var(--color-text)] tabular-nums">{accuracyPct}%</strong> Accuracy
                </span>
                {metrics.daysSinceLastPractice !== null && (
                  <>
                    <span>·</span>
                    <span>
                      {metrics.daysSinceLastPractice === 0
                        ? "Practiced today"
                        : <><span className="tabular-nums">{metrics.daysSinceLastPractice}d</span> ago</>}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
        <button
          type="button"
          onClick={handleAction}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 h-10 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors whitespace-nowrap"
        >
          <FiPlay className="w-4 h-4" />
          <span>{isStarter ? "Start Practice" : "Continue Practice"}</span>
        </button>
      </div>
    </section>
  );
}
