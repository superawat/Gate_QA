# Bug Backlog

This file tracks open bugs, suspected regressions, and recently closed audit issues for GateQA.

## How To Use

- Add only bugs with a clear symptom or a strong code/data signal.
- Mark each entry as `Observed` or `Inferred`.
- Keep reproduction steps short and concrete.
# Bug Backlog

This file tracks open bugs, suspected regressions, and recently closed audit issues for GateQA.

## How To Use

- Add only bugs with a clear symptom or a strong code/data signal.
- Mark each entry as `Observed` or `Inferred`.
- Keep reproduction steps short and concrete.
- When fixed, move the final user-facing note into `CHANGELOG.md`.

## Current Status

- Unit test suite is currently green; run `npm run test:unit` for the exact total.
- Historical paper audit is currently clean: `paper_count: 28`, `questions_without_paper_meta: 0`
- Mock catalog readiness is `28/50` release-ready papers after strict optionless scorable checks block affected papers.
- Aptitude verification is green for `36,836` public rows; `qa:verify-aptitude` may still emit non-blocking coverage/OCR warnings.
- Recent end-to-end and packaging checks also passed: `npm run build`, `npm run test:e2e`, `npm run qa:validate-bundle-budget`, and `npm run qa:validate-landing-network`.
- The bugs below come from repo inspection and audit artifacts, not from failing unit tests

## Open Bugs

*(No critical open bugs)*

## Recently Closed

### BUG-REPORTS-028: 6 Verified Question Reports & Taxonomy Rectification

- **Status**: Resolved on 2026-08-22
- **Severity**: Medium (P2)
- **Area**: Question Bank / Answer Registry / Taxonomy / Filter Engine
- **Symptom**:
  1. `go:333200` (2020 Q31) rendered as NAT instead of MCQ.
  2. `go:371897` (2022 Q39) required optional classification.
  3. `go:523079` (2026 Set 1 Q1) and `go:422889` (2024 Set 2 Q8) GA Probability questions needed cross-topic discoverability under Probability while preserving GA section classification.
  4. `go:422863` (2024 Set 2 Q34) was misclassified as GA due to contaminated scraper tags instead of Engineering Mathematics.
  5. `go:460072` (2025 Set 1 Q8) had incorrect answer key C instead of official answer B.
- **Root Cause & Fix**:
  - Corrected question types, answer registries, manual patches, and tags across JSON banks and shards.
  - Upgraded `FilterContext.tsx` reverse mapping to support multi-parent subtopics like `Probability` across `General Aptitude` and `Engineering Mathematics`.
- **Verification**: `npm run test:unit`, `npm run typecheck`, `npm run qa:validate-data`, `node scripts/qa/validate-public-parity.js`.

### BUG-PRACTICE-STREAK-01: Practice Question Attempts Not Updating Streak, Daily Goal, or Activity Heatmap

- **Status**: Resolved on 2026-08-15
- **Severity**: High (P1)
- **Area**: Practice / Solve Mode / Gamification / Activity Heatmap / Streak Tracking
- **Where**:
  - `src/components/AnswerPanel/AnswerPanel.jsx`
  - `src/utils/practiceProgress.js`
  - `src/pages/HomePage.jsx`
  - `src/pages/SolvePage.jsx`
- **Root Causes**:
  - 1. `AnswerPanel.jsx` invoked `recordPracticeAttempt` without passing `storageKey`, `correct`, or `type`, causing `recordPracticeAttempt` to return `null` immediately and fail to persist attempt history.
  - 2. Non-existent filter state properties (`progressStorageKeys`, `aptitudeProgressStorageKeys`, `daProgressStorageKeys`) were referenced instead of canonical constant keys.
  - 3. Same-window practice attempts lacked reactive broadcast, causing `HomePage` to only update on cross-tab storage events or cloud sync.
  - 4. `SolvePage.jsx` navigation summary evaluated `undefined + 1` to `"Question NaN of undefined"` when session indices were not yet populated.
