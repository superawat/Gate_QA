# Changelog

- **Verified Question Fix for go:357500 (GATE CSE 2021 Set 2 Q40 MSQ Answer Key) (DEC-107)**:
  - *Context*: User identified and verified an answer-key defect in `go:357500` (GATE CSE 2021 Set 2 Q40, Databases / Functional Dependencies). The previous key contained only Options A and D, omitting valid Option C.
  - *Mathematical & Relational Verification*: Given relation $R(P, Q, R, S, T)$ with functional dependencies $F = \{P \rightarrow QR, RS \rightarrow T\}$:
    - *Option A ($PS \rightarrow T$)*: $P \rightarrow QR \implies P \rightarrow R$. Augmenting with $S$ gives $PS \rightarrow RS$. Transitivity with $RS \rightarrow T$ yields $PS \rightarrow T$. **Valid**.
    - *Option B ($R \rightarrow T$)*: Attribute closure $R^+ = \{R\}$. Does not derive $T$. **Invalid**.
    - *Option C ($P \rightarrow R$)*: Decomposition rule on $P \rightarrow QR$ directly gives $P \rightarrow R$. **Valid**.
    - *Option D ($PS \rightarrow Q$)*: $P \rightarrow QR \implies P \rightarrow Q$. Augmenting with $S$ gives $PS \rightarrow QS \implies PS \rightarrow Q$. **Valid**.
    - Official GATE CSE 2021 Set 2 Final Answer Key strictly lists **A, C, D** (MSQ).
  - *Data & Parity Harmonization*:
    - Updated `data/answers/manual-answers-patch-v1.json` with entry `go:357500`: `{ type: "MSQ", answer: ["A", "C", "D"], tolerance: null, note: "gate_cse_2021_set_2_q40:official_key_a_c_d_msq" }`.
    - Synchronized `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json` (`cse:2021:set2:main:q40`), and master question bank `public/questions-with-answers.json`.
    - Regenerated public static detail shard `public/question-detail-shards/2021-s2.json` and reverted timestamp churn across unaffected shards.
    - Preserved question text and all options completely unmodified.
    - Confirmed unrelated questions remain 100% untouched.
  - *Testing & Validation*:
    - Added unit regression tests in `src/utils/evaluateAnswer.test.js` asserting strict MSQ evaluation for `["A", "C", "D"]` (true for permutations of A, C, D; false for previous partial key `["A", "D"]`, subsets, or supersets).
    - Added unit regression test in `src/services/AnswerService.test.js` asserting MSQ resolution for `go:357500`.
    - All 375 targeted unit tests in `evaluateAnswer.test.js` and `AnswerService.test.js` pass (100% green).
    - `npm run qa:validate-data` passed with 0 errors (0 duplicate keys, 100% cross-layer parity).
    - `npm run typecheck` passed with 0 errors.

- **Verified Question Fixes for go:399285 (C Code Syntax), go:43485 (MTA Clarification UI), and go:807 (Answer Key Correction) (DEC-106)**:
  - *Context*: Addressed three verified issues across GATE CSE question records:
    1. **`go:399285` (GATE CSE 2023 Q36, Programming in C - Activation Tree)**: Fixed malformed/missing parentheses in function definitions and invocations (`int main()`, `int f1()`, `int f3()`, `f1();`, `f3();`, `return f1();`) while preserving exact column alignment and logic as valid, readable C code.
    2. **`go:43485` (GATE CSE 2008 Q79, Algorithms - Binary Strings Recurrence)**: Question was already correctly configured as `MTA` (Marks To All, as correct answer $T(5)=13$ was omitted from choices), but UI lacked clear explanation. Added explicit text across `AnswerPanel`, `SolvePage`, `MockTestQuestion`, and practice list cards: `"MTA (Marks To All): Full marks are awarded to everyone for this question."` with emerald status badges and informative tooltips without altering scoring behavior.
    3. **`go:807` (GATE CSE 2002 Q1.3, Algorithms - Recurrence Relation)**: Corrected answer key from Option C to **Option B** ($\frac{3^{k+1}-1}{2}$). Mathematical derivation: for $T(2^k) = 3T(2^{k-1}) + 1$ with $T(1) = 1$, expansion gives $T(2^k) = 3^k(1) + \sum_{i=0}^{k-1} 3^i = 3^k + \frac{3^k-1}{2} = \frac{3^{k+1}-1}{2}$ (Option B).
  - *Data & Parity Harmonization*:
    - Synchronized `manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json`, and master question bank `public/questions-with-answers.json`.
    - Regenerated public shards `2002-s0.json` and `2023-s0.json`, search indexes, and mock catalogs via `scripts/build-public-artifacts.mjs`.
    - Confirmed `go:84830` and `go:2184` were manually verified and preserved 100% unchanged.
  - *Testing & Validation*:
    - Added unit regression tests in `src/utils/evaluateAnswer.test.js` (Option B for `go:807`), `src/services/AnswerService.test.js` (Option B resolution), and `src/components/AnswerPanel/AnswerPanel.test.jsx` (MTA badge and explanation notice).
    - `npm run qa:validate-data` passed with 0 errors (clean zero duplicate keys and 100% parity).
    - `npm run typecheck` passed with 0 errors.

- **Unified Brand Animated Logo Loader & Splash Optimization (DEC-105)**:
  - *Context*: Replaced legacy generic spinners, horizontal progress bars, and bordered card boxes across the application with the custom brand animated logo loader (`gateqa_loader_dark.webp` and `gateqa_loader_light.webp`).
  - *Eliminated Double Consecutive Loader*: Removed `HomePageLoadingOverlay` ("PREPARING DASHBOARD") from `src/pages/HomePage.jsx` which was running concurrently after the initial route/splash loader, ensuring a single unified transition into the dashboard.
  - *Clean Centering & Surface Cleanup*: Removed rectangular card boxes, drop shadows, and bordered containers from `RouteLoader` and all page loading states (`SolvePage`, `ExplorePage`, `HighPriorityTopicsPage`, `InsightsPage`, `MockCatalogLoaderCard`), centering the animated brand loader cleanly in the viewport.
  - *Theme Awareness*: Automatic switching between solid white loader mark on dark backgrounds and dark loader mark on light mode.
  - *Verification*: Vitest unit tests (80 test files, 951 tests passing), TypeScript compiler check (`npm run typecheck`), and browser visual confirmation.

- **Preparation Tracker — Out-of-Syllabus Subtopic Exclusions (DEC-104)**:
  - *Context*: Removed two non-core subtopics from the canonical GATE CSE Preparation Tracker taxonomy:
    1. **Programming in C**: Removed subtopic #9: `File I/O` (`id: "cse-pds-c-file-io"`, `subtopicSlug: "file-io"`), cleaned up `secondaryTopicTags` (`"file-io"`) and `keyConcepts`. Subtopic count updated from 9 to 8.
    2. **Data Structures → Trees / Binary Search Trees**: Removed `Red-Black Trees` (`id: "cse-pds-tree-red-black"`, `subtopicSlug: "red-black-trees"`), cleaned up `secondaryTopicTags` (`"red-black-tree"`, `"red-black-trees"`) and `keyConcepts`. Subtopic count updated from 5 to 4.
  - *Question Bank Verification*:
    - Audited all 3,682 questions in the master question bank; 0 PYQs reference or map to `file-io` or `red-black-tree`. No question records needed remapping or archival, maintaining 100% question data preservation.
  - *GATE DA Strict Isolation*:
    - GATE DA syllabus remains completely isolated and unchanged (`da-py-file-io` under Python Programming preserved for GATE DA).
  - *Validation & Parity*:
    - Re-verified tracker state derivation, topic counts, completion synchronization, and deep link generation.
    - Added unit regression tests in `src/utils/trackerState.test.ts`.
    - All 78 unit test suites pass (941 tests), data integrity passes with 0 errors, all 7 public parity counts align at 3,682, TypeScript passes, and production bundle builds cleanly.

- **Historical GATE IT (2004–2008) 100% Question Bank Completion & Backfill (DEC-103)**:
  - *Context*: While the 366 historical GATE IT questions were cleanly isolated from CSE shards in DEC-088/DEC-091/DEC-092, official GATE IT examination papers (2004–2008) originally contained 435 total questions, leaving 69 questions missing. Extracted, parsed, and ingested all 69 missing questions using PracticePaper.in as the primary programmatic reference and GateOverflow as the authoritative UID reference, bringing all 5 historical IT papers to 100% completeness.
  - *69 Missing Questions Ingested Across 5 Exam Years*:
    - **GATE IT 2004 (17 Questions Ingested, 73 $\to$ 90)**: `go:3657` (Q16, Unix rename -> MCQ B), `go:3658` (Q17, COCOMO -> MCQ A), `go:3659` (Q18, Use case -> MCQ D), `go:3660` (Q19, CMM Level 4 -> MCQ B), `go:3661` (Q20, SCM tool -> MCQ B), `go:3666` (Q25, Public key crypto -> MCQ A), `go:3672` (Q29, JSP implicit objects -> MCQ A), `go:3673` (Q30, EJB/protocols -> MCQ D), `go:3688` (Q45, Serial transmission baud rate -> MCQ C), `go:3711` (Q68, Critical path duration -> MCQ A), `go:3712` (Q69, Cyclomatic complexity -> MCQ C), `go:3713` (Q70, Software LOC effort -> MCQ D), `go:3714` (Q71, Error seeding strategy -> MCQ B), `go:3715` (Q72, Software availability MTBF/MTTR -> MCQ D), `go:3726` (Q82, Token ring throughput -> MCQ C), `go:3728` (Q84, Parity check matrix -> MCQ A), `go:3733` (Q89, XML DTD validation -> MCQ A, mirrored DTD image).
    - **GATE IT 2005 (9 Questions Ingested, 81 $\to$ 90)**: `go:3762` (Q17, Unix symbolic links -> MCQ B), `go:3763` (Q18, Unix find passwd -> MCQ C), `go:3765` (Q20, Function Point LOC -> MCQ D), `go:3804` (Q43, Sequential circuit output -> MCQ D, mirrored circuit image), `go:3825` (Q64, Software availability -> MCQ C), `go:3826` (Q65, Flowchart basis paths -> MCQ C, mirrored diagram), `go:3828` (Q66, DFD transaction flow -> MCQ C, mirrored diagram), `go:3843` (Q79, Diffie-Hellman secret key -> MCQ B), `go:3844` (Q80, XML specification excerpt -> MCQ D, mirrored DTD images).
    - **GATE IT 2006 (15 Questions Ingested, 70 $\to$ 85)**: `go:3549` (Q10, NP-complete reduction -> MCQ B), `go:3555` (Q16, Cyclomatic complexity -> MCQ C), `go:3556` (Q17, Flow graph edges/nodes -> MCQ C), `go:3567` (Q28, Definite integral Gaussian -> MCQ A), `go:3596` (Q53, Concepts matching -> MCQ A, mirrored table image), `go:3602` (Q58, Software module reliability -> MCQ D), `go:3603` (Q59, Structure chart diagram -> MCQ B, mirrored diagram), `go:3606` (Q62, XML DTD query -> MCQ C, mirrored DTD image), `go:3609` (Q65, 4B/5B encoding codewords -> MCQ C), `go:3618` (Q74, Pointer swap function -> MCQ B), `go:3619` (Q75, Pointer swap float values -> MCQ C), `go:3620` (Q76, Frobenius norm -> MCQ D), `go:3621` (Q77, Gauss-Seidel convergence -> MCQ A), `go:3638` (Q82, Project phases schedule -> MCQ C), `go:3639` (Q83, Project task milestones -> MCQ D).
    - **GATE IT 2007 (17 Questions Ingested, 68 $\to$ 85)**: `go:3435` (Q4, Spiral model -> MCQ D), `go:3436` (Q5, Pipe and filter architecture -> MCQ D), `go:3448` (Q15, Hash function digital signatures -> MCQ C), `go:3451` (Q18, Firewall TCP connection rules -> MCQ D), `go:3455` (Q22, Trapezoidal method error -> MCQ B), `go:3468` (Q35, Early vs late binding -> MCQ D), `go:3493` (Q51, Time between failures -> MCQ C), `go:3494` (Q52, Recursive sorting algorithm -> MCQ B), `go:3495` (Q53, Flowchart decision nodes -> MCQ D, mirrored flowchart), `go:3496` (Q54, CPM activity chart -> MCQ D, mirrored chart), `go:3497` (Q55, Cyclomatic complexity pseudo-code -> MCQ B), `go:3501` (Q59, Text file lines matching -> MCQ C), `go:3505` (Q61, Manchester encoding bit stream -> MCQ B, mirrored waveform), `go:3515` (Q70, Bit bytes parity check -> MCQ B), `go:3526` (Q74, Token ring N stations -> MCQ C), `go:3527` (Q75, Token ring slot utilization -> MCQ D), `go:3529` (Q77, Recurrence sequence limit -> MCQ D). Canonicalized question numbering to GateOverflow slug numbers and safely preserved reference post `go:394296` in unsupported registry.
    - **GATE IT 2008 (11 Questions Ingested, 74 $\to$ 85)**: `go:3271` (Q11, NP-complete reduction -> MCQ D), `go:3273` (Q13, Programming paradigms -> MCQ A), `go:3274` (Q14, Linux shell redirection -> MCQ D), `go:3277` (Q17, Software testing statements -> MCQ C), `go:3278` (Q18, Serial baud rate transfer -> MCQ B), `go:3316` (Q26, Complex numbers field -> MCQ D), `go:3367` (Q57, Function points parameters -> MCQ D), `go:3368` (Q58, Project task dependencies -> MCQ C, mirrored task table), `go:3369` (Q59, Strategy design pattern -> MCQ B), `go:3370` (Q60, Requirements validation -> MCQ C), `go:3384` (Q70, Symmetric communication keys -> MCQ C).
  - *Local Image Mirroring*:
    - Downloaded and mirrored all 13 diagram images into `public/question-images/` (`it_go_*.jpg`), eliminating external CDN dependencies for offline practice.
  - *Data & Parity Synchronization*:
    - Synchronized datasets: `data/it/` and `public/data/it/` (`gateit-2004.json` through `gateit-2008.json`, `gateit-all.json` [435 Qs], `answers-gateit.json` [435 answers]), `data/answers/manual-answers-patch-v1.json`, `answers_by_question_uid_v1.json` (data and public), `public/questions-with-answers.json`, `public/questions-filtered.json`, and static detail shards `it-2004-s0.json` through `it-2008-s0.json`.
    - Total master question bank expanded from 3,613 to **3,682 questions** (+69 net) with 100% lockstep agreement across all 7 parity tracking layers.
    - Rebuilt `src/tests/historicalCseItSeparation.test.js` asserting official counts (90, 90, 85, 85, 85; 870 total historical questions).
    - 938 unit tests pass, typecheck clean, 0 duplicate keys, and 3,606 static SEO pages prerendered clean.

- **GATE CSE 1988 & 1987 (Final Historical Batch) Comprehensive Answer Key Audit, Missing Questions Ingestion & Syllabus Classification (DEC-102)**:
  - *Context*: Audited and reconciled all questions for the final historical batch (GATE CSE 1988 and 1987) following GateOverflow community consensus & historical archive verification, completing the historical GATE CSE archive back to the very first exam (1987). Prior to this pass, GateQA held only 3 questions in 1988 (with `go:91338` erroneously typed as MCQ "A") and 41 questions in 1987 (with 3 missing Section A objective questions, 2 unpopulated answer keys, and legacy string years `"gate1988"`, `"gate1987"`).
  - *3 Missing Questions Ingested (1987)*:
    - **`go:82656`** (GATE CSE 1987 Q15): Wien bridge oscillator op-amp frequency oscillation condition $\to$ **MCQ Option D** (1M, `tags: ["gate1987", "digital-logic", "analog-circuits", "out-of-syllabus-now"]`, local circuit diagram mirrored to `public/question-images/82656.jpg`).
    - **`go:80278`** (GATE CSE 1987 Q1-ix): Refreshing rate of dynamic RAMs (2 ms) $\to$ **MCQ Option B** (1M, `tags: ["gate1987", "co-and-architecture", "memory-organization", "normal"]`).
    - **`go:80281`** (GATE CSE 1987 Q1-x): Data transfer rate of double-density floppy disk system (500 Kbits/sec) $\to$ **MCQ Option C** (1M, `tags: ["gate1987", "co-and-architecture", "secondary-storage", "out-of-syllabus-now"]`).
  - *Answer Key Corrections & Adjustments*:
    - **`go:91338`** (GATE CSE 1988 Q1iii): Quicksort vs heapsort worst case text fill-in-the-blank ("less") without multiple choice options corrected from legacy erratum MCQ `A` to **`type: "SUBJECTIVE", answer: null`**.
    - **`go:80377`** (GATE CSE 1987 Q1-xxi): Linear inequality identification populated from null to **MCQ Option C** ($abx+a^2y \ge 15$).
    - **`go:80559`** (GATE CSE 1987 Q1-xxiv): Simplex method naming origin populated from null to **MCQ Option B** (theory of algebraic complexes).
  - *Year Normalization*:
    - Normalized all legacy year strings across 1988 and 1987 to numeric integers (`1988`, `1987`) across all questions.
  - *Audit Cache Archive & Bundle Clean-up*:
    - Relocated 16 raw historical audit dump files from `public/data/` to `data/audit/historical-keys/`, eliminating ~450 KB of dead scraping cache from the client static build.
  - *Data & Parity Harmonization*:
    - Synchronized `manual-answers-patch-v1.json`, `answers_by_question_uid_v1.json` (pipeline & public), `answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, and `public/questions-filtered.json`.
    - Total master question bank increased from 3,610 to **3,613 questions** with 100% agreement across all 7 parity counts.
    - Rebuilt detail shards: `1988-s0.json` (3 Qs), `1987-s0.json` (44 Qs), mock catalog, search index, and manifest.

- **GATE CSE 1992–1989 (4-Year Batch) Comprehensive Answer Key Audit, Missing Questions Ingestion & Syllabus Classification (DEC-101)**:
  - *Context*: Audited all questions across the 4-year historical batch (GATE CSE 1992, 1991, 1990, 1989) against GateOverflow archive (primary programmatic extractor) and GateOverflow (secondary reference). Prior to this pass, the 4-year question bank had only 45 questions with 29 missing Section A objective questions (17 in 1992, 11 in 1991, 1 in 1989), 5 errata / subjective question misclassifications, and legacy un-normalized year strings (`"gate1992"`, `"gate1991"`, `"gate1990"`, `"gate1989"`).
  - *29 Missing Questions Ingested*:
    - **GATE CSE 1992 (17 Questions)**: `go:557` (Q02.iii, Bit-slice processor cascading $\to$ MCQ Option A, `out-of-syllabus-now`); `go:558` (Q02.iv, 8085 PCHL instruction $\to$ MCQ Option D, `out-of-syllabus-now`); `go:559` (Q02.ix, Radix sort comparison lower bound $\to$ MCQ Option D); `go:560` (Q02.v, Framing synchronization $\to$ MCQ Option C); `go:561` (Q02.vi, Biconnected components polynomial algorithm $\to$ MCQ Option C); `go:562` (Q02.vii, B-tree order 4 max keys $\to$ MSQ `["A", "D"]`); `go:563` (Q02.viii, Kuratowski non-planar $K_5$ $\to$ MCQ Option C); `go:564` (Q02.x, Semaphore value after ops $\to$ MCQ Option B); `go:571` (Q02.xiv, LALR(1) vs LR(1) parser tables $\to$ MSQ `["B", "C", "D"]`); `go:572` (Q02.xix, CFL closure under union/Kleene $\to$ MSQ `["A", "D"]`); `go:574` (Q02.xvi, Tautology $a \wedge b \to b \vee c \to$ MCQ Option B); `go:575` (Q02.xvii, Regular expression identity $r^{**}=r^* \to$ MCQ Option A); `go:576` (Q02.xviii, Strict binary tree internal/total nodes $\to$ MCQ Option C); `go:577` (Q02.xx, DFA and TM deterministic equivalence $\to$ MSQ `["A", "C"]`); `go:579` (Q03.ii, Two-pass assembler activities $\to$ MCQ Option A); `go:589` (Q10, Call-by-value-result mechanism $\to$ MCQ Option D); `go:582` (Q03.v, Serial communication synchronization $\to$ MCQ Option C).
    - **GATE CSE 1991 (11 Questions)**: `go:515` (Q03.i, Bipolar vs MOS memory speed $\to$ MCQ Option B, `out-of-syllabus-now`); `go:517` (Q03.iii, Virtual memory max address space $\to$ MSQ `["A", "B"]`); `go:518` (Q03.iv, 8085 TRAP interrupt hardware RST $\to$ MCQ Option A, `out-of-syllabus-now`); `go:519` (Q03.ix, Linker external names matching $\to$ MCQ Option B); `go:520` (Q03.v, 8085 ALE signal address latching $\to$ MCQ Option C, `out-of-syllabus-now`); `go:521` (Q03.vi, Kruskal algorithm complexity $\to$ MSQ `["B", "D"]`); `go:522` (Q03.vii, Stack operations sequence $\to$ MCQ Option B); `go:528` (Q03.xiv, Language accepted by FA classification $\to$ MSQ `["B", "C", "D"]`); `go:525` (Q03.xi, Critical section / monitors properties $\to$ MSQ `["B", "C"]`); `go:526` (Q03.xii, Propositional logic formulas conjunction unsatisfiable $\to$ MCQ Option B); `go:527` (Q03.xiii, Regular expressions containment $\to$ MSQ `["A", "C"]`).
    - **GATE CSE 1989 (1 Question)**: `go:87141` (Q3-vii, Poisson mean equals variance statement FALSE $\to$ MSQ `["A", "C"]`).
  - *Answer Key Corrections & Subjective Adjustments (5 Questions)*:
    - **`go:84051`** (GATE CSE 1990 Q3-i): Wired-AND of open-collector NAND gates output $Y = \overline{ABC + DE}$ corrected from legacy erratum `C` to **MCQ Option B**.
    - **`go:84054`** (GATE CSE 1990 Q3-ii): Redundancy in 3NF relations corrected from legacy `["A", "B", "D"]` to **MSQ `["B", "D"]`**.
    - **`go:540`** (GATE CSE 1991 Q13): Descriptive sorting pseudo-code question from Section B corrected from legacy MCQ `D` to **`type: "SUBJECTIVE", answer: null`**.
    - **`go:595`** (GATE CSE 1992 Q16): Descriptive proof question from Section B corrected from legacy MSQ `["A", "B"]` to **`type: "SUBJECTIVE", answer: null`**.
    - **`go:546`** (GATE CSE 1992 Q01-ii): 2-blank fill-in question corrected from unnatural legacy NAT `3.5` to **`type: "SUBJECTIVE", answer: null`**.
  - *Year Normalization*:
    - Normalized all legacy year strings across 1992, 1991, 1990, 1989 to numeric integers (`1992`, `1991`, `1990`, `1989`) across all questions.
  - *Data & Parity Harmonization*:
    - Synchronized `manual-answers-patch-v1.json`, `answers_by_question_uid_v1.json` (pipeline & public), `answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, and `public/questions-filtered.json`.
    - Total master question bank increased from 3,581 to **3,610 questions** with 100% agreement across all 7 parity counts.
    - Rebuilt detail shards: `1992-s0.json` (29 Qs), `1991-s0.json` (19 Qs), `1990-s0.json` (17 Qs), `1989-s0.json` (9 Qs), mock catalog, search index, and manifest.

