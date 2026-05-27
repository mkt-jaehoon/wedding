"""Supabase REST(RPC) 연동. 표준 라이브러리(urllib)만 사용."""
import json
import urllib.request
import urllib.error

from . import config


def _rpc(name: str, payload: dict) -> object:
    config.require_supabase()
    url = f"{config.SUPABASE_URL}/rest/v1/rpc/{name}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("apikey", config.SUPABASE_ANON_KEY)
    req.add_header("Authorization", f"Bearer {config.SUPABASE_ANON_KEY}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")
        if e.code == 403 or "unauthorized" in detail:
            raise SystemExit("관리자 인증 실패: ADMIN_PASSCODE가 DB와 일치하는지 확인")
        raise SystemExit(f"Supabase RPC 오류({e.code}): {detail}")


def list_guests() -> list[dict]:
    """관리자 전체 명단(실명/연락처 포함)."""
    data = _rpc("admin_list_guests", {"p_passcode": config.ADMIN_PASSCODE})
    return data or []


def set_booking(
    guest_id: str,
    leg: str = "outbound",
    train_no: str | None = None,
    exact_time: str | None = None,
    reservation_id: str | None = None,
    buy_deadline: str | None = None,
    status: str | None = None,
) -> dict:
    """예약 결과 write-back."""
    return _rpc(
        "admin_set_booking",
        {
            "p_passcode": config.ADMIN_PASSCODE,
            "p_id": guest_id,
            "p_leg": leg,
            "p_train_no": train_no,
            "p_exact_time": exact_time,
            "p_reservation_id": reservation_id,
            "p_buy_deadline": buy_deadline,
            "p_status": status,
        },
    )
