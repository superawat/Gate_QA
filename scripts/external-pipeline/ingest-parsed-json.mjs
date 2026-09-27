#!/usr/bin/env node

/**
 * scripts/external-pipeline/ingest-parsed-json.mjs
 *
 * Validates and merges newly parsed external exam JSON datasets (e.g. ISRO 2024/2025)
 * into GateQA's authoritative data directories:
 *   - data/isro/isro-<year>.json & public/data/isro/isro-<year>.json
 *   - data/isro/isro-all.json & public/data/isro/isro-all.json
 *   - data/isro/answers-isro.json & public/data/isro/answers-isro.json
 *
 * Usage:
 *   node scripts/external-pipeline/ingest-parsed-json.mjs <path_to_json>
 * Example:
 *   node scripts/external-pipeline/ingest-parsed-json.mjs data/isro/isro-2024.json
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_ISRO = path.join(ROOT, "data", "isro");
const PUBLIC_ISRO = path.join(ROOT, "public", "data", "isro");
const IMAGES_DIR = path.join(ROOT, "public", "question-images", "external", "isro");

const VALID_SUBJECTS = new Set([
  "algorithms",
  "toc",
  "compiler",
  "os",
  "dbms",
  "cn",
  "coa",
  "digital-logic",
  "discrete-math",
  "engg-math",
  "general-aptitude",
  "other",
]);

function validateQuestion(q, idx) {
  const errors = [];
  if (!q.question_uid) errors.push(`Question #${idx}: missing question_uid`);
  if (!q.exam_uid) errors.push(`Question #${idx}: missing exam_uid`);
  if (!q.title) errors.push(`Question #${idx}: missing title`);
  if (!q.question || typeof q.question !== "string" || !q.question.trim()) {
    errors.push(`Question #${idx}: empty or invalid question text`);
  }
  if (!["MCQ", "MSQ", "NAT", "MTA"].includes(q.type)) {
    errors.push(`Question #${idx}: invalid type ${q.type}`);
  }
  if (q.type === "MCQ" || q.type === "MSQ") {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`Question #${idx}: options must be an array with at least 2 items`);
    } else {
      for (const opt of q.options) {
        if (!opt.label || !opt.html) {
          errors.push(`Question #${idx}: option missing label or html`);
        }
      }
    }
  }
  if (!VALID_SUBJECTS.has(q.subject)) {
    errors.push(`Question #${idx}: subject "${q.subject}" not in canonical taxonomy`);
  }

  // Check image references
  const imgMatches = [...(q.question || "").matchAll(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi)];
  for (const m of imgMatches) {
    const src = m[1];
    if (src.startsWith("/question-images/external/isro/")) {
      const filename = path.basename(src);
      const fullPath = path.join(IMAGES_DIR, filename);
      if (!fs.existsSync(fullPath)) {
        errors.push(`Question #${idx}: referenced image missing locally: ${src}`);
      }
    }
  }

  return errors;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node scripts/external-pipeline/ingest-parsed-json.mjs <path_to_json>");
    process.exit(1);
  }

  const inputFile = path.resolve(ROOT, args[0]);
  if (!fs.existsSync(inputFile)) {
    console.error(`[ERROR] File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log(`[INFO] Reading and validating: ${inputFile}`);
  let questions;
  try {
    questions = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  } catch (err) {
    console.error(`[ERROR] JSON syntax error in ${inputFile}: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(questions)) {
    console.error(`[ERROR] Root JSON structure must be an Array of question objects.`);
    process.exit(1);
  }

  console.log(`[INFO] Validating ${questions.length} questions...`);
  let allErrors = [];
  questions.forEach((q, idx) => {
    const errors = validateQuestion(q, idx + 1);
    allErrors.push(...errors);
  });

  if (allErrors.length > 0) {
    console.error(`\n[VALIDATION FAILED] Found ${allErrors.length} errors:`);
    allErrors.slice(0, 20).forEach((e) => console.error(`  - ${e}`));
    if (allErrors.length > 20) console.error(`  ... and ${allErrors.length - 20} more errors.`);
    process.exit(1);
  }

  console.log(`[SUCCESS] All ${questions.length} questions passed schema and integrity validation.`);

  // Determine year
  const firstYear = questions[0].origin_year;
  const targetYearFile = `isro-${firstYear}.json`;

  // 1. Write individual year file in both locations
  fs.mkdirSync(DATA_ISRO, { recursive: true });
  fs.mkdirSync(PUBLIC_ISRO, { recursive: true });

  const dataYearPath = path.join(DATA_ISRO, targetYearFile);
  const publicYearPath = path.join(PUBLIC_ISRO, targetYearFile);
  fs.writeFileSync(dataYearPath, JSON.stringify(questions, null, 2), "utf8");
  fs.writeFileSync(publicYearPath, JSON.stringify(questions, null, 2), "utf8");
  console.log(`[SAVED] ${dataYearPath}`);
  console.log(`[SAVED] ${publicYearPath}`);

  // 2. Merge into isro-all.json
  const allPath = path.join(DATA_ISRO, "isro-all.json");
  let existingAll = [];
  if (fs.existsSync(allPath)) {
    try {
      existingAll = JSON.parse(fs.readFileSync(allPath, "utf8"));
    } catch {
      existingAll = [];
    }
  }

  // Remove existing entries with same question_uid to allow clean re-ingestion
  const newUids = new Set(questions.map((q) => q.question_uid));
  const filteredAll = existingAll.filter((q) => !newUids.has(q.question_uid));
  const mergedAll = [...filteredAll, ...questions];

  // Sort by year, then question number
  mergedAll.sort((a, b) => {
    if (a.origin_year !== b.origin_year) return a.origin_year - b.origin_year;
    const numA = parseInt((a.question_uid.match(/q(\d+)/i) || [])[1] || 0, 10);
    const numB = parseInt((b.question_uid.match(/q(\d+)/i) || [])[1] || 0, 10);
    return numA - numB;
  });

  fs.writeFileSync(allPath, JSON.stringify(mergedAll, null, 2), "utf8");
  fs.writeFileSync(path.join(PUBLIC_ISRO, "isro-all.json"), JSON.stringify(mergedAll, null, 2), "utf8");
  console.log(`[MERGED] isro-all.json now contains ${mergedAll.length} total questions.`);

  // 3. Update answers-isro.json
  const answersPath = path.join(DATA_ISRO, "answers-isro.json");
  let existingAnswers = {
    exam: "ISRO",
    totalQuestions: 0,
    generatedAt: new Date().toISOString(),
    records_by_question_uid: {},
  };
  if (fs.existsSync(answersPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(answersPath, "utf8"));
      if (parsed.records_by_question_uid) {
        existingAnswers = parsed;
      }
    } catch {
      // ignore
    }
  }

  // Clean any accidental top-level question keys
  for (const k of Object.keys(existingAnswers)) {
    if (k.startsWith("isro:cs:")) {
      delete existingAnswers[k];
    }
  }

  if (!existingAnswers.records_by_question_uid) {
    existingAnswers.records_by_question_uid = {};
  }

  for (const q of questions) {
    if (q.answer !== undefined && q.answer !== null) {
      existingAnswers.records_by_question_uid[q.question_uid] = {
        question_uid: q.question_uid,
        exam_uid: q.exam_uid,
        type: q.type,
        answer: q.answer,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        link: q.link || "https://isro.gov.in",
      };
    }
  }

  existingAnswers.totalQuestions = Object.keys(existingAnswers.records_by_question_uid).length;
  existingAnswers.generatedAt = new Date().toISOString();

  fs.writeFileSync(answersPath, JSON.stringify(existingAnswers, null, 2), "utf8");
  fs.writeFileSync(path.join(PUBLIC_ISRO, "answers-isro.json"), JSON.stringify(existingAnswers, null, 2), "utf8");
  console.log(`[UPDATED] answers-isro.json now contains ${existingAnswers.totalQuestions} answers in records_by_question_uid.`);

  console.log(`\n🎉 Ingestion of ISRO ${firstYear} completed successfully!`);
}

main();
