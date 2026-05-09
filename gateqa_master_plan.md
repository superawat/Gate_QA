# GateQA Master Plan (Open Work Only)

> Updated: 2026-05-09. Completed work has been removed from this file and recorded in `docs/CHANGELOG.md`, `docs/`, and `.llm-memory/`.

## Current Snapshot

| Area | Current state |
|---|---|
| Question bank | 3,550 questions, 100% direct answer coverage |
| Runtime | React 18 + Vite SPA on GitHub Pages, static-first and local-first |
| Practice | Search-index first, detail-shard on demand, no backend |
| Mock test | Full Mock, Past Paper, and Custom Builder modes |
| Insights | Practice analytics plus mock history tab; internal answer coverage is hidden |
| Tests | 201 Vitest unit tests and 15 Playwright E2E tests |
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

## Open Bugs

| # | Bug | Severity | Status | Description |
|---|---|---|---|---|
| BUG-C | Past paper / mock readiness gaps | High | Open | 27/50 papers release-ready; 2009-and-earlier blocked by legacy format / duplicate-slot cleanup |
| BUG-E | Insights page dark-mode readability | High | Partial | InsightsPage ReviewQueue and WrongAnswers tabs use CSS variables, but stat cards and Overview/Analysis tabs still need migration |
| BUG-F | Insights chart colors not theme-aware | Medium | Open | Recharts components use hardcoded fills/strokes/tooltips; grids, axis ticks, and tooltip containers break in dark mode |
| BUG-G | Streak calculation ignores today gap | Medium | Open | `buildStudyActivity()` sets `currentStreak=1` even when last active date was 2+ days ago; should be 0 if gap ≥ 2 days from today |

## Open Priority Work

| # | Item | Status | Remaining |
|---|---|---|---|
| C4 | All blocked past papers | Open | 27/50 papers are release-ready; remaining blockers are 2009-and-earlier legacy format / duplicate-slot cleanup |
| P2-15 / P3-13 | Unlock blocked mock papers | Partial | Finish mock-catalog readiness for 2009-and-earlier blocked papers |

## Phase 5: Engagement & Continuity Features

### 5.1 — Duolingo-style Streak System

| Sub-item | Description | Status |
|---|---|---|
| 5.1.1 | **Streak Banner on HomePage** — Prominent 🔥 fire streak counter on landing page with motivational text ("Keep it going!"), current streak count, and daily goal progress ring | Completed |
| 5.1.2 | **Streak Freeze** — Bank 1 streak freeze per 7-day streak; auto-consumed on missed day; stored in localStorage alongside `gateqa_progress_v1` | Future |
| 5.1.3 | **Daily Goal System** — User-configurable daily practice goal (5/10/20 questions); progress ring toward goal on home page; localStorage-persisted | Completed |
| 5.1.4 | **Streak Milestones & Celebrations** — Animated celebration modal at 3, 7, 14, 30, 60, 100-day milestones with confetti/particle effect | Future |
| 5.1.5 | **Streak Danger State** — Amber warning on home page after 6 PM if user hasn't practiced today ("Your streak is at risk!") | Future |
| 5.1.6 | **Enhanced XP System** — 2x XP on 7+ day streaks; bonus XP for hard questions; XP leaderboard in Insights | Future |
| 5.1.7 | **Fix BUG-G** — Streak calculation must check today/yesterday gap before counting; `currentStreak = 0` if last active ≥ 2 days ago | Future |

### 5.2 — GitHub-style Activity Heatmap (Contribution Graph)

| Sub-item | Description | Status |
|---|---|---|
| 5.2.1 | **Full-Year Activity Heatmap** — GitHub-style green contribution grid (52×7 cells). Cell intensity by daily attempts: 0=gray, 1-3=light green, 4-7=medium green, 8+=dark green. Shown on HomePage and Insights Overview | Completed |
| 5.2.2 | **Hover Tooltip** — Cell hover shows date, attempt count, accuracy%, and time spent | Completed |
| 5.2.3 | **Month & Day Labels** — Month headers (Jan–Dec) along top, day labels (Mon/Wed/Fri) on y-axis | Completed |
| 5.2.4 | **Activity Legend** — "Less … More" color scale legend below the grid | Completed |
| 5.2.5 | **Streak Overlay** — Current streak days highlighted with a subtle glow/border on rightmost active cells | Future |
| 5.2.6 | **Year Selector** — If data spans multiple years, allow switching the heatmap view | Future |
| 5.2.7 | **Dark Mode Support** — Use dark-mode-aware green shades for heatmap cells | Completed |

