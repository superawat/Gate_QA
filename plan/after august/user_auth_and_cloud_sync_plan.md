# GateQA User Authentication & Cloud Data Sync Plan

> **Design Principle**: A student's months of study data is sacred. Every mechanism
> in this plan exists to guarantee that **no data is ever lost** — not during
> sign-in, not during sign-out, not during network failure, not when switching
> devices, and not even when clearing their browser.

---

## 1. Executive Summary & Philosophy

### Core Principles (Non-Negotiable)

| Principle | Guarantee |
|:---|:---|
| **Zero Friction** | Guest Mode remains the default. No login is ever required. Users can practice, bookmark, and take notes without creating an account. |
| **Zero Data Loss** | A user's local data is **never deleted or overwritten** — only merged and backed up. |
| **Zero Speed Degradation** | Question text, options, explanations, and search indices stay pre-rendered and served as static files from GitHub Pages. Auth/sync is a background layer only. |
| **Zero Infrastructure Cost** | Built on Supabase Free Tier ($0/month for up to 50,000 Monthly Active Users and 500 MB PostgreSQL storage). |
| **Offline First** | The app works 100% offline. Cloud sync is attempted silently in the background; if it fails, the app continues using `localStorage` with zero user impact. |

---

## 2. Data Safety Guarantees (Zero Data Loss Architecture)

### Scenario 1: First-Time Sign-In After Months of Guest Usage

**Situation**: A student has used GateQA for 2+ months as a guest (no account). They have 150 solved questions, 25 bookmarks, 12 personal notes, and 3 mock test results — all in `localStorage`. They now click "Sign In with Google" for the first time.

**Guarantee**:
1. **Step 1 — Snapshot**: Before touching anything, the sync engine takes a **full JSON snapshot** of all local data and stores it in a separate `localStorage` key (`gate_qa_backup_<timestamp>`).
2. **Step 2 — Read Cloud**: Fetch the user's cloud record from Supabase (which will be empty for a first-time user).
3. **Step 3 — Union-Merge**: Combine local + cloud data using an **additive-only merge** (details in Section 4). Nothing is deleted or overwritten.
4. **Step 4 — Upload**: Save the merged result to Supabase.
5. **Step 5 — Confirm**: Only after Supabase confirms a successful write, update the local copy with the merged data.
6. **Step 6 — Toast**: Show the user: *"✅ Synced 2 months of progress to your Google account!"*

**If any step fails**: The original local data remains untouched. The user sees a non-blocking toast: *"Sync will retry automatically."*

---

### Scenario 2: Signing In on a Second Device

**Situation**: A student signs in on their laptop at home (Device A), builds up progress, then signs in on their phone (Device B) which also has some local guest progress.

**Guarantee**:
1. Device B's local data is snapshot-backed up first.
2. Cloud data (from Device A) is fetched.
3. **Union-Merge**: Device B's local data is merged with Device A's cloud data.
   - Bookmarks from both devices are combined (deduplicated).
   - Notes: If both devices have a note for the same question, the **longer note wins** (preserves more student effort). If lengths are equal, the **most recently edited note wins**.
   - Solved questions: Both devices' attempts are kept. If the same question was solved on both, the **first successful attempt timestamp** is preserved.
   - Mock tests: All test attempts from both devices are combined chronologically.
4. The merged result is uploaded to Supabase and synced back to both devices.

---

### Scenario 3: Network Failure During Sync

**Situation**: A student is on a train with spotty internet. They solve 5 questions and write 2 notes. The network drops mid-sync.

**Guarantee**:
1. **All writes go to `localStorage` first** — always. The cloud is a secondary backup, not the primary store.
2. The sync engine maintains a **pending changes queue** (`gate_qa_sync_queue`) in `localStorage`.
3. When the network comes back, the queue is automatically flushed to Supabase using an **exponential backoff retry** strategy (retry after 2s → 4s → 8s → 16s → stop and wait for next app open).
4. The user never sees an error. At most, they see a subtle sync indicator icon (🔄 → ✅).

---

### Scenario 4: Supabase Service is Down

**Situation**: Supabase has an outage for hours or even days.

**Guarantee**:
1. GateQA continues to work **100% normally** using `localStorage`. The student can solve questions, write notes, take mock tests — everything works.
2. All changes are queued in `gate_qa_sync_queue`.
3. When Supabase recovers, the next time the user opens GateQA, all queued changes are synced automatically.
4. **No data is lost. No functionality is blocked.**

---

### Scenario 5: User Clears Browser Data / Cache

**Situation**: A student clears their browser cache, cookies, and localStorage.

