import { cn } from '@/lib/cn'
import { StatusPill } from './status-pill'

type HeroState = 'positive' | 'caution' | 'unavailable'

const stateClass: Record<HeroState, string> = {
  positive: 'bg-[linear-gradient(135deg,#123d33_0%,#1e5b4a_55%,#315f4d_100%)] text-white',
  caution: 'bg-[linear-gradient(135deg,#d2b06c_0%,#e7dcc3_58%,#f5efe2_100%)] text-fb-ink',
  unavailable: 'bg-[linear-gradient(135deg,#adb3b4_0%,#d7d8d4_58%,#efeee9_100%)] text-fb-ink',
}

export function FireHeroCard({ dateLabel, distanceLabel, state = 'positive', compact = false, className }: { dateLabel: string; distanceLabel?: string; state?: HeroState; compact?: boolean; className?: string }) {
  const label = state === 'positive' ? '정상' : state === 'caution' ? '점검 필요' : '계산 불가'
  const status = state === 'positive' ? 'positive' : state === 'caution' ? 'caution' : 'unavailable'

  return (
    <section className={cn('relative overflow-hidden rounded-card p-6 shadow-soft', stateClass[state], compact ? 'min-h-[168px]' : 'min-h-[224px]', className)}>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold opacity-90">예상 FIRE 도달 시점</p>
          <h1 className={cn('mt-3 font-bold tracking-normal', compact ? 'text-3xl' : 'text-5xl')}>{dateLabel}</h1>
          {distanceLabel ? <p className="mt-2 text-sm font-semibold opacity-85">({distanceLabel})</p> : null}
        </div>
        <StatusPill label={label} status={status} className="bg-white/88" />
      </div>

      <div className="fb-hero-visual">
        <div className="fb-river" />
        <div className="fb-sun" />
      </div>
    </section>
  )
}
