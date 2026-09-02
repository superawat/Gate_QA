import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlay,
  FiCheckSquare,
} from "react-icons/fi";
import { PRACTICE_ROUTE } from "../../utils/routes";
import TrackerTopicCard from "./TrackerTopicCard";

export default function TrackerSubjectAccordion({
  subject,
  topicMetricsMap,
  onToggleTheory,
  onBulkTheoryComplete,
  onOpenReset,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const subjectMetrics = subject.topics
    .map((t) => topicMetricsMap.get(t.id))
    .filter(Boolean);

  const totalTopics = subject.topics.length;
  const theoryCompletedCount = subjectMetrics.filter((m) => m.theoryCompleted).length;
  const theoryPercentage = totalTopics > 0 ? Math.round((theoryCompletedCount / totalTopics) * 100) : 0;

  const totalAvailablePyqs = subjectMetrics.reduce((acc, m) => acc + m.totalAvailablePyqs, 0);
  const totalAttemptedPyqs = subjectMetrics.reduce((acc, m) => acc + m.attemptedPyqs, 0);
  const totalSolvedPyqs = subjectMetrics.reduce((acc, m) => acc + m.solvedPyqs, 0);
  const practicePercentage = totalAvailablePyqs > 0 ? Math.round((totalAttemptedPyqs / totalAvailablePyqs) * 100) : 0;

  const handlePracticeAllSubject = () => {
    navigate(`${PRACTICE_ROUTE}?subjects=${subject.slug}&hideSolved=true`);
  };

  const allTheoryDone = theoryCompletedCount === totalTopics;

  return (
    <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden transition-all">
      {/* Accordion Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[color:var(--color-border)]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
          className="flex items-center gap-3 cursor-pointer select-none flex-1"
        >
          <button
            type="button"
            className="p-1 rounded-lg text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg)] transition-colors"
          >
            {isOpen ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[color:var(--color-bg)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)]">
                {subject.marksRange}
              </span>
              {subject.weightageTier === "tier-1-high" && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  High Yield
                </span>
              )}
              <h3 className="font-bold text-base sm:text-lg text-[color:var(--color-text)]">
                {subject.label}
              </h3>
            </div>
            <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5 line-clamp-1">
              Textbook: {subject.recommendedTextbook}
            </p>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-[color:var(--color-text)]">
              {theoryCompletedCount}/{totalTopics} Theory completed ({theoryPercentage}%)
            </div>
            <div className="text-[11px] text-[color:var(--color-text-muted)]">
              {totalAttemptedPyqs > 0 ? (
                `${totalAttemptedPyqs}/${totalAvailablePyqs} PYQs (${practicePercentage}%)`
              ) : (
                "No practice yet"
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Subtle Secondary Action */}
            <button
              type="button"
              onClick={() => setShowBulkConfirm(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-bg)] transition-colors border border-transparent hover:border-[color:var(--color-border)]"
              title="Bulk Theory Status"
            >
              <FiCheckSquare className="w-3.5 h-3.5 text-[color:var(--color-text-muted)]" />
              <span className="hidden lg:inline">
                {allTheoryDone ? "Reset Theory" : "Mark All Done"}
              </span>
            </button>

            {/* Prominent Primary Action */}
            <button
              type="button"
              onClick={handlePracticeAllSubject}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
              title="Practice all unsolved PYQs in this subject"
            >
              <FiPlay className="w-3.5 h-3.5" />
              <span>Practice All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-[color:var(--color-border)] h-1">
        <div
          className="bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${(theoryPercentage + practicePercentage) / 2}%` }}
        />
      </div>

      {/* Bulk Confirm Modal */}
      {showBulkConfirm && (
        <div className="p-4 bg-blue-500/10 border-b border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-[color:var(--color-text)] font-medium">
            {allTheoryDone
              ? `Uncheck theory complete for all ${totalTopics} topics in ${subject.label}?`
              : `Mark all ${totalTopics} topics in ${subject.label} as Theory Complete?`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const topicIds = subject.topics.map((t) => t.id);
                onBulkTheoryComplete(topicIds, !allTheoryDone);
                setShowBulkConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-500"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Topics Grid */}
      {isOpen && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[color:var(--color-surface)]">
          {subject.topics.map((topic) => {
            const metrics = topicMetricsMap.get(topic.id);
            if (!metrics) return null;

            return (
              <TrackerTopicCard
                key={topic.id}
                topic={topic}
                metrics={metrics}
                onToggleTheory={onToggleTheory}
                onOpenReset={onOpenReset}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
