#!/usr/bin/env node

/**
 * scripts/pipeline/purge-synthetic-boilerplate.mjs
 * ------------------------------------------------
 * Purges nonsensical synthetic boilerplate ("Reviewing the physical principles,
 * constitutive laws, and system relationships...", "boundary constraints, circuit/state relations")
 * from all static shards and solution repositories.
 *
 * Keeps all authentic derivations (PracticePaper derivations and AUTHENTIC_PATCHES).
 * Questions without an authentic derivation will have detailed_solution set to null,
 * cleanly directing students to the GateOverflow community solution button and Ask AI.
 */

import fs from "fs";
import path from "path";
import { AUTHENTIC_PATCHES, applyAuthenticPatches } from "./patch-authentic-solutions.mjs";

const BOILERPLATE_MARKERS = [
  "Conceptual Framework & Principles",
  "constitutive laws",
  "physical principles, constitutive laws",
  "The alternative options fail to satisfy the necessary boundary conditions, dimensional units, or physical operating constraints.",
  "Analyzing boundary constraints, circuit/state relations, or transfer relationships according to official GATE syllabus standards."
];

function isBoilerplate(text) {
  if (!text || typeof text !== "string") return false;
  return BOILERPLATE_MARKERS.some((marker) => text.includes(marker));
}

export function purgeBoilerplate() {
  console.log("=== Step 1: Applying Authentic Patches ===");
  applyAuthenticPatches();

  console.log("\n=== Step 2: Purging Boilerplate from Question Detail Shards ===");
  const shardsDir = path.resolve("public/question-detail-shards");
  const shardFiles = fs.readdirSync(shardsDir).filter((f) => f.endsWith(".json"));

  let totalPurgedShards = 0;
  let modifiedShards = 0;

  for (const file of shardFiles) {
    const filePath = path.join(shardsDir, file);
    const shard = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!shard.recordsByQuestionUid) continue;

    let modified = false;

    for (const [uid, q] of Object.entries(shard.recordsByQuestionUid)) {
      if (AUTHENTIC_PATCHES[uid]) continue; // Kept via authentic patch

      const md = q.detailed_solution?.markdown || "";
      if (isBoilerplate(md)) {
        q.detailed_solution = null;
        modified = true;
        totalPurgedShards++;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(shard, null, 2), "utf8");
      modifiedShards++;
    }
  }

  console.log(`Purged synthetic boilerplate from ${totalPurgedShards} questions across ${modifiedShards} shards.`);

  console.log("\n=== Step 3: Purging Boilerplate from data/solutions/ ===");
  const ppAllPath = path.resolve("data/solutions/practicepaper/all-solutions.json");
  if (fs.existsSync(ppAllPath)) {
    const ppAll = JSON.parse(fs.readFileSync(ppAllPath, "utf8"));
    let ppPurged = 0;
    for (const [uid, item] of Object.entries(ppAll)) {
      if (AUTHENTIC_PATCHES[uid]) continue;
      if (isBoilerplate(item.detailed_solution)) {
        item.has_detailed_solution = false;
        item.detailed_solution = null;
        ppPurged++;
      }
    }
    fs.writeFileSync(ppAllPath, JSON.stringify(ppAll, null, 2), "utf8");
    console.log(`Purged ${ppPurged} entries in all-solutions.json.`);
  }

  const v1Files = ["ce-v1.json", "ec-v1.json", "ee-v1.json", "me-v1.json", "cse-v1.json", "da-v1.json"];
  for (const v1File of v1Files) {
    const v1Path = path.resolve("data/solutions", v1File);
    if (!fs.existsSync(v1Path)) continue;
    const v1Data = JSON.parse(fs.readFileSync(v1Path, "utf8"));
    let v1Purged = 0;
    for (const [uid, item] of Object.entries(v1Data)) {
      if (AUTHENTIC_PATCHES[uid]) continue;
      if (isBoilerplate(item.solution_markdown)) {
        delete v1Data[uid];
        v1Purged++;
      }
    }
    fs.writeFileSync(v1Path, JSON.stringify(v1Data, null, 2), "utf8");
    console.log(`Purged ${v1Purged} entries in data/solutions/${v1File}.`);
  }

  console.log("\n=== Synthetic Boilerplate Purge Complete ===");
}

if (process.argv[1] && process.argv[1].includes("purge-synthetic-boilerplate")) {
  purgeBoilerplate();
}
