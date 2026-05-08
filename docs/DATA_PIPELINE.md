# Data Pipeline

GateQA runtime is static-file only.
All scraping, enrichment, parsing, and validation happen offline through scripts.

## Historical Data (1987–2025)

The initial question bank was built using a one-time Python pipeline that has since been
archived. The pipeline scraped GateOverflow, enriched questions with stable IDs, parsed
printed answer keys via OCR, backfilled answers from GateOverflow widgets, and merged
everything into the canonical JSON payloads.

The resulting data files are the permanent outputs of that work:

- `public/questions-with-answers.json` — the primary published practice bank (see `docs/generated/DATA_STATUS.md` for the current generated count snapshot)
- `public/data/answers/answers_by_question_uid_v1.json` — answer lookup by question UID
- `data/answers/manual-answers-patch-v1.json` — manual answer patch queue

The original Python scripts were removed in CLEANUP-001 and are preserved on the
`archive/pre-cleanup-2026-02-26` branch.

### Historical paper-count maintenance

Historical data is mostly static, but paper-count drift can still happen when:

- historical GateOverflow rows were never imported
- duplicate "modified/version" variants inflate a paper
- non-paper discussion posts leak into a year tag
- malformed historical `exam_uid` values prevent canonical slot matching

The current maintenance flow for these cases is:

1. `npm run qa:audit-historical-papers`
2. `npm run qa:repair-historical-exam-uids`
3. `npm run qa:repair-historical-paper-counts`
4. If one post-2010 paper is missing entirely, run `npm run qa:import-missing-paper -- --year <YYYY> --set <N> --tag gatecse-YYYY-setN`
5. `npm run qa:audit-historical-papers` again to confirm the repaired bank is clean
6. `npm run qa:audit-pre-2010-gateoverflow` to compare pre-2010 year totals against live GateOverflow year tags using deduped question labels
7. `npm run qa:repair-pre-2010-questions` to reconcile pre-2010 rows with the live GateOverflow year-tag question set and backfill missing legacy questions
8. `npm run qa:audit-pre-2010-gateoverflow` again to confirm the repaired legacy bank is clean

Scripts:

- `scripts/qa/historical-paper-audit.js` — audits papers from 2010 onward against the 65-question expectation
- `scripts/qa/import-missing-paper-from-tag.js` — imports a single missing post-2010 paper directly from a live GateOverflow year/set tag and syncs question/answer payloads
- `scripts/qa/pre-2010-gateoverflow-audit.js` — audits 1987–2009 papers against live GateOverflow year-tag totals, deduping duplicate/closed posts by question label
- `scripts/qa/repair-pre-2010-questions.js` — removes pre-2010 off-tag/non-question rows, deduplicates per question label, and backfills missing legacy questions from live GateOverflow pages
- `scripts/qa/repair-historical-exam-uids.js` — canonicalizes malformed historical `exam_uid` values
- `scripts/qa/repair-historical-paper-counts.js` — removes non-paper rows, drops duplicate historical variants, backfills missing GateOverflow questions, and sanitizes polluted titles

Artifacts:

- `artifacts/review/historical-paper-audit.json` — latest audit summary for historical papers
- `artifacts/review/historical-paper-count-repair-report.json` — latest repair report for historical paper-count recovery
- `artifacts/review/missing-paper-import-report.json` — latest single-paper import report for targeted post-2010 backfills
- `artifacts/review/pre-2010-gateoverflow-audit.json` — latest 1987–2009 GateOverflow-vs-bank comparison report

Current status:

- targeted mock-readiness backfills on 2026-05-08 added the missing 2017 Set 1 Q23 row as `AMBIGUOUS`, added 2021 Set 1 Q23 accepted NAT answers `205` / `820`, added 2014 Set 2 Q51 with NAT answer `5`, and restored 2012 Q15/Q26
- mock catalog generation treats `AMBIGUOUS` and `MARKS_TO_ALL` answer records as auto-awarded mock-only questions; normal practice answer evaluation remains MCQ/MSQ/NAT
- historical repair completed on 2026-04-04
- targeted import of missing `2014 Set 1` completed on 2026-04-04
- audited papers from 2010 onward now show:
  - `paper_count = 27`
  - `papers_with_missing_slots = 0`
  - `papers_with_duplicate_slots = 0`
  - `papers_with_malformed_exam_uids = 0`
  - `questions_without_paper_meta = 0`
- the restored `2014 Set 1` paper now contributes `65` canonical slots and `65` imported answers
- pre-2010 repair completed on 2026-04-04
- audited pre-2010 papers now show:
  - `matching_question_counts = 23`
  - `mismatching_question_counts = 0`
  - `matching_question_labels = 23`

## Forward Pipeline (GATE 2026 onward)

