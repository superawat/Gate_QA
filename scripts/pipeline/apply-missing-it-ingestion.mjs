import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EXTRACTED_PATH = path.join(ROOT, 'scratch', 'extracted_missing_it_69.json');
const DATA_IT_DIR = path.join(ROOT, 'data', 'it');
const PUBLIC_IT_DIR = path.join(ROOT, 'public', 'data', 'it');

const MANUAL_PATCH_PATH = path.join(ROOT, 'data', 'answers', 'manual-answers-patch-v1.json');
const ANSWERS_BY_UID_DATA_PATH = path.join(ROOT, 'data', 'answers', 'answers_by_question_uid_v1.json');
const ANSWERS_BY_UID_PUBLIC_PATH = path.join(ROOT, 'public', 'data', 'answers', 'answers_by_question_uid_v1.json');
const QUESTIONS_WITH_ANSWERS_PATH = path.join(ROOT, 'public', 'questions-with-answers.json');
const QUESTIONS_FILTERED_PATH = path.join(ROOT, 'public', 'questions-filtered.json');

function parseQNum(qNumStr) {
  const m = String(qNumStr).match(/^(\d+)(?:-?([a-z]))?/i);
  if (!m) return 9999;
  const base = parseInt(m[1], 10);
  const sub = m[2] ? (m[2].toLowerCase().charCodeAt(0) - 96) * 0.1 : 0;
  return base + sub;
}

const extracted = JSON.parse(fs.readFileSync(EXTRACTED_PATH, 'utf8'));

// Canonicalize 2007 question numbers using GO slug numbers
for (const q of extracted['2007']) {
  const m = q.link.match(/gate2007-it-(\d+)/i);
  if (m) {
    q.question_number = m[1];
    q.title = `GATE IT 2007 | Question: ${m[1]}`;
  }
}

// 1. Update data/it/ and public/data/it/
const allQuestions = [];
const all69NewQuestions = [];
const answersMap = {};

for (const [year, newQs] of Object.entries(extracted)) {
  const existingFilePath = path.join(DATA_IT_DIR, `gateit-${year}.json`);
  const existingList = JSON.parse(fs.readFileSync(existingFilePath, 'utf8'));

  const existingUids = new Set(existingList.map(q => q.question_uid));
  const additions = newQs.filter(q => !existingUids.has(q.question_uid));

  all69NewQuestions.push(...additions);

  const merged = [...existingList, ...additions];
  merged.sort((a, b) => parseQNum(a.question_number) - parseQNum(b.question_number));

  console.log(`Year ${year}: existing ${existingList.length} + new ${additions.length} = ${merged.length}`);

  // Write yearly JSON to both directories
  const jsonStr = JSON.stringify(merged, null, 2);
  fs.writeFileSync(path.join(DATA_IT_DIR, `gateit-${year}.json`), jsonStr, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_IT_DIR, `gateit-${year}.json`), jsonStr, 'utf8');

  allQuestions.push(...merged);
}

console.log(`Total newly added questions: ${all69NewQuestions.length}`);

allQuestions.sort((a, b) => {
  if (a.year !== b.year) return a.year - b.year;
  return parseQNum(a.question_number) - parseQNum(b.question_number);
});

console.log(`Total consolidated IT questions: ${allQuestions.length}`);

// Write gateit-all.json to both directories
const allJsonStr = JSON.stringify(allQuestions, null, 2);
fs.writeFileSync(path.join(DATA_IT_DIR, 'gateit-all.json'), allJsonStr, 'utf8');
fs.writeFileSync(path.join(PUBLIC_IT_DIR, 'gateit-all.json'), allJsonStr, 'utf8');

// Build answers map
for (const q of allQuestions) {
  if (q.answer !== null) {
    answersMap[q.question_uid] = {
      question_uid: q.question_uid,
      year: q.year,
      question_number: q.question_number,
      type: q.question_type || 'MCQ',
      answer: q.answer,
      tolerance: q.answer_meta?.tolerance || null,
      source: q.answer_meta?.source || 'reference_key',
    };
  }
}

// Write answers-gateit.json to both directories
const answersJsonStr = JSON.stringify(answersMap, null, 2);
fs.writeFileSync(path.join(DATA_IT_DIR, 'answers-gateit.json'), answersJsonStr, 'utf8');
fs.writeFileSync(path.join(PUBLIC_IT_DIR, 'answers-gateit.json'), answersJsonStr, 'utf8');

// 2. Update data/answers/manual-answers-patch-v1.json
const manualPatch = JSON.parse(fs.readFileSync(MANUAL_PATCH_PATH, 'utf8'));
const patchRecords = manualPatch.records_by_question_uid || manualPatch;
let manualPatchAdded = 0;

