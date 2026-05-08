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
- Mock catalog readiness is `27/50` release-ready papers after the May 2026 near-modern backfill.
- The bugs below come from repo inspection and audit artifacts, not from failing unit tests

## Open Bugs

### BUG-C: Past paper / mock answer readiness gaps

- Status: Open
- Severity: High
- Source: User reported
- Where:
  `public/mock_catalog_v1.json`
  `src/components/MockTest/MockTestSetup.jsx`
  answer registry files
- What happens:
  2009-and-earlier papers remain blocked by legacy format drift, duplicate slots, or missing parsed slots. Paper-mode visibility itself is verified: the setup UI renders the full generated catalog, including blocked papers with status reasons.
- Recent progress:
  2021 Set 1, 2017 Set 1, 2014 Set 2, 2013, and 2012 are release-ready. `AMBIGUOUS` and `MARKS_TO_ALL` records are now mock-only auto-awarded edge cases rather than fake normal answers.
- Fix idea:
  audit 2009-and-earlier blocked papers, repair duplicate/missing slots where the legacy format supports a faithful 65-question mock, regenerate public artifacts, and verify mock setup readiness.

## Recently Closed

### BUG-A: Insights page cleanup

- Status: Fixed on 2026-05-08
- Severity: Medium
- Source: User reported
- Where:
  `src/pages/InsightsPage.jsx`
- Resolution:
  removed the hero tagline, removed the internal Answer Coverage section, and disabled Skill Radar animation so the rendered map remains stable.

### BUG-B1-B3: Dark-mode logo and resume CTA contrast regressions

- Status: Fixed on 2026-05-08
- Severity: High
- Source: User reported
- Where:
  `src/index.css`
  `src/pages/HomePage.jsx`
- Resolution:
  removed the dark-mode logo inversion filter and moved the landing resume title/subtitle to theme-token colors.

### BUG-B4: Non-mock dark-mode readability audit

- Status: Fixed on 2026-05-08
- Severity: Medium
- Source: User reported
- Where:
  `src/pages/HomePage.jsx`
  `src/index.css`
  `src/components/Header/Header.jsx`
- Resolution:
  completed a dark-mode pass across Home, Practice, and Insights; moved risky Home cards and the mock-history shortcut to theme tokens; added indigo dark overrides; wrapped the legacy header logo in the contrast frame; and darkened primary blue button overrides so white text clears contrast.
- Verification:
  production Playwright smoke checked representative dark-mode text contrast and logo-frame rendering on `/`, `/practice`, and `/insights`.

### BUG-D: Mock setup sub-pages lacked back navigation to mode selection

- Status: Fixed on 2026-05-08
- Severity: Medium
- Source: User reported
- Where:
  `src/components/MockTest/MockTestSetup.jsx`
  `src/components/MockTest/MockTestShell.jsx`
- Resolution:
  added a `Back to Modes` button on setup sub-pages and covered the flow with a unit regression test.

### BUG-022: Loading states used inconsistent visuals across the app

- Status: Fixed on 2026-04-05
- Severity: Medium
- Source: Observed from UI loading paths
- Where:
  `src/App.jsx`
  `src/components/Landing/ModeSelectionPage.jsx`
  `src/components/Calculator/CalculatorWidget.jsx`
  practice route loading surfaces
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
  practice route loading surfaces
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
