#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const DISALLOWED_HTML_PATTERNS = [
  "questions-with-answers.json",
  "question-search-index.json",
  "question-detail-shards",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractScriptAssetPaths(html) {
  return Array.from(html.matchAll(/<script[^>]+src="([^"]+)"/gi))
    .map((match) => match[1])
    .filter(Boolean)
    .map((assetPath) => assetPath.replace(/^\/+Gate_QA\//, ""));
}

function main() {
  assert(fs.existsSync(INDEX_HTML_PATH), "Missing dist/index.html. Run `npm run build` before validating landing network constraints.");

  const html = fs.readFileSync(INDEX_HTML_PATH, "utf8");
  assert(
    html.includes("question-bank-manifest.json"),
    "Landing HTML is missing the manifest preload hint."
  );

  const initialAssets = extractScriptAssetPaths(html);
  DISALLOWED_HTML_PATTERNS.forEach((pattern) => {
    if (html.includes(pattern)) {
      throw new Error(`Landing HTML references disallowed startup payload: ${pattern}`);
    }
  });

  if (initialAssets.some((assetPath) => assetPath.includes("vendor-mathjax"))) {
    throw new Error("Landing HTML pulls vendor-mathjax into the initial script list.");
  }

  console.log(`[landing-network] validated ${initialAssets.length} landing script asset(s)`);
}

main();
