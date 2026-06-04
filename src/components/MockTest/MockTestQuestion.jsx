import React, { useMemo, useRef } from "react";
import DOMPurify from "dompurify";
import { useMockTest } from "../../contexts/MockTestContext";
import { QuestionService } from "../../services/QuestionService";
import {
    formatExpectedAnswer,
    formatMockResponse,
    formatMockTimeSpent,
    isMockAutoAwardType,
} from "../../utils/mockTest";
import { normalizeHtmlAssetUrls } from "../../utils/htmlAssets";
import { stripEmbeddedOptions } from "../../utils/stripEmbeddedOptions";
import { MathContent } from "../Math/MathRuntime";

const OPTION_LABELS = QuestionService.OPTION_LABELS;

const formatNegativeMarks = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return "0";
    }
    if (Math.abs(numericValue - 0.3333333333) < 0.0001) {
        return "1/3";
    }
    if (Math.abs(numericValue - 0.6666666667) < 0.0001) {
        return "2/3";
    }
    return numericValue.toString();
};

const buildCorrectOptionSet = (answerRecord = null) => {
    const set = new Set();
    const type = String(answerRecord?.type || "").toUpperCase();

    if (type === "MCQ") {
        const option = String(answerRecord?.answer || "").trim().toUpperCase();
        if (option) {
            set.add(option);
        }
    }

    if (type === "MSQ" && Array.isArray(answerRecord?.answer)) {
        answerRecord.answer.forEach((option) => {
            const value = String(option || "").trim().toUpperCase();
            if (value) {
                set.add(value);
            }
        });
    }

    return set;
};

const getVerdictCopy = (result = null) => {
    switch (result?.status) {
        case "bonus":
            return { label: "Awarded to all", tone: "text-[#0f6f2f]" };
        case "correct":
            return { label: "Correct", tone: "text-[#0f6f2f]" };
        case "incorrect":
            return { label: "Incorrect", tone: "text-[#c4302b]" };
        case "missing_answer":
            return { label: "No mapped answer record", tone: "text-[#9b2a2a]" };
        case "unsupported_type":
            return { label: "Unsupported answer type", tone: "text-[#9b2a2a]" };
        case "unanswered":
        default:
            return { label: "Unanswered", tone: "text-[#6a7f94]" };
    }
};

const formatQuestionTypeLabel = (type = "") => {
    const normalized = String(type || "").trim().toUpperCase();
    if (normalized === "MARKS_TO_ALL") {
        return "MARKS TO ALL";
    }
    return normalized || "MCQ";
};