- **Resolution**:
  - Wired canonical `storageKey`, evaluation results, and storage constants (`PRACTICE_PROGRESS_STORAGE_KEY`, `APTITUDE_PROGRESS_STORAGE_KEY`, `DA_PROGRESS_STORAGE_KEY`) into `recordPracticeAttempt` within `AnswerPanel.jsx`.
  - Added robust fallback resolution (`question.question_uid`, `question.id`, `evaluation.correct`) and same-tab `"gateqa:progress-updated"` event dispatching in `src/utils/practiceProgress.js`.
  - Added `"gateqa:progress-updated"` listener on `HomePage.jsx` to dynamically update streak counts, goal progress, and the activity heatmap.
  - Added finite-number guards in `SolvePage.jsx` `navigationSummary` to safely fallback to `"Question details"`.

### BUG-MOCK-CRASH-01: Website Crashes During Mock Tests / Custom Tests & Complete Test Reset (AUG-013)

- **Status**: Resolved & Zero-Data-Loss Hardened on 2026-08-15
- **Severity**: High (P1)
- **Area**: Mock Tests / Custom Tests / Test State Persistence / Error Recovery
- **Where**:
  - `src/contexts/MockTestContext.tsx`
  - `src/components/MockTest/MockTestShell.jsx`
  - `src/components/MockTest/MockTestQuestion.jsx`
  - `src/components/ErrorBoundary/ErrorBoundary.jsx`
- **Root Causes**:
  - 1. Ephemeral `sessionStorage`-only persistence wiped exam progress on browser crashes, closures, or mobile memory cleans.
  - 2. Self-destructive restore executed `clearAttemptStorage()` on transient question bank index delays.
  - 3. Race condition in `MockTestShell.jsx` immediately forced `"portal"` and synced `"setup"` stage on reload before hydration.
  - 4. NAT input string coercion treated numeric `0` as falsy `""` causing answer corruption.
  - 5. Single-point storage failures could cause stale snapshots to overwrite newer ones if tab storage desynchronized.
- **Resolution**:
  - Implemented dual-tier synchronized storage (`localStorage` + `sessionStorage`) writing versioned snapshot payloads (`v: 5`) with embedded question blueprints for instant, offline restore.
  - Implemented timestamp-based candidate resolution (`savedAt`) comparing primary and backup stores to strictly prefer the latest state.
  - Implemented automatic attempt backup archiving (`gateqa_mock_attempt_backup_v1`) to safeguard previous exam sessions.
  - Implemented strict embedded question validation (`isValidEmbeddedQuestion`) falling back to canonical question bank if embedded data is corrupted.
  - Implemented storage quota error handling (`QuotaExceededError`) with lightweight stripped-question payload fallbacks.
  - Removed self-destructive storage clearing on parse/restore failures; storage is only cleared upon explicit submission or confirmed test exit.
  - Synchronized `beforeunload` and `pagehide` event flushes to capture sub-second state on browser closes.
  - Hardened `MockTestShell.jsx` step initialization with `hasActiveAttemptInStorage()`, preventing flash-resets to setup.
  - Added rich ErrorBoundary fallbacks around question display with "Retry Question", "Previous Question", and "Skip to Next Question" actions.
  - Corrected NAT response coercion to `String(currentResponse ?? "")`.
  - Added comprehensive automated unit tests covering timestamp resolution, corrupted embedded fallback, quota handling, backup rotation, and question error skipping.

### BUG-MOCK-OPT-01: Mock Test Subsystem Full Optimization & Data-Integrity Hardening (AUG-008 & AUG-010)

- Status: Fixed on 2026-08-14
- Severity: High
- Source: Inferred / Engine Audit
- Where:
  `src/contexts/MockTestContext.tsx`
  `src/components/MockTest/MockTestHeader.jsx`
  `src/components/MockTest/MockTestQuestion.jsx`
  `src/components/MockTest/MockTestShell.jsx`
  `src/components/MockTest/MockTestSetup.jsx`
  `src/components/MockTest/MockTestResults.jsx`
  `src/utils/mockTestHistory.js`
  `src/utils/workspaceFile.js`
