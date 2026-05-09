# Changelog

All notable changes to GateQA are documented in this file.

## [Unreleased]

### PLAN-2026: Phase 4 Learner Analytics and Spaced Repetition (4.5 - 4.8) -> Status: Done
- Implemented spaced-review scheduling in `src/utils/practiceProgress.js`.
- Upgraded practice submissions to track session duration, history, review due dates, question difficulty, and XP/streak data.
- Expanded the Insights dashboard to include Review Queue, Practice Trends, Average Time, Hard Questions, Streak, XP, and unlockable badges.
- Wrong-answer rows in practice now display difficulty levels and average answer times.
- Increased unit test coverage to 201 Vitest tests.
### PLAN-2026: Phase 4 UI Polish and WebP Optimizations -> Status: Done
- Converted 453 question images from PNG/JPG to WebP format, saving 10.59 MB (72.9% reduction) in `public/question-images/`.
- Regenerated all 58 question detail shards and the search index to point to the new `.webp` image references.
- Added extensive keyboard shortcuts (`src/utils/keyboardShortcuts.js`): `/` to focus search, `F` to focus filters, and `1-4`, `Enter`, `B`, `M`, `S` for answer panel actions.
- Replaced hardcoded `dark:` Tailwind classes across Explore, Solve, and Practice UI surfaces with theme-aware CSS variables for a consistent dark mode.
- Added strict Axe accessibility snapshots asserting landmark, heading, and named-control structures.
- Added an automated bundle budget reporting script (`scripts/qa/validate-bundle-budget.mjs`) to warn when chunk sizes exceed strict limits.
- Fixed E2E Playwright tests that were broken by the Insights UI migration and search input label changes.
- Fixed dark mode visibility issues in the Insights dashboard's Review Queue and Wrong Answers tabs by migrating hardcoded Tailwind color scales to theme-aware CSS variables.
- Fixed layout shift causing footer to float up on sparse pages by making `PageShell` a flex container.
- Updated `DataPolicyModal` and `SupportModal` hardcoded colors to use CSS variables for proper visibility in dark mode.
### PLAN-2026: May 2026 Plan Cleanup and Bug Follow-through -> Status: Done
- Removed the Insights subtitle and internal Answer Coverage panel so the dashboard stays focused on learner-facing analytics.
- Kept the Skill Radar stable by disabling radar animation after render.
- Fixed the dark-mode logo regression by removing the dark-mode inversion filter while keeping the logo contrast frame.
- Switched the landing resume CTA title and subtitle to theme tokens for readable dark-mode contrast.
- Completed the B4 non-mock dark-mode readability audit across Home, Practice, and Insights with a production contrast smoke.
- Moved Home quick actions and the mock-history shortcut onto theme-token surfaces, added indigo dark-mode overrides, wrapped the legacy header logo in the contrast frame, and darkened primary blue buttons for white-text contrast.
- Verified C1 past-paper visibility: mock paper setup renders the full generated catalog, including blocked near-ready papers with status reasons, instead of hiding everything except release-ready papers.
- Completed the C2/C3 near-ready paper pass: 2021 Set 1 is release-ready with verified NAT answers for `go:357428`, and 2017 Set 1 now includes its missing Q23 row.
- Advanced C4 by importing 2014 Set 2 Q51 with verified NAT answer `5`.
- Added a mock-only auto-award policy for `AMBIGUOUS` and `MARKS_TO_ALL` answer records, so historical papers can include official edge-case questions without converting them into fake normal answers.
- Completed the near-modern C4 pass: 2017 Set 1, 2013, and 2012 are now release-ready; 2012 Q15/Q26 were restored, 2012 Q26 uses verified MCQ answer `B`, and marks-to-all records are awarded automatically.
- Reconciled public count snapshots after the imports so the public payloads, manifest, generated docs, pipeline state, data-integrity report, and validation report all agree on `3,550` questions.
- Bumped the question loader init cache version to `v11` after the public question bank changed.
- Added a `Back to Modes` control on mock setup sub-pages and covered it with a regression test.
- Excluded `.codeboarding/**` from Vitest collection so local analysis snapshots do not break `npm run test:unit`.
- Removed confirmed dead code files: `src/shells/LandingShell.jsx`, `src/shells/PracticeShell.jsx`, `src/components/Filters/FilterSection.jsx`, `src/components/FilterTags/FilterTags.jsx`, and `check_case.js`.
- Slimmed `gateqa_master_plan.md` to open work only.

