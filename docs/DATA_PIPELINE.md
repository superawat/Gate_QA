# Data Pipeline

GateQA runtime is static-file only.
All scraping, enrichment, parsing, and validation happen offline through scripts.

## Historical Data (2014–2025)

The initial question bank was built using a one-time Python pipeline that has since been
archived. The pipeline scraped GateOverflow, enriched questions with stable IDs, parsed
printed answer keys via OCR, backfilled answers from GateOverflow widgets, and merged
everything into the canonical JSON payloads.

The resulting data files are the permanent outputs of that work:

- `public/questions-with-answers.json` — the primary question bank (3,418 questions)
- `public/data/answers/answers_by_question_uid_v1.json` — answer lookup by question UID
- `data/answers/manual-answers-patch-v1.json` — manual answer patch queue

No further action is needed for historical data. The Python scripts were removed in
CLEANUP-001 and are preserved on the `archive/pre-cleanup-2026-02-26` branch.

## Forward Pipeline (GATE 2026 onward)

Starting with GATE 2026, all new data ingestion is handled by the Node.js pipeline in
`scripts/pipeline/`. This pipeline never touches historical data — it only appends new
questions discovered for the `nextTargetYear` tracked in `pipeline-state.json`.

### Workflow

`.github/workflows/gate-question-pipeline.yml`

Trigger: cron (Apr 1, Oct 1) + `workflow_dispatch` with optional `force_year`.

### Stages

1. **Scrape** (`scripts/pipeline/scrape.mjs`) — Discover active tags for the target year, paginate through all questions, deduplicate against existing bank UIDs, save raw audit file.
2. **Normalise** (`scripts/pipeline/normalise.mjs`) — Map each scraped question to canonical structure (uid, subject, type, year/set). Route unknown-subject questions to audit quarantine.
3. **Answer Backfill** (`scripts/pipeline/answer-backfill.mjs`) — Fetch answers from GateOverflow using widget pattern and selected-answer fallback. Unresolved answers go to `manual-answers-patch-v1.json`.
4. **Merge** (`scripts/pipeline/merge.mjs`) — Append new questions to `public/questions-filtered.json` and `public/questions-with-answers.json`. Deduplicate by UID (`go:<id>`).
5. **Validate** (`scripts/pipeline/validate.mjs`) — Hard gate with three checks: volume (65/130/195 per GATE standard), full-bank dedup (1987–now), completeness (year/subject/type on new questions).
6. **Build & Deploy** — `npm run build` + deploy to gh-pages via `JamesIves/github-pages-deploy-action@v4`.

### State file

`pipeline-state.json` — tracks `nextTargetYear`, `questionsTotal`, `lastRunAt`.
Read at the start of each run, overwritten on success. `nextTargetYear` advances by 1
only after a successful deploy.

### Audit files (committed, never read by frontend)

- `audit/raw-scrape-{year}-{timestamp}.json` — full scrape session log
- `audit/scraped-{year}.json` — stage 1 output
- `audit/normalised-{year}.json` — stage 2 output
- `audit/backfilled-{year}.json` — stage 3 output
- `audit/count-by-subject-{year}.json` — subject distribution
- `audit/count-by-year-set-{year}.json` — year/set distribution
- `audit/unknown-subjects-{year}.json` — quarantined questions
- `audit/new-questions-added-{year}.json` — merge additions
- `audit/validation-report-{year}.json` — validation results
- `audit/backfill-report-{year}.json` — answer backfill results

### Failure behavior

All abort scenarios leave the live site on the last successful deploy. A GitHub Issue is
auto-created with error details from `audit/scrape-error.json` or
`audit/validation-failure.json`.

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

## Runtime artifacts consumed by app

From `public/`:

- `questions-with-answers.json` (preferred)
- `questions-filtered-with-ids.json` (fallback)
- `questions-filtered.json` (fallback)
- `data/answers/answers_master_v1.json`
- `data/answers/answers_by_question_uid_v1.json`
- `data/answers/answers_by_exam_uid_v1.json`
- `data/answers/unsupported_question_uids_v1.json`

## CI touchpoints

- `node.js.yml`: build/deploy on main and build on PR
- `gate-question-pipeline.yml`: automated GATE question pipeline (FEAT-003)

## Tech Debt (TECH-DEBT-001)

`MAX_SUBTOPICS_PER_QUESTION = 1` cap is applied in both `src/services/QuestionService.js`
(line-level constant) and `scripts/pipeline/normalise.mjs` (subject resolution uses single
best-match). Do not remove from either location until the GateOverflow scraper is confirmed
to emit per-question tags instead of section-wide tags. Section-wide tags cause subtopic
contamination — a question about "binary trees" may inherit a "graph-algorithms" tag from
an adjacent question in the same GateOverflow tag page. The cap mitigates this by keeping
only the highest-confidence subtopic.
