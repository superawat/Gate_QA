import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_SYS_BATCH3 = {
  "CHUNK-CSE-SYS-11": {
    year: 2005,
    file: "data/solutions/chunks/cse/chunk-cse-sys-11.json",
    uids: [
      "go:3762", "go:3763", "go:1355", "go:3764", "go:1356",
      "go:1357", "go:3766", "go:1358", "go:3767", "go:1359", "go:3768"
    ]
  },
  "CHUNK-CSE-SYS-12": {
    year: 2005,
    file: "data/solutions/chunks/cse/chunk-cse-sys-12.json",
    uids: [
      "go:1360", "go:3769", "go:1361", "go:3770", "go:1362",
      "go:3772", "go:1363", "go:3773", "go:1364", "go:3774", "go:1365"
    ]
  },
  "CHUNK-CSE-SYS-13": {
    year: 2005,
    file: "data/solutions/chunks/cse/chunk-cse-sys-13.json",
    uids: [
      "go:3775", "go:1366", "go:3788", "go:3789", "go:3821",
      "go:3823", "go:3824", "go:3830", "go:3831", "go:3832", "go:3833"
    ]
  },
  "CHUNK-CSE-SYS-14": {
    year: 2005,
    file: "data/solutions/chunks/cse/chunk-cse-sys-14.json",
    uids: [
      "go:1394", "go:3834", "go:3835", "go:765", "go:1396",
      "go:3836", "go:1397", "go:3837", "go:1398", "go:3838", "go:1399"
    ]
  },
  "CHUNK-CSE-SYS-15": {
    year: 2005,
    file: "data/solutions/chunks/cse/chunk-cse-sys-15.json",
    uids: [
      "go:3839", "go:1400", "go:3840", "go:1401", "go:3842",
      "go:3843", "go:3845", "go:3846", "go:3847", "go:3848", "go:3858", "go:3859"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create chunk files & register in manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_SYS_BATCH3)) {
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
console.log("Registered CHUNK-CSE-SYS-11 to CHUNK-CSE-SYS-15 in manifest.json");
