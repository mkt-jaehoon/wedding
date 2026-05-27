import { STATUS_META, STATUS_ORDER } from "@/lib/labels";
import type { BookingStatus, TrainType } from "@/lib/types";

export type StatusFilter = "ALL" | BookingStatus;
export type TrainFilter = "ALL" | TrainType;

export function AdminFilters({
  statusF,
  trainF,
  query,
  count,
  onStatus,
  onTrain,
  onQuery,
}: {
  statusF: StatusFilter;
  trainF: TrainFilter;
  query: string;
  count: number;
  onStatus: (v: StatusFilter) => void;
  onTrain: (v: TrainFilter) => void;
  onQuery: (v: string) => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <select
        value={statusF}
        onChange={(e) => onStatus(e.target.value as StatusFilter)}
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
        onChange={(e) => onTrain(e.target.value as TrainFilter)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm"
      >
        <option value="ALL">노선 전체</option>
        <option value="SRT">SRT</option>
        <option value="KTX">KTX</option>
      </select>
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="이름·소속 검색"
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm"
      />
      <span className="ml-auto text-sm text-zinc-400">{count}건 표시</span>
    </div>
  );
}
