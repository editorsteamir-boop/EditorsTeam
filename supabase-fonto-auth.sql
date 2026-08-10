-- EditorsTeam / Fonto password authentication
-- Run this once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.fonto_access (
  id integer primary key check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.fonto_access enable row level security;
drop policy if exists "No direct select fonto access" on public.fonto_access;
drop policy if exists "No direct write fonto access" on public.fonto_access;

create or replace function public.verify_fonto_password(input_password text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.fonto_access
    where id=1 and password_hash = crypt(input_password, password_hash)
  );
$$;

revoke all on table public.fonto_access from anon, authenticated;
revoke all on function public.verify_fonto_password(text) from public;
grant execute on function public.verify_fonto_password(text) to anon, authenticated;

-- رمز اولیه: 383838
insert into public.fonto_access(id,password_hash)
values (1, crypt('383838', gen_salt('bf')))
on conflict (id) do update set password_hash=excluded.password_hash, updated_at=now();