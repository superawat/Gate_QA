# Deployment

GateQA deploys as a static site to GitHub Pages.

Live URL: `https://superawat.github.io/Gate_QA/`

## Build artifact requirements

- `dist/.nojekyll`
- `dist/calculator/calculator.html`
- `dist/questions-with-answers.json`
- `dist/data/answers/*.json`
- `dist/logo.png`

## Build command

```bash
npm run build
```

Current build chain:

1. `node scripts/precompute-subtopics.mjs`
2. `node scripts/deployment/sync-calculator.mjs --public`
3. `vite build`
4. `node scripts/deployment/ensure-nojekyll.mjs`
5. `node scripts/deployment/sync-calculator.mjs --dist`

## Hosting configuration

- `vite.config.js` base must be `/Gate_QA/`.
- `package.json` homepage is `https://superawat.github.io/Gate_QA/`.
- runtime static fetches use `import.meta.env.BASE_URL`.

## CI/CD workflows

### `.github/workflows/node.js.yml`

- triggers: push/pull_request on `main`
- runs `npm ci` and `npm run build`
- verifies `.nojekyll` and calculator artifact
- deploys to `gh-pages` on push to `main`

### `.github/workflows/scheduled-maintenance.yml`

- trigger: every 3 months + manual
- refreshes scrape/merge data
- runs non-strict integrity report
- commits data changes only when needed
- builds/deploys only when changes exist

### `.github/workflows/scraper.yml`

- trigger: every 4 months + manual
- scrape and merge
- open PR if question corpus changed

## Manual deploy

```bash
npm run build
npx gh-pages -d dist
```

Alternative:

```bash
git subtree push --prefix dist origin gh-pages
```

## Pre-deploy checklist

- [ ] `npm run build` succeeds.
- [ ] Precompute output was generated (`src/generated/subtopicLookup.json` in build workspace).
- [ ] `dist/.nojekyll` exists.
- [ ] `dist/calculator/calculator.html` exists.
- [ ] required question/answer JSON files exist in `dist`.
- [ ] base path and live URL are aligned.

## Post-deploy smoke checks

- [ ] app loads without blank screen
- [ ] question data fetch completes
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

- verify `base: '/Gate_QA/'` in `vite.config.js`

### Missing generated lookup

- run `npm run precompute`
- confirm `src/generated/subtopicLookup.json` exists in local workspace

### Calculator missing

- verify root `calculator/` exists
- rerun `npm run build`

### Missing `.nojekyll`

- rerun `npm run build` (helper script creates it)
