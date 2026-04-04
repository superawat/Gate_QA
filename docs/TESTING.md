# Testing

GateQA uses JavaScript unit tests, QA scripts, and manual QA.

## 1) JavaScript unit tests (Vitest)

Current suites:

- `src/services/AnswerService.test.js` (12 tests)
- `src/services/QuestionService.test.js` (15 tests)
- `scripts/qa/repair-historical-exam-uids.test.js` (6 tests)
- `src/utils/localStorageState.test.js` (3 tests)
- `src/contexts/FilterContext.test.jsx` (2 tests)
- `src/contexts/MockTestContext.test.jsx` (1 test)
- `src/components/MockTest/MockSetupAndRouting.test.jsx` (16 tests)
- `src/components/MockTest/MockTestQuestion.test.jsx` (19 tests)
- `src/components/MockTest/MockTestActionBar.test.jsx` (3 tests)
- `src/components/MockTest/MockTestShell.test.jsx` (2 tests)
- `src/components/MockTest/QuestionPalette.test.jsx` (9 tests)

Current total: 88 passing tests.

Newly added in 2026-02-25 session:

- `extractCanonicalSubtopics` cap behavior test (QuestionService)
- orphan subtopic removal on subject deselect (FilterContext)

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

## 5) Build and artifact validation

Run:

```bash
npm run build
```

Verify:

- `dist/.nojekyll`
- `dist/calculator/calculator.html`
- `dist/questions-with-answers.json`
- `dist/data/answers/*.json`

## 6) Lighthouse regression check

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

## 7) Manual QA checklist

### Core flow

- [ ] app loads questions without retry state
- [ ] Next Question always picks from filtered pool
- [ ] no dev invariant error for currentQuestion outside filtered pool

### Filtering and BUG-007 behavior

- [ ] year/year-range/subject/subtopic/type filters intersect correctly
- [ ] `hideSolved` and `showOnlySolved` remain mutually exclusive
- [ ] subtopic selection auto-adds parent subject
- [ ] subject deselection removes orphan subtopics
- [ ] subtopic cap behavior is understood (single subtopic per question)

### URL and deep link

- [ ] URL writes expected query params
- [ ] reload preserves filters
- [ ] `?question=<uid>` opens expected question when valid
- [ ] share action copies usable question URL
- [ ] filter updates keep `question` param intact

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

## 8) Current gaps

- no browser E2E suite yet
- GoatCounter SPA hook is not mounted in `App.jsx`
- no dedicated accessibility snapshot tests beyond Lighthouse assertions
