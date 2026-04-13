# PYQ GateOverflow Recheck Plan

This runbook verifies that every GateOverflow-backed PYQ in the published bank:

- exists in the JSON bank
- is covered by the existing question-presence audits
- has an answer mapping when expected

Known unsupported answer gaps remain tracked exceptions. They are reported, but they are not treated as clean-answer coverage.

## Source of Truth

- Questions: `public/questions-with-answers.json`
- Answer lookup: `public/data/answers/answers_by_question_uid_v1.json`
- Known unsupported exceptions: `public/data/answers/unsupported_question_uids_v1.json`

## Commands

Run the full recheck:

```bash
npm run qa:recheck-gateoverflow-pyqs
```

The command runs:

```bash
npm run qa:audit-historical-papers
npm run qa:audit-pre-2010-gateoverflow
node scripts/qa/gateoverflow-answer-coverage.js
node scripts/qa/assert-gateoverflow-recheck.js
```

Notes:

- `qa:audit-pre-2010-gateoverflow` compares the `1987-2009` bank against live GateOverflow year tags.
- That live audit is robots-aware and can take a while because it intentionally crawls slowly.
- `gateoverflow-answer-coverage.js` only includes rows that resolve to a numeric GateOverflow question ID through `question_uid` or `link`.

## Artifacts To Inspect

- `artifacts/review/historical-paper-audit.json`
- `artifacts/review/pre-2010-gateoverflow-audit.json`
- `artifacts/review/gateoverflow-answer-coverage.json`

The answer-coverage report contains:

- overall totals
- per-year counts
- per-paper counts for `2010+`
- sample actionable gaps
- sample exception gaps

## Pass / Fail Rules

The recheck is clean only when all of the following are true:

- `historical-paper-audit.json`
  - `papers_with_missing_slots = 0`
  - `papers_with_duplicate_slots = 0`
  - `papers_with_malformed_exam_uids = 0`
- `pre-2010-gateoverflow-audit.json`
  - `mismatching_question_counts = 0`
  - `mismatching_question_labels = 0`
- `gateoverflow-answer-coverage.json`
  - `missing_answer_actionable = 0`

Additional hard-fail sanity checks used by the combined command:

- `historical-paper-audit.json`
  - `questions_without_paper_meta = 0`
- `pre-2010-gateoverflow-audit.json`
  - `years_with_fetch_errors = 0`

## Exception Handling

- `answered`
  - the resolved GateOverflow `question_uid` exists in `answers_by_question_uid_v1.json`
- `missing_answer_exception`
  - the resolved GateOverflow `question_uid` is listed in `unsupported_question_uids_v1.json`
- `missing_answer_actionable`
  - the row is GateOverflow-backed, but it is not in the answer map and not in the exception list

If a question has a malformed or non-GateOverflow `question_uid` but the `link` resolves to `gateoverflow.in/<id>`, the audit uses the link-derived `go:<id>` UID.

## Expected Outcome

- question-presence mismatches are surfaced by the existing historical audits
- answer-coverage mismatches are surfaced by `gateoverflow-answer-coverage.json`
- the combined npm command exits non-zero when question-presence checks fail or when actionable answer gaps remain
