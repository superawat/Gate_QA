#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { loadAptitudeRows } = require("./load-aptitude-data");

const ROOT = process.cwd();
const REPORT_FILE = path.join(ROOT, "artifacts", "review", "aptitude-quality-sample.json");
const DEFAULT_SAMPLE_SIZE = 50;
const DEFAULT_SEED = 20260512;

const TAXONOMY = {
  English: [
    "Spot the Error",
    "Sentence Improvement",
    "Narration",
    "Active Passive",
    "Para Jumble",
    "Fill in the Blanks",
    "Cloze Test",
    "Comprehension",
    "One Word Substitution",
    "Idioms",
    "Synonyms",
    "Antonyms",
    "Spelling Check",
    "Homonyms",
    "Miscellaneous",
  ],
  Quant: [
    "Number System",
    "HCF and LCM",
    "Simplification",
    "Trigonometry",
    "Height and Distance",
    "Mensuration",
    "Geometry",
    "Algebra",
    "Ratio and Proportion",
    "Partnership",
    "Mixture and Alligation",
    "Work and Time",
    "Pipe and Cistern",
    "Time, Speed and Distance",
    "Linear/Circular Race",
    "Boat and Stream",
    "Percentage",
    "Profit and Loss",
    "Discount",
    "Simple Interest",
    "Compound Interest",
    "Installment",
    "Average",
    "Data Interpretation",
    "Mean, Median & Mode",
    "Coordinate Geometry",
    "Probability",
  ],
  Reasoning: [
    "Coding - Decoding",
    "Odd one out",
    "Analogy",
    "Word Arrangement",
    "Address",
    "Decision Making",
    "Order and Ranking",
    "Mathematical Operations",
    "Blood Relation",
    "Arithmetic Reasoning",
    "Calendar",
    "Word Formation",
    "Series",
    "Missing Number",
    "Statement And Conclusion",
    "Syllogism",
    "Inequality",
    "Directions",
    "Sitting Arrangement",
    "Puzzle",
    "Miscellaneous",
  ],
};

