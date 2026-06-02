#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { TAXONOMY_SETS: TAXONOMY } = require("./aptitude-taxonomy");
const { readJson } = require("./load-aptitude-data");

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const APTITUDE_INDEX_FILE = path.join(PUBLIC_DIR, "aptitude-search-index.json");
const APTITUDE_SHARD_ROOT = path.join(PUBLIC_DIR, "data", "aptitude");
const GATE_FILE = path.join(ROOT, "public", "questions-with-answers.json");

const VALID_EXAM_NAMES = new Set(["CGL", "CHSL", "MTS", "CPO", "Stenographer", "Selection Post", "Chapterwise"]);
const DISPLAY_FORBIDDEN_RE = /SSC|CGL|CHSL|MTS|CPO|Tier|Staff\s+Selection|Set\s+[A-D]\b|Q\s*\.\s*\d+(?:\.|\s*(?:to|-))|\[\[PAGE:|Direction\s*:-|General\s+Awareness/i;
const UID_RE = /^APT-(ENG|QNT|RSN)-\d{4,}$/;
const APTITUDE_CATALOG_NOISE_RE = /Description|Total\s*Tests|Total\s*papers|Open Test|Questions:|Marks:|Price:|Tests:\s*\d|Series:\s*\d/i;
const SYNTHETIC_MARKER_RE = /<!--\s*mock\s+2025\b|mock_2025_data|synthetic/i;
const FULL_LENGTH_MOCK_RE = /\bMock\s+Tests?\s*\(\s*Full\s+Length\s*\)|\bFull\s+Length\b/i;
const ENGLISH_TASK_RE = /\b(?:active(?:\s*\/\s*|\s+)passive|passive voice|active voice|sentence improvement|substitute|spot.*error|grammatical error|segment.*contains.*error|cloze test|comprehension|according to the passage|idiom|synonym|antonym|spelling|misspelt|misspelled|one[- ]word|one which can be substituted|group of words given|para jumble|jumbled|narration|direct speech|indirect speech)\b/i;
const QUANT_TASK_RE = /\b(?:simplify|evaluate|hcf|lcm|sin|cos|tan|cosec|sec|cot|trigonometry|height of|speed|train|km\/h|profit|loss|gain|cost price|selling price|marked price|discount|percentage|per cent|ratio|proportion|average|simple interest|compound interest|pipe|cistern|boat|stream|workman|complete.*days|circle|triangle|area|volume|radius|diameter|perimeter|equation|algebra|polynomial|bar[ -]?graph|pie[- ]chart|table)\b|%/i;
const REASONING_TASK_RE = /\b(?:code language|coded as|coding|decoding|syllogism|blood relation|letter[- ]cluster|number series|comes next|odd one out|analogy|sitting arrangement|facing north|facing south|immediate left|immediate right|rank|ranking|statement.*conclusion|mathematical operations?)\b/i;
const GENERAL_AWARENESS_STEM_RE = /^(?:who|which|what|when|where|in which|at which|as per|according to|with reference to)\b/i;
const GENERAL_AWARENESS_TERMS_RE = /\b(?:article\s+\d+|constitution|directive principles|fundamental duties|parliament|supreme court|high court|governor|chief minister|prime minister|minister|president|election commission|census|gdp|revenue deficit|service tax|tax|brand finance|lic|rbi|sebi|insurance|bank|scheme|budget|state|union territory|district|festival|dance|temple|fort|museum|archaeological|civilisation|chola|khilji|satyagraha|gandhi|ibn battuta|book|novel|author|magazine|award|olympics?|cricketer|kho[- ]?kho|padma|unesco|w\.?h\.?o\.?|malaria|acid|element|electron|atom|cell|fatty acids?|ecosystem|soil|climate|mountains?|hills?|river|agriculture|crop|bawris?|pietra dura|marris college|one horned rhino)\b/i;

function sourceEntries(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === "object");
  if (value && typeof value === "object") return [value];
  return [];
}

function isAptitudeBankSource(source) {
  return source?.sourceKind === "aptitude-web";
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#x27;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceText(row) {
  return sourceEntries(row?._source)
    .flatMap((source) => [source.examBody, source.examName, source.testSeries, source.paperTitle, source.product, source.tier, source.testType, source.topic])
    .filter(Boolean)
    .join(" ");
}

function rowTextWithOptions(row) {
  return `${stripHtml(row?.questionHtml || "")} ${(row?.options || []).map(stripHtml).join(" ")}`.replace(/\s+/g, " ").trim();
}

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listJsonFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    });
}

