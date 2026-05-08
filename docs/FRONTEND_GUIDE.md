# Frontend Guide

This guide covers frontend runtime behavior, state contract, and safe refactor rules.

## Prerequisites

- Node.js 18+
- npm 9+

## Commands

```bash
npm install
npm run precompute
npm run build:public-artifacts
npm start
npm run build
npm run serve
npm run test:unit
```

### Script behavior

- `npm run precompute`
  - runs `node scripts/precompute-subtopics.mjs`
  - generates `src/generated/subtopicLookup.json`
- `npm run build:public-artifacts`
  - runs `node scripts/mirror-gateoverflow-images.mjs && node scripts/build-public-artifacts.mjs`
  - mirrors GateOverflow blob images into `public/question-images/`
  - refreshes the landing manifest, practice search index, detail shards, and generated docs snapshot
- `npm start`
  1. precompute subtopic lookup
  2. mirror question images + build public/runtime artifacts
  3. sync calculator into `public/`
  4. start Vite dev server
- `npm run build`
  1. precompute subtopic lookup
  2. mirror question images + build public/runtime artifacts
  3. sync calculator into `public/`
  4. Vite build to `dist/`
  5. ensure `dist/.nojekyll`
  6. sync calculator into `dist/calculator/`

## Context contract (mandatory)

`FilterContext` is split:

- `useFilterState()` for reactive state reads
- `useFilterActions()` for callbacks

`useFilters()` no longer exists and must not be reintroduced.

All frontend filter components are expected to consume one or both of the split hooks.

`App` route shell contract:

- `BrowserRouter` uses `import.meta.env.BASE_URL` as the basename.
- `/mock` renders through an isolated top-level branch with its own `FilterProvider`.
- all non-mock routes render through the shared practice tree:
  - `FilterProvider`
  - `SessionProvider`
  - `PracticeRoutes`
- mock setup/exam must never share session effects with practice mode.

### Route map

- `/` — `HomePage`
- `/practice` — `ExplorePage`
- `/practice/question/:questionUid` — `SolvePage`
- `/insights` — `InsightsPage`
- `/history/mock-tests` — legacy redirect to `/insights?tab=mock-history`
- `/mock?stage=setup|exam` — isolated `MockShell`

### Landing startup contract

- `QuestionBankManifestService` hydrates the landing page from `public/question-bank-manifest.json`.
- Landing summary pills read the manifest count/latest-year/year-set totals without loading the full bank.
- Landing surfaces manifest-backed question-bank totals and subject distribution without loading the full bank.
- Practice boot reads `public/question-search-index.json`, while question HTML is fetched later from `public/question-detail-shards/*.json`.
- Mock mode remains the only entry path that asks `QuestionService` for the full bank up front.

### Home and Insights routes

- `HomePage` is the primary landing dashboard for:
  - random practice
  - filtered practice
  - mock test entry/history
- a lightweight CTA into the dedicated insights route
- `InsightsPage` is a dedicated full-screen analytics route backed by `loadWeakTopicInsights()`.
- `InsightsPage` intentionally hides internal answer-coverage tracking and focuses on learner-facing practice analytics.
- Mock test history is rendered inside the Insights mock-history tab; the old `/history/mock-tests` route redirects there.
- The Home insights card CTA navigates to `/insights`.

### Session Queue (`SessionContext`, FEAT-012)

`SessionContext` provides smart randomisation state:

- `useSession()` — single hook for all session queue state and actions.

State items:

- `sessionQueue: uid[]` — ordered question walk array, rebuilt on filter change.
- `currentIndex: number` — pointer into the queue, advanced by `advanceQueue()`.
- `showExhaustionBanner: boolean` — true when queue is exhausted.

Actions:

- `advanceQueue()` — advances index, returns next question object.
- `markSeen(uid)` — marks a UID as seen this session.
- `markDeepLinkedQuestion(uid)` — marks deep-linked question as seen.
- `dismissExhaustionBanner()` — manually dismiss the exhaustion banner.

`seenThisSession` lives as an internal `useRef(Set)` — ephemeral, never persisted.

## Filter behavior updates (2026-02-25)

### Scoped subtopic filtering

- `selectedSubtopics` are matched within parent subject scope.
- Internal reverse map: `subtopicToSubjectSlug`.
- Selecting a subtopic can auto-add its parent subject.
- URL hydration for shared `?subtopics=` links also auto-adds the parent subject before filters are applied.
- Deselecting a subject removes orphaned subtopics.

### BUG-007 guardrail

- `QuestionService` caps extracted subtopics per question to one (`MAX_SUBTOPICS_PER_QUESTION = 1`).
- This prevents contaminated section-level tags from over-filtering results.

### Search filtering

