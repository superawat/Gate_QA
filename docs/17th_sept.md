You are working on GateQA.

## Bug: Unsolved Questions Become Solved Again

User report:

> “You can't unsolve a question. Like the bookmark thing previously, it comes back after some time.”

This issue has been manually verified and confirmed to exist.

Do NOT spend time determining whether the bug is reproducible. Treat the bug as confirmed and focus directly on finding the root cause and implementing a robust fix.

The behavior is similar to the previously fixed bookmark resurrection issue, where stale synchronized state reintroduced a state that the user had explicitly removed.

---

# 1. Objective

Fix the solved/unsolved question state so that when a user explicitly unsolves a question:

```text
Solved → Unsolved
```

the unsolved state remains authoritative across:

* Navigation
* Page refresh
* Local persistence
* Cloud synchronization
* Login/session restoration
* Background synchronization
* Backup/restore
* Context/state refresh
* Any other mechanism that reconstructs solved-question state

The fix must prevent stale solved state from being resurrected.

Do not merely modify the UI.

The persisted state and synchronization logic must correctly represent the user's explicit unsolve action.

---

# 2. Trace the complete solved-state lifecycle

First inspect the existing architecture and identify every place involved in solved-question state.

Trace:

```text
Question solved
    ↓
Solved state stored
    ↓
Local persistence
    ↓
Cloud/Supabase persistence
    ↓
State synchronization
    ↓
Question/context refresh
    ↓
Solved state reconstructed
```

Then trace:

```text
Question unsolved
    ↓
Solved state removed
    ↓
Local persistence
    ↓
Cloud/Supabase persistence
    ↓
State synchronization
    ↓
Question/context refresh
    ↓
Solved state reconstructed
```

Identify where the two paths differ.

Inspect relevant:

* `FilterContext`
* `cloudSyncManager`
* solved-question state utilities
* localStorage persistence
* Supabase `user_progress`
* backup/restore logic
* question result storage
* answer evaluation state
* mock/practice state
* any solved-question caches
* any synchronization/merge utilities

Do not assume these exact files contain the issue. Trace the actual implementation.

---

# 3. Find the resurrection mechanism

The central question is:

> Where does the old solved state come from after the user has explicitly unsolved the question?

Look for merge logic similar to:

```js
const solved = new Set([
  ...localSolved,
  ...cloudSolved
]);
```

or:

```text
local solved ∪ cloud solved
```

If solved states are merged additively, determine whether an explicit unsolve operation is indistinguishable from "this question has no local solved record."

This distinction is critical:

```text
undefined / absent
    ≠
explicitly unsolved
```

If the architecture currently represents only positive solved records, determine how an explicit removal can be represented so that stale cloud/local state cannot restore it.

---

# 4. Apply the same conceptual protection used for bookmarks

The bookmark bug was solved using Last-Write-Wins tombstone removal sets.

Investigate whether the solved-state system requires an equivalent mechanism.

Potential architecture:

```text
solved_questions
solved_question_removals
```

with merge behavior conceptually equivalent to:

```text
(localSolved ∪ cloudSolved)
    \ 
(localSolvedRemovals ∪ cloudSolvedRemovals)
```

However, do not blindly copy the bookmark implementation.

First determine:

* How solved questions are currently stored.
* Whether solved state contains timestamps.
* Whether there are multiple solved-state sources.
* Whether question results themselves imply solved state.
* Whether the existing data model can support tombstones cleanly.
* Whether an explicit unsolve needs to preserve additional metadata.

If a tombstone/removal-set design is appropriate, implement it consistently with the existing synchronization architecture.

---

# 5. Last-Write-Wins requirements

The important requirement is that an explicit unsolve must be newer than an older solved state.

For example:

```text
10:00  Question solved
10:05  Question unsolved
10:10  Old cloud snapshot arrives
```

The 10:05 unsolve must remain authoritative.

Also support:

```text
Question solved
    ↓
Question unsolved
    ↓
Question solved again
```

Re-solving must work normally.

If using tombstones, re-solving must remove/purge the corresponding removal marker, similar to the bookmark fix.

Conceptually:

```text
solve:
    solved.add(questionId)
    solvedRemovals.delete(questionId)

unsolve:
    solved.delete(questionId)
    solvedRemovals.add(questionId)
```

Ensure the actual implementation follows GateQA's existing data model rather than blindly adopting this pseudocode.