- Root Cause:
  (1) Active 1-second countdown ticks lived in `MockTestContext`, causing every consuming component (MathJax equations, question stems, option selectors, and palette tiles) to re-render each second; (2) `patchSetupState` in `MockTestShell` checked `next._structuredSubtopics` (undefined), wiping all selected subtopics when toggling subjects; (3) `splitByCatalogSection` only recognized `section === "CS"`, dropping DA questions from generated mock pools; (4) Timer accumulated single-question time during browser sleep/tab switch; (5) Mock submissions did not log attempts to `gateqa_progress_v1`; (6) NAT allowed invalid non-numeric inputs; (7) In-progress exams in `sessionStorage` were missing from workspace JSON backup exports.
- Resolution:
  Decoupled countdown timer into `MockTimerContext` + `useMockTimer()`, isolating updates strictly to `MockTimerDisplay`. Wrapped HTML/LaTeX sanitization in `useMemo` in `MockTestQuestion.jsx`. Connected `patchSetupState` directly to `structuredTags?.structuredSubtopics`. Grouped DA core questions in `splitByCatalogSection`. Capped question timer delta to visible seconds (max 5s). Unified practice progress writes on mock submit. Enforced strict `/^-?\d*\.?\d*$/` NAT regex. Captured `sessionStorage` active mock attempts in `workspaceFile.js`. Added async start exam loading state, `"Practice Missed Questions"` action button, and expanded mock history limit to 50 attempts.
- Verification:
  57 Vitest test files (365 tests) passing; TypeScript typecheck passing with 0 errors.

### BUG-INSIGHTS-OPT-01: Performance Insights Mathematical Integrity & Option C Multi-Branch Architecture (AUG-006 & AUG-009)

- Status: Fixed on 2026-08-14
- Severity: High
- Source: Observed / Mathematical Audit
- Where:
  `src/pages/InsightsPage.jsx`
  `src/utils/weakTopicAnalyzer.js`
  `src/components/Insights/MockHistoryPanel.jsx`
- Root Cause:
  (1) Unique attempted questions (`bucket.attemptedQuestions`) vs total historical attempts (`bucket.correctAttempts`) caused top summary card metric collision; (2) Unweighted arithmetic mean distorted overall user accuracy; (3) Multi-colon DA subtopic slugs (`da:linear-algebra:matrices`) broke practice filter URL navigation; (4) Multi-subject tagged questions risked overcounting in unique attempt totals; (5) Unbounded `Math.max(...array)` spreads risked call stack overflow; (6) Broad keyword matching falsely classified CSE Math as DA; (7) Mock history chart only recorded marks if `q.section === "CS"`, zeroing DA mock core subject marks.
- Resolution:
  Standardized top card metrics (`questions tried` vs `of N submissions`); computed weighted `overallAccuracyRate`; preserved explicit `subtopicSlug` across all buckets; deduplicated unique attempt count via `Set`; replaced `Math.max` spreads with `.reduce()`; enforced strict `da:` / `da-` prefix validation in `isSubjectInTrack`; generalized `MockHistoryPanel` to `coreScore` across all non-GA sections; implemented 0ms memoized caching and shallow object copying in `weakTopicAnalyzer.js`. Added Track Selector pills (`cs`, `da`, `all`) and activated `YearCoverageGrid` and `YearAccuracyTrend`.
- Verification:
  All Insights unit tests passing (`InsightsPage.test.jsx`, `weakTopicAnalyzer.test.js`). 0ms cached re-computations.

### BUG-NAT-TF-1767: Question go:1767 NAT True/False Rendering Bug (AUG-007)

- Status: Fixed on 2026-08-14
- Severity: Medium
- Source: User Report
- Where:
  `src/components/Practice/AnswerPanel.jsx`
  `src/components/MockTest/MockTestQuestion.jsx`
