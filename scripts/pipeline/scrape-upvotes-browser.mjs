#!/usr/bin/env node

/**
 * 6.8.1 — Scrape Upvote Metadata from GateOverflow using Playwright
 *
 * Uses a real browser to bypass 403 blocks.
 * Extracts vote metadata using the same Q2A selectors proven in
 * scripts/qa/backfill-gateoverflow-top-answers.mjs:
 *
 *   - Question vote: .qa-netvote-count-data (inside .qa-q-view)
 *   - Answer votes:  article.qa-a-list-item → .qa-netvote-count-data
 *   - Selected answer: article.qa-a-list-item-selected
 *   - Answer count:  count of article.qa-a-list-item
 *
 * Supports incremental batching:
 *   --limit N    → scrape at most N questions per run (default: 50)
 *   --resume     → skip UIDs already in the output file
 *   --delay MS   → ms between page loads (default: 3000)
 *
 * Output: audit/gateoverflow-upvotes.json
 *
 * After running, merge into global difficulty:
 *   node scripts/pipeline/extract-global-difficulty.mjs --merge audit/gateoverflow-upvotes.json
 *
 * Usage:
 *   node scripts/pipeline/scrape-upvotes-browser.mjs --limit 50 --resume
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
  "../.."
);
const QUESTIONS_PATH = path.join(ROOT, "public", "questions-with-answers.json");
const OUTPUT_PATH = path.join(ROOT, "audit", "gateoverflow-upvotes.json");

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

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Page Extraction (mirrors backfill-gateoverflow-top-answers.mjs selectors) ──

async function extractUpvoteData(page) {
  return page.evaluate(() => {
    const cleanText = (s) => (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

    // ── Question votes ──
    // Q2A puts the question vote in .qa-q-view .qa-netvote-count-data
    let questionUpvotes = 0;
    const qVoteEl =
      document.querySelector(".qa-q-view .qa-netvote-count-data") ||
      document.querySelector(".qa-q-view .qa-vote-count") ||
      document.querySelector(".qa-voting .qa-netvote-count-data");
    if (qVoteEl) {
      questionUpvotes = parseInt(cleanText(qVoteEl.textContent), 10) || 0;
    }

    // ── Answer votes ──
    // Same selector as backfill script line 182-213:
    //   article.qa-a-list-item → .qa-netvote-count-data
    const answerArticles = document.querySelectorAll("article.qa-a-list-item");
    const answerCount = answerArticles.length;
    let totalAnswerUpvotes = 0;
    let maxAnswerUpvotes = 0;
    let selectedAnswerUpvotes = 0;

    for (const article of answerArticles) {
      const voteEl = article.querySelector(".qa-netvote-count-data");
      const votes = voteEl ? (parseInt(cleanText(voteEl.textContent), 10) || 0) : 0;
      totalAnswerUpvotes += votes;
      maxAnswerUpvotes = Math.max(maxAnswerUpvotes, votes);

      if (article.classList.contains("qa-a-list-item-selected")) {
        selectedAnswerUpvotes = votes;
      }
    }

    // ── View count ──
    // Q2A shows views in .qa-view-count or in the page stats area
    let views = 0;
    const viewEl = document.querySelector(".qa-view-count, .qa-q-view-stats");
    if (viewEl) {
      const viewMatch = viewEl.textContent.match(/([\d,]+)\s*view/i);
      if (viewMatch) {
        views = parseInt(viewMatch[1].replace(/,/g, ""), 10) || 0;
      }
    }

    return {
      questionUpvotes,
      answerUpvotes: totalAnswerUpvotes,
      maxAnswerUpvotes,
      selectedAnswerUpvotes,
      answerCount,
      views,
    };
  });
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let limit = 50;
  let resume = false;
  let delayMs = 3000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
    }
    if (args[i] === "--resume") {
      resume = true;
    }
    if (args[i] === "--delay" && args[i + 1]) {
      delayMs = parseInt(args[i + 1], 10);
    }
  }

  console.log(`\n🔍 6.8.1 — Scrape GateOverflow Upvotes (Playwright)\n`);

  // Load existing data if resuming
  const existing = resume ? readJson(OUTPUT_PATH) || {} : {};
  const existingUids = new Set(Object.keys(existing));
  if (resume && existingUids.size > 0) {
    console.log(`  📂 Resuming: ${existingUids.size} already scraped`);
  }

  // Load questions
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  const toScrape = [];

  for (const q of questions) {
    const uid = buildUid(q.link);
    if (!uid || existingUids.has(uid)) continue;
    toScrape.push({ uid, link: q.link });
  }

  const batch = toScrape.slice(0, limit);
  console.log(`  📊 Batch: ${batch.length} questions (${toScrape.length} remaining total)`);
  console.log(`  ⏱  Delay: ${delayMs}ms between pages\n`);

  if (batch.length === 0) {
    console.log("  ✅ Nothing to scrape. All done!\n");
    return;
  }

  // Launch Microsoft Edge — headed mode so user can solve Cloudflare captcha on first load
  const browser = await chromium.launch({
    channel: "msedge",
    headless: false,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = { ...existing };
  let successCount = 0;
  let failCount = 0;
  let captchaSolved = false;

  try {
    for (let i = 0; i < batch.length; i++) {
      const { uid, link } = batch[i];
      const progress = `[${i + 1}/${batch.length}]`;

      try {
        await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });

        // On first page: wait for user to solve Cloudflare captcha if needed
        if (!captchaSolved) {
          console.log("  ⏳ Waiting for Cloudflare — solve captcha in the Edge window if prompted...");
          try {
            await page.waitForSelector(".qa-q-view, .qa-main-heading", { timeout: 60000 });
            captchaSolved = true;
            console.log("  ✅ Cloudflare passed!\n");
          } catch {
            console.log("  ⚠  Captcha timeout — trying to continue anyway...");
          }
        } else {
          // Subsequent pages — just wait for content
          await page.waitForSelector(".qa-q-view, .qa-main-heading", { timeout: 15000 }).catch(() => {});
        }

        // Brief render settle
        await page.waitForTimeout(1000);

        const metadata = await extractUpvoteData(page);
        results[uid] = metadata;
        successCount++;
        console.log(
          `  ${progress} ✓ ${uid} — qVotes:${metadata.questionUpvotes} aVotes:${metadata.answerUpvotes} best:${metadata.selectedAnswerUpvotes} ans:${metadata.answerCount} views:${metadata.views}`
        );
      } catch (err) {
        console.log(`  ${progress} ✗ ${uid} — ${err.message.slice(0, 80)}`);
        failCount++;
      }

      // Save progress every 10 questions
      if ((i + 1) % 10 === 0 || i === batch.length - 1) {
        writeJson(OUTPUT_PATH, results);
        console.log(`  💾 Saved (${Object.keys(results).length} total)\n`);
      }

      // Delay between requests
      if (i < batch.length - 1) {
        await sleep(delayMs);
      }
    }
  } finally {
    await browser.close();
  }

  // Final save
  writeJson(OUTPUT_PATH, results);

  console.log(`\n  ══════════════════════════════════════`);
  console.log(`  ✅ Batch complete`);
  console.log(`     Success: ${successCount}`);
  console.log(`     Failed:  ${failCount}`);
  console.log(`     Total scraped so far: ${Object.keys(results).length} / ${questions.length}`);
  console.log(`     Output: ${OUTPUT_PATH}`);
  console.log(`\n  Next steps:`);
  console.log(`     • Run again with --resume to continue: node scripts/pipeline/scrape-upvotes-browser.mjs --limit 100 --resume`);
  console.log(`     • Merge into difficulty: node scripts/pipeline/extract-global-difficulty.mjs --merge audit/gateoverflow-upvotes.json\n`);
}

main().catch((err) => {
  console.error(`\n❌ Scrape failed: ${err.message}`);
  process.exit(1);
});
