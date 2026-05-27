import { Card, TrainBadge } from "../ui";
import { allRoutesCsv, downloadCsv, routeCsv } from "@/lib/csv";
import type { RouteCount } from "@/lib/aggregate";
import type { Guest, TrainType } from "@/lib/types";

export function RouteSummary({
  counts,
  guests,
}: {
  counts: RouteCount[];
  guests: Guest[];
}) {
  return (
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
  );
}
