// 데모(localStorage) 모드 전용 관리자 인증.
// Supabase 모드에서는 서버 쿠키 세션(/api/admin/*)을 사용하므로 이 파일을 쓰지 않는다.

const FLAG = "wedding.admin.demo.v1";

export function checkPasscode(input: string): boolean {
  const expected = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "wedding2027";
  return input.trim() === expected;
}

export function isDemoAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(FLAG) === "1";
}

export function setDemoAuthed(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) window.sessionStorage.setItem(FLAG, "1");
  else window.sessionStorage.removeItem(FLAG);
}
