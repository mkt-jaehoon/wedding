// 표시용 포맷 헬퍼

// 한국식 이름 마스킹: 가운데 글자 마스킹 (김재훈 -> 김*훈, 김훈 -> 김*)
export function maskName(name: string): string {
  const n = name.trim();
  if (n.length <= 1) return n;
  if (n.length === 2) return `${n[0]}*`;
  return `${n[0]}${"*".repeat(n.length - 2)}${n[n.length - 1]}`;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// "2027-05-22" -> "5월 22일"
export function formatDateShort(date: string): string {
  const d = new Date(`${date}T00:00:00+09:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// "2027-05-22" -> "5월 22일 (토)"
export function formatDateWithDow(date: string): string {
  const d = new Date(`${date}T00:00:00+09:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

export function formatDday(days: number): string {
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
}
