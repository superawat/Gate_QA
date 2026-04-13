#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const ROOT = process.cwd();
const BASE_URL = "https://gateoverflow.in";
const USER_AGENT =
  "Mozilla/5.0 (compatible; GateQA-ExternalAptitudeImport/1.0; +https://github.com/superawat/Gate_QA)";

const DEFAULT_TAGS = [
  "general-aptitude",
  "quantitative-aptitude",
  "verbal-aptitude",
  "analytical-aptitude",
  "spatial-aptitude",
];
const DEFAULT_CONCURRENCY = 6;

const DEFAULT_QUESTIONS = "public/questions-with-answers.json";
const DEFAULT_FILTERED = "public/questions-filtered.json";
const DEFAULT_FILTERED_WITH_IDS = "public/questions-filtered-with-ids.json";
const DEFAULT_ANSWERS_BY_QUESTION_UID = "public/data/answers/answers_by_question_uid_v1.json";
const DEFAULT_ANSWERS_BY_QUESTION_UID_PIPELINE = "data/answers/answers_by_question_uid_v1.json";
const DEFAULT_REPORT = "artifacts/review/external-aptitude-import-report.json";

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
const INVISIBLE_TEXT_RE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const CSE_OVERLAP_TAG_RE = /^gate(?:cse|it|da)(?:-|$)/i;

