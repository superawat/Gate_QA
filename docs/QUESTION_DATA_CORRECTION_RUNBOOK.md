# Question & Answer Maintenance Roadmap and Execution Runbook

> **Scope**: Master end-to-end operational guide for modifying question answers, converting question types (MCQ $\leftrightarrow$ MSQ $\leftrightarrow$ NAT $\leftrightarrow$ MTA), handling defective questions, repairing question bodies/options/LaTeX, rebuilding generated shards, and writing regression tests across **GATE CSE**, **GATE DA**, and **Special Aptitude** banks.

---

## 1. Quick Decision Matrix: What Kind of Fix is This?

| Fix Type | Key Symptoms | What to Modify | Rebuild / Test Steps |
| :--- | :--- | :--- | :--- |
| **Case A: Answer Key Correction** | Evaluator marks valid official option/value wrong (e.g. Option A $\rightarrow$ Option C, NAT 147.6 $\rightarrow$ 148). | 1. `data/answers/manual-answers-patch-v1.json`<br>2. `data/answers/answers_by_question_uid_v1.json`<br>3. `public/data/answers/answers_by_question_uid_v1.json`<br>4. `public/data/answers/answers_by_exam_uid_v1.json`<br>5. `public/data/answers/answers_master_v1.json` (if present)<br>6. `public/questions-with-answers.json` (`answer_meta`) | `node scripts/build-public-artifacts.mjs`<br>Add unit test in `evaluateAnswer.test.js`<br>Add service test in `AnswerService.test.js` |
| **Case B: Question Type Conversion** | Question marked as NAT but is MCQ with 4 options (e.g. `go:422811`), or MCQ is actually MSQ. | Same files as Case A.<br>Update `"type": "MCQ"` / `"MSQ"` in patch and `answer_meta`.<br>If NAT $\rightarrow$ MCQ/MSQ, ensure options list in question HTML has `data-option-label="A"`, `"B"`, etc. | Rebuild artifacts (updates `mock_catalog_v1.json` with appropriate negative marking & shards).<br>Add tests in `evaluateAnswer.test.js` & `AnswerService.test.js`. |
| **Case C: NAT Numeric Tolerance / Range** | Valid student answer rejected due to floating-point rounding or tight tolerance. | Add `"tolerance": { "abs": 0.01 }` for symmetric tolerance, or `"tolerance": { "lower": min, "upper": max }` for explicit intervals.<br>For discrete alternate answers, use array `"answer": [val1, val2]`.<br>*(Note: `"range": [min, max]` is NOT supported).* | Rebuild artifacts.<br>Add test in `evaluateAnswer.test.js` testing inside tolerance, boundary values, and outside. |
| **Case D: Marks to All (MTA) / Ambiguous** | Official GATE paper gave marks to all, or question cancelled by organizing institute. | Set `"type": "MTA"` or `"AMBIGUOUS"` with `"answer": "MTA"` in patch and answer registries. | Rebuild artifacts.<br>Mock scoring automatically awards full marks to all candidates. |
| **Case E: Defective Question (Excluded)** | None of the 4 options is correct, question contains contradictory data, or correct value is missing from choices (e.g. `go:1376`, `go:43485`). | Set `"answer": null`, `"is_defective": true`, `"defective_reason": "<explanation>"`.<br>Remove from `unsupported_question_uids_v1.json` if previously listed. | Rebuild artifacts.<br>Evaluator returns `{ status: "excluded", correct: false, reason: ... }`. Excluded from mock scoring. |
| **Case F: Question Stem / LaTeX / Options Repair** | Broken MathJax formula, scrambled HTML list, or missing figure. | Update `question` HTML in `public/questions-with-answers.json`.<br>Ensure LaTeX backslashes are double-escaped (`\\frac`, `\\sum`, `\\Theta`). | Run image mirroring if external URL.<br>Rebuild shards with `node scripts/build-public-artifacts.mjs`. |
| **Case G: Subject / Subtopic Taxonomy Fix** | Question mapped to wrong subject or subtopic. | Update subject slug / subtopic tags in `public/questions-with-answers.json`. | `node scripts/precompute-subtopics.mjs`<br>`node scripts/build-public-artifacts.mjs` |

---

## 2. Source-of-Truth Data Architecture

