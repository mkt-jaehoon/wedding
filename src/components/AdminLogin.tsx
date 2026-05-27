"use client";

import { useState } from "react";
import { Card } from "./ui";
import { guestStore } from "@/lib/store";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const ok = await guestStore.adminLogin(pw.trim());
      if (ok) onSuccess();
      else setErr("접근 코드가 올바르지 않습니다.");
    } catch {
      setErr("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <Card className="p-8">
        <h1 className="text-lg font-bold text-zinc-900">관리자 로그인</h1>
        <p className="mt-1 text-sm text-zinc-500">
          관리자 페이지는 접근 코드가 필요합니다.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setErr(null);
            }}
            placeholder="접근 코드"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
          {err && <p className="text-sm text-rose-600">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {busy ? "확인 중…" : "입장"}
          </button>
        </form>
        <p className="mt-4 text-xs text-zinc-400">
          임시 인증입니다. 운영 시 서버 쿠키 또는 Supabase Auth로 교체하세요.
        </p>
      </Card>
    </div>
  );
}
