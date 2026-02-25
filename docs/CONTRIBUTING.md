# Contributing

This document defines contribution expectations for GateQA.

## Scope and Philosophy

- Keep runtime static-first (no backend assumptions in frontend code).
- Prefer deterministic IDs and canonical normalization paths.
- Preserve URL/deep-link and progress persistence behavior when changing filters.

## Branch Naming

Use one of:

- `feat/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `refactor/<short-description>`
- `chore/<short-description>`

Examples:

- `feat/question-export-state`
- `fix/deep-link-filter-sync`
- `docs/update-hardening-guide`

## Commit Message Style

Use conventional prefix:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `chore: ...`
- `test: ...`

Rules:

- Imperative mood (`add`, `fix`, `update`)
- Lowercase summary after prefix
- One logical change per commit

## Local Quality Gates Before PR

Run what applies to your change:

```bash
npm run test:unit
npm run build
npm run qa:validate-data
python -m pytest tests/answers -q
```

For performance-sensitive UI changes:

```bash
npm run lighthouse:mobile
```

## PR Template (Recommended)

```markdown
## What
One-sentence change summary.

## Why
Bug, feature need, or maintenance reason.

## How
Key implementation decisions and touched modules.

## Validation
- [ ] npm run test:unit
- [ ] npm run build
- [ ] npm run qa:validate-data
- [ ] Manual checks for affected UI paths

## Risks / Follow-ups
Known caveats and deferred items.
```

## High-Risk Areas (Read Before Editing)

- Filter state and URL contract: `src/contexts/FilterContext.jsx`
- Deep-link question synchronization: `src/App.jsx`
- Question normalization and subject resolution: `src/services/QuestionService.js`
- Answer join order and unsupported fallback: `src/services/AnswerService.js`
- Attempt evaluation semantics (MCQ/MSQ/NAT): `src/utils/evaluateAnswer.js`
- Build/deploy scripts: `scripts/deployment/*.mjs`
- Data integrity gate logic: `scripts/qa/validate-data.js`

## Required Invariants

Do not merge changes that break these:

- `hideSolved` and `showOnlySolved` remain mutually exclusive.
- `question` query param is preserved during filter URL writes.
- `clearFilters()` restores full default filter state.
- Built artifact contains `.nojekyll` and synced calculator assets.
- `vite.config.js` base remains aligned with Pages path.

## Documentation Rules

- Update relevant files in `docs/` with every behavior/config change.
- `docs/` is tracked in git and should stay code-accurate.
- Keep command names and paths exact (copy from `package.json` and filesystem).

## Bug Report Format

```markdown
Problem:
Expected:
Actual:
Repro steps:
1.
2.
3.
Browser/OS:
Severity:
Evidence (screenshots/logs):
```

## Review Focus

When reviewing PRs, prioritize:

1. Behavioral regressions in filtering/deep-link/persistence.
2. Incorrect data assumptions in normalization/join logic.
3. Missing validation coverage or stale docs.
4. Build/deploy breakage risk.
