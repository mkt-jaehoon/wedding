@AGENTS.md

# 부산 예식 하객 이동 대시보드 — 현재 상태 요약

서울권 → 부산 KTX·SRT 하객 이동 **수요 취합 → 예매 상태 관리 → 이동 현황 공유** CRM.
예식 2027-05-22(토) 13:30 아시아드시티웨딩홀 1층 마리아주홀(부산 연제구 월드컵대로 344) / 기차표 예매 오픈 2027-04-22(목) 07:00.

## 스택
Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase · Vercel · nodemailer.

## 페이지
- `/` 안내 + D-day + **예식장 지도**(구글맵 임베드 + 카카오/네이버 길찾기)
- `/apply` 하객 신청 폼
- `/status` 공개 이동 현황(마스킹: 이름 일부·노선·출발일·시간대·상태만)
- `/admin` 관리자(서버 쿠키 세션 인증) — 실명·연락처·메모·상태변경·노선별 CSV
- `/api/admin/*` 관리자 로그인/세션/목록/수정/삭제
- `/api/cron/notify` 예매 오픈 D-30/7/1/당일 이메일 알림(매일 cron, `vercel.json`)

## 데이터 / 보안 모델
- 데이터 계층 `src/lib/store/` — env 있으면 `supabase-store`, 없으면 `local-store`(데모/폴백).
- `guests` 테이블 RLS: anon은 INSERT만. 공개는 VIEW `guests_public`(안전 컬럼, 결제/안내→예매완료 합침).
- 관리자 데이터는 서버 라우트(`/api/admin/*`) → 비번 검증 `security definer` RPC로만 접근. 비번은 서버 전용 env(`ADMIN_PASSCODE`)+DB(`app_config`), 클라이언트 번들 비노출.
- 스키마: `supabase/migrations/0001_init_guests_schema.sql`.

## 환경변수 (`.env.example` 참고)
`NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`, `ADMIN_PASSCODE`, `ADMIN_SESSION_SECRET`,
`SMTP_HOST/PORT/USER/PASS`, `SMTP_FROM`, `NOTIFY_TO`, `CRON_SECRET`.
KTX/SRT 예매용 `KSKILL_KTX_*`, `KSKILL_SRT_*`는 로컬 `.env.local`에만 보관(커밋 금지).

## 배포
Vercel(프로덕션) https://wedding-swart-pi.vercel.app — GitHub `mkt-jaehoon/wedding` 연결, push 시 자동배포.

## 로드맵
- 완료: MVP, Supabase 연동, 관리자 보안(서버 쿠키), 지도, 이메일 알림.
- 다음: 실오픈 전 QA 데이터 정리 / 비번 로테이션, KTX·SRT 예매 준비 자동화(설계: `docs/booking-automation-design.md`).
