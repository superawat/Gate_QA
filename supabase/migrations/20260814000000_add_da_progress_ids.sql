-- AUG-014: keep GATE DA solved/bookmarked IDs in the cloud backup.
-- JSONB arrays match the local-first storage contract used by FilterContext.
alter table public.user_progress
  add column if not exists da_solved jsonb not null default '[]'::jsonb,
  add column if not exists da_bookmarks jsonb not null default '[]'::jsonb;

comment on column public.user_progress.da_solved is
  'Canonical GATE DA question IDs solved by the user';

comment on column public.user_progress.da_bookmarks is
  'Canonical GATE DA question IDs bookmarked by the user';
