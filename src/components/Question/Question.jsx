import React from "react";
import DOMPurify from "dompurify";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import AnswerPanel from "../AnswerPanel/AnswerPanel";
import { useFilterActions } from "../../contexts/FilterContext";
import { MathContent } from "../Math/MathRuntime";

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
          <MathContent
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
        </div>

        <AnswerPanel
          question={question}
          onNextQuestion={nextHandler}
          onPreviousQuestion={onPreviousQuestion}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          solutionLink={question.link}
        />
      </div>
    </div>
  );
}

export default React.memo(Question);
