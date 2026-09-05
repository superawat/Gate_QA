/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MockTestHeader from "./MockTestHeader";
import { MockTestContext } from "../../contexts/MockTestContext";

describe("Mock Test Two-Section Invariant & Custom Builder", () => {
    const defaultMockContextValue = {
        questionStates: {},
        sectionQuestionUids: { GA: ["ga-1", "ga-2"], CS: ["cs-1", "cs-2", "cs-3"] },
        currentSection: "GA",
        currentSectionIndex: 0,
        setCurrentSection: vi.fn(),
        timeLeft: 5400,
        attemptMeta: {
            kindId: "custom",
            isDa: false,
            track: "cse",
            durationMinutes: 180,
        },
        STATUS: {
            NOT_VISITED: "not_visited",
            NOT_ANSWERED: "not_answered",
            ANSWERED: "answered",
            MARKED_FOR_REVIEW: "marked_for_review",
            ANSWERED_AND_MARKED_FOR_REVIEW: "answered_and_marked_for_review",
        },
    };

    const renderHeader = (contextOverrides = {}, props = {}) => {
        const mergedContext = { ...defaultMockContextValue, ...contextOverrides };
        return render(
            <MockTestContext.Provider value={mergedContext}>
                <MockTestHeader
                    attemptTitle="Custom Practice Mock"
                    isCalculatorOpen={false}
                    onToggleCalculator={vi.fn()}
                    {...props}
                />
            </MockTestContext.Provider>
        );
    };

    test("strictly renders exactly two section tabs: General Aptitude and Core discipline", () => {
        renderHeader();

        const gaTab = screen.getByTestId("mock-section-tab-ga");
        const csTab = screen.getByTestId("mock-section-tab-cs");

        expect(gaTab).toBeTruthy();
        expect(csTab).toBeTruthy();
        expect(gaTab.textContent).toContain("General Aptitude");
        expect(csTab.textContent).toContain("Computer Science and Information Technology");
    });

    test("displays Data Science and AI for Section 2 when attempt is DA", () => {
        renderHeader({
            attemptMeta: {
                kindId: "custom",
                isDa: true,
                track: "da",
                durationMinutes: 180,
            },
        });

        const csTab = screen.getByTestId("mock-section-tab-cs");
        expect(csTab.textContent).toContain("Data Science and AI");
    });

    test("makes General Aptitude disabled and unpressable when there are 0 GA questions", () => {
        const setCurrentSectionMock = vi.fn();
        renderHeader({
            sectionQuestionUids: { GA: [], CS: ["cs-1", "cs-2", "cs-3"] },
            currentSection: "CS",
            setCurrentSection: setCurrentSectionMock,
        });

        const gaTab = screen.getByTestId("mock-section-tab-ga");
        expect(gaTab.getAttribute("disabled")).not.toBeNull();
        expect(gaTab.className).toContain("cursor-not-allowed");
        expect(gaTab.className).toContain("pointer-events-none");
        expect(gaTab.getAttribute("title")).toBe("No General Aptitude questions in this mock test");

        // Attempting to click disabled GA tab does not change section
        fireEvent.click(gaTab);
        expect(setCurrentSectionMock).not.toHaveBeenCalled();
    });

    test("allows pressing General Aptitude tab when GA questions exist", () => {
        const setCurrentSectionMock = vi.fn();
        renderHeader({
            sectionQuestionUids: { GA: ["ga-1", "ga-2"], CS: ["cs-1", "cs-2"] },
            currentSection: "CS",
            setCurrentSection: setCurrentSectionMock,
        });

        const gaTab = screen.getByTestId("mock-section-tab-ga");
        expect(gaTab.getAttribute("disabled")).toBeNull();

        fireEvent.click(gaTab);
        expect(setCurrentSectionMock).toHaveBeenCalledWith("GA");
    });

    test("MockTestSetup renders CSE, DA, and GA toggles and triggers appropriate callbacks", async () => {
        const MockTestSetup = (await import("./MockTestSetup")).default;
        const onToggleTrackMock = vi.fn();
        const onToggleGeneralAptitudeMock = vi.fn();
        const onBulkToggleTrackSubjectsMock = vi.fn();

        const subjects = [
            { slug: "algorithms", label: "Algorithms" },
            { slug: "operating-system", label: "Operating System" },
            { slug: "da:machine-learning", label: "Machine Learning" },
            { slug: "da:artificial-intelligence", label: "Artificial Intelligence" },
            { slug: "verbal-ability", label: "Verbal Ability" },
        ];

        render(
            <MockTestSetup
                kind={{ id: "custom", title: "Custom Exam" }}
                setupState={{
                    enabledTracks: ["cse"],
                    includeGeneralAptitude: true,
                    selectedSubjects: [],
                    selectedSubtopics: [],
                    selectedTypes: ["MCQ", "MSQ", "NAT"],
                    customCount: 25,
                    minYear: 2000,
                    maxYear: 2025,
                }}
                subjects={subjects}
                structuredSubtopics={{}}
                availability={{ canStart: true, availableSummary: "100" }}
                livePreview={{ total: 100, gaCount: 15, csCount: 85, mcqCount: 50, msqCount: 30, natCount: 20 }}
                onToggleTrack={onToggleTrackMock}
                onToggleGeneralAptitude={onToggleGeneralAptitudeMock}
                onBulkToggleTrackSubjects={onBulkToggleTrackSubjectsMock}
                onPatchState={vi.fn()}
                onToggleSelection={vi.fn()}
                onToggleSubtopic={vi.fn()}
                onSetExpandedSubject={vi.fn()}
                onBulkToggleSubtopics={vi.fn()}
                onStart={vi.fn()}
            />
        );

        // Verify simplified section labels (without GATE, without individual subject listings)
        expect(screen.getByText("Computer Science / CSE")).toBeTruthy();
        expect(screen.getByText("Data Science and AI")).toBeTruthy();
        expect(screen.getByText("Aptitude")).toBeTruthy();

        // Find toggle inputs by aria-label
        const cseToggle = screen.getByLabelText("Toggle Computer Science / CSE");
        const daToggle = screen.getByLabelText("Toggle Data Science and AI");
        const gaToggle = screen.getByLabelText("Toggle Aptitude");

        expect(cseToggle).toBeTruthy();
        expect(daToggle).toBeTruthy();
        expect(gaToggle).toBeTruthy();

        // Click toggles and verify callbacks
        fireEvent.click(cseToggle);
        expect(onToggleTrackMock).toHaveBeenCalledWith("cse");

        fireEvent.click(daToggle);
        expect(onToggleTrackMock).toHaveBeenCalledWith("da");

        fireEvent.click(gaToggle);
        expect(onToggleGeneralAptitudeMock).toHaveBeenCalledTimes(1);

        // Click Select All for CSE
        const selectAllCse = screen.getByRole("button", { name: "Select All" });
        fireEvent.click(selectAllCse);
        expect(onBulkToggleTrackSubjectsMock).toHaveBeenCalledWith(
            "cse",
            expect.arrayContaining(["algorithms", "operating-system"]),
            true
        );
    });

    test("clicking visual toggle switch element or track title triggers toggle callbacks", async () => {
        const MockTestSetup = (await import("./MockTestSetup")).default;
        const onToggleTrackMock = vi.fn();
        const onToggleGeneralAptitudeMock = vi.fn();

        const subjects = [
            { slug: "algorithms", label: "Algorithms" },
            { slug: "da:machine-learning", label: "Machine Learning" },
            { slug: "general-aptitude", label: "General Aptitude" },
        ];

        render(
            <MockTestSetup
                kind={{ id: "custom", title: "Custom Exam" }}
                setupState={{
                    enabledTracks: ["cse"],
                    includeGeneralAptitude: true,
                    selectedSubjects: [],
                    selectedSubtopics: [],
                    selectedTypes: ["MCQ"],
                    customCount: 15,
                    minYear: 2000,
                    maxYear: 2025,
                }}
                subjects={subjects}
                structuredSubtopics={{}}
                availability={{ canStart: true, availableSummary: "50" }}
                livePreview={{ total: 50, gaCount: 10, csCount: 40, mcqCount: 50, msqCount: 0, natCount: 0 }}
                onToggleTrack={onToggleTrackMock}
                onToggleGeneralAptitude={onToggleGeneralAptitudeMock}
                onBulkToggleTrackSubjects={vi.fn()}
                onPatchState={vi.fn()}
                onToggleSelection={vi.fn()}
                onToggleSubtopic={vi.fn()}
                onSetExpandedSubject={vi.fn()}
                onBulkToggleSubtopics={vi.fn()}
                onStart={vi.fn()}
            />
        );

        // Click the visual switch container for DA
        const daSwitch = screen.getByTestId("mock-toggle-da-switch");
        expect(daSwitch).toBeTruthy();
        fireEvent.click(daSwitch);
        expect(onToggleTrackMock).toHaveBeenCalledWith("da");

        // Click the track title on the left for CSE
        const cseTitle = screen.getByText("Computer Science / CSE");
        fireEvent.click(cseTitle);
        expect(onToggleTrackMock).toHaveBeenCalledWith("cse");

        // Click the visual switch container for GA
        const gaSwitch = screen.getByTestId("mock-toggle-ga-switch");
        expect(gaSwitch).toBeTruthy();
        fireEvent.click(gaSwitch);
        expect(onToggleGeneralAptitudeMock).toHaveBeenCalledTimes(1);
    });

    test("makes Section 2 (CS) disabled and unpressable when there are 0 CS questions in a pure Aptitude mock", () => {
        const setCurrentSectionMock = vi.fn();
        renderHeader({
            sectionQuestionUids: { GA: ["ga-1", "ga-2"], CS: [] },
            currentSection: "GA",
            setCurrentSection: setCurrentSectionMock,
        });

        const csTab = screen.getByTestId("mock-section-tab-cs");
        expect(csTab.getAttribute("disabled")).not.toBeNull();
        expect(csTab.className).toContain("cursor-not-allowed");
        expect(csTab.className).toContain("pointer-events-none");
        expect(csTab.getAttribute("title")).toContain("No Computer Science and Information Technology questions in this mock test");

        // Attempting to click disabled CS tab does not change section
        fireEvent.click(csTab);
        expect(setCurrentSectionMock).not.toHaveBeenCalled();
    });

    test("MockTestSetup renders 3-level taxonomy hierarchy (Subject -> Topics -> Subtopics) and supports selection", async () => {
        const MockTestSetup = (await import("./MockTestSetup")).default;
        const onToggleSelectionMock = vi.fn();
        const onToggleSubtopicMock = vi.fn();
        const onBulkToggleSubtopicsMock = vi.fn();

        const subjects = [
            { slug: "os", label: "Operating System" },
            { slug: "algorithms", label: "Algorithms" },
        ];
        const structuredSubtopics = {
            os: [
                { slug: "cpu-scheduling", label: "CPU Scheduling" },
                { slug: "deadlock", label: "Deadlock" },
                { slug: "virtual-memory", label: "Virtual Memory" },
            ],
            algorithms: [
                { slug: "dynamic-programming", label: "Dynamic Programming" },
                { slug: "graph-search", label: "Graph Search" },
            ],
        };

        render(
            <MockTestSetup
                kind={{ id: "custom", title: "Custom Exam" }}
                setupState={{
                    enabledTracks: ["cse"],
                    includeGeneralAptitude: true,
                    selectedSubjects: [],
                    selectedSubtopics: [],
                    selectedTypes: ["MCQ", "MSQ", "NAT"],
                    customCount: 25,
                    minYear: 2000,
                    maxYear: 2025,
                }}
                subjects={subjects}
                structuredSubtopics={structuredSubtopics}
                availability={{ canStart: true, availableSummary: "100" }}
                livePreview={{ total: 100, gaCount: 15, csCount: 85, mcqCount: 50, msqCount: 30, natCount: 20 }}
                onToggleTrack={vi.fn()}
                onToggleGeneralAptitude={vi.fn()}
                onBulkToggleTrackSubjects={vi.fn()}
                onPatchState={vi.fn()}
                onToggleSelection={onToggleSelectionMock}
                onToggleSubtopic={onToggleSubtopicMock}
                onSetExpandedSubject={vi.fn()}
                onBulkToggleSubtopics={onBulkToggleSubtopicsMock}
                onStart={vi.fn()}
            />
        );

        // Level 1: Verify Topics count buttons are visible for both subjects
        const osTopicsBtn = screen.getByRole("button", { name: /show operating system topics/i });
        expect(osTopicsBtn).toBeTruthy();
        expect(osTopicsBtn.textContent).toMatch(/Topics/i);

        const algoTopicsBtn = screen.getByRole("button", { name: /show algorithms topics/i });
        expect(algoTopicsBtn).toBeTruthy();
        expect(algoTopicsBtn.textContent).toMatch(/Topics/i);

        // Level 2: Expand Operating System topics
        fireEvent.click(osTopicsBtn);
        // Expect topics to appear (e.g. CPU Scheduling, Deadlock)
        expect(screen.getByText("CPU Scheduling")).toBeTruthy();
        expect(screen.getByText("Deadlock")).toBeTruthy();

        // Level 3: Expand a topic's subtopics or click "Expand all"
        const expandAllBtn = screen.getByRole("button", { name: /expand all/i });
        expect(expandAllBtn).toBeTruthy();
        fireEvent.click(expandAllBtn);

        // Subtopics should now be visible
        expect(screen.getByText("Virtual Memory")).toBeTruthy();

        // Check a subtopic when subject was not yet selected: auto-selects parent subject
        const virtualMemoryCheckbox = screen.getByRole("checkbox", { name: /virtual memory/i });
        fireEvent.click(virtualMemoryCheckbox);
        expect(onToggleSelectionMock).toHaveBeenCalledWith("selectedSubjects", "os");
        expect(onToggleSubtopicMock).toHaveBeenCalledWith("virtual-memory", "os");

        // Click Select All for OS subtopics
        const selectAllBtn = screen.getByRole("button", { name: /select all operating system subtopics/i });
        expect(selectAllBtn).toBeTruthy();
        fireEvent.click(selectAllBtn);
        expect(onBulkToggleSubtopicsMock).toHaveBeenCalledWith(
            "os",
            expect.arrayContaining(["cpu-scheduling", "deadlock", "virtual-memory"])
        );
    });
});