Starting with GATE 2026, all new data ingestion is handled by the Node.js pipeline in
`scripts/pipeline/`. This pipeline never touches historical data — it only appends new
questions discovered for the `nextTargetYear` tracked in `pipeline-state.json`.

The first live use of this pipeline was the GATE 2026 catch-up import completed on
2026-04-04. That run captured all 130 questions across both sets (65 in Set 1, 65 in
Set 2). Answer backfill for 2026 has not been completed yet, so the 2026 rows currently
exist in the bank with `answer: null`.

### Workflow

`.github/workflows/gate-question-pipeline.yml`

Trigger: cron (Apr 1-5, Oct 1-5) + `workflow_dispatch` with optional `force_year`.

Operational note:

- the scheduled workflow now retries daily during the first five days of April and October
- the GitHub Actions job timeout is extended to cover the full robots-compliant scrape and answer-backfill path
- scheduled retries automatically no-op when `nextTargetYear` has already advanced into a future year
- scheduled no-new-question runs do not commit off-cycle audit logs to `main`
- use `workflow_dispatch` or the local manual runbook below for manual catch-up imports

### Stages

1. **Scrape** (`scripts/pipeline/scrape.mjs`) — Discover active tags for the target year, paginate through all questions, deduplicate against existing bank UIDs, save raw audit file.
2. **Normalise** (`scripts/pipeline/normalise.mjs`) — Map each scraped question to canonical structure (uid, subject, type, year/set). Route unknown-subject questions to audit quarantine. General Aptitude matching includes spatial/pattern tags used by the 2026 GA questions.
3. **Answer Backfill** (`scripts/pipeline/answer-backfill.mjs`) — Fetch answers from GateOverflow using widget pattern and selected-answer fallback. Unresolved answers go to `manual-answers-patch-v1.json`.
4. **Merge** (`scripts/pipeline/merge.mjs`) — Append new questions to `public/questions-filtered.json` and `public/questions-with-answers.json`. Deduplicate by UID (`go:<id>`).
5. **Validate** (`scripts/pipeline/validate.mjs`) — Hard gate with three checks: volume (65/130/195 per GATE standard), full-bank dedup (1987–now), completeness (year/subject/type on new questions).
6. **Build & Deploy** — `npm run build` regenerates the manifest, search index, detail shards, and generated docs snapshot before deploy to `gh-pages` via `JamesIves/github-pages-deploy-action@v4`.

### State file

`pipeline-state.json` — tracks `nextTargetYear`, `questionsTotal`, `publishedQuestionsTotal`, `lastRunAt`.
Read at the start of each run, overwritten on success. `nextTargetYear` advances by 1
only after a successful deploy.

If the stages are run locally instead of through GitHub Actions, update `pipeline-state.json`
manually after a successful merge/validate/build pass. The local stage scripts do not
advance `nextTargetYear` on their own.

As of 2026-05-08, the parity drift has been reconciled. `pipeline-state.json`,
`audit/validation-report-YYYY.json`, the generated docs snapshot, and the published public
bank now agree on the same public-bank count, and `npm run qa:validate-public-parity`
is part of CI.

When `public/questions-with-answers.json` changes materially, bump
`INIT_CACHE_VERSION` in `src/services/question-service/QuestionLoader.js` so browsers do not keep serving a
stale localStorage snapshot of the old question bank.
The current init cache version after the May 2026 mock-readiness backfills is `v11`.

### Audit files (committed, never read by frontend)

- `audit/raw-scrape-{year}-{timestamp}.json` — full scrape session log
- `audit/scraped-{year}.json` — stage 1 output
- `audit/normalised-{year}.json` — stage 2 output
- `audit/backfilled-{year}.json` — stage 3 output
- `audit/count-by-subject-{year}.json` — subject distribution
- `audit/count-by-year-set-{year}.json` — year/set distribution
- `audit/unknown-subjects-{year}.json` — quarantined questions (written only when unresolved rows remain)
- `audit/new-questions-added-{year}.json` — merge additions
- `audit/validation-report-{year}.json` — validation results
- `audit/backfill-report-{year}.json` — answer backfill results

### Failure behavior

All abort scenarios leave the live site on the last successful deploy. A GitHub Issue is
auto-created with error details from `audit/scrape-error.json` or
`audit/validation-failure.json`.

## Manual catch-up runbook

Use this when a scheduled run misses the intake window or when you intentionally want to
import a year locally before re-enabling automation.

### Question-only import

This path is the fastest safe catch-up flow. It imports the questions first and leaves
answers as `null` until answer backfill is run later.

```bash
npm ci
node scripts/pipeline/scrape.mjs --year 2026
node scripts/pipeline/normalise.mjs --year 2026
node scripts/pipeline/merge.mjs --year 2026
node scripts/pipeline/validate.mjs --year 2026
npm run build
```

