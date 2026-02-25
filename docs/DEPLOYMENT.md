# Deployment

GateQA deploys as a static site to GitHub Pages.

Live URL: `https://superawat.github.io/Gate_QA/`

## Build Artifact

- Output directory: `dist/`
- Required marker: `dist/.nojekyll`
- Required static assets:
  - `dist/questions-with-answers.json`
  - `dist/data/answers/*.json`
  - `dist/calculator/calculator.html`
  - `dist/logo.png`

## Build Command

```bash
npm run build
```

Current build pipeline:

1. `node scripts/deployment/sync-calculator.mjs --public`
2. `vite build`
3. `node scripts/deployment/ensure-nojekyll.mjs`
4. `node scripts/deployment/sync-calculator.mjs --dist`

## Hosting Configuration

- Vite base path in `vite.config.js` must be `/Gate_QA/`.
- `homepage` in `package.json` is `https://superawat.github.io/Gate_QA/`.
- Runtime fetches use `import.meta.env.BASE_URL`.

## CI/CD Workflows

### `.github/workflows/node.js.yml`

- Triggers: push and PR on `main`
- Runs:
  - `npm ci`
  - `npm run build`
  - verifies `.nojekyll` and calculator artifact
- Deploys to `gh-pages` on push to `main`

### `.github/workflows/scheduled-maintenance.yml`

- Trigger: every 3 months (`0 2 1 */3 *`) + manual dispatch
- Runs scraper and merge scripts
- Generates integrity report (`--no-strict`)
- Commits/pushes updated data to `main` only when there are changes
- Builds and deploys to `gh-pages` only when data changed

### `.github/workflows/scraper.yml`

- Trigger: every 4 months (`0 0 1 */4 *`) + manual dispatch
- Runs scrape + merge
- Opens PR with updated question bank when diff exists

## Manual Deployment (if needed)

```bash
npm run build
npx gh-pages -d dist
```

Alternative:

```bash
git subtree push --prefix dist origin gh-pages
```

## Pre-Deploy Checklist

- [ ] `npm run build` completes without error.
- [ ] `dist/.nojekyll` exists.
- [ ] `dist/calculator/calculator.html` exists.
- [ ] `dist/questions-with-answers.json` exists and is non-empty.
- [ ] `dist/data/answers/answers_master_v1.json` exists.
- [ ] `dist/data/answers/answers_by_question_uid_v1.json` exists.
- [ ] `dist/data/answers/answers_by_exam_uid_v1.json` exists.
- [ ] `dist/data/answers/unsupported_question_uids_v1.json` exists.
- [ ] Base path and deploy URL are aligned (`/Gate_QA/`).

## Post-Deploy Smoke Checks

- [ ] Home URL loads without blank screen.
- [ ] Question data loads (no persistent loading state).
- [ ] Filter modal opens and closes.
- [ ] Share link copies and opens same question.
- [ ] Calculator opens via button and `Ctrl+K`.

## Performance Regression Gate (Optional but Recommended)

```bash
npm run build
npm run lighthouse:mobile
```

Lighthouse config (`lighthouserc.json`) currently asserts:

- performance: warning if score < 0.80
- accessibility: error if score < 0.95
- LCP warning if > 3500 ms
- CLS error if > 0.1

## Troubleshooting

### JS/CSS/JSON 404 after deploy

- Cause: incorrect `base` path.
- Fix: ensure `vite.config.js` has `base: '/Gate_QA/'`.

### Calculator does not load

- Cause: sync script did not copy calculator assets.
- Fix: verify root `calculator/` exists, rerun `npm run build`.

### Data fetch fails

- Cause: missing files in `public/` before build or stale deploy.
- Fix: verify source JSON files exist in `public/`, rebuild, redeploy.

### `.nojekyll` missing

- Cause: build helper not run.
- Fix: rerun `npm run build`; helper script writes marker automatically.
