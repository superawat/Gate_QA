# Roadmap And Decisions

This file is the working backlog for future product improvements and important decisions for GateQA.

## How To Use

- Add new work as `FEAT-XXX` or `DEC-XXX`.
- Keep each item short: priority, status, owner, and next action.
- Prefer updating this file when the work is still open.
- Move completed delivery details into `CHANGELOG.md`.

## Current Recommendation Snapshot

- Keep GitHub Pages.
  The repo’s current problems are still product/runtime issues, not hosting limits.
- Treat startup split and public parity as landed foundations.
  The next work should build on them instead of reopening host-migration debates.
- Make real search the next product-facing priority.
  The lightweight index already exists, so search is the cleanest high-value follow-up.
- Use Figma selectively, not by default.
  It is worth it for a landing-page redesign, filter UX redesign, mock-test polish, or any work involving multiple contributors.
- Keep the app static-first for now.
  There is no urgent need to add a backend until sync, reporting, or user accounts become real product requirements.

## Decision Log

### DEC-001: Do We Need Figma For UI?

- Status: Recommended for major UI work, optional for small changes
- Priority: P1
- Decision:
  Use a lightweight Figma file if we are redesigning full flows such as landing, practice, filters, or mock test.
- Why:
  GateQA now has enough screens and interaction states that rough planning will save rework.
- Do not require Figma for:
  copy changes, spacing fixes, single-component polish, or bug-only UI fixes
- Simple fallback:
  screenshots plus short notes in PRs/docs are enough for small tweaks

### DEC-002: What Should Come First?

- Status: Approved direction
- Priority: P0
- Decision:
  Finish foundational trust/startup work before adding flashy new features, then move to search.
- Why:
  The startup split and parity work are now in place, so the best next move is user-facing practice UX that reuses the lightweight index instead of re-expanding runtime cost.

### DEC-003: Backend Or No Backend?

- Status: Hold current architecture
- Priority: P2
- Decision:
  Keep GateQA static and local-first until cross-device sync, authentication, or user-submitted reports become mandatory.
- Why:
  The current GitHub Pages architecture is simple, cheap, and reliable.

### DEC-004: Migrate Hosts Or Fix Startup First?

- Status: Approved direction
- Priority: P0
- Decision:
  Stay on GitHub Pages for now and spend the next platform cycle on startup performance and public-data parity instead of host migration.
- Why:
  Host migration would not fix Lighthouse debt, practice UX gaps, or answer coverage gaps.

## Priority Themes

| Priority | Theme | Why it matters | Suggested next step |
| --- | --- | --- | --- |
| P0 | Performance guardrails | The startup split is live, but Lighthouse is still below target and regressions are not fully automated | add landing/network/Lighthouse regression assertions |
| P0 | Data trust | Public parity is fixed, but answer coverage and future regressions still matter | keep parity green and improve coverage discipline |
| P0 | QA automation | The repo already has strong audit scripts; failures should block regressions earlier | keep parity/data validation in CI and add Lighthouse discipline |
| P1 | Practice UX | Practice flow is the core product, so small friction here hurts every session | add real search from the lightweight index and keep deep links predictable |
| P1 | Mock test readiness | Mock mode is now fully enabled and shipped | monitor usage and feedback |
| P2 | Learning layer | Better learning feedback improves repeat usage more than raw question count alone | add weak-topic insights, review queues, and explanation feedback |

## Seed Backlog

| ID | Priority | Status | Improvement | Notes |
| --- | --- | --- | --- | --- |
| FEAT-020 | P0 | Done | Reconcile public-bank parity drift | Public payloads, manifest, pipeline state, validation, and generated docs now agree |
| FEAT-021 | P0 | Done | Move landing to manifest-only startup | Landing no longer initializes the full bank on cold load |
| FEAT-022 | P0 | Done | Lazy-load MathJax and analytics | Landing path no longer carries eager runtime/script cost |
| FEAT-023 | P0 | In Progress | Promote parity and validation checks into CI | Data validation and parity are in CI; Lighthouse discipline is still pending |
| FEAT-024 | P1 | Proposed | Implement real question search | Use `public/question-search-index.json`, not the full HTML bank |
| FEAT-025 | P1 | Proposed | Add "report a bad question" flow | Open a prefilled GitHub issue without adding a backend |
| FEAT-026 | P1 | Done | Improve resume and landing clarity | Resume flow, manifest summary, and unified loading states now keep practice entry clearer |
| FEAT-027 | P1 | Done | Ship Mock mode after Phase 1/2 are green | Mock mode is now enabled and available on the landing page |
| FEAT-028 | P2 | Proposed | Add weak-topic analytics | Show solved accuracy by subject/subtopic and recent mistakes |
| FEAT-029 | P2 | Proposed | Add offline/PWA support | Start with shell/current question/recent local state; keep full-bank offline opt-in |

## What We Can Improve Right Now

1. Data trust:
   keep parity green, improve answer coverage visibility, and avoid regressions
2. UX clarity:
   add real search and keep deep links/filter URLs predictable
3. UI workflow:
   use Figma for major flow redesigns, but avoid forcing it on every small UI change
4. Learning value:
   build review and weak-area features instead of only expanding raw question count
5. Release discipline:
   convert validation, parity, and Lighthouse signals into automated release checks

## New Entry Template

```md
### FEAT-XXX: Title

- Status: Proposed | In Progress | Blocked | Done
- Priority: P0 | P1 | P2
- Owner: name
- Why:
- Next step:
```
