"""SRT(수서발) 조회/예약 — SRTrain 사용. 로그인/예약은 함수 호출 시에만 수행."""
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
    """date=YYYYMMDD, time=HHMMSS. 좌석 없는 열차도 포함해 반환."""
    srt = _client()
    return srt.search_train(dep, arr, date, time, available_only=False)


def reserve(dep: str, arr: str, date: str, time: str, index: int = 0):
    """좌석 가능한 열차 중 index번째 예약(결제 아님)."""
    srt = _client()
    trains = srt.search_train(dep, arr, date, time, available_only=True)
    if not trains:
        raise RuntimeError("예약 가능한 SRT 좌석 없음")
    return srt.reserve(trains[index])
