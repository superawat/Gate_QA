import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_SYS_BATCH4 = {
  "CHUNK-CSE-SYS-16": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-sys-16.json",
    uids: [
      "go:884", "go:885", "go:3547", "go:3551", "go:3552",
      "go:3553", "go:3554", "go:3557", "go:3558", "go:981"
    ]
  },
  "CHUNK-CSE-SYS-17": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-sys-17.json",
    uids: [
      "go:1820", "go:1821", "go:1822", "go:3597", "go:3598",
      "go:3600", "go:3601", "go:3604", "go:1839", "go:3605", "go:1840"
    ]
  },
  "CHUNK-CSE-SYS-18": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-sys-18.json",
    uids: [
      "go:1841", "go:3607", "go:1842", "go:3608", "go:1843",
      "go:1844", "go:3610", "go:1845", "go:3611", "go:1846", "go:3612"
    ]
  },
  "CHUNK-CSE-SYS-19": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-sys-19.json",
    uids: [
      "go:1847", "go:3613", "go:1848", "go:3614", "go:1853",
      "go:43564", "go:1855", "go:79790", "go:3640", "go:3641"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_SYS_BATCH4)) {
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
console.log("Registered CHUNK-CSE-SYS-16 through 19 in manifest.json successfully.");
