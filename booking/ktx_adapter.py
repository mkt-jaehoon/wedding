"""KTX(코레일) 조회/예약 — korail2.

주의 1: 공개 korail2는 코레일 anti-bot(Dynapath)에 막혀 MACRO ERROR가 날 수 있다.
        실제 예매 시점에는 docs/skill-reference/ktx-booking.md 의 토큰 보강 helper 사용을 권장.
주의 2: 아래 reserve/정규화의 객체 필드는 D-7 dry-run에서 실제 응답으로 확인할 것.
"""
from . import config

# 우리 데이터의 역명 -> korail2 역명
STATION = {"서울역": "서울"}


def _client():
    try:
        from korail2 import Korail  # lazy import (pip install korail2 pycryptodome)
    except ImportError:
        raise SystemExit("korail2 미설치: pip install korail2 pycryptodome")
    if not (config.KTX_ID and config.KTX_PASSWORD):
        raise SystemExit("KTX 자격증명 누락(KSKILL_KTX_ID/PASSWORD)")
    return Korail(config.KTX_ID, config.KTX_PASSWORD)


def _st(name: str) -> str:
    return STATION.get(name, name)


def search(dep: str, arr: str, date: str, time: str):
    return _client().search_train(_st(dep), _st(arr), date, time)


def _passengers(party_size: int):
    if party_size <= 1:
        return None
    try:
        from korail2 import AdultPassenger
        return [AdultPassenger(party_size)]
    except Exception:  # noqa: BLE001
        return None


def _option(seat_class: str):
    try:
        from korail2 import ReserveOption
        return ReserveOption.SPECIAL_FIRST if seat_class == "special" else ReserveOption.GENERAL_FIRST
    except Exception:  # noqa: BLE001
        return None


def reserve_train(train, party_size: int = 1, seat_class: str = "general"):
    k = _client()
    kwargs = {}
    p = _passengers(party_size)
    if p is not None:
        kwargs["passengers"] = p
    o = _option(seat_class)
    if o is not None:
        kwargs["option"] = o
    try:
        return k.reserve(train, **kwargs)
    except TypeError:
        return k.reserve(train)


def normalize_train(train) -> dict:
    return {
        "train_no": str(getattr(train, "train_no", getattr(train, "train_number", "")) or ""),
        "dep_time": str(getattr(train, "dep_time", "") or ""),
    }


def normalize_reservation(res) -> dict:
    return {
        "reservation_id": str(getattr(res, "rsv_id", "") or str(res)),
        "buy_deadline": str(getattr(res, "buy_limit_date", "") or "") or None,
    }
