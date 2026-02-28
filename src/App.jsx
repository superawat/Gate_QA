import { MathJaxContext } from "better-react-mathjax";
import { useCallback, useEffect, useRef, useState } from "react";

import Header from "./components/Header/Header";
import Question from "./components/Question/Question";
import Footer from "./components/Footer/Footer";
import FilterModal from "./components/Filters/FilterModal";
import ActiveFilterChips from "./components/Filters/ActiveFilterChips";
import CalculatorWidget from "./components/Calculator/CalculatorWidget";
import { FilterProvider, useFilterState, useFilterActions } from "./contexts/FilterContext";
import { SessionProvider, useSession } from "./contexts/SessionContext";
import { QuestionService } from "./services/QuestionService";
import { AnswerService } from "./services/AnswerService";
import { useGoatCounterSPA } from "./hooks/useGoatCounterSPA";

const GateQAContent = ({ loading, error, loadQuestions, isMobileFilterOpen, setIsMobileFilterOpen }) => {
  const { filteredQuestions, isInitialized, totalQuestions, allQuestions } = useFilterState();
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
    const questionId = params.get('question');
    const hasActiveFilterParams = [
      'years',
      'subjects',
      'topics',
      'subtopics',
      'types',
      'range',
      'hideSolved',
      'showOnlySolved',
      'showOnlyBookmarked',
    ].some((key) => {
      const value = params.get(key);
      return value !== null && String(value).trim() !== "";
    });

    if (questionId) {
      const found = getQuestionById(questionId);
      if (found) {
        const inCurrentPool = filteredQuestions.some(q => q.question_uid === found.question_uid);
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
      const firstQ = filteredQuestions.find(q => q.question_uid === firstUid);
      if (firstQ) {
        setCurrentQuestion(firstQ);
        markSeen(firstQ.question_uid);
      }
    }
  }, [isInitialized, allQuestions, filteredQuestions, getQuestionById, currentQuestion, sessionQueue, markSeen, markDeepLinkedQuestion]);

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

        const targetQ = filteredQuestions.find(q => q.question_uid === targetUid);
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
      const isValid = filteredQuestions.some(q => q.question_uid === currentQuestion.question_uid);

      if (!isValid) {
        // Current question no longer in filtered pool — pick first from queue
        if (sessionQueue.length > 0) {
          const firstQ = filteredQuestions.find(q => q.question_uid === sessionQueue[0]);
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
    params.set('question', currentQuestion.question_uid);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen grow">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900 dark:text-gray-200"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM12 20a8 8 0 008-8h-4a4 4 0 01-4 4v4zm2-17.709A7.962 7.962 0 0120 12h-4a4 4 0 00-4-4V1l3 1.291z"
          ></path>
        </svg>
        <p className="text-gray-900 dark:text-gray-200">Loading...</p>
      </div>
    );
  }

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
          {showExhaustionBanner && (
            <div
              className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm animate-fade-in"
              role="status"
            >
              <span>
                🔄 You've seen all <strong>{filteredQuestions.length}</strong> question{filteredQuestions.length !== 1 ? 's' : ''} in this filter. Starting over with a fresh shuffle.
              </span>
              <button
                type="button"
                onClick={dismissExhaustionBanner}
                className="ml-2 rounded px-2 py-1 text-blue-600 hover:bg-blue-100 transition-colors"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {currentQuestion ? (
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

function App() {
  // GoatCounter SPA pageview tracking
  useGoatCounterSPA();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const calculatorButtonRef = useRef(null);

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
  }, []);

  return (
    <MathJaxContext>
      <div className="flex flex-col h-screen max-h-screen bg-gray-50">
        <Header
          onOpenFilters={() => setIsMobileFilterOpen(true)}
          onToggleCalculator={toggleCalculator}
          isCalculatorOpen={isCalculatorOpen}
          calculatorButtonRef={calculatorButtonRef}
        />
        <CalculatorWidget
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          anchorRef={calculatorButtonRef}
        />
        <FilterProvider>
          <SessionProvider>
            <GateQAContent
              loading={loading}
              error={error}
              loadQuestions={loadQuestions}
              isMobileFilterOpen={isMobileFilterOpen}
              setIsMobileFilterOpen={setIsMobileFilterOpen}
            />
          </SessionProvider>
        </FilterProvider>
        <Footer />

      </div>
    </MathJaxContext>
  );
}

export default App;
