# GATE QA

Extensive, searchable, and filterable GATE CSE previous-year question bank from 1987 to 2026, with a forward-ingestion pipeline for new exam years.

Published data count/status is generated into `docs/generated/DATA_STATUS.md` so docs do not have to hardcode question totals.

## Live link

https://gateqa.in/

## Key features

- Full-screen filter workflow (year set, year range, subject, subtopic, type, progress)
- Scoped subtopic filtering with subject/subtopic consistency guards
- Deep-link support (`?question=<uid>` plus filter query params)
- Solved/bookmarked progress persistence in localStorage
- Full-length Mock Test mode with timed exam environment and performance summary
- Standalone Aptitude practice for English, Quant, and Reasoning with isolated progress
- Public user manual at `/manual`
- ProgressManager in sidebar:
  - Export JSON backup
  - Export enriched CSV (analysis only)
  - Import JSON with Merge/Replace confirmation
- Built-in draggable scientific calculator (`Ctrl+K`)
- Math rendering with MathJax and content sanitization via DOMPurify
- Generated public manifest and lightweight search index for landing/search work
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
- `scripts/build-public-artifacts.mjs`
- calculator asset sync
- Vite dev server

### Build

```bash
npm run build
```

Build pipeline includes:

1. precompute subtopic lookup
2. generated public artifact refresh
3. calculator sync to `public/`
4. Vite build
5. `.nojekyll` creation
6. calculator sync to `dist/`

### Preview

```bash
npm run serve
```

## Testing

```bash
npm run test:unit
npm run qa:validate-data
npm run qa:validate-public-parity
```

For aptitude data changes, also run:

```bash
npm run qa:validate-aptitude
npm run qa:verify-aptitude
npm run qa:validate-aptitude-images
```

## Automated Data Pipeline (FEAT-003)

Starting with GATE 2026, new questions are scraped, normalised, answer-backfilled, merged, validated, and deployed through the FEAT-003 pipeline.

- **Schedule:** April 1-5 and October 1-5 via `.github/workflows/gate-question-pipeline.yml`
- **Manual trigger:** `workflow_dispatch` with optional `force_year` input
- **Manual fallback:** if the scheduled retry window still misses the release or a manual intervention is needed, run the pipeline locally from `scripts/pipeline/` and then rebuild/deploy
- **Failure safety:** Live site remains on last successful deploy; a GitHub Issue is auto-created on failure

Current status:

- GATE 2026 question import completed on 2026-04-04 with all 130 questions captured (65 per set)
- Historical paper-count repair completed on 2026-04-04; audited papers from 2010 onward now resolve to 65 questions each
- public data status snapshot now lives in `docs/generated/DATA_STATUS.md`, and public parity is now CI-guarded

Pipeline scripts live in `scripts/pipeline/` and are documented in `docs/DATA_PIPELINE.md`.

## Aptitude Data Pipeline

The aptitude bank is built from structured AptitudeBank intake only. The retired local PDF/OCR corpus is not part of the project anymore.

Current public aptitude state:

- `16,873` questions across English, Quant, and Reasoning
- compact `public/aptitude-search-index.json`
- detail shards under `public/data/aptitude/{subject}/{subtopic}.json`
- local mirrored images under `public/images/aptitude/`
- local-only review reports under ignored `artifacts/review/`

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
- After replacing `public/questions-with-answers.json`, bump `INIT_CACHE_VERSION` in `src/services/QuestionService.js` so browsers drop stale localStorage snapshots.

## Contributing

See `docs/CONTRIBUTING.md`.
