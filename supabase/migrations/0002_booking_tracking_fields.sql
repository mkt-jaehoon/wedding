-- 예약 추적 필드 + write-back RPC

alter table public.guests
  add column if not exists reservation_id text,
  add column if not exists buy_deadline timestamptz,
  add column if not exists booked_at timestamptz;

-- 예약 결과 write-back (관리자 비번 검증). p_leg: 'outbound' | 'inbound'
create or replace function public.admin_set_booking(
  p_passcode text,
  p_id uuid,
  p_leg text default 'outbound',
  p_train_no text default null,
  p_exact_time text default null,
  p_reservation_id text default null,
  p_buy_deadline timestamptz default null,
  p_status text default null
) returns public.guests language plpgsql security definer set search_path = public as $$
declare r public.guests;
begin
  if not public.admin_check(p_passcode) then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  if p_leg = 'inbound' then
    update public.guests set
      inbound_train_no = coalesce(p_train_no, inbound_train_no),
      inbound_exact_time = coalesce(p_exact_time, inbound_exact_time),
      reservation_id = coalesce(p_reservation_id, reservation_id),
      buy_deadline = coalesce(p_buy_deadline, buy_deadline),
      status = coalesce(p_status, status),
      booked_at = now(),
      updated_at = now()
    where id = p_id
    returning * into r;
  else
    update public.guests set
      outbound_train_no = coalesce(p_train_no, outbound_train_no),
      outbound_exact_time = coalesce(p_exact_time, outbound_exact_time),
      reservation_id = coalesce(p_reservation_id, reservation_id),
      buy_deadline = coalesce(p_buy_deadline, buy_deadline),
      status = coalesce(p_status, status),
      booked_at = now(),
      updated_at = now()
    where id = p_id
    returning * into r;
  end if;
  return r;
end; $$;

grant execute on function public.admin_set_booking(text, uuid, text, text, text, text, timestamptz, text) to anon, authenticated;
