#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { countStructuredEmbeddedOptions, extractEmbeddedOptions } from "../../src/utils/stripEmbeddedOptions.js";
import { normalizeQuestionType, resolveQuestionType } from "../../src/utils/questionTypeResolution.js";

const root = process.cwd();
const readJson = (relativePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch {
    return fallback;
  }
};

const questions = readJson("public/questions-with-answers.json", []);
const answerRegistry = readJson("public/data/answers/answers_by_question_uid_v1.json", {});
const searchIndex = readJson("public/question-search-index.json", []);
const mockCatalog = readJson("public/mock_catalog_v1.json", {});
const daQuestions = readJson("public/data/da/questions-with-answers.json", []);
const daAnswersPayload = readJson("public/data/da/answers-by-question-uid-v1.json", {});
const daSearchPayload = readJson("public/data/da/search-index.json", {});
const daMockCatalog = readJson("public/mock_catalog_da_v1.json", {});
const recordsByUid = answerRegistry?.records_by_question_uid || {};
const searchByUid = new Map(searchIndex.map((row) => [String(row?.question_uid || ""), row]));
const catalogByUid = mockCatalog?.byQuestionUid || {};
const daRecordsByUid = daAnswersPayload?.records_by_question_uid || {};
const daSearchByUid = new Map((daSearchPayload?.questions || []).map((row) => [String(row?.question_uid || ""), row]));
const daCatalogByUid = daMockCatalog?.byQuestionUid || {};

const getUid = (question) => {
  const explicitUid = String(question?.question_uid || "").trim();
  if (explicitUid) return explicitUid;
  const match = String(question?.link || "").match(/gateoverflow\.in\/(\d+)/i);
  return match ? `go:${match[1]}` : "";
};

const getDaUid = (question) => {
  const title = String(question?.title || "");
  const year = String(question?.year || "").match(/(\d{4})/)?.[1] || title.match(/GATE\s+DA\s+(\d{4})/i)?.[1] || "";
  const questionNumber = title.match(/Question\s*:\s*(\d+)/i)?.[1] || "";
  if (year === "2026" && questionNumber) return `da:2026:set1:main:q${questionNumber}`;
  const gateOverflowId = String(question?.link || "").match(/gateoverflow\.in\/(\d+)/i)?.[1];
  if (gateOverflowId) return `go:${gateOverflowId}`;
  return year && questionNumber ? `da:${year}:set1:main:q${questionNumber}` : "";
};

const getOptionCount = (question) => Math.max(
  Array.isArray(question?.options) ? question.options.length : 0,
  extractEmbeddedOptions(question?.question || "").length,
);
const getConflictOptionCount = (question) => Math.max(
  Array.isArray(question?.options) ? question.options.length : 0,
  countStructuredEmbeddedOptions(question?.question || ""),
);