GateQA uses a deterministic, static sharding model. Updating question data requires keeping the **pipeline source files** and **public runtime answer indices** synchronized before running the **artifact build pipeline**:

```
[Authoritative Pipeline Sources]
  ├── data/answers/manual-answers-patch-v1.json     <-- Single master override patch dictionary
  ├── data/answers/answers_by_question_uid_v1.json   <-- Pipeline question UID answer map
  └── public/questions-with-answers.json             <-- Master question bank (bodies, choices, answer_meta)
                                │
                                ▼ (Synchronize across runtime answer datasets)
[Runtime Answer Datasets (public/data/answers/)]
  ├── answers_by_question_uid_v1.json                <-- Consumed by build-public-artifacts & AnswerService
  ├── answers_by_exam_uid_v1.json                    <-- Consumed by AnswerService for exam UID fallback
  ├── answers_master_v1.json                         <-- Consumed by AnswerService for master UID fallback
  └── unsupported_question_uids_v1.json              <-- Excluded / unsupported question registry
                                │
                                ▼
               [scripts/build-public-artifacts.mjs]
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
[public/question-detail-shards/] [public/mock_catalog_v1.json] [public/question-search-index.json]
 - 2024-s1.json                  - Full scorable pool          - Quick search & filter index
 - 2024-s2.json                  - Marks & negative penalties  - Manifest & generated data status
 - ...                           - Section classification      - (public/question-bank-manifest.json)
```

> [!IMPORTANT]
> `scripts/build-public-artifacts.mjs` does **NOT** generate or write files in `public/data/answers/`!
> In fact, the build script **reads** `public/data/answers/answers_by_question_uid_v1.json` to populate answers into `public/mock_catalog_v1.json`.
> Always update `public/data/answers/` **before** running `build-public-artifacts.mjs`.

---

## 3. The 6-Phase Execution Protocol

Follow these 6 steps in order whenever fixing or updating any question data:

### Phase 1: Identity & Proof Audit

1. **Identify Question Keys**:
   - `question_uid`: e.g. `go:422811`, `go:3812`, `da:2026-s1-q15`, `APT-ENG-5840`
   - `exam_uid`: e.g. `cse:2024:set1:main:q31` or `gate-cse-2024-set-1-q31`
   - `answer_uid`: e.g. `v2:1.30.6` or `manual:go:422811`
   - Shard ID: e.g. `2024-s1.json`
2. **Verify Official / Mathematical Proof**:
   - Cross-check official GATE answer key from organizing institute (e.g. IIT Roorkee, IIT Madras, IISc) or verified GateOverflow discussion.
   - Double-check question type: MCQ (single choice), MSQ (multiple choices), NAT (numerical input), MTA (marks to all), or Defective (excluded).
3. **Check Unsupported Registry**:
   - If the question was previously listed in `public/data/answers/unsupported_question_uids_v1.json` (or `data/answers/unsupported_question_uids_v1.json`), remove its UID from `question_uids` array so it evaluates normally.

---

### Phase 2: Patch Authoritative Source Files & Runtime Indices

#### 1. Update `data/answers/manual-answers-patch-v1.json`
Add or update the question entry under `records_by_question_uid`:

- **MCQ**:
  ```json
  "go:422811": {
    "type": "MCQ",
    "answer": "D",
    "tolerance": null,
    "note": "gate_cse_2024_set_1_q31:type_correction_nat_to_mcq:official_gate_key_d"
  }
  ```

- **MSQ** *(CRITICAL: `answer` must be an array of uppercase strings, NOT a comma-separated string)*:
  ```json
  "go:371897": {
    "type": "MSQ",
    "answer": [
      "A",
      "B",
      "C"
    ],
    "tolerance": null,
    "note": "official_gate_key:gate_cse_2022_q39"
  }
  ```

- **NAT with Absolute Tolerance**:
  ```json
  "go:8313": {
    "type": "NAT",
    "answer": 69,
    "tolerance": { "abs": 0.01 },
    "note": "official_gate_key:gate_cse_2015_set_1_q43_mst_sum"
  }
  ```

- **NAT with Range Bounds**:
  ```json
  "go:302826": {
    "type": "NAT",
    "answer": 0.503,
    "tolerance": { "lower": 0.50, "upper": 0.51 },
    "note": "official_gate_key:gate_cse_2019_q42"
  }
  ```

