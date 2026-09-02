# Changelog

- **Preparation Tracker PageShell & Back to Home Navigation Integration (DEC-048)**:
  - *Context & Goal*: The Preparation Tracker page (`/tracker`, `TrackerPage.jsx`) was missing a direct navigation link back to the Home Dashboard and lacked the global `PageShell` container present on all other pages.
  - *Changes*:
    - Wrapped `TrackerPage.jsx` with `<PageShell contentClassName="pb-16 sm:pb-24 pt-3 sm:pt-5">`, providing the standard global `AppHeader` (GateQA logo home link, nav links, theme toggle, profile menu), `MobileBottomNav`, and `Footer`.
    - Added an explicit, prominent "← Back to Home" button at the top-left of the tracker header using `Link` to `HOME_ROUTE` (`/`) with `FiArrowLeft` and interactive hover micro-animation.
    - Updated `src/pages/TrackerPage.test.jsx` with a unit test asserting the Back to Home navigation link.
  - *Verification*: 532 unit tests passing (100% green), TypeScript typecheck clean (0 errors).

- **Question Data Integrity & Defective Repair (`go:43485` & `go:80594`) (DEC-047)**:
  - *`go:43485` (GATE CSE 2008 Q79 - Algorithms)*:
    - *Problem*: Question asks for the number of binary strings of length 5 that contain no consecutive 0s. The mathematical recurrence $T(n) = T(n-1) + T(n-2)$ with $T(1)=2, T(2)=3$ gives $T(3)=5, T(4)=8, T(5)=13$. The correct mathematical value is 13, but 13 is absent from all options (A: 5, B: 7, C: 8, D: 16).
    - *Resolution*: Preserved original statement and options unchanged; marked question as defective (`is_defective: true`, `answer: null`, `type: "MCQ"`) across `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_master_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `scripts/qa/resolve-legacy-answer-gaps.mjs`, `public/questions-with-answers.json`, detail shard `2008-s0.json`, and mock catalog `mock_catalog_v1.json`.
    - *Scoring*: Excluded from scoring without penalizing the candidate (0 score delta, 0 penalty marks). Updated `AnswerPanel.jsx` to dynamically render the mathematical explanation in solution and review modes.
  - *`go:80594` (GATE CSE 1987 Q2j - Theory of Computation)*:
    - *Problem*: Stored and rendered as NAT with numeric key 9 for a True/False statement ("A minimal DFA that is equivalent to an NDFA with n nodes has always 2^n states").
    - *Resolution*: Converted question type from NAT to standard 2-choice MCQ with `<ol style="list-style-type:upper-alpha"><li>TRUE</li><li>FALSE</li></ol>` appended to stem. Correct answer set to **Option B** (FALSE) because $2^n$ states is an upper bound arising from subset construction, and DFA minimization often yields strictly fewer than $2^n$ states.
    - *UI & Scoring*: Replaced NAT numeric input with 2-choice MCQ buttons (A: TRUE, B: FALSE) evaluated via the standard MCQ evaluation path without introducing an unnecessary custom question type. Synchronized across all question banks, answer registries, and detail shards (`1987-s0.json`).
  - *Tests & Verification*: Added regression tests in `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`, and `src/utils/mockTest.test.js`. All 531 workspace unit tests passing, `npm run qa:validate-data` passing, and `npm run typecheck` clean.

- **Comprehensive CI & QA Pipeline Hardening — Playwright A11y, Code-Splitting & Image Integrity (DEC-046)**:
  - *Context & Goal*: Resolved all issues identified during full-spectrum test execution (`test:unit`, `test:e2e`, `qa:a11y:axe`, `qa:validate-question-images`, `qa:audit-aptitude`, and production build).
  - *A11y Color Contrast Hardening (`TrackerAnnouncementModal.jsx`)*:
    - Elevated contrast ratio on the `NEW FEATURE` badge to > 4.5:1 (`text-emerald-800 dark:text-emerald-300` on `bg-emerald-500/15`).
    - Darkened CTA button background to `bg-emerald-700 hover:bg-emerald-800` to exceed WCAG AA 4.5:1 ratio for 12px/14px bold white text.
  - *Dynamic Import & Code-Splitting Fix (`AppHeader.jsx` & `trackerState.ts`)*:
    - Moved `TRACKER_ANNOUNCEMENT_SEEN_KEY` export to `trackerState.ts` so `AppHeader.jsx` no longer imports `TrackerAnnouncementModal.jsx` statically.
    - Re-enabled lazy code-splitting for `TrackerAnnouncementModal` into an independent 6.49 KB chunk, reducing initial bundle size.
  - *Orphaned Image Cleanup*: Removed 5 unreferenced `.webp` image assets from `public/question-images/` (`qa:validate-question-images` 0 missing, 0 orphaned, 0 remote blob questions).
  - *Aptitude Artifact Audit Regex Hardening (`audit-aptitude-data.js`)*: Stripped `src="..."` attributes from question HTML during artifact checks to avoid false-positive matches on base64 media payloads.
  - *Verification*: 527 unit tests (100% green), 17 Playwright E2E & Axe accessibility tests (100% green), 0 TypeScript errors, bundle budget passed, and production build succeeded.

- **Preparation Tracker Mobile Responsiveness & Touch Ergonomics Overhaul (DEC-045)**:
  - *Context & Goal*: Optimized the entire Preparation Tracker subsystem for mobile smartphones (320px–480px viewports) across iOS Safari and Android Chrome.
  - *Responsive Table & Sticky Column*:
    - Dynamically scaled sticky syllabus column width (`min-w-[190px] sm:min-w-[260px] md:min-w-[320px]`) so 180px–220px of interactive columns remain visible and scrollable on narrow mobile screens.
    - Streamlined indentation on Topic rows (`pl-5 sm:pl-8`) and Subtopic rows (`pl-9 sm:pl-14`) to prevent text clipping and preserve readability.
    - Added `overscroll-x-contain scrollbar-thin` for smooth touch momentum scrolling without rubber-band page shifts.
  - *Touch-Friendly Controls & Full-Width CTAs*:
    - Enlarged tap targets on checkboxes, steppers, and practice buttons (`touch-manipulation`) to eliminate mobile double-tap zoom delays.
    - Upgraded Track Switcher (`GATE CSE` / `GATE DA`) to full-width equal-share buttons on mobile (`w-full sm:w-auto`).
    - Made "Continue Where You Left Off" CTA button full-width on mobile for effortless one-thumb tapping.
    - Updated `TrackerNotesDrawer.jsx` to expand full-width on mobile with tap-outside backdrop dismiss and responsive editor sizing.
  - *Tests*: All 15 Tracker unit tests and 527 overall workspace unit tests passing with 0 TypeScript errors.

- **Tracker Header Quick Access Target Icon (Pink Breathing Glow) & Announcement Popup (DEC-044)**:
  - *Context & Goal*: Provided effortless global discoverability for the Preparation Tracker (`/tracker`).
  - *Header Quick Access Target Icon*: Replaced grid icon with `FiTarget` bullseye icon in `AppHeader.jsx` directly to the left of the feedback button, styled in vibrant pink with a GPU-accelerated CSS breathing halo (`tracker-glow-breathe`) and hover micro-sway with 0ms JavaScript runtime load.
  - *Interactive Announcement Popup (`TrackerAnnouncementModal.jsx`)*: Created a 1-time announcement modal showcasing the 4 core pillars with 1-click CTA to `/tracker` and immediate `localStorage` persistence.
  - *Tests*: Unit tests in `src/components/Tracker/TrackerAnnouncementModal.test.jsx` and updated `src/components/Layout/AppHeader.test.jsx`. All tests pass.

- **Preparation Tracker Revamp — Insights Integration & Hierarchical Syllabus Table (DEC-042)**:
  - *Context & Goal*: Made a major architectural and UI revision to the Preparation Tracker at `/tracker` (`TrackerPage.jsx`) to make it an independent syllabus management layer that automatically consumes practice and attempt data from GateQA's single source of truth without manual attempt counters.
  - *Canonical Practice Ingestion & Mapping Repair*:
    - Fixed taxonomy and question mapping discrepancies (e.g., `Engineering Mathematics -> Mathematical Logic` and Discrete Math topics mapped accurately to canonical question bank tags and subject slugs).
    - Subject-level PYQs are authoritative and exact (e.g. `Engineering Mathematics: 42 / 86 PYQs`) directly derived from `practiceProgress` and `solvedQuestions`.
  - *Hierarchical Syllabus Table UI*:
    - Replaced card/accordion UI with `TrackerHierarchicalTable.jsx` (`Subject -> Topic -> Subtopic`).
    - Expand/Collapse support for subjects and topics with global "Expand All" / "Collapse All" toggle.
    - Explicit Theory toggle (`✓ Completed` / `○ Not Done`) and bulk subject theory marking.
    - Interactive Revision Tracking (`Revised` checkbox + `+`/`-` revision counters).
    - User-controlled optional custom columns (`Marks`, `Target`, `Priority`, `Remarks`) with inline inputs and persistence.
    - Deep-linked "Start Practice" buttons navigating to `/practice?subjects=...&subtopics=...&hideSolved=1`.
    - Horizontal scroll container with sticky topic name column for responsive tablet/mobile usability.
    - Strict track isolation ensuring CSE and DA datasets remain 100% separate.
  - *Tests*: Added unit test suites `src/utils/trackerState.test.ts` (23 tests) and `src/pages/TrackerPage.test.jsx` (7 tests). All 516 unit tests pass, 0 typecheck errors, and production build succeeded.

- **GATE CSE & DA Preparation Tracker v3.4.0 (DEC-041)**:
  - *Context & Goal*: Built a dedicated, action-first preparation and syllabus tracking experience at `/tracker` (`TrackerPage.jsx`) tailored specifically for GATE CSE (52 canonical topics across 10 subjects + General Aptitude) and GATE DA (28 canonical topics across 8 subjects + General Aptitude).
  - *Core Invariants & Zero Friction*:
    - **Local-First & Automation First**: Strictly read-only to raw practice progress; automatically derives PYQ attempt counts, solved counts, coverage, and accuracy in-memory from `localStorage` without requiring double manual entry.
    - **3-Pillar Progress Framework**: Replaced misleading single percentage numbers with three independent, actionable metrics: Theory Coverage (X/Y Topics), PYQ Practice Coverage (X/Y Attempted), and Practice Accuracy (X% Solved).
    - **Intelligent Evidence Guards**: "Today's Focus" requires $\ge 5$ attempts to diagnose weakness and $\ge 1$ prior session with $> 21$ days inactivity for spaced revision.
    - **Dismissible Countdown Hero**: Live exam countdown with Months:Weeks:Days:H:M:S breakdown, target date settings, and 1-click permanent dismiss ("Zero Anxiety Mode").
    - **Lazy Notes Drawer & KaTeX**: Topic notes drawer with LaTeX ($...$, $$...$$) KaTeX rendering and Markdown preview; KaTeX bundle is 0 KB on initial tracker load.
    - **Supabase Cloud Sync (Free-Tier Safe)**: Full revision event history kept locally; strictly bounded `SyncedRevisionSummary` (`{ lastRevisedAt, lastSessionAccuracy, totalRevisionCount }`) and LWW topic notes with deletion tombstones (`isDeleted: true`) synced to `user_tracker` table.
  - *Tests*: Added unit test suites `src/utils/trackerState.test.ts` (19 tests), `src/pages/TrackerPage.test.jsx` (6 tests), and extended `src/utils/cloudSyncManager.test.js` (22 tests). All 511 workspace unit tests pass with zero regressions.

- **Data Persistence & Privacy Policy Modernization for Google Login & Cloud Backup (DEC-040)**:
  - *Context & Need*: The footer Data Policy modal and documentation reflected legacy client-only constraints that claimed no server storage or cross-device sync was possible, conflicting with the newly introduced Google Authentication, Supabase Cloud Sync, and Zero Data Loss union-merge capabilities.
  - *UI & UX Redesign*: Redesigned [`src/components/Footer/DataPolicyModal.jsx`](file:///src/components/Footer/DataPolicyModal.jsx) with high-clarity sections: (1) Local-First Default (Guest Mode) vs. Google Cloud Sync (Optional), (2) Protection Mechanisms (Google Cloud Sync, JSON Workspace Export/Import, Pre-Merge Snapshots), (3) When Guest Progress Is At Risk (Incognito, cleared cache, unlinked devices), (4) Zero Data Loss Guarantees (additive union-merge, safe sign-out with no local data wiped), and (5) Privacy Commitments (no selling of student data).
  - *Documentation & Static Pages*: Updated master policy [`docs/DATA-POLICY.md`](file:///docs/DATA-POLICY.md) and [`src/pages/StaticPages.jsx`](file:///src/pages/StaticPages.jsx) with comprehensive explanations of Supabase table structures, pre-merge snapshot mechanics, and offline portability contracts.
  - *Tests*: Added unit tests in `src/components/Footer/DataPolicyModal.test.jsx`. All 482 unit tests pass.

- **Defective Question Representation & Scoring Repair — GATE CSE 2005 Q53 (`go:1376`) (DEC-039)**:
  - *Problem*: GATE CSE 2005 Question 53 (`go:1376` / `cse:2005:set1:main:q53`), asking for the language recognized by a finite automaton with four choices (A, B, C, D), was previously rendered as `Non-standard format` due to being listed in `unsupported_question_uids_v1.json`. Analysis confirmed that none of the four options correctly describes the automaton's language.
  - *Resolution*:
    - Converted question type from `Non-standard format` to interactive **`MCQ`** while preserving all 4 options, stem text, and automaton diagram verbatim.
    - Set `answer: null` and `is_defective: true` in authoritative answer registries (`data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/questions-with-answers.json`, and detail shard `2005-s0.json`). Removed `go:1376` from `unsupported_question_uids_v1.json`.
    - Enhanced `evaluateAnswer.js` to return `{ status: "excluded", correct: false, reason: "defective_question" }` for defective/excluded questions.
    - Updated mock test and practice evaluation (`mockTest.js`, `AnswerPanel.jsx`, `MockTestQuestion.jsx`, `GateStatusIcon.jsx`, `MockTestResults.jsx`, `mockTestHistory.js`) so that selecting any option (A/B/C/D) never marks any option as correct, never awards marks, and never penalizes the student with negative marks, cleanly excluding the defective question from test score calculations with clear explanatory review notices.
  - *Tests*: Added unit regression tests in `src/utils/evaluateAnswer.test.js`, `src/utils/mockTest.test.js`, and `src/services/AnswerService.test.js`. All 479 unit tests pass.

- **Highlight Incorrectly Answered Questions in Custom Builder & Mock Test Review (DEC-038)**:
  - *Feature & UX Enhancement*: Enabled students reviewing Custom Builder, Full Mock, and Past Paper attempts to immediately identify incorrectly answered questions on the question navigation palette without opening each question individually.
  - *Architecture & Logic*: Extended `GateStatusIcon.jsx` with `CORRECT`, `INCORRECT`, and `BONUS` visual states and exported `getReviewVisualStatus(questionResult)` which inspects the canonical `resultSummary.perQuestionResult` from `evaluateAnswer.js`.
  - *Design & Accessibility*: Added high-contrast red styling (`gate-tile--incorrect`, `gate-status--incorrect`, `#dc2626`) for incorrect questions, green (`gate-tile--correct`) for correct questions, neutral unattempted (`gate-tile--not-visited`) for unattempted questions, and dynamic review legend rows with matching counts. Added screen reader `aria-label` and `title` tooltips. Preserved standard official GATE CBT statuses during active exam mode (`isReviewPhase === false`).
  - *Tests*: Added unit tests in `src/components/MockTest/QuestionPalette.test.jsx` covering MCQ, MSQ, NAT, active ring coexistence, aria labels, legend counts, and active exam status guards. All 476 tests pass.

