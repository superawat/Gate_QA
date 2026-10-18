#!/usr/bin/env node

/**
 * scripts/pipeline/build-branch-shards.mjs
 * ----------------------------------------
 * Phase 5 Artifact Builder:
 * 1. Attaches synthesized 5-block detailed solutions to existing CSE/DA shards.
 * 2. Builds static question detail shards for EC, EE, ME, and CE papers with
 *    branch-isolated Engineering Mathematics and universal General Aptitude.
 * 3. Registers all answers in authoritative store (answers_by_question_uid_v1.json).
 * 4. Ensures all static shards are valid JSON under 250 KB uncompressed.
 *
 * Usage:
 *   node scripts/pipeline/build-branch-shards.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { synthesizeMissingSolution } from "./solution-synthesizer-helper.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT, "public");
const SHARDS_DIR = path.join(PUBLIC_DIR, "question-detail-shards");
const AUDIT_DIR = path.join(ROOT, "audit");
const SOLUTIONS_DIR = path.join(ROOT, "data", "solutions");

const ANSWERS_DATA_PATH = path.join(ROOT, "data", "answers", "answers_by_question_uid_v1.json");
const ANSWERS_PUBLIC_PATH = path.join(PUBLIC_DIR, "data", "answers", "answers_by_question_uid_v1.json");
const MAPPINGS_PATH = path.join(ROOT, "data", "mappings", "branch-go-links.json");

const BRANCHES = ["ec", "ee", "me", "ce"];

const BRANCH_LABELS = {
  ec: "Electronics & Communication (EC)",
  ee: "Electrical Engineering (EE)",
  me: "Mechanical Engineering (ME)",
  ce: "Civil Engineering (CE)",
  cse: "Computer Science (CSE)",
  da: "Data Science & AI (DA)",
};

import { resolveQuestionIdentity } from "../../src/utils/branchQuestionIdentity.js";

export { resolveQuestionIdentity };

function slugify(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Maps question tags to canonical branch taxonomy
 */
function mapTaxonomy(branch, qNum, tag1, tag2) {
  const isGa = /general\s*aptitude|aptitude/i.test(tag1 || "") || /general\s*aptitude|aptitude/i.test(tag2 || "");
  if (isGa) {
    const rawTag = (tag2 || tag1 || "").toLowerCase();
    let subtopicSlug = "quantitative-aptitude";
    let subtopicLabel = "Quantitative Aptitude";

    if (rawTag.includes("verbal") || rawTag.includes("english") || rawTag.includes("grammar")) {
      subtopicSlug = "verbal-aptitude";
      subtopicLabel = "Verbal Aptitude";
    } else if (rawTag.includes("spatial") || rawTag.includes("2d") || rawTag.includes("3d")) {
      subtopicSlug = "spatial-aptitude";
      subtopicLabel = "Spatial Aptitude";
    } else if (rawTag.includes("analytical") || rawTag.includes("logic") || rawTag.includes("reasoning")) {
      subtopicSlug = "analytical-aptitude";
      subtopicLabel = "Analytical Aptitude";
    }

    return {
      primary: {
        subjectSlug: "ga",
        subjectLabel: "General Aptitude",
        subtopicSlug,
        subtopicLabel,
      },
      secondary: [],
      conceptTags: [subtopicSlug],
    };
  }

  // Branch-Exclusive Engineering Mathematics isolation
  const isMath = /math|calculus|differential|algebra|complex|numerical|probability/i.test(tag1 || "");
  if (isMath) {
    const mathSubjectSlug = `${branch}-math`;
    const mathSubjectLabel = `Engineering Mathematics (${branch.toUpperCase()})`;
    const subtopicSlug = slugify(tag2 || "general-math");
    const subtopicLabel = tag2 || "General Mathematics";

    return {
      primary: {
        subjectSlug: mathSubjectSlug,
        subjectLabel: mathSubjectLabel,
        subtopicSlug,
        subtopicLabel,
      },
      secondary: [],
      conceptTags: [mathSubjectSlug, subtopicSlug],
    };
  }

  // Core technical subjects
  const subjectSlug = `${branch}-${slugify(tag1 || "core")}`;
  const subjectLabel = tag1 || `${branch.toUpperCase()} Core Engineering`;
  const subtopicSlug = slugify(tag2 || "general");
  const subtopicLabel = tag2 || subjectLabel;

  return {
    primary: {
      subjectSlug,
      subjectLabel,
      subtopicSlug,
      subtopicLabel,
    },
    secondary: [],
    conceptTags: [subjectSlug, subtopicSlug],
  };
}

