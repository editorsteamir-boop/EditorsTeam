-- Fonto Supabase schema

create table if not exists public.fonto_quick_styles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text,
  asset_url text not null,
  preview_url text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.fonto_text_themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fa text not null,
  title_en text not null,
  category text,
  effects_json jsonb default '{}'::jsonb,
  supports_fa boolean default true,
  supports_en boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_fonto_quick_styles_category
on public.fonto_quick_styles(category);

create index if not exists idx_fonto_text_themes_category
on public.fonto_text_themes(category);
