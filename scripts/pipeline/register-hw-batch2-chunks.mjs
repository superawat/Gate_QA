import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_HW_BATCH2 = {
  "CHUNK-CSE-HW-08": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-hw-08.json",
    uids: [
      "go:887", "go:888", "go:1292", "go:1294", "go:1295",
      "go:1814", "go:1815", "go:1816", "go:1817"
    ]
  },
  "CHUNK-CSE-HW-09": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-hw-09.json",
    uids: [
      "go:1818", "go:1819", "go:1851", "go:43565", "go:1854",
      "go:43517", "go:3546", "go:3574", "go:3575"
    ]
  },
  "CHUNK-CSE-HW-10": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-hw-10.json",
    uids: [
      "go:3577", "go:3578", "go:3581", "go:3584",
      "go:3585", "go:3586", "go:3622", "go:3623"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_HW_BATCH2)) {
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
console.log("Registered CHUNK-CSE-HW-08 through 10 in manifest.json successfully.");