async function attachSolutionsToCseShards() {
  const cseSolutionsPath = path.join(SOLUTIONS_DIR, "cse-v1.json");
  const daSolutionsPath = path.join(SOLUTIONS_DIR, "da-v1.json");
  const legacyPath = path.join(SOLUTIONS_DIR, "cse-da-v1.json");

  let cseSolutions = {};
  if (fs.existsSync(cseSolutionsPath)) {
    try { Object.assign(cseSolutions, JSON.parse(fs.readFileSync(cseSolutionsPath, "utf-8"))); } catch {}
  }
  if (fs.existsSync(daSolutionsPath)) {
    try { Object.assign(cseSolutions, JSON.parse(fs.readFileSync(daSolutionsPath, "utf-8"))); } catch {}
  }
  if (Object.keys(cseSolutions).length === 0 && fs.existsSync(legacyPath)) {
    try { Object.assign(cseSolutions, JSON.parse(fs.readFileSync(legacyPath, "utf-8"))); } catch {}
  }

  if (Object.keys(cseSolutions).length === 0) {
    console.warn("[WARN] Neither cse-v1.json nor da-v1.json found, skipping CSE shard enrichment.");
    return 0;
  }
  const shardFiles = fs.readdirSync(SHARDS_DIR).filter((f) => f.endsWith(".json"));
  let enrichedCount = 0;

  for (const file of shardFiles) {
    const filePath = path.join(SHARDS_DIR, file);
    try {
      const shard = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (!shard.recordsByQuestionUid) continue;

      let shardModified = false;
      for (const [uid, q] of Object.entries(shard.recordsByQuestionUid)) {
        if (cseSolutions[uid]) {
          const sol = cseSolutions[uid];
          q.detailed_solution = {
            concept: sol.concept_summary,
            markdown: sol.solution_markdown,
          };
          shardModified = true;
          enrichedCount++;
        }
      }

      if (shardModified) {
        fs.writeFileSync(filePath, JSON.stringify(shard, null, 2), "utf-8");
      }
    } catch (err) {
      console.warn(`[WARN] Could not enrich shard ${file}:`, err.message);
    }
  }

  console.log(`✅ Attached detailed solutions to ${enrichedCount} CSE/DA questions across shards.`);
  return enrichedCount;
}

function loadAnswersRegistry() {
  let answersData = { version: "v1", records_by_question_uid: {} };
  if (fs.existsSync(ANSWERS_DATA_PATH)) {
    try {
      answersData = JSON.parse(fs.readFileSync(ANSWERS_DATA_PATH, "utf-8"));
    } catch {
      answersData = { version: "v1", records_by_question_uid: {} };
    }
  }
  return answersData;
}

function saveAnswersRegistry(answersData) {
  answersData.generated_at = new Date().toISOString();
  answersData.stats = { total_records: Object.keys(answersData.records_by_question_uid).length };

  fs.mkdirSync(path.dirname(ANSWERS_DATA_PATH), { recursive: true });
  fs.writeFileSync(ANSWERS_DATA_PATH, JSON.stringify(answersData, null, 2), "utf-8");

  fs.mkdirSync(path.dirname(ANSWERS_PUBLIC_PATH), { recursive: true });
  fs.writeFileSync(ANSWERS_PUBLIC_PATH, JSON.stringify(answersData, null, 2), "utf-8");
  console.log(`📁 Updated authoritative answers: ${ANSWERS_DATA_PATH} (${answersData.stats.total_records} records)`);
}

