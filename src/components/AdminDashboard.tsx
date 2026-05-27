"use client";

import { useMemo, useState } from "react";
import { Card, RouteArrow, TrainBadge } from "./ui";
import { useAdminGuests } from "@/lib/useGuests";
import { usingSupabase } from "@/lib/store";
import { routeCounts, summarize } from "@/lib/aggregate";
import { allRoutesCsv, downloadCsv, routeCsv } from "@/lib/csv";
import { STATUS_META, STATUS_ORDER, TIME_BAND_META } from "@/lib/labels";
import {
  BOOKING_OPEN,
  WEDDING,
  bookingOpenDate,
  daysUntil,
  weddingDate,
} from "@/lib/wedding";
import { formatDateShort, formatDday } from "@/lib/format";
import type { BookingStatus, Leg, TrainType } from "@/lib/types";

type StatusFilter = "ALL" | BookingStatus;
type TrainFilter = "ALL" | TrainType;

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { guests, loading, error, update, remove } = useAdminGuests();
  const [statusF, setStatusF] = useState<StatusFilter>("ALL");
  const [trainF, setTrainF] = useState<TrainFilter>("ALL");
  const [query, setQuery] = useState("");

  const sum = useMemo(() => summarize(guests), [guests]);
  const counts = useMemo(() => routeCounts(guests), [guests]);
  const dWedding = daysUntil(weddingDate());
  const dBooking = daysUntil(bookingOpenDate());

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      if (statusF !== "ALL" && g.status !== statusF) return false;
      if (trainF !== "ALL" && g.outbound.trainType !== trainF) return false;
      if (query && !g.name.includes(query) && !(g.groupName ?? "").includes(query))
        return false;
      return true;
    });
  }, [guests, statusF, trainF, query]);

  if (error === "unauthorized") {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <p className="text-sm text-rose-600">세션이 만료되었거나 권한이 없습니다.</p>
        <button
          onClick={onLogout}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          다시 로그인
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">관리자 대시보드</h1>
          <p className="mt-1 text-sm text-zinc-500">
            하객 이동 수요 취합 · 예매 상태 관리
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                usingSupabase
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {usingSupabase ? "Supabase 연결됨" : "데모(localStorage)"}
            </span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          로그아웃
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-zinc-500">예식까지</p>
            <p className="text-sm font-semibold text-zinc-800">{WEDDING.dateLabel}</p>
          </div>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600 tabular">
            {formatDday(dWedding)}
          </span>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-zinc-500">예매 오픈까지</p>
            <p className="text-sm font-semibold text-zinc-800">
              {BOOKING_OPEN.dateLabel}
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600 tabular">
            {formatDday(dBooking)}
          </span>
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="총 신청" value={`${sum.totalGroups}팀`} />
        <Kpi label="총 인원" value={`${sum.totalPeople}명`} />
        <Kpi label="하행 SRT" value={`${sum.downSRT}명`} />
        <Kpi label="하행 KTX" value={`${sum.downKTX}명`} />
        <Kpi label="예매완료+" value={`${sum.booked}팀`} />
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">노선별 집계</h2>
          <button
            onClick={() => downloadCsv("하객이동_전체.csv", allRoutesCsv(guests))}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            전체 CSV 다운로드
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {counts.map((c) => (
            <div
              key={c.routeKey}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <TrainBadge type={c.trainType as TrainType} />
                <span className="text-sm font-medium text-zinc-700">{c.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500 tabular">
                  {c.groups}건 · {c.people}명
                </span>
                <button
                  onClick={() =>
                    downloadCsv(
                      `${c.label.replace(/\s/g, "")}.csv`,
                      routeCsv(guests, c.routeKey),
                    )
                  }
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                >
                  CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value as StatusFilter)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="ALL">상태 전체</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <select
          value={trainF}
          onChange={(e) => setTrainF(e.target.value as TrainFilter)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="ALL">노선 전체</option>
          <option value="SRT">SRT</option>
          <option value="KTX">KTX</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름·소속 검색"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm"
        />
        <span className="ml-auto text-sm text-zinc-400">{filtered.length}건 표시</span>
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">연락처</th>
                <th className="px-4 py-3 font-medium">소속</th>
                <th className="px-4 py-3 font-medium">인원</th>
                <th className="px-4 py-3 font-medium">가는편</th>
                <th className="px-4 py-3 font-medium">오는편</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">메모</th>
                <th className="px-4 py-3 font-medium">공개</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-400">
                    불러오는 중…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-400">
                    표시할 신청이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-zinc-50/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900">{g.name}</div>
                      <div className="text-xs text-zinc-400">{g.displayName}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 tabular">{g.phone || "-"}</td>
                    <td className="px-4 py-3 text-zinc-600">{g.groupName || "-"}</td>
                    <td className="px-4 py-3 text-zinc-600 tabular">{g.partySize}</td>
                    <td className="px-4 py-3">
                      <LegCell leg={g.outbound} />
                    </td>
                    <td className="px-4 py-3">
                      {g.hasReturn && g.inbound ? (
                        <LegCell leg={g.inbound} />
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={g.status}
                        onChange={(e) =>
                          update(g.id, { status: e.target.value as BookingStatus })
                        }
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <MemoCell
                        value={g.memo ?? ""}
                        onSave={(memo) => update(g.id, { memo })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={g.publicVisible}
                        onChange={(e) =>
                          update(g.id, { publicVisible: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-zinc-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`${g.name} 신청을 삭제할까요?`)) remove(g.id);
                        }}
                        className="text-xs text-zinc-400 hover:text-rose-600"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-3 text-xs text-zinc-400">
        실명·연락처·메모는 이 관리자 화면에서만 보이며, 공개 현황(/status)에는
        노출되지 않습니다.
      </p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-zinc-900 tabular">{value}</p>
    </Card>
  );
}

function LegCell({ leg }: { leg: Leg }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <TrainBadge type={leg.trainType} />
        <RouteArrow from={leg.from} to={leg.to} />
      </div>
      <div className="text-xs text-zinc-500">
        {formatDateShort(leg.date)} · {TIME_BAND_META[leg.timeBand].label}
        {leg.exactTime ? ` · ${leg.exactTime}` : ""}
        {leg.trainNo ? ` (${leg.trainNo})` : ""}
      </div>
    </div>
  );
}

function MemoCell({
  value,
  onSave,
}: {
  value: string;
  onSave: (memo: string) => void;
}) {
  const [text, setText] = useState(value);
  // 외부 value가 바뀌면(저장→새로고침) 렌더 중 동기화 (effect 불필요)
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }
  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        if (text !== value) onSave(text);
      }}
      placeholder="메모"
      className="w-40 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none"
    />
  );
}
