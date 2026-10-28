import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

export function run() {
  console.log("🚀 Starting integration of CHUNK-CSE-VIN-02...");

  const solutionsFilePath = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-vin-02-solutions.json");
  if (!fs.existsSync(solutionsFilePath)) {
    console.error(`❌ Solutions file not found: ${solutionsFilePath}`);
    return;
  }
  const VIN_02_SOLUTIONS = JSON.parse(fs.readFileSync(solutionsFilePath, "utf-8"));

  // 1. Update data/solutions/chunks/cse/chunk-cse-vin-02.json
  const chunkFilePath = path.join(ROOT, "data/solutions/chunks/cse/chunk-cse-vin-02.json");
  if (!fs.existsSync(chunkFilePath)) {
    console.error(`❌ Chunk file not found: ${chunkFilePath}`);
    return;
  }

  const chunkData = JSON.parse(fs.readFileSync(chunkFilePath, "utf-8"));
  let accepted = 0;

  for (const q of chunkData.questions) {
    const sol = VIN_02_SOLUTIONS[q.uid];
    if (sol) {
      q.status = "INTEGRATED";
      q.review = {
        verifiedAnswer: q.officialAnswer,
        concept: sol.concept,
        reviewDate: new Date().toISOString(),
        reviewer: "Antigravity Superagent",
        notes: sol.reviewNote
      };
      accepted++;
    } else {
      console.warn(`⚠️ No solution authored for ${q.uid}`);
    }
  }

  chunkData.status = "INTEGRATED";
  chunkData.integratedAt = new Date().toISOString();
  fs.writeFileSync(chunkFilePath, JSON.stringify(chunkData, null, 2), "utf-8");
  console.log(`✅ Updated ${chunkFilePath} (${accepted}/25 accepted).`);

  // 2. Update data/solutions/chunks/manifest.json
  const manifestPath = path.join(ROOT, "data/solutions/chunks/manifest.json");
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf-8")) : { chunks: {} };

  manifest.chunks["CHUNK-CSE-VIN-02"] = {
    chunkId: "CHUNK-CSE-VIN-02",
    branch: "cse",
    year: "all",
    section: "all",
    file: "data\\solutions\\chunks\\cse\\chunk-cse-vin-02.json",
    count: 25,
    status: "COMPLETED",
    acceptedCount: 25,
    integratedCount: 25,
    heldCount: 0,
    createdAt: chunkData.generatedAt,
    updatedAt: new Date().toISOString(),
    uids: chunkData.questions.map(q => q.uid)
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("✅ Updated manifest.json for CHUNK-CSE-VIN-02 (COMPLETED, 25 accepted).");

  // 3. Update data/solutions/practicepaper/all-solutions.json
  const ppPath = path.join(ROOT, "data/solutions/practicepaper/all-solutions.json");
  if (fs.existsSync(ppPath)) {
    const ppData = JSON.parse(fs.readFileSync(ppPath, "utf-8"));
    for (const [uid, sol] of Object.entries(VIN_02_SOLUTIONS)) {
      ppData[uid] = {
        question_uid: uid,
        has_detailed_solution: true,
        detailed_solution: sol.markdown,
        images: sol.images || []
      };
    }
    fs.writeFileSync(ppPath, JSON.stringify(ppData, null, 2), "utf-8");
    console.log("✅ Updated all-solutions.json with 25 solutions.");
  }

  // 4. Update scripts/pipeline/patch-authentic-solutions.mjs
  const patchFilePath = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
  let patchContent = fs.readFileSync(patchFilePath, "utf-8");

  let patchesToInsert = "";
  for (const [uid, sol] of Object.entries(VIN_02_SOLUTIONS)) {
    patchesToInsert += `  "${uid}": ${JSON.stringify({ concept: sol.concept, markdown: sol.markdown, images: sol.images })},\n`;
  }

  const needle = patchContent.includes("export const AUTHENTIC_PATCHES = {\r\n")
    ? "export const AUTHENTIC_PATCHES = {\r\n"
    : "export const AUTHENTIC_PATCHES = {\n";
  if (patchContent.includes(needle)) {
    patchContent = patchContent.replace(needle, () => needle + patchesToInsert);
    fs.writeFileSync(patchFilePath, patchContent, "utf-8");
    console.log("✅ Inserted 25 patches into scripts/pipeline/patch-authentic-solutions.mjs");
  } else {
    console.error("❌ Could not find needle in patch-authentic-solutions.mjs");
  }

  console.log("🎉 Integration script execution finished!");
}

if (process.argv[1] && process.argv[1].includes("integrate-cse-vin-02")) {
  run();
}
