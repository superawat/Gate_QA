#!/usr/bin/env node

/**
 * scripts/pipeline/mirror-branch-images.mjs
 * -----------------------------------------
 * Downloads, hashes (SHA-256), and converts external diagram images
 * to local WebP files in `public/question-images/{branch}/{year}/`.
 * Rewrites image URLs in audit JSON so there are zero external hotlinks.
 *
 * Usage:
 *   node scripts/pipeline/mirror-branch-images.mjs --branch=ec --year=2024
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT, "public");
const BASE_HOST = "https://practicepaper.in";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { branch: "ec", year: null, set: null, file: null };
  for (const arg of args) {
    if (arg.startsWith("--branch=")) opts.branch = arg.split("=")[1].toLowerCase();
    else if (arg.startsWith("--year=")) opts.year = parseInt(arg.split("=")[1], 10);
    else if (arg.startsWith("--set=")) opts.set = parseInt(arg.split("=")[1], 10);
    else if (arg.startsWith("--file=")) opts.file = arg.split("=")[1];
  }
  return opts;
}

export async function mirrorImage(relativeOrAbsoluteUrl, branch, year) {
  const fullUrl = relativeOrAbsoluteUrl.startsWith("http")
    ? relativeOrAbsoluteUrl
    : `${BASE_HOST}${relativeOrAbsoluteUrl.startsWith("/") ? "" : "/"}${relativeOrAbsoluteUrl}`;

  const res = await fetch(fullUrl, {
    headers: {
      "user-agent": USER_AGENT,
      referer: "https://practicepaper.in/",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch image ${fullUrl}: HTTP ${res.status}`);
  }

  const rawBuffer = Buffer.from(await res.arrayBuffer());
  const hash = crypto.createHash("sha256").update(rawBuffer).digest("hex").slice(0, 10);
  const fileName = `${branch.toLowerCase()}-${year}-${hash}.webp`;

  const targetDir = path.join(PUBLIC_DIR, "question-images", branch.toLowerCase(), String(year));
  fs.mkdirSync(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, fileName);

  await sharp(rawBuffer).webp({ quality: 85, effort: 4 }).toFile(targetPath);
  return `/question-images/${branch.toLowerCase()}/${year}/${fileName}`;
}

export async function rewriteImageSourcesInHtml(htmlContent, branch, year, imageCache) {
  if (!htmlContent || typeof htmlContent !== "string") return htmlContent;

  const imgRegex = /<img\s+[^>]*src=['"]([^'"]+)['"][^>]*>/gi;
  let match;
  let updatedHtml = htmlContent;

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const rawSrc = match[1];
    if (rawSrc.startsWith("/question-images/")) continue;

    if (imageCache.has(rawSrc)) {
      const localPath = imageCache.get(rawSrc);
      updatedHtml = updatedHtml.replaceAll(rawSrc, localPath);
      continue;
    }

    try {
      const localPath = await mirrorImage(rawSrc, branch, year);
      imageCache.set(rawSrc, localPath);
      updatedHtml = updatedHtml.replaceAll(rawSrc, localPath);
    } catch (err) {
      console.warn(`[IMAGE_WARN] Could not mirror ${rawSrc}: ${err.message}`);
    }
  }

  return updatedHtml;
}

export async function processAuditFilePath(auditFile) {
  if (!fs.existsSync(auditFile)) {
    throw new Error(`Audit file not found: ${auditFile}`);
  }

  const data = JSON.parse(fs.readFileSync(auditFile, "utf-8"));
  const branch = (data.branch || "ec").toLowerCase();
  const year = data.year || 2024;

  console.log(`\n========================================================`);
  console.log(`🖼️ [IMAGE PIPELINE] Mirroring assets for GATE ${branch.toUpperCase()} ${year}${data.set ? ` Set ${data.set}` : ""}`);
  console.log(`📄 Reading: ${auditFile}`);
  console.log(`========================================================\n`);

  const imageCache = new Map();
  let mirroredCount = 0;

  for (const q of (data.questions || [])) {
    const beforeCount = imageCache.size;
    q.stem = await rewriteImageSourcesInHtml(q.stem, branch, year, imageCache);
    if (Array.isArray(q.options)) {
      for (let i = 0; i < q.options.length; i++) {
        q.options[i] = await rewriteImageSourcesInHtml(q.options[i], branch, year, imageCache);
      }
    }
    q.rawSolution = await rewriteImageSourcesInHtml(q.rawSolution, branch, year, imageCache);
    mirroredCount += imageCache.size - beforeCount;
  }

  // Save updated audit file with rewritten paths
  fs.writeFileSync(auditFile, JSON.stringify(data, null, 2), "utf-8");

  console.log(`--------------------------------------------------------`);
  console.log(`🎉 [SUCCESS] Mirrored ${imageCache.size} unique diagrams to WebP!`);
  console.log(`📁 Saved to: public/question-images/${branch}/${year}/`);
  console.log(`🔄 Rewrote image paths in ${auditFile}`);
  console.log(`--------------------------------------------------------\n`);

  return { mirroredImages: imageCache.size };
}

export async function processAuditFile(branch, year, set = null) {
  const setSuffix = set ? `-s${set}` : "";
  let auditFile = path.join(ROOT, "audit", branch.toLowerCase(), `raw-${branch.toLowerCase()}-${year}${setSuffix}.json`);
  if (!fs.existsSync(auditFile) && !set) {
    const fallback = path.join(ROOT, "audit", branch.toLowerCase(), `raw-${branch.toLowerCase()}-${year}-s1.json`);
    if (fs.existsSync(fallback)) auditFile = fallback;
  }
  return processAuditFilePath(auditFile);
}

export async function processAllAuditFiles(targetBranch = "all") {
  const branches = targetBranch === "all" ? ["ec", "ee", "me", "ce"] : [targetBranch.toLowerCase()];
  let totalMirrored = 0;

  for (const branch of branches) {
    const branchDir = path.join(ROOT, "audit", branch);
    if (!fs.existsSync(branchDir)) continue;
    const files = fs.readdirSync(branchDir).filter(f => f.startsWith(`raw-${branch}-`) && f.endsWith(".json"));
    for (const file of files) {
      const fullPath = path.join(branchDir, file);
      try {
        const res = await processAuditFilePath(fullPath);
        totalMirrored += res.mirroredImages;
      } catch (err) {
        console.warn(`[WARN] Failed mirroring ${file}:`, err.message);
      }
    }
  }

  console.log(`\n========================================================`);
  console.log(`🎉 [BATCH MIRROR COMPLETE] Total unique images mirrored: ${totalMirrored}`);
  console.log(`========================================================\n`);
  return totalMirrored;
}

if (process.argv[1] && process.argv[1].endsWith("mirror-branch-images.mjs")) {
  const opts = parseArgs();
  if (opts.file) {
    processAuditFilePath(path.resolve(ROOT, opts.file))
      .then((res) => console.log(`Done: ${res.mirroredImages} images mirrored.`))
      .catch((err) => { console.error("[FATAL]", err); process.exit(1); });
  } else if (opts.branch === "all" || !opts.year) {
    processAllAuditFiles(opts.branch)
      .then((count) => console.log(`Batch complete: ${count} images mirrored.`))
      .catch((err) => { console.error("[FATAL]", err); process.exit(1); });
  } else {
    processAuditFile(opts.branch, opts.year, opts.set)
      .then((res) => console.log(`Summary: ${res.mirroredImages} images downloaded, hashed, and optimized.`))
      .catch((err) => { console.error("[FATAL]", err); process.exit(1); });
  }
}
