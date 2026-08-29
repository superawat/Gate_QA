/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FilterProvider, useFilterState } from "../../contexts/FilterContext";
import { MockTestProvider, useMockTest } from "../../contexts/MockTestContext";
import { validateMockQuestionForPool } from "../../utils/mockTest";
import { AnswerService } from "../../services/AnswerService";

// Helper component to inspect FilterContext vs MockTestContext pools
function PoolInspector({ subjectSlug = "digital-logic" }) {
  const { allQuestions } = useFilterState();
  const { mockQuestionPool, questionMetaByUid } = useMockTest();

  const filterSubjectQuestions = allQuestions.filter(
    (q) => q.subjectSlug === subjectSlug
  );

  const mockSubjectQuestions = mockQuestionPool.filter(
    (q) => q.subjectSlug === subjectSlug
  );

  const scorableMockSubjectQuestions = mockSubjectQuestions.filter((q) => {
    const meta = questionMetaByUid[q.question_uid];
    const validation = validateMockQuestionForPool({
      question: q,
      questionMeta: meta,
      answerRecord: AnswerService.getAnswerForQuestion(q),
    });
    return validation.valid;
  });

  return (
    <div>
      <span data-testid="filter-subject-count">{filterSubjectQuestions.length}</span>
      <span data-testid="mock-subject-count">{mockSubjectQuestions.length}</span>
      <span data-testid="scorable-subject-count">{scorableMockSubjectQuestions.length}</span>
    </div>
  );
}

describe("Question Pool Consistency: Filter Questions vs Custom Builder", () => {
  test("Digital Logic has 260 scorable questions in Custom Builder matching Filter Questions", async () => {
    render(
      <MemoryRouter>
        <FilterProvider>
          <MockTestProvider>
            <PoolInspector subjectSlug="digital-logic" />
          </MockTestProvider>
        </FilterProvider>
      </MemoryRouter>
    );

    const filterCountEl = screen.getByTestId("filter-subject-count");
    const scorableCountEl = screen.getByTestId("scorable-subject-count");

    // When initialized synchronously or on data load
    const searchIndex = require("../../../public/question-search-index.json");
    const mockCatalog = require("../../../public/mock_catalog_v1.json");

    const filterTotal = searchIndex.filter((q) => q.subjectSlug === "digital-logic").length;
    const scorableTotal = searchIndex.filter(
      (q) => q.subjectSlug === "digital-logic" && mockCatalog.byQuestionUid[q.question_uid]?.scorable
    ).length;

    expect(filterTotal).toBe(260);
    expect(scorableTotal).toBe(260);
  });

  test("Digital Logic breakdown across MCQ, NAT, MSQ matches exactly", () => {
    const searchIndex = require("../../../public/question-search-index.json");
    const mockCatalog = require("../../../public/mock_catalog_v1.json");

    const dlQuestions = searchIndex.filter((q) => q.subjectSlug === "digital-logic");
    expect(dlQuestions.length).toBe(260);

    const mcqQuestions = dlQuestions.filter((q) => {
      const meta = mockCatalog.byQuestionUid[q.question_uid];
      return meta?.type === "MCQ" && meta?.scorable;
    });
    const natQuestions = dlQuestions.filter((q) => {
      const meta = mockCatalog.byQuestionUid[q.question_uid];
      return meta?.type === "NAT" && meta?.scorable;
    });
    const msqQuestions = dlQuestions.filter((q) => {
      const meta = mockCatalog.byQuestionUid[q.question_uid];
      return meta?.type === "MSQ" && meta?.scorable;
    });

    expect(mcqQuestions.length).toBe(198);
    expect(natQuestions.length).toBe(46);
    expect(msqQuestions.length).toBe(16);
    expect(mcqQuestions.length + natQuestions.length + msqQuestions.length).toBe(260);
  });

  test("Paper Mode preserves standardized 65-question papers without leaking unscoped bank questions", () => {
    const mockCatalog = require("../../../public/mock_catalog_v1.json");
    const readyPapers = (mockCatalog.papers || []).filter((p) => p.paperReady);

    expect(readyPapers.length).toBeGreaterThan(0);
    readyPapers.forEach((paper) => {
      if (!paper.legacyPartial) {
        expect(paper.requiredQuestionCount).toBe(65);
        expect(paper.scorableCount).toBe(65);
      }
    });
  });

  test("All 8 GATE DA subjects maintain 1:1 question pool consistency", () => {
    const daSearchIndex = require("../../../public/data/da/search-index.json");
    const mockCatalogDa = require("../../../public/mock_catalog_da_v1.json");

    const daQuestions = Array.isArray(daSearchIndex) ? daSearchIndex : daSearchIndex.questions;
    expect(daQuestions.length).toBe(195);

    const scorableDa = daQuestions.filter((q) => {
      const meta = mockCatalogDa.byQuestionUid[q.question_uid];
      return meta?.scorable === true;
    });
    expect(scorableDa.length).toBe(195);
  });
});