function toPublicPath(filePath) {
  return path.relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
}

function loadAptitudeRowsWithShardPaths() {
  const shardFiles = listJsonFiles(APTITUDE_SHARD_ROOT).sort();
  if (shardFiles.length === 0) {
    throw new Error("Aptitude shard data must exist under public/data/aptitude.");
  }

  const uidToShard = new Map();
  const rows = shardFiles.flatMap((filePath) => {
    const shardRows = readJson(filePath);
    if (!Array.isArray(shardRows)) {
      throw new Error(`${path.relative(ROOT, filePath)} must be an array.`);
    }

    const publicShardPath = toPublicPath(filePath);
    return shardRows.map((row) => {
      if (row?.uid && !uidToShard.has(row.uid)) {
        uidToShard.set(row.uid, publicShardPath);
      }
      return row;
    });
  });

  return { rows, uidToShard };
}

function looksLikeGeneralAwareness(row) {
  const text = rowTextWithOptions(row);
  if (!text) return false;
  if (ENGLISH_TASK_RE.test(text) || QUANT_TASK_RE.test(text) || REASONING_TASK_RE.test(text)) return false;
  if (GENERAL_AWARENESS_STEM_RE.test(text) && GENERAL_AWARENESS_TERMS_RE.test(text)) return true;
  return FULL_LENGTH_MOCK_RE.test(sourceText(row)) && GENERAL_AWARENESS_TERMS_RE.test(text);
}

async function loadSharedIntakePolicy() {
  const classifierPath = path.join(ROOT, "scripts", "aptitude-pipeline", "aptitude-intake-classifier.mjs");
  return import(pathToFileURL(classifierPath).href);
}

function validateSource(source, uid, errors) {
  if (isAptitudeBankSource(source)) {
    if (source.sourceKind !== "aptitude-web") {
      errors.push(`${uid}: AptitudeBank source must set sourceKind=aptitude-web`);
    }
    if (!source.examBody || /^(?:AptitudeBank|Aptitude|Aptitude Web|AptitudeBank Web)$/i.test(String(source.examBody))) {
      errors.push(`${uid}: AptitudeBank source must store the actual exam body`);
    }
    if (!source.examName || /^(?:AptitudeBank|Aptitude|Aptitude Web|AptitudeBank Web)$/i.test(String(source.examName))) {
      errors.push(`${uid}: AptitudeBank source must store the actual exam/test name`);
    }
    if (!/^https:\/\/aptitude-bank\.internal\//i.test(String(source.pageUrl || ""))) {
      errors.push(`${uid}: AptitudeBank source must include pageUrl on aptitude-bank.internal`);
    }
    if (!source.sourceId || typeof source.sourceId !== "string") {
      errors.push(`${uid}: AptitudeBank source must include sourceId`);
    }
    if (source.year !== null && source.year !== undefined && !Number.isInteger(Number(source.year))) {
      errors.push(`${uid}: AptitudeBank source year must be numeric when present`);
    }
    const catalogFields = [source.examName, source.testSeries, source.product, source.tier, source.testType, source.paperTitle]
      .filter(Boolean)
      .join(" ");
    if (APTITUDE_CATALOG_NOISE_RE.test(catalogFields)) {
      errors.push(`${uid}: AptitudeBank source metadata contains catalog UI noise`);
    }
    return;
  }

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

function getIndexQuestions(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.questions)) {
    return payload.questions;
  }
  return [];
}

