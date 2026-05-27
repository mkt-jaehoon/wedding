"""명단 -> 예약 계획. 노선/날짜/시간대로 묶어 좌석 수와 대상 하객을 정리."""
from __future__ import annotations

# 시간대 -> 조회 시작 시각(HHMMSS). helper search의 출발 기준 시각.
TIME_BAND_START = {
    "DAWN": "050000",
    "EARLY_AM": "070000",
    "LATE_AM": "090000",
    "NOON": "110000",
    "PM": "130000",
    "EVENING": "170000",
}

TIME_BAND_LABEL = {
    "DAWN": "새벽", "EARLY_AM": "이른오전", "LATE_AM": "오전",
    "NOON": "낮", "PM": "오후", "EVENING": "저녁",
}


def _leg_fields(g: dict, leg: str):
    p = "outbound" if leg == "outbound" else "inbound"
    return {
        "train_type": g.get(f"{p}_train_type"),
        "from": g.get(f"{p}_from"),
        "to": g.get(f"{p}_to"),
        "date": g.get(f"{p}_date"),
        "time_band": g.get(f"{p}_time_band"),
    }


def build_plan(guests: list[dict]) -> list[dict]:
    groups: dict[tuple, dict] = {}
    for g in guests:
        if g.get("status") == "CANCELLED":
            continue
        legs = ["outbound"]
        if g.get("has_return") and g.get("inbound_date"):
            legs.append("inbound")
        for leg in legs:
            f = _leg_fields(g, leg)
            if not (f["train_type"] and f["date"] and f["time_band"]):
                continue
            key = (
                f["train_type"], leg, f["from"], f["to"], f["date"], f["time_band"],
            )
            search_time = TIME_BAND_START.get(f["time_band"], "060000")
            grp = groups.setdefault(
                key,
                {
                    "train_type": f["train_type"],
                    "direction": "DOWN" if leg == "outbound" else "UP",
                    "leg": leg,
                    "from": f["from"],
                    "to": f["to"],
                    "date": f["date"],
                    "time_band": f["time_band"],
                    "time_band_label": TIME_BAND_LABEL.get(f["time_band"], f["time_band"]),
                    "search_time": search_time,
                    # 예약 의도(검토 후 직접 수정): 1·2지망 출발시각(HHMMSS, 우선순위순), 좌석등급
                    "prefer_times": [search_time],
                    "seat_class": "general",  # general | special
                    "seats": 0,
                    "guests": [],
                },
            )
            grp["seats"] += int(g.get("party_size") or 1)
            grp["guests"].append(
                {
                    "id": g["id"],
                    "name": g.get("real_name"),
                    "party_size": g.get("party_size"),
                    "leg": leg,
                }
            )
    plan = sorted(
        groups.values(),
        key=lambda x: (x["date"], x["train_type"], x["search_time"], x["from"]),
    )
    return plan


def summarize(plan: list[dict]) -> str:
    lines = []
    for p in plan:
        lines.append(
            f"- [{p['train_type']}] {p['from']}→{p['to']} {p['date']} "
            f"{p['time_band_label']}({p['search_time'][:2]}시~) : "
            f"{len(p['guests'])}팀 {p['seats']}석"
        )
    return "\n".join(lines)
