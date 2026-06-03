# Repository Structure

This file reflects the current tracked layout of `Gate_QA`.

## Root Layout

```text
Gate_QA/
|-- .gitignore
|-- index.html
|-- package.json
|-- package-lock.json
|-- playwright.config.cjs
|-- tsconfig.json
|-- vite.config.js
|-- lighthouserc.json
|-- tailwind.config.js
|-- postcss.config.js
|-- README.md
|
|-- [IGNORED LOCAL FILES]
|   |-- .llm-memory/             # Local LLM context docs
|   |-- AGENTS.md                # Local LLM bootstrap guide
|   |-- gateqa_master_plan.md    # Local task tracking
|   |-- BRANCH_NOTES.md          # Local dev notes
|   |-- pipeline-state.json      # Pipeline persistent state
|   |-- test-results/            # Playwright outputs
|   |-- artifacts/dev-server/    # Local server logs
|   |-- artifacts/aptitude-pipeline/ # Local AptitudeBank scrape/cache outputs
|   `-- artifacts/review/        # Local QA/audit review outputs
|
|-- src/
|   |-- index.jsx
|   |-- index.css
|   |-- vite-env.d.ts
|   |-- App.jsx
|   |-- constants/
|   |   `-- featureFlags.js
|   |-- generated/
|   |   `-- subtopicLookup.json  (generated, ignored)
|   |-- types/
|   |   |-- index.ts
|   |   `-- runtime.ts
|   |-- contexts/
|   |   |-- FilterContext.jsx
|   |   |-- MockTestContext.jsx
|   |   |-- SessionContext.jsx
|   |   |-- FilterContext.test.jsx
|   |   `-- MockTestContext.test.jsx
|   |-- services/
|   |   |-- QuestionService.ts
|   |   |-- QuestionService.test.js
|   |   |-- AnswerService.ts
|   |   |-- QuestionBankManifestService.ts
|   |   |-- GlobalDifficultyService.ts
|   |   |-- question-service/
|   |   |   |-- QuestionLoader.ts
|   |   |   |-- QuestionNormalizer.ts
|   |   |   |-- SubjectTaxonomy.ts
|   |   |   `-- types.ts
|   |   |-- AptitudeQuestionService.ts
|   |   |-- AptitudeQuestionService.test.js
|   |   `-- AnswerService.test.js
|   |-- pages/
|   |   |-- HomePage.jsx
|   |   |-- HomePage.test.jsx
|   |   |-- ExplorePage.jsx
|   |   |-- ExplorePage.test.jsx
|   |   |-- SolvePage.jsx
|   |   |-- SolvePage.test.jsx
|   |   |-- InsightsPage.jsx
|   |   `-- InsightsPage.test.jsx
|   |-- shells/
|   |   `-- MockShell.jsx
|   |-- utils/
|   |   |-- evaluateAnswer.js
|   |   |-- examUid.js
|   |   |-- analytics.js
|   |   |-- aptitudePreference.ts
|   |   |-- keyboardShortcuts.ts
|   |   |-- routes.ts
|   |   |-- stripEmbeddedOptions.d.ts
|   |   |-- localStorageState.js
|   |   `-- localStorageState.test.js
|   `-- components/
|       |-- ErrorBoundary/ErrorBoundary.jsx
|       |-- ErrorBoundary/ErrorBoundary.test.jsx
|       |-- Landing/ModeSelectionPage.jsx
|       |-- Landing/ModeCard.jsx
|       |-- Loaders/LoadingState.jsx
|       |-- Insights/MockHistoryPanel.jsx
|       |-- Header/Header.jsx
|       |-- Question/Question.jsx
|       |-- Math/MathRuntime.jsx
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
|       |-- ProgressManager/ProgressManager.jsx
|       |-- ProgressManager/ImportConfirmationModal.jsx
|       |-- Footer/Footer.jsx
|       |-- Footer/DataPolicyModal.jsx
|       |-- Footer/SupportModal.jsx
|       |-- Footer/assets/qrcode.png
|       |-- Layout/MobileBottomNav.jsx
|       `-- Layout/MobileBottomNav.test.jsx
|
|-- public/
|   |-- .nojekyll
|   |-- logo.png
|   |-- manifest.webmanifest
|   |-- offline.html
|   |-- question-bank-manifest.json
|   |-- question-images/                 # Mirrored GateOverflow blob assets for published questions
|   |-- images/aptitude/                 # Mirrored aptitude images referenced by public aptitude data
|   |-- question-search-index.json
|   |-- aptitude-search-index.json       # Generated compact search index for aptitude
|   |-- question-detail-shards/          # Generated detail payloads keyed by year/set
|   |-- data/aptitude/                   # Generated detail payloads for aptitude sharded by subject/subtopic
|   |-- mocktest/                        # Mock exam image assets used by the exam shell
|   |-- questions-filtered.json
|   |-- questions-filtered-with-ids.json
|   |-- questions-with-answers.json
|   |-- sw.js
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
|       `-- manual-answers-patch-v1.json      # Live answer patch queue (written by pipeline)
|
|-- scripts/
|   |-- precompute-subtopics.mjs
|   |-- mirror-gateoverflow-images.mjs
|   |-- build-public-artifacts.mjs
|   |-- qa/
|   |   |-- historical-paper-audit.js         # Historical 65-question paper audit
|   |   |-- import-missing-paper-from-tag.js  # Targeted single-paper GateOverflow import
|   |   |-- pre-2010-gateoverflow-audit.js    # Pre-2010 GateOverflow year-tag comparison
|   |   |-- repair-pre-2010-questions.js      # Pre-2010 question reconciliation + backfill
|   |   |-- repair-historical-exam-uids.js    # Canonical exam_uid repair pass
|   |   |-- repair-historical-paper-counts.js # Historical paper recovery + dedup + cleanup
|   |   |-- validate-data.js                  # Full-bank answer/data integrity gate
|   |   |-- validate-public-parity.js         # Public artifact/pipeline count parity gate
|   |   |-- load-aptitude-data.js             # Aptitude data loading helper
|   |   |-- audit-aptitude-data.js            # Aptitude metadata audit
|   |   |-- validate-aptitude-data.js         # Aptitude validation check
|   |   |-- validate-aptitude-images.mjs      # Aptitude image validation check
|   |   `-- verify-aptitude-quality.js        # Aptitude quality check
|   |-- deployment/
|   |   |-- sync-calculator.mjs
|   |   `-- ensure-nojekyll.mjs
|   |-- aptitude-pipeline/
|   |   |-- scrape-aptitude.mjs          # Structured AptitudeBank aptitude intake
|   |   |-- scrape-aptitude.test.mjs     # Scraper/parser unit coverage
|   |   |-- aptitude-intake-classifier.mjs # Shared attempt/ignore policy
|   |   |-- filter-aptitude-catalog.mjs  # Focused catalog filtering helper
|   |   |-- build_aptitude_db.py          # Shards and builds aptitude index
|   |   |-- mirror-aptitude-images.mjs    # Mirrors public aptitude image assets
|   |   |-- remaps.py                     # Aptitude taxonomy/remap rules
|   |   |-- config.py
|   |   `-- README.md
|   `-- pipeline/
|       |-- shared.mjs            # Shared retry/sleep/output helpers for pipeline stages
|       |-- scrape.mjs            # Stage 1: Tag discovery, pagination, question extraction
|       |-- normalise.mjs         # Stage 2: Canonical structure mapping (subject, type, year/set)
|       |-- answer-backfill.mjs   # Stage 3: GateOverflow answer widget + fallback parsing
|       |-- merge.mjs             # Stage 4: Dedup merge into question bank
|       |-- shared.test.js        # Retry behavior coverage for shared pipeline helper
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
|   |-- PRE_PUSH_CHECKS.md
|   |-- CONTRIBUTING.md
|   |-- CHANGELOG.md
|   |-- KNOWN-LIMITATIONS.md
|   |-- DATA-POLICY.md
|   |-- QA_HARDENING_CHECKLIST.md
|   |-- ROADMAP_AND_DECISIONS.md
|   |-- PYQ_GATEOVERFLOW_RECHECK_PLAN.md
|   |-- BUG_BACKLOG.md
|   |-- generated/
|   |   |-- data-status.json
|   |   `-- DATA_STATUS.md

|-- tests/
|   `-- e2e/
|       |-- a11y.axe.spec.js
|       |-- helpers.js
|       |-- mock-test-flow.spec.js
|       `-- practice-flow.spec.js

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
- Question normalization and init cache: `src/services/QuestionService.ts`
- Answer lookup order and identity: `src/services/AnswerService.ts`
- Progress import/export UI: `src/components/ProgressManager/`
- Build-time precompute generator: `scripts/precompute-subtopics.mjs`
- Data integrity gate: `scripts/qa/validate-data.js`
- Historical paper audit/repair flow: `scripts/qa/`
- Automated data pipeline: `scripts/pipeline/` + `.github/workflows/gate-question-pipeline.yml`
- Pipeline documentation: `docs/DATA_PIPELINE.md`

## Archived Python scripts

Python-based data preparation scripts used to build the 2014–2025 dataset have been removed
in CLEANUP-001. The Node.js pipeline in `scripts/pipeline/` handles all future data ingestion
from GATE 2026 onward. The archive branch `archive/pre-cleanup-2026-02-26` retains the deleted
files for reference.

Removed directories: `scraper/`, `scripts/answers/`, and the legacy Python `tests/answers/`.

## Notes

- `src/generated/subtopicLookup.json` is generated and ignored by git.
- `public/question-bank-manifest.json`, `public/question-search-index.json`, `public/question-detail-shards/`, and `docs/generated/` are refreshed by `scripts/build-public-artifacts.mjs`.
- `public/question-images/` is refreshed by `scripts/mirror-gateoverflow-images.mjs` before public artifact generation.
- `public/aptitude-search-index.json`, `public/data/aptitude/`, and `public/images/aptitude/` are refreshed by the aptitude pipeline and are runtime assets.
- `artifacts/review/` and `artifacts/aptitude-pipeline/` are local-only generated folders and should stay ignored.
- `scripts/audit-canonical-filters.mjs` has been removed.
- `public/calculator/` is generated from root `calculator/` by deployment sync script.
- `dist/` should never be edited manually.
- `pipeline-state.json` is read at the start of each pipeline run and overwritten on success.
- `audit/` directory contents are committed after every pipeline run but never read by the frontend.
