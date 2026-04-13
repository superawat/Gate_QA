# AGENTS.md — LLM Bootstrap Guide

> **Read this file first.** It tells you what this project is, where context lives, and how to keep it fresh.

## Quick identity

- **Project:** GateQA — GATE CS Past Year Question practice platform
- **Stack:** React 18 SPA, Vite, GitHub Pages, Tailwind + vanilla CSS, Vitest + Playwright
- **No backend.** Static-first, local-first.

## Context loading order (read these files in sequence)

| Step | File | Purpose | Token cost |
|------|------|---------|------------|
| 1 | `AGENTS.md` (this file) | Bootstrap: what/where/how | ~200 |
| 2 | `.llm-memory/INDEX.md` | Index of distilled context notes | ~100 |
| 3 | `.llm-memory/project.md` | Stack, routes, invariants, constraints | ~300 |
| 4 | `.llm-memory/patterns.md` | Architecture, UI, testing patterns to preserve | ~200 |
| 5 | `.llm-memory/progress.md` | What's shipped, what's open | ~200 |
| 6 | `.llm-memory/bugs.md` | Open bugs, active risks, recent closures | ~150 |

**Total bootstrap: ~1,150 tokens** — enough to orient on any task without reading full docs.

### When to read more

| Need | Read |
|------|------|
| Pipeline/data questions | `.llm-memory/domain/pipeline.md` |
| UI/routing questions | `.llm-memory/domain/ui.md` |
| Deep architecture details | `docs/ARCHITECTURE.md` |
| Full testing guide | `docs/TESTING.md` |
| Frontend contracts | `docs/FRONTEND_GUIDE.md` |
| Task backlog | `plan2026.md` |
| Repo file map | `docs/REPO_STRUCTURE.md` |
| Change history | `docs/CHANGELOG.md` |
| Bug history | `docs/BUG_BACKLOG.md` |

## Do NOT Touch (without explicit user instruction)

- Split contexts (`useFilterState`/`useFilterActions`)
- Session queue logic
- Answer resolution chain
- Deep-link/URL contract
- Progress import/export
- GATE pipeline scripts
- Public parity gate
- Calculator widget
- Page routing
- `MAX_SUBTOPICS_PER_QUESTION = 1`

## Task execution workflow

```
1. READ   → AGENTS.md + .llm-memory/ (fast context)
2. PLAN   → Read plan2026.md for current task priorities
3. CHECK  → Read relevant docs/ files for full contracts BEFORE editing
4. DO     → Implement changes
5. TEST   → npm run test:unit + npm run build (mandatory guards)
```

> **Note:** The user will manually update `.llm-memory/` and `docs/` to save tokens. Do not update them automatically.

## Guard rails (run after every code change)

```bash
npm run test:unit          # Must pass
npm run build              # Must succeed
```

## Useful commands

```bash
npm start                  # Dev server (auto-precomputes + builds artifacts)
npm run test:unit          # 173 unit tests
npm run test:e2e           # 15 Playwright E2E tests
npm run build              # Production build to dist/
npm run precompute         # Regenerate subtopicLookup.json
npm run build:public-artifacts  # Regenerate manifest, search index, detail shards
npm run qa:validate-data          # Data integrity gate
npm run qa:validate-public-parity # Public artifact count parity
npm run qa:validate-bundle-budget # Chunk size limits
npm run qa:validate-landing-network # Landing network requests
npm run analyze:bundle     # Bundle visualizer (stats.html)
```
