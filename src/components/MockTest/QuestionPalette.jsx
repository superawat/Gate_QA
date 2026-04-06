import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";
import GateStatusIcon, {
    GATE_VISUAL_STATUS,
    getGateStatusModifier,
    getGateVisualStatus,
} from "./GateStatusIcon";

const QuestionPalette = ({ isCollapsed = false, isReviewPhase = false, onToggleCollapsed }) => {
    const {
        questions,
        sectionQuestions,
        currentSection,
        currentSectionIndex,
        goToQuestion,
        questionStates,
        STATUS,
    } = useMockTest();

    const stats = {
        [GATE_VISUAL_STATUS.ANSWERED]: 0,
        [GATE_VISUAL_STATUS.NOT_ANSWERED]: 0,
        [GATE_VISUAL_STATUS.NOT_VISITED]: 0,
        [GATE_VISUAL_STATUS.MARKED]: 0,
        [GATE_VISUAL_STATUS.ANSWERED_MARKED]: 0,
    };

    questions.forEach((question) => {
        const visualStatus = getGateVisualStatus(
            questionStates[question.question_uid] || STATUS.NOT_VISITED,
            STATUS
        );
        stats[visualStatus] += 1;
    });

    const activeSectionQuestions = currentSection === "CS"
        ? sectionQuestions.CS
        : sectionQuestions.GA;

    const legendRows = [
        {
            status: GATE_VISUAL_STATUS.ANSWERED,
            label: "Answered",
            testId: "legend-status-answered",
        },
        {
            status: GATE_VISUAL_STATUS.NOT_ANSWERED,
            label: "Not Answered",
            testId: "legend-status-not-answered",
        },
        {
            status: GATE_VISUAL_STATUS.NOT_VISITED,
            label: "Not Visited",
            testId: "legend-status-not-visited",
        },
        {
            status: GATE_VISUAL_STATUS.MARKED,
            label: "Marked for Review",
            testId: "legend-status-marked",
        },
        {
            status: GATE_VISUAL_STATUS.ANSWERED_MARKED,
            label: "Answered & Marked for Review (will also be evaluated)",
            testId: "legend-status-answered-marked",
            wide: true,
        },
    ];

    return (
        <div className="mocktest-palette-root relative flex h-full w-full flex-col overflow-visible">
            <button
                type="button"
                onClick={onToggleCollapsed}
                aria-expanded={!isCollapsed}
                aria-controls="mocktest-palette-content"
                aria-label={isCollapsed ? "Expand question palette" : "Collapse question palette"}
                className="mocktest-collapse-tab"
            >
                {isCollapsed ? "\u203A" : "\u2039"}
            </button>

            <div
                id="mocktest-palette-content"
                className={`mocktest-palette-content flex min-h-0 flex-1 flex-col overflow-hidden transition-opacity duration-200 ${isCollapsed ? "pointer-events-none opacity-0 overflow-hidden" : "opacity-100"}`}
            >
                <div className="mocktest-legend-wrap">
                    <div className="mocktest-legend-grid">
                        {legendRows.map((row) => (
                            <div
                                key={row.status}
                                className={`mocktest-legend-item ${row.wide ? "mocktest-legend-item-wide" : ""}`}
                            >
                                <GateStatusIcon
                                    variant="legend"
                                    status={row.status}
                                    value={stats[row.status]}
                                    data-testid={row.testId}
                                />
                                <span>{row.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="mocktest-palette-section-header">
                        {currentSection === "GA" ? "General Aptitude" : "Computer Science and IT"}
                    </div>
                    <div className="mocktest-palette-choose-header">
                        Choose a Question
                    </div>

                    <div className="mocktest-palette-scroll min-h-0 flex-1 overflow-y-auto p-2.5">
                        <div className="mocktest-palette-grid pb-3">
                            {activeSectionQuestions.map((question, index) => {
                                const isCurrent = index === currentSectionIndex;
                                const visualStatus = getGateVisualStatus(
                                    questionStates[question.question_uid] || STATUS.NOT_VISITED,
                                    STATUS
                                );
                                const statusModifier = getGateStatusModifier(visualStatus);

                                return (
                                    <button
                                        key={question.question_uid}
                                        type="button"
                                        onClick={() => goToQuestion(index, currentSection)}
                                        data-status={visualStatus}
                                        data-testid={`tile-status-${statusModifier}`}
                                        aria-current={isCurrent ? "true" : undefined}
                                        className={`palette-btn gate-tile gate-tile--${statusModifier} ${isCurrent ? "gate-current-ring" : ""}`}
                                    >
                                        <GateStatusIcon
                                            variant="tile"
                                            status={visualStatus}
                                            value={index + 1}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QuestionPalette;
