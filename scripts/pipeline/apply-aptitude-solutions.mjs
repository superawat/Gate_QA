import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const solutionsFile = args.find((a) => a.startsWith("--solutions="))?.split("=")[1];
const targetShard = args.find((a) => a.startsWith("--target="))?.split("=")[1] || "public/data/aptitude/english/spot-the-error.json";

if (!solutionsFile || !fs.existsSync(solutionsFile)) {
  console.error("Usage: node scripts/pipeline/apply-aptitude-solutions.mjs --solutions=path/to/solutions.json --target=path/to/shard.json");
  process.exit(1);
}

const solutions = JSON.parse(fs.readFileSync(solutionsFile, "utf8"));
const shard = JSON.parse(fs.readFileSync(targetShard, "utf8"));

let updated = 0;
shard.forEach((q) => {
  if (solutions[q.uid]) {
    q.detailed_solution = solutions[q.uid];
    updated++;
  }
});

fs.writeFileSync(targetShard, JSON.stringify(shard, null, 2), "utf8");
console.log(`Successfully updated ${updated} questions in ${targetShard}! Total with solutions: ${shard.filter(q => q.detailed_solution).length} / ${shard.length}`);

