# Architecture

GateQA is a static, local-first React SPA hosted on GitHub Pages with an optional, decentralized Supabase backend for user authentication and cross-device cloud sync.

## Runtime Topology

1. Static host serves `dist/`.
2. `src/index.jsx` repairs legacy progress ID storage before mounting `App`, then registers the production service worker.
3. `AuthProvider` initializes the Supabase client (`src/services/supabase.js`) and listens for OAuth state changes (`onAuthStateChange`).
   - If Supabase environment variables are missing, the app operates seamlessly in permanent Guest Mode.
4. `App` initializes the lightweight landing manifest on mount:
   - `QuestionBankManifestService.init()`
5. `FilterProvider` seeds summary state from the manifest and owns filter/progress state.
6. `App` resolves `appView` (`landing | practice | mockSetup | mockExam`) directly from URL params.
7. `QuestionService.init()` and `AnswerService.init()` run only when practice or mock entry needs question data:
   - practice loads the lightweight search index plus answer lookups
   - mock still loads the full question bank
8. UI renders one of:
   - Landing mode selector dashboard (with dynamic sync-refreshed streak and activity heatmap)
   - Practice view (filter modal, chips, question card, answer panel)
   - Mock setup shell
   - Mock exam shell
9. Header, calculator, and footer remain shared shell components.

## User Authentication & Cloud Sync Architecture (FEAT-032)

The auth announcement manager provides a non-blocking first-visit sign-in
experiment. Guests see the optional backup message once per browser, while the
post-sign-in confirmation appears only after the authenticated cloud sync
completes successfully and is shown only once per browser. Guest mode remains
fully available when Supabase is unconfigured.
The same manager also presents the GATE DA question-bank announcement once per
browser, using a localStorage dismissal key and an optimized static banner.

GateQA follows a **Local-First Hybrid Architecture**:

```text
[ Browser LocalStorage ] (Primary, zero-latency source of truth)
        │ ▲
        │ │ Pre-Merge Snapshot (gate_qa_backup_<timestamp>)
        ▼ │
[ CloudSyncManager (Union-Merge) ] ◄──► [ Offline Sync Queue (syncQueue.js) ]
        │ ▲
        │ │ HTTPS (Additive Upsert)
        ▼ │
[ Supabase PostgreSQL + RLS ] (Secondary backup & cross-device sync)
```

1. **Zero Data Loss Invariant:**
   - Local device data is never deleted or overwritten during sync.
   - An automatic pre-merge JSON snapshot is stored in `localStorage` before any cloud sync starts.
2. **Additive-Only Union-Merge Algorithm:**
   - **Bookmarks:** Deduplicated set union (`Set.union(local, cloud)`).
   - **Personal Notes:** Longest Note Wins policy (preserves student effort; falls back to newer timestamp).
   - **Solved Questions:** Deduplicated union of canonical string IDs; legacy attempt maps and numeric-index corruption are recovered.
   - **Aptitude Progress IDs:** Solved and bookmarked IDs sync through dedicated JSONB array columns (`aptitude_solved`, `aptitude_bookmarks`).
   - **Mock Test History:** Deduplicated chronologically by `testId`.
   - **Streak & Daily Heatmap:** Synced via `progress_records` JSON array.
3. **Offline Resilience:**
   - All mutations while offline are queued in `localStorage` (`gate_qa_sync_queue`) with exponential backoff retry and automatic reconnect flushing.
4. **Database Security (Least Privilege):**
   - RLS enabled on `profiles`, `user_progress`, and `sync_log`.
   - All access restricted to authenticated owners (`auth.uid() = user_id`).
   - Automated PostgreSQL trigger `handle_new_auth_user()` provisions `public.profiles` automatically upon Google OAuth sign-up.

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

- `index.html` no longer includes Google Fonts or MathJax tags (Google Analytics gtag.js is included but loaded asynchronously)
- `App.jsx` lazy-loads practice and mock shells only when the user enters them
- `src/components/Math/MathRuntime.jsx` imports MathJax only inside practice/mock runtime
- `src/utils/analytics.js` defers the single remaining analytics provider until first interaction or idle

## Pre-rendering and SEO Alias Routes

- Script: `scripts/prerender-seo-pages.mjs`
- Outputs: 528 pre-rendered static HTML files in `dist/` (covering subjects, years, high-value questions, and 5 short-form alias routes: `/gate-cs-pyq`, `/gate-aptitude`, `/mock-tests`, `/operating-systems-pyq`, and `/dbms-pyq`).
- Pre-rendering generates SEO-optimized HTML copies with JSON-LD schema markups and crawler-readable contents while seamlessly preserving client-side React SPA routing on execution.

