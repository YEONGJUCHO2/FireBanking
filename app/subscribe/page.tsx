import { MobileAppShell } from '@/components/fire-banking'
import { Icon } from '@/components/fire-banking/icons'
import { applyFireLivingExpenseRecommendation } from '@/src/features/subscribe/actions/applyFireLivingExpenseRecommendation'
import { saveFixedCostSimulation } from '@/src/features/subscribe/actions/saveFixedCostSimulation'
import { getSavedFixedCostSimulationConfig } from '@/src/features/subscribe/actions/saveFixedCostSimulation'
import { FixedCostSimulator } from '@/src/features/subscribe/components/FixedCostSimulator'
import { defaultFixedCostConfig } from '@/src/features/subscribe/lib/fixedCostDefaults'

type SubscribePageProps = {
  searchParams?: Promise<{
    returnTo?: string
  }>
}

function getSafeReturnTo(returnTo?: string) {
  return returnTo === '/onboarding' ? '/onboarding' : '/dashboard'
}

export default async function SubscribePage({ searchParams }: SubscribePageProps = {}) {
  const params = await searchParams
  const savedConfig = await getSavedFixedCostSimulationConfig()
  const backHref = getSafeReturnTo(params?.returnTo)
  const backLabel = backHref === '/onboarding' ? '온보딩' : '홈'
  const backAriaLabel = backHref === '/onboarding' ? '온보딩으로' : '홈으로'

  return (
    <div data-screen-label="subscribe">
      <MobileAppShell>
        <header className="flex items-center justify-between border-b border-fb-line bg-white/85 px-4 pb-3.5 pt-14 backdrop-blur">
          <a
            href={backHref}
            aria-label={backAriaLabel}
            className="fbpress flex h-11 min-w-16 items-center justify-center gap-0.5 rounded-[12px] px-1.5 pr-2.5 text-[13px] font-bold text-fb-ink hover:bg-fb-card-alt"
          >
            <Icon name="chevron-left" className="size-5" />
            {backLabel}
          </a>
          <div className="text-[14px] font-semibold text-fb-ink">FIRE 생활비 조정기</div>
          <div className="w-16" />
        </header>

        <main className="flex-1 overflow-auto px-4 pb-[200px] pt-5">
          <FixedCostSimulator
            initialConfig={savedConfig ?? defaultFixedCostConfig}
            saveAction={saveFixedCostSimulation}
            applyAction={applyFireLivingExpenseRecommendation}
          />
        </main>
      </MobileAppShell>
    </div>
  )
}
