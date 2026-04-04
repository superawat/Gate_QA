/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, act, waitFor, cleanup } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { MockTestProvider, useMockTest } from "./MockTestContext";

let mockAllQuestions = [];

vi.mock("./FilterContext", () => ({
  useFilterState: () => ({
    allQuestions: mockAllQuestions,
  }),
}));

const buildGaQuestion = (index) => ({
  question_uid: `ga:${index + 1}`,
  title: `GA ${index + 1}`,
  subject: "General Aptitude",
  question: "<p>GA question</p>",
  type: "mcq",
});

const buildCsQuestion = (index) => ({
  question_uid: `cs:${index + 1}`,
  title: `CS ${index + 1}`,
  subject: "Operating System",
  question: "<p>CS question</p>",
  type: "mcq",
});

describe("MockTestContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    mockAllQuestions = [];
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test("keeps strict GA/CS counts and preserves section-local index on toggle", async () => {
    const ga = Array.from({ length: 10 }, (_, index) => buildGaQuestion(index));
    const cs = Array.from({ length: 55 }, (_, index) => buildCsQuestion(index));
    mockAllQuestions = [...ga, ...cs];

    let latest = null;
    const Probe = () => {
      latest = useMockTest();
      return null;
    };

    render(
      <MockTestProvider>
        <Probe />
      </MockTestProvider>
    );

    act(() => {
      const started = latest.startTest({
        gaQuestions: ga,
        csQuestions: cs,
        meta: {
          strictSectionCounts: { GA: 10, CS: 55 },
        },
      });
      expect(started).toBe(true);
    });

    await waitFor(() => {
      expect(latest.sectionQuestionUids.GA).toHaveLength(10);
      expect(latest.sectionQuestionUids.CS).toHaveLength(55);
      expect(latest.currentSection).toBe("GA");
      expect(latest.currentQuestion.question_uid).toBe("ga:1");
    });

    act(() => {
      latest.goToQuestion(3, "GA");
    });

    await waitFor(() => {
      expect(latest.currentSection).toBe("GA");
      expect(latest.currentSectionIndex).toBe(3);
      expect(latest.currentQuestion.question_uid).toBe("ga:4");
    });

    act(() => {
      latest.setCurrentSection("CS");
    });

    await waitFor(() => {
      expect(latest.currentSection).toBe("CS");
      expect(latest.currentSectionIndex).toBe(0);
      expect(latest.currentQuestion.question_uid).toBe("cs:1");
    });

    act(() => {
      latest.goToQuestion(16, "CS");
    });

    await waitFor(() => {
      expect(latest.currentSection).toBe("CS");
      expect(latest.currentSectionIndex).toBe(16);
      expect(latest.currentQuestion.question_uid).toBe("cs:17");
    });

    act(() => {
      latest.setCurrentSection("GA");
    });

    await waitFor(() => {
      expect(latest.currentSection).toBe("GA");
      expect(latest.currentSectionIndex).toBe(3);
      expect(latest.currentQuestion.question_uid).toBe("ga:4");
    });
  });
});
