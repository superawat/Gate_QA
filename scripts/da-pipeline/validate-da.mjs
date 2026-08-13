#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  DA_BANK_PATH,
  DA_DATA_DIR,
  DA_PUBLISHED_YEARS,
  PUBLIC_DIR,
  readJson,
} from "./da-utils.mjs";

function extractYear(question) {
  return String(question?.year || "").match(/(\d{4})/)?.[1] || "";
}

function extractQuestionNumber(question) {
  return Number.parseInt(
    String(question?.title || "").match(/Question\s*:\s*(\d+)/i)?.[1] || "",
    10
  );
}

const questions = readJson(DA_BANK_PATH, null);
const answerPayload = readJson(path.join(DA_DATA_DIR, "answers-by-question-uid-v1.json"), {});
const answersByQuestionUid = answerPayload?.records_by_question_uid || {};
const errors = [];
const imageReferenceRe = /\b(?:src|data-src)\s*=\s*(["'])([^"']+)\1/gi;
const canonicalSubjects = new Set([
  "probability-and-statistics",
  "linear-algebra",
  "calculus-and-optimization",
  "programming-data-structures-and-algorithms",
  "database-management-and-warehousing",
  "machine-learning",
  "artificial-intelligence",
  "general-aptitude",
]);

if (!Array.isArray(questions)) {
  errors.push(`Missing or invalid DA bank: ${DA_BANK_PATH}`);
} else {
  for (const year of DA_PUBLISHED_YEARS) {
    const rows = questions.filter((question) => extractYear(question) === String(year));
    if (rows.length !== 65) {
      errors.push(`${year}: expected 65 questions, found ${rows.length}`);
    }
    const questionNumbers = rows.map(extractQuestionNumber).sort((a, b) => a - b);
    const expected = Array.from({ length: 65 }, (_, index) => index + 1);
    if (JSON.stringify(questionNumbers) !== JSON.stringify(expected)) {
      errors.push(`${year}: question numbers are not exactly 1..65`);
    }
  }

  const duplicateUids = questions
    .map((question) => `${question.year}:${question.title}`)
    .filter((uid, index, values) => values.indexOf(uid) !== index);
  if (duplicateUids.length) {
    errors.push(`Duplicate question records: ${[...new Set(duplicateUids)].join(", ")}`);
  }

  const invalidRecords = questions.filter((question) => {
    const keys = Object.keys(question).sort().join(",");
    return keys !== "answer,link,question,tags,title,year";
  });
  if (invalidRecords.length) {
    errors.push(`Non-CSE-shaped records found: ${invalidRecords.map((question) => question.title).join(", ")}`);
  }

  const invalidTypes = questions.filter((question) => {
    const types = (question.tags || []).filter((tag) => ["mcq", "msq", "nat"].includes(String(tag || "").toLowerCase()));
    return types.length !== 1;
  });
  if (invalidTypes.length) {
    errors.push(`Invalid question types: ${invalidTypes.map((question) => question.title).join(", ")}`);
  }

  const da2026Questions = questions.filter((question) => extractYear(question) === "2026");
  const malformedDa2026Structure = da2026Questions.filter((question) => {
    const html = String(question.question || "");
    const type = (question.tags || [])
      .map((tag) => String(tag || "").toLowerCase())
      .find((tag) => ["mcq", "msq", "nat"].includes(tag));
    const optionLabels = [...html.matchAll(/<li\b[^>]*data-option-label="([A-D])"/gi)]
      .map((match) => match[1].toUpperCase());
    const hasFourOptions = optionLabels.join(",") === "A,B,C,D";
    const hasStructuredContent = html.trim().length > 0 && !/<p\b/i.test(html);
    const hasCanonicalOptionList = /<ol\b[^>]*style=["']list-style-type:\s*upper-alpha;?["']/i.test(html);
    const hasMojibake = /[ÃÂÎÏâ]/.test(html);

    if (!hasStructuredContent || hasMojibake) return true;
    if (["mcq", "msq"].includes(type)) return !hasFourOptions || !hasCanonicalOptionList;
    return optionLabels.length > 0;
  });
  if (malformedDa2026Structure.length) {
    errors.push(`Malformed DA 2026 structured HTML: ${malformedDa2026Structure.map((question) => question.title).join(", ")}`);
  }

  const invalidSubjects = questions.filter((question) => {
    const subjectTags = (question.tags || []).filter((tag) => (
      !/^gateda-\d{4}$/i.test(String(tag || ""))
      && !["one-mark", "two-marks", "mcq", "msq", "nat"].includes(String(tag || "").toLowerCase())
      && !/^question-\d+$/i.test(String(tag || ""))
    ));
    return subjectTags.length === 0 || !subjectTags.some((tag) => canonicalSubjects.has(String(tag)));
  });
  if (invalidSubjects.length) {
    errors.push(`Unmapped canonical subjects: ${invalidSubjects.map((question) => question.title).join(", ")}`);
  }

  const imageReferences = new Set();
  questions.forEach((question) => {
    for (const match of String(question.question || "").matchAll(imageReferenceRe)) {
      imageReferences.add(match[2]);
    }
  });
  const invalidImageReferences = [...imageReferences].filter((reference) => {
    if (!reference.startsWith("/question-images/da/") || !reference.endsWith(".webp")) return true;
    const absolutePath = path.join(PUBLIC_DIR, reference.replace(/^\/+/, ""));
    return !fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile();
  });
  if (invalidImageReferences.length) {
    errors.push(`DA image references are not local WebP files: ${invalidImageReferences.join(", ")}`);
  }

  const missingAnswers = questions.filter((question) => {
    const goId = String(question.link || "").match(/gateoverflow\.in\/(\d+)/i)?.[1];
    const year = extractYear(question);
    const questionNumber = extractQuestionNumber(question);
    const localUid = `da:${year}:set1:main:q${questionNumber}`;
    // DA 2026 keeps synthetic UIDs even when a GateOverflow solution link is
    // present; older DA rows use the GateOverflow post ID as their UID.
    const answer = year === "2026"
      ? answersByQuestionUid[localUid]?.answer
      : goId
      ? answersByQuestionUid[`go:${goId}`]?.answer
      : answersByQuestionUid[localUid]?.answer;
    return answer === null || answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0);
  });
  if (missingAnswers.length) {
    errors.push(`Missing answers: ${missingAnswers.map((question) => question.title).join(", ")}`);
  }
}

if (errors.length) {
  console.error(`[validate-da] FAILED\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  const counts = Object.fromEntries(
    DA_PUBLISHED_YEARS.map((year) => [year, questions.filter((question) => extractYear(question) === String(year)).length])
  );
  console.log(`[validate-da] PASS: ${questions.length} questions, 100% answer coverage (${JSON.stringify(counts)})`);
}
