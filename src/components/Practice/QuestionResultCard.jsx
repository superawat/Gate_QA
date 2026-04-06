import React from "react";
import { FaCheckCircle, FaRegStar, FaStar } from "react-icons/fa";
import { MathContent } from "../Math/MathRuntime";
import { formatExplorePreview } from "../../utils/questionPreview";

const typeStyles = {
  mcq: "bg-sky-50 text-sky-700 ring-sky-200",
  msq: "bg-amber-50 text-amber-700 ring-amber-200",
  nat: "bg-violet-50 text-violet-700 ring-violet-200",
  unknown: "bg-slate-100 text-slate-600 ring-slate-200",
};

const QuestionResultCard = ({
  question,
  isSolved,
  isBookmarked,
  onOpen,
}) => {
  const typeToken = String(question?.type || "unknown").trim().toLowerCase() || "unknown";
  const preview = formatExplorePreview(question);
  const subjectLabel = question?.subjectLabel || question?.subject || "Unknown Subject";
  const subtopicLabel = Array.isArray(question?.subtopics) && question.subtopics[0]?.label
    ? question.subtopics[0].label
    : "";

  return (
    <article className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>{question?.yearSetLabel || "Unknown Year"}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{subjectLabel}</span>
            {subtopicLabel ? (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="normal-case tracking-normal text-slate-600">{subtopicLabel}</span>
              </>
            ) : null}
          </div>
          <h2 className="text-lg font-semibold leading-snug text-slate-900">{question?.title || "Untitled question"}</h2>
          <MathContent
            as="div"
            dynamic
            className="max-w-3xl overflow-hidden text-sm leading-6 text-slate-600"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {preview}
          </MathContent>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ring-inset ${typeStyles[typeToken] || typeStyles.unknown}`}>
            {typeToken}
          </span>
          {isSolved ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <FaCheckCircle className="text-emerald-600" />
              Solved
            </span>
          ) : null}
          {isBookmarked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              <FaStar className="text-amber-500" />
              Saved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
              <FaRegStar className="text-slate-400" />
              Ready
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-[44px] items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          Open Question
        </button>
      </div>
    </article>
  );
};

export default QuestionResultCard;
