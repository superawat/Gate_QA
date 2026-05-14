#!/usr/bin/env node

/**
 * Pipeline readiness dry-run for an upcoming release year.
 *
 * Runs scrape/normalise/merge in `--dry-run` mode so we can validate
 * targeting and stage wiring without mutating the question bank.
 *
 * Usage:
 *   node scripts/pipeline/readiness-dry-run.mjs --year 2027
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
    "../.."
);
const STATE_PATH = path.join(ROOT, "pipeline-state.json");
const AUDIT_DIR = path.join(ROOT, "audit");

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function parseArgs(argv) {
    let targetYear = null;
    for (let index = 0; index < argv.length; index += 1) {
        if (argv[index] === "--year" && argv[index + 1]) {
            targetYear = Number.parseInt(argv[index + 1], 10);
        }
    }
    return { targetYear };
}

function runDryStage(stageName, scriptFile, year) {
    const args = [scriptFile, "--year", String(year), "--dry-run"];
    console.log(`\n▶ Running ${stageName} dry-run: node ${args.join(" ")}`);
    const startedAt = new Date();
    const result = spawnSync(process.execPath, args, {
        cwd: ROOT,
        stdio: "inherit",
        env: process.env,
    });
    const finishedAt = new Date();

    return {
        stage: stageName,
        script: scriptFile,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        exitCode: Number(result.status ?? 1),
        ok: Number(result.status ?? 1) === 0,
    };
}

function main() {
    const { targetYear: argYear } = parseArgs(process.argv.slice(2));
    const state = readJson(STATE_PATH) || {};
    const targetYear = Number.isFinite(argYear) ? argYear : Number(state.nextTargetYear);

    if (!Number.isFinite(targetYear) || targetYear <= 0) {
        throw new Error("Missing target year. Pass --year <YYYY> or set nextTargetYear in pipeline-state.json.");
    }

    console.log(`\n🧪 FEAT-003 readiness dry-run for ${targetYear}`);
    const stages = [
        runDryStage("scrape", "scripts/pipeline/scrape.mjs", targetYear),
        runDryStage("normalise", "scripts/pipeline/normalise.mjs", targetYear),
        runDryStage("merge", "scripts/pipeline/merge.mjs", targetYear),
    ];

    const passed = stages.every((stage) => stage.ok);
    const report = {
        year: targetYear,
        dryRun: true,
        generatedAt: new Date().toISOString(),
        stateNextTargetYear: state.nextTargetYear ?? null,
        passed,
        stages,
    };

    const reportPath = path.join(AUDIT_DIR, `pipeline-readiness-${targetYear}.json`);
    writeJson(reportPath, report);
    console.log(`\n📄 Readiness report: ${path.relative(ROOT, reportPath)}`);

    if (!passed) {
        process.exit(1);
    }
}

try {
    main();
} catch (error) {
    console.error(`[pipeline-readiness-dry-run] ${error.stack || error.message}`);
    process.exit(1);
}
