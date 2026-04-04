#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INPUT = "public/questions-with-answers.json";
const DEFAULT_REPORT = "artifacts/review/historical-exam-uid-repair-report.json";
const DEFAULT_FROM_YEAR = 2010;
const INVISIBLE_TEXT_RE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

function parseArgs(argv) {
  const result = {
    input: DEFAULT_INPUT,
    report: DEFAULT_REPORT,
    fromYear: DEFAULT_FROM_YEAR,
    output: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      result.input = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--report" && argv[index + 1]) {
      result.report = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--output" && argv[index + 1]) {
      result.output = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--from-year" && argv[index + 1]) {
      result.fromYear = Number.parseInt(argv[index + 1], 10) || DEFAULT_FROM_YEAR;
      index += 1;
    }
  }

  return result;
}

function readJson(filePath) {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing file: ${absolute}`);
  }
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

function cleanInvisibleText(value = "") {
  return String(value || "").replace(INVISIBLE_TEXT_RE, "");
}

function normalizeSetNo(rawValue) {
  const parsed = Number.parseInt(String(rawValue ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return parsed;
}

function extractSetFromYearTag(yearTag = "") {
  const match = String(yearTag || "").match(/gatecse-(\d{4})(?:-set(\d+))?/i);
  return match ? match[2] : null;
}

function extractPaperMeta(question = {}) {
  const existingExamUid = String(question.exam_uid || "").trim();
  const existingMatch = existingExamUid.match(/^cse:(\d{4}):set(\d+):([^:]+):q(.+)$/i);
  if (existingMatch) {
    return {
      year: Number.parseInt(existingMatch[1], 10),
      setNo: normalizeSetNo(existingMatch[2]),
      rawSection: existingMatch[3],
      rawToken: existingMatch[4],
      source: "exam_uid",
    };
  }

  const title = cleanInvisibleText(question.title || "");
  const yearTag = String(question.year || "").trim();
  const titleMatch = title.match(/GATE\s+CSE\s+(\d{4})(?:\s*(?:\|| )\s*Set\s*(\d+))?/i);
  if (titleMatch) {
    return {
      year: Number.parseInt(titleMatch[1], 10),
      setNo: normalizeSetNo(titleMatch[2] || extractSetFromYearTag(yearTag) || 1),
      rawSection: null,
      rawToken: null,
      source: "title",
    };
  }

  const link = String(question.link || "").trim();
  const linkMatch = link.match(/gate-(?:cse|it)-(\d{4})(?:-set-(\d+))?/i);
  if (linkMatch) {
    return {
      year: Number.parseInt(linkMatch[1], 10),
      setNo: normalizeSetNo(linkMatch[2] || extractSetFromYearTag(yearTag) || 1),
      rawSection: null,
      rawToken: null,
      source: "link",
    };
  }

  const yearTagMatch = yearTag.match(/gatecse-(\d{4})(?:-set(\d+))?/i);
  if (yearTagMatch) {
    return {
      year: Number.parseInt(yearTagMatch[1], 10),
      setNo: normalizeSetNo(yearTagMatch[2] || 1),
      rawSection: null,
      rawToken: null,
      source: "year_tag",
    };
  }

  return null;
}

function extractLogicalSlot(question = {}) {
  const title = cleanInvisibleText(question.title || "");
  const link = String(question.link || "").trim();

  let match = title.match(/Question\s*[: ]\s*GA\s*-?\s*(\d+)/i);
  if (match) {
    return { section: "ga", number: Number.parseInt(match[1], 10), source: "title" };
  }

  match = title.match(/GA\s+Question\s*[: ]\s*(\d+)/i);
  if (match) {
    return { section: "ga", number: Number.parseInt(match[1], 10), source: "title" };
  }

  match = title.match(/\bGA\b[\s|:-]*Question\s*[: ]\s*(\d+)/i);
  if (match) {
    return { section: "ga", number: Number.parseInt(match[1], 10), source: "title" };
  }

  match = title.match(/Question\s*[: ]\s*(\d+)/i);
  if (match) {
    return { section: "main", number: Number.parseInt(match[1], 10), source: "title" };
  }

  match = link.match(/question-ga-(\d+)/i);
  if (match) {
    return { section: "ga", number: Number.parseInt(match[1], 10), source: "link" };
  }

  match = link.match(/question-(\d+)/i);
  if (match) {
    return { section: "main", number: Number.parseInt(match[1], 10), source: "link" };
  }

  return null;
}

function buildCanonicalExamUid(question = {}) {
  const paperMeta = extractPaperMeta(question);
  const logicalSlot = extractLogicalSlot(question);

  if (!paperMeta || !logicalSlot || !Number.isFinite(paperMeta.year)) {
    return null;
  }

  const section = logicalSlot.section === "ga" ? "ga" : "main";
  return `cse:${paperMeta.year}:set${paperMeta.setNo}:${section}:q${logicalSlot.number}`;
}

function getPaperKeyFromCanonicalUid(canonicalExamUid = "") {
  const match = String(canonicalExamUid || "").match(/^cse:(\d{4}):set(\d+):/i);
  if (!match) {
    return null;
  }
  return `${match[1]}-set${match[2]}`;
}

function repairHistoricalExamUids(rows = [], { fromYear = DEFAULT_FROM_YEAR } = {}) {
  const repairedRows = [];
  const repairs = [];
  const skipped = [];
  const paperSummaryMap = new Map();

  for (const row of rows) {
    const clone = row && typeof row === "object" ? { ...row } : row;
    const canonicalExamUid = buildCanonicalExamUid(row);
    const currentExamUid = String(row?.exam_uid || "").trim();
    const paperMeta = extractPaperMeta(row);

    if (!canonicalExamUid || !paperMeta || !Number.isFinite(paperMeta.year) || paperMeta.year < fromYear) {
      repairedRows.push(clone);
      skipped.push({
        question_uid: row?.question_uid || null,
        exam_uid: currentExamUid || null,
        title: row?.title || "",
        reason: canonicalExamUid ? "outside_year_range" : "canonical_exam_uid_unavailable",
      });
      continue;
    }

    const paperKey = getPaperKeyFromCanonicalUid(canonicalExamUid);
    if (!paperSummaryMap.has(paperKey)) {
      paperSummaryMap.set(paperKey, {
        paper_key: paperKey,
        total_rows: 0,
        repaired_rows: 0,
      });
    }
    const paperSummary = paperSummaryMap.get(paperKey);
    paperSummary.total_rows += 1;

    if (currentExamUid && currentExamUid !== canonicalExamUid) {
      clone.exam_uid = canonicalExamUid;
      paperSummary.repaired_rows += 1;
      repairs.push({
        question_uid: row?.question_uid || null,
        paper_key: paperKey,
        old_exam_uid: currentExamUid,
        new_exam_uid: canonicalExamUid,
        title: row?.title || "",
      });
    }

    repairedRows.push(clone);
  }

  const paperSummaries = [...paperSummaryMap.values()]
    .sort((left, right) => left.paper_key.localeCompare(right.paper_key, undefined, { numeric: true }));

  const summary = {
    generated_at: new Date().toISOString(),
    total_rows: repairedRows.length,
    repaired_row_count: repairs.length,
    skipped_row_count: skipped.length,
    papers_with_repairs: paperSummaries.filter((paper) => paper.repaired_rows > 0).length,
  };

  return {
    summary,
    paper_summaries: paperSummaries,
    repairs,
    skipped,
    rows: repairedRows,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = readJson(args.input);

  if (!Array.isArray(rows)) {
    throw new Error("Input JSON must be an array of questions.");
  }

  const result = repairHistoricalExamUids(rows, { fromYear: args.fromYear });
  const report = {
    summary: {
      ...result.summary,
      input: path.resolve(args.input),
      report: path.resolve(args.report),
      output: args.output ? path.resolve(args.output) : null,
      from_year: args.fromYear,
    },
    paper_summaries: result.paper_summaries,
    repairs: result.repairs,
    skipped: result.skipped,
  };

  ensureParentDir(args.report);
  fs.writeFileSync(args.report, JSON.stringify(report, null, 2), "utf8");

  if (args.output) {
    ensureParentDir(args.output);
    fs.writeFileSync(args.output, JSON.stringify(result.rows, null, 2), "utf8");
  }

  console.log(`[repair-historical-exam-uids] Total rows: ${report.summary.total_rows}`);
  console.log(`[repair-historical-exam-uids] Repaired rows: ${report.summary.repaired_row_count}`);
  console.log(`[repair-historical-exam-uids] Papers with repairs: ${report.summary.papers_with_repairs}`);
  console.log(`[repair-historical-exam-uids] Report: ${path.resolve(args.report)}`);
  if (args.output) {
    console.log(`[repair-historical-exam-uids] Repaired snapshot: ${path.resolve(args.output)}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  cleanInvisibleText,
  extractPaperMeta,
  extractLogicalSlot,
  buildCanonicalExamUid,
  repairHistoricalExamUids,
};