- **Defective Question (Excluded from scoring)**:
  ```json
  "go:43485": {
    "type": "MCQ",
    "answer": null,
    "is_defective": true,
    "defective_reason": "Correct value 13 is absent from options (A: 5, B: 7, C: 8, D: 16). Excluded from scoring.",
    "note": "gate_cse_2008_q79:defective_question:correct_value_absent_from_options"
  }
  ```

---

#### 2. Update Question UID Answer Maps (Both Pipeline & Public)
Update the matching record in **both** files:
1. `data/answers/answers_by_question_uid_v1.json`
2. `public/data/answers/answers_by_question_uid_v1.json`

Example record structure:
```json
"go:422811": {
  "answer_uid": "v2:1.30.6",
  "type": "MCQ",
  "answer": "D",
  "tolerance": null,
  "source": {
    "kind": "question_uid"
  }
}
```

---

#### 3. Update Exam UID & Master Answer Registries
To prevent fallback to stale answers when resolved via exam or master UID:
1. `public/data/answers/answers_by_exam_uid_v1.json`: Update the entry keyed by `exam_uid` (e.g. `"cse:2024:set1:main:q31"`).
2. `public/data/answers/answers_master_v1.json`: Update the entry keyed by `answer_uid` (e.g. `"v2:1.30.6"` or `"manual:go:422811"`).

---

#### 4. Update Question Bank `public/questions-with-answers.json`
Locate the question object by `question_uid`. Ensure:
- `answer_uid`: Set to `"manual:<question_uid>"` or existing canonical UID.
- `answer_meta`: Update nested fields:
  ```json
  "answer_meta": {
    "type": "MCQ",
    "answer": "D",
    "tolerance": null,
    "source": "manual_patch"
  }
  ```
- If question type changed from NAT to MCQ/MSQ, verify the options in `question` HTML have option labels:
  `<ol class="qa-options"><li data-option-label="A">...</li>...</ol>`.
- If math formulas or HTML were modified, **always double-escape LaTeX backslashes** in JSON: `\\frac`, `\\times`, `\\Theta`, `\\le`, `\\ge`, `\\begin{bmatrix}`.

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
> - `public/question-detail-shards/<shard>.json` (e.g. `2024-s1.json`)
> - `public/mock_catalog_v1.json` (marks, negative marking penalty, scorable candidate pool)
> - `public/question-search-index.json`
> - `public/question-bank-manifest.json`
> - `docs/generated/data-status.json` and `docs/generated/DATA_STATUS.md`
>
> `scripts/build-public-artifacts.mjs` preserves `generatedAt` timestamps on unchanged shards. Only the shards containing modified questions will show changes in `git status`.

---

### Phase 4: Add Unit Regression Tests

Always add automated tests to prevent regressions in future builds:

#### 1. Evaluator Tests (`src/utils/evaluateAnswer.test.js`)
Test both correct and incorrect submissions. Note that `evaluateAnswer` returns `{ status: "evaluated", correct: boolean }`:

```javascript
test("evaluates go:422811 (GATE CSE 2024 Set 1 Q31) as MCQ Option D", () => {
  const record = {
    type: "MCQ",
    answer: "D",
    tolerance: null,
  };

  // Option D (case-insensitive) is correct
  expect(evaluateAnswer(record, "D")).toEqual({ status: "evaluated", correct: true });
  expect(evaluateAnswer(record, "d")).toEqual({ status: "evaluated", correct: true });

  // Options A, B, C or empty input are incorrect
  expect(evaluateAnswer(record, "A")).toEqual({ status: "evaluated", correct: false });
  expect(evaluateAnswer(record, "B")).toEqual({ status: "evaluated", correct: false });
  expect(evaluateAnswer(record, "C")).toEqual({ status: "evaluated", correct: false });
  expect(evaluateAnswer(record, "").correct).toBe(false);
});
```

