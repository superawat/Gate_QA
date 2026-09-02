import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckSquare,
  FiSquare,
  FiPlay,
  FiAward,
  FiCheckCircle,
  FiBookOpen,
  FiAlertCircle,
  FiBell,
  FiActivity,
  FiCircle,
  FiMoreVertical,
} from "react-icons/fi";
import { PRACTICE_ROUTE } from "../../utils/routes";

export default function TrackerTopicCard({
  topic,
  metrics,
  onToggleTheory,
  onOpenReset,
}) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const attempted = metrics.attemptedPyqs;
  const total = metrics.totalAvailablePyqs;
  const coveragePct = Math.round(metrics.practiceCoverage * 100);
  const accuracyPct = Math.round(metrics.accuracyRate * 100);

  const handlePracticeUnsolved = () => {
    navigate(
      `${PRACTICE_ROUTE}?subjects=${topic.subjectSlug}&subtopics=${topic.primaryTopicTag}&hideSolved=true`
    );
  };

  const handleDrillErrors = () => {
    navigate(
      `${PRACTICE_ROUTE}?subjects=${topic.subjectSlug}&subtopics=${topic.primaryTopicTag}&showOnlyErrors=true`
    );
  };

  // Render status badge with refined vocabulary
  const renderStatusBadge = () => {
    switch (metrics.status) {
      case "WELL_PRACTICED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FiAward className="w-3 h-3" />
            <span>Well Practiced</span>
          </span>
        );
      case "PRACTICED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FiCheckCircle className="w-3 h-3" />
            <span>Practiced</span>
          </span>
        );
      case "REVISION_DUE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <FiBell className="w-3 h-3" />
            <span>Revision Due</span>
          </span>
        );
      case "NEEDS_ATTENTION":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <FiAlertCircle className="w-3 h-3" />
            <span>Weak ({accuracyPct}%)</span>
          </span>
        );
      case "THEORY_ONLY":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FiBookOpen className="w-3 h-3" />
            <span>Needs Practice</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FiActivity className="w-3 h-3" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] border border-[color:var(--color-border)]">
            <FiCircle className="w-2.5 h-2.5" />
            <span>Not Started</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[color:var(--color-bg)] border border-[color:var(--color-border)] hover:border-[color:var(--color-border-hover)] transition-all flex flex-col justify-between gap-3 relative group">
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleTheory(topic.id)}
              className="text-base text-[color:var(--color-text-muted)] hover:text-blue-500 transition-colors shrink-0"
              title={metrics.theoryCompleted ? "Mark Theory Incomplete" : "Mark Theory Complete"}
            >
              {metrics.theoryCompleted ? (
                <FiCheckSquare className="w-4 h-4 text-emerald-500" />
              ) : (
                <FiSquare className="w-4 h-4" />
              )}
            </button>
            <h4 className="font-bold text-xs sm:text-sm text-[color:var(--color-text)] line-clamp-1">
              {topic.label}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {renderStatusBadge()}

            {/* Options Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="p-1 rounded text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] transition-colors"
                title="Topic Options"
              >
                <FiMoreVertical className="w-3.5 h-3.5" />
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-1 z-30 w-36 rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-xl py-1 text-xs"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenReset(topic);
                    }}
                    className="w-full text-left px-3 py-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    Reset Progress
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1 mt-2">
          <div className="flex items-center justify-between text-[11px] text-[color:var(--color-text-muted)]">
            <span>
              {attempted > 0 ? (
                <>
                  <strong className="text-[color:var(--color-text)]">{attempted}/{total}</strong> PYQs Attempted
                </>
              ) : (
                `0 / ${total} PYQs`
              )}
            </span>
            <span>
              {attempted > 0 ? `${accuracyPct}% accuracy (${metrics.solvedPyqs} solved)` : "Not practiced yet"}
            </span>
          </div>
          <div className="w-full bg-[color:var(--color-border)] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                metrics.status === "WELL_PRACTICED"
                  ? "bg-emerald-500"
                  : metrics.status === "REVISION_DUE"
                  ? "bg-amber-500"
                  : metrics.status === "NEEDS_ATTENTION"
                  ? "bg-rose-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${coveragePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-[color:var(--color-border)]">

        {metrics.incorrectAttempts > 0 && (
          <button
            type="button"
            onClick={handleDrillErrors}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition-colors shadow-sm"
            title="Drill Incorrectly Answered Questions"
          >
            <FiPlay className="w-3 h-3" />
            <span>Drill ({metrics.incorrectAttempts})</span>
          </button>
        )}

        <button
          type="button"
          onClick={handlePracticeUnsolved}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm ml-auto"
        >
          <FiPlay className="w-3.5 h-3.5" />
          <span>{attempted === 0 ? "Start Practice" : "Practice Unsolved"}</span>
        </button>
      </div>
    </div>
  );
}
