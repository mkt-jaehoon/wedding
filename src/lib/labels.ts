import type { BookingStatus, TimeBand, TrainType } from "./types";

// 상태 라벨 + 색상(Tailwind 클래스). 진행 순서대로.
export const STATUS_META: Record<
  BookingStatus,
  { label: string; badge: string; dot: string; order: number }
> = {
  REQUESTED: {
    label: "수요확인",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
    order: 0,
  },
  WAITING: {
    label: "예매대기",
    badge: "bg-amber-100 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    order: 1,
  },
  BOOKED: {
    label: "예매완료",
    badge: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
    order: 2,
  },
  PAID: {
    label: "결제완료",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    order: 3,
  },
  NOTIFIED: {
    label: "안내완료",
    badge: "bg-teal-100 text-teal-700 ring-teal-200",
    dot: "bg-teal-500",
    order: 4,
  },
  CANCELLED: {
    label: "취소",
    badge: "bg-rose-100 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    order: 5,
  },
};

// 공개 노출용 상태 합치기: 결제완료/안내완료는 예매완료로 표시(결제 여부 비공개)
export function coarsenStatus(s: BookingStatus): BookingStatus {
  return s === "PAID" || s === "NOTIFIED" ? "BOOKED" : s;
}

export const STATUS_ORDER: BookingStatus[] = [
  "REQUESTED",
  "WAITING",
  "BOOKED",
  "PAID",
  "NOTIFIED",
  "CANCELLED",
];

// 선호 시간대 라벨
export const TIME_BAND_META: Record<
  TimeBand,
  { label: string; short: string; range: string }
> = {
  DAWN: { label: "새벽", short: "새벽", range: "05–07시" },
  EARLY_AM: { label: "이른 오전", short: "오전", range: "07–09시" },
  LATE_AM: { label: "오전", short: "오전", range: "09–11시" },
  NOON: { label: "낮", short: "낮", range: "11–13시" },
  PM: { label: "오후", short: "오후", range: "13–17시" },
  EVENING: { label: "저녁", short: "저녁", range: "17–22시" },
};

export const TIME_BAND_ORDER: TimeBand[] = [
  "DAWN",
  "EARLY_AM",
  "LATE_AM",
  "NOON",
  "PM",
  "EVENING",
];

export const TRAIN_META: Record<TrainType, { label: string; badge: string }> = {
  SRT: { label: "SRT", badge: "bg-purple-100 text-purple-700 ring-purple-200" },
  KTX: { label: "KTX", badge: "bg-sky-100 text-sky-700 ring-sky-200" },
};
