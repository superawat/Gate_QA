# Changelog

## 2026-06-07

### Added
- Created a custom domain shift guide (`DOMAIN_SHIFT.md`) in the repository root to document the upcoming migration from `superawat.github.io/Gate_QA/` to `gateqa.in`.

### Changed
- Reorganized the motivational quotes engine in `src/utils/motivationalQuotes.js` to randomize quote presentation. Implemented a deterministic seeded shuffle and a greedy interleaving algorithm (`interleaveQuotes`) to guarantee that quotes from the same author are never shown consecutively.
- Corrected the new custom domain configuration from `GateQA.net` to `gateqa.in` across the codebase, updating the domain migration modal constants and headers.
- Rephrased the domain shift notice popup to reassure users that only the URL is changing (keeping layouts and data exactly the same) and clearly instructing them to download and keep their JSON progress file saved on their local system.

## 2026-06-04

### Fixed
- Hardened Solve page handling for unavailable/stale question UIDs. If detail hydration reports a missing question, the question is removed from the active session queue and the user is moved to the next available question instead of seeing a broken detail card.
- Added a session-level cleanup API to prune unavailable questions from ordered/random practice queues without disturbing the rest of the session.
- Fixed legacy true/false mock questions that were typed as NAT by rendering TRUE/FALSE answer choices and mapping TRUE to `1` and FALSE to `0` for scoring while keeping the question type label as `NAT`.
- Updated drawer labels for `Priority Topics` and `Special Aptitude Section` to use a single solid sky-blue accent without animation overhead.
- Corrected recent mock paper readiness gaps by repairing five malformed answer/type records and expanding embedded option extraction for SQL `<pre>` choices and trailing statement-choice lists. `2025 Set 1`, `2025 Set 2`, and `2024 Set 2` now have 65/65 scorable mock questions.

### Verified
- Confirmed current aptitude artifacts are internally consistent: 36,836 index rows, 36,836 detail rows, 0 missing, 0 invalid.
- `npm run build:public-artifacts`
- `npm run typecheck`
- `npm run qa:validate-aptitude`

## 2026-06-03

### Added
- Converted service boundaries to TypeScript (FEAT-020 Phase 3):
  - Converted `QuestionBankManifestService.js` to `QuestionBankManifestService.ts`
  - Converted `AnswerService.js` to `AnswerService.ts`
  - Converted `GlobalDifficultyService.js` to `GlobalDifficultyService.ts`
  - Converted `AptitudeQuestionService.js` to `AptitudeQuestionService.ts`
  - Converted submodules of `src/services/question-service/`: `QuestionLoader.js`, `QuestionNormalizer.js`, `SubjectTaxonomy.js` to `.ts`
  - Converted aggregator `QuestionService.js` to `QuestionService.ts`
  - Created interface definitions `IQuestionService` in `src/services/question-service/types.ts`
  - Created `src/utils/stripEmbeddedOptions.d.ts` declaration file
- Converted filter UI leaf components to TypeScript (FEAT-020 Phase 4):
  - Converted `TopicFilter.jsx`, `YearFilter.jsx`, `YearRangeFilter.jsx`, `QuestionSearchInput.jsx`, `ProgressFilterToggles.jsx`, and `ActiveFilterChips.jsx` to `.tsx`
  - Added typed props, event handlers, filter context casts, and label lookup maps for the converted filter leaves
- Converted context boundaries to TypeScript (FEAT-020 Phase 5):
  - Converted `SessionContext.jsx` to `SessionContext.tsx` with typed session mode, navigation state, topic-memory, and queue contracts
  - Converted `MockTestContext.jsx` to `MockTestContext.tsx` and `FilterContext.jsx` to `FilterContext.tsx` while preserving current runtime behavior and split filter contexts
- Expanded TS types in `src/types/runtime.ts` (adding canonical, detail shards, and normalized properties on `QuestionRow`).
- Expanded filter runtime contracts in `src/types/runtime.ts` with progress-toggle flags, result-count state, and optional filter actions.

