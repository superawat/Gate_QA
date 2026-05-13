# Architecture

GateQA is a static React SPA hosted on GitHub Pages.
There is no backend, no database, and no server-side rendering.

## Runtime Topology

1. Static host serves `dist/`.
2. `src/index.jsx` mounts `App`, defers non-critical stylesheet loading until after first frame, and registers the production service worker.
3. `App` initializes the lightweight landing manifest on mount:
   - `QuestionBankManifestService.init()`
4. `FilterProvider` seeds summary state from the manifest and owns filter/progress state.
5. `App` resolves `appView` (`landing | practice | mockSetup | mockExam`) directly from URL params.
6. `QuestionService.init()` and `AnswerService.init()` run only when practice or mock entry needs question data:
   - practice loads the lightweight search index plus answer lookups
   - mock still loads the full question bank
7. UI renders one of:
   - Landing mode selector dashboard
   - Practice view (filter modal, chips, question card, answer panel)
   - Mock setup shell
   - Mock exam shell
8. Header, calculator, and footer remain shared shell components.

## Error Boundaries

- `src/components/ErrorBoundary/ErrorBoundary.jsx` wraps route content that is expensive or async-heavy.
- `App.jsx` places boundaries around:
  - `HomePage`
  - `ExplorePage`
  - `SolvePage`
  - `InsightsPage`
  - `MockShell`
- Failures inside those trees now render a local retryable fallback instead of collapsing the entire SPA.

## Dark Mode

- Theme selection is stored under `gate_qa_theme`.
- `AppHeader.jsx` applies the active theme by setting `document.documentElement[data-theme]`.
- The app defaults to `prefers-color-scheme` when there is no stored preference.
- `/mock` is intentionally forced to light mode and hides the dark-mode toggle to preserve exam parity.
- `src/index.css` carries the shared `[data-theme="dark"]` token palette plus utility-class overrides for older Tailwind-heavy surfaces.

## PWA / Offline

- `index.html` ships a web manifest and mobile install metadata.
- `src/index.jsx` registers `public/sw.js` only in production builds.
- `public/sw.js` precaches the shell and runtime-caches the manifest, search index, detail shards, answer payloads, and static assets.
- `public/offline.html` is used as the navigation fallback when shell content is unavailable offline.

The landing route now stays on a lightweight startup path:

- `index.html` no longer includes analytics, Google Fonts, or MathJax tags
- `App.jsx` lazy-loads practice and mock shells only when the user enters them
- `src/components/Math/MathRuntime.jsx` imports MathJax only inside practice/mock runtime
- `src/utils/analytics.js` defers the single remaining analytics provider until first interaction or idle

## Four-layer initialization model (2026-02-25)

### Layer 1: Build-time precompute

- Script: `scripts/precompute-subtopics.mjs`
- Output: `src/generated/subtopicLookup.json`
- Precompute runs before dev/build via npm scripts.
- Purpose: remove runtime regex/normalization cost for subtopic and alias lookup.

### Layer 2: Chunked normalization

- `QuestionService._processChunked(rows, chunkSize=500)` processes question rows in chunks.
- Uses yielding (`setTimeout(..., 0)`) to avoid long main-thread blocking.

### Layer 3: Memoized filter engine + split contexts

- `FilterContext` is split into:
  - `FilterStateContext` (data)
  - `FilterActionsContext` (callbacks)
- Hooks:
  - `useFilterState()`
  - `useFilterActions()`
- `useFilters()` has been removed permanently.
- `filteredQuestions` is computed via `useMemo` in `FilterContext`.

### Layer 4: localStorage init cache

- `INIT_CACHE_VERSION = 'v11'`
- runtime keys `gateqa_index_cache_v11` and `gateqa_full_bank_cache_v11`
- `_readCache()` migrates by removing legacy `gateqa_init_cache_v1`, `gateqa_init_cache_v2`, `gateqa_init_cache_v3`, and `gateqa_init_cache_v7`.
- `_writeCache()` handles quota/storage errors via `isQuotaExceededError()`.
- Filter defaults treat the current year as the fallback max year until structured question data is loaded, so newly imported years such as 2026 can appear in the filter UI as soon as the cache is refreshed.
- Cache version should be bumped whenever the live question bank is replaced with a materially repaired snapshot, such as the 2026-04-04 historical paper repairs.

## Generated public artifacts

Script:

- `scripts/build-public-artifacts.mjs`

Outputs:

- `public/question-bank-manifest.json`
- `public/question-search-index.json`
- `public/question-detail-shards/*.json`
- `public/question-images/*`
- `docs/generated/data-status.json`
- `docs/generated/DATA_STATUS.md`
- `artifacts/review/local-image-mirror-report.json`
- `artifacts/review/remote-image-report.json`