**Guarantee (Signed-In User)**:
1. Since their data is backed up to Supabase, when they open GateQA and sign in again, **all their cloud data is restored** — bookmarks, notes, solved progress, mock history.
2. Toast: *"✅ Restored your progress from cloud backup!"*

**Guarantee (Guest User — Not Signed In)**:
1. Unfortunately, guest data lives only in `localStorage`. If a guest user clears their browser, **their data is lost** — this is a browser limitation, not a GateQA limitation.
2. **Mitigation**: We show a subtle prompt to guest users who have accumulated significant data (e.g., 50+ solved questions): *"You have 72 solved questions. Sign in with Google to back them up for free!"*

---

### Scenario 6: User Signs Out

**Situation**: A student clicks "Sign Out" from GateQA.

**Guarantee**:
1. **Local data is NOT deleted on sign-out.** The student's bookmarks, notes, and progress remain in `localStorage` so they can continue using GateQA as a guest.
2. Cloud sync is paused (no further uploads until they sign in again).
3. When they sign back in, a union-merge runs again to reconcile any changes made while signed out.

---

### Scenario 7: User Deletes Their Account

**Situation**: A student wants to permanently delete their GateQA account.

**Guarantee**:
1. Before deletion, offer a **one-click JSON export** of all their cloud data (bookmarks, notes, solved questions, mock history) so they can download it as a file.
2. After confirming deletion, remove their cloud record from Supabase.
3. Their local `localStorage` data remains on their device (not deleted).

---

## 3. The Union-Merge Algorithm (Heart of Data Safety)

The merge algorithm is **additive-only** — it can only add data, never remove it. This is the fundamental guarantee against data loss.

```
┌─────────────────────────────────────────────────────────────────┐
│                     UNION-MERGE RULES                           │
├──────────────────┬──────────────────────────────────────────────┤
│ Data Type        │ Merge Strategy                               │
├──────────────────┼──────────────────────────────────────────────┤
│ Bookmarks        │ Set.union(local, cloud) — deduplicated       │
│                  │ A bookmark can only be added, never removed  │
│                  │ by the merge. User can manually un-bookmark. │
├──────────────────┼──────────────────────────────────────────────┤
│ Personal Notes   │ For each question_uid:                       │
│                  │ • If note exists only on one side → keep it  │
│                  │ • If note exists on both sides:              │
│                  │   → Keep the LONGER note (more student work) │
│                  │   → If same length → keep NEWER timestamp    │
│                  │ • Notes are NEVER auto-deleted by merge      │
├──────────────────┼──────────────────────────────────────────────┤
│ Solved Questions │ For each question_uid:                       │
│                  │ • If solved only on one side → keep it       │
│                  │ • If solved on both sides:                   │
│                  │   → Keep the EARLIEST attemptedAt timestamp  │
│                  │   → Preserve isCorrect from earliest attempt │
│                  │ • A solved question is NEVER un-solved       │
├──────────────────┼──────────────────────────────────────────────┤
│ Mock Test History│ Combine all attempts from both sides.        │
│                  │ Deduplicate by test ID + start timestamp.    │
│                  │ Sort chronologically.                        │
│                  │ Tests are NEVER removed by merge.            │
└──────────────────┴──────────────────────────────────────────────┘
```

### Merge Pseudocode

```javascript
function unionMerge(local, cloud) {
  return {
    bookmarks: [...new Set([...local.bookmarks, ...cloud.bookmarks])],

    notes: mergeNotes(local.notes, cloud.notes),

    solved_questions: mergeSolved(local.solved_questions, cloud.solved_questions),

    mock_history: deduplicateByTestIdAndTimestamp([
      ...local.mock_history,
      ...cloud.mock_history,
    ]),
  };
}

function mergeNotes(localNotes, cloudNotes) {
  const allKeys = new Set([...Object.keys(localNotes), ...Object.keys(cloudNotes)]);
  const merged = {};

  for (const uid of allKeys) {
    const localNote = localNotes[uid];
    const cloudNote = cloudNotes[uid];

    if (!localNote) { merged[uid] = cloudNote; continue; }
    if (!cloudNote) { merged[uid] = localNote; continue; }

    // Both exist: keep the longer one (more student effort preserved)
    if (localNote.text.length !== cloudNote.text.length) {
      merged[uid] = localNote.text.length > cloudNote.text.length ? localNote : cloudNote;
    } else {
      // Same length: keep the newer one
      merged[uid] = new Date(localNote.updatedAt) > new Date(cloudNote.updatedAt)
        ? localNote : cloudNote;
    }
  }
  return merged;
}
```

