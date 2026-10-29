#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT, "public");
const SHARDS_DIR = path.join(PUBLIC_DIR, "question-detail-shards");
const DATA_DIR = path.join(PUBLIC_DIR, "data");

const BRANCHES = ["ec", "ee", "me", "ce"];

export function generateBranchSearchIndices() {
  const stats = {};

  for (const branch of BRANCHES) {
    const branchDir = path.join(DATA_DIR, branch);
    fs.mkdirSync(branchDir, { recursive: true });

    const shardFiles = fs
      .readdirSync(SHARDS_DIR)
      .filter((f) => f.startsWith(`${branch}-`) && f.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));

    const questions = [];
    const subjectsMap = new Map();
    const subtopicsBySubjectMap = new Map();
    const yearsSet = new Set();
    const yearSetsMap = new Map();

    for (const file of shardFiles) {
      const filePath = path.join(SHARDS_DIR, file);
      const shardData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const year = Number(shardData.year);
      const set = Number(shardData.set || 1);
      const yearSetKey = shardData.yearSetKey || `${branch}-${year}-s${set}`;
      const yearSetIdentity = shardData.yearSetIdentity || `${branch}:${year}:set-${set}`;
      const yearSetLabel = shardData.label || `${year} Set ${set}`;

      yearsSet.add(year);
      if (!yearSetsMap.has(yearSetIdentity)) {
        yearSetsMap.set(yearSetIdentity, {
          key: yearSetKey,
          identity: yearSetIdentity,
          label: yearSetLabel,
          year,
          set,
          track: branch,
        });
      }

      for (const [uid, q] of Object.entries(shardData.recordsByQuestionUid || {})) {
        const taxonomy = q.taxonomy || {};
        const primary = taxonomy.primary || {};
        const rawSubjectSlug = primary.subjectSlug || `${branch}-core`;
        const rawSubjectLabel = primary.subjectLabel || `${branch.toUpperCase()} Core Engineering`;
        const subtopicSlug = primary.subtopicSlug || "general";
        const subtopicLabel = primary.subtopicLabel || "General";

        // Register subject
        if (!subjectsMap.has(rawSubjectSlug)) {
          subjectsMap.set(rawSubjectSlug, {
            slug: rawSubjectSlug,
            label: rawSubjectLabel,
          });
        }

        // Register subtopic
        if (!subtopicsBySubjectMap.has(rawSubjectSlug)) {
          subtopicsBySubjectMap.set(rawSubjectSlug, new Map());
        }
        const subMap = subtopicsBySubjectMap.get(rawSubjectSlug);
        if (!subMap.has(subtopicSlug)) {
          subMap.set(subtopicSlug, {
            slug: subtopicSlug,
            label: subtopicLabel,
          });
        }

        const preview = String(q.question || "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 220);

        const questionText = String(q.question || "");
        const searchText = [
          q.title,
          rawSubjectLabel,
          subtopicLabel,
          yearSetLabel,
          questionText.replace(/<[^>]*>/g, " "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        questions.push({
          question_uid: uid,
          exam_uid: q.exam_uid || `${branch}:${year}:set${set}:q${q.qNum || 0}`,
          title: q.title || `GATE ${branch.toUpperCase()} ${year} | Question`,
          section: q.section || (rawSubjectSlug === "ga" ? "ga" : "main"),
          question_number: q.question_number ?? null,
          solution_link: q.solution_link ?? null,
          track: branch,
          year,
          set,
          yearSetKey,
          yearSetIdentity,
          yearSetLabel,
          detailShardKey: shardData.shardKey || file.replace(".json", ""),
          type: q.type || "MCQ",
          marks: q.marks || 1,
          preview,
          searchText,
          subject: rawSubjectLabel,
          subjectSlug: rawSubjectSlug,
          subjectLabel: rawSubjectLabel,
          subtopics: [{ slug: subtopicSlug, label: subtopicLabel }],
          taxonomy: {
            primary: {
              subjectSlug: rawSubjectSlug,
              subjectLabel: rawSubjectLabel,
              subtopicSlug,
              subtopicLabel,
            },
            secondary: [],
            conceptTags: [rawSubjectSlug, subtopicSlug],
          },
          tags: [
            `gate${branch}-${year}`,
            `gate${branch}-${year}-set${set}`,
            rawSubjectSlug,
            subtopicSlug,
            (q.type || "mcq").toLowerCase(),
          ],
        });
      }
    }

    const yearsList = Array.from(yearsSet).sort((a, b) => b - a);
    const minYear = yearsList.length ? Math.min(...yearsList) : 2001;
    const maxYear = yearsList.length ? Math.max(...yearsList) : 2026;

    const subjectsList = Array.from(subjectsMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );

    const structuredSubtopics = {};
    for (const [subSlug, subMap] of subtopicsBySubjectMap.entries()) {
      structuredSubtopics[subSlug] = Array.from(subMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      );
    }

    const outPath = path.join(branchDir, "search-index.json");
    let generatedAt = new Date().toISOString();
    if (fs.existsSync(outPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(outPath, "utf-8"));
        if (
          existing.questionCount === questions.length &&
          existing.minYear === minYear &&
          existing.maxYear === maxYear &&
          JSON.stringify(existing.questions) === JSON.stringify(questions) &&
          JSON.stringify(existing.subjects) === JSON.stringify(subjectsList) &&
          JSON.stringify(existing.structuredSubtopics) === JSON.stringify(structuredSubtopics) &&
          JSON.stringify(existing.yearSets) === JSON.stringify(Array.from(yearSetsMap.values()).sort((a, b) => b.year - a.year || b.set - a.set))
        ) {
          generatedAt = existing.generatedAt || generatedAt;
        }
      } catch (_) {}
    }

    const payload = {
      version: `${branch}-v1`,
      generatedAt,
      track: branch,
      questionCount: questions.length,
      minYear,
      maxYear,
      years: yearsList,
      yearSets: Array.from(yearSetsMap.values()).sort((a, b) => b.year - a.year || b.set - a.set),
      subjects: subjectsList,
      structuredSubtopics,
      questions,
    };

    const nextContent = JSON.stringify(payload, null, 2).replace(/\r\n/g, "\n");
    let wrote = true;
    if (fs.existsSync(outPath)) {
      try {
        const currentContent = fs.readFileSync(outPath, "utf-8").replace(/\r\n/g, "\n");
        if (currentContent === nextContent) {
          wrote = false;
        }
      } catch (_) {}
    }
    if (wrote) {
      fs.writeFileSync(outPath, nextContent, "utf-8");
    }
    const sizeMb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
    if (wrote) {
      console.log(`✅ [${branch.toUpperCase()}] Built search index: ${outPath} (${questions.length} Qs, ${sizeMb} MB)`);
    } else {
      console.log(`⚡ [${branch.toUpperCase()}] Unchanged search index: ${outPath} (${questions.length} Qs, ${sizeMb} MB)`);
    }

    stats[branch] = {
      questions: questions.length,
      shards: shardFiles.length,
      subjects: subjectsList.length,
      minYear,
      maxYear,
    };
  }

  return stats;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const stats = generateBranchSearchIndices();
  console.log("Summary:", stats);
}
