import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_TOC_BATCH2 = {
  "CHUNK-CSE-TOC-06": {
    year: 2005,
    file: "data/solutions/chunks/cse/chunk-cse-toc-06.json",
    uids: [
      "go:1350", "go:1375", "go:1376", "go:1377", "go:1378",
      "go:1379", "go:1380", "go:1381", "go:1382", "go:1383", "go:1386"
    ]
  },
  "CHUNK-CSE-TOC-07": {
    year: 2005,
    file: "data/solutions/chunks/cse/chunk-cse-toc-07.json",
    uids: [
      "go:1405", "go:3748", "go:3749", "go:3751", "go:3784",
      "go:3785", "go:3786", "go:3787", "go:3849", "go:3850",
      "go:4066", "go:87037"
    ]
  },
  "CHUNK-CSE-TOC-08": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-toc-08.json",
    uids: [
      "go:1291", "go:1833", "go:1836", "go:1837", "go:1838",
      "go:1856", "go:3542", "go:3543", "go:3544"
    ]
  },
  "CHUNK-CSE-TOC-09": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-toc-09.json",
    uids: [
      "go:3568", "go:3569", "go:3570", "go:3571", "go:3572",
      "go:3573", "go:3576", "go:3624", "go:3637"
    ]
  },
  "CHUNK-CSE-TOC-10": {
    year: 2006,
    file: "data/solutions/chunks/cse/chunk-cse-toc-10.json",
    uids: [
      "go:79801", "go:886", "go:980", "go:992", "go:993",
      "go:994", "go:995", "go:996"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_TOC_BATCH2)) {
  const chunkData = {
    chunkId,
    branch: "cse",
    year: meta.year,
    section: "toc-cd",
    status: "COMPLETED",
    count: meta.uids.length,
    createdAt: new Date().toISOString(),
    uids: meta.uids
  };

  const chunkFilePath = path.join(ROOT, meta.file);
  fs.mkdirSync(path.dirname(chunkFilePath), { recursive: true });
  fs.writeFileSync(chunkFilePath, JSON.stringify(chunkData, null, 2), "utf-8");

  manifest.chunks[chunkId] = {
    chunkId,
    branch: "cse",
    year: meta.year,
    section: "toc-cd",
    file: meta.file,
    status: "COMPLETED",
    count: meta.uids.length,
    createdAt: chunkData.createdAt,
    uids: meta.uids
  };

  for (const uid of meta.uids) {
    manifest.assignedUids[uid] = chunkId;
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
console.log("Registered CHUNK-CSE-TOC-06 through 10 in manifest.json");
