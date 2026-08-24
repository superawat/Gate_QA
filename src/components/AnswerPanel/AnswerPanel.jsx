import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FaCheck, FaStar, FaRegStar, FaLink, FaFlag } from "react-icons/fa";
import { useFilterActions, useFilterState } from "../../contexts/FilterContext";
import { useSession } from "../../contexts/SessionContext";
import { evaluateAnswer } from "../../utils/evaluateAnswer";
import { trackEvent } from "../../utils/analytics";
import Toast from "../Toast/Toast";
import AskAIButton from "../AskAI/AskAIButton";
import { getQuestionSolutionLink, isSpecialAptitudeQuestion } from "../../utils/solutionLink";
import { buildSolvePath } from "../../utils/routes";
import { getShortcutKey, isEditableTarget, shouldIgnorePlainShortcut } from "../../utils/keyboardShortcuts";
import { AnswerService } from "../../services/AnswerService";
import { QuestionService } from "../../services/QuestionService";
import { DaQuestionService } from "../../services/DaQuestionService";
import {
  recordPracticeAttempt,
  PRACTICE_PROGRESS_STORAGE_KEY,
  APTITUDE_PROGRESS_STORAGE_KEY,
  DA_PROGRESS_STORAGE_KEY,
} from "../../utils/practiceProgress";
import { enqueueChange } from "../../utils/syncQueue";
import { isDaQuestion as isDaQuestionByMetadata } from "../../utils/examTrack";

const isDaQuestion = (question = {}) => isDaQuestionByMetadata(question);

