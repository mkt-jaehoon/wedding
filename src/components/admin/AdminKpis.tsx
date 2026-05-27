import { Card } from "../ui";
import type { Summary } from "@/lib/aggregate";

export function AdminKpis({ sum }: { sum: Summary }) {
  const items = [
    { label: "총 신청", value: `${sum.totalGroups}팀` },
    { label: "총 인원", value: `${sum.totalPeople}명` },
    { label: "하행 SRT", value: `${sum.downSRT}명` },
    { label: "하행 KTX", value: `${sum.downKTX}명` },
    { label: "예매완료+", value: `${sum.booked}팀` },
  ];
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((it) => (
        <Card key={it.label} className="p-4">
          <p className="text-xs text-zinc-500">{it.label}</p>
          <p className="mt-1 text-xl font-bold text-zinc-900 tabular">{it.value}</p>
        </Card>
      ))}
    </div>
  );
}
