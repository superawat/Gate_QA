import fs from "node:fs";
import path from "node:path";

import { CHUNK_EE_MOD_02_SOLUTIONS } from "./apply-chunk-ee-mod-02.mjs";
import { CHUNK_EE_MOD_03_SOLUTIONS } from "./apply-chunk-ee-mod-03.mjs";
import { CHUNK_EE_MOD_04_SOLUTIONS } from "./apply-chunk-ee-mod-04.mjs";
import { CHUNK_EE_MOD_05_SOLUTIONS } from "./apply-chunk-ee-mod-05.mjs";
import { CHUNK_EC_MOD_04_SOLUTIONS } from "./apply-chunk-ec-mod-04.mjs";
import { CHUNK_EC_MOD_05_SOLUTIONS } from "./apply-chunk-ec-mod-05.mjs";
import { CHUNK_EC_MOD_03_SOLUTIONS } from "./apply-ec-patches.mjs";
import { CHUNK_CSE_REC_01_TO_05_SOLUTIONS } from "./apply-chunk-cse-rec-01-to-05.mjs";
import { CHUNK_CSE_REC_06_TO_10_SOLUTIONS } from "./apply-chunk-cse-rec-06-to-10.mjs";
import { CHUNK_CSE_REC_11_SOLUTIONS } from "./apply-chunk-cse-rec-11.mjs";
import { CHUNK_CSE_DSA_01_TO_02_SOLUTIONS } from "./apply-chunk-cse-dsa-01-to-02.mjs";
import { CHUNK_CSE_DSA_03_TO_06_SOLUTIONS } from "./apply-chunk-cse-dsa-03-to-06.mjs";
import { CHUNK_CSE_DSA_07_TO_10_SOLUTIONS } from "./apply-chunk-cse-dsa-07-to-10.mjs";
import { CHUNK_CSE_DSA_11_TO_13_SOLUTIONS } from "./apply-chunk-cse-dsa-11-to-13.mjs";
import { CHUNK_CSE_DSA_14_TO_16_SOLUTIONS } from "./apply-chunk-cse-dsa-14-to-16.mjs";
import { CHUNK_CSE_DSA_17_TO_20_SOLUTIONS } from "./apply-chunk-cse-dsa-17-to-20.mjs";
import { CHUNK_CSE_TOC_01_TO_05_SOLUTIONS } from "./apply-chunk-cse-toc-01-to-05.mjs";
import { CHUNK_CSE_TOC_06_TO_10_SOLUTIONS } from "./apply-chunk-cse-toc-06-to-10.mjs";
import { CHUNK_CSE_TOC_11_TO_15_SOLUTIONS } from "./apply-chunk-cse-toc-11-to-15.mjs";
import { CHUNK_CSE_SYS_01_TO_05_SOLUTIONS } from "./apply-chunk-cse-sys-01-to-05.mjs";
import { CHUNK_CSE_SYS_06_TO_10_SOLUTIONS } from "./apply-chunk-cse-sys-06-to-10.mjs";
import { CHUNK_CSE_SYS_11_TO_15_SOLUTIONS } from "./apply-chunk-cse-sys-11-to-15.mjs";
import { CHUNK_CSE_SYS_16_TO_19 } from "./apply-chunk-cse-sys-16-to-19.mjs";
import { CHUNK_CSE_SYS_20_TO_24 } from "./apply-chunk-cse-sys-20-to-24.mjs";
import { CHUNK_CSE_SYS_25_TO_30 } from "./apply-chunk-cse-sys-25-to-30.mjs";
import { CHUNK_CSE_HW_01_TO_04 } from "./apply-chunk-cse-hw-01-to-04.mjs";
import { CHUNK_CSE_HW_05_TO_07 } from "./apply-chunk-cse-hw-05-to-07.mjs";
import { CHUNK_CSE_HW_08_TO_10 } from "./apply-chunk-cse-hw-08-to-10.mjs";
import { CHUNK_CSE_HW_11_TO_13 } from "./apply-chunk-cse-hw-11-to-13.mjs";
import { CHUNK_CSE_HW_14_TO_16 } from "./apply-chunk-cse-hw-14-to-16.mjs";
import { CHUNK_CSE_MATH_08_SOLUTIONS } from "./apply-chunk-cse-math-08.mjs";
import { CHUNK_CSE_MATH_09_SOLUTIONS } from "./apply-chunk-cse-math-09.mjs";
import { CHUNK_CSE_MATH_10_SOLUTIONS } from "./apply-chunk-cse-math-10.mjs";


