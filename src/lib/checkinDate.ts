const englishMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "Asia/Seoul",
});

export function formatCheckinMonthLabel(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}. ${month}. 체크인`;
}

export function formatWorkspaceMonthLabel(date = new Date()) {
  const year = date.getFullYear();
  const month = englishMonthFormatter.format(date).toUpperCase();

  return `${year} ${month} · 우리 가족 워크스페이스`;
}

export function formatPreviousMonthReuseLabel(date = new Date()) {
  const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);

  return `${previousMonth.getMonth() + 1}월 입력값 그대로 사용`;
}

export function formatNextCheckinDate(date = new Date()) {
  const nextMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return `${nextMonthStart.getFullYear()}년 ${nextMonthStart.getMonth() + 1}월 1일`;
}
