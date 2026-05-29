import React from "react";
import { FaCheckCircle, FaRegStar, FaStar } from "react-icons/fa";
import { MathContent } from "../Math/MathRuntime";
import { formatExplorePreview } from "../../utils/questionPreview";

const typeStyles = {
  mcq: "bg-[color:var(--color-info-soft)] text-[color:var(--color-info-text)] ring-[color:var(--color-info-border)]",
  msq: "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-text)] ring-[color:var(--color-warning-border)]",
  nat: "bg-[color:var(--color-purple-soft)] text-[color:var(--color-purple-text)] ring-[color:var(--color-purple-border)]",
  unknown: "bg-[color:var(--color-neutral-soft)] text-[color:var(--color-neutral-text)] ring-[color:var(--color-neutral-border)]",
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
    <article className="question-result-card rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
            <span>{question?.yearSetLabel || "Unknown Year"}</span>
            <span className="h-1 w-1 rounded-full bg-[color:var(--color-neutral-border)]" />
            <span>{subjectLabel}</span>
            {subtopicLabel ? (
              <>
                <span className="h-1 w-1 rounded-full bg-[color:var(--color-neutral-border)]" />
                <span className="normal-case tracking-normal text-[color:var(--color-text-muted)]">{subtopicLabel}</span>
              </>
            ) : null}
          </div>
          <h2 className="text-lg font-semibold leading-snug text-[color:var(--color-text)]">{question?.title || "Untitled question"}</h2>
          <MathContent
            as="div"
            dynamic
            className="max-w-3xl overflow-hidden text-sm leading-6 text-[color:var(--color-text-muted)]"
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
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--color-success-text)] ring-1 ring-inset ring-[color:var(--color-success-border)]">
              <FaCheckCircle className="text-[color:var(--color-success-text)]" />
              Solved
            </span>
          ) : null}
          {isBookmarked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-warning-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--color-warning-text)] ring-1 ring-inset ring-[color:var(--color-warning-border)]">
              <FaStar className="text-[color:var(--color-warning-text)]" />
              Saved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-neutral-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--color-neutral-text)] ring-1 ring-inset ring-[color:var(--color-neutral-border)]">
              <FaRegStar className="text-[color:var(--color-neutral-text)]" />
              Ready
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-[44px] items-center rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          Open Question
        </button>
      </div>
    </article>
  );
};

export default QuestionResultCard;
