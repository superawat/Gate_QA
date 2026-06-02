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
- Mock catalog readiness is `50/50` release-ready papers after unlocking legacy subjective prompts and pre-2010 papers.
- Aptitude verification is green for `36,836` public rows; `qa:verify-aptitude` may still emit non-blocking coverage/OCR warnings.
- Recent end-to-end and packaging checks also passed: `npm run build`, `npm run test:e2e`, `npm run qa:validate-bundle-budget`, and `npm run qa:validate-landing-network`.
- The bugs below come from repo inspection and audit artifacts, not from failing unit tests

## Open Bugs

*None currently.*

## Recently Closed

### BUG-APT4: Aptitude Direct-Link Cold-Start Race

- Status: Fixed on 2026-06-02
- Severity: High
- Source: CI / E2E regression
- Where:
  `src/utils/aptitudePreference.js`
  `src/contexts/FilterContext.jsx`
  `tests/e2e/practice-flow.spec.js`
- Resolution:
  Initialized Aptitude preference synchronously from direct `/question/APT-*` landing URLs, then persisted `gateqa-aptitude-enabled` during context hydration. Updated the E2E expectation to assert automatic Aptitude activation and successful direct question loading instead of a redirect back to Practice.
- Verification:
  `npm run test:unit` passed 259 tests and `npm run test:e2e` passed 17 Playwright tests before push `ee57b91`.

### BUG-APT2: Low-signal aptitude intake clutter reaching public output

- Status: Fixed on 2026-05-19
- Severity: High
- Source: User reported
- Where:
  `scripts/aptitude-pipeline/aptitude-intake-classifier.mjs`
  `scripts/aptitude-pipeline/scrape-aptitude.mjs`
  `scripts/aptitude-pipeline/build_aptitude_db.py`
  `scripts/aptitude-pipeline/remaps.py`
- Resolution:
  Added a shared AptitudeBank attempt/ignore gate across catalog filtering, scraping, and public artifact build. Ignored low-signal full-length packs, duplicate questions, unsupported GS/GK/General Awareness/Hindi/current-affairs sources, invalid rows, brittle remote images, inline base64 images, forbidden display tokens, and synthetic markers before public write. Retired the local PDF/OCR path and kept generated review reports local-only.
- Verification:
  `npm run qa:validate-aptitude`, `npm run qa:verify-aptitude`, and `npm run qa:validate-aptitude-images` pass.

### BUG-C: Past paper / mock answer readiness gaps

- Status: Fixed on 2026-05-18
- Severity: High
- Source: User reported
- Where:
  `scripts/build-public-artifacts.mjs`
  `src/utils/mockTest.js`
  `src/components/MockTest/MockTestQuestion.jsx`
- Resolution:
  Changed artifact building to count curated legacy `SUBJECTIVE` records as mock-only auto-awards. This allows very old partial papers to be released at their parsed size. Updated mock test UI and runtime to treat those prompts as auto-awarded. The mock catalog now reports 50/50 papers ready with 0 blocked.

### BUG-APT1: Aptitude question options repeating in UI

- Status: Fixed
- Severity: High
- Source: User reported
- Where:
  `src/components/Question/Question.jsx`
  retired legacy `parse_questions.py`
- Resolution:
  The A/B/C/D option text embedded inside `questionHtml` was causing duplicate options rendering. Fixed at runtime by calling `stripEmbeddedOptions()` and at pipeline-level by stopping the embed behavior in `to_question_html()`.


### BUG-STK1: Streak Freeze Not Retaining Progress

- Status: Fixed on 2026-06-02
- Severity: High
- Source: Observed / User Report
- Where:
  Progress and streak state management logic (daily progress calculation and streak update routines)
- Resolution:
  Reconciled streak freeze consumption across whole missing-day gaps so a freeze now preserves the active streak when practice resumes after a one-day skip.
- Verification:
  `npm run build` and the targeted streak regression now pass with a 3-day streak preserved across a skipped day.

### BUG-GATE1: GATE Question Images Not Loading

- Status: Fixed on 2026-06-02
- Severity: High
- Source: Observed / User Report
- Where:
  `scripts/mirror-gateoverflow-images.mjs`
  `scripts/qa/validate-question-images.mjs`
- Resolution:
  Localized remote GateOverflow blob images across question-bank and detail-shard data, including subdomain hosts, so public image references now resolve from `public/question-images/`.
- Verification:
  `npm run build:public-artifacts` mirrored 69 images and `node scripts/qa/validate-question-images.mjs` reported 0 remote blob questions and 0 missing files.

### BUG-APT3: Aptitude Cloze Test / Question Content Unavailable

- Status: Fixed on 2026-06-02
- Severity: High
- Source: Observed / User Screenshot
- Where:
  `src/services/AptitudeQuestionService.js`
  `scripts/qa/validate-aptitude-data.js`
- Resolution:
  Tightened aptitude detail hydration so missing shard rows now fail loudly instead of rendering an empty shell, and added public index/detail consistency checks to the aptitude validation gate.
- Verification:
  `node scripts/qa/validate-aptitude-data.js` passed for 36,836 public aptitude rows.

### CE-001: Content Mismatch

- Status: Fixed on 2026-06-02
- Severity: Medium
- Source: Manual verification
- Where:
  `public/questions-with-answers.json`
  `public/data/answers/answers_by_question_uid_v1.json`
- Resolution:
  Verified GATE CSE 2009 Question 15: the regular expression matches strings containing at least two `0`s, which corresponds to option `C`. The public answer data already matched that reading.
- Verification:
  The original question paper text and the public answer record for `go:1307` agree on `C`.

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
