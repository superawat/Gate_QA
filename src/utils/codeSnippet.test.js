import { describe, it, expect } from "vitest";
import { normalizeCodeText, formatCodeSnippets, formatInlineCode, createGateQaCodeBlock } from "./codeSnippet";

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

    it("should restore missing parentheses in bare main before { on next line", () => {
      const input = "main\n{\n    print(x);\n}";
      expect(normalizeCodeText(input)).toBe("int main()\n{\n    print(x);\n}");
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

    it("should format markdown fenced code blocks into GateOverflow-style code block", () => {
      const raw = "Analyzing the program:\n```pascal\nVar x, y: integer;\nprocedure P(n: integer);\nbegin\n    x := (n + 2) / (n - 3);\nend;\n```\nTherefore C.";
      const formatted = formatCodeSnippets(raw);

      expect(formatted).toContain('<pre class="gateqa-code-block prettyprint" data-lang="pascal">');
      expect(formatted).toContain('<code class="gateqa-code-content">');
      expect(formatted).toContain("Var x, y: integer;");
      expect(formatted).toContain("procedure P(n: integer);");
      expect(formatted).toContain("Therefore C.");
    });

    it("should strip common leading indentation when code fence is indented inside list items", () => {
      const raw = "- **SQL Query:**\n  ```sql\n  SELECT *\n  FROM Raider\n  WHERE RaidPoints > 200;\n  ```\n- Next step";
      const formatted = formatCodeSnippets(raw);

      expect(formatted).toContain('<pre class="gateqa-code-block prettyprint" data-lang="sql">');
      expect(formatted).toContain("SELECT *\nFROM Raider\nWHERE RaidPoints &gt; 200;");
      expect(formatted).toContain("- Next step");
    });

    it("should default to language 'c' when markdown fence has no language tag", () => {
      const raw = "```\ncomputeS(X)\nS[1] <- 1\n```";
      const formatted = formatCodeSnippets(raw);

      expect(formatted).toContain('<pre class="gateqa-code-block prettyprint" data-lang="c">');
      expect(formatted).toContain("computeS(X)");
    });

    it("should not double-process existing gateqa-code-block elements", () => {
      const raw = '<pre class="gateqa-code-block prettyprint" data-lang="python"><code class="gateqa-code-content">def f(): pass</code></pre>';
      const formatted = formatCodeSnippets(raw);

      expect(formatted).toBe(raw);
    });

    it("should handle empty or non-string inputs safely", () => {
      expect(formatCodeSnippets("")).toBe("");
      expect(formatCodeSnippets(null)).toBe("");
      expect(formatCodeSnippets(undefined)).toBe("");
    });
  });

  describe("formatInlineCode", () => {
    it("should format inline backticks into gateqa-inline-code", () => {
      const text = "The variable `child_dict` stores the tree and `printf` prints output.";
      const formatted = formatInlineCode(text);

      expect(formatted).toContain('<code class="gateqa-inline-code">child_dict</code>');
      expect(formatted).toContain('<code class="gateqa-inline-code">printf</code>');
    });

    it("should escape special characters inside inline code", () => {
      const text = "Check condition `x < y && y > 0`.";
      const formatted = formatInlineCode(text);

      expect(formatted).toContain('<code class="gateqa-inline-code">x &lt; y &amp;&amp; y &gt; 0</code>');
    });

    it("should not modify backticks inside existing <pre> code blocks", () => {
      const text = '<pre class="gateqa-code-block prettyprint" data-lang="bash"><code class="gateqa-code-content">echo `date`</code></pre>\nAnd run `date` in terminal.';
      const formatted = formatInlineCode(text);

      // The pre block must retain echo `date` untouched
      expect(formatted).toContain("echo `date`");
      // The prose inline code must be converted
      expect(formatted).toContain('<code class="gateqa-inline-code">date</code>');
    });

    it("should handle empty or non-string inputs safely", () => {
      expect(formatInlineCode("")).toBe("");
      expect(formatInlineCode(null)).toBe("");
      expect(formatInlineCode(undefined)).toBe("");
    });
  });
});
