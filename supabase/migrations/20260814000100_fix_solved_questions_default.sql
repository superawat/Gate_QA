-- Align solved_questions column default from legacy '{}'::jsonb to canonical '[]'::jsonb array.
alter table public.user_progress
  alter column solved_questions set default '[]'::jsonb;

comment on column public.user_progress.solved_questions is
  'Canonical GATE CSE question IDs solved by the user (JSONB array)';
