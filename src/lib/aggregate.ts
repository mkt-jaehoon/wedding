import type { Guest, Leg, PublicGuest, PublicLeg, TrainType } from "./types";
import { ROUTES, type RouteKey } from "./wedding";

export type Direction = "DOWN" | "UP";

// 공개(/status)용 leg 분해 — PublicGuest 기반(민감 데이터 없음)
export interface PublicLegRow {
  guest: PublicGuest;
  leg: PublicLeg;
  direction: Direction;
}

export function publicLegRows(guests: PublicGuest[]): PublicLegRow[] {
  const rows: PublicLegRow[] = [];
  for (const g of guests) {
    rows.push({ guest: g, leg: g.outbound, direction: "DOWN" });
    if (g.hasReturn && g.inbound) {
      rows.push({ guest: g, leg: g.inbound, direction: "UP" });
    }
  }
  return rows;
}

export interface LegRow {
  guest: Guest;
  leg: Leg;
  routeKey: RouteKey;
  direction: Direction;
}

export function routeKeyOf(trainType: TrainType, direction: Direction): RouteKey {
  return `${trainType}_${direction}` as RouteKey;
}

// 하객을 편(leg) 단위로 펼침: 가는편 + (있으면) 오는편
export function legRows(guests: Guest[]): LegRow[] {
  const rows: LegRow[] = [];
  for (const g of guests) {
    if (g.status === "CANCELLED") continue;
    rows.push({
      guest: g,
      leg: g.outbound,
      routeKey: routeKeyOf(g.outbound.trainType, "DOWN"),
      direction: "DOWN",
    });
    if (g.hasReturn && g.inbound) {
      rows.push({
        guest: g,
        leg: g.inbound,
        routeKey: routeKeyOf(g.inbound.trainType, "UP"),
        direction: "UP",
      });
    }
  }
  return rows;
}

export interface RouteCount {
  routeKey: RouteKey;
  label: string;
  trainType: string;
  people: number; // 좌석/인원 합
  groups: number; // 신청 건수
}

export function routeCounts(guests: Guest[]): RouteCount[] {
  const rows = legRows(guests);
  return ROUTES.map((r) => {
    const matched = rows.filter((row) => row.routeKey === r.key);
    const people = matched.reduce((sum, row) => sum + row.guest.partySize, 0);
    return {
      routeKey: r.key,
      label: `${r.from} → ${r.to}`,
      trainType: r.trainType,
      people,
      groups: matched.length,
    };
  });
}

// 전체 요약
export function summarize(guests: Guest[]) {
  const active = guests.filter((g) => g.status !== "CANCELLED");
  const totalGroups = active.length;
  const totalPeople = active.reduce((s, g) => s + g.partySize, 0);
  const downSRT = active.filter((g) => g.outbound.trainType === "SRT").reduce((s, g) => s + g.partySize, 0);
  const downKTX = active.filter((g) => g.outbound.trainType === "KTX").reduce((s, g) => s + g.partySize, 0);
  const returnPeople = active
    .filter((g) => g.hasReturn && g.inbound)
    .reduce((s, g) => s + g.partySize, 0);
  const booked = active.filter((g) => ["BOOKED", "PAID", "NOTIFIED"].includes(g.status)).length;
  return { totalGroups, totalPeople, downSRT, downKTX, returnPeople, booked };
}