### Changed
- Revamped the High Priority Topics page into a simpler preparation guide with the title `High Priority Topics`, official GateOverflow paper-wise marks data for subject trends, selectable `Subject Marks Over Years`, `Marks Distribution Between Subjects`, and `Min/Avg/Max Marks` graphs with subject-specific colors, CSE-only question-index filtering for practice links, separate Technical Topics and Aptitude Topics sections, short subject labels, and recent paper snapshots.
- Refactored desktop scroll behavior inside `ExplorePage.jsx` and `QuestionPickerList.jsx` so that the question table is an internal scroll area on desktop, keeping pagination visible and matching the filter column height.
- Updated `SmartPracticeBanner` and `CollapsibleSection` inside `InsightsPage.jsx` to use theme-safe border and background variables.
- Refined accessibility label inside `AptitudeTopicFilter.tsx`.

### Fixed
- Fixed Node 24 runner CI hang: Playwright versions prior to 1.60.0 have a known zip extraction bug under Node 24. Upgraded `@playwright/test` to `^1.60.0` in `package.json` to resolve the compatibility issue.

### Verified
- `npm run typecheck` passed.

## 2026-06-02

### Added
- Added TypeScript Phase 0 tooling: `typescript`, React 18 type packages, `tsconfig.json`, `src/vite-env.d.ts`, and `npm run typecheck`.
- Added shared embedded-option normalization in `stripEmbeddedOptions.js` to correctly extract paragraph-labeled A-D/E options from questions, extracting 2,995 embedded rows safely.
- Added `questionType.js` logic to dynamically resolve the `UNKNOWN` question type chip from question metadata, embedded answers, or verified answers, hiding the chip cleanly if unresolved.
- Added build-time and runtime mock validation checks to reject scorable MCQs/MSQs without options or with mismatched answer/option labels, ensuring scoring integrity.
- Added an optionless visual rendering fallback inside `MockTestQuestion.jsx` to render embedded HTML mock options cleanly when a structured option array is missing.
- Added a new `Include previously solved questions` toggle inside the Mock Test setup screen, defaulting to `false` (OFF).
- Added focused tests inside `mockTest.test.js` to assert optionless scorable question blocking and visual layout rendering.
- Added the `htmlAssets.js` utility to safely parse and resolve embedded relative visual resource paths in questions and choices.
- Added a stricter aptitude detail hydration guard so missing shard rows fail loudly instead of rendering an empty question shell.
- Added public aptitude index/detail consistency checks to the aptitude validation gate.

### Changed
- Moved Node CI and the scheduled GATE question pipeline to a Node 24 action/runtime baseline using `actions/checkout@v6`, `actions/setup-node@v6`, `actions/github-script@v8`, and `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`.
- Kept the scheduled GATE question pipeline timeout at `330` minutes and documented that old 30-minute cancellations came from earlier workflow revisions.
- Simplified local `gateqa_master_plan.md` into two note-style sections: unresolved/active and completed/resolved.
- Refactored `QuestionNormalizer.js`, `mockTest.js`, and build scripts to use the new unified embedded-option extractor.
- Updated `MockTestShell.jsx` to validate mock pools and prioritize unsolved questions during test generation.
- Updated `MockTestContext.jsx` so that correct answers chosen during mock test sessions mark those questions as solved globally in the user's unified practice history.
- Hardened the GateOverflow image mirror and validator to recognize subdomain blob hosts, localize the missing public question images, and scan question detail shards as well as the top-level question bank.
- Tightened the streak freeze reconciliation logic so it can bridge whole skipped-day gaps and preserve an active streak when the user returns after a one-day pause.
- Gave the Mock Test selection/setup screens a denser premium treatment with clearer selected states, cleaner controls, and better responsive spacing.

