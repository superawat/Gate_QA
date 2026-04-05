#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const DETAIL_SHARDS_DIR = path.join(PUBLIC_DIR, "question-detail-shards");
const DOCS_GENERATED_DIR = path.join(ROOT, "docs", "generated");
const REVIEW_DIR = path.join(ROOT, "artifacts", "review");

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
];

const SUBJECT_TAG_LOOKUP = new Map();
for (const subject of SUBJECTS) {
  for (const alias of subject.aliases) {
    SUBJECT_TAG_LOOKUP.set(alias, subject);
  }
}

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
    String(question.year || ""),
    String(question.title || ""),
    String(question.link || ""),
  ];

  for (const candidate of candidates) {
    const match = candidate.match(/(?:gate(?:cse|it|da)?[- ]?)(\d{4})(?:[- |]*set[- ]?(\d+))?/i);
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

function inferSubject(question = {}, yearSet = null) {
  const title = String(question.title || "");
  if (/\|\s*GA\s*\|/i.test(title) || /Question:\s*GA-/i.test(title)) {
    return SUBJECT_TAG_LOOKUP.get("ga");
  }

  const normalizedTags = Array.isArray(question.tags)
    ? question.tags.map((tag) => normalizeToken(tag))
    : [];

  for (const tag of normalizedTags) {
    const subject = SUBJECT_TAG_LOOKUP.get(tag);
    if (subject) {
      return subject;
    }
  }

  if (yearSet?.year && /general aptitude/i.test(title)) {
    return SUBJECT_TAG_LOOKUP.get("ga");
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
  const subjectCountMap = new Map();

  const searchIndex = questions.map((question) => {
    const questionUid = buildQuestionUid(question);
    questionUidSet.add(questionUid);

    const yearSet = parseYearSet(question);
    const subject = inferSubject(question, yearSet);
    const plainText = stripHtmlToText(question.question || "");
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
    },
    remoteImages: {
      questionCount: remoteImageQuestionUids.size,
      sampleSize: remoteImageSamples.length,
    },
    dataRevision:
      String(pipelineState?.lastRunAt || "").trim() ||
      generatedAt,
  };

  const dataStatusJson = {
    generatedAt,
    publicQuestionCount,
    manifestQuestionCount: manifest.questionCount,
    latestYear: manifest.latestYear,
    directAnswerCoverageCount,
    directAnswerCoverageRatio: manifest.answerCoverage.estimatedCoverageRatio,
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
  writeJson(path.join(PUBLIC_DIR, "question-search-index.json"), searchIndex);
  for (const [detailShardKey, payload] of detailShards.entries()) {
    writeJson(path.join(DETAIL_SHARDS_DIR, `${detailShardKey}.json`), payload);
  }
  writeJson(path.join(DOCS_GENERATED_DIR, "data-status.json"), dataStatusJson);
  writeText(path.join(DOCS_GENERATED_DIR, "DATA_STATUS.md"), `${dataStatusMarkdown}\n`);
  writeJson(path.join(REVIEW_DIR, "remote-image-report.json"), remoteImageReport);

  console.log(
    `[build-public-artifacts] Generated manifest, search index, and ${detailShards.size} detail shards for ${publicQuestionCount} questions`
  );
}

buildArtifacts();
