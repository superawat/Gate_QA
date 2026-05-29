import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { JSDOM } from "jsdom";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

const DEFAULT_INPUT_PATH = path.join(ROOT, "artifacts", "aptitude-pipeline", "parsed-questions.json");
const DEFAULT_REPORT_PATH = path.join(ROOT, "artifacts", "review", "aptitude-parsed-dedupe-report.json");

const sharedDom = new JSDOM("<!doctype html><body></body>");
const document = sharedDom.window.document;

function resolveRepoPath(value) {
  if (!value) return null;
  return path.isAbsolute(value) ? value : path.resolve(ROOT, value);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    input: DEFAULT_INPUT_PATH,
    output: "",
    report: DEFAULT_REPORT_PATH,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      options.input = argv[++index];
    } else if (arg === "--output" && argv[index + 1]) {
      options.output = argv[++index];
    } else if (arg === "--report" && argv[index + 1]) {
      options.report = argv[++index];
    } else if (arg === "--write") {
      options.write = true;
    }
  }

  return {
    ...options,
    input: resolveRepoPath(options.input),
    output: resolveRepoPath(options.output || options.input),
    report: resolveRepoPath(options.report),
  };
}

function compactText(value = "") {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value = "") {
  document.body.innerHTML = value;
  document.body.querySelectorAll("script,style,noscript").forEach((node) => node.remove());
  return compactText(document.body.textContent || "");
}

function dedupeKey(questionHtml = "") {
  const text = stripHtml(questionHtml)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return crypto.createHash("sha256").update(text).digest("hex");
}

function sourceEntries(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === "object");
  if (value && typeof value === "object") return [value];
  return [];
}

function sourceKey(source) {
  return [
    source.sourceKind || "",
    source.sourceId || "",
    source.pageUrl || "",
    source.paperTitle || "",
    source.originalQNum || "",
  ].join("\u001f");
}

function mergeSources(left, right) {
  const merged = [];
  const seen = new Set();
  for (const source of [...sourceEntries(left), ...sourceEntries(right)]) {
    const key = sourceKey(source);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(source);
  }
  if (merged.length === 0) return undefined;
  return merged.length === 1 ? merged[0] : merged;
}

function optionText(option) {
  return stripHtml(option?.html || option?.text || option || "");
}

function answerSignature(row) {
  return [
    row.answer || "",
    ...(row.options || []).map(optionText),
  ].join("\n");
}

function preview(row) {
  return stripHtml(row.questionHtml || "").slice(0, 180);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function main() {
  const options = parseArgs();
  const rows = readJson(options.input);
  const deduped = [];
  const seen = new Map();
  const duplicateSamples = [];
  let duplicateRows = 0;
  let conflictGroups = 0;

  rows.forEach((row, index) => {
    const key = dedupeKey(row.questionHtml || "");
    const existingIndex = seen.get(key);
    if (existingIndex === undefined) {
      seen.set(key, deduped.length);
      deduped.push({ ...row });
      return;
    }

    duplicateRows += 1;
    const kept = deduped[existingIndex];
    const conflict = answerSignature(kept) !== answerSignature(row);
    if (conflict) conflictGroups += 1;
    kept._source = mergeSources(kept._source, row._source);
    kept.year = kept.year || row.year || sourceEntries(row._source)[0]?.year || null;

    if (duplicateSamples.length < 40) {
      duplicateSamples.push({
        removedRowIndex: index,
        keptRowIndex: existingIndex,
        conflict,
        subject: row.subject || "",
        subtopic: row.subtopic || "",
        preview: preview(row),
      });
    }
  });

  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    input: path.relative(ROOT, options.input),
    output: path.relative(ROOT, options.output),
    write: options.write,
    inputRows: rows.length,
    outputRows: deduped.length,
    duplicateRowsRemoved: duplicateRows,
    duplicateGroups: rows.length - duplicateRows,
    duplicateRowsWithAnswerOptionConflict: conflictGroups,
    duplicateSamples,
  };

  if (options.write) {
    writeJson(options.output, deduped);
  }
  writeJson(options.report, report);
  console.log(JSON.stringify({
    inputRows: report.inputRows,
    outputRows: report.outputRows,
    duplicateRowsRemoved: report.duplicateRowsRemoved,
    duplicateRowsWithAnswerOptionConflict: report.duplicateRowsWithAnswerOptionConflict,
    written: options.write,
  }, null, 2));
  console.log(`Report: ${path.relative(ROOT, options.report)}`);
  sharedDom.window.close();
}

main();
