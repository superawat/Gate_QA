/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    clearFilters: vi.fn(),
    trackEvent: vi.fn(),
    questionInit: vi.fn(() => Promise.resolve()),
    answerInit: vi.fn(() => Promise.resolve()),
    manifestInit: vi.fn(() => Promise.resolve({
        questionCount: 3271,
        latestYear: 2026,
        yearSets: [{ key: "2026-s1" }, { key: "2026-s2" }],
    })),
}));

vi.mock("./shells/LandingShell", () => ({
    default: ({ onResumePractice, questionBankManifest, manifestLoading }) => (
        <div>
            <button type="button" onClick={onResumePractice}>
                Resume practice
            </button>
            <div data-testid="landing-manifest-state">
                {manifestLoading ? "loading" : String(questionBankManifest?.questionCount || 0)}
            </div>
        </div>
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

vi.mock("./utils/analytics", () => ({
    pageview: vi.fn(),
    trackEvent: mocks.trackEvent,
}));

vi.mock("./constants/featureFlags", () => ({
    MOCK_TEST_MODE_ENABLED: false,
}));

vi.mock("./services/QuestionService", () => ({
    QuestionService: {
        init: mocks.questionInit,
        loaded: false,
    },
}));

vi.mock("./services/AnswerService", () => ({
    AnswerService: {
        init: mocks.answerInit,
        loaded: false,
    },
}));

vi.mock("./services/QuestionBankManifestService", () => ({
    QuestionBankManifestService: {
        init: mocks.manifestInit,
        loaded: false,
        manifest: null,
        loadError: "",
    },
}));

import App, { ViewSwitch, resolveAppViewFromUrl } from "./App";

describe("ViewSwitch resume flow", () => {
    beforeEach(() => {
        mocks.clearFilters.mockReset();
        mocks.trackEvent.mockReset();
        mocks.questionInit.mockClear();
        mocks.answerInit.mockClear();
        mocks.manifestInit.mockClear();
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

    test("?search=deadlock resolves to practice on URL load", () => {
        window.history.replaceState({}, "", "/?search=deadlock");
        expect(resolveAppViewFromUrl()).toBe("practice");
    });

    test("App loads only the manifest on the landing route", async () => {
        render(<App />);

        await waitFor(() => {
            expect(mocks.manifestInit).toHaveBeenCalledTimes(1);
        });

        expect(mocks.questionInit).not.toHaveBeenCalled();
        expect(mocks.answerInit).not.toHaveBeenCalled();
        expect(screen.getByTestId("landing-manifest-state").textContent).toContain("3271");
    });

    test("App initializes questions when the URL resolves directly to practice", async () => {
        window.history.replaceState({}, "", "/?mode=resume");

        render(<App />);

        await waitFor(() => {
            expect(mocks.questionInit).toHaveBeenCalledTimes(1);
            expect(mocks.answerInit).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByText("Practice shell")).toBeTruthy();
    });

    test("App initializes questions when search is present in the URL", async () => {
        window.history.replaceState({}, "", "/?search=deadlock");

        render(<App />);

        await waitFor(() => {
            expect(mocks.questionInit).toHaveBeenCalledTimes(1);
            expect(mocks.answerInit).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByText("Practice shell")).toBeTruthy();
    });
});