Notes:

- `merge.mjs` will consume `audit/backfilled-{year}.json` when present, otherwise it falls
  back to `audit/normalised-{year}.json`
- after a successful local import, manually update `pipeline-state.json` so
  `nextTargetYear` moves forward
- for GATE 2026, the expected volume is `130` questions total: `65` in Set 1 and `65` in Set 2

### Full import including answer backfill

```bash
node scripts/pipeline/answer-backfill.mjs --year 2026
node scripts/pipeline/merge.mjs --year 2026
node scripts/pipeline/validate.mjs --year 2026
npm run build
```

Use this second pass after the question-only import if you want the 2026 answer keys pulled
from GateOverflow before publishing.

## Crawl Policy

Phase 0 research findings, recorded as permanent reference:

**robots.txt:** `/tag/...` paths are not disallowed by `gateoverflow.in/robots.txt`.
`Crawl-delay: 30` is specified for `User-agent: *`. All pipeline scripts enforce a
31-second delay between requests.

**Terms of Service:** No anti-scraping prohibition was found as of the FEAT-003
implementation date (February 2026). Review again if GateOverflow updates their ToS.

**Tag patterns confirmed:** Tags follow set-specific patterns, never bare `gateYYYY`:
- `gatecse-YYYY-setN` (hyphenated, used for 2024 and 2026)
- `gatecseYYYY-setN` (no hyphen, used for 2025)
- `gateYYYY` (probed as fallback but historically returns empty)

The scraper probes all 7 candidate patterns per year to handle convention drift.

## Integrity gate

Script:

- `scripts/qa/validate-data.js`

Run:

```bash
npm run qa:validate-data
```

Strict-mode current behavior:

- fails on missing question UIDs
- fails on idstrmissing-style orphan answer rows
- actionable missing-answer coverage gaps are reported as warnings

## Frontend precompute artifacts

Script:

- `scripts/precompute-subtopics.mjs`

Output:

- `src/generated/subtopicLookup.json`

Purpose:

- pre-normalize subject aliases and subtopic lookup maps
- reduce runtime normalization cost in `QuestionService`

Note:

- output is generated and ignored by git (`/src/generated/` in `.gitignore`)
- script is automatically run by `npm start` and `npm run build`

## Generated public/runtime artifacts

Script:

- `scripts/build-public-artifacts.mjs`

Outputs:

- `public/question-bank-manifest.json`
- `public/question-search-index.json`
- `public/question-detail-shards/*.json`
- `docs/generated/data-status.json`
- `docs/generated/DATA_STATUS.md`
- `artifacts/review/remote-image-report.json`

Purpose:

- publish a lightweight landing/search contract alongside on-demand question detail shards
- generate docs count/status text from artifacts instead of hardcoding it
- keep the remote GateOverflow blob-image backlog visible

This script is automatically run by `npm start` and `npm run build`.

## Public parity check

Script:

- `scripts/qa/validate-public-parity.js`

Run:

```bash
npm run qa:validate-public-parity
```

Scope:

- `public/questions-with-answers.json`
- `public/questions-filtered.json`
- `public/question-bank-manifest.json`
- `docs/generated/data-status.json`
- `pipeline-state.json`
- latest `audit/validation-report-YYYY.json`
- `artifacts/review/data-integrity-report.json`

Use this to guard against count drift between the published bank, pipeline state,
validation totals, and generated docs.

## Runtime artifacts consumed by app

From `public/`:

- `question-bank-manifest.json`
- `question-search-index.json`
- `questions-with-answers.json` (preferred)
- `questions-filtered-with-ids.json` (fallback)
- `questions-filtered.json` (fallback)
- `data/answers/answers_master_v1.json`
- `data/answers/answers_by_question_uid_v1.json`
- `data/answers/answers_by_exam_uid_v1.json`
- `data/answers/unsupported_question_uids_v1.json`

## CI touchpoints

- `node.js.yml`: build/deploy on main and build on PR, including `qa:validate-public-parity`
- `gate-question-pipeline.yml`: automated GATE question pipeline (FEAT-003), including parity verification before deploy

## Tech Debt (TECH-DEBT-001)

`MAX_SUBTOPICS_PER_QUESTION = 1` cap is applied in both `src/services/QuestionService.js`
(line-level constant) and `scripts/pipeline/normalise.mjs` (subject resolution uses single
best-match). Do not remove from either location until the GateOverflow scraper is confirmed
to emit per-question tags instead of section-wide tags. Section-wide tags cause subtopic
contamination — a question about "binary trees" may inherit a "graph-algorithms" tag from
an adjacent question in the same GateOverflow tag page. The cap mitigates this by keeping
only the highest-confidence subtopic.
