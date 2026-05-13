#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { TAXONOMY_SETS: TAXONOMY } = require("./aptitude-taxonomy");
const { loadAptitudeRows, readJson } = require("./load-aptitude-data");

const ROOT = process.cwd();
const GATE_FILE = path.join(ROOT, "public", "questions-with-answers.json");

const VALID_EXAM_NAMES = new Set(["CGL", "CHSL", "MTS", "CPO", "Stenographer", "Selection Post", "Chapterwise"]);
const DISPLAY_FORBIDDEN_RE = /SSC|CGL|CHSL|MTS|CPO|Tier|Staff\s+Selection|Set\s+[A-D]|Q\s*\.\s*\d+\.|\[\[PAGE:|Direction\s*:-|General\s+Awareness/i;
const UID_RE = /^APT-(ENG|MAT|RSN)-\d{4,}$/;

function sourceEntries(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === "object");
  if (value && typeof value === "object") return [value];
  return [];
}

function validateSource(source, uid, errors) {
  if (source.examBody !== "SSC") {
    errors.push(`${uid}: _source.examBody must be SSC`);
  }
  if (!VALID_EXAM_NAMES.has(source.examName)) {
    errors.push(`${uid}: invalid _source.examName ${source.examName}`);
  }
  if (!source.pdfFile || typeof source.pdfFile !== "string") {
    errors.push(`${uid}: missing _source.pdfFile`);
  }
  if (!Number.isFinite(Number(source.pdfPage)) && source.pdfPage !== null) {
    errors.push(`${uid}: invalid _source.pdfPage`);
  }
}

function main() {
  const rows = loadAptitudeRows();
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Aptitude shard data must contain at least one question.");
  }

  const errors = [];
  const uidSet = new Set();

  rows.forEach((row, index) => {
    const label = row?.uid || `row[${index}]`;
    if (!row || typeof row !== "object") {
      errors.push(`row[${index}]: must be an object`);
      return;
    }

    for (const key of ["uid", "questionHtml", "options", "answer", "type", "subject", "subtopic", "_source"]) {
      if (!(key in row)) {
        errors.push(`${label}: missing ${key}`);
      }
    }

    if (!UID_RE.test(String(row.uid || ""))) {
      errors.push(`${label}: UID must match APT-(ENG|MAT|RSN)-0000`);
    }
    if (uidSet.has(row.uid)) {
      errors.push(`${label}: duplicate UID`);
    }
    uidSet.add(row.uid);

    if (!TAXONOMY[row.subject]) {
      errors.push(`${label}: invalid subject ${row.subject}`);
    } else if (!TAXONOMY[row.subject].has(row.subtopic)) {
      errors.push(`${label}: invalid subtopic ${row.subject} / ${row.subtopic}`);
    }

    if (!Array.isArray(row.options) || row.options.length !== 4) {
      errors.push(`${label}: options must contain exactly 4 entries`);
    } else if (row.options.some((option) => String(option || "").trim() === "")) {
      errors.push(`${label}: options must not contain empty entries`);
    }
    if (!["A", "B", "C", "D"].includes(row.answer)) {
      errors.push(`${label}: answer must be one of A/B/C/D`);
    }
    if (row.type !== "MCQ") {
      errors.push(`${label}: type must be MCQ`);
    }
    if (DISPLAY_FORBIDDEN_RE.test(String(row.questionHtml || ""))) {
      errors.push(`${label}: questionHtml contains forbidden SSC provenance token`);
    }
    if (/^go[:\-]/i.test(String(row.uid || ""))) {
      errors.push(`${label}: aptitude UID collides with GATE prefix`);
    }

    const sources = sourceEntries(row._source);
    if (sources.length === 0) {
      errors.push(`${label}: _source must be an object or non-empty array`);
    }
    sources.forEach((source) => validateSource(source, label, errors));
  });

  const gateRows = fs.existsSync(GATE_FILE) ? readJson(GATE_FILE) : [];
  const gateUidSet = new Set(
    (Array.isArray(gateRows) ? gateRows : [])
      .map((row) => String(row?.question_uid || row?.uid || "").trim())
      .filter(Boolean)
  );
  const collisions = rows.map((row) => row.uid).filter((uid) => gateUidSet.has(uid));
  if (collisions.length > 0) {
    errors.push(`APT UID collision with GATE data: ${collisions.slice(0, 5).join(", ")}`);
  }

  if (errors.length > 0) {
    console.error("[validate-aptitude-data] FAILED");
    errors.slice(0, 50).forEach((error) => console.error(`- ${error}`));
    if (errors.length > 50) {
      console.error(`...and ${errors.length - 50} more`);
    }
    process.exit(1);
  }

  console.log(`[validate-aptitude-data] OK: ${rows.length} aptitude questions validated.`);
}

try {
  main();
} catch (error) {
  console.error(`[validate-aptitude-data] ${error.stack || error.message}`);
  process.exit(1);
}
