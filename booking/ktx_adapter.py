"""KTX(코레일) 조회/예약 — korail2 사용.

주의: 공개 korail2는 코레일 모바일 anti-bot(Dynapath)에 막혀 MACRO ERROR가 날 수 있다.
실제 예매 시점에는 docs/skill-reference/ktx-booking.md 의 토큰 보강 helper가 필요할 수 있다.
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
    k = _client()
    return k.search_train(_st(dep), _st(arr), date, time)


def reserve(dep: str, arr: str, date: str, time: str, index: int = 0):
    k = _client()
    trains = k.search_train(_st(dep), _st(arr), date, time, available_only=True)
    if not trains:
        raise RuntimeError("예약 가능한 KTX 좌석 없음")
    return k.reserve(trains[index])
