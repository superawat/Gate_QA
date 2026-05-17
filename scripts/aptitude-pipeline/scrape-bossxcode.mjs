#!/usr/bin/env node

/**
 * Structured web ingestion for the standalone Aptitude bank.
 *
 * The source site is password-gated, so credentials are supplied only at run
 * time via BOSSXCODE_PASSWORD or BOSSXCODE_COOKIE. The script emits the same
 * parsed-questions.json shape consumed by build_aptitude_db.py.
 */

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { chromium, request as playwrightRequest } from "playwright";

const require = createRequire(import.meta.url);
const { TAXONOMY, SUBJECTS } = require("../qa/aptitude-taxonomy.js");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

const DEFAULT_BASE_URL = "https://pt.bossxcode.unaux.com/";
const DEFAULT_OUTPUT_PATH = path.join(ROOT, "artifacts", "aptitude-pipeline", "parsed-questions.json");
const DEFAULT_REPORT_PATH = path.join(ROOT, "artifacts", "review", "bossxcode-aptitude-import-report.json");
const DEFAULT_PROFILE_DIR = path.join(ROOT, "artifacts", "aptitude-pipeline", ".bossxcode-browser-profile");
const SOURCE_KIND = "bossxcode-web";
const OPTION_LABELS = ["A", "B", "C", "D"];

const QUESTION_KEYS = [
  "questionHtml",
  "question_html",
  "questionText",
  "question_text",
  "question",
  "ques",
  "stem",
  "prompt",
  "body",
  "description",
  "title",
];

const OPTION_KEYS = [
  "options",
  "option",
  "choices",
  "choice",
  "answers",
  "answerOptions",
  "answer_options",
  "mcqOptions",
  "mcq_options",
];

const ANSWER_KEYS = [
  "answer",
  "correctAnswer",
  "correct_answer",
  "correctOption",
  "correct_option",
  "correct",
  "ans",
  "key",
  "solution",
];

const SUBJECT_KEYS = ["subject", "section", "category", "categoryName", "category_name", "subjectName", "subject_name", "group"];
const SUBTOPIC_KEYS = ["subtopic", "topic", "topicName", "topic_name", "chapter", "chapterName", "chapter_name", "quiz", "quizName"];

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const MATHML_TAGS = new Set([
  "annotation",
  "math",
  "mfrac",
  "mi",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mroot",
  "mrow",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msubsup",
  "msup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
]);

