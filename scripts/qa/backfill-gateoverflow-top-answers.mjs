#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const ROOT = process.cwd();
const MANUAL_PATCH_PATH = path.join(
  ROOT,
  "data",
  "answers",
  "manual-answers-patch-v1.json"
);
const ANSWERS_PATHS = [
  path.join(ROOT, "data", "answers", "answers_by_question_uid_v1.json"),
  path.join(ROOT, "public", "data", "answers", "answers_by_question_uid_v1.json"),
];
const QUESTIONS_PATH = path.join(ROOT, "public", "questions-with-answers.json");
const UNSUPPORTED_PATH = path.join(
  ROOT,
  "public",
  "data",
  "answers",
  "unsupported_question_uids_v1.json"
);
const REPORT_PATH = path.join(
  ROOT,
  "artifacts",
  "review",
  "gateoverflow-top-answer-backfill-report.json"
);
const USER_AGENT =
  "Mozilla/5.0 (compatible; GateQA-QA/1.0; +https://github.com/superawat/Gate_QA)";
const OPTION_LABELS = ["A", "B", "C", "D"];
const ALLOWED_OPTIONS = new Set(OPTION_LABELS);
const ANSWER_WIDGET_RE =
  /<span>\s*Answer:\s*<\/span>\s*<button[^>]*>(.*?)<\/button>/is;

