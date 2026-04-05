# Testing

GateQA uses JavaScript unit tests, QA scripts, and manual QA.

## 1) JavaScript unit tests (Vitest)

Current suites:

- `src/services/AnswerService.test.js`
- `src/services/QuestionService.test.js`
- `scripts/qa/repair-historical-exam-uids.test.js`
- `scripts/pipeline/shared.test.js`
- `src/utils/localStorageState.test.js`
- `src/contexts/FilterContext.test.jsx`
- `src/contexts/MockTestContext.test.jsx`
- `src/components/MockTest/MockSetupAndRouting.test.jsx`
- `src/components/MockTest/MockTestQuestion.test.jsx`
- `src/components/MockTest/MockTestActionBar.test.jsx`
- `src/components/MockTest/MockTestShell.test.jsx`
- `src/components/MockTest/QuestionPalette.test.jsx`
- `src/App.test.jsx`
- `src/contexts/SessionContext.test.jsx`
- `src/components/Landing/ModeSelectionPage.test.jsx`

Run the suite to get the current exact total; avoid hardcoding this number in other docs.

Newly added in 2026-02-25 session:

- `extractCanonicalSubtopics` cap behavior test (QuestionService)
- orphan subtopic removal on subject deselect (FilterContext)

Search/filter routing regressions now covered in:

- `src/contexts/FilterContext.test.jsx`
  - URL hydration from `?search=...`
  - normalized AND-token search filtering
  - search URL sync preserving `question`
  - removing the search chip and clearing search state
- `src/App.test.jsx`
  - landing bypass / direct practice boot when `search` is present

Run:

```bash
npm run test:unit
npm run test:watch
```

Important precondition:

- if `src/generated/subtopicLookup.json` is missing in a fresh workspace, run `npm run precompute` before unit tests

## 2) Python pipeline tests (removed)

The Python answer pipeline scripts and their tests (`tests/answers/`) were removed in the
CLEANUP-001 post-FEAT-003 cleanup. The Node.js pipeline (`scripts/pipeline/`) replaces them.
See `docs/DATA_PIPELINE.md` for the current pipeline documentation.

## 3) Data integrity gate

Run:

```bash
npm run qa:validate-data
```

Report output:

- `artifacts/review/data-integrity-report.json`

Strict-mode behavior:

- fails on missing question UID coverage
- fails on idstrmissing-style orphan rows
- actionable missing-answer coverage gaps are warning-level in current implementation

## 4) Historical paper-count QA

Run:

```bash
npm run qa:audit-historical-papers
npm run qa:repair-historical-paper-counts
npm run qa:import-missing-paper -- --year <YYYY> --set <N> --tag gatecse-YYYY-setN
npm run qa:audit-historical-papers
npm run qa:audit-pre-2010-gateoverflow
npm run qa:repair-pre-2010-questions
npm run qa:audit-pre-2010-gateoverflow
```

Artifacts:

- `artifacts/review/historical-paper-audit.json`
- `artifacts/review/historical-paper-count-repair-report.json`
- `artifacts/review/missing-paper-import-report.json`
- `artifacts/review/pre-2010-gateoverflow-audit.json`
- `artifacts/review/pre-2010-question-repair-report.json`

What this flow checks:

- every audited historical paper resolves to the expected 65-question paper size
- missing post-2010 year/set papers can be backfilled directly from live GateOverflow tags when the audit shows an entire set is absent
- duplicate historical variants are collapsed at source-data level
- malformed historical `exam_uid` values are normalized before slot matching
- non-paper GateOverflow rows are excluded from historical year counts
- pre-2010 year totals are checked separately against live GateOverflow year tags using deduped question labels, because those older papers do not follow the 65-question pattern
- pre-2010 repair removes off-tag legacy discussion rows, collapses duplicate question-label variants, and backfills missing legacy questions directly from live GateOverflow pages

## 5) Public parity gate

Run:

```bash
npm run qa:validate-public-parity
```

What this checks:

- public question payload counts match each other
- generated manifest and generated docs snapshot agree with the public bank
- pipeline state and latest validation totals do not silently drift away from the published bank
- build-published detail/index artifacts stay aligned with the canonical public bank

This gate now runs in CI before deploy.

## 6) Build and artifact validation

Run:

```bash
npm run build
```

Verify:

- `dist/.nojekyll`
- `dist/calculator/calculator.html`
- `dist/question-bank-manifest.json`
- `dist/question-search-index.json`
- `dist/question-detail-shards/*.json`
- `dist/questions-with-answers.json`
- `dist/data/answers/*.json`

## 7) Lighthouse regression check

Run:

```bash
npm run build
npm run lighthouse:mobile
```

Assertions from `lighthouserc.json`:

- performance >= 0.80 (warn)
- accessibility >= 0.95 (error)
- LCP <= 3500 ms (warn)
- CLS <= 0.1 (error)

## 8) Manual QA checklist

### Core flow

- [ ] app loads questions without retry state
- [ ] landing does not eagerly fetch the full question bank before practice entry
- [ ] practice entry fetches the lightweight search index before any per-question detail shard
- [ ] opening a practice question fetches only its matching `question-detail-shards/<year-set>.json` shard
- [ ] Next Question always picks from filtered pool
- [ ] no dev invariant error for currentQuestion outside filtered pool

### Filtering and BUG-007 behavior

- [ ] year/year-range/subject/subtopic/type filters intersect correctly
- [ ] search intersects with year/year-range/subject/subtopic/type filters
- [ ] multi-word search requires all words to match `question.searchText`
- [ ] `hideSolved` and `showOnlySolved` remain mutually exclusive
- [ ] subtopic selection auto-adds parent subject
- [ ] subject deselection removes orphan subtopics
- [ ] subtopic cap behavior is understood (single subtopic per question)

### URL and deep link

- [ ] URL writes expected query params
- [ ] reload preserves filters
- [ ] `?search=<query>` bypasses landing and opens practice directly
- [ ] `?question=<uid>` opens expected question when valid
- [ ] share action copies usable question URL
- [ ] filter updates keep `question` param intact, including while `search` changes
- [ ] removing the search chip or Reset clears `search` from the URL

### Progress import/export

- [ ] Export JSON downloads valid payload
- [ ] Export CSV includes expected columns
- [ ] Import Merge combines existing+incoming
- [ ] Import Replace overwrites existing
- [ ] successful import refreshes sidebar counts immediately
- [ ] quota/storage error path shows user feedback
- [ ] re-importing same file works (input reset path)

### Calculator and footer modals

- [ ] calculator toggles by button and `Ctrl+K`
- [ ] `Escape` closes calculator
- [ ] desktop drag remains smooth over iframe
- [ ] Data Policy modal includes backup/transfer instructions

## 9) Current gaps

- no browser E2E suite yet
- no automated bundle-budget or network assertion yet for manifest/index/detail-shard fetch boundaries
- no dedicated accessibility snapshot tests beyond Lighthouse assertions
