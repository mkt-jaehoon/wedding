import { useState } from "react";
import { Card, RouteArrow, TrainBadge } from "../ui";
import { STATUS_META, STATUS_ORDER, TIME_BAND_META } from "@/lib/labels";
import { formatDateShort } from "@/lib/format";
import type { AdminPatch, BookingStatus, Guest, Leg } from "@/lib/types";

export function AdminGuestTable({
  guests,
  loading,
  onUpdate,
  onRemove,
}: {
  guests: Guest[];
  loading: boolean;
  onUpdate: (id: string, patch: AdminPatch) => void;
  onRemove: (id: string) => void;
}) {
  return (
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
            ) : guests.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-zinc-400">
                  표시할 신청이 없습니다.
                </td>
              </tr>
            ) : (
              guests.map((g) => (
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
                        onUpdate(g.id, { status: e.target.value as BookingStatus })
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
                      onSave={(memo) => onUpdate(g.id, { memo })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={g.publicVisible}
                      onChange={(e) => onUpdate(g.id, { publicVisible: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`${g.name} 신청을 삭제할까요?`)) onRemove(g.id);
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
  // 외부 value가 바뀌면(저장→새로고침) 렌더 중 동기화
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
