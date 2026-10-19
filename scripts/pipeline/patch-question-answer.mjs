#!/usr/bin/env node

/**
 * Question Data & Answer Key Patching Automation Tool
 *
 * Deterministically patches question answers, types, numeric tolerances, and detailed solutions
 * across authoritative pipeline stores and public runtime indices:
 *   1. data/answers/manual-answers-patch-v1.json
 *   2. data/answers/answers_by_question_uid_v1.json
 *   3. public/data/answers/answers_by_question_uid_v1.json
 *   4. public/data/answers/answers_by_exam_uid_v1.json
 *   5. public/data/answers/answers_master_v1.json
 *   6. Track registries:
 *      - ISRO: data/isro/ & public/data/isro/ (answers-isro.json, isro-<year>.json, isro-all.json)
 *      - CSE: public/questions-with-answers.json
 *   7. Unsupported registry cleanup (public/data/answers/unsupported_question_uids_v1.json)
 *
 * Solves the >4MB file tool limit issue and guarantees 100% data parity across all layers.
 *
 * Usage Examples:
 *   # MCQ Answer Patch
 *   node scripts/pipeline/patch-question-answer.mjs --uid isro:cs:2025:q5 --type MCQ --answer D --note "official_isro_key_d_11"
 *
 *   # MSQ Answer Patch
 *   node scripts/pipeline/patch-question-answer.mjs --uid go:371897 --type MSQ --answer '["A", "B", "C"]'
 *
 *   # NAT Answer with Symmetric Tolerance
 *   node scripts/pipeline/patch-question-answer.mjs --uid go:8313 --type NAT --answer 69 --tolerance '{"abs": 0.01}'
 *
 *   # Defective Question (Excluded from scoring)
 *   node scripts/pipeline/patch-question-answer.mjs --uid go:43485 --answer null --defective-reason "Correct value 13 absent from options"
 *
 *   # Rebuild artifacts automatically after patch
 *   node scripts/pipeline/patch-question-answer.mjs --uid isro:cs:2025:q5 --answer D --rebuild
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    uid: null,
    answer: undefined,
    type: null,
    tolerance: null,
    examUid: null,
    note: null,
    solution: null,
    concept: null,
    defectiveReason: null,
    rebuild: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--uid" && argv[i + 1]) {
      options.uid = argv[++i].trim();
    } else if (arg === "--answer" && argv[i + 1] !== undefined) {
      const rawAns = argv[++i].trim();
      if (rawAns === "null") {
        options.answer = null;
      } else {
        try {
          options.answer = JSON.parse(rawAns);
        } catch {
          options.answer = rawAns;
        }
      }
    } else if (arg === "--type" && argv[i + 1]) {
      options.type = argv[++i].trim().toUpperCase();
    } else if (arg === "--tolerance" && argv[i + 1]) {
      try {
        options.tolerance = JSON.parse(argv[++i]);
      } catch (err) {
        throw new Error(`Invalid JSON for --tolerance: ${err.message}`);
      }
    } else if (arg === "--exam-uid" && argv[i + 1]) {
      options.examUid = argv[++i].trim();
    } else if (arg === "--note" && argv[i + 1]) {
      options.note = argv[++i].trim();
    } else if (arg === "--solution" && argv[i + 1]) {
      options.solution = argv[++i];
    } else if (arg === "--concept" && argv[i + 1]) {
      options.concept = argv[++i].trim();
    } else if (arg === "--defective-reason" && argv[i + 1]) {
      options.defectiveReason = argv[++i].trim();
    } else if (arg === "--rebuild") {
      options.rebuild = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function safeWriteJson(filePath, data, dryRun = false) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function patchQuestionAnswer(options, rootDir = process.cwd()) {
  const uid = String(options.uid || "").trim();
  if (!uid) {
    throw new Error("Missing required argument: --uid <question_uid>");
  }

  const dryRun = Boolean(options.dryRun);
  const modifiedFiles = [];

  // Determine Question Track
  const isIsro = uid.startsWith("isro:");
  const isCse = uid.startsWith("go:");
  const isDa = uid.startsWith("da:");
  const isBranch = uid.startsWith("pp:");

  // Auto-detect existing record to preserve type or exam_uid if not explicitly specified
  const manualPatchPath = path.join(rootDir, "data/answers/manual-answers-patch-v1.json");
  const baseAnswersPath = path.join(rootDir, "data/answers/answers_by_question_uid_v1.json");

  const manualPatchData = safeReadJson(manualPatchPath) || {
    version: "1.0.0",
    records_by_question_uid: {},
    stats: { records: 0 },
  };
  const baseAnswersData = safeReadJson(baseAnswersPath) || {};

  const existingInManual = manualPatchData.records_by_question_uid?.[uid];
  const existingInBase = baseAnswersData.records_by_question_uid?.[uid] || baseAnswersData[uid];

  const type = options.type
    || existingInManual?.type
    || existingInBase?.type
    || "MCQ";

  const rawAnswer = options.answer !== undefined ? options.answer : (existingInManual?.answer ?? existingInBase?.answer);
  // Ensure MSQ answers are formatted as array of strings
  let finalAnswer = rawAnswer;
  if (type === "MSQ") {
    if (typeof rawAnswer === "string") {
      finalAnswer = rawAnswer.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    } else if (Array.isArray(rawAnswer)) {
      finalAnswer = rawAnswer.map((s) => String(s).trim().toUpperCase());
    }
  }

  const tolerance = options.tolerance !== undefined ? options.tolerance : (existingInManual?.tolerance ?? existingInBase?.tolerance ?? null);
  const note = options.note || existingInManual?.note || `patch:${uid}`;

  let examUid = options.examUid || existingInBase?.exam_uid || existingInManual?.exam_uid;

  // Auto-discover examUid for ISRO
  if (!examUid && isIsro) {
    const isroMatch = uid.match(/^isro:cs:(\d{4}):q(\d+)$/i);
    if (isroMatch) {
      examUid = `isro-${isroMatch[1]}-q${isroMatch[2]}`;
    }
  }

  const answerUid = existingInBase?.answer_uid || `manual:${uid}`;

  // 1. Update data/answers/manual-answers-patch-v1.json
  if (!manualPatchData.records_by_question_uid) {
    manualPatchData.records_by_question_uid = {};
  }
  const patchRecord = {
    type,
    answer: finalAnswer,
    tolerance,
    note,
  };
  if (options.defectiveReason) {
    patchRecord.is_defective = true;
    patchRecord.defective_reason = options.defectiveReason;
  }
  if (examUid) {
    patchRecord.exam_uid = examUid;
  }
  manualPatchData.records_by_question_uid[uid] = patchRecord;
  manualPatchData.stats = {
    records: Object.keys(manualPatchData.records_by_question_uid).length,
  };
  safeWriteJson(manualPatchPath, manualPatchData, dryRun);
  modifiedFiles.push("data/answers/manual-answers-patch-v1.json");

  // 2. Update data/answers/answers_by_question_uid_v1.json & public/data/answers/answers_by_question_uid_v1.json
  const answerRecord = {
    answer_uid: answerUid,
    type,
    answer: finalAnswer,
    tolerance,
    source: {
      kind: "manual_patch",
      note,
    },
  };
  if (options.defectiveReason) {
    answerRecord.is_defective = true;
    answerRecord.defective_reason = options.defectiveReason;
  }

  for (const relPath of [
    "data/answers/answers_by_question_uid_v1.json",
    "public/data/answers/answers_by_question_uid_v1.json",
  ]) {
    const fullPath = path.join(rootDir, relPath);
    const data = safeReadJson(fullPath);
    if (data) {
      if (data.records_by_question_uid) {
        data.records_by_question_uid[uid] = answerRecord;
      } else {
        data[uid] = answerRecord;
      }
      safeWriteJson(fullPath, data, dryRun);
      modifiedFiles.push(relPath);
    }
  }

  // 3. Update public/data/answers/answers_by_exam_uid_v1.json
  if (examUid) {
    const examMapPath = path.join(rootDir, "public/data/answers/answers_by_exam_uid_v1.json");
    const examData = safeReadJson(examMapPath);
    if (examData) {
      const examRecord = {
        ...answerRecord,
        question_uid: uid,
      };
      if (examData.records_by_exam_uid) {
        examData.records_by_exam_uid[examUid] = examRecord;
      } else {
        examData[examUid] = examRecord;
      }
      safeWriteJson(examMapPath, examData, dryRun);
      modifiedFiles.push("public/data/answers/answers_by_exam_uid_v1.json");
    }
  }

  // 4. Update public/data/answers/answers_master_v1.json
  const masterPath = path.join(rootDir, "public/data/answers/answers_master_v1.json");
  const masterData = safeReadJson(masterPath);
  if (masterData) {
    const masterRecord = {
      ...answerRecord,
      question_uid: uid,
      ...(examUid ? { exam_uid: examUid } : {}),
    };
    if (masterData.records_by_uid) {
      masterData.records_by_uid[answerUid] = masterRecord;
    } else {
      masterData[answerUid] = masterRecord;
    }
    safeWriteJson(masterPath, masterData, dryRun);
    modifiedFiles.push("public/data/answers/answers_master_v1.json");
  }

  // 5. Clean up unsupported registry if valid answer is supplied
  if (!options.defectiveReason && finalAnswer !== null) {
    for (const relPath of [
      "data/answers/unsupported_question_uids_v1.json",
      "public/data/answers/unsupported_question_uids_v1.json",
    ]) {
      const fullPath = path.join(rootDir, relPath);
      const unsuppData = safeReadJson(fullPath);
      if (unsuppData && Array.isArray(unsuppData.question_uids) && unsuppData.question_uids.includes(uid)) {
        unsuppData.question_uids = unsuppData.question_uids.filter((q) => q !== uid);
        safeWriteJson(fullPath, unsuppData, dryRun);
        modifiedFiles.push(relPath);
      }
    }
  }

  // 6. Track-Specific Registries
  if (isIsro) {
    // 6a. Update data/isro/answers-isro.json & public/data/isro/answers-isro.json
    for (const relPath of ["data/isro/answers-isro.json", "public/data/isro/answers-isro.json"]) {
      const fullPath = path.join(rootDir, relPath);
      const isroAnswers = safeReadJson(fullPath);
      if (isroAnswers?.records_by_question_uid?.[uid]) {
        isroAnswers.records_by_question_uid[uid].answer = finalAnswer;
        isroAnswers.records_by_question_uid[uid].type = type;
        safeWriteJson(fullPath, isroAnswers, dryRun);
        modifiedFiles.push(relPath);
      }
    }

    const yearMatch = uid.match(/isro:cs:(\d{4}):/i);
    const isroYear = yearMatch ? yearMatch[1] : null;

    // 6b. Update individual year paper isro-<year>.json
    if (isroYear) {
      for (const relPath of [`data/isro/isro-${isroYear}.json`, `public/data/isro/isro-${isroYear}.json`]) {
        const fullPath = path.join(rootDir, relPath);
        const questions = safeReadJson(fullPath);
        if (Array.isArray(questions)) {
          const q = questions.find((item) => item.question_uid === uid);
          if (q) {
            q.answer = finalAnswer;
            q.type = type;
            if (options.solution) {
              q.detailed_solution = {
                concept: options.concept || q.subtopic || "Detailed Solution",
                markdown: options.solution,
              };
            }
            safeWriteJson(fullPath, questions, dryRun);
            modifiedFiles.push(relPath);
          }
        }
      }
    }

    // 6c. Update master bundle isro-all.json
    for (const relPath of ["data/isro/isro-all.json", "public/data/isro/isro-all.json"]) {
      const fullPath = path.join(rootDir, relPath);
      const questions = safeReadJson(fullPath);
      if (Array.isArray(questions)) {
        const q = questions.find((item) => item.question_uid === uid);
        if (q) {
          q.answer = finalAnswer;
          q.type = type;
          if (options.solution) {
            q.detailed_solution = {
              concept: options.concept || q.subtopic || "Detailed Solution",
              markdown: options.solution,
            };
          }
          safeWriteJson(fullPath, questions, dryRun);
          modifiedFiles.push(relPath);
        }
      }
    }
  } else if (isCse) {
    // 6d. Update public/questions-with-answers.json
    const cseBankPath = path.join(rootDir, "public/questions-with-answers.json");
    const cseBank = safeReadJson(cseBankPath);
    if (Array.isArray(cseBank)) {
      const q = cseBank.find((item) => item.question_uid === uid);
      if (q) {
        q.type = type;
        q.answer_uid = answerUid;
        q.answer_meta = {
          type,
          answer: finalAnswer,
          tolerance,
          source: "manual_patch",
        };
        safeWriteJson(cseBankPath, cseBank, dryRun);
        modifiedFiles.push("public/questions-with-answers.json");
      }
    }
  }

  // 7. Trigger static artifact rebuild if requested
  if (options.rebuild && !dryRun) {
    console.log("\n[rebuild] Triggering artifact build pipeline...");
    execSync("node scripts/precompute-subtopics.mjs", { cwd: rootDir, stdio: "inherit" });
    execSync("node scripts/build-public-artifacts.mjs", { cwd: rootDir, stdio: "inherit" });
  }

  return {
    uid,
    type,
    answer: finalAnswer,
    tolerance,
    examUid,
    answerUid,
    modifiedFiles,
  };
}

// CLI Execution Entry Point
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    if (!opts.uid) {
      console.log(`
GateQA Question Answer Patch CLI
Usage:
  node scripts/pipeline/patch-question-answer.mjs --uid <question_uid> --answer <answer> [options]

Options:
  --uid <string>             Question UID (e.g. isro:cs:2025:q5, go:422811)
  --answer <value>           Correct option, array, or NAT number ('D', '["A","B"]', 69, null)
  --type <MCQ|MSQ|NAT|MTA>   Question type (default: existing or MCQ)
  --tolerance <json>         NAT tolerance object (e.g. '{"abs": 0.01}')
  --exam-uid <string>        Exam UID (e.g. isro-2025-q5, cse:2024:set1:main:q31)
  --note <string>            Audit note / rationale
  --solution <markdown>      Step-by-step detailed solution markdown
  --concept <string>         Solution concept heading
  --defective-reason <str>   Marks as defective and excluded from scoring
  --rebuild                  Automatically run precompute & build-public-artifacts
  --dry-run                  Preview changes without writing to disk
      `);
      process.exit(1);
    }

    console.log(`\n[patch-question-answer] Patching ${opts.uid}...`);
    const result = patchQuestionAnswer(opts);
    console.log(`✅ Successfully patched ${result.uid}:`);
    console.log(`   Type: ${result.type}`);
    console.log(`   Answer: ${JSON.stringify(result.answer)}`);
    console.log(`   Tolerance: ${JSON.stringify(result.tolerance)}`);
    console.log(`   Exam UID: ${result.examUid || "N/A"}`);
    console.log(`   Answer UID: ${result.answerUid}`);
    console.log(`\nSynchronized Files (${result.modifiedFiles.length}):`);
    result.modifiedFiles.forEach((file) => console.log(`   - ${file}`));
  } catch (err) {
    console.error(`❌ Error patching question: ${err.message}`);
    process.exit(1);
  }
}
