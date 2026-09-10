const fs = require('fs');
const path = require('path');

// 1. Load primary datasets
const questionsWithAns = JSON.parse(fs.readFileSync('public/questions-with-answers.json', 'utf8'));
const questionsFiltered = JSON.parse(fs.readFileSync('public/questions-filtered.json', 'utf8'));
const builtMissing = JSON.parse(fs.readFileSync('scratch/built_missing_1988_1987.json', 'utf8'));

console.log(`Initial questions-with-answers count: ${questionsWithAns.length}`);
console.log(`Initial questions-filtered count: ${questionsFiltered.length}`);

// 2. Year Normalization: 'gate1988' -> 1988, 'gate1987' -> 1987
let normalizedYearsCount = 0;
for (const q of questionsWithAns) {
  if (q.year === 'gate1988') {
    q.year = 1988;
    normalizedYearsCount++;
  } else if (q.year === 'gate1987') {
    q.year = 1987;
    normalizedYearsCount++;
  }
}
for (const q of questionsFiltered) {
  if (q.year === 'gate1988') {
    q.year = 1988;
  } else if (q.year === 'gate1987') {
    q.year = 1987;
  }
}
console.log(`Normalized legacy years for ${normalizedYearsCount} questions in questions-with-answers.`);

// 3. Corrections / Updates for existing questions
// go:91338 -> Subjective (fill in the blank "less", no options)
const q91338 = questionsWithAns.find(q => q.question_uid === 'go:91338');
if (q91338) {
  delete q91338.answer_uid;
  q91338.answer_meta = {
    type: 'SUBJECTIVE',
    answer: null,
    tolerance: null,
    source: 'manual_resolution'
  };
  q91338.answer = null;
  q91338.type = 'SUBJECTIVE';
}

const f91338 = questionsFiltered.find(q => q.question_uid === 'go:91338');
if (f91338) {
  delete f91338.answer_uid;
  f91338.answer_meta = {
    type: 'SUBJECTIVE',
    answer: null,
    tolerance: null,
    source: 'manual_resolution'
  };
}

// go:80377 -> MCQ C
const q80377 = questionsWithAns.find(q => q.question_uid === 'go:80377');
if (q80377) {
  q80377.answer_meta = {
    type: 'MCQ',
    answer: 'C',
    tolerance: null,
    source: 'manual_resolution'
  };
  q80377.answer = 'C';
  q80377.type = 'MCQ';
}

// go:80559 -> MCQ B
const q80559 = questionsWithAns.find(q => q.question_uid === 'go:80559');
if (q80559) {
  q80559.answer_meta = {
    type: 'MCQ',
    answer: 'B',
    tolerance: null,
    source: 'manual_resolution'
  };
  q80559.answer = 'B';
  q80559.type = 'MCQ';
}

console.log('Applied updates for go:91338, go:80377, and go:80559.');

// 4. Ingest missing questions
const existingUids = new Set(questionsWithAns.map(q => q.question_uid));
let ingestedCount = 0;

for (const newQ of builtMissing) {
  if (!existingUids.has(newQ.question_uid)) {
    questionsWithAns.push(newQ);
    questionsFiltered.push({
      title: newQ.title,
      year: newQ.year,
      link: newQ.link,
      question: newQ.question,
      tags: newQ.tags
    });
    existingUids.add(newQ.question_uid);
    ingestedCount++;
  }
}
console.log(`Ingested ${ingestedCount} missing questions. New bank total: ${questionsWithAns.length}`);

// 5. Update answer registries
const manualPatch = JSON.parse(fs.readFileSync('data/answers/manual-answers-patch-v1.json', 'utf8'));
const answersByQ1 = JSON.parse(fs.readFileSync('data/answers/answers_by_question_uid_v1.json', 'utf8'));
const answersByQ2 = JSON.parse(fs.readFileSync('public/data/answers/answers_by_question_uid_v1.json', 'utf8'));
const answersByExam = JSON.parse(fs.readFileSync('public/data/answers/answers_by_exam_uid_v1.json', 'utf8'));