- Root Cause:
  Question `go:1767` (GATE CSE 2014 Set 1 Q9, NAT with answer `16383`) had corrupted tags (`gatecse-2016-set2`, `gate1992`, `gate1994`, `true-false`) from GateOverflow cross-references, causing the UI to render boolean True/False buttons instead of a numeric keypad.
- Resolution:
  Sanitized corrupted tags from `go:1767` in source data and regenerated detail shards/search indexes. Hardened `AnswerPanel.jsx` and `MockTestQuestion.jsx` with defense-in-depth checks: True/False rendering is restricted strictly to legacy papers (<= 1994) with binary answers (`0` or `1`); non-binary NAT questions always render standard numeric input and keypad.
- Verification:
  Unit tests in `AnswerPanel.test.jsx` and `MockTestQuestion.test.jsx` passing.

### BUG-DA-CSE-COLLISION: DA/CSE Classification & Year Filter Collision Resolution

- Status: Fixed on 2026-08-13
- Severity: High
- Source: Observed / User Report
- Where:
  `src/utils/examTrack.js`
  `src/contexts/FilterContext.tsx`
  `src/components/Filters/YearFilter.tsx`
  `src/components/Filters/ActiveFilterChips.tsx`
  `src/services/question-service/QuestionLoader.ts`
  `src/services/question-service/QuestionNormalizer.ts`
  `src/components/MockTest/MockTestShell.jsx`
- Root Cause:
  Stale `gateda-*` tags on CSE rows caused metadata track detection to erroneously classify CSE questions as DA questions, which then attempted to load DA shards and threw `<!DOCTYPE...>` JSON parse errors. Furthermore, shared `2026-s1` filter tokens caused cross-track collisions between CSE and DA papers.
- Resolution:
  Implemented metadata-first track detection in `src/utils/examTrack.js` with CSE-safe defaults and strict validation precedence. Established independent, track-aware year/set identities (`cse:2026:set-1` and `da:2026:set-1`) across filtering, URL hydration, active chips, and Custom Mock matching while retaining legacy `2026-s1` URL compatibility. Re-generated artifacts and sanitized stale DA tags from all CSE rows (`go:523089` now cleanly classified as CSE).
- Verification:
  55 Vitest test files (355 tests) passing, 17 Playwright E2E tests passing, TypeScript typecheck passing, 0 CSE rows with DA tags, 195 DA questions validated with 100% answer coverage, 53 unique mock paper identities, and production build & prerender (3,493 static pages).

### BUG-TAG-CORRECTION: Subject Tagging Error on Question go:460060

- Status: Fixed on 2026-06-17
- Severity: Medium
- Source: User Report
- Where:
  `public/questions-with-answers.json`
- Resolution:
  Corrected metadata tags for question `go:460060` (GATE CSE 2025 Set 1, Q20), removing incorrect subject tags (Operating Systems, Data Structures, Calculus, etc.) and properly classifying it under Discrete Mathematics (`discrete-mathematics`, `combinatory`). Rebuilt all public search indexes and detail shards to propagate.
- Verification:
  `npm run qa:validate-public-parity` and `npm run test:unit` pass successfully.

### BUG-SOLVE-HARDEN: Solve Page Hydration Hardening

- Status: Fixed on 2026-06-04
- Severity: High
- Source: Observed / User Report
- Where:
  `src/pages/SolvePage.jsx`
  `src/contexts/SessionContext.tsx`
  `src/contexts/SessionContext.test.jsx`
  `src/pages/SolvePage.test.jsx`
- Resolution:
  Hardened the Solve page to handle missing or stale question UIDs gracefully. If detail hydration reports a missing question, the question is now pruned from the active session queue and the user is redirected to the next available question instead of rendering a broken detail card. Added a session-level cleanup API to prune random/ordered practice queues without disrupting the session.
- Verification:
  Verified with targeted unit/E2E test suite.

