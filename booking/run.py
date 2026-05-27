"""예매 준비 CLI.

사용법 (저장소 루트에서):
  python3 -m booking.run plan                 # 명단 -> 예약 계획(out/plan.json)
  python3 -m booking.run search SRT           # 계획의 SRT 구간 조회(dry-run, 운행일 1개월 전부터 가능)
  python3 -m booking.run search KTX
  python3 -m booking.run reserve SRT          # 실제 예약(결제X). RESERVE_CONFIRM=YES 필요
  python3 -m booking.run writeback out/result.json   # 예약 결과를 DB에 반영

결제는 자동화하지 않는다(예약 확보까지만).
"""
import json
import os
import sys
from pathlib import Path

from . import plan as planmod
from . import supabase_io

OUT = Path("booking/out")


def _save(name: str, obj) -> Path:
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / name
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    return p


def cmd_plan() -> None:
    guests = supabase_io.list_guests()
    plan = planmod.build_plan(guests)
    p = _save("plan.json", plan)
    total_seats = sum(x["seats"] for x in plan)
    print(f"명단 {len(guests)}건 -> 계획 {len(plan)}개 구간 / 총 {total_seats}석")
    print(planmod.summarize(plan))
    print(f"\n저장: {p}")


def _adapter(which: str):
    if which.upper() == "SRT":
        from . import srt_adapter
        return srt_adapter
    if which.upper() == "KTX":
        from . import ktx_adapter
        return ktx_adapter
    raise SystemExit("열차 종류는 SRT 또는 KTX")


def _load_plan() -> list[dict]:
    p = OUT / "plan.json"
    if not p.exists():
        raise SystemExit("plan.json 없음. 먼저 `plan` 실행")
    return json.loads(p.read_text(encoding="utf-8"))


def cmd_search(which: str) -> None:
    adapter = _adapter(which)
    items = [x for x in _load_plan() if x["train_type"] == which.upper()]
    if not items:
        print(f"{which.upper()} 구간 없음")
        return
    for it in items:
        date = it["date"].replace("-", "")
        try:
            trains = adapter.search(it["from"], it["to"], date, it["search_time"])
            print(f"[{it['from']}→{it['to']} {it['date']} {it['time_band_label']}] 후보 {len(trains)}개")
            for t in trains[:6]:
                print(f"    {t}")
        except Exception as e:  # noqa: BLE001
            print(f"[{it['from']}→{it['to']} {it['date']}] 조회 실패: {e}")


def _digits(s: str) -> str:
    return "".join(ch for ch in str(s) if ch.isdigit())


def _pick_train(adapter, trains, prefer_time: str):
    """prefer_time(HHMMSS) 이후 가장 이른 열차. 못 찾으면 첫 열차."""
    pt = _digits(prefer_time)[:4]
    for t in trains:
        dt = _digits(adapter.normalize_train(t).get("dep_time", ""))[:4]
        if dt and dt >= pt:
            return t
    return trains[0] if trains else None


def cmd_reserve(which: str) -> None:
    if os.environ.get("RESERVE_CONFIRM") != "YES":
        raise SystemExit(
            "안전장치: 실제 예약은 RESERVE_CONFIRM=YES 환경변수가 있어야 실행됩니다."
        )
    adapter = _adapter(which)
    rows: list[dict] = []
    for it in [x for x in _load_plan() if x["train_type"] == which.upper()]:
        date = it["date"].replace("-", "")
        prefer_times = it.get("prefer_times") or [it["search_time"]]
        seat_class = it.get("seat_class", "general")
        label = f"{it['from']}→{it['to']} {it['date']} {it['time_band_label']}"
        try:
            trains = adapter.search(it["from"], it["to"], date, it["search_time"])
        except Exception as e:  # noqa: BLE001
            print(f"[{label}] 조회 실패: {e}")
            continue
        chosen = None
        for pt in prefer_times:
            chosen = _pick_train(adapter, trains, pt)
            if chosen:
                break
        if not chosen:
            print(f"[{label}] 후보 열차 없음")
            continue
        tinfo = adapter.normalize_train(chosen)
        print(f"[{label}] 대상 열차 {tinfo}")
        # 하객(파티)별 개별 예약 — 각자 결제 주체가 다르므로 분리 예약
        for g in it["guests"]:
            try:
                res = adapter.reserve_train(chosen, int(g.get("party_size") or 1), seat_class)
                rinfo = adapter.normalize_reservation(res)
                rows.append(
                    {
                        "id": g["id"],
                        "name": g.get("name"),
                        "leg": g.get("leg", "outbound"),
                        "train_no": tinfo.get("train_no"),
                        "exact_time": tinfo.get("dep_time"),
                        "reservation_id": rinfo.get("reservation_id"),
                        "buy_deadline": rinfo.get("buy_deadline"),
                        "status": "BOOKED",
                    }
                )
                print(f"    예약 OK {g.get('name')} x{g.get('party_size')} -> {rinfo.get('reservation_id')}")
            except Exception as e:  # noqa: BLE001
                print(f"    예약 실패 {g.get('name')}: {e}")
    out = _save(f"result_{which.lower()}.json", rows)
    print(f"\n예약 성공 {len(rows)}건 저장: {out}\n  → 반영: python3 -m booking.run writeback {out}")


def cmd_writeback(path: str) -> None:
    rows = json.loads(Path(path).read_text(encoding="utf-8"))
    for r in rows:
        supabase_io.set_booking(
            guest_id=r["id"],
            leg=r.get("leg", "outbound"),
            train_no=r.get("train_no"),
            exact_time=r.get("exact_time"),
            reservation_id=r.get("reservation_id"),
            buy_deadline=r.get("buy_deadline"),
            status=r.get("status", "BOOKED"),
        )
        print(f"반영: {r['id']} <- {r.get('status', 'BOOKED')}")
    print(f"완료: {len(rows)}건")


def main(argv: list[str]) -> None:
    if not argv:
        print(__doc__)
        return
    cmd, *rest = argv
    if cmd == "plan":
        cmd_plan()
    elif cmd == "search":
        cmd_search(rest[0] if rest else "SRT")
    elif cmd == "reserve":
        cmd_reserve(rest[0] if rest else "SRT")
    elif cmd == "writeback":
        if not rest:
            raise SystemExit("결과 파일 경로 필요")
        cmd_writeback(rest[0])
    else:
        print(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
