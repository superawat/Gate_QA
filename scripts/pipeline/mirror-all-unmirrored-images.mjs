#!/usr/bin/env node

/**
 * scripts/pipeline/mirror-all-unmirrored-images.mjs
 * -------------------------------------------------
 * Scans public/question-detail-shards, data/solutions, and audit directories
 * for any external / unmirrored image URLs.
 * Downloads them from practicepaper.in (with known fallbacks / typo fixes),
 * converts to optimized WebP in public/question-images/{branch}/{year}/,
 * and rewrites the HTML image tags across all files to local /question-images/... paths.
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
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Known URL corrections / fallbacks
const URL_OVERRIDES = {
  // PracticePaper typo: a52 instead of q52 for EE 2014 Set 3 Question 52
  "/wp-content/uploads/GATE/EE/20143/a52.jpg": "https://practicepaper.in/wp-content/uploads/GATE/EE/20143/q52.jpg",
  // PracticePaper stored ME 2014 Set 3 GA Q62 diagram under CS Set 3
  "/wp-content/uploads/GATE/ME/20143/q62.jpg": "https://practicepaper.in/wp-content/uploads/GATE/CS/20143/q62.jpg",
  // Legacy gatecse external image for 2012
  "http://gatecse.in/w/images/c/c5/2012_12.png": "http://gatecse.in/w/images/c/c5/2012_12.png",
};

// Global in-memory cache of raw URL -> local webp relative path
const imageMap = new Map();

/**
 * Determine branch and year from a URL or fallback context
 */
function inferBranchAndYear(rawUrl, defaultBranch = "gen", defaultYear = "2024") {
  if (rawUrl.includes("2012_12.png") || rawUrl.includes("gatecse.in")) {
    return { branch: "cse", year: "2012" };
  }

  // Pattern: /wp-content/uploads/GATE/{BRANCH}/{YEAR}{SET}/...
  const match = rawUrl.match(/\/wp-content\/uploads\/GATE\/([A-Za-z]+)\/(\d{4})/i);
  if (match) {
    let b = match[1].toLowerCase();
    if (b === "cs") b = "cse";
    return {
      branch: b,
      year: match[2],
    };
  }

  const match2 = rawUrl.match(/(\d{4})/);
  if (match2) {
    return {
      branch: defaultBranch.toLowerCase(),
      year: match2[1],
    };
  }

  return { branch: defaultBranch.toLowerCase(), year: String(defaultYear) };
}

/**
 * Download, hash, convert to WebP, and save locally
 */
