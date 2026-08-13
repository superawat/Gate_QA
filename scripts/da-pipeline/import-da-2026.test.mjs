import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  buildQuestion,
  extractPaperStructure,
  extractQuestionBlocks,
  parseOptions,
  readStructuredQuestions,
} from "./import-da-2026.mjs";

const ROOT = process.cwd();
const sourcePath = path.join(ROOT, "da_2026", "main.tex");
const hasOptionalSource = fs.existsSync(sourcePath);
const tex = hasOptionalSource ? fs.readFileSync(sourcePath, "utf8") : "";
const blocks = hasOptionalSource ? extractQuestionBlocks(tex) : [];
const describeDa2026 = hasOptionalSource ? describe : describe.skip;

describeDa2026("GATE DA 2026 LaTeX intake", () => {
  test("preserves all 65 source question boundaries and numbers", () => {
    expect(blocks).toHaveLength(65);
    expect(blocks.map((block) => block.number)).toEqual(Array.from({ length: 65 }, (_, index) => index + 1));
  });

  test("derives source paper sections and mark ranges", () => {
    const structure = extractPaperStructure(tex);
    expect(structure.sections.get(1)).toBe("general-aptitude");
    expect(structure.sections.get(10)).toBe("general-aptitude");
    expect(structure.sections.get(11)).toBe("artificial-intelligence");
    expect(structure.sections.get(65)).toBe("artificial-intelligence");
    expect(structure.marks.get(1)).toBe(1);
    expect(structure.marks.get(35)).toBe(1);
    expect(structure.marks.get(36)).toBe(2);
    expect(structure.marks.get(65)).toBe(2);
  });

  test("keeps four option boundaries and Unicode mathematical notation", () => {
    const block = blocks.find((entry) => entry.number === 21);
    const options = parseOptions(block.body);
    const question = buildQuestion(
      block,
      { type: "MCQ", answer: "D", marks: 1, section: "CS" },
      new Map(),
      { sections: new Map([[21, "artificial-intelligence"]]), marks: new Map([[21, 1]]) }
    );

    expect(options.map((option) => option.label)).toEqual(["A", "B", "C", "D"]);
    expect(question.question).toContain("θ");
    expect(question.question).toContain("π");
    expect(question.question).toContain('<ol class="da-question-options"');
    expect([...question.question.matchAll(/data-option-label="([A-D])"/g)].map((match) => match[1]))
      .toEqual(["A", "B", "C", "D"]);
  });

  test("keeps source image/table structure in the question HTML", () => {
    const block = blocks.find((entry) => entry.number === 3);
    const question = buildQuestion(
      block,
      { type: "MCQ", answer: "A", marks: 1, section: "GA" },
      new Map([
        ["assets/puzzle-1.png", "/question-images/da/puzzle-1.webp"],
        ["assets/puzzle-2.png", "/question-images/da/puzzle-2.webp"],
        ["assets/puzzle-3.png", "/question-images/da/puzzle-3.webp"],
        ["assets/puzzle-4.png", "/question-images/da/puzzle-4.webp"],
        ["assets/puzzle-5.png", "/question-images/da/puzzle-5.webp"],
        ["assets/puzzle-6.png", "/question-images/da/puzzle-6.webp"],
        ["assets/puzzle-7.png", "/question-images/da/puzzle-7.webp"],
        ["assets/puzzle-8.png", "/question-images/da/puzzle-8.webp"],
      ]),
      { sections: new Map([[3, "general-aptitude"]]), marks: new Map([[3, 1]]) }
    );

    expect(question.question).toContain('<table class="da-latex-table">');
    expect(question.question).not.toContain('<p><table');
    expect(question.question).toContain('/question-images/da/puzzle-1.webp');
  });

  test("uses the updated structured JSON for question metadata and option boundaries", () => {
    const structured = readStructuredQuestions();
    expect(structured.get(55)).toBeTruthy();
    expect(["numerical_answer", "nat"]).toContain(structured.get(55).type);
    expect(structured.get(59).options).toHaveLength(0);

    const q55 = buildQuestion(
      blocks.find((entry) => entry.number === 55),
      { type: "NAT", answer: 1.2, marks: 2, section: "CS" },
      new Map(),
      { sections: new Map([[55, "artificial-intelligence"]]), marks: new Map([[55, 2]]) },
      structured.get(55)
    );
    const q59 = buildQuestion(
      blocks.find((entry) => entry.number === 59),
      { type: "NAT", answer: 3, marks: 2, section: "CS" },
      new Map(),
      { sections: new Map([[59, "artificial-intelligence"]]), marks: new Map([[59, 2]]) },
      structured.get(59)
    );

    expect(q55.question).toContain("$y_{\\mathrm{pred}} = w^T x$");
    expect(q55.question).toContain("$w = [-3.00, 4.00]^T$");
    expect(q59.question).toContain("$$\\begin{array}");
    expect(q59.question).toContain("\\textbf{X}");
    expect(q59.question).toContain("$\\{");
  });

  test("renders the Q9 digit expression as structured math with separate options", () => {
    const structured = readStructuredQuestions();
    const question = buildQuestion(
      blocks.find((entry) => entry.number === 9),
      { type: "MCQ", answer: "A", marks: 1, section: "GA" },
      new Map(),
      { sections: new Map([[9, "general-aptitude"]]), marks: new Map([[9, 1]]) },
      structured.get(9)
    );
    expect(question.question).toContain("$(PQ)^2 + (RS)^2 = XYP$");
    expect([...question.question.matchAll(/data-option-label="([A-D])"/g)].map((match) => match[1]))
      .toEqual(["A", "B", "C", "D"]);
  });
});
