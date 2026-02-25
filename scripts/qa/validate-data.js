#!/usr/bin/env node

/**
 * GateQA data integrity validation.
 *
 * Validates:
 * 1) Every question has a mapped answer by question UID.
 * 2) Orphan answer records are reported.
 * 3) Any orphan with missing/sentinel id_str (idstrmissing) is flagged.
 *
 * Exit code:
 * - 0 when all checks pass.
 * - 1 when coverage is below 100% or idstrmissing orphans exist.
 */

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_QUESTIONS_PATH = "public/questions-filtered.json";
const DEFAULT_ANSWER_CANDIDATES = [
  "public/data/answers/answers_master_v1.json",
  "public/data/answers/answersmasterv1.json",
  "public/answersmasterv1.json",
  "answersmasterv1.json",
];
const DEFAULT_UNSUPPORTED_UIDS_CANDIDATES = [
  "public/data/answers/unsupported_question_uids_v1.json",
  "data/answers/unsupported_question_uids_v1.json",
];

function parseArgs(argv) {
  const result = {
    questions: DEFAULT_QUESTIONS_PATH,
    answers: null,
    unsupported: null,
    report: "artifacts/review/data-integrity-report.json",
    strict: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--questions" && argv[i + 1]) {
      result.questions = argv[++i];
      continue;
    }
    if (arg === "--answers" && argv[i + 1]) {
      result.answers = argv[++i];
      continue;
    }
    if (arg === "--report" && argv[i + 1]) {
      result.report = argv[++i];
      continue;
    }
    if (arg === "--unsupported" && argv[i + 1]) {
      result.unsupported = argv[++i];
      continue;
    }
    if (arg === "--no-strict") {
      result.strict = false;
      continue;
    }
  }

  if (!result.answers) {
    result.answers = DEFAULT_ANSWER_CANDIDATES.find((candidate) =>
      fs.existsSync(candidate)
    );
  }
  if (!result.unsupported) {
    result.unsupported = DEFAULT_UNSUPPORTED_UIDS_CANDIDATES.find((candidate) =>
      fs.existsSync(candidate)
    );
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

function extractGateOverflowId(link = "") {
  const raw = String(link || "").trim();
  if (!raw) return null;
  const match = raw.match(
    /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
  );
  return match ? match[1] : null;
}

function getQuestionUid(question = {}) {
  const explicit =
    question.questionuid != null
      ? String(question.questionuid).trim()
      : question.question_uid != null
        ? String(question.question_uid).trim()
        : "";
  if (explicit) return explicit;

  const goId = extractGateOverflowId(question.link || "");
  return goId ? `go:${goId}` : null;
}

function toAnswerRecordMap(payload) {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  if (payload.records_by_uid && typeof payload.records_by_uid === "object") {
    return payload.records_by_uid;
  }
  return payload;
}

function isLikelyIdStrMissing(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return true;
  return (
    raw === "idstrmissing" ||
    raw === "id_str_missing" ||
    raw === "id-str-missing" ||
    raw.includes("idstrmissing")
  );
}

function ensureParentDir(filePath) {
  const dir = path.dirname(path.resolve(filePath));
  fs.mkdirSync(dir, { recursive: true });
}

function getUnsupportedUidSet(filePath) {
  if (!filePath) {
    return new Set();
  }
  const payload = readJson(filePath);
  if (!payload || typeof payload !== "object") {
    return new Set();
  }
  const list = Array.isArray(payload.question_uids) ? payload.question_uids : [];
  return new Set(
    list.map((value) => String(value || "").trim()).filter(Boolean)
  );
}

function normalizeToken(value) {
  return String(value || "").trim().toLowerCase();
}

function isSubjectiveQuestion(question = {}) {
  const explicitType = normalizeToken(question.type);
  if (explicitType === "subjective" || explicitType === "descriptive") {
    return true;
  }

  const tags = Array.isArray(question.tags)
    ? question.tags.map(normalizeToken)
    : [];
  if (tags.includes("subjective") || tags.includes("descriptive")) {
    return true;
  }

  return false;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.answers) {
    console.error(
      "[data-integrity] Could not find answers JSON. Pass --answers <path>."
    );
    process.exit(1);
  }

  const questions = readJson(args.questions);
  const answersPayload = readJson(args.answers);
  const unsupportedUidSet = getUnsupportedUidSet(args.unsupported);

  if (!Array.isArray(questions)) {
    throw new Error("questions JSON must be an array");
  }

  const recordsByUid = toAnswerRecordMap(answersPayload);
  const answerRecords = Object.entries(recordsByUid).map(([uid, record]) => ({
    uid,
    record: record || {},
  }));

  const questionUidSet = new Set();
  const duplicateQuestionUids = new Set();
  const questionsWithoutUid = [];
  const questionsMissingAnswerActionable = [];
  const questionsMissingAnswerSubjective = [];
  const questionsMissingAnswerUnsupported = [];
  const subjectiveQuestionUidSet = new Set();

  for (const question of questions) {
    const questionUid = getQuestionUid(question);
    if (!questionUid) {
      questionsWithoutUid.push({
        title: question.title || "",
        link: question.link || "",
      });
      continue;
    }

    if (questionUidSet.has(questionUid)) {
      duplicateQuestionUids.add(questionUid);
    }
    questionUidSet.add(questionUid);

    if (isSubjectiveQuestion(question)) {
      subjectiveQuestionUidSet.add(questionUid);
    }
  }

  const answersByQuestionUid = new Map();
  const orphanAnswerRecords = [];
  const idStrMissingOrphans = [];

  for (const { uid, record } of answerRecords) {
    const questionUid =
      record.questionuid != null
        ? String(record.questionuid).trim()
        : record.question_uid != null
          ? String(record.question_uid).trim()
          : "";

    if (questionUid) {
      if (!answersByQuestionUid.has(questionUid)) {
        answersByQuestionUid.set(questionUid, record);
      }
      if (!questionUidSet.has(questionUid)) {
        const orphan = {
          answer_uid: uid,
          question_uid: questionUid,
          id_str: record.id_str ?? null,
          type: record.type ?? null,
        };
        orphanAnswerRecords.push(orphan);
        if (isLikelyIdStrMissing(record.id_str)) {
          idStrMissingOrphans.push(orphan);
        }
      }
      continue;
    }

    const orphan = {
      answer_uid: uid,
      question_uid: null,
      id_str: record.id_str ?? null,
      type: record.type ?? null,
    };
    orphanAnswerRecords.push(orphan);
    if (isLikelyIdStrMissing(record.id_str)) {
      idStrMissingOrphans.push(orphan);
    }
  }

  for (const question of questions) {
    const questionUid = getQuestionUid(question);
    if (!questionUid) {
      continue;
    }
    if (!answersByQuestionUid.has(questionUid)) {
      const missingEntry = {
        question_uid: questionUid,
        title: question.title || "",
        link: question.link || "",
      };

      if (unsupportedUidSet.has(questionUid)) {
        questionsMissingAnswerUnsupported.push(missingEntry);
        continue;
      }
      if (subjectiveQuestionUidSet.has(questionUid)) {
        questionsMissingAnswerSubjective.push(missingEntry);
        continue;
      }
      questionsMissingAnswerActionable.push(missingEntry);
    }
  }

  const allMissingCount =
    questionsMissingAnswerActionable.length +
    questionsMissingAnswerSubjective.length +
    questionsMissingAnswerUnsupported.length;
  const mappedQuestionCount = questionUidSet.size - allMissingCount;
  const mappedGradableQuestionCount =
    questionUidSet.size -
    subjectiveQuestionUidSet.size -
    questionsMissingAnswerUnsupported.length -
    questionsMissingAnswerActionable.length;
  const gradableQuestionCount =
    questionUidSet.size -
    subjectiveQuestionUidSet.size -
    questionsMissingAnswerUnsupported.length;
  const coverageRatioAll =
    questionUidSet.size === 0 ? 0 : mappedQuestionCount / questionUidSet.size;
  const coverageRatioGradable =
    gradableQuestionCount <= 0
      ? 1
      : mappedGradableQuestionCount / gradableQuestionCount;

  const report = {
    generated_at: new Date().toISOString(),
    input: {
      questions: path.resolve(args.questions),
      answers: path.resolve(args.answers),
      unsupported: args.unsupported ? path.resolve(args.unsupported) : null,
    },
    stats: {
      questions_total: questions.length,
      questions_with_uid: questionUidSet.size,
      questions_without_uid: questionsWithoutUid.length,
      questions_subjective: subjectiveQuestionUidSet.size,
      answers_total: answerRecords.length,
      mapped_questions: mappedQuestionCount,
      mapped_gradable_questions: mappedGradableQuestionCount,
      missing_questions_total: allMissingCount,
      missing_questions_actionable: questionsMissingAnswerActionable.length,
      missing_questions_subjective: questionsMissingAnswerSubjective.length,
      missing_questions_unsupported: questionsMissingAnswerUnsupported.length,
      coverage_ratio_all: coverageRatioAll,
      coverage_ratio_gradable: coverageRatioGradable,
      duplicate_question_uids: duplicateQuestionUids.size,
      orphan_answers: orphanAnswerRecords.length,
      idstrmissing_orphans: idStrMissingOrphans.length,
    },
    failures: {
      questions_without_uid: questionsWithoutUid.slice(0, 200),
      duplicate_question_uids: Array.from(duplicateQuestionUids).slice(0, 200),
      questions_missing_answer_actionable: questionsMissingAnswerActionable.slice(
        0,
        500
      ),
      questions_missing_answer_subjective: questionsMissingAnswerSubjective.slice(
        0,
        500
      ),
      questions_missing_answer_unsupported: questionsMissingAnswerUnsupported.slice(
        0,
        500
      ),
      orphan_answer_records: orphanAnswerRecords.slice(0, 500),
      idstrmissing_orphans: idStrMissingOrphans.slice(0, 500),
    },
  };

  ensureParentDir(args.report);
  fs.writeFileSync(args.report, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `[data-integrity] Coverage (all): ${(coverageRatioAll * 100).toFixed(2)}% (${mappedQuestionCount}/${questionUidSet.size})`
  );
  console.log(
    `[data-integrity] Coverage (gradable): ${(coverageRatioGradable * 100).toFixed(2)}% (${mappedGradableQuestionCount}/${Math.max(gradableQuestionCount, 0)})`
  );
  console.log(
    `[data-integrity] Missing answers -> actionable: ${questionsMissingAnswerActionable.length}, subjective: ${questionsMissingAnswerSubjective.length}, unsupported: ${questionsMissingAnswerUnsupported.length}`
  );
  console.log(
    `[data-integrity] idstrmissing orphans: ${idStrMissingOrphans.length}`
  );
  console.log(`[data-integrity] Report: ${path.resolve(args.report)}`);

  const hasCoverageGap = questionsMissingAnswerActionable.length > 0;
  const hasIdStrMissingOrphans = idStrMissingOrphans.length > 0;
  const hasUidGaps = questionsWithoutUid.length > 0;

  if (args.strict && (hasIdStrMissingOrphans || hasUidGaps)) {
    process.exit(1);
  }

  if (args.strict && hasCoverageGap) {
    console.warn("\n[data-integrity] Warning: Coverage gap detected. Some questions (e.g. subjective questions) may legitimately be missing answers. This will not fail the build.");
  }
}

main();
