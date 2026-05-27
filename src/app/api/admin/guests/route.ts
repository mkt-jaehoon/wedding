import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPasscode, verifySession } from "@/lib/admin-session";
import { serverSupabase } from "@/lib/supabase/server";
import { toGuest, type GuestRow } from "@/lib/supabase/mappers";

async function requireAuth() {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data, error } = await serverSupabase().rpc("admin_list_guests", {
    p_passcode: adminPasscode(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(((data ?? []) as GuestRow[]).map(toGuest));
}