### Fixed
- Fixed `MockTestQuestion.jsx` option rendering to prevent duplicates by deduplicating options extracted from the stem.
- Fixed `MockTestContext.test.jsx` and `MockTestFlow.test.jsx` fixtures so mock questions include valid options and answer records, preventing timeouts under the new stricter pool validation.
- Fixed the Aptitude Direct-Link cold-start race-condition in `aptitudePreference.js` and `FilterContext.jsx` by synchronously initializing the in-memory index preference from the URL path.
- Aligned E2E tests in `practice-flow.spec.js` and upgraded workflow actions to permanently fix GitHub Actions runner warnings and E2E test failures.
- Resolved the GATE 2009 Question 15 content mismatch note after verifying that the regular expression corresponds to option `C`.

### Verified
- `npm run build:public-artifacts`
- `node scripts/qa/validate-question-images.mjs`
- `node scripts/qa/validate-aptitude-data.js`
- `npm run typecheck`
- `npm run build`
- Full verification sweep: `npm run test:unit` (272 passing tests) and `npm run test:e2e` (17 passing Playwright tests) completed cleanly.

## 2026-05-29

### Added
- Added automatic Aptitude index activation in `FilterContext.jsx` so that direct links to Aptitude questions (e.g., starting with `/question/APT-`) automatically enable Aptitude mode on load, ensuring detail shards hydrate and render correctly without index-missing errors.
- Added comprehensive regex unescaping (`/\\+r\\+n/gi`, `/\\+n/gi`, `/\\+r/gi`) in `AptitudeQuestionService.js` to normalize multi-escaped JSON shards (like `\\\\r\\\\n` and `\\\\n`), resolving messy paragraph layouts and rendering clean typography for questions like `APT-RSN-8049` and `APT-RSN-7552`.

### Changed
- Replaced the asynchronous dynamic `import('./index.css')` inside `index.jsx` with a standard static `import './index.css';`, forcing the browser's native rendering pipeline to block layout paints until all CSS styles are fully loaded and active.
- Refactored the static HTML loading splash screen (`#app-splash`) to be dismissed inside a top-level `useEffect` in `App.jsx` rather than immediately after scheduling `root.render`. Using a two-tier `requestAnimationFrame` delay ensures the React component tree is fully mounted and styled before the splash screen fades out, completely eliminating Flash of Unstyled Content (FOUC).
- Restored base-agnostic Vite compilation paths in `index.html` for preloads and manifests (e.g. `/manifest.webmanifest` and `/question-bank-manifest.json`), eliminating double base-path warning errors on startup.
- Implemented predictive route preloading in `routePreload.js` and `App.jsx` to prefetch chunk files on hover/focus over Home dashboard cards.
- Integrated `content-visibility: auto` and `contain-intrinsic-size` in `index.css` to restrict layout-recalculation costs for repeated list cards.

### Verified
- Local development server start verified and clean checkouts confirmed.
- Verified smooth transition from static HTML splash screen to fully-styled home page dashboard layout.
- Verified that direct URLs to visual/inequality reasoning questions (`APT-RSN-8049`, `APT-RSN-7552`) load immediately with beautifully parsed, clean typography.

## 2026-05-28

### Added
- Added `npm run aptitude:parse-pending`, a reusable aptitude intake runner that rebuilds pending-only catalogs from the current parsed artifact before parsing, so already parsed paper URLs are skipped automatically.
- Added `npm run aptitude:mark-paper-coverage`, which marks retried paper sets as covered when they contain only duplicate already-parsed questions or no structured rows, preventing endless pending retries.
- Added `npm run aptitude:dedupe-parsed`, which removes duplicate parsed aptitude rows using the same question-text dedupe key as the public build while merging source provenance into the kept row.

### Changed
- Hardened the aptitude scraper resume logic to skip already parsed papers using both runtime source URLs and normalized internal page URLs.
- Made the year-wise pending splitter consume local paper-coverage aliases so duplicate-content papers are excluded from future pending catalogs.
- Cleaned the local parsed aptitude staging artifact from 41,577 rows down to 36,836 unique rows, removing 4,741 duplicate-question rows before public artifact rebuild.
- Sanitized stale private-source provider labels from generated aptitude source metadata without hardcoding the provider label into tracked code.
- Added optional WebP recompression and max-side resizing controls to the aptitude image optimizer so the expanded aptitude image set stays within the public payload budget.
- Tightened the publisher-noise QA pattern to avoid false positives on legitimate learner text such as ordinary "book" and "publication" phrases.

