import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const MockTestResults = ({ onExit }) => {
    const { questions, responses, STATUS, questionStates } = useMockTest();

    // Basic mock scoring logic - normally this requires matching true answers
    // For UI replication we just show a summary of states
    const answeredCount = Object.values(questionStates).filter(
        (s) => s === STATUS.ANSWERED || s === STATUS.ANSWERED_AND_MARKED_FOR_REVIEW
    ).length;

    return (
        <div className="flex h-screen w-full flex-col items-center bg-gray-50 py-10 px-4 text-gray-800">
            <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-lg border border-gray-200">
                <h2 className="text-3xl font-bold text-[#125B9A] mb-2 text-center">Exam Submitted Successfully</h2>
                <p className="text-center text-gray-500 mb-8 border-b pb-6">Your responses have been recorded.</p>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                        <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
                        <div className="text-xs uppercase tracking-wide text-blue-800 font-semibold mt-1">Total Questions</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                        <div className="text-3xl font-bold text-green-600">{answeredCount}</div>
                        <div className="text-xs uppercase tracking-wide text-green-800 font-semibold mt-1">Answered</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
                        <div className="text-3xl font-bold text-purple-600">
                            {Object.values(questionStates).filter(s => s === STATUS.MARKED_FOR_REVIEW).length}
                        </div>
                        <div className="text-xs uppercase tracking-wide text-purple-800 font-semibold mt-1">Marked Review</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                        <div className="text-3xl font-bold text-red-600">
                            {questions.length - answeredCount}
                        </div>
                        <div className="text-xs uppercase tracking-wide text-red-800 font-semibold mt-1">Not Answered</div>
                    </div>
                </div>

                <div className="flex justify-center mt-10">
                    <button
                        onClick={onExit}
                        className="bg-[#125B9A] hover:bg-[#0e497d] text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MockTestResults;
