-- 하객 본인 탑승/좌석 조회 (이름 + 연락처 일치 시 본인 건만).
-- 실명/연락처/메모는 반환하지 않음(마스킹 이름 + 탑승 정보만).
create or replace function public.lookup_my_booking(p_name text, p_phone text)
returns table (
  display_name text,
  status text,
  party_size int,
  outbound_train_type text, outbound_from text, outbound_to text,
  outbound_date date, outbound_time_band text,
  outbound_train_no text, outbound_exact_time text,
  has_return boolean,
  inbound_train_type text, inbound_from text, inbound_to text,
  inbound_date date, inbound_time_band text,
  inbound_train_no text, inbound_exact_time text,
  buy_deadline timestamptz
) language plpgsql security definer set search_path = public as $$
declare ph text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
begin
  if char_length(ph) < 7 or coalesce(trim(p_name), '') = '' then
    return;
  end if;
  return query
  select g.display_name, g.status, g.party_size,
    g.outbound_train_type, g.outbound_from, g.outbound_to,
    g.outbound_date, g.outbound_time_band,
    g.outbound_train_no, g.outbound_exact_time,
    g.has_return,
    g.inbound_train_type, g.inbound_from, g.inbound_to,
    g.inbound_date, g.inbound_time_band,
    g.inbound_train_no, g.inbound_exact_time,
    g.buy_deadline
  from public.guests g
  where trim(g.real_name) = trim(p_name)
    and regexp_replace(coalesce(g.phone, ''), '[^0-9]', '', 'g') = ph;
end; $$;

grant execute on function public.lookup_my_booking(text, text) to anon, authenticated;
