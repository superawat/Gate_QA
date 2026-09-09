import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_IT_DIR = path.join(ROOT, "data", "it");
const PUBLIC_IT_DIR = path.join(ROOT, "public", "data", "it");
const SHARDS_DIR = path.join(ROOT, "public", "question-detail-shards");

fs.mkdirSync(DATA_IT_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_IT_DIR, { recursive: true });

function parseQNum(title) {
  const m = title.match(/Question:\s*([0-9]+)(?:-?([a-z]))?/i);
  if (!m) return 9999;
  const base = parseInt(m[1], 10);
  const sub = m[2] ? (m[2].toLowerCase().charCodeAt(0) - 96) * 0.1 : 0;
  return base + sub;
}

function extractQuestionNumber(title) {
  const m = title.match(/Question:\s*([0-9]+(?:-?[a-z])?)/i);
  return m ? m[1] : null;
}

const years = [2004, 2005, 2006, 2007, 2008];
const allQuestions = [];
const answersByUid = {};
const summary = {};

for (const year of years) {
  const shardPath = path.join(SHARDS_DIR, `${year}-s0.json`);
  if (!fs.existsSync(shardPath)) {
    console.error(`Missing shard: ${shardPath}`);
    continue;
  }

  const shardData = JSON.parse(fs.readFileSync(shardPath, "utf8"));
  const records = Object.values(shardData.recordsByQuestionUid || {});

  const itRecords = records
    .filter((q) => {
      const title = q.title || "";
      const y = typeof q.year === "string" ? q.year : "";
      return title.includes("IT") || y.startsWith("gateit-");
    })
    .sort((a, b) => parseQNum(a.title || "") - parseQNum(b.title || ""));

  const normalizedItQuestions = itRecords.map((q) => {
    const qNum = extractQuestionNumber(q.title || "");
    const cleanAnswerMeta = q.answer_meta || {
      type: "MCQ",
      answer: null,
      tolerance: null,
      source: "unverified",
    };

    const record = {
      question_uid: q.question_uid,
      exam: "GATE",
      branch: "IT",
      year,
      paper: "IT",
      question_number: qNum,
      title: q.title,
      link: q.link,
      question: q.question,
      tags: q.tags || [],
      question_type: cleanAnswerMeta.type || "MCQ",
      answer_meta: cleanAnswerMeta,
      answer: cleanAnswerMeta.answer || null,
      paper_scope: "official_it",
      source_branch: "IT",
    };

    answersByUid[q.question_uid] = {
      question_uid: q.question_uid,
      year,
      question_number: qNum,
      type: cleanAnswerMeta.type || "MCQ",
      answer: cleanAnswerMeta.answer || null,
      tolerance: cleanAnswerMeta.tolerance || null,
      source: cleanAnswerMeta.source || "reference_key",
    };

    allQuestions.push(record);
    return record;
  });

  summary[year] = normalizedItQuestions.length;

  // Write yearly JSON to data/it/ and public/data/it/
  const yearlyJson = JSON.stringify(normalizedItQuestions, null, 2);
  fs.writeFileSync(path.join(DATA_IT_DIR, `gateit-${year}.json`), yearlyJson, "utf8");
  fs.writeFileSync(path.join(PUBLIC_IT_DIR, `gateit-${year}.json`), yearlyJson, "utf8");
}

// Write combined all-questions JSON
const allJson = JSON.stringify(allQuestions, null, 2);
fs.writeFileSync(path.join(DATA_IT_DIR, "gateit-all.json"), allJson, "utf8");
fs.writeFileSync(path.join(PUBLIC_IT_DIR, "gateit-all.json"), allJson, "utf8");

// Write answers dictionary
const answersJson = JSON.stringify(answersByUid, null, 2);
fs.writeFileSync(path.join(DATA_IT_DIR, "answers-gateit.json"), answersJson, "utf8");
fs.writeFileSync(path.join(PUBLIC_IT_DIR, "answers-gateit.json"), answersJson, "utf8");

console.log("Extraction complete!");
console.log("Summary by year:", summary);
console.log(`Total IT questions exported: ${allQuestions.length}`);
console.log(`Saved to ${DATA_IT_DIR} and ${PUBLIC_IT_DIR}`);