- `searchQuery` is normalized to trimmed, lowercase, whitespace-collapsed text.
- Filter matching uses AND-token behavior against each question's prebuilt `searchText`.
- Search is part of the same filter intersection as year, subject, subtopic, and type filters.
- Practice search stays index-backed and does not require detail-shard hydration for every result.

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

- `mode`
- `question`
- `years`
- `subjects`
- `subtopics`
- `range`
- `types`
- `search`
- `hideSolved`
- `showOnlySolved`
- `showOnlyBookmarked`

Rules:

- URL is managed without React Router (History API only).
- Filter changes are auto-applied and synced via `replaceState`.
- `question` param is preserved during filter writes.
- Share action in `AnswerPanel` writes deep-link URL with `question=<uid>`.
- Landing resolver priority (one-shot on mount):
  1. `?question=<uid>` -> practice (always wins)
  2. `?mode=` (`random`, `targeted`, `resume`, `mock`)
  3. any filter param (`years`, `subjects`, `subtopics`, `range`, `types`, `search`) -> practice
  4. fallback -> landing
- Landing start actions write `?mode=` using `replaceState` only (never `pushState`).
- `mode=random` must call `clearFilters()` before entering practice.
- `mode=targeted` sets one-shot auto-open `FilterModal` on first practice render.
- `mode=resume` must preserve the current practice/question/filter context and must not clear filters.
- Search writes must preserve `question` while updating `search` and must remove `search` when cleared.
- Legacy unknown non-mock `mode=` values still route to practice for backward compatibility, but they should not be used for new links.

## Persistence keys

- `gate_qa_solved_questions`
- `gate_qa_bookmarked_questions`
- `gate_qa_progress_metadata`
- `gateqa_progress_v1` (attempt metadata)
- `gate_qa_theme`
- `gateqa_mock_attempt_v1`
- `gateqa_mock_palette_collapsed`

## Theme contract

- Theme preference is controlled from `AppHeader`.
- The selected theme is written to `gate_qa_theme`.
- `document.documentElement[data-theme]` is the single source of truth for CSS theme application.
- If no preference is stored, the app falls back to `prefers-color-scheme`.
- `/mock` is always forced to light mode and does not expose the dark-mode toggle.
- Home, Practice, and Insights have a completed dark-mode readability pass; keep primary dark-mode blue buttons at WCAG-readable contrast with white text.
- Mock setup sub-pages expose a `Back to Modes` control that returns to the mock mode selection screen without leaving `/mock`.
- In mock review/results, `AMBIGUOUS` and `MARKS_TO_ALL` records are shown as auto-awarded bonus questions; they require no response and should not be styled as ordinary correct MCQ/MSQ/NAT answers.

## Responsive notes

- `PageShell` now reserves space for the mobile bottom navigation bar.
- `MobileBottomNav` appears on small screens for Home, Practice, Insights, and Mock History navigation.
- Filter modal remains full-screen overlay on all sizes.
- Sidebar internals:
  - progress + toggles at top
  - type toggles
  - topic/year columns
  - year range footer
- Explore page supports pull-to-refresh on touch devices.
- Solve page supports horizontal swipe navigation between questions in an ordered/random session.
- `AnswerPanel` collapses into a more compact mobile workspace instead of forcing the full desktop layout.
- Calculator behavior:
  - desktop: draggable floating panel
  - mobile: full-screen panel

## Known caveats

- Some legacy UI files still contain `dark:` classes; treat them as Tailwind-to-token cleanup work unless a concrete contrast regression is found.
- Mock exam surfaces intentionally ignore dark mode for exam parity.

## Safe refactor checklist

- [ ] Use split context hooks only (`useFilterState`, `useFilterActions`).
- [ ] Keep `/mock` isolated from the shared practice provider tree.
- [ ] Preserve deep-link precedence: `?question` must beat landing/mode resolution.
- [ ] Preserve filter-share URL bypass to practice.
- [ ] Keep `?mode=` writes on `replaceState`.
- [ ] Keep random start path calling `clearFilters()` before practice.
- [ ] Do not break subtopic-to-subject scoped filtering.
- [ ] Keep normalized AND-token search behavior on `question.searchText`.
- [ ] Keep `search` URL sync preserving `question` and clearing cleanly when search is removed.
- [ ] Keep subject deselect -> orphan subtopic cleanup behavior.
- [ ] Keep `question` param preservation during filter sync.
- [ ] Keep `refreshProgressState()` call after import success.
- [ ] Keep `gate_qa_theme` + `data-theme` in sync and keep `/mock` locked to light mode.
- [ ] Keep the mobile bottom-nav spacing in `PageShell`.
- [ ] Keep precompute plus public-artifact generation paths intact for dev/build.
