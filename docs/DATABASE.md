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

## Live schema verification

The live Supabase project was inspected using comprehensive schema metadata queries on **2026-08-17**. The captured metadata is retained locally under the [`artifacts/db-schema/`](../artifacts/db-schema/) directory:

- [**`applied-migrations.md`**](../artifacts/db-schema/applied-migrations.md) — Relation check for migration history.
- [**`schema.md`**](../artifacts/db-schema/schema.md) — Table columns, ordinal positions, defaults, constraints (`ON DELETE CASCADE`), indexes, and RLS flags.
- [**`policies-and-grants.md`**](../artifacts/db-schema/policies-and-grants.md) — Active RLS policies (`USING` and `WITH CHECK`) and role-level table grants.
- [**`jsonb-contracts.md`**](../artifacts/db-schema/jsonb-contracts.md) — JSONB column definitions and data structures.
- [**`extensions-and-views.md`**](../artifacts/db-schema/extensions-and-views.md) — Installed PostgreSQL extensions and database views.
- [**`functions-and-triggers.md`**](../artifacts/db-schema/functions-and-triggers.md) — Database functions, security definitions (`SECURITY DEFINER`), and active triggers.

Verified public tables:

- `public.profiles`
- `public.user_progress`
- `public.sync_log`

Verified relationships use `ON DELETE CASCADE`, and RLS is enabled on all three tables (`relrowsecurity = true`, `relforcerowsecurity = false`). The live project has strict owner policies for `authenticated` users and zero public/anonymous table grants.

The hosted project does not contain `supabase_migrations.schema_migrations`; therefore its historical migration status cannot be verified from that table. The database should not be modified to create it retroactively.

---

## Supabase tables

### `auth.users`

Managed by Supabase Auth. Google OAuth creates the authenticated user and supplies the UUID used as the owner key in the public tables.

### `public.profiles`

One profile row per authenticated user.

| Column | Type | Nullable | Default | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | **No** | null | UUID matching `auth.users.id` (Primary Key, Foreign Key) |
| `email` | `text` | **No** | null | Account email address |
| `full_name` | `text` | Yes | null | Google display name or edited name |
| `avatar_url` | `text` | Yes | null | Google profile image URL |
| `created_at` | `timestamptz` | Yes | `now()` | Audit creation timestamp |
| `updated_at` | `timestamptz` | Yes | `now()` | Audit update timestamp |

Every Auth user must have a matching profile row because `user_progress.user_id` references `profiles.id`. The database trigger `on_auth_user_created` (executing `public.handle_new_auth_user()`) creates or updates that profile from Auth metadata.

### `public.user_progress`

One row per user containing the cloud backup. `user_id` is both the primary key and the owner reference.

| Column | Type | Nullable | Default | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `user_id` | `uuid` | **No** | null | Primary Key; references `public.profiles(id)` |
| `bookmarks` | `jsonb` | Yes | `'[]'::jsonb` | Saved GATE CSE question IDs array |
| `notes` | `jsonb` | Yes | `'{}'::jsonb` | User study notes keyed by question ID |
| `solved_questions` | `jsonb` | Yes | `'[]'::jsonb` | Canonical GATE CSE solved question IDs array |
| `mock_history` | `jsonb` | Yes | `'[]'::jsonb` | Completed mock test attempts history |
| `data_version` | `integer` | Yes | `1` | Payload format version for schema migrations |
| `last_synced_at` | `timestamptz` | Yes | `now()` | Timestamp of last successful cloud write |
| `progress_records` | `jsonb` | **No** | `'{"aptitude": {}, "standard": {}}'::jsonb` | Namespaced practice-attempt timelines used for streaks and activity heatmaps (`standard`, `aptitude`, `da`) |
| `aptitude_solved` | `jsonb` | **No** | `'[]'::jsonb` | Canonical Aptitude solved question IDs array |
| `aptitude_bookmarks` | `jsonb` | **No** | `'[]'::jsonb` | Canonical Aptitude bookmarked question IDs array |
| `da_solved` | `jsonb` | **No** | `'[]'::jsonb` | Canonical GATE DA question IDs solved by the user |
| `da_bookmarks` | `jsonb` | **No** | `'[]'::jsonb` | Canonical GATE DA question IDs bookmarked by the user |

The application calls `upsert()` for this table, so the authenticated role needs `SELECT`, `INSERT`, and `UPDATE` access for rows it owns. The client includes resilient schema fallback that safely embeds DA progress inside `progress_records` if the remote table schema lacks optional top-level columns.

### `public.sync_log`

Append-only audit records for synchronization events.

| Column | Type | Nullable | Default | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `bigint` | **No** | `nextval('sync_log_id_seq')` | Log identity (Primary Key) |
| `user_id` | `uuid` | Yes | null | Owning user (`ON DELETE CASCADE`) |
| `action` | `text` | **No** | null | For example `first_login_merge` or `incremental_sync` |
| `payload_snapshot` | `jsonb` | Yes | null | Lightweight count summary of the merged state: `{ summaryVersion, solvedCount, bookmarkCount, notesCount, mockCount, standardProgressCount, aptitudeProgressCount, daProgressCount }` |
| `device_info` | `text` | Yes | null | Browser user-agent and platform metadata |
| `created_at` | `timestamptz` | Yes | `now()` | Timestamp of audit entry |

