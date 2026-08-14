import fs from "node:fs";
import path from "node:path";
import {
  DA_BANK_PATH,
  DA_DATA_DIR,
  PUBLIC_DIR,
  readJson,
  writeJson,
  ensureDir,
  cleanText,
} from "./da-utils.mjs";
import { mirrorDaImages } from "./mirror-da-images.mjs";
import { buildTrackYearSetKey } from "../../src/utils/examTrack.js";

const DA_MANIFEST_PATH = path.join(DA_DATA_DIR, "manifest.json");
const DA_SEARCH_INDEX_PATH = path.join(DA_DATA_DIR, "search-index.json");
const DA_SHARDS_DIR = path.join(DA_DATA_DIR, "shards");
const DA_ANSWERS_PATH = path.join(DA_DATA_DIR, "answers-by-question-uid-v1.json");
const DA_MOCK_CATALOG_PATH = path.join(PUBLIC_DIR, "mock_catalog_da_v1.json");

const SUBJECT_LABELS = {
  "artificial-intelligence": "Artificial Intelligence",
  "calculus-and-optimization": "Calculus and Optimization",
  "database-management-and-warehousing": "Database Management and Warehousing",
  "programming-data-structures-and-algorithms": "Programming & DSA",
  "linear-algebra": "Linear Algebra",
  "machine-learning": "Machine Learning",
  "probability-and-statistics": "Probability and Statistics",
  "programming-in-python": "Programming & DSA",
  algorithms: "Programming & DSA",
  "general-aptitude": "General Aptitude",
};

const SUBJECT_ALIASES = {
  "data-structures": "programming-data-structures-and-algorithms",
  "programming-in-python": "programming-data-structures-and-algorithms",
  algorithms: "programming-data-structures-and-algorithms",
  "data-science-and-artificial-intelligence": "artificial-intelligence",
};

function extractGateOverflowId(link = "") {
  return String(link || "").match(
    /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
  )?.[1] || null;
}

function getCategory(question) {
  const tag = (question?.tags || []).find((value) => /^gateda-\d{4}$/i.test(String(value || "")));
  return String(tag || question?.year || "").match(/(\d{4})/)?.[1] || "";
}

function getSubjectSlug(question) {
  const rawSlug = String((question?.tags || []).find((value) => {
    const tag = String(value || "").toLowerCase();
    return tag && !/^gateda-\d{4}$/.test(tag) && !["one-mark", "two-marks", "mcq", "msq", "nat"].includes(tag) && !/^question-\d+$/.test(tag);
  }) || "uncategorized");
  return SUBJECT_ALIASES[rawSlug] || rawSlug;
}

function getQuestionNumber(question) {
  return String(question?.title || "").match(/Question\s*:\s*(\d+)/i)?.[1] || "";
}

function getQuestionUid(question) {
  const category = getCategory(question);
  const questionNumber = getQuestionNumber(question);
  if (category === "2026" && questionNumber) {
    return `da:2026:set1:main:q${questionNumber}`;
  }

  const gateOverflowId = extractGateOverflowId(question?.link);
  if (gateOverflowId) {
    return `go:${gateOverflowId}`;
  }
  return category && questionNumber
    ? `da:${category}:set1:main:q${questionNumber}`
    : String(question?.link || question?.title || "");
}

function getShardKey(category) {
  const year = Number(category);
  return Number.isFinite(year) ? String(year) : "other";
}

function buildPreview(question) {
  const text = cleanText(question?.question || "");
  return text.length > 180 ? `${text.slice(0, 179).trimEnd()}…` : text;
}

function sameGeneratedContent(left, right) {
  const strip = (value) => {
    if (Array.isArray(value)) return value.map(strip);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "generatedAt").map(([key, entry]) => [key, strip(entry)]));
    }
    return value;
  };
  return JSON.stringify(strip(left)) === JSON.stringify(strip(right));
}

