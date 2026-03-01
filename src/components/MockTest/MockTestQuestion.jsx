import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";
import { MathJax } from "better-react-mathjax";
import DOMPurify from "dompurify";

const MockTestQuestion = () => {
    const {
        currentQuestion,
        currentQuestionIndex,
        responses,
        saveResponse,
        currentSection,
        setCurrentSection
    } = useMockTest();

    if (!currentQuestion) return null;

    const questionHtml = (currentQuestion.question || "")
        .replace(/\n\n/g, "<br />")
        .replace(/\n<li>/g, "<br><li>");
    const sanitizedQuestionHtml = DOMPurify.sanitize(questionHtml);

    // Determine type (mocking it for now if needed, though canonical type exists)
    const typeLabel = currentQuestion.type ? currentQuestion.type.toUpperCase() : "MCQ";

    // Marks are hardcoded for now, real implementation might calculate or scrape
    const marks = typeLabel === 'MCQ' || typeLabel === 'MSQ' ? "1" : "2";
    const negativeMarks = typeLabel === 'MCQ' ? (marks === '1' ? '1/3' : '2/3') : "0";

    const isNAT = typeLabel === "NAT";
    const isMSQ = typeLabel === "MSQ";

    const currentResponse = responses[currentQuestion.question_uid];

    const handleOptionSelect = (optionValue) => {
        if (isMSQ) {
            const currentSelected = Array.isArray(currentResponse) ? currentResponse : [];
            const newSelected = currentSelected.includes(optionValue)
                ? currentSelected.filter(v => v !== optionValue)
                : [...currentSelected, optionValue];
            saveResponse(currentQuestion.question_uid, newSelected);
        } else {
            saveResponse(currentQuestion.question_uid, optionValue);
        }
    };

    const handleNatChange = (e) => {
        saveResponse(currentQuestion.question_uid, e.target.value);
    };

    return (
        <div className="flex flex-1 flex-col overflow-y-auto bg-white p-2">

            {/* Subject Tabs */}
            <div className="flex w-full items-center justify-between border-b border-gray-300">
                <div className="flex gap-1" style={{ width: '100%', overflowX: 'auto' }}>
                    <button
                        onClick={() => setCurrentSection('GA')}
                        className={`rounded-t-sm px-3 py-1 font-bold ${currentSection === 'GA' ? 'bg-[#0e76a8] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        General Aptitude
                    </button>
                    <button
                        onClick={() => setCurrentSection('CS')}
                        className={`rounded-t-sm px-3 py-1 font-bold ${currentSection !== 'GA' ? 'bg-[#0e76a8] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        CS Computer Science
                    </button>
                </div>
            </div>

            {/* Question Info Bar */}
            <div className="flex items-center justify-between border-b border-gray-300 bg-[#fefefe] px-3 py-1 text-sm font-bold text-gray-800 shadow-sm">
                <div>Question Type: {typeLabel}</div>
                <div className="text-[12px] font-normal text-gray-600">
                    Marks for correct answer: <span className="text-green-600 font-bold">{marks}</span> |
                    Negative Marks: <span className="text-red-500 font-bold">{negativeMarks}</span>
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 p-4 pb-20 max-w-[900px]">
                <h2 className="text-lg font-bold mb-3 text-black">Question No. {currentQuestionIndex + 1}</h2>

                <div className="text-[17px] leading-relaxed text-black mb-8">
                    <MathJax dynamic="true" className="overflow-auto whitespace-normal max-w-full">
                        <div dangerouslySetInnerHTML={{ __html: sanitizedQuestionHtml }}></div>
                    </MathJax>
                </div>

                {/* Options Area */}
                <div className="pl-2">
                    {isNAT ? (
                        <div className="mt-8 flex flex-col gap-2 relative z-10">
                            <label className="text-sm font-bold text-gray-800">
                                Enter your numerical answer here:
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={currentResponse || ""}
                                    onChange={handleNatChange}
                                    className="h-10 w-48 border border-gray-400 bg-white px-3 text-lg font-bold shadow-inner focus:border-blue-500 focus:outline-none"
                                    placeholder=""
                                />
                                <button className="h-8 rounded bg-[#e1e1e1] px-4 font-bold border border-gray-400 shadow-sm text-sm" onClick={() => saveResponse(currentQuestion.question_uid, "")}>
                                    Backspace
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 italic">
                                Use virtual keypad or physical keyboard.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 mt-8 border-t border-gray-100 pt-6">
                            {/* Dummy options for now since data doesn't reliably have them distinct */}
                            {["A", "B", "C", "D"].map((opt, i) => {
                                const isChecked = isMSQ
                                    ? Array.isArray(currentResponse) && currentResponse.includes(opt)
                                    : currentResponse === opt;

                                return (
                                    <label key={opt} className={`flex cursor-pointer items-start gap-3 p-2 hover:bg-gray-50 rounded ${isChecked ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                                            <input
                                                type={isMSQ ? "checkbox" : "radio"}
                                                name={`q-${currentQuestion.question_uid}`}
                                                value={opt}
                                                checked={isChecked}
                                                onChange={() => handleOptionSelect(opt)}
                                                className={`h-[18px] w-[18px] cursor-pointer ${isMSQ ? 'rounded-sm' : ''} border-2 border-gray-400 checked:border-[#0e76a8] checked:bg-[#0e76a8]`}
                                            />
                                        </div>
                                        <span className="text-base text-gray-800">Option {opt} (Placeholder)</span>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default MockTestQuestion;
