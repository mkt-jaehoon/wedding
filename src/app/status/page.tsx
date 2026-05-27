"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, RouteArrow, StatusBadge, TrainBadge, cn } from "@/components/ui";
import { usePublicGuests } from "@/lib/useGuests";
import { publicLegRows, type Direction } from "@/lib/aggregate";
import { TIME_BAND_META } from "@/lib/labels";
import { formatDateShort } from "@/lib/format";
import type { TrainType } from "@/lib/types";

type DirFilter = "ALL" | Direction;
type TrainFilter = "ALL" | TrainType;

const DIR_LABEL: Record<Direction, string> = { DOWN: "가는편", UP: "오는편" };

export default function StatusPage() {
  const { guests, loading } = usePublicGuests();
  const [dir, setDir] = useState<DirFilter>("ALL");
  const [train, setTrain] = useState<TrainFilter>("ALL");

  const allRows = useMemo(() => publicLegRows(guests), [guests]);
  const rows = useMemo(
    () =>
      allRows
        .filter((r) => (dir === "ALL" ? true : r.direction === dir))
        .filter((r) => (train === "ALL" ? true : r.leg.trainType === train))
        .sort(
          (a, b) =>
            a.leg.date.localeCompare(b.leg.date) ||
            a.leg.timeBand.localeCompare(b.leg.timeBand),
        ),
    [allRows, dir, train],
  );

  const downCount = allRows.filter((r) => r.direction === "DOWN").length;
  const upCount = allRows.filter((r) => r.direction === "UP").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">하객 이동 현황</h1>
          <p className="mt-2 text-sm text-zinc-500">
            누가 어느 시간대에 함께 이동하는지 확인할 수 있습니다.
          </p>
        </div>
        <Link
          href="/apply"
          className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          신청하기
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="공개 신청" value={`${guests.length}팀`} />
        <Stat label="가는편" value={`${downCount}건`} />
        <Stat label="오는편" value={`${upCount}건`} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterGroup
          options={[
            { v: "ALL", label: "전체" },
            { v: "DOWN", label: "가는편" },
            { v: "UP", label: "오는편" },
          ]}
          value={dir}
          onChange={(v) => setDir(v as DirFilter)}
        />
        <FilterGroup
          options={[
            { v: "ALL", label: "전체" },
            { v: "SRT", label: "SRT" },
            { v: "KTX", label: "KTX" },
          ]}
          value={train}
          onChange={(v) => setTrain(v as TrainFilter)}
        />
      </div>

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="py-12 text-center text-sm text-zinc-400">불러오는 중…</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-400">
            해당 조건의 공개된 신청이 없습니다.
          </p>
        ) : (
          rows.map((r, i) => (
            <Card key={`${r.guest.id}-${r.direction}-${i}`} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-zinc-900">
                    {r.guest.displayName}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-xs font-medium",
                      r.direction === "DOWN"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-orange-50 text-orange-600",
                    )}
                  >
                    {DIR_LABEL[r.direction]}
                  </span>
                  <TrainBadge type={r.leg.trainType} />
                  <RouteArrow from={r.leg.from} to={r.leg.to} />
                </div>
                <StatusBadge status={r.guest.publicStatus} />
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                {formatDateShort(r.leg.date)} · {TIME_BAND_META[r.leg.timeBand].label}
                <span className="text-zinc-400">
                  {" "}
                  ({TIME_BAND_META[r.leg.timeBand].range})
                </span>
              </p>
            </Card>
          ))
        )}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-400">
        성함은 마스킹 처리되며, 연락처 등 개인정보는 공개되지 않습니다.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-zinc-900 tabular">{value}</p>
    </Card>
  );
}

function FilterGroup({
  options,
  value,
  onChange,
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === o.v
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-100",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
