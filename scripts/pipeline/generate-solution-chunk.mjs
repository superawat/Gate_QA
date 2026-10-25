#!/usr/bin/env node

/**
 * scripts/pipeline/generate-solution-chunk.mjs
 * --------------------------------------------
 * Extracts questions missing detailed solutions for a specific branch, year, or section,
 * and outputs an atomic, reproducible chunk JSON file ready for web search and LLM-assisted derivation.
 *
 * Enforces:
 *   - Deterministic sorting (year, set, qNum, UID)
 *   - Stable pagination (--offset, --limit)
 *   - Prevention of duplicate chunk assignments (via chunks/manifest.json)
 *   - Source-backed question stem, options, diagrams, and official answer keys
 *
 * Usage:
 *   node scripts/pipeline/generate-solution-chunk.mjs --branch=da --year=2024 --limit=5 --chunkId=CHUNK-PILOT-01
 *   node scripts/pipeline/generate-solution-chunk.mjs --branch=da --year=2024 --limit=25 --offset=0 --chunkId=CHUNK-DA-01
 *   node scripts/pipeline/generate-solution-chunk.mjs --branch=ee --section=ga --limit=25 --chunkId=CHUNK-EE-GA-01
 *   node scripts/pipeline/generate-solution-chunk.mjs --branch=cse --subject="Discrete Mathematics,Engineering Mathematics" --limit=25 --excludeUid=go:3733 --chunkId=CHUNK-CSE-MATH-12
 *   node scripts/pipeline/generate-solution-chunk.mjs --branch=cse --limit=25 --excludeUid=go:3733 --chunkId=CHUNK-CSE-NEXT-01
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SHARDS_DIR = path.join(ROOT, "public", "question-detail-shards");
const DA_SHARDS_DIR = path.join(ROOT, "public", "data", "da", "shards");
const CHUNKS_DIR = path.join(ROOT, "data", "solutions", "chunks");
const CHUNKS_MANIFEST_PATH = path.join(CHUNKS_DIR, "manifest.json");
const BACKLOG_PATH = path.join(ROOT, "data", "solutions", "reconciled-solution-backlog.json");

// CLI argument parsing
const args = process.argv.slice(2);
function getArg(key, defaultVal = null) {
  const match = args.find((a) => a.startsWith(`--${key}=`));
  if (match) return match.split("=")[1];
  return defaultVal;
}
const hasFlag = (flag) => args.includes(`--${flag}`);

const branch = (getArg("branch", "da") || "da").toLowerCase();
const targetYear = getArg("year", null) ? parseInt(getArg("year"), 10) : null;
const targetSection = getArg("section", null) ? getArg("section").toLowerCase() : null; // 'ga' | 'tech'
const subjectFilters = new Set(args
  .filter((arg) => arg.startsWith("--subject="))
  .flatMap((arg) => arg.slice("--subject=".length).split(","))
  .map((subject) => subject.trim().toLowerCase())
  .filter(Boolean));
const limit = parseInt(getArg("limit", "25"), 10);
const offset = parseInt(getArg("offset", "0"), 10);
const force = hasFlag("force");
const excludedUids = new Set(args
  .filter((arg) => arg.startsWith("--excludeUid="))
  .flatMap((arg) => arg.slice("--excludeUid=".length).split(","))
  .map((uid) => uid.trim())
  .filter(Boolean));
const chunkId = getArg("chunkId", `CHUNK-${branch.toUpperCase()}-${Date.now().toString().slice(-4)}`);

// Load or initialize chunks manifest
function loadChunksManifest() {
  if (fs.existsSync(CHUNKS_MANIFEST_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CHUNKS_MANIFEST_PATH, "utf-8"));
    } catch {
      return { version: "v1", chunks: {}, assignedUids: {} };
    }
  }
  return { version: "v1", chunks: {}, assignedUids: {} };
}

function saveChunksManifest(manifest) {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
  fs.writeFileSync(CHUNKS_MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
}

// 1. Ensure backlog is available
if (!fs.existsSync(BACKLOG_PATH)) {
  console.log("⚡ Backlog not found. Running baseline audit first...");
  const { runAudit } = await import("./audit-solution-inventory.mjs");
  runAudit();
}

const backlogData = JSON.parse(fs.readFileSync(BACKLOG_PATH, "utf-8"));
const chunksManifest = loadChunksManifest();

// 2. Filter backlog records
let candidates = (backlogData.missingQuestions || []).filter((q) => {
  if (excludedUids.has(q.uid)) return false;
  const assignedChunkId = chunksManifest.assignedUids?.[q.uid];
  if (assignedChunkId && assignedChunkId !== chunkId) return false;
  if (branch !== "all" && q.branch !== branch) return false;
  if (targetYear && q.year !== targetYear) return false;
  if (targetSection === "ga" && !q.isGA) return false;
  if (targetSection === "tech" && q.isGA) return false;
  if (subjectFilters.size && !subjectFilters.has(String(q.subject || "").trim().toLowerCase())) return false;
  return true;
});

// Deterministic sorting: Year (desc), Set (asc), Question Number (asc), UID (asc)
candidates.sort((a, b) => {
  if (b.year !== a.year) return b.year - a.year;
  if ((a.set || 1) !== (b.set || 1)) return (a.set || 1) - (b.set || 1);
  if ((a.qNum || 0) !== (b.qNum || 0)) return (a.qNum || 0) - (b.qNum || 0);
  return String(a.uid).localeCompare(String(b.uid));
});

// Apply offset and limit
const totalMatching = candidates.length;
const selectedBacklogSlice = candidates.slice(offset, offset + limit);

if (selectedBacklogSlice.length === 0) {
  console.log(`\n⚠️  No missing questions found matching branch="${branch}", year="${targetYear || 'all'}", section="${targetSection || 'all'}" (offset=${offset}).`);
  process.exit(0);
}

// 3. Load full question details from shards for selected questions
const shardCache = new Map();
function getShardData(shardName, isDa = false) {
  const dir = isDa ? DA_SHARDS_DIR : SHARDS_DIR;
  const fileName = isDa ? path.basename(shardName) : shardName;
  const filePath = path.join(dir, fileName);
  if (shardCache.has(filePath)) return shardCache.get(filePath);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      shardCache.set(filePath, data);
      return data;
    } catch {
      return null;
    }
  }
  return null;
}

const enrichedQuestions = [];

for (const item of selectedBacklogSlice) {
  const isDa = item.branch === "da";
  const shardData = getShardData(item.shardName, isDa);
  const qRecord = shardData?.recordsByQuestionUid?.[item.uid] || {};

  // Standardize GateOverflow direct link
  let goLink = qRecord.link || qRecord.solution_link || null;
  if (!goLink) {
    if (item.uid.startsWith("go:")) {
      const num = item.uid.replace("go:", "");
      goLink = `https://${item.branch === "cse" || item.branch === "da" ? "" : item.branch + "."}gateoverflow.in/${num}`;
    } else {
      const subdomain = item.branch === "cse" || item.branch === "da" ? "gateoverflow.in" : `${item.branch}.gateoverflow.in`;
      goLink = `https://${subdomain}`;
    }
  }

  enrichedQuestions.push({
    uid: item.uid,
    branch: item.branch,
    year: item.year,
    set: item.set || 1,
    qNum: item.qNum,
    title: item.title,
    type: item.type,
    section: item.section,
    subject: item.subject,
    subtopic: item.subtopic,
    officialAnswer: item.officialAnswer,
    questionHtml: qRecord.question || qRecord.questionHtml || "",
    options: qRecord.normalizedOptions || qRecord.options || [],
    goLink,
    images: Array.isArray(qRecord.images) ? qRecord.images : [],
    existingSolutionSnippet: qRecord.detailed_solution?.markdown ? qRecord.detailed_solution.markdown.slice(0, 100) : null,
    status: "QUEUED",
  });
}

// 4. Check for chunk file existence
const branchDir = path.join(CHUNKS_DIR, branch);
const chunkFileName = `${chunkId.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}.json`;
const chunkFilePath = path.join(branchDir, chunkFileName);

if (fs.existsSync(chunkFilePath) && !force) {
  console.error(`\n❌ Error: Chunk file already exists at ${chunkFilePath}.`);
  console.error(`   Pass --force to overwrite, or specify a unique --chunkId=CHUNK-XXX.\n`);
  process.exit(1);
}

// 5. Save chunk payload
fs.mkdirSync(branchDir, { recursive: true });

const chunkPayload = {
  chunkId,
  branch,
  year: targetYear || "all",
  section: targetSection || "all",
  generatedAt: new Date().toISOString(),
  count: enrichedQuestions.length,
  offset,
  totalMatchingInBacklog: totalMatching,
  remainingAfterSlice: Math.max(0, totalMatching - (offset + limit)),
  questions: enrichedQuestions,
};

fs.writeFileSync(chunkFilePath, JSON.stringify(chunkPayload, null, 2), "utf-8");

// 6. Update master chunk manifest
chunksManifest.chunks[chunkId] = {
  chunkId,
  branch,
  year: targetYear || "all",
  section: targetSection || "all",
  file: path.relative(ROOT, chunkFilePath),
  count: enrichedQuestions.length,
  createdAt: new Date().toISOString(),
  uids: enrichedQuestions.map((q) => q.uid),
};

for (const q of enrichedQuestions) {
  chunksManifest.assignedUids[q.uid] = chunkId;
}

saveChunksManifest(chunksManifest);

console.log(`\n========================================================`);
console.log(`🎯 [CHUNK GENERATED SUCCESSFULLY]`);
console.log(`   - Chunk ID:                ${chunkId}`);
console.log(`   - Branch:                  ${branch.toUpperCase()}`);
console.log(`   - Year / Section:          ${targetYear || 'All'} / ${targetSection || 'All'}`);
console.log(`   - Subject Filter:          ${subjectFilters.size ? [...subjectFilters].join(", ") : "All"}`);
console.log(`   - Questions Sliced:        ${enrichedQuestions.length} (Offset: ${offset})`);
console.log(`   - Total Remaining Backlog: ${chunkPayload.remainingAfterSlice}`);
console.log(`   - Saved Chunk Manifest:    ${chunkFilePath}`);
console.log(`========================================================\n`);

console.log(`Questions in this chunk:`);
enrichedQuestions.forEach((q, idx) => {
  console.log(`  ${idx + 1}. [${q.uid}] ${q.title} | ${q.type} | Key: ${q.officialAnswer}`);
  console.log(`     Link: ${q.goLink}`);
});
console.log("");
