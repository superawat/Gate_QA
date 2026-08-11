-- AUG-005: keep Aptitude solved/bookmarked IDs in the cloud backup.
-- JSONB arrays match the local-first storage contract used by FilterContext.
alter table public.user_progress
  add column if not exists aptitude_solved jsonb not null default '[]'::jsonb,
  add column if not exists aptitude_bookmarks jsonb not null default '[]'::jsonb;

comment on column public.user_progress.aptitude_solved is
  'Canonical Aptitude question IDs solved by the user';

comment on column public.user_progress.aptitude_bookmarks is
  'Canonical Aptitude question IDs bookmarked by the user';
