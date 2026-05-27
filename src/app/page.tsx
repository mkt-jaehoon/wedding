import Link from "next/link";
import { Card } from "@/components/ui";
import {
  BOOKING_OPEN,
  WEDDING,
  bookingOpenDate,
  daysUntil,
  weddingDate,
} from "@/lib/wedding";
import { formatDday } from "@/lib/format";

export default function Home() {
  const dWedding = daysUntil(weddingDate());
  const dBooking = daysUntil(bookingOpenDate());

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      {/* Hero */}
      <section className="text-center">
        <p className="text-sm font-medium text-rose-500">
          하객 이동 지원 안내
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          부산 예식, 편하게 모시겠습니다
        </h1>
        <p className="mt-4 text-zinc-600">
          서울에서 부산까지 KTX·SRT 이동을 함께 정리합니다.
          <br className="hidden sm:block" />
          탑승 희망 정보를 남겨 주시면 좌석을 모아 예매해 드립니다.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/apply"
            className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 sm:w-auto"
          >
            탑승 신청하기
          </Link>
          <Link
            href="/status"
            className="w-full rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto"
          >
            이동 현황 보기
          </Link>
        </div>
      </section>

      {/* 예식 / 예매 정보 */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-500">예식 일정</h2>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600 tabular">
              {formatDday(dWedding)}
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-zinc-900">
            {WEDDING.dateLabel}
          </p>
          <p className="mt-1 text-sm text-zinc-600">{WEDDING.venue}</p>
          <p className="text-sm text-zinc-400">{WEDDING.venueDetail}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-500">
              기차표 예매 오픈
            </h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600 tabular">
              {formatDday(dBooking)}
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-zinc-900">
            {BOOKING_OPEN.dateLabel}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            KTX·SRT 모두 출발 1개월 전 07:00 오픈
          </p>
          <p className="text-xs text-zinc-400">
            정책 변동 가능 — 예매 직전 재확인 권장
          </p>
        </Card>
      </div>

      {/* 이용 안내 */}
      <Card className="mt-4 p-6">
        <h2 className="text-sm font-semibold text-zinc-900">이용 방법</h2>
        <ol className="mt-3 space-y-2 text-sm text-zinc-600">
          <li>1. <b>탑승 신청</b>에서 출발역·시간대·인원·복귀 여부를 남깁니다.</li>
          <li>2. 예매 오픈일에 맞춰 좌석을 모아 예매를 진행합니다.</li>
          <li>3. <b>이동 현황</b>에서 누가 어느 시간대에 함께 이동하는지 확인할 수 있습니다.</li>
        </ol>
        <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          공개되는 정보는 <b>성함 일부(마스킹)·노선·출발일·시간대·예매 상태</b>까지입니다.
          연락처 등 상세 개인정보는 공개되지 않습니다.
        </p>
      </Card>
    </div>
  );
}