### PLAN-2026: Insights Coverage Tracking -> Status: Superseded
- Moved manifest-backed answer coverage tracking off the Home dashboard and into the dedicated `InsightsPage`.
- This internal coverage panel was later removed from Insights in the May 2026 cleanup; generated data-status docs remain the source for answer coverage.
- Added regression coverage to keep answer-coverage counters out of the Home page and Insights page.

### PLAN-2026: Resilience, Theme, and Offline Follow-through -> Status: Done
- Added route-level `ErrorBoundary` protection around Home, Explore, Solve, Insights, and Mock shells so unexpected render failures now degrade to a retryable fallback instead of a white screen.
- Added a dedicated `ErrorBoundary` component with reset support and regression tests.
- Completed the dark-mode hardcoded-color audit for non-mock routes while keeping `/mock` locked to light mode for exam parity, with header regression coverage for the route-specific theme behavior.
- Added shell-first offline support with a production service worker, install prompt handling, web manifest, and offline fallback page for GitHub Pages deployment.
- Added generated latest-year answer coverage status so docs now verify `2026: 130/130` answer availability from the shipped answer registry.

### PLAN-2026: Test Hardening and Docs Sync -> Status: Done
- Added page-level unit smoke/regression coverage for Explore, Solve, and Insights routes.
- Expanded mock scoring coverage for wrong MCQ negatives, partial MSQ zero-scoring, and NAT tolerance handling.
- Brought the testing, frontend, roadmap, and free-platform docs back in sync with the shipped route/theme/search/offline state.

### PLAN-2026: Mock E2E, Insights Route, and Image Localization -> Status: Done
- Added dedicated Playwright coverage for the mock test landing card, portal entry, exam-shell start flow, and mock history navigation.
- Moved detailed weak-topic analytics onto the dedicated `/insights` page and replaced the Home-page inline analytics block with a focused CTA.
- Mirrored `446` GateOverflow blob images into `public/question-images/` and rewrote the published question payloads so the live app no longer depends on remote blob-hosted question images.
- Regenerated the public artifact set and remote-image audit so the published bank now reports `0` remote blob-image questions.

### PLAN-2026: Lighthouse Follow-through -> Status: Done
- Re-ran the mobile LHCI profile on `2026-04-10`; all assertions passed with a median landing result of performance `0.97`, accessibility `0.95`, LCP `2111 ms`, and TBT `120 ms`.

### FEAT-027: Full Mock Test Release -> Status: Done
- Enabled full Mock Test mode (`MOCK_TEST_MODE_ENABLED = true`), unlocking the Mock card on the landing page.
- Added a complete Mock Test portal allowing the selection of "Full Mock" (180 min, 65 questions), "Past Paper", and "Custom Builder" modes.
- Implemented a desktop-centric Mock Test Shell (`MockTestShell.jsx`) with realistic timed constraints, an interactive question palette, and a persistent calculator widget.
- Added a `MockTestResults` evaluation screen to review performance post-submission.
- Introduced `MockTestContext` to isolate mock state (timer, active question, results) from the transient practice session state.
- **Architecture Refactor**: Added top-level layout split in `App.jsx` for `/mock` route with `MockBranch` and isolated `FilterProvider`, eliminating race conditions between mock and practice mode.
- **Tab Protection**: Added `beforeunload` event listener in `MockTestShell.jsx` to natively prevent accidental tab close/reload during an active exam.
- **Effect Guards**: Enforced strict `exitInProgressRef` guards on all step-modifying effects in `MockTestShell` to shield state from navigation lag.
- **Code Optimization**: Prevented mounting of `SessionProvider`, `ScrollToTop`, `LegacyNavigationHandler`, and tracking instances during exams by isolating practice environment dependencies.

