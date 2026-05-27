# 부산 예식 하객 이동 현황 대시보드

서울권 → 부산 KTX·SRT 하객 이동 **수요 취합 → 예매 상태 관리 → 이동 현황 공유** 운영 대시보드.

- 예식: **2027-05-22 (토) 13:30 · 부산 아시아드 주경기장**
- 기차표 예매 오픈: **2027-04-22 (목) 07:00** (출발 1개월 전, 정책 변동 가능)
- 노선: 하행 `수서→부산(SRT)` · `서울역→부산(KTX)`, 상행 `부산→수서` · `부산→서울역`
- 스택: Next.js 16 (App Router) · React 19 · Tailwind v4 · **Supabase** · Vercel

## 페이지

| 경로 | 설명 | 공개 범위 |
|---|---|---|
| `/` | 안내 + D-day | 공개 |
| `/apply` | 하객 탑승 신청 폼 | 공개 |
| `/status` | 하객 이동 현황(마스킹) | 공개 |
| `/admin` | 관리자 대시보드 | 접근 코드 필요 |

## 개인정보 보안 모델 (핵심)

민감 데이터(실명·연락처·메모·결제 단계)가 공개 경로로 새지 않도록 **DB 레벨**에서 분리한다.

- `guests` 테이블은 **RLS**로 anon에 **INSERT만 허용**, SELECT/UPDATE/DELETE 차단
- 공개 페이지(`/status`)는 안전 컬럼만 노출하는 **VIEW `guests_public`** 만 조회
  (실명/연락처/메모 없음, 결제완료·안내완료는 `예매완료`로 합쳐 노출)
- 관리자(`/admin`)는 **비밀번호를 DB에서 검증하는 `security definer` RPC**(`admin_list_guests` 등)로만 전체 데이터 접근
- 따라서 공개 anon 키로 base 테이블을 직접 조회해도 빈 결과만 반환됨 (검증 완료)

> 관리자 인증은 아직 **임시(접근 코드)** 입니다. 운영 전 서버 쿠키 또는 Supabase Auth로 교체 권장(로드맵 2차).

## 로컬 실행

```bash
pnpm install
cp .env.example .env.local   # Supabase URL/KEY/PASSCODE 입력
pnpm dev                     # http://localhost:3000
```

> WSL2 mirrored 네트워킹에서 Windows 브라우저가 `localhost`에 접속 안 되면,
> `.wslconfig`에 `hostAddressLoopback=true` 추가 후 `wsl --shutdown` 하거나 배포 URL로 확인.

## 환경변수

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon(publishable) 키 |
| `NEXT_PUBLIC_ADMIN_PASSCODE` | `/admin` 접근 코드(데모 검증/UX용) |

- **셋 다 없으면** 데모(localStorage) 모드로 동작 — 브라우저별 분리, 시드 데이터 표시.
- 관리자 비밀번호의 실제 검증값은 DB `app_config.admin_passcode` 다. 변경:
  ```sql
  update public.app_config set value = '새비밀번호' where key = 'admin_passcode';
  ```

## Supabase 설정

스키마는 `supabase/migrations/0001_init_guests_schema.sql` 에 있다.

1. Supabase 프로젝트 생성
2. SQL Editor에 위 마이그레이션 실행 (또는 `supabase db push`)
3. 프로젝트 Settings → API에서 URL·anon 키 확인 후 `.env.local` 입력

## 데이터 흐름

```
[/apply 폼] --insert(anon)--> guests (RLS: insert만)
[/status]   --select-------> guests_public (VIEW, 안전 컬럼)
[/admin]    --rpc(passcode)-> admin_list/update/delete (security definer)
```

데이터 접근은 `src/lib/store/`로 추상화 — `index.ts`가 환경변수 유무로 Supabase/데모를 자동 선택.

```
src/lib/store/
  types.ts          # GuestStore 인터페이스
  supabase-store.ts # Supabase 구현(공유 DB)
  local-store.ts    # 데모 구현(localStorage 폴백)
  index.ts          # 활성 스토어 선택
```

## Vercel 배포

```bash
vercel --prod
```

- Vercel 프로젝트 환경변수에 위 3개(`NEXT_PUBLIC_*`)를 Production/Preview에 등록.
- 현재 배포: https://wedding-swart-pi.vercel.app

## 로드맵

1. ✅ MVP (수요 취합·상태 관리·공개 현황·CSV)
2. ✅ Supabase 연동 (공유 DB · RLS · 공개 VIEW · 관리자 RPC)
3. **관리자 보안 강화** — 서버 쿠키 로그인 또는 Supabase Auth (현 접근 코드 대체)
4. **운영 QA** — 가짜 하객 20~30명으로 신청/수정/공개/CSV 전수 테스트
5. **알림 자동화** — 예매 오픈 D-30 / D-7 / D-1 Slack·이메일
6. **예매 실행 보조** — `docs/skill-reference/` KTX/SRT 가이드 기반(결제 제외)
