import type { AdminPatch, Guest, GuestInput } from "../types";
import { getSupabase } from "../supabase/client";
import {
  toMyBooking,
  toPublicGuest,
  type MyBookingRow,
  type PublicGuestRow,
} from "../supabase/mappers";
import { normalizeGuestInput } from "./normalize";
import { UnauthorizedError, type GuestStore } from "./types";

// 공개/신청은 클라이언트에서 anon 키로 직접(공개 데이터). 관리자는 서버 API 경유(쿠키 세션).
export const supabaseGuestStore: GuestStore = {
  async listPublic() {
    const { data, error } = await getSupabase()
      .from("guests_public")
      .select("*")
      .order("outbound_date", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as PublicGuestRow[]).map(toPublicGuest);
  },

  async create(input: GuestInput) {
    const n = normalizeGuestInput(input);
    const i = n.inbound;
    const row = {
      real_name: n.name,
      display_name: n.displayName,
      phone: n.phone ?? null,
      group_name: n.groupName ?? null,
      party_size: n.partySize,
      outbound_train_type: n.outbound.trainType,
      outbound_from: n.outbound.from,
      outbound_to: n.outbound.to,
      outbound_date: n.outbound.date,
      outbound_time_band: n.outbound.timeBand,
      has_return: n.hasReturn,
      inbound_train_type: i ? i.trainType : null,
      inbound_from: i ? i.from : null,
      inbound_to: i ? i.to : null,
      inbound_date: i ? i.date : null,
      inbound_time_band: i ? i.timeBand : null,
      status: "REQUESTED",
      admin_memo: n.memo ?? null,
      public_visible: n.publicVisible,
      privacy_agreed: n.privacyAgreed,
    };
    // .select() 미사용 => RETURNING 없음 => 민감 데이터 회신 없음
    const { error } = await getSupabase().from("guests").insert(row);
    if (error) throw new Error(error.message);
  },

  async lookupMyBooking(name: string, phone: string) {
    const { data, error } = await getSupabase().rpc("lookup_my_booking", {
      p_name: name,
      p_phone: phone,
    });
    if (error) throw new Error(error.message);
    return ((data ?? []) as MyBookingRow[]).map(toMyBooking);
  },

  async adminLogin(passcode: string) {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    return res.ok;
  },

  async adminLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
  },

  async adminIsAuthed() {
    const res = await fetch("/api/admin/session");
    if (!res.ok) return false;
    const json = (await res.json()) as { authed?: boolean };
    return Boolean(json.authed);
  },

  async listAdmin() {
    const res = await fetch("/api/admin/guests");
    if (res.status === 401) throw new UnauthorizedError();
    if (!res.ok) throw new Error("관리자 목록 조회 실패");
    return (await res.json()) as Guest[];
  },

  async updateAdmin(id: string, patch: AdminPatch) {
    const res = await fetch(`/api/admin/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.status === 401) throw new UnauthorizedError();
    if (!res.ok) throw new Error("수정 실패");
  },

  async removeAdmin(id: string) {
    const res = await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
    if (res.status === 401) throw new UnauthorizedError();
    if (!res.ok) throw new Error("삭제 실패");
  },

  async seedDemoIfEmpty() {
    // Supabase는 시드하지 않음(실제 신청 데이터 사용)
  },
};
