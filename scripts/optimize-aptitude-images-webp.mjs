#!/usr/bin/env node

/**
 * Converts referenced aptitude PNG/JPG images to WebP, rewrites public aptitude
 * JSON references, and prunes unreferenced image files from public/images/aptitude.
 *
 * Usage:
 *   node scripts/optimize-aptitude-images-webp.mjs
 *   node scripts/optimize-aptitude-images-webp.mjs --dry-run
 *   node scripts/optimize-aptitude-images-webp.mjs --no-prune
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, "public", "images", "aptitude");
const DATA_DIR = path.join(ROOT, "public", "data", "aptitude");
const SEARCH_INDEX_FILE = path.join(ROOT, "public", "aptitude-search-index.json");
const REPORT_FILE = path.join(ROOT, "artifacts", "review", "aptitude-image-optimization-report.json");

const DRY_RUN = process.argv.includes("--dry-run");
const PRUNE = !process.argv.includes("--no-prune");
const WEBP_QUALITY = Number.parseInt(process.env.APTITUDE_IMAGE_WEBP_QUALITY || "78", 10);
const CONVERTIBLE_EXTS = new Set([".png", ".jpg", ".jpeg"]);
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const IMAGE_REF_RE = /images\/aptitude\/[^"'<> )]+/g;

function listJsonFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith(".json") ? [target] : [];
  if (!stat.isDirectory()) return [];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(target, entry.name);
    if (entry.isDirectory()) return listJsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  });
}

function imageNameFromRef(ref) {
  return path.basename(ref);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectReferences(files) {
  const refsByName = new Map();
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const match of content.matchAll(IMAGE_REF_RE)) {
      const name = imageNameFromRef(match[0]);
      if (!refsByName.has(name)) refsByName.set(name, new Set());
      refsByName.get(name).add(filePath);
    }
  }
  return refsByName;
}

function rewriteFileReferences(files, renames, missingNames) {
  let updatedFiles = 0;
  let rewrittenRefs = 0;
  let missingMarkers = 0;

  for (const filePath of files) {
    const before = fs.readFileSync(filePath, "utf8");
    let after = before;

    for (const [oldName, newName] of renames) {
      const re = new RegExp(escapeRegExp(oldName), "g");
      const matches = after.match(re);
      if (!matches) continue;
      rewrittenRefs += matches.length;
      after = after.replace(re, newName);
    }

    for (const missingName of missingNames) {
      const src = `images/aptitude/${missingName}`;
      const imgTagRe = new RegExp(`<img\\b[^>]*src=["']${escapeRegExp(src)}["'][^>]*>(?:</img>)?`, "gi");
      const tagMatches = after.match(imgTagRe);
      if (tagMatches) {
        missingMarkers += tagMatches.length;
        after = after.replace(imgTagRe, "[Image Missing]");
      }
      const bareRe = new RegExp(escapeRegExp(src), "g");
      const bareMatches = after.match(bareRe);
      if (bareMatches) {
        missingMarkers += bareMatches.length;
        after = after.replace(bareRe, "[Image Missing]");
      }
    }

    if (after !== before) {
      updatedFiles += 1;
      if (!DRY_RUN) fs.writeFileSync(filePath, after, "utf8");
    }
  }

  return { updatedFiles, rewrittenRefs, missingMarkers };
}

async function convertToWebp(fileName) {
  const sourcePath = path.join(IMAGE_DIR, fileName);
  const sourceBytes = fs.statSync(sourcePath).size;
  const baseName = path.basename(fileName, path.extname(fileName));
  const webpName = `${baseName}.webp`;
  const webpPath = path.join(IMAGE_DIR, webpName);

  let image;
  try {
    image = sharp(sourcePath, { failOn: "warning" }).rotate();
    await image.metadata();
  } catch {
    return { status: "invalid", sourceBytes };
  }

  if (!DRY_RUN) {
    await image.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(webpPath);
    fs.unlinkSync(sourcePath);
  }

  const outputBytes = DRY_RUN ? 0 : fs.statSync(webpPath).size;
  return { status: "converted", webpName, sourceBytes, outputBytes };
}

function pruneUnreferencedImages(referencedNames) {
  if (!PRUNE || !fs.existsSync(IMAGE_DIR)) return { pruned: 0, prunedBytes: 0 };
  let pruned = 0;
  let prunedBytes = 0;
  for (const entry of fs.readdirSync(IMAGE_DIR, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;
    if (referencedNames.has(entry.name)) continue;

    const filePath = path.join(IMAGE_DIR, entry.name);
    const size = fs.statSync(filePath).size;
    pruned += 1;
    prunedBytes += size;
    if (!DRY_RUN) fs.unlinkSync(filePath);
  }
  return { pruned, prunedBytes };
}

function bytesToMb(bytes) {
  return Number((bytes / 1024 / 1024).toFixed(2));
}

async function main() {
  const jsonFiles = [...listJsonFiles(DATA_DIR), ...listJsonFiles(SEARCH_INDEX_FILE)];
  const refsByName = collectReferences(jsonFiles);
  const renames = new Map();
  const missingNames = new Set();
  const invalidNames = new Set();
  let sourceBytes = 0;
  let outputBytes = 0;
  let converted = 0;

  for (const name of Array.from(refsByName.keys())) {
    const ext = path.extname(name).toLowerCase();
    if (!CONVERTIBLE_EXTS.has(ext)) continue;
    const sourcePath = path.join(IMAGE_DIR, name);
    if (!fs.existsSync(sourcePath)) {
      missingNames.add(name);
      continue;
    }
    const result = await convertToWebp(name);
    sourceBytes += result.sourceBytes || 0;
    if (result.status === "invalid") {
      invalidNames.add(name);
      missingNames.add(name);
      continue;
    }
    converted += 1;
    outputBytes += result.outputBytes || 0;
    renames.set(name, result.webpName);
  }

  const rewrite = rewriteFileReferences(jsonFiles, renames, missingNames);
  const referencedAfter = new Set(Array.from(refsByName.keys()).map((name) => renames.get(name) || name));
  for (const name of missingNames) referencedAfter.delete(name);
  const prune = pruneUnreferencedImages(referencedAfter);

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    webpQuality: WEBP_QUALITY,
    jsonFiles: jsonFiles.length,
    referencedImages: refsByName.size,
    converted,
    invalidImages: Array.from(invalidNames).sort(),
    missingImages: Array.from(missingNames).sort(),
    updatedFiles: rewrite.updatedFiles,
    rewrittenRefs: rewrite.rewrittenRefs,
    missingMarkers: rewrite.missingMarkers,
    pruned: prune.pruned,
    sourceMB: bytesToMb(sourceBytes),
    outputMB: bytesToMb(outputBytes),
    prunedMB: bytesToMb(prune.prunedBytes),
    savedMB: bytesToMb(Math.max(0, sourceBytes - outputBytes) + prune.prunedBytes),
  };

  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
    fs.writeFileSync(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  console.log(
    `[optimize-aptitude-images] converted=${converted} updatedFiles=${rewrite.updatedFiles} ` +
      `pruned=${prune.pruned} invalid=${invalidNames.size} saved=${report.savedMB}MB`
  );
  if (invalidNames.size > 0) {
    console.log(`[optimize-aptitude-images] Replaced invalid images with [Image Missing]: ${Array.from(invalidNames).join(", ")}`);
  }
  if (!DRY_RUN) {
    console.log(`[optimize-aptitude-images] Report: ${path.relative(ROOT, REPORT_FILE)}`);
  }
}

main().catch((error) => {
  console.error(`[optimize-aptitude-images] ${error.stack || error.message}`);
  process.exit(1);
});
