# 예매 실행 런북 (KTX·SRT)

예매 오픈: **2027-04-22(목) 07:00** (출발 1개월 전). 결제는 사람이 수동으로 한다.
도구: [`booking/`](../booking/README.md) · 설계: [`booking-automation-design.md`](booking-automation-design.md)

## 0. 사전 준비 (한 번)
```bash
pip install -r booking/requirements.txt
```
- `.env.local`에 `KSKILL_SRT_*`, `KSKILL_KTX_*`, Supabase, `ADMIN_PASSCODE` 존재 확인.
- **자격증명 로테이션**(권장): 코레일/SRT 사이트에서 비밀번호 변경 후 `.env.local` 갱신.

## 1. D-30 (2027-03-23)
- 자동 알림 메일 수신(설정 완료). 명단 마감 공지.
- `python3 -m booking.run plan` 으로 현재 수요 확인.

## 2. D-7 (2027-04-15) — dry-run & 열차 확정 ⭐
```bash
python3 -m booking.run plan          # 최신 명단 -> booking/out/plan.json
python3 -m booking.run search SRT    # SRT 구간 실제 열차 조회
python3 -m booking.run search KTX    # KTX 구간 (anti-bot 시 아래 참고)
```
- 조회 결과를 보고 `booking/out/plan.json`에서 그룹별로 직접 편집:
  - `prefer_times`: 1·2지망 출발시각(HHMMSS, 우선순위순). 예: `["070000","073000"]`
  - `seat_class`: `general`(일반실) 또는 `special`(특실)
- **KTX anti-bot**: `search KTX`가 MACRO ERROR/빈 결과면, `docs/skill-reference/ktx-booking.md`의 토큰 보강 helper로 조회·예약(권장). SRT는 SRTrain으로 직접 가능.
- ⚠️ 어댑터의 열차/예약 필드 매핑(`normalize_*`)을 이때 실제 응답으로 검증·보정한다.

## 3. D-1 (2027-04-21)
- 로그인·조회 리허설(`search`)로 자격증명·환경 점검.
- 그룹 우선순위 확정: **대인원·왕복·특정시간** 그룹 먼저.

## 4. 오픈일 (2027-04-22 07:00)
```bash
RESERVE_CONFIRM=YES python3 -m booking.run reserve SRT
RESERVE_CONFIRM=YES python3 -m booking.run reserve KTX
```
- 그룹별로 `prefer_times` 순서대로 열차 선택 → **하객(파티)별 개별 예약**(각자 결제 주체).
- 결과: `booking/out/result_srt.json`, `result_ktx.json`.
- 매진 시 공격적 재시도 금지 — 인접 시간대로 수동 조정.

## 5. 반영 & 결제
```bash
python3 -m booking.run writeback booking/out/result_srt.json
python3 -m booking.run writeback booking/out/result_ktx.json
```
- DB에 `status=BOOKED`, 열차번호/예약번호/구입기한 기록 → `/admin`에서 확인.
- **구입기한 내 코레일/SRT 앱에서 수동 결제** → 결제 후 `/admin`에서 상태 `결제완료`로 변경.
- 하객 안내 발송 후 상태 `안내완료`.

## 운영 정리 (실오픈 직전, 가짜 QA 데이터 비우기)
```sql
-- Supabase SQL Editor
delete from public.guests;   -- 전체 삭제 (실제 신청 받기 전)
```
또는 관리자에게 요청하면 일괄 정리. (현재 DB에는 QA용 가짜 하객이 들어 있음)

## 체크리스트
- [ ] 자격증명 로테이션 + `.env.local` 갱신
- [ ] D-7 `search`로 열차 확정, `plan.json`의 prefer_times/seat_class 편집
- [ ] D-7 어댑터 필드 매핑 검증
- [ ] 오픈일 reserve → writeback
- [ ] 구입기한 내 수동 결제 → 상태 갱신 → 하객 안내
- [ ] 운영 시작 전 QA 데이터 삭제
