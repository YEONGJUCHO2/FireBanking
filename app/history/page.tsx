import Link from 'next/link'
import { BottomNav, MobileAppShell } from '@/components/fire-banking'
import { getAssetManagementData } from '@/src/features/assets/lib/getAssetManagementData'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

// ---------- types ----------------------------------------------------------

const firstRealHistoryMonth = '2026-05-01'

interface HistoryRow {
  id: string
  ym: string
  fireNetworth: number // 만원
  remainingFireAmount: number // 만원
  monthlyGrowth: number // 만원
  targetMonthlyExpense: number // 만원
  fireTargetAsset: number // 만원
  projectedDistance: string
  basisLabel: string
}

interface SnapshotRow {
  id: string
  month: string
  fireNetworth: number
  monthlyGrowth: number
  targetMonthlyExpense: number
  fireTargetAsset: number
  projectedFireDate: string | null
}

// ---------- helpers --------------------------------------------------------

function formatEok(valueManWon: number): string {
  const v = Math.max(0, Math.round(valueManWon))
  const eok = Math.floor(v / 10000)
  const remainder = v % 10000
  if (eok === 0) return `${remainder.toLocaleString('ko-KR')}만원`
  if (remainder === 0) return `${eok.toLocaleString('ko-KR')}억원`
  return `${eok.toLocaleString('ko-KR')}억 ${remainder.toLocaleString('ko-KR')}만원`
}

// ---------- sub-components -------------------------------------------------

function HistoryCheckinCard({ row, index }: { row: HistoryRow; index: number }) {
  const defaultOpen = index === 0
  return (
    <article
      data-od-id={`card-month-${index + 1}`}
      className="rounded-[16px] border border-fb-line bg-white px-5 pb-[18px] pt-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="fb-num whitespace-nowrap text-[18px] font-bold tracking-[-0.020em] text-fb-ink">
          {row.ym}
        </h2>
        <div className="flex min-w-0 flex-col items-end">
          <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.04em] text-fb-ink-3">
            FIRE까지 남은 금액
          </p>
          <p className="fb-num mt-1 whitespace-nowrap text-[22px] font-bold tracking-[-0.020em] text-fb-trust">
            {formatEok(row.remainingFireAmount)}
          </p>
          <p className="mt-1 rounded-full bg-fb-trust-soft px-2 py-0.5 text-[10px] font-bold text-fb-trust">
            {row.basisLabel}
          </p>
        </div>
      </div>

      <details
        open={defaultOpen}
        className="group mt-3.5 overflow-hidden rounded-[12px] bg-fb-card-mute"
      >
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 py-3.5">
          <span className="text-[14px] font-semibold text-fb-ink">상세 정보 보기</span>
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0 rotate-0 text-fb-ink-2 transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          >
            <polyline points="3 6 8 11 13 6" />
          </svg>
        </summary>

        <div className="px-3.5 pb-3.5">
          <p className="mb-2.5 text-[12px] leading-[1.5] text-fb-ink-2">
            목표 월 생활비 {row.targetMonthlyExpense.toLocaleString('ko-KR')}만원 · FIRE 목표자산{' '}
            {formatEok(row.fireTargetAsset)} 기준
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <BreakdownItem label="목표 금액" value={row.fireTargetAsset} />
            <BreakdownItem label="FIRE 후 생활비" value={row.targetMonthlyExpense} monthly />
            <BreakdownItem label="FIRE 계산 순자산" value={row.fireNetworth} />
            <BreakdownItem label="모이는 돈" value={row.monthlyGrowth} monthly />
          </div>
        </div>
      </details>
    </article>
  )
}

function BreakdownItem({
  label,
  value,
  monthly,
}: {
  label: string
  value: number
  monthly?: boolean
}) {
  return (
    <div>
      <div className="text-[12px] font-medium text-fb-ink-3">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        {monthly ? <span className="text-[12px] font-semibold text-fb-ink-3">월</span> : null}
        <span className="fb-num text-[17px] font-bold text-fb-ink">
          {value.toLocaleString('ko-KR')}
        </span>
        <span className="text-[12px] font-semibold text-fb-ink-3">만원</span>
      </div>
    </div>
  )
}

