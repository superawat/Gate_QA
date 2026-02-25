#!/usr/bin/env node

/**
 * FEAT-003 Stage 3 — Answer Backfill
 *
 * For each new question with no verified answer, fetch the accepted or
 * highest-voted answer from its GateOverflow thread.
 *
 * Uses the same extraction logic as scripts/answers/backfill_gateoverflow_answers.py:
 *   1. Answer widget pattern (<span>Answer:</span><button>X</button>)
 *   2. Selected answer text fallback (regex patterns)
 *
 * Unresolved → manual patch queue (data/answers/manual_answers_patch_v1.json)
 * Questions included in bank with answer: null
 *
 * Usage:
 *   node scripts/pipeline/answer-backfill.mjs --year 2026
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
    "../.."
);
const AUDIT_DIR = path.join(ROOT, "audit");
const CRAWL_DELAY_MS = 31_000;
const USER_AGENT =
    "Mozilla/5.0 (compatible; GateQA-Pipeline/1.0; +https://github.com/superawat/Gate_QA)";

// ── Helpers ─────────────────────────────────────────────────────────────

function readJson(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const ALLOWED_OPTIONS = new Set(["A", "B", "C", "D"]);

// Widget pattern: <span>Answer:</span><button>X</button>
const ANSWER_WIDGET_RE =
    /<span>\s*Answer:\s*<\/span>\s*<button[^>]*>(.*?)<\/button>/is;

// Fallback patterns for answer text
const FALLBACK_PATTERNS = [
    /Correct\s*Answer\s*[:\-]?\s*([A-D](?:\s*[,;/]\s*[A-D])*)/i,
    /Correct\s*Option\s*[:\-]?\s*([A-D](?:\s*[,;/]\s*[A-D])*)/i,
    /(?:the\s+)?answer\s*(?:is|=|:)\s*\(?\s*([A-D])\s*\)?/i,
    /Option\s*\(?\s*([A-D])\s*\)?\s*(?:is\s*(?:correct|right|true)|\.)/i,
    /\b([A-D])\)\s*(?:all are valid|is correct|is the correct)/i,
    /Correct\s*Answer\s*[:\-]?\s*([-+]?\d+(?:\.\d+)?)/i,
    /(?:final\s+)?answer\s*(?:is|=|:)\s*([-+]?\d+(?:\.\d+)?)/i,
];

// Selected answer block pattern
const SELECTED_BLOCK_RE =
    /qa-a-list-item-selected.*?qa-a-item-content[^>]*>(.*?)<div class="qa-post-when-container/is;

function stripHtml(html) {
    return (html || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeToken(raw) {
    return raw
        .toUpperCase()
        .replace(/[()[\]{}$]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function parseToken(rawValue, method) {
    const token = normalizeToken(stripHtml(rawValue));
    if (!token) return null;

    // Range (NAT): "1.5 : 2.5"
    const rangeMatch = token.match(
        /^([-+]?\d+(?:\.\d+)?)\s*:\s*([-+]?\d+(?:\.\d+)?)$/
    );
    if (rangeMatch) {
        let lower = parseFloat(rangeMatch[1]);
        let upper = parseFloat(rangeMatch[2]);
        if (lower > upper) [lower, upper] = [upper, lower];
        const center = (lower + upper) / 2;
        const tolerance = Math.abs(upper - lower) / 2 || 0.01;
        return { type: "NAT", answer: center, method, raw: token, tolerance };
    }

    // MSQ: "A, B, C"
    const parts = token
        .split(/\s*(?:,|;|\/|&|\band\b)\s*/i)
        .map((p) => p.trim())
        .filter(Boolean);
    if (parts.length > 1 && parts.every((p) => ALLOWED_OPTIONS.has(p))) {
        const deduped = [...new Set(parts)];
        if (deduped.length >= 2) {
            return { type: "MSQ", answer: deduped, method, raw: token };
        }
    }

    // MCQ: single option
    if (ALLOWED_OPTIONS.has(token)) {
        return { type: "MCQ", answer: token, method, raw: token };
    }

    // NAT: numeric
    const numMatch = token.match(/^[-+]?\d+(?:\.\d+)?$/);
    if (numMatch) {
        return {
            type: "NAT",
            answer: parseFloat(numMatch[0]),
            method,
            raw: token,
            tolerance: 0.01,
        };
    }

    return null;
}

function parseFromWidget(html) {
    const match = html.match(ANSWER_WIDGET_RE);
    if (!match) return null;
    return parseToken(match[1], "gateoverflow_widget");
}

