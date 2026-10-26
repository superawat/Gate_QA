/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MockTestResults, {
  generatePerformanceAnalysis,
  StructuredReviewSection,
} from "./MockTestResults";
import { MockTestContext } from "../../contexts/MockTestContext";

describe("generatePerformanceAnalysis", () => {
  const sampleGaQuestion = {
    question_uid: "ga:1",
    subject: "General Aptitude",
    subjectSlug: "ga",
    subjectLabel: "General Aptitude",
    subtopics: [{ label: "Numerical Ability" }],
  };

  const sampleMeQuestion = {
    question_uid: "pp:me:2024:q1",
    subject: "Thermodynamics",
    subjectSlug: "me-thermo",
    subjectLabel: "Thermodynamics",
    track: "me",
    subtopics: [{ label: "First Law" }],
  };

  const sampleEcQuestion = {
    question_uid: "pp:ec:2024:q1",
    subject: "Electronic Devices",
    subjectSlug: "ec-edc",
    subjectLabel: "Electronic Devices",
    track: "ec",
    subtopics: [{ label: "Semiconductor Physics" }],
  };

  test("runs safely when attemptMeta is null or undefined without throwing ReferenceError", () => {
    const questions = [sampleGaQuestion, sampleMeQuestion];
    const summary = {
      attempted: 2,
      correct: 1,
      incorrect: 1,
      sectionSummary: {
        GA: { total: 1, attempted: 1, correct: 1 },
        CS: { total: 1, attempted: 1, correct: 0 },
      },
      perQuestionResult: {
        "ga:1": { correct: true, answered: true, timeSpentSeconds: 60 },
        "pp:me:2024:q1": { correct: false, answered: true, timeSpentSeconds: 90 },
      },
    };

    expect(() => generatePerformanceAnalysis(questions, summary, null)).not.toThrow();
    expect(() => generatePerformanceAnalysis(questions, summary, undefined)).not.toThrow();

    const analysis = generatePerformanceAnalysis(questions, summary, null);
    expect(analysis.observations.length).toBeGreaterThan(0);
    // Should resolve ME from questions
    expect(analysis.observations[0].text).toContain("Mechanical Engineering");
  });

  test("generates info observation recommending core practice when GA accuracy exceeds core by > 25%", () => {
    const questions = [sampleGaQuestion, sampleEcQuestion];
    const summary = {
      attempted: 2,
      correct: 1,
      incorrect: 1,
      sectionSummary: {
        GA: { total: 1, attempted: 1, correct: 1 }, // 100%
        CS: { total: 1, attempted: 1, correct: 0 }, // 0%
      },
      perQuestionResult: {
        "ga:1": { correct: true, answered: true, timeSpentSeconds: 50 },
        "pp:ec:2024:q1": { correct: false, answered: true, timeSpentSeconds: 80 },
      },
    };

    const analysis = generatePerformanceAnalysis(questions, summary, { track: "ec" });
    const observation = analysis.observations.find((obs) =>
      obs.text.includes("Strong performance in General Aptitude")
    );
    expect(observation).toBeDefined();
    expect(observation.text).toContain("Electronics & Communication");
  });

  test("generates info observation recommending GA practice when core accuracy exceeds GA by > 25%", () => {
    const questions = [sampleGaQuestion, sampleMeQuestion];
    const summary = {
      attempted: 2,
      correct: 1,
      incorrect: 1,
      sectionSummary: {
        GA: { total: 1, attempted: 1, correct: 0 }, // 0%
        CS: { total: 1, attempted: 1, correct: 1 }, // 100%
      },
      perQuestionResult: {
        "ga:1": { correct: false, answered: true, timeSpentSeconds: 45 },
        "pp:me:2024:q1": { correct: true, answered: true, timeSpentSeconds: 70 },
      },
    };

    const analysis = generatePerformanceAnalysis(questions, summary, { track: "me" });
    const observation = analysis.observations.find((obs) =>
      obs.text.includes("Strong performance in Mechanical Engineering")
    );
    expect(observation).toBeDefined();
    expect(observation.text).toContain("Do not neglect General Aptitude");
  });

  test("handles single-section papers safely without adding cross-section comparison", () => {
    const questions = [sampleMeQuestion];
    const summary = {
      attempted: 1,
      correct: 1,
      incorrect: 0,
      sectionSummary: {
        GA: { total: 0, attempted: 0, correct: 0 },
        CS: { total: 1, attempted: 1, correct: 1 },
      },
      perQuestionResult: {
        "pp:me:2024:q1": { correct: true, answered: true, timeSpentSeconds: 60 },
      },
    };

    const analysis = generatePerformanceAnalysis(questions, summary, null);
    expect(analysis.observations.some((obs) => obs.text.includes("General Aptitude"))).toBe(false);
  });
});

