import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  classifyCatalogJob,
  createDecisionReport,
  recordDecision,
} from './bossxcode-intake-classifier.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--input' && i + 1 < args.length) options.input = args[++i];
    else if (arg === '--output' && i + 1 < args.length) options.output = args[++i];
    else if (arg === '--include-series' && i + 1 < args.length) options.includeSeries = new RegExp(args[++i], 'i');
    else if (arg === '--include-paper' && i + 1 < args.length) options.includePaper = new RegExp(args[++i], 'i');
    else if (arg === '--include-test-type' && i + 1 < args.length) options.includeTestType = new RegExp(args[++i], 'i');
    else if (arg === '--exclude-test-type' && i + 1 < args.length) options.excludeTestType = new RegExp(args[++i], 'i');
    else if (arg === '--exclude' && i + 1 < args.length) options.exclude = new RegExp(args[++i], 'i');
    else if (arg === '--exclude-parsed' && i + 1 < args.length) options.excludeParsed = args[++i];
    else if (arg === '--max-papers' && i + 1 < args.length) options.maxPapers = parseInt(args[++i], 10);
    else if (arg === '--report' && i + 1 < args.length) options.report = args[++i];
  }
  
  return options;
}

function paperSourceUrl(baseUrl, paperPack = '') {
  const url = new URL('/play', baseUrl);
  const paperHash = crypto.createHash('sha1').update(String(paperPack || '')).digest('hex').slice(0, 16);
  url.hash = `paper-${paperHash}`;
  return url.href;
}

function sourceEntries(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === 'object');
  if (value && typeof value === 'object') return [value];
  return [];
}

function loadParsedPageUrls(parsedPath) {
  if (!parsedPath) return new Set();
  const rows = JSON.parse(fs.readFileSync(path.resolve(parsedPath), 'utf8'));
  return new Set(
    rows
      .flatMap((row) => sourceEntries(row?._source))
      .map((source) => source.pageUrl)
      .filter(Boolean)
  );
}

function mergeReasonCounts(...groups) {
  const merged = {};
  for (const group of groups) {
    for (const [reason, count] of Object.entries(group || {})) {
      merged[reason] = (merged[reason] || 0) + count;
    }
  }
  return merged;
}

function main() {
  const options = parseArgs();
  
  if (!options.input || !options.output) {
    console.error('Usage: node filter-bossxcode-catalog.mjs --input <in.json> --output <out.json> [filters...]');
    process.exit(1);
  }

  console.log(`Reading from ${options.input}`);
  const catalogStr = fs.readFileSync(path.resolve(options.input), 'utf8');
  const catalog = JSON.parse(catalogStr);
  if (!Array.isArray(catalog.seriesJobs)) {
    console.error('Input catalog must contain a seriesJobs array.');
    process.exit(1);
  }
  const parsedPageUrls = loadParsedPageUrls(options.excludeParsed);
  const baseUrl = catalog.baseUrl || 'https://pt.bossxcode.unaux.com/';
  
  let newSeriesJobs = [];
  let totalPapers = 0;
  let parsedPapersSkipped = 0;
  let reachedMax = false;
  const intakeReport = createDecisionReport();
  const manualIgnored = {};

  function countManual(reason) {
    manualIgnored[reason] = (manualIgnored[reason] || 0) + 1;
  }

  for (const job of catalog.seriesJobs) {
    if (reachedMax) break;

    const seriesTitle = [
      job.seriesChoice?.title,
      job.seriesChoice?.label,
      job.contextInfo?.series,
      job.contextInfo?.testSeries,
    ].filter(Boolean).join(' ');
    const testTypeTitle = [
      job.testTypeChoice?.title,
      job.contextInfo?.testType,
    ].filter(Boolean).join(' ');
    
    // Check series include
    if (options.includeSeries && !options.includeSeries.test(seriesTitle)) {
      countManual('manual_include_series_miss');
      continue;
    }
    if (options.includeTestType && !options.includeTestType.test(testTypeTitle)) {
      countManual('manual_include_test_type_miss');
      continue;
    }
    
    // Check exclude on series
    if (options.exclude && options.exclude.test(seriesTitle)) {
      countManual('manual_exclude_series');
      continue;
    }
    if (options.excludeTestType && options.excludeTestType.test(testTypeTitle)) {
      countManual('manual_exclude_test_type');
      continue;
    }

    const seriesDecision = classifyCatalogJob(job);
    recordDecision(intakeReport, 'series', seriesDecision);
    if (seriesDecision.action === 'ignore') {
      continue;
    }
    
    let filteredPapers = [];
    const paperChoices = Array.isArray(job.paperChoices) ? job.paperChoices : [];
    for (const paper of paperChoices) {
      const paperTitle = [paper.title, paper.label, paper.value, paper.text].filter(Boolean).join(' ');
      
      // Check paper include
      if (options.includePaper && !options.includePaper.test(paperTitle)) {
        countManual('manual_include_paper_miss');
        continue;
      }
      
      // Check exclude on paper
      if (options.exclude && options.exclude.test(paperTitle)) {
        countManual('manual_exclude_paper');
        continue;
      }
      const paperDecision = classifyCatalogJob(job, paper);
      recordDecision(intakeReport, 'papers', paperDecision);
      if (paperDecision.action === 'ignore') {
        continue;
      }
      if (parsedPageUrls.has(paperSourceUrl(baseUrl, paper.value))) {
        parsedPapersSkipped += 1;
        countManual('duplicate_parsed_paper');
        continue;
      }
      
      filteredPapers.push(paper);
      
      if (options.maxPapers && (totalPapers + filteredPapers.length) >= options.maxPapers) {
        reachedMax = true;
        break;
      }
    }
    
    if (filteredPapers.length > 0) {
      newSeriesJobs.push({
        ...job,
        paperChoices: filteredPapers
      });
      totalPapers += filteredPapers.length;
    }
  }

  const newCatalog = {
    ...catalog,
    seriesJobs: newSeriesJobs,
    seriesJobCount: newSeriesJobs.length,
    paperCount: totalPapers
  };

  const outputPath = path.resolve(options.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(newCatalog, null, 2)}\n`);
  const reportPath = path.resolve(options.report || options.output.replace(/\.json$/i, '-report.json'));
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify({
      version: 1,
      generatedAt: new Date().toISOString(),
      input: path.relative(process.cwd(), path.resolve(options.input)),
      output: path.relative(process.cwd(), outputPath),
      attemptedSeries: intakeReport.series.attempted,
      attemptedPapers: intakeReport.papers.attempted,
      ignored: {
        series: intakeReport.series.ignored,
        papers: intakeReport.papers.ignored,
        byReason: mergeReasonCounts(intakeReport.series.ignoredByReason, intakeReport.papers.ignoredByReason, manualIgnored),
      },
      parsedPapersSkipped,
      finalSeries: newSeriesJobs.length,
      finalPapers: totalPapers,
    }, null, 2)}\n`
  );
  console.log(`Wrote ${newSeriesJobs.length} series and ${totalPapers} papers to ${options.output}`);
  console.log(`Intake report: ${reportPath}`);
  if (options.excludeParsed) {
    console.log(`Skipped ${parsedPapersSkipped} already-parsed papers from ${options.excludeParsed}`);
  }
}

main();
