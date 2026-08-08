# GateQA Agent Instructions & Coding Standards

Welcome to the **GateQA** workspace (`gateqa.in`).
This document outlines core principles, architecture standards, and the LLM memory protocol for all AI coding agents.

---

## 1. Fast Context Loading & Memory Protocol

Before doing research or writing code:
1. **Read `.llm-memory/INDEX.md`**: Contains quick snapshots of project topology, recent decisions, progress, and UI/pipeline patterns.
2. **Check `.agents/skills/`**:
   - `supabase/`: Guidelines and rules for Supabase SDK, Auth, and Cloud Sync.
   - `supabase-postgres-best-practices/`: SQL performance, indexing, and Row Level Security (RLS) standards.
   - `find-skills/`: Community skill discovery helper.
3. **Keep Docs & Memory in Sync**: Whenever modifying core data contracts, UI shells, or auth flows, update the corresponding `docs/` file and `.llm-memory/` note.

---

## 2. Architecture Invariants (Non-Negotiable)

* **Local-First & Zero Friction:**
  - `localStorage` is ALWAYS the primary read/write store.
  - The app works 100% offline. Guest mode is the permanent default; no login is ever forced.
* **Zero Data Loss:**
  - When syncing with the cloud, the sync engine uses an **additive-only union-merge algorithm** (`src/utils/cloudSyncManager.js`).
  - Pre-merge snapshots (`gate_qa_backup_<timestamp>`) are taken locally before any merge.
  - Signing out NEVER deletes local user data.
* **Static Fast-Delivery Model:**
  - Question detail shards, search indices, and SEO pages are pre-rendered at build time (`scripts/build-public-artifacts.mjs` and `scripts/prerender-seo-pages.mjs`).
  - The frontend is served as a static SPA on GitHub Pages / root domain `gateqa.in`.

---

## 3. Technology Stack & Rules

* **Frontend:** React 18 (Vite SPA), React Router v6, Tailwind CSS & Vanilla CSS design tokens.
* **Backend / Cloud Backup:** Supabase PostgreSQL ($0/mo Free Tier via `@supabase/supabase-js`).
* **Icons:** `react-icons` (Fi, Fa). Never use raw emojis for core UI actions.
* **Testing:** Vitest for unit tests (`npm run test:unit`), Playwright for E2E (`npm run test:e2e`), TypeScript for type checking (`npm run typecheck`).
* **No Commits / No Merges:** Only commit or merge git branches when explicitly requested by the user.

---

## 4. Key Directory Map

* `src/contexts/`: Global state (`AuthContext`, `FilterContext`, `MockTestContext`, `SessionContext`).
* `src/utils/`: Core utilities (`cloudSyncManager.js`, `syncQueue.js`, `practiceProgress.js`, `mockTest.js`).
* `src/components/Auth/`: Authentication UI (`AuthModal.jsx`, `UserProfileMenu.jsx`, `GuestDataPrompt.jsx`).
* `docs/`: Master architectural documents (`ARCHITECTURE.md`, `DATABASE.md`, `PHASE4_TESTING_REPORT.md`, `CHANGELOG.md`).
* `.llm-memory/`: Distilled summaries for fast LLM retrieval.