function parseArgs(argv) {
  const result = {
    tags: [...DEFAULT_TAGS],
    questions: DEFAULT_QUESTIONS,
    filtered: DEFAULT_FILTERED,
    filteredWithIds: DEFAULT_FILTERED_WITH_IDS,
    answersByQuestionUid: DEFAULT_ANSWERS_BY_QUESTION_UID,
    answersByQuestionUidPipeline: DEFAULT_ANSWERS_BY_QUESTION_UID_PIPELINE,
    report: DEFAULT_REPORT,
    write: false,
    concurrency: DEFAULT_CONCURRENCY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--tag" && argv[index + 1]) {
      result.tags = [String(argv[++index] || "").trim()].filter(Boolean);
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
    if (arg === "--report" && argv[index + 1]) {
      result.report = argv[++index];
      continue;
    }
    if (arg === "--concurrency" && argv[index + 1]) {
      const parsed = Number.parseInt(argv[++index], 10);
      result.concurrency =
        Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 12) : DEFAULT_CONCURRENCY;
      continue;
    }
    if (arg === "--write") {
      result.write = true;
    }
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

function cleanInvisibleText(value = "") {
  return String(value || "").replace(INVISIBLE_TEXT_RE, "");
}

function cleanText(value = "") {
  return cleanInvisibleText(String(value || "").replace(/\s+/g, " ").trim());
}

function slugify(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(html = "") {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
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
  if (!token) {
    return null;
  }

  const rangeMatch = token.match(
    /^([-+]?\d+(?:\.\d+)?)\s*:\s*([-+]?\d+(?:\.\d+)?)$/
  );
  if (rangeMatch) {
    let lower = Number.parseFloat(rangeMatch[1]);
    let upper = Number.parseFloat(rangeMatch[2]);
    if (lower > upper) {
      [lower, upper] = [upper, lower];
    }
    return {
      type: "NAT",
      answer: (lower + upper) / 2,
      method,
      tolerance: Math.abs(upper - lower) / 2 || 0.01,
    };
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

  if (/^[-+]?\d+(?:\.\d+)?$/.test(token)) {
    return {
      type: "NAT",
      answer: Number.parseFloat(token),
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
    if (!match) {
      continue;
    }
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
    const error = new Error(`HTTP ${response.status} for ${url}`);
    error.status = response.status;
    throw error;
  }

  return response.text();
}

function buildTagPageUrl(tag, start = 0) {
  if (start <= 0) {
    return `${BASE_URL}/tag/${encodeURIComponent(tag)}`;
  }
  return `${BASE_URL}/tag/${encodeURIComponent(tag)}?start=${start}`;
}

function parseTagPage(html, pageUrl, tag) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const entries = new Map();
  const nextStarts = new Set();

  const candidateAnchors = doc.querySelectorAll(
    ".qa-q-list .qa-q-list-item .qa-q-item-title a[href]"
  );

  for (const anchor of candidateAnchors) {
    const href = anchor.getAttribute("href");
    if (!href) {
      continue;
    }

    let url;
    try {
      url = new URL(href, pageUrl);
    } catch {
      continue;
    }

    const questionMatch = url.pathname.match(/^\/(\d+)\/([^/?#]+)/i);
    if (!questionMatch) {
      continue;
    }

    const goId = Number.parseInt(questionMatch[1], 10);
    if (!Number.isFinite(goId)) {
      continue;
    }

    const title = cleanText(anchor.textContent || "");
    if (!title) {
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

  for (const anchor of doc.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (!href) {
      continue;
    }

    let url;
    try {
      url = new URL(href, pageUrl);
    } catch {
      continue;
    }

    const tagMatch = url.pathname.match(/^\/tag\/([^/?#]+)/i);
    if (!tagMatch) {
      continue;
    }

    const targetTag = String(tagMatch[1] || "").trim().toLowerCase();
    if (targetTag !== String(tag || "").trim().toLowerCase()) {
      continue;
    }

    const start = Number.parseInt(url.searchParams.get("start"), 10);
    if (Number.isFinite(start) && start > 0) {
      nextStarts.add(start);
    }
  }

  return {
    entries: Array.from(entries.values()).sort((left, right) => left.go_id - right.go_id),
    nextStarts: Array.from(nextStarts).sort((left, right) => left - right),
  };
}

async function crawlTag(tag) {
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
    let html;
    try {
      html = await fetchHtml(url);
    } catch (error) {
      if (error?.status === 404) {
        continue;
      }
      throw error;
    }
    const parsed = parseTagPage(html, url, tag);

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

  const heading = doc.querySelector(".qa-main-heading h1") || doc.querySelector("h1");
  const title = cleanText(heading?.textContent?.trim() || "");

  const qContent =
    doc.querySelector(".qa-q-view-content .entry-content")
    || doc.querySelector(".qa-q-view-content")
    || doc.querySelector(".entry-content");

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
    const tag = cleanText(tagLink.textContent || "").toLowerCase();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  const canonicalUrl =
    doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || fallbackUrl;

  return {
    title,
    link: canonicalUrl || fallbackUrl,
    question: questionHtml,
    tags,
  };
}

function extractQuestionToken(title = "") {
  const patterns = [
    /\bGA\s*Question\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?(?:-[a-z0-9]+)*)\b/i,
    /\bQuestion\s*[:\-]?\s*GA\s*-?\s*([0-9]+(?:\.[0-9]+)?(?:-[a-z0-9]+)*)\b/i,
    /\bGA[- ]([0-9]+(?:\.[0-9]+)?(?:-[a-z0-9]+)*)\b/i,
  ];

  for (const pattern of patterns) {
    const match = String(title || "").match(pattern);
    if (match) {
      return String(match[1] || "").trim().toLowerCase();
    }
  }

  return null;
}

function inferBranchLabel(title = "", year = null) {
  const cleanedTitle = cleanText(title);
  const segments = cleanedTitle
    .split("|")
    .map((segment) => cleanText(segment))
    .filter(Boolean);
  const candidates = [];

  if (segments.length > 0) {
    const first = segments[0]
      .replace(/\bGATE\b/i, "")
      .replace(year ? new RegExp(`\\b${year}\\b`) : /$^/, "")
      .replace(/\bSet\s*\d+\b/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (first) {
      candidates.push(first);
    }
  }

  for (const segment of segments.slice(1)) {
    if (/\bGA\b/i.test(segment) || /\bQuestion\b/i.test(segment) || /\bSet\s*\d+\b/i.test(segment)) {
      continue;
    }
    candidates.push(segment);
  }

  const branchLabel = candidates.find(Boolean) || "Other Branch";
  return branchLabel.replace(/\s+/g, " ").trim();
}

function parseCandidateMetaFromTitle(title = "") {
  const cleanedTitle = cleanText(title);
  if (!/\bGATE\b/i.test(cleanedTitle) || !/\bGA\b/i.test(cleanedTitle)) {
    return null;
  }

  if (/\bTest\s*Series\b/i.test(cleanedTitle)) {
    return null;
  }

  if (/\bGATE\s+(?:CSE|IT|DA)\b/i.test(cleanedTitle)) {
    return null;
  }

  const yearMatch = cleanedTitle.match(/\b(20\d{2})\b/);
  const year = Number.parseInt(yearMatch?.[1] || "", 10);
  if (!Number.isFinite(year)) {
    return null;
  }

  const setMatch = cleanedTitle.match(/\bSet\s*(\d+)\b/i);
  const set = Number.parseInt(setMatch?.[1] || "", 10);
  const questionToken = extractQuestionToken(cleanedTitle);
  if (!questionToken) {
    return null;
  }

  const branchLabel = inferBranchLabel(cleanedTitle, year);
  const branchSlug = slugify(branchLabel) || "other-branch";

  return {
    year,
    set: Number.isFinite(set) && set > 0 ? set : null,
    questionToken,
    branchLabel,
    branchSlug,
  };
}

function buildGenericYearTag(year, setNo = null) {
  return Number.isFinite(setNo) && setNo > 0 ? `gate-${year}-set${setNo}` : `gate-${year}`;
}

function getQuestionTextSignature(html = "") {
  const dom = new JSDOM(`<body>${String(html || "")}</body>`);
  const doc = dom.window.document;

  for (const image of doc.querySelectorAll("img")) {
    const alt = cleanText(image.getAttribute("alt") || "");
    const width = cleanText(image.getAttribute("width") || "");
    const height = cleanText(image.getAttribute("height") || "");
    const token = ` img ${width || "?"}x${height || "?"} ${alt || "no-alt"} `;
    image.replaceWith(doc.createTextNode(token));
  }

  const text = cleanText(doc.body.textContent || "");
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildQuestionRow(entry, page, meta, answer) {
  const tags = Array.from(
    new Set(
      ["general-aptitude", ...(Array.isArray(page.tags) ? page.tags : [])]
        .map((tag) => cleanText(tag).toLowerCase())
        .filter(Boolean)
    )
  );

  return {
    title: normalizeImportedTitle(page.title || entry.title),
    year: buildGenericYearTag(meta.year, meta.set),
    link: page.link || entry.url,
    question: page.question || "",
    tags,
    question_uid: `go:${entry.go_id}`,
    type: String(answer.type || "").trim().toLowerCase(),
    answer_uid: `manual:go:${entry.go_id}`,
    answer_meta: {
      type: answer.type,
      answer: answer.answer,
      tolerance: answer.tolerance ?? null,
      source: "question_uid",
    },
  };
}

function normalizeImportedTitle(title = "") {
  const cleanedTitle = cleanText(title);
  if (!cleanedTitle) {
    return "";
  }

  return cleanedTitle.replace(/\bGA\s*Question\b/i, "General Aptitude Question");
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

function upsertAnswerRecords(answerPayload, importedRows = []) {
  const nextPayload = {
    ...answerPayload,
    generated_at: new Date().toISOString(),
    records_by_question_uid: {
      ...(answerPayload.records_by_question_uid || {}),
    },
  };

  let insertedCount = 0;
  for (const row of importedRows) {
    nextPayload.records_by_question_uid[row.question_uid] = {
      answer_uid: row.answer_uid,
      type: row.answer_meta.type,
      answer: row.answer_meta.answer,
      tolerance: row.answer_meta.tolerance ?? null,
      source: {
        kind: "gateoverflow_selected_answer",
        question_uids: [row.question_uid],
        link: row.link,
      },
    };
    insertedCount += 1;
  }

  if (nextPayload.stats && typeof nextPayload.stats.records === "number") {
    nextPayload.stats.records = Object.keys(nextPayload.records_by_question_uid).length;
  }

  return {
    payload: nextPayload,
    insertedCount,
  };
}

function sortImportedRows(rows = []) {
  return [...rows].sort((left, right) => {
    const leftYear = Number.parseInt(String(left.year || "").match(/(\d{4})/)?.[1] || "0", 10);
    const rightYear = Number.parseInt(String(right.year || "").match(/(\d{4})/)?.[1] || "0", 10);
    if (leftYear !== rightYear) {
      return rightYear - leftYear;
    }
    return String(left.title || "").localeCompare(String(right.title || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

function mergeQuestionRows(existingRows = [], importedRows = []) {
  const existingByQuestionUid = new Map();
  existingRows.forEach((row, index) => {
    const questionUid = cleanText(row?.question_uid || "");
    if (questionUid) {
      existingByQuestionUid.set(questionUid, index);
    }
  });

  const nextRows = [...existingRows];
  for (const row of importedRows) {
    const questionUid = cleanText(row?.question_uid || "");
    if (questionUid && existingByQuestionUid.has(questionUid)) {
      nextRows[existingByQuestionUid.get(questionUid)] = row;
    } else {
      nextRows.push(row);
    }
  }

  return nextRows;
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runWorker() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length || 1)) },
    () => runWorker()
  );

  await Promise.all(workers);
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const existingRows = readJson(args.questions);
  const answersByQuestionUidPublic = readJson(args.answersByQuestionUid);
  const answersByQuestionUidPipeline = readJson(args.answersByQuestionUidPipeline);

  if (!Array.isArray(existingRows)) {
    throw new Error("Questions JSON must be an array.");
  }

  const existingQuestionUidSet = new Set(
    existingRows
      .map((row) => cleanText(row?.question_uid || ""))
      .filter(Boolean)
  );
  const existingRowByQuestionUid = new Map();
  const existingSignatureSet = new Set();
  existingRows.forEach((row) => {
    const questionUid = cleanText(row?.question_uid || "");
    if (questionUid) {
      existingRowByQuestionUid.set(questionUid, row);
    }
    const signature = getQuestionTextSignature(row?.question || "");
    if (signature) {
      existingSignatureSet.add(signature);
    }
  });

  const tagDiscovery = [];
  const discoveredEntries = new Map();

  for (const tag of args.tags) {
    const entries = await crawlTag(tag);
    tagDiscovery.push({
      tag,
      discovered_question_links: entries.length,
    });
    for (const entry of entries) {
      if (!discoveredEntries.has(entry.go_id)) {
        discoveredEntries.set(entry.go_id, entry);
      }
    }
  }

  const allDiscoveredEntries = Array.from(discoveredEntries.values()).sort(
    (left, right) => left.go_id - right.go_id
  );

  const titleFilteredCandidates = allDiscoveredEntries
    .map((entry) => {
      const meta = parseCandidateMetaFromTitle(entry.title);
      if (!meta) {
        return null;
      }
      return {
        ...entry,
        meta,
      };
    })
    .filter(Boolean);

  console.log(`[import-external-aptitude] Crawled ${args.tags.length} aptitude tags.`);
  console.log(
    `[import-external-aptitude] Discovered ${allDiscoveredEntries.length} unique question links, ${titleFilteredCandidates.length} title-compatible GA candidates.`
  );

  let processedCount = 0;
  const pageResults = await mapWithConcurrency(
    titleFilteredCandidates,
    args.concurrency,
    async (candidate) => {
      const html = await fetchHtml(candidate.url);
      const page = parseQuestionPage(html, candidate.url);
      const answer = parseAnswerFromHtml(html);
      processedCount += 1;
      if (processedCount % 25 === 0 || processedCount === titleFilteredCandidates.length) {
        console.log(
          `[import-external-aptitude] Parsed ${processedCount}/${titleFilteredCandidates.length} candidate pages...`
        );
      }
      return {
        candidate,
        page,
        answer,
      };
    }
  );

  const importedRows = [];
  const importedSignatureSet = new Set();
  const importedByYear = new Map();
  const importedByBranch = new Map();
  const importedQuestionDetails = [];
  const skipCounts = {
    existing_question_uid: 0,
    cse_overlap_tags: 0,
    missing_question_html: 0,
    missing_answer: 0,
    duplicate_existing_signature: 0,
    duplicate_import_signature: 0,
  };
  const skippedSamples = [];

  for (const result of pageResults) {
    const { candidate, page, answer } = result;
    const lowerTags = Array.isArray(page.tags) ? page.tags.map((tag) => tag.toLowerCase()) : [];
    const questionUid = `go:${candidate.go_id}`;

    let skipReason = null;
    const existingRow = existingRowByQuestionUid.get(questionUid) || null;
    const existingSignature = existingRow
      ? getQuestionTextSignature(existingRow.question || "")
      : null;

    if (lowerTags.some((tag) => CSE_OVERLAP_TAG_RE.test(tag))) {
      skipReason = "cse_overlap_tags";
    } else if (!cleanText(page.question || "")) {
      skipReason = "missing_question_html";
    } else if (!answer) {
      skipReason = "missing_answer";
    } else {
      const signature = getQuestionTextSignature(page.question || "");
      if (!signature) {
        skipReason = "missing_question_html";
      } else if (existingSignatureSet.has(signature) && signature !== existingSignature) {
        skipReason = "duplicate_existing_signature";
      } else if (importedSignatureSet.has(signature)) {
        skipReason = "duplicate_import_signature";
      } else {
        importedSignatureSet.add(signature);
        const row = buildQuestionRow(candidate, page, candidate.meta, answer);
        importedRows.push(row);

        const yearKey = String(candidate.meta.year);
        importedByYear.set(yearKey, (importedByYear.get(yearKey) || 0) + 1);
        importedByBranch.set(
          candidate.meta.branchLabel,
          (importedByBranch.get(candidate.meta.branchLabel) || 0) + 1
        );
        importedQuestionDetails.push({
          go_id: candidate.go_id,
          question_uid: row.question_uid,
          title: row.title,
          year: candidate.meta.year,
          set: candidate.meta.set,
          branch: candidate.meta.branchLabel,
          source_url: row.link,
          answer_type: answer.type,
        });
      }
    }

    if (skipReason) {
      skipCounts[skipReason] += 1;
      if (skippedSamples.length < 50) {
        skippedSamples.push({
          go_id: candidate.go_id,
          title: candidate.title,
          reason: skipReason,
          source_url: candidate.url,
        });
      }
    }
  }

  const sortedImportedRows = sortImportedRows(importedRows);
  const nextRows = mergeQuestionRows(existingRows, sortedImportedRows);
  const nextFiltered = buildFilteredRows(nextRows);
  const nextFilteredWithIds = buildFilteredRowsWithIds(nextRows);
  const nextAnswersPublic = upsertAnswerRecords(answersByQuestionUidPublic, sortedImportedRows);
  const nextAnswersPipeline = upsertAnswerRecords(
    answersByQuestionUidPipeline,
    sortedImportedRows
  );

  if (args.write) {
    writeJson(args.questions, nextRows);
    writeJson(args.filtered, nextFiltered);
    writeJson(args.filteredWithIds, nextFilteredWithIds);
    writeJson(args.answersByQuestionUid, nextAnswersPublic.payload);
    writeJson(args.answersByQuestionUidPipeline, nextAnswersPipeline.payload);
  }

  const report = {
    summary: {
      generated_at: new Date().toISOString(),
      crawled_tags: args.tags,
      discovered_question_links: allDiscoveredEntries.length,
      title_compatible_candidates: titleFilteredCandidates.length,
      imported_question_count: sortedImportedRows.length,
      imported_answer_count: sortedImportedRows.length,
      updated_question_count: nextRows.length,
      wrote_changes: args.write,
      output_questions: path.resolve(args.questions),
      output_filtered: path.resolve(args.filtered),
      output_filtered_with_ids: path.resolve(args.filteredWithIds),
      output_answers_by_question_uid: path.resolve(args.answersByQuestionUid),
      output_answers_by_question_uid_pipeline: path.resolve(args.answersByQuestionUidPipeline),
      skip_counts: skipCounts,
    },
    tag_discovery: tagDiscovery,
    imported_by_year: Array.from(importedByYear.entries())
      .map(([year, count]) => ({ year: Number.parseInt(year, 10), count }))
      .sort((left, right) => right.year - left.year),
    imported_by_branch: Array.from(importedByBranch.entries())
      .map(([branch, count]) => ({ branch, count }))
      .sort((left, right) => right.count - left.count || left.branch.localeCompare(right.branch)),
    imported_questions: importedQuestionDetails,
    skipped_samples: skippedSamples,
  };

  writeJson(args.report, report);

  console.log(`[import-external-aptitude] Imported questions: ${sortedImportedRows.length}`);
  console.log(
    `[import-external-aptitude] Updated public bank count: ${existingRows.length} -> ${nextRows.length}`
  );
  console.log(`[import-external-aptitude] Report: ${path.resolve(args.report)}`);
}

main().catch((error) => {
  console.error(
    `[import-external-aptitude] ${error instanceof Error ? error.stack || error.message : String(error)}`
  );
  process.exit(1);
});
