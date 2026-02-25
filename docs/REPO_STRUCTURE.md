# Repository Structure

This file reflects the current tracked layout of `Gate_QA`.

## Root Layout

```text
Gate_QA/
|-- index.html
|-- package.json
|-- package-lock.json
|-- vite.config.js
|-- lighthouserc.json
|-- tailwind.config.js
|-- postcss.config.js
|-- README.md
|-- requirements.txt
|
|-- src/
|   |-- index.jsx
|   |-- index.css
|   |-- App.jsx
|   |-- generated/
|   |   `-- subtopicLookup.json (generated, ignored)
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
|   |-- question_id_overrides.json
|   |-- subject_map.json
|   `-- answers/
|       |-- answers.schema.json
|       |-- answers_master_v1.csv
|       |-- answers_by_question_uid_v1.json
|       |-- answers_by_exam_uid_v1.json
|       |-- answer_to_question_map_v1.json
|       |-- manual_answers_patch_v1.json
|       |-- manual_resolutions_v1.json
|       |-- ocr_profile_tesseract.json
|       |-- subject_question_counts.json
|       `-- validation_config.json
|
|-- scripts/
|   |-- README.md
|   |-- precompute-subtopics.mjs
|   |-- analyze_questions.py
|   |-- analyze_types.py
|   |-- find_text.py
|   |-- show_question.py
|   |-- qa/validate-data.js
|   |-- deployment/
|   |   |-- sync-calculator.mjs
|   |   `-- ensure-nojekyll.mjs
|   `-- answers/
|       |-- apply_resolutions.py
|       |-- backfill_gateoverflow_answers.py
|       |-- build_answers_db.py
|       |-- build_answers_by_exam_uid.py
|       |-- build_unsupported_questions.py
|       |-- enrich_questions_with_ids.py
|       |-- extract_answer_pages.py
|       |-- ocr_answer_pages.py
|       |-- normalize_ocr_text.py
|       |-- parse_answer_key.py
|       |-- merge_answers_into_questions.py
|       |-- validate_answers.py
|       |-- generate_missing_report.py
|       |-- common.py
|       `-- __init__.py
|
|-- scraper/
|   |-- scrape_gateoverflow.py
|   |-- merge_questions.py
|   |-- list_tags.py
|   |-- debug_filters.py
|   |-- question_schema.json
|   |-- requirements.txt
|   `-- README.md
|
|-- tests/
|   `-- answers/
|       |-- test_parse_answer_key.py
|       |-- test_normalize_ocr_text.py
|       `-- fixtures/
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
|   |-- DATA_PIPELINE.md
|   |-- DEPLOYMENT.md
|   |-- TESTING.md
|   |-- CONTRIBUTING.md
|   |-- CHANGELOG.md
|   |-- KNOWN-LIMITATIONS.md
|   |-- DATA-POLICY.md
|   |-- QA_HARDENING_CHECKLIST.md
|   `-- PLATFORM_HARDENING_ALL_UPDATES.txt
|
|-- .github/workflows/
|   |-- node.js.yml
|   |-- scraper.yml
|   `-- scheduled-maintenance.yml
|
|-- artifacts/
|   `-- generated OCR/review outputs
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

## Notes

- `src/generated/subtopicLookup.json` is generated and ignored by git.
- `scripts/audit-canonical-filters.mjs` has been removed.
- `public/calculator/` is generated from root `calculator/` by deployment sync script.
- `dist/` should never be edited manually.
