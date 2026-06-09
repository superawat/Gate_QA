#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { EDITORIAL_PAGES } from "../src/data/editorialPages.js";
import {
  extractEmbeddedOptions as extractSharedEmbeddedOptions,
  stripEmbeddedOptions as stripSharedEmbeddedOptions,
} from "../src/utils/stripEmbeddedOptions.js";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const DETAIL_SHARDS_DIR = path.join(PUBLIC_DIR, "question-detail-shards");
const QUESTION_IMAGE_DIR = path.join(PUBLIC_DIR, "question-images");
const DOCS_GENERATED_DIR = path.join(ROOT, "docs", "generated");
const REVIEW_DIR = path.join(ROOT, "artifacts", "review");
const SITE_ORIGIN = "https://gateqa.in";
const PRECOMPUTED_SUBTOPIC_LOOKUP_PATH = path.join(
  ROOT,
  "src",
  "generated",
  "subtopicLookup.json"
);

const QUESTION_BANK_CANDIDATES = [
  path.join(PUBLIC_DIR, "questions-with-answers.json"),
  path.join(PUBLIC_DIR, "questions-filtered-with-ids.json"),
  path.join(PUBLIC_DIR, "questions-filtered.json"),
];

const ANSWERS_BY_QUESTION_UID_PATH = path.join(
  PUBLIC_DIR,
  "data",
  "answers",
  "answers_by_question_uid_v1.json"
);
const UNSUPPORTED_QUESTION_UIDS_PATH = path.join(
  PUBLIC_DIR,
  "data",
  "answers",
  "unsupported_question_uids_v1.json"
);
const MOCK_CATALOG_PATH = path.join(PUBLIC_DIR, "mock_catalog_v1.json");
const PIPELINE_STATE_PATH = path.join(ROOT, "pipeline-state.json");
const VALIDATION_REPORT_DIR = path.join(ROOT, "audit");
const DATA_INTEGRITY_REPORT_PATH = path.join(
  ROOT,
  "artifacts",
  "review",
  "data-integrity-report.json"
);

const SUBJECTS = [
  {
    slug: "algorithms",
    label: "Algorithms",
    aliases: ["algorithms"],
  },
  {
    slug: "coa",
    label: "CO & Architecture",
    aliases: [
      "co-and-architecture",
      "computer-organization-and-architecture",
      "computer-architecture",
      "coa",
    ],
  },
  {
    slug: "compiler",
    label: "Compiler Design",
    aliases: ["compiler-design"],
  },
  {
    slug: "cn",
    label: "Computer Networks",
    aliases: ["computer-networks", "cn"],
  },
  {
    slug: "dbms",
    label: "Databases",
    aliases: ["databases", "dbms", "database-management-systems"],
  },
  {
    slug: "digital-logic",
    label: "Digital Logic",
    aliases: ["digital-logic"],
  },
  {
    slug: "discrete-math",
    label: "Discrete Mathematics",
    aliases: ["discrete-math", "discrete-mathematics"],
  },
  {
    slug: "engg-math",
    label: "Engineering Mathematics",
    aliases: ["engg-math", "engineering-mathematics"],
  },
  {
    slug: "ga",
    label: "General Aptitude",
    aliases: [
      "general-aptitude",
      "ga",
      "verbal-aptitude",
      "quantitative-aptitude",
      "spatial-aptitude",
    ],
  },
  {
    slug: "os",
    label: "Operating System",
    aliases: ["operating-system", "os"],
  },
  {
    slug: "prog-ds",
    label: "Programming and DS",
    aliases: ["programming-and-ds", "programming-ds", "prog-ds"],
  },
  {
    slug: "prog-c",
    label: "Programming in C",
    aliases: ["programming-in-c", "c-programming", "prog-c"],
  },
  {
    slug: "toc",
    label: "Theory of Computation",
    aliases: ["theory-of-computation", "toc"],
  },
  {
    slug: "legacy-other",
    label: "Other / Optional",
    aliases: [
      "legacy / other",
      "other / optional",
      "other-optional",
      "optional",
      "legacy-other",
      "legacy-out-of-syllabus",
      "out-of-syllabus-now",
      "out-of-gatecse-syllabus",
      "web-technologies",
      "html",
      "is&software-engineering",
      "is-software-engineering",
      "software-engineering",
      "object-oriented-programming",
      "fortran",
      "pascal",
    ],
  },
];

const SUBJECT_BY_LABEL = new Map(
  SUBJECTS.map((subject) => [subject.label, subject])
);
const SUBJECT_PRIORITY = [
  "Digital Logic",
  "Computer Networks",
  "Operating System",
  "Databases",
  "Compiler Design",
  "CO & Architecture",
  "Algorithms",
  "Programming and DS",
  "Theory of Computation",
  "Programming in C",
  "Discrete Mathematics",
  "Engineering Mathematics",
  "General Aptitude",
  "Other / Optional",
];
const PRECOMPUTED_SUBTOPIC_LOOKUP = readJson(PRECOMPUTED_SUBTOPIC_LOOKUP_PATH, {});
const SUBJECT_ALIASES_BY_LABEL = PRECOMPUTED_SUBTOPIC_LOOKUP?.subjectAliases || {};
const NORMALIZED_SUBTOPICS_BY_SUBJECT =
  PRECOMPUTED_SUBTOPIC_LOOKUP?.normalizedSubtopicsBySubject || {};

function ensureDir(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function writeText(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, "utf8");
}

function escapeXml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildCanonicalUrl(pathname = "/", query = null) {
  const normalizedBase = SITE_ORIGIN.replace(/\/+$/, "");
  const normalizedPath = String(pathname || "/").startsWith("/")
    ? String(pathname || "/")
    : `/${String(pathname || "/")}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      const rawValue = String(value || "").trim();
      if (!rawValue) {
        return;
      }
      url.searchParams.set(key, rawValue);
    });
  }
  return url.toString();
}

const SEO_SUBJECT_SLUGS = {
  "os": "operating-systems",
  "cn": "computer-networks",
  "dbms": "dbms",
  "algorithms": "algorithms",
  "compiler": "compiler-design",
  "discrete-math": "discrete-mathematics",
  "digital-logic": "digital-logic",
  "coa": "computer-organization",
  "toc": "theory-of-computation",
  "prog-ds": "data-structures",
  "engg-math": "engineering-mathematics",
};

const ALIAS_SITEMAP_URLS = ["/blog", ...EDITORIAL_PAGES.map((page) => page.path)];



function buildSitemapXml(manifest = {}, questions = [], generatedAt = new Date().toISOString()) {
  const todayStr = String(generatedAt || "").split("T")[0];
  const urls = [];

  const addUrl = (loc, priority = "0.5", changefreq = "monthly", lastmod = todayStr) => {
    urls.push({ loc, priority, changefreq, lastmod });
  };

  addUrl(buildCanonicalUrl("/"), "1.0", "weekly");
  addUrl(buildCanonicalUrl("/practice"), "0.8", "weekly");
  addUrl(buildCanonicalUrl("/mock"), "0.7", "weekly");
  addUrl(buildCanonicalUrl("/subjects"), "0.6", "monthly");

  ALIAS_SITEMAP_URLS.forEach((path) => {
    addUrl(buildCanonicalUrl(path), "0.7", "monthly");
  });

  const yearSets = Array.isArray(manifest.yearSets) ? manifest.yearSets : [];
  const seenYears = new Set();
  yearSets.forEach((entry) => {
    const year = Number(entry?.year);
    if (Number.isFinite(year) && year >= 2015 && !seenYears.has(year)) {
      seenYears.add(year);
      const yearDate = `${year}-02-01`;
      addUrl(buildCanonicalUrl(`/gate-${year}-pyq`), "0.8", "monthly", yearDate);
    }
  });

  const subjects = Array.isArray(manifest.subjects) ? manifest.subjects : [];
  subjects.forEach((entry) => {
    const slug = String(entry?.slug || "").trim();
    if (!slug || slug === "unknown" || slug === "legacy-other") return;
    const seoSlug = SEO_SUBJECT_SLUGS[slug] || slug;
    addUrl(buildCanonicalUrl(`/subjects/${seoSlug}`), "0.8", "monthly");
  });

  const questionArray = Array.isArray(questions) ? questions : [];
  questionArray.forEach((question) => {
    const uid = question.question_uid;
    if (uid) {
      addUrl(buildCanonicalUrl(`/practice/question/${encodeURIComponent(uid)}`), "0.5", "yearly", "");
    }
  });

  urls.sort((left, right) => left.loc.localeCompare(right.loc));

  const rows = urls.map((entry) => {
    const escapedUrl = escapeXml(entry.loc);
    const parts = [`    <loc>${escapedUrl}</loc>`];
    if (entry.lastmod) {
      parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    }
    parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    parts.push(`    <priority>${entry.priority}</priority>`);
    return `  <url>\n${parts.join("\n")}\n  </url>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    rows.join("\n"),
    "</urlset>",
    "",
  ].join("\n");
}

