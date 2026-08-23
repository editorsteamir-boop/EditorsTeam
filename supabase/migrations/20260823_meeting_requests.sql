-- EditorsTeam meeting requests
create table if not exists public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 2 and 60),
  last_name text not null check (char_length(last_name) between 2 and 80),
  age smallint not null check (age between 10 and 100),
  phone text not null check (phone ~ '^09[0-9]{9}$'),
  status text not null default 'pending' check (status in ('pending','contacted','completed','cancelled')),
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists meeting_requests_requested_at_idx on public.meeting_requests (requested_at desc);
create index if not exists meeting_requests_status_idx on public.meeting_requests (status, requested_at desc);
alter table public.meeting_requests enable row level security;
revoke all on table public.meeting_requests from anon, authenticated;
grant select, update, delete on table public.meeting_requests to authenticated;

drop policy if exists "meeting admins can read" on public.meeting_requests;
create policy "meeting admins can read" on public.meeting_requests for select to authenticated
  using (public.is_fonto_admin());
drop policy if exists "meeting admins can update" on public.meeting_requests;
create policy "meeting admins can update" on public.meeting_requests for update to authenticated
  using (public.is_fonto_admin()) with check (public.is_fonto_admin());
drop policy if exists "meeting admins can delete" on public.meeting_requests;
create policy "meeting admins can delete" on public.meeting_requests for delete to authenticated
  using (public.is_fonto_admin());

create or replace function public.submit_meeting_request(
  input_first_name text,
  input_last_name text,
  input_age integer,
  input_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  clean_first text := btrim(coalesce(input_first_name,''));
  clean_last text := btrim(coalesce(input_last_name,''));
  normalized_phone text := regexp_replace(
    translate(coalesce(input_phone,''),'۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩','01234567890123456789'),
    '[^0-9]','','g'
  );
  duplicate_count integer;
begin
  if char_length(clean_first) not between 2 and 60 then raise exception 'نام معتبر نیست'; end if;
  if char_length(clean_last) not between 2 and 80 then raise exception 'نام خانوادگی معتبر نیست'; end if;
  if input_age not between 10 and 100 then raise exception 'سن معتبر نیست'; end if;
  if normalized_phone !~ '^09[0-9]{9}$' then raise exception 'شماره تلفن معتبر نیست'; end if;

  select count(*) into duplicate_count from public.meeting_requests
  where phone=normalized_phone and requested_at>now()-interval '12 hours';
  if duplicate_count>0 then
    return jsonb_build_object('ok',true,'message','درخواست شما قبلاً ثبت شده و در حال بررسی است.');
  end if;

  insert into public.meeting_requests(first_name,last_name,age,phone)
  values(clean_first,clean_last,input_age,normalized_phone);
  return jsonb_build_object('ok',true,'message','درخواست شما با موفقیت ثبت شد؛ برای هماهنگی با شما تماس می‌گیریم.');
end;
$$;
revoke all on function public.submit_meeting_request(text,text,integer,text) from public;
grant execute on function public.submit_meeting_request(text,text,integer,text) to anon, authenticated;
notify pgrst, 'reload schema';