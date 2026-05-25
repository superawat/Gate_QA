import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { SUBJECTS, TAXONOMY } = require("../qa/aptitude-taxonomy.js");

const SUBJECT_ALIASES = new Map([
  ["math", "Quant"],
  ["maths", "Quant"],
  ["mathematics", "Quant"],
  ["quant", "Quant"],
  ["quantitative", "Quant"],
  ["quantitative-aptitude", "Quant"],
]);

const SYNTHETIC_MARKER_RE = /<!--\s*mock\s+2025\b|mock_2025_data|synthetic/i;
const EXCLUDED_SOURCE_RE =
  /\b(?:G\.?\s*S\.?|G\.?\s*K\.?|General\s+Awareness|General\s+Studies|General\s+Science|Current\s+Affairs|Hindi)\b/i;
const DISPLAY_FORBIDDEN_RE =
  /SSC|CGL|CHSL|MTS|CPO|Tier|Staff\s+Selection|Set\s+[A-D]\b|Q\s*\.\s*\d+(?:\.|\s*(?:to|-))|\[\[PAGE:|Direction\s*:-|General\s+Awareness/i;
const BROAD_LOW_SIGNAL_RE = /\b(?:Mock\s+Tests?\s*\(\s*Full\s+Length\s*\)|Full\s+Length|Full\s+Test|Complete\s+Mock|Mega\s+Mock)\b/i;
const SUBJECT_SIGNAL_RE =
  /\b(?:English|Verbal|Grammar|Vocabulary|Reasoning|Logical|Mental\s+Ability|Quantitative|Quant|Maths?|Mathematics|Numerical|Arithmetic|Aptitude)\b/i;
const ENGLISH_TASK_RE =
  /\b(?:active(?:\s*\/\s*|\s+)passive|passive voice|active voice|sentence improvement|substitute|spot.*error|grammatical error|segment.*contains.*error|cloze test|comprehension|according to the passage|idiom|synonym|antonym|spelling|misspelt|misspelled|one[- ]word|one which can be substituted|group of words given|para jumble|jumbled|narration|direct speech|indirect speech)\b/i;
const QUANT_TASK_RE =
  /\b(?:simplify|evaluate|hcf|lcm|sin|cos|tan|cosec|sec|cot|trigonometry|height of|speed|train|km\/h|profit|loss|gain|cost price|selling price|marked price|discount|percentage|per cent|ratio|proportion|average|simple interest|compound interest|pipe|cistern|boat|stream|workman|complete.*days|circle|triangle|area|volume|radius|diameter|perimeter|equation|algebra|polynomial|bar[ -]?graph|pie[- ]chart|table)\b|%/i;
const REASONING_TASK_RE =
  /\b(?:code language|coded as|coding|decoding|syllogism|blood relation|letter[- ]cluster|number series|comes next|odd one out|analogy|sitting arrangement|facing north|facing south|immediate left|immediate right|rank|ranking|statement.*conclusion|mathematical operations?)\b/i;
const GENERAL_AWARENESS_STEM_RE = /^(?:who|which|what|when|where|in which|at which|as per|according to|with reference to)\b/i;
const GENERAL_AWARENESS_TERMS_RE =
  /\b(?:article\s+\d+|constitution|directive principles|fundamental duties|parliament|supreme court|high court|governor|chief minister|prime minister|minister|president|election commission|census|gdp|revenue deficit|service tax|tax|brand finance|lic|rbi|sebi|insurance|bank|scheme|budget|state|union territory|district|festival|dance|temple|fort|museum|archaeological|civilisation|chola|khilji|satyagraha|gandhi|ibn battuta|book|novel|author|magazine|award|olympics?|cricketer|kho[- ]?kho|padma|unesco|w\.?h\.?o\.?|malaria|acid|element|electron|atom|cell|fatty acids?|ecosystem|soil|climate|mountains?|hills?|river|agriculture|crop|bawris?|pietra dura|marris college|one horned rhino)\b/i;
const OPTION_LABELS = new Set(["A", "B", "C", "D"]);

function compactText(value = "") {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u200b\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value = "") {
  return compactText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(value = "") {
  return compactText(String(value || "").replace(/<[^>]*>/g, " "));
}

function normalizeSubject(value = "") {
  const slug = slugify(value);
  return SUBJECT_ALIASES.get(slug) || SUBJECTS.find((subject) => slugify(subject) === slug) || compactText(value);
}

function sourceEntries(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === "object");
  if (value && typeof value === "object") return [value];
  return [];
}

function sourceText(row = {}) {
  return sourceEntries(row._source)
    .flatMap((source) => [
      source.examBody,
      source.examName,
      source.testSeries,
      source.paperTitle,
      source.product,
      source.tier,
      source.testType,
      source.topic,
      source.pageUrl,
    ])
    .map(compactText)
    .filter(Boolean)
    .join(" ");
}

function usefulSourceMetadata(row = {}) {
  return sourceEntries(row._source).some(
    (source) => source.sourceKind && (source.pageUrl || source.sourceId || source.examName || source.paperTitle)
  );
}

function hasForbiddenDisplayToken(value = "") {
  return DISPLAY_FORBIDDEN_RE.test(stripHtml(value));
}

function rowTextWithOptions(row = {}) {
  return compactText(
    `${stripHtml(row.questionHtml || "")} ${(row.options || []).map((option) => stripHtml(option)).join(" ")}`
  );
}

function isFullLengthMockSource(row = {}) {
  return BROAD_LOW_SIGNAL_RE.test(sourceText(row));
}

function looksLikeGeneralAwareness(row = {}) {
  const text = rowTextWithOptions(row);
  if (!text) return false;
  if (ENGLISH_TASK_RE.test(text) || QUANT_TASK_RE.test(text) || REASONING_TASK_RE.test(text)) return false;
  if (GENERAL_AWARENESS_STEM_RE.test(text) && GENERAL_AWARENESS_TERMS_RE.test(text)) return true;
  return isFullLengthMockSource(row) && GENERAL_AWARENESS_TERMS_RE.test(text);
}

function validOptions(value) {
  return Array.isArray(value)
    && value.length === 4
    && value.every((option) => compactText(stripHtml(option)) || /<img\b/i.test(String(option || "")));
}

function decision(action, reason, detail = "") {
  return { action, reason, detail: compactText(detail) };
}

export function catalogContextText(context = {}, paperChoice = null) {
  const paperText = paperChoice
    ? [paperChoice.title, paperChoice.label, paperChoice.value, paperChoice.text].filter(Boolean).join(" ")
    : "";
  return [
    context.product,
    context.tier,
    context.testType,
    context.series,
    context.paper,
    paperText,
  ]
    .map(compactText)
    .filter(Boolean)
    .join(" ");
}

export function classifyCatalogContext(context = {}, paperChoice = null) {
  const text = catalogContextText(context, paperChoice);
  if (!text) return decision("ignore", "unsupported_catalog_taxonomy");
  if (SYNTHETIC_MARKER_RE.test(text)) return decision("ignore", "synthetic_marker", text);
  if (EXCLUDED_SOURCE_RE.test(text)) return decision("ignore", "excluded_source_section", text);
  if (BROAD_LOW_SIGNAL_RE.test(text)) return decision("ignore", "broad_low_signal_pack", text);
  if (SUBJECT_SIGNAL_RE.test(text)) return decision("attempt", "gate_like_catalog_signal", text);
  return decision("ignore", "unsupported_catalog_taxonomy", text);
}

export function classifyCatalogJob(job = {}, paperChoice = null) {
  const context = {
    product: job.contextInfo?.product || job.productChoice?.title || job.productChoice?.value,
    tier: job.contextInfo?.tier || job.tierChoice?.title || job.tierChoice?.value,
    testType: job.contextInfo?.testType || job.testTypeChoice?.title || job.testTypeChoice?.value,
    series: job.contextInfo?.series || job.seriesChoice?.title || job.seriesChoice?.value,
    paper: job.contextInfo?.paper,
  };
  return classifyCatalogContext(context, paperChoice);
}

export function classifyParsedRow(row = {}) {
  const combinedText = `${row.questionHtml || ""} ${(row.options || []).join(" ")} ${sourceText(row)}`;
  if (SYNTHETIC_MARKER_RE.test(combinedText)) return decision("ignore", "synthetic_marker");
  if (EXCLUDED_SOURCE_RE.test(sourceText(row))) return decision("ignore", "excluded_source_section");
  if (BROAD_LOW_SIGNAL_RE.test(sourceText(row))) return decision("ignore", "broad_low_signal_pack");
  if (/<img\b[^>]+src=["']data:image\//i.test(row.questionHtml || "")) return decision("ignore", "inline_base64_image");
  if (hasForbiddenDisplayToken(row.questionHtml || "")) return decision("ignore", "forbidden_display_token");
  if (looksLikeGeneralAwareness(row)) return decision("ignore", "general_awareness_leak");

  const subject = normalizeSubject(row.subject);
  if (!SUBJECTS.includes(subject)) return decision("ignore", "unsupported_subject", row.subject);
  if (!TAXONOMY[subject]?.includes(row.subtopic)) return decision("ignore", "unsupported_taxonomy", `${subject} / ${row.subtopic || ""}`);
  if (!validOptions(row.options)) return decision("ignore", "invalid_options");
  if (!OPTION_LABELS.has(row.answer)) return decision("ignore", "invalid_answer");
  if (!usefulSourceMetadata(row)) return decision("ignore", "missing_source_metadata");
  return decision("attempt", "valid_gate_like_row", `${subject} / ${row.subtopic}`);
}

export function createDecisionReport() {
  return {
    series: { attempted: 0, ignored: 0, ignoredByReason: {} },
    papers: { attempted: 0, ignored: 0, ignoredByReason: {} },
    rows: { attempted: 0, ignored: 0, ignoredByReason: {} },
  };
}

export function recordDecision(report, scope, result) {
  const bucket = report?.[scope];
  if (!bucket || !result) return report;
  if (result.action === "attempt") {
    bucket.attempted += 1;
    return report;
  }
  bucket.ignored += 1;
  bucket.ignoredByReason[result.reason] = (bucket.ignoredByReason[result.reason] || 0) + 1;
  return report;
}

export function mergeDecisionReports(...reports) {
  const merged = createDecisionReport();
  for (const report of reports) {
    if (!report) continue;
    for (const scope of ["series", "papers", "rows"]) {
      merged[scope].attempted += report[scope]?.attempted || 0;
      merged[scope].ignored += report[scope]?.ignored || 0;
      for (const [reason, count] of Object.entries(report[scope]?.ignoredByReason || {})) {
        merged[scope].ignoredByReason[reason] = (merged[scope].ignoredByReason[reason] || 0) + count;
      }
    }
  }
  return merged;
}

export function filterAttemptedRows(rows = []) {
  const report = createDecisionReport();
  const attempted = [];
  const ignoredSamples = [];
  for (const row of rows) {
    const result = classifyParsedRow(row);
    recordDecision(report, "rows", result);
    if (result.action === "attempt") {
      attempted.push(row);
    } else if (ignoredSamples.length < 25) {
      ignoredSamples.push({
        reason: result.reason,
        subject: row.subject || "",
        subtopic: row.subtopic || "",
        source: sourceText(row).slice(0, 220),
        preview: stripHtml(row.questionHtml || "").slice(0, 220),
      });
    }
  }
  return { attempted, report, ignoredSamples };
}

function readOption(argv, name, fallback = "") {
  const prefix = `--${name}=`;
  const inline = argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = argv.indexOf(`--${name}`);
  if (index >= 0 && argv[index + 1] && !argv[index + 1].startsWith("--")) {
    return argv[index + 1];
  }
  return fallback;
}

function readInputRows(inputPath) {
  const raw = inputPath && inputPath !== "-" ? fs.readFileSync(inputPath, "utf8") : fs.readFileSync(0, "utf8");
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) {
    throw new Error("AptitudeBank intake classifier input must be a JSON array.");
  }
  return rows;
}

function writeCliPayload(outputPath, payload) {
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, json, "utf8");
    return;
  }
  process.stdout.write(json);
}

function runCli(argv = process.argv.slice(2)) {
  const inputPath = readOption(argv, "input", "-");
  const outputPath = readOption(argv, "output", "");
  const rows = readInputRows(inputPath);
  const rowIntake = filterAttemptedRows(rows);
  writeCliPayload(outputPath, {
    version: 1,
    generatedAt: new Date().toISOString(),
    inputRows: rows.length,
    attemptedRows: rowIntake.attempted.length,
    ignoredRows: rowIntake.report.rows.ignored,
    report: rowIntake.report,
    ignoredSamples: rowIntake.ignoredSamples,
    attempted: rowIntake.attempted,
  });
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    runCli();
  } catch (error) {
    console.error(`[aptitude-intake-classifier] ${error.stack || error.message}`);
    process.exit(1);
  }
}