---

# 6. Audit all three state layers

Investigate whether solved state exists independently in:

### Local state

* React state/context
* localStorage
* IndexedDB
* sessionStorage
* cached state

### Cloud state

* Supabase
* `user_progress`
* any user-state tables
* synchronization payloads

### Derived state

* FilterContext
* question metadata
* practice progress
* insights
* streak/activity calculations
* solved-only filters
* custom mock builder
* question palette/review state

A fix is incomplete if one layer continues to reintroduce stale solved state.

---

# 7. Investigate `refreshProgressState`

Because bookmark resurrection previously involved state refresh, specifically inspect any equivalent solved-state refresh flow.

Determine:

* When progress state is refreshed.
* What data sources it reads.
* Whether it merges or replaces state.
* Whether stale cloud data can overwrite current local state.
* Whether refresh is triggered after login.
* Whether refresh happens periodically.
* Whether refresh happens after navigation.
* Whether refresh happens after other user actions.

Ensure a refresh cannot turn:

```text
unsolved
```

back into:

```text
solved
```

because of stale data.

---

# 8. Check question ID consistency

Ensure solved and unsolved operations use the same canonical question UID.

Test across all supported question categories/tracks:

* GATE CSE/IT
* GATE DA
* General Aptitude
* Special Aptitude, if applicable

Check for:

* Different ID formats
* Legacy IDs
* Prefix differences
* Normalization differences
* Duplicate representations

A question should not remain solved under an alternate identifier after being unsolved under its canonical identifier.

---

# 9. Check backup and restore

Audit backup/restore behavior.

Specifically test:

```text
Solved → Unsolved → Backup
```

and:

```text
Solved → Unsolved → Sync → Refresh
```

Also test:

```text
Solved → Unsolved → Re-login
```

and:

```text
Solved → Unsolved → Restore old backup
```

Determine the intended behavior for restoring an explicitly old backup.

Do not silently allow an older backup to overwrite a newer explicit unsolve unless that is intentionally part of GateQA's documented behavior.

---

# 10. Re-solving behavior

This is mandatory.

After fixing unsolve, verify:

```text
Solve
↓
Unsolve
↓
Solve again
↓
Unsolve again
```

works repeatedly.

If tombstones are used, ensure they do not permanently block re-solving.

The expected state transitions are:

```text
UNSOLVED
   ↓ solve
SOLVED
   ↓ unsolve
UNSOLVED
   ↓ solve
SOLVED
   ↓ unsolve
UNSOLVED
```

No state should become permanently stuck.

---

# 11. Do not break existing solved functionality

The fix must preserve:

* Solved Only filtering
* Practice progress
* Custom Builder solved-question policy
* Question status indicators
* Progress tracking
* Insights/statistics
* Streak/activity calculations
* Mock test behavior
* Backup/import/export
* Login synchronization

Do not modify the definition of what qualifies as a solved question unless the investigation proves that definition itself is incorrect.

---

# 12. Database migration

If the current Supabase schema does not support explicit solved removals and a database change is required:

* Create an appropriate migration.
* Follow the project's existing migration conventions.
* Keep the schema backward-compatible where possible.
* Ensure existing users' solved-question data remains intact.
* Ensure existing data is not accidentally converted into unsolved state.
* Ensure synchronization works for users who have not yet interacted with the new removal mechanism.

Do not delete or rewrite existing solved records unnecessarily.

---

# 13. Regression tests

Add comprehensive regression tests.

At minimum test:

### Basic behavior

* Solving a question marks it solved.
* Unsolving a question removes solved status.
* Unsolved state persists after refresh.

### Resurrection prevention

* Stale local solved state cannot resurrect an unsolved question.
* Stale cloud solved state cannot resurrect an unsolved question.
* Local/cloud synchronization respects explicit unsolve.
* `refreshProgressState` does not restore stale solved state.

### Re-solving

* Solve → unsolve → solve works.
* Solve → unsolve → solve → unsolve works repeatedly.
* Removal markers are correctly cleared when re-solving.

### Persistence

* localStorage persistence
* Supabase synchronization
* login/session restoration
* backup/restore where applicable

### Question categories

* CSE/IT
* DA
* Aptitude tracks where solved-state tracking applies

Use mocked data/timestamps where possible. Do not make tests wait for real synchronization delays.

---

