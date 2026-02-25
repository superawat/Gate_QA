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

## Stage 1: Scrape and merge questions

Scripts:

- `scraper/scrape_gateoverflow.py`
- `scraper/merge_questions.py`

Primary output:

- `public/questions-filtered.json`

Automation:

- `.github/workflows/scraper.yml` runs every 4 months and opens PR on data changes.

## Stage 2: Enrich question IDs

Script:

- `scripts/answers/enrich_questions_with_ids.py`

Output:

- `public/questions-filtered-with-ids.json`

## Stage 3: Answer parse and build

Core scripts:

- `scripts/answers/extract_answer_pages.py`
- `scripts/answers/ocr_answer_pages.py`
- `scripts/answers/normalize_ocr_text.py`
- `scripts/answers/parse_answer_key.py`
- `scripts/answers/build_answers_db.py`
- `scripts/answers/build_answers_by_exam_uid.py`
- `scripts/answers/build_unsupported_questions.py`
- `scripts/answers/validate_answers.py`
- `scripts/answers/backfill_gateoverflow_answers.py`
- `scripts/answers/apply_resolutions.py`

## Stage 4: Merge answers into frontend payload

Script:

- `scripts/answers/merge_answers_into_questions.py`

Output:

- `public/questions-with-answers.json`

## Stage 5: Integrity gate

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

## Stage 6: Frontend precompute artifacts

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

## End-to-end local flow (typical)

```bash
python scraper/scrape_gateoverflow.py
python scraper/merge_questions.py
python scripts/answers/enrich_questions_with_ids.py
python scripts/answers/build_answers_db.py
python scripts/answers/build_answers_by_exam_uid.py
python scripts/answers/merge_answers_into_questions.py
python scripts/answers/validate_answers.py
npm run qa:validate-data
npm run precompute
```

## CI touchpoints

- `node.js.yml`: build/deploy on main and build on PR
- `scraper.yml`: scheduled scrape PR flow
- `scheduled-maintenance.yml`: periodic refresh/build/deploy when data changed

## Removed/dead paths

- `scripts/audit-canonical-filters.mjs` has been removed.
- `audit:canonical` npm script has been removed.

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
