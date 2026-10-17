#!/usr/bin/env node

/**
 * scripts/intake/crawl-cse-missing-solutions.mjs
 * ----------------------------------------------
 * Recrawls GATE CSE papers (2010–2021) from practicepaper.in to extract
 * full mathematical derivations and detailed solutions that were missing in
 * legacy audit files.
 *
 * Automatically mirrors diagrams to local WebP and updates audit/cse/ snapshots.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crawlPaper } from "./crawl-practicepaper.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const CSE_PAPERS = [
  { year: 2010, set: null },
  { year: 2011, set: null },
  { year: 2012, set: null },
  { year: 2013, set: null },
  { year: 2014, set: 1 },
  { year: 2014, set: 2 },
  { year: 2014, set: 3 },
  { year: 2015, set: 1 },
  { year: 2015, set: 2 },
  { year: 2015, set: 3 },
  { year: 2016, set: 1 },
  { year: 2016, set: 2 },
  { year: 2017, set: 1 },
  { year: 2017, set: 2 },
  { year: 2018, set: null },
  { year: 2019, set: null },
  { year: 2020, set: null },
  { year: 2021, set: 1 },
  { year: 2021, set: 2 },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`========================================================`);
  console.log(`🚀 [CSE SOLUTION REFRESH] Ingesting ${CSE_PAPERS.length} CSE papers (2010–2021)...`);
  console.log(`========================================================\n`);

  let totalQuestions = 0;

  for (let i = 0; i < CSE_PAPERS.length; i++) {
    const { year, set } = CSE_PAPERS[i];
    const paperKey = `cse-${year}${set ? `-s${set}` : ""}`;
    console.log(`\n[${i + 1}/${CSE_PAPERS.length}] Processing ${paperKey.toUpperCase()}...`);

    try {
      await crawlPaper("cse", year, set, 13);


      const filePath = path.join(ROOT, "audit", "cse", `raw-cse-${year}${set ? `-s${set}` : ""}.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        totalQuestions += data.questions?.length || 0;
      }

      await sleep(600);
    } catch (err) {
      console.error(`❌ Error crawling ${paperKey}:`, err.message);
    }
  }

  console.log(`\n========================================================`);
  console.log(`🎉 [COMPLETE] Ingested ${CSE_PAPERS.length} CSE papers (${totalQuestions} total questions).`);
  console.log(`========================================================\n`);
}

main().catch((err) => {
  console.error("[FATAL ERROR]", err);
  process.exit(1);
});
