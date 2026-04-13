# Roadmap And Decisions

This file is the working backlog for future product improvements and important decisions for GateQA.

## How To Use

- Add new work as `FEAT-XXX` or `DEC-XXX`.
- Keep each item short: priority, status, owner, and next action.
- Prefer updating this file when the work is still open.
- Move completed delivery details into `CHANGELOG.md`.

## Current Recommendation Snapshot

- Keep GitHub Pages.
  The repo's current problems are still product/runtime issues, not hosting limits.
- Treat startup split and public parity as landed foundations.
  The next work should build on them instead of reopening host-migration debates.
- Use the now-shipped search, insights, and mock foundations as the default baseline.
  New product work should build on those shipped surfaces instead of reopening them.
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
  Finish foundational trust/startup work before adding flashy new features, then move to product refinement.
- Why:
  Startup split, parity, search, insights, and mock mode are now in place, so the best next move is disciplined iteration instead of reopening core architecture.

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
  Stay on GitHub Pages for now and spend the current platform cycle on performance, QA discipline, and content hygiene instead of host migration.
- Why:
  Host migration would not fix image debt, Lighthouse regressions, or release-discipline gaps by itself.

## Priority Themes

| Priority | Theme | Why it matters | Suggested next step |
| --- | --- | --- | --- |
| P0 | Performance guardrails | The startup split is live, but regressions still need continued enforcement | keep landing/network/Lighthouse assertions healthy and profile any new regressions |
| P0 | Data trust | Public parity is fixed, but answer coverage and future regressions still matter | keep parity green and improve coverage discipline |
| P0 | QA automation | The repo already has strong audit scripts; failures should block regressions earlier | extend release checks with mock E2E and keep validation in CI |
| P1 | Practice UX | Practice flow is the core product, so small friction here hurts every session | refine search, mobile UX, and page-level resilience instead of rebuilding the shell |
| P1 | Mock test readiness | Mock mode is now fully enabled and shipped | monitor usage, add E2E coverage, and close remaining exam-parity polish |
| P2 | Learning layer | Better learning feedback improves repeat usage more than raw question count alone | iterate on weak-topic insights, review queues, and explanation feedback |

## Seed Backlog

| ID | Priority | Status | Improvement | Notes |
| --- | --- | --- | --- | --- |
| FEAT-020 | P0 | Done | Reconcile public-bank parity drift | Public payloads, manifest, pipeline state, validation, and generated docs now agree |
| FEAT-021 | P0 | Done | Move landing to manifest-only startup | Landing no longer initializes the full bank on cold load |
| FEAT-022 | P0 | Done | Lazy-load MathJax and analytics | Landing path no longer carries eager runtime/script cost |
| FEAT-023 | P0 | In Progress | Promote parity and validation checks into CI | Data validation, parity, bundle budget, and landing-network checks are in CI; Lighthouse discipline is still worth tightening |
| FEAT-024 | P1 | Done | Implement real question search | Explore now filters from `public/question-search-index.json` and preserves deep-link URL behavior |
| FEAT-025 | P1 | Done | Add "report a bad question" flow | Practice now links into a prefilled GitHub issue flow without adding a backend |
| FEAT-026 | P1 | Done | Improve resume and landing clarity | Resume flow, manifest summary, and unified loading states now keep practice entry clearer |
| FEAT-027 | P1 | Done | Ship Mock mode after Phase 1/2 are green | Mock mode is now enabled and available on the landing page |
| FEAT-028 | P2 | Done | Add weak-topic analytics | Home now shows a snapshot and `/insights` exposes full local-only subject/subtopic analytics |
| FEAT-029 | P2 | Done | Add offline/PWA support | Shell-first service worker, manifest, and offline fallback are now shipped |

## What We Can Improve Right Now

1. Data trust:
   keep parity green, improve answer coverage visibility, and avoid regressions
2. UX clarity:
   keep deep links/filter URLs predictable and close the remaining image/offline hygiene gaps
3. UI workflow:
   use Figma for major flow redesigns, but avoid forcing it on every small UI change
4. Learning value:
   iterate on review and weak-area features instead of only expanding raw question count
5. Release discipline:
   convert validation, parity, mock E2E, and Lighthouse signals into automated release checks

## New Entry Template

```md
### FEAT-XXX: Title

- Status: Proposed | In Progress | Blocked | Done
- Priority: P0 | P1 | P2
- Owner: name
- Why:
- Next step:
```
