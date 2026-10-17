import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { cleanSolutionMarkdown, sanitizeLatex } from "./parse-practicepaper-solutions.mjs";

describe("parse-practicepaper-solutions", () => {
  it("cleans answer key statements from the end of solution", () => {
    const raw = `Applying KCL:
$$\\frac{V-10}{2} + \\frac{V}{2} = 0$$
$$\\Rightarrow V = 5\\text{ V}$$<br><br>
<b>Answer: 5</b><br><br><a href="https://gateoverflow.in/12345/test#a_list" target="_blank">Click here for detail solution by gateoverflow</a>`;

    const { text, images } = cleanSolutionMarkdown(raw);
    expect(text).toContain("Applying KCL:");
    expect(text).toContain("V = 5\\text{ V}");
    expect(text).not.toContain("<b>Answer: 5</b>");
    expect(text).not.toContain("Click here for detail solution");
    expect(text).not.toContain("gateoverflow.in");
    expect(images).toEqual([]);
  });

  it("extracts and preserves solution diagrams/images while removing answer statements", () => {
    const raw = `Circuit diagram is shown below:<br><img src="/question-images/ec/2001/ec-2001-78ed39c93f.webp" /><br>
Applying voltage divider rule:
$V_{out} = V_{in} \\times \\frac{R_2}{R_1 + R_2}$
<br>Therefore, the correct answer is **Option B**.`;

    const { text, images } = cleanSolutionMarkdown(raw);
    expect(text).toContain("Circuit diagram is shown below:");
    expect(text).toContain('<img src="/question-images/ec/2001/ec-2001-78ed39c93f.webp" />');
    expect(text).toContain("Applying voltage divider rule:");
    expect(text).not.toContain("Therefore, the correct answer is **Option B**.");
    expect(images).toEqual(["/question-images/ec/2001/ec-2001-78ed39c93f.webp"]);
  });

  it("returns null text for questions that only have redirect link without authentic derivation", () => {
    const raw = `<a href="https://gateoverflow.in/1147/gate2010-1#a_list" target="_blank">Click here for detail solution by gateoverflow</a> `;
    const { text, images } = cleanSolutionMarkdown(raw);
    expect(text).toBeNull();
    expect(images).toEqual([]);
  });

  it("returns null text for empty solutions", () => {
    const { text, images } = cleanSolutionMarkdown("");
    expect(text).toBeNull();
    expect(images).toEqual([]);
  });

  it("does not parse images present in question stem, only solution-specific diagrams", () => {
    const question = {
      stem: `The circuit is shown below:<br><img src="/question-images/ec/2023/ec-2023-4142977ad7.webp" /><br>Find the input impedance.`,
      options: ["A", "B", "C", "D"],
    };
    const rawSol = `<br><img src="/question-images/ec/2023/ec-2023-4142977ad7.webp" /><br>
Small signal model is drawn as:<br><img src="/question-images/ec/2023/ec-2023-derivation-model.webp" /><br>
Input impedance $R_{in} = 1 / g_m$.
<br><b>Answer: Option A</b>`;

    const { text, images } = cleanSolutionMarkdown(rawSol, question);
    expect(images).toEqual(["/question-images/ec/2023/ec-2023-derivation-model.webp"]);
    expect(images).not.toContain("/question-images/ec/2023/ec-2023-4142977ad7.webp");
    expect(text).not.toContain("/question-images/ec/2023/ec-2023-4142977ad7.webp");
    expect(text).toContain('<img src="/question-images/ec/2023/ec-2023-derivation-model.webp" />');
    expect(text).toContain("Small signal model is drawn as:");
    expect(text).toContain("Input impedance $R_{in} = 1 / g_m$.");
  });

  it("returns null text if rawSolution only duplicated question stem image without derivation", () => {
    const question = {
      stem: `Circuit diagram:<br><img src="/question-images/ee/2003/ee-2003-a346da585e.webp" />`,
      options: ["10", "20"],
    };
    const rawSol = `<br><img src="/question-images/ee/2003/ee-2003-a346da585e.webp" /><br>`;

    const { text, images } = cleanSolutionMarkdown(rawSol, question);
    expect(text).toBeNull();
    expect(images).toEqual([]);
  });

  it("converts [latex] tags to standard math delimiters", () => {
    const raw = `[latex]y(t)=(At+B)e^{-2t}[/latex]<br>[latex]\\begin{aligned} m^2+4m+4=0 \\end{aligned}[/latex]`;
    const cleaned = sanitizeLatex(raw);
    expect(cleaned).toContain("$y(t)=(At+B)e^{-2t}$");
    expect(cleaned).toContain("$$\\begin{aligned} m^2+4m+4=0 \\end{aligned}$$");
  });

  it("verifies parsed branch output files exist and strictly omit question text and answer keys", () => {
    const branches = ["cse", "da", "ec", "ee", "me", "ce"];
    const outDir = path.resolve(__dirname, "../../data/solutions/practicepaper");

    for (const b of branches) {
      const file = path.join(outDir, `${b}-solutions.json`);
      expect(fs.existsSync(file)).toBe(true);

      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      const keys = Object.keys(data);
      expect(keys.length).toBeGreaterThan(0);

      // Verify sample entries
      const sample = data[keys[0]];
      expect(sample).toHaveProperty("question_uid");
      expect(sample).toHaveProperty("exam_uid");
      expect(sample).toHaveProperty("branch", b);
      expect(sample).toHaveProperty("year");
      expect(sample).toHaveProperty("set");
      expect(sample).toHaveProperty("qNum");
      expect(sample).toHaveProperty("has_detailed_solution");
      expect(sample).toHaveProperty("images");

      // STRICT NEGATIVE ASSERTIONS: Must NOT contain question stem, options, or answer key
      expect(sample).not.toHaveProperty("stem");
      expect(sample).not.toHaveProperty("question");
      expect(sample).not.toHaveProperty("text");
      expect(sample).not.toHaveProperty("options");
      expect(sample).not.toHaveProperty("answer");
      expect(sample).not.toHaveProperty("verified_answer");
      expect(sample).not.toHaveProperty("tolerance");
      expect(sample).not.toHaveProperty("marks");
      expect(sample).not.toHaveProperty("ansMin");
      expect(sample).not.toHaveProperty("ansMax");
    }
  });

  it("verifies master all-solutions.json and summary.json exist with valid aggregate metrics", () => {
    const outDir = path.resolve(__dirname, "../../data/solutions/practicepaper");
    const summaryFile = path.join(outDir, "summary.json");
    const masterFile = path.join(outDir, "all-solutions.json");

    expect(fs.existsSync(summaryFile)).toBe(true);
    expect(fs.existsSync(masterFile)).toBe(true);

    const summary = JSON.parse(fs.readFileSync(summaryFile, "utf-8"));
    expect(summary.totals.questions).toBeGreaterThan(12000);
    expect(summary.totals.withSolution).toBeGreaterThan(8500);
    expect(summary.totals.withImages).toBeGreaterThan(2000);
    expect(summary.totals.totalImages).toBeGreaterThan(2500);
  });
});
