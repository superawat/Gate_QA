#!/usr/bin/env node

/**
 * scripts/qa/verify-simplified-solutions.mjs
 * -----------------------------------------
 * Comprehensive QA Verification:
 * Validates that all detailed solutions across all branches (EC, EE, ME, CE, CSE, DA)
 * are simplified, have zero removed section remnants, and preserve official answers.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SHARDS_DIR = path.join(ROOT, "public", "question-detail-shards");
const SOLUTIONS_DIR = path.join(ROOT, "data", "solutions");

const FORBIDDEN_PATTERNS = [
  /### 1\./i,
  /### 2\./i,
  /### 3\./i,
  /### 4\./i,
  /### 5\./i,
  /Key Concept & Formula/i,
  /Given Information & Problem Modeling/i,
  /Step-by-Step Derivation/i,
  /Option Analysis & Distractor Diagnostics/i,
  /Examiner Trap Alert/i,
  /Detailed 5-Block/i,
  /Detailed Pedagogical Solution/i,
  /GateQA Pedagogical Breakdown/i,
  /Parameter Setup:/i,
  /Initial Assessment:/i,
];

function verifySolutions() {
  console.log("========================================================");
  console.log("🔍 [QA VERIFICATION] Detailed Solutions Across All Branches");
  console.log("========================================================\n");

  let totalChecked = 0;
  let totalErrors = 0;

  // 1. Verify data/solutions/*.json
  for (const branch of ["ec", "ee", "me", "ce", "cse", "da"]) {
    const filePath = path.join(SOLUTIONS_DIR, `${branch}-v1.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const keys = Object.keys(data);
    let branchErrors = 0;

    for (const key of keys) {
      totalChecked++;
      const sol = data[key];
      const md = sol.solution_markdown || "";

      // Check forbidden patterns
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(md)) {
          console.error(`❌ [${branch.toUpperCase()} - ${key}] Matched forbidden pattern ${pattern}`);
          branchErrors++;
          totalErrors++;
          break;
        }
      }

      // Check that pro_tip is removed
      if (sol.pro_tip) {
        console.error(`❌ [${branch.toUpperCase()} - ${key}] pro_tip still present!`);
        branchErrors++;
        totalErrors++;
      }

      // Check answer preservation
      const ans = sol.verified_answer;
      if (ans && !sol.is_mta && ans !== "MTA") {
        const strAns = String(ans);
        if (!md.includes(strAns)) {
          console.warn(`⚠️ [${branch.toUpperCase()} - ${key}] Expected answer ${strAns} not clearly in markdown.`);
        }
      }
    }

    console.log(`✅ Verified ${keys.length} ${branch.toUpperCase()} solutions (Errors: ${branchErrors}).`);
  }

  // 2. Verify static shards in public/question-detail-shards/
  const shardFiles = fs.readdirSync(SHARDS_DIR).filter((f) => f.endsWith(".json"));
  let shardSolutionsChecked = 0;
  let shardErrors = 0;

  for (const file of shardFiles) {
    const shardPath = path.join(SHARDS_DIR, file);
    const shard = JSON.parse(fs.readFileSync(shardPath, "utf-8"));
    if (!shard.recordsByQuestionUid) continue;

    for (const [uid, q] of Object.entries(shard.recordsByQuestionUid)) {
      if (q.detailed_solution) {
        shardSolutionsChecked++;
        const md = q.detailed_solution.markdown || "";

        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(md)) {
            console.error(`❌ [Shard ${file} - ${uid}] Matched forbidden pattern ${pattern}`);
            shardErrors++;
            totalErrors++;
            break;
          }
        }

        if (q.detailed_solution.proTip) {
          console.error(`❌ [Shard ${file} - ${uid}] proTip still present in shard!`);
          shardErrors++;
          totalErrors++;
        }
      }
    }
  }

  console.log(`\n✅ Verified ${shardSolutionsChecked} questions with detailed solutions across ${shardFiles.length} shards (Shard Errors: ${shardErrors}).`);

  if (totalErrors === 0) {
    console.log("\n========================================================");
    console.log(`🎉 [SUCCESS] 100% of solutions simplified cleanly across all branches!`);
    console.log(`    Total checked: ${totalChecked} data solutions + ${shardSolutionsChecked} shard questions.`);
    console.log("========================================================\n");
    return true;
  } else {
    console.error(`\n❌ [FAILED] Found ${totalErrors} errors during verification.`);
    process.exit(1);
  }
}

verifySolutions();
