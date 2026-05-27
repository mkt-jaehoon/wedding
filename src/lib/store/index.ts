import type { GuestStore } from "./types";
import { demoGuestStore } from "./local-store";
import { supabaseGuestStore } from "./supabase-store";
import { hasSupabaseEnv } from "../supabase/client";

// Supabase 환경변수가 있으면 공유 DB, 없으면 데모(localStorage) 폴백.
export const guestStore: GuestStore = hasSupabaseEnv()
  ? supabaseGuestStore
  : demoGuestStore;

export const usingSupabase = hasSupabaseEnv();

export type { GuestStore };
export { UnauthorizedError } from "./types";
