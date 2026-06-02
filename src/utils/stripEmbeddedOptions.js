const OPTION_LABELS = ["A", "B", "C", "D", "E"];

const stripHtmlToText = (html = "") => (
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
);

const OPTION_BLOCK_RE =
  /<(p|div|li)\b[^>]*>\s*(?:<(?:strong|b|em|span)\b[^>]*>\s*)?(?:\(?[A-E]\)?[\.\):])\s*[\s\S]*?<\/\1>/gi;
const OPTION_BLOCK_CAPTURE_RE =
  /<(p|div|li)\b[^>]*>\s*(?:<(?:strong|b|em|span)\b[^>]*>\s*)?\(?([A-E])\)?[\.\):]\s*([\s\S]*?)<\/\1>/gi;
const OPTION_LINE_RE =
  /(?:^|\n|<br\s*\/?>)\s*(?:\(?[A-E]\)?[\.\):])\s+[^\n<]+(?=\s*(?:<br\s*\/?>|\n|$))/gi;
const OPTION_LINE_CAPTURE_RE =
  /(?:^|\n|<br\s*\/?>)\s*\(?([A-E])\)?[\.\):]\s+([^\n<]+)(?=\s*(?:<br\s*\/?>|\n|$))/gi;
const OPTION_LIST_RE =
  /<(ol|ul)\b[^>]*>\s*(?:<li\b[^>]*>\s*(?:<(?:strong|b|em|span)\b[^>]*>\s*)?(?:\(?[A-E]\)?[\.\):])\s*[\s\S]*?<\/li>\s*){2,5}<\/\1>/gi;
