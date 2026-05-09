# Progress Snapshot
Updated: 2026-05-09

## Current shipped state
- Landing/practice startup split is live: landing uses manifest; practice uses search index + detail shards.
- Route-level code splitting covers Explore, Solve, Insights, MockShell, Calculator, and Toast.
- Mock test is stable with Full Mock, Past Paper, and Custom Builder modes.
- Mock history is consolidated into the `/insights` mock-history tab; old history route redirects.
- Insights no longer shows internal answer coverage; generated docs remain the answer-coverage source.
- Dark-mode logo/resume CTA regressions are fixed; the broader non-mock readability audit across Home, Practice, and Insights is complete.
- PWA/offline shell, service worker, web manifest, and offline fallback are deployed.
- Error boundaries wrap route content.
- 455 GateOverflow images are mirrored locally; 453 were converted to WebP, with 2 legacy PNG/BMP files retained; 0 remote blob dependencies.
- Unit suite: 202 passing Vitest tests. E2E suite: 15 Playwright tests.
- Confirmed dead code removed: LandingShell, PracticeShell, FilterSection, FilterTags, and `check_case.js`.
- `gateqa_master_plan.md` is now open-work only.

## Recent completed work
- Phase 5 Gamification (5.1 & 5.2): Added a Duolingo-style Streak Banner with daily goal progress to the HomePage. Built a GitHub-style 52-week Activity Heatmap, added it to HomePage and Insights, and enhanced `loadStudyActivityFast` to read localStorage offline without network requests.
- Phase 4 Learner Analytics (4.5 - 4.8): Implemented spaced-review scheduling, detailed practice tracking (duration, history, XP, streaks), and a massive Insights dashboard expansion (Review Queue, Practice Trend, Avg Time, Hard Questions, Badges).
- Phase 4 UI Polish: WebP image conversion (453 images, 73% smaller), keyboard shortcuts added, Tailwind dark-mode token cleanup (including Insights Review Queue & Wrong Answers tabs, DataPolicy/Support modals), footer layout stabilization, and bundle budget CI gating.
- E2E Playwright tests updated to reflect the new Insights mock history CTA and practice search input labels.
- GATE 2026 import and answer backfill completed; total bank is 3,550 questions after the 2026-05-08 mock-readiness backfills.
- External aptitude import added 275 vetted non-CSE/IT/DA aptitude questions.
- Legacy out-of-syllabus topics now map to `Other / Optional`.
- Past-paper setup surfaces ready and blocked papers with missing-slot details.
- Mock navigation bug fixed: Save & Next crosses from last GA to first CS.
- Filter header/icon UX and filter logic cleanup completed.
- Redundancy audit phase B partly completed with confirmed dead code removed; public fallback JSON and mock image assets remain in use.
- C1 past-paper visibility verified: paper mode shows the full catalog, including blocked papers and reasons.
- C2 complete: 2021 Set 1 is release-ready after verified NAT answers `205` / `820` were added for `go:357428`.
- C3 complete: 2017 Set 1 is release-ready under the mock auto-award policy for `AMBIGUOUS` records.
- C4 near-modern pass complete: 2014 Set 2, 2013, and 2012 are release-ready; ready-paper count is now 27/50.
- Mock scoring auto-awards `AMBIGUOUS` and `MARKS_TO_ALL` records without marking them as normal correct answers or solved practice progress.
- P2-9 WebP conversion complete: 453 images converted, 10.59 MB saved, and generated public artifacts rebuilt; 2 BMP-masquerading PNGs remain unchanged.

## Open gaps
- BUG-C / C4 / P2-15 / P3-13: remaining 2009-and-earlier blocked-paper mock readiness, especially duplicate-slot and legacy-format cases.
- Future learner features: spaced repetition, analytics trends, difficulty scoring, streak milestones, streak freeze, custom timed practice, PDF export.