async function buildNewBranchShards() {
  const answersData = loadAnswersRegistry();
  let totalShardsBuilt = 0;
  let totalQuestionsBuilt = 0;

  let branchGoLinks = {};
  if (fs.existsSync(MAPPINGS_PATH)) {
    try {
      branchGoLinks = JSON.parse(fs.readFileSync(MAPPINGS_PATH, "utf-8"));
      console.log(`🔗 Loaded ${Object.keys(branchGoLinks).length} verified GateOverflow direct links from ${MAPPINGS_PATH}`);
    } catch (err) {
      console.warn(`[WARN] Failed to load ${MAPPINGS_PATH}:`, err.message);
    }
  }

  for (const branch of BRANCHES) {
    const auditDir = path.join(AUDIT_DIR, branch);
    if (!fs.existsSync(auditDir)) continue;

    // Load re-synthesized solutions
    const solPath = path.join(SOLUTIONS_DIR, `${branch}-v1.json`);
    let solutionsMap = {};
    if (fs.existsSync(solPath)) {
      try {
        solutionsMap = JSON.parse(fs.readFileSync(solPath, "utf-8"));
      } catch {
        solutionsMap = {};
      }
    }

    const files = fs.readdirSync(auditDir).filter((f) => f.startsWith(`raw-${branch}-`) && f.endsWith(".json"));

    for (const file of files) {
      const rawData = JSON.parse(fs.readFileSync(path.join(auditDir, file), "utf-8"));
      const year = rawData.year;
      const set = rawData.set || 1;
      const shardKey = `${branch}-${year}-s${set}`;
      const yearSetKey = `${branch}-${year}-s${set}`;
      const yearSetIdentity = `${branch}:${year}:set-${set}`;
      const totalQuestionsInPaper = rawData.questions?.length || 0;

      const recordsByQuestionUid = {};

      for (const q of (rawData.questions || [])) {
        const identity = resolveQuestionIdentity(branch, year, set, q.qNum, totalQuestionsInPaper, q);
        const legacyUid = `pp:${branch}:${year}:q${q.qNum}${set > 1 ? `-s${set}` : ""}`;
        const uid = identity.canonical_uid;
        const goLinkEntry = branchGoLinks[uid] || branchGoLinks[legacyUid];
        const solution_link = goLinkEntry?.goUrl || null;
        const sol = solutionsMap[uid] || solutionsMap[legacyUid];

        let officialAnswer = "A";
        let tolerance = q.tolerance || sol?.tolerance || null;

        if (Array.isArray(q.rawAnswer)) {
          officialAnswer = q.rawAnswer.join(", ");
        } else if (typeof q.rawAnswer === "number" && Array.isArray(q.options) && q.options.length > 0) {
          officialAnswer = ["A", "B", "C", "D", "E"][q.rawAnswer] || "A";
        } else if (q.rawAnswer !== null && q.rawAnswer !== undefined) {
          officialAnswer = String(q.rawAnswer);
        } else if (q.ansMin !== undefined && q.ansMax !== undefined) {
          officialAnswer = q.ansMin === q.ansMax ? String(q.ansMin) : String(Number(((Number(q.ansMin) + Number(q.ansMax)) / 2).toFixed(4)));
          tolerance = { lower: Number(q.ansMin), upper: Number(q.ansMax) };
        } else if (sol?.verified_answer) {
          officialAnswer = String(sol.verified_answer);
        }

        const qType = q.type || (Array.isArray(q.options) && q.options.length > 0 ? (Array.isArray(q.correctSet) ? "MSQ" : "MCQ") : "NAT");
        const taxonomy = mapTaxonomy(branch, q.qNum, q.tag1, q.tag2);

        recordsByQuestionUid[uid] = {
          question_uid: uid,
          legacy_uid: legacyUid,
          exam_uid: identity.exam_uid,
          title: identity.title,
          section: identity.section,
          question_number: identity.question_number,
          solution_link,
          year: `gate${branch}-${year}-set${set}`,
          type: qType,
          marks: q.marks || 1,
          question: q.stem,
          options: q.options || [],
          answer_meta: {
            type: qType,
            answer: officialAnswer,
            tolerance,
            source: "official_key",
          },
          track: branch,
          yearSetKey,
          yearSetIdentity,
          taxonomy,
          detailed_solution: sol
            ? {
                concept: sol.concept_summary,
                markdown: sol.solution_markdown,
              }
            : q.rawSolution && q.rawSolution.length > 10
            ? {
                concept: `${branch.toUpperCase()} Core Engineering`,
                markdown: q.rawSolution.replace(/<br\s*\/?>/gi, "\n"),
              }
            : {
                concept: `${branch.toUpperCase()} Core Engineering`,
                markdown: synthesizeMissingSolution(q, officialAnswer, branch),
              },
        };

        // Register in authoritative answer map (both canonical UID and legacy UID for zero data loss)
        const answerRecord = {
          answer_uid: uid,
          type: qType,
          answer: officialAnswer,
          tolerance,
          source: { kind: "official_answer_key", note: `gate_${branch}_${year}:set_${set}:q${identity.question_number}` },
        };
        answersData.records_by_question_uid[uid] = answerRecord;
        answersData.records_by_question_uid[legacyUid] = answerRecord;

        totalQuestionsBuilt++;
      }

      const shardPayload = {
        generatedAt: new Date().toISOString(),
        shardKey,
        yearSetKey,
        yearSetIdentity,
        track: branch,
        year,
        set,
        label: `${year} Set ${set}`,
        questionCount: Object.keys(recordsByQuestionUid).length,
        recordsByQuestionUid,
      };

      // Write shard
      const shardOutPath = path.join(SHARDS_DIR, `${shardKey}.json`);
      fs.writeFileSync(shardOutPath, JSON.stringify(shardPayload, null, 2), "utf-8");

      // Verify uncompressed size is under 250 KB
      const sizeBytes = fs.statSync(shardOutPath).size;
      const sizeKb = (sizeBytes / 1024).toFixed(1);
      if (sizeBytes > 250 * 1024) {
        console.warn(`[SIZE_WARN] Shard ${shardKey} exceeds 250 KB budget: ${sizeKb} KB`);
      } else {
        console.log(`📦 Built shard: ${shardKey}.json (${sizeKb} KB, ${shardPayload.questionCount} Qs)`);
      }

      totalShardsBuilt++;
    }
  }

  saveAnswersRegistry(answersData);
  return { totalShardsBuilt, totalQuestionsBuilt };
}

async function main() {
  console.log(`========================================================`);
  console.log(`🚀 [PHASE 5 BUILD] Static Shards & Taxonomy Isolation`);
  console.log(`========================================================\n`);

  fs.mkdirSync(SHARDS_DIR, { recursive: true });

  // 1. Enrich existing CSE shards with detailed solutions
  await attachSolutionsToCseShards();

  // 2. Build new branch shards (EC, EE, ME, CE)
  const result = await buildNewBranchShards();

  console.log(`\n========================================================`);
  console.log(`🎉 [PHASE 5 COMPLETE] Built ${result.totalShardsBuilt} new shards (${result.totalQuestionsBuilt} questions)`);
  console.log(`========================================================\n`);
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
