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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          {showStatusChips ? (
            <div className="flex flex-wrap items-start justify-end gap-2 pb-3">
              {isSolved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                  <FaCheckCircle className="text-green-600" />
                  Solved
                </span>
              )}
              {isBookmarked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">
                  <FaStar className="text-orange-500" />
                  Bookmarked
                </span>
              )}
            </div>
          ) : null}
          <MathContent
            as="div"
            dynamic
            className="text-gray-500 mt-1 leading-6 text-xl overflow-auto whitespace-normal"
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
