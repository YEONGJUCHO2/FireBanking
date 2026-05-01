import { cn } from '@/lib/cn'

export type FireMode = 'distance' | 'date' | 'meter'

type FireTimelineProps = {
  /** Progress 0..1 */
  percent: number
  /** Years remaining (for 'distance' mode) */
  years?: number
  /** Months remaining (for 'distance' mode) */
  months?: number
  /** Date label e.g. "2034. 8." (for 'date' mode) */
  dateLabel?: string
  /** Coast FIRE position 0..1 (default 0.55) */
  coastPercent?: number
  /** Momentum vs prior month, in pp */
  momentumPp?: number
  mode?: FireMode
  className?: string
  /** FIRE goal value in 만원 (display only) */
  goalManWon?: number
  /** Coast FIRE projected milestone value in 만원 (display only) */
  coastManWon?: number
}

export function FireTimeline({
  percent,
  years: _years = 8,
  months: _months = 4,
  dateLabel: _dateLabel = '2034. 8.',
  coastPercent: _coastPercent = 0.55,
  momentumPp: _momentumPp = 0.6,
  mode: _mode = 'distance',
  goalManWon = 40000,
  coastManWon: _coastManWon = 22000,
  className,
}: FireTimelineProps) {
  const pct = Math.max(0, Math.min(1, percent))
  const currentManWon = Math.round(goalManWon * pct)
  const remainingManWon = Math.max(0, goalManWon - currentManWon)
  const fireSize = 38
  const fireTrackInset = fireSize / 2
  const ticks = [
    { label: '0%', value: 0, left: '0%', transform: 'none' },
    { label: '25%', value: 0.25, left: '33.333%', transform: 'translateX(-50%)' },
    { label: '50%', value: 0.5, left: '66.667%', transform: 'translateX(-50%)' },
    { label: '100%', value: 1, right: 0, width: fireSize, transform: 'none' },
  ]

  return (
    <div className={cn(className)}>
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <div className="fb-num text-[13px] font-bold text-fb-ink">FIRE까지</div>
        <div className="fb-num text-[13px] font-extrabold text-fb-trust">
          {remainingManWon.toLocaleString('ko-KR')}만원
        </div>
      </div>

      <div className="relative my-1.5 h-10">
        <div
          className="absolute left-0 top-4 h-2 overflow-hidden rounded-full bg-fb-card-mute"
          style={{ width: `calc(100% - ${fireTrackInset}px)` }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-fb-trust to-[#3385FF] transition-[width] duration-300 ease-out"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute top-[9px] size-[22px] rounded-full border-[4px] border-fb-trust bg-white shadow-[0_0_0_3px_rgba(0,102,255,0.12)] transition-[left] duration-300 ease-out"
          style={{ left: `calc(${pct * 100}% - ${fireTrackInset * pct + 11}px)` }}
        >
          <span className="sr-only">현재 FIRE 진척 {Math.round(pct * 100)}%</span>
        </div>
        <FlameMark className="absolute right-0 top-[-2px] size-[38px]" />
      </div>

      <div className="fb-num relative h-[18px] text-[12px] font-bold">
        {ticks.map((tick) => (
          <span
            key={tick.label}
            className={cn('absolute', pct >= tick.value ? 'text-fb-trust' : 'text-fb-ink-3')}
            style={{
              left: tick.left,
              right: tick.right,
              width: tick.width,
              transform: tick.transform,
              textAlign: tick.width ? 'center' : undefined,
            }}
          >
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* Wide horizontal timeline — used inside the desktop dashboard */
export function FireTimelineWide({
  percent,
  years = 8,
  months = 4,
  dateLabel = '2034. 8.',
  mode = 'distance',
  fireValueManWon = 40000,
  hereValueManWon = 13500,
  className,
}: {
  percent: number
  years?: number
  months?: number
  dateLabel?: string
  mode?: FireMode
  fireValueManWon?: number
  hereValueManWon?: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(1, percent))
  const remainingManWon = Math.max(0, fireValueManWon - hereValueManWon)
  const fireSize = 40
  const fireTrackInset = fireSize / 2
  const ticks = [
    { label: '0%', value: 0, left: '0%', transform: 'none' },
    { label: '25%', value: 0.25, left: '33.333%', transform: 'translateX(-50%)' },
    { label: '50%', value: 0.5, left: '66.667%', transform: 'translateX(-50%)' },
    { label: '100%', value: 1, right: 0, width: fireSize, transform: 'none' },
  ]
  return (
    <div className={className}>
      <div className="relative h-[92px] pt-8">
        <div className="absolute left-0 top-0 text-[11px] font-semibold uppercase tracking-[0.024em] text-fb-ink">
          FIRE까지
        </div>
        <div className="fb-num absolute right-0 top-0 text-[11px] font-semibold uppercase tracking-[0.024em] text-fb-trust">
          {remainingManWon.toLocaleString('ko-KR')}만원
        </div>

        <div className="absolute left-0 top-10 h-2 overflow-hidden rounded-full bg-fb-card-mute" style={{ width: `calc(100% - ${fireTrackInset}px)` }}>
          <div className="h-full rounded-full bg-gradient-to-r from-fb-trust to-[#3385FF]" style={{ width: `${pct * 100}%` }} />
        </div>
        <div
          aria-hidden="true"
          className="absolute top-[33px] size-[22px] rounded-full border-[4px] border-fb-trust bg-white shadow-[0_0_0_3px_rgba(0,102,255,0.12)]"
          style={{ left: `calc(${pct * 100}% - ${fireTrackInset * pct + 11}px)` }}
        />
        <FlameMark className="absolute right-0 top-[19px] size-10" />

        <div className="absolute left-0 right-0 top-16">
          {ticks.map((tick) => (
            <div
              key={tick.label}
              className={cn(
                'fb-num absolute text-[10px] font-semibold tracking-[0.018em]',
                pct >= tick.value ? 'text-fb-trust' : 'text-fb-ink-3',
              )}
              style={{
                left: tick.left,
                right: tick.right,
                width: tick.width,
                transform: tick.transform,
                textAlign: tick.width ? 'center' : undefined,
              }}
            >
              {tick.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[18px] flex items-center justify-between">
        <div className="fb-num text-[13px] font-semibold text-fb-ink-2">
          진척 <span className="font-bold text-fb-trust">{Math.round(pct * 100)}%</span>
        </div>
        <div className="fb-num text-[16px] font-bold text-fb-ink">
          {mode === 'date' ? (
            <>
              예상 도달 <span className="text-fb-trust">{dateLabel}</span>
            </>
          ) : mode === 'meter' ? (
            <>
              <span className="text-fb-trust">{Math.round(pct * 100)}%</span> 도달
            </>
          ) : (
            <>
              남은 거리{' '}
              <span className="text-fb-trust">
                {years}년 {months}개월
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FlameMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#EAF2FE" />
      <path
        d="M21.3 8.5c.8 4.2-2.4 6.2-4.7 8.7-2 2.1-3.1 4.1-2.6 7 .6 3.9 3.7 6.8 7.6 6.8 4.5 0 7.9-3.1 7.9-7.6 0-3.4-1.8-6.1-4.5-8.4.1 2-1 3.6-2.4 4.5.5-4.4-.1-7.9-1.3-11Z"
        fill="#0066FF"
      />
      <path
        d="M20.8 22.2c-1.5 1.4-2.1 2.6-2 4 .1 1.7 1.4 2.9 3.1 2.9 1.9 0 3.3-1.3 3.3-3.2 0-1.8-1.1-3.2-2.6-4.4.1 1-.5 1.9-1.4 2.5.1-.7 0-1.3-.4-1.8Z"
        fill="white"
      />
    </svg>
  )
}