---

## 4. Target Data Schema

### A. Supabase Database Schema

```sql
-- 1. User Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Progress & Sync Table (One row per user — all data in JSONB)
CREATE TABLE public.user_progress (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bookmarks JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '{}'::jsonb,
  solved_questions JSONB DEFAULT '{}'::jsonb,
  mock_history JSONB DEFAULT '[]'::jsonb,
  data_version INTEGER DEFAULT 1,
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sync Audit Log (tracks every sync for debugging and recovery)
CREATE TABLE public.sync_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,            -- 'first_login_merge', 'incremental_sync', 'conflict_resolved'
  payload_snapshot JSONB,          -- full snapshot of data at time of sync
  device_info TEXT,                -- browser + OS identifier
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit own profile"
  ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view and edit own progress"
  ON public.user_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync logs"
  ON public.sync_log FOR ALL USING (auth.uid() = user_id);
```

### B. Synced Data Structures

1. **Bookmarks (`bookmarks`)**: Array of `question_uid` strings.
   ```json
   ["go:80298", "go:3347"]
   ```
2. **Personal Notes (`notes`)**: Map of `question_uid` to note objects with timestamps.
   ```json
   {
     "go:80298": { "text": "Circular linked list: 2 pointer modifications.", "updatedAt": "2026-08-05T18:25:00Z" },
     "go:3347":  { "text": "JK FF: J = x ^ y, K = x ^ y.", "updatedAt": "2026-08-04T10:15:00Z" }
   }
   ```
3. **Solved Questions (`solved_questions`)**: Map of `question_uid` to attempt metadata.
   ```json
   {
     "go:80298": { "solved": true, "selectedAnswer": "B", "isCorrect": true, "attemptedAt": "2026-08-05T18:25:00Z" }
   }
   ```
4. **Mock Test History (`mock_history`)**: Array of completed mock test attempts with unique IDs.
   ```json
   [
     { "testId": "mock_dl_2026-08-01_14:30", "subject": "Digital Logic", "score": 42, "total": 65, "startedAt": "2026-08-01T14:30:00Z", "completedAt": "2026-08-01T15:15:00Z" }
   ]
   ```

---

## 5. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          GateQA React App                                │
│                                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────────────────┐  │
│  │ AuthContext  │──>│ SyncManager  │──>│ localStorage (Primary Store) │  │
│  │  (Google     │   │ (Queue +     │   │  ✅ Always available         │  │
│  │   OAuth)     │   │  Merge +     │   │  ✅ Works offline            │  │
│  └─────────────┘   │  Retry)      │   │  ✅ Instant read/write       │  │
│                     └──────┬───────┘   └──────────────────────────────┘  │
│                            │                                             │
│                            │ Background sync (non-blocking)              │
│                            ▼                                             │
│                     ┌──────────────┐                                     │
│                     │   Supabase   │                                     │
│                     │  (Cloud DB)  │                                     │
│                     │  ✅ Backup   │                                     │
│                     │  ✅ X-Device │                                     │
│                     └──────────────┘                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Design: localStorage is ALWAYS the Primary Store

> **Critical Rule**: Every user action (solve, bookmark, note, mock test) writes
> to `localStorage` FIRST, IMMEDIATELY. Cloud sync happens AFTER, in the
> background. This means:
> - The UI is never blocked waiting for a network call.
> - If the network is down, the user doesn't even notice.
> - Data is always available locally for instant reads.

### New & Updated Source Files

| File | Purpose |
|:---|:---|
| `src/services/supabase.js` | Initialized Supabase client. Gracefully returns `null` if env vars are missing (allows builds without Supabase). |
| `src/contexts/AuthContext.jsx` | Global React context: `user`, `session`, `signInWithGoogle()`, `signOut()`, `isSyncing`, `lastSyncedAt`. |
| `src/utils/cloudSyncManager.js` | Sync engine: snapshot → fetch cloud → union-merge → upload → confirm. Includes retry queue and exponential backoff. |
| `src/utils/syncQueue.js` | Persistent queue of pending changes in `localStorage` key `gate_qa_sync_queue`. Flushed when network is available. |
| `src/components/Auth/AuthModal.jsx` | Sign-in dialog with Google OAuth button + data privacy summary. |
| `src/components/Auth/UserProfileMenu.jsx` | Header avatar, sync status indicator (🔄/✅/⚠️), sign-out button. |
| `src/components/Auth/DataExport.jsx` | One-click full data export as JSON file (available in settings). |
| `src/components/Auth/GuestDataPrompt.jsx` | Subtle prompt shown to guest users with 50+ solved questions encouraging sign-up. |
| `src/components/Question/QuestionNotes.jsx` | Extended to add `updatedAt` timestamp and trigger debounced cloud sync. |

