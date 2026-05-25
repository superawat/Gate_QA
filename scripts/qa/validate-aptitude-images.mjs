#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(ROOT, 'public/data/aptitude');
const IMAGE_BUDGET_MB = Number.parseFloat(process.env.APTITUDE_IMAGE_BUDGET_MB || '20');
const MAX_IMAGE_KB = Number.parseFloat(process.env.APTITUDE_MAX_IMAGE_KB || '300');

function rowHtmlFragments(row) {
  const fragments = [];
  if (row.questionHtml) {
    fragments.push(['questionHtml', row.questionHtml]);
  }
  if (Array.isArray(row.options)) {
    row.options.forEach((option, index) => {
      if (option) {
        fragments.push([`options[${index}]`, option]);
      }
    });
  }
  return fragments;
}

async function main() {
  const subjects = await fs.readdir(DATA_DIR);
  let errorCount = 0;
  const referencedImages = new Set();
  
  const imgRegex = /<img[^>]+src=["'](http[^"']+)["'][^>]*>/gi;
  const absoluteImgRegex = /<img[^>]+src=["'](\/images\/aptitude\/[^"']+)["'][^>]*>/gi;
  const localImgRegex = /<img[^>]+src=["'](images\/aptitude\/[^"']+)["'][^>]*>/gi;

  for (const subject of subjects) {
    const subjectPath = path.join(DATA_DIR, subject);
    const stat = await fs.stat(subjectPath);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(subjectPath);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(subjectPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      const rows = JSON.parse(content);
      
      for (const row of rows) {
        for (const [field, html] of rowHtmlFragments(row)) {
          let match;

          imgRegex.lastIndex = 0;
          while ((match = imgRegex.exec(html)) !== null) {
            console.error(`[ERROR] Remote image found in ${row.uid} ${field}: ${match[1]}`);
            errorCount++;
          }

          absoluteImgRegex.lastIndex = 0;
          while ((match = absoluteImgRegex.exec(html)) !== null) {
            console.error(`[ERROR] Root-absolute aptitude image path found in ${row.uid} ${field}: ${match[1]}`);
            errorCount++;
          }

          localImgRegex.lastIndex = 0;
          while ((match = localImgRegex.exec(html)) !== null) {
            const localRef = match[1];
            const imgPath = path.join(ROOT, 'public', localRef);
            try {
              const stat = await fs.stat(imgPath);
              referencedImages.add(localRef);
              if (stat.size > MAX_IMAGE_KB * 1024) {
                console.error(`[ERROR] Aptitude image exceeds ${MAX_IMAGE_KB} KB in ${row.uid} ${field}: ${localRef} (${Math.round(stat.size / 1024)} KB)`);
                errorCount++;
              }
              if (path.extname(localRef).toLowerCase() !== '.webp') {
                console.error(`[ERROR] Aptitude image is not WebP in ${row.uid} ${field}: ${localRef}`);
                errorCount++;
              }
              try {
                await sharp(imgPath, { failOn: 'warning' }).metadata();
              } catch {
                console.error(`[ERROR] Invalid local image payload in ${row.uid} ${field}: ${localRef}`);
                errorCount++;
              }
            } catch (e) {
              console.error(`[ERROR] Broken local image link in ${row.uid} ${field}: ${localRef}`);
              errorCount++;
            }
          }
        }
      }
    }
  }

  let totalBytes = 0;
  for (const localRef of referencedImages) {
    const imgPath = path.join(ROOT, 'public', localRef);
    try {
      const stat = await fs.stat(imgPath);
      totalBytes += stat.size;
    } catch {
      // Broken references are already reported above.
    }
  }

  const budgetBytes = IMAGE_BUDGET_MB * 1024 * 1024;
  if (totalBytes > budgetBytes) {
    console.error(`[ERROR] Aptitude image payload exceeds ${IMAGE_BUDGET_MB} MB budget: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    errorCount++;
  }
  
  if (errorCount > 0) {
    console.error(`\nValidation failed: ${errorCount} image errors found.`);
    process.exit(1);
  } else {
    console.log(`Image validation passed. ${referencedImages.size} local images, ${(totalBytes / 1024 / 1024).toFixed(2)} MB.`);
  }
}

main().catch(console.error);
