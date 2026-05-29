import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { JSDOM } from "jsdom";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

const DEFAULT_PARSED_PATH = path.join(ROOT, "artifacts", "aptitude-pipeline", "parsed-questions.json");
const DEFAULT_OUTPUT_PATH = path.join(ROOT, "artifacts", "aptitude-pipeline", "aptitude-paper-coverage-aliases.json");
const DEFAULT_REPORT_PATH = path.join(ROOT, "artifacts", "review", "aptitude-paper-coverage-aliases-report.json");
const DEFAULT_ZERO_DEBUG_DIR = path.join(ROOT, "artifacts", "aptitude-pipeline", "debug-leftovers");

const sharedDom = new JSDOM("<!doctype html><body></body>");
const document = sharedDom.window.document;

function resolveRepoPath(value) {
  if (!value) return null;
  return path.isAbsolute(value) ? value : path.resolve(ROOT, value);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    inputs: [],
    parsed: DEFAULT_PARSED_PATH,
    output: DEFAULT_OUTPUT_PATH,
    report: DEFAULT_REPORT_PATH,
    zeroDebugDir: DEFAULT_ZERO_DEBUG_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      options.inputs.push(argv[++index]);
    } else if (arg.startsWith("--input=")) {
      options.inputs.push(arg.slice("--input=".length));
    } else if (arg === "--parsed" && argv[index + 1]) {
      options.parsed = argv[++index];
    } else if (arg === "--output" && argv[index + 1]) {
      options.output = argv[++index];
    } else if (arg === "--report" && argv[index + 1]) {
      options.report = argv[++index];
    } else if (arg === "--zero-debug-dir" && argv[index + 1]) {
      options.zeroDebugDir = argv[++index];
    }
  }

  return {
    ...options,
    inputs: options.inputs.map(resolveRepoPath),
    parsed: resolveRepoPath(options.parsed),
    output: resolveRepoPath(options.output),
    report: resolveRepoPath(options.report),
    zeroDebugDir: resolveRepoPath(options.zeroDebugDir),
  };
}

