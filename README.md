# GATE QA

Extensive, searchable, and filterable GATE CSE previous-year question bank.

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

## Tech stack

- React 18
- Vite
- Tailwind CSS
- Vitest
- GitHub Pages (static hosting)

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

`npm start` now runs precompute first:

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

## Documentation

See `docs/README.md` for full documentation map.

## Important notes

- `src/generated/subtopicLookup.json` is generated and git-ignored.
- Do not hand-edit generated lookup files.
- Known limitation: to prevent subtopic contamination from scrape tags, each question currently keeps at most one canonical subtopic.

## Contributing

See `docs/CONTRIBUTING.md`.
