# Frontend Guide

This guide covers local development, UI behavior, state persistence, and safe refactor rules for the React frontend.

## Prerequisites

- Node.js 18+
- npm 9+

## Commands

```bash
npm install
npm start
npm run build
npm run serve
npm run test:unit
npm run test:watch
npm run qa:validate-data
npm run lighthouse:mobile
```

### Script Details

- `npm start`
  - Runs `scripts/deployment/sync-calculator.mjs --public`
  - Starts Vite dev server (auto-open enabled in `vite.config.js`)
- `npm run build`
  - Syncs calculator into `public/`
  - Builds Vite bundle to `dist/`
  - Creates `dist/.nojekyll`
  - Syncs calculator into `dist/calculator/`
- `npm run serve`
  - Serves built app from `dist/`

## App Layout

- `Header`
  - Home logo link (`import.meta.env.BASE_URL`)
  - Calculator button
  - Filter button
- `FilterModal`
  - Full-screen modal with sticky header/footer
  - Wraps `FilterSidebar`
- Main card area
  - `ActiveFilterChips`
  - `Question` card with MathJax-rendered, sanitized content
  - `AnswerPanel` for answer interaction and actions
- `Footer`
  - Data policy modal trigger
  - Support modal trigger
- `CalculatorWidget`
  - Draggable desktop panel, full-screen mobile sheet

## Filter UX Contract

### Active Dimensions

- Year set (`selectedYearSets`)
- Year range (`yearRange`)
- Subject (`selectedSubjects`, slug-based)
- Subtopic (`selectedSubtopics`, slug-based)
- Type (`MCQ`, `MSQ`, `NAT`)
- Progress toggles:
  - `hideSolved`
  - `showOnlySolved`
  - `showOnlyBookmarked`

### Rules

- All filters auto-apply immediately.
- `hideSolved` and `showOnlySolved` are mutually exclusive.
- If all three types are selected, type filtering is skipped.
- `clearFilters()` resets to defaults, including progress toggles.

## URL State and Deep Linking

### Query Parameters

- `question=<question_uid>`
- `years=2025-s2,2024-s0`
- `subjects=os,dbms`
- `subtopics=deadlock-prevention-avoidance-detection,sql`
- `range=2016-2025`
- `types=mcq,nat`
- `hideSolved=1`
- `showOnlySolved=1`
- `showOnlyBookmarked=1`

### Deep-link Behavior

- On first initialized render, app checks `question` param and tries to resolve exact question.
- If resolved question is in current filtered pool, it becomes current question.
- If question is invalid or excluded by active filters, app falls back to random filtered question.
- Share action in `AnswerPanel` copies URL with `?question=<uid>`.
- Filter URL sync preserves existing `question` param.

## Progress Persistence

### Keys Used by FilterContext

- `gate_qa_solved_questions`
- `gate_qa_bookmarked_questions`
- `gate_qa_progress_metadata`

### Additional Key Used by AnswerPanel

- `gateqa_progress_v1` (attempt metadata)

### Storage Behavior

- Storage availability is probed with a write/remove health check.
- Legacy bookmarks key (`gateqa_bookmarks_v1`) is migrated once.
- Invalid IDs are pruned when canonical question ID set is available.
- If storage writes fail, persistence is marked unavailable and UI shows warning text.

## Responsive Behavior

- `< 768px`
  - Filter sections stack vertically
  - Calculator becomes full-screen panel
  - AnswerPanel action bar uses stacked mobile layout
- `>= 768px`
  - Topics and years shown side-by-side in filter modal
  - Calculator is draggable floating panel
- `>= 1024px`
  - Progress bar and progress toggles shown in horizontal split

## Security and Rendering

- Question HTML is sanitized with DOMPurify before rendering.
- Math is rendered through `better-react-mathjax`.
- `index.html` defines MathJax config and includes analytics scripts.

## Known Caveats

- There are still `dark:` classes in components even though product direction is light-first.
- `useGoatCounterSPA` exists but is not mounted in `App.jsx`.
- `useGoatCounterSPA` imports `react-router-dom`; app currently has no router.

## Safe Refactor Checklist

Before merging frontend/filter changes:

- [ ] URL round-trip still works for all active params.
- [ ] `question` deep-link survives filter updates.
- [ ] Current question never drifts outside filtered pool.
- [ ] `clearFilters()` returns exact default state.
- [ ] Mutually exclusive solved toggles still enforce exclusion.
- [ ] Subject and subtopic chips use canonical labels, not raw slugs.
- [ ] Progress counts remain based on all questions (not current filtered subset).
- [ ] Mobile and desktop action bars are both usable.
- [ ] Calculator can open/close with button, `Ctrl+K`, and `Escape`.
