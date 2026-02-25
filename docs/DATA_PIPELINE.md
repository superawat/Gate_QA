# Data Pipeline

GateQA ships static JSON artifacts. Runtime never calls a backend service.
All scraping, answer extraction, validation, and enrichment happen offline through scripts.

## Pipeline Overview

1. Scrape and normalize question corpus.
2. Enrich question rows with stable IDs.
3. Extract and parse answer-key sources.
4. Build answer indexes.
5. Merge answers into frontend dataset.
6. Validate data integrity and schema.
7. Publish outputs into `public/` for runtime fetch.

## Stage 1: Question Scrape and Merge

Primary scripts:

- `scraper/scrape_gateoverflow.py`
- `scraper/merge_questions.py`

Outputs:

- `public/questions-filtered.json`
- (and refreshes related merged outputs depending on local workflow)

Automation:

- `.github/workflows/scraper.yml` runs every 4 months (`0 0 1 */4 *`) and can open a PR when question data changes.

## Stage 2: Question Identity Enrichment

Script:

- `scripts/answers/enrich_questions_with_ids.py`

Purpose:

- Adds deterministic `question_uid`/identity fields needed for answer joins.

Output:

- `public/questions-filtered-with-ids.json`

## Stage 3: Answer Extraction and Parsing

Core scripts in `scripts/answers/`:

- `extract_answer_pages.py`
- `ocr_answer_pages.py`
- `normalize_ocr_text.py`
- `parse_answer_key.py`

Supporting sources/config:

- `data/answers/ocr_profile_tesseract.json`
- OCR/page artifacts under `artifacts/`

## Stage 4: Answer Index Build

Core scripts:

- `build_answers_db.py`
- `build_answers_by_exam_uid.py`
- `build_unsupported_questions.py`
- `validate_answers.py`
- `backfill_gateoverflow_answers.py`
- `apply_resolutions.py`
- `generate_missing_report.py`

Primary artifacts (source-of-truth workspace):

- `data/answers/answers_master_v1.csv`
- `data/answers/answers_by_question_uid_v1.json`
- `data/answers/answers_by_exam_uid_v1.json`
- `data/answers/answer_to_question_map_v1.json`
- `data/answers/manual_answers_patch_v1.json`
- `data/answers/manual_resolutions_v1.json`

Runtime artifacts copied/committed in `public/data/answers/`:

- `answers_master_v1.json`
- `answers_by_question_uid_v1.json`
- `answers_by_exam_uid_v1.json`
- `unsupported_question_uids_v1.json`

## Stage 5: Merge Answers into Questions

Script:

- `scripts/answers/merge_answers_into_questions.py`

Output:

- `public/questions-with-answers.json`

This is the first-choice dataset fetched by `QuestionService`.

## Stage 6: Integrity Validation and QA Gates

### Data integrity script

- `scripts/qa/validate-data.js`

Default inputs:

- Questions: `public/questions-filtered.json`
- Answers (first existing candidate):
  - `public/data/answers/answers_master_v1.json`
  - `public/data/answers/answersmasterv1.json`
  - `public/answersmasterv1.json`
  - `answersmasterv1.json`
- Unsupported list candidate:
  - `public/data/answers/unsupported_question_uids_v1.json`
  - `data/answers/unsupported_question_uids_v1.json`

Report output:

- `artifacts/review/data-integrity-report.json`

Command:

```bash
npm run qa:validate-data
```

CLI flags:

```bash
node scripts/qa/validate-data.js \
  --questions <path> \
  --answers <path> \
  --unsupported <path> \
  --report <path> \
  --no-strict
```

Strict-mode behavior in current implementation:

- Fails (`exit 1`) when:
  - questions without UID exist, or
  - `idstrmissing`-style orphan answers exist.
- Coverage gaps in actionable missing answers currently produce warnings, not a failing exit.

### Canonical subject audit

Script:

- `scripts/audit-canonical-filters.mjs`

Outputs CSV summaries in project root:

- `counts_by_subject.csv`
- `counts_by_yearset.csv`
- `unknown_subject.csv`
- `subject_conflicts.csv`
- `leakage_test.csv`

## End-to-End Local Run (Typical)

```bash
# 1) Refresh question corpus
python scraper/scrape_gateoverflow.py
python scraper/merge_questions.py

# 2) Enrich IDs
python scripts/answers/enrich_questions_with_ids.py

# 3) Build/refresh answer outputs (may require OCR/artifact inputs)
python scripts/answers/build_answers_db.py
python scripts/answers/build_answers_by_exam_uid.py
python scripts/answers/merge_answers_into_questions.py

# 4) Validate
python scripts/answers/validate_answers.py
npm run qa:validate-data
```

## CI/Automation Touchpoints

- `scraper.yml`: scheduled scrape PR flow every 4 months.
- `scheduled-maintenance.yml`: every 3 months, refreshes data on main if changed, builds, verifies artifacts, deploys Pages.
- `node.js.yml`: build/deploy on push to `main` and build on PR.

## Runtime Consumption Contract

Frontend runtime reads only static files via `import.meta.env.BASE_URL`:

- Questions dataset in app root (`questions-with-answers.json` preferred)
- Answer indexes in `data/answers/`

No runtime mutation of these files occurs in browser.
