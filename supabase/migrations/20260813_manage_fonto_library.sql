-- Secure Fonto library management: custom quick styles and font ordering.

alter table public.fonto_fonts
  add column if not exists sort_order integer;

with ranked as (
  select id,
         row_number() over (
           order by
             case
               when lower(name) like '%iransansx-900%' then 1
               when lower(name) like '%dana-bold%' then 2
               when lower(name) like '%estedad%' then 3
               when lower(name) like '%shabnam-bold%' then 4
               when lower(name) like '%fa_peyda_bold%' then 5
               else 999
             end,
             name,
             id
         ) - 1 as position
  from public.fonto_fonts
)
update public.fonto_fonts f
set sort_order = ranked.position
from ranked
where f.id = ranked.id and f.sort_order is null;

alter table public.fonto_fonts
  alter column sort_order set default 0,
  alter column sort_order set not null;

create index if not exists fonto_fonts_active_sort_idx
  on public.fonto_fonts (is_active, sort_order, name);

create or replace function public.fonto_admin_list_quick_styles()
returns table (
  id uuid,
  slug text,
  title text,
  category text,
  asset_url text,
  preview_url text,
  text_color text,
  is_active boolean,
  sort_order integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_fonto_admin() then raise exception 'دسترسی مدیر لازم است'; end if;
  return query
    select s.id, s.slug, s.title, s.category, s.asset_url, s.preview_url,
           s.text_color, s.is_active, s.sort_order, s.created_at
    from public.fonto_quick_styles s
    order by s.sort_order, s.created_at, s.id;
end;
$$;

create or replace function public.fonto_admin_create_quick_style(
  input_title text,
  input_category text,
  input_asset_url text,
  input_text_color text default '#ffffff'
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, storage
as $$
declare
  clean_title text := btrim(coalesce(input_title, ''));
  clean_category text := lower(btrim(coalesce(input_category, 'instagram')));
  clean_asset text := btrim(coalesce(input_asset_url, ''));
  clean_color text := lower(btrim(coalesce(input_text_color, '#ffffff')));
  new_id uuid;
begin
  if not public.is_fonto_admin() then raise exception 'دسترسی مدیر لازم است'; end if;
  if char_length(clean_title) not between 2 and 80 then raise exception 'عنوان استایل معتبر نیست'; end if;
  if clean_category not in ('instagram', 'glass', 'neon', 'special') then raise exception 'دسته‌بندی معتبر نیست'; end if;
  if clean_asset !~ '^admin-quick-styles/[a-zA-Z0-9._/-]+[.]png$' then raise exception 'مسیر فایل PNG معتبر نیست'; end if;
  if clean_color !~ '^#[0-9a-f]{6}$' then raise exception 'رنگ متن معتبر نیست'; end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'fonto-text-boxes' and name = clean_asset
  ) then raise exception 'فایل آپلودشده پیدا نشد'; end if;

  insert into public.fonto_quick_styles (
    slug, title, category, asset_url, preview_url, text_color, is_active, sort_order
  ) values (
    'admin-' || replace(gen_random_uuid()::text, '-', ''),
    clean_title,
    clean_category,
    clean_asset,
    clean_asset,
    clean_color,
    true,
    coalesce((select max(sort_order) + 1 from public.fonto_quick_styles), 1)
  ) returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.fonto_admin_delete_quick_style(input_style_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, storage
as $$
declare
  stored_asset text;
begin
  if not public.is_fonto_admin() then raise exception 'دسترسی مدیر لازم است'; end if;
  delete from public.fonto_quick_styles
  where id = input_style_id
  returning asset_url into stored_asset;
  if stored_asset is null then return false; end if;
  -- The browser removes the object through the Storage API after this RPC.
  -- Direct writes to storage.objects are intentionally blocked by Supabase.
  return true;
end;
$$;

create or replace function public.fonto_admin_list_fonts()
returns table (
  id uuid,
  name text,
  category text,
  file_name text,
  is_active boolean,
  sort_order integer
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_fonto_admin() then raise exception 'دسترسی مدیر لازم است'; end if;
  return query
    select f.id, f.name, f.category, f.file_name, f.is_active, f.sort_order
    from public.fonto_fonts f
    order by f.sort_order, f.name, f.id;
end;
$$;

create or replace function public.fonto_admin_reorder_fonts(input_font_ids jsonb)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  changed integer;
begin
  if not public.is_fonto_admin() then raise exception 'دسترسی مدیر لازم است'; end if;
  if jsonb_typeof(input_font_ids) <> 'array' then raise exception 'ترتیب فونت‌ها معتبر نیست'; end if;
  if jsonb_array_length(input_font_ids) <> (select count(*) from public.fonto_fonts) then
    raise exception 'فهرست ترتیب فونت‌ها کامل نیست';
  end if;
  if (select count(distinct value) from jsonb_array_elements_text(input_font_ids)) <> jsonb_array_length(input_font_ids) then
    raise exception 'شناسه تکراری در ترتیب فونت‌ها وجود دارد';
  end if;

  with ordered as (
    select value::uuid as id, ordinality::integer - 1 as position
    from jsonb_array_elements_text(input_font_ids) with ordinality
  )
  update public.fonto_fonts f
  set sort_order = ordered.position
  from ordered
  where f.id = ordered.id;
  get diagnostics changed = row_count;
  if changed <> jsonb_array_length(input_font_ids) then raise exception 'برخی فونت‌ها پیدا نشدند'; end if;
  return changed;
end;
$$;

revoke all on function public.fonto_admin_list_quick_styles() from public, anon;
revoke all on function public.fonto_admin_create_quick_style(text, text, text, text) from public, anon;
revoke all on function public.fonto_admin_delete_quick_style(uuid) from public, anon;
revoke all on function public.fonto_admin_list_fonts() from public, anon;
revoke all on function public.fonto_admin_reorder_fonts(jsonb) from public, anon;

grant execute on function public.fonto_admin_list_quick_styles() to authenticated;
grant execute on function public.fonto_admin_create_quick_style(text, text, text, text) to authenticated;
grant execute on function public.fonto_admin_delete_quick_style(uuid) to authenticated;
grant execute on function public.fonto_admin_list_fonts() to authenticated;
grant execute on function public.fonto_admin_reorder_fonts(jsonb) to authenticated;

drop policy if exists "Authenticated upload fonts" on storage.objects;
drop policy if exists "Authenticated delete fonts" on storage.objects;
drop policy if exists "Authenticated users can upload Fonto files" on storage.objects;
drop policy if exists "Authenticated users can update Fonto files" on storage.objects;
drop policy if exists "Authenticated users can delete Fonto files" on storage.objects;

create policy "Fonto admins can upload library files"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('fonto-text-boxes', 'fonto-fonts')
  and (select public.is_fonto_admin())
);

create policy "Fonto admins can update library files"
on storage.objects for update to authenticated
using (
  bucket_id in ('fonto-text-boxes', 'fonto-fonts')
  and (select public.is_fonto_admin())
)
with check (
  bucket_id in ('fonto-text-boxes', 'fonto-fonts')
  and (select public.is_fonto_admin())
);

create policy "Fonto admins can delete library files"
on storage.objects for delete to authenticated
using (
  bucket_id in ('fonto-text-boxes', 'fonto-fonts')
  and (select public.is_fonto_admin())
);

notify pgrst, 'reload schema';
