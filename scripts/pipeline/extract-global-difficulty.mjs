#!/usr/bin/env node

/**
 * 6.8.1 — Extract Global Difficulty from existing question metadata.
 *
 * Reads questions-with-answers.json and derives a global difficulty score
 * for every question based on community-tagged signals:
 *   - GateOverflow tags: "easy", "hard", "difficult"
 *   - Mark weight: "one-mark" → lighter, "two-marks" → harder
 *   - Subject complexity heuristic (optional, secondary signal)
 *
 * When upvote data is available (from scrape-upvotes.mjs), it can be
 * merged in to override/supplement the tag-based heuristic.
 *
 * Output: public/data/global-difficulty.json
 *   { "go:<id>": { score, label, signals }, ... }
 *
 * Usage:
 *   node scripts/pipeline/extract-global-difficulty.mjs
 *   node scripts/pipeline/extract-global-difficulty.mjs --merge upvotes.json
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
  "../.."
);
const QUESTIONS_PATH = path.join(ROOT, "public", "questions-with-answers.json");
const OUTPUT_DIR = path.join(ROOT, "public", "data");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "global-difficulty.json");

// ── Helpers ─────────────────────────────────────────────────────────────

function extractGateOverflowId(link = "") {
  const match = String(link || "")
    .trim()
    .match(/(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i);
  return match ? match[1] : null;
}

function buildUid(link) {
  const goId = extractGateOverflowId(link);
  return goId ? `go:${goId}` : null;
}

// Subjects that are inherently more conceptually challenging
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

// ── Scoring Logic ───────────────────────────────────────────────────────

/**
 * Compute a global difficulty score (0–100) for a question based on
 * available signals.
 *
 * Signal weights:
 *   - Community tag ("easy"/"hard"): strongest signal (±30)
 *   - Mark weight ("one-mark"/"two-marks"): moderate signal (±10)
 *   - Subject heuristic: weak signal (±5)
 *   - Upvote ratio (when available): strong signal (0–40)
 *
 * Base score starts at 50 (unknown).
 */
function computeGlobalDifficulty(question, upvoteData = null) {
  const tags = (question.tags || []).map((t) => t.toLowerCase().trim());
  const uid = buildUid(question.link);
  const signals = [];

  let score = 50; // neutral baseline

  // ── Signal 1: Community difficulty tag (strongest tag-based signal)
  if (tags.includes("easy")) {
    score -= 30;
    signals.push("tag:easy");
  } else if (tags.includes("hard") || tags.includes("difficult")) {
    score += 30;
    signals.push("tag:hard");
  }

  // ── Signal 2: Mark weight
  if (tags.includes("one-mark")) {
    score -= 10;
    signals.push("marks:1");
  } else if (tags.includes("two-marks") || tags.includes("2-marks")) {
    score += 10;
    signals.push("marks:2");
  }

  // ── Signal 3: Subject complexity heuristic
  const subjectTags = tags.filter(
    (t) =>
      !t.startsWith("gatecse") &&
      !t.startsWith("gate") &&
      !["easy", "hard", "difficult", "one-mark", "two-marks", "2-marks", "marks-to-all"].includes(t)
  );
  const hasHardSubject = subjectTags.some((t) => HARD_SUBJECTS.has(t));
  const hasMediumSubject = subjectTags.some((t) => MEDIUM_SUBJECTS.has(t));

  if (hasHardSubject) {
    score += 5;
    signals.push("subject:hard");
  } else if (hasMediumSubject) {
    score += 2;
    signals.push("subject:medium");
  }

  // ── Signal 4: Upvote data (when available from scrape-upvotes.mjs)
  if (upvoteData && uid && upvoteData[uid]) {
    const upvotes = upvoteData[uid];
    const qUpvotes = Number(upvotes.questionUpvotes) || 0;
    const aUpvotes = Number(upvotes.answerUpvotes) || 0;
    const views = Number(upvotes.views) || 0;
    const answerCount = Number(upvotes.answerCount) || 0;

    // High question upvotes → more discussed → often harder/tricky
    // High answer upvotes → clear explanation needed → often tricky
    // Many answers → controversial → harder
    const upvoteSignal = Math.min(40, Math.round(
      (Math.log2(qUpvotes + 1) * 8) +
      (Math.log2(aUpvotes + 1) * 4) +
      (answerCount > 3 ? 10 : answerCount > 1 ? 5 : 0)
    ));

    score += upvoteSignal;
    signals.push(`upvotes:q${qUpvotes}:a${aUpvotes}:v${views}:ans${answerCount}`);
  }

  // Clamp to 0–100
  score = Math.max(0, Math.min(100, score));

  // Derive label
  let label = "Medium";
  if (score >= 70) label = "Hard";
  else if (score < 35) label = "Easy";

  return { score, label, signals };
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
  // Parse args for optional upvote merge
  const args = process.argv.slice(2);
  let upvotePath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--merge" && args[i + 1]) {
      upvotePath = path.resolve(ROOT, args[i + 1]);
    }
  }

  let upvoteData = null;
  if (upvotePath && fs.existsSync(upvotePath)) {
    upvoteData = JSON.parse(fs.readFileSync(upvotePath, "utf8"));
    console.log(`  📊 Loaded upvote data from ${upvotePath}`);
  }

  // Read questions
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  console.log(`\n🔍 6.8.1 — Extract Global Difficulty\n`);
  console.log(`  Total questions: ${questions.length}`);

  // Build difficulty map
  const difficultyMap = {};
  const stats = { Easy: 0, Medium: 0, Hard: 0, skipped: 0 };

  for (const question of questions) {
    const uid = buildUid(question.link);
    if (!uid) {
      stats.skipped++;
      continue;
    }

    const result = computeGlobalDifficulty(question, upvoteData);
    difficultyMap[uid] = {
      s: result.score,       // score (0–100)
      l: result.label[0],    // label initial: "E", "M", "H"
      g: result.signals,     // signals array for debugging
    };
    stats[result.label]++;
  }

  console.log(`\n  📊 Distribution:`);
  console.log(`     Easy:   ${stats.Easy}`);
  console.log(`     Medium: ${stats.Medium}`);
  console.log(`     Hard:   ${stats.Hard}`);
  console.log(`     Skipped (no UID): ${stats.skipped}`);

  // Write output
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const output = {
    version: 1,
    generatedAt: new Date().toISOString(),
    questionCount: Object.keys(difficultyMap).length,
    distribution: {
      easy: stats.Easy,
      medium: stats.Medium,
      hard: stats.Hard,
    },
    questions: difficultyMap,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output), "utf8");
  const sizeKb = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(1);
  console.log(`\n  ✅ Written to ${OUTPUT_PATH} (${sizeKb} KB)`);
  console.log(`     ${Object.keys(difficultyMap).length} questions scored\n`);
}

main();
