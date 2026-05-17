import { describe, expect, test } from "vitest";

import {
  extractRowsFromHtml,
  extractRowsFromPayload,
  parseArgs,
} from "./scrape-bossxcode.mjs";

describe.skip("scrape-bossxcode parser", () => {
  test("extracts structured JSON questions into the parsed aptitude contract", () => {
    const rows = extractRowsFromPayload(
      {
        questions: [
          {
            subject: "Mathematics",
            topic: "Algebra",
            questionHtml: "<p>If x<sup>2</sup> = 25, what is x?</p>",
            options: ["3", "4", "5", "6"],
            correctAnswer: "C",
          },
        ],
      },
      "https://pt.bossxcode.unaux.com/math/algebra"
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      answer: "C",
      type: "MCQ",
      subject: "Mathematics",
      subtopic: "Algebra",
    });
    expect(rows[0].questionHtml).toContain("<sup>2</sup>");
    expect(rows[0].questionHtml.match(/<ol/g)).toHaveLength(1);
    expect(rows[0]._source).toMatchObject({
      sourceKind: "bossxcode-web",
      examBody: "BossXCode",
      pageUrl: "https://pt.bossxcode.unaux.com/math/algebra",
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

    const rows = extractRowsFromHtml(html, "https://pt.bossxcode.unaux.com/english/synonyms");

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

    const rows = extractRowsFromHtml(html, "https://pt.bossxcode.unaux.com/reasoning/coding-decoding");

    expect(rows).toHaveLength(1);
    expect(rows[0].answer).toBe("B");
    expect(rows[0].subject).toBe("Reasoning");
    expect(rows[0].subtopic).toBe("Coding - Decoding");
  });

  test("extracts BossXCode TEST_DATA payloads with MathML intact", () => {
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

    const rows = extractRowsFromHtml(html, "https://pt.bossxcode.unaux.com/play?paper_pack=Number%20System%2001");

    expect(rows).toHaveLength(1);
    expect(rows[0].subject).toBe("Mathematics");
    expect(rows[0].subtopic).toBe("Number System");
    expect(rows[0].answer).toBe("B");
    expect(rows[0].questionHtml).toContain("<math");
    expect(rows[0].questionHtml).not.toContain("1. Find");
    expect(rows[0].options[1]).toBe("<p>5</p>");
  });

  test("reads credentials from environment without requiring CLI flags", () => {
    const options = parseArgs([], {
      BOSSXCODE_PASSWORD: "secret",
      BOSSXCODE_COOKIE: "session=abc",
      BOSSXCODE_BASE_URL: "https://pt.bossxcode.unaux.com/",
    });

    expect(options.password).toBe("secret");
    expect(options.cookie).toBe("session=abc");
    expect(options.headless).toBe(true);
  });
});
