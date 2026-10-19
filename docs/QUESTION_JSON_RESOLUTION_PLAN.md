# Question JSON Data Resolution Plan & Operational Playbook

> **Scope**: Master reference and operational standard for diagnosing, repairing, and verifying all categories of question data problems stored in JSON files across **GateQA** (`gateqa.in`). Covers answer key discrepancies, subtopic/taxonomy misclassifications, diagram restoration, suppressed options, NAT tolerances, and mathematical solutions across all engineering branches (CSE, DA, EC, EE, ME, CE, IT) and ISRO.

---

## 1. The 6 Problem Archetypes & Quick Diagnosis Matrix

Whenever a question issue is reported or identified, determine its archetype before touching any file:

| Archetype | Typical User Report / Symptom | Root Cause in Code / JSON | Target Files to Modify | Pipeline & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Type 1: Incorrect Answer Key** | *"Ans is A but marked C"* (e.g. `go:3354`, `isro:cs:2025:q5`) | Legacy key ingestion error or stale master registry entry. | 1. `data/answers/manual-answers-patch-v1.json`<br>2. `data/answers/answers_by_question_uid_v1.json`<br>3. `public/data/answers/answers_by_question_uid_v1.json`<br>4. `public/data/answers/answers_master_v1.json`<br>5. `public/questions-with-answers.json` (`answer_meta`) | `node scripts/build-public-artifacts.mjs`<br>Test: `evaluateAnswer.test.js`<br>Test: `AnswerService.test.js` |
| **Type 2: Taxonomy / Subtopic Misclassification & Tag Bridging** | *"Should be tagged Group Theory instead of Set Theory"* (e.g. `go:460041`, `go:2733`) or *"Add Graph Theory tag also"* (e.g. `go:1073`, `go:1075`) | Stale tag priority order, missing subtopic in syllabus taxonomy, or lack of multi-level curated taxonomy entry. | 1. `data/taxonomy/gate-syllabus-taxonomy-v1.json` (ensure subtopic registered)<br>2. `data/taxonomy/curated-question-taxonomy-v1.json` (`primary`, `secondary`, `conceptTags`)<br>3. `public/questions-with-answers.json` (tag order / array) | `node scripts/precompute-subtopics.mjs`<br>`node scripts/build-public-artifacts.mjs`<br>Test: `QuestionService.test.js` |
| **Type 3: Missing / Confusing Option Diagrams** | *"Need original diagrams on options, text is confusing/wrong"* (e.g. `go:1224` Hasse posets) | Ingestion stripped original option figures, replacing them with flawed text representations. | 1. Crop original diagrams $\to$ WebP in `public/question-images/{track}/{year}/`<br>2. `public/questions-with-answers.json` (embed `<img>` in `<ol>`)<br>3. `public/questions-filtered-with-ids.json` | `node scripts/build-public-artifacts.mjs`<br>Test: `QuestionService.test.js` (validating image URLs in normalized options) |
| **Type 4: Suppressed or Missing Options** | *"Options not visible"* (e.g. `isro:cs:2025:q5`) or *"Add missing Option E None of the above"* (e.g. `go:2303`) | Naive regex in services/components matching list tags inside problem stems (`<ul>`/`<ol>`), or 5th option omitted in paper intake. | 1. `public/questions-with-answers.json` (restore Option in HTML)<br>2. `IsroQuestionService.ts` / `Question.jsx` (harden option detection regex)<br>3. `unsupported_question_uids_v1.json` (remove if excluded) | `node scripts/build-public-artifacts.mjs`<br>Test: `Question.test.jsx`<br>Test: `evaluateAnswer.test.js` |
| **Type 5: NAT Rounding & Tolerance Bounds** | *"Expected answer is 3.9 after rounding, but it only showed 3.8 as correct"* (e.g. `go:1954`) | Overly permissive tolerance range (`[3.8, 3.9]`) accepting unrounded values, or missing symmetric tolerance (`{ abs: 0.01 }`). | 1. `data/answers/manual-answers-patch-v1.json` (set exact answer & `tolerance: null` or explicit bounds)<br>2. Answer registries (`answers_by_question_uid_v1.json`) | `node scripts/build-public-artifacts.mjs`<br>Test: `evaluateAnswer.test.js` (test exact, rounded, and incorrect values) |
| **Type 6: Missing / Generic Detailed Solution** | *"Detailed solution missing or generic stub"* (e.g. `go:1073`, MTA questions) | Question lacked step-by-step mathematical derivation in solution store. | 1. `data/solutions/cse-v1.json` (or `data/solutions/practicepaper/{branch}-solutions.json`)<br>2. Provide full mathematical proof, KaTeX formulas, and option breakdown | `node scripts/build-public-artifacts.mjs` (runs shard solution enrichment)<br>Verify in `public/question-detail-shards/<shard>.json` |