describe("StructuredReviewSection component", () => {
  test("renders diagnostic sections safely with attemptMeta passed", () => {
    const questions = [
      {
        question_uid: "ga:1",
        subject: "General Aptitude",
        subjectSlug: "ga",
        subjectLabel: "General Aptitude",
        subtopics: [{ label: "Verbal" }],
      },
      {
        question_uid: "pp:ee:2024:q1",
        subject: "Power Systems",
        subjectSlug: "ee-power",
        subjectLabel: "Power Systems",
        track: "ee",
        subtopics: [{ label: "Transmission Lines" }],
      },
    ];

    const summary = {
      attempted: 2,
      correct: 1,
      incorrect: 1,
      unanswered: 0,
      sectionSummary: {
        GA: { total: 1, attempted: 1, correct: 1 },
        CS: { total: 1, attempted: 1, correct: 0 },
      },
      perQuestionResult: {
        "ga:1": { correct: true, answered: true, timeSpentSeconds: 60 },
        "pp:ee:2024:q1": { correct: false, answered: true, timeSpentSeconds: 120 },
      },
    };

    render(
      <StructuredReviewSection
        questions={questions}
        summary={summary}
        attemptMeta={{ track: "ee" }}
      />
    );

    expect(screen.getByText("Structured Performance Diagnostic")).toBeTruthy();
    expect(screen.getByText(/Electrical Engineering/)).toBeTruthy();
  });
});

describe("MockTestResults component", () => {
  const renderResults = (contextValue = {}, props = {}) => {
    const defaultContext = {
      questions: [
        {
          question_uid: "ga:1",
          subject: "General Aptitude",
          subjectSlug: "ga",
          subjectLabel: "General Aptitude",
          subtopics: [{ label: "Numerical Ability" }],
        },
        {
          question_uid: "pp:me:2024:q1",
          subject: "Thermodynamics",
          subjectSlug: "me-thermo",
          subjectLabel: "Thermodynamics",
          track: "me",
          subtopics: [{ label: "First Law" }],
        },
      ],
      resultSummary: {
        attempted: 2,
        correct: 1,
        incorrect: 1,
        unanswered: 0,
        bonus: 0,
        score: 1.67,
        maxScore: 3,
        timeAnalysis: {
          totalSeconds: 150,
          averageSeconds: 75,
          slowQuestionCount: 0,
          slowThresholdSeconds: 180,
        },
        sectionSummary: {
          GA: { total: 1, attempted: 1, correct: 1, incorrect: 0, unanswered: 0, bonus: 0, score: 1, maxScore: 1 },
          CS: { total: 1, attempted: 1, correct: 0, incorrect: 1, unanswered: 0, bonus: 0, score: -0.33, maxScore: 2 },
        },
        perQuestionResult: {
          "ga:1": { correct: true, answered: true, status: "correct", timeSpentSeconds: 60 },
          "pp:me:2024:q1": { correct: false, answered: true, status: "incorrect", timeSpentSeconds: 90 },
        },
      },
      attemptMeta: {
        kindId: "paper_mode",
        track: "me",
        selectedPaperLabel: "GATE ME 2024",
      },
    };

    return render(
      <MockTestContext.Provider value={{ ...defaultContext, ...contextValue }}>
        <MockTestResults onExit={vi.fn()} onReview={vi.fn()} {...props} />
      </MockTestContext.Provider>
    );
  };

  test("renders results for a full two-section paper without throwing ReferenceError", () => {
    renderResults();

    expect(screen.getByText("Exam Submitted Successfully")).toBeTruthy();
    expect(screen.getByText("Structured Performance Diagnostic")).toBeTruthy();
    expect(screen.getByText("Mechanical Engineering")).toBeTruthy();
    expect(screen.getByText(/Strong performance in General Aptitude/)).toBeTruthy();
  });

  test("renders results safely when attemptMeta is null (e.g. unauthenticated or minimal attempt)", () => {
    renderResults({ attemptMeta: null });

    expect(screen.getByText("Exam Submitted Successfully")).toBeTruthy();
    expect(screen.getByText("Structured Performance Diagnostic")).toBeTruthy();
  });
});
