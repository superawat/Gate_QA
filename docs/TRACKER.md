# GATE CSE + DA — Preparation & Syllabus Tracker
## Master Architecture & Specification (v4.2 — Dynamic Ratio Palettes, Revision Sync, Countdown Overhaul & Performance)

> **Document Version**: 4.2.0 (Hierarchical Syllabus Table, Multi-Stage Progressive Ratio Palettes, Topic-Subtopic Revision Sync & Instant Track Transitions)  
> **Execution Status**: 🟢 **95% Completed** (Phase 1, 2, 3, 4 Schema Deploy, 5 Complete · Phase 4 Client Sync Hookup Pending)  
> **Route**: `/tracker` (Completely standalone page)  
> **Target Exams**: GATE Computer Science & IT (Paper: CS) + GATE Data Science & AI (Paper: DA)  
> **Core Principle**: *"GateQA should track what the student already does automatically, and only ask the student to provide information that GateQA cannot know."*  
> **Hard Invariant**: **PRACTICE DATA IS STRICTLY READ-ONLY TO TRACKER**. GateQA Practice History (`gateqa_progress_v1`, `gate_qa_solved_questions`, `gate_qa_da_solved_questions`) is the sole Source of Truth for question attempts. The Tracker derives metrics in-memory (0ms) and never modifies or duplicates attempt logs.  
> **Supabase Invariant**: *"Supabase is a cloud backup/sync layer, not the primary application database. Supabase should be contacted because synchronization is necessary—not because the UI needs data."*  
> **Data Ownership Invariant**: `FULL REVISION HISTORY = LOCAL`, `BOUNDED REVISION SUMMARY = CLOUD`. Revision history growth must not cause unbounded Supabase payload growth.  
> **Icon & UI Standard**: **Zero raw emojis**. All visual actions, status badges, and controls use standard React Icons (`react-icons/fi`, `react-icons/fa`) with semantic CSS tokens.  
> **Storage & Sync**: Local-First (`localStorage`), Automatic Runtime Derivation, Lightweight Supabase Sync (`public.user_tracker`).

---

### Changelog

#### v4.2 (Multi-Stage Ratio Palettes, Topic $\leftrightarrow$ Subtopic Revision Sync, Table Cleanup & Countdown Redesign)
- **Instant Track Switching & Shimmer Skeleton**:
  - Eliminated lag/freeze when switching between `GATE CSE` and `GATE DA` by wrapping active track state updates in React `startTransition`.
  - Added a lightweight animated shimmer loading skeleton (`TrackerTableSkeleton`) for seamless sub-millisecond visual feedback.
- **Aptitude Question Isolation from CSE Tracker**:
  - Filtered question loading in `TrackerPage.jsx` to exclude general aptitude questions from the CSE subject taxonomy.
  - CSE tracker now strictly tracks the authoritative ~3,500 core technical questions, eliminating question count contamination.
- **Topic $\leftrightarrow$ Subtopic Bi-Directional Revision Synchronization**:
  - Marking a parent Topic as Revised automatically synchronizes all child subtopics as Revised.
  - Marking all subtopics of a topic as Revised automatically marks the parent Topic as Revised.
  - Derived `isRevised` and `revisionCount` automatically roll up from subtopic revisions in `deriveTopicMetrics`.
- **Subject Revision Counter & Topic Ratio**:
  - Replaced the arbitrary subtopic count with a clean topic ratio (`0/4`, `0/5`).
  - Derived subject revision status as 1 when all subject topics are revised at least once.
  - Added independent subject-level `[-] {count} [+]` stepper controls allowing manual revision adjustment without modifying child node data.
- **4-Stage Dynamic Progress Ratio Color Palette**:
  - Replaced single green highlights with progressive, percentage-based visual cues:
    - **0%** (`0/N`): Neutral dark gray `[ ]` (`var(--color-bg)`).
    - **1% – 25%**: **Yellow** (`text-yellow-400`, yellow border & linear progress fill).
    - **26% – 50%**: **Orange** (`text-orange-400`, orange border & linear progress fill).
    - **51% – 75%**: **Pink** (`text-pink-400`, pink border & linear progress fill).
    - **76% – 99%**: **Green** (`text-emerald-400`, green border & linear progress fill).
    - **100%**: **Solid Green Check** `[✓]` (`text-emerald-300`, solid green badge).
- **Table Visual Dash Cleanup**:
  - Removed all placeholder dashes (`—`) across subtopic rows (PYQs, Accuracy, Marks, Priority, Actions) and empty Topic/Subject accuracy cells, leaving cells cleanly blank for unmeasured metrics.
- **Countdown Hero Redesign**:
  - Converted the countdown widget into 4 uniform, balanced cards (`DAYS`, `HOURS`, `MINUTES`, `SECONDS`) with monospaced tabular numerals (`font-mono`, `tabular-nums`).
  - Removed gradient and glow blurs in favor of a solid flat surface matching standard UI cards.
  - Removed the study velocity card and balanced the footer to 2 clean cards: **Time Horizon** and **Syllabus Covered**.

