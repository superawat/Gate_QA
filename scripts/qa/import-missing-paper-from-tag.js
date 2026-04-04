#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const { extractLogicalSlot, cleanInvisibleText } = require("./repair-historical-exam-uids.js");

const BASE_URL = "https://gateoverflow.in";
const USER_AGENT =
  "Mozilla/5.0 (compatible; GateQA-MissingPaperImport/1.0; +https://github.com/superawat/Gate_QA)";
const DEFAULT_QUESTIONS = "public/questions-with-answers.json";
const DEFAULT_FILTERED = "public/questions-filtered.json";
const DEFAULT_FILTERED_WITH_IDS = "public/questions-filtered-with-ids.json";
const DEFAULT_ANSWERS_BY_QUESTION_UID = "public/data/answers/answers_by_question_uid_v1.json";
const DEFAULT_ANSWERS_BY_QUESTION_UID_PIPELINE = "data/answers/answers_by_question_uid_v1.json";
const DEFAULT_ANSWERS_BY_EXAM_UID = "public/data/answers/answers_by_exam_uid_v1.json";
const DEFAULT_REPORT = "artifacts/review/missing-paper-import-report.json";

const ALLOWED_OPTIONS = new Set(["A", "B", "C", "D"]);
const ANSWER_WIDGET_RE =
  /<span>\s*Answer:\s*<\/span>\s*<button[^>]*>(.*?)<\/button>/is;
const FALLBACK_PATTERNS = [
  /Correct\s*Answer\s*[:\-]?\s*([A-D](?:\s*[,;/]\s*[A-D])*)/i,
  /Correct\s*Option\s*[:\-]?\s*([A-D](?:\s*[,;/]\s*[A-D])*)/i,
  /(?:the\s+)?answer\s*(?:is|=|:)\s*\(?\s*([A-D])\s*\)?/i,
  /Option\s*\(?\s*([A-D])\s*\)?\s*(?:is\s*(?:correct|right|true)|\.)/i,
  /\b([A-D])\)\s*(?:all are valid|is correct|is the correct)/i,
  /Correct\s*Answer\s*[:\-]?\s*([-+]?\d+(?:\.\d+)?)/i,
  /(?:final\s+)?answer\s*(?:is|=|:)\s*([-+]?\d+(?:\.\d+)?)/i,
];
const SELECTED_BLOCK_RE =
  /qa-a-list-item-selected.*?qa-a-item-content[^>]*>(.*?)<div class="qa-post-when-container/is;

function parseArgs(argv) {
  const result = {
    year: null,
    set: null,
    tag: null,
    questions: DEFAULT_QUESTIONS,
    filtered: DEFAULT_FILTERED,
    filteredWithIds: DEFAULT_FILTERED_WITH_IDS,
    answersByQuestionUid: DEFAULT_ANSWERS_BY_QUESTION_UID,
    answersByQuestionUidPipeline: DEFAULT_ANSWERS_BY_QUESTION_UID_PIPELINE,
    answersByExamUid: DEFAULT_ANSWERS_BY_EXAM_UID,
    report: DEFAULT_REPORT,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--year" && argv[index + 1]) {
      result.year = Number.parseInt(argv[++index], 10);
      continue;
    }
    if (arg === "--set" && argv[index + 1]) {
      result.set = Number.parseInt(argv[++index], 10);
      continue;
    }
    if (arg === "--tag" && argv[index + 1]) {
      result.tag = String(argv[++index] || "").trim();
      continue;
    }
    if (arg === "--questions" && argv[index + 1]) {
      result.questions = argv[++index];
      continue;
    }
    if (arg === "--filtered" && argv[index + 1]) {
      result.filtered = argv[++index];
      continue;
    }
    if (arg === "--filtered-with-ids" && argv[index + 1]) {
      result.filteredWithIds = argv[++index];
      continue;
    }
    if (arg === "--answers-by-question-uid" && argv[index + 1]) {
      result.answersByQuestionUid = argv[++index];
      continue;
    }
    if (arg === "--answers-by-question-uid-pipeline" && argv[index + 1]) {
      result.answersByQuestionUidPipeline = argv[++index];
      continue;
    }
    if (arg === "--answers-by-exam-uid" && argv[index + 1]) {
      result.answersByExamUid = argv[++index];
      continue;
    }
    if (arg === "--report" && argv[index + 1]) {
      result.report = argv[++index];
      continue;
    }
    if (arg === "--write") {
      result.write = true;
    }
  }

  if (!Number.isFinite(result.year) || result.year <= 0) {
    throw new Error("Missing required --year <YYYY>.");
  }
  if (!Number.isFinite(result.set) || result.set <= 0) {
    throw new Error("Missing required --set <N>.");
  }
  if (!result.tag) {
    result.tag = `gatecse-${result.year}-set${result.set}`;
  }

  return result;
}