const getOptionPreview = (question) => {
  const options = Array.isArray(question?.options) && question.options.length > 0
    ? question.options
    : extractEmbeddedOptions(question?.question || "");
  return options.map((option, index) => ({
    label: String(typeof option === "object" && option
      ? (option.label ?? option.option_label ?? option.key ?? String.fromCharCode(65 + index))
      : String.fromCharCode(65 + index)),
    text: String(typeof option === "object" && option
      ? (option.text ?? option.value ?? option.html ?? "")
      : option ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
  }));
};

const buckets = {
  resolvedTypes: {},
  noOptionResolvedTypes: {},
  typeMismatches: [],
  typeOptionConflicts: [],
  unresolved: [],
  explicitNatWithOptions: [],
  numericalTagWithOptions: [],
  numericalTagResolvedMcqMsq: [],
  legacyTagFallbackCandidates: [],
  legacyNumericalTagFalseNatCandidates: [],
  legacyNatOnlyFalseNatCandidates: [],
  generatedTypeMismatches: [],
  scorableButUnresolved: [],
  scorableArtifactContractViolations: [],
};
const seen = new Set();
let optionBearingCount = 0;
let noOptionCount = 0;
let blankSearchTypeCount = 0;
let scorableCatalogRowsCount = 0;
const issueCounts = {};

for (const question of Array.isArray(questions) ? questions : []) {
  const uid = getUid(question);
  if (!uid || seen.has(uid)) continue;
  seen.add(uid);

  const answerRecord = recordsByUid[uid] || null;
  const answer = answerRecord?.answer
    ?? question?.answer_meta?.answer
    ?? question?.answerMeta?.answer
    ?? question?.answer;
  const optionCount = getOptionCount(question);
  const conflictOptionCount = getConflictOptionCount(question);
  const tags = new Set((Array.isArray(question?.tags) ? question.tags : []).map((tag) => String(tag || "").trim().toLowerCase()));
  const hasNumericalTag = tags.has("numerical-answers") || tags.has("numerical-answer");
  const resolution = resolveQuestionType({
    candidates: [
      { source: "answer_record", type: answerRecord?.type },
      { source: "answer_meta", type: question?.answer_meta?.type },
      { source: "answerMeta", type: question?.answerMeta?.type },
      { source: "question.type", type: question?.type },
    ],
    optionCount,
    conflictOptionCount,
    answer,
  });
  const indexType = normalizeQuestionType(searchByUid.get(uid)?.type);
  const catalogEntry = catalogByUid[uid];
  const catalogType = normalizeQuestionType(catalogEntry?.type);

  if (optionCount >= 2) optionBearingCount += 1;
  else noOptionCount += 1;
  if (!indexType) blankSearchTypeCount += 1;

  const typeBucket = resolution.type || "UNRESOLVED";
  buckets.resolvedTypes[typeBucket] = (buckets.resolvedTypes[typeBucket] || 0) + 1;
  if (optionCount < 2) {
    buckets.noOptionResolvedTypes[resolution.type || "UNRESOLVED"] =
      (buckets.noOptionResolvedTypes[resolution.type || "UNRESOLVED"] || 0) + 1;
  }
  for (const issue of resolution.issues) {
    issueCounts[issue] = (issueCounts[issue] || 0) + 1;
  }

  const row = {
    questionUid: uid,
    title: String(question?.title || "").trim(),
    year: question?.year || null,
    examUid: question?.exam_uid || null,
    questionPreview: String(question?.question || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800),
    options: getOptionPreview(question),
    tags: Array.from(tags),
    optionCount,
    conflictOptionCount,
    authoritativeType: resolution.type || null,
    issues: resolution.issues,
    answerRecordType: answerRecord?.type || null,
    answer: answerRecord?.answer ?? answer ?? null,
    questionType: question?.type || null,
    searchIndexType: searchByUid.get(uid)?.type ?? null,
    catalogType: catalogEntry?.type ?? null,
    catalogScorable: catalogEntry?.scorable === true,
    hasNumericalAnswersTag: hasNumericalTag,
  };

  if (resolution.issues.includes("type_mismatch")) buckets.typeMismatches.push(row);
  if (resolution.issues.includes("type_option_conflict")) buckets.typeOptionConflicts.push(row);
  if (!resolution.type) buckets.unresolved.push(row);
  if (conflictOptionCount >= 2 && resolution.type === "NAT") buckets.explicitNatWithOptions.push(row);
  if (hasNumericalTag && (resolution.type === "MCQ" || resolution.type === "MSQ")) {
    buckets.numericalTagResolvedMcqMsq.push(row);
  }
  // Simulate the old async fallback at the point AnswerService had not loaded:
  // it inspected camelCase answerMeta and top-level type, but missed answer_meta.
  const legacyRuntimeType = normalizeQuestionType(question?.answerMeta?.type ?? question?.type);
  if (optionCount >= 2 && hasNumericalTag && !legacyRuntimeType) {
    buckets.legacyTagFallbackCandidates.push(row);
    if (resolution.type === "MCQ" || resolution.type === "MSQ") {
      buckets.legacyNumericalTagFalseNatCandidates.push(row);
    }
  }
  if (optionCount >= 2 && tags.has("nat") && !hasNumericalTag && !legacyRuntimeType) {
    buckets.legacyNatOnlyFalseNatCandidates.push(row);
  }
  if (optionCount >= 2 && hasNumericalTag) {
    buckets.numericalTagWithOptions.push(row);
  }
  if (resolution.type && (indexType !== resolution.type || catalogType !== resolution.type)) {
    buckets.generatedTypeMismatches.push(row);
  }
  if (!resolution.type && catalogEntry?.scorable === true) {
    buckets.scorableButUnresolved.push(row);
  }

  if (catalogEntry?.scorable === true) {
    scorableCatalogRowsCount += 1;
    const contractIssues = [];
    if (!catalogType) contractIssues.push("catalog_type_missing");
    if (!indexType || indexType !== catalogType) contractIssues.push("index_catalog_type_mismatch");
    if (answerRecord?.type && normalizeQuestionType(answerRecord.type) !== catalogType) {
      contractIssues.push("answer_catalog_type_mismatch");
    }
    if (catalogType !== resolution.type) contractIssues.push("source_catalog_type_mismatch");

    if (catalogType === "MCQ" || catalogType === "MSQ") {
      const rawOptions = Array.isArray(question?.options) && question.options.length > 0
        ? question.options
        : extractEmbeddedOptions(question?.question || "");
      const optionLabels = new Set(rawOptions.map((option, index) => {
        const rawLabel = typeof option === "object" && option
          ? (option.label ?? option.option_label ?? option.key)
          : null;
        return String(rawLabel ?? String.fromCharCode(65 + index)).trim().toUpperCase();
      }).filter((label) => /^[A-E]$/.test(label)));
      if (optionLabels.size < 2) contractIssues.push("scorable_choice_question_missing_options");
      const answerLabels = Array.isArray(answerRecord?.answer) ? answerRecord.answer : [answerRecord?.answer];
      if (answerLabels.length === 0 || answerLabels.some((label) => !optionLabels.has(String(label ?? "").trim().toUpperCase()))) {
        contractIssues.push("scorable_choice_answer_missing_from_options");
      }
    }

    if (catalogType === "NAT") {
      const values = Array.isArray(answerRecord?.answer) ? answerRecord.answer : [answerRecord?.answer];
      if (!values.some((value) => String(value ?? "").trim() !== "" && Number.isFinite(Number(value)))) {
        contractIssues.push("scorable_nat_answer_not_numeric");
      }
    }

    if (contractIssues.length > 0) {
      buckets.scorableArtifactContractViolations.push({ ...row, contractIssues });
    }
  }
}

const incidentUid = "go:422894";
const incident = {
  source: (Array.isArray(questions) ? questions : []).find((question) => getUid(question) === incidentUid) || null,
  answerRecord: recordsByUid[incidentUid] || null,
  searchIndex: searchByUid.get(incidentUid) || null,
  catalog: catalogByUid[incidentUid] || null,
};
if (incident.source) {
  incident.optionCount = getOptionCount(incident.source);
  incident.resolution = resolveQuestionType({
    candidates: [
      { source: "answer_record", type: incident.answerRecord?.type },
      { source: "answer_meta", type: incident.source?.answer_meta?.type },
      { source: "answerMeta", type: incident.source?.answerMeta?.type },
      { source: "question.type", type: incident.source?.type },
    ],
    optionCount: incident.optionCount,
    conflictOptionCount: getConflictOptionCount(incident.source),
    answer: incident.answerRecord?.answer ?? incident.source?.answer_meta?.answer ?? incident.source?.answerMeta?.answer ?? incident.source?.answer,
  });
}

const daTypeMismatches = [];
const daMissingAnswerRecords = [];
for (const question of Array.isArray(daQuestions) ? daQuestions : []) {
  const uid = getDaUid(question);
  if (!uid) continue;
  const answerRecord = daRecordsByUid[uid] || null;
  const searchRow = daSearchByUid.get(uid) || null;
  const catalogEntry = daCatalogByUid[uid] || null;
  if (!answerRecord) daMissingAnswerRecords.push(uid);
  const answerType = normalizeQuestionType(answerRecord?.type);
  const searchType = normalizeQuestionType(searchRow?.type);
  const catalogType = normalizeQuestionType(catalogEntry?.type);
  if (answerType !== searchType || answerType !== catalogType) {
    daTypeMismatches.push({
      questionUid: uid,
      answerRecordType: answerRecord?.type ?? null,
      searchIndexType: searchRow?.type ?? null,
      catalogType: catalogEntry?.type ?? null,
      catalogScorable: catalogEntry?.scorable === true,
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  inputs: {
    sourceQuestionCount: seen.size,
    answerRegistryCount: Object.keys(recordsByUid).length,
    searchIndexCount: searchIndex.length,
    catalogCount: Object.keys(catalogByUid).length,
    daSourceQuestionCount: Array.isArray(daQuestions) ? daQuestions.length : 0,
    daAnswerRegistryCount: Object.keys(daRecordsByUid).length,
    daSearchIndexCount: daSearchPayload?.questions?.length || 0,
    daCatalogCount: Object.keys(daCatalogByUid).length,
  },
  daAudit: {
    checkedQuestionCount: Array.isArray(daQuestions) ? daQuestions.length : 0,
    missingAnswerRecordCount: daMissingAnswerRecords.length,
    missingAnswerRecords: daMissingAnswerRecords,
    typeMismatchCount: daTypeMismatches.length,
    typeMismatches: daTypeMismatches,
  },
  summary: {
    optionBearingCount,
    noOptionCount,
    blankSearchTypeCount,
    issueCounts,
    resolvedTypes: buckets.resolvedTypes,
    noOptionResolvedTypes: buckets.noOptionResolvedTypes,
    scorableCatalogRowsCount,
    numericalTagWithOptionsCount: buckets.numericalTagWithOptions.length,
    numericalTagResolvedMcqMsqCount: buckets.numericalTagResolvedMcqMsq.length,
    legacyNumericalTagFalseNatCandidateCount: buckets.legacyNumericalTagFalseNatCandidates.length,
    legacyTagFallbackCandidateCount: buckets.legacyTagFallbackCandidates.length,
    legacyTagFallbackUnresolvedCount: buckets.legacyTagFallbackCandidates
      .filter((row) => !row.authoritativeType).length,
    legacyNatOnlyFalseNatCandidateCount: buckets.legacyNatOnlyFalseNatCandidates.length,
    legacyTagFallbackCandidatesNotResolvedAsChoice: buckets.legacyTagFallbackCandidates
      .filter((row) => row.authoritativeType !== "MCQ" && row.authoritativeType !== "MSQ").length,
    generatedTypeMismatchCount: buckets.generatedTypeMismatches.length,
    scorableButUnresolvedCount: buckets.scorableButUnresolved.length,
    scorableArtifactContractViolationCount: buckets.scorableArtifactContractViolations.length,
  },
  incident,
  uidFindings: buckets,
};

const outputPath = path.join(root, "artifacts", "review", "custom-builder-question-type-audit.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, ...report.summary, daAudit: {
  checkedQuestionCount: report.daAudit.checkedQuestionCount,
  missingAnswerRecordCount: report.daAudit.missingAnswerRecordCount,
  typeMismatchCount: report.daAudit.typeMismatchCount,
}, incident: {
  questionUid: incidentUid,
  resolvedType: incident.resolution?.type || null,
  answerType: incident.answerRecord?.type || null,
  answer: incident.answerRecord?.answer ?? null,
  optionCount: incident.optionCount || 0,
  indexType: incident.searchIndex?.type ?? null,
  catalogType: incident.catalog?.type ?? null,
  catalogScorable: incident.catalog?.scorable === true,
} }, null, 2));
