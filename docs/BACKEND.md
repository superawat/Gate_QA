# GateQA Backend & Cloud Architecture Specification

> **Scope**: This document outlines the backend architecture, cloud synchronization engine, Supabase PostgreSQL schema, Row Level Security (RLS) policies, security triggers, and JSONB data contracts for `gateqa.in`.
> **Confidentiality & Privacy**: This specification contains structural metadata, schema contracts, and architectural diagrams only. It contains no API keys, private tokens, credentials, or personal user data.

---

## 1. System Overview & Invariants

GateQA is designed around a **Zero-Cost ($0/mo), Local-First, Zero-Data-Loss** architecture.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GATEQA CLIENT (Vite SPA)                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │               Primary Fast Layer: Browser localStorage                │  │
│  │   • 0ms instant reads and writes                                      │  │
│  │   • 100% full offline problem solving and mock tests                  │  │
│  │   • Guest mode is the permanent default; no login required           │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │ (When user signs in)                 │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │            Additive Union-Merge Cloud Sync Engine                     │  │
│  │   • Local pre-merge backup snapshot (gate_qa_backup_<timestamp>)      │  │
│  │   • Additive-only union merge (union arrays, max attempts)            │  │
│  │   • Debounced & offline queue sync manager (syncQueue.js)             │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │ HTTPS / Supabase SDK
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLOUD BACKEND                              │
│                                                                             │
│  ┌───────────────────────┐   Triggers    ┌───────────────────────────────┐  │
│  │  auth.users (OAuth)   │ ────────────> │  public.profiles              │  │
│  └───────────────────────┘               └───────────────┬───────────────┘  │
│                                                          │                  │
│                                 ON DELETE CASCADE        │                  │
│                                 ┌────────────────────────┴───────────────┐  │
│                                 ▼                                        ▼  │
│                     ┌───────────────────────┐               ┌────────────┴┐ │
│                     │ public.user_progress  │               │ sync_log    │ │
│                     │ (Cloud state backup)  │               │ (Audit trail│ │
│                     └───────────────────────┘               └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Invariants
1. **Local-First Precedence**: `localStorage` is ALWAYS the primary read/write store. The UI never blocks on network requests or database queries for everyday practice.
2. **Zero Data Loss on Cloud Sync**: Cloud synchronization utilizes an **additive-only union-merge algorithm** (`src/utils/cloudSyncManager.js`). Local data is never overwritten by an older or empty cloud state.
3. **Pre-Merge Snapshots**: A local snapshot (`gate_qa_backup_<timestamp>`) is created immediately before any cloud merge.
4. **Permanent Guest Mode**: Signing out never clears local user data.

---

## 2. Database Schema (PostgreSQL `public`)

The PostgreSQL database runs on Supabase (Free Tier) within the `public` schema.

### Table: `public.profiles`
Stores user profile information automatically synchronized from Supabase Auth (`auth.users`).

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | **No** | — | Primary Key; Foreign Key referencing `auth.users(id) ON DELETE CASCADE` |
| `email` | `text` | **No** | — | User email address |
| `full_name` | `text` | Yes | — | Display name from OAuth provider metadata |
| `avatar_url` | `text` | Yes | — | Profile picture URL from OAuth provider |
| `created_at` | `timestamptz` | Yes | `now()` | Timestamp of profile creation |
| `updated_at` | `timestamptz` | Yes | `now()` | Timestamp of last profile update |

### Table: `public.user_progress`
Stores comprehensive question practice progress, solved question sets, bookmarks, notes, and mock test histories.

| Column | Type | Nullable | Default | Description & Mapping |
| :--- | :--- | :---: | :--- | :--- |
| `user_id` | `uuid` | **No** | — | Primary Key; Foreign Key referencing `public.profiles(id) ON DELETE CASCADE` |
| `solved_questions` | `jsonb` | Yes | `[]::jsonb` | Canonical GATE CSE solved question IDs array |
| `bookmarks` | `jsonb` | Yes | `[]::jsonb` | GATE CSE bookmarked question IDs array |
| `notes` | `jsonb` | Yes | `{}` | User study notes keyed by question ID |
| `aptitude_solved` | `jsonb` | **No** | `[]::jsonb` | Aptitude solved question IDs array |
| `aptitude_bookmarks`| `jsonb` | **No** | `[]::jsonb` | Aptitude bookmarked question IDs array |
| `da_solved` | `jsonb` | **No** | `[]::jsonb` | GATE DA (Data Science & AI) solved question IDs array |
| `da_bookmarks` | `jsonb` | **No** | `[]::jsonb` | GATE DA bookmarked question IDs array |
| `progress_records` | `jsonb` | **No** | `{"standard": {}, "aptitude": {}, "da": {}}` | Namespaced question attempt histories |
| `mock_history` | `jsonb` | Yes | `[]::jsonb` | Completed mock exam attempts and performance history |
| `data_version` | `integer` | Yes | `1` | Payload format version for schema migrations |
| `last_synced_at` | `timestamptz` | Yes | `now()` | Timestamp of last cloud sync |

### Table: `public.sync_log`
Append-only synchronization audit trail for monitoring sync health and debugging merge issues without storing student content.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | **No** | `nextval('sync_log_id_seq')` | Auto-incrementing log ID |
| `user_id` | `uuid` | Yes | — | User ID performing the sync (`ON DELETE CASCADE`) |
| `action` | `text` | **No** | — | Sync action type (e.g. `initial_merge`, `incremental_sync`, `manual_push`) |
| `payload_snapshot` | `jsonb` | Yes | — | Lightweight metadata summary (counts of solved, bookmarks, etc.) |
| `device_info` | `text` | Yes | — | Browser user-agent and device platform information |
| `created_at` | `timestamptz` | Yes | `now()` | Timestamp of audit entry |

---

## 3. Row Level Security (RLS) & Table Grants

All public user tables have **Row Level Security (RLS) enabled** to enforce strict multi-tenant data isolation at the database level.

```sql
-- RLS Activation Status
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;
```

### Security Policies (`pg_policies`)

1. **`public.profiles`**:
   - `SELECT`: `((SELECT auth.uid() AS uid) = id)` for `authenticated` role.
   - Users can only read their own profile row.
2. **`public.user_progress`**:
   - `SELECT`: `((SELECT auth.uid() AS uid) = user_id)` for `authenticated` role.
   - `INSERT`: `((SELECT auth.uid() AS uid) = user_id)` for `authenticated` role.
   - `UPDATE`: `((SELECT auth.uid() AS uid) = user_id)` with check `((SELECT auth.uid() AS uid) = user_id)`.
   - Users can only read, insert, and update their own progress record.
3. **`public.sync_log`**:
   - `INSERT`: `((SELECT auth.uid() AS uid) = user_id)` for `authenticated` role.
   - Users can append audit logs for their own user ID.

### Role Privileges
- `anon` role has **zero** table grants on `public.profiles`, `public.user_progress`, or `public.sync_log`. Unauthenticated requests cannot read or write data.
- `authenticated` role is granted `SELECT` on `profiles`, `SELECT, INSERT, UPDATE` on `user_progress`, and `INSERT` on `sync_log`.

---

## 4. Functions & Triggers

### `public.handle_new_auth_user()`
Automatically provisions or updates a `public.profiles` record whenever a user is created or updated in `auth.users` via OAuth.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$function$;

-- Trigger Binding:
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();
```

---

## 5. JSONB Contracts & Data Shapes

### Progress Payload Shape (`public.user_progress`)
```json
{
  "user_id": "00000000-0000-0000-0000-000000000000",
  "solved_questions": ["go:123", "go:456"],
  "bookmarks": ["go:123"],
  "aptitude_solved": ["APT-001"],
  "aptitude_bookmarks": ["APT-002"],
  "da_solved": ["da:linear-algebra:q1"],
  "da_bookmarks": ["da:linear-algebra:q2"],
  "notes": {
    "go:123": {
      "text": "Review B+ tree split conditions.",
      "updatedAt": "2026-08-14T10:00:00.000Z"
    }
  },
  "progress_records": {
    "standard": {
      "go:123": {
        "attempts": 2,
        "correctAttempts": 1,
        "incorrectAttempts": 1,
        "firstSubmittedAt": "2026-08-14T10:00:00.000Z",
        "lastSubmittedAt": "2026-08-14T10:05:00.000Z",
        "history": [
          {
            "submittedAt": "2026-08-14T10:05:00.000Z",
            "correct": true,
            "durationMs": 45000,
            "type": "MCQ"
          }
        ]
      }
    },
    "aptitude": {},
    "da": {}
  },
  "mock_history": [
    {
      "testId": "mock-full-length-2026-08-14",
      "startedAt": "2026-08-14T09:00:00.000Z",
      "submittedAt": "2026-08-14T12:00:00.000Z",
      "score": 68.5,
      "totalMarks": 100
    }
  ],
  "data_version": 1,
  "last_synced_at": "2026-08-15T00:00:00.000Z"
}
```

### Local Storage to Cloud Column Mapping

| Local Storage Key | Supabase Column | Type |
| :--- | :--- | :--- |
| `gate_qa_solved_questions` | `solved_questions` | `jsonb` array of strings |
| `gate_qa_bookmarked_questions` | `bookmarks` | `jsonb` array of strings |
| `gate_qa_user_notes` | `notes` | `jsonb` object |
| `gateqa-apt-solved-questions` | `aptitude_solved` | `jsonb` array of strings |
| `gateqa-apt-bookmarked-questions` | `aptitude_bookmarks` | `jsonb` array of strings |
| `gate_qa_da_solved_questions` | `da_solved` | `jsonb` array of strings |
| `gate_qa_da_bookmarked_questions` | `da_bookmarks` | `jsonb` array of strings |
| `gateqa_progress_v1` | `progress_records.standard` | `jsonb` map |
| `gateqa_apt_progress_v1` | `progress_records.aptitude` | `jsonb` map |
| `gateqa_da_progress_v1` | `progress_records.da` | `jsonb` map |
| `gateqa_mock_history_v1` | `mock_history` | `jsonb` array |

---

## 6. Tiered Upsert Fallback Mechanism

To prevent sync failures during remote schema updates or legacy database setups, the cloud sync engine implements a **3-Tier Graceful Degradation Strategy**:

1. **Tier 1 (Complete Schema)**:
   - Upserts all columns: `solved_questions`, `bookmarks`, `notes`, `aptitude_solved`, `aptitude_bookmarks`, `da_solved`, `da_bookmarks`, `progress_records`, `mock_history`.
2. **Tier 2 (Fallback on missing DA columns — `PGRST204`)**:
   - If PostgREST reports `da_solved` or `da_bookmarks` column missing, strips DA columns and stores DA progress safely inside `progress_records.da` and `progress_records.da_solved`.
3. **Tier 3 (Core Baseline Fallback — missing Aptitude & DA columns)**:
   - If both Aptitude and DA dedicated columns are absent, drops back to core baseline (`solved_questions`, `bookmarks`, `notes`, `mock_history`, `progress_records`). All progress is securely serialized within `progress_records` without dropping data.

---

## 7. Cloud Sync Workflow & Error Resilience

```text
Local Practice Event (Answer solved, Bookmark toggled, Mock submitted)
        │
        ▼
Write to localStorage immediately (0ms)
        │
        ▼
Is User Signed In?
   ├── NO  ─> Complete.
   └── YES ─> Enqueue sync operation in SyncQueue (Debounce: 3000ms)
                    │
                    ▼
              Network Available?
                 ├── NO  ─> Retain in queue, sync automatically on 'online' event
                 └── YES ─> Send upsert payload to Supabase
                                 │
                                 ├── SUCCESS ─> Record sync_log audit entry
                                 └── FAILURE ─> Trigger Tier 2/3 fallback or retry with backoff
```