async function mirrorSingleImage(rawSrc, defaultBranch = "gen", defaultYear = "2024") {
  let cleanSrc = rawSrc.replace(/^["']|["']$/g, "").trim();
  cleanSrc = cleanSrc.replace(/\\/g, ""); // strip stray backslashes

  if (imageMap.has(cleanSrc)) {
    return imageMap.get(cleanSrc);
  }
  if (imageMap.has(rawSrc)) {
    return imageMap.get(rawSrc);
  }

  // Check if it's already a valid local path
  if (cleanSrc.startsWith("/question-images/") || cleanSrc.startsWith("/Gate_QA/question-images/")) {
    const rel = cleanSrc.replace("/Gate_QA/", "/");
    const diskPath = path.join(PUBLIC_DIR, rel.slice(1));
    if (fs.existsSync(diskPath)) {
      imageMap.set(cleanSrc, rel);
      imageMap.set(rawSrc, rel);
      return rel;
    }
  }

  // Build target download URL
  let downloadUrl = URL_OVERRIDES[cleanSrc] || URL_OVERRIDES[rawSrc];
  if (!downloadUrl) {
    if (cleanSrc.startsWith("http://") || cleanSrc.startsWith("https://")) {
      downloadUrl = cleanSrc;
    } else {
      downloadUrl = `${BASE_HOST}${cleanSrc.startsWith("/") ? "" : "/"}${cleanSrc}`;
    }
  }

  const { branch, year } = inferBranchAndYear(cleanSrc, defaultBranch, defaultYear);

  try {
    const res = await fetch(downloadUrl, {
      headers: {
        "user-agent": USER_AGENT,
        referer: "https://practicepaper.in/",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[MIRROR_WARN] Failed to fetch ${downloadUrl} (status: ${res.status})`);
      return null;
    }

    const rawBuffer = Buffer.from(await res.arrayBuffer());
    if (rawBuffer.length === 0) {
      console.warn(`[MIRROR_WARN] Empty buffer for ${downloadUrl}`);
      return null;
    }

    const hash = crypto.createHash("sha256").update(rawBuffer).digest("hex").slice(0, 10);
    const fileName = `${branch}-${year}-${hash}.webp`;
    const targetDir = path.join(PUBLIC_DIR, "question-images", branch, String(year));
    fs.mkdirSync(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, fileName);

    if (!fs.existsSync(targetPath)) {
      await sharp(rawBuffer).webp({ quality: 85, effort: 4 }).toFile(targetPath);
    }

    const localWebpPath = `/question-images/${branch}/${year}/${fileName}`;
    imageMap.set(cleanSrc, localWebpPath);
    imageMap.set(rawSrc, localWebpPath);
    return localWebpPath;
  } catch (err) {
    console.warn(`[MIRROR_ERROR] Error fetching ${downloadUrl}: ${err.message}`);
    return null;
  }
}

/**
 * Recursively extract unmirrored URLs from parsed JSON structures
 */
function extractImageUrlsFromParsed(val, urlSet) {
  if (!val) return;
  if (typeof val === "string") {
    if (!val.includes("<img") && !val.includes("<IMG")) return;
    const reg = /<img\b([^>]*?)\bsrc[&]?\s*=\s*(?:["']([^"']+)["']|(\S+))([^>]*)>/gi;
    let m;
    while ((m = reg.exec(val)) !== null) {
      let src = m[2] || m[3] || "";
      src = src.replace(/^["']|["']$/g, "").trim();
      if (!src) continue;
      if (
        src.startsWith("/question-images/") ||
        src.startsWith("/images/") ||
        src.startsWith("/Gate_QA/") ||
        src.startsWith("images/aptitude/")
      ) {
        continue;
      }
      urlSet.add(src);
    }
  } else if (Array.isArray(val)) {
    for (const item of val) extractImageUrlsFromParsed(item, urlSet);
  } else if (typeof val === "object") {
    for (const key of Object.keys(val)) {
      extractImageUrlsFromParsed(val[key], urlSet);
    }
  }
}

/**
 * Scan all JSON files in a directory using JSON.parse
 */
function collectUnmirroredUrlsFromDir(dirPath, urlSet) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== "node_modules" && ent.name !== ".git") {
        collectUnmirroredUrlsFromDir(full, urlSet);
      }
    } else if (ent.isFile() && ent.name.endsWith(".json")) {
      try {
        const raw = fs.readFileSync(full, "utf-8");
        if (raw.includes("<img") || raw.includes("<IMG")) {
          const parsed = JSON.parse(raw);
          extractImageUrlsFromParsed(parsed, urlSet);
        }
      } catch (e) {}
    }
  }
}

/**
 * Rewrite image tags in a single HTML string
 */
function rewriteHtmlString(html) {
  if (!html || typeof html !== "string") return html;
  if (!html.includes("<img") && !html.includes("<IMG")) return html;

  return html.replace(/<img\b([^>]*?)\bsrc[&]?\s*=\s*(?:["']([^"']+)["']|(\S+))([^>]*)>/gi, (fullTag, beforeSrc, src1, src2, afterSrc) => {
    let rawSrc = src1 || src2 || "";
    rawSrc = rawSrc.replace(/^["']|["']$/g, "").trim();
    const cleanSrc = rawSrc.replace(/\\/g, "");

    const localPath = imageMap.get(cleanSrc) || imageMap.get(rawSrc);
    if (localPath) {
      const cleanBefore = (beforeSrc || "").trim();
      const cleanAfter = (afterSrc || "").trim();
      const attrs = [cleanBefore, cleanAfter].filter(Boolean).join(" ");
      return `<img src="${localPath}"${attrs ? ` ${attrs}` : ""}>`;
    }

    return fullTag;
  });
}

/**
 * Recursively walk an object/array and rewrite all string properties
 */
function deepRewrite(obj) {
  if (!obj) return obj;
  if (typeof obj === "string") {
    return rewriteHtmlString(obj);
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = deepRewrite(obj[i]);
    }
    return obj;
  }
  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      obj[key] = deepRewrite(obj[key]);
    }
    return obj;
  }
  return obj;
}

/**
 * Process and update all JSON files in a directory
 */
function updateJsonFilesInDir(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let count = 0;

  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== "node_modules" && ent.name !== ".git") {
        count += updateJsonFilesInDir(full);
      }
    } else if (ent.isFile() && ent.name.endsWith(".json")) {
      try {
        const raw = fs.readFileSync(full, "utf-8");
        if (raw.includes("<img") || raw.includes("<IMG")) {
          const parsed = JSON.parse(raw);
          deepRewrite(parsed);
          const newRaw = JSON.stringify(parsed, null, 2);
          if (newRaw !== raw) {
            fs.writeFileSync(full, newRaw, "utf-8");
            count++;
          }
        }
      } catch (err) {
        console.error(`[UPDATE_ERROR] Failed to update ${full}:`, err.message);
      }
    }
  }
  return count;
}

async function main() {
  console.log("================================================================");
  console.log("🚀 Starting Full Question Image Mirror & Normalization Pipeline");
  console.log("================================================================\n");

  const unmirroredUrls = new Set();

  console.log("📦 Phase 1: Scanning for unmirrored image URLs...");
  collectUnmirroredUrlsFromDir(path.join(PUBLIC_DIR, "question-detail-shards"), unmirroredUrls);
  collectUnmirroredUrlsFromDir(path.join(ROOT, "data", "solutions"), unmirroredUrls);
  collectUnmirroredUrlsFromDir(path.join(ROOT, "audit"), unmirroredUrls);

  console.log(`Found ${unmirroredUrls.size} unique unmirrored image URLs.\n`);

  console.log("⬇️ Phase 2: Downloading, hashing & converting to WebP...");
  let downloadedCount = 0;
  let failedCount = 0;
  const urlList = Array.from(unmirroredUrls);

  const CHUNK_SIZE = 15;
  for (let i = 0; i < urlList.length; i += CHUNK_SIZE) {
    const chunk = urlList.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (url) => {
        const result = await mirrorSingleImage(url);
        if (result) {
          downloadedCount++;
        } else {
          failedCount++;
        }
      })
    );
    process.stdout.write(
      `Progress: ${Math.min(i + CHUNK_SIZE, urlList.length)}/${urlList.length} (Success: ${downloadedCount}, Fail: ${failedCount})\r`
    );
  }

  console.log(`\n\n✅ Mirroring complete! ${downloadedCount} converted, ${failedCount} failed.\n`);

  console.log("✍️ Phase 3: Rewriting image tags across all JSON files...");
  const shardsUpdated = updateJsonFilesInDir(path.join(PUBLIC_DIR, "question-detail-shards"));
  console.log(`Updated ${shardsUpdated} shard files.`);

  const solutionsUpdated = updateJsonFilesInDir(path.join(ROOT, "data", "solutions"));
  console.log(`Updated ${solutionsUpdated} solutions files.`);

  const auditUpdated = updateJsonFilesInDir(path.join(ROOT, "audit"));
  console.log(`Updated ${auditUpdated} audit files.\n`);

  console.log("================================================================");
  console.log("🎉 All unmirrored question diagrams successfully mirrored & saved!");
  console.log("================================================================");
}

main().catch(err => {
  console.error("Pipeline fatal error:", err);
  process.exit(1);
});