### BUG-NAT-TF: Legacy True/False NAT Mock Question Scoring

- Status: Fixed on 2026-06-04
- Severity: High
- Source: Observed / Mock Audit
- Where:
  `src/components/MockTest/MockTestQuestion.jsx`
  `src/components/MockTest/MockTestQuestion.test.jsx`
- Resolution:
  Corrected mock scoring and choice rendering for legacy True/False mock questions that were typed as NAT. Enabled choice rendering for TRUE/FALSE buttons, mapping TRUE to `1` / FALSE to `0` for evaluation while keeping the NAT label.
- Verification:
  Mock validation tests pass cleanly.

### BUG-DRW-ACC: Drawer Accent Layout Refinement

- Status: Fixed on 2026-06-04
- Severity: Low
- Source: UI Polish
- Where:
  `src/components/Layout/GlobalNavigationDrawer.jsx`
- Resolution:
  Updated drawer labels for `Priority Topics` and `Special Aptitude Section` to use a single solid sky-blue accent, removing unnecessary rendering and animation overhead.
- Verification:
  Visual verification in dev build.

### BUG-MCK-READINESS: Mock Paper Readiness Gaps

- Status: Fixed on 2026-06-04
- Severity: High
- Source: Audit
- Where:
  `public/mock_catalog_v1.json`
  `data/answers/answers_by_question_uid_v1.json`
  `data/answers/manual-answers-patch-v1.json`
- Resolution:
  Corrected mock paper readiness gaps by repairing five malformed answer/type records and expanding option extraction to handle SQL `<pre>` choices and trailing list choices. `2025 Set 1`, `2025 Set 2`, and `2024 Set 2` now have 65/65 scorable mock questions, bringing ready papers to 31/50.
- Verification:
  `npm run build:public-artifacts` and `npm run qa:validate-public-parity` passed.

### BUG-MCK2: Embedded Options and Metadata Resolvers

- Status: Fixed on 2026-06-02
- Severity: High
- Source: User reported / Audit
- Where:
  `src/utils/stripEmbeddedOptions.js`
  `src/utils/questionType.js`
  `src/services/question-service/QuestionNormalizer.ts`
  `scripts/build-public-artifacts.mjs`
  `src/components/MockTest/MockTestQuestion.jsx`
- Resolution:
  Implemented a robust shared normalizer to strip embedded paragraph-labeled A-D/E options from questions, extracting 2,995 embedded rows and fully resolving image-fragment option lists cleanly. Also mapped the `UNKNOWN` question type chip to resolve properly via question metadata, embedded answers, or verified answers (hiding it cleanly if unresolved). The mock catalog now parses successfully into 2,743 scorable questions with 28 ready papers.
- Verification:
  Build-time artifacts regenerated successfully; `npm run test:unit` passed.

### BUG-MCK1: Mock Catalog Optionless MCQs & Layout Rendering Issues

- Status: Fixed on 2026-06-02
- Severity: High
- Source: User reported / Audit
- Where:
  `src/utils/mockTest.js`
  `scripts/build-public-artifacts.mjs`
  `src/utils/htmlAssets.js`
  `src/components/MockTest/MockTestQuestion.jsx`
  `src/contexts/MockTestContext.jsx`
  `src/components/MockTest/MockTestShell.jsx`
  `src/components/MockTest/MockTestSetup.jsx`
- Resolution:
  Added runtime and build-time validations to block optionless scorable questions and answer/option mismatches before mock generation (blocking 33 invalid rows and dropping active papers to 28). Developed `htmlAssets.js` to preserve embedded image and option HTML in mock questions, resolving relative asset paths cleanly. Updated UI components to prioritize unsolved questions, render visual layouts when explicit option arrays are missing, globally record correct mock attempts, and added a toggle (default OFF) to control previously solved questions in mock tests.
- Verification:
  Build-time artifacts regenerated successfully; mock tests and optionless checks verified cleanly.