---

## 2. Source-of-Truth Data Architecture

GateQA uses a static, pre-rendered sharding architecture. Understanding which JSON files are **authoritative sources** versus **generated runtime artifacts** is essential:

```
[Authoritative Pipeline Sources]
  ├── data/taxonomy/gate-syllabus-taxonomy-v1.json     <-- 3-tier master syllabus (Subject -> Topic -> Subtopic)
  ├── data/taxonomy/curated-question-taxonomy-v1.json  <-- Multi-level primary/secondary cross-topic bridges
  ├── data/answers/manual-answers-patch-v1.json        <-- Authoritative answer key override patch
  ├── data/answers/answers_by_question_uid_v1.json      <-- Authoritative pipeline answer map
  ├── data/solutions/cse-v1.json                       <-- CSE step-by-step mathematical derivations
  └── public/questions-with-answers.json                <-- Master question bank (stems, options, answer_meta)
                                │
                                ▼ (Synchronize across runtime answer datasets)
[Runtime Answer Datasets (public/data/answers/)]
  ├── answers_by_question_uid_v1.json                   <-- Consumed by build script & AnswerService
  ├── answers_by_exam_uid_v1.json                       <-- Consumed by AnswerService for exam UID fallback
  ├── answers_master_v1.json                            <-- Consumed by AnswerService for master UID fallback
  └── unsupported_question_uids_v1.json                 <-- Excluded / unsupported question registry
                                │
                                ▼ [Pipeline Execution]
       ┌────────────────────────┴────────────────────────┐
       ▼                                                 ▼
[scripts/precompute-subtopics.mjs]              [scripts/build-public-artifacts.mjs]
       │                                                 │
       ▼                                                 ▼
[src/generated/subtopicLookup.json]             [public/question-detail-shards/<shard>.json]
 (Fast runtime subtopic & topic lookup)          [public/question-search-index.json]
                                                [public/mock_catalog_v1.json]
                                                [public/homepage-search-catalog.json]
```

> [!CAUTION]
> **NEVER manually edit files inside `public/question-detail-shards/` or `public/question-search-index.json`!**
> Detail shards are compiled artifacts. Direct edits will be immediately overwritten on the next pipeline build. Always modify the authoritative source files in `data/` and `public/questions-with-answers.json`, then run the build scripts to re-generate the shards.

---

## 3. Step-by-Step Resolution Workflows

### Workflow A: Answer Key Corrections (MCQ / MSQ / NAT)

1. **Verify Official Proof & Key**:
   - Check the official organizing institute answer key or consensus GateOverflow derivation.
2. **Patch Authoritative Store (`data/answers/manual-answers-patch-v1.json`)**:
   ```json
   "go:3354": {
     "type": "MCQ",
     "answer": "A",
     "tolerance": null,
     "note": "gate_it_2008_q44:master_theorem_case_2:option_a"
   }
   ```
3. **Synchronize Question UID Answer Registries**:
   Update `data/answers/answers_by_question_uid_v1.json` and `public/data/answers/answers_by_question_uid_v1.json`:
   ```json
   "go:3354": {
     "answer_uid": "manual:go:3354",
     "type": "MCQ",
     "answer": "A",
     "tolerance": null,
     "source": { "kind": "manual_patch" }
   }
   ```
4. **Update Question Bank (`public/questions-with-answers.json`)**:
   Locate question by `question_uid` and update `answer_meta`:
   ```json
   "answer_meta": {
     "type": "MCQ",
     "answer": "A",
     "tolerance": null,
     "source": "manual_patch"
   }
   ```
5. **Update Fallback Maps (`answers_by_exam_uid_v1.json` & `answers_master_v1.json`)**.

---

### Workflow B: Taxonomy, Subtopic & Cross-Topic Tag Bridging

When a question belongs under a different topic or legitimately bridges multiple syllabus topics (like `go:1073` bridging Combinatorics and Graph Theory):

1. **Verify Syllabus Registration (`data/taxonomy/gate-syllabus-taxonomy-v1.json`)**:
   Ensure both the topic and subtopic slugs exist under the target subject. If a general topic subtopic is missing (e.g., `graph-theory` under topic `graph-theory`), add it:
   ```json
   {
     "slug": "graph-theory",
     "label": "Graph Theory"
   }
   ```
