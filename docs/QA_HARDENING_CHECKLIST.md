# QA Hardening Checklist

Use this checklist for release hardening and periodic maintenance validation.

## Pillar 1: Data Integrity and Content Safety

### 1.1 Data integrity report

```bash
npm run qa:validate-data
```

Verify:

- [ ] report generated at `artifacts/review/data-integrity-report.json`
- [ ] no missing question UID records
- [ ] no idstrmissing-style orphan answers

### 1.2 MathJax and sanitizer

- [ ] inline and display math render correctly
- [ ] no raw TeX remains after settle
- [ ] no XSS payload execution with malicious test row

## Pillar 2: User State and Deep-Link Correctness

### 2.1 URL/deep-link

- [ ] filter query params round-trip on refresh
- [ ] back/forward keeps URL and UI synchronized
- [ ] `question` deep-link resolves when valid
- [ ] filter updates preserve `question` param

### 2.2 Progress import/export

- [ ] JSON export produces valid schema payload
- [ ] CSV export includes `questionUid,year,subject,subtopic,type,status`
- [ ] Import Merge combines current and imported values
- [ ] Import Replace overwrites current values
- [ ] successful import calls state refresh (counts update without reload)
- [ ] quota errors show user-facing failure message
- [ ] same file can be imported again (input reset path)

## Pillar 3: Performance and Build Health

### 3.1 Precompute + build

```bash
npm run build
```

Checks:

- [ ] precompute step runs successfully
- [ ] local `src/generated/subtopicLookup.json` exists in build workspace
- [ ] `dist/.nojekyll` exists
- [ ] `dist/calculator/calculator.html` exists

### 3.2 Lighthouse baseline

```bash
npm run lighthouse:mobile
```

Expected thresholds:

- [ ] performance >= 0.80 (warn)
- [ ] accessibility >= 0.95 (error)
- [ ] LCP <= 3500 ms (warn)
- [ ] CLS <= 0.1 (error)

## Pillar 4: Filter correctness and known tradeoffs

- [ ] subtopic filtering is parent-subject scoped
- [ ] deselecting subject removes orphan subtopics
- [ ] BUG-007 mitigation is active (`MAX_SUBTOPICS_PER_QUESTION = 1`)
- [ ] documented multi-subtopic false-negative limitation remains acknowledged

## Pillar 5: Automation and maintenance

- [ ] `node.js.yml` still builds/deploys
- [ ] `scraper.yml` still opens PR on question changes
- [ ] `scheduled-maintenance.yml` still deploys only when changes exist
- [ ] docs do not reference removed script `scripts/audit-canonical-filters.mjs`
- [ ] docs do not reference removed npm script `audit:canonical`

## Sign-off summary for release

Record:

- unit test result (should show 24 passing tests)
- build result
- integrity report path
- lighthouse summary
- unresolved risks/known limitations
