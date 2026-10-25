import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_HW_BATCH4 = {
  "CHUNK-CSE-HW-14": {
    year: 2008,
    file: "data/solutions/chunks/cse/chunk-cse-hw-14.json",
    uids: [
      "go:402", "go:403", "go:404", "go:406", "go:424",
      "go:444", "go:445", "go:446", "go:447", "go:448", "go:449"
    ]
  },
  "CHUNK-CSE-HW-15": {
    year: 2008,
    file: "data/solutions/chunks/cse/chunk-cse-hw-15.json",
    uids: [
      "go:494", "go:43490", "go:43491", "go:496", "go:43487",
      "go:3222", "go:3267", "go:3268", "go:3269", "go:3275", "go:3347"
    ]
  },
  "CHUNK-CSE-HW-16": {
    year: 2009,
    file: "data/solutions/chunks/cse/chunk-cse-hw-16.json",
    uids: [
      "go:3348", "go:3349", "go:3350", "go:3352", "go:3403", "go:3405",
      "go:1297", "go:1298", "go:1299", "go:1300", "go:1314", "go:1315"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_HW_BATCH4)) {
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
console.log("Registered CHUNK-CSE-HW-14 through 16 in manifest.json successfully.");
