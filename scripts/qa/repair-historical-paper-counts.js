#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const {
  repairHistoricalExamUids,
  extractPaperMeta,
  extractLogicalSlot,
  cleanInvisibleText,
} = require("./repair-historical-exam-uids.js");

const DEFAULT_INPUT = "public/questions-with-answers.json";
const DEFAULT_AUDIT = "artifacts/review/historical-paper-audit.json";
const DEFAULT_REPORT = "artifacts/review/historical-paper-count-repair-report.json";
const DEFAULT_OUTPUT = "artifacts/review/questions-with-answers.paper-repaired.json";
const DEFAULT_FROM_YEAR = 2010;
const BASE_URL = "https://gateoverflow.in";
const USER_AGENT =
  "Mozilla/5.0 (compatible; GateQA-HistoricalRepair/1.0; +https://github.com/superawat/Gate_QA)";
const MANUAL_DISCOVERY_OVERRIDES = new Map([
  ["2010-set1:main:2", 1148],
  ["2010-set1:main:21", 2199],
  ["2011-set1:main:5", 2107],
  ["2013-set1:main:46", 1555],
  ["2013-set1:main:49", 43293],
  ["2014-set3:main:19", 2053],
  ["2015-set1:main:21", 8244],
]);

function parseArgs(argv) {
  const result = {
    input: DEFAULT_INPUT,
    audit: DEFAULT_AUDIT,
    report: DEFAULT_REPORT,
    output: DEFAULT_OUTPUT,
    fromYear: DEFAULT_FROM_YEAR,
    write: false,
    limitPapers: null,
    paperKeys: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      result.input = argv[++index];
      continue;
    }
    if (arg === "--audit" && argv[index + 1]) {
      result.audit = argv[++index];
      continue;
    }
    if (arg === "--report" && argv[index + 1]) {
      result.report = argv[++index];
      continue;
    }
    if (arg === "--output" && argv[index + 1]) {
      result.output = argv[++index];
      continue;
    }
    if (arg === "--from-year" && argv[index + 1]) {
      result.fromYear = Number.parseInt(argv[++index], 10) || DEFAULT_FROM_YEAR;
      continue;
    }
    if (arg === "--limit-papers" && argv[index + 1]) {
      result.limitPapers = Math.max(1, Number.parseInt(argv[++index], 10) || 0) || null;
      continue;
    }
    if (arg === "--paper-key" && argv[index + 1]) {
      result.paperKeys.push(String(argv[++index] || "").trim().toLowerCase());
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

function writeJson(filePath, data, { pretty = true } = {}) {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(
    absolutePath,
    pretty ? `${JSON.stringify(data, null, 2)}\n` : JSON.stringify(data),
    "utf8"
  );
}

function extractGoId(rawLink = "") {
  const match = String(rawLink || "")
    .trim()
    .match(/(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function getPaperKey(question = {}) {
  const paperMeta = extractPaperMeta(question);
  if (!paperMeta || !Number.isFinite(paperMeta.year)) {
    return null;
  }
  return `${paperMeta.year}-set${paperMeta.setNo}`;
}

function getSlotKey(question = {}) {
  const paperMeta = extractPaperMeta(question);
  const logicalSlot = extractLogicalSlot(question);
  if (!paperMeta || !logicalSlot || !Number.isFinite(paperMeta.year)) {
    return null;
  }
  return buildTargetKey({
    year: paperMeta.year,
    setNo: paperMeta.setNo,
    section: logicalSlot.section,
    number: logicalSlot.number,
  });
}

function buildTargetKey(target) {
  return `${target.year}-set${target.setNo}:${target.section}:${target.number}`;
}

function buildExpectedQuestionTitle(target, multiSetYears = new Set()) {
  const setLabel = multiSetYears.has(target.year) ? ` Set ${target.setNo}` : "";
  const questionLabel =
    target.section === "ga" ? `GA-${target.number}` : String(target.number);
  return `GATE CSE ${target.year}${setLabel} | Question: ${questionLabel}`;
}

function buildCanonicalExamUid(target) {
  return `cse:${target.year}:set${target.setNo}:${target.section}:q${target.number}`;
}

function matchesExpectedQuestionTitle(actualTitle = "", expectedTitle = "") {
  const actual = cleanInvisibleText(actualTitle).replace(/\s+/g, " ").trim();
  const expected = cleanInvisibleText(expectedTitle).replace(/\s+/g, " ").trim();
  if (!actual || !expected) {
    return false;
  }
  return (
    actual === expected
    || actual.startsWith(`${expected} `)
    || actual.startsWith(`${expected},`)
    || actual.startsWith(`${expected} |`)
    || actual.startsWith(`${expected} (`)
  );
}

function collectMultiSetYears(auditPayload = {}) {
  const yearCounts = new Map();
  for (const paper of auditPayload.papers || []) {
    if (!Number.isFinite(paper.year)) {
      continue;
    }
    yearCounts.set(paper.year, (yearCounts.get(paper.year) || 0) + 1);
  }
  return new Set(
    Array.from(yearCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([year]) => year)
  );
}

function collectNoSlotExclusions(auditPayload = {}, fromYear = DEFAULT_FROM_YEAR) {
  const exclusions = new Set();
  for (const paper of auditPayload.papers || []) {
    if (!Number.isFinite(paper.year) || paper.year < fromYear) {
      continue;
    }
    for (const question of paper.questions_without_logical_slot || []) {
      const questionUid = String(question.question_uid || "").trim();
      const link = String(question.link || "").trim();
      if (questionUid) {
        exclusions.add(`question_uid:${questionUid}`);
      }
      if (link) {
        exclusions.add(`link:${link}`);
      }
    }
  }
  return exclusions;
}

function applyExclusions(rows = [], exclusions = new Set()) {
  const removed = [];
  const kept = [];

  rows.forEach((row) => {
    const questionUid = String(row.question_uid || "").trim();
    const link = String(row.link || "").trim();
    const keys = [];
    if (questionUid) {
      keys.push(`question_uid:${questionUid}`);
    }
    if (link) {
      keys.push(`link:${link}`);
    }

    const shouldRemove = keys.some((key) => exclusions.has(key));
    if (shouldRemove) {
      removed.push({
        question_uid: questionUid || null,
        link: link || null,
        title: row.title || "",
      });
      return;
    }

    kept.push(row);
  });

  return { rows: kept, removed };
}

function buildMissingTargets(auditPayload = {}, fromYear = DEFAULT_FROM_YEAR) {
  const targets = [];

  for (const paper of auditPayload.papers || []) {
    if (!Number.isFinite(paper.year) || paper.year < fromYear || paper.missing_slot_count <= 0) {
      continue;
    }

    const setNo = Number.isFinite(paper.set_no) ? paper.set_no : 1;

    for (const number of paper.missing_questions || []) {
      targets.push({
        paperKey: paper.paper_key,
        year: paper.year,
        setNo,
        section: "main",
        number,
      });
    }

    for (const number of paper.missing_main_questions || []) {
      targets.push({
        paperKey: paper.paper_key,
        year: paper.year,
        setNo,
        section: "main",
        number,
      });
    }

    for (const number of paper.missing_ga_questions || []) {
      targets.push({
        paperKey: paper.paper_key,
        year: paper.year,
        setNo,
        section: "ga",
        number,
      });
    }
  }

  return targets.sort((left, right) => (
    left.year - right.year
    || left.setNo - right.setNo
    || left.section.localeCompare(right.section)
    || left.number - right.number
  ));
}

function buildPaperSlotIndex(rows = []) {
  const paperMap = new Map();
  const slotMap = new Map();
  const existingIds = new Set();

  rows.forEach((row) => {
    const paperMeta = extractPaperMeta(row);
    const logicalSlot = extractLogicalSlot(row);
    const goId = extractGoId(row.link || "");

    if (Number.isFinite(goId)) {
      existingIds.add(goId);
    }

    if (!paperMeta || !logicalSlot || !Number.isFinite(paperMeta.year)) {
      return;
    }

    const paperKey = `${paperMeta.year}-set${paperMeta.setNo}`;
    const record = {
      row,
      paperKey,
      paperMeta,
      logicalSlot,
      goId,
    };

    if (!paperMap.has(paperKey)) {
      paperMap.set(paperKey, []);
    }
    paperMap.get(paperKey).push(record);
    slotMap.set(
      buildTargetKey({
        year: paperMeta.year,
        setNo: paperMeta.setNo,
        section: logicalSlot.section,
        number: logicalSlot.number,
      }),
      record
    );
  });

  for (const records of paperMap.values()) {
    records.sort((left, right) => (
      left.logicalSlot.section.localeCompare(right.logicalSlot.section)
      || left.logicalSlot.number - right.logicalSlot.number
    ));
  }

  return { paperMap, slotMap, existingIds };
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
  const variantPenalty = /(?:modified|version|ugcnet|isro|pgee)/i.test(`${title} ${link}`) ? 25 : 0;

  score += Math.min(question.length, 2000) / 1000;
  score += Math.min(title.length, 200) / 1000;

  return score - variantPenalty;
}

function dedupeHistoricalRows(rows = [], fromYear = DEFAULT_FROM_YEAR) {
  const preferredBySlot = new Map();
  const droppedDuplicates = [];
  let fallbackIndex = 0;

  for (const row of rows) {
    const paperMeta = extractPaperMeta(row);
    const logicalSlot = extractLogicalSlot(row);
    if (!paperMeta || !logicalSlot || !Number.isFinite(paperMeta.year) || paperMeta.year < fromYear) {
      const fallbackKey = `fallback:${fallbackIndex}`;
      fallbackIndex += 1;
      preferredBySlot.set(fallbackKey, row);
      continue;
    }

    const slotKey = buildTargetKey({
      year: paperMeta.year,
      setNo: paperMeta.setNo,
      section: logicalSlot.section,
      number: logicalSlot.number,
    });

    const existing = preferredBySlot.get(slotKey);
    if (!existing) {
      preferredBySlot.set(slotKey, row);
      continue;
    }

    const existingScore = getHistoricalRowScore(existing);
    const candidateScore = getHistoricalRowScore(row);
    const keepCandidate = candidateScore > existingScore;

    if (keepCandidate) {
      droppedDuplicates.push({
        kept_question_uid: row.question_uid || null,
        dropped_question_uid: existing.question_uid || null,
        slot_key: slotKey,
      });
      preferredBySlot.set(slotKey, row);
    } else {
      droppedDuplicates.push({
        kept_question_uid: existing.question_uid || null,
        dropped_question_uid: row.question_uid || null,
        slot_key: slotKey,
      });
    }
  }

  return {
    rows: Array.from(preferredBySlot.values()),
    droppedDuplicates,
  };
}

function parseQuestionPage(html = "", fallbackUrl = "") {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const heading =
    doc.querySelector(".qa-main-heading h1") ||
    doc.querySelector("h1");
  const title = cleanInvisibleText(
    heading?.textContent?.trim()
      || ""
  );

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

  const yearTag = tags.find((tag) => /^gatecse/i.test(tag)) || "";

  return {
    title,
    year: yearTag,
    link: canonicalUrl || fallbackUrl,
    question: questionHtml,
    tags,
    question_uid: null,
  };
}

function extractQuestionHeading(html = "") {
  const match = String(html || "").match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) {
    return "";
  }
  return cleanInvisibleText(
    String(match[1] || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

async function fetchQuestionPage(id, fetchCache) {
  if (fetchCache.has(id)) {
    return fetchCache.get(id);
  }

  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    const result = {
      id,
      ok: false,
      status: response.status,
      heading: "",
      html: "",
      parsed: null,
    };
    fetchCache.set(id, result);
    return result;
  }

  const html = await response.text();
  const heading = extractQuestionHeading(html);
  const parsed = parseQuestionPage(html, `${BASE_URL}/${id}`);
  const result = {
    id,
    ok: true,
    status: response.status,
    heading,
    html,
    parsed,
  };
  fetchCache.set(id, result);
  return result;
}

function buildCandidateIds(target, paperRecords = []) {
  const sectionRecords = paperRecords
    .filter(
      (record) =>
        record.logicalSlot.section === target.section && Number.isFinite(record.goId)
    )
    .sort((left, right) => left.logicalSlot.number - right.logicalSlot.number);

  const lower = [...sectionRecords]
    .reverse()
    .find((record) => record.logicalSlot.number < target.number);
  const upper = sectionRecords.find(
    (record) => record.logicalSlot.number > target.number
  );

  const candidates = new Set();
  const weights = new Map();

  const pushRange = (start, end, anchor = null) => {
    const min = Math.max(1, Math.min(start, end));
    const max = Math.max(start, end);
    for (let id = min; id <= max; id += 1) {
      candidates.add(id);
      if (anchor != null) {
        const nextWeight = Math.abs(id - anchor);
        const previousWeight = weights.get(id);
        if (previousWeight == null || nextWeight < previousWeight) {
          weights.set(id, nextWeight);
        }
      }
    }
  };

  if (lower && upper) {
    const estimatedId = Math.round(
      lower.goId
      + ((upper.goId - lower.goId)
        * (target.number - lower.logicalSlot.number))
        / (upper.logicalSlot.number - lower.logicalSlot.number)
    );
    pushRange(Math.min(lower.goId, upper.goId) - 15, Math.max(lower.goId, upper.goId) + 15, estimatedId);
  } else if (lower) {
    pushRange(lower.goId - 120, lower.goId + 40, lower.goId);
  } else if (upper) {
    pushRange(upper.goId - 40, upper.goId + 120, upper.goId);
  } else {
    return [];
  }

  return Array.from(candidates).sort((left, right) => {
    const leftWeight = weights.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightWeight = weights.get(right) ?? Number.MAX_SAFE_INTEGER;
    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }
    return left - right;
  });
}

async function locateMissingQuestion(target, paperRecords, existingIds, fetchCache, multiSetYears) {
  const expectedTitle = buildExpectedQuestionTitle(target, multiSetYears);
  const manualOverrideId = MANUAL_DISCOVERY_OVERRIDES.get(buildTargetKey(target));

  if (manualOverrideId && !existingIds.has(manualOverrideId)) {
    const response = await fetchQuestionPage(manualOverrideId, fetchCache);
    const heading = cleanInvisibleText(response.parsed?.title || response.heading || "");
    if (response.ok && matchesExpectedQuestionTitle(heading, expectedTitle)) {
      const parsedQuestion = {
        ...response.parsed,
        link: response.parsed?.link || `${BASE_URL}/${manualOverrideId}`,
        question_uid: `go:${manualOverrideId}`,
        exam_uid: buildCanonicalExamUid(target),
      };

      const yearTag = String(parsedQuestion.year || "").trim();
      if (!yearTag) {
        parsedQuestion.year = multiSetYears.has(target.year)
          ? `gatecse-${target.year}-set${target.setNo}`
          : `gatecse-${target.year}`;
      }

      return {
        id: manualOverrideId,
        question: parsedQuestion,
        expectedTitle,
      };
    }
  }

  const candidates = buildCandidateIds(target, paperRecords);

  for (const id of candidates) {
    if (existingIds.has(id)) {
      continue;
    }

    const response = await fetchQuestionPage(id, fetchCache);
    if (!response.ok) {
      continue;
    }

    const heading = cleanInvisibleText(response.parsed?.title || response.heading || "");
    if (!matchesExpectedQuestionTitle(heading, expectedTitle)) {
      continue;
    }

    const parsedQuestion = {
      ...response.parsed,
      link: response.parsed?.link || `${BASE_URL}/${id}`,
      question_uid: `go:${id}`,
      exam_uid: buildCanonicalExamUid(target),
    };

    const yearTag = String(parsedQuestion.year || "").trim();
    if (!yearTag) {
      parsedQuestion.year = multiSetYears.has(target.year)
        ? `gatecse-${target.year}-set${target.setNo}`
        : `gatecse-${target.year}`;
    }

    return {
      id,
      question: parsedQuestion,
      expectedTitle,
    };
  }

  return null;
}

async function repairHistoricalPaperCounts(
  rows,
  auditPayload,
  {
    fromYear = DEFAULT_FROM_YEAR,
    limitPapers = null,
    paperKeys = [],
  } = {}
) {
  const examUidRepair = repairHistoricalExamUids(rows, { fromYear });
  const exclusions = collectNoSlotExclusions(auditPayload, fromYear);
  const exclusionResult = applyExclusions(examUidRepair.rows, exclusions);
  const { paperMap, slotMap, existingIds } = buildPaperSlotIndex(exclusionResult.rows);
  const multiSetYears = collectMultiSetYears(auditPayload);
  const allTargets = buildMissingTargets(auditPayload, fromYear);
  const explicitPaperKeys = new Set(
    (Array.isArray(paperKeys) ? paperKeys : [])
      .map((paperKey) => String(paperKey || "").trim().toLowerCase())
      .filter(Boolean)
  );

  const limitedPaperKeys = (() => {
    if (explicitPaperKeys.size > 0) {
      return explicitPaperKeys;
    }
    if (!limitPapers) {
      return null;
    }
    const distinctPaperKeys = [];
    for (const entry of allTargets) {
      if (!distinctPaperKeys.includes(entry.paperKey)) {
        distinctPaperKeys.push(entry.paperKey);
      }
    }
    return new Set(distinctPaperKeys.slice(0, limitPapers));
  })();

  const targets = limitedPaperKeys
    ? allTargets.filter((target) => limitedPaperKeys.has(String(target.paperKey || "").toLowerCase()))
    : allTargets;

  const fetchCache = new Map();
  const addedQuestions = [];
  const unresolvedTargets = [];

  for (const target of targets) {
    const targetKey = buildTargetKey(target);
    if (slotMap.has(targetKey)) {
      continue;
    }

    const paperRecords = paperMap.get(target.paperKey) || [];
    const match = await locateMissingQuestion(
      target,
      paperRecords,
      existingIds,
      fetchCache,
      multiSetYears
    );

    if (!match) {
      unresolvedTargets.push({
        ...target,
        expected_title: buildExpectedQuestionTitle(target, multiSetYears),
      });
      continue;
    }

    const addedQuestion = match.question;
    exclusionResult.rows.push(addedQuestion);
    addedQuestions.push({
      ...target,
      question_uid: addedQuestion.question_uid,
      link: addedQuestion.link,
      title: addedQuestion.title,
    });

    const goId = extractGoId(addedQuestion.link || "");
    if (Number.isFinite(goId)) {
      existingIds.add(goId);
    }

    const record = {
      row: addedQuestion,
      paperKey: target.paperKey,
      paperMeta: extractPaperMeta(addedQuestion),
      logicalSlot: extractLogicalSlot(addedQuestion),
      goId,
    };

    if (!paperMap.has(target.paperKey)) {
      paperMap.set(target.paperKey, []);
    }
    paperMap.get(target.paperKey).push(record);
    paperMap.get(target.paperKey).sort((left, right) => (
      left.logicalSlot.section.localeCompare(right.logicalSlot.section)
      || left.logicalSlot.number - right.logicalSlot.number
    ));
    slotMap.set(targetKey, record);
  }

  const normalizedRows = exclusionResult.rows.map((row) => ({
    ...row,
    title: cleanInvisibleText(row.title || ""),
  }));
  const deduped = dedupeHistoricalRows(normalizedRows, fromYear);

  return {
    rows: deduped.rows,
    removedNonPaperRows: exclusionResult.removed,
    addedQuestions,
    unresolvedTargets,
    examUidRepairSummary: examUidRepair.summary,
    fetchCount: fetchCache.size,
    repairedExamUidRows: examUidRepair.repairs,
    droppedDuplicates: deduped.droppedDuplicates,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = readJson(args.input);
  const auditPayload = readJson(args.audit);

  if (!Array.isArray(rows)) {
    throw new Error("Input JSON must be an array.");
  }

  const result = await repairHistoricalPaperCounts(rows, auditPayload, {
    fromYear: args.fromYear,
    limitPapers: args.limitPapers,
    paperKeys: args.paperKeys,
  });

  const report = {
    summary: {
      generated_at: new Date().toISOString(),
      input: path.resolve(args.input),
      audit: path.resolve(args.audit),
      output: path.resolve(args.write ? args.input : args.output),
      from_year: args.fromYear,
      removed_non_paper_row_count: result.removedNonPaperRows.length,
      added_question_count: result.addedQuestions.length,
      unresolved_target_count: result.unresolvedTargets.length,
      exam_uid_repairs_applied: result.examUidRepairSummary.repaired_row_count,
      fetched_page_count: result.fetchCount,
      dropped_duplicate_row_count: result.droppedDuplicates.length,
      limit_papers: args.limitPapers || null,
      paper_keys: args.paperKeys,
    },
    removed_non_paper_rows: result.removedNonPaperRows,
    added_questions: result.addedQuestions,
    dropped_duplicates: result.droppedDuplicates,
    unresolved_targets: result.unresolvedTargets,
  };

  writeJson(args.report, report);
  writeJson(args.write ? args.input : args.output, result.rows, { pretty: false });

  console.log(`[repair-historical-paper-counts] Removed non-paper rows: ${report.summary.removed_non_paper_row_count}`);
  console.log(`[repair-historical-paper-counts] Added questions: ${report.summary.added_question_count}`);
  console.log(`[repair-historical-paper-counts] Unresolved targets: ${report.summary.unresolved_target_count}`);
  console.log(`[repair-historical-paper-counts] Exam UID repairs applied: ${report.summary.exam_uid_repairs_applied}`);
  console.log(`[repair-historical-paper-counts] Fetched pages: ${report.summary.fetched_page_count}`);
  console.log(`[repair-historical-paper-counts] Report: ${path.resolve(args.report)}`);
  console.log(`[repair-historical-paper-counts] Output: ${path.resolve(args.write ? args.input : args.output)}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[repair-historical-paper-counts] ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  buildExpectedQuestionTitle,
  buildMissingTargets,
  buildPaperSlotIndex,
  buildTargetKey,
  collectNoSlotExclusions,
  repairHistoricalPaperCounts,
};
