# Frontend Guide

This guide covers frontend runtime behavior, state contract, and safe refactor rules.

## Prerequisites

- Node.js 20.19+ locally; GitHub Actions currently use Node 24
- npm 9+
- TypeScript is being adopted gradually. The current scaffold type-checks only the TS/TSX surface while legacy JS remains unchecked.

## Commands

```bash
npm install
npm run precompute
npm run build:public-artifacts
npm start
npm run build
npm run serve
npm run test:unit
npm run typecheck
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
- `npm run typecheck`
  - runs `tsc -p tsconfig.json --noEmit`
  - checks the current TS/TSX migration surface only
  - keeps `allowJs` enabled and `checkJs` disabled while legacy JS migration is phased

## Context contract (mandatory)

### FilterContext (split)
- `useFilterState()` for reactive state reads
- `useFilterActions()` for callbacks
- `useFilters()` no longer exists and must not be reintroduced.
- All frontend filter components are expected to consume one or both of the split hooks.

### MockTestContext & Timer Context (split for 60 FPS performance)
- `useMockTest()`: Primary hook providing global exam state, question navigation, response submission, and section switching.
- `useMockTimer()`: Dedicated hook subscribing to `MockTimerContext` (`{ timeLeft }`). Used exclusively by `MockTimerDisplay` in `MockTestHeader.jsx` to isolate 1-second interval countdown ticks and prevent re-render cascades across question stems, MathJax LaTeX equations, option choices, and the question palette during active exams.

### Performance Insights & In-Memory Questions Contract
- `InsightsPage` passes in-memory `allQuestions` from `useFilterState()` directly into `loadWeakTopicInsights(options)`.
- `weakTopicAnalyzer.js` uses an in-memory hash cache returning memoized analytics within 0ms when practice attempts and question banks have not changed.
- Track scoping (`cs`, `da`, `all`) uses strict `da:` / `da-` prefix validation via `isSubjectInTrack()`.

## App route shell contract
- `BrowserRouter` uses `import.meta.env.BASE_URL` as the basename.
- `/mock` renders through an isolated top-level branch with its own `FilterProvider`.
- All non-mock routes render through the shared practice tree:
  - `FilterProvider`
  - `SessionProvider`
  - `PracticeRoutes`
- Mock setup/exam must never share session effects with practice mode.

### Route map

- `/` — `HomePage`
- `/practice` — `ExplorePage` (includes unified Aptitude Practice toggle)
- `/practice/question/:questionUid` — `SolvePage`
- `/insights` — `InsightsPage`
- `/history/mock-tests` — legacy redirect to `/insights?tab=mock-history`
- `/mock?stage=setup|exam` — isolated `MockShell`

### GATE DA integration (AUG-004)

- `DaQuestionService` lazily loads `public/data/da/manifest.json`, the DA search index,
  the answer registry, and year detail shards.
- The practice filter sidebar exposes `Include GATE DA`; it persists as
  `gateqa_include_da` and merges DA rows into the existing CSE result pool only when enabled.
- DA solved IDs, bookmarks, and attempt progress use `gate_qa_da_solved_questions`,
  `gate_qa_da_bookmarked_questions`, and `gateqa_da_progress_v1`. Cloud sync merges these
  additively under the existing `user_progress` JSON payload.
- DA cards and solve headers show `GATE DA`; CSE cards remain unbadged. DA solution links
  resolve only to GateOverflow and are disabled when no redirect exists.
- The shared announcement manager shows the GATE DA launch notice once per browser using
  `gateqa_da_questions_announcement_seen_v1`; the notice is dismissed permanently after
  it is shown, and its optimized banner is served from `public/images/announcements/gate_da.png`.
- `/mock` enables the DA pool and merges `mock_catalog_da_v1.json` with the CSE catalog;
  official DA papers retain 65-question order, GA/technical sections, 180 minutes, marks,
  and MCQ negative marking.

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

### Session Queue & Practice Modes (`SessionContext.tsx`, FEAT-012)

`SessionContext` manages the active practice queue, navigation mode, and position pointers:

- `useSession()` — single hook for session state and queue operations.

State items:
- `sessionMode: "ordered" | "random" | null` — active session mode (`"ordered"` for filtered practice, `"random"` for random shuffle / standalone).
- `sessionQueue: string[]` — active question walk array.
- `sourceQuestionUids: string[]` — source pool UIDs.
- `currentIndex: number` — zero-indexed pointer in `sessionQueue`.
- `showExhaustionBanner: boolean` — true when a random queue cycle is completed.

Key Actions:
- `startOrderedSession(pool, initialUid)` — begins an ordered filtered queue session (preserves list order).
- `startRandomSession(pool, initialUid)` — begins a stratified random session with topic rotation.
- `getNavigationState(uid)` — returns `{ mode, index, total, currentIndex, totalInQueue, previousUid, nextUid, canGoPrevious, canGoNext }`.
- `goToNextQuestion(uid)` / `goToPreviousQuestion(uid)` — step through the active queue.
- `setCurrentQuestionUid(uid)` — synchronizes the queue pointer.
- `dismissExhaustionBanner()` — dismisses the random reshuffle banner.

UI Header Badges on Solve Page:
- Filtered Queue: `CURRENT FILTERED QUEUE` and `Question X of Y`.
- Standalone / Random Session: `RANDOM SESSION` and `Question details`.

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
- `AnswerPanel` desktop/mobile action layout now includes explicit `Solution` button (separate from icon tray). Solution redirects are GateOverflow-only via `getGateOverflowSolutionLink`; PracticePaper/source URLs are rejected, and missing GateOverflow references render a disabled button.
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
- `gateqa-apt-solved-questions` (isolated aptitude progress)
- `gateqa-apt-bookmarked-questions` (isolated aptitude progress)
- `gateqa-aptitude-enabled` (unified toggle state)
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

## Responsive and Mobile Ergonomics (AUG-012)

- **Dynamic Viewport Height (`100dvh`)**: Standardized across `PageShell`, `CalculatorWidget`, `MockTestShell`, `MockTestResults`, and modals to prevent dynamic address bar jumps on mobile browsers.
- **Safe-Area Insets**: Uses `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` with `viewport-fit=cover` in `index.html` for notch and home-indicator protection.
- **Scroll-Reactive Header (`AppHeader.jsx`)**: Auto-collapses on scroll down on mobile viewports while remaining firmly pinned on desktop (`-translate-y-full md:translate-y-0`).
- **Drawer Swipe-to-Dismiss (`GlobalNavigationDrawer.jsx`)**: Supports horizontal swipe-to-dismiss gesture (`diffX < -50`) with vertical scroll disambiguation.
- **Selective Bottom Navigation (`PageShell.jsx`)**: Provides `showMobileBottomNav` prop (defaults `true`). Disabled (`false`) on the active `/practice/question/:id` route to eliminate double navigation bars.
- **Sticky Solve Action Bar (`MobileSolveActionBar.jsx`)**: Dedicated bottom toolbar for active problem solving with Previous, Bookmark, Calculator toggle, Native Share (`navigator.share`), and Next controls with safe-area padding.
- **Haptic Feedback**: Integrates `triggerHaptic(15)` on option selection, solve toggling, bookmarking, and answer evaluation.
- **MathJax & Code Touch Scrolling**: Touch horizontal scrolling (`-webkit-overflow-scrolling: touch`) configured for `mjx-container`, `MathJax`, and code blocks.
- **Mobile Mock Catalog Access**: Mobile users can browse `MockTestPortal` catalogs, year cards, setup configuration, and review results on small screens, while active 3-hour timed exams remain restricted to desktop viewports (`≥1024px`).
- **Icon Tray**: Standardized across viewports for solved/bookmark/share actions.

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
- `gateqa-apt-solved-questions` (isolated aptitude progress)
- `gateqa-apt-bookmarked-questions` (isolated aptitude progress)
- `gateqa-aptitude-enabled` (unified toggle state)
- `gate_qa_theme`
- `gate_qa_mock_attempt_v1`
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
- Explore page supports pull-to-refresh on touch devices, with side-by-side grid action buttons (`grid grid-cols-2`) on small mobile screens.
- Solve page supports horizontal swipe navigation between questions in an ordered/random session.
- `AnswerPanel` collapses into a compact mobile layout with native Web Share API (`navigator.share()`) support, tactile `triggerHaptic(15)` vibration feedback on interactions, and clipboard copy fallback.
- Viewport uses `viewport-fit=cover` in `index.html` for safe-area notch displays.
- Calculator behavior:
  - desktop: draggable floating panel
  - mobile: full-screen panel

## Editorial Pages & Content Layout

- Editorial pages (`/gate-cse-2027-syllabus-changes`, `/gate-2027-syllabus`, `/gate-2027`, `/gate-cs-eligibility`, `/gate-exam-pattern`, `/who-will-conduct-gate-2027`) render through `EditorialPage.jsx` using `EDITORIAL_PAGES` dataset from `src/data/editorialPages.js`.
- Layout architecture:
  - 3-column grid on desktop (Scroll-Spy Table of Contents, main article body, preparation sidebar).
  - Mobile drawer for Table of Contents (`MobileToCDrawer`).
- Dynamic `richCopy` block types supported:
  - `h2`, `h3`, prose strings, `ul` with custom dots.
  - `cards`: grid of icon-based `InfoCard` components.
  - `subject-comparison`: Stripe/Vercel-style "Before → After → What's Changed" documentation diff block (`ep-diff-block`).
  - `split-callout`: two-column decision matrix ("No Changes Needed" vs "Review & Update Required").
  - `official-links`: interactive link cards with icons, target URLs, and external link indicators.
  - `callout`: compact left-border annotations (variants: `info`, `warning`, `tip`, `quick-answer`).
  - `timeline` and `tracks` for preparation roadmaps.
  - Mobile table transformation (`ep-table` to stacked card format below `640px`).
- Hero header includes metadata line (last updated date + reading time) and gradient accent line.
- `BlogListPage.jsx` supports category filter pills (`All`, `Exam Guides`, `Syllabus Updates`, `Subject Guides`) and 6-item multi-page pagination with smooth scroll-to-top execution.

## Known caveats

- Some legacy UI files still contain `dark:` classes; treat them as Tailwind-to-token cleanup work unless a concrete contrast regression is found.
- Mock exam surfaces intentionally ignore dark mode for exam parity.

## Safe refactor checklist

- [ ] Use split context hooks only (`useFilterState`, `useFilterActions`).
- [ ] Keep `/mock` isolated from the shared practice provider tree.
- [ ] Keep Aptitude mode isolated utilizing its distinct `AptitudeQuestionService` and progress keys so it doesn't pollute GATE data.
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
