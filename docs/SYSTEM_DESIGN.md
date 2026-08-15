# GateQA System Design & Architecture Specification

> **Platform**: [GateQA (`gateqa.in`)](https://gateqa.in/)  
> **Version**: `1.1.0`  
> **Status**: Living Architectural Baseline  
> **Last Updated**: 2026-08-15  

---

## 1. Executive Summary & Core Architectural Invariants

GateQA is a **local-first, static fast-delivery, offline-capable Single Page Application (SPA)** engineered for GATE Computer Science (CSE), Data Science & AI (DA), and General Aptitude preparation. It provides instantaneous question solving, CBT-grade full-length and topic-wise mock tests, AI-driven performance analytics, and gamification with zero required onboarding friction.

```mermaid
flowchart TB
    subgraph Client["Client Browser (Local-First Runtime)"]
        UI[React 18 SPA / Tailwind CSS / Vanilla Tokens]
        SW[Service Worker - CacheStorage / Offline Fallback]
        State["State Engine (Auth, Filter, MockTest, Session Contexts)"]
        LS[("Primary Store: LocalStorage & SessionStorage")]
        Queue[("Offline Mutation SyncQueue")]
    end

    subgraph StaticDistribution["Static Edge Distribution (GitHub Pages / CDN)"]
        CDN["Static SPA (HTML/JS/CSS Chunks)"]
        Manifest["question-bank-manifest.json"]
        SearchIdx["Search Indices (CS, DA, Aptitude)"]
        Shards["Detail Shards (58 CS, 3 DA, Aptitude)"]
        SEO["3,493 Prerendered Static SEO Pages"]
        Calc["Embedded GATE Calculator Assets"]
    end

    subgraph CloudBackup["Decentralized Cloud Backup (Optional)"]
        SupaAuth["Supabase Auth (Google OAuth & Magic Link)"]
        SupaDB[("Supabase PostgreSQL + Row-Level Security")]
    end

    StaticDistribution -->|HTTP/2 Fetch & Preload| UI
    UI <--> State
    State <-->|Synchronous Read/Write| LS
    State -->|Enqueue Mutations| Queue
    Queue <-->|Additive Union-Merge Sync| SupaDB
    UI <-->|OAuth / Session State| SupaAuth
    SW -.->|Intercept & Cache| StaticDistribution
```

### Core Non-Negotiable Architectural Invariants

1. **Local-First & Zero Friction**:
   - `localStorage` is ALWAYS the primary, zero-latency source of truth for all user progress, answers, bookmarks, notes, test attempts, streaks, and settings.
   - The application functions 100% offline without network connectivity.
   - **Guest Mode is permanent and default**: No user is ever blocked or forced to authenticate to solve questions, take mock tests, or analyze performance.
2. **Zero Data Loss Invariant**:
   - Signing out, clearing cloud sessions, or closing browser tabs **NEVER** purges local user data.
   - Before any cloud merge occurs, an automated local pre-merge snapshot (`gate_qa_backup_<timestamp>`) is written to `localStorage`.
   - Cloud synchronization utilizes an **additive-only union-merge algorithm** (`src/utils/cloudSyncManager.js`) preventing cloud state from truncating or overwriting local study records.
3. **Static Sharded Delivery Model**:
   - All question banks (3,500+ GATE CS, 36,000+ Aptitude, 195+ GATE DA) are pre-indexed, split into discrete shards, and served statically from CDN/GitHub Pages at build time.
   - Zero dynamic database queries are needed for question rendering or filtering.
   - Over 3,493 static SEO HTML pages are pre-rendered at build time with structured JSON-LD schema markups.

---

## 2. High-Level Subsystem Topology & Connections

GateQA is decomposed into 8 tightly integrated subsystems:

```mermaid
graph TD
    subgraph Subsystems["GateQA Subsystems"]
        S1["1. Practice & Solving Subsystem"]
        S2["2. Filter & Multi-Track Engine"]
        S3["3. Mock Test & CBT Simulator"]
        S4["4. Gamification & Analytics Engine"]
        S5["5. Cloud Sync & Auth Subsystem"]
        S6["6. Storage Engine & Sanitizers"]
        S7["7. Ingestion & Build Pipelines"]
        S8["8. External LLM Assistance (AUG-014)"]
    end

    S7 -->|Build-time Artifacts| S2
    S7 -->|Detail Shards & Answers| S1
    S7 -->|Mock Catalogs & Blueprints| S3

    S2 -->|Filtered Question Queue| S1
    S2 -->|Selected Subject Scope| S3

    S1 -->|Record Attempts & Status| S6
    S1 -->|Dispatch Progress Event| S4
    S1 -->|Enqueue Mutations| S5
    S1 -->|Synthesize Structured Prompt| S8

    S8 -->|Read/Write Preference| S6
    S8 -->|Clipboard & Web App Redirect| ExternalLLMs["External LLMs (ChatGPT, Gemini, Claude, DeepSeek, Perplexity)"]

    S3 -->|Completed Exam Attempts| S6
    S3 -->|Mock Scores & Timeline| S4
    S3 -->|Enqueue Test Sync| S5

    S4 -->|Weak Topics & Due Spaced Reviews| S1
    S4 -->|Streak & Heatmap Stats| S6

    S5 <-->|Additive Union-Merge| S6
```

---

## 3. Four-Layer Runtime Initialization Model

To eliminate main-thread blocking and guarantee instantaneous time-to-interactive (TTI), GateQA executes a four-layer initialization pipeline:

```mermaid
sequenceDiagram
    autonumber
    participant Build as Layer 1: Build-Time Precompute
    participant Boot as Layer 2: Boot Sanitization
    participant Cache as Layer 3: LocalStorage Cache
    participant Context as Layer 4: Split Contexts & Services

    Build->>Build: scripts/precompute-subtopics.mjs -> src/generated/subtopicLookup.json
    Build->>Build: scripts/build-public-artifacts.mjs -> Manifest, Search Index, Shards
    
    Note over Boot: User Opens App (index.jsx)
    Boot->>Boot: sanitizeProgressStorage() (Repairs legacy array/map corruption)
    Boot->>Boot: Register Service Worker (public/sw.js in production)
    
    Boot->>Cache: Read gateqa_index_cache_v11
    alt Cache Hit (Valid Version)
        Cache-->>Context: Instant Seed (<5ms)
    else Cache Miss / Outdated
        Context->>Context: Fetch public/question-search-index.json
        Context->>Context: QuestionService._processChunked(rows, chunkSize=500)
        Context->>Cache: Write gateqa_index_cache_v11
    end

    Context->>Context: Mount AuthProvider, FilterProvider, SessionProvider
    Context->>Context: Derive filteredQuestions via Memoized Facet Reducer
```

### Layer Details

| Layer | Responsibility | Key Files | Performance Guarantee |
| :--- | :--- | :--- | :--- |
| **Layer 1: Build-Time Precompute** | Pre-calculates 445+ subtopic aliases, subjects, and regex lookup tables into static JSON. | `scripts/precompute-subtopics.mjs`, `src/generated/subtopicLookup.json` | 0ms runtime regex overhead. |
| **Layer 2: Storage Sanitization** | Self-healing sanitizer runs before React mounts; fixes corrupted JSON, numeric array keys, and restores string arrays. | `src/index.jsx`, `src/utils/storageSanitizer.js` | 100% crash-proof storage boot. |
| **Layer 3: LocalStorage Cache** | Stores chunked search indices under `gateqa_index_cache_v11` and full bank under `gateqa_full_bank_cache_v11`. | `src/services/QuestionService.js`, `src/utils/localStorageState.js` | Sub-5ms instant initial search render. |
| **Layer 4: Split Contexts & Chunking** | Splits state and actions (`FilterStateContext`, `FilterActionsContext`) and yields to main loop with `setTimeout(0)`. | `src/contexts/FilterContext.tsx`, `src/services/QuestionService.js` | Zero long-frame UI freezes. |

---

## 4. Deep Dive: Core Subsystems & Data Flow

### 4.1 Practice & Question Solving Subsystem

The Practice subsystem manages exploration, question rendering, interactive answer input, real-time evaluation, and status updates.

```mermaid
flowchart TD
    A["User navigates to /practice/question/:id or /question/:uid"] --> B[SolvePage.jsx]
    B --> C{Question Track?}
    C -->|GATE CS| D[QuestionService.getQuestionDetail]
    C -->|GATE DA| E[DaQuestionService.getQuestionDetail]
    C -->|Aptitude| F[AptitudeQuestionService.getQuestionDetail]

    D & E & F --> G[Question.jsx Container]
    G --> H[MathRuntime.jsx: KaTeX / MathJax LaTeX Normalization]
    G --> I[AnswerPanel.jsx]

    I --> J{Question Type}
    J -->|MCQ| K[Single Selection Input]
    J -->|MSQ| L[Multi-Selection Input]
    J -->|NAT| M[Numeric Keypad / Text Field]

    K & L & M --> N["User Clicks 'Submit Answer'"]
    N --> O[evaluateAnswer.js: Accurate Evaluation with Tolerance]
    O --> P{Correct?}
    P -->|Yes| Q["FilterContext.toggleSolved() -> Add to Solved List"]
    P -->|No / Yes| R[recordPracticeAttempt: practiceProgress.js]

    R --> S[("Write to LocalStorage (gateqa_progress_v1 / da / apt)")]
    R --> T["Dispatch 'gateqa:progress-updated' Event"]
    R --> U["enqueueChange('SOLVE') -> Offline SyncQueue"]
    T --> V["HomePage.jsx updates Streak, Daily Goal & Heatmap in Real-Time"]
```

#### Key Routing & Tracking Contracts
- **Canonical Route Patterns**:
  - `/practice`: Main question exploration and multi-filter matrix.
  - `/practice/question/:id`: Canonical practice solve view with full queue navigation.
  - `/question/:uid`: Direct universal question URL (aliases `go:1767`, `APT-ENG-0001`, `da:2024:q-probability`).
- **Evaluation Engine (`src/utils/evaluateAnswer.js`)**:
  - **MCQ**: Strict string/choice comparison against single valid key.
  - **MSQ**: Strict multi-set equality check (`Array.from(setA).sort() === Array.from(setB).sort()`).
  - **NAT**: Handles numeric precision, tolerance ranges (`answer - abs <= input <= answer + abs`), and edge cases (e.g. numeric `0` preservation).

---

### 4.2 Filter & Multi-Track Engine

The Filter subsystem handles faceted question search across three distinct tracks without schema collisions:

```mermaid
flowchart LR
    subgraph MultiTrackInput["Input Tracks"]
        CS["GATE Computer Science (3,500+ PYQs)"]
        DA["GATE Data Science & AI (195+ PYQs)"]
        APT["General Aptitude (36,000+ Questions)"]
    end

    subgraph FilterEngine["FilterContext.tsx (Unified Facet Reducer)"]
        Params["useSearchParams (URL Serialization)"]
        Reducer["useMemo Filter Pipeline"]
        Facet1["Track Filter (CSE / DA / Aptitude Toggle)"]
        Facet2["Subject & Subtopic Lookup"]
        Facet3["Exam Year / Set Selector"]
        Facet4["Question Type (MCQ / MSQ / NAT)"]
        Facet5["Status (Solved / Unsolved / Bookmarked)"]
        Facet6["Free-Text In-Memory Search"]
    end

    subgraph Output["Output Views"]
        Grid["ExplorePage Grid / Cards"]
        Queue["SolvePage Ordered Queue"]
        CustomMock["Custom Mock Test Question Pool"]
    end

    MultiTrackInput --> FilterEngine
    Params <--> Reducer
    Reducer --> Facet1 --> Facet2 --> Facet3 --> Facet4 --> Facet5 --> Facet6
    FilterEngine --> Output
```

#### Multi-Track Identity Contract (`src/utils/examTrack.js`)
- **GATE CSE**: UIDs formatted as `go:<id>` or `cse:<year>:<set>:<section>:<qnum>`.
- **GATE DA**: UIDs formatted as `da:<year>:<slug>` or `da:2026:set-1:q1`.
- **Aptitude**: UIDs formatted as `APT-<CATEGORY>-<INDEX>` (e.g. `APT-ENG-0001`, `APT-QA-0120`).

---

### 4.3 Mock Test & CBT Simulator Subsystem (AUG-013 Zero-Data-Loss Architecture)

The Mock Test engine replicates the authentic GATE TCS iON Computer Based Test (CBT) user interface with high-reliability persistence.

```mermaid
flowchart TD
    subgraph MockLifecycle["Mock Test Lifecycle State Machine"]
        S1["1. Setup Stage (?stage=setup)"] -->|Select Paper / Mode / Custom Config| S2["2. Instructions Stage"]
        S2 -->|Confirm Ready| S3["3. Exam Stage (?stage=exam)"]
        S3 -->|Submit / Time Expires| S4["4. Results Stage (?stage=results)"]
    end

    subgraph PersistenceEngine["Dual-Tier Synchronized Storage (v: 5)"]
        Write["writeAttemptStorage()"]
        DualWrite["Simultaneous Write: localStorage & sessionStorage"]
        Backup["Archive Prior Test: gateqa_mock_attempt_backup_v1"]
        Embed["Embed Question Blueprints (Offline Zero-Fetch Restore)"]
        Quota["QuotaExceededError Fallback: Strip Heavy HTML"]
    end

    subgraph RecoveryEngine["Crash-Proof Recovery Pipeline"]
        Read["readAttemptStorage() on Reload / Crash"]
        Collect["Collect Candidates: Session, Local, Backup"]
        TimestampSort["Sort by savedAt Timestamp Descending"]
        Pick["Select Freshest Stored Snapshot"]
        Validate["Validate Embedded Items via isValidEmbeddedQuestion"]
        Resume["Seamless In-Progress Exam Resume (<50ms)"]
    end

    S3 --> Write
    Write --> Backup --> DualWrite --> Embed
    Write -.->|Storage Full| Quota

    Read --> Collect --> TimestampSort --> Pick --> Validate --> Resume --> S3
```

#### Scoring & Evaluation Rules
$$\text{Score} = \sum \text{Correct Marks} - \sum \text{Negative Penalties}$$
- **1-Mark MCQ**: $+1.0$ mark for correct; $-\frac{1}{3}$ mark penalty for incorrect.
- **2-Mark MCQ**: $+2.0$ marks for correct; $-\frac{2}{3}$ mark penalty for incorrect.
- **MSQ / NAT**: $+1.0$ or $+2.0$ marks for correct; **$0.0$ penalty** for incorrect.
- **Unattempted**: $0.0$ marks.

---

### 4.4 Gamification & Learning Analytics Subsystem

```mermaid
flowchart LR
    Attempts["Practice & Mock Attempts (gateqa_progress_v1, da, apt)"] --> Analyzer["weakTopicAnalyzer.js"]
    
    subgraph Calculations["Derived Metrics"]
        Aura["Aura XP Calculation"]
        Streak["Active Streak & Longest Streak"]
        Freeze["Streak Freeze State (gateqa_streak_freeze_v1)"]
        WeakTopics["Subtopic Accuracy Matrix (Weighted)"]
        SpacedRep["Spaced Repetition Review Queue (1, 3, 7, 14, 30, 60 days)"]
    end

    subgraph UIComponents["Reactive UI Surfaces"]
        Banner["StreakBanner.jsx (Fire Icon, Current Streak, 0/5 Daily Goal)"]
        Heatmap["ActivityHeatmap.jsx (12w / 26w / 52w Timeline Grid)"]
        Insights["InsightsPage.jsx (Subject Radar, Weak Topic Actionables)"]
    end

    Attempts --> Calculations
    Calculations --> UIComponents
    
    Event["'gateqa:progress-updated' Event"] -->|Same-Tab Reactivity| UIComponents
```

---

### 4.5 Cloud Sync & Supabase Backend Subsystem

GateQA uses Supabase PostgreSQL for cloud sync. The cloud sync architecture operates on an **additive-only union-merge algorithm**:

```mermaid
sequenceDiagram
    autonumber
    participant Local as Browser LocalStorage
    participant Queue as syncQueue.js
    participant Sync as cloudSyncManager.js
    participant Cloud as Supabase PostgreSQL + RLS

    Note over Local: User Solves Question / Adds Bookmark
    Local->>Local: Write local state
    Local->>Queue: enqueueChange('SOLVE', { questionUid, evaluation })

    Note over Sync: Network Online & Authenticated
    Sync->>Local: Create Snapshot: gate_qa_backup_<timestamp>
    Sync->>Cloud: Fetch remote user_progress row
    Sync->>Sync: Compute Additive Union-Merge:
    Note over Sync: Solved: Set.union(local, cloud)<br/>Bookmarks: Set.union(local, cloud)<br/>Notes: Longest Note Wins<br/>Mock History: Deduplicated chronologically<br/>Progress Records: Merged attempt timeline

    Sync->>Cloud: Upsert merged payload (Tier 1: Full DA + Aptitude)
    alt Schema Column Error (PGRST204)
        Sync->>Cloud: Tier 2 Fallback (Preserve Aptitude, omit DA)
        alt Legacy Schema Error
            Sync->>Cloud: Tier 3 Fallback (Core baseline)
        end
    end

    Sync->>Local: Write merged result to LocalStorage
    Sync->>Queue: Drain processed mutations
    Sync->>Local: Dispatch 'gateqa:sync-complete' Event
```

---

### 4.6 External LLM Assistance Subsystem (AUG-014)

GateQA provides a lightweight, zero-cost, privacy-first external AI assistance layer in standard Practice mode (`/practice/question/:id`). It constructs a pedagogical, step-by-step reasoning prompt and orchestrates a 1-click redirect / clipboard buffer to the student's chosen AI platform:

```mermaid
flowchart TD
    Q["Current Question (SolvePage / AnswerPanel)"] --> Builder["llmPromptBuilder.ts (Sanitize HTML, Preserve LaTeX, Extract Options)"]
    
    subgraph PromptStructure["Synthesized Educational Prompt"]
        Role["Role & Pedagogical Instructions"]
        Meta["Context: Exam, Subject, Type, Marks"]
        Stem["Question Stem (Clean Text + LaTeX)"]
        Opts["Options (A, B, C, D) - if MCQ/MSQ"]
    end
    
    Builder --> PromptStructure
    
    PromptStructure --> Service["llmRedirectService.ts"]
    
    subgraph Execution["Execution Strategy"]
        Clip["Always Copy Prompt to Clipboard"]
        Check{"Provider Supports Prefill & URL ≤ 2000 chars?"}
        Prefill["Open Query URL (ChatGPT ?q=..., Perplexity ?q=...)"]
        Fallback["Open Web App (Gemini, Claude, DeepSeek) + Toast Notice"]
    end
    
    Service --> Clip --> Check
    Check -->|Yes| Prefill
    Check -->|No / Too Long| Fallback
    
    subgraph PreferenceEngine["Local Preference Management"]
        LS[("localStorage: gateqa_llm_preference")]
        Hook["useLLMPreference() Hook"]
        Event["Event: 'gateqa:llm-preference-changed'"]
    end
    
    Hook <--> LS
    Hook -.-> Event
    Hook --> Service
```

---

## 5. Storage Schema & Storage Key Registry

All data stored by GateQA across `localStorage` and `sessionStorage` follows a strict schema versioning contract:

| Key | Storage | Version | Description | Type / Schema |
| :--- | :--- | :--- | :--- | :--- |
| `gateqa_progress_v1` | `localStorage` | `v1` | GATE CS practice question attempt history, review levels, and accuracy. | `Record<string, ProgressEntry>` |
| `gateqa_apt_progress_v1` | `localStorage` | `v1` | Aptitude practice attempt records. | `Record<string, ProgressEntry>` |
| `gateqa_da_progress_v1` | `localStorage` | `v1` | GATE DA practice attempt records. | `Record<string, ProgressEntry>` |
| `gate_qa_solved_questions` | `localStorage` | `v1` | Canonical array of solved GATE CS question UIDs. | `string[]` |
| `gateqa-apt-solved-questions` | `localStorage` | `v1` | Canonical array of solved Aptitude question UIDs. | `string[]` |
| `gate_qa_da_solved_questions` | `localStorage` | `v1` | Canonical array of solved GATE DA question UIDs. | `string[]` |
| `gate_qa_bookmarked_questions` | `localStorage` | `v1` | Array of bookmarked GATE CS question UIDs. | `string[]` |
| `gateqa-apt-bookmarked-questions` | `localStorage` | `v1` | Array of bookmarked Aptitude question UIDs. | `string[]` |
| `gate_qa_da_bookmarked_questions` | `localStorage` | `v1` | Array of bookmarked GATE DA question UIDs. | `string[]` |
| `gate_qa_notes` | `localStorage` | `v1` | User personal notes per question UID. | `Record<string, { text: string, updatedAt: string }>` |
| `gateqa_mock_active_attempt_v1` | `localStorage` & `sessionStorage` | `v5` | In-progress mock exam snapshot, question blueprints, responses, and timer. | `StoredAttemptPayload (v: 5)` |
| `gateqa_mock_attempt_backup_v1` | `localStorage` | `v5` | Automatic archive of previous test attempt prior to new exam creation. | `StoredAttemptPayload (v: 5)` |
| `gateqa_mock_history_v1` | `localStorage` | `v1` | Completed mock test history list, scores, and accuracy breakdowns. | `MockTestHistoryEntry[]` |
| `gateqa_streak_freeze_v1` | `localStorage` | `v1` | Streak freeze inventory and consumption timeline. | `{ available: number, usedDates: string[] }` |
| `gateqa_daily_goal` | `localStorage` | `v1` | Daily question practice goal target (default: 5). | `number` |
| `gateqa_llm_preference` | `localStorage` | `v1` | User's preferred external AI provider (`chatgpt`, `gemini`, `claude`, `deepseek`, `perplexity`). | `string` (default: `"chatgpt"`) |
| `gate_qa_sync_queue` | `localStorage` | `v1` | Offline mutation queue pending cloud synchronization. | `QueuedChange[]` |
| `gate_qa_theme` | `localStorage` | `v1` | Active user theme (`dark`, `light`, `system`). | `string` |

---

## 6. Build & Data Ingestion Pipelines

```mermaid
flowchart TD
    subgraph DataSources["External Data Ingestion"]
        GO["GateOverflow Scraper / Repositories"]
        AB["AptitudeBank Question Datasets"]
        DA_Raw["GATE DA 2024-2026 Raw Papers"]
    end

    subgraph BuildPipelines["Build-Time Pipeline Scripts"]
        P1["scripts/precompute-subtopics.mjs"]
        P2["scripts/build-public-artifacts.mjs"]
        P3["scripts/da-pipeline/build-da-artifacts.mjs"]
        P4["scripts/aptitude-pipeline/build-aptitude-artifacts.mjs"]
        P5["scripts/prerender-seo-pages.mjs"]
        P6["scripts/deployment/sync-calculator.mjs"]
    end

    subgraph StaticDist["Static Dist Output (dist/)"]
        Manifest["question-bank-manifest.json"]
        Shards["58 CS Shards + 3 DA Shards + Aptitude Shards"]
        SEOPages["3,493 Prerendered Static SEO HTML Pages"]
        CalcBundle["dist/calculator/* Standalone Assets"]
        Bundles["Vite Optimized Code-Split SPA Chunks"]
    end

    GO --> P2
    AB --> P4
    DA_Raw --> P3

    P1 --> P2
    P2 & P3 & P4 --> StaticDist
    P5 --> SEOPages
    P6 --> CalcBundle
```

### Build Commands & Execution Sequence
1. `npm run precompute`: Generates `src/generated/subtopicLookup.json`.
2. `npm run build:artifacts`: Compiles question manifest, mock catalog, search indices, and 58 detail shards.
3. `npm run build:da`: Generates GATE DA manifest and 3 detail shards.
4. `vite build`: Compiles optimized, code-split client SPA chunks with dynamic CSS tokens.
5. `npm run build:seo`: Pre-renders 3,493 crawler-ready static HTML landing and question pages with JSON-LD metadata.
6. `npm run sync:calculator`: Synchronizes standalone virtual calculator assets into `dist/calculator`.

---

## 7. Quality Gates & Verification Standards

To guarantee enterprise-grade stability and prevent regressions, all changes to GateQA must satisfy 5 automated verification gates:

```text
[ Pre-Push Verification Suite ]
├── 1. Unit Tests: vitest run (391+ tests across 59 suites, 100% passing)
├── 2. Strict Typecheck: tsc -p tsconfig.json --noEmit (0 TypeScript errors)
├── 3. Production Build: npm run build (3,493 SEO pages generated)
├── 4. Bundle Budget: npm run qa:validate-bundle-budget (Ensures lightweight chunks)
└── 5. End-to-End Tests: npx playwright test (Verifies core learner journeys)
```

---

## 8. Directory & File Reference Map

```text
GATE_QA/
├── docs/                             # Architectural Specifications & Reports
│   ├── SYSTEM_DESIGN.md              # Master System Design Document (This specification)
│   ├── ARCHITECTURE.md               # Local-First & Cloud Sync Architecture
│   ├── DATABASE.md                   # Supabase PostgreSQL Schema & Migrations
│   ├── BUG_BACKLOG.md                # Comprehensive Issue & Fix Registry
│   └── CHANGELOG.md                  # Chronological Release History
├── .llm-memory/                      # Fast AI Agent Retrieval Memory
│   ├── INDEX.md                      # Index of all memory files
│   ├── system_design.md              # Mirror of system design for LLM retrieval
│   ├── bugs.md                       # Active & resolved bug snapshot
│   ├── decisions.md                  # Historical architectural decision records
│   ├── patterns.md                   # Frontend & pipeline code patterns
│   └── progress.md                   # Current development milestones
├── scripts/                          # Automated Ingestion, Build & Prerender Pipelines
│   ├── build-public-artifacts.mjs    # Generates public manifests, indices & 58 shards
│   ├── precompute-subtopics.mjs      # Precomputes subtopic lookup table
│   ├── prerender-seo-pages.mjs       # Prerenders 3,493 SEO static HTML pages
│   ├── da-pipeline/                  # GATE DA ingestion and shard generator
│   └── aptitude-pipeline/            # Aptitude scraping & artifact generator
├── src/
│   ├── App.jsx                       # Master Router & Context Root
│   ├── index.jsx                     # Entrypoint & storage boot sanitizer
│   ├── components/
│   │   ├── AnswerPanel/              # Input rendering, evaluateAnswer, attempt logging
│   │   ├── Home/                     # StreakBanner, ActivityHeatmap, DailyGoal
│   │   ├── MockTest/                 # MockTestShell, MockTestQuestion, CBT UI
│   │   └── Question/                 # Question container, KaTeX MathContent, Notes
│   ├── contexts/
│   │   ├── AuthContext.jsx           # Supabase Auth, OAuth listeners, session state
│   │   ├── FilterContext.tsx         # Multi-faceted filter state reducer & multi-track
│   │   ├── MockTestContext.tsx       # Zero-Data-Loss CBT state machine & dual storage
│   │   └── SessionContext.jsx        # Ordered queue & random practice session engine
│   ├── services/
│   │   ├── QuestionService.js        # GATE CS detail shard & chunked index loader
│   │   ├── DaQuestionService.js      # GATE DA shard loader
│   │   ├── AptitudeQuestionService.js# Aptitude shard loader
│   │   └── AnswerService.js          # Normalized answer lookup & storage key resolver
│   └── utils/
│       ├── cloudSyncManager.js       # Additive union-merge cloud synchronization engine
│       ├── syncQueue.js              # Offline mutation queue with auto-reconnect drain
│       ├── practiceProgress.js       # Practice attempt logger & 'gateqa:progress-updated'
│       ├── weakTopicAnalyzer.js      # Study activity, streak, and weak topic analytics
│       └── evaluateAnswer.js         # Exact evaluation engine for MCQ, MSQ, and NAT
```
