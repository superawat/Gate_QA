import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { QuestionService } from "../src/services/QuestionService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT_DIR, "public", "questions-with-answers.json");

function csvEscape(value) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

function writeCsv(filename, headers, rows) {
  const outputPath = path.join(ROOT_DIR, filename);
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  });
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
}

function collectSubjectEvidence(question) {
  const tags = Array.isArray(question.tags) ? question.tags : [];
  const normalizedTagSet = new Set(tags.map((tag) => QuestionService.normalizeString(tag)));
  const explicitCandidates = new Set();
  const inferredCandidates = new Set();

  Object.keys(QuestionService.TOPIC_HIERARCHY).forEach((subjectLabel) => {
    const aliases = QuestionService.getNormalizedSubjectAliases(subjectLabel);
    if (aliases.some((alias) => normalizedTagSet.has(alias))) {
      explicitCandidates.add(subjectLabel);
    }

    const subtopics = QuestionService.TOPIC_HIERARCHY[subjectLabel] || [];
    if (
      subtopics.some((subtopic) =>
        normalizedTagSet.has(QuestionService.normalizeString(subtopic))
      )
    ) {
      inferredCandidates.add(subjectLabel);
    }
  });

  const allCandidates = new Set([...explicitCandidates, ...inferredCandidates]);
  return {
    explicitCandidates: Array.from(explicitCandidates).sort((a, b) => a.localeCompare(b)),
    inferredCandidates: Array.from(inferredCandidates).sort((a, b) => a.localeCompare(b)),
    allCandidates: Array.from(allCandidates).sort((a, b) => a.localeCompare(b)),
  };
}

function main() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Dataset not found: ${DATA_PATH}`);
  }

  const rawQuestions = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  if (!Array.isArray(rawQuestions)) {
    throw new Error("questions-with-answers.json must contain an array");
  }

  const canonicalQuestions = rawQuestions.map((question) =>
    QuestionService.normalizeQuestion(question)
  );

  const countsBySubject = new Map();
  const countsByYearSet = new Map();
  const unknownSubjectRows = [];
  const conflictRows = [];

  canonicalQuestions.forEach((question) => {
    const subjectSlug = question.subjectSlug || "unknown";
    const subjectLabel = QuestionService.getSubjectLabelBySlug(subjectSlug);
    const yearSetKey = question.exam?.yearSetKey || "unknown";
    const yearSetLabel = question.exam?.label || "Unknown";

    countsBySubject.set(
      subjectSlug,
      (countsBySubject.get(subjectSlug) || 0) + 1
    );

    if (!countsByYearSet.has(yearSetKey)) {
      countsByYearSet.set(yearSetKey, {
        key: yearSetKey,
        label: yearSetLabel,
        year: Number.isFinite(question.exam?.year) ? question.exam.year : 0,
        set: Number.isFinite(question.exam?.set) ? question.exam.set : 0,
        count: 0,
      });
    }
    countsByYearSet.get(yearSetKey).count += 1;

    const evidence = collectSubjectEvidence(question);
    const reasonParts = [];
    if (!evidence.allCandidates.length) {
      reasonParts.push("no_subject_match_from_whitelist");
    }
    if (subjectSlug === "unknown" && evidence.allCandidates.length) {
      reasonParts.push("mapped_to_unknown_after_resolution");
    }

    if (subjectSlug === "unknown") {
      unknownSubjectRows.push({
        uid: question.question_uid,
        reason: reasonParts.join(";") || "unknown_subject",
        title: question.title,
        tags: (question.tagsRaw || []).join(";"),
      });
    }

    if (evidence.allCandidates.length > 1) {
      conflictRows.push({
        uid: question.question_uid,
        explicit_candidates: evidence.explicitCandidates.join(";"),
        inferred_candidates: evidence.inferredCandidates.join(";"),
        selected_subject_slug: subjectSlug,
        selected_subject_label: subjectLabel,
        reason: "multiple_subject_candidates",
        title: question.title,
        tags: (question.tagsRaw || []).join(";"),
      });
    }
  });

  const subjectRows = QuestionService.SUBJECT_ENUM.map((subject) => ({
    subject_slug: subject.slug,
    subject_label: subject.label,
    count: countsBySubject.get(subject.slug) || 0,
  }));
  subjectRows.push({
    subject_slug: "unknown",
    subject_label: "Unknown",
    count: countsBySubject.get("unknown") || 0,
  });

  const yearSetRows = Array.from(countsByYearSet.values())
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return (b.set || 0) - (a.set || 0);
    })
    .map((entry) => ({
      yearset_key: entry.key,
      yearset_label: entry.label,
      count: entry.count,
    }));

  const leakageRows = QuestionService.SUBJECT_ENUM.map((subject) => {
    const filtered = canonicalQuestions.filter(
      (question) => question.subjectSlug === subject.slug
    );
    const leakageCount = filtered.filter(
      (question) => question.subjectSlug !== subject.slug
    ).length;
    return {
      subject_slug: subject.slug,
      subject_label: subject.label,
      filtered_count: filtered.length,
      leakage_count: leakageCount,
      status: leakageCount === 0 ? "PASS" : "FAIL",
    };
  });

  writeCsv("counts_by_subject.csv", ["subject_slug", "subject_label", "count"], subjectRows);
  writeCsv("counts_by_yearset.csv", ["yearset_key", "yearset_label", "count"], yearSetRows);
  writeCsv("unknown_subject.csv", ["uid", "reason", "title", "tags"], unknownSubjectRows);
  writeCsv(
    "subject_conflicts.csv",
    [
      "uid",
      "explicit_candidates",
      "inferred_candidates",
      "selected_subject_slug",
      "selected_subject_label",
      "reason",
      "title",
      "tags",
    ],
    conflictRows
  );
  writeCsv(
    "leakage_test.csv",
    ["subject_slug", "subject_label", "filtered_count", "leakage_count", "status"],
    leakageRows
  );

  console.log(
    `Canonical audit complete: ${canonicalQuestions.length} questions analyzed`
  );
}

main();
