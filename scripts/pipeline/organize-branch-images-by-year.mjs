#!/usr/bin/env node

/**
 * scripts/pipeline/organize-branch-images-by-year.mjs
 * ----------------------------------------------------
 * Organizes images in `public/question-images/{branch}/` into nested
 * subdirectories by year: `public/question-images/{branch}/{year}/{filename}`.
 * Updates all file references across audit JSONs, static question-detail shards,
 * and any other relevant files.
 *
 * Usage:
 *   node scripts/pipeline/organize-branch-images-by-year.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT, "public");
const QUESTION_IMAGES_DIR = path.join(PUBLIC_DIR, "question-images");

const BRANCHES = ["ce", "ec", "ee", "me"];

console.log("==================================================================");
console.log("📁 [IMAGE ORGANIZATION] Nesting branch images by year & updating URLs");
console.log("==================================================================\n");

// 1. Move image files into year directories
let totalImagesMoved = 0;
const movesByBranchYear = {};

for (const branch of BRANCHES) {
  const branchDir = path.join(QUESTION_IMAGES_DIR, branch);
  if (!fs.existsSync(branchDir)) {
    console.warn(`[WARN] Directory not found: ${branchDir}`);
    continue;
  }

  const entries = fs.readdirSync(branchDir, { withFileTypes: true });
  movesByBranchYear[branch] = {};

  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const fileName = entry.name;
    const match = fileName.match(new RegExp(`^${branch}-(\\d{4})-[a-f0-9]+\\.webp$`));
    if (!match) {
      console.warn(`[WARN] Non-matching file in ${branch}: ${fileName}`);
      continue;
    }

    const year = match[1];
    const yearDir = path.join(branchDir, year);
    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, { recursive: true });
    }

    const srcPath = path.join(branchDir, fileName);
    const destPath = path.join(yearDir, fileName);

    fs.renameSync(srcPath, destPath);
    movesByBranchYear[branch][year] = (movesByBranchYear[branch][year] || 0) + 1;
    totalImagesMoved++;
  }

  const yearsCount = Object.keys(movesByBranchYear[branch]).length;
  console.log(`✅ Branch ${branch.toUpperCase()}: organized into ${yearsCount} year folders.`);
}

console.log(`\n🎉 Total images moved into year folders: ${totalImagesMoved}\n`);

// 2. Update references across audit, shards, data, etc.
console.log("Updating image references across repository files...");

const fileList = [];

// Audit files
for (const branch of BRANCHES) {
  const auditDir = path.join(ROOT, "audit", branch);
  if (fs.existsSync(auditDir)) {
    fs.readdirSync(auditDir).forEach(f => {
      if (f.endsWith(".json")) fileList.push(path.join(auditDir, f));
    });
  }
}

// Static detail shards
const shardsDir = path.join(PUBLIC_DIR, "question-detail-shards");
if (fs.existsSync(shardsDir)) {
  fs.readdirSync(shardsDir).forEach(f => {
    if (f.endsWith(".json")) fileList.push(path.join(shardsDir, f));
  });
}

// Data solutions
const solutionsDir = path.join(ROOT, "data", "solutions");
if (fs.existsSync(solutionsDir)) {
  fs.readdirSync(solutionsDir).forEach(f => {
    if (f.endsWith(".json")) fileList.push(path.join(solutionsDir, f));
  });
}

// Replacement regex:
// matches /question-images/{branch}/{branch}-{year}-{hash}.webp
// transforms to /question-images/{branch}/{year}/{branch}-{year}-{hash}.webp
const replaceRegex = /\/question-images\/(ce|ec|ee|me)\/\1-(\d{4})-([a-f0-9]+\.webp)/g;

let totalFilesUpdated = 0;
let totalReplacementsMade = 0;

for (const filePath of fileList) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf8");
  if (replaceRegex.test(content)) {
    let countInFile = 0;
    const updated = content.replace(replaceRegex, (match, branch, year, rest) => {
      countInFile++;
      return `/question-images/${branch}/${year}/${branch}-${year}-${rest}`;
    });
    fs.writeFileSync(filePath, updated, "utf8");
    totalFilesUpdated++;
    totalReplacementsMade += countInFile;
  }
}

console.log(`✅ Files updated: ${totalFilesUpdated}`);
console.log(`✅ Total URL references rewritten: ${totalReplacementsMade}`);
console.log("\n==================================================================");
console.log("✨ Image reorganization complete!");
console.log("==================================================================");
