# Bug Backlog

This file tracks open bugs, suspected regressions, and recently closed audit issues for GateQA.

## How To Use

- Add only bugs with a clear symptom or a strong code/data signal.
- Mark each entry as `Observed` or `Inferred`.
- Keep reproduction steps short and concrete.
- When fixed, move the final user-facing note into `CHANGELOG.md`.

## Current Status

- Unit tests currently pass: `94/94`
- Historical paper audit is currently clean: `paper_count: 27`, `questions_without_paper_meta: 0`
- The bugs below come from repo inspection and audit artifacts, not from failing unit tests

## Open Bugs

### BUG-017: Landing page Hindi subtitle text is encoding-broken

- Status: Open
- Severity: Low
- Source: Observed from source file
- Where:
  `src/shells/LandingShell.jsx`
- What happens:
  the Hindi subtitle string is stored as mojibake text instead of valid readable Hindi
- User impact:
  the landing header can render broken text and reduce polish/trust
- Fix idea:
  replace the corrupted literal with a verified UTF-8 string

### BUG-018: URL history behavior and docs are out of sync

- Status: Open
- Severity: Low
- Source: Observed from docs vs implementation
- Where:
  `src/App.jsx`
  `docs/ARCHITECTURE.md`
  `docs/FRONTEND_GUIDE.md`
- What happens:
  docs describe `?mode=` writes with `replaceState`, but the app currently uses `pushState` for mode changes
- User impact:
  browser back/forward behavior may differ from what maintainers expect
- Fix idea:
  either update docs to match intended behavior or switch implementation back to the documented contract

## Recently Closed

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
