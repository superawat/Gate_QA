import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

export function preflightChunk(chunkPath) {
  const args = process.argv.slice(2);
  let targetPath = chunkPath;

  for (const arg of args) {
    if (arg.startsWith("--chunk=")) targetPath = arg.split("=")[1].trim();
    if (arg.startsWith("--chunkId=")) {
      const id = arg.split("=")[1].trim().toLowerCase();
      const candidates = [
        path.join(ROOT, `data/solutions/chunks/me/${id}.json`),
        path.join(ROOT, `data/solutions/chunks/ce/${id}.json`),
        path.join(ROOT, `data/solutions/chunks/cse/${id}.json`),
        path.join(ROOT, `data/solutions/chunks/ec/${id}.json`),
        path.join(ROOT, `data/solutions/chunks/ee/${id}.json`),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          targetPath = c;
          break;
        }
      }
    }
  }

  if (!targetPath || !fs.existsSync(targetPath)) {
    console.error(`❌ Target chunk file not found: ${targetPath}`);
    process.exit(1);
  }

  const chunk = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
  console.log(`\n========================================================`);
  console.log(`🔍 [PRE-FLIGHT AUDIT: ${chunk.chunkId || path.basename(targetPath)}]`);
  console.log(`   - File:      ${targetPath}`);
  console.log(`   - Questions: ${chunk.questions?.length || 0}`);
  console.log(`========================================================\n`);

  const issues = [];
  const dateRegex = /^\d{2}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;

  chunk.questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const uid = q.uid;

    // 1. Stem check
    if (!q.questionHtml || q.questionHtml.trim().length === 0) {
      issues.push({ qNum, uid, severity: "ERROR", message: "Question HTML is empty" });
    }

    // 2. Options check for MCQ
    if (q.type === "MCQ") {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        issues.push({ qNum, uid, severity: "WARNING", message: `MCQ does not have exactly 4 options (has ${q.options?.length})` });
      } else {
        q.options.forEach((opt, optIdx) => {
          const optStr = String(opt);
          if (dateRegex.test(optStr)) {
            issues.push({ qNum, uid, severity: "ERROR", message: `Option ${optIdx} ("${optStr}") has Excel date corruption!` });
          }
          if (optStr.trim().length === 0) {
            issues.push({ qNum, uid, severity: "ERROR", message: `Option ${optIdx} is empty` });
          }
        });
      }
    }

    // 3. Official answer check
    if (!q.officialAnswer) {
      issues.push({ qNum, uid, severity: "WARNING", message: "Official answer is missing or null" });
    }

    // 4. Image check
    const imgMatches = (q.questionHtml || "").match(/<img[^>]+src=["']([^"']+)["']/g) || [];
    imgMatches.forEach(imgTag => {
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        let src = srcMatch[1];
        if (src.startsWith("/")) src = src.slice(1);
        const fullImgPath = path.join(ROOT, "public", src);
        if (!fs.existsSync(fullImgPath)) {
          issues.push({ qNum, uid, severity: "ERROR", message: `Missing image asset: ${src}` });
        }
      }
    });
  });

  if (issues.length === 0) {
    console.log(`✅ [PRE-FLIGHT PASSED]: All ${chunk.questions.length} questions are clean with valid stems, options, answers, and images!`);
  } else {
    console.log(`⚠️ [PRE-FLIGHT ISSUES DETECTED: ${issues.length}]`);
    issues.forEach(iss => {
      console.log(`   [${iss.severity}] Q${iss.qNum} (${iss.uid}): ${iss.message}`);
    });
  }

  return issues;
}

if (process.argv[1] && process.argv[1].includes("preflight-chunk.mjs")) {
  preflightChunk();
}

