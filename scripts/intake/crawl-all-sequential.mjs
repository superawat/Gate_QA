#!/usr/bin/env node

/**
 * scripts/intake/crawl-all-sequential.mjs
 * ---------------------------------------
 * Master sequential intake runner for overnight background execution.
 * Sequentially crawls and mirrors all discovered papers for EC, EE, ME, and CE.
 *
 * Features:
 *   - Checkpoint-based resumption: skips already completed papers.
 *   - Automatic error recovery: if a paper 404s, logs and continues.
 *   - Immediate WebP asset mirroring after each paper.
 *   - Detailed progress log written to `audit/overnight-crawl.log`.
 *
 * Usage:
 *   node scripts/intake/crawl-all-sequential.mjs
 *   node scripts/intake/crawl-all-sequential.mjs --branch=ec
 *   node scripts/intake/crawl-all-sequential.mjs --from=2018 --to=2026
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crawlPaper, parsePaperUrl } from "./crawl-practicepaper.mjs";
import { processAuditFile } from "../pipeline/mirror-branch-images.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CHECKPOINT_FILE = path.join(ROOT, "audit", "crawler-checkpoint.json");
const LOG_FILE = path.join(ROOT, "audit", "overnight-crawl.log");
const DISCOVERED_FILE = path.join(ROOT, "audit", "discovered-papers.json");

const DEFAULT_BRANCHES = ["cse", "da", "ec", "ee", "me", "ce"];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    branches: DEFAULT_BRANCHES,
    fromYear: 1987,
    toYear: 2026,
    limit: null,
  };
  for (const arg of args) {
    if (arg.startsWith("--branch=")) {
      const b = arg.split("=")[1].toLowerCase();
      opts.branches = b === "all" ? DEFAULT_BRANCHES : [b];
    } else if (arg.startsWith("--from=")) {
      opts.fromYear = parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--to=")) {
      opts.toYear = parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--limit=")) {
      opts.limit = parseInt(arg.split("=")[1], 10);
    }
  }
  return opts;
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, line, "utf-8");
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf-8"));
    } catch {
      return { completed: [] };
    }
  }
  return { completed: [] };
}

function saveCheckpoint(completedList) {
  fs.mkdirSync(path.dirname(CHECKPOINT_FILE), { recursive: true });
  fs.writeFileSync(
    CHECKPOINT_FILE,
    JSON.stringify({ completed: completedList, lastUpdated: new Date().toISOString() }, null, 2),
    "utf-8"
  );
}

function loadDiscoveredCatalog() {
  if (fs.existsSync(DISCOVERED_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DISCOVERED_FILE, "utf-8"));
    } catch {
      return null;
    }
  }
  return null;
}

async function runSequential() {
  const opts = parseArgs();
  log("========================================================");
  log("🌙 [SEQUENTIAL INTAKE & ASSET MIRROR] Starting Master Intake");
  log(`📋 Branches: ${opts.branches.join(", ").toUpperCase()}`);
  log(`📅 Years: ${opts.toYear} down to ${opts.fromYear}`);
  log("========================================================");

  const checkpoint = loadCheckpoint();
  const completedSet = new Set(checkpoint.completed || []);
  const discovered = loadDiscoveredCatalog();

  let processedCount = 0;

  for (const branch of opts.branches) {
    log(`\n==================>>> PROCESSING ${branch.toUpperCase()} <<<==================`);

    let paperList = [];
    if (discovered && discovered[branch]) {
      paperList = discovered[branch].map(parsePaperUrl).filter(Boolean);
      paperList.sort((a, b) => b.year - a.year || (b.set || 0) - (a.set || 0));
    } else {
      for (let y = opts.toYear; y >= opts.fromYear; y--) {
        paperList.push({ branch, year: y, set: null, baseUrl: null });
      }
    }

    paperList = paperList.filter((p) => p.year >= opts.fromYear && p.year <= opts.toYear);

    for (const paper of paperList) {
      if (opts.limit && processedCount >= opts.limit) {
        log(`[LIMIT REACHED] Processed ${processedCount} papers. Halting.`);
        return;
      }

      const paperKey = `${paper.branch}-${paper.year}${paper.set ? `-s${paper.set}` : ""}`;
      if (completedSet.has(paperKey)) {
        log(`[SKIP] Already completed: GATE ${paper.branch.toUpperCase()} ${paper.year}${paper.set ? ` Set ${paper.set}` : ""}`);
        continue;
      }

      try {
        log(`[START] Ingesting GATE ${paper.branch.toUpperCase()} ${paper.year}${paper.set ? ` Set ${paper.set}` : ""}...`);
        const result = await crawlPaper(paper.branch, paper.year, paper.set, 20, paper.baseUrl);

        if (result && result.questions && result.questions.length > 0) {
          log(`[MIRROR] Mirroring WebP diagrams for ${paperKey}...`);
          try {
            await processAuditFile(paper.branch, paper.year, paper.set);
          } catch (mirrorErr) {
            log(`[WARN] Mirror error on ${paperKey}: ${mirrorErr.message}`);
          }

          completedSet.add(paperKey);
          saveCheckpoint(Array.from(completedSet));
          processedCount++;
          log(`[DONE] ✅ Saved GATE ${paper.branch.toUpperCase()} ${paper.year}${paper.set ? ` Set ${paper.set}` : ""} (${result.questions.length} Qs)`);
        } else {
          log(`[INFO] No questions found for ${paperKey} (HTTP 404 or empty).`);
          completedSet.add(paperKey);
          saveCheckpoint(Array.from(completedSet));
        }
      } catch (err) {
        log(`[WARN] Issue on ${paperKey}: ${err.message}. Continuing to next paper...`);
      }
    }
  }

  log("\n========================================================");
  log("🎉 [COMPLETED] Sequential crawl run finished!");
  log(`📊 Total papers completed in checkpoint: ${completedSet.size}`);
  log("========================================================");
}

runSequential().catch((err) => {
  log(`[FATAL ERROR] ${err.stack || err.message}`);
  process.exit(1);
});
