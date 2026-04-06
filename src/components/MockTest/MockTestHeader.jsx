import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const totalMinutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = Math.floor(safeSeconds % 60).toString().padStart(2, "0");
    return `${totalMinutes}:${remainingSeconds}`;
};

const MOCK_KIND_LABELS = {
    full_length: "Full Mock",
    paper_mode: "Past Paper",
    mini_15: "Mini mock 15Q",
    mini_25: "Mini mock 25Q",
    custom: "Custom Builder",
};

const getBaseAssetUrl = () => (
    import.meta.env.BASE_URL.endsWith("/")
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`
);

const MockTestHeader = ({
    timeLeft,
    onToggleCalculator,
    isCalculatorOpen,
    calculatorButtonRef,
}) => {
    const {
        attemptMeta,
        currentSection,
        questionStates,
        sectionQuestionUids,
        setCurrentSection,
        STATUS,
    } = useMockTest();

    const [openPopoverSection, setOpenPopoverSection] = useState(null);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const popoverRef = useRef(null);
    const baseAssetUrl = getBaseAssetUrl();

    useEffect(() => {
        if (!openPopoverSection) return undefined;

        const handleClick = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setOpenPopoverSection(null);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [openPopoverSection]);

    const handleInfoClick = useCallback((section, event) => {
        event.stopPropagation();
        setOpenPopoverSection((prev) => (prev === section ? null : section));
    }, []);

    const computeSectionStats = useCallback((section) => {
        const uids = section === "CS" ? sectionQuestionUids.CS : sectionQuestionUids.GA;
        const stats = {
            answered: 0,
            not_answered: 0,
            not_visited: 0,
            review: 0,
            review_answered: 0,
        };

        uids.forEach((uid) => {
            const state = questionStates[uid] || STATUS.NOT_VISITED;
            switch (state) {
                case STATUS.ANSWERED:
                    stats.answered += 1;
                    break;
                case STATUS.NOT_ANSWERED:
                    stats.not_answered += 1;
                    break;
                case STATUS.MARKED_FOR_REVIEW:
                    stats.review += 1;
                    break;
                case STATUS.ANSWERED_AND_MARKED_FOR_REVIEW:
                    stats.review_answered += 1;
                    break;
                default:
                    stats.not_visited += 1;
                    break;
            }
        });

        return stats;
    }, [questionStates, sectionQuestionUids, STATUS]);

    const popoverStats = useMemo(() => {
        if (!openPopoverSection) return null;
        return computeSectionStats(openPopoverSection);
    }, [computeSectionStats, openPopoverSection]);

    const totalQuestions = sectionQuestionUids.GA.length + sectionQuestionUids.CS.length;
    const attemptKindLabel = attemptMeta?.kindTitle
        || MOCK_KIND_LABELS[attemptMeta?.kindId]
        || "Mock Test";
    const attemptPaperLabel = String(attemptMeta?.selectedPaperLabel || "").trim();
    const attemptTitle = attemptPaperLabel
        ? `GATE CSE ${attemptPaperLabel} Mock`
        : attemptKindLabel;
    const attemptSubtitle = attemptPaperLabel
        ? `Validated paper order | ${attemptKindLabel}`
        : `${totalQuestions || attemptMeta?.questionCount || 0} validated questions`;
    const durationLabel = attemptMeta?.durationMinutes
        ? `${attemptMeta.durationMinutes} min`
        : "180 min";
    const currentSectionLabel = currentSection === "GA"
        ? "General Aptitude"
        : "Computer Science and Information Technology";

    const renderInfoPopover = (section) => {
        if (openPopoverSection !== section || !popoverStats) return null;

        return (
            <div ref={popoverRef} className="mocktest-section-info-popover">
                <div className="mocktest-popover-title">
                    {section === "GA" ? "General Aptitude" : "Computer Science"} Status
                </div>
                <div className="mocktest-popover-grid">
                    <div className="mocktest-popover-row">
                        <span className="status-badge answered">{popoverStats.answered}</span>
                        <span>Answered</span>
                    </div>
                    <div className="mocktest-popover-row">
                        <span className="status-badge not_answered">{popoverStats.not_answered}</span>
                        <span>Not Answered</span>
                    </div>
                    <div className="mocktest-popover-row">
                        <span className="status-badge not_visited">{popoverStats.not_visited}</span>
                        <span>Not Visited</span>
                    </div>
                    <div className="mocktest-popover-row">
                        <span className="status-badge review">{popoverStats.review}</span>
                        <span>Marked for Review</span>
                    </div>
                    <div className="mocktest-popover-row">
                        <span className="status-badge review_answered">
                            {popoverStats.review_answered}
                            <span className="review-check"></span>
                        </span>
                        <span>Answered & Marked for Review</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mocktest-header-wrap w-full">
            <div className="mocktest-top-banner flex w-full items-center justify-between gap-4 px-4">
                <img
                    src={`${baseAssetUrl}mocktest/gate-logo-left-new.png`}
                    alt="GATE logo"
                    className="mocktest-top-logo h-12 w-12 object-contain"
                />
                <div className="mocktest-top-center text-center">
                    <div className="mocktest-top-title">Graduate Aptitude Test in Engineering Mock</div>
                </div>
                <img
                    src={`${baseAssetUrl}iit-madras-logo.svg`}
                    alt="Institute logo"
                    className="mocktest-top-logo h-11 w-11 object-contain"
                />
            </div>

            <header className="mocktest-header flex w-full items-center justify-between bg-[#2f2f31] px-3 text-white sm:px-4">
                <div className="flex items-center gap-2 truncate pr-3">
                    <h1 className="mocktest-header-title text-[13px] font-medium text-[#ffe22a] md:text-[14px] shrink-0">
                        {attemptTitle}
                    </h1>
                    <span className="text-[13px] text-gray-500 hidden sm:inline shrink-0">|</span>
                    <span className="text-[12px] md:text-[13px] font-medium text-[#add3ff] truncate hidden sm:inline">
                        {currentSectionLabel} <span className="text-[#8baecf] ml-1">| {attemptSubtitle}</span>
                    </span>
                </div>

                <div className="mocktest-header-actions flex shrink-0 items-center gap-4">
                    <button
                        className="mocktest-header-btn"
                        type="button"
                        aria-label="Instructions"
                        onClick={() => setIsInstructionsOpen(true)}
                    >
                        <span>Instructions</span>
                    </button>
                </div>
            </header>

            <div className="mocktest-header-grid">
                <div className="mocktest-header-left">
                    <div className="flex flex-nowrap items-center justify-between gap-2 px-3 py-1 bg-[#dfdfdf] border-b border-[#b9b9b9] min-h-[36px]">
                        {/* Section Information Inline */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* Section Tabs */}
                            <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0 shrink">
                                <span className="font-semibold text-[13px] text-[#243446]">
                                    Sections:
                                </span>
                                <div className="flex items-center gap-1 min-w-0">
                                    <div className="mocktest-section-tab-wrap min-w-0 shrink">
                                        <div className={`mocktest-section-tab !min-w-0 !px-2 !py-0.5 ${currentSection === "GA" ? "is-active" : ""}`}>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentSection("GA")}
                                                className="truncate text-left text-[12px]"
                                            >
                                                <span className="hidden md:inline">General Aptitude</span>
                                                <span className="md:hidden">GA</span>
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="General Aptitude status"
                                                className="mocktest-info-icon flex h-3 w-3 items-center justify-center rounded-full border border-[#98a6b5] text-[9px]"
                                                onClick={(event) => handleInfoClick("GA", event)}
                                            >
                                                i
                                            </button>
                                        </div>
                                        {renderInfoPopover("GA")}
                                    </div>
                                    <div className="mocktest-section-tab-wrap min-w-0 shrink">
                                        <div className={`mocktest-section-tab !min-w-0 !px-2 !py-0.5 ${currentSection === "CS" ? "is-active" : ""}`}>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentSection("CS")}
                                                className="truncate text-left text-[12px]"
                                            >
                                                <span className="hidden md:inline">Computer Science and IT</span>
                                                <span className="md:hidden">CS & IT</span>
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="CS status"
                                                className="mocktest-info-icon flex h-3 w-3 items-center justify-center rounded-full border border-[#98a6b5] text-[9px]"
                                                onClick={(event) => handleInfoClick("CS", event)}
                                            >
                                                i
                                            </button>
                                        </div>
                                        {renderInfoPopover("CS")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tools and Timer */}
                        <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
                            <button
                                ref={calculatorButtonRef}
                                type="button"
                                onClick={onToggleCalculator}
                                aria-label="Open calculator"
                                aria-expanded={isCalculatorOpen}
                                title="Calculator"
                                className={`mocktest-calc-btn !h-6 !w-6 ${isCalculatorOpen ? "is-open" : ""}`}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                                    <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
                                    <rect x="5" y="4" width="14" height="5" rx="1" fill="#ffffff" />
                                    <rect x="5" y="11" width="3" height="3" rx="0.5" fill="#ffffff" />
                                    <rect x="10.5" y="11" width="3" height="3" rx="0.5" fill="#ffffff" />
                                    <rect x="16" y="11" width="3" height="3" rx="0.5" fill="#ffffff" />
                                    <rect x="5" y="16" width="3" height="3" rx="0.5" fill="#ffffff" />
                                    <rect x="10.5" y="16" width="3" height="3" rx="0.5" fill="#ffffff" />
                                    <rect x="16" y="16" width="3" height="3" rx="0.5" fill="#ffffff" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-1 font-bold text-[13px]">
                                <span className="text-[#1f2b38]">Time Left :</span>
                                <span className="w-[6.5ch] text-right font-bold tabular-nums text-[#1f2b38]" data-testid="mock-timer-value">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center items-center px-4 bg-[#e8f0f8] border-l border-[#c5d4e2] border-b border-[#b9b9b9]">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#60768c] hidden lg:inline">Attempt:</span>
                        <span className="text-[12px] font-bold text-[#23384c]">{attemptKindLabel}</span>
                    </div>
                    {attemptPaperLabel ? (
                        <span className="text-[10px] text-[#60768c] leading-tight text-center">{attemptPaperLabel}</span>
                    ) : null}
                    <span className="text-[10px] text-[#60768c] leading-tight">
                        {totalQuestions || attemptMeta?.questionCount || 0} qs | {durationLabel}
                    </span>
                </div>
            </div>

            {isInstructionsOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#1f2f40]">Mock Instructions</h2>
                            </div>
                            <button
                                type="button"
                                className="rounded border border-[#b7c7d7] px-3 py-1 text-sm font-semibold text-[#223549]"
                                onClick={() => setIsInstructionsOpen(false)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-sm text-[#31485f]">
                            <div>
                                <div className="font-semibold text-[#1f2f40]">Scoring rules</div>
                                <p className="mt-1">MCQ questions carry negative marking: 1-mark MCQ = -1/3, 2-mark MCQ = -2/3.</p>
                                <p className="mt-1">MSQ and NAT questions have no negative marking.</p>
                            </div>
                            <div>
                                <div className="font-semibold text-[#1f2f40]">Status rules</div>
                                <p className="mt-1">Save & Next records the current response and moves to the next question.</p>
                                <p className="mt-1">Mark for Review & Next keeps the question flagged and still counts an answer if a valid response exists.</p>
                                <p className="mt-1">An empty NAT field or an MSQ with no selected options is treated as unanswered.</p>
                            </div>
                            <div>
                                <div className="font-semibold text-[#1f2f40]">Review mode</div>
                                <p className="mt-1">After submission you can review verdicts, expected answers, tolerance details for NAT, and the score change on each question.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default MockTestHeader;
