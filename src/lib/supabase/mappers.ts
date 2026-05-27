import type {
  BookingStatus,
  Guest,
  MyBooking,
  PublicGuest,
  TimeBand,
  TrainType,
} from "../types";

// DB(snake_case) row -> 공개 타입(안전 컬럼만)
export function toPublicGuest(r: Record<string, unknown>): PublicGuest {
  return {
    id: r.id as string,
    displayName: r.display_name as string,
    outbound: {
      trainType: r.outbound_train_type as TrainType,
      from: r.outbound_from as string,
      to: r.outbound_to as string,
      date: r.outbound_date as string,
      timeBand: r.outbound_time_band as TimeBand,
    },
    hasReturn: Boolean(r.has_return),
    inbound: r.has_return
      ? {
          trainType: r.inbound_train_type as TrainType,
          from: r.inbound_from as string,
          to: r.inbound_to as string,
          date: r.inbound_date as string,
          timeBand: r.inbound_time_band as TimeBand,
        }
      : undefined,
    publicStatus: r.public_status as BookingStatus,
    createdAt: r.created_at as string,
  };
}

// DB(snake_case) row -> 본인 조회 타입(안전 컬럼만)
export function toMyBooking(r: Record<string, unknown>): MyBooking {
  return {
    displayName: r.display_name as string,
    status: r.status as BookingStatus,
    partySize: r.party_size as number,
    outbound: {
      trainType: r.outbound_train_type as TrainType,
      from: r.outbound_from as string,
      to: r.outbound_to as string,
      date: r.outbound_date as string,
      timeBand: r.outbound_time_band as TimeBand,
      trainNo: (r.outbound_train_no as string) ?? undefined,
      exactTime: (r.outbound_exact_time as string) ?? undefined,
    },
    hasReturn: Boolean(r.has_return),
    inbound: r.has_return
      ? {
          trainType: r.inbound_train_type as TrainType,
          from: r.inbound_from as string,
          to: r.inbound_to as string,
          date: r.inbound_date as string,
          timeBand: r.inbound_time_band as TimeBand,
          trainNo: (r.inbound_train_no as string) ?? undefined,
          exactTime: (r.inbound_exact_time as string) ?? undefined,
        }
      : undefined,
    buyDeadline: (r.buy_deadline as string) ?? undefined,
  };
}

// DB(snake_case) row -> 관리자 전체 타입
export function toGuest(r: Record<string, unknown>): Guest {
  return {
    id: r.id as string,
    name: r.real_name as string,
    displayName: r.display_name as string,
    phone: (r.phone as string) ?? undefined,
    groupName: (r.group_name as string) ?? undefined,
    partySize: r.party_size as number,
    outbound: {
      date: r.outbound_date as string,
      timeBand: r.outbound_time_band as TimeBand,
      trainType: r.outbound_train_type as TrainType,
      from: r.outbound_from as string,
      to: r.outbound_to as string,
      trainNo: (r.outbound_train_no as string) ?? undefined,
      exactTime: (r.outbound_exact_time as string) ?? undefined,
    },
    hasReturn: Boolean(r.has_return),
    inbound: r.has_return
      ? {
          date: r.inbound_date as string,
          timeBand: r.inbound_time_band as TimeBand,
          trainType: r.inbound_train_type as TrainType,
          from: r.inbound_from as string,
          to: r.inbound_to as string,
          trainNo: (r.inbound_train_no as string) ?? undefined,
          exactTime: (r.inbound_exact_time as string) ?? undefined,
        }
      : undefined,
    status: r.status as BookingStatus,
    memo: (r.admin_memo as string) ?? undefined,
    publicVisible: Boolean(r.public_visible),
    privacyAgreed: Boolean(r.privacy_agreed),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
