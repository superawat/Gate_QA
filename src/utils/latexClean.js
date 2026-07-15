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
  
  // Clean display math: $$ ... $$
  let cleaned = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    const stripped = math.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+>/g, '');
    return `$$${stripped}$$`;
  });
  
  // Clean display math: \[ ... \]
  cleaned = cleaned.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
    const stripped = math.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+>/g, '');
    return `\\[${stripped}\\]`;
  });
  
  // Clean inline math: \( ... \)
  cleaned = cleaned.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
    const stripped = math.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+>/g, '');
    return `\\(${stripped}\\)`;
  });
  
  // Clean inline math: $ ... $ (non-greedy, single line for $)
  cleaned = cleaned.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
    const stripped = math.replace(/<br\s*\/?>/gi, ' ').replace(/<\/?[^>]+>/g, '');
    return `$${stripped}$`;
  });
  
  return cleaned;
};

export const cleanLatexHtml = (text) => {
  if (typeof text !== "string") return text;
  return cleanHtmlTagsInMath(decodeAllEmails(text));
};
