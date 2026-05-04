import { cn } from '@/lib/cn'

export type FireMode = 'distance' | 'date' | 'meter'
export type FireDisplayMode = 'amount' | 'period'

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
  displayMode?: FireDisplayMode
  className?: string
  /** FIRE goal value in 만원 (display only) */
  goalManWon?: number
  /** Coast FIRE projected milestone value in 만원 (display only) */
  coastManWon?: number
}

export function FireTimeline({
  percent,
  years = 8,
  months = 4,
  displayMode = 'amount',
  goalManWon = 40000,
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
        <div className="fb-num text-[13px] font-bold text-fb-ink">
          {displayMode === 'amount' ? 'FIRE까지 남은 금액' : 'FIRE까지 남은 기간'}
        </div>
        <div className="fb-num text-[13px] font-extrabold text-fb-trust">
          {displayMode === 'amount'
            ? `${remainingManWon.toLocaleString('ko-KR')}만원`
            : `${years}년 ${months}개월`}
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
        <FireEmoji className="absolute right-0 top-[-2px] size-[38px]" />
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
  displayMode = 'amount',
  fireValueManWon = 40000,
  hereValueManWon = 13500,
  className,
}: {
  percent: number
  years?: number
  months?: number
  dateLabel?: string
  mode?: FireMode
  displayMode?: FireDisplayMode
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
          {displayMode === 'amount' ? 'FIRE까지 남은 금액' : 'FIRE까지 남은 기간'}
        </div>
        <div className="fb-num absolute right-0 top-0 text-[11px] font-semibold uppercase tracking-[0.024em] text-fb-trust">
          {displayMode === 'amount'
            ? `${remainingManWon.toLocaleString('ko-KR')}만원`
            : `${years}년 ${months}개월`}
        </div>

        <div className="absolute left-0 top-10 h-2 overflow-hidden rounded-full bg-fb-card-mute" style={{ width: `calc(100% - ${fireTrackInset}px)` }}>
          <div className="h-full rounded-full bg-gradient-to-r from-fb-trust to-[#3385FF]" style={{ width: `${pct * 100}%` }} />
        </div>
        <div
          aria-hidden="true"
          className="absolute top-[33px] size-[22px] rounded-full border-[4px] border-fb-trust bg-white shadow-[0_0_0_3px_rgba(0,102,255,0.12)]"
          style={{ left: `calc(${pct * 100}% - ${fireTrackInset * pct + 11}px)` }}
        />
        <FireEmoji className="absolute right-0 top-[19px] size-10" />

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
          {displayMode === 'amount' ? (
            <>
              남은 금액 <span className="text-fb-trust">{remainingManWon.toLocaleString('ko-KR')}만원</span>
            </>
          ) : mode === 'date' ? (
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

function FireEmoji({ className }: { className?: string }) {
  return (
    // External animated emoji GIF; next/image is not useful for this tiny decorative asset.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://em-content.zobj.net/source/animated-noto-color-emoji/356/fire_1f525.gif"
      alt="FIRE"
      className={cn('pointer-events-none select-none object-contain', className)}
      draggable={false}
    />
  )
}