- **GATE CSE 1996–1993 (4-Year Batch) Comprehensive Answer Key Audit, Missing Questions Ingestion & Syllabus Classification (DEC-100)**:
  - *Context*: Audited all questions across the 4-year historical batch (GATE CSE 1996, 1995, 1994, 1993) against GateOverflow archive (primary programmatic extractor) and GateOverflow (secondary reference). Prior to this pass, the 4-year question bank had 179 questions with 8 missing Section A objective questions (4 in 1995, 1 in 1994, 3 in 1993), 5 errata / question type mismatches, 12 unpopulated answer keys, and legacy un-normalized year strings (`"gate1996"`, `"gate1995"`, `"gate1994"`, `"gate1993"`).
  - *8 Missing Questions Ingested*:
    - **GATE CSE 1995 (4 Questions)**: `go:2597` (Q1.10, Context-Sensitive Grammar classification $\to$ MCQ Option C); `go:2609` (Q1.22, Tangent slope $dy/dx = -2x/y$ curve is ellipse $\to$ MCQ Option D); `go:2610` (Q1.23, Pair of straight lines $k=9$ $\to$ MCQ Option C); `go:2630` (Q2.18, ODE $y''+3y'+2y=0$ general solution $\to$ MCQ Option C).
    - **GATE CSE 1994 (1 Question)**: `go:2437` (Q1.1, FORTRAN static memory allocation prevents recursion $\to$ MCQ Option A, `out-of-syllabus-now`).
    - **GATE CSE 1993 (3 Questions)**: `go:2297` (Q7.9, Deadlock-free resource allocation $m=13$ $\to$ MCQ Option D); `go:2303` (Q8.5, Less-than relation on reals is irreflexive $\to$ MCQ Option D); `go:2305` (Q8.7, Asymptotic summation $\sum O(n) = O(n^2)$ $\to$ MCQ Option B).
  - *Answer Key Corrections (5 Questions)*:
    - **`go:2742`** (GATE CSE 1996 Q2.13): Average key comparisons for successful sequential search on $n$ items corrected from legacy `A` ($n/2$) to **MCQ Option C** ($(n+1)/2$).
    - **`go:2744`** (GATE CSE 1996 Q2.15): Quicksort comparisons on sorted vs reverse-sorted inputs corrected from legacy `C` ($C_1 > C_2$) to **MCQ Option B** ($C_1 = C_2$).
    - **`go:2603`** (GATE CSE 1995 Q1.16): Merging two sorted lists comparisons corrected from erroneous `NAT 358` to standard **MCQ Option C** ($O(m+n)$).
    - **`go:2444`** (GATE CSE 1994 Q1.7): Binary search recurrence corrected from legacy `A` ($2T(n/2)+k$) to **MCQ Option B** ($T(n/2)+k$).
    - **`go:2460`** (GATE CSE 1994 Q1.17): Linked lists unsuitable for binary search corrected from erroneous `NAT 3` to standard **MCQ Option B**.
  - *Backfilled Unpopulated Answer Keys (12 Questions)*:
    - Populated: `go:2726` (1996 Q1.22 $\to$ C [OOS]), `go:2734` (1996 Q2.5 $\to$ C [OOS]), `go:2588` (1995 Q1.1 $\to$ B [OOS]), `go:2613` (1995 Q2.1 $\to$ D [OOS]), `go:2627` (1995 Q2.15 $\to$ B [OOS]), `go:597` (1993 Q01.2 $\to$ B), `go:598` (1993 Q01.3 $\to$ MSQ ["A", "B", "C"] [OOS]), `go:262` (1993 Q01.5 $\to$ C [OOS]), `go:601` (1993 Q01.6 $\to$ A [OOS]), `go:602` (1993 Q01.7 $\to$ A), `go:2287` (1993 Q6.4 $\to$ C), `go:2291` (1993 Q7.1 $\to$ B [OOS]).
  - *Year Normalization*:
    - Normalized all legacy year strings across 1996, 1995, 1994, 1993 to numeric integers (`1996`, `1995`, `1994`, `1993`) across all questions.
  - *Data & Parity Harmonization*:
    - Synchronized `manual-answers-patch-v1.json`, `answers_by_question_uid_v1.json` (pipeline & public), `answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, and `public/questions-filtered.json`.
    - Total master question bank increased from 3,573 to **3,581 questions** with 100% agreement across all 7 parity counts.
    - Rebuilt detail shards: `1996-s0.json` (56 Qs), `1995-s0.json` (55 Qs), `1994-s0.json` (37 Qs), `1993-s0.json` (39 Qs), mock catalog, search index, and manifest.

- **GATE CSE 2000–1997 (4-Year Batch) Comprehensive Answer Key Audit, Missing Questions Ingestion & Syllabus Classification (DEC-099)**:
  - *Context*: Audited all questions across the 4-year historical batch (GATE CSE 2000, 1999, 1998, 1997) against GateOverflow archive (first preference) and GateOverflow (secondary reference). Prior to this pass, the 4-year question bank had 206 questions with 14 missing Section A objective questions, 1 erratum in a binary tree traversal question, 6 unpopulated answer keys, and legacy un-normalized year strings (`"gatecse-2000"`, `"gate1999"`, `"gate1998"`, `"gate1997"`).
  - *14 Missing Questions Ingested*:
    - **GATE CSE 2000 (6 Questions)**: `go:630` (Q1.7, 8085 wait state $\to$ MCQ Option B, `out-of-syllabus-now`); `go:632` (Q1.9, 8085 interrupt response $\to$ MCQ Option C, `out-of-syllabus-now`); `go:647` (Q1.23, Relational algebra sum of salaries $\to$ MCQ Option C); `go:655` (Q2.8, 2-state DFA over $\{a\}$ $\to$ MCQ Option D); `go:660` (Q2.13, Graphics card 1 MB mode support $\to$ MCQ Option B); `go:673` (Q2.26, SQL null comparisons $\to$ MCQ Option C).
    - **GATE CSE 1999 (2 Questions)**: `go:1484` (Q2.6, Transaction schedule non-serializability $\to$ MCQ Option D); `go:1498` (Q2.21, Asymptotic recurrence matching $\to$ MCQ Option D).
    - **GATE CSE 1998 (4 Questions)**: `go:1652` (Q1.15, TTL logic 1 threshold $\to$ MCQ Option D); `go:1653` (Q1.16, Serial communication baud rate $\to$ MCQ Option C); `go:1670` (Q1.33, Natural join intersection $\to$ MCQ Option D); `go:1682` (Q2.10, 8086 CPU 1 MB address space $\to$ MCQ Option A, `out-of-syllabus-now`).
    - **GATE CSE 1997 (2 Questions)**: `go:2229` (Q2.3, RS-232 start bit receiver sync $\to$ MCQ Option A); `go:2251` (Q4.10, Trapezoidal method error bound $\to$ MCQ Option C, `out-of-syllabus-now`).
  - *Answer Key Corrections & Population (7 Questions)*:
    - **`go:1661`** (GATE CSE 1998 Q1.24): Binary tree reconstruction from preorder and postorder traversals corrected from legacy MSQ `["B", "C"]` to single **MCQ Option B** (preorder + postorder cannot uniquely construct a general binary tree).
    - **`go:1476`** (GATE CSE 1999 Q1.23): Newton-Raphson quadratic convergence order populated as **MCQ Option D** (`out-of-syllabus-now`).
    - **`go:1491`** (GATE CSE 1999 Q2.13): Static vs dynamic scoping parameter binding populated as **MCQ Option C**.
    - **`go:1492`** (GATE CSE 1999 Q2.14): Fortran call-by-reference parameter passing populated as **MCQ Option A** (`out-of-syllabus-now`).
    - **`go:1640`** (GATE CSE 1998 Q1.3): Bisection method iteration bound populated as **MCQ Option B** (`out-of-syllabus-now`).
    - **`go:2228`** (GATE CSE 1997 Q2.2): 8085 microprocessor instruction execution populated as **MCQ Option C** (`out-of-syllabus-now`).
    - **`go:2253`** (GATE CSE 1997 Q5.2): 8085 microprocessor register pair populated as **MCQ Option B** (`out-of-syllabus-now`).
  - *Year Normalization*:
    - Normalized all legacy year strings across 2000, 1999, 1998, 1997 to integer years (`2000`, `1999`, `1998`, `1997`) across all questions.
  - *Data & Parity Harmonization*:
    - Synchronized `manual-answers-patch-v1.json`, `answers_by_question_uid_v1.json` (pipeline & public), `answers_by_exam_uid_v1.json`, `answers_master_v1.json`, `questions-with-answers.json`, and `questions-filtered.json`.
    - Total master question bank increased from 3,559 to 3,573 questions with 100% agreement across all 7 parity counts.
    - Rebuilt detail shards: `2000-s0.json` (50 Qs), `1999-s0.json` (53 Qs), `1998-s0.json` (58 Qs), `1997-s0.json` (59 Qs), mock catalog, search index, and manifest.
  - *Testing & Verification*:
    - Added unit tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js` under `DEC-099`.
    - Updated mock test pool consistency test in `QuestionPoolConsistency.test.jsx` (Digital Logic scorable count 260 $\to$ 261 due to TTL question `go:1652`).
    - 911 unit tests passing (`npm run test:unit`), TypeScript check clean (`npm run typecheck`), `npm run qa:validate-data` green, and production build clean (`npm run build`).

- **GATE CSE 2001 Comprehensive Answer Key Audit, Missing Questions Ingestion & Syllabus Classification (DEC-098)**:
  - *Context*: Audited all questions of GATE CSE 2001 against GateOverflow archive (first preference) and GateOverflow (secondary reference). Prior to this pass, the 2001 question bank had 49 questions (missing 4 Section A DBMS questions), 1 erratum in legacy quicksort answer, 2 unpopulated answer keys, and legacy un-normalized year strings (`"gatecse-2001"`).
  - *Missing Questions Ingested (4 Questions)*:
    - **`go:716`** (GATE CSE 2001 Q1.23): Relational schema decomposition $R_1(AB), R_2(CD)$ ingested as **MCQ Option C** (Dependency preserving but not lossless join, 1 Mark).
    - **`go:717`** (GATE CSE 2001 Q1.24): Relational algebra query expressibility (graph reachability / transitive closure) ingested as **MCQ Option D** (Cannot be expressed by constant-length relational algebra, 1 Mark).
    - **`go:718`** (GATE CSE 2001 Q1.25): Selection pushdown $\sigma_{A=a}(r \bowtie s)$ ingested as **MCQ Option C** ($\sigma_{A=a}(r) \bowtie s$, 1 Mark).
    - **`go:742`** (GATE CSE 2001 Q2.24): Tuple relational calculus safety expression $\{t \mid \neg(t \in R_1)\}$ ingested as **MCQ Option C** (Unsafe, 2 Marks).
  - *Answer Key Corrections & Population*:
    - **`go:707`** (GATE CSE 2001 Q1.14): Randomized quicksort worst-case time complexity corrected from legacy B ($O(n \log n)$) to **MCQ Option C** ($O(n^2)$).
    - **`go:702`** (GATE CSE 2001 Q1.9): 8085 microprocessor slow memory connection via READY pin populated missing key to **MCQ Option D** (tagged `out-of-syllabus-now`).
    - **`go:737`** (GATE CSE 2001 Q2.19): Dynamic scoping program P2 parameter passing populated missing key to **MCQ Option D** ("None of the above", tagged `out-of-syllabus-now`).
  - *Question UID Mapping & Provenance*:
    - Registered **`go:712`** (MCQ Option B) as the GateOverflow question ID alias for Q1.19 (`go:49481`, ISRO 2007-11 cross-post) in answer registries.
  - *Syllabus Classification & Reclassification*:
    - Out of 50 official Section A objective questions, 48 are relevant to the modern core syllabus.
    - 2 questions reclassified as out-of-syllabus (`out-of-syllabus-now`): `go:702` (8085 Microprocessor) and `go:737` (Dynamic scoping in Pascal/Algol-like language).
    - 3 historical Section B subjective questions (`go:749` Q8 NAT 800, `go:756` Q15 MCQ B, `go:761` Q20 MCQ A) preserved for historical completeness.
  - *Data & Parity Harmonization*:
    - Normalized `year` from string `"gatecse-2001"` to integer `2001` across all 2001 records.
    - Synchronized `manual-answers-patch-v1.json`, `answers_by_question_uid_v1.json` (pipeline & public), `answers_by_exam_uid_v1.json`, `answers_master_v1.json`, `questions-with-answers.json`, and `questions-filtered.json`.
    - Total master question bank increased from 3,555 to 3,559 questions with 100% agreement across all 7 parity counts.
    - Rebuilt `2001-s0.json` (53 questions: 50 Section A objective + 3 Section B subjective), mock catalog, search index, and manifest.
  - *Testing & Verification*:
    - Added unit tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js` under `DEC-098`.
    - 890 unit tests passing (`npm run test:unit`), TypeScript check clean (`npm run typecheck`), `npm run qa:validate-data` green, and production build clean (`npm run build`).

- **GATE CSE 2002 Comprehensive Answer Key Audit, Missing Questions Ingestion & Syllabus Classification (DEC-097)**:
  - *Context*: Audited all questions of GATE CSE 2002 against GateOverflow archive (first preference) and GateOverflow (secondary reference). Prior to this pass, the 2002 question bank had 48 questions, 4 answer/type discrepancies, 3 missing questions, and legacy un-normalized year tags.
  - *Answer Key & Type Corrections*:
    - **`go:807`** (GATE CSE 2002 Q1.3): Recurrence $T(2^k) = 3T(2^{k-1}) + 1, T(1)=1$ corrected from C ($3^{\log_2 k}$) to **MCQ Option B** ($\frac{3^{k+1}-1}{2}$).
    - **`go:840`** (GATE CSE 2002 Q2.10): Randomized search in unsorted array of size $n$ with replacement corrected from C ($2n$) to **MCQ Option A** ($n$, Geometric expectation $E[X]=1/p=n$).
    - **`go:806`** (GATE CSE 2002 Q1.2): Trapezoidal rule exactness populated missing key to **MCQ Option C** (polynomial of degree 0 or 1).
    - **`go:845`** (GATE CSE 2002 Q2.15): Newton-Raphson iteration populated missing key to **MCQ Option A** ($X^2 = 3$).
  - *Missing Questions Ingested (3 Questions)*:
    - **`go:814`** (GATE CSE 2002 Q1.10): 8085 instructions modifying program counter ingested as **MCQ Option D** (All instructions). Classified as out of current syllabus (`out-of-syllabus-now`, `8085-microprocessor`).
    - **`go:815`** (GATE CSE 2002 Q1.11): Asynchronous serial data transmission start/stop bits ingested as **MCQ Option A** (Receiver synchronization).
    - **`go:823`** (GATE CSE 2002 Q1.18): Parameter passing call-by-reference vs value-result ingested as **MCQ Option D** (May differ in presence of exception).
  - *Syllabus Classification & Reclassification*:
    - Out of 50 official objective questions, 46 are relevant to the modern core syllabus.
    - 4 questions reclassified as out-of-syllabus (`out-of-syllabus-now`): `go:806` (Trapezoidal rule), `go:845` (Newton-Raphson), `go:814` (8085 Microprocessor), and `go:834` (8085 Microprocessor).
    - 1 historical Section B question (`go:865` Q12, Floyd-Warshall template) preserved as `type: "SUBJECTIVE", answer: null`, excluded from objective mock test scoring.
  - *Data & Parity Harmonization*:
    - Normalized `year` from string `"gatecse-2002"` to integer `2002` across all 2002 records.
    - Synchronized `manual-answers-patch-v1.json`, `answers_by_question_uid_v1.json` (pipeline & public), `answers_by_exam_uid_v1.json`, `answers_master_v1.json`, `questions-with-answers.json`, and `questions-filtered.json`.
    - Total master question bank increased from 3,552 to 3,555 questions with 100% agreement across all 7 parity counts.
    - Rebuilt `2002-s0.json` (51 questions: 50 objective + 1 subjective), mock catalog, search index, and manifest.
  - *Testing & Verification*:
    - Added unit tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js` under `DEC-097`.
    - 876 unit tests passing (`npm run test:unit`), TypeScript check clean (`npm run typecheck`), `npm run qa:validate-data` green, and production build clean (`npm run build`).

- **Streak Freeze Rules Engine Mechanics & Cloud Sync Architecture (DEC-096)**:
  - *Context*: While the Freeze badge UI, icons, and metric explanation modals were shipped in DEC-094, the underlying calculation engine in `src/utils/weakTopicAnalyzer.js` and cloud sync engine in `src/utils/cloudSyncManager.js` required completion to enforce deterministic, abuse-resistant streak freeze rules.
  - *Engine Upgrades*:
    - **3-Day Earning Interval**: Reduced earning threshold from legacy 7 days to 3 consecutive active practice days (`STREAK_FREEZE_INTERVAL_DAYS = 3`).
    - **1-Shield Reserve Cap**: Strictly capped reserve capacity to at most 1 active Freeze shield (`MAX_STREAK_FREEZE_RESERVE = 1`). Excess days do not accumulate unbounded freezes.
    - **7-Day Rolling Cooldown Rate Limit**: Enforced `STREAK_FREEZE_COOLDOWN_DAYS = 7`. A freeze can be consumed at most once in any 7-day rolling window, preventing continuous unattended streaks.
    - **Consecutive Missed Days Break Streak**: Multi-day gaps ($\ge 2$ consecutive missed days) cannot be bridged by a single shield and immediately break the streak.
    - **Re-Arming Shield**: Completing 3 consecutive active days of practice after using a freeze shield re-arms the shield back to 1.
  - *Additive Cloud Sync Architecture*:
    - Registered `gateqa_streak_freeze_v1` in `cloudSyncManager.js` (`LOCAL_STORAGE_KEYS`).
    - Added pre-merge snapshot backup for `streakFreeze`.
    - Implemented `mergeStreakFreeze(local, cloud)` taking the union of consumed dates, maximum earned count, and capped available reserve.
    - Embedded `streak_freeze` inside `progress_records` JSONB payload for seamless backward-compatible sync with zero SQL schema migrations.
  - *Verification & Testing*:
    - Added 4 new unit tests in `src/utils/weakTopicAnalyzer.test.js` (3-day earning, 1-shield cap, 7-day cooldown, multi-day gap streak break, and re-arming).
    - Added 2 new unit tests in `src/utils/cloudSyncManager.test.js` (union merge and fallback handling).
    - All 861 unit tests pass (`npm run test:unit`), TypeScript check clean (`npm run typecheck`), and public parity validated.


- **Re-Audit Verified Question Corrections, Pipeline Root-Cause Repair & Automated Data-Integrity Validation (DEC-095)**:
  - *Context*: Following the September 2026 audit, users reported incorrect answers and question type mismatches that survived previous passes. An exhaustive investigation was launched to fix verified issues, uncover systemic pipeline flaws, remove duplicate JSON keys, and install permanent CI/QA semantic validators.
  - *Verified Question Corrections*:
    - **`go:357501`** (GATE CSE 2021 Set 2 Q39): Reverted from incorrect MSQ `["A", "B", "C"]` to official **MCQ Option C** (Master Theorem Case 1, CLRS).
    - **`go:8480`** (GATE CSE 2015 Set 3 Q27): Corrected from C to official **MCQ Option B** (Mergesort input size 512 for 6 minutes).
    - **`go:8017`** (GATE CSE 2015 Set 1 Q2): Corrected from A to official **MCQ Option B** ($T(n)=T(n-1)+T(1)+cn$, worst-case Quicksort recurrence).
    - **`go:357499`** (GATE CSE 2021 Set 2 Q41): Restored missing Option D to official strict **MSQ `['B', 'C', 'D']`** (CFL languages).
    - **`go:39587`** (GATE CSE 2016 Set 2 Q38): Converted question type from MCQ to official **NAT 1500** (`tolerance: { abs: 0.01 }`).
    - Protected UIDs (`go:1321`, `go:1325`, `go:1077`, `go:1968`, `go:925`) verified and preserved strictly unchanged.
  - *Root Cause Diagnostics & Registry Cleanse*:
    - Uncovered **940 duplicate question keys** in `answers_by_question_uid_v1.json` and **63 duplicate keys** in `manual-answers-patch-v1.json` caused by legacy string appending. These duplicate keys created shadow overrides where edits to one section were eclipsed.
    - Fully cleansed and de-duplicated all answer registries into unified, valid JSON objects with zero duplicate keys.
    - Resolved 5 single-correct MSQs from 2024 (`go:422828`, `go:422807`, `go:422803`, `go:422884`, `go:422856`) and synchronized `public/questions-with-answers.json`.
  - *Permanent CI/QA Semantic Data-Integrity Validator*:
    - Added `scripts/qa/validate-data-integrity.js` enforcing zero duplicate keys, strict MCQ (A-E choices, no numbers), MSQ (non-empty arrays of distinct A-E choices), NAT (numeric tolerances), defective question contracts, and cross-layer parity between pipeline and public shards.
    - Chained validator into `npm run qa:validate-data`.
  - *Verification & Testing*:
    - Added comprehensive regression tests in `src/utils/evaluateAnswer.test.js` (5 tests).
    - Passed all 855 unit tests (`npm run test:unit`), TypeScript checking (`npm run typecheck`), and public parity validation (`npm run qa:validate-public-parity` across 3,552 questions).

- **Homepage Progress/Status Metrics Clarity, Explanation Modals & UI Declutter (DEC-094)**:
  - *Context*: On the homepage (`/`), the progress banner displayed four key metrics: Best, Aura, Freeze, and Days, alongside two static tags ("25 attempts", "Hard Practice") above an empty top border line. Users were unsure what each metric represented, how it was earned, or how it behaved.
  - *Lightweight Explanation Pop-ups*:
    - Converted the four stat pills (`Best`, `Aura`, `Freeze`, `Days`) into accessible, interactive buttons with subtle hover lift and keyboard focus rings.
    - Implemented a lightweight, accessible `MetricInfoModal` via React `createPortal` matching the compact visual styling of the "Set Daily Goal" modal (`max-w-sm`).
    - Handled outside backdrop clicks, `Escape` key dismissals, and an explicit `Got it` button.
    - Accurately articulated underlying calculations from `src/utils/weakTopicAnalyzer.js`:
      - **Best**: All-time longest streak in continuous calendar days (preserved by Freeze, never decreases).
      - **Aura**: Practice XP calculated from attempts (+5), correct answers (+10), best streak bonus (+15), and hard question bonus (+25), augmented by a 2x multiplier for 7+ day active streaks.
      - **Freeze**: Streak shield rules: 1 freeze earned every 3 consecutive days, capped at 1 in reserve, rate-limited to once per 7-day window.
      - **Days**: Total cumulative distinct calendar days practiced on GateQA (never resets).
  - *Days Calendar Icon*:
    - Replaced the star icon on the Days pill with `FaCalendarAlt` to make its date/calendar representation immediately obvious.
  - *UI Declutter & Space Reclamation*:
    - Eliminated static and non-functional badges (`"25 attempts"`, `"Hard Practice"`) and their wrapper container (`.home-streak-tags`).
    - Removed the superfluous horizontal divider line (`border-top: 1px solid #eef2f7`) and cleaned up legacy styles in `src/index.css`.
    - Reclaimed card height and balanced the progress banner visually.
  - *Mobile Responsiveness & Touch Optimization*:
    - Enhanced `MetricInfoModal` with `max-h-[88vh] overflow-y-auto overscroll-contain` to ensure zero vertical clipping on short mobile devices and in landscape mode.
    - Sized modal action buttons to `min-h-[44px]` (WCAG standard) with `touch-manipulation` and active tap feedback.
    - Enhanced `.home-streak-pill` with `min-height: 2.85rem`, `touch-action: manipulation`, and `-webkit-tap-highlight-color: transparent`.
    - Added `flex-wrap` to `practice-mode-toggles` on `/practice` to prevent cramped or overflowing controls on 320px–375px screens.
    - Updated compact search input font size to `text-base sm:text-sm` to prevent iOS Safari auto-zoom on input focus.
    - Refined `PaginationControls` with `min-h-[34px]` touch targets, smooth horizontal overflow on narrow mobile screens, and responsive status alignment.
    - Updated `MobileBottomNav.jsx` to replace the old `Priority` link with `Tracker` (`FaBullseye` icon) linking directly to `/tracker` (`TRACKER_ROUTE`), enabling 1-tap mobile access to the Preparation Tracker. Updated `MobileBottomNav.test.jsx`.
  - *Verification & Testing*:
    - Added comprehensive unit tests in `src/components/Home/StreakBanner.test.jsx` (6 tests).
    - Passed all 850 unit tests across 78 test suites (`npm run test:unit`) and TypeScript check (`npm run typecheck`).
    - Verified desktop and mobile interactivity, modal opening/closing, and visual balance with `browser_subagent`.

- **Explore Questions Page Vertical Space Utilization & Layout Density Optimization (DEC-093)**:
  - *Context*: On `/practice`, excessive vertical height was allocated to the header panel, practice mode toggles, search input row, active filter chips container, and pagination card. At 100% zoom on 1366×768 and 1080p screens, only 1–2 question rows were visible above the fold.
  - *Inline Search & Control Deck Integration*:
    - Merged the standalone search row directly into the same horizontal line as `PRACTICE MODE` toggles (`practice-mode-and-search`), separated by a subtle vertical divider (`hidden sm:block h-5 w-px bg-[color:var(--color-border)]/80`).
    - Eliminated the redundant full-width search container, its top border separator, and margin spacing, directly saving ~50px of vertical height.
    - Updated `compact` search input in `QuestionSearchInput.tsx` to `min-h-[36px] sm:min-h-[38px] py-1.5` with refined icon and clear-button sizing.
  - *Header & Row Density Tuning ("Compact, Not Compressed")*:
    - Reduced `practice-explore-panel` padding from `p-5` to `px-4 py-3 sm:px-5 sm:py-3.5`.
    - Compacted CTAs: `Start Practice` and mobile `Filters` button to `min-h-[40px] sm:min-h-[42px] rounded-xl`.
    - Reclaimed ghost spacing from empty active filter chips with `.practice-active-chips:empty { display: none; margin: 0; }`.
    - Set table row padding in `QuestionPickerList.jsx` to `px-4 sm:px-5 py-3` (saving 8px per row while maintaining comfortable legibility for multi-line titles).
  - *Compact Pagination Section*:
    - Reduced vertical padding from `p-4` to `px-3.5 py-1.5 sm:px-4 sm:py-1.5` and container radius to `rounded-xl`.
    - Slimmed pagination buttons and page pills from `min-h-[38px]` to `h-7.5 min-h-[30px] min-w-[30px] rounded-lg text-xs`.
    - Compacted jump-to-page input and button to `h-7`.
  - *Impact & Verification*:
    - Reclaimed **~90px to 106px** of vertical space overall.
    - **6 complete question rows** (#1 through #6) are now immediately visible above the fold on 1366×768 (100% zoom).
    - All 844 unit tests (77 test suites) and TypeScript checks (`npm run typecheck`) pass 100% green.

- **Historical Pre-Merge GATE Papers (2004–2008) CSE/IT Separation & Two Separate Selectable Filter Options (DEC-092)**:
  - *Context*: During 2004–2008, Computer Science and Information Technology were separate branches with separate GATE question papers. Displaying `[CSE + IT]` combined or attaching an `[IT]` badge to the CSE row was misleading. The papers must be strictly separated at the data, shard, and query levels, and rendered as **two separate selectable filter options** in chronological order.
  - *Two Independent Selectable Rows*:
    - The filter UI displays two separate selectable options for each pre-merge year:
      - `2008` (CSE paper only)
      - `2008  [IT]` (IT paper only, with small cyan pill badge)
      - `2007` & `2007  [IT]`
      - `2006` & `2006  [IT]`
      - `2005` & `2005  [IT]`
      - `2004` & `2004  [IT]`
    - Absence of "CSE" beside the normal year is intentional as the user is already inside the CSE context.
  - *Independent Semantics & Zero Implicit Merging*:
    - Selecting `2008` queries and returns **CSE 2008 questions only** (85 questions).
    - Selecting `2008 IT` queries and returns **IT 2008 questions only** (74 questions).
    - Explicitly selecting both returns both papers (159 questions).
  - *Data & Shard Decoupling*:
    - Completely decoupled `2004-s0.json` through `2008-s0.json` to contain **only** official CSE questions (90, 90, 85, 85, 85 questions).
    - Created dedicated question detail shards for all 366 IT questions: `it-2004-s0.json` (73 Qs), `it-2005-s0.json` (81 Qs), `it-2006-s0.json` (70 Qs), `it-2007-s0.json` (68 Qs), `it-2008-s0.json` (74 Qs). Total detail shards increased from 55 to 60.
    - Updated `scripts/build-public-artifacts.mjs` and `FilterContext.tsx` so `yearSets` sorts CSE (`track: "cse"`, priority 0) immediately before IT (`track: "it"`, priority 1) for the same year.
  - *Regression & Quality Assurance*:
    - Comprehensive regression suite in `src/tests/historicalCseItSeparation.test.js` and `src/components/Filters/YearFilter.test.jsx`.
    - All 843 unit tests passing 100% green across 77 test suites.
    - `npm run qa:validate-public-parity` (3,552 questions), `npm run qa:validate-data`, `npm run typecheck`, and `npm run build` all pass 100% green.


- **Historical GATE IT Integration under GATE CSE with Year & IT Badges (DEC-091)**:
  - *Context*: Rather than isolating GATE IT into a separate track toggle, historical GATE IT questions (2004–2008) are integrated directly under GATE CSE questions and all CSE setups (Practice, Filters, Search, Solve Page, and Mock Test Custom Builder) because IT and CSE syllabi are closely aligned for GATE preparation.
  - *Data Normalization*:
    - Normalized year from string `"gateit-2004"` through `"gateit-2008"` to integer numbers `2004` through `2008` across all 366 IT questions in `public/questions-with-answers.json` and detail shards `2004-s0.json` to `2008-s0.json`.
    - Standardized `branch: "IT"`, `paper: "IT"`, `source_branch: "IT"`, `paper_scope: "official_it"`, and `tags: ["it", ...]`.
  - *UI & Tag Visibility*:
    - Added `isItQuestion` helper in `src/utils/examTrack.js`.
    - Rendered dedicated `GATE IT` badges in `QuestionResultCard.jsx`, `QuestionPickerList.jsx`, and `SolvePage.jsx` hero meta chips.
    - Added `CSE + IT` indicator badge in `YearFilter.tsx` for years 2004–2008.
  - *Verification*: Full test suite (829 unit tests), data validation, parity checks, and production build pass 100% green.

- **QA Data Integrity & Public Parity Harmonization (DEC-090)**:
  - *Context*: GitHub Actions CI failed at `npm run qa:validate-data` (`idstrmissing orphans: 650`) and `npm run qa:validate-public-parity` (count mismatch between 3549 and 3552).
  - *Resolution*:
    - Populated `question_uid` and `uid` across 650 question records in `public/data/answers/answers_master_v1.json` so they are correctly associated with their canonical question UIDs and consumed by `AnswerService`.
    - Synced restored questions (`go:419`, `go:1224`, `go:1019`) into `public/questions-filtered.json`, bringing total to 3,552.
    - Updated `pipeline-state.json` and `audit/validation-report-2026.json` to 3,552.
    - Hardened `scripts/qa/validate-data.js` with defensive UID deduction from `uid` and `record.uid`.
  - *Affected Files*: `public/data/answers/answers_master_v1.json`, `public/questions-filtered.json`, `pipeline-state.json`, `audit/validation-report-2026.json`, `scripts/qa/validate-data.js`.
  - *Verification*: `npm run qa:validate-data` passed with 0 orphans; `npm run qa:validate-public-parity` confirmed all 7 stores agree on 3,552; full production build (`npm run build`) succeeded.

- **Historical GATE IT Paper Extraction, Separation & Provenance Isolation (2004–2008)**:
  - *Context*: Historical audit identified 366 GATE IT questions from 2004–2008 that required dedicated isolation from CSE papers to preserve authentic exam provenance.
  - *Extracted Standalone Datasets*:
    - Created discrete datasets in `data/it/` and `public/data/it/`: `gateit-2004.json` (73 Qs), `gateit-2005.json` (81 Qs), `gateit-2006.json` (70 Qs), `gateit-2007.json` (68 Qs), `gateit-2008.json` (74 Qs), `gateit-all.json` (366 Qs), and `answers-gateit.json` (366 answers).
    - Pipeline utility: `scripts/pipeline/extract-it-papers.mjs`.
    - Data schema standardized with `exam: "GATE"`, `branch: "IT"`, `paper: "IT"`, and `paper_scope: "official_it"`.


- **GATE CSE 2003 Comprehensive Answer Key Audit & Data Corrections (DEC-089)**:
  - *Context*: Complete audit of all 90 questions of GATE CSE 2003 verified against the reference answer key and GateOverflow authoritative data.
  - *Audit Results*:
    - Audited all 90 genuine questions of GATE CSE 2003.
    - Corrected 12 answer discrepancies, unpopulated keys, and types:
      - **Q12** (`go:903`): Backfilled unpopulated key to **MCQ Option C**.
      - **Q22** (`go:912`): Corrected from legacy Option D to **MCQ Option A**.
      - **Q35** (`go:925`): Corrected from legacy Option D to **MCQ Option B**.
      - **Q42** (`go:933`): Converted from legacy Option D to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
      - **Q49** (`go:43577`): Corrected from legacy Option A to **MCQ Option C**.
      - **Q61** (`go:949`): Corrected from legacy Option A to **MCQ Option B**.
      - **Q62** (`go:43576`): Converted from legacy MSQ `["A", "C"]` to **MCQ Option D**.
      - **Q67** (`go:954`): Corrected from legacy Option D to **MCQ Option B**.
      - **Q68** (`go:955`): Corrected from legacy Option C to **MCQ Option B**.
      - **Q71** (`go:958`): Converted from legacy Option A to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
      - **Q74** (`go:43575`): Converted from unpopulated to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
      - **Q75** (`go:961`): Backfilled unpopulated key to **MCQ Option D**.
    - Normalized `year` to integer `2003` across all 90 questions in `public/questions-with-answers.json`.
    - All 90 questions in GATE CSE 2003 are now 100% complete and scorable (90/90). Total dataset questions maintained at 3,552.
  - *Affected Files*:
    - `data/answers/manual-answers-patch-v1.json` — updated entries for all 90 questions.
    - `data/answers/answers_by_question_uid_v1.json` — synchronized patch entries.
    - `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json` — updated runtime indices.
    - `public/questions-with-answers.json` — updated `answer_meta` and normalized year to integer `2003`.
    - `public/question-detail-shards/2003-s0.json`, `public/mock_catalog_v1.json`, `public/question-search-index.json`, `public/question-bank-manifest.json` — rebuilt static artifacts.
    - `src/utils/evaluateAnswer.test.js` — added regression tests for repaired questions (DEC-089).
  - *Verification*: 205 evaluateAnswer tests pass, static shards regenerated cleanly, 90/90 verified against the reference answer key.

- **GATE CSE 2004 Comprehensive Answer Key Audit, Missing Question Q22 Restoral & Corrections (DEC-088)**:
  - *Context*: Complete audit of all 90 questions of GATE CSE 2004 verified against the reference answer key and GateOverflow authoritative data.
  - *Audit Results*:
    - Restored omitted question **Q22** (`go:1019`, 9600 baud serial communication link 800 characters/s $\rightarrow$ **MCQ Option B**).
    - Corrected 3 answer discrepancies and unpopulated keys:
      - **Q30** (`go:1027`, DCFL and CFL complementation/intersection): Backfilled unpopulated key to **MCQ Option C**.
      - **Q83** (`go:1077`): Corrected from legacy Option A to **MCQ Option D**.
      - **Q84** (`go:1078`): Corrected from legacy Option B to **MCQ Option A**.
    - Normalized `year` to integer `2004` across all 90 questions in `public/questions-with-answers.json`.
    - All 90 questions in GATE CSE 2004 are now 100% complete and scorable (90/90). Total dataset questions increased to 3,552.
  - *Affected Files*:
    - `data/answers/manual-answers-patch-v1.json` — updated entries for all 90 questions.
    - `data/answers/answers_by_question_uid_v1.json` — synchronized patch entries.
    - `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json` — updated runtime indices.
    - `public/questions-with-answers.json` — inserted `go:1019`, updated `answer_meta`, and normalized year to integer `2004`.
    - `public/question-detail-shards/2004-s0.json`, `public/mock_catalog_v1.json`, `public/question-search-index.json`, `public/question-bank-manifest.json` — rebuilt static artifacts.
    - `src/utils/evaluateAnswer.test.js` — added regression tests for repaired questions (DEC-088).
  - *Verification*: 205 evaluateAnswer tests pass, static shards regenerated cleanly, 90/90 verified against the reference answer key.

- **GATE CSE 2005 Comprehensive Answer Key Audit, Missing Answers Population & Corrections (DEC-087)**:
  - *Context*: Complete audit of all 90 questions of GATE CSE 2005 (80 standalone + 10 linked-pair questions 81a–85b) verified against the reference answer key and GateOverflow authoritative data.
  - *Audit Results*:
    - Audited all 90 genuine questions of GATE CSE 2005.
    - Populated/corrected 7 answer discrepancies and missing keys:
      - **Q3** (`go:1345`, Distinct permutations of sorted integer sequence): Backfilled unpopulated key to **MCQ Option C** ($14$).
      - **Q4** (`go:1346`, Graph properties / vertices): Backfilled unpopulated key to **MCQ Option B**.
      - **Q6** (`go:1348`, Graph with 100 vertices and $|i-j|=8$ or $12$): Corrected from legacy Option B to **MCQ Option C** ($4$ connected components).
      - **Q12** (`go:1162`, C function `float f(float x, int y)`): Corrected from legacy Option D to **MCQ Option C** ($256.0$).
      - **Q39** (`go:784`, Algorithms / Data structures): Corrected from legacy Option C to **MCQ Option A**.
      - **Q53** (`go:1376`, Computer Networks / OS): Converted from unpopulated to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
      - **Q81** (`go:1403`, Linked question 81a): Corrected from legacy Option C to **MCQ Option B**.
    - Normalized `year` from `"gatecse-2005"` to integer `2005` across all 90 questions in `public/questions-with-answers.json`.
    - All 90 questions in GATE CSE 2005 are now 100% complete and scorable (90/90). Total dataset questions maintained at 3,551.
  - *Affected Files*:
    - `data/answers/manual-answers-patch-v1.json` — updated entries for all 90 questions.
    - `data/answers/answers_by_question_uid_v1.json` — synchronized patch entries.
    - `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json` — updated runtime indices.
    - `public/questions-with-answers.json` — updated `answer_meta` and normalized year to integer `2005`.
    - `public/question-detail-shards/2005-s0.json`, `public/mock_catalog_v1.json`, `public/question-search-index.json`, `public/question-bank-manifest.json` — rebuilt static artifacts.
    - `src/utils/evaluateAnswer.test.js` — added regression tests for repaired questions (DEC-087).
  - *Verification*: 193 evaluateAnswer tests pass, static shards regenerated cleanly, 90/90 verified against the reference answer key.

- **GATE CSE 2006 Comprehensive Answer Key Audit, Missing Answers Population & Corrections (DEC-086)**:
  - *Context*: Complete audit of all 85 questions of GATE CSE 2006 verified against the reference answer key and GateOverflow authoritative data.
  - *Audit Results*:
    - Audited all 85 genuine questions of GATE CSE 2006.
    - Populated/corrected 6 answer discrepancies and missing keys:
      - **Q11** (`go:890`, Weighted complete graph $G$ on $n$ vertices with $w(v_i, v_j) = 2|i-j|$): Corrected from legacy Option D to **MCQ Option B** ($2n-2$).
      - **Q16** (`go:977`, NP-complete problem $S$ reduction to $Q$): Backfilled unpopulated key to **MCQ Option B** (If $S \le_p Q$, then $Q$ is NP-hard).
      - **Q41** (`go:1817`, CPU cache with 64-byte block size and 32-bit address): Backfilled unpopulated key to **MCQ Option D** ($2048$ words, $10$-bit tag).
      - **Q56** (`go:1834`, Pass-by-reference parameter passing code): Backfilled unpopulated key to **MCQ Option B** ($3, 3$).
      - **Q63** (`go:1841`, Virtual addresses and inverted page table size): Corrected from legacy Option C to **MCQ Option A** (Inverted page table with $2^{20}$ entries).
      - **Q68** (`go:1846`, SQL relational query on enrolled and paid): Corrected from legacy Option A to **MCQ Option B** (Students enrolled in all courses).
    - Normalized `year` from `"gatecse-2006"` to integer `2006` across all 85 questions in `public/questions-with-answers.json`.
    - All 85 questions in GATE CSE 2006 are now 100% complete and scorable (85/85). Total dataset questions maintained at 3,551.
  - *Affected Files*:
    - `data/answers/manual-answers-patch-v1.json` — updated entries for all 85 questions.
    - `data/answers/answers_by_question_uid_v1.json` — synchronized patch entries.
    - `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json` — updated runtime indices.
    - `public/questions-with-answers.json` — updated `answer_meta` and normalized year to integer `2006`.
    - `public/question-detail-shards/2006-s0.json`, `public/mock_catalog_v1.json`, `public/question-search-index.json`, `public/question-bank-manifest.json` — rebuilt static artifacts.
    - `src/utils/evaluateAnswer.test.js` — added regression tests for repaired questions (DEC-086).
  - *Verification*: 187 evaluateAnswer tests pass, static shards regenerated cleanly, 85/85 verified against the reference answer key.

- **GATE CSE 2007 Comprehensive Answer Key Audit, Missing Question Q26 Restoral & Corrections (DEC-085)**:
  - *Context*: Complete audit of all 85 questions of GATE CSE 2007 verified against the reference answer key and GateOverflow authoritative data.
  - *Audit Results*:
    - Restored omitted question **Q26** (`go:1224`, Set partition refinement poset on $\Pi = \{\pi_1, \pi_2, \pi_3, \pi_4\}$ $\rightarrow$ **MCQ Option C**).
    - Corrected 3 answer discrepancies and types:
      - **Q28** (`go:1226`, Newton-Raphson iteration $x_{n+1} = \frac{x_n}{2} + \frac{9}{8x_n}$): Converted from legacy Option A to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
      - **Q41** (`go:1239`, Shortest path in unweighted undirected graph): Corrected from legacy Option A to **MCQ Option D** (BFS algorithm).
      - **Q44** (`go:1242`, Euclidean gcd recursive calls): Corrected from misclassified NAT 10230 to **MCQ Option A** ($\Theta(\log_2 n)$).
    - Normalized `year` from `"gatecse-2007"` to integer `2007` across all 85 questions in `public/questions-with-answers.json`.
    - All 85 questions in GATE CSE 2007 are now 100% complete and scorable (85/85). Total dataset questions increased to 3,551.
  - *Affected Files*:
    - `data/answers/manual-answers-patch-v1.json` — updated entries for all 85 questions.
    - `data/answers/answers_by_question_uid_v1.json` — synchronized patch entries.
    - `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json` — updated runtime indices.
    - `public/questions-with-answers.json` — inserted `go:1224`, updated `answer_meta`, and normalized year to integer `2007`.
    - `public/question-detail-shards/2007-s0.json`, `public/mock_catalog_v1.json`, `public/question-search-index.json`, `public/question-bank-manifest.json` — rebuilt static artifacts.
    - `src/utils/evaluateAnswer.test.js` — added regression tests for repaired questions (DEC-085).
  - *Verification*: 181 evaluateAnswer tests pass, static shards regenerated cleanly, 85/85 verified against the reference answer key.

- **GATE CSE 2008 Comprehensive Answer Key Audit, Missing Question Q21 Restoral & Corrections (DEC-084)**:
  - *Context*: Complete audit of all 85 questions of GATE CSE 2008 verified against the reference answer key and GateOverflow authoritative data.
  - *Audit Results*:
    - Restored omitted question **Q21** (`go:419`, Trapezoidal rule error bound on $\int_1^2 x e^x dx$ $\rightarrow$ **MCQ Option A** $1000e$).
    - Corrected 5 answer discrepancies and types:
      - **Q3** (`go:401`, Linear system unique solution $\alpha \neq 5$): Converted from unpopulated to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
      - **Q7** (`go:405`, Connected components time complexity $\Theta(m+n)$): Corrected from misclassified NAT 109 to **MCQ Option C**.
      - **Q30** (`go:441`, First order logic FSA/PDA): Converted from legacy Option E to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
      - **Q79** (`go:43485`, Binary strings without consecutive 0s $T(5)=13$): Converted from defective null to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
      - **Q84** (`go:394`, Erroneous binary search loop): Corrected from legacy Option A to **MCQ Option C** ($Y=[2,2,\dots,2], x>2$).
      - **Q85** (`go:43508`, Binary search line 6 correction): Corrected from misclassified NAT 5 to **MCQ Option A** (`if (Y[k] < x) i = k+1; else j = k-1;`).
    - Normalized `year` from `"gatecse-2008"` to integer `2008` across all 85 questions in `public/questions-with-answers.json`.
    - All 85 questions in GATE CSE 2008 are now 100% complete and scorable (85/85). Total dataset questions increased to 3,550.
  - *Affected Files*:
    - `data/answers/manual-answers-patch-v1.json` — updated entries for all 85 questions.
    - `data/answers/answers_by_question_uid_v1.json` — synchronized patch entries.
    - `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json` — updated runtime indices.
    - `public/questions-with-answers.json` — inserted `go:419`, updated `answer_meta`, and normalized year to integer `2008`.
    - `public/question-detail-shards/2008-s0.json`, `public/mock_catalog_v1.json`, `public/question-search-index.json`, `public/question-bank-manifest.json` — rebuilt static artifacts.
    - `src/utils/evaluateAnswer.test.js` — added regression tests for repaired questions (DEC-084).
  - *Verification*: 177 evaluateAnswer tests pass, 779 unit tests pass, static shards regenerated cleanly, 85/85 verified against the reference answer key.

- **GATE CSE 2009 Comprehensive Answer Key Audit, Year Normalization & Corrections (DEC-083)**:
  - *Context*: Complete audit of all 60 questions of GATE CSE 2009 verified against the reference answer key and GateOverflow authoritative data (prior to the introduction of the 10-question General Aptitude section in 2010).
  - *Audit Results*:
    - Verified all 60 questions against the reference answer key.
    - Corrected 4 answer discrepancies:
      - **Q11** (`go:1303`, Selection sort worst-case swaps): Corrected from legacy Option C to **MCQ Option A** ($\Theta(n)$).
      - **Q35** (`go:1321`, Recurrence $T(n) = T(n/3) + cn$): Corrected from legacy Option D to **MCQ Option A** ($\Theta(n)$).
      - **Q39** (`go:1325`, Quick-sort $(n/4)^{\text{th}}$ pivot element): Corrected from legacy Option C to **MCQ Option B** ($\Theta(n \log n)$).
      - **Q55** (`go:1339`, Relational query double negation): Converted from legacy Option A to **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
    - Populated runtime answer indices for 5 questions (Q7 `go:1299` MCQ C, Q19 `go:1311` MCQ A, Q46 `go:1332` MCQ B, Q49 `go:1335` MCQ C, Q50 `go:1336` MCQ B).
    - Normalized `year` from string `"gatecse-2009"` to integer `2009` across all 60 questions in `public/questions-with-answers.json`.
    - All 60 questions in GATE CSE 2009 are now 100% complete and scorable (60/60).
  - *Affected Files*:
    - `data/answers/manual-answers-patch-v1.json` — updated entries for all 60 questions.
    - `data/answers/answers_by_question_uid_v1.json` — synchronized patch entries.
    - `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json` — updated runtime indices.
    - `public/questions-with-answers.json` — updated `answer_meta` and normalized year to integer `2009`.
    - `public/question-detail-shards/2009-s0.json`, `public/mock_catalog_v1.json`, `public/question-search-index.json` — rebuilt static artifacts.
    - `src/utils/evaluateAnswer.test.js` — added regression tests for repaired questions (DEC-083).
  - *Verification*: 170 evaluateAnswer tests pass, 779 unit tests pass, static shards regenerated cleanly, 60/60 verified against the reference answer key.

- **GATE CSE 2010 Comprehensive Answer Key Audit & Missing Answers Backfill (DEC-082)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2010 verified against the reference answer key and GateOverflow authoritative data (as no officially released GATE 2010 answer key is available in the public archive).
  - *Audit Results*:
    - Verified all 65 questions against the reference answer key and aligned option orders.
    - Populated 4 previously missing answers in the codebase:
      - **Q2** (`go:1148`, Newton-Raphson approximation for $x^2 - 13 = 0$): Backfilled **MCQ Option B** ($3.607$).
      - **Q21** (`go:2199`, Cyclomatic complexity of sequential integration): Backfilled **MCQ Option D** ($19$).
      - **Q22** (`go:2201`, Software lifecycle activity pairing): Backfilled **MCQ Option B** (P-2, Q-3, R-1, S-4).
      - **Q44** (`go:2345`, Statement coverage test suite): Backfilled **MCQ Option D** (T1, T2, T4).
    - All 65 questions in GATE CSE 2010 are now 100% complete and scorable (65/65).
  - *Affected Files*:
    - `data/answers/manual-answers-patch-v1.json` — synchronized entries for all 65 questions.
    - `data/answers/answers_by_question_uid_v1.json` — synchronized patch entries.
    - `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json` — updated runtime indices.
    - `public/questions-with-answers.json` — updated `answer_meta` and aligned option order.
    - `public/question-detail-shards/2010-s0.json`, `public/mock_catalog_v1.json`, `public/question-search-index.json` — rebuilt static artifacts.
    - `src/utils/evaluateAnswer.test.js` — added regression tests for repaired questions (DEC-082).
  - *Verification*: 165 evaluateAnswer tests pass, 779 unit tests pass, static shards regenerated cleanly, 65/65 verified against the reference answer key.

- **GATE CSE 2011 Comprehensive Answer Key Audit & Year Tag Normalization (DEC-081)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2011 against the official GATE 2011 final answer key (IIT Madras) as the authoritative source of truth.
  - *Audit Results*:
    - **65 / 65 questions already matched the official key** — zero answer key corrections required.
    - All 65 questions are MCQ type; no NAT or MSQ questions in GATE CSE 2011.
    - Normalized `year` field from string `"gatecse-2011"` to integer `2011` for all 65 questions.
    - Rebuilt `public/question-detail-shards/2011-s0.json` with year as integer `2011`.
  - *Affected Files*:
    - `public/questions-with-answers.json` — year normalized to integer `2011` for 65 questions.
    - `public/question-detail-shards/2011-s0.json` — rebuilt shard with integer year.
    - `public/mock_catalog_v1.json`, `public/question-search-index.json`, `public/question-bank-manifest.json` — regenerated by build pipeline.
    - `src/utils/evaluateAnswer.test.js` — 5 new GATE CSE 2011 regression tests added (DEC-081 describe block).
    - `src/services/AnswerService.test.js` — 3 new GATE CSE 2011 AnswerService integration tests added (DEC-081 describe block).
  - *Verification*: 779 unit tests pass (76 test files), typecheck clean, 65/65 questions verified against official key with 0 discrepancies.

- **GATE CSE 2012 Comprehensive Answer Key Audit & Data Corrections (DEC-080)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2012 against the official GATE 2012 final answer key as the authoritative source of truth.
  - *Audit Results*:
    - 57 / 65 questions already matched the official key; 8 corrected.
    - Corrected **Q3** (`go:35`, C switch-case output): Changed from legacy MCQ C to official **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
    - Corrected **Q15** (`go:47`, SQL HAVING clause): Changed from AMBIGUOUS null to official **MCQ Option C** (P and S).
    - Corrected **Q16** (`go:48`, Towers of Hanoi recurrence): Changed from MCQ A to official **MCQ Option D** (`T(n) = 2T(n−1) + 1`).
    - Corrected **Q21** (`go:1577`, CDF of ±1 random variable): Changed from NAT 0.75 to official **MCQ Option C** (0.5 and 1).
    - Corrected **Q29** (`go:786`, MST with squared edge weights): Changed from NAT 6 to official **Marks to All (MTA)**.
    - Corrected **Q39** (`go:1762`, merge-sort on strings complexity): Changed from MCQ B to official **Marks to All (MTA)**.
    - Corrected **Q45** (`go:2156`, TCP AIMD congestion window): Changed from MCQ C to official **Marks to All (MTA)**.
    - Corrected **Q60** (`go:2200`, GA English pronoun): Changed from MCQ A to official **Marks to All (MTA)**.
    - Fixed **Q36** (`go:1758`): Appended explicit `upper-alpha` option list to question HTML, resolving the `missing_options` validation block.
    - Normalized `year` field from string `"gatecse-2012"` to integer `2012` for all 65 questions.
    - Updated `public/mock_catalog_v1.json`: 2012-s0 now `paperReady: true`, `scorableCount: 65`, `missingScorableCount: 0`, `statusReason: "Release-ready."`.
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2012-s0.json`, `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: `npm run test:unit` passing (233 tests in answer test files), `npm run typecheck` clean (0 errors), 65/65 questions fully populated with 0 undefined/discrepant answers. Comparison script `compare_2012_official.mjs` reports: Total: 65, Matches: 65, Differences: 0.

- **GATE CSE 2013 Comprehensive Answer Key Audit & Data Corrections (DEC-079)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2013 against the official GATE 2013 answer key as the authoritative source of truth.
  - *Audit Results*:
    - 62 / 65 questions already matched the official key and were preserved.
    - Corrected **Q30** (`go:1541`, heap sort element sorting time): Corrected from legacy Option B to official **MCQ Option C** ($\Theta(\frac{\log n}{\log \log n})$).
    - Corrected **Q42** (`go:60`, C function `f(p,p)` pass by reference): Converted from legacy NAT 6561 to official **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
    - Corrected **Q47** (`go:80`, first-order logic non-equivalence): Converted from legacy MSQ `["A", "D"]` to official **Marks to All (MTA)** (`type: "MTA"`, `answer: "MTA"`).
    - Shard & Metadata Backfill: Synced missing `answer_meta` for 6 questions (**Q11** `go:1420` MCQ C, **Q13** `go:1435` MCQ D, **Q23** `go:1534` MCQ D, **Q38** `go:1549` MCQ A, **Q46** `go:1555` MCQ B, **Q49** `go:43293` MCQ B) in `public/questions-with-answers.json` and static detail shard `public/question-detail-shards/2013-s0.json`.
    - Populated missing exam UID entries in `public/data/answers/answers_by_exam_uid_v1.json` for GATE 2013 (`cse:2013:set1:main:q11`, `q13`, `q23`, `q30`, `q35`, `q38`, `q42`, `q46`, `q47`, `q49`).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2013-s0.json`, `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: `npm run test:unit` passing (763 tests across 76 suites), all 65/65 questions evaluated and verified against official key with 0 discrepancies.

- **GATE CSE 2014 Sessions 1, 2, 3 Comprehensive Answer Key Audit & Data Population (DEC-078)**:
  - *Context*: Complete audit and data population for all 195 questions across GATE CSE 2014 Session 1, Session 2, and Session 3 (65 questions each: 10 GA + 55 CS) against the official GATE 2014 answer keys (IIT Kharagpur), GateOverflow archive, and GateOverflow accepted solutions.
  - *Audit Results*:
    - 195 / 195 questions mapped 100% confidently between persistent `go:<id>` question UIDs, canonical `exam_uid` keys (`cse:2014:set1/2/3:ga:q1`–`q10` and `cse:2014:set1/2/3:main:q1`–`q55`), and the Official Question Papers.
    - Populated authoritative answers for all 195 previously unpopulated/undefined questions across all three sessions (Session 1: 40 MCQs, 25 NATs; Session 2: 42 MCQs, 23 NATs; Session 3: 47 MCQs, 18 NATs).
    - Session 1: Verified CS Q52 (`go:1932`, graphic degree sequence) as **MCQ Option C** ($(3, 3, 3, 1, 0, 0)$), overriding GateOverflow archive's data corruption (NAT 0).
    - Session 2: Verified all 65 questions matching official IIT Kharagpur keys and GateOverflow archive (100% agreement).
    - Session 3: Identified and restored 4 omitted CS questions between Q22 and Q27: CS Q23 (`go:2057`, OSI layers) $\to$ **MCQ Option B**; CS Q24 (`go:2058`, Bit stuffing) $\to$ **MCQ Option B**; CS Q25 (`go:2059`, IP datagram forwarding) $\to$ **MCQ Option D**; CS Q26 (`go:2060`, CIDR router interface) $\to$ **NAT 1** (`{ abs: 0.01 }`).
    - Normalized 130 questions with legacy string tags (`year: "gatecse-2014-set2"` and `"gatecse-2014-set3"`) to integer `year: 2014` across all 195 questions.
    - Updated `public/mock_catalog_v1.json` with all 3 papers marked `paperReady: true`, `scorableCount: 65`, and `statusReason: 'Release-ready.'`.
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shards (`2014-s1.json`, `2014-s2.json`, `2014-s3.json`), mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: `npm run test:unit` passing (754 tests), `npm run typecheck` clean (0 errors), 195/195 questions populated with 0 undefined answers.

- **GATE CSE 2015 Set 3 Comprehensive Answer Key Audit & Data Population (DEC-077)**:
  - *Context*: Complete audit and data population for all 65 questions of GATE CSE 2015 Set 3 (General Aptitude Q1–Q10 and Computer Science Q1–Q55) against the official GATE 2015 Set 3 answer key (IIT Kanpur CS03), GateOverflow archive, and GateOverflow accepted solutions.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently between persistent `go:<id>` question UIDs, canonical `exam_uid` keys (`cse:2015:set3:ga:q1`–`q10` and `cse:2015:set3:main:q1`–`q55`), and the Official Master Question Paper (CS Q11–Q65).
    - Populated authoritative answers for all 65 previously unpopulated/undefined questions (10 GA + 55 CS).
    - Corrected CS Q55 (`go:8564`) from legacy mock catalog misclassification (NAT) to **MCQ Option A** ($4, 4, 7$).
    - Normalized `year: "gatecse-2015-set3"` string tag to integer `year: 2015` across all 65 questions.
  - *Populated Key Questions Highlight*:
    1. **GA Q10 (`go:8389`, `cse:2015:set3:ga:q10`)**: Exports and imports bar chart highest combined percentage increase. Populated as **NAT `2006`** (`{ lower: 2006, upper: 2006, abs: 0.01 }`).
    2. **CS Q5 (`go:8399`, `cse:2015:set3:main:q5`)**: 4-digit numbers in non-decreasing order from $\{1, 2, 3\}$. Populated as **NAT `15`** ($\binom{3+4-1}{4} = 15$, `{ abs: 0.01 }`).
    3. **CS Q11 (`go:8407`, `cse:2015:set3:main:q11`)**: Software artificially seeded with 100 faults, undetected real faults count. Populated as **NAT `28`** (`{ abs: 0.01 }`).
    4. **CS Q17 (`go:8414`, `cse:2015:set3:main:q17`)**: Hash table 25 slots, 2000 elements load factor $\alpha$. Populated as **NAT `80`** ($2000/25 = 80$, `{ abs: 0.01 }`).
    5. **CS Q21 (`go:8423`, `cse:2015:set3:main:q21`)**: Function point metric calculation ($UFP \times CAF$). Populated as **NAT `612.5`** with accepted interval $[612, 613]$ (`{ lower: 612, upper: 613, abs: 0.5 }`).
    6. **CS Q25 (`go:8428`, `cse:2015:set3:main:q25`)**: Binary tree with 200 leaf nodes, nodes with exactly 2 children. Populated as **NAT `199`** ($200 - 1 = 199$, `{ abs: 0.01 }`).
    7. **CS Q26 (`go:8478`, `cse:2015:set3:main:q26`)**: C program `ptr-p, **ptr`. Populated as **NAT `140`** (`{ abs: 0.01 }`).
    8. **CS Q28 (`go:8481`, `cse:2015:set3:main:q28`)**: Go-Back-N sliding window minimum sequence bits. Populated as **NAT `8`** ($W \ge 201 \implies 8\text{ bits}$, `{ abs: 0.01 }`).
    9. **CS Q35 (`go:8494`, `cse:2015:set3:main:q35`)**: Number of solutions to $(43)_x = (y3)_8$. Populated as **NAT `5`** (`{ abs: 0.01 }`).
    10. **CS Q36 (`go:8495`, `cse:2015:set3:main:q36`)**: Packet switch store-and-forward transmission elapsed time. Populated as **NAT `1575`** (`{ abs: 0.01 }`).
    11. **CS Q37 (`go:8496`, `cse:2015:set3:main:q37`)**: Conditional probability $Pr[X_1 X_2 \oplus X_3 = 0 \mid X_3 = 0]$. Populated as **NAT `0.75`** (`{ abs: 0.01 }`).
    12. **CS Q38 (`go:8497`, `cse:2015:set3:main:q38`)**: Network $200.10.11.144/27$ last assignable host IP octet. Populated as **NAT `158`** (`{ abs: 0.01 }`).
    13. **CS Q40 (`go:8499`, `cse:2015:set3:main:q40`)**: Graph with 100 vertices, edge weights $+5$, new MST weight. Populated as **NAT `995`** ($500 + 99 \times 5 = 995$, `{ abs: 0.01 }`).
    14. **CS Q43 (`go:8503`, `cse:2015:set3:main:q43`)**: Total prime implicants of $f(w,x,y,z) = \sum(0, 2, 4, 5, 6, 10)$. Populated as **NAT `3`** (`{ abs: 0.01 }`).
    15. **CS Q46 (`go:8555`, `cse:2015:set3:main:q46`)**: B+ tree maximum keys accommodated in non-leaf node. Populated as **NAT `50`** (`{ abs: 0.01 }`).
    16. **CS Q48 (`go:8557`, `cse:2015:set3:main:q48`)**: C program switch-case printfs execution count. Populated as **NAT `10`** (`{ abs: 0.01 }`).
    17. **CS Q49 (`go:8558`, `cse:2015:set3:main:q49`)**: Modular exponentiation pseudocode return value. Populated as **NAT `0`** (`{ abs: 0.01 }`).
    18. **CS Q50 (`go:8559`, `cse:2015:set3:main:q50`)**: Motorbike distance using Simpson's 1/3rd rule. Populated as **NAT `309.33`** with accepted range $[308, 310]$ (`{ lower: 308, upper: 310, abs: 1.0 }`).
    19. **CS Q51 (`go:8560`, `cse:2015:set3:main:q51`)**: Pipeline reservation table Minimum Average Latency (MAL). Populated as **NAT `3`** (`{ abs: 0.01 }`).
    20. **CS Q54 (`go:8563`, `cse:2015:set3:main:q54`)**: C program function calls with global & static variables output. Populated as **NAT `230`** (`{ abs: 0.01 }`).
    21. **CS Q55 (`go:8564`, `cse:2015:set3:main:q55`)**: McCabe's Cyclomatic complexity of Program-X, Y, Z. Populated as **MCQ Option A** ($4, 4, 7$).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2015-s3.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: `npm run test:unit` passing, `npm run typecheck` clean (0 errors), 65/65 questions populated and verified with 0 discrepancies.

- **GATE CSE 2015 Set 2 Comprehensive Answer Key Audit & Data Corrections (DEC-076)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2015 Set 2 (General Aptitude Q1–Q10 and Computer Science Q1–Q55) against the official GATE 2015 Set 2 answer key (IIT Kanpur CS02) as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently between persistent `go:<id>` question UIDs, canonical `exam_uid` keys (`cse:2015:set2:ga:q1`–`q10` and `cse:2015:set2:main:q1`–`q55`), and the Official Master Question Paper (CS Q11–Q65).
    - 58 questions were already matching official keys and were preserved completely unchanged (zero churn).
    - 6 questions had missing answer keys or type corruptions and were corrected; 1 NAT question had its tolerance range hardened to match the official accepted interval.
    - Normalized `year: "gatecse-2015-set2"` string tag to integer `year: 2015` across all 65 questions.
  - *Questions Corrected (6 items + 1 range hardening)*:
    1. **CS Q2 (`go:8048`, `cse:2015:set2:main:q2`)**: Complexity classes of problems $Q_1$ and $Q_2$ ($3\text{SAT} \le_P Q_1 \le_P 3\text{SAT}$). Backfilled missing answer key to **MCQ Option A** ($Q_1 \in \text{NP}, Q_2 \in \text{NP-hard}$).
    2. **CS Q4 (`go:8050`, `cse:2015:set2:main:q4`)**: Software engineering deliverable that defines how software will accomplish requirements. Backfilled missing answer key to **MCQ Option C** (Design specification).
    3. **CS Q12 (`go:8062`, `cse:2015:set2:main:q12`)**: Basic COCOMO model effort and development time equations for embedded software. Backfilled missing answer key to **MCQ Option A** ($E = a_b(\text{KLOC})^{b_b}, D = c_b(E)^{d_b}$).
    4. **CS Q28 (`go:8134`, `cse:2015:set2:main:q28`)**: Number of vertices $n$ in a self-complementary graph. Backfilled missing answer key to **MCQ Option D** ($n$ is congruent to $0 \pmod 4$ or $1 \pmod 4$).
    5. **CS Q43 (`go:8216`, `cse:2015:set2:main:q43`)**: Software engineering code review inspection checking compliance. Backfilled missing answer key to **MCQ Option C** (Adherence to coding standards).
    6. **CS Q45 (`go:8243`, `cse:2015:set2:main:q45`)**: Selection algorithm recursive calls for $k$-th smallest element. Corrected from corrupted legacy `NAT: 0.08` to **MCQ Option A** (`(a, left_end, k)` and `(a+left_end+1, n-left_end-1, k-left_end-1)`).
    7. **CS Q49 (`go:8251`, `cse:2015:set2:main:q49`)**: Pipeline processor clock period with non-overlapped pipelining ($1/160\text{ MHz} = 6.25\text{ ns}$, or $6.15\text{ ns}$). Hardened NAT tolerance from narrow $6.15 \pm 0.01$ to official accepted interval $[6.1, 6.2]$ (**NAT `6.15` with `tolerance: { lower: 6.1, upper: 6.2, abs: 0.05 }`**).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2015-s2.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: `npm run test:unit` (712 tests passing across 76 suites), `npm run typecheck` clean (0 errors), 65/65 questions verified against official key with 0 discrepancies.

- **GATE CSE 2015 Set 1 Comprehensive Answer Key Audit & Data Corrections (DEC-075)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2015 Set 1 (General Aptitude Q1–Q10 and Computer Science Q1–Q55) against the official GATE 2015 Set 1 answer key (IIT Kanpur CS01) as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently between persistent `go:<id>` question UIDs, canonical `exam_uid` keys (`cse:2015:set1:ga:q1`–`q10` and `cse:2015:set1:main:q1`–`q55`), and the Official Master Question Paper (CS Q11–Q65).
    - 61 questions were already matching official keys and were preserved completely unchanged (zero churn).
    - 3 questions had missing/undefined answer keys and were backfilled; 1 NAT question had its tolerance range hardened to match the official accepted interval.
    - Normalized `year: "gatecse-2015-set1"` string tag to integer `year: 2015` across all 65 questions.
  - *Questions Corrected (3 items + 1 range hardening)*:
    1. **CS Q1 (`go:8015`, `cse:2015:set1:main:q1`)**: Match the following: Software Testing (Condition coverage, Equivalence class partitioning, Volume testing, Alpha testing). Backfilled missing answer key to **MCQ Option C** (`P - iii, Q - i, R - iv, S - ii`).
    2. **CS Q21 (`go:8244`, `cse:2015:set1:main:q21`)**: Symmetric key cryptography confidential communication among $N$ people. Backfilled missing answer key to **MCQ Option C** ($\frac{N(N-1)}{2}$).
    3. **CS Q42 (`go:8312`, `cse:2015:set1:main:q42`)**: Cyclomatic complexity of binary search `while (first <= last)` program segment ($P + 1 = 4 + 1 = 5$). Backfilled missing answer key to **NAT `5`** (`tolerance: { lower: 5, upper: 5, abs: 0.01 }`).
    4. **CS Q29 (`go:8253`, `cse:2015:set1:main:q29`)**: Slotted ALOHA LAN 4 nodes collision-free frame probability. Hardened NAT tolerance from narrow `0.4404 ± 0.01` to official accepted interval $[0.40, 0.46]$ (**NAT `0.43` with `tolerance: { lower: 0.40, upper: 0.46, abs: 0.03 }`**).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2015-s1.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: `npm run test:unit` passing, `npm run typecheck` clean (0 errors), 65/65 questions verified against official key with 0 discrepancies.

- **GATE CSE 2016 Session 1 & Session 2 Comprehensive Answer Key Audit & Data Corrections (DEC-074)**:
  - *Context*: Complete audit of all 130 questions across GATE CSE 2016 Session 1 (65 questions) and Session 2 (65 questions) against the official GATE 2016 answer keys (IISc Bangalore) as the authoritative source of truth.
  - *Audit Results*:
    - 130 / 130 questions mapped 100% confidently to persistent `go:<id>` question UIDs and canonical `exam_uid` keys (`cse:2016:set1:` and `cse:2016:set2:`).
    - 121 questions were already matching official keys and were preserved completely unchanged (zero churn).
    - 9 questions had discrepancies / missing keys / type misclassifications and were corrected; 7 NAT tolerances / ranges were hardened.
    - Normalized `year: "gatecse-2016-set1"` and `"gatecse-2016-set2"` (strings) to integer `year: 2016` across all 130 questions in `public/questions-with-answers.json`.
  - *Questions Corrected (9 items + 7 range/tolerance hardenings)*:
    1. **Set 1 CS Q14 (`go:39673`, `cse:2016:set1:main:q14`)**: Effect of increasing graph edge weights on MST and shortest paths. Converted from misclassified `NAT 7` to **MCQ Option A** (P is TRUE and Q is FALSE).
    2. **Set 1 CS Q39 (`go:39725`, `cse:2016:set1:main:q39`)**: Maximum possible weight of an MST in complete graph $K_4$ with edge weights 1..6. Converted from misclassified `MCQ Option B` to numerical fill-in-the-blank **NAT `7`** (`tolerance: { abs: 0.01 }`).
    3. **Set 1 CS Q40 (`go:39727`, `cse:2016:set1:main:q40`)**: Statements on lightest and heaviest edge in simple graph MST. Converted from misclassified `NAT 4` to **MCQ Option B**.
    4. **Set 1 CS Q52 (`go:39694`, `cse:2016:set1:main:q52`)**: Digitally signed and encrypted message format from $B$ to $A$. Restored missing answer key to **MCQ Option B** (`tolerance: null`).
    5. **Set 1 CS Q54 (`go:39720`, `cse:2016:set1:main:q54`)**: Token bucket algorithm transmission time for 12 MB ($0.1\text{s} + 1.0\text{s} = 1.1\text{s}$). Corrected legacy center 1.145 to official **NAT `1.1`** (`tolerance: { lower: 1.1, upper: 1.1, abs: 0.01 }`).
    6. **Set 1 CS Q8 (`go:39670`, `cse:2016:set1:main:q8`)**: Synchronous counter minimum JK flip-flops NAT range hardened to explicit $[3.0, 4.0]$ (**NAT `3.5` with `{ lower: 3.0, upper: 4.0, abs: 0.5 }`**).
    7. **Set 1 CS Q27 (`go:39714`, `cse:2016:set1:main:q27`)**: Recurrence $a_{99} = K \times 10^4$ NAT range hardened to explicit $[197.9, 198.1]$ (**NAT `198` with `{ lower: 197.9, upper: 198.1, abs: 0.1 }`**).
    8. **Set 1 CS Q29 (`go:39709`, `cse:2016:set1:main:q29`)**: Coin flip experiment probability NAT range hardened to explicit $[0.33, 0.34]$ (**NAT `0.335` with `{ lower: 0.33, upper: 0.34, abs: 0.005 }`**).
    9. **Set 1 CS Q32 (`go:39691`, `cse:2016:set1:main:q32`)**: Pipeline stage delay replacement percentage speedup NAT range hardened to explicit $[33.0, 34.0]$ (**NAT `33.5` with `{ lower: 33.0, upper: 34.0, abs: 0.5 }`**).
    10. **Set 2 CS Q13 (`go:39561`, `cse:2016:set2:main:q13`)**: Sorting algorithms behavior on already sorted input. Corrected from legacy Option C ("II and IV only") to **MCQ Option D** ("I and IV only": Quicksort $\Theta(n^2)$ and Insertion sort $\Theta(n)$).
    11. **Set 2 CS Q23 (`go:39555`, `cse:2016:set2:main:q23`)**: Digital signature verification by receiver Salim. Restored missing answer key to **MCQ Option A** (Anarkali's public key).
    12. **Set 2 CS Q38 (`go:39587`, `cse:2016:set2:main:q38`)**: Matrix chain multiplication min scalar multiplications for $10\times 5, 5\times 20, 20\times 10, 10\times 5$. Converted from misclassified `MCQ Option C` to **NAT `1500`** (`tolerance: { abs: 0.01 }`).
    13. **Set 2 CS Q39 (`go:39581`, `cse:2016:set2:main:q39`)**: Flowchart recursive algorithm complexity exponent $\alpha$. Converted from misclassified `MCQ Option B` to **NAT `2.3`** with official accepted range $[2.2, 2.4]$ (`tolerance: { lower: 2.2, upper: 2.4, abs: 0.1 }`).
    14. **Set 2 CS Q6 (`go:39549`, `cse:2016:set2:main:q6`)**: Probability NAT range hardened to official accepted interval $[0.124, 0.126]$ (**NAT `0.125` with `{ lower: 0.124, upper: 0.126, abs: 0.001 }`**).
    15. **Set 2 CS Q33 (`go:39580`, `cse:2016:set2:main:q33`)**: Paging / TLB hit ratio NAT range hardened to official accepted interval $[3.9, 4.1]$ (**NAT `4.0` with `{ lower: 3.9, upper: 4.1, abs: 0.1 }`**).
    16. **Set 2 CS Q47 (`go:39625`, `cse:2016:set2:main:q47`)**: Relational database query cost / block transfers NAT range hardened to official accepted interval $[8.2, 8.3]$ (**NAT `8.25` with `{ lower: 8.2, upper: 8.3, abs: 0.05 }`**).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shards `public/question-detail-shards/2016-s1.json`, `public/question-detail-shards/2016-s2.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: All 695 unit tests passing (76 test files), `npm run typecheck` clean (0 errors), 130/130 questions verified against official keys with 0 discrepancies.

- **GATE CSE 2017 Set 2 Comprehensive Answer Key Audit & Data Corrections (DEC-073)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2017 Set 2 (General Aptitude Q1–Q10 and Computer Science Q1–Q55) against the official GATE 2017 Set 2 answer key (IIT Roorkee) as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently to persistent `go:<id>` question UIDs (`go:118415`–`go:118424` for GA Q1–Q10, `go:118337`–`go:118335` for CS Q1–Q55) and canonical `exam_uid` keys (`cse:2017:set2:ga:q1`–`q10` and `cse:2017:set2:main:q1`–`q55`).
    - 64 questions were already matching and preserved completely unchanged (zero churn).
    - 1 discrepancy corrected (CS Q45).
  - *Questions Corrected (1 item)*:
    1. **CS Q45 (`go:118597`, `cse:2017:set2:main:q45`)**: Memory hierarchy AMAT calculation with I-cache, D-cache, L2-cache, and Main Memory ($0.6 \times 5.4 + 0.4 \times 3.7 = 4.72\text{ ns}$). Corrected from legacy center 4.75 to official **NAT `4.72`** (`tolerance: { lower: 4.70, upper: 4.74, abs: 0.02 }`).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2017-s2.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: All 683 unit tests passing (76 test files), `npm run typecheck` clean (0 errors), 65/65 questions verified against official key with 0 discrepancies.

- **GATE CSE 2017 Set 1 Comprehensive Answer Key Audit & Data Corrections (DEC-072)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2017 Set 1 (General Aptitude Q1–Q10 and Computer Science Q1–Q55) against the official GATE 2017 Set 1 answer key (IIT Roorkee) as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently to persistent `go:<id>` question UIDs (`go:118403`–`go:118413` for GA Q1–Q10, `go:118698`–`go:118442` for CS Q1–Q55) and canonical `exam_uid` keys (`cse:2017:set1:ga:q1`–`q10` and `cse:2017:set1:main:q1`–`q55`).
    - 60 questions were already matching and preserved completely unchanged (zero churn).
    - 5 questions had discrepancies / missing keys and were corrected; 3 NAT tolerances / ranges were hardened.
  - *Questions Corrected (5 items + 3 range/tolerance hardenings)*:
    1. **CS Q15 (`go:118295`, `cse:2017:set1:main:q15`)**: Digital signature security violations (Denial of Service & forwarding signed message). Restored missing answer key to **MCQ Option B** (I and II only).
    2. **CS Q23 (`go:118303`, `cse:2017:set1:main:q23`)**: SQL query on relation EMP (`GROUP BY DeptName`). Converted from legacy `AMBIGUOUS null` to **NAT `2.6`** (`tolerance: { lower: 2.6, upper: 2.6, abs: 0.01 }`).
    3. **CS Q44 (`go:118327`, `cse:2017:set1:main:q44`)**: RSA cryptosystem private key calculation ($p=13, q=17, e=35 \implies \phi(n)=192, d=11$). Restored missing answer key to **NAT `11`** (`tolerance: { abs: 0.01 }`).
    4. **CS Q45 (`go:118328`, `cse:2017:set1:main:q45`)**: Stop-and-wait ARQ protocol parameters. Hardened from shifted legacy range $[86.5, 89.5]$ to official accepted interval $[86.5, 87.5]$ (**NAT `87.0` with `tolerance: { lower: 86.5, upper: 87.5, abs: 0.5 }`**).
    5. **CS Q48 (`go:118331`, `cse:2017:set1:main:q48`)**: Array of 31 numbers worst case probes by optimal algorithm ($\lceil \log_2(32) \rceil = 5$). Converted from legacy misclassified `MSQ ["B", "C", "D"]` to **NAT `5`** (`tolerance: { abs: 0.01 }`).
    6. **CS Q46 (`go:118329`, `cse:2017:set1:main:q46`)**: NAT tolerance hardened from null to **`{ abs: 0.01 }`** for answer **4**.
    7. **CS Q49 (`go:118332`, `cse:2017:set1:main:q49`)**: RISC PC-relative branch offset NAT range hardened to official accepted interval $[-16.1, -15.9]$ (**NAT `-16.0` with `tolerance: { lower: -16.1, upper: -15.9, abs: 0.1 }`**).
    8. **CS Q50 (`go:118719`, `cse:2017:set1:main:q50`)**: Pipelined processor clock frequency speedup NAT range hardened to official accepted interval $[1.49, 1.52]$ (**NAT `1.505` with `tolerance: { lower: 1.49, upper: 1.52, abs: 0.015 }`**).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2017-s1.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: All 681 unit tests passing (76 test files), `npm run typecheck` clean (0 errors), 65/65 questions verified against official key with 0 discrepancies.

- **GATE CSE 2018 Comprehensive Answer Key Audit & Data Corrections (DEC-071)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2018 (General Aptitude Q1–Q10 and Computer Science Q1–Q55) against the official GATE 2018 answer key (IIT Guwahati) as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently to persistent `go:<id>` question UIDs (`go:204062`–`go:204071` for GA Q1–Q10, `go:204075`–`go:204130` for CS Q1–Q55) and canonical `exam_uid` keys (`cse:2018:set1:main:qga-1`–`qga-10` and `cse:2018:set1:main:q1`–`q55`).
    - 61 questions were already matching and preserved completely unchanged (zero churn).
    - 4 questions had discrepancies and were corrected; 5 NAT ranges were hardened.
    - Normalized `year: "gatecse-2018"` (string) to integer `year: 2018` across all 65 questions in `public/questions-with-answers.json`.
  - *Questions Corrected (4 items + 5 range hardenings)*:
    1. **CS Q31 (`go:204105`, `cse:2018:set1:main:q31`)**: Matrix Chain Multiplication explicitly computed pair for $F_1(2\times 25), F_2(25\times 3), F_3(3\times 16), F_4(16\times 1), F_5(1\times 1000)$. Corrected from legacy Option B to **MCQ Option C** ($F_3F_4$ only).
    2. **CS Q41 (`go:204115`, `cse:2018:set1:main:q41`)**: Relational algebra non-equivalence with $Q: r \bowtie (\sigma_{B<5}(s))$. Corrected from legacy Option D to **MCQ Option C** ($r \text{ LOJ } (\sigma_{B<5}(s))$).
    3. **CS Q45 (`go:204120`, `cse:2018:set1:main:q45`)**: Pseudo-code recursive `Count(1024, 1024)` asterisks printed count ($\log_2(1024) \times 1023 = 10 \times 1023 = 10230$). Corrected from legacy 60 to **NAT `10230`** (`tolerance: { abs: 0.01 }`).
    4. **CS Q47 (`go:204122`, `cse:2018:set1:main:q47`)**: Value for $x$ maximizing number of MWSTs (number of MWSTs of graph $G$). Converted from legacy misclassified MCQ "D" to **NAT `4`** (`tolerance: { abs: 0.01 }`).
    5. **CS Q15 (`go:204089`, `cse:2018:set1:main:q15`)**: Probability NAT range hardened to official accepted interval `[0.021, 0.024]` (**NAT `0.0225` with `tolerance: { lower: 0.021, upper: 0.024, abs: 0.0015 }`**).
    6. **CS Q16 (`go:204090`, `cse:2018:set1:main:q16`)**: Calculus integration NAT range hardened to official accepted interval `[0.27, 0.30]` (**NAT `0.285` with `tolerance: { lower: 0.27, upper: 0.30, abs: 0.015 }`**).
    7. **CS Q23 (`go:204097`, `cse:2018:set1:main:q23`)**: Memory interfacing NAT range hardened to official accepted interval `[59.0, 60.0]` (**NAT `59.5` with `tolerance: { lower: 59.0, upper: 60.0, abs: 0.5 }`**).
    8. **CS Q25 (`go:204099`, `cse:2018:set1:main:q25`)**: TCP congestion window NAT range hardened to official accepted interval `[34, 35]` (**NAT `34.5` with `tolerance: { lower: 34, upper: 35, abs: 0.5 }`**).
    9. **CS Q44 (`go:204119`, `cse:2018:set1:main:q44`)**: Conditional probability NAT range hardened to official accepted interval `[0.60, 0.62]` (**NAT `0.61` with `tolerance: { lower: 0.60, upper: 0.62, abs: 0.01 }`**).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2018-s0.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: All 670 unit tests passing (76 test files), `npm run typecheck` clean (0 errors), 65/65 questions verified against official key with 0 discrepancies.


  - *Context*: Complete audit of all 65 questions of GATE CSE 2019 (General Aptitude Q1–Q10 and Computer Science Q1–Q55) against the official GATE 2019 answer key (IIT Madras) as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently to persistent `go:<id>` question UIDs (`go:302872`–`go:302863` for GA Q1–Q10, `go:302847`–`go:302793` for CS Q1–Q55) and canonical `exam_uid` keys (`cse:2019:set1:main:qga-1`–`qga-10` and `cse:2019:set1:main:q1`–`q55`).
    - 60 questions were already matching and preserved completely unchanged (zero churn).
    - 5 questions had discrepancies and were corrected; 2 additional NAT ranges were hardened.
    - Normalized `year: "gatecse-2019"` (string) to integer `year: 2019` across all 65 questions in `public/questions-with-answers.json`.
  - *Questions Corrected (5 items + 2 range hardenings)*:
    1. **CS Q12 (`go:302836`, `cse:2019:set1:main:q12`)**: Number of Hamiltonian cycles in undirected complete graph $K_n$ ($\frac{(n-1)!}{2}$). Converted from legacy `MSQ ["C", "D"]` to **MCQ Option D**.
    2. **CS Q20 (`go:302828`, `cse:2019:set1:main:q20`)**: Probability pivot placed in worst possible location in 25-element Quicksort ($2/25 = 0.08$). Corrected from legacy 0 to **NAT `0.08`** (`tolerance: { lower: 0.08, upper: 0.08, abs: 0.005 }`).
    3. **CS Q22 (`go:302826`, `cse:2019:set1:main:q22`)**: Probability two numbers from $\{1..13\}$ have same 4-bit MSB ($85/169 \approx 0.503$). Hardened from wide range `[0.5, 0.51]` to official accepted range **NAT `0.503` with `tolerance: { lower: 0.502, upper: 0.504, abs: 0.001 }`**.
    4. **CS Q42 (`go:302806`, `cse:2019:set1:main:q42`)**: Official accepted range `[4.0, 4.1]`. Centered and hardened to **NAT `4.05` with `tolerance: { lower: 4.0, upper: 4.1, abs: 0.05 }`**.
    5. **CS Q50 (`go:302798`, `cse:2019:set1:main:q50`)**: Minimum 2-input NOR gates to implement 4-variable XOR/XNOR function $\Sigma(0,2,5,7,8,10,13,15)$ with complements available ($B \odot D$). Corrected from legacy 3 to **NAT `4`** (`tolerance: { abs: 0.01 }`).
    6. **CS Q54 (`go:302794`, `cse:2019:set1:main:q54`)**: RSA public modulus $n=3007, \phi(n)=2880$, prime factor greater than 50 ($97 \times 31 = 3007$). Restored missing answer key to **NAT `97`** (`tolerance: { abs: 0.01 }`).
    7. **CS Q55 (`go:302793`, `cse:2019:set1:main:q55`)**: Relational algebra query tuples count. Hardened to **NAT `1` with `tolerance: { abs: 0.01 }`**.
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2019-s0.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: All 660 unit tests passing (76 test files), `npm run typecheck` clean (0 errors), 65/65 questions verified against official key with 0 discrepancies.

- **GATE CSE 2020 Comprehensive Answer Key Audit & Data Corrections (DEC-069)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2020 (General Aptitude Q1–Q10 and Computer Science Q1–Q55) against the official GATE 2020 answer key (IIT Delhi) as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently to persistent `go:<id>` question UIDs (`go:333240`–`go:333231` for GA Q1–Q10, `go:333230`–`go:333176` for CS Q1–Q55) and canonical `exam_uid` keys (`cse:2020:set1:main:qga-1`–`qga-10` and `cse:2020:set1:main:q1`–`q55`).
    - 57 questions were already matching and preserved completely unchanged (zero churn).
    - 8 questions had discrepancies and were corrected; 2 special cases (CS Q7 MTA and CS Q21 dual NAT values) were implemented.
    - Normalized `year: "gatecse-2020"` (string) to integer `year: 2020` across all 65 questions in `public/questions-with-answers.json`.
  - *Questions Corrected (8 items)*:
    1. **CS Q2 (`go:333229`, `cse:2020:set1:main:q2`)**: Recurrence $T(n) = T(n^{1/a}) + 1, T(b) = 1$. Corrected from legacy Option C to **MCQ Option A** ($\Theta(\log_a \log_b n)$).
    2. **CS Q7 (`go:333224`, `cse:2020:set1:main:q7`)**: Regular expression for odd number of 1s. Converted from Option B to **Marks to All (`type: "MTA"`, `answer: "MTA"` / Special Case)**.
    3. **CS Q17 (`go:333214`, `cse:2020:set1:main:q17`)**: Probability that binary relation on 3-element set is reflexive ($2^6 / 2^9 = 1/8 = 0.125$). Corrected from legacy scraping artifact `0.1254` to **NAT `0.125`** with explicit bounds `tolerance: { lower: 0.125, upper: 0.125, abs: 0.005 }`.
    4. **CS Q21 (`go:333210`, `cse:2020:set1:main:q21`)**: Cache memory access time AMAT. Corrected from corrupt legacy value `2454` to official dual accepted values **`13.3 and 13.5`** with multi-range schema `tolerance: { ranges: [{ min: 13.3, max: 13.3, lower: 13.3, upper: 13.3 }, { min: 13.5, max: 13.5, lower: 13.5, upper: 13.5 }] }` (Special Case).
    5. **CS Q40 (`go:333191`, `cse:2020:set1:main:q40`)**: Graph shortest path invariance under potential function reweighting $w'(u,v) = w(u,v) + f(u) - f(v)$. Corrected from legacy Option C to **MCQ Option A** ("for every $f: V \to \mathbb{R}$").
    6. **CS Q49 (`go:333182`, `cse:2020:set1:main:q49`)**: Minimum spanning tree weight of complete graph on 100 vertices with $w(v_i, v_j) = |i-j|$ ($99 \times 1 = 99$). Corrected from legacy 3 to **NAT `99`** (`tolerance: { abs: 0.01 }`).
    7. **CS Q50 (`go:333181`, `cse:2020:set1:main:q50`)**: Absolute difference between average turnaround times of SJF and RR CPU scheduling ($|10.5 - 15.75| = 5.25$). Corrected from legacy `5.255` to **NAT `5.25`** (`tolerance: { abs: 0.01 }`).
    8. **CS Q53 (`go:333178`, `cse:2020:set1:main:q53`)**: Paging system AMAT with TLB and page faults. Official accepted range is `[154.5, 155.5]`. Centered and hardened from shifted legacy range `[155.0, 156.0]` to **NAT `155.0` with `tolerance: { lower: 154.5, upper: 155.5, abs: 0.5 }`**.
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2020-s0.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`, `src/services/AnswerService.test.js`.
  - *Verification*: All 653 unit tests passing (76 test files), `npm run typecheck` clean (0 errors), 65/65 questions verified against official key with 0 discrepancies.

- **GATE CSE 2021 Session 1 & Session 2 Comprehensive Answer Key Audit, Evaluator Schema Enhancement & Data Corrections (DEC-068)**:
  - *Context*: Complete audit of all 130 questions across both sessions of GATE CSE 2021 (Session 1 Q1–Q65 and Session 2 Q1–Q65) against the official GATE 2021 CSE final answer keys (IIT Bombay) as the authoritative source of truth.
  - *Audit Results*:
    - 130 / 130 questions mapped 100% confidently to persistent `go:<id>` question UIDs and canonical `exam_uid` keys (`cse:2021:set1:ga:q1`–`q10`, `cse:2021:set1:main:q1`–`q55`, `cse:2021:set2:ga:q1`–`q10`, `cse:2021:set2:main:q1`–`q55`).
    - 111 questions were already matching and preserved completely unchanged (zero churn).
    - 19 questions had discrepancies and were corrected; 2 official key exceptions (multi-accepted MCQ options and multi-range NATs) were implemented.
  - *Evaluator & Schema Enhancements*:
    - Enhanced `src/utils/evaluateAnswer.js` and `src/utils/mockTest.js` to support multi-accepted MCQ alternatives (`Array.isArray(record.answer)` with type `MCQ`) and multi-range NATs (`record.tolerance.ranges`).
  - *Session 1 (CS-1) Corrections (8 items)*:
    1. **GA Q9 (`go:357468`, `cse:2021:set1:ga:q9`)**: Official alternative MCQ **C OR D**. Evaluator enhanced and updated to `type: "MCQ"`, `answer: ["C", "D"]`.
    2. **CS Q9 (`go:357443`, `cse:2021:set1:main:q9` / Off. Q19)**: Sorting algorithm behavior. Corrected from Option D to **MCQ Option C** (Insertion Sort on sorted array).
    3. **CS Q12 (`go:357440`, `cse:2021:set1:main:q12` / Off. Q22)**: Relational algebra question. Converted from MCQ "D" to **MSQ `["D"]`**.
    4. **CS Q17 (`go:357434`, `cse:2021:set1:main:q17` / Off. Q27)**: Max-flow / graph problem. Converted from MCQ "C" to **NAT `3`** (`tolerance: { abs: 0.01 }`).
    5. **CS Q23 (`go:357428`, `cse:2021:set1:main:q23` / Off. Q33)**: Official dual accepted range **`819 to 820 OR 205 to 205`**. Updated to **NAT** with explicit `tolerance: { ranges: [{ min: 819, max: 820 }, { min: 205, max: 205 }] }`.
    6. **CS Q41 (`go:357410`, `cse:2021:set1:main:q41` / Off. Q51)**: Regular expressions/automata. Converted from MCQ "B" to **MSQ `["B"]`**.
    7. **CS Q43 (`go:357408`, `cse:2021:set1:main:q43` / Off. Q53)**: Database transaction scheduling. Converted from MCQ "C" to **MSQ `["C"]`**.
    8. **CS Q47 (`go:357404`, `cse:2021:set1:main:q47` / Off. Q57)**: Cache memory mapping. Converted from MCQ "C" to **MSQ `["C"]`**.
  - *Session 2 (CS-2) Corrections (11 items)*:
    9. **CS Q1 (`go:357539`, `cse:2021:set2:main:q1` / Off. Q11)**: Grammar/parsing question. Converted from MSQ `["A", "B", "C"]` to **MCQ Option C**.
    10. **CS Q13 (`go:357527`, `cse:2021:set2:main:q13` / Off. Q23)**: IP addressing / subnets. Converted from MCQ "D" to **MSQ `["D"]`**.
    11. **CS Q23 (`go:357517`, `cse:2021:set2:main:q23` / Off. Q33)**: Pipeline execution cycles. Converted from MCQ "D" to **NAT `15`** (`tolerance: { abs: 0.01 }`).
    12. **CS Q36 (`go:357504`, `cse:2021:set2:main:q36` / Off. Q46)**: Set theory / relations. Converted from MCQ "C" to **MSQ `["A", "C", "D"]`**.
    13. **CS Q37 (`go:357503`, `cse:2021:set2:main:q37` / Off. Q47)**: Graph theory / Hamiltonian paths. Converted from MCQ "B" to **MSQ `["B", "C", "D"]`**.
    14. **CS Q38 (`go:357502`, `cse:2021:set2:main:q38` / Off. Q48)**: CPU scheduling algorithms. Converted from MCQ "A" to **MSQ `["A", "D"]`**.
    15. **CS Q39 (`go:357501`, `cse:2021:set2:main:q39` / Off. Q49)**: Compiler syntax analysis. Converted from MCQ "A" to **MSQ `["A", "B", "C"]`**.
    16. **CS Q40 (`go:357500`, `cse:2021:set2:main:q40` / Off. Q50)**: Functional dependencies / normal forms. Corrected from MSQ `["A", "C", "D"]` to **MSQ `["A", "D"]`**.
    17. **CS Q41 (`go:357499`, `cse:2021:set2:main:q41` / Off. Q51)**: Operating systems paging/segmentation. Corrected from MSQ `["B", "C", "D"]` to **MSQ `["B", "C"]`**.
    18. **CS Q42 (`go:357498`, `cse:2021:set2:main:q42` / Off. Q52)**: Graph connectivity / trees. Corrected from MSQ `["A", "D"]` to **MSQ `["A", "B"]`**.
    19. **CS Q53 (`go:357484`, `cse:2021:set2:main:q53` / Off. Q63)**: Official accepted range `[1.87, 1.88]`. Corrected from `1.875 +/- 0.01` (`[1.865, 1.885]`) to **NAT `1.875` with `tolerance: { lower: 1.87, upper: 1.88, abs: 0.005 }`**.
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shards `public/question-detail-shards/2021-s1.json`, `public/question-detail-shards/2021-s2.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests & evaluator: `src/utils/evaluateAnswer.js`, `src/utils/mockTest.js`, `src/utils/evaluateAnswer.test.js`.
  - *Verification*: All 644 unit tests passing (76 test files), `npm run qa:validate-public-parity` clean (all 3,549 counts agree), `npm run typecheck` clean (0 errors), 130/130 questions verified against official key with 0 discrepancies.

- **GATE CSE 2022 Comprehensive Answer Key Audit & Data Corrections (DEC-067)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2022 (General Aptitude Q1–Q10 and Computer Science Q1–Q55 / Official Q11–Q65) against the official GATE 2022 answer key (IIT Kharagpur) as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently to persistent `go:<id>` question UIDs and canonical `exam_uid` keys (`cse:2022:set1:ga:q1`–`q10` and `cse:2022:set1:main:q1`–`q55`).
    - 61 questions were already matching and preserved completely unchanged (zero churn).
    - 4 questions had discrepancies and were corrected; 1 additional NAT question was hardened with explicit range tolerances.
  - *Questions Corrected*:
    1. **GA Q5 (`go:371501`, `cse:2022:set1:ga:q5` / official Q5)**: Palindrome tile combinations visual options (A, B, C, D). Incorrectly classified as NAT with value `3`. Converted to **MCQ Option B** (`tolerance: null`).
    2. **CS Q42 (`go:371894`, `cse:2022:set1:main:q42` / official Q52)**: Properties of adjacency matrix $A$ of simple undirected graph. Stored as single-choice MCQ. Converted to **MSQ `["A"]`** (`tolerance: null`).
    3. **CS Q48 (`go:371888`, `cse:2022:set1:main:q48` / official Q58)**: Directed spanning trees rooted at vertex 5 in lower-triangular directed graph ($1 \times 2 \times 3 \times 4 = 24$). Stored value was legacy 9. Corrected to **NAT `24`** (`tolerance: { abs: 0.01 }`).
    4. **CS Q51 (`go:371885`, `cse:2022:set1:main:q51` / official Q61)**: Numerical question with official accepted range `[1.42, 1.45]`. Stored `1.435 +/- 0.015` failed lower boundary `1.42` due to floating point subtraction. Hardened to explicit NAT range **`tolerance: { lower: 1.42, upper: 1.45, abs: 0.015 }`**.
    5. **CS Q49 (`go:371887`, `cse:2022:set1:main:q49` / official Q59)**: Numerical question with official accepted range `[7.07, 7.09]`. Hardened to explicit NAT range **`tolerance: { lower: 7.07, upper: 7.09, abs: 0.01 }`**.
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2022-s0.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js`.
  - *Verification*: All 634 unit tests passing (76 test files), `npm run qa:validate-public-parity` clean (all 3,549 counts agree), `npm run typecheck` clean (0 errors), 65/65 questions verified against official key with 0 discrepancies.

- **GATE CSE Canonical Paper Reconstruction & Dataset-Wide Additional GA Pool Architecture (DEC-066)**:
  - *Context*: Comprehensive audit and structural migration of all 3,549 questions across the GateQA question bank to eliminate fake CSE Set 1 / Set 2 classifications, restore the canonical single-paper GATE CSE 2023 dataset (65 questions), and isolate 275 General Aptitude questions borrowed from other GATE branches into dedicated year-level "Additional Questions" pools with preserved provenance.
  - *Root Cause Analysis*:
    - In 2020–2024, 275 non-CSE GA questions (from Civil, Mechanical, Electrical, Chemical, ECE, IN, DS&AI) were tagged with branch set tokens (e.g. `gate-2023-set1` from Civil Set 1).
    - `parseYearSet` in `scripts/build-public-artifacts.mjs` matched these branch sets as CSE sets, producing fake CSE Set 1 / Set 2 entries in single-paper years (2020, 2022, 2023) and contaminating official sets in multi-set years (2021, 2024).
    - In addition, 130 questions belonging to 2025 had inherited stale year strings (such as `gatecse-2023` and `gatecse-2022`), artificially inflating older years.
  - *Canonical GATE CSE 2023 Paper Restored*:
    - Single paper / single session: represented as `2023`, `yearSetKey: "2023-s0"`, `yearSetIdentity: "cse:2023:set-0"`.
    - Exactly 65 official questions: Q1–Q10 GA (`official_question_number: 1..10`, title `GATE CSE 2023 | GA Question: 1..10`) and Q11–Q65 CS (`official_question_number: 11..65`, title `GATE CSE 2023 | Question: 11..65`).
    - Section-relative CS numbers (1..55) converted to official paper numbering (11..65) in UI titles and metadata, while preserving 1-mark and 2-mark scoring in `parseMockSectionPosition`.
    - Answer key corrections:
      - GA Q2 (`go:399254`): Updated to `type: "MTA"`, `answer: "MTA"` (IIT Kanpur final key Marks to All).
      - CS Q50 (`go:399261`): Tolerance updated to explicit range `[2.374, 2.376]` (`answer: 2.375, tolerance: { lower: 2.374, upper: 2.376, abs: 0.001 }`).
      - CS Q17 (`go:399294`): Verified correct as `["C", "D"]` (Priority Scheduling and Shortest Job First).
  - *Dataset-Wide Additional GA Pool Architecture*:
    - All 275 non-CSE GA questions separated from official papers and merged into year-level pools: `2020 Additional Questions` (62), `2021 Additional Questions` (46), `2022 Additional Questions` (55), `2023 Additional Questions` (64), `2024 Additional Questions` (48).
    - Question metadata schema enriched with `paper_scope` (`"official_cse"` vs `"additional_ga"`), `source_branch` (Civil, Mechanical, etc.), `source_session` (`"Set 1"`, `"Set 2"`, or `null`), `cse_set` (strictly `null` for additional questions and single-paper years).
    - Eliminated obsolete detail shards: `2020-s1.json`, `2020-s2.json`, `2021-s0.json`, `2022-s1.json`, `2022-s2.json`, `2023-s1.json`, `2023-s2.json`, `2024-s0.json`.
    - Created dedicated additional detail shards: `2020-additional.json`, `2021-additional.json`, `2022-additional.json`, `2023-additional.json`, `2024-additional.json`.
  - *UI & Filter Experience*:
    - `YearFilter.tsx`: Displays distinct amber badge `GA • Additional` with tooltip `"GA questions from other GATE papers"`.
    - `ActiveFilterChips.tsx`: Displays `Additional` badge on active filter chip.
    - `FilterContext.tsx`: Manifest yearSets sorted with official papers first followed by additional questions. Selecting an official set never returns additional questions, and selecting additional questions never returns official CSE questions.
  - *Verification & Parity*:
    - 76 test files passed, 628 unit tests passed (100% green).
    - `npm run qa:validate-data` clean (parity intact, zero orphans).
    - `npm run typecheck` clean (0 TypeScript errors).
    - `npm run build` and `npm run qa:validate-bundle-budget` clean.
    - Zero question UIDs lost; all user progress/bookmarks/notes preserved.

- **GATE CSE 2024 Session 1 & Session 2 Comprehensive Answer Key Audit & Data Corrections (DEC-065)**:
  - *Context*: Complete audit of all 130 questions across both sessions of GATE CSE 2024 (Session 1 Q1–Q65 and Session 2 Q1–Q65) against the official GATE 2024 CSE Final Answer Keys as the authoritative source of truth.
  - *Audit Results*:
    - 130 / 130 questions mapped 100% confidently to existing persistent `go:<id>` question UIDs and canonical `exam_uid` keys (`cse:2024:set1:ga:q1`–`q10`, `cse:2024:set1:main:q1`–`q55`, `cse:2024:set2:ga:q1`–`q10`, `cse:2024:set2:main:q1`–`q55`).
    - 121 questions were already correct and preserved completely unchanged (zero churn).
    - 9 questions required correction to achieve 100% parity with official GATE 2024 CSE answer keys.
  - *Questions Corrected*:
    1. **Session 1 CS Q14 (`go:422828`, `cse:2024:set1:main:q14` / official Q24)**: Threads assertions question ("Which of the following statements about threads is/are TRUE?"). Stored as single-choice MCQ Option D. Corrected to **MSQ `["D"]`** (`tolerance: null`).
    2. **Session 1 CS Q35 (`go:422807`, `cse:2024:set1:main:q35` / official Q45)**: DFS & BFS spanning tree assertions ("Which of the following statements is/are TRUE for every such graph G and tree T?"). Stored as single-choice MCQ Option C. Corrected to **MSQ `["C"]`** (`tolerance: null`).
    3. **Session 1 CS Q39 (`go:422803`, `cse:2024:set1:main:q39` / official Q49)**: System of linear equations $Ax=0$ assertions ("Which of the following statements is/are TRUE about the system of linear equations Ax=0?"). Stored as single-choice MCQ Option A. Corrected to **MSQ `["A"]`** (`tolerance: null`).
    4. **Session 1 CS Q53 (`go:422789`, `cse:2024:set1:main:q53` / official Q63)**: Computer Networks / Probability NAT. Official accepted range is `0.370 to 0.380`. Stored answer `0.375 +/- 0.01` had range `[0.365, 0.385]`, accepting invalid answers outside `[0.370, 0.380]`. Corrected to NAT range `[0.370, 0.380]` (`answer: 0.375, tolerance: { lower: 0.37, upper: 0.38, abs: 0.005 }`).
    5. **Session 2 CS Q13 (`go:422884`, `cse:2024:set2:main:q13` / official Q23)**: Destination IP and MAC addresses over TCP connection ("Which of the following statements is/are TRUE...?"). Stored as single-choice MCQ Option B. Corrected to **MSQ `["B"]`** (`tolerance: null`).
    6. **Session 2 CS Q41 (`go:422856`, `cse:2024:set2:main:q41` / official Q51)**: Spanning tree even weight graph assertions ("Which of the following statements is/are TRUE for every such graph G?"). Stored as single-choice MCQ Option D. Corrected to **MSQ `["D"]`** (`tolerance: null`).
    7. **Session 2 CS Q43 (`go:422854`, `cse:2024:set2:main:q43` / official Q53)**: Disk random access time NAT. Official accepted range is `29.50 to 30.50`. Stored answer `30.06 +/- 0.01` rejected valid candidate answers like `30.00`. Corrected to NAT range `[29.50, 30.50]` (`answer: 30.0, tolerance: { lower: 29.5, upper: 30.5, abs: 0.5 }`).
    8. **Session 2 CS Q48 (`go:422849`, `cse:2024:set2:main:q48` / official Q58)**: Pipelined execution unit speedup NAT. Official accepted range is `2.9 to 3.1`. Stored answer `3 +/- 0.01` rejected valid boundary entries `2.9` and `3.1`. Corrected to NAT range `[2.9, 3.1]` (`answer: 3.0, tolerance: { lower: 2.9, upper: 3.1, abs: 0.1 }`).
    9. **Session 2 CS Q49 (`go:422848`, `cse:2024:set2:main:q49` / official Q59)**: Number of distinct minimum-weight spanning trees. Official key is `9` (`min: 9, max: 9`). Stored answer was legacy typo `5`. Corrected to **`9`** (`tolerance: { abs: 0.01 }`).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shards `public/question-detail-shards/2024-s1.json`, `2024-s2.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`.
  - *Verification*: All 625 unit tests passing (76 test files), `npm run qa:validate-data` clean (parity intact), `npm run typecheck` clean (0 errors), 130/130 questions verified against official keys with 0 discrepancies.

- **Dead Code Elimination, Orphaned Component Pruning & CSS Monolith Cleanup (DEC-064)**:
  - *Context*: Implemented the verified Dead Code Removal Plan (`plan/DEAD_CODE_REMOVAL_PLAN.md`) across the codebase to safely remove orphaned UI components, dead utility CSS overrides, and obsolete one-off scripts.
  - *Changes Executed*:
    1. **Orphaned Component Deletions**: Safely deleted 6 unreferenced React component files: `src/components/Tracker/TrackerSubjectAccordion.jsx`, `src/components/Tracker/TrackerTopicCard.jsx`, `src/components/Tracker/TrackerNotesDrawer.jsx`, `src/components/Auth/GuestDataPrompt.jsx`, `src/components/Loaders/QuestionBankSummaryLoader.jsx`, and `src/components/Header/Header.jsx` (along with removing the empty `src/components/Header/` directory).
    2. **Obsolete Root Scripts Removal**: Deleted 3 obsolete ad-hoc utility scripts from root `scripts/`: `scripts/fix-865.js`, `scripts/apply-edits.cjs`, and `scripts/refactor-ui.cjs`.
    3. **CSS Monolith Cleanup (`src/index.css`)**:
       - Removed light and dark styles for `.guest-data-prompt` (lines 4340–4392 and 4414–4419) and cleaned section header comment at line 4003.
       - Selectively pruned verified-dead dark mode utility class override selectors (including `.bg-pink-800`, `.bg-pink-900`, `.bg-teal-600`, `.bg-teal-700`, `.bg-green-100`, `.bg-red-100`, `.bg-yellow-50`, `.text-teal-600`, `.text-pink-800`, `.text-pink-900`, `.border-blue-300`, `.border-blue-600`, `.border-green-200/300/500`, `.border-yellow-200/300`, `.border-pink-800/900`, `.border-red-200`, `.ring-amber-200`, etc.) while strictly preserving all active classes (`.text-violet-900`, `.border-emerald-200`, `.hover:bg-blue-200`, form input styles, gradients, scrollbars, etc.).
       - CSS bundle size in `dist/assets/` decreased from `207.11 kB` to `203.31 kB` (3.8 kB pure dead CSS removed).
    4. **Documentation & Memory Integrity**: Updated `.agents/AGENTS.md` Key Directory Map to remove `GuestDataPrompt.jsx`.
  - *Verification*:
    - `npm run test:unit`: 76 test suites passed | 1 skipped (77 total), 607 unit tests passed | 6 skipped (613 total) — 100% green.
    - `npm run typecheck`: 0 TypeScript errors.
    - `npm run build`: Production build and 3,491 static SEO pages prerendered successfully with zero errors.
    - `npm run qa:validate-public-parity`: OK (all 3,549 counts agree).
    - `npm run qa:validate-data`: Dataset integrity and coverage clean.
    - `npm run qa:validate-bundle-budget`: Passes within budget limits.
    - `npm run test:e2e`: All 17 Playwright E2E tests pass (100% green).

- **Bundle Budget Optimization, Code-Splitting & CI Validation Fix (DEC-063)**:
  - *Context*: CI pipeline build failed at the `validate-bundle-budget` step (`npm run qa:validate-bundle-budget`) due to the landing entry chunk reaching 391.6 KB (exceeding the 300.0 KB budget limit by 91.6 KB) and landing initial JS reaching 1248.1 KB (exceeding the 1200.0 KB limit).
  - *Root Cause Analysis*:
    1. `editorialPages.js` (95.3 KB): Statically imported in `src/App.jsx` simply to iterate over route definitions. Because `App.jsx` is the root component of the entry point, all 95 KB of rich blog text and FAQs were bundled into `index.js`.
    2. `trackerTaxonomy.ts` (136.4 KB): Imported by `src/services/DaQuestionService.ts`, which is imported by `FilterContext.tsx` on the landing page, dragging in the entire 2,100-line CSE+DA taxonomy.
    3. `trackerState.ts` (35.9 KB): Imported by `src/utils/cloudSyncManager.js` (for revision summary helpers) and `src/components/Layout/AppHeader.jsx` (for `TRACKER_ANNOUNCEMENT_SEEN_KEY`).
    4. `html2canvas` (400.8 KB) & `pako` (104.3 KB): Omitted from `vendor-pdf` manual chunks in `vite.config.js`, causing Rollup to bundle them into `vendor-misc` alongside `@supabase/supabase-js`, which bloated initial JS.
  - *Architecture & Code-Splitting Fixes*:
    1. **Editorial Route Isolation**: Created `src/data/editorialRoutes.js` (1 KB) containing only `{ path, keyword }` route records for `src/App.jsx` and `GlobalNavigationDrawer.jsx`. Updated `EditorialPage.jsx` to dynamically lookup article content from `src/data/editorialPages.js` using `location.pathname`, isolating the 95 KB data file completely within the on-demand lazy chunk.
    2. **DA Taxonomy Modularization**: Extracted DA syllabus definitions into `src/data/daTaxonomy.ts` and re-exported `DA_SUBJECTS` from `src/data/trackerTaxonomy.ts` for 100% backward compatibility. Pointed `DaQuestionService.ts` to `daTaxonomy.ts`, removing `trackerTaxonomy.ts` from the landing chunk.
    3. **Revision Summary Helper Decoupling**: Extracted `summarizeRevisionEvents`, `mergeSyncedRevisionSummary`, and `TRACKER_ANNOUNCEMENT_SEEN_KEY` into `src/utils/trackerRevisionSummary.ts`. Re-exported them from `trackerState.ts` and updated `cloudSyncManager.js` and `AppHeader.jsx`.
    4. **Vite Manual Chunks Hardening**: Updated `manualChunks` in `vite.config.js` to group all PDF dependencies (`jspdf`, `html2canvas`, `pako`, `fast-png`, `css-line-break`, `text-segmentation`, `canvg`, `fflate`, `rgbcolor`, `stackblur-canvas`) into `vendor-pdf` and isolated `@supabase` into `vendor-supabase`.
  - *Results & Metrics*:
    - Landing entry chunk reduced from 391.6 KB to **220.0 KB** (80.0 KB / 26.7% headroom under 300.0 KB limit).
    - Landing initial JS reduced from 1248.1 KB to **845.5 KB** (354.5 KB / 29.5% headroom under 1200.0 KB limit).
    - `npm run qa:validate-bundle-budget` and `npm run qa:validate-landing-network` pass cleanly with zero warnings.
    - All 607 unit tests (76 test files) and all 17 Playwright E2E tests pass cleanly. `npm run typecheck` passes with 0 errors.

- **GATE CSE 2025 Set 2 Comprehensive Answer Key Audit & Data Corrections (DEC-062)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2025 Set 2 (General Aptitude Q1–Q10 and Computer Science Q1–Q55 / Official Q11–Q65) against the official GATE 2025 Set 2 answer key as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently to existing `go:<id>` question UIDs and canonical `exam_uid` keys (`cse:2025:set2:ga:q1`–`q10` and `cse:2025:set2:main:q1`–`q55`).
    - 59 questions were already correct and preserved completely unchanged (zero churn).
    - 6 questions required correction to achieve 100% parity with the official GATE 2025 Set 2 answer key.
  - *Questions Corrected*:
    1. **CS Q10 (`go:460825`, `cse:2025:set2:main:q10` / official Q20)**: Minimum number of comparisons needed to find maximum and minimum of an unordered list of $N$ integers is $\lceil 3N/2 \rceil - 2$. Stored answer was incorrectly Option B. Corrected to **MCQ Option A** (`tolerance: null`).
    2. **CS Q18 (`go:460817`, `cse:2025:set2:main:q18` / official Q28)**: ISA components ("Which of the following is/are part of an Instruction Set Architecture (ISA)..."). Stored answer was classified as MCQ Option D. Corrected to **MSQ `["D"]`** (`tolerance: null`).
    3. **CS Q27 (`go:460808`, `cse:2025:set2:main:q27` / official Q37)**: Edge weight positive constant $\alpha$ addition (Shortest path / MST). Stored answer was incorrectly MSQ `["A", "C", "D"]`. Corrected to **MCQ Option C** (`tolerance: null`) per official answer key.
    4. **CS Q35 (`go:460800`, `cse:2025:set2:main:q35` / official Q45)**: Stack PUSH/POP record structure assertions. Stored answer was classified as MCQ Option A. Corrected to **MSQ `["A"]`** (`tolerance: null`).
    5. **CS Q37 (`go:460798`, `cse:2025:set2:main:q37` / official Q47)**: Demand paging 3 frames page reference string. Stored answer was classified as MCQ Option D. Corrected to **MSQ `["D"]`** (`tolerance: null`).
    6. **CS Q43 (`go:460850`, `cse:2025:set2:main:q43` / official Q53)**: Database transactions conflict serializability ("Which of the schedule(s) is/are conflict serializable"). Stored answer was classified as MCQ Option B. Corrected to **MSQ `["B"]`** (`tolerance: null`).
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `public/question-detail-shards/2025-s2.json`, mock catalog `public/mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`.
  - *Verification*: All 607 unit tests passing (76 test files), `npm run qa:validate-data` clean (parity intact), `npm run typecheck` clean (0 errors), 65/65 Set 2 questions verified against official key.

- **Question Data Integrity & Answer Key Corrections for `go:118623`, `go:3700`, and `go:460070` (DEC-061)**:
  - *Context*: Three verified answer-key errors were identified where correct official options were evaluated as incorrect:
    1. `go:118623` (GATE CSE 2017 Set 2 Question 30, Algorithms - Recurrence Relations): Stored answer was Option A ($\Theta(\log \log n)$).
    2. `go:3700` (GATE IT 2004 Question 57 / CSE 2004, Algorithms - Recurrence Matching): Stored answer was Option C (P-III, Q-II, R-IV, S-I).
    3. `go:460070` (GATE CSE 2025 Set 1 Question 10, Algorithms - Divide & Conquer Recurrence): Stored answer was Option B ($\Theta(n 2^n)$).
  - *Mathematical & Official Derivations*:
    1. **`go:118623` (GATE CSE 2017 Set 2 Q30)**:
       - Recurrence: $T(n) = 2T(\sqrt{n}) + 1$ for $n > 2$ with $T(n) = 2$ for $0 < n \le 2$.
       - Let $n = 2^m \implies m = \log_2 n$.
       - Then $S(m) = T(2^m) = 2T(2^{m/2}) + 1 = 2S(m/2) + 1$.
       - By Master's Theorem ($a=2, b=2, m^{\log_2 2} = m^1$ vs $f(m)=1=O(m^0)$), $S(m) = \Theta(m)$.
       - Substituting back $m = \log_2 n$ yields $T(n) = \Theta(\log n)$, which uniquely matches **Option B** ($\Theta(\log n)$).
    2. **`go:3700` (GATE IT 2004 Q57)**:
       - P. Binary Search: $T(n) = T(n/2) + 1 \implies \text{IV}$.
       - Q. Merge Sort: $T(n) = 2T(n/2) + cn \implies \text{III}$.
       - R. Quick Sort (partition at index $k$): $T(n) = T(n-k) + T(k) + cn \implies \text{I}$.
       - S. Tower of Hanoi: $T(n) = 2T(n-1) + 1 \implies \text{II}$.
       - The unique matching is $\text{P-IV, Q-III, R-I, S-II}$, which matches **Option B**.
    3. **`go:460070` (GATE CSE 2025 Set 1 Q10)**:
       - Recurrence: $T(n) = 2T(n-1) + n 2^n$ for $n > 0$, with $T(0) = 1$.
       - Divide by $2^n$: $\frac{T(n)}{2^n} = \frac{T(n-1)}{2^{n-1}} + n$.
       - Defining $S(n) = \frac{T(n)}{2^n}$ gives $S(n) = S(n-1) + n$, with $S(0) = 1$.
       - Telescoping yields $S(n) = 1 + \sum_{i=1}^n i = 1 + \frac{n(n+1)}{2} = \Theta(n^2)$.
       - Thus, $T(n) = 2^n \cdot S(n) = \Theta(n^2 2^n)$, which uniquely matches **Option A**.
  - *Resolution*:
    - Corrected answers across authoritative source patch `data/answers/manual-answers-patch-v1.json` and `data/answers/answers_by_question_uid_v1.json`.
    - Synchronized across runtime answer indices `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json` (`cse:2017:set2:main:q30` $\rightarrow$ B, `cse:2025:set1:main:q10` $\rightarrow$ A), and `public/data/answers/answers_master_v1.json` (`v2:1.27.28` $\rightarrow$ B, `v2:1.27.34` $\rightarrow$ B, `v2:1.27.33` $\rightarrow$ A).
    - Synchronized master question bank `public/questions-with-answers.json`.
    - Regenerated detail shards `public/question-detail-shards/2017-s2.json`, `2004-s0.json`, and `2025-s1.json`, as well as `public/mock_catalog_v1.json`.
    - Added comprehensive regression tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`.
  - *Verification*: All 586 unit tests passing (76 test files), `npm run qa:validate-data` clean, `npm run typecheck` clean (0 errors), confirmed no stale keys remain.

- **GATE CSE 2025 Set 1 Comprehensive Answer Key Audit & Data Corrections (DEC-060)**:
  - *Context*: Complete audit of all 65 questions of GATE CSE 2025 Set 1 (General Aptitude Q1–Q10 and Computer Science Q1–Q55 / Official Q11–Q65) against the official GATE 2025 Set 1 answer key as the authoritative source of truth.
  - *Audit Results*:
    - 65 / 65 questions mapped 100% confidently to existing `go:<id>` question UIDs and canonical `exam_uid` keys.
    - 59 questions were already correct and preserved completely unchanged (zero churn).
    - 6 questions required correction to achieve 100% parity with the official GATE 2025 Set 1 answer key.
  - *Questions Corrected*:
    1. **GA Q9 (`go:460092`, `cse:2025:set1:ga:q9`)**: Paper folding pattern question with 4 options (A, B, C, D) was incorrectly stored as NAT `1065`. Corrected to **MCQ Option A** (`tolerance: null`).
    2. **CS Q39 (`go:460041`, `cse:2025:set1:main:q39` / official Q49)**: Functions on set $A=\{0, 1, 2, 3, \ldots\}$ composition question was classified as single-choice MCQ. Corrected to **MSQ `["B"]`** per official key.
    3. **CS Q55 (`go:460025`, `cse:2025:set1:main:q55` / official Q65)**: Double hashing scheme question official accepted range is `10 to 11`. Stored answer had collapsed this to single integer `10`, rejecting valid candidate entries like `11` or `10.5`. Corrected to NAT range `[10, 11]` (`answer: 10.5, tolerance: { lower: 10, upper: 11, abs: 0.5 }`).
    4. **CS Q48 (`go:460032`, `cse:2025:set1:main:q48` / official Q58)**: Probability question official accepted range is `0.300 to 0.302`. Stored answer `0.302 +/- 0.001` accepted `[0.301, 0.303]`, rejecting valid lower boundary `0.300`. Corrected to NAT range `[0.300, 0.302]` (`answer: 0.301, tolerance: { lower: 0.300, upper: 0.302, abs: 0.001 }`).
    5. **CS Q22 (`go:460058`, `cse:2025:set1:main:q22` / official Q32)**: Probability of symmetric matrix official accepted range is `0.49 to 0.51`. Due to IEEE 754 float subtraction (`0.5 - 0.49 = 0.010000000000000009 > 0.01`), boundary values 0.49 and 0.51 failed evaluation. Corrected to explicit NAT range `tolerance: { lower: 0.49, upper: 0.51, abs: 0.01 }`.
    6. **CS Q46 (`go:460034`, `cse:2025:set1:main:q46` / official Q56)**: Memory latency probability official accepted range is `0.949 to 0.952`. Boundary value `0.952` failed evaluation due to floating point subtraction. Corrected to explicit NAT range `tolerance: { lower: 0.949, upper: 0.952, abs: 0.0015 }`.
  - *Affected Files*:
    - Authoritative source patch: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`.
    - Public answer indices: `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/data/answers/answers_master_v1.json`.
    - Question bank & shards: `public/questions-with-answers.json`, detail shard `2025-s1.json`, mock catalog `mock_catalog_v1.json`.
    - Automated tests: `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`.
  - *Verification*: All 595 unit tests passing (76 test files), `npm run qa:validate-data` clean (parity intact), `npm run typecheck` clean (0 errors), 65/65 questions verified against official key.

- **Question Data Integrity & Answer Key Correction for `go:460047` (DEC-058)**:
  - *Context*: Question `go:460047` (GATE CSE 2025 Set 1 Question 33, Algorithms - Breadth First Search & Graph Diameter) was incorrectly evaluating valid Option C ("The height of T is at least 15.") as incorrect because legacy answer data stored Option B ("The height of T is exactly 30.").
  - *Mathematical & Official Derivation*:
    - The graph $G(V, E)$ is undirected and unweighted with 100 vertices, and $\max_{u \neq v} d(u, v) = 30$ (diameter = 30).
    - For any vertex $r \in V$, the height of a BFS tree $T$ rooted at $r$ equals the eccentricity of $r$: $h(T) = \max_{v \in V} d(r, v) = \text{eccentricity}(r)$.
    - For any connected graph, $\text{eccentricity}(r) \ge \text{radius}(G) \ge \lceil \text{diameter}(G) / 2 \rceil = \lceil 30 / 2 \rceil = 15$.
    - Therefore, every BFS tree $T$ has height at least 15 ($h(T) \ge 15$) for every choice of root vertex $r$ in every such graph $G$.
    - A BFS tree rooted at the graph's center may have height 15 (disproving Option B "exactly 30" and Option D "at least 30"), and a BFS tree rooted at an extreme vertex has height 30 (disproving Option A "exactly 15").
    - Hence, **Option C** ("The height of $T$ is at least 15.") is the uniquely correct statement for every such graph $G$.
  - *Resolution*:
    - Updated answer key from Option B to Option C in authoritative patch registry `data/answers/manual-answers-patch-v1.json` and base question answer map `data/answers/answers_by_question_uid_v1.json`.
    - Synchronized across runtime answer indices `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json` (`cse:2025:set1:main:q33`), and `public/data/answers/answers_master_v1.json` (`v2:1.30.6`).
    - Updated question bank `public/questions-with-answers.json` (`answer_meta.answer: "C"`).
    - Regenerated static question detail shard `public/question-detail-shards/2025-s1.json`.
    - Added shard timestamp preservation in `scripts/build-public-artifacts.mjs` to eliminate git churn on unchanged shards.
    - Added automated unit regression tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`.
  - *Verification*: All 580 unit tests passing (76 suites), `npm run qa:validate-data` clean, `npm run typecheck` clean (0 errors), end-to-end evaluation confirmed Option C as correct and Options A/B/D as incorrect.

- **Supabase Database Linter Resolution & Trigger Function Search Path Pinned (DEC-057)**:
  - *Context*: Supabase Database Advisor flagged security advisory `function_search_path_mutable` (Rule `0011_function_search_path_mutable`) on trigger function `public.handle_user_tracker_updated_at`.
  - *Root Cause Analysis*: PostgreSQL trigger functions that do not explicitly define `SET search_path` default to the session-level `search_path` of whoever triggers the operation. If a malicious session alters `search_path`, unqualified functions or operators could be hijacked. In `supabase/migrations/20260901_user_tracker.sql`, `handle_user_tracker_updated_at` was created without `SET search_path = ''`.
  - *Resolution*:
    1. **Function Hardening (`supabase/migrations/20260901_user_tracker.sql`)**: Updated `public.handle_user_tracker_updated_at()` to declare `SET search_path = ''` and fully qualify calls using `pg_catalog.timezone('utc'::text, pg_catalog.now())`.
    2. **Database Application**: Executed hardened DDL in live Supabase SQL Editor and verified parameter attachment (`proconfig = ["search_path=\"\""]` in `pg_proc`).
    3. **Documentation Alignment**: Documented policies, grants, and database function security hardening in `docs/DATABASE.md`.
  - *Verification*: Verified `proconfig` contains `search_path=""` in `pg_proc`, Supabase Database Advisor warning is eliminated, and all 578 unit tests pass across 76 test suites.

- **Mock Test Custom Builder 3-Level Taxonomy Hierarchy & Crash Resolution (DEC-056)**:
  - *Context*: User reported: (1) Clicking on any subject checkbox in Custom Mock Builder led to the Error Boundary crash ("Something went wrong"); (2) Subjects lacked topic grouping and DA subjects displayed 0 subtopics; (3) Requested strict 3-level hierarchy: `Subject: Topics: Subtopics` mirroring the syllabus and filters section.
  - *Root Cause Analysis*:
    1. **Setup Crash on Subject Click**: `MockTestShell.jsx` (line 769) referenced `LEGACY_SUBJECT_SLUG` during candidate question pool filtering when a subject was selected. However, `LEGACY_SUBJECT_SLUG` was only defined in `MockTestSetup.jsx`, throwing `ReferenceError: LEGACY_SUBJECT_SLUG is not defined` on any subject checkbox toggle.
    2. **Missing Level 2 Topics**: Custom Builder rendered an unorganized flat list of subtopics directly under the subject rather than following the official GATE syllabus taxonomy (`Subject` -> `Topics` -> `Subtopics`).
    3. **Missing DA Subtopics**: `DaQuestionService.ts` initialized `structuredSubtopics` as an empty object `{}`, causing all Data Science & AI subjects to report 0 subtopics.
  - *Resolution*:
    1. **Crash Resolution (`src/components/MockTest/MockTestShell.jsx`)**:
       - Defined `const LEGACY_SUBJECT_SLUG = "legacy-other";` in `MockTestShell.jsx`.
       - Enhanced candidate question filtering to match questions across subject, topic, and subtopic tags via `getSubjectAllSubtopicSlugs`.
    2. **Taxonomy Hierarchy Engine (`src/utils/mockTaxonomyHierarchy.js`)**:
       - Created bridge connecting canonical syllabus nodes from `src/data/trackerTaxonomy.ts` (`CSE_SUBJECTS` and `DA_SUBJECTS`) with live `FilterContext` subtopics.
       - Implemented `getSubjectHierarchy(subject, rawStructuredSubtopics)` returning structured `TopicNode[]` with nested `SubtopicNode[]` for CSE, DA, Discrete Mathematics, and legacy topics.
       - Added comprehensive test suite in `src/utils/mockTaxonomyHierarchy.test.js` (7 unit tests).
    3. **DA Subtopic Population (`src/services/DaQuestionService.ts`)**:
       - Populated `structuredSubtopics` from `TAXONOMY_DA_SUBJECTS`, ensuring Machine Learning, AI, Probability & Statistics, etc. provide their complete canonical subtopic lists.
    4. **3-Level Hierarchy UI Component (`src/components/MockTest/MockTestSetup.jsx`)**:
       - Built `SubjectHierarchyCard` with 3 distinct levels:
         - **Level 1 (Subject)**: Checkbox, status badge, "Topics (N)" expand button, "Select All" / "Clear All" bulk toggle.
         - **Level 2 (Topics)**: Indeterminate/checked topic checkbox (bulk-toggles all subtopics in topic), topic title with subtopic count, "Subtopics (N)" expand button, "Expand/Collapse all" shortcut.
         - **Level 3 (Subtopics)**: Individual subtopic checkboxes with auto-selection of parent subject.
       - Styled with track-specific tones: Sky (`sky`) for CSE, Indigo (`indigo`) for DA, and Emerald (`emerald`) for Aptitude.
  - *Verification*:
    - Unit tests: All 79 tests in `src/components/MockTest/` and 7 tests in `src/utils/mockTaxonomyHierarchy.test.js` pass.
    - TypeScript: 0 errors via `npm run typecheck`.
    - Browser Subagent: Verified on `http://localhost:5173/mock?stage=setup` that clicking subject checkboxes operates without errors, Level 2 Topics and Level 3 Subtopics expand smoothly, and DA topics/subtopics render accurately.


- **Custom Mock Builder Subject Subtopics & Canonical Taxonomy Resolution (DEC-055)**:
  - *Context*: User reported that in the Custom Builder setup under "Computer Science / CSE", the 12 subjects (Algorithms, Compiler Design, Databases, Discrete Mathematics, Operating System, Programming in C, CO & Architecture, Computer Networks, Digital Logic, Engineering Mathematics, Programming and DS, Theory of Computation) showed only checkboxes with no subtopics or topics lists.
  - *Root Cause Analysis*:
    1. **Subject Slug Mismatch**: `MockTestShell.jsx` generated mock subject options using ad-hoc slugification `slugifyMockFilterToken(question.subjectSlug || question.subject)`, producing non-canonical slugs like `operating-system`, `databases`, `computer-networks`, `co-and-architecture`, `compiler-design`, `discrete-mathematics`, `engineering-mathematics`, `programming-and-ds`, `programming-in-c`, `theory-of-computation`. Meanwhile, `QuestionService.getStructuredTags()` and `FilterContext` keyed subtopics by canonical taxonomy slugs (`os`, `dbms`, `cn`, `coa`, `compiler`, `discrete-math`, `engg-math`, `prog-ds`, `prog-c`, `toc`). Thus, `structuredSubtopics[subject.slug]` returned `undefined` for 10 out of 12 CSE subjects.
    2. **Orphaned Subtopics Purge**: In `MockTestShell.jsx`, `patchSetupState` purged subtopics against `allSubtopicsBySubject[subjectSlug]`. Because non-canonical slugs had no entries, any selected subtopics were instantly cleared.
    3. **Missing Auto-Expansion**: Subtopics were gated behind a single string `expandedSubjectSlug` that was not set when toggling subject checkboxes, unlike the Filters section (`TopicFilter.tsx`).
  - *Resolution*:
    1. **Canonical Taxonomy Normalization (`src/utils/mockTest.js`)**: Added `CANONICAL_CSE_SUBJECT_SLUG_MAP` to map all aliases to canonical taxonomy slugs (`os`, `dbms`, `cn`, `coa`, etc.), and updated `normalizeMockSubjectKey` and `getMockQuestionSubjectKey`.
    2. **Shell Synchronization (`src/components/MockTest/MockTestShell.jsx`)**: Added `CANONICAL_CSE_SUBJECT_LABELS`, updated `buildSubjectOptions` to pre-populate from `structuredTags.subjects`, and normalized subject keys in pool filtering, subtopic narrowing, and orphaned subtopic validation.
    3. **Custom Builder UI & Interaction (`src/components/MockTest/MockTestSetup.jsx`)**:
       - Added resilient `getSubtopicsForSubject` with canonical resolution and fallback to `TOPIC_HIERARCHY` from `SubjectTaxonomy.ts`.
       - Maintained `expandedSubjectSlugs` state (`Set<string>`) allowing independent multi-subject expansion.
       - Checking a subject auto-expands its subtopics matching `TopicFilter.tsx`.
       - Provided dedicated `Subtopics (N)` / `Hide` buttons for all subjects with subtopics, allowing users to inspect and select subtopics before or after selecting the subject.
       - Provided `Select All` / `Clear All` bulk toggle buttons for subtopics.
       - Checking a subtopic auto-selects the parent subject.
  - *Verification*:
    - Unit tests: Added tests in `MockTestTwoSection.test.jsx`; all 571 unit tests across 75 test files passed.
    - TypeScript: 0 errors via `npm run typecheck`.
    - Browser Subagent: Visual verification confirmed all 12 CSE subjects display `Subtopics (N)` buttons, expand properly with subtopic checkboxes, and display `Hide` and `Select All` buttons.

- **Custom Mock Builder Discipline Toggles & Two-Section Invariant Architecture (DEC-054)**:
  - *Context*: User requested: (1) Modernized Custom Mock Builder UI with dedicated ON/OFF toggles for GATE Computer Science (CSE) and GATE Data Science & AI (DA), including quick "Select All" / "Clear All" shortcuts; (2) In Mock Test UI, strictly two sections: Section 1 General Aptitude (GA), Section 2 Core Discipline (CS - labeled "Computer Science and Information Technology" for CSE, or "Data Science and AI" for DA); (3) Do not put technical subject questions into General Aptitude; (4) If 0 General Aptitude questions after custom selection (e.g. GA toggle turned off or pure subject test selected), make the GA section tab disabled and unpressable.
  - *Root Cause Analysis*:
    1. **Mislabeled Core Section Tab**: `MockTestHeader` and `MockTestResults` relied on `csQuestions.some(isDaQuestion)`. When Custom Builder ran on "All subjects" or mixed pools, a single DA question in the overall pool or candidate list flipped `isDa` to `true`, causing pure CSE tests (e.g. Binary Tree traversals) to be labeled as "Data Science and AI".
    2. **Missing Granular Track Controls**: Custom Builder lacked dedicated ON/OFF toggles for CSE and DA tracks and an explicit toggle for General Aptitude, making it difficult to generate pure single-subject tests or pure CSE/DA tests without General Aptitude.
    3. **GA Section Leakage & Active Empty Tab**: When no GA questions were selected, the GA tab remained active in the mock header despite having 0 questions, causing disorientation.
  - *Resolution*:
    1. **Track Toggles & Custom Builder UI (`MockTestSetup.jsx`)**:
       - Built accessible `ToggleSwitch` component with distinct color accents (`sky-600` for CSE, `indigo-600` for DA, `emerald-600` for GA).
       - Added **GATE Computer Science (CSE & IT)** card (Sky theme) with ON/OFF toggle, status badges, "Select All" / "Clear All" buttons, and subject accordions.
       - Added **GATE Data Science & AI (DA)** card (Indigo theme) with ON/OFF toggle, status badges, "Select All" / "Clear All" buttons, and subject accordions.
       - Added **General Aptitude (GA)** card (Emerald theme) with ON/OFF toggle and optional aptitude category narrowing.
    2. **Pool Filtering & Strict Section Classification (`MockTestShell.jsx`)**:
       - Implemented `isTrueGaQuestion(question, questionMeta)` to strictly prevent technical subject questions (Algorithms, OS, DBMS, Engineering Math, Machine Learning, AI, etc.) from ever being classified into GA.
       - Enhanced `splitByCatalogSection` to cleanly separate true GA questions from core discipline questions.
       - Enforced `enabledTracks` and `includeGeneralAptitude` across custom pool scoping.
       - Refined `isDa` determination in `handleStartExam` based on active track and question majority (`daCount >= cseCount`).
       - Set initial exam section `startSection = hydratedGaQuestions.length > 0 ? "GA" : "CS"`.
    3. **Two-Section Invariant & Unpressable GA Tab (`MockTestHeader.jsx`)**:
       - Strictly renders two section tabs: Section 1 (GA) and Section 2 (CS & IT / DA & AI).
       - When `sectionQuestionUids.GA.length === 0`, GA tab button is `disabled={true}`, styled with `opacity-40 cursor-not-allowed pointer-events-none select-none`, and has tooltip `"No General Aptitude questions in this mock test"`.
       - Title reflects `coreSectionFullName` ("Computer Science and Information Technology" or "Data Science and AI").
    4. **Results Alignment (`MockTestResults.jsx`)**:
       - Cleaned up DA detection in results to align with `attemptMeta.isDa` and `attemptMeta.track`.
  - *Verification*:
    - Unit tests: Added `MockTestTwoSection.test.jsx` (5/5 tests passing); all 567 unit tests across 75 test files passing.
    - Typecheck: 0 errors via `tsc -p tsconfig.json --noEmit`.
    - Browser Subagent: Verified Custom Builder track toggles, turning GA OFF, starting 15-question exam, and confirming that the GA tab is disabled/unpressable and Section 2 displays "Computer Science and Information Technology".

- **GateOverflow-Style Code Block, C Syntax Auto-Repair & Typography Alignment (DEC-053)**:
  - *Context*: User reported for question `go:422833` (GATE CSE 2024 Set 1 Q9, Programming in C): *"Ques can not be interpreted what the code is exactly missing parenthesis... in this code snippet FX IS FUNCTION BUT ITS PARANTHESIS IS NOT VISIBLE FX() . IMAGE OF GATEQA AND ORIGINAL QUESTION ATTACHED"*. The user also noted that an earlier data fix attempted on 2026-09-04 did not appear on `https://gateqa.in`. Subsequently requested aligning code block styling with GateOverflow, removing artificial IDE decorations, preserving uniform text colors, increasing code font size to equal text (`16px`), refining text contrast (`#1e293b`), and properly rendering `<strong>` tags as bold rather than raw HTML.
  - *Root Cause Analysis*:
    1. **Deployment Pipeline Failure**: Commit `7540f23b74` (2026-09-04) updated question data, but GitHub Actions CI run `33873287323` failed during `npm run test:e2e` because the `TrackerAnnouncementModal` overlay intercepted clicks and preview server worker contention caused 15s assertion timeouts. Because CI failed, GitHub Pages deployment was skipped, leaving the live site serving outdated shards from 2026-09-02.
    2. **Unstyled Code & Literal HTML Tags**: `<pre>` blocks lacked GateOverflow styling. When code was escaped, HTML tags inside questions (such as `<strong>z = **ppz</strong>` in `go:483`) were converted into literal `&lt;strong&gt;` text rather than rendering as bold.
    3. **Syntax Loss in Question Bank**: In `go:422833`, `go:422834`, and `go:483`, scraper and OCR artifacts stripped parentheses from function signatures (`void fX ;`, `int main {`, `void main\n{`, `getchar`).
  - *Resolution*:
    1. **Code Snippet Engine (`src/utils/codeSnippet.js`)**:
       - Built `formatCodeSnippets(html)`: wraps code into `<pre class="gateqa-code-block prettyprint" data-lang="${lang}"><code>`. Protects intentional inline markup (`<strong>`, `<b>`, `<em>`, `<span style="...">`) so corrections and fill-in-the-blank blanks render as bold/underlined instead of literal text.
       - Built `normalizeCodeText(code)`: restores missing parentheses for `void fX();`, `int main() {`, `void main()`, `getchar()`, and `!=`.
    2. **GateOverflow-Style Styling & Typography (`src/index.css`)**:
       - Replaced artificial IDE traffic lights with clean, authentic GateOverflow code container with rounded borders (`0.5rem`) and natural multi-line indentation.
       - Code font size set to `1rem` (`16px`), matching the question body font size with `line-height: 1.65`.
       - Enforced `color: inherit !important;` so code snippet text matches the exact color of surrounding question text.
       - Refined `:root` text token to `--color-text: #1e293b` (balanced dark slate-800 between grey and black) and updated `Question.jsx` and `MockTestQuestion.jsx` to use `text-[color:var(--color-text)]`.
       - In Dark Mode, container uses `#161b22` with `#30363d` border and `#f0f6fc` text.
    3. **DOMPurify Sanitization**:
       - Configured `ADD_ATTR: ["data-lang", "style"]` in `Question.jsx` and `MockTestQuestion.jsx`.
    4. **CI/E2E Hardening**:
       - Suppressed `TrackerAnnouncementModal` backdrop in `beforeEach` in `mock-test-flow.spec.js`, `practice-flow.spec.js`, and `a11y.axe.spec.js`.
       - Raised navigation timeouts to 30s/60s and configured `workers: 1` in `playwright.config.cjs`.
  - *Verification*:
    - Unit tests: 12/12 passing in `codeSnippet.test.js`; 565/565 unit tests passing across 74 suites.
    - Typecheck: 0 errors via `tsc --noEmit`.
    - Production build: 1561 modules bundled, 3491 static SEO pages prerendered.
    - Verified on `go:422833` and `go:483` in both Light and Dark modes.


- **Question Data Integrity, Type Conversion & Defective Question Repair (DEC-052)**:
  - *Context*: Batch verification and repair across five GATE questions (`go:460062`, `go:460040`, `go:422866`, `go:3319`, `go:422833`):
  - *`go:460062` (GATE CSE 2025 Set 1 Q18 - Theory of Computation)*:
    - *Problem*: Tagged as MCQ, but is an authentic Multiple Select Question (MSQ) ("Which of the following statement(s) is/are FALSE?").
    - *Resolution*: Converted type from `MCQ` to `MSQ`. Preserved question text and options verbatim. Kept correct answer as Option D, formatted as array `["D"]`.
    - *Affected files*: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, detail shard `2025-s1.json`, and `public/mock_catalog_v1.json` (1 mark, 0 negative marks).
  - *`go:460040` (GATE CSE 2025 Set 1 Q40 - Theory of Computation)*:
    - *Problem*: Tagged as MCQ, but is an MSQ ("Identify which of the following language(s) is/are accepted by the given DFA").
    - *Resolution*: Converted type from `MCQ` to `MSQ`. Preserved question text, DFA image, and options verbatim. Kept correct answer as Option C, formatted as array `["C"]`.
    - *Affected files*: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_master_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, detail shard `2025-s1.json`, and `public/mock_catalog_v1.json` (2 marks, 0 negative marks).
  - *`go:422866` (GATE CSE 2024 Set 2 Q31 - Theory of Computation)*:
    - *Problem*: Tagged as NAT with placeholder answer 3, but is an authentic MCQ with 4 options (A-D) asking which regular expression represents the language accepted by the 5-state NFA with epsilon-transitions.
    - *Resolution*: Converted type from `NAT` to `MCQ`. Preserved question text, NFA diagram, and 4 choices verbatim. Correct answer set to Option B ($0^{*}+\left(1+0(00)^{*}\right)(11)^{*}$), tolerance cleared to `null`.
    - *Affected files*: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_master_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, `public/questions-filtered-with-ids.json`, detail shard `2024-s2.json`, and `public/mock_catalog_v1.json` (2 marks, 0.667 negative marks).
  - *`go:3319` (GATE IT 2008 Q29 / CSE Pool - Engineering Mathematics -> Linear Algebra)*:
    - *Problem*: Question asks which assertions are correct for a square matrix M with det(M)=0: S1 and S2 are not necessarily true, S3 (MX=0 has a nontrivial solution) is TRUE because nullity >= 1, and S4 (M has an inverse) is FALSE. Only S3 is correct, but none of the options A-D represents "S3 only".
    - *Resolution*: Marked as defective (`is_defective: true`, `answer: null`, `type: "MCQ"`), with detailed explanatory notice. Selecting any option does not penalize candidate and question is excluded from scoring (`scorable: false` in mock catalog). Original text and choices preserved.
    - *Affected files*: `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/questions-with-answers.json`, detail shard `2008-s0.json`, and `public/mock_catalog_v1.json`.
  - *`go:422833` (GATE CSE 2024 Set 1 Q9 - Programming in C)*:
    - *Problem*: C code snippet was corrupted in question text (missing parentheses/syntax around `fX()` declarations, definitions, `getchar()`, and `putchar()`).
    - *Resolution*: Restored clean, valid C syntax conforming to the official GATE paper while preserving question text, choices, and answer Option C (4321).
    - *Affected files*: `public/questions-with-answers.json`, `public/questions-filtered-with-ids.json`, `public/questions-filtered.json`, and detail shard `2024-s1.json`.
  - *Tests & Verification*: Added automated regression unit tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`. Rebuilt all static shards, catalogs, and indexes via `build-public-artifacts.mjs`. All 550 unit tests passing, `npm run qa:validate-data` passing, and `npm run typecheck` clean (0 errors).

- **Insights Subsystem Loading Reliability & Resilience Fixes (DEC-051)**:
  - *Context*: Production user feedback reported: *"The insights section isn't loading bro 💔"*. Thorough investigation uncovered intermittent failure paths under race conditions, cold start, direct URL access, and unindexed/offline states.
  - *Root causes*:
    1. **Initial Mount Race Condition & Stale Dependency Array**: `InsightsPage.jsx` executed `useEffect` with an empty dependency array `[]`. When users navigated directly to `/insights` or refreshed the page before `FilterContext` finished loading `allQuestions`, `allQuestions` was `[]`. `InsightsPage` never re-executed when `allQuestions` finished hydrating (0 -> 3527 questions).
    2. **Uncached Heavy Network Waterfall & Offline Failure**: When `questions` was null, `weakTopicAnalyzer.js` bypassed `QuestionService`'s existing in-memory/localStorage cache (`gateqa_index_cache_v11`) and attempted to fetch `question-search-index.json` (4.7 MB) and `aptitude-search-index.json` (11.8 MB) concurrently. On slow networks/mobile, this caused 15–30s hangs, and offline it threw uncaught `Error("Unable to load practice analytics.")`.
    3. **Under-keyed Cache Collision**: The insights cache key did not include `questions.length`. When insights were initially built with empty questions, the zero-question result was cached for the rest of the day, blocking updated questions from rendering.
    4. **Unindexed Attempted Questions Zeroed**: In `buildWeakTopicInsights`, `attemptedQuestionCount` was computed exclusively from questions with metadata. Unindexed questions (or questions attempted before search index hydration) resulted in `attemptedQuestionCount: 0`, erroneously triggering the "No insights yet" empty state for users who had attempted questions.
    5. **Unsafe Array Property Access in `OverviewTab`**: Several sections read `insights.subjects.length` and `.map()` instead of guarded safe arrays, risking unhandled `TypeError` exceptions.
    6. **Missing Retry & Event Synchronization**: An error state had no retry mechanism, and changes from background syncs or practice attempts did not trigger a refresh.
  - *Fixes*:
    - Reactively trigger insight generation on `allQuestionsCount` transition and storage/sync events (`gateqa:progress-updated`, `gateqa:sync-complete`, `gateqa:workspace-imported`).
    - Reuse in-memory `QuestionService.questions` and offline `QuestionService.init()` cache; only load Aptitude/DA datasets if user actually has Aptitude/DA progress records; never throw unhandled errors on non-critical fetch failures.
    - Updated cache key to include questions count and mock history stamp; do not cache empty results when progress records exist.
    - Unconditionally track all attempted questions in `attemptedQuestionKeySet`, ensuring accurate `attemptedQuestionCount`, streaks, and study activity even for unindexed questions.
    - Guarded `OverviewTab` and `scopedInsights` against undefined fields with fallback empty arrays.
    - Added an interactive "Try Again" recovery button and "Open Practice" link on the error banner.
  - *Verification*: Added 3 new unit tests in `src/pages/InsightsPage.test.jsx` and 3 unit tests in `src/utils/weakTopicAnalyzer.reliability.test.js`. Full test suite passed (542 tests across 73 test suites), TypeScript typecheck clean (0 errors), production build passed.

- **Supabase API Gateway 406 Warning Elimination via `maybeSingle()` (DEC-050)**:
  - *Context*: Supabase API Gateway logged HTTP 406 responses as amber warnings when new users or new tracker records were fetched via `.single()` on `user_progress` and `user_tracker`.
  - *Resolution*: Upgraded queries in [`src/utils/cloudSyncManager.js`](../src/utils/cloudSyncManager.js) to dynamically execute `.maybeSingle()` with fallback. When no record exists, PostgREST returns HTTP `200 OK` with `data: null` instead of HTTP `406 Not Acceptable` (`PGRST116`).
  - *Verification*: All 536 unit tests passing (100% green), `npm run typecheck` clean (0 errors).

- **Supabase Free-Tier Resource Usage & Quota Audit (2026-09-03)**:
  - *Billing Cycle Telemetry*: Updated live resource consumption audit in `docs/DATABASE.md`.
  - *Metrics*: Egress at `0.56 GB / 5 GB` (11.2%), Database size at `41 MB / 500 MB` (8.2%), Monthly Active Users at `332 / 50,000` (0.66%), and File Storage at `0 GB / 1 GB` (0.0%).
  - *Status*: 🟢 Safe & Healthy (< 12% across all limits).

- **Question Data Integrity & Format Correction (`go:80599` & `go:84830`) (DEC-049)**:
  - *`go:80599` (GATE CSE 1987 Q2k - Theory of Computation)*:
    - *Problem*: Stored as MCQ but lacked an options list in the question body, causing the UI to render four empty fallback option placeholders (A–D).
    - *Resolution*: Appended `<ol style="list-style-type:upper-alpha"><li>TRUE</li><li>FALSE</li></ol>` to the question stem in `public/questions-with-answers.json` and `public/questions-filtered-with-ids.json`. Configured as a 2-choice MCQ with correct answer **Option B** (FALSE) because Context-Free Languages (CFLs) are not closed under intersection (e.g. $L_1 = \{a^n b^n c^m\}$ and $L_2 = \{a^m b^n c^n\}$ are CFLs, but $L_1 \cap L_2 = \{a^n b^n c^n\}$ is not a CFL).
    - *UI & Shards*: Regenerated `public/question-detail-shards/1987-s0.json` and updated `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/mock_catalog_v1.json`, and search indices.
  - *`go:84830` (GATE CSE 1990 Q3-v - Algorithms)*:
    - *Problem*: Incorrectly classified as NAT with dummy value 7 despite having four explicit choices (A: $\Theta(n \log n)$, B: $\Theta(n)$, C: $\Theta(n^2)$, D: $\Theta(n\sqrt{n})$).
    - *Resolution*: Converted question type from NAT to **MCQ** with correct answer **Option A** ($\Theta(n \log n)$), based on the fundamental lower bound of comparison-based sorting algorithms ($\Omega(n \log n)$ comparisons in decision tree). Preserved existing question stem and choices (A–D) verbatim.
    - *UI & Shards*: Synchronized across `data/answers/manual-answers-patch-v1.json`, `data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_master_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, `public/questions-with-answers.json`, detail shard `1990-s0.json`, and `public/mock_catalog_v1.json`.
  - *Tests & Verification*: Added automated regression tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`. All 536 unit tests passing (100% green), `npm run qa:validate-data` passing, and `npm run typecheck` clean.

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
  - Added a repeatable GateOverflow archive scraper and normalization pipeline for both
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
