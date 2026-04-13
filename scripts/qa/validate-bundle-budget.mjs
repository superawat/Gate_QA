#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const MANIFEST_PATH = path.join(DIST_DIR, ".vite", "manifest.json");
const LANDING_ENTRY_BUDGET_BYTES = 300 * 1024;
const LANDING_INITIAL_JS_BUDGET_BYTES = 700 * 1024;

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

  console.log(`[bundle-budget] landing entry: ${formatKb(entryChunkBytes)} (${entryRecord.file})`);
  console.log(`[bundle-budget] landing initial JS: ${formatKb(totalInitialJsBytes)} (${initialJsFiles.length} chunks)`);

  assert(
    entryChunkBytes <= LANDING_ENTRY_BUDGET_BYTES,
    `Landing entry chunk exceeds budget: ${formatKb(entryChunkBytes)} > ${formatKb(LANDING_ENTRY_BUDGET_BYTES)}`
  );
  assert(
    totalInitialJsBytes <= LANDING_INITIAL_JS_BUDGET_BYTES,
    `Landing initial JS exceeds budget: ${formatKb(totalInitialJsBytes)} > ${formatKb(LANDING_INITIAL_JS_BUDGET_BYTES)}`
  );
  assert(!hasInitialMathJaxChunk, "vendor-mathjax is part of the landing chunk graph.");
}

main();