Purpose:

- give the landing page a lightweight manifest contract
- provide a lightweight search/filter index separate from full question HTML
- serve full question HTML in year/set detail shards that are fetched only for active practice questions
- localize GateOverflow blob images into first-party static assets before publish
- publish one generated count/status snapshot for docs
- keep remote-image debt visible and enforce the zero-remote-image target

*(Note: Aptitude data shards and index are generated by the `scripts/aptitude-pipeline/build_aptitude_db.py` script.)*

These artifacts are generated before dev/build via the npm scripts in `package.json`.

## Services

## `QuestionService`

`QuestionService.js` is now a thin static facade over three focused modules:

- `src/services/question-service/SubjectTaxonomy.js`
- `src/services/question-service/QuestionNormalizer.js`
- `src/services/question-service/QuestionLoader.js`

Responsibilities:

- Candidate JSON selection with join-coverage scoring.
- Practice-mode index hydration and detail-shard lookup.
- Question normalization (`question_uid`, `exam_uid`, canonical subject/subtopic/type).
- Practice-bank exclusion of non-objective rows, including subjective/descriptive prompts that should not appear in the practice queue.
- Structured tag generation for filter UI.
- Init cache read/write and migration.

Performance constants:

- `MAX_SUBTOPICS_PER_QUESTION = 1`
- `INIT_CACHE_VERSION = 'v11'`

BUG-007 guardrail:

- Subtopic extraction is capped to first matched subtopic per question to prevent section-tag contamination.

## `AnswerService`

Answer resolution order:

1. by `question_uid`
2. by `answer_uid` (`v<volume>:<id_str>`)
3. by `exam_uid`
4. unsupported registry sentinel (`type: "UNSUPPORTED"`)

## `AptitudeQuestionService`

`AptitudeQuestionService.js` manages the standalone Aptitude bank (currently 32,386 questions).

Responsibilities:
- Handles loading of `public/aptitude-search-index.json`.
- Lazily fetches question detail shards via `ensureQuestionDetail()` from `public/data/aptitude/{subject}/{subtopic}.json`.
- Ensures zero interference with GATE progress by utilizing separate localStorage keys (`gateqa-apt-solved-questions`, `gateqa-apt-bookmarked-questions`).

Performance:
- Shards prevent sending massive 9MB+ JSON payloads to the client.
- The search index drives the Explore page filter and search.

## Filter and progress state model

### Filter state (`FilterStateContext`)

- `selectedYearSets`
- `yearRange`
- `selectedSubjects`
- `selectedSubtopics`
- `selectedTypes`
- `hideSolved`
- `showOnlySolved`
- `showOnlyBookmarked`
- `searchQuery`

### Actions (`FilterActionsContext`)

- `updateFilters`, `clearFilters`
- `toggleSolved`, `toggleBookmark`
- `setHideSolved`, `setShowOnlySolved`, `setShowOnlyBookmarked`
- `refreshProgressState`
- question lookup/progress helpers

### Scoped subtopic filtering

- A reverse map `subtopicToSubjectSlug` is built from structured tags.
- Subtopic predicates are applied within their parent subject scope.
- Selecting subtopics can auto-add parent subjects.
- URL-hydrated subtopics are normalized through the same parent-subject auto-add path before filtering.
- Deselecting subjects removes orphaned subtopics.

### Search filtering

- `searchQuery` is normalized as trimmed, lowercase, whitespace-collapsed text.
- `filteredQuestions` applies tokenized AND matching against index-row `question.searchText`.
- Search uses `useDeferredValue` so live typing does not block the rest of the filter work.
- Search stays index-only in practice mode and does not require `ensureQuestionDetail()` or shard fetches.

## Session Queue (FEAT-012, 2026-02-27)

Smart randomisation replaces pure `Math.random()` question picking with a session queue.

### State (`SessionContext`)

- `sessionQueue: uid[]` — ordered walk array, rebuilt on every filter change.
- `currentIndex: number` — pointer into queue, advances on Next Question.
- `seenThisSession: Set<uid>` — ephemeral in-memory set (React ref), cleared on page reload and filter change. Never persisted to localStorage.
- `showExhaustionBanner: boolean` — true when the user exhausts the current queue.

### Bucket priority order

Queue is built from `filteredQuestions` using a priority-weighted Fisher-Yates shuffle:

1. **Bucket 1 (front):** UIDs not in `seenThisSession` AND not in `solvedQuestionIds` — never seen, unsolved.
2. **Bucket 2 (middle):** UIDs not in `seenThisSession` AND in `solvedQuestionIds` — never seen this session, already solved.
3. **Bucket 3 (back):** UIDs in `seenThisSession` — already seen this session.