function validatePublicIndex({ rowByUid, uidToShard, errors }) {
  if (!fs.existsSync(APTITUDE_INDEX_FILE)) {
    errors.push("public aptitude index is missing");
    return;
  }

  const indexPayload = readJson(APTITUDE_INDEX_FILE);
  const indexQuestions = getIndexQuestions(indexPayload);
  if (indexQuestions.length === 0) {
    errors.push("public aptitude index must contain at least one question");
    return;
  }

  const indexUidSet = new Set();
  indexQuestions.forEach((entry, index) => {
    const label = `aptitude-search-index[${index}]`;
    const uid = String(entry?.u || entry?.uid || entry?.question_uid || "").trim();
    const shard = String(entry?.sh || entry?.shard || entry?.detailShard || "").trim();

    if (!uid) {
      errors.push(`${label}: missing UID`);
      return;
    }
    if (indexUidSet.has(uid)) {
      errors.push(`${uid}: duplicate public index UID`);
    }
    indexUidSet.add(uid);

    const detail = rowByUid.get(uid);
    if (!detail) {
      errors.push(`${uid}: public index points to a missing aptitude detail row`);
      return;
    }
    if (!shard) {
      errors.push(`${uid}: public index must include a detail shard path`);
    } else if (uidToShard.has(uid) && uidToShard.get(uid) !== shard) {
      errors.push(`${uid}: public index shard ${shard} does not match detail shard ${uidToShard.get(uid)}`);
    }
    if (!stripHtml(detail.questionHtml || "")) {
      errors.push(`${uid}: detail row referenced by public index has empty questionHtml`);
    }
    if (!Array.isArray(detail.options) || detail.options.length !== 4 || detail.options.some((option) => String(option || "").trim() === "")) {
      errors.push(`${uid}: detail row referenced by public index must have four non-empty options`);
    }
    if (!["A", "B", "C", "D"].includes(detail.answer)) {
      errors.push(`${uid}: detail row referenced by public index has invalid answer`);
    }
  });

  const rowsMissingFromIndex = Array.from(rowByUid.keys()).filter((uid) => !indexUidSet.has(uid));
  if (rowsMissingFromIndex.length > 0) {
    errors.push(`public aptitude index is missing ${rowsMissingFromIndex.length} detail rows, e.g. ${rowsMissingFromIndex.slice(0, 5).join(", ")}`);
  }
}

async function main() {
  const { classifyParsedRow } = await loadSharedIntakePolicy();
  const { rows, uidToShard } = loadAptitudeRowsWithShardPaths();
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Aptitude shard data must contain at least one question.");
  }

  const errors = [];
  const uidSet = new Set();
  const rowByUid = new Map();

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
      errors.push(`${label}: UID must match APT-(ENG|QNT|RSN)-0000`);
    }
    if (uidSet.has(row.uid)) {
      errors.push(`${label}: duplicate UID`);
    } else if (row.uid) {
      rowByUid.set(row.uid, row);
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
    if (row.year !== null && row.year !== undefined && !Number.isInteger(Number(row.year))) {
      errors.push(`${label}: year must be numeric when present`);
    }
    if (DISPLAY_FORBIDDEN_RE.test(stripHtml(row.questionHtml || ""))) {
      errors.push(`${label}: questionHtml contains forbidden SSC provenance token`);
    }
    if (SYNTHETIC_MARKER_RE.test(`${row.questionHtml || ""} ${sourceText(row)}`)) {
      errors.push(`${label}: synthetic/mock staging marker leaked into public aptitude data`);
    }
    if (looksLikeGeneralAwareness(row)) {
      errors.push(`${label}: likely General Awareness row leaked into aptitude data`);
    }
    const intakeDecision = classifyParsedRow(row);
    if (intakeDecision.action !== "attempt") {
      errors.push(`${label}: failed shared AptitudeBank intake policy (${intakeDecision.reason})`);
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

  validatePublicIndex({ rowByUid, uidToShard, errors });

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

main().catch((error) => {
  console.error(`[validate-aptitude-data] ${error.stack || error.message}`);
  process.exit(1);
});
