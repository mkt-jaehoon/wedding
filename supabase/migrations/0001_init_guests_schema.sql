-- 하객 이동 수요 CRM 스키마 + RLS + 공개 VIEW + 관리자 RPC
-- 적용: Supabase SQL Editor 또는 `supabase db push` / MCP apply_migration

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  real_name text not null,
  display_name text not null,
  phone text,
  group_name text,
  party_size int not null default 1 check (party_size >= 1),
  outbound_train_type text not null check (outbound_train_type in ('SRT','KTX')),
  outbound_from text not null,
  outbound_to text not null,
  outbound_date date not null,
  outbound_time_band text not null,
  outbound_train_no text,
  outbound_exact_time text,
  has_return boolean not null default false,
  inbound_train_type text check (inbound_train_type in ('SRT','KTX')),
  inbound_from text,
  inbound_to text,
  inbound_date date,
  inbound_time_band text,
  inbound_train_no text,
  inbound_exact_time text,
  status text not null default 'REQUESTED'
    check (status in ('REQUESTED','WAITING','BOOKED','PAID','NOTIFIED','CANCELLED')),
  admin_memo text,
  public_visible boolean not null default true,
  privacy_agreed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guests_created_idx on public.guests (created_at);

create table if not exists public.app_config (
  key text primary key,
  value text not null
);

-- RLS: anon은 INSERT만, SELECT/UPDATE/DELETE 차단
alter table public.guests enable row level security;
alter table public.app_config enable row level security;

drop policy if exists guests_insert_anon on public.guests;
create policy guests_insert_anon on public.guests
  for insert to anon, authenticated
  with check (true);

-- 공개 VIEW: 안전 컬럼만, 결제/안내 단계는 예매완료(BOOKED)로 합쳐 노출
drop view if exists public.guests_public;
create view public.guests_public
with (security_invoker = false) as
select
  id,
  display_name,
  outbound_train_type, outbound_from, outbound_to, outbound_date, outbound_time_band,
  has_return,
  inbound_train_type, inbound_from, inbound_to, inbound_date, inbound_time_band,
  case status
    when 'PAID' then 'BOOKED'
    when 'NOTIFIED' then 'BOOKED'
    else status
  end as public_status,
  created_at
from public.guests
where public_visible = true and status <> 'CANCELLED';

grant select on public.guests_public to anon, authenticated;

-- 관리자 RPC (security definer): 비밀번호 검증 후에만 전체 데이터 접근
create or replace function public.admin_check(p_passcode text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text;
begin
  select value into v from public.app_config where key = 'admin_passcode';
  return v is not null and p_passcode = v;
end; $$;

create or replace function public.admin_list_guests(p_passcode text)
returns setof public.guests language plpgsql security definer set search_path = public as $$
begin
  if not public.admin_check(p_passcode) then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  return query select * from public.guests order by created_at;
end; $$;

create or replace function public.admin_update_guest(
  p_passcode text, p_id uuid,
  p_status text default null,
  p_public_visible boolean default null,
  p_admin_memo text default null
) returns public.guests language plpgsql security definer set search_path = public as $$
declare r public.guests;
begin
  if not public.admin_check(p_passcode) then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  update public.guests set
    status = coalesce(p_status, status),
    public_visible = coalesce(p_public_visible, public_visible),
    admin_memo = case when p_admin_memo is null then admin_memo else nullif(p_admin_memo, '') end,
    updated_at = now()
  where id = p_id
  returning * into r;
  return r;
end; $$;

create or replace function public.admin_delete_guest(p_passcode text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.admin_check(p_passcode) then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  delete from public.guests where id = p_id;
end; $$;

grant execute on function public.admin_list_guests(text) to anon, authenticated;
grant execute on function public.admin_update_guest(text, uuid, text, boolean, text) to anon, authenticated;
grant execute on function public.admin_delete_guest(text, uuid) to anon, authenticated;
revoke execute on function public.admin_check(text) from anon, authenticated, public;

-- 관리자 비밀번호(운영 시 반드시 변경):
--   update public.app_config set value = '새비밀번호' where key = 'admin_passcode';
insert into public.app_config(key, value) values ('admin_passcode', 'wedding2027')
on conflict (key) do nothing;
