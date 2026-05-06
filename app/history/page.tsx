import { BottomNav, MobileAppShell } from '@/components/fire-banking'

// ---------- types ----------------------------------------------------------

type HistoryStatus = 'finalized' | 'temporary'

interface HistoryRow {
  id: string
  ym: string           // e.g. "2026년 4월"
  fireNetworth: number // 만원
  delta: number | null // 전월 대비 만원 (null = 비교 불가)
  status: HistoryStatus
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

function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '−'
  const abs = Math.abs(delta)
  const eok = Math.floor(abs / 10000)
  const rem = abs % 10000
  let body: string
  if (eok === 0) body = `${rem.toLocaleString('ko-KR')}만`
  else if (rem === 0) body = `${eok.toLocaleString('ko-KR')}억`
  else body = `${eok.toLocaleString('ko-KR')}억 ${rem.toLocaleString('ko-KR')}만`
  return `${sign}${body}`
}

// ---------- sub-components -------------------------------------------------

function StatusPill({ status }: { status: HistoryStatus }) {
  const label = status === 'finalized' ? '확정' : '임시'
  const odId = status === 'finalized' ? 'status-pill-finalized' : 'status-pill-temporary'
  const cls =
    status === 'finalized'
      ? 'bg-fb-trust-soft text-fb-trust-ink'
      : 'bg-fb-card-alt text-fb-ink-3'

  return (
    <div data-od-id={odId}>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}
      >
        {label}
      </span>
    </div>
  )
}

function HistoryListRow({ row, index }: { row: HistoryRow; index: number }) {
  const deltaColor =
    row.delta === null
      ? 'text-fb-ink-3'
      : row.delta >= 0
      ? 'text-fb-positive'
      : 'text-fb-negative'

  return (
    <div
      data-od-id={`row-month-${index + 1}`}
      className="flex items-center justify-between gap-3 border-b border-fb-line-soft py-3 last:border-0"
    >
      {/* Left: month label */}
      <p className="min-w-0 shrink-0 text-[13px] font-semibold text-fb-ink-2">{row.ym}</p>

      {/* Right cluster */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Delta */}
        {row.delta !== null ? (
          <span className={`fb-num text-[11px] font-semibold ${deltaColor}`}>
            {formatDelta(row.delta)}
          </span>
        ) : (
          <span className="text-[11px] text-fb-ink-3">—</span>
        )}

        {/* FIRE 반영 순자산 */}
        <span className="fb-num text-right text-[13px] font-bold text-fb-ink">
          {formatEok(row.fireNetworth)}
        </span>

        {/* Status pill */}
        <StatusPill status={row.status} />
      </div>
    </div>
  )
}

// ---------- page -----------------------------------------------------------

/**
 * History page — visual pass.
 *
 * Real-data rule: this page ONLY renders rows that come from Supabase.
 * When there is no data the empty state is shown explicitly.
 * Hard-coded sample history is NEVER rendered as if it were real user data.
 *
 * TODO: replace `rows` below with your actual Supabase fetch once wired.
 */
export default function HistoryPage() {
  // TODO: replace with Supabase fetch, e.g.:
  // const rows: HistoryRow[] = await fetchHistoryRows()
  const rows: HistoryRow[] = []

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
        <main className="flex-1 overflow-auto px-5 pb-[100px] pt-5">
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
            </div>
          ) : (
            /* List — dense, no zebra, right-aligned numbers */
            <div
              data-od-id="history-list"
              className="rounded-[16px] border border-fb-line bg-white px-4"
            >
              {/* Column header row */}
              <div className="flex items-center justify-between gap-3 border-b border-fb-line py-2">
                <p className="text-[10px] font-semibold text-fb-ink-3">월</p>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-[10px] font-semibold text-fb-ink-3">전월 대비</p>
                  <p className="text-[10px] font-semibold text-fb-ink-3">FIRE 순자산</p>
                  <p className="text-[10px] font-semibold text-fb-ink-3">상태</p>
                </div>
              </div>

              {rows.map((row, i) => (
                <HistoryListRow key={row.id} row={row} index={i} />
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