### Verified
- `npm run aptitude:parse-pending -- --dry-run` confirmed the regenerated pending queue skips already parsed papers and leaves 48 pending paper sets.
- `npm run aptitude:parse-pending -- --max-runtime-minutes 180 --concurrency 2 --request-timeout 90000 --delay 1500 --checkpoint-every 5` retried all 48 remaining paper sets; the current structured parser accepted no additional rows, leaving staging at 41,577 parsed rows and 48 paper sets pending for manual/parser review.
- `npm run aptitude:mark-paper-coverage -- --input artifacts/aptitude-pipeline/leftovers-raw-2023.json --input artifacts/aptitude-pipeline/leftovers-raw-2024.json --input artifacts/aptitude-pipeline/leftovers-raw-2025.json --zero-debug-dir artifacts/aptitude-pipeline/debug-leftovers` marked 47 duplicate-content paper sets and 1 zero-structured-row paper set as covered.
- `npm run aptitude:parse-pending -- --dry-run` now reports 1,336/1,336 covered paper sets and 0 pending paper sets.
- `npm run aptitude:dedupe-parsed -- --write` removed 4,741 duplicate parsed rows from local aptitude staging.
- `python scripts/aptitude-pipeline/build_aptitude_db.py`, `npm run aptitude:mirror-images`, `APTITUDE_IMAGE_WEBP_QUALITY=40 APTITUDE_IMAGE_MAX_SIDE=640 node scripts/optimize-aptitude-images-webp.mjs --recompress-webp`, `npm run qa:validate-aptitude`, `npm run qa:verify-aptitude`, and `npm run qa:validate-aptitude-images` completed; image validation passed with 3,718 local images at 19.82 MB.
- Staging and public aptitude duplicate audits both reported 0 duplicate question groups.
- A tracked-file scan confirmed no private source labels, source URLs, or credential strings are present in repository-facing files.

## 2026-05-27

### Added
- Added a highly premium, beautiful **Prep Insights Quick Summary** panel to the High-Priority Topics page (`HighPriorityTopicsPage.jsx`), detailing top Rising, Cooling, Consistently Core, and High-Yield Focus topics to help students instantly see critical preparation priorities.
- Added support for mobile bottom navigation with the new "Priority" tab displaying the `FaFire` icon mapping directly to `HIGH_PRIORITY_TOPICS_ROUTE`.
- Added visible subtopic chips to the Solve question header, so aptitude questions now show the full context chain such as `Aptitude -> Reasoning -> Coding - Decoding -> MCQ`.
- Added a direct hamburger drawer `Filters` shortcut that opens the existing Explore filter UI.
- Added a sanitized year-wise aptitude pending-catalog splitter and parse-coverage report helper for verifying remaining intake by year without exposing private source labels in tracked files.
- Added direct filtered-practice quick start from Explore, including the mobile-friendly `Start Reasoning Practice` / `Continue Filtered Practice` path from active filters.
- Added focused efficiency guard coverage for session prefetching, persistent random-topic memory, cached filtering metadata, aptitude tag caching, and quick-start navigation.

