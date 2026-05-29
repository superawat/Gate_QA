# Changelog

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
