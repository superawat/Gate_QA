#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const {
  BASE_URL,
  buildCandidateTags,
  buildJsonIndex,
  cleanText,
  crawlGateOverflowYear,
  extractCseYear,
  extractGoId,
  extractQuestionLabel,
  getYearsToAudit,
  readJson,
  resolveLiveTag,
  writeJson,
} = require("./pre-2010-gateoverflow-audit.js");
const { cleanInvisibleText } = require("./repair-historical-exam-uids.js");

const DEFAULT_INPUT = "public/questions-with-answers.json";
const DEFAULT_OUTPUT = "artifacts/review/questions-with-answers.pre-2010-repaired.json";
const DEFAULT_REPORT = "artifacts/review/pre-2010-question-repair-report.json";
const DEFAULT_FROM_YEAR = 1987;
const DEFAULT_TO_YEAR = 2009;
const DEFAULT_ANSWER_LOOKUP = "public/data/answers/answers_by_question_uid_v1.json";

function parseArgs(argv) {
  const result = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    report: DEFAULT_REPORT,
    fromYear: DEFAULT_FROM_YEAR,
    toYear: DEFAULT_TO_YEAR,
    write: false,
    years: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--input" && argv[index + 1]) {
      result.input = argv[++index];
      continue;
    }
    if (arg === "--output" && argv[index + 1]) {
      result.output = argv[++index];
      continue;
    }
    if (arg === "--report" && argv[index + 1]) {
      result.report = argv[++index];
      continue;
    }
    if (arg === "--from-year" && argv[index + 1]) {
      result.fromYear = Number.parseInt(argv[++index], 10) || DEFAULT_FROM_YEAR;
      continue;
    }
    if (arg === "--to-year" && argv[index + 1]) {
      result.toYear = Number.parseInt(argv[++index], 10) || DEFAULT_TO_YEAR;
      continue;
    }
    if (arg === "--year" && argv[index + 1]) {
      const parsed = Number.parseInt(argv[++index], 10);
      if (Number.isFinite(parsed)) {
        result.years.push(parsed);
      }
      continue;
    }
    if (arg === "--write") {
      result.write = true;
    }
  }

  return result;
}

