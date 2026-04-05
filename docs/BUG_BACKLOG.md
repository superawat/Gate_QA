# Bug Backlog

This file tracks open bugs, suspected regressions, and recently closed audit issues for GateQA.

## How To Use

- Add only bugs with a clear symptom or a strong code/data signal.
- Mark each entry as `Observed` or `Inferred`.
- Keep reproduction steps short and concrete.
- When fixed, move the final user-facing note into `CHANGELOG.md`.

## Current Status

- Unit test suite is currently green; run `npm run test:unit` for the exact total.
- Historical paper audit is currently clean: `paper_count: 27`, `questions_without_paper_meta: 0`
- The bugs below come from repo inspection and audit artifacts, not from failing unit tests

## Open Bugs

- None currently tracked.

## Recently Closed

### BUG-022: Loading states used inconsistent visuals across the app

- Status: Fixed on 2026-04-05
- Severity: Medium
- Source: Observed from UI loading paths
- Where:
  `src/App.jsx`
  `src/components/Landing/ModeSelectionPage.jsx`
  `src/components/Calculator/CalculatorWidget.jsx`
  `src/shells/PracticeShell.jsx`
- Resolution:
  introduced one shared loading-state wrapper around the existing horizontal bar animation and reused it for shell fallback, landing manifest loading, practice loading, question-detail loading, and calculator loading.
- Current state:
  loading paths now use the same animated loader instead of mixing text-only and ad hoc loading treatments

### BUG-020: Public bank counts disagree across artifacts and docs

- Status: Fixed on 2026-04-05
- Severity: High
- Source: Observed from generated artifacts
- Where:
  `public/question-bank-manifest.json`
  `docs/generated/data-status.json`
  `pipeline-state.json`
  `audit/validation-report-2026.json`
  `docs/DATA_PIPELINE.md`
  `.github/workflows/node.js.yml`
  `.github/workflows/gate-question-pipeline.yml`
- Resolution:
  pipeline state and validation output now publish the current public-bank count, the generated docs snapshot reads those published-count fields, and `npm run qa:validate-public-parity` is enforced in CI.
- Current state:
  public payloads, manifest, generated docs snapshot, pipeline state, validation report, and data-integrity report now agree on the published bank count

### BUG-021: Practice startup depended on the full question bank payload

- Status: Fixed on 2026-04-05
- Severity: High
- Source: Observed from code path and network plan
- Where:
  `scripts/build-public-artifacts.mjs`
  `src/services/QuestionService.js`
  `src/App.jsx`
  `src/shells/PracticeShell.jsx`
- Resolution:
  practice now boots from `question-search-index.json`, caches index/full-bank data separately, and loads question HTML from `question-detail-shards/*.json` only for the active practice question.
- Current state:
  cold landing still avoids the bank entirely, practice no longer needs `questions-with-answers.json` on entry, and mock remains the only full-bank path

### BUG-019: Landing cold start eagerly loads the full runtime

- Status: Fixed on 2026-04-05
- Severity: High
- Source: Observed from code path and Lighthouse
- Where:
  `src/App.jsx`
  `src/components/Math/MathRuntime.jsx`
  `src/utils/analytics.js`
  `index.html`
- Resolution:
  landing now boots from a clean static HTML shell, practice/mock shells are lazy-loaded from `App.jsx`, MathJax is imported only inside practice/mock runtime, and the remaining analytics provider is deferred.
- Current state:
  the cold landing path no longer initializes the question bank, MathJax, or eager third-party tags before the user enters practice

### BUG-018: URL history behavior and docs are out of sync

- Status: Fixed on 2026-04-04
- Severity: Low
- Source: Observed from docs vs implementation
- Where:
  `src/App.jsx`
  `docs/ARCHITECTURE.md`
  `docs/FRONTEND_GUIDE.md`
- Resolution:
  landing mode transitions now write `?mode=` with `replaceState`, matching the documented history contract and avoiding extra browser-history entries.
- Current state:
  `App.jsx` no longer uses `pushState` for landing mode changes, and `App.test.jsx` asserts that `replaceState` is used instead

### BUG-015: "Continue where you left off" does not actually resume prior context

- Status: Fixed on 2026-04-04
- Severity: Medium
- Source: Observed from code path
- Where:
  `src/components/Landing/ModeSelectionPage.jsx`
  `src/App.jsx`
- Resolution:
  the landing CTA now routes through a dedicated resume action, and resume enters practice without clearing the current filter/question context.
- Current state:
  landing resume no longer calls the random-practice clear path, and regression tests cover both the CTA wiring and `?mode=resume` routing

### BUG-014: Shared subtopic URLs can show unrelated questions

- Status: Fixed on 2026-04-04
- Severity: High
- Source: Inferred from code path
- Where:
  `src/contexts/FilterContext.jsx`
- Resolution:
  URL-hydrated subtopic filters now flow through the same parent-subject reconciliation used by interactive filter updates, so shared `?subtopics=` links auto-add the matching subject before filtering.
- Current state:
  subtopic-only shared URLs no longer leak unrelated-subject questions, and `FilterContext` includes a regression test for that deep-link path

### BUG-016: Historical audit showed missing paper metadata

- Status: Fixed on 2026-04-04
- Severity: Medium
- Source: Observed from audit artifact
- Where:
  `artifacts/review/historical-paper-audit.json`
- Resolution:
  repaired historical `exam_uid` metadata, reconciled paper counts, and restored the missing `2014 Set 1` paper from GateOverflow
- Current state:
  the audit summary now reports `paper_count: 27`, `papers_with_missing_slots: 0`, and `questions_without_paper_meta: 0`

## New Entry Template

```md
### BUG-XXX: Title

- Status: Open | In Progress | Blocked | Fixed
- Severity: High | Medium | Low
- Source: Observed | Inferred
- Where:
- What happens:
- Repro:
- Fix idea:
```
