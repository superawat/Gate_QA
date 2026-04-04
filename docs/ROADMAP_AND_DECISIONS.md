# Roadmap And Decisions

This file is the working backlog for future product improvements and important decisions for GateQA.

## How To Use

- Add new work as `FEAT-XXX` or `DEC-XXX`.
- Keep each item short: priority, status, owner, and next action.
- Prefer updating this file when the work is still open.
- Move completed delivery details into `CHANGELOG.md`.

## Current Recommendation Snapshot

- Prioritize trust before new surface area.
  The product is strongest when data is correct, searchable, and shareable.
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
  Finish data trust work before adding flashy new features.
- Why:
  `pipeline-state.json` still shows `answersTotal: 0` for the latest pipeline state, and the next trust step is preventing fresh regressions now that the historical paper audit is green again.

### DEC-003: Backend Or No Backend?

- Status: Hold current architecture
- Priority: P2
- Decision:
  Keep GateQA static and local-first until cross-device sync, authentication, or user-submitted reports become mandatory.
- Why:
  The current GitHub Pages architecture is simple, cheap, and reliable.

## Priority Themes

| Priority | Theme | Why it matters | Suggested next step |
| --- | --- | --- | --- |
| P0 | Data completeness | Users trust the platform only if papers, answers, and metadata are complete | finish 2026 answer backfill and keep historical audits green |
| P0 | QA automation | The repo already has strong audit scripts; failures should block regressions earlier | turn audit summaries into CI gates and publish a compact report artifact |
| P1 | Practice UX | Practice flow is the core product, so small friction here hurts every session | improve resume flow, search, filter discoverability, and mobile polish |
| P1 | Mock test readiness | Mock mode exists in code but is still feature-flagged off | define parity checklist and enable only after content + UX review |
| P2 | Learning layer | Better learning feedback improves repeat usage more than raw question count alone | add weak-topic insights, review queues, and explanation feedback |

## Seed Backlog

| ID | Priority | Status | Improvement | Notes |
| --- | --- | --- | --- | --- |
| FEAT-020 | P0 | Proposed | Complete 2026 answer backfill | Latest pipeline state still shows no answers merged for the latest run |
| FEAT-021 | P0 | Proposed | Add audit-based CI gate | Fail CI if paper-count audit, metadata audit, or validation thresholds regress |
| FEAT-022 | P1 | Proposed | Implement real question search | `searchQuery` exists in filter state but is not yet a visible end-to-end feature |
| FEAT-023 | P1 | Proposed | Improve resume experience | Resume should restore context, not just drop the user into random practice |
| FEAT-024 | P1 | Proposed | Finish and launch mock mode | Feature flag exists; UX and content parity should be reviewed before launch |
| FEAT-025 | P1 | Proposed | Add "report a bad question" flow | Can start as a GitHub issue link or simple form without adding a backend |
| FEAT-026 | P1 | Proposed | Create a small design system | Define spacing, typography, card states, colors, and empty-state rules |
| FEAT-027 | P2 | Proposed | Add weak-topic analytics | Show solved accuracy by subject/subtopic and recent mistakes |
| FEAT-028 | P2 | Proposed | Add offline/PWA support | Static hosting makes this a natural fit for revision-heavy users |

## What We Can Improve Right Now

1. Data trust:
   finish answer coverage, keep metadata/paper audits green, and surface audit status in one place
2. UX clarity:
   make resume, search, and deep links feel predictable and intentional
3. UI workflow:
   use Figma for major flow redesigns, but avoid forcing it on every small UI change
4. Learning value:
   build review and weak-area features instead of only expanding raw question count
5. Release discipline:
   convert audit reports into automated release checks

## New Entry Template

```md
### FEAT-XXX: Title

- Status: Proposed | In Progress | Blocked | Done
- Priority: P0 | P1 | P2
- Owner: name
- Why:
- Next step:
```
