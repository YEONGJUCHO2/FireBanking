import { MobileAppShell } from '@/components/fire-banking'
import { Icon } from '@/components/fire-banking/icons'
import { saveFixedCostSimulation } from '@/src/features/subscribe/actions/saveFixedCostSimulation'
import { FixedCostSimulator } from '@/src/features/subscribe/components/FixedCostSimulator'
import { defaultFixedCostConfig } from '@/src/features/subscribe/lib/fixedCostDefaults'

export default function SubscribePage() {
  return (
    <MobileAppShell>
      <header className="flex items-center justify-between border-b border-fb-line bg-white/85 px-4 py-3 backdrop-blur">
        <a
          href="/dashboard"
          aria-label="홈으로"
          className="fbpress flex h-11 min-w-16 items-center justify-center gap-0.5 rounded-[12px] px-1.5 pr-2.5 text-[13px] font-bold text-fb-ink hover:bg-fb-card-alt"
        >
          <Icon name="chevron-left" className="size-5" />
          홈
        </a>
        <div className="text-[14px] font-semibold text-fb-ink">고정비 시뮬레이터</div>
        <button
          type="button"
          aria-label="공유"
          className="fbpress flex size-11 items-center justify-center rounded-full text-fb-ink hover:bg-fb-card-alt"
        >
          <Icon name="share" className="size-5" />
        </button>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-8 pt-5">
        <FixedCostSimulator initialConfig={defaultFixedCostConfig} saveAction={saveFixedCostSimulation} />
      </main>
    </MobileAppShell>
  )
}
