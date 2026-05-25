import { describe, expect, test } from "vitest";

import {
  extractRowsFromHtml,
  extractRowsFromPayload,
  parseArgs,
} from "./scrape-aptitude.mjs";
import {
  classifyCatalogContext,
  filterAttemptedRows,
} from "./aptitude-intake-classifier.mjs";

describe("scrape-aptitude parser", () => {
  test("extracts structured JSON questions into the parsed aptitude contract", () => {
    const rows = extractRowsFromPayload(
      {
        questions: [
          {
            subject: "Quant",
            topic: "Algebra",
            questionHtml: "<p>If x<sup>2</sup> = 25, what is x?</p>",
            options: ["3", "4", "5", "6"],
            correctAnswer: "C",
          },
        ],
      },
      "https://aptitude-bank.internal/math/algebra"
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      answer: "C",
      type: "MCQ",
      subject: "Quant",
      subtopic: "Algebra",
    });
    expect(rows[0].questionHtml).toContain("<sup>2</sup>");
    expect(rows[0].questionHtml.match(/<ol/g)).toHaveLength(1);
    expect(rows[0]._source).toMatchObject({
      sourceKind: "aptitude-web",
      sourceProvider: "AptitudeBank",
      pageUrl: "https://aptitude-bank.internal/math/algebra",
    });
  });

  test("extracts rendered HTML cards and strips the embedded option list before rebuilding it", () => {
    const html = `
      <article class="question-card" data-subject="English" data-subtopic="Synonyms" data-answer="B">
        <div class="question-text">
          <p>Choose the synonym of <strong>brief</strong>.</p>
          <ol type="A">
            <li>Long</li>
            <li>Short</li>
            <li>Wide</li>
            <li>Deep</li>
          </ol>
        </div>
        <ol type="A">
          <li>Long</li>
          <li>Short</li>
          <li>Wide</li>
          <li>Deep</li>
        </ol>
      </article>
    `;

    const rows = extractRowsFromHtml(html, "https://aptitude-bank.internal/english/synonyms");

    expect(rows).toHaveLength(1);
    expect(rows[0].subject).toBe("English");
    expect(rows[0].subtopic).toBe("Synonyms");
    expect(rows[0].answer).toBe("B");
    expect(rows[0].questionHtml.match(/<ol/g)).toHaveLength(1);
    expect((rows[0].questionHtml.match(/Short/g) || [])).toHaveLength(1);
  });

  test("maps a correct option class to the answer key", () => {
    const html = `
      <section class="quiz-question" data-subject="Reasoning" data-topic="Coding-Decoding">
        <h3>If CAT is coded as DBU, how is DOG coded?</h3>
        <ul>
          <li class="option">A. EPH</li>
          <li class="option correct">B. EPH</li>
          <li class="option">C. CNE</li>
          <li class="option">D. ENH</li>
        </ul>
      </section>
    `;

    const rows = extractRowsFromHtml(html, "https://aptitude-bank.internal/reasoning/coding-decoding");

    expect(rows).toHaveLength(1);
    expect(rows[0].answer).toBe("B");
    expect(rows[0].subject).toBe("Reasoning");
    expect(rows[0].subtopic).toBe("Coding - Decoding");
  });

  test("extracts AptitudeBank TEST_DATA payloads with MathML intact", () => {
    const html = `
      <title>Number System 01</title>
      <script>
        window.TEST_DATA = {"final_test_response":[[{"subjects":[{"subject_name":"Quantitative Aptitude"}],"details":[{
          "question":"<p>1. Find <math display=\\"inline\\"><mfrac><mn>1</mn><mn>2</mn></mfrac></math> of 10.</p>",
          "option1":"<p>4</p>",
          "option2":"<p>5</p>",
          "option3":"<p>6</p>",
          "option4":"<p>8</p>",
          "correct_answer":"b"
        }]}]]};
      </script>
    `;

    const rows = extractRowsFromHtml(html, "https://aptitude-bank.internal/play?paper_pack=Number%20System%2001");

    expect(rows).toHaveLength(1);
    expect(rows[0].subject).toBe("Quant");
    expect(rows[0].subtopic).toBe("Number System");
    expect(rows[0].answer).toBe("B");
    expect(rows[0].questionHtml).toContain("<math");
    expect(rows[0].questionHtml).not.toContain("1. Find");
    expect(rows[0].options[1]).toBe("<p>5</p>");
  });

  test("uses catalog context for exam metadata and year", () => {
    const rows = extractRowsFromPayload(
      {
        questions: [
          {
            subject: "Quantitative Aptitude",
            topic: "Percentage",
            question: "Find 20% of 500.",
            options: ["50", "80", "100", "120"],
            answer: "C",
          },
        ],
      },
      "https://aptitude-bank.internal/play#paper-demo",
      {
        product: "SSC Eduquity Test Pass : 2026",
        tier: "SSC CGL Tier 1 Mock: 110",
        testType: "Sectional",
        series: "SSC CGL Tier 1 Quant Sectional Tests 2026",
        paper: "SSC CGL Tier 1 Quant Test 01",
      }
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      subject: "Quant",
      subtopic: "Percentage",
      year: 2026,
      _source: {
        sourceKind: "aptitude-web",
        sourceProvider: "AptitudeBank",
        examBody: "SSC",
        examName: "SSC CGL Tier 1",
        year: 2026,
      },
    });
  });

  test("reads credentials from environment without requiring CLI flags", () => {
    const options = parseArgs([], {
      APTITUDE_PASSWORD: "secret",
      APTITUDE_COOKIE: "session=abc",
      APTITUDE_BASE_URL: "https://aptitude-bank.internal/",
    });

    expect(options.password).toBe("secret");
    expect(options.cookie).toBe("session=abc");
    expect(options.headless).toBe(true);
    expect(options.products).toEqual(["*"]);
    expect(options.testTypeIds).toEqual(["*"]);
    expect(options.includeAllSeries).toBe(true);
  });

  test("classifies AptitudeBank catalog entries before scraping broad or non-aptitude packs", () => {
    expect(
      classifyCatalogContext({
        product: "SSC Eduquity Test Pass : 2026",
        tier: "SSC CGL Tier 1",
        testType: "Chapter Test",
        series: "Quant Percentage Chapter Tests",
        paper: "Percentage 01",
      })
    ).toMatchObject({ action: "attempt" });

    expect(
      classifyCatalogContext({
        product: "SSC Eduquity Test Pass : 2026",
        tier: "SSC CGL Tier 1",
        testType: "Mock Tests(Full Length)",
        series: "SSC CGL Tier - 1 Mock Test",
        paper: "Mock 01",
      })
    ).toMatchObject({ action: "ignore", reason: "broad_low_signal_pack" });

    expect(
      classifyCatalogContext({
        testType: "Chapter Test",
        series: "General Awareness Practice",
        paper: "Current Affairs 01",
      })
    ).toMatchObject({ action: "ignore", reason: "excluded_source_section" });
  });

  test("filters parsed rows with the same attempt/ignore policy used by reports", () => {
    const source = {
      sourceKind: "aptitude-web",
      pageUrl: "https://aptitude-bank.internal/play#paper-demo",
      sourceId: "demo",
    };
    const { attempted, report, ignoredSamples } = filterAttemptedRows([
      {
        questionHtml: "<p>Find 20% of 500.</p>",
        options: ["50", "80", "100", "120"],
        answer: "C",
        subject: "Quant",
        subtopic: "Percentage",
        _source: source,
      },
      {
        questionHtml: "<p>Choose the correct statement about force.</p>",
        options: ["A", "B", "C", "D"],
        answer: "A",
        subject: "Physics",
        subtopic: "Mechanics",
        _source: source,
      },
      {
        questionHtml: "<p>Which Article of the Constitution deals with fundamental duties?</p>",
        options: ["Article 21", "Article 51A", "Article 370", "Article 14"],
        answer: "B",
        subject: "Reasoning",
        subtopic: "Miscellaneous",
        _source: source,
      },
      {
        questionHtml: "<p><strong>Direction</strong> :- Study the statement and choose the conclusion.</p>",
        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
        answer: "A",
        subject: "Reasoning",
        subtopic: "Statement And Conclusion",
        _source: source,
      },
    ]);

    expect(attempted).toHaveLength(1);
    expect(report.rows).toMatchObject({
      attempted: 1,
      ignored: 3,
      ignoredByReason: { unsupported_subject: 1, general_awareness_leak: 1, forbidden_display_token: 1 },
    });
    expect(ignoredSamples[0].reason).toBe("unsupported_subject");
  });

  test("keeps AptitudeBank image rows when subject and taxonomy are valid", () => {
    const source = {
      sourceKind: "aptitude-web",
      pageUrl: "https://aptitude-bank.internal/play#paper-image",
      sourceId: "image-demo",
    };

    const { attempted, report } = filterAttemptedRows([
      {
        questionHtml: '<p>Select the figure.</p><img src="https://lh3.googleusercontent.com/demo.png" alt="figure">',
        options: ["A", "B", "C", "D"],
        answer: "A",
        subject: "Reasoning",
        subtopic: "Miscellaneous",
        _source: source,
      },
    ]);

    expect(attempted).toHaveLength(1);
    expect(report.rows).toMatchObject({
      attempted: 1,
      ignored: 0,
    });
  });

  test("keeps image-only answer options as valid options", () => {
    const source = {
      sourceKind: "aptitude-web",
      pageUrl: "https://aptitude-bank.internal/play#paper-image-options",
      sourceId: "image-option-demo",
    };

    const { attempted, report } = filterAttemptedRows([
      {
        questionHtml: '<p>Select the embedded figure.</p><img src="https://example.com/question.png">',
        options: [
          '<img src="https://example.com/a.png" alt="A">',
          '<img src="https://example.com/b.png" alt="B">',
          '<img src="https://example.com/c.png" alt="C">',
          '<img src="https://example.com/d.png" alt="D">',
        ],
        answer: "B",
        subject: "Reasoning",
        subtopic: "Miscellaneous",
        _source: source,
      },
    ]);

    expect(attempted).toHaveLength(1);
    expect(report.rows).toMatchObject({
      attempted: 1,
      ignored: 0,
    });
  });
});