export async function buildDaPublicArtifacts() {
  await mirrorDaImages();
  const questions = readJson(DA_BANK_PATH, null);
  if (!Array.isArray(questions) || questions.length === 0) {
    return false;
  }

  const generatedAt = new Date().toISOString();
  const answerPayload = readJson(DA_ANSWERS_PATH, {});
  const answersByQuestionUid = answerPayload?.records_by_question_uid || {};
  const categories = new Map();
  const subjectCounts = new Map();
  const searchQuestions = questions.map((question) => {
    const category = getCategory(question);
    const detailShardKey = getShardKey(category);
    const entry = categories.get(category) || {
      key: category,
      track: "da",
      yearSetKey: `${category}-s1`,
      yearSetIdentity: buildTrackYearSetKey("da", category, 1),
      legacyKey: `${category}-s1`,
      label: `GATE DA ${category}`,
      year: Number(category),
      count: 0,
      detailShardKey,
    };
    entry.count += 1;
    categories.set(category, entry);

    const subjectSlug = getSubjectSlug(question);
    const subjectLabel = SUBJECT_LABELS[subjectSlug] || subjectSlug;
    subjectCounts.set(subjectSlug, {
      slug: subjectSlug,
      label: subjectLabel,
      count: (subjectCounts.get(subjectSlug)?.count || 0) + 1,
    });

    return {
      question_uid: getQuestionUid(question),
      exam_uid: getQuestionUid(question),
      title: question.title,
      category,
      track: "da",
      yearSetKey: `${category}-s1`,
      yearSetIdentity: buildTrackYearSetKey("da", category, 1),
      year: Number(category),
      subjectSlug,
      subjectLabel,
      type: (question.tags || []).find((tag) => ["mcq", "msq", "nat"].includes(String(tag || "").toLowerCase()))?.toUpperCase() || "UNKNOWN",
      marks: (question.tags || []).includes("two-marks") ? 2 : 1,
      link: question.link,
      preview: buildPreview(question),
      searchText: [question.title, subjectLabel, category, ...(question.tags || []), cleanText(question.question || "")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      tags: Array.isArray(question.tags) ? question.tags : [],
      detailShardKey,
    };
  });

  const shards = new Map();
  for (const question of questions) {
    const category = getCategory(question);
    const shardKey = getShardKey(category);
    if (!shards.has(shardKey)) {
      shards.set(shardKey, {
        generatedAt,
        shardKey,
        category,
        questionCount: 0,
        recordsByQuestionUid: {},
      });
    }
    const shard = shards.get(shardKey);
    shard.questionCount += 1;
    shard.recordsByQuestionUid[getQuestionUid(question)] = {
      ...question,
      track: "da",
      yearSetKey: `${category}-s1`,
      yearSetIdentity: buildTrackYearSetKey("da", category, 1),
    };
  }

  const manifest = {
    version: "da-v1",
    generatedAt,
    questionCount: questions.length,
    categories: [...categories.values()].sort((left, right) => right.year - left.year),
    subjects: [...subjectCounts.values()].sort((left, right) => right.count - left.count),
    answerCoverage: {
      total: questions.length,
      covered: questions.filter((question) => {
        return Boolean(answersByQuestionUid[getQuestionUid(question)]);
      }).length,
    },
  };

  const searchIndex = {
    version: "da-v1",
    generatedAt,
    questionCount: questions.length,
    questions: searchQuestions,
  };

  const mockByQuestionUid = {};
  const mockPapers = [];
  for (const category of categories.values()) {
    const year = Number(category.year);
    const paperQuestions = questions
      .filter((question) => getCategory(question) === String(year))
      .sort((left, right) => Number(getQuestionNumber(left)) - Number(getQuestionNumber(right)));
    paperQuestions.forEach((question, index) => {
      const questionUid = getQuestionUid(question);
      const type = String((question.tags || []).find((tag) => ["mcq", "msq", "nat"].includes(String(tag || "").toLowerCase())) || "").toUpperCase();
      const marks = (question.tags || []).includes("two-marks") ? 2 : 1;
      const answerRecord = answersByQuestionUid[questionUid] || null;
      mockByQuestionUid[questionUid] = {
        questionUid,
        yearSetKey: `${year}-s1`,
        yearSetIdentity: buildTrackYearSetKey("da", year, 1),
        track: "da",
        orderIndex: index + 1,
        section: index < 10 ? "GA" : "CS",
        title: question.title,
        type,
        marks,
        negativeMarks: type === "MCQ" ? (marks === 1 ? 0.3333333333 : 0.6666666667) : 0,
        paperReady: true,
        scorable: Boolean(answerRecord),
        autoAwarded: false,
        source: "gateda",
      };
    });
    mockPapers.push({
      yearSetKey: `${year}-s1`,
      yearSetIdentity: buildTrackYearSetKey("da", year, 1),
      track: "da",
      year,
      set: 1,
      label: `GATE DA ${year}`,
      paperReady: paperQuestions.length === 65,
      gaCount: Math.min(10, paperQuestions.length),
      csCount: Math.max(0, paperQuestions.length - 10),
      requiredQuestionCount: 65,
      requiredGaCount: 10,
      requiredCsCount: 55,
      durationMinutes: 180,
      scorableCount: paperQuestions.filter((question) => Boolean(answersByQuestionUid[getQuestionUid(question)])).length,
      scorableGaCount: paperQuestions.slice(0, 10).filter((question) => Boolean(answersByQuestionUid[getQuestionUid(question)])).length,
      scorableCsCount: paperQuestions.slice(10).filter((question) => Boolean(answersByQuestionUid[getQuestionUid(question)])).length,
      missingScorableCount: paperQuestions.filter((question) => !answersByQuestionUid[getQuestionUid(question)]).length,
      statusReason: paperQuestions.length === 65 ? "Release-ready." : "Incomplete paper.",
      blockedQuestions: [],
      source: "gateda",
    });
  }
  const mockCatalog = {
    generatedAt,
    version: "da-mock-v1",
    papers: mockPapers.sort((left, right) => right.year - left.year),
    byQuestionUid: mockByQuestionUid,
    scorableQuestionUids: Object.entries(mockByQuestionUid).filter(([, meta]) => meta.scorable).map(([uid]) => uid),
  };

  const existingManifest = readJson(DA_MANIFEST_PATH, null);
  if (existingManifest && sameGeneratedContent(existingManifest, manifest)) {
    manifest.generatedAt = existingManifest.generatedAt;
    for (const shard of shards.values()) shard.generatedAt = existingManifest.generatedAt;
    searchIndex.generatedAt = existingManifest.generatedAt;
  }

  const existingCatalog = readJson(DA_MOCK_CATALOG_PATH, null);
  if (existingCatalog && sameGeneratedContent(existingCatalog, mockCatalog)) {
    mockCatalog.generatedAt = existingCatalog.generatedAt;
  }

  writeJson(DA_MOCK_CATALOG_PATH, mockCatalog);

  ensureDir(DA_SHARDS_DIR);
  for (const fileName of fs.readdirSync(DA_SHARDS_DIR, { withFileTypes: true })) {
    if (fileName.isFile() && fileName.name.endsWith(".json")) {
      fs.unlinkSync(path.join(DA_SHARDS_DIR, fileName.name));
    }
  }
  writeJson(DA_MANIFEST_PATH, manifest);
  writeJson(DA_SEARCH_INDEX_PATH, searchIndex);
  for (const [shardKey, shard] of shards) {
    writeJson(path.join(DA_SHARDS_DIR, `${shardKey}.json`), shard);
  }

  console.log(`[build-da] Generated DA manifest, search index, and ${shards.size} shards for ${questions.length} questions`);
  return true;
}

if (import.meta.url === `file://${process.argv[1].replaceAll("\\", "/")}`) {
  buildDaPublicArtifacts().catch((error) => {
    console.error(`[build-da] ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}
