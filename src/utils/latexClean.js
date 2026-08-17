const decodeCloudflareEmail = (hex) => {
  if (!hex) return "";
  let email = "";
  try {
    const r = parseInt(hex.substring(0, 2), 16);
    for (let n = 2; n < hex.length; n += 2) {
      const i = parseInt(hex.substring(n, n + 2), 16) ^ r;
      email += String.fromCharCode(i);
    }
  } catch (e) {
    return "";
  }
  return email;
};

export const decodeAllEmails = (text) => {
  if (typeof text !== "string") return text;
  return text.replace(/<a\s+[^>]*class=["']__cf_email__["'][^>]*data-cfemail=["']([0-9a-fA-F]+)["'][^>]*>[\s\S]*?<\/a>/gi, (match, hex) => {
    return decodeCloudflareEmail(hex);
  });
};

export const cleanHtmlTagsInMath = (text) => {
  if (typeof text !== "string") return text;

  // Protect <pre> and <code> blocks so code and pseudocode containing $, \, etc. are never corrupted
  const codeBlocks = [];
  let tokenized = text.replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
    codeBlocks.push(match);
    return `<!--__CODE_BLOCK_${codeBlocks.length - 1}__-->`;
  });

  // Helper to check if a matched math snippet improperly spans across block-level HTML tags
  const hasBlockHtml = (str) =>
    /<\/?(?:p|div|li|ol|ul|table|thead|tbody|tfoot|tr|td|th|pre|code|h[1-6]|blockquote|section|article|header|footer|nav|aside)\b[^>]*>/i.test(
      str
    );

  // Clean display math: $$ ... $$
  tokenized = tokenized.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    if (hasBlockHtml(math)) return match;
    const stripped = math.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+>/g, "");
    return `$$${stripped}$$`;
  });

  // Clean display math: \[ ... \]
  tokenized = tokenized.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
    if (hasBlockHtml(math)) return match;
    const stripped = math.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+>/g, "");
    return `\\[${stripped}\\]`;
  });

  // Clean inline math: \( ... \)
  tokenized = tokenized.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
    if (hasBlockHtml(math)) return match;
    const stripped = math.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+>/g, "");
    return `\\(${stripped}\\)`;
  });

  // Clean inline math: $ ... $ (non-greedy, single line for $)
  tokenized = tokenized.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
    if (hasBlockHtml(math)) return match;
    const stripped = math.replace(/<br\s*\/?>/gi, " ").replace(/<\/?[^>]+>/g, "");
    return `$${stripped}$`;
  });

  // Restore protected <pre> and <code> blocks
  if (codeBlocks.length > 0) {
    tokenized = tokenized.replace(/<!--__CODE_BLOCK_(\d+)__-->/g, (match, index) => {
      const idx = Number(index);
      return idx >= 0 && idx < codeBlocks.length ? codeBlocks[idx] : match;
    });
  }

  return tokenized;
};

export const cleanLatexHtml = (text) => {
  if (typeof text !== "string") return text;
  return cleanHtmlTagsInMath(decodeAllEmails(text));
};
