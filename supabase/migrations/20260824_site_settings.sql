create table if not exists public.site_settings (
  setting_key text primary key check (char_length(setting_key) between 2 and 80),
  setting_value text not null check (char_length(setting_value) between 1 and 500),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
revoke all on table public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

drop policy if exists "public read meeting intro" on public.site_settings;
create policy "public read meeting intro"
  on public.site_settings for select to anon, authenticated
  using (setting_key = 'meeting_intro');

drop policy if exists "admin insert site settings" on public.site_settings;
create policy "admin insert site settings"
  on public.site_settings for insert to authenticated
  with check ((select public.is_fonto_admin()));

drop policy if exists "admin update site settings" on public.site_settings;
create policy "admin update site settings"
  on public.site_settings for update to authenticated
  using ((select public.is_fonto_admin()))
  with check ((select public.is_fonto_admin()));

insert into public.site_settings(setting_key, setting_value)
values ('meeting_intro', 'اطلاعاتتان را وارد کنید تا برای هماهنگی زمان جلسه با شما تماس بگیریم.')
on conflict (setting_key) do nothing;

notify pgrst, 'reload schema';