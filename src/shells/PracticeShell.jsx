import React, { useCallback, useEffect, useRef, useState } from "react";

import Header from "../components/Header/Header";
import Question from "../components/Question/Question";
import Footer from "../components/Footer/Footer";
import FilterModal from "../components/Filters/FilterModal";
import ActiveFilterChips from "../components/Filters/ActiveFilterChips";
import CalculatorWidget from "../components/Calculator/CalculatorWidget";
import LoadingState from "../components/Loaders/LoadingState";
import { useFilterState, useFilterActions } from "../contexts/FilterContext";
import { useSession } from "../contexts/SessionContext";
import { QuestionService } from "../services/QuestionService";
import { AnswerService } from "../services/AnswerService";
import { trackEvent } from "../utils/analytics";
import { MathRuntimeProvider } from "../components/Math/MathRuntime";

/**
 * Inner practice view — question display, deep-link resolution, queue management.
 * Moved verbatim from the old GateQAPracticeView in App.jsx.
 */
const PracticeView = ({
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
    const [resolvedQuestion, setResolvedQuestion] = useState(null);
    const [questionDetailError, setQuestionDetailError] = useState("");
    const [isQuestionDetailLoading, setIsQuestionDetailLoading] = useState(false);
    const [questionDetailRequestNonce, setQuestionDetailRequestNonce] = useState(0);
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
            if (filteredQuestions.length === 0) {
                setIsInitializing(false);
                return;
            }

            if (
                currentQuestion
                && resolvedQuestion
                && currentQuestion.question_uid === resolvedQuestion.question_uid
            ) {
                setIsInitializing(false);
            }
        }
    }, [loading, isInitialized, currentQuestion, resolvedQuestion, filteredQuestions.length]);

    useEffect(() => {
        if (!currentQuestion || !currentQuestion.question_uid) {
            setResolvedQuestion(null);
            setQuestionDetailError("");
            setIsQuestionDetailLoading(false);
            return;
        }

        if (currentQuestion.question && String(currentQuestion.question).trim()) {
            setResolvedQuestion(currentQuestion);
            setQuestionDetailError("");
            setIsQuestionDetailLoading(false);
            return;
        }

        let isActive = true;
        setResolvedQuestion(null);
        setQuestionDetailError("");
        setIsQuestionDetailLoading(true);

        QuestionService.ensureQuestionDetail(currentQuestion)
            .then((questionDetail) => {
                if (!isActive) {
                    return;
                }
                setResolvedQuestion(questionDetail);
                setQuestionDetailError(questionDetail ? "" : "Unable to load question detail.");
            })
            .catch((err) => {
                if (!isActive) {
                    return;
                }
                setResolvedQuestion(null);
                setQuestionDetailError(err.message || "Unable to load question detail.");
            })
            .finally(() => {
                if (isActive) {
                    setIsQuestionDetailLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, [currentQuestion, questionDetailRequestNonce]);

    const handleNextQuestion = useCallback(() => {
        const nextQ = advanceQueue();
        if (nextQ) {
            setCurrentQuestion(nextQ);
        }
    }, [advanceQueue]);

    const retryCurrentQuestionDetail = useCallback(() => {
        setQuestionDetailRequestNonce((value) => value + 1);
    }, []);

    // Deep-link resolution
    useEffect(() => {
        if (!isInitialized || allQuestions.length === 0 || hasResolvedDeepLink.current) {
            return;
        }
        hasResolvedDeepLink.current = true;

        const params = new URLSearchParams(window.location.search);
        const questionId = params.get("question");
        const hasActiveFilterParams = [
            "years", "subjects", "topics", "subtopics", "types", "range", "search",
            "hideSolved", "showOnlySolved", "showOnlyBookmarked",
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
                    markDeepLinkedQuestion(found.question_uid);
                    return;
                }
            }
        }

        if (!currentQuestion && sessionQueue.length > 0) {
            const firstUid = sessionQueue[0];
            const firstQ = filteredQuestions.find((q) => q.question_uid === firstUid);
            if (firstQ) {
                setCurrentQuestion(firstQ);
                markSeen(firstQ.question_uid);
            }
        }
    }, [
        isInitialized, allQuestions, filteredQuestions, getQuestionById,
        currentQuestion, sessionQueue, markSeen, markDeepLinkedQuestion,
    ]);

    // Queue sync
    useEffect(() => {
        if (isMobileFilterOpen) {
            return;
        }

        if (isInitialized && sessionQueue.length > 0 && hasResolvedDeepLink.current) {
            const targetUid = sessionQueue[currentIndex];
            if (targetUid && targetUid !== currentQuestion?.question_uid) {
                if (!hasIgnoredFirstQueueSync.current) {
                    hasIgnoredFirstQueueSync.current = true;
                    if (currentQuestion) return;
                }
                const targetQ = filteredQuestions.find((q) => q.question_uid === targetUid);
                if (targetQ) {
                    setCurrentQuestion(targetQ);
                    markSeen(targetUid);
                }
            }
        } else if (isInitialized && filteredQuestions.length === 0 && hasResolvedDeepLink.current) {
            if (currentQuestion !== null) setCurrentQuestion(null);
        }
    }, [sessionQueue, currentIndex, isInitialized, filteredQuestions, currentQuestion, markSeen, isMobileFilterOpen]);

    // Validate current question against filtered list
    useEffect(() => {
        if (isMobileFilterOpen) {
            return;
        }

        if (isInitialized && filteredQuestions.length > 0 && currentQuestion) {
            const isValid = filteredQuestions.some((q) => q.question_uid === currentQuestion.question_uid);
            if (!isValid) {
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
    }, [isInitialized, filteredQuestions, currentQuestion, sessionQueue, markSeen, isMobileFilterOpen]);

    // Dev invariant check
    useEffect(() => {
        if (!import.meta.env.DEV || !isInitialized || !currentQuestion) return;
        const inPool = filteredQuestions.some(
            (question) => question.question_uid === currentQuestion.question_uid
        );
        if (!inPool && filteredQuestions.length > 0) {
            console.error("[FilterInvariant] currentQuestion is outside filteredQuestions", {
                currentQuestionUid: currentQuestion.question_uid,
                filteredCount: filteredQuestions.length,
            });
        }
    }, [isInitialized, currentQuestion, filteredQuestions]);

    // URL sync for ?question=
    useEffect(() => {
        if (typeof window === "undefined" || !currentQuestion || !currentQuestion.question_uid) return;
        const params = new URLSearchParams(window.location.search);
        params.set("question", currentQuestion.question_uid);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
    }, [currentQuestion]);

    // Debug window object
    useEffect(() => {
        if (typeof window === "undefined" || !resolvedQuestion) return;
        const identity = AnswerService.getQuestionIdentity(resolvedQuestion);
        const answer = AnswerService.getAnswerForQuestion(resolvedQuestion);
        window.__gateqa_q = resolvedQuestion;
        window.__gateqa_lookup = {
            identity,
            hasAnswer: !!answer,
            sourceUrl: QuestionService.sourceUrl,
            answersLoaded: AnswerService.loaded,
            answersByQuestionUidCount: Object.keys(AnswerService.answersByQuestionUid || {}).length,
            answersByExamUidCount: Object.keys(AnswerService.answersByExamUid || {}).length,
        };
    }, [resolvedQuestion]);

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
            <FilterModal
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
            />
            <main className="flex-1 flex flex-col w-full transition-all duration-300">
                <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full">
                    {!isMobileFilterOpen && <ActiveFilterChips />}

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
                        <LoadingState
                            label="Loading questions..."
                            size="lg"
                            className="py-20 min-h-[400px]"
                            textClassName="text-sm text-gray-500 dark:text-gray-400"
                        />
                    ) : questionDetailError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-center shadow-sm">
                            <p className="text-sm font-medium text-red-800">{questionDetailError}</p>
                            <button
                                type="button"
                                onClick={retryCurrentQuestionDetail}
                                className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                            >
                                Retry question
                            </button>
                        </div>
                    ) : currentQuestion && (
                        isQuestionDetailLoading
                        || !resolvedQuestion
                        || resolvedQuestion.question_uid !== currentQuestion.question_uid
                    ) ? (
                        <LoadingState
                            label="Loading question..."
                            size="lg"
                            className="py-20 min-h-[400px]"
                            textClassName="text-sm text-gray-500 dark:text-gray-400"
                        />
                    ) : resolvedQuestion ? (
                        <Question
                            question={resolvedQuestion}
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

/**
 * PracticeShell — full practice experience with Header, Calculator, Footer.
 * This is the complete self-contained shell for the practice view.
 */
const PracticeShell = ({
    loading,
    error,
    loadQuestions,
    onGoHome,
    shouldOpenFilterOnEnter,
}) => {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const calculatorButtonRef = useRef(null);

    const toggleCalculator = useCallback(() => {
        setIsCalculatorOpen((prev) => !prev);
    }, []);

    // Ctrl+K / Escape calculator shortcut
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setIsCalculatorOpen((prev) => !prev);
            }
            if (event.key === "Escape") {
                setIsCalculatorOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleGoHome = useCallback(() => {
        shouldOpenFilterOnEnter.current = false;
        setIsMobileFilterOpen(false);
        setIsCalculatorOpen(false);
        onGoHome();
    }, [onGoHome, shouldOpenFilterOnEnter]);

    return (
        <MathRuntimeProvider>
            <Header
                appView="practice"
                onGoHome={handleGoHome}
                onOpenFilters={() => {
                    trackEvent("open_filters", { source: "header" });
                    setIsMobileFilterOpen(true);
                }}
                onToggleCalculator={toggleCalculator}
                isCalculatorOpen={isCalculatorOpen}
                calculatorButtonRef={calculatorButtonRef}
            />
            <CalculatorWidget
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                anchorRef={calculatorButtonRef}
            />
            <PracticeView
                loading={loading}
                error={error}
                loadQuestions={loadQuestions}
                isMobileFilterOpen={isMobileFilterOpen}
                setIsMobileFilterOpen={setIsMobileFilterOpen}
                shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
            />
            <Footer />
        </MathRuntimeProvider>
    );
};

export default PracticeShell;
