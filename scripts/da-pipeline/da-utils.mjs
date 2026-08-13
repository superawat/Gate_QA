import fs from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
export const PUBLIC_DIR = path.join(ROOT, "public");
export const DA_PIPELINE_DIR = path.join(ROOT, "scripts", "da-pipeline");
export const DA_AUDIT_DIR = path.join(ROOT, "audit", "da");
export const DA_YEARS = [2024, 2025];
export const DA_PUBLISHED_YEARS = [2024, 2025, 2026];
export const DA_PAGE_COUNT = 13;

export const DA_SOURCE_URLS = Object.fromEntries(
  DA_YEARS.map((year) => [year, `https://practicepaper.in/gate-da/gate-da-${year}`])
);

export const DA_DATA_DIR = path.join(PUBLIC_DIR, "data", "da");
export const DA_BANK_PATH = path.join(DA_DATA_DIR, "questions-with-answers.json");
export const DA_ANSWER_KEYS_PATH = path.join(DA_PIPELINE_DIR, "da-answer-keys.json");

export function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

export function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function decodeHtmlEntities(value = "") {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export function cleanText(value = "") {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeHtmlFragment(value = "") {
  return decodeHtmlEntities(String(value || ""))
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function convertLatexTags(value = "") {
  return sanitizeHtmlFragment(value).replace(/\[latex\]([\s\S]*?)\[\/latex\]/gi, (_, body) => {
    const formula = String(body || "").trim();
    if (!formula) {
      return "";
    }
    const isDisplayFormula = /\\begin\{|\\displaystyle|\\matrix|\\array|\\aligned/i.test(formula);
    return `${isDisplayFormula ? "$$" : "$"}${formula}${isDisplayFormula ? "$$" : "$"}`;
  });
}

export function slugify(value = "") {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractFirstMatch(value, expression) {
  return String(value || "").match(expression)?.[1] || "";
}

export function extractAttribute(tag = "", attribute = "") {
  const expression = new RegExp(
    `\\b${attribute.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\s*=\\s*(["'])([\\s\\S]*?)\\1`,
    "i"
  );
  const quoted = String(tag || "").match(expression);
  if (quoted) {
    return quoted[2];
  }

  const unquoted = String(tag || "").match(
    new RegExp(`\\b${attribute}\\s*=\\s*([^\\s>]+)`, "i")
  );
  return unquoted?.[1] || "";
}

export function getQuestionUid(year, questionNumber) {
  return `pp:da:${year}:q${questionNumber}`;
}

export function getExamUid(year, questionNumber) {
  return `da:${year}:set1:main:q${questionNumber}`;
}

export function parseNumeric(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
  const number = Number(text);
  return Number.isFinite(number) ? number : text;
}

export function buildNatAnswer(value1, value2) {
  const lower = parseNumeric(value1);
  const upper = parseNumeric(value2);
  if (lower === null) {
    return { answer: null, tolerance: null };
  }
  if (String(value1).trim() === String(value2).trim() || upper === null) {
    return { answer: lower, tolerance: null };
  }
  return {
    answer: lower,
    tolerance: { lower, upper },
  };
}

export function answerKeyForQuestion(question) {
  const type = String(question?.type || "").trim().toUpperCase();
  if (type === "NAT") {
    return buildNatAnswer(question.natValue1, question.natValue2);
  }

  const answers = Array.isArray(question?.correctOptions)
    ? question.correctOptions.map((value) => String(value).trim().toUpperCase()).filter(Boolean)
    : [];
  return {
    answer: type === "MSQ" ? answers : answers[0] || null,
    tolerance: null,
  };
}

export function getMarksTag(marks) {
  const normalized = String(marks || "").trim();
  return normalized === "2" ? "two-marks" : "one-mark";
}

export function getQuestionTypeTag(type) {
  return String(type || "").trim().toLowerCase();
}