*For MSQ*:
```javascript
test("evaluates go:371897 (GATE CSE 2022 Q39) as MSQ Options A, B, C", () => {
  const record = {
    type: "MSQ",
    answer: ["A", "B", "C"],
    tolerance: null,
  };

  expect(evaluateAnswer(record, ["A", "B", "C"])).toEqual({ status: "evaluated", correct: true });
  expect(evaluateAnswer(record, ["A", "B"])).toEqual({ status: "evaluated", correct: false });
  expect(evaluateAnswer(record, ["A", "B", "C", "D"])).toEqual({ status: "evaluated", correct: false });
});
```

*For NAT with Tolerance*:
```javascript
test("evaluates go:8313 (GATE CSE 2015 Set 1 Q43) as NAT 69 with tolerance", () => {
  const record = {
    type: "NAT",
    answer: 69,
    tolerance: { abs: 0.01 },
  };

  expect(evaluateAnswer(record, 69).correct).toBe(true);
  expect(evaluateAnswer(record, 69.005).correct).toBe(true);
  expect(evaluateAnswer(record, 68.9).correct).toBe(false);
});
```

*For Defective Questions*:
```javascript
test("evaluates go:43485 (GATE CSE 2008 Q79) as defective excluded from scoring", () => {
  const record = {
    type: "MCQ",
    answer: null,
    is_defective: true,
    defective_reason: "Correct value 13 absent from options",
  };

  const result = evaluateAnswer(record, "A");
  expect(result.status).toBe("excluded");
  expect(result.correct).toBe(false);
});
```

#### 2. Service Resolution Tests (`src/services/AnswerService.test.js`)
Verify that `AnswerService.getAnswerForQuestion` resolves the corrected answer key:

```javascript
test("resolves GATE CSE 2024 Set 1 Q31 (go:422811) as MCQ Option D", () => {
  AnswerService.answersByQuestionUid = {
    "go:422811": {
      answer_uid: "v2:1.30.6",
      type: "MCQ",
      answer: "D",
      tolerance: null,
    },
  };
  const answer = AnswerService.getAnswerForQuestion({
    question_uid: "go:422811",
    link: "https://gateoverflow.in/422811/gate-cse-2024-set-1-question-31",
  });
  expect(answer).toEqual({
    answer_uid: "v2:1.30.6",
    type: "MCQ",
    answer: "D",
    tolerance: null,
  });
});
```

#### 3. Run Unit Tests
```powershell
npm run test:unit
```

---

### Phase 5: Pipeline & Schema Validation

Run the QA audit suite to verify data parity and consistency:

```powershell
# 1. Verify question bank parity and format integrity (100% answer coverage)
npm run qa:validate-data

# 2. Run TypeScript checks
npm run typecheck

# 3. If Special Aptitude data was touched:
npm run qa:validate-aptitude
```

---

### Phase 6: Documentation & Memory Protocol

Whenever modifying question data:

1. **Update `docs/CHANGELOG.md`**: Add an entry under the current date following this exact structure:
   ```markdown
   - **Question Data Integrity & Answer Key Correction for `<question_uid>` (DEC-XXX)**:
     - *Context*: Question `<uid>` (`<exam_title>`, `<subject> - <topic>`) was incorrectly evaluating valid Option X because...
     - *Mathematical & Official Derivation*:
       - Detailed mathematical proof, recurrence expansion, graph analysis, or official GATE key citation.
       - Explanation of why alternative options are false.
     - *Resolution*:
       - Updated answer key in `data/answers/manual-answers-patch-v1.json` and base question answer map `data/answers/answers_by_question_uid_v1.json`.
       - Synchronized runtime answer indices `public/data/answers/answers_by_question_uid_v1.json`, `public/data/answers/answers_by_exam_uid_v1.json`, and `public/data/answers/answers_master_v1.json`.
       - Updated question bank `public/questions-with-answers.json`.
       - Regenerated static question detail shard `public/question-detail-shards/<shard>.json` and mock catalog.
       - Added automated unit regression tests in `src/utils/evaluateAnswer.test.js` and `src/services/AnswerService.test.js`.
     - *Verification*: Unit tests passing, `npm run qa:validate-data` clean, `npm run typecheck` clean.
   ```
2. **Update `.llm-memory/decisions.md`**: Record the decision with format:
   `[YYYY-MM-DD] WHAT: Question Data Integrity & Type/Answer Key Correction for <uid> (DEC-XXX) | WHY: <mathematical and official justification>`
