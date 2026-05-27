"""환경 설정 로딩. .env.local(로컬 전용)에서 값을 읽는다. 외부 의존성 없음."""
import os
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent


def _load_env_local() -> None:
    envf = _ROOT / ".env.local"
    if not envf.exists():
        return
    for line in envf.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        # 실제 환경변수가 우선. 없을 때만 파일 값 사용.
        os.environ.setdefault(k.strip(), v.strip())


_load_env_local()

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
ADMIN_PASSCODE = os.environ.get("ADMIN_PASSCODE", "")

KTX_ID = os.environ.get("KSKILL_KTX_ID", "")
KTX_PASSWORD = os.environ.get("KSKILL_KTX_PASSWORD", "")
SRT_ID = os.environ.get("KSKILL_SRT_ID", "")
SRT_PASSWORD = os.environ.get("KSKILL_SRT_PASSWORD", "")


def require_supabase() -> None:
    if not (SUPABASE_URL and SUPABASE_ANON_KEY and ADMIN_PASSCODE):
        raise SystemExit(
            "Supabase 설정 누락: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / ADMIN_PASSCODE 확인(.env.local)"
        )
