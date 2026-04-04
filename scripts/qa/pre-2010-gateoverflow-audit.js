#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const DEFAULT_INPUT = "public/questions-with-answers.json";
const DEFAULT_REPORT = "artifacts/review/pre-2010-gateoverflow-audit.json";
const DEFAULT_FROM_YEAR = 1987;
const DEFAULT_TO_YEAR = 2009;
const DEFAULT_PAGE_SIZE = 30;
const DEFAULT_MAX_PAGES = 10;
const BASE_URL = "https://gateoverflow.in";
const USER_AGENT =
  "Mozilla/5.0 (compatible; GateQA-Pre2010Audit/1.0; +https://github.com/superawat/Gate_QA)";

function parseArgs(argv) {
  const result = {
    input: DEFAULT_INPUT,
    report: DEFAULT_REPORT,
    fromYear: DEFAULT_FROM_YEAR,
    toYear: DEFAULT_TO_YEAR,
    pageSize: DEFAULT_PAGE_SIZE,
    maxPages: DEFAULT_MAX_PAGES,
    years: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--input" && argv[index + 1]) {
      result.input = argv[++index];
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
    if (arg === "--page-size" && argv[index + 1]) {
      result.pageSize = Math.max(1, Number.parseInt(argv[++index], 10) || DEFAULT_PAGE_SIZE);
      continue;
    }
    if (arg === "--max-pages" && argv[index + 1]) {
      result.maxPages = Math.max(1, Number.parseInt(argv[++index], 10) || DEFAULT_MAX_PAGES);
      continue;
    }
    if (arg === "--year" && argv[index + 1]) {
      const parsed = Number.parseInt(argv[++index], 10);
      if (Number.isFinite(parsed)) {
        result.years.push(parsed);
      }
      continue;
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

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractGoId(rawValue = "") {
  const value = String(rawValue || "").trim();

  let match = value.match(/^go:(\d+)$/i);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  match = value.match(
    /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:\/[^?#]*)?(?:[?#].*)?$/i
  );
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  return null;
}

function extractCseYear(question = {}) {
  const examUid = String(question.exam_uid || "").trim();
  let match = examUid.match(/^cse:(\d{4}):set\d+:/i);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  const yearTag = String(question.year || "").trim();
  match = yearTag.match(/^gatecse-(\d{4})$/i);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  match = yearTag.match(/^gate(\d{4})$/i);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  const title = cleanText(question.title || "");
  match = title.match(/^GATE\s+CSE\s+(\d{4})\s+\|\s+Question\s*:/i);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  const link = String(question.link || "").trim();
  match = link.match(/gate-cse-(\d{4})-question/i);
  if (match) {
    return Number.parseInt(match[1], 10);
  }

  return null;
}

function getYearBucket(map, year) {
  if (!map.has(year)) {
    map.set(year, {
      year,
      totalRows: 0,
      uniqueGoIds: new Set(),
      duplicateGoIds: new Set(),
      rowsWithoutGoId: [],
      observedTags: new Set(),
      rowsByGoId: new Map(),
      uniqueQuestionLabels: new Set(),
      duplicateQuestionLabels: new Set(),
      rowsWithoutQuestionLabel: [],
      rowsByQuestionLabel: new Map(),
    });
  }

  return map.get(year);
}

function buildJsonIndex(rows = [], { fromYear, toYear }) {
  const buckets = new Map();

  for (const row of rows) {
    const year = extractCseYear(row);
    if (!Number.isFinite(year) || year < fromYear || year > toYear) {
      continue;
    }

    const bucket = getYearBucket(buckets, year);
    bucket.totalRows += 1;

    const yearTag = cleanText(row.year || "");
    if (yearTag) {
      bucket.observedTags.add(yearTag);
    }

    const questionLabel = extractQuestionLabel(row, year);
    if (!questionLabel) {
      bucket.rowsWithoutQuestionLabel.push({
        question_uid: row.question_uid || null,
        title: row.title || "",
        link: row.link || "",
        exam_uid: row.exam_uid || null,
      });
    } else if (bucket.uniqueQuestionLabels.has(questionLabel)) {
      bucket.duplicateQuestionLabels.add(questionLabel);
    } else {
      bucket.uniqueQuestionLabels.add(questionLabel);
      bucket.rowsByQuestionLabel.set(questionLabel, {
        question_uid: row.question_uid || null,
        title: row.title || "",
        link: row.link || "",
        exam_uid: row.exam_uid || null,
        question_label: questionLabel,
      });
    }

    const goId = extractGoId(row.question_uid || "") || extractGoId(row.link || "");
    if (!Number.isFinite(goId)) {
      bucket.rowsWithoutGoId.push({
        question_uid: row.question_uid || null,
        title: row.title || "",
        link: row.link || "",
      });
      continue;
    }

    if (bucket.uniqueGoIds.has(goId)) {
      bucket.duplicateGoIds.add(goId);
      continue;
    }

    bucket.uniqueGoIds.add(goId);
    bucket.rowsByGoId.set(goId, {
      question_uid: row.question_uid || null,
      title: row.title || "",
      link: row.link || "",
      exam_uid: row.exam_uid || null,
    });
  }

  return buckets;
}

function getYearsToAudit(jsonIndex, args) {
  if (args.years.length > 0) {
    return Array.from(new Set(args.years))
      .filter((year) => Number.isFinite(year))
      .sort((left, right) => left - right);
  }

  return Array.from(jsonIndex.keys()).sort((left, right) => left - right);
}

function buildCandidateTags(year, jsonBucket) {
  const candidates = [];

  for (const tag of jsonBucket?.observedTags || []) {
    candidates.push(cleanText(tag));
  }

  candidates.push(`gate${year}`);
  candidates.push(`gatecse-${year}`);

  return Array.from(
    new Set(
      candidates
        .map((tag) => cleanText(tag))
        .filter(Boolean)
    )
  );
}

function normalizeQuestionLabel(rawValue = "") {
  const compact = cleanText(rawValue)
    .toLowerCase()
    .replace(/\bclosed\b.*$/i, "")
    .split(",")[0]
    .replace(/\s+/g, "");

  if (!compact) {
    return null;
  }

  const parts = compact
    .split(/([.-])/)
    .filter(Boolean)
    .map((part) => {
      if (/^[.-]$/.test(part)) {
        return part;
      }
      if (/^\d+$/.test(part)) {
        return String(Number.parseInt(part, 10));
      }
      return part;
    });

  return parts.join("");
}

function extractQuestionLabelFromTitle(title = "", year) {
  const match = cleanText(title).match(
    new RegExp(`GATE\\s+CSE\\s+${year}\\s+\\|\\s+Question\\s*:\\s*([A-Za-z0-9]+(?:[.-][A-Za-z0-9]+)*)`, "i")
  );
  return match ? normalizeQuestionLabel(match[1]) : null;
}

function extractQuestionLabelFromLink(link = "", year) {
  const match = String(link || "")
    .trim()
    .match(new RegExp(`gate-cse-${year}-question-([a-z0-9-]+)`, "i"));
  return match ? normalizeQuestionLabel(match[1]) : null;
}

function extractQuestionLabelFromExamUid(examUid = "") {
  const match = String(examUid || "").trim().match(/^cse:\d{4}:set\d+:[^:]+:q(.+)$/i);
  return match ? normalizeQuestionLabel(match[1]) : null;
}

function extractQuestionLabel(question = {}, year) {
  return (
    extractQuestionLabelFromTitle(question.title || "", year)
    || extractQuestionLabelFromLink(question.link || "", year)
    || extractQuestionLabelFromExamUid(question.exam_uid || "")
  );
}

function matchesYearQuestionLink(entry, year) {
  const slug = String(entry.slug || "").toLowerCase();
  const questionLabel = extractQuestionLabelFromTitle(entry.title || "", year);

  if (questionLabel) {
    return true;
  }

  return slug.includes(`gate-cse-${year}-question`);
}

function parseTagPage(html, year, tag) {
  const dom = new JSDOM(html);
  const entries = new Map();
  const nextStarts = new Set();

  for (const anchor of dom.window.document.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (!href) {
      continue;
    }

    let url;
    try {
      url = new URL(href, BASE_URL);
    } catch {
      continue;
    }

    if (!/^(?:www\.)?gateoverflow\.in$/i.test(url.hostname)) {
      continue;
    }

    const tagMatch = url.pathname.match(/^\/tag\/([^/?#]+)/i);
    if (tagMatch) {
      const targetTag = cleanText(tagMatch[1]).toLowerCase();
      const expectedTag = cleanText(tag).toLowerCase();
      if (targetTag === expectedTag) {
        const start = Number.parseInt(url.searchParams.get("start"), 10);
        if (Number.isFinite(start) && start > 0) {
          nextStarts.add(start);
        }
      }
      continue;
    }

    const match = url.pathname.match(/^\/(\d+)\/([^/?#]+)/i);
    if (!match) {
      continue;
    }

    const goId = Number.parseInt(match[1], 10);
    if (!Number.isFinite(goId)) {
      continue;
    }

    const entry = {
      go_id: goId,
      url: url.href,
      slug: match[2],
      title: cleanText(anchor.textContent || ""),
    };
    entry.question_label = extractQuestionLabelFromTitle(entry.title, year);

    if (!matchesYearQuestionLink(entry, year)) {
      continue;
    }

    if (!entries.has(goId)) {
      entries.set(goId, entry);
    }
  }

  return {
    entries: Array.from(entries.values()).sort((left, right) => left.go_id - right.go_id),
    nextStarts: Array.from(nextStarts).sort((left, right) => left - right),
  };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(30_000),
  });

  return {
    ok: response.ok,
    status: response.status,
    url: response.url,
    html: await response.text(),
  };
}

function buildTagPageUrl(tag, start) {
  if (start <= 0) {
    return `${BASE_URL}/tag/${encodeURIComponent(tag)}`;
  }

  return `${BASE_URL}/tag/${encodeURIComponent(tag)}?start=${start}`;
}

async function resolveLiveTag(year, candidateTags) {
  const attempts = [];

  for (const tag of candidateTags) {
    const url = buildTagPageUrl(tag, 0);
    const response = await fetchHtml(url);
    const parsed = response.ok ? parseTagPage(response.html, year, tag) : { entries: [], nextStarts: [] };
    attempts.push({
      tag,
      status: response.status,
      matched_question_count: parsed.entries.length,
      url: response.url,
    });

    if (response.ok && parsed.entries.length > 0) {
      return {
        tag,
        attempts,
        firstPage: {
          start: 0,
          url: response.url,
          matched_question_count: parsed.entries.length,
          entries: parsed.entries,
          nextStarts: parsed.nextStarts,
        },
      };
    }
  }

  return {
    tag: null,
    attempts,
    firstPage: null,
  };
}

async function crawlGateOverflowYear(year, tag, options, firstPage) {
  const seen = new Map();
  const questionLabels = new Set();
  const entriesByQuestionLabel = new Map();
  const pages = [];
  const visitedStarts = new Set([0]);
  const pendingStarts = [];

  function enqueueStarts(starts = []) {
    for (const start of starts) {
      if (!Number.isFinite(start) || start <= 0) {
        continue;
      }
      if (visitedStarts.has(start) || pendingStarts.includes(start)) {
        continue;
      }
      pendingStarts.push(start);
    }
    pendingStarts.sort((left, right) => left - right);
  }

  enqueueStarts(firstPage?.nextStarts || []);

  for (let pageIndex = 0; pageIndex < options.maxPages; pageIndex += 1) {
    const start = pageIndex === 0 ? 0 : pendingStarts.shift();
    if (pageIndex > 0 && !Number.isFinite(start)) {
      break;
    }

    let pagePayload = firstPage;

    if (pageIndex > 0 || !pagePayload) {
      visitedStarts.add(start);
      const url = buildTagPageUrl(tag, start);
      const response = await fetchHtml(url);

      if (!response.ok) {
        pages.push({
          start,
          url: response.url,
          status: response.status,
          matched_question_count: 0,
          new_question_count: 0,
          discovered_next_starts: [],
        });
        break;
      }

      const parsed = parseTagPage(response.html, year, tag);
      pagePayload = {
        start,
        url: response.url,
        matched_question_count: parsed.entries.length,
        entries: parsed.entries,
        nextStarts: parsed.nextStarts,
      };
    }

    let newQuestionCount = 0;
    for (const entry of pagePayload.entries) {
      if (!seen.has(entry.go_id)) {
        seen.set(entry.go_id, entry);
        newQuestionCount += 1;
      }
      if (entry.question_label) {
        questionLabels.add(entry.question_label);
        if (!entriesByQuestionLabel.has(entry.question_label)) {
          entriesByQuestionLabel.set(entry.question_label, entry);
        }
      }
    }

    pages.push({
      start,
      url: pagePayload.url,
      status: 200,
      matched_question_count: pagePayload.entries.length,
      new_question_count: newQuestionCount,
      discovered_next_starts: pagePayload.nextStarts || [],
    });

    enqueueStarts(pagePayload.nextStarts || []);
    if (newQuestionCount === 0) {
      break;
    }
  }

  return {
    tag,
    totalQuestions: seen.size,
    goIds: new Set(seen.keys()),
    entries: Array.from(seen.values()).sort((left, right) => left.go_id - right.go_id),
    uniqueQuestionCount: questionLabels.size,
    questionLabels,
    entriesByQuestionLabel,
    pages,
  };
}

function buildComparison(year, jsonBucket, gateOverflowBucket, metadata = {}) {
  const jsonGoIds = new Set(jsonBucket ? Array.from(jsonBucket.uniqueGoIds) : []);
  const gateOverflowGoIds = gateOverflowBucket ? new Set(gateOverflowBucket.goIds) : new Set();
  const jsonQuestionLabels = new Set(jsonBucket ? Array.from(jsonBucket.uniqueQuestionLabels) : []);
  const gateOverflowQuestionLabels = gateOverflowBucket
    ? new Set(gateOverflowBucket.questionLabels)
    : new Set();

  const gateOverflowOnly = Array.from(gateOverflowGoIds)
    .filter((goId) => !jsonGoIds.has(goId))
    .sort((left, right) => left - right);
  const jsonOnly = Array.from(jsonGoIds)
    .filter((goId) => !gateOverflowGoIds.has(goId))
    .sort((left, right) => left - right);
  const gateOverflowOnlyLabels = Array.from(gateOverflowQuestionLabels)
    .filter((label) => !jsonQuestionLabels.has(label))
    .sort();
  const jsonOnlyLabels = Array.from(jsonQuestionLabels)
    .filter((label) => !gateOverflowQuestionLabels.has(label))
    .sort();

  const gateOverflowEntryMap = new Map(
    Array.from(gateOverflowBucket?.entries || []).map((entry) => [entry.go_id, entry])
  );
  const jsonRowMap = jsonBucket?.rowsByGoId || new Map();
  const gateOverflowLabelMap = gateOverflowBucket?.entriesByQuestionLabel || new Map();
  const jsonQuestionLabelMap = jsonBucket?.rowsByQuestionLabel || new Map();

  return {
    year,
    gateoverflow_tag: metadata.tag || null,
    tag_resolution_attempts: metadata.attempts || [],
    gateoverflow_unique_question_count: gateOverflowBucket?.uniqueQuestionCount || 0,
    gateoverflow_total_questions: gateOverflowBucket?.totalQuestions || 0,
    json_unique_question_count: jsonQuestionLabels.size,
    json_total_rows: jsonBucket?.totalRows || 0,
    json_unique_gateoverflow_questions: jsonGoIds.size,
    json_rows_without_go_id_count: jsonBucket?.rowsWithoutGoId.length || 0,
    json_duplicate_go_id_count: jsonBucket?.duplicateGoIds.size || 0,
    json_rows_without_question_label_count: jsonBucket?.rowsWithoutQuestionLabel.length || 0,
    json_duplicate_question_label_count: jsonBucket?.duplicateQuestionLabels.size || 0,
    question_count_matches_gateoverflow: jsonQuestionLabels.size === (gateOverflowBucket?.uniqueQuestionCount || 0),
    question_label_match: gateOverflowOnlyLabels.length === 0 && jsonOnlyLabels.length === 0,
    row_count_matches_gateoverflow: (jsonBucket?.totalRows || 0) === (gateOverflowBucket?.totalQuestions || 0),
    unique_go_id_match: gateOverflowOnly.length === 0 && jsonOnly.length === 0,
    gateoverflow_only_question_label_count: gateOverflowOnlyLabels.length,
    json_only_question_label_count: jsonOnlyLabels.length,
    sample_gateoverflow_only_question_labels: gateOverflowOnlyLabels.slice(0, 20),
    sample_json_only_question_labels: jsonOnlyLabels.slice(0, 20),
    sample_gateoverflow_only_question_entries: gateOverflowOnlyLabels
      .slice(0, 10)
      .map((label) => gateOverflowLabelMap.get(label))
      .filter(Boolean),
    sample_json_only_question_entries: jsonOnlyLabels
      .slice(0, 10)
      .map((label) => jsonQuestionLabelMap.get(label))
      .filter(Boolean),
    gateoverflow_only_question_count: gateOverflowOnly.length,
    json_only_question_count: jsonOnly.length,
    sample_gateoverflow_only_go_ids: gateOverflowOnly.slice(0, 20),
    sample_json_only_go_ids: jsonOnly.slice(0, 20),
    sample_gateoverflow_only_entries: gateOverflowOnly
      .slice(0, 10)
      .map((goId) => gateOverflowEntryMap.get(goId))
      .filter(Boolean),
    sample_json_only_entries: jsonOnly
      .slice(0, 10)
      .map((goId) => jsonRowMap.get(goId))
      .filter(Boolean),
    sample_duplicate_json_go_ids: Array.from(jsonBucket?.duplicateGoIds || [])
      .sort((left, right) => left - right)
      .slice(0, 20),
    sample_rows_without_go_id: (jsonBucket?.rowsWithoutGoId || []).slice(0, 10),
    sample_rows_without_question_label: (jsonBucket?.rowsWithoutQuestionLabel || []).slice(0, 10),
    fetched_pages: gateOverflowBucket?.pages || [],
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = readJson(args.input);

  if (!Array.isArray(rows)) {
    throw new Error("Input JSON must be an array of questions.");
  }

  const jsonIndex = buildJsonIndex(rows, args);
  const years = getYearsToAudit(jsonIndex, args)
    .filter((year) => year >= args.fromYear && year <= args.toYear);
  const comparisons = [];

  for (const year of years) {
    const jsonBucket = jsonIndex.get(year) || null;
    const candidateTags = buildCandidateTags(year, jsonBucket);

    let comparison;
    try {
      const resolved = await resolveLiveTag(year, candidateTags);

      if (!resolved.tag || !resolved.firstPage) {
        comparison = {
          year,
          error: "Unable to resolve a live GateOverflow tag page for this year.",
          candidate_tags: candidateTags,
          tag_resolution_attempts: resolved.attempts,
          json_unique_question_count: jsonBucket?.uniqueQuestionLabels.size || 0,
          json_total_rows: jsonBucket?.totalRows || 0,
          json_unique_gateoverflow_questions: jsonBucket?.uniqueGoIds.size || 0,
        };
      } else {
        const gateOverflowBucket = await crawlGateOverflowYear(
          year,
          resolved.tag,
          args,
          resolved.firstPage
        );
        comparison = buildComparison(year, jsonBucket, gateOverflowBucket, resolved);
      }
    } catch (error) {
      comparison = {
        year,
        error: error instanceof Error ? error.message : String(error),
        candidate_tags: candidateTags,
        json_unique_question_count: jsonBucket?.uniqueQuestionLabels.size || 0,
        json_total_rows: jsonBucket?.totalRows || 0,
        json_unique_gateoverflow_questions: jsonBucket?.uniqueGoIds.size || 0,
      };
    }

    comparisons.push(comparison);

    if (comparison.error) {
      console.log(`[pre-2010-gateoverflow-audit] ${year}: ERROR - ${comparison.error}`);
      continue;
    }

    console.log(
      `[pre-2010-gateoverflow-audit] ${year}: GO-questions=${comparison.gateoverflow_unique_question_count} JSON-questions=${comparison.json_unique_question_count} rawGO=${comparison.gateoverflow_total_questions} rawJSON=${comparison.json_total_rows} tag=${comparison.gateoverflow_tag}`
    );
  }

  const summary = {
    generated_at: new Date().toISOString(),
    input: path.resolve(args.input),
    report: path.resolve(args.report),
    audited_years: comparisons.length,
    from_year: args.fromYear,
    to_year: args.toYear,
    matching_question_counts: comparisons.filter(
      (entry) => !entry.error && entry.question_count_matches_gateoverflow
    ).length,
    mismatching_question_counts: comparisons.filter(
      (entry) => !entry.error && !entry.question_count_matches_gateoverflow
    ).length,
    matching_question_labels: comparisons.filter(
      (entry) => !entry.error && entry.question_label_match
    ).length,
    mismatching_question_labels: comparisons.filter(
      (entry) => !entry.error && !entry.question_label_match
    ).length,
    matching_row_counts: comparisons.filter(
      (entry) => !entry.error && entry.row_count_matches_gateoverflow
    ).length,
    mismatching_row_counts: comparisons.filter(
      (entry) => !entry.error && !entry.row_count_matches_gateoverflow
    ).length,
    matching_unique_go_ids: comparisons.filter(
      (entry) => !entry.error && entry.unique_go_id_match
    ).length,
    mismatching_unique_go_ids: comparisons.filter(
      (entry) => !entry.error && !entry.unique_go_id_match
    ).length,
    years_with_json_duplicate_go_ids: comparisons.filter(
      (entry) => !entry.error && entry.json_duplicate_go_id_count > 0
    ).length,
    years_with_json_rows_missing_go_ids: comparisons.filter(
      (entry) => !entry.error && entry.json_rows_without_go_id_count > 0
    ).length,
    years_with_json_rows_missing_question_labels: comparisons.filter(
      (entry) => !entry.error && entry.json_rows_without_question_label_count > 0
    ).length,
    years_with_fetch_errors: comparisons.filter((entry) => Boolean(entry.error)).length,
  };

  const report = {
    summary,
    years: comparisons,
  };

  writeJson(args.report, report);

  console.log(`[pre-2010-gateoverflow-audit] Audited years: ${summary.audited_years}`);
  console.log(`[pre-2010-gateoverflow-audit] Question-count mismatches: ${summary.mismatching_question_counts}`);
  console.log(`[pre-2010-gateoverflow-audit] Question-label mismatches: ${summary.mismatching_question_labels}`);
  console.log(`[pre-2010-gateoverflow-audit] Row-count mismatches: ${summary.mismatching_row_counts}`);
  console.log(`[pre-2010-gateoverflow-audit] Unique GO-ID mismatches: ${summary.mismatching_unique_go_ids}`);
  console.log(`[pre-2010-gateoverflow-audit] Fetch errors: ${summary.years_with_fetch_errors}`);
  console.log(`[pre-2010-gateoverflow-audit] Report: ${path.resolve(args.report)}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      `[pre-2010-gateoverflow-audit] Failed: ${error instanceof Error ? error.stack || error.message : String(error)}`
    );
    process.exitCode = 1;
  });
}

module.exports = {
  BASE_URL,
  USER_AGENT,
  buildCandidateTags,
  buildJsonIndex,
  cleanText,
  crawlGateOverflowYear,
  extractCseYear,
  extractGoId,
  extractQuestionLabel,
  extractQuestionLabelFromTitle,
  fetchHtml,
  getYearsToAudit,
  normalizeQuestionLabel,
  parseTagPage,
  readJson,
  resolveLiveTag,
  writeJson,
};
