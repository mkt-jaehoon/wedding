import { NextResponse } from "next/server";
import { buildEmail, dueOffset, kstToday } from "@/lib/notify";
import { mailerConfigured, sendMail } from "@/lib/mailer";
import { serverSupabase } from "@/lib/supabase/server";
import { adminPasscode } from "@/lib/admin-session";
import { toGuest } from "@/lib/supabase/mappers";
import { routeCounts, summarize } from "@/lib/aggregate";

// Vercel Cron이 매일 호출. CRON_SECRET 설정 시 Authorization 헤더로 보호됨.
// ?force=1 : 날짜 무관 즉시 발송(SMTP 동작 테스트용, 인증 필요)
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const today = kstToday();
  const force = new URL(req.url).searchParams.get("force") === "1";
  const offset = force ? 0 : dueOffset(today);

  if (offset === null) {
    return NextResponse.json({ skipped: true, today });
  }
  if (!mailerConfigured()) {
    return NextResponse.json(
      { error: "SMTP 미설정(SMTP_USER/SMTP_PASS)", today, offset },
      { status: 503 },
    );
  }

  let summaryText = "";
  try {
    const { data } = await serverSupabase().rpc("admin_list_guests", {
      p_passcode: adminPasscode(),
    });
    const guests = ((data as Record<string, unknown>[]) ?? []).map(toGuest);
    const s = summarize(guests);
    const rc = routeCounts(guests);
    summaryText =
      `총 ${s.totalGroups}팀 / ${s.totalPeople}명 (예매완료+ ${s.booked}팀)\n` +
      rc.map((r) => `- ${r.label}: ${r.groups}건, ${r.people}명`).join("\n");
  } catch {
    // 집계 실패해도 알림은 발송
  }

  const { subject, text } = buildEmail(offset, summaryText);
  await sendMail(subject, text);
  return NextResponse.json({ sent: true, today, offset });
}