const SKIP_LINK_RE = /\.(?:css|js|png|jpe?g|gif|webp|svg|ico|pdf|zip|rar|7z|mp4|mp3)(?:[?#]|$)/i;
const DISPLAY_FORBIDDEN_RE =
  /SSC|CGL|CHSL|MTS|CPO|Tier|Staff\s+Selection|Set\s+[A-D]|Q\s*\.\s*\d+\.|\[\[PAGE:|Direction\s*:-|General\s+Awareness/i;

const SUBTOPIC_ALIASES = new Map([
  ["active-and-passive", "Active Passive"],
  ["active-passive-voice", "Active Passive"],
  ["arrangement", "Sitting Arrangement"],
  ["arith-reasoning", "Arithmetic Reasoning"],
  ["arithmetic", "Arithmetic Reasoning"],
  ["blood-relations", "Blood Relation"],
  ["boats-and-streams", "Boat and Stream"],
  ["coding-decoding", "Coding - Decoding"],
  ["coding-and-decoding", "Coding - Decoding"],
  ["compound-interest-ci", "Compound Interest"],
  ["data-interpretation-di", "Data Interpretation"],
  ["direction-sense", "Directions"],
  ["directions-and-distance", "Directions"],
  ["hcf-lcm", "HCF and LCM"],
  ["hcf-and-lcm", "HCF and LCM"],
  ["height-distance", "Height and Distance"],
  ["heights-and-distances", "Height and Distance"],
  ["idioms-and-phrases", "Idioms"],
  ["mean-median-mode", "Mean, Median & Mode"],
  ["mixture-alligation", "Mixture and Alligation"],
  ["number-series", "Series"],
  ["one-word", "One Word Substitution"],
  ["one-word-substitutions", "One Word Substitution"],
  ["ordering-ranking", "Order and Ranking"],
  ["profit-loss", "Profit and Loss"],
  ["ratio-proportion", "Ratio and Proportion"],
  ["simple-interest-si", "Simple Interest"],
  ["speed-time-distance", "Time, Speed and Distance"],
  ["spotting-error", "Spot the Error"],
  ["statement-conclusion", "Statement And Conclusion"],
  ["statements-and-conclusions", "Statement And Conclusion"],
  ["time-and-work", "Work and Time"],
  ["time-speed-distance", "Time, Speed and Distance"],
  ["train", "Time, Speed and Distance"],
  ["trains", "Time, Speed and Distance"],
]);

function resolveRepoPath(value) {
  if (!value) return null;
  return path.isAbsolute(value) ? value : path.resolve(ROOT, value);
}

function readOption(argv, name, fallback = null) {
  const prefix = `--${name}=`;
  const inline = argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = argv.indexOf(`--${name}`);
  if (index >= 0 && argv[index + 1] && !argv[index + 1].startsWith("--")) {
    return argv[index + 1];
  }
  return fallback;
}

function readIntOption(argv, name, fallback) {
  const value = Number.parseInt(readOption(argv, name, String(fallback)), 10);
  return Number.isFinite(value) ? value : fallback;
}

function readListOption(argv, name, fallback = []) {
  const value = readOption(argv, name, "");
  if (!value) return fallback;
  return value
    .split(",")
    .map((entry) => compactText(entry))
    .filter(Boolean);
}

export function parseArgs(argv = process.argv.slice(2), env = process.env) {
  return {
    baseUrl: readOption(argv, "base-url", env.BOSSXCODE_BASE_URL || DEFAULT_BASE_URL),
    password: readOption(argv, "password", env.BOSSXCODE_PASSWORD || ""),
    cookie: readOption(argv, "cookie", env.BOSSXCODE_COOKIE || ""),
    inputPath: resolveRepoPath(readOption(argv, "input", "")),
    outputPath: resolveRepoPath(readOption(argv, "output", DEFAULT_OUTPUT_PATH)),
    reportPath: resolveRepoPath(readOption(argv, "report", DEFAULT_REPORT_PATH)),
    userDataDir: resolveRepoPath(readOption(argv, "user-data-dir", DEFAULT_PROFILE_DIR)),
    maxPages: Math.max(1, readIntOption(argv, "max-pages", 500)),
    maxPapers: Math.max(0, readIntOption(argv, "max-papers", 0)),
    concurrency: Math.max(1, readIntOption(argv, "concurrency", 1)),
    requestTimeoutMs: Math.max(5000, readIntOption(argv, "request-timeout", 60_000)),
    limit: Math.max(0, readIntOption(argv, "limit", 0)),
    delayMs: Math.max(0, readIntOption(argv, "delay", 250)),
    headless: !argv.includes("--headed"),
    channel: readOption(argv, "channel", env.PLAYWRIGHT_CHANNEL || ""),
    products: readListOption(argv, "products", (env.BOSSXCODE_PRODUCTS || "chapter-test").split(",").filter(Boolean)),
    testTypeIds: readListOption(argv, "test-type-ids", (env.BOSSXCODE_TEST_TYPE_IDS || "3").split(",").filter(Boolean)),
    legacyCrawl: argv.includes("--legacy-crawl"),
    resume: argv.includes("--resume"),
  };
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function compactText(value = "") {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u200b\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value = "") {
  return compactText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let sharedDom = null;
function getDocument() {
  if (!sharedDom) sharedDom = new JSDOM("<!doctype html><body></body>");
  return sharedDom.window.document;
}

function decodeHtml(value = "") {
  const doc = getDocument();
  doc.body.innerHTML = value;
  return doc.body.textContent || "";
}

function stripHtml(value = "") {
  const doc = getDocument();
  doc.body.innerHTML = value;
  doc.body.querySelectorAll("script,style,noscript").forEach((node) => node.remove());
  return compactText(doc.body.textContent || "");
}

function looksLikeHtml(value = "") {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function sanitizeNode(node, baseUrl) {
  if (node.nodeType === 3) {
    return escapeHtml(node.textContent || "");
  }
  if (node.nodeType !== 1) {
    return "";
  }

  const tagName = node.tagName.toLowerCase();
  const childHtml = Array.from(node.childNodes).map((child) => sanitizeNode(child, baseUrl)).join("");

  if (!ALLOWED_TAGS.has(tagName) && !MATHML_TAGS.has(tagName)) {
    return childHtml;
  }
  if (tagName === "br") {
    return "<br>";
  }

  const attrs = [];
  if (tagName === "a") {
    const href = node.getAttribute("href");
    if (href && /^https?:/i.test(new URL(href, baseUrl).href)) {
      attrs.push(`href="${escapeHtml(new URL(href, baseUrl).href)}"`);
    }
  }
  if (tagName === "img") {
    const src = node.getAttribute("src");
    if (src) {
      attrs.push(`src="${escapeHtml(new URL(src, baseUrl).href)}"`);
    }
    const alt = node.getAttribute("alt");
    if (alt) {
      attrs.push(`alt="${escapeHtml(compactText(alt))}"`);
    }
  }
  if (MATHML_TAGS.has(tagName)) {
    for (const name of ["display", "displaystyle", "mathvariant", "xmlns"]) {
      const value = node.getAttribute(name);
      if (value) {
        attrs.push(`${name}="${escapeHtml(compactText(value))}"`);
      }
    }
  }
  if (tagName === "ol") {
    attrs.push('style="list-style-type:upper-alpha"');
  }

  const attrText = attrs.length ? ` ${attrs.join(" ")}` : "";
  return `<${tagName}${attrText}>${childHtml}</${tagName}>`;
}

function sanitizeHtmlFragment(value = "", baseUrl = DEFAULT_BASE_URL) {
  if (!looksLikeHtml(value)) {
    return escapeHtml(compactText(decodeHtml(value)));
  }
  const doc = getDocument();
  doc.body.innerHTML = value;
  doc.querySelectorAll("script,style,noscript,iframe,form,button,input,select,textarea").forEach((node) => node.remove());
  return Array.from(doc.body.childNodes)
    .map((node) => sanitizeNode(node, baseUrl))
    .join("")
    .trim();
}

function stripOptionPrefix(value = "") {
  return compactText(value).replace(/^\(?\s*[A-Da-d]\s*\)?[\).:-]\s*/, "").trim();
}

function optionTextKey(value = "") {
  return stripOptionPrefix(stripHtml(value) || decodeHtml(value))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function stripEmbeddedOptionLists(rawHtml = "", options = []) {
  if (!looksLikeHtml(rawHtml)) {
    return rawHtml;
  }

  const optionKeys = new Set(options.map((option) => optionTextKey(option.html || option.text || option)).filter(Boolean));
  const doc = getDocument();
  doc.body.innerHTML = rawHtml;

  doc.querySelectorAll("ol, ul").forEach((list) => {
    const items = Array.from(list.children).filter((child) => child.tagName?.toLowerCase() === "li");
    if (items.length < 2 || items.length > 6) return;

    const itemKeys = items.map((item) => optionTextKey(item.innerHTML)).filter(Boolean);
    const allItemsMatchOptions = itemKeys.length >= 2 && itemKeys.every((key) => optionKeys.has(key));
    const alphaList = /upper-alpha|lower-alpha/i.test(list.getAttribute("style") || "") || /^[Aa]$/.test(list.getAttribute("type") || "");
    const isTrailingList = !list.nextElementSibling;
    if (allItemsMatchOptions || alphaList || isTrailingList) {
      list.remove();
    }
  });

  doc.querySelectorAll("p, div, li").forEach((block) => {
    const text = compactText(block.textContent || "");
    if (/^\(?\s*[A-Da-d]\s*\)?[\).:-]\s+/.test(text)) {
      block.remove();
    }
  });

  return doc.body.innerHTML.trim();
}

function stripQuestionNumberPrefix(rawValue = "") {
  const value = String(rawValue || "");
  if (!looksLikeHtml(value)) {
    return value.replace(/^\s*\d+\s*[\).]\s*/, "");
  }

  const doc = getDocument();
  doc.body.innerHTML = value;
  const walker = doc.createTreeWalker(doc.body, 4 /* SHOW_TEXT */);
  let textNode = walker.nextNode();
  while (textNode && !compactText(textNode.textContent || "")) {
    textNode = walker.nextNode();
  }
  if (textNode) {
    textNode.textContent = String(textNode.textContent || "").replace(/^(\s*)\d+\s*[\).]\s*/, "$1");
  }
  return doc.body.innerHTML.trim();
}

function ensureParagraphHtml(htmlValue = "") {
  const value = String(htmlValue || "").trim();
  if (!value) return "";
  if (/^<(?:p|div|table|blockquote|pre|ol|ul|img|br)\b/i.test(value)) {
    return value;
  }
  return `<p>${value}</p>`;
}

function optionListHtml(options = [], baseUrl = DEFAULT_BASE_URL) {
  const items = options
    .slice(0, 4)
    .map((option) => {
      const raw = option.html || option.text || option;
      const clean = sanitizeHtmlFragment(stripOptionPrefix(raw), baseUrl);
      return `<li>${clean}</li>`;
    })
    .join("");
  return `<ol style="list-style-type:upper-alpha">${items}</ol>`;
}

function buildQuestionHtml(questionValue, options, baseUrl) {
  const stripped = stripQuestionNumberPrefix(stripEmbeddedOptionLists(String(questionValue || ""), options));
  const stemHtml = ensureParagraphHtml(sanitizeHtmlFragment(stripped, baseUrl));
  const stemText = stripHtml(stemHtml);
  if (stemText.length < 5) return "";
  return `${stemHtml}\n${optionListHtml(options, baseUrl)}`;
}

function firstStringByKeys(object, keys) {
  if (!object || typeof object !== "object" || Array.isArray(object)) return "";
  for (const key of keys) {
    if (typeof object[key] === "string" && compactText(object[key])) {
      return object[key];
    }
  }
  return "";
}

function normalizeOptionEntry(entry, index = 0) {
  const label = OPTION_LABELS[index] || "";
  if (typeof entry === "string" || typeof entry === "number") {
    const raw = stripOptionPrefix(String(entry));
    const text = stripHtml(raw) || decodeHtml(raw);
    const html = looksLikeHtml(raw) ? sanitizeHtmlFragment(raw) : escapeHtml(text);
    return text ? { label, text, html, correct: false } : null;
  }
  if (!entry || typeof entry !== "object") return null;

  const rawLabel = firstStringByKeys(entry, ["label", "key", "option", "name"]) || label;
  const rawValue = firstStringByKeys(entry, ["html", "text", "value", "title", "answer", "content"]) || firstStringByKeys(entry, QUESTION_KEYS);
  const text = stripOptionPrefix(rawValue);
  if (!text) return null;

  return {
    label: /^[A-D]$/i.test(rawLabel) ? rawLabel.toUpperCase() : label,
    text: stripHtml(text) || decodeHtml(text),
    html: sanitizeHtmlFragment(text),
    correct: Boolean(entry.correct || entry.isCorrect || entry.is_answer || entry.isAnswer || entry.answer === true),
  };
}

function optionsFromObjectKeys(object) {
  const entries = [];
  for (const [index, label] of OPTION_LABELS.entries()) {
    const number = String(index + 1);
    const keys = [
      label,
      label.toLowerCase(),
      number,
      `option${label}`,
      `option_${label}`,
      `option${label.toLowerCase()}`,
      `option${number}`,
      `option_${number}`,
      `opt${label}`,
      `opt${number}`,
      `answer${number}`,
      `choice${label}`,
      `choice${number}`,
    ];
    const raw = firstStringByKeys(object, keys);
    if (raw) entries.push(normalizeOptionEntry(raw, entries.length));
  }
  return entries.filter(Boolean);
}

function normalizeOptions(value) {
  if (Array.isArray(value)) {
    return value.map((entry, index) => normalizeOptionEntry(entry, index)).filter(Boolean);
  }
  if (value && typeof value === "object") {
    const keyed = optionsFromObjectKeys(value);
    if (keyed.length >= 4) return keyed;
    return Object.values(value)
      .map((entry, index) => normalizeOptionEntry(entry, index))
      .filter(Boolean);
  }
  return [];
}

function findOptionsInCandidate(object) {
  if (!object || typeof object !== "object") return [];
  for (const key of OPTION_KEYS) {
    const options = normalizeOptions(object[key]);
    if (options.length >= 4) return options.slice(0, 4);
  }

  const keyed = optionsFromObjectKeys(object);
  return keyed.length >= 4 ? keyed.slice(0, 4) : [];
}

function optionLabelForValue(rawAnswer, options = []) {
  if (rawAnswer === null || rawAnswer === undefined) return "";
  if (Array.isArray(rawAnswer)) {
    return optionLabelForValue(rawAnswer[0], options);
  }
  if (typeof rawAnswer === "object") {
    return optionLabelForValue(
      firstStringByKeys(rawAnswer, ["label", "key", "option", "answer", "value", "text"]),
      options
    );
  }

  const value = compactText(String(rawAnswer)).replace(/^Option\s+/i, "");
  const direct = value.match(/^\(?\s*([A-Da-d])\s*\)?(?:[).:-])?$/);
  if (direct) return direct[1].toUpperCase();

  if (/^[1-4]$/.test(value)) {
    return OPTION_LABELS[Number(value) - 1];
  }
  if (/^[0-3]$/.test(value)) {
    return OPTION_LABELS[Number(value)];
  }

  const answerKey = optionTextKey(value);
  const match = options.find((option) => optionTextKey(option.html || option.text) === answerKey);
  return match?.label || "";
}

function findAnswerInCandidate(object, options = []) {
  for (const option of options) {
    if (option.correct) return option.label;
  }
  for (const key of ANSWER_KEYS) {
    const answer = optionLabelForValue(object?.[key], options);
    if (answer) return answer;
  }
  return "";
}

function normalizeTaxonomyLabel(subject, rawValue) {
  const taxonomy = TAXONOMY[subject] || [];
  const rawSlug = slugify(rawValue);
  if (!rawSlug) return "";

  const direct = taxonomy.find((label) => slugify(label) === rawSlug);
  if (direct) return direct;

  const alias = SUBTOPIC_ALIASES.get(rawSlug);
  if (alias && taxonomy.includes(alias)) return alias;

  const contains = taxonomy.find((label) => rawSlug.includes(slugify(label)) || slugify(label).includes(rawSlug));
  return contains || "";
}

function inferEnglishSubtopic(text) {
  if (/\b(?:spot.*error|error in|grammatical error|part.*error)\b/i.test(text)) return "Spot the Error";
  if (/\b(?:improve|sentence improvement|substitute|replace the highlighted|replace the underline)\b/i.test(text)) return "Sentence Improvement";
  if (/\b(?:direct speech|indirect speech|reported speech|narration|said to|he said|she said)\b/i.test(text)) return "Narration";
  if (/\b(?:active voice|passive voice|active\/passive|passive\/active)\b/i.test(text)) return "Active Passive";
  if (/\b(?:para jumble|rearrange|jumbled|proper sequence)\b/i.test(text)) return "Para Jumble";
  if (/\b(?:cloze)\b/i.test(text)) return "Cloze Test";
  if (/\b(?:passage|according to the passage|comprehension|central idea)\b/i.test(text)) return "Comprehension";
  if (/\b(?:one word|one-word|single word)\b/i.test(text)) return "One Word Substitution";
  if (/\b(?:idiom|phrase)\b/i.test(text)) return "Idioms";
  if (/\b(?:synonym|similar meaning)\b/i.test(text)) return "Synonyms";
  if (/\b(?:antonym|opposite meaning)\b/i.test(text)) return "Antonyms";
  if (/\b(?:spelling|misspelt|misspelled|spelt)\b/i.test(text)) return "Spelling Check";
  if (/\b(?:homonym|homophone)\b/i.test(text)) return "Homonyms";
  if (/\b(?:blank|fill)\b|_{2,}/i.test(text)) return "Fill in the Blanks";
  return "Miscellaneous";
}

function inferMathSubtopic(text) {
  if (/\b(?:hcf|lcm|highest common|least common)\b/i.test(text)) return "HCF and LCM";
  if (/\b(?:simplify|simplification|evaluate|surds?)\b/i.test(text)) return "Simplification";
  if (/\b(?:sin|cos|tan|cot|sec|cosec|trigonometry)\b/i.test(text)) return "Trigonometry";
  if (/\b(?:height|distance|elevation|depression|shadow)\b/i.test(text)) return "Height and Distance";
  if (/\b(?:volume|surface area|cuboid|cube|cylinder|cone|sphere|mensuration)\b/i.test(text)) return "Mensuration";
  if (/\b(?:coordinate|abscissa|ordinate|slope)\b/i.test(text)) return "Coordinate Geometry";
  if (/\b(?:probability|chance of|randomly)\b/i.test(text)) return "Probability";
  if (/\b(?:mean|median|mode)\b/i.test(text)) return "Mean, Median & Mode";
  if (/\baverage\b/i.test(text)) return "Average";
  if (/\b(?:data|table|chart|graph|pie chart|bar graph|line graph)\b/i.test(text)) return "Data Interpretation";
  if (/\b(?:partnership|partner|share of profit)\b/i.test(text)) return "Partnership";
  if (/\b(?:mixture|alligation|milk|water|solution)\b/i.test(text)) return "Mixture and Alligation";
  if (/\b(?:pipe|cistern|tank|inlet|outlet)\b/i.test(text)) return "Pipe and Cistern";
  if (/\b(?:boat|stream|upstream|downstream|current)\b/i.test(text)) return "Boat and Stream";
  if (/\b(?:race|track|lap)\b/i.test(text)) return "Linear/Circular Race";
  if (/\b(?:speed|train|journey|km\/h|time taken)\b/i.test(text)) return "Time, Speed and Distance";
  if (/\b(?:work|task|complete.*days|efficiency)\b/i.test(text)) return "Work and Time";
  if (/\b(?:ratio|proportion)\b/i.test(text)) return "Ratio and Proportion";
  if (/\b(?:profit|loss|marked price|cost price|selling price)\b/i.test(text)) return "Profit and Loss";
  if (/\bdiscount\b/i.test(text)) return "Discount";
  if (/\bcompound interest|compounded\b/i.test(text)) return "Compound Interest";
  if (/\bsimple interest\b/i.test(text)) return "Simple Interest";
  if (/\b(?:instalment|installment|emi)\b/i.test(text)) return "Installment";
  if (/\b(?:percent|percentage|per cent)\b|%/i.test(text)) return "Percentage";
  if (/\b(?:area|circle|triangle|geometry|diameter|radius|angle|perimeter)\b/i.test(text)) return "Geometry";
  if (/\b(?:equation|algebra|polynomial|\bx\b|\by\b|linear)\b/i.test(text)) return "Algebra";
  return "Number System";
}

function inferReasoningSubtopic(text) {
  if (/\b(?:coding|decoding|code language|coded as|written as)\b/i.test(text)) return "Coding - Decoding";
  if (/\b(?:odd|different|does not belong|out of the following)\b/i.test(text)) return "Odd one out";
  if (/\b(?:analogy|related word|similar relationship)\b/i.test(text)) return "Analogy";
  if (/\b(?:arrange.*(?:word|letter)|dictionary order|alphabetical order)\b/i.test(text)) return "Word Arrangement";
  if (/\baddresses?\b|house number|street|pin code/i.test(text)) return "Address";
  if (/\b(?:decision making|best course of action|what should you do)\b/i.test(text)) return "Decision Making";
  if (/\b(?:rank|ranking|position from|order.*top|order.*bottom)\b/i.test(text)) return "Order and Ranking";
  if (/\b(?:mathematical operation|interchange|operators?|symbols?)\b/i.test(text)) return "Mathematical Operations";
  if (/\b(?:father|mother|sister|brother|daughter|son|husband|wife|blood relation)\b/i.test(text)) return "Blood Relation";
  if (/\b(?:arithmetic reasoning|total number|how many|minimum number|maximum number)\b/i.test(text)) return "Arithmetic Reasoning";
  if (/\b(?:calendar|date|day of the week|leap year)\b/i.test(text)) return "Calendar";
  if (/\b(?:word formation|formed from|letters.*word|meaningful word)\b/i.test(text)) return "Word Formation";
  if (/\b(?:series|letter-cluster|number series|comes next|next term)\b/i.test(text)) return "Series";
  if (/\b(?:missing number|replace the question mark|missing term)\b/i.test(text)) return "Missing Number";
  if (/\b(?:statements?.*conclusions?|statement and conclusion)\b/i.test(text)) return "Statement And Conclusion";
  if (/\b(?:syllogism|all\s+\w+\s+are|some\s+\w+\s+are|no\s+\w+\s+(?:is|are))\b/i.test(text)) return "Syllogism";
  if (/\b(?:inequality|greater than|less than)\b|[<>]=?/i.test(text)) return "Inequality";
  if (/\b(?:direction|north|south|east|west|clockwise)\b/i.test(text)) return "Directions";
  if (/\b(?:sitting|seating|seated|circular arrangement|linear arrangement)\b/i.test(text)) return "Sitting Arrangement";
  if (/\b(?:puzzle|floor|persons?|people|boxes|days)\b/i.test(text)) return "Puzzle";
  return "Miscellaneous";
}

function inferSubject(text) {
  if (/\b(?:english|grammar|vocabulary|synonym|antonym|sentence|passage|idiom|spelling)\b/i.test(text)) {
    return "English";
  }
  if (/\b(?:math|quant|algebra|geometry|percentage|profit|loss|interest|ratio|speed|distance|average|number system|mensuration|trigonometry)\b/i.test(text)) {
    return "Mathematics";
  }
  if (/\b(?:reasoning|coding|decoding|analogy|syllogism|blood relation|ranking|directions|puzzle|series)\b/i.test(text)) {
    return "Reasoning";
  }
  return "";
}

function inferSubtopic(subject, text) {
  if (subject === "English") return inferEnglishSubtopic(text);
  if (subject === "Mathematics") return inferMathSubtopic(text);
  if (subject === "Reasoning") return inferReasoningSubtopic(text);
  return "";
}

function normalizeSubject(rawSubject, rawSubtopic, contextText) {
  const subjectText = compactText(rawSubject);
  const subjectSlug = slugify(subjectText);
  const direct = SUBJECTS.find((subject) => slugify(subject) === subjectSlug);
  if (direct) return direct;

  if (/english|verbal|grammar|vocab/i.test(subjectText)) return "English";
  if (/math|quant|numerical/i.test(subjectText)) return "Mathematics";
  if (/reasoning|logical|mental/i.test(subjectText)) return "Reasoning";

  const subtopicSlug = slugify(rawSubtopic);
  for (const subject of SUBJECTS) {
    if (normalizeTaxonomyLabel(subject, subtopicSlug)) return subject;
  }
  return inferSubject(`${rawSubject} ${rawSubtopic} ${contextText}`);
}

function normalizeSubtopic(subject, rawSubtopic, contextText) {
  const direct = normalizeTaxonomyLabel(subject, rawSubtopic);
  return direct || inferSubtopic(subject, `${rawSubtopic} ${contextText}`);
}

function stableSourceId(sourceUrl, questionHtml, options) {
  return createHash("sha1")
    .update(`${sourceUrl}\n${stripHtml(questionHtml)}\n${options.map((option) => stripHtml(option.html || option.text || option)).join("\n")}`)
    .digest("hex")
    .slice(0, 16);
}

function rowFromCandidate(candidate, sourceUrl, sequence) {
  const options = (candidate.options || []).slice(0, 4);
  if (options.length !== 4) return null;

  const answer = candidate.answer || "";
  if (!OPTION_LABELS.includes(answer)) return null;

  const questionHtml = buildQuestionHtml(candidate.question, options, sourceUrl);
  if (!questionHtml || DISPLAY_FORBIDDEN_RE.test(questionHtml)) return null;

  const contextText = [
    sourceUrl,
    stripHtml(questionHtml),
    options.map((option) => stripHtml(option.html || option.text || option)).join(" "),
  ].join(" ");
  const subject = normalizeSubject(candidate.subject, candidate.subtopic, contextText);
  if (!subject) return null;

  const subtopic = normalizeSubtopic(subject, candidate.subtopic, contextText);
  if (!subtopic || !TAXONOMY[subject]?.includes(subtopic)) return null;

  const sourceId = stableSourceId(sourceUrl, questionHtml, options);
  return {
    questionHtml,
    options: options.map((option) => sanitizeHtmlFragment(stripOptionPrefix(option.html || option.text), sourceUrl)),
    answer,
    type: "MCQ",
    subject,
    subtopic,
    year: null,
    _source: {
      sourceKind: SOURCE_KIND,
      examBody: "BossXCode",
      examName: "BossXCode",
      pageUrl: sourceUrl,
      sourceId,
      originalQNum: String(sequence),
      topic: subtopic,
    },
  };
}

function candidateFromObject(object, context = {}) {
  if (!object || typeof object !== "object" || Array.isArray(object)) return null;

  const question = firstStringByKeys(object, QUESTION_KEYS);
  if (!question) return null;

  const options = findOptionsInCandidate(object);
  if (options.length < 4) return null;

  const answer = findAnswerInCandidate(object, options);
  if (!answer) return null;

  return {
    question,
    options,
    answer,
    subject: firstStringByKeys(object, SUBJECT_KEYS) || context.subject || "",
    subtopic: firstStringByKeys(object, SUBTOPIC_KEYS) || context.subtopic || "",
  };
}

function collectJsonCandidates(value, candidates = [], seenObjects = new WeakSet(), context = {}) {
  if (!value || typeof value !== "object") return candidates;
  if (seenObjects.has(value)) return candidates;
  seenObjects.add(value);

  const nextContext = { ...context };
  const subjectName = firstStringByKeys(value, ["subject_name", "subjectName", "subject", "section_name", "sectionName"]);
  const topicName = firstStringByKeys(value, ["topic_name", "topicName", "topic", "chapter_name", "chapterName", "paper_title"]);
  if (subjectName) nextContext.subject = subjectName;
  if (topicName) nextContext.subtopic = topicName;
  if (Array.isArray(value.subjects)) {
    const nestedSubject = value.subjects.map((entry) => firstStringByKeys(entry, SUBJECT_KEYS)).find(Boolean);
    if (nestedSubject) nextContext.subject = nestedSubject;
  }

  const candidate = candidateFromObject(value, nextContext);
  if (candidate) candidates.push(candidate);

  if (Array.isArray(value)) {
    value.forEach((entry) => collectJsonCandidates(entry, candidates, seenObjects, nextContext));
    return candidates;
  }

  Object.values(value).forEach((entry) => collectJsonCandidates(entry, candidates, seenObjects, nextContext));
  return candidates;
}

function rowHash(row) {
  return createHash("sha1")
    .update(`${stripHtml(row.questionHtml).toLowerCase()}\n${row.answer}\n${row.options.map((o) => stripHtml(o.html || o.text || o)).join("\n").toLowerCase()}`)
    .digest("hex");
}

function dedupeRows(rows) {
  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    const key = rowHash(row);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }
  return deduped;
}

export function extractRowsFromPayload(payload, sourceUrl = DEFAULT_BASE_URL, context = {}) {
  const candidates = collectJsonCandidates(payload, [], new WeakSet(), context);
  return dedupeRows(
    candidates
      .map((candidate, index) => rowFromCandidate(candidate, sourceUrl, index + 1))
      .filter(Boolean)
  );
}

function parseJsonScript(scriptText) {
  const text = String(scriptText || "").trim();
  if (!text) return [];

  const attempts = [text];
  const assignmentMatch = text.match(/=\s*({[\s\S]*}|\[[\s\S]*])\s*;?\s*$/);
  if (assignmentMatch) attempts.push(assignmentMatch[1]);

  const assignmentRe = /(?:window\.)?[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\s*=\s*|(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*/g;
  let match;
  while ((match = assignmentRe.exec(text))) {
    const slice = jsonLiteralAt(text, assignmentRe.lastIndex);
    if (slice) attempts.push(slice);
  }

  const parsed = [];
  const seen = new Set();
  for (const attempt of attempts) {
    if (seen.has(attempt)) continue;
    seen.add(attempt);
    try {
      parsed.push(JSON.parse(attempt));
    } catch {
      // Keep trying other likely script payload shapes.
    }
  }
  return parsed;
}

function jsonLiteralAt(text, startIndex) {
  let index = startIndex;
  while (index < text.length && /\s/.test(text[index])) index += 1;
  const open = text[index];
  const closeFor = open === "{" ? "}" : open === "[" ? "]" : "";
  if (!closeFor) return "";

  const stack = [closeFor];
  let inString = false;
  let escaped = false;
  for (let cursor = index + 1; cursor < text.length; cursor += 1) {
    const char = text[cursor];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
      continue;
    }
    if (char === "}" || char === "]") {
      if (stack.pop() !== char) return "";
      if (stack.length === 0) {
        return text.slice(index, cursor + 1);
      }
    }
  }
  return "";
}

function optionElementsFromContainer(container) {
  const selector = [
    "[data-option]",
    "[data-choice]",
    ".option",
    ".choice",
    ".answer-option",
    ".answer",
    "label",
    "ol > li",
    "ul > li",
  ].join(",");

  const rawElements = Array.from(container.querySelectorAll(selector));
  const elements = rawElements.filter((element) => {
    const text = compactText(element.textContent || "");
    if (!text || text.length > 500) return false;
    if (/login|password|submit|unlock|next|previous/i.test(text)) return false;
    return true;
  });

  return elements.slice(0, 8);
}

function optionsFromDom(container) {
  const optionElements = optionElementsFromContainer(container);
  const options = optionElements
    .map((element, index) => ({
      label: element.getAttribute("data-label") || OPTION_LABELS[index] || "",
      html: stripOptionPrefix(element.innerHTML),
      text: stripOptionPrefix(element.textContent || ""),
      correct:
        /correct|right|true/i.test(element.className || "")
        || /^(1|true|yes)$/i.test(element.getAttribute("data-correct") || ""),
    }))
    .filter((option) => compactText(stripHtml(option.html || option.text)));

  return options.length >= 4 ? options.slice(0, 4) : [];
}

function answerFromDom(container, options = []) {
  const dataAnswer = container.getAttribute("data-answer")
    || container.getAttribute("data-correct")
    || container.querySelector("[data-answer]")?.getAttribute("data-answer")
    || container.querySelector("[data-correct]")?.getAttribute("data-correct");
  const direct = optionLabelForValue(dataAnswer, options);
  if (direct) return direct;

  const correctOption = options.find((option) => option.correct);
  if (correctOption) return correctOption.label;

  const text = compactText(container.textContent || "");
  const answerMatch = text.match(/\b(?:ans(?:wer)?|correct(?:\s+option)?)\s*[:.-]?\s*\(?\s*([A-Da-d])\s*\)?/);
  return answerMatch ? answerMatch[1].toUpperCase() : "";
}

function cloneQuestionStem(container) {
  const preferred = container.querySelector(
    "[data-question-text], [data-question], .question-text, .question-title, .question-stem, .ques, .qtext, .prompt"
  );
  const clone = (preferred || container).cloneNode(true);
  clone.querySelectorAll(
    "[data-option], [data-choice], .option, .choice, .answer-option, .answer, label, input, button, select, textarea, .solution, .explanation"
  ).forEach((node) => node.remove());
  return clone.innerHTML || clone.textContent || "";
}

function candidateFromDomContainer(container, sourceUrl) {
  const options = optionsFromDom(container);
  if (options.length < 4) return null;

  const answer = answerFromDom(container, options);
  if (!answer) return null;

  const subject = container.getAttribute("data-subject")
    || container.closest("[data-subject]")?.getAttribute("data-subject")
    || "";
  const subtopic = container.getAttribute("data-subtopic")
    || container.getAttribute("data-topic")
    || container.closest("[data-subtopic]")?.getAttribute("data-subtopic")
    || container.closest("[data-topic]")?.getAttribute("data-topic")
    || "";

  return {
    question: cloneQuestionStem(container),
    options,
    answer,
    subject,
    subtopic,
    sourceUrl,
  };
}

function domContainers(document) {
  const selectors = [
    "[data-question]",
    "[data-question-id]",
    ".question",
    ".question-card",
    ".quiz-question",
    ".quiz-card",
    ".question-box",
    ".mcq",
    "form",
  ];
  const seen = new Set();
  const containers = [];
  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((element) => {
      if (seen.has(element)) return;
      seen.add(element);
      containers.push(element);
    });
  }
  return containers;
}

export function extractRowsFromHtml(html, sourceUrl = DEFAULT_BASE_URL) {
  const dom = new JSDOM(html, { url: sourceUrl });
  try {
    const { document } = dom.window;
    const rows = [];
    const sourceContext = {
      subtopic: compactText(document.querySelector("title")?.textContent || ""),
    };

    document.querySelectorAll('script[type*="json"], script#__NEXT_DATA__').forEach((script) => {
      for (const payload of parseJsonScript(script.textContent || "")) {
        rows.push(...extractRowsFromPayload(payload, sourceUrl, sourceContext));
      }
    });

    document.querySelectorAll("script:not([src])").forEach((script) => {
      const text = script.textContent || "";
      if (!/(question|option|answer|correct)/i.test(text) || text.length > 2_000_000) return;
      for (const payload of parseJsonScript(text)) {
        rows.push(...extractRowsFromPayload(payload, sourceUrl, sourceContext));
      }
    });

    domContainers(document).forEach((container, index) => {
      const candidate = candidateFromDomContainer(container, sourceUrl);
      const row = candidate ? rowFromCandidate(candidate, sourceUrl, rows.length + index + 1) : null;
      if (row) rows.push(row);
    });

    return dedupeRows(rows);
  } finally {
    dom.window.close();
  }
}

function listInputFiles(inputPath) {
  if (!inputPath || !fs.existsSync(inputPath)) return [];
  const stat = fs.statSync(inputPath);
  if (stat.isFile()) return [inputPath];
  if (!stat.isDirectory()) return [];

  return fs.readdirSync(inputPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(inputPath, entry.name);
    if (entry.isDirectory()) return listInputFiles(entryPath);
    if (/\.(?:html?|json)$/i.test(entry.name)) return [entryPath];
    return [];
  });
}

function rowsFromInputPath(inputPath, baseUrl = DEFAULT_BASE_URL) {
  const files = listInputFiles(inputPath);
  const rows = [];
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    const sourceUrl = new URL(path.basename(filePath), baseUrl).href;
    if (/\.json$/i.test(filePath)) {
      rows.push(...extractRowsFromPayload(JSON.parse(content), sourceUrl));
    } else {
      rows.push(...extractRowsFromHtml(content, sourceUrl));
    }
  }
  return { rows: dedupeRows(rows), pagesVisited: files.length, responsePayloads: 0 };
}

