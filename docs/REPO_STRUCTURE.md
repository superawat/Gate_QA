# Repository Structure

This file reflects the current tracked layout of `Gate_QA`.

## Root Layout

```text
Gate_QA/
|-- index.html
|-- package.json
|-- package-lock.json
|-- pipeline-state.json          # Pipeline persistent state (nextTargetYear, totals)
|-- vite.config.js
|-- lighthouserc.json
|-- tailwind.config.js
|-- postcss.config.js
|-- README.md
|
|-- src/
|   |-- index.jsx
|   |-- index.css
|   |-- App.jsx
|   |-- generated/
|   |   `-- subtopicLookup.json  (generated, ignored)
|   |-- contexts/
|   |   |-- FilterContext.jsx
|   |   `-- FilterContext.test.jsx
|   |-- services/
|   |   |-- QuestionService.js
|   |   |-- QuestionService.test.js
|   |   |-- AnswerService.js
|   |   `-- AnswerService.test.js
|   |-- utils/
|   |   |-- evaluateAnswer.js
|   |   |-- examUid.js
|   |   |-- goatCounterClient.js
|   |   |-- localStorageState.js
|   |   `-- localStorageState.test.js
|   |-- hooks/
|   |   `-- useGoatCounterSPA.js
|   `-- components/
|       |-- Header/Header.jsx
|       |-- Question/Question.jsx
|       |-- AnswerPanel/AnswerPanel.jsx
|       |-- Toast/Toast.jsx
|       |-- Calculator/CalculatorButton.jsx
|       |-- Calculator/CalculatorWidget.jsx
|       |-- Filters/FilterModal.jsx
|       |-- Filters/FilterSidebar.jsx
|       |-- Filters/TopicFilter.jsx
|       |-- Filters/YearFilter.jsx
|       |-- Filters/YearRangeFilter.jsx
|       |-- Filters/ProgressBar.jsx
|       |-- Filters/ProgressFilterToggles.jsx
|       |-- Filters/ActiveFilterChips.jsx
|       |-- Filters/FilterSection.jsx
|       |-- ProgressManager/ProgressManager.jsx
|       |-- ProgressManager/ImportConfirmationModal.jsx
|       |-- Footer/Footer.jsx
|       |-- Footer/DataPolicyModal.jsx
|       |-- Footer/SupportModal.jsx
|       `-- FilterTags/FilterTags.jsx
|
|-- public/
|   |-- .nojekyll
|   |-- logo.png
|   |-- questions-filtered.json
|   |-- questions-filtered-with-ids.json
|   |-- questions-with-answers.json
|   |-- calculator/
|   `-- data/answers/
|       |-- answers_by_question_uid_v1.json
|       |-- answers_master_v1.json
|       |-- answers_by_exam_uid_v1.json
|       `-- unsupported_question_uids_v1.json
|
|-- data/
|   `-- answers/
|       |-- answers_by_question_uid_v1.json   # Read by pipeline answer-backfill
|       `-- manual_answers_patch_v1.json      # Live answer patch queue (written by pipeline)
|
|-- scripts/
|   |-- precompute-subtopics.mjs
|   |-- qa/validate-data.js
|   |-- deployment/
|   |   |-- sync-calculator.mjs
|   |   `-- ensure-nojekyll.mjs
|   `-- pipeline/
|       |-- scrape.mjs            # Stage 1: Tag discovery, pagination, question extraction
|       |-- normalise.mjs         # Stage 2: Canonical structure mapping (subject, type, year/set)
|       |-- answer-backfill.mjs   # Stage 3: GateOverflow answer widget + fallback parsing
|       |-- merge.mjs             # Stage 4: Dedup merge into question bank
|       `-- validate.mjs          # Stage 5: Volume / dedup / completeness hard gate
|
|-- calculator/
|   |-- calculator.html
|   |-- calculator.js
|   |-- content.js
|   |-- background.js
|   |-- real.css
|   `-- manifest.json
|
|-- docs/
|   |-- README.md
|   |-- ARCHITECTURE.md
|   |-- REPO_STRUCTURE.md
|   |-- FRONTEND_GUIDE.md
|   |-- DATA_PIPELINE.md          # Pipeline primary documentation
|   |-- DEPLOYMENT.md
|   |-- TESTING.md
|   |-- CONTRIBUTING.md
|   |-- CHANGELOG.md
|   |-- KNOWN-LIMITATIONS.md
|   |-- DATA-POLICY.md
|   |-- QA_HARDENING_CHECKLIST.md
|   `-- FEAT-003_PHASE0_SIGNOFF.md
|
|-- audit/                        # Pipeline-generated outputs, committed after every run,
|   `-- .gitkeep                  # never read by frontend
|
|-- .github/workflows/
|   |-- node.js.yml                          # Build + deploy to GitHub Pages
|   `-- gate-question-pipeline.yml           # 6-stage automated GATE question pipeline (FEAT-003)
|
`-- dist/
    `-- build artifacts
```

## Important ownership map

- Filter state/actions split: `src/contexts/FilterContext.jsx`
- Question normalization and init cache: `src/services/QuestionService.js`
- Answer lookup order and identity: `src/services/AnswerService.js`
- Progress import/export UI: `src/components/ProgressManager/`
- Build-time precompute generator: `scripts/precompute-subtopics.mjs`
- Data integrity gate: `scripts/qa/validate-data.js`
- Automated data pipeline: `scripts/pipeline/` + `.github/workflows/gate-question-pipeline.yml`
- Pipeline documentation: `docs/DATA_PIPELINE.md`

## Archived Python scripts

Python-based data preparation scripts used to build the 2014–2025 dataset have been removed
in CLEANUP-001. The Node.js pipeline in `scripts/pipeline/` handles all future data ingestion
from GATE 2026 onward. The archive branch `archive/pre-cleanup-2026-02-26` retains the deleted
files for reference.

Removed directories: `scraper/`, `scripts/answers/`, `tests/`, `artifacts/`.

## Notes

- `src/generated/subtopicLookup.json` is generated and ignored by git.
- `scripts/audit-canonical-filters.mjs` has been removed.
- `public/calculator/` is generated from root `calculator/` by deployment sync script.
- `dist/` should never be edited manually.
- `pipeline-state.json` is read at the start of each pipeline run and overwritten on success.
- `audit/` directory contents are committed after every pipeline run but never read by the frontend.
