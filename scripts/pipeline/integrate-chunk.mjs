import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

export function integrateChunk(options = {}) {
  const args = process.argv.slice(2);
  let chunkId = options.chunkId;
  let chunkPath = options.chunkPath;
  let solutionsPath = options.solutionsPath;

  for (const arg of args) {
    if (arg.startsWith("--chunkId=")) chunkId = arg.split("=")[1].trim();
    if (arg.startsWith("--chunk=")) chunkPath = arg.split("=")[1].trim();
    if (arg.startsWith("--solutions=")) solutionsPath = arg.split("=")[1].trim();
  }

  // 1. Locate chunk file
  if (!chunkPath && chunkId) {
    const candidates = [
      path.join(ROOT, `data/solutions/chunks/me/${chunkId.toLowerCase()}.json`),
      path.join(ROOT, `data/solutions/chunks/ce/${chunkId.toLowerCase()}.json`),
      path.join(ROOT, `data/solutions/chunks/cse/${chunkId.toLowerCase()}.json`),
      path.join(ROOT, `data/solutions/chunks/ec/${chunkId.toLowerCase()}.json`),
      path.join(ROOT, `data/solutions/chunks/ee/${chunkId.toLowerCase()}.json`),
      path.join(ROOT, `data/solutions/chunks/da/${chunkId.toLowerCase()}.json`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        chunkPath = c;
        break;
      }
    }
  }

  if (!chunkPath || !fs.existsSync(chunkPath)) {
    console.error(`❌ Chunk file not found: ${chunkPath || chunkId}`);
    process.exit(1);
  }

  const chunkData = JSON.parse(fs.readFileSync(chunkPath, "utf-8"));
  chunkId = chunkId || chunkData.chunkId;

  console.log(`\n========================================================`);
  console.log(`🚀 [INTEGRATING CHUNK: ${chunkId}]`);
  console.log(`   - Chunk File: ${chunkPath}`);
  console.log(`   - Questions:  ${chunkData.questions?.length || 0}`);
  console.log(`========================================================\n`);

  // 2. Locate solutions
  let solutionsMap = {};

  if (solutionsPath && fs.existsSync(solutionsPath)) {
    solutionsMap = JSON.parse(fs.readFileSync(solutionsPath, "utf-8"));
    console.log(`Loaded solutions from companion file: ${solutionsPath}`);
  } else {
    // Check companion default naming: <chunk-dir>/<chunk-id-lower>-solutions.json
    const defaultCompanion = chunkPath.replace(/\.json$/i, "-solutions.json");
    if (fs.existsSync(defaultCompanion)) {
      solutionsMap = JSON.parse(fs.readFileSync(defaultCompanion, "utf-8"));
      console.log(`Loaded solutions from default companion: ${defaultCompanion}`);
    } else {
      // Check if solutions are embedded in the chunk questions
      for (const q of chunkData.questions || []) {
        if (q.solution && q.solution.markdown) {
          solutionsMap[q.uid] = q.solution;
        }
      }
      if (Object.keys(solutionsMap).length > 0) {
        console.log(`Loaded ${Object.keys(solutionsMap).length} embedded solutions from chunk file.`);
      }
    }
  }

  const uids = (chunkData.questions || []).map(q => q.uid);
  const missingSolutions = uids.filter(uid => !solutionsMap[uid] || !solutionsMap[uid].markdown);

  if (missingSolutions.length > 0) {
    console.error(`❌ Missing solutions for ${missingSolutions.length} questions:`);
    missingSolutions.forEach(u => console.error(`   - ${u}`));
    process.exit(1);
  }

  // 3. Validate solutions format
  for (const uid of uids) {
    const sol = solutionsMap[uid];
    if (!sol.concept || typeof sol.concept !== "string") {
      console.error(`❌ Solution for ${uid} is missing 'concept' string.`);
      process.exit(1);
    }
    if (!sol.markdown || typeof sol.markdown !== "string" || sol.markdown.length < 50) {
      console.error(`❌ Solution for ${uid} has invalid or too short 'markdown'.`);
      process.exit(1);
    }
    if (!Array.isArray(sol.images)) {
      sol.images = [];
    }
  }

  // 4. Update chunk JSON
  for (const q of chunkData.questions) {
    const sol = solutionsMap[q.uid];
    q.status = "ACCEPTED";
    q.solution = {
      concept: sol.concept,
      markdown: sol.markdown,
      images: sol.images || []
    };
  }
  chunkData.chunkStatus = "COMPLETED";
  chunkData.completedAt = new Date().toISOString();
  fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), "utf-8");
  console.log(`✅ Updated ${chunkPath}: All ${uids.length} questions marked ACCEPTED.`);

  // 5. Inject into scripts/pipeline/patch-authentic-solutions.mjs
  const patchFile = path.join(ROOT, "scripts/pipeline/patch-authentic-solutions.mjs");
  let patchContent = fs.readFileSync(patchFile, "utf-8");
  const targetMarker = "export function applyAuthenticPatches() {";

  const entriesToInject = [];
  for (const uid of uids) {
    if (!patchContent.includes(`"${uid}": {`)) {
      const data = solutionsMap[uid];
      entriesToInject.push(`  "${uid}": {\n    concept: ${JSON.stringify(data.concept)},\n    markdown: ${JSON.stringify(data.markdown)},\n    images: ${JSON.stringify(data.images || [])}\n  },`);
    }
  }

  if (entriesToInject.length > 0) {
    if (patchContent.includes(targetMarker)) {
      const injectionBlock = `\n  // ${chunkId}\n` + entriesToInject.join("\n\n") + "\n";
      patchContent = patchContent.replace(/};\s*export function applyAuthenticPatches\(\) {/, () => `${injectionBlock}};\n\nexport function applyAuthenticPatches() {`);
      fs.writeFileSync(patchFile, patchContent, "utf-8");
      console.log(`✅ Injected ${entriesToInject.length} new solution patches into patch-authentic-solutions.mjs.`);
    } else {
      console.error(`❌ Marker "${targetMarker}" not found in ${patchFile}`);
      process.exit(1);
    }
  } else {
    console.log(`ℹ️ All ${uids.length} solutions already present in patch-authentic-solutions.mjs.`);
  }

  // 6. Update manifest.json
  const manifestPath = path.join(ROOT, "data/solutions/chunks/manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const relChunkPath = path.relative(ROOT, chunkPath).replace(/\\/g, "/");

    manifest.chunks = manifest.chunks || {};
    manifest.assignedUids = manifest.assignedUids || {};

    manifest.chunks[chunkId] = {
      chunkId: chunkId,
      branch: chunkData.branch || "me",
      year: chunkData.year || "all",
      section: chunkData.section || "ga",
      file: relChunkPath,
      count: uids.length,
      createdAt: chunkData.createdAt || new Date().toISOString(),
      uids: uids,
      status: "COMPLETED",
      completedAt: new Date().toISOString()
    };

    for (const uid of uids) {
      manifest.assignedUids[uid] = chunkId;
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`✅ Updated manifest.json: ${chunkId} registered and marked COMPLETED.`);
  }

  // 7. Execute authentic patches and enrichment
  console.log(`\nApplying authentic patches to shards and all-solutions.json...`);
  execSync("node scripts/pipeline/patch-authentic-solutions.mjs", { stdio: "inherit" });

  console.log(`\nEnriching shards with solutions...`);
  execSync("node scripts/pipeline/enrich-shards-with-solutions.mjs", { stdio: "inherit" });

  console.log(`\n========================================================`);
  console.log(`🎉 [CHUNK ${chunkId} INTEGRATION COMPLETE]`);
  console.log(`========================================================\n`);
}

if (process.argv[1] && process.argv[1].includes("integrate-chunk.mjs")) {
  integrateChunk();
}

