#!/usr/bin/env node

/**
 * 6.8.1 - Scrape GateOverflow upvote metadata using Playwright.
 *
 * Why browser mode:
 * - GateOverflow is Cloudflare-protected; plain fetch usually returns 403.
 * - Headed session allows one-time manual challenge solve.
 *
 * Output format:
 * {
 *   "version": 1,
 *   "generatedAt": "...",
 *   "records": {
 *     "go:12345": {
 *       "questionUpvotes": 7,
 *       "answerUpvotes": 19,
 *       "maxAnswerUpvotes": 9,
 *       "selectedAnswerUpvotes": 8,
 *       "answerCount": 3,
 *       "views": 1240
 *     }
 *   }
 * }
 *
 * Usage:
 *   node scripts/pipeline/scrape-upvotes-browser.mjs --limit 100 --resume
 *   node scripts/pipeline/scrape-upvotes-browser.mjs --limit 50 --resume --delay 2500
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
  "../.."
);
const DEFAULT_QUESTIONS_PATH = path.join(ROOT, "public", "questions-with-answers.json");
const DEFAULT_OUTPUT_PATH = path.join(ROOT, "audit", "gateoverflow-upvotes.json");
const DEFAULT_PROFILE_DIR = path.join(ROOT, "audit", ".gateoverflow-browser-profile");

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function extractGateOverflowId(link = "") {
  const match = String(link || "")
    .trim()
    .match(/(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i);
  return match ? match[1] : null;
}

function buildUid(link = "") {
  const goId = extractGateOverflowId(link);
  return goId ? `go:${goId}` : null;
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseArgs(argv = []) {
  let limit = 50;
  let resume = false;
  let delayMs = 3000;
  let headless = false;
  let browserChannel = "msedge";
  let questionsPath = DEFAULT_QUESTIONS_PATH;
  let outputPath = DEFAULT_OUTPUT_PATH;
  let userDataDir = DEFAULT_PROFILE_DIR;
  let captchaTimeoutMs = 90_000;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--limit" && argv[i + 1]) {
      limit = Math.max(1, toInt(argv[i + 1], 50));
      i += 1;
      continue;
    }
    if (token === "--resume") {
      resume = true;
      continue;
    }
    if (token === "--delay" && argv[i + 1]) {
      delayMs = Math.max(0, toInt(argv[i + 1], 3000));
      i += 1;
      continue;
    }
    if (token === "--headless") {
      headless = true;
      continue;
    }
    if (token === "--channel" && argv[i + 1]) {
      browserChannel = String(argv[i + 1] || "").trim() || "msedge";
      i += 1;
      continue;
    }
    if (token === "--input" && argv[i + 1]) {
      questionsPath = path.resolve(ROOT, argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--output" && argv[i + 1]) {
      outputPath = path.resolve(ROOT, argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--user-data-dir" && argv[i + 1]) {
      userDataDir = path.resolve(ROOT, argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--captcha-timeout" && argv[i + 1]) {
      captchaTimeoutMs = Math.max(10_000, toInt(argv[i + 1], 90_000));
      i += 1;
      continue;
    }
  }

  return {
    limit,
    resume,
    delayMs,
    headless,
    browserChannel,
    questionsPath,
    outputPath,
    userDataDir,
    captchaTimeoutMs,
  };
}

function normalizeExistingPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { version: 1, generatedAt: null, records: {} };
  }
  if (payload.records && typeof payload.records === "object" && !Array.isArray(payload.records)) {
    return {
      version: Number(payload.version) || 1,
      generatedAt: payload.generatedAt || null,
      records: payload.records,
    };
  }
  return {
    version: 1,
    generatedAt: null,
    records: payload,
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function extractUpvoteData(page) {
  return page.evaluate(() => {
    const cleanText = (value) => String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const parseIntSafe = (value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    let questionUpvotes = 0;
    const questionVoteNode =
      document.querySelector(".qa-q-view .qa-netvote-count-data")
      || document.querySelector(".qa-q-view .qa-vote-count")
      || document.querySelector(".qa-voting .qa-netvote-count-data");
    if (questionVoteNode) {
      questionUpvotes = parseIntSafe(cleanText(questionVoteNode.textContent));
    }

    const answerRows = Array.from(document.querySelectorAll("article.qa-a-list-item"));
    const answerCount = answerRows.length;

    let answerUpvotes = 0;
    let maxAnswerUpvotes = 0;
    let selectedAnswerUpvotes = 0;
    for (const row of answerRows) {
      const voteNode = row.querySelector(".qa-netvote-count-data");
      const score = voteNode ? parseIntSafe(cleanText(voteNode.textContent)) : 0;
      answerUpvotes += score;
      maxAnswerUpvotes = Math.max(maxAnswerUpvotes, score);
      if (row.classList.contains("qa-a-list-item-selected")) {
        selectedAnswerUpvotes = score;
      }
    }

    let views = 0;
    const viewNode = document.querySelector(".qa-view-count, .qa-q-view-stats");
    if (viewNode) {
      const match = String(viewNode.textContent || "").match(/([\d,]+)\s*view/i);
      if (match) {
        views = parseIntSafe(match[1].replace(/,/g, ""));
      }
    }

    return {
      questionUpvotes,
      answerUpvotes,
      maxAnswerUpvotes,
      selectedAnswerUpvotes,
      answerCount,
      views,
    };
  });
}

async function waitForQuestionContent(page, timeoutMs) {
  try {
    await page.waitForSelector(".qa-q-view, .qa-main-heading", { timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const {
    limit,
    resume,
    delayMs,
    headless,
    browserChannel,
    questionsPath,
    outputPath,
    userDataDir,
    captchaTimeoutMs,
  } = options;

  console.log("\n6.8.1 - Scrape GateOverflow Upvotes (Browser)\n");
  console.log(`  Input:  ${questionsPath}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Limit:  ${limit}`);
  console.log(`  Resume: ${resume ? "yes" : "no"}`);
  console.log(`  Delay:  ${delayMs}ms`);
  console.log(`  Mode:   ${headless ? "headless" : "headed"} (${browserChannel})\n`);

  const questions = readJson(questionsPath, []);
  if (!Array.isArray(questions) || questions.length === 0) {
    console.error("No questions found to scrape.");
    process.exit(1);
  }

  const existingPayload = resume
    ? normalizeExistingPayload(readJson(outputPath, { records: {} }))
    : { version: 1, generatedAt: null, records: {} };
  const records = { ...(existingPayload.records || {}) };
  const done = new Set(Object.keys(records));

  const candidates = [];
  for (const question of questions) {
    const uid = buildUid(question?.link);
    const link = String(question?.link || "").trim();
    if (!uid || !link || done.has(uid)) continue;
    candidates.push({ uid, link });
  }

  const batch = candidates.slice(0, limit);
  console.log(`  Remaining unscripted: ${candidates.length}`);
  console.log(`  Batch size:           ${batch.length}\n`);

  if (batch.length === 0) {
    console.log("Nothing to scrape; output is already up to date.\n");
    return;
  }

  fs.mkdirSync(userDataDir, { recursive: true });

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: browserChannel,
    headless,
    viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || await context.newPage();

  let success = 0;
  let failed = 0;
  let challengeHandled = false;

  try {
    for (let i = 0; i < batch.length; i += 1) {
      const { uid, link } = batch[i];
      const label = `[${i + 1}/${batch.length}]`;

      try {
        await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60_000 });

        if (!challengeHandled) {
          console.log("  Waiting for first page challenge pass (if any)...");
          const ok = await waitForQuestionContent(page, captchaTimeoutMs);
          if (!ok) {
            console.log("  Could not confirm challenge pass; continuing with best effort.");
          } else {
            challengeHandled = true;
            console.log("  Challenge passed, scraping continues.");
          }
        } else {
          await waitForQuestionContent(page, 15_000);
        }

        await page.waitForTimeout(1000);
        const metadata = await extractUpvoteData(page);
        records[uid] = metadata;
        success += 1;

        console.log(
          `  ${label} ok ${uid} q:${metadata.questionUpvotes} a:${metadata.answerUpvotes} sel:${metadata.selectedAnswerUpvotes} ans:${metadata.answerCount} v:${metadata.views}`
        );
      } catch (error) {
        failed += 1;
        console.log(`  ${label} fail ${uid} ${String(error?.message || error).slice(0, 120)}`);
      }

      if ((i + 1) % 10 === 0 || i === batch.length - 1) {
        writeJson(outputPath, {
          version: 1,
          generatedAt: new Date().toISOString(),
          records,
        });
        console.log(`  Saved progress: ${Object.keys(records).length} total records\n`);
      }

      if (i < batch.length - 1 && delayMs > 0) {
        await sleep(delayMs);
      }
    }
  } finally {
    await context.close();
  }

  writeJson(outputPath, {
    version: 1,
    generatedAt: new Date().toISOString(),
    records,
  });

  console.log("  ----------------------------------------");
  console.log("  Batch complete");
  console.log(`  Success: ${success}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Total upvote records: ${Object.keys(records).length}`);
  console.log(`  Output: ${outputPath}`);
  console.log("\n  Next:");
  console.log("   1) Run again with --resume to continue next batch");
  console.log("   2) Merge signal into difficulty:");
  console.log("      node scripts/pipeline/extract-global-difficulty.mjs --merge audit/gateoverflow-upvotes.json\n");
}

main().catch((error) => {
  console.error(`\nScrape failed: ${error.message}`);
  process.exit(1);
});