const HARD_ARTIFACTS = [
  ["page_marker", /\[\[PAGE:/i],
  ["broken_marker", /\[\[|\]\]/],
  ["direction_range", /\bDirection\s*:-|\bQ\s*\.\s*\d+\s*(?:to|-)/i],
  ["section_bleed", /\b(?:General Awareness|Quantitative Aptitude)\b/i],
  ["publisher_noise", /\b(?:Download\s+[A-Z][A-Za-z0-9_-]*|Search\s+on\s+TG|ssc(?:cgl)?[a-z0-9_-]*)\b/i],
  ["replacement_character", /\uFFFD/],
  ["mojibake", /\b(?:Ã|â)\w*/],
];

const MATH_SUSPICIOUS_RE = /\b(?:O\d|\dO|I\d|l\d|[+\-*/=]{3,}|= =|__+)\b/;

function parseArgs(argv) {
  const options = { sampleSize: DEFAULT_SAMPLE_SIZE, seed: DEFAULT_SEED };
  argv.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (key === "--sample") {
      options.sampleSize = Math.max(1, Number.parseInt(value, 10) || DEFAULT_SAMPLE_SIZE);
    }
    if (key === "--seed") {
      options.seed = Number.parseInt(value, 10) || DEFAULT_SEED;
    }
  });
  return options;
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedQuestionKey(row) {
  return stripHtml(row.questionHtml || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function sampleRows(rows, sampleSize, seed) {
  const random = seededRandom(seed);
  const copy = rows.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy.slice(0, Math.min(sampleSize, copy.length));
}

function findHardArtifacts(rows) {
  const hits = [];
  rows.forEach((row) => {
    const displayText = `${stripHtml(row.questionHtml || "")} ${(row.options || []).map(stripHtml).join(" ")}`;
    HARD_ARTIFACTS.forEach(([id, pattern]) => {
      if (pattern.test(displayText)) {
        hits.push({ uid: row.uid, artifact: id });
      }
    });
  });
  return hits;
}

function findDuplicateQuestions(rows) {
  const byKey = new Map();
  rows.forEach((row) => {
    const key = normalizedQuestionKey(row);
    if (!key) {
      return;
    }
    if (!byKey.has(key)) {
      byKey.set(key, []);
    }
    byKey.get(key).push(row.uid);
  });
  return Array.from(byKey.values())
    .filter((uids) => uids.length > 1)
    .map((uids) => uids.slice(0, 8));
}

function buildCoverage(rows) {
  const coverage = {};
  Object.entries(TAXONOMY).forEach(([subject, subtopics]) => {
    coverage[subject] = {};
    subtopics.forEach((subtopic) => {
      coverage[subject][subtopic] = 0;
    });
  });
  rows.forEach((row) => {
    if (coverage[row.subject] && Object.prototype.hasOwnProperty.call(coverage[row.subject], row.subtopic)) {
      coverage[row.subject][row.subtopic] += 1;
    }
  });
  return coverage;
}

function findCoverageWarnings(coverage) {
  const warnings = [];
  Object.entries(coverage).forEach(([subject, subtopics]) => {
    const total = Object.values(subtopics).reduce((sum, count) => sum + count, 0);
    Object.entries(subtopics).forEach(([subtopic, count]) => {
      if (count === 0 && subtopic !== "Miscellaneous") {
        warnings.push(`${subject} / ${subtopic}: no parsed questions`);
      }
    });
    const miscCount = subtopics.Miscellaneous || 0;
    const miscRatio = total > 0 ? miscCount / total : 0;
    if (miscRatio > 0.2) {
      warnings.push(`${subject} / Miscellaneous: ${(miscRatio * 100).toFixed(1)}% of subject`);
    }
  });
  return warnings;
}

function findMathWarnings(rows) {
  return rows
    .filter((row) => row.subject === "Quant")
    .map((row) => ({ row, text: `${stripHtml(row.questionHtml || "")} ${(row.options || []).map(stripHtml).join(" ")}` }))
    .filter(({ text }) => MATH_SUSPICIOUS_RE.test(text))
    .map(({ row }) => row.uid);
}

function main() {
  const { sampleSize, seed } = parseArgs(process.argv.slice(2));
  const rows = loadAptitudeRows();
  const hardArtifacts = findHardArtifacts(rows);
  const duplicateQuestions = findDuplicateQuestions(rows);
  const coverage = buildCoverage(rows);
  const coverageWarnings = findCoverageWarnings(coverage);
  const mathWarnings = findMathWarnings(rows);
  const sample = sampleRows(rows, sampleSize, seed).map((row) => ({
    uid: row.uid,
    subject: row.subject,
    subtopic: row.subtopic,
    answer: row.answer,
    preview: stripHtml(row.questionHtml || "").slice(0, 220),
    optionsHash: crypto.createHash("sha1").update(JSON.stringify(row.options || [])).digest("hex").slice(0, 12),
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    sampleSize: sample.length,
    seed,
    totalQuestions: rows.length,
    hardArtifactCount: hardArtifacts.length,
    duplicateQuestionGroups: duplicateQuestions.length,
    coverage,
    coverageWarnings,
    mathWarningUids: mathWarnings.slice(0, 50),
    sample,
  };

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`);

  if (hardArtifacts.length > 0 || duplicateQuestions.length > 0) {
    console.error("[verify-aptitude-quality] FAILED");
    hardArtifacts.slice(0, 20).forEach((hit) => {
      console.error(`- ${hit.uid}: ${hit.artifact}`);
    });
    duplicateQuestions.slice(0, 10).forEach((uids) => {
      console.error(`- duplicate question text: ${uids.join(", ")}`);
    });
    process.exit(1);
  }

  console.log(`[verify-aptitude-quality] OK: ${rows.length} questions, ${sample.length} sampled.`);
  if (coverageWarnings.length > 0) {
    console.log(`[verify-aptitude-quality] Coverage warnings: ${coverageWarnings.length}`);
    coverageWarnings.slice(0, 20).forEach((warning) => console.log(`- ${warning}`));
  }
  if (mathWarnings.length > 0) {
    console.log(`[verify-aptitude-quality] Quant OCR warnings: ${mathWarnings.length}`);
    console.log(mathWarnings.slice(0, 20).join(", "));
  }
  console.log(`[verify-aptitude-quality] Report: ${path.relative(ROOT, REPORT_FILE)}`);
}

try {
  main();
} catch (error) {
  console.error(`[verify-aptitude-quality] ${error.stack || error.message}`);
  process.exit(1);
}
