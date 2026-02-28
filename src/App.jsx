import { MathJaxContext } from "better-react-mathjax";
import { useCallback, useEffect, useRef, useState } from "react";

import Header from "./components/Header/Header";
import Question from "./components/Question/Question";
import Footer from "./components/Footer/Footer";
import FilterModal from "./components/Filters/FilterModal";
import ActiveFilterChips from "./components/Filters/ActiveFilterChips";
import CalculatorWidget from "./components/Calculator/CalculatorWidget";
import HorizontalBarLoader from "./components/Loaders/HorizontalBarLoader";
import ModeSelectionPage from "./components/Landing/ModeSelectionPage";
import { FilterProvider, useFilterState, useFilterActions } from "./contexts/FilterContext";
import { SessionProvider, useSession } from "./contexts/SessionContext";
import { QuestionService } from "./services/QuestionService";
import { AnswerService } from "./services/AnswerService";
import { useGoatCounterSPA } from "./hooks/useGoatCounterSPA";

const LANDING_FILTER_KEYS = ["years", "subjects", "subtopics", "range", "types"];

const GateQAPracticeView = ({
  loading,
  error,
  loadQuestions,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  shouldOpenFilterOnEnter,
}) => {
  const { filteredQuestions, isInitialized, allQuestions } = useFilterState();
  const { getQuestionById } = useFilterActions();
  const {
    sessionQueue,
    advanceQueue,
    currentIndex,
    markSeen,
    markDeepLinkedQuestion,
    showExhaustionBanner,
    dismissExhaustionBanner,
  } = useSession();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const hasResolvedDeepLink = useRef(false);
  const hasIgnoredFirstQueueSync = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (shouldOpenFilterOnEnter.current) {
      setIsMobileFilterOpen(true);
      shouldOpenFilterOnEnter.current = false;
    }
  }, [setIsMobileFilterOpen, shouldOpenFilterOnEnter]);

  useEffect(() => {
    if (!loading && isInitialized) {
      if (currentQuestion || filteredQuestions.length === 0) {
        setIsInitializing(false);
      }
    }
  }, [loading, isInitialized, currentQuestion, filteredQuestions.length]);

  // Advance through the session queue instead of random picking
  const handleNextQuestion = useCallback(() => {
    const nextQ = advanceQueue();
    if (nextQ) {
      setCurrentQuestion(nextQ);
    }
  }, [advanceQueue]);

  // Deep-link: on init, resolve ?question=<id> to a real question
  useEffect(() => {
    if (!isInitialized || allQuestions.length === 0 || hasResolvedDeepLink.current) {
      return;
    }
    hasResolvedDeepLink.current = true;

    const params = new URLSearchParams(window.location.search);
    const questionId = params.get("question");
    const hasActiveFilterParams = [
      "years",
      "subjects",
      "topics",
      "subtopics",
      "types",
      "range",
      "hideSolved",
      "showOnlySolved",
      "showOnlyBookmarked",
    ].some((key) => {
      const value = params.get(key);
      return value !== null && String(value).trim() !== "";
    });

    if (questionId) {
      const found = getQuestionById(questionId);
      if (found) {
        const inCurrentPool = filteredQuestions.some((q) => q.question_uid === found.question_uid);
        if (inCurrentPool || (!hasActiveFilterParams && filteredQuestions.length === 0)) {
          setCurrentQuestion(found);
          // Mark the deep-linked question as seen so it goes to bucket 3 next time
          markDeepLinkedQuestion(found.question_uid);
          return;
        }
      }
    }

    // Fall back to first item in session queue if no deep-link or invalid ID
    if (!currentQuestion && sessionQueue.length > 0) {
      const firstUid = sessionQueue[0];
      const firstQ = filteredQuestions.find((q) => q.question_uid === firstUid);
      if (firstQ) {
        setCurrentQuestion(firstQ);
        markSeen(firstQ.question_uid);
      }
    }
  }, [
    isInitialized,
    allQuestions,
    filteredQuestions,
    getQuestionById,
    currentQuestion,
    sessionQueue,
    markSeen,
    markDeepLinkedQuestion,
  ]);

  // When session queue updates or index changes, sync the current question.
  // We check if the UID matches to prevent overwriting the current selection needlessly.
  useEffect(() => {
    if (isInitialized && sessionQueue.length > 0 && hasResolvedDeepLink.current) {
      const targetUid = sessionQueue[currentIndex];
      if (targetUid && targetUid !== currentQuestion?.question_uid) {
        // Deep-link preservation: If this is the very first queue generation on load,
        // and we ALREADY have a valid currentQuestion from deep linking, DO NOT overwrite it.
        if (!hasIgnoredFirstQueueSync.current) {
          hasIgnoredFirstQueueSync.current = true;
          if (currentQuestion) {
            // Wait to sync until the user navigates
            return;
          }
        }

        const targetQ = filteredQuestions.find((q) => q.question_uid === targetUid);
        if (targetQ) {
          setCurrentQuestion(targetQ);
          markSeen(targetUid);
        }
      }
    } else if (isInitialized && filteredQuestions.length === 0 && hasResolvedDeepLink.current) {
      if (currentQuestion !== null) {
        setCurrentQuestion(null);
      }
    }
  }, [sessionQueue, currentIndex, isInitialized, filteredQuestions, currentQuestion, markSeen]);

  // Validate current question against filtered list
  useEffect(() => {
    if (isInitialized && filteredQuestions.length > 0 && currentQuestion) {
      const isValid = filteredQuestions.some((q) => q.question_uid === currentQuestion.question_uid);

      if (!isValid) {
        // Current question no longer in filtered pool - pick first from queue
        if (sessionQueue.length > 0) {
          const firstQ = filteredQuestions.find((q) => q.question_uid === sessionQueue[0]);
          if (firstQ) {
            setCurrentQuestion(firstQ);
            markSeen(firstQ.question_uid);
            return;
          }
        }
        setCurrentQuestion(null);
      }
    } else if (isInitialized && filteredQuestions.length === 0 && currentQuestion) {
      setCurrentQuestion(null);
    }
  }, [isInitialized, filteredQuestions, currentQuestion, sessionQueue, markSeen]);

  useEffect(() => {
    if (!import.meta.env.DEV || !isInitialized || !currentQuestion) {
      return;
    }

    const inPool = filteredQuestions.some(
      (question) => question.question_uid === currentQuestion.question_uid
    );
    if (!inPool && filteredQuestions.length > 0) {
      // Dev assertion guardrail: current question must always come from filtered pool.
      console.error("[FilterInvariant] currentQuestion is outside filteredQuestions", {
        currentQuestionUid: currentQuestion.question_uid,
        filteredCount: filteredQuestions.length,
      });
    }
  }, [isInitialized, currentQuestion, filteredQuestions]);

  // Sync ?question=<id> into the URL whenever currentQuestion changes
  useEffect(() => {
    if (typeof window === "undefined" || !currentQuestion || !currentQuestion.question_uid) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("question", currentQuestion.question_uid);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [currentQuestion]);

  // Update window object for debug/external services
  useEffect(() => {
    if (typeof window === "undefined" || !currentQuestion) {
      return;
    }

    const identity = AnswerService.getQuestionIdentity(currentQuestion);
    const answer = AnswerService.getAnswerForQuestion(currentQuestion);
    window.__gateqa_q = currentQuestion;
    window.__gateqa_lookup = {
      identity,
      hasAnswer: !!answer,
      sourceUrl: QuestionService.sourceUrl,
      answersLoaded: AnswerService.loaded,
      answersByQuestionUidCount: Object.keys(
        AnswerService.answersByQuestionUid || {}
      ).length,
      answersByExamUidCount: Object.keys(AnswerService.answersByExamUid || {})
        .length,
    };
  }, [currentQuestion]);

  if (error) {
    return (
      <div className="grow flex flex-col items-center justify-center px-4 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={loadQuestions}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow relative">
      {/*
          UNIFIED FILTER UX:
          - Persistent sidebar removed.
          - Filters are controlled solely by the Header button opening FilterModal.
          - Main content is now full width/centered at all breakpoints.
      */}

      {/* Filter Modal (Controlled by Header button) */}
      <FilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full transition-all duration-300">
        <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full">
          <ActiveFilterChips />

          {/* Exhaustion Banner */}
          {showExhaustionBanner && !isInitializing && (
            <div
              className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm animate-fade-in"
              role="status"
            >
              <span>
                You&apos;ve seen all <strong>{filteredQuestions.length}</strong> question{filteredQuestions.length !== 1 ? "s" : ""} in this filter. Starting over with a fresh shuffle.
              </span>
              <button
                type="button"
                onClick={dismissExhaustionBanner}
                className="ml-2 rounded px-2 py-1 text-blue-600 hover:bg-blue-100 transition-colors"
                aria-label="Dismiss"
              >
                &times;
              </button>
            </div>
          )}

          {isInitializing ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <HorizontalBarLoader />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading questions...</p>
            </div>
          ) : currentQuestion ? (
            <Question
              question={currentQuestion}
              changeQuestion={handleNextQuestion}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                No questions match your filters.
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                Try adjusting your criteria or clearing some filters.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const GateQAContent = ({
  loading,
  error,
  loadQuestions,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  appView,
  setAppView,
  shouldOpenFilterOnEnter,
  hasPriorProgress,
}) => {
  const { allQuestions, isInitialized } = useFilterState();
  const { clearFilters } = useFilterActions();
  const hasResolvedAppView = useRef(false);

  useEffect(() => {
    if (!isInitialized || allQuestions.length === 0 || hasResolvedAppView.current) {
      return;
    }
    hasResolvedAppView.current = true;

    const params = new URLSearchParams(window.location.search);

    // Step 1: deep-link always wins.
    const questionId = params.get("question");
    if (questionId) {
      setAppView("practice");
      return;
    }

    // Step 2: explicit mode param.
    const mode = params.get("mode");
    if (mode === "random") {
      clearFilters();
      setAppView("practice");
      return;
    }
    if (mode === "targeted") {
      shouldOpenFilterOnEnter.current = true;
      setAppView("practice");
      return;
    }
    if (mode === "mock") {
      setAppView("mock");
      return;
    }
    // Legacy/unknown mode links should still enter practice gracefully.
    if (mode) {
      setAppView("practice");
      return;
    }

    // Step 3: shared filter URLs should open practice.
    const hasFilterParams = LANDING_FILTER_KEYS.some((key) => {
      const value = params.get(key);
      return value !== null && String(value).trim() !== "";
    });
    if (hasFilterParams) {
      setAppView("practice");
      return;
    }

    // Step 4: default to landing.
    setAppView("landing");
  }, [allQuestions, clearFilters, isInitialized, setAppView, shouldOpenFilterOnEnter]);

  const writeModeParam = useCallback((mode) => {
    const params = new URLSearchParams(window.location.search);
    params.set("mode", mode);
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, []);

  const handleModeStart = useCallback((mode) => {
    if (mode === "random") {
      clearFilters();
      shouldOpenFilterOnEnter.current = false;
      setAppView("practice");
      writeModeParam("random");
      return;
    }

    if (mode === "targeted") {
      shouldOpenFilterOnEnter.current = true;
      setAppView("practice");
      writeModeParam("targeted");
      return;
    }

    if (mode === "mock") {
      shouldOpenFilterOnEnter.current = false;
      setAppView("mock");
      writeModeParam("mock");
    }
  }, [clearFilters, setAppView, shouldOpenFilterOnEnter, writeModeParam]);

  if (appView === "landing") {
    return (
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        <ModeSelectionPage
          onModeStart={handleModeStart}
          hasPriorProgress={hasPriorProgress}
        />
      </main>
    );
  }

  if (appView === "mock") {
    return (
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-700 shadow-sm">
          Mock Test mode coming soon. This will be implemented in FEAT-014.
        </div>
      </main>
    );
  }

  return (
    <GateQAPracticeView
      loading={loading}
      error={error}
      loadQuestions={loadQuestions}
      isMobileFilterOpen={isMobileFilterOpen}
      setIsMobileFilterOpen={setIsMobileFilterOpen}
      shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
    />
  );
};

const GateQAShell = ({
  loading,
  error,
  loadQuestions,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  appView,
  setAppView,
  shouldOpenFilterOnEnter,
  hasPriorProgress,
  isCalculatorOpen,
  setIsCalculatorOpen,
  toggleCalculator,
  calculatorButtonRef,
}) => {
  const { clearFilters } = useFilterActions();

  const handleGoHome = useCallback(() => {
    clearFilters();
    shouldOpenFilterOnEnter.current = false;
    setIsMobileFilterOpen(false);
    setIsCalculatorOpen(false);
    setAppView("landing");
    window.history.replaceState({}, "", window.location.pathname);
  }, [clearFilters, setAppView, setIsCalculatorOpen, setIsMobileFilterOpen, shouldOpenFilterOnEnter]);

  return (
    <>
      <Header
        appView={appView}
        onGoHome={handleGoHome}
        onOpenFilters={appView === "practice" ? () => setIsMobileFilterOpen(true) : undefined}
        onToggleCalculator={appView !== "landing" ? toggleCalculator : undefined}
        isCalculatorOpen={isCalculatorOpen}
        calculatorButtonRef={calculatorButtonRef}
      />
      {appView !== "landing" && (
        <CalculatorWidget
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          anchorRef={calculatorButtonRef}
        />
      )}
      <GateQAContent
        loading={loading}
        error={error}
        loadQuestions={loadQuestions}
        isMobileFilterOpen={isMobileFilterOpen}
        setIsMobileFilterOpen={setIsMobileFilterOpen}
        appView={appView}
        setAppView={setAppView}
        shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
        hasPriorProgress={hasPriorProgress}
      />
    </>
  );
};

function App() {
  // GoatCounter SPA pageview tracking
  useGoatCounterSPA();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appView, setAppView] = useState("landing");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const calculatorButtonRef = useRef(null);
  const shouldOpenFilterOnEnter = useRef(false);

  const [hasPriorProgress] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const solved = JSON.parse(localStorage.getItem("gate_qa_solved_questions") || "[]");
      const bookmarked = JSON.parse(localStorage.getItem("gate_qa_bookmarked_questions") || "[]");
      const solvedCount = Array.isArray(solved) ? solved.length : 0;
      const bookmarkedCount = Array.isArray(bookmarked) ? bookmarked.length : 0;
      return solvedCount > 0 || bookmarkedCount > 0;
    } catch (storageError) {
      return false;
    }
  });

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await QuestionService.init();
      await AnswerService.init();
      // QuestionService.questions is now populated
    } catch (err) {
      setError(err.message || "Unable to load questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const toggleCalculator = useCallback(() => {
    setIsCalculatorOpen((previous) => !previous);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        if (appView === "landing") {
          return;
        }
        event.preventDefault();
        setIsCalculatorOpen((previous) => !previous);
      }
      if (event.key === "Escape") {
        setIsCalculatorOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [appView]);

  return (
    <MathJaxContext>
      <div className="flex flex-col h-screen max-h-screen bg-gray-50">
        <FilterProvider>
          <SessionProvider>
            <GateQAShell
              loading={loading}
              error={error}
              loadQuestions={loadQuestions}
              isMobileFilterOpen={isMobileFilterOpen}
              setIsMobileFilterOpen={setIsMobileFilterOpen}
              appView={appView}
              setAppView={setAppView}
              shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
              hasPriorProgress={hasPriorProgress}
              isCalculatorOpen={isCalculatorOpen}
              setIsCalculatorOpen={setIsCalculatorOpen}
              toggleCalculator={toggleCalculator}
              calculatorButtonRef={calculatorButtonRef}
            />
          </SessionProvider>
        </FilterProvider>
        <Footer />
      </div>
    </MathJaxContext>
  );
}

export default App;
