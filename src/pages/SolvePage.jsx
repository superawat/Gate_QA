import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaStar } from "react-icons/fa";
import { SITE_URL } from "../constants/siteConfig";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PageShell from "../components/Layout/PageShell";
import SEOHead, { buildBreadcrumbSchema, buildQAPageSchema } from "../components/SEO/SEOHead";
import Question from "../components/Question/Question";
import LoadingState from "../components/Loaders/LoadingState";
import CalculatorWidget from "../components/Calculator/CalculatorWidget";
import CalculatorButton from "../components/Calculator/CalculatorButton";
import MobileSolveActionBar from "../components/Practice/MobileSolveActionBar";
import { MathRuntimeProvider } from "../components/Math/MathRuntime";
import { useFilterActions, useFilterState } from "../contexts/FilterContext";
import { useSession } from "../contexts/SessionContext";
import { QuestionService } from "../services/QuestionService";
import { DaQuestionService } from "../services/DaQuestionService";
import { AptitudeQuestionService } from "../services/AptitudeQuestionService";
import { getShortcutKey, shouldIgnorePlainShortcut } from "../utils/keyboardShortcuts";
import { resolveHorizontalSwipeNavigation } from "../utils/mobileGestures";
import { buildSolvePath, parsePageParam, PRACTICE_ROUTE } from "../utils/routes";
import { writeLastSession } from "../utils/lastSession";
import { getDisplayQuestionTypeLabel } from "../utils/questionType";
import { isDaQuestion as isDaQuestionByMetadata } from "../utils/examTrack";

const isUnavailableQuestionDetailError = (error) => (
  /question detail missing|not available in the current index/i.test(String(error?.message || error || ""))
);
const isDaQuestion = (question = {}) => isDaQuestionByMetadata(question);

