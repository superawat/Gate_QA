import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

const DEFAULT_INPUT_DIR = path.join(ROOT, "artifacts", "aptitude-pipeline", "aptitude-pending-by-year");
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "artifacts", "aptitude-pipeline", "aptitude-auto-pending");
const DEFAULT_PARSED_PATH = path.join(ROOT, "artifacts", "aptitude-pipeline", "parsed-questions.json");
const DEFAULT_COVERAGE_ALIAS_PATH = path.join(ROOT, "artifacts", "aptitude-pipeline", "aptitude-paper-coverage-aliases.json");
const DEFAULT_REPORT_PATH = path.join(ROOT, "artifacts", "review", "aptitude-yearwise-parse-coverage.json");
const CATALOG_RE = /^aptitude-pending-\d{4}(?:-\d+)?-catalog\.json$/i;

function resolveRepoPath(value) {
  if (!value) return null;
  return path.isAbsolute(value) ? value : path.resolve(ROOT, value);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    inputs: [],
    inputDir: DEFAULT_INPUT_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    parsed: DEFAULT_PARSED_PATH,
    coverageAliases: DEFAULT_COVERAGE_ALIAS_PATH,
    report: DEFAULT_REPORT_PATH,
    maxRuntimeMinutes: "180",
    concurrency: "1",
    requestTimeout: "90000",
    delay: "2000",
    checkpointEvery: "5",
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      options.inputs.push(argv[++index]);
    } else if (arg.startsWith("--input=")) {
      options.inputs.push(arg.slice("--input=".length));
    } else if (arg === "--input-dir" && argv[index + 1]) {
      options.inputDir = argv[++index];
    } else if (arg === "--output-dir" && argv[index + 1]) {
      options.outputDir = argv[++index];
    } else if (arg === "--parsed" && argv[index + 1]) {
      options.parsed = argv[++index];
    } else if (arg === "--coverage-aliases" && argv[index + 1]) {
      options.coverageAliases = argv[++index];
    } else if (arg === "--report" && argv[index + 1]) {
      options.report = argv[++index];
    } else if (arg === "--max-runtime-minutes" && argv[index + 1]) {
      options.maxRuntimeMinutes = argv[++index];
    } else if (arg === "--concurrency" && argv[index + 1]) {
      options.concurrency = argv[++index];
    } else if (arg === "--request-timeout" && argv[index + 1]) {
      options.requestTimeout = argv[++index];
    } else if (arg === "--delay" && argv[index + 1]) {
      options.delay = argv[++index];
    } else if (arg === "--checkpoint-every" && argv[index + 1]) {
      options.checkpointEvery = argv[++index];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return {
    ...options,
    inputs: options.inputs.map(resolveRepoPath),
    inputDir: resolveRepoPath(options.inputDir),
    outputDir: resolveRepoPath(options.outputDir),
    parsed: resolveRepoPath(options.parsed),
    coverageAliases: resolveRepoPath(options.coverageAliases),
    report: resolveRepoPath(options.report),
  };
}

function discoverInputs(options) {
  if (options.inputs.length > 0) return options.inputs;
  if (!fs.existsSync(options.inputDir)) {
    throw new Error(`Input directory not found: ${path.relative(ROOT, options.inputDir)}`);
  }
  return fs
    .readdirSync(options.inputDir)
    .filter((name) => CATALOG_RE.test(name))
    .sort((left, right) => left.localeCompare(right))
    .map((name) => path.join(options.inputDir, name));
}

function runNode(scriptRelativePath, args) {
  const result = spawnSync(
    process.execPath,
    [path.join(ROOT, scriptRelativePath), ...args],
    {
      cwd: ROOT,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${scriptRelativePath} exited with status ${result.status}`);
  }
}

function rebuildPendingCatalogs(options, inputs) {
  const splitArgs = inputs.flatMap((input) => ["--input", input]);
  splitArgs.push("--parsed", options.parsed);
  splitArgs.push("--coverage-aliases", options.coverageAliases);
  splitArgs.push("--output-dir", options.outputDir);
  splitArgs.push("--report", options.report);
  runNode("scripts/aptitude-pipeline/split-pending-catalog-by-year.mjs", splitArgs);
}

function loadWrittenCatalogs(reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  return {
    totals: report.totals,
    catalogs: (report.writtenCatalogs || [])
      .filter((entry) => Number(entry.paperCount || 0) > 0)
      .map((entry) => ({
        ...entry,
        absolutePath: path.join(ROOT, entry.path),
      })),
  };
}

function scrapeCatalog(options, catalogPath) {
  runNode("scripts/aptitude-pipeline/scrape-aptitude.mjs", [
    "--resume",
    "--catalog",
    catalogPath,
    "--max-runtime-minutes",
    options.maxRuntimeMinutes,
    "--concurrency",
    options.concurrency,
    "--request-timeout",
    options.requestTimeout,
    "--delay",
    options.delay,
    "--checkpoint-every",
    options.checkpointEvery,
  ]);
}

function main() {
  const options = parseArgs();
  const inputs = discoverInputs(options);
  if (inputs.length === 0) {
    console.log("[aptitude] No source catalogs found.");
    return;
  }

  console.log(`[aptitude] Source catalogs: ${inputs.length}`);
  rebuildPendingCatalogs(options, inputs);

  const { totals, catalogs } = loadWrittenCatalogs(options.report);
  console.log(
    `[aptitude] Pending after parsed-skip: ${totals.pendingPapers} papers `
    + `(parsed ${totals.parsedPapers}/${totals.totalPapers}).`
  );

  if (options.dryRun || catalogs.length === 0) {
    console.log(`[aptitude] Catalogs to parse: ${catalogs.length}`);
    return;
  }

  for (const catalog of catalogs) {
    console.log(`[aptitude] Parsing ${catalog.year}: ${catalog.paperCount} pending papers`);
    scrapeCatalog(options, catalog.absolutePath);
  }

  console.log("[aptitude] Refreshing coverage after parse.");
  rebuildPendingCatalogs(options, inputs);
}

main();
