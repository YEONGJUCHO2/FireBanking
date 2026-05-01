import { cn } from '@/lib/cn'
import { Card, SectionHeader } from './card'
import { FireTimeline, type FireMode } from './fire-timeline'
import { Icon } from './icons'

type FireHeroCardProps = {
  /** Progress 0..1 toward FIRE */
  percent?: number
  years?: number
  months?: number
  dateLabel?: string
  mode?: FireMode
  /** Coast FIRE position 0..1 */
  coastPercent?: number
  /** Δ vs prior month in percentage points */
  momentumPp?: number
  goalManWon?: number
  coastManWon?: number
  className?: string
  /** Show "자세히" affordance (calculation assumptions sheet) */
  detailsHref?: string
  detailsAction?: () => void
  /** Legacy props (back-compat) — these are accepted but ignored where unused */
  distanceLabel?: string
  state?: string
  compact?: boolean
}

export function FireHeroCard({
  percent = 0.34,
  years,
  months,
  dateLabel,
  mode = 'distance',
  coastPercent,
  momentumPp,
  goalManWon,
  coastManWon,
  detailsHref,
  detailsAction,
  className,
}: FireHeroCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
            FIRE까지 남은 거리
          </div>
          <div className="mt-1 text-[14px] font-semibold text-fb-ink">현재 입력 기준 시뮬레이션</div>
        </div>
        {detailsHref ? (
          <a
            href={detailsHref}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-fb-ink-2 hover:text-fb-ink"
          >
            자세히 <Icon name="chevron-right" className="size-3.5" />
          </a>
        ) : detailsAction ? (
          <button
            type="button"
            onClick={detailsAction}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-fb-ink-2 hover:text-fb-ink"
          >
            자세히 <Icon name="chevron-right" className="size-3.5" />
          </button>
        ) : null}
      </div>
      <FireTimeline
        percent={percent}
        years={years}
        months={months}
        dateLabel={dateLabel}
        coastPercent={coastPercent}
        momentumPp={momentumPp}
        goalManWon={goalManWon}
        coastManWon={coastManWon}
        mode={mode}
      />
    </Card>
  )
}

/* Wrapper for the section-headered version (mobile dashboard) */
export function FireSection(props: FireHeroCardProps) {
  return (
    <section className="space-y-3">
      <SectionHeader title="FIRE까지 남은 거리" subtitle="현재 입력 기준 시뮬레이션" />
      <FireHeroCard {...props} />
    </section>
  )
}
