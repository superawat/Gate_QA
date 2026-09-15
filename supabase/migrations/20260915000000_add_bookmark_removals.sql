-- Migration: 20260915000000_add_bookmark_removals.sql
-- DEC-111: Fix "Unbookmark Does Not Persist" (union-merge re-introduces removed bookmarks).
-- Adds nullable JSONB columns for tracking removed bookmark IDs as tombstone sets.
-- Default is NULL (treated as empty array by application logic for backwards compatibility).
-- The union-merge algorithm subtracts this removal set from the merged bookmarks union,
-- so cloud-stored bookmarks can never silently override a deliberate unbookmark action.
--
-- Design invariants:
--   • NULL is treated as an empty removal set (backward compatible with older clients).
--   • A removal is permanent: once in the set it is union-merged (never discarded).
--   • Re-bookmarking a question removes it from the removal set on the next sync.

alter table public.user_progress
  add column if not exists bookmark_removals jsonb default null,
  add column if not exists aptitude_bookmark_removals jsonb default null,
  add column if not exists da_bookmark_removals jsonb default null;

comment on column public.user_progress.bookmark_removals is
  'GATE CSE question IDs explicitly unbookmarked by the user (tombstone set for union-merge)';

comment on column public.user_progress.aptitude_bookmark_removals is
  'Aptitude question IDs explicitly unbookmarked by the user (tombstone set for union-merge)';

comment on column public.user_progress.da_bookmark_removals is
  'GATE DA question IDs explicitly unbookmarked by the user (tombstone set for union-merge)';
