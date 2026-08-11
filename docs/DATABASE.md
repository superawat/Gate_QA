# GateQA Database and Cloud Sync

This document describes how GateQA uses Supabase for optional authentication, cloud backup, and multi-device synchronization. GateQA remains local-first: the application works without an account and local browser storage remains the immediate source of truth for the UI.

## High-level flow

```text
Guest or signed-in user
        |
        v
localStorage (instant reads/writes, offline support)
        |
        | Google OAuth session
        v
Supabase Auth (auth.users)
        |
        v
public.profiles + public.user_progress + public.sync_log
```

Cloud synchronization is a backup and cross-device layer. A network or Supabase failure must not prevent normal local practice.

## Supabase tables

### `auth.users`

Managed by Supabase Auth. Google OAuth creates the authenticated user and supplies the UUID used as the owner key in the public tables.

### `public.profiles`

One profile row per authenticated user.

| Column | Purpose |
| --- | --- |
| `id` | UUID matching `auth.users.id` |
| `email` | Account email |
| `full_name` | Google display name or edited name |
| `avatar_url` | Google profile image URL |
| `created_at`, `updated_at` | Audit timestamps |

Every Auth user must have a matching profile row because `user_progress.user_id`
references `profiles.id`. The database trigger `on_auth_user_created` creates
or updates that profile from Auth metadata. Existing users are backfilled by
the security cleanup script before cloud sync is retried.

### `public.user_progress`

One row per user containing the cloud backup. `user_id` is both the primary key and the owner reference.

| Column | Shape | Purpose |
| --- | --- | --- |
| `user_id` | UUID | References the owning profile |
| `bookmarks` | JSONB array | Saved question IDs |
| `notes` | JSONB object | Notes keyed by question ID |
| `solved_questions` | JSONB array | Canonical solved question IDs |
| `aptitude_solved` | JSONB array | Canonical Aptitude solved question IDs |
| `aptitude_bookmarks` | JSONB array | Canonical Aptitude bookmarked question IDs |
| `mock_history` | JSONB array | Mock-test attempts |
| `progress_records` | JSONB object | Namespaced practice-attempt timelines used for streaks and activity (`standard`, `aptitude`) |
| `data_version` | integer | Payload format version |
| `last_synced_at` | timestamptz | Last successful cloud write |

The application calls `upsert()` for this table, so the authenticated role needs `SELECT`, `INSERT`, and `UPDATE` access for rows it owns.

### `public.sync_log`

Append-only audit records for synchronization events.

| Column | Purpose |
| --- | --- |
| `id` | Log identity |
| `user_id` | Owning user |
| `action` | For example `first_login_merge` or `incremental_sync` |
| `payload_snapshot` | Lightweight count summary of the merged state at sync time: `{ summaryVersion, solvedCount, bookmarkCount, notesCount, mockCount, standardProgressCount, aptitudeProgressCount }`. Rows written before this change (`summaryVersion` absent) contain the full merged JSONB blob. |
| `device_info` | Browser/device metadata |
| `created_at` | Log timestamp |

## Relationships

```text
auth.users.id
    |
    +--> profiles.id
    |
    +--> user_progress.user_id
    |
    +--> sync_log.user_id
```

Foreign keys should use `ON DELETE CASCADE` so deleting an Auth user removes the associated profile, progress, and audit rows.

## Row Level Security

RLS is enabled on every public user-data table. Ownership is checked with the authenticated JWT subject:

```sql
(select auth.uid()) = user_id
```

The recommended policies for `user_progress` are:

```sql
alter table public.user_progress enable row level security;

create policy "Users can read their own progress"
on public.user_progress
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own progress"
on public.user_progress
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress"
on public.user_progress
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

The audit table needs an insert policy:

```sql
alter table public.sync_log enable row level security;

create policy "Users can insert their own sync logs"
on public.sync_log
for insert to authenticated
with check ((select auth.uid()) = user_id);
```

### Security cleanup and verification

Run [`supabase_security_audit_and_cleanup.sql`](./supabase/supabase_security_audit_and_cleanup.sql)
in the Supabase SQL Editor as the `postgres` role. It enables RLS on all three
tables, recreates least-privilege `authenticated` policies, removes broad
`public` policies only from these tables, revokes all existing `anon` and
`authenticated` table grants before adding only the required privileges, and
prints verification queries. Do not use the browser `anon` key to run this
script; it cannot inspect or alter RLS metadata.

Avoid a broad `public` `ALL` policy when the granular `authenticated` policies above are present. If an older policy such as `Users can access own progress` exists, inspect it before removing it:

```sql
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'user_progress';
```

## Authentication and sync sequence

1. The user chooses **Sign in with Google**.
2. Supabase redirects to Google and Google returns to the Supabase callback:
   `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Supabase creates or restores the Auth session and redirects to the configured application origin.
4. `AuthContext` receives the session and user UUID.
5. `cloudSyncManager` creates a local backup snapshot before touching cloud data.
6. Existing `user_progress` is read, if present.
7. Local and cloud data are merged additively.
8. The merged payload is upserted into `user_progress`.
9. A `sync_log` record is appended.
10. The merged state is written back to localStorage so the UI is immediately consistent.

The sync is single-flight: a user must not generate overlapping sync requests while the previous request is still running. Sync requests are debounced by 750 ms and successful syncs are throttled to one per 30 seconds per user. Changes remain in the local offline queue until the next permitted sync, so throttling does not discard local work. Authentication/session initialization still performs the first sync immediately.

`sync_log.payload_snapshot` stores a lightweight summary rather than student content. New rows contain `summaryVersion`, solved/bookmark/note/mock counts, and separate standard/aptitude progress counts. Older rows may contain full snapshots and should be retained only according to the documented cleanup policy.

## Merge rules

| Data | Rule |
| --- | --- |
| Bookmarks | Set union with duplicates removed |
| Notes | Keep the longer note; equal-length notes use the newer timestamp |
| Solved questions | Additive union of canonical string IDs; legacy object rows are recovered during sync |
| Aptitude solved/bookmarked IDs | Additive union of canonical string IDs in dedicated columns |
| Mock history | Combine records, deduplicate by test identity, and sort chronologically |
| Practice progress | Merge attempt histories by timestamp and preserve the union of activity dates used by streaks |

Before a merge, the client stores a timestamped local snapshot using keys like `gate_qa_backup_<timestamp>`. A failed cloud operation must leave the original local data available.

## Frontend locations

- Supabase client: [`src/services/supabase.js`](../src/services/supabase.js)
- Auth state and OAuth: [`src/contexts/AuthContext.jsx`](../src/contexts/AuthContext.jsx)
- Merge and database writes: [`src/utils/cloudSyncManager.js`](../src/utils/cloudSyncManager.js)
- Offline queue: [`src/utils/syncQueue.js`](../src/utils/syncQueue.js)
- Auth UI: [`src/components/Auth/`](../src/components/Auth/)

## Troubleshooting

### `42501` or `new row violates row-level security policy`

Usually means the insert policy is missing, the policy checks the wrong column, or the request has no valid authenticated session. Verify:

```sql
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'user_progress';
```

The inserted `user_id` must equal the Google-authenticated user's UUID, not the email address or Google numeric project ID.

### `Unable to exchange external code`

This occurs before database access. Check that the Google Client Secret in Supabase matches the same Web OAuth client whose callback is:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

### Repeated sync requests

Check that the auth initialization effect is stable and that sync is guarded against duplicate in-flight requests. A changing callback dependency can repeatedly re-run session initialization.

### Guest mode

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is absent, the Supabase client is `null`. The app intentionally remains usable in guest-only local mode.