function buildRobotsTxt() {
  const allowedPaths = [
    ...ALIAS_SITEMAP_URLS,
    "/subjects/",
    "/gate-2015-pyq",
    "/gate-2016-pyq",
    "/gate-2017-pyq",
    "/gate-2018-pyq",
    "/gate-2019-pyq",
    "/gate-2020-pyq",
    "/gate-2021-pyq",
    "/gate-2022-pyq",
    "/gate-2023-pyq",
    "/gate-2024-pyq",
    "/gate-2025-pyq",
    "/gate-2026-pyq",
    "/practice/question/",
  ];

  const lines = [
    "User-agent: *",
    "Disallow: /practice?",
    "Disallow: /mock?",
    "Disallow: /insights",
    ...allowedPaths.map((p) => `Allow: ${p}`),
    "",
    `Sitemap: ${buildCanonicalUrl("/sitemap.xml")}`,
    "",
  ];
  return lines.join("\n");
}

function getQuestionBankPath() {
  const found = QUESTION_BANK_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error("Could not find a public question bank JSON file.");
  }
  return found;
}

function extractGateOverflowId(link = "") {
  const raw = String(link || "").trim();
  if (!raw) return null;
  const absoluteMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
  );
  if (absoluteMatch) return absoluteMatch[1];
  const relativeMatch = raw.match(/^\/?(\d+)(?:[/?#]|$)/);
  return relativeMatch ? relativeMatch[1] : null;
}

function hashString(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function buildQuestionUid(question = {}) {
  if (question.question_uid) {
    return String(question.question_uid);
  }
  const gateOverflowId = extractGateOverflowId(question.link || "");
  if (gateOverflowId) {
    return `go:${gateOverflowId}`;
  }
  return `local:${hashString(
    `${question.title || ""}||${question.question || ""}||${question.link || ""}`
  )}`;
}

function normalizeToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeSubjectInferenceToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function slugify(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtmlToText(html = "") {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const OPTION_BLOCK_RE =
  /<(p|div|li)\b[^>]*>\s*(?:<(?:strong|b|em|span)\b[^>]*>\s*)?(?:\(?[A-D]\)?[\.\):])\s*[\s\S]*?<\/\1>/gi;
const OPTION_LINE_RE =
  /(?:^|\n|<br\s*\/?>)\s*(?:\(?[A-D]\)?[\.\):])\s+[^\n<]+(?=\s*(?:<br\s*\/?>|\n|$))/gi;
const OPTION_LIST_RE =
  /<(ol|ul)\b[^>]*>\s*(?:<li\b[^>]*>\s*(?:<(?:strong|b|em|span)\b[^>]*>\s*)?(?:\(?[A-D]\)?[\.\):])\s*[\s\S]*?<\/li>\s*){2,4}<\/\1>/gi;
const ALPHA_OPTION_LIST_RE =
  /<(ol|ul)\b[^>]*(?:list-style-type\s*:\s*(?:upper-alpha|lower-alpha)|\btype\s*=\s*["']?[Aa]["']?)[^>]*>\s*(?:<li\b[^>]*>[\s\S]*?<\/li>\s*){2,5}<\/\1>/gi;
const TRAILING_OPTION_LIST_RE =
  /<(ol|ul)\b[^>]*>\s*(?:<li\b[^>]*>[\s\S]*?<\/li>\s*){2,5}<\/\1>\s*(?:<br\s*\/?>|\s)*$/gi;
const ALPHA_OPTION_LIST_TEST_RE =
  /<(ol|ul)\b[^>]*(?:list-style-type\s*:\s*(?:upper-alpha|lower-alpha)|\btype\s*=\s*["']?[Aa]["']?)[^>]*>\s*(?:<li\b[^>]*>[\s\S]*?<\/li>\s*){2,5}<\/\1>/i;
const LABELED_OPTION_BLOCK_TEST_RE =
  /<(?:p|div|li)\b[^>]*>\s*(?:<(?:strong|b|em|span)\b[^>]*>\s*)?(?:\(?[A-D]\)?[\.\):])/i;

function stripEmbeddedOptionsFromHtml(html = "") {
  return stripSharedEmbeddedOptions(html);
}

function buildPreviewSourceHtml(question = {}) {
  const questionHtml = String(question?.question || "");
  const typeToken = String(question?.type || "").trim().toLowerCase();
  const shouldStripOptions =
    typeToken === "mcq"
    || typeToken === "msq"
    || ALPHA_OPTION_LIST_TEST_RE.test(questionHtml)
    || LABELED_OPTION_BLOCK_TEST_RE.test(questionHtml);

  if (!shouldStripOptions) {
    return questionHtml;
  }

  const stripped = stripEmbeddedOptionsFromHtml(questionHtml);
  return stripped || questionHtml;
}

function buildPreview(text = "", maxLength = 180) {
  const normalized = String(text || "").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function getDetailShardKey(yearSet = null) {
  const key = String(yearSet?.key || "").trim();
  return key || "unknown";
}

function parseYearSet(question = {}) {
  const candidates = [
    String(question.title || ""),
    String(question.year || ""),
    String(question.link || ""),
  ];

  for (const candidate of candidates) {
    const match = candidate.match(
      /\bgate(?:\s+|-)?(?:cse|it|da)?(?:\s+|-)?(\d{4})(?:\s*(?:\||-|\s)\s*set\s*[- ]?(\d+))?/i
    );
    if (!match) {
      continue;
    }

    const year = Number.parseInt(match[1], 10);
    const parsedSet = Number.parseInt(match[2], 10);
    const set = Number.isFinite(parsedSet) && parsedSet > 0 ? parsedSet : null;

    return {
      year,
      set,
      key: `${year}-s${set || 0}`,
      label: set ? `${year} Set ${set}` : String(year),
    };
  }

  return {
    year: null,
    set: null,
    key: null,
    label: "Unknown",
  };
}

const MOCK_SECTION_COUNTS = {
  GA: 10,
  CS: 55,
};

const MOCK_OBJECTIVE_TYPES = new Set(["MCQ", "MSQ", "NAT"]);
const MOCK_AUTO_AWARD_TYPES = new Set(["AMBIGUOUS", "MARKS_TO_ALL", "SUBJECTIVE"]);
const MOCK_LEGACY_CONTINUOUS_MIN_YEAR = 1987;
const MOCK_LEGACY_CONTINUOUS_SPLIT_MAX_YEAR = 2013;
const MOCK_LEGACY_SLOT_DEDUP_MAX_YEAR = 2009;
const MOCK_STANDARD_TOTAL_QUESTIONS = MOCK_SECTION_COUNTS.GA + MOCK_SECTION_COUNTS.CS;
const MOCK_LEGACY_PARTIAL_MIN_QUESTIONS = 1;
const MOCK_OPTION_LABELS = ["A", "B", "C", "D", "E"];
const MOCK_IMAGE_SRC_RE = /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi;
const MOCK_REMOTE_GATEOVERFLOW_BLOB_RE = /https:\/\/(?:[a-z0-9-]+\.)?gateoverflow\.in\/\?qa=blob(?:&amp;|&)qa_blobid=\d+/i;
const MOCK_LOCAL_QUESTION_IMAGE_RE = /\/(?:Gate_QA\/)?question-images\/([^"')\s>]+)/i;

function normalizeMockOptionLabel(value = "") {
  return String(value || "").trim().toUpperCase();
}

function normalizeMockOptionsFromRaw(rawOptions = []) {
  const options = [];
  const seen = new Set();

  const pushOption = (rawLabel, rawValue, index) => {
    const label = normalizeMockOptionLabel(rawLabel || MOCK_OPTION_LABELS[index]);
    if (!label || seen.has(label)) {
      return;
    }

    const html = String(rawValue ?? "").trim();
    const text = stripHtmlToText(html);
    if (!html && !text) {
      return;
    }

    seen.add(label);
    options.push({ label, html: html || text, text: text || html });
  };

  if (Array.isArray(rawOptions)) {
    rawOptions.forEach((entry, index) => {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        pushOption(
          entry.label || entry.option || entry.key,
          entry.html || entry.text || entry.value || entry.optionText,
          index
        );
        return;
      }
      pushOption(MOCK_OPTION_LABELS[index], entry, index);
    });
    return options;
  }

  if (rawOptions && typeof rawOptions === "object") {
    MOCK_OPTION_LABELS.forEach((label, index) => {
      pushOption(label, rawOptions[label], index);
    });
    if (options.length === 0) {
      Object.entries(rawOptions).forEach(([key, value], index) => {
        pushOption(key, value, index);
      });
    }
  }

  return options;
}

function extractMockOptionsFromQuestionHtml(questionHtml = "") {
  return extractSharedEmbeddedOptions(questionHtml);
}

function getMockOptions(question = {}) {
  const rawOptions = normalizeMockOptionsFromRaw(question?.options);
  if (rawOptions.length > 0) {
    return rawOptions;
  }
  return extractMockOptionsFromQuestionHtml(question?.question || "");
}

function extractMockImageSources(question = {}) {
  const fragments = [question?.question || ""];
  if (Array.isArray(question?.options)) {
    question.options.forEach((option) => {
      fragments.push(
        option && typeof option === "object"
          ? (option.html || option.text || option.value || "")
          : option
      );
    });
  }

  const sources = [];
  fragments.forEach((fragment) => {
    for (const match of String(fragment || "").matchAll(MOCK_IMAGE_SRC_RE)) {
      const src = String(match[2] || "").trim();
      if (src) {
        sources.push(src);
      }
    }
  });
  return sources;
}

function hasValidMockAnswer(answerRecord = null, type = "") {
  const normalizedType = String(type || "").trim().toUpperCase();
  if (!answerRecord || !MOCK_OBJECTIVE_TYPES.has(normalizedType)) {
    return false;
  }
  if (normalizedType === "MCQ") {
    return Boolean(normalizeMockOptionLabel(answerRecord.answer));
  }
  if (normalizedType === "MSQ") {
    return Array.isArray(answerRecord.answer)
      && answerRecord.answer.map(normalizeMockOptionLabel).some(Boolean);
  }
  if (normalizedType === "NAT") {
    const values = Array.isArray(answerRecord.answer)
      ? answerRecord.answer
      : [answerRecord.answer];
    return values.some((value) => String(value ?? "").trim() !== "");
  }
  return false;
}

function getMockQuestionValidationIssues(question = {}, answerRecord = null, type = "") {
  const issues = [];
  const normalizedType = String(type || "").trim().toUpperCase();
  const imageSources = extractMockImageSources(question);
  const hasQuestionContent = stripHtmlToText(question?.question || "") !== "" || imageSources.length > 0;
  if (!hasQuestionContent) {
    issues.push("missing_question_content");
  }

  const missingImages = imageSources.filter((src) => {
    if (MOCK_REMOTE_GATEOVERFLOW_BLOB_RE.test(src)) {
      return true;
    }
    const localMatch = src.match(MOCK_LOCAL_QUESTION_IMAGE_RE);
    if (!localMatch) {
      return false;
    }
    return !fs.existsSync(path.join(QUESTION_IMAGE_DIR, localMatch[1]));
  });
  if (missingImages.length > 0) {
    issues.push("missing_or_remote_image");
  }

  if (MOCK_OBJECTIVE_TYPES.has(normalizedType) && !hasValidMockAnswer(answerRecord, normalizedType)) {
    issues.push("missing_answer");
  }

  if (normalizedType === "MCQ" || normalizedType === "MSQ") {
    const options = getMockOptions(question);
    if (options.length === 0) {
      issues.push("missing_options");
    } else {
      const optionLabels = new Set(options.map((option) => normalizeMockOptionLabel(option.label)).filter(Boolean));
      const answerLabels = normalizedType === "MCQ"
        ? [normalizeMockOptionLabel(answerRecord?.answer)]
        : (Array.isArray(answerRecord?.answer) ? answerRecord.answer.map(normalizeMockOptionLabel) : []);
      if (optionLabels.size > 0 && answerLabels.some((label) => label && !optionLabels.has(label))) {
        issues.push("answer_option_mismatch");
      }
    }
  }

  return issues;
}

function parseRomanNumeralToken(value = "") {
  const token = String(value || "").trim().toLowerCase();
  if (!/^[ivxlcdm]+$/.test(token)) {
    return null;
  }

  const values = {
    i: 1,
    v: 5,
    x: 10,
    l: 50,
    c: 100,
    d: 500,
    m: 1000,
  };

  let total = 0;
  let previous = 0;
  for (let index = token.length - 1; index >= 0; index -= 1) {
    const current = values[token[index]];
    if (!current) {
      return null;
    }
    if (current < previous) {
      total -= current;
    } else {
      total += current;
      previous = current;
    }
  }
  return total > 0 ? total : null;
}

function normalizeLegacyQuestionToken(rawToken = "") {
  const cleaned = String(rawToken || "")
    .toLowerCase()
    .replace(/\u200e|\u200f|\u202a|\u202b|\u202c|\u202d|\u202e|\u2066|\u2067|\u2068|\u2069/g, "")
    .replace(/\bquestion\b/g, "")
    .replace(/\s+/g, "")
    .replace(/[_,|]/g, "-")
    .replace(/[.]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleaned) {
    return null;
  }

  const segments = cleaned
    .split("-")
    .filter(Boolean)
    .map((segment, index) => {
      if (index === 0 && /^\d+$/.test(segment)) {
        return String(Number.parseInt(segment, 10));
      }
      return segment;
    });

  if (segments.length === 0) {
    return null;
  }

  const [first, ...rest] = segments;
  const firstMatch = first.match(/^(\d+)([a-z]+)$/i);
  if (firstMatch) {
    return [String(Number.parseInt(firstMatch[1], 10)), firstMatch[2], ...rest].join("-");
  }

  return segments.join("-");
}

function extractLegacyQuestionTokenFromTitle(title = "") {
  const match = String(title || "").match(
    /\|\s*Question\s*:\s*([A-Za-z0-9]+(?:[.,-][A-Za-z0-9]+)*)/i
  );
  return match ? normalizeLegacyQuestionToken(match[1]) : null;
}

function extractLegacyQuestionTokenFromExamUid(examUid = "") {
  const match = String(examUid || "").trim().match(/^cse:\d{4}:set\d+:[^:]+:q(.+)$/i);
  return match ? normalizeLegacyQuestionToken(match[1]) : null;
}

function extractLegacyQuestionTokenFromLink(link = "", yearSet = null) {
  const resolvedYearSet = yearSet && Number.isFinite(yearSet.year) ? yearSet : null;
  const yearToken = resolvedYearSet ? String(resolvedYearSet.year) : "\\d{4}";
  const pattern = new RegExp(`gate-cse-${yearToken}-question-([a-z0-9-]+)`, "i");
  const match = String(link || "").trim().match(pattern);
  return match ? normalizeLegacyQuestionToken(match[1]) : null;
}

function extractLegacyQuestionToken(question = {}, yearSet = null) {
  return (
    extractLegacyQuestionTokenFromTitle(question.title || "")
    || extractLegacyQuestionTokenFromExamUid(question.exam_uid || "")
    || extractLegacyQuestionTokenFromLink(question.link || "", yearSet)
  );
}

function parseLegacyQualifierToken(token = "") {
  const value = String(token || "").trim().toLowerCase();
  if (!value) {
    return { typeRank: 0, valueRank: 0, raw: value };
  }
  if (/^\d+$/.test(value)) {
    return {
      typeRank: 1,
      valueRank: Number.parseInt(value, 10),
      raw: value,
    };
  }

  const romanValue = parseRomanNumeralToken(value);
  if (Number.isFinite(romanValue)) {
    return {
      typeRank: 2,
      valueRank: romanValue,
      raw: value,
    };
  }

  if (/^[a-z]+$/.test(value)) {
    return {
      typeRank: 3,
      valueRank: value,
      raw: value,
    };
  }

  return {
    typeRank: 4,
    valueRank: value,
    raw: value,
  };
}

function parseLegacySortKey(token = "") {
  const normalized = normalizeLegacyQuestionToken(token);
  if (!normalized) {
    return null;
  }

  const segments = normalized.split("-").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const [first, ...rest] = segments;
  const firstMatch = first.match(/^(\d+)([a-z]+)?$/i);

  let major = Number.MAX_SAFE_INTEGER;
  const qualifiers = [];

  if (firstMatch) {
    major = Number.parseInt(firstMatch[1], 10);
    if (firstMatch[2]) {
      qualifiers.push(firstMatch[2]);
    }
  } else if (/^\d+$/.test(first)) {
    major = Number.parseInt(first, 10);
  } else {
    qualifiers.push(first);
  }

  qualifiers.push(...rest);

  return {
    normalized,
    major: Number.isFinite(major) ? major : Number.MAX_SAFE_INTEGER,
    qualifiers: qualifiers.map(parseLegacyQualifierToken),
  };
}

function compareLegacyQuestionTokens(leftToken = "", rightToken = "") {
  const left = parseLegacySortKey(leftToken);
  const right = parseLegacySortKey(rightToken);

  if (!left && !right) {
    return 0;
  }
  if (!left) {
    return 1;
  }
  if (!right) {
    return -1;
  }

  if (left.major !== right.major) {
    return left.major - right.major;
  }

  const length = Math.max(left.qualifiers.length, right.qualifiers.length);
  for (let index = 0; index < length; index += 1) {
    const leftQualifier = left.qualifiers[index];
    const rightQualifier = right.qualifiers[index];

    if (!leftQualifier && rightQualifier) {
      return -1;
    }
    if (leftQualifier && !rightQualifier) {
      return 1;
    }
    if (!leftQualifier && !rightQualifier) {
      continue;
    }

    if (leftQualifier.typeRank !== rightQualifier.typeRank) {
      return leftQualifier.typeRank - rightQualifier.typeRank;
    }

    if (leftQualifier.valueRank !== rightQualifier.valueRank) {
      if (
        typeof leftQualifier.valueRank === "number"
        && typeof rightQualifier.valueRank === "number"
      ) {
        return leftQualifier.valueRank - rightQualifier.valueRank;
      }
      return String(leftQualifier.valueRank).localeCompare(
        String(rightQualifier.valueRank),
        undefined,
        { numeric: true, sensitivity: "base" }
      );
    }
  }

  return left.normalized.localeCompare(right.normalized, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function parseMockSectionPosition(question = {}, yearSet = null) {
  const title = String(question.title || "").trim();

  const gaPatterns = [
    /\|\s*GA\s*\|[\s\S]*?\bQuestion:\s*(?:GA[- ]?)?0*(\d+)\b/i,
    /\|\s*GA\s*Question:\s*0*(\d+)\b/i,
    /\bQuestion:\s*GA[- ]?0*(\d+)\b/i,
  ];

  for (const pattern of gaPatterns) {
    const gaMatch = title.match(pattern);
    if (!gaMatch) {
      continue;
    }

    const orderIndex = Number.parseInt(gaMatch[1], 10);
    if (Number.isFinite(orderIndex) && orderIndex > 0) {
      return {
        section: "GA",
        orderIndex,
      };
    }
  }

  const csMatch = title.match(/\|\s*Question:\s*(\d+)\b/i);
  if (csMatch) {
    const orderIndex = Number.parseInt(csMatch[1], 10);
    if (Number.isFinite(orderIndex) && orderIndex > 0) {
      const resolvedYearSet = yearSet || parseYearSet(question);
      const usesLegacyContinuousSplit =
        resolvedYearSet.set == null
        && Number.isFinite(resolvedYearSet.year)
        && resolvedYearSet.year >= MOCK_LEGACY_CONTINUOUS_MIN_YEAR
        && resolvedYearSet.year <= MOCK_LEGACY_CONTINUOUS_SPLIT_MAX_YEAR;

      if (usesLegacyContinuousSplit) {
        if (orderIndex >= 56 && orderIndex <= 65) {
          return {
            section: "GA",
            orderIndex: orderIndex - 55,
          };
        }

        if (orderIndex >= 1 && orderIndex <= MOCK_SECTION_COUNTS.CS) {
          return {
            section: "CS",
            orderIndex,
          };
        }

        return null;
      }

      return {
        section: "CS",
        orderIndex,
      };
    }
  }

  return null;
}

function resolveMockMarks(section, orderIndex) {
  if (section === "GA" && orderIndex >= 1 && orderIndex <= MOCK_SECTION_COUNTS.GA) {
    return orderIndex <= 5 ? 1 : 2;
  }

  if (section === "CS" && orderIndex >= 1 && orderIndex <= MOCK_SECTION_COUNTS.CS) {
    return orderIndex <= 25 ? 1 : 2;
  }

  return null;
}

function resolveNegativeMarks(type, marks) {
  if (type !== "MCQ") {
    return 0;
  }
  if (marks === 1) {
    return 0.3333333333;
  }
  return 0.6666666667;
}

function hasCompletePaperSection(positionSet = new Set(), expectedCount = 0) {
  if (!(positionSet instanceof Set) || positionSet.size !== expectedCount) {
    return false;
  }

  for (let index = 1; index <= expectedCount; index += 1) {
    if (!positionSet.has(index)) {
      return false;
    }
  }

  return true;
}

function sortMockMetaByOrder(left = {}, right = {}) {
  if (left.section !== right.section) {
    return left.section === "GA" ? -1 : 1;
  }
  return Number(left.orderIndex || 0) - Number(right.orderIndex || 0);
}

function isLegacySlotDedupPaper(yearSet = null) {
  return Boolean(
    yearSet
    && yearSet.set == null
    && Number.isFinite(yearSet.year)
    && yearSet.year >= MOCK_LEGACY_CONTINUOUS_MIN_YEAR
    && yearSet.year <= MOCK_LEGACY_SLOT_DEDUP_MAX_YEAR
  );
}

function buildLegacyMockCandidateScore(question = {}, answerRecord = null) {
  let score = 0;
  const answerType = String(answerRecord?.type || "").trim().toUpperCase();

  if (MOCK_OBJECTIVE_TYPES.has(answerType) || MOCK_AUTO_AWARD_TYPES.has(answerType)) {
    score += 30;
  }

  if (answerRecord?.answer_uid) {
    score += 10;
  }

  if (Array.isArray(question.tags) && question.tags.length > 0) {
    score += 5;
  }

  if (question.question_uid && !String(question.question_uid).startsWith("local:")) {
    score += 8;
  }

  const title = String(question.title || "");
  const link = String(question.link || "");
  const stem = String(question.question || "");
  const variantPenalty = /(?:modified|version|ugcnet|isro|pgee|blog|doubt|why option)/i.test(`${title} ${link}`)
    ? 25
    : 0;

  score += Math.min(stem.length, 2000) / 1000;
  score += Math.min(title.length, 200) / 1000;

  return score - variantPenalty;
}

function compareLegacySlotCandidates(left = null, right = null) {
  if (!left) return -1;
  if (!right) return 1;

  const scoreDelta = Number(left.score || 0) - Number(right.score || 0);
  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  const leftGoId = Number(left.goId);
  const rightGoId = Number(right.goId);
  if (Number.isFinite(leftGoId) && Number.isFinite(rightGoId) && leftGoId !== rightGoId) {
    return rightGoId - leftGoId;
  }

  return String(right.questionUid || "").localeCompare(String(left.questionUid || ""));
}

function registerMockMeta(group, meta, byQuestionUid) {
  byQuestionUid[meta.questionUid] = meta;

  const positionSet = meta.section === "GA" ? group.gaPositions : group.csPositions;
  if (positionSet.has(meta.orderIndex)) {
    group.hasDuplicatePosition = true;
  }
  positionSet.add(meta.orderIndex);
  group.questionUids.push(meta.questionUid);

  if (meta.scorable) {
    group.scorableCandidateCount += 1;
    if (meta.section === "GA") {
      group.scorableGaCount += 1;
    } else if (meta.section === "CS") {
      group.scorableCsCount += 1;
    }
  }
}

function buildMockCatalog(questions = [], answersByQuestionUid = {}) {
  const byQuestionUid = {};
  const paperGroups = new Map();

  questions.forEach((question) => {
    const questionUid = buildQuestionUid(question);
    const yearSet = parseYearSet(question);
    const useLegacySlotDedup = isLegacySlotDedupPaper(yearSet);
    const paperPosition = useLegacySlotDedup
      ? null
      : parseMockSectionPosition(question, yearSet);

    if (!yearSet.key || (!paperPosition && !useLegacySlotDedup)) {
      return;
    }

    const answerRecord = answersByQuestionUid[questionUid] || null;
    const answerType = String(answerRecord?.type || "").trim().toUpperCase();
    const isObjectiveType = MOCK_OBJECTIVE_TYPES.has(answerType);
    const isAutoAwardType = MOCK_AUTO_AWARD_TYPES.has(answerType);
    const type = isObjectiveType || isAutoAwardType ? answerType : null;
    const validationIssues = isObjectiveType
      ? getMockQuestionValidationIssues(question, answerRecord, type)
      : [];
    const mockReady = isAutoAwardType || (isObjectiveType && validationIssues.length === 0);

    if (!paperGroups.has(yearSet.key)) {
      paperGroups.set(yearSet.key, {
        yearSetKey: yearSet.key,
        year: yearSet.year,
        set: yearSet.set,
        label: yearSet.label,
        useLegacySlotDedup,
        slotCandidates: new Map(),
        gaPositions: new Set(),
        csPositions: new Set(),
        questionUids: [],
        hasDuplicatePosition: false,
        scorableCandidateCount: 0,
        scorableGaCount: 0,
        scorableCsCount: 0,
      });
    }

    const group = paperGroups.get(yearSet.key);
    if (group.useLegacySlotDedup) {
      const legacyToken = extractLegacyQuestionToken(question, yearSet);
      if (!legacyToken) {
        return;
      }

      const slotKey = legacyToken;
      const candidate = {
        questionUid,
        yearSetKey: yearSet.key,
        title: String(question.title || "").trim(),
        type,
        autoAwarded: isAutoAwardType,
        validationIssues,
        mockReady,
        legacyToken,
        score: buildLegacyMockCandidateScore(question, answerRecord),
        goId: Number.parseInt(extractGateOverflowId(question.link || ""), 10),
      };
      const existing = group.slotCandidates.get(slotKey);
      if (!existing || compareLegacySlotCandidates(candidate, existing) > 0) {
        group.slotCandidates.set(slotKey, candidate);
      }
      return;
    }

    const marks = resolveMockMarks(paperPosition.section, paperPosition.orderIndex);
    const negativeMarks = type && marks ? resolveNegativeMarks(type, marks) : null;
    const scorable = Boolean(type && marks !== null && mockReady);
    const meta = {
      questionUid,
      yearSetKey: yearSet.key,
      orderIndex: paperPosition.orderIndex,
      section: paperPosition.section,
      title: String(question.title || "").trim(),
      type,
      marks,
      negativeMarks,
      paperReady: false,
      scorable,
      autoAwarded: isAutoAwardType,
      ...(validationIssues.length > 0 ? { validationIssues } : {}),
    };

    registerMockMeta(group, meta, byQuestionUid);
  });

  for (const group of paperGroups.values()) {
    if (!group.useLegacySlotDedup) {
      continue;
    }

    const selected = Array.from(group.slotCandidates.values())
      .sort((left, right) => {
        const tokenCompare = compareLegacyQuestionTokens(left.legacyToken, right.legacyToken);
        if (tokenCompare !== 0) {
          return tokenCompare;
        }
        return String(left.questionUid || "").localeCompare(
          String(right.questionUid || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        );
      })
      .slice(0, MOCK_STANDARD_TOTAL_QUESTIONS);

    selected.forEach((entry, index) => {
      const absolutePosition = index + 1;
      const section = absolutePosition > MOCK_SECTION_COUNTS.CS ? "GA" : "CS";
      const orderIndex = section === "GA"
        ? absolutePosition - MOCK_SECTION_COUNTS.CS
        : absolutePosition;
      const marks = resolveMockMarks(section, orderIndex);
      const negativeMarks = entry.type && marks ? resolveNegativeMarks(entry.type, marks) : null;
      const scorable = Boolean(entry.type && marks !== null && entry.mockReady);

      registerMockMeta(group, {
        questionUid: entry.questionUid,
        yearSetKey: entry.yearSetKey,
        orderIndex,
        section,
        title: entry.title,
        type: entry.type,
        marks,
        negativeMarks,
        paperReady: false,
        scorable,
        autoAwarded: entry.autoAwarded,
        ...(entry.validationIssues?.length > 0 ? { validationIssues: entry.validationIssues } : {}),
      }, byQuestionUid);
    });
  }

  const papers = Array.from(paperGroups.values())
    .map((group) => {
      const gaCount = group.gaPositions.size;
      const csCount = group.csPositions.size;
      const hasCompleteGaSection = hasCompletePaperSection(group.gaPositions, MOCK_SECTION_COUNTS.GA);
      const hasCompleteCsSection = hasCompletePaperSection(group.csPositions, MOCK_SECTION_COUNTS.CS);
      const isLegacyPartialCandidate =
        group.useLegacySlotDedup
        && group.questionUids.length < MOCK_STANDARD_TOTAL_QUESTIONS;
      const requiredQuestionCount = isLegacyPartialCandidate
        ? group.questionUids.length
        : MOCK_STANDARD_TOTAL_QUESTIONS;
      const requiredGaCount = isLegacyPartialCandidate ? gaCount : MOCK_SECTION_COUNTS.GA;
      const requiredCsCount = isLegacyPartialCandidate ? csCount : MOCK_SECTION_COUNTS.CS;
      const belowLegacyMinimum =
        isLegacyPartialCandidate && requiredQuestionCount < MOCK_LEGACY_PARTIAL_MIN_QUESTIONS;
      const blockedQuestions = group.questionUids
        .map((questionUid) => byQuestionUid[questionUid])
        .filter((meta) => meta && !meta.scorable)
        .sort(sortMockMetaByOrder)
        .map((meta) => ({
          questionUid: meta.questionUid,
          title: meta.title,
          section: meta.section,
          orderIndex: meta.orderIndex,
          marks: meta.marks,
          validationIssues: meta.validationIssues || [],
        }));
      const paperReady =
        !group.hasDuplicatePosition
        && requiredQuestionCount > 0
        && !belowLegacyMinimum
        && group.questionUids.length === requiredQuestionCount
        && (isLegacyPartialCandidate || (hasCompleteGaSection && hasCompleteCsSection))
        && group.scorableCandidateCount === requiredQuestionCount;
      let statusReason = "Release-ready.";

      if (group.hasDuplicatePosition) {
        statusReason = "Duplicate paper slots detected in the parsed question set.";
      } else if (belowLegacyMinimum) {
        statusReason = `Legacy paper has only ${requiredQuestionCount} parsed questions (minimum ${MOCK_LEGACY_PARTIAL_MIN_QUESTIONS} required).`;
      } else if (!isLegacyPartialCandidate && group.questionUids.length !== MOCK_STANDARD_TOTAL_QUESTIONS) {
        statusReason = `Parsed ${group.questionUids.length}/65 total questions for this paper.`;
      } else if (!isLegacyPartialCandidate && (!hasCompleteGaSection || !hasCompleteCsSection)) {
        statusReason = `Incomplete paper structure (${gaCount} GA / ${csCount} CS parsed).`;
      } else if (blockedQuestions.length > 0) {
        const validationBlockedCount = blockedQuestions.filter((question) => (
          Array.isArray(question.validationIssues) && question.validationIssues.length > 0
        )).length;
        statusReason = validationBlockedCount > 0
          ? `Invalid mock question data for ${validationBlockedCount} question${validationBlockedCount === 1 ? "" : "s"}.`
          : `Missing verified answers for ${blockedQuestions.length} question${blockedQuestions.length === 1 ? "" : "s"}.`;
      } else if (isLegacyPartialCandidate) {
        statusReason = `Legacy partial paper ready (${requiredQuestionCount} parsed questions).`;
      }

      group.questionUids.forEach((questionUid) => {
        if (byQuestionUid[questionUid]) {
          byQuestionUid[questionUid].paperReady = paperReady;
        }
      });

      return {
        yearSetKey: group.yearSetKey,
        year: group.year,
        set: group.set,
        label: group.label,
        paperReady,
        gaCount,
        csCount,
        requiredQuestionCount,
        requiredGaCount,
        requiredCsCount,
        legacyPartial: isLegacyPartialCandidate,
        durationMinutes: isLegacyPartialCandidate
          ? Math.max(20, Math.round((requiredQuestionCount / MOCK_STANDARD_TOTAL_QUESTIONS) * 180))
          : 180,
        scorableCount: group.scorableCandidateCount,
        scorableGaCount: group.scorableGaCount,
        scorableCsCount: group.scorableCsCount,
        missingScorableCount: Math.max(
          requiredQuestionCount - group.scorableCandidateCount,
          0
        ),
        statusReason,
        blockedQuestions,
      };
    })
    .sort((left, right) => {
      if (left.year !== right.year) {
        return (right.year || 0) - (left.year || 0);
      }
      return (right.set || 0) - (left.set || 0);
    });

  const scorableQuestionUids = Object.values(byQuestionUid)
    .filter((meta) => meta.scorable)
    .sort((left, right) => {
      const paperCompare = String(left.yearSetKey || "").localeCompare(
        String(right.yearSetKey || ""),
        undefined,
        { numeric: true, sensitivity: "base" }
      );
      if (paperCompare !== 0) {
        return paperCompare;
      }
      if (left.section !== right.section) {
        return left.section === "GA" ? -1 : 1;
      }
      return left.orderIndex - right.orderIndex;
    })
    .map((meta) => meta.questionUid);

  return {
    version: "v1",
    papers,
    byQuestionUid,
    scorableQuestionUids,
  };
}

function inferSubject(question = {}, yearSet = null) {
  const title = String(question.title || "");
  if (/\|\s*GA\s*\|/i.test(title) || /Question:\s*GA-/i.test(title)) {
    return SUBJECT_BY_LABEL.get("General Aptitude");
  }

  const normalizedTags = Array.isArray(question.tags)
    ? question.tags.map((tag) => normalizeSubjectInferenceToken(tag)).filter(Boolean)
    : [];
  const normalizedTagSet = new Set(normalizedTags);
  const firstTagIndex = new Map();

  normalizedTags.forEach((tag, index) => {
    if (!firstTagIndex.has(tag)) {
      firstTagIndex.set(tag, index);
    }
  });

  if (yearSet?.year && /general aptitude/i.test(title)) {
    return SUBJECT_BY_LABEL.get("General Aptitude");
  }

  if (
    normalizedTagSet.has("generalaptitude")
    || normalizedTagSet.has("quantitativeaptitude")
    || normalizedTagSet.has("verbalaptitude")
    || normalizedTagSet.has("analyticalaptitude")
  ) {
    return SUBJECT_BY_LABEL.get("General Aptitude");
  }

  if (
    normalizedTagSet.has("outofsyllabusnow")
    || normalizedTagSet.has("outofgatecsesyllabus")
    || normalizedTagSet.has("legacyoutofsyllabus")
  ) {
    return SUBJECT_BY_LABEL.get("Other / Optional");
  }

  const explicitCandidates = new Set();
  const subjectStats = new Map();

  SUBJECTS.forEach((subject) => {
    const aliases = SUBJECT_ALIASES_BY_LABEL[subject.label] || subject.aliases.map(normalizeSubjectInferenceToken);
    const normalizedSubtopics = NORMALIZED_SUBTOPICS_BY_SUBJECT[subject.label] || [];

    let explicitIndex = Number.MAX_SAFE_INTEGER;
    aliases.forEach((alias) => {
      if (!normalizedTagSet.has(alias)) {
        return;
      }
      const index = firstTagIndex.get(alias);
      if (index !== undefined && index < explicitIndex) {
        explicitIndex = index;
      }
    });

    let subtopicCount = 0;
    let firstSubtopicIndex = Number.MAX_SAFE_INTEGER;
    normalizedSubtopics.forEach((subtopic) => {
      if (!normalizedTagSet.has(subtopic)) {
        return;
      }
      subtopicCount += 1;
      const index = firstTagIndex.get(subtopic);
      if (index !== undefined && index < firstSubtopicIndex) {
        firstSubtopicIndex = index;
      }
    });

    if (explicitIndex !== Number.MAX_SAFE_INTEGER || subtopicCount > 0) {
      subjectStats.set(subject.label, {
        explicitIndex,
        subtopicCount,
        firstSubtopicIndex,
      });
    }

    if (explicitIndex !== Number.MAX_SAFE_INTEGER) {
      explicitCandidates.add(subject.label);
    }
  });

  if (explicitCandidates.size === 1) {
    return SUBJECT_BY_LABEL.get(Array.from(explicitCandidates)[0]);
  }

  if (explicitCandidates.size > 1) {
    const ranked = Array.from(explicitCandidates).sort((left, right) => {
      const leftStats = subjectStats.get(left);
      const rightStats = subjectStats.get(right);

      if (leftStats.explicitIndex !== rightStats.explicitIndex) {
        return leftStats.explicitIndex - rightStats.explicitIndex;
      }

      if (leftStats.subtopicCount !== rightStats.subtopicCount) {
        return rightStats.subtopicCount - leftStats.subtopicCount;
      }

      if (leftStats.firstSubtopicIndex !== rightStats.firstSubtopicIndex) {
        return leftStats.firstSubtopicIndex - rightStats.firstSubtopicIndex;
      }

      return SUBJECT_PRIORITY.indexOf(left) - SUBJECT_PRIORITY.indexOf(right);
    });

    return SUBJECT_BY_LABEL.get(ranked[0]);
  }

  if (subjectStats.size === 1) {
    return SUBJECT_BY_LABEL.get(Array.from(subjectStats.keys())[0]);
  }

  if (subjectStats.size > 1) {
    const ranked = Array.from(subjectStats.entries()).sort((left, right) => {
      const [leftLabel, leftStats] = left;
      const [rightLabel, rightStats] = right;

      if (leftStats.subtopicCount !== rightStats.subtopicCount) {
        return rightStats.subtopicCount - leftStats.subtopicCount;
      }

      if (leftStats.firstSubtopicIndex !== rightStats.firstSubtopicIndex) {
        return leftStats.firstSubtopicIndex - rightStats.firstSubtopicIndex;
      }

      return SUBJECT_PRIORITY.indexOf(leftLabel) - SUBJECT_PRIORITY.indexOf(rightLabel);
    });

    return SUBJECT_BY_LABEL.get(ranked[0][0]);
  }

  return {
    slug: "unknown",
    label: "Unknown",
  };
}

function findRemoteGateOverflowImages(html = "") {
  const matches = [];
  const pattern = /<img\b[^>]*\bsrc=(["'])(https:\/\/gateoverflow\.in\/\?qa=blob[^"']*)\1/gi;
  for (const match of String(html || "").matchAll(pattern)) {
    matches.push(match[2]);
  }
  return matches;
}

function getLatestValidationReportPath() {
  if (!fs.existsSync(VALIDATION_REPORT_DIR)) {
    return null;
  }

  const candidates = fs
    .readdirSync(VALIDATION_REPORT_DIR)
    .filter((fileName) => /^validation-report-\d{4}\.json$/i.test(fileName))
    .sort((a, b) => b.localeCompare(a));

  if (!candidates.length) {
    return null;
  }

  return path.join(VALIDATION_REPORT_DIR, candidates[0]);
}

function buildArtifacts() {
  const generatedAt = new Date().toISOString();
  const questionBankPath = getQuestionBankPath();
  const questions = readJson(questionBankPath, []);
  if (!Array.isArray(questions)) {
    throw new Error(`${questionBankPath} must contain an array.`);
  }

  const answersByQuestionUidPayload = readJson(ANSWERS_BY_QUESTION_UID_PATH, {});
  const answersByQuestionUid = answersByQuestionUidPayload?.records_by_question_uid || {};
  const unsupportedPayload = readJson(UNSUPPORTED_QUESTION_UIDS_PATH, {});
  const unsupportedQuestionUids = new Set(
    Array.isArray(unsupportedPayload?.question_uids)
      ? unsupportedPayload.question_uids.map((value) => String(value || "").trim()).filter(Boolean)
      : []
  );

  const questionUidSet = new Set();
  const directAnswerUidSet = new Set(Object.keys(answersByQuestionUid));
  const remoteImageSamples = [];
  const remoteImageQuestionUids = new Set();
  const detailShards = new Map();

  const yearSetMap = new Map();
  const yearSetAnswerCoverageMap = new Map();
  const subjectCountMap = new Map();

  const searchIndex = questions.map((question) => {
    const questionUid = buildQuestionUid(question);
    questionUidSet.add(questionUid);
    const hasDirectAnswer = directAnswerUidSet.has(questionUid);
    const isUnsupported = unsupportedQuestionUids.has(questionUid);
    const hasAnswerCoverage = hasDirectAnswer || isUnsupported;

    const yearSet = parseYearSet(question);
    const subject = inferSubject(question, yearSet);
    const previewSourceHtml = buildPreviewSourceHtml(question);
    const plainText = stripHtmlToText(previewSourceHtml);
    const preview = buildPreview(plainText);
    const normalizedTags = Array.isArray(question.tags)
      ? question.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [];
    const remoteImages = findRemoteGateOverflowImages(question.question || "");
    const detailShardKey = getDetailShardKey(yearSet);

    if (yearSet.key) {
      if (!yearSetMap.has(yearSet.key)) {
        yearSetMap.set(yearSet.key, {
          key: yearSet.key,
          year: yearSet.year,
          set: yearSet.set,
          label: yearSet.label,
          count: 0,
        });
      }
      yearSetMap.get(yearSet.key).count += 1;

      if (!yearSetAnswerCoverageMap.has(yearSet.key)) {
        yearSetAnswerCoverageMap.set(yearSet.key, {
          key: yearSet.key,
          year: yearSet.year,
          set: yearSet.set,
          label: yearSet.label,
          total: 0,
          covered: 0,
          unsupported: 0,
        });
      }

      const answerCoverageEntry = yearSetAnswerCoverageMap.get(yearSet.key);
      answerCoverageEntry.total += 1;
      if (hasAnswerCoverage) {
        answerCoverageEntry.covered += 1;
      }
      if (isUnsupported) {
        answerCoverageEntry.unsupported += 1;
      }
    }

    const subjectKey = subject.slug || "unknown";
    subjectCountMap.set(subjectKey, {
      slug: subjectKey,
      label: subject.label || "Unknown",
      count: (subjectCountMap.get(subjectKey)?.count || 0) + 1,
    });

    if (remoteImages.length > 0) {
      remoteImageQuestionUids.add(questionUid);
      if (remoteImageSamples.length < 25) {
        remoteImageSamples.push({
          question_uid: questionUid,
          title: question.title || "",
          images: remoteImages,
        });
      }
    }

    const subjectLabel = subject.label || "Unknown";
    const title = String(question.title || "").trim();
    const searchText = [
      title,
      subjectLabel,
      yearSet.label,
      normalizedTags.join(" "),
      plainText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!detailShards.has(detailShardKey)) {
      detailShards.set(detailShardKey, {
        generatedAt,
        shardKey: detailShardKey,
        yearSetKey: yearSet.key || null,
        year: yearSet.year,
        set: yearSet.set,
        label: yearSet.label,
        questionCount: 0,
        recordsByQuestionUid: {},
      });
    }

    const shard = detailShards.get(detailShardKey);
    shard.questionCount += 1;
    shard.recordsByQuestionUid[questionUid] = {
      ...question,
      question_uid: questionUid,
    };

    return {
      question_uid: questionUid,
      title,
      subjectSlug: subject.slug || "unknown",
      subjectLabel,
      year: yearSet.year,
      set: yearSet.set,
      yearSetKey: yearSet.key,
      yearSetLabel: yearSet.label,
      detailShardKey,
      exam_uid: String(question.exam_uid || "").trim(),
      id_str: question.id_str ?? null,
      volume: question.volume ?? null,
      type: String(question.type || "").trim(),
      link: question.link || "",
      preview,
      searchText,
      tags: normalizedTags,
    };
  });

  const directAnswerCoverageCount = Array.from(questionUidSet).reduce((count, questionUid) => {
    if (directAnswerUidSet.has(questionUid) || unsupportedQuestionUids.has(questionUid)) {
      return count + 1;
    }
    return count;
  }, 0);

  const pipelineState = readJson(PIPELINE_STATE_PATH, {});
  const latestValidationReportPath = getLatestValidationReportPath();
  const latestValidationReport = latestValidationReportPath
    ? readJson(latestValidationReportPath, {})
    : {};
  const dataIntegrityReport = readJson(DATA_INTEGRITY_REPORT_PATH, {});
  const pipelineStatePublishedQuestionCount = Number(
    pipelineState?.publishedQuestionsTotal ?? pipelineState?.questionsTotal ?? 0
  );
  const validationReportPublishedQuestionCount = Number(
    latestValidationReport?.publishedQuestionCount ?? latestValidationReport?.totalBankSize ?? 0
  );

  const publicQuestionCount = questions.length;
  const latestYear = searchIndex.reduce((maxYear, question) => {
    if (!Number.isFinite(question.year)) {
      return maxYear;
    }
    return Math.max(maxYear, question.year);
  }, 0);

  const manifest = {
    bankVersion: "v1",
    generatedAt,
    questionCount: publicQuestionCount,
    latestYear: latestYear || null,
    yearSets: Array.from(yearSetMap.values()).sort((left, right) => {
      if (left.year !== right.year) {
        return (right.year || 0) - (left.year || 0);
      }
      return (right.set || 0) - (left.set || 0);
    }),
    subjects: Array.from(subjectCountMap.values()).sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.label.localeCompare(right.label);
    }),
    answerCoverage: {
      directQuestionUidMatches: directAnswerCoverageCount,
      unsupportedQuestionCount: unsupportedQuestionUids.size,
      estimatedCoverageRatio:
        publicQuestionCount > 0
          ? Number((directAnswerCoverageCount / publicQuestionCount).toFixed(4))
          : 0,
      yearSets: Array.from(yearSetAnswerCoverageMap.values())
        .sort((left, right) => {
          if (left.year !== right.year) {
            return (right.year || 0) - (left.year || 0);
          }
          return (right.set || 0) - (left.set || 0);
        })
        .map((entry) => ({
          key: entry.key,
          year: entry.year,
          set: entry.set,
          label: entry.label,
          total: entry.total,
          covered: entry.covered,
          unsupported: entry.unsupported,
          estimatedCoverageRatio:
            entry.total > 0
              ? Number((entry.covered / entry.total).toFixed(4))
              : 0,
        })),
    },
    remoteImages: {
      questionCount: remoteImageQuestionUids.size,
      sampleSize: remoteImageSamples.length,
    },
    dataRevision:
      String(pipelineState?.lastRunAt || "").trim() ||
      generatedAt,
  };
  const latestYearCoverageEntries = manifest.answerCoverage.yearSets.filter(
    (entry) => Number(entry.year) === Number(manifest.latestYear)
  );
  const latestYearCoverage = latestYearCoverageEntries.length > 0
    ? latestYearCoverageEntries.reduce((aggregate, entry) => ({
      year: entry.year,
      set: null,
      label: String(entry.year),
      covered: aggregate.covered + entry.covered,
      total: aggregate.total + entry.total,
      unsupported: aggregate.unsupported + entry.unsupported,
      estimatedCoverageRatio: 0,
    }), {
      year: manifest.latestYear,
      set: null,
      label: String(manifest.latestYear),
      covered: 0,
      total: 0,
      unsupported: 0,
      estimatedCoverageRatio: 0,
    })
    : null;
  if (latestYearCoverage && latestYearCoverage.total > 0) {
    latestYearCoverage.estimatedCoverageRatio = Number(
      (latestYearCoverage.covered / latestYearCoverage.total).toFixed(4)
    );
  }
  const mockCatalog = {
    generatedAt,
    ...buildMockCatalog(questions, answersByQuestionUid),
  };

  const dataStatusJson = {
    generatedAt,
    publicQuestionCount,
    manifestQuestionCount: manifest.questionCount,
    latestYear: manifest.latestYear,
    directAnswerCoverageCount,
    directAnswerCoverageRatio: manifest.answerCoverage.estimatedCoverageRatio,
    latestYearAnswerCoverage: latestYearCoverage
      ? {
        year: latestYearCoverage.year,
        set: latestYearCoverage.set,
        label: latestYearCoverage.label,
        covered: latestYearCoverage.covered,
        total: latestYearCoverage.total,
        unsupported: latestYearCoverage.unsupported,
        ratio: latestYearCoverage.estimatedCoverageRatio,
      }
      : null,
    remoteGateOverflowImageQuestionCount: remoteImageQuestionUids.size,
    pipelineStatePublishedQuestionCount,
    validationReportPublishedQuestionCount,
    pipelineStateQuestionCount: pipelineStatePublishedQuestionCount,
    validationReportQuestionCount: validationReportPublishedQuestionCount,
    dataIntegrityQuestionCount: Number(dataIntegrityReport?.stats?.questions_total || 0),
    validationReportPath: latestValidationReportPath
      ? path.relative(ROOT, latestValidationReportPath).replaceAll("\\", "/")
      : null,
  };

  const dataStatusMarkdown = [
    "# Generated Data Status",
    "",
    `Generated: ${generatedAt}`,
    "",
    "- Public question count: " + publicQuestionCount,
    "- Latest year in public bank: " + (manifest.latestYear || "Unknown"),
    "- Direct answer coverage: " + `${directAnswerCoverageCount}/${publicQuestionCount} (${(manifest.answerCoverage.estimatedCoverageRatio * 100).toFixed(1)}%)`,
    latestYearCoverage
      ? "- Latest year answer coverage: "
        + `${latestYearCoverage.label}: ${latestYearCoverage.covered}/${latestYearCoverage.total} (${(latestYearCoverage.estimatedCoverageRatio * 100).toFixed(1)}%)`
      : "- Latest year answer coverage: Unknown",
    "- Remote GateOverflow blob-image questions: " + remoteImageQuestionUids.size,
    "- Pipeline-state published question count: " + dataStatusJson.pipelineStatePublishedQuestionCount,
    "- Validation-report published question count: " + dataStatusJson.validationReportPublishedQuestionCount,
    "- Data-integrity report question count: " + dataStatusJson.dataIntegrityQuestionCount,
    "",
    "This file is generated by `scripts/build-public-artifacts.mjs`.",
  ].join("\n");

  const remoteImageReport = {
    generatedAt,
    totalQuestionsWithRemoteImages: remoteImageQuestionUids.size,
    sampleQuestions: remoteImageSamples,
  };

  fs.rmSync(DETAIL_SHARDS_DIR, { recursive: true, force: true });
  ensureDir(DETAIL_SHARDS_DIR);

  writeJson(path.join(PUBLIC_DIR, "question-bank-manifest.json"), manifest);
  writeJson(MOCK_CATALOG_PATH, mockCatalog);
  writeJson(path.join(PUBLIC_DIR, "question-search-index.json"), searchIndex);
  writeText(path.join(PUBLIC_DIR, "sitemap.xml"), buildSitemapXml(manifest, questions, generatedAt));
  writeText(path.join(PUBLIC_DIR, "robots.txt"), buildRobotsTxt());
  for (const [detailShardKey, payload] of detailShards.entries()) {
    writeJson(path.join(DETAIL_SHARDS_DIR, `${detailShardKey}.json`), payload);
  }
  writeJson(path.join(DOCS_GENERATED_DIR, "data-status.json"), dataStatusJson);
  writeText(path.join(DOCS_GENERATED_DIR, "DATA_STATUS.md"), `${dataStatusMarkdown}\n`);
  writeJson(path.join(REVIEW_DIR, "remote-image-report.json"), remoteImageReport);

  console.log(
    `[build-public-artifacts] Generated manifest, mock catalog, search index, and ${detailShards.size} detail shards for ${publicQuestionCount} questions`
  );
}

buildArtifacts();
