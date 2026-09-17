-- Migration: 20260917000000_add_solved_removals.sql
-- DEC-112: Fix "Unsolved Questions Become Solved Again" (LWW-Element-Set CRDT for Solved Questions).
-- Adds nullable JSONB columns for tracking unsolve tombstones and solve timestamps as epoch maps { [uid]: epochMs }.
-- Default is NULL (treated as empty map by application logic for backwards compatibility).
-- The LWW merge algorithm compares solve timestamps against removal timestamps to guarantee that
-- explicit unsolve actions persist permanently across cloud sync and navigation without resurrection,
-- while also supporting unlimited Solve -> Unsolve -> Solve cycles without getting stuck in a permanent tombstone.
--
-- Design invariants:
--   • NULL is treated as an empty map (backward compatible with older clients and rows).
--   • LWW comparison: question is solved iff T_solve > T_remove.
--   • Re-solving assigns a new T_solve > T_remove and clears or supersedes previous removal.

alter table public.user_progress
  add column if not exists solved_removals jsonb default null,
  add column if not exists solved_timestamps jsonb default null,
  add column if not exists aptitude_solved_removals jsonb default null,
  add column if not exists aptitude_solved_timestamps jsonb default null,
  add column if not exists da_solved_removals jsonb default null,
  add column if not exists da_solved_timestamps jsonb default null;

comment on column public.user_progress.solved_removals is
  'GATE CSE question unsolve tombstones mapping question UID to removal epoch timestamp { [uid]: epochMs }';

comment on column public.user_progress.solved_timestamps is
  'GATE CSE question solve timestamps mapping question UID to solve epoch timestamp { [uid]: epochMs }';

comment on column public.user_progress.aptitude_solved_removals is
  'Aptitude question unsolve tombstones mapping question UID to removal epoch timestamp { [uid]: epochMs }';

comment on column public.user_progress.aptitude_solved_timestamps is
  'Aptitude question solve timestamps mapping question UID to solve epoch timestamp { [uid]: epochMs }';

comment on column public.user_progress.da_solved_removals is
  'GATE DA question unsolve tombstones mapping question UID to removal epoch timestamp { [uid]: epochMs }';

comment on column public.user_progress.da_solved_timestamps is
  'GATE DA question solve timestamps mapping question UID to solve epoch timestamp { [uid]: epochMs }';