# 14. Migration/backward compatibility tests

If a new removal/tombstone field is introduced, test:

```text
Existing user with old data
        ↓
New application version
        ↓
User unsolves question
        ↓
Sync
        ↓
Refresh
        ↓
Still unsolved
```

Also verify:

```text
Existing solved question
        ↓
No removal record
        ↓
Still solved
```

Existing users must not lose their solved progress.

---

# 15. Performance considerations

The solved-question collection may be large.

Ensure the solution does not cause:

* Excessive localStorage writes
* Large repeated serialization
* Excessive Supabase requests
* Expensive Set reconstruction
* Re-render loops
* Synchronization loops

Follow the same performance patterns already established for bookmark synchronization where appropriate.

---

# 16. Acceptance criteria

The bug is considered fixed only when:

* [x] A user can solve a question.
* [x] A user can unsolve a question.
* [x] The unsolved state persists.
* [x] Stale cloud data cannot resurrect the solved state.
* [x] Stale local data cannot resurrect the solved state.
* [x] Navigation does not resurrect the solved state.
* [x] Refresh does not resurrect the solved state.
* [x] Login/session restoration does not resurrect the solved state.
* [x] Background synchronization does not resurrect the solved state.
* [x] Re-solving works normally.
* [x] Repeated solve/unsolve cycles work.
* [x] Existing solved questions remain intact.
* [x] Solved Only functionality continues working.
* [x] Backup/sync behavior remains correct.
* [x] All relevant question tracks continue working.
* [x] Regression tests cover the resurrection bug.
* [x] Full test suite passes.
* [x] Typecheck passes.
* [x] Production build passes.

---

# Final engineering report

## Root cause

GateQA's cloud sync engine historically utilized an additive-only union merge for solved questions (`Set.union(localSolved, cloudSolved)`). When a user explicitly marked a question as unsolved, `toggleSolved` removed the question UID from local storage (`gate_qa_solved_questions`), but the absence of a record locally was indistinguishable from "this question has not yet been synced locally". On the next cloud sync or background sync, the question still residing in Supabase's `user_progress.solved_questions` was union-merged back into local storage, resurrecting the solved status on the client.

## Solution

Implemented a conflict-free replicated data type (**LWW-Element-Set CRDT**) for solved questions across all three tracks (GATE CSE, General Aptitude, and GATE DA):
1. **Timestamped Elements**: Each question UID is associated with an explicit solve timestamp $T_{\text{solve}}$ and an unsolve tombstone timestamp $T_{\text{remove}}$.
2. **Membership Rule**: A question is solved if and only if $T_{\text{solve}} > T_{\text{remove}}$.
3. **Resurrection Prevention**: When a user explicitly un-solves a question, $T_{\text{remove}} = \text{Date.now()}$. When merging with cloud data, $T_{\text{remove}} > T_{\text{cloudSolve}}$, so the stale cloud record is filtered out and cannot resurrect the question.
4. **No Permanent Tombstone Trap**: When the user re-solves the question, $T_{\text{solve}} = \text{Date.now()} > T_{\text{remove}}$, superseding the previous removal and purging the tombstone. Unlimited `Solve → Unsolve → Solve → Unsolve` transitions work reliably.
5. **Import Safeguard (Gap 1 Fix)**: In `ProgressManager.jsx` and `workspaceFile.js`, workspace imports clear any local removal tombstones for incoming solved questions, ensuring that imported backups do not get re-unsolved on subsequent syncs.

## Files changed

