import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const MockTestActionBar = () => {
    const {
        saveAndNext,
        markForReviewAndNext,
        clearResponse,
        submitTest
    } = useMockTest();

    return (
        <div className="flex w-full items-center justify-between border-t border-gray-300 bg-[#f8f9fa] shadow-[0_-2px_5px_rgba(0,0,0,0.05)] font-sans px-4 py-3 h-[60px] flex-shrink-0 z-10 relative">

            <div className="flex gap-4">
                <button
                    onClick={markForReviewAndNext}
                    className="border border-[#bbb] bg-[#fefefe] px-4 py-1.5 text-[14px] text-black shadow-sm hover:bg-[#eaeaea] font-[500] rounded-[2px]"
                >
                    Mark for Review & Next
                </button>
                <button
                    onClick={clearResponse}
                    className="border border-[#bbb] bg-[#fefefe] px-4 py-1.5 text-[14px] text-black shadow-sm hover:bg-[#eaeaea] font-[500] rounded-[2px]"
                >
                    Clear Response
                </button>
            </div>

            <div className="flex gap-4 items-center">
                <button
                    onClick={saveAndNext}
                    className="bg-[#0e76a8] border border-[#0d6b97] px-6 py-1.5 text-[14px] font-bold text-white shadow hover:bg-[#0c668e] rounded-[2px]"
                >
                    Save & Next
                </button>
            </div>

            {/* Submit button on right edge of panel */}
            <div className="flex shrink-0 min-w-[120px] ml-4 bg-[#e8f4fd] h-full items-center justify-center -mr-4 border-l border-gray-300">
                <button
                    onClick={submitTest}
                    className="bg-[#5bc0de] border border-[#46b8da] px-6 py-1.5 text-[14px] font-bold text-white shadow hover:bg-[#39b3d7] rounded-[2px]"
                >
                    Submit
                </button>
            </div>

        </div>
    );
};

export default MockTestActionBar;
