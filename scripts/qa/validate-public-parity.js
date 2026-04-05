#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

function readJson(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing file: ${absolutePath}`);
  }
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function getLatestValidationReportPath() {
  const auditDir = path.resolve(ROOT, "audit");
  if (!fs.existsSync(auditDir)) {
    return null;
  }

  const candidates = fs
    .readdirSync(auditDir)
    .filter((fileName) => /^validation-report-\d{4}\.json$/i.test(fileName))
    .sort((left, right) => right.localeCompare(left));

  return candidates.length ? path.join("audit", candidates[0]) : null;
}

function main() {
  const publicQuestionsWithAnswers = readJson("public/questions-with-answers.json");
  const publicQuestionsFiltered = readJson("public/questions-filtered.json");
  const manifest = readJson("public/question-bank-manifest.json");
  const docsSnapshot = readJson("docs/generated/data-status.json");
  const pipelineState = readJson("pipeline-state.json");
  const dataIntegrityReport = readJson("artifacts/review/data-integrity-report.json");
  const latestValidationReportPath = getLatestValidationReportPath();
  const validationReport = latestValidationReportPath
    ? readJson(latestValidationReportPath)
    : null;

  if (!Array.isArray(publicQuestionsWithAnswers) || !Array.isArray(publicQuestionsFiltered)) {
    throw new Error("Public question payloads must both be arrays.");
  }

  const counts = {
    publicQuestionsWithAnswers: publicQuestionsWithAnswers.length,
    publicQuestionsFiltered: publicQuestionsFiltered.length,
    manifestQuestionCount: Number(manifest.questionCount || 0),
    docsSnapshotQuestionCount: Number(docsSnapshot.publicQuestionCount || 0),
    pipelineStatePublishedQuestionCount: Number(
      pipelineState.publishedQuestionsTotal ?? pipelineState.questionsTotal ?? 0
    ),
    dataIntegrityQuestionCount: Number(dataIntegrityReport?.stats?.questions_total || 0),
  };

  if (validationReport) {
    counts.validationReportPublishedQuestionCount = Number(
      validationReport.publishedQuestionCount ?? validationReport.totalBankSize ?? 0
    );
  }

  const uniqueCounts = Array.from(new Set(Object.values(counts)));

  console.log("[public-parity] Count snapshot:");
  for (const [label, value] of Object.entries(counts)) {
    console.log(`- ${label}: ${value}`);
  }

  if (uniqueCounts.length > 1) {
    console.error("\n[public-parity] Count mismatch detected.");
    process.exit(1);
  }

  console.log(`\n[public-parity] OK: all tracked counts agree on ${uniqueCounts[0]}.`);
}

main();
