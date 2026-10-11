/**
 * precompute-subtopics.mjs
 *
 * Runs at build-time (prebuild / predev) to pre-normalize every subtopic,
 * topic hierarchy, and subject alias from data/taxonomy/gate-syllabus-taxonomy-v1.json
 * so that QuestionService and FilterContext never have to run expensive regex at runtime.
 *
 * Output: src/generated/subtopicLookup.json
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const TAXONOMY_FILE = resolve(ROOT_DIR, 'data', 'taxonomy', 'gate-syllabus-taxonomy-v1.json');
const OUTPUT_DIR = resolve(ROOT_DIR, 'src', 'generated');
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'subtopicLookup.json');

// ── Inline copies of pure normalization functions ─────────────────────────
const normalizeString = (str) =>
    String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const slugifyToken = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// ── Subject alias overrides for fuzzy matching & legacy query support ─────
const SUBJECT_ALIAS_OVERRIDES = {
    Algorithms: ['algorithms'],
    'CO & Architecture': ['co-and-architecture', 'computer-organization-and-architecture', 'computer-architecture', 'coa'],
    'Compiler Design': ['compiler-design'],
    'Computer Networks': ['computer-networks', 'cn'],
    Databases: ['databases', 'dbms', 'database-management-systems'],
    'Digital Logic': ['digital-logic', 'integrated-circuits'],
    'Discrete Mathematics': [
        'discrete-mathematics',
        'discrete-math',
        'graph-theory',
        'mathematical-logic',
        'set-theory-and-algebra',
        'set-theory&algebra',
        'equivalence-class'
    ],
    'Engineering Mathematics': [
        'engineering-mathematics',
        'engg-math',
        'linear-algebra',
        'numerical-methods',
        'newton-raphson',
        'simpsons-rule',
        'simplex-method'
    ],
    'General Aptitude': ['general-aptitude', 'ga', 'spatial-aptitude'],
    'Other / Optional': [
        'legacy / other',
        'other / optional',
        'other-optional',
        'optional',
        'legacy-other',
        'legacy-out-of-syllabus',
        'out-of-syllabus-now',
        'out-of-gatecse-syllabus',
        'web-technologies',
        'html',
        'is&software-engineering',
        'is-software-engineering',
        'software-engineering',
        'object-oriented-programming',
        'fortran',
        'pascal'
    ],
    'Operating System': ['operating-system', 'os'],
    'Programming and DS': ['programming-and-ds', 'programming-ds', 'prog-ds', 'data-structures', 'tree-traversal'],
    'Programming in C': ['programming-in-c', 'c-programming', 'prog-c', 'programming'],
    'Theory of Computation': ['theory-of-computation', 'toc']
};

// ── Load authoritative 3-tier taxonomy registry ───────────────────────────
let taxonomyData = null;
if (existsSync(TAXONOMY_FILE)) {
    try {
        taxonomyData = JSON.parse(readFileSync(TAXONOMY_FILE, 'utf-8'));
    } catch (err) {
        console.warn(`[precompute] Warning: failed to parse ${TAXONOMY_FILE}:`, err.message);
    }
}

if (!taxonomyData || !Array.isArray(taxonomyData.subjects)) {
    throw new Error(`[precompute] Missing or invalid taxonomy file at ${TAXONOMY_FILE}`);
}

// ── Build lookup structures ──────────────────────────────────────────────
/**
 * subtopicsBySubject:
 *   { [subjectLabel]: { [normalizedString]: { slug, label, topicSlug, topicLabel, subjectSlug } } }
 *
 * normalizedSubtopicsBySubject:
 *   { [subjectLabel]: [ normalizedString, ... ] }
 *
 * subjectAliases:
 *   { [subjectLabel]: [ normalizedAlias, ... ] }
 *
 * topicsBySubject:
 *   { [subjectSlug]: [ { slug, label, subtopics: [ { slug, label } ] } ] }
 *
 * subtopicToTopic:
 *   { [subtopicSlug]: { topicSlug, topicLabel, subjectSlug, subjectLabel } }
 */

const subtopicsBySubject = {};
const normalizedSubtopicsBySubject = {};
const subjectAliases = {};
const topicsBySubject = {};
const subtopicToTopic = {};

for (const subject of taxonomyData.subjects) {
    const subjectLabel = subject.label;
    const subjectSlug = subject.slug;
    const lookup = {};
    const normalized = [];
    const topicsList = [];

    for (const topic of subject.topics || []) {
        const topicSlug = topic.slug;
        const topicLabel = topic.label;
        const topicSubtopics = [];

        for (const sub of topic.subtopics || []) {
            const subLabel = sub.label;
            const subSlug = sub.slug || slugifyToken(subLabel);
            const norm = normalizeString(subLabel);

            normalized.push(norm);
            const entry = {
                slug: subSlug,
                label: subLabel
            };
            lookup[norm] = entry;

            // Also map any aliases defined on the subtopic
            if (Array.isArray(sub.aliases)) {
                for (const alias of sub.aliases) {
                    const normAlias = normalizeString(alias);
                    if (normAlias && !lookup[normAlias]) {
                        lookup[normAlias] = entry;
                        normalized.push(normAlias);
                    }
                }
            }

            // Map subtopicSlug -> parent topic & subject
            if (!subtopicToTopic[subSlug]) {
                subtopicToTopic[subSlug] = {
                    topicSlug,
                    topicLabel,
                    subjectSlug,
                    subjectLabel
                };
            }

            topicSubtopics.push({
                slug: subSlug,
                label: subLabel
            });
        }

        topicsList.push({
            slug: topicSlug,
            label: topicLabel,
            subtopics: topicSubtopics
        });
    }

    subtopicsBySubject[subjectLabel] = lookup;
    normalizedSubtopicsBySubject[subjectLabel] = Array.from(new Set(normalized));
    topicsBySubject[subjectSlug] = topicsList;

    // Build aliases for this subject
    const aliases = new Set();
    const addAlias = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return;
        aliases.add(normalizeString(raw));
        aliases.add(normalizeString(raw.replace(/-/g, ' ')));
    };

    addAlias(subjectLabel);
    addAlias(subjectLabel.replace(/&/g, 'and'));
    addAlias(subjectSlug);

    if (Array.isArray(subject.aliases)) {
        subject.aliases.forEach(addAlias);
    }
    const customAliases = SUBJECT_ALIAS_OVERRIDES[subjectLabel] || [];
    customAliases.forEach(addAlias);

    subjectAliases[subjectLabel] = Array.from(aliases).filter(Boolean);
}

// ── Write output ─────────────────────────────────────────────────────────
const output = {
    _generatedAt: new Date().toISOString(),
    _comment: 'Auto-generated by scripts/precompute-subtopics.mjs from data/taxonomy/gate-syllabus-taxonomy-v1.json — do NOT edit manually.',
    subtopicsBySubject,
    normalizedSubtopicsBySubject,
    subjectAliases,
    topicsBySubject,
    subtopicToTopic
};

if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
console.log(`[precompute] Wrote ${OUTPUT_FILE}`);
console.log(`[precompute]   Subjects: ${Object.keys(subtopicsBySubject).length}`);
console.log(`[precompute]   Total subtopic entries: ${Object.values(normalizedSubtopicsBySubject).reduce((a, b) => a + b.length, 0)}`);
console.log(`[precompute]   Mapped subtopicToTopic keys: ${Object.keys(subtopicToTopic).length}`);
