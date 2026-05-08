# GateQA Master Plan (Open Work Only)

> Updated: 2026-05-08. Completed work has been removed from this file and recorded in `docs/CHANGELOG.md`, `docs/`, and `.llm-memory/`.

## Current Snapshot

| Area | Current state |
|---|---|
| Question bank | 3,550 questions, 100% direct answer coverage |
| Runtime | React 18 + Vite SPA on GitHub Pages, static-first and local-first |
| Practice | Search-index first, detail-shard on demand, no backend |
| Mock test | Full Mock, Past Paper, and Custom Builder modes |
| Insights | Practice analytics plus mock history tab; internal answer coverage is hidden |
| Tests | 195 Vitest unit tests and 15 Playwright E2E tests |
| Assets | 455 mirrored GateOverflow images, 0 remote blob dependencies |

## Do Not Touch Without Explicit Scope

- Split filter contexts (`useFilterState` / `useFilterActions`)
- Session queue logic
- Answer resolution chain
- Deep-link / URL contract
- Progress import/export
- GATE pipeline scripts
- Public parity gate
- Calculator widget
- Page routing
- `MAX_SUBTOPICS_PER_QUESTION = 1`

## Open Priority Work

| # | Item | Status | Remaining |
|---|---|---|---|
| C4 | All blocked past papers | Open | 27/50 papers are release-ready; remaining blockers are 2009-and-earlier legacy format / duplicate-slot cleanup |

| P2-15 / P3-13 | Unlock blocked mock papers | Partial | Finish mock-catalog readiness for 2009-and-earlier blocked papers |
| 4.5 | Spaced repetition / review scheduling | Future | Track attempt timestamps and surface due-review questions |
| 4.6 | Performance analytics enhancements | Future | Add time-per-question and trend charts to Insights |
| 4.7 | Question difficulty scoring | Future | Derive difficulty and add adaptive/filtering support |
| 4.8 | Study streak / gamification | Future | Daily streak, badges, XP, and retention features |
| 4.9 | Custom practice sessions | Future | Timed practice sets between free-form practice and full mock |
| 4.10 | Solution explanation quality | Future | Curate/improve top attempted solution explanations |
| 4.11 | Export analytics as PDF | Future | Export Insights dashboard as a local PDF report |
| 4.14 | TypeScript gradual adoption | Future | Use `.tsx` for new isolated frontend modules where useful |
| 4.16 | GATE 2027 pipeline readiness | Future | Dry-run scrape/normalize/merge readiness before the 2027 release window |

## Recommended Execution Order

2. C4 / P2-15 / P3-13 legacy mock paper unlock follow-through for 2009-and-earlier papers.
3. 4.5-4.11 learner outcome features.
4. 4.14 and 4.16 infrastructure work.

## Notes

- Redundancy cleanup removed confirmed dead code files on 2026-05-08.
- B4 dark-mode readability audit completed on 2026-05-08; Home, Practice, and Insights passed a dark-mode production contrast smoke.
- C1 past-paper visibility verified on 2026-05-08; paper mode uses the full mock catalog and shows ready plus blocked papers with reasons.
- C2 completed on 2026-05-08; 2021 Set 1 is release-ready after adding verified NAT answers `205` / `820` for `go:357428`.
- C3 completed on 2026-05-08; 2017 Set 1 is release-ready under the mock auto-award policy for intentionally ambiguous questions.
- C4 near-modern pass completed on 2026-05-08; 2014 Set 2, 2013, and 2012 are release-ready after importing verified rows/answers and treating ambiguous / marks-to-all records as auto-awarded mock questions.
- P2-9 WebP conversion completed on 2026-05-08: Converted 453 images to WebP, saving 10.59 MB (72.9% reduction). The 2 failures were unconvertible BMP files masquerading as PNGs.
- 4.12 keyboard shortcuts completed on 2026-05-08: Explore supports `/` search focus and `F` filters; Solve supports arrow navigation plus answer-panel shortcuts for option select, submit, bookmark, mark solved, and share.
- 4.13 Tailwind-to-token cleanup completed on 2026-05-08: remaining `dark:` branches were removed from non-mock UI, and high-traffic practice/filter/progress surfaces now use CSS-variable theme tokens.
- 4.15 bundle monitoring alerts completed on 2026-05-08: the budget gate now emits `artifacts/review/bundle-budget-report.json`, warns near budget limits, and keeps landing initial JS at 331.2 KB after vendor chunk splitting.
- 4.17 accessibility snapshots completed on 2026-05-08: landing, explore, and solve axe E2E tests now also assert landmark, heading, and named-control structure.
- Mock auto-award policy is mock-only: `AMBIGUOUS` and `MARKS_TO_ALL` records are included in papers and awarded automatically, without turning them into normal MCQ/MSQ/NAT answers.
- `public/mocktest/` is still required by mock exam image assets.
- `public/questions-filtered.json` and `public/questions-filtered-with-ids.json` are still referenced by scripts/fallback paths and should not be deleted until those paths are intentionally retired.
