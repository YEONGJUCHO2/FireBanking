import { cn } from '@/lib/cn'
import { StatusPill } from './status-pill'
import Image from 'next/image'

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
      <Image
        src="/fire-banking/login-mountain.png"
        alt=""
        fill
        sizes="(max-width: 430px) 100vw, 420px"
        className={cn(
          'object-cover brightness-[0.62] contrast-[1.08] saturate-[1.35]',
          state === 'caution' && 'opacity-75 sepia',
          state === 'unavailable' && 'grayscale opacity-70',
        )}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,61,51,0.88)_0%,rgba(18,61,51,0.56)_46%,rgba(18,61,51,0.18)_100%)]" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold opacity-90">예상 FIRE 도달 시점</p>
          <h1 className={cn('mt-3 font-bold tracking-normal', compact ? 'text-3xl' : 'text-5xl')}>{dateLabel}</h1>
          {distanceLabel ? <p className="mt-2 text-sm font-semibold opacity-85">({distanceLabel})</p> : null}
        </div>
        <StatusPill label={label} status={status} className="bg-white/88" />
      </div>
    </section>
  )
}