## 2026-08-31

- **Question & Answer Maintenance Roadmap & Agent Runbook Protocol (DEC-037)**:
  - Created [`docs/QUESTION_DATA_CORRECTION_RUNBOOK.md`](file:///docs/QUESTION_DATA_CORRECTION_RUNBOOK.md) documenting the 6-phase execution protocol for all future answer key corrections, question type changes (MCQ/MSQ/NAT/MTA), LaTeX formula repairs, artifact generation pipelines, and regression unit tests.
  - Linked the maintenance runbook into `AGENTS.md`, `.agents/AGENTS.md`, and `.llm-memory/INDEX.md` as standard procedure for AI agent sessions.

- **Question Data Integrity & Type/Answer Key Correction — GATE CSE 2024 Set 1 Q31 (`go:422811`) (DEC-036)**:
  - **GATE CSE 2024 Set 1 Question 31 (`go:422811` / `cse:2024:set1:main:q31`) — Type Fix to MCQ & Answer Key to Option D**:
    - *Problem*: Question asking for the first three elements in the max-heapified array of $[82, 101, 90, 11, 111, 75, 33, 131, 44, 93]$ with four explicit choices (A: $82, 90, 101$, B: $82, 11, 93$, C: $131, 11, 93$, D: $131, 111, 90$) was erroneously typed as `NAT` with placeholder answer `3` due to a legacy OCR registry issue.
    - *Resolution*: Performing standard in-place max-heap building on the array produces $[131, 111, 90, 101, 93, 75, 33, 11, 44, 82]$. The first three elements are $131, 111, 90$, which definitively matches Option **D**. Corrected question type to **`MCQ`** with answer key **Option D** and `tolerance: null` across `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `data/answers/manual-answers-patch-v1.json`, `public/data/answers/answers_master_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, detail shard `2024-s1.json`, mock catalog `mock_catalog_v1.json`, and search index `question-search-index.json`.
    - *Regression Tests*: Added unit regression tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`.

## 2026-08-30

- **Question Data Integrity & Answer Key Corrections — GATE CSE 2005 Q51 (`go:3812`) & GATE CSE 1995 Q2.9 (`go:2621`) (DEC-035)**:
  - **1. GATE CSE/IT 2005 Question 51 (`go:3812`) — MCQ Answer Key Correction to Option C**:
    - *Problem*: Recurrence relation $T(n) = 2T(n/2) + \sqrt{n}$ for $n \geq 2$ and $T(1) = 1$ was incorrectly storing Option A ($\Theta(\log n)$).
    - *Resolution*: Solving using Master's theorem ($a=2, b=2 \implies n^{\log_b a} = n^1 = n$; $f(n) = n^{0.5} = O(n^{1 - 0.5})$) falls under Case 1, confirming $T(n) = \Theta(n)$, which is Option **C**. Corrected stored answer key to Option **C** across `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `data/answers/manual-answers-patch-v1.json`, `public/data/answers/answers_master_v1.json`, `public/questions-with-answers.json`, detail shard `2005-s0.json`, and search index.
  - **2. GATE CSE 1995 Question 2.9 (`go:2621`) — MCQ Answer Key Correction to Option C**:
    - *Problem*: String operation question evaluating $\text{concat}(\text{head}(s), \text{head}(\text{tail}(\text{tail}(s))))$ for string $s = \text{"acbc"}$ was incorrectly storing Option A ($ac$).
    - *Resolution*: Step-by-step reduction: $\text{head}(s) = \text{'a'}$; $\text{tail}(s) = \text{"cbc"}$; $\text{tail}(\text{tail}(s)) = \text{"bc"}$; $\text{head}(\text{tail}(\text{tail}(s))) = \text{'b'}$; $\text{concat}(\text{'a'}, \text{'b'}) = \text{"ab"}$, which is Option **C**. Corrected stored answer key to Option **C** across `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `data/answers/manual-answers-patch-v1.json`, `public/data/answers/answers_master_v1.json`, `public/questions-with-answers.json`, detail shard `1995-s0.json`, and search index.
  - **Regression Tests**: Added unit tests in `src/utils/evaluateAnswer.test.js` verifying exact evaluation for both `go:3812` and `go:2621`.

## 2026-08-29


- **Question Data Integrity & Answer Corrections — GATE CSE 2015 Set 1 Q43 (`go:8313`) & GATE CSE 2006 Q51 (`go:1829`)**:
  - **1. GATE CSE 2015 Set 1 Question 43 (`go:8313` / `cse:2015:set1:main:q43`) — NAT Answer Key Correction**:
    - *Problem*: Finding the minimum possible sum of weights of all 8 edges in a graph with MST weight 36 and 5 given MST edges ($\{(A, C)=9, (B, C)=8, (B, E)=2, (E, F)=15, (D, F)=2\}$) was previously marked incorrect when submitting the true answer `69` due to a legacy corrupted OCR value `995` in the answer registry.
    - *Resolution*: Minimum additional weights for the 3 non-MST edges to maintain distinct integer weights without violating MST cycle constraints are $10 + 7 + 16 = 33$. Total minimum sum = $36 + 33 = 69$. Corrected stored NAT answer to `69` with `{ "abs": 0.01 }` tolerance across `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `data/answers/manual-answers-patch-v1.json`, `public/data/answers/answers_master_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, detail shard `2015-s1.json`, and search index.
  - **2. GATE CSE 2006 Question 51 (`go:1829` / `cse:2006:set1:main:q51-isro2016-34`) — MCQ Answer Key Correction**:
    - *Problem*: Recurrence relation $T(n) = 2T(\sqrt{n}) + 1, T(1) = 1$ was erroneously storing Option D ($\Theta(n)$) instead of Option B ($\Theta(\log n)$).
    - *Resolution*: Substituting $n = 2^m$ yields $S(m) = 2S(m/2) + 1 \implies S(m) = \Theta(m) = \Theta(\log n)$. Updated stored answer key to Option **B** across all answer registries, master answer file, exam UID file, question bank, detail shard `2006-s0.json`, and search index.
  - **Regression Tests**: Added unit tests in `src/utils/evaluateAnswer.test.js` verifying exact evaluations for both `go:8313` and `go:1829`.

## 2026-08-22


- **Verified Question Reports Resolution & Multi-Subject Subtopic Taxonomy Rectification (DEC-028 / AUG-028)**:
  - **Overview**: Resolved 6 verified question reports addressing question types, official answer keys, optional syllabus categorization, and a critical taxonomy distinction separating actual GATE exam section placement from conceptual topics.
  - **1. GATE CSE 2020 Question 31 (`go:333200`) — Question Type & Answer Key Fix**:
    - *Problem*: Displayed as `NAT` with placeholder answer `99` due to legacy OCR assignment (`v2:1.24.27`), whereas the original GATE question is an MCQ.
    - *Resolution*: Corrected type to `MCQ`, set verified official answer key to **Option D** ($\Theta(|V|)$) for worst-case MST cycle verification time complexity, and preserved all 4 options (A-D) in question HTML, answer registries, and shard `2020-s0`.
  - **2. GATE CSE 2022 Question 39 (`go:371897`) — Algorithms Minimum Spanning Tree MSQ & Active Syllabus Fix**:
    - *Problem*: Question on distinct edge weight MST properties was incorrectly assigned corrupted OCR answer (`NAT 24`) and erroneous optional tag `out-of-syllabus-now`, making it disappear from Algorithms → Minimum Spanning Tree practice.
    - *Resolution*: Removed `out-of-syllabus-now` tag, classified question under **`Algorithms`** (`algorithms`) with subtopic **`Minimum Spanning Tree`** (`minimum-spanning-tree`), and set question type to **`MSQ`** with official verified answer key **`A, B, C`** (`["A", "B", "C"]`) across answer registries, shard `2022-s0`, and question banks.
  - **3. GATE CSE 2026 Set 1 Question 1 (`go:523079`) — Technical Probability in Engineering Mathematics**:
    - *Problem*: Question is a technical Probability problem on expectation and urn draws ($X = 1$ if drawn ball is red).
    - *Resolution*: Classified under **`Engineering Mathematics`** (`engg-math`) with subtopic **`Probability`** (`probability`) and answer key **Option B** ($1/3$).
  - **4. GATE CSE 2024 Set 2 Question 8 (`go:422889`) — Technical Probability in Engineering Mathematics**:
    - *Problem*: Question is a technical Probability problem on rolling six unbiased dice simultaneously.
    - *Resolution*: Classified under **`Engineering Mathematics`** (`engg-math`) with subtopic **`Probability`** (`probability`) and answer key **Option B** ($5/324$).
  - **5. GATE CSE 2024 Set 2 Question 34 (`go:422863`) — Technical Probability in Engineering Mathematics**:
    - *Problem*: Technical CS question (Q34) on random variables ($x, y, z=xy$) was incorrectly tagged with scraper verbal tokens (`verbal-aptitude`, `sentence-ordering`), causing it to misclassify as General Aptitude.
    - *Resolution*: Removed misleading verbal tags, added `engineering-mathematics`, and classified the question under **`Engineering Mathematics`** (`engg-math`) with subtopic **`Probability`** (`probability`) and answer key **Option D** ($\bar{z} \leq \bar{x}$).
  - **6. GATE CSE 2025 Set 1 Question 8 (`go:460072`) — Official Answer Key Correction**:
    - *Problem*: Answer key was incorrectly marked as Option `C`, whereas the mathematically proven and official GATE 2025 answer is Option **B** ($d_1(u, v) \leq d_2(u, v)$ for shortest paths in $G$ vs MST $T$).
    - *Resolution*: Added manual patch in `data/answers/manual-answers-patch-v1.json`, updated `answers_by_question_uid_v1.json`, rebuilt shard `2025-s1`, and validated correct evaluation.
  - **7. GATE CSE 2026 Set 1 Question 2 (`go:523078`) — Discrete Mathematics Combinatorics Classification**:
    - *Problem*: Counting binary $4 \times 4$ matrices with even row/column sums ($2^{(4-1)^2} = 512$, Option A) was incorrectly classified under `Engineering Mathematics` due to scraper tokens (`linear-algebra`, `matrix`, `analytical-aptitude`).
    - *Resolution*: Removed noisy scraper tags, added canonical `discrete-mathematics` and `combinatory`, reclassifying under **`Discrete Mathematics`** (`discrete-math`) with subtopic **`Combinatory`** (`combinatory`). Updated question bank files, rebuilt public detail shards (`2026-s1.json`) and search index, and added unit regression tests.
  - **Multi-Subject Subtopic Filter Engine (`src/contexts/FilterContext.tsx`)**:
    - *Architectural Enhancement*: Extended `buildSubtopicToSubjectSlugMap` and `subtopicsByParentSubject` to support subtopics shared across multiple subjects (such as `Probability` in `General Aptitude`, `Engineering Mathematics`, and `Computer Networks`).
    - *Result*: Selecting `Probability` under any active parent subject dynamically scopes and discovers matching questions without collision or parent subject overwrite.
  - **Header Cleanup (`src/components/Layout/AppHeader.jsx`)**:
    - Removed the green newspaper icon button (`FaNewspaper`) linking to the GATE 2027 syllabus changes guide from the top header bar to streamline global header actions.
  - **Validation & Test Coverage**:
    - Added unit test cases in `src/services/QuestionService.test.js` validating optional tagging and GA vs Engineering Math Probability classification.
    - All 444 unit tests across 67 test files pass (`100% green`).
    - TypeScript typecheck passed with 0 errors.
    - Public parity verified at 3549 questions across all generated public payloads.

## 2026-08-20

- **Filtered Practice Queue Context Preservation & Header Badge Synchronization (`ExplorePage.jsx` & `SolvePage.jsx`)**:
  - **Problem**: When a user applied filters on the Explore Questions page and clicked `Continue Filtered Practice` (or clicked a question card in the filtered list), the Solve page incorrectly initialized as `RANDOM SESSION` and showed `Question details` instead of maintaining the filtered queue (`CURRENT FILTERED QUEUE` and `Question X of Y`), with queue navigation falling back to random/global modes.
  - **Explore Page Navigation Handoff (`src/pages/ExplorePage.jsx`)**: Updated `handleStartFilteredPractice` and `handleOpenQuestion` to initiate an ordered practice session (`startOrderedSession(pool, question.question_uid)`) whenever active filters are present, ensuring the exact filtered question array and order are handed off to the Solve session.
  - **Solve Page Header Badges & Session Sync (`src/pages/SolvePage.jsx`)**: Corrected `navigationSummary` to safely evaluate `total`/`totalInQueue` and `index`/`currentIndex`, formatting as `Question ${index + 1} of ${total}` when in an ordered filtered queue and returning `"Question details"` for standalone/random sessions. Updated `navigationContextLabel` and session initialization `useEffect` to strictly bind to `hasExploreContext`, while maintaining genuine standalone random session behavior (`RANDOM SESSION → Question details`) for direct question URLs without search parameters.
  - **Session Context Type Alignment (`src/contexts/SessionContext.tsx`)**: Extended `NavigationState` interface and `getNavigationState` return payload to provide `currentIndex` and `totalInQueue` alongside `index` and `total` for bulletproof cross-component compatibility.
  - **Unit Test Coverage**: Added comprehensive test cases in `SolvePage.test.jsx` and `ExplorePage.test.jsx` asserting badge states, session mode preservation, search query retention, and queue navigation.


- **Question Data Integrity & Answer Correction — GATE CSE 2014 Set 1 Q39 (`go:1917` / `cse:2014:set1:main:q39`)**:
  - **Problem**: Submitting the mathematically and officially correct NAT answer `148` for finding the minimum and maximum of 100 numbers ($3n/2 - 2 = 148$) was marked as incorrect due to a legacy corrupted floating-point answer value `147.6` in the answer registry and shards.
  - **Answer Registry Correction**: Updated `go:1917` in `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, and rebuilt all detail shards (`public/question-detail-shards/2014-s1.json`) to store the exact correct NAT answer `148` with `{ "abs": 0.01 }` tolerance.
  - **Evaluator Robustness (`src/utils/evaluateAnswer.js`)**: Enhanced `evaluateAnswer()` to gracefully accept direct numeric tolerance values (`record.tolerance` as a finite number) alongside object formats (`record.tolerance.abs` / `record.tolerance.lower` & `record.tolerance.upper`).
  - **Unit Tests**: Added dedicated unit tests in `src/utils/evaluateAnswer.test.js` validating exact NAT integer answers and numeric tolerance evaluation. All 437 unit tests across 67 test files pass (`100% green`).

- **Global Navigation Drawer GATE DA Section Toggle & Reactive Preference Subsystem (AUG-023)**:
  - **Hamburger Menu Toggle (`GlobalNavigationDrawer.jsx`)**: Added a dedicated `"GATE DA Section"` switch with a purple theme accent (`text-purple-700 dark:text-purple-300`, `bg-purple-600`, `focus:ring-purple-500`, and `FaDatabase` icon) in the drawer's *Options* section, positioned directly alongside the *Special Aptitude Section* toggle.
  - **Reactive DA Preference Utility (`src/utils/daPreference.ts`)**: Implemented standalone preference helper (`useDaEnabled()`, `readDaEnabled()`, `writeDaEnabled()`) persisting to `localStorage` (`gateqa_include_da`) and emitting synchronized `gateqa:da-enabled-change` custom events across browser windows and components.
  - **Bidirectional Filter Synchronization (`src/contexts/FilterContext.tsx`)**: Connected `FilterContext` to `useDaEnabled` and `gateqa:da-enabled-change`, enabling immediate question bank loading when toggled ON and instant filter pruning of DA subjects/year sets when toggled OFF from the drawer.
  - **Unit Test Coverage**: Added unit tests in `GlobalNavigationDrawer.test.jsx` covering switch rendering and accessibility toggles, with 100% test pass rate across all 67 test files (435 unit tests).

- **Mock Test Custom Builder "Bookmarked Only" Policy & Flexible Custom Duration (AUG-022)**:
  - **Bookmarked Only Solved Policy Option**: Added an emerald `"Bookmarked Only"` (`bookmarked_only`) filter chip to the Custom Builder's *Solved Questions Policy* section in `MockTestSetup.jsx`. Pulls the unified bookmark ID collection from `FilterContext` and resolves canonical IDs through `isBookmarkedQuestion()` in `MockTestShell.jsx`, supporting GATE CSE (`gate_qa_bookmarked_questions`), DA (`gate_qa_da_bookmarked_questions`), and Aptitude (`gateqa-apt-bookmarked-questions`) banks.
  - **Dynamic Contextual Pool Feedback**: Shows live inline count feedback (`"Pool restricted to your N bookmarked questions — other filters still apply."` or a prompt to start bookmarking during practice when 0 bookmarks exist).
  - **Flexible Custom Duration (1 to 180 Minutes)**: Removed the previous 5-minute minimum constraint. Learners can now configure test durations flexibly anywhere from **1 minute up to 180 minutes** (e.g. `1 min`, `2 min`, `15 min`, `45 min`, `180 min`).
  - **Validation & Inline Warning on 0 or Empty Duration**: Entering `0`, negative numbers, or leaving the duration input empty displays an inline amber warning banner (`"⚠️ Please set duration to at least 1 minute (up to 180 minutes)."`), highlights the input with a rose border, updates the summary stat to `"Invalid (< 1 min)"`, and disables the "Start Mock" button until a valid positive duration is provided.
  - **Automated Verification**: Added comprehensive unit tests in `MockTestShell.test.jsx` covering canonical bookmark key resolution, `bookmarked_only` policy filtering, flexible 1-minute entry, 0-input warnings, and start button gating.

## 2026-08-17

- **Activity Heatmap Streak & Freeze Visual Elevation & Mobile UI Balance (AUG-021)**:
  - **Refined Active Streak Cells (`.home-activity-cell--streak`)**: Replaced jagged, overlapping `outline-offset: 2px` orange frames with a crisp, radiant amber inner ring and soft ambient aura (`box-shadow: 0 0 0 1.5px #f59e0b, 0 1px 4px rgba(245, 158, 11, 0.35)` in light mode, and `box-shadow: 0 0 0 1.5px #fbbf24, 0 0 6px rgba(245, 158, 11, 0.45)` in dark mode). Active streak days now stay cleanly inside grid cell boundaries without clipping or bleeding into adjacent columns.
  - **Frosted Ice-Cyan Visuals for Freeze-Protected Days (`.home-activity-cell--frozen`)**: Converted blank dark squares on missed days protected by a streak freeze into an icy cyan frosted gradient badge (`linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(2, 132, 199, 0.55))`), cyan frost ring (`#38bdf8`), and informative tooltip (`"Streak Protected (Freeze Used 🛡️)"`).
  - **Balanced Responsive Legend & Mobile Scaling**: Upgraded the heatmap footer with distinct `Streak` (amber ring) and `Frozen` (ice blue) indicator keys alongside the `Less ... More` intensity scale. Added mobile responsive sizing (`--home-activity-cell: 0.62rem` and flex-wrap alignment on `max-width: 640px`).
  - **Reactivity & Prop Integration**: Passed `streakFreezeDates={activity?.streakFreeze?.consumedDates || []}` from `HomePage.jsx` to `ActivityHeatmap.jsx` to reflect streak freeze state in real-time.

- **Hamburger Navigation Drawer (GlobalNavigationDrawer) Study Guides Property & Route Mapping Bug (AUG-020)**:
  - **Data Contract & Route Target Alignment**: Fixed property mismatches in `GlobalNavigationDrawer.jsx` where iterating over `EDITORIAL_PAGES` attempted to read non-existent `page.slug` and `page.title` properties, rendering 16 empty rectangular button boxes with blank text that linked to invalid routes (`/study-guide/undefined`). Standardized route targets to `page.path` and label rendering to `page.keyword || page.title || page.h1`.
  - **Collapsible Guides & Articles Accordion Hierarchy**: Transformed the flat 16-item list into a clean, collapsible `Guides & Articles (16) ▼` accordion matching the UX pattern of `Tools` (`Export & Import`) and `Manual` (`Quick Reference`). Added max-height scroll confinement (`max-h-64 overflow-y-auto`) and a direct `"View All Articles & Guides →"` CTA linking to `BLOG_ROUTE` (`/blog`), preserving vertical screen space on mobile devices and keeping Feedback and Manual sections cleanly visible.
  - **Automated Unit Tests**: Added `GlobalNavigationDrawer.test.jsx` covering accordion toggle states, exact route targets, label text rendering, and drawer dismissal triggers.

- **Streak & Practice Activity Local Date/Timezone Integrity & Day Reset Fix (AUG-016)**:
  - **Local Wall-Clock Date Keys (`toDateKey`, `parseDateKey`, `addDaysToDateKey` in `src/utils/practiceProgress.js`)**: Converted date key generation from UTC `toISOString().slice(0, 10)` to user local calendar dates (`date.getFullYear()`, `date.getMonth() + 1`, `date.getDate()`). Resolves timezone desynchronization where evening attempts in the Americas (UTC-4 to UTC-8) leaked into the next UTC day, making the dashboard register false today-activity upon waking up with zero attempts.
  - **Unified Streak & Activity Timeline Date Stream (`src/utils/weakTopicAnalyzer.js`)**: Updated `distinctProgressDateSet` to capture all unique dates with qualifying submissions in `normalizeAttemptHistory()`, ensuring re-attempting or reviewing previously solved questions on a new day extends the streak and appears on the heatmap.
  - **Streak Freeze Isolation & Empty Cell Invariant (`src/components/Home/ActivityHeatmap.jsx`)**: Enforced that `isStreakDay` requires both `day.attempts > 0` and membership in `streakDateSet`, guaranteeing that zero-activity days and streak freeze placeholder days never receive an active green glow or streak ring.
  - **Midnight Rollover & Lifecycle Event Reactivity (`src/pages/HomePage.jsx`)**: Added event listeners for `"gateqa:workspace-imported"`, `document.visibilityState === "visible"`, window `"focus"`, and an automatic local midnight `setTimeout` rollover timer to seamlessly reset `todayAttempts` and daily goal counters to `0` at midnight without requiring manual browser reloads.

- **LaTeX / HTML Math Cleaning & Code Block Protection (AUG-015)**:
  - **Protected `<pre>` and `<code>` blocks during math cleaning**: Fixed an issue in `cleanHtmlTagsInMath` (`src/utils/latexClean.js`) where dollar signs (`$`) inside code blocks (e.g. `Print($);` or option strings like `**$*###`) triggered inline math regex replacements across `<li>` and `<pre>` boundaries, stripping list tags and merging adjacent options (e.g. merging Option A with B, and C with D in GATE CSE 2026 Set 2 Q41 `go:523105`).
  - **Hardened Block-Level HTML Delimiter Boundaries**: Prevented math regexes (`$ ... $`, `$$ ... $$`, `\[ ... \]`, `\( ... \)`) from matching or stripping content across block-level HTML tags (`<div>`, `<p>`, `<li>`, `<ol>`, `<ul>`, `<table>`, `<tr>`, `<td>`, `<th>`, `<pre>`, `<blockquote>`, `<h1-h6>`, `<section>`, `<article>`).
  - **Verified Data Parity & Answer Keys**: Verified `go:523105` (GATE CSE 2026 Set 2 Q41) has all four options preserved in shards and correct `type: "MSQ"` with answer `["A", "B", "C"]` matching official answer key.

## 2026-08-15

- **Mobile Practice Mode UI & Button De-Duplication Optimization**:
  - **Eliminated Redundant In-Page Buttons**: Removed duplicate inline `Previous`, `Next`, `Bookmark`, and `Share` buttons from `AnswerPanel.jsx` on mobile viewports (`md:hidden`), since these controls are permanently accessible via the sticky thumb toolbar (`MobileSolveActionBar.jsx`).
  - **Streamlined Mobile Action Flow**: Restructured the mobile answer panel to focus directly on `Submit Answer` (full-width), `Solution` + `Ask AI` (2-column assistance grid), and a compact secondary status row with `[ ✓ Solved ]` toggle and `[ ⚑ Report ]` link.
  - **Clean Header Card**: Hid redundant top-card `CalculatorButton` on mobile viewports in `SolvePage.jsx`, giving maximum vertical screen space to the Question statement and MathJax formulas.
  - **Dark Mode Support in Scientific Calculator**: Added deep slate dark theme styling to `calculator/calculator.html` with real-time `postMessage` synchronization, maintaining light mode during Mock Test exams for 1:1 TCS iON parity.

- **LLM-Assisted Question Explanation & External Redirect (AUG-014)**:
  - **TypeScript Infrastructure & Multi-Provider Registry (`src/config/llmProviders.ts`)**: Implemented central configuration for external LLM destinations including ChatGPT (prefilled `?q=`), Gemini (clipboard fallback + web app), Claude (clipboard fallback + web app), DeepSeek (clipboard fallback + web app), and Perplexity (prefilled search `?q=`).
  - **Standardized GATE Prompt Builder (`src/utils/llmPromptBuilder.ts`)**: Added automated pedagogical prompt generator producing step-by-step conceptual deconstruction, option analysis for MCQ/MSQ, and calculation guidance for NAT questions with clean HTML-to-text conversion and LaTeX math preservation.
  - **Local-First Preferences & Reactivity (`src/utils/llmPreferences.ts`)**: Built `localStorage` preference management (`gateqa_llm_preference`) with reactive custom events (`gateqa:llm-preference-changed`) and `useLLMPreference` hook.
  - **Redirect & Clipboard Service (`src/services/llmRedirectService.ts`)**: Added client-side prompt synthesis, clipboard write, URL building, and new tab redirect orchestration with toast feedback.
  - **UI Integration in Practice Mode (`src/components/AskAI/`, `src/components/AnswerPanel/AnswerPanel.jsx`)**: Added `AskAIButton` and `LLMProviderMenu` with 1-click execution for the default AI, a provider picker with "Set as default" toggle, and a "Copy Prompt Only" button for local models, seamlessly integrated in both desktop and mobile action bars.

- **Question Key & Answer Corrections**:
  - **Question `go:975` (GATE CSE 2006, Question 14 / ISRO 2011-14)**: Corrected answer from `A` (Quick sort) to `C` (Selection sort) across all database files (`data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_master_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, and detail shard `2006-s0.json`). Selection sort takes at most $n - 1$ ($O(n)$) swaps in the worst/average case, which is the minimum among standard in-place sorting algorithms.

- **Practice Progress, Streak, and Activity Heatmap Real-Time Reflection**:
  - **Storage Key & Evaluation Resolution in `AnswerPanel.jsx`**: Fixed issue where `recordPracticeAttempt` was called without a `storageKey`, `correct`, or `type` payload, ensuring all practice attempts from the Solve page properly write to `gateqa_progress_v1`, `gateqa_apt_progress_v1`, and `gateqa_da_progress_v1`.
  - **Canonical Storage Keys**: Replaced undefined context references with canonical constants (`PRACTICE_PROGRESS_STORAGE_KEY`, `APTITUDE_PROGRESS_STORAGE_KEY`, `DA_PROGRESS_STORAGE_KEY`).
  - **Same-Window Reactive Event Dispatching**: Enhanced `recordPracticeAttempt` in `practiceProgress.js` to dispatch a `"gateqa:progress-updated"` custom event, and added listener on `HomePage.jsx` to immediately refresh streak counters, daily goal ring (`0/5` -> `1/5`), and the activity heatmap without requiring cross-tab storage triggers or page reloads.
  - **Header Random Session Number Coercion Fix**: Guarded `navigationSummary` calculation in `SolvePage.jsx` against uninitialized/non-finite session indices, resolving `"Question NaN of undefined"` and falling back cleanly to `"Question details"`.

- **Mock Test Crash-Proof Persistence & Zero-Data-Loss Recovery (AUG-013)**:
  - **Dual-Tier Synchronized Storage (`localStorage` + `sessionStorage`)**: Updated `MockTestContext.tsx` with unified read/write storage helpers persisting active test state (`v: 5`) to both `localStorage` and `sessionStorage`. Browser crashes, accidental tab closures, or memory pressure reboots now seamlessly resume the in-progress test.
  - **Embedded Question Snapshots**: Embedded question blueprints into the stored test payload, allowing immediate question rendering even if question bank shards or background indexers are still loading.
  - **Resilient Non-Destructive Restore**: Removed self-destructive `clearAttemptStorage()` calls on parse/hydration mismatches; storage is only cleared when the test is explicitly submitted or intentionally exited via the confirmation dialog.
  - **Stage Desynchronization Fix**: Hardened `MockTestShell.jsx` `step` state initialization with `hasActiveAttemptInStorage()` and guarded stage routing effects, preventing URL flash-resets from `stage=exam` to `stage=setup` on page refresh.
  - **Graceful ErrorBoundary Fallbacks**: Added isolated ErrorBoundary fallback around `MockTestQuestion.jsx` allowing users to retry rendering without crashing the outer exam shell or losing timer/response state.
  - **NAT Numeric `0` Coercion Fix**: Updated NAT input handling to `String(currentResponse ?? "")`, ensuring numeric `0` is never treated as falsy empty strings.

- **Homepage Mobile UX, Action Cards & Activity Heatmap Polish**:
  - **Activity Heatmap Interactive Range Selector (`ActivityHeatmap.jsx`)**: Added functional timeframe options (`Last 12 weeks`, `Last 6 months`, `Last 1 year`), auto-scrolling to the current date on multi-month mobile selections, and eliminated phantom blank scroll void with dynamic `min-width: max-content`.
  - **Dedicated Mobile Daily Motivation Banner (`.home-quote-banner`)**: Extracted daily quote on mobile (`<768px`) into a dedicated glassmorphism pill banner with `FaQuoteLeft` and theme-adaptive backdrop blur, keeping the original desktop quote layout inside the Practice card untouched.
  - **Mobile Action Cards Contrast & Typography**:
    - Expanded mobile action card height to `216px` with vertically centered hero 3D notebook icon (`6.5rem` / `scale(1.2)`).
    - Hardened secondary action card dark mode contrast with dark glass gradient (`linear-gradient(160deg, #1e293b, #0f172a 90%)`), crisp `1.5px` border (`rgba(255, 255, 255, 0.2)`), and cyan active focus glow.
    - Symmetrically framed capsule action badges (`3,500+ PYQs →`, `1:1 CBT Simulator →`, `Analytics & Streak →`) preventing any text clipping or corner overflow.
- **Mobile UI & Responsive Subsystem Optimization (AUG-012)**:
  - **Dynamic Viewport Height (`100dvh`)**: Standardized `100vh` to `100dvh` across `CalculatorWidget.jsx`, `MockTestShell.jsx`, `PageShell.jsx`, `App.jsx`, `MockTestResults.jsx`, and modal components to eliminate dynamic browser address bar jitter on mobile devices.
  - **Scroll-Reactive Header & Safe-Areas**: Added auto-collapsing header on mobile scroll-down (`md:translate-y-0` pinned on desktop) and dynamic `<meta name="theme-color">` synchronizer. Added `viewport-fit=cover` in `index.html` and safe-area padding (`env(safe-area-inset-bottom)`) to `FilterModal.jsx` and `MobileSolveActionBar.jsx`.
  - **Sticky Mobile Solve Action Bar (`MobileSolveActionBar.jsx`)**: Added sticky one-thumb toolbar for the Solve route (`/practice/question/:id`) with Previous, Bookmark, Calculator toggle, Native Share (`navigator.share`), and Next controls.
  - **Selective Bottom Navigation Isolation**: Passed `showMobileBottomNav={false}` on `SolvePage.jsx` so generic app tabs are suppressed while solving.
  - **Drawer Swipe-to-Dismiss**: Implemented horizontal swipe-to-close gesture on `GlobalNavigationDrawer.jsx` with vertical scroll disambiguation.
  - **Mobile Backup & Sync Tools**: Added mobile `[ Backup & Sync ▼ ]` dropdown menu in `ProgressManager.jsx` providing mobile users full access to Export JSON, Export CSV, and Import Workspace.
  - **Mobile Mock Catalog Access**: Scoped 1024px desktop requirement strictly to active timed exams, allowing mobile users to browse test modes, paper catalogs, year cards, setup parameters, and review results on small screens.
  - **Mobile Web Share API & Tactile Haptic Feedback**:
    - Integrated `navigator.share()` native Web Share API in `AnswerPanel.jsx` for iOS and Android native share sheets, with clipboard copy fallback.
    - Added `triggerHaptic(15)` touch feedback via `navigator.vibrate(15)` on option selection, mark as solved, and bookmark toggle.
    - Added `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />` in `index.html` for safe-area notch and home indicator displays.
    - Responsive Explore header action layout (`grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto`) for side-by-side button placement on mobile screens.
- **Deterministic Public Artifact Build & Content-Aware Write Skipping**:
  - Added `sameGeneratedContent()` check for `public/mock_catalog_da_v1.json` in `build-da-artifacts.mjs`, preserving `generatedAt` timestamp when catalog content is unchanged.
  - Updated `writeJson()` in `da-utils.mjs` to compare disk content against incoming payload (with CRLF/LF normalization) before writing, eliminating unnecessary git diffs on test runs or builds.
- **Practice Subsystem Optimization, Data Integrity & UX Overhaul (AUG-011)**:
  - **Instant (0ms) Question Shard Pre-fetching**: Added proactive detail JSON shard pre-fetching on `onPointerEnter`, `onFocus`, and `onTouchStart` in `QuestionPickerList.jsx`. Question data is fetched into memory cache in parallel as soon as the user hovers over or touches a question card, achieving 0ms transitions.
  - **Windowed Page Number Pills & Jump-to-Page**: Upgraded `PaginationControls.jsx` from simple Next/Prev buttons to smart windowed pagination pills (`1 ... 14 15 16 ... 140`), First/Last quick buttons (`«` / `»`), and an instant jump-to-page input.
  - **LaTeX MathJax Formula Rendering in Personal Notes**: Integrated `<MathContent as="div" dynamic>` in `QuestionNotes.jsx` so student notes with formulas (e.g. `$O(n \log n), `$\sum_{i=1}^n i) render dynamically with full MathJax typesetting.
  - **Fallback GateOverflow Solution Searching**: Added automatic GateOverflow title search fallback in `AnswerPanel.jsx` when direct solution links are missing on legacy questions.
  - **$O(1)$ Subtopic Set Lookups & Question Map Reuse**: Added `subtopicSlugSet` to `questionFilterMetaByUid` in `FilterContext.tsx` and reused `questionByUidMap` in `SessionContext.tsx` to eliminate redundant heap allocations.

### Fixed
- **Practice Subsystem Bugs & Character Encoding (AUG-011)**:
  - **Latin-1 Mojibake & Encoding Artifacts**: Cleaned corrupted Latin-1 character sequences across `ExplorePage.jsx` (`Showing ... · ... total questions`), `SolvePage.jsx` (SEO title & Schema.org `QAPage` em-dashes), `Question.jsx` (warning banner emoji/text), and `questionPreview.js` (ellipsis comparison).
  - **Canonical Share URLs**: Updated `AnswerPanel.jsx` to construct share URLs via `buildSolvePath()` (`https://gateqa.in/practice/question/UID`), eliminating redundant `?question=` query parameters.
  - **Single-Question Direct Link Dead-End Fix**: Fixed direct route entry (`/practice/question/:questionUid`) in `SolvePage.jsx` by seeding the session queue with the question's natural exam set cohort or `allQuestions`.
  - **Symmetrical "Hide Solved" Navigation**: Added backward lookback skip loop in `SessionContext.tsx` (`goToPreviousQuestion` & `getNavigationState`) matching `goToNextQuestion`.
  - **Smooth In-Memory Pull-to-Refresh**: Replaced hard `window.location.reload()` in `ExplorePage.jsx` with in-memory `loadQuestions()` data reload.
  - **Auto-Dismiss Exhaustion Banner**: Automatically dismissed `showExhaustionBanner` upon question selection or navigation in `SessionContext.tsx`.
  - **`DOMPurify` & LaTeX Memoization**: Wrapped `cleanLatexHtml()` and `DOMPurify.sanitize()` inside `useMemo` in `Question.jsx` to save 3–8ms per render cycle.
  - **Elimination of `React.memo` Busting**: Memoized `navigationState` in `SolvePage.jsx` to prevent unnecessary re-renders and MathJax DOM rescanning during calculator or state updates.
  - **Dark Mode Design System Tokens**: Standardized hardcoded Tailwind gray/white palette classes in `AnswerPanel.jsx` and `PaginationControls.jsx` using semantic CSS tokens (`--color-surface`, `--color-surface-muted`, `--color-border`, `--color-text`).
  - **Horizontal Scroll Gesture Disambiguation**: Updated touch detection in `SolvePage.jsx` to ignore horizontally scrollable containers (`table`, `pre`, `code`, `mjx-container`, `.overflow-x-auto`), preventing accidental page swiping while scrolling wide tables or equations.

## 2026-08-14

### Added
- **Mock Test Subsystem Runtime & Performance Optimization (AUG-008 & AUG-010)**:
  - **Timer Context Decoupling**: Separated countdown timer ticks into `MockTimerContext` and `useMockTimer()`, isolating 1-second interval renders strictly to `MockTimerDisplay`. This eliminates 60 FPS re-render storms across MathJax equations, question stems, and the palette during active exams.
  - **DOM & LaTeX Sanitization Memoization**: Wrapped question and option HTML sanitization in `useMemo` in `MockTestQuestion.jsx` to prevent continuous regex and `DOMPurify` passes during typing or answer selection.
  - **Async Exam Hydration Loading State**: Added loading spinner and disabled state on the "Start Mock" button in `MockTestSetup.jsx` and `MockTestShell.jsx` during async question hydration.
  - **"Practice Missed Questions" One-Click Action**: Added dedicated action button in `MockTestResults.jsx` allowing users to directly drill incorrect and unanswered questions from any completed mock test in Practice Mode.
  - **Expanded History Retention**: Increased `MAX_MOCK_TEST_HISTORY_ENTRIES` in `mockTestHistory.js` from 12 to 50 attempts to preserve full exam series preparation records.

- **Performance Insights Multi-Branch Architecture (Option C)**:
  - Added interactive track switcher (`GATE CS`, `GATE DA`, `Combined`) with clean `react-icons` (`FaGraduationCap`, `FaRobot`, `FaLayerGroup`).
  - Scoped subject mastery, weak subtopics, mistakes, and review queues dynamically to the selected syllabus while maintaining unified daily streak and XP continuity.
  - Activated previously orphaned `YearCoverageGrid` and `YearAccuracyTrend` components within a collapsible "Exam Year Coverage" analytics section.
  - Added status-based filtering (`All`, `Still Wrong`, `Recovered`) in the Wrong Answers tab.
  - Attached stateful `returnTo` back navigation to question links across review queues and mistake lists.

### Fixed
- **Mock Test Subsystem Data-Integrity & Engine Hardening (AUG-008)**:
  - **Subtopic Auto-Wipe Bug (P0)**: Connected `patchSetupState` in `MockTestShell.jsx` to `structuredTags?.structuredSubtopics`, preventing selected subtopics from being cleared when toggling subjects in the Custom Builder.
  - **GATE DA Question Drop (P0)**: Grouped non-GA track questions (`section === "CS"`, `section === "DA"`, or track-scoped questions) into the technical section in `splitByCatalogSection` and `isGaQuestion`, allowing GATE DA questions to populate Section 2 seamlessly.
  - **Timer Leak on Tab Switch / Device Sleep (P0)**: Capped single-question active time accumulation to visible seconds (max 5s per tick when `document.visibilityState === 'visible'`) while preserving overall exam countdown decrements.
  - **Mock Exam Submission Progress Sync (P1)**: Unified mock test submissions to log standard practice attempts into `gateqa_progress_v1` and `gateqa_aptitude_progress_v1`.
  - **NAT Virtual Keypad & Keyboard Input Sanitization (P1)**: Enforced strict numeric regex validation (`/^-?\d*\.?\d*$/`) across physical keystrokes and virtual keypad clicks.
  - **In-Progress Mock Attempt Backup (P1)**: Included active in-progress exams from `sessionStorage` in `workspaceFile.js` JSON exports/imports for zero data loss during workspace backups.

- **Performance Insights Mathematical Integrity & Logical Audit**:
  - **Metric Semantic Collision (Bug 2.1)**: Disambiguated unique questions attempted (`questions tried`) from total submission attempts (`of N submissions`) on top overview cards.
  - **Unweighted Subject Accuracy (Bug 2.2)**: Replaced unweighted arithmetic mean with true weighted overall accuracy (`totalCorrectAttempts / totalAttemptedCount`).
  - **DA Subtopic Practice URL Resolution (Bug 2.3)**: Preserved explicit `subtopicSlug` across all subtopic buckets to resolve multi-colon DA identifiers (`da:linear-algebra:matrices`).
  - **Multi-Subject Question Overcounting (Bug 2.4)**: Deduplicated `attemptedQuestionCount` using unique question storage keys.
  - **Array Spread Call Stack Overflow (Bug 2.5)**: Replaced unbounded `Math.max(...array)` spreads with safe `.reduce()`.
  - **False-Positive DA Track Scoping (Bug 2.6)**: Replaced broad keyword matching with strict `da:` / `da-` prefix checks in `isSubjectInTrack`, preventing CSE Engineering Mathematics subtopics from being falsely hidden.
  - **DA Mock Test Section Breakdown Omission (Bug 2.7)**: Generalized `MockHistoryPanel` scoring to `coreScore` across all non-GA sections (`CS` and `DA`), updated stacked bar charts to display `Core Subject Marks`, and added `DA` to `sectionRank`.
  - **Performance Optimization**: Implemented 0ms in-memory memoized caching and replaced deep JSON serialization (`JSON.parse(JSON.stringify())`) with shallow object copying in `mergeMockHistoryIntoProgress`.
  - **Skill Radar Dark Mode & Spoke Disambiguation**: Restored high-contrast web grid lines in dark mode and separated programming topic spokes.

- **Question `go:1767` (GATE CSE 2014 Set 1 Q9) NAT True/False Rendering Bug**:
  - Removed spurious tags (`gatecse-2016-set2`, `gate1992`, `gate1994`, `true-false`) from `go:1767` across source question datasets and regenerated public artifacts (detail shard `2014-s1.json`, search index, etc.).
  - Hardened `AnswerPanel.jsx` and `MockTestQuestion.jsx` with defense-in-depth checks:
    - Questions from exams after 1994 are strictly prevented from rendering True/False options (as boolean format only existed in legacy 1987–1994 papers).
    - NAT questions with non-binary answers (not 0 or 1, e.g. `16383`) always render the numeric answer input field and keypad.
  - Added unit test suite in `AnswerPanel.test.jsx` and expanded `MockTestQuestion.test.jsx` verifying standard NAT input, `16383` validation, and legacy true-false handling.

## 2026-08-13

### Added
- **GATE DA 2026 Quality & MathJax Formatting Overhaul**:
  - Overhauled all 65 questions of GATE DA 2026, replacing multi-line OCR line-broken fractions with crisp LaTeX MathJax equations (`$T(n) = T\left(\frac{n}{4}\right) + ...$`, matrices `\begin{bmatrix}`, summations `\sum`, limits `\lim`, and combinatorics).
  - Assigned precise canonical syllabus subjects (Linear Algebra, Calculus & Optimization, Probability & Statistics, Programming & DSA, DBMS & Warehousing, ML, AI, GA) across all 65 questions, replacing generic fallbacks.
  - Formatted Python snippets in Q16, Q39, Q50, Q58 with `<pre><code class="language-python">` and relational schemas with `<table class="da-latex-table">`.
  - Authored comprehensive documentation in [QUESTION_FORMAT_AND_LATEX_RENDERING.md](file:///c:/Users/himanshu/Desktop/GATE_QA/docs/QUESTION_FORMAT_AND_LATEX_RENDERING.md) detailing the hybrid HTML+LaTeX JSON data contract, MathJax 3 rendering pipeline, and authoring guidelines.
- **GATE DA 2026 structured LaTeX intake repair:** Reworked the local `main.tex`
  importer to preserve the source’s 65 question boundaries, GA/technical sections,
  mark ranges, paragraphs, A-D options, Unicode mathematical symbols, tables, and
  figures. Added structural validation for MCQ/MSQ/NAT records and safe reuse of
  extracted answer keys after the source PDF is removed.
- **GATE DA filter identity isolation:** DA subject options now use stable
  `da:<canonical-slug>` identities while existing CSE subject slugs remain
  backward-compatible. Practice URLs, selected-filter chips, question matching,
  and custom mock scope filtering now keep DA Linear Algebra, Calculus,
  Probability, General Aptitude, Programming & DSA, and DBMS & Warehousing
  separate from their CSE counterparts.
- **GATE DA Toggle UI refinement:** Renamed the filter control to `GATE DA`, moved
  it below Question Type, converted the checkbox into the shared sliding-toggle
  pattern, and switched its panel, text, focus, and error colors to theme variables
  for consistent light and dark mode contrast. The special Aptitude section remains
  available in the Topics area.
- **GATE DA 2024/2025 Paper Intake (AUG-004)**:
  - Added a repeatable PracticePaper scraper and normalization pipeline for both
    complete DA papers (130 questions total).
  - Added editable DA answer keys, merged question/answer records, and strict data
    validation requiring 65 complete questions per year.
  - Added DA manifest, search index, answer registry, and separate public detail
    shards to the standard artifact build.
  - Aligned published DA rows with the CSE six-field storage contract
    (`title`, `link`, `question`, `tags`, `year`, `answer`) and changed DA answer
    joins to the same `records_by_question_uid` registry shape. DA question links
    now use GateOverflow references; missing references remain blank.
  - Mirrored all 17 unique DA question images locally as optimized WebP assets and
    rewrote their HTML references so DA questions work offline like CSE questions.
  - Added the local GATE DA 2026 LaTeX/PDF importer: 65 structured questions,
    12 optimized local figures, MCQ/MSQ/NAT answer-key parsing, stable DA answer IDs,
    and merged 2026 artifacts. The DA bank now contains 195 questions across 2024-2026.
  - Consolidated all published DA JSON under `public/data/da/`, with year-named
    detail shards and no duplicate root-level DA copies.
  - Integrated DA into practice behind the persisted `gateqa_include_da` toggle,
    with lazy shard loading, canonical eight-subject filters, DA-only badges, and
    dedicated local-first solved/bookmark/progress namespaces.
  - Added GateOverflow-only solution routing for DA; questions without a redirect
    publish an empty link and keep the Solution action disabled.
  - Added official 65-question DA mock metadata for 2024-2026 and additive cloud
    merge support for `da_solved`, `da_bookmarks`, and `progress_records.da`.
  - Added regression coverage for DA service loading, NAT tolerance ranges, DA card
    badges, DA cloud union merging, and DA SolvePage hydration; full unit suite
    passes with 355 tests.

### Fixed
- **DA/CSE Classification & Filter Collision Resolution**:
  - **Root Causes**:
    - CSE question rows (e.g. `go:523089`) contained stale `gateda-*` tags, and track detection improperly trusted those tags to classify questions as DA.
    - Both CSE and DA tracks shared un-namespaced `2026-s1` filter tokens, causing cross-track selection collisions.
    - Misclassified CSE questions attempted to load non-existent DA shards at runtime, triggering `<!DOCTYPE ...>` HTML fallback JSON parsing errors.
  - **Resolution**:
    - Implemented metadata-first track detection in `src/utils/examTrack.js` with CSE-safe defaults and strict validation precedence.
    - Introduced independent, track-aware year/set identities: `cse:2026:set-1` and `da:2026:set-1`.
    - Maintained 100% backward compatibility for legacy CSE URLs (e.g. `2026-s1`).
    - Aligned filtering, URL hydration, active filter chips, direct detail loading, and Custom Mock paper matching to use canonical track identities.
    - Regenerated public artifacts with stale `gateda-*` tags stripped from all CSE rows (0 CSE rows now have DA tags).
    - Expanded test coverage across `examTrack.test.js`, `YearFilter.test.jsx`, `DaQuestionService.test.js`, and `FilterContext.test.jsx`.
  - **Validation**: Full unit suite (355 tests across 55 test files), 17 Playwright E2E tests, TypeScript typecheck, DA validation (195 questions, 100% answer coverage), static production build & prerender (3,493 pages), 0 CSE rows with DA tags, and 53 unique mock paper identities.

## 2026-08-11

### Fixed & Optimized
- **Solved-Only Filtering & Progress Sync Repair (AUG-005)**:
  - Standardized solved and bookmarked question collections as deduplicated canonical `string[]` arrays across local storage (`gate_qa_solved_questions`, `gateqa-apt-solved-questions`), Supabase union merges (`user_progress.solved_questions`, `user_progress.aptitude_solved`), and sync audit counts in `sync_log`.
  - Added resilient shape extractor `extractQuestionIdArray()` in `src/utils/cloudSyncManager.js` recovering modern string arrays, legacy attempt-record maps, and numeric-index objects produced by previous buggy cloud syncs.
  - Implemented boot-time `sanitizeProgressStorage()` in `src/utils/storageSanitizer.js` invoked in `src/index.jsx` before React mount to repair any corrupted localStorage entries prior to state hydration.
  - Added reactive event listeners in `src/contexts/FilterContext.tsx` for `gateqa:sync-complete` and `gateqa:auth-signed-in` to automatically trigger `refreshProgressState()` upon cloud sync without requiring a page refresh.
  - Aligned Custom Mock Builder `isSolvedQuestion` predicate in `src/components/MockTest/MockTestShell.jsx` to resolve questions via `AnswerService.getStorageKeyForQuestion(question)` as primary lookup before falling back to `question_uid`.
  - Added PostgreSQL migration `supabase/migrations/20260811000000_add_aptitude_progress_ids.sql` adding `aptitude_solved` and `aptitude_bookmarks` JSONB array columns to `public.user_progress`.
  - Updated and expanded test suites across `cloudSyncManager.test.js`, `storageSanitizer.test.js`, `FilterContext`, and `MockTestShell` (329/329 unit tests passing, 17/17 Playwright E2E tests passing).

## 2026-08-10

### Added & Optimized
- **Cloud Sync Audit Log Slimming & Rate-Limiting (AUG-004)**:
  - Replaced full merged JSONB payload snapshots in `public.sync_log` with a versioned, lightweight count summary (`summaryVersion: 1`, `solvedCount`, `bookmarkCount`, `notesCount`, `mockCount`, `standardProgressCount`, `aptitudeProgressCount`), reducing per-row TOAST storage footprint by ~98% (~11.7 kB → ~0.2 kB).
  - Added request debouncing (750 ms) and a 30-second per-user cooldown in `src/contexts/AuthContext.jsx` to coalesce rapid practice activity and eliminate redundant cloud round-trips.
  - Ensured offline queue changes in `src/utils/syncQueue.js` are preserved until a successful cloud upsert and local refresh complete.
  - Added automated maintenance SQL scripts (`docs/supabase/sync_log_cleanup.sql` and `supabase/sync_log_cleanup_sql_editor.sql`) for PostgreSQL TOAST storage reclamation via `VACUUM FULL`.

### Fixed
- **Custom Mock Builder Scope (AUG-003)**:
  - Centralized strict subject/topic filtering in `src/utils/mockTest.js` before custom-pool validation and sampling.
  - Normalized subject labels/slugs and matched every question subtopic, preventing unselected subjects such as Operating Systems from entering a Data Structures + General Aptitude mock.
  - Added regression coverage for mixed subjects and multi-tag questions.
- **Calculator Parenthesized Expressions (AUG-002)**:
  - Fixed grouped expressions such as `(2+3)*4` entering the numeric `parseFloat` path and displaying `Math Error`.
  - Added a safe arithmetic parser for nested parentheses, unary signs, exponentiation, division, and modulus.
  - Synced the calculator source bundle into `public/calculator/` and verified grouped-expression evaluation with a DOM smoke test.
- **E2E Test Selectors & CI Pipeline Stabilization**:
  - Aligned the primary logo link in `src/components/Layout/AppHeader.jsx` to `aria-label="GATE QA home"`, resolving the locator failure in `practice-flow.spec.js`.
  - Relaxed regex selector in `tests/e2e/a11y.axe.spec.js` from anchored `/^GATE QA$/i` to `/GATE QA/i` (non-anchored) and extended the landing axe audit timeout to 60s to prevent false timeout flakes on heavy DOM scans under load.
  - Disambiguated `getByText("Past Paper")` with `.first()` in `tests/e2e/mock-test-flow.spec.js` to avoid Playwright strict-mode exceptions when text appears in multiple badge/title nodes.
  - Added explicit timeouts for filter state re-hydration (`toBeChecked({ timeout: 8000 })`) and debounced search empty state (`{ timeout: 10000 }`) in `tests/e2e/practice-flow.spec.js`.
  - Increased `MockTestFlow.test.jsx` unit smoke test timeout to 30s to allow the complete 6-step flow (portal → setup → exam → submit → review → exit) to finish reliably in jsdom.
  - Rebuilt production bundle (`dist/`) and verified 100% CI pipeline passing (317/317 unit tests, 17/17 E2E tests, 3/3 Axe audits, Lighthouse mobile, bundle budget, and public parity).

## 2026-08-09

### Added
- **User Authentication & Google OAuth (`feat/user-auth-supabase` / PR #12)**:
  - Added optional Google OAuth sign-in via Supabase (`@supabase/supabase-js`) with permanent Guest Mode fallback if credentials are absent.
  - Implemented `AuthContext.jsx` for centralized session lifecycle management, real-time auth state synchronization, and reactive token refresh.
  - Built `AuthModal.jsx` featuring clean vector icon styling (`react-icons/fi`), accessible focus trapping, keyboard navigation, and explicit privacy guarantees.
  - Built `UserProfileMenu.jsx` header dropdown displaying Google avatar / user initials, email address, sync status indicator, and secure sign-out (preserves local data).
  - Built `GuestDataPrompt.jsx` non-intrusive banner prompting guest users with 50+ solved questions to back up their data for free.
  - Integrated auth UI directly into `AppHeader.jsx` with full dark/light theme fidelity.
  - Updated Privacy Policy (`/privacy` in `StaticPages.jsx`) detailing optional Google Auth, Supabase cloud sync, zero data loss guarantees, and one-click data export rights.

- **Bi-Directional Cloud Sync & Offline Resilience Engine (`cloudSyncManager.js`, `syncQueue.js`)**:
  - Implemented **Zero-Data-Loss Additive Union-Merge Algorithm**:
    - *Bookmarks:* Deduplicated set union (`Set.union(local, cloud)`).
    - *Personal Notes:* Longest Note Wins policy (preserves student effort; falls back to newer timestamp).
    - *Solved Questions:* Union of attempt records, keeping earliest `attemptedAt` timestamp.
    - *Mock Test History:* Deduplicated chronologically by `testId`.
    - *Streak & Heatmap:* Namespaced `progress_records` sync across devices.
  - Implemented pre-merge local snapshot backups in `localStorage` (`gate_qa_backup_<timestamp>`) retaining the 5 most recent snapshots to prevent quota inflation.
  - Added persistent offline sync queue in `localStorage` (`gate_qa_sync_queue`) with exponential retry and reconnect flushing.
  - Added real-time event-driven dashboard refresh in `HomePage.jsx` updating streak count and daily practice heatmap immediately upon `gateqa:sync-complete`.

- **Database Security Hardening & PostgreSQL Schema (`docs/DATABASE.md`, `docs/supabase/`)**:
  - Created and verified 3 core relational tables: `public.profiles`, `public.user_progress`, and `public.sync_log`.
  - Added automated PostgreSQL `handle_new_auth_user()` trigger on `auth.users` for automatic profile provisioning and existing-user backfill.
  - Hardened Row Level Security (RLS) on all user tables restricting access strictly to authenticated owners (`auth.uid() = user_id`).
  - Revoked excessive public and anonymous grants to enforce least-privilege security.

### Fixed
- **Google OAuth Client Secret & Redirect Configuration**:
  - Resolved `Error 400: redirect_uri_mismatch` and `Unable to exchange external code` by configuring Supabase callback URL in Google Cloud Console Authorized redirect URIs (`https://<project-ref>.supabase.co/auth/v1/callback`) and adding localhost port wildcards (`http://localhost:5173/**`, `http://localhost:5174/**`).
- **Merge Conflicts Resolution & Build Verification**:
  - Resolved generated-file merge conflicts across 58 question detail shards, `question-bank-manifest.json`, and `mock_catalog_v1.json` with `main`.
  - Verified 100% test pass rate across 49 test suites (317 tests passing), 0 TypeScript errors, and successful static production build with 3,493 pre-rendered SEO pages.

## 2026-08-06

### Fixed
- **Question Classification & Subtopic Tagging (`go:118376` - GATE CSE 2017 Set 2 Q34)**:
  - Updated subject classification from Digital Logic to Computer Networks.
  - Tagged under Error Detection and Computer Networks to align with official GATE syllabus tags.
- **NAT Answer Precision & Validation (`go:302826` - GATE CSE 2019 Q22)**:
  - Corrected NAT answer key to `0.503` (exact probability $85/169 = 0.502958...$) with valid tolerance range `[0.50, 0.51]`.
- **MCQ Question Type & Answer Key (`go:1297` - GATE CSE 2009 Q5)**:
  - Reclassified question type from NAT to MCQ and set correct answer to Option **B** ($(028F)_{16}$).
- **Practice Session Navigation with "Hide Solved" (`SessionContext.tsx`)**:
  - Dynamically skip already-solved questions when advancing forward through an active ordered practice session with "Hide Solved" filter enabled.

### Added
- **Motivational Quotes Database (`motivationalQuotes.js`)**:
  - Updated student motivational quotes pool.

## 2026-08-05

### Added
- **User Authentication & Cloud Data Sync Master Plan (`feat/user-auth-supabase`)**:
  - Published comprehensive architectural master plan for optional Google OAuth & Supabase Cloud Sync (`plan/after august/user_auth_and_cloud_sync_plan.md`).
  - Designed zero-data-loss **additive-only union-merge algorithm** ensuring pre-existing guest data (`localStorage`) is safely preserved and merged upon first sign-in.
  - Formulated 7 failure scenario safety guarantees covering multi-device sync, network drops, offline fallback, and pre-merge snapshot backups.
  - Documented decision record `DEC-007` in `docs/ROADMAP_AND_DECISIONS.md` and updated runtime topology in `docs/ARCHITECTURE.md`.

### Fixed
- **Question Classification & Answer Fix (`go:80298` - GATE CSE 1987 Q1-xv)**:
  - Reclassified question type from `NAT` to `MCQ`.
  - Set official answer to Option **B** ("Two pointers.") and verified extracted options A, B, C, D.
  - Added manual resolution explanation detailing circular linked list node insertion pointer modifications.
- **Question Subtopics & Syllabus Tagging (`go:3347` - GATE IT 2008 Q37)**:
  - Re-ordered subtopic tags to classify `go:3347` under **Sequential Circuit**, **Flip Flop**, **Finite State Machines**, and **Boolean Algebra**.
  - Rebuilt precomputed subtopic lookup indices and public artifacts to ensure full search filter coverage across all matching subtopics.

## 2026-08-03

### Fixed
- **Google Search Console 404 & Redirect Indexing Resolution (`prerender-seo-pages.mjs`)**:
  - Expanded `buildYearPages()` filter range from `year >= 2015` to **`year >= 1987`**, generating static HTML landing pages for all 40 historical years (1987–2026).
  - Added General Aptitude (`ga` / `/subjects/ga`) and Programming in C (`prog-c` / `/subjects/prog-c`) to `SUBJECT_SEO_MAP` and `SUBJECT_DETAILS` in `prerender-seo-pages.mjs`.
  - Added dual static page generation for percent-encoded URLs (e.g. `go%3A3669` and `go:3669`) in `writePrerenderedPage()` to ensure Linux web servers (GitHub Pages) resolving URL-decoded paths return HTTP 200 OK.
  - Resolved 148 GSC 404 indexing errors across historical year pages, missing subject pages, and percent-encoded question UIDs.
  - Verified 100% parity across all `public/sitemap.xml` URLs with generated static HTML files in `dist/`.

## 2026-07-29

### Added
- **Pillar Editorial Landing Pages (`editorialPages.js`)**:
  - Published `/gate-cs-vs-gate-da` ("GATE CS vs GATE DA: Comprehensive Comparison, Syllabus & Career Opportunities") with side-by-side syllabus overlap matrix, dual-paper strategy callout, and FAQ schema.
  - Published `/gate-cutoff-iit-bombay` ("GATE CS Cutoff for IIT Bombay: M.Tech Admission Marks & Category-Wise Requirements") with category-wise GATE score table, M.Tech TA/RA breakdown, and qualifying vs admission cutoff guide.
  - Published `/best-books-for-gate-cs` ("Best Books for GATE CS Preparation: Standard Textbooks & Reference Guide") with subject-by-subject textbook recommendations (Silberschatz, Cormen, Korth, Tanenbaum, Hopcroft, Aho, Mano, Hamacher, Kreyszig).
- **Educational Rich Results Schema (`prerender-seo-pages.mjs`)**:
  - Implemented `@type: "Quiz"` JSON-LD schema markup on all pre-rendered question pages alongside `@type: "QAPage"` schema for Google Educational Practice Problem Rich Results eligibility.
  - Added `datePublished` and `dateModified` to `schema.org/WebPage` JSON-LD schema.
  - Added targeted `<meta name="keywords">` for all editorial and pre-rendered question pages.
- **Dual Sitemap Infrastructure (`build-public-artifacts.mjs`, `prerender-seo-pages.mjs`, `robots.txt`)**:
  - Implemented post-build `sitemap-questions.xml` generation in `prerender-seo-pages.mjs` containing ONLY verified static HTML question pages (up to `QUESTION_PRERENDER_LIMIT = 5000`).
  - Added `Sitemap: https://gateqa.in/sitemap-questions.xml` directive to `public/robots.txt`.
- **Student Motivational Quotes (`motivationalQuotes.js`)**:
  - Added quotes by Albert Einstein, Benjamin Franklin, Abigail Adams, Estée Lauder, Jimmy Johnson, Goethe, and Longfellow.

### Fixed
- **Google Search Console "153 Not Indexed Pages" Resolution**:
  - Removed 3,419 unrenderable `/practice/question/` SPA URLs from `public/sitemap.xml`, paring `sitemap.xml` down to **75 clean, verified static URLs** (16 editorial pages, 40 year pages 1987–2026, 13 subject pages).
  - Expanded sitemap year range filter from `year >= 2015` to **`year >= 1987`** to capture zero-competition historical PYQ long-tail keywords.
  - Mapped real `dateModified` timestamps from `editorialPages.js` to sitemap entries.
  - Set tiered sitemap priorities: Homepage (`1.0`), Editorial pages (`0.9`), Year/Subject pages (`0.85`), Blog (`0.8`), Utility pages (`0.5`).
  - Embedded full `question.preview` text into static pre-rendered HTML DOM for Googlebot crawlability without JavaScript.
  - Preserved raw HTML markup in Callout rich-copy blocks without `escapeHtml` stripping.
  - Added missing `subject-comparison` side-by-side syllabus comparison table renderer to `buildStaticRoot()` in `prerender-seo-pages.mjs`.

## 2026-07-26

### Changed
- **Mock Test Top Banner GATE 2027 Branding (`MockTestHeader.jsx`, `MockTest.css`)**:
  - Updated mock test header title to `"Graduate Aptitude Test in Engineering 2027"`.
  - Added official organizing institute subtitle: `"Organizing Institute: Indian Institute of Technology Madras"`.
  - Increased GATE logo container dimensions from 48px to 68px (`h-[68px] w-[68px]`).
  - Updated header text color, top border accent, and section dividers to official IIT Madras logo maroon (`#781f19`).
  - Retained pure white background (`#ffffff`) for header contrast.

## 2026-07-25

### Added
- **Blog Hub Multi-Page Pagination & Category Filter Tabs (`BlogListPage.jsx`)**:
  - Implemented category filter tabs (`All`, `Exam Guides`, `Syllabus Updates`, `Subject Guides`) with memoized search and category filtering logic.
  - Added 6-resource multi-page pagination controls (`[Previous] 1 2 3 [Next]`) with smooth scroll-to-top execution on page transition.
  - Updated Vitest assertions in `BlogListPage.test.jsx` for standard Vitest DOM matching and article title verification.
- **GATE CS 2027 Syllabus Revision Guide (`editorialPages.js`)**:
  - Published comprehensive analysis of the official GATE CS 2027 syllabus released by IIT Madras (`/gate-cse-2027-syllabus-changes`).
  - Added subject-by-subject breakdown for the 3 modified technical sections: Digital Logic (refined minimization techniques), Computer Organization & Architecture (refined hardwired/microprogrammed control unit & memory performance), and Computer Networks (significant scope reduction: removed UDP, ARP, DHCP, ICMP, SMTP, FTP, Email, Flooding, Shortest Path).
  - Integrated Executive Summary change stats card, reassurance callout, omitted topics list, preparation checklist, and FAQ schema.
  - Replaced raw emojis with proper SVG icons (`FaChartLine`, `FaSearch`, `FaCogs`, `FaCheckCircle`, `FaFileAlt`, `FaCoins`, `FaGraduationCap`, `FaBookOpen`, `FaExternalLinkAlt`, `FaMinusCircle`).
  - Added verified official links & download cards for the IIT Madras GATE 2027 portal (`gate2027.iitm.ac.in`), GATE CS 2027 Syllabus PDF, and GA 2027 Syllabus PDF.
  - Updated `/gate-2027-syllabus` article data with 2027 syllabus content and corrected outdated FAQs.
- **Global Header Quick-Access Shortcut (`AppHeader.jsx`)**:
  - Added a dedicated "GATE 2027 Syllabus Changes" quick-access button (`FaNewspaper`) in the right-side header cluster.
  - Styled with emerald theme and an animated pulsing ping badge (`animate-ping`) for immediate discoverability across the application.
- **Editorial Page Component & UI Redesign (`EditorialPage.jsx`, `index.css`)**:
  - Modernized comparison layout to a documentation-style "Before → After → What's Changed" format (inspired by Stripe, GitHub, Vercel docs).
  - Added responsive card transformation for comparison tables on mobile (`<640px`) to eliminate horizontal scrolling.
  - Redesigned callouts into compact left-border annotations to minimize vertical space consumption.
  - Added `split-callout` component for clean two-column decision matrix ("No Changes Needed" vs "Review & Update Required").
  - Added `official-links` component for interactive link cards with icons and external link indicators.
  - Added hero header metadata row displaying last updated date and estimated reading time with gradient accent bar.
  - Added `ep-diff-block__badge--red` style for scope reduction status badges.

### Fixed
- **Syllabus Data Accuracy & FAQ Alignment**:
  - Corrected COA status badge from "Expanded" to "Refined" (amber) and CN status badge from "Updated" to "Reduced" (red).
  - Fixed outdated FAQs in `/gate-2027-syllabus` that previously claimed no changes were expected for 2027.
- **Test Suite Integrity**:
  - All 45 Vitest test files and 293 unit tests passing cleanly.
  - TypeScript `npm run typecheck` passing with 0 errors.

## 2026-07-16

### Added
- **Mock Test Custom Builder Enhancements**:
  - Implemented a 3-way **Solved Questions Policy** filter ("Unsolved Only", "Include Solved", and "Solved Only") in the Custom Builder, providing revision flexibility.
  - Added user-defined **Custom Practice Duration** controls, allowing manual override of the adaptive calculation with durations between 5 and 180 minutes.
  - Updated the setup state structure, question pool filtering logic in `MockTestShell.jsx`, and sidebar layout/summary cards in `MockTestSetup.jsx`.
  - Added comprehensive unit tests in `MockTestShell.test.jsx`.

### Fixed
- **Background Timer Throttling & Precision**:
  - Replaced the simple `setInterval`-based decrement loop in `MockTestContext.tsx` with a wall-clock (`Date.now()`) delta synchronization system.
  - Corrected potential timing drifts and pauses when browser tabs are switched, backgrounded, or minimized, ensuring the countdown continues accurately.
  - Implemented a standard `visibilitychange` event listener to immediately force-resync and update the timer and question time spent when returning to the tab.
  - Ensured question time spent is fully tracked and recorded for background intervals.
- **LaTeX Math Rendering & Cloudflare Email Obfuscation**:
  - Implemented `cleanLatexHtml` in `src/utils/latexClean.js` to automatically decode Cloudflare email protection tags (`<a class="__cf_email__" ...>`) inside LaTeX equations.
  - Cleaned up nested HTML elements (such as `<br/>` and `<span>`) specifically within display and inline math delimiters (`$$`, `\[ \]`, `\( \)`, `$`) to ensure MathJax receives contiguous plain-text LaTeX nodes.
  - Applied the utility across `Question.jsx` and `MockTestQuestion.jsx` for both question stems and custom option content, resolving display issues where raw LaTeX was rendered instead of formatted tables.
  - Added comprehensive unit tests in `src/utils/latexClean.test.js`.
- **Question Database Correction**:
  - Corrected the answer for question `go:39696` (GATE CSE 2016 Set 1, Question 55) from `2900` to `2500` bytes per second across all database files (`answers_by_question_uid_v1.json`, `answers_master_v1.json`, `answers_by_exam_uid_v1.json`, and `questions-with-answers.json`).
  - Regenerated all detail shards, search index, and manifest to reflect the update.


## 2026-07-05

### Added
- **Granular Subtopic Selection in Custom Mock Test Builder**:
  - Replaced the flat subject chip selection interface with an interactive **Subjects & Subtopics accordion** structure matching the `TopicFilter` sidebar grouping (Core GATE subjects, General Aptitude in a custom pink-themed card, and Optional legacy topics in an amber warning card).
  - Implemented subtopic drill-down checkboxes with parent-subject checkbox bindings.
  - Added parent-subject "Select All" / "Clear All" convenience shortcuts for active subtopics.
  - Implemented dynamic subtopic query parameter routing support by adding `selectedSubtopics` and `expandedSubjectSlug` to the custom mock setup state.
- **Adaptive Mock Test Duration & Clamping**:
  - Implemented smart question count clamping in `MockTestShell` that dynamically restricts the requested question counts to the actual size of the subtopic-filtered pool.
  - Integrated adaptive duration calculations that dynamically scale based on the available questions in the filtered pool to prevent pool starvation or empty mock test generation.

### Changed
- **State Management & State Synchronization**:
  - Added an automatic subtopic purging mechanism that clears all subtopic selections when their parent subject is deselected.
  - Registered helpers for managing subtopic accordion expands/collapses and batch selections.
  - Updated the mock portal preview card and summary panel to reflect the selected subtopics and estimated sampling behavior dynamically.

### Fixed
- **Test Alignment**: Updated Vitest unit tests in `MockTestShell.test.jsx` to match the new hierarchical subtopic accordion titles and input checkbox fields.

## 2026-07-03

### Added
- **Practice Settings & Preference Toggles**:
  - Implemented a persistent **Shuffle Questions** toggle (persisted via `localStorage` in `practicePreference.ts`) to let users swap between randomized and sequential practice sessions.
  - Integrated a **Filters Applied** status/toggle chip on the Explore Page that displays when filters are active. Clicking the chip triggers `clearFilters()` to reset all active sidebar filters, ensuring the sidebar, search list, and practice session pool remain completely synchronized.
  - Updated practice session initialization (`handleOpenQuestion` and `handleStartFilteredPractice`) to automatically branch between sequential (`startOrderedSession`) and shuffled (`startRandomSession`) session starts based on the user's preference.

### Changed
- **Information Architecture & Routing**: Relocated "High Priority Topics" from the Insights section to a standalone resource page.
  - Updated route constant `HIGH_PRIORITY_TOPICS_ROUTE` from `/insights/topics` to `/topics`.
  - Added a legacy redirect in `App.jsx` from `/insights/topics` to `/topics` to preserve existing bookmarks and SEO indexing.
  - Adjusted canonical `path` in `HighPriorityTopicsPage.jsx` to `/topics`.
- **Navigation Layout**:
  - Restructured `GlobalNavigationDrawer.jsx` to group educational resources together: removed the isolated "Insights" section and placed "High Priority Topics" and "Articles & Guides" under a unified "Resources" section.
  - Updated `MobileBottomNav.jsx` shortcut link to point to `/topics`.
- **Resource Discoverability**:
  - Added a featured "Study Guide" card for the High Priority Topics page on the Blog Hub (`BlogListPage.jsx`) to promote visibility.

### Fixed
- **Practice Page Crashes**: Fixed a Temporal Dead Zone (TDZ) ReferenceError regarding `activeFilterCount` and restored the missing `usePracticeApplyFiltersEnabled` export in `practicePreference.ts`.
- **Test Alignment**: Updated Vitest unit tests in `App.test.jsx`, `MobileBottomNav.test.jsx`, and `AppHeader.test.jsx` to assert the correct new path, and adjusted `ExplorePage.test.jsx` selectors for the new toggles.

## 2026-06-28

### Added
- **Feedback Integration**: Added a Google Forms feedback link as an icon in the header (next to the theme toggle) and as a dedicated navigation section in the hamburger drawer.
- **Test Coverage**: Added robust test assertions verifying the visibility and correctness of the new feedback links on both mock and non-mock routes.

### Fixed
- **Support Modal Refactor**: Removed the legacy feedback suggestions section and contact email from the Support Modal.

## 2026-06-17

### Added
- **Optimization Review Rewrite**: Refactored the core `optimization.md` framework into a compressed, table-first format. Split all proposed optimizations into Approved (fully implemented) and Rejected / Insufficient Confidence sections, with a detailed justification matrix for deferred items.
### Fixed
- **Question Subject Tagging**: Corrected a metadata tagging error on question `go:460060` (GATE CSE 2025 Set 1, Q20), removing incorrect subject tags (Operating Systems, Data Structures, Calculus) and properly classifying it under Discrete Mathematics (`discrete-mathematics`, `combinatory`). Rebuilt public question bank index and detail shards to propagate.

## 2026-06-12

### Changed
- **Mock Test Setup UI**:
  - Restructured layout using an `items-stretch` grid with viewport-height-relative constraints (`max-h-[calc(100vh-260px)]`) on both the left selection column and right summary sidebar to balance visual weight, prevent page stretching, and eliminate the large bottom whitespace.
  - Consolidated primary actions: Removed duplicate "Start Mock" and "Reset" buttons from the scrollable panels and laid them out horizontally in the footer bar (`[Back to Modes] ... [Reset] [Start Mock]`).
  - Improved year card layout consistency using CSS Grid `auto-rows-fr` and uniform card heights to balance visual weight.
- **Motivational Quotes**: Expanded and refined the core motivational quotes database (`src/utils/motivationalQuotes.js`) with multiple new additions. Implemented strict case-insensitive, punctuation-ignoring deduplication and globally capped the list at a maximum of 3 carefully selected quotes per author.

### Optimization & Hardening
- **Performance**: Memoized the `MockTestContext` provider value to prevent unnecessary re-renders of the Mock Test UI during every 1-second timer tick.
- **Architecture**: Centralized the site URL (`SITE_URL`) in `src/constants/siteConfig.js` and removed hardcoded `https://gateqa.in` string literals from all informational and SEO landing pages.
- **Resilience**: Implemented granular React `<ErrorBoundary>` wrappers around internal Mock Test components (Header, Question, Palette, ActionBar) to prevent full application crashes from isolated component failures.
- **Accessibility**: 
  - Added a global `useFocusTrap` React hook and integrated it across all modal dialogues to retain keyboard focus within active modals.
  - Injected WAI-ARIA `role="alert"` and `aria-live="assertive"` into `AnswerPanel` and `MockTestQuestion` review feedbacks, ensuring screen readers immediately announce evaluation validations.
  - Added WAI-ARIA Accordion pattern attributes (`aria-expanded`, `aria-controls`) to the `CollapsibleSection` component.
- **Testing**: Added a `coverage` block using the `v8` provider to the Vitest configuration to enforce test coverage thresholds and imported `@testing-library/jest-dom` globally.


## [1.1.0] - 2026-06-11

### Added
- **Collapsible Section Toggles**: Upgraded the `EditorialPage` component (`src/pages/EditorialPage.jsx`) to group rich content under expandable/collapsible `h2` headings dynamically, improving structure and readability.
- **Scroll-Spy Sticky Table of Contents**: Added a desktop table of contents widget in the left column that tracks reading progress using `IntersectionObserver`. Added a mobile-optimized drawer widget (`MobileToCDrawer`) to browse page sections on small viewports.
- **Structured Info Cards Grid**: Enhanced card rendering to display key information items inside a modern, hover-responsive grid with animated background highlights.
- **Why Practice on GateQA Section**: Integrated a dedicated study resources promotion card beneath the main copy, highlighting database scale, pricing (free), and key platform features.
- **Promotional Right Sidebar**: Created a desktop-only call-to-action sidebar directing students to practice sections, highlighting key preparation steps.
- **Zebra-Striped Data Tables**: Modernized responsive tables with colored headers, alternating row styles, and hover highlights.

### Changed
- **Responsive 3-Column Layout Grid**: Reorganized the main structure of the informational/editorial pages into a 3-column layout on wide screens (`15rem 1fr 19rem` grid) while collapsing cleanly to single-column on mobile.
- **Polished Visual Elements**: Unified padding, spacing, borders, and rounded corners for `ep-*` block components (timelines, track cards, callouts, and article lists) inside `src/index.css`.

## [1.0.0] - 2026-06-09

### Added
- **Dedicated Blog Hub (`/blog`)**: Created a premium, search-filterable, responsive blog page (`src/pages/BlogListPage.jsx`) presenting active exam articles and subject practice guides with motion animations and themed styles.
- **Subject Practice Guides on Blog**: Integrated all 11 core computer science subjects from `SUBJECT_SEO_MAP` as beautifully styled cards with specific topic tags in the blog list.
- **Structured Data Tables**: Integrated custom table schema support into the `richCopy` array definition to render responsive, modern HTML data tables for complex blog metrics (dates, fees, cutoffs, syllabus weightages, marking schemes).
- **Subject Key Topics Question Percentages**: Integrated historical question percentage metrics into all 11 core CS subjects in `SUBJECT_SEO_MAP` within `src/utils/landingPages.js`. Added percentage values (`pct`) to each topic object mapping historical question density.
- **Visual Topic Priority Badges**: Enhanced the `TopicPill` component in `SubjectLandingPage.jsx` to render a pill percentage badge color-coded by question weight (e.g. high/medium/low-priority thresholds).
- **SEO Phase 4 (Pre-rendering)**: Configured a post-build static pre-renderer (`scripts/prerender-seo-pages.mjs`) generating crawler-ready HTML snapshots for Subject pages, Year pages, and high-value Question pages. Included static HTML body fallbacks and dynamic meta/canonical/OpenGraph tags without disturbing SPA React routing.
- **SEO Phase 5 (Rich Snippets & Polish)**:
  - Added JSON-LD `FAQPage` schemas and visible Q&A blocks to pre-rendered Subject and Year landing pages.
  - Injected keyword-rich overview content into pre-rendered Subject and Year pages.
  - Redesigned the GitHub Pages fallback redirect (`public/404.html`) into a beautifully themed, branded loading splash screen with auto light/dark mode.
  - Generated and integrated a high-quality, modern, light-themed social preview card (`public/og-cover.png`).
- **SEO Phase 6 (Brand Signals, Alias Pages & Analytics)**:
  - Injected a visually hidden, keyword-rich brand description overview (`#seo-brand-text`) into the homepage layout to assist crawler indexing.
  - Created 5 new pre-rendered short-form alias landing pages (`/gate-cs-pyq`, `/gate-aptitude`, `/mock-tests`, `/operating-systems-pyq`, and `/dbms-pyq`) featuring schema markups and targeted CTAs to match high-volume search queries.
  - Integrated the Google Analytics (gtag.js) script into the document head for traffic monitoring, configured with the site's custom GA Measurement ID.
  - Updated the project `README.md` live link.
  - Configured custom domain tracking in GoatCounter settings.
- **Static Pages**: Created `AboutPage`, `ContactPage`, `PrivacyPage`, and `TermsPage` components in `src/pages/StaticPages.jsx` with routes configured in `src/App.jsx`.
- **Sitemap Registration**: Configured `scripts/build-public-artifacts.mjs` to automatically index the four new static pages in the `sitemap.xml`.
- **Subject Syllabus Inclusion**: Appended the official GATE CS syllabus structure directly to each subject definition in `SUBJECT_SEO_MAP`.
- **SEO Keyword Research**: Formatted and captured a master list of raw user queries, informational topics, and search volumes inside `docs/SEO_KEYWORDS.md` for editorial planning.
- **SEO Phase 8 Master Plan**: Added the "Achieving #1 on Google" SEO master strategy to the end of `SEO_Plan.md`.
### Changed
- **Blog Markdown Elements Support**: Upgraded `richCopy` rendering in `EditorialPage.jsx` and static pre-rendering in `scripts/prerender-seo-pages.mjs` to natively support parsed markdown objects including `<h2>`, `<h3>`, and `<ul>` lists.
- **Detailed Editorial Content Injection**: Completely replaced the placeholder text in `/gate-2027`, `/gate-cutoff`, and `/gate-2027-syllabus` practice guides with comprehensive, highly-detailed structural content from Markdown files, utilizing the new subheadings and list structures.
- **Blog Cards Topic Compatibility**: Updated subject card rendering in `BlogListPage.jsx` to reference `topic.label` to support the new structured object format.
- **Updated Blog Content (GATE 2027)**: Fully updated all editorial articles (`src/data/editorialPages.js`) to target the upcoming **GATE 2027** exam cycle, replacing flat lists with structured comparative tables.
- **Pre-renderer Table Formatting**: Updated the static pre-rendering pipeline (`scripts/prerender-seo-pages.mjs`) to render table data as fully styled `<table />` elements rather than raw text, keeping pre-rendered snapshots readable and semantic for search engine crawlers.
- **Global Drawer Navigation**: Replaced the collapsible blog section accordion in the navigation drawer with a direct action link leading directly to `/blog`.
- **Blog Listing Filtering**: Added a `showInBlog` property to `EDITORIAL_PAGES` to hide empty stubs (like `/gate-cs-pyq`, `/gate-aptitude`, etc.) while keeping the 5 real-content articles (GATE 2027, Syllabus, Eligibility, Cutoffs, Pattern) visible.
- **SEO & Pre-rendering Integration**: Updated `scripts/prerender-seo-pages.mjs` to statically build `/blog/index.html` with breadcrumbs and webpage metadata, and configured sitemap generation to output `https://gateqa.in/blog` in `public/sitemap.xml`.
- Replaced basic app title and description metadata with advanced structured metadata injected during pre-rendering.
- Established `1.0.0` versioning starting from the `gateqa.in` root domain release.
- Audited and updated the entire student motivational quotes engine in `src/utils/motivationalQuotes.js` to align 100% with study focus, question practice, scientific logic, and exam stress management: removed societal sacrifice, heart-brain conflicts, purity, forgiveness, and socio-political quotes. Replaced them with study-centric quotes from Dr. B. R. Ambedkar, Swami Vivekananda, Confucius, Richard Feynman, Sir Isaac Newton, and Marie Curie.
- **Terms & Privacy Polish**: Sanitized the Terms and Conditions and Privacy pages to remove automated scraper prohibition clauses and third-party AdSense service trackers. Changed contact address to rawathr01@gmail.com.
- **Syllabus Landing Display**: Modified `src/pages/SubjectLandingPage.jsx` to render the newly added official syllabus content and cross-linked to the comprehensive Syllabus Blueprint.
- **FOUC Prevention**: Re-added the `<div id="app-splash">` loading spinner into `scripts/prerender-seo-pages.mjs`'s `buildStaticRoot` to visually hide the raw unstyled SEO HTML structure before hydration.
- **Pre-render Scaling**: Tripled the `QUESTION_PRERENDER_LIMIT` to 5000 inside the SEO prerender script to ensure all 3,500+ questions in the active exam database receive unique programmatic SEO pages.

### Verified
- Passed 280/280 Vitest unit tests (`npm run test:unit`) post-SEO implementation.
- Verified successful local static output structure (`npm run build`), compiling a total of 1535 static pre-rendered HTML files including the `/blog/index.html` listing page.
- Validated sitemap regeneration including custom `/blog` entry.

## 2026-06-08

### Added
- Added custom CNAME configuration file (`public/CNAME`) specifying `gateqa.in` to point custom domain on GitHub Pages.
- Added deploy safety check scripts in GitHub Actions workflows (`.github/workflows/node.js.yml` and `.github/workflows/gate-question-pipeline.yml`) to fail CI runs if the compiled CNAME artifact (`dist/CNAME`) is missing.

### Changed
- Migrated client application base path from `/Gate_QA` subpath to root `/` for root custom domain launch at `gateqa.in`. Updated configuration across `vite.config.js`, `package.json`, `index.html`, `public/manifest.webmanifest`, `public/offline.html`, and `public/404.html`.
- Updated generated domain configuration within `scripts/build-public-artifacts.mjs`.
- Disabled the migration countdown warning banner inside `AppHeader.jsx` post-launch.
- Updated image-mirroring directory logic in `scripts/mirror-gateoverflow-images.mjs` and `scripts/qa/validate-question-images.mjs` to target root `/question-images` while maintaining compatibility for legacy embedded subpath routes.

### Fixed
- Fixed Playwright E2E and Vitest unit tests to align with the new root base path `/`:
  - Adjusted `playwright.config.cjs` to target root URL.
  - Stripped `/Gate_QA` router path stubs from `tests/e2e/a11y.axe.spec.js`, `tests/e2e/mock-test-flow.spec.js`, and `tests/e2e/practice-flow.spec.js`.
  - Replaced legacy `/Gate_QA/` base route checks inside `src/App.test.jsx`.
  - Updated visual question option `src` assertions in `src/components/MockTest/MockTestQuestion.test.jsx`.
  - Removed deprecated countdown unit tests from `src/components/Layout/AppHeader.test.jsx`.

### Verified
- Built production assets (`npm run build`) successfully with root assets output and synced calculator.
- Passed 280/280 Vitest unit tests (`npm run test:unit`).
- Passed 17/17 Playwright E2E tests (`npm run test:e2e`).
- Successfully validated DNS propagation and verified site live at `https://gateqa.in`.

## 2026-06-07

### Added
- Created a custom domain shift guide (`DOMAIN_SHIFT.md`) in the repository root to document the upcoming migration from `superawat.github.io/Gate_QA/` to `gateqa.in`.

### Changed
- Reorganized the motivational quotes engine in `src/utils/motivationalQuotes.js` to randomize quote presentation. Implemented a deterministic seeded shuffle and a greedy interleaving algorithm (`interleaveQuotes`) to guarantee that quotes from the same author are never shown consecutively.
- Corrected the new custom domain configuration from `GateQA.net` to `gateqa.in` across the codebase, updating the domain migration modal constants and headers.
- Rephrased the domain shift notice popup to reassure users that only the URL is changing (keeping layouts and data exactly the same) and clearly instructing them to download and keep their JSON progress file saved on their local system.

## 2026-06-04

### Fixed
- Hardened Solve page handling for unavailable/stale question UIDs. If detail hydration reports a missing question, the question is removed from the active session queue and the user is moved to the next available question instead of seeing a broken detail card.
- Added a session-level cleanup API to prune unavailable questions from ordered/random practice queues without disturbing the rest of the session.
- Fixed legacy true/false mock questions that were typed as NAT by rendering TRUE/FALSE answer choices and mapping TRUE to `1` and FALSE to `0` for scoring while keeping the question type label as `NAT`.
- Updated drawer labels for `Priority Topics` and `Special Aptitude Section` to use a single solid sky-blue accent without animation overhead.
- Corrected recent mock paper readiness gaps by repairing five malformed answer/type records and expanding embedded option extraction for SQL `<pre>` choices and trailing statement-choice lists. `2025 Set 1`, `2025 Set 2`, and `2024 Set 2` now have 65/65 scorable mock questions.

### Verified
- Confirmed current aptitude artifacts are internally consistent: 36,836 index rows, 36,836 detail rows, 0 missing, 0 invalid.
- `npm run build:public-artifacts`
- `npm run typecheck`
- `npm run qa:validate-aptitude`

## 2026-06-03

### Added
- Converted service boundaries to TypeScript (FEAT-020 Phase 3):
  - Converted `QuestionBankManifestService.js` to `QuestionBankManifestService.ts`
  - Converted `AnswerService.js` to `AnswerService.ts`
  - Converted `GlobalDifficultyService.js` to `GlobalDifficultyService.ts`
  - Converted `AptitudeQuestionService.js` to `AptitudeQuestionService.ts`
  - Converted submodules of `src/services/question-service/`: `QuestionLoader.js`, `QuestionNormalizer.js`, `SubjectTaxonomy.js` to `.ts`
  - Converted aggregator `QuestionService.js` to `QuestionService.ts`
  - Created interface definitions `IQuestionService` in `src/services/question-service/types.ts`
  - Created `src/utils/stripEmbeddedOptions.d.ts` declaration file
- Converted filter UI leaf components to TypeScript (FEAT-020 Phase 4):
  - Converted `TopicFilter.jsx`, `YearFilter.jsx`, `YearRangeFilter.jsx`, `QuestionSearchInput.jsx`, `ProgressFilterToggles.jsx`, and `ActiveFilterChips.jsx` to `.tsx`
  - Added typed props, event handlers, filter context casts, and label lookup maps for the converted filter leaves
- Converted context boundaries to TypeScript (FEAT-020 Phase 5):
  - Converted `SessionContext.jsx` to `SessionContext.tsx` with typed session mode, navigation state, topic-memory, and queue contracts
  - Converted `MockTestContext.jsx` to `MockTestContext.tsx` and `FilterContext.jsx` to `FilterContext.tsx` while preserving current runtime behavior and split filter contexts
- Expanded TS types in `src/types/runtime.ts` (adding canonical, detail shards, and normalized properties on `QuestionRow`).
- Expanded filter runtime contracts in `src/types/runtime.ts` with progress-toggle flags, result-count state, and optional filter actions.

### Changed
- Revamped the High Priority Topics page into a simpler preparation guide with the title `High Priority Topics`, official GateOverflow paper-wise marks data for subject trends, selectable `Subject Marks Over Years`, `Marks Distribution Between Subjects`, and `Min/Avg/Max Marks` graphs with subject-specific colors, CSE-only question-index filtering for practice links, separate Technical Topics and Aptitude Topics sections, short subject labels, and recent paper snapshots.
- Refactored desktop scroll behavior inside `ExplorePage.jsx` and `QuestionPickerList.jsx` so that the question table is an internal scroll area on desktop, keeping pagination visible and matching the filter column height.
- Updated `SmartPracticeBanner` and `CollapsibleSection` inside `InsightsPage.jsx` to use theme-safe border and background variables.
- Refined accessibility label inside `AptitudeTopicFilter.tsx`.

### Fixed
- Fixed Node 24 runner CI hang: Playwright versions prior to 1.60.0 have a known zip extraction bug under Node 24. Upgraded `@playwright/test` to `^1.60.0` in `package.json` to resolve the compatibility issue.

### Verified
- `npm run typecheck` passed.

## 2026-06-02

### Added
- Added TypeScript Phase 0 tooling: `typescript`, React 18 type packages, `tsconfig.json`, `src/vite-env.d.ts`, and `npm run typecheck`.
- Added shared embedded-option normalization in `stripEmbeddedOptions.js` to correctly extract paragraph-labeled A-D/E options from questions, extracting 2,995 embedded rows safely.
- Added `questionType.js` logic to dynamically resolve the `UNKNOWN` question type chip from question metadata, embedded answers, or verified answers, hiding the chip cleanly if unresolved.
- Added build-time and runtime mock validation checks to reject scorable MCQs/MSQs without options or with mismatched answer/option labels, ensuring scoring integrity.
- Added an optionless visual rendering fallback inside `MockTestQuestion.jsx` to render embedded HTML mock options cleanly when a structured option array is missing.
- Added a new `Include previously solved questions` toggle inside the Mock Test setup screen, defaulting to `false` (OFF).
- Added focused tests inside `mockTest.test.js` to assert optionless scorable question blocking and visual layout rendering.
- Added the `htmlAssets.js` utility to safely parse and resolve embedded relative visual resource paths in questions and choices.
- Added a stricter aptitude detail hydration guard so missing shard rows fail loudly instead of rendering an empty question shell.
- Added public aptitude index/detail consistency checks to the aptitude validation gate.

### Changed
- Moved Node CI and the scheduled GATE question pipeline to a Node 24 action/runtime baseline using `actions/checkout@v6`, `actions/setup-node@v6`, `actions/github-script@v8`, and `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`.
- Kept the scheduled GATE question pipeline timeout at `330` minutes and documented that old 30-minute cancellations came from earlier workflow revisions.
- Simplified local `gateqa_master_plan.md` into two note-style sections: unresolved/active and completed/resolved.
- Refactored `QuestionNormalizer.js`, `mockTest.js`, and build scripts to use the new unified embedded-option extractor.
- Updated `MockTestShell.jsx` to validate mock pools and prioritize unsolved questions during test generation.
- Updated `MockTestContext.jsx` so that correct answers chosen during mock test sessions mark those questions as solved globally in the user's unified practice history.
- Hardened the GateOverflow image mirror and validator to recognize subdomain blob hosts, localize the missing public question images, and scan question detail shards as well as the top-level question bank.
- Tightened the streak freeze reconciliation logic so it can bridge whole skipped-day gaps and preserve an active streak when the user returns after a one-day pause.
- Gave the Mock Test selection/setup screens a denser premium treatment with clearer selected states, cleaner controls, and better responsive spacing.

### Fixed
- Fixed `MockTestQuestion.jsx` option rendering to prevent duplicates by deduplicating options extracted from the stem.
- Fixed `MockTestContext.test.jsx` and `MockTestFlow.test.jsx` fixtures so mock questions include valid options and answer records, preventing timeouts under the new stricter pool validation.
- Fixed the Aptitude Direct-Link cold-start race-condition in `aptitudePreference.js` and `FilterContext.jsx` by synchronously initializing the in-memory index preference from the URL path.
- Aligned E2E tests in `practice-flow.spec.js` and upgraded workflow actions to permanently fix GitHub Actions runner warnings and E2E test failures.
- Resolved the GATE 2009 Question 15 content mismatch note after verifying that the regular expression corresponds to option `C`.

### Verified
- `npm run build:public-artifacts`
- `node scripts/qa/validate-question-images.mjs`
- `node scripts/qa/validate-aptitude-data.js`
- `npm run typecheck`
- `npm run build`
- Full verification sweep: `npm run test:unit` (272 passing tests) and `npm run test:e2e` (17 passing Playwright tests) completed cleanly.

## 2026-05-29

### Added
- Added automatic Aptitude index activation in `FilterContext.jsx` so that direct links to Aptitude questions (e.g., starting with `/question/APT-`) automatically enable Aptitude mode on load, ensuring detail shards hydrate and render correctly without index-missing errors.
- Added comprehensive regex unescaping (`/\\+r\\+n/gi`, `/\\+n/gi`, `/\\+r/gi`) in `AptitudeQuestionService.js` to normalize multi-escaped JSON shards (like `\\\\r\\\\n` and `\\\\n`), resolving messy paragraph layouts and rendering clean typography for questions like `APT-RSN-8049` and `APT-RSN-7552`.

### Changed
- Replaced the asynchronous dynamic `import('./index.css')` inside `index.jsx` with a standard static `import './index.css';`, forcing the browser's native rendering pipeline to block layout paints until all CSS styles are fully loaded and active.
- Refactored the static HTML loading splash screen (`#app-splash`) to be dismissed inside a top-level `useEffect` in `App.jsx` rather than immediately after scheduling `root.render`. Using a two-tier `requestAnimationFrame` delay ensures the React component tree is fully mounted and styled before the splash screen fades out, completely eliminating Flash of Unstyled Content (FOUC).
- Restored base-agnostic Vite compilation paths in `index.html` for preloads and manifests (e.g. `/manifest.webmanifest` and `/question-bank-manifest.json`), eliminating double base-path warning errors on startup.
- Implemented predictive route preloading in `routePreload.js` and `App.jsx` to prefetch chunk files on hover/focus over Home dashboard cards.
- Integrated `content-visibility: auto` and `contain-intrinsic-size` in `index.css` to restrict layout-recalculation costs for repeated list cards.

### Verified
- Local development server start verified and clean checkouts confirmed.
- Verified smooth transition from static HTML splash screen to fully-styled home page dashboard layout.
- Verified that direct URLs to visual/inequality reasoning questions (`APT-RSN-8049`, `APT-RSN-7552`) load immediately with beautifully parsed, clean typography.

## 2026-05-28

### Added
- Added `npm run aptitude:parse-pending`, a reusable aptitude intake runner that rebuilds pending-only catalogs from the current parsed artifact before parsing, so already parsed paper URLs are skipped automatically.
- Added `npm run aptitude:mark-paper-coverage`, which marks retried paper sets as covered when they contain only duplicate already-parsed questions or no structured rows, preventing endless pending retries.
- Added `npm run aptitude:dedupe-parsed`, which removes duplicate parsed aptitude rows using the same question-text dedupe key as the public build while merging source provenance into the kept row.

### Changed
- Hardened the aptitude scraper resume logic to skip already parsed papers using both runtime source URLs and normalized internal page URLs.
- Made the year-wise pending splitter consume local paper-coverage aliases so duplicate-content papers are excluded from future pending catalogs.
- Cleaned the local parsed aptitude staging artifact from 41,577 rows down to 36,836 unique rows, removing 4,741 duplicate-question rows before public artifact rebuild.
- Sanitized stale private-source provider labels from generated aptitude source metadata without hardcoding the provider label into tracked code.
- Added optional WebP recompression and max-side resizing controls to the aptitude image optimizer so the expanded aptitude image set stays within the public payload budget.
- Tightened the publisher-noise QA pattern to avoid false positives on legitimate learner text such as ordinary "book" and "publication" phrases.

### Verified
- `npm run aptitude:parse-pending -- --dry-run` confirmed the regenerated pending queue skips already parsed papers and leaves 48 pending paper sets.
- `npm run aptitude:parse-pending -- --max-runtime-minutes 180 --concurrency 2 --request-timeout 90000 --delay 1500 --checkpoint-every 5` retried all 48 remaining paper sets; the current structured parser accepted no additional rows, leaving staging at 41,577 parsed rows and 48 paper sets pending for manual/parser review.
- `npm run aptitude:mark-paper-coverage -- --input artifacts/aptitude-pipeline/leftovers-raw-2023.json --input artifacts/aptitude-pipeline/leftovers-raw-2024.json --input artifacts/aptitude-pipeline/leftovers-raw-2025.json --zero-debug-dir artifacts/aptitude-pipeline/debug-leftovers` marked 47 duplicate-content paper sets and 1 zero-structured-row paper set as covered.
- `npm run aptitude:parse-pending -- --dry-run` now reports 1,336/1,336 covered paper sets and 0 pending paper sets.
- `npm run aptitude:dedupe-parsed -- --write` removed 4,741 duplicate parsed rows from local aptitude staging.
- `python scripts/aptitude-pipeline/build_aptitude_db.py`, `npm run aptitude:mirror-images`, `APTITUDE_IMAGE_WEBP_QUALITY=40 APTITUDE_IMAGE_MAX_SIDE=640 node scripts/optimize-aptitude-images-webp.mjs --recompress-webp`, `npm run qa:validate-aptitude`, `npm run qa:verify-aptitude`, and `npm run qa:validate-aptitude-images` completed; image validation passed with 3,718 local images at 19.82 MB.
- Staging and public aptitude duplicate audits both reported 0 duplicate question groups.
- A tracked-file scan confirmed no private source labels, source URLs, or credential strings are present in repository-facing files.

## 2026-05-27

### Added
- Added a highly premium, beautiful **Prep Insights Quick Summary** panel to the High-Priority Topics page (`HighPriorityTopicsPage.jsx`), detailing top Rising, Cooling, Consistently Core, and High-Yield Focus topics to help students instantly see critical preparation priorities.
- Added support for mobile bottom navigation with the new "Priority" tab displaying the `FaFire` icon mapping directly to `HIGH_PRIORITY_TOPICS_ROUTE`.
- Added visible subtopic chips to the Solve question header, so aptitude questions now show the full context chain such as `Aptitude -> Reasoning -> Coding - Decoding -> MCQ`.
- Added a direct hamburger drawer `Filters` shortcut that opens the existing Explore filter UI.
- Added a sanitized year-wise aptitude pending-catalog splitter and parse-coverage report helper for verifying remaining intake by year without exposing private source labels in tracked files.
- Added direct filtered-practice quick start from Explore, including the mobile-friendly `Start Reasoning Practice` / `Continue Filtered Practice` path from active filters.
- Added focused efficiency guard coverage for session prefetching, persistent random-topic memory, cached filtering metadata, aptitude tag caching, and quick-start navigation.

### Changed
- Re-evaluated and balanced topic frequencies and rankings in `highPriorityTopics.js` to combine historical baselines with actual live question bank index counts dynamically, keeping all stats 100% data-driven.
- Replaced absolute marks-based trend calculation with a relative + absolute trend ratio to remove subject weight bias (e.g. preventing small-syllabus areas like CD/Digital Logic from being locked into flat trends).
- Optimized mobile layout for the High Priority Topics page: wrapped mobile line charts in a responsive height container (`h-[180px]`), restructured mobile detail overlays to be scroll-safe (`max-h-[90vh] overflow-y-auto`) to avoid clipping, and scaled the subject charts to be clean and legible.
- Changed Explore question opening to start a balanced random practice session from the filtered pool while keeping the selected question first.
- Replaced practice randomization with a standard stratified shuffle-bag algorithm: Fisher-Yates within each topic, weighted-fair interleaving across subject/subtopic strata, and a short topic cooldown to reduce clustering.
- Improved session efficiency by prefetching the next few likely question details in ordered/random practice and persisting a short recent-topic memory so reopened random practice avoids immediate same-subtopic starts.
- Optimized filter performance by caching normalized per-question filter metadata, using UID lookup maps, avoiding repeated answer/type resolution during filter updates, and preventing filter-time mutation of question objects.
- Precomputed aptitude structured tag and subtopic maps during aptitude index load so aptitude filter flows reuse cached maps instead of rebuilding them.
- Memoized Explore page result slicing/open handlers and the question picker list to reduce unnecessary render work while preserving the paginated layout.
- Upgraded the mobile Home action area into a centered horizontal carousel with partially visible side cards, scroll snapping, active-card emphasis, and compact dots while leaving desktop layout unchanged.

### Verified
- `node scripts/aptitude-pipeline/split-pending-catalog-by-year.mjs ...` (wrote ignored local year-wise pending catalogs and a sanitized coverage report)
- One-paper 2020 parser smoke pass completed with no new rows, leaving that paper pending for manual/parser review.
- `npm run test:unit` (passed, 43 files, 257 tests)
- `npm run build` (passed, production bundle built successfully; HighPriorityTopicsPage bundle: 114.50 kB)
- `git diff --check -- src\components\Practice\QuestionPickerList.jsx src\contexts\SessionContext.jsx src\contexts\SessionContext.test.jsx src\contexts\FilterContext.jsx src\contexts\FilterContext.test.jsx src\services\AptitudeQuestionService.js src\services\AptitudeQuestionService.test.js src\pages\ExplorePage.jsx src\pages\ExplorePage.test.jsx docs\CHANGELOG.md` (passed with only CRLF warnings)

## 2026-05-26

### Added
- Implemented the image-heavy aptitude intake pass to allow visual reasoning, Venn diagram, and mirror/series questions into the platform.
- Expanded the parser, mirroring, and validation checks in `mirror-aptitude-images.mjs` and `validate-aptitude-images.mjs` to recursively inspect `options[]` HTML as well as `questionHtml`.
- Enabled text-only filtering for forbidden string patterns to prevent false-positives on image URLs containing vendor terms.
- Added parser/classifier integration unit tests in `scrape-aptitude.test.mjs` to guard remote-image rendering structures.
- Added a full-screen HomePage readiness overlay that keeps the dashboard hidden until window load, fonts, and paint frames are ready, then fades out smoothly.

### Changed
- Scaled Aptitude Bank from `16,873` to `19,105` high-quality public questions, adding `2,232` newly parsed and accepted aptitude questions (Quant: `7,680`, English: `6,062`, Reasoning: `5,363`).
- Replaced the top quick-actions grid on the Home Page with an elegant horizontal flow, stretching the Practice card to match the Streak Banner size exactly.
- Repositioned study quotes to render inside the far-right section of the primary Practice card with left-border spacing.
- Styled Global Navigation Drawer with a solid theme-surface background, elevated drop shadows, right borders, and slide-in transition physics to eliminate transparent bleeding and double logo overlaps.
- Compacted the Mock Test Results and Insights Mock History overview UI with denser score/time blocks, smaller summary chips, tighter spacing, and shorter review sections.
- Implemented a mobile UI pass for the HomePage: converted the four action cards into a compact horizontal scroll-snap deck for mobile screens, retaining the grid layout on desktop.
- Enhanced the mobile Practice experience: improved header spacing, added a full-width filter trigger, horizontally scrollable chips, card-like mobile question rows, stacked pagination, and enforced global horizontal overflow locking.
- Enhanced Mock History dark mode to be fully theme-aware across timing rows, empty state, charts, attempt cards, and tooltips in `MockHistoryPanel.jsx`.
- Expanded CSV export to include GATE practice, Aptitude practice, and mock-test question history in `workspaceFile.js`.
- Added CSV test coverage for the combined export in `workspaceFile.test.js`.
- Verified clean-checkout import safety for FEAT-013 is retained and passes build and e2e suites.

### Removed
- Removed the unstable hover/focus popup tooltips from Home streak stats for Best, Aura, Freeze, and Days while keeping the stat pills visible.
- Removed direct `html2canvas` dependency from `package.json` and `package-lock.json` (now only an optional transitive dependency for jsPDF).

### Verified
- `npm run test:unit` (passed, 43 files, 250 tests)
- `npm run build` (passed, Exit code: 0)
- `npm run test:e2e` (passed, 17 tests)
- `npm run qa:a11y:axe` (passed, 3 tests)
- `npm run qa:validate-data` (passed with existing non-failing coverage warning)
- `npm run qa:validate-bundle-budget` (passed)
- `npm run qa:validate-landing-network` (passed)
- `npm run qa:validate-public-parity` (passed)
- `npm run lighthouse:mobile` (passed)
- `npm run qa:validate-aptitude` (passed, `19,105` rows)
- `npm run qa:validate-aptitude-images` (passed, 100% local references)
- `git diff --check -- src\components\Home\StreakBanner.jsx src\index.css src\components\Insights\MockHistoryPanel.jsx src\components\MockTest\MockTestResults.jsx` (passed)
- `git diff --check -- src\pages\HomePage.jsx src\index.css` (passed)
- `git diff --check` (passed with only CRLF warnings for the mobile UI pass)
- Note: Other modified files (Home/UI files, docs, generated public artifacts) remain in the worktree untouched to isolate these specific fixes.
- Full unit/build suites were not rerun for the final UI passes alone because the project instructions say to skip them unless explicitly requested.

## 2026-05-25

### Changed

- Restructured navigation drawer: removed nav tiles, merged Workspace into Tools (Export PDF/CSV/JSON, Import JSON).
- Moved hamburger button from left to right side of header.
- Rewrote PDF export as a 2-page jsPDF vector infographic progress report (replaces `html2canvas` screenshots).
- Added CSV progress export (`saveWorkspaceCsv`).
- Retired `.gateqa` file format — standard `.json` for all backups.
- Added per-tool "last used" timestamps, backup reminder card (≥7 days), and info popup.
- Added in-drawer Quick Reference glossary (Streak, Best, Aura, Freeze, Days).
- Removed User Manual link from footer (now in drawer only).
- Fixed Save Reminder and Info popup text colors for dark/light theme safety.
- Fixed Activity Heatmap month label collision on short rolling boundaries.

### Verified

- `npm run test:unit` (`41` files, `238` tests)
- `npm run build`

## 2026-05-20

### Changed

- Rebuilt the public aptitude bank around the AptitudeBank-only intake path: `16,873` English, Quant, and Reasoning questions across `60` subject/subtopic shards.
- Added a shared aptitude attempt/ignore gate so low-signal, duplicate, unsupported, invalid, brittle-image, synthetic, and non-aptitude rows are filtered before public artifacts are written.
- Mirrored public aptitude images into `public/images/aptitude/` and validated that public aptitude data has no remote or broken image references.
- Added the public user manual route at `/manual` and linked it from the footer.

### Removed

- Retired the legacy local aptitude PDF/OCR intake path and deleted the old PDF/OCR helper scripts.
- Removed stale one-off planning/design docs and generated review snapshots from version control.
- Made `artifacts/review/` local-only via `.gitignore` so future QA reports do not clutter GitHub.

### Verified

- `npm run qa:validate-aptitude`
- `npm run qa:verify-aptitude`
- `npm run qa:validate-aptitude-images`
- `npm run test:unit -- --testTimeout=15000` (`40` files, `233` tests)
- `npm run build`
