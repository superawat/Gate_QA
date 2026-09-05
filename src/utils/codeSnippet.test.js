import { describe, it, expect } from "vitest";
import { normalizeCodeText, formatCodeSnippets } from "./codeSnippet";

describe("codeSnippet utility", () => {
  describe("normalizeCodeText", () => {
    it("should restore missing parentheses in void fX ;", () => {
      const input = "void fX ;";
      expect(normalizeCodeText(input)).toBe("void fX();");
    });

    it("should restore missing parentheses in void fX {", () => {
      const input = "void fX {";
      expect(normalizeCodeText(input)).toBe("void fX() {");
    });

    it("should restore missing parentheses in int main{", () => {
      const input = "int main{";
      expect(normalizeCodeText(input)).toBe("int main() {");
    });

    it("should restore missing parentheses in void main before { on next line", () => {
      const input = "void main\n{\n    int c;\n}";
      expect(normalizeCodeText(input)).toBe("void main()\n{\n    int c;\n}");
    });

    it("should restore missing parentheses in int main before { on next line", () => {
      const input = "int main\n{\n    return 0;\n}";
      expect(normalizeCodeText(input)).toBe("int main()\n{\n    return 0;\n}");
    });

    it("should normalize function invocation fX; to fX();", () => {
      const input = "    fX;\n";
      expect(normalizeCodeText(input)).toBe("    fX();\n");
    });

    it("should normalize getchar without parentheses", () => {
      const input = "if ((a = getchar) != '\\n')";
      expect(normalizeCodeText(input)).toBe("if ((a = getchar()) != '\\n')");
    });

    it("should normalize spaced != operator", () => {
      const input = "if (a ! = '\\n')";
      expect(normalizeCodeText(input)).toBe("if (a != '\\n')");
    });
  });

  describe("formatCodeSnippets", () => {
    it("should format <pre> into GateOverflow-style code block without colored token spans", () => {
      const rawHtml = `<p>Consider the code:</p><pre class="prettyprint linenums lang-c_cpp">#include &lt;stdio.h&gt;\nvoid fX();\nint main() {\n    fX();\n    return 0;\n}</pre><p>What is output?</p>`;
      const formatted = formatCodeSnippets(rawHtml);

      expect(formatted).toContain('<pre class="gateqa-code-block prettyprint" data-lang="c_cpp">');
      expect(formatted).toContain('<code class="gateqa-code-content">');
      expect(formatted).toContain("#include &lt;stdio.h&gt;");
      expect(formatted).toContain("void fX();");
      expect(formatted).toContain("int main() {");
      // Must NOT contain token color spans (keeping text color same as text)
      expect(formatted).not.toContain('<span class="tok-');
    });

    it("should preserve <strong> and <b> tags without escaping them to literal text strings", () => {
      const rawHtml = `<pre class="prettyprint lang-c_cpp">**ppz += 1; <strong>z = **ppz</strong>;\t\t // corrected <strong>z = *ppz</strong>; to <strong>z = **ppz</strong>;\nvoid main\n{\n    printf("%d", f(c, b, a));\n}</pre>`;
      const formatted = formatCodeSnippets(rawHtml);

      // Must contain real <strong> tags so the browser bolds the correction, like GateOverflow
      expect(formatted).toContain("<strong>z = **ppz</strong>");
      expect(formatted).toContain("<strong>z = *ppz</strong>");
      // Must NOT contain escaped &lt;strong&gt; which would display literal <strong> text on screen
      expect(formatted).not.toContain("&lt;strong&gt;");
      expect(formatted).not.toContain("&lt;/strong&gt;");
      // Must normalize void main
      expect(formatted).toContain("void main()");
    });

    it("should escape C headers and operators while preserving intentional markup", () => {
      const rawHtml = `<pre class="prettyprint lang-c_cpp">#include <stdio.h>\nif (x < y) return <strong>E1</strong>;</pre>`;
      const formatted = formatCodeSnippets(rawHtml);

      expect(formatted).toContain("#include &lt;stdio.h&gt;");
      expect(formatted).toContain("if (x &lt; y)");
      expect(formatted).toContain("<strong>E1</strong>");
    });

    it("should handle empty or non-string inputs safely", () => {
      expect(formatCodeSnippets("")).toBe("");
      expect(formatCodeSnippets(null)).toBe("");
      expect(formatCodeSnippets(undefined)).toBe("");
    });
  });
});
