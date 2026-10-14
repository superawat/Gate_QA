#!/usr/bin/env node

/**
 * scripts/intake/backfill-practicepaper-answers.mjs
 * ------------------------------------------------
 * Connects to practicepaper.in and backfills missing ansMin, ansMax,
 * correctSet, and tolerance across all 2014-2026 GATE papers in audit/.
 * Preserves 100% of existing local WebP images and full rawSolutions.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchQuizQuestions, applyRemoteAnswerData } from "./backfill-helper.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const AUDIT_DIR = path.join(ROOT, "audit");

const BRANCHES = ["ec", "ee", "me", "ce"];

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function run() {
  console.log(`========================================================`);
  console.log(`🚀 [BACKFILL] Starting PracticePaper Answer Backfill (2014–2026)`);
  console.log(`========================================================\n`);

  let totalPapersUpdated = 0;
  let totalQuestionsUpdated = 0;
  let totalNatUpdated = 0;
  let totalMsqUpdated = 0;

  for (const branch of BRANCHES) {
    const dir = path.join(AUDIT_DIR, branch);
    if (!fs.existsSync(dir)) continue;

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(`raw-${branch}-`) && f.endsWith(".json"))
      .sort();

    console.log(`\n📁 Checking GATE ${branch.toUpperCase()} (${files.length} papers)...`);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      if (data.year < 2014) continue; // Pre-2014 papers are 100% MCQ and already complete

      const questionsToFix = (data.questions || []).filter(
        (q) => q.rawAnswer === null || q.ansMin === undefined || q.correctSet === undefined
      );

      if (questionsToFix.length === 0) {
        continue;
      }

      const pageUrl = data.meta?.pageUrl;
      if (!pageUrl) {
        console.warn(`[WARN] No pageUrl for ${file}, skipping`);
        continue;
      }

      process.stdout.write(`Fetching ${branch.toUpperCase()} ${data.year} Set ${data.set || 1} (${pageUrl})... `);
      const remoteMap = await fetchQuizQuestions(pageUrl, 13);
      const remoteCount = Object.keys(remoteMap).length;

      if (remoteCount === 0) {
        console.log(`❌ Failed to fetch remote quiz data`);
        continue;
      }

      let paperModified = false;
      let paperQUpdated = 0;

      for (const q of data.questions) {
        const remoteQ = remoteMap[q.qNum];
        if (remoteQ) {
          const changed = applyRemoteAnswerData(q, remoteQ);
          if (changed) {
            paperModified = true;
            paperQUpdated++;
            if (q.type === "NAT" || q.ansMin !== undefined) totalNatUpdated++;
            if (q.type === "MSQ" || Array.isArray(q.correctSet)) totalMsqUpdated++;
          }
        }
      }

      if (paperModified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        console.log(`✅ Updated ${paperQUpdated} questions`);
        totalPapersUpdated++;
        totalQuestionsUpdated += paperQUpdated;
      } else {
        console.log(`(No changes needed)`);
      }

      // Small delay between papers
      await sleep(250);
    }
  }

  console.log(`\n========================================================`);
  console.log(`🎉 [COMPLETED] Answer Backfill Summary:`);
  console.log(`   - Papers updated: ${totalPapersUpdated}`);
  console.log(`   - Questions updated: ${totalQuestionsUpdated}`);
  console.log(`   - NAT ranges added: ${totalNatUpdated}`);
  console.log(`   - MSQ sets added: ${totalMsqUpdated}`);
  console.log(`========================================================\n`);
}

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
