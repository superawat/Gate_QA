import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_TOC_BATCH1 = {
  "CHUNK-CSE-TOC-01": {
    year: 2001,
    file: "data/solutions/chunks/cse/chunk-cse-toc-01.json",
    uids: [
      "go:697", "go:698", "go:699", "go:710", "go:711",
      "go:723", "go:724", "go:725", "go:811", "go:835",
      "go:843", "go:844", "go:849"
    ]
  },
  "CHUNK-CSE-TOC-02": {
    year: 2003,
    file: "data/solutions/chunks/cse/chunk-cse-toc-02.json",
    uids: [
      "go:120", "go:355", "go:356", "go:904", "go:905",
      "go:906", "go:907", "go:908", "go:939"
    ]
  },
  "CHUNK-CSE-TOC-03": {
    year: 2003,
    file: "data/solutions/chunks/cse/chunk-cse-toc-03.json",
    uids: [
      "go:940", "go:941", "go:943", "go:944", "go:945",
      "go:946", "go:947", "go:960", "go:962"
    ]
  },
  "CHUNK-CSE-TOC-04": {
    year: 2004,
    file: "data/solutions/chunks/cse/chunk-cse-toc-04.json",
    uids: [
      "go:1005", "go:1006", "go:1042", "go:1080", "go:1081",
      "go:1082", "go:1083"
    ]
  },
  "CHUNK-CSE-TOC-05": {
    year: 2004,
    file: "data/solutions/chunks/cse/chunk-cse-toc-05.json",
    uids: [
      "go:3648", "go:3650", "go:3683", "go:3684", "go:4069",
      "go:999"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_TOC_BATCH1)) {
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
console.log("Registered CHUNK-CSE-TOC-01 through 05 in manifest.json");
