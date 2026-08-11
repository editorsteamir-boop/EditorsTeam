-- Fonto Storage security policies
-- Run this in Supabase SQL Editor

-- Text boxes bucket policies
create policy "Admin can upload text boxes"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'fonto-text-boxes'
);

create policy "Public can read text boxes"
on storage.objects
for select
to public
using (
  bucket_id = 'fonto-text-boxes'
);

create policy "Admin can delete text boxes"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'fonto-text-boxes'
);

-- Fonts bucket
create policy "Admin can upload fonts"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'fonto-fonts'
);

create policy "Public can read fonts"
on storage.objects
for select
to public
using (
  bucket_id = 'fonto-fonts'
);

-- Table protection
alter table public.fonto_text_boxes enable row level security;

create policy "Public read active text boxes"
on public.fonto_text_boxes
for select
using (is_active = true);

create policy "Authenticated manage text boxes"
on public.fonto_text_boxes
for all
to authenticated
using (true)
with check (true);
