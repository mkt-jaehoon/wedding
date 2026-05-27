import { Card } from "./ui";
import { TRAVEL } from "@/lib/wedding";

export function TravelInfo() {
  return (
    <Card className="mt-4 p-6">
      <h2 className="text-sm font-semibold text-zinc-900">이동 안내</h2>

      <div className="mt-3 rounded-lg bg-zinc-50 px-4 py-3">
        <p className="text-sm text-zinc-600">
          🚄 서울역 · 수서 → 부산 열차 이동{" "}
          <span className="font-semibold text-zinc-900">{TRAVEL.trainDuration}</span>{" "}
          <span className="text-xs text-zinc-400">(대략)</span>
        </p>
      </div>

      <p className="mt-4 mb-2 text-xs font-medium text-zinc-500">
        부산역 → 예식장(아시아드시티웨딩홀)
      </p>
      <div className="space-y-2">
        {TRAVEL.fromBusanStation.map((t) => (
          <div
            key={t.mode}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg border border-zinc-200 px-3 py-2"
          >
            <span className="text-sm font-semibold text-zinc-900">{t.mode}</span>
            {t.time && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                {t.time}
              </span>
            )}
            {t.cost && <span className="text-xs text-zinc-500">{t.cost}</span>}
            <span className="w-full text-xs text-zinc-500">{t.detail}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        * 소요 시간·요금은 교통 상황에 따라 달라질 수 있는 대략적 안내입니다.
      </p>
    </Card>
  );
}