Each bucket is independently Fisher-Yates shuffled. Final queue = Bucket 1 + Bucket 2 + Bucket 3.

### Queue lifecycle

- **Filter change:** `useEffect` watching `filteredQuestions` triggers full rebuild, resets `currentIndex` to 0, clears `seenThisSession`.
- **Next Question:** increments `currentIndex` by 1, marks new UID as seen.
- **Deep link:** loads the specified question directly, marks its UID as seen so it doesn't reappear at front.

### Exhaustion behaviour

- When `currentIndex` reaches end of queue on Next Question click:
  - Banner shown: "You've seen all X questions in this filter. Starting over with a fresh shuffle."
  - Queue reshuffled from full filtered pool, `currentIndex` reset to 0.
  - Banner auto-dismisses after 4 seconds or on manual dismiss.

## Landing / Mode Selection (FEAT-017, 2026-02-28)

`App.jsx` owns transient UI state:

- `appView`: `landing | practice | mockSetup | mockExam` (never persisted)
- `shouldOpenFilterOnEnter`: one-shot `ref` used to auto-open `FilterModal` when entering targeted practice

Mount-time URL-to-view resolver (one-shot on mount):

1. If `?question=<uid>` exists -> force `practice` (deep-link wins)
2. Else check `?mode=`:
   - `random` -> `clearFilters()` then `practice`
   - `targeted` -> set one-shot filter-open flag then `practice`
   - `resume` -> `practice` without clearing filters
   - `mock` -> `mockSetup` or `mockExam` when the feature flag is enabled
   - any other non-mock mode value -> `practice` for backward compatibility
3. Else if any shareable filter params exist (`years`, `subjects`, `subtopics`, `range`, `types`, `search`) -> `practice`
4. Else -> `landing`

Landing actions:

- Random start always calls `clearFilters()` before entering practice.
- Targeted start sets the one-shot auto-open modal flag and keeps any existing filter state intact.
- "Continue where you left off" resumes the current practice/question/filter state instead of routing through random mode.
- Mock card is visible and provides access to the Mock Test portal.
- "Continue where you left off" is shown only when solved or bookmarked local progress exists.

`?mode=` writes use `window.history.replaceState(...)` only.

## Mock Test Architecture Refactor (2026-04-06)

### 1. Top-Level Layout Split (`App.jsx`)

`AppRuntime` now checks if the current route is `/mock` at the top level:

- **If on mock** → renders `MockBranch` with its own isolated `FilterProvider`, completely separate from practice mode.
- **If not on mock** → renders the existing `FilterProvider` → `SessionProvider` → `PracticeRoutes` tree.

This guarantees zero shared effects between mock and practice, eliminating navigation race conditions. The legacy `MockRoute` component handling mock-specific overrides was eliminated, keeping navigation straightforward.

### 2. Exam Tab Close Protection (`MockTestShell.jsx`)

- Added a `beforeunload` event listener that activates when `testActive` is `true`.
- The browser will natively show a confirmation dialog if the user attempts to close or reload the tab during an active exam.

### 3. Effect Guards (`MockTestShell.jsx`)

- All step-modifying effects in `MockTestShell` now actively check `exitInProgressRef` before making any state changes.

### 4. Mock Auto-Award Policy

- `MCQ`, `MSQ`, and `NAT` remain the only normally evaluated answer types.
- `AMBIGUOUS` and `MARKS_TO_ALL` records are mock-only auto-awarded questions: they count toward paper completeness, add their marks automatically, and do not require a response.
- Auto-awarded mock questions are not converted into normal answers and are not written back as solved practice progress.

### Key Benefits

- **No race conditions**: Mock and practice environments cannot interfere with each other.
- **Better performance**: Components like `SessionProvider`, `ScrollToTop`, `LegacyNavigationHandler`, and practice pageview tracking do not mount or run during exams.
- **Tab close protection**: Prevents accidental exam loss during active tests.
- **Cleaner codebase**: Eradicated mock conditional logic intertwined with practice setups.

## URL contract

Synchronized params:

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

`question` is preserved during filter URL writes.
`mode` is written on landing mode start with `replaceState` (never `pushState`).

## UI component map

- `Header` (filter/calculator controls)
- `ErrorBoundary`
- `Landing/ModeSelectionPage`
  - `Landing/ModeCard`
- `FilterModal`
  - `FilterSidebar`
    - `ProgressBar`
    - `ProgressManager` (JSON/CSV export, import)
    - `ProgressFilterToggles`
    - `TopicFilter`, `YearFilter`, `YearRangeFilter`
- `ActiveFilterChips`
- `Question`
- `AnswerPanel`
- `CalculatorWidget`
- `MobileBottomNav`
- `InsightsPage`
- `Footer` + policy/support modals

## Data persistence keys