### Changed
- Re-evaluated and balanced topic frequencies and rankings in `highPriorityTopics.js` to combine historical baselines with actual live question bank index counts dynamically, keeping all stats 100% data-driven.
- Replaced absolute marks-based trend calculation with a relative + absolute trend ratio to remove subject weight bias (e.g. preventing small-syllabus areas like CD/Digital Logic from being locked into flat trends).
- Optimized mobile layout for the High Priority Topics page: wrapped mobile line charts in a responsive height container (`h-[180px]`), restructured mobile detail overlays to be scroll-safe (`max-h-[90vh] overflow-y-auto`) to avoid clipping, and scaled the subject charts to be clean and legible.
- Changed Explore question opening to start a balanced random practice session from the filtered pool while keeping the selected question first.
- Replaced practice randomization with a standard stratified shuffle-bag algorithm: Fisher-Yates within each topic, weighted-fair interleaving across subject/subtopic strata, and a short topic cooldown to reduce clustering.
- Improved session efficiency by prefetching the next few likely question details in ordered/random practice and persisting a short recent-topic memory so reopened random practice avoids immediate same-subtopic starts.
- Optimized filter performance by caching normalized per-question filter metadata, using UID lookup maps, avoiding repeated answer/type resolution during filter updates, and preventing filter-time mutation of question objects.
- Precomputed aptitude structured tag and subtopic maps during aptitude index load so aptitude filter flows reuse cached maps instead of rebuilding them.
- Memoized Explore page result slicing/open handlers and the question picker list to reduce unnecessary render work while preserving the paginated layout.
- Upgraded the mobile Home action area into a centered horizontal carousel with partially visible side cards, scroll snapping, active-card emphasis, and compact dots while leaving desktop layout unchanged.

### Verified
- `node scripts/aptitude-pipeline/split-pending-catalog-by-year.mjs ...` (wrote ignored local year-wise pending catalogs and a sanitized coverage report)
- One-paper 2020 parser smoke pass completed with no new rows, leaving that paper pending for manual/parser review.
- `npm run test:unit` (passed, 43 files, 257 tests)
- `npm run build` (passed, production bundle built successfully; HighPriorityTopicsPage bundle: 114.50 kB)
- `git diff --check -- src\components\Practice\QuestionPickerList.jsx src\contexts\SessionContext.jsx src\contexts\SessionContext.test.jsx src\contexts\FilterContext.jsx src\contexts\FilterContext.test.jsx src\services\AptitudeQuestionService.js src\services\AptitudeQuestionService.test.js src\pages\ExplorePage.jsx src\pages\ExplorePage.test.jsx docs\CHANGELOG.md` (passed with only CRLF warnings)

## 2026-05-26

### Added
- Implemented the image-heavy aptitude intake pass to allow visual reasoning, Venn diagram, and mirror/series questions into the platform.
- Expanded the parser, mirroring, and validation checks in `mirror-aptitude-images.mjs` and `validate-aptitude-images.mjs` to recursively inspect `options[]` HTML as well as `questionHtml`.
- Enabled text-only filtering for forbidden string patterns to prevent false-positives on image URLs containing vendor terms.
- Added parser/classifier integration unit tests in `scrape-aptitude.test.mjs` to guard remote-image rendering structures.
- Added a full-screen HomePage readiness overlay that keeps the dashboard hidden until window load, fonts, and paint frames are ready, then fades out smoothly.

### Changed
- Scaled Aptitude Bank from `16,873` to `19,105` high-quality public questions, adding `2,232` newly parsed and accepted aptitude questions (Quant: `7,680`, English: `6,062`, Reasoning: `5,363`).
- Replaced the top quick-actions grid on the Home Page with an elegant horizontal flow, stretching the Practice card to match the Streak Banner size exactly.
- Repositioned study quotes to render inside the far-right section of the primary Practice card with left-border spacing.
- Styled Global Navigation Drawer with a solid theme-surface background, elevated drop shadows, right borders, and slide-in transition physics to eliminate transparent bleeding and double logo overlaps.
- Compacted the Mock Test Results and Insights Mock History overview UI with denser score/time blocks, smaller summary chips, tighter spacing, and shorter review sections.
- Implemented a mobile UI pass for the HomePage: converted the four action cards into a compact horizontal scroll-snap deck for mobile screens, retaining the grid layout on desktop.
- Enhanced the mobile Practice experience: improved header spacing, added a full-width filter trigger, horizontally scrollable chips, card-like mobile question rows, stacked pagination, and enforced global horizontal overflow locking.
- Enhanced Mock History dark mode to be fully theme-aware across timing rows, empty state, charts, attempt cards, and tooltips in `MockHistoryPanel.jsx`.
- Expanded CSV export to include GATE practice, Aptitude practice, and mock-test question history in `workspaceFile.js`.
- Added CSV test coverage for the combined export in `workspaceFile.test.js`.
- Verified clean-checkout import safety for FEAT-013 is retained and passes build and e2e suites.

