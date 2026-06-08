#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const IMAGE_DIR = path.join(PUBLIC_DIR, "question-images");
const REPORT_PATH = path.join(
  ROOT,
  "artifacts",
  "review",
  "question-image-validation-report.json"
);

const QUESTION_BANK_CANDIDATES = [
  path.join(PUBLIC_DIR, "questions-with-answers.json"),
  path.join(PUBLIC_DIR, "questions-filtered-with-ids.json"),
  path.join(PUBLIC_DIR, "questions-filtered.json"),
];

const DETAIL_SHARDS_DIR = path.join(PUBLIC_DIR, "question-detail-shards");
const LOCAL_IMAGE_RE = /\/(?:Gate_QA\/)?question-images\/([^"')\s>]+)/g;
const REMOTE_BLOB_RE = /https:\/\/(?:[a-z0-9-]+\.)?gateoverflow\.in\/\?qa=blob(?:&amp;|&)qa_blobid=\d+/gi;

function ensureDir(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function getQuestionBankPath() {
  const found = QUESTION_BANK_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error("Could not find a public question bank JSON file to validate.");
  }
  return found;
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

function getQuestionSourceFiles() {
  return [
    getQuestionBankPath(),
    ...listJsonFiles(DETAIL_SHARDS_DIR),
  ];
}

function getQuestionRecords(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.questions)) {
    return payload.questions;
  }
  if (payload?.recordsByQuestionUid && typeof payload.recordsByQuestionUid === "object") {
    return Object.values(payload.recordsByQuestionUid);
  }
  if (Array.isArray(payload?.records)) {
    return payload.records;
  }
  return [];
}

function extractLocalImageFileNames(html = "") {
  const matches = new Set();
  for (const match of String(html || "").matchAll(LOCAL_IMAGE_RE)) {
    const fileName = String(match[1] || "").trim();
    if (fileName) {
      matches.add(fileName);
    }
  }
  return matches;
}

function main() {
  const generatedAt = new Date().toISOString();
  const questionSourceFiles = getQuestionSourceFiles();
  const questionSources = questionSourceFiles.map((filePath) => ({
    filePath,
    questions: getQuestionRecords(readJson(filePath, [])),
  }));
  const questions = questionSources.flatMap((source) => (
    source.questions.map((question) => ({ ...question, __sourceFile: source.filePath }))
  ));

  const imageDirEntries = fs.existsSync(IMAGE_DIR)
    ? fs.readdirSync(IMAGE_DIR, { withFileTypes: true })
    : [];
  const imageFiles = imageDirEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const imageFileSet = new Set(imageFiles);

  const referencedFileNames = new Set();
  const missingFiles = [];
  const remoteBlobQuestions = [];
  let totalLocalImageRefs = 0;

  questions.forEach((question) => {
    const questionUid = String(question?.question_uid || "").trim();
    const title = String(question?.title || "").trim();
    const html = String(question?.question || "");

    const localRefs = extractLocalImageFileNames(html);
    totalLocalImageRefs += localRefs.size;

    localRefs.forEach((fileName) => {
      referencedFileNames.add(fileName);
      if (!imageFileSet.has(fileName)) {
        missingFiles.push({
          questionUid,
          title,
          fileName,
          sourceFile: path.relative(ROOT, question.__sourceFile || "").replace(/\\/g, "/"),
        });
      }
    });

    const remoteMatches = Array.from(html.matchAll(REMOTE_BLOB_RE)).map((match) => match[0]);
    if (remoteMatches.length > 0) {
      remoteBlobQuestions.push({
        questionUid,
        title,
        remoteImageCount: remoteMatches.length,
        sourceFile: path.relative(ROOT, question.__sourceFile || "").replace(/\\/g, "/"),
      });
    }
  });

  const orphanedFiles = imageFiles.filter((fileName) => !referencedFileNames.has(fileName));
  const report = {
    generatedAt,
    strategy: {
      chosen: "Keep local mirrored images in public/question-images/",
      rationale: [
        "All current question-image references resolve to local /question-images/* paths.",
        "Remote GateOverflow blob URLs would reintroduce a runtime network dependency and CORS/offline risk.",
        "A CDN/external-source switch is unnecessary while every local file is still referenced.",
      ],
      alternativesReviewed: [
        "Option A: keep local images and remove orphaned files",
        "Option B: revert to remote GateOverflow blob URLs",
        "Option C: move images to an external CDN and cache them",
      ],
    },
    source: {
      filesScanned: questionSourceFiles.map((filePath) => path.relative(ROOT, filePath).replace(/\\/g, "/")),
      imageDirectory: path.relative(ROOT, IMAGE_DIR).replace(/\\/g, "/"),
    },
    summary: {
      questionsScanned: questions.length,
      totalImageFiles: imageFiles.length,
      uniqueReferencedImageFiles: referencedFileNames.size,
      totalQuestionsWithLocalImages: questions.reduce((count, question) => {
        return extractLocalImageFileNames(question?.question || "").size > 0 ? count + 1 : count;
      }, 0),
      totalLocalImageRefs,
      missingFileCount: missingFiles.length,
      orphanedFileCount: orphanedFiles.length,
      remoteBlobQuestionCount: remoteBlobQuestions.length,
    },
    missingFiles,
    orphanedFiles,
    remoteBlobQuestions,
    passed:
      missingFiles.length === 0
      && orphanedFiles.length === 0
      && remoteBlobQuestions.length === 0,
  };

  writeJson(REPORT_PATH, report);

  console.log(`[validate-question-images] Scanned ${questions.length} questions`);
  console.log(`[validate-question-images] Image files: ${imageFiles.length}`);
  console.log(`[validate-question-images] Referenced files: ${referencedFileNames.size}`);
  console.log(`[validate-question-images] Missing files: ${missingFiles.length}`);
  console.log(`[validate-question-images] Orphaned files: ${orphanedFiles.length}`);
  console.log(`[validate-question-images] Remote blob questions: ${remoteBlobQuestions.length}`);
  console.log(`[validate-question-images] Report: ${REPORT_PATH}`);

  if (!report.passed) {
    process.exitCode = 1;
  }
}

main();
