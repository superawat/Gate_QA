import { describe, expect, test } from "vitest";

import { extractEmbeddedOptions, stripEmbeddedOptions } from "./stripEmbeddedOptions";

describe("stripEmbeddedOptions", () => {
  test("removes wrapped alpha option lists", () => {
    const html = `
      <div itemprop="text">
        <p>The antonym of the word protagonist is $\\_\\_\\_\\_\\_\\_$.</p>
        <ol start="1" style="list-style-type: upper-alpha;">
          <li>agnostic</li>
          <li>antagonist</li>
          <li>arsonist</li>
          <li>anarchist</li>
        </ol>
      </div>
    `;

    const cleaned = stripEmbeddedOptions(html);

    expect(cleaned).toContain("The antonym of the word protagonist");
    expect(cleaned).not.toContain("<ol");
    expect(cleaned).not.toContain("agnostic");
  });

  test("extracts and strips paragraph-labeled options", () => {
    const html = `
      <p>Choose the largest floating-point number among the following options.</p>
      <p>A. $0\\ 01111111\\ 111$</p>
      <p>B. $0\\ 11111110\\ 111$</p>
      <p>C. $0\\ 11111111\\ 111$</p>
      <p>D. $0\\ 01111111\\ 000$</p>
    `;

    const options = extractEmbeddedOptions(html);
    const cleaned = stripEmbeddedOptions(html);

    expect(options.map((option) => option.label)).toEqual(["A", "B", "C", "D"]);
    expect(options[1].text).toContain("11111110");
    expect(cleaned).toContain("Choose the largest floating-point number");
    expect(cleaned).not.toContain("A.");
    expect(cleaned).not.toContain("11111110");
  });

  test("extracts and strips preformatted SQL options", () => {
    const html = `
      <p>Which SQL query retrieves the requested rows?</p>
      <pre>A. SELECT S.name FROM Students S WHERE EXISTS (...);</pre>
      <pre>B. SELECT S.name FROM Students S WHERE SIZEOF (...) > 0;</pre>
      <pre>C. SELECT S.name FROM Students S WHERE 0 < (SELECT COUNT(*));</pre>
      <pre>D. SELECT S.name FROM Students S NATURAL JOIN Enrolled E;</pre>
    `;

    const options = extractEmbeddedOptions(html);
    const cleaned = stripEmbeddedOptions(html);

    expect(options.map((option) => option.label)).toEqual(["A", "B", "C", "D"]);
    expect(options[0].text).toContain("SELECT S.name");
    expect(cleaned).toContain("Which SQL query");
    expect(cleaned).not.toContain("<pre");
    expect(cleaned).not.toContain("SIZEOF");
  });

  test("extracts trailing ordered statement choices before closing wrappers", () => {
    const html = `
      <div class="qa-q-view-content">
        <div itemprop="text">
          <p>Which of the following statements is/are TRUE?</p>
          <ol>
            <li>There is a RAW dependency.</li>
            <li>There is a WAR dependency.</li>
            <li>There is a WAW dependency.</li>
            <li>There is a structural dependency.</li>
          </ol>
        </div>
      </div>
    `;

    const options = extractEmbeddedOptions(html);
    const cleaned = stripEmbeddedOptions(html);

    expect(options.map((option) => option.label)).toEqual(["A", "B", "C", "D"]);
    expect(options[2].text).toContain("WAW dependency");
    expect(cleaned).toContain("Which of the following statements");
    expect(cleaned).not.toContain("<ol");
    expect(cleaned).not.toContain("RAW dependency");
  });

  test("removes split alpha lists and option-adjacent media from the stem", () => {
    const html = `
      <p>Which statements are true?</p>
      <ol style="list-style-type:upper-alpha">
        <li>First statement.</li>
        <li>Second statement.</li>
        <li>The following graph is valid.</li>
      </ol>
      <p style="text-align:center"><img src="/Gate_QA/question-images/graph.webp" alt=""></p>
      <ol start="4" style="list-style-type:upper-alpha">
        <li>Fourth statement.</li>
      </ol>
    `;

    const options = extractEmbeddedOptions(html);
    const cleaned = stripEmbeddedOptions(html);

    expect(options).toHaveLength(4);
    expect(options[2].html).toContain("graph.webp");
    expect(cleaned).toContain("Which statements are true?");
    expect(cleaned).not.toContain("First statement");
    expect(cleaned).not.toContain("graph.webp");
    expect(cleaned).not.toContain("Fourth statement");
  });

  test("groups image-only overflow list items into visual options", () => {
    const html = `
      <p>Choose the figure.</p>
      <ol style="list-style-type:upper-alpha">
        <li><img src="/a-label.webp" alt=""></li>
        <li><img src="/a-figure.webp" alt=""></li>
        <li><img src="/b-label.webp" alt=""></li>
        <li><img src="/b-figure.webp" alt=""></li>
        <li><img src="/c-label.webp" alt=""></li>
        <li><img src="/c-figure.webp" alt=""></li>
        <li><img src="/d-label.webp" alt=""></li>
        <li><img src="/d-figure.webp" alt=""></li>
      </ol>
    `;

    const options = extractEmbeddedOptions(html);

    expect(options.map((option) => option.label)).toEqual(["A", "B", "C", "D"]);
    expect(options[0].html).toContain("a-label.webp");
    expect(options[0].html).toContain("a-figure.webp");
    expect(options[3].html).toContain("d-figure.webp");
  });
});
