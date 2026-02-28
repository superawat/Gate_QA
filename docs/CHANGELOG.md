# Changelog

All notable changes to GateQA are documented in this file.

## [Unreleased]

### FEAT-016: Horizontal Bar Loader (init screen) -> Status: Done

- Created reusable `<HorizontalBarLoader />` component using MageCDN SVG design.
- Replaced global full-screen spinner with localized loader in the question card area space.
- Added `isInitializing` state to App.jsx to handle smooth transition between data loading, initialization, and question rendering.

### Planned

- Router-backed navigation model (if multi-view UI is introduced)
- Browser E2E regression suite for filtering and deep links
- Import/export UI polish and schema v2 support

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
