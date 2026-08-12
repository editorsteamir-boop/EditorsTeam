-- Fonto text-style library schema used by the static editor.

create table if not exists public.fonto_styles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null default 'effect',
  preview_url text not null,
  effects_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.fonto_import_history (
  id uuid primary key default gen_random_uuid(),
  file_count integer not null default 0,
  success_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.fonto_styles enable row level security;

revoke all on table public.fonto_styles from anon, authenticated;
grant select on table public.fonto_styles to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'fonto_styles'
      and policyname = 'Active Fonto styles are publicly readable'
  ) then
    create policy "Active Fonto styles are publicly readable"
      on public.fonto_styles
      for select
      to anon, authenticated
      using (is_active = true);
  end if;
end
$$;
