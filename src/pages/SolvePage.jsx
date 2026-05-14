import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaStar } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PageShell from "../components/Layout/PageShell";
import Question from "../components/Question/Question";
import LoadingState from "../components/Loaders/LoadingState";
import CalculatorWidget from "../components/Calculator/CalculatorWidget";
import CalculatorButton from "../components/Calculator/CalculatorButton";
import { MathRuntimeProvider } from "../components/Math/MathRuntime";
import { useFilterActions, useFilterState } from "../contexts/FilterContext";
import { useSession } from "../contexts/SessionContext";
import { QuestionService } from "../services/QuestionService";
import { AptitudeQuestionService } from "../services/AptitudeQuestionService";
import { getShortcutKey, shouldIgnorePlainShortcut } from "../utils/keyboardShortcuts";
import { resolveHorizontalSwipeNavigation } from "../utils/mobileGestures";
import { buildSolvePath, parsePageParam, PRACTICE_ROUTE } from "../utils/routes";
import { writeLastSession } from "../utils/lastSession";

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
  const { getQuestionById, isQuestionSolved, isQuestionBookmarked } = useFilterActions();
  const {
    sessionMode,
    sessionQueue,
    showExhaustionBanner,
    dismissExhaustionBanner,
    startOrderedSession,
    setCurrentQuestionUid,
    getNavigationState,
    goToNextQuestion,
    goToPreviousQuestion,
  } = useSession();

  const indexedQuestion = useMemo(() => getQuestionById(questionUid), [getQuestionById, questionUid]);
  const isAptitudeQuestion = questionUid.startsWith("APT-");
  const activeSearch = location.search;
  const hasExploreContext = Boolean(activeSearch);
  const questionExistsInFilteredPool = filteredQuestions.some((question) => question.question_uid === questionUid);
  const navigationState = getNavigationState(questionUid);

  useEffect(() => {
    if (isAptitudeQuestion && isInitialized && !aptitudeEnabled) {
      navigate(PRACTICE_ROUTE, { replace: true });
    }
  }, [aptitudeEnabled, isAptitudeQuestion, isInitialized, navigate]);

  useEffect(() => {
    if (!isInitialized || !indexedQuestion) {
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

    if (sessionQueue.includes(questionUid)) {
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

    startOrderedSession([indexedQuestion], questionUid);
  }, [
    filteredQuestions,
    hasExploreContext,
    indexedQuestion,
    isInitialized,
    questionExistsInFilteredPool,
    questionUid,
    sessionMode,
    sessionQueue,
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

    const detailService = isAptitudeQuestion ? AptitudeQuestionService : questionService;
    detailService.ensureQuestionDetail(indexedQuestion)
      .then((questionDetail) => {
        if (!active) {
          return;
        }
        setResolvedQuestion(questionDetail);
      })
      .catch((detailError) => {
        if (!active) {
          return;
        }
        setQuestionDetailError(detailError.message || "Unable to load question detail.");
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

  useEffect(() => {
    if (!questionUid) {
      return;
    }

    writeLastSession({
      route: `${buildSolvePath(questionUid)}${activeSearch || ""}`,
      exploreSearch: activeSearch || "",
      resultPage: parsePageParam(activeSearch, 1),
      questionUid,
      mode: sessionMode || (hasExploreContext ? "ordered" : "direct"),
    });
  }, [activeSearch, hasExploreContext, questionUid, sessionMode]);

  const handleBackToResults = useCallback(() => {
    navigate({
      pathname: PRACTICE_ROUTE,
      search: activeSearch,
    });
  }, [activeSearch, navigate]);

  const handleGoPrevious = useCallback(() => {
    const previousQuestion = goToPreviousQuestion(questionUid);
    if (!previousQuestion?.question_uid) {
      return;
    }

    navigate({
      pathname: buildSolvePath(previousQuestion.question_uid),
      search: activeSearch,
    });
  }, [activeSearch, goToPreviousQuestion, navigate, questionUid]);

  const handleGoNext = useCallback(() => {
    const nextQuestion = goToNextQuestion(questionUid);
    if (!nextQuestion?.question_uid) {
      return;
    }

    navigate({
      pathname: buildSolvePath(nextQuestion.question_uid),
      search: activeSearch,
    });
  }, [activeSearch, goToNextQuestion, navigate, questionUid]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const shortcutKey = getShortcutKey(event);

      if ((event.ctrlKey || event.metaKey) && shortcutKey === "k") {
        event.preventDefault();
        setIsCalculatorOpen((previous) => !previous);
        return;
      }

      if (event.key === "Escape") {
        setIsCalculatorOpen(false);
        return;
      }

      if (shouldIgnorePlainShortcut(event)) {
        return;
      }

      if (event.key === "ArrowLeft" && navigationState.canGoPrevious) {
        event.preventDefault();
        handleGoPrevious();
        return;
      }

      if (event.key === "ArrowRight" && navigationState.canGoNext) {
        event.preventDefault();
        handleGoNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGoNext, handleGoPrevious, navigationState.canGoNext, navigationState.canGoPrevious]);

  const retryCurrentQuestionDetail = () => {
    setQuestionDetailRequestNonce((value) => value + 1);
  };

  const handleQuestionTouchStart = useCallback((event) => {
    const touch = event.touches?.[0];
    if (!touch) {
      touchStartRef.current = null;
      return;
    }

    const interactiveTarget = event.target instanceof Element
      ? event.target.closest("button, a, input, textarea, select, label")
      : null;

    if (interactiveTarget) {
      touchStartRef.current = null;
      return;
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }, []);

  const handleQuestionTouchEnd = useCallback((event) => {
    const startPoint = touchStartRef.current;
    touchStartRef.current = null;

    const touch = event.changedTouches?.[0];
    if (!startPoint || !touch) {
      return;
    }

    const navigationIntent = resolveHorizontalSwipeNavigation({
      startX: startPoint.x,
      startY: startPoint.y,
      endX: touch.clientX,
      endY: touch.clientY,
    });

    if (navigationIntent === "next") {
      handleGoNext();
      return;
    }

    if (navigationIntent === "previous") {
      handleGoPrevious();
    }
  }, [handleGoNext, handleGoPrevious]);

  const questionYearLabel = resolvedQuestion?.exam?.label || indexedQuestion?.yearSetLabel || "Unknown";
  const questionSubjectLabel = resolvedQuestion?.subjectLabel
    || indexedQuestion?.subjectLabel
    || questionService.getSubjectLabelBySlug(resolvedQuestion?.subjectSlug || indexedQuestion?.subjectSlug || "");
  const questionType = String(resolvedQuestion?.type || indexedQuestion?.type || "unknown").trim().toUpperCase() || "UNKNOWN";
  const isSolved = resolvedQuestion ? isQuestionSolved(resolvedQuestion) : indexedQuestion ? isQuestionSolved(indexedQuestion) : false;
  const isBookmarked = resolvedQuestion ? isQuestionBookmarked(resolvedQuestion) : indexedQuestion ? isQuestionBookmarked(indexedQuestion) : false;
  const navigationSummary = navigationState.total > 0
    ? `${navigationState.index + 1} of ${navigationState.total}`
    : "Standalone";
  const navigationContextLabel = sessionMode === "random"
    ? "Random practice session"
    : hasExploreContext
      ? "Ordered result flow"
      : "Direct question link";
  const heroMetaChips = (
    <>
      <span className="rounded-full bg-[color:var(--color-neutral-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-neutral-text)]">
        {questionYearLabel}
      </span>
      <span className="rounded-full bg-[color:var(--color-info-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-info-text)]">
        {questionSubjectLabel}
      </span>
      <span className="rounded-full bg-[color:var(--color-purple-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-purple-text)]">
        {questionType}
      </span>
      {isSolved ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          <FaCheckCircle className="text-emerald-600" />
          Solved
        </span>
      ) : null}
      {isBookmarked ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
          <FaStar className="text-amber-500" />
          Saved
        </span>
      ) : null}
    </>
  );

  return (
    <MathRuntimeProvider>
      <PageShell onResume={hasResumeRoute ? onResumePractice : null} resumeLabel="Continue">
        <section className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3.5 shadow-[var(--shadow-card)] sm:px-5 sm:py-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBackToResults}
                    className="inline-flex min-h-[38px] items-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back to Results
                  </button>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Solve</p>
                  {heroMetaChips}
                </div>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-[clamp(1.9rem,2.7vw,2.85rem)] font-semibold leading-tight text-[color:var(--color-text)]">
                      {resolvedQuestion?.title || indexedQuestion?.title || "Loading question"}
                    </h1>
                    {(navigationState.canGoPrevious || navigationState.canGoNext) ? (
                      <p className="mt-2 text-sm text-[color:var(--color-text-muted)] md:hidden">
                        Swipe left or right on the question card to move through this session.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-end gap-2 lg:pt-0.5">
                <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-right sm:min-w-[188px]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">{navigationContextLabel}</p>
                    <p className="text-sm font-semibold text-[color:var(--color-text)]">
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
            <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10 shadow-[var(--shadow-card)]">
              <LoadingState
                label="Loading Solve page..."
                size="lg"
                className="min-h-[320px]"
                textClassName="text-sm text-slate-500"
              />
            </div>
          ) : !indexedQuestion ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10 text-center shadow-[var(--shadow-soft)]">
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
            <div className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10 shadow-[var(--shadow-card)]">
              <LoadingState
                label="Loading question detail..."
                size="lg"
                className="min-h-[320px]"
                textClassName="text-sm text-slate-500"
              />
            </div>
          ) : (
            <div onTouchStart={handleQuestionTouchStart} onTouchEnd={handleQuestionTouchEnd}>
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
      </PageShell>
    </MathRuntimeProvider>
  );
};

export default SolvePage;
