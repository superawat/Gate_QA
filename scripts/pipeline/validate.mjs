#!/usr/bin/env node
/**
 * FEAT-003 Stage 5 — Validate
 * Hard gate — no deployment if any check fails.
 * Checks: volume (65/130/195), dedup (no dup UIDs), completeness (year/subject/type).
 * Usage: node scripts/pipeline/validate.mjs --year 2026
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "../..");
const AUDIT_DIR = path.join(ROOT, "audit");
const QF_PATH = path.join(ROOT, "public", "questions-filtered.json");
const STATE_PATH = path.join(ROOT, "pipeline-state.json");
const VALID_VOLUMES = new Set([65, 130, 195]);

function readJson(p) { if (!fs.existsSync(p)) return null; return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJson(p, d) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8"); }
function goId(link) { const m = String(link || "").match(/gateoverflow\.in\/(\d+)/i); return m ? `go:${m[1]}` : null; }

function main() {
    const args = process.argv.slice(2);
    let year = null;
    for (let i = 0; i < args.length; i++) { if (args[i] === "--year" && args[i + 1]) year = parseInt(args[i + 1], 10); }
    if (!year) { const s = readJson(STATE_PATH); year = s?.nextTargetYear; }
    if (!year) { console.error("No target year"); process.exit(1); }

    console.log(`\n✅ Stage 5 — Validate for ${year}\n`);

    const failures = [];

    // --- Volume check ---
    const addedPath = path.join(AUDIT_DIR, `new-questions-added-${year}.json`);
    const added = readJson(addedPath) || [];
    const count = added.length;

    if (!VALID_VOLUMES.has(count)) {
        failures.push({
            check: "volume",
            message: `New question count ${count} is not valid (expected 65, 130, or 195). GATE always has 65 questions per set.`,
            actual: count,
            expected: Array.from(VALID_VOLUMES),
        });
    }
    console.log(`  Volume: ${count} new questions ${VALID_VOLUMES.has(count) ? "✓" : "✗"}`);

    // --- Dedup check across full bank ---
    const bank = readJson(QF_PATH) || [];
    const uidMap = new Map();
    const duplicates = [];
    for (const q of bank) {
        const uid = goId(q.link);
        if (!uid) continue;
        if (uidMap.has(uid)) {
            duplicates.push({ uid, title1: uidMap.get(uid), title2: q.title || "" });
        } else {
            uidMap.set(uid, q.title || "");
        }
    }
    if (duplicates.length) {
        failures.push({
            check: "dedup",
            message: `${duplicates.length} duplicate UIDs found in full bank (1987-${year}).`,
            duplicates: duplicates.slice(0, 50),
        });
    }
    console.log(`  Dedup: ${duplicates.length} duplicates ${duplicates.length === 0 ? "✓" : "✗"}`);

    // --- Completeness check on new questions ---
    const normalised = readJson(path.join(AUDIT_DIR, `normalised-${year}.json`)) || [];
    const incomplete = [];
    for (const q of normalised) {
        const missing = [];
        if (!q.examYear && !q.year) missing.push("year");
        if (!q.subject || q.subject === "Unknown") missing.push("subject");
        if (!q.type) missing.push("type");
        if (missing.length) {
            incomplete.push({ uid: q.uid, title: q.title?.slice(0, 80), missing });
        }
    }
    if (incomplete.length) {
        failures.push({
            check: "completeness",
            message: `${incomplete.length} new questions missing required fields.`,
            quarantined: incomplete.slice(0, 50),
        });
    }
    console.log(`  Completeness: ${incomplete.length} incomplete ${incomplete.length === 0 ? "✓" : "✗"}`);

    // --- Report ---
    const report = {
        year,
        timestamp: new Date().toISOString(),
        newQuestionCount: count,
        totalBankSize: bank.length,
        duplicatesInBank: duplicates.length,
        incompleteNewQuestions: incomplete.length,
        passed: failures.length === 0,
        failures,
    };

    writeJson(path.join(AUDIT_DIR, `validation-report-${year}.json`), report);

    if (failures.length) {
        console.error(`\n❌ VALIDATION FAILED — ${failures.length} check(s) failed`);
        for (const f of failures) {
            console.error(`  [${f.check}] ${f.message}`);
        }
        // Write failure info for issue creation
        writeJson(path.join(AUDIT_DIR, "validation-failure.json"), report);
        process.exit(1);
    }

    console.log(`\n✅ All validation checks passed`);

    // Update pipeline state
    const state = readJson(STATE_PATH) || {};
    state.volumeCheckPassed = true;
    writeJson(STATE_PATH, state);
}

main();