3. **Update `.llm-memory/progress.md`** & **`.llm-memory/bugs.md`**: Note the resolved item and updated test counts.
4. **Bump date in `.llm-memory/INDEX.md`**.
5. **Zero-Commit Policy**: Do NOT commit or merge git branches unless explicitly requested by the user.

---

## 4. Track-Specific Guidelines

### A. GATE CSE Track
- Primary question identifiers: `go:<number>` (e.g. `go:422811`).
- Exam year sets: `gate-<year>-set<set>` or `<year>-s<set>`.
- Exam UIDs: `cse:<year>:set<set>:main:q<num>` or `cse:<year>:main:q<num>` (e.g. `cse:2024:set1:main:q31`).
- Public shards: `public/question-detail-shards/<year>-s<set>.json`.

### B. GATE DA Track
- Primary question identifiers: `da:<year>-s<set>-q<num>`.
- Ingestion scripts: `scripts/da-pipeline/merge-da.mjs` and `scripts/da-pipeline/build-da-artifacts-cli.mjs`.
- Shards & Catalogs: `public/mock_catalog_da_v1.json`.
- GateOverflow solution links are resolved via `src/utils/solutionLink.js` and enriched via `scripts/da-pipeline/import-da-2026.mjs`.

### C. Special Aptitude Track
- Question identifiers: `APT-ENG-...`, `APT-QNT-...`, `APT-SPA-...`.
- Embedded answers: Stored directly in `public/questions-with-answers.json` under `answer_meta` (resolved with source `aptitude_embedded`).
- Image assets: Local WebP in `public/aptitude-images/`.
- External solution URLs are guarded by `src/utils/solutionLink.js` (`isSpecialAptitudeQuestion`).

---

## 5. Common Gotchas & Quality Checklist

- [ ] **MSQ Answer Array**: Multiple correct options MUST be stored as a JSON array of uppercase strings (e.g. `["A", "B", "C"]`), NEVER as a comma-separated string (`"A, B, C"`).
- [ ] **NAT Numeric Tolerance**: Use `"tolerance": { "abs": 0.01 }` for symmetric tolerance or `"tolerance": { "lower": min, "upper": max }` for range boundaries. Never use `"range": [min, max]`.
- [ ] **Dual Question UID Answer Maps**: Always update both `data/answers/answers_by_question_uid_v1.json` and `public/data/answers/answers_by_question_uid_v1.json`.
- [ ] **Exam & Master Indices Sync**: Update `public/data/answers/answers_by_exam_uid_v1.json` and `public/data/answers/answers_master_v1.json` to prevent stale resolution.
- [ ] **Nested `answer_meta`**: In `public/questions-with-answers.json`, update `answer_meta.answer`, `answer_meta.type`, and `answer_meta.tolerance`.
- [ ] **LaTeX Double Backslashes**: In JSON strings, write `\\frac`, `\\times`, `\\begin{bmatrix}`, `\\Theta`, `\\le`, `\\ge`, never raw unescaped `\frac`.
- [ ] **Options Array Sync**: When changing a question from NAT to MCQ/MSQ, ensure the `<ol class="qa-options">` list in `question` HTML has matching `data-option-label="A"`, `"B"`, `"C"`, `"D"` attributes.
- [ ] **Evaluator Return Signature**: `evaluateAnswer(record, input)` returns `{ status: "evaluated", correct: boolean }`, NOT `.isCorrect`.
- [ ] **Mock Catalog Integrity**: Running `node scripts/build-public-artifacts.mjs` registers scorable questions into `mock_catalog_v1.json` with correct marks and negative marking penalties (1/3 mark penalty for 1-mark MCQ, 2/3 mark penalty for 2-mark MCQ, 0 negative marks for MSQ and NAT).
- [ ] **No Git Stamp Churn**: `scripts/build-public-artifacts.mjs` preserves `generatedAt` on unchanged shards. If git status shows all shards modified, check for line-ending differences (CRLF vs LF).
- [ ] **Defective Question Handling**: If a question has no correct option or conflicting statements, mark it as `is_defective: true`, `answer: null`, and document the `defective_reason`. Exclude it from mock tests and remove it from `unsupported_question_uids_v1.json` if present.
- [ ] **No Unrequested Commits**: Never commit or merge git branches unless explicitly requested by the user.