### FEAT-028: Mock Test UI Refinements & NAT Keypad -> Status: Done
- **NAT Virtual Keypad**: Implemented an interactive, cursor-aware virtual numerical keypad for Numerical Answer Type (NAT) questions, exactly mimicking traditional exam interfaces.
- **NAT Input Replaced**: Changed NAT input type from `number` to `text` to eliminate native browser spin buttons and stabilize caret selection on desktop browsers.
- **Embedded Options Preseved**: Disabled `stripEmbeddedOptions` across the mock test so "agnostic" native question stems do not unintentionally erase embedded choice fragments.
- **Split Option Rendering**: Render explicit options correctly ordered above the "Select your answer" controls, leaving only clean `A, B, C, D` selection nodes for the user to interact with.
- **Header Space Compression**: Radically compressed `MockTestHeader.jsx` to maximize vertical space for the active question:
  - Migrated `{currentSectionLabel}` and `{attemptSubtitle}` inline into the dark master header bar `#2f2f31`.
  - Merged separate header row blocks into a single un-wrappable (`flex-nowrap`) ultra-thin `<nav>` strip.
  - Flattened the massive right-side `MockTestProfile` column into a tight, single-line horizontal flex element, eliminating invisible vertical void space.

### BUG-022: Loading states used inconsistent visuals across the app -> Status: Done
- Added a shared `LoadingState` wrapper around the existing horizontal bar loader so the app no longer mixes text-only and ad hoc loading UIs.
- Reused the same loading animation for shell fallback, landing manifest loading, practice initialization, question-detail hydration, and calculator loading.

### BUG-020: Public bank counts disagree across artifacts and docs -> Status: Done
- Reconciled the published public-bank count across `public`, `pipeline-state.json`, `audit/validation-report-2026.json`, and `docs/generated/data-status.json`.
- Added published-count fields to the pipeline state and validation report so parity checks compare the public bank consistently.
- Promoted `npm run qa:validate-public-parity` into CI before deploy.

### BUG-021: Practice startup depended on the full question bank payload -> Status: Done
- Split practice startup onto `public/question-search-index.json` instead of eagerly depending on `questions-with-answers.json`.
- Added generated `public/question-detail-shards/*.json` so full question HTML is fetched only for the active practice question.
- Updated `QuestionService` to cache index/full-bank datasets separately and hydrate question detail on demand.

### BUG-019: Landing cold start eagerly loads the full runtime -> Status: Done
- Lazy-loaded `PracticeShell` and `MockShell` from `App.jsx`, so the landing route no longer parses those shells on first paint.
- Kept MathJax behind `src/components/Math/MathRuntime.jsx`, which now loads only inside practice/mock runtime instead of the cold landing path.
- Removed the old unused GoatCounter SPA helper files after consolidating analytics in `src/utils/analytics.js`.
- Production build now emits separate `PracticeShell` and `MockShell` chunks, shrinking the landing entry bundle materially.

### BUG-018: URL history behavior and docs are out of sync -> Status: Done
- Restored landing `?mode=` URL writes in `App.jsx` to use `window.history.replaceState(...)` instead of `pushState(...)`.
- Added a regression assertion in `App.test.jsx` to keep landing mode transitions off the browser history stack.

### DATA-CLEANUP: Remove descriptive/query-style non-practice rows from the shipped bank -> Status: Done
- Excluded subjective/descriptive prompts from the runtime practice bank in `QuestionService`, so long-form items such as “Write an SQL query…” no longer appear in practice mode.
- Cleaned the published `public/questions-with-answers.json`, `public/questions-filtered.json`, and `public/questions-filtered-with-ids.json` snapshots to remove the same non-practice rows.
- Added a `QuestionService` regression test to keep descriptive no-answer rows out while preserving valid objective NAT/MCQ/MSQ items.

