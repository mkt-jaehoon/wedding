import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPasscode, signSession } from "@/lib/admin-session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const passcode = (body as { passcode?: unknown }).passcode;
  if (typeof passcode !== "string" || passcode !== adminPasscode()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