1. **`supabase/migrations/20260917000000_add_solved_removals.sql`**: Added nullable JSONB columns (`solved_removals`, `solved_timestamps`, `aptitude_solved_removals`, `aptitude_solved_timestamps`, `da_solved_removals`, `da_solved_timestamps`) to `user_progress`.
2. **`src/utils/cloudSyncManager.js`**: Added storage keys, snapshot capture, local storage readers, `extractTimestampMap`, `mergeLwwElementSet`, resilient multi-tier Supabase upsert payloads, and write-backs.
3. **`src/utils/cloudSyncManager.test.js`**: Added 6 new unit tests verifying LWW element set merge, unsolve persistence, re-solving, track isolation, and full sync integration.
4. **`src/contexts/FilterContext.tsx`**: Added removal and timestamp maps to state, mount hydration, storage write-back effect, `toggleSolved`, `markQuestionsSolved`, and `refreshProgressState`.
5. **`src/contexts/FilterContext.test.jsx`**: Added 4 unit tests verifying unsolve tombstone writes, re-solve tombstone purging, batch mark solved updates, and event-driven rehydration.
6. **`src/utils/trackerState.ts`**: Added removal timestamp checks in `loadTrackerDataset` to prevent historical mock test submissions from resurrecting questions explicitly unsolved after the mock test.
7. **`src/utils/trackerState.test.ts`**: Added regression test ensuring mock history respects subsequent unsolve tombstones.
8. **`src/utils/workspaceFile.js`**: Included `solvedRemovals` and `solvedTimestamps` in `buildWorkspaceSnapshot` and updated `importWorkspaceSnapshot` with tombstone purging.
9. **`src/utils/workspaceFile.test.js`**: Added verification for removal and timestamp serialization/deserialization.
10. **`src/utils/localStorageState.ts`**: Added removal and timestamp keys to `USER_STATE_STORAGE_KEYS` and `APTITUDE_USER_STATE_STORAGE_KEYS`.
11. **`src/components/ProgressManager/ProgressManager.jsx`**: Added Gap 1 fix to clear tombstones for imported solved IDs on both `replace` and `merge` strategies.

## Database changes

