import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPasscode, verifySession } from "@/lib/admin-session";
import { serverSupabase } from "@/lib/supabase/server";

async function requireAuth() {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    status?: string;
    publicVisible?: boolean;
    memo?: string;
  };
  const { error } = await serverSupabase().rpc("admin_update_guest", {
    p_passcode: adminPasscode(),
    p_id: id,
    p_status: body.status ?? null,
    p_public_visible: body.publicVisible ?? null,
    p_admin_memo: body.memo ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { error } = await serverSupabase().rpc("admin_delete_guest", {
    p_passcode: adminPasscode(),
    p_id: id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
