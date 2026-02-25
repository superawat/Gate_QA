# Data Policy

GateQA stores user progress locally in the browser.
No personal account or server-side profile is used.

## What is stored

In localStorage:

- `gate_qa_solved_questions`
- `gate_qa_bookmarked_questions`
- `gate_qa_progress_metadata`
- `gateqa_progress_v1` (attempt metadata)

## What is not stored

- no user login data
- no server-side progress copy
- no cloud sync

## When progress can be lost

- private/incognito session closes
- browser storage/site data cleared
- using different browser/device (no sync)
- storage quota exceeded and write fails

## Backup and transfer (official flow)

From filter sidebar -> Progress section:

1. Click `Export JSON` to download progress backup.
2. Move file to target device/browser.
3. Click `Import` on target device.
4. Choose strategy:
   - `Merge`: union with existing progress
   - `Replace`: overwrite existing progress

## Import file requirements

- valid JSON
- includes arrays:
  - `solvedQuestions`
  - `bookmarkedQuestions`
- optional `schemaVersion` is checked and warnings are shown for newer schema

## CSV export note

- `Export CSV` is for analysis/view only.
- CSV is not importable.

## Safety guidance

- export JSON backups regularly
- avoid incognito/private mode when tracking progress
- verify persistence by reloading after major sessions
- keep at least one offline backup copy of JSON export

## Implementation references

- UI policy text: `src/components/Footer/DataPolicyModal.jsx`
- import/export logic: `src/components/ProgressManager/ProgressManager.jsx`
- storage helpers: `src/utils/localStorageState.js`
