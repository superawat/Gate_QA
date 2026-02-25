# Data Pipeline

GateQA runtime is static-file only.
All scraping, enrichment, parsing, and validation happen offline through scripts.

## Pipeline overview

1. Scrape and merge question corpus.
2. Enrich questions with stable IDs.
3. Parse answer sources and build answer indexes.
4. Merge answers into question payload.
5. Validate integrity and schema.
6. Generate frontend precompute lookup.
7. Publish static JSON files consumed by frontend.

## Historical pipeline (Python, removed in CLEANUP-001)

Stages 1–4 of the original pipeline used Python scripts (`scraper/`, `scripts/answers/`)
to build the initial 1987–2025 question bank. Those scripts, their `requirements.txt`,
their tests (`tests/answers/`), and the intermediate data files they produced were removed
after FEAT-003 replaced them with Node.js equivalents in `scripts/pipeline/`.

The old workflows (`scraper.yml`, `scheduled-maintenance.yml`) were also removed.
All deleted files are preserved on the `archive/pre-cleanup-2026-02-26` branch.

## Integrity gate

Script:

- `scripts/qa/validate-data.js`

Report output:

- `artifacts/review/data-integrity-report.json`

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

## Removed/dead paths

- `scripts/audit-canonical-filters.mjs` has been removed.
- `audit:canonical` npm script has been removed.
- `scraper.yml`: removed (superseded by FEAT-003 pipeline).
- `scheduled-maintenance.yml`: removed (superseded by FEAT-003 pipeline).
- All Python scraper/answer scripts: removed (CLEANUP-001).

## FEAT-003: Automated GATE Question Pipeline

Forward-looking pipeline starting at 2026. Never touches historical data.

### Workflow

`.github/workflows/gate-question-pipeline.yml`

Trigger: cron (Apr 1, Oct 1) + `workflow_dispatch` with optional `force_year`.

### Stages

1. **Scrape** (`scripts/pipeline/scrape.mjs`) — Discover tags, paginate, extract questions, dedup against existing bank.
2. **Normalise** (`scripts/pipeline/normalise.mjs`) — Map to canonical structure (uid, subject, type, year/set).
3. **Answer Backfill** (`scripts/pipeline/answer-backfill.mjs`) — Fetch answers from GateOverflow widgets.
4. **Merge** (`scripts/pipeline/merge.mjs`) — Append to `public/questions-filtered.json` and `questions-with-answers.json`.
5. **Validate** (`scripts/pipeline/validate.mjs`) — Volume check (65/130/195), dedup check, completeness check.
6. **Build & Deploy** — `npm run build` + deploy to gh-pages.

### State file

`pipeline-state.json` — tracks `nextTargetYear`, `questionsTotal`, `lastRunAt`.

### Audit files (committed, never read by frontend)

- `audit/raw-scrape-{year}-{timestamp}.json`
- `audit/count-by-subject-{year}.json`
- `audit/count-by-year-set-{year}.json`
- `audit/unknown-subjects-{year}.json`
- `audit/new-questions-added-{year}.json`
- `audit/validation-report-{year}.json`

### Failure behavior

All abort scenarios leave the live site on the last successful deploy. A GitHub Issue is auto-created with error details.
