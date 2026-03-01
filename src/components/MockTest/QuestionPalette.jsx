import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const QuestionPalette = () => {
    const {
        questions,
        currentQuestionIndex,
        goToQuestion,
        questionStates,
        STATUS,
        currentSection
    } = useMockTest();

    // The states are mapped to these CSS classes in MockTest.css
    const getStatusClass = (uid) => {
        const state = questionStates[uid];
        switch (state) {
            case STATUS.ANSWERED: return "answered pulse";
            case STATUS.NOT_ANSWERED: return "not_answered";
            case STATUS.MARKED_FOR_REVIEW: return "review";
            case STATUS.ANSWERED_AND_MARKED_FOR_REVIEW: return "review_answered";
            case STATUS.NOT_VISITED:
            default: return "not_visited";
        }
    };

    // Calculate stats
    const stats = {
        answered: 0,
        not_answered: 0,
        not_visited: 0,
        review: 0,
        review_answered: 0
    };

    questions.forEach(q => {
        const state = questionStates[q.question_uid] || STATUS.NOT_VISITED;
        switch (state) {
            case STATUS.ANSWERED: stats.answered++; break;
            case STATUS.NOT_ANSWERED: stats.not_answered++; break;
            case STATUS.MARKED_FOR_REVIEW: stats.review++; break;
            case STATUS.ANSWERED_AND_MARKED_FOR_REVIEW: stats.review_answered++; break;
            case STATUS.NOT_VISITED:
            default: stats.not_visited++; break;
        }
    });

    return (
        <div className="flex h-full w-full flex-col bg-[#e8f4fd] border-l border-gray-300 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
            {/* Candidate Info Profile — using the real GATE candidate image */}
            <div className="flex items-center gap-3 border-b border-gray-300 bg-white p-3 shadow-sm h-[75px]">
                <div className="h-12 w-12 overflow-hidden rounded bg-gray-200 border-2 border-gray-300 shadow-inner">
                    <img
                        src="mocktest/NewCandidateImage.jpg"
                        alt="Candidate"
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-[17px] font-bold text-gray-800 tracking-tight">John Smith</span>
                </div>
            </div>

            {/* Legend Area */}
            <div className="flex flex-col gap-2 border-b border-gray-300 bg-white p-3 shadow-sm text-[12px] font-medium text-gray-700">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <span className="status-badge answered">{stats.answered}</span> Answered
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="status-badge not_answered">{stats.not_answered}</span> Not Answered
                    </div>
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <span className="status-badge not_visited">{stats.not_visited}</span> Not Visited
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="status-badge review">{stats.review}</span> Marked for Review
                    </div>
                </div>
                {/* Row 3 */}
                <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                    <span className="status-badge review_answered shrink-0">{stats.review_answered}<span className="review-check"></span></span>
                    <span className="leading-tight text-[11px] text-gray-600">Answered &amp; Marked for Review (will also be evaluated)</span>
                </div>
            </div>

            {/* Palette Header */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="bg-[#0e76a8] py-1.5 px-3 text-[14px] font-bold text-white shadow-md">
                    {currentSection === 'GA' ? 'General Aptitude' : 'CS Computer Science'}
                </div>
                <div className="bg-[#e8ecef] px-3 py-1 text-[13px] font-bold text-gray-800 shadow-inner border-y border-gray-300">
                    Choose a Question
                </div>

                {/* Scrollable button grid */}
                <div className="flex-1 overflow-y-auto p-3 bg-[#e8f4fd]">
                    <div className="grid grid-cols-4 gap-x-2 gap-y-3 pb-8">
                        {questions.map((q, idx) => {
                            // Only show questions matching current section, simple proxy check
                            const isGaList = q.subject === "General Aptitude" || q.title.match(/\bGA\b/i);
                            if (currentSection === 'GA' && !isGaList) return null;
                            if (currentSection === 'CS' && isGaList) return null;

                            const isCurrent = idx === currentQuestionIndex;
                            const status = getStatusClass(q.question_uid);

                            return (
                                <button
                                    key={q.question_uid}
                                    onClick={() => goToQuestion(idx)}
                                    className={`palette-btn ${status} ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#e8f4fd] shadow-lg scale-[1.05]' : 'shadow'}`}
                                >
                                    {idx + 1}
                                    {status === 'review_answered' && <span className="review-check"></span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;
