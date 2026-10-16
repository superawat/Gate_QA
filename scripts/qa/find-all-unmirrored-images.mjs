import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function checkHtml(html, qUid, filePath, results) {
  if (!html || typeof html !== "string") return;
  // match <img ... src= ... >
  // handle src="...", src='...', src= "...", src=something
  const imgRegex = /<img\s+[^>]*src\s*=\s*(?:["']([^"']+)["']|(\S+))[^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1] || match[2] || "";
    // strip surrounding quotes if any
    src = src.replace(/^["']|["']$/g, "").trim();
    if (!src) continue;

    if (src.startsWith("/question-images/") || src.startsWith("/images/") || src.startsWith("/Gate_QA/question-images/")) {
      let relativePath = src;
      if (relativePath.startsWith("/Gate_QA/")) {
        relativePath = relativePath.replace("/Gate_QA/", "/");
      }
      const diskPath = path.join(ROOT, "public", relativePath.slice(1));
      if (!fs.existsSync(diskPath)) {
        results.missingLocalFiles.push({ src, qUid, filePath });
      }
    } else {
      results.externalOrUnmirrored.push({ src, qUid, filePath, fullTag: match[0] });
    }
  }
}

function scanJsonFile(filePath, results) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    let questions = [];
    if (Array.isArray(data)) {
      questions = data;
    } else if (data.recordsByQuestionUid) {
      questions = Object.values(data.recordsByQuestionUid);
    } else if (data.questions) {
      questions = data.questions;
    } else if (typeof data === "object") {
      questions = Object.values(data);
    }

    for (const q of questions) {
      if (!q || typeof q !== "object") continue;
      const qUid = q.question_uid || q.id || q.uid || "unknown";
      checkHtml(q.question || q.stem, qUid, filePath, results);
      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          checkHtml(typeof opt === "string" ? opt : (opt?.text || ""), qUid, filePath, results);
        }
      }
      checkHtml(q.solution || q.rawSolution || q.explanation, qUid, filePath, results);
    }
  } catch (e) {
    // console.error(`Error in ${filePath}:`, e.message);
  }
}

function scanDir(dirPath) {
  const results = {
    missingLocalFiles: [],
    externalOrUnmirrored: []
  };

  function walk(current) {
    if (!fs.existsSync(current)) return;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        if (ent.name !== "node_modules" && ent.name !== ".git" && ent.name !== "dist") {
          walk(full);
        }
      } else if (ent.isFile() && ent.name.endsWith(".json")) {
        scanJsonFile(full, results);
      }
    }
  }

  walk(dirPath);
  return results;
}


console.log("--- Scanning public/question-detail-shards ---");
const shardResults = scanDir(path.join(ROOT, "public", "question-detail-shards"));
console.log(`External/unmirrored in shards: ${shardResults.externalOrUnmirrored.length}`);
console.log(`Missing local files referenced in shards: ${shardResults.missingLocalFiles.length}`);

const prefixCounts = {};
for (const item of shardResults.externalOrUnmirrored) {
  let prefix = "";
  if (item.src.startsWith("http")) {
    try {
      prefix = new URL(item.src).origin;
    } catch {
      prefix = "invalid-url";
    }
  } else {
    prefix = item.src.split("/").slice(0, 3).join("/");
  }
  prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
}

console.log("Prefix breakdown in shards:", prefixCounts);

const shardFileCounts = {};
for (const item of shardResults.externalOrUnmirrored) {
  const f = path.basename(item.filePath);
  shardFileCounts[f] = (shardFileCounts[f] || 0) + 1;
}
console.log("Shards with unmirrored images:", shardFileCounts);

console.log("--- Scanning audit directory ---");
const auditResults = scanDir(path.join(ROOT, "audit"));
console.log(`External/unmirrored in audit: ${auditResults.externalOrUnmirrored.length}`);

const auditFileCounts = {};
for (const item of auditResults.externalOrUnmirrored) {
  const f = path.basename(item.filePath);
  auditFileCounts[f] = (auditFileCounts[f] || 0) + 1;
}
console.log("Audit files with unmirrored images:", auditFileCounts);


console.log("--- Scanning data directory ---");
const dataResults = scanDir(path.join(ROOT, "data"));
console.log(`External/unmirrored in data: ${dataResults.externalOrUnmirrored.length}`);

console.log("--- Scanning public/data directory ---");
const publicDataResults = scanDir(path.join(ROOT, "public", "data"));
console.log(`External/unmirrored in public/data: ${publicDataResults.externalOrUnmirrored.length}`);

const publicDataFileCounts = {};
for (const item of publicDataResults.externalOrUnmirrored) {
  const f = path.relative(ROOT, item.filePath);
  publicDataFileCounts[f] = (publicDataFileCounts[f] || 0) + 1;
}
console.log("Public/data files with unmirrored images:", publicDataFileCounts);


// Sample some unmirrored
console.log("Sample unmirrored in shards (first 10):");
console.log(shardResults.externalOrUnmirrored.slice(0, 10));

if (shardResults.missingLocalFiles.length > 0) {
  console.log("Sample missing local files (first 10):");
  console.log(shardResults.missingLocalFiles.slice(0, 10));
}
