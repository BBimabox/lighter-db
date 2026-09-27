-- Lighter DB v10 — run this in Supabase SQL Editor once.
-- Creates one JSON state row per signed-in user and a private photo bucket.

create table if not exists public.lighter_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.lighter_user_state enable row level security;
revoke all on table public.lighter_user_state from anon, authenticated;
grant select, insert, update, delete on table public.lighter_user_state to authenticated;

create policy "lighter state select own"
on public.lighter_user_state for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "lighter state insert own"
on public.lighter_user_state for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "lighter state update own"
on public.lighter_user_state for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "lighter state delete own"
on public.lighter_user_state for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('lighter-photos', 'lighter-photos', false)
on conflict (id) do update set public = false;

create policy "lighter photos select own"
on storage.objects for select
to authenticated
using (bucket_id = 'lighter-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "lighter photos insert own"
on storage.objects for insert
to authenticated
with check (bucket_id = 'lighter-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "lighter photos update own"
on storage.objects for update
to authenticated
using (bucket_id = 'lighter-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'lighter-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "lighter photos delete own"
on storage.objects for delete
to authenticated
using (bucket_id = 'lighter-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