### BUG-015: "Continue where you left off" does not actually resume prior context -> Status: Done
- Routed the landing-page continue CTA through a dedicated resume action instead of the random-practice start path.
- Resume now re-enters practice without clearing the current filter/question context.
- Added regression coverage for the landing CTA wiring and `?mode=resume` routing behavior.

### BUG-014: Shared subtopic URLs can show unrelated questions -> Status: Done
- Normalized URL-hydrated `selectedSubtopics` through the same parent-subject reconciliation path used by interactive filter updates.
- Fixed shared `?subtopics=` links so they auto-add the matching parent subject before filtering questions.
- Added a `FilterContext` regression test covering subtopic-only shared URLs and unrelated-question leakage.

### BUG-008: Repair historical paper counts -> Status: Done
- Added `scripts/qa/historical-paper-audit.js` as the repeatable 65-question audit for historical papers.
- Added `scripts/qa/import-missing-paper-from-tag.js` for targeted single-paper backfills from live GateOverflow year/set tags.
- Added `scripts/qa/pre-2010-gateoverflow-audit.js` to compare 1987–2009 papers against live GateOverflow year-tag totals using deduped question labels.
- Added `scripts/qa/repair-pre-2010-questions.js` to reconcile 1987–2009 papers with the live GateOverflow year-tag question set, remove off-tag rows, and backfill missing legacy questions.
- Added `scripts/qa/repair-historical-exam-uids.js` to canonicalize malformed historical `exam_uid` values before slot-level reconciliation.
- Added `scripts/qa/repair-historical-paper-counts.js` to:
  - remove non-paper GateOverflow rows that leaked into historical year tags
  - drop duplicate historical variant rows once canonical slots are known
  - recover missing historical questions directly from GateOverflow
  - sanitize hidden bidi characters in affected historical titles
- Rebuilt `public/questions-with-answers.json` from the repaired historical snapshot.
- Restored the missing `2014 Set 1` paper from GateOverflow and synced `65` questions plus `65` answers into the canonical bank.
- Historical audit now reports zero missing slots, zero duplicate slots, and zero malformed `exam_uid` rows for papers audited from 2010 onward.
- Historical audit now covers `27` clean post-2010 papers and reports `questions_without_paper_meta = 0`.
- Pre-2010 audit now reports full question-count and question-label parity against live GateOverflow year tags across all 23 audited years.
- Bumped `QuestionService` init cache version to `v6` so browsers invalidate stale localStorage snapshots after the historical repairs.
- Bumped `QuestionService` init cache version again to `v7` so browsers invalidate stale localStorage snapshots after the `2014 Set 1` import.
- Updated project docs to document the historical repair flow and cache-bump requirement.

### FEAT-003: 2026 Question Import Catch-up -> Status: Done
- Completed the first live FEAT-003 catch-up import for GATE 2026 on 2026-04-04.
- Captured all 130 questions across both sets:
  - 65 questions from Set 1
  - 65 questions from Set 2
- Updated pipeline subject mapping so General Aptitude imports correctly classify spatial/pattern-style GA tags instead of quarantining them as unknown.
- Busted the runtime init cache and removed 2025-only filter fallbacks so the filter page surfaces 2026 immediately after the data import.
- Updated documentation with the manual catch-up runbook and current scheduled-workflow timeout caveat.
- Hardened the automatic FEAT-003 workflow with a release-window retry schedule, a long enough unattended timeout budget, fast-fail handling for non-retryable 4xx tag probes, and transient retry handling for answer backfill.
- Completed the 2026 answer backfill using the official answer keys, updating all 130 questions across both sets with correct solution maps.

