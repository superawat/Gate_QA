import React, { useMemo } from "react";
import { useMockTest } from "../../contexts/MockTestContext";
import { MathJax } from "better-react-mathjax";
import DOMPurify from "dompurify";
import { AnswerService } from "../../services/AnswerService";
import { QuestionService } from "../../services/QuestionService";
import { stripEmbeddedOptions } from "../../utils/stripEmbeddedOptions";

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const resolveMarks = (question = {}, typeLabel = "MCQ") => {
    const rawMarks = Number(question?.marks);
    if (Number.isFinite(rawMarks) && rawMarks > 0) {
        return String(rawMarks);
    }
    if (typeLabel === "NAT") {
        return "2";
    }
    return "1";
};

const buildCorrectOptionSet = (answerRecord) => {
    const set = new Set();
    if (!answerRecord || !answerRecord.type) {
        return set;
    }

    const answerType = String(answerRecord.type || "").toUpperCase();
    if (answerType === "MCQ") {
        const option = String(answerRecord.answer || "").toUpperCase().trim();
        if (option) {
            set.add(option);
        }
        return set;
    }

    if (answerType === "MSQ" && Array.isArray(answerRecord.answer)) {
        answerRecord.answer.forEach((option) => {
            const value = String(option || "").toUpperCase().trim();
            if (value) {
                set.add(value);
            }
        });
    }

    return set;
};

