import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_SYS_BATCH5 = {
  "CHUNK-CSE-SYS-20": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-sys-20.json",
    uids: [
      "go:3443", "go:1209", "go:3444", "go:3445", "go:3446",
      "go:3447", "go:3448", "go:1214", "go:1215", "go:3451", "go:1218"
    ]
  },
  "CHUNK-CSE-SYS-21": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-sys-21.json",
    uids: [
      "go:3459", "go:3478", "go:3479", "go:1253", "go:1254",
      "go:3498", "go:1255", "go:1256", "go:3500", "go:2428"
    ]
  },
  "CHUNK-CSE-SYS-22": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-sys-22.json",
    uids: [
      "go:3501", "go:1258", "go:3504", "go:1259", "go:3505",
      "go:1260", "go:3506", "go:1261", "go:3508", "go:1262"
    ]
  },
  "CHUNK-CSE-SYS-23": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-sys-23.json",
    uids: [
      "go:3509", "go:1263", "go:3510", "go:3511", "go:394296",
      "go:1265", "go:3512", "go:1266", "go:3513", "go:1267"
    ]
  },
  "CHUNK-CSE-SYS-24": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-sys-24.json",
    uids: [
      "go:3514", "go:1268", "go:3515", "go:3526", "go:3527",
      "go:1274", "go:3534", "go:3535", "go:43510", "go:3536", "go:3537"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_SYS_BATCH5)) {
  const chunkData = {
    chunkId,
    branch: "cse",
    year: meta.year,
    uids: meta.uids,
    count: meta.uids.length,
    status: "completed",
    subject: "Systems (OS, CN, Databases)"
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
console.log("Registered CHUNK-CSE-SYS-20 through 24 in manifest.json successfully.");