2. **Add Multi-Level Curated Mapping (`data/taxonomy/curated-question-taxonomy-v1.json`)**:
   Add an entry under `questions`:
   ```json
   "go:1073": {
     "question_uid": "go:1073",
     "exam_uid": "cse:2004:set1:main:q79",
     "taxonomy": {
       "primary": {
         "subjectSlug": "discrete-math",
         "topicSlug": "combinatorics",
         "subtopicSlug": "combinatory"
       },
       "secondary": [
         {
           "subjectSlug": "discrete-math",
           "topicSlug": "graph-theory",
           "subtopicSlug": "graph-theory"
         }
       ],
       "conceptTags": [
         "graph-theory",
         "labeled-graphs",
         "graph-edges",
         "combinatorics",
         "counting"
       ]
     },
     "rationale": "Evaluates number of simple graphs on n labeled vertices with >= (n^2-3n)/2 edges. Out of N = C(n,2) edges, choosing >= (n^2-3n)/2 equals omitting <= n edges. Bridges Combinatorics and Graph Theory.",
     "syllabusRef": "GATE CSE Section 1 (Discrete Mathematics: Combinatorics and Graph Theory)"
   }
   ```
3. **Clean Legacy Tag Arrays in Question Banks**:
   In `public/questions-with-answers.json` and `public/questions-filtered-with-ids.json`, ensure misleading tags (e.g., `identify-function` or `set-theory` in pure Group Theory questions) are removed or reordered so the authoritative tag appears first.

---

### Workflow C: Restoring Option Diagrams & Images

When question options have missing or scrambled text representations (e.g. `go:1224` Hasse diagrams):

1. **Acquire & Optimize Images**:
   - Crop authentic diagrams from original official question paper or verified GateOverflow post.
   - Convert images to optimized WebP format with clean dimensions:
     `public/question-images/{branch}/{year}/{question_id}_opt_{a,b,c,d}.webp`
2. **Embed Clean HTML in Question Bank (`public/questions-with-answers.json`)**:
   Replace text-only options with clean standard `<ol>` structure:
   ```html
   <ol style="list-style-type:upper-alpha">
     <li><img src="/question-images/cse/2007/go_1224_opt_a.webp" alt="Option A Diagram" width="120" height="180" /></li>
     <li><img src="/question-images/cse/2007/go_1224_opt_b.webp" alt="Option B Diagram" width="120" height="180" /></li>
     <li><img src="/question-images/cse/2007/go_1224_opt_c.webp" alt="Option C Diagram" width="120" height="180" /></li>
     <li><img src="/question-images/cse/2007/go_1224_opt_d.webp" alt="Option D Diagram" width="120" height="180" /></li>
   </ol>
   ```
3. **Synchronize in `public/questions-filtered-with-ids.json`**.

---

### Workflow D: Fixing Suppressed or Missing Options

When choice options disappear from the practice interface (e.g., `isro:cs:2025:q5` where question stem contained `<ul>` bullets):

1. **Diagnose Option Detection**:
   - Avoid naive regexes like `/<(ol|ul)\b/i.test(questionHtml)`.
   - Use structured option detection that checks for option-specific class names or styles:
     `/<ol\b[^>]*(?:class=["'][^"']*(?:qa-options|question-options)|style=["'][^"']*(?:upper-alpha|lower-alpha)|type=["'][Aa]["']|data-option-label)/i.test(html) || extractEmbeddedOptions(html).length >= 2`
2. **Restoring Missing 5th Option ("None of the Above")**:
   - In 5-option legacy papers (e.g., `go:2303`), add `<li>None of the above</li>` into the `<ol>` list in `public/questions-with-answers.json`.
   - Update answer key to `"E"` across manual patches and answer maps.
   - Remove the question UID from `public/data/answers/unsupported_question_uids_v1.json`.

---

### Workflow E: Authoring Step-by-Step Detailed Solutions

Every question must provide complete pedagogical reasoning (never lazy one-line stubs):

1. **Update Solution Store (`data/solutions/cse-v1.json`)**:
   ```json
   "go:1073": {
     "question_uid": "go:1073",
     "verified_answer": "D",
     "concept_summary": "discrete-mathematics: combinatorics & graph-theory",
     "solution_markdown": "For an undirected simple graph on $n$ labeled vertices:\n\n1. **Total Possible Edges:**\n   $$N = \\binom{n}{2} = \\frac{n(n-1)}{2} = \\frac{n^2 - n}{2}$$\n\n2. **Selecting at Least $\\frac{n^2 - 3n}{2}$ Edges:**\n   Summing over all allowed edge counts from $E$ to $N$:\n   $$\\sum_{k = E}^{N} \\binom{N}{k} = \\sum_{k = \\frac{n^2 - 3n}{2}}^{\\frac{n^2 - n}{2}} \\binom{\\frac{n^2 - n}{2}}{k}$$\n\n3. **Applying Binomial Symmetry:**\n   $$N - E = \\frac{n^2 - n}{2} - \\frac{n^2 - 3n}{2} = n$$\n   By $\\binom{N}{k} = \\binom{N}{N - k}$ with $j = N - k$:\n   $$\\sum_{k = E}^{N} \\binom{N}{k} = \\sum_{j = 0}^{n} \\binom{N}{j} = \\sum_{k = 0}^{n} \\binom{\\frac{n^2 - n}{2}}{k}$$\n\nThis confirms **Option D**.\n\n<b>Answer: Option D</b>"
   }
   ```
