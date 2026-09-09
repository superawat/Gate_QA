# SEPTEMBER 2026 — GATEQA DATA, FILTER & QUESTION-BANK OVERHAUL

> **Status:** Active Master Plan · September 2026  
> **Scope:** Data Quality, Source Provenance, Filter Classification, Freeze Rules & Exam Bank Expansion  
> **Core Principle:** *GateQA's data model must represent the actual source and provenance of every question. Never let "stored in a CSE JSON file" become equivalent to "official GATE CSE question."*

---

## Executive Summary

During September 2026, GateQA is undergoing a structured product and data-quality overhaul across four major functional areas:
1. **Complete Answer-Key Audit (All GATE Years)**: Systematic historical verification (2009 backward and onwards) against official answer keys and authoritative references.
2. **Filter Section UI + Data-Classification Overhaul**: Eliminating invented CSE sets, separating Genuine Official Papers from Additional Questions (cross-branch GA), and preserving provenance.
3. **Freeze Rules Overhaul**: Redesigning the streak Freeze mechanic into an intuitive, deterministic, and abuse-resistant system across timezone boundaries and cloud sync.
4. **Historical + Additional Question Paper Expansion**: Auditing missing 2000-era IIT/CS/IT papers and introducing cleanly isolated external exam banks (ISRO, CIL, BARC, UGC NET).

---

## 1. Complete Answer-Key Audit — All GATE Years

### 1.1 Problem Statement & Scope
- Multiple user reports have surfaced incorrect answers across various years and subjects.
- Individual piecemeal fixes are insufficient; the historical question bank requires a systematic, question-by-question audit.
- **Current Progress:** Audit completed from **GATE 2025 backward through GATE 2003** (2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003).
- **Plan:** Continue sequentially from **2002 backward through all remaining historical years (1987–2002)**, maintaining existing verified progress.

### 1.2 Verification Hierarchy & Methodology
Every question's answer must be audited against authoritative sources in strict priority order:
1. **Official GATE Answer Key** (Organizing Institute)
2. **Official GATE Question Paper**
3. **GateOverflow** (Community consensus + verified answer key threads)
4. **PracticePaper.in**
5. **Other reliable independent academic sources**

### 1.3 Verification Checklist per Question
For every single question, verify and validate:
- `question_uid`
- `year`
- `set` / `session`
- `question_number`
- `question_type` (MCQ / MSQ / NAT / MTA)
- Options content & order
- Stored answer in database/JSON
- Official/verified answer
- NAT accepted numerical tolerance range `[min, max]` where applicable

### 1.4 Special Handling & Root Cause Diagnostics
- Check MCQ, MSQ, and NAT questions separately.
- Do not assume answers are solely single letters `A/B/C/D`.
- Correctly preserve Marks To All (`MTA`), multi-option keys (e.g. `A;C` or `A or B`), and numerical intervals.
- Identify the exact root cause of discrepancies:
  - Incorrect raw JSON answer value
  - Shuffled / incorrect option ordering
  - 0-based vs 1-based indexing conversion errors
  - Question-to-answer mapping / alignment mismatch
  - Duplicate UID collisions
  - Scraper / parser / import serialization artifact
  - Runtime answer evaluation bug
- **Never patch individual UIDs blindly** without identifying and recording the root cause.

### 1.5 Audit Trail & Data Integrity
For every correction, record in the audit log / patch files:
- Old Answer
- New Answer
- Verification Source URL/Reference
- Root Cause / Reason
- Verification Date
- Question UID

### 1.6 Impact Assessment on Historical User Stats
Determine and verify how corrections interact with user statistics without blindly corrupting existing state:
- Practice Accuracy & Solved Status
- Practice History records
- Insights & Topic Weakness calculations
- Tracker metrics & Heatmaps
- Mock Exam scores

---

## 2. Filter Section UI + Data-Classification Overhaul

### 2.1 Core Problem
The current year/set filter exhibits confusing classifications due to conflating:
- Genuine multi-session CSE papers (e.g. 2024 Set 1, Set 2)
- Single official CSE papers (e.g. 2023 single paper)
- Additional General Aptitude (GA) questions sourced from non-CS branches (ME, CE, EE, EC, IN, etc.)

### 2.2 Classification Rules & Examples

#### Single-Paper Year (e.g., 2023)
- **Official Structure:** 1 Official CSE Paper (no official CSE Set 1 / Set 2 existed).
- **Filter Representation:**
  ```text
  2023
    ├── Official Paper
    └── Additional Questions (GA from other branches)
  ```

#### Multi-Session Year (e.g., 2024)
- **Official Structure:** Genuine CSE Set 1 and Set 2 papers.
- **Filter Representation:**
  ```text
  2024
    ├── Set 1
    ├── Set 2
    └── Additional Questions (GA from other branches)
  ```

### 2.3 "Additional Questions" Definition & Provenance
- **Definition:** High-quality aptitude/practice questions sourced from non-CS GATE branches. They are **NOT** part of the official CSE paper.
- **Provenance Retention:** Retain origin metadata (e.g., `origin_branch: "CE"`, `origin_year: 2023`, `origin_session: 1`) so developers and users can inspect the original source.
- **Consolidation:** Where multiple JSON files contain GA questions from different branches for a single year, aggregate them cleanly under the year's unified `Additional Questions` group.

