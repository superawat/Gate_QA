# Frontend Guide

This guide covers frontend runtime behavior, state contract, and safe refactor rules.

## Prerequisites

- Node.js 18+
- npm 9+

## Commands

```bash
npm install
npm run precompute
npm start
npm run build
npm run serve
npm run test:unit
```

### Script behavior

- `npm run precompute`
  - runs `node scripts/precompute-subtopics.mjs`
  - generates `src/generated/subtopicLookup.json`
- `npm start`
  1. precompute subtopic lookup
  2. sync calculator into `public/`
  3. start Vite dev server
- `npm run build`
  1. precompute subtopic lookup
  2. sync calculator into `public/`
  3. Vite build to `dist/`
  4. ensure `dist/.nojekyll`
  5. sync calculator into `dist/calculator/`

## Context contract (mandatory)

`FilterContext` is split:

- `useFilterState()` for reactive state reads
- `useFilterActions()` for callbacks

`useFilters()` no longer exists and must not be reintroduced.

All frontend filter components are expected to consume one or both of the split hooks.

## Filter behavior updates (2026-02-25)

### Scoped subtopic filtering

- `selectedSubtopics` are matched within parent subject scope.
- Internal reverse map: `subtopicToSubjectSlug`.
- Selecting a subtopic can auto-add its parent subject.
- Deselecting a subject removes orphaned subtopics.

### BUG-007 guardrail

- `QuestionService` caps extracted subtopics per question to one (`MAX_SUBTOPICS_PER_QUESTION = 1`).
- This prevents contaminated section-level tags from over-filtering results.

## ProgressManager in sidebar

`FilterSidebar` now includes `ProgressManager` inside `ProgressBar`.

Features:

- Export JSON backup (`solvedQuestions`, `bookmarkedQuestions`, schema + app version)
- Export enriched CSV (view-only):
  - `questionUid,year,subject,subtopic,type,status`
- Import JSON with confirmation modal strategies:
  - Merge
  - Replace
- Import success path calls `refreshProgressState()` from `FilterActionsContext`
- Handles quota/storage write errors
- File input is reset in all paths so same file can be reselected
- Inline help popover (`i`) explains export/import actions

### Related UI changes observed in same session

- Progress card now hosts import/export controls directly.
- Previous bottom "bookmarked count" text in sidebar footer is no longer shown.
- `AnswerPanel` desktop/mobile action layout now includes explicit `Solution` button (separate from icon tray).
- Icon tray is now solved/bookmark/share only.

## Deep-link and URL behavior

Supported params:

- `question`
- `years`
- `subjects`
- `subtopics`
- `range`
- `types`
- `hideSolved`
- `showOnlySolved`
- `showOnlyBookmarked`

Rules:

- Filter changes are auto-applied and synced via `replaceState`.
- `question` param is preserved during filter writes.
- Share action in `AnswerPanel` writes deep-link URL with `question=<uid>`.

## Persistence keys

- `gate_qa_solved_questions`
- `gate_qa_bookmarked_questions`
- `gate_qa_progress_metadata`
- `gateqa_progress_v1` (attempt metadata)

## Responsive notes

- Filter modal remains full-screen overlay on all sizes.
- Sidebar internals:
  - progress + toggles at top
  - type toggles
  - topic/year columns
  - year range footer
- Calculator behavior:
  - desktop: draggable floating panel
  - mobile: full-screen panel

## Known caveats

- Some UI files still contain `dark:` classes while product style remains light-first.
- `useGoatCounterSPA` exists but is not mounted in `App.jsx`.
- `useGoatCounterSPA` imports `react-router-dom` while app runtime has no router integration.

## Safe refactor checklist

- [ ] Use split context hooks only (`useFilterState`, `useFilterActions`).
- [ ] Do not break subtopic-to-subject scoped filtering.
- [ ] Keep subject deselect -> orphan subtopic cleanup behavior.
- [ ] Keep `question` param preservation during filter sync.
- [ ] Keep `refreshProgressState()` call after import success.
- [ ] Keep precompute generation path intact for dev/build.
