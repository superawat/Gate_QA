#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import {
  DA_AUDIT_DIR,
  DA_BANK_PATH,
  DA_DATA_DIR,
  PUBLIC_DIR,
  ensureDir,
  readJson,
  sanitizeHtmlFragment,
  writeJson,
} from "./da-utils.mjs";
import { getDa2026GateOverflowLink } from "./da-2026-links.mjs";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "da_2026");
const TEX_PATH = path.join(SOURCE_DIR, "main.tex");
const STRUCTURED_QUESTIONS_PATH = path.join(SOURCE_DIR, "questions.json");
const ANSWER_PDF_PATH = path.join(SOURCE_DIR, "DA_Keys.pdf");
const ANSWER_KEYS_PATH = path.join(DA_AUDIT_DIR, "answer-keys-da-2026.json");
const NORMALISED_PATH = path.join(DA_AUDIT_DIR, "normalised-da-2026.json");
const ANSWER_REGISTRY_PATH = path.join(DA_DATA_DIR, "answers-by-question-uid-v1.json");
const IMAGE_DIR = path.join(PUBLIC_DIR, "question-images", "da");
const LOCAL_IMAGE_PREFIX = "/question-images/da";

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function imageName(sourceName) {
  return `${crypto.createHash("sha256").update(sourceName).digest("hex").slice(0, 20)}.webp`;
}

