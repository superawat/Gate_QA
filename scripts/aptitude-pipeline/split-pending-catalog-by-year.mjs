import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

const DEFAULT_PARSED_PATH = path.join(ROOT, "artifacts", "aptitude-pipeline", "parsed-questions.json");
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "artifacts", "aptitude-pipeline", "aptitude-pending-by-year");
const DEFAULT_REPORT_PATH = path.join(ROOT, "artifacts", "review", "aptitude-yearwise-parse-coverage.json");
const YEAR_RE = /\b(?:19|20)\d{2}\b/g;
const SUBJECT_RE = /\b(English|Reasoning|Math|Mathematics|Quant|Quantitative)\b/i;

function resolveRepoPath(value) {
  if (!value) return null;
  return path.isAbsolute(value) ? value : path.resolve(ROOT, value);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    inputs: [],
    parsed: DEFAULT_PARSED_PATH,
    outputDir: DEFAULT_OUTPUT_DIR,
    report: DEFAULT_REPORT_PATH,
    includeParsed: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      options.inputs.push(argv[++index]);
    } else if (arg.startsWith("--input=")) {
      options.inputs.push(arg.slice("--input=".length));
    } else if (arg === "--parsed" && argv[index + 1]) {
      options.parsed = argv[++index];
    } else if (arg === "--output-dir" && argv[index + 1]) {
      options.outputDir = argv[++index];
    } else if (arg === "--report" && argv[index + 1]) {
      options.report = argv[++index];
    } else if (arg === "--include-parsed") {
      options.includeParsed = true;
    }
  }

  return {
    ...options,
    inputs: options.inputs.map(resolveRepoPath),
    parsed: resolveRepoPath(options.parsed),
    outputDir: resolveRepoPath(options.outputDir),
    report: resolveRepoPath(options.report),
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function paperSourceUrl(baseUrl, paperPack = "") {
  const url = new URL("/play", baseUrl);
  const paperHash = crypto.createHash("sha1").update(String(paperPack || "")).digest("hex").slice(0, 16);
  url.hash = `paper-${paperHash}`;
  return url.href;
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

function sourceEntries(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === "object");
  if (value && typeof value === "object") return [value];
  return [];
}

function loadParsedPageUrls(parsedPath) {
  if (!parsedPath || !fs.existsSync(parsedPath)) return new Set();
  const rows = readJson(parsedPath);
  const pageUrls = new Set();
  rows
    .flatMap((row) => sourceEntries(row?._source))
    .map((source) => source.pageUrl)
    .filter(Boolean)
    .forEach((pageUrl) => {
      pageUrls.add(pageUrl);
      pageUrls.add(normalizeUrlToInternal(pageUrl));
    });
  return pageUrls;
}

function compactText(value = "") {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferYear(...parts) {
  const text = compactText(parts.filter(Boolean).join(" "));
  const years = Array.from(text.matchAll(YEAR_RE))
    .map((match) => Number.parseInt(match[0], 10))
    .filter((year) => year >= 2010 && year <= 2030);
  return years[0] ? String(years[0]) : "unknown";
}

function inferSubject(...parts) {
  const text = compactText(parts.filter(Boolean).join(" "));
  const match = text.match(SUBJECT_RE);
  if (!match) return "Unknown";

  const token = match[1].toLowerCase();
  if (token.startsWith("eng")) return "English";
  if (token.startsWith("reason")) return "Reasoning";
  if (token.startsWith("math") || token.startsWith("quant")) return "Quant";
  return "Unknown";
}

function flattenCatalog(catalog) {
  const baseUrl = catalog.baseUrl || "https://aptitude-bank.internal/";
  const rows = [];

  (catalog.seriesJobs || []).forEach((job) => {
    const seriesTitle = compactText(
      job.seriesChoice?.title
      || job.seriesChoice?.label
      || job.contextInfo?.series
      || job.contextInfo?.testSeries
      || ""
    );
    const testTypeTitle = compactText(job.testTypeChoice?.title || job.contextInfo?.testType || "");

    (job.paperChoices || []).forEach((paper) => {
      const paperTitle = compactText(paper.title || paper.label || paper.text || paper.value || "");
      const pageUrl = paperSourceUrl(baseUrl, paper.value);
      rows.push({
        job,
        paper,
        pageUrl,
        normalizedPageUrl: normalizeUrlToInternal(pageUrl),
        year: inferYear(paperTitle, seriesTitle),
        subject: inferSubject(paperTitle, seriesTitle, testTypeTitle),
      });
    });
  });

  return rows;
}

function createEmptySummary() {
  return {
    totalPapers: 0,
    parsedPapers: 0,
    pendingPapers: 0,
    duplicatePapers: 0,
    bySubject: {},
  };
}

function addSubjectCount(summary, subject, key) {
  if (!summary.bySubject[subject]) {
    summary.bySubject[subject] = {
      totalPapers: 0,
      parsedPapers: 0,
      pendingPapers: 0,
    };
  }
  summary.bySubject[subject][key] += 1;
}

function mergeSubjectCounts(target, source) {
  Object.entries(source || {}).forEach(([subject, counts]) => {
    if (!target.bySubject[subject]) {
      target.bySubject[subject] = {
        totalPapers: 0,
        parsedPapers: 0,
        pendingPapers: 0,
      };
    }

    target.bySubject[subject].totalPapers += counts.totalPapers || 0;
    target.bySubject[subject].parsedPapers += counts.parsedPapers || 0;
    target.bySubject[subject].pendingPapers += counts.pendingPapers || 0;
  });
}

function addCoverageRatio(summary) {
  return {
    ...summary,
    parsedCoverageRatio: summary.totalPapers > 0
      ? Number((summary.parsedPapers / summary.totalPapers).toFixed(4))
      : 0,
  };
}

function buildCatalogForRows(sourceCatalog, rows) {
  const rowsByJob = new Map();
  rows.forEach((row) => {
    const key = row.job;
    if (!rowsByJob.has(key)) rowsByJob.set(key, []);
    rowsByJob.get(key).push(row.paper);
  });

  const seriesJobs = (sourceCatalog.seriesJobs || [])
    .filter((job) => rowsByJob.has(job))
    .map((job) => ({
      ...job,
      paperChoices: rowsByJob.get(job),
    }));

  return {
    ...sourceCatalog,
    generatedBy: "split-pending-catalog-by-year",
    generatedAt: new Date().toISOString(),
    seriesJobs,
    seriesJobCount: seriesJobs.length,
    paperCount: rows.length,
  };
}

function main() {
  const options = parseArgs();
  if (options.inputs.length === 0) {
    console.error("Usage: node split-pending-catalog-by-year.mjs --input <catalog.json> [--input <catalog.json>...]");
    process.exit(1);
  }

  const parsedPageUrls = loadParsedPageUrls(options.parsed);
  const seenPaperUrls = new Set();
  const summariesByYear = new Map();
  const pendingRowsByYearAndCatalog = new Map();
  const sourceCatalogs = [];

  for (const inputPath of options.inputs) {
    const catalog = readJson(inputPath);
    sourceCatalogs.push(catalog);

    for (const row of flattenCatalog(catalog)) {
      const duplicate = seenPaperUrls.has(row.normalizedPageUrl);
      if (!duplicate) {
        seenPaperUrls.add(row.normalizedPageUrl);
      }

      const parsed = parsedPageUrls.has(row.pageUrl) || parsedPageUrls.has(row.normalizedPageUrl);
      const year = row.year;
      if (!summariesByYear.has(year)) summariesByYear.set(year, createEmptySummary());
      const summary = summariesByYear.get(year);

      summary.totalPapers += duplicate ? 0 : 1;
      summary.parsedPapers += !duplicate && parsed ? 1 : 0;
      summary.pendingPapers += !duplicate && !parsed ? 1 : 0;
      summary.duplicatePapers += duplicate ? 1 : 0;
      if (!duplicate) {
        addSubjectCount(summary, row.subject, "totalPapers");
        addSubjectCount(summary, row.subject, parsed ? "parsedPapers" : "pendingPapers");
      }

      if (!duplicate && (!parsed || options.includeParsed)) {
        const key = `${year}::${sourceCatalogs.length - 1}`;
        if (!pendingRowsByYearAndCatalog.has(key)) pendingRowsByYearAndCatalog.set(key, []);
        pendingRowsByYearAndCatalog.get(key).push(row);
      }
    }
  }

  const writtenCatalogs = [];
  const yearKeys = Array.from(summariesByYear.keys()).sort((left, right) => String(left).localeCompare(String(right)));
  yearKeys.forEach((year) => {
    const rowsForYear = [];
    sourceCatalogs.forEach((catalog, catalogIndex) => {
      const rows = pendingRowsByYearAndCatalog.get(`${year}::${catalogIndex}`) || [];
      if (rows.length === 0) return;
      rowsForYear.push({ catalog, rows });
    });

    rowsForYear.forEach(({ catalog, rows }, catalogIndex) => {
      const suffix = rowsForYear.length > 1 ? `-${catalogIndex + 1}` : "";
      const filePath = path.join(options.outputDir, `aptitude-pending-${year}${suffix}-catalog.json`);
      writeJson(filePath, buildCatalogForRows(catalog, rows));
      writtenCatalogs.push({
        year,
        paperCount: rows.length,
        path: path.relative(ROOT, filePath),
      });
    });
  });

  const totals = createEmptySummary();
  yearKeys.forEach((year) => {
    const summary = summariesByYear.get(year);
    totals.totalPapers += summary.totalPapers;
    totals.parsedPapers += summary.parsedPapers;
    totals.pendingPapers += summary.pendingPapers;
    totals.duplicatePapers += summary.duplicatePapers;
    mergeSubjectCounts(totals, summary.bySubject);
  });

  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    sourceCatalogCount: options.inputs.length,
    parsedRowCount: fs.existsSync(options.parsed) ? readJson(options.parsed).length : 0,
    totals: addCoverageRatio(totals),
    years: Object.fromEntries(yearKeys.map((year) => [year, addCoverageRatio(summariesByYear.get(year))])),
    writtenCatalogs,
  };

  writeJson(options.report, report);
  console.log(`Wrote ${writtenCatalogs.length} year-specific catalog(s).`);
  console.log(`Coverage report: ${path.relative(ROOT, options.report)}`);
  console.log(JSON.stringify({ totals: report.totals, years: report.years }, null, 2));
}

main();