#### v4.1 (Taxonomy Refinements, Mock Subsystem Independence & Subtopic Granularity — DEC-042 Follow-up)
- **Programming in C & Data Structures Dedicated Separation**: Split `Programming & Data Structures` into two independent syllabus subjects:
  - **Programming in C** (`slug: "prog-c"`, 125 total PYQs): Covering C Fundamentals, Operators, Control Flow, Functions, Pointers, Arrays/Strings, Structures/Unions, and Recursion.
  - **Data Structures** (`slug: "prog-ds"`, 190 total PYQs): Covering Linear Data Structures (Stacks, Queues, Linked Lists, Arrays), Trees & BST, Heaps, and Hashing.
- **Deduplication of B-Trees & B+ Trees**: Removed redundant B-Trees and B+ Trees entries from Data Structures, preserving their canonical authoritative home under **Databases (DBMS) $\rightarrow$ File Organization & Indexing**.
- **Completely Independent Mock & Mock Count Controls**:
  - Every row (Subject, Topic, Subtopic) maintains its own independent `[✓] / [ ]` Mock status and `[-] {count} [+]` Mock Count counter.
  - Removed all unwanted cascading down to child nodes and rollup aggregations up to parent rows, allowing flexible mock tracking at subject, topic, or subtopic level.
  - Bi-directional linking preserved strictly per-node (checking `mock` auto-sets `mockCount = 1`, incrementing $> 0$ checks `mock`, decrementing to `0` or unchecking unchecks `mock`).
- **Theory Progress Card Subtopic Granularity**: Top 3-pillar Theory Progress card upgraded from coarse topic counting to granular `{completedSubtopics} / {totalSubtopics} Subtopics Completed` with dynamic percentage calculation.
- **Refined Custom Column Options & Clean Formatting**: `+ Columns` menu supports `Marks Range` (clean numbers), `Priority`, `Mock`, and `Mock Count` with independent toggleability.
- **Testing & Verification**: 29 unit tests in `src/utils/trackerState.test.ts`, 8 tests in `src/pages/TrackerPage.test.jsx`, 0 TypeScript errors.

#### v4.0 (Preparation Tracker Revamp — Insights Integration & Hierarchical Syllabus Table — DEC-042)
- **Single Source of Truth & Zero Attempt Duplication**: The tracker derives question attempt counts, solved counts, coverage percentages, and accuracy directly in-memory from canonical progress records (`gateqa_progress_v1`, `gate_qa_solved_questions`, `gate_qa_da_solved_questions`) with zero duplicate attempt bookkeeping.
- **Fixed PYQ Mapping & Taxonomy Repair**: Aligned `trackerTaxonomy.ts` and `trackerState.ts` with GateQA's canonical `SubjectTaxonomy.ts` and `DaQuestionService.ts`. Fixed the `Engineering Mathematics -> Mathematical Logic -> 0/0 PYQs` discrepancy (Discrete Mathematics questions now map cleanly to their canonical syllabus nodes).
- **Authoritative Subject-Level PYQs**: Primary PYQ progress metrics are associated directly with subjects (e.g. `Engineering Mathematics: 42 / 86 PYQs`) ensuring exact agreement with Insights.
- **Hierarchical Syllabus Table UI (`Subject -> Topic -> Subtopic`)**: Replaced the card/accordion UI with `TrackerHierarchicalTable.jsx`. Features expandable Subject and Topic rows, a global "Expand All" / "Collapse All" toggle, and a sticky first column (`Syllabus`) for horizontal scrolling on mobile/tablet.
- **Explicit Theory & Revision Tracking**: 1-click Theory completion checkboxes (`✓ Completed` / `○ Not Done`), `Revised` status checkbox, and interactive revision counters (`+` / `-`).
- **User-Controlled Optional Custom Columns**: Added `+ Columns` selector allowing users to enable/disable `Marks Range`, `Priority`, `Mock`, and `Mock Count` with local persistence in `store.customFields`.
- **Deep-Linked Practice with Strict Track Isolation**: 1-click "Practice" buttons generate canonical filter URLs (`/practice?subjects=...&subtopics=...&hideSolved=1`) with 100% track isolation between GATE CSE and GATE DA.
- **Testing & Verification**: 516 unit tests passing across 71 test files, 0 typecheck errors, production build verified.

#### v3.4 (Bounded Revision Cloud Sync — DEC-041)
- **Bounded Revision Cloud Sync**: Resolved unbounded `RevisionEvent[]` cloud payload growth. Complete revision event history is preserved in `localStorage`, while Supabase receives strictly bounded per-topic summary objects (`SyncedRevisionSummary`).
- **Deterministic Local-to-Cloud Mapping**: Defined `summarizeRevisionEvents()` mapping function that derives `lastRevisedAt`, `lastSessionAccuracy`, and `totalRevisionCount` without mutating local events.
- **Bounded Cross-Device Merge Policy**: Defined merge semantics for revision summaries (latest timestamp + monotonically increasing count).
- **Scale Stress Testing**: Synthetic multi-year revision history stress testing (100 revisions/topic across 52 subjects) verifying payload boundedness (< 8 KB).

