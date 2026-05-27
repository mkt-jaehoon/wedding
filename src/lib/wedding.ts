import type { TrainType } from "./types";

// 예식 기본 정보
export const WEDDING = {
  dateTime: "2027-05-22T13:30:00+09:00",
  dateLabel: "2027년 5월 22일 (토) 오후 1시 30분",
  venue: "아시아드시티웨딩홀",
  hall: "1층 마리아주홀",
  venueDetail: "부산 연제구 월드컵대로 344 (지번 거제동 1299)",
  // 지도 검색/길찾기에 넘길 정확한 질의
  mapQuery: "부산 연제구 월드컵대로 344 아시아드주경기장",
  // 지도/길찾기 확장용 좌표
  lat: 35.19057,
  lng: 129.05947,
} as const;

// 이동 안내 (대략적 정보 — 실제 열차/교통 상황에 따라 달라질 수 있음)
export const TRAVEL = {
  trainDuration: "약 2시간 40분", // 서울역·수서 → 부산
  fromBusanStation: [
    {
      mode: "택시 · 자동차",
      detail: "부산역 → 예식장 직행",
      time: "약 30분",
      cost: "택시비 약 13,000원",
    },
    {
      mode: "지하철 + 셔틀버스",
      detail: "부산역 → 지하철 3호선 종합운동장역 9번 출구 → 셔틀버스 탑승",
      time: "",
      cost: "",
    },
  ],
  shuttle:
    "셔틀버스: 3호선 종합운동장역 9번 출구 ↔ 아시아드시티웨딩홀 (약 5분 간격, 예식 일정에 따라 운행 제한될 수 있음)",
  parking: "웨딩홀 제1·제2주차장 이용 가능",
  venuePhone: "051-500-4500",
  mapImage: "/asiadcity-map.jpg",
} as const;

// 핵심 예매 오픈일: 운행일(예식일) 1개월 전 07:00
// KTX·SRT 모두 일반 승차권은 출발 1개월 전 07:00 오픈 (정책 변경 가능성은 직전 재확인)
export const BOOKING_OPEN = {
  dateTime: "2027-04-22T07:00:00+09:00",
  dateLabel: "2027년 4월 22일 (목) 07:00",
} as const;

// 노선별 서울권/부산권 역
export const STATIONS: Record<
  TrainType,
  { seoulSide: string; busanSide: string }
> = {
  SRT: { seoulSide: "수서", busanSide: "부산" },
  KTX: { seoulSide: "서울역", busanSide: "부산" },
};

// 4개 관리 노선 (CSV/집계 기준)
export const ROUTES = [
  { key: "SRT_DOWN", trainType: "SRT", from: "수서", to: "부산", dir: "DOWN" },
  { key: "KTX_DOWN", trainType: "KTX", from: "서울역", to: "부산", dir: "DOWN" },
  { key: "SRT_UP", trainType: "SRT", from: "부산", to: "수서", dir: "UP" },
  { key: "KTX_UP", trainType: "KTX", from: "부산", to: "서울역", dir: "UP" },
] as const;

export type RouteKey = (typeof ROUTES)[number]["key"];

// 가는편 출발역(서울권), 도착역(부산)
export function outboundStations(type: TrainType) {
  return { from: STATIONS[type].seoulSide, to: STATIONS[type].busanSide };
}

// 오는편 출발역(부산), 도착역(서울권)
export function inboundStations(type: TrainType) {
  return { from: STATIONS[type].busanSide, to: STATIONS[type].seoulSide };
}

export function weddingDate(): Date {
  return new Date(WEDDING.dateTime);
}

export function bookingOpenDate(): Date {
  return new Date(BOOKING_OPEN.dateTime);
}

// D-day (일 단위, 미래면 양수). 시간은 KST 자정 기준 비교.
export function daysUntil(target: Date, from: Date = new Date()): number {
  const MS = 24 * 60 * 60 * 1000;
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const b = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((a.getTime() - b.getTime()) / MS);
}
