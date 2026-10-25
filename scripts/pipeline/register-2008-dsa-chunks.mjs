import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CHUNKS_2008 = {
  "CHUNK-CSE-DSA-17": {
    year: 2008,
    file: "data/solutions/chunks/cse/chunk-cse-dsa-17.json",
    uids: [
      "go:405", "go:416", "go:417", "go:450", "go:452",
      "go:455", "go:457", "go:458", "go:459", "go:483"
    ]
  },
  "CHUNK-CSE-DSA-18": {
    year: 2008,
    file: "data/solutions/chunks/cse/chunk-cse-dsa-18.json",
    uids: [
      "go:484", "go:485", "go:495", "go:43489", "go:497",
      "go:43485", "go:498", "go:43484", "go:394", "go:43508"
    ]
  },
  "CHUNK-CSE-DSA-19": {
    year: 2008,
    file: "data/solutions/chunks/cse/chunk-cse-dsa-19.json",
    uids: [
      "go:3270", "go:3272", "go:3353", "go:3354", "go:3355",
      "go:3356", "go:3357", "go:3358", "go:3359", "go:3360"
    ]
  },
  "CHUNK-CSE-DSA-20": {
    year: 2008,
    file: "data/solutions/chunks/cse/chunk-cse-dsa-20.json",
    uids: [
      "go:3361", "go:3362", "go:3385", "go:3386", "go:3387",
      "go:3390", "go:3391", "go:3406", "go:3407", "go:3271", "go:3273"
    ]
  }
};

const manifestPath = path.join(ROOT, "data", "solutions", "chunks", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
if (!manifest.assignedUids) {
  manifest.assignedUids = {};
}

// 1. Create 2008 chunk files & add to manifest
for (const [chunkId, meta] of Object.entries(CHUNKS_2008)) {
  const chunkData = {
    chunkId,
    branch: "cse",
    year: meta.year,
    section: "dsa",
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
    section: "dsa",
    file: meta.file,
    status: "COMPLETED",
    count: meta.uids.length,
    createdAt: chunkData.createdAt,
    uids: meta.uids
  };
}

// 2. Backfill assignedUids for all chunks in manifest
for (const [chunkId, chunk] of Object.entries(manifest.chunks)) {
  if (Array.isArray(chunk.uids)) {
    for (const uid of chunk.uids) {
      manifest.assignedUids[uid] = chunkId;
    }
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
console.log("Registered CHUNK-CSE-DSA-17 through 20 and synced assignedUids in manifest.json");