const stripHtmlToText = (value = "") => (
    String(value || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
);

const TRUE_FALSE_PROMPT_RE = /\b(?:state|decide)\s+(?:whether\s+)?[\s\S]{0,220}\btrue\s+or\s+false\b|\btrue\s+or\s+false\s+with\b/i;

const isTrueFalseMockQuestion = (question = {}, rawType = "") => {
    if (String(rawType || "").trim().toUpperCase() !== "NAT") {
        return false;
    }

    const tagValues = [
        ...(Array.isArray(question?.tags) ? question.tags : []),
        ...(Array.isArray(question?.tagsRaw) ? question.tagsRaw : []),
        ...(Array.isArray(question?.canonical?.tagsRaw) ? question.canonical.tagsRaw : []),
    ];
    if (tagValues.some((tag) => String(tag || "").toLowerCase().trim() === "true-false")) {
        return true;
    }

    const promptText = [
        stripHtmlToText(question?.question || ""),
        question?.preview || "",
        question?.searchText || "",
    ].join(" ");
    return TRUE_FALSE_PROMPT_RE.test(promptText);
};

const MockTestQuestion = ({ isReviewPhase = false }) => {
    const {
        currentQuestion,
        currentQuestionMeta,
        currentQuestionResult,
        currentSection,
        currentSectionIndex,
        responses,
        saveResponse,
        sectionQuestionUids,
    } = useMockTest();

    const questionUid = String(currentQuestion?.question_uid || "").trim();
    if (!currentQuestion || !questionUid) {
        return null;
    }

    const rawType = String(currentQuestionMeta?.type || "").trim().toUpperCase();
    const isTrueFalse = useMemo(
        () => isTrueFalseMockQuestion(currentQuestion, rawType),
        [currentQuestion, rawType]
    );
    const typeLabel = formatQuestionTypeLabel(currentQuestionMeta?.type);
    const marks = Number(currentQuestionMeta?.marks || 0);
    const negativeMarks = formatNegativeMarks(currentQuestionMeta?.negativeMarks);
    const isNAT = rawType === "NAT";
    const isMSQ = rawType === "MSQ";
    const isAutoAwarded = isMockAutoAwardType(rawType);

    const autoAwardMessage = rawType === "SUBJECTIVE"
        ? "This legacy subjective prompt is awarded automatically. No response is required."
        : "This question is awarded to all candidates. No response is required.";
    const currentResponse = responses[questionUid];
    const reviewResult = isReviewPhase ? currentQuestionResult : null;
    const verdictCopy = getVerdictCopy(reviewResult);
    const correctOptionSet = useMemo(
        () => buildCorrectOptionSet(reviewResult?.answerRecord),
        [reviewResult?.answerRecord]
    );

    const rawQuestionHtml = normalizeHtmlAssetUrls(String(currentQuestion?.question || ""))
        .replace(/\n\n/g, "<br />")
        .replace(/\n<li>/g, "<br><li>");

    const normalizedOptions = useMemo(
        () => QuestionService.getNormalizedOptions(currentQuestion),
        [currentQuestion]
    );

    // Check if options are explicitly provided in the array, so we must render them
    // separately above the A/B/C/D selector.
    const explicitOptions = useMemo(
        () => QuestionService.normalizeQuestionOptionsFromRaw(currentQuestion?.options || []),
        [currentQuestion]
    );
    const displayOptions = explicitOptions.length > 0 ? explicitOptions : normalizedOptions;
    const questionHtmlForDisplay = displayOptions.length > 0
        ? stripEmbeddedOptions(rawQuestionHtml)
        : rawQuestionHtml;
    const sanitizedQuestionHtml = DOMPurify.sanitize(questionHtmlForDisplay);

    const sectionTotal = currentSection === "CS"
        ? sectionQuestionUids.CS.length
        : sectionQuestionUids.GA.length;
    const sectionPosition = sectionTotal > 0 ? currentSectionIndex + 1 : 0;
    const reviewScoreDelta = Number(reviewResult?.scoreDelta || 0);
    const reviewScoreText = reviewScoreDelta > 0
        ? `+${reviewScoreDelta}`
        : String(reviewScoreDelta);

    let reviewExpectedAnswer = formatExpectedAnswer(reviewResult?.answerRecord);
    if (isTrueFalse) {
        if (String(reviewExpectedAnswer).trim() === "1") {
            reviewExpectedAnswer = "TRUE";
        } else if (String(reviewExpectedAnswer).trim() === "0") {
            reviewExpectedAnswer = "FALSE";
        }
    }
    let reviewResponseText = reviewResult?.status === "bonus"
        ? "Not required"
        : formatMockResponse(reviewResult?.response, rawType);
    if (isTrueFalse) {
        if (String(reviewResponseText).trim() === "1") {
            reviewResponseText = "TRUE";
        } else if (String(reviewResponseText).trim() === "0") {
            reviewResponseText = "FALSE";
        }
    }
    const reviewTimeText = formatMockTimeSpent(reviewResult?.timeSpentSeconds);
    const reviewTimeExceeded = Boolean(reviewResult?.timeExceededThreshold);
    const reviewMessage = reviewResult?.status === "bonus"
        ? "This question was awarded automatically."
        : reviewResult?.status === "missing_answer"
        ? "No mapped answer record."
        : reviewResult?.status === "unsupported_type"
            ? "Unsupported answer type."
            : "";

    const handleOptionSelect = (optionValue) => {
        if (isReviewPhase) {
            return;
        }

        if (isMSQ) {
            const currentSelected = Array.isArray(currentResponse) ? currentResponse : [];
            const newSelected = currentSelected.includes(optionValue)
                ? currentSelected.filter((value) => value !== optionValue)
                : [...currentSelected, optionValue];
            saveResponse(questionUid, newSelected);
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

    const natInputRef = useRef(null);

    const handleNatInsert = (char) => {
        if (isReviewPhase) return;
        const input = natInputRef.current;
        if (!input) {
            saveResponse(questionUid, (currentResponse || "") + char);
            return;
        }
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const val = currentResponse || "";
        const newVal = val.slice(0, start) + char + val.slice(end);
        saveResponse(questionUid, newVal);
        setTimeout(() => {
            if (natInputRef.current) {
                natInputRef.current.setSelectionRange(start + char.length, start + char.length);
                natInputRef.current.focus();
            }
        }, 0);
    };

    const handleNatBackspace = () => {
        if (isReviewPhase) return;
        const input = natInputRef.current;
        if (!input) return;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const val = currentResponse || "";
        if (start === end && start > 0) {
            const newVal = val.slice(0, start - 1) + val.slice(end);
            saveResponse(questionUid, newVal);
            setTimeout(() => {
                if (natInputRef.current) {
                    natInputRef.current.setSelectionRange(start - 1, start - 1);
                    natInputRef.current.focus();
                }
            }, 0);
        } else if (start !== end) {
            const newVal = val.slice(0, start) + val.slice(end);
            saveResponse(questionUid, newVal);
            setTimeout(() => {
                if (natInputRef.current) {
                    natInputRef.current.setSelectionRange(start, start);
                    natInputRef.current.focus();
                }
            }, 0);
        }
    };

    const handleNatArrow = (dir) => {
        if (isReviewPhase) return;
        const input = natInputRef.current;
        if (!input) return;
        const start = input.selectionStart || 0;
        const newPos = dir === 'left' ? Math.max(0, start - 1) : Math.min((currentResponse || "").length, start + 1);
        input.setSelectionRange(newPos, newPos);
        input.focus();
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
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

            <div className="mocktest-question-scroll flex-1 overflow-y-auto bg-white">
                <div className="mocktest-question-body w-full bg-white px-4 pb-16 md:px-6">
                    <div className="mocktest-question-number-row flex items-center justify-between px-1 py-2">
                        <h2 className="text-[18px] font-bold text-black">Question No. {sectionPosition}</h2>
                    </div>

                    {isReviewPhase ? (
                        <div className="mb-4 rounded border border-[#d7e3ee] bg-[#f6f9fc] px-4 py-3 text-sm">
                            <div className={`font-semibold ${verdictCopy.tone}`}>{verdictCopy.label}</div>
                            <div className="mt-2 text-[#41576c]">Your answer: {reviewResponseText}</div>
                            <div className="mt-1 text-[#41576c]">Expected answer: {reviewExpectedAnswer}</div>
                            <div className="mt-1 text-[#41576c]">Score change: {reviewScoreText}</div>
                            <div className={`mt-1 ${reviewTimeExceeded ? "font-semibold text-[#9a3412]" : "text-[#41576c]"}`}>
                                Time spent: {reviewTimeText}
                                {reviewTimeExceeded ? " (over 3 min)" : ""}
                            </div>
                            {reviewMessage ? (
                                <div className="mt-2 text-[#9b2a2a]">{reviewMessage}</div>
                            ) : null}
                        </div>
                    ) : null}

                    <div
                        className="mock-question-content font-sans"
                        data-testid="mock-question-content"
                    >
                        <div className="mocktest-question-stem mb-6 border-l-2 border-transparent py-3">
                            <MathContent
                                as="div"
                                key={questionUid}
                                dynamic
                                className="mt-1 max-w-full overflow-auto whitespace-normal text-xl leading-6 text-gray-500"
                            >
                                <div dangerouslySetInnerHTML={{ __html: sanitizedQuestionHtml }}></div>
                            </MathContent>
                        </div>

                        <div className="pl-1">
                            {isAutoAwarded ? (
                                <div className="rounded border border-[#c8e6d1] bg-[#f1fbf4] px-3 py-3 text-sm font-semibold text-[#0f6f2f]">
                                    {autoAwardMessage}
                                </div>
                            ) : isNAT ? (
                                <div className="relative z-10 mt-4 flex flex-col gap-2">
                                    {isTrueFalse ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="font-semibold text-gray-700 mb-1">Select your answer:</div>
                                            <div className="flex flex-row flex-wrap gap-4">
                                                {[
                                                    { label: "TRUE", value: "1" },
                                                    { label: "FALSE", value: "0" }
                                                ].map((option) => {
                                                    const isChecked = String(currentResponse ?? "") === option.value;
                                                    const isCorrect = isReviewPhase && String(reviewExpectedAnswer).trim() === option.label;
                                                    const isIncorrectSelection = isReviewPhase && isChecked && !isCorrect;

                                                    const rowClass = isReviewPhase
                                                        ? (isCorrect
                                                            ? "border border-[#1e8f3f] bg-[#eef9f1] text-[#0f6f2f]"
                                                            : isIncorrectSelection
                                                                ? "border border-[#cc5d5d] bg-[#fff1f1] text-[#c4302b]"
                                                                : "border border-gray-300 text-gray-500 opacity-70")
                                                        : (isChecked
                                                            ? "border-[#0e76a8] bg-[#f0f7fb] text-[#0e76a8] ring-1 ring-[#0e76a8]"
                                                            : "border-gray-300 text-gray-700");

                                                    return (
                                                        <label
                                                            key={option.value}
                                                            className={`mock-option-selector flex items-center justify-center gap-2 rounded-md border px-4 py-3 min-w-[100px] ${isReviewPhase ? "cursor-default" : "cursor-pointer hover:bg-gray-50 transition-colors"} ${rowClass}`}
                                                            data-testid={`mock-nat-tf-${option.label}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`q-${questionUid}`}
                                                                value={option.value}
                                                                checked={isChecked}
                                                                onChange={() => {
                                                                    if (!isReviewPhase) {
                                                                        saveResponse(questionUid, option.value);
                                                                    }
                                                                }}
                                                                disabled={isReviewPhase}
                                                                className="h-[18px] w-[18px] flex-shrink-0 cursor-pointer accent-[#0e76a8] focus:ring-0"
                                                            />
                                                            <span className="mock-option-label text-[16px] font-bold">
                                                                {option.label}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center p-3 bg-[#f3f4f6] rounded-md border border-gray-300 w-[180px]">
                                            <input
                                                ref={natInputRef}
                                                type="text"
                                                inputMode="text"
                                                data-testid="mock-nat-input"
                                                value={currentResponse || ""}
                                                onChange={handleNatChange}
                                                readOnly={isReviewPhase}
                                                className="h-8 w-full mb-2 border-[2px] border-black bg-white px-2 text-[15px] font-bold focus:outline-none"
                                            />
                                            {!isReviewPhase ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="w-full h-8 mb-2 rounded border border-gray-400 bg-[#e0dfe5] text-[14px] font-bold shadow-sm hover:bg-[#d0cfd5] active:bg-[#c0bfc5]"
                                                        onClick={handleNatBackspace}
                                                    >
                                                        Backspace
                                                    </button>
                                                    <div className="grid grid-cols-3 gap-1.5 mb-2 w-full">
                                                        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '-'].map(key => (
                                                            <button
                                                                key={key}
                                                                type="button"
                                                                className="h-9 w-full rounded border border-gray-400 bg-[#f4f4f4] text-[16px] font-bold shadow-sm hover:bg-[#e8e8e8] active:bg-[#d8d8d8]"
                                                                onClick={() => handleNatInsert(key)}
                                                            >
                                                                {key}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-center gap-1.5 mb-2 w-full">
                                                        <button
                                                            type="button"
                                                            className="flex-1 h-8 rounded border border-gray-400 bg-[#e0dfe5] text-[16px] font-bold shadow-sm flex items-center justify-center hover:bg-[#d0cfd5] active:bg-[#c0bfc5]"
                                                            onClick={() => handleNatArrow('left')}
                                                        >
                                                            &#8592;
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="flex-1 h-8 rounded border border-gray-400 bg-[#e0dfe5] text-[16px] font-bold shadow-sm flex items-center justify-center hover:bg-[#d0cfd5] active:bg-[#c0bfc5]"
                                                            onClick={() => handleNatArrow('right')}
                                                        >
                                                            &#8594;
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="w-full h-8 rounded border border-gray-400 bg-[#e0dfe5] text-[14px] font-bold shadow-sm hover:bg-[#d0cfd5] active:bg-[#c0bfc5]"
                                                        onClick={() => saveResponse(questionUid, "")}
                                                    >
                                                        Clear All
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-2 flex flex-col gap-3">
                                    {displayOptions.length === 0 ? (
                                        <div className="rounded border border-[#e1c3c3] bg-[#fff6f6] px-3 py-2 text-sm text-[#8b2a2a]">
                                            Options unavailable for this question data.
                                        </div>
                                    ) : (
                                        <div
                                            className="mt-1 flex flex-col gap-2"
                                            data-testid="mock-options-display"
                                        >
                                            {displayOptions.length > 0 ? (
                                                <div className="mb-4 flex flex-col gap-2 border-b border-gray-200 pb-4">
                                                    {displayOptions.map((option, index) => {
                                                        const optionHtml = normalizeHtmlAssetUrls(option.html || option.text || "");
                                                        if (!optionHtml) return null;
                                                        return (
                                                            <div key={index} className="flex items-start gap-2 text-[15px] text-gray-800">
                                                                <span className="font-bold flex-shrink-0">{OPTION_LABELS[index] ?? option.label}.</span>
                                                                <MathContent
                                                                    as="div"
                                                                    dynamic
                                                                    className="mock-option-text flex-1 overflow-auto"
                                                                >
                                                                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(optionHtml) }} />
                                                                </MathContent>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}

                                            <div className="font-semibold text-gray-700 mb-1">Select your answer:</div>
                                            <div className="flex flex-row flex-wrap gap-4">
                                                {displayOptions.map((option, index) => {
                                                    const optionValue = option.label;
                                                    const isChecked = isMSQ
                                                        ? Array.isArray(currentResponse) && currentResponse.includes(optionValue)
                                                        : currentResponse === optionValue;
                                                    const isCorrect = isReviewPhase && correctOptionSet.has(optionValue);
                                                    const isIncorrectSelection = isReviewPhase && isChecked && !isCorrect;
                                                    const rowClass = isReviewPhase
                                                        ? (isCorrect
                                                            ? "border border-[#1e8f3f] bg-[#eef9f1] text-[#0f6f2f]"
                                                            : isIncorrectSelection
                                                                ? "border border-[#cc5d5d] bg-[#fff1f1] text-[#c4302b]"
                                                                : "border border-gray-300 text-gray-500 opacity-70")
                                                        : (isChecked ? "border-[#0e76a8] bg-[#f0f7fb] text-[#0e76a8] ring-1 ring-[#0e76a8]" : "border-gray-300 text-gray-700");

                                                    return (
                                                        <label
                                                            key={optionValue}
                                                            className={`mock-option-selector flex items-center justify-center gap-2 rounded-md border px-4 py-3 min-w-[70px] ${isReviewPhase ? "cursor-default" : "cursor-pointer hover:bg-gray-50 transition-colors"} ${rowClass}`}
                                                            data-testid={`mock-option-selector-${OPTION_LABELS[index] ?? optionValue}`}
                                                        >
                                                            <input
                                                                type={isMSQ ? "checkbox" : "radio"}
                                                                name={`q-${questionUid}`}
                                                                value={optionValue}
                                                                checked={isChecked}
                                                                onChange={() => handleOptionSelect(optionValue)}
                                                                disabled={isReviewPhase}
                                                                className={`h-[18px] w-[18px] flex-shrink-0 cursor-pointer accent-[#0e76a8] focus:ring-0 ${isMSQ ? "rounded-sm" : ""}`}
                                                            />
                                                            <span className="mock-option-label text-[16px] font-bold">
                                                                {OPTION_LABELS[index] ?? optionValue}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
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
