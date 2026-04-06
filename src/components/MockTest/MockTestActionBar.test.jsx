/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MockTestActionBar from "./MockTestActionBar";
import QuestionPalette from "./QuestionPalette";

let mockContextValue = null;

vi.mock("../../contexts/MockTestContext", () => ({
    useMockTest: () => mockContextValue,
}));

const STATUS = {
    NOT_VISITED: "not_visited",
    NOT_ANSWERED: "not_answered",
    ANSWERED: "answered",
    MARKED_FOR_REVIEW: "review",
    ANSWERED_AND_MARKED_FOR_REVIEW: "review_answered",
};

describe("MockTest footer submit ownership", () => {
    beforeEach(() => {
        mockContextValue = {
            saveAndNext: vi.fn(),
            markForReviewAndNext: vi.fn(),
            clearResponse: vi.fn(),
            goToPrevious: vi.fn(),
            goToNext: vi.fn(),
            submitTest: vi.fn(),
            currentSectionIndex: 0,
            questions: [{ question_uid: "ga:1" }],
            sectionQuestions: {
                GA: [{ question_uid: "ga:1" }],
                CS: [],
            },
            currentSection: "GA",
            goToQuestion: vi.fn(),
            questionStates: {
                "ga:1": STATUS.NOT_VISITED,
            },
            STATUS,
        };
    });

    test("renders Submit in MockTestActionBar", () => {
        render(<MockTestActionBar isPaletteCollapsed={false} />);

        const submitButton = screen.getByTestId("mock-submit-button");
        const submitLane = screen.getByTestId("mock-submit-lane");
        const exitButton = screen.getByTestId("mock-exit-button");

        expect(submitButton).toBeTruthy();
        expect(submitLane).toBeTruthy();
        expect(exitButton).toBeTruthy();
    });

    test("does not render Submit inside QuestionPalette", () => {
        render(
            <QuestionPalette
                isCollapsed={false}
                isReviewPhase={false}
                onToggleCollapsed={() => {}}
            />
        );

        expect(screen.queryByTestId("mock-submit-button")).toBeNull();
        expect(screen.queryByRole("button", { name: /submit/i })).toBeNull();
    });

    test("keeps submit button layout stable while lane class tracks palette state", () => {
        const { rerender } = render(<MockTestActionBar isPaletteCollapsed={false} />);

        const expandedLane = screen.getByTestId("mock-submit-lane");
        const expandedButton = screen.getByTestId("mock-submit-button");
        expect(expandedLane.className).toContain("submit-lane--expanded");
        expect(expandedButton.className).toContain("whitespace-nowrap");

        rerender(<MockTestActionBar isPaletteCollapsed />);

        const collapsedLane = screen.getByTestId("mock-submit-lane");
        const collapsedButton = screen.getByTestId("mock-submit-button");
        expect(collapsedLane.className).toContain("submit-lane--collapsed");
        expect(collapsedButton.className).toContain("whitespace-nowrap");
    });

    test("confirms exit before calling the exit handler", () => {
        const onExitAttempt = vi.fn();
        render(<MockTestActionBar isPaletteCollapsed={false} onExitAttempt={onExitAttempt} />);

        fireEvent.click(screen.getByTestId("mock-exit-button"));
        expect(screen.getByText(/exit confirmation/i)).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: /^exit$/i }));

        expect(onExitAttempt).toHaveBeenCalledTimes(1);
    });
});
