"""SRT(수서발) 조회/예약 — SRTrain. 로그인/예약은 함수 호출 시에만 수행.

주의: 아래 reserve/정규화의 라이브러리 객체 필드는 D-7 dry-run에서 실제 응답으로 확인할 것.
"""
from . import config


def _client():
    try:
        from SRT import SRT  # lazy import (pip install SRTrain)
    except ImportError:
        raise SystemExit("SRTrain 미설치: pip install SRTrain")
    if not (config.SRT_ID and config.SRT_PASSWORD):
        raise SystemExit("SRT 자격증명 누락(KSKILL_SRT_ID/PASSWORD)")
    return SRT(config.SRT_ID, config.SRT_PASSWORD)


def search(dep: str, arr: str, date: str, time: str):
    """date=YYYYMMDD, time=HHMMSS. 좌석 없는 열차도 포함."""
    return _client().search_train(dep, arr, date, time, available_only=False)


def _passengers(party_size: int):
    if party_size <= 1:
        return None
    try:
        from SRT.passenger import Adult
        return [Adult(party_size)]
    except Exception:  # noqa: BLE001 — API 변동 대비
        return None


def _seat(seat_class: str):
    try:
        from SRT.seat_type import SeatType
        return SeatType.SPECIAL_FIRST if seat_class == "special" else SeatType.GENERAL_FIRST
    except Exception:  # noqa: BLE001
        return None


def reserve_train(train, party_size: int = 1, seat_class: str = "general"):
    """검색 결과의 특정 train을 party_size명 예약(결제 아님)."""
    srt = _client()
    kwargs = {}
    p = _passengers(party_size)
    if p is not None:
        kwargs["passengers"] = p
    s = _seat(seat_class)
    if s is not None:
        kwargs["special_seat"] = s
    try:
        return srt.reserve(train, **kwargs)
    except TypeError:
        return srt.reserve(train)  # 시그니처 차이 시 기본 예약


def normalize_train(train) -> dict:
    return {
        "train_no": str(getattr(train, "train_number", getattr(train, "train_no", "")) or ""),
        "dep_time": str(getattr(train, "dep_time", "") or ""),
    }


def normalize_reservation(res) -> dict:
    return {
        "reservation_id": str(getattr(res, "reservation_number", getattr(res, "rsv_id", "")) or str(res)),
        "buy_deadline": str(getattr(res, "payment_date", "") or "") or None,
    }
