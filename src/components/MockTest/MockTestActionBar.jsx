import React, { useState } from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const MockTestActionBar = () => {
    const {
        saveAndNext,
        markForReviewAndNext,
        clearResponse,
        submitTest,
        goToPrevious
    } = useMockTest();

    const [showSubmitWarning, setShowSubmitWarning] = useState(false);

    const handleSubmitClick = () => {
        setShowSubmitWarning(true);
    };

    const handleConfirmSubmit = () => {
        setShowSubmitWarning(false);
        submitTest();
    };

    return (
        <>
            <div className="flex w-full items-center justify-between border-t border-gray-300 bg-[#f8f9fa] shadow-[0_-2px_5px_rgba(0,0,0,0.05)] px-4 py-3 h-[60px] flex-shrink-0 z-10 relative">

                <div className="flex gap-4">
                    <button
                        onClick={markForReviewAndNext}
                        className="border border-[#bbb] bg-[#fefefe] px-4 py-1.5 text-[14px] text-black shadow-sm hover:bg-[#eaeaea] font-[500] rounded-[2px]"
                    >
                        Mark for Review &amp; Next
                    </button>
                    <button
                        onClick={clearResponse}
                        className="border border-[#bbb] bg-[#fefefe] px-4 py-1.5 text-[14px] text-black shadow-sm hover:bg-[#eaeaea] font-[500] rounded-[2px]"
                    >
                        Clear Response
                    </button>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Previous button matching GATE UI */}
                    <button
                        onClick={goToPrevious}
                        className="flex items-center gap-1.5 border border-[#bbb] bg-[#fefefe] px-4 py-1.5 text-[14px] text-black shadow-sm hover:bg-[#eaeaea] font-[500] rounded-[2px]"
                    >
                        <img src="mocktest/previnactive.png" alt="" className="h-4 w-4" />
                        Previous
                    </button>
                    <button
                        onClick={saveAndNext}
                        className="bg-[#0e76a8] border border-[#0d6b97] px-6 py-1.5 text-[14px] font-bold text-white shadow hover:bg-[#0c668e] rounded-[2px]"
                    >
                        Save &amp; Next
                    </button>
                </div>

                {/* Submit button on right edge of panel */}
                <div className="flex shrink-0 min-w-[120px] ml-4 bg-[#e8f4fd] h-full items-center justify-center -mr-4 border-l border-gray-300">
                    <button
                        onClick={handleSubmitClick}
                        className="bg-[#5bc0de] border border-[#46b8da] px-6 py-1.5 text-[14px] font-bold text-white shadow hover:bg-[#39b3d7] rounded-[2px]"
                    >
                        Submit
                    </button>
                </div>

            </div>

            {/* Submit Confirmation Modal with warning icon */}
            {showSubmitWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-[420px] max-w-[90vw] p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <img
                                src="mocktest/warning-icon.png"
                                alt="Warning"
                                className="h-8 w-8 shrink-0 mt-0.5"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Submit Exam?</h3>
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to submit your exam? Once submitted, you cannot change your answers.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowSubmitWarning(false)}
                                className="border border-gray-300 bg-white px-5 py-1.5 text-sm font-medium text-gray-700 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="bg-[#0e76a8] px-5 py-1.5 text-sm font-bold text-white rounded hover:bg-[#0c668e]"
                            >
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MockTestActionBar;
