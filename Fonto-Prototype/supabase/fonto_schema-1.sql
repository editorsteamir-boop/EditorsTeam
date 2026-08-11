-- Fonto Supabase schema

create table if not exists public.fonto_text_boxes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  image_url text not null,
  preview_url text,
  text_area jsonb default '{}'::jsonb,
  default_font_size integer default 64,
  effects_json jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.fonto_styles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  preview_url text,
  effects_json jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_fonto_boxes_category
on public.fonto_text_boxes(category);

create index if not exists idx_fonto_styles_category
on public.fonto_styles(category);
