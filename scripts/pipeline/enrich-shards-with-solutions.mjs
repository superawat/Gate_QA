#!/usr/bin/env node

/**
 * scripts/pipeline/enrich-shards-with-solutions.mjs
 * -------------------------------------------------
 * Enriches all static question detail shards in `public/question-detail-shards/`
 * with authentic step-by-step mathematical derivations and local diagrams.
 *
 * Priority Resolution:
 *   1. Authentic derivations parsed from `data/solutions/practicepaper/all-solutions.json`
 *      (contains 10,231 verified PracticePaper solutions across CSE, DA, EC, EE, ME, CE)
 *   2. Existing `q.detailed_solution` in shard (if already present and valid)
 *   3. Academic derivations from `data/solutions/{branch}-v1.json` (for older CSE/IT/DA papers)
 *
 * Usage:
 *   node scripts/pipeline/enrich-shards-with-solutions.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SHARDS_DIR = path.join(ROOT, "public", "question-detail-shards");
const PP_ALL_PATH = path.join(ROOT, "data", "solutions", "practicepaper", "all-solutions.json");
const SOLUTIONS_DIR = path.join(ROOT, "data", "solutions");

import { AUTHENTIC_PATCHES } from "./patch-authentic-solutions.mjs";

const BOILERPLATE_MARKERS = [
  "Conceptual Framework & Principles",
  "constitutive laws",
  "physical principles, constitutive laws",
  "The alternative options fail to satisfy the necessary boundary conditions, dimensional units, or physical operating constraints.",
  "Analyzing boundary constraints, circuit/state relations, or transfer relationships according to official GATE syllabus standards.",
  "Therefore, the correct answer is **Option MTA**.",
];

function isBoilerplate(text) {
  if (!text || typeof text !== "string") return false;
  return BOILERPLATE_MARKERS.some((marker) => text.includes(marker));
}

export function loadAllSolutionsMap() {
  const map = new Map();

  // 1. Fallback: Load v1 solutions first
  const v1Files = ["cse-v1.json", "da-v1.json", "ec-v1.json", "ee-v1.json", "me-v1.json", "ce-v1.json"];
  for (const fileName of v1Files) {
    const filePath = path.join(SOLUTIONS_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      for (const [uid, item] of Object.entries(data)) {
        if (item?.solution_markdown && !isBoilerplate(item.solution_markdown)) {
          map.set(uid, {
            concept: item.concept_summary || "",
            markdown: item.solution_markdown,
            images: [],
            source: "v1_academic",
          });
        }
      }
    } catch (e) {
      console.warn(`[WARN] Failed to read ${fileName}:`, e.message);
    }
  }

  // 2. High Priority: Override with authentic PracticePaper solutions
  if (fs.existsSync(PP_ALL_PATH)) {
    try {
      const ppData = JSON.parse(fs.readFileSync(PP_ALL_PATH, "utf-8"));
      for (const [uid, item] of Object.entries(ppData)) {
        if (item.has_detailed_solution && item.detailed_solution && !isBoilerplate(item.detailed_solution)) {
          map.set(uid, {
            concept: map.get(uid)?.concept || "",
            markdown: item.detailed_solution,
            images: Array.isArray(item.images) ? item.images : [],
            source: "practicepaper_authentic",
          });
        }
      }
    } catch (e) {
      console.warn(`[WARN] Failed to read ${PP_ALL_PATH}:`, e.message);
    }
  }

  // 3. Highest Priority: Override with AUTHENTIC_PATCHES
  for (const [uid, patch] of Object.entries(AUTHENTIC_PATCHES)) {
    map.set(uid, {
      concept: patch.concept || "",
      markdown: patch.markdown,
      images: patch.images || [],
      source: "verified_patch",
    });
  }

  return map;
}

export function enrichShardsWithSolutions(shardsDir = SHARDS_DIR) {
  const solutionsMap = loadAllSolutionsMap();
  console.log(`[SOLUTIONS] Loaded ${solutionsMap.size} detailed solutions into registry.`);

  const shardFiles = fs.readdirSync(shardsDir).filter((f) => f.endsWith(".json"));

  let totalQuestions = 0;
  let enrichedFromPp = 0;
  let enrichedFromV1 = 0;
  let retainedExisting = 0;
  let purgedBoilerplateCount = 0;
  let shardsModified = 0;

  for (const file of shardFiles) {
    const filePath = path.join(shardsDir, file);
    let shard;
    try {
      shard = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      continue;
    }

    if (!shard.recordsByQuestionUid) continue;

    let modified = false;

    for (const [uid, q] of Object.entries(shard.recordsByQuestionUid)) {
      totalQuestions++;

      const sol = solutionsMap.get(uid);

      if (sol && (sol.source === "practicepaper_authentic" || sol.source === "verified_patch")) {
        // Authentic derivation takes priority
        const concept = q.taxonomy?.primary?.subtopicLabel
          ? `${q.taxonomy.primary.subjectLabel} - ${q.taxonomy.primary.subtopicLabel}`
          : q.taxonomy?.primary?.subjectLabel || sol.concept || "";

        const newSol = {
          concept: sol.concept || concept,
          markdown: sol.markdown,
          images: sol.images || [],
        };

        if (
          !q.detailed_solution ||
          q.detailed_solution.markdown !== newSol.markdown ||
          JSON.stringify(q.detailed_solution.images || []) !== JSON.stringify(newSol.images)
        ) {
          q.detailed_solution = newSol;
          modified = true;
          enrichedFromPp++;
        } else {
          retainedExisting++;
        }
      } else if (q.detailed_solution && isBoilerplate(q.detailed_solution.markdown)) {
        // Purge old synthetic boilerplate!
        q.detailed_solution = null;
        modified = true;
        purgedBoilerplateCount++;
      } else if (q.detailed_solution && q.detailed_solution.markdown) {
        // Keep existing valid authentic solution
        retainedExisting++;
      } else if (sol && sol.markdown) {
        // Fallback to academic v1 derivation
        q.detailed_solution = {
          concept: sol.concept || q.taxonomy?.primary?.subjectLabel || "",
          markdown: sol.markdown,
          images: sol.images || [],
        };
        modified = true;
        enrichedFromV1++;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(shard, null, 2), "utf-8");
      shardsModified++;
    }
  }


  const totalWithSolutions = enrichedFromPp + enrichedFromV1 + retainedExisting;
  const coveragePercent = totalQuestions > 0 ? ((totalWithSolutions / totalQuestions) * 100).toFixed(1) : "0.0";

  console.log(`\n========================================================`);
  console.log(`🎉 [SHARD ENRICHMENT COMPLETE]`);
  console.log(`   - Total Shards Modified: ${shardsModified} / ${shardFiles.length}`);
  console.log(`   - Total Questions Processed: ${totalQuestions}`);
  console.log(`   - Enriched with Authentic PracticePaper: ${enrichedFromPp}`);
  console.log(`   - Enriched from Academic Fallback (v1): ${enrichedFromV1}`);
  console.log(`   - Retained Existing Valid Solutions: ${retainedExisting}`);
  console.log(`   - Final Solution Coverage: ${totalWithSolutions} / ${totalQuestions} (${coveragePercent}%)`);
  console.log(`========================================================\n`);

  return {
    totalQuestions,
    totalWithSolutions,
    enrichedFromPp,
    enrichedFromV1,
    retainedExisting,
    shardsModified,
    coveragePercent,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  enrichShardsWithSolutions();
}
