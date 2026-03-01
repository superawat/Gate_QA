import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useFilterState } from "./FilterContext";

const MockTestContext = createContext();

const TOTAL_MOCK_TIME_SECONDS = 3 * 60 * 60; // 3 hours

export const MockTestProvider = ({ children }) => {
    const { allQuestions } = useFilterState();
    const [testActive, setTestActive] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState({}); // { questionUid: responseValue }
    const [questionStates, setQuestionStates] = useState({}); // { questionUid: statusString }
    const [timeLeft, setTimeLeft] = useState(TOTAL_MOCK_TIME_SECONDS);
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [currentSection, setCurrentSection] = useState('GA');

    const timerRef = useRef(null);

    const STATUS = {
        NOT_VISITED: "not_visited",
        NOT_ANSWERED: "not_answered",
        ANSWERED: "answered",
        MARKED_FOR_REVIEW: "review",
        ANSWERED_AND_MARKED_FOR_REVIEW: "review_answered",
    };

    const startTest = useCallback(() => {
        // Basic initialization of mock test - selecting questions
        if (allQuestions.length === 0) return;

        // Filter questions by section (GA and CS typically)
        const gaQuestions = allQuestions.filter(q => q.subject === "General Aptitude" || q.title.match(/\bGA\b/i)).slice(0, 10);
        // fallback if no general aptitude
        const remainingQuestionsForCS = allQuestions.filter(q => q.subject !== "General Aptitude" && !q.title.match(/\bGA\b/i)).slice(0, 55);

        const testSet = [...gaQuestions, ...remainingQuestionsForCS];
        if (testSet.length === 0) {
            console.warn("No questions found for mock test.");
            return;
        }

        setQuestions(testSet);

        const initialStates = {};
        testSet.forEach((q, idx) => {
            initialStates[q.question_uid] = idx === 0 ? STATUS.NOT_ANSWERED : STATUS.NOT_VISITED;
        });
        setQuestionStates(initialStates);
        setResponses({});
        setCurrentQuestionIndex(0);
        setTimeLeft(TOTAL_MOCK_TIME_SECONDS);
        setTestSubmitted(false);
        setCurrentSection(gaQuestions.length > 0 ? 'GA' : 'CS');
        setTestActive(true);
    }, [allQuestions, STATUS.NOT_VISITED, STATUS.NOT_ANSWERED]);

    // Timer logic
    useEffect(() => {
        if (testActive && !testSubmitted && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setTestSubmitted(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [testActive, testSubmitted, timeLeft]);

    const goToQuestion = useCallback((index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
            const uid = questions[index].question_uid;
            setQuestionStates(prev => {
                if (prev[uid] === STATUS.NOT_VISITED) {
                    return { ...prev, [uid]: STATUS.NOT_ANSWERED };
                }
                return prev;
            });
            // also update section based on question index
            // if we assume first GA questions are 10.
            if (questions[index].subject === "General Aptitude" || questions[index].title.match(/\bGA\b/i)) {
                setCurrentSection('GA');
            } else {
                setCurrentSection('CS');
            }
        }
    }, [questions, STATUS.NOT_VISITED, STATUS.NOT_ANSWERED]);

    const saveResponse = useCallback((uid, response) => {
        setResponses((prev) => ({ ...prev, [uid]: response }));
    }, []);

    const clearResponse = useCallback(() => {
        const uid = questions[currentQuestionIndex]?.question_uid;
        if (uid) {
            setResponses((prev) => {
                const next = { ...prev };
                delete next[uid];
                return next;
            });
            setQuestionStates((prev) => ({
                ...prev,
                [uid]: prev[uid] === STATUS.ANSWERED_AND_MARKED_FOR_REVIEW || prev[uid] === STATUS.MARKED_FOR_REVIEW
                    ? STATUS.MARKED_FOR_REVIEW
                    : STATUS.NOT_ANSWERED
            }));
        }
    }, [currentQuestionIndex, questions, STATUS]);

    const saveAndNext = useCallback(() => {
        const uid = questions[currentQuestionIndex]?.question_uid;
        if (uid) {
            setQuestionStates((prev) => ({
                ...prev,
                [uid]: responses[uid] !== undefined ? STATUS.ANSWERED : STATUS.NOT_ANSWERED,
            }));
            goToQuestion(currentQuestionIndex + 1);
        }
    }, [currentQuestionIndex, questions, responses, goToQuestion, STATUS]);

    const markForReviewAndNext = useCallback(() => {
        const uid = questions[currentQuestionIndex]?.question_uid;
        if (uid) {
            setQuestionStates((prev) => ({
                ...prev,
                [uid]: responses[uid] !== undefined ? STATUS.ANSWERED_AND_MARKED_FOR_REVIEW : STATUS.MARKED_FOR_REVIEW,
            }));
            goToQuestion(currentQuestionIndex + 1);
        }
    }, [currentQuestionIndex, questions, responses, goToQuestion, STATUS]);

    const submitTest = useCallback(() => {
        setTestSubmitted(true);
        setTestActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, []);

    const goToPrevious = useCallback(() => {
        if (currentQuestionIndex > 0) {
            goToQuestion(currentQuestionIndex - 1);
        }
    }, [currentQuestionIndex, goToQuestion]);

    const endMockTest = useCallback(() => {
        setTestActive(false);
        setTestSubmitted(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const value = {
        testActive,
        startTest,
        endMockTest,
        questions,
        currentQuestionIndex,
        currentQuestion: questions[currentQuestionIndex] || null,
        responses,
        questionStates,
        timeLeft,
        testSubmitted,
        submitTest,
        goToQuestion,
        saveResponse,
        clearResponse,
        saveAndNext,
        markForReviewAndNext,
        goToPrevious,
        currentSection,
        setCurrentSection,
        STATUS
    };

    return <MockTestContext.Provider value={value}>{children}</MockTestContext.Provider>;
};

export const useMockTest = () => {
    const context = useContext(MockTestContext);
    if (!context) {
        throw new Error("useMockTest must be used within a MockTestProvider");
    }
    return context;
};
