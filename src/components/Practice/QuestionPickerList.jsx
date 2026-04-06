import React from "react";
import { FaArrowRight, FaCheckCircle, FaRegStar, FaStar } from "react-icons/fa";

const typeStyles = {
  mcq: "bg-sky-50 text-sky-700 ring-sky-200",
  msq: "bg-amber-50 text-amber-700 ring-amber-200",
  nat: "bg-violet-50 text-violet-700 ring-violet-200",
  unknown: "bg-slate-100 text-slate-600 ring-slate-200",
};

const getStatusLabel = ({ isSolved, isBookmarked }) => {
  if (isSolved) {
    return {
      label: "Solved",
      icon: FaCheckCircle,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      iconClassName: "text-emerald-600",
    };
  }

  if (isBookmarked) {
    return {
      label: "Saved",
      icon: FaStar,
      className: "bg-amber-50 text-amber-700 ring-amber-200",
      iconClassName: "text-amber-500",
    };
  }

  return {
    label: "Ready",
    icon: FaRegStar,
    className: "bg-slate-50 text-slate-500 ring-slate-200",
    iconClassName: "text-slate-400",
  };
};

const QuestionPickerList = ({
  questions = [],
  pageStartIndex = 0,
  isQuestionSolved = () => false,
  isQuestionBookmarked = () => false,
  onOpenQuestion,
}) => (
  <section className="overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-card)]">
    <div className="border-b border-slate-200 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Question Picker</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-950">Choose a question directly</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Apply your filters, scan the matching list, and open the exact question you want.
      </p>
    </div>

    <div className="hidden grid-cols-[88px_minmax(0,1.8fr)_140px_180px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid">
      <span>Index</span>
      <span>Question</span>
      <span>Year</span>
      <span>Subject</span>
      <span className="text-right">Open</span>
    </div>

    <div className="divide-y divide-slate-200">
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
            className="group block w-full px-5 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
          >
            <div className="flex flex-col gap-3 md:grid md:grid-cols-[88px_minmax(0,1.8fr)_140px_180px_150px] md:items-center md:gap-4">
              <div className="flex items-center justify-between gap-3 md:block">
                <span className="text-sm font-semibold text-slate-900">#{sequenceNumber}</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ring-inset md:hidden ${typeStyles[typeToken] || typeStyles.unknown}`}>
                  {typeToken}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-base font-semibold leading-6 text-slate-950">
                  {question?.title || "Untitled question"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 md:hidden">
                  <span>{question?.yearSetLabel || "Unknown Year"}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{subjectLabel}</span>
                  {subtopicLabel ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{subtopicLabel}</span>
                    </>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 md:hidden">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}>
                    <StatusIcon className={status.iconClassName} />
                    {status.label}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    Open
                    <FaArrowRight className="text-[0.7rem]" />
                  </span>
                </div>
              </div>

              <div className="hidden text-sm font-medium text-slate-700 md:block">
                {question?.yearSetLabel || "Unknown Year"}
              </div>

              <div className="hidden min-w-0 md:block">
                <p className="truncate text-sm font-medium text-slate-700">
                  {subjectLabel}
                </p>
                {subtopicLabel ? (
                  <p className="mt-1 truncate text-xs text-slate-500">{subtopicLabel}</p>
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
                <span className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-slate-800">
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