## LLM-Assisted Question Explanation Subsystem (AUG-014)

GateQA provides an external assistance layer allowing students in Practice mode (`/practice/question/:id`) to send questions to their preferred external LLM (ChatGPT, Gemini, Claude, DeepSeek, Perplexity) for conceptual, step-by-step deconstruction with zero backend/API cost.

```text
[ Current Question ]
        │
        ▼
[ Prompt Builder (llmPromptBuilder.ts) ] ──► Pedagogical Template + Clean LaTeX/HTML + Options
        │
        ▼
[ LLM Redirect Service (llmRedirectService.ts) ]
   ├── Prefill URL (ChatGPT ?q=..., Perplexity ?q=...)
   └── Clipboard Fallback (Gemini, Claude, DeepSeek) + Web App Launch
        │
        ▼
[ User's Preferred External LLM ]
```

1. **Strict Privacy Invariant**: Only sanitized question text, options, and structured instructions are sent. No user IDs, emails, progress, bookmarks, notes, or auth tokens are ever transmitted.
2. **Local-First & Multi-Provider Preference**: Preferred provider is stored in `localStorage` (`gateqa_llm_preference`, defaults to `chatgpt`). Managed via `useLLMPreference()` hook with reactive custom event dispatching (`gateqa:llm-preference-changed`).
3. **Universal Clipboard Fallback**: Automatically copies the prompt to the clipboard before opening external providers, preventing data loss on long URLs or web apps without query injection.
4. **Practice Mode Exclusivity**: Available in `AnswerPanel.jsx` (desktop toolbar and mobile 2x2 touch grid); excluded from Mock Test mode to preserve CBT exam integrity.


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
- `public/images/aptitude/*`
- `docs/generated/data-status.json`
- `docs/generated/DATA_STATUS.md`
- `artifacts/review/*` local QA reports, ignored by Git

Purpose:

- give the landing page a lightweight manifest contract
- provide a lightweight search/filter index separate from full question HTML
- serve full question HTML in year/set detail shards that are fetched only for active practice questions
- localize GateOverflow blob images into first-party static assets before publish
- localize public aptitude images into first-party static assets before publish
- publish one generated count/status snapshot for docs
- keep remote-image debt visible and enforce the zero-remote-image target

*(Note: Aptitude data shards and index are generated by the `scripts/aptitude-pipeline/build_aptitude_db.py` script. Review reports remain local under `artifacts/review/` and are intentionally not committed.)*

