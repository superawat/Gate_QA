import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const totalMinutes = Math.floor(safeSeconds / 60);
    const s = Math.floor(safeSeconds % 60).toString().padStart(2, "0");
    return `${totalMinutes}:${s}`;
};

const MockTestHeader = ({
    timeLeft,
    onToggleCalculator,
    isCalculatorOpen,
    calculatorButtonRef,
}) => {
    const {
        currentSection,
        setCurrentSection,
        sectionQuestionUids,
        questionStates,
        STATUS,
    } = useMockTest();

    const [openPopoverSection, setOpenPopoverSection] = useState(null);
    const [isAvatarFallback, setIsAvatarFallback] = useState(false);
    const popoverRef = useRef(null);

    // Close popover on outside click
    useEffect(() => {
        if (!openPopoverSection) return;
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

    // Compute per-section stats for the info popover (Issue 003)
    const computeSectionStats = useCallback(
        (section) => {
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
                    case STATUS.NOT_VISITED:
                    default:
                        stats.not_visited += 1;
                        break;
                }
            });
            return stats;
        },
        [questionStates, sectionQuestionUids, STATUS]
    );

    const popoverStats = useMemo(() => {
        if (!openPopoverSection) return null;
        return computeSectionStats(openPopoverSection);
    }, [openPopoverSection, computeSectionStats]);

    const renderInfoPopover = (section) => {
        if (openPopoverSection !== section || !popoverStats) return null;

        return (
            <div
                ref={popoverRef}
                className="mocktest-section-info-popover"
            >
                <div className="mocktest-popover-title">
                    {section === "GA" ? "General Aptitude" : "Computer Science"} — Status
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
            {/* ── Line 1: Exam Banner ── */}
            <div className="mocktest-top-banner flex w-full items-center justify-between px-4">
                <img
                    src="mocktest/gate-logo-left-new.png"
                    alt="GATE logo"
                    className="mocktest-top-logo h-12 w-12 object-contain"
                />
                <div className="mocktest-top-center text-center">
                    <div className="mocktest-top-title">Graduate Aptitude Test in Engineering (GATE 2027)</div>
                    <div className="mocktest-top-subtitle">Organizing Institute: Indian Institute of Technology Madras (IIT Madras)</div>
                </div>
                <img
                    src="/Gate_QA/iit-madras-logo.svg"
                    alt="Institute logo"
                    className="mocktest-top-logo h-11 w-11 object-contain"
                />
            </div>

            {/* ── Line 2: Black Exam Info Bar ── */}
            <header className="mocktest-header flex w-full items-center justify-between bg-[#2f2f31] px-3 text-white sm:px-4">
                <h1 className="mocktest-header-title truncate pr-3 text-[13px] font-medium text-[#ffe22a] md:text-[14px]">
                    CS 2 Computer Science and Information Technology Mock
                </h1>

                <div className="mocktest-header-actions flex shrink-0 items-center gap-4">
                    <button className="mocktest-header-btn" type="button" aria-label="Instructions">
                        <img src="mocktest/info.gif" alt="" className="h-4 w-4" />
                        <span>Instructions</span>
                    </button>
                    <button className="mocktest-header-btn" type="button" aria-label="Question Paper">
                        <span className="mocktest-paper-icon" aria-hidden="true"></span>
                        <span>Question Paper</span>
                    </button>
                </div>
            </header>

            {/* ── Lines 3–5 Grid: left content + right profile column ── */}
            <div className="mocktest-header-grid">
                {/* Left column: Lines 3-5 content */}
                <div className="mocktest-header-left">
                    {/* ── Line 3: Tools and Subject Line ── */}
                    <div className="mocktest-info-row flex items-center justify-between px-3">
                        <div className="mocktest-info-left">
                            <span className="mocktest-row-arrow" aria-hidden="true">‹</span>
                            <button
                                type="button"
                                className="mocktest-current-section-pill"
                            >
                                <span className="truncate">CS 2 Computer Scienc...</span>
                                <img src="mocktest/info.gif" alt="" className="h-4 w-4" />
                            </button>
                            <span className="mocktest-row-arrow" aria-hidden="true">›</span>
                        </div>

                        <div className="mocktest-section-tools flex shrink-0 items-center gap-3">
                            <button
                                ref={calculatorButtonRef}
                                type="button"
                                onClick={onToggleCalculator}
                                aria-label="Open calculator"
                                aria-expanded={isCalculatorOpen}
                                title="Calculator"
                                className={`mocktest-calc-btn ${isCalculatorOpen ? "is-open" : ""}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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
                        </div>
                    </div>

                    {/* ── Line 4: Sections + Timer ── */}
                    <div className="mocktest-sections-label-row flex items-center justify-between px-4">
                        <span className="mocktest-sections-label">Sections</span>
                        <div className="mocktest-timer">
                            <span className="mocktest-timer-label">Time Left :</span>
                            <span className="mocktest-timer-value" data-testid="mock-timer-value">{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    {/* ── Line 5: Section Switch Tabs ── */}
                    <div className="mocktest-tabs-row flex items-center gap-2 px-2">
                        <span className="mocktest-row-arrow ml-1" aria-hidden="true">‹</span>
                        <div className="mocktest-section-tabs">
                            <div className="mocktest-section-tab-wrap">
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection("GA")}
                                    className={`mocktest-section-tab ${currentSection === "GA" ? "is-active" : ""}`}
                                >
                                    <span>General Aptitude</span>
                                    <img
                                        src="mocktest/info.gif"
                                        alt="Section info"
                                        className="h-4 w-4 mocktest-info-icon"
                                        onClick={(e) => handleInfoClick("GA", e)}
                                    />
                                </button>
                                {renderInfoPopover("GA")}
                            </div>
                            <div className="mocktest-section-tab-wrap">
                                <button
                                    type="button"
                                    onClick={() => setCurrentSection("CS")}
                                    className={`mocktest-section-tab ${currentSection === "CS" ? "is-active" : ""}`}
                                >
                                    <span>CS 2 Computer Scienc...</span>
                                    <img
                                        src="mocktest/info.gif"
                                        alt="Section info"
                                        className="h-4 w-4 mocktest-info-icon"
                                        onClick={(e) => handleInfoClick("CS", e)}
                                    />
                                </button>
                                {renderInfoPopover("CS")}
                            </div>
                        </div>
                        <span className="mocktest-row-arrow ml-auto mr-1" aria-hidden="true">›</span>
                    </div>
                </div>

                {/* Right column: Profile spanning lines 3–5 */}
                <div className="mocktest-header-profile">
                    <div className="mocktest-profile-avatar-wrap">
                        {!isAvatarFallback ? (
                            <img
                                src="mocktest/NewCandidateImage.jpg"
                                alt="Candidate photo"
                                className="h-full w-full object-cover"
                                onError={() => setIsAvatarFallback(true)}
                            />
                        ) : (
                            <svg
                                viewBox="0 0 64 64"
                                aria-label="Candidate placeholder"
                                role="img"
                                className="h-full w-full bg-[#d7dde3]"
                            >
                                <circle cx="32" cy="23" r="12" fill="#9aa9b7" />
                                <path d="M12 56c2-11 11-18 20-18s18 7 20 18" fill="#9aa9b7" />
                            </svg>
                        )}
                    </div>
                    <span className="mocktest-profile-name">John Smith</span>
                </div>
            </div>
        </div>
    );
};

export default MockTestHeader;
