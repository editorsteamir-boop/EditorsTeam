-- Fonto Library tables

create table if not exists public.fonto_text_boxes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  image_url text,
  preview_url text,
  text_area jsonb default '{}'::jsonb,
  effects_json jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.fonto_styles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  preview_url text,
  effects_json jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.fonto_import_history (
  id uuid primary key default gen_random_uuid(),
  file_count int default 0,
  success_count int default 0,
  failed_count int default 0,
  created_at timestamptz default now()
);
