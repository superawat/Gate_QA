# Bug / Risk Snapshot
Updated: 2026-05-08

## Open bugs
- BUG-C: past-paper/mock readiness gaps remain; visibility is verified and 27/50 papers are release-ready, with remaining blockers concentrated in 2009-and-earlier duplicate-slot / legacy-format cases.

## Recently fixed user bugs
- Gamification UI: Fixed 'AVG TIME 0m' display bug in Insights, aligned Activity Heatmap month labels, fixed Daily Goal progress ring dot, and prevented crash on editing custom goal.
- BUG-A: Insights tagline removed, internal Answer Coverage panel removed, Skill Radar animation disabled.
- BUG-B1-B3: dark-mode logo contrast and landing resume CTA/subtitle readability fixed.
- BUG-B4: non-mock dark-mode readability audit completed across Home, Practice, and Insights; Home cards, indigo overrides, legacy logo frame, and dark primary-button contrast fixed.
- BUG-C near-modern: 2021 Set 1, 2017 Set 1, 2014 Set 2, 2013, and 2012 are release-ready; mock auto-awards `AMBIGUOUS` and `MARKS_TO_ALL` records.
- BUG-D: mock setup sub-pages now provide `Back to Modes`.
- BUG-E (partial): Insights Review Queue and Wrong Answers tabs readability fixed with CSS theme variables.
- BUG-H: Insights filter dropdowns visibility in dark mode fixed.
## Active limitations and risks
- `MAX_SUBTOPICS_PER_QUESTION = 1` must stay until GateOverflow tagging is trustworthy.
- Fresh workspaces need `src/generated/subtopicLookup.json` before tests; run `npm run precompute`.
- Some legacy UI still mixes Tailwind color utilities with CSS variable theme tokens; keep 4.13 as cleanup unless a concrete contrast bug appears.
- `public/questions-filtered*.json` are still used by scripts/fallbacks; do not delete them casually.
- `public/mocktest/` is still used for mock exam image assets.

## Verification baseline
- `npm run test:unit` passes with 201 tests as of 2026-05-09.
- `npm run build` passes as of 2026-05-09.
