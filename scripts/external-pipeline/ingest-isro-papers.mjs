#!/usr/bin/env node

/**
 * scripts/external-pipeline/ingest-isro-papers.mjs
 *
 * Automated parser and pipeline for ISRO CS (Scientist/Engineer 'SC') papers.
 * Ingests all available papers (2007–2020) from PracticePaper / GateOverflow mirror,
 * normalizes MathJax LaTeX, downloads and mirrors images locally,
 * and outputs authoritative datasets to data/isro/ and public/data/isro/.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const DATA_ISRO_DIR = path.join(ROOT, "data", "isro");
const PUBLIC_DATA_ISRO_DIR = path.join(ROOT, "public", "data", "isro");
const ISRO_IMAGES_DIR = path.join(ROOT, "public", "question-images", "external", "isro");

const ISRO_YEARS = [2007, 2008, 2009, 2011, 2013, 2014, 2015, 2016, 2017, 2018, 2020];

const SUBJECT_MAP = {
  "computer-organization": { slug: "coa", label: "CO & Architecture" },
  "computer-architecture": { slug: "coa", label: "CO & Architecture" },
  "coa": { slug: "coa", label: "CO & Architecture" },
  "algorithms": { slug: "algorithms", label: "Algorithms" },
  "data-structures": { slug: "algorithms", label: "Algorithms" },
  "programming-and-data-structures": { slug: "algorithms", label: "Algorithms" },
  "c-programming": { slug: "algorithms", label: "Algorithms" },
  "operating-systems": { slug: "os", label: "Operating Systems" },
  "operating-system": { slug: "os", label: "Operating Systems" },
  "os": { slug: "os", label: "Operating Systems" },
  "database-management-systems": { slug: "dbms", label: "Databases" },
  "databases": { slug: "dbms", label: "Databases" },
  "dbms": { slug: "dbms", label: "Databases" },
  "theory-of-computation": { slug: "toc", label: "Theory of Computation" },
  "toc": { slug: "toc", label: "Theory of Computation" },
  "automata": { slug: "toc", label: "Theory of Computation" },
  "compiler-design": { slug: "compiler", label: "Compiler Design" },
  "compiler": { slug: "compiler", label: "Compiler Design" },
  "computer-networks": { slug: "cn", label: "Computer Networks" },
  "computer-network": { slug: "cn", label: "Computer Networks" },
  "cn": { slug: "cn", label: "Computer Networks" },
  "digital-logic": { slug: "digital-logic", label: "Digital Logic" },
  "digital-circuits": { slug: "digital-logic", label: "Digital Logic" },
  "discrete-mathematics": { slug: "discrete-math", label: "Discrete Mathematics" },
  "discrete-math": { slug: "discrete-math", label: "Discrete Mathematics" },
  "engineering-mathematics": { slug: "engg-math", label: "Engineering Mathematics" },
  "engg-math": { slug: "engg-math", label: "Engineering Mathematics" },
  "linear-algebra": { slug: "engg-math", label: "Engineering Mathematics" },
  "calculus": { slug: "engg-math", label: "Engineering Mathematics" },
  "probability": { slug: "engg-math", label: "Engineering Mathematics" },
  "general-aptitude": { slug: "general-aptitude", label: "General Aptitude" },
  "aptitude": { slug: "general-aptitude", label: "General Aptitude" },
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanHtml(raw = "") {
  return String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\[latex\]([\s\S]*?)\[\/latex\]/gi, (match, formula) => {
      const trimmed = formula.trim();
      return `$${trimmed}$`;
    })
    .trim();
}

function cleanOptionText(text = "") {
  return String(text || "")
    .replace(/^[A-D][.):\-]\s*/i, "")
    .replace(/\u00a0/g, " ")
    .trim();
}

async function mirrorImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return imageUrl;
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith("/question-images/")) return trimmed;
  if (trimmed.startsWith("data:image/")) return trimmed;

  try {
    let fullUrl = trimmed;
    if (trimmed.startsWith("//")) {
      fullUrl = `https:${trimmed}`;
    } else if (trimmed.startsWith("/")) {
      fullUrl = `https://practicepaper.in${trimmed}`;
    }

    const hash = crypto.createHash("sha256").update(fullUrl).digest("hex").slice(0, 16);
    const parsedUrl = new URL(fullUrl);
    const ext = path.extname(parsedUrl.pathname) || ".png";
    const localFileName = `isro_${hash}${ext}`;
    const localFilePath = path.join(ISRO_IMAGES_DIR, localFileName);
    const publicUrl = `/question-images/external/isro/${localFileName}`;

    if (!fs.existsSync(localFilePath)) {
      const res = await fetch(fullUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(localFilePath, buffer);
      } else {
        return trimmed;
      }
    }
    return publicUrl;
  } catch {
    return trimmed;
  }
}

async function processHtmlImages(html = "") {
  let processed = String(html || "");
  const imgMatches = [...processed.matchAll(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi)];
  for (const match of imgMatches) {
    const fullTag = match[0];
    const src = match[1];
    const localSrc = await mirrorImage(src);
    if (localSrc !== src) {
      const replacedTag = fullTag.replace(src, localSrc);
      processed = processed.replace(fullTag, replacedTag);
    }
  }
  return processed;
}

