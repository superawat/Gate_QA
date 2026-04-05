# Free-Platform Improvement Plan

This document captures the current platform direction for GateQA as of 2026-04-05.

## Summary

Stay on GitHub Pages for now.

The current bottlenecks are local startup performance and remaining product UX gaps, not free-hosting limits:

- GitHub Pages still has enough headroom for the current static app shape.
- The latest local Lighthouse mobile run on `2026-04-04` still shows landing-path performance issues:
  - performance `0.43`
  - accessibility `0.92`
  - LCP `8514 ms`
  - TBT `4048 ms`
- Public-bank trust drift has been reconciled:
  - `public/question-bank-manifest.json`: `3271`
  - `artifacts/review/data-integrity-report.json`: `3271`
  - `pipeline-state.json`: `3271`
  - `audit/validation-report-2026.json`: `3271`
- The next highest-value product step is real search against the lightweight index.

## Current Platform Status

The biggest platform wins from Phase 1 and Phase 2 are already live:

- landing boots from `public/question-bank-manifest.json`
- practice boots from `public/question-search-index.json`
- question HTML is fetched lazily from `public/question-detail-shards/*.json`
- MathJax and analytics no longer sit on the cold landing path
- public parity checks now pass and `npm run qa:validate-public-parity` is part of CI

The remaining platform debt is narrower now:

- local Lighthouse scores are still below target
- landing/network regressions are not yet guarded by automated Lighthouse or bundle/network assertions
- practice still lacks real search even though the lightweight index is already shipped

## Phase 1: Fix Startup Before New Features

### 1.1 Split landing from full-bank initialization

- Status: Done
- Landing renders from `public/question-bank-manifest.json`.
- `QuestionService.init()` and `AnswerService.init()` are deferred until practice, deep-link, or filter/share URL entry.

### 1.2 Tighten the landing critical path

- Status: Mostly done
- MathJax now loads only inside practice/mock question views.
- The app keeps one deferred analytics provider.
- The remaining work in this lane is not architectural split anymore; it is measurable regression protection and further Lighthouse improvement.

### 1.3 Deliver lighter runtime data

- Status: Done for index/detail split, partial for content hygiene
- The public runtime now ships a lightweight search/filter index separate from full question HTML.
- Practice fetches full question detail only for the active question shard.
- Remote-image debt is tracked via `artifacts/review/remote-image-report.json`.
- Immediate rendered-HTML image hygiene is still open.

## Phase 2: Make Data Trust Automatic

- Status: Mostly done
- One canonical parity check now covers the public payloads, manifest, pipeline state, latest validation report, and generated docs snapshot.
- Generated docs status text now comes from artifacts instead of hardcoded counts.
- `npm run qa:validate-public-parity` is active in CI.
- `npm run qa:validate-data` is already part of CI.
- The remaining trust/QA work is Lighthouse and landing-regression discipline rather than count reconciliation.

## Phase 3: Add High-Value Features That Still Fit Free Hosting

- Next: implement real search against the lightweight index before touching the full HTML bank.
- Add a "Report bad question" flow that opens a prefilled GitHub issue with:
  - `question_uid`
  - page URL
  - year/set
  - subject
- Add local-only weak-topic analytics from solved/bookmarked/progress state.
- Add PWA/offline support for:
  - shell
  - current question
  - recent queue
  - solved/bookmarked sets
- Keep full-bank offline opt-in until the sharded model exists.
- Keep mock mode disabled until Phase 1 and Phase 2 are green.

## Success Criteria

- Landing Lighthouse mobile:
  - performance `>= 0.80`
  - accessibility `>= 0.95`
  - LCP `<= 3500 ms`
- Cold landing load does not request:
  - the full question bank
  - answer lookup JSONs
  - MathJax
  - analytics
- Search returns results from the lightweight index without forcing a full-bank fetch.
- Offline mode restores:
  - the shell
  - the last/current question
  - recent local progress
- Public parity checks pass across public payloads, pipeline state, validation totals, and generated docs.

Current status:

- public parity checks pass
- startup split is live
- Lighthouse targets are still not met
- practice search is still pending

## Assumptions

- Keep hosting on GitHub Pages.
- Keep the product static-first and local-first.
- Do not add auth, a database, or a paid backend in this plan.
- Revisit hosting only after startup and trust issues are fixed and only if custom headers, Functions, or edge logic become necessary.

## Research Basis

- GitHub Pages limits:
  `https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits`
- GitHub Actions billing:
  `https://docs.github.com/en/billing/concepts/product-billing/github-actions`
- Cloudflare Pages limits:
  `https://developers.cloudflare.com/pages/platform/limits/`
- Cloudflare Workers pricing:
  `https://developers.cloudflare.com/workers/platform/pricing/`
- GoatCounter script setup:
  `https://www.goatcounter.com/help/start`
