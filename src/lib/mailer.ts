import nodemailer from "nodemailer";

// 네이버 SMTP 발송. 자격증명은 서버 env로만 주입(SMTP_USER / SMTP_PASS).
export function mailerConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail(subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST || "smtp.naver.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFY_TO || "eksska12@naver.com";
  if (!user || !pass) {
    throw new Error("SMTP 자격증명 미설정(SMTP_USER/SMTP_PASS)");
  }
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await transport.sendMail({ from: user, to, subject, text });
}
