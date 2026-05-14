# Content & Data Error Tracking

This file serves as the central hub for logging and tracking all known data-level issues within the practice platform's question bank. Use this document to record mismatches between questions and answers, missing options, parsing errors, image failures, or any other content-related regressions.

## How to use this tracker
When you encounter a content issue (e.g., an incorrect answer key, missing data from GateOverflow, or a corrupted question format), add an entry to the **Open Issues** table. 
When the issue is resolved in the data pipeline or manual overrides, move it to the **Resolved Issues** table.

---

## 🔴 Open Issues

| Issue ID | Question UID / Year | Subject | Issue Type | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CE-001` | *Example: 2009-CS-15* | *Example: CS* | *Mismatch* | *Answer key says A, but explanation says B.* | Investigating |
| `CE-002` | `go:441` (2008) | Discrete Mathematics | Missing Options | There are no options to select from. | Open |
| `CE-003` | `Multiple Aptitude UIDs` | Aptitude Maths | Formatting | Severe PDF parsing artifacts: missing spaces, garbage text, broken formulas. | Open |

### Issue Details / Notes
*(Add longer descriptions, scripts, or debug notes for open issues here if the table is too small)*

- **CE-001**: Needs manual verification against the official GATE 2009 answer key.
- **CE-002 (`go:441`)**: The question does not have the correct option ("None of these"). The existing options are:
  - A. If everything is a FSA, then there exists an equivalent PDA for everything.
  - B. It is not the case that for all y if there exist a FSA then it has an equivalent PDA.
  - C. Everything is a FSA and has an equivalent PDA.
  - D. Everything is a PDA and has an equivalent FSA.
  - **Correct Answer Logic**: `∀x(fsa(x)⟹∃y(pda(y)∧ equivalent(x,y)))`. The platform needs to either inject a "None of these" option or map the correct logic to solve this problem.
- **CE-003**: Widespread formatting corruption in the newly ingested SSC Aptitude PDFs. Symptoms include missing spaces ("forRs.", "yearperiod,withtheamounttobepaid"), trailing garbage text on options ("eduquity-based pattern (ebp) Questions", "Graduate Level 29/08/2025"), and completely destroyed mathematical equations/relations (`+ = + 7 3 6 3`). This requires a pipeline-level fix in Python to improve PDF text extraction heuristics.

---

## ✅ Resolved Issues

| Issue ID | Question UID / Year | Subject | Issue Type | Resolution | Resolved Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CE-000` | `go:357428` | CS | Missing Answer | Added verified NAT answers `205` / `820` manually to registry. | 2026-05-08 |

---

## Issue Type Categories
To keep tracking organized, use the following standardized issue types:
- **Mismatch**: The provided answer key completely contradicts the question or explanation.
- **Missing Options**: An MCQ or MSQ question was parsed without its A/B/C/D options.
- **Missing Answer**: The question has no associated answer record.
- **Image Failure**: An image failed to download, convert to WebP, or render correctly.
- **Formatting**: MathJax parsing failures, broken HTML tables, or unreadable formatting.
- **Legacy Format Drift**: Issues caused by very old (pre-2010) paper structures that the pipeline cannot safely parse.
