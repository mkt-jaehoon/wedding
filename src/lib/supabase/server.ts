import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버(라우트 핸들러) 전용 Supabase 클라이언트.
// anon 키를 사용하되, 관리자 RPC는 서버가 보관한 비밀번호로만 호출한다.
export function serverSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}
