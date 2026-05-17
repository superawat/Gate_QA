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

### Issue Details / Notes
*(Add longer descriptions, scripts, or debug notes for open issues here if the table is too small)*

- **CE-001**: Needs manual verification against the official GATE 2009 answer key.

---

## ✅ Resolved Issues

| Issue ID | Question UID / Year | Subject | Issue Type | Resolution | Resolved Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CE-000` | `go:357428` | CS | Missing Answer | Added verified NAT answers `205` / `820` manually to registry. | 2026-05-08 |
| `CE-002` | `go:441` (2008) | Discrete Mathematics | Missing Options | Added the missing `None of these` option, mapped verified answer `E`, enabled five-option MCQ rendering/evaluation, and removed the UID from unsupported answers. | 2026-05-14 |
| `CE-003` | `Multiple Aptitude UIDs` | Aptitude Maths | Formatting | Added a Python math-content quality gate that strips source junk, repairs safe spacing joins, quarantines 2,862 unreadable math rows, and regenerated the sharded aptitude bank at 29,524 questions. | 2026-05-14 |

---

## Issue Type Categories
To keep tracking organized, use the following standardized issue types:
- **Mismatch**: The provided answer key completely contradicts the question or explanation.
- **Missing Options**: An MCQ or MSQ question was parsed without its A/B/C/D options.
- **Missing Answer**: The question has no associated answer record.
- **Image Failure**: An image failed to download, convert to WebP, or render correctly.
- **Formatting**: MathJax parsing failures, broken HTML tables, or unreadable formatting.
- **Legacy Format Drift**: Issues caused by very old (pre-2010) paper structures that the pipeline cannot safely parse.
