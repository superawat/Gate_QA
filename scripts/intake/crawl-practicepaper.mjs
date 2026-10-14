#!/usr/bin/env node

/**
 * scripts/intake/crawl-practicepaper.mjs
 * -------------------------------------
 * High-reliability JSON intake engine for practicepaper.in GATE papers.
 * Extracts questions, options, types (MCQ, MSQ, NAT), official answers,
 * and raw explanations directly from the embedded <script id='pp-quiz-data'> payload.
 *
 * Usage:
 *   node scripts/intake/crawl-practicepaper.mjs --branch=ec --year=2024
 *   node scripts/intake/crawl-practicepaper.mjs --branch=ec --year=2024 --pilot
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const DELAY_MS = 600;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export function parsePpQuizData(html) {
  const match = html.match(/<script\s+id=['"]pp-quiz-data['"][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (err) {
    console.error("[PARSER_ERR] Failed to parse pp-quiz-data JSON:", err.message);
    return null;
  }
}

export function sanitizeLatex(text = "") {
  if (!text || typeof text !== "string") return "";
  return text.replace(/\[latex\]([\s\S]*?)\[\/latex\]/gi, (_, formula) => {
    const trimmed = formula.trim();
    const isBlock = /\\begin\{|\\displaystyle|\\matrix|\\array|\\aligned|\\frac\{d\^2/i.test(trimmed);
    return isBlock ? `$$${trimmed}$$` : `$${trimmed}$`;
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    branch: "ec",
    year: 2024,
    set: null,
    pilot: false,
    maxPages: 20,
  };

  for (const arg of args) {
    if (arg.startsWith("--branch=")) opts.branch = arg.split("=")[1].toLowerCase();
    else if (arg.startsWith("--year=")) opts.year = parseInt(arg.split("=")[1], 10);
    else if (arg.startsWith("--set=")) opts.set = parseInt(arg.split("=")[1], 10);
    else if (arg === "--pilot") opts.pilot = true;
    else if (arg.startsWith("--max-pages=")) opts.maxPages = parseInt(arg.split("=")[1], 10);
  }

  return opts;
}

export function parsePaperUrl(url) {
  const match = url.match(/\/gate-([a-z]+)\/gate-[a-z]+-(\d{4})(?:-set-(\d+))?/i);
  if (!match) return null;
  return {
    branch: match[1].toLowerCase(),
    year: parseInt(match[2], 10),
    set: match[3] ? parseInt(match[3], 10) : null,
    baseUrl: url,
  };
}

export async function crawlPaper(branch, year, set = null, maxPages = 20, customBaseUrl = null) {
  const branchLower = branch.toLowerCase();
  const setSuffix = set ? `-set-${set}` : "";
  const baseUrl = customBaseUrl || `https://practicepaper.in/gate-${branchLower}/gate-${branchLower}-${year}${setSuffix}`;

  console.log(`\n========================================================`);
  console.log(`🚀 [CRAWLER] Starting intake for GATE ${branch.toUpperCase()} ${year}${set ? ` Set ${set}` : ""}`);
  console.log(`🔗 Base URL: ${baseUrl}`);
  console.log(`========================================================\n`);

  const allQuestions = [];
  let metaInfo = null;

  for (let page = 1; page <= maxPages; page++) {
    const pageUrl = page === 1 ? baseUrl : `${baseUrl}?page_no=${page}`;
    process.stdout.write(`Fetching page ${page}/${maxPages}... `);

    try {
      const res = await fetch(pageUrl, {
        headers: {
          "user-agent": USER_AGENT,
          referer: "https://practicepaper.in/",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!res.ok) {
        if (res.status === 404 && page > 1) {
          console.log(`(End of paper reached - HTTP 404)`);
          break;
        }
        console.log(`❌ HTTP ${res.status}`);
        break;
      }

      const html = await res.text();
      const quizData = parsePpQuizData(html);

      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        console.log(`(End of paper reached - no more questions on page ${page})`);
        break;
      }

      if (!metaInfo && quizData.meta) {
        metaInfo = quizData.meta;
      }

      const pageQuestions = quizData.questions;
      console.log(`✅ Extracted ${pageQuestions.length} questions`);

      for (const q of pageQuestions) {
        let rawAnswer = null;
        let tolerance = null;

        if (q.correct !== undefined && q.correct !== null) {
          rawAnswer = q.correct;
        } else if (Array.isArray(q.correctSet)) {
          rawAnswer = q.correctSet.map((idx) => ["A", "B", "C", "D", "E"][idx] || String(idx));
        } else if (q.ansMin !== undefined || q.ansMax !== undefined) {
          const min = q.ansMin !== undefined ? Number(q.ansMin) : Number(q.ansMax);
          const max = q.ansMax !== undefined ? Number(q.ansMax) : Number(q.ansMin);
          tolerance = { lower: min, upper: max };
          rawAnswer = min === max ? min : Number(((min + max) / 2).toFixed(4));
        }

        allQuestions.push({
          sourceId: q.id,
          qNum: q.number,
          type: q.type || (Array.isArray(q.options) && q.options.length > 0 ? (Array.isArray(q.correctSet) ? "MSQ" : "MCQ") : "NAT"),
          marks: q.marks || 1,
          stem: sanitizeLatex(q.text || ""),
          options: (q.options || []).map((opt) => sanitizeLatex(opt)),
          rawAnswer,
          correctSet: q.correctSet || null,
          ansMin: q.ansMin !== undefined ? q.ansMin : null,
          ansMax: q.ansMax !== undefined ? q.ansMax : null,
          tolerance,
          rawSolution: sanitizeLatex(q.solution || ""),
          tag1: q.tag1 || "",
          tag1_url: q.tag1_url || "",
          tag2: q.tag2 || "",
          tag2_url: q.tag2_url || "",
          branch: branch.toUpperCase(),
          year,
          set: set || 1,
        });
      }

      if (page < maxPages) {
        await sleep(DELAY_MS);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      break;
    }
  }

  // Deduplicate questions by qNum / sourceId just in case
  const seenIds = new Set();
  const dedupedQuestions = [];
  for (const q of allQuestions) {
    const key = q.sourceId || `${q.year}-${q.qNum}`;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      dedupedQuestions.push(q);
    }
  }

  // Sort by question number
  dedupedQuestions.sort((a, b) => a.qNum - b.qNum);

  // Write audit snapshot
  const outDir = path.join(ROOT, "audit", branchLower);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `raw-${branchLower}-${year}${set ? `-s${set}` : ""}.json`);

  const outputPayload = {
    branch: branch.toUpperCase(),
    year,
    set: set || 1,
    meta: metaInfo,
    crawledAt: new Date().toISOString(),
    totalQuestions: dedupedQuestions.length,
    stats: {
      mcq: dedupedQuestions.filter((q) => q.type === "MCQ").length,
      msq: dedupedQuestions.filter((q) => q.type === "MSQ").length,
      nat: dedupedQuestions.filter((q) => q.type === "NAT").length,
      marks1: dedupedQuestions.filter((q) => q.marks === 1).length,
      marks2: dedupedQuestions.filter((q) => q.marks === 2).length,
    },
    questions: dedupedQuestions,
  };

  fs.writeFileSync(outFile, JSON.stringify(outputPayload, null, 2), "utf-8");

  console.log(`\n--------------------------------------------------------`);
  console.log(`🎉 [SUCCESS] Crawled ${dedupedQuestions.length} questions for GATE ${branch.toUpperCase()} ${year}!`);
  console.log(`📁 Saved audit file: ${outFile}`);
  console.log(`📊 Statistics:`);
  console.log(`   • MCQ: ${outputPayload.stats.mcq}`);
  console.log(`   • MSQ: ${outputPayload.stats.msq}`);
  console.log(`   • NAT: ${outputPayload.stats.nat}`);
  console.log(`   • 1-Mark: ${outputPayload.stats.marks1}`);
  console.log(`   • 2-Mark: ${outputPayload.stats.marks2}`);
  console.log(`--------------------------------------------------------\n`);

  return outputPayload;
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith("crawl-practicepaper.mjs")) {
  const opts = parseArgs();
  const maxPages = opts.pilot ? 13 : opts.maxPages; // Complete 1 paper for pilot
  crawlPaper(opts.branch, opts.year, opts.set, maxPages)
    .then((result) => {
      if (result.questions.length > 0) {
        console.log(`Sample Question 1 Preview:`);
        const q1 = result.questions[0];
        console.log(`• Number: Q${q1.qNum} (${q1.type}, ${q1.marks} Mark)`);
        console.log(`• Tag 1: ${q1.tag1} | Tag 2: ${q1.tag2}`);
        console.log(`• Stem: ${q1.stem.slice(0, 160)}...`);
        console.log(`• Options count: ${q1.options.length}`);
        console.log(`• Answer Index: ${q1.rawAnswer}`);
        console.log(`• Solution Preview: ${q1.rawSolution.slice(0, 160)}...`);
      }
    })
    .catch((err) => {
      console.error("[FATAL]", err);
      process.exit(1);
    });
}
