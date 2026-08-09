-- FEAT-032: persist practice-attempt timelines used by streaks/activity.
-- Run once in Supabase SQL Editor before testing cross-browser streak sync.
alter table public.user_progress
  add column if not exists progress_records jsonb not null default '{"standard": {}, "aptitude": {}}'::jsonb;

comment on column public.user_progress.progress_records is
  'Namespaced practice attempt records used for streaks and activity heatmaps';
