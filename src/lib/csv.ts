import type { Guest } from "./types";
import { ROUTES, type RouteKey } from "./wedding";
import { legRows } from "./aggregate";
import { STATUS_META, TIME_BAND_META } from "./labels";

// CSV 셀 이스케이프
function cell(v: string | number | undefined | null): string {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const HEADER = [
  "노선",
  "이름",
  "연락처",
  "소속/관계",
  "인원",
  "날짜",
  "시간대",
  "상태",
  "열차번호",
  "출발시각",
  "메모",
];

// 특정 노선의 예매용 CSV 생성 (관리자 전용 — 실명/연락처 포함)
export function routeCsv(guests: Guest[], routeKey: RouteKey): string {
  const route = ROUTES.find((r) => r.key === routeKey);
  const routeLabel = route ? `${route.from} → ${route.to}` : routeKey;
  const rows = legRows(guests).filter((r) => r.routeKey === routeKey);

  const lines = [HEADER.map(cell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        routeLabel,
        r.guest.name,
        r.guest.phone ?? "",
        r.guest.groupName ?? "",
        r.guest.partySize,
        r.leg.date,
        TIME_BAND_META[r.leg.timeBand].label,
        STATUS_META[r.guest.status].label,
        r.leg.trainNo ?? "",
        r.leg.exactTime ?? "",
        r.guest.memo ?? "",
      ]
        .map(cell)
        .join(","),
    );
  }
  return lines.join("\r\n");
}

// 전체 노선 CSV (4개 노선 순서대로 이어붙임)
export function allRoutesCsv(guests: Guest[]): string {
  const lines = [HEADER.map(cell).join(",")];
  for (const route of ROUTES) {
    const rows = legRows(guests).filter((r) => r.routeKey === route.key);
    const routeLabel = `${route.from} → ${route.to}`;
    for (const r of rows) {
      lines.push(
        [
          routeLabel,
          r.guest.name,
          r.guest.phone ?? "",
          r.guest.groupName ?? "",
          r.guest.partySize,
          r.leg.date,
          TIME_BAND_META[r.leg.timeBand].label,
          STATUS_META[r.guest.status].label,
          r.leg.trainNo ?? "",
          r.leg.exactTime ?? "",
          r.guest.memo ?? "",
        ]
          .map(cell)
          .join(","),
      );
    }
  }
  return lines.join("\r\n");
}

// 브라우저 다운로드 트리거 (UTF-8 BOM 포함 — 엑셀 한글 깨짐 방지)
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
