import type {
  BookingStatus,
  Guest,
  MyBooking,
  PublicGuest,
  TimeBand,
  TrainType,
} from "../types";

// DB/RPC가 돌려주는 snake_case row 형태(경계 타입).
// 컬럼명이 바뀌면 매퍼에서 타입 오류로 잡힌다.
interface OutboundCols {
  outbound_train_type: TrainType;
  outbound_from: string;
  outbound_to: string;
  outbound_date: string;
  outbound_time_band: TimeBand;
}
interface InboundCols {
  inbound_train_type: TrainType | null;
  inbound_from: string | null;
  inbound_to: string | null;
  inbound_date: string | null;
  inbound_time_band: TimeBand | null;
}
interface ConfirmedCols {
  outbound_train_no: string | null;
  outbound_exact_time: string | null;
  inbound_train_no: string | null;
  inbound_exact_time: string | null;
}

export interface PublicGuestRow extends OutboundCols, InboundCols {
  id: string;
  display_name: string;
  has_return: boolean;
  public_status: BookingStatus;
  created_at: string;
}

export interface MyBookingRow
  extends OutboundCols,
    InboundCols,
    ConfirmedCols {
  display_name: string;
  status: BookingStatus;
  party_size: number;
  has_return: boolean;
  buy_deadline: string | null;
}

export interface GuestRow extends OutboundCols, InboundCols, ConfirmedCols {
  id: string;
  real_name: string;
  display_name: string;
  phone: string | null;
  group_name: string | null;
  party_size: number;
  has_return: boolean;
  status: BookingStatus;
  admin_memo: string | null;
  public_visible: boolean;
  privacy_agreed: boolean;
  created_at: string;
  updated_at: string;
}

// 공개 타입(안전 컬럼만)
export function toPublicGuest(r: PublicGuestRow): PublicGuest {
  return {
    id: r.id,
    displayName: r.display_name,
    outbound: {
      trainType: r.outbound_train_type,
      from: r.outbound_from,
      to: r.outbound_to,
      date: r.outbound_date,
      timeBand: r.outbound_time_band,
    },
    hasReturn: r.has_return,
    inbound: r.has_return
      ? {
          trainType: r.inbound_train_type!,
          from: r.inbound_from!,
          to: r.inbound_to!,
          date: r.inbound_date!,
          timeBand: r.inbound_time_band!,
        }
      : undefined,
    publicStatus: r.public_status,
    createdAt: r.created_at,
  };
}

// 본인 조회 타입(안전 컬럼만)
export function toMyBooking(r: MyBookingRow): MyBooking {
  return {
    displayName: r.display_name,
    status: r.status,
    partySize: r.party_size,
    outbound: {
      trainType: r.outbound_train_type,
      from: r.outbound_from,
      to: r.outbound_to,
      date: r.outbound_date,
      timeBand: r.outbound_time_band,
      trainNo: r.outbound_train_no ?? undefined,
      exactTime: r.outbound_exact_time ?? undefined,
    },
    hasReturn: r.has_return,
    inbound: r.has_return
      ? {
          trainType: r.inbound_train_type!,
          from: r.inbound_from!,
          to: r.inbound_to!,
          date: r.inbound_date!,
          timeBand: r.inbound_time_band!,
          trainNo: r.inbound_train_no ?? undefined,
          exactTime: r.inbound_exact_time ?? undefined,
        }
      : undefined,
    buyDeadline: r.buy_deadline ?? undefined,
  };
}

// 관리자 전체 타입
export function toGuest(r: GuestRow): Guest {
  return {
    id: r.id,
    name: r.real_name,
    displayName: r.display_name,
    phone: r.phone ?? undefined,
    groupName: r.group_name ?? undefined,
    partySize: r.party_size,
    outbound: {
      date: r.outbound_date,
      timeBand: r.outbound_time_band,
      trainType: r.outbound_train_type,
      from: r.outbound_from,
      to: r.outbound_to,
      trainNo: r.outbound_train_no ?? undefined,
      exactTime: r.outbound_exact_time ?? undefined,
    },
    hasReturn: r.has_return,
    inbound: r.has_return
      ? {
          date: r.inbound_date!,
          timeBand: r.inbound_time_band!,
          trainType: r.inbound_train_type!,
          from: r.inbound_from!,
          to: r.inbound_to!,
          trainNo: r.inbound_train_no ?? undefined,
          exactTime: r.inbound_exact_time ?? undefined,
        }
      : undefined,
    status: r.status,
    memo: r.admin_memo ?? undefined,
    publicVisible: r.public_visible,
    privacyAgreed: r.privacy_agreed,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