function readOptionalJson(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function getHistoricalRowScore(row = {}) {
  let score = 0;

  if (row.answer_uid) {
    score += 30;
  }
  if (row.answer_meta && typeof row.answer_meta === "object") {
    score += 20;
  }
  if (row.question_uid && !String(row.question_uid).startsWith("local:")) {
    score += 15;
  }
  if (Array.isArray(row.tags) && row.tags.length > 0) {
    score += 10;
  }

  const link = String(row.link || "");
  const title = String(row.title || "");
  const question = String(row.question || "");
  const variantPenalty = /(?:modified|version|ugcnet|isro|pgee|blog|doubt|why option)/i.test(`${title} ${link}`)
    ? 25
    : 0;

  score += Math.min(question.length, 2000) / 1000;
  score += Math.min(title.length, 200) / 1000;

  return score - variantPenalty;
}

function normalizeRow(row = {}) {
  const nextRow = {
    ...row,
    title: cleanInvisibleText(row.title || ""),
  };

  if (typeof nextRow.year === "string") {
    nextRow.year = nextRow.year.trim();
  }

  if (Array.isArray(nextRow.tags)) {
    nextRow.tags = Array.from(
      new Set(
        nextRow.tags
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
      )
    );
  }

  return nextRow;
}

function buildPre2010ExamUid(year, questionLabel) {
  const token = String(questionLabel || "")
    .trim()
    .replace(/\./g, "-");
  return token ? `cse:${year}:set1:main:q${token}` : null;
}

function parseQuestionPage(html = "", fallbackUrl = "") {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const heading =
    doc.querySelector(".qa-main-heading h1") ||
    doc.querySelector("h1");
  const title = cleanInvisibleText(heading?.textContent?.trim() || "");

  const qContent =
    doc.querySelector(".qa-q-view-content .entry-content") ||
    doc.querySelector(".qa-q-view-content") ||
    doc.querySelector(".entry-content");

  let questionHtml = "";
  if (qContent) {
    for (const bad of qContent.querySelectorAll(
      ".qa-q-view-who, .qa-q-view-when, .qa-q-view-flags, .qa-q-view-buttons"
    )) {
      bad.remove();
    }
    questionHtml = qContent.innerHTML.trim();
  }

  const tags = [];
  for (const tagLink of doc.querySelectorAll(".qa-tag-link, a[href*='/tag/']")) {
    const tag = cleanText(tagLink.textContent || "");
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  const canonicalUrl =
    doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
    fallbackUrl;

  const yearTag = tags.find((tag) => /^gate(?:cse-)?\d{4}/i.test(tag)) || "";

  return {
    title,
    year: yearTag,
    link: canonicalUrl || fallbackUrl,
    question: questionHtml,
    tags,
  };
}

async function fetchQuestionPage(goId, fetchCache) {
  if (fetchCache.has(goId)) {
    return fetchCache.get(goId);
  }

  const response = await fetch(`${BASE_URL}/${goId}`, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; GateQA-Pre2010Repair/1.0; +https://github.com/superawat/Gate_QA)",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const result = {
      ok: false,
      status: response.status,
      parsed: null,
    };
    fetchCache.set(goId, result);
    return result;
  }

  const html = await response.text();
  const parsed = parseQuestionPage(html, `${BASE_URL}/${goId}`);
  const result = {
    ok: true,
    status: response.status,
    parsed,
  };
  fetchCache.set(goId, result);
  return result;
}

function getAnswerFields(answerLookupPayload, questionUid) {
  const record = answerLookupPayload?.records_by_question_uid?.[questionUid];
  if (!record || typeof record !== "object") {
    return {};
  }

  const answerMeta = {
    type: record.type || null,
    answer: record.answer ?? null,
    tolerance: record.tolerance ?? null,
    source: "question_uid",
  };

  return {
    answer_uid: record.answer_uid || null,
    answer_meta: answerMeta,
  };
}

function buildYearRecordIndex(rows = [], { fromYear, toYear }) {
  const index = new Map();

  rows.forEach((row, rowIndex) => {
    const year = extractCseYear(row);
    if (!Number.isFinite(year) || year < fromYear || year > toYear) {
      return;
    }

    if (!index.has(year)) {
      index.set(year, []);
    }

    const questionLabel = extractQuestionLabel(row, year);
    const goId = extractGoId(row.question_uid || "") || extractGoId(row.link || "");
    index.get(year).push({
      rowIndex,
      year,
      row,
      questionLabel,
      goId,
      score: getHistoricalRowScore(row),
    });
  });

  return index;
}

function pickPreferredRows(records = [], desiredLabels = new Set()) {
  const preferredByLabel = new Map();
  const removals = [];

  for (const record of records) {
    if (!record.questionLabel) {
      removals.push({
        reason: "missing_question_label",
        row_index: record.rowIndex,
        question_uid: record.row.question_uid || null,
        link: record.row.link || "",
        title: record.row.title || "",
      });
      continue;
    }

    if (!desiredLabels.has(record.questionLabel)) {
      removals.push({
        reason: "question_label_not_on_gateoverflow_year_tag",
        row_index: record.rowIndex,
        question_uid: record.row.question_uid || null,
        link: record.row.link || "",
        title: record.row.title || "",
        question_label: record.questionLabel,
      });
      continue;
    }

    const existing = preferredByLabel.get(record.questionLabel);
    if (!existing) {
      preferredByLabel.set(record.questionLabel, record);
      continue;
    }

    if (record.score > existing.score) {
      removals.push({
        reason: "duplicate_question_label_lower_score",
        row_index: existing.rowIndex,
        question_uid: existing.row.question_uid || null,
        link: existing.row.link || "",
        title: existing.row.title || "",
        question_label: existing.questionLabel,
        kept_question_uid: record.row.question_uid || null,
      });
      preferredByLabel.set(record.questionLabel, record);
      continue;
    }

    removals.push({
      reason: "duplicate_question_label_lower_score",
      row_index: record.rowIndex,
      question_uid: record.row.question_uid || null,
      link: record.row.link || "",
      title: record.row.title || "",
      question_label: record.questionLabel,
      kept_question_uid: existing.row.question_uid || null,
    });
  }

  return {
    preferredByLabel,
    removals,
  };
}

function sortRecordsByOriginalOrder(records = []) {
  return [...records].sort((left, right) => left.rowIndex - right.rowIndex);
}

async function repairPre2010Questions(
  rows,
  {
    fromYear = DEFAULT_FROM_YEAR,
    toYear = DEFAULT_TO_YEAR,
    years = [],
  } = {}
) {
  const jsonIndex = buildJsonIndex(rows, { fromYear, toYear });
  const yearRecordIndex = buildYearRecordIndex(rows, { fromYear, toYear });
  const answerLookupPayload = readOptionalJson(DEFAULT_ANSWER_LOOKUP);
  const yearsToRepair = getYearsToAudit(jsonIndex, { years, fromYear, toYear })
    .filter((year) => year >= fromYear && year <= toYear);

  const fetchCache = new Map();
  const repairedRowsByYear = new Map();
  const removedRows = [];
  const addedQuestions = [];
  const unresolvedQuestions = [];
  const yearSummaries = [];

  for (const year of yearsToRepair) {
    const jsonBucket = jsonIndex.get(year) || null;
    const records = yearRecordIndex.get(year) || [];
    const candidateTags = buildCandidateTags(year, jsonBucket);
    const resolved = await resolveLiveTag(year, candidateTags);

    if (!resolved.tag || !resolved.firstPage) {
      yearSummaries.push({
        year,
        error: "Unable to resolve a live GateOverflow year tag.",
        candidate_tags: candidateTags,
      });
      repairedRowsByYear.set(
        year,
        sortRecordsByOriginalOrder(records).map((record) => normalizeRow(record.row))
      );
      continue;
    }

    const gateOverflowBucket = await crawlGateOverflowYear(
      year,
      resolved.tag,
      { maxPages: 10, pageSize: 30 },
      resolved.firstPage
    );
    const desiredLabels = new Set(gateOverflowBucket.questionLabels);
    const desiredEntryByLabel = gateOverflowBucket.entriesByQuestionLabel;
    const { preferredByLabel, removals } = pickPreferredRows(records, desiredLabels);

    removedRows.push(
      ...removals.map((entry) => ({
        year,
        gateoverflow_tag: resolved.tag,
        ...entry,
      }))
    );

    const keptRecords = sortRecordsByOriginalOrder(Array.from(preferredByLabel.values()));
    const missingLabels = Array.from(desiredLabels)
      .filter((label) => !preferredByLabel.has(label))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    const addedRowsForYear = [];

    for (const questionLabel of missingLabels) {
      const entry = desiredEntryByLabel.get(questionLabel);
      if (!entry) {
        unresolvedQuestions.push({
          year,
          gateoverflow_tag: resolved.tag,
          question_label: questionLabel,
          reason: "missing_tag_entry",
        });
        continue;
      }

      const response = await fetchQuestionPage(entry.go_id, fetchCache);
      if (!response.ok || !response.parsed) {
        unresolvedQuestions.push({
          year,
          gateoverflow_tag: resolved.tag,
          question_label: questionLabel,
          go_id: entry.go_id,
          link: entry.url,
          reason: `fetch_failed_${response.status}`,
        });
        continue;
      }

      const questionUid = `go:${entry.go_id}`;
      const parsed = response.parsed;
      const tags = Array.from(
        new Set(
          [resolved.tag, ...(Array.isArray(parsed.tags) ? parsed.tags : [])]
            .map((tag) => String(tag || "").trim())
            .filter(Boolean)
        )
      );

      const nextRow = normalizeRow({
        title: cleanInvisibleText(entry.title || parsed.title || ""),
        year: resolved.tag,
        link: parsed.link || entry.url || `${BASE_URL}/${entry.go_id}`,
        question: parsed.question || "",
        tags,
        question_uid: questionUid,
        exam_uid: buildPre2010ExamUid(year, questionLabel),
        ...getAnswerFields(answerLookupPayload, questionUid),
      });

      addedRowsForYear.push(nextRow);
      addedQuestions.push({
        year,
        gateoverflow_tag: resolved.tag,
        question_label: questionLabel,
        question_uid: questionUid,
        link: nextRow.link,
        title: nextRow.title,
      });
    }

    repairedRowsByYear.set(year, [
      ...keptRecords.map((record) => normalizeRow(record.row)),
      ...addedRowsForYear,
    ]);

    yearSummaries.push({
      year,
      gateoverflow_tag: resolved.tag,
      gateoverflow_question_count: desiredLabels.size,
      starting_row_count: records.length,
      kept_existing_row_count: keptRecords.length,
      removed_row_count: removals.length,
      added_row_count: addedRowsForYear.length,
      unresolved_row_count: unresolvedQuestions.filter((entry) => entry.year === year).length,
      final_row_count: repairedRowsByYear.get(year).length,
    });

    console.log(
      `[repair-pre-2010-questions] ${year}: kept=${keptRecords.length} removed=${removals.length} added=${addedRowsForYear.length} final=${repairedRowsByYear.get(year).length} target=${desiredLabels.size}`
    );
  }

  const finalRows = [];
  const insertedYears = new Set();

  for (const row of rows) {
    const year = extractCseYear(row);
    if (Number.isFinite(year) && year >= fromYear && year <= toYear && repairedRowsByYear.has(year)) {
      if (!insertedYears.has(year)) {
        finalRows.push(...repairedRowsByYear.get(year));
        insertedYears.add(year);
      }
      continue;
    }

    finalRows.push(normalizeRow(row));
  }

  for (const year of yearsToRepair) {
    if (!insertedYears.has(year) && repairedRowsByYear.has(year)) {
      finalRows.push(...repairedRowsByYear.get(year));
      insertedYears.add(year);
    }
  }

  return {
    rows: finalRows,
    removedRows,
    addedQuestions,
    unresolvedQuestions,
    yearSummaries,
    fetchedPageCount: fetchCache.size,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = readJson(args.input);

  if (!Array.isArray(rows)) {
    throw new Error("Input JSON must be an array.");
  }

  const result = await repairPre2010Questions(rows, {
    fromYear: args.fromYear,
    toYear: args.toYear,
    years: args.years,
  });

  const outputPath = args.write ? args.input : args.output;
  const report = {
    summary: {
      generated_at: new Date().toISOString(),
      input: path.resolve(args.input),
      output: path.resolve(outputPath),
      report: path.resolve(args.report),
      from_year: args.fromYear,
      to_year: args.toYear,
      repaired_year_count: result.yearSummaries.length,
      removed_row_count: result.removedRows.length,
      added_question_count: result.addedQuestions.length,
      unresolved_question_count: result.unresolvedQuestions.length,
      fetched_page_count: result.fetchedPageCount,
    },
    years: result.yearSummaries,
    removed_rows: result.removedRows,
    added_questions: result.addedQuestions,
    unresolved_questions: result.unresolvedQuestions,
  };

  writeJson(args.report, report);
  writeJson(outputPath, result.rows);

  console.log(`[repair-pre-2010-questions] Removed rows: ${report.summary.removed_row_count}`);
  console.log(`[repair-pre-2010-questions] Added questions: ${report.summary.added_question_count}`);
  console.log(`[repair-pre-2010-questions] Unresolved questions: ${report.summary.unresolved_question_count}`);
  console.log(`[repair-pre-2010-questions] Fetched pages: ${report.summary.fetched_page_count}`);
  console.log(`[repair-pre-2010-questions] Report: ${path.resolve(args.report)}`);
  console.log(`[repair-pre-2010-questions] Output: ${path.resolve(outputPath)}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      `[repair-pre-2010-questions] ${error instanceof Error ? error.stack || error.message : String(error)}`
    );
    process.exit(1);
  });
}

module.exports = {
  buildPre2010ExamUid,
  getHistoricalRowScore,
  repairPre2010Questions,
};
