# Architecture

GateQA is a static React SPA hosted on GitHub Pages.
There is no backend, no database, and no server-side rendering.

## Runtime Topology

1. Static host serves `dist/`.
2. `src/index.jsx` mounts `App`.
3. `App` initializes services:
   - `QuestionService.init()`
   - `AnswerService.init()`
4. `FilterProvider` owns filter/progress state and filtering results.
5. UI renders filter modal, question card, answer panel, calculator, and footer modals.

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

- Cache key version:
  - `INIT_CACHE_VERSION = 'v2'`
  - runtime key `gateqa_init_cache_v2`
- `_readCache()` migrates by removing legacy `gateqa_init_cache_v1`.
- `_writeCache()` handles quota/storage errors via `isQuotaExceededError()`.

## Services

## `QuestionService`

Responsibilities:

- Candidate JSON selection with join-coverage scoring.
- Question normalization (`question_uid`, `exam_uid`, canonical subject/subtopic/type).
- Structured tag generation for filter UI.
- Init cache read/write and migration.

Performance constants:

- `MAX_SUBTOPICS_PER_QUESTION = 1`
- `INIT_CACHE_VERSION = 'v2'`

BUG-007 guardrail:

- Subtopic extraction is capped to first matched subtopic per question to prevent section-tag contamination.

## `AnswerService`

Answer resolution order:

1. by `question_uid`
2. by `answer_uid` (`v<volume>:<id_str>`)
3. by `exam_uid`
4. unsupported registry sentinel (`type: "UNSUPPORTED"`)

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
- `searchQuery` (reserved)

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
- Deselecting subjects removes orphaned subtopics.

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

## URL contract

Synchronized params:

- `question`
- `years`
- `subjects`
- `subtopics`
- `range`
- `types`
- `hideSolved`
- `showOnlySolved`
- `showOnlyBookmarked`

`question` is preserved during filter URL writes.

## UI component map

- `Header` (filter/calculator controls)
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
- `Footer` + policy/support modals

## Data persistence keys

- `gate_qa_solved_questions`
- `gate_qa_bookmarked_questions`
- `gate_qa_progress_metadata`
- `gateqa_progress_v1` (attempt metadata, used by AnswerPanel)

## Invariants

- `hideSolved` and `showOnlySolved` are mutually exclusive.
- `question` query param must not be dropped during filter sync.
- `clearFilters()` resets all filter dimensions.
- Build must include `.nojekyll` and synced calculator assets.
- `base` in `vite.config.js` must stay `/Gate_QA/` for current hosting path.

## Known limitation reference

See `docs/KNOWN-LIMITATIONS.md` for the subtopic cap tradeoff and expected false negatives on genuine multi-subtopic questions.
