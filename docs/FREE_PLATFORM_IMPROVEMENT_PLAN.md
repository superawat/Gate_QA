# Free-Platform Improvement Plan

This document captures the current platform direction for GateQA as of 2026-04-10.

## Summary

Stay on GitHub Pages for now.

The current bottlenecks are image/content hygiene and the last regression-coverage gaps, not free-hosting limits:

- GitHub Pages still has enough headroom for the current static app shape.
- The latest local Lighthouse mobile run on `2026-04-10` is materially healthier:
  - performance `0.98`
  - accessibility `0.95`
  - LCP `2128 ms`
  - TBT `96 ms`
- Public-bank trust drift has been reconciled:
  - `public/question-bank-manifest.json`: `3271`
  - `artifacts/review/data-integrity-report.json`: `3271`
  - `pipeline-state.json`: `3271`
  - `audit/validation-report-2026.json`: `3271`
- Answer coverage is now visible on the shipped product:
  - overall direct answer coverage `3150 / 3271 (96.3%)`
  - latest year coverage `2026: 130 / 130 (100.0%)`

## Current Platform Status

The biggest platform wins from Phase 1 and Phase 2 are already live:

- landing boots from `public/question-bank-manifest.json`
- practice boots from `public/question-search-index.json`
- question HTML is fetched lazily from `public/question-detail-shards/*.json`
- MathJax and analytics no longer sit on the cold landing path
- public parity checks now pass and `npm run qa:validate-public-parity` is part of CI
- bundle-budget and landing-network checks are active in CI
- PWA install metadata and offline fallback are shipped
- real search, report-a-bad-question, and weak-topic insights are shipped

The remaining platform debt is narrower now:

- remote GateOverflow blob images still exist inside question HTML
- mock-specific E2E coverage and some release-discipline polish are still open
- Lighthouse is healthy locally, but continued regression discipline still matters

## Phase 1: Fix Startup Before New Features

### 1.1 Split landing from full-bank initialization

- Status: Done
- Landing renders from `public/question-bank-manifest.json`.
- `QuestionService.init()` and `AnswerService.init()` are deferred until practice, deep-link, or filter/share URL entry.

### 1.2 Tighten the landing critical path

- Status: Done
- MathJax now loads only inside practice/mock question views.
- The app keeps one deferred analytics provider.
- Bundle-budget, landing-network, and Lighthouse checks now provide measurable regression protection.

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

- Real search against the lightweight index is done.
- "Report a bad question" is done with a prefilled GitHub issue flow carrying:
  - `question_uid`
  - page URL
  - year/set
  - subject
- Local-only weak-topic analytics are done:
  - Home snapshot
  - dedicated `/insights` page
- PWA/offline support is done for:
  - shell
  - manifest/search/detail shard runtime cache
  - offline fallback page
- Keep full-bank offline opt-in and image hygiene work separate from shell-first offline.
- Mock mode is now enabled, as startup and trust baselines are mostly achieved.

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
- Lighthouse targets are met locally
- practice search is shipped
- the remaining notable platform debt is remote-image cleanup inside question HTML

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
