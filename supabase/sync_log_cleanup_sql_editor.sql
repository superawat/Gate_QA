-- sync_log_cleanup_sql_editor.sql
--
-- Safe cleanup for Supabase SQL Editor.
--
-- IMPORTANT:
-- 1. Run each statement separately.
-- 2. Do not add VACUUM FULL to this file. Supabase SQL Editor runs queries
--    inside a transaction, while VACUUM FULL must run outside a transaction.
-- 3. This file changes only public.sync_log. Student data in
--    public.user_progress is not touched.

-- STEP 1: Inspect the current audit-log row count.
SELECT COUNT(*) AS sync_log_rows
FROM public.sync_log;

-- STEP 2: Preview how many rows would remain after retaining the latest five
-- audit entries per user.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at DESC, id DESC
    ) AS row_number
  FROM public.sync_log
)
SELECT
  COUNT(*) FILTER (WHERE row_number <= 5) AS rows_to_keep,
  COUNT(*) FILTER (WHERE row_number > 5) AS rows_to_remove
FROM ranked;

-- STEP 3: Run this statement separately to remove old audit rows.
-- It retains the latest five entries for every user.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at DESC, id DESC
    ) AS row_number
  FROM public.sync_log
)
DELETE FROM public.sync_log AS logs
USING ranked
WHERE logs.id = ranked.id
  AND ranked.row_number > 5;

-- STEP 4: Verify the remaining audit rows.
SELECT COUNT(*) AS sync_log_rows
FROM public.sync_log;

-- STEP 5: Verify that user progress was not changed.
SELECT
  COUNT(*) AS user_progress_rows,
  pg_size_pretty(pg_total_relation_size('public.user_progress'))
    AS user_progress_total_size
FROM public.user_progress;

-- STEP 6: Inspect sync_log storage after deletion.
SELECT
  pg_size_pretty(pg_relation_size('public.sync_log')) AS table_size,
  pg_size_pretty(pg_total_relation_size('public.sync_log')) AS total_size,
  pg_size_pretty(
    pg_total_relation_size(
      (SELECT reltoastrelid
       FROM pg_class
       WHERE oid = 'public.sync_log'::regclass)
    )
  ) AS toast_total_size;

-- OPTIONAL: Run outside Supabase SQL Editor, using psql or another direct
-- PostgreSQL connection during low traffic, to return unused storage to the
-- operating system:
--
-- VACUUM (FULL, ANALYZE) public.sync_log;
