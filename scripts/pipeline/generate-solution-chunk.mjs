#!/usr/bin/env node

/**
 * scripts/pipeline/generate-solution-chunk.mjs
 * --------------------------------------------
 * Extracts questions missing detailed solutions for a specific branch, year, or subject,
 * and outputs an atomic chunk JSON file ready for web search and LLM-assisted derivation.
 *
 * Usage:
 *   node scripts/pipeline/generate-solution-chunk.mjs --branch=da --year=2024 --limit=10 --chunkId=CHUNK-DA-01
 *   node scripts/pipeline/generate-solution-chunk.mjs --branch=ec --limit=10 --chunkId=CHUNK-EC-MOD-01
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SHARDS_DIR = path.join(ROOT, "public", "question-detail-shards");
const DA_SHARDS_DIR = path.join(ROOT, "public", "data", "da", "shards");
const ANSWERS_PATH = path.join(ROOT, "data", "answers", "answers_by_question_uid_v1.json");
const CHUNKS_DIR = path.join(ROOT, "data", "solutions", "chunks");

// Parse CLI args
const args = process.argv.slice(2);
function getArg(key, defaultVal = null) {
  const match = args.find((a) => a.startsWith(`--${key}=`));
  if (match) return match.split("=")[1];
  return defaultVal;
}

const branch = (getArg("branch", "da") || "da").toLowerCase();
const targetYear = getArg("year", null);
const limit = parseInt(getArg("limit", "10"), 10);
const chunkId = getArg("chunkId", `CHUNK-${branch.toUpperCase()}-${Date.now().toString().slice(-4)}`);

// Load answer registry
let answersMap = {};
if (branch === "da") {
  const daAnswersPath = path.join(ROOT, "public", "data", "da", "answers-by-question-uid-v1.json");
  if (fs.existsSync(daAnswersPath)) {
    try {
      const daData = JSON.parse(fs.readFileSync(daAnswersPath, "utf-8"));
      answersMap = daData.records_by_question_uid || {};
    } catch (e) {
      console.warn("[WARN] Could not load DA answers map:", e.message);
    }
  }
} else if (fs.existsSync(ANSWERS_PATH)) {
  try {
    answersMap = JSON.parse(fs.readFileSync(ANSWERS_PATH, "utf-8"));
  } catch (e) {
    console.warn("[WARN] Could not load master answers map:", e.message);
  }
}

// Find questions missing solutions
const missingQuestions = [];

if (branch === "da") {
  if (fs.existsSync(DA_SHARDS_DIR)) {
    const files = fs.readdirSync(DA_SHARDS_DIR).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const year = file.replace(".json", "");
      if (targetYear && targetYear !== year && !year.includes(targetYear)) continue;
      const data = JSON.parse(fs.readFileSync(path.join(DA_SHARDS_DIR, file), "utf-8"));
      for (const [uid, q] of Object.entries(data.recordsByQuestionUid || {})) {
        const hasSol = !!(q.detailed_solution?.markdown && q.detailed_solution.markdown.trim().length > 30);
        if (!hasSol) {
          missingQuestions.push({
            uid,
            branch: "da",
            year,
            title: q.title || `GATE DA ${year}`,
            type: q.type || "MCQ",
            question: q.question,
            options: q.normalizedOptions || q.options || [],
            officialAnswer: answersMap[uid]?.answer || q.answer || "UNKNOWN",
            link: q.link || `https://gateoverflow.in`,
            taxonomy: q.taxonomy || { primary: { subjectLabel: q.subject || "Data Science & AI" } },
          });
        }
      }
    }
  }
} else {
  if (fs.existsSync(SHARDS_DIR)) {
    const files = fs.readdirSync(SHARDS_DIR).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      // Filter shard by branch
      const isTargetBranch =
        (branch === "cse" && !file.startsWith("gateec-") && !file.startsWith("gateee-") && !file.startsWith("gateme-") && !file.startsWith("gatece-") && !file.startsWith("ec-") && !file.startsWith("ee-") && !file.startsWith("me-") && !file.startsWith("ce-")) ||
        (branch === "ec" && (file.startsWith("gateec-") || file.startsWith("ec-"))) ||
        (branch === "ee" && (file.startsWith("gateee-") || file.startsWith("ee-"))) ||
        (branch === "me" && (file.startsWith("gateme-") || file.startsWith("me-"))) ||
        (branch === "ce" && (file.startsWith("gatece-") || file.startsWith("ce-")));

      if (!isTargetBranch) continue;
      if (targetYear && !file.includes(targetYear)) continue;

      let data;
      try {
        data = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, file), "utf-8"));
      } catch {
        continue;
      }

      for (const [uid, q] of Object.entries(data.recordsByQuestionUid || {})) {
        const hasSol = !!(q.detailed_solution?.markdown && q.detailed_solution.markdown.trim().length > 30);
        if (!hasSol) {
          missingQuestions.push({
            uid,
            branch,
            year: q.year || file.replace(".json", ""),
            title: q.title || `GATE ${branch.toUpperCase()}`,
            type: q.type || "MCQ",
            question: q.question,
            options: q.normalizedOptions || q.options || [],
            officialAnswer: answersMap[uid]?.answer || q.answer || "UNKNOWN",
            link: q.link || `https://${branch === "cse" ? "" : branch + "."}gateoverflow.in`,
            taxonomy: q.taxonomy || { primary: { subjectLabel: q.subject || branch.toUpperCase() } },
          });
        }
      }
    }
  }
}

const chunkSlice = missingQuestions.slice(0, limit);

console.log(`\n========================================================`);
console.log(`🔎 Found ${missingQuestions.length} questions missing solutions for branch "${branch}"`);
if (targetYear) console.log(`   Filter year: ${targetYear}`);
console.log(`📦 Slicing chunk "${chunkId}" with ${chunkSlice.length} questions`);
console.log(`========================================================\n`);

if (chunkSlice.length > 0) {
  const branchChunkDir = path.join(CHUNKS_DIR, branch);
  if (!fs.existsSync(branchChunkDir)) {
    fs.mkdirSync(branchChunkDir, { recursive: true });
  }

  const chunkPayload = {
    chunkId,
    branch,
    generatedAt: new Date().toISOString(),
    count: chunkSlice.length,
    remainingAfterChunk: missingQuestions.length - chunkSlice.length,
    questions: chunkSlice,
  };

  const chunkFilePath = path.join(branchChunkDir, `${chunkId.toLowerCase()}.json`);
  fs.writeFileSync(chunkFilePath, JSON.stringify(chunkPayload, null, 2), "utf-8");
  console.log(`✅ Saved chunk manifest to: ${chunkFilePath}`);
}