---

## Installed Extensions & Views

### Extensions
Verified active extensions in the hosted Supabase PostgreSQL cluster:
- `hypopg` (1.4.1) — Hypothetical indexes for PostgreSQL
- `index_advisor` (0.2.0) — Query index advisor
- `pg_stat_statements` (1.11) — Planning and execution statistics tracking
- `pgcrypto` (1.3) — Cryptographic functions
- `plpgsql` (1.0) — PL/pgSQL procedural language
- `supabase_vault` (0.3.1) — Supabase Vault secrets management
- `uuid-ossp` (1.1) — Universally unique identifier generators

### Views
- `extensions.hypopg_hidden_indexes`, `extensions.hypopg_list_indexes`
- `extensions.pg_stat_statements`, `extensions.pg_stat_statements_info`
- `vault.decrypted_secrets`

---

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

Foreign keys enforce `ON DELETE CASCADE` so deleting an Auth user removes the associated profile, progress, and audit rows.

---

## Row Level Security & Policies

RLS is enabled on every public user-data table. Ownership is checked with the authenticated JWT subject:

```sql
(select auth.uid()) = user_id
```

### Verified Active Policies

| Table | Policy Name | Command | Role | Expression |
| :--- | :--- | :---: | :--- | :--- |
| `public.profiles` | Users can read their own profile | `SELECT` | `authenticated` | `USING ((SELECT auth.uid()) = id)` |
| `public.sync_log` | Users can insert their own sync logs | `INSERT` | `authenticated` | `WITH CHECK ((SELECT auth.uid()) = user_id)` |
| `public.user_progress` | Users can insert their own progress | `INSERT` | `authenticated` | `WITH CHECK ((SELECT auth.uid()) = user_id)` |
| `public.user_progress` | Users can read their own progress | `SELECT` | `authenticated` | `USING ((SELECT auth.uid()) = user_id)` |
| `public.user_progress` | Users can update their own progress | `UPDATE` | `authenticated` | `USING ((SELECT auth.uid()) = user_id)`<br>`WITH CHECK ((SELECT auth.uid()) = user_id)` |

### Role Grants
- `anon`: **Zero** grants on `public.profiles`, `public.user_progress`, or `public.sync_log`.
- `authenticated`: Granted `SELECT` on `profiles`; `SELECT, INSERT, UPDATE` on `user_progress`; `INSERT` on `sync_log`.
- `postgres` & `service_role`: Full administrative table privileges.

---

## Authentication and sync sequence

1. The user chooses **Sign in with Google**.
2. Supabase redirects to Google and Google returns to the Supabase callback:
   `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Supabase creates or restores the Auth session and redirects to the configured application origin.
4. `AuthContext` receives the session and user UUID.
5. `cloudSyncManager` creates a local backup snapshot before touching cloud data (`gate_qa_backup_<timestamp>`).
6. Existing `user_progress` is read, if present.
7. Local and cloud data are merged additively.
8. The merged payload is upserted into `user_progress`.
9. A `sync_log` record is appended with a lightweight summary.
10. The merged state is written back to localStorage so the UI is immediately consistent.

The sync is single-flight: a user must not generate overlapping sync requests while the previous request is still running. Sync requests are debounced by 750 ms and successful syncs are throttled to one per 30 seconds per user. Changes remain in the local offline queue until the next permitted sync, so throttling does not discard local work. Authentication/session initialization still performs the first sync immediately.

`sync_log.payload_snapshot` stores a lightweight summary rather than student content. New rows contain `summaryVersion`, solved/bookmark/note/mock counts, and separate standard/aptitude/da progress counts. Older rows may contain full snapshots and should be retained only according to the documented cleanup policy.

---

## Merge rules

| Data | Rule |
| --- | --- |
| Bookmarks | Set union with duplicates removed |
| Notes | Keep the longer note; equal-length notes use the newer timestamp |
| Solved questions | Additive union of canonical string IDs; legacy object rows are recovered during sync |
| Aptitude solved/bookmarked IDs | Additive union of canonical string IDs in dedicated columns |
| GATE DA solved/bookmarked IDs | Additive union of canonical string IDs in dedicated columns and namespaced progress records |
| Mock history | Combine records, deduplicate by test identity, and sort chronologically |
| Practice progress | Merge attempt histories by timestamp and preserve the union of activity dates used by streaks |

Before a merge, the client stores a timestamped local snapshot using keys like `gate_qa_backup_<timestamp>`. A failed cloud operation must leave the original local data available.

---

## Frontend locations

- Supabase client: [`src/services/supabase.js`](../src/services/supabase.js)
- Auth state and OAuth: [`src/contexts/AuthContext.jsx`](../src/contexts/AuthContext.jsx)
- Merge and database writes: [`src/utils/cloudSyncManager.js`](../src/utils/cloudSyncManager.js)
- Offline queue: [`src/utils/syncQueue.js`](../src/utils/syncQueue.js)
- Auth UI: [`src/components/Auth/`](../src/components/Auth/)

---

## Troubleshooting

### `42501` or `new row violates row-level security policy`

Usually means the insert policy is missing, the policy checks the wrong column, or the request has no valid authenticated session. Verify:

```sql
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_progress';
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