if (!manualPatch.records_by_question_uid) manualPatch.records_by_question_uid = {};
if (!answersByQ1.records_by_question_uid) answersByQ1.records_by_question_uid = {};
if (!answersByQ2.records_by_question_uid) answersByQ2.records_by_question_uid = {};
if (!answersByExam.records_by_exam_uid) answersByExam.records_by_exam_uid = {};

// Register 1988 entries
manualPatch.records_by_question_uid['go:91338'] = {
  type: 'SUBJECTIVE',
  answer: null,
  marks: 1,
  negative_marks: 0,
  official_status: 'community_consensus'
};
manualPatch.records_by_question_uid['go:91687'] = {
  type: 'NAT',
  answer: 12,
  tolerance: { abs: 0.01 },
  marks: 2,
  negative_marks: 0,
  official_status: 'community_consensus'
};
manualPatch.records_by_question_uid['go:94333'] = {
  type: 'NAT',
  answer: 10,
  tolerance: { abs: 0.01 },
  marks: 2,
  negative_marks: 0,
  official_status: 'community_consensus'
};

const ansRec91338 = {
  answer_uid: 'manual_res:go:91338',
  type: 'SUBJECTIVE',
  answer: null,
  tolerance: null,
  source: {
    kind: 'manual_verified',
    note: 'dec_102:batch_1988_1987_audit:1988'
  },
  is_manual_resolution: true
};
answersByQ1.records_by_question_uid['go:91338'] = ansRec91338;
answersByQ2.records_by_question_uid['go:91338'] = ansRec91338;
answersByExam.records_by_exam_uid['cse:1988:set1:main:q1iii'] = ansRec91338;

// Register missing 1987 questions
const missing1987Data = [
  { uid: 'go:82656', exam_uid: 'cse:1987:set1:main:q15', type: 'MCQ', answer: 'D', marks: 1, neg: 0.33 },
  { uid: 'go:80278', exam_uid: 'cse:1987:set1:main:q1-ix', type: 'MCQ', answer: 'B', marks: 1, neg: 0.33 },
  { uid: 'go:80281', exam_uid: 'cse:1987:set1:main:q1-x', type: 'MCQ', answer: 'C', marks: 1, neg: 0.33 },
  { uid: 'go:166', exam_uid: 'cse:1987:set1:main:q1-vi', type: 'MCQ', answer: 'B', marks: 1, neg: 0.33 }
];

for (const item of missing1987Data) {
  manualPatch.records_by_question_uid[item.uid] = {
    type: item.type,
    answer: item.answer,
    marks: item.marks,
    negative_marks: item.neg,
    official_status: 'community_consensus'
  };
  const record = {
    answer_uid: `manual_res:${item.uid}`,
    type: item.type,
    answer: item.answer,
    tolerance: null,
    source: {
      kind: 'manual_verified',
      note: 'dec_102:batch_1988_1987_audit:1987'
    },
    is_manual_resolution: true
  };
  answersByQ1.records_by_question_uid[item.uid] = record;
  answersByQ2.records_by_question_uid[item.uid] = record;
  answersByExam.records_by_exam_uid[item.exam_uid] = record;
}

// Backfill missing 1987 exam_uids
const existing1987Backfills = [
  { uid: 'go:80029', exam_uid: 'cse:1987:set1:main:q1-i', type: 'MCQ', answer: 'A' },
  { uid: 'go:80377', exam_uid: 'cse:1987:set1:main:q1-xxi', type: 'MCQ', answer: 'C' },
  { uid: 'go:80559', exam_uid: 'cse:1987:set1:main:q1-xxiv', type: 'MCQ', answer: 'B' },
  { uid: 'go:80562', exam_uid: 'cse:1987:set1:main:q1-xxv', type: 'MCQ', answer: 'D' },
  { uid: 'go:82548', exam_uid: 'cse:1987:set1:main:q11a', type: 'NAT', answer: 2.4785971428571423 },
  { uid: 'go:82550', exam_uid: 'cse:1987:set1:main:q11b', type: 'NAT', answer: 0.693 }
];

