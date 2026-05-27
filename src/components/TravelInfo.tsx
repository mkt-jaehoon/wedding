import { Card } from "./ui";
import { TRAVEL } from "@/lib/wedding";

export function TravelInfo() {
  return (
    <Card className="mt-4 overflow-hidden">
      <div className="p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900">이동 안내</h2>

        <div className="mt-3 rounded-lg bg-zinc-50 px-4 py-3">
          <p className="text-sm text-zinc-600">
            🚄 서울역 · 수서 → 부산 열차{" "}
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
              className="rounded-lg border border-zinc-200 px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-zinc-900">{t.mode}</span>
                {t.time && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                    {t.time}
                  </span>
                )}
                {t.cost && <span className="text-xs text-zinc-500">{t.cost}</span>}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                {t.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-zinc-600">
          <p>🚌 {TRAVEL.shuttle}</p>
          <p>🅿️ {TRAVEL.parking}</p>
          <p>
            ☎️ 웨딩홀{" "}
            <a href={`tel:${TRAVEL.venuePhone}`} className="font-medium text-zinc-900 underline">
              {TRAVEL.venuePhone}
            </a>
          </p>
        </div>
      </div>

      {/* 공식 약도 (탭하면 크게 보기) */}
      <a href={TRAVEL.mapImage} target="_blank" rel="noopener noreferrer" className="block border-t border-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TRAVEL.mapImage}
          alt="아시아드시티웨딩홀 찾아오시는 길 약도"
          className="w-full"
          loading="lazy"
        />
        <span className="block px-5 py-2 text-center text-xs text-zinc-400">
          약도를 탭하면 크게 볼 수 있습니다
        </span>
      </a>
    </Card>
  );
}
