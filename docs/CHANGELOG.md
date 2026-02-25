# Changelog

All notable changes to GateQA are documented in this file.

Format follows Keep a Changelog principles and uses semantic-style version tags used in this repo.

## [Unreleased]

### Planned

- Router-backed navigation model (if/when multi-view UI is introduced)
- End-to-end browser automation for filter/deep-link regressions
- UI for export/import of user state using `localStorageState` utilities

## [1.4.0] - 2026-02-25

### Added

- Data integrity gate script: `scripts/qa/validate-data.js`.
- New npm scripts:
  - `qa:validate-data`
  - `test:unit`
  - `test:watch`
  - `lighthouse:mobile`
- Lighthouse CI configuration (`lighthouserc.json`) with performance/accessibility/LCP/CLS assertions.
- Local storage utility module and tests:
  - `src/utils/localStorageState.js`
  - `src/utils/localStorageState.test.js`
- GoatCounter SPA tracking utilities:
  - `src/utils/goatCounterClient.js`
  - `src/hooks/useGoatCounterSPA.js`
- Scheduled maintenance workflow: `.github/workflows/scheduled-maintenance.yml`.
- QA hardening documentation:
  - `docs/QA_HARDENING_CHECKLIST.md`
  - `docs/PLATFORM_HARDENING_ALL_UPDATES.txt`

### Changed

- Vite build hardening in `vite.config.js`:
  - manual vendor chunk splitting
  - `cssCodeSplit: true`
  - module preload polyfill disabled
  - sourcemaps disabled for production build
  - custom chunk warning threshold
- Frontend docs refreshed to match current architecture, deep-link, and pipeline behavior.

### Notes

- GoatCounter SPA hook is currently present but not yet mounted in `App.jsx`.
- Strict data validation currently fails on UID/orphan sentinel issues; actionable mapping gaps are logged as warnings.

## [1.3.0] - 2026-02-18

### Added

- `showOnlySolved` filter toggle.
- Mutual exclusion logic between `hideSolved` and `showOnlySolved`.
- Active chip for solved-only mode.
- URL support for `showOnlySolved=1`.

### Changed

- Progress/toggle layout split updated for larger screens.
- `clearFilters()` now explicitly resets solved-only state.

## [1.2.0] - 2026-02-15

### Added

- Initial `docs/` developer documentation set.
- Project-level README with quick start.

## [1.1.0] - 2026-02-13

### Added

- Draggable scientific calculator widget.
- Header calculator trigger and `Ctrl+K` shortcut.
- Support and policy modal UI blocks.

### Fixed

- Drag interaction stability for iframe-based calculator.
- Calculator close behavior edge cases.

## [1.0.0] - 2026-02-11

### Added

- Core filter system (year/year-range/subject/subtopic/type/progress toggles).
- Centralized `FilterContext` URL-synced state model.
- `QuestionService` normalization and taxonomy mapping.
- `AnswerService` multi-index resolution with unsupported fallback.
- Solved/bookmarked progress persistence.
- Active filter chips and clear-all controls.
- MathJax and DOMPurify integration for safe math-capable rendering.
- GitHub Pages static deployment pipeline.