const ROOT = process.cwd();
const patchesFile = path.join(ROOT, "scripts", "pipeline", "patch-authentic-solutions.mjs");
let content = fs.readFileSync(patchesFile, "utf-8");

const allSolutionSources = [
  CHUNK_EE_MOD_02_SOLUTIONS,
  CHUNK_EE_MOD_03_SOLUTIONS,
  CHUNK_EE_MOD_04_SOLUTIONS,
  CHUNK_EE_MOD_05_SOLUTIONS,
  CHUNK_EC_MOD_04_SOLUTIONS,
  CHUNK_EC_MOD_05_SOLUTIONS,
  CHUNK_EC_MOD_03_SOLUTIONS,
  CHUNK_CSE_REC_01_TO_05_SOLUTIONS,
  CHUNK_CSE_REC_06_TO_10_SOLUTIONS,
  CHUNK_CSE_REC_11_SOLUTIONS,
  CHUNK_CSE_DSA_01_TO_02_SOLUTIONS,
  CHUNK_CSE_DSA_03_TO_06_SOLUTIONS,
  CHUNK_CSE_DSA_07_TO_10_SOLUTIONS,
  CHUNK_CSE_DSA_11_TO_13_SOLUTIONS,
  CHUNK_CSE_DSA_14_TO_16_SOLUTIONS,
  CHUNK_CSE_DSA_17_TO_20_SOLUTIONS,
  CHUNK_CSE_TOC_01_TO_05_SOLUTIONS,
  CHUNK_CSE_TOC_06_TO_10_SOLUTIONS,
  CHUNK_CSE_TOC_11_TO_15_SOLUTIONS,
  CHUNK_CSE_SYS_01_TO_05_SOLUTIONS,
  CHUNK_CSE_SYS_06_TO_10_SOLUTIONS,
  CHUNK_CSE_SYS_11_TO_15_SOLUTIONS,
  CHUNK_CSE_SYS_16_TO_19,
  CHUNK_CSE_SYS_20_TO_24,
  CHUNK_CSE_SYS_25_TO_30,
  CHUNK_CSE_HW_01_TO_04,
  CHUNK_CSE_HW_05_TO_07,
  CHUNK_CSE_HW_08_TO_10,
  CHUNK_CSE_HW_11_TO_13,
  CHUNK_CSE_HW_14_TO_16,
  CHUNK_CSE_MATH_08_SOLUTIONS,
  CHUNK_CSE_MATH_09_SOLUTIONS,
  CHUNK_CSE_MATH_10_SOLUTIONS,
];

// Combine all solutions into a unified map
const combinedMap = new Map();
for (const source of allSolutionSources) {
  for (const [uid, sol] of Object.entries(source)) {
    combinedMap.set(uid, sol);
  }
}

console.log(`Loaded ${combinedMap.size} unique solutions across all authored chunks.`);

const toAdd = [];
let alreadyPresent = 0;

for (const [uid, sol] of combinedMap.entries()) {
  if (content.includes(`"${uid}":`)) {
    alreadyPresent++;
  } else {
    toAdd.push(`  "${uid}": ${JSON.stringify(sol, null, 2)},`);
  }
}

console.log(`Already in patch file: ${alreadyPresent}`);
console.log(`New to inject: ${toAdd.length}`);

if (toAdd.length > 0) {
  const marker = "export const AUTHENTIC_PATCHES = {";
  const markerIdx = content.indexOf(marker);
  if (markerIdx === -1) {
    throw new Error("Could not find AUTHENTIC_PATCHES marker in file!");
  }
  const insertPos = markerIdx + marker.length;
  const newContent = content.slice(0, insertPos) + "\n" + toAdd.join("\n\n") + "\n\n" + content.slice(insertPos);
  fs.writeFileSync(patchesFile, newContent, "utf-8");
  console.log(`✅ Successfully injected ${toAdd.length} verified solutions into patch-authentic-solutions.mjs`);
} else {
  console.log("No new solutions needed injection.");
}
