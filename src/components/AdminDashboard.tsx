"use client";

import { useMemo, useState } from "react";
import { Card } from "./ui";
import { AdminKpis } from "./admin/AdminKpis";
import { RouteSummary } from "./admin/RouteSummary";
import {
  AdminFilters,
  type StatusFilter,
  type TrainFilter,
} from "./admin/AdminFilters";
import { AdminGuestTable } from "./admin/AdminGuestTable";
import { useAdminGuests } from "@/lib/useGuests";
import { usingSupabase } from "@/lib/store";
import { routeCounts, summarize } from "@/lib/aggregate";
import {
  BOOKING_OPEN,
  WEDDING,
  bookingOpenDate,
  daysUntil,
  weddingDate,
} from "@/lib/wedding";
import { formatDday } from "@/lib/format";

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

      <AdminKpis sum={sum} />
      <RouteSummary counts={counts} guests={guests} />
      <AdminFilters
        statusF={statusF}
        trainF={trainF}
        query={query}
        count={filtered.length}
        onStatus={setStatusF}
        onTrain={setTrainF}
        onQuery={setQuery}
      />
      <AdminGuestTable
        guests={filtered}
        loading={loading}
        onUpdate={update}
        onRemove={remove}
      />

      <p className="mt-3 text-xs text-zinc-400">
        실명·연락처·메모는 이 관리자 화면에서만 보이며, 공개 현황(/status)에는
        노출되지 않습니다.
      </p>
    </div>
  );
}
