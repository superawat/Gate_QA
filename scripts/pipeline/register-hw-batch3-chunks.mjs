import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_HW_BATCH3 = {
  "CHUNK-CSE-HW-11": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-hw-11.json",
    uids: [
      "go:1206", "go:1207", "go:1208", "go:1230", "go:1231",
      "go:1232", "go:1233", "go:1234", "go:1235", "go:1246"
    ]
  },
  "CHUNK-CSE-HW-12": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-hw-12.json",
    uids: [
      "go:1252", "go:1269", "go:43515", "go:43516", "go:1273",
      "go:43511", "go:3437", "go:3440", "go:3441", "go:3469"
    ]
  },
  "CHUNK-CSE-HW-13": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-hw-13.json",
    uids: [
      "go:3470", "go:3471", "go:3472", "go:3473", "go:3476",
      "go:3477", "go:3480", "go:3530", "go:3531"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_HW_BATCH3)) {
  const chunkData = {
    chunkId,
    branch: "cse",
    year: meta.year,
    uids: meta.uids,
    count: meta.uids.length,
    status: "completed",
    subject: "Digital Logic & CO Architecture (Hardware)"
  };

  const chunkFilePath = path.join(ROOT, meta.file);
  fs.mkdirSync(path.dirname(chunkFilePath), { recursive: true });
  fs.writeFileSync(chunkFilePath, JSON.stringify(chunkData, null, 2) + "\n");

  manifest.chunks[chunkId] = {
    branch: "cse",
    year: meta.year,
    file: meta.file,
    count: meta.uids.length,
    status: "completed",
    completedAt: new Date().toISOString()
  };

  for (const uid of meta.uids) {
    manifest.assignedUids[uid] = chunkId;
  }
}

manifest.lastUpdated = new Date().toISOString();
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("Registered CHUNK-CSE-HW-11 through 13 in manifest.json successfully.");
