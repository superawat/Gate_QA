#!/usr/bin/env node

import {
  DA_ANSWER_KEYS_PATH,
  DA_AUDIT_DIR,
  DA_YEARS,
  answerKeyForQuestion,
  readJson,
  writeJson,
} from "./da-utils.mjs";

const answerKeys = {};
for (const year of DA_YEARS) {
  const payload = readJson(`${DA_AUDIT_DIR}/normalised-practicepaper-da-${year}.json`);
  if (!payload || !Array.isArray(payload.questions)) {
    throw new Error(`Missing normalized output for ${year}. Run qa:normalise-da first.`);
  }
  for (const question of payload.questions) {
    answerKeys[question.exam_uid] = answerKeyForQuestion({
      type: question.type,
      correctOptions: question.raw_answer?.correctOptions,
      natValue1: question.raw_answer?.natValue1,
      natValue2: question.raw_answer?.natValue2,
    });
  }
}

writeJson(DA_ANSWER_KEYS_PATH, answerKeys);
console.log(`[extract-da-answers] Wrote ${Object.keys(answerKeys).length} editable DA answer keys`);
