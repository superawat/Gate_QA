import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const MockTestResults = ({ onExit, onReview }) => {
    const { questions, STATUS, questionStates } = useMockTest();

    const answeredCount = Object.values(questionStates).filter(
        (state) => state === STATUS.ANSWERED || state === STATUS.ANSWERED_AND_MARKED_FOR_REVIEW
    ).length;

    return (
        <div className="mocktest-root flex h-screen w-full flex-col items-center bg-gray-50 px-4 py-10 text-gray-800">
            <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
                <h2 className="mb-2 text-center text-3xl font-bold text-[#125B9A]">Exam Submitted Successfully</h2>
                <p className="mb-8 border-b pb-6 text-center text-gray-500">Your responses have been recorded.</p>

                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-800">Total Questions</div>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{answeredCount}</div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-green-800">Answered</div>
                    </div>
                    <div className="rounded-lg border border-purple-100 bg-purple-50 p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">
                            {Object.values(questionStates).filter((state) => state === STATUS.MARKED_FOR_REVIEW).length}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-purple-800">Marked Review</div>
                    </div>
                    <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                            {questions.length - answeredCount}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-red-800">Not Answered</div>
                    </div>
                </div>

                <div className="mt-10 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onReview}
                        className="rounded-lg border border-[#0f4f87] bg-[#125B9A] px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-[#0e497d]"
                    >
                        Review Questions
                    </button>
                    <button
                        type="button"
                        onClick={onExit}
                        className="rounded-lg border border-[#aebccc] bg-white px-8 py-3 font-bold text-[#27425d] shadow-sm transition-all hover:bg-[#f0f5f9]"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MockTestResults;
