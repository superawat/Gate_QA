#!/usr/bin/env node

/**
 * scripts/pipeline/audit-solution-inventory.mjs
 * --------------------------------------------
 * Regenerates a complete, read-only audit inventory across all 6 GATE branches (CSE, DA, EC, EE, ME, CE).
 * Counts unique canonical question_uids, audits detailed solution presence and quality,
 * classifies each into:
 *   - accepted (verified patch, authentic PP derivation, or robust non-boilerplate derivation)
 *   - boilerplate (synthetic generic filler matching known boilerplate markers)
 *   - needing_review (borderline / short / unverified derivation)
 *   - no_solution (completely missing detailed solution)
 *
 * Outputs:
 *   - Console summary & tables
 *   - docs/generated/SOLUTION_BASELINE_AUDIT.md
 *   - data/solutions/reconciled-solution-backlog.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const SHARDS_DIR = path.join(ROOT, "public", "question-detail-shards");
const DA_SHARDS_DIR = path.join(ROOT, "public", "data", "da", "shards");
const MASTER_ANSWERS_PATH = path.join(ROOT, "data", "answers", "answers_by_question_uid_v1.json");
const DA_ANSWERS_PATH = path.join(ROOT, "public", "data", "da", "answers-by-question-uid-v1.json");
const MANUAL_PATCH_PATH = path.join(ROOT, "data", "answers", "manual-answers-patch-v1.json");
const PP_ALL_PATH = path.join(ROOT, "data", "solutions", "practicepaper", "all-solutions.json");
const SOLUTIONS_DIR = path.join(ROOT, "data", "solutions");

import { AUTHENTIC_PATCHES } from "./patch-authentic-solutions.mjs";

const BOILERPLATE_MARKERS = [
  "Conceptual Framework & Principles",
  "constitutive laws",
  "physical principles, constitutive laws",
  "The alternative options fail to satisfy boundary conditions",
  "The alternative options fail to satisfy the necessary boundary conditions",
  "Analyzing boundary constraints and governing relations",
  "Analyzing boundary constraints, circuit/state relations",
  "Therefore, the correct answer is **Option MTA**.",
  "Option MTA",
];

export function isBoilerplate(text) {
  if (!text || typeof text !== "string") return false;
  return BOILERPLATE_MARKERS.some((marker) => text.includes(marker));
}

// 1. Load answer maps
function loadAnswerKeys() {
  const map = {};
  if (fs.existsSync(MASTER_ANSWERS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(MASTER_ANSWERS_PATH, "utf-8"));
      Object.assign(map, data.records_by_question_uid || {});
    } catch (e) {
      console.warn("Could not load master answers:", e.message);
    }
  }
  if (fs.existsSync(DA_ANSWERS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DA_ANSWERS_PATH, "utf-8"));
      Object.assign(map, data.records_by_question_uid || {});
    } catch (e) {
      console.warn("Could not load DA answers:", e.message);
    }
  }
  if (fs.existsSync(MANUAL_PATCH_PATH)) {
    try {
      const patchData = JSON.parse(fs.readFileSync(MANUAL_PATCH_PATH, "utf-8"));
      const records = patchData.records_by_question_uid || patchData;
      for (const [uid, p] of Object.entries(records)) {
        if (uid && p) {
          map[uid] = {
            answer_uid: uid,
            answer: p.official_answer || p.answer,
            type: p.type || map[uid]?.type || "MCQ",
          };
        }
      }
    } catch (e) {
      console.warn("Could not load manual answers patch:", e.message);
    }
  }
  return map;
}

// 2. Load solution repositories
function loadExternalSolutions() {
  const map = new Map();

  // PracticePaper solutions
  if (fs.existsSync(PP_ALL_PATH)) {
    try {
      const ppData = JSON.parse(fs.readFileSync(PP_ALL_PATH, "utf-8"));
      for (const [uid, item] of Object.entries(ppData)) {
        if (item.has_detailed_solution && item.detailed_solution && !isBoilerplate(item.detailed_solution)) {
          map.set(uid, {
            concept: item.concept || "",
            markdown: item.detailed_solution,
            source: "practicepaper_authentic",
          });
        }
      }
    } catch (e) {
      console.warn("Could not load PP solutions:", e.message);
    }
  }

  // Academic v1 solutions
  const v1Files = ["cse-v1.json", "da-v1.json", "ec-v1.json", "ee-v1.json", "me-v1.json", "ce-v1.json"];
  for (const fileName of v1Files) {
    const filePath = path.join(SOLUTIONS_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      for (const [uid, item] of Object.entries(data)) {
        if (item?.solution_markdown && !isBoilerplate(item.solution_markdown)) {
          if (!map.has(uid)) {
            map.set(uid, {
              concept: item.concept_summary || "",
              markdown: item.solution_markdown,
              source: "v1_academic",
            });
          }
        }
      }
    } catch (e) {
      console.warn(`Could not load ${fileName}:`, e.message);
    }
  }

  // AUTHENTIC_PATCHES (Highest priority)
  for (const [uid, patch] of Object.entries(AUTHENTIC_PATCHES)) {
    const md = typeof patch === "string" ? patch : patch?.markdown;
    if (!md) continue;
    map.set(uid, {
      concept: typeof patch === "string" ? "" : (patch?.concept || ""),
      markdown: md,
      source: "verified_patch",
    });
  }

  return map;
}

// Helper to check if question is GA
function isGeneralAptitude(q) {
  const title = (q.title || "").toLowerCase();
  const tags = (Array.isArray(q.tags) ? q.tags : []).map((t) => String(t).toLowerCase());
  const subjectSlug = (q.taxonomy?.primary?.subjectSlug || q.subjectSlug || "").toLowerCase();
  const subjectLabel = (q.taxonomy?.primary?.subjectLabel || q.subject || "").toLowerCase();

  return (
    title.includes("ga question") ||
    title.includes("general aptitude") ||
    tags.includes("general-aptitude") ||
    tags.includes("ga") ||
    subjectSlug === "ga" ||
    subjectSlug === "general-aptitude" ||
    subjectLabel.includes("general aptitude")
  );
}

export function runAudit() {
  const answerKeys = loadAnswerKeys();
  const externalSolutions = loadExternalSolutions();

  const inventory = [];
  const seenUids = new Set();
  const duplicates = [];

  // Helper to audit a single question entry
  function auditQuestion({ uid, branch, year, set, qNum, q, shardName }) {
    if (seenUids.has(uid)) {
      duplicates.push({ uid, branch, year, shardName });
      return;
    }
    seenUids.add(uid);

    const isGA = isGeneralAptitude(q);
    const qType = (q.type || answerKeys[uid]?.type || "MCQ").toUpperCase();
    const officialAnswer = answerKeys[uid]?.answer || q.answer || "UNKNOWN";

    // Determine current effective solution
    let effectiveMarkdown = "";
    let solutionSource = "none";

    if (AUTHENTIC_PATCHES[uid]) {
      const p = AUTHENTIC_PATCHES[uid];
      effectiveMarkdown = typeof p === "string" ? p : (p?.markdown || "");
      solutionSource = "verified_patch";
    } else if (q.detailed_solution?.markdown && !isBoilerplate(q.detailed_solution.markdown)) {
      effectiveMarkdown = q.detailed_solution.markdown;
      solutionSource = "shard_existing";
    } else if (externalSolutions.has(uid)) {
      effectiveMarkdown = externalSolutions.get(uid).markdown;
      solutionSource = externalSolutions.get(uid).source;
    } else if (q.detailed_solution?.markdown && isBoilerplate(q.detailed_solution.markdown)) {
      effectiveMarkdown = q.detailed_solution.markdown;
      solutionSource = "shard_boilerplate";
    }

    // Classification
    let classification = "no_solution";
    if (solutionSource === "verified_patch") {
      classification = "accepted";
    } else if (solutionSource === "shard_boilerplate" || isBoilerplate(effectiveMarkdown)) {
      classification = "boilerplate";
    } else if (effectiveMarkdown && effectiveMarkdown.trim().length > 0) {
      if (effectiveMarkdown.trim().length < 75) {
        classification = "needing_review";
      } else {
        classification = "accepted";
      }
    } else {
      classification = "no_solution";
    }

    // Determine Era for CSE / branches
    const numericYear = parseInt(String(year).replace(/[^0-9]/g, ""), 10) || 0;
    let era = "modern"; // 2014-2026
    if (numericYear >= 2014) {
      era = "modern";
    } else if (numericYear >= 2001) {
      era = "classic"; // 2001-2013
    } else if (numericYear > 0) {
      era = "vintage"; // 1987-2000
    }

    inventory.push({
      uid,
      branch,
      year: numericYear,
      era,
      set: set || 1,
      qNum: qNum || 0,
      title: q.title || `GATE ${branch.toUpperCase()} ${year}`,
      type: qType,
      isGA,
      section: isGA ? "General Aptitude" : "Technical",
      subject: q.taxonomy?.primary?.subjectLabel || q.subject || branch.toUpperCase(),
      subtopic: q.taxonomy?.primary?.subtopicLabel || "",
      officialAnswer,
      hasOfficialAnswer: officialAnswer !== "UNKNOWN",
      solutionSource,
      classification,
      solutionLength: effectiveMarkdown ? effectiveMarkdown.trim().length : 0,
      shardName,
      hasImages: Array.isArray(q.detailed_solution?.images) && q.detailed_solution.images.length > 0,
    });
  }

  // 1. Process public/data/da/shards/ first (canonical DA repository)
  if (fs.existsSync(DA_SHARDS_DIR)) {
    const daFiles = fs.readdirSync(DA_SHARDS_DIR).filter((f) => f.endsWith(".json"));
    for (const file of daFiles) {
      const year = parseInt(file.replace(".json", ""), 10) || 2024;
      let shard;
      try {
        shard = JSON.parse(fs.readFileSync(path.join(DA_SHARDS_DIR, file), "utf-8"));
      } catch (e) {
        console.warn(`[WARN] Failed to parse DA shard ${file}:`, e.message);
        continue;
      }

      for (const [uid, q] of Object.entries(shard.recordsByQuestionUid || {})) {
        const qNum = parseInt((q.title || "").match(/question\s*:\s*(\d+)/i)?.[1] || "0", 10);
        auditQuestion({ uid, branch: "da", year, set: 1, qNum, q, shardName: file });
      }
    }
  }

  // 2. Process public/question-detail-shards/
  if (fs.existsSync(SHARDS_DIR)) {
    const shardFiles = fs.readdirSync(SHARDS_DIR).filter((f) => f.endsWith(".json"));
    for (const file of shardFiles) {
      let branch = "cse";
      if (file.startsWith("ec-")) branch = "ec";
      else if (file.startsWith("ee-")) branch = "ee";
      else if (file.startsWith("me-")) branch = "me";
      else if (file.startsWith("ce-")) branch = "ce";

      let shard;
      try {
        shard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, file), "utf-8"));
      } catch (e) {
        console.warn(`[WARN] Failed to parse ${file}:`, e.message);
        continue;
      }

      const year = shard.year || file.match(/\d{4}/)?.[0] || 0;
      const set = shard.set || 1;

      for (const [uid, q] of Object.entries(shard.recordsByQuestionUid || {})) {
        const qNum = q.question_number || q.itemNum || parseInt((q.title || "").match(/question\s*:\s*(\d+)/i)?.[1] || "0", 10);
        auditQuestion({ uid, branch, year, set, qNum, q, shardName: file });
      }
    }
  }

  // Aggregations
  const branchStats = {};
  const branches = ["cse", "da", "ec", "ee", "me", "ce"];
  for (const b of branches) {
    branchStats[b] = {
      branch: b,
      total: 0,
      accepted: 0,
      boilerplate: 0,
      needing_review: 0,
      no_solution: 0,
      missingTotal: 0,
      coveragePercent: "0.0",
      gaTotal: 0,
      gaMissing: 0,
      techTotal: 0,
      techMissing: 0,
      byEra: {
        modern: { total: 0, accepted: 0, missing: 0 },
        classic: { total: 0, accepted: 0, missing: 0 },
        vintage: { total: 0, accepted: 0, missing: 0 },
      },
    };
  }

  for (const item of inventory) {
    const s = branchStats[item.branch];
    if (!s) continue;
    s.total++;
    const isAccepted = item.classification === "accepted";

    if (isAccepted) {
      s.accepted++;
    } else if (item.classification === "boilerplate") {
      s.boilerplate++;
      s.missingTotal++;
    } else if (item.classification === "needing_review") {
      s.needing_review++;
      s.missingTotal++;
    } else {
      s.no_solution++;
      s.missingTotal++;
    }

    if (item.isGA) {
      s.gaTotal++;
      if (!isAccepted) s.gaMissing++;
    } else {
      s.techTotal++;
      if (!isAccepted) s.techMissing++;
    }

    if (s.byEra[item.era]) {
      s.byEra[item.era].total++;
      if (isAccepted) {
        s.byEra[item.era].accepted++;
      } else {
        s.byEra[item.era].missing++;
      }
    }
  }

  let totalQuestions = 0;
  let totalAccepted = 0;
  let totalMissing = 0;
  let totalBoilerplate = 0;
  let totalNeedingReview = 0;
  let totalNoSolution = 0;

  for (const b of branches) {
    const s = branchStats[b];
    s.coveragePercent = s.total > 0 ? ((s.accepted / s.total) * 100).toFixed(1) : "0.0";
    totalQuestions += s.total;
    totalAccepted += s.accepted;
    totalMissing += s.missingTotal;
    totalBoilerplate += s.boilerplate;
    totalNeedingReview += s.needing_review;
    totalNoSolution += s.no_solution;
  }

  const overallCoverage = totalQuestions > 0 ? ((totalAccepted / totalQuestions) * 100).toFixed(1) : "0.0";

  // Build report markdown
  const mdLines = [
    "# GATE Detailed Solution Baseline Audit Report",
    "",
    `> **Generated At**: ${new Date().toISOString()}`,
    `> **Total Unique Questions Across Platform**: ${totalQuestions.toLocaleString()}`,
    `> **Overall Solution Coverage**: ${overallCoverage}% (${totalAccepted.toLocaleString()} Accepted / ${totalMissing.toLocaleString()} Missing)`,
    `> **Deduplicated Aliases / Cross-Ingestions Filtered**: ${duplicates.length}`,
    "",
    "---",
    "",
    "## 1. Branch-Wise Reconciled Summary",
    "",
    "| Branch | Total Questions | Accepted Solutions | No Solution | Boilerplate | Needing Review | Total Missing | Live Coverage |",
    "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
  ];

  for (const b of branches) {
    const s = branchStats[b];
    mdLines.push(
      `| **${b.toUpperCase()}** | ${s.total.toLocaleString()} | ${s.accepted.toLocaleString()} | ${s.no_solution.toLocaleString()} | ${s.boilerplate.toLocaleString()} | ${s.needing_review.toLocaleString()} | **${s.missingTotal.toLocaleString()}** | **${s.coveragePercent}%** |`
    );
  }

  mdLines.push(
    `| **Total** | **${totalQuestions.toLocaleString()}** | **${totalAccepted.toLocaleString()}** | **${totalNoSolution.toLocaleString()}** | **${totalBoilerplate.toLocaleString()}** | **${totalNeedingReview.toLocaleString()}** | **${totalMissing.toLocaleString()}** | **${overallCoverage}%** |`,
    "",
    "---",
    "",
    "## 2. General Aptitude (GA) vs Technical Breakdown",
    "",
    "| Branch | GA Total | GA Missing | GA Accepted | Tech Total | Tech Missing | Tech Accepted | Total Missing |",
    "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
  );

  for (const b of branches) {
    const s = branchStats[b];
    const gaAcc = s.gaTotal - s.gaMissing;
    const techAcc = s.techTotal - s.techMissing;
    mdLines.push(
      `| **${b.toUpperCase()}** | ${s.gaTotal.toLocaleString()} | ${s.gaMissing.toLocaleString()} | ${gaAcc.toLocaleString()} | ${s.techTotal.toLocaleString()} | ${s.techMissing.toLocaleString()} | ${techAcc.toLocaleString()} | **${s.missingTotal.toLocaleString()}** |`
    );
  }

  mdLines.push(
    "",
    "---",
    "",
    "## 3. Era-Wise Breakdown (Modern vs Classic vs Vintage)",
    "",
    "| Branch | Modern (2014–2026) Missing / Total | Classic (2001–2013) Missing / Total | Vintage (1987–2000) Missing / Total | Total Missing |",
    "| :--- | :--- | :--- | :--- | :--- |"
  );

  for (const b of branches) {
    const s = branchStats[b];
    const mod = `${s.byEra.modern.missing.toLocaleString()} / ${s.byEra.modern.total.toLocaleString()}`;
    const cls = `${s.byEra.classic.missing.toLocaleString()} / ${s.byEra.classic.total.toLocaleString()}`;
    const vin = `${s.byEra.vintage.missing.toLocaleString()} / ${s.byEra.vintage.total.toLocaleString()}`;
    mdLines.push(`| **${b.toUpperCase()}** | ${mod} | ${cls} | ${vin} | **${s.missingTotal.toLocaleString()}** |`);
  }

  // Calculate clean phase assignments based on exact numbers
  const phase1_da_missing = branchStats.da.missingTotal;
  const phase1_ga_eng_missing = branchStats.ec.gaMissing + branchStats.ee.gaMissing + branchStats.me.gaMissing + branchStats.ce.gaMissing;
  const phase1_total = phase1_da_missing + phase1_ga_eng_missing;

  // Modern Technical (excluding GA)
  // Note: Modern GA is included in GA total
  const phase2_ec = Math.max(0, branchStats.ec.byEra.modern.missing - branchStats.ec.gaMissing);
  const phase2_ee = Math.max(0, branchStats.ee.byEra.modern.missing - branchStats.ee.gaMissing);
  const phase2_me = Math.max(0, branchStats.me.byEra.modern.missing - branchStats.me.gaMissing);
  const phase2_ce = Math.max(0, branchStats.ce.byEra.modern.missing - branchStats.ce.gaMissing);
  const phase2_total = phase2_ec + phase2_ee + phase2_me + phase2_ce;

  const phase3_ec = branchStats.ec.byEra.classic.missing;
  const phase3_ee = branchStats.ee.byEra.classic.missing;
  const phase3_me = branchStats.me.byEra.classic.missing;
  const phase3_ce = branchStats.ce.byEra.classic.missing;
  const phase3_total = phase3_ec + phase3_ee + phase3_me + phase3_ce;

  const phase4_cse_modern = branchStats.cse.byEra.modern.missing;
  const phase4_cse_classic = branchStats.cse.byEra.classic.missing;
  const phase4_total = phase4_cse_modern + phase4_cse_classic;

  const phase5_cse_vintage = branchStats.cse.byEra.vintage.missing;

  const questionsPerChunk = 25;

  mdLines.push(
    "",
    "---",
    "",
    "## 4. Reconciled Milestone & Phase Allocation",
    "",
    "The verified backlog maps cleanly to the 5 numbered authoring phases with zero overlap:",
    "",
    `| Phase | Scope & Description | Target Branches | Reconciled Missing Qs | Estimated Chunks (25 Qs/chunk) |`,
    `| :--- | :--- | :--- | :--- | :--- |`,
    `| **Phase 1** | DA Gaps + Engineering GA Gaps | DA, EC, EE, ME, CE | **${phase1_total}** (${phase1_da_missing} DA + ${phase1_ga_eng_missing} GA) | **${Math.ceil(phase1_total / questionsPerChunk)}** |`,
    `| **Phase 2** | Modern Engineering Technical Papers (2014–2026) | EC, EE, ME, CE | **${phase2_total}** (EC:${phase2_ec}, EE:${phase2_ee}, ME:${phase2_me}, CE:${phase2_ce}) | **${Math.ceil(phase2_total / questionsPerChunk)}** |`,
    `| **Phase 3** | Classic Engineering Technical Papers (2001–2013) | EC, EE, ME, CE | **${phase3_total}** (EC:${phase3_ec}, EE:${phase3_ee}, ME:${phase3_me}, CE:${phase3_ce}) | **${Math.ceil(phase3_total / questionsPerChunk)}** |`,
    `| **Phase 4** | CSE Modern & Mid Era Papers (2001–2026) | CSE | **${phase4_total}** (Modern:${phase4_cse_modern}, Classic:${phase4_cse_classic}) | **${Math.ceil(phase4_total / questionsPerChunk)}** |`,
    `| **Phase 5** | CSE Vintage Era (1987–2000) | CSE | **${phase5_cse_vintage}** | **${Math.ceil(phase5_cse_vintage / questionsPerChunk)}** |`,
    `| **Total** | **All 6 GATE Branches Reconciled** | **Platform Wide** | **${totalMissing.toLocaleString()}** | **${Math.ceil(totalMissing / questionsPerChunk)}** |`,
    ""
  );

  const reportMd = mdLines.join("\n");

  // Write markdown report
  const reportPath = path.join(ROOT, "docs", "generated", "SOLUTION_BASELINE_AUDIT.md");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportMd, "utf-8");

  // Write full backlog JSON
  const missingItems = inventory.filter((q) => q.classification !== "accepted");
  const backlogPath = path.join(ROOT, "data", "solutions", "reconciled-solution-backlog.json");
  fs.mkdirSync(path.dirname(backlogPath), { recursive: true });
  fs.writeFileSync(
    backlogPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalQuestions,
        totalAccepted,
        totalMissing,
        overallCoverage,
        branchStats,
        duplicatesFiltered: duplicates.length,
        missingQuestions: missingItems,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\n========================================================`);
  console.log(`📊 [RECONCILED SOLUTION BASELINE AUDIT COMPLETE]`);
  console.log(`   - Total Platform Questions: ${totalQuestions.toLocaleString()}`);
  console.log(`   - Accepted Solutions:       ${totalAccepted.toLocaleString()} (${overallCoverage}%)`);
  console.log(`   - Missing Solutions:        ${totalMissing.toLocaleString()}`);
  console.log(`     * No Solution:            ${totalNoSolution.toLocaleString()}`);
  console.log(`     * Boilerplate:            ${totalBoilerplate.toLocaleString()}`);
  console.log(`     * Needing Review:         ${totalNeedingReview.toLocaleString()}`);
  console.log(`   - Duplicates Filtered:      ${duplicates.length}`);
  console.log(`   - Report Saved:             ${reportPath}`);
  console.log(`   - Reconciled Backlog Saved: ${backlogPath}`);
  console.log(`========================================================\n`);

  return { totalQuestions, totalAccepted, totalMissing, overallCoverage, branchStats, phaseTotals: { phase1: phase1_total, phase2: phase2_total, phase3: phase3_total, phase4: phase4_total, phase5: phase5_cse_vintage } };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAudit();
}
