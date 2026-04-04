# Docs Index

This folder is the source of truth for engineering documentation in GateQA.

## Read first

1. `ARCHITECTURE.md`
2. `FRONTEND_GUIDE.md`
3. `KNOWN-LIMITATIONS.md`
4. `DATA-POLICY.md`
5. `TESTING.md`

## Full map

- `ARCHITECTURE.md`
  - runtime architecture, 4-layer init model, context split
- `REPO_STRUCTURE.md`
  - filesystem layout and ownership map
- `FRONTEND_GUIDE.md`
  - filter behavior, hook contract, ProgressManager UX
- `DATA_PIPELINE.md`
  - historical repairs plus scrape/enrich/answers/validation/precompute flow
- `DEPLOYMENT.md`
  - build/deploy chain and workflow behavior
- `TESTING.md`
  - automated + manual QA strategy
- `CONTRIBUTING.md`
  - development guardrails and release bump rules
- `CHANGELOG.md`
  - versioned release notes
- `KNOWN-LIMITATIONS.md`
  - intentional tradeoffs and known false negatives
- `DATA-POLICY.md`
  - persistence, backup, and transfer policy
- `QA_HARDENING_CHECKLIST.md`
  - release hardening checklist
- `ROADMAP_AND_DECISIONS.md`
  - future features, priorities, and product/technical decisions
- `BUG_BACKLOG.md`
  - open bugs, likely regressions, and triage notes
- `PLATFORM_HARDENING_ALL_UPDATES.txt`
  - hardening record log

## Maintenance rule

Whenever behavior, scripts, workflows, or contracts change, update the relevant docs file in the same PR.
Question-bank imports/repairs and `INIT_CACHE_VERSION` bumps count as behavior changes for this rule.
