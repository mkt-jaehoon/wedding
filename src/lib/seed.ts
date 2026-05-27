import type { BookingStatus, Guest, TimeBand, TrainType } from "./types";
import { maskName } from "./format";
import { inboundStations, outboundStations } from "./wedding";

interface SeedSpec {
  name: string;
  phone: string;
  groupName: string;
  partySize: number;
  trainType: TrainType;
  outDate: string;
  outBand: TimeBand;
  return?: { trainType: TrainType; date: string; band: TimeBand };
  status: BookingStatus;
  memo?: string;
  publicVisible?: boolean;
}

const SPECS: SeedSpec[] = [
  {
    name: "김재훈",
    phone: "01023456789",
    groupName: "신랑 대학동기",
    partySize: 2,
    trainType: "SRT",
    outDate: "2027-05-22",
    outBand: "EARLY_AM",
    return: { trainType: "SRT", date: "2027-05-22", band: "EVENING" },
    status: "WAITING",
    memo: "통로측 선호",
  },
  {
    name: "이서연",
    phone: "01034567890",
    groupName: "신부 직장동료",
    partySize: 1,
    trainType: "KTX",
    outDate: "2027-05-22",
    outBand: "LATE_AM",
    return: { trainType: "KTX", date: "2027-05-23", band: "PM" },
    status: "REQUESTED",
  },
  {
    name: "박준호",
    phone: "01045678901",
    groupName: "신랑 친구",
    partySize: 3,
    trainType: "SRT",
    outDate: "2027-05-22",
    outBand: "EARLY_AM",
    return: { trainType: "SRT", date: "2027-05-22", band: "EVENING" },
    status: "BOOKED",
    memo: "어린이 1 포함",
  },
  {
    name: "최민지",
    phone: "01056789012",
    groupName: "신부 친구",
    partySize: 2,
    trainType: "KTX",
    outDate: "2027-05-22",
    outBand: "LATE_AM",
    status: "PAID",
  },
  {
    name: "정우성",
    phone: "01067890123",
    groupName: "신랑 회사 선배",
    partySize: 1,
    trainType: "SRT",
    outDate: "2027-05-22",
    outBand: "EARLY_AM",
    return: { trainType: "SRT", date: "2027-05-23", band: "LATE_AM" },
    status: "NOTIFIED",
  },
  {
    name: "한가영",
    phone: "01078901234",
    groupName: "신부 가족",
    partySize: 4,
    trainType: "KTX",
    outDate: "2027-05-21",
    outBand: "PM",
    return: { trainType: "KTX", date: "2027-05-23", band: "PM" },
    status: "REQUESTED",
    memo: "전날 미리 내려감 (숙박)",
  },
  {
    name: "오현석",
    phone: "01089012345",
    groupName: "신랑 친구",
    partySize: 1,
    trainType: "SRT",
    outDate: "2027-05-22",
    outBand: "NOON",
    status: "CANCELLED",
    memo: "개인사정 불참",
    publicVisible: false,
  },
];

export function seedGuests(): Guest[] {
  const now = "2026-05-27T09:00:00+09:00";
  return SPECS.map((s, i) => {
    const out = outboundStations(s.trainType);
    const guest: Guest = {
      id: `seed-${i + 1}`,
      name: s.name,
      displayName: maskName(s.name),
      phone: s.phone,
      groupName: s.groupName,
      partySize: s.partySize,
      outbound: {
        date: s.outDate,
        timeBand: s.outBand,
        trainType: s.trainType,
        from: out.from,
        to: out.to,
      },
      hasReturn: Boolean(s.return),
      inbound: s.return
        ? {
            date: s.return.date,
            timeBand: s.return.band,
            trainType: s.return.trainType,
            ...inboundStations(s.return.trainType),
          }
        : undefined,
      status: s.status,
      memo: s.memo,
      publicVisible: s.publicVisible ?? true,
      privacyAgreed: true,
      createdAt: now,
      updatedAt: now,
    };
    return guest;
  });
}
