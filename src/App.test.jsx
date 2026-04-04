/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    clearFilters: vi.fn(),
    trackEvent: vi.fn(),
}));

vi.mock("./shells/LandingShell", () => ({
    default: ({ onResumePractice }) => (
        <button type="button" onClick={onResumePractice}>
            Resume practice
        </button>
    ),
}));

vi.mock("./shells/PracticeShell", () => ({
    default: () => <div>Practice shell</div>,
}));

vi.mock("./shells/MockShell", () => ({
    default: () => <div>Mock shell</div>,
}));

vi.mock("./contexts/FilterContext", () => ({
    FilterProvider: ({ children }) => children,
    useFilterState: () => ({
        allQuestions: [{ question_uid: "go:1" }],
        isInitialized: true,
    }),
    useFilterActions: () => ({
        clearFilters: mocks.clearFilters,
    }),
}));

vi.mock("./contexts/SessionContext", () => ({
    SessionProvider: ({ children }) => children,
}));

vi.mock("./hooks/useGoatCounterSPA", () => ({
    useGoatCounterSPA: vi.fn(),
}));

vi.mock("./utils/analytics", () => ({
    pageview: vi.fn(),
    trackEvent: mocks.trackEvent,
}));

vi.mock("./constants/featureFlags", () => ({
    MOCK_TEST_MODE_ENABLED: false,
}));

import { ViewSwitch, resolveAppViewFromUrl } from "./App";

describe("ViewSwitch resume flow", () => {
    beforeEach(() => {
        mocks.clearFilters.mockReset();
        mocks.trackEvent.mockReset();
        window.history.replaceState({}, "", "/");
    });

    test("resume enters practice without clearing filters", () => {
        const setAppView = vi.fn();
        const shouldOpenFilterOnEnter = { current: false };
        const replaceStateSpy = vi.spyOn(window.history, "replaceState");
        const pushStateSpy = vi.spyOn(window.history, "pushState");

        render(
            <ViewSwitch
                loading={false}
                error=""
                loadQuestions={vi.fn()}
                appView="landing"
                setAppView={setAppView}
                shouldOpenFilterOnEnter={shouldOpenFilterOnEnter}
                hasPriorProgress
            />
        );

        setAppView.mockClear();

        fireEvent.click(screen.getByRole("button", { name: /resume practice/i }));

        expect(mocks.clearFilters).not.toHaveBeenCalled();
        expect(mocks.trackEvent).toHaveBeenCalledWith("resume_practice", { mode: "resume", source: "landing" });
        expect(setAppView).toHaveBeenCalledWith("practice");
        expect(shouldOpenFilterOnEnter.current).toBe(false);
        expect(window.location.search).toContain("mode=resume");
        expect(replaceStateSpy).toHaveBeenCalled();
        expect(pushStateSpy).not.toHaveBeenCalled();

        replaceStateSpy.mockRestore();
        pushStateSpy.mockRestore();
    });

    test("?mode=resume resolves to practice on URL load", () => {
        window.history.replaceState({}, "", "/?mode=resume");
        expect(resolveAppViewFromUrl()).toBe("practice");
    });
});
