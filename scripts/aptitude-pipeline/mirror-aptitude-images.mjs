#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(ROOT, 'public/data/aptitude');
const IMAGE_DIR = path.join(ROOT, 'public/images/aptitude');
const PUBLIC_IMAGE_PREFIX = 'images/aptitude';
const REVIEW_DIR = path.join(ROOT, 'artifacts/review');
const REPORT_FILE = path.join(REVIEW_DIR, 'aptitude-image-mirror-report.json');
const WEBP_QUALITY = Number.parseInt(process.env.APTITUDE_IMAGE_WEBP_QUALITY || '78', 10);

async function downloadImage(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'unknown';

  let image;
  try {
    image = sharp(buffer, { failOn: 'warning' }).rotate();
    await image.metadata();
  } catch {
    throw new Error(`Downloaded payload is not a valid image (${contentType}): ${url}`);
  }

  const webpBuffer = await image.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
  await fs.writeFile(dest, webpBuffer);
}

async function readPreviousFailures() {
  try {
    const report = JSON.parse(await fs.readFile(REPORT_FILE, 'utf8'));
    return report.failedUrls || {};
  } catch {
    return {};
  }
}

async function mirrorHtmlImages(html, report, failedUrlCache) {
  if (!html) {
    return { html, modified: false };
  }

  const imgRegex = /<img[^>]+src=["'](http[^"']+)["'][^>]*>/gi;
  const absoluteLocalRegex = /(<img[^>]+src=["'])\/images\/aptitude\//gi;
  let newHtml = String(html);
  let modified = false;

  newHtml = newHtml.replace(absoluteLocalRegex, `$1${PUBLIC_IMAGE_PREFIX}/`);
  if (newHtml !== html) {
    modified = true;
  }

  let match;
  while ((match = imgRegex.exec(String(html))) !== null) {
    const srcUrl = match[1];

    const hash = crypto.createHash('md5').update(srcUrl).digest('hex');
    const filename = `${hash}.webp`;
    const destPath = path.join(IMAGE_DIR, filename);
    const newSrc = `${PUBLIC_IMAGE_PREFIX}/${filename}`;

    if (failedUrlCache.has(srcUrl)) {
      newHtml = newHtml.replace(match[0], '[Image Missing]');
      report.cachedFailures += 1;
      modified = true;
      continue;
    }

    try {
      await fs.access(destPath);
      report.reused += 1;
    } catch (e) {
      console.log(`Downloading: ${srcUrl}`);
      try {
        await downloadImage(srcUrl, destPath);
        report.downloaded += 1;
      } catch (err) {
        console.warn(err.message);
        report.failed += 1;
        report.failedUrls[srcUrl] = err.message;
        failedUrlCache.add(srcUrl);
        newHtml = newHtml.replace(match[0], '[Image Missing]');
        modified = true;
        continue;
      }
    }

    newHtml = newHtml.replace(srcUrl, newSrc);
    modified = true;
  }

  return { html: newHtml, modified };
}

async function processFile(filePath, report, failedUrlCache) {
  const content = await fs.readFile(filePath, 'utf8');
  const rows = JSON.parse(content);
  let modified = false;

  for (const row of rows) {
    let rowModified = false;

    const mirroredQuestion = await mirrorHtmlImages(row.questionHtml || '', report, failedUrlCache);
    if (mirroredQuestion.modified) {
      row.questionHtml = mirroredQuestion.html;
      rowModified = true;
    }

    if (Array.isArray(row.options)) {
      for (let index = 0; index < row.options.length; index += 1) {
        const mirroredOption = await mirrorHtmlImages(row.options[index] || '', report, failedUrlCache);
        if (mirroredOption.modified) {
          row.options[index] = mirroredOption.html;
          rowModified = true;
        }
      }
    }

    if (rowModified) {
      modified = true;
    }
  }

  if (modified) {
    await fs.writeFile(filePath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
    console.log(`Updated ${path.relative(ROOT, filePath)}`);
    report.updatedFiles.push(path.relative(ROOT, filePath));
  }
}

async function main() {
  await fs.mkdir(IMAGE_DIR, { recursive: true });
  await fs.mkdir(REVIEW_DIR, { recursive: true });
  const previousFailures = await readPreviousFailures();
  const failedUrlCache = new Set(Object.keys(previousFailures));
  const report = {
    generatedAt: new Date().toISOString(),
    downloaded: 0,
    reused: 0,
    failed: 0,
    cachedFailures: 0,
    updatedFiles: [],
    failedUrls: { ...previousFailures },
  };

  const subjects = await fs.readdir(DATA_DIR);
  for (const subject of subjects) {
    const subjectPath = path.join(DATA_DIR, subject);
    const stat = await fs.stat(subjectPath);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(subjectPath);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      await processFile(path.join(subjectPath, file), report, failedUrlCache);
    }
  }

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`Image mirror report: ${path.relative(ROOT, REPORT_FILE)}`);
}

main().catch(console.error);