async function pageLooksLocked(page) {
  const url = page.url();
  if (/\/login(?:[?#]|$)?/i.test(url)) return true;
  const text = await page.locator("body").innerText({ timeout: 3000 }).catch(() => "");
  return /Access Restricted|Unlock App|Please enter the password/i.test(text);
}

async function loginIfNeeded(page, options) {
  await page.goto(options.baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});

  if (!(await pageLooksLocked(page))) return;

  if (!options.password) {
    throw new Error(
      "BossXCode is password-gated. Set BOSSXCODE_PASSWORD, pass --password, or provide BOSSXCODE_COOKIE/--cookie."
    );
  }

  const loginUrl = new URL("/login", options.baseUrl).href;
  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.fill('input[name="password"], input[type="password"]', options.password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20_000 }).catch(() => {}),
    page.click('button[type="submit"], button'),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});

  if (await pageLooksLocked(page)) {
    throw new Error("BossXCode login failed or the supplied session cookie has expired.");
  }
}

function normalizeCrawlUrl(rawUrl, baseUrl) {
  let url;
  try {
    url = new URL(rawUrl, baseUrl);
  } catch {
    return "";
  }

  if (url.origin !== new URL(baseUrl).origin) return "";
  if (SKIP_LINK_RE.test(url.pathname)) return "";
  if (/logout|signout|delete|remove/i.test(url.pathname)) return "";
  url.hash = "";
  return url.href;
}

