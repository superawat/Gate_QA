# Data Persistence & Privacy Policy

GateQA is built around a **Local-First, Zero-Friction, and Zero Data Loss** architecture.
Guest Mode is the permanent default for all learners. Progress is always stored locally on the user's device first, with optional **Google Cloud Sync** powered by Supabase for real-time multi-device backup.

---

## 1. Core Architecture Principles

1. **Local-First & Offline-Default:**
   - All study progress (solved status, bookmarks, personal notes, test attempts) is saved instantly to browser `localStorage`.
   - The platform is 100% functional offline without requiring any login or account creation.
2. **Zero Data Loss Guarantee:**
   - Signing in or out **never deletes local user data**.
   - Cloud synchronization uses an **additive-only union-merge algorithm** (`src/utils/cloudSyncManager.js`).
   - Automated local snapshots (`gate_qa_backup_<timestamp>`) are stored prior to any merge operation.
3. **No Mandatory Login:**
   - Google Authentication is strictly optional. Users can study in Guest Mode forever.

---

## 2. What Is Stored Locally (localStorage)

The primary client-side store contains:

- `gate_qa_solved_questions`: Deduplicated string array of solved GATE CS question UIDs.
- `gate_qa_bookmarked_questions`: Deduplicated string array of bookmarked GATE CS question UIDs.
- `gateqa-apt-solved-questions`: Deduplicated string array of solved General Aptitude question UIDs.
- `gateqa-apt-bookmarked-questions`: Deduplicated string array of bookmarked General Aptitude question UIDs.
- `gateqa_user_notes_v1`: Key-value map of personal study notes by question storage UID.
- `gateqa_progress_v1`: Granular practice attempt timestamps and scores.
- `gate_qa_mock_history_v1`: Past full mock test and custom builder attempt history.
- `gate_qa_backup_*`: Pre-merge local recovery snapshots.

---

## 3. What Is Stored in the Cloud (Optional Google Sign-In)

When a user signs in with Google, data is securely stored in Supabase PostgreSQL:

- **`user_profiles`**: Google email, display name, avatar URL, created/updated timestamps.
- **`user_progress`**: Additively merged string arrays for CS/Aptitude solved questions, bookmarks, and metadata.
- **`user_notes`**: Question study notes merged using longest-content-wins conflict resolution.
- **`user_mock_tests`**: Chronologically deduplicated mock test submission history.

*Security & Privacy*: Row Level Security (RLS) policies ensure that each user can only read and write their own data. We never sell or share user study data with third-party advertisers.

---

## 4. Risk Scenarios for Guest Users & Mitigations

| Scenario | Risk | Mitigation |
|---|---|---|
| **Private / Incognito Mode** | Storage is purged when window closes | Use standard browsing mode or sign in with Google. |
| **Browser Data / Cache Cleared** | Local storage is wiped | Sign in with Google for cloud backup OR download an `Export JSON` backup beforehand. |
| **Different Devices (Phone / PC)** | In guest mode, devices do not share storage | Sign in with Google on both devices for real-time automatic synchronization. |
| **Low Device Storage Quota** | Browser may fail to write new records | Cloud sync maintains an offsite copy in the cloud database. |

---

## 5. Backup & Transfer Workflows

### A. Google Cloud Sync (Recommended)
1. Click **Sign in with Google** from the header or navigation drawer.
2. Local data is additively merged with existing cloud backups with zero data loss.
3. Progress syncs automatically in the background across all your active devices.

### B. Manual JSON Workspace Export / Import (Offline)
1. Open the **Global Navigation Drawer** or **Progress Manager** in the filter sidebar.
2. Click **Export JSON** to download a `.json` workspace file.
3. On another device or browser, click **Import JSON**.
4. Select merge strategy:
   - **Merge**: Union imported data with existing local progress without overwriting.
   - **Replace**: Replace local state completely with imported file.

---

## 6. Implementation References

- UI Modal: [`src/components/Footer/DataPolicyModal.jsx`](file:///src/components/Footer/DataPolicyModal.jsx)
- Cloud Sync Engine: [`src/utils/cloudSyncManager.js`](file:///src/utils/cloudSyncManager.js)
- Sync Queue & Offline Retry: [`src/utils/syncQueue.js`](file:///src/utils/syncQueue.js)
- Auth Context: [`src/contexts/AuthContext.jsx`](file:///src/contexts/AuthContext.jsx)
- Workspace Export/Import: [`src/utils/workspaceFile.js`](file:///src/utils/workspaceFile.js)
- Static Privacy Page: [`src/pages/StaticPages.jsx`](file:///src/pages/StaticPages.jsx)

