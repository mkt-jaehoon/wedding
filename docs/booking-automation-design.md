# KTX·SRT 예매 준비 자동화 설계 (초안)

> 목표: 예매 오픈(2027-04-22 07:00)에 맞춰 **하객 명단 기반 좌석 조회·예약을 보조**한다.
> **결제는 자동화하지 않는다**(예약 확보까지만). 본 Next.js 앱과 분리된 Python 도구로 운영한다.

## 1. 범위 / 비범위
- 범위: 명단 취합 → 타깃 열차 확정 → 오픈 시각 좌석 조회·예약 → 결과 기록·알림.
- 비범위: 자동 결제, 무한 재시도, 좌석 강제 확보. (정책·약관·리스크 때문에 의도적으로 제외)

## 2. 전제 / 제약
- KTX(코레일): `korail2` + anti-bot 토큰 보강 helper. SRT: `SRTrain`. (참고: `docs/skill-reference/ktx-booking.md`, `srt-booking.md`)
- credential: `.env.local`의 `KSKILL_KTX_ID/PASSWORD`, `KSKILL_SRT_ID/PASSWORD` 사용. **공용·노출 이력 비번은 사용 전 변경**.
- 매진 시 공격적 재시도 금지. 오픈 직전 정책(오픈 시각·취소 규정) 재확인.
- 오픈 동시 다수 예약은 비현실적 → 그룹별 **순차 처리**.

## 3. 데이터 흐름
```
[Supabase guests]  --admin RPC/CSV-->  [예약 계획(plan.json)]
        |                                      |
        |                          (사람) 시간대→구체 열차 1·2지망 확정
        v                                      v
   오픈 07:00  -->  [run_ktx.py / run_srt.py]  --search→reserve(결제X)-->  예약번호/열차/구입기한
        |                                      |
        +------------- writeback -------------> [Supabase: status=BOOKED, train_no, reservation_id]
                                               |
                                          결과 요약 메일 + 결제기한 안내(사람이 수동 결제)
```

## 4. 컴포넌트
| 모듈 | 역할 |
|---|---|
| `booking/plan.py` | Supabase `admin_list_guests`(또는 `/admin` CSV)에서 명단을 읽어 노선·날짜·시간대·인원별 **예약 계획(JSON)** 생성 |
| `booking/run_ktx.py` | 계획대로 KTX 조회→예약 (helper). `train_id` 기반 stable selector 사용 |
| `booking/run_srt.py` | SRT 조회→예약 (`SRTrain`) |
| `booking/writeback.py` | 예약 결과를 Supabase에 반영 |
| 실행 | **오픈 시각 직전 수동 실행** 권장(좌석 경쟁·오류 대응이 사람 개입을 요함). cron 전면 자동화는 지양 |

## 5. DB 보강 제안 (필요 시 마이그레이션 추가)
- `guests`에 예약 추적 필드: `reservation_id text`, `buy_deadline timestamptz`, `booked_at timestamptz` (또는 별도 `bookings` 테이블).
- write-back 전용 RPC: `admin_set_booking(p_passcode, p_id, p_train_no, p_exact_time, p_reservation_id, p_status)` — 기존 `security definer` 패턴 재사용.
- 기존 `outbound_train_no/outbound_exact_time`, `inbound_*` 컬럼은 이미 존재 → 확정 열차 기록에 활용.

## 6. 단계별 계획
1. **D-30 (2027-03-23)**: 명단 확정, 타깃 시간대 점검. (알림 메일 이미 자동 발송)
2. **D-7 (2027-04-15)**: dry-run 조회로 열차 시간표·좌석 패턴 파악 → 그룹별 **1·2지망 열차** 확정.
3. **D-1**: credential·환경 점검, 리허설(조회까지).
4. **오픈일 07:00**: 제약 큰 그룹(대인원·왕복·특정시간) 우선, 그룹별 순차 예약 → 결과 기록.
5. **직후**: 구입기한 내 **수동 결제**, 하객 안내(상태 `NOTIFIED`).

## 7. 리스크 / 대응
- anti-bot 규칙 변경 → helper 점검 필요(오픈 전 dry-run으로 사전 감지).
- 동시 좌석 경쟁 → 1·2지망 + 인접 시간대 fallback, 인원 많은 그룹 우선.
- 자동 결제 미지원(의도적) → 결제기한 알림으로 보완.
- credential 보안 → env 주입, 저장소 커밋 금지(`.env.local` gitignore).

## 8. 미결정 (사람 입력 필요)
- 그룹별 구체 열차 선택 기준(시간대 → 열차).
- 좌석 등급(일반/특실), 동행 좌석 인접 요구.
- 예약 실패 시 대기/대체 정책, 1인당 예약 매수 한도.

## 9. 다음 액션
- [ ] 예약 추적용 DB 필드/RPC 추가 여부 결정
- [ ] `booking/plan.py` 부터 구현(명단 → 계획 JSON)
- [ ] D-7 dry-run 스크립트로 조회 검증
- [ ] 오픈일 실행 런북 작성
