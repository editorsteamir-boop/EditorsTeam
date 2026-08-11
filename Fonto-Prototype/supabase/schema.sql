create table if not exists fonto_text_boxes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  image_url text not null,
  preview_url text,
  is_active boolean default true,
  created_at timestamp default now()
);

create table if not exists fonto_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  layers jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