---

## 1. Product Philosophy & Core Questions

The **GateQA Preparation Tracker** is an intelligent, low-friction preparation assistant. It is **not** a generic productivity suite (like Notion or Todoist), nor a redundant analytics dashboard (like `/insights`). 

Instead, it answers three fundamental questions for the student immediately upon opening:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. WHAT HAVE I COMPLETED?                                                   │
│    → Transparent 3-Pillar Breakdown: Theory Learned, PYQs Done, & Accuracy │
│                                                                             │
│ 2. WHAT SHOULD I STUDY OR REVISE NEXT?                                      │
│    → Actionable "Continue Where You Left Off" & Top 1–2 Priority Focus Items│
│                                                                             │
│ 3. WHAT IS STILL LEFT BEFORE GATE?                                          │
│    → Unpracticed PYQ backlog, high-yield gaps, & days to exam               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 The Golden UX Loop (Local-First Real-Time)

> [!IMPORTANT]
> **Definition of "Real-Time"**: Real-time updates occur **in the browser UI via `localStorage` (0ms latency)**, NOT through continuous network requests to Supabase.

```text
                  STUDENT SOLVES PYQ
                          │
                          ▼
            Stored in localStorage (0ms)
                          │
                          ▼
        Tracker UI updates immediately in-browser
                          │
                          ▼
                  Marked: dirty = true
                          │
                          ▼
                  750ms Debounce
                          │
                          ▼
        Sync Conditions Satisfied? (Online, Auth, ≥ 30s elapsed)
              │                               │
             Yes                              No
              │                               │
              ▼                               ▼
       Execute Cloud Sync             Hold until next
       (Upload changed state)         permitted cycle / unload
              │
              ▼
   30s Minimum Throttle Interval
```

---

## 2. Hard Data Ownership Invariant (Non-Negotiable)

> [!CRITICAL]
> **PRACTICE DATA IS STRICTLY READ-ONLY TO TRACKER**  
> Under no circumstances may the Tracker modify, delete, or rewrite GateQA's core practice history.

```text
                      DATA OWNERSHIP BOUNDARIES

   GateQA Practice Store                        Tracker Storage
  (public.user_progress)                     (public.user_tracker)
 ┌──────────────────────┐                   ┌──────────────────────┐
 │ • Solved Question IDs│                   │ • Theory Checkboxes  │
 │ • Attempt Timelines  │                   │ • Topic Notes (LWW)  │
 │ • Question Errors    │                   │ • Revision Summaries │
 │ • Question Bookmarks │                   │ • Custom Fields/Cols │
 └──────────┬───────────┘                   │ • Exam Preferences   │
            │                               └──────────┬───────────┘
            ▼                                          │
     READ-ONLY TO TRACKER                              ▼
                                             READ/WRITE BY TRACKER
```

### Explicit Permission Matrix:

| Tracker Operation | Permitted? | Target Store | Notes |
| :--- | :---: | :--- | :--- |
| **Read solved question IDs** | ✅ **YES** | `gate_qa_solved_questions` / `da` | Used for completed count calculations |
| **Read attempt timelines & accuracy** | ✅ **YES** | `gateqa_progress_v1` | Used to compute topic accuracy and recency |
| **Read bookmarks & notes** | ✅ **YES** | `gate_qa_bookmarked_questions` | Used for filtered practice deep-links |
| **Write/Toggle Theory Status** | ✅ **YES** | `gate_qa_tracker_cse_v1.theory` | Owned by Tracker (`✓ Completed` / `○ Not Done`) |
| **Write Topic Notes** | ✅ **YES** | `gate_qa_tracker_cse_v1.notes` | Owned by Tracker (LWW + Tombstones) |
| **Record Revision Events (Local)** | ✅ **YES** | `gate_qa_tracker_cse_v1.revisions`| Complete event log retained in `localStorage` |
| **Increment/Decrement Revisions** | ✅ **YES** | `gate_qa_tracker_cse_v1.revisions`| Counter controls (`+`/`-`) owned by Tracker |
| **Set Custom Fields (Marks, Target, etc.)** | ✅ **YES** | `gate_qa_tracker_cse_v1.customFields` | User-defined columns and annotations |
| **Sync Revision Summaries (Cloud)**| ✅ **YES** | `public.user_tracker.cse_revisions` | Synced as bounded `SyncedRevisionSummary` |
| **Update Preferences** | ✅ **YES** | `gate_qa_tracker_prefs_v1` | Owned by Tracker |
| **Mark questions as solved** | ❌ **FORBIDDEN** | `gate_qa_solved_questions` | Only `/practice` or `/mock` can solve |
| **Delete or alter attempts** | ❌ **FORBIDDEN** | `gateqa_progress_v1` | Practice history is permanent |
| **Rewrite topic tags / taxonomy**| ❌ **FORBIDDEN** | Question Bank Shards | Question tags are immutable application data |
| **Alter CSE/DA classification** | ❌ **FORBIDDEN** | `src/utils/examTrack.js` | Track mapping is strictly metadata-first |

---

## 3. Supabase Free-Tier Resource Budget & Bounded Payloads