### 2.4 Strict Guardrails
- ❌ Do NOT invent non-existent CSE sets (e.g. do not label 2023 as Set 1 / Set 2).
- ❌ Do NOT merge genuine multi-session CSE sets into a single blob.
- ❌ Do NOT classify Civil, Mechanical, Electrical, etc. questions as official CSE questions.
- ❌ Do NOT mix GATE CSE and GATE DA data streams.

### 2.5 UI & UX Goals
- Clear distinction between official papers and additional questions.
- Simple, compact, and responsive filter UI.
- Distinct badges/tags on "Additional Questions" cards and list items.
- Full capability for users to practice Additional Questions independently.
- Exact set filtering: Selecting an official set returns **only** that official set; selecting Additional Questions returns **only** additional questions.
- Strict verification of:
  - URL query state serialization & restoration
  - Active filter chips and clear actions
  - Accurate year/set question counts
  - Solved / Unsolved toggle interactions
  - Total CSE / DA isolation

---

## 3. Freeze Rules Overhaul

### 3.1 Architectural Review
Re-evaluate the Day Streak Freeze system from the ground up:
- **Concept:** What does Freeze represent? A protective shield preserving an active streak when life events prevent daily practice.
- **Activation & Duration:** When is Freeze armed? How is it consumed? Does it apply to exactly 1 missed calendar day?
- **Scope of Protection:** Protects Day Streak count from resetting to 0. It does not fabricate daily target completion or falsify solved question counts.
- **Anti-Exploit:** Prevent infinite freeze accumulation or unintentional day consumption.
- **Timezone Resilience:** Handle midnight crossings and user timezone transitions deterministically using ISO UTC/local date boundaries.

### 3.2 Product Rule Set
- **Predictable:** Clear visual indicators showing armed, active, and consumed freeze states.
- **Deterministic:** Evaluated consistently on local storage and Supabase Cloud Sync.
- **Streak Continuity:** A consumed freeze bridges day `N` to day `N+2` without resetting streak to 0, while keeping day `N+1` marked as frozen (0 questions practiced).
- **Consecutive Misses:** Unarmed missed days break the streak normally after available active freezes are exhausted.

### 3.3 Scope of Changes
- Business logic in `src/utils/` (streak and freeze management)
- State persistence schema in `localStorage` and Supabase sync schema
- UI visual components, modal explanations, and tooltip states
- Comprehensive test matrix covering:
  - Active practice day
  - Missed day with available Freeze (consumption)
  - Missed day without Freeze (streak reset)
  - Consecutive missed days
  - Timezone boundary changes
  - Logout, guest mode, and cross-device cloud sync merge

---

## 4. Historical + Additional Question Paper Expansion

### 4.1 Part A: Missing Historical IIT / CS / IT Papers (2000s Era)
- Audit historical question-bank coverage for 2000-era Computer Science and Information Technology examinations.
- Preserve actual historical branch/exam identity (e.g., discrete IT papers from the early 2000s).
- Maintain rigorous provenance so historical exams are cleanly distinguished rather than forced into modern CSE classifications.

#### Recent Progress (September 2026 — Milestone 4A Completed):
1. **Historical IT Paper Audit & Co-mingling Discovery:**
   - Identified that 366 historical GATE IT questions (years 2004–2008) were previously co-mingled inside GATE CSE shards (`2004-s0.json` through `2008-s0.json`) under `paper_scope: "official_cse"`.
   - Verified genuine question counts vs official historical papers:
     - **GATE IT 2004:** 73 questions present in bank (Official: 90)
     - **GATE IT 2005:** 81 questions present in bank (Official: 90)
     - **GATE IT 2006:** 70 questions present in bank (Official: 85)
     - **GATE IT 2007:** 68 questions present in bank (Official: 85; 67 authentic + 1 forum discussion `go:394296`)
     - **GATE IT 2008:** 74 questions present in bank (Official: 85)
     - **Total:** 366 IT questions extracted (365 authentic questions).
