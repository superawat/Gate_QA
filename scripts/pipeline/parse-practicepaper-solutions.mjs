#!/usr/bin/env node

/**
 * scripts/pipeline/parse-practicepaper-solutions.mjs
 * --------------------------------------------------
 * Master parser for detailed solutions from practicepaper.in across all branches:
 *   - CSE (Computer Science & Engineering)
 *   - DA (Data Science & Artificial Intelligence)
 *   - EC (Electronics & Communication Engineering)
 *   - EE (Electrical Engineering)
 *   - ME (Mechanical Engineering)
 *   - CE (Civil Engineering)
 *
 * Requirements:
 * 1. ONLY detailed solution text + mathematical derivations + detailed solution images (if existing).
 * 2. NO question text / stems.
 * 3. NO options.
 * 4. NO answer keys (no verified_answer, tolerance, or trailing answer statements).
 * 5. Full offline-first diagram mirroring (zero external hotlinks).
 *
 * Output:
 *   - data/solutions/practicepaper/{branch}-solutions.json
 *   - data/solutions/practicepaper/all-solutions.json
 *   - data/solutions/practicepaper/summary.json
 *
 * Usage:
 *   node scripts/pipeline/parse-practicepaper-solutions.mjs
 *   node scripts/pipeline/parse-practicepaper-solutions.mjs --branch=ec
 *   node scripts/pipeline/parse-practicepaper-solutions.mjs --branch=all
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const AUDIT_DIR = path.join(ROOT, "audit");
const OUT_DIR = path.join(ROOT, "data", "solutions", "practicepaper");
const SOLUTIONS_V1_DIR = path.join(ROOT, "data", "solutions");

const ALL_BRANCHES = ["cse", "da", "ec", "ee", "me", "ce"];

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let branch = "all";
  let updateShards = false;

  for (const arg of args) {
    if (arg.startsWith("--branch=")) {
      branch = arg.split("=")[1].toLowerCase();
    } else if (arg === "--update-shards") {
      updateShards = true;
    }
  }

  return { branch, updateShards };
}

/**
 * Normalizes LaTeX delimiters [latex] -> $ or $$
 */
