-- Keep ISRO solved/bookmarked IDs in the same user-owned cloud backup row as
-- GATE and Aptitude progress. Attempt histories remain namespaced in
-- progress_records.isro.
alter table public.user_progress
  add column if not exists isro_solved jsonb not null default '[]'::jsonb,
  add column if not exists isro_solved_removals jsonb,
  add column if not exists isro_solved_timestamps jsonb,
  add column if not exists isro_bookmarks jsonb not null default '[]'::jsonb,
  add column if not exists isro_bookmark_removals jsonb;

comment on column public.user_progress.isro_solved is
  'Canonical ISRO CS question IDs solved by the user';
comment on column public.user_progress.isro_solved_removals is
  'ISRO CS question unsolve tombstones mapping question UID to removal epoch timestamp';
comment on column public.user_progress.isro_solved_timestamps is
  'ISRO CS question solve timestamps mapping question UID to solve epoch timestamp';
comment on column public.user_progress.isro_bookmarks is
  'Canonical ISRO CS question IDs bookmarked by the user';
comment on column public.user_progress.isro_bookmark_removals is
  'ISRO CS question IDs explicitly unbookmarked by the user (tombstone set for union-merge)';
