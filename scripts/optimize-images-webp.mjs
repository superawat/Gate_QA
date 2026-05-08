#!/usr/bin/env node

/**
 * optimize-images-webp.mjs
 *
 * Converts all PNG/JPG question images to WebP format and rewrites
 * the references in questions-with-answers.json so the downstream
 * build:public-artifacts regeneration picks up the new extensions.
 *
 * Usage: node scripts/optimize-images-webp.mjs [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, "public", "question-images");
const QUESTIONS_FILE = path.join(ROOT, "public", "questions-with-answers.json");
const DRY_RUN = process.argv.includes("--dry-run");

const CONVERTIBLE_EXTS = new Set([".png", ".jpg", ".jpeg"]);
const WEBP_QUALITY = 80;

async function main() {
  console.log(`[webp] Image directory: ${IMAGE_DIR}`);
  console.log(`[webp] Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);

  // ── Step 1: Discover convertible images ───────────────────────────────
  const allFiles = fs.readdirSync(IMAGE_DIR, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name);

  const convertible = allFiles.filter((name) =>
    CONVERTIBLE_EXTS.has(path.extname(name).toLowerCase())
  );

  console.log(`[webp] Total files: ${allFiles.length}`);
  console.log(`[webp] Convertible (PNG/JPG): ${convertible.length}`);

  if (convertible.length === 0) {
    console.log("[webp] Nothing to convert.");
    return;
  }

  // ── Step 2: Convert each image to WebP ────────────────────────────────
  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;
  let converted = 0;
  let failed = 0;
  const renames = new Map(); // oldName → newName

  for (const oldName of convertible) {
    const oldPath = path.join(IMAGE_DIR, oldName);
    const baseName = path.basename(oldName, path.extname(oldName));
    const newName = `${baseName}.webp`;
    const newPath = path.join(IMAGE_DIR, newName);

    const originalSize = fs.statSync(oldPath).size;
    totalOriginalBytes += originalSize;

    if (DRY_RUN) {
      renames.set(oldName, newName);
      converted++;
      continue;
    }

    try {
      const webpBuffer = await sharp(oldPath)
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      fs.writeFileSync(newPath, webpBuffer);
      totalWebpBytes += webpBuffer.length;

      // Delete the original
      fs.unlinkSync(oldPath);

      renames.set(oldName, newName);
      converted++;
    } catch (err) {
      console.error(`[webp] FAILED: ${oldName} — ${err.message}`);
      failed++;
    }
  }

  console.log(`[webp] Converted: ${converted}`);
  if (failed > 0) console.log(`[webp] Failed: ${failed}`);

  if (!DRY_RUN && totalOriginalBytes > 0) {
    const savedMB = ((totalOriginalBytes - totalWebpBytes) / (1024 * 1024)).toFixed(2);
    const pct = (((totalOriginalBytes - totalWebpBytes) / totalOriginalBytes) * 100).toFixed(1);
    console.log(
      `[webp] Size: ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB → ${(totalWebpBytes / (1024 * 1024)).toFixed(2)} MB (saved ${savedMB} MB / ${pct}%)`
    );
  }

  // ── Step 3: Rewrite image references in questions-with-answers.json ───
  if (renames.size === 0) {
    console.log("[webp] No renames to apply.");
    return;
  }

  console.log(`[webp] Rewriting references in ${path.basename(QUESTIONS_FILE)}...`);

  let questionsRaw = fs.readFileSync(QUESTIONS_FILE, "utf8");
  let rewriteCount = 0;

  for (const [oldName, newName] of renames) {
    // Match the filename wherever it appears (in question HTML, answer HTML, etc.)
    // The reference format is: question-images/<blobid>.<ext>
    const oldRef = oldName;
    const newRef = newName;

    // Use a global regex to catch all occurrences of this filename
    const escaped = oldRef.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "g");
    const matches = questionsRaw.match(re);
    if (matches) {
      rewriteCount += matches.length;
      if (!DRY_RUN) {
        questionsRaw = questionsRaw.replace(re, newRef);
      }
    }
  }

  if (!DRY_RUN && rewriteCount > 0) {
    fs.writeFileSync(QUESTIONS_FILE, questionsRaw, "utf8");
  }

  console.log(`[webp] Rewrote ${rewriteCount} image references in question data.`);

  // ── Step 4: Also rewrite in the legacy filtered files if they exist ────
  const LEGACY_FILES = [
    path.join(ROOT, "public", "questions-filtered.json"),
    path.join(ROOT, "public", "questions-filtered-with-ids.json"),
  ];

  for (const legacyFile of LEGACY_FILES) {
    if (!fs.existsSync(legacyFile)) continue;

    let raw = fs.readFileSync(legacyFile, "utf8");
    let legacyCount = 0;

    for (const [oldName, newName] of renames) {
      const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "g");
      const matches = raw.match(re);
      if (matches) {
        legacyCount += matches.length;
        if (!DRY_RUN) {
          raw = raw.replace(re, newName);
        }
      }
    }

    if (!DRY_RUN && legacyCount > 0) {
      fs.writeFileSync(legacyFile, raw, "utf8");
    }

    console.log(`[webp] Rewrote ${legacyCount} refs in ${path.basename(legacyFile)}.`);
  }

  // ── Step 5: Summary ───────────────────────────────────────────────────
  console.log("\n[webp] Done. Next steps:");
  console.log("  1. Run: npm run build:public-artifacts  (regenerates shards + manifest)");
  console.log("  2. Run: npm run qa:validate-question-images  (verify no broken refs)");
  console.log("  3. Run: npm run test:unit && npm run build  (guard rails)");
}

await main();