The Tracker is engineered strictly within Supabase Free-Tier limits (500 MB DB, 5 GB Egress/mo, 50,000 MAU). Supabase is **never** queried as a live database during student navigation.

### 3.1 Bounded Payload Invariant (Local History vs. Cloud Summary)

> [!IMPORTANT]
> **Bounded Cloud Growth Invariant**:  
> Revision history growth must NOT cause unbounded Supabase payload growth. Tracker cloud payload size must remain bounded independently of how long the student has used GateQA.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ LOCAL TRACKER STATE (localStorage):                                         │
│   • Retains full append-only RevisionEvent[] history                        │
│   • Retains custom field values (marks, targets, remarks)                   │
│   • Used for local review timeline, history charts, and local recovery      │
├─────────────────────────────────────────────────────────────────────────────┤
│ CLOUD TRACKER STATE (Supabase JSONB):                                       │
│   • Receives strictly bounded per-topic SyncedRevisionSummary               │
│   • Contains ONLY: { lastRevisedAt, lastSessionAccuracy, totalRevisionCount }│
│   • Payload size is completely static with respect to student usage length  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Core Resource Principles

1. **Zero Database Requests for Normal Tracker Rendering**:
   - Tracker state loads 100% from `localStorage`.
   - All PYQ attempt counts, accuracy rates, and recency timestamps are derived in-memory from existing local GateQA progress records.
   - Opening `/tracker` initiates **zero network calls** to Supabase for data rendering.

2. **No Per-Question Cloud Writes**:
   - Solving a question never triggers an immediate Supabase write.
   - Local progress collects changes locally in `localStorage`; cloud sync is batched.

3. **Debounced & Batched Synchronization**:
   - Multiple local changes (checking 3 theory boxes, writing a note, adjusting custom fields) are bundled into a single sync operation.
   - Eliminates chatty network requests (`solve → request`, `bookmark → request`, `keystroke → request`).

4. **Notes Must NEVER Sync on Every Keystroke**:
   - Saves locally to `localStorage` immediately on input.
   - Cloud synchronization is debounced (750ms after typing stops) or executed when closing the notes drawer / navigating away.

5. **Strictly Avoid Polling**:
   - Zero continuous `setInterval` polling for cloud updates.
   - Synchronizes only on explicit lifecycle events: app resume, user sign-in, and batched offline queue flush.

6. **Sign-In Synchronization (Single-Cycle Merge)**:
   - Performs a single additive cloud/local merge upon Google OAuth authentication.
   - Following initial merge, operates entirely offline-first and queues subsequent mutations.
   - Never repeatedly re-downloads the entire user dataset during the active session.

7. **Incremental / Version-Based Sync**:
   - Only uploads the changed track partition (`cse_theory`, `cse_revisions`, `cse_notes` or `da_*`) using dirty-state tracking.
   - Skips network operations completely if `isDirty === false`.

8. **Egress Minimization (Highest Priority Resource)**:
   - Static taxonomy and the complete question bank remain static JSON shards served via CDN / GitHub Pages.
   - Supabase payloads strictly contain user annotations (theory booleans, note text, bounded revision summaries).

9. **Database Growth Control (Zero Derived Metrics Stored)**:
   - Does NOT store derived values (`attemptedCount`, `accuracyRate`, `completionPercentage`, `totalAvailablePYQs`).
   - These are derived dynamically on the client, keeping row sizes minimal and preventing redundant database bloat.

---

## 4. MVP Feature List & UI Architecture

### 4.1 Must-Have (Core Preparation Experience)
1. **Unmistakable Dual Track Separation**: Prominent `GATE CSE Preparation Tracker` (Blue theme) vs `GATE DA Preparation Tracker` (Purple theme) headers with 0% cross-track confusion.
2. **Hierarchical Syllabus Table (`Subject -> Topic -> Subtopic`)**:
   - Responsive table layout with expand/collapse at Subject and Topic levels.
   - Sticky first column (`Syllabus`) for effortless horizontal scrolling on mobile/tablet.
   - "Expand All" / "Collapse All" global toolbar toggle.
3. **Dedicated Subject Separation**: Clean separation between **Programming in C** (`prog-c`, 125 PYQs) and **Data Structures** (`prog-ds`, 190 PYQs).
4. **Automatic Practice & Accuracy Ingestion**: Pulls solved counts, attempt counts, and accuracy directly from existing GateQA practice stores in real time (local UI).
5. **Authoritative Subject PYQ Tracking**: Subject-level PYQ progress is exact and authoritative (e.g. `Engineering Mathematics: 42 / 86 PYQs`) regardless of granular subtopic mapping depth.
6. **1-Click Manual Theory Toggle**: Explicit checkbox per topic and subtopic: `[ ] Not Completed` / `[✓] Completed`.
7. **Revision Tracking & Interactive Counters**: `Revised` status checkbox + interactive `+`/`-` counter controls.
8. **Independent Mock & Mock Count Tracking**: `Mock` checkbox + interactive `[-] {count} [+]` stepper per row (Subject, Topic, Subtopic) operating independently.
9. **User-Controlled Optional Custom Columns**: Toggleable columns for `Marks Range`, `Priority`, `Mock`, and `Mock Count`.
10. **Honest 3-Pillar Progress Dashboard**:
    - **Theory Progress**: `145 / 380 Subtopics Completed (38%)`
    - **PYQ Practice**: `680 / 1,200 PYQs (56%)`
    - **Practice Accuracy**: `74% overall`
