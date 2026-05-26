import React from "react";
import { FaArrowRight, FaCheckCircle, FaRegStar, FaStar } from "react-icons/fa";

const typeStyles = {
  mcq: "bg-[color:var(--color-info-soft)] text-[color:var(--color-info-text)] ring-[color:var(--color-info-border)]",
  msq: "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-text)] ring-[color:var(--color-warning-border)]",
  nat: "bg-[color:var(--color-purple-soft)] text-[color:var(--color-purple-text)] ring-[color:var(--color-purple-border)]",
  unknown: "bg-[color:var(--color-neutral-soft)] text-[color:var(--color-neutral-text)] ring-[color:var(--color-neutral-border)]",
};

const getStatusLabel = ({ isSolved, isBookmarked }) => {
  if (isSolved) {
    return {
      label: "Solved",
      icon: FaCheckCircle,
      className: "bg-[color:var(--color-success-soft)] text-[color:var(--color-success-text)] ring-[color:var(--color-success-border)]",
      iconClassName: "text-[color:var(--color-success-text)]",
    };
  }

  if (isBookmarked) {
    return {
      label: "Saved",
      icon: FaStar,
      className: "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-text)] ring-[color:var(--color-warning-border)]",
      iconClassName: "text-[color:var(--color-warning-text)]",
    };
  }

  return {
    label: "Ready",
    icon: FaRegStar,
    className: "bg-[color:var(--color-neutral-soft)] text-[color:var(--color-neutral-text)] ring-[color:var(--color-neutral-border)]",
    iconClassName: "text-[color:var(--color-neutral-text)]",
  };
};

const QuestionPickerList = ({
  questions = [],
  pageStartIndex = 0,
  isQuestionSolved = () => false,
  isQuestionBookmarked = () => false,
  onOpenQuestion,
}) => (
  <section className="practice-question-list overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)]">


    <div className="practice-question-table-head hidden grid-cols-[88px_minmax(0,1.8fr)_140px_180px_150px] gap-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)] md:grid">
      <span>Index</span>
      <span>Question</span>
      <span>Year</span>
      <span>Subject</span>
      <span className="text-right">Open</span>
    </div>

    <div className="practice-question-items divide-y divide-[color:var(--color-border)]">
      {questions.map((question, index) => {
        const sequenceNumber = pageStartIndex + index + 1;
        const typeToken = String(question?.type || "unknown").trim().toLowerCase() || "unknown";
        const subjectLabel = question?.subjectLabel || question?.subject || "Unknown Subject";
        const subtopicLabel = Array.isArray(question?.subtopics) && question.subtopics[0]?.label
          ? question.subtopics[0].label
          : "";
        const isSolved = isQuestionSolved(question);
        const isBookmarked = isQuestionBookmarked(question);
        const status = getStatusLabel({ isSolved, isBookmarked });
        const StatusIcon = status.icon;

        return (
          <button
            key={question.question_uid}
            type="button"
            onClick={() => onOpenQuestion(question)}
            className="practice-question-row group block w-full px-5 py-4 text-left transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
          >
            <div className="practice-question-row-grid flex flex-col gap-3 md:grid md:grid-cols-[88px_minmax(0,1.8fr)_140px_180px_150px] md:items-center md:gap-4">
              <div className="practice-question-kicker flex items-center justify-between gap-3 md:block">
                <span className="text-sm font-semibold text-[color:var(--color-text)]">#{sequenceNumber}</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ring-inset md:hidden ${typeStyles[typeToken] || typeStyles.unknown}`}>
                  {typeToken}
                </span>
              </div>

              <div className="min-w-0">
                <p className="practice-question-title text-base font-semibold leading-6 text-[color:var(--color-text)]">
                  {question?.title || "Untitled question"}
                </p>
                <div className="practice-question-meta mt-2 flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-muted)] md:hidden">
                  <span>{question?.yearSetLabel || "Unknown Year"}</span>
                  <span className="h-1 w-1 rounded-full bg-[color:var(--color-neutral-border)]" />
                  <span>{subjectLabel}</span>
                  {subtopicLabel ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-[color:var(--color-neutral-border)]" />
                      <span>{subtopicLabel}</span>
                    </>
                  ) : null}
                </div>
                <div className="practice-question-mobile-actions mt-3 flex flex-wrap items-center gap-2 md:hidden">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}>
                    <StatusIcon className={status.iconClassName} />
                    {status.label}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
                    Open
                    <FaArrowRight className="text-[0.7rem]" />
                  </span>
                </div>
              </div>

              <div className="hidden text-sm font-medium text-[color:var(--color-text)] md:block">
                {question?.yearSetLabel || "Unknown Year"}
              </div>

              <div className="hidden min-w-0 md:block">
                <p className="truncate text-sm font-medium text-[color:var(--color-text)]">
                  {subjectLabel}
                </p>
                {subtopicLabel ? (
                  <p className="mt-1 truncate text-xs text-[color:var(--color-text-muted)]">{subtopicLabel}</p>
                ) : (
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ring-1 ring-inset ${typeStyles[typeToken] || typeStyles.unknown}`}>
                    {typeToken}
                  </span>
                )}
              </div>

              <div className="hidden items-center justify-end gap-2 md:flex">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}>
                  <StatusIcon className={status.iconClassName} />
                  {status.label}
                </span>
                <span className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-[color:var(--color-primary-hover)]">
                  Open
                  <FaArrowRight className="text-xs" />
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </section>
);

export default QuestionPickerList;
