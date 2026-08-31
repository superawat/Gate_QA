# Question & Answer Maintenance Roadmap and Execution Runbook

> **Scope**: Master end-to-end operational guide for modifying question answers, converting question types (MCQ $\leftrightarrow$ MSQ $\leftrightarrow$ NAT $\leftrightarrow$ MTA), repairing question bodies/options/LaTeX, rebuilding generated shards, and writing regression tests across **GATE CSE**, **GATE DA**, and **Special Aptitude** banks.

---

## 1. Quick Decision Matrix: What Kind of Fix is This?

| Fix Type | Key Symptoms | What to Modify | Rebuild / Test Steps |
| :--- | :--- | :--- | :--- |
| **Case A: Answer Key Correction** | Evaluator marks valid official option/value wrong (e.g. Option A $\rightarrow$ Option C, NAT 147.6 $\rightarrow$ 148). | `data/answers/manual-answers-patch-v1.json`<br>`data/answers/answers_by_question_uid_v1.json`<br>`public/questions-with-answers.json` | `node scripts/build-public-artifacts.mjs`<br>Add unit test in `evaluateAnswer.test.js` |
| **Case B: Question Type Conversion** | Question marked as NAT but is MCQ with 4 options (e.g. `go:422811`), or MCQ is actually MSQ. | Same as Case A + update `"type": "MCQ"` / `"MSQ"` in `questions-with-answers.json` and `manual-answers-patch-v1.json`. | Rebuild artifacts (updates `mock_catalog_v1.json` & shards).<br>Add tests in `evaluateAnswer.test.js` and `AnswerService.test.js`. |
| **Case C: NAT Numeric Tolerance / Range** | Valid student answer rejected due to floating-point rounding or tight tolerance. | Add `"tolerance": { "abs": 0.01 }` or `"range": [min, max]` to the patch record. | Rebuild artifacts.<br>Add test in `evaluateAnswer.test.js`. |
| **Case D: Marks to All (MTA) / Ambiguous** | Official GATE paper gave marks to all, or multiple keys are accepted. | Set `"type": "MTA"` or `"AMBIGUOUS"` with `"answer": "MTA"` in patch registry. | Rebuild artifacts.<br>Mock scoring automatically awards full marks. |
| **Case E: Question Stem / LaTeX / Options Repair** | Broken MathJax formula, scrambled HTML list, or missing figure. | Update `question` HTML in `questions-with-answers.json` (and `questions-filtered-with-ids.json`). | Run image mirroring if external URL.<br>Rebuild shards with `build-public-artifacts.mjs`. |
| **Case F: Subject / Subtopic Taxonomy Fix** | Question mapped to wrong subject or subtopic. | Update subject slug / subtopic tags in `questions-with-answers.json`. | `node scripts/precompute-subtopics.mjs`<br>`node scripts/build-public-artifacts.mjs` |

---

## 2. Source-of-Truth Data Architecture

GateQA uses a deterministic, static sharding model. Updating data requires modifying the **source files** and running the **build pipeline** so public shards stay 100% in sync:

```
[Authoritative Sources]
  ├── data/answers/manual-answers-patch-v1.json   <-- Single master override patch dictionary
  ├── data/answers/answers_by_question_uid_v1.json <-- Base question UID answer map
  └── public/questions-with-answers.json           <-- Question bank (bodies, choices, tags)
                                │
                                ▼
               [scripts/build-public-artifacts.mjs]
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
[public/data/answers/]  [public/question-detail-shards/] [public/mock_catalog_v1.json]
 - answers_by_question_uid_v1.json  - 2024-s1.json           - Full scorable question pool
 - answers_master_v1.json          - 2024-s2.json           - Marks & scoring metadata
 - answers_by_exam_uid_v1.json      - ...                    - Search index & manifests
```

---

## 3. The 6-Phase Execution Protocol

Follow these 6 steps in order whenever fixing or updating any question data:

### Phase 1: Identity & Proof Audit
1. **Identify Question Keys**:
   - `question_uid`: e.g. `go:422811`, `go:3812`, `da:2026-s1-q15`, `APT-ENG-5840`
   - `exam_uid`: e.g. `gate-cse-2024-set-1-q31`
   - Shard ID: e.g. `2024-s1.json`
2. **Verify Official / Mathematical Proof**:
   - Cross-check official GATE answer key from organizing institute (e.g. IIT Madras, IISc) or verified GateOverflow discussion.
   - Double-check question type: MCQ (single choice), MSQ (multiple choices), NAT (numerical input), or MTA (marks to all).

---

### Phase 2: Patch Authoritative Source Files
1. **Update `data/answers/manual-answers-patch-v1.json`**:
   Add or update the question entry under `records_by_question_uid`:
   ```json
   "go:422811": {
     "type": "MCQ",
     "answer": "D",
     "note": "official_gate_key:gate_cse_2024_set_1_q31_max_heap"
   }
   ```
   *For NAT with tolerance*:
   ```json
   "go:8313": {
     "type": "NAT",
     "answer": 69,
     "tolerance": { "abs": 0.01 },
     "note": "official_gate_key:gate_cse_2015_set_1_q43_mst_sum"
   }
   ```
   *For MSQ*:
   ```json
   "go:371897": {
     "type": "MSQ",
     "answer": "A, B, C",
     "note": "official_gate_key:gate_cse_2022_q39"
   }
   ```