async function parseQuestionBlock(qBlock, year, defaultNum) {
  // 1. Question Number
  const labelMatch = qBlock.match(/<div class=['"]question_lable['"]>Question\s*(\d+)<\/div>/i);
  const qNum = labelMatch ? parseInt(labelMatch[1], 10) : defaultNum;

  // 2. GateOverflow Link & Post ID
  const goMatch = qBlock.match(/href=['"](https?:\/\/gateoverflow\.in\/(\d+)(?:\/([^'"]+))?)['"]/i);
  const goLink = goMatch ? goMatch[1] : `https://gateoverflow.in/`;
  const goId = goMatch ? parseInt(goMatch[2], 10) : null;

  // 3. Question Stem
  const textMatch = qBlock.match(/<div class=['"]question_text['"][^>]*>([\s\S]*?)<\/div>/i);
  let rawQuestionHtml = textMatch ? cleanHtml(textMatch[1]) : "";
  let questionHtml = await processHtmlImages(rawQuestionHtml);

  // 4. Options & Answers
  const options = [];
  const correctLabels = [];
  const rowMatches = [...qBlock.matchAll(/<tr[^>]*class=['"][^'"]*mtq_clickable[^'"]*['"][^>]*>([\s\S]*?)<\/tr>/gi)];

  for (const row of rowMatches) {
    const rowHtml = row[1];
    const labelM = rowHtml.match(/class=['"]option_index_number['"]>([A-D])<\/div>/i);
    const label = labelM ? labelM[1].toUpperCase() : null;

    const dataM = rowHtml.match(/class=['"]option_data['"]>([\s\S]*?)<\/div>/i);
    const rawOptText = dataM ? cleanHtml(dataM[1]) : "";
    const processedOptText = await processHtmlImages(rawOptText);
    const cleanedText = cleanOptionText(processedOptText);

    const isCorrect = /mtq_correct_marker/i.test(rowHtml) || /data-value=['"]?1['"]?/i.test(row[0]);
    if (isCorrect && label) {
      correctLabels.push(label);
    }

    if (label) {
      options.push({
        label,
        text: cleanedText,
        html: cleanedText,
      });
    }
  }

  // Answer resolution: single MCQ, multi-option MSQ, or check fallback data-ans
  let answer = null;
  let type = "MCQ";
  if (correctLabels.length === 1) {
    answer = correctLabels[0];
  } else if (correctLabels.length > 1) {
    answer = correctLabels;
    type = "MSQ";
  } else {
    // Fallback: search for checkansbtn data-ans attribute
    const btnAnsMatch = qBlock.match(/class=['"][^'"]*checkansbtn[^'"]*['"][^>]*data-ans=['"]([^'"]+)['"]/i);
    if (btnAnsMatch) {
      answer = btnAnsMatch[1].trim().toUpperCase();
    }
  }

  // 5. Subject & Topic / Subtopic
  const subjectLinks = [...qBlock.matchAll(/<a href=['"]https:\/\/practicepaper\.in\/gate-cse\/([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi)];
  let subjectSlug = "other";
  let subtopicSlug = "";

  if (subjectLinks.length > 0) {
    const rawSubSlug = subjectLinks[0][1].toLowerCase().trim();
    if (SUBJECT_MAP[rawSubSlug]) {
      subjectSlug = SUBJECT_MAP[rawSubSlug].slug;
    }
  }
  if (subjectLinks.length > 1) {
    subtopicSlug = subjectLinks[1][1].toLowerCase().trim();
  }

  return {
    question_uid: `isro:cs:${year}:q${qNum}`,
    exam_uid: `isro-${year}-q${qNum}`,
    title: `ISRO CS ${year} | Question ${qNum}`,
    link: goLink,
    gateoverflow_id: goId,
    exam: "ISRO",
    branch: "CSE",
    paper_scope: "external_exam",
    origin_branch: "CS",
    origin_year: year,
    origin_session: null,
    origin_paper: "CS",
    question: questionHtml,
    type,
    options,
    answer,
    marks: 3,
    negativeMarks: type === "MCQ" ? 1 : 0,
    subject: subjectSlug,
    subjectSlug,
    subtopic: subtopicSlug,
    tags: [
      "isro",
      "isro-cs",
      `isro-${year}`,
      subjectSlug,
      ...(subtopicSlug ? [subtopicSlug] : []),
    ],
    detailShardKey: `isro-${year}-s0`,
  };
}

async function ingestYear(year) {
  const baseUrl = `https://practicepaper.in/isro/isro-cse-${year}`;
  console.log(`\n========================================`);
  console.log(`[ISRO] Starting ingestion for year ${year}: ${baseUrl}`);
  console.log(`========================================`);

  const questions = [];
  let page = 1;

  while (true) {
    const pageUrl = page === 1 ? baseUrl : `${baseUrl}?page_no=${page}`;
    try {
      const res = await fetch(pageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!res.ok) {
        if (res.status === 404 && page > 1) break;
        console.warn(`  [Warning] HTTP ${res.status} on ${pageUrl}`);
        break;
      }

      const html = await res.text();
      const parts = html.split("<div class='question'>");
      const count = parts.length - 1;

      if (count === 0) {
        break;
      }

      for (let i = 1; i <= count; i++) {
        const defaultNum = (page - 1) * 5 + i;
        const qRecord = await parseQuestionBlock(parts[i], year, defaultNum);
        questions.push(qRecord);
      }

      process.stdout.write(`  Page ${page}: ${count} Qs (Total: ${questions.length})\r`);
      page += 1;

      // Small 100ms throttle between pages
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`\n  [Error] Failed page ${page}: ${err.message}`);
      break;
    }
  }

  // Deduplicate and sort by question number
  const uniqueMap = new Map();
  for (const q of questions) {
    uniqueMap.set(q.question_uid, q);
  }
  const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
    const numA = parseInt(a.question_uid.match(/:q(\d+)$/)?.[1] || "0", 10);
    const numB = parseInt(b.question_uid.match(/:q(\d+)$/)?.[1] || "0", 10);
    return numA - numB;
  });

  console.log(`\n  ✓ Year ${year} complete: ${sorted.length} unique questions.`);
  return sorted;
}

async function main() {
  ensureDir(DATA_ISRO_DIR);
  ensureDir(PUBLIC_DATA_ISRO_DIR);
  ensureDir(ISRO_IMAGES_DIR);

  const allQuestions = [];
  const answersMap = {};
  const yearSummary = {};

  for (const year of ISRO_YEARS) {
    const yearQuestions = await ingestYear(year);
    allQuestions.push(...yearQuestions);
    yearSummary[year] = yearQuestions.length;

    // Save individual year file in data/isro/ and public/data/isro/
    const yearJsonPath = path.join(DATA_ISRO_DIR, `isro-${year}.json`);
    const pubYearJsonPath = path.join(PUBLIC_DATA_ISRO_DIR, `isro-${year}.json`);
    fs.writeFileSync(yearJsonPath, JSON.stringify(yearQuestions, null, 2), "utf8");
    fs.writeFileSync(pubYearJsonPath, JSON.stringify(yearQuestions, null, 2), "utf8");

    // Populate answers
    for (const q of yearQuestions) {
      answersMap[q.question_uid] = {
        question_uid: q.question_uid,
        exam_uid: q.exam_uid,
        type: q.type,
        answer: q.answer,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        link: q.link,
      };
    }
  }

  // Save consolidated master dataset
  const allJsonPath = path.join(DATA_ISRO_DIR, "isro-all.json");
  const pubAllJsonPath = path.join(PUBLIC_DATA_ISRO_DIR, "isro-all.json");
  fs.writeFileSync(allJsonPath, JSON.stringify(allQuestions, null, 2), "utf8");
  fs.writeFileSync(pubAllJsonPath, JSON.stringify(allQuestions, null, 2), "utf8");

  // Save answers registry
  const answersJsonPath = path.join(DATA_ISRO_DIR, "answers-isro.json");
  const pubAnswersJsonPath = path.join(PUBLIC_DATA_ISRO_DIR, "answers-isro.json");
  const answersPayload = {
    exam: "ISRO",
    totalQuestions: allQuestions.length,
    generatedAt: new Date().toISOString(),
    records_by_question_uid: answersMap,
  };
  fs.writeFileSync(answersJsonPath, JSON.stringify(answersPayload, null, 2), "utf8");
  fs.writeFileSync(pubAnswersJsonPath, JSON.stringify(answersPayload, null, 2), "utf8");

  console.log(`\n========================================`);
  console.log(`🎯 INGESTION COMPLETE SUMMARY:`);
  console.log(`========================================`);
  console.log(`Total ISRO Questions Ingested: ${allQuestions.length}`);
  console.log(`Breakdown by Year:`, JSON.stringify(yearSummary, null, 2));
  console.log(`Artifacts saved to:`);
  console.log(`  - ${DATA_ISRO_DIR}/isro-*.json`);
  console.log(`  - ${DATA_ISRO_DIR}/isro-all.json`);
  console.log(`  - ${DATA_ISRO_DIR}/answers-isro.json`);
  console.log(`  - Mirrors copied to ${PUBLIC_DATA_ISRO_DIR}/`);

  // Remove scratch files
  const scratchDir = "C:/Users/himanshu/.gemini/antigravity-ide/brain/1ecf841b-3254-48e4-949f-5078e73cc855/scratch";
  if (fs.existsSync(scratchDir)) {
    console.log(`\nCleaning up intermediate scratch files...`);
    const files = fs.readdirSync(scratchDir);
    for (const f of files) {
      if (f.includes("isro")) {
        fs.unlinkSync(path.join(scratchDir, f));
        console.log(`  Deleted scratch file: ${f}`);
      }
    }
  }
}

main().catch(console.error);
