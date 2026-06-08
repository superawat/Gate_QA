# Deployment

GateQA deploys as a static site to GitHub Pages.

Live URL: `https://gateqa.in/`

## Build artifact requirements

- `dist/.nojekyll`
- `dist/calculator/calculator.html`
- `dist/question-bank-manifest.json`
- `dist/question-search-index.json`
- `dist/question-detail-shards/*.json`
- `dist/questions-with-answers.json`
- `dist/data/answers/*.json`
- `dist/logo.png`

## Build command

```bash
npm run build
```

Current build chain:

1. `node scripts/precompute-subtopics.mjs`
2. `node scripts/build-public-artifacts.mjs`
3. `node scripts/deployment/sync-calculator.mjs --public`
4. `vite build`
5. `node scripts/deployment/ensure-nojekyll.mjs`
6. `node scripts/deployment/sync-calculator.mjs --dist`

## Hosting configuration

- `vite.config.js` base is `/`.
- `package.json` homepage is `https://gateqa.in/`.
- runtime static fetches use `import.meta.env.BASE_URL`.

## CI/CD workflows

### `.github/workflows/node.js.yml`

- triggers: push/pull_request on `main`
- uses the Node 24 baseline (`actions/checkout@v6`, `actions/setup-node@v6`, `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`)
- runs `npm ci`, `npm run test:unit`, `npm run qa:validate-data`, `npm run build`, and `npm run qa:validate-public-parity`
- verifies `.nojekyll`, calculator, and generated public artifacts
- deploys to `gh-pages` on push to `main`

### `.github/workflows/gate-question-pipeline.yml`

- trigger: cron retry window (Apr 1-5, Oct 1-5) + manual with optional `force_year`
- uses the Node 24 baseline (`actions/checkout@v6`, `actions/setup-node@v6`, `actions/github-script@v8`, `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`)
- job timeout is `330` minutes to cover robots-compliant scrape/backfill runs
- 6-stage pipeline: scrape → normalise → answer backfill → merge → validate → build/deploy
- runs `npm run qa:validate-public-parity` before deploying updated artifacts
- see `docs/DATA_PIPELINE.md` for full stage documentation
- auto-creates GitHub Issue on failure; live site remains on last successful deploy
- scheduled retries skip themselves once `nextTargetYear` is ahead of the current calendar year, so the release-window cron does not keep probing the future after a successful import

## Manual deploy

```bash
npm run build
npx gh-pages -d dist
```

Alternative:

```bash
git subtree push --prefix dist origin gh-pages
```

## Manual data refresh deploy

When a year is imported locally instead of through GitHub Actions:

1. run the relevant `scripts/pipeline/*.mjs` stages
2. confirm `audit/validation-report-{year}.json` passes
3. run `npm run build`
4. publish the generated `dist/` folder with the normal GitHub Pages flow

For the exact data-ingestion sequence, use `docs/DATA_PIPELINE.md`.

## Pre-deploy checklist

- [ ] `npm run build` succeeds.
- [ ] generated public artifacts are refreshed (`question-bank-manifest.json`, `question-search-index.json`, `docs/generated/data-status.json`).
- [ ] generated detail shards are refreshed under `public/question-detail-shards/`.
- [ ] if aptitude data changed, `public/aptitude-search-index.json`, `public/data/aptitude/`, and referenced `public/images/aptitude/` are refreshed and aptitude QA gates pass.
- [ ] if this deploy includes a manual data import, `audit/validation-report-{year}.json` shows `passed: true`.
- [ ] Precompute output was generated (`src/generated/subtopicLookup.json` in build workspace).
- [ ] `dist/.nojekyll` exists.
- [ ] `dist/calculator/calculator.html` exists.
- [ ] `dist/question-bank-manifest.json`, `dist/question-search-index.json`, and `dist/question-detail-shards/*.json` exist.
- [ ] required question/answer JSON files exist in `dist`.
- [ ] base path and live URL are aligned.

## Post-deploy smoke checks

- [ ] app loads without blank screen
- [ ] landing loads before practice entry without pulling the full bank on the critical path
- [ ] practice entry fetches the search index and answer lookups without downloading the full bank
- [ ] the first opened practice question resolves from the matching detail shard
- [ ] filters open and apply
- [ ] share deep-link works
- [ ] calculator button and `Ctrl+K` work
- [ ] ProgressManager export/import controls visible in filter sidebar

## Lighthouse check

```bash
npm run build
npm run lighthouse:mobile
```

Current assertions:

- performance >= 0.80 (warn)
- accessibility >= 0.95 (error)
- LCP <= 3500 ms (warn)
- CLS <= 0.1 (error)

## Troubleshooting

### JSON/asset 404s

- verify `base: '/'` in `vite.config.js`

### Missing generated lookup

- run `npm run precompute`
- confirm `src/generated/subtopicLookup.json` exists in local workspace

### Calculator missing

- verify root `calculator/` exists
- rerun `npm run build`

### Missing `.nojekyll`

- rerun `npm run build` (helper script creates it)
