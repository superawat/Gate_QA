import React from "react";
import DOMPurify from "dompurify";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import AnswerPanel from "../AnswerPanel/AnswerPanel";
import { useFilterActions } from "../../contexts/FilterContext";
import { MathContent } from "../Math/MathRuntime";
import QuestionNotes from "./QuestionNotes";

function Question({
  question = {},
  onNextQuestion,
  changeQuestion,
  onPreviousQuestion,
  canGoPrevious,
  canGoNext,
}) {
  const { isQuestionSolved, isQuestionBookmarked, getQuestionProgressId } = useFilterActions();
  const questionHtml = (question.question || "")
    .replace(/\n\n/g, "<br />")
    .replace(/\n<li>/g, "<br><li>");
  const sanitizedQuestionHtml = DOMPurify.sanitize(questionHtml);
  const isMalformed = question.malformed || !sanitizedQuestionHtml.trim();

  const questionProgressId = getQuestionProgressId(question);
  const isSolved = isQuestionSolved(questionProgressId);
  const isBookmarked = isQuestionBookmarked(questionProgressId);
  const nextHandler = onNextQuestion || changeQuestion;
  const showStatusChips = isSolved || isBookmarked;

  return (
    <div>
      <div className="rounded-lg bg-[color:var(--color-surface)] p-6 shadow-lg">
        <div className="mb-4">
          {showStatusChips ? (
            <div className="flex flex-wrap items-start justify-end gap-2 pb-3">
              {isSolved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-success-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-success-text)]">
                  <FaCheckCircle className="text-[color:var(--color-success-text)]" />
                  Solved
                </span>
              )}
              {isBookmarked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-warning-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-warning-text)]">
                  <FaStar className="text-[color:var(--color-warning-text)]" />
                  Bookmarked
                </span>
              )}
            </div>
          ) : null}

          {isMalformed ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <p className="text-sm font-semibold">⚠️ Question content unavailable</p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                This question could not be loaded — the source data may be missing or malformed.
                {question.link ? (
                  <>
                    {" "}You can try viewing it directly on{" "}
                    <a
                      href={question.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline hover:text-amber-700"
                    >
                      GateOverflow
                    </a>.
                  </>
                ) : null}
              </p>
            </div>
          ) : (
            <MathContent
              key={question.question_uid || sanitizedQuestionHtml}
              as="div"
              dynamic
              className="mt-1 overflow-auto whitespace-normal text-xl leading-6 text-[color:var(--color-text-muted)]"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizedQuestionHtml,
                }}
              ></div>
            </MathContent>
          )}
        </div>

        <AnswerPanel
          question={question}
          onNextQuestion={nextHandler}
          onPreviousQuestion={onPreviousQuestion}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          solutionLink={question.link}
        />

        <QuestionNotes storageKey={questionProgressId} />
      </div>
    </div>
  );
}

export default React.memo(Question);
