import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_TOC_BATCH3 = {
  "CHUNK-CSE-TOC-11": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-toc-11.json",
    uids: [
      "go:1204", "go:1205", "go:1216", "go:1227", "go:1228",
      "go:1229", "go:1250", "go:1251", "go:1270", "go:1272", "go:3442"
    ]
  },
  "CHUNK-CSE-TOC-12": {
    year: 2007,
    file: "data/solutions/chunks/cse/chunk-cse-toc-12.json",
    uids: [
      "go:3468", "go:3481", "go:3489", "go:3490", "go:3491",
      "go:3492", "go:3523", "go:3524", "go:3525", "go:43512", "go:43514"
    ]
  },
  "CHUNK-CSE-TOC-13": {
    year: 2008,
    file: "data/solutions/chunks/cse/chunk-cse-toc-13.json",
    uids: [
      "go:3265", "go:3266", "go:3342", "go:3343", "go:3344",
      "go:3345", "go:3346", "go:3392", "go:3393", "go:395", "go:407"
    ]
  },
  "CHUNK-CSE-TOC-14": {
    year: 2008,
    file: "data/solutions/chunks/cse/chunk-cse-toc-14.json",
    uids: [
      "go:408", "go:409", "go:410", "go:411", "go:461",
      "go:462", "go:463", "go:464", "go:476", "go:477", "go:478"
    ]
  },
  "CHUNK-CSE-TOC-15": {
    year: 2009,
    file: "data/solutions/chunks/cse/chunk-cse-toc-15.json",
    uids: [
      "go:1304", "go:1306", "go:1307", "go:1308", "go:1309",
      "go:1313", "go:1326", "go:1327", "go:1328"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_TOC_BATCH3)) {
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
console.log("Registered CHUNK-CSE-TOC-11 through 15 in manifest.json");
