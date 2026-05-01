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
  years = 8,
  months = 4,
  dateLabel = '2034. 8.',
  coastPercent = 0.55,
  momentumPp = 0.6,
  mode = 'distance',
  goalManWon = 40000,
  coastManWon = 22000,
  className,
}: FireTimelineProps) {
  const pct = Math.max(0, Math.min(1, percent))
  const reachedCoast = pct >= coastPercent

  const targetText =
    mode === 'date' ? dateLabel : mode === 'meter' ? `${Math.round(pct * 100)}% 도달` : `${years}년 ${months}개월`
  const targetLabel = mode === 'date' ? '예상 도달' : mode === 'meter' ? '' : '남은 거리'

  return (
    <div className={cn('flex gap-[18px]', className)}>
      {/* Vertical track + nodes */}
      <div className="relative w-7 shrink-0">
        {/* track */}
        <span className="absolute left-[13px] top-2 bottom-2 w-[2px] rounded-full bg-[#F0F0F2]" />
        {/* fill (bottom→up) */}
        <span
          className="absolute left-[13px] bottom-2 w-[2px] rounded-full bg-gradient-to-t from-fb-trust to-[#3385FF] transition-[height] duration-300 ease-out"
          style={{ height: `calc(${pct * 100}% - 16px)` }}
        />
        {/* FIRE node (top) */}
        <div
          className={cn(
            'absolute left-0 top-0 flex size-7 items-center justify-center rounded-full border-2 border-fb-trust',
            pct >= 1 ? 'bg-fb-trust' : 'bg-white',
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"
              fill={pct >= 1 ? '#fff' : '#0066FF'}
            />
          </svg>
        </div>
        {/* Coast FIRE node (middle) */}
        <span
          className={cn(
            'absolute left-1 size-5 rounded-full border-2',
            reachedCoast ? 'border-fb-trust bg-fb-trust' : 'border-fb-line-strong bg-white',
          )}
          style={{ top: `calc(${(1 - coastPercent) * 100}% - 10px)` }}
        />
        {/* current node */}
        <span
          className="absolute left-0 size-7 rounded-full border-[3px] border-fb-trust bg-white shadow-[0_4px_12px_rgba(0,102,255,0.28),0_0_0_6px_rgba(0,102,255,0.10)] transition-[bottom] duration-300 ease-out"
          style={{ bottom: `calc(${pct * 100}% - 14px)` }}
        />
      </div>

      {/* Right column — labels */}
      <div className="flex min-h-[184px] flex-1 flex-col justify-between">
        {/* FIRE goal */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.10em] text-fb-trust">FIRE</div>
          <div className="mt-0.5 text-[16px] font-bold tracking-[-0.012em] text-fb-ink">경제적 자유</div>
          <div className="fb-num mt-0.5 text-[12px] font-medium text-fb-ink-3">
            {goalManWon.toLocaleString('ko-KR')}만원 · 25배 룰
          </div>
        </div>

        {/* Coast FIRE milestone */}
        <div className={reachedCoast ? '' : 'opacity-85'}>
          <div
            className={cn(
              'text-[11px] font-bold uppercase tracking-[0.10em]',
              reachedCoast ? 'text-fb-trust' : 'text-fb-ink-3',
            )}
          >
            Coast FIRE
          </div>
          <div className="mt-0.5 text-[14px] font-semibold tracking-[-0.008em] text-fb-ink">저축 멈춰도 도달 가능</div>
          <div className="fb-num mt-0.5 text-[12px] font-medium text-fb-ink-3">
            약 {coastManWon.toLocaleString('ko-KR')}만원 시점
          </div>
        </div>

        {/* Today us */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.10em] text-fb-ink-2">오늘 우리</div>
          <div className="mt-0.5 text-[14px] font-bold tracking-[-0.008em] text-fb-ink">
            <span className="fb-num text-fb-trust">{Math.round(pct * 100)}%</span> 진척 ·{' '}
            <span className="fb-num">{targetText}</span>
            {targetLabel ? (
              <span className="text-[12px] font-medium text-fb-ink-3"> · {targetLabel}</span>
            ) : null}
          </div>
          <div className="mt-0.5 text-[12px] font-medium text-fb-ink-3">
            지난달 대비{' '}
            <span className="fb-num font-bold text-fb-positive">
              {momentumPp >= 0 ? '+' : ''}
              {momentumPp.toFixed(1)}%p
            </span>
          </div>
        </div>
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
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  return (
    <div className={className}>
      <div className="relative h-20 pt-8">
        <div className="fb-num absolute left-0 top-0 text-[11px] font-semibold uppercase tracking-[0.024em] text-fb-ink-3">
          오늘 우리 · {hereValueManWon.toLocaleString('ko-KR')} 만원
        </div>
        <div className="fb-num absolute right-0 top-0 text-[11px] font-semibold uppercase tracking-[0.024em] text-fb-trust">
          FIRE · {fireValueManWon.toLocaleString('ko-KR')} 만원
        </div>

        <div className="absolute left-0 right-0 top-[38px] h-2 rounded-full bg-fb-card-mute" />
        <div
          className="absolute left-0 top-[38px] h-2 rounded-full bg-gradient-to-r from-fb-trust to-[#3385FF]"
          style={{ width: `${pct * 100}%` }}
        />
        <div
          className="absolute top-[31px] size-[22px] rounded-full border-[4px] border-fb-trust bg-white shadow-[0_4px_10px_rgba(0,102,255,0.30)]"
          style={{ left: `calc(${pct * 100}% - 11px)` }}
        />
        <div className="absolute right-[-7px] top-[35px] size-3.5 rounded-full bg-fb-trust" />

        <div className="absolute left-0 right-0 top-[56px]">
          {ticks.map((t) => (
            <div
              key={t}
              className="fb-num absolute text-[10px] font-semibold tracking-[0.018em] text-fb-ink-3"
              style={{ left: `${t * 100}%`, transform: 'translateX(-50%)' }}
            >
              {Math.round(t * 100)}%
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