2. **Marks to All (MTA) Derivations**:
   - MTA questions must explain **why** the problem operates the way it does, evaluate each option, and explicitly prove why ambiguity, contradiction, or missing parameters led to the MTA status.

---

## 4. Pipeline Rebuild Commands

After modifying the authoritative JSON sources, execute the static build pipeline:

```powershell
# In PowerShell:
node scripts/precompute-subtopics.mjs; node scripts/build-public-artifacts.mjs
```

This automatically:
1. Re-generates `src/generated/subtopicLookup.json` with updated topic-subtopic mappings.
2. Injects detailed solutions into static shards via `enrich-shards-with-solutions.mjs`.
3. Re-generates only the modified detail shards (e.g. `public/question-detail-shards/2004-s0.json`), skipping unchanged shards.
4. Updates `public/question-search-index.json`, `public/mock_catalog_v1.json`, and `public/homepage-search-catalog.json`.

---

## 5. Automated Regression Testing Protocol

Never consider a question fix complete without adding automated regression tests:

1. **Answer Evaluation Tests (`src/utils/evaluateAnswer.test.js`)**:
   ```javascript
   test("evaluates go:3354 (GATE IT 2008 Q44) as MCQ Option A", () => {
     const record = { type: "MCQ", answer: "A", tolerance: null };
     expect(evaluateAnswer(record, "A")).toEqual({ status: "evaluated", correct: true });
     expect(evaluateAnswer(record, "C")).toEqual({ status: "evaluated", correct: false });
   });
   ```
2. **Service Resolution Tests (`src/services/AnswerService.test.js`)**:
   ```javascript
   test("resolves go:1954 as NAT 3.9", () => {
     AnswerService.answersByQuestionUid = {
       "go:1954": { answer_uid: "manual:go:1954", type: "NAT", answer: 3.9, tolerance: null }
     };
     const answer = AnswerService.getAnswerForQuestion({ question_uid: "go:1954" });
     expect(answer).toMatchObject({ type: "NAT", answer: 3.9 });
   });
   ```
3. **Taxonomy Resolution Tests (`src/services/QuestionService.test.js`)**:
   ```javascript
   test("bridges go:1073 with secondary Graph Theory taxonomy under Discrete Mathematics", () => {
     const question = {
       question_uid: "go:1073",
       title: "GATE CSE 2004 | Question: 79",
       tags: ["gatecse-2004", "graph-theory", "combinatory", "normal", "counting"],
       taxonomy: {
         primary: { subjectSlug: "discrete-math", topicSlug: "combinatorics", subtopicSlug: "combinatory" },
         secondary: [{ subjectSlug: "discrete-math", topicSlug: "graph-theory", subtopicSlug: "graph-theory" }]
       }
     };
     const resolved = QuestionService.resolveQuestionTaxonomy(question);
     expect(resolved.primary.subjectSlug).toBe("discrete-math");
     expect(resolved.secondary[0].topicSlug).toBe("graph-theory");
   });
   ```
4. **Execution & Validation Suite**:
   ```powershell
   # 1. Run unit tests
   npm run test:unit

   # 2. Run TypeScript typecheck
   npm run typecheck

   # 3. Run semantic data integrity validation
   npm run qa:validate-data
   ```

---

## 6. Documentation & Memory Protocol

Every question correction must be permanently recorded:

1. **`docs/CHANGELOG.md`**:
   Add an entry with format:
   `- **Question Data Integrity & <Fix Type> for <question_uid> (DEC-XXX)**:`
   Include Context, Mathematical Proof, Resolution, and Verification metrics.
2. **`.llm-memory/decisions.md`**:
   Add a one-line record:
   `[YYYY-MM-DD] WHAT: <Description> for <uid> (DEC-XXX) | WHY: <Proof & justification>`
3. **`.llm-memory/progress.md`**:
   Record the DEC number and updated test counts.
4. **Zero-Commit Policy**:
   Never commit or merge git branches unless explicitly instructed by the user.
