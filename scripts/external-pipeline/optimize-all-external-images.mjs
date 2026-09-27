#!/usr/bin/env node

/**
 * scripts/external-pipeline/optimize-all-external-images.mjs
 *
 * Converts all images in public/question-images/external/ to optimized WebP format,
 * updates image paths in data/isro/ and public/data/isro/ JSON files,
 * and removes legacy unoptimized formats (.jpg, .png) from public/ to keep the bundle lean.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const EXTERNAL_IMAGES_DIR = path.join(ROOT, "public", "question-images", "external");
const DATA_ISRO_DIR = path.join(ROOT, "data", "isro");
const PUBLIC_ISRO_DIR = path.join(ROOT, "public", "data", "isro");
const ISRO_23_25_DIR = path.join(ROOT, "isro23-25");

async function convertImages() {
  console.log("==================================================");
  console.log("OPTIMIZING EXTERNAL QUESTION IMAGES TO WEBP");
  console.log("==================================================");

  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;
  let convertedCount = 0;
  let existingWebpCount = 0;
  const removedFiles = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanDir(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

  const allFiles = scanDir(EXTERNAL_IMAGES_DIR);
  console.log(`Found ${allFiles.length} total files in ${EXTERNAL_IMAGES_DIR}`);

  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const dir = path.dirname(filePath);

    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
      const baseName = path.basename(filePath, ext);
      const webpPath = path.join(dir, `${baseName}.webp`);
      const origSize = fs.statSync(filePath).size;
      totalOriginalBytes += origSize;

      // Convert if webp doesn't exist
      if (!fs.existsSync(webpPath)) {
        const inputBuffer = fs.readFileSync(filePath);
        await sharp(inputBuffer)
          .webp({ quality: 90, effort: 6 })
          .toFile(webpPath);
        const webpSize = fs.statSync(webpPath).size;
        totalWebpBytes += webpSize;
        convertedCount++;
        const savedPct = (1 - webpSize / origSize) * 100;
        console.log(`  [+] Converted: ${fileName} -> ${baseName}.webp (${(origSize / 1024).toFixed(1)} KB -> ${(webpSize / 1024).toFixed(1)} KB, -${savedPct.toFixed(1)}%)`);
      } else {
        const webpSize = fs.statSync(webpPath).size;
        totalWebpBytes += webpSize;
        existingWebpCount++;
      }

      // Remove the non-webp file from public directory
      fs.unlinkSync(filePath);
      removedFiles.push(fileName);
    } else if (ext === ".webp") {
      const webpSize = fs.statSync(filePath).size;
      totalWebpBytes += webpSize;
      existingWebpCount++;
    }
  }

  console.log("\n--- Optimization Summary ---");
  console.log(`Newly Converted to WebP: ${convertedCount}`);
  console.log(`Existing WebP Verified: ${existingWebpCount}`);
  console.log(`Unoptimized Files Removed from public: ${removedFiles.length}`);
  console.log(`Total Final WebP Payload: ${(totalWebpBytes / (1024 * 1024)).toFixed(2)} MB`);
}

function updateJsonReferences() {
  console.log("\n==================================================");
  console.log("UPDATING JSON REFERENCES (.jpg/.png -> .webp)");
  console.log("==================================================");

  const targetDirs = [DATA_ISRO_DIR, PUBLIC_ISRO_DIR, ISRO_23_25_DIR];
  let updatedFiles = 0;

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;
    const jsonFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

    for (const f of jsonFiles) {
      const filePath = path.join(dir, f);
      let content = fs.readFileSync(filePath, "utf8");

      // Replace /question-images/external/isro/something.jpg or .png with .webp
      const updated = content.replace(
        /(\/question-images\/external\/[^\s"'\\<>]+\.)(jpg|jpeg|png)/gi,
        "$1webp"
      );

      if (updated !== content) {
        fs.writeFileSync(filePath, updated, "utf8");
        updatedFiles++;
        console.log(`  [✓] Updated image links in: ${path.relative(ROOT, filePath)}`);
      }
    }
  }

  console.log(`Updated image extensions in ${updatedFiles} JSON files.`);
}

function verifyAllWebpExist() {
  console.log("\n==================================================");
  console.log("VERIFYING ALL REFERENCED WEBP IMAGES EXIST ON DISK");
  console.log("==================================================");

  const checkDirs = [DATA_ISRO_DIR, PUBLIC_ISRO_DIR];
  let totalRefs = 0;
  let missingRefs = [];

  for (const dir of checkDirs) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      const content = fs.readFileSync(path.join(dir, f), "utf8");
      const matches = [...content.matchAll(/\/question-images\/external\/([^\s"'\\<>]+\.webp)/gi)];
      for (const m of matches) {
        totalRefs++;
        const relImgPath = m[1];
        const diskPath = path.join(EXTERNAL_IMAGES_DIR, relImgPath);
        if (!fs.existsSync(diskPath)) {
          missingRefs.push({ file: f, img: relImgPath });
        }
      }
    }
  }

  console.log(`Total WebP image references checked: ${totalRefs}`);
  if (missingRefs.length === 0) {
    console.log("🎉 ALL referenced WebP images exist on disk in public/question-images/external/!");
  } else {
    console.error(`❌ Missing ${missingRefs.length} images:`, missingRefs.slice(0, 10));
    process.exit(1);
  }
}

async function main() {
  await convertImages();
  updateJsonReferences();
  verifyAllWebpExist();
}

main().catch((err) => {
  console.error("Error optimizing images:", err);
  process.exit(1);
});
