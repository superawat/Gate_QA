# GateQA Agent Instructions & Coding Standards

Welcome to the **GateQA** workspace (`gateqa.in`).
This document outlines core principles, architecture standards, and the LLM memory protocol for all AI coding agents.

---

## 1. Fast Context Loading & Memory Protocol

Before doing research or writing code:
1. **Read `.llm-memory/INDEX.md`**: Snapshots of project topology, recent decisions, progress, and UI/pipeline patterns.
2. **Check `.agents/skills/`**:
   - `supabase/`: Guidelines and rules for Supabase SDK, Auth, and Cloud Sync.
   - `supabase-postgres-best-practices/`: SQL performance, indexing, and Row Level Security (RLS) standards.
   - `baseline-ui/`: Anti-slop UI standards, high information density, tabular numbers, and fast interactions.
   - `better-typography/`: Line-length measure caps, tabular numerals, semantic scale, and typography hierarchy.
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
* **Immutable Question Identity (`question_uid`):**
  - Internal primary keys (e.g. `pp:me:2018:q57` or `go:333214`) must **NEVER** change. User progress, notes, bookmarks, answer keys, and Supabase cloud records are keyed by `question_uid`.
  - Canonical question display identity and official paper renumbering (e.g., GA Q1–10 vs Technical Q1–55) are strictly handled in the view layer via `src/utils/branchQuestionIdentity.js`.
* **Selected-Branch Data Isolation & Standalone Resolution:**
  - Users select $\le 2$ examination branches (DEC-177). Memory and storage strictly isolate loaded banks to enrolled branches.
  - Standalone direct question navigation (`/practice/question/:questionUid`) dynamically resolves detail shards on-demand via `BranchQuestionService.loadDetailShard` or `DaQuestionService.ensureQuestionDetail` without polluting or modifying enrolled branch preferences.
* **Static Fast-Delivery Model:**
  - Question detail shards, search indices, and SEO pages are pre-rendered at build time (`scripts/build-public-artifacts.mjs` and `scripts/prerender-seo-pages.mjs`).
  - The frontend is served as a static SPA on GitHub Pages / root domain `gateqa.in`.

---

## 3. Technology Stack & Rules

* **Frontend:** React 18 (Vite SPA), React Router v6, Tailwind CSS & Vanilla CSS design tokens.
* **Backend / Cloud Backup:** Supabase PostgreSQL ($0/mo Free Tier via `@supabase/supabase-js`).
* **Icons:** `react-icons` (Fi, Fa). Never use raw emojis for core UI actions.
* **Typography:** `DM Serif Display` (`--font-display`) for editorial titles and brand headers; sans-serif for stems and math.
* **Testing:** Vitest for unit tests (`npm run test:unit`), Playwright for E2E (`npm run test:e2e`), TypeScript for type checking (`npm run typecheck`).
* **No Commits / No Merges:** Only commit or merge git branches when explicitly requested by the user.

---

## 4. Discussion Linking & Detailed Solution Standards

* **Authentic GateOverflow Subdomain Routing:**
  - Discussion links must route strictly to verified branch subdomains (`src/utils/solutionLink.js`):
    - Mechanical Engineering (`me`) $\to$ `https://me.gateoverflow.in`
    - Electrical Engineering (`ee`) $\to$ `https://ee.gateoverflow.in`
    - Electronics & Communication (`ec`) $\to$ `https://ec.gateoverflow.in`
    - Civil Engineering (`ce`) $\to$ `https://civil.gateoverflow.in`
    - Computer Science (`cse`) & Data Science (`da`) $\to$ `https://gateoverflow.in`
* **In-Card Discussion Button:**
  - The discussion link lives strictly inside the `DetailedSolutionView.jsx` card header on the right side.
  - The main bottom action bar remains clean: `[Submit Answer] [Tray] | [Detailed Solution] [Ask AI] [Previous] [Next]`, with zero external solution button clutter.
* **Universal Detailed Solution Access & MTA Clarity:**
  - The `Detailed Solution` button is active for all questions (unlocked upon attempt). If a question does not yet have a parsed step-by-step mathematical derivation, it renders a polite placeholder with a direct discussion link and report issue flag.
  - **MTA (Marks to All) Questions Must Retain Full Derivations:** The primary purpose of detailed solutions is pedagogical clarity—explaining how the problem operates, breaking down each option/step, and demonstrating why an ambiguity or error led to the MTA status. NEVER replace authentic derivations with lazy generic stubs like *"marks were given to all for this question / Option MTA"* without showing the mathematical or conceptual reasoning.

---

## 5. Key Directory Map

* `src/contexts/`: Global state (`AuthContext`, `FilterContext`, `MockTestContext`, `SessionContext`).
* `src/utils/`: Core utilities (`cloudSyncManager.js`, `syncQueue.js`, `practiceProgress.js`, `mockTest.js`, `branchQuestionIdentity.js`, `solutionLink.js`).
* `src/components/QuestionDetail/`: Question presentation & derivation (`DetailedSolutionView.jsx`, `Question.jsx`).
* `src/components/AnswerPanel/`: Solution action bar & keypad (`AnswerPanel.jsx`).
* `docs/`: Master architectural documents (`ARCHITECTURE.md`, `DATABASE.md`, `TRACKER.md`, `QUESTION_DATA_CORRECTION_RUNBOOK.md`, `QUESTION_JSON_RESOLUTION_PLAN.md`, `CHANGELOG.md`).
* `.llm-memory/`: Distilled summaries for fast LLM retrieval.

---

## 6. Question & Answer Maintenance Protocol

Whenever fixing question answers, converting question types (MCQ/MSQ/NAT/MTA), repairing formulas/options, or resolving taxonomy/diagram issues:
1. **Follow the Runbook & Resolution Plan**: Refer to [`docs/QUESTION_DATA_CORRECTION_RUNBOOK.md`](file:///docs/QUESTION_DATA_CORRECTION_RUNBOOK.md) and [`docs/QUESTION_JSON_RESOLUTION_PLAN.md`](file:///docs/QUESTION_JSON_RESOLUTION_PLAN.md) for the 6-phase protocol, 6 JSON problem archetypes, and exact file checklists.
2. **Patch Authoritative Store**: Always update `data/answers/manual-answers-patch-v1.json`, `answers_by_question_uid_v1.json` (both `data/` and `public/data/`), runtime answer indices (`public/data/answers/`), and `public/questions-with-answers.json`.
3. **Rebuild Static Shards**: Run `node scripts/precompute-subtopics.mjs && node scripts/build-public-artifacts.mjs`.
4. **Add Regression Tests**: Add test cases in `src/utils/evaluateAnswer.test.js` and verify with `npm run test:unit`.
5. **Sync Memory & Changelog**: Log changes in `docs/CHANGELOG.md`, `.llm-memory/decisions.md` (DEC-XXX), `.llm-memory/progress.md`, and `.llm-memory/bugs.md`.
