import type { ReactNode } from "react";
import type { BookingStatus, TrainType } from "@/lib/types";
import { STATUS_META, TRAIN_META } from "@/lib/labels";

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        meta.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function TrainBadge({ type }: { type: TrainType }) {
  const meta = TRAIN_META[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold ring-1 ring-inset",
        meta.badge,
      )}
    >
      {meta.label}
    </span>
  );
}

export function RouteArrow({ from, to }: { from: string; to: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-zinc-700">
      <span className="font-medium">{from}</span>
      <span className="text-zinc-400">→</span>
      <span className="font-medium">{to}</span>
    </span>
  );
}
