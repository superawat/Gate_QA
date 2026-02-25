# Changelog

All notable changes to GateQA are documented in this file.

## [Unreleased]

### Planned

- Router-backed navigation model (if multi-view UI is introduced)
- Browser E2E regression suite for filtering and deep links
- Import/export UI polish and schema v2 support

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

### UI side effects documented

- `FilterSidebar` progress card now embeds import/export controls.
- Sidebar footer no longer shows legacy bookmarked-count text line.
- `AnswerPanel` action layout now includes explicit `Solution` button and a smaller icon tray.

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

- `showOnlySolved` filter toggle.
- Mutual exclusion between `hideSolved` and `showOnlySolved`.
- URL support for `showOnlySolved=1`.

### Changed

- Progress/toggle layout split updated for larger screens.
- `clearFilters()` resets solved-only state.

## [1.2.0] - 2026-02-15

### Added

- Initial `docs/` developer documentation set.
- Project README with quick start.

## [1.1.0] - 2026-02-13

### Added

- Draggable scientific calculator widget.
- Header calculator trigger and `Ctrl+K` shortcut.

### Fixed

- Drag interaction stability for iframe calculator.
- Calculator close behavior edge cases.

## [1.0.0] - 2026-02-11

### Added

- Core filter system and URL-synced filter state.
- Question normalization and answer resolution services.
- Solved/bookmarked persistence and active filter chips.
- MathJax + DOMPurify rendering path.
- GitHub Pages static deployment pipeline.
