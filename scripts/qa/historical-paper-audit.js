#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INPUT = "public/questions-with-answers.json";
const DEFAULT_REPORT = "artifacts/review/historical-paper-audit.json";
const DEFAULT_FROM_YEAR = 2010;
const CONTINUOUS_PAPER_QUESTION_COUNT = 65;
const SPLIT_MAIN_QUESTION_COUNT = 55;
const SPLIT_GA_QUESTION_COUNT = 10;
const INVISIBLE_TEXT_RE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const INVISIBLE_TEXT_TEST_RE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/;

function parseArgs(argv) {
  const result = {
    input: DEFAULT_INPUT,
    report: DEFAULT_REPORT,
    fromYear: DEFAULT_FROM_YEAR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      result.input = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--report" && argv[index + 1]) {
      result.report = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--from-year" && argv[index + 1]) {
      result.fromYear = Number.parseInt(argv[index + 1], 10) || DEFAULT_FROM_YEAR;
      index += 1;
    }
  }

  return result;
}

function readJson(filePath) {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Missing file: ${absolute}`);
  }
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

function cleanInvisibleText(value = "") {
  return String(value || "").replace(INVISIBLE_TEXT_RE, "");
}

function normalizeSetNo(rawValue) {
  const parsed = Number.parseInt(String(rawValue ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return parsed;
}

function extractPaperMeta(question = {}) {
  const existingExamUid = String(question.exam_uid || "").trim();
  const existingMatch = existingExamUid.match(/^cse:(\d{4}):set(\d+):([^:]+):q(.+)$/i);
  if (existingMatch) {
    return {
      year: Number.parseInt(existingMatch[1], 10),
      setNo: normalizeSetNo(existingMatch[2]),
      rawSection: existingMatch[3],
      rawToken: existingMatch[4],
      source: "exam_uid",
    };
  }

  const title = cleanInvisibleText(question.title || "");
  const yearTag = String(question.year || "").trim();
  const titleMatch = title.match(/GATE\s+CSE\s+(\d{4})(?:\s*(?:\|| )\s*Set\s*(\d+))?/i);
  if (titleMatch) {
    return {
      year: Number.parseInt(titleMatch[1], 10),
      setNo: normalizeSetNo(titleMatch[2] || extractSetFromYearTag(yearTag) || 1),
      rawSection: null,
      rawToken: null,
      source: "title",
    };
  }

  const link = String(question.link || "").trim();
  const linkMatch = link.match(/gate-(?:cse|it)-(\d{4})(?:-set-(\d+))?/i);
  if (linkMatch) {
    return {
      year: Number.parseInt(linkMatch[1], 10),
      setNo: normalizeSetNo(linkMatch[2] || extractSetFromYearTag(yearTag) || 1),
      rawSection: null,
      rawToken: null,
      source: "link",
    };
  }

  const yearTagMatch = yearTag.match(/gatecse-(\d{4})(?:-set(\d+))?/i);
  if (yearTagMatch) {
    return {
      year: Number.parseInt(yearTagMatch[1], 10),
      setNo: normalizeSetNo(yearTagMatch[2] || 1),
      rawSection: null,
      rawToken: null,
      source: "year_tag",
    };
  }

  return null;
}

function extractSetFromYearTag(yearTag = "") {
  const match = String(yearTag || "").match(/gatecse-(\d{4})(?:-set(\d+))?/i);
  return match ? match[2] : null;
}

function extractLogicalSlot(question = {}) {
  const title = cleanInvisibleText(question.title || "");
  const link = String(question.link || "").trim();

  let match = title.match(/Question\s*[: ]\s*GA\s*-?\s*(\d+)/i);
  if (match) {
    return { section: "ga", number: Number.parseInt(match[1], 10), source: "title" };
  }

  match = title.match(/GA\s+Question\s*[: ]\s*(\d+)/i);
  if (match) {
    return { section: "ga", number: Number.parseInt(match[1], 10), source: "title" };
  }

  match = title.match(/\bGA\b[\s|:-]*Question\s*[: ]\s*(\d+)/i);
  if (match) {
    return { section: "ga", number: Number.parseInt(match[1], 10), source: "title" };
  }

  match = title.match(/Question\s*[: ]\s*(\d+)/i);
  if (match) {
    return { section: "main", number: Number.parseInt(match[1], 10), source: "title" };
  }

  match = link.match(/question-ga-(\d+)/i);
  if (match) {
    return { section: "ga", number: Number.parseInt(match[1], 10), source: "link" };
  }

  match = link.match(/question-(\d+)/i);
  if (match) {
    return { section: "main", number: Number.parseInt(match[1], 10), source: "link" };
  }

  return null;
}

function formatLogicalSlot(slot, scheme = "continuous") {
  if (!slot) return null;
  if (scheme === "split" && slot.section === "ga") {
    return `GA-${slot.number}`;
  }
  return `Q-${slot.number}`;
}

function getExpectedSlotLabels(scheme) {
  if (scheme === "split") {
    const main = [];
    const ga = [];

    for (let number = 1; number <= SPLIT_MAIN_QUESTION_COUNT; number += 1) {
      main.push(number);
    }
    for (let number = 1; number <= SPLIT_GA_QUESTION_COUNT; number += 1) {
      ga.push(number);
    }

    return {
      main,
      ga,
      labels: [
        ...main.map((number) => `Q-${number}`),
        ...ga.map((number) => `GA-${number}`),
      ],
    };
  }

  const questions = [];
  for (let number = 1; number <= CONTINUOUS_PAPER_QUESTION_COUNT; number += 1) {
    questions.push(number);
  }

  return {
    questions,
    labels: questions.map((number) => `Q-${number}`),
  };
}

function buildCanonicalToken(slot) {
  if (!slot) return null;
  return slot.section === "ga" ? `ga-${slot.number}` : String(slot.number);
}

function hasInvisibleText(value = "") {
  return INVISIBLE_TEXT_TEST_RE.test(String(value || ""));
}

function isMalformedToken(rawSection = "", rawToken = "", slot = null) {
  if (!rawToken || !slot) {
    return false;
  }

  const normalizedSection = String(rawSection || "").trim().toLowerCase();
  const normalizedToken = String(rawToken || "").trim().toLowerCase();

  if (slot.section === "ga") {
    if (normalizedToken === `ga-${slot.number}`) {
      return false;
    }
    if (normalizedSection === "ga" && /^\d+$/.test(normalizedToken)) {
      return Number.parseInt(normalizedToken, 10) !== slot.number;
    }
    return true;
  }

  return !(normalizedSection === "main" && normalizedToken === String(slot.number));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = readJson(args.input);

  if (!Array.isArray(rows)) {
    throw new Error("Input JSON must be an array of questions.");
  }

  const paperMap = new Map();
  const questionsWithoutPaperMeta = [];

  for (const question of rows) {
    const paperMeta = extractPaperMeta(question);
    if (!paperMeta || !Number.isFinite(paperMeta.year) || paperMeta.year < args.fromYear) {
      if (!paperMeta) {
        questionsWithoutPaperMeta.push({
          question_uid: question.question_uid || null,
          title: question.title || "",
          link: question.link || "",
        });
      }
      continue;
    }

    const paperKey = `${paperMeta.year}-set${paperMeta.setNo}`;
    if (!paperMap.has(paperKey)) {
      paperMap.set(paperKey, {
        paperKey,
        year: paperMeta.year,
        setNo: paperMeta.setNo,
        rows: [],
      });
    }

    paperMap.get(paperKey).rows.push({
      question_uid: question.question_uid || null,
      exam_uid: question.exam_uid || null,
      title: question.title || "",
      link: question.link || "",
      paperMeta,
      logicalSlot: extractLogicalSlot(question),
    });
  }

  const papers = [];

  for (const paper of [...paperMap.values()].sort((left, right) => (
    left.year - right.year || left.setNo - right.setNo
  ))) {
    const hasGaSlots = paper.rows.some((row) => row.logicalSlot?.section === "ga");
    const scheme = hasGaSlots ? "split" : "continuous";
    const expected = getExpectedSlotLabels(scheme);
    const slotMap = new Map();
    const malformedEntries = [];
    const questionsWithoutLogicalSlot = [];

    for (const row of paper.rows) {
      if (!row.logicalSlot) {
        questionsWithoutLogicalSlot.push({
          question_uid: row.question_uid,
          exam_uid: row.exam_uid,
          title: row.title,
          link: row.link,
        });
        continue;
      }

      const label = formatLogicalSlot(row.logicalSlot, scheme);
      if (!slotMap.has(label)) {
        slotMap.set(label, []);
      }
      slotMap.get(label).push(row);

      const rawToken = row.paperMeta.rawToken;
      if (
        hasInvisibleText(row.title) ||
        isMalformedToken(row.paperMeta.rawSection, rawToken, row.logicalSlot)
      ) {
        malformedEntries.push({
          logical_slot: label,
          exam_uid: row.exam_uid,
          question_uid: row.question_uid,
          title: row.title,
          raw_token: rawToken || null,
          canonical_token: buildCanonicalToken(row.logicalSlot),
          has_invisible_title_chars: hasInvisibleText(row.title),
        });
      }
    }

    const duplicateLogicalSlots = [...slotMap.entries()]
      .filter(([, bucket]) => bucket.length > 1)
      .map(([logicalSlot, bucket]) => ({
        logical_slot: logicalSlot,
        question_uids: bucket.map((entry) => entry.question_uid).filter(Boolean),
        exam_uids: bucket.map((entry) => entry.exam_uid).filter(Boolean),
      }));

    const expectedLabels = new Set(expected.labels);
    const actualLabels = new Set(slotMap.keys());
    const missingLabels = [...expectedLabels].filter((label) => !actualLabels.has(label));

    const summary = {
      paper_key: paper.paperKey,
      year: paper.year,
      set_no: paper.setNo,
      scheme: scheme === "split" ? "split_main55_ga10" : "continuous_1_to_65",
      raw_row_count: paper.rows.length,
      logical_slot_count: actualLabels.size,
      expected_slot_count: expected.labels.length,
      missing_slot_count: missingLabels.length,
      duplicate_logical_slot_count: duplicateLogicalSlots.length,
      malformed_exam_uid_count: malformedEntries.length,
      questions_without_logical_slot_count: questionsWithoutLogicalSlot.length,
    };

    const details = {
      ...summary,
      missing_questions: scheme === "continuous"
        ? missingLabels.map((label) => Number.parseInt(label.replace(/^Q-/, ""), 10))
        : undefined,
      missing_main_questions: scheme === "split"
        ? missingLabels
          .filter((label) => label.startsWith("Q-"))
          .map((label) => Number.parseInt(label.replace(/^Q-/, ""), 10))
        : undefined,
      missing_ga_questions: scheme === "split"
        ? missingLabels
          .filter((label) => label.startsWith("GA-"))
          .map((label) => Number.parseInt(label.replace(/^GA-/, ""), 10))
        : undefined,
      duplicate_logical_slots: duplicateLogicalSlots,
      malformed_exam_uids: malformedEntries,
      questions_without_logical_slot: questionsWithoutLogicalSlot,
    };

    papers.push(details);
  }

  const summary = {
    generated_at: new Date().toISOString(),
    input: path.resolve(args.input),
    report: path.resolve(args.report),
    audited_from_year: args.fromYear,
    paper_count: papers.length,
    papers_with_missing_slots: papers.filter((paper) => paper.missing_slot_count > 0).length,
    papers_with_duplicate_slots: papers.filter((paper) => paper.duplicate_logical_slot_count > 0).length,
    papers_with_malformed_exam_uids: papers.filter((paper) => paper.malformed_exam_uid_count > 0).length,
    clean_papers: papers.filter((paper) => (
      paper.missing_slot_count === 0 &&
      paper.duplicate_logical_slot_count === 0 &&
      paper.malformed_exam_uid_count === 0 &&
      paper.questions_without_logical_slot_count === 0
    )).length,
    questions_without_paper_meta: questionsWithoutPaperMeta.length,
  };

  const report = {
    summary,
    papers,
    questions_without_paper_meta: questionsWithoutPaperMeta,
  };

  ensureParentDir(args.report);
  fs.writeFileSync(args.report, JSON.stringify(report, null, 2), "utf8");

  console.log(`[historical-paper-audit] Audited papers: ${summary.paper_count}`);
  console.log(`[historical-paper-audit] Papers with missing slots: ${summary.papers_with_missing_slots}`);
  console.log(`[historical-paper-audit] Papers with duplicate logical slots: ${summary.papers_with_duplicate_slots}`);
  console.log(`[historical-paper-audit] Papers with malformed exam_uids: ${summary.papers_with_malformed_exam_uids}`);
  console.log(`[historical-paper-audit] Questions without paper meta: ${summary.questions_without_paper_meta}`);
  console.log(`[historical-paper-audit] Report: ${path.resolve(args.report)}`);
}

main();