const ALPHA_OPTION_LIST_RE =
  /<(ol|ul)\b[^>]*(?:list-style-type\s*:\s*(?:upper-alpha|lower-alpha)|\btype\s*=\s*["']?[Aa]["']?)[^>]*>[\s\S]*?<\/\1>/gi;
const ALPHA_OPTION_LIST_CAPTURE_RE =
  /<(ol|ul)\b([^>]*(?:list-style-type\s*:\s*(?:upper-alpha|lower-alpha)|\btype\s*=\s*["']?[Aa]["']?)[^>]*)>([\s\S]*?)<\/\1>/gi;
const TRAILING_OPTION_LIST_RE =
  /<(ol|ul)\b[^>]*>\s*(?:<li\b[^>]*>[\s\S]*?<\/li>\s*){2,5}<\/\1>\s*(?:<br\s*\/?>|\s)*$/gi;
const TRAILING_OPTION_LIST_CAPTURE_RE =
  /<(ol|ul)\b[^>]*>\s*((?:<li\b[^>]*>[\s\S]*?<\/li>\s*){2,5})<\/\1>\s*(?:<br\s*\/?>|\s)*$/i;
const LI_CAPTURE_RE = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;

const normalizeOptionLabel = (value = "") => String(value || "").trim().toUpperCase();

const parseStartIndex = (attrs = "", fallbackIndex = 0) => {
  const match = String(attrs || "").match(/\bstart\s*=\s*["']?(\d+)/i);
  const parsed = match ? Number.parseInt(match[1], 10) : NaN;
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= OPTION_LABELS.length) {
    return parsed - 1;
  }
  return fallbackIndex;
};

const isOnlyMediaHtml = (fragment = "") => {
  const raw = String(fragment || "").trim();
  if (!raw) {
    return false;
  }

  const withoutMedia = raw
    .replace(/<p\b[^>]*>\s*(?:<img\b[^>]*>\s*)+<\/p>/gi, "")
    .replace(/<div\b[^>]*>\s*(?:<img\b[^>]*>\s*)+<\/div>/gi, "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;|&#160;/gi, "")
    .trim();

  return withoutMedia === "";
};

const getAlphaOptionListMatches = (html = "") => {
  const matches = [];
  for (const match of String(html || "").matchAll(ALPHA_OPTION_LIST_CAPTURE_RE)) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      html: match[0],
      attrs: match[2] || "",
      body: match[3] || "",
    });
  }
  return matches;
};

const mergeRanges = (ranges = []) => {
  const sorted = ranges
    .filter((range) => Number.isFinite(range.start) && Number.isFinite(range.end) && range.end > range.start)
    .sort((left, right) => left.start - right.start);
  const merged = [];

  sorted.forEach((range) => {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end);
      return;
    }
    merged.push({ ...range });
  });

  return merged;
};

const removeRanges = (html = "", ranges = []) => {
  let cleaned = String(html || "");
  mergeRanges(ranges)
    .sort((left, right) => right.start - left.start)
    .forEach((range) => {
      cleaned = `${cleaned.slice(0, range.start)}${cleaned.slice(range.end)}`;
    });
  return cleaned;
};

const buildOption = (label, html = "") => {
  const normalizedLabel = normalizeOptionLabel(label);
  const optionHtml = String(html || "").trim();
  const text = stripHtmlToText(optionHtml);

  if (!normalizedLabel || (!optionHtml && !text)) {
    return null;
  }

  return {
    label: normalizedLabel,
    text: text || optionHtml,
    html: optionHtml || text,
  };
};

const pushOption = (options, seen, label, html = "") => {
  const option = buildOption(label, html);
  if (!option || seen.has(option.label)) {
    return;
  }
  seen.add(option.label);
  options.push(option);
};

export function hasEmbeddedOptions(html = "") {
  const raw = String(html || "");
  return Boolean(
    raw.match(ALPHA_OPTION_LIST_RE)
    || raw.match(OPTION_LIST_RE)
    || raw.match(OPTION_BLOCK_RE)
    || raw.match(OPTION_LINE_RE)
    || raw.match(TRAILING_OPTION_LIST_RE)
  );
}

export function extractEmbeddedOptions(html = "") {
  const raw = String(html || "");
  if (!raw.trim()) {
    return [];
  }

  const options = [];
  const seen = new Set();
  let fallbackIndex = 0;
  const alphaListMatches = getAlphaOptionListMatches(raw);

  alphaListMatches.forEach((listMatch, listIndex) => {
    const listItems = Array.from(listMatch.body.matchAll(LI_CAPTURE_RE));
    if (listItems.length === 0) {
      return;
    }

    const startIndex = parseStartIndex(listMatch.attrs, fallbackIndex);
    const isImageOnlyOverflowList = listItems.length > OPTION_LABELS.length
      && listItems.every((itemMatch) => /<img\b/i.test(itemMatch[1] || "") && !stripHtmlToText(itemMatch[1]));
    const groupedOptionCount = isImageOnlyOverflowList && listItems.length % 4 === 0
      ? 4
      : isImageOnlyOverflowList && listItems.length % 5 === 0
        ? 5
        : 0;

    if (groupedOptionCount > 0) {
      const groupSize = listItems.length / groupedOptionCount;
      for (let groupIndex = 0; groupIndex < groupedOptionCount; groupIndex += 1) {
        const groupItems = listItems
          .slice(groupIndex * groupSize, (groupIndex + 1) * groupSize)
          .map((itemMatch) => itemMatch[1] || "")
          .join("");
        const optionIndex = startIndex + groupIndex;
        const label = OPTION_LABELS[optionIndex] || OPTION_LABELS[groupIndex];
        pushOption(options, seen, label, groupItems);
        fallbackIndex = Math.max(fallbackIndex, groupIndex + 1);
      }
      return;
    }

    listItems.forEach((itemMatch, itemIndex) => {
      let optionIndex = startIndex + itemIndex;
      if (!OPTION_LABELS[optionIndex] || seen.has(OPTION_LABELS[optionIndex])) {
        optionIndex = fallbackIndex;
      }

      const label = OPTION_LABELS[optionIndex];
      const nextList = alphaListMatches[listIndex + 1];
      const betweenLists = nextList ? raw.slice(listMatch.end, nextList.start) : "";
      const adjacentMedia = itemIndex === listItems.length - 1 && isOnlyMediaHtml(betweenLists)
        ? betweenLists
        : "";

      pushOption(options, seen, label, `${itemMatch[1] || ""}${adjacentMedia}`);
      fallbackIndex = Math.max(fallbackIndex, optionIndex + 1);
    });
  });

  if (options.length > 0) {
    return options;
  }

  for (const match of raw.matchAll(OPTION_BLOCK_CAPTURE_RE)) {
    pushOption(options, seen, match[2], match[3]);
  }
  if (options.length > 0) {
    return options;
  }

  for (const match of raw.matchAll(OPTION_LINE_CAPTURE_RE)) {
    pushOption(options, seen, match[1], match[2]);
  }
  if (options.length > 0) {
    return options;
  }

  const trailingListMatch = raw.match(TRAILING_OPTION_LIST_CAPTURE_RE);
  if (trailingListMatch) {
    Array.from(String(trailingListMatch[2] || "").matchAll(LI_CAPTURE_RE))
      .slice(0, OPTION_LABELS.length)
      .forEach((match, index) => {
        pushOption(options, seen, OPTION_LABELS[index], match[1]);
      });
  }

  return options;
}

export function stripEmbeddedOptions(html = "") {
  if (!html || typeof html !== "string") {
    return "";
  }

  let cleaned = html;
  const ranges = [];
  const alphaListMatches = getAlphaOptionListMatches(cleaned);

  alphaListMatches.forEach((listMatch, index) => {
    ranges.push({ start: listMatch.start, end: listMatch.end });
    const nextList = alphaListMatches[index + 1];
    if (!nextList) {
      return;
    }
    const betweenLists = cleaned.slice(listMatch.end, nextList.start);
    if (isOnlyMediaHtml(betweenLists)) {
      ranges.push({ start: listMatch.end, end: nextList.start });
    }
  });

  cleaned = removeRanges(cleaned, ranges);
  cleaned = cleaned.replace(OPTION_LIST_RE, "");
  cleaned = cleaned.replace(ALPHA_OPTION_LIST_RE, "");
  cleaned = cleaned.replace(TRAILING_OPTION_LIST_RE, "");
  cleaned = cleaned.replace(OPTION_BLOCK_RE, "");
  cleaned = cleaned.replace(OPTION_LINE_RE, "");
  cleaned = cleaned.replace(/(<br\s*\/?>|\s)+$/i, "");

  return cleaned.trim();
}
