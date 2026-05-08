import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaCheck, FaChevronDown, FaFlag, FaLink, FaRegStar, FaStar } from "react-icons/fa";
import { AnswerService } from "../../services/AnswerService";
import { evaluateAnswer } from "../../utils/evaluateAnswer";
import { useFilterActions } from "../../contexts/FilterContext";
import { useSession } from "../../contexts/SessionContext";
import Toast from "../Toast/Toast";
import { trackEvent } from "../../utils/analytics";
import { getShortcutKey, isEditableTarget, shouldIgnorePlainShortcut } from "../../utils/keyboardShortcuts";

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

export default function AnswerPanel({
  question = {},
  onNextQuestion,
  onPreviousQuestion,
  canGoPrevious,
  canGoNext,
  solutionLink,
}) {
  const {
    toggleSolved,
    toggleBookmark,
    isQuestionSolved,
    isQuestionBookmarked,
    getQuestionProgressId,
  } = useFilterActions();

  const { goBack, canGoBack } = useSession();
  const canMovePrevious = typeof canGoPrevious === "boolean" ? canGoPrevious : canGoBack;
  const canMoveNext = typeof canGoNext === "boolean" ? canGoNext : typeof onNextQuestion === "function";

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
  const [isMobileWorkspaceOpen, setIsMobileWorkspaceOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => (
    typeof window === "undefined"
      || typeof window.matchMedia !== "function"
      || window.matchMedia("(min-width: 768px)").matches
  ));
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
    setIsMobileWorkspaceOpen(false);
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleViewportChange = (event) => {
      setIsDesktopViewport(event.matches);
    };

    setIsDesktopViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleViewportChange);
      return () => mediaQuery.removeEventListener("change", handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

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
    setIsMobileWorkspaceOpen(true);
    trackEvent("answer_submit", {
      question_uid: question.question_uid || storageKey || "unknown",
      type: answerRecord.type,
      correct: evaluation.correct ? "yes" : "no",
    });

    // FEAT-011: Auto-mark solved on correct answer submit
    if (evaluation.correct && questionProgressId && !isSolved) {
      toggleSolved(questionProgressId);
    }

    const progress = readJsonFromLocalStorage(PROGRESS_KEY, {});
    const current = progress[storageKey] || { attempts: 0 };
    progress[storageKey] = {
      attempts: current.attempts + 1,
      correctAttempts: Number(current.correctAttempts || 0) + (evaluation.correct ? 1 : 0),
      incorrectAttempts: Number(current.incorrectAttempts || 0) + (evaluation.correct ? 0 : 1),
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
    setIsMobileWorkspaceOpen(true);
  };

  const handleMsqToggle = (option, checked) => {
    if (checked) {
      setMsqSelection((prev) => [...prev, option]);
    } else {
      setMsqSelection((prev) => prev.filter((item) => item !== option));
    }
    setResult(null);
    setIsMobileWorkspaceOpen(true);
  };

  const handleNatChange = (e) => {
    setNatInput(e.target.value);
    setResult(null);
    setIsMobileWorkspaceOpen(true);
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
  const reportIssueUrl = useMemo(() => {
    const questionUid = String(question.question_uid || storageKey || "").trim() || "unknown-question";
    const yearLabel = String(question.exam?.label || question.yearSetLabel || question.year || "Unknown").trim();
    const subjectLabel = String(question.subjectLabel || question.subject || "Unknown").trim();
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const issueBody = [
      "Describe the problem:",
      "",
      "Question metadata",
      `- question_uid: ${questionUid}`,
      `- year/set: ${yearLabel}`,
      `- subject: ${subjectLabel}`,
      `- page: ${pageUrl}`,
    ].join("\n");
    const params = new URLSearchParams({
      title: `[Question report] ${questionUid}`,
      body: issueBody,
    });
    return `https://github.com/superawat/Gate_QA/issues/new?${params.toString()}`;
  }, [question, storageKey]);

  const handleShare = useCallback(() => {
    const questionId = question.question_uid || '';
    if (!questionId) return;

    const url = `${window.location.origin}${window.location.pathname}?question=${encodeURIComponent(questionId)}`;

    const showToast = () => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      trackEvent("share_question", { question_uid: questionId });
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

  const isInteractive = answerRecord && ["MCQ", "MSQ", "NAT"].includes(answerRecord.type);
  const mobileWorkspaceLabel = !answerRecord
    ? "Answer unavailable"
    : isInteractive
      ? `${answerRecord.type} answer workspace`
      : `${answerRecord.type} review state`;
  const shouldRenderWorkspace = isDesktopViewport || isMobileWorkspaceOpen;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const shortcutKey = getShortcutKey(event);
      const isTypingTarget = isEditableTarget(event.target);

      if (shortcutKey === "Enter" && isTypingTarget && isInteractive && hasValidInput) {
        event.preventDefault();
        evaluateSubmission();
        return;
      }

      if (shouldIgnorePlainShortcut(event)) {
        return;
      }

      if (["1", "2", "3", "4"].includes(shortcutKey) && ["MCQ", "MSQ"].includes(answerRecord?.type)) {
        const option = OPTIONS[Number(shortcutKey) - 1];
        if (!option) {
          return;
        }
        event.preventDefault();
        if (answerRecord.type === "MCQ") {
          handleMcqSelect(option);
        } else {
          handleMsqToggle(option, !msqSelection.includes(option));
        }
        return;
      }

      if (shortcutKey === "s" && isInteractive && hasValidInput) {
        event.preventDefault();
        evaluateSubmission();
        return;
      }

      if (shortcutKey === "b" && !isStatusActionDisabled) {
        event.preventDefault();
        handleToggleBookmark();
        return;
      }

      if (shortcutKey === "m" && !isStatusActionDisabled) {
        event.preventDefault();
        handleToggleSolved();
        return;
      }

      if (shortcutKey === "l") {
        event.preventDefault();
        handleShare();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    answerRecord,
    evaluateSubmission,
    handleMcqSelect,
    handleShare,
    handleMsqToggle,
    handleToggleBookmark,
    handleToggleSolved,
    hasValidInput,
    isInteractive,
    isStatusActionDisabled,
    mcqSelection,
    msqSelection,
    natInput,
  ]);

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
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <p className="text-sm font-semibold">Answer unavailable</p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            This question does not have a verified answer in the current bank yet. You can still bookmark it, share it, or report the gap for review.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={reportIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Report this question
            </a>
          </div>
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
              {OPTIONS.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleMcqSelect(option)}
                  aria-keyshortcuts={String(index + 1)}
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
              {OPTIONS.map((option, index) => (
                <label
                  key={option}
                  aria-keyshortcuts={String(index + 1)}
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
                aria-keyshortcuts="Enter"
                className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Render Helpers ---

  const renderSubmitButton = (additionalClasses = "") => (
    <button
      type="button"
      disabled={!isInteractive || !hasValidInput}
      aria-keyshortcuts="S Enter"
      className={`px-6 h-12 rounded font-bold text-sm shadow-sm transition-colors flex items-center justify-center ${!isInteractive || !hasValidInput
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700"
        } ${additionalClasses}`}
      onClick={evaluateSubmission}
    >
      {result ? "Submit Again" : "Submit Answer"}
    </button>
  );

  const renderNextButton = (additionalClasses = "") => (
    <button
      type="button"
      disabled={!canMoveNext || typeof onNextQuestion !== "function"}
      onClick={onNextQuestion}
      aria-keyshortcuts="ArrowRight"
      className={`px-6 h-12 rounded font-bold text-sm shadow-sm transition-colors flex items-center justify-center ${!canMoveNext || typeof onNextQuestion !== "function"
        ? "border border-gray-200 text-gray-300 bg-white opacity-50 cursor-not-allowed"
        : "bg-teal-600 text-white hover:bg-teal-700"
        } ${additionalClasses}`}
    >
      Next &rarr;
    </button>
  );

  const renderPreviousButton = (additionalClasses = "") => (
    <button
      type="button"
      disabled={!canMovePrevious}
      onClick={onPreviousQuestion || goBack}
      aria-keyshortcuts="ArrowLeft"
      className={`px-6 h-12 rounded font-bold text-sm shadow-sm transition-colors flex items-center justify-center ${!canMovePrevious
        ? "border border-gray-200 text-gray-300 bg-white opacity-50 cursor-not-allowed"
        : "border border-teal-500 text-teal-600 bg-white hover:bg-teal-50"
        } ${additionalClasses}`}
    >
      &larr; Previous
    </button>
  );

  const renderSolutionButton = (additionalClasses = "") => {
    const baseClasses = `px-6 h-12 rounded bg-slate-600 text-white font-bold text-sm shadow-sm hover:bg-slate-700 transition-colors flex items-center justify-center ${additionalClasses}`;
    if (solutionLink) {
      return (
        <a
          href={solutionLink}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
        >
          Solution
        </a>
      );
    }
    return (
      <button
        type="button"
        disabled
        className={`px-6 h-12 rounded bg-slate-600 text-white font-bold text-sm shadow-sm flex items-center justify-center cursor-not-allowed opacity-50 ${additionalClasses}`}
      >
        Solution
      </button>
    );
  };

  const renderIconTray = (containerClasses = "") => (
    <div className={`flex items-center gap-3 ${containerClasses}`}>
      {/* 1. Mark as Solved */}
      <button
        type="button"
        disabled={isStatusActionDisabled}
        onClick={handleToggleSolved}
        aria-keyshortcuts="M"
        title={isSolved ? "Mark as Unsolved" : "Mark as Solved"}
        aria-label={isSolved ? "Mark question as unsolved" : "Mark question as solved"}
        aria-pressed={isSolved}
        className={`w-11 h-11 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 hover:shadow-md ${isStatusActionDisabled
          ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
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
        aria-keyshortcuts="B"
        title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
        aria-label={isBookmarked ? "Remove question bookmark" : "Bookmark question"}
        aria-pressed={isBookmarked}
        className={`w-11 h-11 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 hover:shadow-md ${isStatusActionDisabled
          ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
          : isBookmarked
            ? 'border-yellow-500 bg-yellow-100 text-yellow-600'
            : 'border-yellow-200 bg-yellow-50 text-yellow-300 hover:border-yellow-300 hover:text-yellow-500'
          }`}
      >
        {isBookmarked ? <FaStar className="text-[20px]" /> : <FaRegStar className="text-[20px]" />}
      </button>

      {/* 4. Share */}
      <button
        type="button"
        onClick={handleShare}
        title="Share Question Link"
        aria-label="Copy question link"
        aria-keyshortcuts="L"
        className="w-11 h-11 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 hover:shadow-md border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:text-gray-500"
      >
        <FaLink className="text-[20px]" />
      </button>

      <a
        href={reportIssueUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Report a bad question"
        aria-label="Report a bad question on GitHub"
        className="w-11 h-11 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 hover:shadow-md border-rose-200 bg-rose-50 text-rose-400 hover:border-rose-300 hover:text-rose-600"
      >
        <FaFlag className="text-[18px]" />
      </a>
    </div>
  );

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      {!isDesktopViewport ? (
        <button
          type="button"
          onClick={() => setIsMobileWorkspaceOpen((previous) => !previous)}
          aria-expanded={isMobileWorkspaceOpen}
          className="mb-4 inline-flex min-h-[52px] w-full items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-left shadow-sm transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Answer workspace</span>
            <span className="mt-1 block truncate text-sm font-semibold text-slate-900">{mobileWorkspaceLabel}</span>
          </span>
          <FaChevronDown className={`ml-3 shrink-0 text-slate-500 transition-transform ${isMobileWorkspaceOpen ? "rotate-180" : ""}`} />
        </button>
      ) : null}

      {shouldRenderWorkspace ? (
        <>
          <div className="mb-6">
            {renderInputSection()}

            {result && (
              <div className={`mt-3 rounded p-2 text-center text-sm font-medium ${result.correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                {result.status === "invalid_input" ? "Invalid Input" : result.correct ? "Correct!" : "Incorrect"}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 px-2 pt-4">
            <div className="hidden items-center justify-between md:flex">
              <div className="flex items-center gap-2">
                {renderSubmitButton()}
                {renderIconTray()}
              </div>
              <div className="flex items-center gap-2">
                {renderSolutionButton()}
                {renderPreviousButton()}
                {renderNextButton()}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              <div className="grid grid-cols-4 gap-3 justify-items-center">
                {renderIconTray("contents")}
              </div>

              <div>
                {renderSubmitButton("w-full")}
              </div>

              <div className="grid w-full grid-cols-3 gap-2">
                {renderSolutionButton("w-full")}
                {renderPreviousButton("w-full")}
                {renderNextButton("w-full")}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {isStatusActionDisabled && (
        <p className="mt-3 text-xs text-amber-700 text-center">
          Progress status is unavailable for this question identifier.
        </p>
      )}

      <Toast message="Link copied!" visible={toastVisible} />
    </div>
  );
}