export function sanitizeLatex(text = "") {
  if (!text || typeof text !== "string") return "";
  return text.replace(/\[latex\]([\s\S]*?)\[\/latex\]/gi, (_, formula) => {
    const trimmed = formula.trim();
    const isBlock = /\\begin\{|\\displaystyle|\\matrix|\\array|\\aligned|\\frac\{d\^2/i.test(trimmed);
    return isBlock ? `$$${trimmed}$$` : `$${trimmed}$`;
  });
}

/**
 * Extracts all question image URLs from question context (stem, options, or string/array/set).
 */
export function extractQuestionImages(questionContext = null) {
  const images = new Set();
  if (!questionContext) return images;

  if (questionContext instanceof Set) {
    for (const item of questionContext) {
      if (typeof item === "string") {
        images.add(item.trim());
        images.add(path.basename(item.trim()));
      }
    }
    return images;
  }

  if (Array.isArray(questionContext)) {
    for (const item of questionContext) {
      if (typeof item === "string") {
        const matches = [...item.matchAll(/<img\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"][^>]*>/gi)];
        for (const m of matches) {
          images.add(m[1].trim());
          images.add(path.basename(m[1].trim()));
        }
        if (!item.includes("<") && item.includes("/")) {
          images.add(item.trim());
          images.add(path.basename(item.trim()));
        }
      }
    }
    return images;
  }

  if (typeof questionContext === "object") {
    const text = `${questionContext.stem || ""} ${Array.isArray(questionContext.options) ? questionContext.options.join(" ") : ""}`;
    const matches = [...text.matchAll(/<img\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"][^>]*>/gi)];
    for (const m of matches) {
      images.add(m[1].trim());
      images.add(path.basename(m[1].trim()));
    }
    return images;
  }

  if (typeof questionContext === "string") {
    const matches = [...questionContext.matchAll(/<img\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"][^>]*>/gi)];
    for (const m of matches) {
      images.add(m[1].trim());
      images.add(path.basename(m[1].trim()));
    }
    return images;
  }

  return images;
}

/**
 * Strips question answer key statements from the end of the solution text.
 * Leaves the pure mathematical derivation and reasoning.
 * Excludes images that belong to the question stem/options so only solution-specific diagrams are captured.
 */
export function cleanSolutionMarkdown(rawSolution = "", questionContext = null) {
  if (!rawSolution || typeof rawSolution !== "string") {
    return { text: null, images: [] };
  }

  const questionImages = extractQuestionImages(questionContext);

  let text = sanitizeLatex(rawSolution).trim();

  // If it's only a GateOverflow link or empty text
  if (/^<a\s+href=[^>]+>Click here for detail solution/i.test(text) && text.length < 160) {
    return { text: null, images: [] };
  }

  // 1. Remove broken images that are known 404s on practicepaper
  text = text.replace(/<img\b[^>]*\bsrc\s*=\s*['"]\/wp-content\/uploads\/[^'"]+['"][^>]*>/gi, "");

  // 2. Remove question images (images present in the question stem/options) from solution body
  text = text.replace(/<img\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"][^>]*>/gi, (match, src) => {
    const trimmed = src.trim();
    if (questionImages.has(trimmed) || questionImages.has(path.basename(trimmed))) {
      return "";
    }
    return match;
  });

  // 3. Extract remaining authentic detailed solution images
  const images = [];
  const imgMatches = [...text.matchAll(/<img\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"][^>]*>/gi)];
  for (const m of imgMatches) {
    const src = m[1].trim();
    if (!images.includes(src)) {
      images.push(src);
    }
  }

  // 4. Remove GateOverflow link from bottom
  text = text.replace(/<a\s+href=['"][^'"]*gateoverflow\.in[^'"]*['"][^>]*>[\s\S]*?<\/a>/gi, "");

  // 5. Remove trailing answer statements
  text = text.replace(/<br\s*\/?>/gi, "\n");
  const lines = text.split("\n").map((l) => l.trim());
  const keptLines = [];

  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i];
    if (!l) continue;

    // Check if line is an answer key statement
    const isAnswerLine =
      /^(?:<[^>]+>)*\s*(?:(?:<b>)?(?:Answer|Ans|Correct\s+Option|Option)\s*[:=]|(?:Thus|Hence|Therefore)\s+(?:from\s+given\s+options\s*,?\s*)?(?:option\s*\([A-D]\)|the\s+correct\s+(?:answer|option)))/i.test(l) ||
      /^<b>\s*(?:Answer|Ans)\s*[:=]/i.test(l) ||
      /^(?:Therefore|Hence|Thus),?\s+the\s+correct\s+answer\s+is/i.test(l) ||
      /^Answer:\s*<b>/i.test(l);

    if (isAnswerLine && keptLines.length === 0) {
      // trailing answer key line, skip
      continue;
    }
    keptLines.unshift(l);
  }

  text = keptLines.join("\n\n").trim();

  // Clean excessive empty lines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  if (!text) {
    return { text: null, images: [] };
  }

  return { text, images };
}

/**
 * Resolves question UID for CSE and DA
 */
function resolveQuestionUid(branch, year, set, qNum, rawSolution = "") {
  if (branch === "cse" || branch === "da") {
    // Try to extract GateOverflow ID from solution link if present
    const goMatch = (rawSolution || "").match(/gateoverflow\.in\/(\d+)/i);
    if (goMatch) {
      return `go:${goMatch[1]}`;
    }
    // Fallback deterministic UID
    return `pp:${branch}:${year}:q${qNum}${set > 1 ? `-s${set}` : ""}`;
  }

  // EC, EE, ME, CE
  return `pp:${branch}:${year}:q${qNum}${set > 1 ? `-s${set}` : ""}`;
}

/**
 * Parses all detailed solutions for a specific branch
 */
export async function parseBranchSolutions(branch) {
  const branchLower = branch.toLowerCase();
  const dir = path.join(AUDIT_DIR, branchLower);

  if (!fs.existsSync(dir)) {
    console.warn(`[WARN] Audit directory not found for ${branchLower}: ${dir}`);
    return { branch: branchLower, totalQuestions: 0, withSolution: 0, withImages: 0, questions: {} };
  }

  const files = fs.readdirSync(dir).filter((f) => f.startsWith(`raw-${branchLower}-`) && f.endsWith(".json"));
  files.sort();

  console.log(`\n========================================================`);
  console.log(`📖 [PARSING DETAILED SOLUTIONS] GATE ${branchLower.toUpperCase()} (${files.length} papers)`);
  console.log(`========================================================`);

  const results = {};
  let totalQuestions = 0;
  let withSolutionCount = 0;
  let withImagesCount = 0;
  let totalImagesCount = 0;

  for (const file of files) {
    const rawData = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    const year = rawData.year;
    const set = rawData.set || 1;
    const qs = rawData.questions || [];

    for (const q of qs) {
      totalQuestions++;
      const qNum = q.qNum || q.number;
      const rawSol = q.rawSolution || q.solution || "";

      // Extract GateOverflow link if present
      const goMatch = rawSol.match(/href=['"](https?:\/\/gateoverflow\.in\/[^'"]+)['"]/i);
      const gateoverflowUrl = goMatch ? goMatch[1] : null;

      // Clean solution text and extract images (excluding images present in question stem/options)
      const { text: detailedSolution, images } = cleanSolutionMarkdown(rawSol, q);

      const questionUid = resolveQuestionUid(branchLower, year, set, qNum, rawSol);
      const examUid = `${branchLower}:${year}:set${set}:q${qNum}`;

      const hasDetailedSolution = Boolean(detailedSolution && detailedSolution.length > 5);

      if (hasDetailedSolution) {
        withSolutionCount++;
        if (images.length > 0) {
          withImagesCount++;
          totalImagesCount += images.length;
        }
      }

      // ONLY detailed solution + detailed solution images
      // NO question text, NO options, NO answer keys!
      results[questionUid] = {
        question_uid: questionUid,
        exam_uid: examUid,
        branch: branchLower,
        year,
        set,
        qNum,
        has_detailed_solution: hasDetailedSolution,
        detailed_solution: detailedSolution,
        images,
        ...(gateoverflowUrl ? { gateoverflow_url: gateoverflowUrl } : {}),
      };
    }
  }

  // Write branch output file
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${branchLower}-solutions.json`);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), "utf-8");

  console.log(`✅ GATE ${branchLower.toUpperCase()} Summary:`);
  console.log(`   • Total Questions: ${totalQuestions}`);
  console.log(`   • Detailed Solutions: ${withSolutionCount} (${((withSolutionCount / totalQuestions) * 100).toFixed(1)}%)`);
  console.log(`   • Solutions with Diagrams/Images: ${withImagesCount} (${totalImagesCount} total images)`);
  console.log(`   • Saved to: ${outFile}`);

  return {
    branch: branchLower,
    totalQuestions,
    withSolution: withSolutionCount,
    withImages: withImagesCount,
    totalImages: totalImagesCount,
    questions: results,
  };
}

/**
 * Main execution handler
 */
export async function main() {
  const { branch, updateShards } = parseArgs();
  const targetBranches = branch === "all" ? ALL_BRANCHES : [branch];

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    source: "practicepaper.in",
    branches: {},
    totals: {
      questions: 0,
      withSolution: 0,
      withImages: 0,
      totalImages: 0,
    },
  };

  const masterSolutions = {};

  for (const b of targetBranches) {
    const res = await parseBranchSolutions(b);
    summary.branches[b] = {
      totalQuestions: res.totalQuestions,
      withSolution: res.withSolution,
      withImages: res.withImages,
      totalImages: res.totalImages,
      coveragePercent: res.totalQuestions > 0 ? Number(((res.withSolution / res.totalQuestions) * 100).toFixed(1)) : 0,
    };
    summary.totals.questions += res.totalQuestions;
    summary.totals.withSolution += res.withSolution;
    summary.totals.withImages += res.withImages;
    summary.totals.totalImages += res.totalImages;

    Object.assign(masterSolutions, res.questions);
  }

  // Save summary
  const summaryFile = path.join(OUT_DIR, "summary.json");
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), "utf-8");

  // Save all-solutions file if all branches were parsed
  if (branch === "all") {
    const masterFile = path.join(OUT_DIR, "all-solutions.json");
    fs.writeFileSync(masterFile, JSON.stringify(masterSolutions, null, 2), "utf-8");
    console.log(`\n📁 Master solutions file saved: ${masterFile} (${Object.keys(masterSolutions).length} total items)`);
  }

  console.log(`\n========================================================`);
  console.log(`🎉 [PARSING COMPLETE] Grand Totals across ${targetBranches.map((b) => b.toUpperCase()).join(", ")}:`);
  console.log(`   • Total Questions Processed: ${summary.totals.questions}`);
  console.log(`   • Total Detailed Solutions: ${summary.totals.withSolution}`);
  console.log(`   • Total Solutions with Images: ${summary.totals.withImages}`);
  console.log(`   • Total Solution Images: ${summary.totals.totalImages}`);
  console.log(`   • Summary File: ${summaryFile}`);
  console.log(`========================================================\n`);

  return summary;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error("[FATAL ERROR]", err);
    process.exit(1);
  });
}
