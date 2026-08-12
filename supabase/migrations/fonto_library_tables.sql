-- Fonto quick-style and bilingual text-theme libraries used by the static editor.
-- The retired fonto_styles table is intentionally removed.

begin;
set local lock_timeout = '5s';

drop table if exists public.fonto_styles;

create table if not exists public.fonto_quick_styles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'instagram',
  asset_url text not null,
  preview_url text not null,
  text_color text not null default '#ffffff',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.fonto_text_themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fa text not null,
  title_en text not null,
  category text not null default 'trend',
  preview_text_fa text not null default 'نمونه فارسی',
  preview_text_en text not null default 'English Style',
  effects_json jsonb not null default '{}'::jsonb,
  supports_fa boolean not null default true,
  supports_en boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint fonto_text_themes_bilingual check (supports_fa and supports_en)
);

create table if not exists public.fonto_import_history (
  id uuid primary key default gen_random_uuid(),
  file_count integer not null default 0,
  success_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_fonto_quick_styles_category_sort
  on public.fonto_quick_styles(category, sort_order);
create index if not exists idx_fonto_text_themes_category_sort
  on public.fonto_text_themes(category, sort_order);

alter table public.fonto_quick_styles enable row level security;
alter table public.fonto_text_themes enable row level security;
alter table public.fonto_import_history enable row level security;

revoke all on table public.fonto_quick_styles from anon, authenticated;
revoke all on table public.fonto_text_themes from anon, authenticated;
revoke all on table public.fonto_import_history from anon, authenticated;
grant select on table public.fonto_quick_styles to anon, authenticated;
grant select on table public.fonto_text_themes to anon, authenticated;

drop policy if exists "Active Fonto quick styles are publicly readable" on public.fonto_quick_styles;
create policy "Active Fonto quick styles are publicly readable"
  on public.fonto_quick_styles
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Active bilingual Fonto text themes are publicly readable" on public.fonto_text_themes;
create policy "Active bilingual Fonto text themes are publicly readable"
  on public.fonto_text_themes
  for select
  to anon, authenticated
  using (is_active = true and supports_fa = true and supports_en = true);

insert into public.fonto_quick_styles
  (slug, title, category, asset_url, preview_url, text_color, is_active, sort_order)
values
  ('quick-01', 'غروب — کپسول گرادیانی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-01-sunset-pill.png', 'library-v2-e8c1d4f7/quick/trend-01-sunset-pill.png', '#ffffff', true, 1),
  ('quick-02', 'غروب — شیشه‌ای نرم', 'glass', 'library-v2-e8c1d4f7/quick/trend-02-sunset-glass.png', 'library-v2-e8c1d4f7/quick/trend-02-sunset-glass.png', '#ffffff', true, 2),
  ('quick-03', 'غروب — قاب نئون', 'neon', 'library-v2-e8c1d4f7/quick/trend-03-sunset-neon.png', 'library-v2-e8c1d4f7/quick/trend-03-sunset-neon.png', '#ffffff', true, 3),
  ('quick-04', 'غروب — حباب مدرن', 'instagram', 'library-v2-e8c1d4f7/quick/trend-04-sunset-bubble.png', 'library-v2-e8c1d4f7/quick/trend-04-sunset-bubble.png', '#ffffff', true, 4),
  ('quick-05', 'غروب — لایه‌ای سه‌بعدی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-05-sunset-layered.png', 'library-v2-e8c1d4f7/quick/trend-05-sunset-layered.png', '#ffffff', true, 5),
  ('quick-06', 'آبی — کپسول گرادیانی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-06-aqua-pill.png', 'library-v2-e8c1d4f7/quick/trend-06-aqua-pill.png', '#ffffff', true, 6),
  ('quick-07', 'آبی — شیشه‌ای نرم', 'glass', 'library-v2-e8c1d4f7/quick/trend-07-aqua-glass.png', 'library-v2-e8c1d4f7/quick/trend-07-aqua-glass.png', '#ffffff', true, 7),
  ('quick-08', 'آبی — قاب نئون', 'neon', 'library-v2-e8c1d4f7/quick/trend-08-aqua-neon.png', 'library-v2-e8c1d4f7/quick/trend-08-aqua-neon.png', '#ffffff', true, 8),
  ('quick-09', 'آبی — حباب مدرن', 'instagram', 'library-v2-e8c1d4f7/quick/trend-09-aqua-bubble.png', 'library-v2-e8c1d4f7/quick/trend-09-aqua-bubble.png', '#ffffff', true, 9),
  ('quick-10', 'آبی — لایه‌ای سه‌بعدی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-10-aqua-layered.png', 'library-v2-e8c1d4f7/quick/trend-10-aqua-layered.png', '#ffffff', true, 10),
  ('quick-11', 'نعنایی — کپسول گرادیانی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-11-mint-pill.png', 'library-v2-e8c1d4f7/quick/trend-11-mint-pill.png', '#06281e', true, 11),
  ('quick-12', 'نعنایی — شیشه‌ای نرم', 'glass', 'library-v2-e8c1d4f7/quick/trend-12-mint-glass.png', 'library-v2-e8c1d4f7/quick/trend-12-mint-glass.png', '#06281e', true, 12),
  ('quick-13', 'نعنایی — قاب نئون', 'neon', 'library-v2-e8c1d4f7/quick/trend-13-mint-neon.png', 'library-v2-e8c1d4f7/quick/trend-13-mint-neon.png', '#06281e', true, 13),
  ('quick-14', 'نعنایی — حباب مدرن', 'instagram', 'library-v2-e8c1d4f7/quick/trend-14-mint-bubble.png', 'library-v2-e8c1d4f7/quick/trend-14-mint-bubble.png', '#06281e', true, 14),
  ('quick-15', 'نعنایی — لایه‌ای سه‌بعدی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-15-mint-layered.png', 'library-v2-e8c1d4f7/quick/trend-15-mint-layered.png', '#06281e', true, 15),
  ('quick-16', 'بری — کپسول گرادیانی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-16-berry-pill.png', 'library-v2-e8c1d4f7/quick/trend-16-berry-pill.png', '#ffffff', true, 16),
  ('quick-17', 'بری — شیشه‌ای نرم', 'glass', 'library-v2-e8c1d4f7/quick/trend-17-berry-glass.png', 'library-v2-e8c1d4f7/quick/trend-17-berry-glass.png', '#ffffff', true, 17),
  ('quick-18', 'بری — قاب نئون', 'neon', 'library-v2-e8c1d4f7/quick/trend-18-berry-neon.png', 'library-v2-e8c1d4f7/quick/trend-18-berry-neon.png', '#ffffff', true, 18),
  ('quick-19', 'بری — حباب مدرن', 'instagram', 'library-v2-e8c1d4f7/quick/trend-19-berry-bubble.png', 'library-v2-e8c1d4f7/quick/trend-19-berry-bubble.png', '#ffffff', true, 19),
  ('quick-20', 'بری — لایه‌ای سه‌بعدی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-20-berry-layered.png', 'library-v2-e8c1d4f7/quick/trend-20-berry-layered.png', '#ffffff', true, 20),
  ('quick-21', 'طلایی — کپسول گرادیانی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-21-gold-pill.png', 'library-v2-e8c1d4f7/quick/trend-21-gold-pill.png', '#201500', true, 21),
  ('quick-22', 'طلایی — شیشه‌ای نرم', 'glass', 'library-v2-e8c1d4f7/quick/trend-22-gold-glass.png', 'library-v2-e8c1d4f7/quick/trend-22-gold-glass.png', '#201500', true, 22),
  ('quick-23', 'طلایی — قاب نئون', 'neon', 'library-v2-e8c1d4f7/quick/trend-23-gold-neon.png', 'library-v2-e8c1d4f7/quick/trend-23-gold-neon.png', '#201500', true, 23),
  ('quick-24', 'طلایی — حباب مدرن', 'instagram', 'library-v2-e8c1d4f7/quick/trend-24-gold-bubble.png', 'library-v2-e8c1d4f7/quick/trend-24-gold-bubble.png', '#201500', true, 24),
  ('quick-25', 'طلایی — لایه‌ای سه‌بعدی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-25-gold-layered.png', 'library-v2-e8c1d4f7/quick/trend-25-gold-layered.png', '#201500', true, 25),
  ('quick-26', 'آسمانی — کپسول گرادیانی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-26-sky-pill.png', 'library-v2-e8c1d4f7/quick/trend-26-sky-pill.png', '#ffffff', true, 26),
  ('quick-27', 'آسمانی — شیشه‌ای نرم', 'glass', 'library-v2-e8c1d4f7/quick/trend-27-sky-glass.png', 'library-v2-e8c1d4f7/quick/trend-27-sky-glass.png', '#ffffff', true, 27),
  ('quick-28', 'آسمانی — قاب نئون', 'neon', 'library-v2-e8c1d4f7/quick/trend-28-sky-neon.png', 'library-v2-e8c1d4f7/quick/trend-28-sky-neon.png', '#ffffff', true, 28),
  ('quick-29', 'آسمانی — حباب مدرن', 'instagram', 'library-v2-e8c1d4f7/quick/trend-29-sky-bubble.png', 'library-v2-e8c1d4f7/quick/trend-29-sky-bubble.png', '#ffffff', true, 29),
  ('quick-30', 'آسمانی — لایه‌ای سه‌بعدی', 'instagram', 'library-v2-e8c1d4f7/quick/trend-30-sky-layered.png', 'library-v2-e8c1d4f7/quick/trend-30-sky-layered.png', '#ffffff', true, 30)
on conflict (slug) do update
set title = excluded.title,
    category = excluded.category,
    asset_url = excluded.asset_url,
    preview_url = excluded.preview_url,
    text_color = excluded.text_color,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

delete from public.fonto_quick_styles
where slug not in ('quick-01', 'quick-02', 'quick-03', 'quick-04', 'quick-05', 'quick-06', 'quick-07', 'quick-08', 'quick-09', 'quick-10', 'quick-11', 'quick-12', 'quick-13', 'quick-14', 'quick-15', 'quick-16', 'quick-17', 'quick-18', 'quick-19', 'quick-20', 'quick-21', 'quick-22', 'quick-23', 'quick-24', 'quick-25', 'quick-26', 'quick-27', 'quick-28', 'quick-29', 'quick-30');

insert into public.fonto_text_themes
  (slug, title_fa, title_en, category, preview_text_fa, preview_text_en, effects_json,
   supports_fa, supports_en, is_active, sort_order)
values
  ('aurora-pop', 'پاپ شفق', 'Aurora Pop', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#09152f","preview_bg_b":"#24105d","fill_stops":[{"at":0,"color":"#5efce8"},{"at":0.5,"color":"#b56cff"},{"at":1,"color":"#ff4fb3"}],"gradient_direction":"diagonal","outlines":[{"color":"#ffffff","width":2}],"shadows":[{"color":"#4c1d95","blur":14,"x":0,"y":5}]}'::jsonb, true, true, true, 1),
  ('sunset-viral', 'غروب وایرال', 'Sunset Viral', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#251136","preview_bg_b":"#60103f","fill_stops":[{"at":0,"color":"#ffe66d"},{"at":0.48,"color":"#ff7a59"},{"at":1,"color":"#ff2d95"}],"gradient_direction":"horizontal","outlines":[{"color":"#4a1035","width":3}],"shadows":[{"color":"#ff2d95","blur":12,"x":0,"y":3}]}'::jsonb, true, true, true, 2),
  ('aqua-pulse', 'نبض آبی', 'Aqua Pulse', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#021d2e","preview_bg_b":"#063e58","fill_stops":[{"at":0,"color":"#d9fff8"},{"at":0.45,"color":"#45f3ff"},{"at":1,"color":"#008cff"}],"gradient_direction":"vertical","outlines":[{"color":"#003f73","width":3},{"color":"#eaffff","width":1}],"shadows":[{"color":"#00d9ff","blur":16,"x":0,"y":0}]}'::jsonb, true, true, true, 3),
  ('berry-chrome', 'کروم بِری', 'Berry Chrome', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#20091c","preview_bg_b":"#4d123a","fill_stops":[{"at":0,"color":"#fff1fb"},{"at":0.22,"color":"#ff89d6"},{"at":0.52,"color":"#ffffff"},{"at":0.75,"color":"#bd2f91"},{"at":1,"color":"#63104d"}],"gradient_direction":"vertical","outlines":[{"color":"#3a082d","width":4},{"color":"#ffb8e7","width":1}],"shadows":[{"color":"#ff36b7","blur":10,"x":0,"y":4}]}'::jsonb, true, true, true, 4),
  ('lime-pop', 'لیمویی پاپ', 'Lime Pop', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#0b221a","preview_bg_b":"#153c20","fill_stops":[{"at":0,"color":"#f7ff62"},{"at":1,"color":"#58f779"}],"gradient_direction":"diagonal","outlines":[{"color":"#071b12","width":4}],"depth":5,"depth_color":"#16883d","depth_offset_x":0.65,"depth_offset_y":1,"shadows":[{"color":"#000000","blur":7,"x":2,"y":7}]}'::jsonb, true, true, true, 5),
  ('cosmic-candy', 'آبنبات کیهانی', 'Cosmic Candy', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#09051c","preview_bg_b":"#21114f","fill_stops":[{"at":0,"color":"#58e7ff"},{"at":0.35,"color":"#9a7cff"},{"at":0.7,"color":"#ff66cf"},{"at":1,"color":"#ffd166"}],"gradient_direction":"horizontal","outlines":[{"color":"#ffffff","width":1.5},{"color":"#23104d","width":4}],"shadows":[{"color":"#9c5cff","blur":18,"x":0,"y":0},{"color":"#000000","blur":5,"x":0,"y":5}]}'::jsonb, true, true, true, 6),
  ('peach-glow', 'درخشش هلویی', 'Peach Glow', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#32152d","preview_bg_b":"#6b2c44","fill_stops":[{"at":0,"color":"#fff1d6"},{"at":0.5,"color":"#ffc19f"},{"at":1,"color":"#ff7d91"}],"gradient_direction":"vertical","outlines":[{"color":"#7a2b47","width":2}],"shadows":[{"color":"#ff8c9e","blur":18,"x":0,"y":2}]}'::jsonb, true, true, true, 7),
  ('electric-violet', 'بنفش الکتریکی', 'Electric Violet', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#0b0730","preview_bg_b":"#251175","fill_stops":[{"at":0,"color":"#f5e8ff"},{"at":0.4,"color":"#ba7cff"},{"at":1,"color":"#6536ff"}],"gradient_direction":"vertical","outlines":[{"color":"#16095d","width":4},{"color":"#ffffff","width":1}],"shadows":[{"color":"#854dff","blur":17,"x":0,"y":0}]}'::jsonb, true, true, true, 8),
  ('ocean-reel', 'ریلز اقیانوسی', 'Ocean Reel', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#001b35","preview_bg_b":"#005a75","fill_stops":[{"at":0,"color":"#e8ffff"},{"at":0.35,"color":"#58f3e8"},{"at":1,"color":"#00a7e8"}],"gradient_direction":"diagonal","outlines":[{"color":"#00495e","width":3}],"depth":3,"depth_color":"#00718c","shadows":[{"color":"#00131d","blur":6,"x":0,"y":6}]}'::jsonb, true, true, true, 9),
  ('rose-ice', 'یخ رز', 'Rose Ice', 'trend', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#2b1021","preview_bg_b":"#631b3e","fill_stops":[{"at":0,"color":"#ffffff"},{"at":0.28,"color":"#ffd4ec"},{"at":0.58,"color":"#ff8cc8"},{"at":1,"color":"#d9368b"}],"gradient_direction":"vertical","outlines":[{"color":"#7d164f","width":3},{"color":"#fff2fa","width":1}],"shadows":[{"color":"#ff5aad","blur":12,"x":0,"y":3}]}'::jsonb, true, true, true, 10),
  ('royal-gold', 'طلای سلطنتی', 'Royal Gold', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#150f02","preview_bg_b":"#392806","fill_stops":[{"at":0,"color":"#6d4300"},{"at":0.16,"color":"#ffe991"},{"at":0.34,"color":"#fff7c7"},{"at":0.52,"color":"#c88a09"},{"at":0.72,"color":"#fff1a0"},{"at":1,"color":"#704300"}],"gradient_direction":"vertical","outlines":[{"color":"#3a2200","width":4},{"color":"#ffe69a","width":1}],"depth":4,"depth_color":"#6b4308","shadows":[{"color":"#000000","blur":8,"x":1,"y":7}]}'::jsonb, true, true, true, 11),
  ('champagne-gold', 'طلای شامپاینی', 'Champagne Gold', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#23190f","preview_bg_b":"#5a4631","fill_stops":[{"at":0,"color":"#7d6549"},{"at":0.2,"color":"#f9e7c1"},{"at":0.45,"color":"#fffaf0"},{"at":0.65,"color":"#d6b681"},{"at":1,"color":"#8a6d48"}],"gradient_direction":"vertical","outlines":[{"color":"#5c4328","width":3},{"color":"#fff4d8","width":1}],"shadows":[{"color":"#000000","blur":7,"x":0,"y":5}]}'::jsonb, true, true, true, 12),
  ('antique-gold', 'طلای آنتیک', 'Antique Gold', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#16140b","preview_bg_b":"#383019","fill_stops":[{"at":0,"color":"#4d3e0c"},{"at":0.25,"color":"#c9aa3b"},{"at":0.48,"color":"#f6dc72"},{"at":0.68,"color":"#8e721e"},{"at":1,"color":"#d1b24a"}],"gradient_direction":"diagonal","outlines":[{"color":"#2d260c","width":4},{"color":"#d9bd54","width":1}],"depth":5,"depth_color":"#4a3a0c","shadows":[{"color":"#000000","blur":5,"x":2,"y":7}]}'::jsonb, true, true, true, 13),
  ('rose-gold', 'رزگلد', 'Rose Gold', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#28151a","preview_bg_b":"#5f343a","fill_stops":[{"at":0,"color":"#6f3a40"},{"at":0.18,"color":"#ffd4c8"},{"at":0.4,"color":"#fff0e8"},{"at":0.62,"color":"#c77b77"},{"at":0.82,"color":"#ffe0d1"},{"at":1,"color":"#784148"}],"gradient_direction":"vertical","outlines":[{"color":"#51272d","width":4},{"color":"#ffd5ca","width":1}],"shadows":[{"color":"#12070a","blur":8,"x":1,"y":6}]}'::jsonb, true, true, true, 14),
  ('black-gold', 'طلای مشکی', 'Black Gold', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#050505","preview_bg_b":"#24200e","fill_stops":[{"at":0,"color":"#0a0a0a"},{"at":0.3,"color":"#f6d461"},{"at":0.5,"color":"#fff0a8"},{"at":0.7,"color":"#a56c00"},{"at":1,"color":"#080808"}],"gradient_direction":"diagonal","outlines":[{"color":"#000000","width":5},{"color":"#d6a923","width":1.5}],"depth":3,"depth_color":"#332500","shadows":[{"color":"#000000","blur":10,"x":0,"y":7}]}'::jsonb, true, true, true, 15),
  ('liquid-silver', 'نقره مایع', 'Liquid Silver', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#10151c","preview_bg_b":"#34404d","fill_stops":[{"at":0,"color":"#39434d"},{"at":0.14,"color":"#f7fbff"},{"at":0.31,"color":"#929eaa"},{"at":0.48,"color":"#ffffff"},{"at":0.68,"color":"#707b86"},{"at":0.86,"color":"#eef4f8"},{"at":1,"color":"#3b4650"}],"gradient_direction":"vertical","outlines":[{"color":"#202933","width":4},{"color":"#f5fbff","width":1}],"shadows":[{"color":"#000000","blur":8,"x":1,"y":6}]}'::jsonb, true, true, true, 16),
  ('chrome-silver', 'نقره کروم', 'Chrome Silver', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#11131a","preview_bg_b":"#313745","fill_stops":[{"at":0,"color":"#171b20"},{"at":0.17,"color":"#ffffff"},{"at":0.34,"color":"#87929d"},{"at":0.5,"color":"#eef5fa"},{"at":0.58,"color":"#4b5661"},{"at":0.78,"color":"#ffffff"},{"at":1,"color":"#242b32"}],"gradient_direction":"vertical","outlines":[{"color":"#11161c","width":5},{"color":"#d9e2e8","width":1.5}],"depth":4,"depth_color":"#303943","shadows":[{"color":"#000000","blur":6,"x":2,"y":7}]}'::jsonb, true, true, true, 17),
  ('platinum', 'پلاتینیوم', 'Platinum', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#181b20","preview_bg_b":"#4a5059","fill_stops":[{"at":0,"color":"#7e858d"},{"at":0.24,"color":"#f8f9fa"},{"at":0.44,"color":"#c7ccd1"},{"at":0.66,"color":"#ffffff"},{"at":1,"color":"#777f88"}],"gradient_direction":"diagonal","outlines":[{"color":"#343a40","width":3},{"color":"#ffffff","width":1}],"shadows":[{"color":"#000000","blur":9,"x":0,"y":5}]}'::jsonb, true, true, true, 18),
  ('gunmetal', 'گان‌متال', 'Gunmetal', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#090b0e","preview_bg_b":"#252a31","fill_stops":[{"at":0,"color":"#11161b"},{"at":0.25,"color":"#818b95"},{"at":0.46,"color":"#d2d8dd"},{"at":0.65,"color":"#4a545e"},{"at":1,"color":"#101419"}],"gradient_direction":"vertical","outlines":[{"color":"#050608","width":4},{"color":"#7d8790","width":1}],"depth":5,"depth_color":"#1b2229","shadows":[{"color":"#000000","blur":9,"x":2,"y":8}]}'::jsonb, true, true, true, 19),
  ('silver-ice', 'نقره یخی', 'Silver Ice', 'metallic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#08202d","preview_bg_b":"#164a61","fill_stops":[{"at":0,"color":"#5b7f91"},{"at":0.18,"color":"#ffffff"},{"at":0.4,"color":"#bfefff"},{"at":0.58,"color":"#edfaff"},{"at":0.78,"color":"#70aabd"},{"at":1,"color":"#dff8ff"}],"gradient_direction":"vertical","outlines":[{"color":"#16495a","width":4},{"color":"#eaffff","width":1}],"shadows":[{"color":"#54d9ff","blur":13,"x":0,"y":2}]}'::jsonb, true, true, true, 20),
  ('neon-pink', 'نئون صورتی', 'Neon Pink', 'neon', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#090711","preview_bg_b":"#260720","color":"#fff7fc","outlines":[{"color":"#ff3cac","width":3}],"shadows":[{"color":"#ff2ba6","blur":22,"x":0,"y":0},{"color":"#ff2ba6","blur":8,"x":0,"y":0}]}'::jsonb, true, true, true, 21),
  ('neon-cyan', 'نئون فیروزه‌ای', 'Neon Cyan', 'neon', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#041218","preview_bg_b":"#07313b","color":"#efffff","outlines":[{"color":"#21ecff","width":3}],"shadows":[{"color":"#00e5ff","blur":22,"x":0,"y":0},{"color":"#00e5ff","blur":8,"x":0,"y":0}]}'::jsonb, true, true, true, 22),
  ('neon-violet', 'نئون بنفش', 'Neon Violet', 'neon', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#0b061a","preview_bg_b":"#27105b","color":"#fff8ff","outlines":[{"color":"#9b5cff","width":3}],"shadows":[{"color":"#8f4cff","blur":24,"x":0,"y":0},{"color":"#d36cff","blur":8,"x":0,"y":0}]}'::jsonb, true, true, true, 23),
  ('neon-lime', 'نئون لیمویی', 'Neon Lime', 'neon', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#07120b","preview_bg_b":"#15351b","color":"#fbfff1","outlines":[{"color":"#7cff45","width":3}],"shadows":[{"color":"#61ff38","blur":23,"x":0,"y":0},{"color":"#a7ff5b","blur":8,"x":0,"y":0}]}'::jsonb, true, true, true, 24),
  ('neon-sunset', 'نئون غروب', 'Neon Sunset', 'neon', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#170619","preview_bg_b":"#48112b","fill_stops":[{"at":0,"color":"#fff7d1"},{"at":1,"color":"#ffffff"}],"gradient_direction":"horizontal","outlines":[{"color":"#ff6a3d","width":3}],"shadows":[{"color":"#ff2d8d","blur":22,"x":0,"y":0},{"color":"#ff8a35","blur":10,"x":0,"y":0}]}'::jsonb, true, true, true, 25),
  ('neon-blue', 'نئون آبی', 'Neon Blue', 'neon', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#03091c","preview_bg_b":"#092a66","color":"#f2f7ff","outlines":[{"color":"#3478ff","width":3}],"shadows":[{"color":"#1267ff","blur":24,"x":0,"y":0},{"color":"#3ba7ff","blur":8,"x":0,"y":0}]}'::jsonb, true, true, true, 26),
  ('neon-red', 'نئون قرمز', 'Neon Red', 'neon', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#160404","preview_bg_b":"#4c0d0d","color":"#fff7f4","outlines":[{"color":"#ff3131","width":3}],"shadows":[{"color":"#ff1d1d","blur":23,"x":0,"y":0},{"color":"#ff653f","blur":8,"x":0,"y":0}]}'::jsonb, true, true, true, 27),
  ('neon-white', 'نئون سفید', 'Neon White', 'neon', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#06080c","preview_bg_b":"#252a32","color":"#ffffff","outlines":[{"color":"#dff8ff","width":2}],"shadows":[{"color":"#e8fbff","blur":20,"x":0,"y":0},{"color":"#79dfff","blur":8,"x":0,"y":0}]}'::jsonb, true, true, true, 28),
  ('pop-3d-yellow', 'سه‌بعدی زرد', 'Yellow Pop 3D', '3d', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#17120a","preview_bg_b":"#47351a","fill_stops":[{"at":0,"color":"#fff76a"},{"at":1,"color":"#ffc400"}],"gradient_direction":"vertical","outlines":[{"color":"#19130a","width":4}],"depth":8,"depth_color":"#8d5700","shadows":[{"color":"#000000","blur":8,"x":2,"y":10}]}'::jsonb, true, true, true, 29),
  ('coral-3d', 'سه‌بعدی مرجانی', 'Coral 3D', '3d', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#291019","preview_bg_b":"#652233","fill_stops":[{"at":0,"color":"#ffb08e"},{"at":1,"color":"#ff526c"}],"gradient_direction":"vertical","outlines":[{"color":"#5b1830","width":4}],"depth":8,"depth_color":"#9e294b","shadows":[{"color":"#000000","blur":8,"x":2,"y":10}]}'::jsonb, true, true, true, 30),
  ('violet-3d', 'سه‌بعدی بنفش', 'Violet 3D', '3d', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#130d31","preview_bg_b":"#3c247d","fill_stops":[{"at":0,"color":"#e8c7ff"},{"at":1,"color":"#8d52ff"}],"gradient_direction":"vertical","outlines":[{"color":"#291064","width":4}],"depth":9,"depth_color":"#4a24a8","shadows":[{"color":"#000000","blur":8,"x":2,"y":11}]}'::jsonb, true, true, true, 31),
  ('ocean-3d', 'سه‌بعدی اقیانوسی', 'Ocean 3D', '3d', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#051c2b","preview_bg_b":"#0c4d62","fill_stops":[{"at":0,"color":"#bafff5"},{"at":1,"color":"#16c6d9"}],"gradient_direction":"vertical","outlines":[{"color":"#063d4a","width":4}],"depth":8,"depth_color":"#08758a","shadows":[{"color":"#000000","blur":8,"x":2,"y":10}]}'::jsonb, true, true, true, 32),
  ('mint-3d', 'سه‌بعدی نعنایی', 'Mint 3D', '3d', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#10251d","preview_bg_b":"#266148","fill_stops":[{"at":0,"color":"#e2ffd4"},{"at":1,"color":"#65e68d"}],"gradient_direction":"vertical","outlines":[{"color":"#174d33","width":4}],"depth":8,"depth_color":"#2b9c5b","shadows":[{"color":"#000000","blur":7,"x":2,"y":10}]}'::jsonb, true, true, true, 33),
  ('candy-3d', 'سه‌بعدی آبنباتی', 'Candy 3D', '3d', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#28132e","preview_bg_b":"#6e2e6c","fill_stops":[{"at":0,"color":"#fff2fd"},{"at":0.5,"color":"#ff8ddd"},{"at":1,"color":"#b768ff"}],"gradient_direction":"diagonal","outlines":[{"color":"#54205f","width":4},{"color":"#fff1ff","width":1}],"depth":7,"depth_color":"#7b36a8","shadows":[{"color":"#000000","blur":8,"x":2,"y":9}]}'::jsonb, true, true, true, 34),
  ('stone-3d', 'سه‌بعدی سنگی', 'Stone 3D', '3d', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#141414","preview_bg_b":"#424242","fill_stops":[{"at":0,"color":"#f0eee8"},{"at":0.45,"color":"#aaa7a0"},{"at":1,"color":"#dedbd4"}],"gradient_direction":"vertical","outlines":[{"color":"#3a3936","width":4}],"depth":8,"depth_color":"#66635f","shadows":[{"color":"#000000","blur":10,"x":3,"y":11}]}'::jsonb, true, true, true, 35),
  ('obsidian-3d', 'سه‌بعدی آبسیدین', 'Obsidian 3D', '3d', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#030303","preview_bg_b":"#1d1a24","fill_stops":[{"at":0,"color":"#4e4857"},{"at":0.35,"color":"#17141b"},{"at":0.55,"color":"#8a7a9a"},{"at":1,"color":"#0a090c"}],"gradient_direction":"vertical","outlines":[{"color":"#000000","width":5},{"color":"#756685","width":1}],"depth":9,"depth_color":"#17121d","shadows":[{"color":"#000000","blur":12,"x":3,"y":12}]}'::jsonb, true, true, true, 36),
  ('ink-clean', 'جوهر مینیمال', 'Ink Clean', 'minimal', 'نمونه فارسی', 'English Style', '{"font_weight":800,"opacity":1,"preview_bg_a":"#e9ecef","preview_bg_b":"#ffffff","color":"#111827"}'::jsonb, true, true, true, 37),
  ('white-soft', 'سفید نرم', 'Soft White', 'minimal', 'نمونه فارسی', 'English Style', '{"font_weight":800,"opacity":1,"preview_bg_a":"#27364a","preview_bg_b":"#53677f","color":"#ffffff","shadows":[{"color":"#0b1220","blur":7,"x":0,"y":4}]}'::jsonb, true, true, true, 38),
  ('midnight-clean', 'نیمه‌شب', 'Midnight Clean', 'minimal', 'نمونه فارسی', 'English Style', '{"font_weight":800,"opacity":1,"preview_bg_a":"#dce6f0","preview_bg_b":"#f7fafc","color":"#101b31","outlines":[{"color":"#59708f","width":1}]}'::jsonb, true, true, true, 39),
  ('editorial-red', 'قرمز ادیتوریال', 'Editorial Red', 'minimal', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#f7f0eb","preview_bg_b":"#fffdf9","color":"#d92828"}'::jsonb, true, true, true, 40),
  ('warm-sand', 'شن گرم', 'Warm Sand', 'minimal', 'نمونه فارسی', 'English Style', '{"font_weight":800,"opacity":1,"preview_bg_a":"#2a241d","preview_bg_b":"#514536","color":"#f4dfbd","outlines":[{"color":"#6c583d","width":1}]}'::jsonb, true, true, true, 41),
  ('mono-outline', 'دورخط مونو', 'Mono Outline', 'minimal', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#0e1116","preview_bg_b":"#303641","color":"#0e1116","outlines":[{"color":"#ffffff","width":2.5}],"shadows":[{"color":"#000000","blur":3,"x":0,"y":3}]}'::jsonb, true, true, true, 42),
  ('clean-blue', 'آبی تمیز', 'Clean Blue', 'minimal', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#eff7ff","preview_bg_b":"#ffffff","color":"#1769e0","outlines":[{"color":"#b9d6ff","width":1}]}'::jsonb, true, true, true, 43),
  ('movie-gold', 'طلایی سینمایی', 'Movie Gold', 'cinematic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#080706","preview_bg_b":"#2a2110","fill_stops":[{"at":0,"color":"#8c620e"},{"at":0.26,"color":"#ffe89a"},{"at":0.52,"color":"#fff6ce"},{"at":0.74,"color":"#c79422"},{"at":1,"color":"#6a4305"}],"gradient_direction":"vertical","outlines":[{"color":"#2b1a00","width":4}],"shadows":[{"color":"#000000","blur":13,"x":1,"y":8}]}'::jsonb, true, true, true, 44),
  ('noir-title', 'عنوان نوآر', 'Noir Title', 'cinematic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#050505","preview_bg_b":"#252525","fill_stops":[{"at":0,"color":"#ffffff"},{"at":0.5,"color":"#b7b7b7"},{"at":1,"color":"#f5f5f5"}],"gradient_direction":"vertical","outlines":[{"color":"#000000","width":5}],"shadows":[{"color":"#ffffff","blur":4,"x":0,"y":0}]}'::jsonb, true, true, true, 45),
  ('fire-title', 'عنوان آتشین', 'Fire Title', 'cinematic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#180300","preview_bg_b":"#5a1000","fill_stops":[{"at":0,"color":"#fff5a5"},{"at":0.36,"color":"#ffb000"},{"at":0.72,"color":"#ff3b11"},{"at":1,"color":"#9d0000"}],"gradient_direction":"vertical","outlines":[{"color":"#4a0900","width":4}],"shadows":[{"color":"#ff2a00","blur":15,"x":0,"y":4}]}'::jsonb, true, true, true, 46),
  ('ice-title', 'عنوان یخی', 'Ice Title', 'cinematic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#031321","preview_bg_b":"#0d496a","fill_stops":[{"at":0,"color":"#ffffff"},{"at":0.34,"color":"#c6f6ff"},{"at":0.7,"color":"#58c9ff"},{"at":1,"color":"#1477b9"}],"gradient_direction":"vertical","outlines":[{"color":"#0a4b72","width":4},{"color":"#f0feff","width":1}],"shadows":[{"color":"#4cd9ff","blur":12,"x":0,"y":3}]}'::jsonb, true, true, true, 47),
  ('retro-poster', 'پوستر رترو', 'Retro Poster', 'cinematic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#392d22","preview_bg_b":"#7a5738","fill_stops":[{"at":0,"color":"#fff1b8"},{"at":1,"color":"#e8a94f"}],"gradient_direction":"vertical","outlines":[{"color":"#4b2b1b","width":5}],"depth":6,"depth_color":"#9b472b","shadows":[{"color":"#24160e","blur":4,"x":3,"y":8}]}'::jsonb, true, true, true, 48),
  ('cyberpunk', 'سایبرپانک', 'Cyberpunk', 'cinematic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#07051b","preview_bg_b":"#26105b","fill_stops":[{"at":0,"color":"#00f6ff"},{"at":0.48,"color":"#c8ff00"},{"at":1,"color":"#ff2bd6"}],"gradient_direction":"horizontal","outlines":[{"color":"#13043d","width":4},{"color":"#ffffff","width":1}],"shadows":[{"color":"#ff2bd6","blur":15,"x":3,"y":0},{"color":"#00eaff","blur":12,"x":-3,"y":0}]}'::jsonb, true, true, true, 49),
  ('luxury-emerald', 'زمرد لوکس', 'Luxury Emerald', 'cinematic', 'نمونه فارسی', 'English Style', '{"font_weight":900,"opacity":1,"preview_bg_a":"#04130e","preview_bg_b":"#123b2b","fill_stops":[{"at":0,"color":"#d8fff0"},{"at":0.3,"color":"#68e6b4"},{"at":0.58,"color":"#d6b65b"},{"at":1,"color":"#1b8a65"}],"gradient_direction":"diagonal","outlines":[{"color":"#052d20","width":4},{"color":"#e9cf7a","width":1}],"shadows":[{"color":"#000000","blur":9,"x":1,"y":7}]}'::jsonb, true, true, true, 50)
on conflict (slug) do update
set title_fa = excluded.title_fa,
    title_en = excluded.title_en,
    category = excluded.category,
    preview_text_fa = excluded.preview_text_fa,
    preview_text_en = excluded.preview_text_en,
    effects_json = excluded.effects_json,
    supports_fa = excluded.supports_fa,
    supports_en = excluded.supports_en,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

delete from public.fonto_text_themes
where slug not in ('aurora-pop', 'sunset-viral', 'aqua-pulse', 'berry-chrome', 'lime-pop', 'cosmic-candy', 'peach-glow', 'electric-violet', 'ocean-reel', 'rose-ice', 'royal-gold', 'champagne-gold', 'antique-gold', 'rose-gold', 'black-gold', 'liquid-silver', 'chrome-silver', 'platinum', 'gunmetal', 'silver-ice', 'neon-pink', 'neon-cyan', 'neon-violet', 'neon-lime', 'neon-sunset', 'neon-blue', 'neon-red', 'neon-white', 'pop-3d-yellow', 'coral-3d', 'violet-3d', 'ocean-3d', 'mint-3d', 'candy-3d', 'stone-3d', 'obsidian-3d', 'ink-clean', 'white-soft', 'midnight-clean', 'editorial-red', 'warm-sand', 'mono-outline', 'clean-blue', 'movie-gold', 'noir-title', 'fire-title', 'ice-title', 'retro-poster', 'cyberpunk', 'luxury-emerald');

commit;