function parseFromSelectedAnswer(html) {
    const blockMatch = html.match(SELECTED_BLOCK_RE);
    if (!blockMatch) return null;
    const answerText = stripHtml(blockMatch[1]);
    if (!answerText) return null;

    for (const pattern of FALLBACK_PATTERNS) {
        const match = answerText.match(pattern);
        if (!match) continue;
        const parsed = parseToken(match[1], "selected_answer_text");
        if (parsed) return parsed;
    }

    // Tail fallback
    const tail = answerText.slice(-200);
    const tailMatch = tail.match(/\bOption\s*\(?\s*([A-D])\s*\)?\b/i);
    if (tailMatch) {
        const parsed = parseToken(tailMatch[1], "selected_answer_tail");
        if (parsed) return parsed;
    }

    return null;
}

async function fetchHtml(url) {
    const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
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

    console.log(
        `\n🔍 FEAT-003 Stage 3 — Answer Backfill for year ${targetYear}\n`
    );

    // Load normalised questions
    const normalisedPath = path.join(AUDIT_DIR, `normalised-${targetYear}.json`);
    const questions = readJson(normalisedPath);
    if (!questions || !Array.isArray(questions) || !questions.length) {
        console.log("  No normalised data. Nothing to backfill.");
        process.exit(0);
    }

    console.log(`  Loaded ${questions.length} normalised questions\n`);

    // Load existing answers
    const answersByUidPath = path.join(
        ROOT,
        "data",
        "answers",
        "answers_by_question_uid_v1.json"
    );
    const existingPayload = readJson(answersByUidPath) || {};
    const existingAnswers = existingPayload.records_by_question_uid || {};

    // Load manual patch
    const manualPatchPath = path.join(
        ROOT,
        "data",
        "answers",
        "manual_answers_patch_v1.json"
    );
    const manualPatchPayload = readJson(manualPatchPath) || {};
    const manualPatch = manualPatchPayload.records_by_question_uid || {};

    let resolved = 0;
    let unresolved = 0;
    let skippedExisting = 0;

    const backfillResults = [];

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const uid = q.uid;

        // Skip if already has answer
        if (existingAnswers[uid] || manualPatch[uid]) {
            skippedExisting++;
            questions[i].answer = existingAnswers[uid]?.answer || manualPatch[uid]?.answer || null;
            continue;
        }

        const link = q.link;
        if (!link) {
            questions[i].answer = null;
            unresolved++;
            continue;
        }

        console.log(`  [${i + 1}/${questions.length}] Backfilling: ${link}`);

        try {
            const html = await fetchHtml(link);

            // Try widget first, then selected answer
            let parsed = parseFromWidget(html);
            if (!parsed) {
                parsed = parseFromSelectedAnswer(html);
            }

            if (parsed) {
                resolved++;
                questions[i].answer = parsed.answer;
                questions[i].answerType = parsed.type;

                // Add to manual patch
                const record = {
                    type: parsed.type,
                    answer: parsed.answer,
                    note: `auto_backfill:${parsed.method}:${link}`,
                };
                if (parsed.type === "NAT" && parsed.tolerance) {
                    record.tolerance = { abs: parsed.tolerance };
                }
                manualPatch[uid] = record;

                backfillResults.push({
                    uid,
                    link,
                    status: "resolved",
                    method: parsed.method,
                    type: parsed.type,
                    answer: Array.isArray(parsed.answer)
                        ? parsed.answer.join(";")
                        : String(parsed.answer),
                });

                console.log(`    ✓ ${parsed.type}: ${parsed.answer}`);
            } else {
                unresolved++;
                questions[i].answer = null;
                backfillResults.push({
                    uid,
                    link,
                    status: "unresolved",
                    method: "",
                    type: "",
                    answer: "",
                });
                console.log(`    ⚠ No parseable answer`);
            }
        } catch (err) {
            unresolved++;
            questions[i].answer = null;
            backfillResults.push({
                uid,
                link,
                status: `error:${err.message}`,
                method: "",
                type: "",
                answer: "",
            });
            console.log(`    ✗ Error: ${err.message}`);
        }

        await sleep(CRAWL_DELAY_MS);
    }

    console.log(`\n📊 Answer backfill results:`);
    console.log(`  Resolved:  ${resolved}`);
    console.log(`  Unresolved: ${unresolved}`);
    console.log(`  Already had answer: ${skippedExisting}`);

    // Save updated manual patch
    writeJson(manualPatchPath, { records_by_question_uid: manualPatch });
    console.log(`  Updated manual patch: ${manualPatchPath}`);

    // Save updated normalised data with answers
    const backfilledPath = path.join(AUDIT_DIR, `backfilled-${targetYear}.json`);
    writeJson(backfilledPath, questions);
    console.log(`  Backfilled output: ${backfilledPath}`);

    // Save backfill audit
    writeJson(
        path.join(AUDIT_DIR, `backfill-report-${targetYear}.json`),
        backfillResults
    );

    // GitHub Actions output
    console.log(`::set-output name=answers_resolved::${resolved}`);
    console.log(`::set-output name=answers_unresolved::${unresolved}`);
}

main().catch((err) => {
    console.error(`\n❌ Answer backfill failed: ${err.message}`);
    process.exit(1);
});
