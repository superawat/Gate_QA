#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const DETAIL_SHARDS_DIR = path.join(PUBLIC_DIR, "question-detail-shards");
const DOCS_GENERATED_DIR = path.join(ROOT, "docs", "generated");
const REVIEW_DIR = path.join(ROOT, "artifacts", "review");
const SITE_ORIGIN = "https://superawat.github.io/Gate_QA";
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
    slug: "legacy-other",
    label: "Legacy / Other",
    aliases: [
      "legacy-other",
      "legacy-out-of-syllabus",
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

function buildSitemapXml(manifest = {}, generatedAt = new Date().toISOString()) {
  const urls = new Set([
    buildCanonicalUrl("/"),
    buildCanonicalUrl("/practice"),
    buildCanonicalUrl("/mock"),
    buildCanonicalUrl("/history/mock-tests"),
  ]);

  const yearSets = Array.isArray(manifest.yearSets) ? manifest.yearSets : [];
  yearSets.forEach((entry) => {
    const yearSetKey = String(entry?.key || "").trim();
    if (!yearSetKey) {
      return;
    }
    urls.add(buildCanonicalUrl("/practice", { years: yearSetKey }));
  });

  const subjects = Array.isArray(manifest.subjects) ? manifest.subjects : [];
  subjects.forEach((entry) => {
    const slug = String(entry?.slug || "").trim();
    if (!slug || slug === "unknown") {
      return;
    }
    urls.add(buildCanonicalUrl("/practice", { subjects: slug }));
  });

  const lastModDate = String(generatedAt || "").split("T")[0];
  const sortedUrls = Array.from(urls).sort((left, right) => left.localeCompare(right));

  const rows = sortedUrls.map((url) => {
    const escapedUrl = escapeXml(url);
    return [
      "  <url>",
      `    <loc>${escapedUrl}</loc>`,
      `    <lastmod>${lastModDate}</lastmod>`,
      "  </url>",
    ].join("\n");
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
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${buildCanonicalUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
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
  return String(html || "")
    .replace(OPTION_LIST_RE, "")
    .replace(ALPHA_OPTION_LIST_RE, "")
    .replace(TRAILING_OPTION_LIST_RE, "")
    .replace(OPTION_BLOCK_RE, "")
    .replace(OPTION_LINE_RE, "")
    .replace(/(<br\s*\/?>|\s)+$/i, "")
    .trim();
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

function parseMockSectionPosition(question = {}) {
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
      const yearSet = parseYearSet(question);
      if (yearSet.set == null && yearSet.year >= 2010 && yearSet.year <= 2013) {
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

function buildMockCatalog(questions = [], answersByQuestionUid = {}) {
  const byQuestionUid = {};
  const paperGroups = new Map();

  questions.forEach((question) => {
    const questionUid = buildQuestionUid(question);
    const yearSet = parseYearSet(question);
    const paperPosition = parseMockSectionPosition(question);

    if (!yearSet.key || !paperPosition) {
      return;
    }

    const answerRecord = answersByQuestionUid[questionUid] || null;
    const answerType = String(answerRecord?.type || "").trim().toUpperCase();
    const type = MOCK_OBJECTIVE_TYPES.has(answerType) ? answerType : null;
    const marks = resolveMockMarks(paperPosition.section, paperPosition.orderIndex);
    const negativeMarks = type && marks ? resolveNegativeMarks(type, marks) : null;
    const scorable = Boolean(type && marks !== null);

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
    };

    byQuestionUid[questionUid] = meta;

    if (!paperGroups.has(yearSet.key)) {
      paperGroups.set(yearSet.key, {
        yearSetKey: yearSet.key,
        year: yearSet.year,
        set: yearSet.set,
        label: yearSet.label,
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
    const positionSet = paperPosition.section === "GA" ? group.gaPositions : group.csPositions;
    if (positionSet.has(paperPosition.orderIndex)) {
      group.hasDuplicatePosition = true;
    }
    positionSet.add(paperPosition.orderIndex);
    group.questionUids.push(questionUid);

    if (scorable) {
      group.scorableCandidateCount += 1;
      if (paperPosition.section === "GA") {
        group.scorableGaCount += 1;
      } else if (paperPosition.section === "CS") {
        group.scorableCsCount += 1;
      }
    }
  });

  const papers = Array.from(paperGroups.values())
    .map((group) => {
      const gaCount = group.gaPositions.size;
      const csCount = group.csPositions.size;
      const hasCompleteGaSection = hasCompletePaperSection(group.gaPositions, MOCK_SECTION_COUNTS.GA);
      const hasCompleteCsSection = hasCompletePaperSection(group.csPositions, MOCK_SECTION_COUNTS.CS);
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
        }));
      const paperReady =
        !group.hasDuplicatePosition
        && group.questionUids.length === MOCK_SECTION_COUNTS.GA + MOCK_SECTION_COUNTS.CS
        && hasCompleteGaSection
        && hasCompleteCsSection
        && group.scorableCandidateCount === MOCK_SECTION_COUNTS.GA + MOCK_SECTION_COUNTS.CS;
      let statusReason = "Release-ready.";

      if (group.hasDuplicatePosition) {
        statusReason = "Duplicate paper slots detected in the parsed question set.";
      } else if (group.questionUids.length !== MOCK_SECTION_COUNTS.GA + MOCK_SECTION_COUNTS.CS) {
        statusReason = `Parsed ${group.questionUids.length}/65 total questions for this paper.`;
      } else if (!hasCompleteGaSection || !hasCompleteCsSection) {
        statusReason = `Incomplete paper structure (${gaCount} GA / ${csCount} CS parsed).`;
      } else if (blockedQuestions.length > 0) {
        statusReason = `Missing verified answers for ${blockedQuestions.length} question${blockedQuestions.length === 1 ? "" : "s"}.`;
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
        scorableCount: group.scorableCandidateCount,
        scorableGaCount: group.scorableGaCount,
        scorableCsCount: group.scorableCsCount,
        missingScorableCount: Math.max(
          MOCK_SECTION_COUNTS.GA + MOCK_SECTION_COUNTS.CS - group.scorableCandidateCount,
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
  writeText(path.join(PUBLIC_DIR, "sitemap.xml"), buildSitemapXml(manifest, generatedAt));
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
