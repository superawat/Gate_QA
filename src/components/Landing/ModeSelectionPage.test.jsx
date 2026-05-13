/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import ModeSelectionPage from "./ModeSelectionPage";

describe("ModeSelectionPage", () => {
    test('routes "Continue where you left off" through the dedicated resume action', () => {
        const onModeStart = vi.fn();
        const onResumePractice = vi.fn();

        render(
            <ModeSelectionPage
                onModeStart={onModeStart}
                onResumePractice={onResumePractice}
                hasPriorProgress
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /continue where you left off/i }));

        expect(onResumePractice).toHaveBeenCalledTimes(1);
        expect(onModeStart).not.toHaveBeenCalled();
    });

    test("starts the selected mode through onModeStart", () => {
        const onModeStart = vi.fn();

        render(
            <ModeSelectionPage
                onModeStart={onModeStart}
                onResumePractice={vi.fn()}
                hasPriorProgress={false}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /random practice/i }));
        fireEvent.click(screen.getByRole("button", { name: /start/i }));

        expect(onModeStart).toHaveBeenCalledWith("random");
    });

    test("does not render a standalone aptitude practice card", () => {
        render(
            <ModeSelectionPage
                onModeStart={vi.fn()}
                onResumePractice={vi.fn()}
                hasPriorProgress={false}
            />
        );

        expect(screen.queryByRole("button", { name: /aptitude practice/i })).toBeNull();
    });

    test("renders manifest summary badges without requiring question-bank init", () => {
        render(
            <ModeSelectionPage
                onModeStart={vi.fn()}
                onResumePractice={vi.fn()}
                hasPriorProgress={false}
                questionBankManifest={{
                    questionCount: 3271,
                    latestYear: 2026,
                    yearSets: [{ key: "2026-s1" }, { key: "2026-s2" }],
                }}
                manifestLoading={false}
                manifestError=""
            />
        );

        expect(screen.getByText(/3,271 questions ready/i)).toBeTruthy();
        expect(screen.getByText(/through 2026/i)).toBeTruthy();
        expect(screen.getByText(/2 year sets/i)).toBeTruthy();
    });
});
