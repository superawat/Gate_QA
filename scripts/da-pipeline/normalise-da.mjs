#!/usr/bin/env node

import {
  DA_AUDIT_DIR,
  DA_YEARS,
  cleanText,
  convertLatexTags,
  getExamUid,
  getMarksTag,
  getQuestionTypeTag,
  getQuestionUid,
  readJson,
  sanitizeHtmlFragment,
  slugify,
  writeJson,
} from "./da-utils.mjs";

function normaliseOption(option) {
  const html = convertLatexTags(option?.html || "");
  return {
    label: String(option?.label || "").trim().toUpperCase(),
    text: cleanText(html),
    html,
  };
}

function buildQuestionHtml(rawQuestion) {
  const questionHtml = convertLatexTags(rawQuestion.questionHtml || "");
  const options = Array.isArray(rawQuestion.options) ? rawQuestion.options.map(normaliseOption) : [];
  if (!options.length) {
    return questionHtml;
  }
  const optionList = [
    '<ol style="list-style-type: upper-alpha;">',
    ...options.map((option) => `<li>${option.html}</li>`),
    "</ol>",
  ].join("");
  return `${questionHtml}${optionList}`;
}

const CANONICAL_SUBJECT_MAP = {
  "probability-and-statistics": "probability-and-statistics",
  "linear-algebra": "linear-algebra",
  "calculus-and-optimization": "calculus-and-optimization",
  "programming-in-python": "programming-data-structures-and-algorithms",
  "data-structures": "programming-data-structures-and-algorithms",
  algorithms: "programming-data-structures-and-algorithms",
  "database-management-and-warehousing": "database-management-and-warehousing",
  "machine-learning": "machine-learning",
  "artificial-intelligence": "artificial-intelligence",
  "general-aptitude": "general-aptitude",
  "data-science-and-artificial-intelligence": "artificial-intelligence",
};

function canonicalSubjectSlug(label) {
  const raw = slugify(label);
  return CANONICAL_SUBJECT_MAP[raw] || raw || "uncategorized";
}

function normaliseQuestion(rawQuestion) {
  const year = Number(rawQuestion.year);
  const questionNumber = Number(rawQuestion.questionNumber);
  const type = String(rawQuestion.type || "").trim().toUpperCase();
  const marks = String(rawQuestion.marks || "1").trim();
  const subjects = Array.isArray(rawQuestion.subjects) ? rawQuestion.subjects : [];
  const subject = subjects[0] || { label: "Uncategorized", href: "" };
  const subjectSlug = canonicalSubjectSlug(subject.label);
  const options = Array.isArray(rawQuestion.options) ? rawQuestion.options.map(normaliseOption) : [];
  const questionUid = getQuestionUid(year, questionNumber);
  const examUid = getExamUid(year, questionNumber);
  const category = String(year);
  const questionHtml = buildQuestionHtml(rawQuestion);
  const tags = [
    `gateda-${year}`,
    subjectSlug,
    ...subjects.slice(1).map((entry) => canonicalSubjectSlug(entry.label)).filter(Boolean),
    getMarksTag(marks),
    getQuestionTypeTag(type),
    `question-${questionNumber}`,
  ];

  return {
    title: `GATE DA ${year} | Question: ${questionNumber}`,
    link: `${rawQuestion.pageUrl}#q${questionNumber}`,
    question: sanitizeHtmlFragment(questionHtml),
    options,
    tags: [...new Set(tags)],
    question_uid: questionUid,
    exam_uid: examUid,
    answer_uid: examUid,
    year: `gateda-${year}`,
    category,
    paper: "DA",
    question_number: questionNumber,
    subject: subject.label,
    subject_slug: subjectSlug,
    source_url: rawQuestion.pageUrl,
    reference_link: rawQuestion.referenceLink || null,
    type,
    marks: Number(marks),
    raw_answer: {
      correctOptions: rawQuestion.correctOptions || [],
      natValue1: rawQuestion.natValue1 || null,
      natValue2: rawQuestion.natValue2 || null,
      natValue3: rawQuestion.natValue3 || null,
    },
  };
}

function normaliseYear(year) {
  const input = `${DA_AUDIT_DIR}/raw-practicepaper-da-${year}.json`;
  const payload = readJson(input);
  if (!payload || !Array.isArray(payload.pages)) {
    throw new Error(`Missing or invalid scrape output: ${input}`);
  }
  const questions = payload.pages.flatMap((page) => page.questions || []).map(normaliseQuestion);
  const output = `${DA_AUDIT_DIR}/normalised-practicepaper-da-${year}.json`;
  writeJson(output, { year, source: payload.source, questions });
  console.log(`[normalise-da] Wrote ${questions.length} normalized questions for ${year}`);
}

for (const year of DA_YEARS) {
  normaliseYear(year);
}
