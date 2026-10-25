import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_SYS_BATCH1 = {
  "CHUNK-CSE-SYS-01": {
    year: 2001,
    file: "data/solutions/chunks/cse/chunk-cse-sys-01.json",
    uids: [
      "go:49481", "go:701", "go:705", "go:706", "go:713",
      "go:714", "go:715", "go:716", "go:717", "go:718"
    ]
  },
  "CHUNK-CSE-SYS-02": {
    year: 2001,
    file: "data/solutions/chunks/cse/chunk-cse-sys-02.json",
    uids: [
      "go:738", "go:739", "go:740", "go:741", "go:742",
      "go:743", "go:749", "go:761"
    ]
  },
  "CHUNK-CSE-SYS-03": {
    year: 2002,
    file: "data/solutions/chunks/cse/chunk-cse-sys-03.json",
    uids: [
      "go:815", "go:824", "go:825", "go:827", "go:828",
      "go:850", "go:851", "go:852", "go:853", "go:854", "go:855"
    ]
  },
  "CHUNK-CSE-SYS-04": {
    year: 2003,
    file: "data/solutions/chunks/cse/chunk-cse-sys-04.json",
    uids: [
      "go:915", "go:916", "go:917", "go:918", "go:919",
      "go:920", "go:952", "go:963", "go:788"
    ]
  },
  "CHUNK-CSE-SYS-05": {
    year: 2003,
    file: "data/solutions/chunks/cse/chunk-cse-sys-05.json",
    uids: [
      "go:43578", "go:964", "go:43574", "go:965", "go:966",
      "go:967", "go:968", "go:969", "go:970"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_SYS_BATCH1)) {
  const chunkData = {
    chunkId,
    branch: "cse",
    year: meta.year,
    section: "sys-os-cn-dbms",
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
    section: "sys-os-cn-dbms",
    file: meta.file,
    status: "COMPLETED",
    count: meta.uids.length,
    createdAt: new Date().toISOString(),
    uids: meta.uids
  };

  for (const uid of meta.uids) {
    manifest.assignedUids[uid] = chunkId;
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
console.log("Registered CHUNK-CSE-SYS-01 to CHUNK-CSE-SYS-05 in manifest.json");
