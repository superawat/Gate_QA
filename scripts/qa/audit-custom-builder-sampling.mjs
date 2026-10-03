/**
 * audit-custom-builder-sampling.mjs
 *
 * Reproducible Monte Carlo audit script to measure sampling distribution and frequency
 * across GateQA question pools for Custom Builder.
 *
 * Usage:
 *   node scripts/qa/audit-custom-builder-sampling.mjs [--seed=42] [--runs=100] [--count=25]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// ── Seeded PRNG (Mulberry32) for 100% reproducible statistical audits ────────
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const args = process.argv.slice(2);
const seedArg = args.find((a) => a.startsWith('--seed='));
const runsArg = args.find((a) => a.startsWith('--runs='));
const countArg = args.find((a) => a.startsWith('--count='));

const SEED = seedArg ? parseInt(seedArg.split('=')[1], 10) : 42;
const NUM_RUNS = runsArg ? parseInt(runsArg.split('=')[1], 10) : 100;
const TEST_SIZE = countArg ? parseInt(countArg.split('=')[1], 10) : 25;

const rng = mulberry32(SEED);

// ── Data Ingestion ───────────────────────────────────────────────────────────
const searchIndexPath = path.resolve(ROOT_DIR, 'public', 'question-search-index.json');
const subtopicLookupPath = path.resolve(ROOT_DIR, 'src', 'generated', 'subtopicLookup.json');
const mockCatalogPath = path.resolve(ROOT_DIR, 'public', 'mock_catalog_v1.json');

const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf-8'));
const subtopicLookup = JSON.parse(fs.readFileSync(subtopicLookupPath, 'utf-8')).subtopicsBySubject || {};
const mockCatalog = JSON.parse(fs.readFileSync(mockCatalogPath, 'utf-8')).byQuestionUid || {};

// Filter to scorable questions
const scorableQuestions = searchIndex.filter((q) => {
  const meta = mockCatalog[q.question_uid];
  return meta && meta.scorable;
});

// Helper functions mirroring runtime normalization
const normalizeString = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const slugifyToken = (v) =>
  String(v || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Pre-hydrate subtopics onto questions exactly as QuestionService does
const hydratedQuestions = scorableQuestions.map((q) => {
  const subj = q.subjectLabel;
  const lookup = subtopicLookup[subj] || {};
  const found = [];
  (q.tags || []).forEach((t) => {
    const norm = normalizeString(t);
    if (lookup[norm] && !found.some((st) => st.slug === lookup[norm].slug)) {
      found.push(lookup[norm]);
    }
  });
  return { ...q, subtopics: found };
});

function shuffle(rows) {
  const next = [...rows];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const swap = Math.floor(rng() * (i + 1));
    const temp = next[i];
    next[i] = next[swap];
    next[swap] = temp;
  }
  return next;
}

const getQuestionSubjectKey = (q) => q.subjectSlug || 'unknown';

const getQuestionSubtopicKey = (q) => {
  const first = Array.isArray(q?.subtopics) ? q.subtopics[0] : null;
  return slugifyToken(first?.slug || first?.label || q?.subtopic || q?.topic || 'general') || 'general';
};

// ── Algorithm 1: Current balancedSample in MockTestShell.jsx ──────────────────
const takeFromBalancedSubject = (subjectBucket) => {
  while (subjectBucket.subtopics.length > 0) {
    const subtopicBucket = subjectBucket.subtopics.shift();
    const question = subtopicBucket.queue.shift();
    if (subtopicBucket.queue.length > 0) {
      subjectBucket.subtopics.push(subtopicBucket);
    }
    if (question) return question;
  }
  return null;
};

const currentBalancedSample = (rows, count) => {
  const targetCount = Math.max(0, Math.min(rows.length, count || 0));
  if (targetCount === 0) return [];

  const groupedBySubject = new Map();
  shuffle(rows).forEach((question) => {
    const subjectKey = getQuestionSubjectKey(question);
    const subtopicKey = getQuestionSubtopicKey(question);
    if (!groupedBySubject.has(subjectKey)) {
      groupedBySubject.set(subjectKey, new Map());
    }
    const subtopicMap = groupedBySubject.get(subjectKey);
    if (!subtopicMap.has(subtopicKey)) {
      subtopicMap.set(subtopicKey, []);
    }
    subtopicMap.get(subtopicKey).push(question);
  });

  const subjectBuckets = shuffle(
    Array.from(groupedBySubject.entries()).map(([subjectKey, subtopicMap]) => ({
      subjectKey,
      subtopics: shuffle(
        Array.from(subtopicMap.entries()).map(([subtopicKey, queue]) => ({
          subtopicKey,
          queue,
        }))
      ),
    }))
  );

  const sampled = [];
  while (sampled.length < targetCount && subjectBuckets.length > 0) {
    const subjectBucket = subjectBuckets.shift();
    const question = takeFromBalancedSubject(subjectBucket);
    if (question) sampled.push(question);
    if (subjectBucket.subtopics.length > 0) subjectBuckets.push(subjectBucket);
  }
  return sampled;
};

// ── Algorithm 2: Proposed Subject-Stratified Uniform Sampler ─────────────────
const proposedStratifiedSample = (rows, count) => {
  const targetCount = Math.max(0, Math.min(rows.length, count || 0));
  if (targetCount === 0) return [];
  if (targetCount >= rows.length) return shuffle(rows);

  // Group by canonical subject
  const poolBySubject = new Map();
  for (const q of rows) {
    const key = getQuestionSubjectKey(q);
    if (!poolBySubject.has(key)) poolBySubject.set(key, []);
    poolBySubject.get(key).push(q);
  }

  const subjects = Array.from(poolBySubject.keys());
  if (subjects.length <= 1) {
    return shuffle(rows).slice(0, targetCount);
  }

  // Quota allocation across subjects
  const quotas = new Map();
  for (const s of subjects) quotas.set(s, 0);

  const available = new Map();
  for (const s of subjects) available.set(s, poolBySubject.get(s).length);

  let allocated = 0;
  const shuffledSubjects = shuffle(subjects);
  let active = shuffledSubjects.filter((s) => available.get(s) > 0);

  while (allocated < targetCount && active.length > 0) {
    for (const s of active) {
      if (allocated >= targetCount) break;
      if (quotas.get(s) < available.get(s)) {
        quotas.set(s, quotas.get(s) + 1);
        allocated += 1;
      }
    }
    active = active.filter((s) => quotas.get(s) < available.get(s));
  }

  const result = [];
  for (const [s, quota] of quotas.entries()) {
    if (quota <= 0) continue;
    const shuffledSubPool = shuffle(poolBySubject.get(s));
    result.push(...shuffledSubPool.slice(0, quota));
  }
  return shuffle(result);
};

// ── Run Audit Simulation ─────────────────────────────────────────────────────
console.log('='.repeat(80));
console.log(`GateQA Custom Builder Sampling Audit (Seed=${SEED}, Runs=${NUM_RUNS}, TestSize=${TEST_SIZE})`);
console.log('='.repeat(80));

const SUBJECTS_TO_TEST = [
  'algorithms',
  'digital-logic',
  'coa',
  'dbms',
  'os',
  'cn',
  'toc',
  'compiler',
  'discrete-math',
];

console.log(
  'Subject'.padEnd(16),
  'Pool'.padStart(6),
  'Exp'.padStart(6),
  '| Curr Max'.padStart(12),
  'Curr >3x'.padStart(10),
  'Curr 0x'.padStart(9),
  '| Prop Max'.padStart(12),
  'Prop >3x'.padStart(10),
  'Prop 0x'.padStart(9)
);
console.log('-'.repeat(88));

for (const subj of SUBJECTS_TO_TEST) {
  const pool = hydratedQuestions.filter((q) => q.subjectSlug === subj);
  if (pool.length === 0) continue;

  const expected = ((TEST_SIZE / pool.length) * NUM_RUNS).toFixed(1);

  // Measure Current Algorithm
  const currentCounts = {};
  pool.forEach((q) => (currentCounts[q.question_uid] = 0));
  for (let i = 0; i < NUM_RUNS; i++) {
    const sample = currentBalancedSample(pool, TEST_SIZE);
    sample.forEach((q) => currentCounts[q.question_uid]++);
  }
  const currVals = Object.values(currentCounts);
  const currMax = Math.max(...currVals);
  const currOver3x = currVals.filter((v) => v > parseFloat(expected) * 3).length;
  const currNever = currVals.filter((v) => v === 0).length;

  // Measure Proposed Algorithm
  const propCounts = {};
  pool.forEach((q) => (propCounts[q.question_uid] = 0));
  for (let i = 0; i < NUM_RUNS; i++) {
    const sample = proposedStratifiedSample(pool, TEST_SIZE);
    sample.forEach((q) => propCounts[q.question_uid]++);
  }
  const propVals = Object.values(propCounts);
  const propMax = Math.max(...propVals);
  const propOver3x = propVals.filter((v) => v > parseFloat(expected) * 3).length;
  const propNever = propVals.filter((v) => v === 0).length;

  console.log(
    subj.padEnd(16),
    String(pool.length).padStart(6),
    String(expected).padStart(6),
    `| ${currMax}/${NUM_RUNS}`.padStart(12),
    String(currOver3x).padStart(10),
    String(currNever).padStart(9),
    `| ${propMax}/${NUM_RUNS}`.padStart(12),
    String(propOver3x).padStart(10),
    String(propNever).padStart(9)
  );
}

// ── Multi-Subject Simulation ──────────────────────────────────────────────────
console.log('='.repeat(80));
console.log('Multi-Subject Test (5 Subjects: algorithms, os, dbms, cn, toc | Pool: 1404 | TestSize: 25)');
console.log('='.repeat(80));

const multiSubjs = ['algorithms', 'os', 'dbms', 'cn', 'toc'];
const multiPool = hydratedQuestions.filter((q) => multiSubjs.includes(q.subjectSlug));

const currMultiCounts = {};
multiPool.forEach((q) => (currMultiCounts[q.question_uid] = 0));
for (let i = 0; i < NUM_RUNS; i++) {
  const sample = currentBalancedSample(multiPool, TEST_SIZE);
  sample.forEach((q) => currMultiCounts[q.question_uid]++);
}

const propMultiCounts = {};
multiPool.forEach((q) => (propMultiCounts[q.question_uid] = 0));
for (let i = 0; i < NUM_RUNS; i++) {
  const sample = proposedStratifiedSample(multiPool, TEST_SIZE);
  sample.forEach((q) => propMultiCounts[q.question_uid]++);
}

const currMultiVals = Object.values(currMultiCounts);
const propMultiVals = Object.values(propMultiCounts);

console.log('Current Algorithm:');
console.log('  Max appearances for a single question:', Math.max(...currMultiVals), '/', NUM_RUNS);
console.log('  Questions appearing > 15 times (expected ~1.8):', currMultiVals.filter(v => v > 5.4).length);
console.log('  Questions with 0 appearances in 100 tests:', currMultiVals.filter(v => v === 0).length, '/', multiPool.length);

console.log('Proposed Subject-Stratified Algorithm:');
console.log('  Max appearances for a single question:', Math.max(...propMultiVals), '/', NUM_RUNS);
console.log('  Questions appearing > 15 times:', propMultiVals.filter(v => v > 5.4).length);
console.log('  Questions with 0 appearances in 100 tests:', propMultiVals.filter(v => v === 0).length, '/', multiPool.length);
console.log('='.repeat(80));

