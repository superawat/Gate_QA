import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const ResultCard = ({ label, value, accentClass }) => (
    <div className={`rounded-lg border p-4 text-center ${accentClass}`}>
        <div className="text-3xl font-bold">{value}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wide">{label}</div>
    </div>
);

const SectionSummaryCard = ({ title, summary }) => (
    <div className="rounded-lg border border-[#d6e0ea] bg-[#f8fbff] p-4">
        <div className="text-sm font-bold text-[#1f2f40]">{title}</div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[#41576c]">
            <div>Total: <span className="font-semibold">{summary.total}</span></div>
            <div>Attempted: <span className="font-semibold">{summary.attempted}</span></div>
            <div>Correct: <span className="font-semibold">{summary.correct}</span></div>
            <div>Incorrect: <span className="font-semibold">{summary.incorrect}</span></div>
            <div>Unanswered: <span className="font-semibold">{summary.unanswered}</span></div>
            <div>Bonus: <span className="font-semibold">{summary.bonus || 0}</span></div>
            <div>Score: <span className="font-semibold">{summary.score} / {summary.maxScore}</span></div>
        </div>
    </div>
);

const MockTestResults = ({ onExit, onReview }) => {
    const { questions, resultSummary } = useMockTest();

    const summary = resultSummary || {
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unanswered: questions.length,
        bonus: 0,
        score: 0,
        maxScore: 0,
        sectionSummary: {
            GA: { total: 0, attempted: 0, correct: 0, incorrect: 0, unanswered: 0, bonus: 0, score: 0, maxScore: 0 },
            CS: { total: 0, attempted: 0, correct: 0, incorrect: 0, unanswered: 0, bonus: 0, score: 0, maxScore: 0 },
        },
    };

    return (
        <div className="mocktest-root flex h-screen w-full flex-col items-center bg-gray-50 px-4 py-10 text-gray-800">
            <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
                <h2 className="mb-2 text-center text-3xl font-bold text-[#125B9A]">Exam Submitted Successfully</h2>
                <p className="mb-8 border-b pb-6 text-center text-gray-500">
                    Your responses have been evaluated. Review mode is available below.
                </p>

                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
                    <ResultCard
                        label="Score"
                        value={`${summary.score} / ${summary.maxScore}`}
                        accentClass="border-blue-100 bg-blue-50 text-blue-700"
                    />
                    <ResultCard
                        label="Attempted"
                        value={summary.attempted}
                        accentClass="border-slate-100 bg-slate-50 text-slate-700"
                    />
                    <ResultCard
                        label="Correct"
                        value={summary.correct}
                        accentClass="border-green-100 bg-green-50 text-green-700"
                    />
                    <ResultCard
                        label="Incorrect"
                        value={summary.incorrect}
                        accentClass="border-red-100 bg-red-50 text-red-700"
                    />
                    <ResultCard
                        label="Unanswered"
                        value={summary.unanswered}
                        accentClass="border-amber-100 bg-amber-50 text-amber-700"
                    />
                    <ResultCard
                        label="Bonus"
                        value={summary.bonus || 0}
                        accentClass="border-emerald-100 bg-emerald-50 text-emerald-700"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <SectionSummaryCard title="General Aptitude" summary={summary.sectionSummary.GA} />
                    <SectionSummaryCard title="Computer Science and IT" summary={summary.sectionSummary.CS} />
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
