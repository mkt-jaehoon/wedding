import crypto from "node:crypto";

// 서버 전용 관리자 세션 유틸. httpOnly 쿠키에 서명된 토큰을 담는다.
export const ADMIN_COOKIE = "wd_admin";
const TTL_MS = 1000 * 60 * 60 * 8; // 8시간

export function adminPasscode(): string {
  return process.env.ADMIN_PASSCODE || "wedding2027";
}

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSCODE ||
    "wedding-dev-secret"
  );
}

function hmac(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function signSession(): string {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${hmac(String(exp))}`;
}

export function verifySession(token?: string | null): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = hmac(exp);
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
