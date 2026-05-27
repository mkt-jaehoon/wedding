# booking — KTX·SRT 예매 준비 도구

하객 명단 기반으로 **좌석 조회·예약을 보조**한다. **결제는 자동화하지 않는다**(예약 확보까지만).
설계: [`docs/booking-automation-design.md`](../docs/booking-automation-design.md)

## 준비
- Python 3.10+ (`plan`/`writeback`은 표준 라이브러리만 사용)
- 실제 조회/예약 시: `pip install -r booking/requirements.txt`
- 자격증명은 저장소 루트 `.env.local`에서 로드:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_PASSCODE`,
  `KSKILL_SRT_ID/PASSWORD`, `KSKILL_KTX_ID/PASSWORD`

## 사용 (저장소 루트에서)
```bash
python3 -m booking.run plan              # 명단 -> 예약 계획 (booking/out/plan.json)
python3 -m booking.run search SRT        # 계획의 SRT 구간 조회 (dry-run)
python3 -m booking.run search KTX
RESERVE_CONFIRM=YES python3 -m booking.run reserve SRT   # 실제 예약(결제X)
python3 -m booking.run writeback booking/out/result.json # 결과 DB 반영
```

## 동작
- `plan`: Supabase `admin_list_guests`로 명단을 받아 노선/날짜/시간대로 묶고 좌석 수·대상 하객을 `out/plan.json`에 저장.
- `search`: 계획대로 열차 조회(운행일 **1개월 전**부터 결과가 나옴 — 그 전엔 빈 결과).
- `reserve`: 안전장치로 `RESERVE_CONFIRM=YES`가 있어야 실제 예약. 결과를 `out/reserve_*.json`에 저장.
- `writeback`: 예약 결과(JSON 배열)를 `admin_set_booking` RPC로 DB에 반영(`status=BOOKED`, 열차번호, 예약번호 등).

`writeback` 입력 형식:
```json
[{ "id": "<guest uuid>", "leg": "outbound", "train_no": "SRT 301",
   "exact_time": "07:00", "reservation_id": "...", "status": "BOOKED" }]
```

## 주의
- KTX(korail2)는 anti-bot으로 막힐 수 있음 → 오픈 전 `search`로 사전 점검, 필요 시 k-skill 토큰 보강 helper 사용.
- 매진 시 공격적 재시도 금지. 좌석 경쟁 큰 그룹부터 순차 처리.
- `out/`(plan/result)에는 실명이 포함되므로 커밋 금지(.gitignore 처리됨).
- 자격증명은 사용 전 로테이션 권장(공용 계정·채팅 노출 이력).
