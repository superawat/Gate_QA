#!/usr/bin/env node

import {
  DA_AUDIT_DIR,
  DA_PAGE_COUNT,
  DA_SOURCE_URLS,
  DA_YEARS,
  cleanText,
  ensureDir,
  extractAttribute,
  extractFirstMatch,
  writeJson,
} from "./da-utils.mjs";

const REQUEST_DELAY_MS = 1000;
const USER_AGENT = "GateQA-DA-Intake/1.0 (+https://gateqa.in)";

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function extractOptions(answerTableHtml) {
  return [...String(answerTableHtml || "").matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((match) => {
    const row = match[0];
    const label = cleanText(
      extractFirstMatch(row, /<div\s+[^>]*class\s*=\s*["']?option_index_number["']?[^>]*>([\s\S]*?)<\/div>/i)
    ).toUpperCase();
    const html = extractFirstMatch(
      row,
      /<div\s+[^>]*class\s*=\s*["']?option_data["']?[^>]*>([\s\S]*?)<\/div>/i
    ).trim();
    return {
      label,
      html,
      correct: /mtq_correct_marker/i.test(row) || /data-value\s*=\s*["']?1["']?/i.test(row),
    };
  }).filter((option) => option.label && option.html);
}

function extractSubjects(questionHtml) {
  const section = extractFirstMatch(
    questionHtml,
    /<div\s+[^>]*class\s*=\s*["']?year_sub_chap_link["']?[^>]*>([\s\S]*?)<\/div>/i
  );
  return [...String(section || "").matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      href: match[1],
      label: cleanText(match[2]),
    }))
    .filter((entry) => entry.label && /\/gate-da\//i.test(entry.href));
}

function extractReferenceLink(questionHtml) {
  return extractFirstMatch(
    questionHtml,
    /<a\b[^>]*href\s*=\s*["']([^"']*gateoverflow\.in[^"']*)["'][^>]*>/i
  );
}

function parseQuestionBlock(block, year, page, pageUrl) {
  const questionNumber = Number.parseInt(
    cleanText(extractFirstMatch(block, /<div\s+[^>]*class\s*=\s*["']?question_lable["']?[^>]*>([\s\S]*?)<\/div>/i)).match(/\d+/)?.[0] || "",
    10
  );
  if (!Number.isFinite(questionNumber)) {
    return null;
  }
  const typeLabels = [...String(block).matchAll(/<div\s+[^>]*class\s*=\s*["']?question_type_labal["']?[^>]*>([\s\S]*?)<\/div>/gi)]
    .map((match) => cleanText(match[1]));
  const type = String(typeLabels[0] || "").toUpperCase();
  const marks = typeLabels.join(" ").match(/(\d+)\s*Mark/i)?.[1] || "1";
  const questionHtml = extractFirstMatch(
    block,
    /<div\s+[^>]*class\s*=\s*["']?question_text["']?[^>]*>([\s\S]*?)<\/div>\s*(?:<table\s+[^>]*class\s*=\s*["']?answer_table|<div\s+[^>]*class\s*=\s*["']?numericans)/i
  ).trim();
  const answerTableHtml = extractFirstMatch(
    block,
    /<table\s+[^>]*class\s*=\s*["']?answer_table["']?[^>]*>([\s\S]*?)<\/table>/i
  );
  const natButton = String(block).match(/<input\b[^>]*class\s*=\s*["']?checkansbtn["']?[^>]*>/i)?.[0] || "";
  const subjects = extractSubjects(block);

  return {
    year,
    page,
    pageUrl,
    questionNumber,
    type,
    marks,
    questionHtml,
    options: extractOptions(answerTableHtml),
    correctOptions: extractOptions(answerTableHtml).filter((option) => option.correct).map((option) => option.label),
    natValue1: extractAttribute(natButton, "data-value1"),
    natValue2: extractAttribute(natButton, "data-value2"),
    natValue3: extractAttribute(natButton, "data-value3"),
    subjects,
    referenceLink: extractReferenceLink(block),
  };
}

function parsePage(html, year, page, pageUrl) {
  return String(html || "")
    .split(/<div\s+class\s*=\s*["']question["']\s*>/i)
    .slice(1)
    .map((block) => parseQuestionBlock(block, year, page, pageUrl))
    .filter(Boolean);
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status}).`);
  }
  return response.text();
}

async function scrapeYear(year) {
  const pages = [];
  for (let page = 1; page <= DA_PAGE_COUNT; page += 1) {
    const pageUrl = `${DA_SOURCE_URLS[year]}?page_no=${page}`;
    console.log(`[scrape-da] Fetching ${year} page ${page}/${DA_PAGE_COUNT}`);
    const html = await fetchPage(pageUrl);
    pages.push({ page, url: pageUrl, questions: parsePage(html, year, page, pageUrl) });
    if (page < DA_PAGE_COUNT) {
      await sleep(REQUEST_DELAY_MS);
    }
  }
  return { year, source: DA_SOURCE_URLS[year], pages };
}

async function main() {
  ensureDir(DA_AUDIT_DIR);
  for (const year of DA_YEARS) {
    const payload = await scrapeYear(year);
    writeJson(`${DA_AUDIT_DIR}/raw-practicepaper-da-${year}.json`, payload);
    const questionCount = payload.pages.reduce((count, page) => count + page.questions.length, 0);
    console.log(`[scrape-da] Wrote ${questionCount} raw questions for ${year}`);
  }
}

main().catch((error) => {
  console.error(`[scrape-da] ${error.stack || error.message}`);
  process.exitCode = 1;
});