// ---------- page -----------------------------------------------------------

export default async function HistoryPage() {
  const rows = await fetchHistoryRows()

  const isEmpty = rows.length === 0

  return (
    <MobileAppShell>
      <div data-screen-label="history" className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-fb-line-soft px-5 pb-4 pt-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
            HISTORY
          </p>
          <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.020em] text-fb-ink">
            월별 체크인 기록
          </h1>
          <p className="mt-1.5 text-[13px] leading-[1.5] text-fb-ink-2">
            매달 저장된 우리 가족의 숫자.
            <br />
            지난 달과 비교해서 천천히 보세요.
          </p>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-auto bg-fb-page px-4 pb-[100px] pt-3.5">
          {isEmpty ? (
            /* Empty state — explicitly shown when no Supabase data exists */
            <div
              data-od-id="empty-state"
              className="rounded-[16px] border border-fb-line bg-white px-5 py-10 text-center"
            >
              <p className="text-[14px] font-bold text-fb-ink">아직 저장된 기록이 없어요</p>
              <p className="mt-2 text-[12px] font-medium leading-[1.55] text-fb-ink-2">
                매달 체크인이 마감되면 한 줄씩 쌓여요.
                <br />
                몇 달 지나면 추세가 보이기 시작해요.
              </p>
              <Link
                href="/dashboard"
                className="fbpress mt-5 inline-flex h-[44px] items-center justify-center rounded-[12px] bg-fb-ink px-5 text-[13px] font-bold text-white"
              >
                홈에서 현재 결과 보기
              </Link>
            </div>
          ) : (
            <div data-od-id="history-list" className="grid gap-3">
              {rows.map((row, i) => (
                <HistoryCheckinCard key={row.id} row={row} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>

      <div data-od-id="bottom-nav">
        <BottomNav active="history" />
      </div>
    </MobileAppShell>
  )
}

async function fetchHistoryRows(): Promise<HistoryRow[]> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership?.couple_id) {
    return []
  }

  const [{ data }, assetData] = await Promise.all([
    supabase
    .from('monthly_cashflow_snapshots')
    .select(
      [
        'id',
        'month',
        'fire_calculation_net_worth',
        'monthly_asset_growth_capacity',
        'annual_fire_expense',
        'fire_target_asset',
        'projected_fire_date',
      ].join(','),
    )
    .eq('couple_id', membership.couple_id)
    .order('month', { ascending: false })
    .limit(24),
    getAssetManagementData(),
  ])

  const storedSnapshots = ((data ?? []) as unknown as Array<{
    id: string
    month: string
    fire_calculation_net_worth: number | string
    monthly_asset_growth_capacity: number | string
    annual_fire_expense: number | string
    fire_target_asset: number | string
    projected_fire_date: string | null
  }>).map((row) => ({
    id: row.id,
    month: row.month,
    fireNetworth: Math.round(Number(row.fire_calculation_net_worth) / 10_000),
    monthlyGrowth: Math.round(Number(row.monthly_asset_growth_capacity) / 10_000),
    targetMonthlyExpense: Math.round(Number(row.annual_fire_expense) / 12 / 10_000),
    fireTargetAsset: Math.round(Number(row.fire_target_asset) / 10_000),
    projectedFireDate: row.projected_fire_date,
  }))
  const currentMonth = currentKstMonthStart(new Date())
  const currentFireNetworthMan = getCurrentFireNetworthMan(assetData)
  const snapshots = applyCurrentFireNetworth(
    fillMissingMonthlySnapshots(storedSnapshots),
    currentFireNetworthMan,
    currentMonth,
  )

  return snapshots.map((row) => ({
    id: row.id,
    ym: formatHistoryMonth(row.month),
    fireNetworth: row.fireNetworth,
    remainingFireAmount: Math.max(0, row.fireTargetAsset - row.fireNetworth),
    monthlyGrowth: row.monthlyGrowth,
    targetMonthlyExpense: row.targetMonthlyExpense,
    fireTargetAsset: row.fireTargetAsset,
    projectedDistance: formatProjectedDistance(row.month, row.projectedFireDate),
    basisLabel: row.month === currentMonth && currentFireNetworthMan != null
      ? '현재 자산진단 기준'
      : '월 체크인 저장 기준',
  }))
}

function getCurrentFireNetworthMan({
  holdings,
  liabilities,
}: Awaited<ReturnType<typeof getAssetManagementData>>) {
  const registeredHoldings = holdings ?? []
  const registeredLiabilities = liabilities ?? []

  if (registeredHoldings.length === 0 && registeredLiabilities.length === 0) {
    return null
  }

  const fireIncludedHoldingAmount = registeredHoldings
    .filter((holding) => holding.accountCategory !== 'pension_savings' && holding.accountCategory !== 'irp')
    .reduce((total, holding) => total + holding.valuationAmount, 0)
  const fireIncludedLiabilityAmount = registeredLiabilities
    .filter((liability) => liability.purpose === 'investment')
    .reduce((total, liability) => total + liability.balanceAmount, 0)

  return Math.max(0, Math.round((fireIncludedHoldingAmount - fireIncludedLiabilityAmount) / 10_000))
}

function applyCurrentFireNetworth(
  snapshots: SnapshotRow[],
  currentFireNetworthMan: number | null,
  currentMonth: string,
) {
  if (currentFireNetworthMan == null) {
    return snapshots
  }

  return snapshots.map((snapshot) => ({
    ...snapshot,
    fireNetworth: snapshot.month === currentMonth ? currentFireNetworthMan : snapshot.fireNetworth,
  }))
}

function formatHistoryMonth(month: string) {
  const normalizedMonth = normalizeMonthStart(month)
  if (!normalizedMonth) {
    return month
  }

  const date = new Date(`${normalizedMonth}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return month
  }

  return `${date.getUTCFullYear()}년 ${date.getUTCMonth() + 1}월`
}

function fillMissingMonthlySnapshots(snapshots: SnapshotRow[], now = new Date()): SnapshotRow[] {
  if (snapshots.length === 0) {
    return []
  }

  const normalizedSnapshots = snapshots
    .map((snapshot) => {
      const month = normalizeMonthStart(snapshot.month)
      return month ? { ...snapshot, month } : snapshot
    })
    .sort((a, b) => b.month.localeCompare(a.month))

  const latest = normalizedSnapshots[0]
  const latestMonth = normalizeMonthStart(latest.month)
  const currentMonth = currentKstMonthStart(now)

  if (!latestMonth || latestMonth >= currentMonth) {
    return normalizedSnapshots.filter((snapshot) => snapshot.month >= firstRealHistoryMonth)
  }

  const generatedSnapshots: SnapshotRow[] = []
  let month = addMonths(latestMonth, 1)

  while (month <= currentMonth) {
    generatedSnapshots.push({
      ...latest,
      id: `auto-${month}`,
      month,
    })
    month = addMonths(month, 1)
  }

  return [...generatedSnapshots, ...normalizedSnapshots]
    .filter((snapshot) => snapshot.month >= firstRealHistoryMonth)
    .sort((a, b) => b.month.localeCompare(a.month))
}

function normalizeMonthStart(month: string) {
  const match = /^(\d{4})-(\d{2})/.exec(month)
  if (!match) {
    return null
  }

  return `${match[1]}-${match[2]}-01`
}

function currentKstMonthStart(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value

  return `${year}-${month}-01`
}

function addMonths(month: string, count: number) {
  const date = new Date(`${month}T00:00:00.000Z`)
  date.setUTCMonth(date.getUTCMonth() + count)

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`
}

function formatProjectedDistance(month: string, projectedFireDate: string | null) {
  if (!projectedFireDate) {
    return '계산 대기'
  }

  const from = new Date(`${month}T00:00:00.000Z`)
  const to = new Date(`${projectedFireDate}T00:00:00.000Z`)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return '계산 대기'
  }

  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth())

  if (months <= 0) {
    return '도달'
  }

  const years = Math.floor(months / 12)
  const restMonths = months % 12

  if (years === 0) {
    return `${restMonths}개월 후`
  }

  if (restMonths === 0) {
    return `${years}년 후`
  }

  return `${years}년 ${restMonths}개월 후`
}
