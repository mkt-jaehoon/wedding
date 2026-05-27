"use client";

import { useState } from "react";
import Link from "next/link";
import { GuestForm } from "@/components/GuestForm";
import { Card } from "@/components/ui";
import { createGuest } from "@/lib/useGuests";
import type { GuestInput } from "@/lib/types";

export default function ApplyPage() {
  const [done, setDone] = useState(false);

  async function handleSubmit(input: GuestInput) {
    await createGuest(input);
    setDone(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">탑승 신청</h1>
      <p className="mt-2 text-sm text-zinc-500">
        부산 예식 이동을 위한 KTX·SRT 탑승 희망 정보를 남겨 주세요.
      </p>

      {done ? (
        <Card className="mt-8 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            신청이 접수되었습니다
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            예매 오픈일에 맞춰 좌석을 준비하겠습니다. 감사합니다.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/status"
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              이동 현황 보기
            </Link>
            <button
              onClick={() => setDone(false)}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              추가 신청하기
            </button>
          </div>
        </Card>
      ) : (
        <Card className="mt-8 p-6">
          <GuestForm onSubmit={handleSubmit} />
        </Card>
      )}
    </div>
  );
}
