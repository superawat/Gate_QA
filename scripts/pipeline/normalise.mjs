#!/usr/bin/env node

/**
 * FEAT-003 Stage 2 — Normalise
 *
 * Maps each scraped question to the canonical structure:
 *   uid, subject, subtopic, year, set, paper, type (MCQ/MSQ/NAT)
 *
 * Applies MAX_SUBTOPICS_PER_QUESTION = 1 cap.
 * Questions where subject cannot be determined → audit/unknown-subjects-{year}.json
 *
 * Usage:
 *   node scripts/pipeline/normalise.mjs --year 2026
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
    "../.."
);
const AUDIT_DIR = path.join(ROOT, "audit");

// ── Helpers ─────────────────────────────────────────────────────────────

function readJson(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// ── Subject detection (mirrors QuestionService.resolveCanonicalSubject) ──

const SUBJECT_ALIASES = {
    Algorithms: [
        "algorithms",
        "algorithm",
        "sorting",
        "searching",
        "greedy",
        "dynamic-programming",
        "divide-and-conquer",
        "graph-algorithms",
        "recurrence",
        "asymptotic-notation",
        "time-complexity",
        "space-complexity",
        "hashing",
        "binary-search",
    ],
    "CO & Architecture": [
        "co-and-architecture",
        "computer-organization-and-architecture",
        "computer-architecture",
        "coa",
        "computer-organization",
        "cache-memory",
        "pipelining",
        "instruction-format",
        "io-interface",
        "memory-hierarchy",
    ],
    "Compiler Design": [
        "compiler-design",
        "compiler",
        "compilers",
        "parsing",
        "lexical-analysis",
        "syntax-directed-translation",
        "code-optimization",
        "intermediate-code",
        "runtime-environment",
    ],
    "Computer Networks": [
        "computer-networks",
        "cn",
        "network",
        "networking",
        "tcp",
        "ip",
        "routing",
        "subnetting",
        "data-link-layer",
        "application-layer",
        "transport-layer",
        "network-layer",
    ],
    Databases: [
        "databases",
        "dbms",
        "database",
        "database-management-systems",
        "sql",
        "relational-algebra",
        "normalization",
        "er-model",
        "transactions",
        "concurrency",
        "indexing",
    ],
    "Digital Logic": [
        "digital-logic",
        "boolean-algebra",
        "combinational-circuits",
        "sequential-circuits",
        "flip-flops",
        "karnaugh-map",
        "number-system",
        "logic-gates",
    ],
    "Discrete Mathematics": [
        "discrete-mathematics",
        "discrete-math",
        "set-theory",
        "graph-theory",
        "combinatorics",
        "group-theory",
        "lattice",
        "partial-order",
        "proposition",
        "first-order-logic",
        "mathematical-logic",
        "relations",
        "functions",
        "pigeonhole-principle",
        "counting",
    ],
    "Engineering Mathematics": [
        "engineering-mathematics",
        "engg-math",
        "linear-algebra",
        "calculus",
        "probability",
        "statistics",
        "differential-equations",
        "matrices",
        "eigenvalues",
        "numerical-methods",
    ],
    "General Aptitude": [
        "general-aptitude",
        "ga",
        "quantitative-aptitude",
        "verbal-aptitude",
        "analytical-aptitude",
        "verbal-ability",
        "numerical-ability",
        "logical-reasoning",
    ],
    "Operating System": [
        "operating-system",
        "os",
        "operating-systems",
        "process-scheduling",
        "memory-management",
        "deadlock",
        "file-system",
        "virtual-memory",
        "page-replacement",
        "disk-scheduling",
        "synchronization",
        "semaphore",
    ],
    "Programming and DS": [
        "programming-and-ds",
        "programming-ds",
        "prog-ds",
        "data-structures",
        "linked-list",
        "stack",
        "queue",
        "tree",
        "binary-tree",
        "binary-search-tree",
        "heap",
        "graph",
        "array",
        "recursion",
    ],
    "Programming in C": [
        "programming-in-c",
        "c-programming",
        "prog-c",
        "c-language",
        "pointers",
        "c",
    ],
    "Theory of Computation": [
        "theory-of-computation",
        "toc",
        "automata",
        "regular-languages",
        "context-free",
        "turing-machine",
        "decidability",
        "pushdown-automata",
        "finite-automata",
        "regular-expression",
        "context-free-grammar",
        "pumping-lemma",
    ],
};

const YEAR_SET_PATTERN =
    /gate(?:cse|it)?-?(\d{4})(?:-set(\d+))?/i;

function extractYearSet(tag) {
    const match = String(tag || "").match(YEAR_SET_PATTERN);
    if (!match) return null;
    const year = parseInt(match[1], 10);
    const set = match[2] ? parseInt(match[2], 10) : null;
    return { year, set };
}

function extractGateOverflowId(link = "") {
    const match = String(link || "")
        .trim()
        .match(
            /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
        );
    return match ? match[1] : null;
}

function normalizeTag(tag) {
    return String(tag || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .replace(/^-+|-+$/g, "");
}

function resolveSubject(tags) {
    const normalizedTags = new Set(tags.map(normalizeTag));

    // Check GA first (per QuestionService logic)
    const gaAliases = SUBJECT_ALIASES["General Aptitude"].map(normalizeTag);
    if (gaAliases.some((a) => normalizedTags.has(a))) {
        return "General Aptitude";
    }

    // Score each subject by how many aliases match
    let bestSubject = null;
    let bestScore = 0;

    for (const [subject, aliases] of Object.entries(SUBJECT_ALIASES)) {
        if (subject === "General Aptitude") continue;
        const normalizedAliases = aliases.map(normalizeTag);
        let score = 0;
        for (const alias of normalizedAliases) {
            if (normalizedTags.has(alias)) score++;
        }
        if (score > bestScore) {
            bestScore = score;
            bestSubject = subject;
        }
    }

    return bestSubject || "Unknown";
}

function detectType(tags, title) {
    const allText = [...tags, title].join(" ").toLowerCase();

    if (/\bmsq\b/.test(allText) || /\bmultiple\s+select\b/.test(allText)) {
        return "MSQ";
    }
    if (/\bnat\b/.test(allText) || /\bnumerical\s+answer\b/.test(allText)) {
        return "NAT";
    }
    if (/\bmcq\b/.test(allText) || /\bmultiple\s+choice\b/.test(allText)) {
        return "MCQ";
    }

    // Default — most GATE questions are MCQ
    return "MCQ";
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2);
    let targetYear = null;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--year" && args[i + 1]) {
            targetYear = parseInt(args[i + 1], 10);
        }
    }

    if (!targetYear) {
        const state = readJson(path.join(ROOT, "pipeline-state.json"));
        targetYear = state?.nextTargetYear;
    }

    if (!targetYear) {
        console.error("❌ No target year specified");
        process.exit(1);
    }

    console.log(`\n🔧 FEAT-003 Stage 2 — Normalise for year ${targetYear}\n`);

    // Load scraped data
    const scrapedPath = path.join(AUDIT_DIR, `scraped-${targetYear}.json`);
    const scraped = readJson(scrapedPath);
    if (!scraped || !Array.isArray(scraped) || !scraped.length) {
        console.log("  No scraped data found. Nothing to normalise.");
        process.exit(0);
    }

    console.log(`  Loaded ${scraped.length} scraped questions\n`);

    const normalised = [];
    const unknownSubjects = [];

    for (const q of scraped) {
        const goId = extractGateOverflowId(q.link);
        const uid = goId ? `go:${goId}` : null;

        if (!uid) {
            console.warn(`  ⚠ No UID extractable from ${q.link} — skipping`);
            continue;
        }

        // Extract year/set from tags
        let examYear = null;
        let examSet = null;
        for (const tag of q.tags || []) {
            const parsed = extractYearSet(tag);
            if (parsed) {
                examYear = parsed.year;
                examSet = parsed.set;
                break;
            }
        }

        // Fallback: use target year
        if (!examYear) examYear = targetYear;

        // Resolve subject
        const subject = resolveSubject(q.tags || []);

        // Detect type
        const type = detectType(q.tags || [], q.title || "");

        const normalized = {
            uid,
            title: q.title || "",
            link: q.link || "",
            question: q.question || "",
            tags: q.tags || [],
            year: q.year || "",
            subject,
            subtopic: null, // Will be resolved by frontend's normalizeQuestion
            examYear,
            examSet,
            paper: "CSE",
            type,
        };

        if (subject === "Unknown") {
            unknownSubjects.push(normalized);
            console.warn(`  ⚠ Unknown subject for ${uid}: ${q.title?.slice(0, 60)}`);
        } else {
            normalised.push(normalized);
        }
    }

    console.log(`\n📊 Normalisation results:`);
    console.log(`  Normalised:       ${normalised.length}`);
    console.log(`  Unknown subjects: ${unknownSubjects.length}`);

    // Save normalised output
    const normalisedPath = path.join(AUDIT_DIR, `normalised-${targetYear}.json`);
    writeJson(normalisedPath, normalised);
    console.log(`  Output: ${normalisedPath}`);

    // Save unknown subjects audit
    if (unknownSubjects.length) {
        const unknownPath = path.join(
            AUDIT_DIR,
            `unknown-subjects-${targetYear}.json`
        );
        writeJson(unknownPath, unknownSubjects);
        console.log(`  Unknown subjects audit: ${unknownPath}`);
    }

    // Subject count audit
    const subjectCounts = {};
    for (const q of normalised) {
        subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    }
    writeJson(
        path.join(AUDIT_DIR, `count-by-subject-${targetYear}.json`),
        subjectCounts
    );

    // Year-set count audit
    const yearSetCounts = {};
    for (const q of normalised) {
        const key = `${q.examYear}-set${q.examSet || 0}`;
        yearSetCounts[key] = (yearSetCounts[key] || 0) + 1;
    }
    writeJson(
        path.join(AUDIT_DIR, `count-by-year-set-${targetYear}.json`),
        yearSetCounts
    );

    // GitHub Actions output
    console.log(`::set-output name=normalised_count::${normalised.length}`);
    console.log(
        `::set-output name=unknown_subject_count::${unknownSubjects.length}`
    );
}

main();
