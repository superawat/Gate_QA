import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_SYS_BATCH2 = {
  "CHUNK-CSE-SYS-06": {
    year: 2004,
    file: "data/solutions/chunks/cse/chunk-cse-sys-06.json",
    uids: [
      "go:1008", "go:3652", "go:1009", "go:1010", "go:1011",
      "go:3655", "go:1012", "go:1013", "go:3657", "go:1018", "go:3662"
    ]
  },
  "CHUNK-CSE-SYS-07": {
    year: 2004,
    file: "data/solutions/chunks/cse/chunk-cse-sys-07.json",
    uids: [
      "go:1019", "go:3663", "go:3664", "go:3666", "go:3667",
      "go:3668", "go:3669", "go:3673", "go:3688", "go:1043"
    ]
  },
  "CHUNK-CSE-SYS-08": {
    year: 2004,
    file: "data/solutions/chunks/cse/chunk-cse-sys-08.json",
    uids: [
      "go:1044", "go:1045", "go:1046", "go:1047", "go:1048",
      "go:1049", "go:1050", "go:1051", "go:1052", "go:43572", "go:3705"
    ]
  },
  "CHUNK-CSE-SYS-09": {
    year: 2004,
    file: "data/solutions/chunks/cse/chunk-cse-sys-09.json",
    uids: [
      "go:3706", "go:3707", "go:3708", "go:3709", "go:3710",
      "go:3717", "go:3718", "go:3719", "go:3720", "go:3721"
    ]
  },
  "CHUNK-CSE-SYS-10": {
    year: 2004,
    file: "data/solutions/chunks/cse/chunk-cse-sys-10.json",
    uids: [
      "go:3722", "go:3723", "go:3724", "go:3725", "go:3726",
      "go:3727", "go:3728", "go:3729", "go:3730", "go:3731", "go:3732"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_SYS_BATCH2)) {
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
console.log("Registered CHUNK-CSE-SYS-06 to CHUNK-CSE-SYS-10 in manifest.json");
