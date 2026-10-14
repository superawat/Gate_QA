#!/usr/bin/env node

/**
 * scripts/intake/crawl-extended-older-papers.mjs
 * ---------------------------------------------
 * Crawls complete 85-90 question GATE papers (2003-2008) across EC, EE, ME, CE
 * that were previously truncated at page 13 (Q65).
 * Mirrors newly discovered diagram images directly to local WebP files.
 */

import { crawlPaper } from "./crawl-practicepaper.mjs";
import { processAuditFilePath } from "../pipeline/mirror-branch-images.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const TARGET_YEARS = [2003, 2004, 2005, 2006, 2007, 2008];
const BRANCHES = ["ec", "ee", "me", "ce"];

async function run() {
  console.log("==========================================================");
  console.log("🚀 Crawling complete 2003-2008 papers for EC, EE, ME, CE");
  console.log("==========================================================\n");

  let totalQuestionsCrawled = 0;

  for (const branch of BRANCHES) {
    for (const year of TARGET_YEARS) {
      console.log(`\n>>> [START] ${branch.toUpperCase()} ${year} <<<`);
      try {
        const result = await crawlPaper(branch, year, null, 20);
        totalQuestionsCrawled += result.totalQuestions;

        // Mirror images
        const auditFile = path.join(ROOT, "audit", branch, `raw-${branch}-${year}.json`);
        await processAuditFilePath(auditFile);
        console.log(`>>> [DONE] ${branch.toUpperCase()} ${year} (${result.totalQuestions} Qs) <<<\n`);
      } catch (err) {
        console.error(`❌ Failed crawling ${branch.toUpperCase()} ${year}:`, err.message);
      }
    }
  }

  console.log("\n==========================================================");
  console.log(`🎉 Crawl complete! Total questions across 24 papers: ${totalQuestionsCrawled}`);
  console.log("==========================================================");
}

run().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
