import { describe, expect, test } from "vitest";

import { stripEmbeddedOptions } from "./stripEmbeddedOptions";

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
});
