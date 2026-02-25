# Docs Index

This folder is the source of truth for engineering documentation in GateQA.

## Read First

1. `ARCHITECTURE.md`
2. `FRONTEND_GUIDE.md`
3. `DATA_PIPELINE.md`
4. `DEPLOYMENT.md`
5. `TESTING.md`

## Full Document Map

- `ARCHITECTURE.md`
  - Runtime architecture, state model, URL contract, invariants
- `REPO_STRUCTURE.md`
  - Current filesystem map and ownership guide
- `FRONTEND_GUIDE.md`
  - UI behavior, filters, persistence, deep-link mechanics
- `DATA_PIPELINE.md`
  - Scraper + answer ETL + integrity/reporting flow
- `DEPLOYMENT.md`
  - Build/deploy model, workflow behavior, production checks
- `TESTING.md`
  - Unit/pipeline/manual QA strategy and gates
- `CONTRIBUTING.md`
  - Contribution standards and review priorities
- `CHANGELOG.md`
  - Versioned change history
- `QA_HARDENING_CHECKLIST.md`
  - Release hardening checklist by risk pillar
- `PLATFORM_HARDENING_ALL_UPDATES.txt`
  - Consolidated hardening implementation record

## Maintenance Rule

Whenever behavior, scripts, workflows, or data contracts change, update the relevant file in this folder in the same PR.