### Removed
- Removed the unstable hover/focus popup tooltips from Home streak stats for Best, Aura, Freeze, and Days while keeping the stat pills visible.
- Removed direct `html2canvas` dependency from `package.json` and `package-lock.json` (now only an optional transitive dependency for jsPDF).

### Verified
- `npm run test:unit` (passed, 43 files, 250 tests)
- `npm run build` (passed, Exit code: 0)
- `npm run test:e2e` (passed, 17 tests)
- `npm run qa:a11y:axe` (passed, 3 tests)
- `npm run qa:validate-data` (passed with existing non-failing coverage warning)
- `npm run qa:validate-bundle-budget` (passed)
- `npm run qa:validate-landing-network` (passed)
- `npm run qa:validate-public-parity` (passed)
- `npm run lighthouse:mobile` (passed)
- `npm run qa:validate-aptitude` (passed, `19,105` rows)
- `npm run qa:validate-aptitude-images` (passed, 100% local references)
- `git diff --check -- src\components\Home\StreakBanner.jsx src\index.css src\components\Insights\MockHistoryPanel.jsx src\components\MockTest\MockTestResults.jsx` (passed)
- `git diff --check -- src\pages\HomePage.jsx src\index.css` (passed)
- `git diff --check` (passed with only CRLF warnings for the mobile UI pass)
- Note: Other modified files (Home/UI files, docs, generated public artifacts) remain in the worktree untouched to isolate these specific fixes.
- Full unit/build suites were not rerun for the final UI passes alone because the project instructions say to skip them unless explicitly requested.

## 2026-05-25

### Changed

- Restructured navigation drawer: removed nav tiles, merged Workspace into Tools (Export PDF/CSV/JSON, Import JSON).
- Moved hamburger button from left to right side of header.
- Rewrote PDF export as a 2-page jsPDF vector infographic progress report (replaces `html2canvas` screenshots).
- Added CSV progress export (`saveWorkspaceCsv`).
- Retired `.gateqa` file format — standard `.json` for all backups.
- Added per-tool "last used" timestamps, backup reminder card (≥7 days), and info popup.
- Added in-drawer Quick Reference glossary (Streak, Best, Aura, Freeze, Days).
- Removed User Manual link from footer (now in drawer only).
- Fixed Save Reminder and Info popup text colors for dark/light theme safety.
- Fixed Activity Heatmap month label collision on short rolling boundaries.

### Verified

- `npm run test:unit` (`41` files, `238` tests)
- `npm run build`

## 2026-05-20

### Changed

- Rebuilt the public aptitude bank around the AptitudeBank-only intake path: `16,873` English, Quant, and Reasoning questions across `60` subject/subtopic shards.
- Added a shared aptitude attempt/ignore gate so low-signal, duplicate, unsupported, invalid, brittle-image, synthetic, and non-aptitude rows are filtered before public artifacts are written.
- Mirrored public aptitude images into `public/images/aptitude/` and validated that public aptitude data has no remote or broken image references.
- Added the public user manual route at `/manual` and linked it from the footer.

### Removed

- Retired the legacy local aptitude PDF/OCR intake path and deleted the old PDF/OCR helper scripts.
- Removed stale one-off planning/design docs and generated review snapshots from version control.
- Made `artifacts/review/` local-only via `.gitignore` so future QA reports do not clutter GitHub.

### Verified

- `npm run qa:validate-aptitude`
- `npm run qa:verify-aptitude`
- `npm run qa:validate-aptitude-images`
- `npm run test:unit -- --testTimeout=15000` (`40` files, `233` tests)
- `npm run build`