async function mirrorSourceImages() {
  ensureDir(IMAGE_DIR);
  const imageNames = new Set([...fs.readFileSync(TEX_PATH, "utf8").matchAll(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g)].map((match) => match[1]));
  const localBySource = new Map();
  const imageStats = [];

  for (const sourceName of [...imageNames].sort()) {
    const sourcePath = fs.existsSync(path.join(SOURCE_DIR, sourceName))
      ? path.join(SOURCE_DIR, sourceName)
      : path.join(SOURCE_DIR, path.basename(sourceName));
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing DA 2026 image referenced by LaTeX: ${sourceName}`);
    }
    const fileName = imageName(sourceName);
    const outputPath = path.join(IMAGE_DIR, fileName);
    let sourceBytes = fs.statSync(sourcePath).size;
    let outputBytes;
    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
      const input = fs.readFileSync(sourcePath);
      const image = sharp(input, { failOn: "warning" }).rotate();
      const output = await image.webp({ quality: 78, effort: 5 }).toBuffer();
      fs.writeFileSync(outputPath, output);
      outputBytes = output.byteLength;
    } else {
      outputBytes = fs.statSync(outputPath).size;
    }
    localBySource.set(sourceName.replaceAll("\\", "/"), `${LOCAL_IMAGE_PREFIX}/${fileName}`);
    imageStats.push({ source: sourceName, file: fileName, sourceBytes, outputBytes });
  }
  return { localBySource, imageStats };
}

function renderTable(tableBody) {
  const body = String(tableBody || "");
  const hasExplicitRowBreaks = /\\\\(?:\[[^\]]*\])?/.test(body);
  const rows = (hasExplicitRowBreaks
    ? body.replace(/\\\\(?:\[[^\]]*\])?/g, "__DA_ROW_BREAK__").replace(/\r?\n/g, " ").split("__DA_ROW_BREAK__")
    : [body.replace(/\s*\r?\n\s*/g, " ")])
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split("&").map((cell) => renderPlain(cell.trim())));
  return `<table class="da-latex-table"><tbody>${rows.map((cells) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function renderPlain(value) {
  const mathTokens = [];
  let text = String(value || "").replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g, (formula) => {
    const token = `__DA_MATH_${mathTokens.length}__`;
    mathTokens.push(formula);
    return token;
  })
    .replace(/\\ensuremath\{([^{}]*)\}/g, "$1")
    .replace(/\\textbf\{([^{}]*)\}/g, "$1")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\\underline\{([^{}]*)\}/g, "$1")
    .replace(/\\,/g, " ")
    .replace(/\\!/g, "")
    .replace(/\\#/g, "#")
    .replace(/\\_/g, "_")
    .replace(/\\%/g, "%")
    .replace(/\\&/g, "&")
    .replace(/\\bowtie/g, "⋈")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\in/g, "∈")
    .replace(/\\cap/g, "∩")
    .replace(/\\cup/g, "∪")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\Rightarrow/g, "⇒")
    .replace(/\\lor/g, "∨")
    .replace(/\\land/g, "∧")
    .replace(/\\neg/g, "¬")
    .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
    .replace(/\\[A-Za-z]+/g, "")
    .replace(/\\([{}])/g, "$1")
    .replace(/\\(?:par|smallskip|medskip|noindent)\b/g, "\n\n")
    .replace(/\\quad\b/g, " ")
    .replace(/\\small\b/g, "")
    .replace(/\\\\(?:\[[^\]]*\])?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  let html = escapeHtml(text).replace(/\n/g, "<br />");
  mathTokens.forEach((formula, index) => {
    html = html.replaceAll(`__DA_MATH_${index}__`, formula);
  });
  return html;
}

function readStructuredQuestions() {
  if (!fs.existsSync(STRUCTURED_QUESTIONS_PATH)) {
    throw new Error(`Expected structured DA 2026 questions: ${STRUCTURED_QUESTIONS_PATH}`);
  }
  const payload = readJson(STRUCTURED_QUESTIONS_PATH, null);
  const questions = Array.isArray(payload?.questions)
    ? payload.questions
    : Object.values(payload?.recordsByQuestionUid || {}).map((record) => {
      const canonicalSubject = record.subject || (record.tags || []).find((tag) => !["gateda-2026", "one-mark", "two-marks", "mcq", "msq", "nat"].includes(tag) && !tag.startsWith("question-"));
      return {
        number: Number(record.number || String(record.title || "").match(/Question\s*:\s*(\d+)/i)?.[1]),
        section: canonicalSubject || ((record.tags || []).includes("general-aptitude") ? "general-aptitude" : "data-science-and-artificial-intelligence"),
        subject: canonicalSubject,
        marks: Number(record.marks || ((record.tags || []).includes("two-marks") ? 2 : 1)),
        type: String(record.type || (record.tags || []).find((tag) => ["mcq", "msq", "nat"].includes(String(tag).toLowerCase())) || "mcq"),
        question_html: record.question || null,
        stem: record.stem || null,
        options: record.options || [],
      };
    });
  if (!Array.isArray(questions) || questions.length !== 65) {
    throw new Error(`Expected 65 structured DA 2026 questions in ${STRUCTURED_QUESTIONS_PATH}`);
  }
  const byNumber = new Map(questions.map((question) => [Number(question.number), question]));
  const expectedNumbers = Array.from({ length: 65 }, (_, index) => index + 1);
  if (expectedNumbers.some((number) => !byNumber.has(number))) {
    throw new Error("Structured DA 2026 questions must contain exactly question numbers 1..65");
  }
  return byNumber;
}

function sourceTextForStructuredFallback(value) {
  return renderPlain(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeQuestionType(value) {
  const type = String(value || "").toLowerCase();
  if (type.includes("numerical") || type === "nat") return "NAT";
  if (type.includes("select") || type === "msq") return "MSQ";
  return "MCQ";
}

function renderStructuredMath(number, value) {
  let text = String(value || "")
    .replace(/\\ensuremath\{([^{}]*)\}/g, "$1")
    .replace(/\\to\b/g, "→")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\sum\b/g, "∑")
    .replace(/\\in\b/g, "∈")
    .replace(/\\land\b/g, "∧")
    .replace(/\\exists\b/g, "∃")
    .replace(/\\times\b/g, "×")
    .replace(/\\theta\b/g, "θ")
    .replace(/\\pi\b/g, "π")
    .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
    .replace(/\\([{}])/g, "$1")
    .replace(/\\_/g, "_");
  if (number === 21) {
    text = text
      .replace(/M = \(cos θ [−-] sinθ\s+sinθ cos θ\)/, "M = $\\begin{bmatrix}\\cos θ - \\sin θ & \\sin θ \\\\ \\sin θ & \\cos θ\\end{bmatrix}$")
      .replace(/M2026/g, "$M^{2026}$")
      .replace(/M−1/g, "$M^{-1}$")
      .replace(/M-1/g, "$M^{-1}$")
      .replace(/M2/g, "$M^2$")
      .replace(/I2/g, "$I_2$");
  }
  if (number === 9) {
    text = text
      .replace(/\(PQ\)2 \+ \(RS\)2 = XYP/g, "$(PQ)^2 + (RS)^2 = XYP$")
      .replace(/XYP, with XYP/g, "$XYP$, with $XYP$");
  }
  if (number === 45) {
    text = text.replace(/L = lim\s+n→∞\s+∑ e[-−]nnk\s+k!\s+n\s+k=0/, "L = $\\lim_{n\\to\\infty}\\sum_{k=0}^{n} e^{-n}\\frac{n^k}{k!}$");
  }
  if (number === 55) {
    text = text
      .replace(/ypred = wTx/g, "$y_{\\mathrm{pred}} = w^T x$")
      .replace(/w, x ∈ R2/g, "$w, x \\in \\mathbb{R}^2$")
      .replace(/w =\s*\[[−-]3\.00, 4\.00\]T/g, "$w = [-3.00, 4.00]^T$")
      .replace(/x =\s*\[1\.00, 2\.00\]T/g, "$x = [1.00, 2.00]^T$")
      .replace(/x = \[x1, x2\]T/g, "$x = [x_1, x_2]^T$")
      .replace(/ytrue = x1 \+ x2/g, "$y_{\\mathrm{true}} = x_1 + x_2$");
  }
  if (number === 59) {
    text = text.replace(/\{t\|[\s\S]*?m\[S\]\s*>\s*1\)\}/, "$\\{t \\mid t \\in X \\land \\exists z \\in X(t[P] = z[P]) \\land \\exists m \\in Y(m[P] = t[P] \\land m[S] > 1)\\}$");
  }
  return text;
}

function renderStructuredTable(number, value) {
  const lines = String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const latexCell = (value) => String(value || "").replace(/([&_#%])/g, "\\$1");
  const renderRows = (headers, rows, groupHeaders = []) => {
    const groupCells = groupHeaders.length
      ? headers.map((_, index) => {
        const group = groupHeaders.find((entry) => index >= entry.start && index < entry.start + entry.colspan);
        return group && index === group.start ? `\\textbf{${latexCell(group.label)}}` : "";
      })
      : null;
    const allRows = [
      ...(groupCells ? [groupCells] : []),
      headers,
      ...rows,
    ];
    const columnSpec = `|${"c|".repeat(headers.length)}`;
    return `$$\\begin{array}{${columnSpec}}\\hline${allRows.map((row) => `${row.map(latexCell).join(" & ")} \\\\ \\hline`).join("")}\\end{array}$$`;
  };

  if (number === 23) {
    const rows = lines.filter((line) => /^T\d\s+–\s+.+\s+A\d\s+–\s+.+$/.test(line)).map((line) => {
      const match = line.match(/^(T\d\s+–\s+.+?)\s+(A\d\s+–\s+.+)$/);
      return match ? [match[1], match[2]] : null;
    }).filter(Boolean);
    if (rows.length === 4) return renderRows(["Task", "Algorithm"], rows);
  }

  if (number === 59) {
    const headerIndex = lines.indexOf("P Q R P S");
    const end = lines.findIndex((line, index) => index > headerIndex && line.startsWith("Consider that"));
    if (headerIndex >= 0) {
      const rows = lines.slice(headerIndex + 1, end >= 0 ? end : lines.length)
        .filter((line) => /^(?:P\d\s+Q\d\s+R\d\s+P\d\s+\d+|P\d\s+\d+)$/.test(line))
        .map((line) => {
          const cells = line.split(/\s+/);
          return cells.length === 2 ? ["", "", "", ...cells] : [...cells.slice(0, 3), ...cells.slice(3)];
        });
      return renderRows(["P", "Q", "R", "P", "S"], rows, [{ label: "X", start: 0, colspan: 3 }, { label: "Y", start: 3, colspan: 2 }]);
    }
  }

  return "";
}

function renderStructuredText(number, value) {
  const text = renderStructuredMath(number, value);
  const table = renderStructuredTable(number, value);
  if (!table) return renderFragment(text, new Map());
  const tableStart = number === 23 ? text.indexOf("Task Algorithm") : text.indexOf("X Y");
  const afterTable = number === 23 ? text.indexOf("Which of", tableStart) : text.indexOf("Consider that", tableStart);
  const before = tableStart >= 0 ? text.slice(0, tableStart) : text;
  const after = afterTable >= 0 ? text.slice(afterTable) : "";
  return `${renderFragment(before, new Map())}${table}${renderFragment(after, new Map())}`;
}

function stripParagraphWrappers(value) {
  return String(value || "")
    .replace(/<p>([\s\S]*?)<\/p>/gi, "$1")
    .replace(/<p><\/p>/gi, "");
}

function structuredQuestionHtml(record, block, localBySource) {
  if (record.question_html) {
    return { questionHtml: record.question_html, options: [] };
  }
  const bodyWithoutMarker = block.body.replace(/^\\textbf\{Q\.\d+\}\\quad\s*/, "");
  const optionMatches = parseOptions(block.body);
  const markerLength = block.body.length - bodyWithoutMarker.length;
  const firstOptionStart = optionMatches.length ? optionMatches[0].start - markerLength : bodyWithoutMarker.length;
  const sourceStem = bodyWithoutMarker
    .slice(0, firstOptionStart)
    .replace(/\\end\{examframe\}[\s\S]*$/, "")
    .trim();
  const sourceText = record.question_latex || record.question_text || sourceTextForStructuredFallback(sourceStem);
  const hasStructuredText = Boolean(record.question_latex || record.question_text);
  const hasSourceImages = /\\includegraphics(?:\[[^\]]*\])?\{[^}]+\}/.test(sourceStem);
  const stemHtml = !sourceText || hasSourceImages || (Array.isArray(record.assets) && record.assets.length)
    ? renderFragment(sourceStem, localBySource)
    : renderStructuredText(Number(record.number), sourceText);
  const options = Array.isArray(record.options) && record.options.length
    ? record.options.map((option) => ({
      label: String(option.label || "").trim().toUpperCase(),
      html: stripParagraphWrappers(renderStructuredText(Number(record.number), option.latex || option.text || "")),
    }))
    : optionMatches.map((option) => ({
      label: option.label,
      html: hasStructuredText
        ? renderFragment(option.raw.replace(/\\end\{examframe\}[\s\S]*$/, ""), localBySource)
        : stripParagraphWrappers(renderStructuredText(Number(record.number), sourceTextForStructuredFallback(option.raw.replace(/\\end\{examframe\}[\s\S]*$/, "")))),
    }));
  const optionList = options.length
    ? `<ol class="da-question-options" style="list-style-type: upper-alpha;">${options.map((option) => `<li data-option-label="${option.label}">${option.html}</li>`).join("")}</ol>`
    : "";
  return { questionHtml: `${stripParagraphWrappers(stemHtml)}${optionList}`, options };
}

function renderFragment(value, localBySource) {
  let fragment = String(value || "");
  const tokens = [];
  const addToken = (html) => {
    const token = `__DA_TOKEN_${tokens.length}__`;
    tokens.push(html);
    return token;
  };

  fragment = fragment.replace(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g, (_, sourceName) => {
    const normalized = sourceName.replaceAll("\\", "/");
    const localPath = localBySource.get(normalized);
    return addToken(localPath ? `<img src="${localPath}" alt="Question illustration" loading="lazy" />` : "[Image missing]");
  });
  fragment = fragment.replace(/\\begin\{tabular\}\{[^}]*\}([\s\S]*?)\\end\{tabular\}/g, (_, body) => addToken(renderTable(body)));
  fragment = fragment
    .replace(/\\begin\{(?:center|adjustbox|minipage|examframe|tcolorbox)\}/g, "")
    .replace(/\\end\{(?:center|adjustbox|minipage|examframe|tcolorbox)\}/g, "")
    .replace(/\\(?:par|smallskip|medskip|noindent)[A-Za-z]*/g, "\n\n")
    .replace(/\\quad\b/g, " ")
    .replace(/\\small\b/g, "");

  const paragraphs = fragment
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  let html = paragraphs
    .map((paragraph) => `<p>${renderPlain(paragraph)}</p>`)
    .join("");
  let previousHtml = "";
  while (html !== previousHtml) {
    previousHtml = html;
    tokens.forEach((tokenHtml, index) => {
      html = html.replaceAll(`__DA_TOKEN_${index}__`, tokenHtml);
    });
  }
  return html
    .replace(/<p>(<table\b[\s\S]*?<\/table>)<\/p>/gi, "$1")
    .replace(/<p>(<img\b[^>]*\/?>)<\/p>/gi, "$1")
    .replace(/<p><\/p>/gi, "");
}

function extractQuestionBlocks(tex) {
  const normalizedTex = String(tex || "").replace(/\\textbf\{Q\.\}\\quad\s*1\b/, "\\textbf{Q.1}\\quad");
  const markers = [...normalizedTex.matchAll(/\\textbf\{Q\.(\d+)\}/g)];
  return markers.map((marker, index) => ({
    number: Number(marker[1]),
    body: normalizedTex.slice(marker.index, markers[index + 1]?.index ?? normalizedTex.length),
  }));
}

function extractPaperStructure(tex) {
  const source = String(tex || "")
    .replace(/\\textbf\{Q\.\}\\quad\s*1\b/, "\\textbf{Q.1}\\quad");
  const sectionMarkers = [
    ...source.matchAll(/\\textbf\{\\underline\{([^{}]+)\}\}/g),
  ].map((match) => ({
    index: match.index,
    section: match[1].toLowerCase().includes("general aptitude")
      ? "general-aptitude"
      : "artificial-intelligence",
  }));
  const marksRanges = [
    ...source.matchAll(/Q\.(\d+)\s*[–-]\s*Q\.(\d+)\s+Carry\s+(ONE|TWO)\s+mark(?:s)?/gi),
  ].map((match) => ({
    start: Number(match[1]),
    end: Number(match[2]),
    marks: match[3].toUpperCase() === "TWO" ? 2 : 1,
  }));
  const questionMarkers = [...source.matchAll(/\\textbf\{Q\.(\d+)\}/g)];
  const sections = new Map();
  const marks = new Map();

  questionMarkers.forEach((marker) => {
    const number = Number(marker[1]);
    const sectionMarker = [...sectionMarkers]
      .filter((entry) => entry.index < marker.index)
      .at(-1);
    const markRange = marksRanges.find((entry) => number >= entry.start && number <= entry.end);
    sections.set(number, number <= 10 && sectionMarker?.section === "general-aptitude"
      ? sectionMarker.section
      : (number <= 10 ? "general-aptitude" : "artificial-intelligence"));
    if (markRange) marks.set(number, markRange.marks);
  });

  return { sections, marks };
}

function parseOptions(body) {
  const matches = [...body.matchAll(/\\par\\noindent\s*\(([A-D])\)\s*/g)];
  return matches.map((match, index) => ({
    label: match[1],
    start: match.index,
    raw: body.slice(match.index + match[0].length, matches[index + 1]?.index ?? body.search(/\\end\{examframe\}/)),
  }));
}

function buildQuestion(block, answerKey, localBySource, paperStructure = {}, structuredQuestion = null) {
  const structured = structuredQuestion ? structuredQuestionHtml(structuredQuestion, block, localBySource) : null;
  const optionMatches = parseOptions(block.body);
  const bodyWithoutMarker = block.body.replace(/^\\textbf\{Q\.\d+\}\\quad\s*/, "");
  const markerLength = block.body.length - bodyWithoutMarker.length;
  const firstOptionStart = optionMatches.length ? optionMatches[0].start - markerLength : bodyWithoutMarker.length;
  const stem = bodyWithoutMarker.slice(0, firstOptionStart).replace(/\\end\{examframe\}[\s\S]*$/, "").trim();
  const fallbackOptions = optionMatches.map((option) => ({
    label: option.label,
    html: renderFragment(option.raw.replace(/\\end\{examframe\}[\s\S]*$/, ""), localBySource),
  }));
  const options = structured?.options || fallbackOptions;
  const questionHtml = structured?.questionHtml || `${stripParagraphWrappers(renderFragment(stem, localBySource))}${options.length ? `<ol class="da-question-options" style="list-style-type: upper-alpha;">${options.map((option) => `<li data-option-label="${option.label}">${stripParagraphWrappers(option.html)}</li>`).join("")}</ol>` : ""}`;
  const questionUid = `da:2026:set1:main:q${block.number}`;
  const section = structuredQuestion?.subject
    || structuredQuestion?.section
    || paperStructure.sections?.get(block.number)
    || (answerKey.section === "GA" ? "general-aptitude" : "artificial-intelligence");
  const marks = Number(structuredQuestion?.marks || paperStructure.marks?.get(block.number) || answerKey.marks);
  const type = normalizeQuestionType(structuredQuestion?.type || answerKey.type);
  const tags = [
    "gateda-2026",
    section,
    marks === 2 ? "two-marks" : "one-mark",
    type.toLowerCase(),
    `question-${block.number}`,
  ];
  return {
    title: `GATE DA 2026 | Question: ${block.number}`,
    link: getDa2026GateOverflowLink(block.number),
    question: sanitizeHtmlFragment(questionHtml),
    tags,
    year: "gateda-2026",
    answer: null,
    question_uid: questionUid,
    answer_key: answerKey.answer,
    tolerance: answerKey.tolerance,
    type,
    marks,
    question_number: block.number,
    subject: section,
    options,
  };
}

async function main() {
  if (!fs.existsSync(TEX_PATH)) {
    throw new Error(`Expected the GATE DA 2026 LaTeX source: ${TEX_PATH}`);
  }
  if (fs.existsSync(ANSWER_PDF_PATH)) {
    const python = process.env.PYTHON || "python";
    execFileSync(python, [
      path.join(ROOT, "scripts", "da-pipeline", "extract-da-2026-answer-keys.py"),
      ANSWER_PDF_PATH,
      ANSWER_KEYS_PATH,
    ], { stdio: "inherit" });
  } else if (!fs.existsSync(ANSWER_KEYS_PATH)) {
    throw new Error(`Missing both the DA 2026 answer-key PDF and extracted audit: ${ANSWER_PDF_PATH}`);
  } else {
    console.log(`[import-da-2026] Reusing extracted answer-key audit because ${ANSWER_PDF_PATH} is absent`);
  }
  const answerKeys = readJson(ANSWER_KEYS_PATH, {});
  const structuredQuestions = readStructuredQuestions();
  const { localBySource, imageStats } = await mirrorSourceImages();
  const tex = fs.readFileSync(TEX_PATH, "utf8");
  const blocks = extractQuestionBlocks(tex);
  const paperStructure = extractPaperStructure(tex);
  if (blocks.length !== 65) throw new Error(`Expected 65 LaTeX questions, found ${blocks.length}`);

  const richQuestions = blocks.map((block) => {
    const answerKey = answerKeys[`da:2026:set1:main:q${block.number}`];
    if (!answerKey) throw new Error(`Missing answer key for Q${block.number}`);
    const structuredQuestion = structuredQuestions.get(block.number);
    if (!structuredQuestion) throw new Error(`Missing structured question record for Q${block.number}`);
    return buildQuestion(block, answerKey, localBySource, paperStructure, structuredQuestion);
  });
  writeJson(NORMALISED_PATH, {
    year: 2026,
    source_file: "da_2026/questions.json + da_2026/main.tex",
    answer_key_file: "da_2026/DA_Keys.pdf",
    imageStats,
    questions: richQuestions,
  });

  const existingQuestions = readJson(DA_BANK_PATH, []);
  const retained = Array.isArray(existingQuestions)
    ? existingQuestions.filter((question) => question?.year !== "gateda-2026")
    : [];
  const publicQuestions = richQuestions.map(({ question_uid, answer_key, tolerance, type, marks, question_number, subject, options, ...question }) => question);
  writeJson(DA_BANK_PATH, [...retained, ...publicQuestions]);

  const existingAnswerPayload = readJson(ANSWER_REGISTRY_PATH, {});
  const records = {
    ...(existingAnswerPayload?.records_by_question_uid || {}),
    ...Object.fromEntries(richQuestions.map((question) => [question.question_uid, {
      answer_uid: question.question_uid,
      type: question.type,
      answer: question.answer_key,
      tolerance: question.tolerance,
      source: {
        kind: "official-answer-key-pdf",
        source_url: "da_2026/DA_Keys.pdf",
        reference_link: null,
      },
    }])),
  };
  writeJson(ANSWER_REGISTRY_PATH, {
    version: "v1",
    generated_at: new Date().toISOString(),
    records_by_question_uid: records,
    stats: {
      total: Object.keys(records).length,
      answered: Object.values(records).filter((record) => record.answer !== null && record.answer !== undefined).length,
      years: new Set(Object.keys(records).map((uid) => uid.match(/^da:(\d{4})/)?.[1]).filter(Boolean)).size,
    },
  });
  console.log(`[import-da-2026] Imported ${richQuestions.length} questions, ${imageStats.length} optimized images, and ${richQuestions.length} answer keys`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(`[import-da-2026] ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}

export {
  buildQuestion,
  extractPaperStructure,
  extractQuestionBlocks,
  parseOptions,
  readStructuredQuestions,
  renderFragment,
  renderStructuredText,
};
