-- FEAT-032 security audit and cleanup
-- Run in Supabase SQL Editor as the postgres role.
-- This protects private per-user data and removes broad public ALL policies
-- only from the three tables listed below.

begin;

-- 1) RLS must be enabled on every exposed user-data table.
alter table public.user_progress enable row level security;
alter table public.profiles enable row level security;
alter table public.sync_log enable row level security;

-- 1b) Keep public.profiles in sync with Supabase Auth. The user_progress and
-- sync_log foreign keys depend on this profile row existing first.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_new_auth_user();

-- Backfill existing Auth users whose profile row is missing.
insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- 2) Keep only least-privilege authenticated policies for user_progress.
drop policy if exists "Users can read their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;

create policy "Users can read their own progress"
on public.user_progress
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own progress"
on public.user_progress
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress"
on public.user_progress
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- 3) Profiles are private. Profile creation is normally performed by the
-- server-side Auth trigger; do not grant browser INSERT/DELETE access.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select to authenticated
using ((select auth.uid()) = id);

-- 4) Sync logs are append-only from the browser and remain private.
drop policy if exists "Users can insert their own sync logs" on public.sync_log;
create policy "Users can insert their own sync logs"
on public.sync_log
for insert to authenticated
with check ((select auth.uid()) = user_id);

-- 5) Remove any legacy public-role policies on only these tables.
-- This catches names other than the known legacy policy name and prevents
-- an accidental public SELECT/INSERT policy from bypassing the private model.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('user_progress', 'profiles', 'sync_log')
      and 'public' = any (roles)
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$$;

-- 6) Restrict Data API table grants as well as row access.
revoke all on table public.user_progress, public.profiles, public.sync_log from public, anon, authenticated;
grant select, insert, update on table public.user_progress to authenticated;
grant select on table public.profiles to authenticated;
grant insert on table public.sync_log to authenticated;

commit;

-- 7) Verification: all three rows should show relrowsecurity = true.
select
  n.nspname as schemaname,
  c.relname as tablename,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('user_progress', 'profiles', 'sync_log')
order by c.relname;

-- Verification: there should be no policies whose roles include public.
select policyname, tablename, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('user_progress', 'profiles', 'sync_log')
  and 'public' = any (roles)
order by tablename, policyname;

-- Verification: expected policy shape.
select table_name, privilege_type, grantee
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('user_progress', 'profiles', 'sync_log')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;
