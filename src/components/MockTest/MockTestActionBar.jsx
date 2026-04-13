import React, { useState } from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const getBaseAssetUrl = () => (
    import.meta.env.BASE_URL.endsWith("/")
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`
);

const MockTestActionBar = ({
    isReviewPhase = false,
    onBackToResults,
    isPaletteCollapsed = false,
    onExitAttempt,
}) => {
    const {
        saveAndNext,
        markForReviewAndNext,
        clearResponse,
        goToPrevious,
        goToNext,
        submitTest,
        currentSectionIndex,
    } = useMockTest();
    const [showSubmitWarning, setShowSubmitWarning] = useState(false);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const baseAssetUrl = getBaseAssetUrl();

    if (isReviewPhase) {
        return (
            <div className="mocktest-action-bar relative z-10 flex w-full items-center justify-between border-t border-[#b8c6d5] bg-[#f2f6fa] px-4 py-2 shadow-[0_-1px_3px_rgba(0,0,0,0.08)]">
                <div className="text-[12px] font-semibold text-[#32495f]">Review Mode</div>
                <div className="mocktest-action-zone flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goToPrevious}
                        className="mocktest-action-btn whitespace-nowrap rounded-[2px] border border-[#adb9c5] bg-white px-4 text-[12px] font-semibold text-[#1c2a3a] hover:bg-[#ecf1f5]"
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={goToNext}
                        className="mocktest-action-btn whitespace-nowrap rounded-[2px] border border-[#adb9c5] bg-white px-4 text-[12px] font-semibold text-[#1c2a3a] hover:bg-[#ecf1f5]"
                    >
                        Next
                    </button>
                    <button
                        type="button"
                        onClick={onBackToResults}
                        className="mocktest-action-btn whitespace-nowrap rounded-[2px] border border-[#0d6ea1] bg-[#0e76a8] px-4 text-[12px] font-semibold text-white hover:bg-[#0c688f]"
                    >
                        Back to Summary
                    </button>
                </div>
            </div>
        );
    }

    // Option A parity: keep submit lane at expanded palette width even when palette is collapsed.
    // This keeps Submit footer-owned and prevents width/label jitter when the palette toggles.
    const submitLaneStateClass = isPaletteCollapsed
        ? "submit-lane--collapsed mocktest-submit-lane--collapsed"
        : "submit-lane--expanded mocktest-submit-lane--expanded";

    return (
        <>
            <div className="mocktest-action-bar relative z-10 flex w-full items-stretch border-t border-[#b8c6d5] bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.08)]">
                {/* Left zone: Mark for Review & Next, Clear Response */}
                <div className="mocktest-action-main flex flex-wrap min-w-0 flex-1 items-center justify-between gap-5 px-4 py-2">
                    <div className="mocktest-action-zone flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={markForReviewAndNext}
                            className="mocktest-action-btn whitespace-nowrap rounded-[2px] border border-[#adb9c5] bg-white px-4 text-[12px] font-semibold text-[#1c2a3a] hover:bg-[#ecf1f5]"
                        >
                            Mark for Review &amp; Next
                        </button>
                        <button
                            type="button"
                            onClick={clearResponse}
                            className="mocktest-action-btn whitespace-nowrap rounded-[2px] border border-[#adb9c5] bg-white px-4 text-[12px] font-semibold text-[#1c2a3a] hover:bg-[#ecf1f5]"
                        >
                            Clear Response
                        </button>
                    </div>

                    {/* Right zone: Previous (conditional), Save & Next */}
                    <div className="mocktest-action-zone ml-auto flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
                        {currentSectionIndex > 0 && (
                            <button
                                type="button"
                                onClick={goToPrevious}
                                className="mocktest-action-btn whitespace-nowrap rounded-[2px] border border-[#adb9c5] bg-white px-5 text-[12px] font-semibold text-[#1c2a3a] hover:bg-[#ecf1f5]"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={saveAndNext}
                            className="mocktest-action-btn whitespace-nowrap rounded-[2px] border border-[#0d6b97] bg-[#0e76a8] px-5 text-[12px] font-semibold text-white hover:bg-[#0c688f]"
                        >
                            Save &amp; Next
                        </button>
                    </div>
                </div>

                {/* Submit zone (aligned with sidebar width) — Issue 005 */}
                <div
                    data-testid="mock-submit-lane"
                    className={`mocktest-submit-lane flex items-center justify-center gap-2 px-3 ${submitLaneStateClass}`}
                >
                    <button
                        data-testid="mock-exit-button"
                        type="button"
                        onClick={() => setShowExitWarning(true)}
                        className="mocktest-action-btn whitespace-nowrap rounded-[2px] border border-[#adb9c5] bg-white px-4 text-[12px] font-semibold text-[#1c2a3a] hover:bg-[#ecf1f5]"
                    >
                        Exit Test
                    </button>
                    <button
                        data-testid="mock-submit-button"
                        type="button"
                        onClick={() => setShowSubmitWarning(true)}
                        className="mocktest-action-submit-btn whitespace-nowrap rounded-[2px] border border-[#0d6b97] bg-[#0e76a8] px-7 text-[13px] font-semibold text-white hover:bg-[#0c688f]"
                    >
                        Submit
                    </button>
                </div>
            </div>

            {/* Submit confirmation modal */}
            {showSubmitWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mocktest-submit-modal w-[400px] max-w-[90vw] rounded bg-white p-5 shadow-xl">
                        <div className="mb-3 flex items-start gap-3">
                            <img
                                src={`${baseAssetUrl}mocktest/warning-icon.png`}
                                alt="Warning"
                                className="mt-0.5 h-7 w-7 shrink-0"
                            />
                            <div>
                                <h3 className="mb-1 text-base font-bold text-[#1a2a3a]">Submit Confirmation</h3>
                                <p className="text-sm leading-5 text-[#3a4c5f]">
                                    Are you sure you want to submit the exam? Once submitted, answers cannot be changed.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowSubmitWarning(false)}
                                className="rounded border border-[#b2bfcb] bg-white px-4 py-1.5 text-sm font-semibold text-[#30465d] hover:bg-[#f1f5f8]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSubmitWarning(false);
                                    submitTest();
                                }}
                                className="rounded border border-[#0d6ea1] bg-[#0e76a8] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#0c688f]"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showExitWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mocktest-submit-modal w-[400px] max-w-[90vw] rounded bg-white p-5 shadow-xl">
                        <div className="mb-3 flex items-start gap-3">
                            <img
                                src={`${baseAssetUrl}mocktest/warning-icon.png`}
                                alt="Warning"
                                className="mt-0.5 h-7 w-7 shrink-0"
                            />
                            <div>
                                <h3 className="mb-1 text-base font-bold text-[#1a2a3a]">Exit Confirmation</h3>
                                <p className="text-sm leading-5 text-[#3a4c5f]">
                                    Exit this mock test now? Your current attempt will be discarded and nothing will be saved.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowExitWarning(false)}
                                className="rounded border border-[#b2bfcb] bg-white px-4 py-1.5 text-sm font-semibold text-[#30465d] hover:bg-[#f1f5f8]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowExitWarning(false);
                                    onExitAttempt?.();
                                }}
                                className="rounded border border-[#0d6ea1] bg-[#0e76a8] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#0c688f]"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MockTestActionBar;
