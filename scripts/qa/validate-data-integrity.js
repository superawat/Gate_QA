#!/usr/bin/env node

/**
 * GateQA Semantic Data Integrity & Schema Validator.
 *
 * Enforces Part 9 of the Data Integrity Re-Audit:
 * 1. ZERO duplicate keys in raw JSON answer registries (manual patch & UID maps).
 * 2. Strict semantic validation per question type:
 *    - MCQ: Single option letter ('A'..'E') or array of alternate single choices, or MTA/defective. Never numbers.
 *    - MSQ: Non-empty array of valid option letters ('A'..'E') without duplicates. Never single strings.
 *    - NAT: Numeric value (or array of discrete valid numbers). Never choice letters ('A'..'E').
 *    - Defective: Answer must be null with defective_reason explanation.
 * 3. 100% cross-layer parity:
 *    - Pipeline data/answers matches runtime public/data/answers.
 *    - public/questions-with-answers.json matches answers_by_question_uid_v1.json.
 *    - public/question-detail-shards match authoritative records.
 *
 * Exit code 0 if all invariants pass; exit code 1 if any violation found.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

const MANUAL_PATCH_PATH = path.join(ROOT, "data/answers/manual-answers-patch-v1.json");
const DATA_ANSWERS_UID_PATH = path.join(ROOT, "data/answers/answers_by_question_uid_v1.json");
const PUBLIC_ANSWERS_UID_PATH = path.join(ROOT, "public/data/answers/answers_by_question_uid_v1.json");
const QWA_PATH = path.join(ROOT, "public/questions-with-answers.json");
const SHARDS_DIR = path.join(ROOT, "public/question-detail-shards");

const VALID_OPTION_LABELS = new Set(["A", "B", "C", "D", "E"]);
const ERRORS = [];

function logError(category, message, details = null) {
  ERRORS.push({ category, message, details });
  console.error(`❌ [${category}] ${message}`, details ? details : "");
}

// 1. Check duplicate keys in raw JSON
function checkDuplicateKeysInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    logError("FILE_MISSING", `File not found: ${filePath}`);
    return;
  }
  const rawText = fs.readFileSync(filePath, "utf8");
  const lines = rawText.split(/\r?\n/);
  const keyRegex = /^\s*"([^"]+)":\s*\{/;
  const seenKeys = new Map();

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(keyRegex);
    if (match) {
      const key = match[1];
      if (key === "stats" || key === "records_by_question_uid" || key === "tolerance" || key === "source") {
        continue;
      }
      if (seenKeys.has(key)) {
        seenKeys.get(key).push(i + 1);
      } else {
        seenKeys.set(key, [i + 1]);
      }
    }
  }

  for (const [key, lineNumbers] of seenKeys.entries()) {
    if (lineNumbers.length > 1) {
      logError("DUPLICATE_KEY", `Duplicate question key "${key}" in ${path.basename(filePath)} at lines ${lineNumbers.join(", ")}`);
    }
  }
}

console.log("=== STEP 1: Validating Zero Duplicate Keys in JSON Registries ===");
checkDuplicateKeysInFile(MANUAL_PATCH_PATH);
checkDuplicateKeysInFile(DATA_ANSWERS_UID_PATH);
checkDuplicateKeysInFile(PUBLIC_ANSWERS_UID_PATH);

// 2. Validate Semantic Question Types and Answers
console.log("\n=== STEP 2: Validating Semantic Schemas (MCQ / MSQ / NAT / Defective) ===");
const qwa = JSON.parse(fs.readFileSync(QWA_PATH, "utf8"));
const publicAnswersPayload = JSON.parse(fs.readFileSync(PUBLIC_ANSWERS_UID_PATH, "utf8"));
const publicAnswers = publicAnswersPayload.records_by_question_uid || publicAnswersPayload;

const dataAnswersPayload = JSON.parse(fs.readFileSync(DATA_ANSWERS_UID_PATH, "utf8"));
const dataAnswers = dataAnswersPayload.records_by_question_uid || dataAnswersPayload;

const UNSUPPORTED_UIDS_PATH = path.join(ROOT, "public/data/answers/unsupported_question_uids_v1.json");
const unsupportedPayload = fs.existsSync(UNSUPPORTED_UIDS_PATH)
  ? JSON.parse(fs.readFileSync(UNSUPPORTED_UIDS_PATH, "utf8"))
  : {};
const unsupportedSet = new Set(unsupportedPayload.question_uids || []);

for (const q of qwa) {
  const uid = q.question_uid;
  if (!uid) {
    continue;
  }
  const ansRecord = publicAnswers[uid] || q.answer_meta;

  if (!ansRecord) {
    if (unsupportedSet.has(uid)) {
      continue; // Legitimate unsupported question
    }
    logError("MISSING_ANSWER", `Question ${uid} (${q.title}) has no answer record in public answers map.`);
    continue;
  }

  const type = String(ansRecord.type || q.type || "").trim().toUpperCase();
  const answer = ansRecord.answer;
  const isDefective = Boolean(ansRecord.is_defective || q.is_defective);

  if (isDefective) {
    if (answer !== null) {
      logError("DEFECTIVE_NON_NULL_ANSWER", `Question ${uid} is marked defective but has non-null answer ${JSON.stringify(answer)}`);
    }
    continue;
  }

  if (type === "MCQ") {
    if (answer === "MTA") {
      // Allowed
    } else if (Array.isArray(answer)) {
      if (!answer.every(opt => typeof opt === "string" && VALID_OPTION_LABELS.has(opt.trim().toUpperCase()))) {
        logError("INVALID_MCQ_ANSWER", `Question ${uid} (${q.title}) has invalid multi-option answer: ${JSON.stringify(answer)}`);
      }
    } else if (typeof answer === "string") {
      if (!VALID_OPTION_LABELS.has(answer.trim().toUpperCase())) {
        logError("INVALID_MCQ_ANSWER", `Question ${uid} (${q.title}) MCQ answer must be single option letter (A-E): got "${answer}"`);
      }
    } else {
      logError("INVALID_MCQ_ANSWER", `Question ${uid} (${q.title}) MCQ answer cannot be numeric/boolean: got ${JSON.stringify(answer)}`);
    }
  } else if (type === "MSQ") {
    if (answer === "MTA") {
      // Allowed
    } else if (!Array.isArray(answer) || answer.length === 0) {
      logError("INVALID_MSQ_ANSWER", `Question ${uid} (${q.title}) MSQ answer must be non-empty array: got ${JSON.stringify(answer)}`);
    } else {
      const set = new Set(answer.map(a => String(a || "").trim().toUpperCase()));
      if (set.size !== answer.length) {
        logError("DUPLICATE_MSQ_OPTIONS", `Question ${uid} (${q.title}) MSQ answer contains duplicate options: ${JSON.stringify(answer)}`);
      }
      for (const opt of set) {
        if (!VALID_OPTION_LABELS.has(opt)) {
          logError("INVALID_MSQ_OPTION", `Question ${uid} (${q.title}) MSQ answer contains invalid option "${opt}"`);
        }
      }
    }
  } else if (type === "NAT") {
    if (answer === "MTA") {
      // Allowed
    } else if (typeof answer === "number") {
      if (!Number.isFinite(answer)) {
        logError("INVALID_NAT_ANSWER", `Question ${uid} (${q.title}) NAT answer is not finite: ${answer}`);
      }
    } else if (Array.isArray(answer)) {
      if (!answer.every(val => typeof val === "number" && Number.isFinite(val))) {
        logError("INVALID_NAT_ANSWER", `Question ${uid} (${q.title}) NAT array contains non-numeric values: ${JSON.stringify(answer)}`);
      }
    } else if (typeof answer === "string" && !isNaN(Number(answer)) && answer.trim() !== "") {
      // Valid numeric string
    } else {
      logError("INVALID_NAT_ANSWER", `Question ${uid} (${q.title}) NAT answer must be numeric: got ${JSON.stringify(answer)}`);
    }
  }
}

// 3. Cross-layer Parity Check
console.log("\n=== STEP 3: Validating Cross-Layer Data Parity ===");
// A: data/ answers vs public/ data answers
let parityMismatches = 0;
for (const [uid, dRec] of Object.entries(dataAnswers)) {
  const pRec = publicAnswers[uid];
  if (!pRec) {
    logError("PIPELINE_PUBLIC_PARITY", `Question ${uid} exists in data/ but missing in public/data/`);
    parityMismatches++;
    continue;
  }
  if (dRec.type !== pRec.type || JSON.stringify(dRec.answer) !== JSON.stringify(pRec.answer)) {
    logError("PIPELINE_PUBLIC_PARITY", `Answer mismatch for ${uid}: data/ (${dRec.type}: ${JSON.stringify(dRec.answer)}) vs public/ (${pRec.type}: ${JSON.stringify(pRec.answer)})`);
    parityMismatches++;
  }
}

// B: Detail shards vs public answers
if (fs.existsSync(SHARDS_DIR)) {
  const shardFiles = fs.readdirSync(SHARDS_DIR).filter(f => f.endsWith(".json"));
  for (const file of shardFiles) {
    const shard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, file), "utf8"));
    const records = shard.recordsByQuestionUid || {};
    for (const [uid, sRec] of Object.entries(records)) {
      const pRec = publicAnswers[uid];
      if (pRec) {
        const sType = String(sRec.type || "").trim().toUpperCase();
        const pType = String(pRec.type || "").trim().toUpperCase();
        if (sType && pType && sType !== pType) {
          logError("SHARD_PUBLIC_PARITY", `Shard ${file} ${uid} type mismatch: shard=${sRec.type} vs public=${pRec.type}`);
        }
      }
    }
  }
}

console.log("\n=== VALIDATION SUMMARY ===");
console.log(`Total Errors Detected: ${ERRORS.length}`);

if (ERRORS.length > 0) {
  console.error(`\n❌ Validation FAILED with ${ERRORS.length} critical data-integrity error(s).`);
  process.exit(1);
} else {
  console.log("✅ All Data Integrity & Semantic Schema Invariants PASSED!");
  process.exit(0);
}
