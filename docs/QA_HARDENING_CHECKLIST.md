# QA Hardening Checklist

Use this checklist for release hardening and periodic maintenance validation.

## Pillar 1: Data Integrity and Content Safety

### 1.1 Run Data Integrity Report

```bash
npm run qa:validate-data
```

Verify:

- [ ] `artifacts/review/data-integrity-report.json` is generated.
- [ ] `questions_without_uid` is empty.
- [ ] `idstrmissing_orphans` is empty.
- [ ] Review `questions_missing_answer_actionable` list and confirm known gaps.

If you only need non-blocking reporting:

```bash
node scripts/qa/validate-data.js --no-strict
```

### 1.2 MathJax Rendering

- [ ] Test at least 20 mixed questions with inline (`$...$`) and display math.
- [ ] Confirm no raw TeX remains after render settle.
- [ ] Confirm display equations do not clip on narrow mobile width.

### 1.3 DOMPurify Sanitization

Inject a temporary malicious sample in local JSON and verify sanitization:

Payload examples:

- `<img src=x onerror=alert(1)>`
- `<script>alert(1)</script>`
- `<a href="javascript:alert(1)">x</a>`

Checks:

- [ ] No script execution.
- [ ] Dangerous tags/attributes removed.
- [ ] No sanitizer runtime errors in console.

## Pillar 2: User State and Deep-Link Correctness

### 2.1 URL State Round-trip

Use URLs like:

- `?subjects=os&showOnlyBookmarked=1`
- `?question=go:399311&years=2023-s0`
- `?types=mcq,msq&range=2018-2024&hideSolved=1`

Checks:

- [ ] Hard refresh preserves state.
- [ ] Back/forward keeps UI and URL synchronized.
- [ ] `question` deep-link resolves when valid.
- [ ] Invalid `question` gracefully falls back to random filtered question.
- [ ] Filter updates do not erase existing `question` param.

### 2.2 localStorage Behavior

- [ ] Solved/bookmarked status persists after reload.
- [ ] Legacy bookmark migration path works (`gateqa_bookmarks_v1` to canonical key).
- [ ] Storage unavailable state shows warning without crashing.

Quota simulation (DevTools console):

- monkey-patch `localStorage.setItem` to throw `QuotaExceededError`
- toggle solved/bookmark

Expected:

- [ ] UI continues functioning.
- [ ] Persistence warning appears.

## Pillar 3: Performance and Build Health

### 3.1 Production Build

```bash
npm run build
```

Checks:

- [ ] `dist/.nojekyll` exists.
- [ ] `dist/calculator/calculator.html` exists.
- [ ] answer JSON files exist in `dist/data/answers/`.

### 3.2 Lighthouse Mobile Baseline

```bash
npm run lighthouse:mobile
```

Expected thresholds from config:

- [ ] performance >= 0.80 (warn threshold)
- [ ] accessibility >= 0.95 (error threshold)
- [ ] LCP <= 3500 ms (warn threshold)
- [ ] CLS <= 0.1 (error threshold)

## Pillar 4: Core UX Stability

### 4.1 Filter Integrity

- [ ] Year, year-range, subject, subtopic, and type filters intersect correctly.
- [ ] `hideSolved` and `showOnlySolved` remain mutually exclusive.
- [ ] `showOnlyBookmarked` composes correctly with solved toggles.
- [ ] `Reset` and `Clear all` return exact default filter state.

### 4.2 Action Bar and Evaluation

- [ ] MCQ/MSQ/NAT inputs validate correctly.
- [ ] Unsupported questions show non-interactive status block.
- [ ] Share button copies deep-link URL with `question` param.
- [ ] Solved and bookmark buttons toggle state consistently.

### 4.3 Calculator Reliability

- [ ] Button open/close works.
- [ ] `Ctrl+K` toggles widget.
- [ ] `Escape` closes widget.
- [ ] Desktop drag remains smooth over iframe.
- [ ] Mobile mode renders as full-screen panel.

## Pillar 5: Automation and Maintenance

### 5.1 Workflow Health

- [ ] `node.js.yml` build and deploy passes on `main`.
- [ ] `scraper.yml` can still open PR when question data changes.
- [ ] `scheduled-maintenance.yml` runs cleanly and deploys only when data changed.

### 5.2 Script Contract Drift

- [ ] `package.json` scripts still match docs.
- [ ] Paths in docs match actual files.
- [ ] No stale command names (`npm run dev` is not defined in this project).

## Sign-off Summary (per release)

Record and attach:

- Build result
- Unit test result
- Data integrity report path
- Lighthouse output summary
- Manual QA highlights and unresolved risks
