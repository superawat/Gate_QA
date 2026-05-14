#!/usr/bin/env node

/**
 * 6.8.1 - Global Difficulty extraction.
 *
 * Computes a global difficulty score for each GateOverflow question UID
 * using:
 *   1) Community tags (easy/hard)
 *   2) Marks weight (one-mark/two-marks)
 *   3) Subject complexity heuristic
 *   4) Optional upvote metadata merge
 *
 * Output: public/data/global-difficulty.json
 *
 * Usage:
 *   node scripts/pipeline/extract-global-difficulty.mjs
 *   node scripts/pipeline/extract-global-difficulty.mjs --merge audit/gateoverflow-upvotes.json
 *   node scripts/pipeline/extract-global-difficulty.mjs --merge audit/gateoverflow-upvotes.json --pretty
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
  "../.."
);
const QUESTIONS_PATH = path.join(ROOT, "public", "questions-with-answers.json");
const DEFAULT_OUTPUT_PATH = path.join(ROOT, "public", "data", "global-difficulty.json");

const HARD_SUBJECTS = new Set([
  "theory-of-computation",
  "compiler-design",
  "computer-networks",
  "digital-logic",
]);

const MEDIUM_SUBJECTS = new Set([
  "algorithms",
  "operating-systems",
  "databases",
  "computer-organization",
  "co-and-architecture",
]);

const META_TAGS = new Set([
  "easy",
  "hard",
  "difficult",
  "one-mark",
  "two-marks",
  "2-marks",
  "marks-to-all",
]);

const LABELS = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractGateOverflowId(link = "") {
  const match = String(link || "")
    .trim()
    .match(/(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i);
  return match ? match[1] : null;
}

function buildUidFromLink(link = "") {
  const goId = extractGateOverflowId(link);
  return goId ? `go:${goId}` : null;
}

function normalizeUid(rawUid = "") {
  const value = String(rawUid || "").trim();
  if (!value) return null;
  if (/^go:\d+$/i.test(value)) {
    return value.toLowerCase();
  }
  if (/^\d+$/.test(value)) {
    return `go:${value}`;
  }
  const extracted = extractGateOverflowId(value);
  return extracted ? `go:${extracted}` : null;
}

function parseArgs(argv = []) {
  let mergePath = null;
  let outputPath = DEFAULT_OUTPUT_PATH;
  let pretty = false;

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--merge" && argv[i + 1]) {
      mergePath = path.resolve(ROOT, argv[i + 1]);
      i += 1;
      continue;
    }
    if (argv[i] === "--out" && argv[i + 1]) {
      outputPath = path.resolve(ROOT, argv[i + 1]);
      i += 1;
      continue;
    }
    if (argv[i] === "--pretty") {
      pretty = true;
    }
  }

  return { mergePath, outputPath, pretty };
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeUpvoteRecord(raw = {}) {
  const questionUpvotes = Math.max(0, Math.round(toNumber(
    raw.questionUpvotes ?? raw.question_upvotes ?? raw.question_votes ?? raw.qVotes ?? raw.qUpvotes
  )));
  const answerUpvotes = Math.max(0, Math.round(toNumber(
    raw.answerUpvotes ?? raw.answer_upvotes ?? raw.answer_votes ?? raw.totalAnswerUpvotes ?? raw.aVotes ?? raw.aUpvotes
  )));
  const maxAnswerUpvotes = Math.max(0, Math.round(toNumber(
    raw.maxAnswerUpvotes ?? raw.max_answer_upvotes ?? raw.topAnswerUpvotes ?? raw.highestAnswerUpvotes
  )));
  const selectedAnswerUpvotes = Math.max(0, Math.round(toNumber(
    raw.selectedAnswerUpvotes ?? raw.selected_answer_upvotes ?? raw.acceptedAnswerUpvotes
  )));
  const answerCount = Math.max(0, Math.round(toNumber(raw.answerCount ?? raw.answers)));
  const views = Math.max(0, Math.round(toNumber(raw.views ?? raw.viewCount ?? raw.viewsCount)));

  return {
    questionUpvotes,
    answerUpvotes,
    maxAnswerUpvotes,
    selectedAnswerUpvotes,
    answerCount,
    views,
  };
}

function pickUpvoteContainer(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }
  if (payload.records && typeof payload.records === "object") return payload.records;
  if (payload.byUid && typeof payload.byUid === "object") return payload.byUid;
  if (payload.by_uid && typeof payload.by_uid === "object") return payload.by_uid;
  if (payload.byQuestionUid && typeof payload.byQuestionUid === "object") return payload.byQuestionUid;
  if (payload.by_question_uid && typeof payload.by_question_uid === "object") return payload.by_question_uid;
  if (payload.upvotes && typeof payload.upvotes === "object") return payload.upvotes;
  return payload;
}

function loadUpvoteMap(mergePath) {
  if (!mergePath) {
    return { map: {}, loaded: false, records: 0 };
  }
  if (!fs.existsSync(mergePath)) {
    console.warn(`  [warn] Upvote file not found: ${mergePath}`);
    return { map: {}, loaded: false, records: 0 };
  }

  const payload = readJson(mergePath, {});
  const container = pickUpvoteContainer(payload);
  const map = {};

  for (const [rawUid, rawValue] of Object.entries(container || {})) {
    const uid = normalizeUid(rawUid);
    if (!uid || !rawValue || typeof rawValue !== "object") {
      continue;
    }
    map[uid] = normalizeUpvoteRecord(rawValue);
  }

  console.log(`  Loaded upvote records: ${Object.keys(map).length} (${mergePath})`);
  return {
    map,
    loaded: true,
    records: Object.keys(map).length,
  };
}

function resolveQuestionUid(question = {}) {
  const explicitUid = normalizeUid(question.question_uid || question.uid || "");
  if (explicitUid) return explicitUid;
  return buildUidFromLink(question.link);
}

function computeUpvoteSignal(upvote = null) {
  if (!upvote) return 0;
  const q = Math.max(0, toNumber(upvote.questionUpvotes, 0));
  const a = Math.max(0, toNumber(upvote.answerUpvotes, 0));
  const selected = Math.max(0, toNumber(upvote.selectedAnswerUpvotes, 0));
  const answerCount = Math.max(0, toNumber(upvote.answerCount, 0));
  const views = Math.max(0, toNumber(upvote.views, 0));

  const questionComponent = Math.log2(q + 1) * 8;
  const answerComponent = Math.log2(a + 1) * 4;
  const selectedComponent = Math.log2(selected + 1) * 2;
  const discussionComponent = answerCount >= 5 ? 10 : answerCount >= 3 ? 6 : answerCount >= 2 ? 3 : 0;
  const viewsComponent = Math.min(4, Math.log2((views / 1000) + 1) * 2);

  return Math.min(
    40,
    Math.max(0, Math.round(
      questionComponent + answerComponent + selectedComponent + discussionComponent + viewsComponent
    ))
  );
}

function computeGlobalDifficulty(question, upvoteMap = {}) {
  const tags = (Array.isArray(question.tags) ? question.tags : [])
    .map((tag) => String(tag || "").trim().toLowerCase())
    .filter(Boolean);
  const uid = resolveQuestionUid(question);
  const signals = [];
  let score = 50;

  if (tags.includes("easy")) {
    score -= 30;
    signals.push("tag:easy");
  } else if (tags.includes("hard") || tags.includes("difficult")) {
    score += 30;
    signals.push("tag:hard");
  }

  if (tags.includes("one-mark")) {
    score -= 10;
    signals.push("marks:1");
  } else if (tags.includes("two-marks") || tags.includes("2-marks")) {
    score += 10;
    signals.push("marks:2");
  }

  const subjectTags = tags.filter((tag) => !tag.startsWith("gate") && !META_TAGS.has(tag));
  const hasHardSubject = subjectTags.some((tag) => HARD_SUBJECTS.has(tag));
  const hasMediumSubject = subjectTags.some((tag) => MEDIUM_SUBJECTS.has(tag));
  if (hasHardSubject) {
    score += 5;
    signals.push("subject:hard");
  } else if (hasMediumSubject) {
    score += 2;
    signals.push("subject:medium");
  }

  let usedUpvotes = false;
  const mergedUpvote = uid ? upvoteMap[uid] : null;
  const inlineUpvote = question?.upvote_meta && typeof question.upvote_meta === "object"
    ? normalizeUpvoteRecord(question.upvote_meta)
    : null;
  const upvoteMeta = mergedUpvote || inlineUpvote;

  if (upvoteMeta) {
    usedUpvotes = true;
    const upvoteSignal = computeUpvoteSignal(upvoteMeta);
    score += upvoteSignal;
    signals.push(
      `upvotes:q${upvoteMeta.questionUpvotes}:a${upvoteMeta.answerUpvotes}:sel${upvoteMeta.selectedAnswerUpvotes}:ans${upvoteMeta.answerCount}:v${upvoteMeta.views}:s${upvoteSignal}`
    );
  }

  score = Math.max(0, Math.min(100, score));
  let label = LABELS.MEDIUM;
  if (score >= 70) label = LABELS.HARD;
  else if (score < 35) label = LABELS.EASY;

  return { score, label, signals, usedUpvotes };
}

function main() {
  const { mergePath, outputPath, pretty } = parseArgs(process.argv.slice(2));
  const questions = readJson(QUESTIONS_PATH, []);
  if (!Array.isArray(questions) || questions.length === 0) {
    console.error("No questions found in questions-with-answers.json");
    process.exit(1);
  }

  console.log("\n6.8.1 - Extract Global Difficulty\n");
  console.log(`  Questions: ${questions.length}`);

  const upvoteSource = loadUpvoteMap(mergePath);
  const upvoteMap = upvoteSource.map || {};

  const difficultyMap = {};
  const stats = { Easy: 0, Medium: 0, Hard: 0, skipped: 0, upvoteMatched: 0 };

  for (const question of questions) {
    const uid = resolveQuestionUid(question);
    if (!uid) {
      stats.skipped += 1;
      continue;
    }

    const result = computeGlobalDifficulty(question, upvoteMap);
    difficultyMap[uid] = {
      s: result.score,
      l: result.label[0],
      g: result.signals,
    };
    stats[result.label] += 1;
    if (result.usedUpvotes) {
      stats.upvoteMatched += 1;
    }
  }

  const output = {
    version: 2,
    generatedAt: new Date().toISOString(),
    questionCount: Object.keys(difficultyMap).length,
    distribution: {
      easy: stats.Easy,
      medium: stats.Medium,
      hard: stats.Hard,
    },
    upvoteCoverage: {
      mergedFileUsed: Boolean(upvoteSource.loaded),
      mergedRecordCount: upvoteSource.records,
      matchedQuestionCount: stats.upvoteMatched,
    },
    questions: difficultyMap,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const encoded = pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output);
  fs.writeFileSync(outputPath, encoded, "utf8");
  const sizeKb = (Buffer.byteLength(encoded, "utf8") / 1024).toFixed(1);

  console.log("\n  Distribution:");
  console.log(`    Easy:   ${stats.Easy}`);
  console.log(`    Medium: ${stats.Medium}`);
  console.log(`    Hard:   ${stats.Hard}`);
  console.log(`    Skipped (no UID): ${stats.skipped}`);
  console.log(`    Upvote matches:   ${stats.upvoteMatched}`);
  console.log(`\n  Wrote ${outputPath} (${sizeKb} KB)\n`);
}

main();
