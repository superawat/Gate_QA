# Testing

GateQA uses JavaScript unit tests, Python pipeline tests, and manual QA.

## 1) JavaScript unit tests (Vitest)

Current suites:

- `src/services/AnswerService.test.js` (12 tests)
- `src/services/QuestionService.test.js` (8 tests)
- `src/utils/localStorageState.test.js` (3 tests)
- `src/contexts/FilterContext.test.jsx` (1 test)

Current total: 24 passing tests.

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

## 2) Python pipeline tests

Suites:

- `tests/answers/test_parse_answer_key.py`
- `tests/answers/test_normalize_ocr_text.py`

Run:

```bash
python -m pytest tests/answers -q
```

Prereq:

```bash
pip install -r requirements.txt
```

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

## 4) Build and artifact validation

Run:

```bash
npm run build
```

Verify:

- `dist/.nojekyll`
- `dist/calculator/calculator.html`
- `dist/questions-with-answers.json`
- `dist/data/answers/*.json`

## 5) Lighthouse regression check

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

## 6) Manual QA checklist

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

## 7) Current gaps

- no browser E2E suite yet
- GoatCounter SPA hook is not mounted in `App.jsx`
- no dedicated accessibility snapshot tests beyond Lighthouse assertions