### DOCS-2026: Free Platform Improvement Plan Updates -> Status: Done
- Created \`plan2026.md\` to structure future platform performance, UX, and workflow improvements.
- Refined \`FREE_PLATFORM_IMPROVEMENT_PLAN.md\` aligning to current roadmap strategies.

### FEAT-019: Add Google Analytics 4 (GA4) to GateQA -> Status: Done
- Handled via `src/utils/analytics.js` for lightweight wrapper to cleanly capture SPA behavior logic.
- Installed gtag inside `index.html` using custom `G-G3KZ7KSPHG` ID with automatic pageview capturing bypassed (`send_page_view: false`).
- Firing custom page_view events across Landing, Practice, and Mock via transient `appView` component to prevent large numbers of query-string 'Pages'.
- Specific user event streams tied deeply within React for accurate metrics:
    - start_random_practice
    - start_targeted_practice
    - open_filters
    - share_question

### FEAT-016: Horizontal Bar Loader (init screen) -> Status: Done

- Created reusable `<HorizontalBarLoader />` component using MageCDN SVG design.
- Replaced global full-screen spinner with localized loader in the question card area space.
- Added `isInitializing` state to App.jsx to handle smooth transition between data loading, initialization, and question rendering.

### Planned

- Router-backed navigation model (if multi-view UI is introduced)
- Browser E2E regression suite for filtering and deep links
- Import/export UI polish and schema v2 support

## [1.6.0] - 2026-02-28

This release adds a landing dashboard for explicit mode selection before entering practice.

### FEAT-017: Landing / Practice Mode Selection Dashboard -> Status: Done

- Added landing-first shell flow in `src/App.jsx` using transient `appView` state (`landing | practice | mock`), never persisted to localStorage.
- Added one-shot `shouldOpenFilterOnEnter` ref in `App.jsx` for targeted mode auto-open behavior.
- Added strict mount-time URL resolver priority:
  - `?question=<uid>` always wins and forces practice.
  - `?mode=` supports `random`, `targeted`, `mock`.
  - shareable filter params (`years`, `subjects`, `subtopics`, `range`, `types`) bypass landing.
  - fallback route is landing.
- Added `?mode=` writes via `window.history.replaceState(...)` only.
- Added `hasPriorProgress` gate in `App.jsx`, computed once from:
  - `gate_qa_solved_questions`
  - `gate_qa_bookmarked_questions`
- Added new landing components:
  - `src/components/Landing/ModeSelectionPage.jsx`
  - `src/components/Landing/ModeCard.jsx`
- Implemented three mode cards in required order:
  - Random Practice
  - Targeted Practice
  - Mock Test (disabled, `Coming soon` badge)
- Added "Continue where you left off" action (conditional on prior solved/bookmarked progress).
- Preserved existing practice stack behavior (Session queue, deep-link sync, filter URL sync, answer/calculator/progress components).
- Enforced FEAT-017 invariants:
  - INVARIANT-LANDING-001: deep-link `?question` bypasses landing.
  - INVARIANT-LANDING-002: filter-share params bypass landing.
  - INVARIANT-LANDING-003: random entry path clears filters before practice.
  - INVARIANT-LANDING-004: targeted start enters practice and opens filter modal once (no forced inline selection).
  - INVARIANT-LANDING-005: `appView` never persisted.
  - INVARIANT-LANDING-006: `?mode=` writes use `replaceState`, never `pushState`.
- FEAT-017c amendment:
  - Removed: Filtered Practice card.
  - Removed: `targetedValid`, `targetedError`, inline subject picker, forced selection validation.
  - Changed: Layout `lg:grid-cols-2` -> `lg:grid-cols-3`.
  - Changed: Targeted Practice description updated.
  - Changed: `mode=` URL values now `random | targeted | mock` only.
  - Net: cleaner 3-mode UX, same underlying behavior, less code.

## [1.5.0] - 2026-02-27

This release adds smart question randomisation and auto-solve on correct answer.

### FEAT-012: Smart Randomisation — Session Queue with Priority-Weighted Shuffle

- Added `src/contexts/SessionContext.jsx` — new lightweight context for session queue state.
- Replaced `Math.random()` question picking with a deterministic session queue walk.
- Session queue is built from `filteredQuestions` using a three-bucket priority-weighted Fisher-Yates shuffle:
  - **Bucket 1 (front):** unseen + unsolved questions.
  - **Bucket 2 (middle):** unseen + already-solved questions.
  - **Bucket 3 (back):** already-seen questions.
- Each bucket is independently shuffled before concatenation.
- `currentIndex` pointer advances on each "Next Question" click — no question repeats until the entire filtered pool is exhausted.
- `seenThisSession` is an ephemeral in-memory `Set` (React ref) — cleared on page reload and filter change, never persisted to `localStorage`.
- Queue fully rebuilds on any filter change, resetting index and clearing session memory.
- Deep-linked questions (`?question=<id>`) still load directly on page load; the queue takes over from the first "Next Question" click. The deep-linked UID is added to `seenThisSession`.
- Exhaustion banner shown when the user cycles through all questions in the current filter: "You've seen all X questions in this filter. Starting over with a fresh shuffle."
  - Auto-dismisses after 4 seconds or on manual dismiss.
  - Queue reshuffles and resets on exhaustion.
- Added `animate-fade-in` Tailwind animation keyframe for banner entrance.
- `filteredQuestions` `useMemo` in `FilterContext` is **not modified**.
- Progress system (solved/bookmark/progress bar) is **unaffected**.
- Updated `docs/ARCHITECTURE.md` with Session Queue section.
- Updated `docs/FRONTEND_GUIDE.md` with `SessionContext` contract.

### FEAT-011: Auto-Mark Solved on Correct Answer

- Correct MCQ, MSQ, or NAT submissions now automatically mark the question as solved.
- Triggers immediately after answer evaluation in `AnswerPanel.evaluateSubmission()`.
- Skips if the question is already solved or has no progress ID.
- Manual "Mark as Solved" toggle remains fully functional and independent.
- No new UI elements — the existing solved indicator updates reactively.

## [1.4.0] - 2026-02-25

This release captures the full 2026-02-25 development session.

### Performance

- Added build-time subtopic precompute pipeline:
  - `scripts/precompute-subtopics.mjs`
  - output: `src/generated/subtopicLookup.json`
- Added `precompute` npm script.
- Wired precompute step into:
  - `npm start`
  - `npm run build`
- `QuestionService` now uses precomputed lookup payload for:
  - normalized subtopics
  - subject aliases
- Added init cache v2:
  - `INIT_CACHE_VERSION = 'v2'`
  - cache key `gateqa_init_cache_v2`
- Kept chunked normalization path via `_processChunked(...)`.

### BUG-007 (Closed): Subtopic contamination from section-wide tags

- Root cause: scraped GateOverflow data can carry section-level subtopic tags across all questions in a section.
- Fix: `MAX_SUBTOPICS_PER_QUESTION = 1` in `QuestionService.extractCanonicalSubtopics(...)`.
- Added scoped subtopic filtering in `FilterContext` using parent-subject mapping.
- Added reverse map `subtopicToSubjectSlug` in filter state layer.
- Known limitation (documented): genuine multi-subtopic questions are indexed under first matched subtopic only.

### Context split enforcement

- `FilterContext` split into:
  - `FilterStateContext`
  - `FilterActionsContext`
- New hooks:
  - `useFilterState()`
  - `useFilterActions()`
- `useFilters()` compatibility hook removed.
- All filter consumers migrated to state/actions hook pair.
- Added `refreshProgressState()` action for post-import sync.

### Cache hardening and migration

- `_readCache()` now removes legacy key `gateqa_init_cache_v1` on read.
- `_writeCache()` now uses shared `isQuotaExceededError()` helper from `localStorageState.js`.
- Added cache strip/hydrate helpers to keep payload under localStorage limits.

### SUG-2026-0002: Progress import/export manager

- Added `src/components/ProgressManager/ProgressManager.jsx`.
- Added `src/components/ProgressManager/ImportConfirmationModal.jsx`.
- Injected ProgressManager into filter sidebar progress card.
- Added JSON export of solved/bookmarked progress.
- Added enriched CSV export (view-only) with columns:
  - `questionUid,year,subject,subtopic,type,status`
- Added JSON import with explicit strategies:
  - Replace
  - Merge
- Added schema/version checks and user warning flow.
- Added quota/write failure handling.
- Added `refreshProgressState()` call after successful import.
- Added file input reset on all paths to allow re-selecting same file.
- Added inline help popover (`i`) explaining Export JSON / Export CSV / Import.

### Header and UI refinements

- Header action buttons converted to icon-only with `sr-only` text labels and native `title` tooltips.
- Help popover (`i` button) made darker for better visibility; text shortened and cleaned.
- `FilterSidebar` progress card now embeds import/export controls.
- Sidebar footer no longer shows legacy bookmarked-count text line.
- `AnswerPanel` action layout now includes explicit `Solution` button and a smaller icon tray.
- `ImportConfirmationModal` converted to React portal to resolve styling bleed-through.

### Analytics

- Wired GoatCounter SPA tracking via `useGoatCounterSPA` hook in `App.jsx`.

### Repository cleanup (CLEANUP-001)

- Archived pre-pipeline branch and removed redundant Python scripts, intermediate files, and stale configs.
- Updated `REPO_STRUCTURE.md`, `DATA_PIPELINE.md`, `DEPLOYMENT.md`, `QA_HARDENING.md` post-cleanup.
- Configured GitHub Actions permissions for automated pipeline pushes.

### Data policy update

- Updated Data Persistence and Privacy text in UI (`DataPolicyModal`) with explicit backup and transfer steps.

### Tests

- Unit suite now passing with 24 tests total:
  - `src/services/AnswerService.test.js` (12)
  - `src/services/QuestionService.test.js` (8)
  - `src/utils/localStorageState.test.js` (3)
  - `src/contexts/FilterContext.test.jsx` (1)
- Added new tests:
  - subtopic cap behavior in `QuestionService`
  - orphan subtopic removal on subject deselect in `FilterContext`

### Tooling cleanup

- Removed dead script file: `scripts/audit-canonical-filters.mjs`.
- Removed dead npm script entry: `audit:canonical`.

## [1.3.0] - 2026-02-18

### Added

- Question deep linking via `?question=<id>` URL parameter.
- "Share Question" button that copies direct link to clipboard.
- Reusable `Toast` notification component for share feedback.
- `showOnlySolved` filter toggle.
- Mutual exclusion between `hideSolved` and `showOnlySolved`.
- URL support for `showOnlySolved=1`.
- `showOnlyBookmarked` filter toggle with URL support.
- Comprehensive developer documentation overhaul (`docs/`).

### Changed

- `AnswerPanel` action bar refactored to responsive in-flow layout:
  - Mobile: 2-row stacked layout (icon tray + primary buttons).
  - Desktop: single-row flex layout.
- Action bar buttons visually differentiated with distinct colour coding.
- Progress/toggle layout split updated for larger screens.
- `clearFilters()` resets solved-only and bookmarked-only state.

### Fixed

- Deep-link `?question=<id>` preserved during filter URL sync writes.
- Edge cases for invalid question IDs and clipboard API fallback.

## [1.2.0] - 2026-02-15

### Added

- Initial `docs/` developer documentation set.
- Project README with quick start.

## [1.1.0] - 2026-02-13

### Added

- Draggable scientific calculator widget.
- Header calculator trigger and `Ctrl+K` shortcut.
- Glassmorphism effects for modals and support button.

### Fixed

- Drag interaction stability for iframe calculator (60fps performance).
- Calculator close behavior edge cases.

## [1.0.0] - 2026-02-11

### Added

- Core filter system and URL-synced filter state.
- Question normalization and answer resolution services.
- Solved/bookmarked persistence and active filter chips.
- MathJax + DOMPurify rendering path.
- GitHub Pages static deployment pipeline.