11. **Instant "Continue Where You Left Off"**: Auto-detects the most recently active topic from question attempt timestamps and presents a 1-click resume CTA.
12. **Conservative "Today's Focus" (Top 1–2 Items with Minimum Evidence Threshold)**: Signal-ranked next step based on solid evidence (revision urgency, verified weakness with $\ge 5$ attempts, or unpracticed theory).
13. **Clear Tri-State Attention Badges**:
    - `REVISION DUE`: Studied before, but inactive for $> 21$ days.
    - `NEEDS PRACTICE`: Theory done, but $< 30\%$ PYQs attempted.
    - `NEEDS ATTENTION`: Accuracy $< 60\%$ with $\ge 5$ attempts.
14. **Direct Practice Deep-Links**: 1-click buttons from Subject, Topic, and Subtopic rows into `/practice` (`/practice?subjects=...&subtopics=...&hideSolved=1`).

### 4.2 Should-Have (Enhancements & Utilities)
1. **Optional Countdown Hero (`Months : Weeks : Days : H:M:S`)**: 100% dismissible/removable with 1 click to eliminate exam anxiety ("Zero Anxiety Mode").
2. **Lazy-Loaded Topic Notes Scratchpad**: Simple split-pane Markdown + KaTeX math renderer ($...$, $$...$$), loaded only on demand.
3. **Printable Vector PDF Checklist**: High-resolution A4 study plan export with checkboxes and QR codes.
4. **Full JSON Workspace Backup**: Local export/import for complete data portability.

---

## 5. Hierarchical Syllabus Table Wireframe

Clean, structured syllabus management table with sticky first column:

```text
+------------------------------------------------------------------------------------------------------------------------------------------------+
|  [FiGrid] GATE CSE PREPARATION TRACKER                                                                            [ GATE CSE ]  [ GATE DA ] ⚙|
+------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                                |
|  [FiX] GATE CSE 2027 COUNTDOWN                                                                                                [FiCalendar Date]|
|            05   :   00   :   06   :   11:51:31                                                                                                 |
|          MONTHS    WEEKS    DAYS       H:M:S                                                                                                   |
|        153 DAYS LEFT       |     48% SYLLABUS                                                                                                  |
+------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                                |
|  [FiBarChart2] PREPARATION PROGRESS                                                                                                            |
|  • Theory Progress:   145 / 380 Subtopics Completed (38%)                                                                                      |
|  • PYQ Practice:      680 / 1,200 PYQs (56%)                                                                                                   |
|  • Practice Accuracy: 74%                                                                                                                      |
|                                                                                                                                                |
|  [Pill: 12 Need Attention]  [Pill: 8 Unpracticed]  [Pill: 3 Revision Due]  [Pill: 18 Well Practiced]                                           |
+------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                                |
|  [FiPlayCircle] CONTINUE WHERE YOU LEFT OFF                                                                                                    |
|  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  |
|  │ Operating Systems → Deadlocks & Resource Allocation                                                                                      │  |
|  │ 14/28 PYQs Attempted (50%) · Accuracy: 78% · Last practiced: Today                                                                       │  |
|  │ [ [FiPlay] Continue Practice (14 Unsolved) ]   [ [FiEdit3] View Notes ]                                                                  │  |
|  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  |
|                                                                                                                                                |
|  [FiTarget] TODAY'S FOCUS (Top Recommended Priorities)                                                                                         |
|  1. OS → Virtual Memory & Pipelining (57% acc · 23 days ago)   [ [FiPlay] Practice 10 Review PYQs ] [ [FiEdit3] Notes ]                          |
|  2. DBMS → Transactions & Concurrency (Theory Done · 0/32 PYQs) [ [FiPlay] Start Practice (32 PYQs) ]                                          |
+------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                                |
|  [FiLayers] SYLLABUS & PREPARATION TABLE (11 Subjects)                                             [ [FiMinimize2] Collapse All ] [ + Columns ]|
|                                                                                                                                                |
|  | Syllabus (Subject / Topic)          | Theory | Revised | Rev Count | PYQs Practiced | Accuracy | Marks  | Priority | Mock | Mock Count | Actions        |
|  |-------------------------------------|:------:|:-------:|:---------:|:--------------:|:--------:|:------:|:--------:|:----:|:----------:|:---------------|
|  | ▼ [EM] Engineering Mathematics      |  0/4   |   0/4   |     0     | 42 / 86  [██░░] |   78%    |  4–6M  |  [High]  | [ ]  |  [- 0 +]   | [▶ Practice All]|
|  |   ▼ Discrete Mathematics            |  [✓]   |   [✓]   |  [- 2 +]  |  8 / 14  [██░░] |   85%    |  2–4M  |  [High]  | [✓]  |  [- 1 +]   | [▶] [📝] [↺]   |
|  |       • Propositional Logic         |  [✓]   |   [✓]   |  [- 1 +]  |                |          |        |          | [✓]  |  [- 1 +]   |                |
|  |       • First-Order Predicate Logic |  [ ]   |   [ ]   |  [- 0 +]  |                |          |        |          | [ ]  |  [- 0 +]   |                |
|  |   ▶ Linear Algebra                  |  [ ]   |   [ ]   |  [- 0 +]  |  0 / 22  [░░░░] |          |  2–4M  |  [High]  | [ ]  |  [- 0 +]   | [▶] [📝] [↺]   |
|  | ▼ [PROG] Programming in C           |  0/4   |   0/4   |     0     | 35 / 125 [██░░] |   80%    |  4–6M  |  [High]  | [ ]  |  [- 0 +]   | [▶ Practice All]|
|  | ▼ [DS] Data Structures              |  0/4   |   0/4   |     0     | 48 / 190 [██░░] |   75%    |  5–7M  |  [High]  | [ ]  |  [- 0 +]   | [▶ Practice All]|
|  | ...                                 |        |         |           |                |          |        |          |      |            |                |
+------------------------------------------------------------------------------------------------------------------------------------------------+
```

