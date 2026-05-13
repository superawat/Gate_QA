const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const SHARD_ROOT = path.join(ROOT, "public", "data", "aptitude");
const LEGACY_FILE = path.join(ROOT, "public", "aptitude-questions.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(ROOT, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listJsonFiles(entryPath);
    }
    return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
  });
}

function loadAptitudeRows() {
  const shardFiles = listJsonFiles(SHARD_ROOT);
  if (shardFiles.length > 0) {
    return shardFiles
      .sort()
      .flatMap((filePath) => {
        const rows = readJson(filePath);
        if (!Array.isArray(rows)) {
          throw new Error(`${path.relative(ROOT, filePath)} must be an array.`);
        }
        return rows;
      });
  }

  return readJson(LEGACY_FILE);
}

module.exports = {
  loadAptitudeRows,
  readJson,
};