---

## 6. Safety Mechanisms Summary

| Safety Layer | What It Protects Against |
|:---|:---|
| **localStorage-first writes** | Network failures, Supabase outages, slow connections |
| **Pre-merge JSON snapshot backup** | Bugs in merge logic, unexpected data corruption |
| **Additive-only union-merge** | Data loss from overwrites, race conditions between devices |
| **Pending sync queue with retry** | Interrupted syncs, dropped connections mid-upload |
| **Sync audit log (`sync_log` table)** | Debugging, disaster recovery, identifying merge conflicts |
| **One-click JSON data export** | User wants to leave, Supabase discontinuation, account deletion |
| **No data deletion on sign-out** | Accidental sign-outs, session expiry |
| **Guest data prompt at 50+ questions** | Guest users who don't know they should back up |
| **`data_version` field** | Future schema migrations without breaking existing data |

---

## 7. Phased Implementation Roadmap

### Phase 1: Environment & Supabase Setup
- [ ] Create free Supabase project at supabase.com.
- [ ] Configure Google OAuth Client ID in Google Cloud Console & Supabase Auth settings.
- [ ] Execute database migration script (`profiles`, `user_progress`, `sync_log` tables with RLS).
- [ ] Add `.env.example` entries: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- [ ] Ensure `npm run build` works without Supabase env vars (graceful fallback).

### Phase 2: Client Auth Foundation & UI
- [ ] Install `@supabase/supabase-js`.
- [ ] Build `src/services/supabase.js` with graceful null-client fallback.
- [ ] Build `src/contexts/AuthContext.jsx` with `signInWithGoogle()`, `signOut()`, session persistence.
- [ ] Implement `AuthModal.jsx` with Google Sign-In + data privacy text.
- [ ] Build `UserProfileMenu.jsx` with avatar, sync indicator, and sign-out.
- [ ] Add `GuestDataPrompt.jsx` — subtle prompt for guest users with 50+ solved questions.

### Phase 3: Data Migration & Bi-Directional Cloud Sync
- [ ] Upgrade `QuestionNotes.jsx` to include `updatedAt` timestamps in note objects.
- [ ] Build `cloudSyncManager.js` with the union-merge algorithm (Section 3).
- [ ] Build `syncQueue.js` — persistent pending changes queue with exponential backoff retry.
- [ ] Implement **pre-merge snapshot backup** before every merge operation.
- [ ] Attach debounced sync listeners to:
  - `QuestionNotes.jsx` (save note → queue sync).
  - Bookmark toggle actions (bookmark/unbookmark → queue sync).
  - Practice submission (submit answer → queue sync).
  - Mock test completion (finish test → queue sync).
- [ ] Build `DataExport.jsx` — one-click full JSON export of all user data.

### Phase 4: Offline Resilience & Comprehensive Testing
- [ ] Verify full offline functionality: app works identically when Supabase is unreachable.
- [ ] Test Scenario 1: First-time sign-in after months of guest usage (verify all data migrates).
- [ ] Test Scenario 2: Sign in on Device B after using Device A (verify cross-device merge).
- [ ] Test Scenario 3: Network drops mid-sync (verify queue retry and no data loss).
- [ ] Test Scenario 4: Supabase outage simulation (disconnect Supabase, verify app works).
- [ ] Test Scenario 5: Clear browser cache while signed in, re-sign-in (verify cloud restore).
- [ ] Test Scenario 6: Sign out and continue as guest (verify local data preserved).
- [ ] Test Scenario 7: Account deletion with data export (verify JSON download works).
- [ ] Write unit tests for `cloudSyncManager.js`, `syncQueue.js`, and `AuthContext.jsx`.
- [ ] Verify production build (`npm run build`) passes CI pipeline.

---

## 8. Summary of Benefits Post-Launch

1. **Seamless Cross-Device Study**: Start on mobile during commute, continue on laptop at home — all bookmarks, notes, solved questions, and mock history sync automatically.
2. **Bulletproof Data Safety**: Pre-merge snapshots + additive-only merges + sync audit logs + one-click export = zero data loss.
3. **Zero Impact on Guest Users**: Unauthenticated users enjoy the same instant, friction-free experience as before.
4. **Zero Cost**: Supabase Free Tier supports 50,000 monthly active users at $0/month.
5. **Future Ready**: `data_version` field and audit logs enable safe schema migrations as GateQA grows.
