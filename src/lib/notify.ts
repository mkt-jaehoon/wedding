import { BOOKING_OPEN } from "./wedding";

// 예매 오픈 기준 알림 시점(일 단위)
export const NOTIFY_OFFSETS = [30, 7, 1, 0];

const OPEN_DATE = BOOKING_OPEN.dateTime.slice(0, 10); // "2027-04-22"

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// KST 기준 오늘 날짜 문자열(YYYY-MM-DD)
export function kstToday(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

// 오늘이 알림 대상일이면 해당 offset, 아니면 null
export function dueOffset(today: string = kstToday()): number | null {
  for (const off of NOTIFY_OFFSETS) {
    if (addDays(OPEN_DATE, -off) === today) return off;
  }
  return null;
}

export function buildEmail(offset: number, summaryText: string) {
  const tag = offset === 0 ? "오늘 오픈" : `D-${offset}`;
  const subject = `[부산 예식] 기차표 예매 오픈 ${tag} — ${BOOKING_OPEN.dateLabel}`;
  const text = [
    `KTX·SRT 예매 오픈: ${BOOKING_OPEN.dateLabel} (${tag})`,
    `* 출발 1개월 전 07:00 오픈 — 정책 변동 가능, 직전 재확인 권장`,
    ``,
    `[현재 신청 현황]`,
    summaryText || "(집계 정보를 불러오지 못했습니다)",
    ``,
    `관리자 대시보드: https://wedding-swart-pi.vercel.app/admin`,
  ].join("\n");
  return { subject, text };
}