function compactText(value = "") {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeHtml(value = "") {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function stripHtml(value = "") {
  document.body.innerHTML = value;
  document.body.querySelectorAll("script,style,noscript").forEach((node) => node.remove());
  return compactText(document.body.textContent || "");
}

function imageRefsFromHtml(value = "") {
  const refs = [];
  const imgRe = /<img\b[^>]*>/gi;
  let match;
  while ((match = imgRe.exec(String(value || "")))) {
    const tag = match[0];
    const alt = tag.match(/\balt\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    if (alt || src) refs.push(compactText(alt || src));
  }
  return refs;
}

function textWithImageRefs(value = "") {
  const text = stripHtml(value);
  if (!looksLikeHtml(value)) return text;
  return compactText([text, ...imageRefsFromHtml(value)].join(" "));
}

function rowHash(row) {
  return crypto
    .createHash("sha1")
    .update(
      `${textWithImageRefs(row.questionHtml).toLowerCase()}\n${row.answer}\n${(row.options || [])
        .map((option) => textWithImageRefs(option.html || option.text || option))
        .join("\n")
        .toLowerCase()}`
    )
    .digest("hex");
}

function normalizeUrlToInternal(urlStr) {
  if (!urlStr) return "";
  try {
    const url = new URL(urlStr);
    url.protocol = "https:";
    url.hostname = "aptitude-bank.internal";
    url.port = "";
    return url.href;
  } catch {
    return urlStr;
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function sourceEntries(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === "object");
  if (value && typeof value === "object") return [value];
  return [];
}

function addAlias(aliasesByUrl, alias) {
  const normalizedPageUrl = normalizeUrlToInternal(alias.pageUrl || alias.normalizedPageUrl);
  const key = normalizedPageUrl || alias.pageUrl;
  if (!key || aliasesByUrl.has(key)) return;
  aliasesByUrl.set(key, {
    ...alias,
    normalizedPageUrl,
  });
}

function loadExistingAliases(outputPath) {
  const aliasesByUrl = new Map();
  if (!outputPath || !fs.existsSync(outputPath)) return aliasesByUrl;
  const payload = readJson(outputPath);
  for (const alias of payload.aliases || []) {
    addAlias(aliasesByUrl, alias);
  }
  return aliasesByUrl;
}

function collectDuplicateAliases(options, parsedHashes, aliasesByUrl) {
  const report = {
    inputFiles: [],
    duplicatePaperCount: 0,
    papersWithUniqueRows: 0,
    uniqueRows: 0,
  };

  for (const inputPath of options.inputs) {
    if (!fs.existsSync(inputPath)) continue;
    const rows = readJson(inputPath);
    const groups = new Map();
    for (const row of rows) {
      const pageUrl = row?._source?.pageUrl;
      if (!pageUrl) continue;
      if (!groups.has(pageUrl)) groups.set(pageUrl, []);
      groups.get(pageUrl).push(row);
    }

    const inputSummary = {
      input: path.relative(ROOT, inputPath),
      paperCount: groups.size,
      duplicatePaperCount: 0,
      papersWithUniqueRows: 0,
      uniqueRows: 0,
    };

    for (const [pageUrl, groupRows] of groups) {
      const uniqueRows = groupRows.filter((row) => !parsedHashes.has(rowHash(row)));
      if (uniqueRows.length === 0) {
        const firstSource = sourceEntries(groupRows[0]?._source)[0] || {};
        addAlias(aliasesByUrl, {
          pageUrl,
          reason: "duplicate_content",
          rowCount: groupRows.length,
          subject: groupRows[0]?.subject || null,
          year: groupRows[0]?.year || firstSource.year || null,
          paperTitle: firstSource.paperTitle || null,
        });
        report.duplicatePaperCount += 1;
        inputSummary.duplicatePaperCount += 1;
      } else {
        report.papersWithUniqueRows += 1;
        report.uniqueRows += uniqueRows.length;
        inputSummary.papersWithUniqueRows += 1;
        inputSummary.uniqueRows += uniqueRows.length;
      }
    }

    report.inputFiles.push(inputSummary);
  }

  return report;
}

function collectZeroRowAliases(options, aliasesByUrl) {
  const report = {
    zeroDebugDir: options.zeroDebugDir ? path.relative(ROOT, options.zeroDebugDir) : null,
    zeroPaperCount: 0,
  };
  if (!options.zeroDebugDir || !fs.existsSync(options.zeroDebugDir)) return report;

  for (const entry of fs.readdirSync(options.zeroDebugDir)) {
    if (!entry.endsWith(".json")) continue;
    const payload = readJson(path.join(options.zeroDebugDir, entry));
    if (!payload.sourceUrl) continue;
    addAlias(aliasesByUrl, {
      pageUrl: payload.sourceUrl,
      reason: "zero_structured_rows",
      rowCount: 0,
      paperTitle: payload.paperTitle || null,
      year: payload.context?.year || null,
    });
    report.zeroPaperCount += 1;
  }

  return report;
}

function main() {
  const options = parseArgs();
  if (!fs.existsSync(options.parsed)) {
    throw new Error(`Parsed file not found: ${path.relative(ROOT, options.parsed)}`);
  }

  const parsedRows = readJson(options.parsed);
  const parsedHashes = new Set(parsedRows.map(rowHash));
  const aliasesByUrl = loadExistingAliases(options.output);

  const duplicateReport = collectDuplicateAliases(options, parsedHashes, aliasesByUrl);
  const zeroReport = collectZeroRowAliases(options, aliasesByUrl);
  const aliases = Array.from(aliasesByUrl.values()).sort((left, right) => {
    return String(left.normalizedPageUrl || left.pageUrl).localeCompare(String(right.normalizedPageUrl || right.pageUrl));
  });

  writeJson(options.output, {
    version: 1,
    generatedAt: new Date().toISOString(),
    aliases,
  });

  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    parsedRowCount: parsedRows.length,
    aliasCount: aliases.length,
    byReason: aliases.reduce((acc, alias) => {
      acc[alias.reason] = (acc[alias.reason] || 0) + 1;
      return acc;
    }, {}),
    duplicateReport,
    zeroReport,
  };
  writeJson(options.report, report);

  console.log(`Wrote ${aliases.length} paper coverage alias(es).`);
  console.log(`Alias report: ${path.relative(ROOT, options.report)}`);
  console.log(JSON.stringify({ aliasCount: report.aliasCount, byReason: report.byReason }, null, 2));
  sharedDom.window.close();
}

main();