function entryKey(entry) {
  const params = new URLSearchParams(entry.form || {});
  params.sort();
  return `${entry.method || "GET"} ${entry.url} ${params.toString()}`;
}

function discoverNavigationEntries(html, currentUrl, baseUrl) {
  const dom = new JSDOM(html, { url: currentUrl });
  const { document } = dom.window;
  const entries = [];

  document.querySelectorAll("a[href]").forEach((anchor) => {
    const url = normalizeCrawlUrl(anchor.getAttribute("href"), baseUrl);
    if (url) entries.push({ method: "GET", url, form: null });
  });

  document.querySelectorAll("form").forEach((form) => {
    const action = normalizeCrawlUrl(form.getAttribute("action") || currentUrl, baseUrl);
    if (!action) return;

    const method = String(form.getAttribute("method") || "GET").trim().toUpperCase() === "POST"
      ? "POST"
      : "GET";
    const fields = {};
    form.querySelectorAll("input[name], select[name], textarea[name]").forEach((field) => {
      const name = field.getAttribute("name");
      if (!name) return;
      const type = String(field.getAttribute("type") || "").toLowerCase();
      if ((type === "checkbox" || type === "radio") && !field.hasAttribute("checked")) return;
      fields[name] = field.getAttribute("value") || field.textContent || "";
    });

    if (method === "GET") {
      const url = new URL(action);
      Object.entries(fields).forEach(([key, value]) => url.searchParams.set(key, value));
      entries.push({ method: "GET", url: url.href, form: null });
    } else {
      entries.push({ method: "POST", url: action, form: fields });
    }
  });

  const seen = new Set();
  return entries.filter((entry) => {
    const key = entryKey(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formFields(form) {
  const fields = {};
  form.querySelectorAll("input[name], select[name], textarea[name]").forEach((field) => {
    const name = field.getAttribute("name");
    if (!name) return;
    const type = String(field.getAttribute("type") || "").toLowerCase();
    if ((type === "checkbox" || type === "radio") && !field.hasAttribute("checked")) return;
    fields[name] = field.getAttribute("value") || field.textContent || "";
  });
  return fields;
}

function formChoices(html, currentUrl, baseUrl, actionPath, fieldName) {
  const dom = new JSDOM(html, { url: currentUrl });
  try {
    const { document } = dom.window;
    const choices = [];

    document.querySelectorAll("form").forEach((form, index) => {
      const action = normalizeCrawlUrl(form.getAttribute("action") || currentUrl, baseUrl);
      if (!action) return;
      if (new URL(action).pathname !== actionPath) return;

      const fields = formFields(form);
      if (!fields[fieldName]) return;

      choices.push({
        index,
        url: action,
        form: fields,
        fieldName,
        value: String(fields[fieldName]),
        title: compactText(form.textContent || form.getAttribute("aria-label") || fields[fieldName]),
      });
    });

    const seen = new Set();
    return choices.filter((choice) => {
      const key = `${choice.url} ${choice.fieldName} ${choice.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } finally {
    dom.window.close();
  }
}

function htmlLooksLocked(html = "") {
  return /Access Restricted|Unlock App|Please enter the password/i.test(stripHtml(html));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function titleFromPaperPack(paperPack = "") {
  const parts = String(paperPack || "").split("|").map((part) => compactText(part));
  return parts[5] || parts[0] || paperPack;
}

function paperSourceUrl(baseUrl, paperPack) {
  const url = new URL("/play", baseUrl);
  const paperHash = createHash("sha1").update(String(paperPack || "")).digest("hex").slice(0, 16);
  url.hash = `paper-${paperHash}`;
  return url.href;
}

function enrichRowsWithCatalogContext(rows, context) {
  const catalogId = createHash("sha1")
    .update([context.product, context.tier, context.testType, context.series, context.paper].join("\n"))
    .digest("hex")
    .slice(0, 16);
  return rows.map((row) => ({
    ...row,
    _source: {
      ...row._source,
      catalogId,
    },
  }));
}

function choiceMatchesAllowed(choice, allowedValues) {
  return allowedValues.includes("*") || allowedValues.includes(choice.value);
}

const RELEVANT_SERIES_RE = /\b(?:English|Reasoning|Quantitative|Quant|Math|Mathematics|Aptitude)\b/i;
const EXCLUDED_SERIES_RE = /\b(?:General\s+Awareness|General\s+Studies|General\s+Science|Current\s+Affairs|GK|GS|Hindi)\b/i;

function isRelevantSeries(choice) {
  const title = choice.title || "";
  if (EXCLUDED_SERIES_RE.test(title)) return false;
  return RELEVANT_SERIES_RE.test(title);
}

async function crawlBossXCodeCatalog(options) {
  fs.mkdirSync(options.userDataDir, { recursive: true });
  const launchOptions = {
    headless: options.headless,
    viewport: { width: 1440, height: 900 },
  };
  if (options.channel) {
    launchOptions.channel = options.channel;
  }

  const context = await chromium.launchPersistentContext(options.userDataDir, launchOptions);
  if (options.cookie) {
    await context.setExtraHTTPHeaders({ Cookie: options.cookie });
  }

  const page = context.pages()[0] || await context.newPage();
  const rows = [];
  const seenPaperPacks = new Set();
  const seenPaperUrls = new Set();
  const seriesJobs = [];
  let pagesVisited = 0;
  let papersVisited = 0;
  let papersScheduled = 0;
  let discoveredPapers = 0;
  let failedPapers = 0;
  let failedSeries = 0;
  let skippedSeries = 0;

  async function submitChoice(choice) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await context.request.post(choice.url, {
          form: choice.form || {},
          timeout: options.requestTimeoutMs,
        });
        const html = await response.text();
        pagesVisited += 1;
        if (!response.ok()) {
          throw new Error(`BossXCode request failed: ${response.status()} ${choice.url}`);
        }
        if (htmlLooksLocked(html)) {
          throw new Error(`BossXCode session became locked while submitting ${choice.url}`);
        }
        if (options.delayMs > 0) {
          await page.waitForTimeout(options.delayMs);
        }
        return { html, url: response.url() || choice.url };
      } catch (error) {
        if (attempt >= 3) throw error;
        console.warn(`[bossxcode] retry discovery ${attempt}/3 ${choice.url}: ${error.message}`);
        await sleep(1000 * attempt);
      }
    }
    throw new Error(`BossXCode request failed after retries: ${choice.url}`);
  }

  function shouldStop() {
    if (options.limit > 0 && dedupeRows(rows).length >= options.limit) return true;
    if (options.maxPapers > 0 && papersScheduled >= options.maxPapers) return true;
    return false;
  }

  function checkpoint() {
    const deduped = dedupeRows(rows);
    const limited = options.limit > 0 ? deduped.slice(0, options.limit) : deduped;
    writeJson(options.outputPath, limited);
    console.log(`[bossxcode] checkpoint saved ${limited.length} total rows`);
  }

  async function submitChoiceWithRequest(requestContext, choice) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await requestContext.post(choice.url, {
          form: choice.form || {},
          timeout: options.requestTimeoutMs,
        });
        const html = await response.text();
        pagesVisited += 1;
        if (!response.ok()) {
          throw new Error(`BossXCode request failed: ${response.status()} ${choice.url}`);
        }
        if (htmlLooksLocked(html)) {
          throw new Error(`BossXCode session became locked while submitting ${choice.url}`);
        }
        return { html, url: response.url() || choice.url };
      } catch (error) {
        if (attempt >= 3) throw error;
        console.warn(`[bossxcode] retry worker ${attempt}/3 ${choice.url}: ${error.message}`);
        await sleep(1000 * attempt);
      }
    }
    throw new Error(`BossXCode worker request failed after retries: ${choice.url}`);
  }

  async function createWorkerRequestContext() {
    const requestContext = await playwrightRequest.newContext({
      extraHTTPHeaders: options.cookie ? { Cookie: options.cookie } : undefined,
    });
    if (options.password) {
      const loginUrl = new URL("/login", options.baseUrl).href;
      const response = await requestContext.post(loginUrl, {
        form: { password: options.password },
        timeout: options.requestTimeoutMs,
      });
      const html = await response.text();
      if (!response.ok() || htmlLooksLocked(html)) {
        await requestContext.dispose();
        throw new Error("BossXCode worker login failed.");
      }
    }
    return requestContext;
  }

  async function scrapePaperChoice(paperChoice, contextInfo, submitter = submitChoice) {
    const playPage = await submitter(paperChoice);
    const paperTitle = titleFromPaperPack(paperChoice.value);
    const sourceUrl = paperSourceUrl(options.baseUrl, paperChoice.value);
    const extracted = extractRowsFromHtml(playPage.html, sourceUrl);
    if (extracted.length > 0) {
      rows.push(
        ...enrichRowsWithCatalogContext(extracted, {
          ...contextInfo,
          paper: paperTitle,
        })
      );
    }

    papersVisited += 1;
    const count = dedupeRows(rows).length;
    console.log(
      `[bossxcode] papers=${papersVisited}${options.maxPapers ? `/${options.maxPapers}` : ""} rows=${count} last="${paperTitle.slice(0, 80)}"`
    );
    if (papersVisited % 10 === 0) {
      checkpoint();
    }
  }

  async function scrapeSeriesJob(job, workerId) {
    const requestContext = await createWorkerRequestContext();
    try {
      const submitter = (choice) => submitChoiceWithRequest(requestContext, choice);
      await submitter(job.productChoice);
      await submitter(job.tierChoice);
      await submitter(job.testTypeChoice);
      await submitter(job.seriesChoice);

      console.log(`[bossxcode] worker=${workerId} series=${job.seriesChoice.value} queuedPapers=${job.paperChoices.length}`);
      for (const paperChoice of job.paperChoices) {
        if (shouldStop()) break;
        const sourceUrl = paperSourceUrl(options.baseUrl, paperChoice.value);
        if (seenPaperPacks.has(paperChoice.value) || seenPaperUrls.has(sourceUrl)) continue;
        seenPaperPacks.add(paperChoice.value);
        seenPaperUrls.add(sourceUrl);
        papersScheduled += 1;
        try {
          await scrapePaperChoice(
            paperChoice,
            {
              product: job.productChoice.title || job.productChoice.value,
              tier: job.tierChoice.title || job.tierChoice.value,
              testType: job.testTypeChoice.title || job.testTypeChoice.value,
              series: job.seriesChoice.title || job.seriesChoice.value,
            },
            submitter
          );
        } catch (error) {
          failedPapers += 1;
          console.warn(`[bossxcode] paper failed source=${sourceUrl}: ${error.message}`);
        }
      }
    } finally {
      await requestContext.dispose();
    }
  }

  async function scrapeSeriesJobWithRetry(job, workerId) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await scrapeSeriesJob(job, workerId);
        return;
      } catch (error) {
        if (attempt >= 3) {
          failedSeries += 1;
          console.warn(`[bossxcode] series failed worker=${workerId} series=${job.seriesChoice.value}: ${error.message}`);
          return;
        }
        console.warn(`[bossxcode] retry series worker=${workerId} attempt=${attempt}/3 series=${job.seriesChoice.value}: ${error.message}`);
        await sleep(1500 * attempt);
      }
    }
  }

  async function scrapeSeriesJobs() {
    let nextJob = 0;
    async function worker(workerId) {
      while (nextJob < seriesJobs.length && !shouldStop()) {
        const job = seriesJobs[nextJob];
        nextJob += 1;
        await scrapeSeriesJobWithRetry(job, workerId);
      }
    }

    const workerCount = Math.min(options.concurrency, Math.max(1, seriesJobs.length));
    await Promise.all(Array.from({ length: workerCount }, (_, index) => worker(index + 1)));
  }

  try {
    if (options.resume && fs.existsSync(options.outputPath)) {
      const existingRows = JSON.parse(fs.readFileSync(options.outputPath, "utf8"))
        .filter((row) => row?._source?.sourceKind === SOURCE_KIND);
      rows.push(...existingRows);
      existingRows.forEach((row) => {
        if (row?._source?.pageUrl) seenPaperUrls.add(row._source.pageUrl);
      });
      console.log(`[bossxcode] resume loaded ${existingRows.length} existing BossXCode rows`);
    }

    await loginIfNeeded(page, options);
    const homeHtml = await page.content();
    const homeUrl = page.url();
    pagesVisited += 1;

    let productChoices = formChoices(homeHtml, homeUrl, options.baseUrl, "/pick/product", "product_id");
    if (!options.products.includes("*")) {
      productChoices = productChoices.filter((choice) => choiceMatchesAllowed(choice, options.products));
    }
    if (productChoices.length === 0) {
      throw new Error(`No BossXCode products matched: ${options.products.join(", ")}`);
    }

    productLoop:
    for (const productChoice of productChoices) {
      const productPage = await submitChoice(productChoice);
      const tierChoices = formChoices(productPage.html, productPage.url, options.baseUrl, "/pick/tier", "tier_pack");
      console.log(`[bossxcode] product=${productChoice.value} tiers=${tierChoices.length}`);

      for (const tierChoice of tierChoices) {
        await submitChoice(productChoice);
        const tierPage = await submitChoice(tierChoice);
        let testTypeChoices = formChoices(tierPage.html, tierPage.url, options.baseUrl, "/pick/testtype", "exam_mode_id");
        if (!options.testTypeIds.includes("*")) {
          testTypeChoices = testTypeChoices.filter((choice) => choiceMatchesAllowed(choice, options.testTypeIds));
        }
        console.log(`[bossxcode] tier=${tierChoice.value} testTypes=${testTypeChoices.length}`);

        for (const testTypeChoice of testTypeChoices) {
          await submitChoice(productChoice);
          await submitChoice(tierChoice);
          const testTypePage = await submitChoice(testTypeChoice);
          const seriesChoices = formChoices(testTypePage.html, testTypePage.url, options.baseUrl, "/pick/series", "test_series_id");
          const relevantSeries = seriesChoices.filter(isRelevantSeries);
          skippedSeries += seriesChoices.length - relevantSeries.length;
          console.log(`[bossxcode] testType=${testTypeChoice.value} series=${relevantSeries.length}/${seriesChoices.length}`);

          for (const seriesChoice of relevantSeries) {
            await submitChoice(productChoice);
            await submitChoice(tierChoice);
            await submitChoice(testTypeChoice);
            const seriesPage = await submitChoice(seriesChoice);
            const paperChoices = formChoices(seriesPage.html, seriesPage.url, options.baseUrl, "/play", "paper_pack");
            console.log(`[bossxcode] series=${seriesChoice.value} papers=${paperChoices.length} title="${seriesChoice.title.slice(0, 90)}"`);
            const remaining = options.maxPapers > 0 ? options.maxPapers - discoveredPapers : paperChoices.length;
            const selectedPaperChoices = paperChoices.slice(0, Math.max(0, remaining));
            discoveredPapers += selectedPaperChoices.length;
            if (selectedPaperChoices.length > 0) {
              seriesJobs.push({ productChoice, tierChoice, testTypeChoice, seriesChoice, paperChoices: selectedPaperChoices });
            }
            if (options.maxPapers > 0 && discoveredPapers >= options.maxPapers) break productLoop;
          }
        }
      }
    }

    console.log(`[bossxcode] discovered seriesJobs=${seriesJobs.length} papers=${discoveredPapers || "all"}`);
    await context.close();
    await scrapeSeriesJobs();

    const deduped = dedupeRows(rows).slice(0, options.limit > 0 ? options.limit : undefined);
    return { rows: deduped, pagesVisited, responsePayloads: papersVisited, skippedSeries, failedPapers, failedSeries };
  } finally {
    await context.close().catch(() => {});
  }
}

async function crawlBossXCode(options) {
  fs.mkdirSync(options.userDataDir, { recursive: true });
  const launchOptions = {
    headless: options.headless,
    viewport: { width: 1440, height: 900 },
  };
  if (options.channel) {
    launchOptions.channel = options.channel;
  }

  const context = await chromium.launchPersistentContext(options.userDataDir, launchOptions);
  if (options.cookie) {
    await context.setExtraHTTPHeaders({ Cookie: options.cookie });
  }

  const page = context.pages()[0] || await context.newPage();
  const rows = [];
  let responsePayloads = 0;

  page.on("response", async (response) => {
    try {
      const contentType = response.headers()["content-type"] || "";
      const responseUrl = normalizeCrawlUrl(response.url(), options.baseUrl);
      if (!responseUrl || !/json/i.test(contentType) || !response.ok()) return;
      const payload = await response.json();
      const extracted = extractRowsFromPayload(payload, response.url());
      if (extracted.length > 0) {
        responsePayloads += 1;
        rows.push(...extracted);
      }
    } catch {
      // Ignore non-JSON or already-consumed responses.
    }
  });

  try {
    await loginIfNeeded(page, options);

    const queue = [{ method: "GET", url: normalizeCrawlUrl(options.baseUrl, options.baseUrl), form: null }];
    const visited = new Set();
    while (queue.length > 0 && visited.size < options.maxPages) {
      const currentEntry = queue.shift();
      if (!currentEntry?.url) continue;
      const currentKey = entryKey(currentEntry);
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);

      let finalUrl = currentEntry.url;
      let html = "";

      if (currentEntry.method === "POST") {
        const response = await context.request.post(currentEntry.url, {
          form: currentEntry.form || {},
          timeout: options.requestTimeoutMs,
        });
        finalUrl = response.url();
        html = await response.text();
      } else {
        await page.goto(currentEntry.url, { waitUntil: "domcontentloaded", timeout: 60_000 }).catch(() => {});
        await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
        if (options.delayMs > 0) {
          await page.waitForTimeout(options.delayMs);
        }
        if (await pageLooksLocked(page)) {
          throw new Error(`Session became locked while crawling ${currentEntry.url}`);
        }
        finalUrl = page.url();
        html = await page.content();
      }

      rows.push(...extractRowsFromHtml(html, finalUrl));

      for (const entry of discoverNavigationEntries(html, finalUrl, options.baseUrl)) {
        const key = entryKey(entry);
        if (!visited.has(key) && !queue.some((queued) => entryKey(queued) === key)) {
          queue.push(entry);
        }
      }

      const count = dedupeRows(rows).length;
      console.log(`[bossxcode] ${visited.size}/${options.maxPages} pages, ${count} candidate rows`);
      if (options.limit > 0 && count >= options.limit) break;
    }

    const deduped = dedupeRows(rows).slice(0, options.limit > 0 ? options.limit : undefined);
    return { rows: deduped, pagesVisited: visited.size, responsePayloads };
  } finally {
    await context.close();
  }
}

function summarizeRows(rows, meta) {
  const bySubject = {};
  const bySubtopic = {};
  for (const row of rows) {
    bySubject[row.subject] = (bySubject[row.subject] || 0) + 1;
    const key = `${row.subject} / ${row.subtopic}`;
    bySubtopic[key] = (bySubtopic[key] || 0) + 1;
  }
  return {
    version: 1,
    sourceKind: SOURCE_KIND,
    generatedAt: new Date().toISOString(),
    pagesVisited: meta.pagesVisited,
    responsePayloads: meta.responsePayloads,
    skippedSeries: meta.skippedSeries || 0,
    failedSeries: meta.failedSeries || 0,
    failedPapers: meta.failedPapers || 0,
    totalRows: rows.length,
    bySubject,
    bySubtopic,
    outputFile: path.relative(ROOT, meta.outputPath),
  };
}

async function main() {
  const options = parseArgs();
  console.log("[bossxcode] Structured Aptitude Web Import");
  console.log(`[bossxcode] Base:   ${options.baseUrl}`);
  console.log(`[bossxcode] Output: ${path.relative(ROOT, options.outputPath)}`);
  console.log(`[bossxcode] Report: ${path.relative(ROOT, options.reportPath)}`);
  console.log(`[bossxcode] Flow:   ${options.legacyCrawl ? "legacy-crawl" : "catalog"}`);
  if (!options.legacyCrawl) {
    console.log(`[bossxcode] Products: ${options.products.join(", ")}`);
    console.log(`[bossxcode] Test type ids: ${options.testTypeIds.join(", ")}`);
    console.log(`[bossxcode] Concurrency: ${options.concurrency}`);
    console.log(`[bossxcode] Request timeout: ${options.requestTimeoutMs}ms`);
  }

  const result = options.inputPath
    ? rowsFromInputPath(options.inputPath, options.baseUrl)
    : options.legacyCrawl
      ? await crawlBossXCode(options)
      : await crawlBossXCodeCatalog(options);

  if (result.rows.length === 0) {
    throw new Error("No structured aptitude questions were extracted.");
  }

  writeJson(options.outputPath, result.rows);
  const report = summarizeRows(result.rows, {
    ...result,
    outputPath: options.outputPath,
  });
  writeJson(options.reportPath, report);

  console.log(`[bossxcode] Wrote ${result.rows.length} parsed questions.`);
  console.log(`[bossxcode] ${path.relative(ROOT, options.outputPath)}`);
  console.log(`[bossxcode] ${path.relative(ROOT, options.reportPath)}`);
  console.log("[bossxcode] Next: python scripts/aptitude-pipeline/build_aptitude_db.py");
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(`[bossxcode] ${error.stack || error.message}`);
    process.exit(1);
  });
}
