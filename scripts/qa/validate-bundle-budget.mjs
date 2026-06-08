#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const MANIFEST_PATH = path.join(DIST_DIR, ".vite", "manifest.json");
const REPORT_PATH = path.join(ROOT, "artifacts", "review", "bundle-budget-report.json");
const LANDING_ENTRY_BUDGET_BYTES = 300 * 1024;
const LANDING_INITIAL_JS_BUDGET_BYTES = 1200 * 1024;
const WARNING_THRESHOLD_RATIO = 0.9;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getByteSize(relativeFilePath) {
  const absolutePath = path.join(DIST_DIR, relativeFilePath);
  return fs.statSync(absolutePath).size;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function getBudgetStatus(bytes, budgetBytes) {
  if (bytes > budgetBytes) {
    return "fail";
  }

  if (bytes >= budgetBytes * WARNING_THRESHOLD_RATIO) {
    return "warn";
  }

  return "pass";
}

function writeReport(report) {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

function getEntryRecord(manifest) {
  const candidates = Object.entries(manifest).filter(([, entry]) => entry?.isEntry);
  const preferred = candidates.find(([key]) => key === "index.html")
    || candidates.find(([key]) => key.includes("src/index"))
    || candidates[0];

  assert(preferred, "Could not find a Vite entry record in dist/.vite/manifest.json.");
  return preferred;
}

function collectInitialJsFiles(manifest, manifestKey, collected = new Set()) {
  if (!manifestKey || collected.has(manifestKey)) {
    return collected;
  }

  collected.add(manifestKey);
  const record = manifest[manifestKey];
  if (!record) {
    return collected;
  }

  (record.imports || []).forEach((importKey) => {
    collectInitialJsFiles(manifest, importKey, collected);
  });

  return collected;
}

function main() {
  assert(fs.existsSync(MANIFEST_PATH), "Missing Vite manifest. Run `npm run build` before validating bundle budgets.");

  const manifest = readJson(MANIFEST_PATH);
  const [entryKey, entryRecord] = getEntryRecord(manifest);
  const initialManifestKeys = Array.from(collectInitialJsFiles(manifest, entryKey));
  const initialJsFiles = initialManifestKeys
    .map((manifestKey) => manifest[manifestKey]?.file)
    .filter((file) => typeof file === "string" && file.endsWith(".js"));

  const entryChunkBytes = getByteSize(entryRecord.file);
  const totalInitialJsBytes = initialJsFiles.reduce((sum, file) => sum + getByteSize(file), 0);
  const hasInitialMathJaxChunk = initialJsFiles.some((file) => file.includes("vendor-mathjax"));
  const checks = [
    {
      name: "landingEntry",
      bytes: entryChunkBytes,
      budgetBytes: LANDING_ENTRY_BUDGET_BYTES,
      status: getBudgetStatus(entryChunkBytes, LANDING_ENTRY_BUDGET_BYTES),
      file: entryRecord.file,
    },
    {
      name: "landingInitialJs",
      bytes: totalInitialJsBytes,
      budgetBytes: LANDING_INITIAL_JS_BUDGET_BYTES,
      status: getBudgetStatus(totalInitialJsBytes, LANDING_INITIAL_JS_BUDGET_BYTES),
      files: initialJsFiles,
    },
    {
      name: "landingMathJaxIsolation",
      status: hasInitialMathJaxChunk ? "fail" : "pass",
      files: initialJsFiles.filter((file) => file.includes("vendor-mathjax")),
    },
  ];
  const report = {
    generatedAt: new Date().toISOString(),
    warningThresholdRatio: WARNING_THRESHOLD_RATIO,
    checks,
    initialJsFiles: initialJsFiles.map((file) => ({
      file,
      bytes: getByteSize(file),
      size: formatKb(getByteSize(file)),
    })),
  };

  writeReport(report);

  console.log(`[bundle-budget] landing entry: ${formatKb(entryChunkBytes)} (${entryRecord.file})`);
  console.log(`[bundle-budget] landing initial JS: ${formatKb(totalInitialJsBytes)} (${initialJsFiles.length} chunks)`);
  console.log(`[bundle-budget] report: ${path.relative(ROOT, REPORT_PATH)}`);

  checks
    .filter((check) => check.status === "warn")
    .forEach((check) => {
      console.warn(
        `[bundle-budget] warning: ${check.name} is at ${formatKb(check.bytes)} of ${formatKb(check.budgetBytes)}.`
      );
    });

  assert(
    checks.find((check) => check.name === "landingEntry")?.status !== "fail",
    `Landing entry chunk exceeds budget: ${formatKb(entryChunkBytes)} > ${formatKb(LANDING_ENTRY_BUDGET_BYTES)}`
  );
  assert(
    checks.find((check) => check.name === "landingInitialJs")?.status !== "fail",
    `Landing initial JS exceeds budget: ${formatKb(totalInitialJsBytes)} > ${formatKb(LANDING_INITIAL_JS_BUDGET_BYTES)}`
  );
  assert(checks.find((check) => check.name === "landingMathJaxIsolation")?.status !== "fail", "vendor-mathjax is part of the landing chunk graph.");
}

main();
