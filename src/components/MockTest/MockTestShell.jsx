import React, { useEffect } from "react";
import { useMockTest } from "../../contexts/MockTestContext";
import MockTestHeader from "./MockTestHeader";
import MockTestQuestion from "./MockTestQuestion";
import QuestionPalette from "./QuestionPalette";
import MockTestActionBar from "./MockTestActionBar";
import MockTestResults from "./MockTestResults";
import "./MockTest.css";
import CalculatorWidget from "../Calculator/CalculatorWidget";

const MockTestShell = ({ onExit }) => {
    const {
        testActive,
        startTest,
        testSubmitted,
        timeLeft,
        questions,
        endMockTest
    } = useMockTest();

    // Handle calculator state manually here since it's disjoint from main app
    const [isCalculatorOpen, setIsCalculatorOpen] = React.useState(false);
    const calculatorButtonRef = React.useRef(null);

    useEffect(() => {
        if (!testActive && !testSubmitted) {
            startTest();
        }
    }, [testActive, testSubmitted, startTest]);

    if (!testActive && !testSubmitted) {
        return <div className="flex h-screen items-center justify-center">Loading mock test...</div>;
    }

    if (testSubmitted) {
        return <MockTestResults onExit={() => { endMockTest(); onExit(); }} />;
    }

    if (questions.length === 0) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
                <h2 className="text-xl font-bold mb-4">No Questions Available</h2>
                <p className="text-gray-600 mb-6">Could not load a valid question set for the mock test.</p>
                <button
                    onClick={() => { endMockTest(); onExit(); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Back to Practice
                </button>
            </div>
        )
    }

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="flex h-screen w-full flex-col bg-[#e8f4fd] font-sans text-sm selection:bg-blue-200">
            <MockTestHeader />

            <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
                {/* Left Panel: Question Area */}
                <div className="flex flex-1 flex-col overflow-hidden bg-white sm:border-r border-gray-300">
                    {/* Subject / Timer Bar */}
                    <div className="flex items-center justify-between border-b border-gray-300 bg-gray-100 p-2 text-sm font-bold shadow-sm">
                        <span>Sections</span>
                        <span>Time Left: {formatTime(timeLeft)}</span>
                    </div>

                    <div className="relative flex flex-1 flex-col overflow-hidden">
                        <MockTestQuestion />

                        {/* Calculator Widget */}
                        {/* 
                  The calculator button is rendered within MockTestQuestion, but we 
                  manage the widget here to ensure it overlays properly.
                  Actually, the instruction screenshots show an orange calc icon near the timer/section tabs.
                */}
                    </div>
                </div>

                {/* Right Panel: Palette */}
                <div className="w-full sm:w-[280px] md:w-[320px] flex-shrink-0 bg-[#e8f4fd]">
                    <QuestionPalette />
                </div>
            </div>

            <MockTestActionBar />
        </div>
    );
};

export default MockTestShell;