## Phase 5 Bug Fixes

| # | Bug | Priority | Description |
|---|---|---|---|
| 5.B1 | BUG-E: Insights dark-mode readability | High | Partial: Migrated ReviewQueue and WrongAnswers tabs. Still need to migrate Overview and Analysis tabs. |
| 5.B2 | BUG-F: Insights chart theme awareness | Medium | Derive Recharts fills/strokes/tooltips from CSS variables |
| 5.B3 | BUG-G: Streak today-gap calculation | Medium | Fix `buildStudyActivity()` to return `currentStreak=0` when last active ≥ 2 days ago |

## Remaining Future Work

| # | Item | Status | Remaining |
|---|---|---|---|
| 4.9 | Custom practice sessions | Future | Timed practice sets between free-form practice and full mock |
| 4.10 | Solution explanation quality | Future | Curate/improve top attempted solution explanations |
| 4.11 | Export analytics as PDF | Future | Export Insights dashboard as a local PDF report |
| 4.14 | TypeScript gradual adoption | Future | Use `.tsx` for new isolated frontend modules where useful |
| 4.16 | GATE 2027 pipeline readiness | Future | Dry-run scrape/normalize/merge readiness before the 2027 release window |

## Recommended Execution Order

1. **5.B1–5.B3** — Bug fixes first (Insights dark mode partials + chart colors + streak calculation).
2. **5.1.7 → 5.1.1 → 5.1.3** — Fix streak calculation, then build the streak banner + daily goal on HomePage.
3. **5.2.1 → 5.2.2 → 5.2.3 → 5.2.4** — Build the activity heatmap component, then wire it to HomePage and Insights.
4. **5.1.2 → 5.1.4 → 5.1.5 → 5.1.6** — Streak freeze, celebrations, danger state, enhanced XP.
5. **5.2.5 → 5.2.6 → 5.2.7** — Heatmap polish (streak overlay, year selector, dark mode).
6. C4 / P2-15 / P3-13 legacy mock paper unlock follow-through for 2009-and-earlier papers.
7. 4.9-4.11 learner outcome features.
8. 4.14 and 4.16 infrastructure work.

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
- 4.15 bundle monitoring alerts completed on 2026-05-08: the budget gate now emits `artifacts/review/bundle-budget-report.json`, warns near budget limits, and keeps landing initial JS at 335.3 KB after vendor chunk splitting and learner-feature updates.
- 4.17 accessibility snapshots completed on 2026-05-08: landing, explore, and solve axe E2E tests now also assert landmark, heading, and named-control structure.
- 4.5 spaced repetition completed on 2026-05-09: practice submissions now store review levels, due dates, and an Insights review queue for due questions.
- 4.6 performance analytics completed on 2026-05-09: practice submissions track duration/history, and Insights surfaces average time plus daily attempt trends.
- 4.7 question difficulty scoring completed on 2026-05-09: local attempt history derives Light/Medium/Hard question difficulty, hard-question counts, and difficulty badges.
- 4.8 study streak / gamification completed on 2026-05-09: Insights now derives active days, current/longest streak, XP, and milestone badges from local practice history.
- Mock auto-award policy is mock-only: `AMBIGUOUS` and `MARKS_TO_ALL` records are included in papers and awarded automatically, without turning them into normal MCQ/MSQ/NAT answers.
- `public/mocktest/` is still required by mock exam image assets.
- `public/questions-filtered.json` and `public/questions-filtered-with-ids.json` are still referenced by scripts/fallback paths and should not be deleted until those paths are intentionally retired.
- The existing `attemptTimeline` data structure in `weakTopicAnalyzer.js` already has the per-day buckets needed for the heatmap; no new data pipeline work is needed.
- Streak freeze and daily goal state should live in localStorage under new keys (`gateqa_streak_freeze_v1`, `gateqa_daily_goal_v1`) alongside the existing `gateqa_progress_v1`.
