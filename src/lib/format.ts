export function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonth(date: Date | string | null) {
  if (!date) {
    return "계산 불가";
  }

  const parsed = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(parsed);
}
