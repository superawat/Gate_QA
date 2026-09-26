#!/usr/bin/env node

/**
 * build-homepage-search-catalog.mjs
 *
 * Precomputes a lightweight (~50-60 KB) search catalog for the homepage
 * from public/question-search-index.json and src/generated/subtopicLookup.json.
 *
 * Contains:
 * - Subjects with slugs, labels, question counts, and common aliases
 * - Subtopics with slugs, labels, parentSubject, parentLabel, and question counts (> 0)
 * - Years with question counts and associated yearSetKeys
 * - Question numbers with exact count distribution and max question number
 * - Top topical keywords/tags with counts (filtered of meta/difficulty noise)
 *
 * Can be run standalone or invoked at the end of build-public-artifacts.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_PATH = path.join(PUBLIC_DIR, "homepage-search-catalog.json");
const SEARCH_INDEX_PATH = path.join(PUBLIC_DIR, "question-search-index.json");
const SUBTOPIC_LOOKUP_PATH = path.join(ROOT, "src", "generated", "subtopicLookup.json");

// Aliases for quick subject search matching
const SUBJECT_ALIASES = {
  algorithms: ["algo", "algos", "algorithms"],
  coa: [
    "co-and-architecture",
    "computer-organization-and-architecture",
    "computer-architecture",
    "coa",
    "architecture",
    "organization",
  ],
  compiler: ["compiler-design", "compiler", "cd"],
  cn: ["computer-networks", "networking", "networks", "cn"],
  dbms: ["databases", "dbms", "database-management-systems", "sql", "database"],
  "digital-logic": ["digital-logic", "integrated-circuits", "dl", "dld", "boolean-algebra", "logic-design"],
  "discrete-math": ["discrete-math", "discrete-mathematics", "dm", "combinatorics", "graph-theory"],
  "engg-math": ["engg-math", "engineering-mathematics", "em", "math", "calculus", "linear-algebra", "probability"],
  ga: ["ga", "general-aptitude", "aptitude", "verbal", "quant", "quantitative", "reasoning"],
  os: ["os", "operating-system", "operating-systems"],
  "prog-ds": ["prog-ds", "programming-and-data-structures", "data-structures", "ds"],
  "prog-c": ["prog-c", "programming-in-c", "c-programming", "c-language", "c-code"],
  toc: ["toc", "theory-of-computation", "automata", "formal-languages"],
  "legacy-other": ["legacy-other", "other"],
};

const IGNORED_TAG_PREFIXES = ["gatecse-", "gateda-"];
const IGNORED_TAG_EXACT = new Set([
  "normal",
  "it",
  "cse",
  "gate-cse",
  "gate-da",
  "one-mark",
  "two-marks",
  "1-mark",
  "2-marks",
  "easy",
  "medium",
  "difficult",
  "numerical-answers",
  "multiple-selects",
]);

const normalizeString = (str) =>
  String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export async function buildHomepageSearchCatalog({
  searchIndex = null,
  outputPath = OUTPUT_PATH,
} = {}) {
  let dataset = searchIndex;
  if (!dataset) {
    if (!fs.existsSync(SEARCH_INDEX_PATH)) {
      throw new Error(`Search index not found at ${SEARCH_INDEX_PATH}. Run build-public-artifacts first.`);
    }
    dataset = JSON.parse(fs.readFileSync(SEARCH_INDEX_PATH, "utf-8"));
  }

  let subtopicLookup = {};
  if (fs.existsSync(SUBTOPIC_LOOKUP_PATH)) {
    subtopicLookup = JSON.parse(fs.readFileSync(SUBTOPIC_LOOKUP_PATH, "utf-8")).subtopicsBySubject || {};
  }

  const subjectsMap = {};
  const yearsMap = {};
  const subtopicsMap = {};
  const qNumCounts = {};
  const tagCounts = {};

  for (const q of dataset) {
    // Subject counts
    if (q.subjectSlug && q.subjectSlug !== "unknown") {
      if (!subjectsMap[q.subjectSlug]) {
        subjectsMap[q.subjectSlug] = {
          slug: q.subjectSlug,
          label: q.subjectLabel,
          count: 0,
          aliases: SUBJECT_ALIASES[q.subjectSlug] || [q.subjectSlug],
        };
      }
      subjectsMap[q.subjectSlug].count++;
    }

    // Year & YearSet counts
    if (q.year) {
      if (!yearsMap[q.year]) {
        yearsMap[q.year] = {
          year: q.year,
          count: 0,
          yearSetKeys: new Set(),
        };
      }
      yearsMap[q.year].count++;
      if (q.yearSetKey) {
        yearsMap[q.year].yearSetKeys.add(q.yearSetKey);
      }
    }

    // Question number distribution from title
    const qNumMatch = q.title && q.title.match(/Question:\s*(\d+)/i);
    if (qNumMatch) {
      const num = parseInt(qNumMatch[1], 10);
      qNumCounts[num] = (qNumCounts[num] || 0) + 1;
    }

    // Canonical subtopics & topical tags
    if (Array.isArray(q.tags)) {
      const subjectSubtopics = subtopicLookup[q.subjectLabel];
      const seenSubtopicsForQ = new Set();

      for (const t of q.tags) {
        const lower = t.toLowerCase().trim();
        if (
          lower &&
          !IGNORED_TAG_EXACT.has(lower) &&
          !IGNORED_TAG_PREFIXES.some((p) => lower.startsWith(p))
        ) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }

        if (subjectSubtopics) {
          const match = subjectSubtopics[normalizeString(t)];
          if (match && !seenSubtopicsForQ.has(match.slug)) {
            seenSubtopicsForQ.add(match.slug);
            const key = `${q.subjectSlug}:${match.slug}`;
            if (!subtopicsMap[key]) {
              subtopicsMap[key] = {
                slug: match.slug,
                label: match.label,
                parentSubject: q.subjectSlug,
                parentLabel: q.subjectLabel,
                count: 0,
              };
            }
            subtopicsMap[key].count++;
          }
        }
      }
    }
  }

  const subjects = Object.values(subjectsMap).sort((a, b) => b.count - a.count);
  const subtopics = Object.values(subtopicsMap)
    .filter((st) => st.count > 0)
    .sort((a, b) => b.count - a.count);
  const years = Object.values(yearsMap)
    .map((y) => ({
      year: y.year,
      count: y.count,
      yearSetKeys: Array.from(y.yearSetKeys).sort(),
    }))
    .sort((a, b) => b.year - a.year);

  // Top topical tags with count >= 2, capped at 300
  const tags = Object.entries(tagCounts)
    .filter(([_, c]) => c >= 2)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 300);

  const maxQNum = Object.keys(qNumCounts).length > 0
    ? Math.max(...Object.keys(qNumCounts).map(Number))
    : 65;

  const catalog = {
    subjects,
    subtopics,
    years,
    questionNumbers: {
      counts: qNumCounts,
      maxNumber: maxQNum,
      totalQuestions: dataset.length,
    },
    tags,
    generatedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(catalog);
  fs.writeFileSync(outputPath, jsonContent, "utf-8");

  console.log(
    `[build-homepage-search-catalog] Wrote ${outputPath} (${(jsonContent.length / 1024).toFixed(1)} KB) - ` +
      `${subjects.length} subjects, ${subtopics.length} subtopics, ${years.length} years, ${tags.length} tags`
  );

  return catalog;
}

// Direct invocation CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildHomepageSearchCatalog().catch((err) => {
    console.error(`[build-homepage-search-catalog] Error:`, err);
    process.exitCode = 1;
  });
}
