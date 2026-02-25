# GATE QA

Extensive, searchable, and filterable GATE CSE previous-year question bank — 3,400+ questions from 1987 to 2025, with automated ingestion for 2026 onward.

## Live demo

https://superawat.github.io/Gate_QA/

## Key features

- Full-screen filter workflow (year set, year range, subject, subtopic, type, progress)
- Scoped subtopic filtering with subject/subtopic consistency guards
- Deep-link support (`?question=<uid>` plus filter query params)
- Solved/bookmarked progress persistence in localStorage
- ProgressManager in sidebar:
  - Export JSON backup
  - Export enriched CSV (analysis only)
  - Import JSON with Merge/Replace confirmation
- Built-in draggable scientific calculator (`Ctrl+K`)
- Math rendering with MathJax and content sanitization via DOMPurify
- Automated GATE question pipeline for 2026+ (FEAT-003)

## Tech stack

- React 18
- Vite
- Tailwind CSS
- Vitest
- GitHub Pages (static hosting)
- GitHub Actions (CI/CD + automated data pipeline)

## Quick start

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Development

```bash
npm start
```

`npm start` runs precompute first:

- `scripts/precompute-subtopics.mjs`
- calculator asset sync
- Vite dev server

### Build

```bash
npm run build
```

Build pipeline includes:

1. precompute subtopic lookup
2. calculator sync to `public/`
3. Vite build
4. `.nojekyll` creation
5. calculator sync to `dist/`

### Preview

```bash
npm run serve
```

## Testing

```bash
npm run test:unit
npm run qa:validate-data
```

Current unit suite status: 24 passing tests.

## Automated Data Pipeline (FEAT-003)

Starting with GATE 2026, new questions are automatically scraped, normalised, answer-backfilled, merged, validated, and deployed via a GitHub Actions workflow.

- **Schedule:** April 1 and October 1 (configurable via cron)
- **Manual trigger:** `workflow_dispatch` with optional `force_year` input
- **Failure safety:** Live site remains on last successful deploy; a GitHub Issue is auto-created on failure

Pipeline scripts live in `scripts/pipeline/` and are documented in `docs/DATA_PIPELINE.md`.

## Documentation

See `docs/README.md` for full documentation map, including:

- `docs/ARCHITECTURE.md` — system architecture and data flow
- `docs/DATA_PIPELINE.md` — historical data context, forward pipeline, crawl policy
- `docs/REPO_STRUCTURE.md` — complete repository layout
- `docs/DEPLOYMENT.md` — CI/CD and manual deploy instructions
- `docs/TESTING.md` — test suites and QA checklist
- `docs/CONTRIBUTING.md` — contribution guidelines

## Important notes

- `src/generated/subtopicLookup.json` is generated and git-ignored.
- Do not hand-edit generated lookup files.
- Known limitation: to prevent subtopic contamination from scrape tags, each question currently keeps at most one canonical subtopic (TECH-DEBT-001).
- Historical Python scripts (pre-2026 data prep) have been archived on branch `archive/pre-cleanup-2026-02-26`.

## Contributing

See `docs/CONTRIBUTING.md`.
