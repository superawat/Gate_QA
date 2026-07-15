import { describe, it, expect } from "vitest";
import { cleanLatexHtml } from "./latexClean";

describe("latexClean utility", () => {
  it("should decode Cloudflare email obfuscation", () => {
    const raw = 'Given email <a class="__cf_email__" data-cfemail="ec9f848d82878d9eac818d9884" href="/cdn-cgi/l/email-protection">[email&#160;protected]</a> in text';
    const expected = "Given email shankar@math in text";
    expect(cleanLatexHtml(raw)).toBe(expected);
  });

  it("should clean HTML tags inside display math $$...$$", () => {
    const raw = "$$\\begin{array}{|c|c|} \\hline \\text{A} & <span class=\"highlight\">B</span> \\\\\\hline \\end{array}$$";
    const expected = "$$\\begin{array}{|c|c|} \\hline \\text{A} & B \\\\\\hline \\end{array}$$";
    expect(cleanLatexHtml(raw)).toBe(expected);
  });

  it("should replace br tags with newlines inside display math $$...$$", () => {
    const raw = "$$\\begin{aligned} x &= y \\\\<br/> z &= w \\end{aligned}$$";
    const expected = "$$\\begin{aligned} x &= y \\\\\n z &= w \\end{aligned}$$";
    expect(cleanLatexHtml(raw)).toBe(expected);
  });

  it("should clean HTML tags inside display math \\[...\\]", () => {
    const raw = "\\[\\begin{array}{|c|} \\hline <span class=\"bold\">Header</span> \\\\\\hline \\end{array}\\]";
    const expected = "\\[\\begin{array}{|c|} \\hline Header \\\\\\hline \\end{array}\\]";
    expect(cleanLatexHtml(raw)).toBe(expected);
  });

  it("should clean HTML tags inside inline math \\(...\\)", () => {
    const raw = "\\(x <br/> < 5\\)";
    const expected = "\\(x \n < 5\\)";
    expect(cleanLatexHtml(raw)).toBe(expected);
  });

  it("should clean HTML tags inside inline math $...$", () => {
    const raw = "Solve for $x <br/> < 10$";
    const expected = "Solve for $x   < 10$";
    expect(cleanLatexHtml(raw)).toBe(expected);
  });

  it("should decode emails inside math blocks", () => {
    const raw = '$$\\text{<a class="__cf_email__" data-cfemail="ec9f848d82878d9eac818d9884" href="/cdn-cgi/l/email-protection">[email&#160;protected]</a>}$$';
    const expected = "$$\\text{shankar@math}$$";
    expect(cleanLatexHtml(raw)).toBe(expected);
  });
});
