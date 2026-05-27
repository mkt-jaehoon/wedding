import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "하객 이동 현황 · 부산 예식 기차 대시보드",
  description:
    "서울권 → 부산 KTX/SRT 하객 이동 수요 취합 및 예매 상태 관리 대시보드",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200/70 py-6 text-center text-xs text-zinc-400">
          하객 이동 현황 대시보드 · MVP · 개인정보는 최소한으로만 공개됩니다
        </footer>
      </body>
    </html>
  );
}