---

## 6. Practice Deep-Link URL Contract

Every syllabus node connects cleanly into `/practice` with exact canonical filters:

| Syllabus Level | Generated Practice URL | Target Behavior |
| :--- | :--- | :--- |
| **CSE Subject** | `/practice?subjects=engg-math,discrete-math&hideSolved=1` | Solves all unsolved questions in subject |
| **CSE Topic** | `/practice?subjects=os&subtopics=cpu-scheduling&hideSolved=1` | Solves unsolved questions for topic |
| **CSE Subtopic** | `/practice?subjects=os&subtopics=scheduling-algorithms&hideSolved=1` | Solves questions matching subtopic |
| **DA Subject** | `/practice?subjects=da:machine-learning&hideSolved=1` | Solves all unsolved DA ML questions |
| **DA Topic** | `/practice?subjects=da:machine-learning&subtopics=supervised-learning&hideSolved=1` | Solves specific DA topic questions |

---

## 7. Minimal Data Model & Storage Contracts

### 7.1 Local Storage Contract (`gate_qa_tracker_cse_v1` / `gate_qa_tracker_da_v1`)

```typescript
export interface TopicNoteRecord {
  content: string;
  updatedAt: string;          // ISO datetime
  isDeleted: boolean;         // Deletion tombstone
}

export interface RevisionEvent {
  id: string;                 // e.g. "rev_1725184800000_abc12"
  timestamp: string;          // ISO datetime
  source: 'practice' | 'manual';
  questionCount?: number;
  accuracyRate?: number;
}

export interface UserTrackerStore {
  // Node ID -> Theory Status
  theory: Record<string, {
    isCompleted: boolean;
    completedAt: string | null;
  }>;
  
  // Node ID -> Append-only revision events (LOCAL ONLY: Full History)
  revisions: Record<string, RevisionEvent[]>;

  // Node ID -> Structured Note Object (with tombstone)
  notes: Record<string, TopicNoteRecord>;

  // Node ID -> Custom Column key/value map (e.g. { marks: "15", target: "2026-11-01", priority: "High", remarks: "Revise formulas" })
  customFields: Record<string, Record<string, string>>;

  dataVersion: number;
  updatedAt: string;
}
```

### 7.2 Preferences Contract (`gate_qa_tracker_prefs_v1`)

```typescript
export interface UserTrackerPreferences {
  activeTrack: 'cse' | 'da';
  examDateCse: string;        // default: "2027-02-06"
  examDateDa: string;         // default: "2027-02-07"
  countdownDisplayMode: 'hero' | 'compact' | 'hidden';
  showCountdownWidget: boolean;
  visibleColumns?: string[];  // e.g. ["marks", "target", "priority", "remarks"]
  updatedAt: string;
}
```

### 7.3 Supabase Synced State Contract (`public.user_tracker`)

```typescript
export interface SyncedRevisionSummary {
  lastRevisedAt: string | null;
  lastSessionAccuracy: number | null;
  totalRevisionCount: number;
}

export interface UserTrackerRow {
  user_id: string;
  active_track: 'cse' | 'da';
  exam_date_cse: string;
  exam_date_da: string;
  countdown_display_mode: string;
  show_countdown_widget: boolean;
  visible_columns: string[];
  
  // CSE Syllabus State
  cse_theory: Record<string, { isCompleted: boolean; completedAt: string | null }>;
  cse_revisions: Record<string, SyncedRevisionSummary>;
  cse_custom_fields: Record<string, Record<string, string>>;
  cse_notes: Record<string, TopicNoteRecord>;
  
  // DA Syllabus State
  da_theory: Record<string, { isCompleted: boolean; completedAt: string | null }>;
  da_revisions: Record<string, SyncedRevisionSummary>;
  da_custom_fields: Record<string, Record<string, string>>;
  da_notes: Record<string, TopicNoteRecord>;
  
  data_version: number;
  created_at: string;
  updated_at: string;
  last_synced_at: string;
}
```

