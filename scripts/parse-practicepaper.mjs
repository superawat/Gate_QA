#!/usr/bin/env node

/**
 * scripts/parse-practicepaper.mjs
 *
 * Automated parser and comparator for practicepaper.in GATE CSE papers.
 * Extracts:
 *  - GateOverflow Question ID (go:<id>) and slug
 *  - Question type (MCQ / MSQ / NAT)
 *  - Correct answer / NAT ranges (data-value1 = min, data-value2 = max)
 *
 * Usage:
 *   node scripts/parse-practicepaper.mjs --url <URL>
 *   node scripts/parse-practicepaper.mjs --year 2015 --set 3
 *   node scripts/parse-practicepaper.mjs --compare --year 2015 --set 3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

export function getPracticePaperUrl(year, set = null) {
  const y = parseInt(year, 10);
  if (set && set !== '0' && set !== 0) {
    return `https://practicepaper.in/gate-cse/gate-cse-${y}-set-${set}`;
  }
  return `https://practicepaper.in/gate-cse/gate-cse-${y}`;
}

export async function parsePracticePaper(paperUrl) {
  console.log(`[PracticePaper] Fetching from ${paperUrl}...`);
  const questions = [];

  // PracticePaper pages have 5 questions per page (total 65 questions = 13 pages)
  for (let p = 1; p <= 13; p++) {
    const url = p === 1 ? paperUrl : `${paperUrl}?page_no=${p}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404 && p > 1) break;
        throw new Error(`HTTP ${res.status} fetching ${url}`);
      }
      const text = await res.text();
      const parts = text.split("<div class='question'>");

      for (let i = 1; i < parts.length; i++) {
        const qBlock = parts[i];

        // 1. Extract GateOverflow UID & tag
        const goMatch = qBlock.match(/gateoverflow\.in\/(\d+)(?:\/([^"#\s]+))?/i);
        const goId = goMatch ? `go:${goMatch[1]}` : null;
        const goTag = goMatch && goMatch[2] ? goMatch[2] : null;

        // 2. Question number & marks
        const qNumMatch = qBlock.match(/<div class='question_lable'>Question\s*(\d+)<\/div>/i);
        const qNum = qNumMatch ? parseInt(qNumMatch[1], 10) : questions.length + 1;
        const marksMatch = qBlock.match(/\|\s*(\d+)\s*Mark/i);
        const marks = marksMatch ? parseInt(marksMatch[1], 10) : 1;

        // 3. Question Type & Answer
        // Check NAT first
        const natMatch = qBlock.match(/class='checkansbtn'[^>]*data-value1='([^']+)'[^>]*data-value2='([^']+)'/i);
        if (natMatch) {
          const val1 = parseFloat(natMatch[1]);
          const val2 = parseFloat(natMatch[2]);
          const min = Math.min(val1, val2);
          const max = Math.max(val1, val2);
          questions.push({
            qNum,
            marks,
            goId,
            goTag,
            type: 'NAT',
            answer: { min, max }
          });
          continue;
        }

        // Check MCQ / MSQ
        const correctOptions = [];
        const rowMatches = [...qBlock.matchAll(/class='option_index_number'>([A-D])<\/div>[^<]*<div[^>]+class=['"]?mtq_correct_marker['"]?/gi)];
        for (const rm of rowMatches) {
          correctOptions.push(rm[1]);
        }

        if (correctOptions.length > 0) {
          questions.push({
            qNum,
            marks,
            goId,
            goTag,
            type: correctOptions.length > 1 ? 'MSQ' : 'MCQ',
            answer: correctOptions.length > 1 ? correctOptions : correctOptions[0]
          });
        } else {
          // Fallback: data-value=1 on tr
          const dataValRowMatches = [...qBlock.matchAll(/<tr[^>]+class='mtq_clickable'[^>]+data-value=1[^>]*>[\s\S]*?class='option_index_number'>([A-D])<\/div>/gi)];
          if (dataValRowMatches.length > 0) {
            const opts = dataValRowMatches.map(m => m[1]);
            questions.push({
              qNum,
              marks,
              goId,
              goTag,
              type: opts.length > 1 ? 'MSQ' : 'MCQ',
              answer: opts.length > 1 ? opts : opts[0]
            });
          } else {
            questions.push({
              qNum,
              marks,
              goId,
              goTag,
              type: 'UNKNOWN',
              answer: null
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[PracticePaper] Error fetching page ${p}: ${err.message}`);
      break;
    }
  }

  console.log(`[PracticePaper] Successfully parsed ${questions.length} questions.`);
  return questions;
}

export function compareWithGateQa(ppQuestions) {
  const answersPath = path.join(ROOT_DIR, 'public/data/answers/answers_by_question_uid_v1.json');
  if (!fs.existsSync(answersPath)) {
    throw new Error(`Answers file not found at ${answersPath}`);
  }
  const gateQaAnswers = JSON.parse(fs.readFileSync(answersPath, 'utf8'));

  let matches = 0;
  let mismatches = 0;
  let missing = 0;
  const discrepancies = [];

  for (const pp of ppQuestions) {
    if (!pp.goId) {
      missing++;
      discrepancies.push({
        ppQNum: pp.qNum,
        goId: null,
        issue: 'No GateOverflow ID found in PracticePaper question'
      });
      continue;
    }

    const gqa = gateQaAnswers[pp.goId];
    if (!gqa) {
      missing++;
      discrepancies.push({
        ppQNum: pp.qNum,
        goId: pp.goId,
        issue: 'Missing in GateQA answer registry'
      });
      continue;
    }

    if (pp.type === 'NAT') {
      if (gqa.type !== 'NAT') {
        mismatches++;
        discrepancies.push({
          ppQNum: pp.qNum,
          goId: pp.goId,
          issue: `Type mismatch: GateQA has ${gqa.type} (${gqa.answer}) vs PP has NAT [${pp.answer.min}, ${pp.answer.max}]`
        });
        continue;
      }
      const gqaAns = gqa.answer;
      const gqaTol = gqa.tolerance || {};
      const gqaMin = gqaTol.lower ?? (gqaAns - (gqaTol.abs ?? 0));
      const gqaMax = gqaTol.upper ?? (gqaAns + (gqaTol.abs ?? 0));

      const isMatch = Math.abs(gqaMin - pp.answer.min) <= 0.05 && Math.abs(gqaMax - pp.answer.max) <= 0.05;
      if (isMatch) {
        matches++;
      } else {
        mismatches++;
        discrepancies.push({
          ppQNum: pp.qNum,
          goId: pp.goId,
          issue: `NAT range: GateQA=[${gqaMin}, ${gqaMax}] vs PP=[${pp.answer.min}, ${pp.answer.max}]`
        });
      }
    } else {
      if (gqa.type !== pp.type) {
        mismatches++;
        discrepancies.push({
          ppQNum: pp.qNum,
          goId: pp.goId,
          issue: `Type mismatch: GateQA has ${gqa.type} vs PP has ${pp.type}`
        });
        continue;
      }
      if (JSON.stringify(gqa.answer) === JSON.stringify(pp.answer)) {
        matches++;
      } else {
        mismatches++;
        discrepancies.push({
          ppQNum: pp.qNum,
          goId: pp.goId,
          issue: `Answer mismatch: GateQA=${JSON.stringify(gqa.answer)} vs PP=${JSON.stringify(pp.answer)}`
        });
      }
    }
  }

  return {
    total: ppQuestions.length,
    matches,
    mismatches,
    missing,
    discrepancies
  };
}

async function main() {
  const args = process.argv.slice(2);
  let url = null;
  let year = null;
  let set = null;
  let doCompare = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      url = args[i + 1];
      i++;
    } else if (args[i] === '--year' && args[i + 1]) {
      year = args[i + 1];
      i++;
    } else if (args[i] === '--set' && args[i + 1]) {
      set = args[i + 1];
      i++;
    } else if (args[i] === '--compare') {
      doCompare = true;
    }
  }

  if (!url && year) {
    url = getPracticePaperUrl(year, set);
  }

  if (!url) {
    console.log(`
PracticePaper.in Parser & Validator
Usage:
  node scripts/parse-practicepaper.mjs --url <URL>
  node scripts/parse-practicepaper.mjs --year <YEAR> [--set <SET>] [--compare]
Examples:
  node scripts/parse-practicepaper.mjs --year 2015 --set 3 --compare
  node scripts/parse-practicepaper.mjs --url https://practicepaper.in/gate-cse/gate-cse-2014-set-1
    `);
    process.exit(0);
  }

  const parsed = await parsePracticePaper(url);
  console.log(`\nParsed summary for ${url}:`);
  console.log(`- Total: ${parsed.length}`);
  console.log(`- MCQs: ${parsed.filter(p => p.type === 'MCQ').length}`);
  console.log(`- MSQs: ${parsed.filter(p => p.type === 'MSQ').length}`);
  console.log(`- NATs: ${parsed.filter(p => p.type === 'NAT').length}`);

  if (doCompare) {
    const comp = compareWithGateQa(parsed);
    console.log(`\nComparison with GateQA:`);
    console.log(`- Matches: ${comp.matches} / ${comp.total}`);
    console.log(`- Mismatches: ${comp.mismatches}`);
    console.log(`- Missing: ${comp.missing}`);
    if (comp.discrepancies.length > 0) {
      console.log(`\nDiscrepancies:`);
      for (const d of comp.discrepancies) {
        console.log(`  [PP Q${d.ppQNum} ${d.goId || 'unknown'}]: ${d.issue}`);
      }
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