### BUG-APT4: Aptitude Direct-Link Cold-Start Race

- Status: Fixed on 2026-06-02
- Severity: High
- Source: CI / E2E regression
- Where:
  `src/utils/aptitudePreference.js`
  `src/contexts/FilterContext.jsx`
  `tests/e2e/practice-flow.spec.js`
- Resolution:
  Initialized Aptitude preference synchronously from direct `/question/APT-*` landing URLs, then persisted `gateqa-aptitude-enabled` during context hydration. Updated the E2E expectation to assert automatic Aptitude activation and successful direct question loading instead of a redirect back to Practice.
- Verification:
  `npm run test:unit` passed 259 tests and `npm run test:e2e` passed 17 Playwright tests before push `ee57b91`.

### BUG-APT2: Low-signal aptitude intake clutter reaching public output

- Status: Fixed on 2026-05-19
- Severity: High
- Source: User reported
- Where:
  `scripts/aptitude-pipeline/aptitude-intake-classifier.mjs`
  `scripts/aptitude-pipeline/scrape-aptitude.mjs`
  `scripts/aptitude-pipeline/build_aptitude_db.py`
  `scripts/aptitude-pipeline/remaps.py`
- Resolution:
  Added a shared AptitudeBank attempt/ignore gate across catalog filtering, scraping, and public artifact build. Ignored low-signal full-length packs, duplicate questions, unsupported GS/GK/General Awareness/Hindi/current-affairs sources, invalid rows, brittle remote images, inline base64 images, forbidden display tokens, and synthetic markers before public write. Retired the local PDF/OCR path and kept generated review reports local-only.
- Verification:
  `npm run qa:validate-aptitude`, `npm run qa:verify-aptitude`, and `npm run qa:validate-aptitude-images` pass.

### BUG-C: Past paper / mock answer readiness gaps

- Status: Fixed on 2026-05-18
- Severity: High
- Source: User reported
- Where:
  `scripts/build-public-artifacts.mjs`
  `src/utils/mockTest.js`
  `src/components/MockTest/MockTestQuestion.jsx`
- Resolution:
  Changed artifact building to count curated legacy `SUBJECTIVE` records as mock-only auto-awards. This allows very old partial papers to be released at their parsed size. Updated mock test UI and runtime to treat those prompts as auto-awarded. The mock catalog now reports 50/50 papers ready with 0 blocked.

### BUG-APT1: Aptitude question options repeating in UI

- Status: Fixed
- Severity: High
- Source: User reported
- Where:
  `src/components/Question/Question.jsx`
  retired legacy `parse_questions.py`
- Resolution:
  The A/B/C/D option text embedded inside `questionHtml` was causing duplicate options rendering. Fixed at runtime by calling `stripEmbeddedOptions()` and at pipeline-level by stopping the embed behavior in `to_question_html()`.


### BUG-STK1: Streak Freeze Not Retaining Progress

- Status: Fixed on 2026-06-02
- Severity: High
- Source: Observed / User Report
- Where:
  Progress and streak state management logic (daily progress calculation and streak update routines)
- Resolution:
  Reconciled streak freeze consumption across whole missing-day gaps so a freeze now preserves the active streak when practice resumes after a one-day skip.
- Verification:
  `npm run build` and the targeted streak regression now pass with a 3-day streak preserved across a skipped day.

### BUG-GATE1: GATE Question Images Not Loading

- Status: Fixed on 2026-06-02
- Severity: High
- Source: Observed / User Report
- Where:
  `scripts/mirror-gateoverflow-images.mjs`
  `scripts/qa/validate-question-images.mjs`
- Resolution:
  Localized remote GateOverflow blob images across question-bank and detail-shard data, including subdomain hosts, so public image references now resolve from `public/question-images/`.
- Verification:
  `npm run build:public-artifacts` mirrored 69 images and `node scripts/qa/validate-question-images.mjs` reported 0 remote blob questions and 0 missing files.

