#!/usr/bin/env node
/**
 * FEAT-003 Stage 4 — Merge
 * Merges new questions into existing bank. Dedup by UID. Updates state.
 * Usage: node scripts/pipeline/merge.mjs --year 2026
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "../..");
const AUDIT_DIR = path.join(ROOT, "audit");
const QF_PATH = path.join(ROOT, "public", "questions-filtered.json");
const QWA_PATH = path.join(ROOT, "public", "questions-with-answers.json");
const STATE_PATH = path.join(ROOT, "pipeline-state.json");

function readJson(p) { if (!fs.existsSync(p)) return null; return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJson(p, d) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8"); }
function goId(link) { const m = String(link || "").match(/gateoverflow\.in\/(\d+)/i); return m ? `go:${m[1]}` : null; }

function main() {
    const args = process.argv.slice(2);
    let year = null;
    for (let i = 0; i < args.length; i++) { if (args[i] === "--year" && args[i + 1]) year = parseInt(args[i + 1], 10); }
    if (!year) { const s = readJson(STATE_PATH); year = s?.nextTargetYear; }
    if (!year) { console.error("No target year"); process.exit(1); }

    console.log(`\n🔀 Stage 4 — Merge for ${year}\n`);

    let newQ = readJson(path.join(AUDIT_DIR, `backfilled-${year}.json`));
    if (!newQ) newQ = readJson(path.join(AUDIT_DIR, `normalised-${year}.json`));
    if (!newQ?.length) { console.log("Nothing to merge."); process.exit(0); }

    const existing = readJson(QF_PATH) || [];
    const uids = new Set();
    for (const q of existing) { const u = goId(q.link); if (u) uids.add(u); }

    const merged = [...existing];
    const added = [], dupes = [];

    for (const q of newQ) {
        const uid = q.uid || goId(q.link);
        if (uid && uids.has(uid)) { dupes.push({ uid, title: q.title }); continue; }
        merged.push({ title: q.title || "", link: q.link || "", question: q.question || "", tags: q.tags || [], year: q.year || "" });
        added.push({ uid, title: q.title, subject: q.subject });
        if (uid) uids.add(uid);
    }

    console.log(`Added: ${added.length}, Dupes: ${dupes.length}, Total: ${merged.length}`);

    fs.writeFileSync(QF_PATH, JSON.stringify(merged), "utf8");

    const wqa = readJson(QWA_PATH) || [];
    const wqaUids = new Set(); for (const q of wqa) { const u = goId(q.link); if (u) wqaUids.add(u); }
    for (const q of newQ) {
        const uid = q.uid || goId(q.link);
        if (uid && !wqaUids.has(uid)) {
            wqa.push({ title: q.title || "", link: q.link || "", question: q.question || "", tags: q.tags || [], year: q.year || "", answer: q.answer || null });
        }
    }
    fs.writeFileSync(QWA_PATH, JSON.stringify(wqa), "utf8");

    writeJson(path.join(AUDIT_DIR, `new-questions-added-${year}.json`), added);

    const state = readJson(STATE_PATH) || {};
    state.lastRunAt = new Date().toISOString();
    state.lastYearScraped = year;
    state.questionsTotal = merged.length;
    state.answersTotal = (state.answersTotal || 0) + newQ.filter(q => q.answer != null).length;
    writeJson(STATE_PATH, state);

    console.log(`::set-output name=added_count::${added.length}`);
    console.log(`::set-output name=total_count::${merged.length}`);
}

main();
