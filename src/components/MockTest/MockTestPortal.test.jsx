/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MockTestPortal from "./MockTestPortal";

const MOCK_OPTIONS = [
    {
        id: "paper_mode",
        title: "Past Papers",
        badge: "Official Papers",
        subtitle: "Attempt release-ready GATE examination papers for your selected branches in official order.",
        helper: "Practice exact official examination papers with authentic question order, section structure, and timing.",
        facts: { count: "65 Questions", duration: "180 min" },
    },
    {
        id: "custom",
        title: "Custom Builder",
        badge: "Flexible",
        subtitle: "Create a focused practice set, subject test, or multi-subject builder from your selected branches.",
        helper: "Build custom practice attempts with balanced subject representation and uniform random question selection.",
        facts: { count: "1 to 65 Questions", duration: "Adaptive" },
    },
];

describe("MockTestPortal Component", () => {
    it("renders the portal header, simulator badge, and default 'None' selected mode", () => {
        render(
            <MockTestPortal
                options={MOCK_OPTIONS}
                selectedKindId=""
                onSelectKind={vi.fn()}
                onContinue={vi.fn()}
                onBack={vi.fn()}
            />
        );

        expect(screen.getByText("GATE CBT Exam Simulator")).toBeTruthy();
        expect(screen.getByRole("heading", { name: /Choose Attempt Type/i })).toBeTruthy();
        expect(screen.getByText(/Practice with real GATE questions under authentic examination conditions/i)).toBeTruthy();
        expect(screen.getByText("None")).toBeTruthy();
    });

    it("renders back button and triggers onBack when clicked", () => {
        const onBack = vi.fn();
        render(
            <MockTestPortal
                options={MOCK_OPTIONS}
                selectedKindId=""
                onSelectKind={vi.fn()}
                onContinue={vi.fn()}
                onBack={onBack}
                showBackButton={true}
            />
        );

        const backBtn = screen.getByRole("button", { name: "Back Home" });
        expect(backBtn).toBeTruthy();
        fireEvent.click(backBtn);
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("renders both option cards with badges, subtitles, helpers, and tabular-nums fact chips", () => {
        render(
            <MockTestPortal
                options={MOCK_OPTIONS}
                selectedKindId=""
                onSelectKind={vi.fn()}
                onContinue={vi.fn()}
                onBack={vi.fn()}
            />
        );

        expect(screen.getByText("Past Papers")).toBeTruthy();
        expect(screen.getByText("Custom Builder")).toBeTruthy();
        expect(screen.getByText("Official Papers")).toBeTruthy();
        expect(screen.getByText("Flexible")).toBeTruthy();

        // Check fact chips and tabular-nums class
        const countChip = screen.getByText("65 Questions");
        const durationChip = screen.getByText("180 min");
        expect(countChip.className.includes("tabular-nums")).toBe(true);
        expect(durationChip.className.includes("tabular-nums")).toBe(true);

        // Check helpers
        expect(screen.getByText(/Practice exact official examination papers/i)).toBeTruthy();
        expect(screen.getByText(/Build custom practice attempts/i)).toBeTruthy();
    });

    it("calls onSelectKind when an option card is clicked", () => {
        const onSelectKind = vi.fn();
        render(
            <MockTestPortal
                options={MOCK_OPTIONS}
                selectedKindId=""
                onSelectKind={onSelectKind}
                onContinue={vi.fn()}
                onBack={vi.fn()}
            />
        );

        const pastPaperOption = screen.getByTestId("mock-portal-option-paper_mode");
        fireEvent.click(pastPaperOption);
        expect(onSelectKind).toHaveBeenCalledWith("paper_mode");

        const customOption = screen.getByTestId("mock-portal-option-custom");
        fireEvent.click(customOption);
        expect(onSelectKind).toHaveBeenCalledWith("custom");
    });

    it("disables continue button when no option is selected", () => {
        render(
            <MockTestPortal
                options={MOCK_OPTIONS}
                selectedKindId=""
                onSelectKind={vi.fn()}
                onContinue={vi.fn()}
                onBack={vi.fn()}
            />
        );

        const continueBtn = screen.getByTestId("mock-portal-continue");
        expect(continueBtn.disabled).toBe(true);
    });

    it("enables continue button and reflects selected mode when an option is selected", () => {
        const onContinue = vi.fn();
        render(
            <MockTestPortal
                options={MOCK_OPTIONS}
                selectedKindId="paper_mode"
                onSelectKind={vi.fn()}
                onContinue={onContinue}
                onBack={vi.fn()}
            />
        );

        // Header and card both show selected mode title
        expect(screen.getAllByText("Past Papers").length).toBe(2);

        // Card is selected
        const pastPaperCard = screen.getByTestId("mock-portal-option-paper_mode");
        expect(pastPaperCard.className.includes("is-selected")).toBe(true);

        // Continue button
        const continueBtn = screen.getByTestId("mock-portal-continue");
        expect(continueBtn.disabled).toBe(false);
        expect(screen.getByText("Continue with Past Papers")).toBeTruthy();

        fireEvent.click(continueBtn);
        expect(onContinue).toHaveBeenCalledTimes(1);
    });
});
