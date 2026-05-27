import { Card } from "./ui";
import { WEDDING } from "@/lib/wedding";

export function VenueMap() {
  const { lat, lng, venue, hall, venueDetail, mapQuery } = WEDDING;
  const q = encodeURIComponent(mapQuery);
  const embed = `https://www.google.com/maps?q=${lat},${lng}&z=16&hl=ko&output=embed`;
  const links = [
    {
      label: "카카오맵 길찾기",
      href: `https://map.kakao.com/link/to/${q},${lat},${lng}`,
      cls: "bg-[#FEE500] text-[#3C1E1E] hover:brightness-95",
    },
    {
      label: "네이버지도",
      href: `https://map.naver.com/p/search/${q}`,
      cls: "bg-[#03C75A] text-white hover:brightness-95",
    },
    {
      label: "구글지도",
      href: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      cls: "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
    },
  ];

  return (
    <Card className="mt-4 overflow-hidden">
      <div className="border-b border-zinc-100 p-5">
        <h2 className="text-sm font-semibold text-zinc-900">오시는 길</h2>
        <p className="mt-2 text-base font-bold text-zinc-900">
          {venue} <span className="text-zinc-500">· {hall}</span>
        </p>
        <p className="text-sm text-zinc-500">{venueDetail}</p>
        <p className="mt-1 text-sm text-rose-500">{WEDDING.dateLabel}</p>
      </div>
      <iframe
        title="예식장 지도"
        src={embed}
        className="h-64 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="flex flex-wrap gap-2 p-4">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${l.cls}`}
          >
            {l.label}
          </a>
        ))}
      </div>
    </Card>
  );
}
