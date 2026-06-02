#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const IMAGE_DIR = path.join(PUBLIC_DIR, "question-images");
const REPORT_PATH = path.join(ROOT, "artifacts", "review", "local-image-mirror-report.json");
const LOCAL_IMAGE_BASE = "/Gate_QA/question-images";

const TARGET_FILES = [
  path.join(PUBLIC_DIR, "questions-with-answers.json"),
  path.join(PUBLIC_DIR, "questions-filtered.json"),
  path.join(PUBLIC_DIR, "questions-filtered-with-ids.json"),
];

const DETAIL_SHARDS_DIR = path.join(PUBLIC_DIR, "question-detail-shards");
const REMOTE_IMAGE_RE = /https:\/\/(?:[a-z0-9-]+\.)?gateoverflow\.in\/\?qa=blob(?:&amp;|&)qa_blobid=([0-9]+)/gi;

const EXT_BY_CONTENT_TYPE = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
  ["image/bmp", "bmp"],
]);

function ensureDir(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, "utf8");
}

function writeJson(filePath, payload) {
  writeText(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listJsonFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    });
}

function getTargetFiles() {
  return [
    ...TARGET_FILES,
    ...listJsonFiles(DETAIL_SHARDS_DIR),
  ];
}

function normalizeBlobUrl(blobId, sourceUrl = "") {
  const normalizedSourceUrl = String(sourceUrl || "").trim().replace(/&amp;/gi, "&");
  if (normalizedSourceUrl) {
    return normalizedSourceUrl;
  }
  return `https://gateoverflow.in/?qa=blob&qa_blobid=${blobId}`;
}

function extractBlobSources(text = "") {
  const blobSources = new Map();
  for (const match of String(text || "").matchAll(REMOTE_IMAGE_RE)) {
    const blobId = String(match[1] || "").trim();
    if (blobId && !blobSources.has(blobId)) {
      blobSources.set(blobId, normalizeBlobUrl(blobId, match[0]));
    }
  }
  return blobSources;
}

function resolveExtension({ contentType = "", contentDisposition = "" } = {}) {
  const normalizedType = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (EXT_BY_CONTENT_TYPE.has(normalizedType)) {
    return EXT_BY_CONTENT_TYPE.get(normalizedType);
  }

  const filenameMatch = String(contentDisposition || "").match(/filename="?([^";]+)"?/i);
  if (filenameMatch) {
    const ext = path.extname(filenameMatch[1]).replace(/^\./, "").trim().toLowerCase();
    if (ext) {
      return ext;
    }
  }

  return "bin";
}

async function downloadBlobImage(blobId, sourceUrl = "") {
  const url = normalizeBlobUrl(blobId, sourceUrl);
  const response = await fetch(url, {
    headers: {
      "user-agent": "GateQA-image-mirror/1.0 (+https://superawat.github.io/Gate_QA/)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const contentDisposition = response.headers.get("content-disposition") || "";
  const extension = resolveExtension({ contentType, contentDisposition });
  const fileName = `${blobId}.${extension}`;
  const filePath = path.join(IMAGE_DIR, fileName);
  const arrayBuffer = await response.arrayBuffer();

  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  return {
    blobId,
    fileName,
    filePath,
    contentType,
    bytes: Number(response.headers.get("content-length") || arrayBuffer.byteLength || 0),
  };
}

async function ensureLocalImage(blobId, sourceUrl = "") {
  const existing = fs
    .readdirSync(IMAGE_DIR, { withFileTypes: true })
    .find((entry) => entry.isFile() && entry.name.startsWith(`${blobId}.`));

  if (existing) {
    return {
      blobId,
      fileName: existing.name,
      reused: true,
    };
  }

  const downloaded = await downloadBlobImage(blobId, sourceUrl);
  return {
    blobId,
    fileName: downloaded.fileName,
    reused: false,
  };
}

function rewriteRemoteUrls(text, fileNameByBlobId) {
  let replacementCount = 0;
  const nextText = String(text || "").replace(REMOTE_IMAGE_RE, (match, blobId) => {
    const localFileName = fileNameByBlobId.get(String(blobId || "").trim());
    if (!localFileName) {
      return match;
    }
    replacementCount += 1;
    return `${LOCAL_IMAGE_BASE}/${localFileName}`;
  });

  return {
    nextText,
    replacementCount,
  };
}

async function main() {
  ensureDir(IMAGE_DIR);

  const existingTargetFiles = getTargetFiles().filter((filePath) => fs.existsSync(filePath));
  if (!existingTargetFiles.length) {
    throw new Error("No public question bank files found to localize.");
  }

  const rawFiles = existingTargetFiles.map((filePath) => ({
    filePath,
    raw: readText(filePath),
  }));

  const blobUrlById = new Map();
  rawFiles.forEach(({ raw }) => {
    extractBlobSources(raw).forEach((url, blobId) => {
      if (!blobUrlById.has(blobId)) {
        blobUrlById.set(blobId, url);
      }
    });
  });

  const sortedBlobIds = Array.from(blobUrlById.keys()).sort((left, right) => left.localeCompare(right));
  const fileNameByBlobId = new Map();
  const failures = [];
  let downloadedCount = 0;
  let reusedCount = 0;

  for (const blobId of sortedBlobIds) {
    try {
      const result = await ensureLocalImage(blobId, blobUrlById.get(blobId));
      fileNameByBlobId.set(blobId, result.fileName);
      if (result.reused) {
        reusedCount += 1;
      } else {
        downloadedCount += 1;
      }
    } catch (error) {
      failures.push({
        blobId,
        url: normalizeBlobUrl(blobId, blobUrlById.get(blobId)),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const fileUpdates = rawFiles.map(({ filePath, raw }) => {
    const { nextText, replacementCount } = rewriteRemoteUrls(raw, fileNameByBlobId);
    if (nextText !== raw) {
      writeText(filePath, nextText);
    }

    return {
      file: path.relative(ROOT, filePath).replace(/\\/g, "/"),
      replacementCount,
    };
  });

  const report = {
    generatedAt: new Date().toISOString(),
    uniqueBlobCount: sortedBlobIds.length,
    localizedBlobCount: fileNameByBlobId.size,
    downloadedCount,
    reusedCount,
    failedCount: failures.length,
    fileUpdates,
    failures,
  };

  writeJson(REPORT_PATH, report);

  console.log(`[mirror-gateoverflow-images] Unique blob images: ${sortedBlobIds.length}`);
  console.log(`[mirror-gateoverflow-images] Downloaded: ${downloadedCount}`);
  console.log(`[mirror-gateoverflow-images] Reused: ${reusedCount}`);
  console.log(`[mirror-gateoverflow-images] Failed: ${failures.length}`);
  console.log(`[mirror-gateoverflow-images] Report: ${REPORT_PATH}`);

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

await main();