2. **Update `data/answers/answers_by_question_uid_v1.json`**:
   Update the matching record to match the patch.

3. **Update `public/questions-with-answers.json`** (and `public/questions-filtered-with-ids.json` if present):
   - Update `"type"` (`"MCQ"` / `"MSQ"` / `"NAT"` / `"MTA"`).
   - Update `"answer"` (e.g. `"D"` or `69`).
   - If options or question body were corrected, ensure LaTeX backslashes are double-escaped (`\\frac`, `\\sum`).

---

### Phase 3: Rebuild Public Artifacts
Run the artifact generation pipeline:

```powershell
# 1. Precompute subtopics lookup
node scripts/precompute-subtopics.mjs

# 2. Rebuild all public shards, search indexes, and mock catalogs
node scripts/build-public-artifacts.mjs
```

> [!TIP]
> This command automatically synchronizes:
> - `public/question-detail-shards/*.json`
> - `public/mock_catalog_v1.json`
> - `public/question-search-index.json`
> - `public/data/answers/*.json`
> - `public/question-bank-manifest.json`

---

### Phase 4: Add Unit Regression Tests
Always add automated tests to prevent regressions in future builds:

1. **Evaluator Tests (`src/utils/evaluateAnswer.test.js`)**:
   ```javascript
   it("evaluates go:422811 (GATE CSE 2024 Set 1 Q31) as MCQ Option D", () => {
     const question = {
       question_uid: "go:422811",
       type: "MCQ",
       answer: "D"
     };
     expect(evaluateAnswer(question, "D").isCorrect).toBe(true);
     expect(evaluateAnswer(question, "A").isCorrect).toBe(false);
   });
   ```

2. **Service Resolution Tests (`src/services/AnswerService.test.js`)**:
   Add assertion if identity resolution or type lookup was changed.

3. **Run Unit Tests**:
   ```powershell
   npm run test:unit
   ```

---

### Phase 5: Pipeline & Schema Validation
Run the QA audit suite to verify data consistency:

```powershell
# Verify question bank parity and format integrity
npm run qa:validate-data

# Run TypeScript checks
npm run typecheck
```

---

### Phase 6: Documentation & Memory Protocol

Whenever modifying question data:
1. **Update `docs/CHANGELOG.md`**: Add an entry under the current date with:
   - Question UID and full exam title (e.g. `go:422811 - GATE CSE 2024 Set 1 Q31`).
   - Old value $\rightarrow$ New value.
   - Mathematical derivation or official source link.
   - Affected files and tests added.
2. **Update `.llm-memory/decisions.md`**: Record the decision with format:
   `[YYYY-MM-DD] WHAT: Question Data Integrity & Type/Answer Key Correction for <uid> (DEC-03X) | WHY: <mathematical and official justification>`
3. **Update `.llm-memory/progress.md`** & **`.llm-memory/bugs.md`**: Note the resolved item.
4. **Bump date in `.llm-memory/INDEX.md`**.

---

## 4. Track-Specific Guidelines

### A. GATE CSE Track
- Primary question identifiers: `go:<number>` (e.g. `go:422811`).
- Exam year sets: `gate-<year>-set<set>` or `<year>-s<set>`.
- Public shards: `public/question-detail-shards/<year>-s<set>.json`.

### B. GATE DA Track
- Primary question identifiers: `da:<year>-s<set>-q<num>`.
- Ingestion scripts: `scripts/da-pipeline/merge-da.mjs` and `scripts/da-pipeline/build-da-artifacts-cli.mjs`.
- Shards & Catalogs: `public/mock_catalog_da_v1.json`.
- GateOverflow solution links are enriched via `scripts/da-pipeline/import-da-2026.mjs`.

### C. Special Aptitude Track
- Question identifiers: `APT-ENG-...`, `APT-QNT-...`, `APT-SPA-...`.
- Image assets: Local WebP in `public/aptitude-images/`.
- External solution URLs are guarded by `src/utils/solutionLink.js` (`isSpecialAptitudeQuestion`).

---

## 5. Common Gotchas & Quality Checklist

- [ ] **LaTeX Double Backslashes**: In JSON strings, write `\\frac`, `\\times`, `\\begin{bmatrix}`, never raw unescaped `\frac`.
- [ ] **MSQ Answer Sorting**: Multiple correct options should be comma-separated in alphabetical order (e.g. `"A, B, C"`).
- [ ] **NAT Floating Point**: Always specify numeric tolerance `{ abs: 0.01 }` for floating-point calculations to avoid rounding failures.
- [ ] **Options Array Sync**: When changing a question from NAT to MCQ/MSQ, ensure the `<ol>` list in `question` HTML has matching `data-option-label="A"`, `"B"`, `"C"`, `"D"` attributes.
- [ ] **Mock Catalog Integrity**: Running `node scripts/build-public-artifacts.mjs` registers scorable questions into `mock_catalog_v1.json` with marks and negative marks.
- [ ] **No Git Stamp Churn**: The build script preserves `generatedAt` timestamps when data content is unchanged to prevent noisy diffs.
