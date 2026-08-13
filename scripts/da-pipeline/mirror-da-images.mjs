#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import {
  DA_BANK_PATH,
  PUBLIC_DIR,
  ensureDir,
  readJson,
  writeJson,
} from "./da-utils.mjs";

const ROOT = process.cwd();
const IMAGE_DIR = path.join(PUBLIC_DIR, "question-images", "da");
const REPORT_PATH = path.join(ROOT, "artifacts", "review", "da-image-mirror-report.json");
const SOURCE_ORIGIN = "https://practicepaper.in";
const LOCAL_IMAGE_PREFIX = "/question-images/da";
const WEBP_QUALITY = Number.parseInt(process.env.DA_IMAGE_WEBP_QUALITY || "78", 10);
const MAX_IMAGE_SIDE = Number.parseInt(process.env.DA_IMAGE_MAX_SIDE || "2400", 10);
const PRACTICEPAPER_IMAGE_RE = /^\/wp-content\/uploads\/GATE\/DA\//i;

function imageSourceFromAttribute(value = "") {
  const source = String(value || "").trim();
  if (!source || /^data:image\//i.test(source)) {
    return null;
  }

  try {
    const url = new URL(source, SOURCE_ORIGIN);
    if (url.hostname.toLowerCase() !== "practicepaper.in" || !PRACTICEPAPER_IMAGE_RE.test(url.pathname)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function extractImageSources(html = "") {
  const sources = new Set();
  for (const tagMatch of String(html || "").matchAll(/<img\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    const attributes = [...tag.matchAll(/\b(?:src|data-src)\s*=\s*(["'])([\s\S]*?)\1/gi)];
    for (const attribute of attributes) {
      const source = imageSourceFromAttribute(attribute[2]);
      if (source) {
        sources.add(source);
      }
    }
  }
  return [...sources];
}

function fileNameForSource(sourceUrl) {
  return `${crypto.createHash("sha256").update(sourceUrl).digest("hex").slice(0, 24)}.webp`;
}

function localPathForSource(sourceUrl) {
  return `${LOCAL_IMAGE_PREFIX}/${fileNameForSource(sourceUrl)}`;
}

function replaceAttribute(tag, attributeName, value) {
  const expression = new RegExp(`(\\b${attributeName}\\s*=\\s*)(["'])([\\s\\S]*?)\\2`, "i");
  if (expression.test(tag)) {
    return tag.replace(expression, `$1$2${value}$2`);
  }
  return tag;
}

function rewriteHtmlImages(html, localPathBySource) {
  let changed = false;
  const rewritten = String(html || "").replace(/<img\b[^>]*>/gi, (tag) => {
    const attributes = [...tag.matchAll(/\b(?:src|data-src)\s*=\s*(["'])([\s\S]*?)\1/gi)];
    const source = attributes
      .map((attribute) => imageSourceFromAttribute(attribute[2]))
      .find(Boolean);
    if (!source || !localPathBySource.has(source)) {
      return tag;
    }

    const localPath = localPathBySource.get(source);
    let nextTag = tag;
    const srcAttribute = attributes.find((attribute) => /^src$/i.test(attribute[0].split("=")[0].trim()));
    const dataSrcAttribute = attributes.find((attribute) => /^data-src$/i.test(attribute[0].split("=")[0].trim()));
    if (srcAttribute) {
      const srcValue = srcAttribute[2];
      nextTag = replaceAttribute(nextTag, "src", imageSourceFromAttribute(srcValue) ? localPath : localPath);
    } else {
      nextTag = nextTag.replace(/<img\b/i, `<img src="${localPath}"`);
    }
    if (dataSrcAttribute) {
      nextTag = replaceAttribute(nextTag, "data-src", localPath);
    }
    nextTag = nextTag.replace(/\sdata-lazyloaded\s*=\s*(["'])[^"']*\1/gi, "");
    changed ||= nextTag !== tag;
    return nextTag;
  });

  return { html: rewritten, changed };
}

async function downloadAndOptimize(sourceUrl, outputPath) {
  const response = await fetch(sourceUrl, {
    headers: { "user-agent": "GateQA-DA-image-mirror/1.0 (+https://gateqa.in/)" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const input = Buffer.from(await response.arrayBuffer());
  const image = sharp(input, { failOn: "warning" }).rotate();
  const metadata = await image.metadata();
  const transformed = MAX_IMAGE_SIDE > 0
    ? image.resize({
      width: MAX_IMAGE_SIDE,
      height: MAX_IMAGE_SIDE,
      fit: "inside",
      withoutEnlargement: true,
    })
    : image;
  const output = await transformed.webp({ quality: WEBP_QUALITY, effort: 5 }).toBuffer();
  fs.writeFileSync(outputPath, output);

  return {
    sourceBytes: input.byteLength,
    outputBytes: output.byteLength,
    width: metadata.width || null,
    height: metadata.height || null,
  };
}

export async function mirrorDaImages() {
  const questions = readJson(DA_BANK_PATH, []);
  if (!Array.isArray(questions)) {
    throw new Error(`DA question bank is not an array: ${DA_BANK_PATH}`);
  }

  ensureDir(IMAGE_DIR);
  const sourceUrls = new Set();
  for (const question of questions) {
    for (const field of [question?.question, question?.questionHtml]) {
      extractImageSources(field).forEach((source) => sourceUrls.add(source));
    }
    for (const option of Array.isArray(question?.options) ? question.options : []) {
      extractImageSources(option?.html || option).forEach((source) => sourceUrls.add(source));
    }
  }

  const localPathBySource = new Map();
  const failures = [];
  let downloaded = 0;
  let reused = 0;
  let sourceBytes = 0;
  let outputBytes = 0;

  for (const sourceUrl of [...sourceUrls].sort()) {
    const fileName = fileNameForSource(sourceUrl);
    const outputPath = path.join(IMAGE_DIR, fileName);
    try {
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
        reused += 1;
      } else {
        const result = await downloadAndOptimize(sourceUrl, outputPath);
        sourceBytes += result.sourceBytes;
        outputBytes += result.outputBytes;
        downloaded += 1;
      }
      localPathBySource.set(sourceUrl, `${LOCAL_IMAGE_PREFIX}/${fileName}`);
    } catch (error) {
      failures.push({ sourceUrl, error: error instanceof Error ? error.message : String(error) });
    }
  }

  let updatedQuestions = 0;
  let rewrittenReferences = 0;
  for (const question of questions) {
    let questionChanged = false;
    for (const field of ["question", "questionHtml"]) {
      if (typeof question?.[field] !== "string") continue;
      const result = rewriteHtmlImages(question[field], localPathBySource);
      if (result.changed) {
        question[field] = result.html;
        questionChanged = true;
        rewrittenReferences += extractImageSources(result.html).length;
      }
    }
    if (Array.isArray(question?.options)) {
      question.options = question.options.map((option) => {
        if (typeof option === "string") {
          const result = rewriteHtmlImages(option, localPathBySource);
          if (result.changed) questionChanged = true;
          return result.html;
        }
        if (option && typeof option.html === "string") {
          const result = rewriteHtmlImages(option.html, localPathBySource);
          if (result.changed) questionChanged = true;
          return { ...option, html: result.html };
        }
        return option;
      });
    }
    if (questionChanged) updatedQuestions += 1;
  }

  if (updatedQuestions > 0) {
    fs.writeFileSync(DA_BANK_PATH, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
  }

  const report = {
    generatedAt: new Date().toISOString(),
    sourceOrigin: SOURCE_ORIGIN,
    imageCount: sourceUrls.size,
    downloaded,
    reused,
    failed: failures.length,
    updatedQuestions,
    rewrittenReferences,
    webpQuality: WEBP_QUALITY,
    maxImageSide: MAX_IMAGE_SIDE,
    sourceMB: Number((sourceBytes / 1024 / 1024).toFixed(3)),
    outputMB: Number((outputBytes / 1024 / 1024).toFixed(3)),
    savedMB: Number(Math.max(0, (sourceBytes - outputBytes) / 1024 / 1024).toFixed(3)),
    failures,
  };
  writeJson(REPORT_PATH, report);

  console.log(`[mirror-da-images] Images: ${sourceUrls.size}; downloaded: ${downloaded}; reused: ${reused}; failed: ${failures.length}`);
  console.log(`[mirror-da-images] Updated questions: ${updatedQuestions}; report: ${path.relative(ROOT, REPORT_PATH)}`);
  if (failures.length > 0) {
    throw new Error(`Unable to mirror ${failures.length} DA image(s).`);
  }
  return report;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  mirrorDaImages().catch((error) => {
    console.error(`[mirror-da-images] ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}
