import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaCheck, FaEye, FaEyeSlash, FaLink, FaRegStar, FaStar } from "react-icons/fa";
import { AnswerService } from "../../services/AnswerService";
import { evaluateAnswer } from "../../utils/evaluateAnswer";
import { useFilters } from "../../contexts/FilterContext";
import Toast from "../Toast/Toast";

const PROGRESS_KEY = "gateqa_progress_v1";
const OPTIONS = ["A", "B", "C", "D"];

function readJsonFromLocalStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJsonToLocalStorage(key, payload) {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    // ignore storage write failures
  }
}

export default function AnswerPanel({ question = {}, onNextQuestion, solutionLink }) {
  const {
    toggleSolved,
    toggleBookmark,
    isQuestionSolved,
    isQuestionBookmarked,
    getQuestionProgressId,
  } = useFilters();

  const questionIdentity = useMemo(
    () => AnswerService.getQuestionIdentity(question),
    [question]
  );
  const answerRecord = useMemo(
    () => AnswerService.getAnswerForQuestion(question),
    [question]
  );
  const storageKey = useMemo(
    () => AnswerService.getStorageKeyForQuestion(question),
    [question]
  );

  const [mcqSelection, setMcqSelection] = useState("");
  const [msqSelection, setMsqSelection] = useState([]);
  const [natInput, setNatInput] = useState("");
  const [result, setResult] = useState(null);
  const questionProgressId = useMemo(
    () => getQuestionProgressId(question),
    [question, getQuestionProgressId]
  );
  const isSolved = isQuestionSolved(questionProgressId);
  const isBookmarked = isQuestionBookmarked(questionProgressId);
  const isStatusActionDisabled = !questionProgressId;

  useEffect(() => {
    setMcqSelection("");
    setMsqSelection([]);
    setNatInput("");
    setResult(null);
  }, [storageKey]);

  const handleToggleSolved = () => {
    if (!questionProgressId) {
      return;
    }
    toggleSolved(questionProgressId);
  };

  const handleToggleBookmark = () => {
    if (!questionProgressId) {
      return;
    }
    toggleBookmark(questionProgressId);
  };

  const evaluateSubmission = () => {
    let submission;
    if (answerRecord.type === "MCQ") {
      submission = mcqSelection;
    } else if (answerRecord.type === "MSQ") {
      submission = msqSelection;
    } else {
      submission = natInput;
    }
    const evaluation = evaluateAnswer(answerRecord, submission);
    setResult(evaluation);

    const progress = readJsonFromLocalStorage(PROGRESS_KEY, {});
    const current = progress[storageKey] || { attempts: 0 };
    progress[storageKey] = {
      attempts: current.attempts + 1,
      correct: evaluation.correct,
      lastSubmittedAt: new Date().toISOString(),
      type: answerRecord.type,
      lastInput: submission,
    };
    writeJsonToLocalStorage(PROGRESS_KEY, progress);
  };

  const handleMcqSelect = (option) => {
    setMcqSelection(option);
    setResult(null);
  };

  const handleMsqToggle = (option, checked) => {
    if (checked) {
      setMsqSelection((prev) => [...prev, option]);
    } else {
      setMsqSelection((prev) => prev.filter((item) => item !== option));
    }
    setResult(null);
  };

  const handleNatChange = (e) => {
    setNatInput(e.target.value);
    setResult(null);
  };

  const hasValidInput = useMemo(() => {
    if (!answerRecord) return false;
    if (answerRecord.type === "MCQ") return !!mcqSelection;
    if (answerRecord.type === "MSQ") return msqSelection.length > 0;
    if (answerRecord.type === "NAT") return !!natInput.trim();
    return false;
  }, [answerRecord, mcqSelection, msqSelection, natInput]);

  // --- Share Question ---
  const [toastVisible, setToastVisible] = useState(false);

  const handleShare = useCallback(() => {
    const questionId = question.question_uid || '';
    if (!questionId) return;

    const url = `${window.location.origin}${window.location.pathname}?question=${encodeURIComponent(questionId)}`;

    const showToast = () => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(url).then(showToast).catch(() => {
        // Fallback if clipboard API rejects
        fallbackCopyToClipboard(url);
        showToast();
      });
    } else {
      fallbackCopyToClipboard(url);
      showToast();
    }
  }, [question]);

  const fallbackCopyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (_) {
      // Silently fail
    }
    document.body.removeChild(textarea);
  };

  // --- Render Logic for Input Section ---
  const renderInputSection = () => {
    if (!questionIdentity.hasIdentity) {
      return (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
          Missing question identity.
        </div>
      );
    }

    if (!answerRecord) {
      return (
        <div className="rounded border border-gray-300 bg-gray-50 p-3">
          <div className="mb-2 text-sm text-gray-700">No answer record.</div>
        </div>
      );
    }

    if (["UNSUPPORTED", "SUBJECTIVE", "AMBIGUOUS"].includes(answerRecord.type)) {
      let colorClass = "border-gray-200 bg-gray-50 text-gray-700";
      let message = "Refer to standard solution.";

      if (answerRecord.type === "UNSUPPORTED") {
        colorClass = "border-amber-300 bg-amber-50 text-amber-900";
        message = "Non-standard format.";
      } else if (answerRecord.type === "SUBJECTIVE") {
        colorClass = "border-purple-300 bg-purple-50 text-purple-900";
        message = "Subjective answer.";
      } else if (answerRecord.type === "AMBIGUOUS") {
        colorClass = "border-orange-300 bg-orange-50 text-orange-900";
        message = "Ambiguous question.";
      }

      return (
        <div className={`rounded border p-3 ${colorClass}`}>
          <div className="text-sm">{message}</div>
        </div>
      );
    }

    // Standard Interaction (MCQ, MSQ, NAT)
    return (
      <div className="flex flex-col gap-3">
        {/* Question Type Badge */}
        <div className="flex">
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${answerRecord.type === "NAT"
            ? "bg-purple-50 text-purple-700 ring-purple-600/20"
            : answerRecord.type === "MSQ"
              ? "bg-orange-50 text-orange-700 ring-orange-600/20"
              : "bg-blue-50 text-blue-700 ring-blue-600/20"
            }`}>
            {answerRecord.type}
          </span>
        </div>

        {/* Options / Input Row */}
        <div>
          {answerRecord.type === "MCQ" && (
            <div className="flex gap-2">
              {OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleMcqSelect(option)}
                  className={`flex-1 rounded border px-3 py-2 text-center text-sm font-medium transition-colors ${mcqSelection === option
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {answerRecord.type === "MSQ" && (
            <div className="flex flex-wrap gap-2">
              {OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`flex-1 flex items-center justify-center gap-2 rounded border px-3 py-2 cursor-pointer transition-colors ${msqSelection.includes(option)
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={msqSelection.includes(option)}
                    onChange={(event) => handleMsqToggle(option, event.target.checked)}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {answerRecord.type === "NAT" && (
            <div>
              <input
                type="text"
                value={natInput}
                onChange={handleNatChange}
                placeholder="Enter numeric answer"
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const isInteractive = answerRecord && ["MCQ", "MSQ", "NAT"].includes(answerRecord.type);

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">

      {/* Input / Status Section */}
      <div className="mb-6">
        {renderInputSection()}

        {/* Result Feedback */}
        {result && (
          <div className={`mt-3 rounded p-2 text-center text-sm font-medium ${result.correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
            {result.status === "invalid_input" ? "Invalid Input" : result.correct ? "Correct!" : "Incorrect"}
          </div>
        )}
      </div>

      {/* Unified Action Bar - 3 Zone Layout */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 shadow-sm mt-8">

        {/* Zone 1: Primary Action (Submit Answer) - Left aligned */}
        <div>
          <button
            type="button"
            disabled={!isInteractive || !hasValidInput}
            className={`px-6 h-12 rounded font-bold text-sm shadow-sm transition-colors ${!isInteractive || !hasValidInput
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            onClick={evaluateSubmission}
          >
            {result ? "Submit Again" : "Submit Answer"}
          </button>
        </div>

        {/* Zone 2: Icon Tray (Secondary Actions) - Centered */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-3">
            {/* 1. Mark as Solved */}
            <button
              type="button"
              disabled={isStatusActionDisabled}
              onClick={handleToggleSolved}
              title={isSolved ? "Mark as Unsolved" : "Mark as Solved"}
              className={`w-11 h-11 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 hover:shadow-md ${isStatusActionDisabled
                ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                : isSolved
                  ? 'border-green-500 bg-green-100 text-green-600'
                  : 'border-green-200 bg-green-50 text-green-300 hover:border-green-300 hover:text-green-500'
                }`}
            >
              <FaCheck className="text-[20px]" />
            </button>

            {/* 2. Bookmark */}
            <button
              type="button"
              disabled={isStatusActionDisabled}
              onClick={handleToggleBookmark}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
              className={`w-11 h-11 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 hover:shadow-md ${isStatusActionDisabled
                ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                : isBookmarked
                  ? 'border-yellow-500 bg-yellow-100 text-yellow-600'
                  : 'border-yellow-200 bg-yellow-50 text-yellow-300 hover:border-yellow-300 hover:text-yellow-500'
                }`}
            >
              {isBookmarked ? <FaStar className="text-[20px]" /> : <FaRegStar className="text-[20px]" />}
            </button>

            {/* 3. View Solution */}
            {solutionLink ? (
              <a
                href={solutionLink}
                target="_blank"
                rel="noopener noreferrer"
                title="View Solution"
                className="w-11 h-11 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 hover:shadow-md border-purple-200 bg-purple-50 text-purple-300 hover:border-purple-300 hover:text-purple-500"
              >
                <FaEye className="text-[20px]" />
              </a>
            ) : (
              <div
                title="No Solution Available"
                className="w-11 h-11 rounded-full border-2 border-gray-200 bg-gray-50 text-gray-300 flex items-center justify-center cursor-not-allowed"
              >
                <FaEyeSlash className="text-[20px]" />
              </div>
            )}

            {/* 4. Share */}
            <button
              type="button"
              onClick={handleShare}
              title="Share Question Link"
              className="w-11 h-11 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 hover:shadow-md border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:text-gray-500"
            >
              <FaLink className="text-[20px]" />
            </button>
          </div>
        </div>

        {/* Zone 3: Navigation (Next Question) - Right aligned */}
        <div>
          <button
            type="button"
            onClick={onNextQuestion}
            className="px-6 h-12 rounded bg-teal-600 text-white font-bold text-sm shadow-sm hover:bg-teal-700 transition-colors"
          >
            Next Question
          </button>
        </div>

      </div>

      {isStatusActionDisabled && (
        <p className="mt-3 text-xs text-amber-700 text-center">
          Progress status is unavailable for this question identifier.
        </p>
      )}

      <Toast message="Link copied!" visible={toastVisible} />
    </div>
  );
}
