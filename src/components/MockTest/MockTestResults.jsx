import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";
import { formatMockTimeSpent } from "../../utils/mockTest";
import { FaExclamationTriangle, FaCheckCircle, FaBook } from "react-icons/fa";

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

const formatQuestionLabel = (result = {}, fallbackIndex = 0) => {
    const section = String(result.section || "").trim().toUpperCase();
    const orderIndex = Number.parseInt(String(result.orderIndex || ""), 10);
    if ((section === "GA" || section === "CS") && Number.isFinite(orderIndex) && orderIndex > 0) {
        return `${section}-${orderIndex}`;
    }
    return `Q${fallbackIndex + 1}`;
};

const TimeDistributionSummary = ({ questions = [], summary }) => {
    const rows = questions
        .map((question, index) => {
            const result = summary?.perQuestionResult?.[question?.question_uid];
            if (!result) return null;
            return {
                key: question.question_uid || `${index}`,
                label: formatQuestionLabel(result, index),
                timeSpentSeconds: Number(result.timeSpentSeconds || 0),
                timeExceededThreshold: Boolean(result.timeExceededThreshold),
            };
        })
        .filter(Boolean);

    const hasTimingData = rows.some((row) => row.timeSpentSeconds > 0)
        || Number(summary?.timeAnalysis?.totalSeconds || 0) > 0;
    if (!rows.length || !hasTimingData) {
        return null;
    }

    const maxSeconds = Math.max(1, ...rows.map((row) => row.timeSpentSeconds));
    const slowCount = Number(summary?.timeAnalysis?.slowQuestionCount || 0);
    const averageSeconds = Number(summary?.timeAnalysis?.averageSeconds || 0);

    return (
        <div className="mt-6 rounded-lg border border-[#d6e0ea] bg-[#f8fbff] p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-sm font-bold text-[#1f2f40]">Per-question time</div>
                    <div className="mt-1 text-xs font-semibold text-[#61758a]">
                        Avg {formatMockTimeSpent(averageSeconds)} | {slowCount} over 3 min
                    </div>
                </div>
                <div className="rounded-full border border-[#f3c26f] bg-[#fff7e6] px-3 py-1 text-xs font-bold text-[#8a4b00]">
                    {formatMockTimeSpent(summary?.timeAnalysis?.totalSeconds)}
                </div>
            </div>

            <div className="mt-4 grid max-h-52 gap-2 overflow-y-auto pr-1">
                {rows.map((row) => {
                    const width = `${Math.max(4, Math.round((row.timeSpentSeconds / maxSeconds) * 100))}%`;
                    return (
                        <div
                            key={row.key}
                            className={`grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 rounded border px-3 py-2 text-xs ${
                                row.timeExceededThreshold
                                    ? "border-[#efb84f] bg-[#fff8e6] text-[#6f4100]"
                                    : "border-[#dbe5ef] bg-white text-[#41576c]"
                            }`}
                        >
                            <span className="truncate font-bold">{row.label}</span>
                            <div className="h-2 overflow-hidden rounded-full bg-[#dce5ef]">
                                <div
                                    className={`h-full rounded-full ${row.timeExceededThreshold ? "bg-[#f0a51b]" : "bg-[#1a8bc5]"}`}
                                    style={{ width }}
                                />
                            </div>
                            <span className="text-right font-bold tabular-nums">
                                {formatMockTimeSpent(row.timeSpentSeconds)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ── Performance Analysis Generator ────────────────────────────────────────── */

const generatePerformanceAnalysis = (questions = [], summary = {}) => {
    const incorrectList = [];
    const slowList = [];
    const weakTopicsMap = new Map();

    questions.forEach((q, idx) => {
        const uid = q.question_uid;
        const result = summary?.perQuestionResult?.[uid];
        if (!result) return;

        const label = formatQuestionLabel(result, idx);
        const subtopicLabel = q.subtopics?.[0]?.label || "General Concept";

        if (result.timeExceededThreshold || result.timeSpentSeconds > 180) {
            slowList.push({ label, timeSpentSeconds: result.timeSpentSeconds });
        }

        if (!result.correct && result.answered) {
            incorrectList.push({ label, uid, subtopic: subtopicLabel, subject: q.subjectLabel });
            const topicKey = `${q.subjectLabel} - ${subtopicLabel}`;
            weakTopicsMap.set(topicKey, (weakTopicsMap.get(topicKey) || 0) + 1);
        }
    });

    const weakTopics = Array.from(weakTopicsMap.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count);

    const observations = [];
    const accuracy = summary.attempted > 0 ? (summary.correct / summary.attempted) * 100 : 0;
    const improvementAreas = [];

    if (summary.incorrect > 4) {
        observations.push({
            type: "caution",
            text: `High error count (${summary.incorrect} incorrect answers). Focus on reducing guessing to preserve marks (GATE deducts 1/3 for 1-mark and 2/3 for 2-mark MCQs).`
        });
    } else if (summary.attempted > 0 && accuracy >= 85) {
        observations.push({
            type: "success",
            text: `Excellent accuracy! (${accuracy.toFixed(1)}% of attempted questions correct). You demonstrate strong subject mastery.`
        });
    } else if (summary.attempted > 0 && accuracy >= 60) {
        observations.push({
            type: "info",
            text: `Moderate accuracy (${accuracy.toFixed(1)}%). Review fundamental concepts in your weak areas to clear cutoffs consistently.`
        });
    }

    if (slowList.length > 1) {
        observations.push({
            type: "warning",
            text: `Time management check: You spent over 3 minutes on ${slowList.length} questions (e.g. ${slowList.slice(0, 3).map(s => s.label).join(", ")}). Practice dynamic skipping to preserve exam buffer.`
        });
    }

    if (weakTopics.length > 0) {
        improvementAreas.push({
            label: "Concept review",
            detail: weakTopics.slice(0, 3).map((item) => item.topic).join(", "),
        });
    }

    if (incorrectList.length > 0) {
        improvementAreas.push({
            label: "Mistake drill",
            detail: incorrectList.slice(0, 5).map((item) => item.label).join(", "),
        });
    }

    if (slowList.length > 0) {
        improvementAreas.push({
            label: "Timing control",
            detail: slowList.slice(0, 5).map((item) => `${item.label} (${formatMockTimeSpent(item.timeSpentSeconds)})`).join(", "),
        });
    }

    if (Number(summary.unanswered || 0) > 0) {
        improvementAreas.push({
            label: "Attempt planning",
            detail: `${summary.unanswered} unanswered ${summary.unanswered === 1 ? "question" : "questions"} need a clearer skip-and-return rhythm.`,
        });
    }

    if (improvementAreas.length === 0 && summary.attempted > 0) {
        improvementAreas.push({
            label: "Retention",
            detail: "Repeat this paper later and compare whether accuracy stays stable under time pressure.",
        });
    }

    const ga = summary.sectionSummary?.GA;
    const cs = summary.sectionSummary?.CS;
    if (ga && cs && ga.total > 0 && cs.total > 0) {
        const gaAcc = ga.attempted > 0 ? (ga.correct / ga.attempted) : 0;
        const csAcc = cs.attempted > 0 ? (cs.correct / cs.attempted) : 0;

        if (gaAcc > csAcc + 0.25) {
            observations.push({
                type: "info",
                text: "Strong performance in General Aptitude. Dedicate more practice to core CS syllabus topics to balance your scoring potential."
            });
        } else if (csAcc > gaAcc + 0.25) {
            observations.push({
                type: "info",
                text: "Strong performance in Computer Science. Do not neglect General Aptitude (worth 15% of the total GATE score) during daily reviews."
            });
        }
    }

    return {
        incorrectList,
        weakTopics,
        observations,
        improvementAreas
    };
};

const StructuredReviewSection = ({ questions = [], summary = {} }) => {
    const { incorrectList, weakTopics, observations, improvementAreas } = generatePerformanceAnalysis(questions, summary);
    const hasPerfectAttempt = Number(summary.attempted || 0) > 0
        && Number(summary.incorrect || 0) === 0
        && Number(summary.unanswered || 0) === 0
        && incorrectList.length === 0;

    if (hasPerfectAttempt && !observations.length) {
        return (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <div className="flex items-center gap-2">
                    <FaCheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="font-bold text-sm">Perfect Performance!</span>
                </div>
                <p className="mt-1 text-xs">Congratulations! You answered every question correctly on this mock test. Keep up the flawless work.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="text-base font-extrabold text-[#1f2f40] mb-4">Structured Performance Diagnostic</h3>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Left Column: Weak Topics & Mistakes */}
                <div className="space-y-4">
                    <div className="rounded-lg border border-[#d6e0ea] bg-white p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#61758a] mb-3 flex items-center gap-1.5">
                            <FaBook className="text-[#125B9A]" />
                            Mistakes & Weak Topics
                        </h4>
                        {weakTopics.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {weakTopics.slice(0, 6).map((wt, i) => (
                                    <div
                                        key={i}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800"
                                    >
                                        <span className="truncate max-w-[150px]">{wt.topic}</span>
                                        <span className="rounded-full bg-rose-200 px-1.5 py-0.5 text-[10px] text-rose-900 font-extrabold">
                                            {wt.count} {wt.count === 1 ? "mistake" : "mistakes"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">No weak topics found. Good subject consistency!</p>
                        )}
                    </div>

                    <div className="rounded-lg border border-[#d6e0ea] bg-white p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#61758a] mb-3">
                            Incorrect Questions Summary
                        </h4>
                        {incorrectList.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                {incorrectList.map((iq, i) => (
                                    <div key={i} className="flex items-center justify-between gap-3 rounded border border-gray-100 bg-gray-50 p-2.5 text-xs text-[#41576c]">
                                        <span className="font-bold text-[#125B9A]">{iq.label}</span>
                                        <span className="truncate text-gray-500 font-semibold max-w-[180px]">{iq.subtopic}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">No incorrect questions to review.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Performance Observations & Improvements */}
                <div className="rounded-lg border border-[#d6e0ea] bg-white p-4 flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#61758a] mb-3">
                            Performance Observations
                        </h4>
                        {observations.length > 0 ? (
                            <div className="space-y-3">
                                {observations.map((obs, i) => {
                                    let bg = "bg-blue-50 border-blue-100 text-blue-800";
                                    let iconColor = "text-blue-600";
                                    if (obs.type === "caution") {
                                        bg = "bg-rose-50 border-rose-100 text-rose-800";
                                        iconColor = "text-rose-600";
                                    } else if (obs.type === "warning") {
                                        bg = "bg-amber-50 border-amber-100 text-amber-800";
                                        iconColor = "text-amber-600";
                                    } else if (obs.type === "success") {
                                        bg = "bg-emerald-50 border-emerald-100 text-emerald-800";
                                        iconColor = "text-emerald-600";
                                    }

                                    return (
                                        <div key={i} className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-5 ${bg}`}>
                                            <FaExclamationTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
                                            <span>{obs.text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">No specific observations. Review incorrect items to start improvement drills.</p>
                        )}
                    </div>

                    <div className="mt-4 rounded-lg border border-[#d6e0ea] bg-[#f8fbff] p-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#61758a] mb-2">
                            Areas Requiring Improvement
                        </h4>
                        <div className="space-y-2">
                            {improvementAreas.map((area) => (
                                <div key={area.label} className="rounded border border-[#e1e8f0] bg-white px-3 py-2">
                                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#125B9A]">{area.label}</div>
                                    <div className="mt-1 text-xs leading-5 text-[#41576c]">{area.detail}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-3 text-center text-xs font-bold text-[#125B9A]">
                        Use Review Questions to inspect answer keys and score changes question by question.
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        timeAnalysis: {
            totalSeconds: 0,
            averageSeconds: 0,
            slowQuestionCount: 0,
            slowThresholdSeconds: 180,
        },
        sectionSummary: {
            GA: { total: 0, attempted: 0, correct: 0, incorrect: 0, unanswered: 0, bonus: 0, score: 0, maxScore: 0 },
            CS: { total: 0, attempted: 0, correct: 0, incorrect: 0, unanswered: 0, bonus: 0, score: 0, maxScore: 0 },
        },
        perQuestionResult: {},
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

                <TimeDistributionSummary questions={questions} summary={summary} />

                <StructuredReviewSection questions={questions} summary={summary} />

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