for (const item of existing1987Backfills) {
  if (!answersByExam.records_by_exam_uid[item.exam_uid]) {
    answersByExam.records_by_exam_uid[item.exam_uid] = {
      answer_uid: `manual_res:${item.uid}`,
      type: item.type,
      answer: item.answer,
      tolerance: item.type === 'NAT' ? { abs: 0.01 } : null,
      source: {
        kind: 'manual_verified',
        note: 'dec_102:batch_1988_1987_audit:1987'
      },
      is_manual_resolution: true
    };
  }
}

// Write back datasets
fs.writeFileSync('public/questions-with-answers.json', JSON.stringify(questionsWithAns, null, 2));
fs.writeFileSync('public/questions-filtered.json', JSON.stringify(questionsFiltered, null, 2));
fs.writeFileSync('data/answers/manual-answers-patch-v1.json', JSON.stringify(manualPatch, null, 2));
fs.writeFileSync('data/answers/answers_by_question_uid_v1.json', JSON.stringify(answersByQ1, null, 2));
fs.writeFileSync('public/data/answers/answers_by_question_uid_v1.json', JSON.stringify(answersByQ2, null, 2));
fs.writeFileSync('public/data/answers/answers_by_exam_uid_v1.json', JSON.stringify(answersByExam, null, 2));

console.log('Successfully wrote primary datasets and answer registries.');

// 6. Update pipeline-state.json and audit/validation-report-2026.json
const totalCount = questionsWithAns.length;
const pStatePath = 'pipeline-state.json';
if (fs.existsSync(pStatePath)) {
  const pState = JSON.parse(fs.readFileSync(pStatePath, 'utf8'));
  pState.questionsTotal = totalCount;
  pState.publishedQuestionsTotal = totalCount;
  fs.writeFileSync(pStatePath, JSON.stringify(pState, null, 2));
  console.log(`Updated pipeline-state.json to ${totalCount}`);
}

const valReportPath = 'audit/validation-report-2026.json';
if (fs.existsSync(valReportPath)) {
  const valReport = JSON.parse(fs.readFileSync(valReportPath, 'utf8'));
  valReport.totalBankSize = totalCount;
  valReport.publishedQuestionCount = totalCount;
  fs.writeFileSync(valReportPath, JSON.stringify(valReport, null, 2));
  console.log(`Updated audit/validation-report-2026.json to ${totalCount}`);
}

const dataIntegrityPath = 'artifacts/review/data-integrity-report.json';
if (fs.existsSync(dataIntegrityPath)) {
  const dataIntegrity = JSON.parse(fs.readFileSync(dataIntegrityPath, 'utf8'));
  dataIntegrity.totalQuestions = totalCount;
  fs.writeFileSync(dataIntegrityPath, JSON.stringify(dataIntegrity, null, 2));
  console.log(`Updated artifacts/review/data-integrity-report.json to ${totalCount}`);
}

// 7. Relocate practicepaper-*.json from public/data/ to data/audit/practicepaper/
const targetAuditDir = path.resolve('data/audit/practicepaper');
fs.mkdirSync(targetAuditDir, { recursive: true });

const publicDataDir = path.resolve('public/data');
const filesInPublicData = fs.readdirSync(publicDataDir);
let movedFilesCount = 0;
for (const file of filesInPublicData) {
  if (file.startsWith('practicepaper-') && file.endsWith('.json')) {
    const srcPath = path.join(publicDataDir, file);
    const dstPath = path.join(targetAuditDir, file);
    fs.renameSync(srcPath, dstPath);
    movedFilesCount++;
  }
}
console.log(`Relocated ${movedFilesCount} practicepaper json cache files from public/data to data/audit/practicepaper.`);
