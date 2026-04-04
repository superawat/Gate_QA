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
});
