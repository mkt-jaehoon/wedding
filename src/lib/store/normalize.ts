import type { GuestInput, Leg } from "../types";
import { maskName } from "../format";

// 신청 입력 정규화 — supabase/local 스토어가 동일 규칙을 공유한다.
export interface NormalizedGuestInput {
  name: string;
  displayName: string;
  phone?: string; // 숫자만
  groupName?: string;
  partySize: number;
  outbound: Leg;
  hasReturn: boolean;
  inbound?: Leg;
  memo?: string;
  publicVisible: boolean;
  privacyAgreed: boolean;
}

export function normalizeGuestInput(input: GuestInput): NormalizedGuestInput {
  return {
    name: input.name.trim(),
    displayName: maskName(input.name),
    phone: input.phone?.replace(/[^0-9]/g, "") || undefined,
    groupName: input.groupName?.trim() || undefined,
    partySize: input.partySize,
    outbound: input.outbound,
    hasReturn: input.hasReturn,
    inbound: input.hasReturn ? input.inbound : undefined,
    memo: input.memo?.trim() || undefined,
    publicVisible: input.publicVisible,
    privacyAgreed: input.privacyAgreed,
  };
}