---

## 8. Field-Specific Conflict Resolution & Data Safety

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. THEORY STATUS                                                            │
│    → Boolean OR (true wins). If marked complete on Device A, Device B sync  │
│      will never revert it to unstudied.                                     │
│                                                                             │
│ 2. TOPIC NOTES                                                              │
│    → Last-Write-Wins (LWW) using note.updatedAt.                            │
│    → Deletion represented via tombstone: isDeleted = true.                  │
│    → Never use text length as conflict priority.                            │
│                                                                             │
│ 3. REVISION SUMMARIES (Cross-Device)                                        │
│    → Local full RevisionEvent[] history remains authoritative on device.    │
│    → Remote SyncedRevisionSummary merges boundedly:                         │
│      • lastRevisedAt = latest timestamp between local latest & cloud        │
│      • lastSessionAccuracy = accuracy from the newer timestamp              │
│      • totalRevisionCount = max(localEvents.length, cloud.totalRevisionCount)│
│                                                                             │
│ 4. CUSTOM FIELDS                                                            │
│    → Deep merge by nodeId & fieldKey with local priority.                   │
│                                                                             │
│ 5. PREFERENCES                                                              │
│    → Last-Write-Wins using preferences.updatedAt.                           │
│                                                                             │
│ 6. PRACTICE HISTORY                                                         │
│    → Existing cloudSyncManager (public.user_progress) is single source of   │
│      truth. Tracker derives metrics at runtime; never writes back attempts. │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Implementation Roadmap & Execution Status

### Overall Progress: 95% Completed (Phase 1, 2, 3, 4 DB Migration, 5 Complete)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Foundation & Derived State Engine    [████████████████████] 100%   │
│ PHASE 2: Hierarchical Table & Action-First UI [████████████████████] 100%   │
│ PHASE 3: Notes & Lazy-Loaded Math Rendering    [████████████████████] 100%   │
│ PHASE 4: Supabase Backup & Live DB Migration  [██████████████████░░]  90%   │
│ PHASE 5: Verification & Polish                [████████████████████] 100%   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation & Derived State Engine (Completed ✅)
- [x] Create `src/data/trackerTaxonomy.ts` (Hierarchical Subject -> Topic -> Subtopic tree, canonical subject slugs, 52 CSE & 28 DA topics, textbooks, marks ranges).
- [x] Create `src/utils/trackerState.ts` (Local store CRUD, in-memory `deriveTopicMetrics`, `deriveSubjectMetrics`, 3-pillar progress calculators, evidence-guarded priority scoring).
- [x] Fix taxonomy question bank mapping for Discrete Math and Engineering Mathematics topics (`Mathematical Logic -> 0/0 PYQs` fixed).
- [x] Register `/tracker` route in `src/utils/routes.ts`, `src/utils/routePreload.js`, and `src/App.jsx`.
- [x] Add unit tests for primary topic attribution, minimum-data guards, priority ranking, and bounded summary derivations (`src/utils/trackerState.test.ts` - 23 tests).

### Phase 2: Hierarchical Table & Action-First UI (Completed ✅)
- [x] Build `TrackerPage.jsx` with Track Header (`GATE CSE` vs `GATE DA`), 3-pillar progress dashboard, search bar, and high-yield filter toggle.
- [x] Build `TrackerHierarchicalTable.jsx` with collapsible Subject and Topic rows, sticky topic column on mobile, theory checkboxes (`✓ Completed`), interactive revision counters (`+`/`-`), authoritative PYQs, deep-linked "Practice" buttons, and optional custom columns (`Marks`, `Priority`, `Mock`, `Mock Count`).
- [x] Split **Programming in C** (`prog-c`, 125 PYQs) and **Data Structures** (`prog-ds`, 190 PYQs) into dedicated independent subjects.
- [x] Remove duplicate B-Trees and B+ Trees from Data Structures, keeping them under DBMS Indexing.
- [x] Implement independent `Mock` checkboxes and `Mock Count` steppers across Subject, Topic, and Subtopic rows with 0 cross-level coupling.
- [x] Update 3-pillar Theory Progress card to compute granular subtopic counts (`completedSubtopics / totalSubtopics`).
- [x] Implement Topic $\leftrightarrow$ Subtopic bi-directional revision auto-sync and subject-level revision counters with topic ratios.
- [x] Implement 4-stage percentage-based color progression for Subject Theory and Revised badges (Yellow $\le 25\%$, Orange $26-50\%$, Pink $51-75\%$, Green $76-100\%$).
- [x] Clean table UI by removing placeholder dashes (`—`) from unmeasured subtopic cells and accuracy fallbacks.
- [x] Redesign countdown hero into 4 uniform time blocks (`DAYS`, `HOURS`, `MINUTES`, `SECONDS`), removing gradient blur and daily pace card.
- [x] Optimize track switching with React `startTransition` and animated shimmer skeleton (`TrackerTableSkeleton`).
- [x] Exclude general aptitude questions from CSE tracker so it reflects the exact ~3,500 core technical questions.
- [x] Build `TrackerContinueCard.jsx` (surfacing "Continue Where You Left Off" and cold-start "Recommended First Step" with 1-click practice deep-link).
- [x] Build `TrackerFocusBanner.jsx` (signal-ranked Top 1–2 recommendations with minimum evidence thresholds).
- [x] Add `/tracker` item with icon (`FiGrid`) to `GlobalNavigationDrawer.jsx`.

