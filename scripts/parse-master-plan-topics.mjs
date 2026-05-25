import fs from "fs";
import path from "path";

const masterPlanPath = path.resolve("gateqa_master_plan.md");
const outputPath = path.resolve("src/generated/highPriorityStaticData.js");

function slugifyToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Map raw subject text from the master plan headings to canonical subject slugs
function resolveSubjectSlug(rawText) {
  const t = rawText.trim().toLowerCase();
  if (t.startsWith("algorithms")) return "algorithms";
  if (t.startsWith("co &") || t.startsWith("co&") || t.includes("architecture")) return "coa";
  if (t.startsWith("compiler")) return "compiler";
  if (t.startsWith("computer network")) return "cn";
  if (t.startsWith("database")) return "dbms";
  if (t.startsWith("digital logic")) return "digital-logic";
  if (t.startsWith("discrete math")) return "discrete-math";
  if (t.startsWith("engineering math")) return "engg-math";
  if (t.startsWith("general aptitude")) return "ga";
  if (t.startsWith("operating system")) return "os";
  if (t.startsWith("programming and ds") || t.startsWith("programming and data")) return "prog-ds";
  if (t.startsWith("programming in c") || (t.startsWith("programming") && t.includes(":"))) return "prog-c";
  if (t === "programming") return "prog-c";
  if (t.startsWith("theory of computation")) return "toc";
  return "legacy-other";
}

const SUBJECT_LABELS = {
  algorithms: "Algorithms",
  coa: "CO & Architecture",
  compiler: "Compiler Design",
  cn: "Computer Networks",
  dbms: "Databases",
  "digital-logic": "Digital Logic",
  "discrete-math": "Discrete Mathematics",
  "engg-math": "Engineering Mathematics",
  ga: "General Aptitude",
  os: "Operating System",
  "prog-ds": "Programming and DS",
  "prog-c": "Programming in C",
  toc: "Theory of Computation",
  "legacy-other": "Other / Optional",
};

function run() {
  if (!fs.existsSync(masterPlanPath)) {
    console.error("Master plan file not found!");
    process.exit(1);
  }

  const content = fs.readFileSync(masterPlanPath, "utf-8");
  const lines = content.split(/\r?\n/);

  // Find the first "## Table of Contents" or the first "topic insights data" marker
  let dataStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].trim() === "## Table of Contents" ||
      lines[i].trim().toLowerCase().includes("topic insights data")
    ) {
      dataStartIndex = i;
      break;
    }
  }

  if (dataStartIndex === -1) {
    console.error("Topic data section not found in master plan!");
    process.exit(1);
  }

  const dataLines = lines.slice(dataStartIndex);

  // Parse all subject headings and subtopic lines
  // Heading format: ## N Subject (count) or ## N Subject: SubCategory (count)
  const frequencies = [];
  const subjectCategories = []; // { subjectSlug, subjectLabel, category, categorySlug, totalCount }

  let currentSubjectSlug = "";
  let currentSubjectLabel = "";
  let currentCategory = ""; // Sub-category like "Combinatory", "Graph Theory", etc.
  let currentCategorySlug = "";
  let currentCategoryCount = 0;

  for (const line of dataLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match subject heading: ## N Subject (count)  or  ## N Subject: SubCategory (count)
    const headingMatch = trimmed.match(
      /^##\s+\d+\s+([^(]+)\s*\((\d+)\)/
    );
    if (headingMatch) {
      const rawTitle = headingMatch[1].trim();
      const totalCount = parseInt(headingMatch[2], 10);

      // Check if this contains a sub-category after a colon
      let mainSubject = rawTitle;
      let category = "";
      if (rawTitle.includes(":")) {
        const parts = rawTitle.split(":");
        mainSubject = parts[0].trim();
        category = parts.slice(1).join(":").trim();
      }

      currentSubjectSlug = resolveSubjectSlug(mainSubject);
      currentSubjectLabel = SUBJECT_LABELS[currentSubjectSlug] || mainSubject;
      currentCategory = category;
      currentCategorySlug = category ? slugifyToken(category) : "";
      currentCategoryCount = totalCount;

      // Record the sub-category grouping
      if (category) {
        subjectCategories.push({
          subjectSlug: currentSubjectSlug,
          subjectLabel: currentSubjectLabel,
          category,
          categorySlug: currentCategorySlug,
          totalCount,
        });
      } else {
        // Flat subject without sub-category
        subjectCategories.push({
          subjectSlug: currentSubjectSlug,
          subjectLabel: currentSubjectLabel,
          category: "",
          categorySlug: "",
          totalCount,
        });
      }
      continue;
    }

    // Match subtopic line: N.N Subtopic Name (count)
    const subtopicMatch = trimmed.match(/^\d+\.\d+\s+([^(]+)\s+\((\d+)\)/);
    if (subtopicMatch && currentSubjectSlug) {
      const subtopicLabel = subtopicMatch[1].trim();
      const count = parseInt(subtopicMatch[2], 10);
      const subtopicSlug = slugifyToken(subtopicLabel);

      frequencies.push({
        subjectSlug: currentSubjectSlug,
        subjectLabel: currentSubjectLabel,
        category: currentCategory,
        categorySlug: currentCategorySlug,
        subtopicSlug,
        subtopicLabel,
        count,
      });
    }
  }

  // Deduplicate: if same subject:subtopic appears multiple times, keep the max count
  const deduped = new Map();
  for (const item of frequencies) {
    const key = `${item.subjectSlug}:${item.subtopicSlug}`;
    const existing = deduped.get(key);
    if (!existing || item.count > existing.count) {
      deduped.set(key, item);
    }
  }
  const dedupedFrequencies = Array.from(deduped.values());

  // Build subject-level category summary (deduplicated)
  const catMap = new Map();
  for (const cat of subjectCategories) {
    const key = `${cat.subjectSlug}:${cat.categorySlug || "__flat__"}`;
    if (!catMap.has(key) || cat.totalCount > catMap.get(key).totalCount) {
      catMap.set(key, cat);
    }
  }
  const dedupedCategories = Array.from(catMap.values());

  // Build subject totals from categories
  const subjectTotals = new Map();
  for (const cat of dedupedCategories) {
    const prev = subjectTotals.get(cat.subjectSlug) || {
      subjectSlug: cat.subjectSlug,
      subjectLabel: cat.subjectLabel,
      totalQuestions: 0,
      categories: [],
    };
    prev.totalQuestions += cat.totalCount;
    if (cat.category) {
      prev.categories.push({
        category: cat.category,
        categorySlug: cat.categorySlug,
        totalCount: cat.totalCount,
      });
    }
    subjectTotals.set(cat.subjectSlug, prev);
  }
  const subjectSummaries = Array.from(subjectTotals.values()).sort(
    (a, b) => b.totalQuestions - a.totalQuestions
  );

  // Output
  const jsContent = `// Automatically compiled from gateqa_master_plan.md topic distribution data.
// Source: GateOverflow marks-distribution (https://gateoverflow.in/marks-distribution)
// DO NOT EDIT DIRECTLY. Re-run: node scripts/parse-master-plan-topics.mjs

export const STATIC_TOPIC_FREQUENCIES = ${JSON.stringify(dedupedFrequencies, null, 2)};

export const SUBJECT_SUMMARIES = ${JSON.stringify(subjectSummaries, null, 2)};
`;

  fs.writeFileSync(outputPath, jsContent, "utf-8");
  console.log(
    `Compiled ${dedupedFrequencies.length} topic frequencies and ${subjectSummaries.length} subject summaries to ${outputPath}`
  );
}

run();