export default function AnswerPanel({
  question = {},
  onNextQuestion,
  onPreviousQuestion,
  canGoPrevious = false,
  canGoNext = false,
  solutionLink: passedSolutionLink,
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
  const canMoveNext = typeof canGoNext === "boolean" ? canGoNext : false;

  const [mcqSelection, setMcqSelection] = useState("");
  const [msqSelection, setMsqSelection] = useState([]);
  const [natInput, setNatInput] = useState("");
  const [result, setResult] = useState(null);

  const questionOpenedAtRef = useRef(Date.now());

  const storageKey = useMemo(
    () => AnswerService.getStorageKeyForQuestion(question),
    [question]
  );
  const questionProgressId = useMemo(
    () => (typeof getQuestionProgressId === "function" ? getQuestionProgressId(question) : null) || storageKey,
    [getQuestionProgressId, question, storageKey]
  );

  const isStatusActionDisabled = !questionProgressId;
  const isSolved = isQuestionSolved(questionProgressId);
  const isBookmarked = isQuestionBookmarked(questionProgressId);

  const answerRecord = useMemo(
    () => (isDaQuestion(question) ? DaQuestionService.getAnswerForQuestion(question) : AnswerService.getAnswerForQuestion(question)),
    [question]
  );

  const questionIdentity = useMemo(() => {
    const trackingId = questionProgressId || question.question_uid || question.id || "";
    const parsedYear = Number(question.year || question.exam?.year);
    const parsedQuestionNumber = Number(question.question_number || question.questionNumber);
    const hasLegacyIdentity = Number.isFinite(parsedYear) && Number.isFinite(parsedQuestionNumber);
    return {
      hasIdentity: Boolean(trackingId || hasLegacyIdentity),
      trackingId,
    };
  }, [question, questionProgressId]);

  const solutionLink = useMemo(() => {
    if (passedSolutionLink) {
      return passedSolutionLink;
    }
    return getQuestionSolutionLink(question);
  }, [passedSolutionLink, question]);

  const isInteractive = Boolean(
    answerRecord && ["MCQ", "MSQ", "NAT"].includes(answerRecord.type)
  );

  const answerOptions = useMemo(() => {
    if (!answerRecord) return [];
    if (Array.isArray(answerRecord.options) && answerRecord.options.length > 0) {
      return answerRecord.options;
    }
    if (["MCQ", "MSQ"].includes(answerRecord.type)) {
      return ["A", "B", "C", "D"];
    }
    return [];
  }, [answerRecord]);

  const isTrueFalse = useMemo(() => {
    if (answerRecord?.type !== "NAT") {
      return false;
    }
    const yearMatch = String(question?.year || question?.yearSetKey || question?.title || "").match(/\b(19\d\d|20\d\d)\b/);
    const examYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
    if (examYear && examYear > 1994) {
      return false;
    }
    const ansStr = String(answerRecord?.answer ?? "").trim();
    const isBinaryAnswer = ansStr === "0" || ansStr === "1";
    if (answerRecord && !isBinaryAnswer) {
      return false;
    }
    const tags = question?.tags || [];
    return Array.isArray(tags) && tags.some((t) => String(t || "").toLowerCase().trim() === "true-false");
  }, [question, answerRecord]);

  useEffect(() => {
    setMcqSelection("");
    setMsqSelection([]);
    setNatInput("");
    setResult(null);
    questionOpenedAtRef.current = Date.now();
  }, [questionProgressId, question.question_uid]);

  const evaluateSubmission = useCallback(() => {
    if (!isInteractive || !answerRecord) return;

    let payload = null;
    if (answerRecord.type === "MCQ") payload = mcqSelection;
    if (answerRecord.type === "MSQ") payload = msqSelection;
    if (answerRecord.type === "NAT") payload = natInput;

    const evaluation = evaluateAnswer(answerRecord, payload);
    setResult(evaluation);

    if (evaluation.correct && !isSolved && questionProgressId) {
      toggleSolved(question);
    }

    const submittedAt = new Date();
    const targetStorageKey = questionProgressId || storageKey || question?.question_uid || question?.id || "";
    const progressStorageKey = isDaQuestion(question)
      ? DA_PROGRESS_STORAGE_KEY
      : String(targetStorageKey || "").startsWith("APT-")
        ? APTITUDE_PROGRESS_STORAGE_KEY
        : PRACTICE_PROGRESS_STORAGE_KEY;

    recordPracticeAttempt({
      storageKey: targetStorageKey,
      question,
      evaluation,
      correct: evaluation?.correct === true,
      type: answerRecord?.type || question?.type || "",
      input: payload,
      submittedAt: submittedAt.toISOString(),
      durationMs: submittedAt.getTime() - questionOpenedAtRef.current,
      progressStorageKey,
    });
    enqueueChange("SOLVE", {
      questionUid: targetStorageKey,
      evaluation,
      submittedAt: submittedAt.toISOString(),
    });
  }, [
    isInteractive,
    answerRecord,
    mcqSelection,
    msqSelection,
    natInput,
    isSolved,
    questionProgressId,
    toggleSolved,
    question,
    storageKey,
  ]);

  const triggerHaptic = (duration = 15) => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(duration);
      } catch (_) {}
    }
  };

  const handleToggleSolved = useCallback(() => {
    if (isStatusActionDisabled) return;
    triggerHaptic();
    toggleSolved(question);
  }, [isStatusActionDisabled, question, toggleSolved]);

  const handleToggleBookmark = useCallback(() => {
    if (isStatusActionDisabled) return;
    triggerHaptic();
    toggleBookmark(question);
  }, [isStatusActionDisabled, question, toggleBookmark]);

  const handleMcqSelect = (option) => {
    triggerHaptic();
    setMcqSelection(option);
    setResult(null);
  };

  const handleMsqToggle = (option, checked) => {
    triggerHaptic();
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

  // --- Toast State ---
  const [toastMessage, setToastMessage] = useState("Link copied!");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg = "Link copied!") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const reportIssueUrl = useMemo(() => {
    const questionUid = String(question.question_uid || questionProgressId || "").trim() || "unknown-question";
    const yearLabel = String(question.exam?.label || question.yearSetLabel || question.year || "Unknown").trim();
    const subjectLabel = String(question.subjectLabel || question.subject || "Unknown").trim();
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const issueBody = [
      `Question UID: ${questionUid}`,
      `Year/Set: ${yearLabel}`,
      `Subject: ${subjectLabel}`,
      `Page: ${pageUrl}`,
    ].join("\n");
    const params = new URLSearchParams({
      "entry.176806537": issueBody,
    });
    return `https://docs.google.com/forms/d/e/1FAIpQLSdSuxChEW-ndNaochXNbSj6FZ02xcxTkjTAECc-Ggeqn6ddkg/viewform?usp=pp_url&${params.toString()}`;
  }, [question, questionProgressId]);

  const fallbackCopyToClipboard = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (_) {
      // Silently fail
    }
    document.body.removeChild(textarea);
  };

  const handleShare = useCallback(async () => {
    const questionId = question.question_uid || "";
    if (!questionId) return;

    const solvePath = buildSolvePath(questionId);
    const url = `${window.location.origin}${solvePath}`;
    const shareTitle = question.title || `GATE Question ${questionId}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: "Practice this GATE question on GateQA:",
          url,
        });
        trackEvent("share_question_native", { question_uid: questionId });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    const triggerShareToast = () => {
      showToast("Link copied!");
      trackEvent("share_question", { question_uid: questionId });
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(url).then(triggerShareToast).catch(() => {
        fallbackCopyToClipboard(url);
        triggerShareToast();
      });
    } else {
      fallbackCopyToClipboard(url);
      triggerShareToast();
    }
  }, [question, showToast]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isEditableTarget(event.target)) {
        if (event.key === "Enter" && event.target.tagName === "INPUT" && isInteractive && hasValidInput) {
          event.preventDefault();
          evaluateSubmission();
        }
        return;
      }

      if (shouldIgnorePlainShortcut(event)) {
        return;
      }

      const shortcutKey = getShortcutKey(event);

      if (shortcutKey === "s") {
        event.preventDefault();
        if (isInteractive && hasValidInput) {
          evaluateSubmission();
        }
        return;
      }

      if (shortcutKey === "m") {
        event.preventDefault();
        if (!isStatusActionDisabled) {
          handleToggleSolved();
        }
        return;
      }

      if (shortcutKey === "b") {
        event.preventDefault();
        if (!isStatusActionDisabled) {
          handleToggleBookmark();
        }
        return;
      }

      if (shortcutKey === "l") {
        event.preventDefault();
        handleShare();
        return;
      }

      if (answerRecord && answerRecord.type === "MCQ") {
        const keyIndex = ["1", "2", "3", "4"].indexOf(shortcutKey);
        if (keyIndex !== -1 && keyIndex < answerOptions.length) {
          event.preventDefault();
          handleMcqSelect(answerOptions[keyIndex]);
        }
      }

      if (answerRecord && answerRecord.type === "MSQ") {
        const keyIndex = ["1", "2", "3", "4"].indexOf(shortcutKey);
        if (keyIndex !== -1 && keyIndex < answerOptions.length) {
          event.preventDefault();
          const opt = answerOptions[keyIndex];
          handleMsqToggle(opt, !msqSelection.includes(opt));
        }
      }

      if (isTrueFalse) {
        if (shortcutKey === "1" || shortcutKey === "t") {
          event.preventDefault();
          setNatInput("1");
          setResult(null);
        } else if (shortcutKey === "0" || shortcutKey === "f") {
          event.preventDefault();
          setNatInput("0");
          setResult(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    answerRecord,
    answerOptions,
    evaluateSubmission,
    handleShare,
    handleToggleBookmark,
    handleToggleSolved,
    hasValidInput,
    isInteractive,
    isStatusActionDisabled,
    isTrueFalse,
    msqSelection,
  ]);

  // --- Render Logic for Input Section ---
  const renderInputSection = () => {
    if (!questionIdentity.hasIdentity) {
      return (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-900 dark:text-amber-200">
          Missing question identity.
        </div>
      );
    }

    if (!answerRecord) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4 text-amber-950 dark:text-amber-100">
          <p className="text-sm font-semibold">Answer unavailable</p>
          <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">
            This question does not have a verified answer in the current bank yet. You can still bookmark it, share it, or report the gap for review.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={reportIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center rounded-xl border border-amber-300 bg-[color:var(--color-surface)] px-4 py-2 text-sm font-semibold text-amber-900 dark:text-amber-200 transition hover:bg-amber-100 dark:hover:bg-amber-950/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Report this question
            </a>
          </div>
        </div>
      );
    }

    if (["UNSUPPORTED", "SUBJECTIVE", "AMBIGUOUS"].includes(answerRecord.type)) {
      let colorClass = "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)]";
      let message = "Refer to standard solution.";

      if (answerRecord.type === "UNSUPPORTED") {
        colorClass = "border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200";
        message = "Non-standard format.";
      } else if (answerRecord.type === "SUBJECTIVE") {
        colorClass = "border-purple-300 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200";
        message = "Subjective answer.";
      } else if (answerRecord.type === "AMBIGUOUS") {
        colorClass = "border-orange-300 bg-orange-50 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200";
        message = "Ambiguous question.";
      }

      return (
        <div className={`rounded-xl border p-3 ${colorClass}`}>
          <div className="text-sm font-medium">{message}</div>
        </div>
      );
    }

    // Standard Interaction (MCQ, MSQ, NAT)
    return (
      <div className="flex flex-col gap-3">
        {/* Question Type Badge */}
        <div className="flex">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
              answerRecord.type === "NAT"
                ? "bg-[color:var(--color-purple-soft)] text-[color:var(--color-purple-text)] ring-[color:var(--color-purple-border)]"
                : answerRecord.type === "MSQ"
                ? "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning-text)] ring-[color:var(--color-warning-border)]"
                : "bg-[color:var(--color-info-soft)] text-[color:var(--color-info-text)] ring-[color:var(--color-info-border)]"
            }`}
          >
            {answerRecord.type}
          </span>
        </div>

        {/* Input Interface */}
        <div className="w-full">
          {answerRecord.type === "MCQ" && (
            <div className="flex flex-wrap gap-2">
              {answerOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleMcqSelect(option)}
                  className={`flex-1 min-h-[44px] rounded-xl border px-3 py-2 text-center text-sm font-medium transition ${
                    mcqSelection === option
                      ? "border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold ring-2 ring-sky-500/20"
                      : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {answerRecord.type === "MSQ" && (
            <div className="flex flex-wrap gap-2">
              {answerOptions.map((option) => (
                <label
                  key={option}
                  className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl border px-3 py-2 cursor-pointer transition ${
                    msqSelection.includes(option)
                      ? "border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold ring-2 ring-sky-500/20"
                      : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)]"
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
              {isTrueFalse ? (
                <div className="flex gap-2">
                  {[
                    { label: "TRUE", value: "1" },
                    { label: "FALSE", value: "0" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setNatInput(option.value);
                        setResult(null);
                      }}
                      className={`flex-1 min-h-[44px] rounded-xl border px-3 py-2 text-center text-sm font-medium transition ${
                        natInput === option.value
                          ? "border-sky-600 bg-sky-600 text-white font-semibold"
                          : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={natInput}
                  onChange={handleNatChange}
                  placeholder="Enter numeric answer"
                  aria-keyshortcuts="Enter"
                  className="w-full min-h-[44px] rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 text-base sm:text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}
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
      className={`min-h-[44px] px-6 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center ${
        !isInteractive || !hasValidInput
          ? "border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] cursor-not-allowed opacity-60"
          : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"
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
      className={`min-h-[44px] px-6 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center ${
        !canMoveNext || typeof onNextQuestion !== "function"
          ? "border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] bg-[color:var(--color-surface-muted)] opacity-50 cursor-not-allowed"
          : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"
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
      className={`min-h-[44px] px-6 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center ${
        !canMovePrevious
          ? "border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] bg-[color:var(--color-surface-muted)] opacity-50 cursor-not-allowed"
          : "border border-[color:var(--color-border)] text-[color:var(--color-text)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-muted)]"
      } ${additionalClasses}`}
    >
      &larr; Previous
    </button>
  );

  const renderSolutionButton = (additionalClasses = "") => {
    const isSpecialAptitude = isSpecialAptitudeQuestion(question);
    const fallbackSearchLink = !isSpecialAptitude && !solutionLink && question?.title
      ? `https://gateoverflow.in/?qa=search&q=${encodeURIComponent(question.title)}`
      : null;
    const targetLink = solutionLink || fallbackSearchLink;

    if (targetLink) {
      return (
        <a
          href={targetLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`min-h-[44px] px-6 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)] font-bold text-sm shadow-sm hover:bg-[color:var(--color-surface)] transition flex items-center justify-center ${additionalClasses}`}
        >
          Solution
        </a>
      );
    }
    return (
      <button
        type="button"
        disabled
        aria-label="Solution unavailable"
        title="Solution unavailable"
        className={`min-h-[44px] px-6 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] font-bold text-sm shadow-sm flex items-center justify-center cursor-not-allowed opacity-50 ${additionalClasses}`}
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
        className={`w-11 h-11 rounded-full border-2 transition duration-150 flex items-center justify-center hover:scale-105 ${
          isStatusActionDisabled
            ? "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] cursor-not-allowed opacity-50"
            : isSolved
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
            : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:border-emerald-300 hover:text-emerald-500"
        }`}
      >
        <FaCheck className="text-[18px]" />
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
        className={`w-11 h-11 rounded-full border-2 transition duration-150 flex items-center justify-center hover:scale-105 ${
          isStatusActionDisabled
            ? "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] cursor-not-allowed opacity-50"
            : isBookmarked
            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shadow-sm"
            : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:border-amber-300 hover:text-amber-500"
        }`}
      >
        {isBookmarked ? <FaStar className="text-[18px]" /> : <FaRegStar className="text-[18px]" />}
      </button>

      {/* 4. Share */}
      <button
        type="button"
        onClick={handleShare}
        title="Share Question Link"
        aria-label="Copy question link"
        aria-keyshortcuts="L"
        className="w-11 h-11 rounded-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] transition duration-150 flex items-center justify-center hover:scale-105 hover:border-sky-300 hover:text-sky-600 dark:hover:text-sky-400"
      >
        <FaLink className="text-[18px]" />
      </button>

      <a
        href={reportIssueUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Report a bad question"
        aria-label="Report a bad question via Google Form"
        className="w-11 h-11 rounded-full border-2 border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-400 hover:border-rose-300 hover:text-rose-600 transition duration-150 flex items-center justify-center hover:scale-105"
      >
        <FaFlag className="text-[16px]" />
      </a>
    </div>
  );

  return (
    <div className="mt-6 border-t border-[color:var(--color-border)] pt-6">
      <div className="mb-6">
        {renderInputSection()}

        {result && (
          <div
            role="alert"
            aria-live="assertive"
            className={`mt-3 rounded-xl p-3 text-center text-sm font-semibold border ${
              result.correct
                ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300"
            }`}
          >
            {result.status === "invalid_input" ? "Invalid Input" : result.correct ? "Correct!" : "Incorrect"}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-[color:var(--color-border)] px-2 pt-4">
        <div className="hidden items-center justify-between md:flex">
          <div className="flex items-center gap-2">
            {renderSubmitButton()}
            {renderIconTray()}
          </div>
          <div className="flex items-center gap-2">
            {renderSolutionButton()}
            <AskAIButton question={question} onNotification={showToast} />
            {renderPreviousButton()}
            {renderNextButton()}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          <div>
            {renderSubmitButton("w-full")}
          </div>

          <div className="grid w-full grid-cols-2 gap-2">
            {renderSolutionButton("w-full")}
            <AskAIButton question={question} onNotification={showToast} isMobile />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[color:var(--color-border)]">
            <button
              type="button"
              disabled={isStatusActionDisabled}
              onClick={handleToggleSolved}
              title={isSolved ? "Mark as Unsolved" : "Mark as Solved"}
              aria-label={isSolved ? "Mark question as unsolved" : "Mark question as solved"}
              aria-pressed={isSolved}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                isStatusActionDisabled
                  ? "border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] cursor-not-allowed opacity-50"
                  : isSolved
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
              }`}
            >
              <FaCheck className="text-xs" />
              <span>{isSolved ? "Solved" : "Mark Solved"}</span>
            </button>

            <a
              href={reportIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Report an issue with this question"
              aria-label="Report an issue via Google Form"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:text-rose-700 text-xs font-semibold transition"
            >
              <FaFlag className="text-xs" />
              <span>Report</span>
            </a>
          </div>
        </div>
      </div>

      {isStatusActionDisabled && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400 text-center">
          Progress status is unavailable for this question identifier.
        </p>
      )}

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
