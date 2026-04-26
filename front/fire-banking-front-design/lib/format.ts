const numberFormatter = new Intl.NumberFormat('ko-KR')

export function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value))
}

export function formatManWon(value: number, options?: { signed?: boolean; emptyDash?: boolean }) {
  if (options?.emptyDash && !Number.isFinite(value)) return '—'

  const sign = value < 0 ? '-' : options?.signed && value > 0 ? '+' : ''
  const abs = Math.abs(Math.round(value))

  if (abs >= 10_000) {
    const eok = Math.floor(abs / 10_000)
    const man = abs % 10_000
    return man > 0 ? `${sign}${formatNumber(eok)}억 ${formatNumber(man)}만원` : `${sign}${formatNumber(eok)}억원`
  }

  return `${sign}${formatNumber(abs)}만원`
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(date)
}
