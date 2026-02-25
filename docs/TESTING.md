# Testing

This project uses a mix of JavaScript unit tests, Python pipeline tests, and manual QA.

## 1) JavaScript Unit Tests (Vitest)

Current tests:

- `src/services/QuestionService.test.js`
- `src/services/AnswerService.test.js`
- `src/utils/localStorageState.test.js`

Run:

```bash
npm run test:unit
npm run test:watch
```

Notes:

- Vite test environment is configured as `node` in `vite.config.js`.
- These tests validate core identity parsing, answer lookup fallback order, and localStorage utility behaviors.

## 2) Python Pipeline Tests (pytest)

Current tests:

- `tests/answers/test_parse_answer_key.py`
- `tests/answers/test_normalize_ocr_text.py`

Run from repo root:

```bash
python -m pytest tests/answers -q
```

Prereq:

```bash
pip install -r requirements.txt
```

## 3) Data Integrity Gate

Run:

```bash
npm run qa:validate-data
```

Output report:

- `artifacts/review/data-integrity-report.json`

Expected behavior in strict mode:

- Fails on UID gaps and `idstrmissing`-style orphan records.
- Coverage gaps in actionable missing answers currently produce warning logs.

For non-blocking report generation:

```bash
node scripts/qa/validate-data.js --no-strict
```

## 4) Build and Artifact Validation

Run:

```bash
npm run build
```

Verify:

- `dist/.nojekyll`
- `dist/calculator/calculator.html`
- `dist/questions-with-answers.json`
- `dist/data/answers/*.json`

## 5) Lighthouse Regression Check

Run:

```bash
npm run build
npm run lighthouse:mobile
```

Current assertions from `lighthouserc.json`:

- performance >= 0.80 (warn)
- accessibility >= 0.95 (error)
- LCP <= 3500 ms (warn)
- CLS <= 0.1 (error)

## 6) Manual QA Checklist

### Core App Flow

- [ ] App loads questions without retry state.
- [ ] "Next Question" always picks from filtered pool.
- [ ] No console invariant error about `currentQuestion` outside pool.

### Filtering

- [ ] Year-set checkboxes filter correctly.
- [ ] Year range slider filters correctly.
- [ ] Subject and subtopic filters intersect correctly.
- [ ] Type buttons (MCQ/MSQ/NAT) apply correctly.
- [ ] `hideSolved` and `showOnlySolved` stay mutually exclusive.
- [ ] `showOnlyBookmarked` can combine with solved toggles.
- [ ] `Reset` and `Clear all` restore default filters.

### URL and Deep Link

- [ ] Filter state writes to URL using expected params.
- [ ] Reload preserves active filters.
- [ ] `?question=<uid>` opens the expected question when valid.
- [ ] Share action copies usable deep-link URL.
- [ ] Filter updates keep `question` param intact.

### Progress and Persistence

- [ ] Solved and bookmarked status persist across reload.
- [ ] Legacy bookmark migration path does not error.
- [ ] Storage-unavailable warning appears when storage fails.
- [ ] Progress bar reflects total solved over total corpus.

### Answer Interaction

- [ ] MCQ submission validates single selection.
- [ ] MSQ submission validates set equality.
- [ ] NAT submission honors tolerance and invalid input handling.
- [ ] Unsupported questions show non-interactive status block.

### Calculator

- [ ] Header button toggles calculator.
- [ ] `Ctrl+K` toggles calculator.
- [ ] `Escape` closes calculator.
- [ ] Desktop drag is smooth and does not get stuck over iframe.
- [ ] Mobile calculator opens full-screen and closes reliably.

### Footer Modals

- [ ] Data policy modal opens/closes with backdrop and close button.
- [ ] Support modal opens/closes and mail link is clickable.

## 7) Current Gaps

- No browser E2E automation (Playwright/Cypress not configured).
- GoatCounter SPA hook is not currently mounted, so route-change tracking tests do not apply.
- No dedicated accessibility snapshot tests beyond Lighthouse assertions.