- `gate_qa_solved_questions`
- `gate_qa_bookmarked_questions`
- `gate_qa_progress_metadata`
- `gateqa_progress_v1` (attempt metadata, used by AnswerPanel)

## Invariants

- `hideSolved` and `showOnlySolved` are mutually exclusive.
- `question` query param must not be dropped during filter sync.
- `clearFilters()` resets all filter dimensions, including `searchQuery`.
- `?question=<uid>` must always bypass landing and open practice.
- Shared filter URLs (`years`, `subjects`, `subtopics`, `range`, `types`, `search`) must bypass landing.
- Random mode must clear filters before entering practice.
- Targeted mode must open the filter modal once after entering practice.
- `appView` is not persisted to localStorage.
- `?mode=` writes must use `replaceState`.
- Build must include `.nojekyll` and synced calculator assets.
- Build should also include generated manifest, search index, and detail-shard artifacts.
- `base` in `vite.config.js` must stay `/Gate_QA/` for current hosting path.

## CSS Deferral Analysis

`src/index.css` is **~5 KB** total (202 lines). Breakdown:

- `:root` light-mode vars (L5–19) — needed for first paint
- `[data-theme="dark"]` overrides (L21–131) — not needed for first paint, but tiny
- Resets and typography (L132–194)
- `.logo-icon` (L196–201)

**Decision: no-split — too small to justify.** At 5 KB uncompressed (~1.6 KB gzip), the overhead of an async loader, FOUC risk, and extra HTTP request outweigh any LCP gain from deferring dark-mode overrides. The entire file is inlined into the landing CSS chunk by Vite's `cssCodeSplit`, which is already efficient.

## Bundle Composition

Verified via `npm run build` (2026-05-08). Chunks sorted by size:

| Chunk | Raw | Gzip | Notes |
|-------|-----|------|-------|
| `vendor-misc` | 458.25 kB | 136.41 kB | shared third-party runtime |
| `index` (app shell + landing) | 150.58 kB | 40.87 kB | routing, Home/Landing, PageShell |
| `vendor-react` | 142.34 kB | 45.83 kB | React 18 + ReactDOM + Scheduler |
| `MockShell` | 81.04 kB | 22.02 kB | **Lazy chunk** - mock test context + UI |
| `ExplorePage` | 45.38 kB | 12.03 kB | **Lazy chunk** - explore/browse |
| `InsightsPage` | 45.26 kB | 10.65 kB | **Lazy chunk** - practice analytics + mock history tab |
| `vendor-ui` | 41.04 kB | 15.40 kB | react-icons, rc-slider, react-select |
| `SolvePage` | 22.71 kB | 7.01 kB | **Lazy chunk** - solve/practice question |
| `CalculatorWidget` | 8.05 kB | 3.14 kB | **Lazy chunk** - scientific calculator |
| `vendor-mathjax` | 5.88 kB | 2.26 kB | MathJax loader shim (deferred) |
| `Toast` | 0.37 kB | 0.30 kB | **Lazy chunk** - toast notification |

Key observations:

- **MathJax is NOT in the landing chunk.** `vendor-mathjax` is a separate lazy chunk loaded only inside practice/mock shells.
- **Practice pages and MockShell are lazy chunks**, loaded on-demand when the user enters practice, solve, insights, or mock mode.
- **Mock history now lives inside `InsightsPage`**; `/history/mock-tests` redirects to `/insights?tab=mock-history`.
- CSS is split into `index`, `MockShell`, and `vendor-ui`. MockShell CSS loads only with its JS chunk.

## Startup Split Status (Phase 1 / 1b)

The startup split is now live end to end:

- Landing boots from `public/question-bank-manifest.json`.
- Practice boot loads `public/question-search-index.json` instead of the full bank.
- `QuestionService` and `AnswerService` initialize only when practice, deep-link, or filter URLs require question data.
- `FilterProvider` can seed totals/year ranges/subject lists from the manifest before the full bank is loaded.
- Practice route pages and the mock shell are lazy-loaded from `App.jsx` instead of being parsed on cold landing load.
- Practice question HTML is fetched lazily from `public/question-detail-shards/*.json` for the active question only.
- Mock mode still requests the full bank, which keeps the existing setup/exam flows intact.
- MathJax runtime loads only inside practice/mock shell code.
- The app uses one deferred GoatCounter loader instead of eager third-party tags in `index.html`.
- Bundle budget CI gate (`qa:validate-bundle-budget`) enforces chunk limits on every build.
- Landing network CI gate (`qa:validate-landing-network`) ensures the landing path stays lean.

## Known limitation reference

See `docs/KNOWN-LIMITATIONS.md` for the subtopic cap tradeoff and expected false negatives on genuine multi-subtopic questions.