### Phase 3: Notes & Revision Management (Completed ✅)
- [x] Build inline lazy-loaded `TrackerNotesDrawer.jsx` with KaTeX LaTeX rendering (`$...$`, `$$...$$`), Markdown preview, auto-save, and tombstone deletion.
- [x] Implement bounded revision summarizer (`summarizeRevisionEvents`) preserving complete local revision logs.
- [x] Implement revision counters (`incrementRevisionCount`) and revised status toggles (`setRevisionStatus`).

### Phase 4: Supabase Backup & Sync (Free-Tier Optimized & Bounded) (Live DB Migration Complete ✅ · Client Hookup In Progress)
- [x] Run Supabase migration SQL: `supabase/migrations/20260901_user_tracker.sql` on live Supabase instance (`public.user_tracker` table with RLS policies) — **Executed & Verified on live Supabase on 2026-09-02**.
- [ ] Connect and verify live `cloudSyncManager.js` synchronization with `user_tracker` on Supabase cloud.
- [ ] Enforce dirty-state batching, pre-merge snapshots, and 30s throttling in production sync queue.
- [ ] Verify multi-device end-to-end cloud sync with live user session.

### Phase 5: Verification, Header Discoverability & Mobile Polish (Completed ✅)
- [x] Header quick-access button: Placed `FiTarget` bullseye icon in `AppHeader.jsx` directly to the left of the feedback button with vibrant pink styling and pure-CSS GPU breathing halo (`tracker-glow-breathe`).
- [x] Interactive 1-time announcement popup modal (`TrackerAnnouncementModal.jsx`) highlighting the 4 core pillars with guaranteed 1-time display per user device (`gateqa_tracker_announcement_seen_v1`).
- [x] Mobile touch ergonomics overhaul:
  - Dynamically scaled sticky syllabus column (`min-w-[190px]` on mobile vs `min-w-[320px]` on desktop) leaving ample room for scrollable status columns.
  - Streamlined indentations on Topic and Subtopic rows on mobile.
  - Full-width mobile Track Switcher and "Continue Practice" CTA buttons.
  - Added touch-momentum scrolling (`overscroll-x-contain scrollbar-thin`) and touch-manipulation hit areas.
- [x] Run full workspace unit test suite (`npm run test:unit` - 72 test files, 527 tests passing).
- [x] Run revision-history scale stress tests (5,200 synthetic events payload check in `src/utils/trackerState.test.ts`).
- [x] Run TypeScript typechecking (`npm run typecheck` - 0 errors).
- [x] Run static production build (`npm run build` - 3,491 static SEO pages, 58 question shards).
- [x] Verify Soft Dark theme contrast and mobile viewport responsiveness.
- [x] Document architecture decisions in `docs/CHANGELOG.md`, `.llm-memory/decisions.md` (DEC-041 to DEC-045), and `.llm-memory/progress.md`.

---

## 10. Testing Strategy & Scale Stress-Testing

### 10.1 Unit & Integration Tests (Completed ✅)
- [x] Correctly derives topic attempted count and accuracy from canonical progress data (`gateqa_progress_v1`).
- [x] Correctly maps Discrete Mathematics / Mathematical Logic questions without 0/0 anomalies.
- [x] Derives authoritative subject-level PYQ totals and accuracy rates.
- [x] Strict CSE vs DA track isolation.
- [x] Correctly flags topics as `REVISION_DUE` when $> 21$ days have elapsed.
- [x] Theory completion toggle persists and updates 3-pillar metrics.
- [x] Revision counter increment/decrement and revised status toggling.
- [x] Independent Mock checkbox and Mock Count steppers per node.
- [x] Custom column values (`customFields`) set and persist properly.
- [x] Conflict resolution: Boolean OR for theory, LWW + tombstone for notes.
- [x] `summarizeRevisionEvents()` produces deterministic `SyncedRevisionSummary`.
- [x] 8/8 UI unit tests passing in `src/pages/TrackerPage.test.jsx`.
- [x] 29/29 logic unit tests passing in `src/utils/trackerState.test.ts`.

### 10.2 Revision History Stress Tests (Scale Validation) (Completed ✅)
- [x] Local storage retains all 5,200 revision events without data loss.
- [x] `summarizeRevisionEvents()` produces a bounded summary payload (< 8 KB for 52 topics with 5,200 lifetime events).
- [x] Serialized Supabase payload size for `public.user_tracker` does **not** scale with event count.
- [x] Tracker UI calculations remain sub-millisecond in-memory.
- [x] CSE and DA states remain strictly partitioned.

---

*End of Master Architecture & Specification Document.*