const SolvePage = ({
  loading,
  error,
  loadQuestions,
  hasResumeRoute,
  onResumePractice,
}) => {
  const { questionUid: rawQuestionUid = "" } = useParams();
  const questionUid = decodeURIComponent(rawQuestionUid);
  const location = useLocation();
  const navigate = useNavigate();
  const calculatorButtonRef = useRef(null);
  const touchStartRef = useRef(null);

  const [resolvedQuestion, setResolvedQuestion] = useState(null);
  const [questionDetailError, setQuestionDetailError] = useState("");
  const [isQuestionDetailLoading, setIsQuestionDetailLoading] = useState(false);
  const [questionDetailRequestNonce, setQuestionDetailRequestNonce] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const {
    filteredQuestions,
    isInitialized,
    questionService = QuestionService,
    aptitudeEnabled = false,
    aptitudeLoading = false,
  } = useFilterState();
  const { getQuestionById, isQuestionSolved, isQuestionBookmarked, toggleBookmark, getQuestionProgressId } = useFilterActions();
  const {
    sessionMode,
    sessionQueue,
    sourceQuestionUids = [],
    showExhaustionBanner,
    dismissExhaustionBanner,
    startOrderedSession,
    setCurrentQuestionUid,
    getNavigationState,
    goToNextQuestion,
    goToPreviousQuestion,
    removeQuestionFromSession,
  } = useSession();

  const indexedQuestion = useMemo(() => getQuestionById(questionUid), [getQuestionById, questionUid]);
  const isAptitudeQuestion = questionUid.startsWith("APT-");
  const activeSearch = location.search;
  const hasExploreContext = Boolean(activeSearch);
  const questionExistsInFilteredPool = filteredQuestions.some((question) => question.question_uid === questionUid);
  const navigationState = useMemo(() => getNavigationState(questionUid), [getNavigationState, questionUid]);
  const sessionContainsQuestion = sessionQueue.includes(questionUid);
  const sessionSourceMatchesFilteredPool = useMemo(() => {
    if (!hasExploreContext || sourceQuestionUids.length === 0 || filteredQuestions.length === 0) {
      return false;
    }

    if (sourceQuestionUids.length !== filteredQuestions.length) {
      return false;
    }

    const filteredUidSet = new Set(filteredQuestions.map((question) => question.question_uid));
    return sourceQuestionUids.every((uid) => filteredUidSet.has(uid));
  }, [filteredQuestions, hasExploreContext, sourceQuestionUids]);

  useEffect(() => {
    if (isAptitudeQuestion && isInitialized && !aptitudeEnabled) {
      navigate(PRACTICE_ROUTE, { replace: true });
    }
  }, [aptitudeEnabled, isAptitudeQuestion, isInitialized, navigate]);

  useEffect(() => {
    if (!isInitialized || !indexedQuestion) {
      return;
    }

    if (sessionContainsQuestion && sessionMode === "random" && (!hasExploreContext || sessionSourceMatchesFilteredPool)) {
      setCurrentQuestionUid(questionUid);
      return;
    }

    if (hasExploreContext && questionExistsInFilteredPool) {
      const shouldRefreshOrderedSession = sessionMode !== "ordered"
        || sessionQueue.length !== filteredQuestions.length
        || sessionQueue[0] !== filteredQuestions[0]?.question_uid
        || sessionQueue[sessionQueue.length - 1] !== filteredQuestions[filteredQuestions.length - 1]?.question_uid;

      if (shouldRefreshOrderedSession) {
        startOrderedSession(filteredQuestions, questionUid);
        return;
      }
    }

    if (sessionContainsQuestion) {
      setCurrentQuestionUid(questionUid);
      return;
    }

    // When the question exists in the filtered pool but we lack explore context
    // (e.g. hard refresh stripped URL params), use the full filtered set so the
    // session queue has proper prev/next navigation instead of a dead-end.
    if (questionExistsInFilteredPool && filteredQuestions.length > 1) {
      startOrderedSession(filteredQuestions, questionUid);
      return;
    }

    // When opening a question directly without active explore filters, seed the session
    // with all questions from the same exam paper/set cohort or allQuestions so the student
    // has a multi-question solve queue rather than a single-item dead-end.
    const activeService = isDaQuestion(indexedQuestion)
      ? DaQuestionService
      : isAptitudeQuestion
        ? AptitudeQuestionService
        : questionService;

    const paperQuestions = typeof activeService?.getQuestionsByYearSet === "function"
      && (indexedQuestion.yearSetKey || indexedQuestion.exam?.year)
      ? activeService.getQuestionsByYearSet(indexedQuestion.yearSetKey || indexedQuestion.exam?.year)
      : [];

    const seedQuestions = paperQuestions.length > 1
      ? paperQuestions
      : filteredQuestions.length > 1
        ? filteredQuestions
        : [indexedQuestion];

    startOrderedSession(seedQuestions, questionUid);
  }, [
    filteredQuestions,
    hasExploreContext,
    indexedQuestion,
    isAptitudeQuestion,
    isInitialized,
    questionExistsInFilteredPool,
    questionService,
    questionUid,
    sessionContainsQuestion,
    sessionMode,
    sessionQueue,
    sessionSourceMatchesFilteredPool,
    setCurrentQuestionUid,
    startOrderedSession,
  ]);

  useEffect(() => {
    if (!indexedQuestion || !questionUid) {
      setResolvedQuestion(null);
      setQuestionDetailError("");
      setIsQuestionDetailLoading(false);
      return;
    }

    if (indexedQuestion.question && String(indexedQuestion.question).trim()) {
      setResolvedQuestion(indexedQuestion);
      setQuestionDetailError("");
      setIsQuestionDetailLoading(false);
      return;
    }

    let active = true;
    setResolvedQuestion(null);
    setQuestionDetailError("");
    setIsQuestionDetailLoading(true);

    const detailService = isDaQuestion(indexedQuestion)
      ? DaQuestionService
      : isAptitudeQuestion
        ? AptitudeQuestionService
        : questionService;

    detailService
      .ensureQuestionDetail(indexedQuestion)
      .then((questionDetail) => {
        if (!active) {
          return;
        }
        setResolvedQuestion(questionDetail || indexedQuestion);
        setQuestionDetailError("");
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        if (isUnavailableQuestionDetailError(err)) {
          setResolvedQuestion(indexedQuestion);
          setQuestionDetailError("");
        } else {
          setResolvedQuestion(null);
          setQuestionDetailError(err?.message || "Failed to load question detail");
        }
      })
      .finally(() => {
        if (active) {
          setIsQuestionDetailLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [indexedQuestion, isAptitudeQuestion, questionDetailRequestNonce, questionService, questionUid]);

  const navigateToQuestion = useCallback((targetQuestionUid) => {
    if (!targetQuestionUid) {
      return;
    }

    const nextPath = buildSolvePath(targetQuestionUid);
    navigate(
      {
        pathname: nextPath,
        search: activeSearch,
      },
      {
        state: location.state,
      }
    );
  }, [activeSearch, location.state, navigate]);

  const handleGoPrevious = useCallback(() => {
    const previous = goToPreviousQuestion(questionUid);
    const targetUid = typeof previous === "string" ? previous : previous?.question_uid;
    if (targetUid) {
      navigateToQuestion(targetUid);
    }
  }, [goToPreviousQuestion, navigateToQuestion, questionUid]);

  const handleGoNext = useCallback(() => {
    const next = goToNextQuestion(questionUid);
    const targetUid = typeof next === "string" ? next : next?.question_uid;
    if (targetUid) {
      navigateToQuestion(targetUid);
    }
  }, [goToNextQuestion, navigateToQuestion, questionUid]);

  const handleBackToResults = useCallback(() => {
    const parsedPage = parsePageParam(activeSearch);
    navigate(
      {
        pathname: PRACTICE_ROUTE,
        search: activeSearch,
      },
      {
        state: {
          fromQuestionUid: questionUid,
          fromPage: parsedPage,
          preservePage: true,
        },
      }
    );
  }, [activeSearch, navigate, questionUid]);

  const retryCurrentQuestionDetail = useCallback(() => {
    setQuestionDetailRequestNonce((previous) => previous + 1);
  }, []);

  const activeQuestion = resolvedQuestion || indexedQuestion;
  const activeProgressId = activeQuestion ? (typeof getQuestionProgressId === "function" ? getQuestionProgressId(activeQuestion) : activeQuestion.question_uid) : null;
  const isTargetBookmarked = activeProgressId ? isQuestionBookmarked(activeProgressId) : false;

  const handleMobileToggleBookmark = useCallback(() => {
    if (activeQuestion && toggleBookmark) {
      toggleBookmark(activeQuestion);
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try { navigator.vibrate(15); } catch (_) {}
      }
    }
  }, [activeQuestion, toggleBookmark]);

  const handleMobileShare = useCallback(async () => {
    const targetUid = activeQuestion?.question_uid || questionUid;
    if (!targetUid) return;

    const solvePath = buildSolvePath(targetUid);
    const url = `${window.location.origin}${solvePath}`;
    const shareTitle = activeQuestion?.title || `GATE Question ${targetUid}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: "Practice this GATE question on GateQA:",
          url,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      void navigator.clipboard.writeText(url);
    }
  }, [activeQuestion?.question_uid, activeQuestion?.title, questionUid]);

  useEffect(() => {
    if (typeof window === "undefined" || !questionUid) {
      return;
    }

    writeLastSession({
      route: `${buildSolvePath(questionUid)}${activeSearch}`,
      label: `Question ${questionUid}`,
      timestamp: Date.now(),
    });
  }, [activeSearch, questionUid]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (shouldIgnorePlainShortcut(event)) {
        return;
      }

      const shortcutKey = getShortcutKey(event);

      if (shortcutKey === "j" || shortcutKey === "ArrowDown") {
        event.preventDefault();
        window.scrollBy({ top: 120, behavior: "smooth" });
        return;
      }

      if (shortcutKey === "k" || shortcutKey === "ArrowUp") {
        event.preventDefault();
        window.scrollBy({ top: -120, behavior: "smooth" });
        return;
      }

      if (shortcutKey === "c") {
        event.preventDefault();
        setIsCalculatorOpen((previous) => !previous);
        return;
      }

      if (shortcutKey === "n" || shortcutKey === "ArrowRight") {
        event.preventDefault();
        if (navigationState.canGoNext) {
          handleGoNext();
        }
        return;
      }

      if (shortcutKey === "p" || shortcutKey === "ArrowLeft") {
        event.preventDefault();
        if (navigationState.canGoPrevious) {
          handleGoPrevious();
        }
        return;
      }

      if (shortcutKey === "Escape" && isCalculatorOpen) {
        event.preventDefault();
        setIsCalculatorOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleGoNext,
    handleGoPrevious,
    isCalculatorOpen,
    navigationState.canGoNext,
    navigationState.canGoPrevious,
  ]);

  const handleQuestionTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleQuestionTouchEnd = (e) => {
    if (!touchStartRef.current || !e.changedTouches || e.changedTouches.length === 0) {
      return;
    }

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const action = resolveHorizontalSwipeNavigation({
      startX: touchStartRef.current.x,
      startY: touchStartRef.current.y,
      endX: touchEnd.x,
      endY: touchEnd.y,
      canGoNext: navigationState.canGoNext,
      canGoPrevious: navigationState.canGoPrevious,
    });

    touchStartRef.current = null;

    if (action === "NEXT") {
      handleGoNext();
    } else if (action === "PREVIOUS") {
      handleGoPrevious();
    }
  };

  const navigationSummary = useMemo(() => {
    if (navigationState.totalInQueue <= 0 || navigationState.currentIndex < 0) {
      return "Question details";
    }

    return `Question ${navigationState.currentIndex + 1} of ${navigationState.totalInQueue}`;
  }, [navigationState.currentIndex, navigationState.totalInQueue]);

  const navigationContextLabel = useMemo(() => {
    if (navigationState.mode === "ordered") {
      return "Current filtered queue";
    }

    return "Random session";
  }, [navigationState.mode]);

  const heroMetaChips = useMemo(() => {
    const targetQuestion = resolvedQuestion || indexedQuestion;
    if (!targetQuestion) {
      return null;
    }

    const chips = [];
    const questionProgressId = typeof getQuestionProgressId === "function" ? getQuestionProgressId(targetQuestion) : targetQuestion.question_uid;
    const isSolved = isQuestionSolved(questionProgressId);
    const isBookmarked = isQuestionBookmarked(questionProgressId);

    const yearSetText = targetQuestion.yearSetLabel
      || (targetQuestion.exam?.year
        ? `GATE ${targetQuestion.exam.year}${targetQuestion.exam.set ? ` Set ${targetQuestion.exam.set}` : ""}`
        : targetQuestion.year
          ? `GATE ${targetQuestion.year}`
          : "");

    if (yearSetText) {
      chips.push(
        <span
          key="year-set"
          className="inline-flex min-h-[28px] sm:min-h-[32px] items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2 sm:px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text)]"
        >
          {yearSetText}
        </span>
      );
    }

    const typeLabel = getDisplayQuestionTypeLabel(targetQuestion);
    if (typeLabel) {
      chips.push(
        <span
          key="type"
          className="inline-flex min-h-[28px] sm:min-h-[32px] items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2 sm:px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text)]"
        >
          {typeLabel}
        </span>
      );
    }

    const marksValue = targetQuestion.marks
      || targetQuestion.mark
      || targetQuestion.answer_meta?.marks
      || targetQuestion.answer_meta?.mark;

    if (marksValue) {
      chips.push(
        <span
          key="marks"
          className="inline-flex min-h-[28px] sm:min-h-[32px] items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2 sm:px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text)]"
        >
          {marksValue} {Number(marksValue) === 1 ? "Mark" : "Marks"}
        </span>
      );
    }

    const subjectLabel = targetQuestion.subjectLabel || targetQuestion.subject;
    if (subjectLabel) {
      chips.push(
        <span
          key="subject"
          className="inline-flex min-h-[28px] sm:min-h-[32px] items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2 sm:px-2.5 py-1 text-xs font-semibold text-[color:var(--color-text)]"
        >
          {subjectLabel}
        </span>
      );
    }

    if (isSolved) {
      chips.push(
        <span
          key="solved"
          className="inline-flex min-h-[28px] sm:min-h-[32px] items-center gap-1 rounded-lg border border-[color:var(--color-success-border)] bg-[color:var(--color-success-soft)] px-2 sm:px-2.5 py-1 text-xs font-semibold text-[color:var(--color-success-text)]"
        >
          <FaCheckCircle className="text-[color:var(--color-success-text)]" />
          Solved
        </span>
      );
    }

    if (isBookmarked) {
      chips.push(
        <span
          key="bookmarked"
          className="inline-flex min-h-[28px] sm:min-h-[32px] items-center gap-1 rounded-lg border border-[color:var(--color-warning-border)] bg-[color:var(--color-warning-soft)] px-2 sm:px-2.5 py-1 text-xs font-semibold text-[color:var(--color-warning-text)]"
        >
          <FaStar className="text-[color:var(--color-warning-text)]" />
          Bookmarked
        </span>
      );
    }

    return chips;
  }, [getQuestionProgressId, indexedQuestion, isQuestionBookmarked, isQuestionSolved, resolvedQuestion]);

  const questionSubjectLabel = resolvedQuestion?.subjectLabel || resolvedQuestion?.subject || indexedQuestion?.subjectLabel || indexedQuestion?.subject || "Computer Science";
  const questionYearLabel = resolvedQuestion?.yearSetLabel || (resolvedQuestion?.year ? `GATE ${resolvedQuestion.year}` : "") || indexedQuestion?.yearSetLabel || (indexedQuestion?.year ? `GATE ${indexedQuestion.year}` : "") || "GATE CSE";

  return (
    <MathRuntimeProvider>
      <SEOHead
        title={resolvedQuestion?.title
          ? `${resolvedQuestion.title} — ${questionSubjectLabel} — GATE Practice | GateQA`
          : indexedQuestion?.title
          ? `${indexedQuestion.title} — GATE Practice | GateQA`
          : `Question ${questionUid} — GATE Practice | GateQA`}
        description={resolvedQuestion?.question
          ? String(resolvedQuestion.question).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
          : "Practice GATE CS previous year questions with detailed solutions on GateQA."}
        path={`/practice/question/${encodeURIComponent(questionUid)}`}
        schemaOrg={resolvedQuestion ? [
          buildBreadcrumbSchema([
            { name: "Home", url: "https://gateqa.in/" },
            { name: questionSubjectLabel, url: `https://gateqa.in/practice?subjects=${encodeURIComponent(resolvedQuestion.subjectSlug)}` },
            { name: resolvedQuestion.title || questionUid, url: `https://gateqa.in/practice/question/${encodeURIComponent(questionUid)}` },
          ]),
          buildQAPageSchema({
            questionName: `${questionYearLabel} ${questionSubjectLabel} — ${resolvedQuestion.title || questionUid}`,
            questionText: String(resolvedQuestion.question || "GATE CS Question").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500),
            answerText: resolvedQuestion.answer_meta?.answer
              ? `Correct answer: Option ${resolvedQuestion.answer_meta.answer}`
              : "",
            url: `https://gateqa.in/practice/question/${encodeURIComponent(questionUid)}`,
          })
        ] : []}
      />
      <PageShell
        showMobileBottomNav={false}
        onResume={hasResumeRoute ? onResumePractice : null}
        resumeLabel="Continue"
      >
        <section className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2.5 shadow-[var(--shadow-card)] sm:px-5 sm:py-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBackToResults}
                    className="inline-flex min-h-[32px] sm:min-h-[38px] items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <FaArrowLeft className="mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Back to Results</span>
                  </button>
                  <p className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Solve</p>
                  {heroMetaChips}
                </div>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-[clamp(1.9rem,2.7vw,2.85rem)] font-bold sm:font-semibold leading-tight text-[color:var(--color-text)]">
                      {resolvedQuestion?.title || indexedQuestion?.title || "Loading question"}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 lg:items-start lg:justify-end lg:pt-0.5">
                <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2.5 py-1.5 sm:px-3 sm:py-2 text-right">
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <p className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">{navigationContextLabel}</p>
                    <p className="text-xs sm:text-sm font-semibold text-[color:var(--color-text)]">
                      {navigationSummary}
                    </p>
                  </div>
                </div>
                <CalculatorButton
                  ref={calculatorButtonRef}
                  onClick={() => setIsCalculatorOpen((previous) => !previous)}
                  isOpen={isCalculatorOpen}
                />
              </div>
            </div>
          </div>

          <CalculatorWidget
            isOpen={isCalculatorOpen}
            onClose={() => setIsCalculatorOpen(false)}
            anchorRef={calculatorButtonRef}
          />

          {showExhaustionBanner ? (
            <div
              className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 shadow-[var(--shadow-soft)]"
              role="status"
              aria-live="polite"
            >
              <span>
                You&apos;ve reached the end of this random session. A fresh shuffle is ready.
              </span>
              <button
                type="button"
                onClick={dismissExhaustionBanner}
                className="rounded-lg px-2 py-1 font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[var(--radius-card)] border border-rose-200 bg-rose-50 p-6 text-center shadow-[var(--shadow-soft)]">
              <p className="text-sm font-medium text-rose-800">{error}</p>
              <button
                type="button"
                onClick={() => loadQuestions()}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
              >
                Retry
              </button>
            </div>
          ) : (loading && !isInitialized) || (isAptitudeQuestion && aptitudeEnabled && aptitudeLoading && !indexedQuestion) ? (
            <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-10 shadow-[var(--shadow-card)]">
              <LoadingState
                label="Loading Solve page..."
                size="lg"
                className="min-h-[320px]"
                textClassName="text-sm text-slate-500"
              />
            </div>
          ) : !indexedQuestion ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-10 text-center shadow-[var(--shadow-soft)]">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Question not found.</h2>
              <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
                This question UID is not available in the current index. Try going back to Explore and opening another result.
              </p>
            </div>
          ) : questionDetailError ? (
            <div className="rounded-[var(--radius-card)] border border-rose-200 bg-rose-50 p-6 text-center shadow-[var(--shadow-soft)]">
              <p className="text-sm font-medium text-rose-800">{questionDetailError}</p>
              <button
                type="button"
                onClick={retryCurrentQuestionDetail}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
              >
                Retry question
              </button>
            </div>
          ) : isQuestionDetailLoading || !resolvedQuestion ? (
            <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-10 shadow-[var(--shadow-card)]">
              <LoadingState
                label="Loading question detail..."
                size="lg"
                className="min-h-[320px]"
                textClassName="text-sm text-slate-500"
              />
            </div>
          ) : (
            <div
              onTouchStart={handleQuestionTouchStart}
              onTouchEnd={handleQuestionTouchEnd}
              key={resolvedQuestion.question_uid}
              className="animate-question-transition"
            >
              <Question
                question={resolvedQuestion}
                onNextQuestion={handleGoNext}
                onPreviousQuestion={handleGoPrevious}
                canGoPrevious={navigationState.canGoPrevious}
                canGoNext={navigationState.canGoNext}
              />
            </div>
          )}
        </section>

        {resolvedQuestion ? (
          <MobileSolveActionBar
            canGoPrevious={navigationState.canGoPrevious}
            canGoNext={navigationState.canGoNext}
            onPrevious={handleGoPrevious}
            onNext={handleGoNext}
            isBookmarked={isTargetBookmarked}
            onToggleBookmark={handleMobileToggleBookmark}
            onToggleCalculator={() => setIsCalculatorOpen((prev) => !prev)}
            isCalculatorOpen={isCalculatorOpen}
            onShare={handleMobileShare}
            navigationSummary={navigationSummary}
          />
        ) : null}
      </PageShell>
    </MathRuntimeProvider>
  );
};

export default SolvePage;
