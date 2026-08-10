-- sync_log_cleanup.sql
-- -----------------------------------------------------------------------
-- IMPORTANT: Run as TWO separate executions in Supabase SQL Editor.
-- VACUUM cannot run inside a transaction block (Postgres ERROR 25001).
-- -----------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════
-- PART A  (Run this first — copy everything below up to the PART B line)
-- ═══════════════════════════════════════════════════════════════════════

-- A1: Pre-check — note the TOAST size before cleanup.
SELECT
    c.relname                                              AS table_name,
    pg_size_pretty(pg_relation_size(c.oid))                AS main_size,
    pg_size_pretty(pg_total_relation_size(c.reltoastrelid)) AS toast_size,
    pg_size_pretty(pg_total_relation_size(c.oid))          AS total_size,
    (SELECT count(*) FROM public.sync_log)                 AS row_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'sync_log';

-- A2: Blank payload_snapshot on all rows except the 5 most recent per user.
-- Preserves audit row metadata (user_id, action, device_info, created_at).
-- Does NOT touch user_progress or any student data.
UPDATE public.sync_log
SET payload_snapshot = '{}'::jsonb
WHERE id NOT IN (
    SELECT id FROM (
        SELECT
            id,
            ROW_NUMBER() OVER (
                PARTITION BY user_id
                ORDER BY created_at DESC
            ) AS rn
        FROM public.sync_log
    ) ranked
    WHERE rn <= 5
);

-- A3: Confirm how many rows were updated.
SELECT
    count(*) FILTER (WHERE payload_snapshot = '{}'::jsonb) AS blanked_rows,
    count(*) FILTER (WHERE payload_snapshot != '{}'::jsonb) AS kept_rows,
    count(*) AS total_rows
FROM public.sync_log;


-- ═══════════════════════════════════════════════════════════════════════
-- PART B  (New SQL Editor tab — run this ALONE, nothing else selected)
-- VACUUM must be a standalone statement outside any transaction block.
-- ═══════════════════════════════════════════════════════════════════════

VACUUM FULL public.sync_log;


-- ═══════════════════════════════════════════════════════════════════════
-- PART C  (After VACUUM finishes — verify the result)
-- ═══════════════════════════════════════════════════════════════════════

-- C1: Post-cleanup size — toast_size should be < 100 kB now.
SELECT
    c.relname                                              AS table_name,
    pg_size_pretty(pg_relation_size(c.oid))                AS main_size,
    pg_size_pretty(pg_total_relation_size(c.reltoastrelid)) AS toast_size,
    pg_size_pretty(pg_total_relation_size(c.oid))          AS total_size,
    (SELECT count(*) FROM public.sync_log)                 AS row_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'sync_log';

-- C2: Spot-check most recent rows to confirm new summary format.
SELECT
    user_id,
    action,
    payload_snapshot,
    created_at
FROM public.sync_log
ORDER BY created_at DESC
LIMIT 5;