For a comprehensive guide on the hybrid HTML + LaTeX JSON question schema, MathJax rendering engine, and authoring guidelines, see [`QUESTION_FORMAT_AND_LATEX_RENDERING.md`](file:///c:/Users/himanshu/Desktop/GATE_QA/docs/QUESTION_FORMAT_AND_LATEX_RENDERING.md).

These artifacts are generated before dev/build via the npm scripts in `package.json`.

## Services

## `QuestionService`

`QuestionService.ts` is now a thin static facade over three focused modules:

- `src/services/question-service/SubjectTaxonomy.ts`
- `src/services/question-service/QuestionNormalizer.ts`
- `src/services/question-service/QuestionLoader.ts`

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

`AptitudeQuestionService.ts` manages the standalone Aptitude bank (currently 16,873 questions across English, Quant, and Reasoning).

Responsibilities:
- Handles loading of `public/aptitude-search-index.json`.
- Lazily fetches question detail shards via `ensureQuestionDetail()` from `public/data/aptitude/{subject}/{subtopic}.json`.
- Ensures zero interference with GATE progress by utilizing separate localStorage keys (`gateqa-apt-solved-questions`, `gateqa-apt-bookmarked-questions`).

Performance:
- 60 subject/subtopic shards prevent sending a massive monolithic aptitude payload to the client.
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

When the optional GATE DA track is enabled, `structuredTags.yearSets` contains
the CSE year/set options plus matching DA options. Every option has a
track-aware internal identity (`cse:2026:set-1` or `da:2026:set-1`) and carries
its track for the compact visual `DA` badge in the Years filter. Legacy CSE
URL tokens such as `2026-s1` hydrate to the CSE identity; DA URLs use the
explicit track-aware token. Question classification is always derived from
the question's own metadata, never from the active filter state or a shared
year/set label.

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

## Session Queue & Practice Modes (FEAT-012, Updated 2026-08-20)

Practice sessions operate in one of two distinct modes:

1. **Ordered Filtered Queue (`mode: "ordered"`)**:
   - Initiated when navigating from Explore Questions with active filters (`handleStartFilteredPractice`, `handleOpenQuestion`) or opening a question with explore search parameters (`hasExploreContext`).
   - The queue contains exactly the filtered subset of questions in fixed order.
   - Header badge displays `CURRENT FILTERED QUEUE` and `Question X of Y` (e.g. `Question 1 of 58`).
   - Previous and Next buttons navigate strictly within the filtered queue without falling back to the global question bank.
   - Preserves explore query parameters (`?subjects=...`) across all question transitions.

2. **Random / Standalone Session (`mode: "random"`)**:
   - Initiated when starting random practice from the Home page CTA (`handleStartRandomPractice`) or opening a standalone direct question URL without search parameters.
   - Header badge displays `RANDOM SESSION` and `Question details`.
   - Uses stratified multi-bucket shuffle with topic memory to guarantee subject and subtopic diversity.

### State (`SessionContext`)

- `sessionMode: "ordered" | "random" | null` — active session mode.
- `sessionQueue: uid[]` — active question walk array.
- `sourceQuestionUids: uid[]` — canonical pool of UIDs backing the current session.
- `currentIndex: number` — zero-indexed pointer into `sessionQueue`.
- `seenThisSession: Set<uid>` — ephemeral in-memory set (React ref), cleared on page reload and filter change. Never persisted to localStorage.
- `showExhaustionBanner: boolean` — true when the user exhausts the random shuffle queue.

### Navigation State Contract (`getNavigationState`)

```typescript
interface NavigationState {
  mode: "ordered" | "random" | null;
  index: number;
  total: number;
  currentIndex?: number;
  totalInQueue?: number;
  previousUid: string | null;
  nextUid: string | null;
  canGoPrevious: boolean;
  canGoNext: boolean;
}
```

### Bucket Priority Order (Random Sessions)

In random sessions, the queue is built using stratified topic memory and priority-weighted buckets:

1. **Bucket 1 (front):** UIDs not in `seenThisSession` AND not in `solvedQuestionIds` — never seen, unsolved.
2. **Bucket 2 (middle):** UIDs not in `seenThisSession` AND in `solvedQuestionIds` — never seen this session, already solved.
3. **Bucket 3 (back):** UIDs in `seenThisSession` — already seen this session.

Each bucket is stratified and diversified across subjects and subtopics. Final random queue = Bucket 1 + Bucket 2 + Bucket 3.

### Queue Lifecycle

- **Filter Change in Explore:** resets filtered question pool; starting practice passes `filteredQuestions` to `startOrderedSession`.
- **Explore to Solve Navigation:** `SolvePage.jsx` inspects `hasExploreContext` (`location.search`). If search parameters exist, it synchronizes with the filtered question set in ordered mode.
- **Direct Link (No Search Params):** `SolvePage.jsx` boots a standalone random session displaying `RANDOM SESSION → Question details`.
- **Next / Previous Navigation:** increments/decrements `currentIndex`, preserves search parameters in the URL, and updates queue position badges.
- **End of Filtered Queue:** `canGoNext` is false on the last question; queue boundaries are strictly respected.
- **End of Random Queue:** triggers exhaustion banner and reshuffles fresh randomized pool with topic rotation.

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

### 5. Custom Builder Customization (2026-07-16)

The Custom Mock Test Builder has been enhanced to support granular configuration parameters stored in `setupState`:
- **Solved Questions Policy (`solvedFilter`)**: Enforces how solved questions are selected for a custom mock test pool:
  - `"unsolved"` (default): Excludes questions the user has already solved.
  - `"all"`: Includes both solved and unsolved questions.
  - `"solved_only"`: Excludes unsolved questions, focusing the mock test pool entirely on revision of previously solved questions.
- **Custom practice duration (`customDurationMode` & `customDurationMinutes`)**: Allows manual override of the default adaptive duration calculation:
  - `"adaptive"` (default): The exam duration dynamically scales based on the available questions in the filtered pool.
  - `"manual"`: Enforces a manual duration specified by `customDurationMinutes` (integer clamped between 5 and 180).

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
- `gateqa-apt-solved-questions`
- `gateqa-apt-bookmarked-questions`
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
- `base` in `vite.config.js` is `/` for custom domain hosting at `gateqa.in`.

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
| `vendor-ui` | 41.04 kB | 15.40 kB | react-icons, rc-slider |
| `vendor-animation` | - | - | isolated chunk for `framer-motion` |
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

## Performance Insights & Multi-Branch Analytics Engine (FEAT-033)

The Performance Insights engine (`/insights`) analyzes practice attempts, mock exam sessions, review queues (spaced repetition), weak subtopics, and exam history.

```text
[ Global Progress Store (gateqa_progress_v1, gateqa_da_progress_v1) ]
                        │
                        ▼
      [ weakTopicAnalyzer.js (0ms Memoized Cache) ]
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
[ Track Scoping Engine (Option C) ]  [ Unified Study Momentum ]
  • GATE CS: 10 Core CSE + GA          • Daily Streak & Heatmap
  • GATE DA: 7 Core DA + GA            • Earned XP & Level
  • Combined: Full Practice Pool       • Active Practice Days
```

1. **Multi-Branch Architecture (Option C — Unified Effort + Track-Scoped Analytics):**
   - **Unified Momentum:** Daily learning streak, XP, active days, and streak freezes remain global and uninterrupted across both CSE and DA practice.
   - **Track-Scoped Metrics:** Subject completion %, skill radar axes, focus areas (weak subtopics), mistakes, and review queues dynamically partition based on the active branch selector (`cs`, `da`, `all`).
   - **Strict Prefix Disambiguation:** DA questions and subjects are isolated via `da:` / `da-` prefixes, preserving CSE Engineering Mathematics subtopics (`engg-math:linear-algebra`, `engg-math:calculus`) without keyword collision.
2. **0ms In-Memory Memoization:**
   - `weakTopicAnalyzer.js` reuses in-memory questions passed from `FilterContext.allQuestions`, eliminating redundant network requests for search indexes.
   - Insights results are memoized in memory keyed by progress state and solved counts.
3. **Mathematical Precision:**
   - **Semantic Disambiguation:** Top overview cards cleanly separate unique questions attempted (`questions tried`) from total submission attempts (`of N submissions`).
   - **Weighted Overall Accuracy:** Computed as `totalCorrectAttempts / totalAttemptedCount` rather than unweighted arithmetic means across subjects.
4. **Mock History Integration:**
   - Section-wise score charts dynamically support both CSE (`CS` + `GA`) and DA (`DA` + `GA`) section scoring under generalized `coreScore` tracking.

## Mock Test Subsystem & Exam Runtime Engine (FEAT-034)

The Mock Test subsystem (`/mock`) provides authentic simulation of the GATE computer-based test portal while maintaining local-first data integrity.

```text
[ MockTestProvider (Global Exam State) ]
            │
            ├─► [ MockTimerContext ] ──► [ MockTimerDisplay (1s isolated ticks) ]
            │
            ├─► [ MockTestQuestion ] ──► [ useMemo sanitized HTML & LaTeX ]
            │
            ├─► [ QuestionPalette ] ──► [ 5-State Status Indicators ]
            │
            └─► [ MockTestResults ] ──► [ Diagnostic + "Practice Missed" Action ]
```

1. **1:1 TCS iON GATE Portal Replica Invariant:**
   - The visual layout, color palette, 5-state question tiles (Not Visited, Not Answered, Answered, Marked, Answered & Marked), candidate panel, action buttons, and **minimum 1024px desktop resolution requirement** are strictly preserved and frozen.
2. **Timer Context Decoupling:**
   - `MockTimerContext` isolates 1-second interval countdown ticks to the `MockTimerDisplay` component, preventing 60 FPS re-render cascades across MathJax equations, question stems, and the palette during active exams.
3. **Local-First Attempt State & Zero Data Loss:**
   - In-progress active exam attempts are backed up in `sessionStorage` and exported/imported via `workspaceFile.js` JSON backups.
   - Upon exam submission, all attempted questions automatically log practice records into `gateqa_progress_v1` and `gateqa_aptitude_progress_v1`.
4. **History Retention & Post-Exam Drills:**
   - Retains up to 50 attempts in `gateqa_mock_history_v1` (FIFO).
   - Direct `"Practice Missed Questions"` integration links incorrect/unanswered questions straight to Practice Mode.

## Known limitation reference

See `docs/KNOWN-LIMITATIONS.md` for the subtopic cap tradeoff and expected false negatives on genuine multi-subtopic questions.