const MockTestQuestion = ({
    isReviewPhase = false,
}) => {
    const {
        currentQuestion,
        currentSection,
        currentSectionIndex,
        sectionQuestionUids,
        responses,
        saveResponse,
    } = useMockTest();
    const questionUid = currentQuestion?.question_uid || "";

    const typeLabel = String(currentQuestion?.type || "MCQ").toUpperCase();
    const marks = resolveMarks(currentQuestion, typeLabel);
    const negativeMarks = typeLabel === "MCQ" ? (marks === "1" ? "1/3" : "2/3") : "0";

    const rawQuestionHtml = (currentQuestion?.question || "")
        .replace(/\n\n/g, "<br />")
        .replace(/\n<li>/g, "<br><li>");

    // Strip embedded option text ("A. …", "B. …") from the stem HTML for
    // MCQ / MSQ questions when a structured options array is present.
    const shouldStripOptions =
        (typeLabel === "MCQ" || typeLabel === "MSQ") &&
        Array.isArray(currentQuestion?.normalizedOptions
            ? currentQuestion.normalizedOptions
            : currentQuestion?.options) &&
        (currentQuestion?.normalizedOptions || currentQuestion?.options || []).length > 0;

    const questionHtml = shouldStripOptions
        ? stripEmbeddedOptions(rawQuestionHtml)
        : rawQuestionHtml;
    const sanitizedQuestionHtml = DOMPurify.sanitize(questionHtml);

    const isNAT = typeLabel === "NAT";
    const isMSQ = typeLabel === "MSQ";
    const currentResponse = responses[questionUid];

    const sectionTotal = currentSection === "CS"
        ? sectionQuestionUids.CS.length
        : sectionQuestionUids.GA.length;
    const sectionPosition = sectionTotal > 0 ? currentSectionIndex + 1 : 0;

    const normalizedOptions = useMemo(() => {
        if (!currentQuestion) {
            return [];
        }
        return QuestionService.getNormalizedOptions(currentQuestion);
    }, [currentQuestion]);

    const answerRecord = useMemo(() => {
        if (!isReviewPhase) {
            return null;
        }
        if (!currentQuestion) {
            return null;
        }
        return AnswerService.getAnswerForQuestion(currentQuestion);
    }, [currentQuestion, isReviewPhase]);

    const answerStatusMessage = useMemo(() => {
        if (!isReviewPhase) {
            return "";
        }
        if (!answerRecord) {
            return "No mapped answer record.";
        }
        const answerType = String(answerRecord.type || "").toUpperCase();
        if (answerType === "UNSUPPORTED") {
            return "Unsupported question type.";
        }
        if (!["MCQ", "MSQ", "NAT"].includes(answerType)) {
            return "Unsupported question type.";
        }
        return "";
    }, [answerRecord, isReviewPhase]);

    const correctOptionSet = useMemo(() => {
        if (!isReviewPhase) {
            return new Set();
        }
        return buildCorrectOptionSet(answerRecord);
    }, [answerRecord, isReviewPhase]);

    if (!currentQuestion) return null;

    const handleOptionSelect = (optionValue) => {
        if (isReviewPhase) {
            return;
        }

        if (isMSQ) {
            const currentSelected = Array.isArray(currentResponse) ? currentResponse : [];
            const newSelected = currentSelected.includes(optionValue)
                ? currentSelected.filter((value) => value !== optionValue)
                : [...currentSelected, optionValue];
            saveResponse(currentQuestion.question_uid, newSelected);
            return;
        }

        saveResponse(questionUid, optionValue);
    };

    const handleNatChange = (event) => {
        if (isReviewPhase) {
            return;
        }
        saveResponse(questionUid, event.target.value);
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            {/* ── Meta row — Question Type + Marks ── */}
            <div className="mocktest-meta-row flex items-center justify-between bg-white px-3 text-[13px] text-[#1f2a36]">
                <div className="font-semibold">
                    Question Type: <span className="font-bold">{typeLabel}</span>
                </div>
                <div className="font-normal text-[#44505d]">
                    Marks for correct answer: <span className="font-semibold text-[#0f6f2f]">{marks}</span>
                    <span className="px-1 text-[#8894a0]">|</span>
                    Negative Marks: <span className="mocktest-negative-marks font-semibold text-[#c4302b]">{negativeMarks}</span>
                </div>
            </div>

            {/* ── Question body area ── */}
            <div className="mocktest-question-scroll flex-1 overflow-y-auto bg-white">
                <div className="mocktest-question-body w-full bg-white px-4 pb-16 md:px-6">
                    {/* Question No. row with scroll arrows */}
                    <div className="mocktest-question-number-row flex items-center justify-between px-1 py-2">
                        <h2 className="text-[18px] font-bold text-black">Question No. {sectionPosition}</h2>
                        <div className="mocktest-scroll-arrows">
                            <button type="button" className="mocktest-scroll-arrow-btn" aria-label="Scroll down">
                                <span>▼</span>
                            </button>
                            <button type="button" className="mocktest-scroll-arrow-btn" aria-label="Scroll up">
                                <span>▲</span>
                            </button>
                        </div>
                    </div>

                    <div
                        className="mock-question-content font-sans"
                        data-testid="mock-question-content"
                    >
                        {/* Question stem */}
                        <div className="mocktest-question-stem mb-6 border-l-2 border-transparent py-3">
                            <MathJax
                                key={questionUid}
                                dynamic
                                className="mt-1 max-w-full overflow-auto whitespace-normal text-xl leading-6 text-gray-500"
                            >
                                <div dangerouslySetInnerHTML={{ __html: sanitizedQuestionHtml }}></div>
                            </MathJax>
                        </div>

                        {/* Options area */}
                        <div className="pl-1">
                            {isNAT ? (
                                <div className="relative z-10 mt-4 flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-800">
                                        Enter your numerical answer here:
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            data-testid="mock-nat-input"
                                            value={currentResponse || ""}
                                            onChange={handleNatChange}
                                            readOnly={isReviewPhase}
                                            className="h-10 w-48 border border-gray-400 bg-white px-3 text-lg font-bold shadow-inner focus:border-blue-500 focus:outline-none"
                                            placeholder="Enter answer"
                                        />
                                        {!isReviewPhase && (
                                            <button
                                                className="h-8 rounded border border-gray-400 bg-[#e1e1e1] px-4 text-sm font-bold shadow-sm"
                                                onClick={() => saveResponse(questionUid, "")}
                                            >
                                                Backspace
                                            </button>
                                        )}
                                    </div>
                                    {isReviewPhase && answerStatusMessage && (
                                        <p className="mt-1 text-xs font-semibold text-[#9b2a2a]">{answerStatusMessage}</p>
                                    )}
                                    <p className="mt-1 text-xs italic text-gray-500">
                                        Use virtual keypad or physical keyboard.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-2 flex flex-col gap-3">
                                    {normalizedOptions.length === 0 ? (
                                        <div className="rounded border border-[#e1c3c3] bg-[#fff6f6] px-3 py-2 text-sm text-[#8b2a2a]">
                                            Options unavailable for this question data.
                                        </div>
                                    ) : (
                                        <>
                                            {/* ── Selection controls with option text ── */}
                                            <div
                                                className="mt-1 flex flex-col gap-2"
                                                data-testid="mock-options-display"
                                            >
                                                {normalizedOptions.map((option, index) => {
                                                    const optionValue = option.label;
                                                    const optionHtml = option.html || option.text || "";
                                                    const sanitizedOptionHtml = optionHtml
                                                        ? DOMPurify.sanitize(optionHtml)
                                                        : "";
                                                    const isChecked = isMSQ
                                                        ? Array.isArray(currentResponse) && currentResponse.includes(optionValue)
                                                        : currentResponse === optionValue;

                                                    const isCorrect = isReviewPhase && correctOptionSet.has(optionValue);
                                                    const isIncorrectSelection = isReviewPhase && isChecked && !isCorrect;

                                                    const rowClass = isReviewPhase
                                                        ? (isCorrect
                                                            ? "border border-[#1e8f3f] bg-[#eef9f1]"
                                                            : isIncorrectSelection
                                                                ? "border border-[#cc5d5d] bg-[#fff1f1]"
                                                                : "border border-transparent")
                                                        : (isChecked ? "bg-blue-50/50" : "");

                                                    return (
                                                        <label
                                                            key={optionValue}
                                                            className={`mock-option-selector flex items-start gap-2 rounded-sm px-2 py-1 ${isReviewPhase ? "cursor-default" : "cursor-pointer hover:bg-gray-50"} ${rowClass}`}
                                                            data-testid={`mock-option-selector-${OPTION_LABELS[index] ?? optionValue}`}
                                                        >
                                                            <input
                                                                type={isMSQ ? "checkbox" : "radio"}
                                                                name={`q-${questionUid}`}
                                                                value={optionValue}
                                                                checked={isChecked}
                                                                onChange={() => handleOptionSelect(optionValue)}
                                                                disabled={isReviewPhase}
                                                                className={`mt-1 h-[18px] w-[18px] flex-shrink-0 border-2 border-gray-400 accent-[#0e76a8] ${isMSQ ? "rounded-sm" : ""}`}
                                                            />
                                                            <span className="mock-option-label font-medium flex-shrink-0">{OPTION_LABELS[index] ?? optionValue}.</span>
                                                            {sanitizedOptionHtml ? (
                                                                <MathJax
                                                                    key={`${questionUid}-opt-${optionValue}`}
                                                                    dynamic
                                                                    className="mock-option-text flex-1 overflow-auto"
                                                                >
                                                                    <span dangerouslySetInnerHTML={{ __html: sanitizedOptionHtml }} />
                                                                </MathJax>
                                                            ) : (
                                                                <span className="mock-option-text flex-1">{optionValue}</span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                    {isReviewPhase && answerStatusMessage && (
                                        <p className="text-xs font-semibold text-[#9b2a2a]">{answerStatusMessage}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockTestQuestion;