function parseArgs(argv = []) {
  return {
    write: argv.includes("--write"),
  };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function extractQuestionOptions(questionHtml = "") {
  if (!questionHtml || !/<ol[\s>]/i.test(questionHtml)) {
    return [];
  }
  const dom = new JSDOM(`<body>${questionHtml}</body>`);
  const optionList = Array.from(dom.window.document.querySelectorAll("ol")).find(
    (node) => /upper-alpha/i.test(node.getAttribute("style") || "")
  );
  if (!optionList) {
    return [];
  }
  const nodes = Array.from(optionList.querySelectorAll(":scope > li"));
  return nodes.slice(0, OPTION_LABELS.length).map((node, index) => ({
    label: OPTION_LABELS[index],
    text: cleanText(node.textContent || ""),
  }));
}

function cleanText(value = "") {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value = "") {
  return cleanText(value)
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/&/g, " and ")
    .replace(/\boption\b/g, " ")
    .replace(/[()[\]{}$]/g, " ")
    .replace(/[^a-z0-9.+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value = "") {
  return normalizeText(value).replace(/[^a-z0-9.+-]+/g, "");
}

function inferStandardAnswerType(question = {}, options = []) {
  const tags = Array.isArray(question.tags) ? question.tags : [];
  if (tags.includes("numerical-answers") || options.length === 0) {
    return "NAT";
  }
  return "MCQ";
}

function parseTokenValue(rawValue = "", fallbackType = "MCQ") {
  const token = normalizeText(rawValue).toUpperCase();
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
      tolerance: { abs: Math.abs(upper - lower) / 2 || 0.01 },
    };
  }

  const msqParts = token
    .split(/\s*(?:,|;|\/|&|\band\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);
  if (msqParts.length > 1 && msqParts.every((part) => ALLOWED_OPTIONS.has(part))) {
    return {
      type: "MSQ",
      answer: [...new Set(msqParts)],
      tolerance: null,
    };
  }

  if (ALLOWED_OPTIONS.has(token)) {
    return {
      type: "MCQ",
      answer: token,
      tolerance: null,
    };
  }

  if (/^[-+]?\d+(?:\.\d+)?$/.test(token)) {
    return {
      type: fallbackType === "MCQ" ? "NAT" : fallbackType,
      answer: Number.parseFloat(token),
      tolerance: { abs: 0.01 },
    };
  }

  return null;
}

function extractWidgetAnswer(html = "", fallbackType = "MCQ") {
  const match = html.match(ANSWER_WIDGET_RE);
  if (!match) {
    return null;
  }
  const parsed = parseTokenValue(match[1], fallbackType);
  if (!parsed) {
    return null;
  }
  return {
    ...parsed,
    method: "gateoverflow_widget",
    raw_answer: cleanText(match[1]),
  };
}

function getAnswerCandidates(html = "") {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const candidates = Array.from(document.querySelectorAll("article.qa-a-list-item"))
    .map((article, index) => {
      const votes = Number.parseInt(
        cleanText(
          article.querySelector(".qa-netvote-count-data")?.textContent || "0"
        ),
        10
      );
      const content =
        article.querySelector(".qa-a-item-content") ||
        article.querySelector('[itemprop="text"]');
      const text = cleanText(content?.textContent || "");
      return {
        index,
        selected: article.classList.contains("qa-a-list-item-selected"),
        votes: Number.isFinite(votes) ? votes : 0,
        text,
      };
    })
    .filter((entry) => entry.text);

  candidates.sort((left, right) => {
    if (left.selected !== right.selected) {
      return left.selected ? -1 : 1;
    }
    if (left.votes !== right.votes) {
      return right.votes - left.votes;
    }
    return left.index - right.index;
  });

  return candidates;
}

function tryPatterns(answerText = "", fallbackType = "MCQ") {
  const patterns = [
    /\bcorrect\s*answer\s*[:=-]?\s*\$?\(?\s*([A-D](?:\s*[,;/&]\s*[A-D])*)\s*\)?\$?/i,
    /\bcorrect\s*option\s*[:=-]?\s*\$?\(?\s*([A-D](?:\s*[,;/&]\s*[A-D])*)\s*\)?\$?/i,
    /\bans(?:wer)?\s*(?:is|:|=)?\s*\$?\(?\s*([A-D](?:\s*[,;/&]\s*[A-D])*)\s*\)?\$?/i,
    /\b(?:option|choice)\s*\(?\s*([A-D])\s*\)?\b/i,
    /\b([A-D])\s*(?:choice|option)\b/i,
    /\banswer\s*[:=-]?\s*\$?\(?\s*([-+]?\d+(?:\.\d+)?)\s*\)?\$?/i,
    /\bans\s*[:=-]?\s*\$?\(?\s*([-+]?\d+(?:\.\d+)?)\s*\)?\$?/i,
    /\b([-+]?\d+(?:\.\d+)?)\s+is\s+the\s+answer\b/i,
    /\bresult\s*(?:is|=|:)?\s*\$?\(?\s*([-+]?\d+(?:\.\d+)?)\s*\)?\$?/i,
    /\bvalue\s*(?:is|=|:)?\s*\$?\(?\s*([-+]?\d+(?:\.\d+)?)\s*\)?\$?/i,
    /\b(?:so|hence|therefore)[^A-Za-z0-9]{0,8}(?:the\s+)?answer[^A-Za-z0-9]{0,8}\$?\(?\s*([-+]?\d+(?:\.\d+)?)\s*\)?\$?/i,
  ];

  for (const pattern of patterns) {
    const match = answerText.match(pattern);
    if (!match) {
      continue;
    }
    const parsed = parseTokenValue(match[1], fallbackType);
    if (parsed) {
      return {
        ...parsed,
        raw_answer: cleanText(match[1]),
      };
    }
  }

  return null;
}

function tryOptionTextMatch(answerText = "", options = []) {
  if (!options.length || !answerText) {
    return null;
  }

  const normalizedAnswer = normalizeText(answerText);
  const compactAnswer = compactText(answerText);
  const scoredMatches = [];

  for (const option of options) {
    const normalizedOption = normalizeText(option.text);
    const compactOption = compactText(option.text);
    if (!normalizedOption || !compactOption) {
      continue;
    }

    let score = 0;
    if (compactAnswer.includes(compactOption) && compactOption.length >= 4) {
      score = Math.max(score, compactOption.length + 30);
    }
    if (
      compactOption.includes(compactAnswer) &&
      compactAnswer.length >= 8 &&
      compactAnswer.length >= Math.ceil(compactOption.length * 0.7)
    ) {
      score = Math.max(score, compactAnswer.length + 10);
    }
    if (normalizedAnswer.includes(normalizedOption) && normalizedOption.length >= 6) {
      score = Math.max(score, normalizedOption.length + 20);
    }

    const optionNumbers = Array.from(
      new Set(option.text.match(/[-+]?\d+(?:\.\d+)?/g) || [])
    );
    const answerNumbers = Array.from(
      new Set(answerText.match(/[-+]?\d+(?:\.\d+)?/g) || [])
    );
    if (optionNumbers.length && answerNumbers.length) {
      const shared = optionNumbers.filter((value) => answerNumbers.includes(value));
      if (shared.length) {
        score = Math.max(score, shared.join("").length + 12);
      }
    }

    if (score > 0) {
      scoredMatches.push({
        label: option.label,
        score,
      });
    }
  }

  if (!scoredMatches.length) {
    return null;
  }

  scoredMatches.sort((left, right) => right.score - left.score);
  const [best, second] = scoredMatches;
  if (second && best.score === second.score) {
    return null;
  }

  return {
    type: "MCQ",
    answer: best.label,
    tolerance: null,
    raw_answer: best.label,
  };
}

function tryNumericOptionMatch(answerText = "", options = []) {
  if (!answerText || !options.length) {
    return null;
  }

  if (/\b[A-D]\b.*\b[A-D]\b/i.test(answerText)) {
    return null;
  }

  const answerNumbers = Array.from(
    new Set(answerText.match(/[-+]?\d+(?:\.\d+)?/g) || [])
  );
  if (!answerNumbers.length) {
    return null;
  }

  const scored = [];
  for (const option of options) {
    const optionNumbers = Array.from(
      new Set(option.text.match(/[-+]?\d+(?:\.\d+)?/g) || [])
    );
    const shared = optionNumbers.filter((value) => answerNumbers.includes(value));
    if (!shared.length) {
      continue;
    }
    scored.push({
      label: option.label,
      score: shared.join("").length,
    });
  }

  if (!scored.length) {
    return null;
  }

  scored.sort((left, right) => right.score - left.score);
  const [best, second] = scored;
  if (second && best.score === second.score) {
    return null;
  }

  return {
    type: "MCQ",
    answer: best.label,
    tolerance: null,
    raw_answer: best.label,
  };
}

function coerceNumericAnswerToOption(parsed, options = []) {
  if (!parsed || parsed.type !== "NAT" || !options.length) {
    return parsed;
  }

  const rawValue = String(parsed.answer);
  const matches = options.filter((option) =>
    normalizeText(option.text).split(/\s+/).includes(normalizeText(rawValue))
  );
  if (matches.length !== 1) {
    return parsed;
  }

  return {
    type: "MCQ",
    answer: matches[0].label,
    tolerance: null,
    raw_answer: matches[0].label,
  };
}

function isMeaningfulSubjectiveAnswer(answerText = "") {
  const normalized = normalizeText(answerText);
  if (!normalized) {
    return false;
  }
  if (
    /^(close|closed|duplicate|out of syllabus|out of gate syllabus|off topic)/i.test(
      normalized
    )
  ) {
    return false;
  }
  return normalized.length >= 20;
}

function parseTopAnswer(question = {}, answerText = "", options = []) {
  const fallbackType = inferStandardAnswerType(question, options);
  const direct = tryPatterns(answerText, fallbackType);
  if (direct) {
    if (direct.type === "MSQ" && options.length) {
      return {
        type: "AMBIGUOUS",
        answer: null,
        tolerance: null,
        method: "top_answer_ambiguous_multi_option",
        raw_answer: cleanText(answerText).slice(0, 500),
      };
    }
    const coercedDirect = coerceNumericAnswerToOption(direct, options);
    return {
      ...coercedDirect,
      method: "top_answer_direct_pattern",
    };
  }

  const ambiguousLetterList = answerText.match(
    /\b(?:answer|ans|correct answer)\s*[:=-]?\s*([A-D](?:\s*,\s*[A-D])+)/i
  );
  if (ambiguousLetterList && options.length) {
    return {
      type: "AMBIGUOUS",
      answer: null,
      tolerance: null,
      method: "top_answer_ambiguous_multi_option",
      raw_answer: cleanText(answerText).slice(0, 500),
    };
  }

  const optionMatch = tryOptionTextMatch(answerText, options);
  if (optionMatch) {
    return {
      ...optionMatch,
      method: "top_answer_option_text_match",
    };
  }

  const numericOptionMatch = tryNumericOptionMatch(answerText, options);
  if (numericOptionMatch) {
    return {
      ...numericOptionMatch,
      method: "top_answer_numeric_option_match",
    };
  }

  if (!options.length && isMeaningfulSubjectiveAnswer(answerText)) {
    return {
      type: "SUBJECTIVE",
      answer: null,
      tolerance: null,
      method: "top_answer_subjective_note",
      raw_answer: cleanText(answerText).slice(0, 500),
    };
  }

  return null;
}

function buildManualPatchRecord(result, link) {
  const note = `auto_backfill:${result.method}:${link}`;
  if (["SUBJECTIVE", "AMBIGUOUS"].includes(result.type)) {
    return {
      type: result.type,
      answer: null,
      note: `${note} :: ${result.raw_answer || ""}`.trim(),
    };
  }

  const record = {
    type: result.type,
    answer: result.answer,
    note,
  };
  if (result.tolerance) {
    record.tolerance = result.tolerance;
  }
  return record;
}

function buildAnswerJoinRecord(questionUid, result, link) {
  const base = {
    answer_uid: `manual_res:${questionUid}`,
    type: result.type,
    answer: result.answer,
    tolerance: result.tolerance ?? null,
    source: {
      kind: "gateoverflow_top_answer",
      method: result.method,
      question_uids: [questionUid],
      link,
      note: result.raw_answer || null,
      updated_at: new Date().toISOString(),
    },
    is_manual_resolution: true,
  };

  return base;
}

function updateAnswerPayload(payload = {}, manualPatchPayload = {}) {
  const nextPayload = {
    ...payload,
    generated_at: new Date().toISOString(),
    records_by_question_uid: {
      ...(payload.records_by_question_uid || {}),
    },
    stats: {
      ...(payload.stats || {}),
    },
  };

  nextPayload.stats.records = Object.keys(nextPayload.records_by_question_uid).length;
  nextPayload.stats.manual_patch_applied = Object.keys(
    manualPatchPayload.records_by_question_uid || {}
  ).length;

  return nextPayload;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manualPatchPayload = readJson(MANUAL_PATCH_PATH, {
    records_by_question_uid: {},
  });
  const questions = readJson(QUESTIONS_PATH, []);
  const answersPayload = readJson(ANSWERS_PATHS[0], {
    version: "v1",
    stats: {},
    records_by_question_uid: {},
  });
  const unsupportedPayload = readJson(UNSUPPORTED_PATH, { question_uids: [] });
  const unsupportedSet = new Set(unsupportedPayload.question_uids || []);
  const existingAnswers = answersPayload.records_by_question_uid || {};

  const unresolvedQuestions = questions.filter((question) => {
    const questionUid = String(question?.question_uid || "");
    if (!questionUid.startsWith("go:")) {
      return false;
    }
    if (unsupportedSet.has(questionUid)) {
      return false;
    }
    if (question.answer_meta || existingAnswers[questionUid]) {
      return false;
    }
    return true;
  });

  const report = {
    generated_at: new Date().toISOString(),
    input_questions: unresolvedQuestions.length,
    write: args.write,
    summary: {
      resolved_standard: 0,
      resolved_subjective: 0,
      resolved_ambiguous: 0,
      unresolved_no_answers: 0,
      unresolved_no_extract: 0,
      errors: 0,
    },
    rows: [],
  };

  for (const [index, question] of unresolvedQuestions.entries()) {
    const questionUid = String(question.question_uid);
    const options = extractQuestionOptions(question.question || "");
    const fallbackType = inferStandardAnswerType(question, options);
    const progressLabel = `[${index + 1}/${unresolvedQuestions.length}] ${questionUid}`;

    try {
      const html = await fetchHtml(question.link);
      const widgetResult = extractWidgetAnswer(html, fallbackType);
      if (widgetResult) {
        report.rows.push({
          question_uid: questionUid,
          title: question.title,
          link: question.link,
          status: "resolved",
          method: widgetResult.method,
          type: widgetResult.type,
          answer: widgetResult.answer,
        });
        if (args.write) {
          manualPatchPayload.records_by_question_uid[questionUid] =
            buildManualPatchRecord(widgetResult, question.link);
          answersPayload.records_by_question_uid[questionUid] =
            buildAnswerJoinRecord(questionUid, widgetResult, question.link);
        }
        if (widgetResult.type === "SUBJECTIVE") {
          report.summary.resolved_subjective += 1;
        } else if (widgetResult.type === "AMBIGUOUS") {
          report.summary.resolved_ambiguous += 1;
        } else {
          report.summary.resolved_standard += 1;
        }
        console.log(`${progressLabel} resolved via widget`);
        continue;
      }

      const candidates = getAnswerCandidates(html);
      if (!candidates.length) {
        report.rows.push({
          question_uid: questionUid,
          title: question.title,
          link: question.link,
          status: "unresolved_no_answers",
          method: null,
          type: null,
          answer: null,
        });
        report.summary.unresolved_no_answers += 1;
        console.log(`${progressLabel} still has no GateOverflow answers`);
        continue;
      }

      let resolved = null;
      for (const candidate of candidates) {
        const parsed = parseTopAnswer(question, candidate.text, options);
        if (parsed) {
          resolved = parsed;
          break;
        }
      }

      if (!resolved) {
        report.rows.push({
          question_uid: questionUid,
          title: question.title,
          link: question.link,
          status: "unresolved_no_extract",
          method: null,
          type: null,
          answer: null,
          top_answer_excerpt: candidates[0]?.text?.slice(0, 300) || null,
        });
        report.summary.unresolved_no_extract += 1;
        console.log(`${progressLabel} has answers but no confident extraction`);
        continue;
      }

      report.rows.push({
        question_uid: questionUid,
        title: question.title,
        link: question.link,
        status: "resolved",
        method: resolved.method,
        type: resolved.type,
        answer: resolved.answer,
      });

      if (args.write) {
        manualPatchPayload.records_by_question_uid[questionUid] =
          buildManualPatchRecord(resolved, question.link);
        answersPayload.records_by_question_uid[questionUid] =
          buildAnswerJoinRecord(questionUid, resolved, question.link);
      }

      if (resolved.type === "SUBJECTIVE") {
        report.summary.resolved_subjective += 1;
      } else if (resolved.type === "AMBIGUOUS") {
        report.summary.resolved_ambiguous += 1;
      } else {
        report.summary.resolved_standard += 1;
      }
      console.log(`${progressLabel} resolved via ${resolved.method}`);
    } catch (error) {
      report.rows.push({
        question_uid: questionUid,
        title: question.title,
        link: question.link,
        status: "error",
        error: error.message || String(error),
      });
      report.summary.errors += 1;
      console.log(`${progressLabel} failed: ${error.message}`);
    }
  }

  if (args.write) {
    const normalizedAnswersPayload = updateAnswerPayload(
      answersPayload,
      manualPatchPayload
    );
    for (const answersPath of ANSWERS_PATHS) {
      writeJson(answersPath, normalizedAnswersPayload);
    }
    writeJson(MANUAL_PATCH_PATH, manualPatchPayload);
  }

  writeJson(REPORT_PATH, report);

  console.log(
    JSON.stringify(
      {
        write: args.write,
        report: REPORT_PATH,
        ...report.summary,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
