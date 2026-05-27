// 하객 이동 수요 취합/관리 CRM 도메인 타입

export type TrainType = "SRT" | "KTX";

// 예매/운영 상태 (6단계)
export type BookingStatus =
  | "REQUESTED" // 수요확인
  | "WAITING" // 예매대기
  | "BOOKED" // 예매완료
  | "PAID" // 결제완료
  | "NOTIFIED" // 안내완료
  | "CANCELLED"; // 취소

// 선호 시간대 (수요 취합 단계: 정확한 열차 대신 시간대로 받음)
export type TimeBand =
  | "DAWN" // 새벽 05-07
  | "EARLY_AM" // 오전 일찍 07-09
  | "LATE_AM" // 오전 09-11
  | "NOON" // 점심 11-13
  | "PM" // 오후 13-17
  | "EVENING"; // 저녁 17-22

// 편도 구간(가는편/오는편 공통)
export interface Leg {
  date: string; // YYYY-MM-DD
  timeBand: TimeBand; // 선호 시간대
  trainType: TrainType; // SRT | KTX
  from: string; // 출발역 (수서/서울역/부산)
  to: string; // 도착역
  trainNo?: string; // 확정 열차번호 (예매완료 후)
  exactTime?: string; // 확정 출발시각 HH:mm (예매완료 후)
}

export interface Guest {
  id: string;
  name: string; // 실명 — 관리자 전용
  displayName: string; // 마스킹 이름 (김*훈) — 공개
  phone?: string; // 연락처 — 관리자 전용
  groupName?: string; // 소속/관계 (예: 신랑 대학동기)
  partySize: number; // 총 인원(본인 포함)
  outbound: Leg; // 가는편(필수)
  hasReturn: boolean;
  inbound?: Leg; // 오는편(선택)
  status: BookingStatus;
  memo?: string; // 관리자 전용 메모
  publicVisible: boolean; // 공개 현황 노출 여부
  privacyAgreed: boolean; // 개인정보 노출 동의
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// 공개(/status)용 안전 구간 — 실명/연락처/메모/결제정보 없음
export interface PublicLeg {
  trainType: TrainType;
  from: string;
  to: string;
  date: string;
  timeBand: TimeBand;
}

export interface PublicGuest {
  id: string;
  displayName: string; // 마스킹 이름만
  outbound: PublicLeg;
  hasReturn: boolean;
  inbound?: PublicLeg;
  publicStatus: BookingStatus; // 결제/안내 단계는 BOOKED로 합쳐짐
  createdAt: string;
}

// 하객 본인 조회 결과(이름+연락처 인증). 실명/연락처/메모 없음.
export interface MyBookingLeg {
  trainType: TrainType;
  from: string;
  to: string;
  date: string;
  timeBand: TimeBand;
  trainNo?: string;
  exactTime?: string;
}

export interface MyBooking {
  displayName: string;
  status: BookingStatus;
  partySize: number;
  outbound: MyBookingLeg;
  hasReturn: boolean;
  inbound?: MyBookingLeg;
  buyDeadline?: string;
}

// 관리자 수정 가능 항목
export interface AdminPatch {
  status?: BookingStatus;
  publicVisible?: boolean;
  memo?: string;
}

// 신청 폼 입력 값(저장 전)
export interface GuestInput {
  name: string;
  phone?: string;
  groupName?: string;
  partySize: number;
  outbound: Leg;
  hasReturn: boolean;
  inbound?: Leg;
  memo?: string;
  publicVisible: boolean;
  privacyAgreed: boolean;
}