2. **Dedicated Paper Extraction & Physical Separation:**
   - Created standalone JSON datasets for IT papers in both `data/it/` (source/repo storage) and `public/data/it/` (static public distribution):
     - `gateit-2004.json` (73 Qs)
     - `gateit-2005.json` (81 Qs)
     - `gateit-2006.json` (70 Qs)
     - `gateit-2007.json` (68 Qs)
     - `gateit-2008.json` (74 Qs)
     - `gateit-all.json` (366 Qs consolidated)
     - `answers-gateit.json` (366 UID-keyed answer key map)
   - Created automated extraction pipeline utility: [`scripts/pipeline/extract-it-papers.mjs`](file:///scripts/pipeline/extract-it-papers.mjs).
   - Standardized question schema with `branch: "IT"`, `paper: "IT"`, `exam: "GATE"`, `paper_scope: "official_it"`, and normalized `answer_meta`.
3. **Next Steps for IT Track:**
   - Ingest missing ~69 IT questions across 2004–2008 to bring all 5 papers to 100% completion.
   - Clean/regenerate CSE shards `2004-s0` to `2008-s0` to decouple IT questions so CSE papers only reflect genuine CSE questions (85/90 Qs).
   - Add IT branch selection in filter drawer and mock test builder under historical papers.

### 4.2 Part B: Additional Competitive / Exam Question Banks
Ingest and support standalone question banks for top national technical examinations:
- **ISRO** (Scientist/Engineer 'SC' - Computer Science)
- **CIL** (Coal India Limited - Management Trainee CS)
- **BARC** (Scientific Officer - OCES/DGFS CS)
- **UGC NET** (Computer Science & Applications - Paper 2 & 3)

### 4.3 Architecture & Conceptual Organization
```text
Question Banks
├── GATE
│   ├── CSE (Computer Science & Information Technology)
│   └── DA (Data Science & Artificial Intelligence)
└── Additional Exams
    ├── ISRO (Scientist/Engineer CS)
    ├── CIL (Management Trainee CS)
    ├── BARC (OCES/DGFS CS)
    └── UGC NET (Computer Science)
```

### 4.4 Data Model & Provenance Contract
For every imported question from external or historical exams, store:
- `exam` (e.g., `ISRO`, `BARC`, `CIL`, `UGC_NET`, `GATE`)
- `year`
- `branch` / `discipline` (e.g., `CS`, `IT`, `ECE`)
- `paper` / `set` / `session`
- `question_number`
- `question_type` (MCQ, NAT, MSQ)
- `question_uid` (Deterministic, namespaced scheme)
- `options` & formatted Markdown/LaTeX question body
- `official_answer` with verified source citation
- `topic` / `subtopic` metadata mappings where confidently known

---

## 5. Global Data-Integrity Requirements

- **User State Preservation:** Never invalidate or corrupt:
  - `question_uid` references
  - Solved / Attempted statuses
  - Bookmarks and starred questions
  - User notes
  - Practice history logs
  - Insights, metrics, and Tracker history
  - Mock test attempts and analytics
- **Strict Stream Isolation:** Complete separation between GATE CSE, GATE DA, and External Exams.
- **No Artificial Duplication:** Deduplicate shared questions while maintaining provenance references.
- **Generalized Architecture:** Build extensible schema and filter models rather than hardcoding year-specific hacks.

---

## 6. September Execution Order

```mermaid
graph TD
    A[Phase 1: Complete Answer-Key Audit (2009 backward)] --> B[Phase 2: Year/Set/Additional Questions Classification Overhaul]
    B --> C[Phase 3: Freeze Rules & Streak Architecture Redesign]
    C --> D[Phase 4: Missing Historical IIT/CS/IT Papers Expansion]
    D --> E[Phase 5: ISRO / CIL / BARC / UGC NET Ingestion]
    E --> F[Phase 6: Full Validation, Test Suite & Release Verification]
```

1. **Phase 1: Answer-Key Audit** (Audit remaining historical years, update patch tables, rebuild shards).
2. **Phase 2: Filter & Set Classification Overhaul** (Refactor dataset metadata, separate official papers vs additional GA questions, revamp filter UI).
3. **Phase 3: Freeze System Redesign** (Refactor business logic, tests, UI, cloud sync).
4. **Phase 4: Historical Paper Expansion** (IIT/CS/IT 2000s era provenance & ingestion).
5. **Phase 5: External Exam Question Banks** (ISRO, CIL, BARC, UGC NET ingestion).
6. **Phase 6: End-to-End Verification & Reporting**.

---

## 7. Required Final Verification & Deliverables

Before concluding the September overhaul, execute the full verification suite:
- [ ] Run complete answer-key validator script across all JSON question banks.
- [ ] Verify 100% of audited years against authoritative official keys.
- [ ] Verify official CSE set/session counts and classifications.
- [ ] Verify "Additional Questions" badging, filtering, and provenance tracking.
- [ ] Verify complete CSE / DA / External Exam isolation.
- [ ] Verify filter URL parameters, history state, and question count chips.
- [ ] Verify Freeze activation, consumption, streak retention, and cloud sync.
- [ ] Run full automated test suite: `npm run test:unit`.
- [ ] Run E2E test suite: `npm run test:e2e`.
- [ ] Run TypeScript typecheck: `npm run typecheck`.
- [ ] Run production build: `npm run build`.

### Final Audit Report Deliverable Structure
1. **Answer-Key Audit Report:** Years audited, total questions verified, corrections made, root cause analysis, affected files.
2. **Filter Overhaul Report:** Reclassified years, migrated records, created Additional Questions pools, preserved official papers.
3. **Freeze Overhaul Report:** Old rules vs new rules specification, implementation changes, verified edge cases.
4. **Question-Bank Expansion Report:** Added historical papers, added ISRO/CIL/BARC/UGC NET papers, provenance references.
5. **Regression & Quality Report:** Unit tests, E2E tests, typecheck, static build output, and data validation logs.
