import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";

export async function GET() {
  const store = await cookies();
  const authed = verifySession(store.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ authed });
}