Migration file: [`supabase/migrations/20260917000000_add_solved_removals.sql`](file:///supabase/migrations/20260917000000_add_solved_removals.sql)
New nullable columns on `public.user_progress`:
* `solved_removals` (`jsonb`)
* `solved_timestamps` (`jsonb`)
* `aptitude_solved_removals` (`jsonb`)
* `aptitude_solved_timestamps` (`jsonb`)
* `da_solved_removals` (`jsonb`)
* `da_solved_timestamps` (`jsonb`)

## Tests

```text
Targeted tests: 39 passed / 0 failed (cloudSyncManager.test.js)
Targeted tests: 31 passed / 0 failed (FilterContext.test.jsx)
Targeted tests: 33 passed / 0 failed (trackerState.test.ts)
Targeted tests: 5 passed / 0 failed (workspaceFile.test.js)
Full unit tests: 1043 passed / 0 failed across 84 test suites (6 skipped)
Typecheck: PASS (tsc -p tsconfig.json --noEmit exited with code 0)
Build: PASS (vite production build and static SEO prerender exited with code 0)
```

## Verification

Explicitly verified flows in automated test suites:
* **Solve → Unsolve → Refresh**: Verified in `FilterContext.test.jsx` (tombstone written to `localStorage`, questions remain unsolved after state reload).
* **Solve → Unsolve → Sync → Refresh**: Verified in `cloudSyncManager.test.js` (sync retains tombstone, filters out stale cloud solved ID, writes back unsolved state).
* **Solve → Unsolve → Re-login / Sync Complete**: Verified in `FilterContext.test.jsx` (`gateqa:sync-complete` rehydration respects removal tombstones).
* **Solve → Unsolve → Solve again**: Verified in `cloudSyncManager.test.js` and `FilterContext.test.jsx` ($T_{\text{solve}} > T_{\text{remove}}$ purges tombstone, question is marked solved).
* **Solve → Unsolve → Solve → Unsolve**: Verified repeatedly across multiple CRDT cycles without permanent tombstone lock-in.


---

# 17. Engineering Implementation Plan

## 17.1 Mathematical Foundation: Last-Write-Wins Element-Set (LWW-Element-Set)

To avoid the "Permanent Tombstone Trap" (where re-solving is killed by an old cloud tombstone) and prevent stale cloud solved arrays from resurrecting unsolved questions, we model solved questions using a state-based CRDT **LWW-Element-Set**:

For each question $q$ in the universe of questions across local and cloud replicas:
1. $T_{\text{solve}}(q) = \max(T_{\text{localSolve}}(q), T_{\text{cloudSolve}}(q), \text{isSolvedInEither} ? 1 : 0)$
2. $T_{\text{remove}}(q) = \max(T_{\text{localRemove}}(q), T_{\text{cloudRemove}}(q), 0)$
3. **Membership Rule**:
   $$q \in \text{MergedSolved} \iff T_{\text{solve}}(q) > T_{\text{remove}}(q)$$
4. **Tombstone Retention Rule**:
   $$q \in \text{MergedRemovals} \iff T_{\text{remove}}(q) \ge T_{\text{solve}}(q) \land T_{\text{remove}}(q) > 0$$

### Key Properties:
* **Commutative & Associative**: Independent of sync order or device arrival sequence.
* **Idempotent**: Repeated syncs produce identical state.
* **Cyclic Safety**: Supports infinite transitions:
  $$\text{UNSOLVED} \xrightarrow{T_1} \text{SOLVED} \xrightarrow{T_2} \text{UNSOLVED} \xrightarrow{T_3} \text{SOLVED} \xrightarrow{T_4} \dots$$
* **100% Backward Compatible**: If a user has existing solved questions with no timestamps, $T_{\text{solve}}$ defaults to $1$. The first explicit unsolve assigns $T_{\text{remove}} = \text{Date.now()} \gg 1$, permanently winning without data loss.

---

## 17.2 Architecture & Data Contracts

### 1. Storage Keys (localStorage)
* **GATE CSE / IT**:
  * `gate_qa_solved_questions`: `string[]` (existing, preserved for all downstream consumers)
  * `gate_qa_solved_removals`: `Record<string, number>` (mapping `questionUid -> timestampMs`)
  * `gate_qa_solved_timestamps`: `Record<string, number>` (mapping `questionUid -> timestampMs`)
* **General Aptitude**:
  * `gateqa-apt-solved-questions`: `string[]`
  * `gateqa-apt-solved-removals`: `Record<string, number>`
  * `gateqa-apt-solved-timestamps`: `Record<string, number>`
* **GATE DA**:
  * `gate_qa_da_solved_questions`: `string[]`
  * `gate_qa_da_solved_removals`: `Record<string, number>`
  * `gate_qa_da_solved_timestamps`: `Record<string, number>`

### 2. Supabase Contract (`user_progress` Table)
* `solved_questions`: `jsonb` (`string[]`)
* `solved_removals`: `jsonb` (`Record<string, number>`)
* `solved_timestamps`: `jsonb` (`Record<string, number>`)
* `aptitude_solved`: `jsonb` (`string[]`)
* `aptitude_solved_removals`: `jsonb` (`Record<string, number>`)
* `aptitude_solved_timestamps`: `jsonb` (`Record<string, number>`)
* `da_solved`: `jsonb` (`string[]`)
* `da_solved_removals`: `jsonb` (`Record<string, number>`)
* `da_solved_timestamps`: `jsonb` (`Record<string, number>`)

---

## 17.3 Phase-by-Phase Execution Plan

### Phase 1: Database Migration
* **File**: `supabase/migrations/20260917000000_add_solved_removals.sql`
* Add nullable JSONB columns for `solved_removals`, `aptitude_solved_removals`, `da_solved_removals`, `solved_timestamps`, `aptitude_solved_timestamps`, and `da_solved_timestamps`.
* Default to `NULL` (treated as `{}` for backward compatibility with existing rows).
* Add detailed SQL column documentation comments.

### Phase 2: Core Cloud Sync Engine (`src/utils/cloudSyncManager.js`)
* **Snapshot**: Update `createPreMergeSnapshot` to include solved removals and timestamp keys.
* **Storage Reader**: Update `readLocalData` to parse `solvedRemovals`, `solvedTimestamps` (with fallback parsing for array formats `['go:1']` and dictionary formats `{'go:1': ms}`).
* **LWW Merge Function**:
  Implement `mergeLwwElementSet(localSolved, cloudSolved, localRemovals, cloudRemovals, localTimestamps, cloudTimestamps)`:
  * Computes `maxSolveTime` and `maxRemoveTime` per question UID.
  * Outputs `mergedSolved` (`string[]`) and `mergedRemovals` (`Record<string, number>`) and `mergedTimestamps` (`Record<string, number>`).
  * Subtracts removal tombstones from legacy fallback buckets (`cloudProgress.aptitude_solved`, `cloudProgress.da_solved`).
* **Upsert Payload**: Include removals and timestamps in Tier 1 payload.
* **Resilient Fallback**: Ensure Tier 2 and Tier 3 catch blocks cleanly omit or encapsulate the new columns if executing against an unmigrated database.
* **Local Persistence**: Write merged solved arrays, removals maps, and timestamps maps to `localStorage` before firing `gateqa:sync-complete`.

### Phase 3: FilterContext & React State Management (`src/contexts/FilterContext.tsx`)
* **State Hooks**:
  * `solvedRemovalMap`, `aptitudeSolvedRemovalMap`, `daSolvedRemovalMap`
  * `solvedTimestampMap`, `aptitudeSolvedTimestampMap`, `daSolvedTimestampMap`
* **Initialization & Hydration**:
  * Hydrate maps from `localStorage` on initial mount.
  * Sync state to `localStorage` in `useEffect`.
* **Action: `toggleSolved(questionOrId)`**:
  * Normalize question UID using canonical `getQuestionTrackingId(questionOrId, answerService)`.
  * Detect target track (DA, Aptitude, CSE).
  * If currently solved (Unsolving):
    * Filter UID out of solved array.
    * Add UID to removal map: `removals[uid] = Date.now()`.
    * Delete UID from timestamp map: `delete timestamps[uid]`.
    * Call `enqueueChange('SOLVE', { questionUid, isSolved: false })` to trigger debounced sync.
  * If currently unsolved (Solving / Re-solving):
    * Append UID to solved array.
    * Add UID to timestamp map: `timestamps[uid] = Date.now()`.
    * Delete UID from removal map: `delete removals[uid]`.
    * Call `enqueueChange('SOLVE', { questionUid, isSolved: true })`.
* **Action: `markQuestionsSolved(questionOrIds)`**:
  * For all input UIDs:
    * Append to solved array.
    * Record `timestamps[uid] = Date.now()`.
    * Purge from removal map: `delete removals[uid]`.
    * Enqueue batch change: `enqueueChange('SOLVE', { questionUids })`.
* **Event Listener: `refreshProgressState`**:
  * Re-read `solved_questions`, `solved_removals`, and `solved_timestamps` from `localStorage` on `gateqa:sync-complete`.

### Phase 4: Preparation Tracker & Historical Mock Safeguards (`src/utils/trackerState.ts`)
* In `trackerState.ts` (`loadTrackerDataset`), read `gate_qa_solved_removals`, `gateqa-apt-solved-removals`, and `gate_qa_da_solved_removals`.
* In `registerAttempt` (which processes mock history):
  * Check if the question exists in the removal tombstone map with `removalTimestamp > mockSession.submittedAt`.
  * If the user explicitly unsolved the question after the mock test was taken, do NOT re-add the question to `mergedSolved`.

### Phase 5: Workspace Backup & Progress Manager (`workspaceFile.js` & `ProgressManager.jsx`)
* **Workspace Snapshots** (`workspaceFile.js`): Include `solvedRemovals` and `solvedTimestamps` in `gate` and `aptitude` blocks.
* **Progress Manager** (`ProgressManager.jsx`):
  * In `handleExportJson`: export `solvedRemovals` and `bookmarkRemovals`.
  * In `handleImportConfirm`:
    * If `strategy === 'replace'`: overwrite removals with imported removals (or reset).
    * If `strategy === 'merge'`: merge removal maps using `Math.max` timestamps.

### Phase 6: Automated Verification & Regression Testing
1. **Targeted Unit Tests** (`src/utils/cloudSyncManager.test.js`):
   * Test 1: Explicit unsolve locally is NOT resurrected by stale cloud `solved_questions`.
   * Test 2: Cloud removal tombstone propagates to local client.
   * Test 3: Solve $\to$ Unsolve $\to$ Solve cycle: re-solving purges tombstone and is NOT killed by cloud removal.
   * Test 4: Solve $\to$ Unsolve $\to$ Solve $\to$ Unsolve cycle: works indefinitely across multiple syncs.
   * Test 5: Track isolation: Aptitude and DA removals do not interfere with CSE.
   * Test 6: Legacy cloud row compatibility: `NULL` removals in cloud treated gracefully without data loss.
2. **Context Tests** (`src/contexts/FilterContext.test.jsx`):
   * Test 1: `toggleSolved` unsolve writes tombstone to `localStorage`.
   * Test 2: `toggleSolved` re-solve clears tombstone and records solve timestamp.
   * Test 3: `markQuestionsSolved` clears tombstones for batch mock test questions.
   * Test 4: `gateqa:sync-complete` does not resurrect unsolved question in React state.
3. **Full Quality Gate**:
   * `npm run test:unit` (all unit test suites pass).
   * `npm run typecheck` (TypeScript validation clean, 0 errors).
   * `npm run build` (production build passes).
