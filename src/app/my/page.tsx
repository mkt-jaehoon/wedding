"use client";

import { useState } from "react";
import { Card, RouteArrow, StatusBadge, TrainBadge } from "@/components/ui";
import { TravelInfo } from "@/components/TravelInfo";
import { guestStore } from "@/lib/store";
import { TIME_BAND_META } from "@/lib/labels";
import { formatDateWithDow } from "@/lib/format";
import type { MyBooking, MyBookingLeg } from "@/lib/types";

export default function MyPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<MyBooking[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setResults(null);
    try {
      const r = await guestStore.lookupMyBooking(name, phone);
      setResults(r);
    } catch {
      setErr("조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">내 탑승 정보</h1>
      <p className="mt-2 text-sm text-zinc-500">
        신청 시 입력한 <b>이름</b>과 <b>연락처</b>로 본인 예매·좌석 정보를 확인합니다.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">이름</span>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">연락처</span>
            <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" inputMode="tel" />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="h-[42px] rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {busy ? "조회 중…" : "조회"}
          </button>
        </form>
        {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}
      </Card>

      {results !== null && (
        <div className="mt-6 space-y-3">
          {results.length === 0 ? (
            <Card className="p-8 text-center text-sm text-zinc-500">
              일치하는 신청 정보를 찾을 수 없습니다.
              <br />
              이름·연락처를 신청 시 입력한 그대로 확인해 주세요.
            </Card>
          ) : (
            results.map((b, i) => <BookingCard key={i} b={b} />)
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-zinc-400">
        본인 확인된 정보만 조회되며, 다른 하객 정보는 표시되지 않습니다.
      </p>

      <TravelInfo />
    </div>
  );
}

function BookingCard({ b }: { b: MyBooking }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-zinc-900">
          {b.displayName} <span className="text-sm font-normal text-zinc-400">· {b.partySize}인</span>
        </span>
        <StatusBadge status={b.status} />
      </div>
      <div className="mt-3 space-y-2">
        <LegRow title="가는편" leg={b.outbound} />
        {b.hasReturn && b.inbound && <LegRow title="오는편" leg={b.inbound} />}
      </div>
      {b.buyDeadline && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          결제 기한: {b.buyDeadline} — 기한 내 결제해야 좌석이 확정됩니다.
        </p>
      )}
    </Card>
  );
}

function LegRow({ title, leg }: { title: string; leg: MyBookingLeg }) {
  const booked = Boolean(leg.trainNo || leg.exactTime);
  return (
    <div className="rounded-lg border border-zinc-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">{title}</span>
        <TrainBadge type={leg.trainType} />
        <RouteArrow from={leg.from} to={leg.to} />
      </div>
      <p className="mt-1.5 text-sm text-zinc-600">
        {formatDateWithDow(leg.date)} ·{" "}
        {booked ? (
          <span className="font-semibold text-zinc-900">
            {leg.exactTime || ""} {leg.trainNo ? `(${leg.trainNo})` : ""} 출발
          </span>
        ) : (
          <span className="text-zinc-500">
            {TIME_BAND_META[leg.timeBand].label}({TIME_BAND_META[leg.timeBand].range}) 희망 · 예매 준비 중
          </span>
        )}
      </p>
    </div>
  );
}
