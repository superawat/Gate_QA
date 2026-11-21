import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const aptitudeRoot = path.join(root, "public/data/aptitude");
const summary = [];
const seenUids = new Set();
const duplicateUids = [];
const invalidSolutions = [];

for (const discipline of fs.readdirSync(aptitudeRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const directory = path.join(aptitudeRoot, discipline.name);
  const files = fs.readdirSync(directory).filter((name) => name.endsWith(".json"));
  const questions = files.flatMap((name) => {
    const parsed = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error(`${path.relative(root, path.join(directory, name))} is not a question array`);
    }
    return parsed;
  });
  let withSolution = 0;

  for (const question of questions) {
    if (!question.uid) continue;
    if (seenUids.has(question.uid)) duplicateUids.push(question.uid);
    seenUids.add(question.uid);

    const solution = question.detailed_solution;
    const markdown = typeof solution === "string" ? solution : solution?.markdown;
    if (markdown && markdown.trim()) withSolution += 1;
    else if (solution != null) invalidSolutions.push(question.uid);
  }

  summary.push({
    discipline: discipline.name,
    shards: files.length,
    questions: questions.length,
    withSolution,
    withoutSolution: questions.length - withSolution,
  });
}

const totals = summary.reduce(
  (result, row) => {
    result.shards += row.shards;
    result.questions += row.questions;
    result.withSolution += row.withSolution;
    result.withoutSolution += row.withoutSolution;
    return result;
  },
  { shards: 0, questions: 0, withSolution: 0, withoutSolution: 0 },
);

console.log(JSON.stringify({ summary, totals, duplicateUids, invalidSolutions }, null, 2));