### BUG-APT3: Aptitude Cloze Test / Question Content Unavailable

- Status: Fixed on 2026-06-02
- Severity: High
- Source: Observed / User Screenshot
- Where:
  `src/services/AptitudeQuestionService.ts`
  `scripts/qa/validate-aptitude-data.js`
- Resolution:
  Tightened aptitude detail hydration so missing shard rows now fail loudly instead of rendering an empty shell, and added public index/detail consistency checks to the aptitude validation gate.
- Verification:
  `node scripts/qa/validate-aptitude-data.js` passed for 36,836 public aptitude rows.

### CE-001: Content Mismatch

- Status: Fixed on 2026-06-02
- Severity: Medium
- Source: Manual verification
- Where:
  `public/questions-with-answers.json`
  `public/data/answers/answers_by_question_uid_v1.json`
- Resolution:
  Verified GATE CSE 2009 Question 15: the regular expression matches strings containing at least two `0`s, which corresponds to option `C`. The public answer data already matched that reading.
- Verification:
  The original question paper text and the public answer record for `go:1307` agree on `C`.

### BUG-A: Insights page cleanup

- Status: Fixed on 2026-05-08
- Severity: Medium
- Source: User reported
- Where:
  `src/pages/InsightsPage.jsx`
- Resolution:
  removed the hero tagline, removed the internal Answer Coverage section, and disabled Skill Radar animation so the rendered map remains stable.

### BUG-B1-B3: Dark-mode logo and resume CTA contrast regressions

- Status: Fixed on 2026-05-08
- Severity: High
- Source: User reported
- Where:
  `src/index.css`
  `src/pages/HomePage.jsx`
- Resolution:
  removed the dark-mode logo inversion filter and moved the landing resume title/subtitle to theme-token colors.

### BUG-B4: Non-mock dark-mode readability audit

- Status: Fixed on 2026-05-08
- Severity: Medium
- Source: User reported
- Where:
  `src/pages/HomePage.jsx`
  `src/index.css`
  `src/components/Header/Header.jsx`
- Resolution:
  completed a dark-mode pass across Home, Practice, and Insights; moved risky Home cards and the mock-history shortcut to theme tokens; added indigo dark overrides; wrapped the legacy header logo in the contrast frame; and darkened primary blue button overrides so white text clears contrast.
- Verification:
  production Playwright smoke checked representative dark-mode text contrast and logo-frame rendering on `/`, `/practice`, and `/insights`.

### BUG-D: Mock setup sub-pages lacked back navigation to mode selection

- Status: Fixed on 2026-05-08
- Severity: Medium
- Source: User reported
- Where:
  `src/components/MockTest/MockTestSetup.jsx`
  `src/components/MockTest/MockTestShell.jsx`
- Resolution:
  added a `Back to Modes` button on setup sub-pages and covered the flow with a unit regression test.

### BUG-022: Loading states used inconsistent visuals across the app

- Status: Fixed on 2026-04-05
- Severity: Medium
- Source: Observed from UI loading paths
- Where:
  `src/App.jsx`
  `src/components/Landing/ModeSelectionPage.jsx`
  `src/components/Calculator/CalculatorWidget.jsx`
  practice route loading surfaces
- Resolution:
  introduced one shared loading-state wrapper around the existing horizontal bar animation and reused it for shell fallback, landing manifest loading, practice loading, question-detail loading, and calculator loading.
- Current state:
  loading paths now use the same animated loader instead of mixing text-only and ad hoc loading treatments

### BUG-020: Public bank counts disagree across artifacts and docs

- Status: Fixed on 2026-04-05
- Severity: High
- Source: Observed from generated artifacts
- Where:
  `public/question-bank-manifest.json`
  `docs/generated/data-status.json`
  `pipeline-state.json`
  `audit/validation-report-2026.json`
  `docs/DATA_PIPELINE.md`
  `.github/workflows/node.js.yml`
  `.github/workflows/gate-question-pipeline.yml`
