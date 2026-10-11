import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  renderPage,
  replaceOrInsertHeadTag,
  qaPageSchema,
  quizSchema,
  breadcrumbSchema,
} from "../../scripts/prerender-seo-pages.mjs";

const DUMMY_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Default Title</title>
  <meta name="description" content="Default Description" />
</head>
<body>
  <div id="root"><p>Loading...</p></div>
</body>
</html>`;

describe("prerender-seo-pages string replacement resilience", () => {
  it("does not corrupt head tags when description or content contains '$'' special replacement pattern", () => {
    const pageWithDollarQuote = {
      path: "/practice/question/go%3A460066/",
      canonicalUrl: "https://gateqa.in/practice/question/go%3A460066/",
      title: "GATE CSE 2025 | Set 1 | Question: 14 - Digital Logic | GateQA",
      h1: "GATE CSE 2025 | Set 1 | Question: 14",
      description: "Let $X$ be a $3$-variable Boolean function that produces output as $'1'$ when at least two of the input variables are $'1'$.",
      ogType: "article",
      schemas: [
        breadcrumbSchema([{ name: "Home", url: "https://gateqa.in/" }]),
        qaPageSchema({
          question: {
            title: "GATE CSE 2025 | Set 1 | Question: 14",
            year: "2025",
            preview: "Let $X$ be a $3$-variable Boolean function that produces output as $'1'$ when at least two of the input variables are $'1'$.",
          },
          answerText: "Answer: B, D",
          url: "https://gateqa.in/practice/question/go%3A460066/",
        }),
        quizSchema({
          question: {
            title: "GATE CSE 2025 | Set 1 | Question: 14",
            year: "2025",
            preview: "Let $X$ be a $3$-variable Boolean function that produces output as $'1'$ when at least two of the input variables are $'1'$.",
            subjectLabel: "Digital Logic",
          },
          url: "https://gateqa.in/practice/question/go%3A460066/",
        }),
      ],
      links: [],
      items: [],
    };

    const rendered = renderPage(DUMMY_TEMPLATE, pageWithDollarQuote);

    // 1. Must contain exactly one </head> and one </html>
    expect((rendered.match(/<\/head>/g) || []).length).toBe(1);
    expect((rendered.match(/<\/html>/g) || []).length).toBe(1);

    // 2. No content should trail after </html>
    const htmlEnd = rendered.indexOf("</html>");
    const trailingContent = rendered.slice(htmlEnd + "</html>".length).trim();
    expect(trailingContent).toBe("");

    // 3. Extract and parse all application/ld+json blocks
    const jsonLdMatches = [...rendered.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    expect(jsonLdMatches.length).toBe(3);

    for (const match of jsonLdMatches) {
      expect(() => JSON.parse(match[1])).not.toThrow();
      const parsed = JSON.parse(match[1]);
      expect(parsed["@context"]).toBe("https://schema.org");
    }
  });

  it("handles '$2$'s complement' from go:118289 without syntax errors", () => {
    const pageWithComplement = {
      path: "/practice/question/go%3A118289/",
      canonicalUrl: "https://gateqa.in/practice/question/go%3A118289/",
      title: "GATE CSE 2017 Set 1 | Question: 9 - Digital Logic | GateQA",
      h1: "GATE CSE 2017 Set 1 | Question: 9",
      description: "When two $8\\text{-bit}$ numbers in $2$'s complement representation are added...",
      ogType: "article",
      schemas: [
        qaPageSchema({
          question: {
            title: "GATE CSE 2017 Set 1 | Question: 9",
            year: "2017",
            preview: "When two $8\\text{-bit}$ numbers in $2$'s complement representation are added...",
          },
          answerText: "Answer: C",
          url: "https://gateqa.in/practice/question/go%3A118289/",
        }),
      ],
      links: [],
      items: [],
    };

    const rendered = renderPage(DUMMY_TEMPLATE, pageWithComplement);
    expect((rendered.match(/<\/head>/g) || []).length).toBe(1);

    const jsonLdMatches = [...rendered.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    expect(jsonLdMatches.length).toBe(1);
    const parsed = JSON.parse(jsonLdMatches[0][1]);
    expect(parsed.mainEntity.text).toContain("$2$'s complement");
  });

  it("safely escapes '<' as '\\u003c' in JSON-LD blocks to prevent premature script tag closing", () => {
    const pageWithScript = {
      path: "/practice/question/test/",
      canonicalUrl: "https://gateqa.in/practice/question/test/",
      title: "Script Test",
      description: "Test question with script tag",
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "Question",
          text: "What does <script>alert('xss')</script> do?",
        },
      ],
    };

    const rendered = renderPage(DUMMY_TEMPLATE, pageWithScript);
    expect(rendered).not.toContain("<script>alert");
    expect(rendered).toContain("\\u003cscript");

    const jsonLdMatch = rendered.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    expect(jsonLdMatch).not.toBeNull();
    const parsed = JSON.parse(jsonLdMatch[1]);
    expect(parsed.text).toBe("What does <script>alert('xss')</script> do?");
  });

  it("verifies built dist files for go:460066 and go:118289 if present in dist", () => {
    const file460066 = path.resolve(process.cwd(), "dist/practice/question/go%3A460066/index.html");
    const file118289 = path.resolve(process.cwd(), "dist/practice/question/go%3A118289/index.html");

    for (const filePath of [file460066, file118289]) {
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, "utf8");
      expect((content.match(/<\/head>/g) || []).length).toBe(1);
      const jsonLdMatches = [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
      expect(jsonLdMatches.length).toBeGreaterThan(0);
      for (const match of jsonLdMatches) {
        expect(() => JSON.parse(match[1])).not.toThrow();
      }
    }
  });

  it("ensures zero JSON-LD parsing errors across all prerendered pages in dist", () => {
    const questionDir = path.resolve(process.cwd(), "dist/practice/question");
    if (!fs.existsSync(questionDir)) return;

    const entries = fs.readdirSync(questionDir, { withFileTypes: true });
    let pagesChecked = 0;
    let jsonLdBlocksChecked = 0;
    const errors = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const htmlPath = path.join(questionDir, entry.name, "index.html");
      if (!fs.existsSync(htmlPath)) continue;

      pagesChecked++;
      const content = fs.readFileSync(htmlPath, "utf8");

      // Verify no duplicated </head>
      const headCount = (content.match(/<\/head>/g) || []).length;
      if (headCount !== 1) {
        errors.push({ path: htmlPath, error: `Expected 1 </head> but found ${headCount}` });
      }

      // Verify all JSON-LD blocks parse cleanly
      const matches = [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
      for (const match of matches) {
        jsonLdBlocksChecked++;
        try {
          JSON.parse(match[1]);
        } catch (err) {
          errors.push({ path: htmlPath, error: err.message, snippet: match[1].slice(0, 80) });
        }
      }
    }

    expect(errors).toEqual([]);
    expect(pagesChecked).toBeGreaterThan(3000);
    expect(jsonLdBlocksChecked).toBeGreaterThan(6000);
  });
});

