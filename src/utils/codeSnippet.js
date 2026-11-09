/**
 * Utility for formatting and normalizing code snippets in GATE questions and answers.
 * Preserves authentic exam syntax (GateOverflow style) with clean code blocks,
 * correct indentation, and uniform text color matching the surrounding text.
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
  normalized = normalized.replace(/(^|\n)\s*main[^\S\r\n]*\{/g, "$1int main() {");
  normalized = normalized.replace(/(^|\n)\s*main[^\S\r\n]*\r?\n\s*\{/g, "$1int main()\n{");

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
export function escapeHtml(text) {
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
 * Creates a normalized GateOverflow-style code block with clean indentation,
 * escaped HTML characters, and uniform text color matching surrounding text.
 *
 * @param {string} content
 * @param {string} lang
 * @param {number} indent
 * @returns {string}
 */
export function createGateQaCodeBlock(content, lang = "c", indent = 0) {
  if (!content && content !== "") return "";

  // Convert <br> tags to newlines
  let text = String(content).replace(/<br\s*\/?>/gi, "\n");

  // If fence was indented inside markdown, strip up to that many spaces from line beginnings
  if (indent > 0) {
    const stripRegex = new RegExp(`^[ \\t]{1,${indent}}`, "gm");
    text = text.replace(stripRegex, "");
  }

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

  const cleanLang = (lang || "c").replace(/^lang-/, "").trim().toLowerCase() || "c";
  return `<pre class="gateqa-code-block prettyprint" data-lang="${cleanLang}"><code class="gateqa-code-content">${escapedCode}</code></pre>`;
}

/**
 * Transforms both markdown code fences (```lang ... ```) and HTML <pre> blocks in
 * question and answer text into clean, GateOverflow-style code blocks that preserve
 * lines, brackets, and indentation, keeping the text color identical to the
 * surrounding text.
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

  let result = html;

  // 1. Process markdown code fences: ```lang\ncode\n``` or ```\ncode\n```
  // Handles:
  // - ```c ... ```
  // - ``` ... ``` (unspecified language)
  // - Indented fences (e.g. inside list items "  ```sql ...   ```")
  // - Windows (\r\n) or Unix (\n) line endings
  const fenceRegex = /(^|\n)([ \t]*)`{3,}([a-zA-Z0-9_#+-]*)[^\S\r\n]*\r?\n([\s\S]*?)(?:\r?\n)?[ \t]*`{3,}[^\S\r\n]*(?=\r?\n|$)/g;
  result = result.replace(fenceRegex, (match, leadingNewline, indent, rawLang, codeContent) => {
    const lang = rawLang || "c";
    const indentLen = indent ? indent.length : 0;
    const block = createGateQaCodeBlock(codeContent, lang, indentLen);
    return `${leadingNewline}${block}\n`;
  });

  // 2. Process HTML <pre>...</pre> blocks (e.g. from scraped HTML)
  // Skip blocks that already have the gateqa-code-block class to avoid double-processing
  const preRegex = /<pre(?!\s+class=["'][^"']*gateqa-code-block)\b([^>]*)>([\s\S]*?)<\/pre>/gi;
  result = result.replace(preRegex, (match, attrs, content) => {
    let lang = "c";
    const langMatch = attrs.match(/lang(?:uage)?-([a-zA-Z0-9_-]+)/i) || attrs.match(/data-pbcklang=["']([^"']+)["']/i);
    if (langMatch && langMatch[1]) {
      lang = langMatch[1].replace(/^lang-/, "");
    }

    return createGateQaCodeBlock(content, lang);
  });

  return result;
}

/**
 * Formats inline backtick code snippets (e.g. `variable` or `printf(...)`)
 * into <code class="gateqa-inline-code"> elements, safely protecting existing
 * <pre>...</pre> code blocks and HTML tags.
 *
 * @param {string} text
 * @returns {string}
 */
export function formatInlineCode(text) {
  if (!text || typeof text !== "string") return "";

  // 1. Temporarily protect <pre> blocks so code inside code blocks is never modified
  const preBlocks = [];
  let tokenized = text.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
    const token = `__GATEQA_PRE_BLOCK_${preBlocks.length}__`;
    preBlocks.push(match);
    return token;
  });

  // 2. Also protect existing <code>...</code> blocks if any
  const codeBlocks = [];
  tokenized = tokenized.replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, (match) => {
    const token = `__GATEQA_EXISTING_CODE_${codeBlocks.length}__`;
    codeBlocks.push(match);
    return token;
  });

  // 3. Format inline code `code` (single backtick, not multi-line)
  tokenized = tokenized.replace(/`([^`\r\n]+)`/g, (match, code) => {
    return `<code class="gateqa-inline-code">${escapeHtml(code)}</code>`;
  });

  // 4. Restore protected existing <code> blocks
  tokenized = tokenized.replace(/__GATEQA_EXISTING_CODE_(\d+)__/g, (match, idx) => {
    return codeBlocks[Number(idx)] || match;
  });

  // 5. Restore protected <pre> blocks
  tokenized = tokenized.replace(/__GATEQA_PRE_BLOCK_(\d+)__/g, (match, idx) => {
    return preBlocks[Number(idx)] || match;
  });

  return tokenized;
}

/**
 * Safe handler for backward compatibility
 */
export function handleCodeBlockCopy() {
  // no-op
}
