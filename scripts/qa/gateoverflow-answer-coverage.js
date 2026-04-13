#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INPUT = "public/questions-with-answers.json";
const DEFAULT_ANSWERS = "public/data/answers/answers_by_question_uid_v1.json";
const DEFAULT_UNSUPPORTED = "public/data/answers/unsupported_question_uids_v1.json";
const DEFAULT_REPORT = "artifacts/review/gateoverflow-answer-coverage.json";
const DEFAULT_SAMPLE_SIZE = 25;

function parseArgs(argv) {
  const result = {
    input: DEFAULT_INPUT,
    answers: DEFAULT_ANSWERS,
    unsupported: DEFAULT_UNSUPPORTED,
    report: DEFAULT_REPORT,
    sampleSize: DEFAULT_SAMPLE_SIZE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--input" && argv[index + 1]) {
      result.input = argv[++index];
      continue;
    }
    if (arg === "--answers" && argv[index + 1]) {
      result.answers = argv[++index];
      continue;
    }
    if (arg === "--unsupported" && argv[index + 1]) {
      result.unsupported = argv[++index];
      continue;
    }
    if (arg === "--report" && argv[index + 1]) {
      result.report = argv[++index];
      continue;
    }
    if (arg === "--sample-size" && argv[index + 1]) {
      result.sampleSize = Math.max(
        1,
        Number.parseInt(argv[++index], 10) || DEFAULT_SAMPLE_SIZE
      );
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
    return match[1];
  }

  match = value.match(
    /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:\/[^?#]*)?(?:[?#].*)?$/i
  );
  if (match) {
    return match[1];
  }

  return null;
}

function toAnswerRecordMap(payload) {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  if (payload.records_by_question_uid && typeof payload.records_by_question_uid === "object") {
    return payload.records_by_question_uid;
  }
  return payload;
}

function toUnsupportedUidSet(payload) {
  if (!payload || typeof payload !== "object") {
    return new Set();
  }

  const values = Array.isArray(payload.question_uids) ? payload.question_uids : [];
  return new Set(
    values
      .map((value) => normalizeQuestionUid(value))
      .filter(Boolean)
  );
}

function normalizeQuestionUid(rawValue = "") {
  const goId = extractGoId(rawValue);
  return goId ? `go:${goId}` : null;
}

function getQuestionUid(question = {}) {
  const explicit =
    question.question_uid != null
      ? String(question.question_uid).trim()
      : question.questionuid != null
        ? String(question.questionuid).trim()
        : "";
  const explicitUid = normalizeQuestionUid(explicit);
  if (explicitUid) {
    return { questionUid: explicitUid, source: "question_uid" };
  }

  const linkUid = normalizeQuestionUid(question.link || "");
  if (linkUid) {
    return { questionUid: linkUid, source: "link" };
  }

  return { questionUid: null, source: null };
}

function extractYear(question = {}) {
  const examUid = String(question.exam_uid || "").trim();
  let match = examUid.match(/^cse:(\d{4}):set(\d+):/i);
  if (match) {
    return {
      year: Number.parseInt(match[1], 10),
      setNo: Number.parseInt(match[2], 10),
      source: "exam_uid",
    };
  }

  const yearTag = String(question.year || "").trim();
  match = yearTag.match(/^gate(?:cse|it)?-?(\d{4})(?:-set(\d+))?$/i);
  if (match) {
    return {
      year: Number.parseInt(match[1], 10),
      setNo: match[2] ? Number.parseInt(match[2], 10) : yearTag.includes("set") ? 1 : null,
      source: "year_tag",
    };
  }

  const title = cleanText(question.title || "");
  match = title.match(/GATE\s+(?:CSE|IT)?\s*(\d{4})(?:\s*\|\s*Set\s*(\d+))?/i);
  if (match) {
    return {
      year: Number.parseInt(match[1], 10),
      setNo: match[2] ? Number.parseInt(match[2], 10) : null,
      source: "title",
    };
  }

  const link = String(question.link || "").trim();
  match = link.match(/gate-(?:cse|it)-(\d{4})(?:-set-(\d+))?/i);
  if (match) {
    return {
      year: Number.parseInt(match[1], 10),
      setNo: match[2] ? Number.parseInt(match[2], 10) : null,
      source: "link",
    };
  }

  return { year: null, setNo: null, source: null };
}

function getPaperKey(year, setNo) {
  if (!Number.isFinite(year) || year < 2010) {
    return null;
  }

  return `${year}-set${Number.isFinite(setNo) && setNo > 0 ? setNo : 1}`;
}

function createBucket(base = {}) {
  return {
    gateoverflow_backed_questions: 0,
    answered: 0,
    missing_answer_actionable: 0,
    missing_answer_exception: 0,
    ...base,
  };
}

function classifyQuestion(question = {}, answerRecordMap = {}, unsupportedUidSet = new Set()) {
  const { questionUid, source } = getQuestionUid(question);
  if (!questionUid) {
    return null;
  }

  let status = "missing_answer_actionable";
  if (answerRecordMap[questionUid]) {
    status = "answered";
  } else if (unsupportedUidSet.has(questionUid)) {
    status = "missing_answer_exception";
  }

  const { year, setNo } = extractYear(question);
  const paperKey = getPaperKey(year, setNo);
  const normalizedSetNo =
    Number.isFinite(year) && year >= 2010
      ? Number.isFinite(setNo) && setNo > 0
        ? setNo
        : 1
      : Number.isFinite(setNo) && setNo > 0
        ? setNo
        : null;

  return {
    status,
    question_uid: questionUid,
    title: question.title || "",
    link: question.link || "",
    year,
    set_no: normalizedSetNo,
    paper_key: paperKey,
    resolved_uid_source: source,
  };
}

function buildCoverageReport(
  questions = [],
  answersPayload = {},
  unsupportedPayload = {},
  options = {}
) {
  const answerRecordMap = toAnswerRecordMap(answersPayload);
  const unsupportedUidSet =
    unsupportedPayload instanceof Set
      ? unsupportedPayload
      : toUnsupportedUidSet(unsupportedPayload);
  const sampleSize = Math.max(1, options.sampleSize || DEFAULT_SAMPLE_SIZE);

  const summary = createBucket();
  const perYear = new Map();
  const perPaper = new Map();
  const sampleActionableGaps = [];
  const sampleExceptionGaps = [];

  for (const question of questions) {
    const classification = classifyQuestion(question, answerRecordMap, unsupportedUidSet);
    if (!classification) {
      continue;
    }

    summary.gateoverflow_backed_questions += 1;
    summary[classification.status] += 1;

    if (Number.isFinite(classification.year)) {
      if (!perYear.has(classification.year)) {
        perYear.set(
          classification.year,
          createBucket({
            year: classification.year,
          })
        );
      }

      const yearBucket = perYear.get(classification.year);
      yearBucket.gateoverflow_backed_questions += 1;
      yearBucket[classification.status] += 1;
    }

    if (classification.paper_key) {
      if (!perPaper.has(classification.paper_key)) {
        perPaper.set(
          classification.paper_key,
          createBucket({
            paper_key: classification.paper_key,
            year: classification.year,
            set_no: classification.set_no,
          })
        );
      }

      const paperBucket = perPaper.get(classification.paper_key);
      paperBucket.gateoverflow_backed_questions += 1;
      paperBucket[classification.status] += 1;
    }

    if (
      classification.status === "missing_answer_actionable" &&
      sampleActionableGaps.length < sampleSize
    ) {
      sampleActionableGaps.push(classification);
    }

    if (
      classification.status === "missing_answer_exception" &&
      sampleExceptionGaps.length < sampleSize
    ) {
      sampleExceptionGaps.push(classification);
    }
  }

  return {
    summary,
    per_year: [...perYear.values()].sort((left, right) => left.year - right.year),
    per_paper_2010_plus: [...perPaper.values()].sort((left, right) => {
      if (left.year !== right.year) {
        return left.year - right.year;
      }
      return left.set_no - right.set_no;
    }),
    sample_actionable_gaps: sampleActionableGaps,
    sample_exception_gaps: sampleExceptionGaps,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const questions = readJson(args.input);
  const answersPayload = readJson(args.answers);
  const unsupportedPayload = readJson(args.unsupported);

  if (!Array.isArray(questions)) {
    throw new Error("Input JSON must be an array of questions.");
  }

  const report = buildCoverageReport(questions, answersPayload, unsupportedPayload, {
    sampleSize: args.sampleSize,
  });

  report.summary.generated_at = new Date().toISOString();
  report.summary.input = path.resolve(args.input);
  report.summary.answers = path.resolve(args.answers);
  report.summary.unsupported = path.resolve(args.unsupported);
  report.summary.report = path.resolve(args.report);
  report.summary.sample_size = args.sampleSize;

  writeJson(args.report, report);

  console.log(
    `[gateoverflow-answer-coverage] GateOverflow-backed questions: ${report.summary.gateoverflow_backed_questions}`
  );
  console.log(`[gateoverflow-answer-coverage] Answered: ${report.summary.answered}`);
  console.log(
    `[gateoverflow-answer-coverage] Missing answer actionable: ${report.summary.missing_answer_actionable}`
  );
  console.log(
    `[gateoverflow-answer-coverage] Missing answer exception: ${report.summary.missing_answer_exception}`
  );
  console.log(
    `[gateoverflow-answer-coverage] Report: ${path.resolve(args.report)}`
  );

  if (report.summary.missing_answer_actionable > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(
      `[gateoverflow-answer-coverage] Failed: ${error instanceof Error ? error.stack || error.message : String(error)}`
    );
    process.exitCode = 1;
  }
}

module.exports = {
  buildCoverageReport,
  classifyQuestion,
  createBucket,
  extractGoId,
  extractYear,
  getPaperKey,
  getQuestionUid,
  normalizeQuestionUid,
  parseArgs,
  readJson,
  toAnswerRecordMap,
  toUnsupportedUidSet,
  writeJson,
};