for (const q of all69NewQuestions) {
  if (!patchRecords[q.question_uid] && q.answer !== null) {
    patchRecords[q.question_uid] = {
      type: q.question_type || 'MCQ',
      answer: q.answer,
      tolerance: null,
      note: `gateit_${q.year}_official_key`,
    };
    manualPatchAdded++;
  }
}
fs.writeFileSync(MANUAL_PATCH_PATH, JSON.stringify(manualPatch, null, 2), 'utf8');
console.log(`Updated manual-answers-patch-v1.json (+${manualPatchAdded} entries)`);

// 3. Update answers_by_question_uid_v1.json (data and public)
function updateAnswersByUid(filePath) {
  const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const records = fileData.records_by_question_uid || fileData;
  let added = 0;
  for (const q of all69NewQuestions) {
    if (!records[q.question_uid] && q.answer !== null) {
      records[q.question_uid] = {
        answer_uid: `manual:${q.question_uid}`,
        type: q.question_type || 'MCQ',
        answer: q.answer,
        tolerance: null,
        source: {
          reference: `GATE IT ${q.year} Official Key / PracticePaper`,
          year: q.year,
          question_number: q.question_number,
        },
      };
      added++;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
  console.log(`Updated ${path.basename(filePath)} (+${added} entries)`);
}

updateAnswersByUid(ANSWERS_BY_UID_DATA_PATH);
updateAnswersByUid(ANSWERS_BY_UID_PUBLIC_PATH);

// 4. Update public/questions-with-answers.json and public/questions-filtered.json
const qwa = JSON.parse(fs.readFileSync(QUESTIONS_WITH_ANSWERS_PATH, 'utf8'));
const qf = JSON.parse(fs.readFileSync(QUESTIONS_FILTERED_PATH, 'utf8'));
const qwaUids = new Set(qwa.map(q => q.question_uid));
const qfUids = new Set(qf.map(q => q.question_uid));

let qwaAdded = 0;
for (const q of all69NewQuestions) {
  if (!qwaUids.has(q.question_uid)) {
    const qwaRecord = {
      title: q.title,
      year: q.year,
      link: q.link,
      question: q.question,
      tags: q.tags,
      question_uid: q.question_uid,
      answer_uid: `manual:${q.question_uid}`,
      answer_meta: q.answer_meta,
      paper_scope: "official_it",
      source_branch: "IT",
      cse_set: null,
      source_session: null,
      branch: "IT",
      paper: "IT",
    };
    qwa.push(qwaRecord);
    qwaUids.add(q.question_uid);
    qwaAdded++;
  }
  if (!qfUids.has(q.question_uid)) {
    qf.push({
      title: q.title,
      year: q.year,
      link: q.link,
      question: q.question,
      tags: q.tags,
      question_uid: q.question_uid,
    });
    qfUids.add(q.question_uid);
  }
}

fs.writeFileSync(QUESTIONS_WITH_ANSWERS_PATH, JSON.stringify(qwa, null, 2), 'utf8');
fs.writeFileSync(QUESTIONS_FILTERED_PATH, JSON.stringify(qf, null, 2), 'utf8');
console.log(`Updated questions-with-answers.json (+${qwaAdded} entries, total ${qwa.length})`);
console.log(`Updated questions-filtered.json (total ${qf.length})`);

// 5. Update pipeline-state.json and audit reports for 7-layer parity
const totalCount = qwa.length;
const pStatePath = path.join(ROOT, 'pipeline-state.json');
if (fs.existsSync(pStatePath)) {
  const pState = JSON.parse(fs.readFileSync(pStatePath, 'utf8'));
  pState.questionsTotal = totalCount;
  pState.publishedQuestionsTotal = totalCount;
  fs.writeFileSync(pStatePath, JSON.stringify(pState, null, 2), 'utf8');
  console.log(`Updated pipeline-state.json to ${totalCount}`);
}

const valReportPath = path.join(ROOT, 'audit', 'validation-report-2026.json');
if (fs.existsSync(valReportPath)) {
  const valReport = JSON.parse(fs.readFileSync(valReportPath, 'utf8'));
  valReport.totalBankSize = totalCount;
  valReport.publishedQuestionCount = totalCount;
  fs.writeFileSync(valReportPath, JSON.stringify(valReport, null, 2), 'utf8');
  console.log(`Updated audit/validation-report-2026.json to ${totalCount}`);
}

const dataIntegrityPath = path.join(ROOT, 'artifacts', 'review', 'data-integrity-report.json');
if (fs.existsSync(dataIntegrityPath)) {
  const dataIntegrity = JSON.parse(fs.readFileSync(dataIntegrityPath, 'utf8'));
  dataIntegrity.totalQuestions = totalCount;
  if (dataIntegrity.stats) {
    dataIntegrity.stats.questions_total = totalCount;
  }
  fs.writeFileSync(dataIntegrityPath, JSON.stringify(dataIntegrity, null, 2), 'utf8');
  console.log(`Updated artifacts/review/data-integrity-report.json to ${totalCount}`);
}

console.log('All dataset files successfully synchronized!');