function readJson(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing file: ${absolutePath}`);
  }
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function writeJson(filePath, payload) {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeToken(raw) {
  return String(raw || "")
    .toUpperCase()
    .replace(/[()[\]{}$]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseToken(rawValue, method) {
  const token = normalizeToken(stripHtml(rawValue));
  if (!token) return null;

  const rangeMatch = token.match(
    /^([-+]?\d+(?:\.\d+)?)\s*:\s*([-+]?\d+(?:\.\d+)?)$/
  );
  if (rangeMatch) {
    let lower = Number.parseFloat(rangeMatch[1]);
    let upper = Number.parseFloat(rangeMatch[2]);
    if (lower > upper) {
      [lower, upper] = [upper, lower];
    }
    const center = (lower + upper) / 2;
    const tolerance = Math.abs(upper - lower) / 2 || 0.01;
    return { type: "NAT", answer: center, method, tolerance };
  }

  const parts = token
    .split(/\s*(?:,|;|\/|&|\band\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length > 1 && parts.every((part) => ALLOWED_OPTIONS.has(part))) {
    const deduped = [...new Set(parts)];
    if (deduped.length >= 2) {
      return { type: "MSQ", answer: deduped, method, tolerance: null };
    }
  }

  if (ALLOWED_OPTIONS.has(token)) {
    return { type: "MCQ", answer: token, method, tolerance: null };
  }

  const natMatch = token.match(/^[-+]?\d+(?:\.\d+)?$/);
  if (natMatch) {
    return {
      type: "NAT",
      answer: Number.parseFloat(natMatch[0]),
      method,
      tolerance: { abs: 0.01 },
    };
  }

  return null;
}

function parseAnswerFromHtml(html = "") {
  const widgetMatch = String(html || "").match(ANSWER_WIDGET_RE);
  if (widgetMatch) {
    const parsed = parseToken(widgetMatch[1], "gateoverflow_widget");
    if (parsed) {
      return parsed;
    }
  }

  const selectedMatch = String(html || "").match(SELECTED_BLOCK_RE);
  if (!selectedMatch) {
    return null;
  }

  const answerText = stripHtml(selectedMatch[1]);
  for (const pattern of FALLBACK_PATTERNS) {
    const match = answerText.match(pattern);
    if (!match) continue;
    const parsed = parseToken(match[1], "selected_answer_text");
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

function buildTagPageUrl(tag, start = 0) {
  if (start <= 0) {
    return `${BASE_URL}/tag/${encodeURIComponent(tag)}`;
  }
  return `${BASE_URL}/tag/${encodeURIComponent(tag)}?start=${start}`;
}

function parseTagPage(html, pageUrl, tag, year, setNo) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const entries = new Map();
  const nextStarts = new Set();
  const titlePattern = new RegExp(`GATE\\s+CSE\\s+${year}\\s+Set\\s+${setNo}\\s+\\|\\s+(?:GA\\s+)?Question\\s*:`, "i");

  for (const anchor of doc.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (!href) continue;

    let url;
    try {
      url = new URL(href, pageUrl);
    } catch {
      continue;
    }

    if (!/^(?:www\.)?gateoverflow\.in$/i.test(url.hostname)) {
      continue;
    }

    const tagMatch = url.pathname.match(/^\/tag\/([^/?#]+)/i);
    if (tagMatch) {
      const targetTag = String(tagMatch[1] || "").trim().toLowerCase();
      if (targetTag === String(tag || "").trim().toLowerCase()) {
        const start = Number.parseInt(url.searchParams.get("start"), 10);
        if (Number.isFinite(start) && start > 0) {
          nextStarts.add(start);
        }
      }
      continue;
    }

    const questionMatch = url.pathname.match(/^\/(\d+)\/([^/?#]+)/i);
    if (!questionMatch) {
      continue;
    }

    const title = cleanInvisibleText(
      String(anchor.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
    );
    if (!titlePattern.test(title)) {
      continue;
    }

    const goId = Number.parseInt(questionMatch[1], 10);
    if (!Number.isFinite(goId)) {
      continue;
    }

    if (!entries.has(goId)) {
      entries.set(goId, {
        go_id: goId,
        slug: questionMatch[2],
        title,
        url: url.href,
      });
    }
  }

  return {
    entries: Array.from(entries.values()).sort((left, right) => left.go_id - right.go_id),
    nextStarts: Array.from(nextStarts).sort((left, right) => left - right),
  };
}

async function crawlPaperTag(tag, year, setNo) {
  const seenEntries = new Map();
  const visitedStarts = new Set();
  const pendingStarts = [0];

  while (pendingStarts.length > 0) {
    const start = pendingStarts.shift();
    if (visitedStarts.has(start)) {
      continue;
    }
    visitedStarts.add(start);

    const url = buildTagPageUrl(tag, start);
    const html = await fetchHtml(url);
    const parsed = parseTagPage(html, url, tag, year, setNo);

    for (const entry of parsed.entries) {
      if (!seenEntries.has(entry.go_id)) {
        seenEntries.set(entry.go_id, entry);
      }
    }

    for (const nextStart of parsed.nextStarts) {
      if (!visitedStarts.has(nextStart) && !pendingStarts.includes(nextStart)) {
        pendingStarts.push(nextStart);
      }
    }

    pendingStarts.sort((left, right) => left - right);
  }

  return Array.from(seenEntries.values()).sort((left, right) => left.go_id - right.go_id);
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
  for (const tagLink of doc.querySelectorAll(".qa-tag-link")) {
    const tag = String(tagLink.textContent || "").trim();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  const canonicalUrl =
    doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
    fallbackUrl;

  return {
    title,
    link: canonicalUrl || fallbackUrl,
    question: questionHtml,
    tags,
  };
}

function buildExamUid(year, setNo, logicalSlot) {
  return `cse:${year}:set${setNo}:${logicalSlot.section}:q${logicalSlot.number}`;
}

function getAnswerRecord(answerPayload = {}, questionUid = "") {
  const record = answerPayload?.records_by_question_uid?.[questionUid];
  return record && typeof record === "object" ? record : null;
}

function buildQuestionRow(entry, parsedPage, year, setNo, tag, answerRecord = null) {
  const title = cleanInvisibleText(parsedPage.title || entry.title || "");
  const logicalSlot = extractLogicalSlot({ title, link: parsedPage.link || entry.url });
  if (!logicalSlot) {
    throw new Error(`Could not derive logical slot for ${entry.go_id} (${title})`);
  }

  const questionUid = `go:${entry.go_id}`;
  const examUid = buildExamUid(year, setNo, logicalSlot);
  const tags = Array.from(
    new Set(
      [tag, ...(Array.isArray(parsedPage.tags) ? parsedPage.tags : [])]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );

  const row = {
    title,
    year: tag,
    link: parsedPage.link || entry.url,
    question: parsedPage.question || "",
    tags,
    question_uid: questionUid,
    exam_uid: examUid,
  };

  if (answerRecord) {
    row.answer_uid = answerRecord.answer_uid || null;
    row.answer_meta = {
      type: answerRecord.type || null,
      answer: answerRecord.answer ?? null,
      tolerance: answerRecord.tolerance ?? null,
      source: "question_uid",
    };
  }

  return row;
}

function mergeQuestionRows(existingRows = [], importedRows = []) {
  const existingByQuestionUid = new Map();
  existingRows.forEach((row, index) => {
    const questionUid = String(row.question_uid || "").trim();
    if (questionUid) {
      existingByQuestionUid.set(questionUid, index);
    }
  });

  const nextRows = [...existingRows];
  for (const row of importedRows) {
    const questionUid = String(row.question_uid || "").trim();
    if (questionUid && existingByQuestionUid.has(questionUid)) {
      nextRows[existingByQuestionUid.get(questionUid)] = row;
    } else {
      nextRows.push(row);
    }
  }

  nextRows.sort((left, right) => {
    const leftUid = String(left.exam_uid || left.question_uid || "");
    const rightUid = String(right.exam_uid || right.question_uid || "");
    return leftUid.localeCompare(rightUid, undefined, { numeric: true });
  });

  return nextRows;
}

function buildFilteredRows(rows = []) {
  return rows.map(({ title, year, link, question, tags }) => ({
    title,
    year,
    link,
    question,
    tags,
  }));
}

function buildFilteredRowsWithIds(rows = []) {
  return rows.map(({ title, year, link, question, tags, question_uid }) => ({
    title,
    year,
    link,
    question,
    tags,
    question_uid,
  }));
}

function upsertAnswerRecords(answersPayload, examPayload, importedRows) {
  const nextAnswersPayload = {
    ...answersPayload,
    records_by_question_uid: {
      ...(answersPayload.records_by_question_uid || {}),
    },
  };

  const nextExamPayload = {
    ...examPayload,
    records_by_exam_uid: {
      ...(examPayload.records_by_exam_uid || {}),
    },
  };

  let insertedCount = 0;

  for (const row of importedRows) {
    if (!row.answer_uid || !row.answer_meta) {
      continue;
    }

    nextAnswersPayload.records_by_question_uid[row.question_uid] = {
      answer_uid: row.answer_uid,
      type: row.answer_meta.type,
      answer: row.answer_meta.answer,
      tolerance: row.answer_meta.tolerance ?? null,
      source: {
        kind: "question_uid",
        question_uids: [row.question_uid],
      },
    };

    nextExamPayload.records_by_exam_uid[row.exam_uid] = {
      answer_uid: row.answer_uid,
      type: row.answer_meta.type,
      answer: row.answer_meta.answer,
      tolerance: row.answer_meta.tolerance ?? null,
      source: {
        kind: "question_uid",
        question_uids: [row.question_uid],
      },
    };
    insertedCount += 1;
  }

  if (nextAnswersPayload.stats && typeof nextAnswersPayload.stats.records === "number") {
    nextAnswersPayload.stats.records = Object.keys(nextAnswersPayload.records_by_question_uid).length;
  }

  return {
    answersByQuestionUid: nextAnswersPayload,
    answersByExamUid: nextExamPayload,
    insertedCount,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const existingRows = readJson(args.questions);
  const answersByQuestionUidPublic = readJson(args.answersByQuestionUid);
  const answersByQuestionUidPipeline = readJson(args.answersByQuestionUidPipeline);
  const answersByExamUid = readJson(args.answersByExamUid);

  if (!Array.isArray(existingRows)) {
    throw new Error("Questions JSON must be an array.");
  }

  const tagEntries = await crawlPaperTag(args.tag, args.year, args.set);
  if (tagEntries.length === 0) {
    throw new Error(`No questions discovered for tag ${args.tag}.`);
  }

  const importedRows = [];
  const fetchReport = [];

  for (const entry of tagEntries) {
    const html = await fetchHtml(entry.url);
    const parsedPage = parseQuestionPage(html, entry.url);
    const questionUid = `go:${entry.go_id}`;
    const answerRecord =
      getAnswerRecord(answersByQuestionUidPublic, questionUid) ||
      getAnswerRecord(answersByQuestionUidPipeline, questionUid) ||
      (() => {
        const parsed = parseAnswerFromHtml(html);
        if (!parsed) {
          return null;
        }
        return {
          answer_uid: `manual:go:${entry.go_id}`,
          type: parsed.type,
          answer: parsed.answer,
          tolerance: parsed.tolerance ?? null,
          source: {
            kind: parsed.method,
            link: entry.url,
          },
        };
      })();

    const row = buildQuestionRow(entry, parsedPage, args.year, args.set, args.tag, answerRecord);
    importedRows.push(row);
    fetchReport.push({
      go_id: entry.go_id,
      question_uid: row.question_uid,
      exam_uid: row.exam_uid,
      title: row.title,
      has_answer: Boolean(answerRecord),
    });
  }

  const nextRows = mergeQuestionRows(existingRows, importedRows);
  const nextFiltered = buildFilteredRows(nextRows);
  const nextFilteredWithIds = buildFilteredRowsWithIds(nextRows);
  const mergedAnswers = upsertAnswerRecords(
    answersByQuestionUidPublic,
    answersByExamUid,
    importedRows
  );

  const outputQuestionsPath = args.questions;
  const outputFilteredPath = args.filtered;
  const outputFilteredWithIdsPath = args.filteredWithIds;
  const outputAnswersPath = args.answersByQuestionUid;
  const outputAnswersPipelinePath = args.answersByQuestionUidPipeline;
  const outputAnswersByExamPath = args.answersByExamUid;

  if (args.write) {
    writeJson(outputQuestionsPath, nextRows);
    writeJson(outputFilteredPath, nextFiltered);
    writeJson(outputFilteredWithIdsPath, nextFilteredWithIds);
    writeJson(outputAnswersPath, mergedAnswers.answersByQuestionUid);
    writeJson(outputAnswersPipelinePath, mergedAnswers.answersByQuestionUid);
    writeJson(outputAnswersByExamPath, mergedAnswers.answersByExamUid);
  }

  const report = {
    summary: {
      generated_at: new Date().toISOString(),
      year: args.year,
      set: args.set,
      tag: args.tag,
      discovered_question_count: tagEntries.length,
      imported_question_count: importedRows.length,
      imported_answer_count: importedRows.filter((row) => row.answer_uid && row.answer_meta).length,
      merged_answer_record_count: mergedAnswers.insertedCount,
      wrote_changes: args.write,
      output_questions: path.resolve(outputQuestionsPath),
      output_filtered: path.resolve(outputFilteredPath),
      output_filtered_with_ids: path.resolve(outputFilteredWithIdsPath),
      output_answers_by_question_uid: path.resolve(outputAnswersPath),
      output_answers_by_exam_uid: path.resolve(outputAnswersByExamPath),
    },
    imported_questions: fetchReport,
  };

  writeJson(args.report, report);

  console.log(`[import-missing-paper-from-tag] Tag: ${args.tag}`);
  console.log(`[import-missing-paper-from-tag] Discovered questions: ${report.summary.discovered_question_count}`);
  console.log(`[import-missing-paper-from-tag] Imported questions: ${report.summary.imported_question_count}`);
  console.log(`[import-missing-paper-from-tag] Imported answers: ${report.summary.imported_answer_count}`);
  console.log(`[import-missing-paper-from-tag] Report: ${path.resolve(args.report)}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[import-missing-paper-from-tag] ${error instanceof Error ? error.stack || error.message : String(error)}`);
    process.exit(1);
  });
}
