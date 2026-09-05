/**
 * Utility for formatting and normalizing code snippets in GATE questions.
 * Preserves authentic exam syntax (GateOverflow style) with clean code blocks,
 * correct indentation, and uniform text color matching the surrounding question text.
 */

/**
 * Normalizes defective code snippets where parentheses, braces, or operators
 * may have been stripped or malformed during scraping or extraction.
 *
 * @param {string} code
 * @returns {string}
 */
export function normalizeCodeText(code) {
  if (!code || typeof code !== "string") return "";

  let normalized = code;

  // 1. Restore function signatures missing parentheses
  normalized = normalized.replace(/\bvoid\s+fX[^\S\r\n]*;/g, "void fX();");
  normalized = normalized.replace(/\bvoid\s+fX[^\S\r\n]*\{/g, "void fX() {");
  normalized = normalized.replace(/\bvoid\s+fX(?!\s*\()/g, "void fX()");
  normalized = normalized.replace(/\b(void|int)\s+main[^\S\r\n]*\{/g, "$1 main() {");
  normalized = normalized.replace(/\b(void|int)\s+main(?!\s*\()/g, "$1 main()");

  // 2. Restore fX invocation if missing parens
  normalized = normalized.replace(/\bfX\s*;/g, "fX();");

  // 3. Restore getchar/putchar if malformed
  normalized = normalized.replace(/\bg\s*e\s*t\s*c\s*h\s*a\s*r\s*\(\s*\)/gi, "getchar()");
  normalized = normalized.replace(/\bp\s*u\s*t\s*c\s*h\s*a\s*r\s*\(/gi, "putchar(");
  normalized = normalized.replace(/\bgetchar\b(?!\s*\()/g, "getchar()");

  // 4. Restore != comparison operator if spaced
  normalized = normalized.replace(/!\s+=/g, "!=");

  return normalized;
}

/**
 * Basic HTML escaping for code text
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Decodes HTML entities commonly found in scraped code
 * @param {string} text
 * @returns {string}
 */
function decodeHtmlEntities(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Transforms <pre> code blocks in question HTML into clean, GateOverflow-style
 * code blocks that preserve lines, brackets, and indentation, keeping the
 * text color identical to the surrounding question text.
 *
 * It safely preserves intentional inline formatting markup like <strong>, <b>, <em>,
 * and <span ...> (used in GateOverflow for corrections and fill-in-the-blank blanks)
 * so that they render cleanly without displaying raw HTML tags in the code block.
 *
 * @param {string} html
 * @returns {string}
 */
export function formatCodeSnippets(html) {
  if (!html || typeof html !== "string") return "";

  // Pattern matches <pre ...>...</pre>
  const preRegex = /<pre\b([^>]*)>([\s\S]*?)<\/pre>/gi;

  return html.replace(preRegex, (match, attrs, content) => {
    // Extract language if present (e.g. lang-c_cpp or data-pbcklang="c_cpp")
    let lang = "c";
    const langMatch = attrs.match(/lang(?:uage)?-([a-zA-Z0-9_-]+)/i) || attrs.match(/data-pbcklang=["']([^"']+)["']/i);
    if (langMatch && langMatch[1]) {
      lang = langMatch[1].replace(/^lang-/, "");
    }

    // Convert <br> tags to newlines
    let text = content.replace(/<br\s*\/?>/gi, "\n");

    // Temporarily protect allowed inline formatting tags so they are not escaped into literal text
    const preservedTags = [];
    text = text.replace(/<\/?(strong|b|em|i|u|mark|span\b[^>]*)>/gi, (tag) => {
      const token = `__GATEQA_PRESERVED_TAG_${preservedTags.length}__`;
      preservedTags.push(tag);
      return token;
    });

    // Strip internal code wrapper tags
    text = text.replace(/<\/?code\b[^>]*>/gi, "");

    // Decode HTML entities before normalization so code has real characters
    text = decodeHtmlEntities(text);

    // Trim leading/trailing blank lines but preserve indentation
    text = text.replace(/^\r?\n+|\r?\n+$/g, "");

    // Normalize code text (restore parentheses for main, fX, getchar, etc.)
    text = normalizeCodeText(text);

    // Escape HTML to prevent injection and guarantee valid code symbols (like <stdio.h>, if (x < y))
    let escapedCode = escapeHtml(text);

    // Restore protected inline tags (now safe and valid HTML)
    escapedCode = escapedCode.replace(/__GATEQA_PRESERVED_TAG_(\d+)__/g, (token, idx) => {
      return preservedTags[Number(idx)] || "";
    });

    // Wrap in GateOverflow-style code block.
    // Text color strictly inherits from question text - no color changing syntax spans.
    return `<pre class="gateqa-code-block prettyprint" data-lang="${lang}"><code class="gateqa-code-content">${escapedCode}</code></pre>`;
  });
}

/**
 * Safe handler for backward compatibility
 */
export function handleCodeBlockCopy() {
  // no-op
}
