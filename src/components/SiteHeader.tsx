"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui";

const NAV = [
  { href: "/", label: "안내" },
  { href: "/apply", label: "탑승 신청" },
  { href: "/status", label: "이동 현황" },
  { href: "/my", label: "내 탑승정보" },
  { href: "/admin", label: "관리자" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Link href="/" className="shrink-0">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 sm:text-base">
              🚄 부산 예식
            </span>
          </Link>
          <nav
            className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="주요 메뉴"
          >
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors sm:text-sm",
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
