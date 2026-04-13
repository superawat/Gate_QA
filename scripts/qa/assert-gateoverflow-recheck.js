#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function readJson(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing file: ${absolutePath}`);
  }
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function main() {
  const historical = readJson("artifacts/review/historical-paper-audit.json").summary || {};
  const pre2010 = readJson("artifacts/review/pre-2010-gateoverflow-audit.json").summary || {};
  const answers = readJson("artifacts/review/gateoverflow-answer-coverage.json").summary || {};

  const failures = [];

  if ((historical.papers_with_missing_slots || 0) > 0) {
    failures.push("historical papers have missing slots");
  }
  if ((historical.papers_with_duplicate_slots || 0) > 0) {
    failures.push("historical papers have duplicate logical slots");
  }
  if ((historical.papers_with_malformed_exam_uids || 0) > 0) {
    failures.push("historical papers have malformed exam_uids");
  }
  if ((historical.questions_without_paper_meta || 0) > 0) {
    failures.push("historical audit found questions without paper metadata");
  }
  if ((pre2010.mismatching_question_counts || 0) > 0) {
    failures.push("pre-2010 audit found question-count mismatches");
  }
  if ((pre2010.mismatching_question_labels || 0) > 0) {
    failures.push("pre-2010 audit found question-label mismatches");
  }
  if ((pre2010.years_with_fetch_errors || 0) > 0) {
    failures.push("pre-2010 audit encountered fetch errors");
  }
  if ((answers.missing_answer_actionable || 0) > 0) {
    failures.push("GateOverflow answer coverage has actionable gaps");
  }

  if (failures.length > 0) {
    console.error("[assert-gateoverflow-recheck] Recheck failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("[assert-gateoverflow-recheck] Recheck passed.");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(
      `[assert-gateoverflow-recheck] Failed: ${error instanceof Error ? error.stack || error.message : String(error)}`
    );
    process.exitCode = 1;
  }
}

module.exports = {
  main,
  readJson,
};