- Resolution:
  pipeline state and validation output now publish the current public-bank count, the generated docs snapshot reads those published-count fields, and `npm run qa:validate-public-parity` is enforced in CI.
- Current state:
  public payloads, manifest, generated docs snapshot, pipeline state, validation report, and data-integrity report now agree on the published bank count

### BUG-021: Practice startup depended on the full question bank payload

- Status: Fixed on 2026-04-05
- Severity: High
- Source: Observed from code path and network plan
- Where:
  `scripts/build-public-artifacts.mjs`
  `src/services/QuestionService.ts`
  `src/App.jsx`
  practice route loading surfaces
- Resolution:
  practice now boots from `question-search-index.json`, caches index/full-bank data separately, and loads question HTML from `question-detail-shards/*.json` only for the active practice question.
- Current state:
  cold landing still avoids the bank entirely, practice no longer needs `questions-with-answers.json` on entry, and mock remains the only full-bank path

### BUG-019: Landing cold start eagerly loads the full runtime

- Status: Fixed on 2026-04-05
- Severity: High
- Source: Observed from code path and Lighthouse
- Where:
  `src/App.jsx`
  `src/components/Math/MathRuntime.jsx`
  `src/utils/analytics.js`
  `index.html`
- Resolution:
  landing now boots from a clean static HTML shell, practice/mock shells are lazy-loaded from `App.jsx`, MathJax is imported only inside practice/mock runtime, and the remaining analytics provider is deferred.
- Current state:
  the cold landing path no longer initializes the question bank, MathJax, or eager third-party tags before the user enters practice

### BUG-018: URL history behavior and docs are out of sync

- Status: Fixed on 2026-04-04
- Severity: Low
- Source: Observed from docs vs implementation
- Where:
  `src/App.jsx`
  `docs/ARCHITECTURE.md`
  `docs/FRONTEND_GUIDE.md`
- Resolution:
  landing mode transitions now write `?mode=` with `replaceState`, matching the documented history contract and avoiding extra browser-history entries.
- Current state:
  `App.jsx` no longer uses `pushState` for landing mode changes, and `App.test.jsx` asserts that `replaceState` is used instead

### BUG-015: "Continue where you left off" does not actually resume prior context

- Status: Fixed on 2026-04-04
- Severity: Medium
- Source: Observed from code path
- Where:
  `src/components/Landing/ModeSelectionPage.jsx`
  `src/App.jsx`
- Resolution:
  the landing CTA now routes through a dedicated resume action, and resume enters practice without clearing the current filter/question context.
- Current state:
  landing resume no longer calls the random-practice clear path, and regression tests cover both the CTA wiring and `?mode=resume` routing

### BUG-014: Shared subtopic URLs can show unrelated questions

- Status: Fixed on 2026-04-04
- Severity: High
- Source: Inferred from code path
- Where:
  `src/contexts/FilterContext.jsx`
- Resolution:
  URL-hydrated subtopic filters now flow through the same parent-subject reconciliation used by interactive filter updates, so shared `?subtopics=` links auto-add the matching subject before filtering.
- Current state:
  subtopic-only shared URLs no longer leak unrelated-subject questions, and `FilterContext` includes a regression test for that deep-link path

### BUG-016: Historical audit showed missing paper metadata

- Status: Fixed on 2026-04-04
- Severity: Medium
- Source: Observed from audit artifact
- Where:
  `artifacts/review/historical-paper-audit.json`
- Resolution:
  repaired historical `exam_uid` metadata, reconciled paper counts, and restored the missing `2014 Set 1` paper from GateOverflow
- Current state:
  the audit summary now reports `paper_count: 27`, `papers_with_missing_slots: 0`, and `questions_without_paper_meta: 0`

## New Entry Template

```md
### BUG-XXX: Title

- Status: Open | In Progress | Blocked | Fixed
- Severity: High | Medium | Low
- Source: Observed | Inferred
- Where:
- What happens:
- Repro:
- Fix idea:
```
