import type { AdminPatch, Guest, GuestInput, MyBooking, PublicGuest } from "../types";

// 데이터 접근 추상화.
// 공개 경로와 관리자 경로를 분리해 민감 컬럼이 공개 쿼리로 내려가지 않게 한다.
// 관리자 인증은 세션 기반(supabase: 서버 httpOnly 쿠키 / demo: sessionStorage).
export interface GuestStore {
  // 공개(/status)
  listPublic(): Promise<PublicGuest[]>;
  // 신청(/apply)
  create(input: GuestInput): Promise<void>;
  // 본인 조회(/my): 이름+연락처 일치 시 본인 탑승정보만
  lookupMyBooking(name: string, phone: string): Promise<MyBooking[]>;
  // 관리자 인증
  adminLogin(passcode: string): Promise<boolean>;
  adminLogout(): Promise<void>;
  adminIsAuthed(): Promise<boolean>;
  // 관리자 데이터(세션 필요)
  listAdmin(): Promise<Guest[]>;
  updateAdmin(id: string, patch: AdminPatch): Promise<void>;
  removeAdmin(id: string): Promise<void>;
  // 데모(localStorage) 전용 시드. Supabase 구현은 no-op.
  seedDemoIfEmpty(): Promise<void>;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "UnauthorizedError";
  }
}
