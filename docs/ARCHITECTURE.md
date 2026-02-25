# Architecture

GateQA is a static React single-page application (SPA) hosted on GitHub Pages.
There is no backend, no API server, and no database. All runtime state is in browser memory and browser localStorage.

## Runtime Topology

1. Static host: GitHub Pages serves files from `dist/`.
2. App bootstrap: `src/index.jsx` mounts `<App />`.
3. Data load:
   - `QuestionService.init()` fetches questions JSON.
   - `AnswerService.init()` fetches answer indexes.
4. State layer: `FilterProvider` computes filtered pool, progress, URL sync.
5. UI layer: Header, filter modal, question card, answer panel, footer modals, calculator widget.

## Startup Sequence (Exact)

1. `App.jsx` calls `loadQuestions()` on mount.
2. `QuestionService.init()` attempts candidates in order:
   - `questions-with-answers.json`
   - `questions-filtered-with-ids.json`
   - `questions-filtered.json`
3. Each candidate is scored by native join coverage (`hasNativeJoinIdentity`).
4. Best candidate is normalized question-by-question via `normalizeQuestion()`.
5. `AnswerService.init()` loads:
   - `data/answers/answers_by_question_uid_v1.json`
   - `data/answers/answers_master_v1.json`
   - `data/answers/answers_by_exam_uid_v1.json`
   - `data/answers/unsupported_question_uids_v1.json`
6. `FilterProvider` initializes structured tags, reads URL params, reads localStorage progress, then computes filtered questions.
7. `GateQAContent` resolves deep-link `?question=<question_uid>` if present, otherwise picks a random filtered question.

## Canonical Question Model

`QuestionService.normalizeQuestion()` enriches each row with canonical fields used by filters and UI:

- `question_uid`: deterministic identity (`go:<id>` from GateOverflow link when possible, otherwise hash fallback).
- `exam_uid`: parsed from existing `exam_uid` or derived from link/title/year.
- `exam`: `{ paper, year, set, yearSetKey, label }`.
- `subject` and `subjectSlug`: canonical subject mapping.
- `subtopics`: canonical subtopics for selected subject.
- `type`: normalized token (`mcq`, `msq`, `nat`, or `unknown`).
- `canonical`: internal normalized summary object.

## Answer Resolution Strategy

`AnswerService.getAnswerForQuestion()` tries in strict order:

1. `question_uid` lookup (`answersByQuestionUid`)
2. `answer_uid` lookup (`v<volume>:<id_str>` in `answersByUid`)
3. `exam_uid` lookup (`answersByExamUid`)
4. Unsupported registry fallback (`type: "UNSUPPORTED"` sentinel)

If no match exists, it returns `null`.

## Filter State Model

`FilterContext` state:

- `selectedYearSets`: `YYYY-sN` keys
- `yearRange`: `[minYear, maxYear]`
- `selectedSubjects`: subject slugs
- `selectedSubtopics`: subtopic slugs
- `selectedTypes`: subset of `MCQ`, `MSQ`, `NAT`
- `hideSolved`: boolean
- `showOnlySolved`: boolean
- `showOnlyBookmarked`: boolean
- `searchQuery`: string (reserved, not currently used in filtering)

Progress state:

- Solved IDs and bookmarked IDs are stored as arrays of stable tracking IDs.
- Tracking key is resolved through `AnswerService.getStorageKeyForQuestion()`.
- Keys used by `FilterContext`:
  - `gate_qa_solved_questions`
  - `gate_qa_bookmarked_questions`
  - `gate_qa_progress_metadata`
- Legacy bookmark key migration is supported from `gateqa_bookmarks_v1`.

`AnswerPanel` also stores per-question attempt data in `gateqa_progress_v1`.

## URL Contract

Filters are synchronized to query params via `history.replaceState`.

- `question`: deep-link question UID (managed by `App.jsx`)
- `years`: comma-separated year-set keys (`2025-s2,2024-s0`)
- `subjects`: comma-separated subject slugs (`os,dbms`)
- `subtopics`: comma-separated subtopic slugs
- `range`: `min-max`
- `types`: lowercase list when not all selected (`mcq,nat`)
- `hideSolved=1`
- `showOnlySolved=1`
- `showOnlyBookmarked=1`

Important behavior: `FilterContext` intentionally preserves existing `question` param when writing filter params, so deep-link is not erased.

## Filtering Pipeline (Per Change)

For each question:

1. Resolve progress status (`solved`, `bookmarked`).
2. Resolve canonical type (prefer answer record type).
3. Apply progress toggles (`hideSolved`, `showOnlySolved`, `showOnlyBookmarked`).
4. Apply year-set include filter.
5. Apply year range filter.
6. Apply subject slug filter.
7. Apply subtopic slug filter.
8. Apply question type filter.

Result is stored in `filteredQuestions` and drives random selection and displayed counts.

## Key Invariants

- `hideSolved` and `showOnlySolved` are mutually exclusive.
- `clearFilters()` must reset all toggles and selections to default values.
- `vite.config.js` `base` must match Pages path (`/Gate_QA/`) or static fetch paths break.
- `dist/.nojekyll` must exist for Pages compatibility.
- Current question must stay inside `filteredQuestions` pool; dev mode logs an invariant error if violated.

## Observability and Debug Hooks

When a question is active, `App.jsx` exposes:

- `window.__gateqa_q`: active question object
- `window.__gateqa_lookup`: lookup diagnostics (identity, source URL, answer index counts)

## Performance and Safety

- Filtering is O(n) over full question list per committed state change.
- Solved/bookmarked sets are memoized for O(1) membership checks.
- Question HTML is sanitized with DOMPurify before render.
- Math rendering is handled by MathJax via `better-react-mathjax` context.

## Current Caveats

- The codebase contains several `dark:` Tailwind classes even though product direction is light-first.
- `src/hooks/useGoatCounterSPA.js` and `src/utils/goatCounterClient.js` exist but are not wired into `App.jsx` yet.
- `useGoatCounterSPA` depends on `react-router-dom`; the app currently does not use React Router.
