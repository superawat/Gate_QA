#!/usr/bin/env node

import {
  DA_ANSWER_KEYS_PATH,
  DA_AUDIT_DIR,
  DA_BANK_PATH,
  DA_DATA_DIR,
  DA_YEARS,
  answerKeyForQuestion,
  readJson,
  writeJson,
} from "./da-utils.mjs";
import { getDa2026GateOverflowLink } from "./da-2026-links.mjs";

const ANSWERS_OUTPUT_PATH = `${DA_DATA_DIR}/answers-by-question-uid-v1.json`;

const CANONICAL_SUBJECT_ALIASES = {
  "data-science-and-artificial-intelligence": "artificial-intelligence",
  "programming-in-python": "programming-data-structures-and-algorithms",
  "data-structures": "programming-data-structures-and-algorithms",
  algorithms: "programming-data-structures-and-algorithms",
};

function extractGateOverflowId(link = "") {
  return String(link || "").match(
    /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
  )?.[1] || null;
}

function toCanonicalQuestion(question) {
  const link = String(question.reference_link || "").trim();
  const tags = Array.isArray(question.tags)
    ? question.tags.map((tag) => CANONICAL_SUBJECT_ALIASES[String(tag)] || tag)
    : [];
  return {
    title: question.title || "",
    link,
    question: question.question || "",
    tags: [...new Set(tags)],
    year: question.year || "",
    answer: null,
  };
}

function mergeYear(year, answerKeys) {
  const input = `${DA_AUDIT_DIR}/normalised-practicepaper-da-${year}.json`;
  const payload = readJson(input);
  if (!payload || !Array.isArray(payload.questions)) {
    throw new Error(`Missing or invalid normalized output: ${input}`);
  }

  return payload.questions.map((question) => {
    const fallback = answerKeyForQuestion({
      type: question.type,
      correctOptions: question.raw_answer?.correctOptions,
      natValue1: question.raw_answer?.natValue1,
      natValue2: question.raw_answer?.natValue2,
    });
    const answerKey = answerKeys[question.exam_uid] || fallback;
    const canonicalQuestion = toCanonicalQuestion(question);
    return {
      ...canonicalQuestion,
      _question_uid: `go:${extractGateOverflowId(canonicalQuestion.link) || question.question_uid}`,
      _exam_uid: question.exam_uid,
      _source_url: question.source_url,
      _reference_link: question.reference_link,
      _answer_key: {
        answer: answerKey.answer,
        tolerance: answerKey.tolerance ?? null,
      },
      answer_meta: {
        type: question.type,
        answer: answerKey.answer,
        tolerance: answerKey.tolerance ?? null,
        source: "practicepaper",
      },
      type: question.type,
      options: question.options,
      question_uid: question.question_uid,
      exam_uid: question.exam_uid,
      raw_answer: question.raw_answer,
      reference_link: question.reference_link,
      category: question.category,
      paper: question.paper,
      subject: question.subject,
      subject_slug: question.subject_slug,
      question_number: question.question_number,
      marks: question.marks,
      source_url: question.source_url,
      answer_uid: question.answer_uid,
      
    };
  });
}

function main() {
  const answerKeys = readJson(DA_ANSWER_KEYS_PATH, {});
  const existingQuestions = readJson(DA_BANK_PATH, []);
  const retained2026Questions = Array.isArray(existingQuestions)
    ? existingQuestions.filter((question) => question?.year === "gateda-2026")
    : [];
  const questions = [
    ...DA_YEARS.flatMap((year) => mergeYear(year, answerKeys)),
    ...retained2026Questions.map((question) => {
      const questionNumber = String(question.title || "").match(/Question\s*:\s*(\d+)/i)?.[1] || "";
      const questionUid = `da:2026:set1:main:q${questionNumber}`;
      return {
        ...question,
        link: getDa2026GateOverflowLink(questionNumber) || question.link || "",
        tags: [...new Set((question.tags || []).map((tag) => CANONICAL_SUBJECT_ALIASES[String(tag)] || tag))],
        _question_uid: questionUid,
        _exam_uid: questionUid,
        answer_meta: null,
      };
    }),
  ];
  const existingAnswerPayload = readJson(ANSWERS_OUTPUT_PATH, {});
  const existing2026Records = Object.fromEntries(
    Object.entries(existingAnswerPayload?.records_by_question_uid || {})
      .filter(([questionUid]) => questionUid.startsWith("da:2026:"))
  );
  const generatedRecords = Object.fromEntries(
    questions
      .filter((question) => question.answer_meta)
      .map((question) => [question._question_uid, {
        answer_uid: question._exam_uid || question._question_uid,
        type: question.answer_meta.type,
        answer: question.answer_meta.answer,
        tolerance: question.answer_meta.tolerance,
        source: {
          kind: question.answer_meta.source,
          source_url: question._source_url || null,
          reference_link: question._reference_link || null,
        },
      }])
  );
  const recordsByQuestionUid = { ...existing2026Records, ...generatedRecords };

  const publicQuestions = questions.map(({
    _question_uid: _questionUid,
    _exam_uid: _examUid,
    _source_url: _sourceUrl,
    _reference_link: _referenceLink,
    _answer_key: _answerKey,
    answer_meta: _answerMeta,
    type: _type,
    options: _options,
    question_uid: _questionUidLegacy,
    exam_uid: _examUidLegacy,
    raw_answer: _rawAnswer,
    reference_link: _referenceLinkLegacy,
    category: _category,
    paper: _paper,
    subject: _subject,
    subject_slug: _subjectSlug,
    question_number: _questionNumber,
    marks: _marks,
    source_url: _sourceUrlLegacy,
    answer_uid: _answerUid,
    ...canonical
  }) => canonical);

  writeJson(DA_BANK_PATH, publicQuestions);
  const answerPayload = {
    version: "v1",
    generated_at: new Date().toISOString(),
    records_by_question_uid: recordsByQuestionUid,
    stats: {
      total: questions.length,
      answered: Object.keys(recordsByQuestionUid).length,
      years: new Set(questions.map((question) => question.year).filter(Boolean)).size,
    },
  };
  writeJson(ANSWERS_OUTPUT_PATH, answerPayload);
  console.log(`[merge-da] Wrote ${publicQuestions.length} CSE-shaped questions and ${Object.keys(recordsByQuestionUid).length} question-UID answer records`);
}

main();
